# Workflow

**Status:** v0.17 - **run to completion SIXTEEN times**, by [P1](plans/p1-what-satisfies-a-join.md),
[P2](plans/p2-the-non-success-half-on-a-real-scheduler.md),
[P3](plans/p3-a-consumer-reference-the-gate-keeps-true.md),
[P4](plans/p4-the-drivers-lifetime-and-the-handles-it-gives-out.md),
[P5](plans/p5-a-third-and-fourth-policy-or-repairs-of-the-first-two.md),
[P6](plans/p6-what-may-share-a-scheduler-with-a-driver.md),
[P7](plans/p7-is-a-join-transitive-over-nested-fan-out.md),
[P8](plans/p8-what-can-be-deleted-with-the-gate-green.md),
[P9](plans/p9-when-a-check-stops-checking-what-notices.md),
[P10](plans/p10-is-fan-out-one-feature-or-two.md) and
[P11](plans/p11-what-should-the-gate-prove.md) and
[P12](plans/p12-what-a-node-receives-and-what-a-decision-sees.md) and
[P13](plans/p13-when-is-a-declared-reference-refused.md) and
[P14](plans/p14-what-a-reference-means-when-two-regions-arities-are-independent.md),
[P15](plans/p15-what-a-run-retains-and-what-a-result-may-be.md) and
[P16](plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md)
**Read this before starting any work item.** *(The status line read "seven times" and listed P1-P7
until P9's retro: **P8 ran this document to completion and adopted none of its proposals**, which is
section 6 pass 3 rule 1's expected verdict and is not the same as not having run it.)* Paths are relative to the repo root unless they are
markdown links.

**v0.3 is P1's retro acting on itself.** This document was inherited from
`fyflow-react-components` and had never been run - there or here. P1 ran it end to end across five
work items and **eleven reader-passes**; the retro adopted four changes and refused several more,
and all of it is in [P1's Record](plans/p1-what-satisfies-a-join.md), including a verdict on every
row of the adaptation table at the end of this file. That table stays, for the next plan to
re-judge.

**v0.4 is P2's retro, and it is a smaller edit than P1's because two of v0.3's four changes needed
nothing.** The two-reader split is settled - four items, four overlap measurements, flat at about
10% - and the `Outputs` table earned itself. The two that changed had both been *followed* and
failed anyway, which section 6 pass 3 rule 3 calls the sharpest kind of finding: **rule 7's
provocations are now checked in rather than run once** (a probe that ran once is a claim about the
past), and **section 7 rule 2's declared-exceptions mechanism is replaced by a check**, after three
consecutive items answered *"did you edit outside your `Owns`"* with *"yes, and I did not notice"*.
**Rule 8 is new**, and it has the strongest evidence of any rule here: three items in a row shipped a
fix for a review finding that could not fail. Full reasoning in
[P2's Record](plans/p2-the-non-success-half-on-a-real-scheduler.md).

**v0.5 is P3's retro and it changes one requirement of one rule** - the smallest retro edit so far,
which rule 1 says is an expected verdict rather than a thin result. **Rule 7's third requirement is
replaced**: naming which check refused a probe does not discriminate, because a merely *malformed*
probe - W6's original defect, and the thing that requirement was written for - trips two checks at
once and so satisfies a probe declared as either. A probe now declares the **set** it must trip, and
the set must match exactly. **Measured before it was proposed and provoked after it was built**, per
rule 8, which is that rule's first outing. **Everything else in this document is confirmed unchanged
by P3**, including the ladder, which took a *document* deliverable without bending. Full reasoning
and the rung-by-rung table in
[P3's Record](plans/p3-a-consumer-reference-the-gate-keeps-true.md).

**v0.6 is P4's retro, and its three changes all replace mechanisms that were followed and failed
anyway** - section 6 pass 3 rule 3's sharpest shape, three times over.

1. **Rule 8's provocations are written to the RULE, not to the fix.** Three items in a row produced a
   set that was incomplete *in the same direction*: every probe removed the fix, every survivor the
   readers found narrowed it. The rule worked; the way authors instantiate it did not.
2. **The adequacy reader works in an isolated copy.** Three reader pairs ran concurrently against one
   checkout before anyone noticed the obvious. It cost contaminated measurements and a deleted
   `node_modules`; the reader had isolated itself unprompted and **the document had not asked**.
3. **Section 1 rule 5's record-step list gains `doc/open-questions.md`, and `check-owns.mjs` is
   retired.** P2's retro read three consecutive `Owns` miscounts as a discipline problem and proposed
   a check. **The cause was the list being wrong** - every `Reserves:` line obliges an item to write
   to the register, which the list did not name. Naming it produced three correct audits in a row.

**v0.7 is P5's retro, and it is the first retro whose central finding is that a v0.6 change was
RIGHT AND INCOMPLETE rather than right or wrong.** Three items, six reader passes, and P4's one
prediction about rule 8 is answered and is **false**.

1. **Rule 8's set has TWO obligations, not one: the rule's clauses AND the `Outputs` table's rows.**
   v0.6 said *write the provocations to the rule, not to the fix*, predicting fewer reader survivors.
   Measured across three items, the readers found **blocking** gaps in all three — and the direction
   flipped on the third. W15 and W16 found a rule-written set **blind to what the item created**;
   W17 found a deliverable-written set **blind to a clause of the rule**, and only the clause-by-clause
   walk saw it. Neither half is sufficient and neither is redundant.
2. **Rule 8 gains a definition of *survivor*, and it replaces the proposal W17 made about itself.**
   W17 argued its set needed rule 7 **(b)** — *a probe asserts it changed its input*. **Its adequacy
   reader's harness already enforced 7 (b), and all three of that reader's vacuous probes passed it**,
   because a probe can change the input without changing an observable. The requirement is
   **reachability, not difference**.
3. **Section 1 rule 5's record-step list gains `doc/decisions/**`** — the same one-word fix P4's retro
   made for `doc/open-questions.md`, un-generalised. Every `Reserves:` line names ADR ids as well as Q
   ids, and `doc/decisions/` was in neither the list nor any `Owns` block, so **every item that ever
   reserved an ADR wrote an undeclared file**. W17 is where it stopped being bookkeeping: a
   known-false sentence in [ADR 0015](decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md)
   stood through a whole item because correcting it needed an exception declared before that item
   started. **The gap blocked a fix rather than permitting an undeclared edit**, which is the sharper
   occurrence.
4. **Section 1 rule 5 gains a provenance clause: a claim about another item's status is read from
   that item's own file, never from an index.** Twice now, in two plans, an index has said
   *"reader-passes outstanding"* about passes that had run — P4's retro names the first, and P5 hit
   the second in three documents at once. **The second time it reproduced itself**: the agent starting
   W17 read the stale index, believed it, and wrote it forward into a fourth document.
5. **Section 6's isolated-copy paragraph gains one sentence about REMOVING the copy.** v0.6's
   isolation rule was followed and caused real damage — a junction placed in `node_modules` so a
   worktree would typecheck, then followed out of the repository by `git worktree remove --force`
   ([ADR 0029](decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)).
   The dependency edge that made the junction seem necessary is gone; **the rule still said nothing
   about the removal**, which is the part that did the damage.

**v0.17 is [P16](plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md)'s retro,
and its central finding is that a harness satisfying EVERY requirement this document had written
for it measured nothing on seven probes — and that the shapes clause, FOLLOWED deliberately by two
items, was one shape short of the rule's own enumeration in both.** P16 asked *what is a node type,
and what does the library owe the scheduler to have one?* — answered by
[ADR 0048](decisions/0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md)
and [ADR 0049](decisions/0049-a-node-type-is-a-registry-entry-and-its-worker-receives-an-envelope.md),
three items, six reader passes, an exit artifact on real workers in both L6 runtimes. It adopts
**three** changes and refuses **five**, all in [P16's Record](plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md).

**Name the rung.** Eighteen defects; TWO had a rung; **both rungs fired and both were READ
correctly** — [Q142](open-questions.md) as a red self-test in W58's final gate, and W59's probe that
took ladder L6 down as *exit 1 with zero FAIL lines*, which section 4's v0.15 clause names in so many
words. Sixteen have no rung; every one was found by a reader or by reading rule 8's failure lines,
and five of the sixteen are in the INSTRUMENTS.

1. **Rule 8's requirement on the HARNESS gains PER-EDIT integrity: every edit's anchor is checked
   against the CURRENT text, an abort undoes what it applied, and the tree is held still by a
   CONTENT DIGEST.** [W58](work-items/w58-what-a-node-says-about-its-own-task.md) carried a control,
   asserted every restore and ran every ceiling — v0.11's and v0.14's requirements, satisfied
   throughout — and its `apply()` replaced against the ORIGINAL bytes, so a two-edit probe kept only
   its last: seven probes measured the harness. Fixed, its abort path then kept an edit it had
   applied, thirteen later probes crashed on it, and a `git status` diff could not see a file modified
   either way. W37 recorded the first defect; W58 reproduced it and found the second; **three
   occurrences, two plans, and none of the three existing requirements could see any of them, because
   all three are about a probe that RAN.**
2. **Obligation (a)'s shapes clause gains: where a rule ENUMERATES the values it ranges over, the set
   is that enumeration, not *more than one*.** [W59](work-items/w59-what-a-node-type-is.md) instantiated
   three shapes on every rule, deliberately, under v0.16's clause; `FD-C5`'s row lists FOUR kinds of
   `input`, and the fourth — a join's successor — was the one a driver could hand `{}` for zero. W58's
   three-shape list was *bound by nothing but the printed case count*. Two items: *more than one* is a
   ceiling the author sets, and where the rule counts its own values the count is the rule's.
3. **v0.14's ceiling clause gains its DATE: a ceiling whose reason is a literal set-equal to the
   value it replaces is a CATCH the moment the value moves, and the item that moves the value re-runs
   it.** This retro re-ran all twenty-three ceilings on the shipped tree: twenty-one hold, **two of
   W58's are catches** because W59 moved the values their literals equalled. P13's retro found the same
   class once (W45's `e4`, moved by W47). Two plans; and the retro is the wrong place to find it, since
   the item that moved the value could have run the eight in a minute.

**Refused, five, each with a measurement**: a `doc/` check for the FOURTEENTH time (a refusal count
twelve lines below a rewritten table — the number is checkable, which sentences carry one is not); an
`Owns` pre-declaration rule for the FIFTH plan running, with a new datum — late exceptions ran 1, 5, 0
and **W59's six declared came from W58's late table read forward**, a procedure recorded and not
ruled; tracking the declaration's facts harness ([Q253](open-questions.md), wrong five ways at exit 0);
a `deno publish --dry-run` rung ([Q252](open-questions.md), green for the wrong reason); and a rule
for a harness's per-row catch, which is a fix W59 made and section 4 already covers.

**v0.16's three changes: all CONFIRMED and KEPT, and the shapes clause EXTENDED.** *Run, never piped*
was followed by all three items and is what made W59's crash legible; the shapes clause was followed
twice and was one short twice; obligation (c)'s LIMIT was exercised in W58 by exactly its own
prescription. **Four of four predictions CONFIRMED** — the first plan since P10 — one of them with a
FALSE mechanism under a right conclusion and one corrected by the declaration's own grep before any
item ran. **Readers 0, 1, 1** — the thirty-second to thirty-fourth measurements, band unmoved.
**Census confirmed for the SIXTEENTH plan — 204 / 151 / 2 / 51**; this retro raises no question.
W60 closed unissued, Q254-Q255 spent, ADR 0050 skipped; **the next plan starts at W61, Q263 and
ADR 0051.**

**v0.16 is [P15](plans/p15-what-a-run-retains-and-what-a-result-may-be.md)'s retro, and its central
finding is that of the plan's ten defects EXACTLY ONE had a rung, the rung FIRED, and it was reported
GREEN anyway.** P15 asked *what does a run retain, and what may a result be?* — [Q19](open-questions.md)
and [Q22](open-questions.md), the two oldest rows in the register, both resolved in one plan, three
items and six reader passes. Its exit artifact is a **measured number** rather than a flow, which is
the first time section 2's other option has been taken. It adopts **three** changes and refuses
**five**.

**Name the rung, and the answer is the retro's shape.** Nine of the ten defects below have **no**
rung and every one was found by a reader or by rule 8 — a reachability set that cannot tell an alias
from a copy, a suite computing its own oracle, an observer inside its own subject, a per-row layer
bound by three integers. **The tenth is W54's browser failure, and `npm run test:browser:all` exited
non-zero exactly as it should have.** The author read a count line from a pipe and reported it green
twice. *The ladder was not the thing that failed; the reading of it was* — and that is change 1.

1. **Section 4's green clause gains a PROCEDURE: a rung is RUN, never PIPED — redirect it and read
   `$?`.** v0.15 wrote *a rung reported GREEN means its command EXITED 0* and
   [W54](work-items/w54-what-a-result-may-be-and-what-bounding-it-would-cost.md) **broke it one plan
   later while quoting it in its own Verification table**, piping `test:browser:all` through a `grep`
   for the count line — which prints **before** the failures. **Four occurrences across three plans**
   (W42 twice, W50, W54), and all four are an author reading a LINE because the output was too long
   to read whole. Stating the predicate was not enough; *do not pipe* is what an author can act on,
   and it is what the four have in common. **v0.9's argument for obligation (c)'s procedure, in a
   second place.**

2. **Rule 8 obligation (a) gains the SHAPES a rule quantifies over, not only its clauses.** A clause
   is a sentence; a shape is a value of the kind that sentence ranges over — *a region* is a `fanout`
   or a `map`, at depth 1 or nested — and **the author picks the shape the feature was built for,
   every time**. [W41](work-items/w41-what-a-node-can-reach-and-what-names-it.md): all 37 probes used
   a `map` region, and the rule was wrong about a `fanout` and refused a valid document.
   [W53](work-items/w53-what-a-run-retains-that-nothing-reads.md), one plan later: every release case
   used one `map` region at depth 1 on a flow with no `needs`, which hid **three** defects at once.
   And P15's own fact 1 produced it a third time from the measurement side, **after which the item
   written to correct it chose its fixtures the same way**. W53's Record argued the mechanism already
   existed — it does, and that is exactly why it keeps failing: *a clause enumeration is finite and
   visible, and the values a clause ranges over are neither.*

3. **Obligation (c)'s LIMIT gains what *independent* excludes: the second observer must not be
   DOWNSTREAM of the first's apparatus.** [W55](work-items/w55-a-run-at-scale-on-real-workers.md)
   added a second observer that was independent in every way the word suggests and **it was measuring
   the first one's instrument** — the byte observer's own snapshot was reachable from the driver, so
   each retained driver held a second copy of the very structure under test, **141.9 MiB against
   129.4**. **Every mechanism in rule 8 is blind to this by construction**: a control can only see
   what a probe ADDS, and the clean run is contaminated identically. One occurrence, adopted on that
   argument rather than on a second instance.

**REFUSED, five, each with a measurement.** A **`doc/` check for the THIRTEENTH time** — P15's
instance is the sharpest yet and the least checkable: *49.8%* is right in three documents and wrong
in four, and the difference is **which divisor the sentence names**, so a check would have to do
arithmetic in English. An **`Owns` pre-declaration rule for the FOURTH plan running** — and P15 is
the first plan to *predict* the pattern correctly (*if W53 and W54 reach `spec/README.md` and W55
does not*), which is exactly what happened, and a rule naming the three files would still have been
wrong twice on W53 and twice on W55 ([Q157](open-questions.md)). A **fourth membership list** as the
general answer to [Q217](open-questions.md)'s regress — W55 closed the per-row layer **both ways**
and could not close the cross-row layer at all, so the answer is a **handle**, not a list, and one
occurrence of a handle is not a rule. A **rung or a budget row for the plan's scale** — P15 decision 3
refused both, W55 then found the number behind that refusal was a per-ROW figure rather than a
per-run one ([Q246](open-questions.md)), and the refusal survives on its other grounds. And a rule
obliging an item to **re-take its own grep count**: v0.15's grep procedure fired in all three items
and **two of the three recorded the wrong number while the obligation still worked**, which is the
standing count-in-prose class and not a new one.

**v0.15's three changes: all CONFIRMED and KEPT.** The grep procedure fired in all three items and
found real expiry-dated claims each time; **held still** was followed by all three with zero
occurrences; and the green clause is the one that was broken, which is the evidence that it is worth
having rather than evidence against it. **And v0.14's ceiling clause had its first full plan and the
yield is ZERO**: all twenty-four ceilings the three items declared were re-run at this retro, on the
tree the plan ships, and every one behaves as declared with its stated reason intact — against P13's
eleven, where one was false and one stale. *A clause adopted because two claims nobody ran turned out
wrong, producing a plan where none did.*

**v0.15 is [P14](plans/p14-what-a-reference-means-when-two-regions-arities-are-independent.md)'s
retro, and its central finding is that v0.14's OWN counter-measure was followed and did not work.**
P14 asked *what does a reference mean when two regions' arities are independent?* — three items, one
ADR, and the third product plan in a row. **THREE of its four predictions REVERSED, the highest rate
of any plan**, and the cause of three is one thing: **a fact measured at the DECLARATION step was
wrong.** v0.14 adopted *the prediction table states the SCOPE of the measurement it rests on* as the
counter-measure to P13's derived reversal. **P14 is the first plan to carry that column; it stated
prediction 1's scope correctly — *fact 3, measured on the four sibling-region flows the two corpora
contain and on no constructed one* — and prediction 1 reversed anyway, because the fact underneath
was FALSE rather than narrow.** Section 6 pass 3 rule 3's sharpest kind, on a clause three commits
old. It adopts **three** changes and refuses **five**.

1. **Section 4 gains: a rung reported GREEN means its command EXITED 0 — a line of its output is
   never the predicate.** Three occurrences, two plans, every one `GATE EXIT=1` with **zero lines
   beginning `FAIL`**. [W42](work-items/w42-what-a-decision-sees.md) twice, on an unused import and
   then on a dead `const` stranded by the fix for a reader's own finding — **and its Record had
   already claimed the gate was green** the second time; and
   [W50](work-items/w50-what-the-run-carries-at-independent-arities.md), whose author ran
   `npm run lint 2>&1 | tail -1`, saw `Checked 49 files` — **which `deno lint` prints whether or not
   it found anything** — and read it as a pass. Since
   [ADR 0039](decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md)
   `lint` is the chain's FIRST entry, so nothing after it runs, and `FAIL` is a word the seven checks
   print and `lint` does not. **What it replaces is an apparent CONTRADICTION rather than a rule.**
   Rule 8 says **read the failure LINES, not the exit code**, and that is right for GRADING A
   PROVOCATION, where an exit code cannot tell a detection from a crash. The two directions are
   opposite and this document stated only one of them: *to call a rung green the exit code is
   NECESSARY; to call a provocation caught it is NOT SUFFICIENT.* **And the sentence already existed
   in the wrong document** — `CLAUDE.md` has carried *the exit code is the predicate and a FAIL count
   is a secondary signal* since v0.12, is read before every item, and W50 reproduced it two plans
   later in a THIRD secondary signal nobody had named. A procedure belongs in the procedure document.

2. **Section 6 gains: a whole-tree measurement is taken with the tree HELD STILL.** Two occurrences,
   two items in one plan, **two different observers**.
   [W51](work-items/w51-the-sibling-region-flow-on-real-workers.md): its conformity reader's copy
   picked up `examples/l6.ts` at **six digests** and, at one instant, a **live rule-8 probe** in
   `src/driver/driver.ts` — **one snapshot RED, on correct code**. W50: its first `npm run gate` was
   started in the background and W51's edits landed in the tree while it ran, so its verdict was
   **about a tree that no longer existed**; re-run with the tree still, it is green. **Section 6
   already records this contamination from the READER's side** — P4's retro, *two agents editing one
   tree is not a review method* — and fixed the reader's half with the isolated copy. **The author's
   half was never stated and it is the likelier one**, because rule 8's set mutates the shared tree by
   construction and v0.8's re-run lands in exactly the window a reader is working in. It replaces
   nothing; it is the other half of a paragraph that has been here since v0.6.

3. **Section 1 rule 5's THIRD DIRECTION gains a procedure: an item greps the tree for its OWN ID.**
   v0.14's clause says *search the tree for the phrase or the number*. It does not say what the phrase
   is, and there is exactly one case where it is EXACT — a claim written by an earlier item that names
   the later one by id. Measured over this repository's own history, outside `doc/`:

   | at | grep for | hits |
   |---|---|---|
   | W32's commit | `W33` | **19**, in eight files, one of them reading *"These are W33's cases only until W33 exists"* |
   | W33's commit | `W34` | **10** |
   | W49's commit | `W50` | **12** — six in the document W50 owns and four outside it, plus its own test file |
   | W41's commit | `W42` | **0** |
   | W50's commit | `W51` | **0** |

   **Zero false positives in the three that fire, and nothing at all in the two that do not**, so the
   search costs one command and returns either the set or silence. **Two occurrences in two plans,
   both blocking and both found by a conformity reader**: W33 shipped a run-time refusal with **no
   rule id anywhere in `spec/`** where `spec/flow-definition.md` section 2 had addressed that question
   **to W33 by name**; W50 shipped **ten** sentences saying a run still applies the prefix rule, every
   one of them **true when W49 wrote it**. *A claim with an expiry date is written by one item and
   falsified by another, and only the second can search for it.*

**REFUSED, each with a measurement.** **(1) A `doc/` check, for the TWELFTH time — and P14 supplies
the best instance yet for one.** [W49](work-items/w49-what-a-reference-across-sibling-regions-means.md)'s
conformity reader found three false claims about WHICH RULE MOVED: *"`FD-C1` is the one rule that
moves"*, whose row was **byte-identical** to the baseline while the only rule row the item had edited
was `FD-R3`; *"no `FD-R` changes"*, sitting **forty words** from *"`FD-R3` loses case (a)"* in one
cell; and section 7's cell asserting both halves of a contradiction in the present tense. **W49
declined to raise a Q for it and said why**: the claim is machine-comparable — a rule id against a
`git diff` of a rule row — where all eleven earlier refusals turned on comparing English. **The
measurement that refuses it anyway is where the three claims lived**: three different documents, and
two of the three were self-contradictory *inside one cell*, so a check would need the claim in a
structured field that nothing writes. `C2`, `C6` and `C8` already compare ids, counts and owner
cells; **none of them compares a CLAIM**, and the part of this that IS exact — an item id — is
adopted above as a procedure rather than built as a check. **(2) A rung for the EVIDENCE, for the
FOURTH plan running.** Name the rung for P14's five defects: **one has a rung, and it is the one where
the rung was green by not running** — W50's L0 failure, which `lint` catches as the gate's first entry
and which its author read past. The other four are a declaration fact that was false, a tree that
moved under a reader, four properties of an exit artifact carried by literals, and a filter no run
exercised. *A level for the evidence would have been green on every one of them.* P11's, P12's and
P13's refusals stand. **(3) An `Owns` pre-declaration rule, and P14 is the SECOND plan run as the
test v0.13 asked for.** Over its three items `AGENTS.md` is **yes / yes / no**, `spec/README.md`
**yes / yes / no**, `scripts/check-docs.mjs` **no / no / no**. **The exit artifact reached NEITHER of
the two**, which P13's three items did not show — W47 took `spec/README.md` as its one exception — so
a rule naming them would have been wrong on **both** files for W51. Late exceptions **2 → 6 → 3 = 11,
ZERO undeclared**, which does not fall the way P13's 6 → 4 → 1 did. **The narrower reading survives
with its scope now visible**: over six items across two plans `spec/README.md` was reached **five
times by TWO different mechanisms** — `C8`'s version row (W45, W46, W49) and a withdrawn claim in its
prose (W47, W50) — and the one item that reached neither wrote no rule and withdrew no claim. *One
half is a check that fires and the other is a reader noticing a sentence, which is why a
pre-declaration rule cannot be right about both.* [Q157](open-questions.md) stays open. **(4) A
fourth list below `CROSS_ROW_SUBJECTS` — refused at v0.14 as a prediction, and P14 is the fourth
iteration that tests it.** W51's adequacy reader found **every property that item's `Outputs` claim
carried by literals**: both L6 rows deletable back to the exact pre-item `879 / 40`, **the two arities
made EQUAL for zero** with the row's key still reading *three items, two branches*, the within-region
reference for one integer, and the sibling `fanout` pair's second reader **for nothing at all — the
assertion count did not move**. `ROW_KEYS` and `DECLARED_TOTAL` reach none of them, because **W51 had
added no cross-row clause and so had no subject to name.** **It did not add a fourth list.** The
answer taken is the reader's own — a cross-row clause computed **from the row definitions and from
the folded run**: the set of shared region depths across every row asserted as an EQUALITY, so it
fails when a direction leaves *and* when a depth nobody thought about arrives; two branches of one
region declaring a reference across the pair, *scoped to the rows it is about*; and a run in which
two regions opened DIFFERENT numbers of branches, read from the fold. *An arity is a fact about the
RUN, so the claim is read from one.* **So v0.14's refusal is CONFIRMED with evidence rather than
re-argued, and [Q217](open-questions.md)'s regress stops where a clause is DERIVED instead of
declared.** **(5) An obligation that an item RE-RUN the facts its plan was declared on.** It is the
mechanism that caught P14's founding error and **it already exists**: W49's `Inputs:` line reads
*"P14 facts 1-6, read from the PLAN's own file and RE-RUN from `dev-dist/p14/facts.ts` rather than
transcribed"*, written by that item's own author out of `doc/work-items/TEMPLATE.md`'s `Inputs` row,
and it is what measured fact 3's mechanism false. **Zero occurrences of it failing**, and making a
working practice a rule trades a declaration an author thought about for a checkbox.

**All four predictions have a verdict, THREE REVERSED and ONE CONFIRMED — the highest reversal rate
of any plan, and three of the four trace to ONE wrong fact.** **Prediction 1** (derived) said
*candidate (a), a fourth refusal, cannot be written without an arity clause*. Its own stated reversal
condition — *a static predicate that separates the two flows without mentioning arity* — is met, and
by a different predicate than it guessed: not *the reader's `over` names this very key* but **the
reader's REGION CHAIN**. Re-measured at this retro: `map-over-region-output`'s reader `rank` is at
path `-` with a region chain of **length 0** — in no region at all — while
`reference-past-a-map-arity`'s `publish` has the chain `[rank]`. *The two flows do not differ in
arity; they differ in WHERE the reference is declared*, and no arity is read anywhere in the
predicate that separates them. **Prediction 2** (reach) said *the answer is (c), making a region's
COLLECTION referenceable*. It is **(b)**; the premise stands and the inference does not, because the
missing spelling is a second, ADDITIVE gap rather than the cause of this one
([Q219](open-questions.md)). **Prediction 3** (derived) said *W50 is SMALL: no driver code moves*;
its own stated reversal condition, *candidate (b) winning*, occurred, and W50 is the largest of the
three items. **Prediction 4** (reach) is **CONFIRMED**, and it is the only one the plan could not have
derived: P14 supplies [Q214](open-questions.md)'s second instance in a **different mechanism** from
W47's — that was *a document the validator refuses never starts*, this is *a filter no run
exercises* — and W51 moved it from **0 L6 failures to 12**, with the opposite direction moving from
**0 to 2**.

**So P13's correction to P10's sentence is corrected again, and it is the SECOND failure mode rather
than a replacement.** P10's retro settled that only a reach prediction can reverse; P13 found that a
derived one reverses *when the scope of the measurement it rests on is narrower than its own
wording*; **P14 finds the other way it can fail — the measurement can be WRONG.** Fact 3 said
`map-over-region-output` works *because the two arities are equal by construction*, and the reader is
simply outside every region. **The counter-measure v0.14 prescribed was applied and did not catch
it**, because stating a measurement's scope says nothing about whether the measurement is true. *What
caught it is an ITEM re-running the fact it was handed* — refusal (5) above — which is section 1
rule 5's provenance clause, *any copy including your own*, reaching a PLAN's declaration for the
first time. **Sixteenth time a plan has found one of its own inputs wrong by trying to act on it.**

**v0.14's three changes: all three CONFIRMED and KEPT, and each found its own limit.**

- **The HARNESS's ceiling clause fired in all three items, and its best case is W50's.** Six ceilings
  were declared in the plan's harnesses and **all six are rows that RUN**, each printing the rung, the
  exit code, the failure count **and the elapsed time** — the signal that found P13's defect is now
  printed by construction. **This retro re-measured all six: five hold and ONE IS CLOSED.** W50's
  `e2` declared a ceiling whose stated reason named a FUTURE rung — *"no L6 row has a reference some
  of whose outputs are filtered OUT … W51's exit artifact is what it must move. Re-run it there"* —
  and re-run today it reports **L6 exit 1, 2 failures**. *A ceiling that names the rung that will
  close it is the clause working at its best.* **Its LIMIT: the clause binds the HARNESS, and a
  ceiling declared in a Record's PROSE is outside it.** W49 declared **two** and only one is a probe
  row; the second — *the spec's normative sentence can be inverted back to the prefix rule with
  everything green* — is prose with a measurement beside it, so this retro had to take it by hand.
  **Re-measured, with a control and the bytes compared back: inverting `spec/flow-definition.md`'s own
  normative sentence to say the opposite of what the driver does leaves `npm test`, `check:spec` and
  `check:docs` at exit 0 with zero `FAIL` lines.** It holds, and it is the standing `doc/`-prose class
  refused above.
- **(d)'s *a COUNT is not a MEMBERSHIP* was reached by an AUTHOR before either reader saw the tree** —
  W49's own set found a `CASES` list with a count and no membership, which is v0.13's reversal of *the
  author reaches none of them* holding for a second plan. **Its LIMIT, measured by W51's adequacy
  reader: a membership list is a claim about a LAYER, and an item that adds no layer has no membership
  to declare.** All four of W51's blocking survivors are properties carried by literals inside the row
  definitions themselves; `ROW_KEYS` names rows and `CROSS_ROW_SUBJECTS` names cross-row subjects, and
  there was no cross-row clause to have a subject. *The clause protects a layer from deletion and says
  nothing about a property the item never asserted.*
- **The THIRD DIRECTION fired hardest of the three — fourteen instances in three items.** W49's
  `AGENTS.md` *what it costs* paragraph, naming two things a run can refuse a reference for where
  ADR 0044 removes one; **W50's ten**, six of them inside the document W50 owns plus `spec/README.md`,
  `AGENTS.md`, `src/definition/regions.ts` and its own test file; and W51's four stale counts in
  `examples/README.md` — *thirty-six real runs, 760 assertions, thirty-two entries, thirty-four row
  labels* against **42 / 942 / 38 / 40** — plus `CROSS_ROW`'s sequence reading **57** where W47 shipped
  **61**, in the same commit as the sentence telling the next item to append to it. **Its LIMIT is the
  second direction the clause does not name**: a claim with an EXPIRY DATE is written by one item and
  falsified by another, so the item that must un-write it is not the item that wrote it — which is
  change 3 above, and the phrase to search for is an id.

**And v0.13's (c) LIMIT — *when the compound is green, count the observers* — fired in all three items
and in both directions.** W49's own set found a depth table with exactly **one** observer and had to
make its `c3` probe COMPOUND, because re-sourcing one observer of a CORRECT function leaves the other
passing; W51's first cross-row clause was written as **two floors, each its own only observer**, and
relaxing either cost **zero** until they were made one equality; and **W50 found the other end of it —
not one observer but NONE**, a harness failure channel with **thirteen reads and not one positive
case**, so neutering `onRunFailure` cost zero and the compound with the resolver reverted came back at
the same six.

**Rule 8 across the plan: 71 provocations, 65 caught, SEVEN declared ceilings — six in the harnesses
and one in prose — ALL MEASURED at this retro, ZERO undeclared survivors, ZERO aborts**, each item's
set run twice, with **25 of the readers' exact edits checked back in**. **Readers: six passes, none
empty — 38 conformity findings with 13 blocking, and 98 mutations with 16 real survivors and 13
blocking. Overlap 2, 2, 1**, the twenty-sixth to twenty-eighth measurements, all inside the 0-4 band
and **none primed**, and their SPLIT held in all three: the conformity reader found claims that were
false and the adequacy reader found bounds that were not there. **`check-owns.mjs` stays retired for
the tenth plan.** **Census CONFIRMED for the FOURTEENTH plan running — 179 questions, 129 open, 2
deferred, 48 resolved**, 42 ids in both tables, 179 of 179 in exactly one cluster cell, **0 aborts on
a parser written from scratch and right first time**, the fourth time that has happened.
**Q218-Q222 used of Q218-Q232 reserved; Q223-Q232 are spent and not reused. ADR 0044 taken and 0045
SKIPPED; W52 closed as reserved and never issued. The next plan starts at W53, Q233 and ADR 0046.**

**v0.14 is [P13](plans/p13-when-is-a-declared-reference-refused.md)'s retro, and its central
finding is that a HARNESS can produce a verdict having run nothing — three items shipped that code
path, all three declared ceilings against it, and only the item whose reader TIMED a probe found
out.** P13 asked *when is a declared reference refused, and what does it cost?* — three items, one
ADR, and the second product plan in a row. It adopts **three** changes and refuses **five**.

1. **Rule 8's requirement on the HARNESS gains: a declared survivor is RUN, against the rung its own
   reason names.** [W47](work-items/w47-the-blocked-flow-on-real-workers.md)'s conformity reader
   timed a probe — **0.26 s against 3.4 s** for a real one — and found that with `red: []` the
   harness's command list was empty, `seen` was `{}`, and the verdict **restated the declaration**.
   W45's, W46's and W47's harnesses are one lineage and all three carried it. **v0.11's requirement
   was FOLLOWED in all three** — a control ran, every restore was asserted, bytes compared back — and
   the ceiling rows were still unmeasured, which makes this section 6 pass 3 rule 3's sharpest kind.
   **The retro measured all eleven.** Eight of W45's and W46's come back clean and their reasons
   hold; **W47's `c3` measures 2 and its stated reason was false** — the literal it substituted was
   *set-equal* to the value it replaced, so the probe changed the input without changing anything
   observable; and **W45's `e4` is false on the tree P13 ships**, a ceiling saying *a member added to
   `ROLES` with no arm and no pool costs ZERO* that W47 closed and that now costs **2 at L6** — which
   a run against L1 cannot see, and is why the clause names the rung. **So the yield is 1 in 11 for
   the defect and 2 in 11 for the practice**, reported as numbers rather than as a ratio; and closing
   it inside W47 turned up five more defects in the same pass — three stale `says` substrings, a
   ceiling that was really a catch, and one whose measurement belonged to a different command.
2. **Rule 8 obligation (d) gains: a COUNT is not a MEMBERSHIP.** (d) already asks *does anything
   COUNT it from elsewhere*, and `DECLARED_TOTAL` is exactly that — a number, from elsewhere, which
   **satisfies the clause and has now failed three times in three plans**.
   [W23](work-items/w23-a-nested-flow-on-real-workers.md): four L6 rows deleted for one edited
   number. [W35](work-items/w35-a-map-on-real-workers.md): five more rows **and the whole cross-row
   block** for two numbers, closed by `ROW_KEYS` — set equality **and** order, so *a deleted row
   fails naming itself*. [W47](work-items/w47-the-blocked-flow-on-real-workers.md): **the entire
   cross-row layer** for two numbers and one import line, back to the exact pre-item figures in both
   runtimes with all five checks at exit 0. So: **where a deletion is one integer edit away, the
   layer declares its MEMBERS by name.** It replaces nothing and sharpens (d)'s own third question,
   which is the half that kept passing. **The limit is adopted with it**: both closures are literals,
   so a member and its name are two edits in one diff ([Q102](open-questions.md)'s shape,
   [Q217](open-questions.md)) — and *three iterations, each closed one layer further out, is an
   argument that the answer is not a fourth list*, which this retro records and does not act on.
3. **Section 1 rule 5's writing clause gains a THIRD direction: a WITHDRAWN claim is searched for.**
   The clause covers writing the scope you measured, and v0.12 added re-taking the number on the tree
   you ship. **Neither covers un-writing one.** W46's two readers withdrew four claims — *there is no
   channel*, *~1% of the clone*, *2.5x in run position*, and [Q22](open-questions.md) cited for a
   threshold — and **all four survived in `spec/README.md`'s own v0.14 row, in a file W46 edited in
   the same commit**, because `C8` compares the version column and nothing compares the prose. Two
   more occurrences: W45's `validate.ts` header said *"Twenty-four refusals"* where the file
   implements **27**, and had been wrong by three before that item; and W47's conformity reader found
   **seven** stale counts in `examples/**` whose true values that item's own new clauses compute
   correctly. **So: when a claim is withdrawn or a count moves, search the tree for the phrase or the
   number before recording.** Three items, two plans, every instance found by a conformity reader.

**REFUSED, each with a measurement.** **(1) An `Owns` pre-declaration rule — and this time the test
was RUN.** v0.13 refused it and wrote *if the next product plan repeats it, adopt it*; P13 was
declared as that test, with no item naming `AGENTS.md`, `spec/README.md` or
`scripts/check-docs.mjs`. **The answer is no**: over three items `AGENTS.md` is yes / yes / **no**,
`spec/README.md` is yes / yes / yes, `scripts/check-docs.mjs` is **no** / yes / **no**. **Only one of
the three was taken by all three items**, and a rule naming all three would have been wrong twice on
each of the other two. Late exceptions fell **6 → 4 → 1** — the last the lowest of any product item
in three plans — with **zero undeclared** throughout. The narrower reading the evidence does support
is *an item that changes what a reference may say will reach `spec/README.md`*, which is one file and
is already a consequence of `C8`; recorded as a reading rather than adopted as a rule.
[Q157](open-questions.md) stays open. **(2) A rung for the EVIDENCE, for the third plan running.** Of
the defects this retro discusses **exactly one has a rung, and it is the one where the rung's own
shape is the finding**: ladder L6 could not see `FD-V29` because a document `FD-V29` refuses does not
start ([Q214](open-questions.md)). The rest are a harness that ran nothing, a layer held down by two
integers, four withdrawn claims that survived, and a prediction graded from its summary. *A level
number invites climb to it and stop*, and P11's and P12's refusals stand. **(3) A `doc/` check, for
the ELEVENTH time** — and P13 supplies the sharpest instance against it, because the four false
claims were **prose in a table cell** whose only machine-comparable field is the version column, so
the check would have to compare English. **What did work is a number**: `X6` compares five figures
across three documents both ways and by column position. *A number in prose is checkable and a
sentence is not*, which is the line to hold. **(4) A rule that a detector's positive fixture lives
outside the file the detector reads.** One occurrence — written as literals, W47's three reach-cases
made that file its own offender — and it is an instance of the existing FIRES requirement; the
mechanism is recorded in place. **(5) A fourth list for the layer below `CROSS_ROW_SUBJECTS`**: see
change 2's limit.

**All four predictions have a verdict, TWO REVERSED — and one of them is a DERIVED prediction
reversing, which P10's retro settled could not happen.** Prediction 1 read *a dominance rule refuses
nothing that exists, so adopting it costs zero in the corpus*, and its own stated reversal condition
— *a corpus flow that dominance refuses and an author wants* — **is what W45's evidence clause
obliged the item to try to construct. It constructed twenty-two**, over 13 of the 26 corpus flows,
one of them a document `FD-V28`'s own note in the same file calls valid. **The literal half held**:
the corpus WRITES 6 aimed references and dominance refuses **0**, exactly as fact 2 measured. **The
inference did not**: the corpus ADMITS **127** and dominance refuses **30**. **The cause is that the
measurement answered a narrower question than the prediction's wording** — what the corpus writes,
against the corpus — which is P8's retro's third count shape firing on a PREDICTION instead of on a
count. **So P10's sentence is corrected in place** (see v0.11 below): a derived prediction is
reversible exactly when the scope of the measurement it rests on is narrower than its own wording,
and the counter-measure is rule 5's writing clause applied to the prediction table. **Prediction 2
reversed as the reversible one**, in the way P12's retro named: the answer is `FD-V29` **and** the `?`
modifier, a stack rather than a fork, which is [Q11](open-questions.md)'s finding one plan on.
Predictions 3 and 4 are CONFIRMED, and 4's own enumeration was wrong — *three* live bounds on section
3's reference table where there are **two** — and was corrected as a declared late exception before
it could be graded.

**v0.13's three changes: all three CONFIRMED and KEPT, and each found its own limit.**

- **(e)'s THIRD SHAPE fired in all three items** — `ALL_CHECKS` and five cost figures across three
  documents (W46), four lists in `examples/**` (W47). **Its limit: *both ways* is a DIRECTION, not an
  observer count.** W47 built three pairwise both-ways comparisons over three lists and its adequacy
  reader defeated all three with **one source swap**: the compound came back green where the real
  source costs 1, so the block's stated defence — *each clause is also the other two's evidence* —
  was false. **Obligation (c)'s LIMIT applies to the comparison itself**, and the two obligations
  compose in a way neither paragraph said. [Q216](open-questions.md), recorded and not repaired: the
  only second derivation available is a second regex over the same text.
- **(c)'s LIMIT fired five times in W47 alone** — two instantiated deliberately by the author, three
  more found by its reader — **and it gained a shape: count the observers of a DETECTOR, not only of a
  value.** A regex with one observer and no case that made it fire cost **zero** to neutralise, and
  its compound came back green in both runtimes with `check-source`, `lint` and both typechecks at
  exit 0.
- **The PAIR requirement fired three times and found NO limit** — the cleanest of the three. W45's L6
  pair was held down by nothing and collapsing it made `FD-C4` dead at L6; W47's two pairs cost 1, 2
  and 5.

**And v0.12's *the author reaches none of them* is REVERSED.** P12 measured nine instantiations of
(e) by three authors, all nine passing, every instance found by a reader. **P13 has three the author
reached** — W46's `ALL_CHECKS`, W46's `X6`-reads-a-path, and W47's `src/` import — **and the
mechanism is visible in all three**: each was reached by instantiating the obligation as a **named
step with its own measurement**, rather than as one probe among fifty. Corrected in place below.

**Rule 8 across the plan: 115 provocations, 95 caught, 15 declared survivors, 2 bound, ZERO
undeclared survivors, ZERO aborts, ZERO wrong-reason standing**, each item's set run twice.
**Readers: six passes, none empty — 44 conformity findings with 24 blocking, and 90 mutations with 30
real survivors and 17 blocking. Overlap 2, 2, 2**, the twenty-third to twenty-fifth measurements, all
inside the 0-4 band and **none primed**. **`check-owns.mjs` stays retired for the ninth plan.**
**Census CONFIRMED for the THIRTEENTH plan running — 174 questions, 125 open, 2 deferred, 47
resolved.** **Q199-Q217 all used — nineteen ids against fifteen reserved, the block extended twice;
ADR 0042 taken and 0043 SKIPPED; W48 closed as reserved and never issued. The next plan starts at
W49, Q218 and ADR 0044.**

**v0.13 is [P12](plans/p12-what-a-node-receives-and-what-a-decision-sees.md)'s retro, and its
central finding is that all three of its items shipped a claim their own evidence could not
falsify — and in every case the author had followed this document's procedure for exactly that.**
P12 asked *what does a node receive, and what does a decision see?* — three items, two ADRs, and the
first plan since P10 to make the library able to express something it could not. It adopts **three**
changes and refuses **four**.

1. **Rule 8 obligation (e) gains a THIRD SHAPE: a LIST is a claim about another list.** v0.12's two
   procedures are both about a **command** — what it is bound to, and what it runs. **P12 produced
   four instances in three items of a shape that is neither**: `RULE_PREFIXES` and an `accepted`
   list (W41), `EDGE_KEYS` (W42), and a `Role` union, a `switch`'s arms and a pool registry (W43).
   The question that finds all four is (e)'s second one asked of a **declaration**: *what does this
   list have to agree with, and what would say so?* — and the procedure is **find the other list and
   compare both ways**. **v0.12 stated the scope as `scripts/**`; two of the four are there, one is
   `src/` and one is `examples/**`**, so the shape is not a property of check-writing, which is the
   first evidence either way. **W41 recorded it as a third shape on ONE item with an argument**; W42
   and W43 supplied the second and third items and the argument is now unnecessary.
2. **Obligation (c)'s procedure gains its LIMIT, and it is a rule that was FOLLOWED.**
   [W34](work-items/w34-what-a-branch-receives-and-what-a-join-carries.md) settled that a provenance
   probe cannot be graded against a correct implementation and prescribed a **compound** probe. W43
   ran one and it came back **green** — because the clause it aimed at had exactly **one** observer,
   and the probe removed it. *A SENSOR CANNOT CORROBORATE ITSELF.* So: **when the compound is green,
   count the observers**; at one, the fix is a second independent expression over the same fact
   rather than a better probe. **One occurrence, and the argument for generality is that the axis
   never asks the question** — (c) asks where a value came from and says nothing about how many
   things can see it. W43's author declared it a ceiling **with a correct reason and a named second
   route at L2**; its adequacy reader measured that the reason was costing eight failures.
   *A ceiling declared with a correct reason is still a hole if the reason is about the OBSERVER
   rather than about the fact.*
3. **Rule 8 gains a fourth requirement on the SET: whatever makes a discriminating PAIR differ is
   itself a claim.** This repository reaches for *two runs differing in one variable* whenever a
   value must be shown to come from where it claims — and in three items across two plans the
   property that made the halves differ was carried by literals nothing compared.
   [W17](work-items/w17-the-all-exit-row-at-l6.md)'s two join-path rows collapsed when one `Set`
   literal in another file was reversed; **both** of W43's pairs collapsed for **0**, and with either
   collapsed the mechanism underneath became deletable for 0 as well. *Assert the difference* — it is
   `JP-R9`'s *compare the two halves rather than copy one of them*, applied to a FIXTURE.

**REFUSED, each with a measurement.** **(1) A ladder level for L6's own self-test**
([Q198](open-questions.md)): every cross-row bound in `examples/l6.ts` can be made
`check(expected, expected)` for zero and L6 has no `SELF` list, which
[W31](work-items/w31-the-self-list-check-policies-never-had.md) built for a check and measured at
thirteen mutations moved from 0 to non-zero. **The cost is why not**: a check costs ~1 s and L6 costs
~20 s a run, so a self-test over W43's 43 mutations is the whole of what
[ADR 0039](decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md) just
bought back. **The cheaper half is what W43 did instead** — bind each clause to a source OUTSIDE the
file, so a vacuous clause is one edit from a red one somewhere else. **Second time a level has been
proposed and refused**, after P11's for the gate. **(2) An `Owns` pre-declaration rule** for the
three documents a `spec/`-rule item always reaches — `AGENTS.md`, `spec/README.md` and
`scripts/check-docs.mjs`. The pattern is real and predictable, and W34 measured that declaring trees
in advance moves files out of the late column; it is refused because **twenty-two late exceptions
across three items were declared and ZERO were undeclared**, so the mechanism is working and the
rule would trade a recorded exception for an unrecorded assumption. [Q157](open-questions.md) and
[Q102](open-questions.md) stay open; **if the next product plan repeats it, adopt it.** **(3) An
obligation for the evidence that a DECISION's stated reason is true.** ADR 0041's forcing fact was
false and its own conformity reader derived the counter-example in one expression — but nothing in
sections 4-6 covers a decision's argument and no rung could, so it is a reading problem and the
two-reader pass is the mechanism that caught it. **(4) A `doc/` check, for the TENTH time.**

**All four predictions have a verdict and prediction 3 REVERSED — the first outright reversal since
the distinction was drawn.** P10's retro settled that only a **reach** prediction can reverse and
P11 found two that were right about the conclusion and wrong about the mechanism; **P12 adds the
third case: a reach prediction that reversed AND whose reversal was justified by a false fact.** The
ADR that prediction 3 earned said a *diamond* made a node's payload underivable because choosing
between two settled predecessors needs append order; W42's conformity reader derived it with none.
The conclusion survived on two facts nobody had written down. *A reach prediction can reverse on the
right conclusion and the wrong evidence, and only a reader re-deriving the evidence finds that* —
[Q193](open-questions.md).

**Name the rung: ONE of P12's seven defects has one, and it is the same verdict P11 reached.** The
one is `FD-V28` refusing a valid document, which **L1 would have caught and did not, because the
fixture did not exist** — all 37 of the author's probes used a map region and the rule is wrong about
the case they did not cover. The other six are a false fact in a decision, three lists bound to
nothing, a fixture pair holding nothing down, and two Record numbers taken before the tree they
describe. **L0-L6 climb over the product; nothing climbs over the evidence**, and that is now two
plans running.

**v0.12 is [P11](plans/p11-what-should-the-gate-prove.md)'s retro, and its central finding is that
obligation (e) was instantiated by the author THREE times in one item and its two readers then found
EIGHT more instances of it in the same item.** P11 asked *what should the gate prove, and what is it
actually proving?* — two items over the gate's own wiring, one ADR, nothing deleted. It adopts
**three** changes, two of them one sentence each, and refuses three.

1. **Rule 8 obligation (e) gains a SECOND QUESTION: not *was the check run*, but *was what it ran what
   ships*.** (e) as written asks whether a check, grading or guard *"can be skipped, unreferenced, or
   reached with nothing to do"* — all three of which are properties of the CHECK. **Five consecutive
   items shipped a hole that is a property of its SUBJECT**, every one found by a reader, every one
   blocking, and the last two by authors who quote the previous occurrence in the same file:

   *(In commit order, which is not the order their numbers read.)*

   | | the check | what it bound | what it did not |
   |---|---|---|---|
   | W36 | `D3` | both halves of the pin, tightly | its PREMISE — `--import-map` dropped from `test:l6:deno` and Deno resolves the bare specifier out of `node_modules`, so L6 reports 489 assertions at exit 0 with `D3` printing `ok`. **`D6` was created here** |
   | W35 | `D6` | that `test:l6:deno` runs `deno run` with `--import-map` | the FILE — either rung repointed at `examples/run-flow.ts`, which exports functions and runs nothing, for **zero** failures across four checks. `test:l6` had nothing but its NAME bound |
   | W37 | `D3` again | that the two pinned version STRINGS agree | that either is REACHABLE — Deno blocks a JSR version published under 24 hours old, so for a day the gate ran a pin one runtime could not fetch, with `D3` comparing two equal strings and printing **`ok`** |
   | W38 | `G1` | that each `:selftest` script routes the flag **with an override set** | the DEFAULT, which is every run the gate makes — `G2` |
   | W39 | `G4` | the runner's plan, its commands and its exclusive set, **with an override set** | the DEFAULT again (`G5`), and the chain entry's ARGUMENT: `--plan`, `echo`, and `\|\| exit 0`, each `npm run gate` at exit 0 with the self-tests not running |

   **Two shapes, and each has a procedure that was invented twice independently in this repository:**

   - **the name is bound and the argument is not.** Bind the whole command by **equality**, and run
     **that command** rather than one the check composes. W39 is the worked case for why shape is not
     enough: closing the `--plan` and `echo` forms did not close `|| exit 0`, because `||`, `exit`
     and `0` are inert argv tokens to Node and the **shell** discards the verdict. *A deletion and a
     suffix are two defects and one clause caught only one.*
   - **a check that must CONFIGURE its subject to observe it has not observed the configuration that
     ships.** The override is what makes the check affordable and it is what makes it blind: *the one
     configuration `npm run gate` executes is the one configuration the check never takes.* The
     affordable answer is to **read the default declaration rather than running it** — `G2` captures
     both names out of `const mod = process.env.<NAME> ?? join(ROOT, 'scripts', '<file>');`, and `G5`
     captures the **nine** declarations that decide an unconfigured run. The alternative is a run with
     no override at all, which for `G5` is 290 s.

   **It replaces nothing and it is not a sixth obligation**, because it asks (e)'s question of a
   different noun. **The scope is stated rather than generalised**: all five are checks over the gate's
   own wiring, in `scripts/**`. What generalises without argument is the second shape — any test that
   stubs, injects or overrides its subject is by construction not testing what ships, and the two
   independent inventions of *read the default* one file apart are the evidence that an author will not
   reach it from the axis alone.

2. **Section 1 rule 5's writing clause gains a WHEN: a measured number is re-taken on the tree the
   item ships.** v0.10 added *a claim states the scope it was MEASURED at*; it says nothing about the
   moment of measurement, and **an item is not finished when its work is — it is finished when two
   readers have changed it.** Rule 8 already requires the provocation SET to be re-run at that point;
   this says the item's own NUMBERS are re-taken in the same pass. Three occurrences, three items:
   W23 reported a count read from a file it had itself written for an earlier version of its own work;
   **W32's Record read *"506 on chromium"* from a run made before the change the Record describes**;
   and **W39 — the item whose entire subject is measurement — reported its headline saving as
   `-38.3%`, which is the figure at code-complete, against the `-23.8%` its own ADR carries**, because
   its readers' twelve blocking findings cost 75 s afterwards. Its census note is the same defect a
   second time in the same file: **`139 / 96`, taken before the third question that item raised had a
   row**. *Where a number is derivable in one expression, derive it there — and where it costs seven
   minutes to take, take it last.*

3. **Section 6 pass 3 gains one sentence: a retro may correct a false claim in the files of the items
   it reviews, and names which.** Once an item is done its file is on nobody's `Owns`, and a retro has
   no `Owns` and no declaration in which to take an exception — so change 2's own correction had
   nowhere legal to land. **This is the second occurrence of P10's parked proposal's SHAPE and not of
   its wording**, which is why that proposal stays parked: P10 named *another item's Record, where it
   asserts something false about yours* (W35 correcting W34), and this is a plan's retro correcting an
   item of its own plan. Both are the same gap — a finished file has no owner — reached from two
   directions, and the narrower fix is the one taken.

**PROPOSED AND REFUSED: an obligation about the OUTPUTS table on a process item.** (b) — *break every
row of the `Outputs` table* — degenerates where the outputs are documents and decisions. W39's three
(b) provocations were *delete the ADR* (caught by `M1` as **11 dead links**, which says nothing about
the ADR being right), *delete the runner* (caught by `G4`), and *revert Q133's status cell* (**SURVIVED
— a declared ceiling**). W38 shipped an `Outputs` row — *Q149 closed* — whose *what would fail without
it* cell is **blank**, which section 4's own note says is the mechanism working. **Two items, one
plan, and the honest reading is a scope caveat rather than a mechanism problem**: (b) was earned on
W15/W16/W17, where an output is a renderer or a policy column and breaking it means something. It is
recorded here so a third occurrence has somewhere to land.

**PROPOSED AND REFUSED: a LEVEL for the gate itself.** Section 6 pass 3 rule 5 asks which rung should
have caught each defect, and for **every one of P11's seven** the answer is *none* — the order, the
dispatch, the default the gate runs, two self-tests destroying each other's fixtures, a Record's
number, a census, four stale counts in `README.md`. **Every one is in the instrument, and section 4's
ladder is about the product**, while this repository has built a rung's worth of machinery for the
instrument — `S11`-`S13`, `G1`-`G5`, `D1`-`D7`, seven self-tests — and never put it on the ladder. Two
arguments against, either sufficient: a level number invites *climb to it and stop*, and the gate's
own checks are **L0**, which is where ADR 0039 has now put them; and section 4's levels are commands
you run in order, while *"does the thing that runs the checks run them"* is not one. **One occurrence,
recorded so a second has somewhere to land.**

**REFUSED, for the ninth time: a check over `doc/`.** The new twist is that the cost of deriving is now
zero. `npm run gate` prints every self-test's probe count on every run, and **four of the seven rows in
`README.md`'s command table disagreed with what was on the screen** — two of them P11's own doing,
`check:source:selftest` at 34 against 35 and `check:wiring:selftest` at 33 against 34. Corrected by
hand at this retro, as the eight before it were.

**v0.11 is [P10](plans/p10-is-fan-out-one-feature-or-two.md)'s retro, and it is the first retro
whose central finding is about the INSTRUMENT rather than about what it measures.** P10 was a product
plan — the first since P7 — and it confirmed all three of v0.10's changes on product items rather than
on harnesses, which is what v0.10 left open. It adopts **one** change, proposes one it refuses to
adopt at a single occurrence, and refuses two more.

**ONE CHANGE. Rule 8 gains a requirement on the HARNESS: it carries its own control, and the restore
is asserted.** A provocation harness is code written under time pressure to grade other code, it runs
with write access to the tree it is measuring, and **three times across two plans it has produced a
plausible-looking result that was its own artefact**:

- [W31](work-items/w31-the-self-list-check-policies-never-had.md) wrote its mutants into a directory
  the child deletes on its first line, and reported **`12/12 bounded`, exit 0**, while every grading
  inside every child read *"the mutant did not run"* ([Q151](open-questions.md)).
- [W35](work-items/w35-a-map-on-real-workers.md) restored with `git checkout -- src/ examples/` on a
  **dirty tree**. The item's entire uncommitted `examples/` work was deleted mid-run, and it reported
  a run of `ABORT`s that read as anchors gone stale ([Q172](open-questions.md)).
- [W37](work-items/w37-the-scheduler-pin-moves-to-0-5-2.md) staged a multi-edit probe by writing
  `snapshot(path).replace(...)` **per edit**, so a second edit to one file overwrote the first from
  the pristine snapshot. Four probes came back **WRONG-REASON at one failure each** — which is what a
  real finding looks like.

**None of the three is visible in the verdict**, which is the whole difficulty: a harness that
destroys its subject, one that never applies the mutation, and one that applies half of it all report
in the same vocabulary as a harness that works. **The counter-measure was invented here for the first
of the three and never generalised**: W31 closed Q151 with a **control** — an unmutated copy, driven
through the same expression the entries use, which must RUN and must NOT be graded. So:

> **Run a control through the same path the probes take.** A probe that changes nothing must come
> back clean, and the restore must be **asserted** rather than assumed — compare the bytes back, do
> not trust the command that wrote them. And read a uniform verdict as a harness result until proven
> otherwise: a run of `ABORT`s, or every probe reporting the same thing, is more often the instrument
> than the subject.

**It replaces nothing.** The five obligations say what to break; the three requirements on the set say
when a break is evidence. **None of them is about the thing that applies the break**, which is why
three items wrote one and two of them shipped a defect in it.

**PROPOSED AND REFUSED at one occurrence: a finished item's file has no owner.** W35 had to declare a
late exception to correct a false claim [W34](work-items/w34-what-a-branch-receives-and-what-a-join-carries.md)'s
Record made *about W35* — and the alternative was to leave it standing, which is exactly what let W36
act on it. The fix is one word: add *another item's Record, where it asserts something false about
yours* to section 1 rule 5's record-step list, beside `doc/decisions/**`. **One occurrence**, and
section 6 pass 3 rule 2 asks for two — the bar P8 applied to both of its proposals and adopted
neither. Recorded so the second occurrence has somewhere to land.

**REFUSED: widening `Owns` for a product plan.** P10 ran **5, 9, 5, 3** late exceptions against P7's
**five, four, two, zero**, and never reached zero. The reading is not that the blocks were too narrow.
W34 declared `spec/**`, `AGENTS.md` and `test/driver/**` in advance and **six** files left its late
column — so predicting a file set works — and then **not one of the five that remained, nor W35's
three, was predictable from a file set**. A plan that changes what the library can EXPRESS creates
obligations in the documents that describe the old capability, and which documents those are is a
property of the sentences rather than of the directories. **Twenty-two late exceptions and zero
undeclared**; the mechanism that works is the declaration.

**REFUSED: `check-owns.mjs`, for the sixth consecutive plan**, on the same evidence.

**And a correction to v0.10's own wording, from four occurrences.** *"A prediction written down before
the item is what makes this a measurement rather than hindsight"* is **necessary and not sufficient**.
P10 wrote four predictions and confirmed all four — but three were restatements of facts already
measured at its declaration step, so confirming them tested the **inference** and not the world. Only
prediction 3, which was about whether a v0.10 obligation generalises past a harness, could have gone
either way, and it is the only one that produced anything. *A prediction derived from a measurement
you already have checks your reasoning; a prediction about a mechanism's reach checks the mechanism.*

*(The sentence ended **"and only the second can reverse"** for three plans, and **P13's prediction 1
is a DERIVED prediction that reversed** — by its own stated reversal condition, which the item was
obliged to try to construct and constructed twenty-two instances of. The cause is not that the
distinction is wrong: it is that **the measurement answered a narrower question than the prediction's
wording**, fact 2 having measured what the corpus WRITES while the prediction claimed something about
the corpus, which ADMITS twenty-one times as many references. So: **a derived prediction is
reversible exactly when the scope of the measurement it rests on is narrower than its own wording**,
and the counter-measure is section 1 rule 5's writing clause applied to the prediction table. P8's
retro's third count shape — *a correct number answering a narrower question than the sentence around
it claimed* — firing on a PREDICTION rather than on a count. Corrected by P13's retro.)*

*(**And P14's prediction 1 is a derived prediction that reversed for the OTHER reason, so the sentence
gains a second failure mode rather than a replacement: the measurement can be WRONG.** P14's
declaration measured six facts and **fact 3 was false about its mechanism** — it said
`map-over-region-output` works *"because the two arities are equal by construction"*, and the reader
is simply outside every region, at path `-` with a region chain of length **0**. Prediction 1
inherited that and reversed; so did the plan's whole framing, which asked whether the defect was about
arity when it was about **where the reference is declared**. **P14 is also the first plan to carry
v0.14's counter-measure** — a `scope of that measurement` column in the prediction table — **and it
stated prediction 1's scope correctly and reversed anyway**, because stating a measurement's scope
says nothing about whether the measurement is true. *What caught it is an ITEM re-running the fact it
was handed*, which is this rule's provenance clause reaching a PLAN's declaration for the first time.
Corrected by P14's retro.)*

**v0.10 is P9's retro, and its central finding is that the defect P9 set out to remove was living
inside rule 8's own procedure.** P9 asked *when a check clause stops checking, what notices — and does
it notice for the right reason?* The answer for the checks is now 118 gradings that name the probe
that must break. **The answer for rule 8's own provocations was: an exit code**, six times across
three items. Four items, eight reader passes, and **three changes**.

1. **Rule 8 gains a FIFTH obligation: break the WIRING — what happens when the check is NOT RUN.**
   Three instances, three items: the **manifest** (W24 — ` --self-test` dropped from a `package.json`
   entry, now refused by `S11` four ways), the **script** (W30 — the four-line dispatch deleted from the
   check, exit **0** with the self-test unrun, measured **six for six**, and `S11` reads the manifest so
   it cannot see it), and the **harness** (W31 — a mutation harness writing mutants into a directory the
   child deletes, reporting **`12/12 bounded` at exit 0** while every grading read *"the mutant did not
   run"*). **Earned against a prediction P9 wrote down before the item that tested it**, which said
   `S11` would catch it and the obligation would therefore not be earned. **It replaces nothing**: the
   four existing obligations ask what is claimed, which outputs exist, where the number came from and
   how many things are iterated, and none asks whether the thing runs at all.

2. **Rule 8 gains a requirement on the SET: a provocation is evidence only when it FIRES, and only
   when it fires FOR THE REASON IT NAMES.** Two halves of one question. *Does the guard ever fire* is
   P8's proposal — **adopted**, on W30's seventeen instances at once, W31's three constructed cases and
   W29's live counter-case — with the procedure attached: construct the case, and where the corpus
   cannot express one, **record that rather than arguing it**. *Does it fire for this reason* is the
   half nobody had named, and it is [Q138](open-questions.md) inside rule 8: **six occurrences in three
   items**, including three `SELF` entries that bounded an ABORT while naming a floor, a probe refused
   by the copy of an expression that was already covered, and a probe that reported *refused* by
   crashing. **Read the failure lines, not the exit code.**

3. **Section 1 rule 5 gains a clause about WRITING: a claim states the scope it was MEASURED at.**
   The existing clause is about **reading** a derived claim; this is the other direction. Two
   occurrences, two items, both found by a conformity reader: W30 measured five checks by hand and
   wrote *"all five"* into six documents when there are six; W31 measured one file and wrote *"in any
   of the three"* with an owner cell naming six, false in two of them. **Neither author read anything
   wrong; both generalised without saying so.**

**And one question P6's retro left open two plans ago is answered: NO.** That retro wrote that if a
seventh plan found a fourth obligation for rule 8, *"the right response is to ask whether rule 8
should be a section rather than a rule."* P7 found the fourth and P9 the fifth. **It stays a rule, and
the argument is its ADDRESS** — *"section 5 rule 8"* is cited in this document, in four plans, in
eleven work items and in the register, and section 3's *"ids are never reused and never renumbered"*
is the same argument one level out. Moving it would cost more than its length does.

**What did NOT change, and all four were live.** `check-owns.mjs` **stays retired for the fifth
plan** — eleven consecutive items have audited their `Owns` correctly, P9's four at zero, zero, two
and zero late exceptions, and W30's two were the same pair P9's own declaration had to take, on the
same two files, for the same reason. **Rule 7 (c) is EXERCISED, heavily** — all **136** probes in six
self-tests declare their set — and W29 found its **mirror-image limit**: naming one check does not
discriminate because a malformed probe trips two, and **two clauses that both trip the right one are
indistinguishable**; the discriminating signal (the failure COUNT) is a `scripts/**` mechanism and is
not lifted here. **Section 6's two-reader split is settled** and its band is corrected from 1-4 to
**0-4 over fourteen measurements** — the number changed, not the conclusion. And **`doc/` is refused
for the eighth time**, having produced more instances in P9 than in any plan before it, with change 3
adopted instead as the one sub-case that has now occurred twice.

**v0.9 is P7's retro, and its central finding is that rule 8's obligations are about WHAT is
asserted, WHERE THE VALUE COMES FROM, and — new — HOW MANY THINGS ARE ITERATED.** Four items, eight
reader passes, sixty-nine findings, sixteen of them blocking. **Four changes, two of them to rule 8,
and one refusal for the seventh time.**

1. **Rule 8 gains a FOURTH obligation: break the LOOP BOUNDS.** Not what a value *is*, and not where
   it *came from* — **how many things the assertion runs over**. Two occurrences, two items, both
   BLOCKING, both found by an adequacy reader, and **neither reachable by any probe of the first two
   kinds**. W22: a matrix row could be deleted for **0 failures**, and a whole column dropped from the
   depth-2 loop **with the assertion count unmoved**, while the render kept printing four. W23: the
   four nested L6 rows could be deleted for one edited number — **green at 388 with `lint`,
   `typecheck` and all five `check:*` passing**, and no dotted task id dispatched anywhere above L2 —
   and the foreign-task list could be emptied entirely for 0, deleting **P6's** exit artifact along
   with W23's own. **The sharpest half is that W23 knew about the axis**: it ran five bounds probes
   deliberately — a row, a region, a foreign task, a branch, the cost model — **and all five were
   caught, and its reader still found two more.** The author bounded the lists a **row** iterates; the
   reader bounded the lists the **file** iterates. Ask of every list: can an entry leave, can the
   whole list leave, and does anything COUNT it from a source other than itself.

2. **Rule 8 states the PROCEDURE for a provenance probe, not only the axis.** v0.8 named the axis and
   left the instantiation to the author, and it has been corrected **four times across three items**
   — [Q112](open-questions.md) — three of them by an author repeating a correction a reader had made
   to them one item earlier. The procedure is one sentence and it now lives in the rule rather than in
   a register row: **a provenance probe changes the SOURCE EXPRESSION and nothing else.** The moment
   it also edits the projection, the expected literal, or a second line, it is a rewrite and its
   survival says nothing. **This replaces nothing**; v0.8's third obligation was right and could not
   be instantiated from what it said.

3. **Section 1 rule 5's provenance clause extends from *an index* to ANY COPY, including your own.**
   The rule reads *"a claim about another item's status is read from that item's own file, never from
   an index"*. W23 reported a count to a human that was wrong because it read it from
   `examples/README.md` — **a file that item had written itself**, for an earlier version of its own
   work. One occurrence, and rule 2 admits one with a stated argument: **the rule names indexes
   because indexes are where the failure had been seen, but the mechanism is reading a derived claim
   instead of deriving it**, and an author's own summary is the copy most likely to be trusted. The
   register is the second instance in P7 alone — it described [Q117](open-questions.md)'s failure
   incorrectly in two successive items, in the file read before every one of them.

4. **Section 7 rule 2 gains a sentence: an item's `Owns` is written from its PLAN's index row, never
   from its title.** Two occurrences and two confirmations, and the numbers are the argument. W20's
   `Owns` gave it no file it was allowed to *test* in and took **five** late exceptions; W21's named
   paths and still narrowed `src/driver/driver.ts` out of a block P7's own table had put it in —
   **four** late. W22 wrote its block from the plan row, kept `driver.ts` for a different reason than
   the plan gave, and took **two**. W23 took the whole `examples/**` block the row gives it and took
   **none — the first item of P7 to take zero.** Five, four, two, zero, with the cause stated in
   between.

**What did NOT change, and all four were live.** **Rule 7 (c) is unexercised for the FIFTH plan**,
and for the third consecutive plan because **no check was worth building** — but P7 declined **two**,
[Q121](open-questions.md) (dead links in `doc/**` and `AGENTS.md`, which `check-spec`'s C5 already
does for `spec/**`) and [Q126](open-questions.md) (a runtime can be dropped from the gate chain for 0
failures), **and both were declined for the same reason: `scripts/**` and `package.json` are in
nobody's `Owns`.** That is v0.7 change 3's shape — a gap that blocks a fix rather than hiding an edit
— twice in one plan, and it is **a plan's problem rather than this document's**: the next plan that
wants either check must own those paths. Named here so it is not rediscovered a third time.
**`check-owns.mjs` stays retired** for the fourth plan, now with the strongest evidence it has had:
change 4 above took late exceptions to **zero** without a script. **The two-reader split is settled at
twelve measurements** and closed to re-litigation. And **`doc/` is refused for the SEVENTH time**,
with its one checkable sub-case identified for the second time and given an owner-shaped answer rather
than a rule.

**And one thing happened that no previous plan's declaration step had done.** Nine plans have measured
a load-bearing fact before declaring and in all nine it changed what got written; W20 corrected P7's
work-item **table**. **W22 falsified P7's own DECISION** — *"`arrival-count` REFUSES nested fan-out"*,
built on a mechanism (*"`N` is fixed at the outer branch list"*) that measurement showed does not
exist. The refusal, a driver construction check, a new error class and the matrix's first
declared-empty cells all went with it, and **the plan's stated size problem dissolved into a smaller
item**. Eleven plans; the practice needs no rule and this is the strongest single result it has
produced.

**v0.8 is P6's retro, and its central finding is that rule 8's two obligations are both about WHAT
is asserted and neither is about WHERE THE VALUE COMES FROM.** Two items, four reader passes, and
both of the plan's carried-in questions answered. Two changes, both to rule 8, and **one refusal for
the sixth time**.

1. **Rule 8 gains a THIRD obligation: for every value an assertion reads, break its PROVENANCE.**
   Not what is claimed - where the number came from. Substitute a different source; delete the guard
   that makes a recorded value the one it claims to be; let a later write overwrite it; delete one of
   two writers. **This is section 5 rule 4 made provocable.** That rule has said *"fixtures must not
   come from the code under test"* since v0.3 and has never had a procedure, and every instance of it
   has been found by a reader: **five, across three items, all of them BLOCKING, none found by an
   author.** W14's pair row read its disjointness off `driver.dispatchedIds()` - the code under test -
   and stayed green at 233/0 while the scheduler was handed 55 `addTask` calls for 50 distinct ids.
   W17's `finishedBy` was read from a flag the loser also set, and its `lateInputs` from a single
   deletable recording. W19's *"both drivers were attached"* was a latched field a later settlement
   could overwrite, and its ordering assertion's **source** could be swapped from the scheduler to a
   driver with the row still green. **The qualification is stated rather than hidden: all five are in
   `examples/**`**, which is where values are *reported* rather than asserted, so a harness is where
   this should be expected to live first.
2. **Rule 8's set is re-run AFTER acting on the readers' findings, and the readers' own edits are
   checked back in as probes.** W18 found the need and asked P6's retro to judge it on W19's
   evidence: **both** of W18's blocking survivors were in guards it had written earlier in the same
   item to close the readers' first findings. An author's set is written once, before the readers
   report, and the fixes that follow are the least-tested code the item ships - which is rule 8's own
   founding observation applied inside rule 8's own procedure. **W19 ran it and it fired**: after its
   first close moved two anchors, the harness's rule 7 (b) guard aborted with *"the mutation matched
   NOTHING"* rather than reporting a pass, and the readers' four edits are now probes costing 2, 2, 2
   and 6 failures. This is rule 7 (a)'s *"a probe that ran once is a claim about the past"*, applied
   to a fix rather than to a check.

**Neither change replaces anything and that is worth saying**, because rule 4 said *deletions are as
legitimate an output as additions*: v0.7's two amendments to rule 8 both earned their keep on this
plan's evidence, so rule 8 grows rather than being rewritten. **It is now the longest rule in this
document, and if a seventh plan finds a fourth obligation the right response is to ask whether rule 8
should be a section rather than a rule.**

**What did NOT change, and all three were live.** **Rule 7 (c) is reported unexercised for the fourth
plan** - and for the second consecutive plan the reason is that **no check was worth building** rather
than that none was possible: W18 declared a conditional `check-source.mjs` exception in case ADR 0027
created a refusal `src/` must not make, and it did not, because every constraint the decision imposes
is asserted directly by a test that fails when it is broken. **Section 6's two-reader split is
settled at ten measurements** and should not be re-litigated. And **`check-owns.mjs` stays retired**
for the third plan: W18 and W19 both audited their `Owns` correctly, W19 with an empty exceptions
table exactly as declared, which is seven consecutive items.

**And `doc/` is refused for the SIXTH time, on a NEW direction of the same class - one this retro
produced itself and had to correct in place.** Every previous occurrence was a **stale** claim: a
number that had been right and had stopped being right. P6's is the opposite. The register's census
line was **correct**; an agent re-deriving it during the record step used a parser that broke on the
three longest rows, was told by its own script that those rows had **no status cell**, believed it,
and wrote that explanation into the register, into this document and into a commit message. All three
rows have status cells. The line is now right again, and the correction is recorded in place rather
than the wrong version being deleted.

**The lesson is narrower than the class and it generalises.** `CLAUDE.md` records P4 getting this
same line wrong three times *"by chaining a derivation instead of stating a predicate"*, and P5's
answer was to make it state one. That was right and it is **not sufficient**: the predicate was
correct and the **evaluation** of it was not. A derivation that runs is not a derivation that is
checked, and the cheap guard is the one this one lacked - **a parser that cannot classify a row must
say so loudly rather than return a value.** *(No check over `doc/` would have caught this either,
which is why the class is refused again rather than mechanised: the output was prose, and the script
that produced it was written and thrown away in the same step.)* **The rest of the class is refused
on P2's unchanged reasoning.**

**And one refusal for the fifth time, now with its one checkable sub-case carved out.** `doc/` is
upstream of every check here and is checked by nothing. P1, P2, P3 and P4 each named it and each
refused a mechanism as worse than the problem. **P5 refuses it a fifth time and adopts change 4
instead** — not a check over `doc/`, but a rule about where a claim is *read from*, which is the one
sub-case that has now occurred twice and is the one that reproduces.

**What did NOT change, and both were live questions coming in.** `check-owns.mjs` **stays retired**:
five consecutive items audited their `Owns` set correctly, and W16's failure was a **stale count of a
correct set** rather than P2's undeclared edit — a different defect, caused by change 3's gap rather
than by discipline. And **rule 7 (c) is exercised and unchanged**: W16 built `check-policies.mjs` with
its ten probes at birth, three of the ten failed at birth, and the set-equality form discriminated on
its first real use. Full reasoning in
[P5's Record](plans/p5-a-third-and-fourth-policy-or-repairs-of-the-first-two.md).

**And one refusal, for the fourth time: `doc/` is checked by nothing.** P4 rewrote the register's
census line four times and got it wrong three - stale, then self-contradictory, then off by one -
each time by chaining a derivation instead of stating a predicate. The line now states one, and is
countable in one pass. **Still not a rule**, on P1's, P2's and P3's reasoning. Full detail in
[P4's Record](plans/p4-the-drivers-lifetime-and-the-handles-it-gives-out.md).

**P1's central measurement, still the one that should shape how a plan reads this document:**
of the eight defect classes P1 produced, **five have no rung on the ladder at all - and every one of
those five was found by the conformity pass.** The ladder is good at what it covers; section 6 is
carrying what it does not.

---

## 1. The loop

```
   concept          doc/concept.md - what we are building and why. Rarely changes.
      |
      v
   plan             doc/plans/<id>-<slug>.md - ONE question, ONE exit artifact
      |
      v
   work items       doc/work-items/<id>-<slug>.md - one file each, declared BEFORE work starts
      |
      +--> W_a ---+
      +--> W_b ---+   parallel where a spec separates them, serial otherwise
      +--> W_c ---+   tests are written INSIDE the work item, never afterwards
                  |
                  v
   verify          three passes, in this order:
                    1. the ladder (section 4) - climb from L0, stop at the first failure
                    2. spec conformity - a reader who did not write it checks it against the spec
                    3. retro - what the work taught, and what changes in the docs
                  |
                  v
   record          fill in the work item's Record section, mark it done, then update
                  the plan's Record, doc/README.md, CLAUDE.md and README.md
```

Four rules that make the loop worth having:

1. **A work item that cannot state its verification gate is not ready to start.** Write the gate
   first. If you cannot, the decomposition is wrong and starting will not fix it.
2. **Tests are part of the work item, never follow-up.** A work item is done when the code works,
   the tests exist, and someone who did not write them has read them against the spec.
   **This rule was followed by all five of P1's items and every one still shipped an assertion that
   could not fail**, because the author who misreads the spec writes the code and the test from the
   same misreading. Writing tests inside the item does not make them falsifiable; section 5 rule 3,
   and the procedure in rule 7, are what do.
3. **A decision that is not in `spec/`, an ADR, or a plan did not happen.** Chat transcripts are
   not the record.
4. **Say what you skipped.** A skipped check reported as passed makes the whole ladder worthless.
5. **The record step's files are part of finishing an item, not exceptions to its `Owns`.** Those
   **six** and no others: the plan's Record, `doc/README.md`, `CLAUDE.md`, `README.md`,
   **`doc/open-questions.md`**, and **`doc/decisions/**`**. **Anything else outside `Owns` is
   declared.**

   **And a claim about another item's status is read from that item's own file, never from an index.**
   `doc/README.md`, `CLAUDE.md` and a plan's Record all describe items they do not own, and all three
   go stale the moment that item's readers report. Twice, in two plans, an index has said
   *"reader-passes outstanding"* about passes that had run. The second time it **reproduced itself**:
   the agent starting W17 read three stale indexes, believed them, and wrote the claim forward into a
   fourth document before checking `doc/work-items/w16-*.md`, which had been correct the whole time.
   The item file is the source; an index is a copy.

   **And a claim states the scope it was MEASURED at, never the scope you believe — P9's retro, and
   it is the other direction of the same rule.** The clause above is about **reading** a derived
   claim; this is about **writing** one. Two occurrences, two items, both found by a conformity reader
   and both landing in documents read before every work item: **W30** measured the `--self-test`
   dispatch in **five** checks enumerated by hand in its own probe script and wrote *"measured in all
   five checks"* into **six documents** — there are six, and the census omitted the second most
   expensive one; **W31** measured two message-only verdicts in **one** file and wrote *"in any of the
   three files that carry them"* with an owner cell naming **six**, which is wrong internally and false
   in two of them. **Neither author read anything wrong. Both generalised without saying so**, and the
   register is where it lands because the register is where findings are lifted to. Write the number of
   files you ran it in.

   **And a WITHDRAWN claim is SEARCHED FOR, not merely corrected where it was found — P13's retro,
   and it is the third direction of the same rule.** The two clauses above are about **writing** a
   claim and **re-taking** it; neither is about **un-writing** one. Three occurrences, two plans,
   every instance found by a conformity reader: **W46's two readers withdrew four claims** — *there is
   no channel*, *~1% of the clone*, *2.5x in run position*, and [Q22](open-questions.md) cited for a
   threshold — **and all four survived in `spec/README.md`'s own row for the document W46 had just
   changed, in a file W46 edited in the same commit**, because `C8` compares the version column and
   nothing compares the prose; **W45**'s `validate.ts` header said *"Twenty-four refusals"* where the
   file implements **27**, and had been wrong by three before that item touched it; and **W47**'s
   reader found **seven** stale counts in `examples/**` — *eight roles*, *nine pools*, *the THREE
   reference forms* — whose true values that item's own new clauses compute correctly three lines
   away. **So: when a claim is withdrawn or a count moves, search the tree for the phrase or the
   number before recording.** *An index that contradicts the document it indexes does so on precisely
   the sentence that was just corrected*, because that is the sentence somebody was looking at.

   **The one case where the phrase is EXACT is an item's own ID, and the procedure is a grep — P14's
   retro.** A claim with an expiry date is written by one item and falsified by another, so the item
   that must un-write it is not the item that wrote it, and it has one unambiguous string to search
   for. Measured over this repository's own history, outside `doc/`: at W32's commit `W33` returns
   **19** hits in eight files, one of them *"These are W33's cases only until W33 exists"*; at W33's,
   `W34` returns **10**; at W49's, `W50` returns **12**. At W41's, `W42` returns **0**, and at W50's,
   `W51` returns **0**. **Zero false positives in the three that fire and nothing in the two that do
   not**, so the search costs one command and returns either the set or silence. Two occurrences, two
   plans, both blocking and both found by a conformity reader: **W33** shipped a run-time refusal
   with no rule id anywhere in `spec/`, where `spec/flow-definition.md` section 2 had addressed that
   question **to W33 by name**; **W50** shipped ten sentences saying a run still applies the prefix
   rule, **every one true when W49 wrote it**. *So: before an item is done, it greps the tree for its
   own id.*

   **And a measured number is RE-TAKEN on the tree the item ships — P11's retro, and it is the WHEN
   that clause has no answer for.** An item is not finished when its work is; it is finished when two
   readers have changed it, and rule 8 already requires the provocation set to be re-run at that
   moment. **The item's own numbers are re-taken in the same pass.** Three occurrences, three items:
   W23 reported a count to a human read from `examples/README.md`, a file that item had written, for
   an earlier version of its own work; **W32's Record read *"506 on chromium"* from a run made before
   the change the Record describes**, and running it for real found a defect that had broken every
   browser runtime; and **W39 — the item whose entire subject is measurement — reported its headline
   saving as `-38.3%`, the figure at code-complete, against the `-23.8%` its own ADR carries**, because
   the twelve blocking findings its readers made cost 75 s afterwards. Its census note is the same
   defect a second time in the same item: **`139 / 96` where the register is `140 / 97`**, taken before
   the third question that item raised had a row. **No rung of section 4 covers a Record's numbers**;
   the conformity pass is the only thing that can, and on W39 it caught one count and missed the
   headline. *Where a number is derivable in one expression, derive it there; where it costs seven
   minutes to take, take it last.*

   **And it is ANY copy, including one you wrote yourself** — P7's retro. W23 reported a count to a
   human that was wrong because it read it from `examples/README.md`, **a file that item had written**,
   for an earlier version of its own work. The rule names indexes because indexes are where the
   failure had been seen; **the mechanism is reading a derived claim instead of deriving it**, and an
   author's own summary is the copy most likely to be trusted. Where a number is derivable in one
   expression, derive it there. P7's second instance is the register, which described
   [Q117](open-questions.md)'s failure incorrectly in two successive items — in the file read before
   every one of them.

   **The register was added by P4's retro, and it is why the miscounting stopped.** Every work item
   carries a `Reserves:` line obliging it to write rows to `doc/open-questions.md`, and the list here
   named four files that did not include it - so *every* item back to W4 edited it undeclared. P2's
   retro read three consecutive miscounts as a discipline problem and proposed a check
   (`scripts/check-owns.mjs`, as W10). **The cause was this list being wrong**, and naming the missing
   file fixed it without a script: W12 declared two exceptions, W13 five, W14 one, and all three
   audited **correct** - 19 of 19 and 7 of 7 by their conformity readers, after three in a row that
   were not. **`check-owns.mjs` is retired as a proposal**; if an item miscounts again with this list
   correct, that is the second occurrence and it comes back.

   **`doc/decisions/**` was added by P5's retro, and it is the same fix un-generalised.** A
   `Reserves:` line names **ADR ids as well as Q ids**, and both oblige a write; P4's retro named the
   register and not the decisions directory, so every item that ever reserved an ADR wrote an
   undeclared file. W16 measured it across its own nine exceptions. **W17 is where it stopped being
   bookkeeping**: a sentence in ADR 0015 that W17's own deliverable falsified stood through the whole
   item, because correcting a file in nobody's `Owns` needs an exception declared before the item
   starts, and the item could not have known. **A gap that blocks a fix is worse than one that hides
   an edit**, and that is the occurrence to remember. *(`spec/README.md` is a third file of this
   shape and is NOT on the list, deliberately: `check-spec`'s `C8` makes its version row a
   consequence of any `spec/**` bump, so it belongs to whichever item owns that spec document -
   W16's finding, and it is an `Owns` question rather than a record-step one.)*

   **Five consecutive items have audited their `Owns` SET correctly** - W12, W13, W14, W15, W17 - and
   the one failure in between was a **stale count of a correct set**, which is a different defect from
   P2's undeclared edit and was caused by the gap above rather than by discipline. `check-owns.mjs`
   stays retired on that reading.

## 2. The unit of work

**A plan is a vertical slice.** It cuts end to end - definition through driver through a real
scheduler - and ends in something a human can look at. A plan must:

1. State the **one question** it answers, in a sentence.
2. End in an **exit artifact**: a run that routed correctly, a measured number, a rendered trace.
3. Touch every layer it claims to touch. No stub standing in for the interesting part.
4. Be small enough that its whole gate runs in under a minute.

**A work item is the smallest thing with its own gate.** It owns a set of files, states what proves
it correct, and is declared in the plan before anyone starts. Use `doc/work-items/TEMPLATE.md`.

## 3. Ids and files

| Thing | Id | Lives in |
|---|---|---|
| Plan | `P1`, `P2`, ... | `doc/plans/p1-<slug>.md` |
| Work item | `W1`, `W2`, ... - one sequence across all plans, never per plan | `doc/work-items/w1-<slug>.md` |
| Open question | `Q1`, `Q2`, ... | `doc/open-questions.md` |
| Decision | `ADR 0001`, ... | `doc/decisions/0001-<slug>.md` |
| Upstream want | `S1`, `S2`, ... | `doc/scheduler-upstream.md` |

**Ids are never reused and never renumbered.** They leak into commit messages, test names and spec
prose, and a commit message cannot be rewritten. Gaps are free; renumbering is not.

**A work item reserves its question and ADR numbers in its declaration, before work starts** - the
`Reserves:` line. Every work item raises questions nobody predicted, so reserve generously (5
questions, 2 ADRs) and let the unused ones be skipped. Two items that each take "the next free
number" while running in parallel take the same one, and that is a rename across nine files.

**Q ids are shared vocabulary across the fyflow repos, not across their numbering.** Our Q17 and
`fyflow-react-components`' Q16 are the same question with different ids. Cite the other repo's id
with its repo name attached, always.

## 4. The verification ladder

Every check has a level. **Climb from 0 and stop at the first failure** - an L1 failure makes an L5
result meaningless.

| L | Check | Cost | Catches |
|---|---|---|---|
| 0 | Typecheck, lint, format | ~2 s | signature drift, dead exports, style churn in diffs |
| 1 | Unit tests: definition validation, predicate registry, the fold - **no scheduler** | ~3 s | logic errors |
| 2 | **Routing tests**: a fixture log of task outcomes in, an asserted node sequence out | ~5 s | the decision and fan-out logic, without a single worker |
| 3 | **Determinism**: fold the same outcome log twice, deep-compare run state | ~2 s | map ordering, `Date.now()` in the fold, hidden state |
| 4 | **Definition conformance**: every example flow validates against `spec/` | ~3 s | an author and the driver drifting apart |
| 5 | **Join and failure matrix**: every Q5 case - failed, `user_action`, optional-null, routed-away - against every join policy | ~10 s | the case the happy path never reaches |
| 6 | **A real scheduler**, real workers, a real flow, end to end | ~60 s | dispatch races, the id scheme, everything no fixture can prove |
| 7 | **A human looks** at a trace or a run | a person | does it read as a flow executing |

**Level 2 is where this repo's value is proved and it costs almost nothing.** Routing is a pure
function of outcomes, so the interesting behaviour - a decision, a fan-out, a join - is testable
with no workers, no threads and no timers. If level 2 is hard to write, the driver has reached for
the scheduler somewhere it should not have, which is the review's first question (concept section
4).

**Level 5 is a rung rather than a case because the join is the hard part** (Q4-Q7). A matrix that
enumerates outcome × policy is the only thing that makes a Q5 answer honest, and every cell that is
"undefined" is a spec hole with an address.

**Level 6 is the only rung that sees a real scheduler**, so it is the only one that can catch a task
id colliding (Q13), a `workerType` that is not a registered pool, or a driver listener that is too
slow on a hot path. Do not skip it because 0-5 are green; every one of them is downstream of
fixtures we wrote ourselves.

**The ladder has a second dimension: the runtime.** This library targets **Deno, Node >= 24 and the
browser from one source tree** (`spec/runtime-targets.md`), so a rung is not green until it is green
where it is required to run:

| Rungs | Where they run | Why |
|---|---|---|
| **L0-L5** | **all three** | pure logic over fixtures. Three cheap passes, and L0 in particular is the only thing that catches a `node:` import before a Deno consumer does (`RT-R3`, `RT-R4`) |
| **L6** | **open — [Q33](open-questions.md)** | the only rung with real workers, and therefore the only one whose cost is per-runtime rather than per-pass |
| **L7** | once | a person does not read the same trace three times |

**A rung reported green without saying which runtimes it ran in is a rung that ran in one.** Section
1 rule 4 applies to this axis exactly as it applies to skipped levels.

**And a rung reported GREEN means its command EXITED 0. A line of its output is never the predicate**
— P14's retro, and it is the opposite direction from the one section 5 rule 8 states, which is why
both are written down. Three occurrences, two plans, every one `GATE EXIT=1` with **zero lines
beginning `FAIL`**: [W42](work-items/w42-what-a-decision-sees.md) twice, on an unused import and then
on a dead `const` stranded by the fix for a reader's finding — **run 1 exited at chain entry 1 with a
23-line log, and this Record's own `npm run gate` row had already been written as green**; and
[W50](work-items/w50-what-the-run-carries-at-independent-arities.md), whose author ran
`npm run lint 2>&1 | tail -1`, saw `Checked 49 files` — **which `deno lint` prints whether or not it
found anything** — and read it as a pass. Since
[ADR 0039](decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md) `lint`
is the chain's FIRST entry, so a chain that fails there runs nothing after it, and `FAIL` is a word
the seven checks print and `lint` does not.

> **The two directions, because the document stated only one and it cost three blocking findings.**
> To call a rung **GREEN**, the exit code is **NECESSARY** — a zero `FAIL` count is satisfied by a
> chain that stopped at entry one and by a check that prints a count either way. To call a
> provocation **CAUGHT**, the exit code is **NOT SUFFICIENT** — it cannot tell a detection from a
> crash, from noise, or from a sibling covering for the clause, which is section 5 rule 8's *read the
> failure LINES* and [Q138](open-questions.md).

**The sentence existed and was in the wrong document.** `CLAUDE.md` has carried *the exit code is the
predicate and a FAIL count is a secondary signal* since v0.12 and is read before every item; W50
reproduced it two plans later, in a THIRD secondary signal nobody had named, and **both** its readers
found it independently. A procedure belongs in the procedure document.

**AND THE PROCEDURE, because stating the predicate was not enough — P15's retro.** v0.15 wrote the
clause above and **[W54](work-items/w54-what-a-result-may-be-and-what-bounding-it-would-cost.md) broke
it one plan later while quoting it in its own Verification table**: it ran
`npm run test:browser:all` through `grep -E "file\(s\)|PARITY"`, and the `27 file(s), 703 assertions`
line prints **before** the failures — so three browsers were red and reported green **twice**. That
is **four occurrences across three plans** — W42 twice, W50, W54 — and every one of the four is an
author reading a LINE because the rung's output was too long to read whole.

> **So: a rung is RUN, never PIPED. Redirect it to a file and read `$?` in the same command.**
>
> ```bash
> npm run gate > gate.log 2>&1; echo "GATE EXIT=$?"
> ```
>
> A pipe replaces the exit code with the last stage's — `cmd | grep` exits on whether `grep` matched
> — and the count line every runner here prints is emitted before the failures it is being read as
> evidence about. **Grep the log afterwards if you want the lines; grep is a reading tool and never a
> verdict.**

**Why a procedure rather than a restatement**, which is v0.9's argument for obligation (c)'s: the
axis was right and could not be instantiated from what it said. *Do not read a line* is what the
clause says; *do not pipe* is what an author can act on, and it is the one thing all four occurrences
have in common. **The measured cost of following it is nothing** —
[W55](work-items/w55-a-run-at-scale-on-real-workers.md) ran every rung this way, including both L6
runtimes and `test:browser:all`, and the log is still there to grep.

**Levels 0-6 are the agent's job. Level 7 is where a person enters.** Never spend a person on
something an L<=6 assertion could have caught. If a human finds a bug a machine check could have
found, the fix is to **add the check**, not just fix the bug.

> **What the ladder does not cover, measured over P1's five items.** Five defect classes have **no
> rung**, and all five were found by section 6's conformity pass rather than by any level here: an
> assertion that cannot fail; **a declared output that was never built**; a spec asserting what its
> own inputs cannot supply; a false claim in `doc/`; and a check that does not exist but is reported
> as having run.
>
> **They are not made rungs, and the reason is that L0-L6 are commands.** *"Did you build what you
> said"* is not one. The first is addressed by `doc/work-items/TEMPLATE.md`'s **Outputs** table,
> where an output nobody built is a blank cell a reviewer can see, and the last by section 5 rule 7.
> The middle three are the conformity pass's, and knowing which is which is the point of the list.

## 5. Tests are a deliverable, and tests can be wrong

```
   spec --+--> implementation --+
          |                     +--> ladder L0-L7 --> green
          +--> tests -----------+
                  ^
                  +-- one author reading the spec wrong once produces code and tests
                      that share the misreading, agree perfectly, and pass
```

> **A green ladder is a statement about the tests. Reading the tests against the spec is what turns
> it into a statement about the code.**

Rules:

1. **Expected values come from the spec, not from output.** Paste a routing sequence you got by
   running the driver and you have written a test that never could have failed. Non-obvious values
   carry their derivation in a comment.
2. **A snapshot generated by running the implementation is not a test.** It is a photograph of
   today's behaviour, bugs included. When a snapshot diff appears, assume the code broke until
   proven otherwise. "Update the snapshots" is the most dangerous command in this repo.
3. **Assertions must be able to fail.** `expect(visited.length).toBeGreaterThan(0)`, no-throw tests,
   and truthiness checks are placeholders.
4. **Fixtures must not come from the code under test.** An outcome log generated by the driver
   proves the driver agrees with itself. Hand-write it from the spec, or capture it from a real
   scheduler run and review it line by line at birth.
5. **Test the contract, not the implementation.** Never assert internal call order, or a fan-out
   completion order the spec does not fix - that order is genuinely non-deterministic (concept
   section 5) and a test that depends on it will flake in CI and nowhere else.
6. **The cases the spec names are a coverage checklist with addresses.** A branch routed away from
   its join (Q4), a task ending in `user_action` (Q17), no decision edge matching (Q10), a
   duplicate task id (Q13), a nested fan-out (Q6) - each missing test is a hole with a citation,
   not a vague gap.
7. **A new check is negative-tested at birth, and the provocations are checked in.** Rule 3 says an
   assertion must be able to fail; this is how you know one can. Write the check, break the thing it
   checks, watch it fail, put it back - **and commit the breaking, so it can be re-run.** Three
   requirements, each from a failure of the weaker form:
   - **Checked in and runnable**, not run once by hand. W9 ran five probes in a scratch directory;
     its adequacy reader then disabled the script's own machinery one piece at a time - `if (false)`
     on two of its checks and on its final `process.exit(1)` - and **8 of 9 survived**. Made
     re-runnable, the same five probes became twelve, and **seven of the holes were found by the
     act of re-running them.** `scripts/check-docs-selftest.mjs` is the worked example.
   - **Each probe asserts that it changed its input.** A probe whose edit matches nothing passes for
     the wrong reason, which is the vacuity this whole rule exists to refuse.
   - **A probe declares the full SET of checks it must trip, and the set must match exactly** — not
     merely that something exited non-zero, and **not merely that the named check is among those that
     failed.** W6's ten mutations included **one that was a syntax error rather than a mutation**; the
     harness read only the exit code, so a parse failure was indistinguishable from a caught mutation,
     and it became that Record's most confident false claim. **Naming the check does not fix that**,
     which P3's retro measured: garbage inserted into a `run` snippet trips `check-docs`' X3 *and* X4
     together, so it satisfies a probe declared as either one and is reported as caught. Set equality
     is what discriminates, and it costs almost nothing — **11 of `check-docs`' 12 probes already
     trip exactly one check**, and the twelfth declares its one legitimate cascade
     (`X3 -> X4, X5`: a snippet that does not compile also does not run).

   **P1's evidence for the rule was one-sided and remains so:** every check provoked at birth worked
   - `check-source.mjs`'s ten and `check-scheduler.mjs`'s five - and the one hand-run once and
   written into a Record as though it were a gate, `RT-R4`'s grep, **did not exist at all.** A check
   written to close a review finding needs this most: two of W5's failed their own first negative
   test, one because it searched text it had already blanked.

8. **When you act on a review finding, break the fix and watch the gate go red.** Rule 7 for fixes
   rather than for checks, and it exists because **three consecutive items shipped a repair that
   could not fail**.

   **This rule has grown to five obligations, FOUR requirements on the set and one on the harness,
   so it carries its own index.** P6's retro asked whether a fourth obligation should make it a section; P9's retro answered
   **no**, because *"section 5 rule 8"* is cited in this document, four plans, eleven work items and
   the register, and section 3's *ids are never renumbered* is the same argument one level out. It is
   indexed instead:

   | | obligation | added by |
   |---|---|---|
   | **(a)** | break the rule's own CLAUSES — **and the SHAPES those clauses quantify over, every value the rule ENUMERATES** | v0.6, P4's retro; **the shapes clause v0.16, P15's retro; the enumeration clause v0.17, P16's retro** |
   | **(b)** | break every row of the `Outputs` table | v0.7, P5's retro |
   | **(c)** | break the PROVENANCE of every value an assertion reads — change the source expression and nothing else | v0.8, P6's retro; procedure added v0.9; **its LIMIT v0.13, P12's retro; and what *independent* excludes, v0.16, P15's retro** |
   | **(d)** | break the LOOP BOUNDS — one entry out, the whole list out, and does anything COUNT it from elsewhere — **a count is not a membership** | v0.9, P7's retro; **the membership clause v0.14, P13's retro** |
   | **(e)** | break the WIRING — what happens when the check is NOT RUN, and **is what it ran what SHIPS** | v0.10, P9's retro; second question **v0.12, P11's retro**; **third shape v0.13, P12's retro** |
   | | **and on the set as a whole:** | |
   | | a survivor is one only once a **second independent route** confirms the clause was reachable | v0.7, P5's retro |
   | | re-run the whole set **after** acting on the readers, with their exact edits checked back in | v0.8, P6's retro |
   | | a provocation is evidence only when it **fires**, and only when it fires **for the reason it names** | v0.10, P9's retro |
   | | whatever makes a **discriminating PAIR differ** is itself a claim, and the set breaks it | **v0.13, P12's retro** |
   | | **and on the HARNESS that applies the break:** | |
   | | it carries a **control** — a probe that changes nothing comes back clean — and the **restore is asserted**, bytes compared back rather than assumed; **and every declared survivor is RUN, against the rung its own reason names**; **and every EDIT's anchor is checked against the CURRENT text, an abort undoes what it applied, and the tree is held still by a content DIGEST**; **and a set-equal-literal ceiling is DATED — the item that moves the value re-runs it** | v0.11, P10's retro; **the ceiling clause v0.14, P13's retro; the per-edit and dated-ceiling clauses v0.17, P16's retro** |

   The three founding cases:
   - W4 - the join's `null` payload could become `{}` and survive 251 assertions.
   - W5 - the L6 gate's termination predicate replaced by `setTimeout(1)`, every assertion still
     passing, because `scheduler.shutdown()` drained the run while the fold kept advancing.
   - W9 - the reference's flagship snippet wrote three records for one settlement and stopped its
     own run, while its assertion passed **because a refusal fired before the dispatch it counted**.

   Each was correct work done in response to a finding, and none was *shown* to be correct. **No rung
   of section 4 covers this**: L0-L6 all check the product, and nothing checks the repair. Record the
   provocation beside the fix, the way rule 7 asks of a check.

   **Write the provocations to the RULE, not to the fix.** P4's retro is the amendment, and its
   evidence is three items in a row: in each one the author's set was incomplete, and incomplete in
   the *same direction* — every probe was a way to **remove** the fix, and every survivor the readers
   found was a way to **narrow** it.

   | | the author's set | what the readers added |
   |---|---|---|
   | W12 | five ways to delete the freeze | freeze only one event variant; freeze only when the id matches the fixture's |
   | W13 | seven ways to delete the guard | exempt one terminal state at a time — three survivors, on a guard the fixtures only ever drove in one state |
   | W14 | three ways to delete the guard | keep the guard and **substitute the source of truth** the assertions read |

   So: enumerate the **rule's own clauses** and break each — every terminal state, every event
   variant, every branch of a two-tier test — rather than enumerating the ways the fix could be
   undone. A set written from the fix inherits the fix's blind spot by construction.

   **AND THE SHAPES THE RULE QUANTIFIES OVER, NOT ONLY ITS CLAUSES — P15's retro, and it is the
   third time one fixture choice has hidden a rule being wrong.** A clause is a sentence; a shape is
   a value of the KIND that sentence ranges over, and this repository's rules range over kinds
   constantly — *a region* is a `fanout` or a `map`, at depth 1 or nested; *a reference* is aimed or
   `"."`, bare or conditional; *a result* is a plain object or a built-in or a class instance. **An
   author picks the shape the feature was built for, every time.**

   | | the rule | the one shape the set used | what it hid |
   |---|---|---|---|
   | [W41](work-items/w41-what-a-node-can-reach-and-what-names-it.md) | `FD-V28`, stated over *a region* | **all 37 probes used a `map` region** | the rule was wrong about a `fanout` and **refused a valid document**; the whole half was unreachable from the set, and its own document contradicted it nine lines down |
   | [W53](work-items/w53-what-a-run-retains-that-nothing-reads.md) | ADR 0046 rule 3, stated over *a region* | **every release case: one `map` region, at depth 1, on a flow with no `needs`** | a **nested** region and a **`fanout`** region could each never release for ZERO, and the whole of `outputsCache` — three defects, one choice |
   | [P15](plans/p15-what-a-run-retains-and-what-a-result-may-be.md)'s own fact 1 | *what the driver retains* | properties enumerated on flows with **no `needs`** | `outputsCache` recorded as **`null`**, which is a property of the fixtures rather than of the driver — **and the item written to correct it chose its fixtures the same way** |

   **So: for every KIND a rule names, the set instantiates more than one value of it — and where the
   corpus has only one, say so rather than leaving the set looking complete.** W41 recorded this
   shape, W53 reproduced it one plan later, and P15's declaration produced it a third time from the
   measurement side; W53's own Record argued it was already covered by *enumerate the clauses*, which
   is true and is exactly why it keeps failing — **a clause enumeration is finite and visible, and
   the values a clause ranges over are neither**. This is v0.13's recorded correction again: *an
   obligation run as a step in a set passes; the same obligation asked as a question of one artefact
   fires.* Ask it of the KIND.

   **AND WHERE THE RULE ENUMERATES ITS OWN VALUES, THE SET IS THAT ENUMERATION — P16's retro, and the
   clause above was FOLLOWED twice and was one value short twice.** *More than one value of each kind*
   is a ceiling an author sets at two or three:

   | | the rule | the shapes the set used | what it hid |
   |---|---|---|---|
   | [W58](work-items/w58-what-a-node-says-about-its-own-task.md) | `FD-V30`/`FD-V31`, stated over *a task node* | three, deliberately, under this clause — **and the list was bound by nothing but the printed case count**: the map shape deleted cost 0, and with it gone a rule narrowed to the other two cost 0 | the item's headline claim, unfalsifiable by its own suite |
   | [W59](work-items/w59-what-a-node-type-is.md) | `FD-C5`, whose row LISTS four kinds of `input` | three, deliberately, under this clause | the fourth — a join's successor — which a driver could hand `{}` for **0** at L2 and L6 |

   **So: a shape list is a MEMBERSHIP claim and is bound as one (W58), and where the rule names its
   values the list is the rule's, every one of them (W59).** Both items enumerated shapes because this
   clause says to, and both enumerations were the author's rather than the rule's — v0.13's
   correction a third time, on this clause specifically.

   **AND enumerate the `Outputs` table's rows and break each of those — P5's retro, and the amendment
   above is right but not sufficient.** Its prediction was fewer reader survivors; measured over
   three items the readers found **blocking** gaps in all three, and on the third the direction
   flipped:

   | | the author's set was written to | what the readers found it blind to |
   |---|---|---|
   | W15 | the rules — and it was complete on them, finding the one code-level survivor | **both things the item CREATED**: a renderer the gate never executes (7 survivors, one printing a two-column table green) and two policies promoted to columns with no clause-level test (4) |
   | W16 | the rules — every probe written to one went red | **four of five aimed at what the item created survived**: section 3's wording rewritable to demand two arrivals, a whole column deletable from the ADR's pasted table |
   | W17 | **both**, deliberately, after reading the two above | the rule-written half found what the deliverable hid — the third policy's discriminating clause exercised in one direction only, invisible to every probe aimed at the new rows. The deliverable-written half found three of the four real survivors |

   **Neither half is sufficient and neither is redundant.** A probe written to a rule mutates
   something the suite already reads, so it cannot see a deliverable nothing reads; a probe written to
   a deliverable asks whether the thing exists, not whether the rule behind it can fail. The
   `Outputs` table already asks the second question in prose — *"what would fail without it"* — and
   this makes the answer a measurement.

   **A survivor is only a survivor once a second, independent route confirms the mutated clause was
   reachable.** This replaces the weaker requirement W17 proposed about itself — that rule 8's set
   inherit rule 7 **(b)**, *a probe asserts it changed its input*. **7 (b) is not enough here and that
   was measured**: W17's adequacy reader's harness enforced it, refusing any probe whose target text
   was absent and asserting the file changed, and **all three of its vacuous probes passed**, because
   a probe can change the input without changing an observable — dead code, a no-op condition, a
   reordering across a line with no side effect. All three reported as **SURVIVED with the gate
   green**, which is the dangerous direction: a vacuous probe and a real hole are then
   indistinguishable, and one of the three landed on `RN-R10`. The two counts, from the two halves of
   one item: **2 of 14 for the author (one a syntax error reported as *caught*) and 3 of 126 for the
   reader (all three no-ops reported as *survived*)** — the same failure in opposite directions, and
   **the exit code discriminates neither.**

   **AND break the PROVENANCE of every value an assertion reads — P6's retro, and it is a third axis
   rather than a third list.** The two obligations above both ask *what is claimed*: the rule's
   clauses, and the outputs' rows. Neither asks **where the number came from**, and that is where
   every blocking survivor of three consecutive `examples/**` items lived:

   | | the value | how it broke, with the gate green |
   |---|---|---|
   | W14 | the pair row's disjointness | read off `driver.dispatchedIds()` — **the code under test**. 233/0 while the scheduler was handed 55 `addTask` calls for 50 distinct ids |
   | W17 | `finishedBy` | read from a **flag the loser also set**, so it proved the predicate fired and never that it ended the wait |
   | W17 | `lateInputs` | a **single recording** whose one `push` could be deleted, making *"nothing arrived after"* a tautology on nineteen rows |
   | W19 | *"both drivers were attached"* | a **latched field** whose first-settlement guard could be deleted, so every later settlement overwrote it |
   | W19 | the foreign settlement's ordering | its **source** could be swapped from the scheduler to a driver, and with the benign ordering too the row read 0 failures |

   **Five instances, three items, every one BLOCKING and every one found by an adequacy reader.** So:
   substitute a different source; delete the guard that makes a recorded value the one it claims to
   be; let a later write overwrite it; delete one of two writers.

   **This is section 5 rule 4 made provocable**, which is the argument for why it generalises. That
   rule has said *"fixtures must not come from the code under test"* since v0.3 and has never had a
   procedure — it is a thing an author declares and a reader checks, and the five rows above are what
   that costs. **The qualification is stated rather than hidden: all five are in `examples/**`**, where
   values are *reported* rather than asserted, so a harness is where this should be expected to live
   first. Whether it generalises past one is the seventh plan's to measure.

   **And re-run the whole set AFTER acting on the readers' findings, checking their exact edits back
   in as probes.** An author's set is written **once**, before the readers report, and the fixes that
   follow are the least-tested code the item ships — which is this rule's own founding observation
   (*three consecutive items shipped a repair that could not fail*) applied **inside this rule's own
   procedure**. W18 found it the hard way: **both** of its blocking survivors were in guards it had
   written earlier in the same item to close the readers' first findings. W19 ran the amendment and it
   fired — after its first close moved two anchors, its harness's rule 7 (b) guard aborted with *"the
   mutation matched NOTHING"* rather than reporting a pass, and the readers' four edits became probes
   costing 2, 2, 2 and 6 failures. **Rule 7 (a)'s *"a probe that ran once is a claim about the past"*,
   applied to a fix rather than to a check.**

   **The provocation is recorded as an edit precise enough to re-run**, and that is enough — it does
   not need checking in the way rule 7 (a) requires of a check. Measured: W13's and W14's readers
   reproduced every provocation exactly from the Record, to the failure count.


   **AND BREAK THE LOOP BOUNDS — P7's retro, and it is a fourth axis rather than a fourth list.**
   The three obligations above ask *what is claimed*, *which outputs exist* and *where the number came
   from*. **None of them asks how many things the assertion runs over**, and that is where both of
   P7's reader-found blocking survivors lived:

   | | the bound | how it broke, with the gate green |
   |---|---|---|
   | W22 | a **matrix row** | deleted from `NESTED_SCENARIOS` for **0 failures** — the only guard read the *expectation* table, so a row that left took its own assertions with it |
   | W22 | a **column** | dropped from the depth-2 loop for **0 failures with the assertion count unmoved**, because the columns are looped *inside* test cases — while the render kept printing four |
   | W23 | **four L6 rows** | deleted for one edited number: green at **388** with `lint`, `typecheck` and all five `check:*` passing, and **no dotted task id dispatched anywhere above L2** |
   | W23 | a whole **list** | `UNMINTED` emptied for **0 failures** and an unmoved total, deleting **P6's** exit artifact as well as W23's own |

   **Two items, four instances, every one BLOCKING and every one found by an adequacy reader.** So:
   ask of every list an assertion runs over — can one entry leave? can the whole list leave? and does
   anything **count** it from a source other than itself?

   **AND A COUNT IS NOT A MEMBERSHIP — P13's retro, and it is the third clause of this obligation
   rather than a fourth.** The question above has an answer that keeps being *yes* and keeps not
   working: `DECLARED_TOTAL` in `examples/l6.ts` **is** a count from a source other than the list, a
   number a human writes down, and the same deletion has walked out past it three times in three
   plans.

   | | what left | what it took |
   |---|---|---|
   | W23 | four L6 rows | **one** edited number. Green at 388, and no dotted task id dispatched anywhere above L2 |
   | W35 | five more rows, and the whole cross-row block with them | **two** numbers — `DECLARED_TOTAL` and `CROSS_ROW`. *A layer whose floor is a second number a human writes is not a second floor* |
   | W47 | the ENTIRE cross-row layer, three blocks | **two** numbers and one import line, back to the exact pre-item figures in both runtimes with all five checks at exit 0 |

   **So: where a deletion is one integer edit away, the layer declares its MEMBERS by name.** W35's
   answer is `ROW_KEYS` — set equality **and** order against the rows that ran, so *a deleted row
   fails naming itself*; W47's is `CROSS_ROW_SUBJECTS`, one substring per cross-row block required to
   have been emitted, so a deleted block fails naming what it was about. The count stays **beside**
   the membership rather than being replaced by it: a count catches an assertion that quietly stops
   running inside a member that is still there.

   **The limit is part of the clause.** Both answers are literals, so a member and its name are two
   edits in one diff rather than an impossibility — [Q102](open-questions.md)'s shape, recorded as
   [Q217](open-questions.md) — and a block nobody declared a member for is invisible exactly as a row
   absent from `ROW_KEYS` would be. *Three iterations, each closed one layer further out, is an
   argument that the answer is not a fourth list*, and P13's retro records that and declines to act on
   it.

   **The sharpest half is that W23 already knew.** It ran five bounds probes deliberately — a row, a
   region, a foreign task, a branch, the cost model — **and all five were caught**, and its reader
   still found two more. **The author bounded the lists a ROW iterates; the reader bounded the lists
   the FILE iterates.** Knowing the axis is not the same as instantiating it, which is this rule's
   own recurring lesson: see the sentence immediately below.

   **A provenance probe changes the SOURCE EXPRESSION and nothing else** — P7's retro, and it is a
   procedure rather than a new obligation. v0.8 named the provenance axis and left the instantiation
   to the author; it has since been corrected **four times across three items**
   ([Q112](open-questions.md)), and three of those were an author repeating a correction a reader had
   made to them one item earlier. **The moment the probe also edits the projection, the expected
   literal, or a second line, it is a rewrite and its survival says nothing.** Two worked examples of
   the failure, both from W23's author: `x && y`, which evaluates a source and discards it and so
   changes nothing at all; and a *fix* for a reader's provenance finding that recorded the value from
   **the same local the reader's probe swaps**, leaving the probe at 0 after the fix. **Only the
   re-run below found the second.**

   **It also catches a false CLAIM, not only a weak assertion**, which is a use worth naming: W14's
   own provocation showed a row's comment said it covered a rule when it covered half of one.

   **AND BREAK THE WIRING — P9's retro, and it is a FIFTH axis rather than a fifth list.** The four
   obligations above ask *what is claimed*, *which outputs exist*, *where the number came from* and
   *how many things are iterated*. **None of them asks whether the thing RUNS AT ALL**, and a check, a
   grading or a guard can be present, correct and never reached while everything is green:

   | | the wiring | how it broke, with the gate green |
   |---|---|---|
   | W24 | the **MANIFEST** | ` --self-test` dropped from a `package.json` entry — the name stays in the chain and the plain check runs **twice**. Found by both of W24's readers; `S11` now refuses it four ways |
   | W30 | the **SCRIPT** | the four-line `--self-test` dispatch deleted from the check itself: `npm run check:X:selftest` runs the plain check, exits **0**, and `check:source` exits 0 beside it. **Measured six for six** — in `check-docs`' case, 128 s of gradings silently not running. `S11` reads the manifest and cannot see it ([Q149](open-questions.md)) |
   | W31 | the **HARNESS** | a mutation harness writing its mutants into a directory the child deletes on its own first line: **`12/12 bounded` at exit 0**, every grading in every child reading *"the mutant did not run"*. The pass ran and measured the deletion ([Q151](open-questions.md)) |

   **Three instances, three items, and it is earned against a prediction written down before the item
   that tested it.** P9's work-items section said of W30: *"the prediction is that `S11` catches it and
   the obligation is therefore about a hole that already has a check … if instead W30 ships a wiring
   hole `S11` does not see, that is the second occurrence and the obligation is earned."* Both halves
   happened, and they are different halves of the wiring. So: ask of every check, grading and guard —
   **can it be skipped, unreferenced, or reached with nothing to do, and would anything say so?**

   **AND ITS SECOND QUESTION — WAS WHAT IT RAN WHAT SHIPS? — P11's retro, and it is the same question
   asked of the SUBJECT rather than of the check.** The three questions above are all properties of the
   check itself, and **W39 instantiated them three times by hand and its two readers then found EIGHT
   more instances in the same item**, every one `npm run gate` at exit 0 with the self-tests silently
   not running, inside the check written to make that impossible. That is W23's asymmetry a second time
   — *the author bounded the lists a ROW iterates, the reader bounded the lists the FILE iterates* — in
   a different obligation. **Five consecutive items, every instance found by a reader, every one
   blocking:**

   | | the wiring | how it broke, with the gate green |
   |---|---|---|
   | W36 | `test:l6:deno`'s **flags** | `--import-map` dropped, so Deno resolves the bare specifier out of `node_modules` — the **npm** package — and L6 reports 489 assertions, exit 0, with `D3` printing `ok`. `D6` was created here |
   | W35 | `test:l6`'s **argument** | either rung repointed at `examples/run-flow.ts`, which exports functions and runs nothing — **zero** failures across four checks, and every exit artifact in this repository is in that one file |
   | W37 | the pin's **reachability** | `D3` compares the npm and JSR version strings and stops there. Deno blocks a JSR version published under 24 hours old, so for a day the gate ran a pin one runtime could not fetch, with `D3` printing **`ok`** — the version bound and the artifact not ([Q173](open-questions.md)) |
   | W38 | the **default** the dispatch loads | `G1` sets `CHECK_<NAME>_SELFTEST` on every run and the gate never does, so the one configuration the gate runs is the one `G1` cannot observe. `check:wiring` green, `check:spec:selftest` at exit 0, **18 probes never running** |
   | W39 | the **default** again, four ways | the spawn printing instead of running (`7/7 completed` in **0.1 s**), the plan guarded on an override (**`0/0 completed`**), the exclusive filter falsified, the scripts directory moved |
   | W39 | the chain entry's **argument** | `--plan`, `echo`, and `\|\| exit 0` — the last surviving the clause that closed the first two, because `\|\|`, `exit` and `0` are inert argv tokens to Node and the **shell** throws the runner's verdict away |

   So, two more questions with a procedure each. **Is the command bound by EQUALITY, and does the check
   run THAT command** rather than one it composes — *a deletion and a suffix are two defects, and a
   clause written for one catches one.* **And if the check must CONFIGURE its subject in order to
   observe it, what observes the configuration that SHIPS?** The override is what makes the check
   affordable and it is what makes it blind. The answer W38 and W39 reached independently, one file
   apart, is to **read the default declaration rather than running it** — capture the whole declaration
   and compare it to the one form it may take, which is what keeps it from being a presence test. *(All
   five are checks over the gate's own wiring, which is the scope. The second half generalises past it
   without argument — any test that stubs, injects or overrides is by construction not testing what
   ships — and the evidence that an author does not reach it from the axis alone is that W39 quoted
   W38's sentence in the file where it then reproduced W38's hole.)*

   **AND ITS THIRD SHAPE — A LIST IS A CLAIM ABOUT ANOTHER LIST — P12's retro, and the scope the
   paragraph above states is now measured rather than assumed.** The two procedures above are both
   about a **command**: what it is bound to, and what it runs. **P12 produced four instances in three
   items of a shape that is neither**, and the question that finds all four is (e)'s second one asked
   of a **DECLARATION**: *what does this list have to agree with, and what would say so?*

   | | the list | how it broke, with the gate green |
   |---|---|---|
   | W41 | `RULE_PREFIXES` in `scripts/check-spec.mjs` | the fix for [Q164](open-questions.md) added `FD-C` and derived both of the check's patterns from it so they could not disagree — **and the constant itself was bound to nothing.** Dropping `FD-C` costs **zero**: the two `FD-C` rules then match neither pattern and are neither declared nor cited. *Q164's own defect surviving inside the fix for it* |
   | W41 | an `accepted` forms list in a test | the three reference forms written as a literal beside a document that declares three rows |
   | W42 | `EDGE_KEYS` in `src/definition/validate.ts` | `FD-V17` refuses *a key its kind does not declare*, and section 3's Edge key table is the document's only statement of what an edge declares. Nothing compared them, so for one item **the code accepted `needs` on an edge while the table did not list it** — `spec/README.md` rule 4's inverse, in the ACCEPTING direction |
   | W43 | `Role`, the `switch` arms in a worker, and a pool registry | three lists saying the same eight things, in `examples/**`. One letter in a pool's role and `run()` falls off the end of a switch TypeScript does not require to be exhaustive, returns `undefined`, and **the SCHEDULER's own message handler dies** before any assertion runs ([Q194](open-questions.md)) |

   So, a third question with a procedure. **Find the other list and compare the two BOTH WAYS.** A
   floor is not a binding and neither is a subset: three of the four above were closed by set equality
   against the document or the manifest that is the other half, which is `JP-R9`'s own sentence —
   *compare the two halves rather than copy one of them*.

   **AND *BOTH WAYS* IS A DIRECTION, NOT AN OBSERVER COUNT — P13's retro, and it is where this
   procedure meets (c)'s LIMIT.** W47 instantiated this shape deliberately on four lists in
   `examples/**` — a pool registry, a `Role` list, a `switch`'s arms, and the workerTypes eighteen
   flow documents name — and compared them **pairwise, both ways, three times**, arguing in the
   block's own header that *each clause is also the other two's evidence that the extraction worked*.
   **Its adequacy reader defeated all three with ONE source swap**: source one list from another and
   the compound — a role declared with an arm and no pool, the one direction those clauses exist for —
   comes back **green** where the real source costs 1. The header's claim is true of an extraction
   returning **nothing**, which a guard can throw on, and false of one re-sourced to its counterpart.
   **So each of the three facts had exactly one observer, and set equality in two directions does not
   make two.** Obligation (c)'s LIMIT applies to the comparison itself, and the two obligations
   compose in a way neither paragraph said. [Q216](open-questions.md), recorded and **not repaired**:
   the only second derivation available was a second regex over the same text, which is the sensor
   corroborating itself. *A both-ways comparison is worth having; what it is not is a second observer.*

   **And W43's answer was a TYPE, which is what the scope correction turns on.** `Role` is
   `typeof ROLES[number]` and the pool constructor takes one, so an invented role is a **typecheck**
   failure at ladder L0 — cheaper and earlier than any assertion, and available in product code where
   a `.mjs` check has nothing like it. **But a type closes ONE direction**: a member added to `ROLES`
   with no arm and no use costs zero, at L6 and at typecheck both, and only the adequacy reader's
   measurement established that ([Q196](open-questions.md)). *The question generalises; the answer does
   not, and a one-directional binding is worth having as long as the direction is written down.*

   **The scope P11's retro stated was *checks over the gate's own wiring, in `scripts/**`*.** Two of
   P12's four are there, one is `src/` and one is `examples/**` — **so the shape is not a property of
   check-writing**, and this is the first evidence either way. W41 recorded it as a third shape on one
   item with the argument that the first two are instances of it; W42 and W43 supplied the second and
   third items, and the argument is now unnecessary.

   **The author reaches none of them.** Across the three items the authors instantiated (e) as written
   — W41 three times, W42 three, W43 three — and **every one passed**; all four instances above were
   found by a reader or by asking the declaration question deliberately. That is W39's asymmetry for
   the third plan running.

   *(**REVERSED by P13, and the mechanism is visible** — P13's retro. Three instances were reached by
   the author: W46's `ALL_CHECKS`, a closed allowlist behind which a whole check id shipped ungraded
   at 14/14, 8/8, exit 0 ([Q209](open-questions.md)); W46's `X6` reading `AGENTS.md` **by name**
   rather than the document the check is pointed at, which is the second question and **the first of
   its three instances caught by an author's own set** ([Q210](open-questions.md)); and W47's own new
   import reaching past `index.ts` into `src/`, which nothing outside `examples/**` notices. **All
   three were reached by instantiating the obligation as a NAMED STEP with its own measurement rather
   than as one probe among fifty** — W46's two came out of writing the check that binds the lists, and
   W47's out of asking the question of an import it had just added. So the asymmetry is about the
   INSTANTIATION and not about the author: an obligation run as a step in the set passes; the same
   obligation asked as a question of one artefact fires.)*

   **THE LIMIT OF (c)'s PROCEDURE, AND IT IS A RULE THAT WAS FOLLOWED — P12's retro.** W34 settled
   that a provenance probe cannot be graded against a correct implementation, because a source swap on
   working code leaves both sources agreeing, and prescribed a **compound probe**: swap the source AND
   break the subject, then ask whether the pair is still red. **W43 followed it and the compound came
   back GREEN**, and the reason is not a defect in the probe.

   ADR 0040 rule 6 says a node receives **exactly** the object its declaration describes. The only
   thing at ladder L6 that can observe a **superset** is a worker reading its own payload's key set —
   so the probe that re-sources that reading **removes the only observer**, and the compound then
   measures nothing. Re-sourcing it to a literal cost **0**; with it live, a driver composing one extra
   key costs **8**. *A SENSOR CANNOT CORROBORATE ITSELF, and no probe over one observer can tell a
   bound clause from an unbound one.*

   So the procedure gains its limit: **when the compound probe is green, count the observers.** If the
   clause has exactly one, the fix is not a better probe — it is a **second independent expression over
   the same fact**, after which a probe that re-sources either one leaves the other live. W43's is the
   negative form of the same reading, `extraKeys`, and the compound then fires.

   **One occurrence, and the argument for why it generalises is that the axis never asks the
   question**: (c) asks *where did this value come from* and every clause with a single observer has
   this property, whatever it is about. The alternative reading — that this is a ceiling to be declared
   rather than a hole to be closed — is what W43's **author** wrote, with a correct reason and a named
   second route at L2; its adequacy reader measured the eight failures that reason was costing.
   *A ceiling declared with a correct reason is still a hole if the reason is about the OBSERVER rather
   than about the fact.*

   **AND *INDEPENDENT* MEANS THE SECOND OBSERVER IS NOT DOWNSTREAM OF THE FIRST'S APPARATUS — P15's
   retro, and every mechanism in this rule is blind to it BY CONSTRUCTION.** The LIMIT above says to
   add a second independent expression and does not say what independent excludes.
   [W55](work-items/w55-a-run-at-scale-on-real-workers.md) added one that was independent in every
   way the word suggests — `v8.serialize` over a named set of fields against
   `process.memoryUsage().heapUsed` after a forced `gc()`, two different mechanisms measuring two
   different things — and **the second was measuring the first one's instrument**. The byte observer
   keeps a snapshot of what it measured; that snapshot was reachable from the driver's own options,
   which the byte walk skips by name; so observer 1 could not see it and observer 2 could, and every
   retained driver held **a second copy of the very structure the decision under test releases**.
   Measured: **141.9 MiB against 129.4** at fifty runs, one whole collection each, and confirmed at a
   second scale.

   **Why no existing mechanism reaches it.** v0.11's requirement on the harness is *a probe that
   changes nothing comes back clean* — and the clean run is contaminated **identically**, because the
   instrument is present in it. A control can only see what a probe ADDS. Rule 7 (b) asks whether the
   probe changed its input, which it did. The set's own reachability definition asks whether the
   mutated clause was observable, which it was. **Every one of those is blind here by construction**,
   and the item's own Scope had written *a sensor cannot corroborate itself* and *this item is where
   that matters most* one paragraph before building it.

   **So, when a second observer is added to corroborate the first: ask what the first one RETAINS,
   and whether the second can see it.** Where the instrument is inside the measured graph — memory,
   reachability, a live set, a count of what is held — **drop it once it has been read**, and say in
   the code that this is why. One occurrence, and the argument is the paragraph above rather than a
   second instance: the blindness is a property of the mechanisms, not of this item.

   **AND WHATEVER MAKES A DISCRIMINATING PAIR DIFFER IS ITSELF A CLAIM — P12's retro, and it is a
   requirement on the SET rather than a sixth axis.** This repository reaches for **two runs differing
   in one variable** whenever a value has to be shown to come from where it claims: `r5`/`r6`,
   `r14`/`r15`/`r16`, `nested LOW`/`nested HIGH`, and W43's two of its own. **The pair is the
   assertion — and in three items across two plans the property that made the two halves differ was
   carried by literals that nothing compared.**

   | | the pair | what it cost to collapse it |
   |---|---|---|
   | W17 | two rows reaching the `lost` and `exited` join paths, arranged by a per-role delay | reversing one `Set` literal in a different file restored W6's original defect exactly — `settleJoin` deletable from the `lost` path with the gate green, and `exit-last` from four failures to **none**. Closed by `Expectation.joinSettledBy` |
   | W43 | two runs of one flow at two run configs, so no literal can stand in for a declared key | making the two configs equal cost **0**; with that done, hard-coding the declared key's value in the worker cost **0** as well, and the whole of [Q166](open-questions.md) was green |
   | W43 | a LOW and a HIGH decision row, so a predicate cannot pass by returning a constant | making the HIGH row LOW cost **0**; with that done, a predicate of `() => true` cost **0**, and W42's mechanism was unasserted |

   So: **assert the difference.** Whatever the pair turns on — two payloads, two configs, two arranged
   orders — read it from the fixtures and compare, so that collapsing the pair is a failure rather than
   a smaller suite. It is `JP-R9`'s sentence applied to a FIXTURE instead of to a rule, and the
   measurement that earns it is the second row of each pair above: *the mechanism underneath became
   deletable for zero the moment the pair stopped being one.*

   **Why a requirement on the set rather than an axis.** (a) through (e) each name a thing to break in
   the SUBJECT; this names a property of the EVIDENCE, which is where the other three requirements
   live. And it is not (c): a provenance probe changes where a value comes from, while this changes
   what two fixtures disagree about — W43's author ran (c) over the same rows and reached neither.

   **AND A PROVOCATION IS EVIDENCE ONLY WHEN IT FIRES, AND ONLY WHEN IT FIRES FOR THE REASON IT
   NAMES — P9's retro, and it is a requirement on the SET rather than a sixth axis.** Two halves, and
   they are the same question in two directions.

   **Does the guard ever fire?** This is P8's proposed *"a check written for a defect you have just
   fixed has no live case, so its probes are the whole of its evidence"*, and it is right: W30 is
   **seventeen** instances at once — `spec/` has passed `C1`-`C8` since W1, so every probe there builds
   an invalid `spec/` that has never existed — plus one with **no case its corpus can express at all**.
   W31 has three guards whose case had to be **constructed**, one of them for a defect that was never
   in the tree. W29's `D5` is the counter-case, a check written for a defect that was live. **So:
   construct the case that makes each guard fire, and where the corpus cannot express one, RECORD that
   rather than arguing it.** *(And the corpus catches up: `M1` shipped green with no live case and
   caught a real dead link **one plan later**, in the declaration of the plan that recorded the gap.)*

   **When it fires, is it for THIS reason?** Rule 8 grades a provocation by *did the gate go red*.
   **That is [Q138](open-questions.md) — an exit code cannot tell a detection from noise, a crash, or a
   sibling covering for the clause — living inside this rule's own procedure**, and P9 found it six
   times in three items:

   | | the provocation went red | for |
   |---|---|---|
   | W29 | `D2`'s and `D5`'s unreadable-input clauses, both STILL CAUGHT | a **sibling reporting the same id**. The failure COUNT then split them: `D2` is co-firing and **detected**; only `D5` is masking. *Co-firing is detectable by a projection nobody was reading; masking is not* |
   | W30 | 17 of 21 gradings reported `exit0` | *there was nothing left to report*, where `exit0` in the sibling files means *the right ids were found and the exit path lied*. **No grading changed and only the reported reason did** |
   | W31 | three `SELF` entries written to bound a floor | **the ABORT**, because each named a probe some grading also named. The floor's disjunct was deletable for **0** with all three "passing" |
   | W31 | the `SELF` entry written to bound `MAX_CORPUS` | the named probe coming back **STILL CAUGHT** — so `corpus`'s only producer was deletable for 0 |
   | W31 | the author's probe for rule 7 (c)'s set equality | it used `replaceAll`, hit **both** copies of a duplicated expression, and was refused by the copy that was already covered. The uncovered one cost 0 |
   | W31 | the author's probe reproducing its own shipped defect | a **crash**, not the control run it was written to exercise |

   **So: read the failure LINES, not the exit code.** A provocation whose declared target is a
   particular clause must be shown to have broken that clause — which is rule 7 (c)'s argument, one
   layer out from the probes and applied to the author's own set.

   **Neither half replaces anything.** This rule already defines a *survivor* as one only once a second
   independent route confirms the mutated clause was **reachable** — reachability in the negative
   direction, *did the mutation change an observable*. These are the positive direction, *does the
   guard produce its own failure, and is that failure the one being counted*.

   **AND THE HARNESS CARRIES A CONTROL, ASSERTS ITS RESTORE, AND RUNS EVERY DECLARED SURVIVOR —
   P10's retro for the first two, P13's for the third, and the third is a rule that was FOLLOWED.**
   Three times across two plans a harness produced a plausible result that was its own artefact: W31
   graded a deletion it had caused and reported `12/13 bounded` at exit 0; W35's restored with
   `git checkout` on a dirty tree and **deleted the item's own uncommitted work mid-run**; W37's
   applied only the last edit per file and returned four probes as WRONG-REASON. So: **a probe that
   changes nothing comes back clean, and the restore is asserted — bytes compared back, not assumed.**

   **P13 found the third way a harness lies, and v0.11's two were satisfied throughout.** W45's, W46's
   and W47's harnesses are one lineage; each ran its control and asserted every restore; and **all
   three had a code path that ran NOTHING.** With a row declared `red: []` — a **ceiling**, a survivor
   the author expects and explains — the command list was empty, the results object was empty, and the
   verdict **restated the declaration**. It is invisible in the report by construction, and what found
   it is W47's conformity reader **timing** a probe: **0.26 s against 3.4 s** for one that runs.

   **P13's retro measured all eleven ceilings the three items declared**, and the yield is a number
   rather than a ratio: **eight come back clean and their stated reasons hold; one was false; and one
   was true when written and false on the tree the plan ships.** The false one substituted a literal
   that was **set-equal** to the value it replaced, so the probe changed the input without changing
   anything observable — W17's vacuous-probe class — under a stated reason that was *about the
   observer rather than about the fact*, which is (c)'s LIMIT's own closing sentence. The stale one
   said *a member added to `ROLES` with no arm and no pool costs ZERO at L6 and at typecheck*; a
   later item in the same plan closed it, and **running it against L1 cannot see that.**

   **So the clause names the rung: run each declared survivor against the rung its own reason cites,
   and print the measurement beside the declaration.** *A ceiling is a claim, and a claim nobody ran
   is this repository's most common defect.* And it is cheap: closing it inside W47 turned up five
   more defects in the same pass — three stale `says` substrings, a ceiling that was really a catch,
   and one whose measurement belonged to a different command.

   **AND EVERY EDIT'S ANCHOR IS CHECKED AGAINST THE CURRENT TEXT, AN ABORT UNDOES WHAT IT APPLIED,
   AND THE TREE IS HELD STILL BY A CONTENT DIGEST — P16's retro, and the three requirements above
   were SATISFIED throughout by a harness that measured nothing on seven probes.**
   [W58](work-items/w58-what-a-node-says-about-its-own-task.md)'s `apply()` read the ORIGINAL bytes
   for every edit, so a probe with two edits on one file kept only its second — W37's defect verbatim,
   inside a harness with a control and byte-asserted restores — and seven probes came back in shapes
   only a half-applied probe explains: a compound costing exactly what its second edit costs alone.
   Fixed, the same harness then kept an applied edit when a later anchor was missing, thirteen probes
   crashed at load on it, and the held-still check — a `git status` diff — could not see a file
   modified either way. **Three occurrences, two plans, and none of the requirements above reaches
   any of them, because a control, a restore and a ceiling run are all about a probe that RAN.**
   [W59](work-items/w59-what-a-node-type-is.md)'s harness carried all three clauses: its one abort
   (an anchor a reader's fixture had moved) undid cleanly with the digest identical, and the digest —
   a sha over every tracked and untracked-unignored file — is what a reader's copy and a gate are
   compared against.

   **AND A SET-EQUAL-LITERAL CEILING IS DATED: the item that moves the value re-runs it — P16's
   retro, the second plan to find one.** Re-running every ceiling at the retro found two of W58's
   eight are CATCHES on the tree the plan ships — `schedulerGroups` sourced to `['gate']` and the task
   key list sourced to W58's eight keys, both literal set-equal on W58's day and both moved by W59.
   P13's retro found W45's `e4` the same way, moved by W47. *A ceiling whose reason is that two things
   are equal today is a claim with an expiry date, and the retro is the wrong place to find it expired*:
   W59 edited both values and could have run W58's set in a minute. So: where an item's edit touches
   a value the previous item's ceiling names, the ceiling is re-run in that item, not at the retro.

## 6. Verify: the three passes

**Pass 1 - the ladder.** Section 4. Report which levels ran and which did not, per work item.

**Pass 2 - spec conformity. Two readers, one question each.**

| reader | reads | asks | method |
|---|---|---|---|
| **conformity** | the spec first, the code second | does this do what the spec says, including the refusals and the edge cases | reading, and re-deriving the item's expected values independently before looking at them |
| **adequacy** | the spec first, the tests second | **would these tests have noticed if it did not** | mutation, chosen by walking the rule ids rather than by intuition, **in an isolated copy of the tree** |

Both **read the spec before the artifact.** Reading the code first reconstructs the author's
misunderstanding and confirms it. Both run with a fresh context or as a separate session, and both
**report; they do not fix** - a reviewer that patches what it found has reviewed its own work.

**The adequacy reader mutates, so it works in a COPY** - a `git worktree`, an archive, anything
off the shared tree. P4's retro adopted this after three reader pairs had run concurrently against
one checkout: on the third, the conformity reader's early measurements picked up the other's
instrumentation (a stray debug line, and a run reporting `declared: 219` against a file reading 233),
and the adequacy reader's cleanup deleted `node_modules`. It re-took every number from an isolated
copy and its report was sound - but **it isolated itself unprompted, and the document did not ask**,
which is the whole of the amendment. One occurrence, and it generalizes without argument: two agents
editing one tree is not a review method.

**Verify the copy holds no links before removing it, and never create one to make it typecheck.**
P5's retro, and the sentence exists because v0.6's rule was **followed** and cost a repository. W16's
adequacy pass isolated correctly and then hit the obvious obstacle: the worktree's `node_modules` did
not resolve, a junction was placed there so `tsc` would ignore a sibling checkout's source, and
`git worktree remove --force` **followed it out of the repository** — `.git/`, `core/`, `index.ts`,
`dist/`, until it hit a lock. Recoverable only because that project had been published
([ADR 0029](decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)).
The dependency edge that made the junction seem necessary is gone, and **the rule still said nothing
about the removal, which is the part that did the damage** — every recursive tool that touches a
worktree is one link away from another tree, whatever put the link there.

So, in order: **copy** the dependencies rather than linking them (`cp -r node_modules` is inert when
the tree holds no links, which is worth confirming rather than assuming — W17 measured **zero**
symlinks and zero reparse points, and its worktree typechecked and gated with no link at all);
**verify** green in the copy before the reader starts, so a red result is the reader's finding rather
than the copy's; and **scan for links before `--force` anything** — `find <copy> -type l` plus, on
Windows, `Get-ChildItem -Recurse -Force -Attributes ReparsePoint`. If either is non-empty, do not
remove it; say so and stop.

**And while a reader is reading, the AUTHOR's tree holds still — P14's retro, and it is the other
half of the paragraph above.** The isolated copy fixes the reader's side of P4's contamination; it
does nothing about the author continuing to edit the tree the reader took its copy from, and **rule
8's set mutates that tree by construction**, so running it during a review is the same defect from
the other end. Two occurrences, two items, **two different observers**:
[W51](work-items/w51-the-sibling-region-flow-on-real-workers.md)'s conformity reader picked up
`examples/l6.ts` at **six digests** and, at one instant, a **live rule-8 probe** in
`src/driver/driver.ts` — **one snapshot RED, on correct code**, and every number in that report had
to name the digest it was taken at; and
[W50](work-items/w50-what-the-run-carries-at-independent-arities.md)'s first `npm run gate` ran in
the background while W51's edits landed, so **its verdict was about a tree that no longer existed**.
*A measurement over a moving tree is a claim about no tree.* So: **an item's rule 8 re-run, its gate
and its Record's numbers are taken with the tree still** — which is where v0.8's *re-run the set
after acting on the readers* already put the re-run, for a different reason.

*(**And the retro that adopted this broke it within the hour**, which is the third occurrence and the
one that says the rule is worth having: P14's retro started its confirming `npm run gate` in the
background and then went on editing `doc/README.md` and `README.md` while it ran. It was stopped
unfinished and re-run against the final tree. The pull is always the same — a gate costs ten minutes
and there is obvious work to do meanwhile — and **the thing that makes it a defect rather than a
habit is that the verdict is reported as though it were about the tree that ships.**)*

**Why two readers rather than one asking both questions**, which is what earlier versions said.
Measured **thirty-four** times now: W4 1 of 13, W5 3 of ~35, W6 3 of ~25, W9 3 of ~30, W12 3 of 18,
W13 4 of 24, W14 4 of ~26, W17 3 of ~31, W18 2, W19 4 of 18, W28 4, W29 1, W30 2, W31 0, W32 2,
W33 2, W34 2, W36 1, W39 4, W41 1 of 116, W42 2 of 61, W43 2 of 39, W45 2, W46 2, W47 2,
W49 2, W50 2, W51 1, W53 2, W54 4, W55 2, **W57 0, W58 1, W59 1**.
**The ORDINAL is derived by counting this list, and P12's three items each got it wrong by two** —
W41 wrote *eighteenth*, which is W36's, and W42 and W43 incremented from it, so three consecutive
Records were internally consistent with each other and wrong against the only list there is. All
three are corrected under pass 3 rule 6. *Section 1 rule 5's provenance clause — any copy including
your own — on a number nothing had to derive.*
**It is a count of measurements TAKEN and not of items reviewed** —
W35, W37 and W38 each ran both readers and recorded no overlap, which costs nothing now that the
question is closed, and the scope is stated because this line has twice been read as the second
number. Each overlap arrived from a different direction; one reader
answers whichever question it read first. **W17's three are the clearest demonstration of that
yet** - the same three facts reached by six different routes, and in each case the two readers'
routes had nothing in common.

**The number to carry is the ABSOLUTE one: two readers produce 0-4 shared findings, whatever the
item's size** - **thirty-four** measurements, and P6's retro declares the question **settled and closed
to re-litigation**. **The twenty since — 2, 2, 2, 1, 4, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 4, 2, 0, 1 and 1 —
are all inside the band and the band has not moved.** **P13's three are 2, 2, 2, P14's are 2, 2, 1,
P15's are 2, 4, 2 and P16's are 0, 1, 1**, and its readers' SPLIT held in all three:
the conformity reader found claims that were false — twelve of its twenty-four blocking findings
across the plan were numbers — and the adequacy reader found bounds that were not there. **W41's 1 of 116 is the largest denominator ever recorded here and it did not
move the numerator**, which is the clearest single datum against reading the fraction. **The band read 1-4 over ten measurements until W31 came in at ZERO**, and P9's
retro corrected the number rather than the conclusion: a zero is what *"the second reader finds what
the first was not looking for"* predicts at its limit, and W31's pair produced **5 and 10 findings
with eight blocking between them**, the largest yield of P9's four items. **The caveat is recorded
with the number**: W31 gave both readers the same list of *claims the author was least sure of*, a
priming none of the thirteen earlier measurements had, and it is at least as likely to have driven
them apart as together. Their only shared SUBJECT was one register row, approached from opposite ends
and yielding two different corrections. The fraction is noise - it has read 8%, 17%, 10%, 12% and 15% across items ranging
from a one-line conformity fix to the largest surface change the repository has made. W12's Record
hypothesised that the fraction *rises* as items shrink; W13 is a much larger item at the same 17%,
so that died on its first test. Reporting the fraction invites exactly that kind of over-reading.

**The cost is roughly double, and the counter-evidence is on the record:** W1's and W3's single
readers ran mutation sweeps too - 85, 146 and 100 mutations - and found a great deal. What the split
buys is **marginal coverage rather than coverage**; the second reader finds what the first was not
looking for, which is what the overlap number measures. An author's own sweep is worth running and
substitutes for neither: W5's author ran 19 mutations and found 2 survivors, and its adequacy reader
ran 148 and found 38.

**Pass 3 - retro.** Once the plan's work items are merged, review the *method*, not the product:

1. **"No change" is an expected verdict.** A retro that always finds three improvements is
   measuring its own output.
2. **A new rule needs two occurrences, in different work items** - or one occurrence with a stated
   argument for why it generalizes.
3. **The sharpest finding is a rule that was followed and did not work.** A rule that was *broken*
   means someone was careless. A rule that was **followed** and failed anyway means the mechanism
   is wrong and needs replacing, not restating.
4. **A proposed rule states what it replaces.** This document is read in full before every work
   item. Deletions are as legitimate an output as additions.
5. **Name the rung.** For every defect the retro discusses, say which level of section 4 should
   have caught it - and if none would have, that is the finding.
6. **A retro may correct a false claim in the files of the items it reviews, and names which** -
   P11's retro. Once an item is done its file is on nobody's `Owns`, and a retro has neither an `Owns`
   nor a declaration in which to take an exception, so a false number in a finished Record had nowhere
   legal to be fixed. P11's retro corrected W39's headline saving; P10's retro recorded the same gap
   from the other direction - W35 needing an exception to correct a claim W34's Record made **about
   W35**, and W36 acting on that claim in the meantime because it stood. **That proposal stays parked
   at one occurrence**: it names *another item's Record*, this names *the items a retro reviews*, and
   the narrower of the two is the one taken.

## 7. Parallel work

1. **Work items are separated by a spec, never by intuition.** If two items agree only by
   convention, they are one item. The flow definition and the run-state shape in `spec/` are what
   let the definition validator and the driver be built by two agents who never see each other's
   work.
2. **If two CONCURRENT work items would edit the same file, they are one work item.** Merge cost
   exceeds the parallel saving every time. **A serial item pays none of that cost and the rule does
   not bind it** — it declares an **exceptions table** instead: every file it edits outside its
   `Owns` and outside section 1's record step, named, with the reason, before it starts. W4 took one
   exception and W5 took seven, and both were right to.

   **The declaration is checked, because three items running showed that declaring is not enough.**
   W5 edited one file it had not listed; **W6 declared its table empty and had edited two**, found by
   its conformity reader running `git show --stat`; and **W9 — the next item, with W6's warning
   already written down — undercounted by six**, including a new file in nobody's `Owns` and an edit
   into W6's `examples/l6.ts`. Three consecutive items answered *"did you edit outside your `Owns`"*
   with *"yes, and I did not notice."* A rule read in full before every item, followed and failing
   three times, is a mechanism problem: `git diff --name-only` against the `Owns` block is what
   settles it, and until that check exists **run it by hand before filling in the Record.**

   **An item's `Owns` is written from its PLAN's index row, never from its title** — P7's retro, and
   the numbers are the argument. W20's block gave it no file it was allowed to *test* in and it took
   **five** late exceptions; W21's named paths and still narrowed `src/driver/driver.ts` out of a
   block P7's own table had put it in — **four** late. W22 wrote its block from the plan row, kept
   that file for a different reason than the plan gave, and took **two**; W23 took the whole
   `examples/**` block the row gives it and took **none**, the first item of P7 to take zero.
   **Five, four, two, zero** — and `check-owns.mjs` stayed retired throughout.
3. **Fan out on execution, not on design.** Parallel agents given an under-specified goal produce
   designs that do not compose. Decide, then fan out. **Q1, Q2 and Q4 are the decisions this rule
   is about here** - fanning out before they land produces a driver, a definition format and a join
   that do not fit together.
4. **Keep the joint small.** An item's output to another item should be a typed value or a
   document, not a set of assumptions.

Anti-patterns: fanning out before the spec is agreed; accepting an implementer's self-report as
verification; reaching for a real scheduler when a level-2 routing assertion would answer the
question; a quick edit to `spec/` to make a test pass.

## 8. Speed

The loop has to be seconds or the discipline above stops being run.

| | Target | |
|---|---|---|
| Single test file (watch) | < 2 s | one runtime - whichever you are editing in |
| Work-item gate (L0-L3) | < 15 s | **one runtime.** The other two run at the join |
| Plan gate (L0-L6) | < 90 s | **L0-L5 in all three**, L6 per [Q33](open-questions.md) |
| **Proving the checks can fail** | **none has ever been set** | measured **365 s** of a **393 s** `npm run gate` ([ADR 0039](decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md)). **Not a rung**, and this table had no row for it until P11's retro |

**The three budgets above are MET and always have been, and the row beneath them is what a person
actually waits for.** Measured after ADR 0039: L0 is **7.9 s**, L1-L6 in three runtimes is **10.7 s**,
and the seven static checks are **9.5 s** — so *plan gate (L0-L6)* is **18.6 s**, a fifth of its own
budget, and 28.1 s with the checks included. What makes `npm run gate` 393 s is proving those checks
can fail, which is **not a level of section 4** and which this table did not budget, because before
[P8](plans/p8-what-can-be-deleted-with-the-gate-green.md) and
[P9](plans/p9-when-a-check-stops-checking-what-notices.md) it cost approximately nothing. **That, and
not a budget overrun, is the answer to *nobody decided this***: there was no row to be over.
*(ADR 0039 refused its candidate (a) partly on the ground that 516 s was **5.7x** the 90 s budget — a
comparison across this line, since 488.9 s of that 516 was self-test. The refusal survives on its
other grounds and the ADR is corrected in place.)*

**The three-runtime requirement lands on the plan gate, not on the edit loop**, and that split is
deliberate: L0-L5 are pure logic over fixtures, so the second and third pass find configuration
errors rather than logic errors, and configuration errors do not need to be caught in two seconds.
Running all three on every keystroke is how a budget gets blown and then abandoned.

A gate over budget gets a fast subset on every change and the full version at the join. A
verification step nobody waits for is a verification step nobody runs.

---

## What was adapted, and what the retro judged

Recorded so pass 3 could assess the changes specifically. The sibling's version is at
`../fyflow-react-components/doc/workflow.md`. **The verdict column is P1's** - the first plan to run
this document end to end - and the table stays for the next plan to re-judge rather than being
deleted now that it has been answered once.

| Change | What would show it was wrong | **P1's verdict** |
|---|---|---|
| Ladder rungs 1-5 rewritten | A defect class with no rung, found at L6 or by a human | **Right, and the failure prediction was wrong in an instructive way.** Five classes have no rung - and **every one was found by the conformity pass**, not at L6 and not by a person. The rungs are sound; what was mispredicted is who catches what falls between them |
| **L5 is a join/failure matrix**, not Storybook | The matrix is mostly "undefined" cells, meaning the spec was not ready | **Right.** All eighteen cells filled, hand-derived from `spec/` before running, and it is what produced [ADR 0003](decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) |
| **L2 is routing-from-a-fixture-log** | L2 needs a scheduler to run | **Right, and the cheapest thing in this document.** Four items used it; the fake scheduler is 22 lines in W3 and 30 in W5 |
| Section 3 gains a cross-repo id rule | Someone cites a bare Q id and the wrong repo is read | **Unproven.** No cross-repo citation occurred in P1. Kept; nothing was learned either way |
| Section 7 rule 3 names Q1/Q2/Q4 | Fan-out happens anyway and the pieces do not compose | **Right.** W2 and W3 ran in parallel against W1's spec and met at the definition and the log shape. The one place they did not compose - `Region` never produced in its declared shape - was caught by W3's own pass |
| No jsdom rule carried over | - | n/a |

**The adaptation this table does not list is the one that mattered most: the runtime axis in section
4.** W1 added it after the three-runtime requirement surfaced from outside every check in the
repository, and it is what found `RT-R9` - a construct all four typecheckers accept and Node refuses
to load. `RT-R1` read as ceremony and was not.

**And the adaptation P1 made to itself:** v0.3's four changes. The full retro, including the
findings it refused to turn into rules and why, is in
[P1's Record](plans/p1-what-satisfies-a-join.md).

**What P2 did to those four**, in one table, so the next plan judges v0.4's changes the same way:

| v0.3 change | What would show it was wrong | **P2's verdict** |
|---|---|---|
| TEMPLATE gains an **`Outputs`** table | every row reads "yes", making it a formality | **Right, for a reason P1 did not predict.** The load-bearing column is *"what would fail without it"*, not *Exists* - two of W6's rows could not answer it, and both were findings |
| **Pass 2 is two readers** | the overlap rises, meaning one would have done | **Right, and settled - stop re-litigating.** W4 1/13, W5 3/~35, W6 3/~25, W9 3/~30: flat at ~10%, and it has not risen with practice |
| **A new check is negative-tested at birth** | a check ships that cannot fail | **Right in aim, wrong in mechanism - amended (rule 7).** Followed twice, failed twice: a malformed probe indistinguishable from a caught one, and probes that were never committed |
| **Section 7 rule 2's exceptions table** | an item's exception list is wrong | **Wrong as written - replaced by a check.** Three consecutive items miscounted, the third with the warning already in this file |

**And what P3 did to v0.4's four**, judged by the first plan whose deliverable was a **document**:

| v0.4 change | What would show it was wrong | **P3's verdict** |
|---|---|---|
| **Rule 7's provocations are checked in** | a check ships that cannot fail, with its probes green | **Two of three requirements right; the third replaced.** *Checked in* is the strongest rule this repository has adopted - W9's five hand-run probes became twelve and **seven of the twelve holes were found by re-running them**. *Naming the check* was measured and does not discriminate: v0.5 |
| **`Owns` is checked rather than declared** | an item's file list is wrong again | **Unanswered - `check-owns.mjs` was not built.** P3 declared one item that did not need it and the by-hand substitute reported correctly. Third plan of asking; [P4](plans/p4-the-drivers-lifetime-and-the-handles-it-gives-out.md) has the files in flight to settle it |
| **Rule 8 - break the fix and watch the gate go red** | a fix ships that cannot fail, with the rule in force | **Not applied.** It was adopted *after* W9 shipped, so W9 is one of its three occurrences and not one of its outings. Its first use is v0.5's own change, which is one sample and the easiest possible case |
| **Section 1 rule 5 names `CLAUDE.md` and `README.md` as record-step files** | an item still miscounts its exceptions | **Right, on its first outing.** P3's retro touched exactly those four plus one declared file, and the by-hand `git diff --name-only` matched |

**The one thing five plans have observed and no rule names — and P5 finally names one SUB-case of
it.** `doc/` is upstream of every check here
and is checked by nothing - a false register entry (Q43), an index claiming reader-passes were
outstanding when they had run, a file header saying twelve at thirteen. P1's retro named it and
refused to make a rule; **P2's retro did the same, and said why**: both candidate mechanisms are
worse than the problem. It stays the thing most likely to bite next.

**P3 refused it a third time and found the class has changed shape.** `README.md` said *"24
validation refusals"* - the exact claim W9's conformity reader had corrected in `AGENTS.md`, which
the gate keeps true. **The gate carries nothing to the front door**, so a mechanically-true document
now sits beside four hand-maintained ones and they disagree with no way for a reader to tell which
is which. **Divergence is harder to notice than error**, and it arrives *because* one document is
checked. Still no rule, and still no mechanism worth its cost.

**P5 refused it a fifth time, and then noticed that one item in P1's original list had occurred
twice.** *"An index claiming reader-passes were outstanding when they had run"* is the second entry
in that first sentence, and it happened again — in **three** documents at once, about W16's readers,
for two commits. **What makes the second occurrence different is that it reproduced**: the agent
starting W17 read those indexes, believed them, and wrote the claim forward into a fourth document
before opening `doc/work-items/w16-*.md`, which had been correct throughout. So the fix is not a
check over `doc/` — it is a rule about **where a claim is read from**, and it is in section 1 rule 5.
**The rest of the class is refused for the fifth time on P2's reasoning**, unchanged: both candidate
mechanisms remain worse than the problem.

**And what P4 did to v0.5's one**, judged by the plan that ran it:

| v0.5 change | What would show it was wrong | **P4's verdict** |
|---|---|---|
| **Rule 7 (c): a probe declares the SET of checks it trips** | a malformed probe is still reported as caught, or the form fires on nothing | **Unexercised — P4 added no new check.** Carried to P5. What *did* fire, in the wild and for the first time, is rule 7 **(b)**: `check-docs-selftest`'s probe 11 is pinned to `driver.start('run-1', …)`, which W13 deleted, and it failed with *"the mutation matched nothing"* rather than passing for the wrong reason. **(b) is confirmed on a real API change; (c) is still a claim about a measurement** |


**And what P5 did to v0.6's three**, judged by the plan that ran three items and six reader passes:

| v0.6 change | What would show it was wrong | **P5's verdict** |
|---|---|---|
| **Rule 8's provocations are written to the RULE** | the readers still find the author's set narrow in the same direction | **Right, and NOT SUFFICIENT — amended rather than replaced, and P4's prediction is false.** The prediction was fewer reader survivors; the readers found **blocking** gaps in all three items. W15 and W16 found the rule-written set blind to what the item **created**, twice, which is section 6 pass 3 rule 2's bar on its own. **W17 is why the amendment stands anyway**: writing to both halves, its rule-written probes found the hole its deliverable-written probes structurally could not — a policy clause exercised in one direction only. **Neither half is redundant**, so rule 8 now asks for both |
| **The adequacy reader works in an isolated copy** | two readers contaminate one tree again | **Right in aim, FOLLOWED, and it cost a repository — one sentence added about the removal.** Nothing about the isolation was wrong; the rule stopped at *"work in a copy"* and said nothing about the obstacle that follows (dependencies that do not resolve there) or the operation that did the damage (`--force` following a link out of the tree). W17 ran the same procedure with no link at all and measured why: **zero symlinks, zero reparse points**. **The rule's silence, not the rule** |
| **Record-step list gains `doc/open-questions.md`; `check-owns.mjs` retired** | an item miscounts its `Owns` again | **Right, and INCOMPLETE by exactly the same word.** Five items have now audited their `Owns` **set** correctly. But `Reserves:` names **ADR ids too**, and `doc/decisions/` was in neither the list nor any `Owns` — so W16 took nine exceptions where the rule should have granted three, and **W17 could not correct a false sentence in ADR 0015 at all**. The list gains `doc/decisions/**`. `check-owns.mjs` **stays retired**: the one intervening failure was a stale *count* of a correct set |

**And what P6 did to v0.7's five**, judged by the plan that ran two items and four reader passes:

| v0.7 change | What would show it was wrong | **P6's verdict** |
|---|---|---|
| **Rule 8's set has TWO obligations** | the readers still find blocking gaps the two halves should have covered | **Right, EARNED, and still not sufficient - extended rather than replaced.** Fifth sample. Both halves did work no other half did: the rule-written probes found that L6 injected one **colon-free** id, so tier 0 could be narrowed by the shape of the id with all 370 assertions green; the `Outputs`-written probes found an output that is **unachievable** rather than unbuilt. **But neither found either of W19's two BLOCKING survivors**, and both of those were on a third axis - the **provenance** of a value. Rule 8 gains a third obligation |
| **Rule 8 defines *survivor* (reachability, second route)** | a vacuous probe is reported as a survivor again, or the definition fires on nothing | **Right, and its first real outing did exactly what it was written for.** W19 had **three** nominal survivors and the definition classified all three: one real (second route - the same edit turns `test/driver/lifetime.test.ts` red), one **vacuous** (`PAIR_ROW`'s derivation, which changes no observable because `DECLARED_TOTAL` already catches everything it would), and one a probe about an **assertion's strength** whose second route had to be measured (with it applied, a constant `runId` in `src/` survives). Without it that Record would have read *three survivors* where there was **one** |
| **Record-step list gains `doc/decisions/**`** | an item still cannot correct a decision its own work falsifies | **Right, and EXERCISED in the predicted direction on the first item that could hit it.** W19's demonstration falsified ADR 0027's producer table - it named three producers and could not name the shape W19 built on real workers - and **producer row 4 was added with no rule changed and no exception declared**. P5's retro adopted this *"so a demonstration could correct the decision it demonstrates"*; W19's own declaration named itself the likely next occurrence, and it was. **Second occurrence** |
| **A claim about another item's status is read from that item's own file** | an index is believed again and the claim reproduces | **Right, and it is now the standard a reader judges by** - which is a different kind of confirmation from a fresh occurrence. W18's conformity reader found **five indexes reading DONE over an item file reading `todo`** and reported it *as a breach of this clause*; before v0.7 there was nothing to cite. W19 read every status from item files and its readers found no instance. **Confirmed, one enforcement, no new occurrence** |
| **Section 6 says how to REMOVE an isolated copy** | a copy is removed with a link in it, or the rule blocks a pass it should not | **Unexercised in the dangerous direction, and followed twice.** W18 and W19 both measured **zero symlinks and zero reparse points** before making the copy, `cp -r node_modules` was inert both times, and both copies were scanned again and left in place rather than forced. Nothing had to be refused, which is the outcome the sentence exists to make possible rather than evidence about the sentence |

**And what P7 did to v0.8's two**, judged by the plan that ran four items and eight reader passes:

| v0.8 change | What would show it was wrong | **P7's verdict** |
|---|---|---|
| **Rule 8 gains a THIRD obligation: break the PROVENANCE** | the readers still find blocking gaps on a fourth axis, or the obligation fires on nothing | **Right, EARNED, and STILL NOT SUFFICIENT — extended twice.** Sixth sample. It fired in all four items and produced three more `examples/**` instances, bringing that directory to **eight**. **But it could not be instantiated from what it said**: [Q112](open-questions.md) corrected it **four times across three items**, three of those an author repeating a correction a reader had made to them one item earlier — including `x && y`, which changes no source at all, and a *fix* that recorded a value from the same local the reader's probe swaps. The axis was right; the procedure was missing, and is now in the rule. **And neither this obligation nor the two before it reaches a LOOP BOUND**, which is where both of P7's reader-found blocking survivors lived |
| **Rule 8's set is re-run AFTER acting, with the readers' edits checked in as probes** | an item acts on a review and ships a repair that could not fail, with the rule in force | **Right, and it fired in every one of the four.** W21: adding an `INDEX` test made `Number.isInteger` and `n < 0` unreachable — both caught before, one survived after. W22: a probe's anchor moved under the fixes and the rule 7 (b) guard aborted with *"MATCHED 0 TIMES"* rather than reporting a pass. W23: **the author's own fix for a blocking provenance finding did not work** — it recorded the value from the same local the probe swaps, so the reader's probe still cost 0 — **and only the re-run saw it**. Third and fourth occurrences of this rule's founding case landing inside this rule's own procedure. The readers' edits, checked in: **9 of 10 in W22 and 6 of 7 in W23 went from 0 failures to non-zero** |

**And what P9 did to v0.9's four**, judged by the plan that ran four items and eight reader passes:

| v0.9 change | What would show it was wrong | **P9's verdict** |
|---|---|---|
| **Rule 8's FOURTH obligation: break the LOOP BOUNDS** | the readers still find blocking gaps on a fifth axis, or the obligation fires on nothing | **Right — the highest-yield obligation in this document — and STILL NOT SUFFICIENT.** W30's adequacy reader: **twelve of seventeen** survivors were obligations (a) and (d), and **not one was reachable by a probe that breaks a VALUE**. W31's: three of five blocking findings are bounds. **The gap it leaves is the new requirement on the set**: W31's three `SELF` entries instantiate this obligation perfectly — one entry out, the whole list out — and **all three bounded an ABORT while naming a floor**, so the floor's own disjunct was deletable for 0 with all three passing. **Knowing which list to break is not knowing you broke it for that list's reason** |
| **Rule 8 states the PROCEDURE for a provenance probe** | an author instantiates it wrong again, or a reader corrects it a fifth time | **Right, and NOT corrected once in four items — the first rule-8 amendment since v0.7 to go a whole plan clean.** [Q112](open-questions.md) had corrected the axis **four times across three items** before the procedure was written into the rule. P9 ran provenance probes in all four items and every one changed a source expression and nothing else; the survivors survived as **findings** rather than as rewrites. **One sentence ended a class that four items could not** |
| **Section 1 rule 5's provenance clause extends to ANY copy** | an author believes a derived claim again, including their own | **Right, EXERCISED, and it is now the standard readers judge by — and it has a blind side, which is v0.10's change 3.** W30's conformity reader cited it against a stale cluster table; W31's against `CLAUDE.md` carrying an item's author-pass counts, and against two documents contradicting themselves inside one paragraph. **Every one of those is a READ.** The two it could not reach are the two where the author measured correctly and **wrote a scope they had not measured** |
| **Section 7 rule 2: `Owns` from the PLAN's index row** | an item's block is wrong again, or late exceptions rise | **Right, and the numbers hold at the floor.** P9's four items took **zero, zero, two, zero** late exceptions, and W30's two are the same pair P9's own declaration had to take — same two files, same reason: [Q142](open-questions.md)'s two-sided window obliges an item that **adds documents** to edit a file it does not own. **That is a plan's problem rather than a discipline one**, and it is the second plan running to hit it |

**And v0.5's one change, which P4 could not judge, is now exercised.** Rule 7 (c) fired for the first
time in three plans when W16 built `scripts/check-policies.mjs` for `JP-R9`: ten checked-in probes,
nine tripping exactly one check and the tenth declaring a structural cascade, and **three of the ten
failed at birth** — two were holes in the check and one was a probe that edited a heading the parser
does not read. **The form discriminated**: probe 4 tripped the *empty set*, which the weaker
*"the named check is among those that failed"* also rejects, but only by accident. **P5 reports it
exercised, and the sample is one.** The set has since grown to thirteen with a `MIN_PROBES` floor,
after W16's adequacy reader found `caught === PROBES.length` vacuously true at zero — which is rule
7 (a) and this document's *"a probe that ran once is a claim about the past"*, one level in.
