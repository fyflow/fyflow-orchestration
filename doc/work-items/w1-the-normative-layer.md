# W1 — The normative layer: flow definition, task ids, outcome record, join-policy interface

**Status:** done
**Plan:** [P1](../plans/p1-what-satisfies-a-join.md)

```
Spec:       none - this item defines it. Delivers spec/flow-definition.md,
            spec/task-id.md, spec/outcome-record.md, spec/join-policy.md,
            spec/runtime-targets.md
Owns:       spec/**, scripts/check-spec.mjs, .node-version
            (no other item may edit these)
Inputs:     ADR 0001 (routing in the driver), ADR 0002 (definition is data,
            predicates by name), ADR 0007 (outcome record at the listener
            boundary); P1's Scope section; fyflow-scheduler 0.3.0 read as source
            at ../fyflow-scheduler - AGENTS.md sections 5-6 and
            core/FyflowScheduler.ts, not a remembered line number
Outputs:    five normative documents; a hand-written example corpus under
            spec/examples/ split valid/invalid, where each invalid file names in
            its filename the rule it violates; one zero-dependency check script
Depends on: nothing
Blocks:     W2, W3, W4, W5 - all of them, on all five documents
Tests:      the invalid-example corpus IS this item's test data - one file per
            definition refusal, hand-written from the rule and never from a
            validator's output (doc/workflow.md section 5 rule 4). W2 supplies
            the runner; W1 supplies the expected verdicts. scripts/check-spec.mjs
            is what can fail today: it asserts every refusal rule has at least
            one example, every rule id is unique, every example parses, every
            intra-spec link resolves, and every rule no example can express names
            the item owing its test (C6, added after the conformity pass found
            twelve rules with no owner)
Gate:       L0 (see below - redefined for a document-only item), then the
            spec-conformity pass of doc/workflow.md section 6
Reserves:   Q22-Q26, ADR 0004-0005
            EXTENDED to Q22-Q30 after the spec-conformity pass - see Record
```

**ADR 0003 is not in this item's block.** P1 reserves 0003-0006 and 0003 is held for Q4's answer
(`doc/decisions/README.md`). W1 took 0004-0005 and expected to use neither. **It used 0004** — see
*Record*.

**The reservation was extended twice, and both extensions are declared rather than silent.** Q22-Q26 was
sized for the work as declared; the spec-conformity pass raised five more questions the work as
declared could not have predicted, because they come from a decision that did not exist when the
block was sized. W1 therefore took **Q22-Q30**, which is the rest of P1's block.
**P1's Q reserve was then exhausted**, and the three-runtime requirement — which arrived after that
— raised three more, so W1 also took **Q33-Q35**, past the block entirely. **W2-W5 reserve from
Q36 onward.** That is recorded in [P1](../plans/p1-what-satisfies-a-join.md) rather than left for
whoever declares W2 to discover.

**Two extensions on one work item is a signal, not just bookkeeping.** Both came from outside the
declared scope — one from a verification pass, one from a requirement the documents did not carry —
and neither could have been sized in advance. `doc/workflow.md` section 3 says to reserve
generously; the honest reading of this item is that **the size of a reserve predicts the work you
already know about, and says nothing about the work that arrives.**

## Scope

**In**

1. **`spec/flow-definition.md`** — four node kinds (`task`, `fanout`, `join`, `end`), edges that
   carry a predicate name **and the terminal states they are eligible for**, how a fan-out region is
   paired with its join, and twenty numbered validation refusals.
2. **`spec/task-id.md`** — the scheduler task id scheme, its charset, its total parse, and the
   duplicate-dispatch refusal. Settles [Q13](../questions/q13.md).
3. **`spec/outcome-record.md`** — the field list that makes [ADR 0007](../decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md)
   rule 1 checkable, given as `field <- source expression` so a reviewer can tell a compliant copy
   from a `{...e.detail}` spread by reading the field list alone.
