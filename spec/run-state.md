# spec/run-state — what a run holds, and what it is derived from

**Status:** v0.4 — written by [W2](../doc/work-items/w2-the-fold-and-both-join-policies.md) under
[P1](../doc/plans/p1-what-satisfies-a-join.md).
**v0.3 is [W5](../doc/work-items/w5-one-real-fan-out-flow-on-a-real-scheduler.md)'s**, and it changes
two things this document said were open: **section 6's last bullet is done** — the input sequence
exists and the driver produces it
([ADR 0014](../doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md)) — and
**section 3 gains a sixth outcome, `stuck`**
([ADR 0015](../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md)), because v0.2
called a permanently stuck run `completed`. Section 5 gains a **fourth row**: the claim that
`regions` already held the data to know better was itself a claim its own inputs could not supply.
**Normative.**
**The document `spec/README.md` has marked *"not written — W2"* since W1**, and the reason it waited
is the whole of section 1: whether run state is a fold at all is
[Q14](../doc/open-questions.md), and W2 is the item that tests it. A spec that answered it first
would have made W2's gate vacuous.

**v0.2 acts on W2's own spec-conformity pass**, which found v0.1 asserting three things the fold's
inputs could not supply — and the code silently resolving each in its own favour rather than
reporting the conflict, which is exactly what `spec/README.md` rule 2 forbids. What changed is
recorded in section 6 rather than quietly edited away.

---

## 1. Q14, answered: run state is a fold of **our** log, and of nothing else

`doc/concept.md` section 5 carried this as a leaning from the first day:

> **Run state is a pure fold of an event log. The driver is the only thing with side effects.**

The open half was *whose* log — our own flow-level one, the scheduler's task events, or ours
wrapping theirs. **It is ours, and the distinction is not stylistic.**

| | why not |
|---|---|
| the scheduler's task events | They cannot see flow structure. *"Branch taken"*, *"join satisfied"*, *"branch suspended"* do not exist at that level, and `doc/concept.md` section 2 is the reason: **the library has no dependency graph**, so there is nothing in its events to carry them |
| ours wrapping theirs | An event's `detail` is a live object ([ADR 0007](../doc/decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md)), so a log that retained them would be a bag of aliases. The normalization at the listener boundary is what makes the log a log, and once it exists there is nothing left to wrap |

**What makes this an answer rather than a restated leaning** is that the fold is now the only thing
that produces run state, and two rungs check it: `RN-R1`'s purity, and ladder L3 folding the same
log twice and deep-comparing. A fold that read `scheduler.tasks`, memoised across calls, or called
`Date.now()` would pass a green suite and fail both.

| id | | Test owed by |
|---|---|---|
| `RN-R1` | **The fold is pure.** `fold(log)` reads nothing but `log`. No clock, no scheduler, no IO, no module-level mutation, and no memoisation across calls. Test: fold the same array twice into two independent values and deep-compare; and fold a log whose records were built with different clock values, asserting the state does not carry them | W2 |
| `RN-R2` | **The fold is total over any prefix.** Folding the first `n` records of a log is defined for every `n`, and folding `n` then applying record `n+1` equals folding `n+1`. This is what makes a run observable *while it runs* rather than only at the end, and it is what [Q15](../doc/open-questions.md) needs if durability is ever added | W2 |
| `RN-R3` | **The log is read in append order and never sorted** (`OR-R5`). Two settlements can share a millisecond, `schedulerTimestamp` is the scheduler's clock and `observedAt` is ours, and neither is a total order | W2 |

## 2. What a run holds

```jsonc
{
  "runId": "r7c1f",
  "flowId": "p1-routed-away",
  "outcome": "running",              // section 3
  "nodes": {                         // one entry per DISPATCHED task, keyed by task id
    "r7c1f:scoreB:1:0": {
      "nodeId": "scoreB",
      "branchPath": "1",
      "state": "suspended",          // section 4
      "result": { "score": 0.41 },
      "error": null
    }
  },
  "regions": {                       // one entry per fan-out region ENTERED
    "split": {
      "opened": ["0", "1"],
      "settled": { "0": "arrived", "1": "exited" },
      "suspended": [],
      "joined": true                 // v0.3 - did the DRIVER route out of the join
    }
  },
  "pathEnds": [                      // how each path ended; what separates completed from failed
    { "reason": "end", "at": "abandoned" }
  ],
  "stoppedBy": null                  // set when a refusal terminated the run (OR-R10)
}
```

