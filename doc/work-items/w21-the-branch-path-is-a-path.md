# W21 — The branch path is a path

**Status:** DONE - 2026-09-02. Both readers ran; all eighteen findings acted on
**Plan:** [P7](../plans/p7-is-a-join-transitive-over-nested-fan-out.md) — the second of its four
items. It makes a nested run **mint the ids the grammar reserved** and takes no decision about the
join: transitivity is [Q6](../questions/q6.md) and belongs to W22.

```
Spec:       spec/task-id.md section 1 — the `branchPath` segment, which has
            reserved the dotted shape since P1 and has never been produced.
            This item makes the reserved half reachable; it does not change
            the grammar. Expected values come from that section and from
            spec/flow-definition.md section 4's region definition, never from
            what the driver emits (doc/workflow.md section 5 rule 1).
Owns:       src/driver/ids.ts            (W3)
            spec/task-id.md              (W1)
            spec/README.md               (W1) — check-spec's C8 makes its
                                         version row a consequence of any
                                         spec/** bump
            test/driver/log.test.ts      (W3) — `buildTaskId`'s own suite, and
                                         the file that asserts its signature
Inputs:     W20's `innermostRegionOf` and the corrected `branchIndexOf`, which
            answer *which region* and *which branch of it*. This item answers
            *what is the whole path*.
            `branchIndices('1.0') -> [1, 0]`, which has existed since P1 and
            has no producer — `spec/task-id.md` calls the shape
            "forward-looking".
            `FD-V19` and `FD-V22`, which are what make a path derivable at
            all: they keep a node out of two branches of one region and out of
            any region it was not opened into.
Outputs:    (1) `buildTaskId` accepts a PATH, not just an index;
            (2) a nested fan-out's branches open at the dotted path — today
                they open at the bare inner index and the outer prefix is
                discarded;
            (3) the two `branchPath.split('.')[0]` sites read the whole path;
            (4) [Q114](../questions/q114.md) closed: a join routes out of
                itself carrying the path its region sits at, not `'-'`;
            (5) `spec/task-id.md`'s two stale sentences about `FD-V15`
                finished — W20 corrected the citations; this item makes the
                section describe a shape that now occurs.
Depends on: W20, and hard: `branchPathOf` (option B below) is a walk over the
            containment relation W20 defined, and threading (option A) still
            needs `innermostRegionOf` to know when a fanout is nested.
Blocks:     W22 (the decision) and W23 (real workers).
Tests:      L1 and L2, values derived from the spec before running:
              - `buildTaskId` round-trips with `parseTaskId` for `-`, `1` and
                `1.0`, and `branchIndices` is its inverse;
              - on `valid/nested-fanout.flow.json` the driver dispatches
                `r1:scoreC:1.0:0` and `r1:scoreD:1.1:0`, and opens the inner
                branches at `1.0`/`1.1`;
              - every region event's `branchPath` is the path of the node it
                names, in BOTH declaration orders — W20's property, one layer
                out;
              - the depth-1 corpus mints exactly what it minted before, which
                is the clause a path change can quietly break.
Gate:       L0-L5, climbed from L0. This item's own new coverage is L1 and L2;
            L2 is where it lands, because a nested run's ids are exactly
            "routing from a fixture log with no scheduler". **L6 is NOT this
            item's** — a nested flow on real workers is W23's, and reporting
            L6 green here would report W23's row as covered. Then the two
            readers of `doc/workflow.md` section 6, the adequacy one in an
            isolated copy.
Reserves:   Q117-Q120, ADR — none in P7's block. 0030 is W22's and 0031 was
            W20's reserve, now skipped. If the fork below needs a decision it
            takes the next free id on ADR 0029's precedent, and says so.
```

## The load-bearing fact, measured before this was declared

*Tenth consecutive plan to measure before declaring. **This one names a fork rather than closing
it**, because the two options differ in what they do to `Driver`'s state and the difference is the
item's central design question rather than a detail of it.*

