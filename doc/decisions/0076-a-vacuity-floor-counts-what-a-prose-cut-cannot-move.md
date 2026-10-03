# ADR 0076 — A vacuity floor counts what the churn it guards against cannot move, and the always-read set has a ceiling that only goes down

**Status:** accepted
**Date:** 2026-10-03
**Item:** [W112](../work-items/w112-the-budget-the-check-and-the-floors.md)
**Supersedes:** nothing. **Amends:** what `check-markdown`'s `M4` takes as its subject, and adds
`check:budget` as the gate chain's sixteenth entry.

## Context

[P27](../plans/p27-what-a-register-row-is.md) cuts four documents by about 97% between them, and
decision 3 of that plan says the floors in `check-markdown.mjs` must be re-pointed first, because
*"they are high-water marks … so a 23% prose cut turns `M4` red on correct work."* W112's whole job
is to make that true before W113 can discover it as a red gate.

**The ratchet surface is one check, and that was measured rather than assumed.** Every numeric
comparison in all nineteen check scripts was enumerated — inline literals and comparisons against
named constants separately, because `count < 142` and `count < RUN_FLOOR` do not match one pattern —
and then the question that decides the hazard: which clauses READ a document P27 cuts?
`doc/open-questions.md` is read by **no check in code**; `doc/workflow.md` appears only inside
failure-message strings; `doc/README.md`'s only hit is `doc/decisions/README.md`, a different file.
`check-docs`' `X11` touches `doc/decisions/` alone. **`check-markdown` is the whole of it.** Every
candidate P27's prediction 2 names — `RUN_FLOOR`, `README_SNIPPET_FLOOR`, `X10`'s L6 figures, `X7`'s
cross-document counts, `C4`, `C8`, `X9` — reads `AGENTS.md`, `README.md`, `spec/`, `examples/` or a
manifest, and not one reads a cut document.

*(**This item's own decision 4 makes that sentence stale**, which W112's conformity reader found and
re-derived the census independently to confirm: `check-budget.mjs` now `statSync`es `CLAUDE.md` and
`doc/workflow.md`, two of the four cut documents. The CONCLUSION survives and the reason is
structural — a ceiling only gets greener as a document shrinks, so no cut can turn `check:budget`
red — but the claim is now *`check-markdown` is the only check a cut can turn RED*, which is what it
was always for. The census stands otherwise: `check-markdown` over all of `doc/`, `X11` over
`doc/decisions/`, `check-budget` over two members of the always-read set, `doc/workflow.md`'s other
hits failure-message strings in `check-scheduler.mjs` and `check-source.mjs`, and
`doc/open-questions.md` read by no check in code.)*

**And a floor here is a TWO-SIDED window, which `check-markdown.mjs` already says and P27 decision 3
unknowingly restates the struck half of.** A floor must sit above its `removes` probe's fixture — or
the probe stops firing it and rule 7 (c)'s declared set reports `wanted [M1,M3,M4], got [M1,M3]` —
and below the whole tree, or the check itself fails. That file carries the correction in place:
*"THAT PARAGRAPH IS FALSE and P9's declaration step falsified it … a floor is one-sided for the CHECK
and two-sided for the PROBE."* Decision 3's *"enough links to check, not more than last time"* is
right about the check and silent about the probes, which is the same half the struck paragraph got
wrong.

**Measured at W112's declaration step**, on a scratch `git archive` copy of `HEAD` and on a simulated
post-cut tree built by applying P27's own cuts — the register reduced to 418 one-line rows with its
74-line preamble accretion log gone, `CLAUDE.md` minus its `Current state` block, `doc/workflow.md`
minus the version blocks, `doc/README.md` minus its long status paragraphs:

| | whole tree | − `doc/decisions` | − `decisions` + `plans` |
|---|---|---|---|
| **files**, today | 181 | 136 | 108 |
| **files**, post-cut | **181** | **136** | **108** |
| **links**, today | 8052 | 7418 | 5969 |
| **links**, post-cut | **5496** | **4862** | **3413** |
| **anchored**, today | 473 | 473 | 455 |
| **anchored**, post-cut | **28** | **28** | **15** |

