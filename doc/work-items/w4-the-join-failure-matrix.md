# W4 — The join/failure matrix, and the answer to Q4

**Status:** in review - built and gated in five runtimes; the spec-conformity pass has not run
**Plan:** [P1](../plans/p1-what-satisfies-a-join.md)

```
Spec:       spec/join-policy.md in full - section 2 (the six events and Q5's four
            cases reduced to three), section 3 (what each policy NAME means),
            section 4 (the seam contract, and what `unsatisfiable` is not).
            spec/flow-definition.md section 4 (regions). It writes no spec: the
            result is an ADR, because it is a decision rather than a rule
Owns:       test/matrix/**, doc/decisions/0003-*.md
            (no other item may edit these)
Inputs:     both policies as shipped - src/fold/policies.ts (W2); the driver's
            join seam - Driver.joinStatusOf(), dispatchedIds(), snapshot(),
            onRegionEvent, resolve() (W3); four flow definitions, three of them
            from spec/examples/valid (fanout-join, fanout-failure,
            p1-routed-away) and one W4-local, declared below
Outputs:    (1) the matrix itself - every Q5 case x both policies, every cell
            carrying a status, a describe, whether the join routed, and a
            quiescence verdict; (2) a rendered table a person can read; (3)
            **ADR 0003**, which answers Q4 from the matrix rather than from the
            argument P1 refused as sufficient
Depends on: W2 (the policies), W3 (the seam)
Blocks:     W5 - a real run against a policy nobody has chosen is a run with two
            possible readings
Tests:      the matrix IS the test. Every cell's expected value is written by
            hand from spec/join-policy.md sections 2-4 before it is run; a cell
            whose expectation came from output is a snapshot, not a test
            (doc/workflow.md section 5)
Gate:       L0-L5 in all five runtimes, then a spec-conformity pass
Reserves:   Q42-Q50, ADR 0003 and 0010-0012
```

**ADR 0003 is this item's, and it is the only number in the block that is not free.** It has been
held for Q4's answer since P1 was written. `0010-0012` are for anything else W4 turns up; they are
skipped if unused and never reissued.

## Scope

**In**

1. **The matrix.** Rows are the ways a branch can finish, columns are the two policies
   `spec/join-policy.md` section 3 names. Every cell reports the same five things: the region event
   stream, the policy's `status`, its `describe`, whether the driver routed out of the join, and a
   **quiescence verdict** (below). `JP-R3` requires every cell to answer one of three statuses and
   **no cell to be blank** — a blank cell is a spec hole with an address.
2. **Q5's rows, as `spec/join-policy.md` section 2 reduced them** — four cases, three events, and
   two of the four are one:

   | Row | flow | what the branch does |
   |---|---|---|
   | all arrive | `fanout-join` | the control row. Both policies must agree, or the experiment has no baseline |
   | **routed away** | `p1-routed-away` | a decision inside the branch sends it to an `end`. **P1's case** |
   | lost — resolved `failed` | `fanout-join` | `user_action`, then a human resolves it `failed`, and no edge opts in |
   | lost — settled `failed` | **W4-local** | an `optional` node fails with no `on: ["failed"]` edge. The corpus has no such flow; see Out |
   | optional-null | `fanout-failure` | `state = 'failed'` and `resolve(null)` are two lines of one branch, so this is the *same* event as a failure — the row exists to show that, not because it is a fourth case |
   | suspended, unresolved | `fanout-join` | the join keeps waiting and **that is correct**. The row that separates *"waiting on a human"* from *"stuck"* |
   | resumed to `done` | `fanout-join` | suspension is not terminal (ADR 0004 rule 4): the branch arrives afterwards |
   | **all branches exit** | `fanout-failure` | nobody arrives at all. `live-token`'s count reaches zero with zero arrivals — **the row `JP-R8` exists because of** |

3. **A quiescence verdict per cell**, which is what makes a hang reportable. Computed from the
   driver's public surface only — every dispatched task has a record, no node is suspended, and the
   join has not fired ⇒ **`stuck`**. This is [Q7](../open-questions.md)'s detection half, and it
   needs no clock: quiescence is a decidable predicate over the log, so a timeout would only add a
   wall-clock guess on top of an already-certain answer. Whether a join may *also* time out is what
   W4 reports on.
4. **`JP-R7` and `JP-R8`, whose tests `spec/join-policy.md` assigns to W4.** Both one-line variants
   are built **in `test/matrix/` under their own ids**, run against the same rows, and shown to make
   the two named policies agree where the spec says they differ. That is the evidence for calling
   them third policies rather than repairs — not an argument, a column.
5. **`JP-R4` as a column that exercises every one of the six events**, which the rule names as W4's
   to own.
