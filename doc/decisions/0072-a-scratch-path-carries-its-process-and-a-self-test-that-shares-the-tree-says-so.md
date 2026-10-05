---
id: ADR 0072
title: "A scratch path carries its process, and a self-test that shares the tree says so"
status: accepted
date: "2026-10-01"
item: W105
raised-by: ""
supersedes: ADR 0039 rule 3 in part
amends: ""
resolves: Q426
---

# ADR 0072 — A scratch path carries its process, and a self-test that shares the tree says so

**Supersedes:** part of [ADR 0039](0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md)
— rule 3's exclusive SET, not its mechanism

## Context

[ADR 0039](0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md) made the
`:selftest` entries run concurrently and ran alone any whose file declares that it cannot share the
tree. Two declared it. One of the two declared it for a reason that has **nothing to do with the
tree being shared** and everything to do with `dev-dist/` being one flat namespace with fixed paths.

1. **`check:scheduler:selftest`** deletes `node_modules/fyflow-scheduler` and restores it from a
   stash. That is process-wide whatever any scratch path is called.
2. **`check:wiring:selftest`** stages every `scripts/check-*.mjs` flat into `dev-dist/` and runs those
   copies with their dispatch falsified, so a staged `check-docs.mjs` reached the real `check-docs`
   body and deleted the FIXED `dev-dist/docs`, and a staged `check-spec.mjs` launched the whole
   `check-spec` self-test, which deleted the FIXED `dev-dist/spec-selftest`.

[Q182](../open-questions.md) recorded the residue and said what would close it — *a derived scratch
path per check plus per process, and a clause that every write under `dev-dist/` goes through it* —
and that **relocating where `check-wiring-selftest` stages would not fix it, because the copies it
runs are the real checks and they write the real paths.** [Q181](../open-questions.md) recorded the
other half: **the marker is bound to nothing.** A self-test that writes a fixed path and omits it runs
concurrently and produces *a finding that is a fact about a neighbouring process*.

Three further facts, all measured at W105:

3. **The accumulation was real and its victim was the exclusive lane.**
   `check-markdown-selftest.mjs` created one directory per PROCESS and removed it only when it had
   built its own fixture, so **112 leaked per `npm run selftests` run**; 12 574 had accumulated by
   P25's retro, which could not complete its own confirming gate.
4. **A leftover file in that directory turned a CONTROL red and the number went into a shipped ADR.**
   W103's finding 3: a gate killed mid-run left `dev-dist/check-wiring-stub-27708.mjs`, it
   glob-matched `check-*.mjs`, `G3` saw a check the manifest never declares, and
   `check-wiring-selftest.mjs` returned at its control. ADR 0070's per-lane table records that lane at
   **3.0 s**; re-measured here it is **228.2 s**.
5. **The exclusive prefix is 29% of the self-test wall, not 2%.** Re-measured over all eight lanes:
   851.3 s wall, of which 243.1 s is the two exclusive entries run serially, and 228.2 s of that is
   `check:wiring:selftest`.

## Decision

1. **Every scratch path a `scripts/check-*.mjs` writes under `dev-dist/` carries `process.pid`**, and
   is removed on the way out through a `process.on('exit')` handler, which covers a return, a
   `process.exit` and a THROW.
2. **The honest target for a kill is ONE path PER PROCESS, not one per probe — and a killed LANE is
   more than one process.** `SIGKILL` runs no handler and nothing can change that; nesting is what bounds
   the damage. A signal handler was considered and refused: on Windows it would make Ctrl-C during a
   ten-minute lane worse.

   **Measured by this item's adequacy reader, and the item's own `Outputs` line was looser than this**:
   `SIGKILL` of `check:policies:selftest` leaves **two** directories — its own and its nested-self child's
   — and of `check:docs:selftest` likewise, its own and the in-flight `check-docs` child's. **And SIGTERM
   leaks too**, which the first draft of this decision did not say: a `spawnSync(…, { timeout })` anywhere
   in the repository produces exactly that, and `check-docs-selftest.mjs` documents a reachable state where
   it happens. So: *one path per PROCESS that dies without running its handler*, which for a killed lane is
   as many as were in flight.
3. **Two kinds of path, and the difference is WHERE THE FILE IS EXECUTED FROM — not what it is.**
   A mutant carries the pid in its NAME, flat, **iff it is executed from where it is written**; anything
   else nests inside the per-process directory.

   *The first draft of this rule said *what the file IS* — a copy of a CHECK is depth-bound because it
   derives `ROOT = resolve(dirname(self), '..')`, a copy of a SELFTEST module is not because the dispatch
   hands it `ROOT`. **That is the right mechanism and the wrong rule, and this item's conformity reader
   measured where it breaks**: `check-markdown-selftest.mjs` writes TWO mutants of CHECKS
   (`.meta-NN.mjs` of `check-markdown.mjs`, `.meta-spec-NN.mjs` of `check-spec.mjs`) **two directories
   deep**, and both are correct — because that child READS the mutant and writes its text into its own
   fixture at `tree/scripts/`, where the root is the fixture. An author following the rule as first
   worded would move both of them flat, for nothing.* Five `.meta-*` sites ARE spawned directly
   (`spawnSync(process.execPath, [script])`) and those are the flat ones; `stage()`'s copies are executed
   where they are written and stay flat for the same reason.
