# spec/ — the normative layer

**Everything in this directory is normative.** Code is written *against* it and tested *against*
it, so an error here propagates into the definition validator, the driver, the fold and the
fixtures at once.

Written by [W1](../doc/work-items/w1-the-normative-layer.md) under
[P1](../doc/plans/p1-what-satisfies-a-join.md), except the row marked W2.

**Three spec-conformity passes have run** (`doc/workflow.md` section 6 pass 2), each with a fresh
reader who read the spec before the author's account of it. Blocking findings: **4, then 5, then 1**.
The first produced
[ADR 0004](../doc/decisions/0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md).
The second found a fan-out region rule rejecting three of the valid examples — **the same defect the
first had found under a different id.** The third found the opposite failure and only once: a
document no rule could refuse. Per-document versions below; the third pass's own report is summarised
in [W1's record](../doc/work-items/w1-the-normative-layer.md).

| Document | What it fixes | |
|---|---|---|
| [flow-definition.md](flow-definition.md) | node kinds, edges, which outcomes route, how fan-out and join are paired, and **26 refusals**. Answers [Q10](../doc/open-questions.md), and since v0.7 says which region a node is in when it is in two. **v0.8 adds a FIFTH node kind, `map`** — [ADR 0036](../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md) answering [Q12](../doc/open-questions.md): fan-out is **two features over one region**, and `FD-V25` is the map's own rule while `FD-V9` and `FD-V19` are untouched. **v0.9 adds `FD-R2`** ([W33](../doc/work-items/w33-a-map-at-run-time-arity.md)): a `map` whose `over` does not name an ARRAY at run time stops the run with an `UnresolvedMapArity`. Section 2 left that question to W33 by name and reserved no id; the refusal shipped with no rule anywhere in `spec/`, and `FD-R1` is the precedent for a rule about what a RUN does living here. **v0.10** is [ADR 0037](../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md) ([W34](../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md)): section 3 states **what an ordinary edge carries**, which no document here had ever said, and section 2's *"what `over` is a key on is deliberately not settled here"* is settled. **It takes no rule id, deliberately** — this document has a prefix for a validation rule and one for a runtime refusal and none for a rule about what a run CARRIES ([Q164](../doc/open-questions.md)), and `check-spec`'s `RULE_ID` is a closed list, so an invented prefix would be invisible to `C2` and `C6`. The rules are `JP-R11` and `JP-R12`. **v0.11 answers [Q11](../doc/open-questions.md) IN GENERAL** ([ADR 0040](../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md), [W41](../doc/work-items/w41-what-a-node-can-reach-and-what-names-it.md)): section 3 gains **`needs`**, a declared mapping on a `task` or a `map` from payload keys to references, and with it `FD-V26`-`FD-V28` and `FD-R3`. **[Q164](../doc/open-questions.md) is RESOLVED and `FD-C` is the third prefix here** — `FD-V` is what a DOCUMENT may say, `FD-R` what a RUN refuses, `FD-C` what a run **CARRIES** — so this document now holds **26 refusals** — `FD-V1` … `FD-V28` less `FD-V14` and `FD-V15`, which are deliberately absent, and it is the number `check-spec` prints as *C4 covered 26 definition refusals*. *(This row read **28**, counting the two absent ids, where the pre-W41 figure of 23 correctly excluded them. W41's conformity reader.)* **v0.12 answers [Q8](../doc/open-questions.md)** ([ADR 0041](../doc/decisions/0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md), [W42](../doc/work-items/w42-what-a-decision-sees.md)): a decision sees its node's effective outcome and whatever its OWN EDGE declares — `FD-C3`, and an **edge** may carry `needs`, same grammar minus the `"."` form. **P12 prediction 3 said this would need no ADR and it REVERSED**: the entry node's payload is in no record, so a predicate cannot be handed what its NODE received | **v0.12** |
| [task-id.md](task-id.md) | how `(run, node, branch path, attempt)` becomes a scheduler task id, and why a collision is a refusal rather than an overwrite. Answers [Q13](../doc/open-questions.md). **v0.6 retires one of `ID-R4`'s two preconditions and adds `ID-R5`: an inbound id that does not parse was minted by no driver, so it is reported and dropped rather than stopping the run ([ADR 0027](../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md))**. **v0.8 corrects section 1's own heading and adds `ID-R6`**: inside a `map` region a branch index is a property of the **dispatch**, so the derivation refuses rather than guessing — **the grammar, `parseTaskId` and `buildTaskId`'s signature are all unchanged**, measured. **v0.10 re-dates section 2 from 0.5.1 to 0.5.2** ([W37](../doc/work-items/w37-the-scheduler-pin-moves-to-0-5-2.md)) - `core/FyflowScheduler.ts` is byte-identical across both bumps, so every cited line is unmoved | **v0.10** |
| [outcome-record.md](outcome-record.md) | the log: the eleven fields written when a task settles — what [ADR 0007](../doc/decisions/0007-the-driver-normalizes-events-into-an-immutable-outcome-record.md) rule 1's *"declared fields"* means — the **resolution record** that resumes a suspended node ([ADR 0004](../doc/decisions/0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md) rule 6), and the **effective outcome** that routing reads instead of the log. **v0.6 states what reaches `OR-R10`'s listener boundary, after ADR 0027 moved `InvalidTaskId` off it**. **v0.8 re-dates section 3's `OR-R3` walkthrough to 0.5.2** ([W37](../doc/work-items/w37-the-scheduler-pin-moves-to-0-5-2.md)), where `AGENTS.md` section 6 is byte-identical to 0.5.1 so the `user_action` pair is untouched | **v0.8** |
| [join-policy.md](join-policy.md) | the interface the join policies sit behind, and the region event vocabulary. **Not** which policy wins — that is W4 and ADR 0003, and which refinements ship is W16 and ADR 0025. **v0.10 is [ADR 0030](../doc/decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md) landing here: every policy is transitive over nested fan-out, and section 4's `unsatisfiable` exit now ENDS the branch it sits in**. **v0.11** corrects section 1's `branches` row, which claimed a branch's index in that array is its `branchPath` segment — true of a `fanout` and false of a `map` ([ADR 0036](../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)); whether a policy should be able to tell the two apart is [Q159](../doc/open-questions.md) and is **not** decided there. **v0.12** re-sources `arrival-count`'s `N` from `branch.opened` rather than `region.branches.length`, which is 1 for any map region whatever the run opens, and **answers [Q159](../doc/open-questions.md) NO** - what that policy wanted was the ARITY, not the kind, and the event stream already carries it ([W33](../doc/work-items/w33-a-map-at-run-time-arity.md)). Section 5 rules on **N = 0** and adds no mechanism. **v0.13** is [ADR 0037](../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md) ([W34](../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md)), answering [Q36](../doc/open-questions.md), [Q11](../doc/open-questions.md) narrowed to the fan-out edge and [Q154](../doc/open-questions.md): **`JP-R11`** fixes what each branch the opener opens receives — its own COPY, and for a `map` its own ITEM — and **`JP-R12`** replaces the `null` a satisfied join carried with the arrived branches' results **keyed by `branchPath`**, in a pinned key order. **`settleJoin` still takes no payload parameter**: the order-dependence the `null` refused is in *which one*, and carrying all of them keyed is not picking one. **Section 3 byte-unchanged again**. **v0.15 re-dates section 2's Q5 table to 0.5.2** ([W37](../doc/work-items/w37-the-scheduler-pin-moves-to-0-5-2.md)) | **v0.15** |
| [runtime-targets.md](runtime-targets.md) | the three runtimes the source must run in, what it may import, and what a gate must run in. Inherited from `fyflow-scheduler`, not chosen. **v0.7 answers [Q33](../doc/open-questions.md)**: L6 runs in Node and Deno. **v0.9 re-mirrors section 1 from 0.5.2** ([W37](../doc/work-items/w37-the-scheduler-pin-moves-to-0-5-2.md)), both published manifests re-fetched and re-checked rather than carried forward | **v0.9** |
| [run-state.md](run-state.md) | what a run holds, what a join is waiting on, and the **six** run-level outcomes - more than `done` and `failed`, because `awaiting_action` is the fifth and **`stuck` is the sixth** ([ADR 0015](../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md)). **Answers [Q14](../doc/open-questions.md)** (run state is a fold, of our own log), [Q25](../doc/open-questions.md), and at v0.3 [Q41](../doc/open-questions.md)-[Q43](../doc/open-questions.md). **v0.4 adds the `regionEntered` input** ([W33](../doc/work-items/w33-a-map-at-run-time-arity.md)): section 2's *"one entry per fan-out region ENTERED"* was unsupplied for a region that opens no branch, which only a `map` can produce - and without it such a run folded to `completed` having reached no `end` node. **v0.5** corrects one false sentence ([W34](../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md)): section 6 said a satisfied join *"carries `null`"* and cited [Q36](../doc/open-questions.md) as open, which [ADR 0037](../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md) answers. **No `FoldInput`, no `RN-R*` rule and no cell of run state moved** | **v0.5** |

