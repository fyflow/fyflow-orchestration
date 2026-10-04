# P27 — What must be read before routine work, and what is archaeology?

```
Question: what must be read before routine work, and what is archaeology?
Items:    W112 (the BUDGET, the check that holds it, and the three floors re-pointed — ADR 0076),
          W113 (doc/open-questions.md: 693 KB -> a one-line register),
          W114 (CLAUDE.md: 556 KB -> its own 37 KB of guidance),
          W115 (the exit artifact: doc/README.md and doc/workflow.md, and the budget MET)
Reserves: W112-W115 — all four issued — Q459-**Q478**, ADR 0076-**0078**
          (0077 was expected SKIPPED and was TAKEN at W112; 0078 is W113's and extends this
          block by grep on W86's precedent, by the maintainer's answer to that item's one
          stop-and-ask. **Q459-Q478 all used: Q459-Q471 by W112 and W113, Q472-Q478 by W114,
          which extended this block by grep on the same precedent and by the maintainer's
          answer to its own stop-and-ask (a) — the highest register row at that point was
          Q471. W114 takes NO ADR, so 0079 is the next free one.** W115 reserves nothing yet)
Baseline: plans to p26, work items to w110, ADRs to 0075, register to Q458. The always-read set is
          2,405,936 bytes / ~601,000 tokens. L1-L5 56 / 1516, L6 2435 / 161, check:spec 7 / 72 / 132,
          check:markdown 181 documents / 8052 links / 473 anchored, census 349 / 273 / 1 / 75
          (8055 was wrong; re-taken by W112 at this plan's own commit)
Declared: 2026-10-03 on `d287dc1`
```

**THIS REPLACES P27'S FIRST DECLARATION, which asked *what IS a row of `doc/open-questions.md`* and is
in git at `d287dc1`.** That plan reclassified rows in place so the count would be honest, and **it
left the text exactly as long** — which the maintainer's restatement of the goal made plainly the
wrong target. The register is one of six documents and 29% of the problem. *A plan that answers a
sub-problem of the one you have is worth replacing rather than running.* Its measurements survive and
are cited below; its taxonomy does not.

## The measurement, and why the instruction is already unfollowable

| file | size | what it is |
|---|---|---|
| `doc/open-questions.md` | **693 KB** | **87% is the 418 row bodies** — mean **1,473 bytes** a row, longest **8,429** |
| `CLAUDE.md` | **556 KB** | **93% is the `Current state` block.** Its orientation, working rules, scheduler facts, environment and git sections are **37 KB** |
| `doc/README.md` | **517 KB** | 40% in lines over 2,000 bytes; the longest single line is **9,710 bytes** |
| `doc/workflow.md` | 304 KB | the procedure, with every retro's full argument inline |
| `AGENTS.md` | 255 KB | the consumer reference, executed by `check:docs` |
| `doc/concept.md`, `README.md` | 37 KB | both already right-sized — `README.md` because [W107](../work-items/w107-the-readme-is-for-a-person-who-will-use-the-library.md) cut it |
| **total** | **2.4 MB / ~601,000 tokens** | **four times a large context window** |

**So `CLAUDE.md` is fifteen times larger than its own useful content and loads into every session, and
*`doc/open-questions.md` is read before every work item* has not been literally followable for
months.** Tree-wide, `.md` is **60%** of ~3.19M tokens; on the test side `examples/l6.ts` is 767 KB
over 11,138 lines at **51% comment** and `src/driver/driver.ts` is **66%**.

**Fact 8 — `doc/workflow.md`'s own contents falsify the reason for keeping its arguments, and that
is what decided stop-and-ask (b).** The file is **297 KB**: the version blocks v0.3-v0.26, which are
the retro arguments, are **153 KB (52%)**; the live sections 1-8 are **118 KB (40%)**; the
adapted-from table 22 KB. The stated reason for keeping the arguments is that *they are what stop a
rule being re-litigated* — and the same file records **23 *for the Nth time* refusals, 63 `REFUSED`
clauses, 14 `doc/`-check refusals and 11 `Owns`-rule refusals.** **The same proposals came back
eleven to twenty-five times each WITH the arguments present.** *The arguments did not prevent
re-litigation; they are the record of it.* What does the job is the one-line ledger, because that is
what lets a retro recognise a repeat instead of re-deriving one.

