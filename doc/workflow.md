# Workflow

**Status:** v0.11 - **run to completion TEN times**, by [P1](plans/p1-what-satisfies-a-join.md),
[P2](plans/p2-the-non-success-half-on-a-real-scheduler.md),
[P3](plans/p3-a-consumer-reference-the-gate-keeps-true.md),
[P4](plans/p4-the-drivers-lifetime-and-the-handles-it-gives-out.md),
[P5](plans/p5-a-third-and-fourth-policy-or-repairs-of-the-first-two.md),
[P6](plans/p6-what-may-share-a-scheduler-with-a-driver.md),
[P7](plans/p7-is-a-join-transitive-over-nested-fan-out.md),
[P8](plans/p8-what-can-be-deleted-with-the-gate-green.md),
[P9](plans/p9-when-a-check-stops-checking-what-notices.md) and
[P10](plans/p10-is-fan-out-one-feature-or-two.md)
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
you already have checks your reasoning; a prediction about a mechanism's reach checks the mechanism,
and only the second can reverse.*

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

   **This rule has grown to five obligations, three requirements on the set and one on the harness,
   so it carries its own index.** P6's retro asked whether a fourth obligation should make it a section; P9's retro answered
   **no**, because *"section 5 rule 8"* is cited in this document, four plans, eleven work items and
   the register, and section 3's *ids are never renumbered* is the same argument one level out. It is
   indexed instead:

   | | obligation | added by |
   |---|---|---|
   | **(a)** | break the rule's own CLAUSES | v0.6, P4's retro |
   | **(b)** | break every row of the `Outputs` table | v0.7, P5's retro |
   | **(c)** | break the PROVENANCE of every value an assertion reads — change the source expression and nothing else | v0.8, P6's retro; procedure added v0.9 |
   | **(d)** | break the LOOP BOUNDS — one entry out, the whole list out, and does anything COUNT it from elsewhere | v0.9, P7's retro |
   | **(e)** | break the WIRING — what happens when the check is NOT RUN | **v0.10, P9's retro** |
   | | **and on the set as a whole:** | |
   | | a survivor is one only once a **second independent route** confirms the clause was reachable | v0.7, P5's retro |
   | | re-run the whole set **after** acting on the readers, with their exact edits checked back in | v0.8, P6's retro |
   | | a provocation is evidence only when it **fires**, and only when it fires **for the reason it names** | v0.10, P9's retro |
   | | **and on the HARNESS that applies the break:** | |
   | | it carries a **control** — a probe that changes nothing comes back clean — and the **restore is asserted**, bytes compared back rather than assumed | **v0.11, P10's retro** |

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

**Why two readers rather than one asking both questions**, which is what earlier versions said.
Measured over **fourteen** items now: W4 1 of 13, W5 3 of ~35, W6 3 of ~25, W9 3 of ~30, W12 3 of 18,
W13 4 of 24, W14 4 of ~26, W17 3 of ~31, W18 2, W19 4 of 18, **W28 4, W29 1, W30 2, W31 0**. Each overlap arrived from a different direction; one reader
answers whichever question it read first. **W17's three are the clearest demonstration of that
yet** - the same three facts reached by six different routes, and in each case the two readers'
routes had nothing in common.

**The number to carry is the ABSOLUTE one: two readers produce 0-4 shared findings, whatever the
item's size** - **fourteen** measurements, and P6's retro declares the question **settled and closed
to re-litigation**. **The band read 1-4 over ten measurements until W31 came in at ZERO**, and P9's
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
