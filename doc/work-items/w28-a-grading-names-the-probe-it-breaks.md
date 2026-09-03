# W28 — A grading names the probe it breaks

**Status:** **todo**
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
else went wrong*. [Q138](../open-questions.md) raised it from two directions in one item; P9's
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
reason [Q133](../open-questions.md) and [Q138](../open-questions.md) are one item and not two.

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
   [Q138](../open-questions.md)'s own *"against"* argument — *"an entry whose probe is renamed then
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
- **[Q134](../open-questions.md)** — whether `S11`'s membership clause should be retired. A clause
  boundary question, not a grading one.
- **Deriving `M3`/`M4`/`M5`'s bounds from the tree.** [Q142](../open-questions.md) is owned here, but
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
[Q98](../open-questions.md) — and are never added.)*

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

*Filled in when the item is done. Delete the italic lines.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L0 own coverage | | |
| L1-L6 regression | | must not move |
| conformity reader | | what it found |
| adequacy reader | | mutations run, survivors |
| re-run at `<sha>` | | |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| `probe:` on every META entry | | |
| the child runs only the named probe | | |
| the two-half grading (caught clean, uncaught mutated) | | |
| the abort on a named probe that does not exist | | |
| a `SELF` entry proving the naming is load-bearing | | |
| the cost, measured on both sides | | |

**The gradings that went red, and what each one was.** *One row per entry whose named probe did not
fail — hole in the probes, or mislabelled entry. At least seven are predicted.*

| entry | named probe | verdict |
|---|---|---|

**What broke.**

**What this taught.**

**Questions raised.** *From Q142-Q145; unused ids are skipped and never reissued.*
