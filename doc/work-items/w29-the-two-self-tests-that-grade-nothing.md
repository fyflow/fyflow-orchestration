# W29 — The two self-tests that grade nothing

**Status:** **done** - 2026-09-04
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
Outputs:    a META pass for check-docs (X1-X5, at id level with the cap stated) and one
            for check-scheduler (every clause), both in W28's named-probe form, each with
            a MIN_META floor and a MIN_PROBES floor; the report-row `agree` projection in
            both, without which `disagreed` can never fire; a probe that drives D5's
            empty-parse branch, closing Q141, and two more on the same override for D5's
            other two unprobed clauses; the input overrides those probes need
            (CHECK_SCHEDULER_DTS, CHECK_{DOCS,SCHEDULER}_SCRIPT, CHECK_{DOCS,SCHEDULER}_PROBE);
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

## What the declaration step measured, and what it changed

**This item was declared before [W28](w28-a-grading-names-the-probe-it-breaks.md) built the contract,
and W28's two readers then changed that contract substantially — so the paragraphs above are corrected
here in place rather than rewritten.** Fifteen plans and items have measured a load-bearing fact
before declaring; this is the fifteenth, and it changed the item's **size**, its **cost model** and
**two of its five `Out` rows**. Measured at `9dc03ed`, Node 24.20.0, tree clean and restored after
every probe.

