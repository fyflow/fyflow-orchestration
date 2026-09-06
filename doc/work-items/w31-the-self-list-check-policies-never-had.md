# W31 — The `SELF` list `check-policies` never had

**Status:** **done**
**Plan:** [P9](../plans/p9-when-a-check-stops-checking-what-notices.md)

```
Spec:       none - this item defines it. A self-test's list bounds are scripts/**'s own
            vocabulary and no spec/ document names them
Owns:       scripts/check-policies-selftest.mjs  (W16, then W28)
Inputs:     that file's own PROBES and META lists and the three verdicts W28 added to
            it. Nothing else; this item reads no src/, no spec/ and no document
Outputs:    a SELF list for check-policies-selftest.mjs with a MIN_SELF floor, entries
            that provoke each of the three W28 verdicts and the `ran:` guard, and the
            measured cost of check:policies:selftest on both sides
Depends on: W28 - the contract these entries provoke
Blocks:     nothing
Tests:      the SELF entries themselves. Expected values come from what each guard is
            for, never from running the file and recording what happened to fail
Gate:       L0 (own coverage), L1-L6 as regression and MUST NOT MOVE, then two readers
Reserves:   Q151-Q153
```

## Four corrections to this declaration, made before any of it was built

**This item was declared late and its `Reserves:` line, its gate-entry count and its baseline sha
were all inherited from the state at [W28](w28-a-grading-names-the-probe-it-breaks.md). Three were
wrong on arrival and a fourth was falsified by the first measurement.** Ten plans and items have
found a register or item row wrong by trying to act on it; this is the eleventh and it is in this
item's own file.

| | was | is |
|---|---|---|
| `Reserves:` | **Q146-Q148** | **Q151-Q153.** [W29](w29-the-two-self-tests-that-grade-nothing.md) reserved Q146-Q148 and **used all three**; [W30](w30-the-clauses-nothing-probes.md) took Q149-Q150. `doc/workflow.md` section 3: ids are never reused. **Nothing existing is renumbered** |
| the L1-L6 command | *"`npm run gate` # 18 entries"* | **19**, since W30 added `check:spec:selftest` |
| the baseline | *"Baseline at `de795ad`"* | `de795ad` is **W28's** sha. Re-baselined at **`6d536cd`** with W29's and W30's work in the tree, and every count below derived from a run rather than copied |
| *"one `META` entry deleted \| 0"* in the Record's table | **0** | **1.** `MIN_META = 6` **does** fire — one entry out and the whole list out both exit 1 today. What is unprovoked is the floor being **lowered**: `MIN_META -> 0` costs 0, and `MIN_META -> 0` together with an entry deleted costs 0 at **`5/5 noticed`, exit 0**. The bound exists and nothing re-runs it; the prefilled zero described a hole that is not there and missed the one that is |

## What the declaration step measured, before anything was built

**Sixteen plans and items have measured a load-bearing fact first and it changed what got written
every time. Seventeenth.** Every number below is from a run on `6d536cd`, one mutation at a time,
restored in a `finally`.

**W28's finding B6 REPRODUCES exactly — all three verdicts cost 0**, `13/13 probes caught`,
`6/6 noticed`, exit 0. That is what this item is for and it is confirmed rather than inherited.

**And five things nobody had measured:**

| | measured |
|---|---|
| `MIN_META` | **fires.** One entry out → exit 1; `META` emptied → exit 1. The Record's prefilled *"0"* was wrong. **`MIN_META -> 0` costs 0**, and `-> 0` **together with** an entry deleted costs 0 at `5/5 noticed`, exit 0 — the hole is the floor being **lowered**, not the list being shortened |
| `MIN_PROBES -> 0` **with `PROBES` emptied** | **REFUSED, exit 1** — every META entry then names a probe that is gone and **ABORTS**. This file's own header lists `MIN_PROBES -> 0` as one of four live holes; **W28's named-probe contract closed the compound case and the header still says it is open.** `MIN_META`'s compound is not closed, so the two floors are **asymmetric** and nothing said so |
| a META entry replaced by a **DUPLICATE** of another | **0** — `6/6 noticed`, exit 0, floor satisfied, total unmoved, and the exit-path clause silently ungraded. W29 found this in `check-scheduler` and named this file as structurally exposed; W30 measured it live in `check-source`. **It is live here** |
| one entry's anchor made **GLOBAL** — `/fail\('P3',/g` | **0** — `6/6 noticed`, exit 0, with **all six** `P3` sites disabled by an entry naming one. `check-policies.mjs` has `P3`×6, `P1`×2, `P2`×2 = **ten `fail()` sites**, the widest single-id surface of any check here |
| the `corpus` count today | **0.** All six mutants are inert (`inert: yes`, `ran: yes`) and the summary carries no corpus term. Forcing every grading to `corpus` reports **`6/6 noticed — 0 by the named probe, 6 by the corpus`** at exit 0 — [Q150](../open-questions.md), live here, and `MAX_CORPUS = 0` is therefore a **measured** bound rather than a guessed one |

**And the guard W28 had to REMOVE from this file is the one this item can provoke.** W28 deleted the
`names === null` META entry because its mutant crashes under its own probe
([Q144](../open-questions.md)) and a crash is not a detection. As a **`SELF`** entry that is exactly
right: adding it back, with the `ran:` guard live, reports
***"the mutant did not run: this is a crash, not a detection"*** at `6/7 noticed`, exit 1 — and
disabling **either half** of the guard (the parent's `!ran` branch, or the child's `RAN` producer)
takes it to `7/7`, exit 0. **This is the second demonstration anywhere that `ran:` fires**, after
W29 constructed one in `check-docs`; Q144's own row records the guard as live in several files and
provoked in none. *The mutation that could not be a `META` entry is the one that makes a `SELF` entry
for the crash guard possible.*

### The ride-alongs, ruled on individually

**Silence is not a ruling**, so each is named with the measurement behind it.

