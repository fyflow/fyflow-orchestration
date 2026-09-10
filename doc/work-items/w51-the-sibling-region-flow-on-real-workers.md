# W51 — The sibling-region flow on real workers

**Status:** done
**Plan:** [P14](../plans/p14-what-a-reference-means-when-two-regions-arities-are-independent.md)

```
Spec:       none - this item writes no rule. ADR 0044 is W49's and the
            resolver is W50's; this DEMONSTRATES them on a real scheduler,
            which is what an exit artifact does.
Owns:       examples/**
            (written from P14's index row, not from this item's title -
            doc/workflow.md section 7 rule 2)
Inputs:     P14's Exit: block, read from the PLAN's own file; W49's and W50's
            Records, for what each shipped and what each left; ADR 0044
            rules 1-5; spec/flow-definition.md v0.15 sections 3, 6 and 7;
            and W50's MEASUREMENT that ladder L6 is blind to this decision -
            all 11 aimed references in both corpora have a shared region
            depth of ZERO, so `outputIsVisible` never enters its loop on
            anything L6 runs and reverting the resolver costs 0 L6 failures.
Outputs:    (1) The exit artifact: a SIBLING-region flow end to end on a real
                `FyflowScheduler`, in BOTH L6 runtimes, at INDEPENDENT
                arities - a reader inside one region receiving every output
                of a sibling region, with neither arity derived from the
                other.
            (2) What reverting ADR 0044 costs, measured in L6 failures. It is
                ZERO today and that is the number this item exists to move.
            (3) A sibling FANOUT pair on real workers - P14 decision 3's
                evidence clause at the rung that runs, since the corpus
                contained none and both readers found the fanout half is
                where the defect is sharpest.
            (4) The exit artifact's own claim as a number: L6's assertion
                count and real-run count, both runtimes.
Depends on: W49 (ADR 0044) and W50 (the resolver)
Blocks:     nothing - P14's last item
Tests:      Ladder L6 is the test. Expected values from spec/ and from the
            worker roles' own declarations, never from output
            (doc/workflow.md section 5 rule 1). No new L1-L5 case is
            expected: the rules are asserted where they were written.
Gate:       L0, L1-L5 as a regression, L6 in BOTH runtimes, then the two
            spec-conformity readers, then rule 8's whole set re-run with the
            readers' edits checked in.
Reserves:   Q223-Q228, no ADR (P14 reserved 0044-0045; 0044 is W49's and
            0045 was SKIPPED by W50 - both spent, neither reused)
```

## Scope

**In**

1. **P14's exit artifact.** A reader inside one region receiving **all** of a sibling region's
   outputs, at arities neither of which is derived from the other, running end to end on a real
   `FyflowScheduler` in **both** L6 runtimes.
2. **Moving the number W50 measured.** Reverting ADR 0044's resolver costs **6 L1-L5 failures and
   ZERO at L6**. An exit artifact for a decision its own exit rung cannot see is not one, and this
   item's first obligation is to make that revert cost something.
3. **A sibling `fanout` pair at L6.** P14 decision 3 required the evidence to include one because the
   corpus contains none; W49 built it as a document and W50 put it in the corpus, and neither ran it
   on a real scheduler.

**Out** — named rather than left implicit, with where it goes instead

- **Any `spec/` rule.** An exit artifact writes no rule — W43's and W47's own stated result.
- **[Q219](../open-questions.md)** — the collection as a reference target. It RELAXES `FD-V27`, which
  P14's stop-and-ask list makes the maintainer's call.
- **[Q222](../open-questions.md)** — `FD-V28`'s biconditional having no observer. It is a question
  about a static binding and L6 is further from it than L1 is.
- **[Q220](../open-questions.md), [Q221](../open-questions.md)** — raised by W49; this item owns
  neither.
- **A self-test for L6.** Proposed and refused three times — P11's for the gate, P12's for L6 itself,
  P13's again.

## Verification

| clause | command |
|---|---|
| L0 | `npm run lint`, `npm run typecheck` — **read as EXIT CODES.** W50 shipped an L0 failure because its author read `lint`'s tail line, which `deno lint` prints either way |
| L1-L5, three runtimes | `npm run test`, `npm run test:deno`, `npm run test:browser` — **as a regression this item must not break** |
| **L6, BOTH runtimes** | `npm run test:l6`, `npm run test:l6:deno` — this is the item |
| static checks | `npm run check:source`, `check:scheduler` (`D6`, which binds both L6 rungs to `examples/l6.ts`), `check:markdown`, `check:docs` |
| conformity reader | fresh context, spec first and artifact second |
| adequacy reader | fresh context, in an isolated copy outside the repository |
| rule 8 | the whole set at v0.14 — and **obligation (d) is the one that matters here**, because W23's, W35's and W47's adequacy readers each deleted L6 rows for one edited number, and `ROW_KEYS` and `CROSS_ROW_SUBJECTS` are the answers |
| gate | `npm run gate`, `GATE EXIT=0` **and** zero lines beginning `FAIL` |

