# W49 — What a reference across sibling regions means

**Status:** done
**Plan:** [P14](../plans/p14-what-a-reference-means-when-two-regions-arities-are-independent.md)

```
Spec:       spec/flow-definition.md sections 3 and 5 - this item widens both.
            spec/join-policy.md is NOT reopened; JP-R11 and JP-R12 are
            ADR 0037's. src/driver/** is W50's and this item does not edit it.
Owns:       src/definition/**, spec/flow-definition.md, spec/examples/**,
            test/definition/**, doc/decisions/0044-*.md
            (written from P14's index row, not from this item's title -
            doc/workflow.md section 7 rule 2)
Inputs:     P14 facts 1-6, read from the PLAN's own file and RE-RUN from
            dev-dist/p14/facts.ts rather than transcribed; Q206, Q27, Q165,
            Q214, Q216, Q217, Q157, Q102, read from doc/open-questions.md;
            ADR 0040 (the KEY and the visibility predicate) and ADR 0042,
            read from doc/decisions/; spec/flow-definition.md v0.14
            sections 2, 3, 4, 5, 6 and 7; the FD-V27/FD-V28/FD-V29 block in
            src/definition/validate.ts, allRegions/regionSets in
            src/definition/regions.ts, and isPathPrefix + resolveReference in
            src/driver/driver.ts (READ, not edited - W50 owns that file).
Outputs:    (1) ADR 0044 - what a reference across sibling regions means,
                deciding Q206 between P14's three named candidates, on
                measurement rather than on the principle Q206's row states.
            (2) The rule in spec/ with an id, and whatever FD-C1, FD-V27,
                FD-V28 and FD-R3 owe it.
            (3) Whatever reaches src/definition/**.
            (4) A corpus case per new FD-V rule in spec/examples/invalid/
                (C4), and whatever spec/examples/valid/ owes the answer.
            (5) L1 assertions for the aiming rule, over BOTH region kinds -
                P14 decision 3 requires a sibling `fanout` pair, which the
                corpus does not contain and this item constructs.
            (6) The evidence P14 decision 2 requires: map-over-region-output
                keeps working, measured rather than asserted.
Depends on: nothing - P14's first item
Blocks:     W50 (the driver half), W51 (the exit artifact)
Tests:      Expected values derived from spec/flow-definition.md before any
            run, never from output (doc/workflow.md section 5 rule 1).
            L1 in test/definition/sibling-regions.test.ts for the DERIVATION,
            over both region kinds and at both nesting depths; L4 is the
            corpus. L2 and the EDGE declaration site belong to W50 and are
            named there, not here - the predicate takes a reader node and an
            edge has no path of its own (FD-C3), so the edge site is a
            property of the resolver rather than of this derivation.
            (This line named test/definition/needs.test.ts and "BOTH
            declaration sites"; the work shipped in a new file and no test
            here reaches an edge. W49's conformity reader, finding 15.)
Gate:       L0, L1-L5 in three runtimes, L6 as a regression, then the two
            spec-conformity readers, then rule 8's whole set re-run with the
            readers' edits checked in.
Reserves:   Q218-Q224, ADR 0044
```

## Scope

**In**

1. **[Q206](../questions/q206.md)**, decided as **ADR 0044**. P14's scope names three candidates and
   prefers none: **(a)** a fourth refusal, **(b)** a change to the visibility predicate, **(c)**
   making a region's collection referenceable by relaxing `FD-V27`.
2. **P14 decision 3's evidence clause.** The evidence must include a sibling `fanout` pair, because
   the corpus contains none and P14 fact 5 says the two kinds behave oppositely.
3. **P14 decision 2 as a hard constraint.** `map-over-region-output` keeps working and its L6 row
   keeps its numbers.

**Out** — named rather than left implicit, with where it goes instead

- **The driver half.** `src/driver/**` and ladder L2 are **W50's**, by P14's index row. This item
  reads `isPathPrefix` and `resolveReference` and edits neither.