**Run state was deliberately not W1's, and that is why it arrived last.** `doc/concept.md` section
4 names it here and `doc/workflow.md` section 7 rule 1 names the run-state shape as what separates
two parallel items — but whether run state is a fold **at all** is
[Q14](../doc/open-questions.md), and W2 is the item that tests it. A spec written first would have
made W2's gate vacuous. What W2 and W3 met at instead was the outcome log and the join-policy
interface, and both held.

The task id scheme is not a formatting convention. `AGENTS.md` section 5: **reusing a task id
overwrites**, silently — and the source says worse than that
([task-id.md](task-id.md) section 2). The scheme is the only thing standing between a fan-out and a
run that quietly loses a branch, so it is normative and it needs a refusal test.

## Checking it

```
node scripts/check-spec.mjs
```

Ladder **L0** for a document-only work item, redefined from *typecheck, lint, format* because there
is no code here to compile — the reasoning is in
[W1's declaration](../doc/work-items/w1-the-normative-layer.md). Eight checks: examples parse, rule
ids are declared exactly once, every invalid example names a real rule, every definition refusal has
at least one case, every intra-spec link resolves, every rule no example can express names the item
owing its test, the valid corpus resolves against `examples/registry.json`, and this README's
version column matches each document's own header.

**What C4 does and does not do, stated plainly because it has mattered twice.** C4 asserts a *case
exists* for every `FD-V*` rule, by filename. **It never opens the file.** So it cannot tell whether
the case violates the rule it names, and it cannot tell whether a rule rejects the *valid* corpus —
which is exactly the defect two conformity passes found, once in `FD-V13` and once in `FD-V19`. Rule
4 below is **partly** mechanized here and finished at ladder L4, which is W3's.

**Until L4 exists, that gap is covered by hand and the coverage is not in this repository.** W1's
record names the throwaway script it used to run every valid example against every rule and every
invalid example against the rule it names. A checked-in version would be a second validator with a
second opinion; the real one is W3's.

**C6 exists because rule 4's other half was claimed and not true.** That same pass found twelve of
sixteen non-`FD-V` rules sitting in bare tables with no test owner at all, including `OR-R1` — the
one rule this layer exists to make checkable. C6 fails if any such rule's row has no *Test owed by*
cell. **It accepts any non-empty cell, `—` included**, so it catches an omitted column and not a
lazy answer; whether the named test *exists* is still the named item's gate, and the script says so
on every run rather than leaving the gap silent.

**C8 exists because a reader found what a check should have.** The third pass found this README
stale against three of the five documents it indexes — and it is the first thing W2 and W3 read to
learn which version of the layer they are building against. `doc/workflow.md` section 4: *"If a human
finds a bug a machine check could have found, the fix is to **add the check**."*

**C7 is the one semantic check L0 can honestly make.** `FD-V4` and `FD-V5` are refusals *about a
registry*, so without one written down neither case can be evaluated and every other example's
`when` name is unchecked. `examples/registry.json` declares it; C7 asserts the valid corpus resolves
against it and that the two refusal cases name things it omits. It needs no graph logic, which is
why it is here and the rest is not.

## Rules

1. **A spec change is its own change**, with its rationale stated - never a side effect of another
   task. It gets reviewed on its own.
2. **If a spec seems wrong or unimplementable, stop and report the specific conflict** rather than
   patching it to make a test pass. Finding a genuine conflict is a valuable result, not an
   obstacle to route around.
3. **The spec is why work items can run in parallel.** The definition validator and the driver meet
   at the definition document and never at each other's code (`doc/workflow.md` section 7 rule 1).
   Weaken the spec and the parallelism goes with it.
4. **Every refusal is a coverage requirement.** A rule that says a definition MUST be rejected, or
   a join MUST NOT fire, needs a test that rejects it. Suites reliably cover what a document
   *shows* and miss what it *guards* - and this repo's guards are where its hard cases live.
5. **Examples live beside the spec** and are what the ladder's level 4 validates. They are
   hand-written or reviewed line by line at birth - never generated by the code under test
   (`doc/workflow.md` section 5 rule 4).
6. **A spec rule that depends on `fyflow-scheduler` behaviour cites it** - `AGENTS.md` section, or
   a file and line at **0.5.2**, the version we pin (Q3). The citations are what make a version bump
   a reviewable diff instead of an archaeology exercise - and reading the source rather than
   `AGENTS.md` is what has twice produced a sharper rule than the reference sentence would have
   ([task-id.md](task-id.md) section 2, [outcome-record.md](outcome-record.md) section 3).