| | verdict |
|---|---|
| **`MAX_CORPUS`** ([Q150](../open-questions.md)) | **TAKEN**, at **0**, measured. W30 closed it in `check-spec-selftest.mjs` and left it live in the other four; this is one of the four |
| **the content / distinctness bound** | **TAKEN.** Measured live here at 0, above. It is a bound on what `META` **contains** rather than on how long it is, which is this item's own subject |
| **the GLOBAL-anchor guard** | **TAKEN**, with one declared `wide` exemption and `MAX_WIDE = 1` — the `P1 and P2 swapped` entry is a legitimate global rename over four sites. Measured live at 0, and six `P3` sites is the widest surface here. *(This row first said **`MAX_WIDE` is itself raisable for 0**, inheriting W30's own re-run finding about `check-source`. **Measured here and it is REFUSED**: the `SELF` entry that adds a second exemption goes green under `MAX_WIDE = 99`, so the file goes red. **A finding about a sibling file, carried across without measuring it.**)* |
| **the ambiguous-anchor guard** | **TAKEN, and it ships with NO live case, which is stated rather than hidden.** Measured: every singular anchor in this file's `META` occurs **exactly once** in `check-policies.mjs`. It is the other half of the same guard and shares its code path. **An eighteenth instance for P8's second proposed change**, and a stronger form of it — *a check written for a defect you just fixed has no live case*, except that here the defect was never there at all. Its entry had to be CONSTRUCTED: `fail('P1',` occurs twice, so a plain `.replace` on it is ambiguous without being global |
| **the per-id coverage bound** | **DECLINED, on a measurement.** `check-policies` reports **three** ids and all three already have a `META` entry, so a per-**id** bound is satisfied the day it is written and fires on nothing. A per-**site** bound would fire — only **1 of the 6 `P3` sites** is graded — but it would go red on arrival and oblige five new `META` entries, which is *giving the clauses probes* ([W30](w30-the-clauses-nothing-probes.md)'s subject, not this one), and **one of the five is impossible** without editing `check-policies.mjs` ([Q144](../open-questions.md)). A bound that cannot be satisfied inside this item's `Owns` is not a bound this item may write |
| **the failure-COUNT discriminator and the `agree` projection** | **DECLINED, and the line held.** Measured: **no `META` entry here grades `caught`** — the six outcomes are `exit0`×4 and `disappeared`×2 — so a count discriminator would ship as **decoration**, which is W30's exact finding in `check-spec` before it built an eighteenth probe to reach it. Building such a probe is scope growth, and this item's `Out` list already says `agree` is *"a change to what the harness OBSERVES, not to what bounds its lists"* |

**One thing measured and NOT acted on, so it is visible rather than carried silently.** `exit0` is
reported for **4 of the 6** entries, where its meaning in the sibling files is *the right ids were
found and the exit path lied*. That is exactly the conflation W30 found in `check-spec` and named as
*"live in `check-source-selftest.mjs` and `check-markdown-selftest.mjs` and NOT swept here"* — a
**third** file. It is a change to what the harness observes, so it is reported and left.

**And [Q149](../open-questions.md) is confirmed for the sixth check, by this item.** Deleting the
four-line `--self-test` dispatch from `check-policies.mjs` leaves `npm run check:policies:selftest`
running the plain check at **exit 0**, with `npm run check:source` exiting **0** beside it. **This
item adds no `package.json` entry**, so W30's prediction that `S11`/`S12` will not fire for it holds:
they do not, and neither would see this if it did.

## Why this item exists

**This item was reserved and expected to go unused, and W28's adequacy reader is why it is not.**
[P9](../plans/p9-when-a-check-stops-checking-what-notices.md)'s work-items section reserved W31 for a
`SELF` pass and said so; [W28](w28-a-grading-names-the-probe-it-breaks.md)'s `Out` list named the
trigger in advance:

> *"If this item finds the missing `SELF` is what blocks its own grading, that is the signal to take
> W31 rather than to widen this one."*

**That is exactly what was found, and it was measured rather than argued.** W28's adequacy reader
(finding B6) put each of the three verdicts W28 shipped into `check-policies-selftest.mjs` under an
`if (false)` and ran the file:

| mutation | cost |
|---|---|
| `if (r.status === 3) why = …` — the ABORT verdict | **0** |
| `else if (r.status === 0) why = …` — STILL CAUGHT | **0** |
| `else if (!ran) why = …` — the crash guard | **0** |

**All three of them, in that copy of the contract, are unprovoked.** The other two self-tests have a
`SELF` list and each gained four entries in W28 that make those verdicts fire; this file has no list
at all, so nothing bounds `PROBES` or `META` from outside and nothing asserts that any guard in it
does anything.

**And the file has already been bitten twice by exactly that gap.** Its `MIN_META` read **5** against
a six-entry list — one grading could leave for exit 0, found independently by both of W28's readers
and mis-recorded as 5 by P9's own declaration census. And its `P3 disabled` entry was scored
*noticed* from W16 until W28 because its mutant **crashed**; the repair for that was itself still
fatal ([Q144](../open-questions.md)). Both are the kind of thing a list one level out is for.

## Scope

**In**

1. **A `SELF` list with a `MIN_SELF` floor**, because `bounded === SELF.length` is vacuously true at
   zero — W16's adequacy reader's finding on this same file, one list further out.
2. **One entry per verdict W28 added**, in the single-edit form W28 arrived at: edit the **`META`
   list** and leave the guard alone, so the question is *with the guard in place, does the run go
   red?* rather than the two-edit form, which asks it backwards and passed vacuously twice.
3. **Entries for the two bounds that have no list outside them** — one `META` entry leaving, and
   `META` emptied — which is what `MIN_META = 6` now exists for and what nothing currently fires.
   *(**Corrected by the measurement above and kept in place rather than rewritten.** Both mutations
   already exit 1: the floor **fires**, and what "nothing currently fires" is true of is the
   **re-running**, not the bound — rule 7 (a)'s *a probe that ran once is a claim about the past*.
   The bound that genuinely costs 0 is `MIN_META` being **lowered**, which this sentence did not
   name and which the list now covers. Same for `PROBES`, where the compound case is already
   REFUSED by W28's ABORT and the header still lists it as open.)*
4. **The cost measured on both sides.** `check:policies:selftest` is **2.7 s**, the cheapest
   self-test that grades anything; `SELF` children run `PROBES` and `META`, so the honest expectation
   is that this item makes it several times more expensive. **Say the number rather than the ratio**,
   and take two measurements, because P9 has already had to correct a duration quoted as a constant.

**Out** — named rather than left implicit, with where it goes instead

- **The `ALL_CHECKS` allowlist and the missing report-row `agree` clause.** W28's adequacy reader
  (N5) found this file did not inherit either from `check-source`, where W24 removed the allowlist
  for rule 7 (c)'s own reason. **They are a change to what the harness OBSERVES**, not to what bounds
  its lists, and P9's declaration measured the allowlist as **inert in all three files** — renaming a
  reported id to one outside each list was caught, because every id those checks report is declared
  by some probe. Named so a later item does not read this one as having closed it.
- **[Q144](../open-questions.md)** — the `names.join` on `check-policies.mjs`'s success path, which
  makes `P3`'s first clause unprobeable. The fix is one line **in `check-policies.mjs`**, which is not
  in this item's `Owns` and is a change to a check's behaviour rather than to its negative tests. It
  is the boundary P9 draws for every item in it.
- **[Q145](../open-questions.md)** — whether a `corpus` verdict should pass. A question about the
  grading's semantics in all three files, not about this file's lists.
- **Changing what `P1`-`P3` check.**

## The decision this item takes, and what it costs

**Every entry here is written to make a guard FIRE, not to remove it**, and that is W28's most
expensive lesson rather than a style preference. Four `SELF` entries were first written as *remove the
guard and supply the case it catches*; with the guard gone and the defect present the run goes
**green**, so `SELF`'s *"must exit non-zero"* reads as *the floor did not fire* whether the guard was
load-bearing or not. **Two of those four then passed VACUOUSLY for a second reason** — their anchors
quoted the guard's own source line, and that quote sits in the file **above** the guard, so
`String.replace` edited the entry rather than the guard ([Q143](../open-questions.md)).

**Both hazards are avoided by construction here**: single-edit entries that touch the `META` list,
which sits above `SELF` in the file, so nothing can self-match.

**The cost is the whole of the argument against this item**, and it should be stated plainly in the
Record rather than discovered by a reader. `check-policies:selftest` is the one self-test whose cost
is negligible, and this makes it several times larger to close three holes in a file whose check has
three clauses. **If the measured cost is disproportionate, saying so is a legitimate outcome** — but
it is a judgement to record after measuring, not a reason to skip the item, because W28's readers
measured the holes rather than predicting them.

## Verification

**L0 — own coverage:**

```bash
npm run check:policies:selftest   # 13 probes, 6 gradings, and this item`s SELF list
```

**The provocation that makes each new entry fail** (`doc/workflow.md` section 5 rule 7): for every
`SELF` entry, the guard it targets restored, and the measured cost. **The three verdicts must go from
0 to non-zero** — those exact numbers are W28's adequacy reader's finding B6 and are what this item
is judged against.

**L1-L6 — regression, and the expected result is NO MOVEMENT:**

```bash
npm run gate                      # 19 entries, all exit 0
npm run test:l6                   # 23 row labels, 25 real runs, 489 assertions
```

Baseline at `6d536cd` **with W29's and W30's work in the tree**: **474 `test()` cases** in 19 files
across Node 24.20.0, Deno 2.9.6 and chromium; **489 assertions at L6** in Node and Deno. *(`npm run gate` runs `test:browser`, which is
**chromium only**. The two counts count different things — [Q98](../open-questions.md) — and are never
added.)*

**Rule 8's four obligations**, written before the readers report and **re-run after acting on them**:

| obligation | what it means here |
|---|---|
| the rule's clauses | each `SELF` entry's own target guard, restored one at a time |
| the `Outputs` rows | every row of the Record's table, broken so it is present but inert |
| **provenance** | `bounded` read from the child's exit code and its self-test having run, not from either alone — substitute the source expression and nothing else |
| **loop bounds** | `SELF` itself: one entry out, the whole list out, and `MIN_SELF` set to 0 both alone and together with an emptied list. **The third case is the acknowledged fixed point** — `check-policies-selftest.mjs`'s own header records it and `check-source`'s re-measured it — so it is recorded rather than claimed closed |

*Not applicable to this item: it touches no routing, so Q4, Q17, Q10, Q13 and Q6 are all outside it.*

## Record

**COMPLETE — 2026-09-06.** Author pass, both readers, and rule 8's re-run after acting on them.
**Overlap between the two readers: 0 shared findings** — the **fourteenth** measurement of section 6's
overlap question and **the first outside the settled 1-4 band**. Their only shared SUBJECT is
[Q152](../open-questions.md), approached from opposite ends and yielding two different corrections:
the adequacy reader confirmed the claim *in this file* by measurement and added a qualification, and
the conformity reader found the row **generalises that measurement to six files and is false in two**.
**One caveat on this number, stated rather than buried**: both readers were given the same list of
*claims the author was least sure of*, which is a priming neither of the thirteen earlier measurements
had. It is offered as a measurement with its method attached, not as evidence about the split.

**They found 5 and 10, eight blocking between them, and the split is the sharpest since W29's.** The
adequacy reader found **guards that were not there** — four of its five blocking findings are things
the author's own set could not reach, and **three of those four are one shape: an entry written to a
LIST when the thing it had to bound was a GUARD**. The conformity reader found **claims that were
false** — a register row generalised from one file to six, a ceiling row quoting a literal the file no
longer contains, and a cost decomposition that accounts for the whole run inside one of its phases.
**Every blocking finding was reproduced by the author before being acted on**, and one of them
reproduced only after the author's first verification probe **self-matched** — [Q143](../open-questions.md)'s
own class, inside the verification of a finding.

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L0 own coverage | **RAN, green** | `check:policies:selftest` **13 probes / 6 gradings / 14 SELF**, exit 0. `check:policies` unchanged in behaviour and untouched — mutated in scratch measurements and restored byte-identical, twice |
| L1-L6 regression | **RAN, unmoved** | `npm run gate` **exit 0, zero FAIL lines**, read from the log's own `GATE EXIT=` line rather than through a grep. **474 `test()` cases in 19 files** across node 24.20.0, deno 2.9.6 and chromium ([Q98](../open-questions.md) — cases, never added to the next figure). **489 assertions, 23 row labels, 25 real runs** at L6 in node and deno. The gate chain is **19 entries**, derived from `package.json` rather than counted in the log. `check:markdown` reports 67 documents / 1992 relative links / 99 anchored — up from W30's 1908 by this item's own documents, and **inside `M4`'s window**, which W30 had just retuned: both `removes` probes still fire, which is what a green gate means here |
| rule 8's four obligations | **RAN, six times** | Author pass: **40 provocations — 20 refused, 20 survive**. **Re-run after the readers: 46 provocations — 28 refused, 18 survive, 0 matched nothing**, including the readers' own exact edits. The first pass found the `SELF` crash defect below; every count here is from after it |
| conformity reader | **RAN** | **10 findings, 3 BLOCKING**, all three reproduced by the author first. It also re-derived every count in this Record independently — the 13/6/14 lists, the ten `fail()` sites, the 19 chain entries, the gate's four figures, the cost pair — wrote **its own aborting census parser** and agreed at 112 / 76 / 2 / 34 with both halves at 112 of 112, confirmed the `Owns` audit and the byte-identical claim, and tried and failed to break eight of the claims this item flagged as arguments |
| adequacy reader | **RAN** | **74 mutations, 39 refused, 35 survive, 5 BLOCKING**, in an isolated copy verified green before it started. **Zero symlinks and zero reparse points** before and after; both scripts sha256-identical to the main tree at the end; nothing matched nothing in any batch. Every survivor came with a second independent route, and four were labelled vacuous or behaviour-preserving rather than counted |
| re-run after acting on the readers | **RAN** | **46 provocations, 28 refused, 18 survive**, and it moved six mutations from SURVIVES to REFUSED. It also found one the readers had not: retargeting the `MIN_PROBES` entry closed the floor being **lowered** as well as its disjunct |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| a `SELF` list with `MIN_SELF` | **yes — 14 entries, floor 14** | one entry out costs 1, the whole list out costs 1. **And the list is bounded by CONTENT as well**: a duplicate entry costs 1, where it cost **0** before ([Q153](../open-questions.md)) |
| an entry per W28 verdict — ABORT, STILL CAUGHT, `ran:` | **yes — three** | **and only one of the three can bound the BRANCH it names.** The `ran:` guard costs 1 both ways — the parent's `!ran` arm and the child's `RAN` producer. The other two are **message-only** and cost 0 with the list in place exactly as without it: [Q152](../open-questions.md). What their entries bound is the OUTCOME — a dangling probe reference and a mislabelled entry each turn the file red — which is worth having and is not what this item's own table claimed |
| entries for `META`'s two bounds | **yes — two, plus two for `PROBES`** | `MIN_META -> 0` costs **1** where it cost 0, alone and together with a shortened list. `MIN_PROBES -> 0` alone still costs 0 and its compound case is refused by W28's ABORT rather than by the floor |
| the cost, measured on both sides | **yes** | below, as pairs with a control — **and the first measurement of it was wrong for the same reason the harness was** |
| **not declared, added** — `MAX_CORPUS = 0` | **yes** | forcing one grading non-inert costs 1; `MAX_CORPUS -> 99` costs 1. [Q150](../open-questions.md), closed here and live in three |
| **not declared, added** — the two anchor guards, one `wide` exemption, `MAX_WIDE = 1` | **yes** | a global anchor costs 1, an anchor matching twice costs 1, a second exemption costs 1, `MAX_WIDE -> 99` costs 1. **W30 recorded `MAX_WIDE -> 99` as SURVIVING in `check-source`; here the `SELF` entry beside it makes it fail** |
| **not declared, added** — the `SELF` control run | **yes** | reintroducing this item's own shipped defect is refused by name. Nothing else in the file refuses it |

**Cost.** Pairs, never a single figure. **`check:policies:selftest` is no longer anybody's control** —
it was the flat one across W28, W29 and W30, and this item is what ends that. `check:spec:selftest`
is the control here: untouched by W31, and W30 measured it at 19.0 / 18.1 s.

| | before | author pass | after the readers |
|---|---|---|---|
| `check:policies:selftest`, bare `node` | 2.20 / 2.18 / 2.24 s | 13.75 / 13.85 / 14.24 s | **14.72 / 14.70 s** |
| `check:policies:selftest`, through `npm run` | 2.93 / 2.99 s | 14.75 / 14.66 s | — |
| `check:spec:selftest` — **the control** | 19.1 / 21.3 s | 20.0 / 20.8 s | **17.4 s** |
| whole gate, 19 entries, `GATE EXIT=0` | 322 / 326 / 351 s (W30's) | 425 s, then 1111 s — see below | — |

**The control is flat**, which is what lets the first row be read as work rather than weather. **About
6.5x, and the item predicted "several times more expensive" and was right.**

**The decomposition below is the conformity reader's, and the one this Record first printed was wrong
in three ways at once.** It read: *"the twelve non-control entries cost 11.9 s, the control 2.1 s, and
the thirteenth entry about 0.1 s because its guard fires before any child runs. Nine of the thirteen
spawn a child that runs 13 probes and 6 gradings; four short-circuit at a floor."* Its three numbers
sum to the **whole run**, leaving nothing for the probe and META passes that precede the `SELF` pass;
**four** entries spawn a full child, not nine; and the thirteenth is **0.5-0.7 s** with **no guard
firing in it at all** — its child passes every floor with `PROBES` empty and spawns six grandchildren
that each ABORT. Measured by an instrumented copy that times each phase and each entry:

| phase | s |
|---|---|
| probes (13) | **0.82** |
| META (6 gradings) | **1.23** |
| the `SELF` control | **2.09** |
| the `SELF` entries (13 at the time) | **9.96** |

and inside that last row, **four** entries cost about 2 s each — the ABORT case, the STILL-CAUGHT
case, the `ran:` case and the `corpus` case, which are the only ones whose child runs the full pass —
**eight** cost 0.07-0.09 s because a floor or one of this item's four new guards fires before any
child is spawned, and the compound entry costs 0.69 s. **The sentence was arithmetic written from the
shape of the list rather than from a measurement**, in the paragraph this Record calls the honest
half.

**The two gate runs are 425 s and 1111 s, and the second is NOT a measurement of this item — the
control is what says so, which is the whole reason there is one.** Immediately after the 1111 s run,
`check:spec:selftest` measured **138.7 s and then 62.8 s** against its own 19-21 s, and
`check:policies:selftest` **71.9 s** against 14.0 — the same factor on a file this item changed and on
one it did not. Left to settle, both came back to **19.1 s** and **14.84 / 14.86 s**, which confirms
the after-pair a second time. **So: the gate is green at `GATE EXIT=0` with zero FAIL lines on both
runs, the item costs about 12 s of gate, and the 1111 s figure measures the machine.** This repository
has twice had to correct a duration quoted as a constant; **the fix is not a better number, it is a
control beside it**, and this is the first time here that a control has stopped a wrong one being
written down rather than explaining one afterwards. *(The 425 s run predates this item's own
record-step documents; the 1111 s run has all of them, which is why its markdown counts are the ones
quoted above.)*

**What each guard cost when disabled, before and after.** *(The declared table's "cost then" column
was wrong in one place and the correction is in this item's declaration section: `MIN_META` already
fired.)*

| guard | cost then | cost now |
|---|---|---|
| the ABORT verdict | 0 | **still 0 — [Q152](../open-questions.md), and it cannot be otherwise** |
| STILL CAUGHT | 0 | **still 0 — same** |
| the `ran:` crash guard | 0 | **1** |
| the child's `RAN` producer | 0 | **1** |
| one `META` entry deleted | **1, not 0** | 1, and now re-run |
| `MIN_META -> 0`, alone | 0 | **1** |
| `MIN_META -> 0` with an entry deleted | 0 | **1** |
| a duplicate `META` entry | 0 | **1** |
| one entry's anchor made GLOBAL | 0 | **1** |
| one entry's anchor matching twice | 0 | **1** |
| a grading passing as `corpus` | 0 | **1** |
| a duplicate `SELF` entry | 0 | **1** |
| `MIN_PROBES -> 0`, alone | 0 | **1 after the readers** — it read *still 0, second-order* until the entry that deletes a probe was retargeted at one no `META` entry names |
| the `MIN_PROBES` disjunct deleted | 0 | **1**, same fix |
| the PROBE-PASS verdict | 0 | **1** |
| a probe whose mutation matches NOTHING | **1**, and only because of that verdict | 1, and now re-run |
| the inertness run, sole producer of `corpus` | 0 | **1** |
| set equality -> cardinality in the MAIN probe pass | 0 | **2** — one shared expression now |
| `ALL_CHECKS` widened with an id the check never reports | 0 | **1** |
| a row deleted from `check-policies.mjs`'s own `CHECKS` | 0 | **1** |
| `MIN_SELF -> 0`, alone and with `SELF` emptied | — | **0 — the outermost list** |

### What broke, and the first of these is the item's headline

1. **[Q151](../open-questions.md) — every `SELF` entry passed because the child CRASHED, and the file
   reported `12/12 bounded` at exit 0.** The mutants were written into the scratch directory a child
   deletes on its own first line, so the `META` grandchild could not re-import them. Every grading
   inside every child read ***"the mutant did not run: this is a crash, not a detection"***, and the
   pass was measuring the deletion. **That is [Q138](../open-questions.md)'s own shape — an exit code
   cannot tell a detection from a crash — one layer further out than the plan that exists to close
   it, inside the entries written to close it.** Found by rule 8's set and not by the green run: the
   set's *"the distinctness bound -> `if (false)`"* provocation came back SURVIVES when it had no
   business doing so, and following that one number is what found it. **Closed by a CONTROL RUN** —
   an unmutated copy, run as a `SELF` child, must RUN and must NOT be graded — which is W28's
   inertness check one layer out. Reintroducing the defect is now refused by name.

2. **The item's own cost figure was a measurement of that defect.** The first "after" reading was
   **8.5 s**; with the children actually running it is **14.0 s**. A crashed child is cheap. The
   number would have gone into this Record, `README.md` and two indexes as *"the cheapest self-test
   that grades anything is now four times more expensive"*, and the true multiplier is six. **A
   performance number taken from a broken harness is a claim about the breakage.**

3. **A claim written into the file's header was falsified by the twelfth entry on its first run.**
   The header argued that loading a `SELF` child through a generated runner — rather than through
   `check-policies.mjs`, which W31 does not own — cost nothing, because *"a mutation of single-probe
   mode makes gradings PASS and `SELF` grades on the child going RED."* The reasoning was about
   **single-probe machinery** and the gap was about **the LISTS**: with `PROBES` emptied the child had
   no probes at all and still reported `6/6 noticed` at exit 0, because the grandchild found every
   named probe in the unmutated original. **A claim about what a mechanism cannot reach, written from
   the mechanism instead of from the entries.** The `META` loop now spawns the runner whenever it is
   already inside a `SELF` child, and removing that propagation costs **1**.

4. **And the header correction W31 made to the ceiling list was itself wrong, in the direction of
   over-claiming.** The list called `if (!meta) ... return 0` -> `if (true)` a fixed point; this item
   wrote *"CAUGHT by SELF — a list one level out is exactly what closes it"*, on the reasoning that a
   `SELF` entry grades the child's exit code from outside. **It survives**: the mutation applies to the
   PARENT too, which returns 0 after its own probe pass and never reaches the `SELF` pass. *A list one
   level out closes nothing that short-circuits before it.* Corrected in place; the original sentence
   was right and its argument is now stated rather than asserted. **Three of W16's four ceiling rows
   were re-measured and two were unchanged** — the fourth was stale on a literal (`MIN_PROBES = 10` is
   13) and on its compound case, which W28's contract had closed and nobody had re-run.

### Rule 8's four obligations — 40 provocations, 20 refused, 20 survive

**Run FIVE times: an author pass, a re-run after the Q151 fix, a re-run after the thirteenth entry,
a re-run after the `graded` refactor, and a re-run after the `SELF` distinctness bound.** Each re-run moved provocations and the movement is the
result, not the total.

| obligation | refused | survived |
|---|---|---|
| the rule's clauses | the `ran:` arm; `RAN`; the `META` distinctness bound; **both** anchor guards; the `MAX_WIDE` guard; the `MAX_CORPUS` cap; the `META` verdict's early return; `ALL_CHECKS` emptied | the ABORT and STILL-CAUGHT arms ([Q152](../open-questions.md)); the "matched nothing" guard; `caught++` forced; inertness forced; `if (!meta) -> if (true)`; **the `SELF` distinctness bound**, which fires on a duplicate and which nothing provokes |
| the `Outputs` rows | the runner propagation removed; the `wide` exemption removed; `MAX_CORPUS -> 99`; `MAX_WIDE -> 99` | the `SELF` verdict forced to 0; the `SELF` pass skipped entirely |
| **provenance** | **`graded` sourced from `SELF_RAN` alone** — see below | `graded` sourced from the exit code alone; `SELF_RAN` -> `() => true`; `SELF_RAN` read from the parent's own text; the distinctness bound read from `script` rather than the real check |
| **loop bounds** | one `SELF` entry out; the whole `SELF` list out; `MIN_META -> 0` alone and with a shortened list | `MIN_SELF -> 0`, alone and with `SELF` emptied; `MIN_PROBES -> 0` alone |

**One provenance hole was found and closed by the set itself, and the fix is worth naming.** Written
with the control and the loop each computing their own comparison, dropping the exit code from the
loop's — so that ANY child which ran counted as bounded — cost **0**, because every entry produces a
child that both ran and failed and nothing in the file is the other case. **Routing both through one
`graded()` makes the control that other case**, and the mutation is now refused. The remaining half is
on the ceiling list and is stated rather than papered over: dropping `SELF_RAN` still costs 0, because
that term exists to **reject** a malformed entry and every entry here is well formed.

**Three survivors are behaviour-preserving rather than holes, and they are labelled as such.**
Re-inlining either comparison in place of `graded` costs 0 **alone** and re-opens the hole above
**compounded** — W30's `bN >= mN` shape. And reading the distinctness bound from `script` rather than
from the real check costs 0 **here** where it was a real defect in `check-source`: the guard block is
unreachable from single-probe mode, so `script` is always the real check wherever the guard runs.
W30's hazard cannot arise in this file, which is a fact about this file rather than a weaker bound.

**The two positive tests the set structurally could not reach, both constructed and both fired.**
Rule 8's obligations can only show that disabling a guard costs 0 when nothing in the tree triggers it.

- **The `ran:` guard's case exists HERE and nowhere else, and this is the second demonstration
  anywhere that it fires.** [Q144](../open-questions.md) records the guard as live in several files
  and provoked in none; W29 constructed one in `check-docs`. W28 had to **delete** this exact mutation
  as a `META` entry — `check-policies.mjs` ends with ``All checks passed — ${names.join(', ')}``, which
  is reachable with `names === null` **only when the clause being disabled is disabled** — so the
  mutant is inert on the clean tree and throws under its own probe. As a `SELF` entry that is exactly
  right: `6/7 noticed` at exit 1 with the guard live, `7/7` at exit 0 with either half of it disabled.
  ***The mutation that could not be a `META` entry is the one that makes a `SELF` entry for the crash
  guard possible.***
- **The control run fires on the exact defect this item shipped**, reproduced as a two-edit
  provocation: `check-policies self-test — the SELF control exited 1`, naming four crashed gradings
  under it. Without that reproduction the control would be decoration, which is W30's own finding
  about a mechanism nobody can trigger.

**The ambiguous-anchor guard shipped with NO live case and its entry had to be CONSTRUCTED.** Every
singular anchor in this file's `META` occurs exactly once in `check-policies.mjs`, so the guard was
refused at 0 by rule 8's set. `fail('P1',` occurs **twice**, so a plain `.replace` on it lands on the
first of two and is not global — which the GLOBAL guard beside it cannot see. **Two guards, two
entries, and neither substitutes for the other.** An eighteenth instance for P8's second
proposed change: not merely *a check written for a defect you just fixed*, but a check written for a
defect that was never here.

### What this taught

- **A pass that grades on an exit code has the defect it was built to remove, and the outermost list
  is where it hides.** This item exists because W28's three verdicts were unprovoked; it then shipped
  a `SELF` pass whose thirteen entries were all unprovoked in a way its own green run could not show,
  for the reason the plan is named after. **The general form: any grading of the shape *the child
  failed* needs a control of the shape *an unmutated child does not*.** `check-source-selftest.mjs`
  and `check-markdown-selftest.mjs` have `SELF` lists and no control — [Q151](../open-questions.md).
- **What a `SELF` list buys, measured as a pair, which is what P9's retro asked this item for.**
  `MIN_META -> 0` — alone, and together with a shortened `META` — cost **0** before this item and cost
  **1** after. `MAX_WIDE -> 99` costs **1** here and W30 recorded it **surviving** in `check-source`.
  A duplicate `META` entry, a global anchor, a corpus-passing grading: each 0 before, 1 after. **What
  it does NOT buy is anything that short-circuits before it** — `if (!meta) -> if (true)`,
  `if (nestedSelf) -> if (true)` and the outermost verdict all survive, because the mutation reaches
  the parent as well as the child. **The regress does not move one list further out; it stops at the
  first thing that can return before the list runs.**
- **And the cost of that is the honest half.** `check:policies:selftest` was **2.2 s** and is
  **14.0 s** — 6.3x, for a check with three clause ids and ten `fail()` sites, to close eight holes
  that each cost 0. **This item's own file says a disproportionate cost is a legitimate outcome to
  RECORD after measuring rather than a reason to skip the item**, and the number is recorded here
  rather than in a ratio. Whether the gate should run any of this is [Q133](../open-questions.md),
  which P9 declares out of scope for every item in it.
- **[Q149](../open-questions.md) is confirmed for the sixth check by this item**, which is the census
  W30's conformity reader corrected: deleting the four-line `--self-test` dispatch from
  `check-policies.mjs` leaves `npm run check:policies:selftest` running the plain check at **exit 0**,
  with `npm run check:source` exiting 0 beside it. **This item adds no `package.json` entry**, so
  W30's prediction that `S11`/`S12` would not fire for it holds — they do not, and neither would see
  this if it did.
- **And one measured thing that turned out NOT to be a finding, recorded because the prediction was
  written down.** Two of the six checks — `check-policies` and `check-scheduler` — dispatch
  `--self-test` **after** their own checks have already run, where the other four dispatch before. The
  prediction was that this wastes a check run per child and that hoisting it would show up in the
  timings. Measured: **13.8 / 14.0 / 14.3 s hoisted against 13.9 / 14.2 / 14.0 s as shipped — no
  difference outside the noise.** Not raised as a question, because the only thing left is that a
  module-scope throw in the check would stop the self-test dispatching, and that exits non-zero and
  turns the gate red rather than passing silently.

### What the readers found, and what changed because of it

**The adequacy reader's five blocking survivors, every one reproduced by the author before acting,
and all five closed.** Four were unreachable by the author's own set, and **three of the four are one
shape** — an entry written to a LIST when the thing it had to bound was a GUARD.

| survivor | cost then | second route it gave | cost now |
|---|---|---|---|
| **the PROBE-PASS verdict** — `caught !== PROBES.length` -> `if (false)` | 0, at `13/13 · 6/6 · 13/13` exit 0 | a probe whose mutation matches NOTHING costs 1 with the verdict intact and **0** without: the run prints `FAIL … the mutation matched nothing`, then `12/13 probes caught`, **then exits 0** | **1**, via a new `SELF` entry. **This is the verdict the thirteen probes exist to produce and the ceiling list never carried it** — the two it names are the META and `SELF` ones. No other entry can reach it: every other breaks a LIST, this breaks the VERDICT OVER a list |
| **the `MIN_PROBES` disjunct** deleted from the floor check | 0 | the `META` disjunct costs 2, so the check is reachable; and retargeting the entry at a probe **no `META` entry names** makes the floor the only thing that fires | **1** — and the fix closed `MIN_PROBES -> 0` **alone** as well, which the re-run found and the reader had not. The three entries meant to bound the floor all named probes a `META` entry also names, so **W28's ABORT fired first and the floor was never the reason** |
| **the inertness run** — the only producer of `corpus` | 0; `byCorpus` then permanently 0, `MAX_CORPUS` dead code, [Q150](../open-questions.md) silently reopened | with the run disabled the child still goes red, but by the OTHER route — the named probe comes back STILL CAUGHT. **The right verdict by the wrong route**, [Q147](../open-questions.md)'s shape inside the entry written to close Q150 | **1**, via a two-edit `META` mutation that disables its own probe's clause **and** makes `P1` fire on the clean tree: inertness live -> `corpus` -> `MAX_CORPUS` refuses; inertness gone -> `disappeared` -> green |
| **rule 7 (c)'s set equality, in the MAIN probe pass** | 0 — `13/13 probes caught`, exit 0 | the SAME weakening in single-probe mode costs 2. The expression existed **twice, verbatim**, and only the single-probe copy was covered | **2.** One shared `verdict()`, which is `check-source-selftest.mjs`'s own answer — *"two callers computing the same fact is how they drift"*. **The author's probe missed it by being too coarse**: it used `replaceAll`, hit both copies, and was refused by the one already covered |
| **`SELF_RAN` is provocable** — the file's stated argument was false | 0 both ways | a fourteenth entry whose mutation deliberately makes this file a syntax error: **13/14 bounded, exit 1** with `SELF_RAN` intact, **14/14, exit 0** without | **not closed, RECLASSIFIED**, and that is the honest outcome — see below |

**The `SELF_RAN` finding is where the two readers contradicted each other, and both were right.** The
adequacy reader showed the guard is **reachable and load-bearing**; the conformity reader argued it is
*"unprovocable by design: an entry that provokes it is an entry whose child cannot run, which is
graded FAIL and so cannot ship green"*. Both hold. **What was wrong is the file's word.** It said
*"unprovocable by construction"*, which reads as *unreachable*; the truth is **reachable, demonstrated,
unshippable** — a third category this file now has three of: this, the `ran:` guard's own case, and
the control run. The same correction applies to the `SELF` distinctness bound, whose row made the
identical argument.

**And the author's first attempt to reproduce it SELF-MATCHED.** The constructed entry quoted
`'const MIN_SELF = 13;'` as its anchor while the same edit retuned that declaration to 14, so at
runtime the entry's `.replace` found **its own literal** instead of the declaration and produced a
valid file — the child exited 0 and the measurement read *"the floor did not fire"*, contradicting the
reader. **[Q143](../open-questions.md)'s class, inside the verification of a finding about a claim.**
Re-anchored on a line the entry does not requote, the reader's numbers reproduce exactly.

**The conformity reader's three blocking findings, all reproduced before acting.**

| finding | what it was | now |
|---|---|---|
| **[Q152](../open-questions.md) generalises a one-file measurement to six** | the row said *"in any of the three files that carry them"* with an owner cell naming **six** — wrong internally, and wrong about the substance. `check-spec` and `check-scheduler` do **not** carry the message-only form: W29's failure-COUNT discriminator turned that arm into a block that re-runs the unmutated check and can set `ok`. Measured: disabling it costs **1** in `check-spec-selftest.mjs` and **2** in `check-scheduler-selftest.mjs` | corrected in the register, `CLAUDE.md` and `doc/README.md`, with the four-file / two-file split named. **A finding measured in one file and generalised to six, in the file read before every work item** |
| **the ceiling list called the META verdict *the fixed point*, and it is REFUSED** | the row quoted `` `return noticed === META.length ? 0 : 1` -> `return 0` `` — **a literal this file no longer contains**, because W31 rewrote the verdict as an early return. The live form costs **4**: four `SELF` entries need the child's META pass to reach its own verdict. The Record's own obligations table already listed it under *refused*, so the artifact and the Record contradicted each other | corrected. **A ceiling row inherited through a refactor is a claim about a file that no longer exists** — and it is a **0 -> 4** pair, one of the strongest this item has for its own question |
| **the cost decomposition** | three claims, all false: the three figures summed to the whole run, *nine* entries spawn a full child where **four** do, and the thirteenth is 0.5-0.7 s with no guard firing rather than 0.1 s with one | replaced by an instrumented measurement, above |

**Four of its seven non-blocking findings were numbers this item or its neighbours had written down**,
and all four are corrected: two comments in the `Owns` file stating the **opposite of the header** about
`MIN_META` (the header was right); *"the widest single-id surface of any check here"*, which is a
**three-way tie** with `fail('S11'` in `check-source.mjs` and `fail('D3'` in `check-scheduler.mjs`;
`13/13 bounded` where the sentence's own entry count says **12/12**, in this file and in
[Q151](../open-questions.md); and `CLAUDE.md` carrying **W29's author-pass counts** (18/21, 14/7, ten)
where its shipped ones are 20/22, 14/8 and nine — in the paragraph W31 had rewritten the first two
sentences of without touching the numbers.

**And two were inherited defects this item then reproduced.** `CLAUDE.md` and `doc/README.md` still
said Q149 was *"measured in all five checks"* — W30's conformity reader corrected that to **six** and
W30 recorded it *"corrected in all six"* documents; these two were missed. **W31 then wrote *"Q149 is
confirmed for the sixth check"* into both**, so each document said *five* in one paragraph and *sixth*
in another. **That is the exact shape W31 names for W29 — an index contradicting itself inside one
document — reproduced by W31 in the two files its own record step edits.** Both corrected.

### What the re-run then caught, which neither reader could

**`doc/workflow.md` rule 8 as amended by P6's retro, firing on its own procedure for the seventh time
across seven items.**

1. **The `MIN_PROBES` fix closed more than the reader's finding.** Retargeting the entry at a probe no
   `META` entry names was proposed for the **disjunct**; the re-run shows `MIN_PROBES -> 0` **alone** is
   now refused too, and that row left the ceiling list. The reader bounded the guard; the fix bounded
   the literal as well.
2. **The `ALL_CHECKS` cross-count was taken, and it is the answer to a question open since W28.** The
   adequacy reader's one non-blocking-but-named finding: `ALL_CHECKS` is a **hand-copy** of
   `check-policies.mjs`'s own `CHECKS` array and nothing compared them — widening it cost **0**, and
   deleting a whole row from the real check's `CHECKS` cost **0**. **This item's `Out` list puts
   `ALL_CHECKS` out of scope as *a change to what the harness OBSERVES*, and that still stands**: the
   list is unchanged and nothing about how `tripped` is read has moved. What is added is a BOUND on its
   completeness, derived from the check **twice over and cross-checked** — W30's form. All three of the
   reader's edits are now refused by name. **It is the only cross-count in this file, and it answers the
   sub-question W28's adequacy reader named and could not instantiate anywhere: *does anything COUNT a
   list from a source other than itself?* Everything else here counts itself, and every floor is a bare
   literal.**
3. **And the re-run's own set had a duplicate.** Two entries applied the identical mutation to the
   ambiguous-anchor guard, in the pass that had just added a `SELF` distinctness bound for exactly that
   defect one list in. Counted once.

### What is deliberately NOT done

- **[Q144](../open-questions.md) stays open and is not fixed here.** The `names.join` on
  `check-policies.mjs`'s success path is one line in a file this item does not own, and P9 puts a
  change to a check's behaviour out of scope for every item in it. **Its case is now provoked rather
  than only described**, which is the most this item can do for it.
- **The per-id coverage bound is DECLINED on a measurement, not on taste.** `check-policies` reports
  three ids and all three already have a `META` entry, so a per-**id** bound fires on nothing the day
  it is written. A per-**site** bound would fire — only **1 of the 6 `P3` sites** is graded — and would
  go red on arrival, obliging five new `META` entries; that is *giving the clauses probes*, which is
  [W30](w30-the-clauses-nothing-probes.md)'s subject, and **one of the five is impossible** inside this
  item's `Owns` ([Q144](../open-questions.md)). A bound that cannot be satisfied without editing a file
  the item does not own is not a bound the item may write.
- **The failure-COUNT discriminator and the report-row `agree` projection stay out**, as the `Out`
  list says, and now with a measurement behind it: **no `META` entry here grades `caught`** — the six
  outcomes are `exit0` x4 and `disappeared` x2 — so the discriminator would ship as **decoration**,
  which is W30's exact finding in `check-spec` before it built an eighteenth probe to reach it.
  Building such a probe is scope growth.
- **`exit0` is reported for 4 of the 6 gradings**, where its meaning in the sibling files is *the right
  ids were found and the exit path lied*. That is the conflation W30 found in `check-spec` and named as
  live in two other files — this is a **third**. It is a change to what the harness observes, so it is
  reported and left. [Q147](../open-questions.md).
- **The `ALL_CHECKS` allowlist stays**, as the `Out` list says, and it is not inert: emptying it is
  **REFUSED**, at `0/13 probes caught`. P9's declaration measured the narrower case — renaming a
  reported id to one outside the list — as caught in all three files that carry it, and this measures
  the wider one. Either way it is a change to what the harness OBSERVES rather than to what bounds its
  lists, which is where this item's boundary is.
- **[Q131](../open-questions.md), [Q135](../open-questions.md), [Q123](../open-questions.md)** — the
  register's three malformed rows stay unfixed on purpose, and Q119 and Q71 are carried as declared
  exemptions in this item's census parser rather than repaired.

**`Owns` audit.** `git diff --name-only` against the block above: **`scripts/check-policies-selftest.mjs`
— the one file, owned.** `doc/work-items/w31-*.md` is this item's own; `doc/open-questions.md`,
`doc/README.md`, `CLAUDE.md`, `README.md` and the plan's Record are `doc/workflow.md` section 1 rule
5's record step. **`scripts/check-policies.mjs` was READ, mutated in scratch measurements and restored
byte-identical, and is NOT edited** — worth stating rather than leaving to inference, because both
[Q144](../open-questions.md) and [Q149](../open-questions.md) have their fix in it. **Zero late
exceptions.**

**The register.** Re-derived with a parser that **aborts** on any row it cannot classify, splitting on
unescaped pipes only and with **no code-span awareness** — W30's correction, kept. **CONFIRMED for the
third plan running**: 109 / 73 / 2 / 34 before the new rows, **112 / 76 / 2 / 34** after, and **both
halves check out at 112 of 112 in exactly one cluster cell**. It aborted on Q119 and Q71, which are
carried as declared exemptions, and twice on [Q87](../open-questions.md) in two opposite directions
before the width check was put where this file's own stated predicate says it belongs. Full note in
the register's own census paragraph.

**Questions raised.** [Q151](../open-questions.md) — a `SELF` pass whose children cannot run reads as
full coverage; [Q152](../open-questions.md) — two of W28's three verdicts are message-only and no
`SELF` entry can make them load-bearing; [Q153](../open-questions.md) — a `SELF` list is bounded by
count and not by content. **All three of the reserved block are used. No ADR: W31 reserves none**, as
the plan predicted for an item that adds bounds to a harness rather than an architecture — and P9
records that wanting one would be a signal its scope grew.
