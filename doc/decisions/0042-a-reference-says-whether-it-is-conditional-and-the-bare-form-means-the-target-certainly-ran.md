---
id: ADR 0042
title: "A reference says whether it is conditional, and the bare form means the target certainly ran"
status: accepted
date: "2026-09-10"
item: W45
raised-by: Q187, P13
supersedes: ""
amends: ""
resolves: Q201
---

# ADR 0042 — A reference says whether it is conditional, and the bare form means the target certainly ran

**Raised by:** [Q187](../questions/q187.md), decided by
[W45](../work-items/w45-what-a-reference-must-be-able-to-say.md) under
[P13](../plans/p13-when-is-a-declared-reference-refused.md)

## Context

**[Q187](../questions/q187.md) is
[ADR 0002](0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md) rule 3's own
argument failing against a rule written four days earlier.** `FD-V27` requires **reachability** and
not **dominance**, so a reference across a decision that routes around its target is accepted at
instantiation and refused at run time by `FD-R3` — *on the one workload that takes the other edge*,
which is the exact shape rule 3 exists to prevent. Reproduced at P13's declaration and again here:
`validateDefinition` returns **0 findings**, the low-confidence payload dispatches all four tasks,
and the high-confidence payload dispatches two and stops. **The message is good and the moment is
wrong.**

**[P13](../plans/p13-when-is-a-declared-reference-refused.md) named a fork and preferred neither
side**: a **dominance rule** on `FD-V27`, or a **fourth reference form** that says *if it ran*. Its
prediction 1 is derived — *a dominance rule refuses nothing that exists, so adopting it costs zero in
the corpus* — with the stated reversal condition *a corpus flow that dominance refuses and an author
wants*, and its W45 row required the item to exhibit one **or record that none could be
constructed**.

