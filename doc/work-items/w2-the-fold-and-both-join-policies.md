# W2 — Run state as a fold of the log, and both join policies behind one interface

**Status:** todo
**Plan:** [P1](../plans/p1-what-satisfies-a-join.md)

```
Spec:       spec/outcome-record.md sections 1, 3 and 7 (the log and the effective
            outcome), spec/join-policy.md sections 1-3 (the interface, the
            vocabulary, and what each policy NAME means), spec/task-id.md
            section 1 (the total parse). AND it writes one: spec/run-state.md,
            the document spec/README.md marks "not written - W2"
Owns:       spec/run-state.md, src/fold/**, test/fold/**
            (no other item may edit these)
Inputs:     the log W3 produces - OutcomeRecord and ResolutionRecord, exported
            and exercised; the RegionEvent stream and the Region shape
            (Driver.regionsForPolicies()); ADR 0004 (suspension and resolution),
            ADR 0007 (the record is immutable), doc/concept.md section 5
Outputs:    (1) spec/run-state.md - what a run holds and what its terminal
            outcomes are; (2) a fold: ordered log -> run state, pure;
            (3) `arrival-count` and `live-token` as JoinPolicy implementations,
            which W4's matrix runs and W5's real flow uses
Depends on: W1 (done, a6edc92) and W3 (done, a1d2e31). W3 is a SEQUENCING
            dependency, not a plan one - P1 has both fanning out off W1, and W2
            needs no driver to run
Blocks:     W4 (the matrix runs these two policies) and W5 (a real flow needs one)
Tests:      one per named rule, expected values from spec/ and never from output.
            The fold's fixtures are hand-written outcome logs - NEVER captured
            from the driver, which would prove only that the two agree
            (doc/workflow.md section 5 rule 4)
Gate:       L0-L3, each in all five runtimes the gate already runs (RT-R1),
            then the spec-conformity pass of doc/workflow.md section 6
Reserves:   Q41-Q45, ADR 0008-0009
```

**Both of P1's reserve blocks are spent**, so these come from past them: `Q31`-`Q40` and
`ADR 0003`-`0006` are allocated, `ADR 0007` was taken from outside, so W2 takes **Q41-Q45** and
**ADR 0008-0009**. Recorded in [P1](../plans/p1-what-satisfies-a-join.md) as well.

## Scope

**In**

1. **`spec/run-state.md`** — the fifth document `spec/README.md` has marked *"not written — W2"*
   since W1. What a run holds, what a join is waiting on, and **the terminal outcomes, which are
   more than `done` and `failed`**: `user_action` is the fifth state
   ([Q17](../open-questions.md)), a suspended run is neither finished nor failed, and
   [Q25](../open-questions.md) asks whether that vocabulary belongs here or in the definition.
2. **The fold** — `(log) => RunState`, pure. No clock, no scheduler, no IO, no mutation.
3. **Both join policies**, `arrival-count` and `live-token`, **verbatim from
   `spec/join-policy.md` section 3** and pinned by `JP-R7`/`JP-R8`.
4. **Ladder L3** — fold the same log twice and deep-compare. This is the rung that catches map
   ordering, a `Date.now()` in the fold, and hidden state, and it is the reason `OR-R5` exists.
5. **[Q14](../open-questions.md), answered with evidence** — is run state a fold, and of whose log.
   It is the last of `doc/concept.md` section 6's four leanings still only a leaning.

**Out** — named rather than left implicit, with where it goes instead

- **The driver.** Done, `src/driver/**` is W3's. W2 reads the log W3 writes and never calls it.
- **The join/failure matrix.** W4, gate L0-L5. W2 supplies the two policies; **W4 runs them against
  each other and answers [Q4](../open-questions.md)**, and a work item that reports a winner has
  skipped the plan.
- **A third or fourth policy.** [Q24](../open-questions.md) — the decrementing arrival counter and
  the arrivals-aware live-token — are built **after** W4, under their own ids, if its result makes
  them interesting.
- **What a satisfied join carries downstream** ([Q36](../open-questions.md)). It carries `null`
  today; changing that is a spec change and a driver change, and neither is W2's.
- **Durability** ([Q15](../open-questions.md)). If the fold holds, writing the log down is additive
  — which is the whole argument for it, and is not the same as doing it.
- **A real scheduler.** W5, L6.

## Verification

### The rules this item owes a test

Five name W2 outright, and four more name it jointly with W3.

