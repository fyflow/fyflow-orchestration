---
id: ADR 0029
title: "The scheduler is a registry dependency, and nothing in this repository reaches a working tree"
status: accepted
date: "2026-08-31"
item: ""
raised-by: ""
supersedes: ADR 0013 rules 3 and 5
amends: ""
resolves: ""
---

# ADR 0029 — The scheduler is a registry dependency, and nothing in this repository reaches a working tree

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
   `"fyflow-scheduler": "0.5.2"` in `devDependencies` — not a range, and never a `file:` specifier.
   [ADR 0013](0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md) rule 1
   is **unchanged**: `SchedulerLike` is a two-method structural interface, the published npm and JSR
   packages depend on the scheduler **not at all**, and `check-source.mjs` `S7` and `S8` still refuse
   the two ways that could break.

   > **The second sentence EXPIRED on 2026-09-11 — [ADR 0048](0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md)
   > supersedes ADR 0013 rule 1.** Writing *"rule 1 is unchanged"* here was ADR 0013's own
   > prediction followed — its Consequences cost 1 says that when the pin reaches a registry *"rules
   > 1, 2 and 4 are unchanged"* — so this note is not a correction of this decision. What this
   > decision DID remove is the fact that made a `peerDependency` *"a false statement in a
   > manifest"*, and ADR 0048 is where that alternative was finally priced and taken. The published
   > packages now DEPEND on the scheduler (a peer at the pin, a
   > `jsr:` import in `deno.json`); `S7` refuses every reach but the bare specifier rather than every
   > reach; `S8` refuses a second declaration and a path rather than a declaration. **The first
   > sentence is untouched**: the gate still installs the scheduler as a registry devDependency at
   > the exact pin, which is this rule's own subject. Recorded rather than edited, per
   > [`README.md`](README.md)'s correction convention.
2. **Deno reaches it from JSR, at the same version.** `examples/deno-import-map.json` maps the bare
   `fyflow-scheduler` specifier to `jsr:@fyflow/scheduler@0.5.2`. Node reaches npm and gets `dist/`;
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
`package.json` and `examples/deno-import-map.json` both carry `0.5.2`, and `D3` is what makes
forgetting one of them a failure rather than a silent divergence.

**What is unchanged and should not be re-litigated.** [Q33](../questions/q33.md)'s answer — L6 runs
in Node **and** Deno — stands, and so does half of the reason: a typed `.ts` worker runs fine under
Node 24.

> **The other half EXPIRED on 2026-09-07 and the conclusion did not.** This paragraph read *"and
> Node cannot load the scheduler's source because `core/threadWrapper.ts` value-imports an
> `interface`. That is still true of the JSR package's source and is still S9."* **It is no longer
> true**: [S9](../scheduler-upstream.md) was raised and **fixed in 0.5.2 the same day**, and the JSR
> source now loads under Node — measured, `LOADED under node 24.20.0 - exports: 10`
> ([W37](../work-items/w37-the-scheduler-pin-moves-to-0-5-2.md)).
>
> **Rule 2 stands unchanged, on the reason that is now the only one.** Node reads npm's `dist/`
> because that is **what an npm consumer gets**: L6 then tests the published artifact rather than a
> source tree no consumer resolves, which is what `D4` and `D5` inspect. Deno reads JSR's source
> because that is what a JSR consumer gets. *The split was never really about capability — it was
> about testing what each registry publishes — and while Node's incapacity existed it was doing the
> arguing.*
>
> Recorded rather than quietly edited, because this is `CLAUDE.md`'s own standing warning — **a
> leaning's argument is worth checking before its conclusion is** — arriving as an upstream fix
> instead of as a measurement. An agent inheriting *"Node cannot load the source"* would design
> around a constraint that no longer exists.

**What this does not decide.** Whether this library should ever depend on the scheduler at runtime —
it should not, that is ADR 0013 rule 1 and it is untouched. *(**Decided YES on 2026-09-11 by
[ADR 0048](0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md)**, which
supersedes that rule; the sentence stays as the record of what this decision believed it was leaving
alone.)* Which version to pin next
([Q3](../questions/q3.md)) — **0.5.2 since 2026-09-08**, and a bump still means re-reading
`AGENTS.md` section 6 because there is still **no changelog**. *(This read 0.3.0 when the ADR was
written; the pin has moved twice since, by W36 and [W37](../work-items/w37-the-scheduler-pin-moves-to-0-5-2.md).)*

## Alternatives rejected

| | why not |
|---|---|
| **Keep the working-tree link and just be careful with recursive deletes** | The rule would be *"never let any tool recurse through `node_modules`"*, which is not a rule anyone can follow — installers, cleanups and editors all do. And the specific tool here was `git worktree remove`, run in service of a workflow rule this repository adopted **to make review safer** |
| **Keep the link and forbid worktrees** | It inverts the fix: `doc/workflow.md` v0.6 requires the adequacy reader to work in an isolated copy after three reader pairs collided on one checkout. The isolation was right; the dependency edge was what turned it into a deletion |
| **`npm link` / `pnpm workspace` instead of `file:`** | Same edge, same recursive-delete exposure, and one more mechanism to explain |
| **Vendor the scheduler's `dist/` into this repository** | It would make `check-source.mjs` `S7`'s job harder for no gain, and a vendored build goes stale exactly the way the sibling's did |
| **Point Deno at npm too** (`npm:fyflow-scheduler@0.3.0`) | Defensible, and it would collapse `D3` to nothing. Refused because Deno would then load `dist/`, and reading the **source** under Deno is what has twice surfaced things `dist/` hides — including the `import type` defect that is [S9](../scheduler-upstream.md). Two roads to one version is a feature; two versions is the bug, and `D3` is the difference |