**Twenty-two could be constructed, from flows already in the corpus.** *(This read **twenty-eight**, which is neither of the two numbers the table below gives and appears in no row of it. W45's conformity reader.)*

### What was measured, at the scope it was measured at

`doc/workflow.md` section 1 rule 5's writing clause. Every figure is over both corpora —
`spec/examples/valid/**` and `examples/flows/**` — and the scripts are thrown away with `dev-dist/`.

| | measured |
|---|---|
| **P13 fact 2 reproduces exactly** | 26 flows, **6** aimed references (the `"."` form names no node and is excluded), and iterative dominators over the entry-rooted DAG would refuse **0** of the 6. The walk was written from `spec/flow-definition.md` section 4's arc enumeration rather than from `src/definition/regions.ts`, so it is a second expression of the same graph |
| **and its ZERO is a property of what the corpus WRITES** | The corpus **ADMITS 127** references — every (reader, target, form) triple `FD-V26`, `FD-V27` and `FD-V28` accept, measured by running `validateDefinition` itself so the admitted set cannot drift from the shipped rules — and **plain dominance refuses 30 of them, in 13 of the 26 flows.** *A rule measured against the references a corpus happens to write is measured against its authors' habits, not against itself.* **The admission test EXCLUDES `FD-V29` deliberately**: once that rule ships it refuses exactly the certainty set, so running the whole validator reports *certainty refuses 0* and the measurement is circular. Measured — it does |
| **and one of the 29 is a document this spec calls VALID nine lines from the rule** | `needs: {"a": "scoreA"}` on `publish` after `fanout-join`'s two-branch join: **0 findings**, all four tasks dispatched, `publish` receiving `{"a":{"a":"A"}}`. `FD-V28`'s own note records its first version refusing exactly this and calls it *"a valid document"* — W41's conformity reader's finding, in this document, and a dominance rule would have reintroduced it under a different id |
| **the reason is that the graph has TWO kinds of branching** | A `task`'s `edges` are **disjunctive** — exactly one is taken (section 3's routing rule 2). A `fanout`'s `branches` and a `map`'s `branch` are **conjunctive** — all are entered, and `JP-R5` emits every `branch.opened` before any dispatch. **Dominance reads the arc set and cannot tell them apart**, so a branch entry never dominates its own join while it has always been dispatched by the time that join fires |
| **so a CERTAINTY walk refuses 8 of the 127, and the 8 are a strict subset of the 30** | Both walks in one file, over the same admitted set: dominance **30**, certainty **8** over **7 distinct shapes** (`decision-on-an-earlier-step` appears in both corpora), refused-by-both **8**, refused-by-certainty-only **0**. **So 22 of dominance's 30 are references a correct rule accepts** |
| **and the four figures above were WRONG when this ADR was first written** | 121 / 29 / 7 / *14 of 25 flows*, from a walk whose registry was hard-coded and did not carry `earlierWasLowConfidence` — so `FD-V4` fired on one of the two `decision-on-an-earlier-step` files and it was silently dropped, giving 25 files where fact 2's own row in the same table says 26. W45's conformity reader re-derived every one. **`22` was right and the other four were not**, and the 7-shape list is unmoved item for item. *A measurement that has to skip what it cannot validate must say what it skipped* |
| **and the 7 are exactly the references that can fail** | `decision-on-an-earlier-step: publish "review"` (Q187's own shape); `nested: publish "scoreC"`/`"scoreD"` and `nested-suspend: publish "reviewC"`/`"scoreD"` — inner branch entries, reachable only if the outer branch progressed; `map-in-fanout: publish ["merge"]` and `nested-map: publish ["item"]` — a map region inside a fanout branch. **0 of the 6 the corpora write** |
| **and all three non-arrival roads RESOLVE, which is why 22 is not luck** | `p1-routed-away` with `publish` needing the **arriving** branch gives `{"got":{"A":1}}`; needing **the branch that LEFT the region** gives `{"got":{"B":2}}` — a value `JP-R12` deliberately does not carry; `fanout-failure` with `publish` needing the branch that **exited** via a failure edge gives `{"got":null}`. **No `FD-R3` on any of the three** |
| **a reference to a task that ran and FAILED resolves to `null`, key PRESENT** | `fanout-failure`, `scoreA` optional and settling `failed`, no failure reported. So `null` already means *ran and produced nothing* and cannot also mean *did not run* |
| **the grammar has room and `?` is free** | `"flag?"`, `"?flag"`, `"flag!"`, `["flag","?"]`, `["flag?"]`, `{"node":"flag","optional":true}`, `"flag."` and `".flag"` are **all refused today by `FD-V26` alone** — `referenceTarget` returns `null` for every one — because `?` `!` `.` are outside `FD-V16`'s charset and no node may ever be named with one |

### The finding that settles it

**The two candidates are not a fork. One is refuted and the other is incomplete on its own.**

**Dominance is refuted by the 22.** It is not too strict by taste; it is *wrong about the graph*,
because it reads a `fanout`'s branches as alternatives when `JP-R5` makes them simultaneous. A rule
that refuses `needs: {"a": "scoreA"}` after a two-branch join would have contradicted `FD-V28`
nine lines up in the same document, and it would have refused 22 references over 13 of 26 flows to
catch 8.

**A fourth reference form alone does not close Q187.** It makes the intent *if it ran* expressible,
which nothing in the grammar could say (P13 fact 6). It does not stop an author writing the
unconditional form across a decision, which is still accepted at instantiation and still refused on
the one workload that takes the other edge. *A form is an affordance; ADR 0002 rule 3 asks for a
refusal.*

**So the answer is the corrected rule AND the form**, and each is what makes the other affordable:
the rule can refuse an uncertain reference only because the form gives the author something to write
instead, and the form is more than decoration only because the rule refuses the alternative. **That
is [ADR 0040](0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)'s
own finding about [Q11](../questions/q11.md) one plan on** — the register presented three candidates
as a fork and they were a stack — and it is the second time a P13-family question has turned out that
way.

## Decision

**Five rules. Two are `spec/flow-definition.md`'s new `FD-V29` and `FD-C4`; the rest are what they
rest on.**

1. **Nothing changes for a flow that declares nothing, or that declares a reference to a node every
   path reaches.** 0 of the 6 references the two corpora write moves, and no flow in either corpus
   becomes invalid — measured before the rule was written and again on the tree this item ships.
   `needs` is still opt-in and the composition is still identity without it.

2. **The bare form is a CLAIM that the target ran**, and `FD-V29` refuses it where a run can reach
   the declaring node without the target having run. **Certainty, and not dominance**: a node is
   certain for a reader when it is on every path from `entry` to the reader **with a region's branch
   entries counted as certain for that region's join**. The correction is measured, not argued — see
   the 22 above.

3. **The grammar gains ONE token, `?`, as a suffix on the node id**, legal in both aimed forms and at
   both declaration sites: `"n?"` and `["n?"]`, on a node's `needs` and on an edge's. **It decides
   what happens when the target produced nothing and never which outputs are named**, so it is
   orthogonal to `FD-V28`'s question rather than a third value of it — `FD-V28` reads the form with
   the suffix stripped and `FD-V29` reads the suffix. **Not on `"."`**, which resolves to what the
   edge carried and is therefore always there; `".?"`, `"?"` and `"n??"` are refused with no clause
   of their own, because the remainder after stripping must still match `FD-V16`'s charset.

4. **A conditional reference whose target produced nothing on this path leaves the KEY ABSENT, or
   `[]` for the array form** — `FD-C4`. **The asymmetry is forced by a measurement**: the `one` form
   has no *value* available to mean *did not run*, because a reference to a task that ran and failed
   already resolves to `null` with the key present. So an absent key is the only answer an author can
   tell apart, and for the array `[]` is unambiguous and lets them iterate without a guard. Both
   sites, by the same expression — ADR 0041 rule 4's *one resolver* carried to what happens when it
   resolves to nothing.

5. **`FD-V29` REMOVES CASES from `FD-R3`'s reach and does not replace it**, and the two remaining
   cases are written into `FD-R3`'s own row rather than left to be discovered:

   | | why a validator cannot see it |
   |---|---|
   | **a reader whose branch path is comparable with none of the target's** | *did it run* and *is it on your path* are two questions, and `FD-V29` answers only the first. Two `map` regions over different keys: `FD-V29` correctly calls `score` certain for `publish`, and the third instance of the second region can see **neither** output of the first. **No custom policy** — `reference-past-a-map-arity.flow.json`, in the corpus |
   | **a join policy firing BEFORE a branch entry has settled** | *the join fired, therefore every branch entry settled* is a property of the POLICY, and `validateDefinition` is not given one — `FD-V15`'s own note in the document. Measured: a policy satisfied on the first arrival, with `scoreA` **never settling**, dispatches the reader and `FD-R3` fires ([Q97](../questions/q97.md)). *(This row said *"parked at `user_action`"* and so did four other statements of the limit; parking is INESSENTIAL, and W45's conformity reader measured it. The fixture is checked in at L2 with a shipped-policy control beside it — this arm had no observer at all when the ADR was written, which its adequacy reader found from the other side.)* |

   So an unsound acceptance degrades to today's behaviour rather than to something worse, which is
   what makes rule 2 affordable to have got slightly wrong.

