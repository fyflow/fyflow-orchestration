# P5 — A third and fourth policy, or repairs of the first two?

**Status:** running — **W15 done: built, gated, both readers run and acted on**; W16 and W17 declared, not started
**Question this plan answers:** [Q24](../open-questions.md) — *are `JP-R7` and `JP-R8` a third and
fourth join policy, or repairs of the first two?* The sub-question that decides it, and the one the
measurements below make visible: **should the policy this library tells you to pass be able to say
why a join can never fire?**
**Exit artifact:** the join matrix rendered at **four columns** — the two shipped and the two
refinements, every cell carrying a status, a `describe` and a verdict — and **ladder L6's fifteenth
row: the `all-exit` shape on real workers**, which L6 has never had and which is the exact row
[ADR 0003](../decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) records as
`live-token`'s cost.
**Reserves:** W15-W17, Q91-Q100, ADR 0025-0026

---

## Why this plan, and why now

**Nothing has gained a capability since P1.** P2 added none by declaration, P3 was documentation,
P4 was defects. [Q24](../open-questions.md) is the live **feature** question and
[ADR 0003](../decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) names it as
the first thing a reader of that ADR should look at — *"that objection is now spent"*.

It is also the question this repository has been most careful about. `JP-R7` and `JP-R8` were written
into `spec/join-policy.md` **before either policy existed**, as traps: either refinement written into
the policy it improves would have returned *"the two policies are equivalent"* as a **passing test**,
and W1 wrote one of them itself before its own conformity pass caught it. So the standing rule is
that neither belongs in `src/fold/policies.ts` without its own decision. **This plan is that
decision.**

## The facts, settled before this plan was written

*`doc/workflow.md`: six consecutive plans have measured their load-bearing fact before declaring, and
in all six it changed what got written. The register was verified against the code first — three
plans running have each found a row wrong by trying to act on it, and this is the fourth.*

