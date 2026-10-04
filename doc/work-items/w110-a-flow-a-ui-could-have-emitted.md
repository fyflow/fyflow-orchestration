# W110 — A flow a UI could have emitted

**Status:** done — see the Record.
**Plan:** [P26](../plans/p26-what-a-flow-can-say-without-code.md)

```
Spec: NONE expected — an exit artifact writes no rule, so `spec/flow-definition.md` stays v0.28
      and `C4` stays at 42. If an `FD-V` turns out to be needed, W99's lesson applies first — an
      impossible fixture is a rule id in the wrong place — and the reason goes in the Record.
Owns: examples/l6.ts, examples/run-flow.ts, examples/flows/** (two new documents),
      examples/ui-registry.json (new), examples/registry.json, examples/README.md, AGENTS.md,
      README.md, doc/work-items/w110-a-flow-a-ui-could-have-emitted.md
Inputs: W108's grammar and W109's type, RE-TAKEN rather than inherited; P26 prediction 3, the
        plan's one REACH prediction, which nothing in this repository has ever tested.
Outputs: (1) a flow that runs on a real `FyflowScheduler` in BOTH L6 runtimes where the only
             code is the domain workers AND the language adapter the library itself ships — no
             predicate function, no reshaping worker, no gate type, no custom group type and no
             node-type class, and `RunOptions.predicates` EMPTY, asserted rather than merely
             unused. *(This row read "the ONLY code is the domain workers" until the record step.
             The declaration step measured why that is false — every `transform` names a `lang`,
             `Registry.languages` is EMPTY when absent, and nothing ships a built-in language — and
             the `Owns` block two paragraphs down was corrected in writing for the same class of
             reason while this row was not. W110's conformity reader, 15.)*
         (2) the two roads of a decision, in ONE flow: one `when` a declared predicate and one
             a registered name, so the name road is shown alive beside the data road
         (3) a reshaping step with no code whose output a downstream worker READS, so the
             transform is shown doing something rather than being present
         (4) P26 prediction 3 answered either way, and if it REVERSES the shape that could not
             be expressed is NAMED rather than worked around
         (5) what reverting each item costs at L6, per item, measured
Depends on: W108, W109 — SERIAL, this is the exit artifact
Blocks: nothing
Tests: ladder L6 in node and deno; L1-L5 UNMOVED is the declared result for the definition half
Gate: npm run gate (both L6 runtimes), check:docs, check:workers, npm run gate:full
Reserves: W110, Q456-Q458, no ADR expected
```

**The `Owns` block above was CORRECTED at the declaration step, in two places, and the reasons are
measurements rather than preferences.**

- It read **`README.md` (only if a section is paired)**, which is false for this item. **The package
  moves to `0.7.0` here** — W108's stop-and-ask (e), answered `0.7.0` at W110's close with the
  manifest unmoved at W108 and W109 on W84/W85/W86's precedent — and the version lives in **THREE**
  places that `X9` compares both ways: `package.json:3`, `deno.json:3` and **`README.md:21`**, whose
  sentence is *"Not published yet; no version has been released. The manifests read `0.6.0`."*
  Measured: `X9`'s regex is `/The manifests read \`([0-9]+\.[0-9]+\.[0-9]+)\`/` and it compares that
  capture to `package.json`, and the two manifests to each other. So `README.md` moves whether or
  not a section is paired.
- It did not name **`examples/run-flow.ts`**, and the artifact cannot be built without it: the shim
  hard-codes `registryDocumentFor(...)` inside `buildRuntime`, so a run from a DIFFERENT registry
  document needs a second builder there. `doc/workflow.md` section 7 rule 2's clause — *an item's
  `Owns` is written from its PLAN's index row, never from its title* — gives it, because
  [P26](../plans/p26-what-a-flow-can-say-without-code.md)'s row for this item says *on a real
  `FyflowScheduler` in BOTH L6 runtimes*, which is `examples/**`.

## Why

P26's exit artifact, and its one real test. The plan's predictions 1, 2 and 4 restate facts
measured at the declaration, so confirming them tests the reasoning; **prediction 3 is the only
one about something nobody has measured** — that a UI can emit a complete flow with no code but
the domain workers — and it can only be answered by trying.

## What to be careful of

1. **`RunOptions.predicates` empty is the claim, and it must be ASSERTED.** The seam exists for a
   row that wants a different predicate (W67), so an empty map that is merely never consulted
   proves nothing. The row asserts the registry is empty AND that the run routed both ways.
2. **A row that cannot tell the feature from its negation is not evidence.** W43 built an exit
   artifact in which every map instance scored zero and would have shipped it; the two decision
   roads in output (2) exist so that one flow carries both and a single wrong value cannot
   satisfy both.
3. **Prediction 3 reversing is a RESULT, not a failure.** P15's retro recorded that a reversal
   clause DIRECTS an item; this one's job is to try to find the shape that needs a function. If
   it finds one, naming it is worth more than routing around it.
4. **L6 MOVES, so every count copy moves with it.** `X10` holds the copies in
   `examples/README.md` against `examples/l6.ts`, both ways, and W96 built it because those
   counts went stale in six consecutive commits. Raise them in the commit that moves them.
5. **No new worker unless the artifact needs one**, and if it does, say so at the declaration
   step rather than at the record step — P21's grant was measured UNUSED and P22's was used.

## Declaration step — every input RE-TAKEN, and the two outputs it was given CONTRADICT

