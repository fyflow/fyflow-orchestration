# ADR 0029 — The scheduler is a registry dependency, and nothing in this repository reaches a working tree

**Date:** 2026-08-31
**Status:** accepted — **supersedes [ADR 0013](0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md) rules 3 and 5.** Rules 1, 2 and 4 stand unchanged
**Raised by:** the maintainer, after an incident — see *Context*. **Not a plan's decision**, which is why it takes an id outside every reserved block

## Context

**[ADR 0013](0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md) rested
on one measured fact, and that fact has changed.** W5 measured it: `fyflow-scheduler` 0.3.0 was on
**no registry** — npm and JSR both stopped at 0.2.1 — so the only way to reach the version this
repository pins was a `file:../fyflow-scheduler` link into a checkout next door. Everything else in
that ADR followed from it: Node loaded the sibling's gitignored `dist/`, Deno loaded its TypeScript
source through an import map, `npm install` ran a build **in another repository** (the one write this
repository made outside itself, and ADR 0013's stated cost), and `scripts/check-scheduler.mjs`
existed to stop the two runtimes diverging by a stale build.

**Both registries now carry 0.3.0**, measured 2026-08-31:

| | |
|---|---|
| npm | `fyflow-scheduler` — `0.1.0, 0.1.1, 0.2.0, 0.2.1, **0.3.0**`. Ships `dist/node`, `dist/browser`, `dist/types`, and **`AGENTS.md`**, which is the API reference this repository cites constantly |
| JSR | `@fyflow/scheduler` — latest `0.3.0`. Ships the TypeScript source, which is what Deno wants |

**And the working-tree link caused real damage before it was removed.** While running W16's
test-adequacy pass in an isolated `git worktree` — `doc/workflow.md` v0.6's own requirement — a
junction was created at `<worktree>/node_modules/fyflow-scheduler` pointing at the sibling checkout,
so that `tsc` would not typecheck the sibling's source. `git worktree remove --force` then **followed
that junction** and deleted through the real repository until it hit a lock: `.git/`, `core/`,
`index.ts`, `dist/`, `deno.json` and `AGENTS.md` were destroyed, and the checkout was recoverable only
because the maintainer had pushed 0.3.0 publicly.

**That is not an argument against worktrees and it is not really an argument about `--force`.** It is
what a dependency edge into a live working tree *is*: every recursive tool that touches
`node_modules` — a cleanup, a `rm -rf`, an installer, an editor's "clean" command — is one link away
from another repository's source. ADR 0013 accepted that edge because there was no alternative. There
is one now.

## Decision

1. **`fyflow-scheduler` is an ordinary registry devDependency, pinned exactly.**
   `"fyflow-scheduler": "0.3.0"` in `devDependencies` — not a range, and never a `file:` specifier.
   [ADR 0013](0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md) rule 1
   is **unchanged**: `SchedulerLike` is a two-method structural interface, the published npm and JSR
   packages depend on the scheduler **not at all**, and `check-source.mjs` `S7` and `S8` still refuse
   the two ways that could break.
2. **Deno reaches it from JSR, at the same version.** `examples/deno-import-map.json` maps the bare
   `fyflow-scheduler` specifier to `jsr:@fyflow/scheduler@0.3.0`. Node reaches npm and gets `dist/`;
   Deno reaches JSR and gets the source. **The two roads are still different and that is still fine**
   — what matters is that they are the same *version*.
3. **Nothing in this repository resolves the scheduler through a path.** No `file:` dependency, no
   `../fyflow-scheduler` in an import map, no junction or symlink in `node_modules`.
   `scripts/check-scheduler.mjs` `D1`, `D2` and `D3` refuse all three, and a symlink at that path is
   a **named failure** rather than something the check reads through.
4. **`scripts/check-scheduler.mjs` is rewritten, and its subject changes with the dependency.** The
   old `D3`/`D4` compared `dist/` mtimes against the sibling's own publish allowlist, because a build
   can be older than the source beside it. **A published tarball ships no source to be stale against,
   so that comparison is gone.** What replaces it is the hazard the move *created*: two runtimes now
   reach **two registries**, the version is written down twice, and ladder L6 runs in both — so
   `D3` compares the npm pin against the JSR pin. **Same failure, new address.**
5. **The check is negative-tested at birth and the probes are checked in** — `doc/workflow.md` rule 7,
   which the previous version satisfied only in part: W5 provoked it five ways by hand and committed
   none of them. `npm run check:scheduler:selftest` is **12 probes**, each declaring the exact set of
   checks it must trip, and it is in the `gate` chain.
6. **`AGENTS.md` for the scheduler is read at `node_modules/fyflow-scheduler/AGENTS.md`**, not next
   door. It ships in the npm package. Every citation of *"`../fyflow-scheduler/AGENTS.md`"* in this
   repository's documents is corrected to say so, and every markdown link into `../../fyflow-scheduler/`
   is repointed at the public repository — those links went dangling the moment the checkout was
   deleted, which is what a relative link into someone else's working tree always risks.
7. **`deno.lock` is committed.** JSR resolution produces an integrity hash for
   `@fyflow/scheduler@0.3.0`, and that hash is the Deno half of the pin made tamper-evident — a
   property the working-tree link could not have at all, since a local edit next door was invisible
   to everything except `check-scheduler.mjs`'s mtime comparison.

## Consequences

**What this removes, and it is the whole point.**

| | |
|---|---|
| **the edge out of this repository** | Nothing under `node_modules` points anywhere but `node_modules`. The incident above is not reachable, and `D1` refuses the shape that made it reachable |
| **the one write outside itself** | `npm install` no longer runs `prepare` in another repository. ADR 0013 named that as its stated cost *"not an accident"*; it is now not paid at all |
| **the stale-`dist/` hazard** | `../fyflow-scheduler/dist/` was gitignored, was found stale at the start of W5 behind a manifest reading `0.3.0`, and could make L6 run 0.2.x under Node and 0.3.0 under Deno and report both green. A tarball is immutable |
| **a setup precondition** | `README.md` and `CLAUDE.md` told a reader that `npm install` **requires** the sibling checked out beside this repository. `npm install` is now `npm install` |

**What it costs, and both costs are real.**

**A local change to the scheduler is no longer visible here.** The link was not only a workaround —
it meant editing the sibling and immediately running this repository's L6 against the edit. That
round trip now needs a publish, or a temporary `npm link` that ADR rule 3 forbids leaving in place.
**This is the cost to accept knowingly**, and the honest note is that it makes upstream work
(`doc/scheduler-upstream.md`) slower to validate: [S9](../scheduler-upstream.md)'s two one-line
changes cannot be tried locally without unpinning.

**A version bump is now a deliberate act in two files**, and it always could have been one in zero.
`package.json` and `examples/deno-import-map.json` both carry `0.3.0`, and `D3` is what makes
forgetting one of them a failure rather than a silent divergence.

**What is unchanged and should not be re-litigated.** [Q33](../open-questions.md)'s answer — L6 runs
in Node **and** Deno — stands, and so does the reason: a typed `.ts` worker runs fine under Node 24,
and Node cannot load the scheduler's *source* because `core/threadWrapper.ts` value-imports an
`interface`. That is still true of the JSR package's source and is still
[S9](../scheduler-upstream.md). What changed is only where each runtime gets its copy.

**What this does not decide.** Whether this library should ever depend on the scheduler at runtime —
it should not, that is ADR 0013 rule 1 and it is untouched. Which version to pin next
([Q3](../open-questions.md)) — 0.3.0, and a bump means re-reading `AGENTS.md` section 6 because there
is still **no changelog**.

## Alternatives rejected

| | why not |
|---|---|
| **Keep the working-tree link and just be careful with recursive deletes** | The rule would be *"never let any tool recurse through `node_modules`"*, which is not a rule anyone can follow — installers, cleanups and editors all do. And the specific tool here was `git worktree remove`, run in service of a workflow rule this repository adopted **to make review safer** |
| **Keep the link and forbid worktrees** | It inverts the fix: `doc/workflow.md` v0.6 requires the adequacy reader to work in an isolated copy after three reader pairs collided on one checkout. The isolation was right; the dependency edge was what turned it into a deletion |
| **`npm link` / `pnpm workspace` instead of `file:`** | Same edge, same recursive-delete exposure, and one more mechanism to explain |
| **Vendor the scheduler's `dist/` into this repository** | It would make `check-source.mjs` `S7`'s job harder for no gain, and a vendored build goes stale exactly the way the sibling's did |
| **Point Deno at npm too** (`npm:fyflow-scheduler@0.3.0`) | Defensible, and it would collapse `D3` to nothing. Refused because Deno would then load `dist/`, and reading the **source** under Deno is what has twice surfaced things `dist/` hides — including the `import type` defect that is [S9](../scheduler-upstream.md). Two roads to one version is a feature; two versions is the bug, and `D3` is the difference |