| | measured |
|---|---|
| **the `unsatisfiable` seam works end to end, and nothing has ever run the chain** | `JP-R8`'s variant on `all-exit`: the driver reports through `onUnsatisfiableJoin` with the policy's own `describe`, appends `joinSettled(fired: false)`, routes nowhere — and `fold(driver.foldInputs())` gives `regions.split.joined === false` and `outcome: 'stuck'`. **Three separate stub tests cover the three links** (`test/driver/driver.test.ts:389`, `test/driver/fold-inputs.test.ts:176`, `test/fold/stuck.test.ts:108`) **and nothing runs them as one chain.** A policy that says `unsatisfiable` is runnable today; this plan does not have to build a seam |
| **the two refinements are not symmetric, and one number each says so** | over the nine matrix rows: **`JP-R8` changes one** — `all-exit`, and nothing else; the other eight are identical in status to shipped `live-token`. **`JP-R7` changes three** — `routed-away`, `optional-null`, `all-exit` — and leaves the three carrying a `branch.lost` waiting forever |
| **and that is by construction, not by coincidence** | `JP-R7` changes exactly the rows whose only non-arrival terminals are `branch.exited`, because that is the event it decrements on. Printed the region-event stream of all nine rows to establish it rather than inferring it |
| **a claim in ADR 0003 and in the register is false** | both say `JP-R7` *"repairs **only** the row P1 named"*. It repairs three. **The ADR's own *Correction* already carries the refutation** — it says `optional-null` and `all-exit` are branch-index permutations of `routed-away` — so the false sentence has been sitting beside its own disproof since P1. The register is corrected; the ADR is W4's file and is **W16**'s, as a *Correction* |
| **`stuck` does not distinguish reported from silent** | `withOutcome` maps `joined !== true` to `stuck`, so a run whose join was **reported** unsatisfiable and one whose join is **silently** waiting forever are the same outcome. The difference lives in `regions[*].joined` (`false` vs `null`) and in whether `onUnsatisfiableJoin` fired — **and that callback is optional**, so a consumer who omits it learns nothing at all |
| **L6 has no `all-exit` row** | fourteen rows — **thirteen `key:` entries in `EXPECTED[]` plus the two-driver pair row, which is constructed outside that array** — over four flows in `examples/flows/`, and in none of them does every branch reach an `end`. So the row this whole question is about has never run on real workers, under either policy. **Nor has any L6 row ever reached `joined: false`**: every `stuck` there is the silent `null` kind |
| **adding a policy to `POLICIES` is a public-surface change** | four assertions pin the set to exactly two (`test/fold/policies.test.ts:228`, `test/matrix/matrix.test.ts:330`, `test/matrix/variants.test.ts:119`, and `examples/l6.ts:76`'s `policyId` union), and `AGENTS.md:284`'s snippet prints it. **`index.ts` needs no edit** — it is `export *` over `src/fold/policies.ts` |
| **and one thing that snippet does NOT check** | `AGENTS.md:284` is ` ```ts run `, so it executes — but its expected value is a **trailing comment**, `// [ 'arrival-count', 'live-token' ]`, and `check-docs` asserts nothing about it. A third policy would leave that line silently false with the gate green. P3's finding, one layer down: **an output comment in a `run` snippet is prose** |

**What the measurement changed.** Q24 reads as one question about two symmetric refinements, and the
register said so. It is not one question. **`JP-R7` is a three-row change to a policy that still
loses on three rows; `JP-R8` is a one-row change to the winning policy, on precisely the row the ADR
that chose it records as its cost.** The plan is written to let those two get different answers.

## The decision that is NOT taken before fan-out, and why that is not a violation

`doc/workflow.md` section 7 rule 3 says *decide, then fan out* — and P1's own model is the exception
that names itself: **Q4 was deliberately not decided by argument**, both candidates were built behind
one interface, and W4's matrix decided it. The same applies here, for the same reason and with the
same guard: `JP-R7` and `JP-R8` exist *because* the obvious argument returns a passing test.

So what is fixed before fan-out is the **evidence and its shape**, not the answer:

1. **W15 builds the evidence and takes no decision.** It renders the fourth column and closes the
   chain nothing runs. It touches no `spec/`, no `src/`, and writes no ADR. It can be built without
   knowing the answer, which is the fan-out gate.
2. **W16 takes the decision as ADR 0025**, and ships whatever the decision says — including
   *"neither"*, which is a real outcome. Adopting `JP-R8` and refusing `JP-R7` is the outcome the
   measurements point at; **the plan does not assert it and W16 is not entitled to inherit it.**
3. **W17 is unconditional either way.** The `all-exit` row at L6 is a gap regardless of what ADR 0025
   says, and it is the row ADR 0003 names.

## What each answer would cost, stated now so W16 cannot discover it late

*These are the three things a reader should check W16 against.*

| | |
|---|---|
| **adopting `JP-R8` changes a run that completes today** | on `all-exit`, shipped `live-token` fires the join and the flow runs on to `completed`. Under the refinement that run is `stuck`. **That is a behaviour change to the blessed policy**, not an added capability, and it is the whole substance of the decision — whether a run in which every branch was abandoned is a run that finished |
| **and it puts a clause in one column the other cannot have** | ADR 0003 rule 2 keeps `arrival-count` shipped *"for as long as both columns can be run"*, and `arrival-count` is structurally unable to return `unsatisfiable` — that is its section 3 definition. `JP-R8` inside `live-token` is the asymmetry `JP-R8` was written to forbid, **at a moment when the comparison it would have distorted is over.** Whether "the comparison is over" is enough is ADR 0025's to argue, not to assume |
| **a fourth policy costs a name, not a mechanism** | the alternative to refining `live-token` is shipping the refinement beside it under its own id, which `JP-R8` already prescribes if it is built at all. It keeps `live-token` byte-identical and hands the choice to the application — and it is [Q5](../open-questions.md)'s per-join-configuration question arriving through the back door, which ADR 0003 called premature *"until Q24 produces a second policy that does not hang"*. It now might |

## Which files this plan takes over, and why

**All three items are serial, never concurrent** — `doc/workflow.md` section 7 rule 2 binds
concurrent items only, and P4's takeover table is the model. Every file below is owned by a **done**
item.

| file | owned by | taken by | why |
|---|---|---|---|
| `test/matrix/**` | W4 | **W15**, then **W16** | the fourth column and the chain assertion are W15's; `variants.test.ts`'s *"neither has an entry in `POLICIES`"* is exactly the assertion a decision falsifies, so W16 revisits it. **Serial** |
| `spec/join-policy.md` | **W1** — not W2 | **W16** | `JP-R7` and `JP-R8` are its section 3 rules and the decision changes what they say. **A spec change is its own change with its rationale stated** — here, ADR 0025. *W2 owns `spec/run-state.md` and `src/fold/**`; the whole of `spec/**` is W1's, which is easy to get backwards* |
| `src/fold/**`, `test/fold/**` | W2 | **W16** | where a policy lives if one is adopted, and `test/fold/policies.test.ts:228` pins the set to two |
| `doc/decisions/0003-*.md` | W4 | **W16** | its rule 5 (*"neither refinement is adopted"*) is what ADR 0025 changes, and its *Consequences* carries the false claim. **A *Correction* in place**, per `doc/decisions/README.md` |
| `AGENTS.md` | W9 | **W16** | the *"Pass `liveToken`"* section describes both refinements as deliberately unbuilt. A surface change breaks its snippet, **which is the gate working** |
| `examples/**` | W5 → W6 → W14 | **W17** | the L6 row, and a new flow file under `examples/flows/` |

**`src/driver/**` is not taken over and is not edited.** The seam is measured working; if it turns
out to need a change, that is a finding for the Record and its own item — the disposition P4 gave
`src/fold/**`.

## Scope

**In**

1. **The fourth column** — the matrix rendered and asserted over all four policies, with `JP-R7`'s
   three rows and `JP-R8`'s one stated as exact lists rather than as counts.
2. **The chain nothing runs** — a policy returning `unsatisfiable`, through a real `Driver`, through
   `foldInputs()`, to `RunState.outcome === 'stuck'` with `joined: false` and a `describe` that
   reached the caller.
3. **ADR 0025 — the decision**, covering `JP-R7` and `JP-R8` **separately**, and stating what it does
   to ADR 0003 rule 2's two-column requirement.
4. **Whatever the decision ships**, with `spec/join-policy.md` amended and its rationale stated.
5. **The `all-exit` row at L6** — every branch reaches an `end` on real workers, under every shipped
   policy.
6. **The false claim corrected in ADR 0003**, as a *Correction*.

**Out** — named rather than left implicit, with where it goes instead

- **[Q86](../open-questions.md) and [Q87](../open-questions.md).** P4's retro leaves the ruling to
  this plan and the ruling is below; **neither is folded in.** Folding a driver fix into a
  join-policy plan is how P4 shipped them as prose on its own last day.
- **[Q36](../open-questions.md)** — what a satisfied join carries downstream. It is `null` and stays
  `null`; a policy that declines to fire carries nothing either way.
- **[Q5](../open-questions.md)'s remainder** — per-join policy configuration. If ADR 0025 ships a
  fourth policy, that question gets sharper and it is still not this plan's.
- **[Q37](../open-questions.md)** — that `joinStatusOf` is a poll, and `onUnsatisfiableJoin` is
  optional so a consumer who omits it learns nothing. **Measured here, recorded, not fixed**: it is a
  driver-surface question and this plan does not take `src/driver/**`.
- **[Q6](../open-questions.md)** (nested fan-out) and **[Q12](../open-questions.md)** (map-style
  fan-out) — the other two feature candidates. `FD-V15` still refuses nested fan-out.
- **[Q71](../open-questions.md)** — `SchedulerLike` under the DOM lib. `X5` reports it every run and
  fails if it worsens; out by declaration for the second plan running.

## Work items

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| [W15](../work-items/w15-the-fourth-column-and-the-chain-nothing-runs.md) | The fourth column, and the chain nothing runs | `test/matrix/**` — from W4 | nothing | L0-L5, then two readers |
| [W16](../work-items/w16-the-decision-and-what-it-ships.md) | The decision, and what it ships (ADR 0025) | `spec/join-policy.md` (W1), `src/fold/**` + `test/fold/**` (W2), `test/matrix/**` + `doc/decisions/0003-*.md` (W4), `AGENTS.md` (W9) | W15 | L0-L5, ADR 0025, then two readers |
| [W17](../work-items/w17-the-all-exit-row-at-l6.md) | The row L6 has never had — every branch exits, on real workers | `examples/**` — from W14 | W16 | L0-L6, then two readers |

**Why three and not one**, which is section 7 rule 1's test — items are separated by a spec, never by
intuition. W15 is `spec/join-policy.md` sections 3-4 read as a **measurement** and writes nothing
normative. W16 is `spec/join-policy.md` section 3 **amended**, plus an ADR. W17 is
`spec/run-state.md` section 3 on real workers and touches neither. **W15 first, deliberately**: it is
the item that can be built without knowing the answer, and building it first is what stops the
decision being written from the argument in this document.

## Open questions this plan carries

| Q | | Owner |
|---|---|---|
| [Q24](../open-questions.md) | third and fourth policy, or repairs | **W16** — closed by ADR 0025, whichever way it goes. **Its "repairs only the row P1 named" clause is corrected first**, in the register (done) and in ADR 0003 (W16) |
| [Q7](../open-questions.md) | can a join time out | still open, and **narrower after this plan than before**: if a shipped policy can return `unsatisfiable`, one more class of stuck join is reportable without a clock. W16 will have an opinion it is not entitled to record as an answer |
| [Q37](../open-questions.md) | who asks whether a join is stuck, and how often | still open. W15 measures that `onUnsatisfiableJoin` is optional and `joinStatusOf` is a poll; **neither item fixes it**, because `src/driver/**` is not taken over |
| [Q5](../open-questions.md) | is the policy per-join configurable | still open, and ADR 0003 made it conditional on this plan's outcome |

## The ruling on Q86 and Q87, which P4's retro refused to make about itself

*P4 blessed a topology — two `Driver`s on one scheduler, [ADR 0023](../decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md) —
and shipped two of its preconditions as prose. Its retro calls that "what P3's retro criticised, done
knowingly on the last day of the plan" and leaves the verdict here.*

**Both were re-measured against the shipped code before ruling, and the register is corrected:**
Q86 reproduces exactly as written; **Q87 was understated in two ways** — the corruption begins at the
second `start()`, before any event arrives, and one settlement produced **four** dispatches rather
than two.

**The ruling: P5 folds in neither, they are not one question, and only one of them is a
precondition.**

The criterion is P4's retro's own, from its finding 4: ***a precondition is a property of the design;
an apology is a property of a defect.*** Applied, they come apart:

| | |
|---|---|
| **[Q87](../open-questions.md) — run ids unique across drivers on one scheduler — is a genuine precondition** | Two runs sharing an id **are the same run** by the library's own naming; there is no semantics for it to have. The consumer can audit it in their own two lines of code, which is what makes it a precondition rather than a hazard. **And the only in-library enforcement is disproportionate**: `SchedulerLike` is two methods by [ADR 0013](../decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md) rule 1, so no driver can ask who else is subscribed, and the alternative is a `WeakMap<SchedulerLike, Set<runId>>` — **which would be the first mutable module-level state in `src/`**. Measured: every module-level binding in `src/` today is an immutable constant. Buying detection of a mistake visible in the consumer's own source, at that price, is not obviously right. **Prose was right for the enforcement half** |
| **but one sentence of it is an apology, and it is in shipped code** | `MultipleRuns`' message reads *"Construct a second Driver; ADR 0023 makes that safe on the same scheduler."* It does **not** say *with a different run id*. A caller re-running the same workload constructs a second `Driver` and the obvious id is the one they already have — so the library's own error message recommends the violation. **That is [Q72](../open-questions.md)'s defect class reproduced by P4's own fix for Q72**, and it costs one sentence |
| **[Q86](../open-questions.md) — the scheduler carries only flow tasks — is an apology, not a precondition** | The design does not require it. ADR 0023 already decides ownership from the task id alone, and `buildTaskId` is the only minter — so *"does not parse ⇒ cannot be ours"* follows from the design already taken. The precondition exists to protect a **choice** (keep `InvalidTaskId` attributable at the scheduler edge), not the design. **And unlike Q87 the consumer cannot audit it**: *"carry only flow tasks"* is a claim about everything else on that scheduler, including code the flow author does not own. A precondition nobody can check is a hazard with better manners |

**So the disposition, and it is deliberately not "P5 does it":**

1. **Q86 needs a decision, not a bug fix.** It is one line with a genuine two-sided argument — the
   *against* is real, and its cost is measurable: `test/driver/lifetime.test.ts:117` asserts the
   current behaviour as **correct**, so changing it deletes a passing test that was written on
   purpose. That is an ADR, and it belongs with the item that owns `src/driver/**`.
2. **Q87's message sentence is a one-line defect** in the same file, of the class P4 spent three
   items removing.
3. **Both are one subject — *what may share a scheduler with a driver* — and that is a plan, not a
   fold-in.** It is P4's shape at a quarter of the size. **P6** is where they go, and it should run
   before this repository recommends the shared-scheduler topology to anyone outside it.
4. **What P5 does about them is exactly what it has done above**: verify, correct the register, and
   record the ruling with its argument. `doc/open-questions.md`'s Q86 and Q87 rows now carry the
   measurement; **neither has an owner and that is the honest state**, not a deferral dressed up —
   the ruling says which of the two is a defect (Q86, plus one sentence of Q87) and which is a
   precondition that stands (the rest of Q87), which is the thing P4's retro could not say about
   itself.

## A note on ids

**W10 stays held and W11 stays skipped**, both by P4's reasoning: P2's retro named `check-owns.mjs`
**as W10, by name and by link**, and although P4's retro **retired that proposal**, taking W10 here
would still make that sentence false. Ids are never reused. **ADR 0024 is P4's unused reserve and is
skipped, never reissued**, so this plan starts at **0025**. Q ids resume at **Q91**; the highest in
the register is Q90.

## Record

*Filled in when the plan's items are merged and its retro is run.*

**Progress.** [W15](../work-items/w15-the-fourth-column-and-the-chain-nothing-runs.md) is **done**:
L0-L5 green in all five runtimes (**370** assertions, up from 326; `test/matrix/**` is 91 in four test
files), **both readers run and every finding acted on** — 4 defects and 5 blocking mutation families,
with **1 overlap**. It took **no decision and wrote no spec**, which was the fan-out gate. Its full
Record is in the item; **four things belong to this plan rather than to it**:

1. **[Q91](../open-questions.md) is evidence W16 is entitled to and did not have.** `JP-R7`'s variant
   fires a join **zero branches reached** on `all-exit` — `need` decremented to 0 against an empty
   `arrived` — which is the exact cost [ADR 0003](../decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)
   records for `live-token` and the exact thing `JP-R8` removes. **The refinements are not merely
   asymmetric in size; they point in opposite directions**, and the counts *three* and *one* that
   this plan was declared from did not show it. ADR 0025 has to rule on that, and the plan's
   *"adopting `JP-R8` and refusing `JP-R7` is the outcome the measurements point at"* now has a
   second, independent reason — which is exactly why W16 *"is not entitled to inherit it"*.
2. **[Q94](../open-questions.md) is W16's and is one paste.** ADR 0003 carries a hand-copied
   **two**-column matrix; `test/matrix/render.ts` now emits four. The divergence arrived because the
   artifact was extended, not because anyone edited the ADR.
3. **Rule 7 (c) is still unexercised, for the third plan running.** W15 added no check script and
   said so in its `Out` list rather than leaving the retro to find it. **W16 or W17 must add one, or
   this plan's retro reports it a third time.**
4. **P4's retro prediction 1 has its first answer and it is not the predicted one.** The prediction
   was that rule 8's *write to the rule* form would produce **fewer reader survivors in the
   provocation family**. W15's author set was **not** narrow in the old direction — it was complete on
   the rules and found the one code-level survivor ([Q95](../open-questions.md)) — and both readers
   still found blocking gaps, because **every probe written to a rule mutates something the suite
   reads, and neither of the things W15 CREATED was read by the suite**. The renderer was a script
   the gate never executes; the variants were promoted to columns without inheriting a single
   clause-level test. **The amendment is right and it is not sufficient**, and the missing half has a
   name: the `Outputs` table asks a question about the *deliverable*, and the provocation set answers
   one about the *code*. One sample, and the retro should say so rather than amending again.

**Four things P4 left for this plan's retro**, carried here so they are not lost:

1. **Does rule 8's "write to the rule" form change the numbers?** The prediction is fewer reader
   survivors in the provocation family. **If W15-W17's readers still find the author's set narrow in
   the same direction, the amendment did not work** — and P4's retro says the answer is then not
   another sentence.
2. **Does rule 7 (c) ever fire?** Unexercised by P4. **W15 adds no new check either**, so this is the
   third plan carrying it unless W16 or W17 adds one.
3. **Does the `Owns` list stay correct now the register is named?** Three items audited correct after
   three that were not. `check-owns.mjs` comes back if one miscounts.
4. **Q86 and Q87** — ruled on above, before any work item started rather than in the retro, because
   the ruling changes what P5 is allowed to scope.
