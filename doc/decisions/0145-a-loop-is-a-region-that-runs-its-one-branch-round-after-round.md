---
id: ADR 0145
title: "A loop is a region that runs its one branch round after round, read from outside as a map is"
status: accepted
date: "2026-11-14"
item: W228
raised-by: P47
supersedes: ""
amends: ""
resolves: Q810, Q582
---

# ADR 0145 — A loop is a region that runs its one branch round after round, read from outside as a map is

**Raised by:** [P47](../plans/p47-what-may-repeat-in-a-flow-and-how-a-round-hands-on-to-the-next.md), decisions 1-6, the
maintainer's (2026-11-13; decision 1 revised to (b′) on 2026-11-14). Decided by
[W228](../work-items/w228-the-loop-in-the-definition.md). Reopens [Q582](../questions/q582.md), which W230 resolves.

## Context

`FD-V10` refuses every cycle, so *do this again until it is good enough* cannot be written as a flow.
[Q582](../questions/q582.md) deferred that at P32 until *the first case neither `retryPolicy` nor a `map` covers*.
fyflow-app's pass 8 #2 is that case: a training round of several nodes on their own pools (a `map` over environments,
`train`, `evaluate`), run until an evaluation passes; and *poll until finished*; and *refine until accepted*. One task per
round loses the scheduling and the per-node view; one RUN per round shows one loop as many runs.

| measured at P47's declaration (byte copy of `df60b9e`, node 24) | |
|---|---|
| fact 12 | a `map` region modelled as the body — a training shape and a polling shape, each breaking through an `end` — gives **0 findings** from every region rule |
| fact 13 | a reader after that region naming a body node in the array form gives **0 findings**: a map accepts it (ADR 0044) |
| fact 14 | a node is named from another at exactly two sites, a node's `needs` and an edge's |
| fact 15 | an `if` gate's condition has ONE root, `input` — the scope `until` needs |
| fact 16 | a prefix inside one routing step already reads `stuck` today, so a loop's arrive/decide/open window is not new if it happens in one synchronous step |

And, at W228, before the spec was written: the driver's `visibleOutputs` returns only the outputs a node SETTLED, grouped
by the shared-depth key and sorted by `compareBranchPaths` — so a map instance that never reached a node contributes
nothing, in index order. That is the reading decision 1 (b′) rests on, confirmed in code rather than assumed.

## Decision

1. **A `loop` is an eighth node kind opening ONE region whose one branch runs ROUND AFTER ROUND** — a `map` whose
   instances run one after another, each round opened only once the last arrived. Keys: `branch` (a `task` or an `ask`),
   `until` (a comparison or flat group over the one root `input`), `maxIterations` (an integer `>= 1`),
   `maxIterationsFrom?` (a key path, only LOWERING the bound), `needs?` (the seed); no `edges`. Its join is an ordinary
   `join` with `of`.
2. **The carry is a value, not an arc.** Round 0's entry receives the loop's value; round *i > 0*'s receives what round
   *i − 1* arrived at the join with. `reaches`, the four sets and `FD-V10` are unmoved, so the outer graph and the body
   both stay acyclic — the four things Q582 says assume no cycle are untouched by construction.
3. **A round's index is a DISPATCH-side branch-path segment**, as a map instance's is: `ID-R6` widened, the id grammar
   unchanged, `flowAttempt` `0`.
4. **A body node is read from OUTSIDE the loop as a map instance's is** — `["n"]` every round in round order, a round that
   routed around `n` contributing nothing; `"n"` refused by `FD-V28`. **Inside the body a reference is the reader's own
   round's.** No refusal is added for reading into a loop and no `collect` key exists.
5. **What leaves the loop is its join value `{ last, iterations, exhausted, broke?: { at, value } }`**, `last` the state —
   what the last round ARRIVED AT THE JOIN with, the output of the body node whose edge reached it (the maintainer's
   (a1) to W228's conformity reader, F1: this said *so it always has the entry's input shape*, false wherever the entry
   declares `needs`) — and an `end` whose innermost region is the loop's is a BREAK (an `end` in a nested region ends
   that region's branch or round: the maintainer's (b1), F2). On a break `last` is the state the breaking round STARTED with — the SEED if round 0
   broke — so the wiring check gives a breakable loop's join a second `record` arc, `last` the seed's shape: the
   maintainer's (d1). The join takes no policy. Its
   contents and when it fires are W229's (`spec/join-policy.md`).
6. **The bound is in the document** — `maxIterations` is required — so rounds × tasks per round is known before a run.
7. **`FD-V29` is certain of less at a loop's join**: a break fires the join after only a prefix of a round, so what is
   certain there is also intersected with what is certain at every `end` whose innermost region is the loop's.
8. **`needs` stays references only** — [Q810](../questions/q810.md) declined: a constant seed is a transforming node
   before the loop.

## Consequences

- **`spec/flow-definition.md` v0.57**: the kind, `"$iteration"` (`FD-V51` outside a loop), `FD-V50` (the loop's own keys),
  seven rules widened to name it, the wiring check's `round` and `carry` arcs, and the loop's join value as a `record`.
  **47 refusals.** `spec/task-id.md` v0.17.
- **One item ships the rule without the behaviour**, as `map` did at v0.8: until W229 the definition admits a kind no driver
  runs. A `Driver` handed a loop is W229's to make run.
- **The wiring check holds the body entry's `inputSchema` against the loop's value AND against every body node with an
  edge to the join** — the loop's state must be one shape, and a body that changes it is told so before a run.
- **Retention is the map's law** (P47 decision 3): rounds × tasks per round × bytes each returned. A reader after the loop
  naming a body node holds every round's output of it — ONE shared copy (ADR 0126), the same cost a declared collection
  would have had. Compaction is [Q809](../questions/q809.md), deferred, and stays sound because the set of body nodes read
  from outside is stated by the document.

## Alternatives rejected

| alternative | why not |
|---|---|
| a back-edge, `FD-V10` relaxed for one marked edge | every one of Q582's four acyclicity assumptions — the id scheme, `reaches`'s irreflexivity, `FD-V29`'s walk, replay — would need a new argument; the region form needs none |
| **(a)** refuse a reference from outside a loop into its body, and add `collect` | P47 decision 1 as first taken. Its reasons did not hold: the log keeps every round anyway (`RN` section 7), a reader's copy is shared (ADR 0126), and "every round" is not ambiguous — only "the last round" is, and the bare form is already refused. It bought one exit at the price of a rule a `map` does not have and a key duplicating the array form |
| a `map`, `fanout` or `loop` as the body's entry | `FD-V25`'s reasoning: a branch entry is a task or an ask; a small transforming node goes first. Additive later, once measured |
| `delayMs` between rounds | the driver has no clock and a resume replays no time (P47 decision 7) |
| a literal in `needs` for the seed (Q810) | a grammar of references gains an escape form for one use a built-in transforming node already serves |
