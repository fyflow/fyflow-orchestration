# W103 — The local gate is the ladder

**Status:** done — 2026-09-30; see the Record. An item outside any plan.

```
Spec: NONE — no rule moves. `doc/workflow.md` section 8's budget table gains the row ADR 0070 fills.
Owns: package.json, scripts/check-source.mjs, scripts/check-source-selftest.mjs,
      scripts/check-wiring.mjs, scripts/check-wiring-selftest.mjs,
      .github/workflows/gate.yml, doc/decisions/0070-*.md, doc/decisions/README.md,
      doc/work-items/w103-the-local-gate-is-the-ladder.md
Inputs: ADR 0039 (the chain climbs the ladder; the self-tests run concurrently, last);
        P11's retro, which refused this change for a reason that has now expired;
        Q133 (the cost nobody decided); Q180 (~2531 process starts)
Outputs: (1) `gate` is fifteen entries and `gate:full` composes the self-tests onto it
         (2) reachability reads `gate:full`, in S11 and in check-wiring's CHAIN
         (3) CI runs `gate:full`; the local loop is the ladder
         (4) the two probes whose subject moved are re-pointed, with the reason recorded
Depends on: the CI workflow (`da7e6c7`), because rule 4 of ADR 0070 rests on it
Blocks: nothing
Tests: the four clauses that bind the chain — S11, S12, S13, G3, G4, G5 — plus both
       self-tests' full probe sets
Gate: check:source, check:wiring, check:source:selftest, check:wiring:selftest, npm run gate
Reserves: Q427
```

An item outside any plan, asked for by the maintainer: *"we need to fix the tests, it's unacceptable it
takes this long."* The complaint is right and the measurement says where it is right.

## What it is

**`npm run gate` is the ladder; `npm run gate:full` is the ladder plus the self-tests, and CI runs that.**
*(This said **on every commit**, which was true of the tree this item shipped and stopped being true on
2026-10-02, when the maintainer asked for the workflow to be a MANUAL trigger — `workflow_dispatch`
alone. A declared exception on this file, taken by the change that made the sentence false rather than
left for whoever reads it next, which is `doc/workflow.md` section 1 rule 5's third direction.)* [ADR 0070](../decisions/0070-the-local-gate-is-the-ladder-and-proving-the-checks-can-fail-belongs-to-ci.md)
is the decision and carries the argument. Nothing is deleted, no probe is dropped and no bound is
lowered — the same thing ADR 0039 could say when it reordered the chain.

## What it measured

| | |
|---|---|
| `npm run gate`, ladder only | **245 s, EXIT 0** |
| `npm run selftests` | **1326 s wall, 2106 s serial-equivalent, 6 lanes** |
| the self-tests' share of the 1571 s a human used to wait | **84%** |
| `check:docs:selftest` alone | **1298.9 s — 98% of the self-test wall** |
| the same `gate:full` on GitHub's four-core runner | **33m1s, green** |

The per-lane split is in ADR 0070 context 2. **One lane is almost the whole cost**, which is what a
concurrency win hides: ADR 0039 bought the win without anybody asking which lane was longest.

## What broke

1. **`S11` is the FOURTH clause that binds the chain and this item found three by reading.** `S12`,
   `S13` and `G4` were edited first; `S11` then fired on **all eight** `:selftest` entries at once,
   because its reachability predicate treats a `:selftest` as reached when *the chain* runs the runner,
   and `gate` no longer does. *A check outside the gate is a check that does not exist* is the sentence
   `S11` was written for, and it caught its own author. Widened to read `gate:full`, with its heading,
   its failure text and a new clause for a MISSING `gate:full` — because the empty list rule 3 prescribes
   would otherwise report every check unreachable with no explanation.

2. **Two probes went QUIET rather than red, and rule 7 (c) is the only reason that was visible.**
   `check-source-selftest`'s *the selftests runner dropped from the chain* mutates
   `' && npm run selftests"' → '"'`; post-split that string lives in `gate:full`, so the probe now strips
   the composed entry and answers `[S11, S13]` where it declared `[S11, S12]`. Its meaning is intact —
   one edit still unreaches every self-test — and only the clause that owns the list moved, so the
   declared set moved with it and the mutation is UNCHANGED. `check-wiring-selftest`'s
   `pkg-norunner.json` fixture did the same replace on `scripts.gate` and therefore matched **nothing**,
   producing a fixture byte-equal to the real manifest and `exited 0, wanted [G3,G4], got []`. *A probe
   whose subject moves does not fail loudly; it goes quiet, and the declared SET is what turns silence
   into a red line.* Both re-pointed; **35/35 and 65/65 probes caught** afterwards.

3. **And the wiring self-test's CONTROL was red for a reason this session caused.** It runs the
   unmutated check with `CHECK_WIRING_SCRIPTS: 'dev-dist'`, and `dev-dist/` held
   `check-wiring-stub-27708.mjs` — a staged stub left behind when a gate was killed mid-run earlier
   today, PID 27708 among the processes that kill named. It glob-matches `check-*.mjs`, so `G3` saw a
   check the manifest never declares. [Q323](../open-questions.md)'s class: `unstage()` does not run
   when the harness is killed, and the leftover is in the one directory the next control points at.
   Removed; the control then ran clean and the real probe failure above surfaced underneath it.

## Verification

| rung | verdict |
|---|---|
| `check:source` (S11, S12, S13) | **EXIT 0** — red first at 8 failures, which is finding 1 |
| `check:wiring` (G3, G4, G5) | **EXIT 0** |
| `check:source:selftest` | **EXIT 0 — 65/65 probes caught** |
| `check:wiring:selftest` | **EXIT 0 — 35/35 probes caught** |
| `npm run gate` (the new ladder) | **EXIT 0, 245 s** |

**Not claimed:** a clean before-and-after wall clock. This machine's process spawns ranged from
**27 ms to 8 649 ms for `cmd /c exit`** inside one session, and one ladder-only run took **7534 s** in a
bad window against **245 s** in a good one. Every number above was taken with `node -e ''` at 100 ms
against [Q180](../open-questions.md)'s recorded 54 ms baseline, so the absolutes are roughly 2x
inflated and **the RATIO is what this item claims**. [Q179](../open-questions.md)'s rule, at its limit.

## Record

**DONE 2026-09-30.** ADR 0070 taken. Q133's cost half answered; [Q180](../open-questions.md) extended
with the per-lane split and is now the largest remaining item; [Q427](../open-questions.md) raised —
section 8's *< 90 s* budget for L0-L6 was measured at 18.6 s and this item's ladder is 245 s on a
machine it cannot separate from the suite's own growth, so the budget needs re-taking somewhere
healthy before anyone calls it breached or met.
