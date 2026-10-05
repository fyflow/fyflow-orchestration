---
id: ADR 0041
title: "A decision sees its node's outcome and whatever its own edge declares"
status: accepted
date: "2026-09-10"
item: W42
raised-by: Q8, P12
supersedes: ""
amends: ""
resolves: ""
---

# ADR 0041 — A decision sees its node's outcome and whatever its own edge declares

**Raised by:** [Q8](../open-questions.md), decided by
[W42](../work-items/w42-what-a-decision-sees.md) under
[P12](../plans/p12-what-a-node-receives-and-what-a-decision-sees.md)

## Context

**[Q8](../open-questions.md) has been open since P1 and `src/driver/routing.ts` has carried it in a
comment for the whole of that time**: *"What a predicate receives. P1 populates exactly one field;
Q8 is whether it grows."* `spec/flow-definition.md` section 3's routing rule 4 names it by id and
adds *"adding a field later is additive rather than a signature change."*

**[P12](../plans/p12-what-a-node-receives-and-what-a-decision-sees.md) predicted this decision would
not be needed.** Its prediction 3, a **reach** prediction, reads: *"W42 needs no ADR. Fact 2 says Q8
is one field and one call site, and decision 1 says the mechanism is W41's — so Q8 should be a
consequence rather than a decision. **ADR 0041 is reserved and expected SKIPPED**"*, with the stated
reversal condition *"a predicate needing something a worker does not — a shape, a key, or a
guarantee."*

**It reverses.** A predicate needs a **shape** a worker does not — a reference grammar without the
`"."` form — and it needs a **site** a worker does not, because the obvious one is not available at
the moment a decision is made. Both were measured rather than argued.

> **And the measurement this ADR first gave for the second half was WRONG, which is worth reading
> before the rest.** It said a *diamond* made a node's payload underivable, and W42's conformity
> reader derived it in one expression with no append order. **The conclusion stands and the reason
> changed**: what is underivable is the **entry** node's payload, which appears in no record at all,
> and what is refused for every other node is re-deriving `compose`, `JP-R11` and `JP-R12` at a second
> site — which ADR 0040 rule 2 refuses by name. *A reach prediction reversed on a fact, and then the
> fact was wrong; the corrected fact reverses it harder.*

### What was measured, at the scope it was measured at

`doc/workflow.md` section 1 rule 5's writing clause. Seven facts, all at ladder L2 with no scheduler;
the scripts are thrown away with `dev-dist/`.

