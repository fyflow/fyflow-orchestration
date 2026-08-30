# Workflow

**Status:** v0.1 - adapted from `fyflow-react-components`, applies from the first plan onward
**Read this before starting any work item.** Paths are relative to the repo root unless they are
markdown links.

This document is **inherited and unproven here.** It has never been run in this repository, and the
sibling it came from had not run it either at the time of copying. Section 6 pass 3 is where it
gets tested; the adaptations are listed at the end of this file so the retro can judge them
specifically rather than in general.

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
   record          fill in the work item's Record section, mark it done,
                  then update the plan's Record and doc/README.md
```

Four rules that make the loop worth having:

1. **A work item that cannot state its verification gate is not ready to start.** Write the gate
   first. If you cannot, the decomposition is wrong and starting will not fix it.
2. **Tests are part of the work item, never follow-up.** A work item is done when the code works,
   the tests exist, and someone who did not write them has read them against the spec.
3. **A decision that is not in `spec/`, an ADR, or a plan did not happen.** Chat transcripts are
   not the record.
4. **Say what you skipped.** A skipped check reported as passed makes the whole ladder worthless.

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

## 6. Verify: the three passes

**Pass 1 - the ladder.** Section 4. Report which levels ran and which did not, per work item.

**Pass 2 - spec conformity.** A reader who did not write the code, who **reads the spec first and
the code second**. Reading the code first reconstructs the author's misunderstanding and confirms
it. It answers two questions, and they are different:

| looks at | asks |
|---|---|
| the code | does this do what the spec says, including the refusals and the edge cases |
| the tests | would these tests have noticed if it did not |

Run it with a fresh context, or as a separate session. It **reports; it does not fix** - a reviewer
that patches what it found has reviewed its own work.

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
2. **If two work items would edit the same file, they are one work item.** Merge cost exceeds the
   parallel saving every time.
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

## What was adapted, and what the retro should judge

Recorded so pass 3 can assess the changes specifically. The sibling's version is at
`../fyflow-react-components/doc/workflow.md`.

| Change | Why | What would show it was wrong |
|---|---|---|
| Ladder rungs 1-5 rewritten | The sibling's rungs are about a wire codec, a reducer and browser rendering. None of that exists here | A defect class with no rung, found at L6 or by a human |
| **L5 is a join/failure matrix**, not Storybook | The join is this repo's hard part (Q4-Q7), and an enumerated matrix is the only honest test of a Q5 answer | The matrix is mostly "undefined" cells, meaning the spec was not ready |
| **L2 is routing-from-a-fixture-log** | The equivalent of the sibling's cheap high-value rung. It is also the check that the driver has not leaked into the fold | L2 needs a scheduler to run |
| Section 3 gains a cross-repo id rule | Two repos, two Q sequences, same questions (`open-questions.md` notes) | Someone cites a bare Q id and the wrong repo is read |
| Section 7 rule 3 names Q1/Q2/Q4 | The sibling's rule is abstract; here the specific decisions that gate fan-out are known in advance | Fan-out happens anyway and the pieces do not compose |
| No jsdom rule carried over | No DOM in this repo at all | - |