4. **`spec/join-policy.md`** — the interface both policies sit behind, and the **six**-event region
   vocabulary they observe (three terminal, three not). **Not** which policy wins.
5. **Q10 answered** in `spec/flow-definition.md` — a mandatory default edge, enforced at
   instantiation, plus a runtime refusal asserting the enforcement held.
6. **The example corpus**, including the P1 case (`spec/examples/valid/p1-routed-away.flow.json`)
   as an authorable, valid flow.
7. **`spec/runtime-targets.md`** — Deno, Node >= 24 and the browser from one source tree; what the
   published source may import; the JSR/npm split. **Added after the item was declared**, at the
   maintainer's direction — see *What broke*.

**Out** — named rather than left implicit, with where it goes instead

- **The run-state shape.** `spec/README.md`'s table names three documents and one of them is *Run
  state*; W1 does not write it. What W2 and W3 must agree on is the *outcome log* and the *join
  policy state*, and both are here. Run state proper is what [Q14](../questions/q14.md) is about
  and **W2 is the item that tests it** — writing it here would put the answer in the spec before
  the item that checks it has run. `spec/README.md` is updated to say so.
- **A validator.** W1 states the refusals and supplies the cases; the code that rejects them is
  **W3's**, at ladder L4. W1 first wrote *"W2's (`src/fold/**` neighbours)"*, which the
  spec-conformity pass correctly read as nobody's — neither item's declared gate contained L4. ADR
  0002 rule 3 validates at instantiation and instantiation is a driver action, so it is W3's, and
  [P1](../plans/p1-what-satisfies-a-join.md)'s table now says so.
- **Payload flow between nodes** ([Q11](../questions/q11.md)) and **what a decision sees**
  ([Q8](../questions/q8.md)). The predicate signature is fixed as a single `DecisionContext`
  argument whose *contents* are Q8's subject; P1 populates one field. Adding accumulated state
  later is additive rather than a signature change.
- **Map-style fan-out** ([Q12](../questions/q12.md)), **nested fan-out**
  ([Q6](../questions/q6.md)) and **convergent branches** ([Q27](../questions/q27.md)). All three
  are refusals here (`FD-V15`, `FD-V19`) with the id scheme's branch-path segment left shaped to
  admit them without a format change.
- **Flow-level retry** ([Q16](../questions/q16.md)). The id carries an attempt segment from the
  first version so Q16 cannot force an id format change; P1 only ever emits `0`.
- **Resolving a `user_action` node.** [ADR 0004](../decisions/0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md)
  rule 5 is explicit that this library does not obtain a human decision. W1 fixes the *record* a
  resolution is ([spec/outcome-record.md](../../spec/outcome-record.md) section 5), because the log
  shape is what keeps run state a fold; the inbound API that accepts one is W3's.
- **Any TypeScript toolchain.** No `package.json`, no `deno.json`, no test runner, no `tsconfig`.
  W2 and W3 create those; `spec/runtime-targets.md` is the **constraint they must satisfy**, not the
  files. `scripts/check-spec.mjs` runs on stock Node with no dependencies precisely so W1 does not
  make that decision for them, and `RT-R7` exempts repo tooling from the portability rules so that
  choice stays free.
- **Actually running a gate in three runtimes.** W1 states where each rung must run
  (`RT-R1`, `doc/workflow.md` section 4); there is no code yet to run anywhere.

## Verification

### L0, and what it means when the item produces no code

**The rung as written does not apply.** `doc/workflow.md` section 4 defines L0 as *typecheck, lint,
format*; W1 ships markdown and JSON, and the repo has no compiler to run. Reporting "L0 not
applicable" would leave this item — the one everything waits on — gated by a human read alone,
which section 1 rule 1 says is not a gate.

**L0 is therefore the rung's purpose applied to a normative document: a mechanical check that the
artifact is well-formed and self-consistent.** `node scripts/check-spec.mjs` asserts:

