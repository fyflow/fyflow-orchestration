# P13 — When is a declared reference refused, and what does it cost?

**Status:** DECLARED 2026-09-10, after [P12](p12-what-a-node-receives-and-what-a-decision-sees.md)
closed and `doc/workflow.md` reached [v0.13](../workflow.md).
**It is a PRODUCT plan, and it is the second in a row** — the first back-to-back pair since P1-P2.
*Read every status from the item's own file.*

```
Question:   When is a declared reference refused, and what does it cost?
Reserves:   W45-W48 (W48 expected unused), Q199-Q213, ADR 0042-0043
            (FIFTEEN questions. P11 reserved five and extended TWICE; P12
            reserved ten and extended once, at its own last item's
            declaration. Section 3 says reserve generously, and three
            consecutive plans have measured that ten is not.)
Exit:       one ordinary flow that this library either refuses at run time or
            cannot express at all, running end to end on a real
            `FyflowScheduler` in both L6 runtimes:

              *route to review if an earlier step flagged it, and publish
               either way* - a reference to a value that only SOME paths
               produce.

            Today it validates with zero findings and stops the run with
            `FD-R3` on every workload that takes the other edge (fact 1).
```

## Why this plan, and why now

**[P12](p12-what-a-node-receives-and-what-a-decision-sees.md) gave an author a way to reach an
earlier node's output, and left two ways to write one that does not work.** ADR 0040 and ADR 0041
answered *what can a node reach* and *what does a decision see*; neither answered **when a reference
is refused**, and both of that question's live cases were raised by P12's own readers rather than by
its authors.

**[Q187](../open-questions.md) is the sharp one, and it is [ADR 0002](../decisions/0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md)
rule 3's own argument failing against a rule written four days ago.** `FD-V27` requires
**reachability** and not **dominance**, so a reference across a decision is accepted at instantiation
and refused at run time — *on the one workload that takes the other branch*, which is the exact shape
ADR 0002 rule 3 exists to prevent. **Reproduced at this declaration** (fact 1): zero findings, and
then a run that dispatches two of four tasks and stops.

