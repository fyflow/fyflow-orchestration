# P27 — What must be read before routine work, and what is archaeology?

```
Question: what must be read before routine work, and what is archaeology?
Items:    W112 (the BUDGET, the check that holds it, and the three floors re-pointed — ADR 0076),
          W113 (doc/open-questions.md: 693 KB -> a one-line register),
          W114 (CLAUDE.md: 556 KB -> its own 37 KB of guidance),
          W115 (the exit artifact: doc/README.md and doc/workflow.md, and the budget MET)
Reserves: W112-W115 — all four issued — Q459-Q473, ADR 0076-0077 (0077 expected skipped)
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
| **W112** | **the budget, the check, and the floors — ADR 0076.** `npm run check:budget`: the always-read set, named as a list, under its declared ceiling, with the per-file figures printed so a reader sees which document is spending. `M3`/`M4`/`M5` re-pointed from high-water marks to what makes `M1` and `M2` non-vacuous. **Nothing is cut in this item** — it makes cutting possible without turning the gate red, which is decision 3 |
| **W113** | **`doc/open-questions.md`: 693 KB -> a 71 KB one-line register that is no longer required reading.** One line per row — id, the question in a sentence, status, owner, closing condition — and the 418 essays go to git. **It is first of the three cuts because it is the biggest single file and the least entangled**: P27's first declaration measured that **every anchor into it targets a HEADING and no citation anywhere points at a ROW** (417 `](#live)`, 34 `](#resolved)`, zero external anchors), so rows may go without breaking one reference. It also retires the *read before every work item* instruction, which decision 1 withdraws |
| **W114** | **`CLAUDE.md`: 556 KB -> 25 KB.** The `Current state` block goes to git; what stays is the orientation, the invariant, the working rules, the scheduler facts, the environment and git — 37 KB today, so **decision 4 has to take a third of what remains**, which is where the 251 copied figures are. **Its one hard part is that the block is the only place some facts are written down** — W107's demonstration, per paragraph. It also ships **`npm run state`** (decision 5) and the two preconditions it needs: a uniform `**Status:` line in all 92 item files and a uniform `Question:` line in the plan headers |
| **W115** | **the exit artifact: `doc/README.md` and `doc/workflow.md`, and the BUDGET MET.** A session's whole required reading, measured, under 80 KB, with `check:budget` green and every rung of the ladder unmoved |

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
