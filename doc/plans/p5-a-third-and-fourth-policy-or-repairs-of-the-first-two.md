# P5 — A third and fourth policy, or repairs of the first two?

**Status:** **COMPLETE and retro'd.** Three items, six reader passes, `doc/workflow.md` at **v0.7**
**Question this plan answers:** [Q24](../questions/q24.md) — *are `JP-R7` and `JP-R8` a third and
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
P4 was defects. [Q24](../questions/q24.md) is the live **feature** question and
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
| **a fourth policy costs a name, not a mechanism** | the alternative to refining `live-token` is shipping the refinement beside it under its own id, which `JP-R8` already prescribes if it is built at all. It keeps `live-token` byte-identical and hands the choice to the application — and it is [Q5](../questions/q5.md)'s per-join-configuration question arriving through the back door, which ADR 0003 called premature *"until Q24 produces a second policy that does not hang"*. It now might |

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

- **[Q86](../questions/q86.md) and [Q87](../questions/q87.md).** P4's retro leaves the ruling to
  this plan and the ruling is below; **neither is folded in.** Folding a driver fix into a
  join-policy plan is how P4 shipped them as prose on its own last day.
- **[Q36](../questions/q36.md)** — what a satisfied join carries downstream. It is `null` and stays
  `null`; a policy that declines to fire carries nothing either way.
- **[Q5](../questions/q5.md)'s remainder** — per-join policy configuration. If ADR 0025 ships a
  fourth policy, that question gets sharper and it is still not this plan's.
- **[Q37](../questions/q37.md)** — that `joinStatusOf` is a poll, and `onUnsatisfiableJoin` is
  optional so a consumer who omits it learns nothing. **Measured here, recorded, not fixed**: it is a
  driver-surface question and this plan does not take `src/driver/**`.
- **[Q6](../questions/q6.md)** (nested fan-out) and **[Q12](../questions/q12.md)** (map-style
  fan-out) — the other two feature candidates. `FD-V15` still refuses nested fan-out.
- **[Q71](../questions/q71.md)** — `SchedulerLike` under the DOM lib. `X5` reports it every run and
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
| [Q24](../questions/q24.md) | third and fourth policy, or repairs | **W16** — closed by ADR 0025, whichever way it goes. **Its "repairs only the row P1 named" clause is corrected first**, in the register (done) and in ADR 0003 (W16) |
| [Q7](../questions/q7.md) | can a join time out | still open, and **narrower after this plan than before**: if a shipped policy can return `unsatisfiable`, one more class of stuck join is reportable without a clock. W16 will have an opinion it is not entitled to record as an answer |
| [Q37](../questions/q37.md) | who asks whether a join is stuck, and how often | still open. W15 measures that `onUnsatisfiableJoin` is optional and `joinStatusOf` is a poll; **neither item fixes it**, because `src/driver/**` is not taken over |
| [Q5](../questions/q5.md) | is the policy per-join configurable | still open, and ADR 0003 made it conditional on this plan's outcome |

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
| **[Q87](../questions/q87.md) — run ids unique across drivers on one scheduler — is a genuine precondition** | Two runs sharing an id **are the same run** by the library's own naming; there is no semantics for it to have. The consumer can audit it in their own two lines of code, which is what makes it a precondition rather than a hazard. **And the only in-library enforcement is disproportionate**: `SchedulerLike` is two methods by [ADR 0013](../decisions/0013-the-scheduler-is-a-development-dependency-reached-from-the-working-tree.md) rule 1, so no driver can ask who else is subscribed, and the alternative is a `WeakMap<SchedulerLike, Set<runId>>` — **which would be the first mutable module-level state in `src/`**. Measured: every module-level binding in `src/` today is an immutable constant. Buying detection of a mistake visible in the consumer's own source, at that price, is not obviously right. **Prose was right for the enforcement half** |
| **but one sentence of it is an apology, and it is in shipped code** | `MultipleRuns`' message reads *"Construct a second Driver; ADR 0023 makes that safe on the same scheduler."* It does **not** say *with a different run id*. A caller re-running the same workload constructs a second `Driver` and the obvious id is the one they already have — so the library's own error message recommends the violation. **That is [Q72](../questions/q72.md)'s defect class reproduced by P4's own fix for Q72**, and it costs one sentence |
| **[Q86](../questions/q86.md) — the scheduler carries only flow tasks — is an apology, not a precondition** | The design does not require it. ADR 0023 already decides ownership from the task id alone, and `buildTaskId` is the only minter — so *"does not parse ⇒ cannot be ours"* follows from the design already taken. The precondition exists to protect a **choice** (keep `InvalidTaskId` attributable at the scheduler edge), not the design. **And unlike Q87 the consumer cannot audit it**: *"carry only flow tasks"* is a claim about everything else on that scheduler, including code the flow author does not own. A precondition nobody can check is a hazard with better manners |

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

