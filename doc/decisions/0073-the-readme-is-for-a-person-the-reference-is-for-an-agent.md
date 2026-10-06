---
id: ADR 0073
title: "The README is for a person, the reference is for an agent, and CLAUDE.md is for an agent working on the library"
status: accepted
date: "2026-10-02"
item: W107
raised-by: ""
supersedes: ""
amends: ""
resolves: Q438
---

# ADR 0073 — The README is for a person, the reference is for an agent, and CLAUDE.md is for an agent working on the library

**Supersedes:** nothing. **Amends:** what `check-docs`' `X8` and `X10` take as their subject.

## Context

Three documents at the root of this repository had no stated division of labour, and they grew into
each other.

`README.md` was **1101 lines and 117 KB**. Measured at W107's declaration step: 934 of those lines
were the opening plus EIGHT example sections, and the remaining 167 were `The idea`, `The thing to
know before reading the code`, `The one structural idea`, `What is here`, `The hard question, and its
answer`, `Running it`, `Documentation` and `Licence`. Almost all of the BYTES were in three cells of
that tail — the Examples row carrying its own correction history, the ladder row carrying FOURTEEN
superseded values, and one bullet under `Documentation` that was a thousand-word plan history.

**And most of it had a home already.** `doc/concept.md` section 2 carries the substrate fact that
`The thing to know before reading the code` restated — the same blockquote, verbatim. Section 5 is
titled `The one structural idea`, the same words. Section 6 is the join question that `The hard
question, and its answer` answers, citing the same ADRs. `doc/README.md` is 3095 lines of exactly the
status the tail duplicated.

*A reader looking for "how do I run a flow" met twenty-five plans of archaeology first.*

## Decision

1. **Each of the three documents has ONE audience, and the audience decides what belongs in it.**

   | document | read by | holds |
   |---|---|---|
   | `README.md` | a **person** who will USE the library | what it is, install, a few usage examples, how to run the tests, where to read more |
   | `AGENTS.md` | an **agent** USING the library | the extensive reference — every snippet extracted and TYPECHECKED by the gate, and the 32 of 38 tagged `run` also EXECUTED |
   | `CLAUDE.md` | an **agent** DEVELOPING the library | the guidelines, the hazards, ~~the state of the work~~ |

   **The third term was struck on 2026-10-03 by
   [ADR 0077](0077-an-item-does-not-write-its-status-into-claude-md.md) decision 3**, and
   [W114](../work-items/w114-claude-md-is-guidance-and-npm-run-state-is-the-index.md) is what makes
   the cell unambiguously false: that file's `## Current state` block — 532,021 bytes, 93.2% of it —
   is gone, and the state of the work is `npm run state`. *This ADR gave each root document one
   AUDIENCE and did not ask what that audience could not do without, which is
   [P27](../plans/p27-what-a-register-row-is.md) decision 1's question; the strike is recorded here
   rather than left to a reader to infer from a later ADR, because W114's conformity reader found the
   cell still asserting it after the thing it describes had been deleted.*

2. **`README.md` carries no repo status.** No plan history, no work-item ids in prose, no counts that
   track the suite, and no correction archaeology. What it may carry about the project's state is what
   a consumer must know in order to install and run it: that nothing is published yet and what the
   manifests read, which `X9` holds to `package.json`, and **which version of the peer dependency to
   install**, which `check-scheduler`'s `D7` holds to the pin across five documents. *(The enumeration
   named only the first until W107's adequacy reader counted what shipped. The pin sentence is the
   reason `npm run gate:full` came back EXIT 1 on W107's first confirming gate: the item's declaration
   step asked what `check-docs` reads from the README and never asked which checks READ it.)*

3. **The CORRECTION CONVENTION stays, and the root `README.md` is not where it is written down.**
   What this decision removes is twenty-five plans of that convention APPLIED in the front-door
   document, not the rule. *(The first cut of this decision said `README.md` is where the rule is
   stated and that
   [ADR 0029](0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)
   cites it there. **Both halves are false and both readers measured them independently.** The root
   README never stated the convention — zero occurrences of *convention*, *corrected in place*, *used
   to say* or *left visible*, before the change or after; what it carried was the convention
   PRACTISED, in eight parentheticals. And ADR 0029's citation is `` [`README.md`](README.md) ``
   written from `doc/decisions/`, so it resolves to **`doc/decisions/README.md`** — the ADR index,
   which does state the rule, at its own lines 16-23. `check-markdown`'s `M1` is green because that
   target exists, which is why the misreading survived. So this decision's safeguard guarded
   something that was not in its subject, and W107's hazard 6 — *do not delete the correction
   CONVENTION itself* — warned against a deletion that could not happen. A relative link read as if
   it were root-relative, in a decision whose subject is which document holds what.)*

