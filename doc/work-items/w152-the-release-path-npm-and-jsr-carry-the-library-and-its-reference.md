# W152 — The release path: npm and JSR each carry the library, its types, its licence and `AGENTS.md`

**Status:** todo — declared 2026-10-10 on `dbc8996`, before any file under `Owns` was edited
**Plan:** none — an item outside any plan, on W98's, W139's, W150's and W151's precedent. Its source is
the maintainer's release-readiness review of 2026-10-10 and the maintainer's direction that
**`AGENTS.md` must be part of the released package**, on both registries.

*This file carries NO relative link, as W140-W151's files do: ids and paths are bare text.*

**Question:** *what does each registry receive from `npm pack` and `deno publish`, and does a consumer
who installs the packed artifact get a library that imports, typechecks and runs, with its licence
and its reference beside it?*

## Why, measured on `dbc8996`

Neither registry has ever carried the package: `npm view fyflow-orchestration` and
`https://jsr.io/@fyflow/orchestration/meta.json` both return 404. So 0.7.0 would be the first release.

| finding | measured | consequence |
|---|---|---|
| **the npm tarball carries no code** | `npm pack --dry-run`: 2 files, `README.md` and `package.json`. Every `exports` entry points into `dist/node`, `dist/browser` and `dist/types`. No `build`, `prepack` or `prepublishOnly` script exists, and `dist/` is gitignored and absent | an `npm install` resolves nothing. `spec/runtime-targets.md` section 1 promises esbuild bundles per platform, mirroring `fyflow-scheduler@0.5.2`, which ships `build: node esbuild.config.js` with `prepublishOnly: npm run build`. `esbuild` is already a devDependency; the build was never written |
| **no `LICENSE` file** | both manifests declare MIT; `README.md:317` says *"There is no `LICENSE` file yet"* | MIT's notice must ship with the code, and JSR's package score checks it. `fyflow-scheduler` ships its `LICENSE` in the tarball |
| **`AGENTS.md` ships nowhere** | `package.json` `files` is `dist/**/*` and `README.md`; `deno.json`'s `publish` allowlist has no `AGENTS.md` | the maintainer requires it on both. `fyflow-scheduler` ships its `AGENTS.md` in its npm package, and this repository's `CLAUDE.md` tells a reader to use that copy, so ours follows the same shape |
| **the README says it is not published** | `README.md:20-26`: *"Not published yet"*, *"Nothing is on a registry yet, so this does not work today"* | false the moment the release happens |
| **npm metadata missing** | `package.json` has no `repository`, `homepage`, `bugs` or `keywords` | discoverability, and `repository` is required for npm provenance. `fyflow-scheduler`'s manifest carries all four |
| JSR dry run | `deno publish --dry-run --allow-dirty` EXIT 0. The allowlist matches the tracked source exactly. Three `unanalyzable-dynamic-import` warnings, from `src/scheduler/envelope-worker.ts:306` and `src/definition/wiring.ts:806`, which import a consumer-supplied URL by design | ready, apart from `LICENSE` and `AGENTS.md` |
| last `gate:full` | `c99e930` (W146). W150 and W151 changed `scripts/` and `src/` since, confirmed by `gate:item` and `gate` | the release tree owes one `gate:full` |

