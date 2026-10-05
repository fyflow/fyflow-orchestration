# W54 — What a result may be, and what bounding it would cost

**Status:** done
**Plan:** [P15](../plans/p15-what-a-run-retains-and-what-a-result-may-be.md)

```
Spec:       spec/outcome-record.md section 4 (OR-R2 - why `result` is the
            exception, what it costs, and what it is not) and OR-R6
Owns:       spec/outcome-record.md, src/fold/**, test/fold/**,
            test/definition/**, doc/decisions/0047-*.md
Inputs:     P15 facts 6 and 7, read from the PLAN's own file and RE-RUN from
            dev-dist/p15/clone.ts and dev-dist/p15/facts.ts rather than
            transcribed. W53's ADR 0046 - what a run retains, which is what
            decides how much a result costs. ADR 0007 (which did NOT want a
            deep copy), ADR 0037 rule 1, W46's method finding.
Outputs:    (1) Q22 DECIDED - is a cloneable result a constraint on workers or
                on the driver - as ADR 0047 or as a recorded decision with no
                ADR, on prediction 3's verdict
            (2) spec/outcome-record.md section 4 carrying the RE-TAKEN numbers
                with their METHOD, on W46's Q190 precedent
            (3) the SILENT lossy case written down - a class instance clones
                and arrives as a plain object with no error
            (4) the price of bounding RunState.nodes[*].result, measured
                rather than argued, with the surface named
            (5) an L1/L2 assertion of the cloneability boundary in BOTH
                directions - what is refused and what is silently changed
Depends on: W53
Blocks:     W55
Tests:      expected values from spec/ and from the ADR. A timing is not an
            assertion: what is asserted is the BOUNDARY (refused / cloneable /
            lossy) and the SHAPE of the cost, never a millisecond count -
            Q179 says wall time here is not reproducible.
Gate:       L0-L6, then spec-conformity pass (two readers)
Reserves:   Q238-Q242, ADR 0047
```

## Scope

**In**

1. **[Q22](../questions/q22.md), decided.** Its row says *"what it now needs is a decision about the
   CONSTRAINT rather than a measurement"* — the measurement arrived with
   [W34](w34-what-a-branch-receives-and-what-a-join-carries.md) and P15 re-took it. The decision is
   whether *a result must be structured-cloneable* is a constraint on **workers** (declare it, refuse
   at the boundary) or on the **driver** (copy it, and wear the cost).
2. **Re-taking the numbers with their method, and saying so.** Fact 6: Q22's row quotes 1.50 /
   2207.94 / 2.29 / 7.99 ms; one case per process the same measurements are **0.64 / 516.77 / 0.02 /
   1.54 ms**. The conclusion is unchanged and the ratio class holds; **every absolute is 2-5x lower**,
   because W34's were taken accumulated in one process and W46 later measured that at up to 4.4x.
   *A register row quoting an absolute is quoting a method*, and the method goes in the document on
   [Q190](../questions/q190.md)'s precedent.
3. **The silent lossy case, which no rule anywhere names.** Fact 7: `structuredClone` **refuses** a
   function, an object holding one, a `Symbol`, a `Promise` and a `WeakMap`; it **accepts** a plain
   object, a `Map`, a `Date`, a cyclic object — and **a class instance, which arrives as a plain
   `Object` with its prototype and methods gone, `instanceof` false, and no error and no report.**
   `OR-R6` makes the loud case a run failure; nothing at all is a rule about the quiet one.
4. **The price of bounding `RunState.nodes[*].result`** — fact 7's other half. 89% of the corpus's
   task nodes are named by no `needs`, so *drop a result no reference can name* is decidable **from
   the document**; and it is **not free**, because blanking every result takes the fold's input from
   13984 B to 1612 B **and changes what `RunState` reports**. Priced here, with the public surface
   named. Taking it is the maintainer's call (P15's stop-and-ask list).

**Out** — named rather than left implicit, with where each goes instead

- **Taking the bound.** This item **prices** it. P15 decision 1 says a candidate that changes what a
  consumer reads belongs in an ADR with the surface named and is the maintainer's; the stop-and-ask
  list is where it goes.
