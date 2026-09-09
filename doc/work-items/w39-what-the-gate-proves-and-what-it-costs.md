# W39 — What the gate proves, and what it costs — the decision

**Status:** done
**Plan:** [P11](../plans/p11-what-should-the-gate-prove.md) — *what should the gate prove, and what is
it actually proving?*

```
Spec:       none - the gate is a process artefact and spec/ does not describe it.
            doc/workflow.md section 4 defines the LADDER; what runs it, in what
            order, and how often, is package.json's `gate` entry and nothing else.
Owns:       package.json, scripts/** (every check and every self-test), and
            doc/decisions/0039-*.md. W40 is reserved if implementing the
            decision needs a second item.
Inputs:     P11 fact 1, RE-MEASURED below rather than read from the plan - the
            plan's table predates check:wiring and is 21 entries now, not 19.
            P11 fact 3's concurrency constraint, read from the plan's own file.
            Q176's multiplier, made countable by W38 and generalised below.
Outputs:    ADR 0039 - what the gate proves and when, argued from a cost measure
            that is REPRODUCIBLE, which wall time here is not (fact 2).
            The chain implementing it, and the same measurements re-taken after,
            so the item's exit artifact is the PAIR rather than a single run.
            Q133 and Q148 corrected in the register from facts 1 and 3.
Depends on: W38 - done. P11 decision 2 orders them: the dispatch is bound before
            anything moves, so a self-test relocated by this item cannot be
            silently unrun by the hole W38 closed.
Blocks:     nothing. It is P11's last item unless W40 is needed.
Tests:      the gate itself, timed and COUNTED, before and after. Expected values
            come from the four facts below, which are measurements rather than
            the plan's prose - two of them correct what the plan states.
Gate:       L0, the whole gate, then the spec-conformity pass (two readers).
Reserves:   Q179-Q183, ADR 0039  (declared Q179-Q180; the declaration step spent
            BOTH, so P11's block is extended to Q176-Q183 rather than a
            neighbour's borrowed - see the Owns audit)
```

## What was measured before this item was declared

**Four facts. Two of them change what this item can honestly do, and one of those invalidates the
plan's own stated exit criterion.**

### 1. The gate is 482.9 s over 21 entries, and the SHARE did not move

One pass, clean tree at `ff2d064`, every entry timed individually as `npm run <entry>` — which is
what the gate pays — rather than subtracted across two runs:

| entry | s | | entry | s |
|---|---|---|---|---|
| `check:spec` | 0.7 | | `check:scheduler` | 0.7 |
| `check:spec:selftest` | 23.3 | | `check:scheduler:selftest` | 13.7 |
| `check:source` | 0.7 | | `check:policies` | 0.7 |
| `check:source:selftest` | **75.9** | | `check:policies:selftest` | 15.7 |
| `check:wiring` | 1.9 | | `check:docs` | 4.7 |
| `check:wiring:selftest` | **67.4** | | `check:docs:selftest` | **119.5** |
| `check:markdown` | 0.8 | | `lint` | 0.7 |
| `check:markdown:selftest` | **134.4** | | `typecheck` | 9.2 |
| `test` | 1.3 | | `test:deno` | 1.7 |
| `test:browser` | 3.5 | | `test:l6` | 3.3 |
| `test:l6:deno` | 3.1 | | | |

```
TOTAL                   482.9 s   over 21 entries (was 433.7 over 19)
the seven checks         10.2 s   ( 2.1%)
proving they can fail   449.8 s   (93.1%)
everything else          22.9 s   ( 4.7%)      ratio 44.2x
```

**W38 added 69.3 s and the total rose 49.2**, so the rest of the gate read ~20 s cheaper than it did
three days ago. **The share is 93.1% against 93.2% and the ratio 44.2x against 44.3x** — a whole new
check and its self-test moved neither. *The plan's headline is a property of the shape of this gate
rather than of its contents, which is an argument the plan could not make from one measurement.*

### 2. **The table is not reproducible, and P11's stated exit criterion depends on it being so**