**Progress.** **[W17](../work-items/w17-the-all-exit-row-at-l6.md) is done — gated in both L6
runtimes, both readers run, every finding acted on.** The plan's **exit artifact is complete**:
ladder L6 is **19 real runs and 342 assertions** in Node and Deno, and the `all-exit` shape runs on real workers
under every shipped policy — `completed` under `live-token`, silently `stuck` under `arrival-count`,
and **`stuck` with `joined: false`** under `live-token-requiring-arrival`, which is the first row at
L6 in this repository where a join is *reported* dead rather than merely never firing. **Three things
belong to this plan rather than to the item:**

1. **The three declared rows could not test the policy they were built for, and a rule-written
   provocation is what found it.** All three run `live-token-requiring-arrival` on one scenario, and
   on that scenario `arrived` is always zero — so deleting the arrival count from the policy left the
   whole of L6 green. **This is P4's retro prediction 1 answered in the direction W15 and W16 did not
   see.** Their finding was that provocations written to the rule are blind to what the item
   *created*; W17's is the mirror — the thing the item created was blind to a **clause of the rule**,
   and only a probe walking `spec/join-policy.md` section 3 clause by clause could see it. **The
   amendment is right, it is not sufficient, and the insufficiency runs both ways.** Three items, and
   the retro now has the shape of the answer rather than two samples of one half.
2. **A rule that was FOLLOWED and failed anyway, in the harness rather than in the document.** W6
   arranged L6's causal order with per-role delays so `settleJoin` on the `lost` and `exited` paths
   would be reachable, and recorded it as the fix for its adequacy reader's finding. **That
   arrangement was held down by nothing**: reversing one `Set` literal in `examples/run-flow.ts`
   restores W6's original defect exactly — `settleJoin` deletable from the `lost` path with all 336
   assertions passing — and drops `exit-last` from four failures to none on the `exited` path. It is
   `doc/workflow.md` section 5 rule 8's own case, one item late: **W6's repair could not fail, and
   rule 8 was adopted after W6 shipped.** Closed by `Expectation.joinSettledBy`; the residue is
   [Q99](../questions/q99.md).
3. **[Q100](../questions/q100.md) is W15's renderer finding in a second file, which is section 6 pass
   3 rule 2's bar.** W15's four-column render was a script the gate never executes and survived seven
   mutations; L6's table **is** executed and **nothing asserts a character of it**. W17 found it the
   way L7 is supposed to be found — by a person reading the output — and what it found was a
   truncated key naming a run that does not exist. Two occurrences, two files, one class: *the
   deliverable a human looks at is outside every rung that checks anything.*

**And W17's readers found two BLOCKING survivors, both in the harness rather than in the library, and
both the same shape.** The termination race could be replaced by a **1200 ms sleep** — a timer
*longer* than the run rather than shorter — with all 341 assertions passing, because `finishedBy` was
read from a flag the microtask set rather than from the race's own result; and `lateInputs`' single
recording could be deleted, making `RN-R12`'s *"nothing arrived after"* a tautology on all nineteen
rows. **Both are W5's finding and this file's own `timedOut` lesson, in fields that had not inherited
it.** Both are fixed by deriving the value from its one source, and the fixes are provoked: the
reader's exact probe now costs 22 failures, and a genuinely late input costs 18. **The item's own
provocation was the weaker half of a pair and there was no way to see that from the inside** — the
1 ms substitution is the one W5 recorded, so reproducing it read as reproducing the finding.

**Overlap: 3 of ~31**, the eighth measurement and inside the band — 1, 3, 3, 3, 3, 4, 4, 3.

