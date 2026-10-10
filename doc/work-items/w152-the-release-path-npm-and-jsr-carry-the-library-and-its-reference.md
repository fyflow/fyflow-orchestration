# W152 — The release path: npm and JSR each carry the library, its types, its licence and `AGENTS.md`

**Status:** done 2026-10-10 — see the Record. Declared on `dbc8996` (committed `cd2bc26`), before any file under `Owns` was edited.
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

**A premise of Outputs (10) and Tests is FALSE, measured at the build (and confirmed by the
conformity reader, finding 1), and is left in place above so the correction has a subject.**
*"envelope-worker.ts dropped from deno.json's allowlist turns jsr:smoke RED while the dry run stays
green"* holds for `fyflow-scheduler`'s `workerWrapper.ts` and not here: `src/scheduler/index.ts`
re-exports `EnvelopeWorker` from `./envelope-worker.ts`, so the file is in the module graph and
`deno publish --dry-run` refuses its exclusion itself (`error[excluded-module]`, EXIT 1; probe `JE`).
**The case `jsr:smoke` alone sees is a file that is NOT a module**: `AGENTS.md` or `LICENSE` dropped
from the allowlist leaves the dry run EXIT 0 and turns `jsr:smoke` RED (`J2`; probes `JA`, `JL`).
Outputs (12)'s *"does only the JSR dry run and `deno task jsr:smoke`"* also runs the parser's tests
(`deno task jsr:smoke:test`), Outputs (10)'s own tests, on the Linux host where that parser broke.

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

*Filled in 2026-10-10. The scratch directory is dev-dist/w152-33578/, named for this item's shell pid,
and every log named below is there. Node v24.20.0 came from `fnm use 24` in every shell, and Deno was
2.9.6. Every rung was redirected and its EXIT read in the same command, never piped. Ids are bare
text, as the header says.*

### Gate

| command | EXIT | reading |
|---|---|---|
| `npm run gate` on `5f32a27` (`gate1.log`) | **0** | the ladder once the build landed. The conformity reader re-ran it on `333d0e6` and got EXIT 0, 2487 assertions, 0 failed |
| `npm run build`, through `prepack` | 0 | 4 files per platform (three entries and one shared chunk) and 25 declaration files. All 9 paths package.json names exist |
| `npm pack --dry-run` (`pack-after.log`) | 0 | 37 files (the listing is below) |
| `deno publish --dry-run --allow-dirty` (`jsr-after.log`) | 0 | 27 files. The only warnings are the three declared `unanalyzable-dynamic-import` ones |
| `npm run pack:smoke` (`pack3.log`) | 0 | P1-P11 all ok |
| `deno task jsr:smoke` / `deno task jsr:smoke:test` | 0 / 0 | J1-J6 ok / 10 of 10 tests |
| actionlint v1.7.12 on the three workflows (`dev-dist/w152-33578/wf-check.mjs`, W1) | 0 | actionlint was not on the PATH, so it was run as `go run github.com/rhysd/actionlint/cmd/actionlint@v1.7.12 -shellcheck= -pyflakes=`. **No `run:` step names `gate:full`** (W2). Comments name it in order to say why it is not run |
| `npm run gate:full` on `a7932d2` (`full.log`) | **1** | the ladder passed (2487 assertions, 0 failed). **One lane was red: `check:markdown:selftest`, 16 of 44 probes.** See *What broke* |
| `npm run check:markdown:selftest`, alone, after the fix | 0 | the red lane re-run by itself, as workflow section 4 says |
| `npm run gate:full` on `9f7ace3` (`full2.log`) | **0** | **the confirming gate for the release tree, Outputs (8).** The tree was held still from start to EXIT. Node, Deno and Chromium ran 1593 assertions each. L6 ran 2487 assertions with 0 failed, in Node and in Deno. All 11 self-test lanes were ok: 2310.5 s wall over 10 lanes. Only this Record's own lines changed after it. On the tree with them, `check:markdown`, `check:register` and `check:budget` each EXIT 0, and so does `npm run gate` (`gate-final.log`) |

L7 did not run: no person looked at a trace. **`pack:smoke` is not in the gate**, as Out says. It
runs here, in `publish.yml`, and by the release step.

### The listings, before and after

