# P11 — What should the gate prove, and what is it actually proving?

**Status:** DECLARED 2026-09-09, after [P10](p10-is-fan-out-one-feature-or-two.md) closed and
`doc/workflow.md` reached [v0.11](../workflow.md). **No item has started.**

```
Question:   What should `npm run gate` prove, and what is it actually proving?
Reserves:   W38-W40 (W40 expected unused), Q176-Q180, ADR 0039
Exit:       a gate whose cost is a DECISION rather than an accident - the same
            nineteen entries timed in one pass before and after, with the change
            argued from the pair; and the `--self-test` dispatch bound in all six
            checks, so 404 seconds of the gate can no longer be removed by
            deleting 151 bytes.
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
| **[W39]** | **What the gate proves, and what it costs — the decision.** Re-measure fact 1's table, take **ADR 0039**, implement it, and re-measure. The four candidates, none preferred: (a) keep it as it is and record that the cost is deliberate; (b) parallelise within fact 3's constraint; (c) move some or all self-tests to a separate entry the gate does not run, with something else requiring them; (d) reduce what the two 120-second self-tests prove | `package.json`, `scripts/**`, `doc/decisions/0039-*.md` |
| **[W40]** | **reserved and expected unused**, on P9's precedent. If W39's decision needs a second item to implement it, this is the id | — |

## Predictions, written down before the items that test them

**P10's retro corrected v0.10's wording here**: a prediction derived from a measurement already taken
checks the reasoning, and only a prediction about a mechanism's reach can reverse. **Two of each.**

| # | prediction | tested by | what would reverse it |
|---|---|---|---|
| 1 | **CONFIRMED, and half of it was reversed.** `S11` and `S12` do not catch the dispatch, exactly as derived. But *"read the SCRIPT rather than the manifest"* is **wrong about the manifest**: `G3` exists because both new entries were repointable at another script, and deletable outright, for **zero** — `S12` binds entry NAMES and nothing bound an entry's ARGUMENT. The new clause reads the script AND the manifest AND the directory listing, and it needs all three | W38 | either check already covering it, which would make Q149 a documentation error rather than a hole |
| 2 | **The decision will not be *delete them*.** Derived from P8's and P9's records: every clause the self-tests grade was earned by a measured hole | W39 | a measurement that some self-test grades nothing its check's own probes do not |
| 3 | **CONFIRMED, five times, and once in the direction that matters most.** Three relocation defects and two stub defects each wore the verdict of a finding until the control separated them; and in the item's own provocation set, *`G1`'s spawn timeout is one millisecond* was **caught BY the control** — one named line instead of eight misleading verdicts. It is a fact about provocation harnesses | W38 | the set running clean, which would make v0.11 a fact about ad-hoc harnesses rather than about provocation harnesses |
| 4 | **No arrangement gets the gate under ~170 s without changing what is proved.** *About a mechanism's reach* — fact 4 is arithmetic and contention is unmeasured | W39 | a measured arrangement below it, which would mean the serial cost was scheduling rather than work |

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

*Filled in at the join, after the work items are merged.*

**Exit artifact.** *The two timed tables, and the dispatch bound in all six.*

**What the plan answered.** *Q133, and whether the gate's shape was a decision or an accident.*

**Retro.** *`doc/workflow.md` section 6 pass 3. It owes a verdict on each of the four predictions, and
on v0.11's harness requirement — which fact 2 has already fired once, before any item started.*