Two consecutive passes, same tree, same machine, nothing else running:

| entry | pass 1 | pass 2 | | entry | pass 1 | pass 2 |
|---|---|---|---|---|---|---|
| `check:docs:selftest` | 119.5 | **171.1** | **+43.3%** | `typecheck` | 9.2 | **19.1** | **+108.8%** |
| `lint` | 0.7 | 1.7 | **+126.2%** | `check:wiring` | 1.9 | 1.1 | −44.2% |
| `test:browser` | 3.5 | 4.8 | +36.6% | `test:deno` | 1.7 | 1.2 | −33.8% |
| `check:markdown:selftest` | 134.4 | 134.4 | −0.0% | `check:source:selftest` | 75.9 | 76.5 | +0.8% |
| **TOTAL** | **482.9** | **545.8** | **+13.0%** | | | |

**P11's `Exit:` line says *"the same nineteen entries timed in one pass before and after, with the
change argued from the pair"*.** A pair of single passes cannot distinguish a change from noise below
**±13% at the total and ±43% at the largest single cell** — and `check:docs:selftest`, the second most
expensive entry in the gate, is the one that moved most. **Any saving this item might argue for that
is smaller than that band is unmeasurable by the plan's own method.**

*The two cheapest entries moved by more than 100% and the most expensive moved by nothing, so this is
not a scaling factor that can be divided out.*

### 3. **A deterministic proxy exists, and it is process starts**

`NODE_OPTIONS` is inherited by children, so an `--import` hook that appends one line per process start
counts the whole tree a self-test spawns. **This number does not vary between runs: it is what the
file does.**

| entry | node starts | runs the check body | dispatch-only | s / start |
|---|---|---|---|---|
| `check:spec:selftest` | 89 | 66 | 23 | 0.26 |
| `check:source:selftest` | **587** | 463 | 124 | 0.13 |
| `check:wiring:selftest` | 502 | 148 | **354** | 0.13 |
| `check:markdown:selftest` | **527** | 409 | 118 | 0.26 |
| `check:scheduler:selftest` | 134 | 100 | 34 | 0.10 |
| `check:policies:selftest` | 222 | 215 | 7 | 0.07 |
| `check:docs:selftest` | **522** | 513 | 9 | 0.23 |
| **total** | **2583** | 1914 | 669 | **0.174** |

**2583 × 0.174 s = 449 s against the 449.8 s measured** — so the self-test half is, to within a second,
*a count of process starts times the cost of one*. **It independently confirms W38's number**: its
conformity reader counted 588 starts and 461 body runs for `check:source:selftest` with the same
method; this reads 587 and 463 on a tree three commits later.

**`check:wiring:selftest` is the shape the others are not** — 354 of its 502 starts carry
`--self-test` and dispatch to a stub without running any check, which is exactly what makes `G1`
affordable. **`check:docs:selftest` is the opposite**: 522 starts of which 58 are `tsc` and most of the
rest are extracted `AGENTS.md` snippets, so its cost is not process count but what each process does.

### 4. **A third of it is Node booting, and candidate (c) has no "something else"**

`node -e ""` is **59 ms** on this machine (n=20); a trivial check that opens a few files is 110 ms.
**2583 starts × 59 ms = 152 s of the 450 s self-test half is interpreter startup doing no work at
all** — about 31% of the gate.

And **there is no CI, no workflow, no git hook**: `ls .github`, `.husky` and `.git/hooks` (non-sample)
are all empty, and `package.json` has no `pre*` lifecycle entry. **`npm run gate`, run by hand, is the
only thing in this repository that runs anything.** P11's candidate **(c)** — *move some or all
self-tests to a separate entry the gate does not run, **with something else requiring them*** — has no
*something else* to move them to. It is not refuted; it is **two changes rather than one**, the second
of which reaches into a directory that does not exist yet and is in nobody's `Owns`.

## Scope

**In**