| | what was written | what one command says |
|---|---|---|
| **the cost model** | *"~450 s under today's contract and **~46 s** under this one"* | **~46 s is wrong and optimistic by 2.3x.** That figure is `4.4 s × 10` — **one** check run per entry. W28's readers added an **inertness run**, so an entry is **two** full check runs. Measured: a bare `check-docs` run is **3.72 s / 3.80 s**, and one META entry costs **~7.0 s** (inertness 3.6 s + named probe 3.4 s). Ten entries is **~70 s**, and full clause coverage — 13 distinguishable clauses — is **~108 s** |
| **the baselines** | `check-docs` 45.3 s, `check-scheduler` 2.0 s (P9's census) | **50.1 s / 46.1 s** and **1.30 s / 1.39 s**. A pair each, ratio 1.09 on the expensive one. The census figures sit inside the docs band and **above** the scheduler one; *absolutes are not constants* holds in both directions |
| [Q141](../open-questions.md) | `D5`'s empty-parse clause is inert for 0 failures | **Confirmed, reproduced exactly.** `if (expected.length === 0 && …)` → `if (false)`: the mutant exits **0 on the clean tree** and the self-test reports **12/12 probes caught, exit 0** |
| **the `corpus` split** | expected — *"some `check-docs` mutations will be non-inert (X5's DOM-lib clause, X4's floor)"* | **FALSE for `check-docs`.** All **13** candidate clause mutations are **inert**, X5's and X4's included, and all 13 have a named probe that goes **uncaught**. There is no split to report. Predicted from the shape of the clause; measured to the contrary |
| **the report block** | not mentioned | **A hole, live in BOTH files, and neither has the `agree` clause `check-source` and `check-markdown` carry.** Deleting a row from the `checks` array, and making the report loop print `ok` for every row, are **invisible to every probe**: `wanted [D3] got [D3] exit 1` in `check-scheduler` and `wanted [X2] got [X2] exit 1` in `check-docs`. [Q100](../open-questions.md)'s class, and in `check-scheduler` it erases the **`NOT RUN`** state `doc/workflow.md` section 1 rule 4 exists for |
| the `ALL_CHECKS` allowlist | *"P9's declaration tested it and it is inert"* | **Confirmed independently.** Renaming a reported id to one outside the list is **caught** in both files — `wanted [D3] got []` and `wanted [X2] got [X4]`. **Left alone**, as this item's `Out` list asks; the three probes added below all report under `D5`, which the list already names, so the hazard does not go live here |
| the register's census | *"104 questions - 69 open, 2 deferred, 33 resolved"* | **CONFIRMED**, by a parser that aborts on any row it cannot classify. 99 live row starts + 33 resolved, 28 ids in both tables, **104 distinct — 69 / 2 / 33**. It **aborted on Q119 and Q71** ([Q131](../open-questions.md)), hand-classified as `open` / `no owner` from the cells the unescaped pipes shift right. **It did not abort on Q87** ([Q135](../open-questions.md)) and did not merge it either: gathering a row from its `\| Qn \|` line to the next boundary reads its status through two blank lines correctly. *A parser that GATHERS correctly never meets the hazard a parser that only SPLITS meets* |

**And a finding the survey produced that nobody had written down: four `check-docs` clauses, made
inert, are noticed by a DIFFERENT clause — and an exit code would call that a detection.** With the
near-fence refusal (`X1`), the no-snippets vacuity guard (`X1`), the untagged-block refusal (`X2`) or
the retag refusal (`X2`) made inert, the run still **fails** — under **`X4`**, because each of those
mutations removes a snippet from the extract and `RUN_FLOOR` fires. The named-probe grading calls this
`disappeared` and is right; a `r.status !== 0` grading would call it *noticed* and be wrong about
**which clause is still checking**. **That is P9's own question answered four times inside one file**,
and it is why [Q102](../open-questions.md)'s ratchet is more load-bearing than its row records: it is
the fallback detector for four clauses that are not its own.

**The cost decision, taken against a stated criterion rather than a feeling.** ~7.0 s an entry is not
reducible under this contract — the inertness run and the probe run are two different inputs to the
same check — so coverage is bought per second, and the two files are **two orders of magnitude apart**
in what a second buys:

| | a run | an entry | coverage taken | added |
|---|---|---|---|---|
| `check-scheduler` | **0.13 s** | ~0.5 s | **every clause**, including three that have no probe today | ~8 s |
| `check-docs` | **3.75 s** | ~7.0 s | **one entry per check id**, plus the two report clauses | ~50 s |

**`check-docs`' cap is STATED rather than silent** — P9 decision 3's requirement — and the eight
clauses it leaves ungraded are listed in the Record and carried into the exit artifact as *no
grading*, not omitted from it. Taking all thirteen would put `check:docs:selftest` at **~155 s** and
the gate at **~310 s**, which reverses W28's saving and takes self-tests from 82% back above 88%;
that trade belongs to [Q133](../open-questions.md) and to P9's retro, with the number this item
measures, rather than to an item spending it unremarked.

## Scope

**In**

1. **A META pass for `check-docs`**, covering `X1`-`X5` at **id level** — one entry per check id, the
   cap stated above and the ungraded sub-clauses named — plus **two entries for the report block**.
   Every entry names the probe it must break, and the grading asserts that probe was caught clean and
   uncaught mutated.
2. **A META pass for `check-scheduler`**, covering **every clause**, the same way, because a run there
   is 0.13 s.
2a. **The report-row `agree` clause in both files**, without which the `disagreed` outcome can never
   fire and the two report defects measured above stay invisible. A second, independent projection of
   the same fact — `check-source`'s form, and the mechanism [Q100](../open-questions.md) named.
3. **`MIN_META` floors on both**, because `noticed === META.length` is **vacuously true at zero** —
   W16's adequacy reader's finding on `check-policies`, inherited rather than rediscovered.
4. **[Q141](../open-questions.md) closed**: a probe that drives `D5`'s empty-parse branch, and the
   input override it needs on `scripts/check-scheduler.mjs` — on the pattern of `CHECK_SOURCE_PKG`,
   which is how `check-source`'s probes reach a manifest without editing the real one.
   **And two more probes on the SAME override**, because the survey found `D5`'s other two clauses —
   *the `.d.ts` is unreadable* and *the artifact is missing value exports its own declarations name* —
   are unprobed for exactly the reason `D5`'s empty-parse clause was: **no probe can reach the
   `.d.ts`**. One override, three clauses; taking one and leaving two would be building the mechanism
   and then declining to use it. All three fixtures are hand-written.
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
  reference's snippet count, not a grading, and it is untouched. **Ruled on rather than passed over,
  because this item is the first to own the file since Q102 was raised**: the survey above found it is
  **not only a ratchet** — it is what actually reports when four *other* clauses go inert, so a stale
  `RUN_FLOOR` would take those four from *failing under the wrong id* to *not failing at all*. The
  gradings do not depend on it (each is `disappeared` on its own declared id either way, measured),
  so **raising, deriving or owning it is still not this item's work** — but Q102's row understates
  what it holds up, and the Record says so.
- **The exit-3 ABORT's redundancy.** W28's adequacy reader measured that disabling it costs 0, because
  a child that aborts prints no `ran:` line and fails that way instead — *two verdicts and a message*.
  **Both new files carry it anyway, for the message**, and this is recorded as a second occurrence of
  that measurement rather than as a new finding. A dangling probe name is the failure this contract
  introduces on purpose, and *"no probe is named X"* is what a reader needs to fix it.
- **A `SELF` list, and therefore a CHECKED-IN provocation of `ran:`.** [Q144](../open-questions.md)
  records that `ran:` is live in three files and provoked in none, and the case it wants —
  *inert on the clean tree, FATAL under the probe* — **is constructible in `check-docs`** and is
  demonstrated in the Record. It is demonstrated as a **`doc/workflow.md` rule 8 provocation**, which
  that rule explicitly says is *"an edit precise enough to re-run"* rather than a checked-in probe,
  **because the checked-in form is a `SELF` entry and `SELF` is out of this item's scope** — and
  [W31](w31-the-self-list-check-policies-never-had.md) is narrowed to `check-policies`, so no declared
  item picks these two files up. **Named as a gap with an address**, not closed.
- **[Q145](../open-questions.md)'s `corpus` split.** The contract counts a non-inert mutant separately
  and passes it. **There is nothing to report here**: all 13 `check-docs` candidates and every
  `check-scheduler` one measured **inert**, so this item's summary lines should read `N/N noticed`
  with no corpus term. **If one appears, it is reported rather than engineered away** — but the
  prediction, written before the entries exist, is that none will.

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

**COMPLETE — 2026-09-04.** Author pass, both readers, and rule 8's re-run after acting on them.
**Overlap between the two readers: 1** — the `check-docs` clause-count undercount, which the
conformity reader found first and the adequacy reader then found independently and labelled as an
overlap rather than as its own finding. That is the **twelfth** measurement of section 6's overlap
question and it sits at the bottom of the settled 1-4 band.

**The readers found 7 and 19, six of them blocking, and every blocking one was verified by the author
before being acted on.** Their subjects barely touched: the conformity reader found **claims that were
false** — an undercounted cap in five documents, a falsifiability sentence that measurement
contradicted — and the adequacy reader found **guards that were not there** — the `NOT RUN` machinery,
the exit code, the content of both `META` lists, and a loop bound inside the check itself. **Neither
half is redundant** and this is the clearest instance of that this repository has produced: the
conformity reader's finding *created* the mechanism (the failure-count discriminator) that the
adequacy reader's re-run then exercised.

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L0 own coverage | **RAN, green** | `check:scheduler:selftest` **20 probes / 22 gradings** — 20 by the named probe, 1 by the failure count, 1 masked — exit 0. `check:docs:selftest` **14 probes / 8 gradings**, exit 0 |
| L1-L6 regression | **RAN, unmoved** | `npm run gate` **exit 0, zero FAIL lines**, 302 s wall over its 18 entries. **474 `test()` cases in 19 files** across node 24.20.0, deno 2.9.6 and chromium; **489 assertions, 23 row labels, 25 real runs** at L6 in node and deno. Every figure derived from the run's own log, not carried forward |
| rule 8's four obligations | **RAN** | **29 provocations — 14 refused, 15 survive**, and both provenance probes are among them, one on each side. Plus **two positive tests the set structurally could not reach**, below |
| conformity reader | **RAN** | **7 findings, 2 BLOCKING**, both verified independently before acting. It also confirmed Q141 from both sides, the fixtures' provenance, `CHECK_SCHEDULER_DTS`'s inertness when unset, the `Owns` audit at zero exceptions, and re-derived the census with its own aborting parser |
| adequacy reader | **RAN** | **42 mutations, 53 runs, 17 survivors — 12 new, 4 BLOCKING**, in an isolated copy verified green at exit 0 with zero symlinks and zero reparse points. It **re-baselined mid-run** when the conformity fixes landed and re-ran every survivor against the newer state. It gave a second independent route for every survivor and labelled 4 vacuous or behaviour-preserving rather than counting them |
| re-run after acting on the readers | **RAN** | 11 of the readers' exact edits checked back in. **7 now REFUSED**, 4 still survive with a stated verdict. The re-run also caught a defect the fixes introduced — below |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| a META pass for `check-docs` (`X1`-`X5` at id level, cap stated) | **yes — 8 gradings** | everything: the file graded nothing before. Ignoring `CHECK_DOCS_SCRIPT` costs **7 of 7** |
| a META pass for `check-scheduler` (every clause) | **yes — 22 gradings**, one per `fail()` site (18) plus one per way the report can lie (3), plus the exit path | ignoring `CHECK_SCHEDULER_SCRIPT` costs **19**; ignoring `CHECK_SCHEDULER_PROBE` costs **21** |
| `MIN_META` on both, and `MIN_PROBES` where there was none | **yes** | deleting one META entry costs **1** in each file. `check-docs` had **no probe floor at all**; `check-scheduler`'s rose 12 -> 20. **And both lists are now bounded by CONTENT as well** — a duplicate entry costs 1 in each, which the floors could not see |
| the report-row `agree` projection in both | **yes** | dropping the `agree` term costs **2** in `check-scheduler` and **1** in `check-docs`. **It covered only the FAIL third of the report** — the adequacy reader found `ok` and `NOT RUN` matched and discarded — so a per-probe `notRun` declaration now covers the rest, at **3** |
| the `D5` probes and `CHECK_SCHEDULER_DTS` — [Q141](../open-questions.md) | **yes — three probes, one override** | removing the override from the check costs **3 probes**. Reading the fixture from `node_modules` instead of hand-writing it costs **1** |
| the ABORT, the inertness run, `ran:`, the named `probe:` | **yes** | ignoring `probe:` and running `PROBES[0]` regardless costs **16**. **The ABORT fired in the wild** on the author's own probe rename, during the fix step |
| **the ambiguous-anchor guard** — not declared, added | **yes** | an anchor matching 3 times is refused by name. **Extended after the adequacy reader**: a GLOBAL regex satisfied the first form (one pass edits all six matches, the second pass changes nothing), so the mutation is also applied to the source concatenated with itself. Costs **1** |
| the cost, measured on both sides | **yes** | below, as pairs with a control |

**Cost.** Pairs, never a single figure, with `check:source:selftest` as an **unchanged control**.

| | before | after | |
|---|---|---|---|
| `check:scheduler:selftest` | 1.30 / 1.39 s | **7.3 / 7.7 s** | 21 gradings at ~0.3 s |
| `check:docs:selftest` | 50.1 / 46.1 s | **143.9 / 106.6 s** | 7 gradings, timed individually at **6.9-7.4 s**, **49.7 s total** |
| `check:source:selftest` — **the control** | 30.0 s (W28's) | **30.9 / 30.2 s** | flat, so the machine is not the explanation |

**The best after-run decomposes exactly**: 106.6 = ~50 s of probes + 49.7 s of META + overhead. The
143.9 s run carries ~37 s of variance on top, and the control cannot speak to it because the control
runs **no `tsc`** while `check-docs` runs it twice per check invocation. **Report the range and the
decomposition, not the mean.**

**What each clause cost when made inert.** Every candidate was measured **before** the entries were
written, which is how the cap was chosen; *cost now* is what the shipped list charges.

| clause | cost then | cost now |
|---|---|---|
| `D5` empty-parse — [Q141](../open-questions.md) | **0 of 12, exit 0** | refused |
| `D5` unreadable / `D5` missing value exports | **no probe could reach either** | refused / refused |
| `D1` unreadable manifest, `D2` unreadable manifest, `D3` unreadable map | **no probe** | refused, refused, **masked** ([Q146](../open-questions.md)) |
| the other 12 `D` clauses | unknown — nothing asked | refused |
| `check-scheduler`'s report block, 3 ways | **0, every probe green** | refused |
| `X1` near-fence, `X2` untagged, `X3` tsc, `X4a` no-throw, `X5` DOM count | **0, nothing graded them** | refused |
| `check-docs`' report block, 2 ways | **0, every probe green** | refused |
| the six `check-docs` clauses left out | 0 | **still 0 — stated, not hidden**, and each is buildable at ~7 s |

**What broke.**

1. **Two gradings went red on the first run, and neither verdict W28's contract admits was the right
   one.** `D2`'s and `D5`'s unreadable-input clauses came back **STILL CAUGHT**. Triage — measured,
   not reasoned — found the same mechanism under each: **a sibling clause reporting the same id fires
   in the disabled clause's place**, so the id set is unchanged. `D5`'s is the sharper one because
   the handover is *by design*: the empty-parse clause's `!failures.some(f => f.startsWith('D5'))`
   guard exists so the two do not both report, and that guard is what makes the second step forward.
   **Relabelling them was not available** and dropping them would have put two clauses in the exit
   artifact as *no grading* when what happens to them is known exactly, so they **declare the
   masking** and go red if it ever changes. [Q146](../open-questions.md).
2. **The cost model was wrong by 2.3x and it changed the item's size.** [Q148](../open-questions.md).
3. **A tooling failure of the author's own, recorded because it wasted about an hour.**
   `node -e "await new Promise(r => setTimeout(r, 60000))"` is a **CommonJS syntax error** — top-level
   `await` needs `--input-type=module` — and it was written inside `|| true`, so a wait loop that
   looked like it was polling for thirty minutes spun through thirty iterations instantly and
   reported *"still 3 of 8"* four times over. **The failure and the swallowing were separate
   mistakes**; either alone would have been visible.

**Two positive tests the rule 8 set structurally could not reach**, because both guards are refused
*by absence*: the set can only show that disabling them costs 0, and 0 is the honest answer when
nothing in the tree triggers them.

- **[Q144](../open-questions.md)'s missing case, CONSTRUCTED — the first demonstration that `ran:`
  fires.** That row records the guard as live in three files and **provoked in none**. The case it
  wants is *inert on the clean tree, FATAL under the probe*, and `check-docs` has one: inside `X4`'s
  execution loop, entered only when a `run` snippet exits non-zero. With `const err = r.stderr…`
  replaced by a dereference of a property that is not there, the mutant is **inert (exit 0) on the
  untouched reference** and **throws** under the probe that inverts an assertion. Measured:
  `ran: no` with the guard live; **`ran: yes`, `outcome: disappeared`** with it forced true — the
  identical crash graded as a detection. **The outcome is `disappeared` in both cases**, so `ran:` is
  the only thing that discriminates. Recorded as a rule 8 provocation, which that rule says is *"an
  edit precise enough to re-run"*; the checked-in form is a `SELF` entry and `SELF` is out of scope.
- **The ambiguous-anchor guard fires.** `fail('D1', ` occurs **three** times in `check-scheduler.mjs`;
  a META entry anchored on it is refused by name — *"the mutation matched MORE THAN ONCE, so it
  landed on the first of several and the entry does not say which"* — at exit 1, `21/22 graded`.

**Rule 8's four obligations — 29 provocations, 14 refused and 15 survivors.** The survivors are not a
surprise and they are not evenly distributed: **eleven of the fifteen are the ceiling**, and the
ceiling is wider in these two files than in `check-source` for one reason that was named before the
set was run — **neither file has a `SELF` list**, so nothing bounds `PROBES` or `META` from one list
further out. In `check-source` the floors, the verdict and the `refused` expression are all caught by
`SELF`; here they survive. [W31](w31-the-self-list-check-policies-never-had.md) is narrowed to
`check-policies`, so **no declared item picks these two files up**.

| obligation | refused | survived |
|---|---|---|
| the rule's clauses | `agree` dropped (2 / 1); the MASKED branch removed (2) | STILL CAUGHT accepted; `ran:` forced true; inertness forced true; the ABORT reduced to an ordinary failure; the matched-nothing guard; the matched-more-than-once guard; the final verdict forced to 0; MASKED accepted whatever the child reports |
| the `Outputs` rows | `CHECK_*_SCRIPT` ignored (19 / 7); `CHECK_*_PROBE` ignored (21 / 7); `CHECK_SCHEDULER_DTS` removed (3); `probe:` ignored (16) | — **every declared output is load-bearing** |
| **provenance** | the `D5` fixture read from `node_modules` instead of hand-written (**1**) | `tripped` re-sourced from the report rows (**0**) — [Q147](../open-questions.md) |
| **loop bounds** | one META entry out (1 / 1); the whole META list out (1); one probe out (1) | a floor dropped to 0 *together with* shortening its list, both files |

**Three of those deserve naming rather than counting.**

- **The exit-3 ABORT is redundant for detection, at cost 0 — a second occurrence** of what W28's
  adequacy reader measured. Both files keep it **for the message**: an aborting child prints no `ran:`
  line and fails that way regardless, so what the branch buys is *"no probe is named X"* instead of
  *"the mutant did not run"*. Two verdicts and a message, confirmed twice now.
- **`tripped` re-sourced to the report rows costs 0, and it is a real provenance hole** rather than a
  vacuous probe. It makes `agree` compare a value with itself, and the three report entries then pass
  as `disappeared` instead of `disagreed` — **the right verdict by the wrong route**.
  [Q147](../open-questions.md), and it is [Q138](../open-questions.md)'s own shape one layer further
  in: W28 replaced *some probe noticed* with *this probe noticed*, and what is still unasserted is
  *this probe noticed in the way the entry claims*.
- **`MASKED accepted whatever the child reports` survives**, which means the masking claim this item
  introduced is **unfalsifiable from inside its own file**. It is the same ceiling as *STILL CAUGHT
  accepted*, not a new kind of hole — but it is fair to say that the `masked` verdict **enlarges the
  ceiling surface** rather than only adding coverage, and a `SELF` list is what would close it.

**What this taught.**

- **A set-equality grading on ids cannot see a clause whose sibling reports the same id**, and this
  repository had no name for that. `doc/workflow.md` rule 7 (c) settled that naming *one* check does
  not discriminate, because a malformed probe trips two; the limit found here is the mirror image —
  **two clauses that both trip the right one are indistinguishable**, and the discriminating signal
  (the failure *count*, printed as `(2)` versus `(1)`) is right there in the report and unread.
- **The declaration step's measurement changed this item's SIZE, not just its table.** ~7.0 s an
  entry against ~0.5 s is two orders of magnitude, and it turned *"a META pass for X1-X5 and
  D1-D5"* into *every clause here, seven there, and the cap written into the file*. Fifteen plans and
  items have measured first; this is the first time the measurement decided **how much** to build
  rather than **what was true**.
- **A prediction in the prompt was wrong and measuring it first is what caught it.** The expected
  `corpus` split — *"X5's DOM-lib clause and X4's floor will be non-inert"* — is **false**: all 13
  `check-docs` candidates and every `check-scheduler` one are inert, so both summary lines read
  `N/N` with no corpus term. [Q145](../open-questions.md) has nothing to report here.
- **Four `check-docs` clauses are noticed under a different id.** The run fails; it fails for the
  wrong reason, and `RUN_FLOOR` is what does the noticing — [Q102](../open-questions.md)'s ratchet
  holding up four clauses that are not its own. **This is P9's own question answered four times
  inside one file**, and it is the clearest argument the plan has produced for why an exit code is
  not a grading.

### What the readers changed, and the shape of it

**The conformity reader's two blocking findings, both confirmed by the author first.**

| finding | what it was | now |
|---|---|---|
| **the stated cap undercounted, in five documents** | the header named **six** ungraded `check-docs` clauses. The real census is **14 `fail()` sites + 3 report ways = 17**, 7 graded, **ten** ungraded — and two were named nowhere: the *snippet-does-not-run* clause (buildable, `outcome: exit0`) and the *missing-document* clause, which is ungraded **and unprobed** because every probe writes its reference to disk. **P9 decision 3 requires the cap be stated *because a silent cap reads as coverage*; a stated cap that undercounts reads exactly the same way** | corrected in all five, with the unprobed one called out as a different kind |
| **the `masked` verdict's justification was FALSE** | the entry claimed it goes red *"if the guard is removed"*. Deleting `D5`'s fallthrough guard left the file at **18/18, 21/21, exit 0** — a **third** instance of [Q146](../open-questions.md)'s own class, inside the mechanism written to describe it | the failure **COUNT** discriminator Q146 proposed and this item had declined. The reader's edit now costs **1** |

**And fixing it falsified the item's OTHER masking claim, which is the better half.** With counts
available, `D2`'s unreadable-manifest clause is **co-firing, not masking**: both it and the
devDependency clause report under `D2`, so disabling one moves the count **2 → 1** and the clause is
detected after all. Only `D5` is genuine — same id **and** same count, because its guard exists so the
two never both report. **`caught` stopped being a terminal verdict**: it now triggers a baseline run
against the unmutated check, and the file reads **`22/22 graded — 20 by the named probe, 1 by the
failure COUNT, 1 masked`**.

**The adequacy reader's four blocking survivors, all confirmed by the author first, all closed.**

| survivor | cost then | second route it gave | cost now |
|---|---|---|---|
| the `ran` map forced to all-true — **`NOT RUN` becomes `ok`** | 0 | with the installed manifest unreadable, the mutant prints `ok` for **three checks that never executed** — W5's original finding, and section 1 rule 4's whole subject | **3**, via a per-probe `notRun` declaration |
| the `r.status !== 0` term dropped from `refused`, **both files** | 0 | remove *only* `process.exit(1)`: with the term present that costs `0/18`, without it the file is green — the check finds every failure, prints every failure, and tells the shell it is fine | **1** each, via a META entry for the exit path **alone** |
| both `META` lists bounded by **count, never content** | 0 | an entry replaced by a **duplicate** of another: floor satisfied, total unmoved, one clause silently ungraded | **1** each, via distinctness **and** per-id coverage derived from the check |
| `D4`'s artifact list cut from three entries to one | 0 | delete `dist/browser/index.js` and the honest check fails; the mutant passes | **2**, via two new artifact probes |

**Three of the reader's non-blocking findings were also acted on**: an entry's anchor made a **global**
regex disabled six clauses while naming one (now **1**, via applying the mutation to the source
concatenated with itself); the `check-scheduler.mjs` comment saying the package exports *"nine"*
values, which is **ten**; and the type-only fixture's name, which claimed to test a code path that is
**dead** — `check-scheduler.mjs:191`'s `|| /^\s*export\s+type/` disjunct can never be true.

**Four survive with a stated verdict**, and all four are the ceiling rather than holes with fixes:
`caught++` forced unconditional (the **probe-pass** verdict — a separate expression from the META one
the ceiling list already named); the `byMask`/`byCount` tallies dropped from the summary (**the exit
artifact itself is unasserted**, [Q100](../open-questions.md)'s class in this item's own deliverable);
the type-only fixture replaced by garbage (the clause fires on *nothing parsed* and any garbage
satisfies it — the **name** was the defect, and it is fixed); and a `masked` entry naming a sibling
that does not exist. **That last one is half-closed and the honest statement is the split**: the
grading now verifies **that** a sibling stepped in — same id, same count, **different message** — and
**cannot verify which**, because `maskedBy` is prose. The claim is checked; the citation is not.

### What the re-run then caught, which neither reader could

**`doc/workflow.md` rule 8 as amended by P6's retro, firing on its own procedure for the fifth time
across five items — and this time on a fix made minutes earlier.** Renaming the type-only probe (the
reader's finding #8) left the Q141 META entry pointing at a probe name that no longer existed, and the
next run came back:

```
FAIL  D5`s empty-parse clause disabled — Q141, the one that survived
      — ABORT  no probe is named "a declaration file that exports only TYPES, so the parse yields nothing"
```

**That is W28's deliberate failure mode firing in the wild, on the author, inside the fix step.** W28
argued for it as *"the same trade rule 7 (b) already took at the probe layer"* and predicted *"a probe
renamed for clarity turns a grading red"*; this is its first occurrence. **And it settles the ABORT's
redundancy question in the direction W28 chose**: the adequacy reader measured that disabling the
exit-3 branch costs **0**, because an aborting child prints no `ran:` line and fails that way anyway —
true, and what the branch actually bought here was *which probe, by name*, which made this a
ten-second fix rather than a hunt. **Two verdicts and a message, and the message is the product.**

**A second thing the re-run caught was the author's own process error**: the ceiling-list edit to
`check-docs-selftest.mjs` was made **while a mutation harness held that file**, and the harness's
`finally` restored a pre-edit snapshot over it. Nothing was lost that a `grep` did not find within a
minute, but it is the same hazard `doc/workflow.md` section 6 names for two readers on one tree,
arriving one level in: **a harness that restores files is a second writer.**

**Questions raised.** [Q146](../open-questions.md) — a clause masked by a sibling reporting the same
id; **corrected under measurement from two occurrences to one**, with the co-firing half split out and
made detectable, and the discriminator built for one grading in one file rather than for the contract.
[Q147](../open-questions.md) — an entry passes on any of **three** outcomes (not four; `fires` is a
sibling's verdict), so it can pass for a reason it does not name; the adequacy reader sharpened it with
a **direction**: re-sourcing `tripped` from the rows costs 0, the reverse costs 2, because `agree` is
only consulted after `tripped` has been compared to `declared`. [Q148](../open-questions.md) — a META
entry is two check runs, and the obvious mitigation for [Q133](../open-questions.md) is unsafe today
because `check:scheduler:selftest` moves `node_modules/fyflow-scheduler` aside while an `AGENTS.md`
snippet imports it. **All three of the reserved block are used. ADR 0035 is unused and is skipped**,
as the plan predicted for an item that changes a harness rather than an architecture.
**[Q141](../open-questions.md) is RESOLVED.**

### Cost, re-measured after the readers

| | before W29 | author pass | after the readers |
|---|---|---|---|
| `check:scheduler:selftest` | 1.30 / 1.39 s | 7.3 / 7.7 s | **8.4 / 8.2 s** |
| `check:docs:selftest` | 50.1 / 46.1 s | 143.9 / 106.6 s | **128.0 / 123.6 s** |
| `check:source:selftest` — **the control** | 30.0 s (W28's) | 30.9 / 30.2 s | **30.7 / 30.0 s** |

**The control is flat across all three measurements**, which is what lets the other two rows be read
as work rather than weather. The readers' fixes cost `check-scheduler` about 0.8 s — two more probes,
a baseline run for the one `caught` entry, and two more gradings — and left `check-docs` inside its
author-pass band. **The direction is reported rather than buried**: correctness was bought with time,
as it was in W28.

**`Owns` audit.** `git diff --name-only` against the block above: `scripts/check-scheduler.mjs`,
`scripts/check-scheduler-selftest.mjs`, `scripts/check-docs-selftest.mjs` — all owned.
**`scripts/check-docs.mjs` is owned and was NOT edited**, which is worth stating rather than leaving
to inference: the META pass needs an override in the *self-test*, not in the check, because
`CHECK_DOCS_DOC` already existed and `--self-test` already dispatches before the checks run.
Everything else is `doc/workflow.md` section 1 rule 5's record step. **Zero late exceptions.**

**And one correction made inside the record step, declared rather than slipped in.** `README.md`'s
check table said `check:source:selftest` runs *"3 of the probe list itself"*; `MIN_SELF` is **7** and
has been since [W28](w28-a-grading-names-the-probe-it-breaks.md) added four `SELF` entries without
raising the sentence. **That is `doc/` is checked by nothing, in the front-door document, one item
after the change that made it false** — the same shape as [Q102](../open-questions.md)'s ratchet and
the same shape as this repository's standing complaint. Corrected in place with the reason beside it,
and rows added for the two self-tests this item changed.

**And one stale claim NOTICED AND NOT FIXED, recorded so it is visible rather than silently carried.**
`README.md`'s *What is here* table still says ladder L6 is *"**twenty-one** real runs"*; it has been
**25** since [W23](w23-a-nested-flow-on-real-workers.md), and this item's own gate log derives 25 from
the run. **It is not corrected here** because it belongs to whoever owns `examples/**` and because a
record-step grant is for recording *this* item, not for sweeping the document — but leaving it
unmentioned would be the failure this repository keeps naming. **Two stale counts in one table, found
by an item that was not looking for either**, which is [Q100](../open-questions.md)'s class in the one
file the gate carries nothing to.
