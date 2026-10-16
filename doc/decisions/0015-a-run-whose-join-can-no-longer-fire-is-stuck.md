---
id: ADR 0015
title: "A run whose join can no longer fire is `stuck`, the fold is what decides it, and `regions` did not already hold the data"
status: accepted
date: "2026-08-30"
item: W5
raised-by: Q43, Q42, P1
supersedes: ""
amends: ""
resolves: ""
---

# ADR 0015 — A run whose join can no longer fire is `stuck`, the fold is what decides it, and `regions` did not already hold the data

**Status:** accepted — **one clause corrected in place, 2026-08-30**, see *Correction*
**Raised by:** [Q43](../questions/q43.md) and [Q42](../questions/q42.md), taken by
[W5](../work-items/w5-one-real-fan-out-flow-on-a-real-scheduler.md) under
[P1](../plans/p1-what-satisfies-a-join.md)

## Context

`spec/run-state.md` v0.2 section 3 lists five run outcomes: `running`, `completed`, `failed`,
`awaiting_action`, `stopped`. W4 folded the `routed-away`-under-`arrival-count` run by hand and it
comes out **`completed`** — every node settled, one path ended at an `end` node, and a join that will
never fire is not consulted by any clause of the precedence.

That is a false statement about the exact run [P1](../plans/p1-what-satisfies-a-join.md) exists to
attribute, published in the same repository as
[ADR 0003](0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md), which spends a
paragraph on *"the failure mode is a silent hang"*. W5 has that run on a **real scheduler** — six
real runs, and one of them is exactly this cell — so the false statement stopped being a hand-fold
and became output.

### `regions` did not already hold the data, and finding that out is most of this decision

[Q43](../questions/q43.md) reads: *"`regions` already records `{0: arrived, 1: exited}`, so the
information is present and the precedence in section 3 does not look at it."*

**That is wrong, and it was found by trying to act on it.** On `p1-routed-away`, `regions.split` is
`{ opened: ["0","1"], settled: { "0": "arrived", "1": "exited" }, suspended: [] }` under **both**
policies. Every branch settles either way — one arrives, one exits — and `RN-R6` guarantees exactly
this: *"two policies folded over one log produce the same `regions`, and differ only in whether the
join fired."* The rule that makes `regions` policy-independent is the rule that makes it unable to
answer this question.

`RN-R6` also says the difference *"shows up in `nodes`"*, and that is true and unusable: under
`live-token` the join routes on and `publish` is dispatched, under `arrival-count` it is not — but
**an absence is only legible against a definition**, and `RN-R4` says a run holds only what its input
sequence says. The fold has no definition and must not acquire one.

So the fix costs **one new fact**, not a precedence tweak. This is the fourth instance of the shape
`spec/run-state.md` section 5 tabulates — a reasonable claim its own inputs cannot supply — and the
section exists because W2's code resolved three of them by narrowing itself until the claim was
unobservable. This one is recorded and paid for instead.

### Where the predicate lives — [Q42](../questions/q42.md), and it is answered by where the data is

Q42 asks where the stuck-join predicate belongs. W4 computed it in a test, from the driver's public
surface: every dispatched task has an outcome, nothing is suspended, the join has not fired. The
register lists three objections — the `Driver` already holds the only copy of run truth, the fold
*"does not know what dispatched means without Q41 wired"*, and leaving it out means every consumer
re-derives three lines.

**[ADR 0014](0014-the-driver-produces-the-folds-ordered-input-sequence.md) removed the objection to
the fold.** `dispatched` is an input, `pathEnded` is an input, and a run's liveness is already
exactly what `RunState.outcome` reports. Once the join fact is in the sequence too, the predicate is
not three lines a consumer writes — it is the outcome the fold already computes.

## Decision

1. **`stuck` is the sixth run outcome.** A run is `stuck` when nothing is running, nothing is
   suspended, and a region has been entered whose join has not fired. `spec/run-state.md` is v0.3 and
   section 3 says so; `RN-R10` is the rule.
2. **`RegionRun` gains `joined: boolean | null`** — `true` the driver routed out of the join, `false`
   a policy reported it unsatisfiable and it never will, `null` neither yet. Fed by a
   `{ kind: 'joinSettled' }` element of the fold's input sequence, appended by the driver in
   `settleJoin` on both exits.
3. **`joined` is a routing fact, not a policy's conclusion, so `RN-R6` stands.** It records that the
   **driver** routed out of the join — an action — and two policies over the same *region events*
   still produce identical `opened`, `settled` and `suspended`. They differ here because they made
   the driver do different things, which is the difference `RN-R6`'s own sentence says shows up
   somewhere.
