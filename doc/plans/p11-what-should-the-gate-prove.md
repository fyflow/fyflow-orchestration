# P11 — What should the gate prove, and what is it actually proving?

**Status:** **COMPLETE and RETRO'D**, 2026-09-09. Declared the same day, after
[P10](p10-is-fan-out-one-feature-or-two.md) closed and `doc/workflow.md` reached v0.11; it now stands
at **[v0.12](../workflow.md)**, which is this plan's retro.
**[W38](../work-items/w38-the-dispatch-nothing-binds.md) is DONE** — [Q149](../open-questions.md)
closed in seven checks by three clauses, two of which came from its readers.
**[W39](../work-items/w39-what-the-gate-proves-and-what-it-costs.md) is DONE** - the gate is **393.1 s from 516.1**, in ladder order, with the seven self-tests run concurrently by one entry and **nothing deleted**. [ADR 0039](../decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md); [Q133](../open-questions.md) and [Q148](../open-questions.md) RESOLVED.
**W40 is CLOSED as reserved and never issued.**
*Read every status from the item's own file.*

```
Question:   What should `npm run gate` prove, and what is it actually proving?
Reserves:   W38-W40 (W40 expected unused), Q176-Q183, ADR 0039
            (EXTENDED from Q176-Q180 at W39's record step, and again to Q183 after
            that item's readers reported. All five were spent
            before that item raised a question - three by W38 and two by W39's
            own declaration - and section 3 forbids reusing an id and this plan
            forbids borrowing a neighbour block. W40 stays reserved and unused.)
Exit:       a gate whose cost is a DECISION rather than an accident - the same
            nineteen entries timed in one pass before and after, with the change
            argued from the pair; and the `--self-test` dispatch bound in all six
            checks, so 404 seconds of the gate can no longer be removed by
            deleting 151 bytes.
            (The second half is DONE and is SEVEN checks, not six - W38 added one
            and it covers itself. The first half's METHOD is falsified by W39's
            declaration: two consecutive passes over one tree differ by 13% at
            the total and 43% at the largest cell, so a pair of single passes
            cannot argue a change smaller than that. Q179; W39 states its cost
            measure in advance instead.)
```

## Why this plan, and why now

**The gate is 93.2% self-test.** Measured below in one pass with a clean tree: the six checks cost
**9.1 s**, proving they can fail costs **404.1 s**, and everything else — L0 through L6, in three
runtimes, including both real-scheduler rungs — costs **20.5 s**. *Nobody decided that.* It is the
accumulated result of [P8](p8-what-can-be-deleted-with-the-gate-green.md) and
[P9](p9-when-a-check-stops-checking-what-notices.md) each doing exactly what they were declared to do.

**And the whole of it can be deleted by hand, silently.** [Q149](../open-questions.md) is confirmed
below in **all six** checks: remove the four-line `--self-test` dispatch and the gate entry runs the
plain check, exits **0**, and the self-test does not run. 151 to 373 bytes, and 404 seconds of
evidence stops existing with the gate green.

**This is a process plan and it follows two of them**, which is the argument against declaring it —
[P10](p10-is-fan-out-one-feature-or-two.md) was the product plan and the Control flow cluster is now
empty. The argument for it is that **Verification and fixtures is 46 open of 48**, the worst
resolution rate of any cluster by a factor of five, and the three questions this plan takes are the
ones with a decision at the end rather than a check to build.

## What was measured before this plan was declared

**Four facts. Two of them correct the register rows this plan is built on, which is the thirteenth
time a plan has found one wrong by trying to act on it.**

### 1. The gate is 433.7 s and 93.2% of it is self-test — [Q133](../open-questions.md)'s own number is wrong

One pass, clean tree, every entry timed individually rather than subtracted across two runs:

| entry | s | | entry | s |
|---|---|---|---|---|
| `check:spec` | 0.8 | | `check:markdown:selftest` | **141.7** |
| `check:spec:selftest` | 28.0 | | `check:scheduler` | 0.7 |
| `check:source` | 0.7 | | `check:scheduler:selftest` | 13.9 |
| `check:source:selftest` | **81.2** | | `check:policies` | 0.7 |
| `check:markdown` | 1.1 | | `check:policies:selftest` | 16.4 |
| `check:docs` | 5.1 | | `check:docs:selftest` | **123.0** |
| `lint` | 0.8 | | `typecheck` | 7.6 |
| `test` | 1.1 | | `test:deno` | 1.1 |
| `test:browser` | 3.5 | | `test:l6` | 3.1 |
| `test:l6:deno` | 3.3 | | | |

```
TOTAL                   433.7 s
the six checks            9.1 s   ( 2.1%)
proving they can fail   404.1 s   (93.2%)
everything else         20.5 s   ( 4.7%)      ratio 44.3x
```

**Q133's row says *"about a minute proving its own checks can fail"*. It is nearly SEVEN.** And P9's
retro recorded **4.3 s against 347.0 s, "about 79%"** of a 438 s gate; the absolute has grown to 404
and the share to 93.2%, while **the ratio FELL from 81x to 44.3x** — because the checks themselves
got more expensive (4.3 → 9.1, most of it `check:docs` at 5.1). *A ratio that improves while the thing
it measures gets worse is why this plan quotes both numbers.*

**Two files are 61% of the whole gate.** `check:markdown:selftest` (141.7) and `check:docs:selftest`
(123.0) are 264.7 s together — against the 1.1 s and 5.1 s the checks they grade cost.

### 2. [Q149](../open-questions.md) is live in ALL SIX, at exit 0

The dispatch is the same four lines in each — `if (process.argv.includes('--self-test'))` and a
dynamic import. Cut by brace-matching from the `if`, so the file stays valid:

| check | bytes cut | `check:X:selftest` then | self-test |
|---|---|---|---|
| spec | 151 | **exit 0** | did not run |
| source | 373 | **exit 0** | did not run |
| markdown | 330 | **exit 0** | did not run |
| scheduler | 156 | **exit 0** | did not run |
| policies | 155 | **exit 0** | did not run |
| docs | 187 | **exit 0** | did not run |

**`S11` reads the manifest and `S12` compares the chain's entry names**, so both are satisfied: the
entry exists, it is in the right position, and it invokes the right script. What is unbound is what
the script does with the flag.

**And the first version of this probe was WRONG-REASON, which is `doc/workflow.md` v0.11's new
harness requirement on its first outing.** A regex-matched span cut something else as well and
produced **exit 1 in all six** — a crash reading as a detection. The control had already been run and
held, so the red was mine and not the tree's. *v0.11 was adopted three commits ago and earned its
keep before this plan was written.*

### 3. [Q148](../open-questions.md)'s hazard is REAL, WIDER than its row, and its stated mechanism is wrong

The row says `check:scheduler:selftest` moves `node_modules/fyflow-scheduler` aside *"while an
`AGENTS.md` snippet imports it"*. Measured by moving the package aside — **never a link** — and
running each entry, with the rename asserted back and the control re-run after:

| entry | package present | package absent |
|---|---|---|
| `check:docs` | 0 | **1** — `Cannot find module` |
| `typecheck` | 0 | **2** — `Cannot find module` |
| `check:scheduler` | 0 | **1** — its own `D1` |
| `test:l6` | 0 | **1** — `ERR_MODULE_NOT_FOUND` |
| `lint` | 0 | 0 |
| `check:source` | 0 | 0 |

