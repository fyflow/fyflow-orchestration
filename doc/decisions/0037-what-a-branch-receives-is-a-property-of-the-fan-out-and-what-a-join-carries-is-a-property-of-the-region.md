---
id: ADR 0037
title: "What a branch receives is a property of the fan-out; what a satisfied join carries is a property of the region"
status: accepted
date: "2026-09-07"
item: W34
raised-by: Q36, Q11, Q154, P10
supersedes: ""
amends: ""
resolves: ""
---

# ADR 0037 — What a branch receives is a property of the fan-out; what a satisfied join carries is a property of the region

**Raised by:** [Q36](../questions/q36.md), with [Q11](../questions/q11.md) narrowed to the fan-out
edge and [Q154](../questions/q154.md), decided by
[W34](../work-items/w34-what-a-branch-receives-and-what-a-join-carries.md) under
[P10](../plans/p10-is-fan-out-one-feature-or-two.md)

## Context

**[Q36](../questions/q36.md) has been open since P1 and its owner cell named an item that finished
four plans ago.** The driver forwards **`null`** out of a satisfied join and `settleJoin` takes no
payload parameter, so the choice cannot be quietly reintroduced. That is a placeholder and
`spec/join-policy.md` section 4 says so in the sentence this ADR replaces.

**The argument the `null` rests on is real and this decision answers it rather than routing around
it.** `status` is asked after **every** terminal event, so *which* event satisfies a join is decided
by fan-out completion order — which `doc/concept.md` section 5 calls genuinely non-deterministic and
`CLAUDE.md` says nothing may depend on. A join forwarding *"whichever branch finished last"* would
make a run's **data** order-dependent, which is worse than a flaky test: it is a flaky result.

**What made it undeferrable is [W33](../work-items/w33-a-map-at-run-time-arity.md).** A `map` now
dispatches N tasks at a run-time arity, and **a map that runs N tasks and hands its successor `null`
has computed N results and thrown all of them away.** P10's decision 2 ordered the two items so this
rule would be written from cases rather than from a mechanism, and the cases are now in front of it.

### What was measured, at the scope it was measured at

`doc/workflow.md` section 1 rule 5's writing clause. Every figure below came from a run; the scripts
are thrown away with `dev-dist/`.

| | measured |
|---|---|
| **the join's successor receives `null` in every cell that fires** | **22 of 36** depth-1 cells fire a join, derived by running `SCENARIOS` × `MATRIX_COLUMNS` (**9 × 4**, with 4 depth-2 rows making **52** cells in all). Every one of the 22 dispatches its downstream task with `null`, and an ordinary edge on the same row carries `{from: 'ingest'}` — so `null` is a decision the join makes and not something the harness reports for everything |
| **a fan-out hands ONE object to every branch, at every arity** | `scoreA.payload === scoreB.payload` is **`true`** for a `fanout`; for a `map` **every pair** is `true` — `n(n-1)/2` aliased pairs, measured as 1, 3 and 21 at N = 2, 3 and 7. The payload **is** cloned once at the edge hop, so the log is protected and the siblings are not |
| **and the aliasing is INVISIBLE in a thread pool** | The half P10 did not measure. On a real `FyflowScheduler`, same flow, same worker: **inline**, branch B's worker saw `["score:r1:scoreA:0:0"]` in its input **before it ran**, and branch A's own view of its input gained B's write **after A returned**; **threaded (`maxThreads: 2`)**, each worker saw `[]` and its own tag alone. **`a.payload === b.payload` is `true` in BOTH** — the aliasing is a driver-level fact and whether it is observable is a pool option the flow author does not control. That is [Q61](../questions/q61.md)'s asymmetry in the opposite direction, and it is the second instance of that class |
| **a clone per branch is unaffordable for the feature that needs it and affordable for the one that does not** | At N = 1000 over a 117 KiB payload: one shared clone **1.50 ms**; a clone per branch **2207.94 ms** — a factor of **~1470**, and it is **quadratic**, because for a map both the arity and the payload grow together. For a `fanout` over a 230 KiB payload the same fix is **linear in a document constant**: 9.3 / 14.2 / 23.0 / 44.3 ms at arity 2 / 3 / 5 / 10, against 4.5-4.8 ms for one clone |
| **handing each map instance its own item costs nothing, and cloning that item costs 5x the edge hop** | Same run, N = 1000: each instance receiving `over`'s array at its own index **2.29 ms**; receiving a **clone** of it **7.99 ms**. Both **linear**. A join collecting N results with one clone each is **3.47 ms** |
| **`structuredClone` preserves aliasing WITHIN one clone** | `{items: [x, x]}` survives the edge hop as an array holding **one object twice** — `after.items[0] === after.items[1]` is `true`, and mutating one shows in the other. **So "each instance receives `items[i]`" is not sufficient on its own**, which is why rule 3 below says *its own copy* rather than *its own item* |
| **the order-dependence does not vanish by keying — it MOVES** | Integer-like object keys (`"0"`, `"1"`, `"10"`) are re-ordered **ascending by the language**, so a depth-1 join's collected object is deterministic for free. **Dotted keys are not**: `"1.1"`, `"1.0"`, `"0.2"`, `"0.1"` keep **insertion** order, which for a join is **settlement** order. The hazard the `null` was protecting against is **invisible at depth 1 and live at depth 2** — the same shape [W21](../work-items/w21-the-branch-path-is-a-path.md) and [W22](../work-items/w22-what-an-inner-join-does-to-the-outer-one.md) each found once, and the third occurrence in this file tree |

