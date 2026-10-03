# ADR 0075 — A node that only transforms is a built-in type with no inner worker

```
Status:   accepted
Date:     2026-10-02
Item:     W109 (doc/work-items/w109-a-node-that-only-transforms.md)
Plan:     P26 (doc/plans/p26-what-a-flow-can-say-without-code.md) — decision 4 and decision 5
Spec:     spec/flow-definition.md v0.28 — the built-in type, and FD-V46
Answers:  Q445. Q446 is the residue it does NOT close.
```

## Context

**A flow document could not say *reshape this value* without code.** A node that only transforms had to
be written as a worker MODULE, a worker ENTRY and a node TYPE — three things in two places, one of them
TypeScript — even though `src/scheduler/envelope-worker.ts`, the script every typed pool already loads,
does the reshaping and has since
[ADR 0051](0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md).
With [ADR 0074](0074-a-predicate-is-a-registered-name-or-a-declared-comparison-over-the-context.md) that
was the second half of what a UI needs: a document that says both *which way* and *what shape*.

**The library shipped three group types and one gate type and NO node type** (P26 fact 3, re-taken at
W109's declaration step: `BUILT_IN_GROUP_TYPES`, `BUILT_IN_GATE_TYPES`, and `BUILT_IN_NODE_TYPES` at zero
occurrences in code).

**Five facts decided the shape, each measured at W109's declaration step rather than inherited:**

1. **The envelope's nullable `inner` is a LIFECYCLE state and not an arm.** P26 fact 4 reads *so no inner
   worker is an arm in a file that exists*; measured, `setup()` with no `worker` in the pool config
   THROWS *the pool config names no worker URL*, and `run()` with `inner === null` THROWS *run() before
   setup()*. Both have refused by name since v0.17. **The arm had to be built**, and the field's type
   merely did not stand in the way.
