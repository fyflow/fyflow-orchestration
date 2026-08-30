# W6 — The non-success rows at ladder L6, and the harness's inbound step

**Status:** todo
**Plan:** [P2](../plans/p2-the-non-success-half-on-a-real-scheduler.md) — this item is the whole of it

```
Spec:       spec/run-state.md section 3 (`awaiting_action` and `stopped`, the two
            outcomes L6 has never reached) and section 4 (`suspended` is not
            terminal at flow level). spec/join-policy.md section 2
            (`branch.suspended`, `branch.resumed`). spec/outcome-record.md
            `OR-R6`, `OR-R9`, `OR-R10`, and section 7's effective outcome.
            spec/flow-definition.md section 3 (an edge opts in per terminal
            state). It writes no spec; whether `OR-R6`'s pool-dependence
            belongs in one is Q61 and is reported, not patched
Owns:       examples/**  — inherited from W5, which is done. Under
            doc/workflow.md section 7 rule 2 as amended by P1's retro, a serial
            item declares its exceptions rather than merging with the item that
            owned the files; the exceptions table is below and is empty
Inputs:     fyflow-scheduler 0.3.0 per ADR 0013, unchanged. The driver's inbound
            API - Driver.resolve() (W3, ADR 0004 rule 5), never yet called on a
            real run. spec/examples/valid/failure-edge.flow.json, unmodified
            from the corpus. examples/run-flow.ts and examples/l6.ts (W5). Two
            measured facts, both in P2's plan: the real user_action event pair,
            and OR-R6's reachability being inline-only
Outputs:    (1) three L6 rows - a failure that routes, a suspend/resolve/resume,
            and a refusal - taking the gate from eight rows to eleven;
            (2) `awaiting_action` and `stopped` reached on real workers for the
            first time, and `branch.suspended`/`branch.resumed` likewise;
            (3) the harness's inbound step, so a row can resolve a suspended
            branch; (4) Q61, and whatever else the rows turn up
Depends on: P1 complete - W5 built the harness this extends and ADR 0013 is what
            makes a real scheduler reachable at all
Blocks:     nothing
Tests:      the three rows ARE the test, and every expected value is written by
            hand from spec/ BEFORE the run, as W5's eight were. The derivations
            are in Scope below so a reader can check them without running
            anything. A value taken from output is a snapshot, not a test
Gate:       L0-L6. L0-L5 in all five runtimes (RT-R1); L6 in Node 24 and Deno
            (RT-R10). Then pass 2 as doc/workflow.md v0.3 defines it - TWO
            readers, conformity and adequacy
Reserves:   Q61-Q70, ADR 0016-0018
```

**Every line above is fillable, and two of them only because P2 measured first.** `Inputs:` names
the real `user_action` event pair and `OR-R6`'s pool-dependence; without those two facts the
`Outputs:` line would have been a guess about what is reachable. That is
[ADR 0013](../decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)'s
lesson applied on purpose rather than after the fact.

---

## Scope

**In** — three rows, with every expected value derived here from `spec/` before anything runs.

**1. A failure that routes.** `spec/examples/valid/failure-edge.flow.json`, unmodified. `extract` is
`optional: true` and its first edge is `{ "on": ["failed"], "to": "quarantine" }`; `quarantine` is an
`end`. The worker throws, so:

| | derived from |
|---|---|
| `extract` settles `failed`, one `task.failed` event, no `user_action` | `optional: true` — P2's measured fact 1 |
| the failure edge is **eligible** and taken | `spec/flow-definition.md` section 3, ADR 0004 rule 2 |
| a `pathEnded` with reason **`end`**, at `quarantine` | ADR 0014 rule 5 |
| run outcome **`completed`** | `spec/run-state.md` section 3 — *"every live path reached an `end` node"*. **Not `failed`**: nothing ended with *no eligible edge* |
| dispatched: `r9:extract:-:0` only | `quarantine` is an `end`; nothing follows it |

**This row is the one W2's conformity pass found the code getting wrong**, and it has never run on a
real scheduler.

**2. Suspend, resolve, resume.** A local flow: a fan-out whose second branch is a **non-optional**
task that throws.

| | derived from |
|---|---|
| the branch settles `user_action` — `task.failed` then `task.user_action`, one record on the second | ADR 0007 rule 2, `OR-R3`; P2's measured fact 1 |
| `branch.suspended`, and the join keeps waiting under **both** policies | `spec/join-policy.md` section 3 — suspended decrements nothing |
| run outcome **`awaiting_action`**, outranking the other branch still being live | `RN-R7` |
| `isTerminal` is **false**, so the harness must resolve rather than wait | `RN-R12` |
| `resolve(id, 'done', …)` appends a resolution and emits `branch.resumed` | ADR 0004 rules 4-6, `RS-R2` |
| the branch then routes to the join and **arrives** | `RS-R2` — a resolution supplies an outcome for a dispatch that already happened |
| final outcome **`completed`**, `regions.split.settled` = `{0: arrived, 1: arrived}` | `RN-R9` — a resolved node is indistinguishable from one that settled that way |

