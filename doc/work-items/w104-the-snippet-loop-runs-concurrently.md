# W104 — The snippet loop runs concurrently

```
Spec: NONE expected — no rule moves. `doc/workflow.md` section 8's budget prose carries
      the number if it changes.
Owns: scripts/check-docs.mjs, scripts/check-docs-selftest.mjs,
      doc/work-items/w104-the-snippet-loop-runs-concurrently.md
Inputs: W103's measurements (below) — RE-TAKE them, never transcribe (P15 decision 5);
        Q180 (~2531 process starts); Q425 (the 30 s per-snippet cap);
        ADR 0070 (the self-tests are CI's, so this lane's cost is CI's wall clock)
Outputs: (1) `check-docs.mjs` executes its `run` snippets CONCURRENTLY at a declared width
         (2) a snippet's crash, its `process.exit`, its timeout and its THROW are each still
             told apart — `X4`'s verdicts are unchanged in meaning and in message
         (3) the before/after measured as a RATIO on one tree, with the spawn health stated
         (4) `check:docs:selftest`'s 50 probes and 28 gradings all still fire
Depends on: W103 (ADR 0070)
Blocks: W105, which edits `check-docs-selftest.mjs` as well — these two are SERIAL
Tests: `check:docs` and `check:docs:selftest` in full; the gate's ladder
Gate: check:docs, check:docs:selftest, npm run gate
Reserves: W104, Q428-Q432, ADR 0071 (expected SKIPPED — making a loop concurrent is
          implementation, and ADR 0039 and 0070 already own the gate's structure)
```

## Why

`check:docs:selftest` is **1298.9 s of the 1324 s** self-test wall — six lanes running at once,
hiding behind their slowest. It is the only lane worth touching: halving the other seven moves the
total by single digits.

## What W104 measured before being declared

Taken 2026-09-30 and **2026-10-01 on a healthy machine** (`node -e ''` at 54 ms, Q180's own
baseline), and every one is to be RE-TAKEN rather than inherited:

| | |
|---|---|
| `check:docs` | **15 s for 38 snippets, 32 run** → **469 ms each** |
| of which process startup | **81 ms — 17%.** The other 83% is snippets doing real work |
| 38 noop `.ts`, sequential processes | **3112 ms** (today's shape: `spawnSync` in a loop) |
| the same at pool width 4 / 8 / 16 | **1014 / 651 / 586 ms** → **5.3× at width 16** |
| the same with `worker_threads` | 1725 / 814 / 429 / **334 ms** → a further **1.75×** |
| `check:docs-selftest` | **50 probes**, `MIN_META` 28, ~2 check-docs runs per META entry |

**The site is one expression**: `scripts/check-docs.mjs:237`,
`spawnSync(process.execPath, [join(OUT, w.name)], { cwd: ROOT, encoding: 'utf8', timeout: 30_000 })`.

## The decision this item does NOT take

**Processes, not `worker_threads`, and the reason is one variable rather than safety.** Workers were
measured safe on all four properties that could have refused them: TypeScript loads in a worker,
`process.exit()` is contained to the thread, `terminate()` kills a spinning snippet on a deadline, and
a worker that spawns its own `FyflowScheduler` pool has that pool reaped with it. They are worth a
further 1.75× and they are **W106's**, after this.

The async restructure is the risky part — it is what breaks anchors and what could turn a crash into a
pass. Doing it with processes changes exactly ONE thing, sequential to concurrent, so any behaviour
change is attributable to concurrency alone. Doing both at once changes two. *That is this
repository's own compound-probe discipline turned on its own tooling.*

## What to be careful of

1. **A crash must not read as a detection.** `X4` today distinguishes a snippet that throws (a
   detection) from one that is killed (`exit null`, [Q425](../open-questions.md)) from one that
   crashes. Concurrency puts several children in flight, so the mapping from child to snippet must
   stay exact — and rule 8's requirement on the SET is that a probe fires FOR THE REASON IT NAMES.
2. **The 30 s cap is per snippet and load-sensitive.** Running 8–16 at once makes each slower in wall
   terms. [Q425](../open-questions.md) is the row: under load a sub-second snippet was killed at
   30 s and reported as *the snippet does not run*. Pick the width against that, and consider whether
   the cap should scale with the width — the cheapest fix Q425 names is the MESSAGE, one branch.
3. **Output interleaving.** `check-docs` reports per snippet with a line number; concurrent children
   must not interleave into an unreadable report, and `X4`'s detail lines are what the self-test's
   gradings match on.
4. **Determinism.** Snippets that bind a port, write a fixed path under `dev-dist/`, or share a
   scheduler will collide when run at once. This is [Q182](../open-questions.md)'s class and
   **W105 is the item for it** — if a collision appears here, record it and narrow the width rather
   than fixing the namespace in this item.
5. **~50 probes are anchored on this file's text.** Rule 7 (b) aborts are expected, not a surprise;
   re-anchor them agnostically rather than re-pinning to a new line.

## Record

*Filled in when the item is complete.*
