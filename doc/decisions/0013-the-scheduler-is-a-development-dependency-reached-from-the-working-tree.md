# ADR 0013 — `fyflow-scheduler` is a **development** dependency, reached from the working tree next door, and the published library depends on it not at all

**Date:** 2026-08-30
**Status:** accepted — **rules 3 and 5 superseded 2026-08-31 by
[ADR 0029](0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)**,
after both registries began carrying 0.3.0. **Rules 1, 2 and 6 superseded 2026-09-11 by
[ADR 0048](0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md)**: the
published library now DEPENDS on the scheduler, `S7` is narrowed to the FORM of the reach and `S9` is
retired. ADR 0048 answers the claim rule 1 protected — *Consequences* below, *"a driver that can
construct a scheduler is a driver that will"* — on ADR 0001's own terms, and records that the
`peerDependency` this document rejected as *"a false statement in a manifest"* stopped being one
when the pin reached a registry (context fact 1, expired 2026-08-31). **Rule 4 stands** and is
normative as `RT-R11`. *(This line read "Rules 1, 2 and 4 stand unchanged, and rule 1 … is the
load-bearing one and is untouched" from 2026-08-31 to 2026-09-11 — and for a few hours on
2026-09-11 it read that rule 1 "had expired with ADR 0029 and was left standing on nothing it was
decided on", which this document's own fact 4 and its Consequences cost 1 contradict; W57's
conformity reader.)*
The title of this document is now historical: the scheduler is a **registry** dependency — **two clauses corrected in place, 2026-08-30**, see *Correction*
**Raised by:** [Q51](../open-questions.md), taken by [W5](../work-items/w5-one-real-fan-out-flow-on-a-real-scheduler.md)
under [P1](../plans/p1-what-satisfies-a-join.md)

## Context

Until W5 this repository had **no dependency on `fyflow-scheduler` at all** — `package.json` carried
no `dependencies` block and `deno.json` no `imports` map. That is not an oversight: W3 made
`SchedulerLike` a **structural** interface (`src/driver/driver.ts`) precisely so the driver could be
gated without one, and L0-L5 are pure logic over fixtures. **W5 is the first thing that needs the
real library**, because ladder L6 is the only rung that sees a real scheduler.

Four facts constrain the choice. All four were measured on 2026-08-30 rather than assumed.

### 1. The pinned version is on no registry

[Q3](../open-questions.md) pins **0.3.0**. `CLAUDE.md` and `doc/README.md` say it is *"not yet
published to npm"*, which is true and incomplete — **both registries carry the package, and both
top out at 0.2.1**:

| registry | package | latest | measured |
|---|---|---|---|
| npm | `fyflow-scheduler` | **0.2.1** | `registry.npmjs.org/fyflow-scheduler`, `dist-tags.latest` |
| JSR | `@fyflow/scheduler` | **0.2.1** | `jsr.io/@fyflow/scheduler/meta.json` — four versions, 0.1.0 through 0.2.1 |

So **`@fyflow/scheduler` *is* on JSR**, which `spec/runtime-targets.md` section 1 assumes for our own
release and which nobody here had checked. It just does not carry what we pin. **0.3.0 exists only in
the working tree at `../fyflow-scheduler`.**