2. **THREE layers refuse a worker-less type**, and all three refuse by name: `validateDefinition`
   (`FD-V32`'s second clause), `resolveRegistry` (`WorkerMissing`, two clauses), and `checkWiring`'s
   `schemaOf`, whose `unchecked` reason read *worker "&lt;envelope&gt;" of type "Transform" is not in the
   registry* — a reason that sends an author to the registry to add a worker the type is defined not to
   have. Three more take the worker as required: `derivePool`, `poolOptionsOf` and `bootstrap`.
3. **The collision clause does not reach a built-in.** The only node-type collision test compares
   `code`'s classes against the document's `nodeTypes`; measured, both roads accepted the name
   `Transform`. **Node types become the FIRST kind here with THREE namespaces** — group types and gate
   types each have two.
4. **A built-in JSONata type would turn `S14` red and ship a 242 KB engine to every consumer** (P26
   fact 5, confirmed: `S14` fails any published file outside `src/jsonata/**` that reaches the engine
   under any specifier form).
5. **`createRuntime` needs `flows` for a transforming type and a transform-only type always
   transforms.** Without `flows` it refuses at `start` with `LanguageNotBuilt` naming the type — found
   as the second error W109's cost harness hit, and a seam this type reaches by construction where an
   ordinary type reaches it only if some node happens to declare a transform.

## Decision

1. **The three tiers, and this type is the third.** A computation belongs at the cheapest tier that can
   hold it:

   | tier | where the computation goes | what it costs |
   |---|---|---|
   | **1 — SELECTION** | `needs` on the consuming node | **no task at all.** The driver composes the value; `FD-C1`'s references are resolved in the same turn |
   | **2 — COMPUTATION feeding a worker** | `transform` on that worker's own node | **no extra task.** The type's worker wrapper evaluates it where the task already runs (ADR 0051) |
   | **3 — COMPUTATION with no consuming node** | a node of this type | **a real task**: see rule 7 |

   **This REINTRODUCES a shape two decisions removed, and that is stated rather than left to be
   discovered.** [P17](../plans/p17-what-a-node-may-do-to-its-input-before-its-worker-sees-it.md)'s
   declaration calls it *"a **reshaping `task` node**: a worker whose whole job is to rename keys, which
   [ADR 0040](0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
   exists to remove"*, and separately *"the reshaping node is the library's own workaround"*; ADR 0051
   exists to remove the other half. *(This cited the phrase *the workaround ADR 0040 exists to remove* as
   P17's verbatim. That exact string occurs in P14, P22, the register and P26 — and **nowhere in P17**:
   it is stitched from P17's two sentences and is literally P14's. The substance is faithful and the
   quotation was not. W109's conformity reader, 13.)* It is legitimate as an ESCAPE HATCH
   and wrong as a default, and without the rule above a UI emits a dispatch where a `transform` or a
   `needs` would have cost nothing.

2. **A node type that only transforms is one that names NO worker, and only a built-in may be one.** The
   test is the PROPERTY — *does this type name a worker* — and not a comparison against a list of
   built-in names, so the same question is asked at every layer. **`onlyTransforms` has TWO call sites**,
   `FD-V32` and `FD-V46`; `derivePool`, `bootstrap`, `poolOptionsOf` and `schemaOf` each write
   `worker === undefined` inline, and `checkNodeTypeShape` and the pool loops compare the NAME, which is
   the exemption rule 5 needs rather than the property. *(This said *one question is asked in one way in
   six places*, which is false in fact: W109's conformity reader (7) counted the call sites and its
   adequacy reader (F5) substituted a name test at both for ZERO. The question generalises; one
   expression does not, and the fixture that discriminates the two is a worker-less type that is NOT the
   built-in — which the validator road admits and `test/definition/node-type.test.ts` now carries.)* **What keeps a consumer's typo from becoming a feature is `checkNodeTypeShape`**: a
   consumer's type with no `worker` is still `WorkerMissing`, and its message names the built-in that
   does only transform. *An omitted key read as a declared shape is how a typo becomes a silent
   identity node, and this clause is the only thing between the two readings.*

3. **`BUILT_IN_NODE_TYPES` has one member, `Transform`, and its whole definition is that it names
   nothing.** No `worker`, no `config` (there is no constructor to hand one to), no `inline` (the
   scheduler's default, as an absent one always means), no `groups`, no `retryPolicy`.

   > **This rule's last sentence read *a consumer who wants any of those declares a named pool
   > INSTANCE of it, or a `retryPolicy` on the node*, and W110's declaration step measured it wrong in
   > TWO ways.** First, the road itself: `checkRegistry` — what `new Driver` runs — ACCEPTED a named
   > instance of `Transform`, while `resolveRegistry`, which is what `createRuntime` runs, refused it
   > `PoolTypeMissing: pool "reshape-big" names type "Transform", which is not a node type`, **a
   > message false against `nodeTypesOf`, which returns it.** The two roads disagreed about one
   > document — W109's finding 2's class one rule along and in the opposite direction, the runtime
   > road being too STRICT where the validator road had been too lenient. **The maintainer's answer to
   > W110's stop-and-ask (b) was to fix the code, AGAINST that item's recommendation**: the named-pool
   > loop resolves its `type` against a MERGED map now, the built-ins are STORED nowhere still (rule 5
   > is untouched), and `bootstrap`'s own named-instance loop already read the merged map after W109's
   > repair. Measured: zero cost at L1-L5 — it is a widening — so the clause is bound by
   > `test/definition/registry.test.ts`'s own case on BOTH roads rather than by the suite's count.
   >
   > **Second, and NOT fixed: of the four absences above, a named instance reaches exactly ONE.**
   > `INSTANCE_KEYS` is `['type', 'config']`, so measured one at a time: `config` **ACCEPTED**;
   > `inline`, `groups`, `pool` and `retryPolicy` each `UndeclaredKey: pool "reshape-big" carries
   > undeclared key "…"; it declares type, config`. A `retryPolicy` on the NODE does work, as the
   > sentence separately said. **So `inline` and `groups` are reachable by NO road a consumer can
   > write** — and the only other road, declaring their own worker-less type, is `WorkerMissing` by
   > rule 2, deliberately. A transform-only node runs in the scheduler's default realm and holds no
   > resource group, and nothing a consumer writes changes that. [Q457](../open-questions.md).

   **`FD-V46`** refuses a node of such a type that declares no `transform`, because the alternative is
   an expensive identity — P26 decision 5 (b), and its own id rather than a clause of `FD-V37` on
   `FD-V28`'s stated precedent that a different fix earns a different id.

4. **It names a LANGUAGE nowhere.** `lang` is the NODE's, exactly as `transform` has been since ADR
   0051, so the adapter stays the consumer's and **ADR 0052 rule 4 is untouched**: the runtime imports
   no engine, and a consumer who never transforms pays for none. The type is free; the engine is the
   consumer's. The pool config carries `transformOnly: true` and the language urls, written by
   `poolOptionsOf`; **the MARKER is written rather than the absence of `worker` left to speak**, because
   an absent `worker` is also what a malformed config has and `setup()` has refused that by name since
   v0.17. A config carrying both is refused rather than resolved.

5. **The built-ins are merged at every READ and STORED in no registry, and a collision is REFUSED on
   every road.** `nodeTypesOf` merges them exactly as `gateTypesOf` merges the gate types, so a flow may
   name `Transform` against a registry that declares no `nodeTypes` at all — which is what lets the
   document a UI emits carry a reshaping step without carrying a node type for it. **`ResolvedRegistry`
   does not carry them**, and that is the gate-type precedent read exactly: it has no `gateTypes` field
   at all. *(They were seeded into `resolveRegistry`'s output first, and it is a measurement that says
   why not: `checkRegistry` runs on BOTH a raw registry and a resolved one, so with the built-ins stored
   it could not tell a consumer's collision from the library's own entry and refused 80 of this
   repository's own tests. Their POOLS are still built — by `bootstrap`, which reads through
   `nodeTypesOf` and therefore sees them.)*

   A name colliding with a built-in, from the document or from `code`, is `NameCollision` — and so is one
   handed straight to `checkRegistry`, which is the road a hand-built `Driver` takes. *(That third road
   did not refuse at first, and **both of W109's readers found it from opposite ends** — the pair's
   shared subject: a consumer's worker-backed `Transform` validated with ZERO findings and constructed,
   `nodeTypesOf` replacing the VALUE and keeping the key, so their definition was discarded in silence
   and their worker would never have run. `checkGateTypes` had refused the gate-type case on that same
   road since W92, which is what *the third kind now agrees with both* claimed and did not have;
   `nodeTypeCollisions` was exported and called by nothing.)*

   **The built-ins come LAST in the map and their pools are built LAST**, which is not cosmetic:
   a type's name is its default pool instance's key (ADR 0054), so this order is pool-creation order,
   and appending means **adding a built-in node type never renumbers a consumer's pools**. Measured at
   W109's build: prepending moved every consumer's pool one position along, which anything reading a
   pool by position can see.

6. **A transform-only node's output is SAMPLED and never declared.** `sampledOutput` in
   `src/definition/assist.ts` gives an author the shape the node emits, the sample it came from, and the
   verdicts on the arcs LEAVING it — which are still `unchecked`. **A transform that FAILED emitted
   nothing, so it gets no schema**: the failure and the value it was handed are reported instead.
   *(It selected on the sample's `result` alone, and `WiringSample.result` is documented as *what it
   produced, OR THE FAILURE'S MESSAGE* — so on `transform-fails` it returned the shape of the error
   TEXT as the node's output, `{ type: 'string' }` for a thrown message, to the authoring UI this
   function exists for. W109's conformity reader, 4: the one case the item's own *this is the claim
   easiest to make falsely* note did not guard.)* It is a WIRING of `tryTransform` and
   computes nothing of its own: `checkWiring` already runs the transform on the producer's sample,
   already puts the result in `WiringSample.result`, and already says *the transform ran and nothing
   holds its result* (measured). What was missing was a function that asks the question an AUTHOR asks.

7. **What a tier-three node costs, measured rather than asserted.** Two arms over one `map` computing
   the same N values, on a real `FyflowScheduler`, warmed up, median of three, counts asserted steady
   across repeats and identical at N = 4, 32 and 128:

   **Per item: +1 dispatch, +4 CLONES, +2 log records.** The four clones are named —
   `listener.ts` `normalizeEvent` (`OR-R2`'s own), `driver.ts` `freezeInput` (the clone `runtime.start`
   installs on every run, which is [Q320](../open-questions.md)'s and is paid again), `driver.ts`
   `advance` (the edge hop) and `driver.ts` `dispatch` (the extra envelope's `settings`).

   | pool mode | N = 4 | N = 32 | N = 128 |
   |---|---|---|---|
   | **inline** | 1.26x | 1.73x | **1.93x** |
   | **threaded** | 1.50x | 1.46x | **1.47x** |

   **The two pool modes answer differently.** Inline the ratio RISES toward the 2x that doubling the
   task count predicts, because there the driver's own work IS the cost; threaded it is FLAT, because a
   thread pool's per-task cost is dominated by what it amortises. *P26 decision 4 cites W34's 2207 ms at
   N = 1000; that measured a clone per BRANCH over a 117 KiB payload and is a different quantity, which
   is why this item was told to measure rather than cite it.*

## Alternatives

| | why not |
|---|---|
| **a built-in JSONata type** | fact 4: `S14` red, a 242 KB engine in every consumer's install, ADR 0052 rule 4 broken. The type names a LANGUAGE and imports nothing |
| **contribute a `BUILT_IN_WORKERS` entry whose url is the envelope's** | zero edits to the three layers of fact 2 — and `ENVELOPE_WORKER_URL` lives on the scheduler side where `src/definition/` may not reach, and the field would name the POOL's script as if it were the inner worker, which is false. W109's stop-and-ask (a) |
| **give it a real identity inner worker** | zero edits again, and it reintroduces the expensive identity decision 3 refuses, paying an extra inner `run()` per task |
| **let a CONSUMER declare a worker-less type** | strictly more general and it costs the one thing that matters: an omitted `worker` becomes a transform-only type instead of a refusal. See rule 2 |
| **build the built-in's pool only when a flow names it** | measured: a `WorkerManager` that never receives a task spawns **ZERO threads** and `createRuntime` is ~3 ms with it, so the saving is nothing — and `FD-V32`'s *a registered type with no POOL of its name* clause was retired at v0.19, so a type with no pool would be a SILENT failure. The dearer-looking road is the one that cannot fail quietly |
| **infer the output schema and declare it** | a sample is evidence about one input and `fits` is a claim about every input. Rule 6 reports the residue instead; see below |
| **store the built-ins in `ResolvedRegistry`** | measured: `checkRegistry` runs on a raw registry AND on a resolved one, so with them stored it cannot tell a consumer's collision from the library's own entry — **80 of this repository's own tests refused**. `ResolvedRegistry` has no `gateTypes` field either, which is the same answer one kind over (rule 5) |

## Consequences

1. **Every registry READS one more node type, and every runtime builds one more pool.** A consumer who
   never names `Transform` has a `WorkerManager` for it that spawns no thread (measured: zero threads
   before construction, after it, after a run and after shutdown; `createRuntime` ~3 ms). It is not in
   `ResolvedRegistry` (rule 5), so a consumer reading a resolved registry sees their own types alone —
   but anything enumerating POOLS sees it, which is why the order is defined.
2. **[Q446](../open-questions.md) is NOT closed, and rule 6 is built so that it cannot be read as
   closed.** Every arc leaving a transform-only node is `unchecked`; `sampledOutput` returns those
   verdicts beside the sampled shape so a caller reads the residue off the same value as the answer.
   P26 prediction 4 says this item does not remove it, and it does not.
3. **A `Transform` node needs `flows` passed to `createRuntime`**, because it always transforms (fact
   5). Without them `start` refuses with `LanguageNotBuilt` naming the type — loudly, which is the
   behaviour this ADR relies on rather than changes.
4. **`nodeTypesOf`'s reading MOVED**: absent `nodeTypes` was EMPTY and is now the BUILT-INS ALONE. Any
   code or test asserting *absent means no types* is false, and `FD-V32`'s detail now names the built-in
   as what IS registered — so that rule's *the registry declares no node types* arm is DELETED, because
   it can never render. `spec/flow-definition.md`'s `FD-V32` row stated the old reading in the present
   tense until W109's conformity reader (1, 14) found it, in the one row this ADR's own version
   paragraph names as having changed.
5. **The type is one member and the set is the extension point.** A second built-in node type is a new
   entry and nothing else — the property test, the collision directions, the pool ordering and the
   envelope arm are all written over the SET rather than over the name.