| | measured |
|---|---|
| **Q8's own case, reproduced** | On `ingest → score → (review \| publish)` with `ingest` returning `{flagged: true}`, the predicate's argument has **one key**, `outcome`, whose `result` is `{"score":0.4}` — its own node's. **`ingest.flagged` is reachable from the predicate by no route at all**, which is Q8's row's own sentence since P1 |
| **`DecisionContext` is one field and one call site** | P12 fact 2, re-taken: one member, constructed at one site, `selectEdge` the only consumer |
| **a `needs` on the NODE does not reach the predicate** | With `needs: {"own": ".", "up": "ingest"}` on `score`, the worker receives `{"own":…,"up":…}` and **the predicate's argument keys are still just `outcome`** |
| **and declaring it would rewrite the WORKER's payload** | Same run: `score` receives `{"flagged":true}` without a `needs` and `{"own":…,"up":…}` with one. **Giving the predicate reach changes the worker's contract**, which is prediction 3's reversal condition on its face |
| **the two SURFACES coincide exactly** | Over the whole valid corpus: **4** nodes carry a `when` edge and all four are `task`s — `decision`, `failure-edge`, `p1-routed-away` and `decision-on-an-earlier-step`, **the last being the flow this item adds**, which is why the number is 4 and not the 3 this row first carried (`doc/workflow.md` section 1 rule 5's WHEN, re-taken on the tree the item ships); **0** joins do, because `FD-V7` forbids `when` on a join edge. So every predicate sits on a `task` and every `task` may carry a `needs` — *one mechanism is possible*, which is why the reversal is not obvious |
| **`needs` on an EDGE is refused today, and by `FD-V17`** | `FD-V17: edge carries undeclared key "needs"` — the undeclared-key clause, with no rule of its own needed |
| **~~a diamond makes a node's payload underivable~~ — WITHDRAWN, and it was this ADR's stated forcing fact** | On `score → review → publish` and `score → publish`, a run that takes the review road settles **both** predecessors and `publish` received `{"from":"review"}` — and this row read *"choosing which predecessor supplied it needs **append order**"*. **That is false.** W42's conformity reader derived it with no timestamp and no append order: *take the settled predecessors, drop any that another settled predecessor is reachable **from**, and the survivor is unique* — measured, and it agrees on both roads. **It is unique because a node takes exactly ONE edge**, so `review` being in the log proves `score` did not route to `publish`; and two *incomparable* settled predecessors need two live paths, hence a `fanout`, hence the node in two `branchOf` sets, which `FD-V19` refuses. **The conclusion survives on the two rows below; the reason did not, and it was the one the decision was written on** |
| **the ENTRY node's payload is in NO record, so it is underivable by any route** | **This is the forcing fact, and it replaces the row above.** `start(payload)` reaches `createTask` and **nothing appends it**: measured, an `OutcomeRecord` carries `result` and no payload field, and no record in a completed run contains the start payload at all. So *what the node received* has no derivation for the entry node — not a hard one, none — and any rule that promised it would be false on the first node of every flow |
| **and deriving it for the rest is a SECOND SOURCE** | Reconstructing a node's payload means re-implementing `compose`'s composition, `JP-R11`'s per-branch copy and `JP-R12`'s collection, from the log, at a second site. **[ADR 0040](0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md) rule 2 refuses exactly that by name** — *a maintained index is a second source that can disagree with the log* — and a re-derivation is that with the disagreement moved from state to code |
| **a resumed node's predicate runs once, on the effective outcome** | After `user_action` the predicate ran **0** times; after the resolution, once, seeing `terminalState: "done"` and the resolution's `result`. Section 3 rule 4, unchanged |

### The finding that settles it

**The references are derivable at routing time and the payload is not, and that asymmetry is the
whole decision.**

Handing a predicate *what its node received* — the obvious reading of "the same mechanism" — is
either **new retention** (a payload kept per dispatched node, which is
[Q19](../open-questions.md)'s own subject and which
[ADR 0040](0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
rule 2 refuses in the same words) or **impossible** — the entry node's payload is in no record —
or a **second source**, because reconstructing it means re-implementing `compose`, `JP-R11` and
`JP-R12` from the log at a second site. A **reference**,
by contrast, resolves from the projection ADR 0040 already built, at the moment the decision is
made, with no new state at all — because `FD-V27` requires the reading node to be reachable from the
target, so everything a reference names has settled before the node was entered.

**So the mechanism is shared and the SITE is not**, and that is a smaller answer than either
alternative: not a second grammar, not a second resolver, and not a payload the driver has to keep.

## Decision

**Four rules. One is `spec/flow-definition.md`'s new `FD-C3`; the rest are what it rests on.**

1. **Nothing changes for a flow that declares nothing.** An edge with no `needs` gives its predicate
   `ctx.needs = {}`, and the projection is not computed at all — so the cost is opt-in as well as the
   value. This is ADR 0040 rule 1 at the second site, and it is measured the same way: L1-L5 unmoved
   across the change.

2. **A decision sees its node's effective outcome and whatever its OWN EDGE declares** — `FD-C3`.
   `DecisionContext` gains one field, `needs`, always an object and never `undefined`, for routing
   rule 4's own reason one level out: *a predicate written `ctx.needs.flag` must mean one thing.*
   **A different edge of the same node may declare something different**, so the context is built
   **per edge** and only for an edge carrying a `when` — `selectEdge` takes a builder where it took a
   `DecisionContext`, and routing stays pure because the caller supplies it exactly as it supplies
   `predicates`.

3. **The declaration is on the EDGE, and it is on the edge for two measured reasons.** A `needs` on
   the node would rewrite what its **worker** receives, so an author could not give a predicate reach
   without changing a worker's contract; and *what the node received* is **not derivable** at routing
   time, so honouring it would mean retaining a payload per dispatched node.

4. **The grammar is `FD-C1`'s, minus `"."`, and the aiming rules are `FD-V27`'s and `FD-V28`'s
   unchanged.** `FD-V26` refuses `"."` on an edge because *what this predicate would have received
   anyway* is `ctx.outcome` and it already has it. **The reader is the node the edge hangs on** — an
   edge has no branch path of its own — so `FD-V27` and `FD-V28` ask the same two questions and are
   iterated over both sites in **one loop**, so that a change to what a reference means cannot mean
   two different things to a worker and to a predicate. **No rule id is added for the aiming and none
   is changed**; `FD-V26` gains one clause.

## What this does to [Q8](../open-questions.md) and to P12's prediction 3

**[Q8](../open-questions.md) is ANSWERED, and its own framing was the fork it presents.** The row
asks *"does a decision see only its node's output, or accumulated run state?"* — and the answer is
**neither, and both**: it sees its node's output always, and as much accumulated state as its own
edge names, which is none by default. *Node-output-only keeps predicates trivially pure and cheap to
test* — the row's argument for the first option — survives intact, because a predicate that declares
nothing is byte-identical to a P1 predicate.

**Prediction 3 REVERSES, and it is the reversible kind.**
[P10](../plans/p10-is-fan-out-one-feature-or-two.md)'s retro settled that *a prediction derived from a
measurement you already have checks your reasoning; a prediction about a mechanism's reach checks the
mechanism, and only the second can reverse*, and P11's sharpened it. This is a **reach** prediction
and it reversed on a fact nobody had measured. **The fact this ADR first gave was WRONG and its
conformity reader corrected it**, which is a second thing worth carrying: a reach prediction can
reverse on the right conclusion and the wrong evidence, and only a reader re-deriving the evidence
finds that. **Its reasoning was sound and its premise was incomplete**: P12 fact 2 measured that Q8's mechanism is one field and one call site, and
that is *true and still true*; what fact 2 could not see is that the value to put in that field is
not available where the field is filled in.

## Consequences

**What it makes easy.**

- **A decision on an earlier step.** `spec/examples/valid/decision-on-an-earlier-step.flow.json` is
  Q8's own sentence, carried in that row since P1, running: `{"when": "isLowConfidence", "to":
  "review", "needs": {"earlier": "ingest"}}`, and the predicate answers differently on two runs
  because of a node it does not sit on.
- **The worker's contract is untouched.** Measured: with that edge declared, `score`'s worker still
  receives `ingest`'s result unchanged.
- **One resolver.** A node's `needs` and an edge's resolve through the same expression, so *what a
  reference means* has one definition. `FD-V27` and `FD-V28` iterate both sites in one loop for the
  same reason.
- **Two predicates on one node can see different things**, which is what makes this a property of the
  decision rather than of the node.

**What it costs, stated rather than discovered later.**

- **A second declaration site for one grammar**, with one form legal at one site and not at the
  other. An author reading `needs` has to know which of the two they are looking at, and the two
  differ by exactly one token. **The alternative — one site — was refused on rule 3's measurements
  and not on taste**, and the difference is stated in the rule row rather than left to be inferred.
- **`selectEdge`'s signature changed.** It took a `DecisionContext` and takes a builder. That is a
  breaking change to a function the package root exports, and it is taken because the alternative —
  one context for every edge of a node — would make `ctx.needs` the union of what all the edges
  declare, so a predicate would see what a sibling edge asked for.
- **A predicate can now stop a run.** An edge's reference that resolves to nothing is `FD-R3`, so a
  decision has a run-time refusal where before it had only `FD-R1`. It is the same class and the same
  rule as a node's, and [Q187](../open-questions.md)'s reachability-not-dominance cost applies to it
  identically. **The MESSAGE differs by design** — `edge needs["f"]` rather than `needs["f"]`, so a
  reader is sent to the edge and not to the node — and both halves are asserted, after this ADR read
  *"the same message"* while the code and its own test made it different. W42's conformity reader,
  and the node half was unbound until its adequacy reader swapped the label for **0**.
- **[Q9](../open-questions.md) is untouched and is very slightly larger.** A predicate now reads two
  fields instead of one, and both are copies; purity is still unenforced and P12 declares it out.
  Nothing here makes a predicate more or less enforceable, which is what P10 measured when it
  declined Q9.

**What could reverse it.** An author who wants the same `needs` on every edge of a node and has to
write it several times. The fix is a node-level default that an edge overrides — additive, one
merge rule, and it does **not** require the payload the diamond makes underivable, because it would
be a declaration merge rather than a value.