| | before, on `dbc8996`+ (`pack-before.log`, `jsr-before.log`) | after, on `a7932d2` |
|---|---|---|
| `npm pack --dry-run` | **2 files**: `README.md`, `package.json`. 8.2 kB packed | **37 files**: `AGENTS.md`, `LICENSE`, `README.md`, `package.json`, `dist/node/{index,scheduler/index,jsonata/index}.js` plus one `chunks/` file, the same four under `dist/browser/`, and 25 under `dist/types/` (the `src/` tree's declarations plus `index.d.ts`, `scheduler/index.d.ts` and `jsonata/index.d.ts`). 350.7 kB packed, 1.2 MB unpacked |
| `deno publish --dry-run` | 25 files: `README.md`, `deno.json`, `index.ts` and 22 `src/` files | **27 files**: the same, plus `AGENTS.md` and `LICENSE` |

### Outputs

| | what was built | what would fail without it |
|---|---|---|
| (1) | `scripts/build.mjs` and `tsconfig.build.json`; `"build"`, with `"prepack": "npm run build"`. esbuild, ESM, **code-split** across the three entries, `fyflow-scheduler` and `jsonata` external (the build fails if its metafile shows either was inlined), then a tsc declaration-only emit with `.ts` rewritten to `.js` in every specifier, and the two sub-path `.d.ts` entries written as re-exports (the default re-exported only where one exists, which is jsonata). The build fails if any path the `exports` map names was not emitted | K1, K3, K4 (the build's own refusals); K1b, K1c, K3b, K4b (with the build's guard off, pack:smoke sees them); R1a, R1b (no prepack, or a build that does nothing). **K6: without splitting, a `RegistryError` thrown by `./scheduler` is not `instanceof` the one `.` exports** |
| (2) | `files`: `dist/**/*`, `README.md`, `AGENTS.md`, `LICENSE` | K2 (no AGENTS.md: P2 and P8), K2c (`src/` added: P2). **K2b is a declared survivor**: npm packs a root `LICENSE` whether or not `files` names it, so dropping it from `files` stays green. That is correct, and it is listed so nobody reads the `files` entry as load-bearing |
| (3) | `deno.json`'s allowlist gains `!AGENTS.md` and `!LICENSE` | JA and JL: the dry run stays EXIT 0 and jsr:smoke J2 is RED |
| (4) | `scripts/pack-smoke.mjs`, run as `npm run pack:smoke`, with P1-P11, and its `--provoke` mode (`pack:smoke:provoke`). Expected values come from the three entry files, compared both ways at runtime (P5) and at type level through TypeScript's checker (P6), and from the spec's transform rule (P7: `HELLO WORLD !`) | every K and R row |
| (5) | `LICENSE`: the MIT text, `Copyright (c) 2026 FyFlow Team`, byte-identical to `fyflow-scheduler`'s | R5a (holder), R5b (not MIT): P8 |
| (6) | `repository`, `homepage`, `bugs` and `keywords` in the scheduler's shape (`author` was left out, since it is not declared) | R6a-R6d: P10 |
| (7) | README: the status line, the install section (npm and `deno add`, plus what each registry carries) and the licence section | R7 is a **declared survivor**, run against `check:docs`: README reverted to *"Not published yet"* is EXIT 0, because no check reads prose (the refusal ledger's first row). X9 still holds the version sentence |
| (8) | `gate:full` | see Gate |
| (9) | **The envelope worker, without editing the source**: an esbuild `onLoad` plugin replaces the single `new URL('./envelope-worker.ts', import.meta.url).href` in `bootstrap.ts` with the worker bundled on its own, as a `data:` URL on Node and a `Blob` URL in the browser. The build fails if the expression occurs anything other than exactly once, and if any output still holds a string naming `envelope-worker.ts` | K5 (the build's guard). K5b (guard off): P7 and P11, threaded and inline, *"the run did not settle"*. K5d (the browser branch pointed back at a file beside the bundle): P11 alone |
| (10) | `scripts/jsr-smoke.ts` (J1-J6) and `scripts/publish-output.ts`, with `scripts/publish-output_test.ts` (10 tests, POSIX and Windows branches on any host); tasks `jsr:smoke` and `jsr:smoke:test`, both `--no-lock`. Unlike the scheduler's version, there is no `jsr:@std` import, because `deno.lock` is tracked and not owned here. J4 holds the published imports to exactly `deno.json`'s two, both ways | JA, JL, JE, JS; R10a-R10g |
| (11) | `.github/workflows/publish.yml`: **v\* tag only**. It checks the versions and the tag (and refuses a run that is not a tag push), `npm ci`, chromium, `npm run gate`, the parser tests, `jsr:smoke`, `pack:smoke`, then `deno publish` (OIDC). The npm job `needs: jsr`: it skips a version already on npm, runs `npm pack --dry-run`, then `npm publish --provenance --access public` | R11a, R11d, R11e. **R11b (`needs: jsr` removed) and R11c (the version check made a no-op) are declared survivors**: no rung reads a workflow's job graph or a step's body. They were run against the workflow rung and came back EXIT 0 |
| (12) | `gate.yml`'s step is `npm run gate`, and its comments say why; `ci.yml` on every push runs the parser tests, the JSR dry run and `jsr:smoke`; ADR 0070 has a dated note | R12a. **R12b (ci.yml loses jsr:smoke) is a declared survivor**, for the same reason |

### Exceptions — reconciled to `git diff --name-only b541d8d..HEAD`, path by path

Every changed path is in `Owns` or in the record step: the three workflows, `LICENSE`, `README.md`,
`deno.json`, `package.json`, `scripts/{build,pack-smoke}.mjs`, `scripts/{jsr-smoke,publish-output,publish-output_test}.ts`,
`tsconfig.build.json`, this file and `doc/decisions/0070-*` (all `Owns`), and `doc/questions/q261.md`,
`q580.md` and `q581.md` (record step). **No exception**. Neither `src/scheduler/bootstrap.ts` nor
`AGENTS.md` was edited (see Q580). `git status --short` is empty.

### Rule 8 — `node scripts/pack-smoke.mjs --provoke --probes dev-dist/w152-33578/rule8-probes.mjs`

**Final pass, on `a7932d2`: 49 of 49 as declared, with the digest `c7e1ebcda901` equal before and after
(`rule8-final2.log`).**
- **The set:** 21 checked-in probes (C0, K1-K6 and their compound variants, J0, JA, JL, JE, JS, GX, GW) and 28 in the item's file (R*, W0).
- **The harness:**
  - every anchor is checked against the CURRENT text and must match exactly once, or the probe aborts. Three did on the first run, two of them because the probe list quotes its own anchor;
  - every edit must change its input;
  - every written file is restored to its FIRST snapshot and compared byte for byte;
  - the tree's digest covers what git can see.
- **Controls:** C0, J0 and W0 come back clean.
- **Grader controls:** GX (a syntax error in pack-smoke itself) is graded CRASH, and GW (a catch deliberately mis-declared) is graded WRONG-REASON.
- **Each CAUGHT must:**
  - have EXACTLY its declared id set;
  - carry a `must` copied from a failure line seen.
- **Declared survivors, by id:**
  - **K2b** (npm's own LICENSE rule);
  - **R4t** (P5 made a tautology passes a correct tarball, and P6 still holds the type level);
  - **R7** (README prose);
  - **R11b, R11c, R12b** (workflow structure).
  Each was run against the rung its reason names.

Earlier passes were 45/47 on `333d0e6` and 46/49 on `00a9f8d`. Each miss was a declaration fixed to what the harness saw, not a probe weakened:
- **R4d** co-fired P6 because the consumer file hard-coded `m2`; it is now derived from ENTRIES.
- **R11c** used `if: false`, which actionlint itself refuses.
- **K5b, R1a, R1b**: once P11 existed it co-fires, correctly.

### The conformity reader — one, a fresh context, spec first, reported without fixing

| # | finding | what was done |
|---|---|---|
| 1 | the `JE` premise in Outputs (10)/Tests is false: envelope-worker.ts is in the module graph, so the dry run itself refuses its exclusion | **measured as the reader said** (JE: dry run EXIT 1). The declaration carries the correction under its amendment. JA and JL are the cases only jsr:smoke sees |
| 2 | gate.yml and publish.yml cite an ADR 0070 dated note that did not exist | the note was written (`a252b3e`) |
| 3 | W152 made four sentences false: AGENTS.md:2654, bootstrap.ts:53-56, RT-R12's tail, Q261's title for the npm half | stop-and-ask. **The maintainer answered (b), 2026-10-10: leave them and raise questions.** **Q580** carries the three envelope-worker sentences. **AGENTS.md therefore ships on both registries with a sentence that is false for the npm dist (*"like the envelope worker itself — has to be served beside your bundle"*), by the maintainer's choice, and Q580 is the question that carries it.** Q261 gains a dated note: its npm half is settled, and it stays deferred for source bundles |
| 4 | nothing ran the browser branch (the Blob URL) | **P11**: dist/browser in Chromium, threaded and inline. Provoked by K5d |
| 5 | gate:full not yet run; rule 8 at 45/47 | done; see Gate and Rule 8 |
| 6 | publish.yml's `workflow_dispatch` could publish with no tag | removed, and the version step now refuses anything that is not a tag push. Probe R11e (the reader's exact edit) is caught by W4 |
| 7 | ci.yml also runs the parser tests, which Outputs (12) did not list | kept, and stated in the declaration's amendment |
| 8 | the scratch paths are `dev-dist/pack-smoke-<pid>`, `pack-smoke-provoke-<pid>` and `jsr-smoke-<pid>`, not `w152-<pid>` | noted. Each carries its pid (G6), and a script naming a work item would be a stale name the day the item closes |
| 9 | README's release sentence is true only from the tag onward; ADR 0073 rule 2 lists *"nothing is published yet"* | the first is what Outputs (7) asks for. The second is **Q581**, by the maintainer's answer (b) |
| 10 | relative `doc/` links in the shipped `.d.ts`, AGENTS.md and README are dead on the registries | noted, not acted on: cosmetic, and neither registry ships `doc/` |

**The reader also measured these correct:**
- the bundle runs on Node 22.16, threaded and inline, so the `engines` floor holds;
- `require()` of all three sub-paths works;
- four consumer tsconfig shapes typecheck with no diagnostic in this package's `.d.ts`;
- `git status` stays clean after the gate and both smoke tests.

### What broke, and what this taught

1. **The declared name `check:pack` could not exist beside Out.** S11 and G3 bind every `check:*`
   name to a `:selftest` reached from `gate:full`. The answer (a) renamed it `pack:smoke`.
   **A name is a binding.** In this repository the `check:` prefix is a claim two checks enforce.
2. **The first `gate:full` was RED on a lane no ladder rung covers.**
   - `check:markdown:selftest` copies a fixed list of trees and root files into its stage, and `LICENSE` is not on that list. README's two new `[LICENSE](LICENSE)` links were dead in every staged copy, so every probe gained an `M1` (16 of 44 caught).
   - `npm run gate` and `check:markdown` were green, since the link resolves in the real tree.
   - Fixed within Owns: the two links became the code span `` `LICENSE` ``. The lane was re-run alone (EXIT 0), then `gate:full` once more.
   - *The alternative, adding `'LICENSE'` to the COPY list in `scripts/check-markdown-selftest.mjs`, is outside Owns and was not needed.*
   - **This is ADR 0070 consequence 2 measured once more: the self-tests see what the ladder cannot, and since this item nothing on GitHub runs them.**
3. **Run in one process, a hanging mode takes the other mode's verdict with it.** With the envelope URL broken, the threaded run never settled, Node exited 13, and the inline mode reported *"no verdict"*. Each mode now runs in its own process with a 30 s bound.
4. **esbuild renames on a collision** (`jsonata3`), so the first marker for an inlined jsonata matched nothing (K1c, WRONG-REASON) until it allowed the suffix.
5. **The `JE` premise was copied from the scheduler, whose `workerWrapper.ts` is reached ONLY by `new URL()`.** Here the same file is also re-exported. *A reference implementation's reason transfers only with its precondition.*

### Questions closed and raised

- **Raised:** **Q580** (the envelope-worker sentences, including the AGENTS.md sentence that ships) and **Q581** (ADR 0073 rule 2 against the README's release status), both `open`, `raised-by: "W152"`, each by the maintainer's answer (b). **Q582** was reserved and not issued; it is skipped.
- **Closed:** none. **Q261** keeps `deferred`, with a dated note that W152 settles its npm half.
- **ADR 0092** was reserved and not used.
- **Ids.** Issued: W152, Q580 and Q581. Q582 and ADR 0092 were reserved and are SPENT, unused.
  **The next item starts at W153, Q583 and ADR 0093.**

### The release, the maintainer's steps (Out)

1. On jsr.io: create `@fyflow/orchestration` in the `@fyflow` scope and link it to `fyflow/fyflow-orchestration`.
2. On npmjs.com: add a trusted publisher for `fyflow-orchestration`, this repository, workflow `.github/workflows/publish.yml`. The first publish of a new package name may need the package created by hand first.
3. Push the commits, then `git tag v0.7.0 && git push origin v0.7.0`. publish.yml then verifies and publishes JSR first, then npm.
