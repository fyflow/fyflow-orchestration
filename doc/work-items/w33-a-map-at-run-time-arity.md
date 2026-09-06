# W33 — A map at run-time arity: the driver, the three policies, and N = 0

**Status:** todo
**Plan:** [P10](../plans/p10-is-fan-out-one-feature-or-two.md) — *is fan-out one feature or two?*

```
Spec:       spec/join-policy.md sections 2-4, spec/run-state.md section 3,
            spec/flow-definition.md section 4 (W32's, read not written)
Owns:       src/driver/driver.ts, src/driver/events.ts, src/driver/policy.ts,
            src/fold/**, spec/join-policy.md, test/driver/**, test/fold/**
Inputs:     W32's definition shape and branchPath contract, from W32's own file.
            P10 section 2 facts 3, 4 and 5 — one of three policies reads
            region.branches; arrival-count fires EARLY at run-time arity; N=0 is
            `waiting` in all three.
Outputs:    A driver that opens N branches from a previous node's output and
            dispatches N distinct task ids.
            A verdict for each of the three policies at run-time arity, and for N=0,
            in spec/join-policy.md — a rule, a restatement, or a stated refusal to
            add one.
            The region event stream for a map, asserted against spec/join-policy.md
            section 2's vocabulary rather than against what the driver emitted.
            RunState for a map run, through fold(driver.foldInputs()).
Depends on: W32
Blocks:     W34
Tests:      test/driver/** at ladder L2 — a fixture log of outcomes in, an asserted
            node sequence and event stream out, no scheduler.
            test/fold/** for the fold and for L3.
            The L5 matrix is W34's; this item asserts the policies directly.
Gate:       L0-L3, L5, then the spec-conformity pass (two readers)
Reserves:   Q160-Q163
```

## Scope

**In**

1. **The driver opens N branches**, N taken from the previous node's output, and dispatches **N
   distinct task ids**. P10 fact 2 measured that the ids are already expressible — 500 distinct at
   500 indices — so this is the derivation W32 changed being used, not a new id format.
2. **`JP-R5` at run-time arity.** *Every `branch.opened` for a region precedes any other event for
   it* is what makes a live-token count meaningful, and the shipped `fanout` arm emits them all
   before dispatching any. **A map must not lose that** — the arity is known only once the previous
   node settles, which is a different point in the traversal.
3. **The three policies.** P10 fact 3 measured that **only `arrival-count` reads
   `region.branches`**, and that `live-token` and `live-token-requiring-arrival` answer identically
   at N=3, N=7 and N=1. **This item is where that stops being a measurement over hand-built event
   streams and becomes one over a real region**, which is the gap P10 prediction 2 names: *"it does
   not follow that nothing else about it is arity-dependent."*
4. **`arrival-count`'s early fire — P10 fact 4, and it is the sharp one.** With `need` fixed from a
   branch list the run does not use, the join reports `satisfied` on the **first** arrival with two
   branches still live. **A join fired while its branches are still running is not the hang W4's
   matrix recorded**; it routes the successor over an unfinished region. `arrival-count` is not what
   an application passes (ADR 0003 rule 1) and it **is** a matrix column that must keep answering, so
   this item decides what it answers and writes it in `spec/join-policy.md` rather than leaving the
   column to mean two things.
5. **N = 0 — P10 fact 5.** An empty input list opens no branch and is `waiting` in **all three**
   policies, because ADR 0003's *"having been positive"* is false. **`FD-V9`'s arity floor means the
   static feature can never produce it**; a map produces it the first time a filter returns nothing.
   This is the one place a map is not the static feature at a different arity. Its answer is a
   decision — a fourth region event, a verdict, or a definition-level refusal — and **it is taken
   here, in the document that owns the policies**, not invented in the matrix.
6. **The fold.** `RunState.outcome` for a map run, including the N=0 run, through
   `fold(driver.foldInputs())` — the whole of turning a run into run state
   ([ADR 0014](../decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md)).

**Out** — named rather than left implicit, with where it goes instead

- **What the join carries.** It stays **`null`**, deliberately: P10's decision 2 puts
  [Q36](../open-questions.md) in **W34**, *after* this item runs, so the rule is written from cases
  rather than from a mechanism. **This item must not quietly pick a payload**, and `settleJoin` still
  taking no payload parameter is what keeps that visible.
- **What a branch receives**, and [Q154](../open-questions.md)'s sibling aliasing. **W34.**
- **The matrix.** `test/matrix/**` is W34's. This item asserts the policies directly, which is the
  half W15 found a rule-written set blind to.
- **Real workers.** **W35.** Nothing here needs a scheduler, and if L2 is hard to write for a map
  *"the driver has reached for the scheduler somewhere it should not have"* (`doc/workflow.md`
  section 4) — **that is this item's first review question of itself.**
- **[Q37](../open-questions.md)** — who asks whether a join is stuck. A map makes the poll no worse
  and no better.

## Verification

| Clause | How it is run |
|---|---|
| **L0** | `npm run lint`, `npm run typecheck` |
| **L1** | `npm run test`, `npm run test:deno`, `npm run test:browser` — unit tests over the policies and the fold. **chromium only** unless `test:browser:all` is named |
| **L2** | `test/driver/**` — a fixture log in, an asserted node sequence and region-event stream out, **no scheduler**. The cheap rung and the important one |
| **L3** | determinism — fold the same log twice and deep-compare. **[Q155](../open-questions.md) applies**: routing is already decided by the time the fold sees anything, so L3 here is a statement about the fold and not about the map's arity decision. Say so rather than reporting L3 green as though it covered it |
| **L5** | `npm run check:policies` and `npm run check:policies:selftest` — `JP-R9`'s two halves, which go red if a policy id and `spec/join-policy.md` section 3 disagree |
| **conformity** | spec first, code second |
| **adequacy** | mutation in an isolated copy, walking the rule ids |

**Routing cases** (`doc/workflow.md` section 5 rule 6): a branch **routed away from its join**
([Q4](../open-questions.md)) is covered and is the case a map makes newly interesting, because the
branches routed away are ones nothing declared. **`user_action`** ([Q17](../open-questions.md)) is
covered — a suspended branch is still live and a map must not change that. A **duplicate task id**
([Q13](../open-questions.md)) is covered at the dispatch layer, which is `ID-R1`'s refusal and the
thing P10 fact 2 measured firing. A **nested fan-out** ([Q6](../open-questions.md)) is covered to the
extent of not regressing ADR 0030. **No matching decision edge** ([Q10](../open-questions.md)) is
**not applicable** — a map's arity is not a decision edge.

**Rule 8, all five obligations, re-run after the readers with their edits checked in.** Two to
instantiate deliberately: **(d), the LOOP BOUNDS** — a map is a loop whose bound is the whole point,
and *"can one entry leave, can the whole list leave, does anything count it from a source other than
itself"* is this item's central question about its own tests; and **(e), the WIRING** — P10
prediction 3. A policy that is opened and never stepped, a region event emitted to the observer and
not to the policy, and an `arrival-count` column that is registered and never run are its three
shapes here.

## Record

*Filled in when the item is done. Delete the italic lines.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L0 | | |
| L1 | | |
| L2 | | |
| L3 | | |
| L5 | | |
| conformity reader | | |
| adequacy reader | | mutations run, survivors |
| re-run at `<sha>` | | |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| | | |

**What broke.**

**What this taught.** *Including a verdict on P10's prediction 2 — that `live-token` needs no
change — which is this item's to confirm or reverse.*

**Questions raised.**