Measured on `5a6664c` (W109 committed and gated; the tree CLEAN, so the `Owns` audit will be
exact). **Spawn health first**: `node -e ""` through `spawnSync` is a **55.3 ms** median over
twelve (51.3 … 87.1), against the ~54 ms a healthy machine gives — so every figure below is about
the change and not about the machine ([Q179](../open-questions.md)'s own precondition).

**Baseline RE-TAKEN rather than transcribed, and it confirms to the number**: L1-L5 **56 files /
1512 assertions** on node 24.20.0; `check:spec` **7 documents / 72 examples / 132 rules** with `C4`
at **42**; `check:docs` **39 snippets — 33 run, 6 check**; `check:workers` **21 workers**;
`check:source` and `check:wiring` **EXIT 0**; **L6 2176 assertions over 154 real runs in BOTH
runtimes**. Both manifests read `0.6.0`.

### Output (1) and output (2) CONTRADICT, and the measurement that says so

Output (1) wants `RunOptions.predicates` EMPTY; output (2) wants one flow carrying a registered
NAME, and a name has to be supplied. **Measured through `createRuntime`, all four combinations:**

| the document's `predicates` | the code's `predicates` | |
|---|---|---|
| names NONE | supplies NONE | **BUILT** |
| names ONE | supplies NONE | `NameMissing`: *predicate "isLow" is named in the registry document and not supplied in `code.predicates` (none supplied)* |
| names NONE | supplies ONE | `RuntimeError`: *code supplies predicate "isLow", which the registry document names nowhere* |
| names ONE | supplies ONE | **BUILT** |

**So the two halves are compared BOTH WAYS and an empty registry is only reachable with a document
that declares none** — which means output (1) is not a property of the row's options, it is a
property of the DOCUMENT, and the two outputs cannot be satisfied by one flow.

**The resolution, in writing rather than silently**: **TWO documents differing in exactly ONE
edge's `when`**, run over the same payloads, with the PAIR as the evidence.

| | |
|---|---|
| `examples/flows/ui-emitted.flow.json` | the artifact. No `predicates` in its registry document, an EMPTY map in code, asserted empty — and every decision a declared comparison or group |
| `examples/flows/ui-emitted-named.flow.json` | byte-identical except that the FIRST decision's `when` is `{ "predicate": … }`, answering the same question, with a registry holding exactly ONE name — so this document carries BOTH roads, which is output (2) |

**What the pair CLAIMS is that the two route IDENTICALLY**, which is prediction 3's answer as a
measurement rather than as a sentence: the data road REPRODUCES the name road on payloads that
route both ways. And `doc/workflow.md` rule 8's fourth requirement on the set applies — *whatever
makes a discriminating PAIR differ is itself a claim* — so the two documents' one difference and
the two registries' one name are both asserted, and collapsing the pair is a failure rather than a
smaller suite.

### W108's grammar RE-TAKEN, and a comparison cannot name a SECOND PATH — one spelling of which is accepted SILENTLY

The first thing a UI-emitted flow wants that this tree had never asked for is *compare this value
to that one*. Measured, all four spellings, one at a time:

| `value` | `op` | |
|---|---|---|
| `{ "path": "needs.cfg.threshold" }` | `lt` | **`FD-V44`** — *when value is object; a comparison compares against a SCALAR — null, a boolean, a finite number or a string* |
| `[ "needs.cfg.threshold" ]` | `lt` | **`FD-V44`** — *when value is an array; …* |
| `"needs.cfg.threshold"` | `lt` | **`FD-V44`** — *when op "lt" compares against "needs.cfg.threshold", which is not a number* — refused for its KIND, not for being a path |
| `"needs.cfg.threshold"` | `eq` | **ACCEPTED**, and compared against the LITERAL STRING |

**The fourth row is the finding.** `PredicateLeaf.value` is a `PredicateScalar` and a string is one,
so an author who writes a path where a literal belongs gets a comparison that is false for ever and
**nothing says so** — measured at the evaluator too, where `eq` against `"needs.cfg.threshold"` is
`true` on a result whose score IS that string. ADR 0074 consequence 6 says *the grammar catches a
wrong ROOT and nothing catches a wrong LEAF*; this is one step past it, because the wrong thing is
in the `value` and the `path` is immaculate. [Q456](../open-questions.md).

**So a decision between two of the run's OWN values is not a comparison**, and neither is one that
needs arithmetic: the subset reads ONE path and compares it to ONE literal. That is the shape
prediction 3 turns on.

**And the PATHS the grammar admits were re-taken with it**, because the way around the gap depends
on one of them:

| path | |
|---|---|
| `outcome.result` | **ACCEPTED** — two segments, so not a root alone. *This is what makes the route around the gap possible* |
| `outcome.result.flag`, `needs.cfg.t`, `outcome.taskId` | ACCEPTED |
| `outcome`, `needs` | `FD-V43` — *a root alone and names no value* |
| `result.flag` | `FD-V43` — *starts at "result", which a decision cannot see* |

**And the shapes ADR 0074 consequence 5 says the corpus exercises at ZERO all evaluate**, measured
against the shipped `evaluateWhen` with an empty registry: `all` both-true and one-false, `any`
one-true and none-true, **`all` across BOTH roots**, `length` on an array, `length` on an absent
path with `default: []`, `startsWith` on `outcome.taskId`, and `eq true` / `eq false` on
`outcome.result` ITSELF. Ten shapes, ten expected answers, no disagreement.

### W109's type RE-TAKEN, and TWO things it says are not true of the tree it ships

**(a) Every `transform` costs a LANGUAGE, and nothing ships one.** `src/` declares no built-in
language set; `Registry.languages` is EMPTY when absent; and a `Transform` node against a registry
declaring none is **`FD-V35`** — *transform.lang "jsonata" is not a registered language (the
registry declares no languages)*. So the reshaping step output (3) asks for cannot exist without an
adapter supplied in `code.languages`. **This is the one narrowing prediction 3 needs and the plan's
own `Out` section half-names it** (*language adapters … stay code*) without saying that it therefore
bounds prediction 3's *zero code but domain workers*. The adapter is the LIBRARY's, reached as
`fyflow-orchestration/jsonata` — one import and one object entry, no logic — which is why the
honest verdict is a NARROWING and not a reversal, and why it is stop-and-ask (a) rather than a
decision I take alone.

**(b) ADR 0075 rule 3's *named pool INSTANCE* road is REFUSED by the runtime and ACCEPTED by the
driver — the two roads disagree about ONE document.** That rule says *a consumer who wants any of
those declares a named pool INSTANCE of it*. Measured, one road at a time, on a document whose
`pools` declares `{ "reshape-big": { "type": "Transform" } }`:

| road | what runs | |
|---|---|---|
| `new Driver(flow, registry)` | `checkRegistry`, whose `types` is **`nodeTypesOf(reg.nodeTypes)`** — MERGED | **ACCEPTED** |
| `createRuntime(document, code)` | `resolveRegistry`, whose `nodeTypes` map holds the document's types and `code`'s classes and **not the built-ins** | **`PoolTypeMissing`** — *pool "reshape-big" names type "Transform", which is not a node type (the registry declares "SplitWorker")* |

**The refusal's own message is false against `nodeTypesOf`**, which returns `SplitWorker, Transform`
for the same input. This is W109's finding 2's class one rule along and in the OPPOSITE direction —
there the validator road was too LENIENT about a collision, here the runtime road is too STRICT
about an instance — and it sits exactly on the layer boundary that item's finding 3 had just
rebalanced: `resolveRegistry` deliberately does not STORE the built-ins (so `checkRegistry` can tell
a consumer's collision from the library's own entry), while `bootstrap` reads through `nodeTypesOf`
and therefore BUILDS their pools. Measured: `resolveRegistry`'s `pools` and `nodeTypes` are both
`{SplitWorker}` where `createRuntime`'s `scheduler.workerPools` is
`SplitWorker, ScoreWorker, WeighWorker, PublishWorker, Transform`. **So the fix is not one line** —
a named instance would have to be derived where the built-ins are not stored — which is why
stop-and-ask (b) prices correcting the ADR against changing the code, and why this item recommends
the ADR. **The artifact does not need the road**; it uses the built-in's DEFAULT instance.

### What the artifact IS, and it was probed end to end before a line was written into the repo

One flow, four payloads, on a real `FyflowScheduler` through `createRuntime` with **zero predicates
registered**. Every expected value DERIVED from the workers' own source first, then run.

```
intake    SplitWorker   -> { confidence, items: [ {word, confidence}, … ] }     SEQUENCE
  -> each
each      map over "items", branch "rate"                                      FAN-OUT, run-time arity
rate      ScoreWorker   -> { confidence, score: round(confidence * 100) }       (its own item, JP-R11)
  -> gather
gather    join of "each" -> { "0": {…}, "1": {…} }                             JOIN, JP-R12
  -> rollup
rollup    Transform     needs { joined: ".", cfg: "intake" }                    SELECTION + TIER-3 COMPUTATION
          transform reduces the record AND computes the two-path comparison
          edges: all[ weak eq true, n gte 2 ] -> remediate                      DECISION, a GROUP
                 any[ n eq 1, weak eq false ] -> publish
                 (default)                    -> stalled                        a tripwire, never reached
remediate WeighWorker   transform reshapes rollup's output into { item, run }   TIER-2 COMPUTATION
          edges: score lt 20 -> escalated ; -> done
publish   PublishWorker -> { published, joinPayload: rollup's output }
```

**The three tiers of ADR 0075 rule 1 are all in one flow, and the tier-three node is REQUIRED
rather than chosen.** A `transform` transforms its node's INPUT and a decision reads its node's
OUTPUT, so a computation feeding a DECISION cannot be a tier-two transform on the consuming node —
which is what ADR 0075's own tier table means by *reshape for … a decision*. Moving `rollup`'s
transform onto `publish` would leave the decision unable to see `total` at all.

| | payload | rollup's result | road |
|---|---|---|---|
| **A** | `{confidence: 0.9, text: "alpha beta"}` | `{n:2, total:90, mean:45, weak:true}` | `remediate` → `done` |
| **B** | `{confidence: 0.2, text: "alpha beta"}` | `{n:2, total:90, mean:45, weak:false}` | `publish` |
| **C** | `{confidence: 0.9, text: "alpha"}` | `{n:1, total:50, mean:50, weak:true}` | `publish` |
| **D** | `{confidence: 0.9, text: "a b"}` | `{n:2, total:20, mean:10, weak:true}` | `remediate` → `escalated` |

**All four AGREE with the paper derivation, exactly**, and each member of each group is
load-bearing on a payload no other covers: `weak` decides A against B, **`n gte 2` decides C** —
where the first member alone would have sent it to `remediate` — and `any`'s two members decide C
and B respectively. **A and B differ in ONE payload field** and the decision between them depends
on BOTH the join's mean and the run's own confidence, which is the two-path comparison the subset
cannot say, computed in data.

**Output (3) is DEMONSTRATED rather than present.** On the `remediate` road `WeighWorker` returned
`{"keys":["item","run"],"extraKeys":[],"word":"mean","confidence":0.45,"score":45}` — `keys` is the
transform's own output shape read back by the worker, `confidence` is `mean / 100` and `score` is
computed FROM it, so **a wrong transform gives a wrong score and a different key set** rather than
an absent one. On the `publish` road `PublishWorker`'s `joinPayload` echoes `rollup`'s output whole,
which is a second observer of the same value on the other road.

**`stalled` is never reached** on any of the four, and the run's `pathEnded` is `end at done` or
`end at escalated`. It is a TRIPWIRE and is described as one rather than as a control: it fires when
a group is wrong, and the claim it would make non-vacuous is its own.

### The registry a UI emits, and why it has to be a SECOND document

The shared `examples/registry.json` cannot be the artifact's, for two measured reasons: it declares
**three predicate names** (so an empty code map is `NameMissing`, the table above) and it declares a
**custom group TYPE** — `GroupTypeMissing: group "budget" names type "DailyBudgetGroup", which is
neither a built-in … nor registered in code` — which is code by P18 decision 7. So
`examples/ui-registry.json` declares the four workers and four types this flow names, `languages`,
and **nothing else**: no predicates, no groups, no group types, no classes, no named pools.

**Its worker and type entries are COPIES of the shared document's, and the duplication is BOUND
rather than left to drift** — `check:workers` reads `examples/registry.json` alone
(`CHECK_WORKERS_REGISTRY` defaults to it), so an unbound second copy would be a list of schemas
nothing runs. `examples/l6.ts` compares the two documents' entries for the UI registry's own key set,
both ways, each read from its own bytes — obligation (e)'s third shape, *a list is a claim about
another list*.

### The two L6 clauses a `Transform` node turns RED — predicted, with the mechanism read off the code

**No L6 flow has ever named a built-in node type, and W109's own comment says this item is where one
will**: *"No L6 flow names one: a `Transform` node on real workers is W110's."* Two cross-row clauses
are written over lists that cannot contain it, and both are PREDICTIONS here rather than
measurements — the measurement is the build's, and it is recorded in the Record either way:

| clause | why it should go red |
|---|---|
| `examples/l6.ts` ~9106 — *every type the flows L6 runs name is a registry type, and every registry type is named by one of them* | `documentTypes` is read off every task node of every row, so it gains `Transform`; the expected side is `[...WORKER_LISTS.types, ...WORKER_LISTS.classTypes]`, read from `registry.json`'s bytes and `run-flow.ts`'s source, and `Transform` is in neither |
| `examples/l6.ts` ~9217 — *the node TYPES the L6 flows name are the types the registry holds, both ways* | `namedTypes` gains `Transform`; `registryTypes` is the registry the DRIVER was handed, which does not carry the built-ins (ADR 0075 rule 5) |

`BUILT_IN_NODE_TYPES_L6` already exists for the third clause (the POOLS one, which W109 had to move
because `bootstrap` builds a pool for every type `nodeTypesOf` returns) but it is declared INSIDE
the (2b) block, so the first clause cannot see it. **The compensating observer W109 built for that
literal was checked rather than cited** ([Q453](../open-questions.md)'s warning):
`test/definition/node-type.test.ts:221` holds `equal(Object.keys(BUILT_IN_NODE_TYPES), ['Transform'])`,
so a second built-in added without these clauses moving is red there. It exists.

### What BREAKS at `0.7.0`, derived from the code rather than from either ADR's prose

| | what a 0.6.0-era consumer had | on this tree |
|---|---|---|
| **1** | an edge `{ "when": "isLowConfidence", … }` — the only spelling there was | **`FD-V42` at `a#edge0`**: *when is string; it is an object — a registered name { predicate }, a comparison { path, op, value, default, length }, or a flat group { all } or { any }. A bare string was the form until v0.27* — and the 0.7.0 spelling gives **0 findings** on the same tree. **Every document with a decision breaks**; this repository's own migration was 102 sites in 38 files, 21 of them flow documents |
| **2** | a `nodeTypes` entry, or a `code.nodeTypes` class, named `Transform` | **`NameCollision` on ALL THREE roads**, each naming it: the document's (*declared in the document's nodeTypes and is a BUILT-IN node type*), `code`'s (*declared in code and is a …*), and the hand-built `Driver`'s through `checkRegistry` (*registered in nodeTypes and is a …*) |
| **not a break** | a flow naming no predicate and no `Transform` | **0 findings** |
| **a WIDENING, not a break** | a registry declaring no `nodeTypes` | `nodeTypesOf(undefined)` is now **`Transform`**, so a `Transform` node against such a registry is **0 findings** where it used to be `FD-V32`. It accepts MORE, so no document breaks — what breaks is code or a test asserting *absent means no types*, which ADR 0075 consequence 4 already records |

**So: TWO breaks for a consumer's DOCUMENT and one changed reading for their CODE.**

### *`README.md` names every break* is FALSE on this tree, and it is said in SEVENTEEN places

[ADR 0073](../decisions/0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md) gave the
three root documents one audience each and deleted README's three break blockquotes — 0.6.0 BREAKING
IN FOUR WAYS, 0.5.0 SIX WAYS, 0.4.0 TWO WAYS — because README is for a PERSON who will USE the
library and carries no correction archaeology. Measured: **`README.md` contains the word *break*
ZERO times.** The claim that it names them is still standing in:

| | | |
|---|---|---|
| `CLAUDE.md` 21, 51, 61, 113 | *BREAKING IN SIX WAYS (`README.md` names each)*; *…every one named in `README.md`* ×2; *`README.md` names the breaking change* | **CORRECTED** |
| `doc/README.md` 33, 43, 99 | the same three sentences | **CORRECTED** |
| **`doc/decisions/0074-*.md` 136** | **live, and about THIS item**: *the manifest moves once with `README.md` naming every break* | **CORRECTED** |
| `doc/plans/p18-*.md` 623, `doc/plans/p22-*.md` 187 **and 262** | a plan's own record of what IT did | left — historical in subject |
| `doc/work-items/w90-*.md` 38, `doc/work-items/w94-*.md` 44 **and 269**, **`w86-*.md` 52 and 95**, **`w67-*.md` 387** | an `Outputs` row or a decision list, true of the tree that item shipped | left — historical in subject |
| | | **9 left, 8 corrected** |

**The count went NINE, then TWELVE, and it is SEVENTEEN — and the sharper half is not the count.**
This section said *Re-derived with the union of three patterns over `CLAUDE.md`, `AGENTS.md`,
`README.md`, `doc/README.md`, `doc/workflow.md` and every file under `doc/plans`, `doc/decisions` and
`doc/work-items`* and closed *A count taken with one spelling of a phrase is a count of that
spelling.* **That sweep was never run.** The twelve was assembled by hand from three earlier searches
with three different patterns, and the sentence describing it as one union was written afterwards.
*The claim about the METHOD was stronger than the method, in the paragraph whose own closing sentence
is about exactly that* — `doc/workflow.md` section 1 rule 5's writing clause, which is the clause
this whole section is an instance of. W110's conformity reader, 4.

**Run for real, the five it missed are:** `w86:52` and `w86:95` (*naming BOTH halves of the break*),
`w94:269` (*names FOUR breaks*), and `p22:262` and `w67:387`, which **WRAP ACROSS LINES** — and a
line-by-line regex cannot see a wrapped phrase whatever its spelling. Three of the five are on one
line and match the stated pattern; two are a different defect in the sweep. The honest derivation is
the union of three patterns over that file set with **newlines collapsed** (`re.S`), read from
`git show HEAD:`, which gives **17**.

**EIGHT are corrected and NINE are left, and the line between them is the SUBJECT rather than the
tense.** The seven index sentences and the ADR's cell are claims about what `README.md` holds NOW; the
nine left are records of what P18, P22 (twice), W67, W86 (twice), W90 and W94 (twice) DELIVERED, and
README did name those breaks on the trees those items shipped. A finished item's file and a closed
plan's Record are also outside what an item may edit — `doc/workflow.md` section 6 pass 3 rule 6
gives that to a RETRO — so they are named here for P26's retro rather than rewritten. **The
classification survived the correction**, which the reader checked independently: every one of the
five it added is historical in subject too.

*(The prompt that set this item named **four** `CLAUDE.md` claims at lines 21, 51, 61 and **103**.
Line 103 states its two breaks in `CLAUDE.md` itself and makes no claim about README; the fourth is
at **113**.)* This is `doc/workflow.md` section 1 rule 5's third direction — *a WITHDRAWN claim is
SEARCHED FOR* — with ADR 0073 as the withdrawal and nobody having searched. Where P26's breaks get
named is **stop-and-ask (a)**.

### The FOUR stop-and-asks, with the measurement beside each — ANSWERED 2026-10-02, and (b) went AGAINST the recommendation

Written here rather than left in the conversation, because W108 shipped five files citing *W108's
stop-and-ask (b)* against a list that existed nowhere, two of them SOURCE files — and W109 recorded
that as the reason to write them down.

| | the question, priced | recommendation | **the answer** |
|---|---|---|---|
| **(a)** | **Where do P26's breaks get NAMED?** README contains *break* zero times since ADR 0073, SEVENTEEN sentences say it names them (nine at the time this was asked), and one of them is ADR 0074 consequence 2 instructing this item. Three roads: (i) reinstate a break list in `README.md`, which reverses ADR 0073's audience decision for the document that just lost its archaeology; (ii) name them in `AGENTS.md`, the agent reference, which already carries the grammar (§4) and the type (§13) and has no README twin for either, so `X8` is untouched; (iii) name them in the ADRs and this item's Record only, and correct the nine sentences. **Nothing is published** — `README.md:21` says so in the same sentence as the version — so a break has no consumer today | **(iii) plus correcting every live one**, because ADR 0073 gave README one audience deliberately and three plans' worth of break lists were deleted on that argument four items ago. **(ii) as well if the maintainer wants a consumer-visible home**, which is cheap: one `AGENTS.md` subsection | **(iii), AS RECOMMENDED** — and (ii) taken as well: `AGENTS.md` section 21 is where a consumer meets the new shape. The EIGHT live sentences are corrected; the NINE historical ones are named for the retro |
| **(b)** | **Does the RUNTIME road accept a named pool INSTANCE of a built-in node type?** ADR 0075 rule 3 blesses it by name; measured, `checkRegistry` accepts and `resolveRegistry` refuses `PoolTypeMissing`, with a message that contradicts `nodeTypesOf`. Roads: (i) change `resolveRegistry` so a named instance resolves against the merged map — NOT one line, because the built-ins are deliberately not stored there and a derived pool would then exist in two layers, which is the boundary W109's finding 3 settled at a cost of 80 tests; (ii) correct ADR 0075 rule 3 to say the road is the hand-built `Driver`'s alone and raise a question; (iii) leave both and raise a question | **(ii)**. The artifact uses the DEFAULT instance and does not need the road, and an exit artifact rewriting `src/` at the layer boundary the previous item just rebalanced is the wrong trade. The question carries the measurement so the next plan can take it | **(i) — AGAINST the recommendation.** The code is fixed: `resolveRegistry`’s named-pool loop resolves its `type` against a MERGED map, the built-ins are STORED nowhere still, and the two roads agree. Measured at **ZERO** cost at L1-L5 (it is a widening), so it is bound by a case on BOTH roads rather than by the suite’s count — and **L1-L5 therefore MOVES, 1512 → 1513**, which this item’s `Tests:` line did not predict |
| **(c)** | **A second registry document, or the shared one with its `predicates` omitted in code?** Output (1) forces one of the two (the four-combination table). (i) `examples/ui-registry.json` on disk: the artifact is two documents a human can read whole, and it is what a UI hands you; costs four duplicated worker entries, bound both ways against the shared document because `check:workers` reads only the shared one. (ii) derive it in `run-flow.ts` by omitting `predicates` and the custom group type: no new file and no duplication, but the artifact's registry is then TypeScript — the one thing this item exists to show is unnecessary | **(i)**, on that last ground | **(i), AS RECOMMENDED** — `examples/ui-registry.json`, bound both ways against the shared document in `examples/l6.ts` |
| **(d)** | **Does the artifact get an `AGENTS.md` section?** §4 teaches the declared `when` and §13 teaches `Transform`; **nothing shows the two composed into a whole flow**, which is the only thing P26 claims. Costs one section and `RUN_FLOOR` +1 if it is `run`-tagged; `X8` is untouched unless a README twin is added, which (a) (iii) says it should not be | **YES**, and it is where (a) (ii) would land if the maintainer takes it | **YES, AS RECOMMENDED** — section 21, `RUN_FLOOR` 33 → 34, and `X8` untouched because it adds no README twin |

### Declared exceptions, at the declaration

Seeded from **W109's LATE list** rather than from a file set — the procedure that took W109 to eleven
declared against eleven late where W108 was five against twenty-four.

- **`doc/plans/p26-what-a-flow-can-say-without-code.md`** — prediction 3's verdict and the plan's
  Record. A plan is on nobody's `Owns` once declared.
- **`doc/decisions/0075-*.md`** — rule 3's named-instance sentence, per stop-and-ask (b). The record
  step covers `doc/decisions/**`, so this is declared for visibility rather than from need.
- **`doc/decisions/0074-*.md`** — consequence 2's *`README.md` naming every break*, per (a).
- **`scripts/check-docs.mjs`** — `RUN_FLOOR`, only if (d) adds a `run` snippet; and `X8`'s pairing
  list only if a README twin is added, which (a) says it should not be.
- **`test/definition/l4-corpus.test.ts`** — the suite census, BOTH HALVES (a `SUITES` row and a
  per-suite CASE COUNT), only if a definition-side suite is added. **L1-L5 UNMOVED is the declared
  result**, so if `npm test` moves at all that is a FINDING and belongs in the Record.
- **`examples/deno-import-map.json`** — only if a new import is needed for the deno rung.
- `package.json` and `deno.json` are the VERSION and are named in `Owns`-adjacent form above;
  they are the record step's in neither list, so they are declared here: **two manifests, one
  version, `X9` comparing both to `README.md`.**

**PREDICTED NOT NEEDED, and recorded so the prediction can be wrong**: `spec/**` (an exit artifact
writes no rule, so `C4` stays at 42 and `spec/README.md`'s row does not move), `src/**` (nothing
here changes the library), `scripts/check-workers.mjs` (its subject is the shared registry and that
document's workers do not move), and `examples/workers/**` (**no new worker** — careful-point 5, and
the artifact is composed from `split`, `score`, `weigh` and `publish`, which exist).

## Record

**Status: DONE.** P26's exit artifact exists: `examples/flows/ui-emitted.flow.json` and
`examples/ui-registry.json` run on a real `FyflowScheduler` in **both** L6 runtimes, and the only
code either one names is four domain workers and **the language adapter the library itself ships**.

### Gate — every rung RUN, its exit code read on its own line, never piped

| Clause | Verdict | Notes |
|---|---|---|
| `npm test` (L1-L5, node) | **RAN, EXIT 0** | **56 files / 1516 assertions**, node 24.20.0, from 56 / 1512. **L1-L5 MOVED and this item's `Tests:` line declared it UNMOVED** — see finding 1 |
| `npm run test:deno` | **RAN, EXIT 0** | **56 / 1516**, deno 2.9.6 |
| `npm run test:browser` | **RAN, EXIT 0** | **56 / 1516**, chromium — **and it was RED at the first confirming gate**, see finding 10 |
| `npm run test:l6` | **RAN, EXIT 0** | **2435 assertions over 161 real runs** on `fyflow-scheduler` 0.5.2, node 24.20.0, from 2176 / 154 |
| `npm run test:l6:deno` | **RAN, EXIT 0** | **2435 / 161**, deno 2.9.6 — the same numbers, which is what *both runtimes* means |
| `npm run check:spec` | **RAN, EXIT 0** | **7 / 72 / 132 UNMOVED**, `C4` at **42 UNMOVED** — which is what `Spec: NONE` asserts, and it held |
| `npm run check:docs` | **RAN, EXIT 0** | **40 snippets — 34 run, 6 check**, from 39 / 33 / 6; `RUN_FLOOR` 33 -> 34; `X8` pairs **3**, untouched |
| `npm run check:workers` | **RAN, EXIT 0** | **21 workers UNMOVED** — no new worker, careful-point 5 held |
| `npm run check:markdown` | **RAN, EXIT 0** | `M3`, `M4` and `M5` all ok after three register rows landed |
| `npm run gate` | **RAN, EXIT 0, ZERO lines beginning `FAIL`** | 15 entries, against digest **`fe16b24bcc59b94a`** over 454 files, IDENTICAL at both ends. *(A `grep -c FAIL` on the log reads **12** and every one of the twelve is the word inside a PASSING test name — `a FAILED settlement costs`, `transform-fails / a transform FAILS at run time`. The exit code was read on its own line, which is why that number is a note and not a verdict.)* **This is the SECOND confirming gate**: the first came back EXIT 1, see finding 10 |
| `npm run gate:full` | **RAN TWICE. EXIT 1, then EXIT 0** | the ladder plus `selftests`. First run **8/8 lanes completed, 6 ok**; second **8/8 completed, 8 ok, ZERO lines beginning `FAIL`**, against digest **`aaa938327e4c35ae`** over 454 files, IDENTICAL at both ends, 761.7 s wall against 2650.3 s serial-equivalent over 7 lanes. **BOTH first-run failures PREDATE W110 and neither is reachable from `npm run gate`** — finding 11. *The only edit after that run is this cell, which is the honest terminal statement: a verdict has to be written down somewhere, and where it is written is inside the tree it is about.* |
| conformity reader | **RAN** | 22 findings, **12 blocking**. Central obligation: **ZERO disagreements on the VALUES** |
| adequacy reader | **RAN** | 55 mutations, **13 real survivors**, 12 findings, **7 blocking** |
| the two readers' OVERLAP | **4** | the **SEVENTY-FIRST** measurement, at the top of the settled 0-4 band |

### Output (5): what reverting each item costs, and the answer is not a count

| reverted | at L6 | what the number IS |
|---|---|---|
| **W108** — the artifact's first `when` put back to the bare string | **exit 1, ONE named failure, and the assertion total is `null`** | the row THROWS: `FD-V42` refuses the document at `new Driver`, so there is no run to count assertions in |
| **W109** — the `Transform` type removed from `BUILT_IN_NODE_TYPES` | **exit 1, ONE named failure, total `null`** | the same shape one rule along: `FD-V32`, the type is not declared, and the artifact cannot be constructed |
| **W110's own cross-row block** — its universe emptied | **exit 1, FIVE named failures, total 2435** | a count, because the rows still run |

**So the exit artifact cannot price its predecessors in assertions, and that is the finding rather
than a gap.** W94 reported 52 / 19 / 52 and W67 reported 309 / 1 / 1 because those items'
predecessors were behavioural; **both of P26's are refusals at CONSTRUCTION**, so the honest answer
is *the artifact stops existing* and the assertion total is literally `null` in the report. The
measurement was still taken rather than reasoned to, and the harness's first cut is why: it got two
of the three wrong — the W108 anchor matched nothing (rule 7 (b) ABORTING rather than passing) and
the W109 edit merely added a disabled constant beside the real one, **a no-op that came back `0` and
would have been written down as *reverting W109 costs nothing***. That is rule 8's own definition of
a vacuous probe, in the file whose whole job is to produce a number.

### P26 prediction 3 — the plan's one REACH prediction — is CONFIRMED, with TWO narrowings measured

The prediction: *the subset, the built-in type and the declared transform are between them enough
for an ordinary flow, so a document a UI could emit needs no code but the domain workers.* It is
**confirmed** — the artifact runs, `RunOptions.predicates` is EMPTY and asserted empty, and no
predicate function, reshaping worker, gate type, custom group type or node-type class appears
anywhere in its registry. Two things it does NOT cover, each measured rather than inferred:

1. **A `transform` always names a `lang`, and no language ships with the library.** `Registry.languages`
   is EMPTY when absent, `S14` and ADR 0052 rule 4 keep every engine out of `src/`, and the adapter
   is therefore a consumer's import even though the library publishes it as `fyflow-orchestration/jsonata`.
   So *no code but the domain workers* is false as written and the `Outputs` row is corrected in
   place: **the domain workers AND the adapter the library itself ships.**
2. **A comparison reads ONE path and compares it to ONE literal**, so *is the mean below the
   threshold the run carries* is not expressible and neither is any arithmetic — and a `value` that
   is MEANT to be a path is accepted as a literal string and is false for ever
   ([Q456](../open-questions.md)). **The route around it is data**: `rollup` is a tier-three
   `Transform` node that computes `weak`, and the `when` reads `outcome.result.weak`. So the reach
   holds at the cost of a NODE rather than of a function, which is the three-tier rule doing its job.

### The central finding: a grader can be controlled and still be unable to compare

v0.24 requires the harness's grader to carry a probe whose right verdict is CRASH and one whose
right verdict is WRONG-REASON. **Both of this item's were right on every pass** — and the first full
pass still read **thirteen probes against declaration**, of which **three were the grader's own
arithmetic**: a declared `ceiling` is satisfied by a GREEN run, which the harness reports as `clean`,
and the comparison was `got === expect`, so a correct ceiling could never be *as declared*.
**A controlled grader proves the grader can SAY a verdict; it says nothing about whether its
COMPARISON of verdicts is right** — which is [Q452](../open-questions.md) one step along, that row
having been about the grader's WINDOW rather than its equality.

And the other ten were a second shape of the same thing: **five `says` strings had been written from
the DECLARATION rather than read off the output**, and in three of those five the probe was caught
*for the wrong reason*, which is the verdict the harness exists to distinguish:

- `R-adqF2`'s compound dropped the registered name, so `FD-V4` refused the paired document at
  construction and the row THREW — the re-sourcing it was written to observe never ran.
- `R-adqF4` and `d6` added an undeclared KEY to the UI document, which `resolveRegistry` refuses
  naming the five keys a worker declares — so the row threw and clause (5)'s byte equality, the
  clause both probes exist for, was never reached. **A drift the validator ACCEPTS is what
  discriminates it**, and the input example's own text is one.
- `R-adqF3`'s compound moved the DATA road while the re-sourced clause reads the NAMED one, so both
  sides still equalled the literal and the fourteen failures were the data rows alone.
- `e5` declared `RUN_FLOOR` and the catcher is **`X2`**, which refuses *a `check` snippet containing
  `throw`* BY NAME — so a `run` snippet that asserts cannot be downgraded at all. That is a better
  answer than a count, and it is W101's lesson about `X4` counting a `throw` textually, one clause
  along.

**Two of the five became PAIRS rather than probes, and the pair is the measurement.** W34 settled
that a provenance probe whose two sources cannot differ is vacuous; where they CAN differ on exactly
one tree, the probe is *that tree plus the swap* and the honest half is its control. So
`R-adqF2a` is one predicate REGISTERED and cited by no document — the one direction `FD-V4` does not
reach — and is **CAUGHT**; `R-adqF2` is that plus the re-sourcing and is **GREEN**. `d6` is a drift
the validator accepts and is **CAUGHT**; `R-adqF4` is that drift plus the re-sourcing and is
**GREEN**. In both, what the re-sourcing costs is measured from both sides instead of asserted.

### Obligation (f) found three ARRANGED orders and none of them is W110's

The artifact's only concurrency is the two `rate` instances, dispatched in one turn over the map's
items. Delaying `ScoreWorker` in inverse proportion to its item's confidence — so `alpha` (0.5)
settles after `beta` (0.4), the reverse of the dispatch order — is **GREEN** on every W110 row, which
is the declared ceiling: `settled` is a Record, `branchEvents` is per path, and `RN-R27` fixes a
one-turn dispatch pair by the DATA order, which a settlement delay cannot move.

**Unscoped, the same delay is CAUGHT in three rows and not one of them is this item's** (`f1b`):
`optional-loss / live-token` and `exit-last / join fires on exit` each assert WHICH terminal event
satisfied their join, expecting `branch.lost` and `branch.exited` and getting `branch.arrived`; and a
W90 resume row asserts that a task killed a turn after it parked re-dispatches NOTHING *with the
other branch settled first, arranged and asserted*. Those three ARRANGE the order the probe moves,
which is outside (f) as worded — so the reading is not a defect but
[W6](w6-the-non-success-rows-at-l6.md)'s own finding holding at twenty-six items' distance:
the join had never once been fired from the `lost` or `exited` path until W6 ARRANGED the causal
order, and the arrangement is still load-bearing and still asserted. Both probes are kept, because a
probe that fires on an arrangement is the only evidence that arrangement is asserted.

### What broke

1. **L1-L5 MOVED and this item declared it UNMOVED, twice over.** The `Tests:` line says *L1-L5
   UNMOVED is the declared result*; it is **1512 -> 1516**. The first gate came back **EXIT 1 on five
   L1-L5 failures in two corpus censuses I had PREDICTED NOT NEEDED**, both of which walk
   `examples/flows/**` and therefore see two new documents. Then the maintainer's answer to
   stop-and-ask (b) added a `src/` fix and a case for it. **The decomposition, derived rather than
   guessed: +1** the named-pool case on both roads, **+2** the two UI documents validating with an
   empty predicate registry at L1, **+1** the suite census's own per-suite case.
2. **The two `spec/**` exceptions were both UNPREDICTED and neither was predictable from a file
   set** — which is P10's retro's own finding. `spec/outcome-record.md` section 4 carries a CORPUS
   CENSUS (19 of 210 arcs, 191 at 91%) pinned outside its corpus, which is
   [Q360](../open-questions.md)'s class; and `spec/flow-definition.md` v0.27's note said *the package
   stays `0.6.0` here and moves at W110's close*, a sentence with an expiry date naming this item,
   corrected by the item that expired it.
3. **The restore ASSERTION was wrong where the restore was right.** The harness reported
   `RESTORE FAILED for examples/run-flow.ts` with the content digest IDENTICAL at both ends: a probe
   with two edits on one file saves that file twice, and comparing every saved entry fails on the
   second by construction. **W58's defect in the assertion rather than in the apply** — and the
   digest is what said the tree was fine, which is v0.17's clause doing exactly what it was adopted
   for.
4. **The census parser was wrong in SIX directions before it was right**, and the sixth is the one to
   carry: it read a cluster cell's RANGES (`Q9-Q12`, `Q19-Q21`, `Q28-Q30`, `Q33-Q35`, `Q37-Q39`,
   `Q61-Q63`) as their ENDPOINTS, losing Q10, Q11, Q20, Q29, Q38 and Q62 — **exactly the defect P10's
   retro recorded**, whose own words are *a missing id is still a classifiable answer, so nothing
   fired*. Here it DID fire, because the comparison is both ways. The other five: splitting on every
   `|` where GFM splits on UNESCAPED ones; requiring a status cell to start with `open` where the
   register rewrites a resolved row in place, bolded and sometimes capitalised; flagging a duplicate
   for an id appearing twice in ONE cell; **DOUBLE-COUNTING every id with both a live row and a
   Resolved-table row**, so the total was the sum of two overlapping sets; and reading a cluster row
   as two cells where several carry a pipe of their own.
