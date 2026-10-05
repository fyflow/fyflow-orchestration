# W85 — what a nested region CARRIES and how it ENDS

**Status:** done
**Plan:** [P22](../plans/p22-what-a-regions-identity-is.md) — *what is a region's identity, and may a
region open inside a `map` region?*

```
Spec:       spec/join-policy.md and spec/run-state.md — **the TEST cells of `JP-R10`, `JP-R12` and
            `RN-R13`, and NO rule id.** The declaration step's re-take row 5 asked whether a rule
            must move and the answer is NO: `RN-R6` is already quantified over INSTANCES (v0.7),
            `JP-R10` already carries its second subscript (v0.17), `JP-R12`'s key-set disjointness
            is ADR 0062 consequence 5, and `RN-R13`'s second term already reads *a join*, which is
            per instance under `RN-R6`. What those three rules do NOT say is which SHAPES
            discriminate them under nesting — which is what a Test cell is for, and what a reader
            implementing from `spec/` alone would otherwise have to invent.
            `check:spec` stays **7 / 61 / 108**.
Owns:       test/**, spec/join-policy.md, spec/run-state.md, spec/README.md
            **No `src/` edit is expected and none is taken** — W85 asserts what W84 built. An edit
            to `src/**` here would mean ADR 0062 shipped wrong, and would be a correction to the
            plan recorded as one.
Inputs:     P22 fact 5 and decisions 5 and 6, RE-TAKEN on this tree before anything is edited (the
            five-row table below); W84's Record — its adequacy reader's finding 7 and the numbers
            in it; ADR 0062 rules 1-5 and consequences 4, 5 and 7; ADR 0046 rule 3 /
            `RN-R13`; ADR 0030 rule 4 / `JP-R10`; ADR 0044 / `outputIsVisible`;
            `spec/join-policy.md` section 5's N = 0 ruling as SHIPPED.
Outputs:    (1) the branch-exit paths driven under a region nested in a `map`, each at a NON-FIRST
                instance with the sibling asserted untouched — `branch.lost`, `branch.suspended`
                and `branch.resumed`, which is P22 fact 5's three, **plus `branch.exited`**, which
                its enumeration misses and which W84 edited for the same reason
            (2) `JP-R12` at two levels and at DEPTH THREE: two instances of one opener carry
                DISJOINT and COMPLETE key sets, and the key ORDER clause at a nested depth
            (3) N = 0 inside a map at the depths the lift made reachable, including `JP-R10`'s
                `branch.lost` for an enclosing MAP INSTANCE
            (4) retention released PER INSTANCE — `heldArrivals`' second level BOUND, and
                `DECLARED_CASES` gaining the per-instance rows it had none of
            (5) ADR 0044 visibility across a region nested in a map — the second expressible
                narrowing shape `test/driver/needs.test.ts` hands here by name
            (6) Q95's precondition AT INSTANCE GRANULARITY: the `at most once` latch's too-weak
                direction, which W84 measured bound by nothing — with its COST asserted as a
                `DuplicateTaskId` on a document whose inner join's successor is a TASK
            (7) the file's own CASE-level membership, which the suite census structurally cannot
                be, and a COUNT beside that census's two set differences
Depends on: W84
Blocks:     W86
Tests:      `test/driver/nested-regions.test.ts` (new) at L2 on a fake scheduler, plus
            `test/driver/retention.test.ts` and `test/definition/l4-corpus.test.ts`'s suite census.
            **Every expected value is derived from the DOCUMENT and from `spec/` before any run is
            read**: each region instance's key from the opener's position, each collection's key set
            from `JP-R12`'s *one entry per branch that emitted `branch.arrived`*, and each
            visibility verdict from `outputIsVisible`'s *agree on the shared regions*, on paper.
Gate:       L1-L5 in three runtimes; check:spec; check:markdown; **L6 UNMOVED at 1724 / 58 in BOTH
            runtimes**. **And L0**, which the plan's row does not name and which this item needs: a
            new `test/**` file is read by `typecheck:tests` and by `lint`, and W84's own Record
            records a `Gate` line drawn too narrow ([Q348](../questions/q348.md)).
Reserves:   Q352-Q357, ADR 0063 (expected unused)
```

## Scope

**In**

1. **The three branch-exit paths under nesting, as ASSERTIONS rather than as a probe.** P22 fact 5
   is the reason this is its own item: W84's change EDITS `branch.lost`, `branch.suspended` and
   `branch.resumed` and drives none of them at a non-`'-'` instance, and *a mis-keyed exit fires the
   outer join early or hangs it, and no typechecker can see that, because the key is a string either
   way.*
2. **What a nested join CARRIES** — `JP-R12` at two levels and at depth 3. ADR 0062 consequence 5
   argues that the collections of two instances are **disjoint by construction**; this is where that
   argument becomes an assertion.
3. **N = 0 inside a map**, at the depths the lift made reachable. **Not reopening what N = 0
   MEANS** — P22 decision 6 and `spec/join-policy.md` section 5 settle that, and this asserts the
   ruling holds one key deeper.
4. **Retention released per INSTANCE** — `RN-R13`, ADR 0046 rule 3, handed here by ADR 0062
   consequence 7 and W84's Scope-Out bullet, with [Q349](../questions/q349.md) as the mechanism.
5. **ADR 0044 visibility across a region nested in a map** — the second expressible narrowing shape
   `test/driver/needs.test.ts` names W85 for, in that file's own comment.
6. **Q95's precondition at instance granularity.** W84's Record: the latch's TOO-STRONG direction is
   bound at 3, and its too-weak one *is bound by nothing, because no shipped policy settles a join
   before every branch is terminal. That is Q95's precondition one key deeper. **W85 is where it is
   driven.***

**Out** — named rather than left implicit, with where each goes instead

- **The exit artifact, any L6 row, `examples/**`, `AGENTS.md`, `README.md`, `package.json`,
  `deno.json`.** W86's, whole. **L6 is UNMOVED here and that is the declared result**: an item that
  adds no flow and no worker moves no rung of real runs.
- **The package version.** `0.4.0` at W86's close, P22 stop-and-ask (b). An edit to either manifest
  here is an undeclared exception.
- **Reopening ADR 0062's key, or the lift.** Decision 1 and rule 4, taken on measurements. This item
  may find either WRONG and say so; it may not re-argue them
  (`doc/workflow.md` section 6 pass 3 rule 1).
- **[Q206](../questions/q206.md)** — sibling regions nested inside ONE map region, and a region's
  collection reachable by no reference. Declared OUT by the plan.
- **[Q350](../questions/q350.md)** — widening `RN-R6`'s cross-policy walk to nested scenarios. W84
  BUILT the obvious repair, it is RED, and the red is right: under nesting the rule's own premise
  fails, because `JP-R10` makes the two policies see different OUTER events.
  `test/matrix/chain.test.ts` is read here and not touched.
- **[Q97](../questions/q97.md)** — whether a region that opened nothing deserves a fourth event.
  `spec/join-policy.md` section 5 holds ADR 0026 for it, and this item adds no case to that
  argument.

## What the declaration step re-took before anything was edited

*P22 stop-and-ask (a) was answered **nothing is checked in**, so `dev-dist/` is ignored and there is
no artefact to read: re-running is the only road any fact has to this item (P15 decision 5). Five
rows, every rung RUN and redirected to `dev-dist/p22-w85/` and read by `$?`, the tree held still by a
content digest over the 380 tracked files — **`eeb7f73d41b3d2e6`, identical before the first probe
and after the last**, `git status` clean at both ends. Every probe went through an `edit.py` that
checks each anchor against the CURRENT bytes, writes nothing if any fails or is ambiguous, and
asserts the restore by comparing bytes back — which **fired twice on its own, both times on an
ambiguous anchor**, and the digest says nothing was written either time.*

| | what was re-taken | verdict |
|---|---|---|
| 1 | **The baseline**, every rung run separately | **HOLDS EXACTLY.** L1-L5 **46 files / 1302 assertions** in node 24.20.0, deno 2.9.6 and chromium (parity asserted); `check:spec` **7 / 61 / 108**; L6 **1724 assertions, 0 failed** in BOTH runtimes; package `0.3.0`. **One drift: `check:markdown` reports 145 documents, 6465 relative links, 336 anchored, where W84's Record says 6464.** Measured on a clean tree at `40d9343` with `git status` empty — so that Record's link count is stale by one and its other two are right |
| 2 | **P22 fact 5 on the SHIPPED tree**, unpatched, where the spike measured it under a patch | **REPRODUCES, every clause.** On Q160's own document at two items, with `p` optional: a failure in ONE item puts `lost f2@1 1.0` and nothing else; a park puts `suspended f2@0 0.0` and nothing else, with the run `awaiting_action`; a person resolving it puts `resumed f2@0 0.0` and nothing else, and **the run completes with zero failures**. *(The lost run itself ends `failed` rather than `completed` — which fact 5 does not claim, and which is `RN-R10`'s own ordering: a lost branch is a `pathEnded` with `no-eligible-edge`.)* |
| 3 | **W84's adequacy reader's finding 7** — the three exit sites at 0 / 0 | **REPRODUCES at L1-L5, and the decomposition is sharper than "three".** Forced to `'-'`: `firedAdd` at the `unsatisfiable` exit **0**, `releaseArrivals` there **0**, `firedAdd` at the `satisfied` exit **0**. **And the two sites nobody counted are BOUND, in two different directions**: `releaseArrivals` at the satisfied exit costs **2** forced to `'-'` (W84's interleaving case AND W53's nested-region case), while the `collectArrivals` read beside it costs **6** forced to `'-'` and **1** re-sourced to the opener's FIRST instance, which is the mutation that matters and the one the figure came from. *`settleJoin`'s two exits hold EIGHT `rp`-keyed expressions; five were probed here, and the three at zero are the three W84 named* |
| 4 | **`heldArrivals`' unbound second level** — ADR 0062 consequence 7 and W84's Scope-Out bullet, with [Q349](../questions/q349.md) as the mechanism | **MEASURED at 0.** Narrowing the inner loop to each opener's FIRST instance costs **zero** at L1-L5, because that file's only nested fixture is `nested-fanout.flow.json`, where every opener has exactly one instance. *(This row and three other sites cited "W84's adequacy reader, finding 8" and **no such finding exists in the tree** — W84's file carries one numbered reader finding, its finding 7, on a different subject. The measurement is this item's own; only the attribution was unsupported, and one copy of it had shipped in a test file. W85's conformity reader, finding 3.)* |
| 5 | **Whether `spec/` needs a RULE** | **NO, and the four rules were each read rather than assumed.** `RN-R6` is keyed by the instance since v0.7; `JP-R10` carries its second subscript since v0.17; `JP-R12`'s disjointness is ADR 0062 consequence 5 and follows from *a branch inside an instance carries that instance's path as its prefix*; `RN-R13`'s second term reads *a join*, which is per instance under `RN-R6`. `check:spec` stays **7 / 61 / 108**, and what moves is three **Test** cells |

**And the re-take found two things the five rows do not cover, both measured the same way.** Of P22
fact 5's three branch-exit paths, **`branch.lost`'s `regionPath` is ALREADY BOUND at 7** — by the L5
`nested-inner-lost` row and by `test/matrix/chain.test.ts`, whose regions are `fanout`-nested at path
`'1'` — while `branch.suspended` and `branch.resumed` are bound by **nothing, 0 each**, because the
only map that drives them (`map-fanout`) opens at top level, where `rpathOf` is `'-'` anyway. And of
`JP-R10`'s two emission sites, the one at the **`unsatisfiable` exit** costs 1 and the one at
**N = 0** costs **0**. *So the gap is six sites at zero rather than three, and the three the plan
named are not the three that are open.*

## Verification

How each clause of `Gate:` is run. Commands named, each RUN and redirected, never piped
(`doc/workflow.md` section 4).

| Clause | How |
|---|---|
| **L0** | `npm run lint`, then each typecheck lane separately — `tsconfig.json`, `.node`, `.browser`, `.tests`, `.examples`, and `deno check`. Separately, because `npm run typecheck` is five lanes chained by `&&` and a RED report names its FIRST failure and is silent downstream. **This clause is not in the plan's row for W85 and it is here deliberately**: a new `test/**` file is read by `typecheck:tests` and by `lint`, and W84 shipped with a `Gate` line drawn from the same list as an `Owns` block ([Q348](../questions/q348.md)) |
| **L1-L5, three runtimes** | `npm test`, then `npm run test:deno`, then `npm run test:browser`. The browser rung is not a formality here: the bundle inlines only `spec/examples/` JSON, and a suite reading a `spec/**` document at MODULE SCOPE takes every suite down naming no file |
| **`check:spec`** | `npm run check:spec` and `npm run check:spec:selftest`. Expected **UNMOVED at 7 / 61 / 108** — re-take row 5 is the argument, and if a rule id turns out to be needed the item says so and by how much |
| **`check:markdown`** | `npm run check:markdown` and its self-test. **[Q142](../questions/q142.md) is measured BEFORE the record step**, not found by the gate: this item adds ONE document, in `doc/work-items/`, which NEITHER `removes` probe cuts, so both floors' margins move by one document and by this file's links |
| **L6 UNMOVED** | `npm run test:l6` and `npm run test:l6:deno`, both at **1724 / 58**. An assertion about the item's scope rather than a formality: W85 adds no flow, no worker and no row, so a moved L6 count means it reached into W86 |
| **conformity reader** | fresh context, `spec/` first and code second. Its central obligation: derive **every collection's key set and every region instance's key ON PAPER** — from `JP-R12`'s *one entry per branch that emitted `branch.arrived`*, from `outputIsVisible`'s *agree on the shared regions*, and from the documents' own node positions — for every fixture, before reading any output |
| **adequacy reader** | isolated copy, TWO named targets. **(a)** Do the three branch-exit paths have an observer that could FAIL, at a NON-`'-'` instance — or is each assertion satisfied by the `'-'` that a depth-1 run produces anyway? **(b)** Is anything this item adds bound at ONE DEPTH, which is W84's own second named target and the one that found its real hole |
| **re-run at `<sha>`** | rule 8's set re-run with both readers' exact edits checked in |

**Routing cases this item covers** (`doc/workflow.md` section 7): **a branch routed away from its
join** ([Q4](../questions/q4.md)) — both ways, a branch LOST inside one map instance and a branch
that reaches an `end` inside one (`branch.exited`), with the sibling instance's collection asserted
complete in each; **`user_action`** ([Q17](../questions/q17.md)) — a task parking and being resolved
inside ONE instance, and inside the instance that is NOT the opener's first, which is what makes it a
claim about the key; **a nested fan-out** ([Q6](../questions/q6.md)) — at two levels and at three;
**a duplicate task id** ([Q13](../questions/q13.md)) — what Q95's precondition produces when the
latch is keyed one level short, asserted as the COST rather than left as the symptom. **Not
applicable**: no matching decision edge ([Q10](../questions/q10.md)), which no fixture here declares
a decision for.

*(The Q13 row was written before it was built and its first fixture could not produce one: in
`FANOUT_IN_MAP` the inner join routes into ANOTHER JOIN, so a doubled fire records a second arrival
and mints no task — the failure is real and completely silent. W85's conformity reader, finding 2,
measured it at **zero occurrences of the string**. A second document puts a TASK after the inner
join, where the same defect mints `r1:after:0:0` twice and `ID-R1` stops the run naming it. **The
same mis-keyed latch is silent or loud depending on what the join's successor is**, which is the
finding rather than the fixture.)*


## Record

**Gate — what ran.** Each verdict starts with `RAN` or `NOT RUN`; a clause with no row reads as
*did not run*.

| Clause | Verdict | Notes |
|---|---|---|
| L0, `lint` and five typecheck lanes | **RAN, EXIT 0, each lane SEPARATELY** | `tsconfig.node.json`, `.browser`, `deno check index.ts src/`, `tsconfig.json`, `tsconfig.examples.json`, plus `npm run lint`. Separately and not through the `&&` chain, because a chained rung names its FIRST failure and is silent downstream. **This clause is not in the plan's row for W85 and was added at this item's declaration** — a new `test/**` file is read by `typecheck:tests` and by `lint`, and W84 shipped with a `Gate` line drawn from the same list as an `Owns` block ([Q348](../questions/q348.md)) |
| L1-L5, three runtimes | **RAN, EXIT 0 — 47 files / 1322 assertions** in node 24.20.0, deno 2.9.6 and chromium, parity asserted | from 46 / 1302. One new file, eighteen new cases, and **`src/` is UNTOUCHED** — `git diff --stat src/` is empty, which is this item's declared property |
| check:spec | **RAN, EXIT 0 — 7 / 61 / 108, UNMOVED** | the declaration step's re-take row 5 predicted it: `RN-R6` is keyed by the instance since v0.7, `JP-R10` carries its second subscript since v0.17, and `JP-R12`'s disjointness is ADR 0062 consequence 5 — so **no rule id is added or retired**, and what moves is three `Test:` cells. `check:spec:selftest` EXIT 0; `C8` green on both bumped rows |
| check:markdown | **RAN, EXIT 0 — 146 documents, 6509 relative links, 342 anchored**; self-test EXIT 0, 7 / 7 bounded | **[Q142](../questions/q142.md) measured BEFORE the record step and does NOT fire**, on the cut trees themselves rather than on the whole one: probe 1's tree (`doc/decisions` removed) is **111 files against `M3`'s floor of 123 — margin 12**, and probe 2's (`doc/decisions` and `doc/plans` removed) is **4784 links against `M4`'s 5270 — margin 486**. This item adds ONE document, in `doc/work-items/`, which NEITHER probe cuts, so both margins narrow by it and neither floor is retuned |
| L6 UNMOVED | **RAN, EXIT 0 — 1724 assertions over 58 real runs in BOTH runtimes, UNMOVED** | the declared result rather than a formality: W85 adds no flow, no worker and no row, so a moved L6 count would mean it had reached into W86 |
| conformity reader | **RAN — 12 findings, 5 blocking** | **its central obligation came back with ZERO disagreements on the VALUES**: it derived every region instance's key, every collection's key set, every branch-exit event triple, every visibility verdict and every run outcome from `spec/` and the five documents' text before reading any output, and not one differed. Every disagreement it found was with a SENTENCE — three false claims in files this item owns, one claim of coverage the item's own fixture could not produce, and one citation with no referent repeated four times including once in shipped test prose |
| adequacy reader | **RAN — 52 mutations, 14 survivors of which 10 real, 6 findings, 3 blocking** | **NAMED TARGET (a) SURVIVED IN PART, and it is the item's sharpest finding**; target (b) survived in part on a different axis. Also: eleven of the thirteen cases deletable at exit 0, and the suite census's own control defeated by a one-token re-source. All three blocking closed, and **its exact edits are checked in as probes — all eleven fire** |
| re-run at `<sha>` | **RAN — 42 probes over two passes, 38 caught, 4 declared ceilings each RUN, 0 UNDECLARED survivors, 0 crashes, 0 aborts standing, 0 against declaration** | pass 1 **28 / 28 caught**, pass 2 **14 probes, 10 caught, 4 ceilings**; control green at every rung on both, the tree held still by a content DIGEST — **`a95a5df23654025e` over 382 files**, identical at both ends of each pass. One abort earlier on the re-run, `d3`, whose anchor pinned the census list's closing bracket that this item's own sixth entry moved — rule 7 (b) firing rather than passing; re-anchored agnostically and then caught. **Both passes were re-run a final time after the digest was widened** — see *What broke* |

**`package.json` and `deno.json` are UNTOUCHED** and the manifest still reads `0.3.0`, which P22
stop-and-ask (b) requires. **Two declared exceptions**, both corrections of a claim this item made
false and neither in its `Owns`: `doc/plans/p22-what-a-regions-identity-is.md` (*"W85 and W86 are
still rows in the table below and nothing more"*) and
`doc/work-items/w84-what-a-regions-identity-is.md` (its `check:markdown` link count, stale by one —
see *What broke*). **Zero undeclared.**

**The declared ceilings**, each RUN against the rung its reason names and each with the tree on
which it survives named, because *a control is one only if you can name the tree on which it fails
and its claim passes* (v0.22) and the same test applies to a ceiling. **Four of them are in the set**
(`m8`, `m9`, `m12`, `m13`) and are two shapes; the fifth is the adequacy reader's and was RUN there:

| | survives on | why that is a ceiling rather than a hole |
|---|---|---|
| the case membership's COUNT or its SETS re-sourced, alone (`m8`, `m9`) | any tree | **nothing is wrong**: seventeen cases really did run, and the literal still says seventeen. Compounded with a DELETION it is caught at 1 by the count alone (`m14`) |
| the same re-source compounded with a RENAME (`m12`, `m13`) | a tree carrying both edits | a rename keeps the count, so only a comparison against written-down NAMES can see it, and **no expression inside one process can check that a list of names was written down before the run**. [Q217](../questions/q217.md)'s regress with its limit named; what it costs an editor is two edits in one diff, forty lines apart |
| `rpathOf` truncated to TWO segments (the adequacy reader's) | this tree | identity by construction at the item's declared depth: a three-level nesting gives instance paths of at most two segments, so a third needs depth four, which the plan puts out of scope |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the branch-exit paths at a NON-FIRST instance | **yes**, and **FOUR** rather than three | eight probes. Forced to `'-'`: `.suspended` 2, `.resumed` 1, `.exited` 23, `.lost` 10. Filed under the opener's FIRST OPENED instance — the adequacy reader's own mutation, which is not semantically equivalent: `.suspended` 1, `.resumed` 1, `.exited` 1, `.lost` 3. **Each of those eight either cost ZERO or caught only the `'-'` half before this item** |
| (2) `JP-R12` at two levels and at depth three | **yes** | the join reading the opener's FIRST instance costs 1; `releaseArrivals` at the satisfied exit 3; `rpathOf` truncated to one segment 5; the twelve-instance key-order loop narrowed to two 1 |
| (3) N = 0 inside a map, including `JP-R10`'s enclosing MAP INSTANCE | **yes**, at BOTH of `JP-R10`'s emission sites | at N = 0, forced to `'-'` costs 3 and filed under the first instance 1; at the `unsatisfiable` exit, 2 and 1. **Both were 0 in the second direction before `THREE_MAPS`**, because in every other document the region `JP-R10` names has exactly one instance |
| (4) retention released PER INSTANCE | **yes** | `heldArrivals`' inner loop narrowed to each opener's first instance costs 1 and `heldByInstance`'s costs 2 — it was **0** before; `releaseArrivals` at the `unsatisfiable` exit 1; the interleaving's ORDER collapsed 1 |
| (5) ADR 0044 visibility across a region nested in a map | **yes** | `outputIsVisible`'s `depth === 0` widened costs 8 and its depth floored at 1 costs 38; the row's settlement loop narrowed to one instance 1. The row's own CONTROL is the LIST form, refused by name |
| (6) Q95's precondition at instance granularity, **with its COST** | **yes**, on a second document | `firedAdd` at the satisfied exit costs 2 **and now prints `DuplicateTaskId: "r1:after:0:0" was already dispatched in run "r1"`**, which the first fixture could not produce; at the `unsatisfiable` exit, 1 |
| (7) the file's own CASE-level membership, and a COUNT beside the census's differences | **yes** | a case RENAMED costs 1 where the suite census is blind to it; the census re-sourced AND a case renamed costs 2; the case list re-sourced AND a case DELETED costs 1, by the literal count alone |

**What broke.**

**Both readers found the same axis from opposite ends, and neither found it where the plan said to
look.** P22 fact 5 named three branch-exit paths as the undriven class; **`branch.lost` was already
bound at 7** (the L5 `nested-inner-lost` row, whose regions sit at path `1`), two were at 0, and
**four more sites the enumeration does not name were also at 0** — `firedAdd` at both of
`settleJoin`'s exits, `releaseArrivals` at the `unsatisfiable` one, and `JP-R10`'s emission at
N = 0 — plus `branch.exited`, `spec/join-policy.md` section 2's fourth branch-ending event, which
W84 edited for the same reason and which *three* excludes by construction
([Q352](../questions/q352.md)).

**And the author bound the EASY half of the mis-keying at every one of those sites.** Forcing `'-'`
was caught; filing the event under the opener's **first opened instance** cost **ZERO** at
`branch.suspended`, `branch.resumed`, `branch.exited` and both of `JP-R10`'s sites — because both
parks were in instance 0, which is also `values()[0]`, and because in every fixture the region
`JP-R10` names had exactly one instance. *That is [Q349](../questions/q349.md)'s finding reproduced
by the item written to discharge it* ([Q353](../questions/q353.md)). Closed by parking instance 1
and settling it first, and by a three-nested-map document in which the enclosing region has two.

**Eleven of the thirteen cases this item first shipped were deletable at `npm test` EXIT 0**, taking
four of its six declared Outputs with them, because the only thing binding them was a census over
SUITE names and **an empty suite is still a suite** ([Q356](../questions/q356.md)). The census's own
control — `names.length >= SUITES.length` — is defeated by a one-token re-source that empties both
of its set differences, which is v0.21's clause failing v0.22's test. A COUNT is not.

**Three of the author's own expectations were wrong and the run corrected each**, which is what
deriving on paper first is for: `JP-R12`'s `{}` **propagates** into the enclosing branch rather than
being an absence ([Q354](../questions/q354.md)); `FD-V28` demands the **bare** form, because a region
nested inside a `map` multiplies the READERS and not the visible outputs — and the author had
reasoned from that rule's error MESSAGE rather than from its condition
([Q355](../questions/q355.md)); and the enclosing map's own collection is live at the instant an
inner instance releases.

**A claimed COST the item's own fixture could not produce.** The `Verification` block claimed a
`DuplicateTaskId` for [Q13](../questions/q13.md); measured, the string does not occur — in
`FANOUT_IN_MAP` the inner join routes into ANOTHER JOIN, so a doubled fire records a second arrival
and mints nothing at all. A second document with a TASK after the inner join makes the same defect
loud ([Q357](../questions/q357.md)).

**A citation with no referent, in four places including shipped test prose.** *"W84's adequacy
reader, finding 8"* does not exist: W84's file carries one numbered reader finding, its finding 7,
on a different subject. The measurement was sound and is this item's own; only the attribution was
not, and it had been inherited rather than checked.

**`spec/join-policy.md`'s *section 3 is byte-unchanged for the sixth version running* is FALSE, and
was already false at v0.17.** `JP-R10`'s row is at line 392, inside section 3 (345-428), and both W84
and this item edited it while incrementing the counter. What is true — and what the sentence was
reaching for — is that the three POLICY DEFINITIONS have not moved since v0.13, which is what the
header says now.

**And `check:markdown`'s link count in W84's Record is stale by one.** Measured on a pristine
`git archive` of `40d9343` with `node_modules` copied in: **145 documents, 6465 relative links, 336
anchored**, where that Record says 6464. Its other two figures are right. Corrected there as a
declared exception, because a number a later item re-takes is the one direction section 1 rule 5's
provenance clause exists for.

**And the HARNESS was the last defect, found after both readers had reported.** Its content digest
read `git ls-files`, which lists **TRACKED** files only — so the two files this item ADDS were
**outside the guard**, and most of its test-side probes edit one of them. Measured: appending a line
to `test/driver/nested-regions.test.ts` left the digest at `8d3f8f155f91a592 380`, unmoved, three
times running. *Nothing went unobserved, because `edit.py` asserts every restore byte-for-byte and
that is the other guard* — but the digest's CLAIM was *the tree is held still* and its REACH was a
subset that excluded the item's own output, which is exactly the shape rule 8's harness clause exists
to refuse. Widened to `--cached --others --exclude-standard` (382 files, `a95a5df23654025e`) and
**both passes re-run whole under it**, with the same verdicts.

**`npm run gate` — `GATE EXIT=0`, ZERO `FAIL` lines, 31 chain entries**, `selftests` **8 / 8
completed, 8 ok**, run TWICE: once before the record step at digest `8d3f8f155f91a592` over 380
tracked files, and once as the confirming gate over the FINAL tree at **`2810199b8e47c3b2` over 382
tracked-and-untracked-unignored files**, both green on their first run. The counts it printed: `check:spec` **7 / 61 / 108**, `check:docs` **34 — 28 run, 6 check**, `check:workers`
**16**, `check:markdown` **146 documents / 6554 relative links / 342 anchored**, L1-L5 **47 / 1322**
in node, deno and chromium, and L6 **1724 assertions** in BOTH runtimes. *The exit code is the
predicate and the FAIL count is the secondary signal* (`doc/workflow.md` section 4, v0.15) — both are
recorded, and the rung was RUN and redirected rather than piped.

**What this taught.**

**A gap read off a DIFF and a gap read off a PROBE are different sets, and they can differ in both
directions at once.** P22 fact 5 was derived by asking which lines W84's change EDITS — exactly right
as a way to find candidates, and not a measurement of what is OBSERVED. Three of its members turned
out wrong in the same re-take: one was already bound, and two of the six sites actually at zero are
not events at all. *The declaration step's job is not to confirm the plan's enumeration but to
replace it.*

**And the mis-keying an author binds is the one the TYPE suggests.** `'-'` is the value every
pre-nesting flow carries and the one a reader's eye supplies; the opener's FIRST INSTANCE is a
well-formed path, indistinguishable from the right answer in any fixture where the thing being
discriminated sits at index 0. [Q349](../questions/q349.md) named that for a RELEASE and this item
reproduced it for an EMISSION, in the file written to act on Q349 — which is why the ORDER inside a
fixture is a claim, and why *which instance* a fixture exercises is another.

**Questions raised.** [Q352](../questions/q352.md) (a class of churn enumerated from a diff is not
the class a probe measures, and can be wrong in both directions),
[Q353](../questions/q353.md) (`values()[0]` is where the wrong instance and the right one are the
same string), [Q354](../questions/q354.md) (`JP-R12`'s `{}` propagates, so an empty collection is an
ARRIVAL), [Q355](../questions/q355.md) (a rule's error message reads like its condition and computes
something else), [Q356](../questions/q356.md) (a membership over SUITE names is satisfied by an
empty suite), [Q357](../questions/q357.md) (the same mis-keyed latch is silent or loud depending on
what the join's successor is). **None resolved** — an item that asserts what its predecessor built
closes no row, and says so rather than reaching for one. Census **278 / 217 / 2 / 59**, re-derived
from scratch and wrong in two NEW directions before it was right. **ADR 0063 reserved and UNUSED, as
the plan predicted.**