1. **ADR 0039 — what the gate proves and when.** Argued from facts 1-4 and from a cost measure the
   item states in advance, because fact 2 rules out arguing it from a single timed pass. The four
   candidates P11 names, none preferred here: **(a)** keep it and record that the cost is deliberate;
   **(b)** parallelise within fact 3's constraint; **(c)** move self-tests off the gate, which fact 4
   shows is two changes; **(d)** reduce what the two most expensive self-tests prove.
   **A fifth is added by fact 4 and is not preferred either: (e) stop paying for a process per
   probe** — 31% of the half is interpreter boot, and the checks `process.exit()` rather than
   returning, which is why they are spawned at all.
2. **A cost measure that survives being re-run.** Either repeated passes with a stated band, or the
   process-start count of fact 3, or both. **The measure is declared before the change**, so the
   after-measurement cannot be chosen to flatter it.
3. **[Q133](../open-questions.md) and [Q148](../open-questions.md) corrected in the register**, from
   facts 1 and 3 and from P11's fact 3, whether or not the decision moves anything.

**Out** — named rather than left implicit, with where it goes instead

- **Deleting or weakening a clause.** P11's scope refuses it and the reason stands: every clause was
  earned by a measured hole in P8 or P9. **(d) is about what a self-test PROVES, not about what its
  check checks** — those are different, and W38 is the demonstration: it added a clause and its own
  self-test cost 66 s, of which the clause is 0.6.
- **`doc/workflow.md` rule 8.** P11: *a plan that changed the rule to make its own cost problem
  smaller would be arguing backwards.*
- **Building the CI that candidate (c) would need.** If the decision is (c), the second half is
  **W40** — that is what W40 is reserved for, and P11's row says so.
- **The product half.** L0-L6 is 22.9 s of 482.9 and nothing here touches it.

## Verification

| Clause | How it is run |
|---|---|
| **L0** | `npm run lint`, `npm run typecheck` — **and neither reaches `scripts/**`**, which is this item's whole `Owns`. [Q177](../open-questions.md), raised by W38's conformity reader; stated here rather than discovered again |
| **the whole gate, before** | the table in fact 1, plus the pass-2 comparison in fact 2, both already taken and both above |
| **the whole gate, after** | the same commands, the same number of passes, **and the process-start count of fact 3**, which is the half that does not need a band |
| **the decision is implemented** | whatever ADR 0039 decides, provoked: the change must be visible as a failure when reverted, not only as a number |
| **conformity** | the rule first, the code second |
| **adequacy** | mutation in an isolated copy |

**Routing cases** (`doc/workflow.md` section 5 rule 6): **not applicable.** This item touches no
definition, no driver and no policy. Stated rather than left silent, which is what that rule asks.

**Rule 8, all five obligations, plus v0.11's requirement on the harness.** The obligation that bites
here is **(e) WIRING**, twice over: any arrangement that moves a self-test off the `&&` chain must
leave something that fails when it does not run — which is [Q149](../open-questions.md) one level out,
in the item that follows the item which closed it. And **(d) LOOP BOUNDS** is what candidate (d) is:
reducing what a self-test proves IS lowering a bound, and every bound in those files was put there
because lowering it cost zero.

## The trap this item is most likely to fall into, named before it starts

**Arguing from a number inside the noise.** Fact 2 measures the band at ±13% of the total; a
250-second saving clears it and a 20-second one does not. **The item must state which side of that its
claim falls on, per claim**, and section 1 rule 5's writing clause is the rule that requires it.

**And its mirror: treating the process-start count as the cost.** It is a proxy that fits to within a
second *today*, on this machine, with these seven files. `check:docs:selftest` is the counter-example
already visible in fact 3 — its cost is `tsc` and snippet execution, not process count — so a decision
optimising starts would move it least while it is the entry that moved most in fact 2.

## Record