**Progress.** **[W16](../work-items/w16-the-decision-and-what-it-ships.md) is built and gated and
its readers have since run and every finding is acted on.** [ADR 0025](../decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md)
answers [Q24](../questions/q24.md) and **the two rules got different answers**: `JP-R8`'s refinement
is **adopted** as a third policy under its own id, `live-token-requiring-arrival`; `JP-R7`'s is
**refused**. `live-token` and `arrival-count` are byte-identical, so ADR 0003 rules 1-4 stand, and
**not one of the 36 matrix cells changed** — `node test/matrix/render.ts` is byte-identical across the
decision. 386 assertions in five runtimes, up from 370; L6 green and untouched. **Five things belong
to this plan rather than to the item:**

1. **The plan's conclusion survived and its argument did not.** *"Adopting `JP-R8` and refusing
   `JP-R7` is the outcome the measurements point at"* is what the evidence gives — **and this plan's
   stated reason for refusing `JP-R7`, *"a three-row change to a policy that still loses on three"*,
   is not the reason.** The reason is that its divergence from `live-token` is
   `waiting`-against-`satisfied` on **every** row where they differ, so the whole of its contribution
   is a silent hang, and that on the row it repairs it fires a join zero branches reached. **W16 not
   being entitled to inherit the leaning was load-bearing**, and not in the way the sentence
   predicted: the conclusion was safe to inherit and the argument was not.
2. **[Rule 7 (c) fired, for the first time in three plans](../workflow.md).** `scripts/check-policies.mjs`
   holds `JP-R9` — *a policy `id` exists in `spec/join-policy.md` section 3 or it does not exist* —
   with **thirteen** checked-in probes — ten at W16's Record, and its adequacy reader found `PROBES.length` vacuously
   satisfied at zero, so there is now a `MIN_PROBES` floor — nine of the original ten tripping exactly one check and the tenth declaring a structural
   cascade. **Three of the thirteen failed at birth**: two were holes in the check, one was a probe that
   edited a heading the parser does not read. **The form discriminated**, and P5's retro can report
   it as exercised rather than carrying it a fourth time.
3. **Rule 8's write-to-the-rule form has its second measurement and it is the same as the first.**
   28 mutations: **every probe written to a rule went red, and four of five aimed at what the item
   CREATED survived** — section 3's third-row wording can be rewritten to demand two arrivals, and a
   column can be deleted from ADR 0025's pasted table, with the whole gate green. **That is W15's
   finding reproduced in a second item with the amendment in force**, which is section 6 pass 3
   rule 2's bar. The retro has two occurrences, not one sample.
4. **`Reserves:` obliges writing files that no `Owns` block names, and P4's retro fixed only half of
   it.** That retro named `doc/open-questions.md` in the record-step list because every `Reserves:`
   line obliges a register write — **and every `Reserves:` line names ADR ids too.** `doc/decisions/`
   is in neither the list nor any `Owns` block, so every item that ever reserved an ADR wrote an
   undeclared file. W16 also found `doc/decisions/README.md`'s index missing **ADR 0022 and 0023**
   entirely, and `spec/README.md` dragged in unavoidably by `check-spec`'s `C8` whenever a spec
   version bumps. **Three files the mechanism cannot see**; the fix is the same one P4 made.
5. **[Q94](../questions/q94.md) was resolved by refusing the paste it proposed.** ADR 0003's table
   stays at two columns and now says why — it is the evidence *that* decision was made from, and
   rewriting it to four would make a 2026-08-30 decision appear to rest on 2026-08-31 evidence. The
   four-column table is in ADR 0025, and **its 36 cells were verified against `runCell` once,
   mechanically**, rather than transcribed and trusted.

**[W15](../work-items/w15-the-fourth-column-and-the-chain-nothing-runs.md) is **done**:
L0-L5 green in all five runtimes (**370** assertions, up from 326; `test/matrix/**` is 91 in four test
files), **both readers run and every finding acted on** — 4 defects and 5 blocking mutation families,
with **1 overlap**. It took **no decision and wrote no spec**, which was the fan-out gate. Its full
Record is in the item; **four things belong to this plan rather than to it**:

1. **[Q91](../questions/q91.md) is evidence W16 is entitled to and did not have.** `JP-R7`'s variant
   fires a join **zero branches reached** on `all-exit` — `need` decremented to 0 against an empty
   `arrived` — which is the exact cost [ADR 0003](../decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)
   records for `live-token` and the exact thing `JP-R8` removes. **The refinements are not merely
   asymmetric in size; they point in opposite directions**, and the counts *three* and *one* that
   this plan was declared from did not show it. ADR 0025 has to rule on that, and the plan's
   *"adopting `JP-R8` and refusing `JP-R7` is the outcome the measurements point at"* now has a
   second, independent reason — which is exactly why W16 *"is not entitled to inherit it"*.