4. **`X8` pairs THREE README sections rather than eight**, and `README_SNIPPET_FLOOR` goes 8 -> 3.
   The three are the basic usage decision 1 gives the README: getting started, a flow that decides,
   and checking a flow before it runs. **This LOWERS a ratchet**, which
   [Q102](../questions/q102.md) exists to make visible and which this repository treats as *how a
   deliverable leaves* — so it is recorded here rather than in a comment, and it is legitimate only
   because decision 1 changes what the floor COUNTS. The mechanism is untouched: every fence the
   README still carries is byte-equal to an executed `AGENTS.md` snippet, both ways.

5. **`X10` loses `README.md` as a subject**, leaving `examples/README.md` as its only one. This is a
   REDUCTION in that clause's coverage and is recorded as one, not as tidying: `X10` exists because
   [Q171](../questions/q171.md) is the row about those counts going stale, and README was one of the
   two places it was built to watch. Decision 2 is why — a count that tracks the suite is status.

## Consequences

1. **README.md is 317 lines and 19 KB**, from **1101** and 117 KB. The three kept examples were SLICED
   out of the old file rather than retyped, so their fences are byte-identical and `X8` confirms it.

2. **Five `X8` pairings and five `X10` probes went with the sections they were about**, and removing
   a subject removed its probes — which left one `X10` clause (*the sentence carrying the counts is
   not where X10 looks for it*) with **no observer at all**, because its only probe was README-side.
   W107 added an `examples/README.md` equivalent. *A smaller universe is not the same as smaller
   coverage, and the difference had to be measured rather than assumed.*

3. **Two probes were anchored on things that were not the clause.** `X9`'s read
   `/\*\*The manifests read/` — incidental BOLD — so it went dead while `X9` itself stayed green,
   because `X9`'s own pattern never required the bold. And the *fence above the first heading* probe
   anchored on `## Getting started` while that was the first heading; with `## Install` above it the
   inserted fence landed in an unlisted section, a sibling clause caught it, and the META entry for
   the clause under test read **STILL CAUGHT** — W29's masking, produced by moving a heading in
   another document. Both re-anchored on what their clause reads.

4. **The unclosed-fence probe's declared SET has now moved in both directions.** It mutates the last
   fence in the reference; from W74 to W101 that belonged to a paired section, so it tripped
   `[X1,X8]` and P19's retro records it going red in a gate entry when the set still said `[X1]`.
   Three pairings make the last fence unpaired again, so the set is `[X1]` — where it was before W74.
   *A declared set that depends on which sections are paired is a claim about the pairing list, and
   rule 7 (c) reported the change both times.*

5. **And the item's own probes found a hole in `X8` that pre-dates it — then took THREE cuts to close
   it, each defeated by a different reader, and `compared` is not what closed it.** `compared` — the
   number of pairings actually compared — was computed and read only by the `note:` line, while the
   floor counts the LIST's length. So narrowing the pairing loop to one entry was **EXIT 0**, and two
   of three sections could stop being compared in silence. *A value computed and never read*, in a
   clause whose subject is a both-ways comparison.

   What ships is **a verdict recorded per pairing on every exit path of the loop**, compared against
   the list as a membership. The three cuts are the finding:

   | cut | defeated by | how |
   |---|---|---|
   | `compared === README_SNIPPETS.length` | `check:docs:selftest` | `compared++` runs on the success path alone, so it fired BESIDE each of the loop's four `continue` arms under the same id and **four `META` gradings read STILL CAUGHT** |
   | the same, guarded by *fire only if nothing else did* | the conformity reader | the guard was **deletable for zero** — and W29's failure-LINE discriminator shows it converted detectable CO-FIRING (2 lines -> 1) into `D5`'s undetectable MASKING (1 -> 1) |
   | the record pushed at the TOP of the loop body | the adequacy reader | a push cannot see a body that does not EXECUTE: one `continue` after it gave `ok X8` at EXIT 0 with zero fences compared, and `compared++` beside it printed *compared 3 … both ways* with nothing compared at all |

   *Every path that skips `compared++` also calls `fail`, so `compared < length` IS* some clause fired
   *— which is why no expression over it can separate this clause from the four it would stand in
   for.* A record on each exit path has neither hole: a neutered `fail` still reaches its own push, so
   each clause stays isolated, and an early exit anywhere reaches none. The five record sites are
   **bound in `check-docs-selftest.mjs`** rather than declared as a ceiling — every `continue` in that
   loop must be preceded by a record, the loop must end with one, and the clause that reads them must
   be present — because the clause itself had **no observer in the shipping lane**: deleting it
   outright left that lane EXIT 0 at 47/47 and 28/28.