| | measured |
|---|---|
| **The outer prefix is discarded in exactly one place** | `driver.ts:721` and `:723`, the `fanout` arm: `branchPath: String(i)` and `this.enter(runId, b, payload, String(i), region.fanoutId)`. `fromBranch` is in scope at both and is thrown away. On `valid/nested-fanout.flow.json` the inner branches therefore open at `0`/`1` and `scoreC` is dispatched `r1:scoreC:0:0` |
| **`buildTaskId` cannot express a path, and its signature is public** | `branchIndex: number \| null`, so the dotted shape is unreachable from the minter. `branchIndices` is already its inverse and already returns `number[] \| null` — **the two halves of one conversion, and only one of them exists** |
| **Three callers outside `src/driver/**` read that signature** | `test/driver/log.test.ts:239-240` asserts it directly; **`examples/run-flow.ts:619` calls `buildTaskId(runId, at, Number(branchPath), 0)`, which is `NaN` on a dotted path** — W23's file, and it is why the inbound step must be looked at before W23 rather than during it; and `test/driver/lifetime.test.ts:442` uses the three-argument form |
| **[Q114](../questions/q114.md) is real and it is the fork's whole weight** | `driver.ts:951`, `settleJoin`: `if (edge) this.enter(runId, edge.to, null)` — no `fromBranch`, no `fromRegion`. At depth 1 a join's successor is outside every region and `'-'` is right. **Inside a nested region it is wrong**, and the outer region records the arrival of branch 1 as `'-'` |
| **A path is derivable from the graph alone** | `innermostRegionOf` gives the region, `branchIndexOf` the index, and the region's own fanout is a node whose path is derivable the same way — so walking innermost-outward terminates at a node in no region. **`FD-V19` and `FD-V22` are what make it unique**, which is `spec/task-id.md` section 1's *"a property of the node"* claim being literally true rather than a description of how the driver happens to thread it |

### The fork, stated and NOT taken

**Both options produce the same ids. They differ in whether the path is threaded or derived**, and
therefore in what happens to [Q114](../questions/q114.md).

| | **A — thread it** | **B — derive it** |
|---|---|---|
| what changes | the `fanout` arm prefixes `fromBranch`; `buildTaskId` takes a path | a `branchPathOf(regions, nodeId)` walks the containment chain; the driver asks for a node's path instead of carrying one |
| Q114 | **stays open, and needs new state** — a join's successor's path is the path its *region* sits at, which nothing currently records. A `Map<fanoutId, branchPath>` is the obvious answer and would be **the first mutable per-run map added to the driver since W3** | **dissolves.** The successor is a node; its path is derivable like any other |
| against | `fromBranch` is already threaded through five call sites and this makes it load-bearing at every one. A path that is *carried* can diverge from the graph, which is the class `spec/task-id.md` section 1 calls a property of the node | the walk is O(depth) per dispatch where threading is O(1), and it puts a **definition-layer** function on the driver's hot path. It also wants `branchPathOf` in `src/definition/regions.ts`, which is **W20's file** and would be a declared exception |
| for | local, no new exports, no new file touched | it makes the spec's own sentence true, it removes state rather than adding it, and it closes Q114 without a decision |

**This item measures both before choosing and records the measurement**, which is what its readers
will check. **If the choice needs an ADR it takes the next free id** and says so; P7's block holds
none for it, and reusing W20's skipped 0031 is refused by `doc/workflow.md` section 3.

## Exceptions — files edited outside `Owns` and outside the record step

**Four, and the first two are a declaration error of this item's own.** P7's index table gave W21
*"`src/driver/ids.ts` **and the two `split('.')` sites in `src/driver/driver.ts`**"*, and this
declaration's `Owns` block **narrowed the driver out**. That is W20's finding one item on — a
declaration whose `Owns` does not cover where its work lands — and it is recorded rather than folded
in.

