# W6 — The non-success rows at ladder L6, and the harness's inbound step

**Status:** in review - built and gated at L6 in two runtimes; **both readers outstanding**
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
            and a refusal - taking the gate from eight rows to eleven. It
            delivered FOUR and twelve: the fourth was added because a negative
            test survived, and the Record says so rather than the declaration
            being edited to match;
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

**Gate — what ran.** `RT-R1`: a rung is not green until it is green where it is required to run.

| Clause | Verdict | Runtimes | Notes |
|---|---|---|---|
| L0 | **RAN** — pass | Node, Deno | `check-spec` (8), `check-source` (10), `check-scheduler` (5), `deno lint` (37 files), `tsc` × 5 configs, `deno check`, `deno publish --dry-run` |
| L1-L5 | **RAN** — pass | **all five** — node 24, deno 2.9.6, chromium, firefox, webkit | **288 assertions, unchanged.** This item changed no `src/` file and no `test/` file, which is what its declaration said it would not do |
| **L6** | **RAN** — pass | **node 24 and deno 2.9.6** | **186 assertions, twelve rows**, up from 118 and eight. Every one of the four new rows matched its hand-written expectation on the first run |
| negative tests | **RAN** — 10 mutations, 1 survivor, then 0 | Node | `doc/workflow.md` section 5 rule 7, the rule P1's retro added. See *What broke* 2 |
| conformity reader | **NOT RUN** | — | pass 2 as v0.3 defines it |
| adequacy reader | **NOT RUN** | — | pass 2 as v0.3 defines it |
| re-run at `<sha>` | **NOT RUN** | — | follows both readers |

**Outputs — what was actually built.** The table P1's retro added to `TEMPLATE.md`, and W6 is the
first item to fill it as part of its own gate rather than retrospectively.

| Declared output | Exists | What would fail without it |
|---|---|---|
| three L6 rows — a failure that routes, a suspend/resolve/resume, a refusal | **yes, and four** — see *What broke* 2 | the assertion-count floor in `examples/l6.ts`, which is now per-row and shape-aware |
| `awaiting_action` and `stopped` reached on real workers | **yes** | the `outcome` check on rows `suspend / nobody comes` and `uncloneable / OR-R6` |
| `branch.suspended` and `branch.resumed` reached | **yes** | the `resolved` check — the inbound step fires **on** `branch.suspended`, so a row that declares a resolution and gets none fails |
| the harness's inbound step | **yes** | three assertions on row `suspend / resolve / resume`; disabling it fails the row's `finishedBy`, `dispatched` and `resolved` |
| Q61, and whatever else the rows turn up | **yes** — Q61 raised before the item started, and nothing new | nothing. **A question is not a testable output**, and saying so is the point of this cell |

**The exit artifact**, twelve rows in both runtimes:

```
  run                                 outcome    join   branches              tasks ms    overlap
  ----------------------------------------------------------------------------------------------
  fanout-join / live-token            completed  true   0:arrived 1:arrived   4     114   yes
  fanout-join / arrival-count         completed  true   0:arrived 1:arrived   4     122   yes
  p1-routed-away high / live-token    completed  true   0:arrived 1:arrived   4     106   no
  p1-routed-away high / arrival-count completed  true   0:arrived 1:arrived   4     108   no
  p1-routed-away LOW / live-token     completed  true   0:arrived 1:exited    4     110   yes
  p1-routed-away LOW / arrival-count  stuck      never  0:arrived 1:exited    3     122   no
  optional-loss / live-token          failed     true   0:arrived 1:lost      4     125   no
  optional-loss / arrival-count       stuck      never  0:arrived 1:lost      3     135   no
  failure-edge / routes on            completed  -      -                     1     20    no
  suspend / resolve / resume          completed  true   0:arrived 1:arrived   4     45    yes
  suspend / nobody comes              awaiting_a never  0:arrived             3     405   yes
  uncloneable / OR-R6                 stopped    -      -                     1     16    no
```

**All six run outcomes now occur at L6** — `running` transiently, and the other five as a row's
result. Every region event occurs too.

## What broke

