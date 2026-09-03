# P9 — When a check stops checking, what notices?

**Status:** **DECLARED** — 2026-09-03
**Question this plan answers:** *When a check clause stops checking, what notices — and does it
notice for the right reason?*
**Exit artifact:** *one row per check clause — **39** of them — saying what notices when that clause
is made **present but inert**: a **named** probe, an unrelated probe reacting to noise, or
**nothing**. Measured at `76bf5e6` and again after this plan, with the **`check-scheduler` D5 clause
that survives today** fixed, and the gate's own timing on both sides.*
**Reserves:** W28-W31 (**all four used**), Q141-Q150 (**Q141 and Q142 taken by this declaration**), ADR 0034-0035 (**expected to go unused**)

---

## Why this plan, and why now

**[P8](p8-what-can-be-deleted-with-the-gate-green.md) established that `scripts/**` and
`package.json` can be owned, and then left two things it had measured and declined.** Its Record
names both:

> *"`check:markdown:selftest` is **2m31 to 3m14** of a **4m46 to 6m00** gate … **More than half the
> gate is now the gate proving its own checks can fail**, and the ratio is the durable number …
> **Changing what the gate RUNS was declared out of this plan's scope**, so it is recorded rather
> than acted on."*

[Q133](../open-questions.md) is that cost, [Q138](../open-questions.md) is its mechanism, and
[Q132](../open-questions.md) is the coverage hole beside it. **They are one subject and this plan
says so in a sentence**: a self-test's META pass grades a broken check by its **exit code**, so it
cannot tell *the clause I broke was caught* from *something else went wrong* — and because the
verdict is an exit code, the only way to reach it is to re-run the whole probe suite. **The
correctness gap and the cost are the same defect seen from two sides**, which is why fixing one pays
for the other rather than trading against it.

**And P8's retro owes this plan two verdicts on [`doc/workflow.md`](../workflow.md)**, each proposed
on one occurrence with a stated argument and deliberately not adopted — section 6 pass 3 rule 2's
second form:

1. **Rule 8 may need a FIFTH obligation: break the WIRING — what happens when the check is NOT RUN.**
2. **A check written for a defect you have just fixed has no live case, so its probes are the whole
   of its evidence.**

**This plan is chosen partly because it generates evidence for both rather than only reporting on
them.** W29 and W30 each add a `:selftest` entry or a new grading, which is verdict 1's exact shape;
and **every clause W30 probes is a clause with no live defect anywhere in the tree**, which is
verdict 2's, sixteen times over.

### The facts, measured before this plan was written

**Thirteen plans have measured a load-bearing fact before declaring and in all thirteen it changed
what got written.** Fourteenth. **One register row was wrong, one headline number in P8's own retro
was wrong by a factor of nearly two, a hypothesis this plan intended to build on was FALSIFIED before
it reached the page, and the census was CONFIRMED rather than corrected for the first time in four
plans.**

