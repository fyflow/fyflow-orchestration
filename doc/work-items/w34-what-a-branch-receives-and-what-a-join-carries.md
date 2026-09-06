# W34 — What a branch receives, and what a join carries

**Status:** todo
**Plan:** [P10](../plans/p10-is-fan-out-one-feature-or-two.md) — *is fan-out one feature or two?*

```
Spec:       spec/outcome-record.md section 4, spec/join-policy.md section 4,
            spec/flow-definition.md sections 2-4 (W32's, read not written)
Owns:       test/matrix/**, src/driver/routing.ts, and src/driver/driver.ts
            HANDED OVER SERIALLY FROM W33 — declared here rather than taken late
Inputs:     W33's running map, from W33's own file.
            P10 section 2 facts 6 and 7 — the join's successor receives `null`, and
            the fan-out hands ONE object to every branch.
            doc/open-questions.md Q11, Q36, Q154.
Outputs:    ADR 0037 — Q36's answer, what a satisfied join carries downstream.
            A payload contract for the fan-out edge, written in spec/ where there is
            currently nothing: Q11 narrowed, and Q154's aliasing decided.
            The join/failure matrix run at run-time arity — rows, columns, or both.
            The rendered matrix table, asserted field by field rather than printed.
Depends on: W33
Blocks:     W35
Tests:      test/matrix/** at ladder L5, and L2 assertions for the payload contract
            in test/driver/** (W33's tree — a declared exception if it is edited).
            Expected values derived from spec/ before running anything.
Gate:       L1, L2, L5, then the spec-conformity pass (two readers)
Reserves:   Q164-Q166, ADR 0037  (and it already OWNS Q154, raised at the declaration)
```

## Scope

**In**

1. **ADR 0037 — [Q36](../open-questions.md)'s answer: what a satisfied join carries downstream.**
   Its row names three candidates — *the arrived branches' results keyed by branch, a declared
   reducer on the join node, or nothing* — and gives the argument the current `null` rests on:
   `status` is asked after every terminal event, so **which** event satisfies a join is decided by
   fan-out completion order, and a join forwarding *"whichever branch finished last"* makes a run's
   **data** order-dependent. `doc/concept.md` section 5 forbids that for tests and it is worse for
   results. **A map is what makes the question unavoidable** — P10 fact 6: a map that runs N tasks
   and hands its successor `null` has computed N results and thrown all of them away.
   **Q36's owner cell reads W2, an item from P1 done since; it moves here.**
2. **[Q11](../open-questions.md), narrowed to the fan-out edge.** Not *what does every node receive*
   — that is the API surface its own row calls *"the one most expensive to change later"*, and this
   item does not settle it in general. What it settles is **what a branch entry receives**, because a
   map cannot use the shipped shape: one payload down every branch unchanged is exactly what a map
   must not do.
3. **[Q154](../open-questions.md) — the sibling aliasing, and it is live in shipped code.** P10
   fact 7 measured `a.payload === b.payload` as **`true`**: the payload is cloned once at the edge
   hop, which protects the log, and **that single clone is shared across every branch**, so a branch
   mutating it is visible to its siblings. **The scope this was measured at is one flow, at ladder
   L2, with `createTask: (c) => c`** — whether a **thread** pool's own structured-clone boundary
   hides it is **not measured**, and measuring that is part of this item rather than an assumption
   in it. `spec/` says nothing: `payload` appears three times across six spec documents and never as
   a contract on what a node receives.
4. **The matrix at run-time arity.** P10 measured L5 as **52 cells** — 9 depth-1 rows × 4 columns,
   plus [W22](w22-what-an-inner-join-does-to-the-outer-one.md)'s 4 depth-2 rows × 4. A map is a
   **row** question, a **column** question, or both, and this item decides which from what W33 found
   rather than from this sentence. **`arrival-count`'s early fire (P10 fact 4) and N=0 (fact 5) are
   both matrix cells** once W33 has given them verdicts.