### The finding that settles it

**The order-dependence the `null` refuses is *which one*, and the answer is *all of them, keyed*.**

`settleJoin` was given no payload parameter precisely because it is reached from three sites with
three different payloads and picking one is a choice fan-out completion order makes. **Collecting
every arrival, keyed by the branch it arrived on, is not picking one** — the collection is the same
value whatever order the branches settled in, provided the key order is pinned. So the constraint is
satisfied by construction rather than by refusing to carry anything, and **`settleJoin`'s signature
does not change**: the driver records arrivals as they happen and reads the whole map at the exit.

**And the split is [ADR 0036](0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)'s
own split, one layer on.** That ADR decided *two features over one region*: what the two share is the
**region**, what differs is the **fan-out**. Measured here:

- **What a branch receives differs by opener.** A `fanout` has nothing to give a branch but the value
  it received; a `map` has `over`'s array and an index. Two features, two answers.
- **What a satisfied join carries is one mechanism for both.** It is keyed by `branchPath`, which
  every region event already carries, which the task id already carries, and which
  [ADR 0036](0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)
  rule 4 already defines for both kinds. One region, one rule.

**So the payload layer confirms ADR 0036 from a direction that ADR did not look in**, and the
confirmation is not free: the fan-out half needed two rules and the region half needed one.

## Decision

**Five rules. Two are `spec/join-policy.md`'s new `JP-R11` and `JP-R12`; the rest are what those
two rest on.**

1. **No two nodes ever receive the same object.** The invariant, stated first because it is what the
   other rules are instances of. A node's payload is reachable from nothing else the run holds — not
   from the log, not from a sibling, not from the value the previous node returned.

   This is **[`OR-R2`](../../spec/outcome-record.md)'s own trade at a second boundary**, and its
   argument is used rather than restated: that rule deep-copies `result` unconditionally — *including
   for thread pools, where it is redundant* — because *"a uniform boundary is cheaper to review than a
   documented exception."* The measurement above is why that reasoning transfers exactly: the
   aliasing is a driver-level fact in **both** pool kinds and only its **observability** differs, so a
   rule conditioned on the pool would be a rule the driver cannot evaluate.

2. **A `fanout` branch entry receives its own copy of the value the fanout node received.**
   Unchanged in what it *is*; changed in that each branch gets its own. The cost is measured and is
   **linear in a number the document declares** — `FD-V9`'s floor is 2 and a fan-out's arity is
   written down — so it is bounded by the author rather than by the data.

3. **A `map` instance receives its own copy of its own item** — `over`'s array at that instance's
   index. Not the whole value the map node received, which is what
   [W33](../work-items/w33-a-map-at-run-time-arity.md) shipped **deliberately** so that changing it
   would be a visible edit. *Its own copy* rather than *its own item*, because `structuredClone`
   preserves aliasing within one clone and `[x, x]` would otherwise hand two instances one object.

   **This is what makes `over` mean something.** Without it `over` names an array whose only use is
   its `length`, and a map is a fanout that counts.

4. **`JP-R12` — a satisfied join carries an object keyed by `branchPath`, one entry per branch that
   emitted `branch.arrived`, whose value is what that branch carried into the join.** Keys are in
   **ascending `branchPath` order, compared segment-wise as numbers**, so the collection is
   byte-identical whatever order the branches settled in. A join nothing arrived at carries `{}`.

5. **No reducer, and the refusal is narrow.** [Q36](../questions/q36.md)'s second candidate — *a
   declared reducer on the join node* — is **not taken here**, and not because it is wrong:
   [ADR 0002](0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md) rule 3's
   registered-by-name mechanism would carry it exactly as it carries `when`. It is refused because
   **a reducer is a function of what the join collects, so it cannot be specified before rule 4 is**,
   and building both at once would decide the shape of the collection from the convenience of the
   reducer. **Rule 4 is what a reducer would receive**, and adding one later is additive: a new
   optional key on a `join` node, a registry lookup, and a validator rule. Recorded as
   [Q165](../questions/q165.md).

## What this does to [Q11](../questions/q11.md) and [Q154](../questions/q154.md)

