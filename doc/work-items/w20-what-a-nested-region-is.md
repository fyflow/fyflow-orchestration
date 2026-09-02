# W20 — What a nested region is, and which one a node is in

**Status:** DONE - 2026-09-02. Both readers ran; all sixteen findings acted on
**Plan:** [P7](../plans/p7-is-a-join-transitive-over-nested-fan-out.md) — the first of its four items.
It **defines the shape** and takes no decision about the join: whether an outer join is transitive
over an inner one is [Q6](../open-questions.md) and belongs to W22.

```
Spec:       spec/flow-definition.md sections 2 and 5 — `FD-V15` lifted, and what
            replaces it. This item WRITES that rule; it does not inherit one.
            Its expected values come from `spec/flow-definition.md`'s region
            definition and from `spec/join-policy.md` section 1's `Region`
            shape, never from what `allRegions` happens to return
            (`doc/workflow.md` section 5 rule 1).
Owns:       src/definition/**            (W1/W2)
            spec/flow-definition.md      (W1)
            spec/examples/**             (W1) — the corpus, because lifting a
                                         refusal moves that refusal's example
            spec/README.md               (W1) — `check-spec`'s C8 makes its
                                         version row a consequence of any
                                         `spec/**` bump (workflow v0.7)
Inputs:     `spec/examples/invalid/FD-V15--nested-fanout.flow.json`, which is
            already a correct depth-2 nested fan-out and is only in `invalid/`
            because the rule refuses it.
            `regionSets`' existing transitive `members` — an outer region's set
            ALREADY contains the inner fan-out's nodes, so nothing has to be
            added for an outer region to know about an inner one.
            `FD-V19` and `FD-V22`, which stay in force: an inner region must be
            wholly inside ONE outer branch, and this item does not lift them.
Outputs:    (1) `FD-V15` lifted, with `spec/flow-definition.md`'s rationale
                rewritten from *"out of P1's scope"* to what nesting means — and
                its stale *"scheduled for P2"* removed;
            (2) **an exported innermost-region resolver in
                `src/definition/regions.ts`**, beside `branchIndexOf`, whose
                answer does not depend on node-declaration order;
            (3) `branchIndexOf` made order-independent — it has the SAME defect
                and it is public surface;
            (4) the nested flow moved from `spec/examples/invalid/` to
                `valid/`, with `check-spec`'s C3, C4 and C7 all satisfied;
            (5) a spec rule saying which region a node is in when it is in two.
Depends on: nothing. It is P7's first item.
Blocks:     W21 (the path), and through it W22 and W23.
Tests:      L1 over `src/definition/**`, with values derived from the spec
            before running. Three groups:
              - the validator no longer reports `FD-V15` for the nested flow,
                and every other `FD-V*` refusal still fires on its own example;
              - the resolver returns the INNER region for `scoreC`/`scoreD` and
                the OUTER for `scoreA`, and `branchIndexOf` agrees with it;
              - **and the same flow with `inner` declared BEFORE `outer` gives
                the same answers** — the assertion that kills the defect, and
                the one that could not exist while `FD-V15` stood.
Gate:       L0-L5, climbed from L0 as regression — but **this item's own new
            coverage is at L0, L1 and L4 only**, and the declaration says so
            rather than letting a green L5 read as *nested fan-out works*.
            Depth-2 ROUTING is unreachable until W21 mints a dotted
            `branchPath`; depth-2 JOINING until W22. Then the two readers of
            `doc/workflow.md` section 6, the adequacy one in an isolated copy.
Reserves:   Q112-Q116, ADR 0031
```

**ADR 0031 is reserved and is not expected to be used.** P7 holds 0030 for W22's transitivity
decision. If defining *which region a node is in* turns out to need a decision rather than a spec
rule with a rationale, 0031 is here for it; **an unused reserve is skipped, never reissued**
(`doc/workflow.md` section 3).

## The load-bearing fact, measured before this was declared — and it corrects P7 twice

*`doc/workflow.md`: nine consecutive plans have measured before declaring and in all nine it changed
what got written. This is the first **item** of P7 doing it to its own plan, which is P6's pattern —
its declaration step found three of that plan's stated facts wrong.*

| | measured |
|---|---|
| **The driver's own comment states the invariant that lifting `FD-V15` breaks, and it names two other rules** | `src/driver/driver.ts:676-678`: *"A non-`end` node is in at most one region (`FD-V19`, `FD-V22`), so `regionOf` is unambiguous HERE — it is only `end` nodes, which are exempt from those rules, that can be in two."* **That sentence becomes false for non-`end` nodes the moment nesting is allowed**, and it is guarded by rules this item does not touch. A reader trusts it |
| **`branchIndexOf` has the SAME defect, it is in this item's `Owns`, and it is public surface** | `src/definition/regions.ts:146` loops regions in declaration order and returns the **first** branch index it finds. With nesting a node is in an outer branch **and** an inner one. It is exported from the package root (`index.ts` re-exports `regions.ts`) and asserted at `test/driver/surface.test.ts:63-74` — including `'abandoned'`, an `end` node already in two regions, so **the two-region case is live in a test today and the ordering has simply never mattered** |
| **`regionOf` needs only two things from a region** | `.fanoutId` at `driver.ts:477`, `:635`, `:657` and `:681`, and *"is this node in any region at all"* at `:783` (`branchPathFor`). It never reads the whole `RegionSets`, which is what makes moving the resolution cheap |
| **The corpus already holds the flow** | `spec/examples/invalid/FD-V15--nested-fanout.flow.json` is a correct depth-2 nested fan-out — `scoreB` → `inner` → `scoreC`/`scoreD` → `innerJoin` → `outerJoin` — sitting in `invalid/` **only** because the rule refuses it. The inner region is wholly inside outer branch 1, which is the shape `FD-V19`/`FD-V22` leave available. **Lifting the rule moves a file**, and it is the flow W23 will run |
| **`allRegions` returns regions in node-declaration order** | `regions.ts:104-113` iterates `doc.nodes`. Nothing sorts them, and nothing has needed them sorted |

### Correction 1 — *"`regionOf` resolves innermost"* is a `src/driver/**` change and P7 gave this item `src/definition/**`

**P7's index table is wrong about where the work is**, and this declaration records it rather than
silently widening the `Owns` block. Two ways to fix it:

| | |
|---|---|
| widen `Owns` to `src/driver/driver.ts` | **Refused.** W21 and W22 both edit that file too. All four items are serial so `doc/workflow.md` section 7 rule 2 permits it, but three items editing one file is the merge cost that rule exists to price, paid for nothing |
| **put the resolver where the region maths already lives** | **Taken.** `branchIndexOf` is already in `regions.ts` and already has the identical defect, so the innermost resolver is its sibling rather than a new home. `Driver.regionOf` becomes a delegation — **one line** — and that line plus the false comment above it are this item's only edits outside `Owns` |

### Correction 2 — `spec/examples/**` is in nobody's `Owns` and lifting a refusal moves a file

P7's table named `src/definition/**`, `spec/flow-definition.md` and `spec/README.md`. It did not name
the corpus, and `check-spec` has three checks with something to say about it: **C3** (an invalid
example names a rule), **C4** (every definition refusal has a case) and **C7** (the valid corpus
resolves against `registry.json`). Moving `FD-V15--nested-fanout.flow.json` from `invalid/` to
`valid/` touches all three. Added to `Owns` here.

### The candidate definition of *innermost*, derived from sets that already exist

Stated so the item is not written from intuition, and **not decided here** — the spec rule is
Output (5):

> Region `A` is **inside** region `B` iff `A.fanoutId ∈ B.members`. The **innermost** region of node
> `n` is, among `{ r : n ∈ r.members }`, the one that is inside every other candidate.

It needs no new data: `members` is already transitive, so containment is already computable. Whether
the resolver returns `undefined` or throws when two candidates are unrelated — which `FD-V19` and
`FD-V22` should make unreachable — is the item's to settle and to assert.

## Scope

**In**

1. **`FD-V15` lifted**, and `spec/flow-definition.md`'s two sentences about it rewritten: the
   rationale, and the stale *"scheduled for P2"*.
2. **Innermost resolution as region maths**, exported from `src/definition/regions.ts`, with an
   assertion that its answer **does not depend on node-declaration order**.
3. **`branchIndexOf` made order-independent.** It is public surface with the same defect, and fixing
   the sibling while leaving it is worse than fixing neither.
4. **The corpus file moved**, with C3, C4 and C7 green for the right reason rather than by accident.
5. **The driver's false comment corrected**, and `regionOf` delegating — the declared exception.

**Out** — named rather than left implicit, with where it goes instead

- **Anything about the task id.** `buildTaskId` still cannot emit a dotted `branchPath` and this item
  does not change that; **W21** owns `spec/task-id.md` and the two `split('.')[0]` sites.

  > **This bullet said *"a nested flow validates and still cannot run"*, and that was wrong.**
  > Measured while closing survivor A7: a `Driver` on `valid/nested-fanout.flow.json` **runs today**
  > — it dispatches all four tasks, opens both regions and routes `scoreC`'s arrival to the inner
  > one. What it mints is `r1:scoreC:0:0` where `spec/task-id.md`'s reserved shape wants
  > `r1:scoreC:1.0:0`, because nothing pushes a segment. **The intermediate state is *runs with the
  > wrong ids*, not *cannot run*** — which is better for this item (the driver seam is testable at
  > L2 now) and is a sharper statement of what W21 owes.
- **Anything about the join.** Transitivity is [Q6](../open-questions.md) and **ADR 0030 is W22's**.
  `arrival-count`'s refusal is W22's too, on P7's measured ground that `validateDefinition` does not
  know the policy.
- **Whether `branchIndexOf` should return a PATH rather than an index.** At depth 2 the honest answer
  to *"which branch is this node in"* is `'1.0'`, and that is `spec/task-id.md`'s vocabulary —
  **W21's**. This item makes the existing signature correct, not different. Named because it is the
  seam between the two items and it is where a reader will expect one of them to have overreached.
- **`FD-V13`, `FD-V19`, `FD-V22`** ([Q23](../open-questions.md), [Q27](../open-questions.md)). The
  other liftable restrictions, and `FD-V19`/`FD-V22` are load-bearing *for* this item: they are what
  keep an inner region inside one outer branch.
- **Depth 3.** The definition above is depth-agnostic and the tests are at depth 2. An item that
  claims depth 3 works owes a case.

## Exceptions — files edited outside `Owns` and outside the record step

| File | What, and why it cannot be inside `Owns` |
|---|---|
| `src/driver/driver.ts` | **Two edits, both consequences of Output (2).** `regionOf`'s body becomes a delegation to the exported resolver — one line — and the comment at `:676-678` is corrected, because lifting `FD-V15` makes *"a non-`end` node is in at most one region"* false and that sentence is what a reader checks `regionOf` against. It is W3's file and W21's and W22's after this; putting the resolver here instead would give three serial items one file for no gain |
| `test/definition/nesting.test.ts` | **Declared LATE — the declaration named `Tests: L1 over src/definition/**` and never said where they would live.** A new file beside `exemptions.test.ts`, which exists for section 4's twice-earned warning about region rules that reject the valid corpus; retiring one is the mirror image of adding one |
| `test/driver/surface.test.ts` | **Declared LATE, and it is the one that closed a survivor.** One suite: the driver reading the innermost region on a nested flow. That file's own header calls itself *"the values W2 and W3 are supposed to meet at, rather than meeting at each other's code"*, which is exactly what `regionOf` is |

| `AGENTS.md` | **Declared LATE.** It said nested fan-out is *"refused at construction (`FD-V15`)"* and *"23 refusals"*. Both became false with this item and the file is in nobody's `Owns` and is not a record-step file |
| `spec/join-policy.md` | **Declared LATE.** Section 5 said *"`FD-V15` refuses nested fan-out, so no `branchPath` deeper than one element occurs"*. W22's file — the substantive question stays W22's; only the false sentence is corrected |
| `spec/task-id.md` | **Declared LATE.** Two citations, one of them a **pillar of `ID-R1`'s soundness argument**. W21's file, same split |

**Both test files were missed by this declaration and are recorded as late rather than folded in.**
The `Tests:` line said *what* would be asserted and not *where*, and `Owns` named only `src/` and
`spec/` — so an item whose whole deliverable is a definition-layer change had **no file it was
allowed to test in**. That is `doc/workflow.md` section 7 rule 2's own case: three consecutive items
once answered *"did you edit outside your `Owns`"* with *"yes, and I did not notice"*, and this one
noticed by running the audit before the Record rather than after. **For P7's retro: a `Tests:` line
that names assertions and not paths is a declaration that cannot be audited.**

*Record-step files are not exceptions (`doc/workflow.md` section 1 rule 5): the plan's Record,
`doc/README.md`, `CLAUDE.md`, `README.md`, `doc/open-questions.md`, `doc/decisions/**`.*

## Verification

| Clause | Command |
|---|---|
| L0 | `npm run check:spec` — **C3, C4 and C7 are the ones this item moves**; `check:source`, `check:scheduler` (+ self-test), `check:policies` (+ self-test), `check:docs` (+ self-test), `npm run lint`, `npm run typecheck` (five projects) |
| L1-L5 | `npm run test` (node 24), `npm run test:deno`, `npm run test:browser` — **chromium only** by default (`scripts/run-browser-tests.mjs:68`); `test:browser:all` is firefox and webkit and the gate does **not** run it. **This item's own new assertions are L1 and L4**; L2, L3 and L5 are climbed as regression |
| L6 | **NOT RUN by this item, and not skipped by accident** — `examples/**` is W23's and a nested flow cannot dispatch until W21 mints its ids. Reported as *did not run*, per section 1 rule 4 |
| conformity reader | `doc/workflow.md` section 6, fresh context, spec first, re-deriving the expected region membership independently before looking at it |
| adequacy reader | same, tests second, mutating **in an isolated copy** — measure links first, `cp -r node_modules`, green in the copy before the reader starts, **scan for links before removing it** |

**Do not read the gate's result through a grep.** W17 did, its patterns missed `deno lint`'s failure
line, and it reported a red L0 as green for a round. Read the exit code.

**Rule 8 — provocations, all THREE obligations** (`doc/workflow.md` v0.8). Written to the **rule's
clauses** — every branch of the innermost definition, both declaration orders, a node in one region,
a node in two, a node in none — **and** to the **`Outputs` table's rows**, one probe per row asking
what would fail if that output did not exist — **and** to the **provenance** of every value an
assertion reads, which is v0.8's new obligation and lands squarely here: the resolver's answer and
`branchIndexOf`'s must come from the region sets rather than from each other, and a test that derives
one from the other would be this item's version of the five instances that produced the rule.

*Per the template, this item touches routing at the definition layer only, so:* a branch routed away
from its join (Q4) — **not applicable**, no routing executes here; `user_action` (Q17) — **not
applicable**; no matching decision edge (Q10) — **not applicable**; a duplicate task id (Q13) —
**not applicable**, no id is minted; **a nested fan-out (Q6) — this item is the definition half of
it**, and the routing and joining halves are W21's and W22's.

## Record

**Both readers ran. Conformity: 11 findings, 3 BLOCKING. Adequacy: 36 mutations, 11 survivors, 5
BLOCKING. All sixteen acted on, and the set was re-run after — 19 probes, 2 survivors, both
classified.**

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **RAN, green** | `check-spec` 8 checks — **C4 now covers 22 definition refusals** and skips `FD-V14` **and `FD-V15`** as declared absent, C3 and C7 green over the moved corpus file; `check-source` 11 checks / 13 published files; `check-scheduler` 5 + **12/12**; `check-policies` 3 + **13/13**; `check-docs` 5 + **14/14**; `deno lint` **43 files** (+1, the new suite); `typecheck` 5 projects |
| L1-L5 | **RAN, green** | **421 `test()` cases over 19 files** (+11 over 18) in **all five runtimes** — node 24.20.0, deno 2.9.6, chromium, firefox and webkit. `npm run gate` runs three, so `npm run test:browser:all` was run rather than the word *five* inherited. **This item's own new coverage is L1 and L4**; L2, L3 and L5 climbed as regression and none of them moved |
| L6 | **RAN as regression; added NO coverage**, and the coverage is W23's | **373 assertions / 21 real runs** in both runtimes, unmoved — the right result, since nothing this item did changes depth-1 behaviour. *(This row read `NOT RUN — by declaration` in a Record that also reported `npm run gate` exiting 0, and the gate ends with `test:l6 && test:l6:deno`. Both could not be true. W20's conformity reader.)* |
| conformity reader | **RAN — 11 findings, 3 BLOCKING; all acted on** | It re-derived all nine rows of `EXPECTED` from the spec before opening the file and **matched exactly**. Its blocking three: the new spec rule's uniqueness claim was **false for `end` nodes**; `AGENTS.md` stated two things that had become untrue; and two `spec/` documents still cited `FD-V15` as a rule in force |
| adequacy reader | **RAN** in an isolated copy — **36 mutations, 11 survivors, 5 BLOCKING**; all acted on | Zero symlinks measured before the copy and inside it; green at 416 before it started. It reproduced seven of the author's probes to the failure count, so the two sets are comparable |
| re-run after the findings | **RAN, green** | `npm run gate` **exit 0**, read directly. The whole provocation set re-run: **19 probes, 2 survivors**, both classified. No commit exists — this item was not asked to commit, so there is no sha to name |

**Gate read from its exit code, not through a grep** (`npm run gate; echo $?` → 0).

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| **(1)** `FD-V15` lifted, rationale rewritten | yes — retired in `validate.ts` and declared **absent** in the spec table | Restoring the `add()`: **3** L1 failures |
| **(2)** the innermost resolver, order-independent | yes — `innermostRegionOf` in `src/definition/regions.ts`, beside `branchIndexOf` | Deleting it and reverting both callers to `.find`: **2**. Reverting only the **driver's** call: **1** — and that one was worth **0** until a survivor forced the test that catches it |
| **(3)** `branchIndexOf` order-independent | yes — it now reads the innermost region | Reverting it to the region loop: **3** L1 failures. *(This row read **caught at typecheck**, and that was a **malformed probe reported as caught** — W6's founding case for rule 7 (c), in this item's own set. The author's edit dropped a closing brace; the reader's well-formed revert compiles and costs failures. Both readers found it.)* |
| **(4)** the corpus file moved, C3/C4/C7 green | yes — `spec/examples/valid/nested-fanout.flow.json` | `check-spec` C4 would demand a case for a rule that no longer exists, and C3 a rule name for an example that is now valid |
| **(5)** the spec rule for a node in two regions | yes, **and its first version was FALSE** — see *What broke* | **Nothing.** Deleting the whole subsection leaves the gate green — no check reads spec prose, which is the class six retros have refused to mechanise |

**`Owns` audit**, by hand, after the record step.

| | |
|---|---|
| **`Owns`** | `src/definition/regions.ts`, `src/definition/validate.ts`, `spec/flow-definition.md`, `spec/examples/**` (the rename), `spec/README.md` — **five, all inside** |
| **Declared exceptions** | `src/driver/driver.ts` (declared up front); `test/definition/nesting.test.ts`, `test/driver/surface.test.ts`, `AGENTS.md`, `spec/join-policy.md`, `spec/task-id.md` (**five declared LATE**) |
| **Record step** | this file, `doc/plans/p7-*.md`, `doc/README.md`, `CLAUDE.md`, `README.md`, `doc/open-questions.md` |

**Nothing else.** `git status` at the Record holds exactly those and no more.

## Rule 8 — the provocation set, and it is v0.8's FIRST outing

**16 probes, 12 caught, 4 survivors, all four classified.** The set was run three times: as written,
after closing its own survivor, and after acting — with the harness restoring all six files it
touches and diffing them against the backup each run (clean every time). **Its rule-7 (b) guard fired
twice for real**, aborting the run when a fix moved a probe's anchor rather than passing for the
wrong reason.

**(a) the RULE's clauses** — `spec/flow-definition.md` section 4's innermost definition:

| | the edit | L1 |
|---|---|---|
| A1 | containment reversed — pick the region the candidate **contains** | **3** |
| A2 | the resolver restored to `.find`, first in declaration order | **2** |
| A3 | the resolver returns the **last** containing region | **1** |
| A4 | property 2 broken — a node in exactly one region resolves to `undefined` | **0 failures, but caught**: every case errors |
| A5 | a node in **no** region gets one anyway | **6** |
| A6 | `branchIndexOf` reverts to the region loop | **typecheck** |
| A7 | the **driver** reverts to `.find` while the maths stays correct | **1** — and see below |

**(b) the `Outputs` table's rows**: B1 (`FD-V15` restored) **3**; B2 (the resolver deleted) **2**;
B5 (the spec subsection deleted) **SURVIVED**.

**(c) PROVENANCE — v0.8's new obligation, and the one that taught something about itself**:
C2 (the reversed input not actually reversed) **1**; C5 (the `EXPECTED` table's `scoreC` row set to
the pre-v0.7 answer) **2**; D1 (the driver seam test's expected region id flipped) **1**;
C1, C3, C4 **SURVIVED**.

### A7 was the real survivor and it is rule 8's founding case inside rule 8's own procedure

**Reverting `Driver.regionOf` to `.find` cost nothing.** Every probe against the region maths was
caught by its own tests; the driver's one-line delegation — the thing P7 called *the plan's central
defect* — was held down by no assertion at all, because **nothing drove a `Driver` through a nested
flow**.

Closing it produced a fact worth carrying: **`regionOf` is read on exactly three paths** —
`branch.suspended`, `branch.lost`, and the `fromRegion` that attributes `branch.exited`.
`branch.arrived` finds its region by **`joinId`** and `branch.opened` by **`fanoutId`**, both keyed
and both unambiguous. So the first version of the seam test, which drove the flow to a normal
arrival, reached `regionOf` **nowhere** and passed with `.find` restored. **The innermost resolution
is load-bearing on the non-success paths only**, which is [Q113](../open-questions.md) and which W22
and W23 need before they design their rows. The test now suspends `scoreC` instead — the cheapest of
the three, needing no fixture the corpus does not already have.

### What v0.8's provenance obligation taught about itself, on its first outing

**Three of the six provenance probes survived, and none of the three is a hole.** C3 and C4 replace a
**declared expected value** with a self-read; C1 compares a run against itself. **A probe that breaks
the *expected* side always survives on correct code**, for any test anywhere — it asks *"would a
weaker assertion also pass?"*, whose answer is always yes.

Measured rather than argued: **C4 paired with B1** — the filter *and* `FD-V15` restored — costs **2**
failures, so the clause the filter would hide is covered by two other routes. And the three
provenance probes that **caught** (C2, C5, D1) all break the **input** or the **declared** value.

**The obligation as v0.8 words it is right in aim and under-specified: it should say break the source
of the ACTUAL value, or pair an expected-side probe with a code mutation.** [Q112](../open-questions.md),
for P7's retro — the first rule in this document to be refined by its own first outing.

**B5 is a real survivor and is the known refused class**: no check reads spec prose, so the whole
subsection can be deleted with the gate green. Six retros have refused a mechanism for it.

## What the readers found, and it is the largest correction any item here has taken

**Sixteen findings, eight of them blocking, and the sharpest one is that the rule this item wrote was
false.**

### The spec rule's uniqueness claim was wrong, and the defect it was written to kill survived inside it

Section 4's first draft said *"`FD-V19` and `FD-V22` are what make it unique"*. **`end` nodes are
exempt from both** (section 2), so one `end` node may be shared by two **sibling** regions nested in
neither — [Q45](../open-questions.md)'s shape, two sequential fan-outs sharing one `end`, which
`validateDefinition` **accepts**. Measured: the same graph answered `f1` or `f2` depending on which
`fanout` was declared first. **The exact defect this item exists to remove, surviving in the one case
the rule claimed was unreachable.**

Three things were wrong at once and each is corrected in place: the rule named `FD-V19`, which makes
a **branch index** unique rather than a **region**; it claimed uniqueness unconditionally where
`FD-V22` only delivers it for non-`end` nodes; and the resolver had a fall-through that turned *no
answer* into *the first one*. **`innermostRegionOf` now returns `undefined`** — the only
order-independent answer, since `spec/task-id.md` section 1 makes `branchPath` *a property of the
node* and a node in two unrelated regions has no such property. Q45's shape is now a case.

### `regionOf` is read at FOUR identity-using sites and the seam suite covered ONE

The author closed survivor A7 with one suite and reported the fix caught. The adequacy reader
measured the other three at **0 failures each** — `branch.resumed`, `branch.lost`, and the
`fromRegion` that attributes `branch.exited` — each emitting a **wrong `regionId`** on a real driver.
**Not cosmetic**: a `branch.lost` stamped `outer` decrements the outer join's live count for a branch
the outer region never opened, and leaves the inner join waiting forever on a branch that died. A
hang and a premature join from one wrong string. All four are now covered; each revert costs 1.

**This is the item's own founding finding reproduced inside the repair.** The author's set **removed**
the fix; the survivors **narrow** it — which is `doc/workflow.md` v0.6's table verbatim, one plan
after the amendment written for it.

### Two provenance holes, and they are v0.8's own new obligation failing on its first outing

- **The order test could read the wrong graph.** Substituting `def` for `reversed` left *"the
  assertion this item exists for"* green while it stopped reading the reversed graph at all. The
  author's rule-7 (b) guard checks the **fixture** differs and says nothing about which fixture the
  asserted value came from. Fixed by asserting the reversed run's **provenance before its value** —
  `allRegions` returns regions in declaration order, so the reversed run must report `['inner',
  'outer']`, and the swap now fails there first.
- **`EXPECTED` supplied the assertion's DOMAIN, not just its values.** `shapeOf` mapped over
  `EXPECTED`'s own ids, so deleting eight of nine rows removed eight **cases** from both sides and
  left the suite green — taking the only route to two code mutations with it. Fixed by reading the
  node list from the definition.

### Three documents outside `Owns` stated things that had become false

`AGENTS.md` — the consumer reference — said **nested fan-out is "refused at construction (`FD-V15`)"**
and **"23 refusals"**. `spec/join-policy.md` section 5 and `spec/task-id.md` both cited `FD-V15` as a
rule in force, and one of them is a **pillar of `ID-R1`'s soundness argument**. All four corrected as
**late exceptions**; `check-spec`'s C2 cannot see any of them, because `FD-V15` is still *declared*
(as absent) so citing it passes.

## What broke

**1. Nothing in the product, and that is the measured result rather than a hope.** With `FD-V15` set
aside, the nested example produced **no other finding** — `FD-V13`, `FD-V19` and `FD-V22` all accept
it. The region maths was already transitive, so this was a lift rather than a redesign, and the nine
rows of the `EXPECTED` table matched on their first run.

**2. This item had no file it was allowed to test in, and did not notice until the audit.** `Owns`
named `src/definition/**` and three `spec/` paths; the `Tests:` line said *"L1 over
`src/definition/**`"* and never said **where**. Both test files are therefore **late exceptions**.
**For P7's retro: a `Tests:` line that names assertions and not paths is a declaration that cannot be
audited** — `doc/workflow.md` section 7 rule 2 asks *"did you edit outside your `Owns`"*, and an item
whose tests have no declared home answers *yes* by construction.

**3. The declaration said a nested flow would *"validate and still cannot run"*, and it runs.**
Measured while closing A7: a `Driver` on the nested flow dispatches all four tasks, opens both
regions and routes correctly. What it mints is `r1:scoreC:0:0` where `spec/task-id.md`'s reserved
shape wants `r1:scoreC:1.0:0`. **The intermediate state is *runs with the wrong ids*, not *cannot
run*** — better for this item, because the driver seam became testable at L2, and a sharper statement
of what W21 owes. Corrected in Scope/Out in place.

## What this taught

**1. A rule retired is the mirror image of a rule added, and the corpus already knew it.**
`spec/examples/invalid/FD-V15--nested-fanout.flow.json` was a correct depth-2 nested fan-out sitting
in `invalid/` because a rule refused it. Lifting the rule **moved a file** — and `check-spec`'s
`deliberately absent` mechanism, written for `FD-V14` (a rule that never existed), serves a **retired**
rule unchanged. **No script change and therefore no undeclared edit**, which is the opposite of W18's
[Q102](../open-questions.md): a check that turned out to need one.

**2. Keyed lookups hid the defect, and that is why it survived four plans.** `regionOf`'s
order-dependence was invisible not only because `FD-V15` refused the input, but because the two most
common region events — `opened` and `arrived` — never call it. A defect on the non-success paths of a
function whose success paths do not use it is a defect nothing routine will reach.

**3. `doc/workflow.md` v0.8's own first outing refined it.** See the provenance section above.

## Questions raised

- **[Q112](../open-questions.md)** — v0.8's provenance obligation does not distinguish breaking the
  **actual** side of an assertion from breaking the **expected** side, and the second always survives.
  Measured on the rule's first outing: 3 of 6 provenance probes survived and none was a hole.
- **[Q113](../open-questions.md)** — `Driver.regionOf` is read on **four** identity-using paths
  (`branch.suspended`, `branch.lost`, `branch.resumed`, and `branch.exited`'s attribution);
  `branch.arrived` and `branch.opened` use keyed lookups. **Four, not the three this row first said**
  — corrected by the adequacy reader, and it matters because W22 and W23 are told to design their
  rows from the number. Whether the join needs innermost resolution **at all** is W22's to answer.
- **[Q114](../open-questions.md)** — **`settleJoin` routes out of a join with no branch path at
  all.** `driver.ts` enters the join's successor as `this.enter(runId, edge.to, null)` — no
  `fromBranch`, no `fromRegion` — so on a nested flow the outer region records branch 1's arrival as
  `'-'`, and any task after an inner join would be dispatched `r1:X:-:0`, where `spec/task-id.md`
  section 1 defines `-` as *"the node is in no fan-out region"*. Found by the conformity reader
  driving the nested flow to completion. **This is a THIRD id site**: P7's fact table names two that
  read only the first segment, and this one discards the path entirely. **It changes what W21 owes**
  and is upstream of W22.

*(Q114-Q116 unused and **skipped, never reissued**. ADR 0031 reserved and unused: defining which
region a node is in needed a spec rule with a rationale, not a decision.)*