**`M4`'s window is `(5969, 7418]` today and `(3413, 4862]` after the cut. The two are DISJOINT.** No
literal is valid both before and after, and deeper fixtures (minus `doc/work-items`, minus the three
big directories) and `distinct (source, target) pairs` were all measured and stay disjoint. *So P27
decision 3 is not implementable as a value change, and that is prediction 2's own reversal condition
arriving at the item asked to find it.*

## Decision

1. **A vacuity floor counts a quantity that the churn it guards against cannot move.** `M4`'s own
   failure message states its job — *"`M1` is vacuous below that"* — and what makes `M1` non-vacuous
   is **how much of the corpus it resolved links FROM**, not how many repeated citations it walked. A
   prose cut removes citations; it does not remove documents. So **`M4` counts the documents the walk
   resolved at least one relative link from**, and `6225 -> 120` is a RE-POINTING rather than a
   retune:

   | | whole tree | − `doc/decisions` | − `decisions` + `plans` | `M4`'s window |
   |---|---|---|---|---|
   | today | 176 | 134 | 107 | `(107, 134]` |
   | post-cut | 175 | 133 | 106 | `(106, 133]` |

   120 is near the middle of the shared window `(107, 133]`, which is
   [W80](../work-items/w80-what-a-run-time-result-check-is.md)'s rule for a two-sided one. The
   one-document drift (176 → 175) is a document losing its LAST link, which is signal rather than
   noise.

   **And this decision's CONTENT had no observer anywhere, which W112's adequacy reader measured and
   `M6` is the repair.** The first cut said *every existing probe, fixture and declared set is
   unchanged, which is the test that this is a re-pointing and not a weakening* — and **that is
   precisely why nothing could see it.** Re-sourcing `sources: sources.size` to `sources:
   files.length` cost **ZERO**: `check:markdown` EXIT 0, both `removes` probes `caught`, the
   self-test EXIT 0 at 37/37 and 37/37. The reader then built its own post-cut tree and measured that
   **the post-cut tree cannot discriminate either** — `174/131/104` against `183/137/109`, identical
   verdict sets — so the item's claim that the post-cut copy is *"the only thing that tests `M4`'s
   re-pointing rather than its value"* was false: that measurement tests the VALUE, and nothing
   tested the quantity.

   The mechanism is arithmetic: on all three fixtures `files` and `sources` differ by at most FIVE
   (183/178, 137/135, 109/108) while the floor sits twelve or more from the nearer, so **no fixture
   can separate them**, and `M4` was a duplicate of `M3` at a lower floor.

   **`M6` is the observer, and it is a RELATION over the derivation rather than another count** —
   *the walk resolves links from strictly fewer documents than it scans.* Under the substitution the
   two are equal by construction, so it fires **on the real tree with no probe at all**, which is
   v0.22's test for a control: you can name the tree on which it fails while `M4` still passes. It
   takes a NEW ID rather than a second clause under `M4`, because rule 7 (c) compares the SET of ids
   and W25's adequacy reader measured what sharing one costs. Its durability is measured: the gap is
   **5** today and **6** post-cut, and three of the five are `TEMPLATE.md` files, which carry no link
   by their nature. *Obligation (c)'s LIMIT reached from the other end — a clause with one observer,
   re-sourced, is indistinguishable from the thing it replaced.*

   **This is [ADR 0073](0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md) decision
   4's criterion, and it is the only one this repository accepts for lowering a ratchet**: that
   decision took `README_SNIPPET_FLOOR` from 8 to 3 and said it is legitimate *"only because decision
   1 changes what the floor COUNTS"*. [Q102](../open-questions.md) is the row this answers, at
   whole-repository scale.

