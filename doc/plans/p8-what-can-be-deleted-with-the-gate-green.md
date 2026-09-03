# P8 — What can be deleted with the gate green?

**Status:** planning — declared 2026-09-03
**Question this plan answers:** *What can be deleted from this repository with `npm run gate` still
green?*
**Exit artifact:** *a table of deletions the gate **accepted** at `d8a9ea3` and **refuses** after this
plan — each one a checked-in probe with a failure count — together with the **fourteen dead anchors
in `doc/scheduler-upstream.md` fixed**, which is the one live defect the declaration step found.*
**Reserves:** W24-W27 (**W24-W25 used; W26 declared and dropped, W27 unused — both skipped**),
Q131-Q140, ADR 0032-0033 (**expected to go unused**)

---

## Why this plan, and why now

**`scripts/**` and `package.json` are in nobody's `Owns`, and that gap has now blocked two checks.**
[P7's retro](p7-is-a-join-transitive-over-nested-fan-out.md) named it and deliberately refused to make
it a `doc/workflow.md` rule:

> *"Rule 7 (c) is unexercised for the FIFTH plan, and P7 declined TWO checks for the same reason:
> `scripts/**` and `package.json` are in nobody's `Owns`. That is v0.7 change 3's shape — a gap that
> blocks a fix rather than hiding an edit — twice in one plan, and it is **a plan's scope** rather
> than this document's."*

**This is that plan.** It owns those paths and discharges what the gap was holding.

**And rule 7 (c) has gone five plans unexercised**, which is the second reason to run it now. A new
check ships with checked-in probes, each declaring the exact **set** of checks it must trip, and the
set must match exactly. Three of the five check scripts have such a self-test — 12, 13 and 14 probes.
**`check-spec` and `check-source` have none at all**: nineteen check clauses whose only negative test
was run once by hand, which is rule 7 (a)'s *"a probe that ran once is a claim about the past"* over a
third of the repository's L0.

### The facts, measured before this plan was written

**Eleven plans have measured a load-bearing fact before declaring and in all eleven it changed what
got written.** Twelfth. **Three of the four register rows this plan turns on were wrong**, and the
fourth defect had no id at all.

| | what the register said | what one command says |
|---|---|---|
| [Q126](../open-questions.md) | *"`test:l6:deno` can be dropped for 0 failures"* | **True, and the hole is wider.** `scripts/check-source.mjs:290` is the only thing in the repository that reads `scripts.gate`, and its loop is `if (!name.startsWith('check:')) continue`. **S11 guards 8 of the gate's 15 entries; 7 are unguarded.** One level down nothing guards the `typecheck` sub-chain, `test:browser`'s `build:browser-tests`, or **`lint`'s directory list** |
| [Q121](../open-questions.md) | *"five dead links, all fixed; two false positives, both illustrations of link syntax"* | **0 dead file links today**, and the false positives are **4, in three files** — one a placeholder rather than an illustration. **And the anchor half is unmeasured and is where the live defects are** |
| [Q123](../open-questions.md) | *"seven files converted to CRLF where `HEAD` is LF throughout"* | ***"LF throughout" is false.*** `git ls-files --eol` reports **161 LF and 1 CRLF**, and the CRLF file is **`doc/concept.md`** — CRLF in the index, in the working tree, and in **all six commits that ever touched it**, back to the founding commit `2936a72` |
| **no id** | — | **`Q119` and `Q71` carry unescaped `\|`.** GitHub splits the cell, so in the file read before every work item Q119 renders its Status as `regions` and its Owner as `^2) with the inner call doubled…`, dropping `open` / `no owner` entirely. **Raised as [Q131](../open-questions.md)** |

**The anchor measurement is the one that changes the plan's shape.** `doc/scheduler-upstream.md`'s
index links to its own nine S-ids, and **all nine are dead** — 14 occurrences over 9 distinct targets.
The headings read `## S2 - Cancel a queued task`, which slugs to `s2---cancel-a-queued-task` (three
hyphens, from ` - `); every link says `s2--cancel-a-queued-task` (two, which is the **em-dash** slug).
`git log -S` shows the headings were ASCII-hyphen in the founding commit, so **these were born dead
and have never once worked** — in the file `CLAUDE.md` points at for upstream wants, and whose
[S9](../scheduler-upstream.md) it calls *"the one live item, ready to raise"*.

**`check-spec`'s `C5` cannot see them**, and not by oversight: it strips `#…` from every target and
compares the file path alone. That is the half of Q121 nobody had measured, and it is where the
defects are.

### What the ladder does not cover, again

**None of the four is reachable from any rung of `doc/workflow.md` section 4.** L0-L6 are commands
over the product; every defect here is in the **wiring that runs those commands** or in the
**documents upstream of them**. That is P1's central measurement — *five defect classes have no rung*
— in the two directories no item has ever owned.

## Scope

**In**

1. **The gate's own wiring.** S11 widened from `check:*` to a **named list** covering the seven
   unguarded entries, and the sub-chains one level down: `typecheck`'s five, `test:browser`'s build
   step, and `lint`'s **directory arguments**.
2. **The first self-test `check-source` has ever had**, because (1) cannot ship without one under
   rule 7 (c).
3. **A link check over `doc/**` and the root markdown**, with `C5`'s logic **lifted rather than
   copied**, code spans blanked, and **anchors resolved**.
4. **The fourteen dead anchors fixed**, which is what makes the check non-vacuous on the day it ships.
**Out** — named rather than left implicit, with where it goes instead

- **[Q123](../open-questions.md) and [Q131](../open-questions.md) — a tracked text file's *bytes*.**
  Declared as a third item and **dropped before it started**, leaving P8 at exactly the two checks P7
  declined. **What was measured stays measured** and is recorded on both rows; what is not built is a
  check. **One half is discharged anyway and outside any item**: `doc/concept.md` is normalised to LF
  in this plan's declaration commit — 221 CRLF pairs removed at the byte level, the result
  **byte-identical to `HEAD` with the CRs stripped**, so no re-encode and no `Get-Content |
  Set-Content` hazard. **That fixes the instance and guards nothing**, which is the honest description:
  `core.autocrlf` is `false`, so an LF file stays LF until a tool rewrites it, and nothing here would
  notice if one did. `.gitattributes` is **not** added — it belongs with the check that would make the
  problem visible rather than hide it, and that check is not being built.

- **A check over `doc/` *claims*.** Six retros have refused this class and P7 refused it a seventh
  time. **P8 takes only the mechanically decidable sub-cases** — a link target that does not exist, an
  anchor that resolves to no heading, a table row whose cell count is wrong, a byte sequence. **A
  false sentence is not in scope and this plan does not reopen that argument.** If an item finds
  itself wanting to check what a document *says*, it has left the plan.
- **Renaming or renumbering any check id.** `C5` alone is cited in **seven documents**; section 3 says
  ids are never reused or renumbered. The lift shares an implementation and `C5` keeps its id and its
  row in `check-spec`'s report.
- **[Q100](../open-questions.md)** — a rendered artifact no assertion reads, now in five files. Named
  so that a link check is not read as closing it; it is about output nothing asserts, not about links.
- **[Q98](../open-questions.md)** — cases counted as assertions. A different noun problem in different
  files.
- **`test:browser:all`.** It is deliberately outside the gate, which is exactly why (1) is a named
  list: *"every `test:*` script is in the chain"* would be **false**.
- **Any change to what the gate RUNS.** This plan makes the gate notice what it already runs. Adding
  firefox and webkit to it is a cost decision and a different plan's.

## Decisions taken before fan-out

**Four, all measured rather than argued.** The items are serial, so this section is short by design —
`doc/workflow.md` section 7 rule 3 binds hardest on parallel work.

1. **`C5` is LIFTED, not copied, and keeps its id.** Measured: adding span-blanking leaves `spec/`'s
   result at **0 → 0**, and `spec/` contains **zero** links carrying an anchor, so anchor-resolution
   is inert there. One implementation serves both directories with no behaviour change to `spec/`.
   `check-spec` still reports `C5 links resolve`, because seven documents cite that id.
2. **The check blanks fenced blocks and inline code spans before parsing.** Measured: **4** false
   positives otherwise. `C5` never needed it because `spec/` prose does not illustrate link syntax;
   `doc/` prose does, and `doc/work-items/TEMPLATE.md`'s `../plans/p_-<slug>.md` shows the phenomenon
   is **placeholders as well as illustrations** — wider than [Q121](../open-questions.md) states, same
   fix.
3. **Anchors are checked.** This is the half with the defects and the half `C5` structurally cannot
   reach. Same-file (`#live`) and cross-file targets both; the slug rule is *lowercase, drop
   punctuation, replace **each** space with a hyphen* — runs are **not** collapsed, which is the whole
   difference between the two-hyphen and three-hyphen forms above.
4. **S11's widening is a NAMED LIST.** [Q126](../open-questions.md)'s own point, and the general form
   is false. **A list is a loop bound**, so it inherits rule 8's fourth obligation: whatever asserts
   the list must fail when an entry leaves it *and* when the whole list leaves.

**Nothing here is architectural, and P8 expects to take NO ADR.** 0032 and 0033 are reserved and
should be reported skipped. The one candidate was the line-endings trade-off — a `.gitattributes`
normalises on the way into git and **hides** the problem in the working tree, while a check that
refuses CRLF makes it **visible** — and **that item is dropped**, so the trade-off is not taken and no
decision is owed. Neither remaining item chooses between architectures: W24 widens a list, W25 lifts a
function. **If either finds itself wanting an ADR, that is a signal its scope grew**, not that the
reservation was needed.

## Work items

**Two, serial, and separated by what they check** — `doc/workflow.md` section 7 rule 1's test rather
than intuition. W24 checks the **wiring that runs the commands**; W25 checks the **documents upstream
of them**. They share `package.json` and nothing else, and they are serial, so rule 2 does not bind;
W25 declares that one file as its exception if its `Owns` is read narrowly.

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| [**W24**](../work-items/w24-the-gates-own-wiring.md) — **done** | **The gate's own wiring**, and the first self-test `check-source` has ever had | `scripts/check-source.mjs` (W1), **`scripts/check-source-selftest.mjs`** (new), **`package.json`** | nothing | **L0**, own coverage at L0; **L1-L6 run as regression and must not move**; then two readers |
| **W25** | **A link is a link and an anchor is an anchor** | **`scripts/check-markdown.mjs`** (new), **`scripts/check-markdown-selftest.mjs`** (new), `scripts/check-spec.mjs` (W1), `doc/scheduler-upstream.md`, `package.json` | W24 | **L0**, own coverage at L0; L1-L6 as regression; then two readers |
**Why W24 first.** It is the only one that can be checked by nothing but itself — a wiring check
inside the script that was dropped cannot fire, which is the argument `check-source.mjs:277` already
makes for S11 living where it does. **W25 adds a `check:*` entry to `package.json` and S11 already
guards those**; running W24 first means the *widened* list is what W25's entry lands in rather than
the narrow one.

**A third item was declared and dropped before it started, and it is recorded rather than deleted.**
W26 was *a tracked text file's bytes* — the register's unescaped pipes ([Q131](../open-questions.md))
and line endings ([Q123](../open-questions.md)) — owning `.gitattributes`, `doc/open-questions.md`,
`doc/concept.md` and a clause in W25's script. **It is out on a scope call, not on a measurement**:
both defects are real and both are recorded on their rows. Its one **irreversible** half was taken
outside it — `doc/concept.md` normalised to LF in this plan's declaration commit — because the file
was wrong today and the check that would have caught it is not being built. **The rest is a check that
does not exist**, and both Qs return to the register with no owner. Named here so a later plan reads
*declared and dropped* rather than *never noticed*.

**Two items is the floor, not a shortcut.** P8's whole justification is the two checks
[P7's retro](p7-is-a-join-transitive-over-nested-fan-out.md) declined for want of an owner. Dropping
below two would leave the gap it exists to close.

**A note on `Owns` and where these blocks come from.** `doc/workflow.md` section 7 rule 2, as amended
by P7's retro: **an item's `Owns` is written from this table's row, never from its title.** The
numbers behind that sentence are five, four, two, zero. Each row above names **every** path its item
edits as a deliverable, including `package.json` where two items need it and the record-step files
where section 1 rule 5 already grants them.

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q126](../open-questions.md) | a runtime droppable from the gate chain for 0 failures | **W24 — RESOLVED.** The chain is 16 of 16 guarded, plus the three composed lists; `S12` compares a declared list to `scripts.gate` both ways and in order, `S13` takes the sub-chains with two clauses derived from `package.json` and from disk rather than from the declaration |
| [Q121](../open-questions.md) | dead relative links in `doc/**` and `AGENTS.md` | **W25** — and its **anchor half**, which the row does not mention and which is where all fourteen live defects are |
| [Q123](../open-questions.md) | nothing fixes line endings and there is no `.gitattributes` | **no owner — W26 dropped.** Its premise is corrected (`HEAD` is **not** LF throughout) and **its one instance is fixed**: `doc/concept.md` is LF from this plan's declaration commit. **The mechanism is unguarded exactly as before** |
| [Q131](../open-questions.md) | the register's own rows render their Status and Owner columns wrong | **no owner — W26 dropped.** Raised and measured by this plan's declaration step; **not fixed**, so Q119 and Q71 still render wrong |
| [Q102](../open-questions.md) | `check-docs`' `RUN_FLOOR` ratchet sits in nobody's `Owns` and went stale silently | **W24 — ANSWERED, not closed.** An owner **moves** it (`Owns` is per-item, not standing), **narrows** it (`S12` is equality, so it cannot go stale the way a floor does — measured by the probe that *swaps* an entry) and **multiplies** it (three more floors of the same shape, two of them made to fire by a list one level out). `RUN_FLOOR` is untouched. What settles the ownership half is the next plan outside P8 that edits the gate chain |
| [Q100](../open-questions.md) | a rendered artifact no assertion reads, in five files | **no owner.** Named so this plan is not read as closing it |
| [Q98](../open-questions.md) | the runner counts `test()` cases, not assertions | **no owner.** Named because every Record this plan writes will quote a count, and the noun stays *cases* |

## A note on ids

**P8 starts at W24 and uses W24-W25.** **W26 was declared in this table and dropped before it
started** — see the work-items section — and **W26 and W27 are therefore skipped and never reissued**,
on section 3's *"gaps are free; renumbering is not"*. The next plan starts at **W28**.

**W10 stays HELD** and **W11 stays SKIPPED** for the **fifth** plan running.
W10 was `scripts/check-owns.mjs`; P4's retro retired it as a proposal and P7's retro kept it retired
on its strongest evidence yet — a sentence took late `Owns` exceptions to zero without a script.
**Taking W10 here would make P2's Record false**, and this plan owning `scripts/**` does not change
that: the reason W10 is held is that the check is not worth building, not that nobody could own it.

**Q ids resume at Q131.** W23 reserved Q126-Q130 and used Q126-Q127, so **Q128, Q129 and Q130 are
skipped and never reissued**, as is **Q125** before them. Q131 is taken by this declaration for the
register's unescaped pipes.

**ADR ids resume at 0032.** P7 reserved 0030-0031 and used 0030, so **0031 is skipped**. **0026 stays
held for [Q97](../open-questions.md)**, for the third plan running — P5 reserved it for the `stuck`
conflation and deliberately did not take it, and neither P7 nor this plan takes it. **0028 stays
skipped.**

## Record

*Filled in at the join, after the work items are merged.*

**Exit artifact.** *Where it is, and how to re-produce it.*

**What the plan answered.** *The question above, answered — including "less than we thought".*

**Retro.** *`doc/workflow.md` section 6 pass 3. "No change" is an expected verdict, and this plan
should expect it: v0.9's four changes are two items old. The one thing it owes a verdict on is
**rule 7 (c)**, which has gone five plans unexercised and which this plan exercises **twice**. It also
owes a note on **dropping W26 before it started** — whether declaring an item and cutting it at the
plan's own declaration is a healthy use of the declaration step or a sign the plan was scoped from the
register rather than from a question.*