5. **The register's own headline was stale by W109's four rows** — *three hundred and forty-two
   questions, 267 open, 1 deferred, 74 resolved* against a measured **346 / 270 / 1 / 75**, which is
   the figure W109's Record states and says it *validated against the committed baseline*. The
   baseline moved and the sentence that counts it did not.
6. **Q456, Q457 and Q458 were cited in SIX files and present in none** — `AGENTS.md`, `CLAUDE.md`,
   `doc/README.md`, ADR 0075, `examples/l6.ts` and this file — which is
   [Q453](../open-questions.md)'s class and the **THIRD consecutive occurrence**, after W108's five
   files citing a stop-and-ask list that existed nowhere and W109's five files citing an assertion
   that lived only in a comment. Written now, and the register is the only place a Q row counts.
7. **The first cross-row block's controls passed v0.22's test and failed v0.21's.** Both readers
   reached it; identity is unavailable because every operand is freshly built and the values are equal
   STRINGS ([Q447](../open-questions.md)), so the answer is W80's — **a LITERAL for each arm**.
   Measured after: emptying the block's universe gives **five named failures, each naming its own
   claim**, where before it was two integer edits at exit 0.
8. **ADR 0075 rule 3 blessed a road the two registry roads disagreed about**, found by both readers
   from opposite ends. The maintainer's answer to stop-and-ask (b) went **AGAINST the
   recommendation**: the code is fixed, `resolveRegistry`'s named-pool loop resolves its `type`
   against a MERGED map, and the built-ins are still STORED nowhere. It is a widening, so it cost
   **ZERO** at L1-L5 — which is why it is bound by a case on BOTH roads rather than by a count.
