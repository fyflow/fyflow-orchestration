# W2 — Run state as a fold of the log, and both join policies behind one interface

**Status:** done
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
   ([Q17](../questions/q17.md)), a suspended run is neither finished nor failed, and
   [Q25](../questions/q25.md) asks whether that vocabulary belongs here or in the definition.
2. **The fold** — `(log) => RunState`, pure. No clock, no scheduler, no IO, no mutation.
3. **Both join policies**, `arrival-count` and `live-token`, **verbatim from
   `spec/join-policy.md` section 3** and pinned by `JP-R7`/`JP-R8`.
4. **Ladder L3** — fold the same log twice and deep-compare. This is the rung that catches map
   ordering, a `Date.now()` in the fold, and hidden state, and it is the reason `OR-R5` exists.
5. **[Q14](../questions/q14.md), answered with evidence** — is run state a fold, and of whose log.
   It is the last of `doc/concept.md` section 6's four leanings still only a leaning.

**Out** — named rather than left implicit, with where it goes instead

- **The driver.** Done, `src/driver/**` is W3's. W2 reads the log W3 writes and never calls it.
- **The join/failure matrix.** W4, gate L0-L5. W2 supplies the two policies; **W4 runs them against
  each other and answers [Q4](../questions/q4.md)**, and a work item that reports a winner has
  skipped the plan.
- **A third or fourth policy.** [Q24](../questions/q24.md) — the decrementing arrival counter and
  the arrivals-aware live-token — are built **after** W4, under their own ids, if its result makes
  them interesting.
- **What a satisfied join carries downstream** ([Q36](../questions/q36.md)). It carries `null`
  today; changing that is a spec change and a driver change, and neither is W2's.
- **Durability** ([Q15](../questions/q15.md)). If the fold holds, writing the log down is additive
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
| **`JP-R7` / `JP-R8`** | **The two one-line refinements that would answer Q4 by accident.** Decrementing `arrival-count`'s `N` on `branch.exited` makes it survive P1's case; requiring `live-token` to have seen an arrival gives it a graceful answer on the all-exited row. Both are [Q24](../questions/q24.md), both are built after W4, and **either one written here returns "the two policies are equivalent" as a passing test** |
| **the arrival-shaped stub** | W3's third conformity pass found every one of its seam tests using an arrival-counting stub, so **every one asked only the question `arrival-count` can answer** — and a one-line regression that made `live-token` behave like `arrival-count` survived a green suite in five runtimes. A fold test suite built the same way has the same blind spot |
| **`OR-R5`** | the log is ordered by **append**. Two settlements can share a millisecond, and `schedulerTimestamp` is the scheduler's clock while `observedAt` is ours |
| **`OR-R8`** | the effective outcome is **derived**. A fold that appends it makes the log contain its own conclusions |
| **Q14 is a question, not a formality** | if run state turns out **not** to be a fold, that is a real result and it changes [ADR 0004](../decisions/0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md) rule 6, [Q15](../questions/q15.md) and W3's `resolve()`. Report the conflict (`spec/README.md` rule 2) rather than bending the fold to preserve the leaning |

### The named routing cases

`doc/work-items/TEMPLATE.md` asks which of these the item covers.

| Case | | Covered by W2 |
|---|---|---|
| A branch routed away from its join ([Q4](../questions/q4.md)) | **both policies see it; neither is judged** | `branch.exited` reaches both. Which answer is right is W4's |
| `user_action` ([Q17](../questions/q17.md)) | **yes** — it is a run-level outcome, which is `spec/run-state.md`'s subject |
| No matching decision edge ([Q10](../questions/q10.md)) | **not applicable** — routing is W3's, and the fold sees only its result |
| A duplicate task id ([Q13](../questions/q13.md)) | **not applicable** — `ID-R1` refuses it before the log is written |
| Nested fan-out ([Q6](../questions/q6.md)) | **refused upstream** by `FD-V15`; the policies are written so a deeper `branchPath` needs no change |

## Record

**Gate — what ran.** `RT-R1`: a rung is not green until it is green where it is required to run, and
a row that does not name its runtimes ran in one.

| Clause | Verdict | Runtimes | Notes |
|---|---|---|---|
| L0 | **RAN** — pass | **Node, browser, Deno** | `tsc` × 3 configs, `deno check`, `deno lint`, `check-spec` (8), `check-source` (6), `deno publish --dry-run`. **`tsc -p tsconfig.json` caught two malformed region fixtures that `deno check` and the runtime both accepted** — it is the only clause that typechecks `test/` |
| L1 unit | **RAN** — pass | **Node 24, Deno, chromium, firefox, webkit** | the fold's rules, both policies, and the record-path purity the first version missed |
| L2 routing | **RAN** — n/a to this item | — | routing is W3's; the fold sees only its result |
| L3 determinism | **RAN** — pass | **all five** | fold the same log twice and deep-compare; **and `RN-R2` as a property** — the conformity pass ran `step(fold(prefix), next) === fold(prefix+next)` over 400 random logs with 0 mismatches and 0 prefix mutations |
| **210 assertions, identical in all five runtimes** — the browser runner asserts the parity rather than assuming it | | | |
| spec-conformity | **RAN** — **4 blocking, 7 defects, 6 notes** | n/a | **12 surviving mutations reported. All 12 re-run after the fixes and all 12 caught** — including one that first read SURVIVED because the mutation helper silently skipped a missing pattern and there are **two** `runId: prev.runId ?? runId` sites. A mutation harness that cannot fail is the same defect as a test that cannot fail |
| re-run at `<sha>` | **RAN** — pass | all five | the gate above **is** the re-run acting on the pass; it lacks only the commit that carries it |

