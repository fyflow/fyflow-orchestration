---
id: ADR 0040
title: "What a node can reach is the run's own outputs, and a node id names them relative to a branch path"
status: accepted
date: "2026-09-09"
item: W41
raised-by: Q11, Q166, Q165, Q164, P12
supersedes: ""
amends: ""
resolves: ""
---

# ADR 0040 — What a node can reach is the run's own outputs, and a node id names them relative to a branch path

**Raised by:** [Q11](../questions/q11.md) **in general**, with [Q166](../questions/q166.md),
[Q165](../questions/q165.md) and [Q164](../questions/q164.md) as its cases, decided by
[W41](../work-items/w41-what-a-node-can-reach-and-what-names-it.md) under
[P12](../plans/p12-what-a-node-receives-and-what-a-decision-sees.md)

## Context

**[Q11](../questions/q11.md) has been open since P1 and was half answered.**
[ADR 0037](0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
settled the **fan-out** edge and `spec/flow-definition.md` v0.10 stated what an **ordinary** edge
carries — which is Q11's first candidate, *the previous node's output*, written down at last. Its
other two — **a run-scoped accumulator** and **a declared per-edge mapping** — were both unbuilt, and
Q11's own row calls itself *"the API surface users touch most, so the one most expensive to change
later."*

**A half-answer with two unbuilt candidates is worse than an open question**, because the next item
to need one builds it from the case in front of it. So this decision is made from **three ordinary
flows this library could not express**, and not from a mechanism:

| | the flow | why it was blocked |
|---|---|---|
| [Q166](../questions/q166.md) | *score each item **against the run's config*** | a `map` instance receives its own item, so `config` is reachable from a `score` worker by **no route at all** |
| [Q165](../questions/q165.md) | *score, then **fan out over the scores*** | a satisfied join carries an object keyed by `branchPath`, so **no key holds the results as a list**; the one affordance (`over: "0"`) couples the flow to branch numbering |
| [Q8](../questions/q8.md) | *route to review if **any earlier step** flagged low confidence* | `DecisionContext` has one field. **W42's**, and it is decided after this one deliberately (P12 decision 1) |

### What was measured, at the scope it was measured at

`doc/workflow.md` section 1 rule 5's writing clause. Every figure below came from a run on this
item's own tree; the scripts are thrown away with `dev-dist/`.

| | measured |
|---|---|
| **a worker's channel is ONE value** | `createTask` receives `{id, workerType, payload, optional}` — measured by reading what the fake scheduler is handed. So *what a node receives* is necessarily a question about how **one** value is COMPOSED, and it is why the accumulator alone cannot answer it. **A predicate's channel is an object that can grow a field**, which is the asymmetry [Q8](../questions/q8.md) turns on and is W42's |
| **a node id names one output outside a map region and N inside one** | Re-taken over **every** region-bearing corpus flow — **eight**, once the census was bound to the directory rather than to a list beside itself. Four carry only `fanout` regions and collapse **nothing**: `fanout-join` 0 of 4, `nested-fanout` 0 of 4 at the dotted paths, `fanout-failure` 0 of 4, `p1-routed-away` 0 of 4 with a branch routed away from its join. Four carry a `map` region and every one collapses: `map-fanout` **2** of 5, `map-in-fanout` **1** of 6, `map-with-context` **1** of 4, `map-over-region-output` **4** of 7. **Exactly the map regions collapse, at any depth, and no `fanout` does** — *and the last two `fanout` rows were missing until W41's adequacy reader's bound found them, so this claim rested on two flows where it now rests on four* |
| **the pair `(node id, branchPath)` does not collapse** | The same eight runs, keyed by the pair: distinct in **all** of 4, 4, 4, 4, 5, 6, 4 and 7 |
| **the projection is computable AT the moment `enter` needs it** | Taken from **inside the driver's own turn**, through `createTask`, over `map-in-fanout`: `merge@1.0` is dispatched with `{ingest@-, scoreA@0, extract@1}` already IN THE PROJECTION, and `publish@-` with `merge@1.0` and `merge@1.1` both **visible** in rule 4's sense. *(This row said *"visible"* of the first set too, and `scoreA@0` is NOT visible to `merge@1.0` — neither path is a prefix of the other, and `FD-V27` refuses that reference anyway. **This ADR's own defined term, used loosely in the row that defines what it is measuring.** W41's conformity reader.)* **Built over `snapshot()` alone — no new RETENTION**, which is the claim; the shipped method adds **one** field, a memo keyed on the log's own length (see *what it costs*). Cost: 0.027 ms over a 6-record log |
| **[Q164](../questions/q164.md) is live and total** | A rule declared as `FD-C1` in a rules table of `spec/flow-definition.md` **and cited one line below it** made `check-spec` report *8 checks ok, **80 rules**, exit 0* — not counted, not checked for uniqueness by `C2`, not checked for an owner by `C6`. And the id vocabulary was written down **twice** in `scripts/check-spec.mjs`, in two literals that had to agree |
| **the default is unchanged, and that is a number** | With the mechanism shipped, L1-L5 is **574 cases, unmoved**, in node — because a node that declares nothing takes the same expression it took at v0.10 |

### The finding that settles it

**Q11's second and third candidates are not alternatives — they are the STATE and the ACCESS, and
only the third can reach a worker at all.**

A run-scoped accumulator has no channel to a worker: `createTask` takes one value, so an accumulator
that is not *selected from* and *composed into* that value is invisible to the thing that needs it.
Adding it unconditionally would change what **every** node receives and break every worker written
against v0.10. So the accumulator is what a reference resolves **against**, and the declared mapping
is what resolves it — and the two candidates the register presents as a fork are one mechanism in
two halves.

**And the accumulator half is free, which is the second finding.** It is a **projection** of a log
this driver has always kept: `private readonly log: LogRecord[]` with exactly one `push`, no
`splice`, `shift` or reassignment, `OutcomeRecord.result` on every settled task, and `snapshot()`
already public. **No new RETENTION** — and *no new fields* was true when this ADR was drafted and
is not true of what shipped: `outputsCache` is one field, discarded and rebuilt the moment the log
grows, so it holds nothing the log does not. *(2026-10-21, [ADR 0121](0121-the-driver-keeps-a-per-task-view-of-its-log.md),
W195: CAUGHT UP as the log grows rather than rebuilt — each entry still the merge of its task's own records, so still
nothing the log does not hold.)* **Corrected here rather than left standing**, because
the sentence and the code stopped agreeing when the cost was re-taken and the memo was added. W41's
conformity reader. [Q19](../questions/q19.md)'s *"if Q8 or Q11 retains every node
output"* described **today** before this decision existed — P12's fact 1 corrected that row, and this
confirms it from inside the driver rather than from outside the run.

**So the whole cost of this decision is the KEY**, which is P12 decision 2 and is what the
measurements above discriminate.

## Decision

**Six rules. Two are `spec/flow-definition.md`'s new `FD-C1` and `FD-C2`; the rest are what those
rest on.**

1. **A node that declares nothing receives what it received at v0.10 — the ordinary edge's value,
   unchanged.** Stated first because it is what makes this decision affordable to have got wrong:
   `needs` is opt-in, the composition is identity without it, and a node that declares none never
   even computes the projection. **574 L1-L5 cases unmoved** is the measurement of that rule.

2. **What a node can reach is the run's own outputs, and it is a PROJECTION rather than new state.**
   Derived from the log on demand, through `effectiveOutcome` so a resumed node has one answer and a
   suspended one has none. ***Amended 2026-10-19 by [ADR 0117](0117-a-reference-may-name-what-reached-the-run.md)* (W190): a node can reach the run's own outputs AND the
   value the run was handed — `"$payload"`, read from the checkpoint header the driver already keeps, so still no new
   state.** ***Amended 2026-10-19 by [ADR 0118](0118-a-map-instance-keeps-its-item-while-a-node-of-it-may-still-be-entered.md)* (W191): and the item of the reader's own map instance — `"$item"` —
   which IS new state, the one structure this rule's "computed rather than maintained" gives way for: each instance keeps
   its item while a node of it may still be entered (`RN-R13`'s sixth term).** ***Amended 2026-10-21 by [ADR 0121](0121-the-driver-keeps-a-per-task-view-of-its-log.md)* (W195): the projection is CAUGHT UP as the log grows rather than rebuilt, each entry the merge `effectiveOutcome` makes of ONE task's records, read from a per-task view of the log the driver maintains in `append` — references to the log's own records and nothing derived, so not the second source this rule refuses; and every other per-task read the driver makes goes through that view.** ***Amended 2026-10-22 by [ADR 0124](0124-a-reference-read-costs-its-answer.md)* (W199): and FOUND by the prefix its readers share — the projection keeps, per node a reference names and per shared depth, its OWN entries grouped by `visibilityKey` and grown where an entry changes, so a read costs its answer; entries by reference and nothing derived, under ADR 0121's condition.** **Computed rather than maintained**, deliberately: a maintained index is a
   second source that can disagree with the log, which is the defect [Q43](../questions/q43.md),
   `arrival-count`'s re-sourcing and
   [W34](../work-items/w34-what-a-branch-receives-and-what-a-join-carries.md)'s
   `arrival-count-decrementing` are each an instance of.

3. **What NAMES an output is the pair `(node id, branchPath)`** — `FD-C2`. A node id **alone** does
   not, and the refusal is measured rather than argued: a map region holds N outputs under one id, at
   any depth, and no `fanout` region ever does. **That is
   [ADR 0036](0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)'s
   deciding fact for the THIRD time** ([Q160](../questions/q160.md)) — its own key collapsed, W33
   found every per-region run-time structure keyed the same way, and this is the third.

   **The other two candidates P12 named are refused, each on a measurement.** The **node id** alone
   collapses, above. The **task id** carries the run id as its first segment
   (`spec/task-id.md` section 1), and a run id is **configuration supplied at construction**
   ([ADR 0022](0022-a-driver-takes-its-run-at-construction.md) rule 3) — so a definition naming one
   would be a document only one run may use, which is
   [ADR 0002](0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md) rule 1's
   *inert JSON* meaning something different for every run.

4. **What an AUTHOR writes is a node ID, and the run resolves it relative to the reader's own branch
   path.** The pair is the key and it is not writable: inside a `map` region a branch path is a
   property of the **dispatch**
   ([ADR 0036](0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)
   rule 5, `ID-R6`), so no author can write one and a document that contained one would be a document
   about one run. **Resolution is one predicate**: an entry is visible when one path is a prefix of
   the other, segment-wise — `-` being a prefix of everything.

5. **The grammar is three forms and invents one token** — `FD-C1`. `"."` is what the node would have
   received anyway; `"n"` is that node's output **on this node's path**, exactly one; `["n"]` is that
   node's outputs as an **array** in ascending `branchPath` order, `JP-R12`'s order rule and its
   reason. **The array form is JSON's own array syntax rather than a second sigil**, and `"."` is
   safe because `.` is outside `FD-V16`'s charset, so no node may ever be called it. ***Amended 2026-10-19 by
   [ADR 0117](0117-a-reference-may-name-what-reached-the-run.md)* (W190): v0.13 added the `?` modifier, and v0.44 a fourth form, `"$payload"`, under a reserved `$`
   PREFIX — `"$item"` its second reference (W191).**

   **Which form is legal is a property of the GRAPH and is refused at instantiation** (`FD-V28`): a
   node produces more than one output for a reader exactly when the reader is outside a region
   containing it. So *which shape arrives* is never a run-time surprise, and *two shapes for one
   reference* — the obvious hazard in this design — is not a hazard, because the document decides it
   and the validator says so.

6. **A node that declares a `needs` receives exactly the object it describes, and each key its own
   copy.** No wrapper, no reserved key — `"."` is how the edge's own value is asked for, so what the
   worker gets is what the document says, character for character. The per-key copy is
   **`JP-R11`'s invariant at the one edge that is not a fan-out edge**: no two nodes ever receive the
   same object, and a reference is the one way two nodes could otherwise be handed one record's
   `result` twice.

## What this does to Q11, Q164, Q165 and Q166

**[Q11](../questions/q11.md) is ANSWERED in general and the answer is all three candidates at
once** — the previous node's output is the **default** (rule 1), the accumulator is the **state**
(rule 2), and the declared mapping is the **access** (rules 4-6). Its row presents them as a fork;
they are a stack.

**[Q166](../questions/q166.md) is CLOSED.** `spec/examples/valid/map-with-context.flow.json`:
`needs: {"item": ".", "run": "ingest"}` on a map's branch entry, and the instances receive
`{"item":"a","run":{items,config,runLabel}}` and `{"item":"b",…}`. The workaround that row records —
a reshaping node **plus a copy of the context per item** — is not needed, and the copy is one per
declared key rather than one per item of a restructured payload.

**[Q165](../questions/q165.md)'s FLOW is expressible; its reducer stays refused.**
`spec/examples/valid/map-over-region-output.flow.json` runs
`ingest → map → score → join → map(over "scores") → publish`, with `needs: {"scores": ["score"]}` on
the second map — **and no `over: "0"` anywhere**, so the brittleness that row names (*insert a branch
and it silently re-points*) is gone rather than worked around. `JP-R12` is untouched and the reducer
is still
[ADR 0037](0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
rule 5's narrow refusal (P12 decision 3).

**[Q164](../questions/q164.md) is RESOLVED and the prefix is `FD-C`.** Its stated forcing condition
was *"a second rule about what a run carries that has no region to hang on"*, and `FD-C1` is exactly
that. `scripts/check-spec.mjs` grows the prefix and — because the vocabulary was written down twice
in that file — **derives both patterns from one constant**, which is the smaller half of the fix and
the one nobody asked for.  `JP-R11` and `JP-R12` keep their ids: `doc/workflow.md` section 3, ids are
never renumbered.

## Consequences

**What it makes easy.**

- **A node can see the run without the previous node reshaping it for it.** The reshaping `task` node
  that three register rows name as the workaround is not needed for any of the three flows.
- **A map has context.** *Map* still means `f(x_i)` — rule 3 of
  [ADR 0037](0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
  is untouched — and an author who wants the context around the item now declares it instead of
  packing it into every item.
- **`join → map` over a whole region's output**, with the arity and the ordering both derived and
  neither written down.
- **A reference is checked at instantiation.** `FD-V27` refuses a reference to a non-node, a
  non-`task`, or a node this one is not reachable from; `FD-V28` refuses the wrong form. What is left
  for run time is exactly what the graph cannot know — `FD-R3`.

**What it costs, stated rather than discovered later.**

- **A reference to a large value inside a map region is
  [ADR 0037](0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)'s
  refused quadratic, made available at the author's request.** That ADR measured *a clone of the
  whole payload per map instance* at **2207.94 ms against 1.50 ms at N = 1000** and refused it as
  unaffordable for the feature that needed it. **`needs: {"run": "ingest"}` on a map's branch entry
  is that clone, per key** — and the numbers are the same numbers. Timing only the map's fan-out on
  a 1000-item payload:

  | what `score` declares | N = 100 | N = 1000 |
  |---|---|---|
  | nothing | 1.3 ms | 6.5 ms |
  | `{"item": "."}` | 1.3 ms | **8.0 ms** |
  | `{"item": ".", "up": <a small result>}` | 1.7 ms | **10.6 ms** |
  | `{"item": ".", "up": <the 1000-item result>}` | 9.5 ms | **546.6 ms** |

  **RE-TAKEN by [W46](../work-items/w46-what-a-reference-costs-and-whether-anything-says-so.md), and
  the numbers above are HISTORICAL** — kept as the record of what this decision was made on, not as
  a current claim. They were timed in ONE process in run order, and W46 measured what that method
  costs: **accumulation, not ordering.** Five passes over the same list in one process take a cheap
  row from **6.8 ms to 30.1 ms** and the large row from **622 ms to 1632 ms**, while forward and
  reversed agree within noise — so *later in the process is dearer, whatever the order*, and **the
  last row of a one-process table carries the whole accumulation**. **The cliff is robust throughout;
  the spread among the three cheap rows was never a measurement**, so *`{"item": "."}` costs more than
  nothing* is withdrawn as a claim.

  *(This paragraph first said the method was worth **2.5x in run POSITION** and that reversing made
  the two large cases **swap their numbers exactly**. W46's conformity reader could not reproduce
  either: the comparison had been reversed-in-one-process against one-case-per-process, two variables
  at once, and nothing swaps. The isolating comparison gives no ordering effect at all.)*

  **The current table lives in one place — `spec/flow-definition.md` section 3 v0.14 — with the
  method beside it**, and `check-docs`' `X6` compares it to `AGENTS.md`'s copy both ways.
  [Q179](../questions/q179.md), [Q208](../questions/q208.md).

  **The mechanism is linear and cheap; what an author points it AT is what costs.** So this is not a
  cost the decision imposes — it is one it makes reachable, per key, on a document the author wrote,
  and the same reference outside a map region is one clone. **The honest statement is that ADR 0037
  rule 3 protected a map from a cost the author could not see, and rule 5 here hands the author a way
  to ask for it in one line.** It is the sharpest thing on this decision's bill and it is why the
  reference names a whole node rather than a path inside it: a path language would make *"the small
  part of the big thing"* expressible and would move this cost from *visible in the document* to
  *hidden in a selector*. [Q22](../questions/q22.md)'s row now has **three** clone sites.

- **The projection was `O(log²)` per call and is now `O(log)`, memoised on the log's length.** *(2026-10-21,
  [ADR 0121](0121-the-driver-keeps-a-per-task-view-of-its-log.md), W195: now O(the records appended since the last
  read), caught up from a per-task view of the log — the memo missed a `needs` read once per settlement by construction.)* Both
  halves were found by re-taking the number on the tree this item ships
  (`doc/workflow.md` section 1 rule 5's WHEN) — the figure in *what was measured* above, 0.027 ms
  over a 6-record log, is true and is not the number that matters. **`effectiveOutcome` scans the
  whole log, and calling it once per distinct task id made this quadratic**: 4.8 / 29.3 / 132.2 ms
  for 50 / 200 / 400 settlements, with the per-settlement cost rising as the log grew. Grouping the
  log by task id in one pass and calling `effectiveOutcome` **on each group** fixes it without a
  second source — that function filters by task id anyway, so a sub-log is an input it is already
  total on, and the settlement/resolution/`user_action` rules stay in one place. **The memo's own case
  is N dispatches in one turn over a long log**, which is Q165's flow at scale: **69.5 ms against
  312.1 ms at N = 800**, and *measurably nothing* on a single map region, where the log is two
  records. **It is paid only by nodes that declare a `needs`**, which is what keeps rule 1 true of the
  cost as well as of the value.
- **A reference can be satisfied by a node the author did not think would run.** `FD-V27` requires
  reachability and **not dominance**, so a reference across a decision that routes around the named
  node is accepted at instantiation and refused at run time by `FD-R3`. Dominance over the DAG is
  computable and was not taken, because `FD-R2`'s precedent is that a run-time fact gets a run-time
  refusal with a message that names the cause, and a dominance rule would refuse valid flows whose
  every real workload takes the branch that produces the value.
- **The reference names a NODE and never a path inside its value.** `needs: {"config": "ingest"}`
  gives the whole of `ingest`'s result and the worker reads `.config`. A path language is a second,
  untyped grammar in a document that is otherwise one key per fact, and `over` already establishes
  that a key is one segment. It is a real ergonomic cost and it is the most likely thing to be asked
  for next.

**What could reverse it.** An author who wants the collection **keyed** rather than listed — the
shape `JP-R12` chose, and for `JP-R12`'s reason: with a branch routed away, `["score"]`'s index 1 is
branch 2's result, silently. Rule 5 chose the array because the author **asked for a list** and
because it is what `over` can iterate, where `JP-R12` had to choose for everyone; if that turns out
to be wrong the fix is a fourth reference form, not a re-keying, and it is additive.
