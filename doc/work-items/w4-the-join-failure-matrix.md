# W4 — The join/failure matrix, and the answer to Q4

**Status:** done - gated in five runtimes, **two** review passes run and every finding acted on
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
   | optional-null | `fanout-failure` | `state = 'failed'` and `resolve(null)` are two lines of one branch, so what reaches the flow is an ordinary `failed`. **Corrected after review:** this flow's optional node has an `on: ["failed"]` edge, so the branch **exits** — it does not show the collapse to `branch.lost`, which `lost-settled` and `lost-resolved` show between them. The row earns its place as a *different routing path* to the same event, not as a fourth case |
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
8. **Added after review, and outside the scope above:** `test/matrix/region-shapes.test.ts`, covering
   **two sequential fan-outs sharing one `end` node**. A region *shape* is a different axis from
   Q5's cases and this item did not declare it. It is here because the test-adequacy pass measured a
   **silent hang** one line away — no throw, no `onRunFailure`, the second join simply never fires —
   in the same commit that published an ADR about attributing hangs. The shape itself is
   [Q45](../open-questions.md). Widening a declaration mid-item is worse than not needing to; leaving
   this uncovered was worse than both.

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
| L0 | **RAN** — pass | **Node, browser, Deno** | `tsc` × **4** configs — see *What broke*, the fourth did not exist when this item started — plus `deno check`, `deno lint`, `check-spec` (8), `check-source` (6), `deno publish --dry-run` |
| L1-L4 | **RAN** — pass | **all five** | the 210 assertions W1-W3 left, plus one W4 added to a W3 suite (below) |
| **L5** | **RAN** — pass | **Node 24, Deno, chromium, firefox, webkit** | **47 assertions** across three suites: the nine-row matrix, `JP-R7`/`JP-R8` under their own ids, and the region-shape suite the review added |
| **257 assertions, identical in all five runtimes** | | | the browser runner asserts the parity rather than assuming it |
| mutation | **RAN, twice** | Node | W4's own sweep: 6 mutations, 5 caught, 1 real hole. The review's sweep: **63 mutations, 8 real survivors**. All 8 are now caught, verified by re-running each |
| **spec-conformity** | **RAN** — **2 blocking, 4 defects, 4 notes** | n/a | fresh context, spec first and code second. It re-derived all eighteen cells from `spec/join-policy.md` independently and they matched |
| **test adequacy** | **RAN** — **2 blocking, 5 defects, 9 notes** | n/a | a second reader on *"would these tests have noticed"*, by mutation. Not part of `doc/workflow.md` section 6 as written — see *What this taught* |
| re-run at `<sha>` | **RAN** — pass | all five | the gate above **is** the re-run acting on both passes; it lacks only the commit that carries it |

**Five passes have now run in this repository and not one has come back empty.**

**What broke.**

**1. `optional: true` was inert, so the flow this item added to reach `branch.lost` by settling
proved nothing about the road it names.** Both readers found it independently. `Fake.settle` took
the terminal state from the scenario script and never looked at the node, so it emitted
`terminalState: 'failed'` for a **non-optional** task — an event stream `fyflow-scheduler` 0.3.0
cannot produce, because both `state = 'failed'` assignments live inside `if (task.optional)`
(`../fyflow-scheduler/core/FyflowScheduler.ts:894-897`). Three mutations survived the whole suite:
deleting `optional: true` from either local flow, and pointing the `lost-settled` row at the corpus
`fanout-join`. A fourth — making the **driver** dispatch `optional: false` for every task — survived
W4 and was caught only by a W3 suite.

The fake now **refuses** an impossible settlement, and checks it against what the *driver*
dispatched rather than against the definition, so a driver that dropped the flag is caught here too.
All four mutations now abort the fixture with a message naming the upstream line.

**2. ADR 0003 enumerated five mechanisms where there are two**, and the item's own Scope repeated
the error. `optional-null` and `all-exit` both reach an `end` node — the first through an
`on: ["failed"]` edge rather than a `when` — so their event streams are branch-index permutations of
`routed-away`'s and both policies are indifferent to the difference. The matrix distinguishes **two**
mechanisms across six rows: *reached an `end`*, and *lost with no eligible edge*. Corrected **in
place** in ADR 0003 under a dated *Correction* heading, per `doc/decisions/README.md` — the decision
and its reason are unchanged, and the substantive claim (an ordinary `optional` failure is enough to
hang arrival-counting) is carried by `lost-settled` and `lost-resolved`, which are genuinely the
second mechanism.

**3. A valid two-region flow silently hangs, and nothing in the repository would have noticed.** The
test-adequacy pass found it and measured it. Two sequential fan-outs sharing one `end` node validate
clean: `FD-V15` refuses only **nested** fan-out, and `end` nodes are exempt from `FD-V13`, `FD-V19`
and `FD-V22`, so one `end` belongs to two regions. `src/driver/driver.ts` attributes a terminal
event to the region the branch was **opened in**, and its comment says attributing by node
*"made the wrong join see a second terminal event for a branch that had already arrived, breaking
JP-R5"* — **that regression had no test in any of the twelve suites.** Reverting either of the two
lines produces no throw and no `onRunFailure`: the second join never fires and the run stops. That
is the silent hang ADR 0003 claims is now attributable, reachable by a one-line regression, in the
same commit that published the ADR.

`test/matrix/region-shapes.test.ts` covers it. **This is outside W4's declared scope** — the
declaration says Q5's cases × two policies, and a region *shape* is a different axis. It was widened
deliberately rather than deferred, and the shape itself is now [Q45](../open-questions.md).