## What this does to [Q187](../questions/q187.md) and to P13's predictions

**[Q187](../questions/q187.md) is ANSWERED, and both halves of its *against* case were wrong.** The
row reads *"a dominance rule refuses valid flows whose every real workload takes the branch that
produces the value"* — **that is not the flaw**; the flaw is that dominance refuses flows whose every
run produces the value *by construction*, which is a fact about the graph and not about the workload.
And *"the value is optional on some paths has no expression today"* was true and is the other half of
the same decision. **Its stated forcing condition — *a flow whose author wants the reference on some
paths and not others, which is a fourth reference form rather than a validator rule* — is met, and
the disjunction in it is what this decision refuses.**

**Prediction 1 FAILS, and it is the derived kind.**
[P10](../plans/p10-is-fan-out-one-feature-or-two.md)'s retro settled that a prediction derived from a
measurement you already have checks your **reasoning**, and this one checked it and found it wrong:
fact 2's *dominance refuses 0 of the 6* is a true measurement, and *therefore adopting dominance
costs zero in the corpus* does not follow from it. The corpus admits 127 references and dominance
refuses 30. **The plan's own reversal condition was the right one and it fires 22 times.**
[Q199](../questions/q199.md).

**Prediction 2 is CONFIRMED on its conclusion and INCOMPLETE on its exclusion.** *The answer is a
fourth reference form* — it is, and the form is load-bearing rather than an affordance. *And not a
validator rule* — a validator rule is taken as well, in a form the prediction did not consider,
because the prediction inherited *dominance* from the register and the question was never *whether to
check at instantiation* but *what to check*. Its stated reversal condition — *dominance expressing
everything an author wants* — did not occur.