2. **[Q94](../questions/q94.md) is W16's and is one paste.** ADR 0003 carries a hand-copied
   **two**-column matrix; `test/matrix/render.ts` now emits four. The divergence arrived because the
   artifact was extended, not because anyone edited the ADR.
3. ~~**Rule 7 (c) is still unexercised, for the third plan running.**~~ **Answered by W16**, which
   added `scripts/check-policies.mjs` for `JP-R9` with thirteen checked-in probes. W15 added no check
   script and said so in its `Out` list rather than leaving the retro to find it; W16 did not plan to
   add one either, and the invariant ADR 0025 created is what made it obvious. **The retro reports it
   exercised, and the sample is one.**
4. **P4's retro prediction 1 has its first answer and it is not the predicted one.** The prediction
   was that rule 8's *write to the rule* form would produce **fewer reader survivors in the
   provocation family**. W15's author set was **not** narrow in the old direction — it was complete on
   the rules and found the one code-level survivor ([Q95](../questions/q95.md)) — and both readers
   still found blocking gaps, because **every probe written to a rule mutates something the suite
   reads, and neither of the things W15 CREATED was read by the suite**. The renderer was a script
   the gate never executes; the variants were promoted to columns without inheriting a single
   clause-level test. **The amendment is right and it is not sufficient**, and the missing half has a
   name: the `Outputs` table asks a question about the *deliverable*, and the provocation set answers
   one about the *code*. One sample, and the retro should say so rather than amending again.

**Four things P4 left for this plan's retro** — all four answered in the retro at the end of this
file. Carried here as they were written, so the answers can be read against the questions:

1. **Does rule 8's "write to the rule" form change the numbers?** The prediction is fewer reader
   survivors in the provocation family. **If W15-W17's readers still find the author's set narrow in
   the same direction, the amendment did not work** — and P4's retro says the answer is then not
   another sentence. **Three items have now measured it and the third points the other way**: W15 and
   W16 found rule-written probes blind to what the item CREATED; W17 found what the item created blind
   to a CLAUSE OF THE RULE, and only the clause-by-clause walk saw it. The retro has both halves and
   should not amend from one.
2. **Does rule 7 (c) ever fire?** Unexercised by P4. **W15 adds no new check either**, so this is the
   third plan carrying it unless W16 or W17 adds one. **Answered by W16** — `check-policies.mjs`,
   thirteen checked-in probes, and the set-equality form discriminated on its first real use. **W17
   adds no check** and says so rather than leaving the retro to find it.

   **What W17 adds instead is a two-occurrence finding about rule 8's SET, and the reader's half
   supersedes the author's.** W17's own sweep had 2 vacuous probes of 14, one of them a syntax error
   reported as *caught*, and concluded that rule 8's set deserves rule 7 **(b)**. Its adequacy reader
   had 3 of 126 — and **its harness already enforced 7 (b) as written**, refusing any probe whose
   target text was absent and asserting the file changed. **All three passed that check**, because a
   probe can change the input without changing an observable, and all three read as **SURVIVED with
   the gate green** — the dangerous direction, since a vacuous probe and a real hole are then
   indistinguishable, and one of the three landed on `RN-R10`. So the requirement is not 7 (b): it is
   **a survivor is only a survivor once a second, independent route confirms the mutated clause was
   reachable.** Two occurrences, in two items, failing in opposite directions, and the proposal
   replaces rather than restates.
3. **Does the `Owns` list stay correct now the register is named?** Three items audited correct after
   three that were not. `check-owns.mjs` comes back if one miscounts. **W17's audit is correct**:
   four files, all inside `examples/**`, zero declared exceptions used, and **all five record-step
   files named and counted** — which is the half W16 got wrong. That is five correct audits against
   one stale count.
4. **Q86 and Q87** — ruled on above, before any work item started rather than in the retro, because
   the ruling changes what P5 is allowed to scope.

## The retro — pass 3

*Run 2026-09-01, after W15, W16 and W17 were all merged and the gate was green at `2fb7ba8`.
`doc/workflow.md` is **v0.7**: five changes adopted, two refusals, and two things confirmed unchanged
that were live questions coming in.*

