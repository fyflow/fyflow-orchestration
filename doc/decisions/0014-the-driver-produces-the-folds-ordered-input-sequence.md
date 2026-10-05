---
id: ADR 0014
title: "The driver produces the fold's ordered input sequence, and it is the log with the routing facts interleaved"
status: accepted
date: "2026-08-30"
item: W5
raised-by: Q41, P1
supersedes: ""
amends: ""
resolves: ""
---

# ADR 0014 — The driver produces the fold's ordered input sequence, and it is the log with the routing facts interleaved

**Status:** accepted — **one clause corrected in place, 2026-08-30**, see *Correction*
**Raised by:** [Q41](../open-questions.md), taken by [W5](../work-items/w5-one-real-fan-out-flow-on-a-real-scheduler.md)
under [P1](../plans/p1-what-satisfies-a-join.md)

## Context

`doc/concept.md` section 5 has carried one structural idea since the first day:

> **Run state is a pure fold of an event log. The driver is the only thing with side effects.**

[Q14](../open-questions.md) answered *whose* log — ours — and `spec/run-state.md` made the fold real.
Then W2's own spec-conformity pass found that two of section 3's claims were not derivable from a log
of settlements alone, and added `dispatched` and `pathEnded` as inputs so the claims stayed claims
rather than being narrowed into unobservability. `FoldInput` ended up with five variants.

**Nothing produced that value.** `spec/run-state.md` section 6 says so in as many words, and hands it
to W5:

> `FoldInput` interleaves records, region events, dispatches, path ends and a stop into one ordered
> value, and **nothing produces that value yet** […] The ordered sequence `RN-R3` and `OR-R5` are
> *about* does not exist as a thing you can hold.

Four channels, no shared order: records left through `snapshot()` (an array), region events through
`onRegionEvent` (a callback), dispatches through nothing at all, and a refusal through
`onRunFailure` (another callback). And **`pathEnded` had no producer anywhere** — a path reaching an
`end` node was reported only as a *region* event, and only when the path was inside a region; outside
one the driver reported nothing. So `RN-R3`'s *"the log is read in append order and never sorted"*
was a rule about a sequence a caller had to reconstruct by guessing.

Q41 recorded two objections and they are both real:

| against | |
|---|---|
| the driver owns it | *"that would give the driver a second copy of run truth, which W3's scope forbids"* |
| the fold subscribes | *"the fold would stop being pure"* |

**W5 is what forced the choice, and the forcing argument is the gate rather than the tidiness.**
Ladder L6's hard question is *how do you know a real run is over without racing*. The three
available answers were all wrong: `scheduler.completed` fires **every time the scheduler drains**
and will fire between steps of any flow; sampling `stats` reads `queued=0 running=0` for a scheduler
that is genuinely stalled (`AGENTS.md`, the `idleTimeout: 0` note); and a `setTimeout` is how a green
L6 gets written that proves nothing. The honest answer needs no clock — **a run is over when its
run-state outcome leaves `running` and `awaiting_action`** — and that answer requires the sequence to
exist.

## Decision

1. **The driver holds one ordered array of `FoldInput` and it is the only ordered thing in the
   driver.** Every fact the fold consumes is appended to it, in one place, in the order it happened:
   the two record kinds, region events, dispatches, path ends, join settlements
   ([ADR 0015](0015-a-run-whose-join-can-no-longer-fire-is-stuck.md)) and a stop.
2. **`Driver.foldInputs()` returns a frozen copy of it**, and `fold(driver.foldInputs())` is the
   whole of turning a run into run state. `snapshot()` is unchanged and is now defined as **the
   record-kind subsequence** of the same sequence.
3. **`DriverOptions.onFoldInput` is the push half**, called with each element as it is appended, so a
   consumer can fold incrementally and observe a run finishing without polling anything.
4. **This is not a second copy of run truth, and the distinction is not a word game.** The driver
   holds the *log plus the routing facts no record carries*; it computes no run state and answers no
   question about one. `fold` is still the only thing that produces `RunState`, and it is still pure
   — `RN-R1` is untouched, and ladder L3 still checks it.
5. **A path end is reported whether or not the path is inside a region.** `spec/run-state.md`
   section 3 discriminates `completed` from `failed` by how a **path** ended, which is a run-level
   fact; the region events are the same fact seen from inside a region and do not replace it.
6. **Append order is fixed at each site and is part of the contract**, because a fold over a prefix
   is meaningful (`RN-R2`):
   - a **dispatch** is appended **before** `addTask`, so an outcome can never precede the dispatch
     that caused it;
   - a **region event** is appended **after** the policy has stepped, so an `onFoldInput` listener
     asking `joinStatusOf` sees the status that event produced;
   - a **path end** is appended **after** its region event and **before** `settleJoin`, so a join's
     downstream dispatch cannot precede the path end that led to it.

## Consequences

**What this makes easy.** A real run can be folded — which, before W5, had never been done at all:
every run state this repository had computed came from a hand-written fixture. It also makes the L6
harness race-free and clock-free, and it is what `spec/run-state.md`'s `RN-R2` was for: a caller can
fold a prefix of a live run and get a defined answer.

**What this makes hard, and the cost is real.**

