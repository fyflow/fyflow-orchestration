# W115 — the exit artifact: `doc/workflow.md` to its budget, `doc/README.md` to its sections

**Status:** done — 2026-10-04; see the Record. Declared 2026-10-04 on `6724e45`
([W114](w114-claude-md-is-guidance-and-npm-run-state-is-the-index.md)), before any file under `Owns`
was edited.

**Plan:** [P27](../plans/p27-what-a-register-row-is.md)

```
Spec:       NONE — this item writes no spec rule and changes no behaviour. It cuts two
            documents, lowers one check's ceiling to the TARGET rather than to a
            measurement, re-declares one probe whose clause a met budget makes
            unreachable, and re-anchors the self-test entries pinned to the value that
            moves. **NO ADR** — the maintainer was asked and chose none unless the `B3`
            question took the road that amends ADR 0076, and it did not
Owns:       doc/workflow.md       (the BUDGET: 305,643 -> its 35,840-byte target)
            doc/README.md         (Q466, answered by the maintainer: the `## Current
                                   state` block goes, and this file LEAVES the record
                                   step, so finishing an item writes FOUR files)
            scripts/check-budget.mjs, scripts/check-budget-selftest.mjs
              (obligation (d), and FIVE literals in the self-test are pinned to the value
               that moves — declared up front, because this is the THIRD consecutive item
               whose only `Owns` risk is these two files for this exact reason)
            doc/work-items/w115-the-exit-artifact-and-the-budget-met.md
Inputs:     P27 decisions 1, 2 and 4; **fact 8**; predictions 1, 2, 4 and 5; stop-and-ask
            (b), ALREADY ANSWERED and this item's mandate for `doc/workflow.md` — only the
            CLAUSE, the one-line finding that earned it, its plan id, and a REFUSAL LEDGER
            of one line per repeat. [W114](w114-claude-md-is-guidance-and-npm-run-state-is-the-index.md)'s
            Record and its obligation (d). [ADR 0076](../decisions/0076-a-vacuity-floor-counts-what-a-prose-cut-cannot-move.md)
            decisions 3, 4 and 5; [ADR 0077](../decisions/0077-an-item-does-not-write-its-status-into-claude-md.md)
            decision 1 and **consequence 4, which is [Q466](../open-questions.md) and is
            this item's**; [ADR 0078](../decisions/0078-a-vacuity-floors-window-is-a-property-of-the-probe-suite.md)
            decisions 1 and 2; [ADR 0073](../decisions/0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md)
            decision 1 and [W107](w107-the-readme-is-for-a-person-who-will-use-the-library.md)'s
            method, as [Q468](../open-questions.md) corrects it. **EVERY figure re-taken at
            this declaration step (P15 decision 5); section 2 is what that found.**
Outputs:    (1) `doc/workflow.md` at or under P27 decision 1's **35,840-byte** target: the
            version blocks (L1-1801, 159,779) and the adapted-from table (22,898) DELETED
            to git, and the live sections 1-8 (122,966) cut by the ~70% fact 8 measured
            (2) **the VERSION LEDGER and the REFUSAL LEDGER** — stop-and-ask (b)'s mandate
            made a table: one line per version with the clause it added and its plan id,
            and one line per repeatedly-refused proposal with the ordinal the file states
            (3) the home demonstration for BOTH cuts, W107's method as W113 corrected it,
            with a RESOLUTION FLOOR asserted before the instrument reports anything
            ([Q470](../open-questions.md)) and the wrong-owner control beside it
            (4) `doc/README.md`'s `## Current state` block — **489,966 bytes, 91.1%** —
            deleted to git, and the file out of the record step (Q466)
            (5) **`doc/workflow.md` section 1's loop DIAGRAM corrected**: it still lists
            `CLAUDE.md` in the record step, twenty lines above the rule that says it left,
            and W114 reported it and left it because it is inside the text this item
            rewrites. Rule 5's list becomes **FOUR**
            (6) `check:budget`'s `doc/workflow.md` ceiling and `TOTAL_CEILING` lowered —
            obligation (d), and the LAST act. **Not to this item's measurement: to the
            TARGET**, because the declaration space admits exactly one value; section 4
            (7) the `B3` probe re-declared, because a MET budget makes that clause
            unreachable alone; section 4
            **(8) ADDED AFTER THE DECLARATION, on the adequacy reader's findings 3 and 4:
            `check:budget` gains `B6` — the set is the declared MEMBERSHIP, compared both
            ways with multiplicity — and `B7` — each member's TARGET is the figure P27
            decision 1 decides for it — with three probes, three META entries and a
            cross-file SOURCE clause. Both holes were CONFIRMED by running them before
            they were closed: `B1` COUNTED the set, so `[concept, workflow, concept]`
            dropped `CLAUDE.md` out of the always-read set for EXIT 0 and a reported
            52,730 bytes; and `B4` bound only the targets' SUM, so targets of 1/1/75 KiB
            relaxed the whole budget to 876,800 bytes with every clause green. The banner
            names `MEASURE_ROOT` now, with a SOURCE clause over the control's own stdout**
            **(9) ADDED: `doc/README.md`'s replacement preamble — 2,373 bytes the
            declaration did not promise, which both readers measured as undeclared. It
            states what the file is for, that it carries no item status, that the record
            step is FOUR files, and names the four stale counts in what survives**
Depends on: W112 (the budget and the floors), W113 (the register) and W114 (`CLAUDE.md`
            and `npm run state`), all DONE. W114 is a hard dependency rather than an
            ordering one: the budget is MET only if `CLAUDE.md` is already inside 25,600
Blocks:     nothing. This is P27's EXIT ARTIFACT
Tests:      `check:budget` + `:selftest`; `check:markdown` + `:selftest`, **which is the
            only thing that proves no link died and the only lane that can see `M3`'s
            two-document margin or `M5`'s upper edge**; `check:spec` + `:selftest`;
            `check:source`, `check:wiring`, `check:docs`, each with its self-test;
            `npm run state`, whose plan and item readings must not move. Expected values
            come from section 1's and section 5's measurements, never from a check's output
