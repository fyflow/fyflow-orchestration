# P8 — What can be deleted with the gate green?

**Status:** **COMPLETE** — declared and completed 2026-09-03
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
- **Renaming or renumbering any check id.** `C5` alone is cited in **seven documents** *(measured at
  W25's declaration: **eight**, and **nine** since W24 — seven is the count with this plan's own file
  excluded. And a bare id is ambiguous: [W20](../work-items/w20-what-a-nested-region-is.md) uses `C5`
  as one of its own probe labels, so a grep for the id finds ten files and two of the matches are a
  different `C5`. The conclusion is unaffected and reinforced.)*; section 3 says
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
   punctuation, replace **each** space with a hyphen* — runs are **not** collapsed. ~~which is the
   whole difference between the two-hyphen and three-hyphen forms above~~

   **That trailing clause is FALSE and is corrected in place at [W25](../work-items/w25-a-link-is-a-link-and-an-anchor-is-an-anchor.md)'s
   declaration, by measuring it.** Four slug rules — the declared one, whitespace runs collapsed,
   hyphen runs collapsed, and punctuation replaced by a hyphen rather than dropped — each report
   **14 dead of 76**. The fourteen are dead under **every** rule, because the link text is a fixed
   string no heading slug produces; collapsing would not hide them. **The conclusion stands** — the
   declared rule is what GitHub does — **and its justification was the wrong one.**

   **What the measurement replaces it with is sharper and shapes the item.** The four rules disagree
   about **134, 140 and 295 of the corpus's 584 headings**, and **not one of the 76 anchor-carrying
   links points at a heading they disagree about.** So the slug rule — the centre of the check — is
   **unfalsifiable against the tree it ships on, in either direction**, and W25's probes have to
   construct the discriminating cases the repository does not contain. *(Thirteenth declaration to
   measure a load-bearing fact first; second time in two plans that it took out the ARGUMENT behind a
   decision rather than a table, after W22 took out one of P7's decisions outright.)*
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
| [**W25**](../work-items/w25-a-link-is-a-link-and-an-anchor-is-an-anchor.md) — **done** | **A link is a link and an anchor is an anchor** | **`scripts/check-markdown.mjs`** (new), **`scripts/check-markdown-selftest.mjs`** (new), `scripts/check-spec.mjs` (W1), `doc/scheduler-upstream.md`, `package.json` | W24 | **L0**, own coverage at L0; L1-L6 as regression; then two readers |
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
| [Q121](../open-questions.md) | dead relative links in `doc/**` and `AGENTS.md` | **W25 — RESOLVED.** `scripts/check-markdown.mjs` holds the lifted `C5` plus `M1`/`M2`/`M3`/`M4`/`M5`, and the fourteen dead anchors are fixed. What the check still cannot see is [Q136](../open-questions.md); what `C5` did not inherit is [Q137](../open-questions.md) |
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

**COMPLETE — 2026-09-03.** Two items, [W24](../work-items/w24-the-gates-own-wiring.md) and
[W25](../work-items/w25-a-link-is-a-link-and-an-anchor-is-an-anchor.md), **five reader passes** (one
of which died mid-run and was salvaged), and `npm run gate` green at **exit 0** throughout.

### Exit artifact — what the gate ACCEPTED at `d8a9ea3` and REFUSES now

Every row is a checked-in probe with a measured cost. **The gate was green for all of them before
this plan.**

| deletion the gate accepted | now refused by | cost then → now |
|---|---|---|
| ` && npm run test:l6:deno` dropped from the `gate` chain — [Q126](../open-questions.md) | `S12` | 0 → 1 |
| any of `lint`, `typecheck`, `test`, `test:deno`, `test:browser`, `test:l6` dropped | `S12` | 0 → 1 |
| an entry **swapped** for another, count unmoved | `S12` | 0 → 1 |
| an entry **added** to the chain and not declared | `S12` | 0 → 1 |
| the chain **reordered**, so L6 runs before L0 | `S12` | 0 → 1 |
| `typecheck:deno` dropped — the only Deno typecheck, `RT-R3`/`RT-R4`'s rung | `S13` | 0 → 1 |
| `build:browser-tests` dropped from `test:browser` — a stale bundle reporting green | `S13` | 0 → 1 |
| `examples/` dropped from `lint`'s arguments — the whole of L6 un-linted | `S13` | 0 → 2, by two independent routes |
| **` --self-test` dropped from a `:selftest` entry** — the check runs and probes nothing | `S11` | 0 → 1. **All four entries had it** |
| `check-source.mjs`'s report showing `ok` on every row of a failing run | the probes' report-row agreement | 0 → all 24 |
| **31 of 62 documents dropped from the markdown walk** — every work item, every plan | `M3` | 0 → 2 |
| `AGENTS.md`, or all of `spec/`, dropped from that walk one at a time | `M1` | 0 → 1 |
| a dead **anchor** anywhere in `doc/**` or `spec/**` | `M2` | 0 → 1 |
| a dead link in `spec/` with `C5`'s implementation lifted out | `C5` | 0 → 1 |
| the slug rule's character class, heading levels, duplicate suffix, or link rendering | the constructed probes | 0 → 1 each |

**And the fourteen dead anchors are fixed** — nine S-ids in `doc/scheduler-upstream.md`'s own index,
**born dead in the founding commit** and never once working, in the file `CLAUDE.md` points at for
upstream wants.

### What the plan answered

*What can be deleted from this repository with `npm run gate` still green?* — **substantially less
than before, and the honest answer is still "a great deal".** The gate chain went from **8 of 15
entries guarded to 18 of 18**, plus the three lists one level down and the markdown corpus. What is
still deletable for 0 is now written down rather than unknown: nine of `check-source`'s thirteen
checks have no probe ([Q132](../open-questions.md)), `check-spec`'s eight have none at all, `C5` can
still pass vacuously ([Q137](../open-questions.md)), and ten markdown shapes are invisible
([Q136](../open-questions.md)).

### Retro — `doc/workflow.md` section 6 pass 3

**Rule 7 (c) is EXERCISED, twice, after five plans unused — and it paid for itself before either
check shipped.** The declared set is what turned two authors' wrong declarations into failures
instead of passes. W24's item file gave probe 7 as `{S11}` and the true set is `{S11, S12}`, reported
as **16/17**. W25 shipped **four probes wrong at birth** — a link that resolved back to itself, an
`M3` probe that emptied the wrong file, two spec probes that also tripped `C8` — **and two more that
could not discriminate at all**, asserting that something *resolves* where the mutation only ever
*added* anchors. **A probe for a clause that makes a check MORE permissive has to assert something is
DEAD.** That is a sharper statement of (c) than the rule carries and it belongs in it.

**Two candidate changes to `doc/workflow.md`, both with one occurrence and a stated argument** —
section 6 pass 3 rule 2's second form. This plan proposes them and does not adopt them, because a
plan should not amend the document on its own evidence alone:

1. **Rule 8 may need a FIFTH obligation: break the WIRING — what happens when the check is NOT RUN.**
   Both of W24's readers independently found the same hole in *the entry that item added*:
   `"check:source:selftest": "node scripts/check-source.mjs"` — drop ` --self-test` and the whole
   self-test never runs, `npm run gate` at **exit 0**. All four `:selftest` entries had it. **Neither
   the author's twenty-four probes nor the item's declared thirteen could reach it**, because every
   one of them asks *what happens when the INPUT is broken*. It is not a clause, not an output row,
   not a provenance and not a bound. The argument for generalising from one item: **rule 8's four
   obligations all assume the check runs**, and this repository's own history says that assumption
   fails — `RT-R4`'s grep was reported as a gate and did not exist (P1's retro), and
   [Q126](../open-questions.md) is the same shape at the chain level.