9. **Six smaller ones, each caught by a rung or by a re-read and none by reasoning**: a non-ASCII
   em-dash in a python bytes literal (twice, and it is my own written rule); `BUILT_IN_NODE_TYPES`
   imported from `registry.ts` where it lives in `validate.ts`, which took the runner down at import
   with ZERO FAIL lines; a `python s.replace` with no assertion that silently did nothing while
   printing *patched*; a backtick inside a template literal in `examples/l6.ts` (TS1005);
   `grep -c` exiting 1 on zero matches and reporting grep's failure as the rung's; and `DECLARED_TOTAL`
   guessed at 2434 against a measured **2435**.

10. **The CONFIRMING GATE came back `EXIT 1` with TWO FAIL lines in chromium, and it caught a
   claim in this Record.** `scripts/build-browser-tests.mjs` globs `examples/flows/**`, so W110's
   two flow documents came in free and `examples/ui-registry.json` did not — the new L1 suite
   validates both documents against it, and it is the only place *an EMPTY predicate registry*
   exists as a document rather than as a sentence. **This is the SEVENTH time a suite reading a
   file outside `spec/examples/` has reached that list** (W32, W33, W54, W74, W76, W77, this) and
   the SECOND time the gate is what said so, W77's three having been missed because
   `npm run test:browser:all` was read by grepping its count line. **And the row above said
   *56 files / 1516 assertions in three runtimes* when the figure had been taken from `npm test`
   ALONE** — the node lane — so it was false in chromium at the moment it was written. The gate
   found it, the file is inlined, and the three lanes are now measured separately and quoted
   separately: node 1516, deno 1516, chromium 1516. *A figure quoted for three runtimes from one
   lane's output is v0.12's second question — was what it RAN what it CLAIMS — about a NUMBER
   rather than about a check, and `doc/workflow.md` section 4's *a rung is RUN, never PIPED* is
   the clause that makes the exit code the thing to read.* `scripts/build-browser-tests.mjs` is a
   LATE exception and is in nobody's `Owns`; it has now been taken late by five items.

