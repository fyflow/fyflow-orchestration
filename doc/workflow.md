# Workflow

**Status:** v0.4 - **run to completion twice**, by [P1](plans/p1-what-satisfies-a-join.md) and
[P2](plans/p2-the-non-success-half-on-a-real-scheduler.md)
**Read this before starting any work item.** Paths are relative to the repo root unless they are
markdown links.

**v0.3 is P1's retro acting on itself.** This document was inherited from
`fyflow-react-components` and had never been run - there or here. P1 ran it end to end across five
work items and **eleven reader-passes**; the retro adopted four changes and refused several more,
and all of it is in [P1's Record](plans/p1-what-satisfies-a-join.md), including a verdict on every
row of the adaptation table at the end of this file. That table stays, for the next plan to
re-judge.

**v0.4 is P2's retro, and it is a smaller edit than P1's because two of v0.3's four changes needed
nothing.** The two-reader split is settled - four items, four overlap measurements, flat at about
10% - and the `Outputs` table earned itself. The two that changed had both been *followed* and
failed anyway, which section 6 pass 3 rule 3 calls the sharpest kind of finding: **rule 7's
provocations are now checked in rather than run once** (a probe that ran once is a claim about the
past), and **section 7 rule 2's declared-exceptions mechanism is replaced by a check**, after three
consecutive items answered *"did you edit outside your `Owns`"* with *"yes, and I did not notice"*.
**Rule 8 is new**, and it has the strongest evidence of any rule here: three items in a row shipped a
fix for a review finding that could not fail. Full reasoning in
[P2's Record](plans/p2-the-non-success-half-on-a-real-scheduler.md).

**P1's central measurement, still the one that should shape how a plan reads this document:**
of the eight defect classes P1 produced, **five have no rung on the ladder at all - and every one of
those five was found by the conformity pass.** The ladder is good at what it covers; section 6 is
carrying what it does not.

---

## 1. The loop

```
   concept          doc/concept.md - what we are building and why. Rarely changes.
      |
      v
   plan             doc/plans/<id>-<slug>.md - ONE question, ONE exit artifact
      |
      v
   work items       doc/work-items/<id>-<slug>.md - one file each, declared BEFORE work starts
      |
      +--> W_a ---+
      +--> W_b ---+   parallel where a spec separates them, serial otherwise
      +--> W_c ---+   tests are written INSIDE the work item, never afterwards
                  |
                  v
   verify          three passes, in this order:
                    1. the ladder (section 4) - climb from L0, stop at the first failure
                    2. spec conformity - a reader who did not write it checks it against the spec
                    3. retro - what the work taught, and what changes in the docs
                  |
                  v
   record          fill in the work item's Record section, mark it done, then update
                  the plan's Record, doc/README.md, CLAUDE.md and README.md
```

Four rules that make the loop worth having:

1. **A work item that cannot state its verification gate is not ready to start.** Write the gate
   first. If you cannot, the decomposition is wrong and starting will not fix it.
2. **Tests are part of the work item, never follow-up.** A work item is done when the code works,
   the tests exist, and someone who did not write them has read them against the spec.
   **This rule was followed by all five of P1's items and every one still shipped an assertion that
   could not fail**, because the author who misreads the spec writes the code and the test from the
   same misreading. Writing tests inside the item does not make them falsifiable; section 5 rule 3,
   and the procedure in rule 7, are what do.
3. **A decision that is not in `spec/`, an ADR, or a plan did not happen.** Chat transcripts are
   not the record.
4. **Say what you skipped.** A skipped check reported as passed makes the whole ladder worthless.
5. **The record step's files are part of finishing an item, not exceptions to its `Owns`.** Those
   four and no others: the plan's Record, `doc/README.md`, `CLAUDE.md`, `README.md`. **Anything else
   outside `Owns` is declared** - and after W5, W6 and W9 each miscounted, it is checked rather than
   declared alone (section 7 rule 2).

## 2. The unit of work

**A plan is a vertical slice.** It cuts end to end - definition through driver through a real
scheduler - and ends in something a human can look at. A plan must:

1. State the **one question** it answers, in a sentence.
2. End in an **exit artifact**: a run that routed correctly, a measured number, a rendered trace.
3. Touch every layer it claims to touch. No stub standing in for the interesting part.
4. Be small enough that its whole gate runs in under a minute.

**A work item is the smallest thing with its own gate.** It owns a set of files, states what proves
it correct, and is declared in the plan before anyone starts. Use `doc/work-items/TEMPLATE.md`.

## 3. Ids and files

| Thing | Id | Lives in |
|---|---|---|
| Plan | `P1`, `P2`, ... | `doc/plans/p1-<slug>.md` |
| Work item | `W1`, `W2`, ... - one sequence across all plans, never per plan | `doc/work-items/w1-<slug>.md` |
| Open question | `Q1`, `Q2`, ... | `doc/open-questions.md` |
| Decision | `ADR 0001`, ... | `doc/decisions/0001-<slug>.md` |
| Upstream want | `S1`, `S2`, ... | `doc/scheduler-upstream.md` |

**Ids are never reused and never renumbered.** They leak into commit messages, test names and spec
prose, and a commit message cannot be rewritten. Gaps are free; renumbering is not.

**A work item reserves its question and ADR numbers in its declaration, before work starts** - the
`Reserves:` line. Every work item raises questions nobody predicted, so reserve generously (5
questions, 2 ADRs) and let the unused ones be skipped. Two items that each take "the next free
number" while running in parallel take the same one, and that is a rename across nine files.

**Q ids are shared vocabulary across the fyflow repos, not across their numbering.** Our Q17 and
`fyflow-react-components`' Q16 are the same question with different ids. Cite the other repo's id
with its repo name attached, always.

## 4. The verification ladder

Every check has a level. **Climb from 0 and stop at the first failure** - an L1 failure makes an L5
result meaningless.

| L | Check | Cost | Catches |
|---|---|---|---|
| 0 | Typecheck, lint, format | ~2 s | signature drift, dead exports, style churn in diffs |
| 1 | Unit tests: definition validation, predicate registry, the fold - **no scheduler** | ~3 s | logic errors |
| 2 | **Routing tests**: a fixture log of task outcomes in, an asserted node sequence out | ~5 s | the decision and fan-out logic, without a single worker |
| 3 | **Determinism**: fold the same outcome log twice, deep-compare run state | ~2 s | map ordering, `Date.now()` in the fold, hidden state |
| 4 | **Definition conformance**: every example flow validates against `spec/` | ~3 s | an author and the driver drifting apart |
| 5 | **Join and failure matrix**: every Q5 case - failed, `user_action`, optional-null, routed-away - against every join policy | ~10 s | the case the happy path never reaches |
| 6 | **A real scheduler**, real workers, a real flow, end to end | ~60 s | dispatch races, the id scheme, everything no fixture can prove |
| 7 | **A human looks** at a trace or a run | a person | does it read as a flow executing |

**Level 2 is where this repo's value is proved and it costs almost nothing.** Routing is a pure
function of outcomes, so the interesting behaviour - a decision, a fan-out, a join - is testable
with no workers, no threads and no timers. If level 2 is hard to write, the driver has reached for
the scheduler somewhere it should not have, which is the review's first question (concept section
4).

**Level 5 is a rung rather than a case because the join is the hard part** (Q4-Q7). A matrix that
enumerates outcome × policy is the only thing that makes a Q5 answer honest, and every cell that is
"undefined" is a spec hole with an address.

**Level 6 is the only rung that sees a real scheduler**, so it is the only one that can catch a task
id colliding (Q13), a `workerType` that is not a registered pool, or a driver listener that is too
slow on a hot path. Do not skip it because 0-5 are green; every one of them is downstream of
fixtures we wrote ourselves.

**The ladder has a second dimension: the runtime.** This library targets **Deno, Node >= 24 and the
browser from one source tree** (`spec/runtime-targets.md`), so a rung is not green until it is green
where it is required to run:

| Rungs | Where they run | Why |
|---|---|---|
| **L0-L5** | **all three** | pure logic over fixtures. Three cheap passes, and L0 in particular is the only thing that catches a `node:` import before a Deno consumer does (`RT-R3`, `RT-R4`) |
| **L6** | **open — [Q33](open-questions.md)** | the only rung with real workers, and therefore the only one whose cost is per-runtime rather than per-pass |
| **L7** | once | a person does not read the same trace three times |

**A rung reported green without saying which runtimes it ran in is a rung that ran in one.** Section
1 rule 4 applies to this axis exactly as it applies to skipped levels.

**Levels 0-6 are the agent's job. Level 7 is where a person enters.** Never spend a person on
something an L<=6 assertion could have caught. If a human finds a bug a machine check could have
found, the fix is to **add the check**, not just fix the bug.

> **What the ladder does not cover, measured over P1's five items.** Five defect classes have **no
> rung**, and all five were found by section 6's conformity pass rather than by any level here: an
> assertion that cannot fail; **a declared output that was never built**; a spec asserting what its
> own inputs cannot supply; a false claim in `doc/`; and a check that does not exist but is reported
> as having run.
>
> **They are not made rungs, and the reason is that L0-L6 are commands.** *"Did you build what you
> said"* is not one. The first is addressed by `doc/work-items/TEMPLATE.md`'s **Outputs** table,
> where an output nobody built is a blank cell a reviewer can see, and the last by section 5 rule 7.
> The middle three are the conformity pass's, and knowing which is which is the point of the list.

## 5. Tests are a deliverable, and tests can be wrong

```
   spec --+--> implementation --+
          |                     +--> ladder L0-L7 --> green
          +--> tests -----------+
                  ^
                  +-- one author reading the spec wrong once produces code and tests
                      that share the misreading, agree perfectly, and pass
```

> **A green ladder is a statement about the tests. Reading the tests against the spec is what turns
> it into a statement about the code.**

Rules:

1. **Expected values come from the spec, not from output.** Paste a routing sequence you got by
   running the driver and you have written a test that never could have failed. Non-obvious values
   carry their derivation in a comment.
2. **A snapshot generated by running the implementation is not a test.** It is a photograph of
   today's behaviour, bugs included. When a snapshot diff appears, assume the code broke until
   proven otherwise. "Update the snapshots" is the most dangerous command in this repo.
3. **Assertions must be able to fail.** `expect(visited.length).toBeGreaterThan(0)`, no-throw tests,
   and truthiness checks are placeholders.
4. **Fixtures must not come from the code under test.** An outcome log generated by the driver
   proves the driver agrees with itself. Hand-write it from the spec, or capture it from a real
   scheduler run and review it line by line at birth.
5. **Test the contract, not the implementation.** Never assert internal call order, or a fan-out
   completion order the spec does not fix - that order is genuinely non-deterministic (concept
   section 5) and a test that depends on it will flake in CI and nowhere else.
6. **The cases the spec names are a coverage checklist with addresses.** A branch routed away from
   its join (Q4), a task ending in `user_action` (Q17), no decision edge matching (Q10), a
   duplicate task id (Q13), a nested fan-out (Q6) - each missing test is a hole with a citation,
   not a vague gap.
7. **A new check is negative-tested at birth, and the provocations are checked in.** Rule 3 says an
   assertion must be able to fail; this is how you know one can. Write the check, break the thing it
   checks, watch it fail, put it back - **and commit the breaking, so it can be re-run.** Three
   requirements, each from a failure of the weaker form:
   - **Checked in and runnable**, not run once by hand. W9 ran five probes in a scratch directory;
     its adequacy reader then disabled the script's own machinery one piece at a time - `if (false)`
     on two of its checks and on its final `process.exit(1)` - and **8 of 9 survived**. Made
     re-runnable, the same five probes became twelve, and **seven of the holes were found by the
     act of re-running them.** `scripts/check-docs-selftest.mjs` is the worked example.
   - **Each probe asserts that it changed its input.** A probe whose edit matches nothing passes for
     the wrong reason, which is the vacuity this whole rule exists to refuse.
   - **A probe names which check refused it**, not merely that something exited non-zero. W6's
     ten mutations included **one that was a syntax error rather than a mutation**; the harness read
     only the exit code, so a parse failure was indistinguishable from a caught mutation, and it
     became that Record's most confident false claim.

   **P1's evidence for the rule was one-sided and remains so:** every check provoked at birth worked
   - `check-source.mjs`'s ten and `check-scheduler.mjs`'s five - and the one hand-run once and
   written into a Record as though it were a gate, `RT-R4`'s grep, **did not exist at all.** A check
   written to close a review finding needs this most: two of W5's failed their own first negative
   test, one because it searched text it had already blanked.

8. **When you act on a review finding, break the fix and watch the gate go red.** Rule 7 for fixes
   rather than for checks, and it exists because **three consecutive items shipped a repair that
   could not fail**:
   - W4 - the join's `null` payload could become `{}` and survive 251 assertions.
   - W5 - the L6 gate's termination predicate replaced by `setTimeout(1)`, every assertion still
     passing, because `scheduler.shutdown()` drained the run while the fold kept advancing.
   - W9 - the reference's flagship snippet wrote three records for one settlement and stopped its
     own run, while its assertion passed **because a refusal fired before the dispatch it counted**.

   Each was correct work done in response to a finding, and none was *shown* to be correct. **No rung
   of section 4 covers this**: L0-L6 all check the product, and nothing checks the repair. Record the
   provocation beside the fix, the way rule 7 asks of a check.

## 6. Verify: the three passes

**Pass 1 - the ladder.** Section 4. Report which levels ran and which did not, per work item.

**Pass 2 - spec conformity. Two readers, one question each.**

| reader | reads | asks | method |
|---|---|---|---|
| **conformity** | the spec first, the code second | does this do what the spec says, including the refusals and the edge cases | reading, and re-deriving the item's expected values independently before looking at them |
| **adequacy** | the spec first, the tests second | **would these tests have noticed if it did not** | mutation, chosen by walking the rule ids rather than by intuition |

Both **read the spec before the artifact.** Reading the code first reconstructs the author's
misunderstanding and confirms it. Both run with a fresh context or as a separate session, and both
**report; they do not fix** - a reviewer that patches what it found has reviewed its own work.

**Why two readers rather than one asking both questions**, which is what earlier versions said.
Measured over the two items that split it: **W4 - 13 findings, 1 overlap. W5 - about 35 findings, 3
overlaps**, and each overlap arrived from a different direction. One reader answers whichever
question it read first.

**The cost is roughly double, and the counter-evidence is on the record:** W1's and W3's single
readers ran mutation sweeps too - 85, 146 and 100 mutations - and found a great deal. What the split
buys is **marginal coverage rather than coverage**; the second reader finds what the first was not
looking for, which is what the overlap number measures. An author's own sweep is worth running and
substitutes for neither: W5's author ran 19 mutations and found 2 survivors, and its adequacy reader
ran 148 and found 38.

**Pass 3 - retro.** Once the plan's work items are merged, review the *method*, not the product:

1. **"No change" is an expected verdict.** A retro that always finds three improvements is
   measuring its own output.
2. **A new rule needs two occurrences, in different work items** - or one occurrence with a stated
   argument for why it generalizes.
3. **The sharpest finding is a rule that was followed and did not work.** A rule that was *broken*
   means someone was careless. A rule that was **followed** and failed anyway means the mechanism
   is wrong and needs replacing, not restating.
4. **A proposed rule states what it replaces.** This document is read in full before every work
   item. Deletions are as legitimate an output as additions.
5. **Name the rung.** For every defect the retro discusses, say which level of section 4 should
   have caught it - and if none would have, that is the finding.

## 7. Parallel work

1. **Work items are separated by a spec, never by intuition.** If two items agree only by
   convention, they are one item. The flow definition and the run-state shape in `spec/` are what
   let the definition validator and the driver be built by two agents who never see each other's
   work.
2. **If two CONCURRENT work items would edit the same file, they are one work item.** Merge cost
   exceeds the parallel saving every time. **A serial item pays none of that cost and the rule does
   not bind it** — it declares an **exceptions table** instead: every file it edits outside its
   `Owns` and outside section 1's record step, named, with the reason, before it starts. W4 took one
   exception and W5 took seven, and both were right to.

   **The declaration is checked, because three items running showed that declaring is not enough.**
   W5 edited one file it had not listed; **W6 declared its table empty and had edited two**, found by
   its conformity reader running `git show --stat`; and **W9 — the next item, with W6's warning
   already written down — undercounted by six**, including a new file in nobody's `Owns` and an edit
   into W6's `examples/l6.ts`. Three consecutive items answered *"did you edit outside your `Owns`"*
   with *"yes, and I did not notice."* A rule read in full before every item, followed and failing
   three times, is a mechanism problem: `git diff --name-only` against the `Owns` block is what
   settles it, and until that check exists **run it by hand before filling in the Record.**
3. **Fan out on execution, not on design.** Parallel agents given an under-specified goal produce
   designs that do not compose. Decide, then fan out. **Q1, Q2 and Q4 are the decisions this rule
   is about here** - fanning out before they land produces a driver, a definition format and a join
   that do not fit together.
4. **Keep the joint small.** An item's output to another item should be a typed value or a
   document, not a set of assumptions.

Anti-patterns: fanning out before the spec is agreed; accepting an implementer's self-report as
verification; reaching for a real scheduler when a level-2 routing assertion would answer the
question; a quick edit to `spec/` to make a test pass.

## 8. Speed

The loop has to be seconds or the discipline above stops being run.

| | Target | |
|---|---|---|
| Single test file (watch) | < 2 s | one runtime - whichever you are editing in |
| Work-item gate (L0-L3) | < 15 s | **one runtime.** The other two run at the join |
| Plan gate (L0-L6) | < 90 s | **L0-L5 in all three**, L6 per [Q33](open-questions.md) |

**The three-runtime requirement lands on the plan gate, not on the edit loop**, and that split is
deliberate: L0-L5 are pure logic over fixtures, so the second and third pass find configuration
errors rather than logic errors, and configuration errors do not need to be caught in two seconds.
Running all three on every keystroke is how a budget gets blown and then abandoned.

A gate over budget gets a fast subset on every change and the full version at the join. A
verification step nobody waits for is a verification step nobody runs.

---

## What was adapted, and what the retro judged

Recorded so pass 3 could assess the changes specifically. The sibling's version is at
`../fyflow-react-components/doc/workflow.md`. **The verdict column is P1's** - the first plan to run
this document end to end - and the table stays for the next plan to re-judge rather than being
deleted now that it has been answered once.

| Change | What would show it was wrong | **P1's verdict** |
|---|---|---|
| Ladder rungs 1-5 rewritten | A defect class with no rung, found at L6 or by a human | **Right, and the failure prediction was wrong in an instructive way.** Five classes have no rung - and **every one was found by the conformity pass**, not at L6 and not by a person. The rungs are sound; what was mispredicted is who catches what falls between them |
| **L5 is a join/failure matrix**, not Storybook | The matrix is mostly "undefined" cells, meaning the spec was not ready | **Right.** All eighteen cells filled, hand-derived from `spec/` before running, and it is what produced [ADR 0003](decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) |
| **L2 is routing-from-a-fixture-log** | L2 needs a scheduler to run | **Right, and the cheapest thing in this document.** Four items used it; the fake scheduler is 22 lines in W3 and 30 in W5 |
| Section 3 gains a cross-repo id rule | Someone cites a bare Q id and the wrong repo is read | **Unproven.** No cross-repo citation occurred in P1. Kept; nothing was learned either way |
| Section 7 rule 3 names Q1/Q2/Q4 | Fan-out happens anyway and the pieces do not compose | **Right.** W2 and W3 ran in parallel against W1's spec and met at the definition and the log shape. The one place they did not compose - `Region` never produced in its declared shape - was caught by W3's own pass |
| No jsdom rule carried over | - | n/a |

**The adaptation this table does not list is the one that mattered most: the runtime axis in section
4.** W1 added it after the three-runtime requirement surfaced from outside every check in the
repository, and it is what found `RT-R9` - a construct all four typecheckers accept and Node refuses
to load. `RT-R1` read as ceremony and was not.

**And the adaptation P1 made to itself:** v0.3's four changes. The full retro, including the
findings it refused to turn into rules and why, is in
[P1's Record](plans/p1-what-satisfies-a-join.md).

**What P2 did to those four**, in one table, so the next plan judges v0.4's changes the same way:

| v0.3 change | What would show it was wrong | **P2's verdict** |
|---|---|---|
| TEMPLATE gains an **`Outputs`** table | every row reads "yes", making it a formality | **Right, for a reason P1 did not predict.** The load-bearing column is *"what would fail without it"*, not *Exists* - two of W6's rows could not answer it, and both were findings |
| **Pass 2 is two readers** | the overlap rises, meaning one would have done | **Right, and settled - stop re-litigating.** W4 1/13, W5 3/~35, W6 3/~25, W9 3/~30: flat at ~10%, and it has not risen with practice |
| **A new check is negative-tested at birth** | a check ships that cannot fail | **Right in aim, wrong in mechanism - amended (rule 7).** Followed twice, failed twice: a malformed probe indistinguishable from a caught one, and probes that were never committed |
| **Section 7 rule 2's exceptions table** | an item's exception list is wrong | **Wrong as written - replaced by a check.** Three consecutive items miscounted, the third with the warning already in this file |

**The one thing four plans have observed and no rule names:** `doc/` is upstream of every check here
and is checked by nothing - a false register entry (Q43), an index claiming reader-passes were
outstanding when they had run, a file header saying twelve at thirteen. P1's retro named it and
refused to make a rule; **P2's retro did the same, and said why**: both candidate mechanisms are
worse than the problem. It stays the thing most likely to bite next.
