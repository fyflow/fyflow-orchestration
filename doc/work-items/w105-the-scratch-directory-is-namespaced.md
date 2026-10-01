# W105 — The scratch directory is namespaced

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

1. **[Q426](../open-questions.md), measured 2026-09-30**: `scripts/check-markdown-selftest.mjs:730`
   builds `dev-dist/markdown-selftest-${process.pid}` and nothing removes it. **12 574 empty
   directories** had accumulated — 12 691 top-level entries where the useful count is 121, at roughly
   **117 per gate run**. Deleting them took **257 s**. Nothing reports it: the directories are empty,
   `dev-dist/` is gitignored so `git status` is silent, and every self-test passes.
2. **[Q182](../open-questions.md)**: `check:wiring:selftest` stages every `scripts/check-*.mjs`
   **flat into `dev-dist/`** — the directory every other self-test uses for scratch — which is why it
   and `check:scheduler:selftest` carry `SELFTEST-EXCLUSIVE` markers and run alone.
3. **W103's finding 3**: a gate killed mid-run left `dev-dist/check-wiring-stub-27708.mjs` behind,
   it glob-matched `check-*.mjs`, and the next `check:wiring:selftest` **control** went red —
   *every verdict below would be a fact about the harness rather than about the check*. The real probe
   failure underneath it was invisible until the stub was removed. [Q323](../open-questions.md)'s class.

**One change pays three ways**, and a fourth is the prize: per-probe scratch is what would let a lane
run its probes concurrently, which dwarfs anything W104 can win inside a single check.

## What to be careful of

1. **[Q181](../open-questions.md) says the marker is bound to nothing** — removing it alone was
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

## Record

*Filled in when the item is complete.*
