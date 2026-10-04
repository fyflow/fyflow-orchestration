# W107 — The README is for a person who will use the library

**Status:** done — see the Record. An item outside any plan.

```
Spec: NONE expected — no rule moves.
Owns: README.md, scripts/check-docs.mjs, scripts/check-docs-selftest.mjs,
      doc/work-items/w107-the-readme-is-for-a-person-who-will-use-the-library.md
Inputs: the maintainer's framing of 2026-10-02 — README.md is read by a HUMAN who will USE the
        library, AGENTS.md by an agent that needs the extensive reference, CLAUDE.md by an agent
        DEVELOPING the library; and `README.md` currently carries repo status and decision
        archaeology that belongs to none of the three
Outputs: (1) README.md is description, install, THREE usage examples, how to run the tests, and
             links out — and carries no repo status, no plan history and no correction archaeology
         (2) `X8` pairs THREE README sections rather than eight, `README_SNIPPET_FLOOR` 8 -> 3, and
             the lowering is a DECISION with its reason recorded rather than a ratchet slipping
         (3) `X10` loses README.md as a subject — `examples/README.md` becomes its only one, which
             is a measured REDUCTION in that clause's coverage and is recorded as one
         (4) every claim deleted from README is shown to have a home in `doc/` first, and anything
             unique to README is REPORTED before it goes
Depends on: nothing. W106 (workers) is independent
Blocks: nothing
Tests: `check:docs` (X8, X10, X1, X2), `check:docs:selftest`, `check:markdown` (M1/M2 over the
       links README loses)
Gate: check:docs, check:docs:selftest, check:markdown, npm run gate:full
Reserves: W107, Q438-Q443 (EXTENDED from Q438-Q442 at the record step: the readers' findings
          raised two more than the block held, on P11's and P12's precedent of extending rather
          than borrowing), ADR 0073
```

## Why

**The front-door document is 1101 lines and 117 KB, and the material a new user needs is a fifth of
it.** Measured at the declaration step:

| `README.md` | lines | what it is |
|---|---|---|
| 1-934 | **934** | the opening plus EIGHT `## ` example sections, every one held byte-for-byte equal to an `AGENTS.md` section by `check-docs`' `X8` |
| 935-1101 | **167** | `The idea`, `The thing to know before reading the code`, `The one structural idea`, `What is here`, `The hard question, and its answer`, `Running it`, `Documentation`, `Licence` |

The 167-line tail holds almost all of the bytes, in three cells: the **Examples** row carrying its own
correction history, the **L6** row carrying FOURTEEN superseded values, and one bullet under
`Documentation` that is a thousand-word plan history. *A reader looking for "how do I run a flow" meets
the repository's archaeology first.*

**And most of it has a home already.** `doc/concept.md` section 2 is the substrate fact that
`The thing to know before reading the code` restates, section 5 is titled `The one structural idea` —
the same words — and `doc/README.md` is 3097 lines of exactly the status this tail duplicates.

## The three documents, which is the decision

**ADR 0073.** Stated by the maintainer and recorded because `X8` encodes the opposite today:

| document | read by | holds |
|---|---|---|
| `README.md` | a **person** who will USE the library | what it is, install, a few usage examples, how to run the tests |
| `AGENTS.md` | an **agent** using the library | the extensive reference — every section, every snippet executed by the gate |
| `CLAUDE.md` | an **agent** DEVELOPING the library | the guidelines |

`X8` was built when the README was the showcase and pairs all eight of its sections with `AGENTS.md`'s.
Under this contract the README keeps **three** and the floor moves with it.

## What to be careful of

1. **`README_SNIPPET_FLOOR` is a RATCHET and this lowers it, 8 -> 3.** That is the move
   [Q102](../open-questions.md) exists to make visible and which this repository treats as *how a
   deliverable leaves*. It is legitimate here only because the DECISION above changes what the floor
   is counting — and the reason goes in the ADR, not in a comment. **W101's adequacy reader (F12)
   measured that lowering it is NOT caught by `check:docs:selftest`**, so nothing will stop a later
   author lowering it again for a worse reason; that is the residue and it is Q102's own shape.