4. **`stuck` outranks `failed` and `completed`, and nothing else.** Below `stopped` (`RN-R8`), below
   `awaiting_action` and below `running`, because both of those mean the run can still move — a
   suspended branch keeps its join legitimately waiting, which is the whole reason
   `branch.suspended` exists (ADR 0004). Above `failed`, because `failed` is a flow outcome an author
   asked for (*a path ended with no eligible edge*) and this is a defect nobody asked for: reporting
   `failed` would name a cause and hide that the run is not going to terminate.
5. **The stuck-join predicate lives in the fold, as a run outcome — [Q42](../questions/q42.md)
   answered.** Not on `Driver`, which would grow the copy of run truth W3's scope caps; not in a
   test, which is where W4 had to leave it; not re-derived per consumer. `isTerminal(state)` is the
   one-line form a caller wants and it is the fold's.
6. **Nothing in `src/` polls it and nothing times out.** Detection needs no clock — it is decidable
   from the sequence, which is what ADR 0003's *Consequences* already recorded — and
   [Q7](../questions/q7.md) keeps only its *should a join time out for some other reason* half.
   **Who watches a live run is still [Q37](../questions/q37.md)** and is untouched.

## Consequences

**What this makes easy.** A hang is now **reportable rather than observable**: a caller folds and
reads `stuck`, and gets the region that did not join in `regions`. It also makes ladder L6
race-free — the harness resolves when `isTerminal(state)` is true, which for the `arrival-count` runs
is `stuck`. **Before this decision that harness would have reported the hang as a success**, because
the stuck run folded to `completed`, which is a worse failure than hanging.

**What this makes hard, and the cost is real.**

1. **`arrival-count` now produces a *different run outcome*, not just a join that did not fire.**
   That is the point, and it means the two shipped policies are no longer interchangeable at the
   run-state level. ADR 0003 rule 2 keeps `arrival-count` shipped so the matrix stays runnable; a
   reader may now reasonably ask why a policy that yields `stuck` on six of nine rows is exported at
   all. The answer is unchanged and it is a testing answer, not a recommendation.
2. **`RunOutcome` grew, and it is a closed vocabulary consumers switch on.** Q25 settled the
   vocabulary at five two work items ago. Six is not obviously the end: [Q7](../questions/q7.md)'s
   timed-out join, if it ever lands, is the seventh candidate and `RN-R7`'s note already predicts it
   reuses this shape.
3. **`joined` is a field a policy's behaviour writes into run state**, one indirection removed from
   the thing `RN-R6` forbids. Rule 3 is the argument that it is not, and the argument is a
   distinction between *what the driver did* and *what the policy said*. That distinction is real and
   it is thin, and a future field that records a `status` or a `describe` would cross it.
4. ~~**The empty half.** `joined: false` is reachable only from a policy returning `unsatisfiable`,
   and **neither shipped policy ever does**~~ — **CORRECTED 2026-09-01, and it was true when written.**
   `joined: false` is still reachable only from a policy returning `unsatisfiable`, and since
   [ADR 0025](0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md) one
   shipped policy does: `live-token-requiring-arrival` returns it on the all-branches-exited row.
   **It is no longer an assertion about an empty set and no longer covered by a stub** — ladder L6's
   `all-exit / live-token-requiring-arrival` row reaches it on real workers, with the policy's own
   `describe` reported through `onUnsatisfiableJoin` and the run folding to `stuck`
   ([W17](../work-items/w17-the-all-exit-row-at-l6.md)). The reader who should not mistake it for
   coverage is now the reader who should not mistake it for a gap.

**What a future reader is likely to try that this forbids.** Making `stuck` a *timeout*. It is the
first thing the word suggests and it is the opposite of what this is: a clock would turn a decidable
property into a wall-clock guess, and would report a slow run as a broken one. It also forbids
tightening `completed` instead of adding an outcome — *"`completed` requires every region joined"*,
the second option [Q43](../questions/q43.md) offers — because that leaves the stuck run falling
through to `failed` or to nothing, and says the run is over without saying it can never finish.

**What it does not decide.** Whether a stuck run is *recoverable* — [Q38](../questions/q38.md) asks
the same of a `stopped` one and neither is answered here. Nor what a consumer should **do** about a
`stuck` run: there is no cancel ([Q18](../questions/q18.md), [S2](../scheduler-upstream.md)), so
today the honest answer is that it can be reported and abandoned. *(Since [ADR 0104](0104-a-run-its-owner-cancels-is-cancelling-until-its-last-task-has-stopped.md)
(W173) there is one, and the answer is unchanged: a stuck run has nothing in flight to stop, and `driver.cancel` refuses it
as `ended`.)*