**Four entries, not one.** And the snippet the row names is tagged ` ```ts check `, which
`check-docs.mjs`'s own header says is *"typechecked only"* — so the mechanism is **type resolution**
rather than a runtime import, and `typecheck` fails for the same reason with no snippet involved at
all. The conclusion Q148 draws survives and is stronger; its reason and its scope were both wrong.

### 4. What parallelising could buy, as an upper bound rather than a measurement

Serial, the six self-tests are 404.1 s. Fact 3 says `check:scheduler:selftest` cannot overlap
`check:docs:selftest`, `typecheck`, `test:l6` or `check:scheduler`. Running the other five
concurrently and that one alone bounds the half at
`max(28.0, 81.2, 141.7, 16.4, 123.0) + 13.9` = **155.6 s**, against 404.1 — a **2.6x** saving and
about 250 s off the gate.

**This is arithmetic, not a measurement.** It ignores CPU contention on six Node processes, and
`check-markdown:selftest`'s 141.7 s is a floor no arrangement gets under **without changing what is
proved**. It is recorded so the decision has a number to reject rather than an intuition.

## Scope

**In**

1. **[Q149](../open-questions.md) closed in all six.** The dispatch is bound, and the binding is
   provoked in all six rather than in the one that motivated it.
2. **A decision on what the gate proves**, taken as an ADR and argued from fact 1's table — with the
   same table re-measured after, so the plan's own exit artifact is the pair.
3. **[Q133](../open-questions.md) and [Q148](../open-questions.md) corrected in the register**, from
   facts 1 and 3, whether or not the decision changes anything.

**Out** — named rather than left implicit

- **Deleting or weakening any check.** The question is what the gate PROVES and when, not whether the
  clauses are worth having; every one of them was earned by a measurement in P8 or P9.
- **`doc/workflow.md` rule 8.** Its obligations are why the self-tests exist. A plan that changed the
  rule to make its own cost problem smaller would be arguing backwards.
- **The product half.** L0-L6 is 20.5 s of 433.7 and nothing here touches it.

## Decisions taken before fan-out

**1. The decision is W39's and is NOT pre-empted here.** This plan states the numbers and refuses to
state the answer, because [P5](p5-a-third-and-fourth-policy-or-repairs-of-the-first-two.md)'s W15
established that building the evidence before writing the decision is what stops the decision being
written from the prose. Four candidate answers are named in W39's row and none is preferred here.

**2. Q149 is closed FIRST, before the cost decision.** If the cost decision moves self-tests out of
the gate, a dispatch nothing binds becomes harder to reason about, not easier — and the fix is
cheap and independent. Serial, W38 then W39.

## Work items

| id | | owns |
|---|---|---|
| **[W38]** | **DONE.** *The dispatch nothing binds.* [Q149](../open-questions.md) is closed in all **seven** checks — six plus the one this item adds, which covers itself. **Three clauses, not one: `G1` runs each script and requires the sentinel; `G2` reads the DEFAULT target the gate actually loads, which `G1` structurally cannot see; `G3` derives the manifest's entries from DISK both ways.** Two of the three came from the readers. **This row's own instruction was falsified by measurement**: inside `check-source.mjs` the clause cost **+236 s**, because that file is re-run **461** times by its own self-test, so it moved to `scripts/check-wiring.mjs` under an amendment put to the maintainer. [Q176](../open-questions.md)-[Q178](../open-questions.md) | `scripts/check-wiring.mjs` and `scripts/check-wiring-selftest.mjs` (**both NEW**), `scripts/check-source.mjs`, `package.json`'s two new entries, and the `--self-test` dispatch in the six `scripts/check-*.mjs` |
| **[W39](../work-items/w39-what-the-gate-proves-and-what-it-costs.md)** | **DONE — [ADR 0039](../decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md), and the answer is ORDER and CONCURRENCY: the two properties of the chain nobody had ever chosen.** 516.1 s to **393.1 s** (318.2 at code-complete; the readers' twelve blocking findings cost 75 s, all of it on the critical path), nothing deleted and no bound lowered; (a), (c), (d) and (e) all refused with a measurement each. **The chain now climbs the ladder** — it ran 488.9 s of self-test ahead of `lint`, in a chain whose own `S12` asserts order *because* `&&` is the only implementation that ladder has. **Two of the seven cannot share the tree and only one of the two was predicted**: `check-wiring-selftest.mjs` stages every check flat into `dev-dist/` and runs it, which destroyed two neighbours' fixtures and produced three findings that were facts about another process. **`G4` replaces the three clauses the seven lost by leaving the chain.** [Q133](../open-questions.md) and [Q148](../open-questions.md) RESOLVED; [Q181](../open-questions.md)-[Q182](../open-questions.md) raised, which is why the block was extended. *(The row below is the declaration.)* **DECLARED.** *What the gate proves, and what it costs — the decision.* Re-measure fact 1's table, take **ADR 0039**, implement it, and re-measure. The four candidates, none preferred: (a) keep it as it is and record that the cost is deliberate; (b) parallelise within fact 3's constraint; (c) move some or all self-tests to a separate entry the gate does not run, with something else requiring them; (d) reduce what the two 120-second self-tests prove. **Its declaration adds a fifth — (e) stop paying for a process per probe — and finds that (c) is two changes rather than one**, because there is no CI, no workflow and no git hook, so there is no *something else* to move them to. [Q179](../open-questions.md)-[Q180](../open-questions.md) | `package.json`, `scripts/**`, `doc/decisions/0039-*.md` |
| **[W40]** | **reserved and expected unused**, on P9's precedent. If W39's decision needs a second item to implement it, this is the id | — |

## Predictions, written down before the items that test them

**P10's retro corrected v0.10's wording here**: a prediction derived from a measurement already taken
checks the reasoning, and only a prediction about a mechanism's reach can reverse. **Two of each.**

| # | prediction | tested by | what would reverse it |
|---|---|---|---|
| 1 | **CONFIRMED, and half of it was reversed.** `S11` and `S12` do not catch the dispatch, exactly as derived. But *"read the SCRIPT rather than the manifest"* is **wrong about the manifest**: `G3` exists because both new entries were repointable at another script, and deletable outright, for **zero** — `S12` binds entry NAMES and nothing bound an entry's ARGUMENT. The new clause reads the script AND the manifest AND the directory listing, and it needs all three | W38 | either check already covering it, which would make Q149 a documentation error rather than a hole |
| 2 | **CONFIRMED, and it checked the reasoning rather than the world** — P10's retro's distinction, and this is the derived kind. Nothing was deleted, no probe dropped and no bound lowered; ADR 0039 moves ORDER and CONCURRENCY instead. **What could have reversed it did not arise**: no self-test was found to grade something its check's own probes already cover | W39 | a measurement that some self-test grades nothing its check's own probes do not |
| 3 | **CONFIRMED, five times, and once in the direction that matters most.** Three relocation defects and two stub defects each wore the verdict of a finding until the control separated them; and in the item's own provocation set, *`G1`'s spawn timeout is one millisecond* was **caught BY the control** — one named line instead of eight misleading verdicts. It is a fact about provocation harnesses | W38 | the set running clean, which would make v0.11 a fact about ad-hoc harnesses rather than about provocation harnesses |
| 4 | **CONFIRMED, from ONE arrangement, and the floor is where it said.** Measured: **393.1 s**, of which **365.0 is `selftests`**, and `check:markdown:selftest`'s ~170 s floor is where that prediction named it. *(This row went on to say the floor was **no longer the binding constraint** because `check:wiring:selftest` runs alone for ~200 s and *the exclusive prefix dominates*. **P11's retro measured both over three gates and withdrew that half**: the prefix reads 180.4 / 174.0 / 173.1 s and the group — which IS `check:markdown:selftest` — reads 176.2 / 183.7 / 185.0, so the two are the same size to within [Q179](../open-questions.md)'s band and which one leads is not a property of the tree. The prediction was right about the floor **and** about the reason; what is new is a **second term of the same size**, so the wall is roughly twice the named floor.)* **Contention is now measured and it is the half fact 4 could not see**: the serial-equivalent SUM rises 5-20% under concurrency, so the saving is waiting rather than work. *One arrangement is one arrangement* — this is the kind of prediction that could have reversed, and it did not | W39 | a measured arrangement below it, which would mean the serial cost was scheduling rather than work |

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q133](../open-questions.md) | what the gate should cost — **the plan's question** | **W39**, by ADR 0039 |
| [Q149](../open-questions.md) | the `--self-test` dispatch nothing binds — **RESOLVED by W38**, in all seven | **W38** |
| [Q148](../open-questions.md) | a META entry is two check runs, and the two self-tests cannot run concurrently — **its row is corrected by fact 3 before any item starts** | **W39** if the decision is (b); otherwise corrected and left open |
| [Q138](../open-questions.md) | which probe gets the credit is an artefact of `PROBES`' order | no owner — named because W39's option (d) would touch it |
| [Q158](../open-questions.md) | a whole `*.test.ts` file renamed out of the runner's glob is noticed by nothing | no owner — the same class as Q149 one directory across, and **explicitly not this plan's** |

## A note on ids

**ADR 0038 is SPENT and is not reused.** [W37](../work-items/w37-the-scheduler-pin-moves-to-0-5-2.md)
reserved it and skipped it, and the precedent is P9 reserving 0034-0035, skipping both, and P10 taking
0036-0037. `doc/workflow.md` section 3: ids are never reused and never renumbered, and a reserved id
that was not spent is still not free.

**[Q168](../open-questions.md) and [Q169](../open-questions.md) are a gap, and gaps ARE free** — W36
reserved Q167-Q169 and used only Q167. This plan starts at **Q176** anyway, because a block that
starts inside an old reservation is the collision four consecutive items had.

## The baseline this plan starts from

`d6ebaaf`, clean tree, `GATE EXIT=0`, zero FAIL lines, 19 chain entries.

```
433.7 s wall, timed per entry in one pass  (9.1 checks / 404.1 self-test / 20.5 rest)
574 test() CASES, 21 files, in node 24.20.0, deno 2.9.6 and chromium
638 assertions at L6, 0 failed, in node and deno
spec — 7 documents, 33 examples, 80 rules
markdown — 76 documents, 2747 relative links, 126 anchored
register — 132 questions, 92 open, 2 deferred, 38 resolved
```

**Three things about those numbers.** `npm run gate` runs `test:browser`, which is **chromium only**.
**574 counts `test()` cases and 638 counts individual assertions ([Q98](../open-questions.md)) — they
are never added.** And the 433.7 s is a **fourth** reading beside P9's 366, 438 and P10's 9m40; the
spread is real, which is why fact 1 times the entries within one pass rather than comparing two runs.

## Record

**P11 is COMPLETE.** Two items, two done, **W40** reserved and never issued, and the
question it was declared to answer — *what should `npm run gate` prove, and what is it actually
proving?* — is answered by
[ADR 0039](../decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md):
**everything it proved before, in ladder ORDER, with the seven `:selftest` entries run
CONCURRENTLY.** Nothing deleted, no probe dropped, no bound lowered.
[Q133](../open-questions.md), [Q148](../open-questions.md) and [Q149](../open-questions.md) are all
**RESOLVED**; [Q176](../open-questions.md)-[Q183](../open-questions.md) are raised and **all eight are open**. `doc/workflow.md` is **[v0.12](../workflow.md)** — three changes adopted, three proposals
refused.

**Every one of its defects is in the INSTRUMENT rather than in the product**, which is what a process
plan is for and is not unique to it — [P8](p8-what-can-be-deleted-with-the-gate-green.md) and
[P9](p9-when-a-check-stops-checking-what-notices.md) were the same shape, and P11 is the third in
four. The files it touched are **the manifest, the `scripts/` directory and documents, and nothing
else**: `src/`, `spec/`, `test/` and `examples/` are byte-unchanged across both items. L1 is unmoved at
**574 cases in five runtimes** and L6 at **638 assertions over 31 real runs**, which is the declared
result.

## The exit artifact

**The plan asked for a pair of timed tables and the dispatch bound in all six checks. Both halves
exist; the first half's METHOD was falsified by W39's declaration and replaced before it was used.**

```
                                   before          after
TOTAL                             516.1 s        393.1 s      -23.8%   outside the +-13% band
  L0 - lint, typecheck               7.8 s          7.9 s       +0.1 s  INSIDE the band - no claim
  the seven checks                   8.9 s          9.5 s       +0.6 s  INSIDE the band - no claim
  L1-L6, three runtimes             10.5 s         10.7 s       +0.2 s  untouched by design
  proving the checks can fail      488.9 s        365.0 s      -25.3%   outside the band
                                                                        ratio 54.9x -> 38.4x
chain entries                          21             15
```

**Every number states which side of the band it falls on, and the band was declared BEFORE the
change** — [Q179](../open-questions.md), which measured two whole passes over one unchanged tree at
**+13.0%** and three back-to-back runs of one entry at **32%**. That is the half of the exit artifact
the plan did not ask for and needed: *P11's own `Exit:` line asked for two single passes, and a pair
of single passes cannot argue a change smaller than 13%.*

**And the second half is SEVEN checks rather than six.**
[W38](../work-items/w38-the-dispatch-nothing-binds.md) added `scripts/check-wiring.mjs`, which covers
itself, and closed [Q149](../open-questions.md) with **three** clauses where the plan predicted one:
`G1` runs each `:selftest` script and requires a sentinel; `G2` reads the DEFAULT that dispatch loads
when nothing sets the override; `G3` derives the manifest's entries from the disk both ways. **Two of
the three came from the readers.**

**One number this retro added, because it is the answer to what happens next and the runner reports it
for free — and it took TWO runs to state honestly, which is change 2 firing on the retro that adopts
it.** `npm run selftests` prints its own decomposition, so no instrument is needed. Two end-to-end
`npm run gate` runs, both `GATE EXIT=0`, zero lines beginning `FAIL`, 15 entries:

```
                             run A     run C     run D    (A is the control, taken BEFORE any of this
selftests wall              356.7 s   357.6 s   358.1 s    retro's edits; C and D are after. A fourth
  serial-equivalent         668.6 s   681.9 s   687.2 s    read 357.2 and is not broken out.)
  check:wiring:selftest     167.8 s   160.9 s   160.0 s  ALONE
  check:scheduler:selftest   12.6 s    13.1 s    13.1 s  ALONE
  = exclusive prefix        180.4 s   174.0 s   173.1 s    50.6% / 48.7% / 48.3% of the wall
  check:markdown:selftest   176.2 s   183.7 s   185.0 s  1 of 5
  check:docs:selftest       155.6 s   162.6 s   164.9 s  1 of 5
  check:source:selftest      99.5 s   102.4 s   103.0 s  1 of 5
  check:spec:selftest        32.5 s    33.2 s    34.1 s  1 of 5
  check:policies:selftest    24.4 s    26.1 s    27.0 s  1 of 5
  = concurrent group        176.2 s   183.7 s   185.0 s    the max of the five, which is markdown
```

**The two entries that must run alone are roughly HALF the self-test half — 50.6%, 48.7%, 48.3% — and
that is the whole of what can be claimed.** *This paragraph first said they **cost more than the other
five together**, from run A alone, where the prefix is 180.4 against a group of 176.2. **Run C reverses
it and run D reverses it again** — 174.0 against 183.7, and 173.1 against 185.0. The two terms are the
same size to within [Q179](../open-questions.md)'s band and which of them leads is not a property of
the tree, so* **the exclusive prefix is the binding constraint** *is a claim inside the noise and is
withdrawn — here, in [ADR 0039](../decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md),
in [Q182](../open-questions.md)'s row and in the prediction-4 verdict, all four of which said it.*
**Change 2 fired on the retro that adopted it, in the paragraph that adopted it**, and what caught it
was re-taking the number on the tree that ships rather than on the tree the work started from. *One
run is one run, which is this plan's own `Exit:` line and its own [Q179](../open-questions.md), and
knowing that is not the same as not doing it.*

**The retro's own gate**: `GATE EXIT=0`, **zero lines beginning `FAIL`**, 15 chain entries, and
**80 documents / 2978 relative links / 140 anchored** through `M1`-`M5`. **A control run was taken
BEFORE any of this retro's edits and was also green**, so a red result at any point would have been the
retro's and not the tree's — v0.11's harness requirement applied to a documentation pass, which is not
what it was written for and cost nothing. **The gate this retro ships on read 401 s**, the last of four consecutive green runs over this retro's
own edits. End-to-end wall clocks span **386 to 463 s over nine runs**, against a
sum-of-per-entry-medians of 393.1 — so the end-to-end figure varies by 20% and the `selftests` figure
inside it by at most 4.3%, over the samples stated. *(Section 1 rule 4: the two ranges above were
widened to include that last run AFTER it, so the sentence you are reading was not itself gated. It
adds no link, no count a check reads and no code, and the four runs before it were green on prose
identical but for these numbers — which is the stopping rule this paragraph needed and did not have
three drafts ago.)*

**What reproduces far better is the wall clock of the whole entry**: **355.7 to 371.1 s over seven
runs — a spread of at most 4.3%**, against a per-entry band of 13% and a single-entry spread of 32%. *Concurrency averages the
variance the serial chain exposed*, which is a consequence of ADR 0039 nobody predicted.
[Q182](../open-questions.md) had a direction and now has a price: **roughly half of ~358 s**, taken
from the runner's own output.

**And this retro made FOUR successive claims about that spread and the next run falsified each** —
±0.3% over three runs, ±0.2% over four, 0.7% over five, then a sixth at 362.0, then *under 2% over six*
and a seventh at 371.1. **[Q179](../open-questions.md) firing FOUR times inside the retro that cites
it.** The form that survives is the one v0.10's writing clause already prescribes: **state the scope,
and state it as a bound a further sample can only widen.** *At most 4.3% across seven runs* is a fact
about seven runs; *±0.2%* was a claim about the machine, and it was falsified within the hour. **A
number stated without its sample is a prediction wearing a measurement's clothes** —
the sharpest single thing this retro learned, and it learned it about itself rather than about either
item.

## The four predictions

**All four CONFIRMED, and the interesting result is that two of them were RIGHT ABOUT THE CONCLUSION
AND WRONG ABOUT THE MECHANISM — both of those being the reversible kind.** P10's retro settled that *a
prediction derived from a measurement you already have checks your reasoning; a prediction about a
mechanism's reach checks the mechanism, and only the second can reverse.* P11 was written to that
distinction, two of each, and it produced a sharper result than a clean four-for-four would have.

| # | kind | verdict |
|---|---|---|
| 1 | **both, in one row** | `S11` and `S12` do not catch the dispatch — **derived**, from clauses read out of `check-source.mjs`, confirmed. *"So read the SCRIPT rather than the manifest"* — **reach**, and it **reversed**: both of W38's new entries were repointable at another script, and deletable outright, for **zero**, because `S12` binds entry NAMES. The shipped clause reads the script AND the manifest AND the directory listing and needs all three |
| 2 | derived | Nothing deleted, no probe dropped, no bound lowered. **The weakest of the four, and the reason is stated**: P11's own `Out` section put *deleting or weakening any check* out of scope, so most of what could have reversed it was ruled out before the item started. What remained — candidate (d), *reduce what the two 120-second self-tests prove* — was refused on a **measurement** and not on the scope: those two now run **at the same time as each other**, so reducing either buys at most the difference between them |
| 3 | **reach** | v0.11's harness requirement generalises past its founding cases: **five instances inside W38 alone**. The one that matters most is *`G1`'s spawn timeout is one millisecond* being **caught BY the control** — one named line instead of eight misleading verdicts. **The strongest prediction of the four, and the only one that was about the world rather than about this repository's own tables** |
| 4 | **reach** | No arrangement reached ~170 s without changing what is proved; **393.1 s measured**, of which 365.0 is `selftests`. **Right about the number AND about the reason, and W39 then over-read its own measurement.** `check:markdown:selftest` is the concurrent group and it reads **176.2 / 183.7** — the floor the prediction named. What W39 did not see is a **second term of the same size**: the exclusive prefix at **180.4 / 174.0**, one of whose two entries nothing had predicted. W39's Record and ADR 0039 called that prefix *the binding constraint*, from one run; **this retro measured two and withdrew it** — the two terms are the same size to within [Q179](../open-questions.md)'s band and which leads flips. **And it is confirmed from ONE arrangement**, which is not the same as established: a second lane assignment, a different machine, or [Q182](../open-questions.md) closed would each move it |

**So the corrected reading of P10's rule, from this plan's evidence.** A derived prediction can be
confirmed and say nothing (2). A reach prediction can be confirmed *and still be wrong about its own
mechanism* — 1's second half reversed outright, and **4 was right and its VERDICT was wrong**, which is
the sharper case: the prediction held and the sentence written to confirm it over-read a single run.
**The value of writing a prediction down is not the verdict but the half of the sentence that turns out
to be load-bearing**, and in three of these four rows that half is not the one the prediction was named
for.

## The verdict on v0.11's harness requirement — CONFIRMED, and it fired before the plan started

*Rule 8's newest requirement: the harness carries a control, and the restore is asserted.* P11 is its
first full plan.

**It earned its keep at least six times in two items, and once before either item began.** P11's own
fact 2 — the Q149 probe measured across all six checks — first cut more than the dispatch and produced
**exit 1 in all six**, a crash reading as a detection; *the control had already been run and held, so
the red was the probe's and not the tree's.* **W38 then shipped NINE defects, every one in the
instrument and none in the clause**: a stub at a fixed path that `check-source`'s own child deleted
out from under four siblings; two relocation strategies that each died on a fact about the harness; a
`META` pass grading against the real check and reporting **0/2 STILL CAUGHT**, which is the strongest
verdict that file can print. **Defects 1, 3 and 4 each looked exactly like a finding**, and the
control is the whole of what separated them. W39 ran the same discipline — restores asserted by md5
throughout, control green, tree byte-identical — twice.

**And it reached one shape it does not cover, which is the honest limit.** Running the seven
concurrently produced *an `X4` probe uncaught*, *a probe tripping `[X1,X4]`* and *the mutant did not
run: this is a crash, not a detection* — **three findings that were facts about a NEIGHBOURING
PROCESS**. A control is per-harness; the hazard was cross-process, because
`check-wiring-selftest.mjs` stages every check flat into `dev-dist/` and one of those copies reaches
the real `check-docs` body and deletes a fixed path another self-test is driving. **The requirement
was written for a harness that destroys its own subject and this is a harness that destroys its
neighbour's.** Isolated by measurement rather than by reasoning — green beside `check:wiring`, red
beside `check:wiring:selftest` — and it is [Q182](../open-questions.md) rather than a rule change,
because the fix is a derived scratch path in nine files and not a sentence.

**Verdict: KEEP, unchanged.** One occurrence of a limit is a question, not an amendment.

## Name the rung: NONE of them, and that is this plan's finding about section 4

*Section 6 pass 3 rule 5 asks which level of section 4 should have caught each defect. For every
defect P11 produced the answer is the same, and it is the same because of what P11 is about.*

| defect | which rung |
|---|---|
| **488.9 s of self-test ran ahead of `lint`** for as long as the chain existed | **none.** Section 4 IS the ladder and nothing derived the chain from it; `S12` asserted ORDER and the order it asserted was the ladder's inverse |
| the `--self-test` dispatch deletable in all six at exit 0 | **none.** Rule 8 obligation (e); `S11` reads the manifest and cannot see the script |
| the one configuration `npm run gate` runs is the one `G1` and `G4` never observe | **none.** Obligation (e)'s new second question, which is why v0.12 has it |
| two self-tests destroying each other's fixtures under concurrency | **none.** Only running the arrangement finds it — L6's own argument, applied to a thing that is not on the ladder |
| W39's headline saving reported at the wrong scope | **none.** The conformity pass is the only thing that can, and here it caught one count and missed this one |
| the census reported `139 / 96` against `140 / 97` | **none.** The census is a parser an item writes, not a clause the gate has |
| four of seven probe counts in `README.md` disagreeing with what the gate prints | **none.** `doc/` is checked by nothing — the ninth refusal, on the standing argument |

**Every one is in the instrument, and section 4's ladder is about the product.** This repository has
built a rung's worth of machinery for the instrument — `S11`-`S13`, `G1`-`G5`, `D1`-`D7`, seven
self-tests — and has never put it on the ladder.

**PROPOSED AND REFUSED: a level for the gate itself.** Two arguments against, either sufficient. A
level number invites *climb to it and stop*, and the gate's own checks are not a stage of anything —
they are L0, which is where ADR 0039 has now put them. And section 4's levels are **commands you run
in order**; *"does the thing that runs the checks run them"* is not a rung, it is the same class as
section 4's own note about the five defect classes that have none. **One occurrence, recorded so a
second has somewhere to land.**

## `doc/workflow.md` v0.12 — three changes adopted, three proposals refused

**1. ADOPTED. Rule 8 obligation (e) gains a SECOND QUESTION: not *was the check run*, but *was what it
ran what SHIPS*.** Five consecutive items in commit order — W36's `--import-map`, W35's `test:l6` argument, W37's `D3`
comparing two version strings while one of them was unfetchable, W38's `G2` and W39's `G4` — every
instance found by a reader, every one blocking. **The evidence that makes it a mechanism problem rather than
carelessness**: W39 instantiated (e) three times by hand *(does `G4` record that it ran; does it
short-circuit under the stub override; does `selftests` leaving the chain get caught)* and its two
readers then found **eight more instances in the same item**, every one `npm run gate` at exit 0 with
the self-tests silently not running, **inside the check written to make that impossible**. The
author's probes broke the CHECK's wiring; the readers' broke the SUBJECT's. *That is W23's
loop-bounds asymmetry — the author bounds the lists a ROW iterates, the reader bounds the lists the
FILE iterates — reproduced in a different obligation.* Two shapes with a procedure each: bind a
command by **equality on the whole string** and run *that* command (a deletion and a suffix are two
defects — `--plan` and `echo` were closed and `|| exit 0` survived); and where a check must
**configure** its subject to observe it, **read the default declaration rather than running it**.
**The second procedure was invented twice independently, one file apart** — W38's `G2` and W39's `G5`
— which is the argument that an author does not reach it from the axis alone.

**2. ADOPTED. Section 1 rule 5's writing clause gains a WHEN: a measured number is re-taken on the
tree the item ships.** v0.10 added *a claim states the scope it was MEASURED at* and says nothing
about the moment. **An item is not finished when its work is; it is finished when two readers have
changed it**, and rule 8 already re-runs the provocation set at that moment — this puts the numbers in
the same pass. Three occurrences, three items: W23's count read from a file it had itself written;
W32's *"506 on chromium"* from a run predating the change the Record describes; and **W39, the item
whose entire subject is measurement, reporting `-38.3%` where its own ADR says `-23.8%`** — the
code-complete figure, before its readers' twelve blocking findings put 75 s back on. **Its census note
is the same defect a second time in the same item.** *Where a number is derivable in one expression,
derive it there; where it costs seven minutes to take, take it last.*

**3. ADOPTED. Section 6 pass 3 gains rule 6: a retro may correct a false claim in the files of the
items it reviews, and names which.** Change 2's own correction had nowhere legal to land — a finished
item's file is on nobody's `Owns`, and a retro has neither an `Owns` nor a declaration in which to
take an exception. **P10's parked proposal STAYS PARKED at one occurrence**, deliberately: it names
*another item's Record where it asserts something false about yours* (W35 correcting W34, with W36
acting on the claim in the meantime because it stood), and this is a plan's retro correcting an item
of its own plan. Same gap — a finished file has no owner — reached from two directions, and **the
narrower of the two fixes is the one taken**.

**PROPOSED AND REFUSED: an obligation about the `Outputs` table on a PROCESS item.** Rule 8 (b)
degenerates where the outputs are documents and decisions. W39's three (b) provocations were *delete
the ADR* — caught by `M1` as **11 dead links**, which says nothing about the ADR being right —
*delete the runner* (caught by `G4`, with `S11` silent), and *revert Q133's status cell*, which
**SURVIVED as a declared ceiling**. W38 shipped an `Outputs` row whose *what would fail without it*
cell is **blank**. **Two items, one plan, and it is a scope caveat rather than a mechanism problem**:
(b) was earned on W15/W16/W17, where an output is a renderer or a policy column and breaking it means
something. Recorded so a third occurrence has somewhere to land.

**REFUSED, for the ninth time: a check over `doc/`.** The new twist is that the derivation now costs
nothing. `npm run gate` prints every self-test's probe count on every run, and **four of the seven
rows in `README.md`'s command table disagreed with what was on the screen** — `check:source:selftest`
at 34 against 35 and `check:wiring:selftest` at 33 against 34, both P11's own doing;
`check:spec:selftest` at 18 against 20, stale from before this plan; and `check:scheduler:selftest`
at 20 against 32, which is not stale but a **correct number for a narrower set** than the sentence
around it claims. **And `doc/README.md` carries TWO rows for `doc/workflow.md`** — one in Reading
order and one in Document status, in the one index, **disagreeing by four versions**, the second
having read *v0.8, run to completion six times* since P6. All corrected by hand at this retro, as the
eight refusals before this one were. *The argument for the refusal is unchanged and the cost of
keeping it is now visible: a hand-maintained index costs one plan's retro an hour, every plan.*

**PROPOSED AND REFUSED: a LEVEL for the gate itself** — the third refusal, argued in *Name the rung*
above.

**RE-AFFIRMED, not proposed: `check-owns.mjs` stays retired for the seventh consecutive plan.**

**On `Owns`: W38 took three late exceptions and W39 one, all declared, zero undeclared.** **W39's is the positive result**: its readers' twelve blocking
findings landed entirely inside the `scripts/**` block, the first time in this plan that acting on a review
needed no exception at all — which is the argument for the wide block P8 took when it claimed that
directory.

## Reader passes

**Four passes, none empty.** W38: conformity **14** findings / 6 blocking, adequacy **28** mutations /
18 survivors / 6 blocking. W39: conformity **16** / 6 blocking, adequacy **26** mutations / 7
survivors / 6 blocking, **overlap 4** — the **nineteenth** measurement, at the top of the settled 0-4
band and inside it, both readers unprimed.

**W38 recorded no overlap**, which is the third item in two plans to skip it after W35 and W37.
**Nothing turns on it** — P6's retro closed the question to re-litigation — so the practice is
recorded rather than restored, and `doc/workflow.md` section 6's list now says it is a count of
**measurements taken** and not of items reviewed. That list read *"fourteen"* while five more had been
measured; corrected to nineteen at this retro.

**Twelve blocking findings on one item is this plan's largest single fact.** Every one was `npm run
gate` at exit 0, in the item whose subject was the gate, written by an author who had just read the
previous item's account of the same shape. That is change 1's whole evidence, and it is also the
answer to *why two readers*: the two roles split exactly as predicted — the conformity reader asked
*does `G4` do what the ADR says it does* and found three ways the gate could run nothing; the adequacy
reader asked *would anything notice* and found four more, **all of them in the one branch `G4`'s own
runs structurally cannot take**.

## What the plan answered

**[Q133](../open-questions.md) — RESOLVED. What the gate should prove does not change; WHEN and IN
WHAT ORDER it proves it does.** The answer is the two properties of the chain nobody had ever chosen.
**ORDER**: the chain ran 488.9 s of self-test ahead of `lint`, in a chain whose own `S12` asserts
order *because* `&&` in sequence is the only implementation section 4's ladder has — a rule stated
correctly, in the file that enforces it, over a list that broke it by a factor of five hundred.
**CONCURRENCY**: `npm run selftests` derives its set from `package.json` rather than from a list, and
the two entries that cannot share the tree declare themselves in their own files.

**Four of the five candidates are refused with a measurement each and not on taste**, which is the
part to carry. *(a) keep it* — refused because nothing about the arrangement was chosen. *(c) move
them off the gate* — refused because there is **no something else**: no CI, no workflow, no git hook,
so it is two changes and the second needs a repository this one does not have. *(d) reduce what the
two 120-second self-tests prove* — refused because those two now run **at the same time as each
other**, so it buys less than concurrency does. *(e) stop paying for a process per probe* — refused
**for this item and not on the merits**: 137-158 s of real interpreter boot that `NODE_COMPILE_CACHE`
does not touch (128 ms against 129), costing seven self-tests rewritten to load a check by `import`
rather than by `spawnSync`. [Q180](../open-questions.md) keeps the number.

**[Q148](../open-questions.md) — RESOLVED, and its last sentence was false.** *"The saving is not in
parallelism"*: the measurement is **488.9 s to 365.0**. And only one of the two exclusive entries was
predicted — [Q148](../open-questions.md) named `check:scheduler:selftest`; **nothing had ever said
`check:wiring:selftest` cannot share the tree either.**

**[Q149](../open-questions.md) — RESOLVED in seven checks, by three clauses.** [W38](../work-items/w38-the-dispatch-nothing-binds.md).

**And the honest correction to the plan's own headline.** P11 was declared on *the gate is 93.2%
self-test and nobody decided that*, and it argued the point against `doc/workflow.md` section 8's 90 s
plan-gate budget. **That comparison is across a line**: section 8 budgets *plan gate (L0-L6)*, and
L0-L6 is **18.6 s** — inside its budget by a factor of five, and it always has been. What costs 393 s
is proving the checks can fail, which is **not a level of section 4** and for which section 8 had **no
row at all**. *The correct statement is the stronger one: there was nothing to be over, which is what
"nobody decided that" means.* Section 8 now carries the row and ADR 0039 is corrected in place.

## Ids

**W40 is CLOSED as reserved and never issued.** ADR 0039 needed no second item: the runner, `G4`,
`G5` and the two markers all landed inside W39's `scripts/**`. **The id is not free** — section 3, and
P9's precedent of reserving ADR 0034-0035 and skipping both. The next plan starts at **W41**.

**ADR 0039 is the only decision taken. ADR 0038 stays spent and unused** ([W37](../work-items/w37-the-scheduler-pin-moves-to-0-5-2.md)
reserved and skipped it); the next plan starts at **ADR 0040**.

**Q176-Q183: all eight used, and the block was extended TWICE** — the first plan to spend a reserved
block before its second item raised a question, and the second consecutive plan to spend the whole of
it. Three by W38, two by W39's declaration, two more by W39's Record and one after its readers
reported. **[Q133](../open-questions.md), [Q148](../open-questions.md) and
[Q149](../open-questions.md) resolved.** The next plan starts at **Q184**, and
[Q168](../open-questions.md)-[Q169](../open-questions.md) remain a gap, which is free.

**This retro raises no question and resolves none**, which is deliberate:
[Q181](../open-questions.md) (the marker is bound to nothing — removing it alone costs **zero**),
[Q182](../open-questions.md) (now priced at 180.4 s of critical path) and
[Q183](../open-questions.md) are live, unowned and the next plan's raw material.

## Census — CONFIRMED for the eighth plan running, and the parser aborted ZERO times

**140 questions — 97 open, 2 deferred, 41 resolved**, 36 ids in both tables, **140 of 140 in exactly
one cluster cell**. Re-derived by a parser written for this retro, from the register's own accumulated
predicate and nothing else.

**It is the first census parser in eight plans to be right on its first run**, and that is the result
rather than the number. Seven derivations have been wrong in seven different directions — splitting on
escaped pipes, refusing to split on them, honouring only the strict row shape (which silently merged
Q87 into Q86 and lost a whole question), reading a bare `/Q\d+/` over `Q8-Q12` and losing the
interior, checking the width on the wrong line in two opposite directions, classifying an exempt row
from its whole text, testing the status cell for a substring rather than a first word — and **every
one of those seven is written down in the register, beside the number**. The eighth parser was
assembled from that list and needed nothing else. *Writing the hazard into the file the parser reads
is the mechanism, and after seven plans it worked.*

**And it found the standing line right and the note beside it wrong.** The register's summary reads
140 / 97 / 2 / 41 and W39's re-derivation, two lines below it, reads **139 / 96** — with *"140 of 140
in exactly one cluster cell"* in the same sentence, because the cluster half was re-run after
[Q183](../open-questions.md) landed and the population half was not. **The provenance clause says read
the item's own file rather than an index; here the index was right and the derivation was stale**, and
the reason is change 2's: the count was taken before the last thing the item did.

## What this plan taught, in one paragraph

**A check that must configure its subject in order to observe it has not observed the configuration
that ships, and no amount of knowing that stops an author writing the check anyway.** W38 wrote its
scope section refusing a substring test by name and then shipped one; W39 quoted W38's sentence about
the override and then shipped the same hole one file across. Both were closed by readers, and both
closures were the same procedure — *read the declaration rather than running it* — invented twice,
independently, one item apart. **That is what the difference between an axis and a procedure costs**,
and it is the second time this document has learned it: v0.9 stated the provenance PROCEDURE after the
axis had been corrected four times across three items; v0.12 states this one after five items. *The lesson is not that authors
should try harder. It is that an obligation which names a question and not an edit will be answered
with the edits the author can already imagine.*