**[Q186](../open-questions.md) is the other one and it is a cost rather than a refusal.**
[ADR 0037](../decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
measured *a clone of the whole payload per map instance* and **refused it as unaffordable for the
feature that needed it**; `needs` makes exactly that clone available on request, per key, and
**nothing warns**. Re-measured at this declaration (fact 3) and W41's numbers reproduce.

**Why the two are one plan.** Both are questions about **what a reference is allowed to name**, and
both have the same candidate answer — a **fourth reference form**. A rule that refuses a reference
whose target may not run, and a rule about a reference whose target is too large, are two constraints
on one grammar; deciding either alone would let one case pick the shape. *That is P12's own decision 1
one plan on, and P10's before it.*

**The argument against declaring it** is that `FD-R3` already refuses the Q187 case with a message
naming the cause, and W41 chose that deliberately on `FD-R2`'s precedent: *a run-time fact gets a
run-time refusal.* The argument for is fact 2 — **the objection that a dominance rule would refuse
valid flows has no instance in this repository**, so the choice W41 made on a principle can now be
made on a measurement.

## What was measured before this plan was declared

**Six facts. Every register row this plan is built on HELD, and the two things that turned out wrong
were this declaration's own probes** — which breaks a streak of fourteen consecutive plans finding a
row wrong by trying to act on it, and is recorded as the result rather than dressed up as one.

**1. [Q187](../open-questions.md) reproduces exactly, in both directions.** The flow
`ingest -> decide -{when}-> flag -> publish` / `decide -{default}-> publish`, with
`publish` declaring `needs: {"f": "flag"}`:

```
validateDefinition                       0 findings  (accepted)
LOW  — takes the flag branch             dispatches ingest, decide, flag, publish
HIGH — routes around it                  dispatches ingest, decide, then STOPS
                                         UnresolvedReference: node "publish" at branch path "-"
                                         declares `needs["f"]` naming "flag", and no output of
                                         that node is on this path
```

**The message is good and the moment is wrong**: it names the node, the key, the target and the path,
and it arrives on the workload that takes the other edge rather than at instantiation.

**2. DOMINANCE is computable, and it refuses NOTHING that exists today.** Iterative dominators over
the entry-rooted DAG, run across **both** corpora — `spec/examples/valid/**` and `examples/flows/**`,
26 flows — found **6 aimed references** (the `"."` form names no node and is excluded) and a dominance
rule **would refuse 0 of the 6**. It refuses the fact-1 flow. **So Q187's stated objection — *a
dominance rule refuses valid flows whose every real workload takes the producing branch* — has no
instance in this repository.** *(The scope is 6 references over 26 flows, which is small, and it is
stated rather than generalised: this measures that the corpus contains no counter-example, not that
none exists.)*

**3. [Q186](../open-questions.md)'s cliff reproduces on the tree this plan starts from.** Timing the
map's fan-out alone over a 1000-item payload:

| what the branch entry declares | W41 | today |
|---|---|---|
| no `needs` | 6.5 ms | **8.3 ms** |
| `{"item": "."}` | 8.0 ms | **8.7 ms** |
| + one key naming a **small** node's result | 10.6 ms | **10.0 ms** |
| + the same key naming the **1000-item** result | 546.6 ms | **560.5 ms** |

**64x, and which node id the author typed is the whole of the difference.**

**4. And an author cannot point at less than a NODE'S WHOLE RESULT, which is sharper than
[Q186](../open-questions.md)'s row states it.** That row says *what an author points it at is what
costs*. **Found by getting this declaration's own fixture wrong**: the "small result" probe first
named a node whose result **contained** the 1000 items, and it cost **562.6 ms** — the full cliff,
from a key the author wrote in order to get something small. A reference names a node, so it carries
everything that node returned. *The row is right and its consequence is one step further out than it
says.*

**5. [Q190](../open-questions.md) is CONFIRMED in both its shapes and is NOT this plan's.** An edge
with a `needs` and no `when` validates with **0 findings**; so does a `join`'s single exit edge, which
`FD-V7` forbids from carrying a `when` at all. **Its status cell already reads *decided as ACCEPTED,
and the decision is written down*** and its forcing condition — an author reporting it, or a third
inert shape — has not occurred. *(An empty `needs: {}` is refused by `FD-V26` at both sites, which is
not one of the two shapes; this declaration's first probe aimed there and measured the wrong thing.)*

**6. The reference grammar has NO expression for *if it ran*.** `spec/flow-definition.md` section 3's
reference table has **three** rows and none of them is conditional. *(A first probe reported the word
`optional` present in that section and it is
[`optional` on a task node](../../spec/flow-definition.md) and `optional, default ["done"]` on the
`on` key — a false positive from a crude search, corrected here rather than carried into the plan.)*

## Scope

**In**

1. **[Q187](../open-questions.md)** — whether a reference whose target may not run is refused at
   instantiation, and if so how. **The fork is named and neither side is preferred here**: a
   **dominance rule** on `FD-V27`, or a **fourth reference form** that says *if it ran*.
2. **[Q186](../open-questions.md)** — whether anything warns about a reference to a large value, or
   whether the answer is that nothing should and the reason is written down.
3. **The exit artifact**: the flow in the `Exit:` block above, on real workers, in both L6 runtimes.

**Out** — named rather than left implicit, with where it goes instead

- **[Q190](../open-questions.md)** — decided as ACCEPTED and recorded, fact 5. Reopening a decision
  whose forcing condition has not occurred is what section 6 pass 3 rule 1 calls measuring your own
  output.
- **[Q22](../open-questions.md)'s constraint decision.** A driver-side size guard for
  [Q186](../open-questions.md) would have to answer *how large is too large*, which is Q22's question
  and is unresolved. If W46 needs it, that is a **stop and ask the maintainer**, not a scope creep.
- **[Q19](../open-questions.md)** — is retained state bounded. ADR 0040 makes it sharper and P12's
  retro says so; it still needs a measured run at 1000s of workloads, which this repository does not
  have.
- **[Q195](../open-questions.md)-[Q198](../open-questions.md)** — P12's evidence-layer questions. They
  are about how this repository tests, not about what the library does, and v0.13 has just acted on
  the three of them that had two occurrences.
- **The gate** — [Q181](../open-questions.md), [Q182](../open-questions.md) and
  [Q183](../open-questions.md) are live, unowned and not this plan's, for the second plan running.
- **[Q165](../open-questions.md)'s reducer.** The flow that forced it runs without one.

## Decisions taken before fan-out

**1. The KEY is not reopened.** [ADR 0040](../decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)'s
pair `(node id, branchPath)` stands, and P12's retro recorded it as the third mechanism in three plans
to converge on it. **This plan is about when a reference is LEGAL, not about what names an output.**

**2. `spec/join-policy.md` section 4 is not reopened** — `JP-R11` and `JP-R12` are ADR 0037's, and
this is P12 decision 3 carried forward for the same reason.

**3. No new node kind**, P12 decision 4 carried. Every candidate here is a property of a reference.

**4. Q187 is decided BEFORE Q186, and the argument is fact 4.** If the answer to Q187 is a fourth
reference form, that form is where a size question would also have to live — so deciding the cost
question first would let it pick the grammar. **The refusal has two real cases and the cost has one
number.**

## Work items

| id | | owns |
|---|---|---|
| **W45** | *What a reference must be able to say.* [Q187](../open-questions.md), decided as **ADR 0042** from facts 1, 2 and 6 — a dominance rule on `FD-V27`, or a fourth reference form, and the evidence must include **a flow that a dominance rule would refuse and an author would want**, or record that none could be constructed. Builds whichever it takes, with the `spec/` rule and its id. | `src/definition/**`, `spec/flow-definition.md`, `spec/examples/**`, `test/definition/**`, `doc/decisions/0042-*.md`, and `src/driver/driver.ts` if a fourth form reaches the resolver |
| **W46** | *What a reference costs, and whether anything says so.* [Q186](../open-questions.md) — **ADR 0043 only if something is built**; a recorded verdict that nothing should warn, with the reason, is the expected outcome and is a legitimate result. Fact 4 is its sharpest input. | `src/driver/driver.ts`, `spec/flow-definition.md` section 3, `test/driver/**`, `doc/decisions/0043-*.md` |
| **W47** | *The blocked flow on real workers.* The exit artifact, in **both** L6 runtimes, with what reverting W45 costs measured in L6 failures. | `examples/**` |
| **W48** | **reserved and expected unused**, on P9's, P11's and P12's precedent. A reserved id that is not spent is still not free. | — |

**Serial, and the reason is section 7 rule 2**: W45 and W46 would both edit
`spec/flow-definition.md` section 3 and both may reach `src/driver/driver.ts`. W47 depends on both.

**W45 and W46 both name `AGENTS.md`, `spec/README.md` and `scripts/check-docs.mjs` NOWHERE, and that
is deliberate.** P12's retro proposed pre-declaring them and **refused it** at one plan's evidence,
on the ground that twenty-two late exceptions were declared and zero were undeclared. **P13 is the
test of that refusal**: if both items take all three again, the next retro should adopt it.

## Predictions, written down before the items that test them

**Two derived and two reach**, and P12's retro added the distinction this plan is watching for: a
reach prediction can reverse **and** be wrong about its own evidence.

| # | kind | prediction | tested by | what would reverse it |
|---|---|---|---|---|
| 1 | derived | **A dominance rule refuses nothing that exists, so adopting it costs zero in the corpus.** Fact 2 measured it; this checks whether the inference survives the flows W45 writes | W45 | a corpus flow that dominance refuses and an author wants — which is exactly what W45's evidence is required to try to construct |
| 2 | **reach** | **The answer is a FOURTH REFERENCE FORM and not a validator rule.** Fact 6 says the grammar cannot express *if it ran*, and a dominance rule refuses the flow rather than letting the author say what they mean — this is the reversible one | W45 | dominance expressing everything an author wants, which would make the fourth form a feature with no case behind it |
| 3 | derived | **W46 takes NO ADR and records why.** Fact 4 says the cost is a property of what a node returns, so any guard must judge SIZE at run time, which is [Q22](../open-questions.md)'s unresolved question | W46 | a warning that needs no size judgement — most likely a static one about a reference into a map region, which the document already knows about |
| 4 | **reach** | **`FD-V27` is not the only rule that moves.** If prediction 2 holds, `FD-V26` and section 3's reference **table** both grow — and that table's row count is a live bound in three places: `check-spec`, W41's L1 census, and [W43](../work-items/w43-the-two-blocked-flows-on-real-workers.md)'s L6 cross-row clause | W45 | a fourth form expressed without a table row — a modifier on an existing form rather than a new one, which would move `FD-V26` and leave the count alone |

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q187](../open-questions.md) | reachability is not dominance — **the plan's question** | **W45**, by ADR 0042 |
| [Q186](../open-questions.md) | a reference to a large value is the refused quadratic on request | **W46**; closed or explicitly not |
| [Q22](../open-questions.md) | must a node result be structured-cloneable — the constraint half | no owner — **named because W46 may need it and must stop rather than take it** |
| [Q190](../open-questions.md) | an inert `needs` is accepted | no owner — **decided, and fact 5 confirms both shapes** |
| [Q192](../open-questions.md) | the edge caller contributes one independent bound to `resolveReference` | no owner — W45 may move that expression and should say so |

## A note on ids

**W44 is spent and unused** ([P12](p12-what-a-node-receives-and-what-a-decision-sees.md) reserved it
and its retro closed it), so this plan starts at **W45**. ADR ids resume at **0042**; Q ids at
**Q199**, with [Q168](../open-questions.md)-[Q169](../open-questions.md) remaining a gap, which is
free.

**The block is FIFTEEN, and that is the third measurement rather than caution.** P11 reserved five and
extended twice; P12 reserved ten — *"ten rather than five, because P11 spent five before its second
item raised one"* — and extended once, at its own last item's declaration step, with the block empty
before that item started. **Ten has now been measured not-generous exactly as five was.**

## The baseline this plan starts from

`8511a4f`, clean tree, `GATE EXIT=0`, zero FAIL lines, 15 chain entries.

```
~404 s of `selftests` (7/7 completed, 7 ok, 5 lanes)
633 test() CASES, 24 files, in node 24.20.0, deno 2.9.6 and chromium
760 assertions at L6, 0 failed, 36 real runs, in node and deno
spec        — 7 documents, 40 examples, 87 rules
markdown    — 86 documents, 3471 relative links, 171 anchored
register    — 155 questions, 107 open, 2 deferred, 46 resolved
```

**[Q142](../open-questions.md) did NOT fire, and the headroom is recorded rather than assumed.** This
declaration adds one document, to `doc/plans/` — which probe 2 REMOVES — so it moves the
one-directory fixture and not the two-directory one. Measured on a scratch copy outside the
repository: whole tree **87 / 3532 / 171**, `doc/decisions` removed **66 / 3218 / 171**, both removed
**52 / 2537 / 171**, against floors of `M3` **74** and `M4` **2700**. Both `removes` probes still
fire — `check:markdown:selftest` is **37/37 caught, 7/7 bounded**. **`M4`'s margin is 163 links**
(2537 against 2700), and `M4` is the one that closes from below on **prose**, so the item that writes
this plan's Records is the likely next retune — [W33](../work-items/w33-a-map-at-run-time-arity.md)'s
instance, *the obligation is on writing PROSE, not on adding FILES*.

**Three things about those numbers.** `npm run gate` runs `test:browser`, which is **chromium only**;
firefox and webkit need `test:browser:all`. **633 counts `test()` cases and 760 counts individual
assertions ([Q98](../open-questions.md)) — they are never added.** And wall time is not reproducible
here ([Q179](../open-questions.md)); the number above is one reading.

## Record

*Filled in at the join, after the work items are merged.*

**Retro.** *`doc/workflow.md` section 6 pass 3. It owes a verdict on each of the four predictions, on
whether v0.13's three changes hold on a plan that did not write them, and on the `Owns`
pre-declaration rule its own predecessor proposed and refused.*
