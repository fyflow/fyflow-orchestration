# W109 — A node that only transforms

**Status:** done — see the Record.
**Plan:** [P26](../plans/p26-what-a-flow-can-say-without-code.md)

```
Spec: spec/flow-definition.md — the built-in node type, and the refusal of one declaring no
      `transform`. spec/runtime-targets.md if the envelope's contract moves.
Owns: src/definition/registry.ts, src/definition/validate.ts, src/scheduler/envelope-worker.ts,
      src/definition/assist.ts, spec/flow-definition.md, test/definition/node-type.test.ts,
      test/scheduler/envelope.test.ts, doc/decisions/0075-*.md,
      doc/work-items/w109-a-node-that-only-transforms.md
Inputs: P26 facts 3-7, each RE-TAKEN at this declaration — fact 3 (BUILT_IN_GROUP_TYPES and
        BUILT_IN_GATE_TYPES exist, BUILT_IN_NODE_TYPES does not), fact 4 (`EnvelopeWorker.inner`
        is already `InnerWorker | null`), fact 5 (`S14` forbids the engine outside
        src/jsonata/**), fact 6 (`produced()` returns `unchecked` with no outputSchema),
        fact 7 (`tryTransform` ships and is not wired to this case). Q445, Q446.
Outputs: (1) `BUILT_IN_NODE_TYPES` with one member — a type whose worker is the package's own
             envelope with NO inner worker, which names a LANGUAGE and imports no engine
         (2) a node of that type declaring no `transform` is REFUSED at construction, because
             the alternative is an expensive identity (P26 decision 5 (b))
         (3) it takes `settings`, which the wrapper already binds as `$settings` (5 (c))
         (4) the sampled output shape is an EXPLICIT deliverable: `tryTransform` wired to this
             case so an author gets a shape where fact 6 gives them none (5 (a))
         (5) the three-tier rule in ADR 0075 — `needs` for selection, `transform` on the
             consuming node for computation, this type only when there is no consuming node —
             with the COST of a tier-three node measured rather than asserted
Depends on: W108 (both edit spec/flow-definition.md — SERIAL)
Blocks: W110
Tests: L1 (the registry, the refusal both ways), L2, L4 (the corpus), a real-pool case for the
       envelope's no-inner arm, check:wiring (the `unchecked` verdict asserted, not hoped for),
       check:source S14 and S16, check:docs
Gate: npm test, check:source, check:wiring, check:docs, npm run gate
Reserves: W109, Q451-Q455, ADR 0075
```

## Why

**A node whose whole job is to reshape data has to be written as code**, even though the envelope
worker already does the reshaping — and the library ships no node type at all, where it ships
three group types and one gate type. [Q445](../questions/q445.md). With W108 this is the second
half of what a UI needs: a flow document that says both *which way* and *what shape*.

## What to be careful of

1. **This REINTRODUCES a shape two ADRs removed, and the ADR must say so.** P17's declaration
   calls a reshaping task node *"the workaround ADR 0040 exists to remove"*. It is legitimate as
   an escape hatch and wrong as a default, so output (5)'s three-tier rule is not decoration —
   without it a UI emits a dispatch where a `transform` or a `needs` would have cost nothing.
2. **The cost is a real task and it multiplies.** A dispatch, an `OR-R2` clone and a log record;
   inside a `map`, N of them. W34 measured a clone per branch at **2207 ms at N = 1000**. Output
   (5) requires that measured here rather than cited from there.
3. **A built-in JSONata type would turn `S14` red and ship a 242 KB engine to every consumer.**
   Fact 5. The type names `lang` exactly as `transform` does; the adapter stays the consumer's,
   and ADR 0052 rule 4 is untouched. **Nothing in this item may import `jsonata`.**
4. **Output (4) is a SAMPLE and the verdict stays `unchecked`.** A sample is evidence about one
   input; `fits` is a claim about every input. Saying otherwise would be the strongest claim in
   this item and the easiest to make falsely — [Q446](../questions/q446.md) records the residue,
   and P26 prediction 4 says this item does not remove it.
5. **`EnvelopeWorker.inner` is ALREADY nullable, which makes the arm small and the probes
   necessary.** A new arm in a shipped file is exactly where rule 8 obligation (e) belongs: what
   happens when the no-inner road is taken by a node that HAS an inner worker, and the reverse.
6. **`BUILT_IN_NODE_TYPES` is a new SET, so the collision rules apply to it.** `registry.ts`
   already refuses *one name, two definitions* for node types, group types and gate types; a
   built-in node type colliding with a document's or `code`'s must be refused the same way, and
   whether the existing clause reaches it is a measurement rather than an assumption.

## Declaration step — every input RE-TAKEN, and facts 3 and 4 are each wrong once

