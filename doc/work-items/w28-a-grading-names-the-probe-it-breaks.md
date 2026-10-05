# W28 — A grading names the probe it breaks

**Status:** **done** - 2026-09-03
**Plan:** [P9](../plans/p9-when-a-check-stops-checking-what-notices.md)

```
Spec:       none - this item defines it. A self-test's META contract is `scripts/**`'s own
            vocabulary and no spec/ document names it
Owns:       scripts/check-source-selftest.mjs    (W24)
            scripts/check-markdown-selftest.mjs  (W25)
            scripts/check-policies-selftest.mjs  (W16)
            scripts/check-markdown.mjs           (W25 - for Q142 alone: the M3/M4/M5
                                                  floors, whose two-sided window this
                                                  item is the first to have closed)
Inputs:     the three files' own PROBES and META lists, and nothing else. This item reads
            no src/, no spec/ and no document. The before-numbers come from P9's
            declaration step, re-measured here rather than carried forward
Outputs:    a `probe:` field on every META entry naming the probe it must break; a grading
            that RUNS that probe and compares its verdict, replacing `r.status !== 0`; an
            ABORT when a named probe does not exist; a SELF entry proving the naming is
            load-bearing; and the measured cost of all three self-tests on both sides
Depends on: nothing
Blocks:     W29 and W30 - both write META entries and should write them in THIS form
Tests:      the existing probes, unchanged, plus the gradings themselves. Expected values
            come from each META entry's declared probe, never from running the mutant and
            recording which probe happened to fail
Gate:       L0 (own coverage), L1-L6 as regression and MUST NOT MOVE, then two readers
Reserves:   Q143-Q145, ADR 0034  (Q142 is RAISED by P9's declaration and owned here)
```

## Why this item exists

**Every META grading in this repository is `r.status !== 0`.** The pass exists to answer *did the
probes notice that the check stopped checking*, and an exit code cannot tell that from *something
else went wrong*. [Q138](../questions/q138.md) raised it from two directions in one item; P9's
declaration step measured it across all 56 code-targeted entries.

| | `check-source` | `check-markdown` |
|---|---|---|
| META entries graded | 20 | 36 *(+1 targeting `check-spec.mjs`)* |
| graded **noticed** | 20 | 36 |
| **distinct probes that ever do the noticing** | **14 of 24** | **31 of 37** |
| the crediting probe declared a non-empty set and reported a **strictly larger** one | **1** | **6** |
| cost of the pass | 12 s | 2 m 50 s |

**Three consequences, and the second is the one that makes this an item rather than a cleanup.**

1. **Which probe gets the credit is an artefact of `PROBES`' ORDER.** The child breaks at the first
   probe the mutant disturbs, so the credit goes to the earliest reacting probe rather than to the one
   written for the clause. In `check-markdown`, **five of the six slug-rule mutations are credited to
   *a link to a file that does not exist***, while the two probes actually written for the slug rule
   sit lower in the list and never run at all.
2. **In 7 of 56 the mutant was noticed because it became NOISY.** The crediting probe declared `[M1]`
   and reported `[M1,M2]`, or `[S12]` and reported `[S12,S13]` — the broken check produced an **extra,
   unrelated** failure across the corpus. That is the same defect W24's conformity reader found from
   the other side, where an entry scored *noticed* because the mutant **crashed**: at the probe layer
   set equality discriminates and at the grading layer an exit code does not.
3. **The cost is entirely this.** A bare `check-markdown` run is **220 ms**; the META pass re-runs up
   to 37 of them per entry, 37 times over. Naming the probe reduces each child to **one**.

**The correctness gap and the cost are the same defect seen from two sides**, which is the whole
reason [Q133](../questions/q133.md) and [Q138](../questions/q138.md) are one item and not two.

## Scope

**In**

1. **Every META entry declares `probe:` — the NAME of the probe it must break.** Not an index: an
   index silently re-points when a probe is inserted above it, which is `doc/workflow.md` rule 8's
   fourth obligation turned on the reference rather than on the list.
2. **The child runs only that probe.** A new input override on the pattern of `CHECK_SOURCE_SCRIPT`
   tells the child which probe to run; everything else about the probe loop is unchanged.
3. **The grading has TWO halves and both are asserted.** The named probe must be **caught** against
   the real check and **uncaught** against the mutant. The second half alone is satisfied by a probe
   that was already broken, which is exactly the vacuity rule 7 (b) refuses one layer down.
4. **A named probe that does not exist ABORTS**, and says so, rather than passing or being skipped.
   [Q138](../questions/q138.md)'s own *"against"* argument — *"an entry whose probe is renamed then
   aborts rather than passing"* — is adopted **as the reason for**, not the reason against: that is
   what `check-docs-selftest`'s probe 11 did when W13 deleted the API it was pinned to, and
   `doc/workflow.md` v0.6's verdict on rule 7 (b) is that failing loudly there was right.
5. **The entries whose named probe does NOT fail are triaged one at a time, and each gets a written
   verdict.** They will exist: the measurement predicts **at least seven** candidates — six in
   `check-markdown`, one in `check-source`. Each is either **a hole in the probes** or **a mislabelled
   entry**, and the item says which. **Relabelling an entry to whatever happens to fail is forbidden**
   and is the single way this item can be done wrongly while looking finished.
6. **The cost of all three self-tests is measured before and after**, with the caveat P9's declaration
   records: the absolute varies by a quarter between runs of the same tree, so **the number to report
   is a pair of measurements and the ratio**, not a single figure. W25 quoted one run as a fact in
   four documents and had to correct it.

**Out** — named rather than left implicit, with where it goes instead

- **Adding META entries.** `check-docs` and `check-scheduler` have none at all; that is **W29**, and
  it depends on this item precisely so its ten entries land in the new form. Ten entries at
  `check-docs`' 4.4 s a probe cost **~450 s** under today's contract and **~46 s** under this one.
- **Adding probes.** The 16 clauses with none are **W30**.
- **A `SELF` pass for the three files that lack one.** `check-docs`, `check-scheduler` and
  `check-policies` have no `SELF` list, so nothing bounds their `PROBES`. P9 reserves **W31** for it
  and expects it unused; `scripts/check-source-selftest.mjs`'s own header records why a fourth list
  moves the hole rather than closing it. **If this item finds the missing `SELF` is what blocks its
  own grading, that is the signal to take W31** rather than to widen this one.
- **Changing what any check checks.** `S1`-`S13`, `M1`-`M5` and `P1`-`P3` behave identically before
  and after. If a clause's behaviour has to change to make a grading work, that is a finding.
- **Changing what the gate RUNS.** P9 declares it out. This item makes the gate cheaper at what it
  already runs; it does not move an entry out of the chain. **`S12` would refuse that anyway**, which
  is W24's point landing on the first item that could hit it.
- **[Q134](../questions/q134.md)** — whether `S11`'s membership clause should be retired. A clause
  boundary question, not a grading one.
- **Deriving `M3`/`M4`/`M5`'s bounds from the tree.** [Q142](../questions/q142.md) is owned here, but
  what this item owes it is a **verdict and a working pair of probes**, not necessarily a derived
  bound: a bound derived from the corpus cannot fire on that corpus, so the probes would have to
  inject the shrinkage rather than reveal it, which is a different harness. **The floors are already
  retuned to 56 / 1350 / 60** by P9's declaration, from a measurement, so the item inherits a green
  gate and an open question rather than a red gate and a fix.

## The decision this item takes, and what it costs

**A grading's verdict becomes a claim about ONE probe, and that is strictly stronger and strictly
narrower.** Today an entry says *the suite noticed*; after this it says *this probe noticed*. The cost
is that **an entry can now be wrong in a way it could not be before** — it can name the wrong probe —
and the benefit is that being wrong is now visible.

**The failure mode this introduces is deliberate and is the one to state.** A probe renamed for
clarity turns a grading red. That is the same trade `doc/workflow.md` rule 7 (b) already took at the
probe layer, where a mutation matching nothing **aborts**, and P4's retro reports that firing in the
wild and getting it right. **The alternative — matching a probe by index, or by a substring — buys
robustness by making the reference unfalsifiable**, which is the defect and not the fix.

**And it is `doc/workflow.md` rule 7 (c)'s argument applied one layer out.** (c) says a probe declares
the exact **set** of checks it trips, because naming one does not discriminate. A grading that reads
an exit code is the pre-(c) form of the same mistake, one level up: *something failed* satisfies it,
and a merely noisy mutant satisfies it exactly as a detected one does.

## Verification

**L0 — own coverage.** Each command named, not implied:

```bash
npm run check:source:selftest    # 24 probes, 20 gradings, 3 self - each grading naming its probe
npm run check:markdown:selftest  # 37 probes, 37 gradings, 3 self
npm run check:policies:selftest  # 13 probes, 5 gradings
```

**L1-L6 — regression, and the expected result is NO MOVEMENT.** This item touches no check, no
`src/`, no `spec/` and no document. Any change in the counts below is a finding, not a pass:

```bash
npm run gate                     # 18 entries, all exit 0
npm run test:l6                  # 23 row labels, 25 real runs, 489 assertions
```

Baseline at `76bf5e6`, measured rather than inherited: **474 `test()` cases** in 19 files across Node
24.20.0, Deno 2.9.6 and chromium; **489 assertions at L6** over **23 row labels and 25 real runs** in
Node and Deno. *(`npm run gate` runs `test:browser`, which is **chromium only**; firefox and webkit
need `test:browser:all`, which the gate does not run. The two numbers count different things —
[Q98](../questions/q98.md) — and are never added.)*

**Rule 8's four obligations, on this item's own fix.** Written here rather than after the readers
report, and **re-run after acting on them** per v0.8:

| obligation | what it means here |
|---|---|
| the rule's clauses | each half of the two-half grading, broken separately; the abort on a missing probe; the override that selects a probe |
| the `Outputs` rows | every row of the table below, broken so it is **present but inert** |
| **provenance** | the named probe's verdict read from the child's report rather than from its exit code — **substitute the source expression and nothing else** (v0.9's procedure) |
| **loop bounds** | `META`'s own length, and the new per-entry `probe:` reference: can one entry's name go stale, can the whole list, and does anything **count** it from a source other than itself |

*Not applicable to this item: it touches no routing, so a branch routed away from its join (Q4),
`user_action` (Q17), an unmatched decision edge (Q10), a duplicate task id (Q13) and a nested fan-out
(Q6) are all outside it. Said explicitly, because silence is not an answer.*

## Record

**COMPLETE — 2026-09-03.** Author pass, both readers, and rule 8's re-run after acting on them.
**Overlap between the two readers: 4** — the markdown `SELF` crash, the noise class, `check-policies`'
stale `MIN_META`, and the `ran:` guard's window. That is the **eleventh** measurement of section 6's
overlap question and it sits inside the settled 1-4 band.

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L0 own coverage | **RAN, green** | `check:policies:selftest` 13 probes / 6 gradings; `check:source:selftest` 24 / 20 / 7; `check:markdown:selftest` 37 / 37 / 7. All exit 0 |
| L1-L6 regression | **RAN, unmoved** | 18 gate entries all exit 0; 474 `test()` cases in 19 files across node 24.20.0, deno 2.9.6 and chromium; 489 assertions, 23 row labels, 25 real runs at L6 in node and deno |
| conformity reader | **RAN** | **11 findings, 4 BLOCKING.** All four verified independently by the author before acting. It also confirmed the `Owns` audit, all 63 `probe:` fields resolving, the inherited caught-clean half on every path, and every count in this Record, re-measuring the gate at exit 0 in 181 s |
| adequacy reader | **RAN** | **35 mutations, 17 survivors, 7 BLOCKING**, in an isolated copy verified green at exit 0 before it started. Zero symlinks and zero reparse points before and after; all three scripts byte-identical to a pristine snapshot at the end. It instantiated all four of rule 8's obligations and named the one sub-question it could not: *does anything COUNT the list from a source other than itself* — nothing does, every floor is a literal |
| re-run after acting on the readers | **RAN** | gate green at **exit 0, zero FAIL lines**, L1-L6 unmoved. The readers' exact edits re-measured as probes: two now REFUSED, one still survives **with a stated verdict** ([Q145](../questions/q145.md)), two were the author's own bad probes rather than surviving holes, one is behaviour-preserving and labelled so |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| `probe:` on every META entry | yes — 6 + 20 + 37 | the whole grading; without a name there is nothing to run |
| the child runs only the named probe | yes — `CHECK_{POLICIES,SOURCE,MARKDOWN}_PROBE` | `SELF` *"the probe name dropped from the child`s env"*, in both files that have a `SELF` list |
| the two-half grading | yes | the *caught-clean* half is the main probe pass, which already refuses to reach META unless every probe is caught, and is **not re-run per entry**. Stated rather than implied: it is inherited, not asserted twice |
| the ABORT on a named probe that does not exist | yes — exit 3 | `SELF` *"one META entry pointed at a probe that does not exist"* |
| the STILL-CAUGHT verdict | yes — exit 0 | `SELF` *"one META entry pointed at a probe its mutation does not break"* |
| the `ran:` crash guard | yes | `SELF` *"one META mutation made FATAL rather than inert"* |
| a `SELF` entry proving the naming is load-bearing | yes — **four** per file, in the two files that have a `SELF` list | `check-policies` has no `SELF` list, so its copy of the contract is unprovoked **in that file**. Named, not hidden: W31 |
| the cost, measured on both sides | yes | below |

**Cost, and the comparison is stated carefully because the absolutes drift.** Two whole-gate passes,
before and after, plus back-to-back isolated runs of the three changed self-tests.

| | before | after, isolated | after, in the gate pass |
|---|---|---|---|
| `check:policies:selftest` | 6.5 s | **2.8 s** | 2.5 s |
| `check:source:selftest` | 23.1 s | **21.5 s** | 25.8 s |
| `check:markdown:selftest` | 129.4 s | **65.1 s** | 78.3 s |
| `check:docs:selftest` — **unchanged, the control** | 45.3 s | — | 54.7 s |
| whole gate, 18 entries, all exit 0 | 234.6 s | — | 199.9 s |

**The after-pass ran 1.2-1.6x slower on work this item did not touch**, so the raw 234.6 -> 199.9 is
not the change. Normalised by the control's 1.21, the after-gate is ~165 s. **The number to carry is
the isolated pair**, and the honest summary is: **the grading change alone took `check-source` to
9.1 s and `check-markdown` to 25.3 s, and the eight new `SELF` entries put ~12 s and ~38 s back.**
That trade is deliberate — a contract with no negative test is rule 7 (a)'s own case — and it is
reported rather than replaced by the better number. Self-tests are now **82%** of the gate where they
were 88%.

**The gradings that went red, and what each one was.** The item predicted *"at least seven"* from
P9's declaration audit. **The true count is two, and the prediction was wrong in an instructive
direction.**

| entry | named probe | verdict |
|---|---|---|
| `check-source` — *the linted trees read from a literal instead of from the walks this script does* | *lint`s coverage left to the DERIVED clause alone* | **STILL CAUGHT. A hole in the ENTRY, not in the probes.** Its literal `['src/', 'test/', 'index.ts']` is not the same shape as the expression it replaces — `rel('src/')` resolves against the root and returns `src` with no trailing slash — so the mutant reported *"lint does not lint src"* and *"does not lint test"* on **every** run with `package.json` untouched. It was **noisy**, not inert; every probe went red against it; an exit code cannot tell that from a detection. Rewritten as the source swap it meant — one term dropped from the spread — measured at probe-alone 1 failure, probe-under-mutation **0**, mutation-alone-on-a-clean-tree **0** |
| `check-policies` — *P3 disabled* | *section 3`s number removed, so no names are read at all* | **CRASH, caught by `ran:`.** `if (names === null) fail('P3'` -> `if (false)` takes the branch away from an `if`/`else if` chain whose next arm evaluates `names.length`, so the mutant **threw**. Scored *noticed* since W16 for a reason with nothing to do with the probes. Now sends the report into a discarded array, which leaves the chain intact and the clause present but inert |

**Why the prediction was wrong, and it is worth more than the prediction.** P9's declaration measured
*which probe fails FIRST* under each mutant and flagged seven where that probe reported a strictly
larger set than it declared. Six of the seven were in `check-markdown`, and **all six named probes go
uncaught correctly** — the mutants really are detected, by the probe written for the clause. What the
audit measured was **list order**, not detection: the first-reacting probe is not the intended one,
and the two are independent. So the audit was right about the defect it names — the credit goes to the
wrong probe — and wrong about how many entries are actually unsupported.

**What broke, and all four were found by machinery this item added.**

1. **`check-policies`' `P3 disabled` crashed** — above. The `ran:` guard's first run, in a file
   nobody had suspected. **Second occurrence of a shape W24's conformity reader found once.**
2. **`check-source`'s provenance entry was a rewrite** — above. [Q112](../questions/q112.md)'s fifth
   correction across four items, and **the first caught by a machine rather than by a reader**.
3. **[Q143](../questions/q143.md) — four `SELF` entries edited themselves.** Each quoted the guard it
   removes as its `String.replace` anchor, and that quote sits in this file **inside the `SELF` entry,
   hundreds of lines above the guard**. Two reported SURVIVED, which is visible; **two reported
   BOUNDED for a reason that never happened**, which is not. W25's *a comment that quotes the code it
   explains makes that code unmutatable*, with the comment replaced by the mutation's own argument —
   and worse, because a comment yields a no-op rule 7 (b) reports and this yields an edit that lands
   somewhere real.
4. **`check-markdown`'s `SELF` children never ran `META`.** The return after the probe pass read
   `if (nested)` rather than `if (nestedScript)`, so **no `SELF` entry in that file could observe a
   grading at all** — all four new ones survived on it. `check-source-selftest.mjs` had learned this
   and says so in place; the sibling did not inherit it. **[Q137](../questions/q137.md)'s shape a
   third time: a fix moves and its reason does not.**

**What this taught, and the first of these is the item's method finding.**

- **A two-edit `SELF` entry asks its question backwards.** *Remove the guard AND supply the case it
  catches* makes the run go **green**, so `SELF`'s *"must exit non-zero"* reads as *the floor did not
  fire* whether the guard was load-bearing or not. **Edit only the defect and leave the guard in**:
  with the guard present, does the run go red? One edit each, rule 7 (b) covers it per entry, and
  nothing self-matches because `META` sits above `SELF`. All eight new entries are in that form.
- **Rule 7 (b) is per ENTRY, not per EDIT.** A two-edit entry whose first edit matches passes the
  guard while its second silently does nothing — measured on the entry that removed the abort and
  never created the dangling reference. The three-file redesign removes the class rather than
  guarding it, which is why it is a lesson here and not a check.
- **The prediction lesson above**: *which probe fails first* and *whether the intended probe fails*
  are independent, and an audit of the first says nothing about the second.

### What the readers found, and what changed because of it

**Eleven findings and thirty-five mutations, seven of them blocking on each side by their own
count, and every blocking one is the SAME defect at a different layer**: the contract was right and
the grading collapsed it. The conformity reader's sentence is the one to carry — *the grading no
longer reads **an** exit code, it reads **one** exit code.*

| finding | what it was | what it cost | now |
|---|---|---|---|
| the grading is set-INEQUALITY | a mutant that leaves the named clause fully detecting and adds one unrelated failure grades as a detection. This item's own headline find survived only because its noise happened to land under the id its probe declared — **one id different and it would have passed** | 0 | the child emits **`outcome:`** — `caught` / `disappeared` / `fires` / `noisy` / `disagreed` / `exit0` / `corpus` — and the parent grades on that. A `noisy` mutant is REFUSED |
| no mutation was ever checked for **inertness** | rule 8 (b) asks for *present but inert* and nothing tested it. **Six** `check-markdown` mutants fail on the corpus by themselves, five of them named against a `{}` probe that cannot be caught whatever it edits | 0 | an inertness run per entry. A non-inert mutant is `corpus` — noticed by the gate, **counted separately**: `37/37 noticed — 31 by the named probe, 6 by the corpus` |
| **all four** new `SELF` entries in `check-markdown` passed by CRASHING | `base` was created only when the fixture was **not** inherited, and a `SELF` child always inherits one. This item's own fix #4 let SELF children reach META for the first time; they died on `ENOENT .meta-00.mjs`. **The control proves it**: an unmutated self-test run as a SELF child reports `37/37 probes caught`, reaches META, exits 1 | 0, four times | `base` created unconditionally; `SELF` additionally requires the child to have RUN |
| `ran:` keyed on the report HEADER | printed at line 584 of 599, so the guard covered the checks and **not the report or the exit path**. A mutant made to throw one line after it scored *noticed* | 0 | keyed on the **terminal line**, which also removes the `runs: 'spec'` exemption where a `SyntaxError` scored *noticed* |
| `SELF` graded `r.status !== 0` | the pre-W28 form one layer out: an entry could pass by making the file a **syntax error** | 0 | `SELF_RAN` — the child's own self-test must have run |
| `MIN_META = 5` against a 6-entry list | one grading could leave `check-policies` for exit 0, in the one file with no `SELF` list to catch it. **P9's declaration census recorded that list as 5 when it was 6** | 0 | 6 |
| **[Q143](../questions/q143.md)'s class was LIVE in a file this item owns** | the pre-existing multi-edit `SELF` entry anchors on `    if (mutated === original) {`, whose first occurrence is **its own literal** 100 lines above the guard. It edits itself and goes red for a reason its own name denies. **This falsifies Q143's own "Against" clause**, which this item wrote: *"W28 removed the whole class from its own files by construction"* | — | Q143 corrected in place; the class is recorded as live rather than eliminated |

**And two of the author's four `SELF` anchors were single-line**, against a header claiming *"EVERY
anchor below spans TWO LINES, and that is not style"*. They are saved by the other argument — `META`
sits above `SELF` — and the adequacy reader watched one silently match its own literal when a
neighbouring edit moved the target. The claim was wrong in the file that wrote the rule.

### What acting on the readers then produced, which neither found

**[Q144](../questions/q144.md) — a repair that was still fatal, visible only to the readers' own
fix.** `P3 disabled`'s first mutation crashed; the repair (`[].push`, chain intact) **also** crashed,
because `check-policies.mjs` ends with ``All checks passed — ${names.join(', ')}`` and that line is
reachable with `names === null` **exactly when the clause being disabled is disabled**. The
header-keyed `ran:` could not see it; the terminal-keyed one could. So that clause has no META entry
and cannot have one without changing a file this item does not own — and it is **the only known
instance of the case `ran:` exists for**, which leaves that guard live in three files and provoked in
none. On each ceiling list.

**[Q145](../questions/q145.md) — half of the noise class is closed and half is passed with a stated
verdict.** Input-specific noise is REFUSED. Global noise is `corpus`: it passes, because a mutant
that fails on the corpus turns the gate red, which is stronger than any probe — and five of
`check-markdown`'s six are slug-rule mutations that **cannot** be made inert. The adequacy reader's
own noise edit reproduces as `6/6 noticed — 5 by the named probe, 1 by the corpus` at **exit 0**.
**Reported rather than refused, and said plainly rather than claimed closed.**

### The readers' exact edits, checked back in and re-measured

`doc/workflow.md` rule 8 as amended by P6's retro. Two now refused, one survives with a verdict, and
**two of the six were the author's own bad probes rather than surviving holes** — which is this
rule's own founding observation landing on the verification of the fix.

| the reader's edit | was | now |
|---|---|---|
| a `SELF` mutation made a **syntax error** | 0 | **REFUSED**, exit 1 |
| `SELF` entry 0's mutate made a no-op comment edit | 0 | **REFUSED**, exit 1, `7/8 bounded` |
| a META mutation that disables nothing and only adds noise | 0 | **survives at exit 0, labelled**: `5 by the named probe, 1 by the corpus` — [Q145](../questions/q145.md) |
| a mutant made to throw **after** the report header | 0 | survives — **the author's probe was wrong**: it replaced a mutation whose own entry is graded by a different clause. The class is closed by the terminal-line `RAN`, measured directly |
| one META entry deleted from `check-policies` | 0 | **the author's probe renamed an entry rather than deleting one**, so the list stayed 6 long. `MIN_META = 6` is the fix and is verified by count |
| the probe reference weakened from `===` to `includes` | 0 | **0, and behaviour-preserving**: no probe name in any of the three files is a substring of another. Labelled, not fixed |

### Cost, re-measured after the readers

| | before W28 | author pass | after the readers |
|---|---|---|---|
| `check:policies:selftest` | 6.5 s | 2.8 s | **2.7 s** |
| `check:source:selftest` | 23.1 s | 21.5 s | **30.0 s** |
| `check:markdown:selftest` | 129.4 s | 65.1 s | **90.3 s** |

**The readers' fixes cost time and the direction is reported rather than buried**: an inertness run
per entry, and `SELF` children that now genuinely run `META` instead of dying. `check-markdown` is
still well under its 129.4 s baseline; `check-source` is above its own. **The correctness was worth
more than the second saving**, which is a judgement this Record states rather than hides behind the
better number.

**Questions raised.** [Q143](../questions/q143.md) — a mutation anchor that quotes its target from above; [Q144](../questions/q144.md) — a clause whose own guarantee makes it unprobeable; [Q145](../questions/q145.md) — global noise passed as `corpus`. **All three of the reserved block are used**; **ADR 0034 is unused and is skipped**, as the
plan predicted for an item that changes a harness contract rather than an architecture.
[Q142](../questions/q142.md) is owned here and is **NOT closed**: the floors are retuned and green and
the two-sided window is unchanged, which is the verdict rather than a fix.