2. **`M3` is measured and NOT moved — AGAINST A PROSE CUT, which is the only churn this decision
   scopes it to.** A prose cut deletes no document — P27 decision 2 archives nothing to a file — so
   the file count is **181 before and after** and `M3`'s window `(136, 181]` does not move at all.
   Lowering it below 136 would *silence* the `doc/decisions removed` probe, so the plan's instruction
   to re-point it would have made the check worse. *A floor whose quantity the churn cannot move
   needs no re-pointing, which is decision 1 read in the other direction.*

   **The scope matters and the first cut did not state it — W112's adequacy reader.** Document
   ADDITION is a different churn, and it is the one `M3` and `M4` have actually fired on: every
   [Q142](../open-questions.md) firing in this repository's history is a `removes` fixture rising
   past a floor. Measured by adding link-bearing documents under `doc/work-items/`:

   | item documents added | probe 1's `files` | `M3` fires? |
   |---|---|---|
   | 0 | 137 | yes |
   | 3 (W113, W114, W115) | 140 | yes |
   | **5** | **142** | **NO** — `wanted [M1,M3], got [M1]` |

   So `M3`'s margin on the tree W112 ships is **5 documents**, and P27's three remaining item
   documents take it to 2. **It is not retuned here, deliberately**, on W80's rule — *a ratchet moved
   before it fires is a ratchet moved for no reason* — and the arithmetic is recorded so that whoever
   crosses it pays a predicted retune rather than a surprise. *(This also corrects what P26's retro
   predicted: that it *"fires at P27's FOURTH item document"*, from figures measured two too high in
   both columns. At the true margin it does not fire during P27 at all.)*

   **The same reading applies to the new `M4` and is the honest cost of decision 1**: its window is
   `(108, 135]` on the shipped tree, and the lower edge rises by one per link-bearing document
   outside `doc/decisions` and `doc/plans` — so **12 documents of headroom**, against the link-based
   floor's 244 links ≈ 9. Comparable, slightly better, and far narrower in raw width than the
   thousands the link window had. The reader's framing — that decision 1 moves `M4` *onto* the churn
   that has moved it historically — is right about the WIDTH and the headroom is what the probe
   actually spends, which is why the two differ.

