# W29 — The two self-tests that grade nothing

**Status:** **todo**
**Plan:** [P9](../plans/p9-when-a-check-stops-checking-what-notices.md)

```
Spec:       none - this item defines it. The X-ids and D-ids are check-docs.mjs's and
            check-scheduler.mjs's own vocabulary and no spec/ document names them
Owns:       scripts/check-docs-selftest.mjs       (W9)
            scripts/check-scheduler-selftest.mjs  (W5)
            scripts/check-scheduler.mjs           (W5)
            scripts/check-docs.mjs                (W9)
Inputs:     the two files' PROBES lists, and the two checks' own clauses. The `.d.ts` a
            D5 probe needs is a FIXTURE written by hand from ADR 0029's surface claim,
            never captured from the installed package - `doc/workflow.md` section 5 rule 4
Outputs:    a META pass for check-docs (X1-X5) and one for check-scheduler (D1-D5), both
            in W28's named-probe form, each with a MIN_META floor; a probe that drives
            D5's empty-parse branch, closing Q141; the input override that probe needs;
            and the measured cost of both self-tests on both sides
Depends on: W28 - the contract, and the reason this item is cheap rather than expensive
Blocks:     nothing
Tests:      the new gradings. Expected values come from each clause's own text in the
            check, never from running a mutant and recording which probe reacted
Gate:       L0 (own coverage), L1-L6 as regression and MUST NOT MOVE, then two readers
Reserves:   Q146-Q148, ADR 0035
```

## Why this item exists

**Two of the five self-tests grade nothing at all, and nobody had written that down.** Measured at
[P9](../plans/p9-when-a-check-stops-checking-what-notices.md)'s declaration:

| self-test | probes | META | SELF | measured at `76bf5e6` |
|---|---|---|---|---|
| **`check-docs`** | 14 | **0** | **0** | 45.3 s |
| **`check-scheduler`** | 12 | **0** | **0** | 2.0 s |
| `check-policies` | 13 | 5 | **0** | 6.5 s |
| `check-source` | 24 | 20 | 3 | 23.1 s |
| `check-markdown` | 37 | 37 | 3 | 129.4 s |

`X1`-`X5` and `D1`-`D5` have probes asserting the check refuses a broken **input**, and **nothing
asserts the probes would notice a broken CHECK**. That is exactly the gap W16's adequacy reader opened
on `check-policies` — it disabled that script's verdict, its set-comparison and its matched-nothing
guard and watched all nine probes survive — and it is why every self-test written since has a META
pass. **These two predate the practice and never got one.**

**The yield is measured rather than assumed, and it is mixed.** Five clause-level mutations, each
making one clause **present but inert**:

| mutation | result |
|---|---|
| **`check-scheduler` `D5`'s empty-parse clause** | **SURVIVES** — 12/12 probes caught, exit 0 |
| `check-scheduler` `D4`'s exports-map clause | caught, 11/12 |
| `check-docs` `X5`'s DOM-lib clause | caught, 13/14 |
| `check-docs` `X4`'s `process.exit()` clause | caught, 13/14 |
| `check-docs` `X4`'s `if (false)` clause | caught, 13/14 |

**One in five, and the honest statement is the one the row makes**: without a META pass, whether a
probe would notice a clause going inert is **unknown** — not *would not*. Four of five are caught
because a probe drives the clause and the mutation removes its report. `D5`'s survivor is different in
kind: `scripts/check-scheduler.mjs:195` fires only when the `.d.ts` parse yields **nothing**, and no
probe supplies a `.d.ts` the parse cannot read. **A clause no probe drives is invisible to every probe
by construction**, and only a META pass asks the question. [Q141](../open-questions.md).

**And the reason this item is second rather than first is arithmetic.** A `check-docs` probe costs
**4.4 s**. Ten META entries under the pre-W28 contract — each re-running the whole 14-probe suite —
cost **~450 s**; under W28's named-probe contract, **~46 s**. Running this item first would put seven
and a half minutes into a gate that already spends 88% of its time on negative tests, and then take it
back out.

## Scope

**In**

1. **A META pass for `check-docs`**, covering `X1`-`X5`, in W28's form: every entry names the probe it
   must break, and the grading asserts that probe was caught clean and uncaught mutated.
2. **A META pass for `check-scheduler`**, covering `D1`-`D5`, the same way.
3. **`MIN_META` floors on both**, because `noticed === META.length` is **vacuously true at zero** —
   W16's adequacy reader's finding on `check-policies`, inherited rather than rediscovered.
4. **[Q141](../open-questions.md) closed**: a probe that drives `D5`'s empty-parse branch, and the
   input override it needs on `scripts/check-scheduler.mjs` — on the pattern of `CHECK_SOURCE_PKG`,
   which is how `check-source`'s probes reach a manifest without editing the real one.
5. **The cost of both self-tests measured on both sides**, reported as a pair of runs rather than a
   single figure, for the reason P9's declaration records.

**Out** — named rather than left implicit, with where it goes instead