**Routing cases this item touches** (`doc/workflow.md` section 5's checklist): a **branch routed away
from its join (Q4)**, **`user_action` (Q17)**, a **duplicate task id (Q13)** and a **nested fan-out
(Q6)** are all already at L6 from earlier items and are run here as regressions; **no matching
decision edge (Q10)** is not applicable.

### Exceptions — files edited outside `Owns` and outside section 1 rule 5's record step

`doc/workflow.md` section 7 rule 2, declared before the item is marked done. All three follow from
one edit this item's own rule 8 set forced.

| exception | why | forced? |
|---|---|---|
| `spec/examples/valid/sibling-fanouts.flow.json` | rule 8 graded *both branches read the same node* a SURVIVOR at **zero**: the two branch entries ran one worker role and returned IDENTICAL results, so which one a reader received was unobservable — v0.13's fourth requirement on the set. The L6 copy now runs two roles and the corpus copy matches, so the two documents keep expressing one claim. W49's tree | **yes** |
| `test/definition/sibling-regions.test.ts` | it carries an INLINE copy of that corpus document and asserts the two are identical — W50's conformity reader's finding — so the corpus edit moves it. W49's tree | **yes** |
| `spec/flow-definition.md` | section 7's cell for the flow says what it shows, and *the two branch entries run different worker types* is now part of that. W49's and W50's tree | **yes** |

## Record

**W51 is DONE and it is P14's EXIT ARTIFACT.** A reader inside one region receives **every** output
of a sibling region, at arities neither derives from the other, end to end on a real
`FyflowScheduler` in **both** L6 runtimes. **L6 is 942 assertions over 42 real runs**, from 879 / 40;
L1-L5 is unmoved at **25 files / 681 cases in five runtimes**, which is the declared result — an exit
artifact writes no rule.

**Its headline is the number it exists to move.** W50 measured ladder L6 **BLIND** to
[ADR 0044](../decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md):
reverting the resolver to the prefix rule cost **6 L1-L5 failures and ZERO here**, because all eleven
aimed references in both corpora had a shared region depth of zero **and** paths that were
prefix-comparable anyway. Re-taken on the tree this item ships:

| | before W51 | now |
|---|---|---|
| the resolver reverted to the PREFIX rule — **too narrow** | **0** L6 failures | **12** |
| every entry made visible — **too permissive** | **0** L6 failures | **2** |

**Two directions, because a wrong predicate can be wrong in two**, and one row could only ever have
shown one. *[Q214](../open-questions.md)'s shape in a second mechanism* — W47's was *a document the
validator refuses never starts*; this was *a filter no run exercises* — and it is **prediction 4's
subject, measured rather than argued**.

**And the 12 decomposes, which is how it should be read.** Its adequacy reader took it apart: **10 on
`sibling-fanouts` and 2 on `sibling-map-fanout`**, and the 10 are one root cause with nine knock-ons —
`publishB2` raises `UnresolvedReference`, the run stops, `splitB` never joins, and `Q32`, the fold
subsequence, the outcome and the path-end all follow. **Only the 2 are the semantic claim.** *A
failure count is not a count of observations.*

**The two flows.**

| | |
|---|---|
| `sibling-fanouts.flow.json` | **two sequential `fanout` regions, and a run that used to STOP.** Both branches of the second declare the same reference against branch 0 of the first; under the prefix rule `publishB1` at path `0` resolved because the two strings matched and `publishB2` at path `1` hit `FD-R3`. **No arity anywhere in it** — P14 decision 3's evidence clause, and the shape neither corpus contained |
| `sibling-map-fanout.flow.json` | **a `map` region of three beside a `fanout` of two, at INDEPENDENT arities.** The map's is a run-time fact — `split` returns one item per word, and the number is in no definition field and no harness constant — and the fanout's is `branches.length`. Both branches receive all three scores. It also carries a **WITHIN-region** reference, `refine → score` at shared depth 1, which is the only thing at L6 that observes the permissive direction |

**What broke.**

**Its adequacy reader found EVERY property this item's Outputs claim carried by literals and prose
that nothing at L6 read** — four blocking survivors, one shape from four directions, three of them
costing a single integer edit and the fourth costing none:

| what left | what it cost |
|---|---|
| **both rows**, with their keys and the two counters | back to the exact pre-item numbers, `879 / 40`, green |
| **the two arities made EQUAL** — P14's whole question | **zero**, with the row's key still reading *three items, two branches* |
| **the within-region reference** | one integer, and the permissive direction went back to **zero** |
| **the sibling `fanout` pair's second reader** | **nothing at all** — the assertion count did not even move |

**`ROW_KEYS` and `DECLARED_TOTAL` do not reach any of them**, which is W23's finding at its FOURTH
iteration and the reason `CROSS_ROW_SUBJECTS` alone was not enough: **W51 had added no cross-row
clause, so there was no subject to name.** The reader's own prescription is what closed all four — a
cross-row clause computed **from the row definitions and from the folded run** rather than from a list
of names beside itself:

- the **set** of shared region depths across every row must be exactly `{0, 1}` — an equality, so it
  cannot be relaxed, and it fails when a direction leaves AND when a depth nobody thought about
  arrives. *(Written first as two floors, each was its own only observer and relaxing either cost
  zero — obligation (c)'s LIMIT, found by this item's own set.)*
- **two branches of one region both declare a reference across the pair**, scoped to the sibling
  `fanout` rows. *(Written over every row it was satisfied by `pubA`/`pubB` and could not see
  `sibling-fanouts` losing its second reader — it asserted* some row somewhere *where decision 3 asks
  for THIS one.)*
- **a run in which two regions opened DIFFERENT numbers of branches**, read from the folded state.
  *An arity is a fact about the RUN, so the claim has to be read from one.*
- and both openers of the fanout row asserted to BE `fanout`s, because dropping the filter that
  selects them cost zero — three other rows carry a sibling pair, so the clause passed on precisely
  the case it exists to exclude.

**Its conformity reader found the row asserting a FAN-OUT COMPLETION ORDER**, which
`doc/workflow.md` section 5 rule 5 forbids by name. Each `refine` is dispatched when **its own**
`score` settles and the three are genuinely in flight, so the declared list was the settle order of a
fan-out: measured **25/25 identical at `threaded: false` in both runtimes and 12/12 REVERSED at
`threaded: true`** — a knob this file records as held down by nothing
([Q99](../open-questions.md)). *The row was green on a property of the inline pool's timer FIFO.*
Closed by `Expectation.unorderedDispatch`, which compares the named ids as a SET and leaves every
other row's order exactly as it was — `sortedSettled`'s finding one field across — **and the
justification is asserted rather than stated**: a row may only weaken the comparison where its
branches genuinely overlapped. Re-measured: **3/3 green at `threaded: true`**, and removing the
declaration costs 1.

**And the two branch entries of the sibling-fanout pair returned IDENTICAL results**, so which one a
reader received was unobservable — rule 8's own set graded re-pointing the reference at the other
branch a SURVIVOR at **zero**. v0.13's fourth requirement on the set. Two worker roles now, and the
corpus copy follows so the two documents keep expressing one claim.

**THE TREE MOVED FIVE TIMES UNDER THE CONFORMITY READER, AND ONE SNAPSHOT IT TOOK WAS RED.** Its copy
picked up `examples/l6.ts` at six different digests and, at one instant, a **live rule-8 probe** in
`src/driver/driver.ts`. That is `doc/workflow.md` section 6's own recorded contamination — *two agents
editing one tree is not a review method* — reached from the other side: the reader isolated correctly
and the AUTHOR did not stop editing. **The cause is that this item ran rule 8's set against the live
tree while a reader was reading it**, which nothing in section 5 or section 6 forbids in so many
words. It is why every number in that report names the digest it was taken at, and it is the sharpest
process finding of the three items.

**Four more of its findings were counts and prose, and every one had been stale before this item
touched it.** `examples/README.md` read *thirty-six real runs, 760 assertions, thirty-two entries,
thirty-four row labels* against 42 / 942 / 38 / 40, *eight roles* against nine, and *fourteen flows*
against eighteen — with its own parenthetical already diagnosing the class: *an item corrects a count
where it is looking and not where it is not*. `CROSS_ROW`'s sequence read *57 at W47* where that item
shipped **61**, in the same commit as the sentence telling the next item to append to it; and the
constant's name over-reads — measured, **66** assertions run under the `cross-row` label, **58**
before the line that consumes it, and the constant is **68**, because it silently absorbs a per-row
assertion. `l6.ts`'s header listed the plans whose exit artifacts live in it and stopped at P12.

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **RAN** | `npm run lint` **exit 0** and `npm run typecheck` **exit 0**, read as exit codes |
| L1-L5, three runtimes | **RAN**, unmoved | **25 files / 681 cases** in node 24.20.0, deno 2.9.6 and chromium — the declared result |
| **L6, BOTH runtimes** | **RAN** | **942 assertions over 42 real runs**, node and deno, from 879 / 40 |
| static checks | **RAN** | all seven at exit 0 |
| conformity reader | **RAN** | **7 findings, 2 BLOCKING** |
| adequacy reader | **RAN**, isolated copy at `../fyflow-w51-adequacy` | **10 mutations, 4 real survivors, 4 BLOCKING** |
| rule 8, author pass | **RAN** | 13 probes: control OK, 13 caught, 0 survivors, 0 aborts — after three probe defects of its own were repaired |
| rule 8, re-run | **RAN** | **20 probes: control OK, 19 caught, 1 declared ceiling (measured), 0 survivors standing, 0 aborts** — with **all seven of the readers' exact edits checked back in** |
| census | **RAN**, unmoved | **179 / 129 / 2 / 48**, 42 in both tables, 179 of 179 in one cluster cell, 0 aborts — an exit artifact raises no question |
| gate | **RAN**, green | npm run gate — **GATE EXIT=0, zero lines beginning FAIL**, selftests **7/7 completed, 7 ok, 497.2 s wall / 1031.0 s serial-equivalent over 5 lanes**; spec check **7 documents, 44 examples, 89 rules**. **Run with the tree HELD STILL**, which is the counter-measure to the finding above: W50 gate ran concurrently with W51 edits and was a verdict about a tree that no longer existed |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the sibling-region flow on real workers at independent arities | yes | 12 L6 failures if the resolver reverts; 9 if the two arities are made equal; 4 if the within-region reference leaves |
| (2) what reverting ADR 0044 costs in L6 failures | yes — **12**, from **0** | the measurement is the output, and the ceiling W50 declared is closed |
| (3) a sibling FANOUT pair on real workers | yes | 1 L6 failure if either branch stops declaring the reference, naming the cross-index case |
| (4) the exit artifact's own claim as a number | yes — **942 / 42**, both runtimes | `ROW_KEYS` names both rows; `CROSS_ROW_SUBJECTS` names the subject |

**`Owns` audit — 4 tracked files changed and 3 added, against a block of ONE path plus section 1
rule 5's six record-step files. THREE late exceptions, ZERO undeclared.** All three follow from one
edit rule 8 forced — the two branch entries returning identical results — and all three were declared
before the item was marked done, though **after** the conformity reader's snapshot, which reported
them as three undeclared and was right about the tree it read.

**What this taught.**

**A rung is only as discriminating as the shapes its documents contain.** L6 was blind to a decision
for a whole item, and not because a row was missing: eleven of eleven references in both corpora put
the reader or the target outside every region, so the filter never entered its loop. *W41's finding
about probe sets — a set drawn from the cases a feature was built for cannot see a rule that is wrong
about the cases it was not — applied to an entire ladder level.*

**And an author who keeps editing while a reader reads has broken the isolation the reader kept.**
Section 6 puts the adequacy reader in a copy and says nothing about the author's own tree during the
CONFORMITY pass. Rule 8's set runs against the live tree by construction, so running it during a
review contaminates the review — measured here at six digests and one red snapshot. **For P14's
retro**, with the counter-measure stated: an item's rule 8 re-run belongs **after** both readers
report, which is what v0.8 change 2 already says for a different reason.

**Questions raised.** **None.** All seven of the reserved block Q223-Q228 are unused and are skipped,
and the census is unmoved at 179 / 129 / 2 / 48 — which is what an exit artifact looks like in the
register when its readers' findings all land in the artifact rather than in a row. **No ADR** — 0044
is W49's and 0045 was skipped by W50; both are spent and neither is reused.

**Reader overlap: 1, and it is the TWENTY-EIGHTH measurement** — derived by counting
`doc/workflow.md` section 6's own list (W4 … W47 = 25) and adding W49, W50 and W51. Inside the settled
0-4 band, **neither reader primed**. Their one shared subject is **the sibling-fanout pair's second
reader**: the adequacy reader deleted it and measured zero, the conformity reader reached the same
document from the other end and found the two copies of it diverged with nothing comparing them.
**Their split is again the one the two roles predict**: the conformity reader found **claims that were
false** — an order the run does not fix, four stale counts, a sentence attributing an L6 measurement
to a document nothing runs — and the adequacy reader found **bounds that were not there**, all four
of its blocking findings being a property carried by a literal.