| File | What, and why |
|---|---|
| `src/driver/driver.ts` | **Declared LATE, and P7's own table had it.** Where the derivation replaces the threading: `advance`, `dispatch`, the `fanout` arm, `branchPathFor` → `pathOf`, and `settleJoin`'s exit ([Q114](../questions/q114.md)) |
| `src/definition/regions.ts` | **Anticipated in the fork above and now taken.** `branchPathOf` lives with the containment relation W20 defined, because it is a walk over it. W20's file |
| `test/driver/surface.test.ts` | W20's four seam cases settle `r1:scoreC:0:0`, which is the id this item changes; they move to `r1:scoreC:1.0:0`, and two new cases land beside them |
| `test/definition/nesting.test.ts` | W20's file; one case, asserting the derived path and the widened minter together |
| `AGENTS.md` | **Declared LATE, and it is the same row W20 wrote.** Section 11 said a task inside a nested region *"is dispatched with a single-index `branchPath` where `spec/task-id.md` reserves a dotted one"* — which is precisely what this item fixed, so the consumer reference told a reader the shipped fix did not exist. W21's Verification table considered `AGENTS.md`'s executed **snippets** (X3/X4) and not its **prose**, which is absorption rather than rot: no check can see it. In nobody's `Owns` and not a record-step file |

**The `Tests:` line named `test/driver/log.test.ts` up front and that part worked** — W20's finding
was acted on. What it did not anticipate is that this item's L2 coverage belongs beside W20's seam
suite rather than in the minter's own file, because the claim is about what a **run** dispatches.

## Scope

**In**

1. **`buildTaskId` accepts a path.** Widening `branchIndex` to `number | number[] | null` keeps every
   existing caller working and makes the function the exact inverse of `branchIndices`, which is the
   shape `spec/task-id.md` section 1 already describes. A `branchPath: string` parameter is the other
   candidate and is a **breaking** change to public surface; the item states which it took and why.
2. **A nested fan-out opens its branches at the dotted path**, and dispatches at it.
3. **The two `split('.')[0]` sites read the whole path.**
4. **[Q114](../questions/q114.md)**, by whichever arm of the fork is taken.
5. **`spec/task-id.md` describes a shape that occurs**, rather than one it reserved.

**Out** — named rather than left implicit, with where it goes instead

- **The join.** Whether an outer join waits for grandchildren is [Q6](../questions/q6.md) and
  **ADR 0030 is W22's**. This item makes the ids right and changes no policy.
  **[Q113](../questions/q113.md) is W22's to answer before it declares**, and this item does not
  answer it — but it is the item most likely to *learn* the answer, so anything it learns goes in the
  Record for W22 rather than into a decision here.
- **Real workers.** `examples/**` is W23's. **`examples/run-flow.ts:619`'s `Number(branchPath)` will
  break** the moment a suspension happens inside a nested region; this item **names it and does not
  fix it**, because L6 is W23's gate and a fix here would be untested until W23 runs.
- **Depth as a bound.** The grammar admits any depth and W20 asserted the resolver at depth 3. This
  item asserts minting at **depth 2**, and an item claiming depth 3 mints correctly owes a case.
- **`attempt`.** [Q111](../questions/q111.md) — the fourth segment is inert at every rung and
  hard-coding it to `0` survives the whole gate. Same file, different question, and lifting one
  reserved segment is not lifting two.

## Verification

| Clause | Command |
|---|---|
| L0 | `npm run check:spec` (**C8** moves with `spec/task-id.md`), `check:source`, `check:scheduler`, `check:policies`, `check:docs` — **`AGENTS.md` documents `buildTaskId`, so X3/X4 are live here**; `npm run lint`, `npm run typecheck` |
| L1-L5 | `npm run test`, `test:deno`, `test:browser` — **chromium only** by default; `test:browser:all` is firefox and webkit and the gate does not run it. **This item's own coverage is L1 and L2** |
| L6 | **NOT RUN — by declaration.** W23's. Reported as *did not run* per section 1 rule 4, and **not** as *"stayed green"*, which is how W20's first Record contradicted itself |
| conformity reader | fresh context, spec first, re-deriving the expected ids for a nested run before looking at them |
| adequacy reader | tests second, mutating **in an isolated copy** — links measured first, green in the copy before the reader starts, scan before removing |