**And it says where the work is.** Cutting only the version blocks leaves **140 KB, four times over
the 35 KB budget**, so **the live sections lose about 70% too**. Sections 1-8 hold **23 numbered
rules**; a clause plus the one-line finding that earned it is ~4 KB, and the rest of the budget is
the prose those sections genuinely need — the ladder, the three passes, the tables.

## Three decisions, taken at the declaration

1. **The always-read set shrinks by MEMBERSHIP first and by SIZE second, and it is THREE files.**
   The membership was never decided; it accreted. Two of today's six do not belong in it at all:
   **`README.md` is for a PERSON by
   [ADR 0073](../decisions/0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md)**, so it
   was never the agent's required reading, and **`doc/open-questions.md` cannot fit under any honest
   budget** — 418 rows at one line each (id, the question in a sentence, status, owner, closing
   condition) is **71 KB**, which is the whole budget on its own. So the register becomes a
   REFERENCE, read like `spec/` when the row you need is in it, and *the instruction that it is read
   before every work item is withdrawn rather than shrunk.*

   | the always-read set | budget | today |
   |---|---|---|
   | `CLAUDE.md` | **25 KB** | 556 KB |
   | `doc/workflow.md` | **35 KB** | 304 KB |
   | `doc/concept.md` | **17 KB** | 16 KB — already right, and the only one that is |
   | **total** | **77 KB / ~19,000 tokens** | **876 KB** — an **11x** cut on these three, and a **31x** cut on what a session is told to read today |

   **Read when needed, with no budget**: `doc/open-questions.md`, `doc/README.md`, `AGENTS.md`,
   `README.md`, `spec/**`, and every plan and item file. *A document is in the always-read set because
   something cannot be done without it, not because it is important.*
2. **Nothing is archived to a file. The history is GIT.** Every status paragraph, row essay and retro
   argument is already in `git log` and in the item and plan files that own it. **No `*-archive.md`
   is created**, because an archive file is a document `M3` counts and a habit this register has
   re-ballooned from once already. A cut thing keeps a one-line index entry and its commit.
3. **`M3`, `M4` and `M5` are re-pointed BEFORE anything is cut, and that is W112's first act.** They
   are high-water marks — `files >= 142` against 181, `links >= 6225` against **8052**,
   `anchored >= 60` against 473 — so **a 23% prose cut turns `M4` red on correct work.** They exist so
   `M1` and `M2` cannot go vacuous, which needs *enough links to check*, not *more than last time*.
   **This lowers three ratchets and is therefore ADR 0076 rather than a comment** —
   [Q102](../open-questions.md)'s shape at whole-repository scale, with W107's
   `README_SNIPPET_FLOOR` 8 -> 3 as the precedent for when that is legitimate: *the decision changes
   what the floor counts*.

4. **A fact the tree COMPUTES is not written down — the maintainer's point, and it is the largest
   single class of text here.** Measured in `CLAUDE.md` alone: **83 copies of the L1-L5 file/case
   counts, 74 census quadruples, 52 `check:spec 7 / NN / NNN` triples, 34 L6 assertion/run counts and
   8 refusal counts — 251 copies of FIVE figures**, every one a snapshot that was true once. The
   file carries **4,754 bare numbers at 8.6 per KB**; `doc/README.md` is denser still at **9.0**.

   **And the copies are why a quarter of the check surface exists.** Fourteen of 57 clause ids do
   nothing but hold two copies of a derivable fact in agreement — `C2`, `C7`, `C8`, `D3`, `D7`,
   `G2`, `G3`, `G6`, `S12`, `X7`, `X8`, `X9`, `X10`, `X11`. **Deleting a copy deletes the need for
   its check**, so this decision cuts `scripts/**` (952 KB) as well as the documents, and it is the
   reason twenty-five `doc/`-check refusals were all arguing the wrong side: *the answer to a fact
   that goes stale is not a check that compares two copies, it is one copy.*

   **Its limit, stated so no item overreaches it**: a derivation needs somewhere to live. A count in
   a document becomes either a check's output, a one-line index generated from the tree, or nothing —
   never a sentence that says *run this to find out*.

