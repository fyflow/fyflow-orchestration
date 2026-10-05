# Workflow

**Status:** v0.27 — **run to completion TWENTY-SEVEN times**, by P1 through P27, two of which adopted
nothing (P8 and P25), which is section 6 pass 3 rule 1's expected verdict rather than a failure to
run it. **Read this before starting any work item.** Paths are relative to the repo root unless they
are markdown links.

*This file was **305,643 bytes** until
[W115](work-items/w115-the-exit-artifact-and-the-budget-met.md) cut it to
[P27](plans/p27-what-a-register-row-is.md) decision 1's budget, which `npm run check:budget`
enforces. The version blocks and the adapted-from table went whole, and **sections 1-8 lost 74%
of themselves**; what replaces the arguments is the ledger below. That item's Record and `git`
carry the rest.*

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
   verify          the ladder (section 4), then two readers, then the retro - section 6
                  |
                  v
   record          fill in the work item's Record, mark it done, then rule 5's FOUR files
                  - NOT CLAUDE.md and NOT doc/README.md
```

Five rules that make the loop worth having:

1. **A work item that cannot state its verification gate is not ready to start.** Write the gate
   first. If you cannot, the decomposition is wrong and starting will not fix it.
2. **Tests are part of the work item, never follow-up.** Done is: the code works, the tests exist,
   and someone who did not write them has read them against the spec. *Followed by all five of
   P1's items, every one of which still shipped an assertion that could not fail — one author's
   misreading produces the code and the test.*
3. **A decision that is not in `spec/`, an ADR, or a plan did not happen.** Chat transcripts are
   not the record.
4. **Say what you skipped.** A skipped check reported as passed makes the whole ladder worthless.
5. **The record step's files are part of finishing an item, not exceptions to its `Owns`.** Those
   **FOUR** and no others: the plan's Record, `README.md`, **`doc/questions/**`**, and
   **`doc/decisions/**`**. **Anything else outside `Owns` is declared.**

   **`CLAUDE.md` left this list at W112 and `doc/README.md` at W115**, both by the maintainer —
   [ADR 0077](decisions/0077-an-item-does-not-write-its-status-into-claude-md.md) and
   [Q466](questions/q466.md). **An item does not write its status into either.** *The record step
   was filling `CLAUDE.md` faster than its whole budget, by a per-commit margin ADR 0077 records.*
   **And the entry was never the source** — the first row below has said since v0.9 that a status is
   read from the item's own file, so the rule obliged an item to write a copy and then told the next
   reader not to trust it. **`npm run state` replaced it.**

   **Four directions on one rule, every one earned by a conformity reader:**

   | | the clause | what earned it |
   |---|---|---|
   | **read** | a status is **read from that item's own file, never from an index** — and that is **ANY copy, including your own** | an index twice said *reader-passes outstanding* about passes that had run, and the second time REPRODUCED into a fourth document |
   | **write** | a claim **states the scope it was MEASURED at**, never the scope you believe | W30 measured five checks and wrote *all five* into six documents. **Its author generalised without saying so** |
   | **when** | a measured number is **RE-TAKEN on the tree the item ships** | W39 published its headline from code-complete. **No rung covers a Record's numbers** |
   | **un-write** | a **WITHDRAWN claim is SEARCHED FOR**, and where it is an item's own ID the procedure is a **grep** | W46's four withdrawn claims survived in a file it edited in the same commit. `W33` returned 19 hits in eight files; `W42` zero — *no false positives, silence when there is nothing* |

   *An index that contradicts the document it indexes does so on precisely the sentence that was just
   corrected, because that is the sentence somebody was looking at.* **So: before an item is done, it
   greps the tree for its own id, and for any phrase or number it withdrew.**

## 2. The unit of work

**A plan is a vertical slice.** It cuts end to end — definition through driver through a real
scheduler — and ends in something a human can look at. It states **one question** in a sentence;
it ends in an **exit artifact** (a run that routed correctly, a measured number, a rendered
trace); it touches every layer it claims to, with no stub standing in for the interesting part;
and it is small enough that its whole gate runs in under a minute.

**A work item is the smallest thing with its own gate.** It owns a set of files, states what proves
it correct, and is declared in the plan before anyone starts. Use `doc/work-items/TEMPLATE.md`.

## 3. Ids and files

| Thing | Id | Lives in |
|---|---|---|
| Plan | `P1`, `P2`, ... | `doc/plans/p1-<slug>.md` |
| Work item | `W1`, `W2`, ... - one sequence across all plans, never per plan | `doc/work-items/w1-<slug>.md` |
| Open question | `Q1`, `Q2`, ... | `doc/questions/q1.md` |
| Decision | `ADR 0001`, ... | `doc/decisions/0001-<slug>.md` |
| Upstream want | `S1`, `S2`, ... | `doc/scheduler-upstream.md` |

**Ids are never reused and never renumbered.** They leak into commit messages, test names and spec
prose, and a commit message cannot be rewritten. Gaps are free; renumbering is not. An item reserved
and never issued is **skipped, never reissued** — which is why `reserved` is a fifth status word in
`doc/work-items/TEMPLATE.md` rather than decoration.

**A work item reserves its question and ADR numbers in its declaration, before work starts** - the
`Reserves:` line. Reserve generously (5 questions, 2 ADRs) and let the unused ones be skipped: two
items that each take "the next free number" in parallel take the same one, and that is a rename
across nine files. **`npm run state` derives the next free id two ways** — from the tree's maximum
and from the last retro's ledger — and prints a disagreement rather than resolving it, because
`max + 1` is wrong exactly when a plan has closed one unissued.

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

**Level 2 is where this repo's value is proved and it costs almost nothing** — routing is a pure
function of outcomes, so a decision, a fan-out and a join need no workers, threads or timers. *If
level 2 is hard to write, the driver has reached for the scheduler somewhere it should not have.*
**Level 5 is a rung rather than a case because the join is the hard part** (Q4-Q7): a matrix over
outcome × policy is the only thing that makes a Q5 answer honest, and every "undefined" cell is a
spec hole with an address. **Level 6 is the only rung that sees a real scheduler**, so it alone
catches a colliding task id (Q13), an unregistered `workerType`, or a listener too slow on a hot
path — do not skip it because 0-5 are green, since all of them run on our own fixtures.

**The second dimension is the runtime.** This library targets **Deno, Node >= 24 and the browser
from one source tree** (`spec/runtime-targets.md`), so a rung is not green until it is green where
it must run: **L0-L5 in all three** — L0 alone catches a `node:` import before a Deno consumer does
(`RT-R3`, `RT-R4`) — **L6 per [Q33](questions/q33.md)**, the only rung costing per-runtime, and
**L7 once**. **A rung reported green without saying which runtimes it ran in ran in one.**

**A rung reported GREEN means its command EXITED 0. A line of its output is never the predicate** —
v0.15, P14. *Four occurrences, three plans, each an author reading a LINE because the output was
too long to read whole — and W54 broke this clause one plan later while quoting it.* Since
[ADR 0039](decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md) `lint`
is the chain's FIRST entry, a chain failing there runs nothing after it — and `FAIL` is a word the
checks print and `lint` does not.

> **Both directions, because stating one cost three blocking findings.** For **GREEN** the exit
> code is **NECESSARY** — a zero `FAIL` count is satisfied by a chain that stopped at entry one.
> For a provocation **CAUGHT** it is **NOT SUFFICIENT** — it cannot tell a detection from a crash,
> from noise, or from a sibling covering for the clause ([Q138](questions/q138.md)).
>
> **So: a rung is RUN, never PIPED. Redirect it and read `$?` in the same command** (v0.16, P15,
> because stating the predicate was not enough).
>
> ```bash
> npm run gate > gate.log 2>&1; echo "GATE EXIT=$?"
> ```
>
> A pipe replaces the exit code with the last stage's, and **`grep -c` exits 1 on zero matches**.
> **Grep the log afterwards; grep is a reading tool and never a verdict.**

**AND AN ITEM'S CONFIRMING GATE IS `npm run gate:full`, NOT `npm run gate`** — v0.26, P26, and the
sharpest kind of finding: a rule FOLLOWED that did not work.
[ADR 0070](decisions/0070-the-local-gate-is-the-ladder-and-proving-the-checks-can-fail-belongs-to-ci.md)
took the self-tests off the ladder at 245 s against 1326 s and **priced this case in its own
consequence 2**. *Two of P26's items shipped with `gate` green and `gate:full` RED, found at W110
only because its brief asked for `gate:full` by name — which is not a mechanism. It fired again at
W114.*

> It costs **about a quarter of an hour over eight lanes, ONCE per item**. **A
> green `gate` says the product works; it says nothing about whether anything could have noticed
> if it did not.** **Do not start one over a tree with a known red lane** — fix the lane, re-run
> it alone, then pay for the gate once, on the final tree.

**Levels 0-6 are the agent's job. Level 7 is where a person enters.** Never spend a person on
something an L<=6 assertion could have caught. If a human finds a bug a machine check could have
found, the fix is to **add the check**, not just fix the bug.

> **What the ladder does not cover, measured over P1's five items.** Five defect classes have **no
> rung** and all five were found by the conformity pass: an assertion that cannot fail; **a declared
> output that was never built**; a spec asserting what its own inputs cannot supply; a false claim
> in `doc/`; and a check reported as having run that does not exist. **They are not rungs, because
> L0-L6 are commands and *"did you build what you said"* is not one** — `TEMPLATE.md`'s **Outputs**
> table is where an unbuilt output is a blank cell a reviewer can see.

## 5. Tests are a deliverable, and tests can be wrong

> **A green ladder is a statement about the tests. Reading the tests against the spec is what turns
> it into a statement about the code** — because one author reading the spec wrong once produces
> code and tests that share the misreading, agree perfectly, and pass.

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
   completion order the spec does not fix - that order is genuinely non-deterministic
   (`doc/concept.md` section 5) and a test that depends on it will flake in CI and nowhere else.
   **Rule 8 obligation (f) is how it is provoked**: a completion order is a property of a SAMPLE, so
   it is found by ARRANGING a completion the other way, never by running the rung again.
6. **The cases the spec names are a coverage checklist with addresses.** A branch routed away from
   its join (Q4), a task ending in `user_action` (Q17), no decision edge matching (Q10), a duplicate
   task id (Q13), a nested fan-out (Q6) - each missing test is a hole with a citation, not a vague
   gap.
7. **A new check is negative-tested at birth, and the provocations are checked in.** Write the
   check, break the thing it checks, watch it fail, put it back — **and commit the breaking.**
   Three requirements, each from a failure of the weaker form: **(a) checked in and runnable**,
   not run once by hand — *W9's five hand-run probes became twelve, and seven of the holes were
   found by the act of re-running them*; **(b) each probe asserts that it changed its input**,
   since a probe whose edit matches nothing passes for the wrong reason; **(c) a probe declares the
   full SET of checks it must trip, matching exactly** — not that something exited non-zero, and
   not that the named check is among those that failed. *W6's ten mutations included a syntax error
   indistinguishable from a catch, and naming the check does not help: garbage in a snippet trips
   `X3` and `X4` together and satisfies either.*

   *P1's evidence for this rule was one-sided and remains so: every check provoked at birth worked,
   and the one hand-run once and written into a Record as though it were a gate did not exist at all.*

8. **When you act on a review finding, break the fix and watch the gate go red.** Rule 7 for fixes
   rather than for checks, and it exists because **three consecutive items shipped a repair that
   could not fail**: W4's join `null` payload could become `{}` and survive 251 assertions; W5's L6
   termination predicate could be replaced by `setTimeout(1)` with every assertion still passing;
   and W9's flagship snippet wrote three records for one settlement and stopped its own run while
   its assertion still passed. *Each was correct work done in response to a finding, and none was
   shown to be correct.* **No rung covers this**: L0-L6 check the product, nothing checks the repair.

   **Write the provocations to the RULE, not to the fix** — v0.6, P4. *Three items in a row: every
   probe was a way to REMOVE the fix, and every survivor the readers found was a way to NARROW it.*
   A set written from the fix inherits the fix's blind spot by construction.

   **Six obligations, four requirements on the set and seven on the harness. The table below IS the
   rule** — the clause, the one-line finding that earned it, and the retro that took it. *Read a
   clause here and nowhere else. P6 asked whether a fourth obligation should make this a section and
   P9 answered no, because "section 5 rule 8" is cited across this document, four plans, eleven work
   items and the register, and section 3's* ids are never renumbered *is the same argument one level
   out.*

   | | the obligation, and each amendment | earned by |
   |---|---|---|
   | **(a)** | **break the rule's own CLAUSES** | v0.6, P4 |
   | | and the **SHAPES** they quantify over — *all 37 of W41's probes used a `map` region* | v0.16, P15 |
   | | and every value the rule **ENUMERATES** — *W59 used three of its four* | v0.17, P16 |
   | | each under the **SAME CLAIM** — *a value of the kind is not an instance of the claim* | v0.18, P17 |
   | | and where it **SELECTS**, a fixture where every WRONG selection differs — *they survive by COINCIDING at the DEFAULT position* | v0.23, P22 |
   | **(b)** | **break every row of the `Outputs` table** | v0.7, P5 |
   | | and where a row IS an assertion, make each claim a **TAUTOLOGY** — *W74's eight guards, unfalsifiable, were EXIT 0* | v0.20, P19 |
   | **(c)** | **break the PROVENANCE of every value an assertion reads** — the source expression and nothing else | v0.8, P6; v0.9, P7 |
   | | its **LIMIT**: when the compound probe is green, **count the observers** — *a sensor cannot corroborate itself* | v0.13, P12 |
   | | ***independent*** excludes the first's apparatus — *W55's second observer measured the first's instrument* | v0.16, P15 |
   | | where the instrument is INSIDE what it measures, ask what the first observer **RETAINS** and **drop it once read** | v0.16, P15 |
   | **(d)** | **break the LOOP BOUNDS** — one entry out, the whole list out, and does anything COUNT it from elsewhere | v0.9, P7 |
   | | a **count is not a membership**; the layer names its MEMBERS — *one integer let the same deletion out three times* ([Q217](questions/q217.md)) | v0.14, P13 |
   | | a membership names the **CONTROLS** beside its claims — *W63 left out its two and L6 compared `[]` to `[]`* | v0.18, P17 |
   | | a control must fail where its claim is **VACUOUS**, not only where its subject is ABSENT — *every one read the DECLARED side* | v0.21, P20 |
   | | and its **TEST**: **NAME THE TREE** where the control fails and its claim passes | v0.22, P21 |
   | **(e)** | **break the WIRING** — can it be skipped, unreferenced, or reached with nothing to do? *A deleted dispatch hid 128 s of gradings* | v0.10, P9 |
   | | **is what it ran what SHIPS?** — *read the default declaration rather than running it* | v0.12, P11 |
   | | a **list is a claim about another list**: compare BOTH WAYS. **And *both ways* is a DIRECTION, not an observer count** — *W47's three fell to ONE swap* ([Q216](questions/q216.md)) | v0.13, P12 |
   | **(f)** | **break the ORDER** — delay each worker the row does not ARRANGE past its peers, and run the other pool mode — *W94: 0 of 3 red sampled, **3 of 3 at 5 → 300 ms*** | v0.25, P24 |
   | | **on the SET:** a survivor is one only once a **second independent route** confirms the clause was reachable | v0.7, P5 |
   | | the set is **re-run after acting on the readers**, with their exact edits checked back in | v0.8, P6 |
   | | a provocation is evidence only when it **fires for the reason it NAMES** ([Q138](questions/q138.md)), and **each guard needs a case that makes it fire** | v0.10, P9 |
   | | whatever makes a **discriminating PAIR differ** is itself a claim — *equalise the halves and the mechanism under them is deletable for 0* | v0.13, P12 |
   | | **on the HARNESS:** a **control** that changes nothing comes back clean, and an **asserted restore**, bytes compared back | v0.11, P10 |
   | | **every declared survivor RUN** against the rung its reason names — *three harnesses had a path that ran NOTHING* | v0.14, P13 |
   | | **every EDIT's anchor checked against the CURRENT text**, an abort that undoes, a content **DIGEST** — *the restore target for a file edited TWICE is its FIRST snapshot* | v0.17, P16 |
   | | a **set-equal-literal ceiling is DATED**, re-run by the item that moves the value — *2/11, 2/23, 1/14, 0/24 over four plans* | v0.14; v0.17 |
   | | a declared ceiling is **reported BY ID**, never by count | v0.26, P26 |
   | | the **ENVIRONMENT** is asserted — *W67 got four CRASH verdicts from a shell with no `fnm use 24`* | v0.19, P18 |
   | | its **GRADER is controlled**: one probe whose right verdict is CRASH, one WRONG-REASON, graded every pass on its clause's own failure line | v0.24, P23 |

   *Every amendment above is a clause that was FOLLOWED and fell short, which is section 6 pass 3
   rule 3's own bar and the reason the sequence is this long. None of them can see a CONSTANT, and
   none of them is about a probe that did not RUN — which is what the last two rows are for.*

## 6. Verify: the three passes

**Pass 1 - the ladder.** Section 4. Report which levels ran and which did not, per work item.

**Pass 2 - spec conformity. Two readers, one question each.**

| reader | reads | asks | method |
|---|---|---|---|
| **conformity** | the spec first, the code second | does this do what the spec says, including the refusals and the edge cases | reading, and re-deriving the item's expected values independently before looking at them |
| **adequacy** | the spec first, the tests second | **would these tests have noticed if it did not** | mutation, chosen by walking the rule ids rather than by intuition, **in an isolated copy of the tree** |

Both **read the spec before the artifact** — reading the code first reconstructs the author's
misunderstanding and confirms it. Both run with a fresh context or as a separate session, and both
**report; they do not fix**: a reviewer that patches what it found has reviewed its own work.

**The adequacy reader mutates, so it works in a COPY** — a `git worktree`, an archive, anything off
the shared tree. *P4 adopted this after three reader pairs ran against one checkout: the conformity
reader's measurements picked up the other's instrumentation, and the adequacy reader's cleanup
deleted `node_modules`.*

**Verify the copy holds no links before removing it, and never create one to make it typecheck** —
v0.7, P5, and this exists because v0.6's rule was **followed** and cost a repository. *W16's
adequacy pass isolated correctly, hit the obvious obstacle — `node_modules` did not resolve —
placed a junction there so `tsc` would ignore a sibling checkout, and
`git worktree remove --force` **FOLLOWED IT OUT OF THE REPOSITORY**, deleting `.git/`, `core/`,
`index.ts` and `dist/` until it hit a lock*
([ADR 0029](decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)).
**The rule's silence about the removal is the part that did the damage.** So: **copy** the
dependencies rather than linking them; **verify** green in the copy first, so a red result is the
reader's finding and not the copy's; and **scan for links before `--force` anything** —
`find <copy> -type l`, and on Windows `gci -Recurse -Force -Attributes ReparsePoint`. If either is non-empty, stop.

**And while a reader is reading, the AUTHOR's tree holds still** — v0.15, P14, and the other half
of the paragraph above: rule 8's set mutates the tree by construction. *Two occurrences, two
different observers: W51's conformity reader picked up a live rule-8 probe mid-read — one snapshot
RED on correct code; and W50's gate ran in the background while W51's edits landed, so its verdict
was about a tree that no longer existed. The retro that adopted this broke it within the hour.*
*A measurement over a moving tree is a claim about no tree.* **An item's rule 8 re-run, its gate
and its Record's numbers are taken with the tree still.**

**Why two readers rather than one asking both questions. The number to carry is the ABSOLUTE one:
two readers produce 0-4 shared findings, whatever the item's size** — **fifty-nine measurements**,
and P6 declares the question **settled and closed to re-litigation**. *The fraction is noise: W41's
**1 of 116** is the largest denominator recorded and did not move the numerator.*

**The caveat travels with the number: a SHARED PRIMING moves it.** *W31 gave both readers the same
list of claims the author was least sure of and came in at ZERO; W113's **seven**, the highest
ever, came from two briefs naming the same obligations and the same specifics; **W114 deliberately
differed its two and got three**.* So the overlap measures the briefs as much as the readers.
**The band's denominator is NOT the ordinal, and conflating them is how the band went false** —
three measurements are outside it (6, 6, 7) and each had a shared priming. **It counts measurements
TAKEN, not items reviewed, and the ORDINAL is that count: seventy-seven, so the next is the
SEVENTY-EIGHTH.** *The per-item list is in `git`; P27's Retro has the reconciliation, and W112 is
why three published ordinals were short by one.* **An item's RECORD states its own overlap — its own
file, always legal — and only a retro carries the total forward** (v0.26; v0.27).

**An overlap is a shared SUBJECT; the two findings on it need not be the same finding** — *W78's
two readers called one line dangerous and inert, and both were right about its two halves.* **And
a reader can find a defect with NO MUTATION AT ALL**, by constructing a value the corpus does not
contain: *mutation finds what a suite cannot see; construction finds what the CODE cannot see.*

**The cost is roughly double and the counter-evidence is on the record** — *P1's single readers ran
sweeps of 85, 146 and 100 mutations and found a great deal.* What the split buys is **marginal
coverage rather than coverage**, and an author's own sweep substitutes for neither: *W5's author
ran 19 mutations and found 2 survivors; its adequacy reader ran 148 and found 38.*

**Pass 3 - retro.** Once the plan's work items are merged, review the *method*, not the product:

1. **"No change" is an expected verdict.** A retro that always finds three improvements is
   measuring its own output.
2. **A new rule needs two occurrences, in different work items** — or one with a stated argument
   for why it generalizes.
3. **The sharpest finding is a rule that was followed and did not work.** A *broken* rule means
   someone was careless; a **followed** rule that failed anyway means the mechanism is wrong and
   needs replacing, not restating.
4. **A proposed rule states what it replaces.** This document is read in full before every work
   item. Deletions are as legitimate an output as additions.
5. **Name the rung.** For every defect, say which level of section 4 should have caught it — and if
   none would have, that is the finding.
6. **A retro may correct a false claim in the files of the items it reviews, and names which** —
   v0.12, P11. A finished item's file is on nobody's `Owns`, so a false number had nowhere legal to
   be fixed.
7. **A retro appends its refusals to the ledger below, one line each, with the ordinal.**

## 7. Parallel work

1. **Work items are separated by a spec, never by intuition.** If two items agree only by
   convention, they are one item. The flow definition and the run-state shape in `spec/` are what let
   the definition validator and the driver be built by two agents who never see each other's work.
2. **If two CONCURRENT work items would edit the same file, they are one work item.** Merge cost
   exceeds the parallel saving every time. **A serial item pays none of that cost and the rule does
   not bind it** — it declares an **exceptions table** instead: every file it edits outside its
   `Owns` and outside section 1's record step, named, with the reason, before it starts.

   **The declaration is checked, because three items running showed that declaring is not enough.**
   *W5 edited one file it had not listed; W6 declared its table empty and had edited two; and W9 —
   the next item, with W6's warning already written down — undercounted by six. Three consecutive
   items answered "did you edit outside your `Owns`" with "yes, and I did not notice."*
   `git diff --name-only` against the `Owns` block is what settles it, and until that check exists
   **run it by hand before filling in the Record.**

   **An item's `Owns` is written from its PLAN's index row, never from its title** — v0.9, P7, and
   the numbers are the argument: *late exceptions ran five, four, two, zero across that plan's four
   items as each wrote its block closer to the plan's own row.*
3. **Fan out on execution, not on design.** Parallel agents given an under-specified goal produce
   designs that do not compose. Decide, then fan out.
4. **Keep the joint small.** An item's output to another item should be a typed value or a document,
   not a set of assumptions.

Anti-patterns: fanning out before the spec is agreed; accepting an implementer's self-report as
verification; reaching for a real scheduler when a level-2 routing assertion would answer the
question; a quick edit to `spec/` to make a test pass.

## 8. Speed

The loop has to be seconds or the discipline above stops being run.

| | Target | |
|---|---|---|
| Single test file (watch) | < 2 s | one runtime - whichever you are editing in |
| Work-item gate (L0-L3) | < 15 s | **one runtime.** The other two run at the join |
| Plan gate (L0-L6) | < 90 s | **L0-L5 in all three**, L6 per [Q33](questions/q33.md) |
| **Proving the checks can fail** | **no budget has ever been set** | **not a rung**, and this table had no row for it until P11 |

**The first two are MET and always have been; the fourth is what a person waits for.** What made
`npm run gate` 393 s was proving the checks can fail — not a level of section 4, and never
budgeted, because before P8 and P9 it cost approximately nothing. *That, and not an overrun, is
the answer to* nobody decided this.

**Since
[ADR 0070](decisions/0070-the-local-gate-is-the-ladder-and-proving-the-checks-can-fail-belongs-to-ci.md)
the fourth row has an answer rather than a budget: it is not on the local gate at all.**
`npm run gate` is the LADDER (ADR 0039's order); `npm run gate:full` adds the `selftests`, which
were **84%** of the 1571 s a person used to wait for. **Its cost is `S11` and `G4` reading the
MANIFEST** — they see a `gate:full` composing both halves and cannot see whether anything ran it.

**And a per-lane wall measured in one arrangement does not predict the wall in another** — three
derivations here have made that error, one from a lane that EXITED AT ITS CONTROL and still
reported a wall clock. **Neither is reproducible** - the runner sizes its pool in LANES while each
lane spawns a deep process tree, so it over-commits the machine ([Q433](questions/q433.md)). **The
*plan gate* row is UNMEASURED rather than met** ([Q427](questions/q427.md)).

**The three-runtime requirement lands on the plan gate, not on the edit loop**: L0-L5 are pure
logic over fixtures, so the second and third pass find configuration errors rather than logic
errors, and those do not need catching in two seconds. A gate over budget gets a fast subset on
every change and the full version at the join. *A verification step nobody waits for is a
verification step nobody runs.*

---

## The version index

**Which retro produced which version.** Every clause above carries its own version and retro, so
this is a pointer rather than a second copy —
[P27](plans/p27-what-a-register-row-is.md) decision 2: *a cut thing keeps a one-line index entry
and its commit.*

v0.3 P1 · v0.4 P2 · v0.5 P3 · v0.6 P4 · v0.7 P5 · v0.8 P6 · v0.9 P7 · v0.10 P9 · v0.11 P10 ·
v0.12 P11 · v0.13 P12 · v0.14 P13 · v0.15 P14 · v0.16 P15 · v0.17 P16 · v0.18 P17 · v0.19 P18 ·
v0.20 P19 · v0.21 [P20](plans/p20-what-the-runtime-owes-a-consumer.md#retro) ·
v0.22 [P21](plans/p21-what-a-run-time-schema-check-buys-and-what-it-costs.md#retro) ·
v0.23 [P22](plans/p22-what-a-regions-identity-is.md#retro) ·
v0.24 [P23](plans/p23-what-a-run-needs-to-outlive-its-process.md#retro) ·
v0.25 [P24](plans/p24-what-a-node-may-remember-across-a-runs-branches.md#retro) ·
v0.26 [P26](plans/p26-what-a-flow-can-say-without-code.md#retro) ·
v0.27 [P27](plans/p27-what-a-register-row-is.md#retro)

## The refusal ledger

**One line per refused proposal, with the ordinal this document states where it has one** — the
half P27 fact 8 says does the work the arguments did not, because the same proposals came back
with the full argument present. **A retro that refuses one of these appends to its row rather
than restating it.** *The count is of REFUSALS, not of mentions.*

| the proposal | refused | the standing ground |
|---|---|---|
| **A check over `doc/`** — prose held true by a script | **26 times**, P2-P27 | both mechanisms are worse than the problem, and [P27](plans/p27-what-a-register-row-is.md) decision 4 answers it from the other side: **a fact the tree COMPUTES is not written down**. *P27 measured the always-read set deletable to **58 bytes** with `gate` green; the sharp version is the CLOSURE and is [Q489](questions/q489.md)* |
| **An `Owns` pre-declaration rule / `check-owns.mjs`** | **13 times**, P2-P26 | three miscounts were caused by the record-step list being WRONG, and naming the missing file fixed it with no script. It returns on a miscount with the list correct |
| **A ladder LEVEL for the evidence** | 4 times, P11-P14 | answered from the other side by [ADR 0070](decisions/0070-the-local-gate-is-the-ladder-and-proving-the-checks-can-fail-belongs-to-ci.md): not a rung, and not on the local gate |
| **The dated-ceiling HAND-OFF**, and **keeping the harness so the re-run has a subject** | **4 times**, P18-P20, P27 | the ground CHANGED: *the retro catches it in one command* needs a harness, and at P27 none survived — **0 of 28** declared ceilings re-runnable. It stands on the YIELD, **5 catches in 72** and falling (2/11, 2/23, 1/14, 0/24), with the in-item re-run doing the work ([Q486](questions/q486.md)) |
| **A fourth list below `CROSS_ROW_SUBJECTS`** | twice, P13-P14 | three iterations each closed one layer further out ([Q217](questions/q217.md)) |
| **A corpus census pinned as a LITERAL outside its corpus** | twice, P21-P22 | a second number a human writes is not a second floor |
| **A LEVEL for the gate itself**; **a finished item's file having no owner** | once each, P10-P11 | the second was narrowed into pass 3 rule 6 — *the narrower of the two is taken* |
| **A membership over CONTAINERS**; **a harness grading L6 in both runtimes** | once each, P22, P24 | one occurrence, no argument for generality — pass 3 rule 2's bar |

*Each row's full pricing is in that plan's Record. The ordinals are this file's own claims about
itself, re-measured at W115: **three of fact 8's four refusal figures do not reproduce under any
predicate — 22, 18 and 15 against 23, 63 and 14 — and the ordinals do. **Two plan RANGES did
not; P27's retro fixed both.***
