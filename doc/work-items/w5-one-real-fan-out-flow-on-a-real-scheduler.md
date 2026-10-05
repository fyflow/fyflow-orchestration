# W5 — One real fan-out flow on a real scheduler, and the input sequence that lets a real run be folded

**Status:** done — built, gated in five runtimes (L0-L5) and two (L6), **both review passes run and every finding acted on**, and committed. *(This read `in review` with *"what remains is the commit"* until 2026-10-03, when `npm run state` — which reads this line — reported it. The commit landed and [P1](../plans/p1-what-satisfies-a-join.md) is complete. [W114](w114-claude-md-is-guidance-and-npm-run-state-is-the-index.md))*
**Plan:** [P1](../plans/p1-what-satisfies-a-join.md) — **this item closes it**

```
Spec:       spec/run-state.md in full - section 2 (what a run holds), section 3
            (the outcome vocabulary and its precedence), section 6's last bullet,
            which names Q41 as "W5's to wire". spec/join-policy.md section 4 (the
            seam). spec/task-id.md (ID-R1, on a real addTask for the first time).
            It CHANGES spec/run-state.md - a sixth outcome and one new input -
            and spec/runtime-targets.md RT-R1, which carries Q33's answer. Both
            are declared exceptions below, not quiet edits
Owns:       examples/**, scripts/check-scheduler.mjs, tsconfig.examples.json,
            test/driver/fold-inputs.test.ts, test/fold/stuck.test.ts
            plus six declared exceptions - see *What this item edits outside its
            Owns*: src/driver/driver.ts, src/fold/run-state.ts,
            spec/run-state.md, spec/runtime-targets.md,
            scripts/check-source.mjs, and package.json. The two new test files
            sit in W2's and W3's directories and are NEW files, which is a
            weaker claim than editing theirs; one one-line edit to
            test/fold/fold.test.ts is a seventh exception
Inputs:     fyflow-scheduler 0.3.0 from ../fyflow-scheduler, per
            ADR 0013 - `file:../fyflow-scheduler` under Node,
            examples/deno-import-map.json under Deno, nothing in the browser.
            Both join policies as shipped (src/fold/policies.ts, W2); the
            driver and its seam (src/driver/**, W3); the fold (src/fold/
            run-state.ts, W2); three corpus flows - fanout-join and
            p1-routed-away for the runs, and the registry's predicate and
            workerType names, which the example must register for real
Outputs:    (1) six real runs - two flows x two payloads x both policies - each
            reaching a run-state outcome with no clock; (2) the every-node-
            settles assertion (Q32); (3) an ordered FoldInput sequence the driver
            produces, which is Q41 and which nothing produced before, plus
            **ADR 0014**; (4) `stuck` as a run outcome, which is Q43 and Q42's
            "where does it live", plus **ADR 0015**; (5) Q33's answer in RT-R1;
            (6) a rendered run table a person can read
Depends on: W2 (the fold and both policies), W3 (the driver and the seam),
            W4 (ADR 0003 - a real run against a policy nobody had chosen would
            have had two readings)
Blocks:     nothing. P1's retro follows it
Tests:      the six runs ARE the test. Every expected value is written by hand
            from spec/run-state.md sections 3-4 and ADR 0003's matrix BEFORE the
            run, and each is derivable without running anything: the matrix
            already fixes what each policy does on these two flows, and section 3
            fixes what run state a settled flow has. A cell taken from output is
            a snapshot, not a test (doc/workflow.md section 5)
Gate:       L0-L6. L0-L5 in all five runtimes (RT-R1); **L6 in Node 24 and Deno**
            and not in the browser, which is Q33's answer and Q52's remainder.
            Then a spec-conformity pass with a fresh context - run as TWO
            readers, per W4's proposal
Reserves:   Q51-Q60, ADR 0013-0015 - all three ADRs spent, Q51-Q53 used
```

**ADR 0013 is already spent**, before this item started work: the `Inputs:` line above could not be
written honestly until it existed. See *Settled before the declaration* below. `0014` and `0015` are
allocated by the Scope below; `Q51` and `Q52` are allocated; `Q53-Q60` are for whatever this item
turns up, and are skipped rather than reissued if unused.

---

## Settled before the declaration

`doc/workflow.md` section 1 rule 1 — *a work item that cannot state its verification gate is not
ready to start.* This one could not state its **`Inputs:`** line either. The repository had **no
dependency on `fyflow-scheduler` at all**: no `dependencies` block in `package.json`, no `imports`
map in `deno.json`. That was deliberate — W3's `SchedulerLike` is structural precisely so the driver
could be gated without one — and W5 is the first thing that needs the real library.

It was settled first, as [Q51](../questions/q51.md) →
**[ADR 0013](../decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)**.
Four things were measured rather than assumed, and **each contradicted something this repository
had written down or was assuming**:

| measured | what this repo said |
|---|---|
| npm `fyflow-scheduler` and JSR `@fyflow/scheduler` both exist, both at **0.2.1** | *"not yet published to npm"* — true of 0.3.0, and it reads as *"not published"*. `spec/runtime-targets.md` section 1 **assumed** the JSR package; nobody had checked |
| Node 24 **cannot** import the sibling's TypeScript source — `core/threadWrapper.ts:5` value-imports an `interface` — while Deno can | nothing; this is `RT-R9`'s failure class one repository up, and it is [S9](../scheduler-upstream.md) |
| a **typed** `.ts` worker runs under Node 24, `inline` and threaded | `AGENTS.md` §3: *"The file must be JavaScript."* Also S9 |
| `../fyflow-scheduler/dist/` was **stale** — a pre-0.3.0 build with no `_failOrphanedTask` and no `getAdmissionQueue`, behind a `package.json` reading `0.3.0` | nothing, and that is the point: **the three directories existed**, which invites the assumption that they are current and asserts nothing. `ADR 0013` rule 5 and `scripts/check-scheduler.mjs` are what turn the assumption into a check |

The fourth is why ADR 0013 rule 5 exists and why `scripts/check-scheduler.mjs` is in `Owns:` rather
than in a comment.

## Scope

**In**

1. **Six real runs, on a real scheduler with real workers.** Two flows × two entry payloads × both
   policies. Every expected value comes from ADR 0003's matrix and `spec/run-state.md` section 3.

   | flow | entry payload | `live-token` | `arrival-count` |
   |---|---|---|---|
   | `fanout-join` | either | `completed` | `completed` — the control row; both policies must agree or the runs have no baseline |
   | `p1-routed-away` | high confidence | `completed` | `completed` — **both branches arrive**, so the predicate returning `false` is the row that makes `isLowConfidence` an assertion that can fail |
   | `p1-routed-away` | low confidence | `completed` | **`stuck`** — P1's own case, on real workers for the first time |

   The last cell is the plan's question executed rather than simulated. W4 measured it against a
   fake scheduler; this is the same claim with `FyflowScheduler`, `FyflowTask`, `WorkerManager` and
   a real worker in the loop.

2. **The every-node-settles assertion** ([Q32](../questions/q32.md)). Every id in
   `Driver.dispatchedIds()` has a non-`null` `effectiveOutcomeOf()`. Cheap insurance since 0.3.0's
   `_failOrphanedTask` rather than the validity gate it was written as — and it is the assertion that
   would catch a task the scheduler accepted and never settled, which no fixture can reach.

3. **[Q41](../questions/q41.md) — the ordered `FoldInput` sequence, and ADR 0014.**
   `spec/run-state.md` section 6 names this *"W5's to wire"*. `FoldInput` has five variants and
   **`pathEnded` has no producer anywhere**: the driver reports a path ending at an `end` node only
   as a *region* event, and only inside a region; outside one it reports nothing at all. Records
   leave through `snapshot()`, region events through `onRegionEvent`, dispatches through nothing,
   and a refusal through `onRunFailure` — four channels with no shared order, so the one ordered
   value `RN-R3` and `OR-R5` are *about* cannot be held.

   **This is not optional garnish for W5 and the reason is the gate, not the tidiness.** L6's hard
   question is *how do you know the run is over without racing* — and the honest answer needs no
   clock: a run is over when its **run-state outcome leaves `running` and `awaiting_action`**, which
   is a decidable property of the fold and transitions only when every dispatched node has settled.
   Without the sequence the harness has to poll `scheduler.completed` (which fires on **every**
   drain), or sample `stats`, or sleep — all three are the race, and the third is how a green L6 gets
   written that proves nothing.

4. **[Q43](../questions/q43.md) and [Q42](../questions/q42.md) — `stuck` as a run outcome, and
   ADR 0015.** Run state today calls a permanently stuck run **`completed`**. The `arrival-count`
   cell above is that statement made about a real run this item has in hand, which is the strongest
   motivation available and is why this is fixed here rather than recorded again.

   **Q43's register entry says `regions` already holds the data to know better, and that is false —
   found by trying to act on it.** On `p1-routed-away` both policies fold to the *same* `regions`
   value, `{ "0": "arrived", "1": "exited" }`: every branch settles under both. What differs is
   whether the **join fired**, and nothing in the input vocabulary carries it. The fix therefore
   costs one new fact, not a precedence tweak — which is exactly the shape `spec/run-state.md`
   section 5 records three of, and this document is not going to make it four by narrowing the code
   until the claim is unobservable.

   Placing that fact, and the predicate that reads it, **in the fold** is also
   [Q42](../questions/q42.md)'s *"where does the stuck-join predicate live"* answered: not on
   `Driver` (W3's scope forbids growing the driver's copy of run truth), not re-derived by every
   consumer, and not left in a test. What remains of Q42 after this is an *ergonomics* question and
   is re-scoped in the Record rather than closed silently.