1. **The driver keeps two arrays.** `log` is the record-kind subsequence, held separately because
   `effectiveOutcome` and `isSuspended` scan it on every settlement and rebuilding it by filter each
   time is quadratic. It holds the same record objects by reference, never copies — but it is
   redundant state, and redundant state drifts. `test/driver/` asserts the two agree, so the
   redundancy is **checked rather than trusted**, which is the least this repository accepts after
   four conformity passes found untested claims.
2. **`onFoldInput` is a fifth callback on `DriverOptions`.** The surface is now five outbound edges
   and one inbound. That is a lot for one class, and it is the shape [Q21](../open-questions.md)
   would replace with an event family if we ever become a source for `fyflow-react-components`.
3. **A consumer can now hold something that looks like run truth and is not.** `foldInputs()` returns
   an ordered sequence with a `stopped` element in it; someone will read it directly instead of
   folding it. The frozen copies stop them corrupting the driver; nothing stops them reimplementing
   the fold badly.

**What a future reader is likely to try that this forbids.** Making the fold subscribe to the driver
— an `attachFold(driver)` that keeps a `RunState` up to date. It is the obvious ergonomic next step
and it ends `RN-R1`: a fold with a subscription has a lifetime, a fold with a lifetime has state
between calls, and ladder L3's *"fold the same log twice and deep-compare"* stops meaning anything.
The composition belongs to the **caller**, which is what `onFoldInput` is: the driver pushes, the
caller decides what to do with it, and `fold` never learns that a driver exists.

**What it does not decide.** Whether the sequence is what gets persisted
([Q15](../open-questions.md)) — it is the obvious candidate and `RN-R2` is what would make it
additive, but nothing here commits to it. Nor whether `foldInputs()` should be bounded
([Q19](../open-questions.md)): it grows with the run, exactly as the log did, and this decision adds
four element kinds to that growth without measuring it.

## Alternatives rejected

| | why not |
|---|---|
| **Leave it: the caller composes the sequence from the four channels** | This *is* the status quo, and it is unimplementable rather than merely inconvenient. Two of the six kinds are not observable from outside at all — a dispatch has no callback, and `pathEnded` has no producer anywhere — so no caller can build the sequence however carefully it tries. Q41 was filed as an ergonomics question and it is a **capability** gap |
| **The fold subscribes to the driver** | Ends `RN-R1`. See above; this is the one the decision spends a paragraph forbidding |
| **A separate `RunRecorder` class that subscribes to all the driver's callbacks** | The shape Q41's own wording suggests, and it does not work: the two missing kinds would still have to be added to the driver for the recorder to hear them, so the driver changes either way — and then the recorder exists only to concatenate things that were already in order. It also makes the ordering *emergent* from callback registration order rather than fixed at each site, which rule 6 exists to prevent |
| **Put the sequence in `snapshot()` and change its type** | Would break every existing caller and every W2/W4 fixture, to save one method. `snapshot()` keeps its meaning — the log — and gains a definition it did not have |
| **A `pathEnded` region event instead of a `FoldInput` kind** | `spec/join-policy.md` section 2 fixes **six** region events and `JP-R4` says the driver forwards all of them to the policy. A seventh would be handed to `step()`, where it is meaningless, and would change a document W1 owns to carry a fact that is not about regions at all — a path ending outside a region is the case that motivated this |

## Correction — 2026-08-30

**Found by W5's test-adequacy pass**, which mutated each of this ADR's numbered rules in turn.

**The *Context* argument was not under test, and it is the argument this ADR rests on.** It says
L6's hard question is *"how do you know a real run is over without racing"*, that the honest answer
needs no clock, and that *"that answer requires the sequence to exist"*. The reviewer replaced the
whole termination mechanism in `examples/run-flow.ts` with `setTimeout(1)` and **all 72 L6
assertions still passed** — `await scheduler.shutdown()` drains the run while the incremental fold
keeps advancing, so every value read afterwards is correct anyway. The clock-free termination was
true of the code and established by nothing.

`RunReport.finishedBy` now records **which of the two ended the wait**, and every row asserts it was
the run-state predicate. The mutation now fails nine assertions across the eight rows. The decision
is unchanged; what changed is that its central claim is now falsifiable.

**Two of rule 6's three ordering clauses had no test either**, and both now do: clause 6b (*a region
event is appended after the policy has stepped*) had none at all — the test is an `onFoldInput`
listener that asks `joinStatusOf` and reads the count the event just produced; clause 6c (*a path end
precedes the join dispatch*) was tested only on the `end`-node route and not on the
`no-eligible-edge` route, which is the one where a join becomes satisfiable **because a branch was
lost** and is therefore the family P1 is about. **The first attempt at that second test passed
vacuously** — it used `spec/examples/valid/fanout-failure.flow.json`, whose optional node has an
`on: ["failed"]` edge and therefore *exits* rather than being lost, so the branch under test was
never entered. It now uses W4's `matrix-optional-lost`, the only flow in the repository that reaches
`branch.lost` by settling.

**Rule 2's "frozen copy" was tested for `onFoldInput` and for `snapshot()` and not for
`foldInputs()`** — the one the rule names. Returning the live array survived both suites.

**And cost 1's own wording overstates what is checked.** It says `log` *"holds the same record
objects, never copies"* and that `test/driver/` asserts the two agree — the assertion compares them
**by `taskId`**, not by identity, so a copy would be silent. Left as it is rather than tightened: the
property that matters is that the two sequences describe the same settlements in the same order, and
that is what is asserted. The sentence should be read as *the same settlements*, not *the same
objects*.