**4. `a join fires at most once` could not fail** — found by both readers. Removing the `firedJoins`
latch leaves the dispatch count at 1 anyway: the second `settleJoin` re-enters the join's edge,
`ID-R1` refuses the duplicate *before* `addTask`, and the throw is caught at the listener boundary
and turned into a silent `failRun`. The test counted dispatches, so it was passing on `ID-R1`'s
refusal while the run it described was dead. **W4 added one line to `test/driver/driver.test.ts`,
which is W3's owns** — a deliberate exception, taken because the assertion is one line, the file's
author is not available to a review that ran inside W4's gate, and `spec/join-policy.md` section 4's
*"at most once"* had no working assertion anywhere in the repository. Recorded here rather than done
quietly.

**5. Three assertions that could not fail, in W4's own tests.** The rendered table's test checked
row keys and a line count, so emptying every cell body survived it. `ok(fired.length >= 10)` sat
exactly on the current value. And the `null`-payload assertion — added by W4's *own* mutation sweep
one day earlier — passed a harness that reported `null` unconditionally, **because every payload in
every cell was `null`.** It now reads the same map as an assertion that an ordinary edge forwards a
real result, so a constant satisfies neither.

**6. W4's own files were never typechecked.** `typecheck:node` and `typecheck:browser` both override
`include` to `["index.ts","src/**/*.ts"]`, and `typecheck:deno` is `deno check index.ts src/`. The
base `tsconfig.json` does include `test/**`, and **no script ran it** — a deliberate type error in
`test/matrix/render.ts` passed all four L0 commands. The L0 row this item first wrote said *"`tsc` ×
3 configs"*, which was true and told a reader nothing, because all three cover the one tree W4 did
not touch. `typecheck:tests` is added to `package.json` and wired into `typecheck`.

**7. Nothing asserted that the join's answer is order-invariant.** `JP-R1`'s determinism test
re-runs the *same* order twice, which proves purity. Fan-out completion order is this repository's
central non-determinism (`doc/concept.md` section 5, `CLAUDE.md`) and no row permuted it. There is
now one, and it records the honest half: `arrival-count`'s `describe` **is** order-dependent — it is
a display value — while its `status` is not, which is why nothing routes on `describe`.

**What this taught.**

- **A second reader with a different question found different things, and the split was worth its
  cost.** `doc/workflow.md` section 6 defines pass 2 as one reader asking two questions — *does this
  do what the spec says* and *would these tests have noticed*. Run as two readers, the first found
  the ADR's mis-enumeration and the inert `optional` flag; the second found the two-region hang, the
  order-invariance gap, and the untypechecked tree. **Only one finding was found by both from
  different directions** (the latch), and the overlap on `optional` came from opposite ends. The
  proposal for the retro is not "always run two" but: **the two questions in section 6 are different
  enough that one reader answers whichever it read first.**
- **A mutation sweep run by the author is worth running and is not a substitute for one run by a
  reader.** W4's own sweep was six mutations chosen from what W4 believed was fragile; the review's
  was sixty-three chosen from what the *spec* claims. The author's sweep found a real hole (the
  `null` payload). The reader's sweep found that the author's fix for it **still could not fail**.
- **This is the fourth occurrence of "a declared output with no rung"**, and this time the missing
  rung was L0 itself. `doc/workflow.md` section 4's ladder has no row for the toolchain covering the
  files a work item actually adds — and the two items before this one hit variants of the same
  shape. That is two occurrences in different work items with a stated argument, which is what
  section 6 rule 2 asks of a proposed rule. **For the retro.**
- **The argument was right about the winner and wrong about the size of the effect** — and then the
  review found that W4 was wrong about the *shape* of the effect, in the ADR's own headline
  paragraph. The decision survived all of it, which is the case for writing decisions down in a form
  that can be checked against a test rather than against a memory.
- **Every one of the eighteen hand-written cells matched on the first run, and a reader re-derived
  all eighteen independently and agreed.** The middle of this test suite was sound; **every finding
  was at its edges** — the fake's fidelity, the harness's own reporting, an untested region shape, a
  count in prose. That is a different failure profile from the four earlier passes, which all found
  the tests pointed at the wrong half of a correct implementation.

**Questions raised.** Q42-Q45 from the reserved block; Q46-Q50 are skipped, never reissued.

| Q | | raised by |
|---|---|---|
| Q42 | Where does the stuck-join predicate live? It exists only in a test | W4 |
| Q43 | Run state calls a permanently stuck run `completed`, and `regions` already holds the data to know better | W4 |
| Q44 | Should `spec/examples/` carry runtime-behaviour fixtures, or only definition-validation ones? | W4 |
| Q45 | Two sequential fan-outs sharing one `end`: refuse the shape, support it explicitly, or leave it legal by omission? | the test-adequacy pass |

**ADR 0003 is written and carries one dated in-place correction.** **ADR 0010-0012 were reserved and
none was used.**

**What is still open in this item, deliberately.** `JP-R5`'s ordering clause remains unfalsifiable
under `FD-V9`, exactly as `spec/join-policy.md` predicts; W4 inherited it and did not change it. The
`in-flight` verdict is unreachable from any current row, so the assertion that no cell reports it is
an assertion about an empty set — kept because it is what makes the other three verdicts a closed
vocabulary, and named here so a reader does not mistake it for coverage.