5. **[Q33](../questions/q33.md) — L6 runs in Node 24 and Deno, not in the browser.** The register's
   leaning was *"Node only for P1"* and its stated reason was *"a real worker file per runtime (`.ts`
   for Deno, `.js` for Node and the browser)"*. **That premise is false at Node 24** — measured, S9 —
   so one `.ts` worker file serves both and Deno costs a two-line import map. A leaning whose
   argument has been falsified is not a decision to inherit. The browser is genuinely expensive
   (Playwright, the worker as a separate bundle asset, a page to serve it from) and is
   [Q52](../questions/q52.md).

   **L6 living in `examples/**` rather than in `test/**` is what makes the browser exclusion
   structural** rather than a note: `scripts/build-browser-tests.mjs` globs `test/**/*.test.ts`, so a
   scheduler-importing suite placed there would be bundled for the browser by the same glob W3 built
   to stop later items maintaining a list.

6. **`examples/**` gets a rung, which is the fifth time this repository has had a declared output
   with none.** W4's Record: *"W4's own files were never typechecked"* — `typecheck:node` and
   `typecheck:browser` both override `include`, and `typecheck:deno` names `index.ts src/`. A new
   `tsconfig.examples.json` typechecks `examples/**` with `allowJs`/`checkJs`, and `deno lint` gains
   the directory. Stated up front because the pattern is now four-for-four and predicting it is
   cheaper than the retro finding it a fifth time.

7. **The toolchain ADR 0013 requires.** `S7` in `scripts/check-source.mjs` — no published file may
   name `fyflow-scheduler` or reach into `../fyflow-scheduler` in any import form, which is what turns
   rule 1 from a property into a rule. And `scripts/check-scheduler.mjs` — the linked package is the
   pinned version, and its `dist/` is not older than any file in its own publish allowlist.

8. **A rendered run table.** `doc/workflow.md` section 2: a plan ends in something a human can look
   at, and P1's exit artifact is partly this. Generated from the same values the assertions use;
   the assertions come from the spec, and the rendering is a by-product that is never the source of
   an expectation.

**Out** — named rather than left implicit, with where it goes instead

- **The browser at L6.** [Q52](../questions/q52.md), raised by this item from Q33's other half. Not
  deferred silently: the cost is stated there.
- **[Q44](../questions/q44.md) — what `spec/examples/` is for.** W5 runs three corpus flows
  unmodified and adds none, which is *evidence* for the current answer rather than a settlement of
  it. Sharpened in the Record; still W5's owner line in the register, and still open.
- **[Q45](../questions/q45.md) — two fan-outs sharing one `end`.** Not a shape either W5 flow has.
  W4's `test/matrix/region-shapes.test.ts` covers the behaviour; whether `spec/` should say anything
  is untouched.
- **[Q24](../questions/q24.md) — `JP-R7` and `JP-R8`.** The live question after ADR 0003 and
  explicitly **not** this item's. Neither refinement is built, and the `all-exit` row that motivates
  `JP-R8` is not one of the six runs.
- **[Q36](../questions/q36.md) — what a satisfied join carries downstream.** It carries `null`; the
  real runs record that faithfully. A real run is not evidence about what it *should* carry.
- **[Q37](../questions/q37.md) — who polls `joinStatusOf`, and how often.** Q42's fix removes the
  need to poll for the *stuck* answer specifically; who watches a *live* run is a different question
  and is untouched.
- **[Q19](../questions/q19.md) — performance at scale.** Two branches, six runs. P1's scope says a
  number at modest width, and W5 reports wall-clock per run as an observation, not a benchmark.
- **Flow-level retry, cancellation, durability, nested fan-out, map-style fan-out.** All out of P1
  by its own Scope.
- **A worker that reads its own task id to decide what to compute.** Available (`context.taskId`) and
  refused: [ADR 0001](../decisions/0001-routing-executes-in-the-driver-outside-the-scheduler.md)
  rule 2 says a worker computes and does not route, and a worker branching on its own branch index is
  the first step down that road. The two entry payloads are how the predicate gets both answers.

## What this item edits outside its `Owns`

Declared here rather than discovered in review. `doc/workflow.md` section 7 rule 2 — *if two work
items would edit the same file they are one work item* — is about **parallel** items; W2, W3 and W4
are done and nothing else is running, so the cost this rule prices is not being paid. What is still
owed is that each edit is named, justified, and small.

