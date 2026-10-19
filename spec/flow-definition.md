# spec/flow-definition — the flow definition format

**Status:** v0.45 — written by [W1](../doc/work-items/w1-the-normative-layer.md) under
[P1](../doc/plans/p1-what-satisfies-a-join.md). **v0.2** acted on the first spec-conformity pass
(ADR 0004, and `region(F)` made computable). **v0.3** acted on the second, which found that `FD-V19`
had reintroduced the v0.1 defect class under a new id — a refusal rule rejecting the valid corpus.
**v0.4** acted on the third, which found the opposite failure: a document this section could not
refuse at all. **v0.5** acted on W3's pass, which found `FD-R1` prescribing a test that cannot be constructed.
**v0.6** points `FD-R1` at `OR-R10`: *"terminates the run"* is a thing the driver does, not a throw
from a listener, which is discarded.
**v0.7 retires `FD-V15` and defines which region a node is in when it is in two**
([W20](../doc/work-items/w20-what-a-nested-region-is.md) under
[P7](../doc/plans/p7-is-a-join-transitive-over-nested-fan-out.md)): nested fan-out is expressible,
and *"a non-`end` node is in at most one region"* stops being true. **Measured before the rule was
written**: with `FD-V15` set aside, the nested example produced **no other finding** — `FD-V13`,
`FD-V19` and `FD-V22` all accept it, so this is a lift rather than a redesign.
**v0.8 adds a FIFTH node kind, `map`** ([W32](../doc/work-items/w32-what-a-map-fanout-is.md) under
[P10](../doc/plans/p10-is-fan-out-one-feature-or-two.md)), answering
[Q12](../doc/questions/q12.md) by
[ADR 0036](../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md):
**fan-out is two features over one region.** A `fanout` declares N branches known at authoring time;
a `map` declares **one** branch and a run opens N instances of it, N being known only at run time.
**Measured before the rule was written**, as v0.7 was: with `FD-V9`'s floor set aside a
**one-subgraph region** produces **no other finding** — `FD-V12`, `FD-V13`, `FD-V20` and `FD-V22`
all accept it — so the region maths is a lift rather than a redesign, and what changes is the
fan-out. **`FD-V9` is unchanged and `FD-V19` is unchanged**; `FD-V25` is the map's own rule, and
**five** rules had their text widened to name the new kind — `FD-V2`, `FD-V6`, `FD-V12`, `FD-V24`
and **`FD-V23`**. *(This read **four** and omitted `FD-V23`, whose enumeration names every kind and
so is the one rule of its family that cannot be widened by implication. The validator refused a `map`
missing `over` and a test pinned the refusal, with no rule text licensing either — `spec/README.md`
rule 4's inverse. W32's conformity reader. `FD-V17` and `FD-V21` also gained map behaviour and
genuinely needed no change, because both are stated generically.)*
**v0.9 adds `FD-R2`** ([W33](../doc/work-items/w33-a-map-at-run-time-arity.md), a declared late
exception on this document): section 2 left *"what happens when `over` names a key that is absent, or
holds something that is not an array"* to W33 by name and reserved no rule id for it. W33 built the
refusal and shipped it with no rule anywhere in `spec/`; the id is taken now, beside `FD-R1`, which is
this document's precedent for a rule about what a RUN does. **No `FD-V` changed and no node kind
changed.**

**v0.32 is [W157](../doc/work-items/w157-the-pin-moves-to-0-6-0-behaviour-unmoved.md) under [P33](../doc/plans/p33-what-a-run-does-when-a-task-ends-cancelled.md), and it moves no rule.** The scheduler pin moved, and `core/FyflowScheduler.ts` is not byte-identical at the new pin, so each UNDATED line citation into it here — a citation at the version we pin, `spec/README.md` rule 6 — is re-taken there: section 2's citation of the `optional` branch (`:894-897` and `:1130-1133` to `:1151-1154` and `:1545-1548`). The CLAIM each supports was re-read and still holds; the lines under it moved, and the file around them changed.

**v0.33 is [W159](../doc/work-items/w159-what-the-pin-adds-that-a-type-reaches.md) under [P33](../doc/plans/p33-what-a-run-does-when-a-task-ends-cancelled.md) — two pool options a type may declare, and what its worker's second argument is.** The scheduler at the pin adds two `WorkerManager` options, and the type declaration admitted neither (P33 fact 5): **`cancelGraceMs` and `messages` join the table of what a derivation returns** (section 3), held to the scheduler's own rules as P33 decision 6 says — `cancelGraceMs` a number `>= 0`, `Infinity` included; `messages` an object of `flushIntervalMs` (finite, `> 0`) and `maxBuffered` (an integer `>= 1`), each optional and each held whenever PRESENT, `messages` a PLAIN object — and refused otherwise by `DerivationRefused` or `UndeclaredKey`, as every pool field is. **And `FD-C5` gains its second argument**: the scheduler hands a task's worker a CONTEXT beside its payload — at the pin it carries `signal`, aborted on a cancel, and `emit`, the `task.message` channel (P33 fact 4) — and the envelope worker passes it through to the inner worker unchanged, as it passes its worker context to the inner constructor. That was true since v0.17 and stated nowhere, so whether an inner worker REACHES either member was asserted nowhere either. **No `FD-V` id moves, no rule is added, and no refusal class is added.** *(Why the options ride on the derivation rather than on a new field: a type's `pool` IS the `PoolSpec` minus `config` and `groups`, so a key admitted there is admitted on both forms at once, and a class can compute it.)*

**v0.35 is [W163](../doc/work-items/w163-what-start-refuses-that-the-flow-does-not-decide.md) under [P37](../doc/plans/p37-a-runtime-is-its-registry.md) — what `start` refuses that the flow does not decide.** [ADR 0097](../doc/decisions/0097-what-start-refuses-that-the-flow-does-not-decide.md), amending ADR 0096 rules 4 and 5. **Section 6 gains `FD-R6`**: a task node REACHING a group the built-in `KeyedRateLimitGroup` factory built — through its `workerGroups` or the `groups` of the pool it runs on — with no `createTask` given to `start`. That factory gives the group no `keyFrom`, so the scheduler keys each task by its `limitKey`, which nothing here sets, and throws in `addTask` for a task with none (P37 fact 1): measured, from `start` after the run id was spent, or as a run `stopped` at its second node. `runtime.check` now reports it, reading as `start` given no `createTask`, and `start` and `resume` throw it as `LimitKeyMissing`, a `RuntimeError`, before any driver is built and after the definition's own findings. **And section 3's *A runtime is its registry* states that `createRuntime` holds `defaultRetryPolicy` to `FD-V30` at construction** — until this version every `start` threw it (P37 fact 6). **No `FD-V` id moves and none is added**: the count stays 42, and `FD-R6` is the one rule added, a runtime refusal no example flow can express.

**v0.34 is [W162](../doc/work-items/w162-a-runtimes-languages-are-its-registrys-and-runtime-check.md) under [P37](../doc/plans/p37-a-runtime-is-its-registry.md) — a runtime is its registry, and `start` refuses from `runtime.check`.** [ADR 0096](../doc/decisions/0096-a-runtime-is-its-registry-and-start-refuses-from-runtime-check.md), superseding [ADR 0051](../doc/decisions/0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md) rule 4. **A language's worker half reaches EVERY typed pool** (the `transform` subsection's worker-half sentence): until this version the bootstrap helper wrote it only into the pools of a type some node of which transformed in a flow the runtime was GIVEN at construction, so a flow published later could not transform on a type no earlier flow had, and `start` refused it (`LanguageNotBuilt`, which no rule here named). Now the helper reads no flow and every pool carries every language the registry names; a flow naming one the registry does not name is `FD-V35`, as it always was. **And section 3 gains *A runtime is its registry — check, then start*:** `runtime.check(flow)` returns every finding `start` would refuse a flow on that depends on the flow and the runtime alone, and `start` and `resume` refuse from that same call. **No `FD-V` id moves, no rule is added, and no refusal class is added** — the refusal `start` throws is the one `new Driver` throws for the same findings, `InvalidDefinition`, and the one class it removes, `LanguageNotBuilt`, was the runtime's and never a rule.