3. **`M5` keeps its floor and its probe, because it CANNOT be re-pointed yet — and the obligation
   W113 inherits is measured rather than discovered.** **440 of the corpus's 473 anchored links are
   `doc/open-questions.md`'s own `](#live)` and `](#resolved)` self-links, and they resolve to
   exactly TWO distinct anchors** — **290 in the row bodies and 150 in the preamble.** *(The first
   cut wrote 301 for the rows, which does not sum to 440, and W112's conformity reader found why: 301
   is the RAW count and 290 is the count after `blankCode`, which is what the check sees — eleven of
   those self-anchors sit inside code spans. Two measurement methods, one addition.)* So 473 is 24 distinct
   anchors wearing a large number's clothes, and **W113 deletes the subject of `M5`'s only probe**,
   which is [ADR 0073](0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md) consequence
   2's shape (*removing a subject removed its probes*) arriving one item early. Post-cut the probe
   strips nothing and the whole tree stays at 28: the probe needs `28 < floor` and the check needs
   `28 >= floor`, which no value satisfies.

   Four alternatives were measured and all four fail — distinct anchors move by 2 when the register
   is emptied; documents-carrying-an-anchor puts the floor at ≤ **2** today and ≤ **1** post-cut;
   re-pointing the probe at `doc/scheduler-upstream.md` leaves 458 of 473 today; giving probe 2 `M5`
   needs `floor > 455` today and `≤ 28` after. **So the numbers go to W113's `Inputs` instead**:
   post-cut the corpus carries **28 anchored links over 7 documents**, the largest holder is
   `doc/scheduler-upstream.md` at **15 anchored / 10 distinct**, and `M5`'s floor lands in
   **`(13, 15]`** with its probe re-pointed there. *That is what an item which cuts nothing is for —
   the floor W113 would have met as a red gate is a declared line in its own file.*

   *(**That window is EMPTY on the tree the cut produced, and the FOURTH alternative above is what
   W113 TOOK** —
   [ADR 0078](0078-a-vacuity-floors-window-is-a-property-of-the-probe-suite.md). Re-measured there,
   in a staged copy with a control: **35** anchored whole-tree, **17** after `−decisions−plans` and
   **20** after stripping upstream, so while probe 2 must stay quiet the window is `(20, 17]` — and
   the same arithmetic empties it for every quantity and both subjects, which is why re-pointing
   what `M5` COUNTS the way decision 1 re-pointed `M4` would not have helped either. The figures
   here were taken at `9906c35`, before this item's own document edits. **The refusal of alternative
   4 was sound on the PRE-cut tree** — it needed `floor > 455` then — and *a refused alternative is
   re-priced by the item that changes the tree it was priced on*. With probe 2 declaring `M5` the
   window is `(20, 35]` and the floor is **28**.)*

   **And W113 inherits a SECOND dead probe, which W112's conformity reader found and this decision
   first named only `M5`'s**: `check-markdown-selftest.mjs`'s `M2` probe on `doc/open-questions.md`
   mutates `](#live)`, and its own comment calls it the only probe for the same-file-anchor form —
   *the form `C5`'s pattern could not match*. The register carries zero anchors post-cut, so that
   mutation matches nothing and rule 7 (b) takes the sole observer of that `M2` arm with it. More
   broadly that reader counted **30 probes in that file anchored on link text inside documents P27
   cuts** (`](workflow.md)`, `](open-questions.md)`, `](AGENTS.md)` and so on). **The census this
   decision's Context describes enumerated NUMERIC COMPARISONS and cannot reach that class at all** —
   it is P27 prediction 2's *fourth counting ratchet nobody enumerated* in a shape that is not a
   count, and it is handed to W113 as an obligation rather than closed here.

   *(Three of that reader's figures in this area were wrong and are NOT adopted, because one
   mechanism explains all three: `anchored++` sits behind `if (!isMarkdownFile(abs)) continue;`, so an
   anchored link stops being counted when its TARGET is removed and not only when the link is. The
   reader counted the 12 anchored links living IN `doc/plans` and reported `473 − 12 = 461`; the
   shipped check reports **455**, because 6 more point INTO that directory from elsewhere —
   `doc/workflow.md`'s five anchors are all `](plans/p2N-….md#retro)`. Re-measured by running the
   check at `9906c35`: `473 / 473 / 455`. So its claim that *"with the true 461 a valid floor does
   exist today"* is false and this decision's impossibility stands as written. The same error
   produced its `4 today / 2 post-cut` for documents-carrying-an-anchor (**2 / 1**) and its
   `(13, 16]` for W113's window (**`(13, 15]`**).)*

4. **The always-read set is a declared LIST of three documents with a CEILING that only ever moves
   down, and `check:budget` is the gate chain's sixteenth entry** — P27 stop-and-ask (c), answered
   YES by the maintainer. The ceiling is where the set is today; the target is P27 decision 1's
   budget; each cut item lowers the ceiling to its own post-cut measurement and W115 lands it on
   target. **W112 cuts nothing, so a check enforcing the target would be red by 11x on correct
   work**, which is why stop-and-ask (c)'s own answer says what it does: it *"refuses a commit that
   grows the required reading."*

   | | measured | ceiling | target |
   |---|---|---|---|
   | `CLAUDE.md` | 569,698 | 586,000 | 25,600 |
   | `doc/workflow.md` | 304,465 | 310,000 | 35,840 |
   | `doc/concept.md` | 17,125 | 20,000 | 17,408 — already met |
   | **total** | **891,288** | **907,590** | **78,848** |

   **In BYTES, and that is a correction rather than a style**: P27's own decision-1 table reads
   *876 KB* for a set measuring 891,288 bytes, because it added a KiB figure for `CLAUDE.md` to a KB
   figure for `doc/workflow.md`. A budget stated in a unit nobody fixed is two budgets.

   **The total is STRICTLY BELOW the per-file ceilings' sum**, and the allowance — 16,302 bytes, for
   this item's own record-step paragraph — is granted ONCE to the set rather than three times, so the
   set cannot grow by three allowances while every member stays inside its own.

5. **A ceiling's vacuity is *nothing to measure*, not *too little to check*, so the guard is a
   membership rather than a floor on the quantity.** A floor passes when there is too little to
   check; a ceiling passes when there is NOTHING — an emptied list, or a member renamed on disk,
   makes every other clause true of nothing and the check prints `All checks passed`. So `B1` refuses
   both, `MIN_MEMBERS` is 3 because P27 decision 1 decides the membership, and **the one way this
   check can be made worthless without a clause going red is a ceiling DERIVED from the size it
   bounds** — which no tree and no mutation can provoke, and which is therefore bound by a
   source-text clause asserting every ceiling is an integer literal. That is the cheap road
   [ADR 0073](0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md) consequence 10 names.

   **And the distance to target is PRINTED on every run.** A ceiling that nobody lowers goes stale
   toward WEAKNESS — the opposite direction from [Q102](../open-questions.md)'s floors, which go
   stale toward strictness and fail loudly — so the only thing that makes the drift visible is a
   reader seeing it.

## Consequences

1. **`check:markdown`'s report gains the `sources` figure — `N documents, N relative links in N of
   them, N links anchored` — and this consequence does NOT state those numbers.** `sources` is
   printed because `M4` reads it, and *a value computed and never read* is the defect ADR 0073
   consequence 5 spent three cuts on; the printing itself was a value nobody read until consequence
   13 below.

   **The numbers are left out on purpose, and the reason is this plan's own decision 4** — *a fact
   the tree COMPUTES is not written down* — which this consequence had to learn twice. Its first cut
   read `181 / 8058 / 177 / 473`; **both readers found it**, and W112's conformity reader enumerated
   every reachable state of the tree to show that **the quadruple co-occurs on none of them**: 181
   never pairs with 177, 8058 appears nowhere, and `anchored` was 474 everywhere. It had been
   assembled from readings taken at four different moments. The second cut quoted the corrected
   `183 / 8079 / 178 / 474` — and **the item's own document edits made that stale before its
   confirming gate ran**, at `8094 / 477`. *A number that changes when you write about it cannot be
   written down correctly, which is why P27 is removing 251 copies of five such figures and why this
   ADR is not allowed to add one.* The figure a reader wants is in the check's own output, and the
   item's Record carries the snapshot taken last.

2. **`M5`'s META entry was the LAST of the three still pinned to its literal, and W112 found it
   before it fired.** `M4`'s was made anchor-agnostic at W33 and `M3`'s at W42, both under the same
   sentence — *a mutation pinned to a magic number is unmutatable the moment the number is right to
   change* — and `M5`'s was left behind for nine retunes. Decision 3 moves that floor at W113, which
   would have made the entry report *"the mutation matched nothing"* and graded a live floor as
   unmutatable. Third instance of one defect. `M4`'s own entry is now agnostic about the FIELD too,
   because this decision moves `r.links` to `r.sources` and agnostic-about-the-NUMBER would not have
   survived it.

3. **FIVE clauses fired by name on the new gate entry, which is the binding working — and the fifth
   is the one this consequence claimed the set was complete without.** `S12` refused `check:budget`
   until `GATE_CHAIN` declared it. `G6` refused the digest walk's `dev-dist` skip until it was
   declared in `SHARED_SCRATCH`, and then **refused the leak-watching clause added for consequence 11
   on the very next run** — [Q178](../open-questions.md)'s shape, which `check-wiring.mjs` has
   recorded twice about itself. `S11` did not fire, correctly, because the entry is in the chain, and
   `G3` fires twice if the manifest entries go. `run-selftests.mjs` derives its nine entries from the
   manifest, so `check:budget:selftest` arrived with no edit and `G4` stayed green.

   **The fifth is `check-wiring-selftest.mjs`'s `CHECKS` both-ways comparison** — *a check added to
   the gate and not to this list is a check nothing here probes* — and it is worse than one red
   clause: that clause does `return done(1)`, so **the lane exits in 1.3 s against a 228 s wall**,
   and the control, all `G1`-`G6` probes, the `META` pass and the `SELF` pass never run. Since
   `G1_PROBES = CHECKS.map(...)`, `check-budget.mjs` also had no `G1` probe, and **the widened
   `stray()` of consequence 9 shipped with zero probes executed against it** while the item's
   Verification table declared that rung. *Both readers found it independently, and the first cut of
   this consequence enumerated four bindings as complete while the fifth was red.*

   With `'budget'` added, that lane runs whole: **42 probes, 42/42 caught, 14/14 graded, control
   green** — and its two `SELF` entries, both pinned to the `CHECKS` literal, went stale and were
   re-anchored on its shape, which is `check-markdown`'s *a mutation pinned to a magic number is
   unmutatable the moment the number is right to change* with a magic LIST in place of a number.
   **The cost is recorded rather than defended, and the first figure quoted for it was taken from
   the FAILING run.** That lane is ADR 0072's 228 s; W112's adequacy reader measured **717 s** alone
   with the ninth check in `CHECKS`, and the item's own confirming `gate:full` measured **1141.7 s**
   concurrent. *(This sentence first cited 526.9 s as the concurrent figure — which is what the lane
   took when it **exited at its first bound**, so it was the cost of not running. A duration read off
   a red lane is a measurement of the failure.)* **Adding a check to the gate multiplies the lane that
   proves the gate's dispatch by five**, because `CHECKS` drives `G1_PROBES` and two more probe
   families; `gate:full` as a whole went **995 s → 1959 s**, and `check:budget:selftest` itself
   **58.7 s → 192.7 s** once it hashed content and grew four clauses. Nothing here argues that is
   cheap.

4. **`check:budget` sits LAST of the checks, and the reason is a limit of ADR 0039's ordering rule
   rather than its cost.** Cheapest-first exists so a failure arrives early; this check cannot fail
   for a reason another clause would have caught, because it measures bytes no other clause reads.
   *A cheapest-first rule over entries that can substitute for each other says nothing about an entry
   that can substitute for none of them.*

   *(The first cut said *"despite being the cheapest"* and `check-source.mjs`'s comment said
   `~0.1 s, cheaper than check:scheduler's 0.09 by a hair` — which is not cheaper, and W112's
   conformity reader measured three runs each: `check:budget` **351 / 369 / 501 ms**,
   `check:scheduler` **441 / 460 / 531**, `check:policies` **372 / 446**. They are
   indistinguishable, with the within-check spread larger than the between-check difference, which is
   [Q179](../open-questions.md)'s band. **The premise is withdrawn and the argument is untouched**:
   the ordering holds on what this check can substitute for, not on what it costs.)*