| file | whose | what, and why it cannot be avoided |
|---|---|---|
| `src/driver/driver.ts` | W3 | the ordered input sequence (Q41). The driver already holds the log and the ordering; nothing else can see all four channels at once |
| `src/fold/run-state.ts` | W2 | `stuck`, and the new input that makes it decidable (Q42, Q43) |
| `spec/run-state.md` | W2 | section 3 gains an outcome and section 2 a field. **A spec change with its rationale stated, never a side effect** (`spec/README.md` rule 1) — and section 5's table gains a fourth row, because Q43's register entry is a fourth instance of the same failure |
| `spec/runtime-targets.md` | W1 | `RT-R1`'s L6 row currently reads *"open — Q33"*. Answering Q33 without editing it would leave the answer only in a Record |
| `scripts/check-source.mjs` | W3 | `S7`, required by ADR 0013 rule 2 |
| `package.json`, `deno.json` | W3 | the `file:` devDependency, the L6 scripts, `check:scheduler`, `typecheck:examples`, and — after the reviews — `deno.json`'s own `lint` and `test:l6` tasks, which had drifted from `package.json`'s |
| `spec/task-id.md` | W1 | **`ID-R3`**, which the spec-conformity pass forced: a driver serving two runs merges them. Not foreseen at declaration time |
| `doc/concept.md` | — | a two-line correction: 0.3.0 is *"on no registry"* rather than *"not yet published to npm"*. **Undeclared until the conformity pass caught it**, along with the line-ending churn that hid it |
| `test/fold/fold.test.ts` | W2 | **one line.** Its *"the vocabulary is closed and ours"* test enumerates the outcomes by construction; leaving it at five while the vocabulary is six makes it a test that stopped being about closure. W4 set the precedent for a one-line edit to another item's suite and for recording it here rather than doing it quietly |

**If any of these turns out to be more than small, that is a finding and it goes in the Record**
rather than being absorbed. The specific risk is Q43: it touches a shape W2's suites and W4's matrix
both assert on, and a fix that needs those suites rewritten is a fix that has outgrown this item.

## Verification

| Clause | How it is run |
|---|---|
| L0 | `npm run check:spec`, `npm run check:source` (now **seven** checks), **`npm run check:scheduler`**, `npm run lint` (now including `examples/`), `npm run typecheck` (now **five** configs), `deno publish --dry-run` |
| L1-L5 | `npm test`, `npm run test:deno`, `npm run test:browser:all` — the 257 assertions W1-W4 left must stay green. W5 changes `src/`, so a failure here is **W5's**, which is the opposite of W4's position and is why Q43's blast radius is called out above |
| **L6** | `npm run test:l6` (Node 24) and `npm run test:l6:deno` (Deno, via `--import-map`). Six real runs, each resolving on a run-state outcome rather than on a timer; a wall-clock backstop exists only so a hang is **reported** rather than hung on, and a run that reaches the backstop **fails** |
| runtimes | **L0-L5 in all five** — node 24, deno, chromium, firefox, webkit. **L6 in two** — node 24 and deno. `RT-R1`: a rung reported green without naming its runtimes ran in one |
| spec-conformity | `doc/workflow.md` section 6, fresh context, **spec first and code second**. Five passes have run in this repository and **none has come back empty**; budget for it |

**Routing cases** (`TEMPLATE.md` asks each in turn):

| Case | | Covered by W5 |
|---|---|---|
| A branch routed away from its join ([Q4](../questions/q4.md)) | **yes, and for real** — `p1-routed-away` at low confidence, under both policies. W4 proved the claim against a fake; this is the same claim with a real `addTask` |
| `user_action` ([Q17](../questions/q17.md)) | **no, and deliberately.** Reaching it needs a non-optional task out of retries, so a run that is *designed* to fail twice; W4 covers the flow-level behaviour in three rows and `resolve()` has no scheduler in its path. **Named because silence is not an answer** — and it means `awaiting_action` is not exercised at L6 |
| No matching decision edge ([Q10](../questions/q10.md)) | **no.** `FD-V7` refuses the shape at instantiation and `FD-R1` is W3's, at L2. No W5 flow can reach it |
| A duplicate task id ([Q13](../questions/q13.md)) | **partially, and this is the first time it is real.** `ID-R1` refuses before `addTask`, so no run reaches a collision — but L6 is the only rung where the ids the driver mints are handed to the scheduler's actual task map, which is what `spec/task-id.md` section 2's correctness argument is about. W5 asserts the six runs' ids are distinct and well-formed and that the scheduler settled each one |
| Nested fan-out ([Q6](../questions/q6.md)) | **not applicable** — refused by `FD-V15`; no `branchPath` here is deeper than one element |

## Record

**Gate — what ran.** `RT-R1`: a rung is not green until it is green where it is required to run, and
a row that does not name its runtimes ran in one.

