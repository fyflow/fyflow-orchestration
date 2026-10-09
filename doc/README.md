# Documentation index

**What each document here is for, and where the state of the work is.** This file is the
documentation index: a reading order, one status row per document, the sibling map, and where the plan
history is. **It does NOT carry an item's status**, and it is no longer part of the record step —
[Q466](questions/q466.md), answered by the maintainer at
[W115](work-items/w115-the-exit-artifact-and-the-budget-met.md), which
[ADR 0077](decisions/0077-an-item-does-not-write-its-status-into-claude-md.md) consequence 4 left
to a person rather than to the item. **The record step is FOUR files** (`doc/workflow.md` section 1
rule 5), and this is not one of them.

*The `## Current state` block that used to sit here was **489,966 bytes — 91.1% of this file**, and
it is deleted to `git` rather than archived ([P27](plans/p27-what-a-register-row-is.md) decision 2).
**Every one of its 89 status blocks summarised an item or plan file that still exists and still
carries its own Record or Retro** — measured before the cut, with a wrong-owner control, and the
only region it held with no owning file was its own two-word heading. The argument is the
register's rather than the budget's: this file is not in `check:budget`'s always-read set, so its
size cost a session nothing it was told to read — it was 490 KB of status nobody is told to read,
in a file every item grew.*

```bash
npm run state
```

**That is where the state of the work is**, and it cannot go stale because there is no copy to go
stale: the next free `P`/`W`/`Q`/`ADR` id derived two ways with a disagreement printed rather than
resolved, each recent plan's and item's state read from ITS OWN file, and only counts that one file
declares. **A claim about an item's status is read from that item's own file, never from an index**
— `doc/workflow.md` section 1 rule 5, which has said so since v0.9.

## Reading order

| | |
|---|---|
| [concept.md](concept.md) | **Read first.** What we are building, the substrate fact that shapes everything, and the one structural idea - run state is a pure fold of an event log |
| [workflow.md](workflow.md) | **Read before any work item.** The loop, the verification ladder, the test rules, how work is split. Inside its budget since [W115](work-items/w115-the-exit-artifact-and-the-budget-met.md). **The adaptation tables this cell used to send you to are GONE** — 22,898 bytes of them, deleted with the version blocks by [P27](plans/p27-what-a-register-row-is.md) stop-and-ask (b); what stands in their place is a version INDEX and a REFUSAL LEDGER at the end of that file, and each retro's argument is in its own plan's Record. |
| [decisions/](decisions/) | ADR 0001, 0002, 0007. They bind `spec/` rather than being superseded by it - 0007 in particular is what [outcome-record.md](../spec/outcome-record.md) makes checkable |
| [plans/p1-...](plans/p1-what-satisfies-a-join.md) | **Complete.** Five work items, and its Record carries the exit artifact and five proposals for the retro |
| [plans/p2-...](plans/p2-the-non-success-half-on-a-real-scheduler.md) | **Complete, and its Record carries the retro that made this document v0.4.** One question, one work item, no new features. Two facts measured before it was written, both of which changed it |
| [plans/p3-...](plans/p3-a-consumer-reference-the-gate-keeps-true.md) | **Complete, and its Record carries the retro that made `workflow.md` v0.5.** Can a reference be kept true by the gate rather than by discipline? Yes — and the gate covers about **16%** of it. The retro's answer to whether the other 84% is acceptable is the part to read |
| [plans/p4-...](plans/p4-the-drivers-lifetime-and-the-handles-it-gives-out.md) | **Complete, and its Record carries the retro that made `workflow.md` v0.6.** What is a `Driver`'s lifetime, and what makes an inbound event or an outbound handle *this run's*? Three reader-found defects fixed, two ADRs, and **the first plan whose readers found a shipped ADR rule false** |
| [plans/p15-...](plans/p15-what-a-run-retains-and-what-a-result-may-be.md) | *What does a run retain, and what may a result be?* — [Q19](questions/q19.md) and [Q22](questions/q22.md) as one question, and the first plan to take the measured run both rows have asked for since P1. Its *what was measured* section is the part to read: **half of a region-bearing run's footprint is a second copy nothing reads**, and removing it is invisible to every rung |
| [../AGENTS.md](../AGENTS.md) | **The consumer reference** — the only document that describes this library from outside. Every snippet in it is typechecked by the gate, and each one tagged `run` is executed (`scripts/check-docs.mjs`); a snippet tagged `check` is typechecked only |
| [questions/](questions/README.md), and [open-questions.md](open-questions.md), a pointer to it | The register, **one file per question** since [W116](work-items/w116-a-question-is-a-file.md); look one up with `npm run q -- Q17`. **`npm run check:register` holds each file's FORMAT** ([ADR 0079](decisions/0079-a-register-is-files-with-front-matter-and-its-index-is-derived.md)); **nothing checks that what a question says is true**, which W5 found the hard way ([Q43](questions/q43.md)) |
| [scheduler-upstream.md](scheduler-upstream.md) | The wants from `fyflow-scheduler`, one `S` id each, plus **the S-id map for reading `RESOURCE_EVENTS_PLAN.md`**, which uses `fyflow-react-components`' numbering. **Nothing here blocks us**: every want states what we do without it. Each want's state is in that file's Index |
| [../spec/README.md](../spec/README.md) | **The normative layer.** The normative documents beside this index, with their hand-written examples and numbered rules, an example corpus, and the rules for changing it. Five written by W1, [run-state.md](../spec/run-state.md) by W2. |
| [work-items/](work-items/) | One file per work item, each carrying its own `**Status:**` line, which `npm run state` reads — **an item's status is not written here** ([ADR 0077](decisions/0077-an-item-does-not-write-its-status-into-claude-md.md), [Q466](questions/q466.md)). **W7, W8 and W11 are skipped and never reissued; W10 is held for `check-owns.mjs`**, which P2's retro named. [TEMPLATE.md](work-items/TEMPLATE.md) |