| | Check | Catches |
|---|---|---|
| C1 | every `spec/**/*.json` parses | an example nobody could load |
| C2 | every rule id (`FD-V*`, `FD-R*`, `ID-R*`, `OR-R*`, `RS-R*`, `JP-R*`) is declared exactly once across `spec/` | a rule id reused, which would make a citation ambiguous forever |
| C3 | every file in `spec/examples/invalid/` names an existing rule id as its filename prefix | an example that violates nothing in particular |
| C4 | **every rule in a document's Refusals table is named by at least one invalid example** | `spec/README.md` rule 4 — a refusal with no case |
| C5 | every relative link inside `spec/` resolves | rot, before anything is built on it |
| C6 | every rule no example can express has a *Test owed by* cell | **added by pass 1** — `spec/README.md` claimed this and twelve of sixteen rules had no owner at all |
| C7 | the valid corpus resolves against `spec/examples/registry.json`, and the `FD-V4`/`FD-V5` cases name things it omits | **added by pass 2** — the two registry refusals could not be evaluated without a registry, and no example's predicate name was checked |
| C8 | `spec/README.md`'s version column matches each document's own `**Status:**` header | **added by pass 3**, which found README stale against three of five. `doc/workflow.md` section 4: if a human finds what a machine check could have, add the check |

**C4 is the one that earns the script.** It is the repo's own rule 4 — *every refusal is a coverage
requirement* — turned from a sentence into a check that fails. **It covers definition refusals
only.** The other **32 rules** — every `FD-R*`, `ID-R*`, `OR-R*`, `RS-R*`, `RT-R*` and `JP-R*` —
cannot be expressed as an example flow, so each names the item owing its test and C6 asserts it does.
The script prints that list on every run. **Said plainly: W1's L0 does not check that any of those
tests exist, and cannot.**

**Every check here has failed on this item's own output at least once**, which is the evidence they
can fail at all (`doc/workflow.md` section 5 rule 3): C2 on a rule id declared twice and one cited
but never declared, C6 on twelve rules with no owner, **C8 on four stale README rows the moment it
was written**. C6's and C7's negative cases were each re-run deliberately after their fixes.

**This widened `Owns:` by one file**, from `spec/**` to `spec/** + scripts/check-spec.mjs`, and that
is a declared extension rather than a silent one (`doc/workflow.md` section 7 rule 2). Nothing else
touches `scripts/`.

### Spec-conformity pass

`doc/workflow.md` section 6 pass 2, run with a fresh context, spec first. For a document-only item
the two questions read as: does each document say something a reader could implement wrongly in only
one way, and would the example corpus have noticed a rule stated backwards.

### The named routing cases

`doc/work-items/TEMPLATE.md` asks which of these the item covers.

| Case | | Covered by W1 |
|---|---|---|
| A branch routed away from its join ([Q4](../questions/q4.md)) | **yes, and it is the item's sharpest constraint** | `FD-V13`, the note under `FD-V14`, and `spec/examples/valid/p1-routed-away.flow.json`. The obvious rule *"every fan-out branch must reach its join"* would make P1's own case unauthorable, so it is **not** a rule — see the document |
| `user_action` ([Q17](../questions/q17.md)) | **detection only** | `OR-R3` — one record per settlement, keyed on `detail.state`. How it surfaces at flow level is W4's |
| No matching decision edge ([Q10](../questions/q10.md)) | **yes, answered** | `FD-V7` at instantiation, `FD-R1` as the runtime assertion |
| A duplicate task id ([Q13](../questions/q13.md)) | **yes, answered** | `spec/task-id.md`, `ID-R1`. The refusal test is W3's and is named there |
| Nested fan-out ([Q6](../questions/q6.md)) | **refused, deliberately** | `FD-V15`. The id scheme's branch-path segment admits it without a format change |

