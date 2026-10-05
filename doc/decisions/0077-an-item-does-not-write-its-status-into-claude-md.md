---
id: ADR 0077
title: "An item does not write its status into CLAUDE.md, and the record step's six become five"
status: accepted
date: "2026-10-03"
item: W112
raised-by: ""
supersedes: ""
amends: ADR 0073 decision 1
resolves: ""
---

# ADR 0077 — An item does not write its status into CLAUDE.md, and the record step's six become five

**Item:** [W112](../work-items/w112-the-budget-the-check-and-the-floors.md), by the maintainer's
decision at that item's record step
**Supersedes:** nothing. **Amends:**
[ADR 0073](0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md) decision 1's row for
`CLAUDE.md`, and `doc/workflow.md` section 1 rule 5's list of the record step's files.

## Context

`doc/workflow.md` section 1 rule 5 names **six** files as part of finishing an item: the plan's
Record, `doc/README.md`, `CLAUDE.md`, `README.md`, `doc/open-questions.md` and `doc/decisions/**`.
That list was last changed by P5's retro, which added `doc/decisions/**` for a measured reason — a
gap in it had blocked a fix.

**The list and [P27](../plans/p27-what-a-register-row-is.md) decision 1 cannot both hold.**
`CLAUDE.md` is **556 KB and 93% `Current state`**, its budget is **25 KB**, and the thing filling it
is this rule: measured over recent commits, the record step added **8497, 8263, 5430, 4515, 5265 and 3624 bytes at six items, and 5522 at P26's RETRO** *(`b6366ce`, 564,176 -> 569,698; re-derived over all 135 commits that touch the file at P27's retro, where the seven had been called seven consecutive items. W103's own record step added 3167)* — W112's conformity reader took those figures to test whether `check:budget`'s
allowance was adequate. W112's own record step added **2502 bytes**, deliberately at the low end, and
it is still 10% of the file's entire future budget spent on one item's status.

*An obligation that fills a document fifteen times faster than its budget allows is not a discipline
problem.*

**And the entry was never the source.** Section 1 rule 5 already says, in the same paragraph:

> And a claim about another item's status is read from that item's own file, never from an index.
> `doc/README.md`, `CLAUDE.md` and a plan's Record all describe items they do not own, and all three
> go stale the moment that item's readers report.

So the rule obliges an item to write a copy into a file, and then tells the next reader not to trust
that copy. **Removing it removes a copy, not information** — which is why this is a smaller decision
than its size suggests, and why it needed measuring rather than arguing: the thing being deleted is
already declared untrustworthy by the rule that requires it.

**Nothing reads it, measured.** Across all nineteen check scripts the only code that touches
`CLAUDE.md` is `check-markdown`'s walk (its membership in the file list) and `check-budget`'s
`statSync` (its size). No clause reads a sentence of it; the two further mentions in
`check-source-selftest.mjs` and `check-spec-selftest.mjs` are comment citations. So a status
paragraph that is never written turns nothing red, and `check:budget` gets greener.

## Decision

1. **An item does not write its status into `CLAUDE.md`.** ~~The record step's files are **FIVE**:
   the plan's Record, `doc/README.md`, `README.md`, `doc/open-questions.md` and
   `doc/decisions/**`.~~

   **FOUR since [W115](../work-items/w115-the-exit-artifact-and-the-budget-met.md): the plan's
   Record, `README.md`, `doc/open-questions.md` and `doc/decisions/**`.** `doc/README.md` left the
   list by the maintainer's answer to [Q466](../questions/q466.md) — the question consequence 4
   below raises and explicitly leaves to a person rather than to the item — and the answer is
   recorded in W115's stop-and-ask (a) and in [P27](../plans/p27-what-a-register-row-is.md)'s
   Record, which is where section 1 rule 3 requires a decision to be. *The cell is struck here
   rather than rewritten, on the precedent decision 3 below sets for
   [ADR 0073](0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md) decision 1: a
   superseded cell is struck where it stands, because an index that contradicts the document it
   indexes does so on precisely the sentence that was just corrected.*

2. **What replaces it is what the rule already named: the item's own file** — and, once
   [W114](../work-items/) ships it, **`npm run state`**, which P27 decision 5 prototyped at 60 lines
   and 0.12 s and which *cannot go stale, because there is no copy to go stale*. Until then the
   source is the item file, which is where section 1 rule 5 has pointed since v0.9.