5. **The self-test found seven defects in itself, and SEVEN of them are one shape with the polarity
   the wrong way round.** *(This read *five* while its own next sentence, its own enumeration, the
   harness's own comment and [Q462](../open-questions.md) all said seven — W112's conformity reader.)* Written as *remove the grader clause*, seven entries came back **exited 0:
   the mutation costs nothing — correctly**: a weakened grader on a tree where every probe passes has
   nothing to be wrong about, so removing it costs exactly nothing and the entry measures the absence
   of a case rather than the presence of a guard. Each plants the case instead — a probe declaring the
   wrong id with the right count, a staging that changes nothing, a non-inert META mutation, a control
   made to trip, a grader control with the wrong expected verdict, a reason the check never prints, a
   `SET` member the file does not expect — so the child is RED today and goes GREEN the day someone
   removes the guard. *What a `SELF` list buys nothing against is a weakening whose case does not
   exist, and the counter-measure is to supply the case.*
   [W31](../work-items/w31-the-self-list-check-policies-never-had.md)'s compound device, in the other
   direction.

6. **Two more the harness found about itself, and both were invisible in a verdict.** A mutated copy
   of the check written into the per-process scratch directory computed `ROOT` as `dev-dist/` — it
   then looked for `dev-dist/CLAUDE.md`, `B1` fired on every one of them, and the first run read
   **three probes against-declaration and nine META mutants graded `corpus`**, nine of eleven clauses
   ungraded with nothing saying which. *That is why every other self-test here writes its mutants
   FLAT into `dev-dist/`* — a convention three files follow and none explains. And **a `SELF` entry's
   own replacement string was its own anchor**: a pattern for `const SOURCE = [` … `\n];` matched
   `'const SOURCE = [];'` inside the entry that performs the replacement, which being last in the
   list is followed immediately by the array's own closing bracket, so the mutation deleted 25 bytes
   of its own declaration and the child died of a syntax error. **A probe whose replacement text is
   also its anchor mutates itself**, which is `check-markdown`'s *a comment that quotes the code it
   explains makes that code unmutatable* one step worse: here the quotation was the repair.

