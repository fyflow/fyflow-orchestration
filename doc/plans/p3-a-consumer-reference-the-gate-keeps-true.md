# P3 — A consumer reference the gate keeps true

**Status:** **complete** — W9 built, both readers run and acted on, gate re-run, **retro done**
(`doc/workflow.md` is v0.5)
**Question this plan answers:** *What does a consumer actually need in order to use this library —
and can a reference be kept true by the **gate** rather than by discipline?*
**Exit artifact:** `AGENTS.md`, and **every snippet in it extracted and executed by `npm run gate`**.
**Reserves:** W9-W11, Q71-Q80, ADR 0019-0021

**P2 opened alongside this plan rather than before it**, at the maintainer's direction: its work item
was done and its retro still owed when W9 was declared, and the debt was recorded here so it was not
lost. **It is paid** — [P2's retro](p2-the-non-success-half-on-a-real-scheduler.md) made
`doc/workflow.md` v0.4, and this plan's own retro judges v0.4's newest rule.

---

## Why this plan

[Q64](../open-questions.md): **nothing in this repository tells a consumer how to use the library.**
`README.md` is a pitch, `doc/` is a record of how the work was done, `spec/` is normative for *us*,
and `examples/README.md` says in as many words that it is a gate rather than a starting point.
`index.ts` exports **38 names** and no document walks a caller through instantiating a `Driver`.

That was tolerable while nothing was built. It is not now: the layer is complete enough that the
next person to touch it may be a consumer rather than an author.

## The question is the second half, not the first

*"Write documentation"* is not a question and would not earn a plan. **The question is whether a
reference can be kept true mechanically**, and this repository has an unusually strong reason to
care: **eleven of its thirteen reader-passes found a written claim nobody had run.** A hand-written
API reference is that failure mode with a larger surface and no reader assigned to it.

**The sibling has already tried the weaker form and reported the result.**
`../fyflow-scheduler/tests/suites/docs.ts` transcribes each published snippet into a test by hand,
and its own header says why:

> *"If an API changes, these fail and the docs get fixed with the code, **instead of rotting silently
> the way `onCompleteDescendants()` and the benchmark efficiency metric both did**."*

Transcription is better than nothing and it is still a copy kept in step by a person. **Extraction is
not**: if the snippet in the document is the code that runs, a stale snippet is a failing gate rather
than a lie.

## The mechanism, measured before this plan was written

The [ADR 0013](../decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md)
pattern again. A spike, before any of this was declared:

| | |
|---|---|
| fenced blocks tagged ` ```ts run ` and ` ```ts check ` are extracted, written to `dev-dist/`, typechecked together and the `run` ones executed | **works** |
| the bare specifier `from 'fyflow-orchestration'` — **what a consumer actually writes** — is rewritten to a relative path by the extractor | **works**, so the published snippet is realistic *and* runnable |
| `from 'fyflow-scheduler'` needs no rewriting | resolves through `node_modules`, per ADR 0013 |
| Node runs the extracted `.ts` directly | type stripping, no build step |

The spike's first extracted snippet already returned a real value — `validateDefinition` on a
malformed document reporting `FD-V3` — which is the shape the whole plan is for.

## What this plan expects to find, and it is not documentation

**Writing a consumer reference is the first time this library's public surface is described from the
outside.** The likely findings are about the surface, not the prose:

- `index.ts` exports **38 names**; a consumer needs a handful. The rest are internals a reference
  will have to either explain or exclude, and exclusion is a claim about what is public.
- `DriverOptions` requires `createTask`, `workerTypes` **and** `predicates` — a factory the consumer
  writes, plus a list the scheduler already has. A reference has to justify each or report it.
- [Q53](../open-questions.md) is already open on `Driver`'s multi-run surface saying one thing while
  `ID-R3` says another. A reference cannot describe both.

**If the reference is hard to write, that is the finding**, and it goes in the Record rather than
being smoothed over in prose.

## Scope

**In**

1. **`AGENTS.md`** — one file, mirroring the sibling's shape so the three repositories read alike:
   what the library is, a minimal working program, the definition format, decisions, fan-out and
   join, failure and suspension, run state, refusals, common mistakes, and **what does not exist**.
2. **`scripts/check-docs.mjs`** — extract, typecheck, execute. A new L0/L1 clause in `npm run gate`,
   **negative-tested at birth** (`doc/workflow.md` v0.3 section 5 rule 7).
3. **Every snippet tagged**, with `run` the default expectation. A block that is neither `run` nor
   `check` is a prose illustration and **must carry a reason**, because an unchecked snippet in a
   reference is the thing this plan exists to prevent.

**Out** — named rather than left implicit

- **A documentation site, or multiple pages.** One file, as the sibling has. Splitting is a decision
  with no evidence behind it yet.
- **Changing the public surface.** If the reference exposes that `index.ts` exports too much or
  `DriverOptions` asks too much, that is a **finding**, not a refactor: it is W3's surface and it
  would be its own work item.
- **A `LICENSE` file.** `README.md` records that there is none; adding one is the maintainer's, not
  a documentation task.
- **Publishing.** Nothing here is released, and a reference does not change that.

## Work items

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| W9 | The reference and the extractor that keeps it true | `AGENTS.md`, `scripts/check-docs.mjs` | P1, P2's W6 | L0-L1 — every snippet typechecks and every `run` snippet executes; then two readers |

W10 and W11 are reserved and unallocated.

## Record

**Status: complete.** One work item, two reader-passes, retro run. **`doc/workflow.md` is v0.5**, and
it is the smallest retro edit yet: one requirement of one rule replaced, everything else confirmed.

**Exit artifact.** [`AGENTS.md`](../../AGENTS.md) — twelve sections — with **15 snippets extracted,
typechecked against the real `index.ts` and, for the 11 tagged `run`, executed** by `npm run gate`.
`scripts/check-docs.mjs` is five checks (X1-X5) and `scripts/check-docs-selftest.mjs` is **12 probes,
checked in and re-runnable**, which the gate runs immediately after it.

**What the plan answered.** *Yes — and the second half of the question was worth more than the
first.* A reference **can** be kept true by the gate, and the mechanism is stronger than the
sibling's transcription because the snippet in the document **is** the code that runs. What it keeps
true is **about 16% of the document**, which is the number this plan will be remembered for. P3 also
got what it predicted from the first half: writing the surface down from outside produced three
`src/` defects ([Q71](../open-questions.md), [Q72](../open-questions.md),
[Q73](../open-questions.md)) inside the item's own life, two of them from someone trying to *use* the
library rather than test it. **Nothing else in this repository does that.**

**The cost the plan did not predict.** Three defects were absorbed by the prose rather than fixed:
`AGENTS.md` §12 documents a cast for Q71, and §§2, 9 and 10 document Q72 as a hazard. **A reference
that stays true by describing a defect is true and useless**, and that is what [P4](p4-the-drivers-lifetime-and-the-handles-it-gives-out.md)
exists to undo.

---

## Retro

*`doc/workflow.md` section 6 pass 3. **P3 is the first plan whose deliverable is a document rather
than code**, so what this judges is whether the ladder and the two-reader split survived that — plus
the rule-7 amendment W9 caused, and P2's three carried-forward questions.*

**One change adopted, everything else confirmed.** Rule 1 says "no change" is the expected verdict;
P2 adopted three and confirmed four, and treating that as a floor would be measuring this retro's own
output.

### 1. The ladder on a document deliverable — no bending, and one rung that never ran

**Name the rung** (rule 5), for every defect W9 produced:

| defect | rung that should have caught it |
|---|---|
| §2's flagship snippet wrote **three** records for one settlement and stopped its own run | **L1, and `check:docs` *is* that rung — it ran, and passed.** The snippet's assertion could not fail, because `ID-R1` refused the duplicate dispatches before `addTask` counted them. Rule 8's territory exactly |
| [**Q72**](../open-questions.md) — two `Driver`s on one scheduler cross-route | **L2.** A fixture-log routing test with two drivers on one fake scheduler would have caught it in five seconds. **No test in this repository constructs two drivers**, so the rung existed and had no case pointed at it |
| [**Q73**](../open-questions.md) — `onRegionEvent` hands out a live object | **L1.** `OR-R1`'s freezing is a unit test, and the other three outbound paths have one |
| [**Q71**](../open-questions.md) — `SchedulerLike` unsatisfiable under the DOM lib | **L0, in a configuration that had no rung.** L0 typechecks *our* tree under *our* five tsconfigs; nothing typechecked our public types under a **consumer's**. `X5` is the fragment that now does, and it reports rather than fails |
| five false prose claims — *"24 refusals"*, *"no UI can show it"*, the throw/report split, *"one `.ts` worker serves … the browser"* | **none.** The unchecked-`doc/` class. Four of the five are now L0/L1, because W9 moved them into `run` snippets rather than into better sentences |
| the 16% headline itself | **none.** The adequacy reader |
| ` ```typescript `, ` ```TS ` and an indented fence each deleting a snippet from the gate in silence | **none — this is the instrument, not the product.** Rule 7's checked-in probes are the substitute, and they are what found it |
| hand-written `tsc` flags pulling in the DOM lib; `npx.cmd` exiting non-zero with no output | **none.** The instrument again |
| this Record's *"the gate runs `check:docs` third"* (it runs fourth) | **none** |

**Two things this table says that P1's equivalent did not.**

1. **Two of W9's defects had a real rung and were found by a reader anyway** (Q72 at L2, Q73 at L1) —
   the inverse of P1's measurement, where the defects with no rung were the ones the readers caught.
   The rungs were not missing; **no case was pointed at them**, because every test in this repository
   is written by someone testing the library and these two came from someone *using* it.
2. **The ladder needed no bending for a document.** `check:docs` is an honest L0/L1: typecheck, then
   execute and assert. The one place it does not reach is the **runtime axis** — section 4 says
   L0-L5 run in all three runtimes and `AGENTS.md`'s snippets run in **Node only**. That was declared
   (W9's *"still open, deliberately"*), which is what the axis's own rule asks for. **No change.**

**The rung that never ran, and for a document it is the load-bearing one.** L7 is *"a human looks"*.
**Nobody has used `AGENTS.md` to write a program.** Every check here proves the snippets compile,
execute and assert; none proves the document is followable. One occurrence, no evidence either way,
**no rule** — recorded so that if a consumer arrives and gets lost, this paragraph is the second
occurrence.

### 2. The two-reader split on a document — confirmed, and the adequacy reader generalized itself

**Fifth measurement: W4 1/13, W5 3/~35, W6 3/~25, W9 3/~30.** Flat at ~10% and it has not risen. P2's
retro called this settled and it stays settled.

What is new is **how the adequacy reader read a document**. Section 6 defines it as reading *"the
tests"* and mutating *"by walking the rule ids"*. For W9 the artifact and the tests are the same
object, so it mutated **claims**: 110 mutations, and restricted to claim-mutations **75 applied, 70
survived — 93%**. That measurement *is* P3's headline, and the reader produced it with no instruction
to do so. **No change to section 6's wording**: one occurrence, and the method generalized without
help. A word added now would be a rule written from a single sample.

### 3. Rule 7's amendment, judged — two requirements right, one replaced

W9 is rule 7's worked example, so this retro owes it a verdict on all three.

| requirement | verdict |
|---|---|
| (a) **checked in and runnable**, not run once by hand | **Right, and the strongest of the three.** W9's five hand-run probes became twelve, and **seven of the twelve holes were found by the act of making them re-runnable.** Nothing else in this repository has that ratio |
| (b) **each probe asserts that it changed its input** | **Right, and it fired during this retro.** A probe written while measuring (c) matched nothing and reported *"the mutation matched nothing"* rather than passing. It also carries a load a hand-run probe never could: the probes are pinned to `AGENTS.md`'s literal text, so **(b) is what turns probe rot into a red gate** |
| (c) **a probe names which check refused it** | **Right in aim, insufficient as written — replaced. Measured, not argued** |

**The measurement.** Requirement (c) exists because W6's harness read only an exit code, so a
malformed probe was indistinguishable from a caught mutation. Naming the check does not fix that:

```
  garbage inserted into a `run` snippet, declared check: 'X4'   ->  reported CAUGHT
  the same garbage,                      declared check: 'X3'   ->  reported CAUGHT
```

Both, because a snippet that does not parse trips **X3 and X4 together**, and `out.includes('X4: ')`
is satisfied either way. **W6's exact defect survives the requirement written to refuse it** — which
is section 6 rule 3's sharpest shape, and the second occurrence in a second work item.

**The replacement, measured before it was proposed.** A probe declares the **set** of checks it must
trip, and the self-test requires **equality**, not membership. Running all twelve and recording the
set each trips:

| | |
|---|---|
| **11 of 12** trip exactly one check | so the stronger form costs **one** declaration |
| the twelfth is X3's probe, tripping `[X3, X4, X5]` | a legitimate cascade — a snippet that does not compile also does not run and does not compile under the DOM lib. It now says so: `also: ['X4', 'X5']` |
| the malformed probe declared `X4` | now `wanted [X4], got [X3,X4]` — **red** |

**Built, and provoked per rule 8** — the first thing in this repository to be:

| provocation | result |
|---|---|
| re-insert the malformed probe declared as `X4` | `FAIL X4 — exited 1, wanted [X4], got [X3,X4]` |
| delete `also: ['X4','X5']` from X3's probe | `FAIL X3 — exited 1, wanted [X3], got [X3,X4,X5]` — the mechanism refuses a wrong declaration in **both** directions |

**Rule 7 (c) is restated in `doc/workflow.md` v0.5** and `scripts/check-docs-selftest.mjs` is
amended to match, so the worked example satisfies the rule that cites it. **This is the retro's one
adopted change**, and it is deliberately a mechanism rather than a better sentence: rule 3 says a
rule that was *followed* and failed anyway needs replacing.

*Declared beyond the record step: `scripts/check-docs-selftest.mjs` — a retro that adopts a change to
rule 7 and leaves its own worked example failing that rule would be the exact defect class this
repository keeps finding. `git diff --name-only` run by hand (section 7 rule 2) reports that one file
plus the four record-step files.*

### 4. Rule 8 — not applied, and that is the whole report

Rule 8 was adopted **by P2's retro, after W9 shipped**. W9 is one of its three occurrences, not one
of its outings. **Nothing has been built under it**, so there is nothing to judge, and judging it
from its evidence rather than from its use is what rule 1 exists to prevent.

The single data point this retro can add: **its own change was provoked under rule 8** (section 3's
table), and doing so took about four minutes and found nothing wrong. One sample, and a check whose
mechanism was chosen *by* a measurement is the easiest possible case. **P4's retro judges it.**

### 5. P3's real question — is 84% unchecked an acceptable steady state?

**Yes, and the 16% number is the wrong metric.** Stated so the next document does not re-derive it:

1. **16% is a share of lines.** The load-bearing quantity is *claims a consumer would write code
   from*, and W9 moved those rather than guarding the rest: 7 `run` snippets became 11, and four of
   the adequacy reader's twelve blocking claim-classes are now executed — the six-outcome precedence
   table row by row, the `user_action` event pair, a double `resolve()`, the seven error classes §9
   names.
2. **The criterion, which is the transferable output:** *a claim a consumer writes code from belongs
   in an assertion; a claim they read for orientation does not.* Guarding *"`driver.cancel()` does not
   exist"* or *"there are 23 refusals"* costs more than being wrong about either can.
3. **Guarding prose has no mechanism that is not worse than the problem.** P1's retro reached that
   about `doc/`, P2's reached it again and said why; P3 reaches it a third time from the opposite
   direction — from a document that *is* mechanically checked — and the answer does not change.

**What is not acceptable is a different failure, and P3 produced three of them.** The prose absorbed
defects instead of the code being fixed: §12 documents a cast for Q71, and §§2, 9 and 10 document
Q72 as a hazard — *"construct a second `Driver`"* is the library's own error message, and following
it produces the corruption `spec/task-id.md` section 2 exists to describe. **Every one of those
sentences is true, gate-checked where it is code, and an apology.** Rot is what the gate prevents;
**absorption is what it cannot see**, because an accurate description of a defect passes every check
there is. [P4](p4-the-drivers-lifetime-and-the-handles-it-gives-out.md) deletes those words by fixing
the code, which is the only way the gate can ever notice they were there.

**And one thing found while writing this retro, which is new in kind.** `README.md` still says
**"24 validation refusals"** — the exact claim W9's conformity reader corrected in `AGENTS.md`, where
it is now *"23 refusals over the id range `FD-V1` … `FD-V24`"*, `FD-V14` being deliberately absent.
The gate keeps `AGENTS.md` true and **carries nothing to the front door**. This is the fifth sighting
of the unchecked-`doc/` class and the **first where a mechanically-true document sits beside
hand-maintained ones**: the two now disagree, and a reader has no way to see which is which. Fixed in
this Record's record step. **Still not a rule** — both candidate mechanisms remain worse than the
problem — but the class has changed shape, and *divergence* is harder to notice than error.

### 6. Confirmed, no change

- **The verification ladder and the placement of L2, L5 and L6.** Section 1 above; it took a document
  deliverable without bending, and the one axis it could not cover was declared.
- **Two readers.** Fifth measurement, flat. Section 2.
- **`TEMPLATE.md`'s `Outputs` table.** W9's fourth row — *"whatever writing the surface down from
  outside exposes"* — answered *"nothing, and that is honest: a question is not a testable output"*,
  which is the second item to use the table's load-bearing column to make an honest blank rather than
  a claim. Working as P2's retro found it works.
- **Section 1 rule 5's record step** (the plan's Record, `doc/README.md`, `CLAUDE.md`, `README.md`).
  **First outing.** It is exactly what this retro touched, plus one declared file. Nothing to change.
- **The cross-repo id rule (section 3).** Still unproven — no cross-repo citation in P3 either.
  Third plan, nothing learned. Kept. *Recording "no change" three times is what rule 1 is for.*

### 7. P2's three carried-forward questions, answered

| P2 asked | P3 answers |
|---|---|
| **Does `check-owns.mjs` get built, and does it catch anything?** | **Not built.** W10 was reserved by P2 and left unallocated, and P3 declared one item that did not need it. **Unanswered — carried to P4**, which has more files in flight than any item since W5 and is the right place to find out. The by-hand substitute ran here and reported correctly |
| **Does rule 8 change anything?** | **Not applied.** Section 4 |
| **The load-bearing-fact habit — does it become a rule?** | **Still no, and the evidence for a rule keeps getting weaker rather than stronger.** P3's extraction spike was the fourth consecutive occurrence and P4's driver-lifetime spike is the fifth, all unprompted. P2's argument stands: a habit being followed without a rule needs no rule, and the condition that would flip it — an item skipping it and paying — has not occurred |

### 8. What P3 leaves for P4's retro

1. **Does rule 7 (c)'s set-equality form catch anything in a check it did not come from?** P4 adds
   refusals and will add probes. If it never fires there, the requirement was fitted to `check-docs`.
2. **Rule 8's first real outing.** P4 is a breaking change acted on three reader findings, which is
   precisely the shape all three of rule 8's occurrences had.
3. **`check-owns.mjs`.** Third plan of asking.
4. **Does deleting `AGENTS.md`'s three apologies work?** P4 removes prose that the gate cannot see
   is wrong. If the reference comes out *shorter* and the gate stays green, absorption is a cost the
   next document can price. If §§2, 9 and 10 turn out to need different words rather than none, the
   hazard was structural and the retro should say so.