5. **The rendered table asserted field by field.** [Q100](../open-questions.md) and W15's finding: a
   renderer the gate never executes had **seven** surviving mutations, one of which printed a
   two-column table with the whole gate green. Whatever this item adds to the render is asserted, not
   printed.

**Out** — named rather than left implicit, with where it goes instead

- **[Q11](../open-questions.md) in general** — a run-scoped accumulator, or a declared per-edge
  mapping for every edge. Narrowed here to the fan-out edge and **left open** with what this item
  measured added to its row.
- **[Q8](../open-questions.md)** — what a decision sees. Shares Q11's retention cost and is P10's
  declared Out.
- **[Q19](../open-questions.md) and [Q21](../open-questions.md)** — retention and redaction. An
  answer to Q36 makes retention **measurable**, which is what Q19's row says it needs; deciding it is
  a different plan.
- **[Q22](../open-questions.md)** — whether a node result must be structured-cloneable. Reachable
  from a join that carries N results and **not forced by one**; its row says it needs a measured run,
  and if this item produces one the measurement goes on its row.
- **Real workers.** **W35.**

## Verification

| Clause | How it is run |
|---|---|
| **L1** | `npm run test`, `npm run test:deno`, `npm run test:browser` — the payload contract as unit assertions. **chromium only** unless `test:browser:all` is named |
| **L2** | routing from a fixture log — what a branch receives and what the join's successor receives, with no scheduler |
| **L5** | `test/matrix/**` — the join/failure matrix, and `npm run check:policies` for `JP-R9` |
| **conformity** | spec first, code second, expected values re-derived independently |
| **adequacy** | mutation in an isolated copy off the shared tree, walking the rule ids. **Scan for symlinks and reparse points before removing the copy** (ADR 0029, and `doc/workflow.md` section 6) |

**Routing cases** (`doc/workflow.md` section 5 rule 6): a branch **routed away from its join**
([Q4](../open-questions.md)) is covered and is the case Q36's answer is hardest for — a join that
carries the arrived branches' results has to say what it carries when a branch did not arrive.
**`user_action`** ([Q17](../open-questions.md)) is covered for the same reason. **Optional-null** is
covered, being one of the matrix's own rows. A **nested fan-out** ([Q6](../open-questions.md)) is
covered by the depth-2 rows, which must keep answering as ADR 0030 says they do. A **duplicate task
id** ([Q13](../open-questions.md)) and **no matching decision edge** ([Q10](../open-questions.md))
are **not applicable** — neither is reachable from a payload decision.

**Rule 8, all five obligations, re-run after the readers with their edits checked in.** Three to
instantiate deliberately. **(c), PROVENANCE** — *change the source expression and nothing else* — is
this item's central risk, because a payload assertion that reads its expected value from the driver
proves the driver agrees with itself, and **all eight recorded instances of that class are in
`examples/**` and this item is the first to put one in `test/**`.** **(d), LOOP BOUNDS** — a matrix
row deletable for 0 and a column droppable with the assertion count unmoved are both recorded
failures of exactly this file tree ([W22](w22-what-an-inner-join-does-to-the-outer-one.md)). **(e),
WIRING** — P10 prediction 3; a render nobody executes is its known shape here, and
[Q100](../open-questions.md) is the second occurrence of it.

## Record

*Filled in when the item is done. Delete the italic lines.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L1 | | |
| L2 | | |
| L5 | | |
| conformity reader | | |
| adequacy reader | | mutations run, survivors |
| re-run at `<sha>` | | |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| | | |

**Exceptions.** *Every file edited outside `Owns` and outside `doc/workflow.md` section 1 rule 5's
record step, with the reason. `src/driver/driver.ts` is DECLARED above and is not an exception.
Audited with `git diff --name-only` against the `Owns` block before this table is filled in.*

**What broke.**

**What this taught.**

**Questions raised.**