Gate:       L0, check:budget (+selftest), check:markdown (+selftest), check:spec
            (+selftest), check:source (+selftest), check:wiring (+selftest),
            check:docs (+selftest), check:scheduler, then **`npm run gate:full`** as the
            CONFIRMING gate (v0.26 — `npm run gate` is NOT an item's confirming gate)
Reserves:   **Q479-Q485, and NO ADR.** P27 reserved Q459-Q478 and ADR 0076-0078 and ALL
            are spent (Q472-Q478 by W114), so this block extends that plan's by grep on
            [W86](w86-score-each-item-then-fan-out-per-item.md)'s, W113's and W114's
            precedent. **The maintainer was asked and chose both**, 2026-10-04; the three
            answers are at the foot of this file
```

## What this item is

It is the last of P27's four, and it is the one that makes the budget a fact rather than a direction.
`CLAUDE.md` arrived at W114; `doc/concept.md` was never over; **`doc/workflow.md`'s 305,643 bytes are
88% of what the always-read set still costs.**

It is also the item where **cutting the version blocks is not enough and that was measured rather
than discovered**. P27 fact 8 says so and this item's re-measurement confirms it exactly: the blocks
are 159,779 and the adapted-from table 22,898, so **deleting both still leaves 122,966 — 3.4x the
target.** Sections 1-8 lose about 70% as well, and stop-and-ask (b) is the mandate for how: *only the
clause, plus the one-line finding that earned it, its plan id, and a refusal ledger of one line per
repeat.*

And it carries a second cut that **buys no budget at all**, which is why it needed a decision rather
than an argument. `doc/README.md` is not in `check:budget`'s `SET` — that set is three paths — so its
489,966-byte status block costs a session nothing it is told to read. [Q466](../open-questions.md) is
whether it goes anyway, [ADR 0077](../decisions/0077-an-item-does-not-write-its-status-into-claude-md.md)
consequence 4 left it to the maintainer rather than to this item, and **the answer is yes, on the
register's argument rather than on the budget's**: 490 KB of status nobody is told to read.

## 1. Every figure re-taken

On `6724e45`, with each document's `##` regions measured by byte offset so that the parts sum to the
whole rather than to each other.

| | bytes | lines | share |
|---|---|---|---|
| **`doc/workflow.md`** | **305,643** | 3,380 | |
| the version blocks, L1-1801 (v0.3-v0.26 and 7 confirmation paragraphs) | **159,779** | | **52.3%** |
| the live sections 1-8, L1802-3238 | **122,966** | | **40.2%** |
| `## What was adapted, and what the retro judged`, L3239-3380 | **22,898** | | **7.5%** |
| **`doc/README.md`** | **538,088** | 3,181 | |
| `## Current state`, L3-3081 | **489,966** | | **91.1%** |
| `## Reading order` | 6,043 | | 1.1% |
| `## Document status` | 10,167 | | 1.9% |
| `## Sibling repositories` | 2,395 | | 0.4% |
| `## Plan history` | 29,494 | | 5.5% |
| `CLAUDE.md` | 23,160 | 339 | — W114's, MET, and not touched |
| `doc/concept.md` | 17,125 | 245 | — MET with 283 bytes of headroom, and not touched |

159,779 + 122,966 + 22,898 = 305,643 and 23 + 489,966 + 6,043 + 10,167 + 2,395 + 29,494 = 538,088,
both exactly.

**The live sections, and where the 70% has to come from:**

| section | bytes | |
|---|---|---|
| 1. The loop | 12,176 | |
| 2. The unit of work | 690 | already terse |
| 3. Ids and files | 1,219 | already terse |
| 4. The verification ladder | 9,888 | two load-bearing tables |
| **5. Tests are a deliverable** | **72,078** | **59% of sections 1-8** |
| 6. Verify: the three passes | 17,432 | |
| 7. Parallel work | 2,933 | |
| 8. Speed | 6,550 | |

**And inside section 5, rule 8 alone is 67,424 bytes** — 55% of sections 1-8 and 22% of the whole
file — against 2,442 for rule 7 and 235-482 for rules 1-6. *The budget is one rule.*

**The tree, re-run and redirected at this declaration step**: `check:budget` EXIT 0 at **345,928
against 350,024** (`CLAUDE.md` 23,160/25,600 **MET**, `doc/concept.md` 17,125/17,408 **MET**,
`doc/workflow.md` 305,643/309,690); `check:markdown` EXIT 0 at **187 documents, 6149 relative links
in 182 of them, 35 anchored**; `check:spec` EXIT 0 at **7 / 72 / 132**; `npm run state` EXIT 0,
**21 derivations, 8 subjects**, census **369 / 290 live / 289 open / 1 deferred / 79 resolved**, next
free `P28 W115 Q479 ADR 0079`; `check:markdown:selftest` EXIT 0 at **37/37 and 7/7**;
`check:budget:selftest` EXIT 0 at **13/13, 4/4, 9/9, 13/13, 14/14**, digest unmoved.

## 2. Five handed-over figures are wrong, and the predicate is stated before each is called wrong

[Q469](../open-questions.md) is the hazard: W113 called P27's *17%* wrong at *4%* using six
phrasings, none of them the phrase the rows use, and P27 had been right. So each row below names the
predicate.

| figure | handed over | measured | the predicate, and why they differ |
|---|---|---|---|
| **P27 fact 8's refusal counts** | *"23 `for the Nth time` refusals, 63 `REFUSED` clauses, 14 `doc/`-check refusals and 11 `Owns`-rule refusals"* | **22 / 18 / 15 / 11** | four predicates, one per figure, each printed with the alternatives. *"for the Nth time"* over an ordinal list including the *TWENTY-FIRST* and *TWENTY-FIFTH* spellings the file uses is **22**; a looser *"the Nth time"* is 30 and *"Nth time or occurrence"* is 68, so no predicate gives 23. `REFUSED` verbatim is **18 LINES**; the numbered items beneath them are **47** and the counts those lines DECLARE sum to **43** where a number is given, so none is 63. `doc/`-check refusal sites are **15**. **Only the `Owns` figure reproduces, at 11.** *(My own first instrument said 11 for the first figure, because its ordinal list stopped at `tenth` and the file counts past twenty — the shape of defect this item then had to refuse in its own home-demonstration instrument.)* |
| **what the ledger should carry instead** | a count | **the ORDINAL the file states** | and it is a better number than any count: the file says the `doc/` check has been refused **for the TWENTY-FIFTH time** and the `Owns` pre-declaration rule **for the THIRTEENTH**. A count of phrase occurrences depends on the predicate; an ordinal is the document's own claim about itself. Fact 8's CONCLUSION is confirmed and strengthened |
| **`M3`'s margin** | *"documents >= 142 against 187 — you delete no file, so safe"* | **against 139, and the margin is TWO** | 187 is the WHOLE-TREE count and `M3`'s floor is two-sided: it must also be ABOVE the first `removes` probe's fixture or that probe stops firing it. Probe 1 (`-doc/decisions`) resolves **139** documents today and **140** with this item's own file added, against the floor **142**. **So W115 may add ONE document and exactly ONE more may ever be added.** [ADR 0076](../decisions/0076-a-vacuity-floor-counts-what-a-prose-cut-cannot-move.md) decision 2's table measures the floor's behaviour directly — at 142 it does NOT fire, `wanted [M1,M3], got [M1]`, and at 141 it does — so from 140 the next document is safe and the one after it is red. *This row said TWO and the conformity reader found it against that table; Scope `Out` below said the margin is TWO and this item spends one, which under the same convention means one further document. The two statements disagreed and the smaller is right.* **This is ADR 0076 decision 2's own arithmetic arriving** — it predicted the margin reaches 2 during P27 and that `M3` does not fire — and the brief's *"safe"* is right about the conclusion and reads the wrong number |
| **`M5`'s margin** | *"anchored >= 28 against 35 — MARGIN 7"* | **a two-sided window `[28, 42]`** | the check needs `anchored >= 28`; `M5`'s own probe strips `doc/scheduler-upstream.md`, whose **15** anchored links are all self-anchors, so the probe needs `anchored - 15 < 28` and the UPPER edge is **42**. Measured with the check's own `blankCode` and `resolveLinks` against a resolution floor, not with a grep: `doc/scheduler-upstream.md` **15**, `doc/workflow.md` **5**, `doc/plans/**` **12**, `doc/open-questions.md` **2**, `doc/work-items/w96-*.md` **1**. The raw grep and the check agree at 5 for `doc/workflow.md`, which is luck rather than method. **And 35 is a DECLARATION-STEP figure that this item's own edit moved**: all five of that file's anchors were in the version blocks and went with them, and the version index then put back **SIX** — P20 through P24 and P26 — and the record step's own [Q481](../open-questions.md) row adds a same-file `](#live)`, so the shipped corpus carries **37**. *Three values for one figure in one item — 35 declared, 36 after the version index, 37 after a register row — which is section 1 rule 5's **when** direction and the conformity reader found it at both 35 and 36.* 37 sits inside the `[28, 42]` window: the check needs 28 and gets 37, and `M5`'s own probe strips `doc/scheduler-upstream.md`'s 15 to fire at **22** |
| **`check:markdown`'s link count** | 6149 (brief) / **6141** (W114's Record and its figures table) | **6149** | the check prints it. The brief's figure is right and W114's Record is wrong by 8, in two places. Not this item's file; reported rather than fixed |
| the tree | `gate:full` EXIT 0, zero FAIL lines, selftests 9/9, 762.3 s / 2728.6 s | **not re-run at the declaration** | a confirming gate is ~760 s and an item does not spend one to confirm a predecessor's. Every rung this item's own gate names was run and redirected; section 1 has the figures |

## 3. The home demonstration, for both cuts

**The instrument asserts a RESOLUTION FLOOR before it reports anything**, which is
[Q470](../open-questions.md) and W114's own worst defect: that item's home instrument was wrong
twice, and the second time its wrong-owner control passed because both sides were missing. It also
carries the wrong-owner control, scoring each block's tokens against the NEXT owner's file.

**The predicate, stated exactly.** Over L3-3081 of `doc/README.md`, segment into PARAGRAPHS —
maximal runs of non-blank lines — and a paragraph OPENS a status block when its first line, leading
`*` stripped, matches `^\[(W\d+|P\d+)\]\((work-items|plans)/[pw]\d+-[a-z0-9-]+\.md\)`. Paths there
are relative to `doc/`, which is the one way this predicate differs from W114's.

### A — `doc/README.md`'s `## Current state`

| | |
|---|---|
| paragraphs in the block | **355** |
| status blocks under that predicate | **89** |
| blocks whose headline cites an item or plan FILE | **89** |
| those files that exist | **89 of 89** |
| those files carrying a `## Record` or a `## Retro` | **89 of 89** |
| distinctive tokens over 89 owners | 1,206; **241 not present in the owning file — 20.0%** |
| **the wrong-owner control** | **59.1%** missing — a **2.96x** separation, so the match is about the owner rather than about the corpus |
| **the region with no owning file** | **the `## Current state` heading itself, 18 bytes** |

**So this block has no homeless region at all**, and that is the one way it is easier than W114's:
`CLAUDE.md`'s heading was 3,936 bytes of id ledger that nothing else carried, and this one is two
words. *Everything in 489,966 bytes is a summary of a file that still exists and still carries its
own Record.*

### B — `doc/workflow.md`'s version blocks

| | |
|---|---|
| paragraphs opening `**v0.N` in L1-1801 | **31** |
| of those, **version blocks** whose first line names the plan whose retro produced it | **24** (v0.3-v0.26), **141,638 bytes** |
| those plan files that exist and carry a `## Record` or `## Retro` | **24 of 24** |
| the other **7**, whose first line names a VERSION rather than a plan | **15,611 bytes** — the *"v0.N's changes: CONFIRMED"* paragraphs, each terminating the block of the plan that JUDGED it |
| distinctive tokens over 24 owners | **93**; 14 missing — 15.1%. Control **64.5%** |

**The token screen is WEAK here and that is stated rather than hidden**: 93 tokens over 24 owners,
against `doc/README.md`'s 1,206 over 89. The version blocks are prose with few digests and few
3-6 digit numbers, so the screen has almost nothing to grip. **The discharge is reading, which is
[Q468](../open-questions.md)'s whole point**, and the reading found something the screen could not.

**The pointer between a version block and its plan runs BOTH WAYS for four of the twenty-four, and
P27 fact 8's premise is false for those:**