A registry dependency is therefore not available: pinning `0.2.1` would run L6 against the version
whose orphaned-task drop is the exact second cause [P1's validity section](../plans/p1-what-satisfies-a-join.md)
spent a section retiring, and `latest` is the same thing spelled worse.

### 2. Node **cannot** load the sibling's TypeScript source; Deno can *(true until 0.5.2 — see the note below)*

Measured under Node 24.20.0, importing `../fyflow-scheduler/index.ts` directly:

```
SyntaxError: The requested module './workerInterface.ts' does not provide an
export named 'BaseWorkerContext'
    at core/threadWrapper.ts:5
```

`BaseWorkerContext` is an `interface` (`core/workerInterface.ts:62`) imported as a **value**
(`core/threadWrapper.ts:5`). Node 24 runs TypeScript by **erasing types, not compiling them**, so the
named import survives erasure and resolves to nothing. Deno 2.9.6 imports the same file with no
diagnostic.

**This is `RT-R9`'s failure class, one repository up** — a construct every typechecker accepts and
Node's loader refuses — and it is why the two runtimes cannot take the same road to the same library.
Raised upstream as [S9](../scheduler-upstream.md).

> **FIXED UPSTREAM 2026-09-07, in `fyflow-scheduler` 0.5.2 — this heading is now HISTORY, and the
> conclusion it supports survives on a different reason.** [W37](../work-items/w37-the-scheduler-pin-moves-to-0-5-2.md).
> `core/threadWrapper.ts:5` is `import type` and `core/workerManager.ts:3` — a second instance
> upstream found itself — with it; the measurement above **no longer reproduces**. Against the JSR
> 0.5.2 source, `node --input-type=module -e "import('./index.ts')"` prints `LOADED under node
> 24.20.0 - exports: 10`.
>
> **So *Node cannot* is no longer why the two runtimes take different roads.** They still do, and
> the reason is now the only one left: `dist/` is **what an npm consumer actually gets**, so running
> ladder L6 against it tests the published artifact rather than a source tree no consumer resolves —
> which is what `check-scheduler`'s `D4` and `D5` exist to inspect. Pointing Node at the source
> would delete that coverage to gain nothing.
>
> Kept rather than rewritten because it is the evidence rules 3 and 5 were decided on, and because
> [`doc/decisions/README.md`](README.md) says an ADR is **superseded, never edited into a different
> decision**, and that correcting a false statement inside one is *"done in place with the correction
> left visible, dated, and attributed"* — which is what this note is. *(This cited `doc/workflow.md`
> section 3 for a sentence that document does not contain; section 3 is *Ids and files*. A false
> citation inside a decision record, found by W37's conformity reader.)*

### 3. A **typed** `.ts` worker does run under Node 24 — `AGENTS.md` section 3 was stale *(fixed at 0.5.2 — see the note below)*

The sibling's reference says *"The file must be JavaScript. Node cannot import TypeScript, so a `.ts`
worker fails with `Unknown file extension \".ts\"`"*. Measured at Node 24.20.0, a worker with
parameter types, a return type, an `interface` and `import type` runs **both** `inline: true` and
`inline: false`. Deno runs the same file.

That matters here because it removes the premise [Q33](../open-questions.md)'s leaning rested on —
*"a real worker file per runtime"* — and lets **one** worker file serve Node and Deno. Also
[S9](../scheduler-upstream.md).

> **FIXED UPSTREAM 2026-09-07, in 0.5.2 — so the heading's second clause is now HISTORY and the
> finding it supports is unchanged.** [W37](../work-items/w37-the-scheduler-pin-moves-to-0-5-2.md).
> §3 no longer says *"the file must be JavaScript"*: it **version-qualifies**, and correctly —
> a `.ts` worker works on **Node >= 22.18** (and 23.6), and **Node < 22.18 genuinely cannot**, which
> is a range this package still supports and which the sentence above did not name. So the reference
> is no longer stale; **our own finding was the narrower one**, true of Node 24 and silent about the
> floor, and upstream's version of it is better than what we reported.
>
> The finding itself stands: one `.ts` worker does serve Node and Deno here, `examples/` ships
> exactly one, and `RT-R10` is unchanged.
>
> *(This is the heading [W37](../work-items/w37-the-scheduler-pin-moves-to-0-5-2.md)'s `Outputs` row
> named — it said "ADR 0013 rule 3" — and the item annotated finding **2** instead and left this one.
> Its conformity reader. The document has `### 1-4` findings AND `## Decision` rules 1-5, so "rule 3"
> was ambiguous before it was wrong; the two annotated passages are findings 2 and 3.)*

### 4. Nothing in the published source may import it, and nothing does

[ADR 0001](0001-routing-executes-in-the-driver-outside-the-scheduler.md) rule 2 and
`spec/runtime-targets.md` `RT-R2` already imply it; `src/driver/driver.ts` already honours it. What
did not exist is a **check**, and this is the fifth time in this repository that a declared property
had no rung.

## Decision

1. **`fyflow-scheduler` is a `devDependency` and never a runtime one.** The published npm package and
   the published JSR package declare **no dependency on it**, because no published file imports it:
   `SchedulerLike` and `TaskFactory` stay structural, and a caller passes its own scheduler in.
   Consumers choose and install their own version.
2. **The check is `S7` in `scripts/check-source.mjs`** — no published file may name `fyflow-scheduler`
   or reach into `../fyflow-scheduler`, in any import form. Ladder L0. Rule 1 without it is a hope.
3. **The pinned 0.3.0 is reached from the working tree next door**, because no registry has it:
   - **Node** — `devDependencies["fyflow-scheduler"] = "file:../fyflow-scheduler"`, which npm links
     and whose `exports` resolve to `dist/node/index.js` and `dist/types/index.d.ts`.
   - **Deno** — a standalone import map, `examples/deno-import-map.json`, mapping the same bare
     specifier to `../fyflow-scheduler/index.ts`, passed with `--import-map` by the L6 runner only.
     **It is not in `deno.json`**: that file is the JSR publish manifest, and an `imports` entry there
     would put a path outside the package into what we publish.
4. **The specifier is bare in source; the resolution is configuration.** No file under `examples/**`
   writes a path into the sibling repository. This is `RT-R2` applied where a per-runtime difference
   is genuine: it lives in two configuration files, not in an `if`.
5. **Node reads the sibling's *build* and Deno reads its *source*, so the gate checks they are the
   same version.** `scripts/check-scheduler.mjs` (L0) asserts the linked package's `version` equals
   the pin, and that `dist/node/index.js` is **not older than any file in the sibling's own
   `deno.json` publish allowlist**. It fails with the command to run — `npm run build` in
   `../fyflow-scheduler`.
6. **The browser reaches the scheduler not at all.** L6 does not run there ([Q33](../open-questions.md)),
   and L6 lives in `examples/**`, which `scripts/build-browser-tests.mjs`'s
   `test/**/*.test.ts` glob does not reach. **`S9` is what makes that structural** — see the
   *Correction* below, because the first version of this rule claimed the glob itself was the
   mechanism and it is not.

## Consequences

**What this makes easy.** The library keeps the property that made W3 testable: it depends on nothing
and a consumer brings their own scheduler. Nothing about this decision is visible to a consumer at
all — `npm install fyflow-orchestration` pulls no scheduler, and neither does `deno add`.

**What this makes hard, and the cost is real and unhidden.**

1. **`npm install` in this repository requires `../fyflow-scheduler` to be checked out beside it.**
   Without the sibling, install fails. Three repos, one stack, one maintainer (`doc/README.md`) makes
   that acceptable; it would not be for a public contributor, and it stops being necessary the day
   0.3.0 reaches a registry — at which point rule 3 becomes a version range and rules 1, 2 and 4 are
   unchanged.
2. **Node's fidelity is one build step behind Deno's.** Deno reads `index.ts` and is always exactly
   the source; Node reads `dist/`, which is stale until something rebuilds it. `npm install` runs the
   sibling's `prepare` today, and **npm 11.19 already warns that it may stop** (*"install scripts not
   yet covered by allowScripts"*). More ordinarily: the sibling's source changes without our install
   running. That is what rule 5 exists for, and it is not belt-and-braces — **`../fyflow-scheduler/dist/`
   was found stale at the start of W5**, a pre-0.3.0 build with no `_failOrphanedTask` and no
   `getAdmissionQueue` in it, sitting behind a `package.json` that reads `0.3.0`.
3. **Running the gate rebuilds a directory in another repository.** `dist/` is gitignored and
   untracked there (`../fyflow-scheduler/.gitignore`), so it is build output and not a working-tree
   edit — but it is the only write this repository makes outside itself, and it is stated rather than
   discovered.

**What a future reader is likely to try that this forbids.** Adding `fyflow-scheduler` to
`dependencies` or `peerDependencies` so that `import { FyflowScheduler }` works inside `src/`. It
would typecheck, it would pass every existing check, and it would end
[ADR 0001](0001-routing-executes-in-the-driver-outside-the-scheduler.md)'s separation quietly — a
driver that can construct a scheduler is a driver that will. Rule 2's `S7` is what refuses it.

**What it does not decide.** Which runtimes L6 runs in — that is [Q33](../open-questions.md),
answered separately by W5 with the cost this ADR measured. And whether the JSR/npm asymmetry should
change our own release story (`spec/runtime-targets.md` section 5): we publish to both, the sibling
publishes to both, and only its *newest* version is missing from both. Nothing here is evidence for
changing that.

## Alternatives rejected

| | why not |
|---|---|
| **Depend on the registry version, `0.2.1`** | It is not what we pin, and the difference is not cosmetic: 0.2.1 is the version whose silently dropped orphaned task is **indistinguishable from a stuck join** — the threat [P1](../plans/p1-what-satisfies-a-join.md) declared against its own validity and retired at 0.3.0. Running P1's one real fan-out flow against it would put that second cause back under the plan's exit artifact |
| **Import the sibling's TypeScript source directly from `examples/**`** | **Dead under Node**, measured — context fact 2. It also hard-codes `../../fyflow-scheduler/...` into every example file, which rule 4 forbids for the ordinary reason: the path is a fact about one machine's directory layout, not about the code |
| **Vendor a bundle of the sibling's source with our own esbuild, into `dev-dist/`** | Genuinely tempting — it is exact-source for **both** runtimes and needs no build next door, which kills cost 2 outright. Rejected on ladder L0: esbuild emits no `.d.ts`, so `examples/**` would typecheck against `any` and the rung that catches a wrong `WorkerManager` option would be gone. It also needs a non-bare specifier (`#scheduler` or a relative path into `dev-dist/`), which is neither what a consumer writes nor what rule 4 allows. **Revisit if the freshness check turns out to fire often** |
| **Put the Deno mapping in `deno.json`'s `imports`** | Measured working, and rejected: `deno.json` is the **JSR publish manifest**. A mapping to `../fyflow-scheduler/index.ts` there is a path outside the package sitting in what we publish, kept correct only by nothing using it. `--import-map` gives the same resolution — workers inherit it, measured — in a file only the L6 runner reads |
| **Vendor the scheduler into `node_modules/` from a build script** | Makes the bare specifier work in Node with no manifest entry, and breaks the first time anyone runs `npm ci`. A resolution that a standard command deletes is not a resolution |
| **A `peerDependency` instead of a `devDependency`** | It would be the right shape *if* we had a runtime dependency, and we do not — rule 1. Declaring one would tell every consumer to install a library our published code never imports, which is a false statement in a manifest |

## Correction — 2026-08-30

**Found by both of W5's review passes, independently, and each measured it.** Neither changes the
decision; both were sentences that were not true.

**1. Rule 6 claimed a mechanism that did not exist.** It read: *"no `test/**` suite imports it — so
`scripts/build-browser-tests.mjs`, which globs `test/**/*.test.ts`, never sees it. **L6 living in
`examples/**` rather than in `test/**` is what makes that structural** rather than a note someone
has to remember."* The premise is true and the conclusion does not follow. The glob is what would
carry a scheduler import **into** the browser bundle, not what keeps one out: a future
`test/**/*.test.ts` that imports the scheduler is bundled by that same glob, and the sibling ships a
`browser` export condition, so esbuild resolves it happily. Measured — one reader bundled it
directly, the other ran the build script and watched `dev-dist/browser/tests.js` grow by 55 KB with
the scheduler's internals in it, `check-source` returning 0 throughout.

**`S9` in `scripts/check-source.mjs` is now that mechanism** — no file in the browser bundle's input
set may import the scheduler — and it is negative-tested. The claim and the check now match; before,
only the claim existed.

This is the third instance in this repository of *a correct observation about one tool generalised
into a claim about the toolchain* (`spec/runtime-targets.md` section 3 records the other two, about
`*.node.ts` and about a Node global's build-time visibility) — and the second time it has happened
**inside a document written to record that failure mode**.

**2. Rule 5 says "not older than **any file** in the sibling's own publish allowlist"; the check
excludes one.** `core/workerWrapperUrl.ts` is rewritten by the sibling's own build
(`esbuild.config.js:253-268`), so its mtime is always seconds *after* the dist it produced and
comparing against it makes the check fail immediately after every successful build. The exclusion is
correct and cited in the code; it was not in the ADR, so the ADR stated a rule the implementation
deliberately narrows. Rule 5 should be read as *"any file the sibling's build does not itself
rewrite"*.

**A third thing, not a correction but a gap the same passes found:** rules 1 and 4 had **no check at
all** — rule 1's manifest half (nothing refused a `dependencies` or `peerDependencies` entry naming
the scheduler, which this ADR's own *Alternatives rejected* calls *"a false statement in a
manifest"*) and rule 4's *"no file under `examples/**` writes a path into the sibling"*. `S8` and
`S10` are those checks. `S7` also missed **`@fyflow/scheduler`**, the JSR name this ADR's own Context
measured as existing — the form a Deno consumer actually writes in source. All are closed and
negative-tested.

**One thing this ADR did not say and should have**, found by the reviewer running in a git worktree:
a `file:../fyflow-scheduler` devDependency **does not resolve from a git worktree**, because the
relative path is taken from the worktree's own directory. *Consequences* cost 1 says install
*"requires `../fyflow-scheduler` to be checked out beside it"*; a worktree is not beside it, and
every reviewer of this repository runs in one.