2. **`X10` loses a subject and that is a coverage REDUCTION.** It holds every current copy of ladder
   L6's counts against `examples/l6.ts`; README carries three of them and all three go. `X10` keeps
   `examples/README.md`, so the clause survives with a smaller universe — but [Q171](../open-questions.md)
   is the row about those counts going stale, and README was one of the two places the check was built
   to watch. Record it rather than let it pass as tidying.
3. **Deleting is not the same as having a home.** Decision (4) is a check, not a courtesy: for every
   claim removed, name the `doc/` file that carries it. The **correction histories** are unique to
   README by construction — they are about README's own staleness — and those go without a home,
   which is a different act from deleting a claim about the library and should read as one.
4. **`check:markdown` M1 and M2 resolve every link and anchor.** Deleting sections removes outbound
   links, which is safe, and could break an inbound anchor. The conclusion holds and for a stronger
   reason than this said: **NOTHING links into the root `README.md` at all**, so neither `M1` nor `M2`
   is at risk and only `M1`'s totals move — 181 relative links to 15. *(This read **exactly ONE inbound
   link exists, ADR 0029's, to the correction convention**. Both readers measured it: the two `](README.md)`
   hits in the tree are both in `doc/decisions/`, so both resolve to **`doc/decisions/README.md`** — the
   ADR index — and neither is a link to this document. `M1` is green because those targets exist, which
   is exactly why the misreading survived. See careful-of 6, which rested on the same mistake.)*