- **The exit artifact.** `examples/**` is **W51's**.
- **[Q19](../questions/q19.md), [Q22](../questions/q22.md), [Q186](../questions/q186.md)'s
  threshold, the gate, [Q165](../questions/q165.md)'s reducer** — P14's `Out` list, unchanged.
- **A sixth node kind** — P14 decision 4. Every candidate here is a property of a reference.
- **[Q216](../questions/q216.md) and [Q217](../questions/q217.md)** — this item RUNS their clauses
  and does not judge them.

## Verification

How each clause of `Gate:` is run.

| clause | command |
|---|---|
| L0 | `npm run lint`, `npm run typecheck` |
| L1-L5, three runtimes | `npm run test`, `npm run test:deno`, `npm run test:browser` — and `npm run test:browser:all` if any suite reads a `spec/**` document the browser bundle does not inline (W32's and W33's defect) |
| L4 | `test/definition/l4-corpus.test.ts` — the corpus and section 7's table, both ways |
| L6 | `npm run test:l6`, `npm run test:l6:deno` — **as a regression this item must not break**; the exit artifact is W51's |
| static checks | `npm run check:spec` (`C2`, `C4`, `C6`, `C8` all move when a rule is added), `check:source`, `check:markdown`, `check:docs` |
| conformity reader | fresh context, spec first and artifact second |
| adequacy reader | fresh context, in an isolated copy outside the repository |
| rule 8 | the whole set at v0.14 — five obligations, four requirements on the set, **two on the harness** — then re-run with the readers' edits checked back in |
| gate | `npm run gate`, `GATE EXIT=0` **and** zero lines beginning `FAIL`, against the control run recorded below |