**Gate — what ran.** Baseline `ff2d064` plus P11's uncommitted declaration prose.

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **pass** | `deno lint` and five typecheck projects clean — **and none of them reaches `scripts/**`**, which is this item's whole `Owns`, so this row says nothing about the deliverable. [Q177](../open-questions.md), stated in the declaration and true again |
| the whole gate, before | **RAN** | **516.1 s over 21 entries**, every entry as `npm run <entry>` **three times**, reported as the median. 8.9 s of checks (1.7%), **488.9 s of self-test (94.7%)**, 18.3 s for all of L0-L6 in three runtimes. **2611 node starts, 2531 of them self-test.** Ratio **54.9x** |
| the whole gate, after | **RAN** | **393.1 s over 15 entries**, same method, same machine, nothing else running. 9.5 s of checks, **365.0 s of self-test (92.8%)**, 18.6 s for the rest. **4466 starts.** Ratio **38.4x**. **At code-complete, before either reader reported, it was 318.2 s** — the twelve blocking findings cost **75 s**, all of it inside `check:wiring:selftest` and therefore all of it on the critical path. **Both totals are sums of per-entry medians, not wall clocks**: one end-to-end `npm run gate` on the finished tree reads **414 s**, `GATE EXIT=0`, **zero lines beginning `FAIL`**, 15 entries, `7/7 completed` |
| the decision is implemented | **pass** | `G4` in `scripts/check-wiring.mjs`, `scripts/run-selftests.mjs`, the reordered chain and the two `SELFTEST-EXCLUSIVE:` markers — provoked below, so reverting any of them is a named failure rather than a slower number |
| conformity reader | 16 findings, **6 blocking** | every one reproduced against the fix and refused |
| adequacy reader | 26 mutations, 7 survivors, **6 blocking** | same |
| re-run after the readers | **16 provocations — 12 caught, 2 VACUOUS, 1 SURVIVOR closed, 3 compound halves green with their controls red** | the checked-in set grew 23/11/6 to **34/14/6** |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| ADR 0039 | [`0039-…`](../decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md) | — |
| a reproducible cost measure | **declared before the change**: process starts as the primary, wall time as three runs per entry with the band stated per claim | the after-number could have been chosen to flatter the change |
| the chain implementing the decision | `scripts/run-selftests.mjs`, `package.json`'s reordered `gate` and its `selftests` entry, **`G4` and `G5`**, two markers | `G4`'s thirteen probes and `G5`'s four; `S12`'s order clause; `S11`'s seven failures |
| Q133 and Q148 corrected | both **RESOLVED**, and Q148's last sentence was **false** | — |

**What broke.**

**1. The decision was made by measurement, and one of its two halves was predicted by nothing.**
`check:scheduler:selftest` cannot share the tree and [Q148](../open-questions.md) said so.
**`check:wiring:selftest` cannot either, and nothing had ever said so**: `stage()` writes every
`scripts/check-*.mjs` **flat into `dev-dist/`** — the directory every other self-test uses for
scratch — and runs those copies with their dispatch falsified, so one of them reaches the real
`check-docs` body and `rmSync`s the fixed path `dev-dist/docs`, and another launches the **whole**
`check-spec` self-test, which deletes `dev-dist/spec-selftest`. Concurrently that produced *an `X4`
probe uncaught*, *a probe tripping `[X1,X4]`* and *the mutant did not run: this is a crash, not a
detection* — **three findings that were facts about a neighbouring process.** Isolated by running the
pairs: green beside `check:wiring`, red beside `check:wiring:selftest`. **`doc/workflow.md` v0.11's
harness requirement, one process away from the harness it was written for.**

**2. Three latent path collisions were found by READING, and the three concurrent passes hit none of
them.** `check-source-selftest.mjs` and `check-policies-selftest.mjs` wrote their `SELF` mutants to
**the same path**, `dev-dist/.self-NN.mjs`; and `check-policies-selftest.mjs` wrote its `META` mutants
into the **tracked** `scripts/` directory, where `check-markdown-selftest.mjs` copies them into its
fixture and `check-wiring-selftest.mjs` stages them flat into `dev-dist/` — as `dev-dist/.meta-NN.mjs`,
which is `check-source-selftest.mjs`'s own mutant path, and wiring deletes what it stages. All three
renamed. **[Q182](../open-questions.md)**: a latent path collision is invisible until the day it is
not, and three green concurrent runs are not evidence against one.