| | blocks | bytes | |
|---|---|---|---|
| `workflow -> plan` | **10** | 45,926 | the block says the full reasoning is in that plan's Record. **Fact 8's claim holds** |
| **CIRCULAR** | **4** | **31,885** | v0.21/P20, v0.22/P21, v0.23/P22, v0.24/P23 — the block cites the plan's Retro for the evidence **and that Retro's own opening line says `doc/workflow.md` is vN, *where the full reasoning lives***. P24's is the same sentence wrapped across a line, so the honest figure is **four or five** |
| no pointer either way | **10** | 63,827 | discharged by reading: all ten plan files are 22,737-67,819 bytes, all ten carry a `## Record`, and eight of ten name their own version number |

**So P27 fact 8's *"the 153 KB of reasoning is recoverable from the plan files that own it"* is not
true as written.** For four or five blocks each half points at the other, and
[P20](../plans/p20-what-the-runtime-owes-a-consumer.md)'s Retro says it in one sentence: *the full
reasoning lives in `doc/workflow.md`* while this file says the evidence lives in P20's Retro.
**Reading both settles what each actually holds**: the plan's Retro carries the plan's own evidence —
the central finding, the rung census, the predictions, the readers — and the version block carries
**the clause's wording and the argument for its generality.** The first survives the cut untouched.
The second is what goes, and **stop-and-ask (b) is the mandate that replaces it**: the clause itself
stays (it is already tabulated in rule 8's own index), the finding becomes one line, and the plan id
points at the evidence.

**What is genuinely lost is the argument for generality, and fact 8 is the measurement that says it
was not doing its job** — the same proposals returned with the arguments present, the `doc/` check
twenty-five times and the `Owns` rule thirteen. **P27 decision 2 is what authorises the cut even
where no plan file is the home**: nothing is archived to a file, the history is `git`, and a cut
thing keeps a one-line index entry and its commit. *That is what the version ledger is.*

### C — the LIVE SECTIONS, and this subject was missing until a reader said so

**The conformity reader's F1 is the sharpest finding of the pass.** Output (3) promised the home
demonstration for BOTH cuts, and A and B above cover the version blocks and `doc/README.md`'s status
block — **neither covers the cut to the live sections 1-8**, which took 122,966 bytes to about 32,000
and is the region W107's method is most about. It is also where this item's own stated risk lives:
*the claim most easily made falsely here is that nothing a reader needs was lost.* The instrument did
not have that region in its subject. Run here, after the fact, which is the honest order to admit.

| | |
|---|---|
| pre-cut live sections 1-8 (`git show HEAD:doc/workflow.md`, L1802-3238) | **122,966 bytes** |
| distinct item and plan ids CITED in that text | **117** |
| those whose owning file EXISTS | **116 of 117** |
| those files carrying a `## Record` or a `## Retro` | **115 of 116** |
| the one without | **P27** — this plan, whose Retro does not exist yet. *Not a homeless fact: it is the plan this item belongs to* |
| distinctive tokens over 116 owners | **56**; 12 absent from the owning file — 21.4% |
| the WRONG-OWNER control | **71.4%** absent — a **3.33x** separation |
| the RESOLUTION FLOOR asserted before any of it was reported | **30 owners**, against 116 resolving ([Q470](../open-questions.md)) |

**And the honest limit, which is the finding rather than the figure: no mechanical predicate
separates a DELETION from a RE-WORDING in a cut that re-words what it keeps.** Two were tried and
both over-count, each by a different mechanism:

- **line-exact** — a pre-cut line is gone when its text appears nowhere in the shipped file. It
  reports 1,115 lines and 114,500 bytes, 93.1%, and **58.3% of that is text that SURVIVES**: the cut
  re-flowed almost every paragraph it kept, so `Four rules that make the loop worth having:` counts
  as deleted while sitting in the file.
- **sentence-exact**, normalised for whitespace — it reports 399 of 434 sentences gone, and the
  over-count is re-WORDING rather than re-flow: *Level 5 is a rung rather than a case because the
  join is the hard part* is in the shipped file with a colon where the pre-cut text had a full stop,
  so the normalised sentence differs and the predicate calls it deleted.

**So the discharge for the re-written prose is READING, and the reader who did it is the conformity
reader's own section 4** — which judged the shipped document usable before every work item, named
sections 2, 3, 7 and 8 complete procedures, and found **three live clauses a reader could no longer
act on**. Two are fixed: section 6's ordinal clause, which said the ordinal is derived by counting a
list this item deleted, and rule 8's *four requirements on the set and one on the harness* against a
table of four and seven. The third is the refusal ledger's six unmeasured rows, declared below. *A
screen answers whether the WORDS have a home; this is the case where even the screen cannot be
built, and [Q483](../open-questions.md) records it.*

### The refusal ledger's own figures, measured — the conformity reader's F12

**Six of the ledger's eight figures were never measured under this item's own discipline, and the
text that evidenced them is deleted.** Measured now from `git show HEAD:doc/workflow.md`, counting
REFUSALS — a retro declining the proposal — rather than phrase mentions:

| the row | ledger says | phrase SITES in the pre-cut text | |
|---|---|---|---|
| a `doc/` check | 25 times | ordinal **TWENTY-FIFTH** stated in the file | the ordinal is the file's own claim |
| an `Owns` pre-declaration rule | 13 times | ordinal **THIRTEENTH** stated | same |
| a ladder LEVEL for the evidence | 4 times | **4** | reproduces |
| the dated-ceiling HAND-OFF | 3 times | **3** | reproduces |
| a corpus census pinned as a LITERAL | twice | **2** | reproduces |
| a LEVEL for the gate itself | once | **1** | reproduces |
| a finished item's file having no owner | once | **1** | reproduces |
| a membership over CONTAINERS | once | **1** | reproduces |
| a harness grading L6 in both runtimes | once | **1** | reproduces |
| **a fourth list below `CROSS_ROW_SUBJECTS`** | **twice** | **5** | **the one that differs, and it differs by PREDICATE**: two of the five sites are a retro refusing it and the other three are rule 8's own discussion of the clause. A refusal count is not a mention count, and the ledger says so |

**So seven of eight reproduce and the eighth is a predicate difference, stated rather than picked** —
which is [Q469](../open-questions.md)'s procedure applied to this item's own deliverable. *The two
largest rows rest on ordinals rather than counts for the reason §2 gives: a count of phrase
occurrences depends on the predicate, and an ordinal is the document's own claim about itself.*

### And §3B's 2,530 unreconciled bytes are the file's own header — F8

The conformity reader found that §3B's two classes do not sum to §1's region. Measured exactly: the 31
`**v0.N` paragraphs in L1-1801 total **157,280** and the text before the first of them — L1-37, the
H1, the `**Status:**` line listing all twenty-six plans, and the *Read this before starting any work
item* paragraph — is **2,499**. `157,280 + 2,499 = 159,779`, exactly. *§3B's 141,638 + 15,611 =
157,249 was 31 bytes short of the paragraph total, which is how the residue read as 2,530.* **It is
not a homeless region**: the H1 and the status line SURVIVE in the shipped file, compressed, and the
parenthetical about P8 and P25 survives as *two of which adopted nothing*.

## 4. Obligation (d) is OVER-DETERMINED, and a MET budget makes `B3` unreachable

This is the sharpest thing this item found before writing a byte, and both halves are proved by
search rather than argued.

### The ceiling cannot be this item's measurement

W112's obligation (d), carried forward by W113 and W114, is *lower `check:budget`'s ceiling to your
own post-cut measurement*. **For `doc/workflow.md` that is not satisfiable.** The clauses, read off
`scripts/check-budget.mjs`:

- `B4` fails when `TOTAL_CEILING > sumCeilings` and when `TOTAL_CEILING < TOTAL_TARGET` (78,848),
  so `sumCeilings >= 78,848`.
- `sumCeilings` is `25,600 + wc + 17,408`, both other members' ceilings being their targets already,
  so **`wc >= 35,840`**.
- `B5` fails when a member inside its target keeps a ceiling above it, so once `doc/workflow.md` is
  inside 35,840, **`wc <= 35,840`**.

Brute-forced over every `wc` in `1..400,000` for staged sizes of 35,840, 35,000, 30,000 and 20,000:
**exactly ONE legal ceiling, 35,840, and exactly one legal `TOTAL_CEILING`, 78,848**, in all four.

**So the obligation's wording is W114's precedent rather than its own**: that item set `CLAUDE.md`'s
ceiling to the **target** 25,600 and not to `23,160 + 4,096 = 27,256`, for exactly this reason one
member early. The honest statement of obligation (d) at the LAST member is *lower the ceiling to the
TARGET*, and **the 4,096-byte `ALLOWANCE` ceases to exist when the last member arrives** — ceiling,
target and the per-file sum all collapse onto one number. A budget that is MET has no slack by
construction, which is what a met budget means and is stated here rather than discovered.

### And then `B3` has no case of its own

With `TOTAL_CEILING === sumCeilings`, `measured > TOTAL_CEILING` requires some member to be over its
own ceiling, so `B3` can only fire **with** `B2`. Searched over every staging of the three members on
an 8-byte grid: **no staging keeps all three inside their own ceilings while the set exceeds 78,848.**

**That is precisely the defect `check-budget.mjs`'s own `SET` docstring records fixing in its first
cut** — *"the first cut of this check set the total to the sum exactly, which made `B3` unreachable …
a clause with no instance of its own (rule 8 obligation (a))"* — arriving from the opposite
direction: **the budget being MET is what destroys it**, and the budget being met is this plan's
goal. The probe `every member AT its ceiling, so the set exceeds the total and no member does` will
trip nothing.

**The maintainer was asked and chose the cheapest road**: the probe is re-declared `B2` with
`also: ['B3']`, the collapse is stated in the check's own comment, and the limit is a Q row rather
than an amendment to [ADR 0076](../decisions/0076-a-vacuity-floor-counts-what-a-prose-cut-cannot-move.md)
decision 4. **No ADR.** `B3` keeps a live case for any future member that has not met its target,
which is why it is not deleted.

### The arithmetic the budget rests on

**The brief handed this item the sum `23,160 + 35,840 + 17,125 = 76,125` to verify before starting, and it verifies — as arithmetic. It is not the budget.** `35,840` is `doc/workflow.md`'s TARGET and the other two terms are MEASUREMENTS, so the figure is a mixed predicate: **the measured set is 23,160 + 35,576 + 17,125 = 75,890**, which is what `check:budget` prints, and the difference of 264 is exactly that file's headroom. *This is [Q469](../open-questions.md)'s hazard inside the section whose whole subject is Q469, and the adequacy reader found it. The item verified the sum as given rather than asking what its terms were.* The honest statement, re-taken on the tree this item ships: the three targets sum to **78,848**, the shipped set measures **76,500** — `CLAUDE.md` 23,754, `doc/workflow.md` 35,621, `doc/concept.md` 17,125 — and what each member has to spend is target-minus-measurement, **1,846, 219 and 283 bytes**, which `check:budget` prints in place of a distance that is permanently zero. *This paragraph has now been re-taken TWICE: it first said 76,125 with a ceiling mixed into a sum of measurements, then 75,890, which acting on the readers made stale by 610 — `CLAUDE.md` +594 for its record-step correction and `doc/workflow.md` net −16. Section 1 rule 5's **when** direction is the clause, the conformity reader found it twice, and the figure a reader should trust is the one `check:budget` prints.*

## 5. What stays, and the two ledgers

**`doc/workflow.md`.** The live procedure stays in full where it is already terse and loses its
arguments where they are the bulk:

| | stays | goes, and where to |
|---|---|---|
| the loop, the 5 rules, the status-provenance clause and its **four** directions — read, write, when, un-write. *This cell said THREE and the shipped table says four, which the conformity reader then resolved AGAINST both: the pre-cut file names four directions in prose and folds P7's any-copy amendment into the read row, so **four is faithful and three undercounts**. My own first correction here said it had SIX, counting bold PARAGRAPHS rather than named directions — [Q469](../open-questions.md) in the correction of a Q469 defect, which is why the predicate is now stated: four NAMED directions over six pre-cut paragraphs* | the clauses and the grep procedure | the per-occurrence case histories — to the items and plans that own them |
| sections 2, 3 | nearly whole; they are already one line a rule | |
| section 4 | both tables, *a rung is RUN never PIPED*, *the confirming gate is `gate:full`*, the two-directions blockquote, *what the ladder does not cover* | the four occurrence narratives behind *never piped* |
| section 5 rules 1-7 | whole; 235-482 bytes each | |
| **section 5 rule 8** | the clause, **its own obligation index — which already IS the clause-plus-plan-id form stop-and-ask (b) asks for** — the three founding cases, and one line per amendment | **the ~58 KB of amendment arguments**, to the plan Retros and to `git` |
| section 6 | the three passes, the two-reader table, the isolated-copy procedure, the **0-4 band over 59 measurements**, and pass 3's rules — **SEVEN**, not the six this cell first said: this item ADDED one, and it is a declared exception rather than a cut | the overlap list's per-item history and the nine parenthetical corrections of its own staleness |
| sections 7, 8 | the rules, the budget table, and ADR 0070's answer | the per-lane measurement history |
| the version blocks and the adapted-from table | **nothing** | the **VERSION LEDGER** and the **REFUSAL LEDGER**, plus `git` |

**The two ledgers are the deliverable stop-and-ask (b) names**, and the refusal ledger is the half
fact 8 says does the work: *one line per repeat*, carrying the ordinal the file states, so a retro
can recognise a repeat instead of re-deriving one. The `doc/` check at **25** and the `Owns`
pre-declaration rule at **13** are the two rows that make the point.

**`doc/README.md`.** `## Current state` goes; `## Reading order`, `## Document status`,
`## Sibling repositories` and `## Plan history` stay, and the file leaves the record step.

**One thing stays that should not, and it is named rather than fixed**: those four surviving sections
carry stale derived counts, which is P27 decision 4's own class. `## Reading order` says *"179
questions - 129 open, 2 deferred, 48 resolved"* against **369 / 289 / 1 / 79**; `## Document status`
says *"29 ADRs"* against **46**, *"`workflow.md` v0.19 — run to completion EIGHTEEN times"* against
**v0.26 and 26**, and *"55 hand-written examples and 106 numbered rules"* against **7 / 72 / 132**.
**The maintainer was offered the road that removes them and chose the narrower cut**, so they get a
Q row and not an edit — and the reason to prefer that is honest: removing a count is a decision about
what each row is FOR, and this item already carries two documents.

## Scope

**In**

1. `doc/workflow.md` L1-1801 (the version blocks) and L3239-3380 (the adapted-from table) DELETED.
   Nothing is archived to a file (P27 decision 2).
2. Sections 1-8 cut to the clause, the one-line finding, the plan id — stop-and-ask (b).
3. **The VERSION LEDGER and the REFUSAL LEDGER**, built from the file rather than from P27's summary
   of it, since section 2 measured four of that summary's five figures wrong.
4. Section 1's **loop diagram** corrected and rule 5's list taken to **FOUR**, `doc/README.md`
   leaving it by Q466's answer. Output (5), and the diagram is W114's reported-and-unfixed finding.
5. `doc/README.md` L3-3081 DELETED.
6. `check:budget`'s `doc/workflow.md` ceiling to **35,840** and `TOTAL_CEILING` to **78,848** — the
   target, not a measurement, for section 4's reason — and the **five** literals in
   `check-budget-selftest.mjs` pinned to 309,690 / 352,698 / 350,024 re-anchored.
7. The `B3` probe re-declared as a compound, with the collapse stated in the check's comment.

**Out** — named, with where it goes instead

- **`CLAUDE.md`** (W114's, MET at 22.6 KiB against 25.0) and **`doc/concept.md`** (MET, 283 bytes of
  headroom). Neither is touched, and the maintainer named both.
- **Lowering any floor or ceiling but `check:budget`'s `doc/workflow.md` one.** `M3`, `M4` and `M5`
  are ADR 0076's and ADR 0078's and this item ships inside their windows rather than moving them —
  section 2 has the two windows measured.
- **Re-wording a live rule.** What stays is cut and restated in the present tense, never re-decided.
  A clause this item cannot shorten without deciding something keeps its words.
- **`doc/README.md`'s four surviving sections' stale counts.** A Q row; see section 5.
- **`AGENTS.md`** (255 KB, a tested artifact — P27's own `AGENTS.md is OUT` paragraph) and the code
  comments (the follow-on plan).
- **Any `spec/` document, any ADR, any test.** `src/`, `test/` and `examples/` are untouched.
- **A second added document.** `M3`'s margin is TWO and this item spends one; section 2.

## Verification

Every rung RUN and redirected, `$?` read on its own line, never piped (section 4, v0.16). `grep -c`
is never a rung's predicate — it exits 1 on zero matches and reports its own failure as the rung's.

| clause | command |
|---|---|
| L0 | `npm run lint`, `npm run typecheck` |
| the budget | `npm run check:budget`, `npm run check:budget:selftest` |
| no link died, and the two floors with margins | `npm run check:markdown`, `npm run check:markdown:selftest` |
| the derivation still reads every plan and item | `npm run state` |
| the rest | `check:spec`, `check:source`, `check:wiring`, `check:docs`, `check:scheduler`, each with its self-test where it has one |
| confirming gate | **`npm run gate:full`** |

*Routing: not applicable. No rung of L1-L6 reads a document this item edits, which is P27
prediction 4 and is asserted by those rungs' counts not moving.*

**The claim most easily made falsely here** is that nothing a reader needs was lost. `check:markdown`
proves every link that EXISTS resolves and says nothing about a fact that stopped being written
down; section 3 is what discriminates them, and **its weakest point is stated**: the token screen has
93 tokens over 24 owners for `doc/workflow.md`, so for that half the discharge is reading and the
screen is nearly vacuous. The four-or-five circular pointers are what the reading found.

**The second** is that the budget is MET. It is met by three `statSync` calls against three
integers, and section 4 is why those integers have exactly one legal value — so *met* is checkable
and `B5` is what makes it a ratchet.

## Declared exceptions

**Three paths outside `Owns` and outside the record step's four, and NONE of the three was
predicted.** The declaration said *"Predicted: none"*, which is the fourth consecutive item whose
`Owns` audit found something — W113's, W114's and now this one, which is P2's retro's stated
condition for bringing `check-owns.mjs` back and is why the refusal ledger's second row carries the
standing ground it does.

| path | why | predicted? |
|---|---|---|
| `CLAUDE.md`, three sentences | **BOTH readers found the first independently, and it is the overlap's first shared subject**: that file still said the record step is FIVE files and still named `doc/README.md`, so two of the three always-read documents contradicted each other about the list this item changed. It is the un-write direction of the very rule being edited. Two neighbours went stale from the same cut — *one block per version ABOVE sections 1-8*, where nothing is above them now, and a note that section 6 states its own total twice, which it no longer does. **The maintainer was asked**, because that file is W114's and was explicitly fenced, and chose to fix it here as a declared exception on W114's own precedent for `doc/workflow.md`. *Net +594 bytes, against 1,846 of headroom* | **no** |
| `scripts/check-markdown-selftest.mjs`, two probes and one META entry | **This item's cut killed two probes in a file it does not own, and `npm run check:markdown` stayed GREEN for both.** The first mutated a link that lived inside `doc/README.md`'s deleted block, so rule 7 (b) aborted the lane at 36/37. The second was subtler: its probe put a dead link INSIDE an indented fence and its META entry relied on the mutation blanking the rest of `doc/README.md` to trip a FLOOR — and at 50 KB no floor moves, because `M4` counts SOURCE DOCUMENTS since W112. The entry graded *STILL CAUGHT*. Re-anchored and re-shaped; the link now sits OUTSIDE the fence, where the indented closer is what makes it visible, so `M1` fires unmutated and disappears mutated. **This is [ADR 0073](../decisions/0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md) consequence 2's class and [ADR 0076](../decisions/0076-a-vacuity-floor-counts-what-a-prose-cut-cannot-move.md) decision 3's handed-forward obligation**, which counted 30 probes in that file anchored on link text inside documents P27 cuts. [Q482](../open-questions.md) | **no** — the plan predicted the class and this item's declaration did not carry it |
| `doc/workflow.md` section 6 pass 3, a SEVENTH rule | **A live rule ADDED, where Scope `Out` says a live rule is never re-decided.** *A retro appends its refusals to the ledger below, one line each, with the ordinal.* The refusal ledger is P27 stop-and-ask (b)'s mandated artifact and a ledger nobody appends to is what rots — the overlap list in the same section went stale by three, then three, then four, each time found by a retro trying to append to it. **The conformity reader found it as F5**, in no declared Output and arguably excluded by Scope. **The maintainer was asked** and chose to keep it as a declared exception rather than remove it or spend an ADR on it | **no** |

**Within the record step's FOUR**: [P27](../plans/p27-what-a-register-row-is.md)'s Record;
`doc/open-questions.md` (Q479-Q485 raised, Q466 answered and moved to `## Resolved`, Q481 resolved
and moved, Q474 extended with its second occurrence); and `doc/decisions/**` — **two sentences of
FACT in accepted ADRs that this item falsified**, corrected in place on this repository's own
convention: [ADR 0076](../decisions/0076-a-vacuity-floor-counts-what-a-prose-cut-cannot-move.md)
decision 4's *the total is STRICTLY BELOW the per-file ceilings' sum* and its 16,302-byte allowance,
both false once the last member arrived; and
[ADR 0077](../decisions/0077-an-item-does-not-write-its-status-into-claude-md.md) decision 1's
five-file list, **struck where it stands** on the precedent its own decision 3 sets for ADR 0073.
*Both were reader findings — F6 and F4 — and F4's point is the sharper one: `doc/workflow.md` was
citing an OPEN register row as the authority for a list an accepted ADR stated differently, where
section 1 rule 3 says a decision lives in `spec/`, an ADR or a plan.*

**`README.md` was READ and is unchanged**, which is recorded because the record step names it: its
only mention of either cut document is a one-line pointer calling `doc/README.md` *the development
index*, and that is still true. ADR 0073 decision 2 keeps repo status out of it, so there was nothing
to re-take.

## Record

**Status: the BUDGET IS MET.** `check:budget` reports every member of the always-read set inside its
own target and the set inside the total: **76,500 bytes against 78,848**, from **893,682** at P27's
declaration — an **11.7x** drop, and P27's exit artifact. `doc/workflow.md` is **35,621 from
305,643**, an 8.6x cut; `doc/README.md` is **51,320 from 538,088**, a 10.5x cut, and out of the
record step, which is now **FOUR** files. The check carries **seven** clauses where it carried five.

### The figures

| | before | after |
|---|---|---|
| `doc/workflow.md` | 305,643 / 3,380 lines | **35,621** — 219 bytes under its 35,840 target |
| its version blocks (L1-1801) and adapted-from table | 159,779 + 22,898 | **deleted to `git`**, replaced by a version INDEX and the REFUSAL LEDGER |
| its live sections 1-8 | 122,966 | about **32,000**, by stop-and-ask (b)'s mandate |
| `doc/README.md` | 538,088 / 3,181 lines | **51,320** |
| its `## Current state` block | 489,966 — 91.1% | **deleted to `git`** (Q466) |
| `CLAUDE.md` | 23,160 | 23,754 — met, 1,846 headroom, +594 for its record-step correction |
| **the always-read set** | 345,928 at W114; **893,682** at P27's start | **76,500 — MET** |
| `check:budget` | `B1`-`B5`, ceilings 25,600 / 309,690 / 17,408, total 350,024 | **`B1`-`B7`**, ceilings **25,600 / 35,840 / 17,408**, total **78,848** |
| the record step | FIVE files | **FOUR** |
| `check:markdown` | 187 docs / 6,149 links in 182 / 35 anchored | **188 / 5,219 in 183 / 37** |
| register | 369 rows | **376** — Q479-Q485 raised, Q466 and Q481 resolved |

### Gate — what ran

Every rung RUN and redirected, `$?` read on its own line, never piped. `grep -c` never used as a
predicate.

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **RAN, EXIT 0** | `lint`, `typecheck` |
| `check:budget` | **RAN, EXIT 0** | **76,500 against 78,848, every member MET.** `B6` and `B7` are new |
| `check:budget:selftest` | **RAN, EXIT 0** | **17 probes, 16/16 caught, 1/1 control clean, 4/4 grader, 10/10 source, 16/16 META noticed by the named probe, 14/14 self**, digest unmoved — after being EXIT 1 twice, below |
| `check:markdown` | **RAN, EXIT 0** | **188 documents, 5,219 relative links in 183, 37 anchored.** No floor moved: `M3` 142, `M4` 120, `M5` 28 |
| `check:markdown:selftest` | **RAN, EXIT 0** | **37/37 probes caught, 37/37 noticed, 7/7 bounded** — after being **EXIT 1 TWICE**, below |
| `check:spec` (+ selftest) | **RAN, EXIT 0** | **7 / 72 / 132 UNMOVED**, which is what `Spec: NONE` asserts |
| `check:source`, `check:wiring`, `check:docs`, `check:scheduler`, `check:policies`, `check:workers` | **RAN, EXIT 0** | `B6`/`B7` trip nothing: `S11` reads `check:*`, `S12` the gate chain, `G3`'s universe is `check-*.mjs` |
| `npm run state` | **RAN, EXIT 0** | 21 derivations — after refusing its own reading, below |
| L1-L5 | **RAN, EXIT 0** | **56 files / 1516 assertions UNMOVED** |
| rule 8, the author's set | **RAN** | 21 probes: 13 caught, 8 ceilings held, 5/5 grader controls, zero undeclared survivors, zero aborts |
| conformity reader | **RAN TWICE** — its first tree was destroyed mid-pass by the author | **60 values derived independently, 18 DISAGREED**; 6 blocking in the first half, 5 in the second |
| adequacy reader | **RAN TWICE**, same cause | first pass **0 mutations** — its tree was destroyed before its first rung — and every finding derived; four confirmed by the author and closed |
| rule 8, re-run with the readers' exact edits | **RAN** | **25 probes: 16 CAUGHT, 9 declared ceilings HELD, 5/5 grader controls, ZERO undeclared survivors, ZERO against-declaration, ZERO wrong-reason, ZERO crash, ZERO ceiling-is-a-catch, ZERO aborts.** Digest `04b5da6b8b8e537e` identical at both ends over 465 files |
| **`npm run gate:full`** | **RAN, GATE EXIT=0, ZERO lines beginning `FAIL`** | the confirming gate (v0.26), paid for ONCE on the final tree with no edit during it. **`selftests` 9/9 completed, 9 ok, 978.4 s wall against 3760.1 s serial-equivalent over 8 lanes.** Inside it: **L1-L5 56 files / 1516 assertions in node 24.20.0, deno 2.9.6 and chromium** and **L6 2435 assertions over 161 real runs on `fyflow-scheduler` 0.5.2 in both runtimes, 0 failed** — every one UNMOVED, which is P27 prediction 4. Digest **`4421c484af0a25a4`** over 465 files immediately after it. *The twelve `FAIL` substrings in the log are self-test `says` declarations and none begins a line; the known `tv-ingest / arranged LAST-first` flake did NOT fire.* **An EARLIER nine-lane `selftests` run came back 9/9 ok at 866.6 s and is DISCARDED as a verdict** — the author edited the tree while it ran, which is section 6's *the author's tree holds still* committed by the author; it is kept only as signal that no lane was structurally broken. **The only change since this gate is this cell and the Status line above**, which add no link and which no rung reads; `check:markdown`, `check:budget` and `npm run state` were re-run after writing them and are EXIT 0 |

### What broke

**Forty-three defects.** The two that matter most are the author's own, and both are the shape
section 6 exists to prevent.

*The author's, and the first one cost two whole reader passes:*

1. **A deferred `rm -rf` destroyed BOTH readers' trees mid-pass, and between them they ran ZERO
   rungs and ZERO mutations.** The command was `du -sh .` over a 642 MB tree followed by
   `rm -rf /c/wa0 /c/wb0; mkdir -p ...`. The `du` timed out, the command was moved to the
   background, and the delete fired **minutes later** — after a different command had populated both
   trees and after both readers had started. Section 6 ships the `--force`-follows-a-link hazard; this
   is its sibling from the author's side, and the honest cost is that the first pass produced only
   DERIVED findings. [Q480](../open-questions.md). *Both readers diagnosed it correctly and neither
   blamed itself.*
2. **`npm run selftests` was started and then the tree was edited underneath it** — P14's *a
   measurement over a moving tree is a claim about no tree*, by the author, after defect 1. The run is
   discarded.
3. **The `b1`/`b2` headroom pair was COMPUTED and had to be re-taken TWICE** — first at 236 where the
   declaration said 235, which the grader caught as `ceiling-IS-A-CATCH`, and then at 265/264 when
   acting on the readers moved the file. W114's defect 29 twice in one item.
4. **The rule 8 grader could not tell CRASH from DID-NOT-RUN**, because it tested the banner before
   the failure count: a throw happens before the banner prints. W112's measured defect, reproduced,
   and caught by the control written for it. The discriminator is the failure COUNT.
5. **Probe `e1` declared `[S12]` where the rung fires `[S11,S12]`** — a declared set that had not
   understood the pair.
6. **Both home-demonstration predicates over-count, each by a different mechanism.** Line-exact
   counts a RE-FLOW as a deletion (58.3% of its "deleted" text survives); sentence-exact counts a
   RE-WORDING. [Q483](../open-questions.md).
7. **Three heredoc manglings**: an em dash mis-decoded because python read its script from stdin
   under the ANSI codepage, a `\n` that became a real newline in a JS string literal, and a
   conditional expression that evaluated its subject eagerly. All three refused by an assertion rather
   than silently applied.

*Found by a RUNG, and all read correctly:*

8. **`check:markdown:selftest` EXIT 1 at 36/37** — a probe mutating a link that lived inside
   `doc/README.md`'s deleted block, so rule 7 (b) aborted. **`npm run check:markdown` stayed green.**
9. **`check:markdown:selftest` EXIT 1 again, and subtler** — a META entry graded *STILL CAUGHT*
   because its only observer was `doc/README.md`'s link COUNT: its probe put a dead link INSIDE an
   indented fence and relied on the mutation blanking the file's remaining 517 KB to trip a FLOOR. At
   50 KB no floor moves, because `M4` counts SOURCE DOCUMENTS since W112. Re-shaped so the link sits
   OUTSIDE the fence, where the indented closer is what makes it visible: `M1` fires unmutated,
   measured, and disappears mutated. **Both are [ADR 0073](../decisions/0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md)
   consequence 2's class and [ADR 0076](../decisions/0076-a-vacuity-floor-counts-what-a-prose-cut-cannot-move.md)
   decision 3's handed-forward obligation.** [Q482](../open-questions.md)
10. **`B5` fired on `doc/workflow.md`'s ceiling the moment the cut landed** — obligation (d) arriving
    as a red gate, exactly as W112 predicted when it wrote the clause.
11. **`check:budget:selftest`'s coverage bound refused `B6` and `B7` the moment they existed** — *`B6`
    has no probe; `B6` has no META entry naming a probe of it* — a bound catching its own clauses'
    author, as it did for `B5` at W114.
12. **Five failures in the first run of `B6`/`B7`'s own probes.** Two are declared sets my new clauses
    widened — **[Q474](../open-questions.md)'s SECOND occurrence**, `B7` turning the `B4` target
    probe — and three are META anchors written at four spaces of indent against source at two, all
    three aborted by rule 7 (b) rather than passing.
13. **`npm run state` refused its own reading** — *live rows that are open or deferred: 295, and the
    floor is 297*. **W114's own relation clause firing on W115**: it closed `openRows` with *every live
    row is open or deferred*, and this item put two ANSWERED rows in the live table. They belong in
    `## Resolved`, whose four-column width is what tells the two apart.
14. **The rule 8 re-run caught three stale probes of the author's own** — two Q474 widenings (`B7` on
    the `B4` probe, `B6` on the `B1` rename probe) and the dated `b1`/`b2` pair. *The clause that
    caught them is the harness's own: the item that moves the value re-runs it.*

*Found by the ADEQUACY reader — every one DERIVED, because its tree was destroyed, and every one
CONFIRMED by running it before it was acted on:*

15. **`B1` COUNTED the always-read set where obligation (d) says name the MEMBERS.** Staged
    `[concept, workflow, concept]`: **EXIT 0, zero failures, the set reported at 52,730 bytes with
    `CLAUDE.md` simply absent from it** — and `B3` skipped in silence through its
    `sizes.size === SET.length` guard. Closed by `B6`.
16. **`B4` bound only the targets' SUM, so the ALLOCATION was free.** Targets of **1 / 1 / 75 KiB**
    still sum to 78,848; with the ceilings at 876,800 every clause is green and **the always-read set
    may grow to 876,800 bytes — back to P27's starting size**. The smallest instance is a 1 KiB swap.
    ADR 0076 decision 5 names a derived ceiling as *the one way this check can be made worthless
    without a clause going red*; **this was a second way, using nothing but integer literals and
    `N * 1024` products, and it was larger.** Closed by `B7`. [Q481](../open-questions.md)
17. **`MEASURE_ROOT` was named nowhere in the output**, so a run with `CHECK_BUDGET_ROOT` set measured
    a COPY and its report was indistinguishable from one against the repository. The banner
    interpolates it now, with a `SOURCE` clause over the control's own stdout so the interpolation
    cannot be deleted for zero.
18. **The `SET` docstring still asserted *the total is STRICTLY BELOW their sum* and *the allowance is
    4,096 bytes***, both false on the shipped check — and ADR 0076 decision 4 carried the same
    sentence. Corrected in both.
19. **The `note:` line printed advice this item had proved unsatisfiable** — *each cut item lowers it
    to its own measurement*, where the last member has no measurement to lower to. It prints the
    per-member HEADROOM now.
20. **`.map(Object.freeze)` freezes the MEMBERS, not the list**, so `SET[0] = {…}` reopens W113's
    road — and **W115 accidentally closes it**, because a derived ceiling then trips `B5`. *The gain
    was not stated where the loss was.*
21. **`doc/README.md`'s undeclared +2,373 bytes** — both readers measured it; it is the provenance
    preamble, now Output (9).
22. **§4's arithmetic mixed a ceiling into a sum of measurements** — 23,160 + **35,840** + 17,125 =
    76,125 where the terms are two measurements and a target. [Q469](../open-questions.md)'s hazard
    inside the section whose whole subject is Q469, and **the brief handed that sum over to be
    verified and it verifies as arithmetic.**

*Found by the CONFORMITY reader:*

23. **F1 — the cut to the live sections 1-8 had no home demonstration at all.** §3 covered the version
    blocks and `doc/README.md`'s block; the ~90 KB of live procedure was outside its subject, and that
    is the region W107's method is most about and where this item's own stated risk lives. §3C is the
    answer: **117 ids cited, 116 owning files existing, 115 of 116 carrying a Record or Retro**, wrong-
    owner control at 3.33x, resolution floor asserted first. **The reader then read the 9 removed
    paragraphs that cite no id — 2,831 bytes, exactly where an id census is blind — and found ONE
    genuinely homeless live obligation**: *when a second observer is added, ask what the first one
    RETAINS, and drop the instrument once it has been read.* P15's retro carries the clause, the
    finding and the numbers **and not the instruction**, and a tree-wide grep returns nothing. It
    withdrew F1 from BLOCKING to bounded on that basis.
24. **F2 — `CLAUDE.md` still said the record step is FIVE files and still named `doc/README.md`.**
    **Both readers found it independently; it is the overlap's first shared subject**, and two of the
    three always-read documents disagreed about the list this item changed. Plus two stale neighbours.
25. **F3 — section 6 kept *the ORDINAL is derived by counting the list* and the cut deleted the
    list.** A live procedure made unfollowable: the 60th measurement could not be numbered.
26. **F4 — rule 5's FOUR rested on an OPEN register row**, where ADR 0077 decision 1 stated FIVE and
    its consequence 4 said `doc/README.md` is NOT changed. Section 1 rule 3 requires a decision in
    `spec/`, an ADR or a plan. Struck in place, and P27's Record is now the authority.
27. **The ADR 0077 strike then pointed at a P27 `## Record` that DID NOT EXIST** — a forward-dated
    claim in an accepted ADR, found by the reader's second half. P27's Record is written.
28. **F5 — pass 3 gained a SEVENTH rule**, in no declared Output and against Scope `Out`'s *never
    re-decided*. Kept as a declared exception by the maintainer's decision.
29. **F13 — *four requirements on the set and one on the harness* against a table of four and
    seven.** INHERITED, not introduced: `HEAD` carries the same sentence. W115 split the single harness
    requirement into one row per clause and did not re-take the count.
30. **F14 — §5 said the status clause has THREE directions and the author's own correction said
    SIX.** The reader measured **four NAMED directions over six pre-cut paragraphs**, so the shipped
    table is faithful and both of the author's figures were wrong. *Q469 inside the correction of a
    Q469 defect.*
31. **F9 — `M3`'s margin is ONE further document, not two.** Measured against ADR 0076 decision 2's
    own table: the floor does not fire at 142 and does at 141, and probe 1 sits at 140 with this
    item's file. The item's §2 said two and its own Scope said one.
32. **The anchored count had THREE values in one item** — 35 declared, 36 after the version index, 37
    after a register row. 37 is inside `[28, 42]` and `M5`'s probe fires at 22.
33. **Two comments cited `Q466` where the finding they state is `Q482`'s text verbatim.**
34. **`doc/README.md` sent a reader to the adaptation tables this item deleted**, and carried a FIFTH
    stale version figure, v0.17 / SIXTEEN, that `Q484`'s enumeration never named.
35. **`doc/README.md` said P26's retro was PENDING** while `doc/workflow.md` says v0.26 is P26's.
    Commit `58cc50c` corrected that exact sentence in P26's own file and never reached the index row.
36. **`Q484` enumerated a CLOSED *four* its own sections falsify, stated a register count (369) that
    its own seven rows made stale, and put a note in the OWNER column.**
37. **Two `## Plan history` rows carried 2 cells against a 4-cell header**, rendering two columns
    empty. Q471's class, and `M7` is scoped to the register so nothing sees it. Every row is 4 now.
38. **Five stale figures in `check-budget.mjs`**, each contradicted by the check's own output three
    lines away — the **FOURTH** occurrence inside this same check. Section 1 rule 5's **when**
    direction, and the cause is the author's own later fixes moving two members.
39. **`B5`'s justification lost its counter-example.** It read *a universal `ceiling <= target` cannot
    be the rule: `doc/workflow.md` is 298 KiB against a 35 KiB target and is W115's to cut* — and this
    item cut it, so all three members are met and the universal rule would now agree on every member.
    Kept conditional for a stated reason: a fourth member joining un-met would need the room.
40. **F8 — §3B's parts did not sum to §1's region.** Measured: the 31 `**v0.N` paragraphs are
    **157,280** and the text before the first — the H1, the status line listing 26 plans, and the
    *Read this before* paragraph — is **2,499**. `157,280 + 2,499 = 159,779` exactly, and §3B's
    141,638 + 15,611 was 31 bytes short of the paragraph total. **Not homeless**: it survives
    compressed in the shipped file.
41. **F12 — six of the refusal ledger's eight figures were never measured** under this item's own
    discipline, and the text evidencing them is deleted. Measured from `git`: **seven of eight
    reproduce**, and the eighth differs by PREDICATE — the fourth-list row has five phrase sites of
    which two are refusals.
42. **F15 — Output (3)'s resolution floor is not evidenced in §3's own tables.** §3C states its floor
    (30 against 116); A and B report counts without one, and the floor was asserted in the instrument
    rather than in the document. *Recorded rather than retro-fitted, because the instrument is not
    shipped (P22 stop-and-ask (a)).*
43. **`doc/README.md:62` is now the tree's only surviving narrative of v0.5-v0.12's reasoning, and it
    stops at P11** — the second, stale copy of the version blocks that W114's reader took out of
    `CLAUDE.md`. §5's *stays* row lists that section as surviving whole and does not note that it
    duplicates, nine versions behind, what §5's other row sends to the plan Retros and to `git`.
    *Named, not fixed: `Q484`'s subject.*

### The SECOND pass, and the three floor windows nobody had written down

**Both readers ran twice, because the author destroyed both their trees the first time.** The second
pass is where the mutations and the rungs actually happened: **conformity 38 values derived / 10
disagreed; adequacy 19 mutations / 8 SURVIVED / 8 distinct real holes**, plus ~17 staged-copy
measurements of the floor windows.

**The three windows, measured on the shipped tree, and NONE of them was written down anywhere:**

| | whole tree | probe 1 (−decisions) | probe 2 (−dec −plans) | probe 3 (strip upstream) | floor | what a future item may add |
|---|---|---|---|---|---|---|
| **`M3`** files | 188 | **140** | 112 | 188 | 142 | **ONE more document** outside `doc/decisions` — at 141 it fires, at 142 it does not |
| **`M4`** sources | 183 | 138 | **111** | 183 | 120 | **EIGHT more** link-carrying documents outside `doc/decisions` and `doc/plans` — undiscussed by this item until its reader measured it |
| **`M5`** anchored | 37 | 37 | 18 | **22** | 28 | **FIVE more** anchored links outside `doc/scheduler-upstream.md` |

**W115 moved every lower edge up by one**, and the comments that state these windows are W112's and
W113's: `M4`'s reads `178 / 135 / 108` with a window of `(106, 133]`, `M5`'s reads `anchored 35,
probe 2 17, strip upstream 20` with *28 is its midpoint* — true of W113's tree and not of this one.
Each is correctly labelled with the step it was measured at, which is section 1 rule 5's writing
clause honoured; **a reader looking for today's margin still finds a stale one.**

**And this item's own `M5` arithmetic was wrong in its REASONING, not its conclusion.** §2 derives the
upper edge as *whole − 15 < 28*, which assumes every new anchored link lands inside the document
probe 3 strips — the opposite of what the bound needs. The constraint a future item has to satisfy is
**anchored links OUTSIDE `doc/scheduler-upstream.md` must stay below 28**, and that number is 22. The
`[28, 42]` window is right for today by accident of where the links are.

### What the second pass broke, all of it mine

| | |
|---|---|
| **`SOURCE` entry 4 was deletable for ZERO, and it was the SOLE observer of `B6`'s and `B7`'s declarations** | `MIN_SOURCE` was 9 against 10 entries, `SOURCE` was the only list with a count floor, no content bound and no `SELF` entry for one entry leaving. The reader deleted it and composed that with a dropped `DECLARED_TARGETS` key for a **fully green self-test with `B7` silently skipping `doc/workflow.md`** — two independent routes, which is what makes it a confirmed survivor rather than a vacuous probe. *The guard added in answer to its first pass became the least-guarded thing in the file.* Closed: the floor is AT the length and a `SELF` entry proves the count is read |
| **`B7`'s `continue` justified itself with a claim about a DIFFERENT list** | `if (want === undefined) continue; // B6 has already reported an undeclared member` — and `B6` read `DECLARED_PATHS` while `B7` read `DECLARED_TARGETS`, with **nothing comparing the two**. A path in the first and absent from the second made `B7` skip that member in silence while `B6` stayed correctly quiet. Obligation (d)'s own clause: *a control must fail where its claim is VACUOUS, not only where its subject is ABSENT*. Closed: `B6` compares the two declarations both ways first, which is what makes that comment TRUE |
| **`MIN_META` carried TWO of slack against a comment asserting it has none** | *"`MIN_META` and `MIN_SELF` sit AT their lists' lengths, not one below"* — and META was 16 against 14, PROBES 17 against 16, `SOURCE` 10 against 9. **Inherited from W112 and carried forward by me**, since I raised each floor by exactly what I added rather than to the length. All four floors are at their lengths now |
| **`B1` reports a member it could not READ and not one it never VISITED** | narrowing its measuring loop left `doc/concept.md` unmeasured and the check printed `MISSING` in its row, `TOTAL … met`, and **EXIT 0** — a member absent from `sizes` only trips `B3`'s `sizes.size === SET.length` guard, which DISABLES that clause in silence. *The same guard shape `B6` was added to close, in the one direction `B6` does not cover.* Closed by one `fail('B1')` on the mismatch |
| **ADR 0076 decision 5's *the ONLY guard* is no longer true** | with every ceiling forced to its target, a DERIVED ceiling cannot be green: measured, `statSync(…).size + 4_096` fires `B5` three times and `statSync(…).size` fires `B4`. So `SOURCE`'s *every ceiling is an integer LITERAL* clause — which that ADR calls the only guard against the one way this check can be made worthless — **has no instance of its own any more**. *Exactly the status this item diagnosed for `B3`, arriving in a second clause nobody looked at.* Kept, because the freeze or the literal shape being removed with no derivation added is still its own case; recorded on [Q479](../open-questions.md) |
| **My new cross-declaration loop DUPLICATED an existing probe anchor** | both it and `B6`'s undeclared-member loop contained `if (!DECLARED_PATHS.includes(p)) {`, so the META mutation for the second hit the first and that entry graded **STILL CAUGHT**. **W109's defect at P26** — *a second comparison duplicated two probe anchors* — which is the reason ADR 0070 consequence 2 made `gate:full` an item's confirming gate. *A mutation pinned to text two clauses share is pinned to neither.* Closed by giving the loops distinct text, deliberately, and saying so where a reader will tidy it |
| **`B7`'s loop bound had no META entry**, where `B2` and `B5` each have one | and the entry I then wrote graded STILL CAUGHT, because the probe it names breaks members 0 and 2 so narrowing to member 0 leaves `B7` firing. **The reader predicted exactly that**: *no `B7` probe exercises index 1*. Narrowed to the MIDDLE member, which is the only narrowing that probe can discriminate |
| **[Q474](../open-questions.md) a FIFTH and SIXTH time, both mine** | `B1`'s new clause widened the `r1` probe to `[B1,B6,B7]` in the self-test and again in the rule 8 set. *Six declared sets of mine, widened by clauses of mine, in one item* |
| **The headroom pair was re-taken by hand THREE times and is now DERIVED** | 236/235, then 265/264, then 220/219 — every edit to `doc/workflow.md` dates them, and this item edited that file five times. The harness's dated-ceiling clause caught all three, which is the clause working *and* the signal that a literal was the wrong shape: what the pair asserts is that `B2` compares `>` and not `>=`, so the padding is computed from the ceiling literal and the measured size, with a floor under it |
| **The META anchor indent, a second time** | written at four spaces against source at two, aborted by rule 7 (b) rather than passing |

### The one finding that is not fixable here, and it is the sharpest of the pass

**`doc/workflow.md`'s prose has exactly TWO observers — its byte count and whether its links
resolve — and neither can tell a clause deletion from the cut this item was asked to make.**
Measured, with reachability controls so the silence is coverage rather than an artifact (appending
300 bytes trips `B2`; breaking one link trips `M1`):

| | mutation | every rung |
|---|---|---|
| delete obligation (d)'s row — the clause that EARNED `B6` | 35,576 → 35,409 | **green** |
| invert *a rung reported GREEN means its command EXITED 0* | +1 | **green** |
| replace the mandated recipe with the `grep -c` anti-pattern the same page forbids | +16 | **green** |
| **delete the ENTIRE rule 8 obligation table — six obligations and every amendment, 32 lines** | 35,576 → **31,433** | **green on all six rungs** |

**The class is the `doc/` check and it is refused twenty-five times; the sharp version is not the
class.** It is that **`check:budget` rewards exactly that deletion**: W115 cut 88% of this file and
the gate said green; deleting another 12% — the obligation set this whole pass instantiates — is also
green, and the one number a reader sees moves in the *deleting* direction. The refusal ledger's
standing ground is *both mechanisms are worse than the problem*, and that ground is about holding
prose TRUE. **This is about a 4 KB deletion from the always-read set being indistinguishable from
progress**, which is a different proposition and is recorded on [Q483](../open-questions.md) rather
than argued here.

### The predictions

| | verdict |
|---|---|
| **1** (the REACH — the set reaches 80 KB with nothing lost a reader needs) | **MET on the number, BOUNDED on the second half.** 76,500 against 78,848, every member inside its target. *Nothing lost* is measured for the two largest classes and **not discharged for the re-written prose**, because no predicate separates a deletion from a re-wording. The reader read the 2,831 bytes the screen is blind to and found **one homeless live obligation** — which is this prediction's own reversal condition, *an item finding a paragraph with no home*, arriving at one paragraph |
| **2** (`check:markdown` green through every cut) | **REVERSED TWICE, both in `check:markdown:selftest` while `check:markdown` stayed GREEN** — a probe anchored on a link inside the deleted block, and a META entry whose only observer was that file's link count. Right about the floors W112 re-pointed; wrong about the probes anchored on the prose being cut |
| **4** (no rung of L0-L6 moves) | **CONFIRMED.** `check:spec` 7 / 72 / 132 and L1-L5 56 / 1516 unmoved; `src/`, `test/` and `examples/` never opened |
| **5** (removing a copied figure lets a CHECK go too) | **REVERSED for the THIRD consecutive item, and `scripts/**` grew most of all here**: `B6`, `B7`, three probes, three META entries, two SOURCE clauses — all because a reader found two ways to relax a met budget with every clause green. *A copy removed is a check removed only when the copy was the check's subject, and a budget's enforcement was never a copy* |

### Readers

**Both readers ran TWICE, because the author destroyed both their trees the first time**, so this
item contributes **two** measurements to section 6's list — the **SEVENTY-FOURTH and
SEVENTY-FIFTH** — and both are **4**, at the top of the settled 0-4 band.

| pass | conformity | adequacy | overlap | the shared subjects |
|---|---|---|---|---|
| **first** | 22 values derived / 8 disagreed / 6 blocking | **0 mutations** — its tree was destroyed before its first rung, so every finding was DERIVED | **4** | `CLAUDE.md`'s stale record-step list; section 6's ordinal clause losing its list; `doc/README.md`'s undeclared +2,373; the *strictly below the sum / allowance* claim falsified in two documents at once |
| **second** | 38 derived / 10 disagreed / 5 blocking | **19 mutations / 8 SURVIVED / 8 distinct real holes**, with two-route confirmation on the compound one | **4** | `M3`'s margin being ONE and not two; the anchored count being 37; a measured number not re-taken on the shipped tree; and **a clause whose justification the met budget falsified** — `B5`'s counter-example for one reader, ADR 0076 decision 5's *the ONLY guard* for the other, the same shape in two different clauses |
| **total** | **60 / 18** | 19 / 8 / 8 | | |

**The caveat on the FIRST 4 is the sharpest yet recorded for this number, and it is the author's
fault.** W113's seven came from two briefs naming the same obligations and specifics; W114
deliberately differed its briefs and got three; **W115 differed them the same way and still got four,
because the destroyed trees reduced both readers to DERIVED findings.** With no mutation and no rung
available, both were reading the same files, so that measurement is about the corpus rather than
about the briefs. *A measurement whose method was prevented is not a measurement of the method.* **The
SECOND 4 is the real one**: there the adequacy reader mutated and the conformity reader ran rungs, the
briefs differed, and four shared subjects is what that produced.

**One of the conformity reader's figures is NOT adopted**, with the measurement beside it: it reports
a **1.91x** wrong-owner separation over the live-sections cut against the author's **3.33x**, and
neither could reconstruct the other's predicate. Both agree the screen is too thin to carry the
claim — 38 tokens over 26 paragraphs, 56 over 116 owners — which is the conclusion either figure
supports, so the reconciliation is left open rather than resolved by picking one. **And one of the
adequacy reader's is not adopted either**: it measured probe 2's anchored count at 18 where this
item's instrument reads 25, and the reader's is the better one — it staged real copies, where this
instrument only removes files from the scan LIST, so links INTO a stripped directory still resolve.
*That is the same defect class as the instrument's, one level down, and it is why probe 2's figure is
taken from the reader and not from me.*

**The caveat is the sharpest one yet recorded for this number, and it is the author's fault.** W113's
seven came from two briefs naming the same obligations; W114 deliberately differed its briefs and got
three; **W115 differed them the same way and still got four, because the destroyed trees reduced both
readers to DERIVED findings.** With no mutation and no rung available, both were reading the same
files, so this measurement is about the corpus rather than about the briefs. *A measurement whose
method was prevented is not a measurement of the method.*

**And one of the conformity reader's figures is NOT adopted**, with the measurement beside it: it
reports a **1.91x** wrong-owner separation over the live-sections cut against the author's **3.33x**,
and neither could reconstruct the other's predicate. Both agree the screen is too thin to carry the
claim — 38 tokens over 26 paragraphs, 56 over 116 owners — which is the conclusion either figure
supports, so the reconciliation is left open rather than resolved by picking one.

### Questions

**[Q479](../open-questions.md)-[Q485](../open-questions.md) raised**, extending P27's exhausted block
by grep on W86's, W113's and W114's precedent, by the maintainer's answer to stop-and-ask (c).
**[Q466](../open-questions.md) ANSWERED and [Q481](../open-questions.md) RESOLVED**, both moved to
`## Resolved`; **[Q474](../open-questions.md) extended** with its second occurrence. **No ADR** — the
maintainer's answer to stop-and-ask (b). Census **376 / 295 live / 294 open / 1 deferred / 81
resolved**.

## Stop-and-asks — ALL THREE ANSWERED 2026-10-04, each as recommended

| | the question, priced | answer |
|---|---|---|
| **(a)** | **[Q466](../open-questions.md) — does `doc/README.md` stop carrying an item's status?** ADR 0077 consequence 4 left it to the maintainer. Priced: its cut buys **zero budget**, since `check:budget`'s `SET` is three paths and this is not one, so the whole argument is the register's — 489,966 bytes of status nobody is told to read, in a file every item grows. Roads: cut the block and take the file out of the record step; cut it and give the four surviving sections decision 4's treatment too; refuse, and argue the asymmetry ADR 0077 consequence 4 raises | **CUT IT, and `doc/README.md` leaves the record step** — so finishing an item writes FOUR files. The four surviving sections keep their stale counts, as a Q row |
| **(b)** | **A MET budget makes `B3` unreachable alone (section 4, proved by search). Which road?** Priced: **(i)** re-declare the probe as a `B2`/`B3` compound, state the collapse in the check's comment, raise a Q — no change to the check and no ADR; **(ii)** amend ADR 0076 decision 4 so a met budget keeps an allowance at the total, which keeps `B3`'s own case and needs **ADR 0079**; **(iii)** delete `B3` and its probe, which is wrong the moment a fourth member joins the set un-met | **(i).** As recommended, and **no ADR** |
| **(c)** | **P27's id blocks are EXHAUSTED — Q459-Q478 and ADR 0076-0078 all spent. May this item extend them by grep, on W86's, W113's and W114's precedent?** | **EXTEND to Q479-Q485; NO ADR**, since (b) took road (i). As recommended |