11. **`gate:full` found TWO red self-test lanes and BOTH predate this item, which is
   [ADR 0070](../decisions/0070-the-local-gate-is-the-ladder-and-proving-the-checks-can-fail-belongs-to-ci.md)
   consequence 2 as a live, measured instance.** That decision took the self-tests off the ladder
   and its CI workflow became a `workflow_dispatch`-only trigger, so *a commit can be pushed with
   the proof unrun* — and two items were. Neither lane is in `npm run gate`, so W108's and W109's
   confirming gates could not have seen either.

   **(a) `check:docs:selftest`**: the two `X6` META probes aborted with *the mutation matched MORE
   THAN ONCE, so it landed on the first of several* — rule 7 (b) firing correctly rather than
   passing. The cause is **W109**, which gave `X6` a second comparison (five tier-three figures
   beside its five `ms` ones) and thereby duplicated both anchors: `git show` gives
   `if (missing.length) {` and `if (extra.length) {` at **1 occurrence each on `HEAD~1` and 2 on
   `HEAD`**, with W110's own diff of that file touching only `RUN_FLOOR`. Re-anchored on the unique
   line above each, after which the lane is **EXIT 0, 51 probes, 28/28 noticed** and both directions
   are graded by name. *A probe aborting is the guard working; a probe aborting for a whole item is
   a lane nobody ran.* **And the re-anchor itself took two goes**, both recorded: the first wrote a
   REAL newline into a JS string literal (`SyntaxError` at load, the whole lane dead), and the
   second, built from a computed `find`/`rfind` span rather than a literal, **swallowed X10's
   comparison-clause entry whole** — caught by `MIN_META` reading *27 meta (floor 28)*, which is
   the floor doing what W31 measured it for.

   **(b) `check:wiring:selftest`**: the control exited 1 at **3.1 s**, against a lane
   [ADR 0072](../decisions/0072-a-scratch-path-carries-its-process-and-a-self-test-that-shares-the-tree-says-so.md)
   measured at 228 s — it died at its first clause. The control stages the checks flat into
   `dev-dist/` and points `CHECK_WIRING_SCRIPTS` there, so `check:wiring` reads **every `*.mjs` in
   that directory** — and three of **W108's six leftover harness modules** name `dev-dist` in a
   statement carrying no `process.pid`, which `G6` refuses by name. **`stray()` globs `check-*.mjs`
   only**, so W103's named-residue mechanism — the one built so *the next person does not spend
   the verdicts underneath it looking for a defect in a check* — printed nothing: it is one glob
   too narrow for the residue a rule-8 harness leaves. Isolated by measurement rather than reasoned
   to: **EXIT 0 with the `w108-*` modules held aside, and EXIT 0 again with all five of W110's own
   present**, so the residue is W108's and this item's harness is clean. The six are MOVED to the
   scratchpad rather than deleted, which is what that clause's own closing sentence asks for.
   **The widened glob needs a question id and W110's block (Q456-Q458) is spent, so it is named
   here for the next plan's declaration** rather than taking Q459 out of a block nobody reserved.