| Clause | Verdict | Runtimes | Notes |
|---|---|---|---|
| L0 | **RAN** — pass | **Node, Deno; nothing at L0 runs in a browser** | `check-spec` (8), `check-source` (**10** — `S7`-`S10` are new, all negative-tested), `check-scheduler` (5, new, all negative-tested), `deno lint` over `src/ test/ examples/ index.ts`, `tsc` × **5** configs, `deno check`, `deno publish --dry-run`. **The runtimes column is corrected**: the first version of this row said *"Node, browser, Deno"*, and three of L0's clauses are Node-only tooling by construction while nothing at L0 runs in a browser at all. `RT-R1`'s own standard applied to `RT-R1`'s own row |
| L1-L5 | **RAN** — pass | **all five** — node 24, deno 2.9.6, chromium, firefox, webkit | **288 assertions**, identical in all five; the browser runner asserts the parity rather than assuming it. 257 were W1-W4's, 31 are W5's across two new suites |
| **L6** | **RAN** — pass | **node 24 and deno 2.9.6** | **118 assertions**, **eight** real runs, ~100 ms each. Not the browser — [Q33](../questions/q33.md) answered as `RT-R10`, remainder [Q52](../questions/q52.md) |
| mutation | **RAN, three times** | Node | W5's own sweep: 19, 2 survivors. **The review's: 148, 38 survivors, 10 blocking.** The re-sweep after acting on both: 12 targeted mutations, **0 survivors** |
| **spec-conformity** | **RAN** — **3 blocking, 9 defects, 7 notes** | n/a | fresh context, spec first and code second. It re-derived all six L6 rows independently before opening `examples/l6.ts` and agreed with every cell |
| **test adequacy** | **RAN** — **10 blocking, 3 defects, ~12 notes** | n/a | a second reader on *"would these tests have noticed"*, by mutation, in an isolated git worktree |
| re-run at `<sha>` | **RAN** — pass | all five, and both L6 runtimes | the gate above **is** the re-run acting on both passes; it lacks only the commit that carries it |

**Eleven reader-passes have now run in this repository and not one has come back empty** — W1 ×3,
W3 ×3, W2 ×1, W4 ×2, W5 ×2.

*This Record first said "six", inheriting a running total that had been wrong since W4 and adding to
it. P1's retro counted them. It is a third instance of the class W5 itself raised — a claim in
`doc/` that nobody ran — and the mildest of the three, which is why it went unnoticed longest.*

**Outputs — what was actually built.** The table `doc/work-items/TEMPLATE.md` gained from P1's retro,
filled in retrospectively for the item that produced the retro. One row per item on the `Outputs:`
line, and for each, the thing that **would fail if it did not exist**. A blank cell is the finding;
there are none, and W5's own `examples/**` rung is why — it was predicted in Scope 6 rather than
found in a Record.

| Declared output | Exists | What would fail without it |
|---|---|---|
| six real runs reaching a run-state outcome with no clock | **yes**, and eight | `examples/l6.ts`'s per-row `RN-R12` assertion — added by the review, because until then a 1 ms timer passed everything |
| the every-node-settles assertion (Q32) | **yes** | two assertions per row, one over the driver's records and one over the **scheduler's own settlement events** |
| an ordered `FoldInput` sequence, plus ADR 0014 | **yes** | `test/driver/fold-inputs.test.ts`, 15 assertions; deleting any `append` site fails L2 |
| `stuck` as a run outcome, plus ADR 0015 | **yes** | `test/fold/stuck.test.ts`, 16 assertions, and two L6 rows |
| Q33's answer in `RT-R10` | **yes** | `npm run test:l6:deno` — the rule is only true while the second runtime is in the gate |
| a rendered run table a person can read | **yes** | nothing. **It is L7 material and no assertion covers it** — the table is a by-product of values the assertions do use, which is the most that can honestly be claimed |

**The exit artifact.** Eight rows; every expected value written from `spec/` before the first run,
and every one matched first time in both runtimes.

```
  run                                 outcome    join   branches              tasks ms    overlap
  ----------------------------------------------------------------------------------------------
  fanout-join / live-token            completed  true   0:arrived 1:arrived   4     135   yes
  fanout-join / arrival-count         completed  true   0:arrived 1:arrived   4     104   yes
  p1-routed-away high / live-token    completed  true   0:arrived 1:arrived   4     121   no
  p1-routed-away high / arrival-count completed  true   0:arrived 1:arrived   4     107   yes
  p1-routed-away LOW / live-token     completed  true   0:arrived 1:exited    4     107   no
  p1-routed-away LOW / arrival-count  stuck      never  0:arrived 1:exited    3     93    no
  optional-loss / live-token          failed     true   0:arrived 1:lost      4     92    no
  optional-loss / arrival-count       stuck      never  0:arrived 1:lost      3     77    no
```

**The last two rows were added by the review** and are the ones to keep: **no decision and no routing
away, just an `optional` task that fails**, and arrival-counting hangs anyway. That is ADR 0003's
second mechanism — the one it calls ordinary — executed on real workers, and it is also the only
place in the gate where a task settles as anything but `done`.

## What broke

Ordered by what it cost, not by when it was found. Findings from the two review passes are marked
**[conformity]** and **[adequacy]**.

