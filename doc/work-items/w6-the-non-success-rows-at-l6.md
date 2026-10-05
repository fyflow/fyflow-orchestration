# W6 — The non-success rows at ladder L6, and the harness's inbound step

**Status:** done — built, both readers run, every finding acted on, the gate re-run and committed. *(This read `in review` with *"what remains is the commit"* until 2026-10-03, when `npm run state` reported it. [P2](../plans/p2-the-non-success-half-on-a-real-scheduler.md) is complete and retro'd. [W114](w114-claude-md-is-guidance-and-npm-run-state-is-the-index.md))*
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
            delivered FIVE and thirteen: two rows were added because a negative
            test survived, one before the review and one during it, and the
            Record says so rather than the declaration being edited to match;
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
- **Making `OR-R6`'s pool-dependence normative.** Reported as [Q61](../questions/q61.md). A spec
  change is its own change with its rationale stated (`spec/README.md` rule 1), and `OR-R6` is W1's.
- **A second policy column.** W5's rows run both policies where the comparison means something; rows
  1 and 3 have no fan-out and row 2's answer is the same under both, which is itself the point of
  `branch.suspended`. Stated so a reader does not read the missing column as an oversight.
- **[Q53](../questions/q53.md), [Q52](../questions/q52.md), [Q44](../questions/q44.md).**
  Untouched.

## What this item edits outside its `Owns`

**Declared empty, and it was not.** The first version of this section said *"nothing"* and offered it
as the first confirmation that `doc/workflow.md` section 7 rule 2's amendment describes something
real. W6's conformity reader ran `git show --stat` and found two more files. **Corrected here rather
than argued away**, because the claim was load-bearing: P2 is the plan meant to judge that amendment,
and a false instance of it is worse than an ordinary undeclared edit.

| file | whose | what, and why it cannot be avoided |
|---|---|---|
| `doc/README.md` | — | the loop's own **record** step: `doc/workflow.md` section 1 names it as part of finishing a work item, so arguably it is not an exception at all. W5 did not declare it either |
| `CLAUDE.md` | — | **a genuine exception.** It is named nowhere in `doc/workflow.md`, and W5 kept its front-door edits in a separate commit rather than in its feature commit. W6 did not |

**Two occurrences in two items is what section 6 rule 2 asks of a rule**, and the shape is the same
both times: an item finishes, updates the front door, and does not think of that as editing something.
**For P2's retro** — either section 1's record step names the files it covers, so they stop being
exceptions, or section 7 rule 2 says front-door updates are declared like anything else. What cannot
stand is the current position, where the honest answer to *"did you edit outside your Owns"* is
*"yes, twice, and I did not notice."*

## Verification

| Clause | How it is run |
|---|---|
| L0 | `npm run check:spec` (8), `check:source` (10), `check:scheduler` (5), `npm run lint`, `npm run typecheck` (5 configs), `deno publish --dry-run` |
| L1-L5 | `npm test`, `npm run test:deno`, `npm run test:browser:all` — 288 assertions must stay green. **This item changes no `src/` file, so a failure here is W6's fixture, not the library's** |
| **L6** | `npm run test:l6` and `npm run test:l6:deno` — **thirteen** rows after both readers (eleven were declared), and the assertion-count floor in `examples/l6.ts` updated to match |
| runtimes | L0-L5 in all five; L6 in Node 24 and Deno (`RT-R10`) |
| pass 2 | **two readers**, per `doc/workflow.md` v0.3: conformity (spec first, code second) and adequacy (mutation, chosen from the rule ids) |

**Routing cases** (`TEMPLATE.md` asks each in turn):

| Case | | Covered by W6 |
|---|---|---|
| `user_action` ([Q17](../questions/q17.md)) | **this is the item** — row 2, and the first time it occurs outside a fixture |
| A branch routed away from its join ([Q4](../questions/q4.md)) | **no** — P1's case, covered at L6 by W5's rows 5 and 6 |
| No matching decision edge ([Q10](../questions/q10.md)) | **no.** `FD-V7` refuses the shape at instantiation; `FD-R1` is unreachable through the public API and W3 says so |
| A duplicate task id ([Q13](../questions/q13.md)) | **no.** `ID-R1` is covered at L2, and row 3 exercises a *different* refusal reaching the same `OR-R10` path |
| Nested fan-out ([Q6](../questions/q6.md)) | **not applicable** — `FD-V15` refuses it |

## Record

**Gate — what ran.** `RT-R1`: a rung is not green until it is green where it is required to run.

| Clause | Verdict | Runtimes | Notes |
|---|---|---|---|
| L0 | **RAN** — pass | Node, Deno | `check-spec` (8), `check-source` (10), `check-scheduler` (5), `deno lint` (37 files), `tsc` × 5 configs, `deno check`, `deno publish --dry-run` |
| L1-L5 | **RAN** — pass | **all five** | **288 assertions, unchanged.** This item changed no `src/` file and no `test/` file |
| **L6** | **RAN** — pass | **node 24 and deno 2.9.6** | **219 assertions, thirteen rows**, up from 118 and eight. Five rows added, not the three declared |
| negative tests | **RAN, three times** | Node | mine: 10 mutations, 1 survivor — **and one of the ten was malformed**, see *What broke* 1. The readers': **97 distinct mutations, 35 survivors**. After acting on both: 15 targeted re-runs, **1 survivor, and it is a margin** |
| **conformity reader** | **RAN** — **1 blocking, 11 defects, 6 notes** | n/a | re-derived all four declared rows independently before opening `examples/l6.ts` and agreed with every cell |
| **adequacy reader** | **RAN** — **6 blocking, 4 defects** | n/a | 97 mutations in an isolated worktree; every survivor re-run against L1-L5 to separate *"no L6 test"* from *"no test anywhere"* |
| re-run at `<sha>` | **RAN** — pass | all five, both L6 runtimes | the gate above **is** the re-run acting on both passes; 5 consecutive L6 runs, no flake |

**Thirteen reader-passes have now run in this repository and not one has come back empty.**

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| three L6 rows — a failure that routes, a suspend/resolve/resume, a refusal | **yes, and five** | each row's `outcome` and `dispatched` checks, plus the assertion-count floor and its absolute anchor |
| `awaiting_action` and `stopped` reached on real workers | **yes** | `outcome` on rows 11 and 13; and for `stopped`, the new `stoppedBy` assertion — `RN-R8`'s field was populated for the first time and asserted by nothing until the adequacy reader said so |
| **`branch.suspended`** reached | **yes** | the inbound step fires **on** it, so a row declaring a resolution and getting none fails three ways |
| **`branch.resumed`** reached | **yes — and it was asserted by nothing until both readers said so** | row 10's `branchEvents` check. Deleting the emission from `src/` passed all 186 assertions: the fold clears `regions[*].suspended` on `branch.arrived` too, so nothing the gate read could tell |
| the harness's inbound step | **yes** | row 10's `resolved` check, its `finishedBy`, and — since the pre-shutdown read — its `awaiting_action` inclusion |
| Q61, and whatever else the rows turn up | **yes** — Q61 before the item started, **Q62 and Q63** from the readers | nothing. **A question is not a testable output** |

**The exit artifact**, thirteen rows in both runtimes:

```
  run                                     outcome          join   branches              tasks ms    overlap
  ----------------------------------------------------------------------------------------------------------
  fanout-join / live-token                completed        true   0:arrived 1:arrived   4     131   yes
  fanout-join / arrival-count             completed        true   0:arrived 1:arrived   4     106   yes
  p1-routed-away high / live-token        completed        true   0:arrived 1:arrived   4     137   yes
  p1-routed-away high / arrival-count     completed        true   0:arrived 1:arrived   4     106   yes
  p1-routed-away LOW / live-token         completed        true   0:arrived 1:exited    4     107   no
  p1-routed-away LOW / arrival-count      stuck            never  0:arrived 1:exited    3     94    yes
  optional-loss / live-token              failed           true   0:arrived 1:lost      4     61    yes
  optional-loss / arrival-count           stuck            never  0:arrived 1:lost      3     45    yes
  failure-edge / routes on                completed        -      -                     1     29    no
  suspend / resolve / resume              completed        true   0:arrived 1:arrived   4     60    yes
  suspend / nobody comes                  awaiting_action  never  0:arrived             3     413   yes
  exit-last / join fires on exit          completed        true   0:arrived 1:exited    4     62    yes
  uncloneable / OR-R6                     stopped          -      -                     1     32    no
```

## What broke

**1. I recorded a syntax error as a behavioural finding.** *What broke* 5 of the first Record said
*"mutating the deferral away hangs the gate rather than failing it"*. It does not: it passes 186
assertions and exits 0. **My mutation replaced `queueMicrotask(() => {` with `{` and left the closing
`});` dangling** — a parse failure, which my harness saw as a non-zero exit with no output and
reported as *caught*.

W2's Record says it in one line: *"a mutation harness that cannot fail is the same defect as a test
that cannot fail."* This is that, inside the item running ten negative tests under the rule P1's retro
had just added. **The negative test needed a negative test.**

**And the reason I had written down was false too.** The claim was that a re-entrant `resolve()`
would interleave the sequence with itself. It cannot: `Driver.append` pushes before it notifies, so a
re-entrant append lands *after* the current element. The real reason is sharper and is now tested —
**resolving inside the driver's own turn means the run is never quiescently `awaiting_action`**,
which is the state the row exists to demonstrate. A human who answers within the same synchronous
turn is not a human.

**2. `shutdown()` was repairing the harness for the second time in two items.** The report was built
*after* `await scheduler.shutdown()`, and a drain does real work: it settles what was in flight, the
driver routes it, and the state advances. So every value read afterwards described a *finished* run
however the wait had ended.

That is how a **1 ms backstop passed every assertion on the one row whose declared result is the
backstop** — and the comment two lines above claimed it would *"fail loudly"*. It is the same shape as
[ADR 0014](../decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md)'s *Correction*
one item earlier, where replacing the whole termination mechanism with a timer passed all 72.

**The report is now read before `shutdown()`**, and that single change made three previously-invisible
mutations fail: the 1 ms backstop, the synchronous resolve, and the deferral's absence. It is safe
precisely because `lateInputs` asserts nothing arrives after a run is declared finished.

**3. `outcomesSeen` was sampled at every prefix, which is where `spec/run-state.md` section 3 says the
precedence does not rest.** Rows 10 and 11 recorded `running, completed, stuck, awaiting_action` —
**two of those four are artefacts**, and one is the fan-out-entry `stuck` ADR 0015's *Correction*
names. Row 10's `awaiting_action` claim, repeated as a headline in `CLAUDE.md`, `doc/README.md` and
the commit message, rested on that list.

**Second occurrence of the failure mode that produced section 3's quiescence block**, three weeks
after it was written to record the first. Sampling now happens in the termination microtask — and
being quiescent is what makes an **exclusion** sound, so rows can now say which outcomes a run must
never have been in, which is what makes the sampling point itself falsifiable.

**4. The join was never once fired from the `lost` or `exited` path.** `spec/join-policy.md` section 4
says `status` is asked after **every** terminal event *"because a join can become satisfiable when the
last live branch was lost or exited — which is P1's case"*. Deleting `settleJoin` from **both** of
those paths was invisible across twelve real rows.

The cause is a knob with no assertion: `ScoreWorker` was the only threaded pool, so the *arriving*
branch always settled last and the join was always fired by the arrival. **Twelve rows systematically
avoided the firing order P1 is about.**

Fixed by **arranging** the order rather than depending on one: a role that must settle last is given a
4× delay, `optional-loss` runs inline so its lost branch is last, and a new row `exit-last` makes the
exiting branch last by giving it a different worker type. Both mutations now fail.

**5. `RunFailure.kind` was pinned by no test anywhere.** Forcing it to `'Error'` was green at L6 *and*
at L1-L5. Row 13's assertion read `${kind}: ${message}` for a substring, and `UncloneableResult`'s
message begins with its own class name — so the message satisfied the check and `kind` was free. Now
checked separately, alongside `OR-R6`'s actual wording: *the message names the task id*.

**6. The assertion-count floor's declared property was false, and the Record repeated it.** *What
broke* 4 of the first Record said it was *"checked two ways … either alone misses something"*. Both
ways read the same two constants, so decrementing an assertion **and** the constant that counts it
passed both — measured at 174 assertions, exit 0. There is now an **absolute anchor**: a total a human
wrote down, which nothing else derives from.

**7. Three fields were populated for the first time and asserted by nothing** — `stoppedBy`,
`regions[*].suspended`, and the join's `null` payload reaching a real worker ([Q36](../questions/q36.md)).
All three now have assertions. `regions[*].suspended` turned up a **spec gap** on the way:
`spec/run-state.md` does not fix whether it is cumulative or current. Reported as
[Q62](../questions/q62.md), not patched — it is W1's and W2's document.

**8. `doc/open-questions.md` was wrong again, for the third time in three items.** [Q44](../questions/q44.md)
said W5's runs *"needed no local flow at all"*; W5 committed one and its own `l6.ts` comment calls it
the second occurrence. W6 added three more. **The trigger that row named has now fired four times in
three consecutive items**, which is the answer it was waiting for. Corrected in place.

**9. The exceptions table was declared empty and was not.** The commit edits `CLAUDE.md` and
`doc/README.md`. `doc/README.md` is arguably section 1's **record** step; `CLAUDE.md` is named nowhere
in `doc/workflow.md`, and W5 kept its front-door edits in a separate commit. **This was offered as the
first confirmation that section 7 rule 2's amendment describes something real**, so a false instance
is worse than an ordinary undeclared edit. Corrected above, and put to P2's retro as two occurrences
in two items.

**10. Smaller, and all real.** The `unsettled` field's comment covered one of its two users. The
`fail` worker role's comment described one of its four consumers. `examples/README.md` and the
harness header both still said reaching the backstop is always a failure. Two front-door files carried
`118` and *"6 real runs"*. And the human-readable artifact — ladder L7's material — printed
**`awaiting_acnever`**, garbling the outcome the item exists to demonstrate, in a table the Record
pasted in unnoticed.

## What this taught

- **Three of the six blocking findings are the same mechanism**: something downstream of the
  assertions repaired the state before they ran. `shutdown()` twice, and a mid-turn sample once.
  **The harness's own vantage point is now the thing to check first** — not what it asserts, but
  *when* it looks.
- **A negative test can be a broken test, and mine was.** Ten mutations, one malformed, and the
  malformed one produced the Record's most confident false claim. `doc/workflow.md` v0.3 section 5
  rule 7 says a new check is negative-tested at birth; **it says nothing about the negative test
  being well-formed**, and a parse failure is indistinguishable from a caught mutation to a harness
  that only reads the exit code. **For P2's retro.**
- **The two-reader split earned itself a third time, and the overlap stayed low.** Roughly 25
  findings between them; **three overlapped** — `branch.resumed`, the backstop margin, and the
  Outputs cell. W4: 1 in 13. W5: 3 in ~35. W6: 3 in ~25. Three items, consistent.
- **The adequacy reader's most valuable output was not a survivor.** It was the list of what L6 does
  *not* see: every field of the outcome record but `terminalState`, `OR-R2`'s aliasing hazard,
  `OR-R3`'s one-record-per-settlement. All are covered at L1 — but **L6 is the only place `OR-R2`'s
  inline-pool hazard is physically reachable**, and L6 does not look.
- **P2's prediction held and the plan was right to lower its own stakes.** Nothing in `src/` broke.
  Every finding was in the gate that was supposed to be checking it.

## Questions raised

Q61 by P2 before the item started; **Q62 and Q63 by the readers.** Q64-Q70 skipped, never reissued.

| Q | | raised by |
|---|---|---|
| Q61 | `OR-R6` is reachable from an inline pool and not from a thread pool | P2's spike |
| Q62 | Is `regions[*].suspended` cumulative or current, and does `spec/` care? | the conformity reader |
| Q63 | `UncloneableResult`'s message begins with its own class name, so `${kind}: ${message}` doubles it | the conformity reader |

## What is still open in this item, deliberately

- **The 400 ms backstop has ~10× headroom and nothing depends on the margin.** Measured: 1 ms fails,
  40 ms passes. Left generous rather than tuned to the edge, because a margin tuned to what currently
  passes is a flake waiting for a slower machine.
- **`unsatisfiable` / `joined: false` remains an empty set** at every rung; neither shipped policy
  returns it.
- **The outcome record's ten other fields have no L6 assertion**, per *What this taught*. That is
  coverage the readers named and this item did not take on.
- **`FD-R1` and `ID-R1` remain L2-only.** Row 13 exercises `OR-R10`'s reporting path with a real
  scheduler, which is the half that matters.