### Rule 8 — the final pass, with both readers' exact edits checked in as probes

```
49 probes: 1 control clean, 40 caught, 6 declared ceilings GREEN, 1 declared CRASH,
           1 declared WRONG-REASON, 0 aborts, 0 against declaration
digest fff16cab060fcd6e -> fff16cab060fcd6e over 454 files  IDENTICAL
```

Both GRADER controls produced their verdicts **before any other verdict was trusted**, and were
re-run alone to confirm it: `g-crash` reports *test exited 1 with ZERO named failures* and `g-wrong`
reports *1 named failure, none naming "a clause this probe does not name"*. The six ceilings are
each declared with the tree on which they fail and their claim passes (v0.22), and two of them —
`R-adqF2` and `R-adqF4` — are the GREEN halves of the two pairs above, so their reason is a
measurement rather than an argument. **The author pass read 46 probes with 13 against declaration**;
every one of the thirteen is accounted for in the central finding, three as the grader's arithmetic
and ten as a `says` or a compound re-declared from the measured output.

### The overlap's derivation, because an ordinal copied from a Record is a copy

`doc/workflow.md` section 6's list holds **65** entries and ends at W101. W104 (6), W105 (3), W107
(6), W108 (2) and W109 (2) each took a measurement and **none is in the list**, because only a RETRO
appends and three of the five are items outside any plan. So W109's is the seventieth and this is the
**seventy-first** — derived by counting the list and reading five item files, never from a headline.
**W108's published ordinal is short by three for the same reason**, which W109's Record records.