**[Q11](../questions/q11.md) is answered at the fan-out edge and stays open in general**, which is
P10's scope and this ADR does not exceed it. Its row calls itself *"the API surface users touch most,
so it is the one most expensive to change later"*, and its three candidates are *the previous node's
output, a run-scoped accumulator, or a declared per-edge mapping*. **The first is still what ships
for every ordinary edge**; rules 2 and 3 say what the fan-out edge does with it, and neither of the
other two candidates is built. **A run-scoped accumulator is still the open question**, and it is the
one that would answer *"what a map instance loses"* below.

**[Q154](../questions/q154.md) is closed, in two different ways for the two features, and the
asymmetry is the point.**

| | how it is closed | what it cost |
|---|---|---|
| a `fanout` | rule 2 — a clone per branch | measured, linear in the declared arity: ~4.7 ms per extra branch on a 230 KiB payload |
| a `map` | rule 3 — the instances no longer receive one value at all | **nothing**: handing each instance its own item is 2.29 ms against 1.50 ms at N = 1000, and the cloning of that item is 8.0 ms. The fix that was unaffordable for this feature turned out to be unnecessary for it |

**The fix that is catastrophic for the feature that needed it is affordable for the feature that
did not**, and it is the same sentence ADR 0036 ends on: what differs is the fan-out.

## Consequences

**What it makes easy.**

- **A map has an output.** N results reach the join's successor keyed by item index, which is the
  plan's exit artifact and the reason [Q12](../questions/q12.md) and Q36 are one plan.
- **A branch's payload key and its task id's third segment are the same string.** A log line, a
  region event and a payload key all say `1.0`, so a consumer correlating them writes no mapping.
- **`settleJoin`'s signature is untouched**, so the guard that has kept Q36 a question rather than a
  convention is still in place and still means what it meant.
- **A node may mutate what it was given.** Rule 1 makes that safe rather than forbidden, which is the
  opposite of the answer [Q9](../questions/q9.md) and `spec/outcome-record.md` section 4 have each
  already rejected once — *"please write pure functions" is not a mechanism*.

**What it costs, stated rather than discovered later.**

- **A clone per fan-out branch is a hot-path deep copy that
  [ADR 0007](0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md) explicitly did
  not want.** It is taken on `OR-R2`'s precedent and on a measurement, and it is bounded by the
  document rather than by the data. **The numbers are on [Q22](../questions/q22.md)'s row** — that
  row has said *"needs a measured run"* since P1, and this is one. *(This sentence read
  *"[Q22] gains the numbers"* while that row was untouched: an ADR asserting an edit it had not made,
  in the file read before every work item. This item's conformity reader found it, and the row is
  written now.)*
- **A map instance loses the context the map node had.** It receives its item and not the
  `{items, note, config}` around it. That is what *map* means in every language that has one, and a
  consumer who needs context puts it in the item — but it is a real loss and it is
  [Q11](../questions/q11.md)-in-general's to fix, not this ADR's. [Q166](../questions/q166.md).
- **`join → map` becomes expressible over ONE BRANCH's result, and this ADR first claimed the
  opposite.** It read *"`join → map` is still not expressible … today the join carries `null` and it
  fails `FD-R2`; after this it carries an object and it fails `FD-R2` for a different reason."*
  **Measured, and false**: a `branchPath` is a string in `FD-V25`'s `over` charset, so
  `{ "kind": "map", "over": "0" }` after a join names branch 0's entry. `validateDefinition` accepts
  such a document with **zero findings**, and a run in which branch 0 settles `['x','y']` dispatches
  `each` twice, with `"x"` and `"y"`. **It behaves correctly** — each instance receives its own item,
  exactly as `JP-R11` says — so this is an affordance the decision created rather than a defect, and
  it is recorded because *a decision that is not written down did not happen*
  (`doc/workflow.md` section 1 rule 3). Found by this item's conformity reader.

  **What is still NOT expressible is a map over ALL the collected results**, and that is the shape
  anyone actually wants: the collection is an object keyed by branch, so no key of it holds the
  results as a list, and `over: "1"` fails `FD-R2` the moment branch 1's result is not itself an
  array. **The affordance is also brittle in a way worth naming**: `over: "0"` couples a flow to the
  fan-out's branch numbering, so inserting a branch silently re-points it. A reshaping `task` between
  the join and the map is the workaround for the general case. [Q165](../questions/q165.md).
- **The key order is pinned by construction and cannot be asserted through `JSON.stringify`**,
  because a payload is structured-cloneable rather than JSON (`spec/outcome-record.md` section 4) and
  a cyclic payload makes `stringify` throw. `Object.keys` is the projection that checks it.

**What could reverse it.** A consumer for whom the collected object is the wrong shape — most
plausibly one wanting a list in item order for a map, where the absent entries of branches that did
not arrive are exactly what makes a list wrong. Rule 4 chose the object because an array's index
would be *position in the arrival set* rather than the branch index: with branch 1 exiting,
`[r0, r2]`'s index 1 is branch 2's result, silently. **If that turns out to be what people want, the
fix is a reducer (rule 5), not a re-keying.**