**1. The L6 gate did not depend on the thing W5 exists to build. [adequacy]** Replacing the whole
termination mechanism with `setTimeout(1)` left **all 72 assertions passing**: `await
scheduler.shutdown()` drains the run while the incremental fold keeps advancing, so every value read
afterwards is correct anyway. The clock-free termination is the stated reason
[ADR 0014](../decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md) exists,
`RN-R12` calls it *"what makes ladder L6 clock-free"*, and **nothing was testing it**. My own
`lateInputs` guard — added earlier in this item, for the microtask bug below — catches an *early
declaration* and not a timer that never declares. `RunReport.finishedBy` now records which of the
two ended the wait; the mutation fails nine assertions.

**This is the item's sharpest finding and it is the W4 shape one level deeper:** the author's sweep
found a hole, and the author's fix for it still could not fail.

**2. A driver serving two runs merged them and reported `completed` for a hung run. [conformity]**
`start(runId, …)` takes the id per call and `failedRuns`/`hasFailed(runId)` are keyed by run, but
`inputs`, `firedJoins` and `joinState` are keyed per driver. Two runs of `fanout-join` on one driver:
the **second run's join never fires** (`firedJoins.has('split')` is already true), and
`fold(driver.foldInputs())` returns **one** `RunState` carrying the **first** run's id and reporting
**`completed`** — for a state holding a permanently hung run. Character-for-character the false
statement ADR 0015 exists to remove, through the class's own declared surface.

`ID-R3` (`spec/task-id.md` v0.4) refuses a second *different* run id. **The first version of the rule
was too wide and W3's suite said so**: it refused a same-id restart too, which took away `ID-R1`'s
only direct test — W3 provokes a duplicate dispatch by starting the same run twice. Narrowed to
different ids only; two runs sharing an id collide on every task id anyway. What is *not* fixed is
that the public surface still says a driver serves many runs — [Q53](../questions/q53.md).

**3. `RT-R10` and ADR 0013 rule 6 claimed a mechanism that did not exist — found by both readers,
independently, and both measured it.** *"L6 lives in `examples/**` … so nothing that imports a
scheduler can reach the browser bundle by accident."* The premise is true and the conclusion does
not follow: the glob is what would carry such an import **into** the bundle. One reader bundled a
scheduler import from `test/` with esbuild directly; the other ran the real build script and watched
`dev-dist/browser/tests.js` grow by 55 KB with the scheduler's internals in it, `check-source`
returning 0 throughout. **`S9` is the mechanism now**, and the ADR carries a dated correction.

**4. Four of ADR 0013's own rules had no check, and `S7` missed the name the ADR itself measured.
[adequacy]** Rule 1's manifest half (nothing refused a `dependencies` or `peerDependencies` entry
naming the scheduler — which the ADR's *Alternatives rejected* calls *"a false statement in a
manifest"*), rule 4 (*no file under `examples/**` writes a path into the sibling*), rule 6 (above),
and `S6`'s converse (a published `.ts` outside `src/` is shipped to JSR and scanned by nothing).
`S7` matched `fyflow-scheduler` and `jsr:@fyflow/scheduler` but **not the bare `@fyflow/scheduler`**
— which is what a Deno consumer writes in source after `deno add`, and the name ADR 0013's Context
measured as existing on JSR. `S8`, `S9`, `S10` and the `S6` converse are new; all ten checks are
negative-tested, and `S10` **failed its own negative test first** because it used `code()`, which
blanks the string literal a path lives in.

**5. `check-scheduler.mjs` printed `ok` for checks it had not run. [adequacy]** With the link
missing, `D1` failed and `D2`-`D5` printed `ok` having never executed — `doc/workflow.md` section 1
rule 4, in a script whose header says it reports rather than fixes. They now print `NOT RUN`.
Separately, `D4` could go **vacuous**: `D3` and `D5` each carry a *"this measured nothing"* guard and
`D4` did not, so growing `SELF_WRITTEN` — a set that exists in order to grow — would have made it
pass having compared nothing. Both negative-tested.

**6. Two of ADR 0014's three ordering clauses, and one half of rule 2, had no test. [adequacy]**
Clause 6b (*a region event is appended after the policy has stepped*) had none at all; clause 6c was
tested on the `end`-node route and not on the `no-eligible-edge` route, which is the one where a join
becomes satisfiable **because a branch was lost** and is therefore the family P1 is about; and rule
2's *"frozen copy"* was asserted for `onFoldInput` and for `snapshot()` but not for `foldInputs()`,
the method the rule names.

**My first attempt at the 6c test passed vacuously** — it used `fanout-failure`, whose optional node
has an `on: ["failed"]` edge and therefore *exits* rather than being lost, so the branch under test
was never entered. Caught by re-running the reviewer's mutation against my own fix. It now uses W4's
`matrix-optional-lost`.

**7. Q43's stated reason was false, and acting on it is what found that. [W5, before the reviews]**
The register says *"`regions` already records `{0: arrived, 1: exited}`, so the information is
present"*. On `p1-routed-away` **both policies produce that identical value** — which is exactly what
`RN-R6` guarantees. The other candidate, inferring the join from the successor's absence in `nodes`,
needs the definition, and `RN-R4` forbids the fold having one. So `stuck` cost a **new fact**
(`joined`, `RN-R11`, a `joinSettled` input) rather than the precedence tweak the row implies.