### The four SHARED SUBJECTS

1. **`CROSS_ROW_SUBJECTS` had no W110 entry** — the conformity reader by GREPPING the array, the
   adequacy reader (F1) by DELETING the block for **two integer edits** at exit 0. The same defect
   from opposite ends, and the pair's sharpest.
2. **Clause (5)'s duplication check** — it passes on `"workers": {}` (conformity), and both sides
   re-sourced to the UI import is green with no control declared (adequacy F4).
3. **Clause (2)** — no control, and the file did not say so (conformity); resists re-sourcing at a
   cost of 1 (adequacy).
4. **`uiItems` / `uiRollup` / `uiRemediated`** — re-implementations of what the workers compute
   (conformity 21), and three of the adequacy reader's greens are vacuous by rule 8's own definition
   for the same reason.

### Exceptions — re-derived AFTER the record step and reconciled to `git status --short` to the path

**26 paths**, every one classified. *(This read **23** when it was first written, which was BEFORE the record step wrote `doc/plans/p26-*.md`. The rule says re-derive AFTER the record step and reconcile to `git status --short` to the path, and doing so is what moved it: the classification below summed to 24 while the sentence above it said 23, the two having been written ten minutes apart. It then read **24** until the confirming gate added `scripts/build-browser-tests.mjs` and **25** until `gate:full` added `scripts/check-docs-selftest.mjs`, which is the rule working three times over: a count taken before the last edit is not the count.)*