**3. Seven checked-in probes went vacuous on the reordered chain, and one had already been
re-anchored once for the same reason.** Rule 7 (b) firing correctly rather than passing — `wanted
[S12], got []` and *the mutation matched nothing*, seven times. **The probe named *the chain
REORDERED* is the second occurrence**: W30 re-anchored it after inserting an entry between the two it
named, re-pinned it to two other entry NAMES, and ADR 0039 removed one of those. **This item
re-anchored all seven AGNOSTICALLY** — *the last entry whatever it is called*, *the first two whatever
they are called* — anchored on the `"gate": "` key so the regex cannot match the `typecheck`
composition nine lines above. That is the difference between fixing an instance and closing the
class. *(The first agnostic version did match `typecheck`, and reported `wanted [S12], got [S13]`: an
anchor has to name the value as well as the shape.)*

**4. `check-docs.mjs` writes `dev-dist/docs` at a fixed path and `rmSync`s it on every run**, so two
concurrent `check-docs` bodies destroy each other. It is half of why `check:wiring:selftest` must run
alone, and it is not fixed here — [Q182](../open-questions.md).

**What this taught.**

**The gate's ORDER was the ladder's inverse, and the file that enforces the order says why that is
wrong.** `scripts/check-source.mjs`'s comment above `GATE_CHAIN` argues that `S12` must assert order
because *"`&&` in sequence is the only implementation `doc/workflow.md` section 4's ladder has"*, and
gives *"a chain running `test:l6` ahead of `lint` reports a sixty-second rung while L0 is broken"* as
the case. The chain it was written beside ran **488.9 seconds** of self-test ahead of `lint`. **A rule
stated correctly, in the file that enforces it, over a list that broke it by a factor of five
hundred** — section 6 pass 3 rule 3's sharpest shape, with neither the rule nor the check at fault.

**A saving is a claim about a number, and the declaration named the trap this item then had to avoid
per claim.** Of the four numbers it could report, **two clear the ±13% band and two do not**: the
total (**−23.8%**, 516.1 → 393.1) and the self-test half (**−25.3%**, 488.9 → 365.0) clear it; the
checks (**+0.6 s**) and L0 (**+0.1 s**) are inside it and **no claim is made about either**.

*(**All four of those figures read −38.3%, −40.5%, +0.3 s and −0.2 s until P11's retro**, and all four
are this item's table at **code-complete** — before its two readers' twelve blocking findings put 75 s
back on. The shipped figures are in [ADR 0039](../decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md)'s
Consequences and in the `whole gate, after` row above, which both say so; this paragraph was written
once and not re-taken. **The item whose entire subject is measurement reported its headline saving at
the wrong scope**, in the section that names `doc/workflow.md` section 1 rule 5's writing clause by
name — which is why P11's retro extends that clause with a WHEN, and why section 6 pass 3 now says a
retro may correct the files of the items it reviews.)* And the band is wider than
[Q179](../open-questions.md) measured — three **back-to-back** runs of `check:markdown:selftest`
alone spread **127.8 to 169.2 s, 32%** — so the variance is not a whole-pass drift that a per-entry
method escapes.

**The deterministic proxy is deterministic run to run and is not a property of the file.** Six of the
seven entries reproduce the declaration's start counts **exactly**, three commits later;
`check:policies:selftest` reads **170 against 222**, twice, on a tree whose only difference is prose.
*Stated rather than generalised, and unexplained.*

**And the binding for the saving cost 16% of it.** `check:wiring:selftest` went **65.5 s to 96.7 s**
and **502 starts to 765** to buy `G4` — and because that entry is one of the two exclusives, every
second of it is on the critical path. [Q176](../open-questions.md) reproducing inside the decision
that cites it: one `check-wiring` run costs 1.6 s and `G4` costs the gate 31.