6. **A floor that counts a list needs the list to be DISTINCT, and nothing needed to lower this one.**
   W107's adequacy reader duplicated the first pairing, deleted `## Checking a flow before it runs`
   from the README whole — 6554 bytes, one of the three examples decision 4 names — and measured
   `check:docs` EXIT 0, `check:markdown` EXIT 0 and **all forty-seven self-test probes still caught**,
   because no probe anchors on the third pairing. `X8` holds both sides of `README_SNIPPETS` distinct
   now, which is `X11`'s own `duplicated` clause one check along — bought by W96's adequacy reader for
   the same reason, and three kept pairings get the bound forty-one ADR rows already had.

7. **`X10` carried `X8`'s defect and this item edited that block without applying its own fix.**
   Narrowing its `COPIES` loop to one entry was EXIT 0 with the note line simply absent; DELETING an
   entry was EXIT 0 with the note printing *compared 1 copies*, because there was no floor of any kind.
   Decision 5 records taking that list from four entries to two as deliberate and said nothing about
   what stops the next one. It has `COPIES_FLOOR` and a per-entry verdict now.

8. **Re-anchoring a probe onto a SHORTER document can reduce what the probe bounds, and that is not a
   repair.** Consequence 3 records moving two probes off `## The idea` as a fix for their *reason*. The
   old anchor sat at line 935 of 1101, so the scans those probes bound had to reach ~85% of the
   document; `## Install` is line 23 of 311, and W107's adequacy reader measured the consequence — the
   section loop narrows to its first TWO sections and the line scan to the first 30 of 311, both with
   that lane green. Both now anchor at the README's LAST section, which is the whole document again at
   no cost, and is what the unclosed-fence probe already does deliberately on `AGENTS.md`.

9. **Five byte-checked pairings became five UNCHECKED prose pointers, and that is a reduction too.**
   `## More examples` now names `AGENTS.md` *section 16* through *section 20* in prose. All five are
   right today — W107's adequacy reader read the headings — and **nothing holds them**: `AGENTS.md`'s
   section numbers have moved before (13 arrived at W65), and where `X8` compared those five snippets
   byte for byte, a renumbering now silently points a person at the wrong section. Decision 5 records
   the `X10` reduction and consequence 8 the probe-bound one; this one was not recorded at all until
   that reader counted it. Unfixed deliberately: a bound would have to compare prose against headings,
   and the pointers exist precisely because the snippets they replaced are no longer this document's
   to carry.

10. **What is NOT fixed.** W101's adequacy reader measured that lowering `README_SNIPPET_FLOOR` is
   **not caught** by `check:docs:selftest`, where lowering `RUN_FLOOR` is caught by name. So nothing
   stops the next author lowering it again for a worse reason than decision 4's.
   [Q439](../questions/q439.md), raised rather than closed, because the fix is a probe in a 730 s lane
   and this item's subject is the document — though W107's adequacy reader names a cheaper road that
   does not pay the lane: a source-text bound of the kind this self-test already runs on `X4_WIDTH`,
   which is the device the verdict records are bound by in consequence 5.

11. **And decision 2 is a TAUTOLOGY: nothing asserts what the README does not carry.** W107's adequacy
    reader reinstated a `## Current state` section with a plan-history sentence, work-item ids in prose,
    a table of gate figures ADR 0070 withdrew, a correction-archaeology parenthetical, and **a stale L6
    count in the exact sentence shape `X10` used to hold** — 1724 assertions over 58 runs against the
    tree's 2176 / 154 — and `check:docs`, `check:markdown` and `check:scheduler` were all EXIT 0. No
    probe reads any README sentence except the version sentence, so the lane does not see it either.
    Decisions 1 and 2 are therefore a contract a person keeps, not one a check keeps, and the thing
    that would keep it is a `doc/`-style check this repository has refused twenty-four times.
    [Q443](../questions/q443.md).