**Prediction 4 is CONFIRMED and its enumeration is wrong by one.** `FD-V27` does not move at all,
which is sharper than the prediction; `FD-V26`, `FD-V28`, `FD-R3`, `FD-C1`'s table and the new
`FD-V29`/`FD-C4` do. **The table's row count is a live bound in TWO places, not three** —
`test/definition/needs.test.ts` and `examples/l6.ts`; `scripts/check-spec.mjs` contains the string
`reference` zero times. Corrected in the plan.

## Consequences

**What it makes easy.**

- **The flow P13 exists for.** *Route to review if an earlier step flagged it, and publish either
  way* — `reference-if-it-ran.flow.json`, `needs: {"own": ".", "verdict": "review?"}`, the key
  present on the review road and absent on the other, both roads completing.
- **A typo across a decision is refused at instantiation**, which is ADR 0002 rule 3's own case and
  the one Q187 was raised about.
- **The refusal names the fix.** `FD-V29`'s message says *write `"review?"` if you mean if it ran*,
  and *otherwise move the reference to a node every path reaches* — the two things an author can
  actually do, which is `FD-V28`'s own standard for a refusal message.
- **A predicate can be conditional too.** An edge's `needs: {"earlier": "review?"}` gives a predicate
  a key that is there or is not, read as `'earlier' in ctx.needs`, with no second grammar.
- **Two of the seven shapes above now run on real workers** — [W47](../work-items/w47-the-blocked-flow-on-real-workers.md),
  and no rule changes. `nested-map: publish ["item"]` is that row's own entry, given
  `needs: {"own": ".", "scores": ["item?"]}`; and `map-past-a-decision` is a new flow of exactly the
  shape rule 2 is about — a decision routing around a whole map region — where the array **resolves**
  on one payload and is **`[]`** on the other, so `over` names an empty array and the run folds to
  `stuck`. **Rule 4's ARRAY half was observable nowhere before that**: `resolveReference`'s
  `t.form === 'all' ? [] : ABSENT` arm was deletable for **zero** L6 failures, and it now costs 4.
  *(That flow is the item's adequacy reader's construction, after W47 had recorded the array spelling
  as unreachable at L6 and its conformity reader had falsified the stated reason.)*

**What it costs, stated rather than discovered later.**

- **`FD-V29` is the first `FD-V` whose soundness depends on something the document does not
  contain.** Every other validation rule is a statement about the JSON; this one rests on `JP-R5` and
  on no shipped policy firing a join over a parked branch. It is written into the rule, it is
  measured, and `FD-R3` is the backstop — but a reader looking for *what does this validator assume*
  now has one answer where before it had none. [Q200](../questions/q200.md).
- **An author can write `?` where nothing needed it**, and the reference then always resolves. It is
  accepted, on [Q190](../questions/q190.md)'s own precedent — `FD-V26` says what a reference IS and
  *is this suffix necessary* is a question about the graph, so refusing it would put a rule about
  utility inside a rule about a grammar. **The cost is that an author can write one and see nothing
  happen**, which is why it is written down. [Q201](../questions/q201.md).
- **Five reference forms where there were three, and two of them differ from another by one
  character.** `"review"` and `"review?"` are a keystroke apart and mean *the run stops* versus *the
  key is missing*, which are very different things to debug. The mitigation is that the wrong one of
  the two is now a **refusal** rather than a run-time surprise, in the one direction that matters.
- **`FD-R3` keeps two cases and loses its cheap one**, so its test is now a two-map-arity fixture
  rather than a decision. That is `FD-R1`'s own history one section along — *an impossible prescribed
  test is a spec defect* — reached from the other direction: the test was possible, the rule that made
  it possible was missing, and closing the rule cost the fixture.
- **`certainlySettled` is a second graph walk in `src/definition/regions.ts`**, an intersection
  fixpoint beside the reachability one, and like every rule in its block it is meaningless on a cyclic
  graph and skipped there. It builds the reverse arcs itself rather than adding them to `Graph`,
  because it is the one caller that needs them.

**What could reverse it.** An author who wants a conditional reference to distinguish *did not run*
from *ran and produced nothing* — the two cases rule 4's `null` measurement collapses. Today
`{"got": null}` and no key are different, but *ran and returned null* and *ran and failed* are not.
The fix would be a **second** modifier or a wrapper object, and it is additive; it is not taken here
because no flow in either corpus distinguishes them and inventing a token for an unmeasured case is
what P13 decision 4's ordering exists to prevent.
