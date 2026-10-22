---
id: ADR 0128
title: "What a node was handed is read by replaying the run to its composition"
status: accepted
date: "2026-10-22"
item: W205
raised-by: P42
supersedes: ""
amends: ""
resolves: ""
---

# ADR 0128 — What a node was handed is read by replaying the run to its composition

**Status:** accepted — [P42](../plans/p42-what-a-node-was-handed-asked-after-the-fact.md) decisions 1-9 and stop-and-asks
(a)-(e), all answered by the maintainer 2026-10-22 as recommended; written by
[W205](../work-items/w205-what-a-node-was-handed-read-by-replaying-the-run.md). It defines `spec/run-state.md` v0.34
(`RN-R45`, and `RN-R25`'s handle). It moves no existing rule: [ADR 0065](0065-a-resume-replays-the-stored-stimuli-refuses-what-it-cannot-regenerate-and-re-dispatches-what-was-in-flight.md)'s
replay is reused and NOT amended, and [ADR 0046](0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)'s
*a run retains what its tasks returned, not what they were handed* is kept: nothing new is retained.

## Context

fyflow-app's *pass 3* asked what a Task was handed — the first question a person asks of a wrong result — and what
reached each end of a run. No surface answered: the state keeps an ASK's input (`RN-R37`) and no task's (P35 decision 1,
ADR 0046, [Q19](../questions/q19.md)), and `pathEnded` records where a path ended and neither on which branch nor with
what. The app proposed a pure function over `RunState` that is *the driver's composition, not a second one*. **Those two
cannot both hold** (P42 fact 3): `RunState` lacks the entry payload (the header is no fold input), which edge each node
took (no task's `selectEdge` is recorded), what was visible AT dispatch (a final state can hold more — an `all` or a
`"n?"` read whose later siblings settled after it, a join that fired early), and a gate's memory. A function over it
re-implements `compose`, `JP-R11` and `JP-R12` at a second site, which [ADR 0040](0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
rule 2 refuses — and is still inexact.

**The one thing that composes exactly already exists**: `resume()`'s replay (`RN-R19`, `RN-R20`) re-enters the entry from
the header's payload and re-runs `enter`, `compose` and `dispatch` exactly, fed the stored stimuli, every regenerated
element compared with the stored one, every dispatch HELD. W205 measured what it keeps: a resume's replay holds EVERY
dispatch's config — 2,001 entries and 157,971 B of composed payloads at 2,000 items, 8,001 and 631,971 B at 8,000 — until
the resume knows what is in flight.

## Decision

**What a node was handed is read by building a driver for the stored run, DEAF, and replaying the stored events until the
target's composition** — the export `inputOf(flow, options, { header, events }, target)` and, for a live run,
`RunHandle.inputOf(target)`, which is the export over the run's own `checkpoint()`.

1. **It is the driver's composition, not a second one.** The reading's driver is built exactly as `runtime.resume` builds
   one (`RN-R25`): the definition, the registry's members, the `joinPolicy` (`liveToken` when omitted), the two
   runtime-wide options — **and no callback, no `createTask`, no scheduler it can hand anything to**: `InputOfOptions` is a
   `Pick` of the members routing reads, and the reading destructures them by name, so a callback in the object handed is
   never read. No line of `compose`, `resolveReference`, `dispatch`, `selectEdge` or a region arm is written twice.
2. **The cut is consulted at three sites and no others**: in `enter`, right after `compose`, for every kind but a task —
   a join's ARRIVAL included; in `dispatch`, where a task's envelope is built (the replay's held branch); and in a join's
   firing, where its collection is built. **An offer is TAKEN only once the node's OWN element — the first it appends —
   has been compared with the stored one at a stored position** (`RN-R20`): a task's `dispatched` and a join's
   `joinSettled` are already appended at their sites; for every other kind `append` confirms the offer at the next
   element. So a composition the stored run never made — a changed predicate routing INTO the target — is refused
   `diverged` at that element, never answered. *(P42 prediction 2 said two sites; the third is where the envelope is built,
   and the confirmation is what makes the cut exact rather than optimistic.)*
3. **The target**: a node id and a branch path, for ANY node kind; a node id ALONE, which answers EVERY path the replay
   reached it on, in the order it reached them, at the cost of one replay to the stored end (P42 decision 4 — nothing a
   consumer holds names an end's paths, so asking path by path costs one replay per candidate); or a task id — a task's
   or an ask's — which names both. A node's path is the path its own element carries: a task's and an ask's their id's, a
   gate's its `gated` element's, a fanout's and a map's their own, an end's the branch that reached it (its `branch.exited`
   path), a join's arrival the ARRIVING branch's, a join's collection its OPENER's. **A path target answers the FIRST
   composition on its path, in replay order**: an end shared by two SIBLING regions (`end` is exempt from `FD-V19`) can be
   reached twice on one path — W205's conformity reader constructed it — and only the node id alone lists both, told apart
   by their order. *(Carrying the region on the answer would tell them apart; it is a surface no decision took, so the
   limit is stated instead.)*
4. **The answer, per kind** (P42 decision 3), each `{ nodeId, kind, branchPath, handed, value }`:

   | kind | `handed` | `value` |
   |---|---|---|
   | task | `envelope` | `{ settings, input, transform? }` — what `dispatch` built for `createTask`, BEFORE any transform (ADR 0051); one dispatch per task id, so retries and a resolution share it |
   | ask | `received` | what `enter` composed — equal to its `asked` element's `input` |
   | gate, fanout, map, end | `received` | what `enter` composed for it on that path; a gate's what its type was asked of; an end's what reached it |
   | join, at an arriving branch's path | `arrival` | what that branch carried in — a LATE arrival after an early firing included |
   | join, at its opener's path | `collection` | what it handed on when it fired (`collectArrivals`) — never its successor's answer |

   An arriving path is the opener's plus one segment, so no target names both (W205 measured 51 arrivals at depths 1 and
   2 over the valid corpus: none coincides). **The value is handed AS THE READING'S DRIVER BUILT IT**: not copied again and
   not frozen beyond what the composition froze — a value a `needs` reference composed is that driver's shared frozen copy
   (ADR 0126), the rest the caller's own — and it reaches nothing a live run holds, because the reading's driver is its own
   and is dropped when the reading returns.
5. **The refusals are RETURNED, never thrown**: `format` and `flow` — `resumeRefusal`'s HEADER half, split out as one
   function both call, its order and messages unmoved — and `format` too for a header `runId` of the right type that is no
   run id (`ID-R2`), checked before a driver exists (W205's conformity reader: it threw); `unknown` — a target this run's ids cannot name; `not-reached`;
   `diverged`, by its position. **A halted, cancelled or stopped run IS READ**: `resumeRefusal`'s other half refuses
   CONTINUING such a run, never reading it. The prefix a reading verifies **ends at the first `halted`, `stopped` (0.7.0's
   name for it) or `cancelRequested` element**, because only a consumer's callback, a refused result or an owner's call
   appends those and a replay cannot regenerate them; what follows is `not-reached`, never `diverged`. A stored
   `interrupted`, `paused`, `unpaused`, `resumed` or `cancelled` settlement is FED and read through. It throws only what
   `new Driver` throws for a definition or a registry that cannot run, as a resume does.
6. **It holds no dispatch's config**: a reading's replay keeps `held` EMPTY — only the answers it returns are kept.
7. **The count is private** (ADR 0121 rule 7): the reading's own `replay.reading` counts the stored stimuli it was FED and
   the stored elements it COMPARED, reached through `Driver.read`, the private static the export is.

## Consequences

1. **It costs the run's prefix up to the target — O(run) at worst, never O(the answer).** Counted, clock-free, on a map of
   n items whose instances each reach an end: the first instance's reading is fed **2** stored stimuli at 2,000 and at 8,000
   items and compares **2n + 5** elements; the last's is fed **n + 1** and compares **5n + 2** of the stored 5n + 5
   (`test/fold/input-of-cost.test.ts`). **The fed count is constant for the first instance and the element count is NOT**:
   a map opens every instance in ONE step (`JP-R5`), and a step is replayed whole up to the cut. Timed once in a fresh
   process each (W205's Record; a reading, not a gate entry — [Q179](../questions/q179.md)): the last instance's `post`
   reading its own `work` — ADR 0124 consequence 1's shape — **35 / 138 / 263 ms at 2,000 / 8,000 / 16,000 items in node
   24.20.0, 52 / 166 / 352 in deno 2.9.6**, beside ADR 0124's 68 / 223 / 442 and 79 / 258 / 560 for that whole run live (W205's own re-take of it on this machine, before
   any edit: 66 / 198 / 380 and 69 / 237 / 491).
2. **A live answer and a stored one cannot differ**: `handle.inputOf` is the export over `checkpoint()`. Each call copies
   the run's events and replays them; nothing is cached, and a reading appends nothing to the live run.
3. **A reading re-runs the run's predicates and gate types**, as a resume does (ADR 0002 rule 4, [Q9](../questions/q9.md)):
   an impure one diverges, or answers what its re-run computes.
4. **What it does not detect, by construction**: a definition or a registry changed AFTER the target — the cut verifies
   the prefix it replays — and **a change that moves an ENVELOPE and no ELEMENT, even at the target**: the stored events
   carry no payload (P23 fact 2), so a node's settings or `needs` changed under the same flow id and version are answered
   with the definition the reading is handed. A flow that changes is a new version (P23 decision 7).
5. **A node whose own element a halt PREEMPTED is `not-reached`**: a gate whose type answered a route it does not declare
   (`FD-R5`) appends no element of its own before the halt, so the stored run holds nothing that verifies it was entered;
   the halt's `reason` names it.
6. **`RunHandle` gains `inputOf` — BREAKING for code that BUILDS a handle**, as `state` was in 0.9.0. A new root export
   and its types (`inputOf`, `InputTarget`, `InputOfOptions`, `InputReading`, `NodeInput`, `HandedAs`,
   `InputRefusalReason`); no existing signature, element, kind, cell, checkpoint field or `CHECKPOINT_FORMAT` moves, and
   every `resume()` refusal and message is unmoved.

## Alternatives rejected

| | why not |
|---|---|
| **A pure function over `RunState`** (P42 (a2)) | inexact — the entry payload, the edge each node took, what was visible at dispatch and a gate's memory are not in it — and a second routing derivation, which ADR 0040 rule 2 and ADR 0001 refuse |
| **Record every input** (P42 (a3)) | against P35 decision 1, ADR 0046 and Q19's bound — a payload retained per dispatched node — and the app's own preference |
| **The POST-transform input** (P42 (b2)) | asynchronous, a language runtime in the reader, and a value no driver ever held (ADR 0051) — raised as [Q760](../questions/q760.md) |
| **`branchPath` on `pathEnded`** (P42 (d2)) | `pathEnded` is regenerated by a replay and compared by `sameData`, so a field an older checkpoint's element lacks refuses it `diverged`, unless `CHECKPOINT_FORMAT` moves and refuses every older one — and it gives the branch, not the value |
| **Taking an offer at the composition, unconfirmed** | answers a composition the stored run never made: a changed predicate routing INTO an end the stored run never reached would be answered rather than refused, since nothing is compared between the composition and the end's own element — the reason for rule 2's confirmation, pinned by W205's `diverged` case |
| **Keeping resume's halt and cancel refusals for a reading** | they are refusals of CONTINUING a run; a reading of a halted or cancelled run is exactly the postmortem a person needs |