| | paths | |
|---|---|---|
| **In `Owns`** | 9 | `examples/l6.ts`, `examples/run-flow.ts`, `examples/flows/ui-emitted.flow.json`, `examples/flows/ui-emitted-named.flow.json`, `examples/ui-registry.json`, `examples/README.md`, `AGENTS.md`, `README.md`, this file. **`examples/registry.json` is in `Owns` and did not move**, which is what clause (5) asserts |
| **DECLARED exceptions** | 7 | `doc/decisions/0074-*.md`, `doc/decisions/0075-*.md`, `scripts/check-docs.mjs`, `test/definition/l4-corpus.test.ts`, `package.json`, `deno.json`, `doc/plans/p26-*.md` |
| **Record-step files** | 3 | `CLAUDE.md`, `doc/README.md`, `doc/open-questions.md` — the record step's own list, not exceptions |
| **UNDECLARED** | 7 | `spec/flow-definition.md`, `spec/outcome-record.md` (finding 2); `src/definition/registry.ts`, `test/definition/registry.test.ts`, `test/definition/wiring.test.ts` (finding 8); `scripts/build-browser-tests.mjs` (finding 10); `scripts/check-docs-selftest.mjs` (finding 11a) |

**Five undeclared, and their classification is the honest part.** Three are ONE cause — the
maintainer's answer to stop-and-ask (b) going against the recommendation, which the
`PREDICTED NOT NEEDED` row for `src/**` could not have known and which is therefore declared in the
stop-and-ask table rather than in the exceptions table. The other two are a corpus census and an
expiry-dated sentence, the two classes a file SET cannot predict. **The sixth arrived from the CONFIRMING GATE** and is the one an exceptions table can never predict from a file set either, because which fixture the browser bundle lacks is a property of what the item's new SUITE reads. **The seventh arrived from `gate:full`** and is not this item's defect at all: a probe W109 made ambiguous, found by the first run of the one rung that could see it.

`examples/deno-import-map.json` was declared and **not needed**; `scripts/check-workers.mjs` and
`examples/workers/**` were predicted not needed and **were not needed**.

### Census

**349 questions — 273 open, 1 deferred, 75 resolved**, from 346 / 270 / 1 / 75, by a parser written
from scratch that **ABORTED ZERO times on its final run** and whose six wrong directions are finding
4. Derived **two ways**: the live and Resolved tables as a union (343 live rows plus six ids whose
only row is in the Resolved table), and the cluster table independently — **349 of 349 ids in exactly
one cluster cell, missing none, in two cells none** — with the headline sentence compared to the rows
rather than trusted, and corrected. Six rows are declared EXEMPT from positional cell reading because
an unescaped pipe inside a code span makes them render wrong (Q119, Q71, Q87, Q343, Q411, Q415), and
the list is compared both ways so a spent permission fails.

**[Q456](../open-questions.md), [Q457](../open-questions.md) and [Q458](../open-questions.md) raised;
none resolved, which is what an exit artifact looks like in the register. No ADR — none was expected
and none was needed. `Spec: NONE` HELD: `check:spec` is 7 / 72 / 132 unmoved and `C4` is 42.**
