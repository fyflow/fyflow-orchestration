# spec/run-state — what a run holds, and what it is derived from

**Status:** v0.1 — written by [W2](../doc/work-items/w2-the-fold-and-both-join-policies.md) under
[P1](../doc/plans/p1-what-satisfies-a-join.md)
**Normative.**
**The document `spec/README.md` has marked *"not written — W2"* since W1**, and the reason it waited
is the whole of section 1: whether run state is a fold at all is
[Q14](../doc/open-questions.md), and W2 is the item that tests it. A spec that answered it first
would have made W2's gate vacuous.

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
    "split": { "joinId": "collect", "opened": ["0", "1"], "settled": { "0": "arrived", "1": "exited" } }
  }
}
```

| id | | Test owed by |
|---|---|---|
| `RN-R4` | **A run holds only what the log says.** Every field above is derived; none is supplied from outside. A node absent from `nodes` was never dispatched, and that is the only meaning of its absence | W2 |
| `RN-R5` | **`nodes` is keyed by task id, not by node id.** A node inside a fan-out has one entry per branch, and [spec/task-id.md](task-id.md)'s total parse is what recovers `(nodeId, branchPath, attempt)` from the key. Keying by node id would silently merge two branches of one fan-out | W2 |
| `RN-R6` | **`regions` records what happened, not what a policy concluded.** A policy's own state is opaque (`JP-R1`) and reachable only through `describe`; run state carries the **events**, so two policies folded over one log produce the same `regions` and differ only in whether the join fired | W2 |

**`RN-R6` is what keeps [Q4](../doc/open-questions.md) answerable.** If run state carried a
policy's conclusion, W4's matrix would be comparing two run states rather than two policies, and
every cell would be a tautology.

## 3. The run-level outcome vocabulary

`spec/README.md` named this as the hard half of the document — *"the terminal outcomes, which are
more than `done` and `failed`"*. Five, and the fifth is the one every design drops.

| outcome | means | reached when |
|---|---|---|
| `running` | live work exists | any dispatched node is `pending` or `running` |
| `completed` | every live path reached an `end` node | no node is live, no node is suspended, and at least one `end` was reached |
| `failed` | a path ended with no eligible edge, and none is still live | `branch.lost`'s condition, outside or inside a region |
| **`awaiting_action`** | **a node suspended and nothing has resolved it** | any node is `suspended` (ADR 0004 rule 3) |
| `stopped` | a refusal terminated the run | `OR-R10` — the driver reported a failure and stopped routing |

| id | | Test owed by |
|---|---|---|
| `RN-R7` | **`awaiting_action` outranks `running`.** A run with one suspended node and three live ones is `awaiting_action`, because the thing a human must know is that a human is needed. This is the answer to [Q17](../doc/open-questions.md)'s *"it is neither success nor failure, so it needs a run-level outcome of its own"*, and the shape [Q7](../doc/open-questions.md) will most likely reuse for a timed-out join | W2 |
| `RN-R8` | **`stopped` outranks everything.** A run a refusal terminated is `stopped` whatever its nodes say, because the log after that point is incomplete by construction — the driver stopped routing it | W2 |

**Q25 is answered here rather than in the definition.** `end.outcome` is an author-defined string
the driver never interprets (`spec/flow-definition.md` section 2); this vocabulary is **closed and
ours**. An author labels *why* a path ended; run state says *what the run is*. Letting the
definition supply run-level outcomes would let a flow invent a state no UI could render and no fold
could reason about.

## 4. Per-node state

`pending` → `running` → `done` | `failed` | `suspended`.

Five, mirroring the scheduler's five (`doc/concept.md` section 3 constraint 1) with one rename:
**`user_action` is `suspended` here**, because at flow level it is not a terminal state — a
resolution resumes it (ADR 0004 rule 4), and calling it terminal is what makes a design drop it.

| id | | Test owed by |
|---|---|---|
| `RN-R9` | **A resolved node takes the state its resolution gave it**, `done` or `failed`, and its `result`/`error` come from the **effective outcome** ([spec/outcome-record.md](outcome-record.md) section 7) rather than from either record alone. A node that suspended and was resolved is not distinguishable, in run state, from one that settled that way — which is `RS-R3`'s promise kept one layer up | W2 |

## 5. What this document does not fix

- **What a satisfied join carries downstream** — [Q36](../doc/open-questions.md). It carries `null`,
  and the fold records that faithfully rather than inventing a value.
- **Bounded retention** — [Q19](../doc/open-questions.md). A run's footprint is proportional to its
  dispatched-node count and the total is that times the run count, which is the measurement P1 was
  always going to need and does not have.
- **Durability** — [Q15](../doc/open-questions.md). `RN-R2` is what would make it additive; it does
  not make it done.
- **An event family for a UI** — [Q21](../doc/open-questions.md).