4. **The convention is bound by `G6` in `check-wiring.mjs`**, which refuses a statement naming
   `dev-dist` that does not carry `process.pid`, compares its exception list BOTH WAYS so a spent
   permission fails, and refuses two files building the same name. This is Q181's own proposed grep, with
   its exceptions declared instead of left to a heuristic.

   **It is a TEXTUAL clause and its limit is named rather than implied** — this item's adequacy reader got
   the exact path it refuses past the first version in FIVE ordinary spellings, so the subject is now every
   occurrence of the text `dev-dist` in every `scripts/*.mjs` that is not dot-prefixed, with the enclosing
   STATEMENT as the window the pid must appear in. **What remains invisible is the needle SPLIT across a
   concatenation** (`'dev-' + 'dist'`), and deliberately: this clause and its self-test both use that trick
   on purpose, because a literal quoting the pattern it searches for is a false match for itself
   ([Q178](../open-questions.md)), and a check cannot both use it and refuse it.
5. **`check:wiring:selftest`'s exclusivity marker is RETIRED. `check:scheduler:selftest`'s STAYS.**
   Both were measured in the arrangement each marker exists for; **only the retired one has a control**,
   and this item's conformity reader is why that is stated rather than implied — the scheduler row is one
   arrangement with no control and no repetition, which is safe in the direction it points (that marker is
   KEPT) and is not what *"both with a control"* would mean:

   | candidate, run concurrently against its recorded victims | victims green | verdict |
   |---|---|---|
   | `check:wiring:selftest`, fixed paths (the CONTROL) | **19 of 96** — every red `ENOENT … dev-dist/docs/tsconfig.dom.json` | the marker was load-bearing |
   | `check:wiring:selftest`, per-process paths | **61 of 61** | nothing collides; retired |
   | `check:scheduler:selftest`, per-process paths | **4 of 5**, and **4 of 7** on a re-take | `node_modules` is process-wide; KEPT. No control row, and the two readings are the whole sample |

   *The two markers had different answers, which is what the item predicted and what measuring each
   one separately is for.*

## Consequences

1. **ADR 0039's mechanism is untouched and its SET is one entry smaller.** `run-selftests.mjs` still
   reads the marker, `G4` still derives the same set independently and compares both ways, and both
   sides moved together — so retiring a marker is one line in one file and two checks agree about it.
2. **`check:scheduler:selftest`'s marker is now the only one, and it is a correctness guard rather
   than a convention**: measured, its absence is a **one-in-five** flake in a neighbouring lane, which
   is exactly the failure mode Q181 describes and the hardest kind to diagnose.
3. **NO WALL CLAIM IS MADE, and the reason is the measurement rather than modesty.** Three end-to-end
   `npm run selftests` runs on this machine, 20 cores:

   | | wall | serial-equivalent | lanes |
   |---|---|---|---|
   | marker KEPT | 851.3 s | 2000.1 s | 6 concurrent + 2 alone |
   | marker RETIRED | 1069.7 s | 3925.2 s | 7 concurrent + 1 alone |
   | marker RETIRED | **789.7 s** | 2750.8 s | 7 concurrent + 1 alone |

   **The two retired readings straddle the kept one**, so 851.3 s cannot be distinguished from either —
   the retired spread is 280 s wide where the kept-to-best difference is 62 s, which is
   [Q179](../open-questions.md)'s band with a number on it. *The arithmetic that predicted a 228 s saving
   assumed a lane's wall clock is independent of how many lanes run beside it, and the
   serial-equivalent — 2000 s against 2751 and 3925 — says it is not.* **This decision therefore rests
   on CORRECTNESS and makes no speed claim**, which is also why the item did not reorder anything on the
   strength of it.

4. **The lane is not the unit of parallelism, and the exclusive prefix was accidentally a load
   governor.** `run-selftests.mjs` sizes its pool as `min(rest.length, availableParallelism)` — LANES —
   while each lane spawns a deep tree: `check:wiring:selftest` some 2 264 children, and
   `check:docs:selftest` 51 probes each running `check-docs`, which since
   [W104](../work-items/w104-the-snippet-loop-runs-concurrently.md) runs its snippets through a pool
   eight wide. So seven lanes commit the machine many times over, and running two entries serially
   first was holding some of that back without anybody choosing it. **CI has FOUR cores**, where
   `availableParallelism` caps the pool at four and the arithmetic differs in kind rather than in degree.
   ADR 0070 already makes `gate:full` CI's to measure and this does not change that; the correctness
   measurement above is not a function of core count. Raised as a question rather than fixed here.
5. **What is NOT fixed.** `stage()` still writes flat into `dev-dist/`, so a run killed between a
   `stage()` and its `unstage` leaves up to **19** `scripts/*.mjs` there — 19 and not 22, and 16 of the 19 match the `check-*.mjs` the control looks for, so three are outside its reach (this item's conformity reader). The control now NAMES them instead
   of reporting a dispatch failure, which is the W103 finding 3 half; the leftover itself is the
   residue decision 2 accepts.
6. **`Q426` is closed and `Q182`/`Q181` are narrowed rather than closed.** The leak is gone — the
   markdown lane leaked 112 directories before and 0 after. What remains of Q182 is `stage()`'s three
   declared sites, and what remains of Q181 is that `G6` binds the PATH and not the marker: a
   self-test that mutates something outside `dev-dist/` altogether, as the scheduler one does, still
   declares that in prose and nothing checks it.