**3. A refusal that stops a run.** A worker returning `{ fn: () => 1 }`, in an **inline** pool.

| | derived from |
|---|---|
| the result reaches the driver intact and `structuredClone` refuses it | P2's measured fact 2 |
| `UncloneableResult`, caught at the listener boundary, reported through `onRunFailure` | `OR-R6`, `OR-R10` |
| a `{ kind: 'stopped' }` element in the sequence | ADR 0014 rule 1 |
| run outcome **`stopped`**, outranking everything | `RN-R8` |
| **no record for the refused settlement** | `OR-R6` writes nothing; the driver parses and refuses before appending (W5's *What broke* 1) |

**4. The harness's inbound step.** `RunOptions` gains a way for a row to say *"when this branch
suspends, resolve it as X"*. It fires from `onFoldInput` on a `branch.suspended` event, so it is
driven by the sequence rather than by a timer, exactly as termination is.

**Out** — named rather than left implicit

- **Changing `src/`.** Every rule these rows exercise is already implemented. If a row fails, that is
  a finding about the code and it goes in the Record — **not a fix inside this item**, because a row
  whose expectations were adjusted to match output has stopped being a test.
- **Making `OR-R6`'s pool-dependence normative.** Reported as [Q61](../open-questions.md). A spec
  change is its own change with its rationale stated (`spec/README.md` rule 1), and `OR-R6` is W1's.
- **A second policy column.** W5's rows run both policies where the comparison means something; rows
  1 and 3 have no fan-out and row 2's answer is the same under both, which is itself the point of
  `branch.suspended`. Stated so a reader does not read the missing column as an oversight.
- **[Q53](../open-questions.md), [Q52](../open-questions.md), [Q44](../open-questions.md).**
  Untouched.

## What this item edits outside its `Owns`

**Nothing.** The table is here and empty on purpose: `doc/workflow.md` section 7 rule 2 as P1's retro
amended it asks a serial item to declare its exceptions, and the honest answer for this one is that
it has none. `examples/**` is the whole of it.

| file | whose | what, and why it cannot be avoided |
|---|---|---|
| *(none)* | | |

**If that changes, it is a finding and it goes in the Record.** W5 declared six exceptions and needed
seven; the one it missed was caught by a reader.

## Verification

| Clause | How it is run |
|---|---|
| L0 | `npm run check:spec` (8), `check:source` (10), `check:scheduler` (5), `npm run lint`, `npm run typecheck` (5 configs), `deno publish --dry-run` |
| L1-L5 | `npm test`, `npm run test:deno`, `npm run test:browser:all` — 288 assertions must stay green. **This item changes no `src/` file, so a failure here is W6's fixture, not the library's** |
| **L6** | `npm run test:l6` and `npm run test:l6:deno` — **eleven** rows, and the assertion-count floor in `examples/l6.ts` updated to match |
| runtimes | L0-L5 in all five; L6 in Node 24 and Deno (`RT-R10`) |
| pass 2 | **two readers**, per `doc/workflow.md` v0.3: conformity (spec first, code second) and adequacy (mutation, chosen from the rule ids) |

**Routing cases** (`TEMPLATE.md` asks each in turn):

| Case | | Covered by W6 |
|---|---|---|
| `user_action` ([Q17](../open-questions.md)) | **this is the item** — row 2, and the first time it occurs outside a fixture |
| A branch routed away from its join ([Q4](../open-questions.md)) | **no** — P1's case, covered at L6 by W5's rows 5 and 6 |
| No matching decision edge ([Q10](../open-questions.md)) | **no.** `FD-V7` refuses the shape at instantiation; `FD-R1` is unreachable through the public API and W3 says so |
| A duplicate task id ([Q13](../open-questions.md)) | **no.** `ID-R1` is covered at L2, and row 3 exercises a *different* refusal reaching the same `OR-R10` path |
| Nested fan-out ([Q6](../open-questions.md)) | **not applicable** — `FD-V15` refuses it |

## Record

*Filled in when the item is done. Delete the italic lines.*

**Gate — what ran.**

| Clause | Verdict | Runtimes | Notes |
|---|---|---|---|
| L0 | | | |
| L1-L5 | | | |
| L6 | | | |
| conformity reader | | n/a | |
| adequacy reader | | n/a | |
| re-run at `<sha>` | | | |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| | | |

**What broke.**

**What this taught.**

**Questions raised.** *Q61-Q70; unused numbers are skipped, never reissued.*