| | rule | |
|---|---|---|
| **The log** | `OR-R5` | ordered by **append**, never sorted by a timestamp. Test: a log whose `schedulerTimestamp` order differs from its append order, asserting the fold follows append order |
| | `OR-R7` | a resolution is **appended, never applied**. Test: fold a log containing one twice and deep-compare, then assert the same state is reached folding from scratch |
| | `OR-R8` | the **effective outcome is derived, never appended** — folding must not grow the log |
| **The policies** | `JP-R1` | every method **pure**. Same state + same event sequence → same state. This is what makes L3 a real check |
| | `JP-R2` | `describe` returns `JsonValue` — `JSON.stringify` round-trips for every state W4's matrix reaches |
| **Runtimes** | `RT-R1`, `RT-R2`, `RT-R3`, `RT-R4`, `RT-R9` | shared with W3: the gate runs in all five, no runtime branch in ordinary logic, three typechecks, no `node:` import or Node global in published source, and no syntax Node cannot type-strip |

### Ladder L3, and why it is this item's rung

`doc/workflow.md` section 4: *"Determinism: fold the same outcome log twice, deep-compare run
state."* It catches map ordering, a `Date.now()` in the fold, and hidden state.

**It is only a real check if the fold is the only thing producing run state.** A fold that reads
`scheduler.tasks`, or that memoises across calls, passes L3 while being exactly what L3 exists to
forbid. So L3 here means: two independent folds of the same array, deep-compared, **and** a fold of a
shuffled-but-append-equivalent log producing the same answer for `OR-R5`.

### Traps carried in, and the one this item is most likely to fall into

| | |
|---|---|
| **`JP-R7` / `JP-R8`** | **The two one-line refinements that would answer Q4 by accident.** Decrementing `arrival-count`'s `N` on `branch.exited` makes it survive P1's case; requiring `live-token` to have seen an arrival gives it a graceful answer on the all-exited row. Both are [Q24](../open-questions.md), both are built after W4, and **either one written here returns "the two policies are equivalent" as a passing test** |
| **the arrival-shaped stub** | W3's third conformity pass found every one of its seam tests using an arrival-counting stub, so **every one asked only the question `arrival-count` can answer** — and a one-line regression that made `live-token` behave like `arrival-count` survived a green suite in five runtimes. A fold test suite built the same way has the same blind spot |
| **`OR-R5`** | the log is ordered by **append**. Two settlements can share a millisecond, and `schedulerTimestamp` is the scheduler's clock while `observedAt` is ours |
| **`OR-R8`** | the effective outcome is **derived**. A fold that appends it makes the log contain its own conclusions |
| **Q14 is a question, not a formality** | if run state turns out **not** to be a fold, that is a real result and it changes [ADR 0004](../decisions/0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md) rule 6, [Q15](../open-questions.md) and W3's `resolve()`. Report the conflict (`spec/README.md` rule 2) rather than bending the fold to preserve the leaning |

### The named routing cases

`doc/work-items/TEMPLATE.md` asks which of these the item covers.

| Case | | Covered by W2 |
|---|---|---|
| A branch routed away from its join ([Q4](../open-questions.md)) | **both policies see it; neither is judged** | `branch.exited` reaches both. Which answer is right is W4's |
| `user_action` ([Q17](../open-questions.md)) | **yes** — it is a run-level outcome, which is `spec/run-state.md`'s subject |
| No matching decision edge ([Q10](../open-questions.md)) | **not applicable** — routing is W3's, and the fold sees only its result |
| A duplicate task id ([Q13](../open-questions.md)) | **not applicable** — `ID-R1` refuses it before the log is written |
| Nested fan-out ([Q6](../open-questions.md)) | **refused upstream** by `FD-V15`; the policies are written so a deeper `branchPath` needs no change |

## Record

*Filled in when the item is done. Delete the italic lines.*

**Gate — what ran.** One row per clause. Each verdict starts with `RAN` or `NOT RUN`; a clause with
no row reads as *did not run*. **A row that does not name its runtimes ran in one.**

| Clause | Verdict | Runtimes | Notes |
|---|---|---|---|
| L0 | | | |
| L1 | | | |
| L2 | | | |
| L3 | | | |
| spec-conformity | | | reviewer, and what it found |
| re-run at `<sha>` | | | |

**What broke.**

**What this taught.** *What changes in the spec, the plan, or `doc/workflow.md` — or "nothing",
which is a legitimate answer.*

**Questions raised.** *Q ids from Q41-Q45, with one line each. They also go in
`doc/open-questions.md`.*