5. **`CLAUDE.md`'s `Current state` block becomes `npm run state`, and it is DERIVED rather than
   archived — the maintainer's suggestion, PROTOTYPED at the declaration rather than promised.**
   That block is 519 KB and its own opening sentence already says *derived by grep off the tree at
   W98's record step, never from this sentence*. **A script makes that true instead of aspirational**:
   **60 lines, 0.12 s**, printing ~25 — the next free `p`, `w`, `ADR` and `Q` ids; each recent plan's
   state read from its OWN file; each recent item's status read from ITS own file; and the live counts
   from the files that declare them (`examples/l6.ts`, `package.json`, the register). *It cannot go
   stale, because there is no copy to go stale.*

   **It earned its place by finding a defect in the hour it was written**: deriving P26's status from
   P26's file disagreed with P26's own sentence, which still read *COMPLETE pending its retro* with
   the retro sitting below it — corrected, and the correction says a script found it.

   **And the prototype found TWO PRECONDITIONS nobody has paid for, which is why this is a decision
   and not a chore.** **Only 13 of 92 item files carry a machine-readable `**Status:` line**, and the
   plan headers' `Question:` line is not uniform either (P25's did not parse). So *a claim about
   another item's status is read from that item's own file* — section 1 rule 5, in force for sixteen
   plans — **is unreadable by anything but a person in 86% of cases.** Making those two lines uniform
   is W114's, and it is a precondition rather than a tidy-up.

   **And a THIRD limitation, found by reading the prototype's own output against the ledger it
   cannot see**: it offers `w111` as the next work item, and **W111 was CLOSED UNISSUED at
   P26's retro**, so the next is `w112`. *An id is never reused, so `max + 1` is wrong exactly
   when a plan has closed one* @@ the script must read the retro's ledger, and a derivation that
   is naive about a convention is a copy with extra steps.

## The method is W107's, and it is the only one with a measurement behind it

[ADR 0073](../decisions/0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md) gave the
root documents one audience each and took `README.md` from **1,101 lines / 117,312 bytes to 317 lines
/ 19 KB — 83%** — and the reason it held is that **what went was shown to have a home FIRST**:
`doc/concept.md` section 2 carried the same blockquote verbatim, section 5 the same words,
`doc/README.md` the plan history. **Every item here owes that demonstration per cut, and
`check:markdown` is what proves no link died.**

## The items

