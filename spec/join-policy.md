# spec/join-policy — the interface both join policies sit behind

**Status:** v0.5 — written by [W1](../doc/work-items/w1-the-normative-layer.md) under
[P1](../doc/plans/p1-what-satisfies-a-join.md). **v0.2 acts on the W1 spec-conformity pass**:
`branch.lost` is redefined against
[ADR 0004](../doc/decisions/0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md)
(finding B1), suspension events are added, `JP-R5` closes the ordering hole (B4), `live-token` is
pinned to Q4's own wording (D10), and every rule names the item owing its test (D8). **v0.3 acts on
the second pass**: `branch.exited` was defined against a condition that is never true, and
`branch.lost` could not fire for a resolved branch. **v0.4 acts on the third**: `JP-R5` asserted an
invariant that a legal run breaks, and the Q5 table restated a clause ADR 0004 had corrected.
**v0.5 records what W3's pass found about `JP-R5`'s ordering clause**: it is currently implied by
`FD-V9` and cannot be falsified.
**Normative.**

> **This document does not answer [Q4](../doc/open-questions.md) and must not be read as leaning.**
> It fixes an interface, an event vocabulary, and what each policy *name* means. Which policy is
> correct is settled by **W4**, with the branch-routed-away case as an executable test, and recorded
> as **ADR 0003**. Arrival-counting winning is a real outcome
> (`doc/plans/p1-what-satisfies-a-join.md`).

---

## 1. The interface

A join policy is a pure state machine over one fan-out region.

```
JoinPolicy = {
  id:       string                                  // "arrival-count" | "live-token"
  open:     (region: Region) => S                   // region entered
  step:     (S, ev: RegionEvent) => S               // one event
  status:   (S) => 'waiting' | 'satisfied' | 'unsatisfiable'
  describe: (S) => JsonValue                        // for W4's matrix, and a future UI
}
```

`S` is the policy's own opaque state type. Nothing outside the policy reads it; `describe` is the
only way its contents leave.

`JsonValue` is `null | boolean | number | string | JsonValue[] | { [k: string]: JsonValue }`. It is
**not** the structured-cloneable set that `spec/outcome-record.md` section 4 admits for `result` —
`describe`'s output is for display and for a matrix cell, so it is pinned to JSON.

`Region` is computed at instantiation by [spec/flow-definition.md](flow-definition.md) section 4:

| field | type | |
|---|---|---|
| `fanoutId` | string | |
| `joinId` | string | |
| `branches` | string[] | the fanout's branch entries, **in declaration order**. A branch's index in this array is its `branchPath` segment ([spec/task-id.md](task-id.md)) |
| `members` | string[] | `region(F)`, sorted by node id so the value is stable across folds |

| id | | Test owed by |
|---|---|---|
| `JP-R1` | **Every method is pure.** No clock, no scheduler, no IO, no mutation of `S`. The same `S` and the same event sequence produce the same `S` — this is what makes ladder L3 a real check rather than an aspiration (`doc/concept.md` section 5). Test: run every event sequence in W4's matrix twice and deep-compare | W2 |
| `JP-R2` | **`describe` returns `JsonValue`.** It is how W4's matrix reports *what the policy thought it was waiting for*, and how a UI would ever show a join ([Q21](../doc/open-questions.md)). A policy whose state is not describable is not usable. Test: `JSON.stringify(describe(S))` round-trips for every state in the matrix | W2 |
| `JP-R3` | **`status` is total.** Every reachable `S` answers one of the three. There is no "unknown". Test: every matrix cell asserts one of the three, and no cell is blank | W4 |

## 2. The region event vocabulary

They are **flow-level facts**, not scheduler outcomes: the driver derives them while routing, and a
policy never sees an outcome record or a scheduler task.

**Terminal** — exactly one per branch, and the branch is finished with the region. The three are
mutually exclusive and exhaustive: a branch either reaches the join, reaches an `end`, or runs out
of eligible edges. `FD-V7`, `FD-V8` and `FD-V10` are what make that exhaustive
(`spec/flow-definition.md` section 4, under `FD-V14`).

