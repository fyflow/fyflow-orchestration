# W57 — The scheduler is a dependency

**Status:** todo
**Plan:** [P16](../plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md)

```
Spec:       spec/runtime-targets.md section 4 (what the source may depend on)
            and ADR 0013 rule 1, which this item SUPERSEDES as ADR 0048
Owns:       package.json, deno.json, tsconfig.docs.json, src/driver/**,
            test/driver/**, scripts/check-source.mjs,
            scripts/check-source-selftest.mjs, scripts/check-scheduler.mjs,
            scripts/check-scheduler-selftest.mjs, spec/runtime-targets.md,
            spec/README.md, AGENTS.md sections 1 and 12,
            doc/decisions/0048-*.md
Inputs:     P16 facts 1, 3, 4 and 5, read from the PLAN's own file and RE-RUN
            from dev-dist/p16/facts.mjs rather than transcribed. ADR 0013's
            context facts 1 and 2 with their expiry notes; ADR 0029 rules 1-2
            and its D1-D3; Q71's row; the check-source.mjs header comment on
            S7, S8 and S9.
Outputs:    (1) ADR 0048 - the scheduler is a declared dependency; ADR 0013
                rule 1 superseded on the ground that its forcing fact expired
            (2) `peerDependencies: { "fyflow-scheduler": <range> }` in
                package.json, the range being the maintainer's call (P16
                stop-and-ask 1), bound to `PIN` by a check-scheduler clause so
                the peer range and the devDependency pin cannot drift apart
            (3) `import type { FyflowScheduler }` in src/driver/driver.ts and
                Q71 RESOLVED: `SchedulerLike` accepts a real FyflowScheduler
                under the DOM lib, and AGENTS.md section 12's cast paragraph is
                DELETED rather than apologised for
            (4) a default `createTask` of `new FyflowTask(config)` when the
                option is omitted, and the option kept for the L2-L5 fakes
            (5) S7, S8 and S9 NARROWED to what still holds - no working-tree
                reach, no path in deno.json's import map - or RETIRED if D1-D3
                already cover it (prediction 4), with every probe and META
                entry that named them repointed
            (6) tsconfig.docs.json gains "DOM", so every AGENTS.md snippet is
                typechecked under the configuration fact 3 fails in today
Depends on: nothing
Blocks:     W58, W59
Tests:      expected values from ADR 0048 and spec/runtime-targets.md, never
            from output. The negative controls: with S7 narrowed, a probe that
            writes a `file:` specifier must still trip it (or D1); with the
            peer range removed, the new check-scheduler clause must fail; with
            the `import type` reverted, fact 3's DOM tsconfig must report
            TS2322 again.
Gate:       L0-L6 in five runtimes, check:source:selftest,
            check:scheduler:selftest, check:docs, then spec-conformity pass
            (two readers)
Reserves:   Q252-Q255, ADR 0048
```

## Scope

**In**

1. **ADR 0048, superseding ADR 0013 rule 1.** The decision record on the shape of ADR 0029 and the
   S9 note: the forcing fact — *the pinned version is on no registry* — expired on 2026-08-31, the
   second fact — *Node cannot load the source* — expired at 0.5.2, and rule 1 is the last clause of
   that ADR resting on nothing it was decided on. **What survives is stated in the same document**:
   `SchedulerLike` stays as the L2-L5 test seam, because that is a testing decision the manifest never
   touched; `createTask` stays as an option, because W3's tests supply a plain object through it.
2. **Q71 closed by construction.** `import type { FyflowScheduler }` and either a widened
   `SchedulerLike` or a type that the real class satisfies under `lib: ["DOM"]`. Fact 3 is the test:
   `dev-dist/p16/facts.mjs` reports `TS2322 x1` under `ES2022+DOM` today and must report `x0` after.
3. **The manifest says what the driver is sensitive to.** AGENTS.md section 1 says *install whichever
   version you like* and section 12 says *pin at 0.5.2*; the second is true and the first is not. A
   `peerDependencies` range is where a consumer's installer reads that. **The range is the
   maintainer's call**, priced both ways in the ADR: exact is unusual and honest, caret is
   conventional and false the day upstream changes an event shape again with no changelog.
4. **The three source checks re-derived from what the decision keeps.** `S7` refuses any scheduler
   import in a published file; `S8` refuses a manifest entry and a `deno.json` import; `S9` refuses
   the import in the browser bundle's input set. Each is re-read against ADR 0048: the browser
   half is moot because the scheduler ships a `browser` export condition (fact 5); the
   working-tree half is ADR 0029's and is already refused by `D1`-`D3`. **Prediction 4 says `S7`
   survives narrowed rather than deleted; W57 measures whether `D1`-`D3` already cover it and takes
   the retirement if they do**, which is the stop-and-ask.