## Document status

| Document | Status | Notes |
|---|---|---|
| `concept.md` | **v0.3** | Section 7's *"controlling a run from a UI"* non-goal carries one narrow, cited exception (ADR 0004). Section 2 is the load-bearing part and is verified against the library rather than assumed - **re-checked unchanged at 0.3.0**. **v0.3 updates section 6 only: all four leanings have landed and the table said two were still open.** Everything else has held up unchanged, which is the more interesting half - it was written before a line of code existed |
| `questions/` | live | **One file per question, `q<N>.md`, with front matter** since W116; `open-questions.md` is a pointer kept because links to it still exist. A REFERENCE, looked up with `npm run q`, and **NOT read before every work item** since [W113](work-items/w113-the-register-is-a-reference.md) ([P27](plans/p27-what-a-register-row-is.md) decision 1). The counts are not written here: `npm run check:register` holds the folder (`M7` and `M8` left `check:markdown` with the table), and `npm run state` prints the totals — P27 decision 4, *a fact the tree COMPUTES is not written down*. |
| `workflow.md` | live | **Its version is its own header's, and which retro made each version is its version index**; each retro's argument is in its own plan's Record and in `git` ([P27](plans/p27-what-a-register-row-is.md) stop-and-ask (b)). *This cell was a v0.3-v0.12 changelog, stale since v0.13, and is deleted to `git`* |
| `decisions/` | all accepted | **0023 carries the second in-place *Correction* in this repository** — its rule 1 placed the ownership test after `normalizeEvent`, which made its own rule 3 false. **Which rules a later ADR supersedes is derived**: `npm run adr -- --fields id,superseded-by`. **0003 answers Q4** and carries this repository’s first in-place *Correction*. **W5 wrote 0013-0015 and is the first item to spend its whole ADR block** — one from measuring an environment, one from a gate that could not otherwise be written honestly, one from a register entry being wrong |
| `plans/p1` | **complete — question answered and exit artifact produced** | All five work items built. [ADR 0003](decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) is the answer; `examples/l6.ts` is the artifact. **279 assertions in five runtimes plus 72 at L6 in two.** W4 used Q42-Q50 and ADR 0003; **W5 used Q51-Q52 and ADR 0013-0015** |
| `scheduler-upstream.md` | live | **Each want's state is in that file's Index**, so no count of them is written here. **[S9](scheduler-upstream.md) is the only item this register has ever raised, and it was fixed the same day** in `fyflow-scheduler` 0.5.2 ([W37](work-items/w37-the-scheduler-pin-moves-to-0-5-2.md)) |
| `spec/` | live | `flow-definition`, `task-id`, `outcome-record`, `join-policy`, `runtime-targets`, `run-state`, plus `README.md` itself — and a registry DOCUMENT |

## Sibling repositories

Three repos, one stack, one maintainer. What each owns:

**A sibling checkout is no longer something this repository assumes.** `fyflow-scheduler` is reached
from npm and JSR ([ADR 0029](decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)),
so the rows below link to repositories rather than to directories next door — a relative link into a
checkout is a claim about one machine's layout, and on 2026-08-31 those links went dangling when the
sibling was deleted by a recursive tool following a `node_modules` junction.

| Repo | Owns | Pinned to |
|---|---|---|
| [`fyflow-scheduler`](https://github.com/fyflow/fyflow-scheduler) | executing independent tasks: pools, resource groups, retry, spawn | — |
| **`fyflow-orchestration`** (here) | **control flow**: sequence, decision, fan-out, join | `package.json` |
| `fyflow-react-components` | visualizing a scheduler: collector, wire envelopes, React components | scheduler 0.2.1; 0.3.0 is what unblocks its `3a`/`3b` views |

Deliberate overlaps, which are coordination points rather than duplication:

1. **The same structural invariant.** Their view model is a pure fold of the scheduler's event
   stream; our run state is a pure fold of an outcome log. Adopted knowingly ([concept.md](concept.md)
   section 5), because it is what makes both testable without a live scheduler.
2. **Three questions are literally shared** - `user_action` at the top level (our Q17, their Q16),
   unbounded retention (our Q19, their Q14), one-driver-one-scheduler (our Q20, their Q15).
   **Answering these differently in two repos is a bug with two homes.**
3. **Two upstream wants were shared** - our S4/S5 are their S2/S1. Both are now answered via that repo (S4 implemented, S5 deferred), so the joint-raise is done. What remains shared is the *pattern*: raise once, from whichever repo has the stronger case. **Their S8 is our S8** and is the one that changed our architecture.
4. **They cannot see flow structure.** Which node, which branch, what a join is waiting on - none of
   it reaches the scheduler, so no UI can show it today. Whether we become a second envelope source
   family for them is [Q21](questions/q21.md).

**Cite another repo's ids with its name attached, always.** Two Q sequences, same questions
(`workflow.md` section 3).

## Plan history

Each plan is one file under `doc/plans/`, carrying its own question and its own account of how it
ended; `npm run state` reads the most recent plans' state from their own files. **No per-plan table is
kept here.** The one that stood here, one row per closed plan from P1 to P26, stopped behind the plans
it indexed three times — at P5, at P9 and at P26 — and once this file left the record step
([Q466](questions/q466.md)) nothing was obliged to append to it. Every row summarised a plan file that
still exists, so it is deleted to `git` (its last form is at `2b48046`, already public):
[P27](plans/p27-what-a-register-row-is.md) decision 2, *a cut thing keeps a one-line entry and its
commit*, and decision 4, *a fact the tree COMPUTES is not written down* — the list of plans is the
directory.