**Rule 8 — 16 provocations beyond the checked-in set, run TWICE**: once at the author pass and once
in full after acting on both readers, with their exact edits checked in. Graded on the failure LINES,
each written to the tree, restored from a byte snapshot with the restore **asserted by md5**, and the
set opening with a control. *The author-pass verdicts are the table below; the re-run's are in the
readers' section above, and they differ.*

| Provocation | Verdict |
|---|---|
| CONTROL — nothing is mutated | **control green** |
| (a) `G4` stops reporting a planned entry the manifest does not declare | caught |
| (a) `G4` stops comparing the exclusive set | caught |
| (a) `G4` stops requiring the runner entry to be in the chain | caught |
| (c) `G4` reads the manifest's owed set from the runner's own plan | caught |
| (c) **compound** — that swap **with** the runner already dropping an entry | **green, and that is the finding** |
| (c) negative control — the runner drops an entry, `G4` untouched | caught |
| (c) the runner's exclusive set comes from a literal, not the marker | **green** |
| (c) **compound** — the literal list **with** the marker gone from one file | caught |
| (c) negative control — **the marker alone is removed** | **green — [Q181](../open-questions.md), measured** |
| (d) `G4` checks the command of every entry but the first | caught |
| (d) the runner's accounting compares only the lengths it has | **SURVIVED → closed** |
| (e) `G4` never records that it ran | caught, 21 report-row disagreements |
| (e) the runner short-circuits when the stub command is set | caught — **by the probe set, not by the check** |
| (e) `selftests` leaves the chain AND `GATE_CHAIN` together | caught: `S11` ×7, `G3` ×7, `G4` ×1 |
| (f) ORDER — the chain runs the self-tests first again | caught, `S12`'s order clause |
| (b) OUTPUTS — the ADR file is deleted | caught: `M1`, **11** dead links |
| (b) OUTPUTS — `run-selftests.mjs` is deleted | caught by **`G4` alone** — `S11` is SILENT, because `gateRuns` reads the manifest and the manifest still names the file |
| (b) OUTPUTS — Q133's status cell is reverted to `open` | **SURVIVED — a declared ceiling.** `doc/` is checked by nothing but `M1`/`C5`, and the register's own census is a parser an item runs rather than a clause the gate has. Eighth refusal of a `doc/` check, on the standing argument |

**One survivor, and closing it is this item's second demonstration of W34's rule.** The runner's
`if (missing.length || extra.length || completed.length !== planned.length)` was **deletable for
zero**, because `G4`'s stub clause reads the printed counts and reaches the same verdict by a
different route. The probe that closes it is a **compound**: run one fewer entry *and* report the
plan's count anyway, so `G4`'s arithmetic is satisfied and the only thing left is the exit code, which
that `if` is the only producer of. *A provenance guard cannot be graded against a correct
implementation* — W34's finding, W38's `G2` block-end, and now this.

**Two of the greens are the intended halves of pairs rather than survivors**, which is why each is
reported with its control: re-sourcing `owed` is green **because** the two sources agree on a correct
runner, and its negative control is red; the literal exclusive list is green for the same reason, and
its compound is red. **The third green has no compound and is a question**: removing the
`SELFTEST-EXCLUSIVE:` marker alone costs **zero** in `check:wiring` and in `check:source`, because
`G4` derives its expectation from the marker. [Q181](../open-questions.md).

**And one catch is worth its own sentence, because the check did not make it.** Making the runner
short-circuit whenever `CHECK_SELFTESTS_CMD` is set — the `G2` shape, where the override hides the
configuration the gate runs — leaves **`check:wiring` green**: `G4` reads `7/7 completed` and is
satisfied. It is caught by `check:wiring:selftest`, because a probe that drops an entry then produces
no `G4` failure. *The clause was fooled and the probe set was not*, and both are in the gate.