- **[Q186](../questions/q186.md)'s threshold** — *how large is too large*.
  [W46](w46-what-a-reference-costs-and-whether-anything-says-so.md) decided **nothing warns** and left
  it open deliberately. **Not reopened.** If this item's decision makes that row answerable, **say so
  in the Record rather than acting on it** — reopening a row whose status reads *decided* is section 6
  pass 3 rule 1's *measuring your own output*.
- **Changing `OR-R2`'s deep copy or `OR-R6`'s refusal.** Prediction 3 says both stand. If the evidence
  says otherwise, that is a weakening of a `spec/` rule and it is on P15's stop-and-ask list.
- **What a run retains** — W53's, and this item's `Depends on`.
- **[Q9](../questions/q9.md)** — predicate purity. The *"a worker must not retain what it returns"*
  alternative in Q22's own row is the shape Q9 already rejected as unenforceable; cited, not reopened.

## Verification

How each clause of `Gate:` is actually run. Name the commands.

| clause | command |
|---|---|
| L0 | `npm run lint` and `npm run typecheck`. **A rung reported GREEN means its command EXITED 0** (section 4, v0.15) |
| L1-L3 | `npm test`, `npm run test:deno`, `npm run test:browser:all`. The cloneability boundary is asserted in **all five runtimes**, deliberately: fact 7 was measured in Node 24 alone, and that is prediction 3's stated way of being wrong |
| L4 | `npm run check:spec` — and `C8` compares `spec/README.md`'s version row against `spec/outcome-record.md`, which this item bumps |
| L5, L6 | `npm test` (the matrix) and `npm run test:l6` / `test:l6:deno` as regressions this item must not break |
| conformity reader | spec first, code second, **re-deriving the re-taken timings independently** — fact 6 is the case where an author's number was reproduced by nobody for four plans |
| adequacy reader | **in an isolated copy**, with the author's tree held still (section 6, v0.15) |

**Routing coverage**: **not applicable**. This item touches the outcome-record boundary and the fold,
and routes nothing. `user_action` ([Q17](../questions/q17.md)) is the one exception worth naming —
`OR-R2`'s guard is `terminalState === 'done' ? structuredClone(d.result) : null`, so a `user_action`
settlement carries no result to clone, and the resolution path (`spec/outcome-record.md` section 6)
deep-copies for the same reason. Both are asserted.

**Before this item is done it greps the tree for `W54`** outside `doc/` — section 1 rule 5's third
direction. At this declaration that returned **0** hits; at the record step it returns **13**, three of which are sentences this item completing made false. See the Record.

## Record