| id | | Test owed by |
|---|---|---|
| `RN-R4` | **A run holds only what its input sequence says.** Every field above is derived; none is supplied from outside. A node absent from `nodes` **was never dispatched** — which is only true because `dispatched` is an input (section 6); without it, absence would also mean "in flight", and the rule would be false | W2 |
| `RN-R5` | **`nodes` is keyed by task id, not by node id.** A node inside a fan-out has one entry per branch, and [spec/task-id.md](task-id.md)'s total parse is what recovers `(nodeId, branchPath, attempt)` from the key. Keying by node id would silently merge two branches of one fan-out | W2 |
| `RN-R6` | **`regions` records what happened, not what a policy concluded.** A policy's own state is opaque (`JP-R1`) and reachable only through `describe`; run state carries the **events**, so two policies folded over the same *region events* produce the same `opened`, `settled` and `suspended` | W2 |
| `RN-R11` | **`joined` is a routing fact, and it is the only field a policy's behaviour reaches that is *decidable without the definition*.** `true` the driver routed out of the join, `false` a policy reported it unsatisfiable and it never will, `null` neither. **v0.4: `null` is not always *"yet"*** — a `map` over an empty list is permanently `stuck` with `joined: null`, because no policy can report a region that opened nothing (`spec/join-policy.md` section 5) and so nothing ever moves this field. `null` means *the driver neither routed out nor was told it never will*, which is a state a run can END in. It records what the **driver did**, not what the policy said — which is the distinction `RN-R6` rests on, and it is a thin one: a field carrying a policy's `status` or `describe` would cross it. Test: drive the same flow twice, once under each policy, and assert `opened`, `settled` and `suspended` are identical while `joined` differs. **Note the test is two drivers, not one stream** — `joined` comes from a `joinSettled` input, which is not a region event, so a literally identical stream cannot differ | **W5** |

**`RN-R6` is what keeps [Q4](../doc/open-questions.md) answerable.** If run state carried a
policy's conclusion, W4's matrix would be comparing two run states rather than two policies, and
every cell would be a tautology.

> **v0.3 qualified `RN-R6`, and the reason is worth reading before trusting the old sentence.** It
> used to end *"...and differ only in whether the join fired"*, with a note that the difference
> *"shows up in `nodes`"*. Both halves are true and together they were **read as** *"so `regions`
> already tells you"* — which is what [Q43](../doc/open-questions.md) said, and it is false. On
> `p1-routed-away` every branch settles under both policies, so `settled` is
> `{ "0": "arrived", "1": "exited" }` either way.
>
> **`joined` is not the only field the two runs differ in, and v0.3's first wording said it was** —
> found by the same pass, and it is the third occurrence of one failure mode in this repository (the
> others are [ADR 0003](../doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)'s
> dated correction and [Q43](../doc/open-questions.md) itself): **an over-broad enumeration inside a
> claim that is otherwise right.** They also differ in `nodes` (`publish` present or absent), in
> `pathEnds` (two entries or one) and therefore in `outcome`. What is true, and what the rule now
> says, is that `joined` is the only one of those **decidable without the definition**: an absence in
> `nodes` and a count of `pathEnds` are both legible only against a flow the fold does not have and
> `RN-R4` says it must not acquire. `RN-R11` is the fact that was missing, and
> [ADR 0015](../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md) is why it costs a
> field rather than a precedence tweak.

## 3. The run-level outcome vocabulary

`spec/README.md` named this as the hard half of the document — *"the terminal outcomes, which are
more than `done` and `failed`"*. **Six at v0.3.** The fifth is the one every design drops; the sixth
is the one v0.2 got wrong, and it got it wrong about the exact run
[P1](../doc/plans/p1-what-satisfies-a-join.md) exists to attribute.

**Highest-ranked match wins**, and the order below is the order.