3. **`CLAUDE.md` keeps the guidance and loses the archaeology, which amends
   [ADR 0073](0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md) decision 1 in one
   cell.** That decision's table gives `CLAUDE.md` *"the guidelines, the hazards, the state of the
   work"*. The third term goes: an agent developing the library needs the orientation, the invariant,
   the working rules, the scheduler facts, the environment and git — and reaches a status from the
   item that owns it. *ADR 0073 gave each root document one AUDIENCE and did not ask what that
   audience could not do without, which is P27 decision 1's question and the reason this amendment is
   an amendment rather than a contradiction.*

4. **This is a MAINTAINER's decision, taken directly rather than through a stop-and-ask**, on
   ADR 0073's own precedent — that decision began the same way, as a correction the maintainer asked
   for. It is recorded here because `doc/workflow.md` section 1 rule 3 is that *a decision not in
   `spec/`, an ADR, or a plan did not happen*, and because without it
   [W113](../work-items/) and W114 read section 1 rule 5 and write to `CLAUDE.md` anyway.

5. **`doc/workflow.md` section 1 rule 5 is edited NOW rather than at W115**, as a declared exception
   on W112, and the edit is the list and a pointer to this decision. The alternative — leaving the
   procedure document naming six files while the practice is five — is the shape this repository has
   recorded most often: *an index that contradicts the document it indexes does so on precisely the
   sentence that was just corrected.* W115 owns that file and may restate the reasoning; it does not
   need to discover the rule.

## Consequences

1. **`CLAUDE.md` is 2502 bytes smaller than it was an hour ago**, because W112's own status paragraph
   was written and then removed under this decision. It is the first item in this repository's
   history not to leave a paragraph there.

2. **`CLAUDE.md`'s `Current state` block is now frozen rather than growing**, which changes what
   W114 is cutting: it inherits a block that stops at P26's retro plus P27's ledger sentence, rather
   than one with three more items' paragraphs in it. **This makes W114 smaller and W113's and W114's
   own record steps cheaper**, and it means the 25 KB budget is reachable by deletion alone.

3. **The staleness is now DELIBERATE, and that is the honest cost.** Between this decision and
   W114's `npm run state`, a session reading `CLAUDE.md` sees a current-state block that stops at
   P26 and says nothing about W112 or anything after it. That is worse than a correct index and
   better than a 519 KB one, and the rule that makes it safe is the one already in force: *read every
   status from the item's own file.* Nothing new is required of a reader.

4. **`doc/README.md` is NOT changed by this decision**, and the asymmetry is deliberate rather than
   overlooked. It is 517 KB of the same material, it is W115's, and the maintainer named `CLAUDE.md`.
   The argument above applies to it in full — it is the *documentation index*, so an index entry is
   arguably its job in a way it is not `CLAUDE.md`'s, and that distinction is worth deciding rather
   than assuming. **[Q466](../questions/q466.md)**, for W115.

5. **It resolves nothing about the budget's membership, and the FOURTH document it names has since
   stopped being one.** `check:budget` holds three paths bound to three paths in a self-test, with no
   authority in any document — that half of [Q465](../questions/q465.md) stands. The other half does
   not: this consequence read *a FOURTH always-read document is still instructed inside `CLAUDE.md`
   itself — `doc/open-questions.md` is read before every work item*, and
   [W113](../work-items/w113-the-register-is-a-reference.md) withdrew that instruction at every site
   that asserted it ([P27](../plans/p27-what-a-register-row-is.md) decision 1), leaving the register
   a reference nobody is told to read. *The sentence named the item that would falsify it, which is
   the direction `doc/workflow.md` v0.15's third clause asks for.*

6. **What this does not do is make the convention checkable.** An item that writes a status
   paragraph into `CLAUDE.md` after this decision turns nothing red, exactly as one that omitted it
   turned nothing red before — the clause that would catch it is a `doc/` check reading English, which
   this repository has refused twenty-five times. *The enforcement is that the record step's list is
   four names long, and the list is read by a person.* *(This read FIVE until P27's retro, against decision 1's own struck cell — an index contradicting the document it indexes on precisely the sentence that was corrected, inside one file.)*