**Gate — what ran.** Every rung's verdict is its command's EXIT CODE (`doc/workflow.md` section 4,
v0.15); the counts beside them are the secondary signal.

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **RAN — green** | `npm run lint` exit 0, `npm run typecheck` exit 0 |
| L1-L3 | **RAN — green**, at the SECOND attempt | **27 files / 703 cases** in node 24.20.0, deno 2.9.6, chromium, firefox and webkit, `EXIT 0` in each. The three-way boundary runs in **all five**, which is prediction 3's own stated way of being wrong checked rather than assumed. **The three browsers were RED for two reported-green runs** — see *What broke* |
| L4 | **RAN — green** | `npm run check:spec` — `spec/` is **7 documents, 44 examples, 92 rules**, from 91: `OR-R11` and `OR-R12` are the two added. `C8` compares `spec/README.md`'s row against `outcome-record.md`'s own v0.9 header |
| L5, L6 | **RAN — green**, as regressions | the matrix inside `npm test`; **L6 unmoved at 942 / 42** in both runtimes |
| conformity reader | **RAN** | **15 findings, 6 blocking** |
| adequacy reader | **RAN** | **41 mutations, 17 survivors, 6 blocking**, in an isolated worktree at `../fyflow-w54-adequacy` with copied `node_modules`, zero links, verified green before it started |
| rule 8 | **RAN** | **30 probes, 21 caught, 9 declared ceilings, 0 aborts, 0 against declaration.** The readers' own edits are in the set **from the start** — both reported before the author's set was written, so v0.8's re-run requirement is met by construction. Every file compared back byte-identical after every probe |
| `npm run gate` | **RAN TWICE. First `GATE EXIT=1` with ZERO `FAIL` lines; then `GATE EXIT=0`** | 15 chain entries, both taken with the tree HELD STILL — digest before and after identical each time. The first is the finding, not the second |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| **(1) Q22 decided** | yes — **`OR-R11`**, and **no ADR** | Renumbering the rule row costs **1** `check:spec` `C2` failure; the version not reaching `spec/README.md` costs **1** `C8` |
| **(2) the re-taken numbers with their METHOD** | yes, section 4 | **0.** Declared ceiling, and the item's own `Tests:` line says so — *a timing is not an assertion*. `X6` compares cost figures between `spec/flow-definition.md` and `AGENTS.md` and does **not** reach this document, so the new table has no cross-document binding of any kind ([Q242](../questions/q242.md)) |
| **(3) the silent lossy case written down** | yes — the 27-row boundary table, and `AGENTS.md` section 10 | Deleting a lossy row costs **1**; untagging the `AGENTS.md` snippet costs **1** `X4`; changing its subject to a literal costs **0** (ceiling, measured — see below) |
| **(4) the price of the bound** | yes, section 4 | Changing the 14 / 124 / 89% split costs **1** — it is **derived from both corpora** by this item's own suite, not a literal |
| **(5) the boundary asserted BOTH ways** | yes, 27 rows in five runtimes | One row leaving costs **2**; the whole list **an abort**; slicing the assert loop **1**; the suite renamed out of the glob **1**; a member leaving the census **1** |

**What broke.**

**Both blocking clusters are in the two places this item argued hardest, and the second is this
section's own sentence broken inside the section.**

**THE ENUMERATION DID NOT CLOSE.** *"Right on 14 of 14 shapes … and on none of the eight this
document blesses"* — 8 + 4 is not 14, and **four documents carried four different sets**: section 4
named eight faithful shapes, [Q22](../questions/q22.md) ten, the harness ten again but a different
ten, and [Q238](../questions/q238.md) five lossy categories where the harness ran four. Worse, *"it
fires on every lossy one"* was **false against the table's own nested row**, two paragraphs from the
sentence saying the detector is blind to exactly that. **And the suite's classifier WAS that blind
predicate** — so the table and the suite disagreed, and the disagreement was invisible because the
suite defined the oracle.

**AND "FAITHFUL" NEVER CHECKED THAT THE VALUE CROSSED.** It meant *did not throw and kept its
prototype*. Measured by the adequacy reader with one inserted expression each: the classifier's clone
could be replaced with an **Invalid `Date`**, an **empty `Map`**, an **empty `Set`** or an **empty
array** and every row still read `faithful`, for **zero** failures. And prototype identity is the
wrong predicate anyway — **a plain `Error` keeps `Error.prototype` and still drops its own fields**,
and a **frozen plain object** keeps its prototype and arrives unfrozen. The middle row was hiding
four silent losses.

**So `OR-R11` is restated around WHAT CROSSES** — own enumerable string-keyed data plus the built-ins'
internal state — the table is **one row per shape**, and **each row asserts the property its own row
names**: a refusal, a content ROUND TRIP, or the NAMED loss. There is no label left to collapse. The
suite **reads that table out of the document** and compares both ways, with the per-class counts
derived from it — **and that binding caught this item's own first split, 5 / 10 / 12, on its first
run.** The answer is 5 / 11 / 11.

**THE TWO PERCENTAGES WERE FALSE IN BOTH DIRECTIONS**, quoted from a single run. Re-taken as 21
medians per reading, five readings at each of two payload sizes: **0.02-0.65%** and **23-60%**
against the stated 0.04-0.52% and 27-55% — *the stated upper bounds sat below **every** N = 100
reading*. [Q179](../questions/q179.md), in the section whose own closing sentence is **quote the
shape and the ratio, never the millisecond**. The bands are what reproduce; the readings do not.