## Record

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L0, at v0.1 | **RAN** — pass, after two self-inflicted failures | `node scripts/check-spec.mjs` — 5 checks, 16 definition refusals each covered, 20 examples parsed. It first failed on a rule id declared twice and a rule cited but never declared |
| spec-conformity | **RAN** — **4 blocking, 9 defects, 8 notes** | A reader with a fresh context, spec first and this declaration **last**, so it formed findings before reading the author's account of them. Verdict: *"not ready for W2 and W3 to start"*. Every finding is acted on below |
| L0, at v0.2 | **RAN** — pass | 6 checks (C6 added by the pass), 25 examples, 42 rules, 20 definition refusals covered |
| spec-conformity, 2nd | **RAN** — **5 blocking, 9 defects, 10 notes** | Verdict: *"still not ready"*. **It found a refusal rule rejecting three valid examples — the v0.1 defect class under a new id**, and three claims of mine that were wrong. Every finding acted on |
| **corpus × rules, by hand** | **RAN** — pass | The check L0 cannot make and the one both passes needed. A throwaway script (**not checked in** — the real validator is W3's L4) computed `reaches`/`branchOf`/`region`/`after` and every `FD-V*` rule over the whole corpus: **6 valid examples produce zero violations; 22 invalid examples each trip the rule their filename names.** This is the first version of the corpus that is verified rather than asserted |
| L0, at v0.3 | **RAN** — pass | 7 checks (C7 added), 29 examples, 54 rules, 22 definition refusals covered, `FD-V14` correctly skipped. C6's and C7's negative cases each re-run deliberately |
| spec-conformity, 3rd | **RAN** — **1 blocking, 6 defects, 9 notes** | **It reproduced the corpus verification independently**, writing its own validator from the rule text, and matched. It then probed 14 shapes the corpus does not contain and fuzzed ~2.4M two-fanout documents against `ID-R1`'s unstated soundness assumption — zero violations. Verdict: *"W2 can start; W3 should not"* |
| **corpus × rules, re-run at v0.4** | **RAN** — pass | 6 valid → zero violations; 23 invalid → each trips its named rule, `FD-V15`'s now **alone** rather than via `FD-V9` |
| L0, at v0.4 | **RAN** — pass | 8 checks (C8 added), 30 examples, 55 rules, 23 definition refusals covered |
| re-run at `<sha>` | **NOT RUN** | nothing is committed. The v0.4 gate above **is** the re-run that acts on the review findings; it lacks only a commit to name |

**Three passes have run. Blocking findings: 4, then 5, then 1.** The first two each found a fan-out
region rule rejecting the valid corpus — `FD-V13`, then `FD-V19`, the same defect one version apart.
**The third did not**: it wrote its own validator from the rule text, reproduced the v0.3 corpus
result exactly, probed fourteen shapes the corpus does not contain, and fuzzed roughly 2.4 million
two-fanout documents looking for a counterexample to the property `ID-R1`'s soundness argument
assumes but no rule states — *every non-`end` node belongs to at most one region*. It found none.
**That is the first independent evidence this layer has had**, and it is what makes the region rules
believable rather than merely re-checked.

**What the third pass found instead was the opposite failure**: a document no rule could refuse.
`FD-V24` is that fix. **The remaining blocking item is closed and a fourth pass has not run.**

**What broke.**

Two things in the decomposition, found by trying to fill the header block. Four more in the
artifact, found by the conformity pass. **One more that neither could have found** — and the
difference between those three groups is itself the finding.

1. **L0 as written does not exist for this item**, and the gate P1's table states (*"L0, spec
   review"*) therefore reduced to a human read. Resolved by redefining the rung for a document
   artifact and paying one file of ownership for it.
2. **`spec/README.md` names a *Run state* document that W1 must not write.** P1's work-item table
   and `doc/workflow.md` section 7 rule 1 disagree about who owns it. Resolved in favour of the
   table, because Q14 is what W2 tests and a spec that answers it first makes W2's gate vacuous.
3. **The three-runtime requirement was in no document.** `fyflow-scheduler` runs on Deno, Node and
   the browser and publishes to JSR and npm; **nothing in `doc/` or `spec/` said we do too**, and
   W1 declared its scope, wrote four documents and passed a conformity pass without the gap being
   visible to any of them. It surfaced because the maintainer said so. Now
   `spec/runtime-targets.md`, and `doc/workflow.md` section 4 gained a runtime axis.
   **A conformity pass checks the artifact against the spec; it cannot check the spec against a
   requirement nobody wrote down.**
4. **`spec/` did not say whether a non-`done` outcome routes at all** — and two of its documents
   assumed opposite answers, both conformant. This became
   [ADR 0004](../decisions/0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md):
   routing is opt-in per terminal state and `user_action` **suspends**, resumed by a resolution
   record so run state stays a fold.
5. **`region(F)` and `FD-V13` were not computable as stated.** Neither said whether the join was a
   member, nor whether *reachable from* was reflexive — and under the reading a stock breadth-first
   search produces, `FD-V13` **rejected two of this item's own valid examples**. Now stated with
   both properties explicit, and with a note saying why they are stated at all.
6. **`branchPath` was undefined when two branch entries converge**, so two conformant drivers
   dispatch a shared node once or twice and the join sees a different arrival count. `FD-V19`
   refuses convergence; [Q27](../questions/q27.md) is whether to allow it.
7. **`live-token` could fire while a branch was still running**, because nothing fixed the order of
   `branch.opened`. `JP-R5` now makes the opening order a **driver** obligation — deliberately not a
   change to either policy, since *"seed the count from `branches.length`"* would have repaired
   live-token by making it more like arrival-count, which is a Q4-relevant change dressed as a bug
   fix.

**The third pass found a document `spec/` could not refuse — and my own corpus checker hid it.**
`{"id":"pick","kind":"decision",…}` passed all 23 refusals: `FD-V23` fires on an *absent* key and
`kind` was present, `FD-V21` fires on the wrong *type* and `"decision"` is a string, and `FD-V17`
compares a node's keys against the set **its kind declares** — which for an unknown kind does not
exist, so the rule is not evaluable rather than satisfied. `FD-V24` closes it.

**The part worth keeping is why the corpus check missed it.** The throwaway validator that proved
v0.3 mapped an unknown kind onto `FD-V21`, because I believed that is what `FD-V21` meant. The rules
and the checker shared one misreading and agreed perfectly — `doc/workflow.md` section 5's opening
diagram, with the spec standing in for the code. **A validator written by the spec's author is a
weaker instrument than it looks**, and the third pass's independent one, written from the rule text,
is what separated them. That is an argument for the reproduce-it-yourself instruction being part of
the pass rather than a one-off.

**The second pass found `FD-V19` rejecting three valid examples, including P1's own case.** I
defined `reaches(X)` as full forward reachability and cut only `region(F)` at the join — so every
fan-out whose branches both lead to the join had "overlapping reach". **This is the `FD-V13` finding
of the first pass, reintroduced under a new id, one version later, in a document that carries an
explicit block-quote warning about that exact class — written for `FD-V13` and not generalized.**
v0.3 introduces `branchOf(F, b)` as the cut set, states all three properties together, and adds
`FD-V22` for the hole `FD-V20` left (a region entered from outside, which also made `ID-R1`'s
soundness argument untrue).

**Three more of my claims were wrong, and I verified each before acting on it.**

- **`RT-R2`'s `*.node.ts` mechanism does not exist as described.** `esbuild.config.js:51-52` is real
  and says what I quoted, but it sits inside a `?worker`-query resolver — it is a worker-loading
  convention, and this repo loads no workers. The ordinary split is `exclude` in the tsconfigs.
  **Correct citation, false conclusion: the same failure mode the first pass caught, in the document
  I wrote partly to record that lesson.**
- **A `node:` import is not fatal to Deno.** Measured at Deno 2.9.6: `deno check` on
  `import { readFileSync } from "node:fs"` exits 0. `runtime-targets.md` v0.1 built its whole
  rationale on the opposite. The target that actually catches it is the **browser** build, and only
  for imports — a Node *global* fails nowhere at build time and throws in a browser at runtime.
- **`RT-R4` could not catch the half that matters.** *"No bare Node builtin"* enumerated nothing, and
  `process`/`Buffer`/`__dirname` are not import specifiers, so the prescribed grep missed them.

**Two claims in v0.1 were wrong, and both had already propagated.**

- **`spec/task-id.md` section 2 was wrong about the source.** It claimed `_settling` meant a
  duplicate id produced one record and a vanished execution. The success path never resolves by id —
  `_dispatchTask` closes over the task object (`core/FyflowScheduler.ts:723-727`) — so **two**
  records land under one key. Correct citations, wrong inference. It had been copied verbatim into
  [Q13](../questions/q13.md)'s resolution, which is corrected too.
- **`FD-V14` was stated in the form that does not hold.** *"A branch must be able to reach its
  join"* is true of `scoreB` in P1's own example, so that rule would forbid nothing. The rule that
  would have deleted the case is the **all-paths** form. The argument was right; the sentence was
  wrong in the version quoted in three other documents.

**What this taught.**

- **Three passes, three different failure shapes, in a falling curve.** Pass 1: a hole in the joint
  between two documents, both readings conformant. Pass 2: a refusal rule rejecting what it should
  admit — twice, counting v0.1. Pass 3: a document no rule could refuse, plus a claim about a
  toolchain that was measured and wrong. **Each pass found something the previous one's fix created
  or left**, and the count fell 4 → 5 → 1. The argument for a fourth is weaker than the argument for
  any of the first three was, and it is not zero.
- **A warning written for one rule does not protect the next rule of the same shape.** The first
  pass produced a block-quote in `flow-definition.md` about reflexive-and-uncut reachability
  rejecting the valid corpus. One version later `FD-V19` made that mistake anyway, because the
  warning named `FD-V13` and the new rule had a different id. **The fix that worked was not a better
  warning** — it was running the corpus against the rules mechanically, which is what v0.3 did and
  what neither earlier version had. A prose guard is a reminder for whoever reads that paragraph; it
  is not a check.
- **Every check in this repo reads the spec against itself, and the two defects that mattered most
  were the spec against the corpus.** C1-C7 never open a definition and evaluate a rule on it. That
  is honest and stated, and it is also where both blocking findings lived. The gap closes when W3's
  L4 exists; until then it is covered by hand and the coverage is deliberately not checked in, since
  a second validator would be a second opinion about the same rules.
- **The rule a work item writes to protect itself from a mistake is the rule it will make.** `JP-R7`
  forbids repairing `arrival-count` with one line, on the grounds that it would answer Q4 by
  accident — and this item's own `live-token` carried exactly such a refinement, unremarked, in the
  same document. `JP-R8` now pins it symmetrically. **This is the sharpest thing the pass produced**,
  and it generalizes: a guard written against a named failure does not transfer to the author's own
  blind side.
- **The validation rule that first suggests itself would have deleted the plan's own experiment.**
  *"Every path from a fan-out branch reaches its join"* reads as obviously correct and makes the
  branch-routed-away flow unauthorable. Recorded as the deliberately-absent `FD-V14`, because the
  useful artifact is the *argument for its absence* — and the pass then found that even the argument
  had been written in the wrong form.
- **The most valuable finding was a question nobody had asked.** Not an error in either document — a
  hole in the joint between them, invisible to anyone reading one document at a time. That is
  `doc/workflow.md` section 7 rule 1's failure mode, caught before either W2 or W3 wrote a line.
  **Cost: one afternoon. Cost if found in W4: the experiment.**
- **`doc/workflow.md` section 4's ladder assumes every work item ships code.** One occurrence, so
  not yet a rule change (section 6 pass 3 rule 2). If a second document-only item appears, L0 should
  be defined per artifact kind in the ladder itself rather than per item.
- **The thing no verification could catch was the requirement that was never written down.** L0
  checks the spec's self-consistency; the conformity pass checks the artifact against the spec; both
  ran clean on a `spec/` that did not know the library had to run on Deno. **Every check in this
  repo is downstream of `doc/`, so a gap in `doc/` is invisible to all of them.** That is an argument
  for `doc/concept.md` carrying the delivery constraints — runtimes, packaging, supported hosts —
  alongside the architectural ones, and it is one occurrence rather than a rule
  (`doc/workflow.md` section 6 pass 3 rule 2).
- **A verification pass produced an ADR.** `doc/workflow.md` section 6 describes pass 2 as checking
  conformity, and this one moved the architecture. Worth watching for a second occurrence before it
  becomes a claim about the method.

**Questions raised.** Q22-Q30 (P1's block, exhausted) and **Q33-Q35** (past it — see the note under
`Reserves:`). All in `doc/open-questions.md`.

| Q | | raised by |
|---|---|---|
| Q22 | Must a node result be structured-cloneable, and is that a constraint on workers or on the driver | the work |
| Q23 | May an edge leave a fan-out region for a node that is neither the join nor an `end` | the work |
| Q24 | Are the two one-line policy refinements a third and fourth policy rather than repairs | the work, **widened by the pass** |
| Q25 | Does the flow-level outcome vocabulary belong in the definition or in run state | the work |
| Q26 | Does the driver log non-settlement events at all, and in what shape | the pass, N17 |
| Q27 | May two branches of one fan-out converge on a shared node | the pass, B3 |
| Q28 | What may a resolution do — supply an outcome only, or re-dispatch and re-route | ADR 0004 |
| Q29 | Is a resolution's `actor` interpreted, and who is allowed to resolve | ADR 0004 |
| Q30 | May an edge opt in to `user_action`, bypassing suspension | ADR 0004 |
| Q33 | Must ladder L6 run in all three runtimes, and does P1's W5 do it | the runtime requirement |
| Q34 | How is a `runId` generated portably, given `crypto.randomUUID()` is secure-context-only | the runtime requirement |
| Q35 | Is the *published* Node floor 24, or is 24 only the development pin | the runtime requirement |

**Rules added after the third pass**: `FD-V24` (an unrecognised node `kind`), plus `version` folded
into `FD-V23`'s required set and a range clause into `FD-V21`. **`spec/examples/registry.json`,
`FD-V24`'s case and a rewritten `FD-V15` case** — the old one tripped `FD-V9` first, so nothing
exercised the form `FD-V15` will actually meet.

**Rules added after the second pass**, all inside existing families rather than new ids of their own
kind: `FD-V22` (a region entered from outside), `FD-V23` (a missing required key), `RT-R8` (a
per-runtime split file must be excluded in three places at once), `OR-R8` and `OR-R9` (the effective
outcome). `spec/examples/registry.json` was added because `FD-V4` and `FD-V5` are refusals *about a
registry* and there was none — so neither case could be evaluated and every other example's
predicate name was unchecked.

**ADR 0004 was used; 0005 is skipped.** Q10's and Q13's answers are spec rules with their rationale
stated in place, per `doc/decisions/README.md`. **ADR 0004 is different in kind**: it changes what
the driver *is* — it now accepts an inbound command — and no spec document could carry that without
restating it three times.

**Cross-repo.** ADR 0004 answers the *mechanism* half of [Q17](../questions/q17.md), which
`fyflow-react-components` carries as **their Q16** and still has open. `doc/README.md` calls
answering a shared question differently in two repos *"a bug with two homes"*, so this is now theirs
to reconcile with rather than a question both repos are still holding.
