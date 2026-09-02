# W21 — The branch path is a path

**Status:** todo
**Plan:** [P7](../plans/p7-is-a-join-transitive-over-nested-fan-out.md) — the second of its four
items. It makes a nested run **mint the ids the grammar reserved** and takes no decision about the
join: transitivity is [Q6](../open-questions.md) and belongs to W22.

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
            (4) [Q114](../open-questions.md) closed: a join routes out of
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
| **[Q114](../open-questions.md) is real and it is the fork's whole weight** | `driver.ts:951`, `settleJoin`: `if (edge) this.enter(runId, edge.to, null)` — no `fromBranch`, no `fromRegion`. At depth 1 a join's successor is outside every region and `'-'` is right. **Inside a nested region it is wrong**, and the outer region records the arrival of branch 1 as `'-'` |
| **A path is derivable from the graph alone** | `innermostRegionOf` gives the region, `branchIndexOf` the index, and the region's own fanout is a node whose path is derivable the same way — so walking innermost-outward terminates at a node in no region. **`FD-V19` and `FD-V22` are what make it unique**, which is `spec/task-id.md` section 1's *"a property of the node"* claim being literally true rather than a description of how the driver happens to thread it |

### The fork, stated and NOT taken

**Both options produce the same ids. They differ in whether the path is threaded or derived**, and
therefore in what happens to [Q114](../open-questions.md).

| | **A — thread it** | **B — derive it** |
|---|---|---|
| what changes | the `fanout` arm prefixes `fromBranch`; `buildTaskId` takes a path | a `branchPathOf(regions, nodeId)` walks the containment chain; the driver asks for a node's path instead of carrying one |
| Q114 | **stays open, and needs new state** — a join's successor's path is the path its *region* sits at, which nothing currently records. A `Map<fanoutId, branchPath>` is the obvious answer and would be **the first mutable per-run map added to the driver since W3** | **dissolves.** The successor is a node; its path is derivable like any other |
| against | `fromBranch` is already threaded through five call sites and this makes it load-bearing at every one. A path that is *carried* can diverge from the graph, which is the class `spec/task-id.md` section 1 calls a property of the node | the walk is O(depth) per dispatch where threading is O(1), and it puts a **definition-layer** function on the driver's hot path. It also wants `branchPathOf` in `src/definition/regions.ts`, which is **W20's file** and would be a declared exception |
| for | local, no new exports, no new file touched | it makes the spec's own sentence true, it removes state rather than adding it, and it closes Q114 without a decision |

**This item measures both before choosing and records the measurement**, which is what its readers
will check. **If the choice needs an ADR it takes the next free id** and says so; P7's block holds
none for it, and reusing W20's skipped 0031 is refused by `doc/workflow.md` section 3.

## Scope

**In**

1. **`buildTaskId` accepts a path.** Widening `branchIndex` to `number | number[] | null` keeps every
   existing caller working and makes the function the exact inverse of `branchIndices`, which is the
   shape `spec/task-id.md` section 1 already describes. A `branchPath: string` parameter is the other
   candidate and is a **breaking** change to public surface; the item states which it took and why.
2. **A nested fan-out opens its branches at the dotted path**, and dispatches at it.
3. **The two `split('.')[0]` sites read the whole path.**
4. **[Q114](../open-questions.md)**, by whichever arm of the fork is taken.
5. **`spec/task-id.md` describes a shape that occurs**, rather than one it reserved.

**Out** — named rather than left implicit, with where it goes instead

- **The join.** Whether an outer join waits for grandchildren is [Q6](../open-questions.md) and
  **ADR 0030 is W22's**. This item makes the ids right and changes no policy.
  **[Q113](../open-questions.md) is W22's to answer before it declares**, and this item does not
  answer it — but it is the item most likely to *learn* the answer, so anything it learns goes in the
  Record for W22 rather than into a decision here.
- **Real workers.** `examples/**` is W23's. **`examples/run-flow.ts:619`'s `Number(branchPath)` will
  break** the moment a suspension happens inside a nested region; this item **names it and does not
  fix it**, because L6 is W23's gate and a fix here would be untested until W23 runs.
- **Depth as a bound.** The grammar admits any depth and W20 asserted the resolver at depth 3. This
  item asserts minting at **depth 2**, and an item claiming depth 3 mints correctly owes a case.
- **`attempt`.** [Q111](../open-questions.md) — the fourth segment is inert at every rung and
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
([Q112](../open-questions.md), which W20's adequacy reader corrected and which P7's retro rules on).
**Re-run the whole set after acting on the readers**, and check their exact edits back in as probes.

*Per the template:* a branch routed away from its join (Q4) — **applicable and covered**, an exit
inside a nested region is one of the shapes the ids must be right for; `user_action` (Q17) —
**applicable**, `examples/run-flow.ts`'s inbound step is where the `NaN` above surfaces, and it is
named in Scope/Out; no matching decision edge (Q10) — not applicable; a duplicate task id (Q13) —
**applicable and the point**: two nested branches minting the same id is exactly what a discarded
prefix causes, and `ID-R1` is what would catch it; a nested fan-out (Q6) — **this item is the id half
of it**.

## Record

*Filled in when the item is done.*