5. **The opening is an `X8` subject, but it is not PAIRED and rewriting its prose is not an `X8` edit.**
   `README_OPENING` is the title of a pseudo-section pushed onto the section list and is NOT in `listed`,
   so the opening is reached by clause (ii) alone: `X8` fails on it only if it gains a ```ts fence.
   *(This said `README_OPENING` **pairs** the text above the first heading and that rewriting it is an
   `X8` edit — false in both halves, measured by the conformity reader from the code. ADR 0073
   consequence 3 states the mechanism correctly; this list did not.)*
6. **Do not delete the correction CONVENTION itself** — *a claim corrected in place, with what it used
   to say* is how this repository works, and what goes is twenty-five plans of applied archaeology, not
   the rule. **The hazard as written was not real**, and both readers found why: this said ADR 0029
   cites `README.md` for the convention, and the root README has never stated it — zero occurrences of
   *convention*, *corrected in place*, *used to say* or *left visible*, before the change or after. What
   it carried was the convention PRACTISED, in eight parentheticals. ADR 0029's citation resolves to
   `doc/decisions/README.md`, which does state the rule, at its own lines 16-23. *So this safeguard
   guarded something that was not in its subject, and no edit here could have deleted it. ADR 0073
   decision 3 rested on the same false premise and is corrected there.*

## Record

**DONE, and [ADR 0073](../decisions/0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md)
gives the three root documents one audience each: `README.md` a PERSON who will use the library,
`AGENTS.md` an AGENT using it, `CLAUDE.md` an agent DEVELOPING it.** `README.md` is **311 lines and
19 KB**, from **1101** and 117 KB.

| | before | after |
|---|---|---|
| `README.md` | **1101** lines, 117 312 bytes | **317 lines, 19 532 bytes** |
| `## ` sections | 17 | **8** |
| ```ts fences | 8 | **3** |
| `X8` pairings, `README_SNIPPET_FLOOR` | 8, 8 | **3, 3** |
| `X10` subjects | `README.md` + `examples/README.md` | **`examples/README.md`** |

What it is now: the title, a two-sentence description, the flow diagram, one paragraph on why the
ordering primitives live here, install, the three examples, pointers into `AGENTS.md` for the other
five, how to run the tests, a five-row documentation table, licence.

### Decision (4): every claim removed was shown to have a home FIRST

| removed | home, verified |
|---|---|
| `The thing to know before reading the code` | `doc/concept.md` section 2 — the same FACT, **better worded there** and not verbatim: the README's was a bold paragraph, section 2's is a blockquote, and it says *their pool has a slot and their resource groups have capacity* where the README said *a worker slot and their resource limits*. *(This cell said **the same blockquote, verbatim** and the conformity reader opened the file: wrong in three ways at once, in a table the item calls a check rather than a courtesy.)* |
| `The one structural idea` | `doc/concept.md` section 5 — the same TITLE and the same blockquote |
| `The hard question, and its answer` | `doc/concept.md` section 6, which names **ADR 0003** as this did. *(This cell said *plus ADR 0025 and ADR 0027* and that file cites NEITHER — `grep` over it returns 0001, 0002, 0003, 0004, 0007, 0014, 0029 and nothing else. The removed section cited 0003, 0025, 0027 and 0037; two of its four decisions have their homes in their own ADRs and in `AGENTS.md` §5 and §9, so nothing is lost and the named home was wrong for half of it.)* |
| `What is here` | `doc/concept.md` section 4, `The three pieces` |
| `Running it`'s gate and self-test tables | repo-development material: `CLAUDE.md` and `package.json` |
| the plan history (ONE bullet, ~1000 words) | `doc/README.md`, which is 3095 lines of it |
| the **correction histories** | **none, and that is the finding** |

*The correction histories are unique to README by construction — they are about README's own
staleness — so they went without a home, which is a different act from deleting a claim about the
library.* What did NOT go is the correction CONVENTION itself, which ADR 0029 cites this document for.

### The three kept examples are SLICED, not retyped

`X8` compares each README fence to an `AGENTS.md` snippet byte for byte, so the three sections were
cut out of the old file by line offset and the fence count asserted on each before writing. `X8`
reports *compared 3 README snippet(s) … byte for byte … both ways*.

### What broke — FOUR, and every one was caught by the LANE rather than by reading

1. **`X9`'s probe was anchored on incidental BOLD.** It read `/\*\*The manifests read/`; the README's
   version sentence stopped being bold when the document became a consumer's, so the probe went DEAD
   while **`X9` itself stayed green**, because `X9`'s own pattern never required the bold. Re-anchored
   on what the clause reads. *A probe anchored on a document's formatting is a probe about the
   formatting* ([Q441](../open-questions.md)).
2. **The *fence above the first heading* probe stopped being about the opening.** It anchored on
   `## Getting started` while that was the FIRST heading; `## Install` now sits above it, so the
   inserted fence landed at the end of an UNLISTED section and clause (ii) caught it on its own — and
   the `META` entry for the clause under test, `X8`'s `README_OPENING` seed, read **STILL CAUGHT**.
   W29's masking, produced by moving a heading in another document.
3. **Removing a subject removed a clause's only observer.** Five of `X10`'s twelve probes were
   README-side, and one was the sole observer of its *the sentence carrying the counts is not where X10
   looks for it* arm. The lane said so loudly — two `META` entries ABORTED with *no probe is named …*,
   rule 7 (c) working — and an `examples/README.md` equivalent was ADDED. Seven of the twelve remain:
   both copies, both directions, the missing declaration, two decoys. *A smaller universe is not the
   same as smaller coverage* ([Q440](../open-questions.md)).
4. **I put a correction on the WRONG one of two adjacent probes.** The note about a declared set
   changing went on *an indented fence, ditto*, which mutates the FIRST fence — still paired, so it
   still trips both. The one that moved is *an unclosed fence*, which mutates the LAST. Rule 7 (c)
   reported it immediately: `wanted [X1], got [X1,X8]` on one and the reverse on the other.