**The plan's own question is answered and the answer held.** [Q24](../questions/q24.md) →
[ADR 0025](../decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md),
two rules, two different answers. The exit artifact is complete: the matrix at **four columns, 36
cells**, and ladder L6's `all-exit` row on real workers under every shipped policy — **342 assertions
across 19 runs**, with `joined: false` reached for the first time anywhere.

### The central finding: a v0.6 change that was right and INCOMPLETE

Every previous retro's sharpest finding was a rule that was *followed and failed*. P5's is a rule
that was followed, **worked**, and was not enough — and the evidence for the missing half only
appeared because the third item deliberately did both.

| | the author's provocation set was written to | what the readers found it blind to | blocking |
|---|---|---|---|
| **W15** | the rules, and it was complete on them | **both things the item CREATED** — a renderer the gate never executes, and two policies promoted to matrix columns with no clause-level test | 5 families |
| **W16** | the rules, and every probe written to one went red | **four of five aimed at what the item created survived** | 3 families |
| **W17** | **both halves**, after reading the two above | the rule-written half found what the deliverable-written half structurally could not; the deliverable-written half found three of the four real survivors | 2 |

**P4's prediction is false.** It predicted *fewer reader survivors in the provocation family*; the
readers found blocking gaps in all three items. But the two occurrences that would have condemned the
amendment (W15, W16) are answered by the third rather than confirmed by it: **W17's rule-written
probes found a hole no probe aimed at its new rows could have seen** — the third policy's
discriminating clause was exercised in one direction only, so *"stop counting `branch.arrived`"* left
all 316 assertions green. Both halves are load-bearing. **Rule 8 now asks for both**, and that is v0.7
change 1.

**Name the rung** (pass 3 rule 5): none. *"Did your probes cover what you built"* is not a command,
which is why it lives in the `Outputs` table and now in rule 8, exactly as section 4's own note says
of the five classes with no rung.

### The finding that supersedes a proposal made in this plan

W17 proposed that rule 8's set inherit rule 7 **(b)** — *a probe asserts it changed its input* —
because two of its fourteen probes were vacuous. **Its adequacy reader's harness already enforced
7 (b)**, refusing any probe whose target text was absent and asserting the file changed, and **all
three of that reader's vacuous probes passed it**: a probe can change the input without changing an
observable. The two counts and their directions are the finding:

| | vacuous | of | read as | direction |
|---|---|---|---|---|
| W17's own sweep | 2 | 14 | one **caught** (a syntax error) | a failure reported as a success |
| its adequacy reader | 3 | 126 | all three **SURVIVED, gate green** | a success reported as a failure |

**The exit code discriminates neither**, and the second direction is worse: a vacuous probe and a real
hole are indistinguishable in a report, and one of the reader's three landed on `RN-R10`, the rule
W17's rows are built on. So the requirement is **reachability, not difference** — *a survivor is only
a survivor once a second, independent route confirms the mutated clause was reachable*. v0.7 change 2,
and it **replaces** W17's proposal rather than adding to it (pass 3 rule 4).

### The record-step list was fixed by the same word twice, and P5 found the second half

P4's retro added `doc/open-questions.md` because every `Reserves:` line obliges a register write.
**Every `Reserves:` line names ADR ids too**, and `doc/decisions/` was in neither the list nor any
`Owns` block — so every item that ever reserved an ADR wrote an undeclared file. W16 measured it
across nine exceptions; **W17 is where it stopped being bookkeeping.** A sentence in
[ADR 0015](../decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md) that W17's own
deliverable falsified — *"`joined: false` … neither shipped policy ever does"*, and *"covered by a
stub policy"* — stood through the whole item, because correcting a file in nobody's `Owns` needs an
exception declared **before** the item starts and W17 could not have known.

**A gap that blocks a fix is worse than one that hides an edit.** v0.7 change 3, and **its first
exercise is this retro correcting ADR 0015 in place**, dated, under the rule it just adopted.

*`spec/README.md` is a third file of this shape and was deliberately NOT added*: `check-spec`'s `C8`
makes its version row a consequence of any `spec/**` bump, so it belongs to whichever item owns that
spec document. That is an `Owns` question, not a record-step one — W16's finding, and the distinction
is worth keeping sharp.

### `doc/` is refused a fifth time, and one sub-case is carved out because it OCCURRED TWICE