**The two readers found 16 and 26, TWELVE blocking between them, overlap 4** — the nineteenth
measurement, inside the settled 0-4 band, both readers unprimed. **Their split is the one the two
roles predict and the sharpest thing about it is that they attacked the same clause from opposite
ends**: the conformity reader asked *does `G4` do what the ADR says it does* and found three ways the
gate could run nothing; the adequacy reader asked *would anything notice* and found four more, all of
them in the one branch `G4`'s own runs structurally cannot take. **Eight blocking findings, and every
one of them was `npm run gate` at exit 0 with the self-tests silently not running.**

| | the edit | what the gate did |
|---|---|---|
| C | `"selftests": "node scripts/run-selftests.mjs --plan"` | printed a plan, ran nothing, **four checks green** |
| C | `"selftests": "echo scripts/run-selftests.mjs"` | ran `echo`, **four checks green** |
| C | `CHECK_SELFTESTS_CMD` merely **exported** in the environment | `7/7 completed, 7 ok` in 0.3 s, green |
| C | `let ok = true;` | seven **failing** self-tests, runner exit 0, green |
| A | `spawn(\`echo skipping ${command}\`)` | `7/7 completed, 7 ok` in **0.1 s**, green |
| A | `PLAN.filter((x) => x.exclusive && false)` | both hazardous entries **concurrent**, `--plan` still printing `alone` |
| A | `const PLAN = process.env.CHECK_SELFTESTS_PKG ? plan(pkg) : []` | **`0/0 completed`**, exit 0, green |
| A | the `SCRIPTS` default moved to `dev-dist` | **`0 exclusive`**, no marker ever read, green |
| A | `"selftests": "node scripts/run-selftests.mjs \|\| exit 0"` | the **shell** discarded the verdict, green |
| A | one probe re-pointed at another probe's mutation | `28/28 probes caught`, and the clause it was the only probe for deletable for **0** |

**Four of the ten are one mechanism and it is `G2`'s own sentence.** All three of `G4`'s runs set an
override, so **the configuration `npm run gate` executes is the one configuration `G4` never takes** —
which is exactly why W38 wrote `G2`, one file across, in the file this one quotes. The answer is
`G2`'s answer: **`G5` reads the DEFAULT rather than running it**, capturing the nine declarations that
decide what an unconfigured run does and comparing each to the one form it may take. *The alternative
is a run with no override at all, which is `npm run selftests`, which is 290 s.*

**And the other six are the same shape as each other**: *the name is bound and the argument is not* —
W36's `D6`, which this item's own `G4` applies to the seven `:selftest` entries and did not apply to
the one entry that reaches them. Closed by an equality on the chain entry's command and by running
**that command** rather than one this check composes. **The suffix case is the part worth carrying**:
closing the `echo` and `--plan` forms did **not** close `|| exit 0`, because `||`, `exit` and `0` are
inert argv tokens to Node — *a deletion and a suffix are two defects and one clause caught only one.*

**`alone` was a LABEL.** Every exclusivity clause compares the printed plan against the markers, so
ADR 0039 decision 4's *runs alone* was asserted about a string. **The item's own headline shape, one
layer inside the fix for it.**

**Rule 8 — re-run in full after acting on both readers, with their exact edits checked in.** The
checked-in set grew from 23 / 11 / 6 to **34 probes / 14 gradings / 6 SELF**, and the sixteen
provocations were re-run against the fixed tree:

| | |
|---|---|
| caught | 12, including all four of the readers' code edits and both new clauses |
| **VACUOUS on the re-run** | **2** — `chainEntry === undefined` and `const CMD = …;` had both been rewritten by the fixes. **Rule 7 (b) firing correctly rather than passing**, and one of them is the probe that tests the fix for a reader's finding, which is obligation (e)'s founding observation about repairs |
| **SURVIVED on the re-run** | **1**, and it is a MASKING: with `chainEntries.length !== 1` disabled the no-runner manifest is still refused, because `chainEntries[0]` is `undefined`, the command reads `''` and the **equality clause fires in its place** — same id, and the failure count does not move. W29's distinction. Closed by the discriminating case in the other direction: a manifest with **two** entries naming the runner, where `chainEntries[0]` is a real command and equality passes |
| green by design | 3 compound halves, each reported with its negative control |
| control | green, tree byte-identical, restores asserted by md5 throughout |