| | |
|---|---|
| **W112** | **DONE.** The budget, the check, and the floors — ADR 0076.** `npm run check:budget`: the always-read set, named as a list, under its declared ceiling, with the per-file figures printed so a reader sees which document is spending. `M3`/`M4`/`M5` re-pointed from high-water marks to what makes `M1` and `M2` non-vacuous. **Nothing is cut in this item** — it makes cutting possible without turning the gate red, which is decision 3 |
| **W113** | **DONE.** `doc/open-questions.md` is **70,254 bytes from 721,528 — a 10.3x cut**, 362 rows one line each, and a REFERENCE rather than required reading. **ADR 0078** and **`M7`/`M8`**: the register is a table, and it is one row per question — the clause this item NARROWED corpus-wide and its adequacy reader priced scoped, at zero. Its finding is that `18eee73` deleted the `## Resolved` table's header and delimiter on 2026-09-02, so **the whole Resolved half rendered as literal pipes for 31 days and 100 commits** with `check:markdown` green — found by BOTH readers and invisible to this item's own instrument, which assumed a header width for a section with no header. Census **362 / 282 / 1 / 79**; Q131, Q135 and Q215 RESOLVED; Q467-Q471 raised. Readers 86 values / 21 disagreed and 39 mutations / 13 real holes, **overlap 7 with the priming caveat**. *Read every status from the item's own file.* |
| **W114** | **DONE.** `CLAUDE.md` is **23,160 bytes from 570,963 — a 24.7x cut**, and the FIRST member of the always-read set to MEET its budget (22.6 KiB against decision 1's 25.0 KiB); the set is **345,928 from 893,682**. The `## Current state` block — 532,021 bytes, 93.2% — is deleted to git and replaced by **`npm run state`** (decision 5). **Two of this row's own figures were wrong and the item corrected them**: *556 KB* was 570,963, and the *251 copied figures* are **343 under a stated per-line predicate and ZERO of them in what stays** — all of them were in the block that goes anyway, so the 34% cut from what remains is the **21 version summaries**, a second and measurably stale copy of this repository's own `doc/workflow.md` blocks. **The precondition decision 5 names measured smaller than it reads**: 7 item files, not 55+, and ZERO plan files once the H1 title counts as a third declared source — writing a question into P18 would have been the author's question and not the plan's. **What it found instead is NINE files whose header contradicted their own Record**, P25, P13, P1, W5, W6, W12, W100, W101 and W112, in the one place section 1 rule 5 names as a status's source. **Its largest defect turned its own confirming gate RED** (`check:markdown:selftest` on `M6`, from one link added to a TEMPLATE) and **its sharpest was found by BOTH readers from opposite ends** (`npm run state` preferring a stale Status LINE over the structural reading it had already computed). `B5` is a new `check-budget` clause and it fired on `doc/concept.md`. **Prediction 2 REVERSED** in a form it does not enumerate; **prediction 5 REVERSED for the second consecutive item**; **prediction 4 CONFIRMED**; prediction 1 ADVANCED with `doc/workflow.md` now 88% of what remains. **No ADR**, and Q472-Q478 extend this plan's exhausted block by grep — both the maintainer's answers. Census **369 / 289 / 1 / 79**. *Read every status from the item's own file.* |
| **W115** | **DONE. The BUDGET IS MET: 76,500 bytes against 78,848, from 893,682 — an 11.7x drop, and this plan's exit artifact.** `doc/workflow.md` is **35,621 from 305,643**, an 8.6x cut, with the version blocks and the adapted-from table deleted to `git` and replaced by a version INDEX and the **REFUSAL LEDGER** stop-and-ask (b) mandates; `doc/README.md` is **51,320 from 538,088** and OUT of the record step, which is now **FOUR** files — [Q466](../open-questions.md), answered by the maintainer and recorded in this plan's Record, with ADR 0077 decision 1 struck in place. **Obligation (d) turned out to be OVER-DETERMINED**: brute-forced over 1..400,000, a met budget admits exactly ONE legal ceiling — the target — and one legal total, so the 4,096-byte allowance ceases to exist and `B3` loses the case `B2` cannot reach ([Q479](../open-questions.md), ADR 0076 decision 4 corrected). **Its sharpest findings are a reader's and the budget did not hold without them**: `B1` COUNTED the always-read set, so a duplicate member dropped `CLAUDE.md` out of it for EXIT 0 and a reported 52,730 bytes; and `B4` bound only the targets' SUM, so targets of 1/1/75 KiB relaxed the whole budget to **876,800 bytes** — this plan's starting size — with every clause green. Both were DERIVED by a reader that could run no rung, confirmed by running them, and closed by **`B6` and `B7`**. **Its two worst defects are the AUTHOR's**: a backgrounded `rm -rf` fired minutes late and destroyed both readers' trees mid-pass, so the first pass ran ZERO rungs and ZERO mutations ([Q480](../open-questions.md)), and `npm run selftests` was then started over a moving tree. `check:markdown:selftest` went EXIT 1 **twice**, both times with `check:markdown` green and both times a probe anchored on prose this item cut ([Q482](../open-questions.md)). **Prediction 1 MET on the number and BOUNDED on the second half** — one homeless live obligation, found by reading the 2,831 bytes no screen can see; **prediction 2 REVERSED twice**; **prediction 5 REVERSED for the third consecutive item**; **prediction 4 CONFIRMED**. Readers 60 values / 18 disagreed; **overlap 4, with the caveat that destroyed trees reduced both readers to derived findings, so the number is about the corpus rather than the briefs**. Q479-Q485 raised, Q466 and Q481 resolved, **no ADR**. Census **376 / 295 / 294 / 1 / 81**. *Read every status from the item's own file, or run `npm run state`.* |

**`AGENTS.md` (255 KB) is OUT and the reason is structural**: every snippet in it is extracted and
executed by `check:docs`, so it is a tested artifact rather than prose, and cutting it is a different
risk. **The code comments are OUT too** and are named as the follow-on plan, because test prose and
document prose fail differently — a deleted comment cannot break a link and can delete the only
record of why an assertion is shaped as it is.

## Predictions

| | prediction | the scope it rests on | what would reverse it |
|---|---|---|---|
| **1** | **the REACH** — the always-read set reaches 80 KB with nothing lost that a reader needs, judged by the ladder and both reader passes | nothing. W107 did this for ONE document at 83%; this asks it of five at ~97%, and no plan has cut a document that another document is told to read before every item | an item finding a paragraph with no home and no reader who can do without it. **W114 is where that is likeliest**, because the `Current state` block is the only written record of some measurements |
| **2** | `check:markdown` stays **green through every cut**, because decision 3 re-points the floors first | the three floors, measured at 181 / **8052** / 473 against 142 / 6225 / 60 — and **`M4` no longer counts links at all**: [W112](../work-items/w112-the-budget-the-check-and-the-floors.md) re-pointed it to documents that CARRY a link, floor **120**, because the before-and-after windows for a link count are DISJOINT ([ADR 0076](../decisions/0076-a-vacuity-floor-counts-what-a-prose-cut-cannot-move.md)) | a fourth counting ratchet nobody enumerated. **W112's job is to find it**, and `RUN_FLOOR`, `README_SNIPPET_FLOOR`, `X10`'s L6 figures and `X7`'s cross-document counts are the candidates |
| **3** | the register's 418 rows fit in **one line each** without losing what a row is for | P27's first declaration: 17% of open rows state a closing condition and 75% have no owner, so **most rows carry less content than their length implies** | a row whose question cannot be stated in a sentence. The five vocabulary rows — Q102 cited in 67 files, Q142 in 59, Q19 in 45, Q179 in 40, Q9 in 35 — are the test |
| **5** | **removing a copied figure lets a CHECK go too**, so `scripts/**` shrinks with the documents rather than growing to police them | decision 4's count: 14 of 57 clause ids compare two copies, and `X7`, `X8`, `X9`, `X10`, `X11` and `C8` have no subject once the second copy is gone | a clause whose two copies are both load-bearing for a different reason — `X8` is the candidate, because it pairs README prose with an EXECUTED snippet, so one side is a test |
| **4** | **no rung of L0-L6 moves** across the whole plan | the cuts are prose; `spec/` is untouched and no assertion reads a status paragraph | any check that reads a document's prose. `check:spec`'s `C4` counts refusals in `spec/`, which this plan does not touch; `X7` and `X10` compare counts across documents it does |

## Stop-and-asks — ALL THREE ANSWERED, so W112 may start

**Two were answered by the maintainer and one by this plan's own prototype**, which is the order a
declaration wants: the questions that needed a person got one, and the question that needed a
measurement got measured. They are kept here struck rather than deleted, because **two of the three
answers are better than any option the question offered**.

| | the question, priced | recommendation |
|---|---|---|
| **(a)** | ~~**Does the `Current state` block leave a one-line-per-item index, or nothing?**~~ **ANSWERED at the declaration, and by the maintainer rather than by this plan: NEITHER — it leaves a SCRIPT.** The question assumed the only choices were a smaller copy or no copy, and decision 5's prototype is a third: 0.12 s, ~25 lines, nothing written down. **~15 KB of budget recovered**, which is 19% of 77 KB | struck, and kept visible because the answer is better than either option it offered |
| **(b)** | ~~**Does `doc/workflow.md` keep the ARGUMENT behind each live clause, or only the clause?**~~ **ANSWERED by fact 8, and against the question's own premise.** The maintainer was undecided and the file settled it: the arguments' stated job is to stop re-litigation, and the file records the same proposals returning 11-25 times each with the arguments in place | **ONLY THE CLAUSE, plus the one-line finding that earned it, its plan id, and a REFUSAL LEDGER of one line per repeat.** The ledger is the part that works; the 153 KB of reasoning is recoverable from the plan files that own it. **This decision is the author's**, taken on a measurement rather than deferred |
| **(c)** | ~~**Is `check:budget` a gate entry?**~~ **ANSWERED YES by the maintainer.** It is the **sixteenth** gate entry, it refuses a commit that grows the required reading, and it costs ~0.1 s reading three files. A budget nobody enforces is how 600k tokens happened | answered |

## Out

**No `spec/` document, no ADR and no test is cut.** `spec/` is the source of truth and is read when
the rule you need is in it, not before every item.

**No item's own file is cut.** They are the source an index points at, and they are read one at a
time, which is the shape this plan is trying to restore everywhere else.

**Nothing is deleted without a home or a commit, and no `Q`, `W`, `P`, `ADR` or `S` id stops
resolving.** Ids are never reused or renumbered; a cut row keeps its line.

**This document does not state its own size, and that is decision 4 applied to itself.** A file's
size is a fact the tree computes. *(It stated one four times in one session @@ 7 KB was a guess,
10,130 was measured, writing that made it 10,333, a bound of 15 KB went stale at the next
revision. An exact self-measurement cannot be stated exactly, because stating it changes it, and
a derivable fact written down is the thing this plan exists to remove.)*

## Record

**COMPLETE on its fourth item, and the question is answered: what must be read before routine work
is THREE documents totalling 75,890 bytes, and everything else is archaeology reachable from the
file that owns it or from `git`.**

| | |
|---|---|
| the always-read set, at this plan's declaration | **893,682 bytes** |
| on the tree W115 ships | **75,890 — an 11.7x drop, and `check:budget` reports every member MET** |
| `CLAUDE.md` | 570,963 -> **23,754** (W114, plus W115's record-step correction) |
| `doc/workflow.md` | 305,643 -> **35,621** (W115) |
| `doc/concept.md` | 17,125, never over |
| `doc/open-questions.md`, withdrawn from the set entirely | 721,528 -> **76,207**, and a REFERENCE (W113) |
| `doc/README.md`, which was never in the set | 538,088 -> **50,495** (W115, Q466) |

**The four items.** W112 made cutting possible without a red gate (the budget, the check, three
floors re-pointed, ADR 0076 and 0077). W113 took the register to one line per question and out of the
required reading (ADR 0078). W114 took `CLAUDE.md` to its budget and replaced its status block with
`npm run state`. W115 took `doc/workflow.md` to its budget, `doc/README.md` out of the record step,
and the budget to MET. *Read every status from the item's own file, or run `npm run state`.*

### The decision this plan is the authority for

**[Q466](../open-questions.md) is ANSWERED: `doc/README.md` stops carrying an item's status, and the
record step is FOUR files** — the plan's Record, `README.md`, `doc/open-questions.md` and
`doc/decisions/**`. **The maintainer was asked at W115 and decided it**, which
[ADR 0077](../decisions/0077-an-item-does-not-write-its-status-into-claude-md.md) consequence 4
explicitly left to a person rather than to the item, and that ADR's decision 1 is struck in place to
point here. It is recorded in a PLAN because section 1 rule 3 says a decision not in `spec/`, an ADR
or a plan did not happen — and because W115's conformity reader found the strike citing this section
before it existed.

**The argument is the register's and not the budget's.** `doc/README.md` is not in `check:budget`'s
set, so its 489,966-byte status block cost a session nothing it was told to read; cutting it bought
**no budget at all**. What it bought is that 490 KB of status nobody is instructed to read has stopped
growing by one paragraph an item. **89 of 89 of its status blocks summarised a file that still exists
and still carries its own Record or Retro**, measured with a wrong-owner control before the cut, and
the only region with no owning file was its own two-word heading.

### The predictions

| | verdict |
|---|---|
| **1** (the REACH — the always-read set reaches 80 KB with nothing lost a reader needs) | **MET on the number and BOUNDED rather than clean on the second half.** 75,890 against the 80 KB the prediction names, and every member inside its own target. *Nothing lost* is discharged for the two largest classes by measurement — 104 of 105 `CLAUDE.md` status blocks, 89 of 89 `doc/README.md` blocks, 116 of 117 ids cited in `doc/workflow.md`'s live sections, each against a wrong-owner control — and **not** discharged for the re-written prose, because no mechanical predicate separates a deletion from a re-wording ([Q483](../open-questions.md)). W115's conformity reader read the region the screen is blind to and found **one genuinely homeless live obligation** in 2,831 bytes of removed text that cites no id. *The prediction's own reversal condition was "an item finding a paragraph with no home and no reader who can do without it"; one paragraph, found by reading, is the honest verdict* |
| **2** (`check:markdown` stays green through every cut) | **REVERSED twice more, both times in `check:markdown:selftest` while `check:markdown` stayed GREEN.** W114 reversed it on `M6`, a RELATION rather than a counting ratchet, from a link ADDED. W115 reversed it twice: a probe anchored on a link inside the deleted block aborted under rule 7 (b), and a META entry graded STILL CAUGHT because its only observer was `doc/README.md`'s link COUNT — at 50 KB no floor moves, since `M4` counts source documents since W112. **So the prediction was right about the floors W112 re-pointed and wrong about the probes anchored on the prose being cut**, which ADR 0076 decision 3 handed forward after counting thirty of them. [Q482](../open-questions.md) |
| **3** (the register's rows fit in one line each) | **CONFIRMED at W113**: 362 rows at one line, 70,254 bytes from 721,528, and the five vocabulary rows the prediction named as the test all fit |
| **4** (no rung of L0-L6 moves) | **CONFIRMED across all four items.** `check:spec` 7 / 72 / 132 and L1-L5 56 / 1516 unmoved at every step; `src/`, `test/` and `examples/` never opened. *What moved instead is the self-test lanes, which are not rungs of section 4 — prediction 2's subject* |
| **5** (removing a copied figure lets a CHECK go too) | **REVERSED for the third consecutive item, and `scripts/**` GREW every time.** W113 and W114 recorded it; W115 added `B6`, `B7`, three probes, three META entries and two SOURCE clauses, all because a reader found two ways to relax a met budget with every clause green. *A copy removed is a check removed only when the copy was the check's subject — and the budget's enforcement was never a copy* |

### What this plan taught

1. **A budget is MET by arithmetic, and the arithmetic takes the slack with it.** When the last member
   comes inside its target, the per-file ceilings, the total ceiling and the total target collapse onto
   one number: the allowance ceases to exist, `B3` loses the case `B2` cannot reach, and what a member
   has to spend is target-minus-measurement. ADR 0076 decisions 4 and 5 are corrected in place and
   [Q479](../open-questions.md) records it. *The obligation each item inherited — "lower the ceiling to
   your own post-cut measurement" — is not satisfiable at the last member, and W114's setting of
   `CLAUDE.md`'s ceiling to its target was that arithmetic one item early.*
2. **A check that enforces a budget can be relaxed without touching a size.** `B1` counted the
   always-read set where obligation (d) says name the members, and `B4` bound only the targets' SUM, so
   the allocation was free: measured, `[concept, workflow, concept]` dropped `CLAUDE.md` out of the set
   for EXIT 0, and targets of 1/1/75 KiB relaxed the whole budget to 876,800 bytes — back to this
   plan's starting size — with every clause green. **Both were found by a reader that could run no rung
   at all**, and `B6` and `B7` close them. [Q481](../open-questions.md)
3. **The method's instrument has a blind region, and it is the region the method is most about.**
   W107's demonstration works on a document whose text is DELETED and not on one whose text is
   RE-WRITTEN: a line-exact diff counts a re-flow as a deletion, a sentence-exact one counts a
   re-wording, and only reading separates them. [Q483](../open-questions.md)
4. **Two always-read documents can contradict each other and nothing says so.** `CLAUDE.md` and
   `doc/workflow.md` disagreed about the record step's own list for the length of one item;
   `check:budget` measures bytes. Both readers found it independently, and it is the first shared
   subject of an overlap of four. [Q485](../open-questions.md)

*Its retro is the next thing due, and it is where the two `M3`/`M5` margins, the refusal ledger's
first use and the reader-pass overlaps belong.*