P1 named it, P2 said why the mechanisms are worse than the problem, P3 found the class had changed
shape, P4 refused again. P5 refuses the class again on P2's unchanged reasoning — **and then noticed
that one entry in P1's original list had happened a second time.** *"An index claiming reader-passes
were outstanding when they had run"* recurred in **three documents at once**, about W16's readers, for
two commits.

**What makes the second occurrence rule-worthy is that it reproduced.** The agent starting W17 read
those indexes, believed them, and wrote the claim forward into a fourth document — before opening
`doc/work-items/w16-*.md`, which had been correct the whole time. Error became divergence became
error, in one session. So the fix is not a check over `doc/` but a rule about **provenance**: *a claim
about another item's status is read from that item's own file, never from an index.* v0.7 change 4.

**Name the rung:** none, and that is the fourth plan to say so about `doc/`.

### The isolated-copy rule was FOLLOWED and cost a repository — and the rule was silent on the part that did it

Section 6 pass 3 rule 3's sharpest shape, and P5 is the plan that has the clearest instance of it.
v0.6 said *the adequacy reader works in an isolated copy*. W16's reader did exactly that, hit the
obstacle that follows — dependencies that do not resolve in the copy — and reached for a junction in
`node_modules` so `tsc` would ignore a sibling checkout's source. `git worktree remove --force`
**followed it out of the repository**.

**Nothing about the isolation was wrong.** The rule stopped at *"work in a copy"* and said nothing
about the obstacle or about the removal, which is the operation that did the damage.
[ADR 0029](../decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)
removed the dependency edge that made the junction look necessary — and **W17 measured that the edge
is gone rather than assuming it**: zero symlinks and zero reparse points in `node_modules`, the npm
package shipping `dist/` and `AGENTS.md` and no TypeScript source, `cp -r` inert, the worktree green
and typechecking with no link at all, scanned again before `--force` removed it. v0.7 change 5 is
three sentences: copy rather than link, verify green before the reader starts, and **scan for links
before forcing anything**.

**One occurrence with a stated generalisation** (pass 3 rule 2's second form): every recursive tool
that touches a worktree is one link away from another tree, whatever put the link there.

### What did NOT change, and both were open coming in

| | verdict |
|---|---|
| **`check-owns.mjs`** | **Stays retired.** Five consecutive items audited their `Owns` **set** correctly — W12, W13, W14, W15, W17 — and W16's failure was a **stale count of a correct set**, not P2's undeclared edit. W16's Record deliberately refused to settle whether that was rule 5's second occurrence; the retro's answer is **no**, and the cause was change 3's gap rather than discipline. A check counting files would not have caught a count written before the last file was edited |
| **Rule 7 (c)** | **Exercised and unchanged**, third plan of carrying it. W16 built `check-policies.mjs` for `JP-R9` with ten checked-in probes; **three of the ten failed at birth**, and the set-equality form discriminated — probe 4 tripped the *empty set*, which the weaker *"the named check is among those that failed"* also rejects but only by accident. **The sample is one.** The set has since grown to thirteen with a `MIN_PROBES` floor, after W16's adequacy reader found `caught === PROBES.length` vacuously true at zero — rule 7 (a) one level in |

### Two things this plan measured that are not rules

1. **The eighth overlap measurement is 3 of ~31 (W17), and no measurement has left the 1-4 band.**
   The question is settled and the band is the thing to carry; the fraction has now read 8% to 17%
   across items from a one-line fix to the largest surface change here.
2. **A count in prose should state the predicate that produces it — and P5 is the plan where that
   discipline finally paid twice in one item.** W17 hand-derived L6's assertion total to 316, 336,
   341 and 342 before each run and matched the first print every time, which is what makes *"expected
   values come from the spec"* checkable at the level of the suite rather than the row. The same
   discipline caught the register's cluster table being a **subset** of the register while reading as
   a partition of it — seven ids in no row.

### And one honest failure of this plan's own reporting

**W17 reported a red L0 as green for one round.** Its gate output was filtered through a `grep` whose
patterns did not match `deno lint`'s failure line, and lint was failing — on a variable left dead by
W17's own repair of a reader's blocking finding. Section 1 rule 4 is about checks reported as passed
when they were skipped; **this is the same defect through a filter**, and it is why W17's Record now
names the command that produced each figure and says the exit code was read directly. No rule
proposed: one occurrence, and the existing rule already covers it once stated plainly.