## Alternatives rejected

| | why not |
|---|---|
| **Leave it — record Q43 again and let P2 fix it** | The false statement would ship in the same commit as a real run that demonstrates it, which is the position ADR 0003 was already corrected once for being in. W5 is also the only work item that will ever produce the evidence, since it is the only one with a real scheduler |
| **Tighten `completed` to require every region joined, and add no outcome** | [Q43](../questions/q43.md)'s own second option. The run then falls through to `failed` — naming a cause that did not happen — or to nothing, and a `RunOutcome` with a hole is worse than one with a sixth value. It also loses the distinction rule 4 spends its length on |
| **Compute the predicate on `Driver` — `isJoinStuck(fanoutId)`** | W4's shape, promoted. Rejected on W3's scope: the driver holding the only copy of run truth is a cost [ADR 0001](0001-routing-executes-in-the-driver-outside-the-scheduler.md) *accepted* rather than chose, and every question it answers about a run is a reason it can never be dropped ([Q15](../questions/q15.md)). It also splits the answer — *"is the run stuck"* on the driver, *"what is the run"* in the fold |
| **Infer it from `nodes` — the join's successor was never dispatched** | Needs the definition, which the fold does not have and `RN-R4` says it must not acquire. It is also the reading `RN-R6` suggests and it is why that sentence is now qualified |
| **A seventh region event, `join.settled`** | It would be forwarded to `policy.step()` by `JP-R4`, where a policy would be told its own conclusion. `spec/join-policy.md`'s six events are the vocabulary a **policy** consumes; this fact is for the fold |
| **Detect it with a timeout** | A wall-clock guess on top of an already-certain answer, and ADR 0003 already recorded that detection needs no clock. It would also make a slow run indistinguishable from a broken one, which is the failure the timeout was supposed to prevent |

## Correction — 2026-08-30

**Found by W5's two review passes.** The decision is unchanged.

**Rule 6 says *"nothing in `src/` polls it and nothing times out"*, and until the correction to
[ADR 0014](0014-the-driver-produces-the-folds-ordered-input-sequence.md) that was true of `src/` and
unestablished at the gate**: the L6 harness was behaviourally indistinguishable from a timeout-based
one, because replacing its termination predicate with a 1 ms timer passed every assertion. `src/`
never polled and never timed out; what was missing was any test that the *harness* did not. It is
there now.

**`RN-R11`'s wording carried the failure mode this repository keeps finding.** It read *"the one
field a policy's behaviour reaches"*, and that is over-broad: the two policies also produce different
`nodes` (the join's successor is dispatched or is not), different `pathEnds`, and therefore different
`outcome`. **Third occurrence of an over-broad enumeration inside an otherwise-correct claim** — the
others are [ADR 0003](0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)'s dated
correction and [Q43](../questions/q43.md), which is what this ADR was written to fix.
`spec/run-state.md` `RN-R11` now says *the only one decidable without the definition*, which is the
true statement and is the one the conclusion actually needs.

**`RN-R11`'s prescribed test was impossible as worded.** It said *"fold the same region-event stream
under both policies"* — `fold` takes no policy, and a literally identical stream cannot differ in
`joined`, which comes from a `joinSettled` input rather than a region event. The rule now prescribes
the two-driver form, which is what both tests already did.

**Two of `RN-R10`'s own cases had no test**, and both are reachable: a run with **more than one
region** (`some` versus `every` — they differ only when one join fired and another did not, which is
the two-sequential-fan-outs shape of [Q45](../questions/q45.md)), and a **fan-out entry**, which
`FD-V3` permits — it opens a region before anything is dispatched, and without section 3's
nothing-dispatched clause that state is `stuck` and `isTerminal`, so a harness would declare such a
run finished before it started. Both are tested now.

~~**`joined: false` is still an assertion about an empty set for the shipped policies**, as
*Consequences* 4 already said; the driver's emission of it is covered by a stub policy.~~
**CORRECTED 2026-09-01 with *Consequences* 4 above — a shipped policy returns `unsatisfiable` since
ADR 0025 and W17 runs the whole chain on real workers.** W5's
test-adequacy pass names three more empty-set assertions in the L6 gate — `failures`, `lateInputs`
and the unsettled-task list — each of which can only ever be empty in a healthy run. They are
guards rather than coverage, and `lateInputs` earns its place: it is what catches a premature
termination.