| | what was written | what one command says |
|---|---|---|
| [Q132](../open-questions.md) | *"`check-spec` has no self-test at all: **8 more clauses, 0 probes**"* | **7, not 8.** `C5` has **two** checked-in probes — `scripts/check-markdown-selftest.mjs:386-401`, *a dead link inside `spec/`* and *a dead ANCHOR inside `spec/`* — added by [W25](../work-items/w25-a-link-is-a-link-and-an-anchor-is-an-anchor.md) one item **after** Q132 was written at W24. The row is right about the **file** and wrong about the **count**: `check-spec.mjs` still has no `--self-test`, and C5's probes live in another script |
| [P8's Record](p8-what-can-be-deleted-with-the-gate-green.md) | *"roughly half the gate, either way"* | **88%.** One timed pass over the gate's own 18 entries: **206.3 s of 234.6 s**. P8 compared **one** self-test against the total; there are **five**, and the other four add 76.9 s. **The whole product-facing gate — every check, L0-L5 in three runtimes, both L6 runtimes — is 28 s** |
| **no id** | — | **Two of the five self-tests have NO META pass at all.** `check-docs` (14 probes) and `check-scheduler` (12 probes) assert that the check refuses a broken input and **nothing asserts the probes would notice a broken check**. `check-policies` has META and no SELF. So the 39 clauses split **16 / 10 / 13**, not into probed and unprobed |
| **no id** | — | **`check-scheduler`'s `D5` empty-parse clause can be made inert with all 12 probes green.** The one live defect this declaration step found; **raised as [Q141](../open-questions.md)** and owned by W29. Four other clause-level mutations of the two ungraded checks were **caught**, so the yield is **1 of 5** and is stated as measured rather than assumed |
| **a hypothesis, killed** | *"three of the five self-tests still carry the `ALL_CHECKS` allowlist W24 removed, so a probe can trip a check the harness cannot see"* | **FALSE, and measured before it was written down.** The allowlist is there in `check-docs`, `check-scheduler` and `check-policies` — but renaming a reported id to one outside each list was **caught in all three**, because every id those checks report is declared by some probe and the probe then sees an empty set. W24's hole needed **undeclared** ids in the list and those three have **zero**. [Q43](../open-questions.md)'s class, refused at the declaration step |
| the register's census | *"99 questions - 64 open, 2 deferred, 33 resolved"* | **Confirmed.** Re-derived by a parser that aborts on any row it cannot classify: 127 rows, 99 distinct ids, **64 / 2 / 33**, 28 ids in both tables. **It aborted three times on real hazards first** — a status cell carrying prose after its value, a row whose FIRST line does not close with a pipe, and a row whose status cell sits on a line that does not START with one. The last two are the same row and losing it silently merged **Q87 into Q86 and dropped a whole question** |

**And a seventh fact arrived last, because this declaration's own four documents turned the gate
RED.** `scripts/check-markdown.mjs`'s header argues that its `M3`/`M4`/`M5` floors are *"a MINIMUM
nobody is obliged to raise, which is what keeps them out of [Q102](../open-questions.md)'s shape …
adding a document here can only move these numbers up and away."* **That is right about the CHECK and
false about the PROBES**, and only the probes make the check falsifiable: `M3` and `M4` can be fired
**only** by the two `removes` probes, which cut directories out of a copy of the tree, so each floor
must sit **above the probe's fixture and below the whole tree**. Adding one plan and three work items
took *doc/decisions removed* from **46 files to 50** against a floor of `< 50`, and `npm run gate`
exited **1** with `wanted [M1,M3], got [M1]` and `wanted [M1,M3,M4], got [M1,M3]`.

**So it IS [Q102](../open-questions.md)'s shape, and worse** — a two-sided window rather than a
one-sided ratchet — **and the mitigation is the direction, which is W24's own finding about `S12`
reproducing a third time**: `RUN_FLOOR` went stale *silently, toward weakness*; this failed *loudly,
in the gate*, naming both probes and both files. Retuned to **56 / 1350 / 60** from a measurement
(whole tree 66/1746/86; the two fixtures 50/1548/86 and 40/1217/86), which restores green and **does
not remove the ratchet**. **[Q142](../open-questions.md), owned by W28**, which already owns both
broken probes. *(And retuning it broke two more things: the META entries that disable those floors are
pinned to the literals `if (r.files < 50)` and `if (r.links < 1200)`, so both came back **"the
mutation matched nothing"** — rule 7 (b) firing correctly rather than passing, and W25's
comment-quoting class in a new dress: **a mutation pinned to a magic number becomes unmutatable the
moment the number is right to change.**)*

**And then `M1` got its first live case, from this same declaration, which is direct evidence on the
second verdict this plan owes.** [W25](../work-items/w25-a-link-is-a-link-and-an-anchor-is-an-anchor.md)
records that the file half of `check-markdown` **ships green** — 0 dead links, so `M1` would pass on
an empty implementation, and its probes were the whole of its evidence. Writing this plan into both
`CLAUDE.md` and `doc/README.md` reused the root document's paths inside `doc/`, and `M1` reported
***"doc/README.md links to doc/open-questions.md, which does not exist"*** — **twice**. That is
precisely W25's probe *"a link one directory too shallow — AGENTS.md's original defect shape"*, in
the wild, **one plan after the probe was written for it**. P8's retro proposed *a check written for a
defect you have just fixed has no live case, so its probes are the whole of its evidence*; **the
qualification this adds is that the corpus catches up, and it took one plan.**

**A note on how it was found, because it is this plan's own subject in miniature.** The first gate run
after the plan file alone exited **0**; the failure appeared only after the three work-item
declarations. **And the background task that ran it reported "exit code 0"** — because the shell's
last command was a `tail`, not `npm`. The exit code was read from the log's own `GATE EXIT=` line
instead, which is `CLAUDE.md`'s *"do not read the gate through a grep"* one layer out: **the thing
reporting the verdict was not the thing that produced it.**

**The malformed rows are exactly the three that are named and exactly three**: `Q119` and `Q71` split
on unescaped pipes ([Q131](../open-questions.md)); `Q87` spans five lines with two blank lines inside
it and its status and owner sit on a line that does not begin with `|`
([Q135](../open-questions.md)). **All three stay unfixed on P8's reasoning** — whoever builds that
check should have all three shapes to fire on — and **this plan does not build it**.

### The measurement that shapes the plan

**Every META grading in this repository is `r.status !== 0`.** Run against each of the 56
code-targeted entries in `check-source` and `check-markdown`, capturing which probe the child stops
at:

| | `check-source` | `check-markdown` |
|---|---|---|
| META entries graded | 20 | 36 *(+1 targeting `check-spec.mjs`)* |
| graded **noticed** | 20 | 36 |
| **distinct probes that ever do the noticing** | **14 of 24** | **31 of 37** |
| the noticing probe declared a non-empty set and got a **strictly larger** one | **1** | **6** |
| cost of the pass | 12 s | 2 m 50 s |

**Three things follow, and the second is the one nobody had said.**

1. **Which probe notices is an artefact of list ORDER.** The child breaks at the first probe the
   mutant disturbs, so the probe credited with the catch is the earliest one in `PROBES` that reacts
   — not the one written for the clause. In `check-markdown`, five of the six slug-rule mutations are
   credited to *a link to a file that does not exist*, while the two probes written for the slug rule
   sit further down the list and never run.
2. **In 7 of 56 the mutant was noticed because it became NOISY, not because it was detected.** The
   crediting probe declared `[M1]` and reported `[M1,M2]`, or `[S12]` and reported `[S12,S13]` — the
   broken check produced an **extra, unrelated** failure across the corpus. An exit code cannot tell
   that from a detection, which is exactly [Q138](../open-questions.md), and it is the same shape as
   W24's conformity reader's finding that an entry scored *noticed* because the mutant **crashed**.
3. **The cost is entirely this.** A bare `check-markdown` run is **220 ms**; the META pass re-runs up
   to 37 of them per entry, 37 times. Naming the probe reduces each child to **one** probe. The same
   arithmetic is what makes W28 come first: `check-docs` is **4.4 s** a run, so ten META entries in
   today's form would cost **~450 s** and in the named form **~46 s**.

### What the ladder does not cover, again

**None of it is reachable from any rung of [`doc/workflow.md`](../workflow.md) section 4.** L0-L6 are
commands over the product; every defect here is in the machinery that grades the checks. That is P1's
central measurement — *five defect classes have no rung* — one level further in than P8 took it: P8
checked the **wiring that runs the checks**, and this plan checks **the negative tests that are
supposed to prove the checks can fail**.

## The census this plan starts from

**Measured at `76bf5e6`, `npm run gate` green at exit 0**, Node 24.20.0.

| self-test | probes | META | SELF | measured |
|---|---|---|---|---|
| `check-docs` | 14 | **0** | **0** | 45.3 s |
| `check-scheduler` | 12 | **0** | **0** | 2.0 s |
| `check-policies` | 13 | 5 | **0** | 6.5 s |
| `check-source` | 24 | 20 | 3 | 23.1 s |
| `check-markdown` | 37 | 37 | 3 | 129.4 s |
| | **100** | **62** | **6** | **206.3 s of 234.6 s — 88%** |

**And the 39 clauses split three ways, which is why this plan has three items:**

| | count | which |
|---|---|---|
| a probe **and** a grading | **13** | `C5`, `S8`, `S11`-`S13`, `M1`-`M5`, `P1`-`P3` |
| a probe that **nothing grades** | **10** | `D1`-`D5`, `X1`-`X5` |
| **no probe at all** | **16** | `C1`-`C4`, `C6`-`C8` (7) and `S1`-`S7`, `S9`, `S10` (9) |

**A caution about the absolutes, because this repository has been bitten by it twice.** The gate time
is not a constant — W25 quoted one run as a fact in four documents and had to correct it, and **this
run's `check:markdown:selftest` came in at 2m09, below the 2m31-3m14 band P8 recorded**, with the
total correspondingly below its 4m46-6m00 band. **The ratio is what to carry, and the ratio is what
moved**: not because the machine changed, but because P8's retro compared one self-test to the total
and this compares five.

## Scope

**In**

1. **A META entry names the probe it must break**, and the grading asserts **that probe** went from
   caught to uncaught — set equality on the named probe's verdict, not a non-zero exit. Rule 7 (c)'s
   argument, applied one layer out from the probes.
2. **The two self-tests that grade nothing get a META pass**, in the form (1) establishes, and
   `check-scheduler`'s `D5` survivor is closed.
3. **The clauses nothing probes get probes** — `check-spec`'s first self-test, and the two
   `check-source` pattern lists that no second mechanism guards.
4. **The cost is measured on both sides of every item** and reported in the exit artifact, because
   the whole argument for doing (1) first is arithmetic.

**Out** — named rather than left implicit, with where it goes instead

- **Any change to what the gate RUNS.** Same declaration P8 made, and for the same reason: a `verify`
  chain split out of `gate` is a policy decision about how this repository is worked, and
  [Q133](../open-questions.md) records that *"nothing in `doc/` says whether anyone runs `npm run
  gate` on every change or only at the join"*. **This plan makes the cost go away rather than
  deciding the policy**, and if the measured saving is not enough, Q133 stays open **with a better
  number** and the decision is a later plan's. **If an item finds itself editing the `gate` chain's
  membership, its scope has grown.**
- **Seven of the sixteen unprobed clauses** — `S1`, `S2`, `S3`, `S5`, `S6`, `S9`, `S10`. The cap is
  stated because a silent cap reads as coverage: see decision 3.
- **[Q131](../open-questions.md), [Q135](../open-questions.md) and [Q123](../open-questions.md) — the
  register's own bytes.** P8 declared W26 for these and dropped it on a scope call; **this plan does
  not pick it up**, for the same reason P8 gave of itself: *when a check stops checking, what
  notices* is about gradings, and *a tracked text file's bytes* is about bytes. The three malformed
  rows are re-measured above and **stay unfixed on purpose** so the check that would catch them has
  live defects. All three return to the register with no owner.
- **[Q134](../open-questions.md)** — whether `S11`'s membership clause should be retired now that
  `S12` subsumes it. It is a question about **one** check's clause boundaries, not about what a
  self-test asserts, and retiring a clause interacts with section 3's no-renumbering rule. Named so
  this plan is not read as closing it.
- **[Q136](../open-questions.md) and [Q137](../open-questions.md)** — the markdown shapes
  `check-markdown` cannot read, and `C5`'s missing `M3`-style floor. **Q137 is genuinely close to
  W30** — its own row says *"`check-spec`'s `C1`-`C8` have no self-test at all, so a new clause there
  ships unprobed unless that gap is closed first"*, and W30 closes exactly that gap. **It is still
  out**: adding a floor to `C5` is a change to `check-spec`'s *behaviour*, and W30's subject is its
  *negative tests*. W30 will leave Q137 buildable rather than build it, and say so.
- **[Q100](../open-questions.md), [Q101](../open-questions.md), [Q104](../open-questions.md)** — what
  `check-docs`' clauses check less than their names claim. W29 gives `X1`-`X5` a grading; it does not
  change what they check.
- **A check over `doc/` *claims*.** Refused seven times; not reopened.

## Decisions taken before fan-out

**Four, all measured rather than argued.** The items are serial, so this section is short by design —
[`doc/workflow.md`](../workflow.md) section 7 rule 3 binds hardest on parallel work.

1. **A META entry declares the probe it must break, by NAME, and the grading is set equality on that
   probe's verdict.** Measured above: an exit code credits the earliest probe in list order that the
   mutant disturbs, which in 7 of 56 gradings is a probe reacting to unrelated noise. **The failure
   mode this introduces is deliberate and is the right one**: an entry whose named probe no longer
   exists **aborts** rather than passing, which is rule 7 (b) one layer out and is
   [Q138](../open-questions.md)'s own *"against"* argument turned into an argument for.

   **And it predicts its own findings.** Entries whose named probe does not in fact fail will go red
   on the day the contract lands. From the measurement, at least **seven** are candidates — six in
   `check-markdown` and one in `check-source`. **Every one is either a hole in the probes or a
   mislabelled entry**, and W28's job is to say which, one by one, rather than to relabel them to
   whatever fails.

2. **W28 goes first, and the argument is arithmetic rather than taste.** A `check-docs` probe costs
   **4.4 s**; ten META entries for `X1`-`X5` cost **~450 s** under today's contract and **~46 s**
   under W28's. Running W29 first would put seven and a half minutes into the gate and then take it
   back out. This is P8's own ordering argument — *"running W24 first means the widened list is what
   W25's entry lands in"* — with a number attached.

3. **W30 takes 9 of the 16 unprobed clauses and the other 7 are named.** `check-spec`'s `C1`-`C4`,
   `C6`, `C7`, `C8`, plus `check-source`'s **`S4`** (*no syntax Node cannot type-strip*) and **`S7`**
   (*no published file imports the scheduler*). [Q132](../open-questions.md)'s own argument, checked
   and adopted: `S1`, `S2` and `S3` are guarded a second way by `typecheck:deno` and
   `typecheck:browser`; `S5`, `S6`, `S9` and `S10` are publish-set and reach bookkeeping with a second
   route; **`S4` and `S7` are the two the ladder has no rung for at all.** `S7` is
   [ADR 0013](../decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)
   rule 1's only enforcement and `CLAUDE.md` calls it *"one autocomplete away from being broken"*.
   **The seven left out are written into the exit artifact as *no probe*, not omitted from it.**

4. **No `.gitattributes`, no register repair, no change to any check's behaviour.** This plan touches
   what **grades** the checks. The one exception is W29 closing the `D5` survivor, which is a
   reporting clause going from unreachable to reachable rather than a new rule.

**Nothing here is architectural, and P9 expects to take NO ADR.** 0034 and 0035 are reserved and
should be reported skipped. The one candidate is *should the gate run its own negative tests* — and
**that is declared out of scope above**, so the trade-off is not taken and no decision is owed.
**If any item finds itself wanting an ADR, that is a signal its scope grew.**

## Work items

**Three, serial, and separated by the three ways a clause can go unnoticed** —
[`doc/workflow.md`](../workflow.md) section 7 rule 1's test rather than intuition. W28 fixes the
gradings that exist; W29 gives a grading to the ten clauses that have a probe and none; W30 gives a
probe to the nine of sixteen that have neither. They share `package.json` and the two `check-source`
files, and they are **serial**, so rule 2 does not bind — each row below names every path its item
edits as a deliverable.

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| [**W28**](../work-items/w28-a-grading-names-the-probe-it-breaks.md) | **A grading names the probe it breaks** — the META contract in the three self-tests that have one | `scripts/check-source-selftest.mjs` (W24), `scripts/check-markdown-selftest.mjs` (W25), `scripts/check-policies-selftest.mjs` (W16) | nothing | **L0**, own coverage at L0; **L1-L6 as regression and must not move**; then two readers |
| [**W29**](../work-items/w29-the-two-self-tests-that-grade-nothing.md) | **The two self-tests that grade nothing** — a META pass for `check-docs` and `check-scheduler`, and [Q141](../open-questions.md) closed | `scripts/check-docs-selftest.mjs` (W9), `scripts/check-scheduler-selftest.mjs` (W5), `scripts/check-scheduler.mjs` (W5), `scripts/check-docs.mjs` (W9) | W28 | **L0**, own coverage at L0; L1-L6 as regression; then two readers |
| [**W30**](../work-items/w30-the-clauses-nothing-probes.md) | **The clauses nothing probes** — `check-spec`'s first self-test, and `S4` and `S7` | `scripts/check-spec.mjs` (W1), **`scripts/check-spec-selftest.mjs`** (new), `scripts/check-source.mjs` (W24), `scripts/check-source-selftest.mjs` (W28), **`package.json`** (P8) | W28 | **L0**, own coverage at L0; L1-L6 as regression; then two readers |
| [**W31**](../work-items/w31-the-self-list-check-policies-never-had.md) — **declared late, on a measurement** | **The `SELF` list `check-policies` never had** | `scripts/check-policies-selftest.mjs` (W16, then W28) | W28 | **L0**, own coverage at L0; L1-L6 as regression; then two readers |

**Why three rather than two, and then four.** P8's *"two items is the floor, not a shortcut"* was about not dropping
below its own justification. Here the count comes from the census: **16 / 10 / 13** are three
different defects with three different fixes, and merging W29 into W28 would put a contract change
and five new gradings in one item whose gate cannot separate them. **W30 is not the droppable one** —
its subject is the plan's question, which is precisely the test P8's retro applied to W26 and found
W26 failing.

**Where W30 will hit the WIRING obligation, named in advance so the verdict is not written from
hindsight.** It adds `check:spec:selftest` to `package.json` — the fourth entry of the shape both of
W24's readers found broken, and the one `S11`'s `:selftest` clause now guards. **The prediction is
that `S11` catches it and the obligation is therefore about a hole that already has a check**, which
would argue *against* a fifth obligation. **If instead W30 ships a wiring hole `S11` does not see,
that is the second occurrence and the obligation is earned.** Either way the retro has a measurement
rather than an argument.

**And a note on `Owns` and where these blocks come from.**
[`doc/workflow.md`](../workflow.md) section 7 rule 2, as amended by P7's retro: **an item's `Owns` is
written from this table's row, never from its title.** The numbers behind that sentence are five,
four, two, zero. Each row above names the record-step files only where section 1 rule 5 does not
already grant them, and `package.json` explicitly where an item needs it.

~~**A fourth item is NOT declared, and the reason is recorded rather than left implicit.** The obvious
candidate is a `SELF` pass for `check-docs`, `check-scheduler` and `check-policies`, which have none
— the list-bound guard rule 8's fourth obligation asks for. **It is out because W28's contract change
makes the whole question cheaper to answer later**, and because `check-source-selftest.mjs`'s own
header records the ceiling it runs into: *nothing inside a self-grading file can assert that the file
grades*, and each new outer list moves the hole rather than closing it. **W31 is reserved and
expected to go unused**; if W28 finds the `SELF` gap is what blocks its own grading, that is the
signal to take it.~~

**W31 IS DECLARED, on a measurement, and the trigger above is what fired.**
[W28](../work-items/w28-a-grading-names-the-probe-it-breaks.md)'s adequacy reader put each of the
three verdicts W28 ships into `check-policies-selftest.mjs` under an `if (false)` and ran the file:
**all three cost 0**, because that file has no `SELF` list and nothing bounds it from outside. The
other two self-tests each gained four entries that make those verdicts fire; **the third copy of the
contract is inert.** [**W31**](../work-items/w31-the-self-list-check-policies-never-had.md) takes it,
narrowed to that one file — `check-docs` and `check-scheduler` are still out, because
[W29](../work-items/w29-the-two-self-tests-that-grade-nothing.md) is what gives them a `META` pass and
a `SELF` list over a pass that does not exist yet would bound nothing.

**The mechanism is what should be judged here, not the count.** The trigger was written into W28's
`Out` list **before W28 started**, in the words the finding then matched, so growing the plan was a
decision against a stated criterion rather than against a feeling. **P8's retro asked the opposite
question of W26** — an item declared and then dropped — and named the declaration step as where that
call belongs. This is the same step in the other direction, and the two together are what that step is
for.

**And the ceiling argument above survives unchanged**: `check-policies-selftest.mjs`'s own header
records that nothing inside a self-grading file can assert that the file grades, and W24 re-measured
it. A `SELF` list does not close that; it moves the hole one list further out, which is worth doing
because the three guards W28 shipped are currently inside the reach it moves.

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q138](../open-questions.md) | a META pass asserts that SOME probe notices, never WHICH | **W28.** The contract change is this row's own proposed fix, with the count of gradings it will turn red predicted above |
| [Q133](../open-questions.md) | the gate spends most of its time proving its own checks can fail | **W28, and answered rather than decided.** Its number is corrected here from *"roughly half"* to **88%**; whether the saving is enough is measured at W28's close and **the policy decision stays out of scope** |
| [Q132](../open-questions.md) | 16 of 39 clauses have no probe | **W30 — partially.** 9 of the 16, with the other 7 named in decision 3 and carried in the exit artifact as *no probe* |
| [Q141](../open-questions.md) | `check-scheduler`'s `D5` empty-parse clause is inert for 0 failures | **W29.** Raised by this declaration step; the one live defect it found |
| [Q137](../open-questions.md) | `C5` did not inherit `M3`, so `spec/`'s link check can pass vacuously | **no owner, and W30 makes it buildable.** Its stated blocker — *"`check-spec` has no self-test, so a new clause ships unprobed"* — is what W30 removes |
| [Q142](../open-questions.md) | the markdown floors are a two-sided window and ordinary work closes it | **W28.** Raised by this declaration step, which tripped it with its own four documents. The floors are retuned and green; what W28 owes it is a verdict and a working pair of probes |
| [Q134](../open-questions.md) | `S12` subsumes `S11`'s membership half | **no owner.** Named so this plan is not read as closing it |
| [Q131](../open-questions.md) [Q135](../open-questions.md) [Q123](../open-questions.md) | the register's own bytes | **no owner** — W26 was dropped by P8 and this plan does not pick it up. All three re-measured here and deliberately unfixed |
| [Q100](../open-questions.md) [Q101](../open-questions.md) [Q104](../open-questions.md) [Q136](../open-questions.md) | what a check checks, as against what its name claims | **no owner.** This plan changes what **grades** the checks, not what they check |
| [Q102](../open-questions.md) | a ratchet in nobody's `Owns` | **answered by P8 and reproducing.** W30 edits `scripts/check-source.mjs`, which `S12` obliges whenever `package.json`'s chain changes; its `Owns` row above names that file for exactly this reason |
| [Q98](../open-questions.md) | the runner counts `test()` cases, not assertions | **no owner.** Named because every Record this plan writes quotes a count, and the noun stays *cases* |

## A note on ids

**P9 starts at W28 and uses all four of W28-W31.** W31 was reserved as unlikely and is declared late, on W28's adequacy reader's measurement — see the work-items section. **W26 and W27 are skipped and never reissued** — P8
declared W26 in its table and dropped it before it started, and W27 went unused. **W31 is reserved and
expected to go unused**; see the work-items section.

**W10 stays HELD and W11 stays SKIPPED for the SEVENTH plan running.** W10 was
`scripts/check-owns.mjs`; P4's retro retired it as a proposal and P7's retro kept it retired on its
strongest evidence yet — a sentence took late `Owns` exceptions to zero without a script. **This plan
owning `scripts/**` does not change that**, exactly as it did not for P8: the reason W10 is held is
that the check is not worth building, not that nobody could own it.

**Q ids resume at Q141.** P8 reserved Q131-Q140 and used Q131-Q138, so **Q139 and Q140 are skipped and
never reissued**, as are **Q125** and **Q128-Q130** before them. **Q141 and Q142 are both taken by
this declaration** — Q141 for `check-scheduler`'s `D5` survivor, and Q142 for the markdown floors this
declaration's own four documents tripped. **Q143-Q150 are reserved for the three items**, which is why
W28's `Reserves:` line reads Q143-Q145 rather than Q142-Q145.

**ADR ids resume at 0034.** P8 reserved 0032-0033 and used neither, so **both are skipped**. **0026
stays held for [Q97](../open-questions.md)**, for the **fourth** plan running — P5 reserved it for the
`stuck` conflation and deliberately did not take it, and neither P7, P8 nor this plan takes it.
**0028 and 0031 stay skipped.**

## What this declaration edited, and the one exception

**Eight files.** `doc/workflow.md` section 1 rule 5 grants a declaration the plan's own file,
`doc/README.md`, `CLAUDE.md`, `README.md`, `doc/open-questions.md` and `doc/decisions/**`; the three
work-item files are this plan's own. **One edit is outside all of that and is declared here rather
than left to a reader's `git show --stat`:**

| file | why |
|---|---|
| [P8's Record](p8-what-can-be-deleted-with-the-gate-green.md) | **a correction in place.** Its *"roughly half the gate, either way"* is wrong by a factor of nearly two, and the correction is the paragraph beside it rather than a replacement — P7's practice, and W22's and W25's precedent for correcting a prior plan's text from a measurement. **Not deleted**: the absolutes it records are right and its *"absolutes are not constants"* sentence is reinforced by this measurement, not undermined |
| `scripts/check-markdown.mjs` and `scripts/check-markdown-selftest.mjs` | **a repair the declaration was OBLIGED to make, because its own four documents turned the gate red.** [Q142](../open-questions.md): the floors retuned to 56 / 1350 / 60 from a measurement, the falsified paragraph corrected in place rather than deleted, the two probes' stale measured comments updated, and the two META entries re-anchored to the new literals. **This is the exception that proves Q142's own point** — an item that adds documents is obliged to edit a file it does not own — and it is declared here rather than discovered by a reader running `git show --stat` |

**And the same claim was corrected in three other places it had been copied to** — `CLAUDE.md`,
`doc/README.md` and [Q133](../open-questions.md) — all four within the record step's grant except the
first. **That it lived in four documents is the point**: it is `doc/`'s standing failure in a shape
none of the seven refusals has named, because the number was **right** and only the comparison was
wrong.

## Record

*Filled in when the plan's items are merged and its retro is run.*

**What this plan owes `doc/workflow.md`.** Two verdicts, both from P8's retro, both to be reached on
this plan's own evidence rather than restated:

1. **A fifth obligation for rule 8 — break the WIRING.** The prediction, written before W30 starts, is
   in the work-items section: `S11` already guards the shape, so the likely verdict is *the hole has a
   check and the obligation is not earned*. A second occurrence that `S11` does not see would reverse
   it.
2. **A check written for a defect you have just fixed has no live case.** W30 is sixteen instances of
   exactly that — nine taken, seven named — and W29's `D5` is the counter-case: a check written for a
   defect that **is** live. **The plan therefore has both halves**, which is what P8's single item
   could not supply. **And a third data point arrived before any item started**: `M1`, which shipped
   green with no live defect at all, caught a real dead link written by this declaration — the exact
   shape of the probe W25 constructed for it, one plan later. **The corpus catches up**, and how fast
   is the measurement the verdict needs.