**And the final gate log carried one line containing `FAIL` at exit 0, which this item put there
itself.** A probe named *…against a stub that FAILS* makes `grep -c FAIL` non-zero on a green run.
Renamed to lower case. **W34 recorded the opposite direction — `GATE EXIT=1` with zero FAIL lines —
and the conclusion is the same from both ends: the exit code is the predicate and the count is a
secondary signal.**

**`Owns` audit: three declared `Owns` paths covering NINE edited files, zero undeclared, ONE late
exception.** *(This read "8 paths" and enumerated nine files — a count of neither. W39's conformity
reader, which re-ran `git status --porcelain` and confirmed the SET is exactly the declared `Owns`
plus the six record-step files.)*

- Declared and used: `package.json`; `scripts/**` — `run-selftests.mjs` (new), `check-source.mjs`,
  `check-source-selftest.mjs`, `check-wiring.mjs`, `check-wiring-selftest.mjs`,
  `check-scheduler-selftest.mjs`, `check-policies-selftest.mjs`; `doc/decisions/0039-*.md`.
  **The readers' twelve blocking findings landed entirely inside that block**, which is the first
  time in this plan that acting on a review needed no exception at all — `scripts/**` is a wide
  block and this is the argument for it that P8 made when it took the block in the first place.
- **Late: `doc/plans/p11-what-should-the-gate-prove.md`'s `Reserves:` line.** P11 reserved
  **Q176-Q180** and all five were spent — three by W38 and **two by this item's own declaration** — so
  the item had no free id for the two questions it raised. Section 3 forbids reusing one and the
  declaration forbids borrowing a neighbour's, so **the plan's block is extended to Q176-Q183** in the
  plan's own file. The record step covers a plan's *Record*, not its header.
- The record step: the plan's Record, `doc/README.md`, `CLAUDE.md`, `README.md`,
  `doc/open-questions.md`, `doc/decisions/**`.

**Questions raised.** [Q181](../open-questions.md), [Q182](../open-questions.md) and
[Q183](../open-questions.md) — the third after the readers reported, which is why P11's block was
extended **twice**. [Q133](../open-questions.md) and [Q148](../open-questions.md) are
**RESOLVED**; [Q179](../open-questions.md) and [Q180](../open-questions.md) are measured further and
left open.

**Census — CONFIRMED for the seventh plan running: 140 questions, 97 open, 2 deferred, 41 resolved**,
36 ids in both tables and **140 of 140 in exactly one cluster cell**. *(These read **139 / 96 / 2 / 41**
and *"139 of 139"* until P11's retro. The count was taken after **Q181** and **Q182** and before
**Q183**, which this item raised third, after its readers reported — so it is 137 + **three** raised
and two resolved, not 137 + two. The register's own bold summary line was right at 140 / 97 and this
note was wrong beside it. **The same defect as the −38.3% above, in the same item: a number taken
before the last thing the item did.**)* **The parser was wrong in a
fourth way and it is the mirror of W30's**: it split every row on every `|` and **aborted on `Q123`,
which renders perfectly** — that row carries an escaped pipe inside a code span, exactly as GFM asks,
since a cell may contain a pipe by escaping it *including inside an inline span*. W30's parser was
**more** careful than the renderer and read a different document; this one was **less** careful and
read a different document, and its verdict was an ABORT on a healthy row rather than a silent
miscount. *An aborting parser is only as good as its agreement with the renderer, in both directions.*
It also aborted twice on the Status cell before settling on the **first word**: equality aborts on
`resolved by ADR 0003` and on `open - half answered by ADR 0003`, and a substring test reads
`open - deferred by W32` as **deferred**, which is [Q156](../open-questions.md)'s own miscount.