| event | fields | emitted when |
|---|---|---|
| `branch.arrived` | `branchPath` | that branch reached the region's join |
| `branch.exited` | `branchPath`, `at` (the `end` node's id) | that branch reached an **`end` node** instead of the join |
| `branch.lost` | `branchPath`, `reason` | a node in that branch reached a terminal state — by settling, **or by being resolved** — and **no edge was eligible** for it (`spec/flow-definition.md` section 3), so the path ended inside the region without reaching an `end` node |

**Non-terminal** — the branch is still live and the join is still waiting:

| event | fields | emitted when |
|---|---|---|
| `branch.opened` | `branchPath` | the fanout dispatches that branch |
| `branch.suspended` | `branchPath`, `at` (node id) | a node in that branch settled `user_action` and parked (ADR 0004 rule 3) |
| `branch.resumed` | `branchPath`, `at`, `resolvedAs` | a resolution record for that node was appended (ADR 0004 rule 4) |

### `branch.exited` is defined on what the branch reached, not on where it went

**Stated because the obvious wording is wrong.** *"The branch left the region"* is how this event
reads, and it is never true: `region(F)` is everything reachable from a branch entry cut at the join
(`spec/flow-definition.md` section 4), so the `end` node a routed-away branch reaches is **inside**
`region(F)`. An implementer computing `to ∉ region.members` emits this event never — and `JP-R4`
below says exactly what that costs: *"deleting `branch.exited` makes P1's case unobservable, which
decides Q4 by omission."*

So the condition is **"the branch reached a node of kind `end`"**, which is local, computable from
the definition alone, and does not depend on region membership at all.

### Q5's four cases are three events, and one of the four is not a separate case

[Q5](../doc/open-questions.md) names four ways a branch can fail to succeed. Read against 0.3.0 they
are not four:

| Q5's case | what it is here | |
|---|---|---|
| a branch task **failed** | `branch.lost` with `reason: 'failed'` | by **either** road — an `optional` node settling, or a human resolving a suspended node `failed` (`RS-R3`). See below |
| an **`optional`** branch resolving `null` | **the same event.** `state = 'failed'` and `resolve(null)` are two lines of one branch (`../fyflow-scheduler/core/FyflowScheduler.ts:894-897`), and `resolve(null)` is invisible to a listener | |
| a branch ending in **`user_action`** | `branch.suspended` — **not** a loss. The branch is still live and the join keeps waiting | |
| a branch **routed away** | `branch.exited` | it reached an `end` node — P1's case |

`reason` therefore has exactly one permitted value today, `'failed'` — reached either by an
`optional` node settling, or by a human resolving a suspended node with `resolvedAs: "failed"`
(`RS-R3`), in both cases with no eligible edge to take. **The field is kept anyway**, because the
alternative is adding it back later and rewriting every fixture; and its single value is the finding
rather than an oversight.

| id | | Test owed by |
|---|---|---|
| `JP-R4` | **The vocabulary is sized for the richer policy.** A policy that needs fewer events ignores the rest. Designing it around what arrival-counting needs would delete `branch.exited` and `branch.lost` — and deleting `branch.exited` makes P1's case unobservable, which decides Q4 by omission | W4, as a matrix column that exercises every event |
| `JP-R5` | **At most one terminal event per branch, with nothing after it, and every `branch.opened` for a region precedes any other event for that region.** A branch is `opened` once, may be `suspended`/`resumed` any number of times, and then `arrived`, `exited` or `lost` **at most** once — **not** exactly once: a branch that suspends and is never resolved emits no terminal event at all, which section 4 says is a legal and expected state, and neither does any branch in a run still in flight. An assertion written `count === 1` fails on Q5's `user_action` row. The opening rule is a **driver obligation**, not a policy's problem — see below. **`FD-V22` is what makes the one-`opened`-per-branch half true**: without it a token can enter a branch from outside the region and arrive at a join that never opened it. Test: assert both properties over the event stream of every W5 run, including a run where a branch is resolved | W3 |
| `JP-R6` | **Adding an event is a spec change with its own rationale** (`spec/README.md` rule 1), never a side effect of making a policy work | — |

### JP-R5's ordering clause is currently unfalsifiable, and that is `FD-V9` doing it

**Stated because a reader will otherwise mistake the driver's two-pass emission for the thing making
this true, or mistake a passing test for evidence.** `FD-V9` requires every branch entry to be a
`task`, and entering a task **dispatches without emitting** — so no event can appear between two
`branch.opened`s no matter how the driver is written. W3's conformity pass replaced its two-pass
loop with an interleaved one and the whole suite still passed, because the two implementations are
**behaviourally identical under `FD-V9`**.

Three consequences, and the third is the one that matters:

1. The rule is not redundant. It is **insurance**, and it becomes load-bearing the moment `FD-V9` or
   `FD-V19` is relaxed ([Q27](../doc/open-questions.md)) — a branch entry that is an `end`, or a
   shared node, emits on entry and the order becomes observable.
2. **No test can currently distinguish a conforming driver from a non-conforming one**, so a green
   suite is not evidence for this clause. W3's test asserts the invariant over a real stream, which
   catches a driver that emits `branch.opened` *after* a terminal event; it cannot catch
   interleaving.
3. **A driver written after `FD-V9` is relaxed will not be caught by the existing test**, which is
   why this paragraph exists rather than a `TODO`.

### Why JP-R5 fixes the opening order, and why that is not a thumb on the scale

Without it, `opened(0) → arrived(0) → opened(1)` is a legal stream: a policy counting live branches
sees the count reach zero while branch 1 is still running, and the join fires early. `arrival-count`
is immune, because its `N` comes from `region.branches.length` at `open`.

**The fix belongs in the driver rather than in either policy.** A rule saying *"seed the count from
`branches.length`"* would repair `live-token` by making it more like `arrival-count`, which is a
Q4-relevant change dressed as a bug fix. A rule about **when the driver emits** is neutral between
the two and is true of the real system anyway: a fanout dispatches all its branches in one turn.

## 3. What each policy name means

**This section fixes the names, not the winner.** W4 compares the two policies P1 named; a
comparison against some third thing is a different experiment. Both are pinned to
[Q4](../doc/open-questions.md)'s own wording, and where a pin needed a clarification to be
well-defined at all, the *minimal* one was taken.

| `id` | Definition |
|---|---|
| `arrival-count` | `N` is fixed at `open` from `region.branches.length`. `satisfied` when `N` distinct `branch.arrived` events have been seen. **Never `unsatisfiable`.** Every other event is ignored |
| `live-token` | `open` starts a live count at zero. `branch.opened` increments; `arrived`, `exited` and `lost` each decrement; `suspended` and `resumed` do neither. `satisfied` when the count reaches zero **having been positive**. **Never `unsatisfiable`** |

| id | | Test owed by |
|---|---|---|
| `JP-R7` | **A variant of `arrival-count` that decrements `N` on `branch.exited` is a third policy, not a repair of the first.** If it is built it is built under its own `id` ([Q24](../doc/open-questions.md)) | W4 |
| `JP-R8` | **A variant of `live-token` that requires at least one `branch.arrived` before reporting `satisfied` is likewise a third policy** ([Q24](../doc/open-questions.md)). The `having been positive` clause is a pin, not a refinement: a bare *"count is zero"* is true before any branch opens, so without it `open` itself reports `satisfied` | W4 |

### JP-R7 and JP-R8 — the one-line changes that would delete P1

Arrival-counting fails P1's case because `N` is fixed and one branch never arrives. The obvious fix
is to decrement `N` when `branch.exited` arrives — one line, and it makes arrival-counting survive
the case.

**A W2 implementer who writes that line has answered Q4 before W4 ran**, and the answer is *"the two
policies are equivalent"*, which is false about the two policies the plan named and true only about
a third one nobody proposed. Worse, it would look like a passing test.

`JP-R8` is the same guard pointed the other way, and it exists because **v0.1 of this document
failed it.** `live-token` was written with an extra clause — *satisfied only if at least one branch
arrived, otherwise `unsatisfiable`* — which handed it a graceful answer on the all-branches-exited
row that `arrival-count` was explicitly denied. The argument in `JP-R7` is symmetric and had been
applied in one direction only. Both policies are now pinned to Q4's wording plus the minimum needed
to be well-defined, and **both refinements are Q24**, to be built as named variants if W4's result
makes them interesting. Either may well be the right answer; neither is one of the two things P1 is
measuring.

## 4. `unsatisfiable`, and what it is not

`status` has three values because [Q7](../doc/open-questions.md) needs a stuck join to be
**reportable** rather than observable only as a hang. A stuck join has nothing queued and nothing
running, so no `resource.blocked` fires and `getAdmissionQueue()` is empty — 0.3.0's resource events
make a *scheduler-level* stall legible and say nothing about this one
(`doc/scheduler-upstream.md`). Detection is entirely ours.

**Neither pinned policy ever returns `unsatisfiable`, and that is a result rather than a gap.** It
means P1 ships with no policy that can say *"this join can never fire"*, so a stuck join in W4 is
detected by the driver or not at all — which is precisely the pressure [Q7](../doc/open-questions.md)
describes, now with a name and a place. The value stays in the interface because `JP-R3` requires
`status` to be total for **every** policy, Q24's variants included, and because removing it would
have to be added back by whichever policy wins.

**`unsatisfiable` is not a timeout and does not decide Q7:**

| | owner |
|---|---|
| what a policy returns | this document, section 3 |
| what the driver does when a join is `unsatisfiable`, and how it detects a stuck one when no policy says so | W3 |
| what run-level outcome that becomes | W2 — [Q17](../doc/open-questions.md), [Q25](../doc/open-questions.md) |
| whether a join may time out at all | [Q7](../doc/open-questions.md), W4 |

**A join waiting on a suspended branch is not stuck.** It is waiting on a person, and
`branch.suspended` is what lets anything tell the difference. Reporting *"waiting on a human"* as
*"stuck"* is the specific mistake this event exists to prevent (ADR 0004, *Consequences*).

## 5. What this document does not fix

- **Whether a policy is per-join configurable** rather than global ([Q5](../doc/open-questions.md)).
  P1 runs one policy per whole run so the matrix has two columns rather than a product.
- **Transitivity over nested fan-out** ([Q6](../doc/open-questions.md)). `FD-V15` refuses nested
  fan-out, so no `branchPath` deeper than one element occurs in P1 and the question stays clean for
  P2.
- **The run-level outcome** of a join that never fires. See section 4.