**`OR-R6` WAS STATED OF THE WHOLE BOUNDARY AND HOLDS ONLY AT THE LISTENER**, which is the sharpest
single finding and is this item's own subject turned on itself. The listener wraps its clone;
`resolve()`'s is unguarded, so an uncloneable resolution value throws a bare `DataCloneError` to its
caller, **appends nothing, does not fail the run, and never reaches `onRunFailure`** — and a
`DataCloneError` is in neither section 6's enumeration of what reaches `OR-R10` nor `AGENTS.md`'s
executed error-class snippet. **`OR-R12`** writes it down; the asymmetry is defended rather than
removed (a settlement has nobody to throw to; a resolution is a synchronous call the consumer made),
and whether the two should be unified is [Q241](../questions/q241.md). `src/driver/**` is
[W53](w53-what-a-run-retains-that-nothing-reads.md)'s, so this records rather than changes.

**`OR-R11` SAYS THE LOSS HAPPENS AT `OR-R2`'s CLONE AND NOTHING ASSERTED THAT.** There are **three**
clone sites on the path to a consumer, and the L2 case and the `RunState` case are satisfied by any
one: measured, **deleting `cloneValue` entirely left the whole suite green**. `normalizeEvent` is
`OR-R2`'s own site and the identity assertion is made there now.

**Four more, each measured at zero before it was closed.** The `rows` list was bound by nothing —
16 of 19 rows left **with the assertion count unmoved at 701**, W22's column-drop verbatim, because
the rows are looped inside one `test()` case. `equal(seen.get(k), undefined)` **passes when `k` is
absent**, and two of the three vocabulary lookups expected `undefined` — so a lookup on `NO SUCH
LABEL` passed; the case is driven from its own table now. The `14 / 124 / 89%` split was a literal in
a `spec/` file with no observer, in a tree whose L4 suite already walks both corpora; it is derived.
And slicing the assert loop cost zero even after the list was bound, because the counts afterwards
read `SHAPES` rather than what **ran**.

**THE GATE WAS RED AND I REPORTED THE BROWSERS GREEN TWICE.** `test/fold/result-value.test.ts`
reads `spec/outcome-record.md` to compare its 27 shapes against that document's table, and walks
**both** corpora to derive the 14 / 124 / 89% split. The browser bundle inlined neither, so three
tests failed in every browser — and the third failed in the more dangerous of the two ways: **it did
not fail to RUN; it ran against half a corpus and reported 6 where the document says 14.** It was
caught only because that assertion is an equality against the document rather than a floor.

**That is [W32](w32-what-a-map-fanout-is.md)'s and [W33](w33-a-map-at-run-time-arity.md)'s defect for
the third time, and what is NEW is how it was missed.** I ran `npm run test:browser:all` twice after
those reads were added and reported it green both times, because the command was piped through
`grep -E "file\(s\)|PARITY"` — and the `27 file(s), 703 assertions` line prints **before** the
failures. **`doc/workflow.md` section 4, v0.15: a rung reported GREEN means its command EXITED 0, and
a line of its output is never the predicate.** That clause was adopted one plan ago, **this item's own
Verification table quotes it**, and I broke it while quoting it — which is section 6 pass 3 rule 3's
sharpest kind for the second time in one item. The bundler's comment records the miss rather than
only the fix, and `scripts/build-browser-tests.mjs` is a **sixth** late exception.

**And `AGENTS.md`'s new block stranded the sentence after it** — *"The first half of that is executed
rather than asserted:"*, which introduces the frozen-copies snippet and now read as introducing the
`OR-R11` one. The neighbour-of-an-edited-line leak `CLAUDE.md` records for W36 and W37, in the
consumer reference, reached by no check. Moved.