**And the unclosed-fence probe's declared SET has now moved in both directions.** From W74 to W101 the
last fence belonged to a paired section, so it tripped `[X1,X8]` and P19's retro records it going red
in a gate entry while the set still said `[X1]`. Three pairings make it unpaired again, so the set is
`[X1]` — exactly where it was before W74.

### Verification

**Every row is a run against the tree this item SHIPS, and the rows that are not say so.** W105's
largest conformity finding one item ago was a headline figure taken from a run whose lane under test
EXITED 1, so each row below names which tree it is about.

| | |
|---|---|
| `check:docs` | **EXIT 0** — `X8` compares 3 both ways and holds the list DISTINCT, `X9` green on the one status sentence, `X10` green on `examples/README.md`'s 2 copies against 2176 / 154, `X11` 41 rows against 41 ADRs |
| `check:markdown` | **EXIT 0** — and re-run after the register's table was repaired |
| `check:docs:selftest` | see the final gate row. **Three readings are recorded and only the last is about this tree**: EXIT 1 at 24/28 on the first repair (four `META` gradings STILL CAUGHT), EXIT 0 at 47/47 and 28/28 on the second, and EXIT 1 at 25/28 on the third — two probe names this item RENAMED, which rule 7 (b) reported as `ABORT no probe is named …` rather than grading a mutation that never happened, and one `X10` anchor the item's own verdict record moved. All three re-pointed |
| the `X8` and `X10` repairs | measured one edit at a time, restore asserted byte-for-byte after each: control EXIT 0; the loop narrowed CAUGHT; the one-line window CAUGHT; the compound with a faked `compared++` CAUGHT; a duplicated pairing CAUGHT on both sides; the 6554-byte section deletion CAUGHT; `X10` narrowed CAUGHT; an `X10` entry deleted CAUGHT by the floor; **and all five `X8` clauses disabled with their own probes, each contributing ZERO findings from the new clause** |
| the self-test's structural bound | control EXIT 0, and each of the four ways to disable the repair caught BY NAME — the clause deleted, a record deleted, the tail record deleted, `COPIES_FLOOR` lowered |
| rule 8 | **15 probes, 13 as declared, 2 declared ceilings, 0 aborts**, digest identical at both ends — **taken before the readers reported**, so it is a statement about the tree the readers were given and not about this one. The readers' own nineteen mutations and seventy-eight derived values are what this tree was measured by, and the six repairs above are each provoked |
| `npm run gate:full` | **EXIT 1 first**, on `check-scheduler`'s `D7` — a coupling the declaration step did not look for; see below. **FINAL: EXIT 0, zero FAIL lines, all 32 entries, 8/8 self-test lanes ok, digest `7f0aa218cf5723a7` over 436 files IDENTICAL at both ends.** `check:docs` 38 snippets / 32 run, `X8` compared 3 both ways, `X10` 2 copies against 2176 / 154, `X11` 41/41; `check:docs:selftest` **47/47 probes, 28/28 noticed**; L1-L5 **54 / 1446** in node, deno and chromium; L6 **2176 / 154** in both runtimes. *(THREE earlier `gate:full` runs are not counted and the reason is recorded rather than omitted: each was started before an edit landed under it — the `visited` replacement, then the README and `AGENTS.md`, then ADR 0070 and three index files for the workflow change. A whole-tree measurement is taken with the tree HELD STILL, `doc/workflow.md` v0.15 change 2, and three of this item's four gates broke it.)* |

### The item's own biggest finding is in `X8`, and a probe found it

**`compared` was COMPUTED AND NEVER READ.** `X8` counts the pairings it compares and the number was
read only by the `note:` line; the floor above it counts `README_SNIPPETS.length` — the LIST — and not
how many pairs ran. So **narrowing the pairing loop to its first entry was EXIT 0**: two of three
sections could stop being compared with nothing to say so. Found by obligation (d)'s probe `d1`, which
had to be made a COMPOUND first — slicing the loop alone is only observable on a pairing it drops, so
the first version of that probe ran a mutation a different clause caught and survived while saying
nothing about the loop.

