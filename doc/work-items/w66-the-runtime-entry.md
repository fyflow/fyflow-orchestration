# W66 — The runtime entry: `fyflow-orchestration/runtime`

**Status:** todo
**Plan:** [P18](../plans/p18-a-flow-and-its-runtime-from-documents-alone.md)

```
Spec:       spec/flow-definition.md §3's registry section (W65's) for what a document
            may say; spec/runtime-targets.md §4 for the sub-path's reach (the root
            loads no validator, a third RT-R rule in RT-R11/RT-R12's shape); the
            construction-time refusals as a table in AGENTS.md §12, each a named
            error, on ADR 0049 rule 5's precedent (a helper's refusal is not an FD-V)
Owns:       src/scheduler/**, src/runtime/** (new), package.json, deno.json,
            test/scheduler/**, test/runtime/** (new), AGENTS.md §12-§14 (the runtime
            rewrite; W65 migrates the grammar in every section first),
            doc/decisions/0055-*
Inputs:     P18 decisions 4, 7-11, 13 and 14; facts 2, 3, 6, 7 and 8 re-run from
            dev-dist/p18/facts.mjs; W65's types and validator; today's bootstrap as
            the identity derivation's factory
Outputs:    (1) `createRuntime(document, code, { base })`: groups from factories —
                the three built-ins in `{ configSchema?, create }` shape, custom ones
                from `code.groupTypes`, a name colliding with a built-in refused, an
                object lacking `canRun` or `getMetrics` refused naming the key —
                pools from types (every type's default instance from its own
                `config`, named instances from `pools`, decision 9's resident-group
                refusal), languages from `code.languages` against the document's
                names both ways (the runtime imports NO engine — decision 13), and
                the driver's registry exposed as `runtime.registry` (decision 14)
            (2) `runtime.start(flow, payload, { runId?, joinPolicy? })` returning a
                `Driver`, run ids minted as `r<n>` per runtime, `live-token` by default
            (3) `bootstrap` reduced to the identity derivation's factory and kept
                exported; the sub-path exported by both manifests and allowlisted for
                publish; the spec's runtime-targets rule for it
            (4) AGENTS.md §12-§14 rewritten from a copy of the harness to calls, with
                a `run` snippet driving the sample's registry on real pools
            (5) ADR 0055 if the sub-path's placement or the run-id minting needs its
                own record; expected folded into ADR 0054
Depends on: W65
Blocks:     W67
Tests:      expected values from the plan's decisions and P18's facts, never from
            output. Every construction refusal fixtured; two pools over one worker
            URL asserted as two (fact 3's shape on the runtime's own pools); the
            resident-group refusal against fact 6's exact configuration; a default
            instance's options equal to bootstrap's for every existing type; a
            minted id inside ID-R2's charset and distinct across two runs
Gate:       L0 under all five typechecks; L1 on real inline AND threaded pools built
            from a document, in both runtimes; check:source — the root and the
            scheduler sub-path load no validator and no engine (S14's shape a third
            time), the runtime sub-path allowed; check:docs on the rewritten
            sections; check:scheduler; then spec-conformity pass (two readers),
            rule 8 re-run with their edits
Reserves:   Q285-Q288, ADR 0055
```

## Scope

**In**

1. **Construction from a document** — every object the harness builds by hand today, built by the
   runtime from names, with every refusal at construction and named.
2. **The runtime's own surface**: `createRuntime`, `start`, `registry`, and nothing a consumer
   could not otherwise reach through the pure root.
3. **The consumer reference**: §12 becomes a call, §13 and §14 read `type` and the runtime.

**Out** — named, with where each goes

- **The exit artifact and `examples/**`.** W67's.
- **Loading an engine or a validator into the root.** Refused by `check:source`; the runtime sub-path
  is the one place a validator lives, and no engine lives anywhere but `src/jsonata/**` (ADR 0052
  rule 4).
- **A per-node or per-run choice of pool.** Routing; ADR 0001.

## Exceptions

*Seeded from the plan's table.*

| path | why |
|---|---|
| `scripts/check-source.mjs`, `scripts/check-source-selftest.mjs` | predicted: a clause that the root and the scheduler sub-path import no validator and that the validator is reached from `src/runtime/**` alone — `S14`'s shape a third time (W62's table); a probe and a `META` entry per clause |
| `scripts/check-docs.mjs`, `scripts/check-docs-selftest.mjs` | predicted: a fourth sub-path rewrite for `fyflow-orchestration/runtime` with its probe, and `RUN_FLOOR` moving with §12-§14's snippets (W59's and W62's tables) |
| `scripts/check-scheduler.mjs`, `scripts/check-scheduler-selftest.mjs` | predicted: `D8` binds `deno.json`'s `imports`; a new sub-path export is not an import, so predicted NOT to fire — checked |
| `spec/README.md` | the `Owns` consequence: `C8` makes its version row a consequence of the `spec/runtime-targets.md` bump |
| `examples/l6.ts` block (2c) | predicted: it asserts the two manifests' `./scheduler` export by literal; a `./runtime` export beside it is a second literal or a widened clause, and `examples/**` is W67's — declared here so the first L6 run after this item's manifest edit is read for it |

## Verification

| clause | command |
|---|---|
| L0 | `npm run lint`, `npm run typecheck` |
| L1 | `npm test`, `npm run test:deno`, `npm run test:browser:all` — the runtime suite's real-pool half skipped in the browser as W61's is, stated |
| checks | `npm run check:source`, `npm run check:docs`, `npm run check:scheduler`, `npm run check:spec` |
| readers | conformity: the decisions first, every refusal re-derived; adequacy: isolated copy, every factory, every default instance and every refusal mutated, with obligation (c) over what the runtime READS from the document against what it BUILDS |

*Routing cases: not applicable — a runtime constructs and starts; what a run does is W67's.*

## Record

*Filled in when the item is done.*