**1. Nothing in `src/`.** Every rule these rows exercise behaved as specified, first time, in both
runtimes. That is the honest headline and it is a weaker result than P1's items produced — which is
what P2's plan predicted when it recorded that measuring `user_action` before the plan was written
**lowered the stakes**. The prediction held.

**2. A row was added because a negative test survived, and it is the best row in the item.** The
new `asTerminal` mapping folds `running` **and** `suspended` to *not settled*; mutating the
`suspended` half survived, because **no row ended with a suspended node** — the only suspension was
resolved before the run finished. The choice was to name it as an empty set, as W5 did for
`joined: false`, or to make it non-empty.

Making it non-empty produced `suspend / nobody comes`: the same flow with no human, ending
`awaiting_action` with the join never fired. **It is the row that separates *waiting on a person*
from *stuck*** — a distinction ADR 0003 and ADR 0015 both lean on and which no L6 row demonstrated,
and it is the only row whose **expected result is the backstop**, because `RN-R12` makes such a run
non-terminal and the harness must not pretend otherwise.

**A negative test that survives is not always a missing assertion; sometimes it is a missing case.**

**3. A positional mistake, caught by the assertion that exists for it.** Inserting the new row before
`uncloneable` shifted both rows' `runId`, which is `r${i+1}` by position, and the hand-written
`dispatched` lists no longer matched. Four assertions failed, naming the exact ids. **This is
`spec/task-id.md`'s scheme doing its job in a test rather than in a run** — the ids are derived from
position and asserted from the spec, so the two cannot drift silently.

**4. The assertion-count floor had to become shape-aware, and it is stronger for it.** W5's floor was
`rows × a constant`; W6's rows are not uniform (a flow with no fan-out asserts one thing about
`regions` where a fan-out asserts two, and a row may declare extra `outcomesSeen` checks). It is now
checked **two ways**: every row ran what its shape declares, and the total is what the file declares.
Either alone misses something — the per-row check misses a uniform reduction, and the total misses a
row that ran its peers' count by coincidence.

**5. The inbound step had to be deferred to a microtask, for the reason termination was.**
`Driver.resolve()` appends and routes; calling it from inside `onFoldInput` would interleave the
sequence with itself. Mutating the deferral away hangs the gate rather than failing it, which is the
loudest available failure and is recorded here because a hang is easy to misread as a slow machine.

## What this taught

- **P2's two spikes were worth their cost and one of them paid off in an unexpected place.** Knowing
  the real `user_action` event pair made row 2's expectations derivable; knowing `OR-R6`'s
  pool-dependence is what made row 4 use an **inline** pool, and a threaded one would have produced a
  `user_action` the row was not expecting and a confusing morning.
- **The first item to run `doc/workflow.md` v0.3's section 5 rule 7 found the rule earning itself
  immediately.** Ten negative tests, one survivor, and the survivor was the most interesting thing in
  the item. Under v0.2 that mutation would not have been written.
- **An empty exceptions table stayed empty**, which is the first confirmation that section 7 rule 2's
  amendment describes something real: a serial item can be scoped so that it edits only what it owns,
  and W6 did.
- **The gate is now slower in a way worth noticing.** `suspend / nobody comes` costs its whole 400 ms
  backstop by construction — it is the one row that cannot finish early — and L6 is ~1.4 s. The plan
  gate is still well inside `doc/workflow.md` section 8's 90 s.

## Questions raised

**Q61 was raised by P2 before this item started; nothing new.** Q62-Q70 are skipped, never reissued.

| Q | | raised by |
|---|---|---|
| Q61 | `OR-R6` is reachable from an inline pool and not from a thread pool, and no document says so | P2's spike |

## What is still open in this item, deliberately

- **Both readers.** The gate is not complete until pass 2 has run, and v0.3 asks for two.
- **`unsatisfiable` is still an empty set at L6**, as it is everywhere: neither shipped policy returns
  it, so `joined: false` has never occurred outside a stub. Unchanged by this item and named again so
  the twelve-row table is not read as covering it.
- **`FD-R1` and `ID-R1` are still L2-only.** Row 4 exercises `OR-R10`'s *reporting* path with a real
  scheduler, which is the half that matters; the other two refusals remain unreachable through the
  public API and W3 says so.
