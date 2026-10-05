# P9 — When a check stops checking, what notices?

**Status:** **COMPLETE and RETRO’D** — 2026-09-06
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

[Q133](../questions/q133.md) is that cost, [Q138](../questions/q138.md) is its mechanism, and
[Q132](../questions/q132.md) is the coverage hole beside it. **They are one subject and this plan
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
| [Q132](../questions/q132.md) | *"`check-spec` has no self-test at all: **8 more clauses, 0 probes**"* | **7, not 8.** `C5` has **two** checked-in probes — `scripts/check-markdown-selftest.mjs:386-401`, *a dead link inside `spec/`* and *a dead ANCHOR inside `spec/`* — added by [W25](../work-items/w25-a-link-is-a-link-and-an-anchor-is-an-anchor.md) one item **after** Q132 was written at W24. The row is right about the **file** and wrong about the **count**: `check-spec.mjs` still has no `--self-test`, and C5's probes live in another script |
| [P8's Record](p8-what-can-be-deleted-with-the-gate-green.md) | *"roughly half the gate, either way"* | **88%.** One timed pass over the gate's own 18 entries: **206.3 s of 234.6 s**. P8 compared **one** self-test against the total; there are **five**, and the other four add 76.9 s. **The whole product-facing gate — every check, L0-L5 in three runtimes, both L6 runtimes — is 28 s** |
| **no id** | — | **Two of the five self-tests have NO META pass at all.** `check-docs` (14 probes) and `check-scheduler` (12 probes) assert that the check refuses a broken input and **nothing asserts the probes would notice a broken check**. `check-policies` has META and no SELF. So the 39 clauses split **16 / 10 / 13**, not into probed and unprobed |
| **no id** | — | **`check-scheduler`'s `D5` empty-parse clause can be made inert with all 12 probes green.** The one live defect this declaration step found; **raised as [Q141](../questions/q141.md)** and owned by W29. Four other clause-level mutations of the two ungraded checks were **caught**, so the yield is **1 of 5** and is stated as measured rather than assumed |
| **a hypothesis, killed** | *"three of the five self-tests still carry the `ALL_CHECKS` allowlist W24 removed, so a probe can trip a check the harness cannot see"* | **FALSE, and measured before it was written down.** The allowlist is there in `check-docs`, `check-scheduler` and `check-policies` — but renaming a reported id to one outside each list was **caught in all three**, because every id those checks report is declared by some probe and the probe then sees an empty set. W24's hole needed **undeclared** ids in the list and those three have **zero**. [Q43](../questions/q43.md)'s class, refused at the declaration step |
| the register's census | *"99 questions - 64 open, 2 deferred, 33 resolved"* | **Confirmed.** Re-derived by a parser that aborts on any row it cannot classify: 127 rows, 99 distinct ids, **64 / 2 / 33**, 28 ids in both tables. **It aborted three times on real hazards first** — a status cell carrying prose after its value, a row whose FIRST line does not close with a pipe, and a row whose status cell sits on a line that does not START with one. The last two are the same row and losing it silently merged **Q87 into Q86 and dropped a whole question** |

**And a seventh fact arrived last, because this declaration's own four documents turned the gate
RED.** `scripts/check-markdown.mjs`'s header argues that its `M3`/`M4`/`M5` floors are *"a MINIMUM
nobody is obliged to raise, which is what keeps them out of [Q102](../questions/q102.md)'s shape …
adding a document here can only move these numbers up and away."* **That is right about the CHECK and
false about the PROBES**, and only the probes make the check falsifiable: `M3` and `M4` can be fired
**only** by the two `removes` probes, which cut directories out of a copy of the tree, so each floor
must sit **above the probe's fixture and below the whole tree**. Adding one plan and three work items
took *doc/decisions removed* from **46 files to 50** against a floor of `< 50`, and `npm run gate`
exited **1** with `wanted [M1,M3], got [M1]` and `wanted [M1,M3,M4], got [M1,M3]`.

**So it IS [Q102](../questions/q102.md)'s shape, and worse** — a two-sided window rather than a
one-sided ratchet — **and the mitigation is the direction, which is W24's own finding about `S12`
reproducing a third time**: `RUN_FLOOR` went stale *silently, toward weakness*; this failed *loudly,
in the gate*, naming both probes and both files. Retuned to **56 / 1350 / 60** from a measurement
(whole tree 66/1746/86; the two fixtures 50/1548/86 and 40/1217/86), which restores green and **does
not remove the ratchet**. **[Q142](../questions/q142.md), owned by W28**, which already owns both
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
on unescaped pipes ([Q131](../questions/q131.md)); `Q87` spans five lines with two blank lines inside
it and its status and owner sit on a line that does not begin with `|`
([Q135](../questions/q135.md)). **All three stay unfixed on P8's reasoning** — whoever builds that
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
   that from a detection, which is exactly [Q138](../questions/q138.md), and it is the same shape as
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
  [Q133](../questions/q133.md) records that *"nothing in `doc/` says whether anyone runs `npm run
  gate` on every change or only at the join"*. **This plan makes the cost go away rather than
  deciding the policy**, and if the measured saving is not enough, Q133 stays open **with a better
  number** and the decision is a later plan's. **If an item finds itself editing the `gate` chain's
  membership, its scope has grown.**
- **Seven of the sixteen unprobed clauses** — `S1`, `S2`, `S3`, `S5`, `S6`, `S9`, `S10`. The cap is
  stated because a silent cap reads as coverage: see decision 3.
- **[Q131](../questions/q131.md), [Q135](../questions/q135.md) and [Q123](../questions/q123.md) — the
  register's own bytes.** P8 declared W26 for these and dropped it on a scope call; **this plan does
  not pick it up**, for the same reason P8 gave of itself: *when a check stops checking, what
  notices* is about gradings, and *a tracked text file's bytes* is about bytes. The three malformed
  rows are re-measured above and **stay unfixed on purpose** so the check that would catch them has
  live defects. All three return to the register with no owner.
- **[Q134](../questions/q134.md)** — whether `S11`'s membership clause should be retired now that
  `S12` subsumes it. It is a question about **one** check's clause boundaries, not about what a
  self-test asserts, and retiring a clause interacts with section 3's no-renumbering rule. Named so
  this plan is not read as closing it.
- **[Q136](../questions/q136.md) and [Q137](../questions/q137.md)** — the markdown shapes
  `check-markdown` cannot read, and `C5`'s missing `M3`-style floor. **Q137 is genuinely close to
  W30** — its own row says *"`check-spec`'s `C1`-`C8` have no self-test at all, so a new clause there
  ships unprobed unless that gap is closed first"*, and W30 closes exactly that gap. **It is still
  out**: adding a floor to `C5` is a change to `check-spec`'s *behaviour*, and W30's subject is its
  *negative tests*. W30 will leave Q137 buildable rather than build it, and say so.
- **[Q100](../questions/q100.md), [Q101](../questions/q101.md), [Q104](../questions/q104.md)** — what
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
   [Q138](../questions/q138.md)'s own *"against"* argument turned into an argument for.

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
   (*no published file imports the scheduler*). [Q132](../questions/q132.md)'s own argument, checked
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
| [**W29**](../work-items/w29-the-two-self-tests-that-grade-nothing.md) | **The two self-tests that grade nothing** — a META pass for `check-docs` and `check-scheduler`, and [Q141](../questions/q141.md) closed | `scripts/check-docs-selftest.mjs` (W9), `scripts/check-scheduler-selftest.mjs` (W5), `scripts/check-scheduler.mjs` (W5), `scripts/check-docs.mjs` (W9) | W28 | **L0**, own coverage at L0; L1-L6 as regression; then two readers |
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
| [Q138](../questions/q138.md) | a META pass asserts that SOME probe notices, never WHICH | **W28.** The contract change is this row's own proposed fix, with the count of gradings it will turn red predicted above |
| [Q133](../questions/q133.md) | the gate spends most of its time proving its own checks can fail | **W28, and answered rather than decided.** Its number is corrected here from *"roughly half"* to **88%**; whether the saving is enough is measured at W28's close and **the policy decision stays out of scope** |
| [Q132](../questions/q132.md) | 16 of 39 clauses have no probe | **W30 — partially.** 9 of the 16, with the other 7 named in decision 3 and carried in the exit artifact as *no probe* |
| [Q141](../questions/q141.md) | `check-scheduler`'s `D5` empty-parse clause is inert for 0 failures | **W29.** Raised by this declaration step; the one live defect it found |
| [Q137](../questions/q137.md) | `C5` did not inherit `M3`, so `spec/`'s link check can pass vacuously | **no owner, and W30 makes it buildable.** Its stated blocker — *"`check-spec` has no self-test, so a new clause ships unprobed"* — is what W30 removes |
| [Q142](../questions/q142.md) | the markdown floors are a two-sided window and ordinary work closes it | **W28.** Raised by this declaration step, which tripped it with its own four documents. The floors are retuned and green; what W28 owes it is a verdict and a working pair of probes |
| [Q134](../questions/q134.md) | `S12` subsumes `S11`'s membership half | **no owner.** Named so this plan is not read as closing it |
| [Q131](../questions/q131.md) [Q135](../questions/q135.md) [Q123](../questions/q123.md) | the register's own bytes | **no owner** — W26 was dropped by P8 and this plan does not pick it up. All three re-measured here and deliberately unfixed |
| [Q100](../questions/q100.md) [Q101](../questions/q101.md) [Q104](../questions/q104.md) [Q136](../questions/q136.md) | what a check checks, as against what its name claims | **no owner.** This plan changes what **grades** the checks, not what they check |
| [Q102](../questions/q102.md) | a ratchet in nobody's `Owns` | **answered by P8 and reproducing.** W30 edits `scripts/check-source.mjs`, which `S12` obliges whenever `package.json`'s chain changes; its `Owns` row above names that file for exactly this reason |
| [Q98](../questions/q98.md) | the runner counts `test()` cases, not assertions | **no owner.** Named because every Record this plan writes quotes a count, and the noun stays *cases* |

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
stays held for [Q97](../questions/q97.md)**, for the **fourth** plan running — P5 reserved it for the
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
| `scripts/check-markdown.mjs` and `scripts/check-markdown-selftest.mjs` | **a repair the declaration was OBLIGED to make, because its own four documents turned the gate red.** [Q142](../questions/q142.md): the floors retuned to 56 / 1350 / 60 from a measurement, the falsified paragraph corrected in place rather than deleted, the two probes' stale measured comments updated, and the two META entries re-anchored to the new literals. **This is the exception that proves Q142's own point** — an item that adds documents is obliged to edit a file it does not own — and it is declared here rather than discovered by a reader running `git show --stat` |

**And the same claim was corrected in three other places it had been copied to** — `CLAUDE.md`,
`doc/README.md` and [Q133](../questions/q133.md) — all four within the record step's grant except the
first. **That it lived in four documents is the point**: it is `doc/`'s standing failure in a shape
none of the seven refusals has named, because the number was **right** and only the comparison was
wrong.

## Record

*Filled in when the plan's items are merged and its retro is run.*

**Progress, so the next agent reads status from the item files rather than from here.**
[W28](../work-items/w28-a-grading-names-the-probe-it-breaks.md) **done**;
[W29](../work-items/w29-the-two-self-tests-that-grade-nothing.md) **done**;
[W30](../work-items/w30-the-clauses-nothing-probes.md) **done**;
[W31](../work-items/w31-the-self-list-check-policies-never-had.md) **done**. **All four items are done and P9's retro is what remains** — read every status from the item's own file, not from this line.

**And this plan's own prediction about `doc/workflow.md` is ANSWERED, in the direction it did not
predict.** The work-items section says of W30: *"the prediction is that `S11` catches it and the
obligation is therefore about a hole that already has a check … if instead W30 ships a wiring hole
`S11` does not see, that is the second occurrence and the obligation is earned."* **Both halves
happened, and they are different halves of the wiring.** `S11` catches the MANIFEST four ways —
the entry gutted of ` --self-test`, removed from `package.json`, removed from the chain, removed
from `GATE_CHAIN` — all four measured and all four refused by name. **It does not catch the
SCRIPT**: delete the four-line `--self-test` dispatch from `check-spec.mjs` and
`npm run check:spec:selftest` runs the plain check, exits **0**, and `check:source` exits 0 beside
it. Measured in **all SIX** checks that carry a dispatch. [Q149](../questions/q149.md), and **the fifth
obligation is earned on the item that predicted it would not be.** *(W30 wrote **five** into six
documents, having enumerated the checks in its own probe script rather than counting the
`:selftest` entries in `package.json`; its conformity reader found `check-markdown` missing. The
finding was right and its census was wrong — W29's own blocking finding, one item later.)*

**The exit artifact gains a THIRD row shape, and it is neither a detection nor a miss either.** W29
added *a sibling clause reporting the same id* and *a clause unreachable by construction*; W30 adds
**a clause whose grading passes as `corpus`** — [Q150](../questions/q150.md). A mutant that fails on
the clean tree is graded `corpus` and `corpus` is a PASS, so a harness bug that makes every mutant
non-inert reads as full coverage: dropping W30's import relocation put all 21 entries there at exit
0, with the summary line reading *"0 noticed by the named probe, 21 by the corpus"*. Closed in
`check-spec-selftest.mjs` by a declared `MAX_CORPUS = 0`; live in the other four.

**And the census parser was wrong in a way no previous plan's has been.** P8's aborted on rows that
render wrong; W30's first one aborted on **three rows that render perfectly** — Q101, Q102 and
Q117's Live row — because it was **code-span aware** and all three carry an odd number of backticks.
GFM cuts a table row on `|` FIRST and parses inline code afterwards. **A parser more careful than
the renderer reads a different document**, and that is also precisely why
[Q131](../questions/q131.md)'s two rows do render wrong. Corrected to split on unescaped pipes only,
after which the census is **CONFIRMED for the second plan running** — 109 questions, **73 open, 2
deferred, 34 resolved**, 29 ids in both tables — with Q119 and Q71 carried as two **declared**
exemptions. **The cluster table was stale by three**: Q146, Q147 and Q148 were in no cluster cell at
all, which the register's own note says is checked separately. Corrected in place.

**Two of this plan's own numbers are corrected by W29, both from the declaration step's measurement
rather than from its close** — the practice this plan's own table says has changed what got written
fourteen times:

1. **The arithmetic behind decision 2 and the census is optimistic by 2.3x.** *"Ten META entries cost
   ~450 s under today's contract and ~46 s under this one"* prices an entry at **one** check run. An
   entry is **two** — the inertness run [W28](../work-items/w28-a-grading-names-the-probe-it-breaks.md)'s
   readers added, which is not optional because a `disappeared` verdict cannot be told from a mutant
   that was already failing. Measured: **7.1 s** an entry in `check-docs`, **~0.5 s** in
   `check-scheduler`. The ordering argument for W28-before-W29 is **unaffected and strengthened** —
   the saving is larger, not smaller — but the plan's estimate of what W29 would add to the gate was
   the wrong number, and W29's coverage is cost-proportionate because of it.
   [Q148](../questions/q148.md).
2. **The `corpus` split this plan predicted for `check-docs` did not happen.**
   [Q145](../questions/q145.md) warned that non-inert mutations would need reporting rather than
   engineering away; all **13** candidate `check-docs` clause mutations and every `check-scheduler`
   one measured **inert**, so both new summary lines read `N/N` with no corpus term. Predicted from
   the shape of the clauses, measured to the contrary, and reported because the prediction was
   written down.

**And the exit artifact gains two row shapes nobody anticipated, plus a units problem.** The plan's
artifact is *one row per check clause saying what notices*, with three answers — a named probe, an
unrelated probe reacting to noise, or nothing.

1. **A sibling clause reporting the same id**, which is neither a detection nor a miss.
   [Q146](../questions/q146.md). W29 first measured two of these and the count discriminator then
   showed **one is co-firing (detectable, by the failure count) and one is true masking**. So the
   artifact needs **two** more columns rather than one, and the distinction is the finding.
2. **A clause that is unreachable by construction.** `scripts/check-scheduler.mjs:191` reads
   `if (!m || /^\s*export\s+type/.test(line)) continue;` and the second disjunct **can never be
   true** — a line beginning `export type` cannot match the `export\s*\{` regex that produced `m`, so
   `!m` short-circuits first. Found by W29's conformity reader, verified over five declaration
   shapes. It is *already* present-but-inert, so *what notices when it goes inert* has the answer
   **nothing, and nothing ever could**. **Not fixed** — decision 4 puts a check's behaviour out of
   scope — and it is a row rather than a defect.

**And the units.** This plan's census counts `D1`-`D5` and `X1`-`X5` as **ten** clauses and totals
**39**. W29 measured the same two checks at **18 + 3 = 21** and **14 + 3 = 17** — one per `fail()`
site plus one per way the report can lie — so the artifact's "39 rows" and the item's coverage claims
are at **different granularities**. Neither is wrong; the artifact must say which it is counting, or
it will report ten clauses covered where W29 covered 28 of 38 in those two files alone.

**And W31 answers the question only the LAST item of this plan could — what does a `SELF` list
actually BUY — as a measured pair rather than as an argument.** W30 supplied the first half:
re-sourcing `tripped` from the failure lines to the report rows costs **0** in `check-spec-selftest.mjs`
(no `SELF`) and is **REFUSED** in `check-source-selftest.mjs` (has one). W31 supplies the second half
in **one file, before and after**:

| mutation | before W31 | after |
|---|---|---|
| `MIN_META -> 0`, alone | 0 | **1** |
| `MIN_META -> 0` together with a shortened `META` | 0 | **1** |
| a `META` entry replaced by a DUPLICATE of another | 0 | **1** |
| one entry's anchor made GLOBAL — six `P3` sites, one name | 0 | **1** |
| a grading passing as `corpus` ([Q150](../questions/q150.md)) | 0 | **1** |
| `MAX_WIDE -> 99` — **which W30 recorded as SURVIVING in `check-source`** | — | **1** |
| the `ran:` crash guard, both halves | 0 | **1** |
| `if (!meta) -> if (true)`; `if (nestedSelf) -> if (true)`; the outermost verdict | 0 | **still 0** |

**So the answer has two halves and the second is the one nobody had stated.** A `SELF` list closes
every hole that lives in a list the child evaluates. **It closes nothing that returns before the list
runs** — the mutation reaches the parent as well as the child, and a parent that short-circuits never
reaches its own `SELF` pass. *The regress does not move one list further out; it stops at the first
thing that can return early.* W31's header argued the opposite about `if (!meta)` before it measured,
and corrected it in place.

**And the cost is the honest half, which the plan asked for explicitly.**
`check:policies:selftest` was **2.2 s** and is **14.0 s** — 6.3x, for a check with three clause ids
and ten `fail()` sites, to close eight holes that each cost 0. **That is the cheapest self-test in the
gate becoming a mid-priced one**, and it is [Q133](../questions/q133.md) moving in the wrong direction
for the right reason, exactly as W30's did. Self-tests were ~87% of the gate at W30's close.

**W31's own defect is the plan's question one layer further out, and it is the sharpest single
instance this plan produced.** [Q151](../questions/q151.md): the `SELF` mutants were written into the
scratch directory a child deletes on its first line, so every `META` grandchild failed to import,
every grading inside every child read *"the mutant did not run: this is a crash, not a detection"*,
and the file reported **`12/12 bounded` at exit 0**. The whole pass was measuring the deletion. **A
grading of the shape *the child failed* cannot tell a fired floor from a broken harness** — which is
[Q138](../questions/q138.md) restated one level out, in the entries written to close Q138. Closed by
a control run; **live in `check-source-selftest.mjs` and `check-markdown-selftest.mjs`**, the two
other files with a `SELF` list.

**Two more rows for the exit artifact, both from W31.** [Q152](../questions/q152.md) — two of W28's
three verdicts are **message-only**, so *what notices when this clause goes inert* has the answer
**nothing, and nothing can**, in all three files that carry them; that is a third shape after W29's
*a sibling clause reporting the same id* and *a clause unreachable by construction*.
[Q153](../questions/q153.md) — a `SELF` list is bounded by count and not by content, which is W29's
`META` finding at the outermost list.

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

---

## The retro

**Run 2026-09-06, after all four items were done and read.** `doc/workflow.md` section 6 pass 3:
review the **method**, not the product.

### The plan's question, answered

*When a check clause stops checking, what notices — and does it notice for the right reason?*

**Before P9, a clause going inert was noticed by an exit code.** An exit code cannot tell a detection
from noise, from a crash, from a clause that a sibling covered, or from a harness that did not run at
all. **After P9, 118 gradings name the probe that must break and grade on what that probe reported**,
and the three self-tests with a list beyond them can be shown to notice.

**And the answer to the second half — *for the right reason* — is NO more often than anyone expected,
including inside the machinery this plan built to ask it.** That is the retro's central finding and it
is section 6 pass 3 rule 3's sharpest shape: **a rule that was followed and did not work.**

### The exit artifact

**Promised:** *one row per check clause — 39 of them — saying what notices when that clause is made
present but inert: a named probe, an unrelated probe reacting to noise, or nothing.*

**Delivered, and the unit changed under it twice.** The plan counted 39 clauses at check-**id** level.
W29 established that the right unit is **one per `fail()` SITE plus one per way the report can lie**,
which took its own two files from 5 + 5 ids to 21 + 17 rows. At that unit the six checks carry
**94 `fail()` sites**. **The artifact must say which it counts, and this one counts sites.**

**The census, before and after — every figure read from the file's own report, not from a regex over
it:**

| | probes | gradings | `SELF` |
|---|---|---|---|
| P9's declaration | 100 | 63 | 6 |
| now | **136** | **118** | **31** |

*(The declaration's table said **62** gradings and recorded `check-policies`' `META` as 5; it was 6,
corrected at W28 by both of its readers independently. The corrected before-figure is 63.)*

| check | probes | gradings | `SELF` |
|---|---|---|---|
| `check-spec` | 18 | 21 — 20 named, 1 by the failure COUNT | — |
| `check-source` | 34 | 24 | 10 |
| `check-markdown` | 37 | 37 — 31 named, 6 corpus | 7 |
| `check-scheduler` | 20 | 22 — 20 named, 1 count, 1 masked | — |
| `check-policies` | 13 | 6 | 14 |
| `check-docs` | 14 | 8 | — |

**And the three answers the plan predicted became nine.** Six row shapes were found that the plan's
vocabulary has no word for, and **four of them are neither a detection nor a miss**:

| # | what notices | found by |
|---|---|---|
| 1 | a **named probe** | the plan's own |
| 2 | an **unrelated probe reacting to noise** | the plan's own; `noisy` is now REFUSED |
| 3 | **nothing** | the plan's own |
| 4 | a **sibling clause reporting the same id** — masking | W29, [Q146](../questions/q146.md) |
| 5 | the same, but **co-firing**: same id, different COUNT, so it *is* detected | W29 — and *co-firing is detectable by a projection nobody was reading; masking is not* |
| 6 | **nothing, and nothing could** — a clause unreachable by construction | W29 (`check-scheduler.mjs:191`), W30 (`SCHEDULER_REACH[4]`) |
| 7 | the gate, as **`corpus`** — which is a PASS, so a broken harness reads as coverage | W30, [Q150](../questions/q150.md) |
| 8 | a **different id** — the run fails for the wrong reason | W29: four `check-docs` clauses, noticed by `RUN_FLOOR` |
| 9 | **nothing, and nothing can** — a **message-only** clause, which assigns a diagnosis and touches no verdict | W31, [Q152](../questions/q152.md) |

**Row 9 is the one to carry, because it is invisible to every mechanism this plan built.** W28's
contract asks *did the named probe stop noticing*; a branch that only writes `why` changes no verdict,
so the answer is *no* whether the branch is there or not. **Two of W28's own three verdicts are that
shape**, in the four self-tests that grade with a `why =` assignment — and **not** in the two where
W29's failure-COUNT discriminator turned that arm into a block that can set `ok`. That split was
measured in one file and written into the register as *"in any of the three files"* with an owner cell
naming six; see change 3.

### Verdict 1 — rule 8 gains a FIFTH obligation: **break the WIRING**. ADOPTED.

**Three instances, three items, and it is earned against this plan's own written-down prediction.**

| | the wiring | what happened |
|---|---|---|
| **W24** (P8) | the **MANIFEST** | ` --self-test` dropped from a `package.json` entry — the name stays in the chain and the plain check runs twice. Found by **both** of W24's readers. `S11` now refuses it, four ways |
| **W30** | the **SCRIPT** | the four-line `--self-test` dispatch deleted from the check itself: `npm run check:X:selftest` runs the plain check, exits **0**, and `check:source` exits 0 beside it. **Measured six for six** — for `check-docs` that is 128 s of gradings silently not running. `S11` reads the **manifest** and cannot see it. [Q149](../questions/q149.md) |
| **W31** | the **HARNESS** | the `SELF` mutants written into the scratch directory a child deletes on its own first line, so no grandchild could re-import them: **`12/12 bounded` at exit 0**, with every grading in every child reading *"the mutant did not run: this is a crash, not a detection"*. The pass ran, and measured the deletion. [Q151](../questions/q151.md) |

**The prediction was written into this plan's work-items section before W30 started**, in the words the
verdict would have to match: *"the prediction is that `S11` catches it and the obligation is therefore
about a hole that already has a check … if instead W30 ships a wiring hole `S11` does not see, that is
the second occurrence and the obligation is earned."* **Both halves happened**, and they are different
halves of the wiring. **A prediction written down before the item is what makes this a measurement
rather than hindsight**, and it is the second time in three plans that the practice has reversed a
plan's own expectation.

**What it replaces: nothing.** The four existing obligations ask *what is claimed*, *which outputs
exist*, *where the number came from*, and *how many things are iterated*. **None of them asks whether
the thing runs at all.** A check, a grading or a guard can be present, correct, and never reached, and
every one of the three rows above is green while that is true.

**And it settles a question P6's retro left open two plans ago.** That retro wrote: *"[rule 8] is now
the longest rule in this document, and if a seventh plan finds a fourth obligation the right response
is to ask whether rule 8 should be a section rather than a rule."* P7 found the fourth; P9 finds the
fifth. **The answer is NO, and the argument is its ADDRESS.** *"Section 5 rule 8"* is cited in this
document, in four plans, in eleven work items and in the register; section and rule numbers leak
exactly as ids do, and section 3's *"ids are never reused and never renumbered"* is the same argument
one level out. **Rule 8 is restructured in place with its obligations lettered, and it does not move.**

### Verdict 2 — a provocation is evidence only when it FIRES, and only when it fires FOR THE REASON IT NAMES. ADOPTED.

P8's retro proposed *"a check written for a defect you have just fixed has no live case, so its probes
are the whole of its evidence."* **The observation is right and it is half of something bigger**, and
the missing half is this plan's own subject turned on rule 8's own set.

**The half P8 named — does the guard ever FIRE?** W30 is seventeen instances (`spec/` has passed
`C1`-`C8` since W1, so every probe there builds an invalid `spec/` that has never existed) plus one
with **no case the corpus can express at all**. W29's `D5` is the counter-case — a check written for a
defect that was live, [Q141](../questions/q141.md). W31 has three guards whose case had to be
**constructed**: [Q144](../questions/q144.md)'s `ran:` case, the control run's, and an ambiguous-anchor
guard whose defect **was never in the tree at all**. And P9's own declaration supplied the answer to
*how long does a corpus take to catch up*: `M1` shipped green with no live case at W25 and caught a
real dead link **one plan later**, written by this plan's own declaration.

**The half nobody had named — when it fires, is it for THIS reason?** Rule 8 grades a provocation by
*did the gate go red*. **That is [Q138](../questions/q138.md) — the defect this whole plan exists to
remove — living inside rule 8's own procedure**, and it was found six times in three items:

| | the provocation | it went red for |
|---|---|---|
| W30 | 17 of 21 gradings reported `exit0` | *the right ids were found and the exit path lied* is what `exit0` means in the sibling files; here it meant *there was nothing left to report*. **No grading changed and only the reported reason did** |
| W29 | `D2`'s and `D5`'s unreadable-input clauses | both came back STILL CAUGHT and the author read *masking* into each. The failure COUNT then split them: `D2` is **co-firing and detected**; only `D5` is masking |
| W31 | three `SELF` entries meant to bound `MIN_PROBES` | all named probes a `META` entry also names, so **W28's ABORT fired first** and the floor was never the reason. The disjunct was deletable for 0 with all three "passing" |
| W31 | the `SELF` entry meant to bound `MAX_CORPUS` | red because the named probe came back STILL CAUGHT, not because the cap fired — so the inertness run, `corpus`'s only producer, was deletable for 0 |
| W31 | the author's probe for rule 7 (c)'s set equality | used `replaceAll`, hit **both** copies of the expression, and was refused by the copy that was already covered. The uncovered copy cost 0 |
| W31 | the author's probe reproducing its own shipped defect | reported *refused* — by a **crash**, not by the control run it was written to exercise |

**So the amendment has two halves and they are the same question in two directions.** *Does this guard
ever fire?* — construct the case, and if the corpus cannot express one, **record that** rather than
arguing it. *When it fires, is it for this reason?* — **read the failure lines, not the exit code.**

**What it replaces: nothing, and it completes something.** Rule 8 already defines a *survivor* as one
only once a second independent route confirms the mutated clause was **reachable** — that is
reachability in the negative direction, *did the mutation change an observable*. This is the positive
direction, *does the guard ever produce its own failure*, and W31 measured three guards in one file
that never had.

### Verdict 3 — section 1 rule 5 gains a clause about WRITING: **state the scope you measured**. ADOPTED.

Two occurrences, two items, both found by a conformity reader, both in documents read before every
work item:

| | measured | written |
|---|---|---|
| **W30** | the `--self-test` dispatch, in **five** checks enumerated by hand in its own probe script | *"measured in **all five** checks"* — into **six documents**. There are six checks; the census omitted `check-markdown`, the second most expensive. **The finding was right and its census was wrong** |
| **W31** | two message-only verdicts, in **one** file | *"in any of the **three** files that carry them"*, with an owner cell naming **six**. Wrong internally, and **false in two of the six** — `check-spec` and `check-scheduler` carry a block, not an assignment, and disabling it costs 1 and 2 there |

**This is a different direction from the clause already there.** Section 1 rule 5's provenance clause
is about **reading**: *a claim about another item's status is read from that item's own file, never
from an index — and it is any copy, including your own.* This is about **writing**: the scope of a
claim you are making from your own measurement. **An author who measured one file and wrote six has
not read anything wrong; they have generalised without saying so**, and the register is where it lands
because the register is where findings are lifted to.

**And W30 and W31 each reproduced the other's shape**, which is the argument for a rule rather than two
corrections. W31 corrected W30's *"all five"* in the two documents W30's own correction had missed —
**and then wrote *"Q149 is confirmed for the sixth check"* into both of them**, so each document said
*five* in one paragraph and *sixth* in another. That is the self-contradiction W31 names W29 for, in
the two files W31's own record step edits, one item later.

### What P9 did to v0.9's four changes

| v0.9 change | What would show it was wrong | **P9's verdict** |
|---|---|---|
| **Rule 8's FOURTH obligation: break the LOOP BOUNDS** | the readers still find blocking gaps on a fifth axis, or the obligation fires on nothing | **Right, and it is the highest-yield obligation in the document — and STILL NOT SUFFICIENT.** W30's adequacy reader: **twelve of seventeen survivors** were obligations (a) and (d) and **not one was reachable by a probe that breaks a VALUE**. W31's: three of five blocking findings are bounds. **But the gap it leaves is verdict 2**: W31's three `MIN_PROBES` entries instantiate the obligation perfectly — one entry out, the whole list out — and all three bounded the ABORT instead of the floor. **Knowing which list to break is not knowing that you broke it for that list's reason** |
| **Rule 8 states the PROCEDURE for a provenance probe** | an author instantiates it wrong again, or a reader corrects it a fifth time | **Right, and NOT corrected once in four items — the first of v0.8's or v0.9's rule-8 amendments to go a whole plan clean.** [Q112](../questions/q112.md) had corrected the axis four times across three items before the procedure was written down. P9 ran nine provenance probes across its four items and **every one changed a source expression and nothing else**; the two that survived (`SELF_RAN`, `tripped` re-sourced) survived as findings rather than as rewrites. **One sentence in the rule ended a class that four items could not** |
| **Section 1 rule 5's provenance clause extends to ANY copy** | an author believes a derived claim again, including their own | **Right, EXERCISED, and it is now the standard readers judge by — and it has a blind side, which is change 3.** W30's conformity reader cited it against a cluster table, W31's against `CLAUDE.md` carrying W29's author-pass counts and against an index contradicting itself inside one document. **Every one of those is a READ.** The two blocking findings it could not reach are the two in change 3, where the author measured correctly and wrote a scope they had not measured |
| **Section 7 rule 2: `Owns` from the PLAN's index row** | an item's block is wrong again, or late exceptions rise | **Right, and the numbers hold at the floor.** Across P9's four items: **zero, zero, two, zero** late exceptions, and W30's two are the same pair P9's own declaration took for itself, on the same two files, for the same reason — [Q142](../questions/q142.md)'s two-sided window obliging an item that **adds documents** to edit a file it does not own. **That is a plan's problem, not a discipline problem**, and it is the second plan running to hit it |

### What did NOT change, and all four were live

**`check-owns.mjs` stays retired, for the FIFTH plan.** Four items, and the audits are the evidence:
W28 and W29 and W31 declared and audited at **zero** late exceptions, W30 took **two** and declared
both in its Record before a reader found them. **Eleven consecutive items have audited their `Owns`
correctly**, and the one thing that would revive the proposal — an undeclared edit found by a reader —
has not happened since W9.

**Rule 7 (c) is EXERCISED, heavily, for the first time since W16.** Every one of the **136** probes in
six self-tests declares the full set of checks it must trip, and the form discriminated repeatedly:
W30's `UNSTRIPPABLE emptied` was refused as ambiguous by a guard added in the same commit, and W31's
vacuous probes were refused by their declared set rather than by any guard. **And W29 found its
mirror-image limit**: rule 7 (c) settled that naming *one* check does not discriminate because a
malformed probe trips two — the limit is that **two clauses that both trip the right one are
indistinguishable**, and the signal that separates half of them (the failure COUNT, printed as `(2)`
versus `(1)`) was in the report all along and unread. **That is a `scripts/**` mechanism rather than a
workflow rule and it is not lifted into this document.**

**Section 6's two-reader split: fourteen measurements, and the BAND STATEMENT IS NOW WRONG AS
WRITTEN.** P9's four: **4, 1, 2, 0**. The document says *"two readers produce 1-4 shared findings,
whatever the item's size"* and declares the question settled. **The finding is 0**, from W31, and it is
the first outside that band. **This does not reopen the question** — 0 is what *"the second reader
finds what the first was not looking for"* predicts at the limit, and W31's two readers produced 5 and
10 findings with eight blocking between them, which is the largest yield of the four. **The number is
corrected to 0-4 across fourteen and the caveat is recorded with it**: W31 gave both readers the same
list of *claims the author was least sure of*, a priming none of the thirteen earlier measurements had,
and it is at least as likely to have driven them apart as together. **Reported with its method
attached, and the split stays settled.**

**And `doc/` is refused again.** P7's retro refused it for the seventh time; P8's did not name it; this
is the eighth. P9 produced more instances of the class than any plan before it — a register row
generalised from one file to six, a ceiling comment quoting a literal its file no longer contained,
`CLAUDE.md` carrying an item's author-pass counts, two documents contradicting themselves inside one
paragraph, and a cost decomposition that put a whole run inside one of its phases. **Every one was
found by a reader and none by a check, and the two candidate mechanisms are still worse than the
problem.** What P9 adopts instead is change 3, which is a rule about **where a claim's scope comes
from** — the one sub-case that has now occurred twice, in two items, in the same direction.

### [Q133](../questions/q133.md), answered with a number rather than decided

**P8's retro said *"roughly half the gate"*; P9's declaration corrected that to 88% (206.3 s of
234.6 s over 18 entries) and predicted the contract change would bring it down. It did not, and the
reason is that this plan bought coverage with the saving.**

| | at P9's declaration | now |
|---|---|---|
| gate entries | 18 | **19** |
| probes / gradings / `SELF` | 100 / 63 / 6 | **136 / 118 / 31** |
| the six self-tests, one sequential pass | 206.3 s | **347.0 s** |
| the six bare checks, the SAME pass | — | **4.3 s** |
| the whole gate, two different runs | 234.6 s | **438 s and 366 s** |

**The two rows to compare are the two from the same pass, and they are the number this plan should be
remembered by: the six checks cost 4.3 seconds and proving they can fail costs 347 — a factor of 81.**
*(`check-spec:selftest` 18.3, `check-source` 91.1, `check-markdown` 108.8, `check-scheduler` 8.9,
`check-policies` 14.6, `check-docs` 105.3.)*

**The share is 79-95% and it is quoted as a RANGE on purpose.** 347 s came from one pass and the gate
from two others that measured **438 s and 366 s** — a 20% spread on identical work, on the same machine,
within one session. Subtracting across them to derive a product-facing figure is exactly the arithmetic
P8's retro got wrong by a factor of two and this plan's declaration corrected. **Quote the pair from
one pass (4.3 s and 347.0 s) and treat everything else as a band.** The share fell from 88%
while the absolute rose from 206 s, and both halves are real: **W28's contract change worked** —
`check-markdown` went 129.4 s to 65.1 s by running one named probe per entry instead of the whole
suite — **and the coverage ate it**, through the inertness run W28's readers required, eight new `SELF`
entries, W29's two META passes, W30's whole new self-test and six probes, and W31's fourteen `SELF`
entries.

**The contract change worked and the coverage ate it.** W28 took `check-markdown` from 129.4 s to
65.1 s by running one named probe per entry instead of the whole suite — and then the inertness run its
readers required, the eight new `SELF` entries, W29's two META passes, W30's new self-test and six
probes, and W31's fourteen `SELF` entries put it back and more. **Every one of those is measured
coverage that did not exist**, and the plan's scope declared changing what the gate RUNS out of bounds.
**Q133 stays open with a better number on both sides of it**, and the decision it asks for — whether a
`verify` chain should split out of `gate` — is still nobody's. [Q148](../questions/q148.md) is the
constraint whoever takes it must start from: **the obvious mitigation is unsafe**, because
`check:scheduler:selftest` moves `node_modules/fyflow-scheduler` aside while an `AGENTS.md` snippet
imports it, so two of the six cannot run concurrently.

### Ids

**P9 used all four reserved work items — W28, W29, W30 and W31** — the last declared late, on W28's
adequacy reader's measurement, against a trigger written into W28's `Out` list **before W28 started**.
**W26 and W27 stay skipped and are never reissued.** **W10 stays HELD and W11 stays SKIPPED for the
eighth plan running.**

**Q ids: Q141-Q153 reserved and all thirteen used** — the first plan to spend its whole block.
**One resolved** ([Q141](../questions/q141.md), by W29); twelve open. **ADR 0034 and 0035 are both
SKIPPED**, exactly as the plan predicted for four items that change harnesses rather than
architecture, and **no item wanted one** — which was the plan's own stated signal that scope had grown.
**0026 stays held for [Q97](../questions/q97.md) for the fifth plan; 0028 and 0031 stay skipped.**

### The one sentence to carry

**A grading that reads an exit code cannot tell you why the gate went red, and that is true of rule 8's
own provocations, of a `SELF` list's entries, and of the harness that runs them — all the way out.**
P9 removed it at the layer it set out to remove it at, and found it one layer further out three times
while doing so: in W29's masking, in W30's `exit0`, and in W31's `SELF` entries that bounded the ABORT
while naming the floor. **The fix is never a better exit code; it is a projection that says which
clause fired**, and this plan's contribution is that the projection now exists at three layers and is
missing at the fourth.