7. **The grader's own two controls were both graded WRONG on their first outing**, which is v0.24's
   clause earning itself on this item: the CRASH control read `did-not-run`, because a check that
   throws before its banner satisfies both descriptions and the first cut tested `did-not-run` first;
   and the WRONG-REASON control read `against-declaration` — **which was right**, because the control
   fired `B1` while declaring `B2`, and a mismatched id set is a different defect from a right id
   reached for a wrong reason. A control that conflates them grades nothing. It trips `B2` as declared
   now and names a reason the check never prints.

8. **The `exit-zero` verdict exists because a META entry found that the grader did not read the exit
   code.** Grading on the FAIL lines alone is right for telling a detection from a crash and is not
   sufficient for *refused*: with `process.exit(1)` removed the lines still print and every id still
   matches, so *the non-zero exit removed* read STILL CAUGHT. Section 4's two directions, inside a
   harness, three sentences after quoting them.

9. **`stray()`'s glob is widened from `check-*.mjs` to every `.mjs`** — [Q459](../open-questions.md),
   handed to P27's declaration by P26's retro. W105's conformity reader recorded the gap and judged
   it harmless on the ground that *`G3` reads `check-*.mjs` too*, which is true of `G3` and false of
   the CONTROL: W108's six `w108-*.mjs` modules killed that lane at 3.1 s against a 228 s wall and
   this reading could not name one of them.