```
Spec:       spec/runtime-targets.md section 1 (what each target is published as and what ships:
            JSR the TypeScript source, npm an esbuild bundle per platform plus types). RT-R3/RT-R4 (no
            `node:` import in the published source). ADR 0048 (the scheduler is a declared dependency
            reached by one bare specifier; it is a PEER here, kept external by the bundle). Q35's
            resolution (the published engines floor is >=22; the development pin stays 24).
            Workflow section 5 rules 7 and 8; section 1 rule 6 (v0.30).
Owns:       package.json (scripts build/prepack, files, repository, homepage, bugs, keywords;
            NOT the gate chains, see Out), deno.json (publish allowlist gains AGENTS.md and LICENSE),
            scripts/build.mjs (new: the esbuild bundles and the declaration emit),
            tsconfig.build.json (new: declaration-only emit into dist/types),
            scripts/pack-smoke.mjs (new: the packed-artifact smoke test) and its provocations (its --provoke mode),
            scripts/jsr-smoke.ts and scripts/publish-output.ts (new: the JSR smoke test and its
            dry-run parser) with the parser's tests, deno.json's tasks (jsr:smoke),
            .github/workflows/publish.yml (new: the tag-triggered publish),
            .github/workflows/gate.yml (its one step becomes `npm run gate`, and its comments say
            why), .github/workflows/ci.yml (new: the JSR dry run and jsr:smoke on push),
            doc/decisions/0070-* (a dated note, a record-step file),
            src/scheduler/bootstrap.ts (ONLY if the envelope worker's URL needs a build-time
            variant, Outputs (9); prefer an esbuild plugin that leaves the source untouched),
            LICENSE (new), README.md (status, install and licence sections), AGENTS.md (only if a
            sentence states that it does not ship, or states an install line that becomes false),
            this file
Inputs:     the tree at dbc8996; esbuild and typescript (devDependencies); fyflow-scheduler@0.5.2
            and jsonata@2.2.2 (kept EXTERNAL to the bundles); node_modules/fyflow-scheduler's
            package.json, files and LICENSE as the reference shape
Outputs:    (1) `npm run build` produces dist/node, dist/browser and dist/types for all three entry
                points (., ./scheduler, ./jsonata), every path package.json's exports names, with
                fyflow-scheduler and jsonata external, and `prepack` runs it
            (2) `npm pack --dry-run` lists dist/**, README.md, LICENSE and AGENTS.md, and nothing
                else (no src/, test/, doc/, dev-dist/ or examples/)
            (3) `deno publish --dry-run` lists LICENSE and AGENTS.md beside the source, and
                EXITs 0 with no warning other than the three declared dynamic-import ones
            (4) `npm run pack:smoke`: packs the tarball, installs it with fyflow-scheduler@0.5.2 into a
                scratch project under dev-dist/w152-<pid>/, and in Node 24 imports each sub-path,
                checks every named export index.ts, src/scheduler/index.ts and src/jsonata/index.ts declare, runs one real flow to `completed`,
                typechecks a consumer file against the shipped .d.ts, and finds AGENTS.md and LICENSE
                in node_modules/fyflow-orchestration/. It also builds each sub-path for the browser
                with esbuild, platform browser, from the installed package
            (5) LICENSE: the MIT text, the same holder as fyflow-scheduler's
            (6) package.json gains repository, homepage, bugs and keywords, in the scheduler's shape
            (7) README.md: the status and install sections state what is true at release; the
                licence section names the file. The release itself is NOT done by this item
            (8) `npm run gate:full` EXIT 0 on the final tree, the confirming gate for the release
                tree, because W150 and W151 landed after the last one
            (9) THE ENVELOPE WORKER SURVIVES BUNDLING. src/scheduler/bootstrap.ts:57 builds
                ENVELOPE_WORKER_URL as new URL('./envelope-worker.ts', import.meta.url); in an esbuild
                bundle that names a .ts file absent beside dist/node/scheduler/index.js, which would
                break every typed node type for an npm consumer. fyflow-scheduler solves the same
                case with an esbuild worker plugin (a data: URL on Node, a Blob URL in the browser).
                pack:smoke's real flow uses a TYPED node, threaded and inline, so it fails if this
                breaks
            (10) `deno task jsr:smoke`, in fyflow-scheduler's style (its scripts/jsr-smoke.ts and
                publishOutput.ts): parse `deno publish --dry-run`'s file list, stage EXACTLY those
                files in a scratch directory, and run a real flow there, a typed node threaded
                included. The dry run cannot see envelope-worker.ts going missing from the
                allowlist, because the runtime reaches it by new URL() and not by an import. The
                parser is unit-tested on POSIX and Windows paths, the branch that broke the
                scheduler's CI
            (11) .github/workflows/publish.yml in fyflow-scheduler's shape: on a v* tag, check that
                deno.json, package.json and the tag agree on the version; re-run `npm run gate` (the
                ladder, NEVER gate:full) and both smoke tests; publish to JSR (OIDC, no secret); then, only if JSR succeeded, publish to
                npm with trusted publishing and --provenance, skipping a version already on npm and
                running `npm pack --dry-run` first. NOT triggered by this item: no tag is pushed
            (12) NO WORKFLOW RUNS gate:full (the maintainer, 2026-10-10: it takes far too long).
                .github/workflows/gate.yml stays manual-only and its step becomes `npm run gate`; the
                self-tests then run only locally (a plan's last item, and an item that edits register
                files, workflow v0.29). ADR 0070 gains a dated note: its *proving the checks can fail
                belongs to CI* no longer holds anywhere. A new .github/workflows/ci.yml runs on every
                push and does only the JSR dry run and `deno task jsr:smoke`, a minute or two, as
                fyflow-scheduler's ci.yml runs them
Depends on: nothing
Blocks:     the first publish, which is the maintainer's separate, explicit step
Tests:      (4) is the test: its expected values are the export names the three entry files declare and
            the outcome spec/run-state.md section 3 gives the flow, never a snapshot of a run.
            Provoked at birth (section 5 rule 7): a bundle that inlines fyflow-scheduler, a files list
            without AGENTS.md, an exports entry pointing at a path the build does not emit, and a
            .d.ts emit that is missing one sub-path each turn pack:smoke RED, by name; the envelope
            worker's URL left pointing at a .ts file turns pack:smoke's typed flow RED; and
            envelope-worker.ts dropped from deno.json's allowlist turns jsr:smoke RED while the dry
            run stays green (the case jsr:smoke exists for)
Gate:       L0-L6 via `npm run gate`; the build and both dry runs EXIT 0; pack:smoke and jsr:smoke
            EXIT 0 with their provocations checked in; publish.yml, ci.yml and gate.yml parse, and none names gate:full (actionlint, or
            a YAML parse where actionlint is absent); one conformity reader; `npm run gate:full` EXIT 0, once, on a
            still tree
Reserves:   Q580-Q582, ADR 0092. ADR 0092 is used only if an answer needs one
```

