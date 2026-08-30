# P3 — A consumer reference the gate keeps true

**Status:** in progress — W9 declared
**Question this plan answers:** *What does a consumer actually need in order to use this library —
and can a reference be kept true by the **gate** rather than by discipline?*
**Exit artifact:** `AGENTS.md`, and **every snippet in it extracted and executed by `npm run gate`**.
**Reserves:** W9-W11, Q71-Q80, ADR 0019-0021

**P2 is not closed.** Its work item is done and its **retro is still owed** —
`doc/workflow.md` section 6 pass 3, and it is the first plan to run the amended document, so its
retro has more to judge than most. P3 opens alongside it at the maintainer's direction rather than
after it, and the debt is recorded here so it is not lost.

---

## Why this plan

[Q64](../open-questions.md): **nothing in this repository tells a consumer how to use the library.**
`README.md` is a pitch, `doc/` is a record of how the work was done, `spec/` is normative for *us*,
and `examples/README.md` says in as many words that it is a gate rather than a starting point.
`index.ts` exports **38 names** and no document walks a caller through instantiating a `Driver`.

That was tolerable while nothing was built. It is not now: the layer is complete enough that the
next person to touch it may be a consumer rather than an author.

## The question is the second half, not the first

*"Write documentation"* is not a question and would not earn a plan. **The question is whether a
reference can be kept true mechanically**, and this repository has an unusually strong reason to
care: **eleven of its thirteen reader-passes found a written claim nobody had run.** A hand-written
API reference is that failure mode with a larger surface and no reader assigned to it.

**The sibling has already tried the weaker form and reported the result.**
`../fyflow-scheduler/tests/suites/docs.ts` transcribes each published snippet into a test by hand,
and its own header says why:

> *"If an API changes, these fail and the docs get fixed with the code, **instead of rotting silently
> the way `onCompleteDescendants()` and the benchmark efficiency metric both did**."*

Transcription is better than nothing and it is still a copy kept in step by a person. **Extraction is
not**: if the snippet in the document is the code that runs, a stale snippet is a failing gate rather
than a lie.

## The mechanism, measured before this plan was written

The [ADR 0013](../decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)
pattern again. A spike, before any of this was declared:

| | |
|---|---|
| fenced blocks tagged ` ```ts run ` and ` ```ts check ` are extracted, written to `dev-dist/`, typechecked together and the `run` ones executed | **works** |
| the bare specifier `from 'fyflow-orchestration'` — **what a consumer actually writes** — is rewritten to a relative path by the extractor | **works**, so the published snippet is realistic *and* runnable |
| `from 'fyflow-scheduler'` needs no rewriting | resolves through `node_modules`, per ADR 0013 |
| Node runs the extracted `.ts` directly | type stripping, no build step |

The spike's first extracted snippet already returned a real value — `validateDefinition` on a
malformed document reporting `FD-V3` — which is the shape the whole plan is for.

## What this plan expects to find, and it is not documentation

**Writing a consumer reference is the first time this library's public surface is described from the
outside.** The likely findings are about the surface, not the prose:

- `index.ts` exports **38 names**; a consumer needs a handful. The rest are internals a reference
  will have to either explain or exclude, and exclusion is a claim about what is public.
- `DriverOptions` requires `createTask`, `workerTypes` **and** `predicates` — a factory the consumer
  writes, plus a list the scheduler already has. A reference has to justify each or report it.
- [Q53](../open-questions.md) is already open on `Driver`'s multi-run surface saying one thing while
  `ID-R3` says another. A reference cannot describe both.

**If the reference is hard to write, that is the finding**, and it goes in the Record rather than
being smoothed over in prose.

## Scope

**In**

1. **`AGENTS.md`** — one file, mirroring the sibling's shape so the three repositories read alike:
   what the library is, a minimal working program, the definition format, decisions, fan-out and
   join, failure and suspension, run state, refusals, common mistakes, and **what does not exist**.
2. **`scripts/check-docs.mjs`** — extract, typecheck, execute. A new L0/L1 clause in `npm run gate`,
   **negative-tested at birth** (`doc/workflow.md` v0.3 section 5 rule 7).
3. **Every snippet tagged**, with `run` the default expectation. A block that is neither `run` nor
   `check` is a prose illustration and **must carry a reason**, because an unchecked snippet in a
   reference is the thing this plan exists to prevent.

**Out** — named rather than left implicit

- **A documentation site, or multiple pages.** One file, as the sibling has. Splitting is a decision
  with no evidence behind it yet.
- **Changing the public surface.** If the reference exposes that `index.ts` exports too much or
  `DriverOptions` asks too much, that is a **finding**, not a refactor: it is W3's surface and it
  would be its own work item.
- **A `LICENSE` file.** `README.md` records that there is none; adding one is the maintainer's, not
  a documentation task.
- **Publishing.** Nothing here is released, and a reference does not change that.

## Work items

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W9 | The reference and the extractor that keeps it true | `AGENTS.md`, `scripts/check-docs.mjs` | P1, P2's W6 | L0-L1 — every snippet typechecks and every `run` snippet executes; then two readers |

W10 and W11 are reserved and unallocated.

## Record

*Filled in at the join.*