**Rule 8 — all THREE v0.8 obligations**, and the third one is why W20's readers found eight blocking
findings: the rule's clauses, the `Outputs` rows, **and the provenance of every value an assertion
reads** — break the source of the ACTUAL value, and where a probe breaks an expected value, pair it
with a code mutation or check whether that value also fixes the assertion's **domain**
([Q112](../questions/q112.md), which W20's adequacy reader corrected and which P7's retro rules on).
**Re-run the whole set after acting on the readers**, and check their exact edits back in as probes.

*Per the template:* a branch routed away from its join (Q4) — **applicable and covered**, an exit
inside a nested region is one of the shapes the ids must be right for; `user_action` (Q17) —
**applicable**, `examples/run-flow.ts`'s inbound step is where the `NaN` above surfaces, and it is
named in Scope/Out; no matching decision edge (Q10) — not applicable; a duplicate task id (Q13) —
**applicable and the point**: two nested branches minting the same id is exactly what a discarded
prefix causes, and `ID-R1` is what would catch it; a nested fan-out (Q6) — **this item is the id half
of it**.

## Record

**Both readers ran. Conformity: 13 findings, 3 BLOCKING. Adequacy: 52 mutations, 5 BLOCKING. All
eighteen acted on, and the set was re-run after — 19 probes, 2 survivors, both classified.**

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **RAN, green** | `check-spec` 8 checks — **C8 moved with `spec/task-id.md` v0.7**; `check-source` 11 checks / 13 published files; `check-scheduler` 5 + **12/12**; `check-policies` 3 + **13/13**; `check-docs` 5 + **14/14**; `deno lint` **43 files**; `typecheck` 5 projects. *(`deno lint` caught two needless `async` keywords the author's own grep for `error TS` did not — the second time this session the exit code found what a pattern missed.)* |
| L1-L5 | **RAN, green** | **426 `test()` cases over 19 files** (+2 over 424, +10 over W20's 416) in node 24.20.0, deno 2.9.6 and chromium, parity asserted. **This item's own coverage is L1 and L2**; L3, L4 and L5 climbed as regression and none moved |
| L6 | **NOT RUN — by declaration**, and it is W23's | It stayed green at **373 assertions / 21 real runs** in both runtimes throughout, which is the expected result: nothing here changes a depth-1 run, and there is no nested flow at L6 yet. **Reported as *did not run* rather than as *"stayed green"***, which is how W20's first Record contradicted itself |
| conformity reader | **RAN — 13 findings, 3 BLOCKING; all acted on** | It re-derived every `branchPath`, every dispatched id and every region event from `spec/task-id.md` v0.7 and `spec/flow-definition.md` section 4 **before opening the diff**, and matched everywhere. Its blocking three: **a valid definition that hangs**; a false claim in the new spec prose; and the stale sentence Output (5) existed to finish, still standing |
| adequacy reader | **RAN** in an isolated copy — **52 mutations, 5 BLOCKING**; all acted on | Zero symlinks measured before the copy and inside it; green at 424 before it started. **It refuted a claim the author asked it to test**, with a counterexample at 1 failure |
| re-run after the findings | **RAN, green** | `npm run gate` **exit 0**, read directly. Whole set re-run: **19 probes, 2 survivors**. No commit exists — this item was not asked to commit, so there is no sha to name |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| **(1)** `buildTaskId` accepts a path | yes — `number \| readonly number[] \| null`, a **widening** | Taking only the first element of the array: **10** L1 failures. Truncating `branchIndices`: **9** |
| **(2)** a nested fan-out opens at the dotted path | yes | The `fanout` arm back to `String(i)`: **3** |
| **(3)** the `split('.')[0]` sites read the whole path | yes — and **both sites are gone**, not fixed: `advance` derives, and `dispatch` lost its `branchPath` parameter entirely | `advance` truncating again: **5**. `dispatch`'s: **6** |
| **(4)** [Q114](../questions/q114.md) closed | yes, **after two fixes and two reader findings** | Reverting to `enter(runId, edge.to, null)`: **3**. Dropping the region again: **1**. Truncating the path to its outermost segment: **1** |
| **(5)** `spec/task-id.md` describes a shape that occurs | yes — **v0.7**, and it took three corrections | **Nothing.** Deleting the whole v0.7 paragraph leaves the gate green — no check reads spec prose, which is the class six retros have refused to mechanise |

**`Owns` audit**, by hand, after the record step.

| | |
|---|---|
| **`Owns`** | `src/driver/ids.ts`, `spec/task-id.md`, `spec/README.md`, `test/driver/log.test.ts` — four, all inside |
| **Exceptions** | `src/driver/driver.ts`, `src/definition/regions.ts`, `test/driver/surface.test.ts`, `test/definition/nesting.test.ts` (**four declared late**, and P7's own table had the first); **`AGENTS.md`** (**a fifth, declared later still** — see below) |
| **Record step** | this file, `doc/plans/p7-*.md`, `doc/README.md`, `CLAUDE.md`, `README.md`, `doc/open-questions.md` |

## Rule 8 — the set, re-run after acting

**19 probes, 2 survivors.** The readers' own edits are checked in as probes (`R1`-`R6`), which is
W18's finding and P6's retro's adopted rule.

| | probe | cost |
|---|---|---|
| A1 | the walk stops after one segment — the pre-W21 answer | **9** |
| A2 | segments appended outermost-last, so the path reverses | **9** |
| A3 | a node in no region gets an empty path | caught (every case errors) |
| A4 | the separator is not a dot | **9** |
| A5 | `buildTaskId` takes only the array's first element | **10** |
| A6 / A7 | the two `buildTaskId` refusals removed | **1** each |
| B2-B4 | the three `Outputs` rows with assertions | **3 / 5 / 3** |
| B5 | the spec paragraph deleted | **SURVIVED** — known refused class |
| C1 | **the reader's Q3**: only the source expression swapped | **1** |
| C1b | its pairing: a dispatch the driver records and never hands to `addTask` | **1** |
| R1-R3, R5, R6 | the readers' five blocking edits | **1** each |
| R4 | the `WANT` domain sourced from its own keys | **SURVIVED — now a no-op**, and its harm is closed: dropping a row from `WANT` costs **1** |

## What broke

**1. A valid definition that hangs, and I shipped it.** Q114's first fix carried the path and passed
`undefined` for the region. The `end` arm attributes a `branch.exited` by the region alone, so **an
inner join routing to an `end` inside the enclosing region emitted no terminal event for the outer
branch at all** — `JP-R5` says a branch that is neither suspended nor in flight has exactly one — and
the outer join sat at `live: 1` forever. Reproduced before fixing.

**And the fix for it was itself blind where it mattered.** The adequacy reader showed the exit path
truncated to its outermost segment survives at depth 2, because `pathOf('inner')` is `'1'` and
`.split('.')[0]` is the identity there — *the case was asserted only where its own distinction
collapses*. At depth 3 with two sibling nested regions, truncation collapses two arrivals into one
and hangs a run under `arrival-count`. Both are now asserted.

**2. Three more real holes, all of them things W21 created.** The `branchPath` grammar's **numeric**
shape was untested — every suite exercised `x`, a non-digit — so `BRANCH_PATH` could be widened to
accept leading zeros and empty segments with everything green, and the consequence is **ADR 0027's
catastrophe restored**: a widened grammar makes `parseTaskId` accept them, tier 0 never fires, and an
id no driver minted **stops the run**. `1..0` is a malformation that could not exist before this
item. `branchPathOf` was not asserted on the one shape both specs single out as having no path.
And `1e21` passed `Number.isInteger` and minted `"1e+21"`, **an id `parseTaskId` rejects** — the one
thing the pair must never do.

**3. Four false claims in prose, three of them in the spec I had just written.** *"No fixture, log
line or test name written before it moved"* — four assertions moved, and the item's own Exceptions
table said so on the same page. *"`buildTaskId` still cannot emit one"* — the sentence Output (5)
existed to finish, still standing. The `-` row's meaning, not updated with the parenthetical that
extended it. And a v0.7 bump recorded in two places and described in neither.

**4. `AGENTS.md` stated this item's defect as current behaviour, and it is the row I wrote in W20.**
Section 11 said a task inside a nested region *"is dispatched with a single-index `branchPath` where
`spec/task-id.md` reserves a dotted one"* — precisely what W21 fixed. The Verification table
considered `AGENTS.md`'s executed **snippets** and not its **prose**. That is absorption rather than
rot: the reference told a consumer the shipped fix did not exist, and no check can see it.

## What this taught

**1. Deriving beat threading on the measurement, and the measurement was the whole argument.**
`branchPathOf` is total over the valid corpus and agrees with the threaded value on every depth-1
flow, so replacing the threading changed no existing id. It closed [Q114](../questions/q114.md) with
**no new state** — a join's successor's path is the path its region sits at, and a region's fanout is
a node. **The fork was decided on evidence and one of its stated costs was wrong**
([Q119](../questions/q119.md)): the walk is O(depth × |regions|²) with a doubled inner call, not
O(depth). The decision stands on its other grounds, none of which depended on the cost.

**2. A fix can make earlier guards dead, and only a re-run sees it.** Adding the `INDEX` test for
`1e21` made `Number.isInteger(n)` and `n < 0` **unreachable** — both were caught before and one
survived after. Three clauses collapsed to one, and the predicate is now exactly the grammar's:
*what `parseTaskId` will accept back, tested on the string this will actually emit.*

**3. The author's account of a rule needed correcting for the second item running** —
[Q112](../questions/q112.md). W20 corrected my *"expected-side probes prove nothing"*; W21 corrected
my *"a source choice cannot be proved by a single-file probe"*, with a counterexample at 1 failure:
substituting **only the source expression** is caught, and my probe survived because it made a second
edit. **A provenance probe changes the source expression and nothing else**; once it edits the
projection it is a rewrite, and its survival says nothing. **For P7's retro: two items, two
corrections, both from the adequacy reader, and both about how the obligation is INSTANTIATED rather
than about what it asks.**

**4. The `Owns` gap recurred, and P7's own table had the answer.** The declaration narrowed
`src/driver/driver.ts` out of a block P7 had put it in. W20's finding was that a `Tests:` line naming
assertions and not paths cannot be audited; **this one names paths and still missed the file the work
lands in**. Five late exceptions. The failure is not the `Tests:` line — it is that an item's `Owns`
was written from its *title* rather than from its plan row.

## Questions raised

- **[Q117](../questions/q117.md)** — the L6 harness mints a **silently wrong** id on a nested flow,
  and this item's declaration described the failure incorrectly. `Number('1.0') === 1`, not `NaN`. At
  depth 3 it *is* `NaN` and the new refusal now **throws** at a call site outside its `try`, inside a
  `queueMicrotask` — an unhandled rejection rather than a reported failure. **W23's.**
- **[Q118](../questions/q118.md)** — two arguments the `fanout` arm passes to `enter` are
  unobservable, because `FD-V9` makes every branch entry a `task` and the `task` arm discards them.
  Dead code that becomes live if `FD-V9` is lifted. Said in place rather than removed.
- **[Q119](../questions/q119.md)** — the derivation's real cost, and whether it matters, which is
  [Q19](../questions/q19.md)'s measurement rather than an argument.

*(Q120 unused and **skipped, never reissued**. No ADR was needed: the fork was settled by measurement
and P7's block held none for this item.)*