**v0.36 is [W164](../doc/work-items/w164-four-annotations-in-the-schema-subset.md) under [P37](../doc/plans/p37-a-runtime-is-its-registry.md) — four annotations join the schema subset.** [ADR 0098](../doc/decisions/0098-four-annotations-join-the-schema-subset-and-constrain-nothing.md), P37 decision 4, superseding [ADR 0053](../doc/decisions/0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md) rule 3's annotation sentence, its consequence 2 and its rejected *whitelist* row, and [ADR 0056](../doc/decisions/0056-an-example-is-an-annotation-validated-against-the-schema-it-sits-on.md) consequence 4, for these four alone. Section 3's *The schema subset* admits **`title` and `description` (a string) and `readOnly` and `writeOnly` (a boolean)**: each one's value shape is checked at construction, at any depth, and a wrong one is refused as the keyword's misuse; none is read by any value check — `findings` and the wiring relation `fits` read none of them — so each CONSTRAINS NOTHING, and **`writeOnly` promises no redaction**. The subset is seventeen keywords, twelve that constrain and five that annotate, and the bar an annotation meets to join is stated beside the table: *it constrains nothing in JSON Schema itself and its value shape is checked*. `deprecated`, `$comment`, `default`, `format`, `$schema` and `$id` are still refused by name. **No rule id moves and none is added**: a malformed annotation is refused where every malformed keyword is, so the `FD-V` count stays 42 and the rule count 135. *(Until this version the table's closing paragraph listed `title` and `description` among the refused, as a consequence of the rule rather than a judgement about annotations.)*

**v0.37 is [W165](../doc/work-items/w165-pool-options-on-a-named-pool-instance.md) under [P37](../doc/plans/p37-a-runtime-is-its-registry.md) — pool options on a named pool instance.** [ADR 0099](../doc/decisions/0099-a-named-instance-of-a-document-type-may-declare-its-own-pool-options.md), P37 stop-and-ask (e) and decisions 8 and 9, amending [ADR 0054](../doc/decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md) decisions 2 and 3. Section 3's *A pool instance, and a group* gains a **`pool`** row: a named instance of a DOCUMENT type — one the document declares, or the built-in `Transform` — may declare its own pool options, the keys a type's `pool` may declare and no other, **merged SHALLOWLY over its type's**, the instance's key winning and a key present with `undefined` absent; an instance of a CLASS type carrying one is refused (`UndeclaredKey`), because a class receives the instance key and owns how its pool is built. The instance's options are held where the registry's shape is held, on both roads, and the merged spec takes the derivation's one check. **The identity derivation now COPIES `residentGroups`** as it copied `messages` and `groups` (decision 8), and *What a derivation returns* **bounds `messages.flushIntervalMs` at 2^31-1**, the scheduler's own `MAX_TIMER_MS` (decision 9; the scheduler's want is S11 in `doc/scheduler-upstream.md`, not raised). The scheduler's `idleCheckIntervalMs`, `requeueFailedTasks` and `maxWorkerRestarts` are still not admitted. **No rule id moves and none is added** — the `FD-V` count stays 42.

**v0.39 is [W169](../doc/work-items/w169-a-resident-keyed-group-is-refused-and-p37s-six-stale-sites.md) under [P34](../doc/plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md) — a built-in keyed group held RESIDENT is refused at `createRuntime`.** [Q619](../doc/questions/q619.md) option B, the maintainer's answer at P37's retro (i), and P34 decision 12. `FD-R6` (v0.35) reads a pool's `groups` and never its `residentGroups`, because the scheduler resolves no key for a resident group — and W163 measured what that leaves: a group of the built-in `KeyedRateLimitGroup` type held only as resident counts every worker of every pool holding it in ONE `""` bucket, silently, the sharing the scheduler's own throw exists to prevent. **So the resolver refuses it where the registry is read**: after every pool is derived, a pool whose DERIVED `residentGroups` — a list or a `{ key: cost }` record — names a group of the built-in keyed type is refused, `DerivationRefused`, naming the pool and the group; a type's default instance, a named instance's merged pool and a CLASS derivation's output are held alike, because the check reads the derived spec. A group a CODE group type builds is never refused, keyed or not (the factory is the consumer's, as `FD-R6` reads it), and a resident `ConcurrentLimitGroup` or `RateLimitGroup` is accepted as before. **BREAKING in 0.8.0**: a registry document that held a built-in keyed group resident built a runtime at 0.7.0 and is refused now. **No rule id moves and none is added** — the `FD-V` count stays 42 — and **no refusal class is added**: a pool the runtime refuses is `DerivationRefused`'s, beside a resident group with `idleTimeout: 0`.

**v0.40 is [W170](../doc/work-items/w170-a-transforming-task-is-not-held-at-start.md) under [P34](../doc/plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md) — a TRANSFORMING task is not held at `start`.** [ADR 0101](../doc/decisions/0101-a-transforming-task-is-not-held-at-start.md), P34 stop-and-ask (a) as the maintainer answered it (road 2 of [Q633](../doc/questions/q633.md)). `FD-R4` held the run's payload to the worker `inputSchema` of each task it reaches BEFORE that task's `transform` ran, while `FD-C5`, the wiring table and v0.38's `given` row all read `inputSchema` as what the worker receives AFTER it — so `{ word: "x" }` under `{ "label": word }` was refused by `start()` and passed by `tryTransform(…, { input })`, and `{ label: "y" }` the other way round (P34 fact 10). **A boundary target that declares a `transform` is now UNCHECKED at `start`**, as one whose worker declares no `inputSchema` always was: the value that schema holds exists only in the worker wrapper, and `start()` is synchronous. The check before a run is the caller's: `givenVerdict` — `tryTransform(…, { input })` on the node as declared — on each transforming target, with the value that task RECEIVES (the payload composed through its `needs`, and for a map's branch each element under `over`), never on a region or gate entry; at run time, the transform's own failure, and a result the schema would refuse reaches the worker unchecked. **The `resolve` boundary is unmoved.** **Not BREAKING**: a payload refused at 0.7.0 on this road is admitted, and none admitted is refused. **No rule id moves and none is added** — the `FD-V` count stays 42 — and no refusal class moves.

**v0.41 is [W171](../doc/work-items/w171-the-drivers-halt-is-renamed-halted.md) under [P34](../doc/plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md), and it moves no rule.** [ADR 0102](../doc/decisions/0102-a-run-the-driver-halts-is-halted-and-a-stored-stopped-reads-as-one.md) renames the run-level outcome a refusal ends a run with, `stopped`, to `halted` (`spec/run-state.md` v0.16), and section 2's one sentence that names it — a transform's failure never HALTS the run — names it by its new name. No rule id, refusal or count moves.

**v0.38 is [W166](../doc/work-items/w166-a-sample-the-caller-gives.md) under [P37](../doc/plans/p37-a-runtime-is-its-registry.md) — a sample the caller gives.** P37 stop-and-ask (d)'s answer and decision 10. Section 3's *What the schemas buy an author* gains **A sample the caller GIVES**: `tryTransform(…, { input })` runs a candidate transform ONCE on what the node RECEIVES — `$`, the value given, with no `needs` composed over it — and returns ONE verdict whatever arcs reach the node, **the ENTRY node included**, which no arc reaches and which had no verdict at all (P37 fact 4). The verdict's shape is **`given`** — a sixth row of the arc table, which says it is NOT an arc and that `checkWiring` never produces it — it has **no producer**, and its sample's source is **`'given'`**: held to the consumer's `inputSchema` as an arc's sample is, `transform-passes` or `transform-fails` with the finding, and an expression that throws `transform-fails` as today; with no transform to run, `unchecked`. A given value never reaches the two places a region's or a composition's sample source is AGGREGATED from its parts, so it is never reported as `'example'` or `'witness'`. **BREAKING in 0.8.0**, as P37 decision 10 requires it be stated: `SampleSource` and `WiringShape` each gain a value and `WiringVerdict.producer` is optional. **New public surface**, stated as such: `TryTransformOptions` and the root export `givenVerdict`, which is `tryTransform` on the node as declared and holds `undefined` to no input as it does. **No rule id moves and none is added** — the `FD-V` count stays 42.

**v0.10 is [W34](../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md) under
[P10](../doc/plans/p10-is-fan-out-one-feature-or-two.md), and it is the OTHER of section 2's two
questions addressed to an item by name.** [ADR 0037](../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
answers *what `over` is a key on* and *what each map instance receives*; section 3 gains **what an
ordinary edge carries**, which no document in `spec/` had ever stated, and section 4's
*"what each receives is W33's and W34's"* sentence gains its answer. **No rule id is taken here and
that is deliberate**: this document has `FD-V*` for a validation rule and `FD-R*` for a runtime
refusal and **no prefix for a rule about what a run CARRIES** ([Q164](../doc/questions/q164.md)), and
`scripts/check-spec.mjs`'s `RULE_ID` is a closed list of eight prefixes, so an invented one would be
invisible to `C2` and `C6` — a rule declared, cited and checked by nothing. *(**v0.11 takes the
prefix**, which is what Q164's row called its forcing condition. `JP-R11` and `JP-R12` keep their ids
— section 3 of `doc/workflow.md`, ids are never renumbered — and the sentence above stays as the
record of why they are where they are.)* The rules are `JP-R11` and
`JP-R12` in [spec/join-policy.md](join-policy.md) section 4, whose owner table already fixes what the
driver does at both ends of a region. **No `FD-V` changed, no `FD-R` changed and no node kind
changed.**

**v0.11 answers [Q11](../doc/questions/q11.md) IN GENERAL**
([W41](../doc/work-items/w41-what-a-node-can-reach-and-what-names-it.md) under
[P12](../doc/plans/p12-what-a-node-receives-and-what-a-decision-sees.md)), by
[ADR 0040](../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md):
**what a node can reach is the run's own outputs, and a node id names them relative to a branch
path.** Section 3 gains **`needs`** — an optional declared mapping on a `task` or a `map` — and with
it the two rules this document had no prefix for. **[Q164](../doc/questions/q164.md) is RESOLVED and
`FD-C*` is the third prefix**: `FD-V` is a rule about what a DOCUMENT may say, `FD-R` is a rule about
what a RUN refuses, and `FD-C` is a rule about **what a run CARRIES** — which v0.10 wrote as prose
with no id at all, because there was no prefix and `scripts/check-spec.mjs`'s `RULE_ID` is a closed
list. **Measured before the prefix was taken**: a rule declared as `FD-C1` and cited in this document
is reported by `check-spec` as *8 checks ok, 80 rules* — not counted, not checked for uniqueness, not
checked for an owner. *A rule declared, cited and checked by nothing*, exactly as Q164's row said.
**Three `FD-V` are added and none is changed**: `FD-V26`, `FD-V27` and `FD-V28` are `needs`' own
rules, and *"only a `task` or a `map` may carry it"* is deliberately **not** among them, because
`FD-V17` already refuses an undeclared key and names the kind. **`JP-R11` and `JP-R12` are NOT
reopened** (P12 decision 3) and **no node kind is added** (P12 decision 4).

**v0.12 answers [Q8](../doc/questions/q8.md)**
([W42](../doc/work-items/w42-what-a-decision-sees.md) under
[P12](../doc/plans/p12-what-a-node-receives-and-what-a-decision-sees.md)), by
[ADR 0041](../doc/decisions/0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md):
**a decision sees its node's effective outcome and whatever its OWN EDGE declares.** `FD-C3` is the
rule and an **edge** may carry `needs` — the same grammar and the same aiming rules as a node's,
**minus the `"."` form**, which `FD-V26` refuses there because *what a predicate would have received
anyway* is `ctx.outcome` and it already has it. **[P12](../doc/plans/p12-what-a-node-receives-and-what-a-decision-sees.md)
prediction 3 said Q8 would need no ADR and it REVERSED**, on one measurement: a node's payload is
**not derivable from the log at routing time** — the **entry** node's payload is `start(payload)` and
appears in **no record at all**, and for every other node a derivation would re-implement `compose`,
`JP-R11` and `JP-R12` at a second site, which
[ADR 0040](../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
rule 2 refuses by name. *(This read *"on a diamond … choosing which supplied the payload needs append
order"*, and W42's conformity reader derived the diamond in one expression with no append order at
all — drop any settled predecessor another settled one is reachable from, and `FD-V19` makes the
survivor unique. **The conclusion held and its stated reason did not.**)* **So a predicate cannot be handed
*what its node received* without retaining a payload per dispatched node**, and it does not need to
be: the references resolve from the same projection with no new state. **No node kind changed, no
`FD-V` changed** — `FD-V26`, `FD-V27` and `FD-V28` gained a second SITE and no new clause but the
`"."` refusal — and `spec/join-policy.md` section 4 is untouched.

**v0.13 answers [Q187](../doc/questions/q187.md)**
([W45](../doc/work-items/w45-what-a-reference-must-be-able-to-say.md) under
[P13](../doc/plans/p13-when-is-a-declared-reference-refused.md)), by
[ADR 0042](../doc/decisions/0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md):
**a reference says whether it is CONDITIONAL, and the bare form means the target certainly ran.**
Section 3's reference table gains **one row** — a `?` MODIFIER on either aimed form, `"n?"` and
`["n?"]` — and section 5 gains
**`FD-V29`**, which refuses an *unconditional* reference to a node a run can reach this node without
having run. **`FD-V27` is the one rule that does NOT move**, which is the opposite of what
[Q187](../doc/questions/q187.md)'s own wording predicts: an author fixes *that node cannot have
produced anything for you* by re-pointing the reference and *it MIGHT not have* by writing `?`, and
`FD-V28`'s own stated precedent is that a different fix earns a different id.

**It is not DOMINANCE, and that is a measurement rather than a refinement.** Q187's row and
[ADR 0040](../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)'s
*what it costs* both name dominance, and P13 fact 2 measured that dominance would refuse **0 of the
6** references the two corpora write. **W45 measured what that zero is a property of**: of the
**127** references `FD-V26`/`FD-V27`/`FD-V28` admit today, plain dominance refuses **30 in 13 of
the 26** and `FD-V29` refuses **8 over 7 distinct shapes** — so **22 of the 30 are references a
correct rule accepts**, and one of them is `needs: {"a": "scoreA"}` on a node after a two-branch
join, which `FD-V28`'s own note below calls *"a valid document"*. *(These four numbers read 121 / 29 / 7 and *14 of 25 flows* until W45's conformity reader re-derived them: the probe's registry was hard-coded and did not carry `earlierWasLowConfidence`, so `FD-V4` fired on one of the two `decision-on-an-earlier-step` files and the walk silently ran over 25 files where fact 2's own row says 26. Re-taken with the registry derived PER FLOW. **22 was right**; the other four were not.)* **A dominance rule on `FD-V27` would have refused what `FD-V28` declares
legal, in this document, nine lines apart** — the third time in three versions that a rule about
references was written against the wrong half of section 4.

**And `FD-V29` REMOVES CASES from `FD-R3`'s reach rather than replacing it.** Two independent
measurements say so, both recorded with the rule and both asserted: a join policy that fires **before
a branch entry has settled** (`validateDefinition` is not given the policy — `FD-V15`'s own note, and
[Q97](../doc/questions/q97.md)), and **two `map` regions of different arity**, where `FD-V29`
answers *did it run* correctly and the reader's branch path is comparable with none of the target's.
`reference-past-a-map-arity.flow.json` was the second, in the corpus, with **no custom policy** — **and v0.15 removes it**, so `FD-R3`'s only remaining road is the policy one ([Q218](../doc/questions/q218.md)). Kept as the record of what that rule was decided against.
**No node kind is added** (P13 decision 3) and **`spec/join-policy.md` section 4 is not reopened**
(P13 decision 2, `JP-R5` read and not edited).

**v0.14 decides [Q186](../doc/questions/q186.md)**
([W46](../doc/work-items/w46-what-a-reference-costs-and-whether-anything-says-so.md) under
[P13](../doc/plans/p13-when-is-a-declared-reference-refused.md)), and **it takes no rule id and no
ADR**: section 3's cost blockquote gains the measurement, the METHOD, and the reason **nothing
warns**, on [Q190](../doc/questions/q190.md)'s precedent — recorded in this document and asserted at
ladder L2. **[P13](../doc/plans/p13-when-is-a-declared-reference-refused.md) prediction 3 said so
before the item ran and is CONFIRMED, and its stated reversal condition was checked rather than
assumed**: *a static warning about a reference into a map region* is buildable, needs no size
judgement, and is **RIGHT** — it fires on 3 of 13 corpus references and `map-with-context`'s is the
cliff itself, ~70x on the shipped document. **It is declined because it fires on every intended use
and on nothing else**, which restates the feature rather than diagnosing anything. Two of the four
reasons this note first gave were wrong and both were caught by its readers: the showcase is a true
positive, not a false one, and a **report** channel exists ([ADR 0027](../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md))
and is weighed rather than absent. **Measuring is not the obstacle** — a size measurement is ~0.03%
of what it would warn about at N = 1000. **And the numbers this document carried since v0.11 were
taken in one process, which costs up to 4.4x in ACCUMULATION and nothing in ordering** — the cliff
was robust throughout and the spread among the cheap rows never was a measurement.
**No `FD-V` changed, no `FD-R` changed, no `FD-C` changed and no node kind changed.**

**v0.15 answers [Q206](../doc/questions/q206.md)**
([W49](../doc/work-items/w49-what-a-reference-across-sibling-regions-means.md) under
[P14](../doc/plans/p14-what-a-reference-means-when-two-regions-arities-are-independent.md)), by
[ADR 0044](../doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md):
**an output is visible to a reader when their two branch paths agree on the regions that contain
BOTH of them**, and *one path is a prefix of the other* is that rule's SPECIAL CASE rather than its
predecessor. Section 3's biconditional — *a node produces more than one output for a reader exactly
when the reader is outside a `map` region containing it* — was **false for two SIBLING regions**, and
`FD-V28` was right about the number while resolution delivered a different one. It is true now.
**`FD-C1` is the rule that moves and `FD-R3` is the rule that NARROWS**: no `FD-V` changes, no node
kind changes, no rule id is added or retired, and `FD-V27`, `FD-V28` and `FD-V29` are read and not
edited. *(This read *"`FD-C1` is the one rule that moves … no `FD-R` changes"* and both halves were
false: `FD-C1`'s row was byte-identical while `FD-R3`'s was the only rule row the item had edited.
W49's conformity reader, and it is `spec/README.md` rule 4's inverse — the document claiming a rule
moved that had not, and claiming one had not moved that had.)*

**And the defect was never about a `map` and never about arity, which is a measurement rather than a
refinement.** [Q206](../doc/questions/q206.md)'s row and P14's own facts frame it as a map-arity
question because every sibling pair in both corpora is `map`/`map`. Constructed — the corpora contain
**no sibling `fanout` pair at all**, which is why nothing had seen it — a reference from branch **1**
of a second `fanout` region to branch **0** of the first validates with **zero findings**, is
`FD-V29`-certain, and **stops the run** at `FD-R3`; written in branch 0 of the same region the same
reference resolves. *There is no arity anywhere in that document, and which branch the author wrote
the reference in decided whether the run completed.* The document is built and asserted in
`test/definition/sibling-regions.test.ts`; **it joins `spec/examples/valid/` with the driver**, because
until then it is a valid document whose run stops, and a corpus flow is validated AND run.

**The DERIVATION shipped with the rule and the RESOLVER followed in W50**, which is v0.8's own
split one plan on: `sharedRegionDepth` and `outputIsVisible` are in `src/definition/regions.ts` with
their L1 cases, and `resolveReference` applies them. **For one item this document described a
predicate the driver did not yet apply, and it said so here** — v0.8 shipped a `map` node kind that
nothing dispatched for one item and made the same statement in the same place. What that bought is
two items each with its own green gate (`doc/workflow.md` section 1 rule 1); what it cost is that
five sentences across three documents said *a run still resolves by the prefix rule* and had to be
un-written the moment it stopped being true — `doc/workflow.md` section 1 rule 5's THIRD direction,
and W50's adequacy reader found all five.

**v0.16 lets a `task` node say something about its OWN TASK, in two declared keys**
([W58](../doc/work-items/w58-what-a-node-says-about-its-own-task.md) under
[P16](../doc/plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md), on that
plan's decision 3 and with **no ADR**): `retryPolicy`, the scheduler's own `{ maxRetries, backoffMs }`
passed through exactly as `optional` is, and `workerGroups`, the resource groups the task must
acquire beside its pool's. Section 2's key table gains both, section 5 gains **`FD-V30`** and
**`FD-V31`**, and the registry a definition is validated against gains a **third set, `groups`**,
because the scheduler **silently ignores an unknown group id** — measured, and re-measured with a
resource listener attached — so instantiation is the only place a typo can be caught (ADR 0002
rule 3). A driver-level `defaultRetryPolicy` applies to a node that declares none, and **the node
wins, whole**. This is [Q16](../doc/questions/q16.md)'s TASK half: a retry happens inside one task
id and lands on the outcome record's `attempts`, which a real scheduler sets non-zero at ladder L6
for the first time under this version. **`FD-V17`'s key table is the only thing that moves for an
existing document** — every corpus flow validates unchanged, and a node that declares neither key
is dispatched with the exact object it was before.
**v0.17 answers [P16](../doc/plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md)'s
question — what a node TYPE is** ([ADR 0049](../doc/decisions/0049-a-node-type-is-a-registry-entry-and-its-worker-receives-an-envelope.md),
[W59](../doc/work-items/w59-what-a-node-type-is.md)): a `task` may name a **`type`** instead of a
`workerType` and carry **`settings`**; the type is a REGISTRY entry — worker, pool, groups, config,
a settings VALIDATOR and a retry default — in a **fourth set, `nodeTypes`**, and the definition
names none of those; its pool is keyed by the type's name; and its worker receives the **envelope
`{ settings, input }`**, which is **`FD-C5`** in section 3, defining `input` as *the value this node
receives* and nothing narrower. Section 5 gains **`FD-V32`**, **`FD-V33`** and **`FD-V34`**, and
`FD-V23` learns that a task names its pool one of two ways. **A bare `workerType` node is a
degenerate type and is unchanged to the byte** — every corpus flow validates as it did and every
untyped dispatch is the object it was. So this document held **32 refusals** at that version — `FD-V1` …
`FD-V34` less `FD-V14` and `FD-V15` — and it was the number `check-spec` printed as *C4 covered 32
definition refusals*.
**v0.18 answers [P17](../doc/plans/p17-what-a-node-may-do-to-its-input-before-its-worker-sees-it.md)'s question — what a node may DO
to its input before its worker sees it** ([ADR 0051](../doc/decisions/0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md), [W61](../doc/work-items/w61-what-a-transform-is.md)): a typed `task` may declare a
**`transform`**, `{ lang, expr }` — a language named in a **fifth registry set, `languages`**, and an
expression in it — evaluated in the TYPE's worker wrapper and never in the driver, with the value the
node receives as `$` and its effective settings as `$settings`; the envelope gains the declared object
as a THIRD key, only when declared — **`FD-C6`** in section 3, with `FD-C5` unchanged. A language
adapter has TWO halves, because a function cannot cross to a thread and a URL can. Section 5 gains
**`FD-V35`**, **`FD-V36`** and **`FD-V37`**; a transform that cannot be evaluated is a TASK's failure
and never a run refusal, so **no `FD-R` is added**; a typed node declaring no transform, and every
untyped node, is dispatched to the byte as at v0.17. So this document now holds **35 refusals** —
`FD-V1` … `FD-V37` less `FD-V14` and `FD-V15` — and it was the number `check-spec` printed then as *C4
covered 35 definition refusals*.
**v0.19 is the FIRST version to take a name OFF the grammar** ([P18](../doc/plans/p18-a-flow-and-its-runtime-from-documents-alone.md),
[ADR 0053](../doc/decisions/0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md),
[ADR 0054](../doc/decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md),
[W65](../doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md)): a `task`'s
**`type` is REQUIRED and `workerType` is RETIRED** — every task node names a node type, every
worker receives the envelope, and there is no bare road; a task may name a NAMED instance of its
type in **`pool`**; and **the registry is a DOCUMENT** (section 3's registry subsection) — workers
with four JSON schemas, node types as DERIVATIONS to pool options, pool instances, group types as
factories — resolved against one `code` argument, with every defect refused at construction by a
named error. `FD-V33` reads the worker's `settingsSchema` (a schema in the built-in subset, in place
of v0.17's function) with the type's `settings` defaults merged under; **`FD-V38`** refuses a `pool`
that is not an instance of the node's type; **`FD-V5` and `FD-V34` are RETIRED with `workerType`**
— deliberately absent, their ids held — and `FD-V23`, `FD-V32` and `FD-V37` each lose the clause
that spoke of two ways to name a pool. So this document now holds **34 refusals** — `FD-V1` …
`FD-V38` less `FD-V5`, `FD-V14`, `FD-V15` and `FD-V34` — and it is the number `check-spec` prints
as *C4 covered 34 definition refusals*. **Measured before the grammar moved** (P18 fact 4): 146 of
the 166 task nodes in both corpora carried `workerType`, every one of the eleven roles they named
read its payload whole, and all 146 now name a type and receive the envelope.
**v0.20 is the FIRST deliberate extension of the schema subset, and it is an annotation**
([P19](../doc/plans/p19-what-a-schema-buys-an-author.md),
[ADR 0056](../doc/decisions/0056-an-example-is-an-annotation-validated-against-the-schema-it-sits-on.md),
[W72](../doc/work-items/w72-the-contract-an-example-beside-every-schema-and-a-worker-run-on-it.md)):
any schema may carry **`examples`**, held to the schema it sits on at construction and read by no
value check, so that a worker's declared example is a value an authoring-time tool may RUN the worker
on. **No rule id is added or retired and no `FD-V` moves** — the refusal is the registry's
`SchemaRefused`, where every other schema defect is — so this document still holds **34 refusals**.
**Measured before the rule was written** (P19 fact 6): of twelve honest output schemas an author
wrote from the corpus workers' code, ONE was wrong and the example written beside it CONFORMED to the
wrong schema; only running the worker found it, which is why `scripts/check-workers.mjs` executes a
worker on its example rather than reading its declaration.

**v0.21 is what the schemas BUY an author, and one rule about the two values no static check can
reach** ([P19](../doc/plans/p19-what-a-schema-buys-an-author.md) decisions 4, 5 and 8, [W73](../doc/work-items/w73-the-wiring-check-a-verdict-per-edge-and-two-boundaries-validated-once.md)): section 3 gains the WIRING CHECK —
`checkWiring(registry, flow)` gives every arc of a flow one of five verdicts from the workers' declared
schemas, static over the subset and sample-verified where a transform is declared — and section 6
gains **`FD-R4`**: the run's payload is held to the first task(s) it reaches at `start()`, a
person's resolution to the parked node's worker `outputSchema` at `resolve()`, once each, refused as a
REJECTED COMMAND (`BoundaryRefused`) and never as a stopped run. **No `FD-V` is added or retired**, so this
document still holds **34 refusals**. **Measured before the rule was written** (W73's declaration):
P19 fact 3's fifteen task-to-task edges were ONE shape of six a node receives, and over every shape
the shipped L6 corpus held NINE arcs that did not fit — seven on one bound, one on an undescribed
item, one a transformed record the static reading refuses — which the check found and the item corrected ([Q302](../doc/questions/q302.md)'s other
resolution: the code made to keep the bound); the subset cannot say `additionalProperties: <schema>`, so
a join record's shape is the check's own knowledge and not a keyword's; and the two boundaries cost
under a microsecond per run on every corpus payload, 0.35 ms at the walking worst case.

**v0.23 adds a SIXTH node kind, `gate` — a decision WITH MEMORY** ([P24](../doc/plans/p24-what-a-node-may-remember-across-a-runs-branches.md),
[ADR 0066](../doc/decisions/0066-a-gate-is-a-decision-with-memory-that-names-a-registered-type-and-wires-every-route-exactly-once.md), [W92](../doc/work-items/w92-what-a-gate-is.md)).
A gate routes the branch that reaches it by what the run's OTHER branches have already shown it, and
computes nothing: what leaves it is exactly what reached it. It names a registered GATE type and carries
`settings`, as a `task` names a node type; its edges name the type's ROUTES through a new edge key,
**`route`**, and an edge with no `route` carries the type's DEFAULT route. **Every route the type declares
is wired by exactly one edge**, refused at instantiation against the registry — a document alone cannot
know a type's routes. One type ships, **`distinct`**, written against the same public interface a
consumer's type is. Section 5 gains **`FD-V39`** (the type), **`FD-V40`** (its settings, and the KEY PATH
grammar P24 stop-and-ask (d) fixed) and **`FD-V41`** (the routes, and the `route` key on every edge); the
enumerations in `FD-V23` and `FD-V24` name the kind, and `FD-V21`'s example list names a gate's `type`
*(this sentence omitted `FD-V21` until W92's conformity reader)*; **`FD-V17` does not move**, because `route` is a
declared edge key and `FD-V41` owns it on every edge, `FD-V26`'s precedent for `needs`. **A gate is valid
and RUN by nothing yet**: `new Driver` refuses a flow holding one, by name, until W93 — v0.8's `map`
split, taken at construction *(true of v0.23; v0.24 runs one, below)*. **Measured before the rule was written** (W92's declaration step): the kind
added to the `FlowNode` union is ONE typecheck error, the driver's `never`, in all five lanes, while
`KINDS` taught alone made the validator THROW — a `TypeError` from `NODE_KEYS`, a `Record<string, …>`
lookup no lane can see. So this document now holds **37 refusals** — `FD-V1` … `FD-V41` less `FD-V5`,
`FD-V14`, `FD-V15` and `FD-V34` — and it is the number `check-spec` prints as *C4 covered 37 definition
refusals*.

**v0.24 RUNS a gate** ([ADR 0067](../doc/decisions/0067-a-gate-runs-in-the-driver-its-memory-is-the-drivers-and-its-decision-is-recorded.md), [W93](../doc/work-items/w93-what-a-gate-does-in-a-run.md),
P24 decisions 5-8). Section 2's gate subsection gains its run-time half — the driver evaluates a gate
synchronously where a branch ENTERS it, asks its type's `fn` with the gate's memory (one per gate per RUN,
the driver's, rebuilt by replay on resume), records the decision (`spec/run-state.md`'s `RN-R26`), and
takes the one edge wired for the returned route with what reached the gate. Section 6 gains **`FD-R5`**: a
route the type returns that it does not declare stops the run by name, `UndeclaredRoute` — the counterpart
of `FD-R1`, which no load-time check can reach. **ADR 0066 rule 7's construction refusal is LIFTED.** **No
`FD-V` moves and the refusal count stays 37**: a gate's document half is unchanged, and `FD-R4`'s text is
unchanged too — *a task the payload reaches* at `start()` is, through an entry gate, the one the gate
chooses, and what moved is the walk that computes it (below). **Measured before the rule was written**
(W93's declaration step): a gate arm prototyped in a copy of the tree, killed at every kill point and
resumed, came back identical 6 of 6 with the memory the DRIVER's — and with it kept by the PROCESS the kill
before the first decision resumed WRONG, in silence, past the stored events where `RN-R20` compares
nothing.

**v0.25 says what a ROUTE GUARANTEES** ([P25](../doc/plans/p25-what-a-route-guarantees-about-the-value-it-carries.md), [ADR 0068](../doc/decisions/0068-a-route-guarantees-what-its-type-declares-and-the-library-derives-it-from-the-key-path.md), [W99](../doc/work-items/w99-what-a-route-guarantees.md)): a gate type may declare
**`keyResolvedRoutes`**, the routes on which its KEY PATH resolved, and section 3's wiring check refines what
leaves the gate on such a route with `required` along the gate's own key path. **A gate was a flat
PASS-THROUGH until here, and that produced a `no` on a CORRECT flow** ([Q391](../doc/questions/q391.md)): the
arc through a gate was the arc INTO it, so a consumer requiring what only the taken route guarantees read
*producer does not guarantee it* while the run completed in both L6 runtimes. **It adds NO RULE ID and the
count stays 37**: a malformed `keyResolvedRoutes` is `FD-V39`'s second clause, where every other malformed
member of this interface is reported, by the one predicate `gateTypeProblem`. *A separate id was written
first and `C4` refused it by asking for a case in `spec/examples/invalid/` that cannot exist — that
corpus is a flow plus a JSON registry document, and a gate type is CODE.* The guarantee is
**PRESENCE** and not the leaf's TYPE, which is the type's own judgement and differs between types; and the
ROUTE an arc carries is the edge's or the type's `defaultRoute`, resolved through the type rather than
treated as a route of its own — because a type's default may be one it does NOT call key-resolved,
which `distinct`'s coincidence of the two hides.
**v0.26 says what a KEY PATH must SATISFY** ([W100](../doc/work-items/w100-what-a-key-path-must-satisfy.md), the
refusing half of the same ADR): a key path the arriving schema FORBIDS makes the arc leaving the gate on a
key-resolved route **`no`**, because a route can only promise that a path resolved if the path is one the
producer can emit. Two shapes forbid a step and both come from `readKeyPath`, the DRIVER's own resolution — a
step whose declared types cannot be a plain object, and a step a CLOSED object does not name — while an OPEN
producer that says nothing there forbids nothing. **Two further silences, each measured and each in the safe
direction** (v0.26, W100, its two readers independently): an ENTRY gate has no arc, so it takes no verdict of
any kind and a key path misspelled there is caught by nothing this check reports; and a container declared by
`enum` or `const` rather than by `properties` can forbid a step without the walk reading it, because the type
test reads those two keywords and the key test reads `properties` alone. **What it costs to be wrong is MEASURED rather than argued**:
on real workers a misspelled key routes EVERY branch to the unresolved route, dispatches NO per-series task
at all, and the run reports **`completed`** (P25 prediction 4). The same item SCOPES the wiring
check's one stated leniency, which W99's refinement is the first thing here that could defeat. **No rule id is
added and the count stays 37** — this refuses no document and stops no run; it is a verdict an author reads.

**v0.27 makes a PREDICATE DATA, and it is the first version to BREAK every existing document**
([P26](../doc/plans/p26-what-a-flow-can-say-without-code.md),
[ADR 0074](../doc/decisions/0074-a-predicate-is-a-registered-name-or-a-declared-comparison-over-the-context.md),
[W108](../doc/work-items/w108-a-predicate-is-data.md)). A `when` was a STRING naming a function registered in
code, so the reference was data and the logic was not, and that was the last thing a flow document could not
say for itself. **A `when` is now always an OBJECT**, exactly one of three shapes: `{ predicate }`, a registered
name; a COMPARISON, `{ path, op, value, default?, length? }`, over the decision's own context; or a FLAT group,
`{ all }` or `{ any }`, whose members are comparisons. Section 3 gains the grammar, section 5 gains
**`FD-V42`** (the form and its keys), **`FD-V43`** (the key path and its two roots), **`FD-V44`** (the operator
enumeration and the literal it admits) and **`FD-V45`** (a group's members), and **`FD-V4` keeps its id and its
sentence with only the SPELLING moved** — a name absent from the registry, written `{ "predicate": "x" }`.
**The bare string is REFUSED**: that is the maintainer's answer to W108's stop-and-ask (b), taken against the
recommendation, and it cost a migration of **102 sites in 38 files** measured at that item's declaration step.
*(The package stayed `0.6.0` at this version and moved to `0.7.0` at [W110](../doc/work-items/w110-a-flow-a-ui-could-have-emitted.md)'s close, on W84/W85/W86's precedent — present tense here until that item, which is section 1 rule 5's third direction on a sentence naming the item that expires it.)*

**Three things the subset says, each a decision rather than an observation, and each measured over 1800
contexts against the ten predicate bodies this tree already has** (W108's declaration step). **Comparisons are
TYPE-STRICT** — a comparison between kinds is NO MATCH and never a coercion, which reproduces all three of the
tree's `typeof x === 'number' && x < t` bodies EXACTLY and differs from one unguarded body on a string, in
`FD-V30`'s own direction. **An absent path is NO MATCH, and a comparison may declare a `default`** substituted
in its place — which is `?? 0` and `?? []`, two of the measured shapes, and **it is what makes the six
comparisons closed under negation**, because without it both `x > t` and `x <= t` are false for an absent path
and no pair of operators complements. **And the enumeration is CLOSED**: an operator outside it is refused BY
NAME at construction, which is ADR 0053's shape and is what stops this becoming a bad expression language one
shape at a time — a predicate that COMPUTES stays a registered name.
So this document held **41 refusals** at that version — `FD-V1` … `FD-V45` less `FD-V5`, `FD-V14`,
`FD-V15` and `FD-V34`.

**v0.28 ships the FIRST node type the library has ever shipped: a node that only TRANSFORMS**
([ADR 0075](../doc/decisions/0075-a-node-that-only-transforms-is-a-built-in-type-with-no-inner-worker.md),
[W109](../doc/work-items/w109-a-node-that-only-transforms.md), under P26). A node whose whole job is to
reshape a value had to be written as CODE — a worker module, a worker entry and a node type — even though
the envelope worker every typed pool already loads does the reshaping. So `nodeTypes` gains a THIRD
namespace beside the document's and `code`'s: **`BUILT_IN_NODE_TYPES`, with one member, `Transform`**, which
names **NO worker** and whose task is its node's own `transform`. It is merged at every READ and stored in no
registry — `ResolvedRegistry` carries it no more than it carries a gate type — so a flow may name it with a
registry that declares no `nodeTypes` at all, which is what lets a document a UI emits carry a reshaping
step without carrying a node type for it; and it names a LANGUAGE nowhere, so the adapter stays the
consumer's and no engine ships with the library (ADR 0052 rule 4, P26 fact 5). A name colliding with it —
from the document, from `code`, or handed straight to the validator's own registry check — is refused on
all three roads.

Section 5 gains **`FD-V46`**: a node of a type that only transforms and declares no `transform` is refused,
because the alternative is a task that returns what it was given. Nothing else moves — `FD-V32`'s worker
clause gains an exemption for a type that names none, and no other rule, node kind or key changes. So this
document now holds **42 refusals** — `FD-V1` … `FD-V46` less `FD-V5`, `FD-V14`, `FD-V15` and `FD-V34` —
and it is the number `check-spec` prints as *C4 covered 42 definition refusals*.

**The type is the ESCAPE HATCH and not the default, and the ADR carries the three-tier rule because of
it.** [P17](../doc/plans/p17-what-a-node-may-do-to-its-input-before-its-worker-sees-it.md)'s declaration
calls it *"a **reshaping `task` node**: a worker whose whole job is to rename keys, which
[ADR 0040](../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
exists to remove"*, so this version REINTRODUCES a shape two decisions removed and says so: **selection is
`needs`** (no task at all), **computation feeding a worker is a `transform` on that worker's node** (no
extra task), and **this type is for computation with no consuming node** — where it costs **+1 dispatch,
+4 clones and +2 log records** per node, measured at W109's declaration step on a real `FyflowScheduler`
at three arities, and rising to **1.93x** of a tier-two run inside a `map` at N = 128 inline while staying
flat at **1.47x** threaded. *(The quotation read *the workaround ADR 0040 exists to remove*, which is
literally P14's words and occurs nowhere in P17 — W109's conformity reader, 13. And these four figures
were in four documents with nothing comparing any two, which `check-docs`' `X6` now does for the two read
as current — its own founding measurement one decision later, W109's adequacy reader, F11.)*

**v0.29 corrects ONE sentence in section 2, by the maintainer on 2026-10-08**: what a throw in the
envelope's `setup()` does. It said the task *"stays `pending` with `attempts: 0`"* and the scheduler
*"emits nothing a driver could record"* — W61's measurement, carried into ADR 0051 F1. **W141
re-measured it on 0.5.2** ([W141](../doc/work-items/w141-a-worker-that-cannot-set-up-fails-its-tasks-and-the-registry-has-one-shape.md),
[Q266](../doc/questions/q266.md)): ONE task with no retry does not hang — it settles `user_action`;
the hang needs several tasks on the failing worker, or one task with a retry, and then every task
stays `pending` while the pool exhausts its restarts. **And since W141 no task hangs at all**: the
envelope remembers ANY failure of its `setup()` and throws it from `run()`. No rule moves, no
refusal is added, and `RunState.outcome` still never reads `stopped` for this.

**v0.30 lets a gate type's ROUTES come from its NODE** ([P32](../doc/plans/p32-what-a-gate-may-decide-without-memory.md)
decisions 1-3 and 7,
[ADR 0092](../doc/decisions/0092-a-gate-types-routes-are-declared-statically-or-derived-from-its-node.md),
[W153](../doc/work-items/w153-a-gate-types-routes-may-come-from-its-node.md)). A gate type declared ONE route
list per TYPE, read before any gate's settings were, so a type whose routes are its gate's own — a switch's
cases — could not be written at all (P32 fact 1). **A type now declares its routes STATICALLY — `routes`,
`defaultRoute`, `keyResolvedRoutes?`, exactly as before — or DERIVES them by `routesFor(settings)`, exactly
one of the two**; each GATE's route set is resolved once, at instantiation, after `FD-V40` passed, and every
reader of a gate's routes reads that resolved set — `FD-V41`'s count, the default route, `FD-R5`'s stop and the
wiring check's guarantee — never the type's members. A type may also declare **`settingsProblem(settings)`**,
run by `FD-V40` after its `settingsSchema`, because the subset cannot state a grammar (ADR 0053, P32 fact 3).
**A gate is a node that routes by a registered type; memory is something a type MAY use** — ADR 0092 says
so, which ADR 0066's *a decision WITH MEMORY* did not. **No rule id is added and the count stays 42**: a
defect in the type — both forms, neither, a `routesFor` that throws or returns a malformed set — is `FD-V39`,
and a defect in the settings `settingsProblem` names is `FD-V40` (P32 decision 7 and stop-and-ask (d)).
`distinct` is a static type, byte-identical, and every type written against v0.23-v0.29 is a static type
unchanged.

**v0.31 ships TWO more built-in gate types, `if` and `switch`** ([P32](../doc/plans/p32-what-a-gate-may-decide-without-memory.md)
decisions 1 and 4-6, [W154](../doc/work-items/w154-the-built-in-if-and-switch.md)). Until here a flow could route
the value that reaches a node only through a task's edges or through `distinct` — every other decision was a
gate type written in code — so it could not route an ENTRY payload, or the value directly after a gate, without
a worker before the decision. **`if`** routes it by a declared CONDITION — `{ when }`, section 3's comparison or
flat group minus the name shape, over ONE root, **`input`** — to `then` or `else`; **`switch`** routes it by a
declared TABLE of values — `{ key, cases }` — to the case whose values hold the resolved key, or to `default`.
Both are written against the public interface as `distinct` is, nothing in the validator, the wiring check or the
driver names either, and **neither reads memory**: a gate is a node that routes by a registered type (ADR 0092),
and these two route by their settings and what reached them alone — `FD-C8`, beside `FD-C7`. A `switch`'s routes
are its NODE's, so `FD-V41` refuses a case left unwired, by name — the forgotten case an edge chain of `{ "op":
"eq" }` could not catch. **No rule id is added and the count stays 42**: a defect in either's settings, its
condition's grammar included, is `FD-V40` (P32 decision 7) — `FD-V40`'s and `FD-V43`'s rows carry the riders.
**A task edge's grammar does not move**: its roots stay `outcome` and `needs`, and `input` is not one of them.
**`if` and `switch` become names a consumer's gate type may not take** (`NameCollision`).

**v0.42 adds a SEVENTH node kind, `ask` — a node that waits for a person, by design**
([W179](../doc/work-items/w179-the-ask-node-in-the-definition.md) under
[P35](../doc/plans/p35-may-a-node-wait-for-a-person-by-design.md), stop-and-asks (a) and (h) and decisions 6 and 7,
[ADR 0108](../doc/decisions/0108-an-ask-is-a-seventh-node-kind-with-a-task-id-and-no-dispatch.md)). Until here the only
way a flow could wait for a person was a task that FAILED on purpose and parked `user_action` — its question carried
as its error, told apart from a real failure by nothing in the record. An `ask` is `{ id, kind, edges, settings?,
answerSchema?, needs? }`: it runs NO worker and is NEVER dispatched, and it has a TASK ID all the same
(`spec/task-id.md` v0.13) — the address a person's answer is given to — so its answer is its OUTPUT, referenced by a
later node's `needs` as a task's is (`FD-V27` widened), and its edges ROUTE as a task's settlement does, `on:
["done" | "failed"]` and a `when` over `outcome.result`, with no new route grammar. It is allowed wherever a task is —
the entry, a fan-out's branch entry, a map's branch — so **the rules that ENUMERATE kinds are widened by name**
(decision 7, `map`'s v0.8 precedent, whose fifth widening a reader found): `FD-V7` (an ask's edges are held as a
task's), `FD-V9` and `FD-V25` (a branch entry or a map's branch may be an ask), `FD-V17` (the ask's key set, and the
six keys `FD-V47` owns on it), `FD-V21` (an ask's `settings` not a plain object), `FD-V23` (an ask without `edges`),
`FD-V24` (the kind list), `FD-V26`'s note (an ask may carry `needs`), `FD-V27` (a reference to an ask is admitted) and
`FD-V29`'s text (an ask's edges are disjunctive, as a task's are). **`FD-V47`** refuses on an ask each key only a
task's WORKER reads — `type`, `pool`, `optional`, `retryPolicy`, `workerGroups` and, by decision 6, `transform` —
one finding per key; **`FD-V48`** refuses an `answerSchema` outside the schema subset, held at load by the code that
holds a worker's schemas. Section 3's wiring check reads an ask as a PRODUCER of its `answerSchema` and never as a
consumer. **What a run does with an ask is not here**: parking, the kept input, the answer at `resolve()` and what a
predicate sees are [P35](../doc/plans/p35-may-a-node-wait-for-a-person-by-design.md)'s next item's, and until it
lands every `Driver` refuses a run where a branch ENTERS an ask, by name (`InvalidDefinition`), as v0.23's gate was
refused until W93. **BREAKING in 0.8.0** (P35 decision 8): `FlowNode` gains a seventh member, so a consumer's
exhaustive `switch` over `node.kind` stops compiling. So this document now holds **44 refusals** — `FD-V1` …
`FD-V48` less `FD-V5`, `FD-V14`, `FD-V15` and `FD-V34` — and it is the number `check-spec` prints as *C4 covered 44
definition refusals*.

**v0.43 is [W180](../doc/work-items/w180-asking-and-answering-in-a-run.md) under
[P35](../doc/plans/p35-may-a-node-wait-for-a-person-by-design.md) — a run that REACHES an ask, and ONE rule's text
moves: `FD-R4`'s resolve boundary holds an ask's answer to the ask's `answerSchema`** (P35 (d),
[ADR 0109](../doc/decisions/0109-an-ask-parks-with-nothing-dispatched-and-its-answer-is-its-result.md)). Where a task's
resolution is held to its worker's `outputSchema`, an ask — which has no worker — holds a `done` answer to the schema it
declares: refused as `BoundaryRefused` by name, nothing appended, the ask still parked; no `answerSchema`, nothing held;
`validateBoundaries: false` turns it off with the rest of the rule. The interim refusal v0.42 described is GONE: a
`Driver` parks an ask (`spec/run-state.md` `RN-R37`), and section 2's ask subsection says what a run does with one.
Section 7 gains the two valid flows the maintainer's ruling on W179's S-2 assigned here — an ask after a task, and an
ask as a fan-out's branch entry before its join. **No refusal is added or removed: still 44.**

**v0.44 is [W190](../doc/work-items/w190-the-runs-payload-as-a-reference.md) under
[P38](../doc/plans/p38-may-a-reference-name-what-reached-the-run-and-its-map-instance.md) — a reference may name the value
that reached the RUN: `"$payload"`** ([ADR 0117](../doc/decisions/0117-a-reference-may-name-what-reached-the-run.md),
stop-and-asks (a), (b), (d), (f)-(j), (l) and (m)). Until here what a node could reach was the run's own OUTPUTS, so an
ASK at the entry left its successor no road to the payload the run started with (P38 fact 2) — the ask's result is the
person's answer — and a run-level parameter reached a node two hops on only through every node between passing it. Section
3's reference table gains a ROW: `"$payload"` is the value `start()` was handed — the header's retained copy (`RN-R15`) —
on any node that may declare `needs` (a `task`, a `map`, an `ask`) and on any edge, the entry included, ALWAYS there, so
no `?` and no array form; each key its own deep copy per read, as every reference (`FD-C1`, `FD-C3`), composed from the
caller's own value at `FD-R4`, where no header exists yet, and from the stored header on a resume — **nothing new is
written to the log, the header or the fold**. **The whole `$` prefix is RESERVED** (`$` is outside `FD-V16`'s charset, so
no node may be called one): `FD-V26` gains three clauses — an array form, a `?` suffix, and any other `$` spelling — each
naming its fix, and refuses `"$item"`, a map instance's item, which this version PARSES and does not compose (P38's
W191 composes it). The wiring check reads an arc composed through a
`"$payload"` key `unchecked` — the run's payload is a value no schema declares. **`referenceTarget`'s return type gains two
variants** (`'payload'`, `'item'`), stated BREAKING in 0.8.0 (P38 (h)). **No rule id is added or retired: still 44
refusals.**

**v0.45 is [W191](../doc/work-items/w191-the-map-instances-item-as-a-reference.md) under
[P38](../doc/plans/p38-may-a-reference-name-what-reached-the-run-and-its-map-instance.md) — a reference may name the item
that opened the reader's MAP INSTANCE: `"$item"`** ([ADR 0118](../doc/decisions/0118-a-map-instance-keeps-its-item-while-a-node-of-it-may-still-be-entered.md),
stop-and-asks (a), (c)-(e), (g)-(i)). Until here an instance's item reached only its branch ENTRY, as `"."`, so an ASK as a
map's branch left the node after it no road to the item (P38 fact 5) — the ask's result is the person's answer. Section
3's reference table gains a ROW: `"$item"` is the element of `over`'s array that opened the INNERMOST map instance
CONTAINING the reader as a member — so a `map` node names its ENCLOSING instance's item, and a node in a `fanout` inside a
map instance names the map's (P38 (c)) — on any node that may declare `needs` and on any edge inside one, the branch entry
included (where it equals `"."`), ALWAYS there, its own copy per key per read (`FD-C1`, `FD-C3`), composed at `FD-R4` from
the walk's own element. `FD-V26` no longer refuses it (v0.44's interim clause is RETIRED); **`FD-V49` is new**: `"$item"`
where no map instance contains the reader, its message naming both fixes (P38 (g)). **What an instance KEEPS for it** is
`spec/run-state.md` v0.28's `RN-R13` sixth term — its item, by reference, only where its region has a `"$item"` reader,
until NOTHING of the instance may still be entered (its branch terminal and no branch of a region nested in it live) — and
a resume rebuilds it by replay, so **nothing new is written to the log, the header or
the fold**. The wiring check composes a `"$item"` key over the enclosing map's ITEM arrival, one sample per element (P38
(i)). And `FD-R4` composes ANY `needs` on an entry map's branch task without a branch path — W190's S-1: it threw
`UnresolvedBranchPath` out of `start()` for a `"."` there. One function joins the public surface, ADDITIVELY:
`innermostMapOf` (`src/definition/regions.ts`, which `index.ts` re-exports whole). One rule id is added, so this document now holds **45 refusals**
over `FD-V1` … `FD-V49`.

**Binds:** [ADR 0002](../doc/decisions/0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md)
(the graph is data; a predicate is a name; an unknown name fails at instantiation) and
[ADR 0004](../doc/decisions/0004-a-non-success-outcome-routes-only-where-an-edge-opts-in-and-user-action-suspends.md)
(routing is opt-in per terminal state; `user_action` suspends).

A flow definition is inert JSON. It contains no functions, no regular expressions and no class
instances — anything that does not survive `JSON.parse(JSON.stringify(x))` is not a definition
(ADR 0002 rule 1).

---

## 1. The document

```json
{
  "flowId": "score-and-publish",
  "version": 1,
  "entry": "ingest",
  "nodes": [ ... ]
}
```

| Key | Type | |
|---|---|---|
| `flowId` | string | matches `^[A-Za-z0-9_-]{1,64}$` (`FD-V16`) |
| `version` | integer >= 1 | author-managed. The driver does not interpret it |
| `entry` | string | a node id (`FD-V3`) |
| `nodes` | array | one object per node, order irrelevant |

## 2. Node kinds

Seven. There is **no `decision` node kind** — a decision is a property of an edge, which is
ADR 0002 rule 2 taken literally (`when: { predicate: "isLowConfidence" }`). **A decision WITH MEMORY is a node**, and
that is the sixth kind, `gate` (v0.23, below): its memory is one per gate per run, so it belongs to a
node and not to an edge, and a predicate is asked to be pure ([Q9](../doc/questions/q9.md)) where a
gate's whole job is to remember. **A node that WAITS FOR A PERSON is the seventh, `ask`** (v0.42, below): it runs
no worker and is never dispatched, and a person's answer is its output.

| kind | keys | |
|---|---|---|
| `task` | `id`, `kind`, `edges`, **`type`**, **`pool?`**, **`settings?`**, **`transform?`**, **`optional?`**, **`needs?`**, **`retryPolicy?`**, **`workerGroups?`** | runs as a node TYPE the registry declares — REQUIRED since v0.19 — on the type's default pool instance or on a named one (`pool`), its worker receiving the envelope. Dispatched as one scheduler task. `retryPolicy` and `workerGroups` are what it says about that task — v0.16, below; `transform` is what it may DO to its input before its worker sees it — v0.18, below. *(`workerType`, v0.1-v0.18's way of naming a pool by its key, is retired — an undeclared key, `FD-V17`.)* |
| `fanout` | `id`, `kind`, `branches` | opens a region with **N branches declared here**. Dispatches nothing itself |
| `map` | `id`, `kind`, `over`, `branch`, **`needs?`** | opens a region with **one branch, opened N times at run time**. Dispatches nothing itself. v0.8 |
| `join` | `id`, `kind`, `of`, `edges` | closes the region opened by the `fanout` **or `map`** named in `of`. Dispatches nothing itself |
| `end` | `id`, `kind`, `outcome` | terminates one path. No edges |
| `gate` | `id`, `kind`, `type`, `edges`, **`settings?`** | routes the branch that reaches it by a registered GATE type's decision, and hands on exactly what reached it. Dispatches nothing itself. v0.23 |
| `ask` | `id`, `kind`, `edges`, **`settings?`**, **`answerSchema?`**, **`needs?`** | waits for a PERSON: what reaches it is composed by its `needs`, and the person's answer is its output, routed by its edges as a task's settlement is. Dispatches nothing — and has a task id. The six keys only a task's worker reads are `FD-V47`'s. v0.42 |

**Only a `task` node is ever dispatched**, and therefore only a `task` node produces an outcome record from a
scheduler. **An `ask` is the one other kind with a task id** ([spec/task-id.md](task-id.md) v0.13): nothing is
dispatched for it, but a person's answer needs an address and a later node may reference that answer — so a `task`
and an `ask` are the two kinds that have a task id, produce an output, and can suspend (an ask by design; what a
run records for it is `spec/run-state.md`'s `RN-R36` and `RN-R37` and `spec/outcome-record.md`'s section 7, since
v0.43 — W180). *(This read *"only a
`task` node has a task id, produces an outcome record, or can suspend"* until v0.42.)* `fanout`, `map`, `join`,
`end` and `gate` are structural: a run passes through them within a single driver turn. **This is why `end`
nodes are exempt from `FD-V13`, `FD-V19` and `FD-V22`** — sharing one between two paths creates no
ambiguity about anything, because nothing about it is per-path.

A `join`'s single edge carries neither `when` nor `on` (`FD-V7`): a predicate's
`DecisionContext.outcome` would have nothing to hold.

`end.outcome` is a non-empty author-defined string. **The driver does not interpret it** — the
run-level outcome vocabulary is run state's, not the definition's ([Q25](../doc/questions/q25.md)).

### `optional`

`optional` is a boolean, default `false`, passed through to the scheduler task
(`AGENTS.md` section 5). It is the authoring-level form of ADR 0004 rule 7:

> **`optional: true` means the flow handles this node's failure. The default means a human does.**

That is not a convention laid over the library — it is the library's own branch. A task that fails
with no retries left reaches `state = 'failed'` **only** inside `if (task.optional)`
(`../fyflow-scheduler/core/FyflowScheduler.ts:1151-1154`, and again at `:1545-1548`); otherwise it
reaches `user_action` and **suspends** (ADR 0004 rule 3).

**Both kinds of node can route through an `on: ["failed"]` edge, by different roads**, and this is
the correction the second conformity pass forced:

| node | how it reaches `failed` | |
|---|---|---|
| `optional: true` | the task settles `failed` | the flow was told to handle it |
| default | it suspends, and a resolution arrives with `resolvedAs: "failed"` | **a human gave up on it**, which is a case an author will want to route |

So `optional` decides *who* decides, not *whether an `on: ["failed"]` edge is reachable*. An earlier
version of this document said `optional: true` was the only way such an edge could fire; that was
exactly inverted for the resolution road, which only non-optional nodes can take.

### `retryPolicy` and `workerGroups` — what a node says about its own task — v0.16

```json
{ "id": "score", "kind": "task", "type": "ScoreWorker",
  "retryPolicy": { "maxRetries": 1, "backoffMs": 250 }, "workerGroups": [ "gpu" ],
  "edges": [ { "to": "publish" } ] }
```

`optional` was the one scheduler task field a node could set, and these two generalise it
([P16](../doc/plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md) decision 3,
[W58](../doc/work-items/w58-what-a-node-says-about-its-own-task.md)). **They are DECLARED KEYS
rather than an opaque `task: {…}` bag forwarded to the scheduler untouched**, because `FD-V17`'s
whole job is refusing a key the kind does not declare, and a bag is where a typo lives until run
time. The coupling to the scheduler's field names exists either way; declaring them makes it visible.

| key | | |
|---|---|---|
| `retryPolicy` | optional | **exactly the scheduler's own shape at 0.5.2**: an object with the two keys `maxRetries`, an **integer >= 0**, and `backoffMs`, a **finite number >= 0**, and no other key (`FD-V30`). Passed through to the scheduler task whole. The scheduler retries a failed attempt **inside the same task id** up to `maxRetries` times, waiting `backoffMs` between attempts, and the outcome record's `attempts` (`OR-R2`) says how many retries were used |
| `workerGroups` | optional | a **non-empty array of distinct group ids**, every one of which the registry's `groups` set declares (`FD-V31`). Passed through to the scheduler task whole; the scheduler acquires these **in addition to** its pool's `groups` — a union, measured |

**Why `FD-V30` pins the exact shape, and every clause is a measurement.** On a real inline scheduler
at 0.5.2: `{}` and `{ "backoffMs": 5 }` are accepted and silently mean *no retries*; `{ "maxRetries":
"1" }` — a string — **retries, by coercion**; `1.5` retries; `-1` never does; a negative `backoffMs`
makes Node warn and then retries at once; a key beside the two is dropped without a word. A
definition is data that arrives from anywhere, and each of those is a document that reads as though
it asked for something and gets something else. So the rule owns the key's whole shape — its own id
rather than a clause of `FD-V21`, on `FD-V26`'s precedent, because whichever clause fired the fix is
the same and an author reads one row. `maxRetries: 0` is **accepted**: it means what an omitted policy
means and says so explicitly, which is `optional: false`'s own standing.

**Why the registry gains a third set, and why absent means EMPTY.** A task carrying
`workerGroups: ["nope"]` against a scheduler with no such group **runs and settles `done`** — no
throw from `addTask`, no `resource.blocked`, nothing — measured at P16's declaration and re-measured
here with a resource listener attached, which the scheduler requires before it emits `resource.*` at
all. So a typo in a group id is caught by nothing downstream, and the only place it can be caught is
the registry the validator checks at instantiation: `groups` beside `predicates` and `nodeTypes`,
`FD-V31` beside `FD-V4` and `FD-V32`, [ADR 0002](../doc/decisions/0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md)
rule 3's own shape. **A registry that omits the set declares no groups**, so a definition naming
any is refused — the alternative, *absent means unchecked*, would hand the scheduler's silence back
to exactly the consumer who forgot the option, and both directions were priced before the maintainer
chose this one. A consumer passes `Object.keys(scheduler.groups)`, the scheduler's own map, rather
than a second list — the precedent `workerTypes` set at ladder L6 until v0.19 retired it, and `groups`
keeps (`examples/run-flow.ts`).

**The merge rule, and it is one sentence: the node wins, whole.** A driver may carry a
`defaultRetryPolicy`, applied to every task node that declares none, **and held to `FD-V30` at
construction** — the same shape, the same rule id, before the definition is validated, because a
default is the policy a node would otherwise have declared *(its first version was typed and
unchecked, and W58's adequacy reader handed it `{}`, `null`, a string and an extra key, all of
which reached the scheduler)*. A node that declares its own is dispatched with **exactly that
object** — the default is consulted only when the node declares none, never to fill a field. Asserted at ladder L2 with a node whose policy differs from the default in both
fields. *(**What is NOT observable, stated rather than implied**: because `FD-V30` requires both
keys, a field-by-field merge could not differ from the node's own object on any valid document —
W58's rule 8 set made the merge field-wise and nothing moved. The sentence is written for the day a
key becomes optional, and until then *whole* and *field-wise* are the same behaviour.)* **There is no `defaultWorkerGroups`**, and the reason is a measurement rather than a
preference: a task's `workerGroups` is a UNION with its pool's `groups` (pool `["b"]` plus task
`["a"]` acquires both), so a pool-level default for groups already exists upstream — where a
pool-level retry default does not (`WorkerManagerOptions` carries none, which is why the retry
default is this library's). A third place stating group membership, under a merge rule that differs
from retry's, is what W60's second issuance condition names, and it is **not issued**.

**What a node that declares neither key receives is unchanged, to the byte.** The driver hands
`createTask` the four fields it always did and adds a key only when there is something to pass, so
every fake that deep-compares the object it received sees nothing new, and every corpus flow
validates as it did. **Both keys are per NODE, and inside a `map` region that is per INSTANCE**: every
instance of the branch task is dispatched with the branch's policy and groups, so a map of three
items whose branch declares `maxRetries: 1` may use three retries, one each — the shape the feature
was not built for, and the one `spec/examples/valid/task-config.flow.json` carries beside a top-level
task and a task inside a `fanout` branch.

**What this is NOT.** A retry here is the scheduler's, inside one task id — [Q16](../doc/questions/q16.md)'s
TASK half. Re-dispatching a *node* under a new attempt, which is the task id's fourth segment
([Q111](../doc/questions/q111.md)) and may route elsewhere, is that question's other half and stays
open. `limitKey`, the scheduler's per-workload bucket for a keyed group, is not configuration and has
no home here ([Q248](../doc/questions/q248.md)) — so since v0.35 a node REACHING a group the built-in `KeyedRateLimitGroup` factory built is refused before its run starts unless `start` is given a `createTask` to set one (`FD-R6`, section 6); `handleRejection` is irrelevant to a driver that
routes on events.

### `type`, `pool` and `settings` — every task node names a TYPE, and the envelope its worker receives — v0.17, v0.19

```json
{ "id": "score", "kind": "task", "type": "Scorer", "pool": "scorer-fast", "settings": { "factor": 10 },
  "edges": [ { "to": "publish" } ] }
```

A `task` names the thing that runs it ONE way: **`type`**, REQUIRED, the name of a **node type**
the registry declares ([ADR 0049](../doc/decisions/0049-a-node-type-is-a-registry-entry-and-its-worker-receives-an-envelope.md),
[ADR 0054](../doc/decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md),
[P16](../doc/plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md) decisions 2,
4, 5 and 6, [P18](../doc/plans/p18-a-flow-and-its-runtime-from-documents-alone.md) decisions 1 and
5, [W59](../doc/work-items/w59-what-a-node-type-is.md), [W65](../doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md)).
**A node type is a REGISTRY entry and the definition stays data**: since v0.19 the registry is a
DOCUMENT (section 3's registry subsection) and a type is `{ worker, inline?, config?, pool?, groups?,
retryPolicy?, settings? }` there, or a class registered in code — a DERIVATION from an instance's
config to pool options; the definition names the type and nothing else, **never a file and never a
URL**. **Every type has a DEFAULT pool instance, keyed by the type's name**, and may have named
instances in the registry's `pools`; a node runs on the default unless it names one in `pool`.
*(v0.17 admitted `workerType` beside `type` — a pool named by its key, its worker handed the raw
payload. Retired at v0.19: 146 of the 166 corpus task nodes carried it (P18 fact 4), all 146 now
name a type, and the key is `FD-V17`'s undeclared key like any other.)*

| key | | |
|---|---|---|
| `type` | required | the name of a node type in the registry's `nodeTypes`, whose `worker` the registry's `workers` declares — `FD-V32`, both clauses — **or a BUILT-IN type, which no registry document declares and which names no worker** (`Transform`, v0.28, ADR 0075; `FD-V32`'s second clause exempts it and `FD-V46` is what such a node must satisfy instead). A non-string `type` is `FD-V21`; a task with no `type` is `FD-V23`. *(This row named only the first road, while `AGENTS.md`'s twin had been corrected — the source of truth stale where the consumer reference was right, which is `spec/README.md` rule 4's inverse. W109's conformity reader, 2.)* |
| `pool` | optional | a key in the registry's `pools` whose `type` is this node's (`FD-V38`); absent, the type's DEFAULT instance, keyed by the type's name. The type's own name is accepted as the default stated explicitly. A non-string `pool` is `FD-V21` |
| `settings` | optional | a **plain JSON object** which — with the type's `settings` DEFAULTS merged UNDER it, the node's keys winning, a SHALLOW merge at the top level (a nested default object is replaced by the node's, never merged into — `mergeConfig`'s rule one field over) — the type's worker `settingsSchema` accepts (`FD-V33`); absent, the defaults alone, `{}` when the type declares none. **An absent schema accepts any plain object** (P18 decision 3) |

**What the worker receives is the ENVELOPE `{ settings, input }` — `FD-C5`, section 3 — on EVERY
task node** (ADR 0054): `settings` is the node's effective settings — the merged object — as its
**own copy** per dispatch (a map's N instances get N copies, `JP-R11`'s invariant one field over);
**`input` is the value this node receives** — the ordinary edge's value, the object `needs`
describes, its own item as a map instance, the collection after a join. There is no bare road since
v0.19, so [ADR 0040](../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
rule 6's *exactly the object `needs` describes* is what `input` IS, and a worker written for a
bare node reads under `input` the object it read as its whole payload. The alternative — one pool
per distinct settings value, settings delivered as pool `config` — needs no envelope and is
recorded in ADR 0049 as the road not taken, with its cost ([Q250](../doc/questions/q250.md)).

**Why a SCHEMA now, where v0.17 had a validator function.** A JSON registry cannot carry a
function, and the settings language P16 left to P18 is the worker's `settingsSchema` — JSON Schema
restricted to the seventeen keywords of section 3's subset (thirteen until v0.36), [ADR 0053](../doc/decisions/0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md).
A keyword outside the subset is REFUSED at construction naming it, never ignored
([Q278](../doc/questions/q278.md)); reached by this rule anyway, it is reported under `FD-V33` and
never applied, because a keyword ignored is a constraint dropped in silence. The type's defaults are
merged under the node's BEFORE the schema is applied, so a worker that requires a key is satisfied
by a type that supplies it (P18 decision 12), and what the worker receives is the merged object —
a default validated and not delivered would be [W43](../doc/work-items/w43-the-two-blocked-flows-on-real-workers.md)'s
silent shape. *Plain object* is checked as the shape `JSON.parse` can produce — an object, not
`null`, not an array. An unregistered `type` beside a malformed `settings` reports **both**
`FD-V32` and `FD-V33`, section 5's *every violation*. **The schema runs at construction and nowhere
else.** Measured at W59: the driver holds the definition **by reference**, so a document mutated
after `new Driver` is dispatched as mutated, and no rule here sees it; that road pre-dates this
version, is the same for every key, and is recorded rather than closed ([Q259](../doc/questions/q259.md)).

**What a type declares FOR its nodes, and how it merges.** `retryPolicy`: **the node wins, whole;
then the type; then the driver's `defaultRetryPolicy`** — v0.16's rule with one more level, and a
type's policy is held to `FD-V30` at construction naming the type, as the default is. `settings`
defaults: merged UNDER the node's, key by key, the node's winning (above). `groups` are the POOL's
— a document type's declared list, a class's whatever its derivation returns — every task of the
type acquires them and the scheduler **unions** them with the node's own `workerGroups` (W58's
measurement), so nothing merges. Each must be a group the registry declares: a document type's under
`FD-V31` at `new Driver` naming the type, and every derived pool's at construction of the runtime,
because **a pool naming a group the scheduler lacks acquires nothing and says nothing** — measured
at W59 in both runtimes, P16 fact 2 one level up. Groups resolve by the scheduler's **map key**; a
group object's own `name` is inert (measured).

**The bootstrap helper is the one place the published package constructs scheduler objects** —
`fyflow-orchestration/scheduler`, a sub-path so the pure entry stays free of it (P16 decision 5,
legal since [ADR 0048](../doc/decisions/0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md)).
Since v0.19 `bootstrap({ workers, nodeTypes, pools }, groups, options)` builds **one `WorkerManager`
per pool INSTANCE through the derivation** — every type's default instance keyed by the type's name,
every named instance keyed as declared — running the package's envelope worker with the worker
entry's URL and the DERIVED config in its pool config, and refuses, **both ways**, a pool naming a
group with no object and an object no pool names. `createRuntime` calls it with **only the groups
some pool's derivation names**, so a group the DOCUMENT declares that only a NODE names — `FD-V31`'s
ordinary case — is created and registered rather than refused; the helper's own refusal is unchanged
for a consumer who calls it directly with group OBJECTS. *(This read* **"the runtime entry (W66)
folds this into `createRuntime`"** *, which was true when W66 wrote it and false the moment
[W67](../doc/work-items/w67-a-flow-from-documents-on-real-workers.md) shipped: a registry document
could not declare a group only nodes name, measured at that item's declaration step, and a reader
implementing a runtime from this paragraph alone would have built the over-refusal it removed. No
rule moved and none was added — section 1 rule 5's third direction, on a factual sentence.)* The consumer passes the driver the same `workers`, `nodeTypes` and `pools` and
`Object.keys(scheduler.groups)` — read from the scheduler, never written out again. *(v0.17's
`workerTypes` set — the pool keys read off the scheduler — is retired with `workerType`: a type's
default pool exists by construction, and a named instance is the registry's `pools`. And the
collision [Q260](../doc/questions/q260.md) recorded — a type's name against a bare pool key nothing
compared — is a refusal for a NAMED instance in the document's `pools`, `NameCollision` at construction;
a pool a consumer builds by hand and spreads into the scheduler beside the helper's is still nothing's
to compare, and Q260 stays open for it.)*

**What this is NOT.** A type's worker SAYS what it expects and returns — `inputSchema` and
`outputSchema` on the worker entry — enforced on no SETTLEMENT: declared and carried since
v0.19, held to one value per run each since v0.21 (`FD-R4`), and since v0.20 confirmed on a run by an authoring-time check, `scripts/check-workers.mjs`, over each schema's declared `examples` ([ADR 0056](../doc/decisions/0056-an-example-is-an-annotation-validated-against-the-schema-it-sits-on.md), [W72](../doc/work-items/w72-the-contract-an-example-beside-every-schema-and-a-worker-run-on-it.md)) *(this said "nothing enforces either yet … P19's strict mode" — P19 was DECLARED 2026-09-18 under a different name, *what a schema buys an author*, per-settlement enforcement is OUT of it as a default, and what it enforces at run time is the entry payload and a person's resolution, once each — `FD-R4`, W73)*. A transform on the envelope is the `transform` subsection below (v0.18).
A node type has no VERSION ([Q249](../doc/questions/q249.md)). Cases: `spec/examples/valid/typed.flow.json`
carries a typed task with settings on all four shapes `FD-C5` enumerates, beside a task of a
former bare type; `pooled.flow.json` runs one node on a NAMED instance and one on the default by
name; `spec/examples/invalid/` carries one document per rule.

### `transform` — what a node may DO to its input before its worker sees it — v0.18

```json
{ "id": "publish", "kind": "task", "type": "Scorer", "settings": { "factor": 1 },
  "transform": { "lang": "jsonata", "expr": "$sum([*.score])" },
  "edges": [ { "to": "done" } ] }
```

A **typed** `task` may declare a **transform**: an expression, in a language the registry names,
applied to the value the node receives BEFORE its worker sees it — [ADR 0051](../doc/decisions/0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md),
[P17](../doc/plans/p17-what-a-node-may-do-to-its-input-before-its-worker-sees-it.md) decisions 1-10, [W61](../doc/work-items/w61-what-a-transform-is.md). Until this version the only remedy for a worker
whose input was not the shape it reads was a RESHAPING `task` node — a worker whose whole job is to
rename keys, which [ADR 0040](../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
exists to remove and whose absence is a silent zero rather than a refusal
([W43](../doc/work-items/w43-the-two-blocked-flows-on-real-workers.md)'s flow). **The definition
says WHAT is done to the input and stays data**: the language is a NAME, never a file and never a
function, exactly as a predicate and a node type are (ADR 0002 rule 3, P16 decision 4).

| key | | |
|---|---|---|
| `transform` | optional | `{ lang, expr }`, both strings and no other key (`FD-V37`). `lang` names an entry in `Registry.languages`, the set beside `predicates`, `workers`, `nodeTypes`, `pools` and `groups`, **EMPTY when absent** (`FD-V35`, on `FD-V31`'s reading); `expr` is text that language's `compile` accepts, and the compiler is RUN at instantiation (`FD-V36`). A node with no `type` is `FD-V23` (v0.19; until then a transform on a bare `workerType` node was `FD-V37`, because the transform is evaluated in the TYPE's worker wrapper and a bare node had none — the road where the driver would evaluate, which the maintainer refused). On a `map` node, a `join`, an `end` or an EDGE it is `FD-V17`'s undeclared key, stated once here rather than as three more clauses |

**Where it is evaluated, and why it is not the driver** — P17 decision 1, the maintainer's placement
of 2026-09-11, and two measured facts under it. `src/driver/driver.ts` dispatches inside a scheduler
listener in ONE synchronous turn (it contains no `await`; `AGENTS.md` section 8's quiescent-point
contract rests on that), and a language's evaluator is asynchronous (JSONata's `evaluate()` returns
a Promise) — so the driver's whole part is one key in one object literal: the envelope becomes
`{ settings, input, transform }` exactly when the node declares one, and `input` is STILL the value
received (`FD-C6`). The TYPE's envelope worker evaluates the expression in its async `run()` and
hands the inner worker `{ settings, input }` with `input` REPLACED by the result. **So ladder L2,
which asserts on what `createTask` received, cannot see a transformed value** — P17 prediction 3,
asserted as a pair at L2 and as the wrapper's own behaviour at L1.

**A language is a registry entry with TWO HALVES, because a function cannot cross to a thread and a
URL can** — P17 fact 7, measured in both runtimes: a threaded pool whose config carries a function
fails its task with *could not be cloned*, and a URL string crosses. `Registry.languages` maps a
name to `{ compile, worker, check? }`: **`compile(expr)`**, the registry half, is synchronous, returns
nothing and THROWS on an expression the language refuses, with the language's own message — what
`FD-V36` reports, with the error's `position` and `code` as detail when the language sets them;
**`worker`**, the worker half, is the URL of a module whose default export is
`compile(expr) → { evaluate(input, settings) → Promise<unknown> }`, which the bootstrap helper writes
into EVERY typed pool's config, for every language the registry names, whatever any flow transforms on
(v0.34, [ADR 0096](../doc/decisions/0096-a-runtime-is-its-registry-and-start-refuses-from-runtime-check.md) —
until then ONLY for a type some node of which declared a transform in a flow the runtime was given at
construction, and only for the languages those nodes named: ADR 0051 rule 4, superseded), and which the
envelope worker loads in `setup()` once per worker instance,
compiling each distinct expression once per instance rather than per task; **`check`** is RESERVED
for P18's pre-flight and implemented by nothing — optional, not absent. **The two halves can
DISAGREE**: one module read twice is one language and two modules, or two versions on the two sides
of a thread, are two ([Q264](../doc/questions/q264.md)); the worker half refusing what the registry
half accepted is a task failure, and the adapter conformance suite (`test/scheduler/adapter-conformance.ts`)
asserts, for the adapter it is handed, that the two halves refuse the same expressions.

**What the expression sees** — P17 decision 7, the maintainer's of 2026-09-12. `$` is `input`: the
value this node receives, in every one of the four kinds `FD-C5` names — the ordinary edge's value,
what `needs` composed, a map instance's own item, a join's collection — so `*.score` over a
collection and `$.confidence` over an item read as an author expects. The node's effective
`settings` are bound as **`$settings`**, so one expression is parameterised per node without a second
key. Both names are spelled once; the first is JSONata's own convention and the second this
document's.

**A transform that cannot be evaluated is the TASK's failure, and the consequence is stated** — P17
decision 5. The wrapper throws a `TransformFailed` naming the language, the expression and the
language's own error code (`T0412`, `T2002`), so the task fails and takes the two roads any worker
throw takes: routed through an `on: ["failed"]` edge on an `optional` node, **parked as
`user_action`** on a non-optional one — measured at W61 on a real scheduler, inline and threaded,
both runtimes — and a person who `resolve()`s the task supplies the value the transform did not.
**A transform that evaluates to `undefined` is NOT a failure**: the worker receives `undefined` as
its `input`, because an adapter cannot tell a typo from an intended absence (P17 fact 4: a path typo
is silent where a type error is loud), and saying otherwise here would decide P19. **And a language
module that does not LOAD is the task's failure too, by the maintainer's choice at W61's
stop-and-ask**: a throw in the wrapper's `setup()` is a WORKER error, which the scheduler handles by
restarting the worker — *(v0.29: re-measured on 0.5.2 at W141, one task with no retry settles
`user_action`, and several tasks on the failing worker, or a retry, stay `pending` while the pool
exhausts its restarts; this read "the task stays `pending` with `attempts: 0` … emits nothing a
driver could record" until then)* — so the wrapper remembers the load failure and throws it from
`run()` on exactly the tasks whose transform names that language, while a task with no transform, or
in a language that did load, still runs. **Since W141 the same holds for ANY failure of the envelope's
own `setup()`**: it is remembered and thrown from `run()` on every task of that worker, so no task of
a type whose worker cannot set up hangs. No `FD-R` is added: `RunState.outcome` never says `halted` for a transform.

**`$now`, `$millis` and `$random` are UNBOUND, by name, in every adapter** — P17 decision 6, a rule
about ANY language: *a transform is a function of what the run produced*, because a run's state is a
fold of its log (`doc/concept.md` section 5) and a transform that read the clock would make two
folds of one log disagree. JSONata's three can be shadowed per compiled expression and the shadow
reaches `$eval` (P17 fact 3); the conformance suite asserts the three by name as expressions that
never yield a value. **Evaluating twice and comparing is a NECESSARY check and never a sufficient
one** — `$millis()` returned the same value twice on one machine — which is why the rule is a list
of names and not a detector.

**What this is NOT.** Not a transform on a `map`'s `over`, on an edge or on a decision (and since
v0.19 there is no untyped node for one to sit on — a task with no `type` is `FD-V23`): a decision predicate is already a registered function and `doc/concept.md` section 7 names
an expression language for decisions a non-goal — a consumer who wants one registers a predicate by
name through the same adapter, with no library change. Not a second language: CEL was refused by the
maintainer on the maturity of its JavaScript ports, and the adapter interface is what keeps that
reversible. Not a statement about what a worker EXPECTS or RETURNS — input and output schemas and the
sample-based pre-flight over a transformed edge are P18's, and the `check` hook is the door left for
it. **A transform's result changes TYPE with the region's arity** — `*.score` is an array at two
matches, a scalar at one, absent at zero — and that is [Q263](../doc/questions/q263.md), shown by
W63's exit artifact at all three arities. Cases: `spec/examples/valid/transformed.flow.json` carries
a transform on all four shapes `FD-C5` enumerates, in the FAKE language `path` the test fixture
supplies; `spec/examples/invalid/` carries one document per rule.

### `map` — a region whose arity is not in the document — v0.8

```json
{ "id": "split", "kind": "map", "over": "items", "branch": "score" }
```

| key | | |
|---|---|---|
| `over` | required | a **key** on the value this node receives, matching `^[A-Za-z0-9_-]{1,64}$` — `FD-V16`'s charset (`FD-V25`) |
| `branch` | required | **one** node id, whose kind is a `task` — or, since v0.42, an `ask` (`FD-V25`). Not a list |

**`over` is a declared reference, never a callback.**
[ADR 0002](../doc/decisions/0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md)
rule 1 binds the whole document: anything that does not survive `JSON.parse(JSON.stringify(x))` is
not a definition, so *"how many items"* is a name the driver resolves and never a function the
author supplies.

**What `over` is a key ON — v0.10, and it is settled now.** It is the value the driver hands the
map node — **which since v0.11 is what section 3's `FD-C1` says it is**: the previous node's `result`
unchanged when the map declares no `needs`, and the object its `needs` describes when it does.
`map-over-region-output.flow.json` is the second case and it is the whole of why `join -> map` over a
region's output is expressible. *(This paragraph said only *"for an ordinary edge is the previous
node's `result` unchanged"* after v0.11 had made it one of two. W41's conformity reader.)* A `map`
may be the `entry` node, and then the value is the run's start payload; that needs no rule, because
`FD-V3` refuses only a `join` or an `end`. **A map node is never itself a branch entry**
(`FD-V25` makes a map's `branch` a `task` or an `ask`, and `FD-V9` a fanout's entries the same two kinds — v0.42), so `JP-R11` does not
reach what a map node receives — only what its instances do.

**What each INSTANCE receives is `over`'s array at that instance's index, as its own copy** —
`JP-R11` in [spec/join-policy.md](join-policy.md) section 4, and
[ADR 0037](../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
rule 3. **That is what makes `over` mean something**: handed the whole value instead, an instance can
only find its own item by an index nothing gives it, and `over` would name an array whose sole use is
its `length`.

*(This paragraph read *"deliberately not settled here … what a node receives is
[Q11](../doc/questions/q11.md) and belongs to
[W34](../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md)"*. **It is the same
shape as the `FD-R2` paragraph below and it is answered rather than left**: that one addressed a
run-time question to W33 by name, W33 built the answer and shipped it with **no rule id anywhere in
`spec/`**, and only its conformity reader caught it. The rule is `JP-R11` and it lives in
`spec/join-policy.md` because that is the document whose section 4 fixes what the driver does when it
opens a region; **[Q164](../doc/questions/q164.md) is why it is not `FD-`-prefixed.** Q11 itself stays
**open in general** — a run-scoped accumulator and a per-edge mapping are both unbuilt.)*

**What happens when `over` names a key that is absent, or holds something that is not an array, is
a RUN-TIME question, and v0.9 answers it as `FD-R2`.** It was left open here for
[W33](../doc/work-items/w33-a-map-at-run-time-arity.md), because P10's *"decisions taken before
fan-out"* rule 4 said *"this plan declares no policy refusal, no construction check and no new
error class, because every candidate for one is a measurement W33 has not taken yet."* **W33 took
the measurement**, and the rule is below with `FD-R1` — the other rule in this document about what a
RUN does rather than about what a document may say.

| id | | Test owed by |
|---|---|---|
| `FD-R2` | **A `map` whose `over` does not name an ARRAY on the value it receives stops the run**, reported as an `UnresolvedMapArity` naming the node and the key. `FD-V25` checks that `over` is a key NAME in `FD-V16`'s charset and **can check nothing else**, because no validator can see a value that does not exist yet — so this is the one `map` refusal that cannot be a `FD-V`. **An empty array is NOT this**: zero items is a lawful arity and its run is `stuck` (`spec/join-policy.md` section 5). **Why its own class and not `InvalidDefinition`**: the definition is valid and the previous node did not produce what the flow says it does, which is a different person's bug — a flow author reading `InvalidDefinition` would go and read their flow, where there is nothing to find. Reported through `OR-R10` from a listener, and reported **and rethrown** from `start()` and `resolve()`, which are caller-initiated. Test: `test/driver/map.test.ts` | **W33** |

*(Recorded here rather than in `spec/join-policy.md` because it is about a `map` NODE's `over` and
not about a join — and `FD-R1` establishes that a rule about what a run does may live in this
document. W33's conformity reader found the refusal shipped with **no rule id anywhere in `spec/`**,
which `doc/workflow.md` section 1 rule 3 refuses: *a decision not in `spec/`, an ADR, or a plan did
not happen*. `spec/flow-definition.md` is [W32](../doc/work-items/w32-what-a-map-fanout-is.md)'s and
W33 took it as a declared late exception.)*

**A `map` node has no `edges`** (`FD-V25`), exactly as a `fanout` has none (`FD-V9`): its one arc is
`branch`, and the region's exit is the join.

### `gate` — a decision WITH MEMORY — v0.23

[ADR 0066](../doc/decisions/0066-a-gate-is-a-decision-with-memory-that-names-a-registered-type-and-wires-every-route-exactly-once.md), [P24](../doc/plans/p24-what-a-node-may-remember-across-a-runs-branches.md)
decisions 1-4 and stop-and-asks (a)-(d).

```json
{ "id": "dedupe", "kind": "gate", "type": "distinct", "settings": { "key": "series.id" },
  "edges": [ { "to": "seriesSetup" },
             { "route": "duplicate", "to": "dropDuplicate" },
             { "route": "nokey", "to": "dropNoKey" } ] }
```

| key | | |
|---|---|---|
| `type` | required | a registered GATE type — a built-in (`distinct`; since v0.31 `if` and `switch`, below) or one the registry's `gateTypes` adds (`FD-V39`). Gate types are CODE, not document entries: a type's decision is a function, which a JSON registry cannot carry (ADR 0002 rule 1) — the section 3 registry subsection's *Gate types* |
| `settings` | optional | a plain object its type's `settingsSchema` accepts and, since v0.30, its type's `settingsProblem` passes, `{}` when absent (`FD-V40`). **`key` is the one setting the library reads**: where present it is a KEY PATH, below |
| `edges` | required | each `{ to, route? }` — `route` names one of the GATE's routes and is ABSENT for the DEFAULT route; nothing else may sit beside them (`FD-V41`). *The gate's routes are its type's, declared or — since v0.30 — derived from this gate's `settings` (below)* |

**It routes and computes nothing.** What leaves a gate on the route its type chooses is exactly the value
that reached it — the same value, never its settings and never the predecessor's whole record — so a gate
is invisible to what the next node receives: `FD-C1`'s *"the value this node receives"* for the node after
a gate is the value the gate received. **It is dispatched to no scheduler**, so it has no task id and
**produces no output** — `FD-V27` refuses a reference to one, as it refuses a reference to any node that is
not a `task` or (v0.42) an `ask`.

**Routes, and the DEFAULT route.** A gate type DECLARES its routes; `distinct` declares `first`,
`duplicate` and `nokey`, with `first` its default. An edge names a route with `route`, and **an edge with
no `route` carries the type's DEFAULT route — never *every* route**: the precedent is a `task`'s edge with
no `on`, which means `done` and nothing else. The default is whichever route the type names, **not
necessarily its first**; for `distinct` the two coincide, which is why W92's suite registers a type whose
default is not its first route.

**A gate's routes are the GATE's, resolved once — v0.30** ([ADR 0092](../doc/decisions/0092-a-gate-types-routes-are-declared-statically-or-derived-from-its-node.md)).
A type declares its routes STATICALLY — the same `routes`, `defaultRoute` and `keyResolvedRoutes` for every gate
naming it, as `distinct` does — or DERIVES them from the gate's own `settings` by `routesFor`, so two gates of
one type may have two route sets; exactly one of the two (the section 3 registry subsection's *Gate types*).
**Each gate's ROUTE SET is resolved ONCE, at instantiation, once `FD-V40` found nothing on that gate** — by the
validator and by the driver; the wiring check, which does not validate first, resolves it over the settings as
given and treats a set that does not resolve as it treats an unknown type: no default and no guarantee. A static
type's three members, or what `routesFor` returns for a COPY of the gate's settings (`{}` when absent), held to
the clauses the static members are and refused at the gate as `FD-V39` where it throws or is malformed. A
`settingsProblem` that THROWS is the type's defect (`FD-V39`) and blocks resolution exactly as a refusal does, so
that gate's edges are not counted either. **Every
reader of a gate's routes reads that set and never the type's members**: `FD-V41` counts each gate's edges
against its OWN set — a route wired on one gate of a derived type and missing on another is refused at the
other alone — an edge with no `route` carries the set's default, a route outside the set stops the run by
`FD-R5` even where another gate of the same type declares it, and the wiring check's guarantee is the set's
`keyResolvedRoutes`. The driver resolves each gate's set once, when it is constructed, and every decision of
the run reads that one answer; a resume is a new driver and resolves it again, from the same settings by the
same function — so `routesFor` is the pure function of its settings Q9 asks every decision to be, and a type
that is not one is the type's defect, which nothing here checks. **What a gate IS does not move**: a node that
routes by a registered type and computes nothing. *Memory* is something a type MAY use — `distinct` does — and
the subsection's title says *with memory* because that is what v0.23 shipped, not because a type must have one.

**Every route is wired exactly once, and a drop is an edge to an `end`** (P24 decision 4). An unwired
route, an edge naming a route the type does not declare, and two edges for one route are all refused at
instantiation against the registry (`FD-V41`) — and a gate edge carrying `when`, `on` or `needs` is refused
too: a gate has no terminal state for `on` to select, runs no predicate for `when` to name, and hands on
what reached it, so an edge `needs` would have no reader. *Over*: dropping by OMISSION, which the library
allows for a task's terminal states because those are a fixed list the library owns; a gate type's routes
are the registry's, the registry carries no version ([Q249](../doc/questions/q249.md)), and a route added
to a type later would be dropped in silence by every flow that had omitted it. **A route dropped to an
`end` produces exactly the events an `end` already produces** — `pathEnded`, and `branch.exited` inside a
region, with the run `completed` — measured at P24's declaration (fact 3) on an emulation, with no new rule.

**The KEY PATH — P24 stop-and-ask (d)**: dot-separated OBJECT keys, each segment in `FD-V16`'s charset
(`^[A-Za-z0-9_-]{1,64}(\.[A-Za-z0-9_-]{1,64})*$`), over the value the gate receives. **No array index, no
wildcard, no expression** — a key a flow needs COMPUTED is computed in the task before the gate, because
the driver has no `async` and every expression language here evaluates to a Promise (ADR 0051). Checked
by `FD-V40` on EVERY gate that declares `key`, because the library, not the type, resolves it: a segment
that is not an own key of a plain object — a missing key, `null`, an array mid-path, a primitive — resolves
to *nothing*, which `distinct` routes to `nokey`. **The grammar is not a `settingsSchema`'s to state**: the
subset has no `pattern` (ADR 0053).

**Where a gate may stand.** Anywhere a `task` may, except as a region's branch entry — `FD-V9` and `FD-V25`
keep those a `task` (or, since v0.42, an `ask` — never a gate), unchanged for a gate. Inside a region a gate is a member like a task (`FD-V13`, `FD-V19` and
`FD-V22` apply to it as to any non-`end` node), and its out-arcs are DISJUNCTIVE — exactly one route is
taken — which is how `FD-V29`'s certainty walk already reads a `task`'s. It may be the `entry`; `FD-V3`
refuses only a `join` or an `end`.

**What RUNNING a gate does — v0.24** ([ADR 0067](../doc/decisions/0067-a-gate-runs-in-the-driver-its-memory-is-the-drivers-and-its-decision-is-recorded.md), P24 decisions 5-8). *(v0.23 said
this was W93's and that until then `new Driver` refused every flow holding a gate at construction — ADR 0066
rule 7, which v0.24 LIFTS.)* The driver evaluates a gate **synchronously, where a branch ENTERS it** — no
dispatch, no task id, no scheduler:

1. **It asks the type.** `fn` is handed `{ key, input, settings, memory }`: `input` and `settings` are COPIES,
   so a type writing into either moves nothing the run holds — a predicate is handed a copy for the same
   reason; `key` is `settings.key` resolved by the key-path rule above over **that copy — the value as a
   `structuredClone` carries it**, ONCE, and recorded as a copy taken BEFORE the type runs (absent where the
   gate declares no `key` or a segment resolves to nothing). *Over the clone and not the value itself*: the
   two differ only for a caller's entry payload holding a CLASS instance, whose clone is a plain object — and
   a resume enters from the header's clone (`spec/run-state.md`'s `RN-R19`), so reading the original would
   make a run and its replay resolve different keys (measured by W93's conformity reader: an honest
   checkpoint refused `diverged` at 0). `OR-R11`'s *a value, not an object*, at the one place a caller's own
   object reached a decision; and `settings` is `{}` where the gate declares none. `memory` is **the gate's
   memory: ONE per gate per RUN**, the same `Map` for every branch that reaches the gate whatever region
   instance or map item it comes from (P24 stop-and-ask (a)).
2. **A route the type does not declare stops the run** — since v0.30, a route outside the GATE's resolved set,
   which for a static type is the same sentence — `FD-R5`, `UndeclaredRoute`, through `OR-R10`; and
   a type that THROWS stops it with the thrown error as it is, which is what a throwing decision predicate
   does (measured at W93's declaration step). Nothing is recorded for the gate in either case.
3. **It records the decision** — a `gated` fold input, `spec/run-state.md`'s `RN-R26` — before anything the
   route leads to.
4. **It takes the ONE edge wired for the returned route** — an edge with no `route` for the DEFAULT — handing
   on **exactly the value that reached the gate**, with the branch that reached it, so an `end` after a gate
   is that branch's `branch.exited` and a `join` after one is that branch's arrival.

**Which branch is FIRST is the order branches REACH the gate** — the order the run's settlements arrive in,
which is the order of the log — and a resume reproduces it exactly, because the gate's memory is rebuilt by
REPLAY: the driver that resumes a run starts it EMPTY and re-asks every gate on the stored settlements in
their order (`RN-R26`). **Never a memory kept anywhere else**: measured at W93's declaration step, a memory
kept by the PROCESS resumed a run killed before its first gate decision WRONG, with nothing refused — that
decision lay past the stored events, where `RN-R20` compares nothing.

**`FD-R4` through an ENTRY gate holds the payload to the target the gate CHOOSES.** *A task the payload
reaches with no worker in between* is, through a gate, the one its route leads to — so the driver asks the
entry gate's type at `start()` against a THROWAWAY memory, which is empty, exactly what the run's memory is
before its first decision, and holds the payload to that route's target alone (unless that target declares a
`transform`, which is not held, v0.40); a type that throws or returns
an undeclared route there holds nothing past the gate, and the run then stops on it for real. The static
wiring check still lists every route's target, since any of them is a place the payload may land.

**`distinct` — the first built-in gate type, and the one that REMEMBERS:**

| route | taken when |
|---|---|
| `first` | **the default.** The key has not reached this gate before in this run |
| `duplicate` | it has |
| `nokey` | the key is missing, `null`, or not a string or a number (P24 stop-and-ask (c)) — **and a number that is not FINITE is not a key either**: W92's refinement of (c)'s words rather than (c) itself, because `NaN` and the infinities have no JSON value (`JSON.stringify(NaN)` is `"null"`), so two of them could not be told apart from `null` or from each other — *over* stopping the run (one bad file ends a batch) and treating the missing key as a key (every unidentified file after the first dropped as a duplicate of *"undefined"*) |

Its settings are `{ key }` — required, a non-empty string, no other key — and keys are compared as JSON
values, so `"1"` and `1` are two keys. **Which branch is FIRST is the order branches reach the gate in a
run, which varies between runs** (P24 decision 7) — no test may assert which one wins, only that exactly one
does per key ([Q379](../doc/questions/q379.md)).

**`if` and `switch` — two built-ins that decide WITHOUT memory — v0.31** ([P32](../doc/plans/p32-what-a-gate-may-decide-without-memory.md)
decisions 1, 4-6 and stop-and-asks (b) and (c), [W154](../doc/work-items/w154-the-built-in-if-and-switch.md)). Each
routes the value that reached it by its settings and that value alone, and is registered through the interface
exactly as `distinct` is: nothing in the validator, the wiring check or the driver names either. Neither has an
export of its own name — both are words a `const` cannot carry — so code reaches them as a flow does, by name:
`BUILT_IN_GATE_TYPES.if`, `BUILT_IN_GATE_TYPES.switch`.

```json
{ "id": "triage", "kind": "gate", "type": "if",
  "settings": { "when": { "path": "input.priority", "op": "gte", "value": 5 } },
  "edges": [ { "route": "then", "to": "escalate" }, { "to": "queue" } ] }

{ "id": "byStatus", "kind": "gate", "type": "switch",
  "settings": { "key": "status", "cases": { "approved": "approved", "rework": ["rejected", "needs-changes"] } },
  "edges": [ { "route": "approved", "to": "publish" }, { "route": "rework", "to": "revise" }, { "to": "review" } ] }
```

| type | settings | routes | taken when |
|---|---|---|---|
| **`if`** — a STATIC type | `{ when }`, required, no other key. `when` is a COMPARISON or a FLAT GROUP — section 3's grammar, `FD-V42`-`FD-V45`, **minus the NAME shape** — whose path starts at the ONE root **`input`** (section 3's *The `input` root*) | **`then`**, and **`else`** — the DEFAULT, so an edge with no `route` is the fallback as a task's edge with no `when` is (P32 stop-and-ask (b)) | `then` where `when` holds over `{ input }` by the evaluator a task edge's `when` uses — the same operators, the same absent rule, the same `default` and `length` — and `else` otherwise |
| **`switch`** — a DERIVED type (ADR 0092) | `{ key, cases }`, both required, no other key. `key` is the library's KEY PATH (above, `FD-V40`); `cases` maps a CASE NAME — a route name in `FD-V16`'s charset, `default` reserved — to a SCALAR (`null`, a boolean, a finite number or a string) or a non-empty array of scalars, and **a value named by two cases is refused** — so is an EMPTY `cases`, *always `default`* written as a question, and a value repeated INSIDE one case (W154 stop-and-ask (l), the maintainer's answer) | **the GATE's**: every case name, in the order the PARSED object enumerates them — integer-like names (`"2"`, `"404"`) first in ascending numeric order, then the rest in the document's order, because `JSON.parse` has already lost the document's order for the first kind — then **`default`**, the DEFAULT. The order moves no routing and only how a message lists the routes. **`keyResolvedRoutes` is every case** — no case value is absent, so a case is taken only where the key path resolved | the case one of whose values is `===` the resolved key — **type-strict**, `FD-C7`'s *no coercion*, so `"1"` and `1` are two values and `true` is not `1`; `default` where the key did not resolve or matches no case |

**Neither is told a registered predicate name**: a name is handed a `DecisionContext` — an outcome and an edge's
`needs` — and a gate has neither, so `if` refuses one by name and a decision that needs code is a gate type of its
own (P32 Scope/Out). **Every defect in either's settings is `FD-V40`** — the schema's, the key path's, and its
`settingsProblem`'s, the condition's grammar included, whose message names the `FD-V42`-`FD-V45` clause it broke
(P32 decision 7) — and **`FD-V41` counts a `switch` against its OWN cases**, so a case left unwired is refused at
load naming the case. A `switch` is what an edge chain of `{ "op": "eq" }` comparisons and a default is, with the
one thing that chain cannot say: that a case was forgotten. **Ordered conditions stay a cascade of `if`s or a
task's edges** (P32 stop-and-ask (c)) — first-match-wins over a list of conditions is a task's edges already.

**What the wiring check reads of each**: a `switch`'s case routes are key-resolved along its `key`, so ADR 0068's
refinement and v0.26's refusing direction apply to it unchanged. **An `if` makes NO guarantee**: its path is
inside `when`, not `settings.key`, so what leaves it on `then` is what arrived, unrefined — a task after `then`
requiring the key the condition compared reads `no` against a producer that declares the key without requiring
it. The refinement along an `if`'s path is priced in W154's declaration and not shipped.

### `ask` — a node that waits for a PERSON — v0.42

[P35](../doc/plans/p35-may-a-node-wait-for-a-person-by-design.md) stop-and-asks (a) and (h),
[ADR 0108](../doc/decisions/0108-an-ask-is-a-seventh-node-kind-with-a-task-id-and-no-dispatch.md),
[W179](../doc/work-items/w179-the-ask-node-in-the-definition.md). This subsection is the DEFINITION; what a run does
when a branch reaches an ask — it parks, keeps what reached it, and takes the person's answer at `resolve()`,
held to `answerSchema` — is `spec/run-state.md`'s `RN-R36` and `RN-R37` (v0.22, W180,
[ADR 0109](../doc/decisions/0109-an-ask-parks-with-nothing-dispatched-and-its-answer-is-its-result.md)): ONE `asked`
fold input carrying what reached it, NOTHING handed to the scheduler, the node `suspended` and the run
`awaiting_action`; the answer is `resolve(taskId, 'done' | 'failed', …)`, held to `answerSchema` by `FD-R4`'s resolve
boundary, and it IS the node's result (`spec/outcome-record.md` section 7). *(Until v0.43 a `Driver` refused the run
where a branch entered an ask, by name — ADR 0108 rule 8's interim, W179.)*

```json
{ "id": "approve", "kind": "ask",
  "settings": { "question": "Publish this summary?" },
  "answerSchema": { "type": "object", "required": ["approved"], "properties": { "approved": { "type": "boolean" } } },
  "needs": { "summary": "summarise" },
  "edges": [
    { "on": ["failed"], "to": "declined" },
    { "when": { "path": "outcome.result.approved", "op": "eq", "value": true }, "to": "publish" },
    { "to": "revise" }
] }
```

| key | | refused by |
|---|---|---|
| `settings` | **opaque**: a plain JSON object the library never reads — the question, a form hint — which a UI reads from the definition, as a gate's are read by its type | `FD-V21`, not a plain object |
| `answerSchema` | what a `done` answer must satisfy: a JSON Schema in the built-in subset (section 3), held to it AT LOAD by the function a worker's schemas are held by, its `examples` held to it (ADR 0056). Absent, a `done` answer is held to nothing. A `failed` answer — the person DECLINING — is held to nothing either way | `FD-V48`, outside the subset |
| `needs` | what reaches the ask — `FD-C1`'s composition, in the driver, as a task's. Without it, the ordinary edge's value. **No `transform`**: a transform runs only in a node type's worker wrapper (`FD-C6`), and an ask runs no worker (P35 decision 6) | `FD-V26`-`FD-V29`, as on a task |
| `edges` | REQUIRED, and held as a task's are: a `done` edge, a default per terminal state an edge opts into, `on` drawn from `done` and `failed`, a `when` in section 3's grammar over `outcome` and `needs` — `outcome.result` being the answer. No `route` | `FD-V7`, `FD-V18`, `FD-V23`, `FD-V41`, `FD-V42`-`FD-V45`, `FD-V4` |

**What an ask does NOT carry, and why one rule owns it.** `type`, `pool`, `optional`, `retryPolicy`, `workerGroups`
and `transform` are each a key a task's WORKER or its scheduler task reads — the type and its pool, `optional`,
`retryPolicy` and `workerGroups` are handed to the scheduler, and a `transform` is evaluated in the type's wrapper
— and an ask has neither. **`FD-V47` refuses each, one finding per key, and `FD-V17` does not report them a second
time**: `FD-V41`'s precedent for `route`, one rule owning a key wherever it is refused, so an author who turned a task
into an ask reads *only a task declares it* rather than *undeclared*. Every other key not in the row above is
`FD-V17`'s as on any kind.

**Where an ask may stand: wherever a `task` may** (stop-and-ask (a)) — the entry (`FD-V3` refuses only a `join` and
an `end`), a fan-out's branch entry (`FD-V9`), a map's branch (`FD-V25`) — one ask, and one task id, PER ITEM — and
inside a region before its join. **What it produces is the person's answer**, so a reference to an ask is admitted
(`FD-V27`) as a reference to a task is, and `FD-V28` and `FD-V29` ask of it what they ask of a task: how many
outputs, and whether it must have run. **How it routes is a task's settlement's** (stop-and-ask (h)): `on:
["failed"]` is the person declining, a `when` reads the answer, and an unmatched `done` with no default is
unreachable for the reason it is on a task (`FD-V7`; [Q10](../doc/questions/q10.md)).

## 3. Edges, decisions, and which outcomes route

```json
{ "id": "score", "kind": "task", "type": "Scorer", "optional": true, "edges": [
    { "on": ["failed"], "to": "quarantine" },
    { "when": { "path": "outcome.result.confidence", "op": "lt", "value": 0.5 }, "to": "review" },
    { "to": "publish" }
] }
```

*(This snippet read `"workerType": "ScoreWorker"` until v0.27 — a key **retired at v0.19** with
[ADR 0054](../doc/decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md),
so section 3's opening example had shown a shape `FD-V17` refuses for eight versions. Corrected in
passing by W108, which owns this document and was editing the table under it. **And THREE snippets
carried it, not one**: section 2's `retryPolicy` subsection and section 3's `needs` subsection did
too, 150 lines either side of this note — W108's conformity reader (13), which is
`doc/workflow.md` section 1 rule 5's withdrawn-claim clause exactly, *search for the phrase rather
than correcting where you found it*, on an item that had just written the correction down. Nothing
compares a snippet in `spec/` to the grammar the same document declares: `check:docs` executes
`AGENTS.md`'s and `README.md`'s fences and reaches no `spec/**` file
([Q449](../doc/questions/q449.md)).)*

| Edge key | | |
|---|---|---|
| `to` | required | a node id |
| `on` | optional, default `["done"]` | the terminal states this edge is eligible for. Values: `"done"`, `"failed"` (`FD-V18`) |
| `when` | optional, **an OBJECT since v0.27** | a registered name `{ predicate }`, a COMPARISON `{ path, op, value, default?, length? }`, or a FLAT group `{ all }` or `{ any }` — the subsection below, `FD-V42`-`FD-V45`. An edge without one is the default for its eligible states. *(It was a bare predicate-name STRING until v0.27, and a string is now refused by `FD-V42` with the object form in the message.)* |
| `needs` | optional, v0.12 | **what this edge's PREDICATE sees**, under `ctx.needs` — `FD-C3` below. Same grammar as a node's `needs`, **minus the `"."` form** (`FD-V26`). An edge with no `when` may carry one and no predicate ever reads it |
| `route` | optional, v0.23, **a GATE's edges only** | which of the gate type's routes this edge carries; absent means the type's DEFAULT route. On any other node's edge it is refused, and a gate's edge carries `to` and `route` and nothing else (`FD-V41`) — section 2's `gate` subsection. **The routing rules below are a `task`'s, an `ask`'s (v0.42 — an ask routes as a task's settlement does) and a `join`'s**; a gate's edge is chosen by the route its type returns |

> **This table is what `FD-V17` refuses against, so `needs` being absent from it made the code
> accept a key the document did not declare.** `FD-V17` reads *"a node object, **an edge object**, or
> the document carries a key its kind does not declare"*, and section 2's node table was widened at
> v0.11 for exactly that reason while this one was not — so for one item `EDGE_KEYS` and this table
> disagreed, in the accepting direction, which is `spec/README.md` rule 4's inverse. W42's conformity
> reader. *An undeclared-key rule is only as good as the table it reads.*

**Routing, in order:**

1. A node's **effective outcome** ([spec/outcome-record.md](outcome-record.md) section 7) supplies a
   `terminalState`, which selects the **eligible** edges — those whose `on` contains it (ADR 0004
   rules 1-2). Eligibility is checked before anything else.
2. Among the eligible edges, **in declaration order**, the first whose `when` answers true is taken.
   Later edges are not evaluated. An edge with no `when` always passes.
3. A `when` is held to its GRAMMAR at instantiation, never at routing time (ADR 0002 rule 3) —
   `FD-V42`-`FD-V45` — and where it names a registered predicate that name is resolved against the
   registry at the same moment. An unknown name is an instantiation error (`FD-V4`).
4. A predicate receives a single `DecisionContext` argument and returns a boolean. It carries
   **`outcome`** — always the node's effective outcome, one shape whether the node settled or was
   resolved — and, since v0.12, **`needs`**: what **this edge** declared, or `{}`. *(This rule read
   *"P1 populates exactly one field … whether the context also carries accumulated run state is
   [Q8](../doc/questions/q8.md); adding a field later is additive rather than a signature change"*.
   **It was additive and the sentence was right about that**; what it did not predict is that the
   field would be declared on the EDGE — see `FD-C3`.)*
5. A predicate is pure (ADR 0002 rule 4). **For a registered NAME purity is not enforced by this
   document** and [Q9](../doc/questions/q9.md) is about the mechanism; **for a DECLARED predicate
   it is enforced by construction** — the subset has no clock, no random source, no I/O and no way
   to name anything but the context, so a declared predicate CANNOT be impure. That is strictly
   stronger than Q9's measured result for a function, where evaluating twice caught 1 impurity shape
   of 4 and was flaky on `Math.random()`.

### `when` — a registered NAME or a DECLARED comparison — v0.27

[ADR 0074](../doc/decisions/0074-a-predicate-is-a-registered-name-or-a-declared-comparison-over-the-context.md),
answering [Q444](../doc/questions/q444.md), under
[P26](../doc/plans/p26-what-a-flow-can-say-without-code.md).

```json
{ "when": { "predicate": "isLowConfidence" }, "to": "review" }
{ "when": { "path": "outcome.result.confidence", "op": "lt", "value": 0.5 }, "to": "review" }
{ "when": { "all": [
    { "path": "outcome.result.score", "op": "gte", "value": 50 },
    { "path": "needs.earlier.flagged", "op": "eq", "value": true }
] }, "to": "review" }
```

**A `when` is an object and is exactly ONE of three shapes, told apart by which keys are present**
(`FD-V42`). An object marking none of them, or more than one, is refused; so is a key the shape it
marks does not declare, which is `FD-V30`'s and `FD-V37`'s reading — *the evaluator reads exactly
these, so a key beside them is a typo that would mean something quietly*.

| shape | marked by | carries | |
|---|---|---|---|
| a registered **NAME** | `predicate` | `predicate` and nothing else | the name road, unchanged since P1 except for its spelling. Resolved against the registry at instantiation (`FD-V4`) |
| a **COMPARISON** | `path` or `op` | `path`, `op`, `value` required; `default` and `length` optional | one question about the decision's own context |
| a flat **GROUP** | `all` or `any` | one of `all`, `any`, and nothing else | a non-empty array of COMPARISONS. **Nesting is refused by name** and so is a member naming a registered predicate (`FD-V45`) |

**Why a group's member may not be a NAME**, which is the one restriction that needs an argument
rather than a precedent: a group holding a function could be impure, and that would falsify the only
thing a declared predicate guarantees over a registered one (rule 5 above). A predicate that must
mix the two is a registered name that calls both.

**The PATH is a key path over the `DecisionContext` itself** (`FD-V43`), resolved by the same
`readKeyPath` a gate's `settings.key` gets — dot-separated object keys, each in `FD-V16`'s charset,
**no array index, no wildcard, no expression**. Its **first segment is `outcome` or `needs` and
nothing else**, and a root alone names no value:

| | |
|---|---|
| `outcome.result.confidence` | the node's effective outcome, `OR-R9` — the same record a registered predicate reads under `ctx.outcome` |
| `outcome.taskId`, `outcome.terminalState`, `outcome.attempts` | the driver's own fields on that record. **No schema describes them**, which is why a wiring verdict over a predicate's path is not this version's |
| `needs.earlier.flagged` | what THIS EDGE's `needs` composed, `FD-C3` — `{}` where the edge declares none, so every path under it is absent |
| `outcome`, `needs` | **refused**: a root is a container and a comparison against it could only ever be no match |
| `outcom.result.x`, `result.confidence` | **refused**: a first segment that is neither root would resolve to nothing in silence, which is a wrong key rather than a question |

**The `input` root — an `if` gate's condition, and nowhere else — v0.31** (P32 decision 4,
[W154](../doc/work-items/w154-the-built-in-if-and-switch.md)). The built-in `if` gate (section 2) carries a `when`
in its SETTINGS, held to this subsection's grammar **minus the NAME shape**, and asked over `{ input }` — **the value
that reached the gate**, as the driver's `structuredClone` carries it (ADR 0067's reading, so a run and its replay
agree) — by the evaluator this subsection describes. Its ONE root is **`input`**: `outcome` and `needs` are refused
there, because a gate has no outcome and no edge `needs`, and `input` is refused on a task's or a join's edge,
because a `DecisionContext` has no `input` and the path would resolve to nothing in silence. **Two scopes, not one
wider list.** `input` ALONE is refused as a root alone is: a gate's path names a key INSIDE the value that reached
it, as every gate's key path does, so a value that must be compared whole is wrapped by the task before the gate.
**Every defect in that `when` is reported as `FD-V40`** — the gate's settings — with the message of the
`FD-V42`-`FD-V45` clause it broke (P32 decision 7).

**The OPERATORS are a CLOSED enumeration of seven** (`FD-V44`), and one outside it is refused by
name — ADR 0053's shape, and what keeps this from becoming a bad expression language one shape at a
time. A predicate that COMPUTES — a regular expression, a date window, a lookup, a negated prefix —
stays a registered name, and that boundary is this paragraph rather than a surprise.

| | |
|---|---|
| `eq`, `ne` | against any scalar, by `===` |
| `lt`, `lte`, `gt`, `gte` | against a **number** |
| `startsWith` | against a **string** |

**The six comparisons are closed under negation OVER THE VALUES THEY CAN COMPARE** — `eq`/`ne`,
`lt`/`gte`, `gt`/`lte` — so `not p` is written as `p` with the complementary operator and no `not`
combinator is needed; a combinator would open the nesting a group refuses. **`startsWith` is not
closed at all**, so a negated prefix is one of the things that stays a name.

> **The scope is part of the claim, and this sentence said *closed* flatly until W108's conformity
> reader measured it.** `eq` and `ne` complement over every value. The four ORDERING operators
> complement over **numbers**, and over a path that does not resolve where the comparison declares a
> `default`. **Over a value they cannot compare — a string, a boolean, an array, a resolved `null`
> with no default — BOTH are false**, because the comparison is type-strict and no `default` fires
> on a path that resolved. Measured: `score` holding `"9"` is `gt 0.5` false and `lte 0.5` false.
> So *write `gte` as the negation of `lt`* is sound where the producer's values are numbers and is
> not a general identity — which the type-strict rule above already implies and which two paragraphs
> stating it separately managed to contradict.

**`value` is a SCALAR** — `null`, a boolean, a finite number or a string — and nothing else.
Admitting an object would need a deep-equality semantics with no instance in this tree and no
obvious right answer for `NaN`, key order or a prototype.

> **A comparison between kinds is NO MATCH and never a coercion.** `{ "path": "outcome.result.score",
> "op": "lt", "value": 50 }` is false where the value is the string `"9"`, where JS `<` would coerce
> and answer true. This is `FD-V30`'s own argument — *a string `maxRetries` retries by coercion* —
> one rule over, and it is **measured**: over 1800 contexts a type-strict form reproduces all three
> of this tree's `typeof x === 'number' && x < t` predicates exactly, and differs from one unguarded
> body on exactly that string.

**An ABSENT path is NO MATCH, and `default` is what a comparison may put in its place.** A path that
does not resolve — a missing key, `null` or an array mid-path, a primitive, a class instance — gives
`undefined`, and a comparison against it is false whichever operator it uses. Where the comparison
declares `default`, that value is substituted instead, **before `length` is taken**.

**A path that resolves to `null` takes the `default` too**, so the substitution is exactly what `??`
does. Where a comparison declares NO `default`, a resolved `null` stays `null` and is compared as
the scalar it is — so `{ "op": "eq", "value": null }` holds, which a blanket *null is no match*
would have broken.

> **`default` is what makes the comparisons closed under negation over the values they can compare,
> and that is why it is in the grammar rather than left out as a convenience.** Without it both
> `score > 0.5` and `score <= 0.5` are false for an absent `score`, so **no pair of operators
> complements** and the negation of a comparison has no declared form. With `default: 0` the pair
> partitions, over an absent path and over a null-valued one alike.
>
> **Its nullish half is BOTH of W108's readers' shared finding, reached from opposite ends**, and
> until they did this paragraph said *the pair is exact* without the scope above and *it is `?? 0`*
> while the substitution fired on `undefined` alone. On a key holding `null` the pair was BOTH
> false, so the declared form did not reproduce `(r?.score ?? 0) > 0.5`'s negation — the one shape
> the `default` key exists for. *A measurement that covers `null` on one root and not on the root
> the feature uses has not covered `null`.*

**`length: true` compares the LENGTH of an array or a string**, applied after `default` and before
the comparison; a value that is neither has no length and is no match. It is exactly `true` or
absent — there is no *compare the value, not its length* to ask for — and with it the `value` is a
number and the operator is not `startsWith`.

| | |
|---|---|
| `FD-C7` | **What a DECLARED predicate reads, and what it may do.** Exactly the `DecisionContext` `FD-C3` describes, through one key path per comparison, by `readKeyPath`'s own resolution. It reads nothing else: there is no clock, no random source, no I/O, no registry lookup and no reference to another node. **So its answer is a pure function of the fold's own inputs**, and re-evaluating it over the same log gives the same answer — which is `doc/concept.md` section 5's invariant made true by construction rather than by convention. Test: at ladder L1 that each operator, the absent rule, `default` and `length` answer what this section says over a table of values including absent, `null`, wrong-type and boundary; and at ladder L2 that a flow whose only `when` is declared routes both ways on one definition and two payloads, with **no predicate registered at all**. | **[W108](../doc/work-items/w108-a-predicate-is-data.md)** |
| `FD-C8` | **What the built-in `if` and `switch` READ, and what they may do** — v0.31, P32 decision 6. Each reads exactly its gate's SETTINGS and the value that reached the gate, as the driver's clone carries it: `if` through its condition's key paths, by `readKeyPath` over `{ input }` and the evaluator `FD-C7` describes; `switch` through the gate's resolved `key` — the library's key path, which the driver resolves and hands it — compared `===` against its cases. **Neither reads the gate's memory**, so a branch's route never depends on which branches came before it; neither reads a clock, a random source, the registry or any other node, and neither performs I/O. **So each answer is a pure function of the gate's settings and the value that reached it**, and replaying a run re-asks both to the same answers (`RN-R26`, unchanged). Test: at ladder L1 that each, called as the driver calls it, answers what section 2's built-in table and this section say over a table of values — absent, `null`, wrong type, boundary, `"1"` against `1`, a value named in an array case — and leaves the memory it is handed EMPTY; at ladder L2 that every route of both is taken on one definition each, with no predicate and no gate type registered, and that two branches with one key take the same route at a `switch` where `distinct` routes the second `duplicate`. | **[W154](../doc/work-items/w154-the-built-in-if-and-switch.md)** |

**What the edge CARRIES, as opposed to which edge is taken — v0.10.** Routing above decides *which*;
this is the other half and until v0.10 no document in `spec/` stated it, which is the gap
[Q11](../doc/questions/q11.md) and [Q154](../doc/questions/q154.md) both lived in.

> **An ordinary edge carries the source node's effective-outcome `result`, deep-copied.** The copy is
> `spec/outcome-record.md` section 4's *"copying the field copies the reference"* applied to the one
> exit that reaches a worker: without it the next task's payload **is** the record's `result`, and an
> inline worker mutating what it was given edits a record already in the log.

### `needs` — what a node receives, when it is not the previous node's output — v0.11

[ADR 0040](../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md),
answering [Q11](../doc/questions/q11.md) **in general**, with
[Q166](../doc/questions/q166.md) and [Q165](../doc/questions/q165.md) as its cases.

```json
{ "id": "score", "kind": "task", "type": "ScoreWorker",
  "needs": { "item": ".", "run": "ingest" },
  "edges": [ { "to": "collect" } ] }
```

**`needs` is optional, and a node without one receives exactly what the paragraph above says.** That
is the whole of rule 1: the default is unchanged, so every flow written against v0.10 behaves at
v0.11 exactly as it did — measured, at 574 L1-L5 cases unmoved.

A node that declares one receives **the object `needs` describes, and nothing else**. There is no
wrapper and no reserved key, because `"."` is how an author asks for what the edge carried — and, since v0.44,
`"$payload"` is how an author asks for what the RUN was handed, and since v0.45 `"$item"` what opened its MAP INSTANCE.

| a reference is | and resolves to |
|---|---|
| `"."` | **whatever this node would have received had it declared nothing** — whichever of this document's arcs it sits on: the ordinary edge's value above, a `fanout` branch entry's own copy or a `map` instance's own item (`JP-R11`), or a satisfied join's collection (`JP-R12`). *(This row enumerated the first and the last of those and omitted the two in between; **`map-over-region-output`'s `rank` sits on a join's exit edge**, so one of the omissions is in this item's own corpus. W41's conformity reader.)* It is one of the grammar's invented tokens — `?` is another, two rows down, and since v0.44 the `$` prefix, one row down — and it is safe because `.` is outside `FD-V16`'s charset, so no node may ever be called it. *(This read *"the one invented token"* and stayed that way ten lines above the row that added the second. W45's conformity reader; the neighbour-of-a-corrected-line class.)* |
| `"$payload"` | **the value the RUN entered with** — what `start()` was handed, the header's retained copy (`RN-R15`), from any node that may declare `needs` and from any edge, the entry included (where, on a task, it equals `"."`). v0.44, [ADR 0117](../doc/decisions/0117-a-reference-may-name-what-reached-the-run.md). **Always there**: no `?` and no array form — `FD-V26` refuses both, naming the bare form — and `FD-V27`-`FD-V29` have nothing to aim, because it names no node. Composed from the caller's own value at `FD-R4` and from the stored header on a resume, so every door hands the same value (P38 (f)). The grammar's `$` PREFIX is reserved — `$` is outside `FD-V16`'s charset, so no node may ever be called one — and `"$item"`, the next row, is the prefix's second reference; any other `$` spelling is `FD-V26` |
| `"$item"` | **the item that opened the reader's MAP INSTANCE** — the element of `over`'s array the INNERMOST map region CONTAINING the reader as a member was opened with, from any node that may declare `needs` and from any edge inside one, the branch entry included (where it equals `"."`). v0.45, [ADR 0118](../doc/decisions/0118-a-map-instance-keeps-its-item-while-a-node-of-it-may-still-be-entered.md). **Innermost, and never the region a node OPENS** (P38 (c)): a `map` node's own `"$item"` is its ENCLOSING instance's item, a node in a `fanout` inside a map instance names the map's, and an OUTER map's item is reached the way any value is — a node of the outer instance that declares it passes it down. **Always there** inside an instance: no `?` and no array form (`FD-V26`), nothing for `FD-V27`-`FD-V29` to aim; where NO map instance contains the reader it is **`FD-V49`**. Composed from what the instance KEEPS (`spec/run-state.md` `RN-R13`), and at `FD-R4` from the walk's own element |
| `"score"` | that node's output **on this node's own branch path**. **None, and the run stops** (`FD-R3`); more than one is unreachable, because `FD-V28` refuses this form wherever the graph admits more |
| `["score"]` | **those of that node's outputs that are VISIBLE on this node's own path** — see the note below the table — as an **array**, in ascending `branchPath` order compared segment-wise as numbers — `JP-R12`'s order rule, and the same reason: it is what makes the value the same whatever order the branches settled in. Legal only where this node is **outside a `map` region** containing the named one (`FD-V28`). *(This row read *"outside a region"* — the very confusion `FD-V28`'s own note two blockquotes down records its first version making, where a node after a two-branch `fanout` join was refused and told to index `[0]` out of a list. Measured on `fanout-join.flow.json`: `["scoreA"]` is REFUSED and `"scoreA"` accepted, so the row's condition was not the rule's. W49's conformity reader, in a row this item edited.)* **Since v0.15 that is ALL of them wherever the two nodes' region chains share no entry** — a reader after the region, and a reader inside a SIBLING one, which used to receive the one output whose index happened to match its own ([ADR 0044](../doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)) |
| **a `?` suffix on either of the two above** — `"score?"`, `["score?"]` | **the same outputs, and `FD-C4` instead of `FD-R3` when there are none**: the key is **ABSENT** for `"score?"` and **`[]`** for `["score?"]`, and the run does not stop. v0.13. This is what says *if it ran*, and writing it is what exempts a reference from `FD-V29` |

**The array form is JSON's own array syntax rather than a second sigil**, so the grammar invents two
tokens rather than three, and a definition still survives `JSON.parse(JSON.stringify(x))`
(ADR 0002 rule 1). **v0.44 invents a PREFIX, `$`, for what has no node id** — the run's payload, and (v0.45) a map
instance's item — rather than a token per value; `referenceTarget` returns each as its own `form` beside `"."`'s, all
three with `node: null`, so a reader switches on `form` and never reads *no node* as *the `"."` form*
(P38 fact 7). *(This sentence counted two invented tokens and was true of the grammar until v0.44.)*

**`?` is a MODIFIER and not a fourth form, and the row above says so rather than splitting in two.**
It decides what happens when the target produced NOTHING and never which outputs are named, so it is
orthogonal to the one/all distinction: `FD-V28` asks *how many* and reads the form with the suffix
**stripped**, and `FD-V29` asks *must it have run* and reads the suffix. `referenceTarget` returns it
as a third field beside `form` for the same reason: **[ADR 0040](../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
rule 5 says *"the grammar is three forms and invents one token"*, and v0.13 changes the token count
and not the form count** — where a table of 2x2 combinations would be five rows now and nine if a
second modifier ever arrived. *(This sentence quoted that rule as *"three forms and two tokens"*,
which is not in it and misstates the half v0.13 moved. W45's conformity reader.)* **It may not be written on `"."`**, which resolves to what the edge carried and is therefore
always there, and `".?"` is refused by `FD-V26` with no clause of its own: strip the suffix and the
remainder must still match `FD-V16`'s charset, which `.` does not. The same argument makes `"?"` and
`"score??"` refusals for free.

> **The two ends of the table are ASYMMETRIC by shape rather than by choice, and the reason is
> measured.** `"score?"` reports an absent key and `["score?"]` reports `[]`, and the `one` form has
> no *value* available to mean *did not run*: **a reference to a task that ran and FAILED already
> resolves to `null` with the key present** — `fanout-failure` with `scoreA` optional settling
> `failed` hands `publish` `{"got": null}` and reports nothing. So `null` means *ran and produced
> nothing*, and an absent key is the only answer an author can tell apart. For the array form `[]` is
> unambiguous and lets an author iterate without a guard. W45.

**Which form is legal is a property of the GRAPH, not of the run, and `FD-V28` is what says so.** A
node produces more than one output for a reader exactly when the reader is outside a **`map`** region
containing it — so an author is told at instantiation which form to write, and *which shape will
arrive* is never a run-time surprise.

> **That biconditional was FALSE for two SIBLING regions until v0.15, and it is what
> [Q206](../doc/questions/q206.md) was.** W45's conformity reader found it: `FD-V28` asks a REGION
> question and resolution then applied a PATH filter, and the two agreed only where the reader is
> inside or after the region it names. For two **sibling** map regions at the same depth —
> `reference-past-a-map-arity.flow.json`, the flow in section 7 — `publish` inside `rank` is outside
> `region(split)`, so `FD-V28` demands `["score"]` and says *"it produces one output per ITEM"*; and
> the array that arrived held **at most one** entry, the `score` output whose branch path was
> numerically equal to `publish`'s own index in an unrelated region. Measured on the shipped document
> at three arity pairs: at `items: 3, slots: 1` instance 0 received one of three; at equal arities
> each instance received its index-matched one; past the arity it was `FD-R3`.
>
> **`FD-V28` was right and the resolution was wrong**, which is why nothing here moves except the
> predicate: the rule counts outputs by REGION and the filter compared indices by POSITION, so the
> two disagreed exactly where the chains do not nest.
> [ADR 0044](../doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)
> makes the filter ask the same question the rule asks. **Under v0.15's rule** `publish` receives
> **all three** at every arity pair and `FD-R3` does not fire, so *there is no form an author can
> write from inside `rank` that yields all of `score`'s outputs* — the sentence this note carried for
> two versions — is answered by the form they were already writing. **The resolver followed in W50**, and a
> run does this now; the measurement above is the record of what it did before.
>
> **And the defect was never about a `map`.** W49 measured the same shape on a `fanout` pair, which
> neither corpus contains: branch **1** of a second region reading branch **0** of the first
> validates with zero findings and **stops the run**, while branch 0 reading the same node resolves.
> No arity, no `map`, and `FD-V29` correctly calling the target certain, on a document neither
> corpus contains — which is why nothing had seen it, and is P14 decision 3 by name.

> **A `fanout` region is NOT that case, and the rule's first version said it was.** `FD-V19` refuses
> a non-`end` node in two branch entries of one fanout, so every node in a `fanout` region has
> **one** output and the bare form is what is legal from outside it. Written against *a region* rather
> than *a map region*, `FD-V28` refused `needs: {"a": "scoreA"}` on a node after a two-branch join —
> a valid document — and told the author to write `["scoreA"]` and index `[0]` out of it. **`FD-C2`'s
> own measurement is what the rule should have been read from**: the ids collapse in exactly the
> flows with a map region and in neither with only `fanout`s, stated nine lines below, in this
> document, before the rule was written. W41's conformity reader. **This is what makes `needs` more than the accumulator**:
[Q11](../doc/questions/q11.md)'s second candidate is the state and its third is the access, and only
the third can reach a worker at all, because `createTask` takes **one** value
(`{id, workerType, payload, optional}` — measured).

**What NAMES an output is the pair `(node id, branchPath)`** — `FD-C2` — and a node id alone does
not. Measured over the region-bearing flows in `spec/examples/valid/` — **four when this was written,
ten at v0.15 and THIRTEEN now** (W84's conformity reader), the census deriving the set from the directory: the pairs are distinct in every one, while
the node ids collapse in exactly the flows with a `map` region, at any depth, and in **none** of the
**five** with only `fanout`s. That is
[ADR 0036](../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)'s
deciding fact for the **third** time ([Q160](../doc/questions/q160.md)), and it is why an author
writes a node id and the run resolves it against a path.

**An entry is visible to a node when their two paths AGREE ON THE REGIONS THAT CONTAIN BOTH of
them** — v0.15, [ADR 0044](../doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md).
A `branchPath` carries **one segment per region on the walk `branchPathOf` makes**, innermost last,
so segment `i` of one node's path and segment `i` of another's are indices into the *same* namespace
exactly when entry `i` of their two region CHAINS is the same region. The number of segments there is
anything to compare is therefore the length of the **common PREFIX of the two chains**, and the
moment the chains diverge every later segment belongs to an unrelated namespace.

> **It is the CHAIN and not `containing(n)`, and that is a correction rather than a restatement.**
> This paragraph first derived the depth as the SIZE OF THE INTERSECTION of the two `containing`
> sets, on the argument that *`containing(n)` is a nesting chain (`FD-V22`), so the regions
> containing both are always the outermost k of each chain*. **W49's conformity reader measured that
> false on a document this validator accepts with zero findings**: put a fanout region's JOIN inside
> a nested region and one node's shared entry is the INNERMOST of the other's chain, so a count
> returns 1 where the shared region sits at segment 1. The **answer** was still right, because
> `branchPathOf` walks the opener chain and both paths inherit the outer segment either way — but
> the justification licensing the implementation was unsound, and the implementation was about to be
> carried into the driver. Deriving from the same walk the PATH is built from makes *segment `i`
> corresponds to chain entry `i`* true by construction rather than by an argument about membership. One predicate gives both forms: `ingest@-` is visible
everywhere; `extract@1` is visible to `merge@1.0`; `merge@1.0` and `merge@1.1` are **both** visible
to a node at `-` after the join, which is the array; and a node inside a **sibling** region shares no
region with any of them, so it sees **all** of them.

> **This REPLACED *one path is a prefix of the other*, which is its special case rather than its
> predecessor.** Where the two chains nest, the regions containing both are the shorter chain
> entire, so *agree on the first k* and *one is a prefix of the other* pick out the same entries —
> which is why **every ancestor/descendant reference in both corpora behaves identically under
> either**, measured, with ladder L6 unmoved in both runtimes. What the prefix rule got wrong is the
> case where the chains do not nest: `isPathPrefix('0','2')` and `isPathPrefix('2','0')` are both
> false, so for two sibling regions **only the equality case ever fired** — a reader saw a target
> because the two strings matched, and equality is the prefix relation's reflexive case.
> [Q206](../doc/questions/q206.md).

> **Segment-wise and not by string, which v0.15 inherits rather than reinvents.** `"1"` and `"10"`
> are different segments and a `startsWith` says otherwise, in exactly the case a map region of
> eleven or more items produces — it hands instance `10` the output of instance `1`, a wrong answer
> rather than a crash. **Invisible below eleven instances and live at twelve** — `JP-R12`'s own
> *invisible at depth 1, live at depth 2*, a fourth time in this tree — and
> `test/driver/needs.test.ts`'s two-digit fixture is the only thing in the repository that
> discriminates it.

**Each key gets its own copy**, which is `JP-R11`'s invariant applied to the one edge that is not a
fan-out edge: no two nodes ever receive the same object, and a reference is the one way two nodes
could otherwise be handed one record's `result` twice.

**What a node reaches is a PROJECTION of the log and is not new retention.** The driver already
holds an append-only `log` with `result` on every settled task and already exposes the whole of it
through `snapshot()`; the projection adds **zero** fields, and it is computed on demand rather than
maintained, so a second source cannot disagree with the log.
[Q19](../doc/questions/q19.md)'s *"if Q8 or Q11 retains every node output"* described **today**
before `needs` existed. *(This sentence ended *"and its real question — whether that retention should
be **bounded** — is untouched"*, which stopped being true at
[W53](../doc/work-items/w53-what-a-run-retains-that-nothing-reads.md):
[ADR 0046](../doc/decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)
answers it, and `RN-R13` in [spec/run-state.md](run-state.md) section 7 is the rule. **What is still
untouched is what this paragraph is about**: the projection adds no retention, and `RN-R13` says so
by naming `outputsCache` as holding results **by reference only**. W53's conformity reader, and a
declared late exception in that item — `doc/workflow.md` section 1 rule 5's third direction, which
obliges the search and not the edit.)*

> **What `needs` costs is what you point it at, and the document is where that is visible.** The
> mechanism makes **one copy per instance** and each copy costs what it holds, so the product is what
> an author pays. At a map arity of 1000 over a ~126 KiB payload, **one case per process** — see the
> method note below, which is part of the measurement:
>
> | what the branch entry declares | arity 100 | arity 1000 |
> |---|---|---|
> | no `needs` at all | 0.8 ms | **5.5 ms** |
> | `{"item": "."}` | 1.1 ms | **7.7 ms** |
> | + one key naming a genuinely SMALL node | 1.2 ms | **8.7 ms** |
> | + the same key naming the LARGE node | 8.1 ms | **613.6 ms** |
> | + that key written **conditionally**, `"n?"` | 7.7 ms | **617.4 ms** |
>
> **71x, and which node id the author typed is the whole of the difference** — that being
> 613.6 / 8.7, the small node against the large one, which is the pair the sentence is about.
> *(Three ratios are in circulation for one cliff, and each names a different denominator: 613.6/8.7
> is **71x**, 613.6/7.7 against `{"item": "."}` is **80x**, and 613.6/5.5 against no `needs` at all is
> **112x**. [Q186](../doc/questions/q186.md)'s row says 85x and P13's declaration 64x, on the third
> and second bases respectively. W46's conformity reader; the number moves with the question.)*
> Each instance gets its own copy, which is
> [ADR 0037](../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)'s
> refused per-instance clone, reached by asking for it — and the **`?` suffix costs nothing**, because
> the two forms resolve through **one expression** and the suffix is read only when there is nothing
> to copy. **That is why a reference names a whole node and never a path inside its value**: a path
> language would make *the small part of the big thing* expressible and would move this cost out of
> the document and into a selector.
>
> **THE METHOD IS PART OF THE MEASUREMENT — v0.14, W46.** These read **6.5 / 8.0 / 10.6 / 546.6** at
> v0.11, taken in ONE process in run order. **What that method costs is ACCUMULATION and not
> ordering**, and the two were conflated when this note was first written:
>
> | measured, five passes over the whole list in one process | |
> |---|---|
> | a cheap row, first pass to last | **6.8 ms → 30.1 ms**, 4.4x |
> | the large row, first pass to last | **622 ms → 1632 ms**, 2.6x |
> | forward against **reversed**, median per row | **agree within noise** — 9.4/9.2/10.0/1060/1390 against 9.5/15.7/24.3/1312/1048 |
>
> So *later in the process is dearer*, whatever the order — and **a table taken in one process is not
> a measurement of the differences between its rows**, because the last row carries the whole
> accumulation. One case per process reproduces within **4%**, independently re-derived. *(This note
> first read *"worth 2.5x in run POSITION … reversed, the two large cases swap their numbers
> exactly"*, and its conformity reader could not reproduce it: the comparison had been
> **reversed-in-one-process against one-case-per-process**, two variables at once, and nothing swaps.
> The isolating comparison is the third row above and it was never taken. The **cliff** was robust
> throughout; what was never a measurement is the spread among the three cheap rows.)*
> [Q179](../doc/questions/q179.md), and [Q208](../doc/questions/q208.md) for what it is a cause of.
>
> **And nothing WARNS about it, which is a decision** — [Q186](../doc/questions/q186.md), W46, and
> **no ADR**, on [Q190](../doc/questions/q190.md)'s precedent: a decision recorded in this section and
> asserted at ladder L2, which is what `doc/workflow.md` section 1 rule 3 asks of one.
>
> | | |
> |---|---|
> | **the predicate that needs no size judgement fires on every INTENDED use, and on nothing else** | *a reference on a node inside a map region naming one outside it* is decidable from the document. Over both corpora it fires on **3 of 13** references in **2 distinct flows**, and **`map-with-context`'s is the CLIFF rather than a false positive**: measured on the shipped document, unedited, **604.9-643.6 ms as the corpus writes it against 7.9-9.1 ms with the `run` key removed** — ~70x, on the flow this feature exists for. So the predicate is RIGHT, and it is right about **3 of 3** intended uses; the only remedy for the expensive one is the reshaping node [ADR 0040](../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md) exists to remove. **A predicate that fires on every intended use and nothing else restates the feature's definition rather than diagnosing anything.** *(This cell read *"warns about the FEATURE"* on the ground that the showcase was a false positive, which W46's adequacy reader falsified with the measurement above. **The conclusion held and its reason was the opposite of the truth.**)* And it is **not the only** such predicate: *a reference naming the node the `over` array was read from* fires on the same 3, which both readers found independently |
> | **there is no threshold, and the question is THIS ROW's own** | a run-time guard must answer *how large is too large*. **That phrase occurs in exactly one place in the register — [Q186](../doc/questions/q186.md)'s own row** — and not in [Q22](../doc/questions/q22.md), which asks whether a result must be structured-CLONEABLE and where that constraint sits. *(This cell deferred to Q22, and W46's conformity reader found that answering Q22 as written would supply no threshold. So the question is not owned elsewhere: it is the reason this row stays OPEN with its decision recorded, rather than resolved.)* |
> | **a REPORT channel exists and is declined rather than absent** | [ADR 0027](../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md) faced *stop / ignore / report* and chose **report** — `onUnmintedTask`. That is the option between a refusal and silence, it is in this codebase, and it is **weighed here rather than omitted**: `onUnmintedTask` reports a fact about a RUN that a caller could not otherwise know, and *this reference is resolved once per item* is a fact about the DOCUMENT, decidable by reading it. `validateDefinition` and `Finding` are both exported from the package root, so a `severity` field would be a **type** change rather than a new option — cheaper than an option and still a change to a published type, for a diagnostic with no action behind it. *(This cell read *"there is no CHANNEL"*, which stated an absence where what exists is an unweighed choice. W46's conformity reader.)* |
> | **and MEASURING is not the obstacle** | Q186's row makes the guessing the whole of the objection, and it is right. A size measurement is **~29% of ONE clone** — `JSON.stringify().length` at **0.140 ms** against **0.482 ms**, independently re-derived at 0.125 against 0.418 — and it is taken **once per (node, key)** against **N** clones, because for the case a guard would target the value is the same for all N. At N = 1000 that is **~0.03%** of what it would warn about. *(This cell claimed **~1%** from a budgeted walk at 0.0053 ms; W46's conformity reader could not reproduce any budget below 0.02-0.03 ms, because the first pop expands a 1000-element array. The budgeted figure is withdrawn and the two that reproduce are what the row now rests on — a stronger number by two orders of magnitude.)* **The scope is stated**: *the value is the same for all N* is true of a reference from inside a map region to a node outside it, and false for `"."` and for a reference to another node in the same region |
>
> **What would force it:** an author reporting a flow whose cost surprised them, a **threshold** arriving from anywhere, or a second reference form for which the size is not a property of the whole node.

**`"$payload"` is that cliff's LARGEST instance, reached through a new spelling, and nothing warns about it either** —
v0.44, P38 (l) and fact 11. Read on a node inside a `map` region it is copied once per instance, whole: the run's payload
is the value the map's `over` array was usually carried in, so it is at least the size of the item list. The decision
above applies unchanged — *this reference is resolved once per item* is a fact about the document — and the remedy is the
one this section names: name the small part's PRODUCER, or give the `map` a `needs` that projects what each instance needs.
**One frozen copy shared by every instance was refused** (P38 (l)): it is against `JP-R11` and ADR 0040 rule 6, and a
worker that mutates would throw on one road and not on another. **And it is no new RETENTION**: the header holds the
payload for the life of the run already (`RN-R13`'s third term); a `"$payload"` key reads it and clones it, and adds no
field. *On an ASK it does write a copy into the LOG* — the `asked` element keeps what reached the ask (`RN-R37`, P38 (m)).

**`"$item"` costs what its ONE element costs** — v0.45, P38 (l): a copy of the instance's own item per key per read, never
of the list, so it is the cheap end of this cliff. What it adds is a RETENTION: an instance whose region holds a `"$item"`
reader keeps its item, by reference to the element the map received, until nothing of the instance may still be entered (`spec/run-state.md`
`RN-R13`'s sixth term) — at most the `over` array the log already holds of the map's producer (P38 fact 5), and nothing
where no node reads it.

**The effective outcome, never the raw record** — rule 4 above, one level out. A resumed node has two
records and neither alone is right to hand anybody; a node still suspended has **no** effective
outcome and therefore **no entry**, which is what makes `FD-R3` fire rather than a reference quietly
resolving to `undefined`.

| id | | Test owed by |
|---|---|---|
| `FD-C1` | **What a node receives.** *(v0.15 — the VISIBILITY half of this rule is amended by [ADR 0044](../doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md): an output is visible to a reader when their two branch paths agree on the regions their two region CHAINS share, and *one path is a prefix of the other* is that rule's special case. Everything else in this row is unchanged. **The derivation shipped with the rule and the RESOLVER followed in W50**, so a run applies it — see the header. Test: at ladder L1, `test/definition/sibling-regions.test.ts` — `sharedRegionDepth` and `outputIsVisible` against a hand-derived table over six documents, the old rule pinned to the sentence this document carried before v0.15, and the two compared over every nesting pair and every sibling pair.)* With no `needs`, the source node's effective-outcome `result`, deep-copied — the paragraph above, unchanged. With a `needs`, **exactly** the object it describes: one key per declared key, each resolved by the table above and each its own copy. **A `"$payload"` key (v0.44, [ADR 0117](../doc/decisions/0117-a-reference-may-name-what-reached-the-run.md)) is the value the RUN entered with, its own deep copy per key per read**, composed from the header's copy in a run and on a resume and from the caller's own value at `FD-R4` (P38 (f)) — at every node that may declare `needs`, a `map`'s `over` then read off the composed object. **A `"$item"` key (v0.45, [ADR 0118](../doc/decisions/0118-a-map-instance-keeps-its-item-while-a-node-of-it-may-still-be-entered.md)) is the item of the innermost map instance containing the node, its own deep copy per key per read**, composed from what that instance keeps (`RN-R13`) and at `FD-R4` from the walk's own element. Test (v0.45): at ladder L2, `test/driver/map-item.test.ts` — the branch entry beside `"."`, the app's map-branch ask, two hops in at arity eleven, a nested map and its inner map node, a fanout inside an instance, the copy claim over nested items read both ways, retention and release, a resume, `FD-R4` over an entry map's branch task; at L1, `test/definition/map-item.test.ts`. Test (v0.44): at ladder L2, `test/driver/run-payload.test.ts` — at the entry beside `"."`, two hops on, on a map node whose arity is the payload's, on an ask whose `asked` element keeps the copy, on the app's entry ask, through `FD-R4` before the header exists, across a resume, and the copy claim over a nested payload read both ways; at L1, `test/definition/run-payload.test.ts`. Test: at ladder L2, over `map-with-context.flow.json` and `map-over-region-output.flow.json`, asserting the composed payload of **every dispatch a `needs` composes** — which is 2 of that flow's 4 and 3 of this one's 7, the rest being nodes that declare none; and that a node with no `needs` is byte-unchanged, which the L1-L5 suite asserts as a whole — **574 cases when `FD-C1` was written and 681 now**, and the claim is that the number MOVES only for reasons an item names | **[W41](../doc/work-items/w41-what-a-node-can-reach-and-what-names-it.md)** |
| `FD-C4` | **What a CONDITIONAL reference carries when its target produced nothing on this path** — v0.13, [ADR 0042](../doc/decisions/0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md) rule 4. For `"n?"` the key is **absent** from the composed object — not present holding `null`, and not present holding `undefined`, because `null` is what a reference to a task that ran and FAILED already resolves to. For `["n?"]` the key is present holding **`[]`**. Everything else is `FD-C1`'s row for the unsuffixed form, unchanged: the visibility predicate, the order, and the per-key copy. **At both declaration sites**, by the same expression — an edge's conditional reference that resolves to nothing leaves `ctx.needs` without that key, so a predicate reads `'f' in ctx.needs` (`FD-C3`). Test: at ladder L2, over `reference-if-it-ran.flow.json` — one flow, **two runs**, the key present on one and absent on the other, and the run completing on both; and the array form over a SIBLING map region past the first's arity, giving `[]`. *(This cell said *"a nested map region"*; `reference-past-a-map-arity`'s two regions are sequential siblings — `rank` is in `after(split)`, not in `region(split)` — and the nested-map flows are `map-in-fanout` and `nested-map`, neither of which is used. Third occurrence in this document of a rule cell naming a test other than the one that exists. W45's conformity reader.)* | **[W45](../doc/work-items/w45-what-a-reference-must-be-able-to-say.md)** |
| `FD-C2` | **What names an output is the pair `(node id, branchPath)`.** A node id alone names one output outside a `map` region and **N** inside one, so a projection keyed by node id collapses a map's instances — which is what a reference must not do. A `needs` reference names a node **id**, because a branch path inside a map region is a property of the **dispatch** (section 4, `ID-R6`) and no author can write one. Test: at ladder L2, the pairs are distinct over **every region-bearing corpus flow** — the census derives that set from the directory rather than from a list beside itself, and it is **ten** flows since W50 added `sibling-fanouts` — while the node ids collapse in exactly the map-bearing ones. *(This cell read *"all four … and the two this item adds"*, which was W41's count and went stale twice. W50's conformity reader.)* | **[W41](../doc/work-items/w41-what-a-node-can-reach-and-what-names-it.md)** |
| `FD-C5` | **What EVERY task node's worker receives: the envelope `{ settings, input }`** — v0.17 for a typed node, v0.19 for every node ([ADR 0054](../doc/decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md)), [ADR 0049](../doc/decisions/0049-a-node-type-is-a-registry-entry-and-its-worker-receives-an-envelope.md) rule 3, section 2's `type` subsection. `settings` is the node's effective `settings` — the type's defaults merged UNDER the node's, `{}` when neither declares any — as its **own copy** per dispatch; **`input` is THE VALUE THIS NODE RECEIVES** — what a bare node was handed as its whole payload until v0.19: the ordinary edge's value (section 3), the object its `needs` describes (`FD-C1`), its own item as a map instance (`JP-R11`), or the collection as a join's successor (`JP-R12`). No more and no less: an untyped node receives no envelope and no reserved key (ADR 0040 rule 6 untouched), and a typed node's worker reads its two keys by name. **Defined as the value RECEIVED and never as "what `needs` composed"**, deliberately, so a later per-node transform ([Q251](../doc/questions/q251.md)) sits between composition and this envelope without rewording the rule. Two typed nodes of one type with different `settings` receive different envelopes and the same `input` rule, which is what the exit artifact shows on real workers. **And beside the envelope, the scheduler's task CONTEXT — v0.33** ([W159](../doc/work-items/w159-what-the-pin-adds-that-a-type-reaches.md)): the envelope worker hands its inner worker's `run` the SECOND argument the scheduler handed it, the same object and unchanged, and its inner constructor the worker context it was constructed with — so whatever the scheduler puts on a context reaches the type's worker exactly as it would reach a worker the scheduler loaded itself: at the pin `context.signal`, the `AbortSignal` a cancel aborts, and `context.emit`, the `task.message` channel the pool's `messages` option bounds. The library constructs no context and reads none. **A type that only TRANSFORMS** ([ADR 0075](../doc/decisions/0075-a-node-that-only-transforms-is-a-built-in-type-with-no-inner-worker.md)) has no inner worker, so its context reaches nothing: no `signal` is watched and nothing is emitted | **[W59](../doc/work-items/w59-what-a-node-type-is.md)** — `test/driver/node-type.test.ts` at L2 on all three shapes, as a PAIR against the untyped node's whole payload; `examples/l6.ts` at L6. **The context, v0.33 (W159)**: `test/scheduler/envelope-worker.test.ts` — the same object through the wrapper in every runtime, and on a real `FyflowScheduler` pool, inline and threaded, in Node and Deno, an inner worker's `context.emit` arriving as `task.message` and its `context.signal` aborted by `cancel()` |
| `FD-C6` | **What a typed node's POOL receives when the node declares a `transform`, and what its WORKER receives then** — v0.18, [ADR 0051](../doc/decisions/0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md) rule 3, section 2's `transform` subsection. The envelope the driver dispatches is `{ settings, input, transform }`: `settings` and `input` exactly as `FD-C5` states them — **`input` is STILL the value this node receives, untransformed**, because the driver evaluates nothing (P17 decision 1) — and `transform` is the declared `{ lang, expr }`, as its own copy, **present exactly when the node declares one**. The type's envelope worker evaluates the expression over `input` with `settings` bound as `$settings` and hands the inner worker `{ settings, input }` with `input` REPLACED by the result — `undefined` included — and no third key; a transform it cannot evaluate, or a language whose module did not load, is the TASK's failure (section 2). A typed node declaring no transform receives `FD-C5`'s two-key envelope to the byte, and an untyped node receives no envelope at all — ADR 0040 rule 6 untouched. Test: at ladder L2, `test/driver/transform.test.ts` on all four shapes `FD-C5` enumerates — the third key present exactly when declared, and `input` untransformed as a PAIR against the bare node's whole payload; at L1, `test/scheduler/transform.test.ts` — the wrapper over the four kinds of input, and on a real inline and threaded pool where one can load its script | **[W61](../doc/work-items/w61-what-a-transform-is.md)** |

### An EDGE may declare `needs` too, and what it gives is what its PREDICATE sees — v0.12

[ADR 0041](../doc/decisions/0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md),
answering [Q8](../doc/questions/q8.md).

```json
{ "when": { "predicate": "isLowConfidence" }, "to": "review", "needs": { "earlier": "ingest" } }
```

**Same grammar, same aiming rules, minus the `"."` form.** A reference on an edge is a node id or a
one-element array holding one — or, since v0.44, `"$payload"`, and since v0.45 `"$item"`; `"."` is refused by `FD-V26`,
because *what this predicate would have received anyway* is `ctx.outcome` and it already has it. **`"$payload"` and
`"$item"` are NOT refused there** (P38 decision 3): a predicate has no `ctx.payload` and no `ctx.item`, so naming either is
not redundant — it is how a decision routes on `needs.run.amount`, or on the instance's `needs.it.amount`, with no task
before it. `"$item"` on an edge reads the NODE's instance — the reader is the node the edge hangs on — and is `FD-V49`
where that node is in none. `FD-V27` and `FD-V28` ask the same two
questions of an edge's references as of a node's, **with the same reader** — an edge has no path of
its own, so the node it hangs on is what a reference resolves relative to.

**Why the EDGE and not the node**, stated because it is the whole of what
[P12](../doc/plans/p12-what-a-node-receives-and-what-a-decision-sees.md) prediction 3 got wrong:

| | |
|---|---|
| a node's `needs` would rewrite what its **WORKER** receives | measured: `score` with no `needs` receives `{"flagged":true}`, and with `needs: {"own": ".", "up": "ingest"}` receives `{"own":…,"up":…}`. **Giving the predicate reach would change the worker's contract** |
| and *what the node received* is **not derivable at routing time** | The **entry** node's payload is `start(payload)` and is in **no record**: an `OutcomeRecord` carries `result` and no payload field, so that node has no derivation at all — not a hard one, none. For every other node a derivation re-implements `compose`, `JP-R11` and `JP-R12` at a second site, which [ADR 0040](../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md) rule 2 refuses by name; keeping it instead is a payload retained per dispatched node, which is [Q19](../doc/questions/q19.md)'s own subject. *(This row cited a **diamond** and append order, and W42's conformity reader derived the diamond with neither.)* **What the RUN entered with is a different value, and v0.44 reaches it** ([ADR 0117](../doc/decisions/0117-a-reference-may-name-what-reached-the-run.md)): it is in no record either — still true — but it is no derivation: the header's own copy, retained for the life of the run (`RN-R15`, `RN-R13`), which `"$payload"` names on a node or an edge. *(This row's *"no derivation at all"* was the end of the sentence until then.)* |
| the **references** are derivable, and cost nothing new | they resolve from the same projection `FD-C1` uses, at the moment the decision is made, with **no new driver state** — and a `"$payload"` key (v0.44) from the header the driver already keeps |

> **A `needs` on an edge no predicate reads is ACCEPTED and INERT, and that is a decision rather
> than an oversight.** Two shapes: an edge with a `needs` and **no `when`**, which nothing evaluates;
> and a **`join`**'s single exit edge, which `FD-V7` forbids from carrying a `when` at all. Both
> validate with zero findings and neither is ever resolved. **Refusing them would put a rule about a
> KIND inside a rule about a GRAMMAR**: `FD-V26` says what a reference IS, *may a predicate sit here*
> is `FD-V7`'s question, and `FD-V17` — which owns *a key this kind does not declare* — cannot
> express *a key this kind declares and cannot use*. **The cost is that an author can write one and
> see nothing happen**, which is why it is written down rather than left to be discovered. W42's
> conformity reader; `test/driver/decision-context.test.ts` asserts both shapes.

**A predicate on an edge that declares nothing sees `ctx.needs = {}`, and the projection is not
computed at all** — which is every edge written before v0.12, so nothing changes for a flow that
declares nothing. **`{}` and never `undefined`**, for rule 4's own reason one level out: a predicate
written `ctx.needs.flag` must mean one thing.

| id | | Test owed by |
|---|---|---|
| `FD-C3` | **What a decision sees.** Its node's **effective outcome** (rule 4, unchanged since P1), and **`needs`** — the object THIS EDGE's `needs` describes, resolved by `FD-C1`'s table with the reader being the node the edge hangs on, or `{}` when the edge declares none — **a `"$payload"` key (v0.44, [ADR 0117](../doc/decisions/0117-a-reference-may-name-what-reached-the-run.md)) the run's payload, its own copy per read, by the expression `FD-C1` composes it with**, so `ctx.needs.run` and a worker's `input.run` mean one thing (test, v0.44: `test/driver/run-payload.test.ts` — a declared predicate on `needs.run.amount`, one run each way, and a predicate's nested write into it reaching no later node). **A `"$item"` key (v0.45) the node's instance's item, its own copy per read, by the same expression** (test: `test/driver/map-item.test.ts` — a declared predicate on `needs.it.amount` routing two instances of one run two ways, and a predicate's nested write into one `"$item"` key absent from a second on the same edge). **A different edge of the same node may declare something different**, so the context is built per edge and only for an edge that carries a `when`. Test: at ladder L2, over `decision-on-an-earlier-step.flow.json` — one flow, two runs, the predicate answering differently because of a node it does not sit on; that a node with no `needs` anywhere has its worker payload **unchanged**; and that an edge which is never REACHED is never resolved, so a later edge's unresolvable reference does not stop a run the flow routes correctly. **On a CONSTRUCTED fixture, because that corpus flow cannot express them**: that another edge of the same node sees `{}`, which needs a node with **two guarded edges** since a default carries no `when` and so builds no context; and that a **resumed** node's predicate sees the resolution's result under `outcome` while `needs` resolves against the run. *(This cell prescribed both of those over the corpus flow, and prescribed the second as "the resolution's result under BOTH fields" — which no flow can express, because for `needs` to carry the resumed node's own result the edge would have to name its own node, and `FD-V27` refuses that. Section 6's "FD-R1's test, corrected" is the same class and this is its second occurrence in this document. W42's conformity reader.)* | **[W42](../doc/work-items/w42-what-a-decision-sees.md)** |


**A fan-out edge and a join's exit edge are the two that are not ordinary**, and both are
[spec/join-policy.md](join-policy.md) section 4's — `JP-R11` for what each opened branch receives, and
`JP-R12` for what a satisfied join carries. They live there because that section already fixes what
the driver owes at both ends of a region, and because splitting one payload contract across documents
is what left it unstated for ten plans. **[Q164](../doc/questions/q164.md)** records the other reason:
this document has an id prefix for a **validation** rule and one for a **runtime refusal**, and none
for a rule about what a run *carries*.

**Rule 4's *"always the effective outcome"* is what closes a hole the second pass found.** A resumed
node has two records in the log — the `user_action` settlement and the resolution — and neither is
the right thing to hand a predicate: the first cannot see the human's answer, the second has no
`terminalState` at all. A predicate written `ctx.outcome.terminalState === "done"` must mean one
thing, so the fold derives one record and routing never sees the pair.

**A `user_action` settlement routes nowhere.** It **suspends** the path (ADR 0004 rule 3), and `on`
may not name it (`FD-V18`, [Q30](../doc/questions/q30.md)). The path resumes when a resolution
record is appended ([spec/outcome-record.md](outcome-record.md) section 5).

**A settlement with no eligible edge ends that path.** This is the case an author creates by not
writing an `on: ["failed"]` edge, and it is not an error. Inside a fan-out region it is
`branch.lost` ([spec/join-policy.md](join-policy.md) section 2); outside one it ends the path with
no `end` node reached. ADR 0004's *Consequences* argues why this is not the silent stop that Q10
refused — it is declared by omission, an outcome record in the log says exactly what happened, and
the path's end has a node to point at.

### Q10 — what happens when no decision edge matches

**Answered here: it cannot happen, and if it happens the run fails loudly.** Two rules at two
different times:

- **`FD-V7`, at instantiation.** For every terminal state any of a node's edges opts into, one of
  the eligible edges has no `when` and is last among them. A definition without that default is
  rejected before any task is queued, mirroring `addTasks` validating a whole batch up front
  (`AGENTS.md` section 5).
- **`FD-R1`, at routing time.** If the driver ever reaches a node where eligible edges exist and
  none evaluates true, the run terminates with a named error naming the run and the node. `FD-V7`
  makes this unreachable; `FD-R1` is the assertion that `FD-V7` held.

**No eligible edge at all is a different thing from no matching edge**, and only the second is
`FD-R1`. The first is the declared path-end above.

**Why not the third candidate — "the node is terminal for that branch".** It is the answer that
makes a flow stop halfway with no error, and under a fan-out it produces a join that never fires
with nothing queued and nothing running. **That is character-for-character the signature P1 exists
to attribute to a join policy** (`doc/plans/p1-what-satisfies-a-join.md`, *Why this plan*). An
experiment whose observation has a second possible cause has not run, so a silent stop is refused
on the plan's own validity grounds rather than on taste.

### The registry DOCUMENT — workers, node types as derivations, pool instances and group types — v0.19

A flow names registry keys and nothing else, and until this version the registry was an object a
consumer built in code: pools constructed by hand, groups constructed by hand, a node type holding a
function. **Since v0.19 the registry is a DOCUMENT** —
[P18](../doc/plans/p18-a-flow-and-its-runtime-from-documents-alone.md),
[ADR 0053](../doc/decisions/0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md),
[ADR 0054](../doc/decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md),
[W65](../doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md) — plus one
`code` argument holding exactly what is the consumer's: predicates, language adapters, custom group
types and custom node-type classes (P18 decision 7). The document is RESOLVED against the code once,
at construction — `resolveRegistry` in `src/definition/registry.ts`, which the runtime entry (W66)
calls before it builds anything; `new Driver` runs its SHAPE half, `checkRegistry` — every worker's
`url` and schemas, every type's shape and worker, every named pool's type, no pool named as a type —
and no derivation, config check or group check, which are the resolver's and the bootstrap helper's — and
**every defect in it is refused there, by a named error, before a flow is read**: a registry defect is
reported where the registry is built (the maintainer's *must be present in the registry*, decision 1),
and it is never an `FD-V`, because the fix is in a different file from the one those rules name.
**Resolution builds nothing**: no pool, no group, no driver; it returns names looked up, schemas held
to the subset, configs held to their schemas, and every derivation RUN with its output checked.

#### The registry document

| key | | |
|---|---|---|
| `workers` | object, by name | one entry per worker module — below. Absent means EMPTY, as every section here does |
| `groups` | object, by key | one resource group per key, each an instance of a group TYPE with a config its factory's schema admits. **The key is the group's identity** and the object's own `id` is inert (ADR 0049 fact 2) |
| `nodeTypes` | object, by name | the document-declared node types — below. A class registered in `code.nodeTypes` is a node type too, and **a name in both is refused** (`NameCollision`): one namespace, one definition per name |
| `pools` | object, by key | NAMED instances of a node type. **Every type has a DEFAULT instance, implicit, keyed by the type's name and built from the type's own `config`**; a named instance is the same derivation over its own config — and, an instance of a DOCUMENT type, over its own pool options too (v0.37) — and a pool named as a type is refused |
| `predicates` | array of names | the predicates the flows may name in `when`. `code.predicates` supplies each; one named and not supplied is refused (`NameMissing`) |
| `languages` | array of names | the languages the flows may name in `transform.lang`. `code.languages` supplies each adapter; one named and not supplied is refused — **the runtime imports NO engine** (ADR 0052 rule 4, decision 13). **Every typed pool carries every language named here** (v0.34, ADR 0096), so naming one costs each worker of each typed pool its load in `setup()` |

#### A worker entry

| key | | |
|---|---|---|
| `url` | required | the worker class's module URL — its default export is the class, the scheduler's own contract. A relative URL resolves against the `base` the runtime is given (decision 7): inside a bundle `import.meta.url` is the bundle ([Q261](../doc/questions/q261.md)) and the runtime cannot guess |
| `configSchema` | optional, CHECKED | what the worker's CONSTRUCTOR argument must satisfy — a type's derived config (its default instance's) and every named instance's, at construction |
| `settingsSchema` | optional, CHECKED | what a node's effective `settings` must satisfy — `FD-V33`, at `new Driver`, a schema where v0.17 had a function. The type's `settings` defaults are merged UNDER the node's before it is applied |
| `inputSchema` | optional, CARRIED | what the worker's `run()` receives as `input`. Declared, held to the subset, and enforced on ONE value per run — the entry payload at `start()`, `FD-R4` (v0.21, W73), and not where the node declares a `transform`, whose RESULT is what `run()` receives (v0.40) — never per settlement; what it buys an author before any run is the wiring check (the subsection below). **Since v0.20 it may carry `examples`** — the subset's thirteenth keyword, an annotation held to the schema at construction ([ADR 0056](../doc/decisions/0056-an-example-is-an-annotation-validated-against-the-schema-it-sits-on.md)) — and the first example is what `scripts/check-workers.mjs` RUNS the worker on; with none, the generator's witness, and the verdict says which |
| `outputSchema` | optional, CARRIED | what the worker's `run()` returns. As `inputSchema`; **since v0.20 the value the worker actually returned is validated against it by `check-workers`**, an authoring-time check and never a driver behaviour (P19 decision 3); **and since v0.21 a PERSON's resolution is held to it at `resolve()`** — `FD-R4`, once per human action, the one value at that boundary no worker produced |

**An absent schema means UNCHECKED**, stated rather than left to guess (decision 3): a worker with no
`settingsSchema` accepts any `settings` object, with no `configSchema` any config — which is what
v0.17's absent validator meant. **All four schemas are held to the subset at construction** even
though two are applied, because a malformed `inputSchema` is a registry defect the day it is written
and not the day P19 reads it — **and since v0.20 that includes every `examples` a schema declares**:
an example that refutes the schema it sits on is refused at construction (`SchemaRefused`, naming the
entry, the field and the example's index), on the same argument. **An absent `examples` means
NOTHING is declared, and nothing is refused for it** — the maintainer's choice at
[W72](../doc/work-items/w72-the-contract-an-example-beside-every-schema-and-a-worker-run-on-it.md)'s
stop-and-ask 1, with the fallback priced: a tool that needs a value to run a worker on generates a
WITNESS from the schema and says so, and a witness is the least value the schema admits — `{}` for
thirteen of the sixteen corpus input schemas and `{"text":""}` for the one that requires a key —
which exercises fewer output paths than the declared example in five of the twelve corpus workers
whose output a schema describes (measured there, on the shipped document).

#### A node type, in the document

```json
"Prompt": { "worker": "prompt", "inline": false, "config": { "model": "small" },
            "pool": { "maxThreads": 4, "idleTimeout": 30000 }, "groups": ["vendor", "budget"],
            "retryPolicy": { "maxRetries": 1, "backoffMs": 500 }, "settings": { "temperature": 0 } }
```

| key | | |
|---|---|---|
| `worker` | required | a key in `workers`. A type naming a worker the document lacks is refused (`WorkerMissing`) |
| `inline` | optional | the pool's `inline`, FIXED per type — an instance may not override it. Absent means the scheduler's default, and the derived options OMIT the key (fact 5's rule applied to `inline`) |
| `config` | optional | the DEFAULT instance's config — the worker's constructor argument. Absent, the derived options carry no `config` key and the schemas see `{}` (P18 decision 1's *`{}` when neither declares one*, applied as fact 5's rule to the key); a worker `configSchema` that requires a key then refuses the type (`TypeDefaultRefused`) |
| `pool` | optional | the declared pool options: what a derivation returns (below) MINUS `config` and `groups`, which the type states beside it. A key inside it that is not one of those is refused (`UndeclaredKey`). **A named instance may override them** (v0.37, the instance table below) |
| `groups` | optional | the POOL's group keys, every one in `groups`; the scheduler unions them with a node's own `workerGroups` (W58's measurement), and a pool naming a group the scheduler lacks acquires nothing in silence (P16 fact 2), so an unknown key is refused here (`NameMissing`) |
| `retryPolicy` | optional | the type's retry default for its nodes — `FD-V30`'s shape, held at construction naming the type, merged as v0.17 says: the node's own, whole; else the type's; else the driver's |
| `settings` | optional | settings DEFAULTS, a plain object merged UNDER a node's `settings` before the worker's `settingsSchema` is applied and before the envelope is built — decision 12, the one new field on a type. What a worker receives is the merged object |

**A node type is a DERIVATION from an instance's config to pool options** (decision 2), and the
document form above is the IDENTITY derivation: an instance's config merges shallowly over the
declared `config` (two plain objects merge key by key, the instance's winning; anything else, the
instance's replaces the type's when given), and `pool`'s fields and `groups` are copied as declared — **every
declared object COPIED, never aliased**: `groups`, `messages` and, since v0.37, `residentGroups` (P37 decision 8), so no
two pools' specs share an object and none shares one with the document. **A named instance's own `pool` options**
(v0.37, [ADR 0099](../doc/decisions/0099-a-named-instance-of-a-document-type-may-declare-its-own-pool-options.md)) **merge shallowly over the declared `pool`** before the fields are
copied — the instance's key winning, a key present with `undefined` absent, a nested `messages` replaced whole.
**A class registered in `code.nodeTypes` is any other derivation** — the interface
`NodeTypeDefinition` in `src/definition/types.ts`: `worker`, `inline?`, `configSchema?` (the knobs an
INSTANCE may set, applied to the instance's config BEFORE the derivation is called), `config?` (the
default instance's), `retryPolicy?`, `settings?`, and **`pool(config, key)`**, which returns what one
`WorkerManager` needs. `model: "large"` into a resident VRAM cost and a thread count is the plan's
sample. **A document type declares no `configSchema` of its own**: its knobs are simply the fields an
instance may override, and its derived config meets the WORKER's `configSchema` exactly as a class's
output does. **Both outputs pass through the same checks, so a class cannot compute around one** —
the shape below, then the worker's `configSchema` over the derived `config`, then every group named
present, then decision 9's refusal. A class decides how a pool is BUILT and nothing about which node
runs on it; that is routing, and ADR 0001 keeps routing in the driver.

#### What a derivation returns

| key | | |
|---|---|---|
| `config` | optional | the worker's constructor argument — held to `workers[worker].configSchema` |
| `maxThreads` | optional, integer >= 1 | the scheduler's own option |
| `maxConcurrentTasks` | optional, integer >= 1 | the scheduler's own option |
| `idleTimeout` | optional, finite number >= 0 | the scheduler's own option — **never `0` beside `residentGroups`** |
| `groups` | optional, distinct group keys | the pool's groups |
| `residentGroups` | optional, group keys or `{ key: cost }` | held for the WORKER's lifetime rather than per task — **never a group of the built-in `KeyedRateLimitGroup` type** (v0.39, [Q619](../doc/questions/q619.md)): the scheduler resolves no key for a resident group, so it would count every worker in one `""` bucket; refused after the pools are derived (`DerivationRefused`, naming the pool and the group) |
| `cancelGraceMs` | optional, a number >= 0, `Infinity` included | the scheduler's own option (v0.33): on a THREADED pool, the ms a cancelled task's worker gets to stop by itself before it is forced; `Infinity` never forces. The scheduler accepts it on an inline pool and ignores it, and so does this table. **`null` is refused here**, where the scheduler reads it as absent and uses its default |
| `messages` | optional, `{ flushIntervalMs?, maxBuffered? }` | the scheduler's own option (v0.33): the bounds on a worker's `emit()` — `flushIntervalMs` a finite number > 0 **and at most 2^31-1** (v0.37, P37 decision 9 — the scheduler's own `MAX_TIMER_MS`: it arms `setTimeout` with the value, and a longer delay fires at once), `maxBuffered` an integer >= 1. **A PLAIN object — its prototype `Object.prototype` or `null`** — and its keys are its OWN ENUMERABLE ones, which is what the scheduler's spread over its defaults reads: a Map, a Date, an array or a class instance is refused, where the scheduler would read nothing from it in silence. **A key PRESENT is held whatever its value, `undefined` included**, because the scheduler throws on a present `undefined`; a key beside the two is refused, because the scheduler carries it to every worker and a value that cannot be cloned fails a threaded task at run time |

A key is present only when the derivation has something to say — **a `groups` key is ABSENT when the
type declares none, not present and empty** — which is P18 fact 5's captured shape and what keeps
every pool built before this version equal to itself as CANONICAL JSON (prediction 2 — key order is what
today's literal happens to be and not a rule, and `test/definition/registry.test.ts` compares fact 5's
capture that way). A key beside the eight (six until v0.33), a
wrong type, a repeated group (in `groups` or in `residentGroups`), a zero cost, and a derivation that THROWS or returns a non-object are
each refused (`DerivationRefused`), naming the type or the instance. **A resident group beside
`idleTimeout: 0` is refused** (decision 9): a worker that never idles never releases a resident
group, and a second pool contending for it waits for ever — measured on 0.5.2 at P18's declaration
(fact 6), the scheduler reference's own sentence, reproduced to the field. **And since v0.39 a derived pool whose
`residentGroups` names a group of the built-in `KeyedRateLimitGroup` type is refused** (`DerivationRefused`, naming
the pool and the group — [Q619](../doc/questions/q619.md) option B): read after EVERY pool is derived, so a type's default
instance, a named instance — of a document type, of a class, or of the built-in `Transform` — and a class's output are held
alike; the scheduler resolves no key for a resident group, so it would count every worker in one `""` bucket.

#### A pool instance, and a group

| key | | |
|---|---|---|
| `type` | required | for a pool, a node type's name (`PoolTypeMissing` otherwise); for a group, a group type's name — a built-in below, or one registered in `code.groupTypes` (`GroupTypeMissing` otherwise) |
| `pool` | optional, a POOL instance's only | **v0.37** ([ADR 0099](../doc/decisions/0099-a-named-instance-of-a-document-type-may-declare-its-own-pool-options.md)) — the instance's OWN pool options, on an instance of a **DOCUMENT** type (one the document declares, or the built-in `Transform` — held as declared, or RESOLVED: the definition `nodeTypeFromDeclaration` returned for it, which is what `createRuntime` hands the bootstrap helper and `runtime.registry` hands a driver; a hand-written `NodeTypeDefinition`, or a copy of a resolved one, is a CLASS to this rule, though both have a `pool` function): the keys the type table's `pool` may declare and no other (`UndeclaredKey`), each held to *What a derivation returns* (`DerivationRefused`, naming the pool and the key), **merged SHALLOWLY over the type's declared `pool`** — the instance's key winning, a key present with `undefined` absent, a nested `messages` replaced whole — and every object copied. The MERGED spec then takes the derivation's checks like any other: a resident group the document lacks (`NameMissing`), a resident group beside `idleTimeout: 0` from either side (`DerivationRefused`). **On an instance of a CLASS type it is refused** (`UndeclaredKey`, naming the pool and the type) — a class receives the instance key in `pool(config, key)` and owns how its pool is built, so the knob belongs in its `configSchema`. The scheduler's `idleCheckIntervalMs`, `requeueFailedTasks` and `maxWorkerRestarts` are not admitted here or on a type. **An instance of `Transform` may therefore declare `residentGroups`** — the one road by which a transform-only pool holds a resource group ([Q626](../doc/questions/q626.md)); `groups` and `inline` remain unreachable. A group has no such key |
| `config` | optional | for a pool, the instance's config — the derivation's input, held to the type's `configSchema` where it has one, its DERIVED config held to the worker's (`ConfigRefused`). **Absent, a DOCUMENT type's instance inherits the type's `config` (the identity derivation merges over it), and a CLASS type's instance is derived from `{}` — a class whose `configSchema` requires a key refuses a config-less instance by name** (the adequacy reader, P3); for a group, the factory's argument, held to the group type's `configSchema` (`GroupConfigRefused`) |

A task node names a pool ONE way: its `type`, and optionally a `pool` that is a named instance of
that type (section 2). A `pool` key on the node naming the type's own name means the default
instance and is accepted.

#### The built-in group types

The scheduler's three group classes have three different constructors, so a group type is a
FACTORY, `{ configSchema?, create(config, key) }` (decision 4), and the runtime (W66) ships the
three built-ins in that shape; a consumer registers a custom class the same way, and a custom type
named as a built-in is refused (`NameCollision`). What the DOCUMENT side holds of a built-in is its
name and its config schema — P18 fact 2, read off the scheduler's `.d.ts` at the pin:

| name | config | constructor it stands for |
|---|---|---|
| `ConcurrentLimitGroup` | `{ limit }`, an integer >= 1 | `new ConcurrentLimitGroup(limit, key)` |
| `RateLimitGroup` | `{ windows: [{ limit, windowMs }, …] }`, at least one, integers >= 1 | `new RateLimitGroup(windows, key)` — `RateWindow` verbatim |
| `KeyedRateLimitGroup` | `{ windows }`, as above | `new KeyedRateLimitGroup(windows, { id: key })` — **no `keyFrom`, so the scheduler keys each task by its `limitKey`, which only a consumer's `createTask` sets: a node reaching one is `FD-R6`** (v0.35); **and a derived pool holding one in `residentGroups` is refused at construction** (v0.39, `DerivationRefused`) — a resident group is keyed by nothing |

The object a factory returns must implement the scheduler's `ResourceGroup` interface, and **the
runtime holds it to SIX members, which is wider than that interface marks required**:
`canRun`, `onStart` and `onFinish` because the scheduler CALLS them, `getMetrics`, `id` and `type`
because the interface requires them and a viewer reads them — each refused by name, against the
group's key ([ADR 0055](../doc/decisions/0055-a-group-factorys-output-is-held-to-what-the-scheduler-calls.md),
[W66](../doc/work-items/w66-the-runtime-entry.md)). *(This said the two required members were
`canRun` and `getMetrics` and that the runtime checked for both — a faithful reading of the `.d.ts`
(fact 2) and false of the implementation: measured at 0.5.2, a group with no `onStart` THROWS on its
first task, one with no `onFinish` leaves every task naming it running for ever with the scheduler
reporting idle, and one with no `getMetrics` runs to `done`. W66's conformity reader.)* **`EventTarget`
is not required**, though the interface extends it: a plain object carrying the six holds a task and
completes it.

#### Gate types — CODE, beside the built-ins — v0.23

A gate's `type` names a GATE type ([ADR 0066](../doc/decisions/0066-a-gate-is-a-decision-with-memory-that-names-a-registered-type-and-wires-every-route-exactly-once.md)), and every gate type — the
built-ins `distinct`, `if` and `switch` included — is a value of ONE public interface, `GateType` in `src/definition/types.ts`:

| member | |
|---|---|
| `routes` | a STATIC type's — every route the type may return — a non-empty list of distinct names, each in `FD-V16`'s charset. Every one must be wired by exactly one edge (`FD-V41`) |
| `defaultRoute` | a STATIC type's — one of `routes` — what an edge with no `route` carries. **Not necessarily the first** |
| `routesFor` | **v0.30** — a DERIVED type's, IN PLACE of `routes`, `defaultRoute` and `keyResolvedRoutes`: a function from a gate's settings to that gate's `{ routes, defaultRoute, keyResolvedRoutes? }`, held to exactly the clauses those three members are held to, with no other key. **A type carries the static members or `routesFor`, exactly one of the two** — both, or neither, is `FD-V39` and `GateTypeRefused` ([ADR 0092](../doc/decisions/0092-a-gate-types-routes-are-declared-statically-or-derived-from-its-node.md)). Asked ONCE per gate at instantiation — by the validator and the driver — once `FD-V40` found nothing on that gate and its `settingsProblem` did not throw, with a COPY of its settings (`{}` when absent); settings that cannot be copied are `FD-V40`, the settings' defect and not the type's; the wiring check, which does not validate first, asks it over the settings as given; a throw or a malformed set is `FD-V39`, reported at the GATE, since only a gate has settings. A pure function of its settings: the validator, each driver and each resume ask it separately |
| `settingsSchema` | optional — what a gate's `settings` must satisfy, in the built-in subset; absent means UNCHECKED (P18 decision 3). `FD-V40` applies it |
| `settingsProblem` | optional, **v0.30** — `(settings) => string \| null`, what the settings must satisfy BEYOND the schema, because the subset cannot state a grammar (ADR 0053). `FD-V40` runs it with a COPY of the settings once they are a plain object the `settingsSchema` accepts, and reports its message under `FD-V40` — an EMPTY string included, a refusal whose message says the type gave no reason; a throw, or a return that is neither a string nor `null` (`undefined` included), is the TYPE's defect and `FD-V39`, and a throw blocks the gate's route resolution as a refusal does. Settings that cannot be copied are `FD-V40` and it is not asked |
| `keyResolvedRoutes` | optional, **v0.25**, a STATIC type's (a derived type returns it from `routesFor`, v0.30) — the routes on which the gate's KEY PATH resolved, a subset of `routes` without repeats, refused by **`FD-V39`'s second clause** like every other malformed member of this interface (one predicate, `gateTypeProblem`, reported at the gate that names the type). **The one guarantee a route can make that the library can act on**, because `settings.key` is the one thing the driver resolves on a gate's behalf: a type naming a route here says *when I return this, that path was there*, and the wiring check refines what leaves the gate on it (below). Absent means the type makes NO guarantee, which is what every type said before v0.25. **PRESENCE only** — whether a resolved key is a USABLE key is the type's judgement (`distinct` wants a string or a finite number) and nothing static derives it. `distinct` declares `['first', 'duplicate']`, read off its own `fn`, whose first statement sends every other case to `nokey`. **Since v0.26 it is read in the refusing direction too**: where the arriving schema FORBIDS the key path, the route it names can never be taken and the arc leaving on it is `no` |
| `fn(ctx)` | the decision, synchronous: handed `{ key, input, settings, memory }` — `settings.key` resolved over the value that reached the gate, that value, the gate's settings, and the gate's memory — and returning one of `routes` (since v0.30, one of the GATE's resolved routes). **Called by the driver where a branch enters the gate, since v0.24** — and once more at `start()` for an ENTRY gate, against a throwaway memory, for `FD-R4` alone, so a type is the pure function of its context Q9 asks every decision to be |

**A type is CODE, not a document entry** — `fn` is a function, which a JSON registry cannot carry, so a
consumer registers their types in the driver registry's **`gateTypes`** (a `Map` or a plain object keyed
by name), the way a language adapter's `compile` is supplied in code. **Absent, the built-ins alone**: the
set only ever ADDS, and a consumer type named as a built-in is refused rather than merged (`NameCollision`),
exactly as a custom group type named as a built-in is. **`distinct` is registered THROUGH the interface**:
nothing in the validator, the wiring check or the driver names it; each reads the interface's members off
whatever type a gate names — the routes through the gate's RESOLVED set since v0.30 — and `distinct` is held to the same predicate as a consumer's
(`gateTypeProblem`), so the extension road is exercised the day it ships (P24 decision 2). **So are `if` and
`switch` since v0.31** (section 2's gate subsection) — `if` a static type, `switch` a derived one, so each road of
ADR 0092 has a built-in on it — and `if` and `switch` are names a consumer's type may not take. **A driver is
handed the set as `DriverOptions.gateTypes`, and a runtime consumer as `RegistryCode.gateTypes`**, which the
runtime holds to `GateType` where it is built and hands every driver it starts or resumes as
`runtime.registry.gateTypes` — v0.24, [W93](../doc/work-items/w93-what-a-gate-does-in-a-run.md).

#### The schema subset

Every schema above is JSON Schema restricted to the seventeen keywords below — twelve that CONSTRAIN
and five ANNOTATIONS (`examples`, v0.20, [ADR 0056](../doc/decisions/0056-an-example-is-an-annotation-validated-against-the-schema-it-sits-on.md);
`title`, `description`, `readOnly` and `writeOnly`, v0.36, [ADR 0098](../doc/decisions/0098-four-annotations-join-the-schema-subset-and-constrain-nothing.md)) — the built-in subset
[ADR 0053](../doc/decisions/0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md)
chose over a 42 KB or a 262 KB dependency, at 1.5 KB bundled as fact 1's prototype and **4.2 KB as the
shipped module** (`src/definition/schema.ts` minified by esbuild at W65 — the diagnostics and the
construction-time check the prototype did not have), measured to cover 14 of 14 of the
plan's sample cases (fact 1). **A keyword outside it is REFUSED at construction naming the keyword,
never ignored** ([Q278](../doc/questions/q278.md)): JSON Schema's own semantics ignore an unknown
keyword, so a `pattern` in a worker's `settingsSchema` would constrain nothing in silence and every
`settings` value would pass — W43's zero-score shape one layer up. That refusal is also what makes
prediction 4's reversal legible: a consumer whose worker needs a keyword outside the subset meets a
refusal, not a pass, and the day that happens ADR 0053 names the dependency to take.

| keyword | means | |
|---|---|---|
| `type` | one of `object`, `array`, `string`, `number`, `integer`, `boolean`, `null`, or a list of them | `integer` is a number with no fraction; **`number` and `integer` admit FINITE numbers only** — JSON text cannot carry `NaN` or an infinity, so a schema over JSON data reads them as *not a number*. A mismatch ends the walk at that path |
| `required` | property names that must be present | presence by key, as JSON Schema reads it |
| `properties` | a schema per named property | each applied when the property is present |
| `additionalProperties` | `true` or `false` | `false` refuses every key `properties` does not name, by name. A SCHEMA here is outside the subset |
| `enum` | a non-empty list of values | membership by VALUE — an object member matches whatever its key order |
| `const` | one value | equality by value |
| `minimum` | a finite number | inclusive lower bound on a number |
| `maximum` | a finite number | inclusive upper bound |
| `minLength` | an integer >= 0 | inclusive lower bound on a string's length |
| `maxLength` | an integer >= 0 | inclusive upper bound |
| `items` | one schema | applied to every element; a tuple form is outside the subset |
| `minItems` | an integer >= 0 | inclusive lower bound on an array's length |
| `examples` | a NON-EMPTY list of values | **an ANNOTATION, v0.20** ([ADR 0056](../doc/decisions/0056-an-example-is-an-annotation-validated-against-the-schema-it-sits-on.md)): three rules. (1) It constrains NOTHING when a value is validated — a value in no example is not refused, and `findings` never reads the keyword. (2) Every example is held to the schema it sits on AT CONSTRUCTION, at any depth, and one that refutes it is refused as `SchemaRefused` naming the index and the finding — a schema and its example agreeing proves only that the schema is self-consistent (P19 fact 6), so the disagreement is caught where the schema is declared. (3) The first example is the SAMPLE every authoring-time check runs on: `check-workers` runs a worker on its input example; W73's wiring check runs a transform on the producer's; with no example, a tool generates a witness and says so. An empty list is refused as `enum`'s is: a declared-and-empty list annotates nothing |
| `title` | a string | **an ANNOTATION, v0.36** ([ADR 0098](../doc/decisions/0098-four-annotations-join-the-schema-subset-and-constrain-nothing.md)): it constrains NOTHING — no value check reads it — and its value is held to its shape at construction, a non-string refused as the keyword's misuse. The empty string is a string |
| `description` | a string | **an ANNOTATION, v0.36**: as `title` |
| `readOnly` | `true` or `false` | **an ANNOTATION, v0.36**: it constrains NOTHING — a value supplied where it is `true` is not refused, at `FD-R4`'s boundary or anywhere — and a non-boolean is refused as the keyword's misuse |
| `writeOnly` | `true` or `false` | **an ANNOTATION, v0.36**: it constrains NOTHING and **promises NO REDACTION** — a value under it is carried, cloned, retained in what a run records and reported exactly as any other value, because the library reads the keyword nowhere; a consumer that redacts does so in its own code. A non-boolean is refused as the keyword's misuse. `readOnly` and `writeOnly` may both be `true`, which JSON Schema does not forbid |

An EMPTY schema `{}` is in the subset and accepts every value. Every keyword's VALUE has the shape
the table states, and a wrong one is refused as the keyword's misuse (`SchemaRefused`) before any
value is checked. What is NOT in the subset, and is refused rather than ignored: `pattern`, `format`,
`oneOf`/`anyOf`/`allOf`/`not`, `$ref`, exclusive bounds, `maxItems`, `uniqueItems`, and the
annotation keywords `deprecated`, `$comment`, `default`, `$schema` and `$id`. **An annotation is
admitted when it constrains nothing in JSON Schema itself AND its value shape is CHECKED** (v0.36,
ADR 0098 rule 5) — a necessary condition, not a sufficient one: each of the five inside is held to
something (`examples` to the schema it sits on, the other four to their shape), an annotation held to
nothing would be the ignored kind Q278 refused, and one that meets the bar joins by an amendment of
ADR 0098 when a consumer asks for it. `default` stays out because an author expects it APPLIED and
nothing here applies one; `format` because it READS as a constraint and would check nothing here —
Q278's hazard, one keyword from `pattern`; `$schema` and `$id` because they name a dialect and a base
URI for `$ref`, which is outside; `deprecated` and `$comment` meet the bar and no consumer has asked
for either. *(Until v0.36 `title` and `description` were in that list, refused as a consequence of
the rule rather than a judgement about annotations — ADR 0053 rule 3, superseded for the four by ADR
0098.)*

#### What the registry refuses at construction

Each is a class extending `RegistryError`, carrying `at` (the entry's key) and a message naming the
entry and, where one exists, the schema finding. **Checked for EVERY entry of a kind before the next
kind is read**, so a refusal names the first defect and nothing is half-resolved — a document with a
bad pool AND a bad worker names the worker, fixtured. `test/definition/registry.test.ts`
carries, for each, a document that trips it and the plan's sample that does not.

| class | refused when |
|---|---|
| `WorkerMissing` | a node type's `worker` names no entry in `workers`, a node type names no worker at all, or a worker entry has no `url` |
| `PoolTypeMissing` | a pool instance's `type` names no node type |
| `ConfigRefused` | a NAMED instance's config fails its type's `configSchema`, or its derived config fails the worker's |
| `TypeDefaultRefused` | a type's OWN config — its default instance's — fails its own `configSchema` or, derived, the worker's: the type has no valid default and **the type is refused, not its nodes** (decision 1, the maintainer's) |
| `GroupTypeMissing` | a group's `type` is neither a built-in nor registered in `code.groupTypes`, or a registered group type is not `{ configSchema?, create }` |
| `GroupConfigRefused` | a group's config fails its group type's `configSchema` |
| `NameCollision` | a node type is declared in the document AND registered as a class; a pool is named as a node type; a custom group type is named as a built-in; **a registered gate type is named as a built-in** (v0.23) |
| `SchemaRefused` | a declared schema — any of a worker's four, a group type's, a class's — carries a keyword outside the subset or a keyword with a malformed value ([Q278](../doc/questions/q278.md)); **or, since v0.20, carries an `examples` value the schema it sits on refuses** ([ADR 0056](../doc/decisions/0056-an-example-is-an-annotation-validated-against-the-schema-it-sits-on.md)) — the same class, because an example that refutes its schema is a defect of the DECLARATION, and the message says which kind |
| `UndeclaredKey` | the document, a worker, a node type, its `pool`, a pool instance, a pool instance's `pool` or a group carries a key its kind does not declare; **an instance of a CLASS type carries `pool`** (v0.37); a section is not an object keyed by name; or `predicates` / `languages` is not an array of names |
| `NameMissing` | a predicate or language the document names and `code` does not supply (or a language whose adapter has no `compile`); a node type's declared group, or a group a derivation names, that `groups` lacks |
| `DerivationRefused` | a derivation throws or returns something that is not a `PoolSpec`; a `pool` (a type's, or since v0.37 a named instance's), `inline`, `groups`, `retryPolicy` or `settings` field of the wrong shape; a resident group beside `idleTimeout: 0`; **since v0.39, a derived pool — a type's default instance, a named instance, a class's output alike — whose `residentGroups` names a group of the built-in `KeyedRateLimitGroup` type**, read after every pool is derived and naming the pool and the group ([Q619](../doc/questions/q619.md) option B) |
| `GateTypeRefused` | **a registered gate type is not a `GateType`** (v0.23, W92): not an object, a key beside the interface's seven, **static routes AND `routesFor`, or neither** (v0.30, ADR 0092), a `routesFor` or a `settingsProblem` that is not a function (v0.30), `routes` empty or repeated or outside `FD-V16`'s charset, a `defaultRoute` that is not one of them, a `settingsSchema` outside the subset, **a `keyResolvedRoutes` that is not an array, names something that is not one of its routes, or repeats one** (v0.25), or no `fn`. **Checked by `checkRegistry` on EVERY call** — the built-ins are held to the same predicate whether or not the registry carries `gateTypes`, and a consumer's are checked beside them. *Gate types are code, so this row's fixtures both ways are in `test/definition/gate.test.ts` and not in `registry.test.ts` — the one exception to this section's opening sentence* |

**What the DRIVER reads of a resolved registry, and how `new Driver` relates to it.** The driver's
registry — `predicates`, `groups`, `workers`, `nodeTypes`, `pools`, `languages` — is DERIVED from the
resolved document and exposed by the runtime as `runtime.registry` (decision 14), so a consumer who
builds a `Driver` by hand passes the same shape the runtime does. Of a node type the driver reads
`worker` (to find the `settingsSchema`, `FD-V33`), `settings` (the defaults) and `retryPolicy`; of a
pool it reads its `type` (`FD-V38`); it constructs nothing and never calls a derivation. **A flow
references registry keys only, so a flow document is portable across runtimes that agree on keys**
(decision 10).

#### A runtime is its registry — check, then start — v0.34, v0.35

[ADR 0096](../doc/decisions/0096-a-runtime-is-its-registry-and-start-refuses-from-runtime-check.md),
[P37](../doc/plans/p37-a-runtime-is-its-registry.md) decisions 1-3 and stop-and-asks (a) and (b). **What a
runtime is built from is fixed at `createRuntime`** — its node types, pools, groups and languages —
because the scheduler takes its pools in its constructor and cannot add one later (P37 fact 8); a
changed registry is a NEW runtime, and nothing adds to a running one. **A FLOW is not part of it**: a
runtime is given no flows at construction, and it may be asked to run any flow at any time.

| | |
|---|---|
| **languages** | every typed pool — every type's default instance, every named instance, the built-in `Transform` — carries the worker half of EVERY language the registry names, under its name. A registry naming none writes no `languages` key, and every pool it builds is what it built before v0.34 |
| **`check(flow)`** | returns every finding `start(flow, payload, {})` would refuse `flow` on that depends on the FLOW and the runtime alone, as `{ rule, at, detail }` — `validateDefinition`'s findings against the runtime's own registry, the predicates read by name, and — since v0.35 — one `FD-R6` finding per task node reaching a group the built-in `KeyedRateLimitGroup` factory built (section 6). **`check` reads as `start` given no `createTask`**: it has none to read, so it reports `FD-R6` whatever the caller will pass, and a caller who starts with a `createTask` setting `limitKey` filters `FD-R6` out by its rule id. **It never throws for a flow's defect**: it returns every finding. What THROWS instead is exactly two shapes: `null` or `undefined` in place of the flow, and a `nodes` that is PRESENT and not iterable — each the validator's own `TypeError`, from `check` as from `start`. Any other value is read and reported: a non-object primitive such as `5`, or `{}`, returns `FD-V23` findings |
| **`start` and `resume`** | each calls `check(flow)` FIRST — before a run id is minted, before `RunIdInUse`, before a driver is built — and its findings OTHER than `FD-R6` — exactly `validateDefinition`'s — are thrown as `InvalidDefinition`, its `rules` their rule ids, sorted and distinct, and its message the one `new Driver` builds from the same findings; **then, when no `createTask` was given, its `FD-R6` findings are thrown as `LimitKeyMissing`**, a `RuntimeError` whose `at` is the first such node in the flow's order (v0.35). `InvalidDefinition` never carries `FD-R6`, so a flow with both is `InvalidDefinition` first. So `check` and `start` cannot disagree, and a refused flow spends no run id. `resume` checks once its checkpoint's header is accepted (`RN-R23`) and its entry payload cloned (`RN-R15`), before anything is replayed. **So on the runtime road the FLOW is refused before the RUN ID**: a flow `check` refuses is `InvalidDefinition` even when the run id given is outside `ID-R2`'s charset or already in use — the reverse of `new Driver`'s own order, where `ID-R2` runs before the definition is validated ([ADR 0022](../doc/decisions/0022-a-driver-takes-its-run-at-construction.md) rule 3, which ADR 0096 amends for this road) |
| **excluded from `check`, by name** | the PAYLOAD's refusals — `FD-R4` and the entry payload's clone (`RN-R15`) — and the RUN ID's — `ID-R2` and `RunIdInUse` (`RN-R25`): each depends on what a run is started with, not on the flow |

*Register* a flow on a running runtime is *check, then start*. **`defaultRetryPolicy` is held at `createRuntime`**
(v0.35, [ADR 0097](../doc/decisions/0097-what-start-refuses-that-the-flow-does-not-decide.md) rule 5): the one `RuntimeOptions` member a driver refuses is refused FIRST, before
the document is resolved or anything is built, as `InvalidDefinition` with rules `['FD-V30']` and the message `new
Driver` builds for the same value — so a runtime that exists has a default every driver accepts, and `check` stays a
function of the flow and the runtime. Until v0.35 `createRuntime` forwarded it unread and every `start` threw `FD-V30`,
on every flow (P37 fact 6).

#### What the schemas buy an author — the wiring check — v0.21

**A worker's `inputSchema` and `outputSchema` were never for the run; they were for the AUTHOR** — a person
or an agent wiring a flow — so that a tool can say, before anything runs, whether what one node
produces is what the next one reads ([P19](../doc/plans/p19-what-a-schema-buys-an-author.md), the maintainer's argument of 2026-09-18; [W73](../doc/work-items/w73-the-wiring-check-a-verdict-per-edge-and-two-boundaries-validated-once.md)).
`checkWiring(registry, flow)` in `src/definition/wiring.ts` (exported from the root) reads the two schemas
through each task's TYPE's worker and gives EVERY ARC one verdict. What arrives on the producer side
of an arc is what `FD-C1`, `JP-R11` and `JP-R12` say the consumer receives, as a SCHEMA — five arc
shapes, and since v0.38 a sixth row for the one shape that is NOT an arc, `given`, so the table is every
`WiringShape` there is:

| arc | what arrives |
|---|---|
| `edge` | the producer task's `outputSchema` — section 3's ordinary edge |
| `branch` | what the fan-out received, the same value to every branch (`JP-R11`) |
| `item` | one element of the array the map received under `over` — the `items` sub-schema of the producer's property; a CLOSED producer (`additionalProperties: false`) whose schema never emits `over`, or any producer that calls it something other than an array, is `no`, which is `FD-R2` predicted before a run; an OPEN producer that says nothing about `over` is `unchecked` (it may emit it — the leniency, one row down). The sample is the example's array, and a transform on the branch task runs once PER ELEMENT |
| `record` | `JP-R12`'s record, at a join's successor — for a `fanout`, EXACT in its keys — every declared branch path a property of its arriving node's output, no other key — and REQUIRING none of them, because a branch that is lost has no entry and a branch is lost by three roads no document shows (an `optional` task failing, a person resolving a suspended task `failed` — `RS-R3`, `spec/join-policy.md` section 2 — or a policy firing before it settles), so a consumer REQUIRING a branch key is `no` (the safe direction: a `fits` the run can falsify is the unsafe kind); for a `map`, an object whose keys are branch paths minted at run time, each of the one branch's output shape. **The subset cannot write that** — measured at W73's declaration, `additionalProperties: <schema>` is refused by `schemaProblem` — so the check carries the record's shape itself and no author writes it; a declared input schema for a join successor is `{ type: object }` at best (P19 decision 8) |
| `needs` | `FD-C1`'s table composed: `"."` the arc's value, an id that node's output, `[id]` an array of it, a `?` an optional key — one object schema, and the same object as a sample; **a `"$payload"` key makes the arc `unchecked`** (v0.44, P38 (i)) — the run's payload is a value no schema declares, and borrowing the entry task's `inputSchema` would be right only where the entry is a task with no `needs` and no `transform`, so no schema is borrowed and no `fits` is claimed; **a `"$item"` key is the enclosing map's ITEM arrival** (v0.45, P38 (i)) — the `item` row's schema and its per-element sample, the key taking each element in turn as `"."` keys do over an `item` arc — and `unchecked` where that map has no single arrival (an ENTRY map, whose arrival is the run's payload, or a map entered from two producers); over a map's `item`, one composed object PER ELEMENT, evaluated per element as the run does (W73's adequacy reader found the first cut composing the whole array under the key and reading a correct wiring `transform-fails`). An ENTRY task's `needs` composes the run's payload and is NO ARC — `FD-R4`'s, below |
| `given` | **NOT an arc** (v0.38, [W166](../doc/work-items/w166-a-sample-the-caller-gives.md)): the value a caller hands `tryTransform(…, { input })` as what the node receives — on any task node, the entry included, ONE verdict with no producer and the sample source `'given'` (*A sample the caller GIVES*, below). `checkWiring` never produces it |

| verdict | means |
|---|---|
| `fits` | every value the producer's schema admits, the consumer's `inputSchema` accepts — P19 fact 3's relation over the twelve constraining keywords (`examples` is read by nothing, ADR 0056 rule 1, and nor are `title`, `description`, `readOnly` and `writeOnly`, ADR 0098 rule 3), promoted from the declaration's harness verbatim, with its ONE stated leniency: a key the consumer describes and does not require, which an open producer does not name, is read as never emitted, because an author who leaves an output schema open means *there are keys I do not describe*, not *the keys you describe may hold anything*. **And its ONE scope, v0.26** ([W100](../doc/work-items/w100-what-a-key-path-must-satisfy.md)): a key the PRODUCER REQUIRES is not read as never emitted, because `required` says that key IS emitted and the leniency's own premise is refuted by the same schema. It is read where the producer is OPEN at that key: a producer that is CLOSED still reads `fits`, because a closed schema requiring a key it does not describe admits no value at all, so no run can falsify that `fits` — the CLOSED shape is `keyPathRefusal`'s question, not this guard's (W100's conformity reader, F5; the row said *its ONE scope* TWICE until W101's found it, one of the two sentences having been added by the fix for that very finding). *Measured before the scope*: a producer requiring `series` and describing nothing read **`fits`** against a consumer describing `series` as an object, for the value `{ name: "n", series: 42 }` that the producer's schema ACCEPTS and the consumer's REFUSES — a `fits` the run can falsify. A required-and-undescribed key is a shape v0.25's refinement is the first thing here that manufactures from an ordinary flow, which is why the scope arrived with it |
| `no` | it does not, and no transform is declared; **or the arc leaves a GATE by a key-resolved route whose key path the producer FORBIDS, which is `no` whatever the consumer declares** — a refusal is about whether the route is ever taken, so it outranks the transform and `needs` roads rather than being a fit judgement they replace (v0.26, W100: both its readers measured the same arc as `unchecked` under a declared `transform` and, on one road, as `fits`). The reason names the path and the keyword, in the words the twelve controls print (`$.confidence: consumer bounds maximum 1, producer declares no maximum`) |
| `transform-passes` | the consumer declares a `transform`; it is run by the language's WORKER half (imported by its URL, never an engine) on a SAMPLE of the producer side — the first declared `examples` entry, else the generator's witness (`src/definition/witness.ts`, P19 fact 5) — and every result satisfies the consumer's `inputSchema`. **The verdict names the sample's SOURCE and, where the producer is a region or a map, its ARITY** ([Q301](../doc/questions/q301.md), [Q263](../doc/questions/q263.md)): a transform's result changes type with the arity, and a witness is not a proof — a sample that passes is *the sample passed*, never *fits* (P19 prediction 2). On a `given` verdict (v0.38) the sample is the value the CALLER gave and its source is `'given'` |
| `transform-fails` | the transform threw on that sample, or its result fails the consumer's `inputSchema` — the message or the finding in the reason |
| `unchecked` | a side declares no schema (P18 decision 3, *absent means UNCHECKED*), a type, worker or language the registry lacks, or a transform with no sample to run on — or, on a `given` verdict (v0.38), a given input with no transform to run it through — named, never a throw, because a report is what an author reads |

**The relation is TOTAL**: every arc gets exactly one of the five, and none is *cannot tell* (P19
prediction 2) — including a region inside a `map` region, which the validator accepts and which
**since v0.22 the driver RUNS** ([ADR 0062](../doc/decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md),
[W84](../doc/work-items/w84-what-a-regions-identity-is.md), [Q160](../doc/questions/q160.md)): the
record's sample keys take item index 0 for every enclosing map, which is a SAMPLE and was already the
right reading — *(this said the driver refuses it at construction and that a static check gives a
verdict where a run would not start; the first half expired when W84 lifted the refusal, and the
second was an argument for the sample rather than for the verdict, so the verdict stands and its
reason is now the one that survives)*. **A GATE carries what reached it, REFINED by what its ROUTE
GUARANTEES** (v0.25, [ADR 0068](../doc/decisions/0068-a-route-guarantees-what-its-type-declares-and-the-library-derives-it-from-the-key-path.md)):
the value is the one that reached the gate — a gate has no worker, so it is never a consumer and produces
nothing — and where the gate's type declares this route **key-resolved**, the SCHEMA gains `required` along
the gate's own key path, at every step, because the run cannot take that route unless the path was there.
A gate routing into a join carries its branch's key into the record as the node before it would.

**And a KEY PATH the arriving schema FORBIDS makes that arc `no`** (v0.26,
[W100](../doc/work-items/w100-what-a-key-path-must-satisfy.md)): the question is per STEP and about the
CONTAINER, because that is what `readKeyPath` is — each segment an OWN key of a PLAIN object, and a missing
key, a `null`, an ARRAY mid-path or a primitive `undefined`. So a step whose declared types cannot include
`object` is refused (`name.id` where the producer calls `name` a string, or `tags.0`, since no index is read),
and so is a step a CLOSED object does not name (`sereis.id` at `$`, or `series.slug` where `series` is closed
over `id` and `title`) — while a step an OPEN object does not name forbids NOTHING, which is the same leniency
the `fits` row states. **The LEAF's type is never read**: `readKeyPath` returns whatever the path ends on, and
*which leaf values count as a key* is the type's judgement ([ADR 0068](../doc/decisions/0068-a-route-guarantees-what-its-type-declares-and-the-library-derives-it-from-the-key-path.md)
rule 3), so a path ending on an array is fine here and `nokey` at run time. The reason names the gate, the key,
the STEP, the schema's own word for it and the ROUTE that can never be taken. **And the check can call a route
unreachable only where the TYPE says what the route means**, so a type declaring no `keyResolvedRoutes` gets no
key-path verdict at all — ADR 0068 rule 1's *nothing is inferred from a type that declares nothing*, in the
refusing direction, and the stated limit of this half. **What a wrong key path costs is a run that does
nothing**: measured on real workers, a misspelled key sends EVERY branch to `nokey`, dispatches NO
per-series task where the correct key dispatches one per series, runs fewer tasks — and reports
**`completed`**, which is why the answer is a static verdict rather than a run-time refusal.

The ROUTE an arc carries is the edge's `route`, or the type's `defaultRoute` where the edge declares none —
resolved through the type rather than treated as a route of its own, because a type's default may be a route
it does NOT call key-resolved. **Three ways the refinement does not apply, each a silence rather than a
guess**: a type declaring no `keyResolvedRoutes`, a gate naming no `key`, and a route the type does not call
key-resolved. In all three the arrival passes through exactly as it did before v0.25.

*(**This read `A GATE is a PASS-THROUGH` (v0.23) — what leaves it on any route is exactly what reached it,
so an arc through a gate is the arc INTO it, verdict and all — until [W99](../doc/work-items/w99-what-a-route-guarantees.md).**
That was conservative rather than wrong about any run, and it produced a `no` on a CORRECT flow:
[P24](../doc/plans/p24-what-a-node-may-remember-across-a-runs-branches.md)'s own exit artifact requires
`series` of a per-series worker sitting past a `distinct` gate keyed on `series.id`, `identify` does not
guarantee `series` because a trailer has none, and the route that reaches that worker is taken only where
the key resolved — so the check read `no` while ladder L6 ran the flow to `completed` in both runtimes
([Q391](../doc/questions/q391.md)).)*
*(Before W92 taught the check the kind, every arc after a gate vanished from the report and a gate routing
into a join dropped its branch's key — measured at W92's declaration step.)* **The ENTRY has no arc**: the run's payload reaches the entry task — or every branch task
of an entry region, recursively, or every route target of an entry GATE (v0.23: which one a run takes is
the gate's decision at run time, so the report lists them all) — with no worker in between, and that is `FD-R4`'s boundary, held at
`start()` (section 6) — except at a task that declares a `transform`, which `start()` does not hold (v0.40): what such a
task's worker receives is the transform's result, and `givenVerdict` below, on the value that task receives, is the check on it. **What it costs to be wrong is what the check exists to find**: measured on the
shipped L6 corpus at W73's declaration, fourteen of fifteen task-to-task edges fit (the fifteenth had no
input schema to meet) and NINE arcs of the other shapes did not — seven of them one dropped bound
flowing through six map items and one `needs` — which P19 fact 3 could not see because it counted one shape. Held by `test/definition/wiring.test.ts`:
the twelve controls as fixtures, the wiring fixture corpus (section 7) with a positive case per
verdict, the L6 corpus's census as an EQUALITY (its counts are the suite's and not this sentence's —
*this carried W73's declaration figures long after the suite's had moved; W166 found it, and a count the
suite derives is not written here* — with the one `no` `map-no-array`'s `FD-R2`, predicted, and every arc
shape reached but `given`, which is no arc), and both enumerations above held to this document both ways.

**An ASK is a PRODUCER and never a consumer — v0.42** ([W179](../doc/work-items/w179-the-ask-node-in-the-definition.md),
section 2's `ask`). What leaves an ask is the person's ANSWER, so an arc it sends carries its `answerSchema` exactly
as a task's carries its worker's `outputSchema` — on an edge, as a branch's arrival in a join's record, and named by
a `needs` — with its example, else its witness, as the sample; an ask declaring no `answerSchema` sends an
`unchecked` arc naming the ask, and one whose schema is outside the subset (`FD-V48`) an `unchecked` arc naming that.
**What reaches an ask gets no verdict**: it is shown to a person and held to no schema — the ask runs no worker, so
it has no `inputSchema` — as an arc into a gate or a join has none of its own. **And an ask is no `FD-R4` target**:
the entry walk stops at one, because what leaves it is the answer and never the payload, so an entry ask gives the
report an empty `entry`.

**A sample the caller GIVES — v0.38** ([P37](../doc/plans/p37-a-runtime-is-its-registry.md) stop-and-ask
(d), [W166](../doc/work-items/w166-a-sample-the-caller-gives.md)). An author in an editor has a value in
hand — typed, pasted, or taken from a run — and wants to know what a transform makes of IT, not of a
schema's example; and the ENTRY node, which no arc reaches, had no verdict at all (P37 fact 4: `[]`).
So `tryTransform(registry, flow, node, transform, { input })` (`src/definition/assist.ts`, `AGENTS.md`
section 15) takes the value the node RECEIVES — `$`:

| | a given input |
|---|---|
| what it is | what the node receives, as given — **no `needs` is composed over it**, because a `needs` composes what arrives and this IS what arrived. `undefined` is not a value and is no input; `null` is |
| how many verdicts | **ONE, whatever arcs reach the node** — none, one or several — on any task node, **the ENTRY included**. A node id naming no task is `[]`, as it always was |
| the verdict | shape **`given`**, **no producer** and no `through`; the candidate is put on a COPY of the node as without an input and run ONCE on the value by the language's worker half — the arcs' own evaluation (`givenVerdict` in `src/definition/wiring.ts`, which `tryTransform` calls) — and the result held to the consumer's `inputSchema`: `transform-passes`, or `transform-fails` with the finding; an expression the engine refuses or that throws is `transform-fails` naming the error; a language, type, worker or worker schema the registry lacks is `unchecked`, as on an arc, naming which. **With NO transform** — a `null` candidate, which takes away any transform the node declares too — there is nothing to run the value through and the verdict is `unchecked`, saying so and, where the consumer side is missing as well, why: holding one value to a schema is `findings`'s question |
| its sample | `source: 'given'`, `value` the value given, `result` what the transform made of it (or the error's message), **no `arity`**. **A given value is never reported as `'example'` or `'witness'`**: it is never an arc's sample, so it never reaches the two places a region's record and a `needs` composition AGGREGATE their parts' sources into one (P37 fact 4) — which are typed over the two sources a schema supplies, so it cannot |

Without an input the answer is the arcs', exactly as before: the entry node is still `[]`. **And on a TRANSFORMING
entry it is the only check of a run's payload before the run** (v0.40, [ADR 0101](../doc/decisions/0101-a-transforming-task-is-not-held-at-start.md)):
`FD-R4` does not hold a transforming target at `start()`, so a caller who wants the payload checked runs each
transforming target's DECLARED transform first — `givenVerdict(registry, flow, task, received)`, which is
`tryTransform(registry, flow, task, node.transform, { input: received })` — on the value that TASK receives, since the
given value is `$` with no `needs` composed: the payload composed through the task's `needs` (at an entry `"."` and,
since v0.44, `"$payload"`: `needs: { own: "." }` receives `{ own: payload }`), and for a map's branch each element under
`over` — a `"$payload"` key there composed from the payload, not the element, and a `"$item"` key (v0.45) from the element.
**Neither `givenVerdict` nor `tryTransform(…, { input })` composes a `"$payload"` or a `"$item"` key** (P38 (j)): the given
value IS what the node receives, already composed, and composing it is the caller's, as for every `needs` key.
`boundaryTargets(flow, payload)` lists the targets and the value reaching each; a fan-out, map or gate ENTRY is no
task, and `givenVerdict` on it is `[]`, so it is called on the targets. *Check, then start* — on `transform-passes`;
an `unchecked` verdict (no `inputSchema`, or a language, type or worker the registry lacks) checked nothing. **What a given
verdict is not**: a statement about the producer, the arcs or the flow — it says what this expression does
to this value, and a value that passes is reported as *the sample passed — the given input*, never *fits*.
**BREAKING in 0.8.0** (P37 decision 10): `SampleSource` gains `'given'`, `WiringShape` and `WIRING_SHAPES`
gain `given`, and `WiringVerdict.producer` is optional — absent on a `given` verdict and only there.
**And NEW public surface in 0.8.0**, added rather than changed: `tryTransform`'s fifth parameter is
`TryTransformOptions` (`WiringOptions` and `input`), and **`givenVerdict(registry, flow, node, input,
options?)`** is a root export — `tryTransform` on the node as the flow DECLARES it, which `tryTransform`
calls on the copy carrying the candidate, so the two have ONE contract: `undefined` is no input there
too, and the arcs answer. *(W166 exported it from `src/definition/wiring.ts` for `tryTransform`'s one call,
on `boundaryTargets`' precedent, and the package root re-exports every name of that module; its
conformity reader found it public with nothing saying so. Stating it is the road taken: keeping it off
the root needs `index.ts`, which W166 does not own.)*

## 4. Fan-out, join, and the region between them

```json
{ "id": "split",   "kind": "fanout", "branches": ["scoreA", "scoreB"] },
{ "id": "collect", "kind": "join",   "of": "split", "edges": [ { "to": "publish" } ] }
```

**The pairing is declared once, on the join.** A `fanout` does not name its join; the join names its
fanout. One direction cannot disagree with itself.

**Since v0.8 a region is opened by a `fanout` OR a `map`, and everything in this section is written
about both.** Where a rule below says *"a fanout `F`"* it means whichever kind opened the region;
the four sets, `innermost(n)`, `FD-V13`, `FD-V20` and `FD-V22` never mention branch **count** and so
needed no change. **The two places that do mention it are `FD-V9`, which stays a rule about `fanout`
alone, and `FD-V19`, which has no instance inside a map region** — see *"What a map changes, and
what it does not"* below.

> **"Edge" means two things in this document and the difference matters in section 5.** An *edge* is
> an entry in a node's `edges` array. A `fanout` has no `edges` (`FD-V9`) and its arcs to its branch
> entries are `branches[]`; **a `map` has none either (`FD-V25`) and its one arc is `branch`** — so
> there are **three** arc shapes and only one of them is an edge object. Where a rule says *"has an
> edge to X"* it means any of the three — any arc in the graph, as `reaches` follows them — and where
> it says *"an edge object"* it means only the first.
>
> **v0.8 added the third and this note is where it is stated.** The `reaches(X)` row below enumerates
> arc shapes exhaustively, so a validator written from it before this correction reported three
> `FD-V11` findings against `map-fanout.flow.json` — a **valid** example. That is section 4's own
> twice-earned warning reached from the other direction: not a refusal written against the wrong set,
> but the set itself no longer computing. `src/definition/regions.ts`'s `succ` had the third arc from
> the day the kind shipped; this table did not.

### The four sets, stated so a validator can compute them

For a region opener `F` — a `fanout` or a `map` — with join `J` and branch entries `b₁ … bₙ`
(**a `map` has exactly one, its `branch`**):

| | |
|---|---|
| **`reaches(X)`** | nodes reachable from `X` by following `edges[].to`, for a `fanout` its `branches[]`, and **for a `map` its `branch`** — three arc shapes, and the list is exhaustive. **Irreflexive** — `X ∈ reaches(X)` only if a path returns to `X`, and `FD-V10` forbids cycles, so it never does |
| **`branchOf(F, bᵢ)`** | `{bᵢ}` together with everything reachable from `bᵢ` with **every path cut at `J`** — traversal stops on arrival at `J`, and `J` is not a member |
| **`region(F)`** | the union of `branchOf(F, bᵢ)` over every branch entry. **`J` is not a member** |
| **`after(F)`** | `reaches(J)`. `J` is not a member of that either |

> **Three properties are stated because they are not free, and getting any of them wrong rejects the
> valid corpus.** `J` is in neither `region(F)` nor `after(F)`; both relations are irreflexive; and
> **`branchOf` is cut at `J` while `reaches` is not**. A breadth-first search that stops at `J` still
> usually *marks* `J` visited, and stock reachability usually includes its source.
>
> **This warning has been earned twice.** At v0.1 `FD-V13` was written against an uncut, reflexive
> reading and rejected two of the valid examples. At v0.2 `FD-V19` was written against `reaches`
> instead of `branchOf` — so every fan-out whose branches both lead to the join had "overlapping
> reach", and it rejected **three** valid examples including P1's own case. Same defect, new id, one
> version apart. If a fourth region rule is ever added, check it against
> `spec/examples/valid/` before writing it down.

### Which region a node is in, when it is in two — v0.7

**Before nesting, this question had a trivial answer and a comment in `src/driver/driver.ts` said
so**: a non-`end` node was in at most one region, because `FD-V19` and `FD-V22` keep a node out of
two branches of the same region and `FD-V15` kept regions from containing one another. **Retiring
`FD-V15` makes that false for non-`end` nodes**, and a lookup that answered it by taking the first
match was answering it by **node-declaration order**.

For a node `n`, let `containing(n) = { F : n ∈ region(F) }`.

| | |
|---|---|
| **`F` is inside `G`** | `F ≠ G` and `F ∈ region(G)`. The fanout node itself is the witness, and `region` is already transitive, so no new data is needed to compute it |
| **`innermost(n)`** | the `F ∈ containing(n)` that is inside every other member of `containing(n)`. **Undefined when there is no such `F`** — which is `containing(n)` being empty, and one case more |

**`FD-V22` is what makes `innermost(n)` unique, and it does so only for a NON-`end` node.** Any path
entering `region(G)` must enter through `G` itself, so a node in two regions has one of their
fanouts inside the other, and the two candidates are nested rather than merely overlapping.

**`end` nodes are exempt from `FD-V22`** (section 2), and the exemption is load-bearing here rather
than incidental: **one `end` node may be shared by two SIBLING regions**, nested in neither. Two
sequential fan-outs sharing one `end` is such a flow, it is [Q45](../doc/questions/q45.md)'s shape,
and this document accepts it. **`innermost(n)` is undefined for that node, and `branchIndexOf`
returns `null`.**

> **This paragraph said `FD-V19` and `FD-V22` made it unique, full stop, and that was false.** W20's
> conformity reader measured what the first draft cost: a resolver that fell through to the first
> candidate answered `f1` or `f2` for the same graph depending on which `fanout` was declared first —
> **the exact defect this subsection was written to remove, surviving in the one case the rule
> claimed was unreachable.** `FD-V19` is what makes a node's *branch index* unique within a region,
> not its region; `FD-V22` is what makes the region unique, and only where it applies.
>
> **Saying *undefined* is the only order-independent answer.** Section 1 of
> [spec/task-id.md](task-id.md) makes `branchPath` *a property of the node*; a node in two unrelated
> regions has no such property, and picking one of them invents it. **No driver asks**: the `end`
> arm attributes a branch by the region it was OPENED in rather than by membership, which is why
> nothing observable depends on this today.

**Three properties, stated because a resolver that gets any of them wrong passes the depth-1 corpus
unchanged.**

1. **It does not depend on the order nodes are declared in — for every node, including the ones
   with no answer.** This is the whole point of the rule, and *"there isn't one"* is an answer that
   satisfies it where *"the first one"* does not.
   The same graph written with the inner `fanout` first must give the same answer — measured before
   the rule was written, the old lookup gave `outer`/branch 1 in one order and `inner`/branch 0 in
   the other, **for the same flow**.
2. **`innermost(n)` for a node in exactly one region is that region.** The depth-1 corpus must be
   unchanged, and this is the clause that says so.
3. **A join node is in no region of its own fanout** (`J ∉ region(F)`, above), so an inner join is in
   the *outer* region and nothing else — which is what makes an inner join's own `branchPath` an
   outer one.

**`branchIndexOf` answers the same question one level down** — *which branch of which region* — and
carries the same obligation. At depth 2 the honest answer to *"which branch is this node in"* is a
**path** rather than an index, and that is [spec/task-id.md](task-id.md)'s vocabulary rather than
this document's; the rule here is only that the index it returns is the **innermost** region's and
not whichever region was declared first.

### What a map changes, and what it does not — v0.8

[ADR 0036](../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md).
**Everything above is about a region. A map is a different fan-out over the same region**, so this
subsection is short by construction, and every claim in it was measured before it was written.

**What does not change.**

1. **The four sets.** `reaches`, `branchOf`, `region(F)` and `after(F)` are computed for a map's one
   branch exactly as for a fanout's N. `region(M)` is `branchOf(M, branch)`; `J` is a member of
   neither it nor `after(M)`.
2. **`FD-V12`, `FD-V13`, `FD-V20` and `FD-V22`.** None mentions a branch count. With `FD-V9`'s floor
   set aside, a one-subgraph region produces **no finding from any of them** — measured, and it is
   the same measurement v0.7 took before retiring `FD-V15`.
3. **`innermost(n)`, and its three stated properties.** A map region is a region; a node inside a
   map nested in a `fanout` resolves to the map, and the walk outward is unchanged. Measured on
   `map-in-fanout.flow.json`: `perItem` → `"1"`, and `merge` → `"1.0"` **when an item index of 0 is
   supplied for `perItem`**. *(This cell read *"`inner` → `1`, the mapped node → `1.0`"* — wrong
   twice. There is no node called `inner` in that fixture, which is `nested-fanout.flow.json`'s
   inner **fanout**; and `branchPathOf(regions, 'merge')` **throws** with no index, so the value
   quoted was the behaviour before `ID-R6` existed, presented in the present tense under a heading
   reading *"What does not change"*. W32's conformity reader.)*
4. **`FD-V9`.** It is a rule about `fanout` and it keeps every clause and its present scope. Its
   arity floor is a statement about the **document**, and a map's arity is not in the document, so
   there is nothing for the floor to bind. **A map of one item and a map of zero items are ordinary
   runs of a valid definition**, not defects a validator could have seen.
5. **`FD-V19`, and therefore [Q27](../doc/questions/q27.md).** Its condition is *a non-`end` node in
   the `branchOf` sets of **two distinct** branch entries of the same fanout*. A map declares one
   branch, so the condition has **no instance** — measured as `0` pairs iterated, against
   `n(n-1)/2` for a fanout of `n`. **A map does not lift the refusal, weaken it, or reach it.**

**What changes, and it is one sentence.**

> **Inside a `fanout` region a branch index is a property of the NODE. Inside a `map` region it is a
> property of the DISPATCH.**

`branchIndexOf` and `branchPathOf` derive from the graph and take no run-time input, so for a node
inside a map region they have no answer — and the answer they would otherwise give is the same one
for every dispatch. **Measured before the rule was written**: for a map region over `x → y`,
`branchPathOf` returns `"0"` for `x` **and** `"0"` for `y`, so three dispatches mint one distinct id
of three and the second is a `DuplicateTaskId` at `ID-R1`.

**So the derivation refuses rather than guessing**, which is `ID-R6` in
[spec/task-id.md](task-id.md) section 3. `branchPathOf` takes an optional item index **per region**;
asked for a path that crosses a map region with none supplied for it, it refuses and names the node
and the map. A refusal that names the missing index is the same failure as `ID-R1`'s duplicate with
the right diagnosis instead of the symptom.

**How many dispatches a map opens, in what order, and what each receives are NOT this document's**
— they are [W33](../doc/work-items/w33-a-map-at-run-time-arity.md)'s and
[W34](../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md)'s. This section fixes
only that the index exists, that it is not derivable from the graph, and that asking for it without
supplying it is refused. **Both are answered now and neither answer is here**: the first three are
`JP-R5` and section 4's owner table in [spec/join-policy.md](join-policy.md), and *what each receives*
is **`JP-R11`** there — [ADR 0037](../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md).
Recorded here rather than left pointing at two unstarted items, which is
`doc/workflow.md` section 1 rule 5's *any copy, including your own*.

`region(F)` is computed at instantiation and is what a join policy is given
([spec/join-policy.md](join-policy.md) section 1). Region membership must be *computable*, which is
why the pairing is declared rather than inferred: without it there is no statement of what a branch
was supposed to arrive at, and **"routed away from the join" is not even well defined.**

**The definition declares structure and never a count.** There is no `waitFor: 2` anywhere in this
document. A count is derivable from `branches.length`, and one policy derives it — but writing it
into the format would make arrival-counting the format's answer to
[Q4](../doc/questions/q4.md) before W4 has run.

**A `map`'s `over` is not a count and does not weaken that** — v0.8. It is a **key name**, so what
the document declares is *where the arity will be found*, not what it is; nothing in the definition
says how many items there are, and nothing can, which is the whole of why a map's arity is a
run-time fact. A policy that wanted `N` for a map region would have to be told by the run rather
than read it here, and whether any policy should be is
[W33](../doc/work-items/w33-a-map-at-run-time-arity.md)'s.

### What the region rules are each protecting

Three refusals, three different failures. Stated together because each was written in isolation and
two of them were wrong.

| rule | forbids | because |
|---|---|---|
| **FD-V13** | a non-`end` node in **both** `region(F)` and `after(F)` | a branch re-entering the path the join feeds — it would run downstream work before the join fired |
| **FD-V19** | a non-`end` node in **two branches'** `branchOf` sets | a shared node's branch index is a property of the traversal rather than of the node, so `branchPath` stops being derivable ([spec/task-id.md](task-id.md) section 1) |
| **FD-V22** | an edge **into** a non-`end` node of `region(F)` from outside it | a token arriving in a branch that was never opened, and later at a join that never counted it — which `JP-R5` gives no policy a way to account for |

**`FD-V22` is what makes `ID-R1`'s soundness argument true.** Without it a node in a region can be
entered from outside, and on that route it has no enclosing branch index at all — so the
`(nodeId, branchPath, attempt)` triple that `spec/task-id.md` section 3 claims is unique per run is
not even well defined.

### Can this format express the branch-routed-away case at all

Yes, and it is the constraint that shaped this section.
`spec/examples/valid/p1-routed-away.flow.json` is the flow: `split` fans out to `scoreA` and
`scoreB`; `scoreB` carries a decision whose first edge goes to an `end` node instead of the join;
`collect` waits.

**Three things had to be true for it to be authorable, and each is a design choice rather than an
accident:**

1. The fan-out/join pairing is declared, so the branch has a join it is *failing to reach*.
2. A branch may reach an `end` node. Nothing forbids it — see `FD-V14` below.
3. `end` is a node kind. If a terminal path were expressed as *a node with no outgoing edge*, then
   "the branch legitimately ended here" and "the author forgot an edge" would be the same document,
   and `FD-V7` could not tell them apart.

### FD-V14 — the rule that is deliberately absent

> **There is no rule requiring that every path from a fan-out branch reaches the join.**

That is the first well-formedness rule anyone writes for a fan-out region, it reads as obviously
correct, and **it makes P1's case invalid input.** In `p1-routed-away.flow.json`, `scoreB` has a path
to `collect` — its default edge — *and* a path to `abandoned`. So the rule that would forbid the case
is the **all-paths** form, not the *can-reach* form:

| candidate rule | verdict on `p1-routed-away` | |
|---|---|---|
| every path from a branch entry reaches `J` | **rejects it** | this is `FD-V14`, and it is absent |
| a branch entry *can* reach `J` | accepts it | true of `scoreB`, so this form forbids nothing P1 needs — and stating `FD-V14` this way is a wording error that would let a future reader re-add the all-paths rule believing it had been considered |

The weaker property that *is* true — every path from a branch entry terminates at an `end`, whether
or not it passes through the join — is **derived, not asserted**: `FD-V10` forbids cycles, `FD-V7`
and `FD-V8` mean `end` is the only kind of node without an outgoing edge, `FD-V9` guarantees a
`fanout` has successors, and — **v0.8** — `FD-V23`, `FD-V2` and `FD-V25` together guarantee a `map`
has exactly one, since `branch` is required, must name a node that exists, and must name a `task` or (v0.42) an `ask`, each of which has edges (`FD-V7`).
Nothing else is possible, so there is no rule to state and no example that could violate one.
*(The derivation named four rules and covered four kinds until v0.8 added a fifth. The conclusion was
never wrong; the argument had stopped covering the document.)*

## 5. Validation refusals

Checked at instantiation, in full, before any task is queued (ADR 0002 rule 3). Every rule has one
hand-written case in `spec/examples/invalid/`, named by its rule id; `scripts/check-spec.mjs` check
C4 fails if one is missing.

| id | The definition is rejected when |
|---|---|
| `FD-V1` | two nodes share an `id` |
| `FD-V2` | an edge's `to`, a `join`'s `of`, a `fanout`'s `branches` entry, or a `map`'s `branch` names a node that does not exist |
| `FD-V3` | `entry` names a node that does not exist, or names a `join` or an `end` |
| `FD-V4` | an edge's `when` **names** a predicate absent from the registry — the `{ predicate }` shape alone, asked only once `FD-V42` has passed, on `FD-V36`'s precedent that an unknown language has no compiler to ask. **The id and the sentence are P1's and only the SPELLING moved at v0.27**: a name is written `{ "predicate": "x" }`, and a COMPARISON or a GROUP names nothing, so this rule has nothing to ask of either |
| `FD-V5` | **Nothing. Retired at v0.19 with `workerType`, and the id is now deliberately absent** — a held id with no rule behind it, so a gap in the sequence is not read as a rule someone lost ([ADR 0054](../doc/decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md), [W65](../doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md)). It refused *a `task`'s `workerType` that is not a key in the scheduler's `workerPools`*; since v0.19 a task names a node TYPE, whose default pool exists by construction, and the question this rule asked is `FD-V32`'s |
| `FD-V6` | a `join`'s `of` does not name a `fanout` **or a `map`**, or a `fanout` **or a `map`** has zero or more than one `join` naming it |
| `FD-V7` | a `task` **or an `ask`** (v0.42) node has no `edges`; or no edge of such a node is eligible for `done`; or, for some terminal state any of its edges opts into, the eligible edges for that state contain no edge lacking `when`, contain more than one, or the one lacking `when` is not last among them. **A `join` node** is rejected unless it has exactly one edge, carrying neither `when` nor `on`. *(An ask routes as a task's settlement does — P35 (h) — so its edges are held to the same clauses.)* |
| `FD-V8` | an `end` node has `edges`, or its `outcome` is absent or empty |
| `FD-V9` | a `fanout` has fewer than two `branches`, has a repeated branch entry, has `edges`, or names a branch entry whose kind is not `task` **or `ask`** (v0.42 — an ask stands wherever a task may) |
| `FD-V10` | the graph contains a cycle |
| `FD-V11` | a node is not reachable from `entry` |
| `FD-V12` | a `fanout`'s branch entry, **or a `map`'s `branch`**, is its own `join` |
| `FD-V13` | a node whose kind is not `end` is in **both** `region(F)` and `after(F)` — a branch re-entering the path the join feeds |
| `FD-V14` | **deliberately absent.** The id is held so the gap is not read as a lost rule — see section 4 |
| `FD-V15` | **Nothing. Retired at v0.7, and the id is now deliberately absent** — a held id with no rule behind it, so a gap in the sequence is not read as a rule someone lost. It refused a `fanout` inside another fanout's region; nested fan-out is expressible since [W20](../doc/work-items/w20-what-a-nested-region-is.md), and the id is **retired rather than reused**. Whether a *policy* can serve a nested region is a different question with a different home — `spec/join-policy.md`, because `validateDefinition` is not given the policy |
| `FD-V16` | `flowId` or any node `id` does not match `^[A-Za-z0-9_-]{1,64}$` — the charset is [spec/task-id.md](task-id.md)'s, and this is where it is enforced |
| `FD-V17` | a node object, **an edge object**, or the document carries a key its kind does not declare — **except the six keys `FD-V47` owns on an `ask`** (v0.42), which are that rule's and not reported here as well |
| `FD-V18` | an edge's `on` is present and is not a non-empty array of distinct values drawn from `"done"` and `"failed"`. **`"user_action"` is refused** — it suspends rather than routes (ADR 0004 rule 3, [Q30](../doc/questions/q30.md)) |
| `FD-V19` | a node whose kind is not `end` belongs to `branchOf(F, bᵢ)` for **two distinct** branch entries of the same `fanout`. Convergent branches make `branchPath` a property of the traversal rather than of the node, and P1 refuses them ([Q27](../doc/questions/q27.md)) |
| `FD-V20` | a node outside `region(F)` has an edge to `F`'s join |
| `FD-V21` | a declared key holds a value of the wrong type **or outside its declared range** — `optional` not a boolean, `edges` not an array, `outcome` not a string, `version` not an integer or below 1, **`type`** or **`pool`** not a string (v0.17, v0.19; a `gate`'s `type` too, v0.23), **an `ask`'s `settings` not a plain object** (v0.42 — the library never reads them, so their shape is their whole check), and so on |
| `FD-V22` | a node in `region(F)` whose kind is not `end` has an incoming edge from a node that is neither in `region(F)` nor `F` itself. **The only way into a region is through the node that OPENED it** — its `fanout` or, since v0.8, its `map`. Section 4's *"where a rule says a fanout `F` it means whichever kind opened the region"* is scoped to that section, so this rider says it in the section where the rule lives |
| `FD-V23` | a **required key is absent** — a node without `id` or `kind`; a `task` without `edges` **or without `type`** (v0.19: `type` is required on every task node, and the *neither of two keys* clause v0.17 wrote here went with `workerType`); a `fanout` without `branches`; **a `map` without `over` or `branch`**; a `join` without `of` or `edges`; an `end` without `outcome`; **a `gate` without `type` or `edges`** (v0.23); **an `ask` without `edges`** (v0.42); an edge without `to`; or the document without `flowId`, `version`, `entry` or `nodes`. **`version` is required**, matching section 1 — an omitted version is one that silently means nothing |
| `FD-V24` | a node's `kind` is not one of `task`, `fanout`, **`map`**, `join`, `end`, **`gate`** (v0.23), **`ask`** (v0.42). **`kind: "decision"` is the case this exists for** — section 2 warns the author away from that word, and until v0.4 nothing rejected it |
| `FD-V25` | a `map` has `edges`; its `branch` names a node whose kind is not `task` **or `ask`** (v0.42 — one ask, and one task id, per item); or its `over` is not a string matching `^[A-Za-z0-9_-]{1,64}$`. **The map's own rule, and `FD-V9` is unchanged** — each is about one node kind, because a rule about two kinds is the confusion [ADR 0036](../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md) exists to remove. A map declares ONE branch, so `FD-V9`'s arity floor and repeated-entry clause have nothing to say about it and are not restated here |
| `FD-V26` | a `needs` — **on a node OR on an edge** — is not an object, is an empty one, has a key outside `^[A-Za-z0-9_-]{1,64}$`, or has a value that is not `"."`, `"$payload"` (v0.44), `"$item"` (v0.45), a node id **with an optional `?` suffix**, or a one-element array holding one; **or is on an EDGE and uses `"."`**, which a predicate has no use for because `ctx.outcome` already carries what it would otherwise name (v0.12) — `"$payload"` on an edge is NOT refused, a predicate having no `ctx.payload`. **The `$` clauses, v0.44** ([ADR 0117](../doc/decisions/0117-a-reference-may-name-what-reached-the-run.md), P38 (g)) — the whole `$` prefix is reserved, so a `$` spelling is never read as a node id and each is told its FIX, at both sites: an ARRAY form of a `$` reference, `["$payload"]` — *there is one: write `"$payload"`*; a `?` SUFFIX on one, `"$payload?"` — *it is always there: write it without `?`*; and ANY OTHER `$` spelling — naming the two references the prefix has. *(v0.44 refused `"$item"` itself here, at both sites, until W191 composed it; v0.45 RETIRES that clause — where the reader is inside a map instance `"$item"` is legal, and where it is not, that is `FD-V49`'s.)* Cases: `spec/examples/invalid/FD-V26--payload-as-an-array.flow.json`, `FD-V26--payload-with-a-suffix.flow.json` and `FD-V26--an-unreserved-dollar-token.flow.json`. **Section 3's grammar and nothing else** — where the reference POINTS is `FD-V27`'s and `FD-V28`'s. *"Only a `task`, a `map` or (v0.42) an `ask` may carry `needs`"* is **deliberately not a clause here**: `needs` is absent from the other four kinds' key lists, so `FD-V17` already refuses it and names the kind, and a second rule saying the same thing is one `FD-V17` could never disagree with |
| `FD-V27` | a `needs` reference names a node that does not exist, names a node whose kind is not `task` **or `ask`** (**only a `task` and an `ask` produce an output** — section 2; an ask's is the person's answer, v0.42), or names a node **this node is not reachable from**. The last is what makes a reference a statement about the graph rather than a hope about the run: a reference pointing sideways or backwards names a node that may not have run, and without this the only thing to say so is `FD-R3`, at run time, on the one workload that takes that branch — which is ADR 0002 rule 3's own argument for validating at instantiation. **This rule is UNCHANGED at v0.13 and `FD-V29` is what finished the sentence**: reachability says *it is not upstream of you at all*, and *upstream and yet not certain* is a second question with a different fix ([Q187](../doc/questions/q187.md)). Both apply to a conditional reference too — a `?` excuses a target that may not have run, never a target that does not exist, is not a `task`, or is not upstream |
| `FD-V28` | a `needs` reference's **form does not match the graph** — `"n"` where this node is outside a **`map`** region containing `n` (so `n` produces one output per ITEM), or `["n"]` where it is not (so `n` produces exactly one). **A `fanout` region is not this case**: `FD-V19` gives every node in one exactly one output, so the bare form is legal from outside it, and the rule's first version refused a valid document by asking *a region* where it meant *a map region*. **Its own id rather than a clause of `FD-V27`** because an author fixes the two differently: `FD-V27` is *that node cannot have produced anything for you* and this is *it produced a different NUMBER of things than you asked for*, and the message names the form to write instead. **The `?` suffix does not change which form is legal** and is stripped before this rule is evaluated (v0.13) — `FD-V28` asks *how many* and a conditional reference asks the same question |
| `FD-V29` | a `needs` reference in an **unconditional** form names a node that a run can reach the declaring node **without having run** — v0.13, [ADR 0042](../doc/decisions/0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md). **It is not dominance**, and that is the whole of the rule: the graph has two kinds of branching and dominance treats them the same — a `task`'s `edges` — **and an `ask`'s** (v0.42) — are **disjunctive**, exactly one being taken (section 3's routing rule 2), while a `fanout`'s `branches` and a `map`'s `branch` are **conjunctive**, all being entered before any dispatch (`JP-R5`). So a node is *certain* for a reader when it is on every path from `entry` to it **with a region's branch entries counted as certain for that region's join**, and a branch entry never dominates its own join. **Measured: over both corpora as they stood when this rule was decided (26 flows), of the 127 references `FD-V26`/`FD-V27`/`FD-V28` admit, dominance refuses 30 and this rule refuses 8** — a strict subset, over 7 distinct shapes, and **0 of the 6 references the corpora actually write**. **Its own id rather than a clause of `FD-V27`, on `FD-V28`'s own stated precedent**: `FD-V27` is *that node cannot have produced anything for you* and the fix is to re-point the reference; this is *it MIGHT not have* and the fix is to write `?`. **Its LIMIT is written into it, and it is the POLICY rather than any particular road**: *the join fired, therefore every branch entry settled* is a property of the policy, and `validateDefinition` is not given one (`FD-V15`'s note, [Q97](../doc/questions/q97.md)) — so a policy that fires a join while a branch entry has **not settled**, for any reason at all, falsifies the credit. *(This clause said *"parked at `user_action`"*, and W45's conformity reader measured that parking is inessential: a policy satisfied on the first arrival, with the other branch entry simply **never settling**, dispatches the reader and `FD-R3` fires with no `user_action` anywhere. **The rule text was right and every enumeration of its limit named one road.**)* So this rule removes cases from `FD-R3`'s reach and does not replace it. Case: `spec/examples/invalid/FD-V29--reference-across-a-decision.flow.json` |
| `FD-V30` | a `task`'s `retryPolicy` is not **exactly** the scheduler's shape — v0.16, section 2: not an object; missing `maxRetries` or `backoffMs`; **carrying any key beside those two**; `maxRetries` not an integer >= 0; or `backoffMs` not a finite number >= 0. **Every clause is a measurement of what the scheduler does with the shape in silence** — `{}` means *no retries*, a string `maxRetries` retries by coercion, an extra key is dropped — and a definition may not mean something quietly. **Its own id rather than a clause of `FD-V21`, on `FD-V26`'s precedent**: the rule owns the key's whole shape because the fix is one row whichever clause fired. Case: `spec/examples/invalid/FD-V30--retry-policy-max-retries-is-a-string.flow.json`, the coercion case, because it is the one the scheduler gets *wrong* rather than merely quiet about |
| `FD-V31` | a `task`'s `workerGroups` is not a **non-empty array of distinct strings every one of which the registry's `groups` set declares** — v0.16, section 2. **The registry set is EMPTY when absent**, so a document declaring any group is refused against a registry that says nothing about groups; the alternative reading was priced and refused. The rule exists because the scheduler runs a task whose group id it does not know **as if the group were not there** — no throw, no `resource.blocked`, `done` — so the name is caught nowhere downstream (ADR 0002 rule 3, `FD-V5`'s shape). An empty array is refused for `FD-V26`'s empty-`needs` reason, and a repeat because the scheduler's own source unions a task's groups with its pool's through a `Set`, so a repeat is dropped in silence — **read from the published build, not measured**, which is the one clause here whose provenance is the source rather than a run (W58's conformity reader). Case: `spec/examples/invalid/FD-V31--worker-group-not-in-registry.flow.json`, against `spec/examples/registry.json`, which deliberately omits the id it names |
| `FD-V32` | a `task`'s `type` names **no registered node type**, or names one **whose `worker` the registry's `workers` does not declare** — v0.17, section 2; the second clause v0.19's. **The second clause EXEMPTS a type that names NO worker** — a built-in that only transforms (v0.28, ADR 0075 rule 2), for which *a type with no worker cannot run* is false: what such a node must declare instead is `FD-V46`'s. The exemption is by the PROPERTY and not by the name, and only a built-in may have it — a consumer's worker-less type is refused where the registry is built. **The registry's `nodeTypes` is the BUILT-INS ALONE when absent** and its `workers` is EMPTY when absent — the two readings differ since v0.28, because a flow may name `Transform` against a registry that declares no `nodeTypes` at all. *(This row said `nodeTypes` was EMPTY when absent too, and said it in the present tense in the one row the v0.28 paragraph names as having changed — while carrying neither the exemption. W109's conformity reader, 1: a withdrawn reading surviving where somebody was looking.)* **Two clauses under one id** because both mean *this node cannot run* and the fix is the registry either way; the second is reported only when the first passed. *(v0.17's second clause — a registered type with no POOL of its name — has no instance since v0.19: every type has a default instance, built from its own config, and a registry whose type names a missing worker is refused at construction by name too, `WorkerMissing`.)* Case: `spec/examples/invalid/FD-V32--type-not-in-registry.flow.json`, against `spec/examples/registry.json`, which deliberately omits the name |
| `FD-V33` | a `task`'s `settings` is **not a plain object**, or the type's worker **`settingsSchema` refuses the effective settings** — the type's `settings` defaults merged UNDER the node's, `{}` when neither declares anything — by any finding of the built-in subset (ADR 0053), the detail naming the path and what failed there (`required`, `not declared`, `expected number`, `below minimum 0`); **a schema outside the subset is reported here and never applied**. v0.17, section 2; the schema in place of v0.17's validator function since v0.19. **Its own id rather than a clause of `FD-V21`, on `FD-V30`'s precedent**: the rule owns the key's whole shape because an author fixes both clauses in the same place. Case: `spec/examples/invalid/FD-V33--settings-the-type-refuses.flow.json`, against the corpus worker `scorer`'s `settingsSchema` in `spec/examples/registry.json` — `factor: "ten"` where the schema says a number |
| `FD-V34` | **Nothing. Retired at v0.19 with `workerType`, and the id is now deliberately absent** — a held id with no rule behind it ([ADR 0054](../doc/decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md), [W65](../doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md)). It refused the typed and untyped halves *mixed* on one `task` — `type` beside `workerType`, a `workerType` naming a type, `settings` on a node with no `type` — and with one road there are no halves to mix: `workerType` is `FD-V17`'s undeclared key, and a node with no `type` is `FD-V23` |
| `FD-V35` | a typed `task`'s `transform.lang` names **no registered language** — v0.18, section 2's `transform` subsection. The registry's `languages` set is **EMPTY when absent**, on `FD-V31`'s reading: a definition declaring any transform against a registry that says nothing about languages is refused, because the alternative — absent means *unchecked* — would carry the name to a wrapper that meets it with nothing to evaluate it and fails every task of the node. Reported alone; `FD-V36` is not asked of a language that does not exist. Case: `spec/examples/invalid/FD-V35--transform-language-not-in-registry.flow.json`, against `spec/examples/registry.json`, which deliberately omits `jsonata` |
| `FD-V36` | a typed `task`'s `transform.expr` is **refused by the named language's `compile`** — v0.18, section 2. The registry half of an adapter is a synchronous compiler that THROWS on an expression it refuses (P17 fact 2: JSONata throws `S0203` at position 12 for `$sum(*.score`), so the refusal is decided at `new Driver` rather than on the one workload that reaches the node — ADR 0002 rule 3's whole argument, and the reason the adapter's compile is required to be synchronous. The detail is the language's own message, with its `position` and `code` where it sets them. A `compile` that is not a function is the REGISTRY's mistake and is refused at construction naming the LANGUAGE, as a non-function settings validator is under `FD-V33`. **What this cannot see**: `$eval` re-compiles at run time, so a syntax error inside it lands as a task failure ([Q265](../doc/questions/q265.md)). Case: `spec/examples/invalid/FD-V36--transform-the-language-refuses.flow.json`, against the fake language `path`, whose grammar refuses `$sum(*.score` |
| `FD-V37` | a `transform` is **not exactly `{ lang, expr }`** — not an object, missing either key, either not a string, or carrying any other key. v0.18, section 2. A key beside the two would be read by nothing (`FD-V30`'s reason). *(v0.18's other clause — a transform on a `task` with no `type` — has no instance since v0.19: every task node is typed, the wrapper fronts every pool, and a node with no `type` is `FD-V23` with the transform's own clauses still applied beside it.)* Case: `spec/examples/invalid/FD-V37--transform-not-lang-and-expr.flow.json` |
| `FD-V38` | a `task`'s `pool` names **no registered pool instance**, or names an instance **of another type than the node's** — v0.19, section 2, [ADR 0054](../doc/decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md). The registry's `pools` is **EMPTY when absent**; the type's own name is the default instance and is accepted; a non-string `pool` is `FD-V21`; and the rule is asked only once the type is registered (`FD-V32` first). **Its own id rather than a clause of `FD-V32`** because the fix is different: `FD-V32` sends an author to the registry's types, this to its instances or to the node. Case: `spec/examples/invalid/FD-V38--pool-not-an-instance-of-the-type.flow.json`, against `spec/examples/registry.json`, whose `scorer-fast` is an instance of `Scorer` named by a `ScoreWorker` node |
| `FD-V39` | a `gate`'s `type` names **no registered gate type** — none of the built-ins and none the registry's `gateTypes` adds — or names one that **is not a `GateType`**, or one **registered twice** (a built-in and the registry's); or, since v0.30, names a DERIVED type whose **`routesFor` throws or returns a malformed route set for this gate's settings**, or whose **`settingsProblem` throws or returns neither a message nor `null`** — the type's defects, which only a gate's settings reveal ([ADR 0092](../doc/decisions/0092-a-gate-types-routes-are-declared-statically-or-derived-from-its-node.md)) — v0.23, section 2's `gate` subsection, [ADR 0066](../doc/decisions/0066-a-gate-is-a-decision-with-memory-that-names-a-registered-type-and-wires-every-route-exactly-once.md). **Two readings of one fix**, on `FD-V32`'s precedent: the name or the registry. A malformed or colliding type is the REGISTRY's mistake and is refused at construction by name (`GateTypeRefused`, `NameCollision`); reached here directly, it is reported on the gate that names it, as `FD-V36` reports a `compile` that is not a function. Case: `spec/examples/invalid/FD-V39--gate-type-not-registered.flow.json` |
| `FD-V40` | a `gate`'s `settings` is **not a plain object**; its **`key` is not a KEY PATH** — dot-separated object keys, each in `FD-V16`'s charset, no index, no wildcard, no expression (P24 stop-and-ask (d)) — checked on every gate that declares `key`, because the library resolves it; or its type's **`settingsSchema` refuses** the settings, `{}` when absent, asked once `FD-V39` passed. v0.23. **Or, since v0.30, its type's `settingsProblem` returns a message**, asked with a copy of the settings once they are a plain object the schema accepts, and the message is reported here (ADR 0092; P32 decision 3); **or, where the type carries `settingsProblem` or `routesFor`, the settings cannot be COPIED** — `structuredClone` refuses them — which is the settings' defect and not the type's. **Its own id rather than a clause of `FD-V33`**, whose subject is a node TYPE's worker: an author fixes this in the gate's own settings, and the key grammar is the library's rather than a schema's — the subset has no `pattern`. **Since v0.31 it is where the built-in `if`'s and `switch`'s settings are refused** (section 2's built-in table, P32 decision 7): `if`'s `{ when }` — its condition held to `FD-V42`-`FD-V45`'s grammar minus the name shape over the ONE root `input`, the message naming the clause it broke (section 3's *The `input` root*) — and `switch`'s `{ key, cases }` — a case name outside `FD-V16`'s charset or `default`, a case value that is neither a scalar nor a non-empty array of scalars, **a value named by two cases**, an EMPTY `cases`, and a value repeated inside one case. Case: `spec/examples/invalid/FD-V40--gate-key-path-with-an-index.flow.json` — `files[0].series`; and `FD-V40--an-if-condition-outside-input.flow.json` — an `if` comparing `outcome.result.confidence` |
| `FD-V41` | **the `route` key and a gate's wiring** — v0.23: a gate's edge **names a route its type does not declare**; a route the type declares has **no edge** or **more than one**, an edge with no `route` counting for the DEFAULT route and never for every route (both asked once `FD-V39` passed — a document alone cannot know a type's routes). **Since v0.30 the routes counted are the GATE's resolved set** — a derived type's are asked of its `routesFor` once `FD-V40` passed on the gate, so each gate is counted against its own, and a derived type's gate whose settings `FD-V40` refused, or whose `settingsProblem` threw, is not counted at all (ADR 0092); a gate's edge carries **`when`, `on` or `needs`**, or a `route` that is not a string; or **an edge of any node that is not a `gate` carries `route`**. **One rule owns the key on every edge**, `FD-V26`'s precedent for `needs`, so `FD-V17`'s key table does not move; and a gate's edge carrying only `to` and `route` is `FD-V7`'s precedent for a join's edge carrying neither `when` nor `on`. **Why every route is wired rather than a drop being an omission**: a route a type grows later would be dropped in silence by every flow that had omitted it (P24 decision 4). Case: `spec/examples/invalid/FD-V41--a-declared-route-with-no-edge.flow.json` — `distinct`'s `duplicate` unwired; and since v0.31 `FD-V41--a-switch-case-with-no-edge.flow.json` — a `switch`'s case `rework`, the forgotten case an edge chain of comparisons cannot catch |
| `FD-V42` | **a `when` is not one of the three SHAPES, or carries a key its shape does not declare** — v0.27, section 3's `when` subsection. Not an object (a bare STRING is this clause, with the object form in the message); an object marking **none** of `predicate` / `path`-or-`op` / `all`-or-`any`; one marking **more than one**; a `predicate` that is not a string; a comparison **missing** `path`, `op` or `value`; or any shape carrying a key beside its own — `FD-V30`'s and `FD-V37`'s reading, because the evaluator reads exactly these and a key beside them would be read by nothing. Case: `spec/examples/invalid/FD-V42--when-is-a-bare-string.flow.json` |
| `FD-V43` | **a comparison's `path` is not a key path, or does not start at a ROOT a decision can see** — v0.27. Not a string, or outside `FD-V16`'s charset as dot-separated segments (no array index, no wildcard, no expression); a **first segment other than `outcome` or `needs`**, which would resolve to nothing in silence and so is a wrong key rather than a question; or a **root alone**, which names a container no comparison can be true of. The resolution is `readKeyPath`'s, the DRIVER's own — measured unchanged at this scope, because `ctx.outcome`, `ctx.outcome.result` and the FROZEN `ctx.needs` are all plain objects. **Since v0.31 the built-in `if` gate holds its condition to this grammar over ONE root, `input`** — `outcome` and `needs` refused there, `input` refused on a task's or a join's edge, and `input` alone refused as any root alone is — and reports a defect as `FD-V40`, the gate's settings, not here (section 3's *The `input` root*, P32 decisions 4 and 7). This rule's own roots do not move. Case: `spec/examples/invalid/FD-V43--predicate-path-has-no-root.flow.json` |
| `FD-V44` | **a comparison's `op` is outside the closed enumeration, or its `value` is one the operator cannot compare** — v0.27. An `op` that is not one of `eq, ne, lt, lte, gt, gte, startsWith`, refused BY NAME with the enumeration in the message (ADR 0053's shape); a `value` that is not a SCALAR; a number operator against a non-number or `startsWith` against a non-string, **because a comparison between kinds is no match and never a coercion**; a `length` that is not exactly `true`; a `length` with a non-number `value` or with `startsWith`; or a `default` that is neither a scalar nor an array of scalars, or that has no length where `length` measures it. Case: `spec/examples/invalid/FD-V44--predicate-op-outside-the-subset.flow.json` |
| `FD-V45` | **a GROUP is not a non-empty array of COMPARISONS** — v0.27. Both `all` and `any`; a group that is not an array or is empty (an empty group is *always true* or *always false* written as a question); a member that is not an object, or that marks none of the shapes; a member that is itself a **group**, because a group is FLAT and nesting is refused rather than evaluated; or a member naming a **registered predicate**, because a group holding a function could be impure and that is the one thing a declared predicate guarantees over a registered one. A member's own `path`, `op` and `value` are `FD-V43`'s and `FD-V44`'s, and its own SHAPE — a missing or undeclared key, or an object marking more than one shape — is `FD-V42`'s, wherever the comparison sits; `FD-V45` owns only what makes it not a comparison at all. Case: `spec/examples/invalid/FD-V45--a-group-inside-a-group.flow.json` |
| `FD-V46` | **a node of a type that only TRANSFORMS declares no `transform`** — v0.28. A node type that names no worker has nothing to run but the transform (`BUILT_IN_NODE_TYPES`, ADR 0075), so such a node would dispatch a real task, pay a clone and a log record, and hand its successor the value it was given — an expensive IDENTITY. The test is the PROPERTY and not the name: any type with no `worker` is one, and only a built-in may be (a consumer's worker-less type is refused where the registry is built, so an omitted `worker` never becomes a transform-only type by accident). **Its own id rather than a clause of `FD-V37`**, on `FD-V28`'s stated precedent that a different fix earns a different id: `FD-V37` refuses a `transform` that is MALFORMED and this refuses one that is MISSING. Reported only once the type is registered — an unregistered type is `FD-V32`'s. The detail names the two cheaper tiers, which is the three-tier rule where an author meets it. Case: `spec/examples/invalid/FD-V46--a-transform-only-node-with-no-transform.flow.json` |
| `FD-V47` | **an `ask` carries a key only a `task` declares** — `type`, `pool`, `optional`, `retryPolicy`, `workerGroups` or `transform` — v0.42, section 2's `ask` subsection, [ADR 0108](../doc/decisions/0108-an-ask-is-a-seventh-node-kind-with-a-task-id-and-no-dispatch.md). **One finding per key, naming it.** Each is read by a task's WORKER or its scheduler task, and an ask has neither: it is never dispatched, so a type, a pool, `optional`, a retry policy and a resource group would be read by nothing, and a `transform` — evaluated in a node type's worker wrapper (`FD-C6`) — would have nothing to evaluate it ([P35](../doc/plans/p35-may-a-node-wait-for-a-person-by-design.md) decision 6: what reaches an ask is composed by its `needs`). **This rule OWNS the six keys on an ask and `FD-V17` is silent for them** — `FD-V41`'s precedent for `route` — so the message says *only a task declares it* rather than *undeclared*. Case: `spec/examples/invalid/FD-V47--an-ask-with-a-type-and-a-transform.flow.json` — a task turned into an ask with its `type` and its `transform` left on |
| `FD-V48` | **an `ask`'s `answerSchema` is not in the built-in schema SUBSET** — not a plain object, a keyword outside the subset (refused, never ignored — ADR 0053, [Q278](../doc/questions/q278.md)), a keyword's value of the wrong shape, or an `examples` entry the schema refutes (ADR 0056) — v0.42, section 2's `ask` subsection. Held by the function that holds a worker's four schemas at construction (`schemaProblem`), and the detail is its message, naming the path inside the schema. **Its own id rather than a clause of `FD-V21`**, on `FD-V33`'s precedent: the fix is in the schema, not in the key's type. What the schema HOLDS — a person's `done` answer, at `resolve()` — is P35's next item's (`FD-R4`). Case: `spec/examples/invalid/FD-V48--an-answer-schema-with-a-pattern.flow.json` — `pattern`, outside the subset |
| `FD-V49` | **a `"$item"` reference — on a node OR on an edge — is read where NO map instance contains the reader** — v0.45, P38 (g), [ADR 0118](../doc/decisions/0118-a-map-instance-keeps-its-item-while-a-node-of-it-may-still-be-entered.md): the INNERMOST map region containing the reader as a MEMBER is what `"$item"` names (section 3's table, P38 (c)), and a node in none — before every map, after a map's join, or a top-level `map` node, whose own `"$item"` would be an ENCLOSING instance's — has no item to name. The reader of an edge's reference is the node the edge hangs on. The message names both fixes: *name the item where a map's branch receives it (`"."`), or move this node inside the map*. **Its own id rather than an `FD-V27` clause**, on `FD-V28`'s precedent — *a different fix earns a different id*: `FD-V27`'s fix is to re-point the reference, this one's is to move the READER. Checked beside `FD-V27`-`FD-V29`, on the same regions, and skipped with them on a cyclic graph. Cases: `spec/examples/invalid/FD-V49--item-outside-a-map-instance.flow.json` (a node after the map's join) and `FD-V49--item-on-an-edge-outside-a-map-instance.flow.json` (an edge of an entry task in a flow with no map) |

**`FD-V19`'s second clause is derived rather than stated.** *"One branch entry is reachable from
another"* needs no rule of its own: `FD-V9` requires every branch entry to be a `task` or (v0.42) an `ask` — neither an `end` — and a branch
entry always belongs to its own `branchOf` set, so a branch entry inside another's set is already a
non-`end` node in two sets.

**`FD-V24` closes the hole the other three left open, and the hole was shaped like a rule.** An
unrecognised `kind` slips past all of them by construction: `FD-V23` fires on an *absent* key and
`kind` is present; `FD-V21` fires on the wrong *type* and `"decision"` is a string; and `FD-V17`
compares a node's keys against **the key set its kind declares**, which for an unknown kind does not
exist — the rule is not evaluable rather than satisfied. So a definition naming a node kind this
document explicitly refuses to have (`kind: "decision"`, section 2) was accepted by every rule, and
the driver would have met it at run time with nothing to cite.

**It was also invisible to the corpus check that verified everything else.** The throwaway validator
W1 used to prove the v0.3 corpus mapped an unknown kind onto `FD-V21` — because its author believed
that is what `FD-V21` meant. The rules and the checker shared one misreading and agreed perfectly,
which is `doc/workflow.md` section 5's opening diagram with the spec in place of the code. The third
conformity pass wrote its validator from the rule text instead, and accepted the document.

**`FD-V17` is not pedantry, and it is why it names edges.** A misspelled `when` becomes an edge with
no condition, which `FD-V7` then reads as a second default — or, if it is the only edge, as a valid
unconditional hop that silently routes every workload down one branch. A misspelled `on` is worse
under ADR 0004: the edge silently reverts to `["done"]` and the failure path the author thought they
wrote does not exist. Unknown keys are how a decision disappears without a diagnostic, and edge
objects are where the keys that matter live.

**An invalid example is named for the rule it exists to exercise, and may violate others as well** —
several of these rules are entangled by construction, and contorting a case to violate exactly one
would make it stop resembling a mistake an author would actually make. A validator MUST reject the
file and MUST report the named rule among its findings.

**`FD-V13`, `FD-V19` and `FD-V22` are restrictions this repo may lift, and `FD-V15` is the one it
has.** `FD-V13` bounds P1's join/failure matrix by keeping a routed-away branch from continuing to
live outside the region ([Q23](../doc/questions/q23.md)); `FD-V19` and `FD-V22` are
[Q27](../doc/questions/q27.md). All were stated as refusals rather than left undefined so that
lifting one is a spec change with a rationale (`spec/README.md` rule 1) rather than a discovery —
**and `FD-V15`'s lift is what that sentence was written for**, four versions before it happened.

**`FD-V19` and `FD-V22` are load-bearing FOR nesting rather than obstacles to it**, which is worth
saying because they sit in the same family and a reader lifting one will reach for the others. They
are what keep an inner region wholly inside **one** outer branch: without `FD-V19` an inner fan-out
could straddle two outer branches and its nodes would have no derivable `branchPath`, and without
`FD-V22` a node inside a nested region could be entered from outside it with no enclosing branch
index at all. **Retiring `FD-V15` narrows the set of liftable rules from four to three and makes the
remaining two harder to lift, not easier.**

## 6. Runtime refusals

Not expressible as an invalid example, so each names the test that must exist. That coverage is the
owning item's gate, **not W1's L0**.

| id | The run terminates when | Test owed by |
|---|---|---|
| `FD-R1` | routing reaches a node, eligible edges exist for the settled terminal state, and none evaluates true. The failure names the run id and the node id and is **reported** rather than thrown out of a listener (`OR-R10`). **Unreachable through a valid definition**, and that is `FD-V7` working rather than a gap — see below. Test: assert against the routing function directly, with a node whose eligible edges are all guarded and a registry whose predicates all return false; **and a companion test that the reachable neighbour is not this rule** — no eligible edge at all is a declared path end (section 3) | W3 |
| `FD-R3` | **an UNCONDITIONAL** `needs` reference names a node and **no output of that node is on this node's branch path**. Reported as an `UnresolvedReference` naming the declaring node, its branch path, the key and the target. **Since v0.13 the decision-routed-around case is `FD-V29`'s and is refused at instantiation**, and what is left is the two things a validator provably cannot see, both measured rather than argued: (a) **a reader whose branch path is comparable with none of the target's**, which needs no policy at all — two `map` regions of different arity, `reference-past-a-map-arity.flow.json`, where `FD-V29` correctly says the target ran and the third instance of the second region can see neither output of the first; and (b) a join **policy** firing before a branch entry has SETTLED — for any reason, parking at `user_action` being one and a branch entry that has simply not settled yet being another — which `validateDefinition` cannot know about because it is not given the policy (`FD-V15`'s note, [Q97](../doc/questions/q97.md)). *(This clause read *"parked at `user_action`"*, as did four other statements of the same limit, and W45's conformity reader measured that parking is inessential: a policy satisfied on the first arrival, with the other branch entry never settling, dispatches the reader and this rule fires with no `user_action` anywhere. `test/driver/needs.test.ts` asserts it under a constructed policy, with a shipped-policy control beside it.)* **A CONDITIONAL reference never reaches this rule** — `FD-C4` is what it does instead. **AND v0.15 REMOVES (a), which leaves (b) as the only road.** [ADR 0044](../doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md) makes a reader in a SIBLING region see **all** of the target's outputs, so *comparable with none of the target's* has no instance there — the case (a) names was the sibling road, and it was `FD-C1`'s defect rather than a fact about what a validator can see. **So this rule now has exactly one road that a shipped policy can reach, and it is the POLICY one** — which is `FD-V29`'s own history one version on: that rule removed the decision case and this removes the arity case, each leaving the backstop narrower. *(The removal landed with the DRIVER, in **W50**: `reference-past-a-map-arity` resolves at every arity pair now, and this rule's remaining road is the policy one — [Q218](../doc/questions/q218.md).)* *(Before v0.13 this row read *"a decision routed around it, or it settled `user_action`"* and said *"no validator rule could have seen this"*. **The first clause was `FD-V29`'s all along and the sentence was the argument against looking**; the second half is (b), and (a) was in neither. W45.)* **`FD-V27` has already checked that this node is reachable FROM the named one** and `FD-V29` that it must have run, which together are everything the graph can say. **Why its own class and not `UnresolvedMapArity`**: that one says *the previous node did not return an array*, which is a WORKER's bug, and this says *the node you named did not run on your path*, which is the FLOW's shape, and the two send a reader to different places. Reported through `OR-R10` from a listener, and reported **and rethrown** from `resolve()`, which is caller-initiated. **Not from `start()`, and that is a property of `FD-V27` rather than of this rule**: `start()` composes only the entry node, and a reference from the entry node names a target the entry node must be reachable from — which with `FD-V11` makes the entry reachable from it, and that is an `FD-V10` cycle. So the `start()` road is refused at instantiation and has no case. *(This row said `start()` and `resolve()`, and the test named for it asserted neither. W41's conformity reader, and it is `FD-R1`'s own *test that cannot be built* one section up.)* Test: `test/driver/needs.test.ts` | **[W41](../doc/work-items/w41-what-a-node-can-reach-and-what-names-it.md)** |
| `FD-R4` | **the run's PAYLOAD fails the `inputSchema` of a task it reaches with no worker in between and that declares no `transform` (v0.40), at `start()`; or a PERSON's `done` resolution fails the parked node's worker `outputSchema` — or, since v0.43, a parked ASK's `answerSchema` — at `resolve()`** — v0.21, [P19](../doc/plans/p19-what-a-schema-buys-an-author.md) decision 5, [W73](../doc/work-items/w73-the-wiring-check-a-verdict-per-edge-and-two-boundaries-validated-once.md). Once per run and once per human action, NEVER per settlement (per-settlement validation of a worker's result is OUT of P19 as a default). **A REJECTED COMMAND and not a terminated run — one of the TWO rows of this table whose heading clause does not hold (`FD-R6` is the other, since v0.35), and it says so**: thrown at the caller as `BoundaryRefused` (naming the boundary, the node, the worker, the task where there is one, and every finding), NOTHING appended, nothing reported through `OR-R10`. At `start` it is thrown before the driver counts itself started, so a corrected payload starts the same driver (`ID-R3` sees nothing, because nothing ran); at `resolve` the task is still suspended and a corrected value resolves it — `RS-R1`'s own reading, *it came from outside and a caller can retry* — and the worker's declared example is a value a person can supply (ADR 0056 rule 3). A boundary that STOPPED the run would turn a typo in a human's value into a dead run, the opposite of what the schemas are for; the maintainer's choice at W73's stop-and-ask 2. **The targets at `start` are the wiring check's own walk** (`boundaryTargets`, one derivation, two callers): the entry task, or every branch task of an entry fan-out recursively over the same value, or a map's branch task once per element of the array under `over` (a non-array is `FD-R2`'s, as before) — each value composed through the node's `needs` as `enter` composes it (at an entry no NODE can be named, `FD-V27`: what an entry names is `"."` and, since v0.44, `"$payload"` — composed here from the CALLER's own value, because the header does not exist yet, P38 (f) — and an entry `map`'s own `needs` is composed the same way before `over` is read; and, since v0.45, on a map's branch task `"$item"`, composed from the walk's own ELEMENT, which IS that instance's item: a walk target inside a map instance is that map's branch entry, the walk ending at the first task. **No branch path is derived for any of the three**, so an entry map's branch task declaring `needs` is held like any other target — *until v0.45 the composition derived one for ANY `needs`, the walk had no item index to give, and `start()` threw a raw `UnresolvedBranchPath` rather than `BoundaryRefused` (W190's S-1, fixed by W191)*). **A target that DECLARES A `transform` is UNCHECKED at `start` (v0.40, [ADR 0101](../doc/decisions/0101-a-transforming-task-is-not-held-at-start.md), [Q633](../doc/questions/q633.md))**, as a worker declaring no `inputSchema` is: the value its worker's `inputSchema` holds is what the node RECEIVES (`FD-C5`), which for a transforming node is the transform's RESULT, made only in the type's worker wrapper (`FD-C6`) — the payload BEFORE it is held to nothing, and the walk goes on to the other targets. *Until v0.40 the payload before the transform was held, so one value drew opposite verdicts from `start()` and from `tryTransform(…, { input })` (P34 fact 10).* **The check before a run is the caller's, on the value each such task RECEIVES**: `boundaryTargets(flow, payload)` lists the targets and the value reaching each — the payload, for a map's branch each element under `over`, and through an entry gate every route's target — and where the task declares `needs` (at an entry `"."` and `"$payload"`, `FD-V27`) that value is composed through it first, `needs: { own: "." }` receiving `{ own: value }`, `needs: { run: "$payload" }` `{ run: payload }` and, on a map's branch task, `needs: { it: "$item" }` `{ it: element }` (v0.45); then `givenVerdict(registry, flow, task, received)` on each target that transforms — never on a region or gate entry, which is no task and returns `[]` (section 3's *A sample the caller GIVES*). Start on `transform-passes`; an `unchecked` verdict checked nothing. At run time a transform that throws is `TransformFailed`, and a result the worker's schema would refuse reaches the worker UNCHECKED, which may complete on it — Q633's `{ label: "y" }` ran to `completed` with the worker receiving `{}`. **The `resolve` boundary is unmoved**: a transform changes what a worker receives, never what it returns, so a parked transforming node's resolution is held to its worker's `outputSchema` as any other's. **An ASK's answer — v0.43, P35 (d), [ADR 0109](../doc/decisions/0109-an-ask-parks-with-nothing-dispatched-and-its-answer-is-its-result.md)** — is held to the ask's own `answerSchema`, the node's contract for what a person may answer, an ask having no worker: the same `BoundaryRefused` (its `nodeId` the ask, its `taskId` the ask's), NOTHING appended, the ask still parked and a corrected answer accepted on the same driver; an ask with no `answerSchema` holds nothing, and a `failed` answer — a decline — is held to nothing either way. A `done` resolution with no `result` is held as `null`, which is what the record stores for it (`RS-R2`). A worker declaring no schema on that side is UNCHECKED (P18 decision 3); `DriverOptions.validateBoundaries: false`, forwarded by `createRuntime`'s `RuntimeOptions`, turns both off. **Measured before the rule was written** (W73's declaration, fact D): 0.47-1.28 µs per check on every corpus payload and resolution, 0.35 ms at the walking worst case (a 1000-item array under a schema that walks items), against ~100 ms per real run at L6. Test: `test/driver/boundary.test.ts` at L2 — a task entry, a fan-out entry naming the refusing branch, a map entry refusing one item, an entry composing `"."`, the resolve boundary with the task still suspended and then resolved on the declared example, both switches, and the runtime forwarding; and since v0.40 a TRANSFORMING entry admitting both of Q633's payloads beside `tryTransform`'s own verdict on each and the untransformed control refusing one, a fan-out entry whose first branch transforms and whose second still refuses, a map entry whose branch transforms, a parked transforming node's resolution still held, and the runtime road — and `examples/l6.ts` on real workers in both runtimes: an entry payload refused with NOTHING dispatched to the scheduler and the row's run then started beside it, and a person's resolution refused and then accepted on the SAME driver; and since v0.45 `test/driver/map-item.test.ts` at L2 — an entry map's branch task composing `"."`, `"$payload"` and `"$item"`, each accepted and each `BoundaryRefused` naming the task, never `UnresolvedBranchPath`; and since v0.43 `test/driver/ask.test.ts` at L2 — an ask's refused answer appending nothing, the ask still parked, the corrected one routing by `when`, beside `validateBoundaries: false` and an ask with no schema. **The same-driver half of the start boundary is L2's alone**: `createRuntime`'s `start` builds a driver and starts it in one call, so a refused driver is a value no caller of the runtime holds (W73's adequacy reader, f1 — [Q307](../doc/questions/q307.md)) | **W73**; v0.43 [W180](../doc/work-items/w180-asking-and-answering-in-a-run.md) |
| `FD-R5` | **a GATE's type returns a route it does not declare** — since v0.30, a route outside the GATE's resolved set, so a derived type returning a route another of its gates declares stops the run here (ADR 0092) — v0.24, P24 decision 8, [ADR 0067](../doc/decisions/0067-a-gate-runs-in-the-driver-its-memory-is-the-drivers-and-its-decision-is-recorded.md), [W93](../doc/work-items/w93-what-a-gate-does-in-a-run.md). The counterpart of `FD-R1`, and like it unreachable at load: `FD-V41` wires every route the type DECLARES, and a route nobody declared has no edge to be wired by — only running `fn` reveals it. Reported as an `UndeclaredRoute` naming the rule, the run, the gate, its type, what was returned and the routes the type declares, through `OR-R10` (reported from a listener; reported AND rethrown from `start()` and `resolve()`, which are caller-initiated), **with nothing recorded for the gate** — no `gated` element, because no route was taken. **A type whose `fn` THROWS is not this rule**: the run stops with the thrown error as it is, a throwing decision predicate's road, measured at W93's declaration step. Test: at ladder L2, a type returning an undeclared string, a number and nothing, each from a gate after a task — halted, one report of kind `UndeclaredRoute` naming the rule, the gate and the type, no `gated` element and nothing past the gate dispatched — and from an ENTRY gate, where `start()` rethrows it; and a type that throws, from both roads, stopping with its own error; and since v0.30 ([W153](../doc/work-items/w153-a-gate-types-routes-may-come-from-its-node.md)) a DERIVED type returning, at one gate, a route its other gate's set holds and this gate's does not | **[W93](../doc/work-items/w93-what-a-gate-does-in-a-run.md)** |
| `FD-R6` | **a task node REACHES a group the built-in `KeyedRateLimitGroup` factory built, and `start` (or `resume`) is given no `createTask`** — v0.35, P37 fact 1 and stop-and-ask (c), [ADR 0097](../doc/decisions/0097-what-start-refuses-that-the-flow-does-not-decide.md). **A node reaches a group** when the group's key is in its `workerGroups`, or in the `groups` of the pool it runs on — its `pool` when it names one, else its type's default instance — as the registry DERIVED that pool: the two sets the scheduler unions to find a task's groups. A pool's `residentGroups` are not read: the scheduler resolves no key for a resident group — and a built-in keyed group held only as one is counted in ONE `""` bucket, measured, so since v0.39 the registry REFUSES it at construction, before any flow is read (`DerivationRefused`, section 3; [Q619](../doc/questions/q619.md) option B). That factory builds the group with no `keyFrom` (section 3's group types), so the scheduler keys each task by its `limitKey` — which nothing in this library sets ([Q248](../doc/questions/q248.md)) — and THROWS in `addTask` for a task with none: measured, from `start` after the run id was spent when the node is the entry, and as a run `stopped` by that throw when it is not. **A REJECTED COMMAND and not a terminated run — `FD-R4`'s exception to this table's heading, taken a second time**: reported by `runtime.check(flow)` as one finding per such node, `at` the node and the detail naming every built-in keyed group it reaches, both working roads — a `createTask` that sets `limitKey`, and a CODE group type (`code.groupTypes`) whose `create` builds a keyed group with a `keyFrom` — and Q248; and thrown by `start` and `resume` as `LimitKeyMissing`, a `RuntimeError` whose `at` is the first such node in the flow's order, before a run id is minted or a driver built and AFTER the definition's own findings, so an `InvalidDefinition` never carries this rule. **`check` reads as `start` given no `createTask`**, so it reports this rule to a caller who will pass one. Given a `createTask`, nothing is refused: a factory that sets no key still meets the scheduler's own throw, and that is the factory's to own. **A group a CODE group type builds is never this rule**, keyed or not. **A `Driver` built by hand is not covered**: the rule reads the runtime's derived pools and which factory built each group, and the driver sees neither. Test: `test/scheduler/runtime.test.ts` at L1 — each of fact 1's three roads refused by `check` and by `start` with no driver built and no run id spent, a named instance whose derivation adds the group, the controls (a `RateLimitGroup`, a keyed group no node reaches, a code group type with a `keyFrom`) and, since v0.39, a resident one REFUSED at `createRuntime`, the `createTask` road, the order against `InvalidDefinition`, `RunIdInUse` and `ID-R2`, `resume`, and the refusal and both `createTask` outcomes on a real scheduler — and `examples/l6.ts` on real workers in both runtimes, the `createTask` road completing on a real keyed group | **[W163](../doc/work-items/w163-what-start-refuses-that-the-flow-does-not-decide.md)** |

### FD-R1's test, corrected

**v0.4 and earlier prescribed a test that cannot be built**: *"a registry whose predicates all
return false against a definition that passed `FD-V7`"*. `FD-V7` guarantees a **bare** last edge for
every state any edge opts into, and a bare edge has no predicate to return false — so no definition
that passed `FD-V7` can reach `FD-R1` through the driver, whatever the registry says.

That is the rule working, not a hole. But an impossible prescribed test is a spec defect, and
`spec/README.md` rule 2 asks for the conflict to be **reported** rather than annotated in code.
W3 hit it, tested the routing function directly, and left the reasoning in a comment; this is that
finding written down where the rule lives.

**The corrected shape has two halves, and the second is the one that was missing:** assert `FD-R1`
against the pure routing function, *and* assert that the reachable neighbour is a different thing.
*No eligible edge at all* is a declared path end (section 3) and *no matching edge among eligible
ones* is `FD-R1`; a test for the first alone reads like coverage of the second.

## 7. Examples

`spec/examples/valid/` — validated by ladder L4, owned by **W3**
([doc/plans/p1](../doc/plans/p1-what-satisfies-a-join.md)): ADR 0002 rule 3 puts validation at
instantiation, and instantiation is a driver action. Hand-written, never generated
(`spec/README.md` rule 5).

| file | shows |
|---|---|
| `linear.flow.json` | sequence only |
| `decision.flow.json` | a decision with its mandatory default |
| `fanout-join.flow.json` | a fan-out where both branches reach the join |
| `p1-routed-away.flow.json` | **P1's case** — a decision inside a branch that leaves for an `end` |
| `failure-edge.flow.json` | `optional: true` with an `on: ["failed"]` edge, outside any region |
| `fanout-failure.flow.json` | **ADR 0004 inside a region** — one optional branch with a failure edge, one non-optional branch that can suspend. The shapes `branch.lost` and `branch.suspended` are defined against |
| `nested-fanout.flow.json` | **[ADR 0030](../doc/decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md)'s shape** — a fan-out inside a fan-out's branch, expressible since `FD-V15` was retired at v0.7. **This row was MISSING from v0.7 until v0.8 added it**: [W20](../doc/work-items/w20-what-a-nested-region-is.md) added the file and nothing obliged it to document it, so this table was stale by one for a whole plan. `test/definition/l4-corpus.test.ts` now compares the directory and this table **both ways**, which is what found it |
| `map-fanout.flow.json` | **a `map`** — v0.8, one branch entry and an arity that is not in the document |
| `map-with-context.flow.json` | **[Q166](../doc/questions/q166.md)'s flow** — *score each item against the run's config*. A map instance that receives its own item **and** the value the map node received, through `needs: {"item": ".", "run": "ingest"}`. v0.11 |
| `map-over-region-output.flow.json` | **[Q165](../doc/questions/q165.md)'s flow** — *score, then fan out over the scores*. A `map` whose `over` names a key `needs: {"scores": ["score"]}` composed from a whole map region's output, **with no `over: "0"` and therefore no coupling to branch numbering**. v0.11 |
| `decision-on-an-earlier-step.flow.json` | **[Q8](../doc/questions/q8.md)'s own flow, carried in that row since P1** — *route to review if an earlier step flagged low confidence*. An **edge** declares `needs: {"earlier": "ingest"}` and its predicate answers on a node it does not sit on, **with the worker's payload unchanged**. v0.12 |
| `map-in-fanout.flow.json` | **a map region nested inside a static one** — the shape that shows the outer `branchPath` prefix is still derived while only the map's own segment is supplied at run time |
| `reference-if-it-ran.flow.json` | **[Q187](../doc/questions/q187.md)'s flow** — *route to review if an earlier step flagged it, and publish either way*. `publish` declares `needs: {"own": ".", "verdict": "review?"}`, so the key is **present on the review road and absent on the other** and both roads complete. Written unconditionally the same document is `FD-V29`, which is the whole of what the suffix is for. v0.13 |
| `reference-past-a-map-arity.flow.json` | **the document that KEPT `FD-R3` reachable with no custom policy, until v0.15** — two **sibling** `map` regions over different keys, and `publish`'s `needs: {"scored": ["score"]}` names a node `FD-V29` correctly calls certain. Every instance of `rank` beyond `split`'s arity HAD a branch path comparable with **none** of `score`'s outputs, which is the half `FD-V29` cannot see: *did it run* and *is it on your path* are two questions. **And within the arity it exposes the other half of the same fact** — the array holds the ONE index-matched output rather than all N, which is the note under section 3's reference table and [Q206](../doc/questions/q206.md), not something this flow introduces. **BOTH halves are what v0.15 removes, and the opening sentence of this cell is what it costs**: [ADR 0044](../doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md) makes `publish` see all N at every arity pair, so **this document no longer keeps `FD-R3` reachable** and what it demonstrates instead is the fix — every instance receives all N at every arity pair, asserted at L2. *(The opening sentence is the record of what it was FOR, and it is what its removal cost: `FD-R3` now has one road and it needs a join policy `validateDefinition` is not given ([Q218](../doc/questions/q218.md)). This cell asserted both halves in the present tense at once, which W49's conformity reader caught, and W50 is where the second became true.)* v0.13 |
| `sibling-fanouts.flow.json` | **the case neither corpus contained, and the one that shows the defect was never about a `map`** — two sequential `fanout` regions, with **both** branches of the second declaring `needs: {"own": ".", "first": "scoreA1"}` against branch 0 of the first — and the two branch entries of the FIRST region declare different worker types. **This document is validated at L4 and never RUN**, so nothing here observes a result; the two roles are here so that its L6 counterpart, `examples/flows/sibling-fanouts.flow.json`, can tell which branch a reader received. **The two are separate documents against separate registries and they DIVERGE at that node** — `ReviewWorker` here, `TallyWorker` there, because the corpus registry has no worker whose result differs from `ScoreWorker`'s and is not a failing role. W51's rule 8 set graded *both branches return the same thing* a SURVIVOR at zero, and W51's conformity reader found this sentence claiming the fix where nothing runs. Under the prefix rule `publishB1` at path `0` resolved and `publishB2` at path `1` **stopped the run** at `FD-R3`, on a document validating with **zero findings** whose target `FD-V29` correctly calls certain — no arity, no `map`, and the branch the author wrote the reference in deciding whether the run completed. **The two branches are a discriminating PAIR and their difference is asserted rather than left to a literal** (`doc/workflow.md` section 5 rule 8's fourth requirement on the set). Built by [W49](../doc/work-items/w49-what-a-reference-across-sibling-regions-means.md), which could not add it — a corpus flow is validated at L4 AND RUN, and until the resolver followed it was a valid document whose run stopped. v0.15 |
| `task-config.flow.json` | **what a node says about its own task, in all three shapes** — v0.16, [W58](../doc/work-items/w58-what-a-node-says-about-its-own-task.md). `retryPolicy` and `workerGroups` on a top-level task (`ingest`), on a task inside a `fanout` branch (`scoreA`, with `scoreB` declaring neither so the two branches differ), and on the **branch task of a `map`** (`rank`), where both are per INSTANCE — the shape the feature was not built for, and `doc/workflow.md` section 5 rule 8 obligation (a)'s v0.16 clause is why it is here rather than only in a unit test. Names both of `registry.json`'s groups, `gpu` and `api`, one node naming both. **Validated at L4 and never RUN**: its `MergeWorker` is the corpus's, and what a real run of a retry looks like is `examples/flows/retry.flow.json` and `group.flow.json` at ladder L6 |
| `typed.flow.json` | **a node TYPE, in all FOUR shapes `FD-C5` enumerates** — v0.17, [W59](../doc/work-items/w59-what-a-node-type-is.md). `type: "Scorer"` on the top-level entry (`ingest`, declaring **no** `settings`, so the `{}` default the validator sees is in the corpus), on the **branch task of a `map`** (`rank`, `settings: { factor: 100 }` — per INSTANCE, the envelope wrapping each instance's own item under `JP-R11`), on a task inside a `fanout` branch (`scoreA`, `settings: { factor: 10 }`, beside `scoreB`, a `ScoreWorker` — a former bare pool, a type like any other since v0.19 — so two types sit in one region), and on a **join's successor** (`publish`, `settings: { factor: 1 }`, whose `input` is `JP-R12`'s collection — the fourth kind, which no suite instantiated until W59's adequacy reader found a driver handing it `{}` cost zero). `Scorer` is a document-declared type in `registry.json` whose worker `scorer` carries the `settingsSchema` `FD-V33` applies and whose `settings` defaults (`factor: 1`) merge under each node's — so the entry's absent settings are the defaults road, in the corpus (v0.19). **Validated at L4 and never RUN**: what two typed nodes of one type with different settings do on real workers is `examples/flows/typed.flow.json` and `typed-regions.flow.json` at ladder L6 |
| `pooled.flow.json` | **a node on a NAMED pool instance of its type, and one on the default by name** — v0.19, [W65](../doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md). `score` is a `Scorer` on `pool: "scorer-fast"`, an instance `registry.json` declares under `pools` with its own config merged over the type's; `publish` is a `Scorer` on `pool: "Scorer"`, the default instance stated explicitly, which `FD-V38` accepts. The pair `FD-V38` refuses is `spec/examples/invalid/FD-V38--pool-not-an-instance-of-the-type.flow.json`, the same instance named by a node of another type. **Validated at L4 and never RUN** |
| `transformed.flow.json` | **a TRANSFORM, on all FOUR shapes `FD-C5` enumerates** — v0.18, [W61](../doc/work-items/w61-what-a-transform-is.md). `transform` in the fake language `path` on the top-level entry (`ingest`, `document`), on the **branch task of a `map`** (`rank`, `confidence` — its own item under `JP-R11`), on a task inside a `fanout` branch that declares `needs` (`scoreA`, `run.config` — what `needs` composed, the kind `typed.flow.json` does not carry), and on a **join's successor** (`publish`, `$settings.factor` — reading the binding rather than the collection, so the corpus shows `$settings`). `path` is in `registry.json` under `languages` and resolves to the test fixture's adapter in `test/definition/corpus-types.ts`, as `Scorer`'s validator does. **Validated at L4 and never RUN**: what a transform does on real workers is W63's exit artifact |
| `declared-predicate.flow.json` | **a `when` that is DATA, in all three shapes and over all three roots** — v0.27, [W108](../doc/work-items/w108-a-predicate-is-data.md). `ingest` carries three COMPARISONS reaching the two things an `outcome` root holds: `outcome.result.confidence` with `lt` and `outcome.result.tags` with `length` and a `default` of `[]` read the worker's own result, and `outcome.taskId` with `startsWith` reads a DRIVER field, which no schema describes. *(This cell read *one per root the grammar admits*, and the grammar admits two roots — `outcome` and `needs` — of which all three of `ingest`'s are the first. W108's conformity reader, 12.)* `score` carries an **`all`** group whose two members read `outcome.result` and `needs.earlier` (the edge declaring `needs: {"earlier": "ingest"}`, so `FD-C3`'s projection is one of the roots a group reads), an **`any`** group carrying `lte` with a `default` and `ne`, and a registered **NAME** beside both — so the two roads sit on one node and the default edge is last, which is `FD-V7`. **All SEVEN operators appear** — `lt`, `gt`, `startsWith` on `ingest`, then `gte` and `eq` in the `all` group and `lte` and `ne` in the `any` one — so the enumeration is instantiated whole in one document. *(This cell said *six of the seven*, and the L1 clause that reads it carried an escape for `ne` that was a tautology for `ne` alone. W108's conformity reader, 11, and its adequacy reader, 8.)* **Validated at L4 and never RUN**: what a declared predicate ROUTES is `test/driver/predicate.test.ts` at ladder L2, on a flow with **no predicate registered at all** |
| `transform-only-node.flow.json` | **a node whose whole job is to RESHAPE, with no worker and no code** — v0.28, [W109](../doc/work-items/w109-a-node-that-only-transforms.md). `reshape` is of type **`Transform`**, the one member of `BUILT_IN_NODE_TYPES`, which `registry.json` does not declare and does not have to: the built-ins are merged into every registry, which is what lets a document a UI emits carry a reshaping step without carrying a node type for it. Its `transform` picks `confidence` out of what `score` returned and hands it to `publish`, so the document holds a THIRD tier of ADR 0075's rule beside the two the corpus already has — `map-with-context.flow.json`'s `needs` is tier one and `transformed.flow.json`'s node-level `transform` is tier two. **Validated at L4 and never RUN**: what the arm DOES on real workers is `test/scheduler/transform.test.ts` at a real pool *(this row named `test/scheduler/envelope.test.ts`, which does not exist — W109's `Owns` block carried the same wrong name and is where it came from. Both readers found it; nothing catches it, a code span being outside `C5`)*, and every arc LEAVING `reshape` is `unchecked` by construction ([Q446](../doc/questions/q446.md)) |
| `gated-map.flow.json` | **a GATE, v0.23** — [W92](../doc/work-items/w92-what-a-gate-is.md). The maintainer's ingest (P24): a `map` over `files` whose one branch identifies each file and reaches `dedupe`, a `distinct` gate keyed by the KEY PATH `series.id`, whose DEFAULT route (an edge with no `route`) opens the per-series `setup` and whose `duplicate` and `nokey` routes DROP to two `end` nodes inside the region, one per route so the graph stays local. Every route wired exactly once. **Validated at L4, and RUN at L2 since v0.24**: `new Driver` refused a flow holding a gate until W93, and `test/driver/needs.test.ts` asserted THAT refusal on this document where it runs every other region-bearing one — so W93's lift failed that assertion on its first run, and the document joined that census as a row. What a gate does on real workers is W94's exit artifact |
| `if-and-switch.flow.json` | **the built-in `if` and `switch`, v0.31** — [W154](../doc/work-items/w154-the-built-in-if-and-switch.md). The ENTRY is `triage`, an `if` over the PAYLOAD (`input.priority` `gte` 5): `then` leads to `byStatus`, a `switch` keyed on `status` whose case `approved` names one value and `rework` an ARRAY of two, and `else` — the default, by an edge with no `route` — to `queued`. The `switch`'s `default` is wired by an edge with no `route` too, so every route of both gates is wired exactly once, the defaults by omission. **Gates and `end`s only, deliberately**: a routing decision with no worker before it is what P32 asks for, and a TASK here would move two corpus censuses outside W154's `Owns` — the L4 corpus's arc count (`test/definition/wiring.test.ts`) and `spec/outcome-record.md` section 4's task-node figure — for nothing this document shows (W154 re-take 5). **Validated at L4 and never RUN**: what both do in a run is `test/driver/gate-builtins.test.ts` at ladder L2, and on real workers W155's exit artifact |
| `ask.flow.json` | **ASKS, v0.42** — [W179](../doc/work-items/w179-the-ask-node-in-the-definition.md). The ENTRY is `approve`, an ask carrying every key the kind declares: opaque `settings` (the question), an `answerSchema` with an example, and `needs` composing the run's payload (`"."`, the one reference an entry may make). It routes as a task's settlement does — `on: ["failed"]` (the person declining) to `declined`, a `when` over `outcome.result.approved` to `confirm`, the default to `revise` — and `revise` REFERENCES its answer by `needs` (`FD-V27` admits an ask); `confirm` carries nothing but `edges` (no `answerSchema`: an answer held to nothing). **Asks and ends only, deliberately — W179's reading R8**: until P35's next item ran an ask a `Driver` refused a run where a branch entered one, `test/driver/needs.test.ts` RUNS every region-bearing flow here, and `spec/outcome-record.md` section 4 states a census of this corpus's TASK nodes that P35's next item owns. *Since v0.43 the task-bearing and region-bearing shapes are the two rows below* ([W180](../doc/work-items/w180-asking-and-answering-in-a-run.md), the maintainer's ruling on W179's S-2) |
| `ask-after-a-task.flow.json` | **an ask AFTER A TASK, and its answer read twice, v0.43** — [W180](../doc/work-items/w180-asking-and-answering-in-a-run.md). `summarise` runs; `approve` parks with `summarise`'s result as its kept input (no `needs`: the ordinary edge's value), holding a `done` answer to an `answerSchema` with an example; a `when` over `outcome.result.approved` takes `publish`, the default takes `revise`, and a decline (`on: ["failed"]`) ends at `declined`. **`revise` reads BOTH halves** — `needs: {"draft": "summarise", "answer": "approve"}`: the value that reached the ask by naming whatever produced it, and the answer by naming the ask (P35 (e): the answer is the ask's result, and the input stays reachable by `needs`) |
| `ask-in-a-fanout.flow.json` | **an ask as a fan-out's BRANCH ENTRY, before its join, v0.43** — [W180](../doc/work-items/w180-asking-and-answering-in-a-run.md). `split` opens `review` (an ask) and `score` (a task); the ask's branch is LIVE while it waits, so the join `collect` waits for the person (`branch.suspended`, Q7) and `publish` is not dispatched until the answer; a decline exits the region to `dropped`. **The one corpus shape on which `JP-R5`'s ordering clause is observable** — entering the ask emits (`spec/join-policy.md` v0.23) |

**This table and the directory are compared BOTH WAYS, and that is v0.8's addition rather than a
restatement.** `test/definition/l4-corpus.test.ts` asserts the set of `.flow.json` files in
`spec/examples/valid/` equals the set of filenames in this table — **equality, not a floor**, for
`S12`'s reason in `scripts/check-source.mjs`: a floor answers *are there at least N* and goes stale
in the direction of weakness ([Q102](../doc/questions/q102.md)), while an equality fails both when a
file is added without a row and when a row names a file that is gone. **It had a live case the day it
was written**: `nested-fanout.flow.json` had been in the directory and out of this table since
[W20](../doc/work-items/w20-what-a-nested-region-is.md), one plan earlier. It also closes a
**wiring** hole — a corpus flow renamed out of the `.flow.json` glob was previously noticed by
nothing at all, because the only bound was *"the corpus is not empty"*
(`doc/workflow.md` section 5 rule 8 obligation (e)).

**`spec/examples/registry.json` is the registry L4 validates against, and since v0.19 it is a
registry DOCUMENT** (section 3's registry subsection) rather than five lists: `workers` with their
schemas (the `scorer` worker carries the `settingsSchema` `FD-V33` applies, and since v0.20 an
`examples` on it, so the corpus carries the annotation and L4 resolves it), `groups` as instances of
the built-in group types, `nodeTypes` in the document form — one per former pool key, plus `Scorer`
with its `settings` defaults — `pools` with one named instance, and the predicate and language
NAMES. It is part of the corpus rather than a fixture W3 invents: `FD-V4`, `FD-V31`, `FD-V32`,
`FD-V35` and `FD-V38` are refusals *about a registry*, so without one written down their cases cannot
be evaluated, and it deliberately **omits** the names those cases use. **A language adapter's `compile`
is a function, which a JSON document cannot carry**, so `registry.json` names the language and
`test/definition/corpus-types.ts` resolves it — the split the corpus's predicates have always had —
and ladder L4 compares the two both ways; every other section is read by the validator directly, and
L4 resolves the whole document against that code with nothing refused, which is what makes the corpus
registry a registry a consumer could hand `createRuntime`. *(`check-spec`'s `C7` reads predicates,
types, pools and languages from this file and not `groups`; the L4 suite is where those are bound.)*

`spec/examples/invalid/` — one per `FD-V*` rule, filename `<rule-id>--<slug>.flow.json`.

`spec/examples/wiring/` — **documents that are WRONG ON PURPOSE at the wiring check and RIGHT at every `FD-V`** —
v0.21, [W73](../doc/work-items/w73-the-wiring-check-a-verdict-per-edge-and-two-boundaries-validated-once.md), on `invalid/`'s own precedent one rule family over: each is named by the VERDICT it
earns, as `invalid/`'s are by the rule id, and validates clean — a miswire VALIDATES, which is why none
can live in `valid/` (every document there is one an author would want) or in `invalid/`. They wire
against their own registry document, `wiring/registry.json` — five workers with OPPOSED schemas and
`path` as the language, resolved by `test/definition/corpus-types.ts` as the L4 registry's is — because the
L4 corpus's `corpus://` workers declare no schemas ([Q300](../doc/questions/q300.md); the maintainer's choice at
W73's stop-and-ask 1 left them so, and the check's LIVE corpus is the L6 one, whose sixteen workers
`check:workers` runs). `test/definition/wiring.test.ts` compares this table to the directory BOTH WAYS,
holds each document's verdicts to its cell, and asserts that every verdict kind is reached.

| file | verdicts |
|---|---|
| `fits--a-closed-producer-into-a-bounded-consumer.flow.json` | fits: score -> weigh |
| `no--a-consumer-requiring-a-key-the-producer-never-emits.flow.json` | no: score -> write |
| `transform-passes--a-path-picks-the-string-the-consumer-wants.flow.json` | transform-passes: score -> title |
| `transform-fails--a-path-picks-a-number-for-a-string-consumer.flow.json` | transform-fails: score -> title |
| `unchecked--a-producer-declaring-no-output-schema.flow.json` | unchecked: mystery -> weigh |
| `fits--an-ask-answer-into-a-bounded-consumer.flow.json` | fits: approve -> weigh |