10. **Decision 5's one guard matched NOTHING and reported itself satisfied, which is the worst
    defect in the item.** W112's adequacy reader rewrote all three ceilings as
    `statSync(join(ROOT, 'CLAUDE.md')).size + 16_302` and measured `check:budget` EXIT 0,
    `check:budget:selftest` EXIT 0 and **`source: 5/5 bound(s) held`** — every ceiling now tracking
    the file it bounds, so `B2` and `B3` can never fire however much `CLAUDE.md` grows. Two faults in
    one expression: `[^,]+` **cannot span the comma** the derivation carries, so it matched 0 of 3;
    and **a zero-match read as *no bad entries***, because the loop collected offenders and never
    asked whether it had found its subject. Both closed — the pattern spans to the end of the line,
    and the count of ceilings found is asserted against `SET`'s own membership. *A grep that cannot
    say it found the artefact has none of the authority W30 credits an artefact-derived bound with.*

11. **Five more things the harness claimed and could not see, all found by the same reader, and two
    of them are the harness's own instruments.** `check:budget` measured CHARACTERS rather than bytes
    for free, because every staged file was filled with `.` so bytes and characters were equal **by
    construction** — the stagings carry a 16-character multi-byte prefix now. The CRASH
    discriminator lost its exit-code half **with both grader controls still reading *as declared***,
    which is the brief's own question answered against the harness — two more controls now cover
    `against-declaration` and `did-not-run`, the latter having been an arm with no case at all. The
    `GRADER_CONTROLS` list had no floor and no membership; `MIN_META` and `MIN_SELF` each sat one
    below their lists, and the free `SELF` slot **compounded** with `MAX_CORPUS = 99`. And **the
    content digest hashed only the path and the size**, so it could not see a same-size edit anywhere
    while its docstring called it a content digest — it reads the bytes now, bound by a `SOURCE`
    clause, because a digest's own sensitivity cannot be observed from inside the run that takes it.