## Scope

**In**

1. Measure first: re-take the `npm pack --dry-run` and `deno publish --dry-run --allow-dirty` listings
   on the declared tree, and take `fyflow-scheduler`'s published package shape (its `files`,
   `exports` and `dist` layout) as the reference.
2. The build, Outputs (1). One script, two esbuild platforms, and a `tsc` declaration emit.
   **Run from `prepack`, by the maintainer's choice on 2026-10-10**: one hook builds for both
   `npm pack` and `npm publish`, so the tarball `pack:smoke` tests is built exactly as the one a
   publish uploads. *Not chosen*: `prepublishOnly`, `fyflow-scheduler`'s hook, which leaves `npm pack`
   unbuilt; `prepare`, which builds on every development install; and an unhooked build guarded at
   publish.
3. The packaging, Outputs (2), (3), (5) and (6), including **`AGENTS.md` in both registries** (the
   maintainer's direction).
4. The smoke test, Outputs (4), with its provocations.
5. The README, Outputs (7).
6. **fyflow-scheduler's release style, by the maintainer's answer on 2026-10-10**: the JSR smoke
   test and its parser, Outputs (10); the tag-triggered publish workflow, Outputs (11); and the JSR
   checks in CI, Outputs (12). *Not adopted*: its build script's exact shape (`esbuild.config.js` at
   the root) and its `prepare` + `prepublishOnly` hooks; this item keeps `scripts/build.mjs` and
   `prepack`. Outputs (9), the envelope worker's URL, was found while reading its build: the
   scheduler's worker plugin exists for the same reason.
7. Rule 8 on every output, one conformity reader, then `gate:full` once (Outputs (8)).

**Out** — named rather than left implicit

- **Publishing.** Pushing the `v0.7.0` tag that triggers publish.yml is the maintainer's explicit step
  after this item, and so is the one-time setup it needs: the `@fyflow/orchestration` package on
  jsr.io linked to this GitHub repository, and a trusted publisher for `fyflow-orchestration` on
  npmjs.com pointing at `.github/workflows/publish.yml`. A published version cannot be withdrawn the
  way a commit can.
- **Wiring `pack:smoke` into `gate` or `gate:full`.** That changes what the gate runs (W139's
  `gate:item`, ADR 0070) and binds `check-wiring`'s gate-manifest clauses. It is a stop-and-ask
  (rule 6) if the reader or the maintainer wants it in the gate; until then it is a standalone
  script run by this item and by the release step.
- **A version bump past 0.7.0.** 0.7.0 is the first release.
- **A `CHANGELOG`.** `fyflow-scheduler` has none either (CLAUDE.md), and nothing here asks for one.

**Amended 2026-10-10, by the maintainer's answer (a) to a stop-and-ask raised during the build:
`check:pack` is renamed `pack:smoke`, run by `scripts/pack-smoke.mjs`, with its provocations as a
`--provoke` mode that restores the tree byte for byte.** The declared name could not stand beside
this section's first bullet. **Any `check:*` name is bound by two existing checks:**

- `scripts/check-source.mjs` **`S11`** requires every `check:*` entry to be reached from
  `npm run gate:full` and to have a `check:*:selftest` sibling;
- `scripts/check-wiring.mjs` **`G3`** requires every `scripts/check-*.mjs` on disk to have both
  entries, both reachable from `gate:full`, and `G1`/`G2` then grade its `--self-test` dispatch.

So a standalone `check:pack` left three choices: a red gate, wiring it into the gate (Out, above), or
editing those two checks (outside `Owns`). The new name binds neither check, and it mirrors
`jsr:smoke`. *Not chosen*: (b) wiring it into `gate:full` with a self-test, and (c) exempting it in
`S11` and `G3`. **The same names in Owns, Outputs (4), Tests, Gate and Verification were changed in
place.**

## Verification

- `npm run build > dev-dist/w152-<pid>/build.log 2>&1; echo "EXIT=$?"`, then
  `npm pack --dry-run` and `deno publish --dry-run --allow-dirty`, each redirected and its EXIT read.
- `npm run pack:smoke > dev-dist/w152-<pid>/pack.log 2>&1; echo "EXIT=$?"`, and its provocations
  run as a checked-in harness that restores the tree byte for byte.
- `npm run gate > …; echo "EXIT=$?"` after the build lands, and `npm run gate:full > …; echo "EXIT=$?"`
  once on the final, still tree.
- **Stop-and-asks** (workflow section 1 rule 6; they go up to the main agent): any file outside
  `Owns`, including a `tsconfig*.json` other than the new one, `check-wiring` or a gate chain; a
  bundle that cannot keep `fyflow-scheduler` external; a change to the published `engines` floor; an
  `exports` shape that has to change.
- Routing cases: not applicable, since this item changes no routing.

## Record

*Filled in when the item is done.*