*A value computed and never read* is W34's shape, named in `doc/workflow.md` rule 8 obligation (e) —
in a clause whose entire subject is a both-ways comparison.

**And it took THREE cuts, each defeated by a different reader, and `compared` is not what closed it.**
This is the sharpest thing in the item and none of it was the author's:

| cut | defeated by | how |
|---|---|---|
| `compared === README_SNIPPETS.length` | **the lane** | `compared++` runs on the success path alone, so it fired BESIDE each of the loop's four `continue` arms under one id, and `check:docs:selftest` came back EXIT 1 at 24/28 with **four `META` gradings reading STILL CAUGHT** |
| the same, guarded by *fire only if nothing else did* | **the conformity reader** | the guard was **deletable for zero** — identical verdicts with it present and gone — and W29's failure-LINE discriminator shows what it did: detectable CO-FIRING (2 lines -> 1) became `D5`'s undetectable MASKING (1 -> 1). *My comment claimed the guard was bound by those four entries. I never measured that, and it was false.* |
| the record pushed at the TOP of the loop body | **the adequacy reader** | a push cannot see a body that does not EXECUTE: one `continue` after it gave `ok X8` at EXIT 0 with zero fences compared, and `compared++` beside it printed *compared 3 … both ways* with **nothing compared at all** |

*Every path that skips `compared++` also calls `fail`, so `compared < length` IS* some clause fired *—
which is why no expression over it can separate this clause from the four it would stand in for.* What
ships is a **verdict recorded on every exit path** and compared against the list as a membership: a
neutered `fail` still reaches its own push, so each clause stays isolated, and an early exit anywhere
reaches none. Measured, one edit at a time, restore asserted after each — control EXIT 0; the loop
narrowed CAUGHT; the one-line window CAUGHT; the compound with a faked `compared++` CAUGHT; and all
five clauses disabled with their own probes contributing **zero** findings from the new clause.

**The readers DISAGREED about this fix and the disagreement was settled by measurement, not split.**
The conformity reader built the exit-path variant, measured it correct, and then REFUSED it, because
five record sites are a list nothing binds (Q217 times five); the adequacy reader recommended exactly
that variant. What decides it is the DIRECTION each failure takes: a missing record is reachable only
on a tree where its clause is already firing, so it can only add a duplicate line to a run that is
already RED, while the window it replaces was a silent total bypass. *An unbound list that can only
add noise to a failure is a smaller hazard than a one-line window that turns the check off.* And the
list did not have to stay unbound — see the next section.

### The readers — six shared subjects, and every blocking finding was about the repair

**Conformity: 78 values derived independently, 24 disagreed. Adequacy: 19 mutations, 15 survived, 11
real, 8 BLOCKING. Overlap SIX**, outside the settled 0-4 band — with the same caveat W104 recorded,
because both were handed a list naming the new clause and the install question, so their lists
overlapped by the author's own doing. The six: the register's table break, the `D7` readers table, ADR
0073 decision 3, the install command, `MIN_PROBES`' stale comment, and the one-line window.

**What they found that the item had not, each closed and measured:**