5. **The one configuration the reference is not checked under.** `tsconfig.docs.json` sets
   `lib: ["ES2022"]` explicitly and section 12 says *the failing configuration is the common one*.
   Adding `DOM` makes every snippet compile under the consumer's default, and is what turns output
   (3) from a claim into a gate.

**Out** — named rather than left implicit, with where each goes instead

- **Anything a node declares.** `retryPolicy`, `workerGroups`, `settings`, `type` — W58's and W59's.
  This item widens what `createTask` may be handed by nothing; it only gives the option a default.
- **Deno's half of the dependency declaration.** JSR has no `peerDependencies`; a JSR package's
  dependency is an `imports` entry in `deno.json`, which `S8` refuses today under ADR 0013 rule 3 and
  which ADR 0029 rule 2 put in `examples/deno-import-map.json` instead. **Whether the published JSR
  package declares the scheduler at all, and how, is decided in ADR 0048 and is the second
  stop-and-ask** — if it needs the import map to move, that is ADR 0050's shape and may issue W60.
- **The scheduler pin itself** — 0.5.2, Q3, unchanged. A version bump is its own item on W36's and
  W37's precedent.
- **`RT-R5`, no DOM API in published source.** Adding `DOM` to the *docs* tsconfig typechecks the
  snippets under it; the published source keeps `tsconfig.node.json` as the mechanism `RT-R5` names.

## Verification

How each clause of `Gate:` is actually run. Name the commands.

| clause | command |
|---|---|
| L0 | `npm run lint > dev-dist/p16/w57-lint.log 2>&1; echo $?` and the same for `npm run typecheck`. **A rung is RUN, never PIPED** — `doc/workflow.md` section 4, v0.16: redirect it and read `$?`; a tail line is never the predicate |
| L1-L5 | `npm test`, `npm run test:deno`, `npm run test:browser:all`, each redirected and read by exit code. The baseline is **27 files / 703 cases in five runtimes** at `8550978` |
| L6 | `npm run test:l6` and `npm run test:l6:deno`. The baseline is **1061 assertions over 42 real runs**; this item adds no row and must leave both numbers unmoved |
| checks | `npm run check:source:selftest` and `npm run check:scheduler:selftest` — every narrowed or added clause with a probe declaring the exact set it trips (rule 7 (c)), and a `META` entry per clause; `npm run check:docs` under the widened `tsconfig.docs.json` |
| fact 3 | `node dev-dist/p16/facts.mjs` before and after — `TS2322 x1` to `x0` under `ES2022+DOM`, `x0` to `x0` under `ES2022` |
| conformity reader | spec first, code second, re-deriving ADR 0048's stated facts before reading them — especially the two expiry claims, each of which cites a commit |
| adequacy reader | **in an isolated copy**, and the AUTHOR's tree holds still while it reads (section 6, v0.15); rule 8's set is not run during the review |

**Routing coverage.** This item touches no routing. A branch routed away from its join
([Q4](../open-questions.md)), `user_action` ([Q17](../open-questions.md)), no matching decision edge
([Q10](../open-questions.md)), a duplicate task id ([Q13](../open-questions.md)) and a nested fan-out
([Q6](../open-questions.md)) are all **not applicable**: the default `createTask` builds the same
object the L6 harness has built by hand since W5, and reverting to the hand-built one is the control.

**Rule 8 obligation (e) has a named target here.** The default factory is a value that ships and a
test double is what L1-L5 run; *was what it RAN what SHIPS* is answered by L6 running with the option
**omitted** in at least one row, so the default is the thing a real scheduler exercised.

**Before this item is done it greps the tree for `W57`** outside `doc/` — section 1 rule 5's third
direction. At this declaration that returns **1** hit, in `CLAUDE.md`.

## Record

*Filled in when the item is done. Delete the italic lines.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L0-L6 | | |
| checks | | |
| conformity reader | | what it found |
| adequacy reader | | mutations run, survivors |
| re-run at `<sha>` | | |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| ADR 0048 | | |
| the peer range, bound to `PIN` | | |
| `import type` and Q71 resolved | | |
| the default `createTask` | | |
| `S7`/`S8`/`S9` narrowed or retired | | |
| `tsconfig.docs.json` under DOM | | |

**What broke.**

**What this taught.**

**Questions raised.**
