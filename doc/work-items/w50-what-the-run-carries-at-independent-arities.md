# W50 — What the run carries at independent arities

**Status:** done
**Plan:** [P14](../plans/p14-what-a-reference-means-when-two-regions-arities-are-independent.md)

```
Spec:       spec/flow-definition.md sections 3 and 6 - FD-C1's visibility half
            and FD-R3's remaining road. The RULE is W49's and this item does
            not reopen it; what lands here is the resolver and what a run
            carries once it applies it.
Owns:       src/driver/**, test/driver/**, spec/flow-definition.md
            (written from P14's index row, not from this item's title -
            doc/workflow.md section 7 rule 2)
Inputs:     ADR 0044 rules 1-5, read from doc/decisions/; W49's Record, for
            what shipped and what it left; spec/flow-definition.md v0.15
            sections 3 and 6; regionChainOf / sharedRegionDepth /
            outputIsVisible in src/definition/regions.ts; isPathPrefix and
            resolveReference in src/driver/driver.ts; the six L2 fixtures
            W49 measured as reaching FD-R3/FD-C4 through the sibling road.
Outputs:    (1) The resolver applying ADR 0044 rule 1, at BOTH declaration
                sites (a node's needs and an edge's), by one expression.
            (2) The six L1-L5 fixtures that reach FD-R3/FD-C4 through the
                sibling road, moved onto a road that still exists.
            (3) L2 assertions for what a reader receives at INDEPENDENT
                arities - the plan's own question, at run time.
            (4) sibling-fanouts.flow.json promoted to spec/examples/valid/
                with its section 7 row and its FD-C2 census row, which it
                could not join until a run resolves it.
            (5) What reverting ADR 0044 costs, in L1-L5 failures.
Depends on: W49 (ADR 0044, the derivation, the L1 cases)
Blocks:     W51 (the exit artifact)
Tests:      Expected values derived from spec/flow-definition.md v0.15 and
            from ADR 0044 before any run, never from output
            (doc/workflow.md section 5 rule 1). L2 in test/driver/needs.test.ts
            for resolution at both sites, over a sibling map pair at
            INDEPENDENT arities, a sibling fanout pair, and a NESTED sibling
            pair - the last being the shape W49's adequacy reader found
            missing and the only one that separates the rule from "compare
            every segment". L4 is the corpus, which sibling-fanouts joins.
Gate:       L0, L1-L5 in three runtimes, L6 in BOTH runtimes, then the two
            spec-conformity readers, then rule 8's whole set re-run with the
            readers' edits checked in.
Reserves:   Q222-Q228, ADR 0045 (expected SKIPPED - P14 says one decision is
            the plan's subject and a second would mean this item grew one of
            its own)
```

## Scope

**In**

1. **The resolver.** `resolveReference`'s visibility filter becomes `outputIsVisible`, which is
   ADR 0044 rule 1. **One expression with two call sites**, and `isPathPrefix` goes with it — rule 2
   REPLACES the prefix rule rather than keeping it beside the new one, because two predicates are two
   sources that can disagree.
2. **What a run carries at INDEPENDENT arities**, which is P14's question asked of the run rather than
   of the document: what each instance of a second region receives when the first region's arity is
   unrelated to its own.
3. **The six fixtures W49 measured.** They reach `FD-R3` and `FD-C4` through the sibling road, which
   this item removes; each moves to a road that still exists or is deleted with its reason recorded.
4. **`sibling-fanouts.flow.json` into the corpus**, which W49 built and could not promote: a corpus
   flow is validated at L4 **and run** by the `FD-C2` census, and until this item it was a valid
   document whose run stopped.

**Out** — named rather than left implicit, with where it goes instead

- **The RULE.** ADR 0044 and `FD-C1`'s wording are W49's and are read, not reopened.
- **The exit artifact on real workers** — **W51's**, and `examples/**` is its `Owns`.
- **[Q219](../open-questions.md)** — making a region's COLLECTION referenceable. It RELAXES `FD-V27`,
  which P14's stop-and-ask list makes the maintainer's call, and it needs retention that is
  [Q19](../open-questions.md)'s subject.
- **[Q220](../open-questions.md), [Q221](../open-questions.md)** — the predicate's new dependency and
  the package surface. Raised by W49; this item may confirm or refute them and owns neither.