| finding | what it cost before | after |
|---|---|---|
| the repair had **no observer in the shipping lane** — `check-docs-selftest.mjs` held zero occurrences of it, every probe mutates a DOCUMENT, no `META` entry anchored on it, and deleting the clause outright left the lane EXIT 0 at 47/47 and 28/28 | **0** | a structural bound on `X4_WIDTH`'s precedent, and the clause's absence is CAUGHT by name |
| the five record sites were a **declared ceiling** that did not have to be one | **0** | the same block requires every `continue` in that loop to be preceded by a record and the loop to end with one — one push deleted: CAUGHT; the tail deleted: CAUGHT |
| **one of the three examples deletable with the whole lane green** — a pairing DUPLICATED takes the length back over the floor, and the reader deleted `## Checking a flow before it runs` whole (6554 bytes) at `check:docs` EXIT 0, `check:markdown` EXIT 0 and **all 47 probes still caught**, because no probe anchors on the third pairing | **0** | both sides of `README_SNIPPETS` held distinct, which is `X11`'s `duplicated` clause one check along; the message names the mechanism — *the floor is satisfied by a duplicate* |
| `X10` carried `X8`'s own defect, **in the block this item edited**, with no floor of any kind — narrowing its loop EXIT 0, deleting an entry EXIT 0 with the note printing *compared 1 copies* | **0** | `COPIES_FLOOR` and a per-entry verdict |
| the **re-anchoring was also a reduction**: two probes moved from line 935 of 1101 to line 23 of 317, so the section loop narrows to its first TWO sections and the line scan to the first 30 of 317, both lane-green | **0** | both anchored at the README's LAST section, which is the whole document again at no cost |
| ADR 0073 decision 2 is a **TAUTOLOGY** — a reinstated `## Current state` with plan history, withdrawn gate figures, correction archaeology and a stale L6 count in the exact sentence shape `X10` used to hold, all three checks green | **0** | NOT closed; recorded as ADR 0073 consequence 10 and [Q443](../open-questions.md) |

**And two defects were in the author's own instruments rather than in the product.** The duplication
probe used `bytes.replace(old, new, 0)` — count zero replaces nothing — so it reported EXIT 0 having
tested **nothing**, which is rule 7 (b)'s class inside the harness; every edit asserts the mutation
differs from the original before applying it now. And the first cut of the self-test's structural bound
held the records and never asserted the **clause that reads them**, so deleting the clause was EXIT 0:
*the author's own hole, one file over, in the bound written to close it.* Both were found by a verdict
rather than by reading.

**The conformity reader also reported a defect in its own instrument**, unasked: its first
`compared`-vs-`reached` build left a stale identifier, so the mutant threw a `ReferenceError` — exit 1
with zero failure lines — and it was one step from reading that as *caught*. This repository's own *a
crash is not a detection*, in the harness measuring it.

### Rule 8 — 15 probes, and the harness was wrong four times

**13 of 15 as declared: 2 green controls, 1 CRASH control right, 1 WRONG-REASON control right, 9
CAUGHT, TWO declared ceilings, ZERO aborts, digest `45cd73df94cb03ed` identical at both ends.**

The two ceilings: **`b1`**, the floor lowered, which is this item's own
[Q439](../open-questions.md) — W101's adequacy reader measured that lowering it is not caught, and
W107 lowered it deliberately, so the next lowering has a decision above it and nothing below it; and
**`d2`**, the unlisted-section loop emptied, which is **inert on the shipped tree by construction**
because every README fence is under a listed heading — `a1` is what binds that clause, by adding an
unlisted one.

**And the harness was the defect four times, which is the part worth carrying:**

1. **It joined EVERY argument to ROOT**, so `--self-test` became `<ROOT>/--self-test` and every
   self-test rung silently ran the plain check. **Four probes read SURVIVED** for it. W105's harness
   carries the `startsWith('scripts/')` guard and this one dropped it.
2. **It matched a probe's reason anywhere in the OUTPUT.** `check-docs` prints
   `note: X8 compared 3 README snippet(s)` when `X8` PASSES, so the WRONG-REASON control read its own
   reason as named and failed — *a reason matched anywhere in the output is matched in the text of the
   clause's success*. Matched on failure lines now, which is v0.24's clause.
3. **Then the failure-line filter excluded the SINGLE-PROBE rung's verdict**, which is an `outcome:`
   line and not a failure. Two probes read *red, wrong reason*. The grader knows which kind of rung it
   is reading rather than widening the filter until it matches anything.