12. **The scratch cleanup had no observer, and the digest could not be it.** Both `process.on('exit')`
    handlers were deletable for zero with `digest … (unmoved)` printed beside the leak, because the
    digest walk skips `dev-dist` by design: one run without them leaves **15 directories (~8.7 MB)
    and 40 mutant modules**. A clause now names this run's own residue by its pid — **and it caught a
    real leak on its first run**, five `declare` and grader mutants that only the exit handler
    removed, which is the live window consequence 6 is about. *Its limit is stated: the exit handlers
    are backstops for the throw path, and nothing inside the function can observe a handler that runs
    after it returns.*

13. **The printed figures were values nobody read, including the one this decision names as its only
    mitigation.** Deleting the `note:` distance-to-target line cost zero — and decision 5 says a
    ceiling's drift toward weakness is visible *only* because that line prints. A `SOURCE` clause
    holds the table's columns and the note now. The same reader deleted `in ${r.sources} of them`
    from `check:markdown`'s banner for zero; `M6` is what makes `sources` load-bearing, and the
    banner is a reading aid rather than the observer.

14. **What is NOT fixed.** `markdownIn` throws `ENOENT` on a missing directory, found while building
    the window fixtures; no probe removes `doc/` or `spec/` whole, so it is unreached rather than
    latent-and-live ([Q460](../open-questions.md)). Decision 4's ceiling is a literal each cut item
    must lower, which is [Q102](../open-questions.md)'s shape in the ceiling direction — a number
    whose staleness permits rather than refuses, and **nothing enforces that it only moves DOWN**;
    the mitigation is consequence 13's printed distance and nothing more
    ([Q461](../open-questions.md)). **`stray()`'s widened glob is narrowable straight back for
    zero**, because it has one call site inside the control's already-failing branch and is therefore
    never evaluated on a correct tree — measured in both directions, and recorded rather than guarded
    ([Q464](../open-questions.md)). And **the always-read set is three paths bound only to three more
    paths in the self-test**, with no authority in any document: a commit adding a FOURTH always-read
    document is invisible to `B1`-`B4`. **The fourth document this named is no longer one**:
    [W113](../work-items/w113-the-register-is-a-reference.md) withdrew the instruction that
    `doc/open-questions.md` is read before every work item, in that file's own preamble, in
    `CLAUDE.md` at both sites that asserted it and in `doc/README.md`
    ([P27](../plans/p27-what-a-register-row-is.md) decision 1) — so the ~71 KB this budget does not
    count is a reference nobody is told to read. **The MEMBERSHIP half of
    [Q465](../open-questions.md) stands**: `B1`-`B4` still bind three paths to three more paths in a
    self-test, with no authority in any document, so a FIFTH always-read document would be invisible
    to them for exactly the same reason.

15. **Two of this item's own measurements were contaminated and both are recorded rather than
    explained away.** The item's Verification table claimed the floors were green *"on a simulated
    post-cut tree"*, and `check:markdown` **EXITS 1** on such a tree — `M5` at 28 anchored against 60
    — which is decision 3's whole subject arriving as a contradiction in the item's own gate row. And
    `npm run gate` is **flaky at roughly 1 in 4** on `tv-ingest / arranged LAST-first`, a TOTAL-order
    assertion of W94's with two adjacent arrivals swapped; `git diff` shows zero changed files under
    `src`, `examples` and `test`, so it is not this item's — but this item saw two clean runs and
    reported them as a verdict, where the conformity reader saw the red one. *It is the class
    [W98](../work-items/w98-what-a-row-may-assert-about-a-dispatch-order.md) fixed once by asserting
    per series, and it is handed on rather than taken.*