- **[Q216](../open-questions.md), [Q217](../open-questions.md)** — this item RUNS their clauses and
  does not judge them.

## Verification

| clause | command |
|---|---|
| L0 | `npm run lint`, `npm run typecheck` |
| L1-L5, three runtimes | `npm run test`, `npm run test:deno`, `npm run test:browser` — and `npm run test:browser:all` if L1 moves or a suite reads a `spec/**` document the bundle does not inline |
| L4 | `test/definition/l4-corpus.test.ts` — the corpus and section 7's table, both ways, which `sibling-fanouts` joins |
| L6, both runtimes | `npm run test:l6`, `npm run test:l6:deno` — **as a regression this item must not break**; the exit artifact is W51's |
| static checks | `npm run check:spec`, `check:source`, `check:markdown`, `check:docs` |
| conformity reader | fresh context, spec first and artifact second |
| adequacy reader | fresh context, in an isolated copy outside the repository |
| rule 8 | the whole set at v0.14 — five obligations, four requirements on the set, **two on the harness** — then re-run with the readers' edits checked back in |
| gate | `npm run gate`, `GATE EXIT=0` **and** zero lines beginning `FAIL` |

**Routing cases this item touches** (`doc/workflow.md` section 5's checklist).

| case | | |
|---|---|---|
| a branch routed away from its join (**Q4**) | **yes** — a reference to a branch that left the region resolves today and must still, which is W45's measurement 9 | asserted at L2 |
| no matching decision edge (**Q10**) | not applicable | unchanged |
| `user_action` (**Q17**) | **yes** — `FD-R3`'s one remaining road is a policy firing before a branch entry settled, and the parked case is one of its shapes | the L2 fixture W45 built, run as a regression |
| a duplicate task id (**Q13**) | not applicable | unchanged |
| a nested fan-out (**Q6**) | **yes** — the NESTED sibling pair is this item's discriminating case at run time | asserted at L2 |

### Exceptions — files edited outside `Owns` and outside section 1 rule 5's record step

`doc/workflow.md` section 7 rule 2, declared before the item is marked done. **SIX, all forced.**
Three are `test/definition/**` or `spec/examples/**`, which P14's index row gives to W49, and follow
from this item's own declared Output 4; three are withdrawn claims.

*(This sentence read **"All three are `test/definition/** or `spec/examples/**`"** beside a table of
six rows — written when the table had three and never re-taken when the conformity reader's findings
added the other three. Corrected by P14's retro under section 6 pass 3 rule 6, with the Record's own
count of FIVE; the audit is SIX and ZERO undeclared.)*

| exception | why | forced? |
|---|---|---|
| `spec/examples/valid/sibling-fanouts.flow.json` | **Output 4.** W49 built the document and could not add it: a corpus flow is validated at L4 **and RUN** by the `FD-C2` census, and until the resolver followed it was a valid document whose run STOPPED. This item is when a run first resolves it | **yes** |
| `test/definition/l4-corpus.test.ts` | the suite census is set equality both ways, so the new L2 suite must be named there or L1 goes red. [Q102](../open-questions.md)'s shape, and the ratchet working | **yes** |
| `test/definition/sibling-regions.test.ts` | rule 8 graded a path-swap probe a SURVIVOR and it is VACUOUS — the predicate is symmetric in the two paths by construction, and the symmetry is asserted there beside the function it is a property of. **Then the conformity reader found the file's header stating as FACT that the flow is not in the corpus** — which this item's own Output 4 falsifies — and that the promoted flow is now a SECOND COPY with nothing comparing them | no, then **yes** |
| `spec/README.md` | its flow-definition row said *the RESOLVER follows in W50, so at v0.15 a run still applies the prefix filter* — true when W49 wrote it and false the moment this item shipped. `C8` compares the version COLUMN and nothing compares the prose | **yes** — a withdrawn claim, found by the conformity reader |
| `AGENTS.md` | the same sentence, in the copy a consumer reads first, and nothing in the gate compares it to `spec/` | **yes** — same |
| `src/definition/regions.ts` | `sharedRegionDepth`'s docblock said the document *joins the corpus with the driver in W50*, in the future tense, on the tree where it had | **yes** — same |

**The control run, taken before anything was built.** Recorded in the Record below.

## Record

**W50 is DONE and the resolver applies
[ADR 0044](../decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md).**
`resolveReference`'s visibility filter is `outputIsVisible`, at both declaration sites by one
expression, and **`isPathPrefix` is DELETED** — rule 2 replaces the prefix rule rather than keeping it
beside the new one, and `deno lint` said so first: with the resolver re-pointed, L0 reported
`isPathPrefix is never used` before any test ran. L1-L5 is **25 files / 681 cases in five runtimes**,
from 674; **L6 is unmoved at 879 assertions over 40 real runs** in both runtimes;
`spec/examples/valid/` is **15 files**, from 14.

**P14's question, answered at run time.** At `items 2 / slots 3` every instance of the second region
receives **all N** of the first's outputs and the run does not stop; at `items 3 / slots 1` the one
instance receives all three. **The array is the same whatever the two arities are** — asserted as a
pair over two runs that differ in both directions — which is what *independent* means for a value.

**What reverting ADR 0044's resolver costs, re-taken on the tree this item ships**: **6 L1-L5
failures and ZERO at L6**, matching the ADR's declared candidate-(b) figure exactly. The six are the
`FD-R3`/`FD-C4` fixtures that reached those rules through the sibling road, all moved here.

**Gate — what ran.** Every number re-taken after both readers were acted on.

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **RAN** | `npm run lint` **exit 0** and `npm run typecheck` **exit 0** — *checked as exit codes*, which is the whole of finding 1 below |
| L1-L5, three runtimes | **RAN** | **25 files / 681 cases** in node 24.20.0, deno 2.9.6 and chromium, from 674. `npm run test:browser:all` run because L1 moved: **681 in firefox and webkit too** |
| L4 | **RAN** | the corpus and section 7's table, both ways — `spec/examples/valid/` is **15 files**, which `sibling-fanouts` joins |
| L6, both runtimes | **RAN**, unmoved | **879 assertions over 40 real runs**. **And that is a FINDING rather than a result** — see below |
| static checks | **RAN** | all seven at exit 0 |
| conformity reader | **RAN** | **16 findings, 5 BLOCKING** |
| adequacy reader | **RAN** | **36 mutations, 4 real survivors, 5 BLOCKING.** Isolated copy at `../fyflow-w50-adequacy`, verified green before it started and restored after; zero symlinks and zero reparse points, measured |
| rule 8, author pass | **RAN** | 14 probes: control OK, 10 caught, 4 declared ceilings **measured**, 0 survivors standing, 0 aborts |
| rule 8, re-run | **RAN** | **24 probes: control OK, 20 caught, 4 declared ceilings (measured), 0 survivors standing, 0 aborts** — with **all ten of the readers' exact edits checked back in**, every one now costing failures |
| gate | **RAN**, green | npm run gate — **GATE EXIT=0, zero lines beginning FAIL**, selftests **7/7 completed, 7 ok, 413.0 s wall / 803.4 s serial-equivalent over 5 lanes**. **RE-RUN CLEAN**: the first pass was started in the background and W51 edits landed in the tree while it ran, so its verdict was about a tree that no longer existed. *A gate run concurrently with edits is a claim about neither tree*, and it is the same class as reading a tail line for an exit code — the other defect this item shipped |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the resolver at BOTH sites by one expression | yes | 2 L1 failures with the filter removed entirely; **1 with the EDGE site left on the prefix rule while the node site moves**, which is what binds *one expression* |
| (2) the six fixtures moved onto roads that still exist | yes — three onto the join-policy road, three onto a decision routing around a whole region | 6 L1 failures if the resolver is reverted, which is the same six |
| (3) L2 for what a reader receives at independent arities | yes — a new suite, plus the sibling-fanout pair and the nested-sibling pair | 5 L1 failures if the loop bound is widened to compare every segment |
| (4) `sibling-fanouts.flow.json` in the corpus | yes | **4 failures if the file leaves** — section 7 both ways, corpus validation, the `FD-C2` census, and the L2 suite |
| (5) what reverting ADR 0044 costs | yes — **6 L1-L5, 0 L6** | the measurement is the output |

**What broke.**

**THE GATE WAS RED AT L0 AND THE AUTHOR'S OWN VERIFICATION MISSED IT — and this file records that
defect twice already.** `test/driver/needs.test.ts`'s new nested-sibling test was `async` with no
`await`, `deno lint` exited **1**, and `lint` is the gate chain's FIRST entry since ADR 0039 — so
`npm run gate` would have been `EXIT 1` with **zero lines beginning `FAIL`** and nothing after entry
one running. **Both readers found it independently.** The cause is exact and worth writing down: the
author ran `npm run lint 2>&1 | tail -1`, saw `Checked 49 files` — which `deno lint` prints whether or
not it found a problem — and read it as a pass. *The exit code is the predicate and a tail line is a
secondary signal*, which is `CLAUDE.md`'s own sentence, reproduced by the item whose predecessor
records it. Every verification command in this Record is now an exit-code check.

**Three of the four things `FD-R3` normatively names lost their only observer, because they lived in
the fixture this item made resolve.** `spec/flow-definition.md` section 6 says the failure names *the
declaring node, its branch path, the key and the target*; after the move, dropping the branch path
from the message, or replacing the node id or the target with `"ZZZ"`, each cost **zero**. **And the
NODE site's `site` label went with them** — W42's adequacy reader's finding 42, whose assertion this
item deleted along with the fixture, so swapping the node site's label to `'edge needs'` cost 0 again.
All re-sited on the road the rule still has. *A fixture is also a home for assertions that are not
about it, and moving one evicts them silently.*

**The harness's failure channel had THIRTEEN reads and not one positive case.** Every one asserts it
is EMPTY, so neutering `onRunFailure` cost **zero** — and the adequacy reader's compound probe is what
makes that a finding rather than a guess: reverting the resolver AND neutering the channel came back
at the same **six** failures as the revert alone, so the channel contributed nothing even when
`FD-R3` genuinely fired. Closed by routing the `FD-V29`-limit fixture through the shared harness, which
needed a policy parameter it did not have. *(c)'s LIMIT reached from the other side: not one observer,
but none.*

**The independence loop was bounded by what the run DISPATCHED and not by what it ASSERTED.** Slicing
the payload list to one entry — or to none — cost **zero**, because `equal(narrow.pubs.length, 3)`
counts dispatches. W23's asymmetry, and this file's own two-digit fixture three suites down records
the `checked`-pushed-after-the-assertion answer. Applied.

**And the narrowing direction was answered with a measured ABSENCE.** Its adequacy reader found that
every new row asserts only that MORE is visible, and three mutations making the resolver too
permissive were caught only by W41-era and W42-era fixtures. **The shape that would fix it does not
exist**: a narrowing case needs a target with two or more outputs, so the target is inside a `map`
region — and the only two ways to share a region with it are a reader in a **sibling branch** of the
fanout holding the map, which `FD-V27` refuses, and a **region nested inside a map region**, which the
DRIVER refuses at construction ([Q156](../open-questions.md), W33's check). Both are asserted. *So the
one expressible narrowing shape is reader and target in the SAME map region, and that is W41's
two-digit fixture* — recorded rather than argued.

**The conformity reader found the document this item OWNS saying the opposite of the tree, in six
places, and four more outside it.** `spec/flow-definition.md` still read *until W50 wires them into
`resolveReference` a run still resolves by the prefix rule* — in the v0.15 header, the `["score"]`
row, the Q206 blockquote, `FD-C1`'s row, `FD-R3`'s row and the v0.13 header — plus `spec/README.md`,
`AGENTS.md`, `src/definition/regions.ts` and this item's own test file. **Every one was TRUE when W49
wrote it**, which is what makes it section 1 rule 5's third direction rather than carelessness: a
claim that names the item which will falsify it has to be un-written by that item, and nothing
compares the prose.

**`sibling-fanouts` now exists TWICE and nothing compared the copies** — the corpus document and the
inline fixture W49 built. Two sources that can disagree is ADR 0040 rule 2's own refusal; they are
compared now, and the inline copy stays deliberately, so W49's L1 derivation cases do not depend on
the corpus.

**Ladder L6 is BLIND to this decision, and the conformity reader measured why.** **All 11 aimed
references in both corpora have `sharedRegionDepth == 0`** — every reader sits at `-` or reads a
target at `-` — so `outputIsVisible` returns `true` without entering its loop for every reference L6
runs, and L6 cannot tell the new rule from the old one or from `() => true`. That is why L6 is
unmoved at 879 / 40, and it is **[Q214](../open-questions.md)'s shape in a second mechanism**: W47's
was *a document the validator refuses never starts*; this is *a filter no run exercises*. **W51's exit
artifact must add a flow with a shared depth above zero, or a sibling pair, or the plan's exit rung
proves nothing about the plan's subject** — and the probe that must move is in this item's rule 8 set,
declared as a ceiling with its measurement.

**And one claim of ADR 0044 has no observer at any rung**: *`FD-V28`'s biconditional becomes true*.
Nothing compares `FD-V28`'s region predicate to `outputIsVisible`'s chain predicate; the conformity
reader derived that it holds for every shape the region rules admit and could not find a mechanical
binding. [Q222](../open-questions.md).

**`Owns` audit — 9 tracked files changed and 2 added, against a block of 3 paths plus section 1
rule 5's six record-step files. SIX late exceptions, ZERO undeclared**, all six declared in this
file before the item was marked done. Three are `test/definition/**` and `spec/examples/**`, which
P14's index row gives to W49; two — `spec/README.md` and `AGENTS.md` — are withdrawn claims found by
the conformity reader; and the sixth is `src/definition/regions.ts`, which is W49's tree.

*(This paragraph read **FIVE** and enumerated five, while the exceptions table three sections up
declares **six** and the commit touches exactly those six — the sixth being `src/definition/regions.ts`,
whose docblock this item had to un-write. **A count in a Record contradicting the table above it, in
the item whose own headline is ten stale sentences**, and neither reader caught it because both were
reading the table. Corrected by P14's retro under `doc/workflow.md` section 6 pass 3 rule 6; the
plan's total is **2 → 6 → 3 = 11**, and the ZERO undeclared is unchanged, since the sixth was
declared.)*

**So P13's retro's narrower reading holds for a THIRD item and its limit is now visible.** *An item
that changes what a reference may say will reach `spec/README.md`* — W50 changes what a reference
MEANS at run time and reached it anyway, by prose rather than by `C8`, which the reading does not
cover. Over four items the tally is `AGENTS.md` yes / yes / no / yes / **yes**, `spec/README.md`
yes / yes / yes / yes / **yes**, `scripts/check-docs.mjs` no / yes / no / no / **no**.
[Q157](../open-questions.md).

**Census re-derived: 178 / 128 / 2 / 48**, unmoved by this item — **which is what an item that
raises one question looks like**, and [Q222](../open-questions.md) is that one.

**What this taught.**

**Moving a fixture evicts the assertions that were living in it.** Six fixtures moved because ADR 0044
took their road away, and four assertions that were about something else entirely — the message's
branch path, its node id, its target, and the node site's `site` label — went with them. Three of the
four had been put there by a previous item's adequacy reader, in a comment naming the measurement.
*The assertion that a fixture hosts is not the assertion the fixture is for*, and nothing in rule 8's
five obligations asks what a DELETION took with it.

**And a corpus that all sits at depth zero cannot see a rule about depth.** L6's blindness here is not
a gap in the row set: it is that eleven of eleven references in both corpora put the reader or the
target outside every region. *A rung is only as discriminating as the shapes its documents contain*,
which is W41's finding about probe sets applied to an entire ladder level.

**Questions raised.** [Q222](../open-questions.md), one of the seven reserved. **No ADR** — 0045 is
reserved and **SKIPPED**, exactly as P14 predicted: this item took no decision of its own.

| Q | |
|---|---|
| [Q222](../open-questions.md) | ADR 0044's *`FD-V28`'s biconditional becomes true* has no observer at any rung |

**Reader overlap: 2, and it is the TWENTY-SEVENTH measurement** — derived by counting
`doc/workflow.md` section 6's own list (W4 … W47 = 25) and adding W49. Inside the settled 0-4 band,
**neither reader primed**. Their two shared subjects are **the L0 lint failure**, which both found
independently and which neither was looking for, and **the stale *the resolver follows in W50*
statements**, reached from opposite ends: the adequacy reader from mutating the document it owns, the
conformity reader from reading `spec/` against the tree. **Their split is again the one the two roles
predict**: the conformity reader found **claims that were false** — six places in one document, four
outside it, four stale counts — and the adequacy reader found **bounds that were not there** — a dead
channel, an unbounded loop, an unbound policy state.