**Routing cases this item touches** (`doc/workflow.md` section 5's checklist).

| case | | |
|---|---|---|
| a branch routed away from its join (**Q4**) | not this item's | `map-past-a-decision` is W51's regression |
| no matching decision edge (**Q10**) | not applicable | unchanged |
| `user_action` (**Q17**) | not applicable | unchanged |
| a duplicate task id (**Q13**) | not applicable | unchanged |
| a nested fan-out (**Q6**) | **yes** — the rule this item writes is about region CHAINS, so a nested region is one of its cases and `nested-fanout`, `map-in-fanout` and `nested-map` are the fixtures that must not move | asserted at L1 |

### Exceptions — files edited outside `Owns` and outside section 1 rule 5's record step

`doc/workflow.md` section 7 rule 2. **Declared here rather than discovered**: W49's conformity reader
audited the tree and found `spec/README.md` edited with no exceptions table in this file at all.

| exception | why | forced? |
|---|---|---|
| `spec/README.md` | `check-spec`'s `C8` makes its version row a consequence of any `spec/**` bump, and it fired on the first run: *"the version COLUMN for flow-definition.md reads v0.14, not v0.15"*. **P13's retro's narrower reading names this file** — *an item that changes what a reference may say will reach `spec/README.md`* — and this is its second data point | **yes** |
| `AGENTS.md` | its *what it costs* paragraph names **two** things a run can refuse a reference for, and ADR 0044 removes one of them. `doc/workflow.md` section 1 rule 5's THIRD direction — a withdrawn claim is SEARCHED FOR — and this is the copy a consumer reads first. Nothing in the gate compares the two: `X6` compares only the cost figures | **yes** — found by the conformity reader, not by a check |

**The control run, taken before anything was built.** Recorded in the Record below.

## Record

**W49 is DONE and [ADR 0044](../decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)
answers [Q206](../questions/q206.md): an output is visible to a reader when their two branch paths
AGREE ON THE REGIONS THEIR TWO CHAINS SHARE, and *one path is a prefix of the other* is that rule's
SPECIAL CASE.** `spec/flow-definition.md` is **v0.15** — section 3's visibility paragraph, `FD-C1`'s
row and `FD-R3`'s row; `spec/` is **7 documents, 43 examples, 89 rules**, unmoved, because no rule id
is added or retired. L1-L5 is **25 files / 674 cases in five runtimes**, from 24 / 656.
**L6 is unmoved at 879 assertions over 40 real runs** in both runtimes, which is the declared result.

**The defect was never about a `map` and never about arity, and that is the finding to carry.**
[Q206](../questions/q206.md)'s row, P14's facts and `spec/flow-definition.md`'s own note all frame it
as a map-arity question, because **every sibling pair in both corpora is `map`/`map`**. Constructed —
the corpora contain none, which is why nothing had seen it — a reference from branch **1** of a second
`fanout` region to branch **0** of the first **validates with zero findings**, is `FD-V29`-certain,
and **stops the run** at `FD-R3`; the same reference written in branch 0 resolves. *There is no arity
anywhere in that document, and which branch the author wrote the reference in decided whether the run
completed.* P14 decision 3 required the evidence to include a sibling `fanout` pair; this is why.

**P14 fact 3's MECHANISM was wrong, and correcting it is what re-pointed the decision.** That fact
says `map-over-region-output` works *"because `rank`'s `over` is the resolved `["score"]` itself, so
the two arities are equal by construction"*. Measured: that flow declares its reference on **`rank`,
the map NODE**, whose branch path is **`-`** and which is a member of **no region** — `branchPathOf`
returns `"-"` for it and **throws** for `reference-past-a-map-arity`'s `publish`. So `rank` receives
**all N** of `score`'s outputs before any instance exists and no index-matched entry is involved at
any point. **The two flows differ in WHERE the reference is declared, not in their arities**, which is
also why P14 decision 2 holds under every candidate.

**What each candidate cost, spiked in the working tree and restored with the bytes compared back:**

| candidate | L1-L5 | L6 | and |
|---|---|---|---|
| **(a)** a fourth refusal | **11 failures** | 879 / 40, green | `reference-past-a-map-arity.flow.json` becomes an INVALID document, so a corpus flow leaves |
| **(b)** this decision | **6 failures** | 879 / 40, green | no corpus flow lost; the 6 are a strict SUBSET of the 11, and all six are `FD-R3`/`FD-C4` fixtures reaching those rules through the sibling road |

**Gate — what ran.** Every number re-taken on the tree this item ships, after both readers were acted
on (`doc/workflow.md` section 1 rule 5's WHEN clause).

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **RAN** | `deno lint` `Checked 49 files`; all five typechecks clean |
| L1-L5, three runtimes | **RAN** | **25 files / 674 cases** in node 24.20.0, deno 2.9.6 and chromium, from 24 / 656. `npm run test:browser:all` was run because L1 moved and the suite reads `spec/**` documents: **674 in firefox and webkit too**, parity with node |
| L4 | **RAN** | the corpus and section 7's table, both ways — `spec/examples/valid/` is **unmoved at 14 files**, and why is below |
| L6, both runtimes | **RAN**, unmoved | **879 assertions over 40 real runs** in node and deno. An item that writes a rule and no resolver moves no run |
| static checks | **RAN** | all seven green. `spec` **7 documents / 43 examples / 89 rules**, unmoved — no rule id added or retired |
| conformity reader | **RAN** | **15 findings, 6 BLOCKING.** Every one acted on; one of them changed the IMPLEMENTATION rather than the prose |
| adequacy reader | **RAN** | **52 mutations, 8 real survivors, 4 BLOCKING.** Isolated copy at `../fyflow-w49-adequacy`, verified green before it started (`25 files / 668`) and restored after; zero symlinks and zero reparse points, measured before the copy was made and not assumed |
| rule 8, author pass | **RAN** | 19 probes: control OK, 18 caught, 1 declared ceiling **measured**, 0 survivors standing, 0 aborts — after its own set found and closed **four** real holes |
| rule 8, re-run | **RAN** | **27 probes: control OK, 26 caught, 1 declared ceiling (measured), 0 survivors standing, 0 aborts** — with **all eight of the readers' exact edits checked back in**, every one now costing failures |
| census | **RAN** | **178 / 128 / 2 / 48**, 42 in both tables, 178 of 178 in one cluster cell, 0 aborts on the final run |
| gate | **RAN**, green | `npm run gate` — **`GATE EXIT=0`, zero lines beginning `FAIL`**, 22 chain entries, `selftests` **7/7 completed, 7 ok, 551.3 s wall / 1069.9 s serial-equivalent over 5 lanes**, against the control run at `2fe5421` (`GATE EXIT=0`, zero FAIL lines, 7/7 ok, 457.3 s / 854.1 s). **No claim is made about the difference**: wall time here is not reproducible ([Q179](../questions/q179.md), measured at a 32% spread on one entry alone), and every self-test re-walks a tree that grew by three files |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) ADR 0044, deciding Q206 | yes | `M1` reports dead links if the file leaves. **Its TITLE is a declared ceiling** — measured at `markdown exit 0, 0 failures`: a decision is prose and only its links are bound, which is W45's own ceiling on ADR 0042 |
| (2) the rule in `spec/` with an id, and what `FD-C1`/`FD-V27`/`FD-V28`/`FD-R3` owe it | yes — **`FD-C1` amended, `FD-R3` narrowed**, and `FD-V27`/`FD-V28`/`FD-V29` read and not edited | 2 `check:spec` failures if the version row and the header disagree; 1 L1 if the derivation leaves |
| (3) whatever reaches `src/definition/**` | yes — `regionChainOf`, `sharedRegionDepth`, `outputIsVisible` | 1 L0 failure if a declaration is un-exported, 1 L1 if the export leaves |
| (4) a corpus case per new `FD-V` | **n/a, and stated rather than blank** — no `FD-V` is added, so `C4` owes nothing. `spec/examples/valid/` is unmoved at 14 |
| (5) L1 for the aiming rule, over BOTH region kinds | yes — three suites, `fanout`/`fanout` asserted by KIND rather than incidentally | 1 L1 failure if any suite leaves the runner's glob — the census in `l4-corpus.test.ts` names all three |
| (6) P14 decision 2, measured | yes | `map-over-region-output`'s reader is at `-` and shares no region with its target under any candidate; L6 unmoved at 879 / 40 |

**What broke.**

**The conformity reader falsified the DERIVATION the rule rests on, and it changed the code rather
than the prose.** Both this document and the ADR argued: *`containing(n)` is a nesting chain
(`FD-V22`), so the regions containing both are always the outermost k of each chain.* **Measured false
on a document `validateDefinition` accepts with zero findings** — put a fanout region's JOIN inside a
nested region and one node's shared entry is the **innermost** of the other's chain, so a count of the
intersection returns 1 where the shared region sits at segment 1. The **answer** survived, because
`branchPathOf` walks the opener chain and both paths inherit the outer segment either way; *the
justification licensing the implementation was unsound, in the sentence two documents stated it in,
on the eve of that expression going into the driver.* `sharedRegionDepth` now derives from
**`regionChainOf` — the same walk the PATH is built from** — so *segment `i` corresponds to chain
entry `i`* is true by construction. **The reader's own counterexample is checked in as a fixture**,
because re-sourcing the chain back to the membership sets cost **zero** on every other document in
the file.

**And the adequacy reader found that ADR 0044 rule 1's own clause had no fixture.** Widening the loop
bound to compare **every** segment — negating the function's own docblock — cost **0**. Every sibling
pair in the corpus is TOP-LEVEL, where the shared prefix is empty and the predicate short-circuits
before its loop; every nesting pair has a prefix as long as both paths, where truncation is
unobservable. **The one shape that separates the rule from *compare every segment* is two sequential
regions inside ONE outer branch** — siblings sharing a prefix of length 1, with both paths two
segments long, where the two rules **disagree**. Constructed and asserted. *A probe set drawn from the
corpus cannot see a rule that is wrong about the case the corpus does not have* — W41's finding, and
P14 decision 3 named the `fanout` half of it while this is the DEPTH half nobody had named.

**Which also made this suite's own sibling claim false, and it shipped green.** It asserted
`outputIsVisible` **unconditionally** for every non-nesting pair — true only at depth 0 — and adding
the nested-sibling document falsified it on the first run. *A later item adding such a flow would
have got a red suite pointing at correct code.* It now asserts the general rule: a sibling pair is
visible iff the two paths agree on the shared prefix, with *always visible* recorded as the top-level
special case.

**Three more of the conformity reader's six were CLAIMS THAT WERE FALSE, and all three were about
which rule moved.** *"`FD-C1` is the one rule that moves"* — `FD-C1`'s row was **byte-identical** to
the baseline, and the only rule row this item had edited was `FD-R3`. *"No `FD-R` changes"* — `FD-R3`
is edited and its reach narrows, and `spec/README.md` asserted that and *"`FD-R3` loses case (a)"*
**in the same cell, forty words apart**. And section 7's cell for `reference-past-a-map-arity` opened
*"the document that keeps `FD-R3` reachable"* and closed *"this document no longer keeps `FD-R3`
reachable"*, both present tense. **`FD-C1`'s row is now amended in fact** — which also closed the
reader's finding that the predicate shipped with **no rule id and no Test cell**, the shape W33 shipped
and its own reader caught.

**And four statements described behaviour the driver does not have yet.** The W49/W50 split is written
into the header and into `FD-R3`'s row, and was missing from the `["score"]` row, the Q206 blockquote,
`spec/README.md` and the ADR's Consequences. All four now carry it. **`AGENTS.md` is the fifth**: its
*what it costs* paragraph named **two** things a run can refuse a reference for, and this decision
removes one — `doc/workflow.md` section 1 rule 5's THIRD direction, a withdrawn claim searched for, in
the copy a consumer reads first, and **nothing in the gate compares the two** (`X6` compares only the
cost figures).

**Rule 8's own set found four holes before either reader saw the tree**, which is worth recording
because three of the four are the obligations v0.13 and v0.14 added: a missing-segment guard with no
case, a depth table with exactly **one** observer ((c)'s LIMIT), a `CASES` list with a count and no
membership ((d) at v0.14), and a pair whose paths were substitutable by a **set-equal** literal —
W47's `c3` verbatim, and the probe was **vacuous** rather than the clause unbound. **The `c3` probe
then had to become COMPOUND**, because re-sourcing one observer of a CORRECT function leaves the other
passing and says nothing — W34's finding, and (c)'s LIMIT reached from inside the set rather than from
a reader.

**Two ceilings are declared and MEASURED** (`doc/workflow.md` section 5 rule 8's harness clause at
v0.14, and the harness has no code path that runs nothing): ADR 0044's **title**, at
`markdown exit 0, 0 failures, 0.8 s` against 1-6 s for a probe that fires; and **the spec's normative
sentence, which can be inverted back to the prefix rule with `npm test`, `check:spec` and `check:docs`
all green** — `FD-C1` is in `check-spec`'s own *"60 rules no example flow can express"* list, so `C4`
and `C6` never reach it. The second is the standing `doc/`-prose class, refused eleven times; it is
recorded with its measurement rather than repaired.

**`Owns` audit — 6 tracked files changed and 3 added, against a block of 5 paths plus section 1
rule 5's six record-step files. TWO late exceptions, ZERO undeclared**, both declared in this file
before the item was marked done and both found by the conformity reader's audit rather than by
reading: `spec/README.md` (`C8`, which fired on the first run) and `AGENTS.md` (a withdrawn claim).

**P13's retro's narrower reading holds for a second plan.** It refused an `Owns` pre-declaration rule
and recorded *an item that changes what a reference may say will reach `spec/README.md`*; W49 changes
what a reference MEANS rather than what it may SAY, and reached it anyway, by `C8`. **`AGENTS.md` is
the datum the reading does not cover** — it was reached not by a check but by a reader noticing a
sentence, which is the half no rule can predict. `scripts/check-docs.mjs` was **not** needed. So the
tally over four items is `AGENTS.md` yes / yes / no / **yes**, `spec/README.md` yes / yes / yes /
**yes**, `scripts/check-docs.mjs` no / yes / no / **no**. [Q157](../questions/q157.md).

**Census re-derived, CONFIRMED for the FOURTEENTH plan running.** 174 / 125 / 2 / 47 before this
item's rows and **178 / 128 / 2 / 48** after; 42 ids in both tables, 178 of 178 in exactly one cluster
cell. **The parser was written from scratch from the register's own note and was wrong in ONE
direction — the eleventh, and it is a CLAUSE ORDER rather than a clause.** It aborted on
[Q119](../questions/q119.md) and [Q71](../questions/q71.md), the file's two **declared exemptions**,
which are exemptions precisely because they render their columns wrong — so applying clause 8 after
the width check aborts on exactly the two rows the note tells it how to read. *A parser can carry
every clause and still be wrong about the order it applies them in.*

**What this taught.**

**A claim that a rule "does not change" is checkable and nobody checks it.** Three of the conformity
reader's six blocking findings were of that shape — which rule moved, which did not — and all three
are one `git diff` of a rule row away from being decided. `check-spec` compares ids, counts and owner
cells; **nothing compares a version note's claim about which rows it edited to the rows it edited**,
and the three documents disagreed with each other and with the diff. **No Q id is raised for it, deliberately**: it is the `doc/`-check class, refused eleven times, and the reason it
is worth writing here is that this instance is **machine-comparable** — a rule id and a diff — where
the eleven refusals all turned on comparing English.

**And a corpus is a claim about what shapes EXIST, not about what shapes are legal.** Both readers'
central findings are the same sentence from two ends: the corpus has no sibling `fanout` pair and no
nested sibling pair, so a rule wrong about either was unreachable from every probe drawn from it —
including the author's own set, which found four holes and neither of these. P14 decision 3 named one
of the two in advance and that is why the `fanout` half was covered; **nothing named the depth half**,
and only mutation found it.

**Questions raised.** [Q218](../questions/q218.md)-[Q221](../questions/q221.md), four of the seven
reserved. **[Q206](../questions/q206.md) is RESOLVED.**

| Q | |
|---|---|
| [Q218](../questions/q218.md) | `FD-R3` has one road left and it needs a policy `validateDefinition` is not given |
| [Q219](../questions/q219.md) | a region's COLLECTION is unreachable by any reference, and the fix RELAXES a rule |
| [Q220](../questions/q220.md) | the visibility predicate now needs the region SETS and not only two strings |
| [Q221](../questions/q221.md) | three functions joined the published package surface and nothing asked |

**Reader overlap: 2, and it is the TWENTY-SIXTH measurement** — derived by counting
`doc/workflow.md` section 6's own list, which runs W4 … W47 and holds **25** entries. Inside the
settled 0-4 band, and **neither reader was primed**. Their two shared subjects are **the loop bound
having no discriminating fixture** — the adequacy reader from a mutation that survived, the conformity
reader from the JUSTIFICATION being false on a document it constructed, arriving at the same missing
shape from a probe and from a proof — and **the W50 split being stated in some places and not
others**. **Their split is again the one the two roles predict**: the conformity reader found **claims
that were false**, and five of its six blocking findings are about which rule moved or what a run does
today; the adequacy reader found **bounds that were not there**, and all four of its blocking findings
are a list with no membership, a comparison with one observer, or a loop bound with no case.