**Three claims about this repository's own history were wrong.** `RunState.nodes[*].result` has
**three** readers and not two — the third is `examples/l6.ts`, **ladder L6 asserting on it**, so
taking the bound breaks L6 rows and the price is higher than stated; and `nodeOf(state, taskId)`
reaches the package root through `index.ts`'s `export *`, so the surface is an accessor as well as a
field. The `RUN_FLOOR` history block **skipped W42's 16 → 17**, so [Q102](../questions/q102.md) has
fired **six** times and the file narrating it counted five. And *"P15 predicted the `AGENTS.md` half
by name"* overstated the plan, which lists that file among three and predicts only `spec/README.md`.

**What this taught.**

**A SUITE THAT DEFINES ITS OWN ORACLE CANNOT DISAGREE WITH THE DOCUMENT.** The classifier was the
predicate section 4 declines four paragraphs later, applied to a table whose lossy row contains the
case it is declined for. Every row passed, the table and the suite said different things, and
**nothing could observe the difference** because one of them was computing the other's answer. What
fixed it was not a better classifier: it was **deleting the classifier** and making each row assert
the property its own row names, so the document's claim and the suite's assertion are two expressions
of one fact rather than one expression twice.

**A THREE-WAY LABEL IS A COMPRESSION, AND THE THING IT COMPRESSED WAS THE EVIDENCE.** *Refused /
faithful / lossy* reads as a complete partition and is one; what it hid is that *faithful* was
carrying four silent losses and *lossy* was carrying six different reasons. **The rule got better
when the table got longer** — 3 grouped rows to 27 named ones — and the arithmetic that did not close
was the first symptom of the compression rather than a slip.

**AND A CLAIM ABOUT COST IS A CLAIM ABOUT A METHOD, WHICH THIS ITEM WROTE DOWN AND THEN BROKE.**
Section 4's own closing sentence is *quote the shape and the ratio, never the millisecond*, and four
paragraphs above it stood two percentage bands from a single run that did not contain their own
readings. **The rule was right, the author had just written it, and it was broken in the same
section** — `doc/workflow.md` section 6 pass 3 rule 3's sharpest kind, inside one document.

**Nothing for `doc/workflow.md`.** Every mechanism that fired here is one the document already has,
and instantiating them is what failed — which is v0.13's own recorded correction (*an obligation run
as a step in a set passes; the same obligation asked as a question of one artefact fires*). The one
thing worth a retro's attention is stated above rather than proposed as a rule: **when a suite and a
document both describe a boundary, ask which of them computes the other's answer.**

**Questions raised.**

- **[Q238](../questions/q238.md)** — a result's behaviour is lost at `OR-R2` and the loss is decidable
  cheaply at the TOP LEVEL, and the case a worker writes is NESTED, where it is not. P15 prediction
  3's stated reason is false; its conclusion holds on coverage and cost instead.
- **[Q239](../questions/q239.md)** — bounding `RunState.nodes[*].result` costs a VOCABULARY, not
  bytes, and both candidate encodings are already taken. Priced; the maintainer's to take.
- **[Q240](../questions/q240.md)** — the blanking factor is not a constant and this repository quoted
  one. 8.7x is a fixture; the true statement is that blanking removes the whole of every result.
- **[Q241](../questions/q241.md)** — `OR-R6` holds only at the listener; the resolution path throws a
  bare `DataCloneError` to its caller. Written down as `OR-R12`; whether the two should be unified is
  open.
- **[Q242](../questions/q242.md)** — the new cost table in `spec/outcome-record.md` has **no**
  cross-document binding: `X6` compares `spec/flow-definition.md` and `AGENTS.md` only, and the
  harness the numbers come from is in the gitignored `dev-dist/`.

**ADR 0047 SKIPPED and not reused.** `doc/decisions/README.md` says what does not earn an ADR is
*anything already stated normatively in `spec/`*, and that *a spec rule with a rationale paragraph is
better than a spec rule plus an ADR restating it*. `OR-R11` is a numbered row with a `Test owed by`
cell, it is one of the 92 `check:spec` counts, and `C6` passes on it — so Q22's answer is in `spec/`
rather than only in a commit message. **The conformity reader was asked to challenge that call
rather than accept it, and checked it against those words.** **Q243-Q247 remain P15's, unused by this
item.**