| outcome | means | reached when |
|---|---|---|
| `stopped` | a refusal terminated the run | `OR-R10` — the driver reported a failure and stopped routing |
| **`awaiting_action`** | **a node suspended and nothing has resolved it** | any node is `suspended` (ADR 0004 rule 3) |
| `running` | live work exists | any dispatched node is `running` — that is, dispatched and not yet settled |
| **`stuck`** | **nothing is live and nothing ever will be** | nothing running, nothing suspended, and an entered region's `joined` is not `true` — so nothing downstream of that join will ever be dispatched |
| `failed` | a path ended with no eligible edge, and none is still live | a path ended with **no eligible edge**, outside or inside a region. *(This read *"`branch.lost`'s condition"*, and the two stopped being coextensive at [W22](../doc/work-items/w22-what-an-inner-join-does-to-the-outer-one.md): `JP-R10` emits `branch.lost` for a branch whose nested region was declared `unsatisfiable`, and [ADR 0030](../doc/decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md) rule 7 deliberately appends **no** `pathEnded` for it, because neither reason is true of a join that has an eligible edge and never fires. **The run-level answer is unchanged** — `stuck` outranks `failed` and the dead region's `joined: false` reaches it first — so this is a false sentence rather than a false outcome, corrected in place.)* |
| `completed` | every live path reached an `end` node | nothing live, nothing suspended, and at least one path ended **at an `end` node** |

| id | | Test owed by |
|---|---|---|
| `RN-R7` | **`awaiting_action` outranks `running`.** A run with one suspended node and three live ones is `awaiting_action`, because the thing a human must know is that a human is needed. This is the answer to [Q17](../doc/open-questions.md)'s *"it is neither success nor failure, so it needs a run-level outcome of its own"*, and the shape [Q7](../doc/open-questions.md) will most likely reuse for a timed-out join | W2 |
| `RN-R8` | **`stopped` outranks everything.** A run a refusal terminated is `stopped` whatever its nodes say, because the log after that point is incomplete by construction — the driver stopped routing it | W2 |
| `RN-R10` | **`stuck` outranks `failed` and `completed`, and nothing else.** Below `awaiting_action` and `running` because both mean the run can still move — a suspended branch keeps its join legitimately waiting, which is the whole reason `branch.suspended` exists. **Above `failed`** because `failed` is a flow outcome an author asked for and `stuck` is a defect nobody asked for: reporting `failed` names a cause and hides that the run will not terminate. Test: the same real flow under both policies, one `completed` and one `stuck`, with identical `regions` apart from `joined` | **W5** |
| `RN-R12` | **At a quiescent point, a run is finished exactly when its outcome is neither `running` nor `awaiting_action`.** Those two are the only outcomes that say more input is coming — a dispatched node has not settled, or a person has not answered. **This is what makes ladder L6 clock-free**: a harness resolves on this predicate rather than on `scheduler.completed` (which fires on every drain), on `stats` (which reads `queued=0 running=0` for a genuinely stalled scheduler) or on a timer. `RN-R10` is load-bearing for it — before `stuck` existed this predicate reported a permanent hang as a **success**. **The qualification is not decoration; see below.** Test: an L6 run that reaches a terminal outcome, asserting the wait ended **because** the predicate fired and not because a backstop did | **W5** |

> ### The precedence is defined at a **quiescent point**, and `RN-R12` says so for a reason
>
> **v0.3, and it is what W5's spec-conformity pass found.** `RN-R2` makes the fold total over any
> prefix, so an outcome can be read at any element. Most prefixes are **mid-turn**, and mid-turn is
> not a resting state: the driver appends a settlement **before** the routing it causes (ADR 0014
> rule 6), so between a node settling and its successor being dispatched there is momentarily
> nothing running, and between the last branch arriving and the join firing there is momentarily a
> region with `joined: null`.
>
> Folding every prefix of a real `fanout-join` run, **7 of 14 report a terminal outcome for a run
> that is not over** — including the first settlement, which reads `completed`. `stuck` made it
> louder rather than causing it: those prefixes used to say `completed` and now say the outcome that
> specifically means *nothing will ever move again*.
>
> **A quiescent point is the end of the driver's synchronous turn** — every element the current
> event produced has been appended. A consumer folding incrementally reaches one with
> `queueMicrotask`, because the driver routes synchronously inside the scheduler's listener. A
> consumer folding `driver.foldInputs()` after the fact is always at one.
>
> **This also names the table's missing row.** A state with settled nodes and **no** path end
> matches neither `completed` (*at least one path ended at an `end` node*) nor `failed` (*a path
> ended with no eligible edge*), and `src/fold/run-state.ts` falls back to the node states. That
> fallback is **not a sixth precedence row and must not be read as one**: it exists to keep the fold
> total over prefixes (`RN-R2`), and every state that reaches it is either mid-turn or a fixture
> carrying no `pathEnded`. At a quiescent point of a real run the table is total, because every path
> that ended appended a `pathEnded` and a run with no ended path has something live.

**`completed` and `failed` are discriminated by how a PATH ended, never by whether a node
settled `failed`.** They are different propositions and they diverge on a case the corpus already
holds: in `spec/examples/valid/failure-edge.flow.json` an `optional` node fails and **routes on**
through its `on: ["failed"]` edge to an `end`. Every live path reached an `end`, so the run is
`completed` — and *"some node settled failed"* would call it `failed`. That is the case
[ADR 0004](../doc/decisions/0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md)
forced into existence, so getting it wrong would mislabel the shape W5 is built around.

**Q25 is answered here rather than in the definition.** `end.outcome` is an author-defined string
the driver never interprets (`spec/flow-definition.md` section 2); this vocabulary is **closed and
ours**. An author labels *why* a path ended; run state says *what the run is*. Letting the
definition supply run-level outcomes would let a flow invent a state no UI could render and no fold
could reason about.

## 4. Per-node state

`running` → `done` | `failed` | `suspended`.

**Four, not the scheduler's five**, and the two differences are both deliberate:

- **`user_action` is `suspended` here**, because at flow level it is not a terminal state — a
  resolution resumes it (ADR 0004 rule 4), and calling it terminal is what makes a design drop it.
- **There is no `pending`.** `OR-R4` says `task.running` writes no record, so the only signal this
  layer has is the dispatch itself and a node is `running` from that moment. v0.1 declared `pending`
  and nothing could ever produce it; **a state nothing can produce is not a state**, and leaving it
  in the document would have meant a reader writing a `case` for it forever.

| id | | Test owed by |
|---|---|---|
| `RN-R9` | **A resolved node takes the state its resolution gave it**, `done` or `failed`, and its `result`/`error` come from the **effective outcome** ([spec/outcome-record.md](outcome-record.md) section 7) rather than from either record alone. A node that suspended and was resolved is not distinguishable, in run state, from one that settled that way — which is `RS-R3`'s promise kept one layer up | W2 |

## 5. Three things v0.1 claimed that its own inputs could not supply, and two found since

Recorded rather than edited away, because the failure was not the claims — it was that the **code
resolved each one silently**, in a document the same item wrote, which is precisely what
`spec/README.md` rule 2 exists to prevent. The conformity pass found all three.

| v0.1 said | what was true | what v0.2 does |
|---|---|---|
| `nodes` holds one entry per **dispatched** task | the fold saw only *settlements*, so a task in flight was invisible, `running` was unreachable, and **`RN-R7` was unfalsifiable** — no state could hold both a suspended node and a live one | **adds `dispatched` as an input.** The claim becomes true rather than the rule becoming weaker |
| `completed` means *"at least one `end` was reached"*; `failed` means *"a path ended with no eligible edge"* | neither was derivable — nothing reported a path reaching an `end` outside a region. The code substituted *"some node settled failed"*, which **mislabels `failure-edge.flow.json`** | **adds `pathEnded` as an input**, so section 3's own words are what the fold computes |
| the shape carries `flowId` and `regions[*].joinId` | neither is derivable: no record carries a flow id, and `RegionEvent` carries only `regionId`. The code shipped `joinId: ''` forever and dropped `flowId` | **removes both from the shape.** A caller that wants either reads the definition, which is where they live |
| **v0.3's fourth row, and it is not v0.1's** — [Q43](../doc/open-questions.md) said *"`regions` already records `{0: arrived, 1: exited}`, so the information is present"* | **it is not.** Both policies settle every branch on `p1-routed-away`, so `regions` is byte-identical under each; `RN-R6` guarantees precisely that. The other candidate — infer it from `publish` being absent from `nodes` — needs the definition, which `RN-R4` forbids | **adds `joined` and the `joinSettled` input** ([ADR 0015](../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md)). The claim becomes true rather than the outcome staying wrong |
| **v0.4's fifth row, and it is a v0.1 claim that stayed true by ACCIDENT for nine plans** - section 2's shape says `regions` holds *"one entry per fan-out region ENTERED"* | **an entered region that opens NO branch has no entry.** Every producer of an entry was a region EVENT, so *entered* and *opened at least one branch* were the same thing - and they were the same thing because `FD-V9`'s arity floor makes a `fanout` open at least two. **A `map` separates them** ([ADR 0036](../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)): a map over an empty list appends nothing at all, `RN-R10` iterates nothing, and the run reports **`completed`** having reached no `end` node - through section 3's final fall-back rather than by any positive determination. Measured by [W33](../doc/work-items/w33-a-map-at-run-time-arity.md) before the fix | **adds `regionEntered` as an input**, appended when the driver opens a region's policy. The claim becomes true rather than the shape being weakened to match the code |

**The pattern is worth naming.** Each of the first three was a spec written by the item that
implements it, asserting something reasonable, and each was resolved by narrowing the code until the
assertion was unobservable — which produces a green gate and an untestable rule. **The fourth is a
different author and a different document** — a register entry, written by a reader, asserting that
the data was already there — and it was caught the same way: by an item trying to act on it. What
the four share is that the claim was plausible and nobody had run it. `spec/join-policy.md` handled
the identical situation correctly for `JP-R5`'s ordering clause: it wrote down that the clause is
currently unfalsifiable, and why. This document did not, and that is the finding.

## 6. What this document does not fix

- **What a satisfied join carries downstream** — [Q36](../doc/open-questions.md). It carries `null`,
  and the fold records that faithfully rather than inventing a value.
- **Bounded retention** — [Q19](../doc/open-questions.md). A run's footprint is proportional to its
  dispatched-node count and the total is that times the run count, which is the measurement P1 was
  always going to need and does not have.
- **Durability** — [Q15](../doc/open-questions.md). `RN-R2` is what would make it additive; it does
  not make it done.
- **An event family for a UI** — [Q21](../doc/open-questions.md).
- ~~**Who composes the input sequence.**~~ **Done in v0.3** —
  [ADR 0014](../doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md). The
  driver holds one ordered `FoldInput` array and `Driver.foldInputs()` returns it; `snapshot()` is
  now *defined* as its record-kind subsequence, and `onFoldInput` is the push half. v0.2's text is
  kept below because the diagnosis was right and the reason it mattered was not the one recorded:
  **two of the six kinds were not observable from outside at all**, so no caller could have built
  the sequence however carefully it tried. `pathEnded` in particular had no producer anywhere — a
  path reaching an `end` node was reported only as a *region* event, and only inside a region.
  [Q41](../doc/open-questions.md) was filed as an ergonomics question and was a capability gap.

  > *v0.2:* `FoldInput` interleaves records, region events, dispatches, path ends and a stop into
  > one ordered value, and **nothing produces that value yet** […] The ordered sequence `RN-R3` and
  > `OR-R5` are *about* does not exist as a thing you can hold.

- **Whether `stuck` says WHY.** A map of zero items is `stuck` and **no policy reports it
  `unsatisfiable`**, because a policy's state after a region opens nothing is byte-identical to its
  state before any branch opens - so `onUnsatisfiableJoin` does not fire and `joined` is `null`
  rather than `false`. That is [Q97](../doc/open-questions.md) exactly, open since P5 with **ADR 0026
  held for it**, now with a second case. `spec/join-policy.md` section 5 carries the ruling and the
  three alternatives it rejected.
- **What a consumer should do about a `stuck` run.** [Q38](../doc/open-questions.md) asks whether a
  `stopped` run is resumable and neither is answered here; there is no cancel
  ([Q18](../doc/open-questions.md)), so today the honest answer is *report it and abandon it*.