- **Changing what `X1`-`X5` or `D1`-`D5` check.** Three register rows say these clauses check less
  than their names claim — [Q100](../open-questions.md), [Q101](../open-questions.md) and
  [Q104](../open-questions.md), the last of which is `X4a`'s *"any `throw` answers it"*. **This item
  gives them a grading and leaves what they check alone.** A grading that only passes once a clause is
  strengthened is this item having grown into a different one.
- **`SELF` passes.** Neither file has one, so nothing bounds their `PROBES` lists. P9 reserves **W31**
  and expects it unused; taking it here would put a fourth list in an item whose subject is the
  second.
- **`check-policies`' missing `SELF`**, for the same reason, and it is not in this item's `Owns`.
- **The `ALL_CHECKS` allowlist** in both files. P9's declaration **tested it and it is inert**:
  renaming a reported id to one outside each list was **caught** in `check-docs`, `check-scheduler`
  and `check-policies` alike, because every id those checks report is declared by some probe and the
  probe then sees an empty set. W24's hole needed **undeclared** ids in the list and these have zero.
  **Named here so a later item does not "fix" a non-problem**, and flagged as going live the moment
  either check gains a clause id no probe names — which is [W30](w30-the-clauses-nothing-probes.md)'s
  situation in a different file.
- **`check-docs`' `RUN_FLOOR`** — [Q102](../open-questions.md)'s ratchet. It is a floor on the
  reference's snippet count, not a grading, and it is untouched.

## The decision this item takes, and what it costs

**A clause no probe drives gets a probe, and the probe is a constructed case with no live defect
behind it.** `D5`'s empty-parse branch fires on an unparseable `.d.ts` from the installed scheduler —
an event this repository has never seen and cannot cause. **The fixture is hand-written from
[ADR 0029](../decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)'s
surface claim, not captured from `node_modules`**, because a fixture captured from the code under test
proves the code agrees with itself (`doc/workflow.md` section 5 rule 4).

**That is the second of the two verdicts [P8](../plans/p8-what-can-be-deleted-with-the-gate-green.md)'s
retro left open, and this item is its counter-case.** P8 proposed *a check written for a defect you
have just fixed has no live case, so its probes are the whole of its evidence*. `D5` is a check
written for a defect that **is** live — it survives today, measured — while
[W30](w30-the-clauses-nothing-probes.md)'s nine clauses are the other half. **P9 therefore has both
halves**, which is what P8's single item could not supply, and this item's Record should say which
half it turned out to be.

## Verification

**L0 — own coverage.** Each command named, not implied:

```bash
npm run check:docs:selftest       # 14 probes, then the new X1-X5 gradings
npm run check:scheduler:selftest  # 12 probes, then the new D1-D5 gradings
```

**The provocation that makes each new grading fail** (`doc/workflow.md` section 5 rule 7): for every
`X` and `D` clause, the `if (false)` that makes it inert, run against the self-test and recorded with
its cost. **`D5`'s is the one that costs 0 today** and is the item's own before-number.

**L1-L6 — regression, and the expected result is NO MOVEMENT:**

```bash
npm run gate                      # 18 entries, all exit 0
npm run test:l6                   # 23 row labels, 25 real runs, 489 assertions
```

Baseline at `76bf5e6`: **474 `test()` cases** in 19 files across Node 24.20.0, Deno 2.9.6 and
chromium; **489 assertions at L6** in Node and Deno. *(`npm run gate` runs `test:browser`, which is
**chromium only**. The two counts count different things — [Q98](../open-questions.md) — and are never
added.)*

**Rule 8's four obligations, on this item's own fix**, written before the readers report and **re-run
after acting on them**:

| obligation | what it means here |
|---|---|
| the rule's clauses | each new `X` and `D` grading, disabled one at a time; the `MIN_META` floors, set to 0 alone and together with an emptied list |
| the `Outputs` rows | every row of the table below, broken so it is **present but inert** |
| **provenance** | `D5`'s probe reading its `.d.ts` from the fixture rather than from `node_modules` — substitute the source expression and nothing else |
| **loop bounds** | both `META` lists: one entry out, the whole list out, and whether anything counts them from a source other than themselves |

**And the WIRING, because P9 predicts this item is where it does not fire.** This item adds **no**
`package.json` entry — both `:selftest` scripts already exist and `S11` already asserts each passes
`--self-test`. **That is the prediction to test**: if a grading can be added here that the gate then
does not run, `S11` has a hole and P8's proposed fifth obligation gains its second occurrence.

*Not applicable to this item: it touches no routing, so Q4, Q17, Q10, Q13 and Q6 are all outside it.*

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
| a META pass for `check-docs` (`X1`-`X5`) | | |
| a META pass for `check-scheduler` (`D1`-`D5`) | | |
| `MIN_META` on both | | |
| the `D5` probe and its input override — [Q141](../open-questions.md) | | |
| the cost, measured on both sides | | |

**What each clause cost when made inert.** *One row per `X` and `D` clause: before this item, and
after.*

| clause | cost then | cost now |
|---|---|---|

**What broke.**

**What this taught.**

**Questions raised.** *From Q146-Q148; unused ids are skipped and never reissued.*