6. **A rendered table.** `doc/workflow.md` section 1: a work item ends in something a human can look
   at. The table is generated from the same cell values the assertions use, and **the assertions come
   from the spec** — the rendering is a by-product, never the source of an expectation.
7. **ADR 0003.** Q4's answer, with the matrix as its evidence and the losing policy's failure stated
   as a cell rather than as a worry.

**Out** — named rather than left implicit, with where it goes instead

- **Changing either policy.** If a row shows a policy behaving badly, that is the result. `JP-R7`
  and `JP-R8` exist precisely to stop W4 fixing what it is measuring.
- **A per-join policy choice** ([Q5](../open-questions.md)'s remainder). P1 runs one policy per run
  so the matrix has two columns rather than a product; whether a *flow author* should choose is a
  question this item can only sharpen.
- **Run-level outcome per cell.** That is `spec/run-state.md`'s and W2's. W4 uses the quiescence
  verdict, which is about the *join*, and reports separately on whether run state can express a
  stuck run at all.
- **Adding a flow to `spec/examples/`.** The corpus has no flow with an `optional` branch node and
  no `on: ["failed"]` edge, which is the only way `branch.lost` is reached **by settling** rather
  than by resolution — a non-optional task out of retries becomes `user_action`, not `failed`
  (`CLAUDE.md`, and `../fyflow-scheduler/core/FyflowScheduler.ts:894-897`). W4 defines that flow
  **locally in `test/matrix/`** and reports the corpus gap rather than editing `spec/`, which is
  W1's and is a spec change with its own rationale (`spec/README.md` rule 1).
- **A library-level stuck-join detector.** W4 computes the verdict from the public surface to prove
  it is computable. Making it an affordance is a change to `src/`, which W4 does not own.
- **A real scheduler.** W5's, rung L6.

## Verification

| Clause | How it is run |
|---|---|
| L0 | `npm run check:spec`, `npm run check:source`, `npm run lint`, `npm run typecheck` (three tsconfigs), `deno publish --dry-run` |
| L1-L4 | `npm test` — the existing suites must stay green; W4 changes no `src/` file, so a failure here is W4's fixture, not the library's |
| **L5** | **the matrix**, in `test/matrix/`, run by the same runner: `npm test`, `npm run test:deno`, `npm run test:browser:all` |
| runtimes | **all five** — node 24, deno, chromium, firefox, webkit. `RT-R1`: a rung reported green without naming its runtimes ran in one |
| spec-conformity | `doc/workflow.md` section 6, fresh context, spec first and code second. **Four passes have run and none came back empty**; this one reads a *test-only* item, which none of the four did |

**Routing cases** (`TEMPLATE.md` asks each in turn):

| Case | | Covered by W4 |
|---|---|---|
| A branch routed away from its join ([Q4](../open-questions.md)) | **this is the item** | it is a row, in both columns, and ADR 0003 is written from it |
| `user_action` ([Q17](../open-questions.md)) | **yes** — three rows: suspended-unresolved, resumed-to-`done`, resolved-to-`failed`. What a join does while a branch is suspended is the half Q17 left to W4 |
| No matching decision edge ([Q10](../open-questions.md)) | **yes, inside a region** — that is `branch.lost`, and it is two rows. Outside a region it is `FD-R1`'s run failure and W3 covers it |
| A duplicate task id ([Q13](../open-questions.md)) | **not applicable** — `ID-R1` refuses it before the log is written, and no matrix row reaches it |
| Nested fan-out ([Q6](../open-questions.md)) | **refused upstream** by `FD-V15`. No `branchPath` in this matrix is deeper than one element |

## Record

**Gate — what ran.** `RT-R1`: a rung is not green until it is green where it is required to run, and
a row that does not name its runtimes ran in one.

| Clause | Verdict | Runtimes | Notes |
|---|---|---|---|
| L0 | **RAN** — pass | **Node, browser, Deno** | `tsc` × 3 configs, `deno check`, `deno lint`, `check-spec` (8), `check-source` (6), `deno publish --dry-run`. W4 changes no `src/` file, so `check-source` is unmoved by construction — it ran anyway, because *"the item didn't touch that"* is a claim rather than a check |
| L1-L4 | **RAN** — pass | **all five** | the 210 assertions W1-W3 left, unchanged |
| **L5** | **RAN** — pass | **Node 24, Deno, chromium, firefox, webkit** | **42 assertions**: nine rows × two policies, plus `JP-R1`-`JP-R4`, the `null` payload, the divergence set, Q7's verdicts, and `JP-R7`/`JP-R8` under their own ids |
| **252 assertions, identical in all five runtimes** | | | the browser runner asserts the parity rather than assuming it |
| mutation | **RAN** — **1 survivor, and it was a real hole** | Node | six mutations: two driver `settleJoin` deletions, the `JP-R7` line written into `src/`, `live-token` decrementing on `suspended`, the matrix's own verdict, and the join's payload. Five caught with named rows; the sixth is the finding below |
| spec-conformity | **NOT RUN** | — | `doc/workflow.md` section 6 needs a **fresh context, spec first and code second**. Four passes have run in this repo and **not one came back empty.** This clause is outstanding and W4 is not done until it has run |
| re-run at `<sha>` | **NOT RUN** | — | there is nothing to act on yet |

**What broke.**

**One mutation survived the entire suite, and it was a normative claim with a rationale paragraph.**
`spec/join-policy.md` section 4 v0.7 says *"a satisfied join carries `null` downstream"* and spends a
paragraph on why: **which** terminal event satisfies a join is decided by fan-out completion order,
which `doc/concept.md` section 5 calls genuinely non-deterministic, so a join forwarding *"whichever
branch finished last"* would make a run's **data** order-dependent. Replacing the driver's `null`
with `{}` passed **all 251 assertions in five runtimes**. The claim had a rule's weight, a whole
argument, and no assertion. The matrix asserts it now, on every cell where a join fired.

The other five mutations were caught with the right rows named — including the `JP-R7` line written
into `src/fold/policies.ts`, which fails four cells and the divergence set. That is the regression
`JP-R7` was written to forbid, and it is now caught rather than described.

**Three things the matrix found that are nobody's to fix here**, so they are Q ids rather than
edits:

| | |
|---|---|
| [Q42](../open-questions.md) | The stuck-join predicate exists **only in a test**. W4 computed it from the driver's public surface to prove it is computable; the library still cannot tell a caller *"waiting on nothing"*, only *"waiting on a person"* |
| [Q43](../open-questions.md) | **Run state calls a permanently stuck run `completed`.** Folded by hand, the `routed-away`-under-`arrival-count` run comes out `completed` — every node settled, one path ended at an `end`, and a join that will never fire is never consulted. `regions` already records `{0: arrived, 1: exited}`, so the data is present and section 3's precedence does not look at it. **Not [Q41](../open-questions.md)**: it is false with the wiring as well as without it, and it was checked both ways |
| [Q44](../open-questions.md) | The corpus cannot express an `optional` branch node with no `on: ["failed"]` edge — the only shape reaching `branch.lost` **by settling**. Two flows are W4-local as a result |

**And the mutation harness lied first, again.** Its first run reported all six mutations SURVIVED,
because the `node` it found on `PATH` could not execute TypeScript and every run produced empty
output — which contains no `FAIL`. W2's record already carries this shape under a different cause.
The harness now refuses to report a verdict unless the output contains `all passed` or
`FAILURE(S)`; **a mutation harness that cannot fail is the same defect as a test that cannot fail**,
and it has now produced a false reading in two consecutive work items.

**What this taught.**

- **The argument was right about the winner and wrong about the size of the effect.** P1 refused
  live-token accounting as *sufficient* and built both policies anyway. The winner is the one the
  leaning named — and the matrix found that arrival-counting fails on **six of nine rows**, only one
  of which is the routed-away case P1 was written around. An ordinary `optional` task failing hangs
  it. Deciding by argument would have shipped the same policy with a false model of why, and the
  false model is what a later reader would have re-litigated.
- **`doc/concept.md` section 6's leanings are now three for three**, which is worth noticing rather
  than celebrating. What kept this one honest was not scepticism, it was **construction**: two
  guard rules written before either policy existed, the losing policy shipped rather than described,
  and a matrix in which it could have won. [Q24](../open-questions.md) is where to watch the pattern
  next.
- **Every one of the eighteen hand-written cells matched on the first run, and in this repository
  that is a reason for suspicion rather than comfort.** Four conformity passes have found the same
  shape — the code correct and the tests pointed at the wrong half — so the matrix was
  mutation-tested *before* ADR 0003 was written rather than after. That is what found the `null`
  payload hole, which no cell expectation would ever have reached.
- **A test-only work item still has an L0 clause and still owns a rung**, and the ladder had nothing
  to say about it. W4's declaration had to state what L0 means for an item that changes no `src/`
  file. That is the third item to hit a variant of *"a declared output with no rung"* — for the
  retro.

**Questions raised.** Q42-Q44 from the reserved block; Q45-Q50 are skipped, never reissued.

**ADR 0003 is written**, and **ADR 0010-0012 were reserved and none was used.** Everything else W4
found is a question rather than a decision.