2. **A check written for a defect you have just fixed has no live case, and its probes are not a
   supplement to its corpus but the whole of its evidence.** W25 has three instances in one item: the
   slug rule (four different rules each reported the same 14 dead of 76, disagreeing about 134-294 of
   584 headings that no link points at); cross-file anchors (**all 76 are same-file, zero
   cross-file**, so a provenance mutation swaps one expression for an identical one — found by a META
   entry coming back *not noticed*, not by a probe); and the file half, which **ships green** at 0
   dead links, so `M1` would pass on an empty implementation. **And the item's own fix then made two
   thirds of the first one false**, which is the part to carry: fixing the defect built the fixture
   that proves the rule, and only a reader noticed.

**[Q102](../open-questions.md) is answered and it reproduced one item later, not one plan later.**
W24 said an owner **moves** it (per-item `Owns`, not standing), **narrows** it (`S12` is equality, so
it cannot go stale the way a floor does) and **multiplies** it (three more floors of the same shape,
two made to fire by a list one level out). W24's Record predicted the ownership half would be settled
by *"the next plan outside P8 that edits the gate chain"*. **It took the next item.** W25 adds two
`check:*` entries; `S12` obliges the literal in `scripts/check-source.mjs`; W25's `Owns`, written from
this plan's index row, predates `S12` and cannot name it. **The direction is the finding**:
`RUN_FLOOR` went stale *silently, toward weakness*; `S12` failed *loudly, toward safety*, naming both
the entry and the file. Same obligation, opposite failure mode.