Measured on `b7141b7` (W108 committed and gated; the tree clean, so the `Owns` audit is exact).
**Spawn health first**: `node -e ""` through `spawnSync` is a **57.6 ms** median over twelve
(52.6 … 82.8), against the ~54 ms a healthy machine gives — so every figure below is about the
change and not about the machine ([Q179](../questions/q179.md)'s precondition).

**Baseline RE-TAKEN rather than transcribed, and it confirms exactly**: L1-L5 **56 files / 1479
assertions** in node 24.20.0; `check:spec` **7 documents / 70 examples / 131 rules** with `C4` at
**41**; `check:docs` **39 snippets — 33 run, 6 check**; `check:source` and `check:wiring` **EXIT 0**;
**L6 2176 assertions over 154 real runs in BOTH runtimes**.

### Fact 3 re-takes CONFIRMED, and it misses a THIRD set that changes the shape

`BUILT_IN_GROUP_TYPES` is `src/definition/registry.ts:104` with keys `ConcurrentLimitGroup`,
`RateLimitGroup`, `KeyedRateLimitGroup`; `BUILT_IN_GATE_TYPES` is `src/definition/validate.ts:310`
with the one key `distinct`; and `BUILT_IN_NODE_TYPES` is **zero occurrences in code** — every hit
in the tree is prose in this item, P26 and three indexes.

**But `src/scheduler/runtime.ts:119` declares `BUILT_IN_GROUP_FACTORIES`, which fact 3 does not
name, and the group-type precedent is therefore TWO-PART**: the NAME and the SCHEMA live in
`src/definition/registry.ts` — whose own comment says *what this module needs of them is the NAME …
and the SCHEMA, and both are data* — while the thing that CONSTRUCTS lives in the scheduler
sub-path. A built-in node type has the same split, and the scheduler half already exists:
`ENVELOPE_WORKER_URL` at `src/scheduler/bootstrap.ts:57`, which is the script **every** typed pool
loads. *So the member this item adds is data on the definition side, and the one thing it needs
from the scheduler side is already there.*

### Fact 4's CONCLUSION is FALSE in the direction that matters

The field is `private inner: InnerWorker | null = null` at `envelope-worker.ts`, exactly as fact 4
says. **What is false is *so no inner worker is an arm in a file that exists*** — measured, one
refusal at a time:

| probe | what happened |
|---|---|
| `setup()` with no `worker` in the pool config | **THREW** `envelope worker: the pool config names no worker URL — got {}` |
| `setup()` with `worker: ""` | **THREW**, same clause |
| `run()` before `setup()` (`inner === null`) | **THREW** `run() before setup() — the inner worker is not loaded` |
| `setup()` then `run()` with a transform and a real inner worker | **OK** → `{"saw":5}` |

**So the null is a LIFECYCLE state — before `setup()`, after `teardown()` — and `run()` refuses it
BY NAME.** *No inner worker* is not an arm; it is a configuration two shipped refusals forbid. The
arm has to be built, and the field's type merely does not stand in the way.

### The seams a worker-less type reaches — THREE layers, measured one at a time

Neither fact 3 nor fact 4 reaches these, and all three refuse by name today:

| layer | what it says to a type whose worker is not a registry worker |
|---|---|
| `validateDefinition` | **`FD-V32`** — *type "B" is registered but names worker "&lt;envelope&gt;", which the registry's workers does not declare* |
| `resolveRegistry` | **`WorkerMissing`**, two clauses: *names worker "…", which the registry document's workers does not declare*, and *names no worker* for a type with no `worker` key at all |
| `checkWiring`'s `schemaOf` | the `unchecked` reason reads *worker "&lt;envelope&gt;" of type "B" is not in the registry* — **misleading for a built-in whose whole point is to have none** |

And three more on the scheduler side, read off the code rather than run: `derivePool(…, worker:
WorkerEntry, …)` reads `worker.configSchema`; `poolOptionsOf(spec, inline, workerUrl, languages)`
takes `workerUrl: string`; and `bootstrap` dereferences `workers.get(def.worker)!` to get it.

**A fourth seam nobody had named, and it is reached BY CONSTRUCTION**: `createRuntime` writes a
language's worker url into a pool's config only for *a type some node of which declares a
transform*, read off the `flows` it is given — so without `flows` it refuses at `start` with
`LanguageNotBuilt: flow "…" declares transform.lang "path" on a node of type "Consume", and this
runtime's pools for that type carry no language`. Measured at this declaration step, as the second
error the cost harness hit. **A transform-only type ALWAYS transforms**, where an ordinary type
reaches that seam only if some node of it happens to declare one.

### Careful 6 is a MEASUREMENT and the answer is NO

The only node-type collision clause in the tree compares `code.nodeTypes` against the document's
`nodeTypes`, and nothing else:

| probe | verdict |
|---|---|
| document `nodeTypes.t` **+** code class `t` | **`NameCollision`** — the clause that exists |
| document `nodeTypes.t` alone / code class `t` alone | accepted |
| document `nodeTypes.transform` / `.Transform` | **accepted**, both roads |
| code class `transform` / `Transform` | **accepted**, both roads |
| a pool keyed `t` beside node type `t` | **`NameCollision`** — a type's name is its default instance's key |

**So the existing clause does NOT reach a built-in, and node types become the FIRST kind with THREE
namespaces** — group types and gate types each have two. Two new directions are needed, and the
precedent for what they do is unanimous: a custom group type colliding with a built-in is
`NameCollision` (`registry.ts:430`) and so is a custom gate type (`gateTypeCollisions`). Neither
merges.

### Fact 5 CONFIRMED

`S14` scans every published file for `jsonata` under any specifier form: outside `src/jsonata/` it
fails naming the file, and inside it fails anything but the bare specifier. **Nothing this item adds
may import the engine**, and the type names `lang` exactly as `transform` does.

### Fact 6 CONFIRMED EXACTLY, and fact 7 is STRONGER than it is written

`produced()` returns `{ unchecked: why }` when `schemaOf(taskId, 'outputSchema')` gives nothing —
confirmed by running it. On a node whose worker declares neither schema, with a transform:

```
p -> b [edge] = unchecked   why: "b" (type "B", worker "bare") declares no inputSchema
                                 — the transform ran and nothing holds its result
                            sample.value={"n":0}  sample.result={"n":0}
b -> c [edge] = unchecked   why: "b" (type "B", worker "bare") declares no outputSchema
```

**The arc LEAVING is `unchecked`, which is fact 6.** And fact 7 says *the feedback exists and is not
wired to this case*; measured, **`checkWiring` already RUNS the transform on this exact case, already
populates `sample.result`, and already says in words that nothing holds it.** `tryTransform` is at
`assist.ts:155`, async, and returns the verdicts whose `consumer` is the node asked about — so
asking it about the transform node hands back the produced value, and asking it about the node
DOWNSTREAM hands back fact 6's bare `unchecked`. *Output (4) is a PRESENTATION of a value the check
computes today, not new evaluation* — which makes it smaller than declared and its claim narrower.

### Output (5) MEASURED, and the item's own sentence is wrong about the COUNT

`dev-dist/w109/cost.ts` on a real `FyflowScheduler`, two arms over one `map` of N computing the same
N values: TIER TWO is one task per item with the `transform` on the consuming node; TIER THREE is a
transform-only node feeding it. Warmed up in both pool modes, median of three, counts asserted
steady across the three repeats.

| | N | dispatched | clones | records | median ms | ratio |
|---|---|---|---|---|---|---|
| **INLINE** tier two | 4 / 32 / 128 | 5 / 33 / 129 | 30 / 198 / 774 | 21 / 133 / 517 | 0.9 / 1.7 / 6.6 | |
| **INLINE** tier three | 4 / 32 / 128 | 9 / 65 / 257 | 46 / 326 / 1286 | 29 / 197 / 773 | 1.2 / 2.9 / 12.7 | **1.26x / 1.73x / 1.93x** |
| **THREADED** tier two | 4 / 32 / 128 | 5 / 33 / 129 | 30 / 198 / 774 | 21 / 133 / 517 | 83.2 / 87.4 / 93.0 | |
| **THREADED** tier three | 4 / 32 / 128 | 9 / 65 / 257 | 46 / 326 / 1286 | 29 / 197 / 773 | 124.9 / 127.3 / 136.5 | **1.50x / 1.46x / 1.47x** |

**Per item, exact and identical at all three arities: +1 dispatch, +4 CLONES, +2 log records.**

**The item's own *a dispatch, an `OR-R2` clone and a log record* is right about the kinds and wrong
about the count, and the direction makes the three-tier rule's argument STRONGER.** The four are
named rather than guessed — `dev-dist/w109/clones.ts` buckets every `structuredClone` by its CALLER
(bucketing by the helper's own line aggregates them, which is what the first reading did):

| site | per extra task | what it is |
|---|---|---|
| `src/driver/listener.ts:81` `normalizeEvent` | 1 | **`OR-R2`'s clone** — the one the item names |
| `src/driver/driver.ts:611` `freezeInput` | 1 | the clone `runtime.start` installs on EVERY run — **[Q320](../questions/q320.md)'s, paid again** |
| `src/driver/driver.ts:2132` `advance` | 1 | the result cloned as it hops along the edge |
| `src/driver/driver.ts:3046` `dispatch` | 1 | the extra dispatch's envelope `settings` |

**And the two pool modes answer DIFFERENTLY, which is the shape**: inline the ratio RISES with N
toward the 2x that doubling the task count predicts, because there the driver's own work IS the
cost; threaded it is **FLAT at ~1.47x**, because a thread pool's per-task cost is dominated by what
it amortises. *Neither is W34's 2207 ms at N = 1000, which measured a clone per BRANCH over a
117 KiB payload — a different quantity, which is why this item was told to measure rather than
cite.*

### The FOUR stop-and-asks, put to the maintainer on 2026-10-02 and answered the same day

Written here rather than left in the conversation, because W108 shipped five files citing *W108's
stop-and-ask (b)* against a list that existed nowhere, two of them SOURCE files.

| | the question, priced | the answer |
|---|---|---|
| **(a)** | how the built-in satisfies the three layers above: declare NO worker and teach them (~6 edits, each at a site that refuses by name today), contribute a `BUILT_IN_WORKERS` entry whose url is the envelope's (zero edits, but `ENVELOPE_WORKER_URL` is on the scheduler side and the field would name the POOL's script as the inner worker), or give it a real identity inner worker (zero edits, and it reintroduces the expensive identity 5 (b) refuses) | **declare NO worker and teach the layers**, AS RECOMMENDED |
| **(b)** | the member's NAME: `Transform` (the corpus convention — `Scored`, `Bounded`, `GpuModel`), `transform` (matching `distinct`, but colliding visually with the node key beside it), or `Reshape` | **`Transform`**, AS RECOMMENDED |
| **(c)** | a collision with the document's `nodeTypes` or a `code` class: refuse both directions, let the built-in silently win, or let a consumer replace it | **REFUSE both directions**, AS RECOMMENDED — both precedents are unanimous |
| **(d)** | the refusal for a node of the type with no `transform`: a new `FD-V46`, or widen `FD-V37` | **a new `FD-V46`**, AS RECOMMENDED — `FD-V28`'s own stated precedent that a different fix earns a different id. `C4` goes **41 → 42** |

### Declared exceptions, at the declaration

Seeded from **W108's LATE list** rather than from a file set, which is what that item's twenty-four
late exceptions against five declared argue for:

- **`doc/plans/p26-what-a-flow-can-say-without-code.md`** — facts 3, 4, 6 and 7 corrected in place.
  A plan is on nobody's `Owns` once declared.
- **`src/definition/types.ts`** — `NodeTypeDeclaration.worker` and `NodeTypeDefinition.worker` must
  become optional for a built-in; `EnvelopePoolConfig.worker` likewise. In no `Owns`.
- **`src/scheduler/bootstrap.ts`** — `p.worker.url` and `poolOptionsOf`'s third argument.
- **`src/scheduler/runtime.ts`** — `createRuntime`'s `flows` seam, if a built-in transform-only type
  needs its languages written unconditionally.
- **`src/definition/wiring.ts`** — `schemaOf`'s reason for a type with no worker.
- **`scripts/check-spec.mjs`** — `C4`'s count moves 41 → 42; measured to need no clause change, but
  declared because the count is its subject.
- **`spec/README.md`** — its version column (`C8`) and **THREE** copies of the count: the row's
  headline bold, its trailing bold, and its `C4 covered N definition refusals` quote.
- **`AGENTS.md`** — `X7`'s refusal count **and its id-range end**, and the reference is the only
  document a consumer reads for what a node type may be.
- **`test/definition/l4-corpus.test.ts`** — the suite census, **BOTH HALVES**: a `SUITES` row and a
  per-suite CASE COUNT. *(W108's reader found it had taken only the first; the count is in that file
  now, at its own `still REGISTER` row, and this item takes both from the start.)*
- **`test/definition/wiring.test.ts`** — the L4 arc census moves with the corpus.
- **`spec/outcome-record.md`** — section 4's corpus split moves if a valid corpus document is added.
  *Predicted by nothing at W108 and found by the suite that re-derives it.*
- **`scripts/check-docs.mjs`** — `RUN_FLOOR`, only if a `run` snippet is added.

**The five copies of `C4`'s count, counted rather than inherited** — the prompt that set this item
said *four places* and listed five; measured against `check-spec.mjs`, `C4` compares **four**
(`spec/README.md`'s first bold at line 236, its last bold at 227, its `C4 covered N` quote at 240,
and `spec/flow-definition.md`'s own version paragraph at 255) and **`X7` compares a fifth**
(`AGENTS.md`'s count, and its id-range end). *Five copies, three files, two checks.*

### The exceptions this list MISSED — ELEVEN paths, re-derived by classifying all 34

Against the `Owns` block, the record step's six files and the declaration above — **8 `Owns`, 4 record
step, 11 declared, 11 LATE, and 3 declared-and-not-needed**, which is **34** and reconciles with
`git status --short` to the path. Eleven against eleven is a different shape from W108's twenty-four
against five, and the gain came from seeding this table off W108's LATE list; what remains is what no
file SET could have predicted.

*`Owns` is 8 and not 9 because one of its nine paths does not exist (finding 18). The record step's six
files contribute **4**, not 6, because two of them are counted elsewhere — the item file is in `Owns`
and the plan is a declared exception — leaving `doc/README.md`, `CLAUDE.md`, `doc/open-questions.md`
and `doc/decisions/README.md`. **This paragraph said 1 and 31 until the record step was finished**,
having been derived when only the register of those four had been written: v0.12's *a measured number
is re-taken on the tree the item ships*, firing on the table whose whole subject is what a count of
paths misses, and paid for with a third confirming gate.*

| | why |
|---|---|
| **`test/scheduler/transform.test.ts`** | **the `Owns` block names `test/scheduler/envelope.test.ts`, which DOES NOT EXIST** — the envelope's class-level cases live in `bootstrap.test.ts` and its real-pool ones here. The sharpest of the eleven, because `Owns` is what a reader audits against and that path had nothing to run against; both readers found it, and `spec/flow-definition.md` section 7 had inherited the wrong name from this very line |
| `src/driver/driver.ts` | four schema lookups that assume a type names a worker — every one flagged by the TYPECHECKER when `worker` widened, which is P22's *the dearest row is the one whose whole cost a typechecker prints*, in the direction that helps |
| `test/definition/assist.test.ts` | the `Owns` block names `assist.ts` and not its test |
| `test/scheduler/bootstrap.test.ts`, `test/scheduler/runtime.test.ts`, `test/definition/registry.test.ts`, `test/registry-fixture.ts` | the pool and type expectation sets every registry reads — widened when the built-ins were stored, then REVERTED when they stopped being (finding 3) |
| `spec/examples/invalid/FD-V46--*.flow.json`, `spec/examples/valid/transform-only-node.flow.json` | `C4` requires a case per refusal and the corpus should exercise the feature; W108's `Owns` carried `spec/examples/**` and this one did not |
| `examples/l6.ts` | the cross-row census — *a type registered and used by nothing is red* is exactly what a merged built-in looks like. Also where the exemption I added came back OUT (finding 3) |
| `scripts/check-docs-selftest.mjs` | the four `X6` probes rule 7 (a) requires checked in, and the stale site census (finding 14) |

*Three declared exceptions were NOT needed: `src/scheduler/runtime.ts` — the `flows` seam needed no
edit, because `createRuntime`'s existing `LanguageNotBuilt` IS the behaviour ADR 0075 consequence 3
relies on — and both `registry.json` files, predicted not needed and correct for W108's own reason: a
built-in type names nothing a registry document has to declare.* `scripts/check-docs.mjs` was declared
for `RUN_FLOOR` and needed for `X6` instead — the same file for a different reason.

**And `README.md` needed NO edit, measured rather than assumed — which is [ADR 0073](../decisions/0073-the-readme-is-for-a-person-the-reference-is-for-an-agent.md)
working.** Every item before W107 moved it: it carried the refusal count, the L6 counts and the plan
history. Re-read at this item's record step it holds **no refusal count, no assertion count and no
node-type census**, its three paired fences are byte-equal to `AGENTS.md`'s at `X8` because none of
the three sections moved, and its *More examples* table names sections 16-20 while this item's
reference prose landed in section **13**. *The one document that used to need an edit for every count
now needs one only when the three examples change.*

## Record

**Status: DONE.**

**Gate — what ran.** Every rung RUN and its exit code read on its own line, never piped.

| Clause | Verdict | Notes |
|---|---|---|
| `npm test` (L1-L5) | **RAN, EXIT 0** | **56 files / 1512 cases** in node 24.20.0, deno 2.9.6 and chromium, from 56 / 1479 |
| `npm run check:spec` | **RAN, EXIT 0** | **7 documents / 72 examples / 132 rules**, *C4 covered 42 definition refusals*, from 7 / 70 / 131 and 41 |
| `npm run check:docs` | **RAN, EXIT 0** | **39 snippets — 33 run, 6 check** UNMOVED, X1-X11 all ok; `X6` compares **5 tier-three figures** as well as its five `ms` ones |
| `npm run check:docs:selftest` | **RAN** | **51 probes** — and on its first outing **49/51, because rule 7 (b) refused two of this item's four new `X6` probes** for anchors that matched nothing. Re-anchored from the real text; all four verified FIRING through the same `CHECK_DOCS_DOC` override the self-test uses |
| `npm run check:source` / `check:wiring` / `check:markdown` | **RAN, EXIT 0** | `S14` and `S16` green with the new type shipped, which is careful-point 3 |
| `npm run test:l6` / `:deno` | **RAN, EXIT 0** | **2176 assertions over 154 real runs in BOTH runtimes — UNMOVED**, the declared result |
| `npm run gate` | **RAN THREE TIMES. The first confirming gate was `EXIT 1` with ZERO `FAIL` lines; the second and third are EXIT 0 with zero `FAIL` lines** | **L0, `deno lint`: `BUILT_INS` is never used** — finding 28. `lint` is the chain's FIRST entry since ADR 0039, so **nothing after it ran**, and the predicate is the exit code rather than any line of the output (v0.15). The second ran whole on digest **`124aa3a319bec3f4`, identical at both ends** — 42 definition refusals, 39 snippets / 33 run, 1512 cases in three runtimes, 2176 L6 assertions, 0 failed. **The third is the price of one edit after it**: the exceptions table's own total, re-derived at **34 / 4** where it said 31 / 1, which is the only thing between the two runs |
| conformity reader | **RAN** | 15 findings, **5 blocking**. Central obligation: **ZERO disagreements on 41 values derived on paper before the code was opened** |
| adequacy reader | **RAN** | 23 mutations + 7 constructions, **14 survivors at zero**, 14 findings, **8 blocking** |
| the two readers' OVERLAP | **2** | the **SEVENTIETH** measurement (finding 15 derives the ordinal; `doc/workflow.md`'s list is four short). Both are in *What broke*: the collision refused on `resolveRegistry`'s roads and not the validator's (finding 2), and the two normative documents pointing at a test file that does not exist (finding 18) — **and the first is the same defect reached from OPPOSITE ENDS**, by mutation and by reading. Inside the settled 0-4 band |
| rule 8, final pass | **RAN** | **59 probes — 48 CAUGHT, 6 declared ceilings, 2 declared CRASHES, both GRADER controls right, 1 control clean, ZERO against declaration**, digest identical at both ends of both passes |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `BUILT_IN_NODE_TYPES` with one member whose worker is the package's own envelope with NO inner worker, naming a LANGUAGE and importing no engine | yes | probes `a5`, `R-adqC1` (a second member — the observer five files NAMED and which did not exist), `R-adqR4` (rule 3's four absences), `R-adqR1`/`d1` (the merge's tie-break and order), `x9` (`S14`) |
| (2) a node of that type declaring no `transform` is REFUSED at construction | yes — **`FD-V46`**, its own id on `FD-V28`'s precedent | `a1`, `a3`, `a4`, `x7` |
| (3) it takes `settings`, which the wrapper already binds as `$settings` | yes | `R-adqP1` — the arm evaluating with empty settings |
| (4) the sampled output shape is an EXPLICIT deliverable | yes — and it is a **PRESENTATION of a value `checkWiring` already computes**, which is narrower than declared | `R-conf4` (a FAILED transform's message returned as the shape), `R-adqP6`, `c1`, `c4`-`c7`, `R-adqM8` |
| (5) the three-tier rule with the COST MEASURED rather than asserted | yes — **and the item's own sentence was wrong about the count** | `R-adqU4`, which `X6`'s new clause is what sees |

**What broke.** Twenty-eight things, and the ones worth carrying — **the twenty-eighth found by the
confirming gate itself, on the tree this item was about to ship**:

1. **The adequacy reader's central finding: the pool config the library BUILDS was bound to NOTHING.**
   `poolOptionsOf` WRITES `transformOnly` and `EnvelopeWorker.setup()` READS it, and the name appeared
   in no assertion anywhere — only in a HAND-WRITTEN literal in the consuming side's own test. Dropping
   the marker, and renaming it, each cost **0** at `npm test` AND at `typecheck`, because the object is
   `as WorkerManagerOptions`. Its construction shows the consequence from the producing side: with the
   marker gone **the library's own config is read as MALFORMED** by `setup()`'s v0.17 clause and every
   `Transform` task settles `failed` — the exact conflation ADR 0075 rule 4 says the marker exists to
   prevent, arriving from the other end. And skipping the built-in in the languages loop costs it its
   ENGINE for zero. *A marker is a PROTOCOL between two modules, and a cast hides it from the one thing
   that could compare the two names* — [Q451](../questions/q451.md).
2. **BOTH READERS FOUND THE SAME DEFECT FROM OPPOSITE ENDS** — the pair's sharpest shared subject: the
   collision was refused on `resolveRegistry`'s two roads and NOT on the validator's, so a consumer
   handing a worker-backed `Transform` to `new Driver` got **zero findings and a driver that
   constructed**, their definition discarded in silence and their worker never run. `nodeTypesOf`'s own
   docstring named `FD-V32` as the catcher, and `FD-V32` **cannot fire** — precisely because the
   built-in won the merge, so `onlyTransforms` skips its worker clause. `checkGateTypes` had refused the
   gate-type case on that same road since W92, which is what ADR 0075 rule 5's *the third kind now
   agrees with both* claimed and did not have; `nodeTypeCollisions` was exported and called by nothing.
3. **Fixing that refused EIGHTY of this repository's own tests, and the fix was a DESIGN correction.**
   `checkRegistry` runs on a RAW registry and on a RESOLVED one, and `resolveRegistry` was STORING the
   built-ins — so the clause could not tell a consumer's collision from the library's own entry.
   **`ResolvedRegistry` has no `gateTypes` field at all**: a gate type is never stored and is merged at
   every read, which is the precedent ADR 0075 rule 5 cites and which the first cut had not followed.
   The built-ins are stored in no registry now; their POOLS are still built, by `bootstrap`, which reads
   through `nodeTypesOf`. **And L6's type census then needed no exemption at all** — the clause I had
   added for it, with its own control, came out as a fourth claim its two neighbours already entail.
   *The clause written to close a reader's finding is what found the design wrong.*
4. **A named pool INSTANCE of the built-in CRASHED with an unnamed `TypeError`, and this item's own
   pool ordering caused it.** ADR 0075 rule 3 blesses that road BY NAME. The named-instance loop read
   `derived[inst.type]!.definition`, sound while one loop built every type's default before it;
   appending the built-ins last made `derived` incomplete there. `resolveRegistry` accepted the
   document, so the registry VALIDATED and the pool build then died — where every other registry defect
   in that file is a named error. It reads the definition from `types` now, which is sound because
   `checkRegistry`'s `PoolTypeMissing` ran first and over the same merged map.
5. **`sampledOutput` presented a FAILED transform's error message as the node's output shape.** It
   selected on `'result' in sample` and never read `v.kind` — and `WiringSample.result` is documented
   as *what it produced, OR THE FAILURE'S MESSAGE*. Measured with a language whose `evaluate` throws:
   `{ type: 'string' }` for the thrown text, with no `why`, to the authoring UI this function exists
   for. *The one case the item's own "this is the claim easiest to make falsely" note did not guard.*
6. **The observer FIVE FILES NAMED did not exist.** Four test files and `examples/l6.ts` all carry the
   same sentence — *the literal `'Transform'` is asserted against this list in `node-type.test.ts`'s
   W109 suite* — and `BUILT_IN_NODE_TYPES` appeared in that file only inside a COMMENT. Adding a second
   built-in cost **0** at `npm test`, because all five censuses derive their expectation from the thing
   under test. *A compensating binding cited in five places and present in none* — and it is the second
   occurrence in consecutive items of a citation resolving to nothing, after W108's five files citing a
   stop-and-ask list that existed nowhere. [Q453](../questions/q453.md).
7. **ONE OF MY OWN TESTS PASSED FOR THE WRONG REASON and I caught it before the readers.** The
   `unchecked` claim first ran against `spec/examples/registry.json`, where **nothing declares a
   schema** — so *every arc leaving a transform-only node is unchecked* was true of every arc in the
   document and said nothing about the node. Re-pointed at the wiring corpus with a CONTROL proving the
   verdict is attributable; the adequacy reader then confirmed the control discriminates (there is a
   tree on which the claim passes and the control fails), which it records as the one thing in this item
   that passes v0.22's test cleanly.
8. **BOTH GRADER CONTROLS came back SURVIVED on their first outing, exactly as W108's did** — and for
   the same reason, that the EDITS did not do what they claimed: `check:spec` reads `spec/` as TEXT and
   never imports `validate.ts`, so a throw placed there never ran; and renaming a link's TEXT leaves its
   TARGET alone, which is all `C5` resolves. *A controlled grader finds its own controls wrong before it
   grades anything else.* Replaced by a throw in a module the RUNNER imports and a `C8` break the probe
   does not name; both then produced CRASH and WRONG-REASON on every pass.
9. **I EXECUTED the rule-8 harness by accident while both readers were reading.** Importing it to count
   its probes RAN it, because the driving code sat at module top level; the killed run left probe `e3`'s
   edit applied, which the harness's own undo could not reach because undo and digest are both about a
   probe that RETURNS — [Q323](../questions/q323.md)'s shape, W77's incident. Found by diffing the tree
   against a reader's byte copy, restored from it, digest back to its starting value exactly. The
   driving code sits behind a MAIN GUARD now and the declarations are in their own file. *A harness
   whose declarations cannot be read without running it is a harness that will be run by accident.*
10. **Pass 1 graded TWENTY-TWO correct probes WRONG-REASON, and the cause was the GRADER's window.**
    This tree prints a failure THREE ways — `    FAIL  <test name>` inline, a trailing DETAIL section
    headed `  <suite> › <test>` carrying the assertion's own message, and a check's `  C4: <message>`
    on one line — and the first grader read the first and third. So a `says` taken from an assertion
    MESSAGE could never match on a `test` rung, however right the probe was. *P23's retro set this
    window by measuring it in the other direction (a four-line window grading 28 of 35 catches on a
    block that never ran); what this adds is that the window is not a LENGTH but an enumeration of the
    runner's output SHAPES, and a missing shape is indistinguishable in the report from a wrong `says`.*
    [Q452](../questions/q452.md).
11. **`nodeTypesOf`'s two claims were unobserved and my own comment over-claimed about one.** The
    adequacy reader's R1 — making the built-in LOSE the merge — survived at zero, and so did the
    author's own `d1`, which PREPENDS them. Measured: prepending is INERT, because `bootstrap` filters
    by name into three loops of its own, so pool-creation order is that function's and not this map's —
    while the comment here said this map's order IS pool-creation order. Both closed by one case
    asserting the tie-break AND the position, reachable because `validateDefinition` takes a `Registry`
    straight from a consumer and so sits outside `checkRegistry`'s refusal.
12. **Rule 7 (b) refused two of the four `X6` probes this item added**, for anchors that matched
    nothing — the mutations were written from the table I had meant to write rather than the one
    `AGENTS.md` carries. Re-anchored from the real text and all four verified firing, each with the
    right message, through the override the self-test itself uses rather than by paying that 600 s lane
    a second time.
13. **`X6`'s own new clause went red on its FIRST run, on a real disagreement**: the spec's v0.28
    paragraph carried `1.93x` alone where `AGENTS.md` carried all four figures. That is a LIVE case for
    a check written for a defect a reader had just measured at EXIT 0 — the opposite of rule 8's *a
    check written for a defect you just fixed has no live case*.
14. **`check-docs-selftest.mjs`'s own site census was stale by FIVE before this item**, which added
    four more: it read *55 across eleven ids* with `X6` at 5, `X8` at 9 and `X10` at 4, where the tree
    holds **64** with 10, 11 and 6. Re-derived by the `grep` that sentence names. *A count in a comment
    beside the list it describes, which the paragraph above it records as having been wrong at W29, and
    which nothing compares.* [Q454](../questions/q454.md).
15. **The overlap list is stale by FOUR and W108's published ordinal is short by three.**
    `doc/workflow.md` section 6's list holds **65** entries and ends at W101; **W104, W105, W107 and
    W108** each took a measurement and none is in it, because only a RETRO appends and three of the four
    are items outside any plan — which is the defect that list records at P19's retro, now at its second
    occurrence with downstream consequence. W108 derived *the sixty-sixth* by adding one to the
    headline. **W109's is the SEVENTIETH**, derived by counting the list and reading the four item
    files, never from an index.
16. **The P17 quotation four documents carry is literally P14's.** *"the workaround ADR 0040 exists to
    remove"* occurs in P14, P22, the register and P26, and **nowhere in P17**: P17 says *"a reshaping
    `task` node: a worker whose whole job is to rename keys, which ADR 0040 exists to remove"* and,
    separately, *"the reshaping node is the library's own workaround"*. The substance was faithful and
    the verbatim was stitched from two sentences. Re-quoted in the ADR and the spec.
17. **A SIXTH copy of the refusal id range, which my own census missed** — `src/definition/types.ts`'s
    `Finding.rule` doc comment, a line **W108 moved one commit earlier**, in a file this item declared
    as an exception and edited. The census said *five copies, three files, two checks*; it is SIX, and
    nothing reaches the sixth.
18. **Two normative documents pointed readers at `test/scheduler/envelope.test.ts`, which does not
    exist** — this item's own `Owns` block carried the wrong name and is where the spec's row got it.
    The real-pool suite is `test/scheduler/transform.test.ts`. Both readers found it; nothing catches
    it, a code span being outside `C5`. *The `Owns` audit had nothing to run against for that path,
    which is what `Owns` is read for.*
19. **ADR 0075 rule 2's *one question in one way in six places* is false in fact**: `onlyTransforms` has
    exactly **TWO** call sites, and `derivePool`, `bootstrap`, `poolOptionsOf` and `schemaOf` each write
    `worker === undefined` inline. The question generalises; one expression does not — and the fixture
    that discriminates the PROPERTY from a NAME test is a worker-less type that is NOT the built-in,
    which no fixture had and the validator road admits.
20. **`FD-V32`'s rule row was byte-unchanged while the v0.28 paragraph said it had gained an
    exemption** — and it also stated the WITHDRAWN *absent `nodeTypes` means EMPTY* reading in the
    present tense, in the one row the paragraph names as having changed. Its *no node types* arm can
    never render and is deleted. Section 3's `type` row was stale the same way, **while `AGENTS.md`'s
    twin had been corrected** — the source of truth behind the consumer reference, which is
    `spec/README.md` rule 4's inverse.
21. **`schemaOfValue`'s *and no narrower* is false**: `{ const: 7 }` is in the subset, `7` satisfies it
    and `8` does not. The function is a sound shape inference and the superlative was the wrong word.
22. **The threaded backend was unobserved for the new arm**, because `DROVE` is module-level and the
    clause reading it lives in the W61 suite, whose cases drive both modes first. Narrowing W109's loop
    cost 0. A W109-local set closes it — and threaded is the ONLY road on which the pool config crosses
    a `structuredClone` into a thread, which is the reason the marker's own doc comment gives for
    omitting a key rather than setting it `undefined`.
23. **Two probes came back CRASH rather than CAUGHT, and neither is a defect**: widening `FD-V46`, and
    giving the built-in a worker, each make a MODULE-SCOPE fixture refuse, so the runner dies at import
    with zero named failures — [Q448](../questions/q448.md)'s class, W108's own finding. Declared as
    crashes, with the clause each breaks covered by a probe that fails normally.
24. **Two of my own probes were mis-declared and the pass said so**: `x7` named `check:spec` where `C4`
    only requires the fixture FILE to exist — what asserts it VIOLATES its named rule is the L4 corpus
    loop, at `npm test`; and `R-adqP7` guarded ONE case where the helper is called from three, so the
    others still recorded the backend it meant to remove. *A probe narrower than the thing it provokes
    survives for a reason that is about the probe.*
25. **One declared ceiling was a CATCH**: `consumerPools` admitting every pool costs 5 failures, so
    `runtime.test.ts`'s subtraction IS bound by the two pool-count cases that read through it.
26. Two python heredocs had their escaping collapse — one produced `/\/g` in a regex, caught by
    `node --check`, and one matched nothing, caught by an assertion demanding exactly one anchor. *My
    own discipline rule, broken twice in one session, both times by a shell rather than by me.*
27. **Obligation (f) has no instance here, and that is MEASURED rather than assumed** — confirmed
    independently by the adequacy reader (F14): every real-pool case drives ONE task per `drive()` call
    on `maxThreads: 1`, settled serially, and no assertion names a completion order, so there is no
    worker whose timing a row leaves unarranged.

28. **THE CONFIRMING GATE WENT RED AT L0 WITH ZERO `FAIL` LINES, and the residue was the design
    correction's own.** `deno lint`: `BUILT_INS is never used` in `test/definition/registry.test.ts`.
    That derivation existed to WIDEN this suite's pool and type expectation sets while the built-ins
    were being STORED; finding 3 reverted the storing, the sets went back to their pre-item values,
    and the derivation was left standing — **with a twelve-line comment above it still claiming it was
    added to them**, which is the worse half, because the comment is what a reader would have believed.
    **It cost ZERO at `npm test`** (1512 either way) and zero at all five typecheck lanes, because an
    unused `const` is not a type error; **only L0 could see it**, and `lint` is the chain's FIRST entry
    since [ADR 0039](../decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md),
    so `npm run gate` stopped at entry one and the fourteen rungs above it never ran. Replaced by a
    note recording why these sets are UNMOVED — *`ResolvedRegistry` stores a built-in node type no more
    than it stores a gate type* — which is the design correction stated at the one place a widening
    would have hidden it. **This is the recorded class at its fourth occurrence** (W50, W42 twice,
    W92): a rung reported green from something other than its exit code, except that here it was not
    read at all — the Record's own row said *EXIT 0 on the final tree* for a gate that predated the
    record step's edits, which is v0.12's *a measured number is re-taken on the tree the item ships*
    about a VERDICT rather than a number. *A gate paid for before the last edit is not a confirming
    gate, and the only thing that distinguishes the two is whether you ran it after you stopped
    typing.*

**What this taught.** Five things for P26's retro:

- **A MARKER is a protocol between two modules, and a cast is what hides it.** `transformOnly` is
  written in `registry.ts` and read in `envelope-worker.ts`, and the object that carries it is
  `as WorkerManagerOptions` — so renaming it is free at L0 and free at L1-L5, and the consuming side's
  own test probes the arm from a config a HUMAN typed. Obligation (e)'s third shape is *a list is a
  claim about another list*; this is one KEY NAME as a claim about another, with the typechecker
  deliberately turned off between them. [Q451](../questions/q451.md).
- **A GRADER's window is an enumeration of the runner's output shapes, not a length.** Twenty-two
  correct probes read WRONG-REASON because the grader could not see the section where this runner
  prints an assertion's message. v0.24's clause asks for a controlled grader and both my controls were
  right throughout — *a controlled grader proves the grader can say CRASH and WRONG-REASON, and says
  nothing about whether it can FIND the reason.* [Q452](../questions/q452.md).
- **The right design was the precedent the ADR already cited, and I had to break eighty tests to see
  it.** ADR 0075 rule 5 cites the gate types, and `ResolvedRegistry` has no `gateTypes` field at all;
  the first cut merged at read AND stored, which is half the precedent. *A decision that names its
  precedent is not thereby following it*, and what found the gap was a clause added for a reader's
  finding rather than any reading of either document.
- **An EXPIRED claim and a STALE list, in the same pass, both about this item's own place in a
  sequence**: `CLAUDE.md` carried *W109 is next* and `doc/workflow.md`'s overlap list was four short,
  so the item's ordinal could not be read off either. Both are the recorded classes — section 1 rule
  5's third direction and P19's retro's *only a retro appends* — and both bit in one item.
- **A gate paid for before the last edit is not a confirming gate.** This item's Record carried
  *`npm run gate` RAN, EXIT 0, zero FAIL lines — on the final tree* while the record step was still
  being written, and the gate run after the typing stopped came back **`EXIT 1` at entry one with zero
  `FAIL` lines**, on residue the design correction left and that cost ZERO at `npm test` and at all
  five typecheck lanes. The two mechanisms this document already has both point at it from one side —
  v0.12 says a measured NUMBER is re-taken on the tree the item ships, and v0.15 says a rung reported
  green means its command EXITED 0 — and neither reaches a VERDICT recorded in advance of the edits it
  is a verdict on. *The content digest is the thing that can see it: a gate's verdict belongs to the
  digest it ran against, and this item's Record now names that digest at both ends.* Finding 28.

**Questions raised.** [Q451](../questions/q451.md) (a marker is a protocol between two modules and a
cast hides it from the typechecker), [Q452](../questions/q452.md) (a rule-8 grader's failure window is
an enumeration of output shapes, and a missing shape reads as a wrong `says`),
[Q453](../questions/q453.md) (a compensating binding cited in N files and present in none — the second
occurrence in consecutive items), [Q454](../questions/q454.md) (a check's self-test carries a count of
its own subject's sites and nothing compares them). **Q455 reserved and UNUSED.**

**Census CONFIRMED 346 / 270 / 1 / 75, derived TWO ways and validated against the COMMITTED
BASELINE.** The row count and the id SEQUENCE agree at 346 (Q1 … Q454, 108 gaps, zero duplicate live
rows), and the three live statuses sum to the 340 live rows. **The parser ABORTS on exactly one row it
cannot classify — `Q87`, which spans EIGHT lines**, so a line-based reader sees only its first and
misses the status cell; read by hand it is `open`. Run against `HEAD` the same parser gives
**342 / 266 / 1 / 74** where W108's committed headline says **342 / 267 / 1 / 74**, and Q87 is the
whole of the difference — so the baseline reproduces EXACTLY once that one row is counted, which is
what says the +4 / +3 / 0 / +1 above is arithmetic rather than a coincidence. *(The register's
convention, which no document states and W108 recorded: *resolved* is the Resolved TABLE's row count
and not the live rows marked resolved — **75 against 69** here — and *questions* is the live rows plus
the six ids that appear only in that table.)* [Q445](../questions/q445.md)
**RESOLVED** by ADR 0075; [Q446](../questions/q446.md) deliberately NOT closed, and `sampledOutput`
returns the residue so it cannot be read as closed.