4. **An ABORT read as a wrong reason** — and then, once that was fixed, `d3`'s ABORT (which IS its
   intended catch) read as an abort. The branch now fires only when the probe's own reason does not
   name one.

**Two probes were mis-aimed and both were the author's:** `a2`'s anchor matched THREE times (the bare
import appears once per example, so rule 7 (b) aborted rather than editing the first of several), and
`e1` put a `return` after a `const` that sits inside a BLOCK — a SyntaxError, so the rung crashed and
the verdict was about the crash rather than about the wiring. `e1` is X8's absence from the REPORT now.

**And a probe NAME was typed with a hyphen where the list carries an em dash**, which the rung reported
as `ABORT no probe is named "..."` — the third escaping slip of this session, after two heredocs ate an
escaped newline. *The harness refusing to grade against a name that does not exist is the mechanism
working;* the lesson is that every one of these was caught by a declared verdict rather than by reading.

### The declaration step measured the WRONG READERS, and the GATE found the one it missed

The *What to be careful of* list above enumerates the couplings on `README.md` and it is **incomplete**:
it names `X8`, `X10` and `check:markdown`, because the declaration step grepped for *what `check-docs`
reads from README* and for *inbound links*. It did not ask **which checks read `README.md`** — and one
more does. `npm run gate:full` came back **EXIT 1** on `check-scheduler`'s **`D7`**:

> `D7: README.md states the pin nowhere: nothing matches /is pinned to \*\*(\d+\.\d+\.\d+)\*\* and
> installed from/g. A normative document that has stopped saying which version to install cannot go
> stale, and cannot be read either.`

`D7` holds the scheduler pin to **FIVE** documents and `README.md` is one of them — added by W37's
adequacy reader precisely because *a site with no probe is a site that can leave*. **The sentence
belongs under [ADR 0073](../decisions/0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md)
rather than being an exception to it**: a person installing the library needs to know which peer version
to install, which is consumer information and not repo status. Restored in the Install section, in `D7`'s
own grammar, and that clause is green.

**The gap is closed as a CLASS rather than as an instance — and the first cut of the class was short by
one.** Every `scripts/*.mjs` that names the root `README.md`, enumerated after the failure rather than
before it. *(BOTH readers found `check-docs-selftest.mjs` missing from it, independently. An
enumeration written to close a class by exhaustion is the one place an omission matters, and the file
left out is the one this item edited most.)*

| check | what it reads | state |
|---|---|---|
| `check-docs.mjs` | `X8`'s pairings, `X9`'s version sentence, `X10`'s counts | handled — three pairings, `X9` green, `X10`'s subject dropped |
| `check-scheduler.mjs` | `D7`'s pin statement | **the miss**; restored |
| `check-docs-selftest.mjs` | the root README directly, and nine probes anchored in its text | **the row this table was missing** — the heaviest README coupling in the tree, and this item's own `Owns` file |
| `check-markdown.mjs` | `M1`/`M2` over every link and anchor | green — 174 documents, 7778 links, 459 anchored |
| `check-markdown-selftest.mjs` | the only `M1` probe that covers a ROOT document | anchor survives |
| `check-scheduler-selftest.mjs` | one `D7` probe per site, this being one | anchor survives |

*Asking what a document is FOR is not the same as asking who READS it*, and the second question is the
one a declaration step owes. The gate is what asked it.

### Exceptions — declared

| file | why |
|---|---|
| `scripts/check-docs.mjs`, `scripts/check-docs-selftest.mjs` | in `Owns`: `X8`, `X10` and nine probes are the check side of the decision |
| `doc/decisions/0073-*`, `doc/decisions/README.md`, `doc/open-questions.md`, `CLAUDE.md`, `doc/README.md` | section 1 rule 5's record step |

*`README.md` is itself a record-step file and is this item's subject, which is why it is in `Owns`
rather than taken as an exception.*