**On dropping W26 before it started — a healthy use of the declaration step, with one qualification.**
Both defects it would have owned are real, both are measured on their rows, and its one
**irreversible** half was taken outside it (`doc/concept.md` normalised to LF). Nothing was lost that
a later plan cannot pick up, and P8 ran at the size it could finish. **The qualification is that
W26's subject came from the register rather than from this plan's question**, which is the risk the
plan named of itself: *what can be deleted with the gate green* is about checks, and *a tracked text
file's bytes* is about bytes. **The declaration step is where that should be caught, and it was.**
[Q131](../open-questions.md) and [Q123](../open-questions.md) return to the register unowned, and
**Q131's two malformed rows are still unfixed on purpose** so the check that would catch them has a
live defect — joined now by a **third**, [Q135](../open-questions.md), which fails by a different
mechanism.

**What this plan cost, and it is a decision somebody owes.** *(**The ratio below is corrected in place
at [P9](p9-when-a-check-stops-checking-what-notices.md)'s declaration and the correction is a factor
of nearly two: it is 88%, not half.** This paragraph compares **one** self-test against the total and
there are **five**. One timed pass over the gate's own eighteen entries — `check:source:selftest`
23.1 s, `check:markdown:selftest` 129.4 s, `check:scheduler:selftest` 2.0 s,
`check:policies:selftest` 6.5 s, `check:docs:selftest` 45.3 s — is **206.3 s of 234.6 s**, and the
whole product-facing gate is **28 s**. The sentence about the absolutes varying was right and is
reinforced: that run's `check:markdown:selftest` came in at **2m09**, below the band recorded here.
**What was wrong was not the measurement but the comparison**, which is a third shape for this
repository's standing count problem — not stale, not mis-derived, but a correct number answering a
narrower question than the sentence around it claims.)* `check:markdown:selftest` is **2m31 to 3m14** of a **4m46 to 6m00** gate — two runs of the same tree each, so the absolutes vary by a quarter and the **ratio does not: roughly half the gate, either way**, with `check:source:selftest` at 23s. **More than half the gate is now the gate proving its own checks can fail**, and the ratio is the durable number — the first version of this paragraph quoted one gate run as though a duration were a constant.
[Q133](../open-questions.md) raised it and [Q138](../open-questions.md) has the mechanism — a META
entry asserts that *some* probe notices and never *which*, so each one re-runs the whole suite — and
a fix that would cut it by roughly twenty. **Changing what the gate RUNS was declared out of this
plan's scope**, so it is recorded rather than acted on.

**Five reader passes, and one of them died.** An adequacy reader stopped mid-run with no report. Its
harness and logs were salvaged, its candidate survivors **re-verified against the current tree by the
author** — its own verdicts were partly stale — all of them closed, and a replacement was given the
covered ground. **A stopped agent's log is a claim, not a measurement**, and that is the procedural
note this plan adds to section 6.

**No ADR.** 0032 and 0033 were reserved and **both are skipped**, exactly as the plan predicted for
an item that widens a list and an item that lifts a function. **W26 and W27 are skipped and never
reissued; the next plan starts at W28.** **Q139 and Q140 are unused.** **W10 stays HELD** and **W11
stays SKIPPED** for the sixth plan running.