**8. `RN-R11` then repeated the failure mode it was written to fix. [conformity]** Its first wording
said `joined` is *"the one field a policy's behaviour reaches"*. It is not: the two runs also differ
in `nodes`, in `pathEnds` and in `outcome`. **Third occurrence of an over-broad enumeration inside an
otherwise-correct claim** — ADR 0003's dated correction and Q43 are the other two. The rule now says
*the only one decidable without the definition*, which is the statement the conclusion needs. Its
**prescribed test was also impossible as worded** (*"fold the same region-event stream under both
policies"* — `fold` takes no policy, and an identical stream cannot differ in `joined`); it now
prescribes the two-driver form both tests already used.

**9. `RN-R12` was stated unconditionally and is false at most prefixes. [conformity]** Folding every
prefix of a real run, **7 of 14 report a terminal outcome for a run that is not over** — including
the first settlement. `stuck` made it louder rather than causing it. The qualification that makes L6
correct existed only in a code comment; `examples/README.md` restated the unqualified form and no L1
case was mid-turn. `RN-R12` now says *"at a quiescent point"*, `spec/run-state.md` section 3 carries
a block explaining what one is, and there is a test that folds every prefix and asserts the property
holds at the last and not at all of them.

**That block also names the table's missing row. [conformity]** A state with settled nodes and no
path end matches neither `completed` nor `failed`, and the code falls back to the node states. That
fallback is not a sixth precedence row: it keeps the fold total over prefixes (`RN-R2`), and every
state reaching it is mid-turn or a fixture carrying no `pathEnded`.

**10. Two reachable branches of `withOutcome` had no test. [adequacy]** `RN-R10` uses `some`, and
`some` and `every` differ only when a run has **more than one region** with different `joined` values
— the two-sequential-fan-outs shape of [Q45](../questions/q45.md). And section 3's
nothing-dispatched clause is reachable via a **fan-out entry**, which `FD-V3` permits: every
`branch.opened` precedes the first dispatch, so without the clause that state is `stuck` and
`isTerminal`, and an L6 harness would declare such a run finished before it started. `fold([])`
returns `emptyState()` without calling `withOutcome`, which is why no existing case reached it.

**11. `OR-R10`'s "nothing routes for it again" held only on the outbound edge. [conformity]**
`resolve()` did not check `failedRuns`, so a resolution for a suspended task in a stopped run
appended a record and dispatched. Pre-existing since W3; W5's sequence made it visible, because
elements kept arriving after the `stopped` element while the outcome stays pinned to `stopped`.
Refused now, as a rejected command. **A related hole is recorded and not fixed:** a refusal whose task
id cannot be parsed is attributed to the sentinel `'<unknown>'`, so it stops nothing — W3's, and the
test says so in place rather than working around it.

**12. Q32's assertion was computed from the code it checks. [adequacy]** `report.settled` was built
by calling `driver.terminalStateOf`, so replacing that method with the constant `'done'` passed —
`doc/workflow.md` section 5 rule 4. It is now asserted against the **scheduler's own settlement
events**, counted at the listener boundary, and against the folded node states. **The constant still
survived after that**, for a reason worth stating: until the `optional-loss` rows existed, **no L6
task settled as anything but `done`**, so no assertion could tell a constant from the truth. The
coverage gap was in the runs, not in the assertions.

**13. The L6 gate had no assertion-count floor. [adequacy]** Turning the per-row `continue` into an
unconditional one printed `24 assertions, 0 failed` and exited 0 — 48 assertions silently gone. Same
for the cross-row block, which carries ADR 0015's motivating claim. `doc/workflow.md` section 1 rule
4 at assertion granularity. There is a floor now, derived from two declared constants.

**14. The driver appended an outcome record the fold then threw on. [W5]** `onEventOrThrow` appended
before parsing the task id, so a settlement carrying an id the driver never minted left an element
`fold` itself rejects — the run would be `stopped` **and unfoldable**. Parse first now.

**15. An assertion that could not fail, in W5's own first draft. [W5]** A test named *"`stuck` needs
the join fact"* filtered its input with a predicate that is always true. Rewritten to assert that the
stuck run satisfies **every** clause `completed` requires except the join one, and that one input
flips it.

**16. `../fyflow-scheduler/dist/` was stale before any of this started.** A pre-0.3.0 build with no
`_failOrphanedTask` and no `getAdmissionQueue`, behind a `package.json` reading `0.3.0`.
`scripts/check-scheduler.mjs` exists because of it.

**17. Line-ending churn in an undeclared file. [conformity]** A scripted edit flipped
`doc/concept.md` from CRLF to LF — 208/207 lines of diff hiding a two-line correction, and it is the
only file in the change set with that churn. Restored; the diff is 2/1. The file is now in the
declared exceptions table, which it should have been from the start.

**Named and not fixed, so a reader does not mistake them for coverage:** `threaded`, `delayMs` and
`maxThreads` on the L6 harness have no assertion behind them — an overlap assertion was written,
measured varying run to run on one machine, and **removed** under `doc/workflow.md` section 5 rule 5;
`branchesOverlapped` is a reported column instead. `joined: false` is an empty set for the shipped
policies (the driver's emission is covered by a stub). `failures`, `lateInputs` and the unsettled
list are three more empty-set assertions — guards rather than coverage, and `lateInputs` earns its
place because it is what catches a premature termination. And a `file:` devDependency **does not
resolve from a git worktree**, which every future reviewer of this repository will run in.

## What this taught

- **Two readers, ~35 findings, three overlaps — and the overlaps came from opposite directions.**
  Both killed `RT-R10`'s *"structural"* claim, one by bundling directly and one by running the build
  script. Both hit `S7`, on **different holes**. Both found `deno.json`'s `lint` task. W4 proposed the
  two-reader split after getting 1 overlap in 13; this is the **second occurrence in a different work
  item**, which is what `doc/workflow.md` section 6 rule 2 asks of a proposed rule. **For the retro.**
- **A mutation sweep run by the author measures what the author fears.** Mine: 19 mutations chosen
  from what looked fragile, 2 survivors. The reader's: 148 chosen by walking the rule ids, **38
  survivors**. The gate row *"2 survivors, both named"* read as a coverage statement and was not one.
  W4 recorded the same lesson one level up; this is the same lesson about the same author's sweep of
  the same author's fix.
- **The register is a written claim nobody ran, and it has no conformity pass.**
  `spec/run-state.md` section 5's first three instances were a spec written by its implementer; Q43
  is the fourth and it is a **register entry written by a reader**, in the document every work item
  reads before it starts. `spec/` has a pass; `doc/open-questions.md` has nothing. **For the retro.**
- **A leaning's argument is worth checking before its conclusion.** [Q33](../questions/q33.md)
  leaned *Node only for P1* because *"L6 needs a real worker file per runtime"*. One command showed
  that false at Node 24, and the answer flipped to Node **and** Deno.
- **Three things this repository believed were wrong and each was one command away** — *"not yet
  published to npm"*, `dist/` being current, and `AGENTS.md`'s *"the file must be JavaScript"*.
  **Ladder L6's value here was not catching a dispatch race; it was being the first rung that touches
  the world.**
- **The fifth "declared output with no rung", and the first predicted before the fact.** W5's Scope 6
  said `examples/**` would otherwise be untypechecked and unlinted, citing W4's identical finding
  about `test/**`. The prediction cost one paragraph. **Five for five is the argument for
  `doc/workflow.md` section 4 gaining a toolchain row**, not for a sixth Record noting it.
- **A check written to close a finding failed its own negative test twice** — `S10` (blanked the
  string it was searching) and the 6c ordering test (pointed at a flow that could not reach the
  branch). **Negative-testing a new check is not optional here**, and both were caught only because
  the reviewer's mutations were re-run against the fixes rather than assumed to have landed.

## Questions raised

Q51, Q52 and **Q53** from the reserved block; **Q54-Q60 are skipped, never reissued.**

| Q | | raised by |
|---|---|---|
| Q51 | How do the three runtimes reach `fyflow-scheduler` 0.3.0? **Resolved by ADR 0013** | W5, before the declaration |
| Q52 | Must ladder L6 run in the **browser** before release? The half of Q33 W5 does not answer | W5 |
| Q53 | **`Driver`'s public surface says it serves many runs and `ID-R3` says it serves one** | the spec-conformity pass |

[Q44](../questions/q44.md) gained its **second occurrence**: W5 needed a flow the corpus cannot
express — an `optional` branch node with no `on: ["failed"]` edge — and defined it in
`examples/flows/` exactly as W4 defined one in `test/matrix/`. The register row predicted *"a gap
that will be re-found by every later item"*, and it was, by the next one.

**Upstream.** [S9](../scheduler-upstream.md), the only live item in that register.

**ADRs.** **0013, 0014 and 0015 all spent** — the first item to use its whole reserved block — and
**all three now carry dated in-place corrections**, which is a first for this repository and is not a
distinction worth repeating.

## What is still open in this item, deliberately

- **`awaiting_action` is not exercised at L6.** Reaching `user_action` needs a task designed to fail
  out of retries while non-optional; W4 covers the flow-level behaviour in three rows and `resolve()`
  has no scheduler in its path. So the one run-state outcome a human is involved in has never been
  seen on a real scheduler.
- **[Q53](../questions/q53.md)** — the driver's surface still says it serves many runs. Narrowing it
  is a change to W3's public API and this item had already widened its `Owns` seven times.
- **The empty-set assertions and the unasserted harness knobs**, listed above.
- **A regex cannot close `S7` completely.** A specifier built at run time survives it, and the check
  says so in place rather than claiming otherwise.