**What broke.**

Four blocking, and **three of the four were the same mistake**: `spec/run-state.md` asserted
something reasonable, the fold's inputs could not supply it, and **the code narrowed itself until the
assertion was unobservable** rather than reporting the conflict. `spec/README.md` rule 2 exists for
exactly that, and I wrote both the spec and the code, so nobody was holding the other end.

1. **`nodes` held *settled* tasks where the spec said *dispatched*.** A task in flight was invisible,
   so `pending` and `running` were unreachable node states, the `running` outcome was reached only by
   a fallback, and **`RN-R7` — *"`awaiting_action` outranks `running`"* — was unfalsifiable**: no
   reachable state could hold both a suspended node and a live one. Swapping the two branches of the
   precedence survived all 184 assertions. Fixed by adding `dispatched` as an input, so the claim
   becomes true rather than the rule becoming weaker.
2. **`completed`/`failed` was discriminated on node state, not path termination.** The spec says
   *"a path ended with no eligible edge"*; the code said *"some node settled failed"*. Those are
   different propositions and they diverge on `spec/examples/valid/failure-edge.flow.json` — an
   `optional` node fails and **routes on** to an `end`, which section 3 calls `completed` and the
   code called `failed`. That is the case ADR 0004 forced into existence, so it was the shape W5 is
   built around. Fixed by adding `pathEnded` as an input.
3. **`RN-R1`'s purity was untested on the record path.** The one test called `step` with a *region*
   event, so the branch that runs for every log record was never exercised; making it mutate its
   input in place survived the whole suite.
4. **`RN-R8` had a test that could not fail.** It applied `stopped` last, and `step`'s stopped branch
   sets the outcome directly — so deleting the guard in `withOutcome` survived. The rule's actual
   claim, *"whatever its nodes say"*, needs a record appended **after** the stop.

And two the spec declared that nothing could derive: **`flowId`** (no record carries one) and
**`regions[*].joinId`** (`RegionEvent` carries only `regionId`). The code shipped `joinId: ''`
forever and silently dropped `flowId`. Both are removed from the shape, with the reason stated —
a caller that wants either reads the definition, which is where they live.

**Two tests W2 owed and never shipped.** `spec/outcome-record.md` assigns `OR-R7` and `OR-R8` to W2
with prescribed tests, and this declaration repeats them verbatim. Neither existed; the only suites
carrying those names are W3's and they assert something else. **This is the same shape W3's pass 2
found — declared scope that did not ship — and `doc/workflow.md`'s ladder still has no rung for it.**

**What this taught.**

- **Writing the spec and the code for the same rule removes the only reader either had.** Three
  blocking findings were one document asserting what its own implementation could not do, resolved
  each time in the code's favour, silently. `spec/join-policy.md` handled the identical situation
  correctly a week earlier — it wrote down that `JP-R5`'s ordering clause is currently unfalsifiable
  and why. The difference was not care; it was that W1 wrote that document and W3 met it. **A spec
  authored by its implementer needs the conformity pass more, not less.**
- **The trap this item was warned about, it avoided — and the warning did not generalise.** The
  declaration named the arrival-shaped-stub blind spot W3's third pass found, and the policy tests
  were built against it: every behavioural case runs **both** policies and asserts where they differ.
  The conformity pass confirmed it works — every policy mutation that changes behaviour on a
  conformant stream is caught, in both directions, including both forbidden refinements. **And then
  the fold, three files away, had five untested rules.** Naming a trap protects the thing you point
  it at.
- **A property test found nothing and was still worth running.** `RN-R2` over 400 random prefixes:
  0 mismatches. That is the shape of evidence a single-sequence example cannot give, and it is
  cheap — the reason it found nothing is that `fold` is literally a left fold of `step`, which is a
  fact about the code the test made visible.

**Questions raised.** Q41 from the reserved block; Q42-Q45 are skipped, never reissued.

| Q | | raised by |
|---|---|---|
| Q41 | Who composes the fold's input sequence, and where does its order come from? Nothing produces the ordered value `RN-R3` and `OR-R5` are *about* | the conformity pass |

**Q14 and Q25 are answered**, in `spec/run-state.md` sections 1 and 3 and in the register. Q14 was
the last of `doc/concept.md` section 6's four leanings still only a leaning, and Q17's run-level half
is now `awaiting_action`.

**ADR 0008-0009 were reserved and neither was used.** Q14's answer is a spec section with its
argument stated in place, which `doc/decisions/README.md` prefers to a spec rule plus an ADR
restating it. The numbers are skipped.

**One claim in commit `8c22c16`'s message is wrong**, and it is left standing rather than rewritten:
it lists *"demoting `awaiting_action`"* among the mutations checked, and that mutation **survived** —
it survived because, under finding 1, it was an equivalent mutant. Recorded here because a commit
message cannot be corrected without rewriting history, and `doc/workflow.md` section 3's reason for
never renumbering ids applies to messages too.