**Exceptions — files edited outside `Owns` and outside section 1's record step.**

| file | why | declared |
|---|---|---|
| `spec/README.md` | `C8` compares its version row against each document's own header, so bumping `outcome-record.md` to v0.9 forces it. **P15 predicted this one by name** | late |
| `AGENTS.md` | `OR-R11` is *the one thing a worker author has to know*, and section 4 now says the consumer meets it there — so the sentence is only true if the snippet exists. Added as an **executed** snippet | late |
| `scripts/check-docs.mjs` | `RUN_FLOOR` 17 → 18, forced by the snippet above. [Q102](../questions/q102.md)'s obligation for the **sixth** recorded time | late |
| `test/definition/l4-corpus.test.ts` | the suite census is set equality over suite names both ways, so two new suites must be named there in the same commit | late |
| `spec/run-state.md` | one number this item's measurement made misleading — the `8.7x` factor, which is a property of one fixture. W53's document, corrected in place with the reason | late |
| `scripts/build-browser-tests.mjs` | the browser bundle inlines fixtures by name, and this item's suite reads two it did not carry. **Forced by the gate going red**, not found by reading | late |

**SIX late exceptions, zero undeclared.** **P15's `Owns` test is answered `AGENTS.md` YES,
`spec/README.md` YES, `scripts/check-docs.mjs` YES** — all three, where W53 answered NO / YES / NO.
*Over the plan's two product items that is no/yes/no and yes/yes/yes, so a pre-declaration rule naming
all three would have been wrong twice on W53* ([Q157](../questions/q157.md)), which is the fourth
consecutive plan to measure that and the third to reach the same answer.

**[Q142](../questions/q142.md) re-measured on a scratch copy BEFORE the gate and does NOT fire**, for
the third consecutive time. **Re-taken on the tree that ships** rather than mid-item — section 1 rule 5's WHEN clause, and the
first reading was three commits early. Whole tree **102 / 4456 / 233**, `doc/decisions` removed
**78 / 4080 / 233**, both removed **62 / 3282 / 233**, against floors `M3` 90, `M4` 3490 and `M5` 60. The
two-directory fixture has **208 links of headroom** and `M3`'s one-directory fixture is unmoved at
**78**, because this item adds no document to `doc/`. *(Measured at 3246 before the record step; the
conclusion is the same and these are the shipped numbers.)*

**The `W54` grep returns 13 outside `doc/`**, and the item's declaration recorded **0** at that
moment, which was true. Three of the thirteen were sentences this item's own completion falsified —
`CLAUDE.md` twice and `README.md` once, all of the form *W54 and W55 have not started* — and they are
corrected at the record step. *Section 1 rule 5's third direction working exactly as v0.15 intends:
the item that falsifies a claim is not the item that wrote it.*

**Census CONFIRMED for the FIFTEENTH plan running — 187 / 135 / 2 / 50**, from 182 / 131 / 2 / 49:
five new ids and [Q22](../questions/q22.md) moving from open to resolved. **44 ids in both tables**,
and both halves at **187 of 187 in exactly one cluster cell**, on P15's declaration parser unchanged.

*(It read 186 / 134 and **four** new ids until W55's prompt was being written: **[Q242](../questions/q242.md)
was cited in five documents — this Record twice, the plan, `doc/README.md` and `CLAUDE.md` — and had
NO ROW in the register.** A question raised in prose and declared nowhere, which is `FD-V`'s own
cited-but-never-declared shape one layer out, and nothing reaches it: `M2` validates the `#live`
anchor a Q link points at and nothing validates the Q ID. **And the census then ABORTED on the row
that fixed it** — unescaped pipes inside a code span, [Q131](../questions/q131.md)'s shape, in the row
recording a missing binding. Both are the aborting parser earning its place for the fourth item
running.)*

**And with [Q19](../questions/q19.md) closed by [W53](w53-what-a-run-retains-that-nothing-reads.md)
one item earlier, BOTH of the two oldest rows whose owner cell said *no owner — needs a measured
run* are answered, in one plan.** They had said it since P1.
