# spec/flow-definition — the flow definition format

**Status:** v0.24 — written by [W1](../doc/work-items/w1-the-normative-layer.md) under
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
[Q12](../doc/open-questions.md) by
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

**v0.10 is [W34](../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md) under
[P10](../doc/plans/p10-is-fan-out-one-feature-or-two.md), and it is the OTHER of section 2's two
questions addressed to an item by name.** [ADR 0037](../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
answers *what `over` is a key on* and *what each map instance receives*; section 3 gains **what an
ordinary edge carries**, which no document in `spec/` had ever stated, and section 4's
*"what each receives is W33's and W34's"* sentence gains its answer. **No rule id is taken here and
that is deliberate**: this document has `FD-V*` for a validation rule and `FD-R*` for a runtime
refusal and **no prefix for a rule about what a run CARRIES** ([Q164](../doc/open-questions.md)), and
`scripts/check-spec.mjs`'s `RULE_ID` is a closed list of eight prefixes, so an invented one would be
invisible to `C2` and `C6` — a rule declared, cited and checked by nothing. *(**v0.11 takes the
prefix**, which is what Q164's row called its forcing condition. `JP-R11` and `JP-R12` keep their ids
— section 3 of `doc/workflow.md`, ids are never renumbered — and the sentence above stays as the
record of why they are where they are.)* The rules are `JP-R11` and
`JP-R12` in [spec/join-policy.md](join-policy.md) section 4, whose owner table already fixes what the
driver does at both ends of a region. **No `FD-V` changed, no `FD-R` changed and no node kind
changed.**

**v0.11 answers [Q11](../doc/open-questions.md) IN GENERAL**
([W41](../doc/work-items/w41-what-a-node-can-reach-and-what-names-it.md) under
[P12](../doc/plans/p12-what-a-node-receives-and-what-a-decision-sees.md)), by
[ADR 0040](../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md):
**what a node can reach is the run's own outputs, and a node id names them relative to a branch
path.** Section 3 gains **`needs`** — an optional declared mapping on a `task` or a `map` — and with
it the two rules this document had no prefix for. **[Q164](../doc/open-questions.md) is RESOLVED and
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

**v0.12 answers [Q8](../doc/open-questions.md)**
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

**v0.13 answers [Q187](../doc/open-questions.md)**
([W45](../doc/work-items/w45-what-a-reference-must-be-able-to-say.md) under
[P13](../doc/plans/p13-when-is-a-declared-reference-refused.md)), by
[ADR 0042](../doc/decisions/0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md):
**a reference says whether it is CONDITIONAL, and the bare form means the target certainly ran.**
Section 3's reference table gains **one row** — a `?` MODIFIER on either aimed form, `"n?"` and
`["n?"]` — and section 5 gains
**`FD-V29`**, which refuses an *unconditional* reference to a node a run can reach this node without
having run. **`FD-V27` is the one rule that does NOT move**, which is the opposite of what
[Q187](../doc/open-questions.md)'s own wording predicts: an author fixes *that node cannot have
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
[Q97](../doc/open-questions.md)), and **two `map` regions of different arity**, where `FD-V29`
answers *did it run* correctly and the reader's branch path is comparable with none of the target's.
`reference-past-a-map-arity.flow.json` was the second, in the corpus, with **no custom policy** — **and v0.15 removes it**, so `FD-R3`'s only remaining road is the policy one ([Q218](../doc/open-questions.md)). Kept as the record of what that rule was decided against.
**No node kind is added** (P13 decision 3) and **`spec/join-policy.md` section 4 is not reopened**
(P13 decision 2, `JP-R5` read and not edited).

**v0.14 decides [Q186](../doc/open-questions.md)**
([W46](../doc/work-items/w46-what-a-reference-costs-and-whether-anything-says-so.md) under
[P13](../doc/plans/p13-when-is-a-declared-reference-refused.md)), and **it takes no rule id and no
ADR**: section 3's cost blockquote gains the measurement, the METHOD, and the reason **nothing
warns**, on [Q190](../doc/open-questions.md)'s precedent — recorded in this document and asserted at
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

**v0.15 answers [Q206](../doc/open-questions.md)**
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
refinement.** [Q206](../doc/open-questions.md)'s row and P14's own facts frame it as a map-arity
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
wins, whole**. This is [Q16](../doc/open-questions.md)'s TASK half: a retry happens inside one task
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
item, one a transformed record the static reading refuses — which the check found and the item corrected ([Q302](../doc/open-questions.md)'s other
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

Six. There is **no `decision` node kind** — a decision is a property of an edge, which is
ADR 0002 rule 2 taken literally (`when: "isLowConfidence"`). **A decision WITH MEMORY is a node**, and
that is the sixth kind, `gate` (v0.23, below): its memory is one per gate per run, so it belongs to a
node and not to an edge, and a predicate is asked to be pure ([Q9](../doc/open-questions.md)) where a
gate's whole job is to remember.

| kind | keys | |
|---|---|---|
| `task` | `id`, `kind`, `edges`, **`type`**, **`pool?`**, **`settings?`**, **`transform?`**, **`optional?`**, **`needs?`**, **`retryPolicy?`**, **`workerGroups?`** | runs as a node TYPE the registry declares — REQUIRED since v0.19 — on the type's default pool instance or on a named one (`pool`), its worker receiving the envelope. Dispatched as one scheduler task. `retryPolicy` and `workerGroups` are what it says about that task — v0.16, below; `transform` is what it may DO to its input before its worker sees it — v0.18, below. *(`workerType`, v0.1-v0.18's way of naming a pool by its key, is retired — an undeclared key, `FD-V17`.)* |
| `fanout` | `id`, `kind`, `branches` | opens a region with **N branches declared here**. Dispatches nothing itself |
| `map` | `id`, `kind`, `over`, `branch`, **`needs?`** | opens a region with **one branch, opened N times at run time**. Dispatches nothing itself. v0.8 |
| `join` | `id`, `kind`, `of`, `edges` | closes the region opened by the `fanout` **or `map`** named in `of`. Dispatches nothing itself |
| `end` | `id`, `kind`, `outcome` | terminates one path. No edges |
| `gate` | `id`, `kind`, `type`, `edges`, **`settings?`** | routes the branch that reaches it by a registered GATE type's decision, and hands on exactly what reached it. Dispatches nothing itself. v0.23 |

**Only a `task` node is ever dispatched**, and therefore only a `task` node has a task id
([spec/task-id.md](task-id.md)), produces an outcome record, or can suspend. `fanout`, `map`, `join`,
`end` and `gate` are structural: a run passes through them within a single driver turn. **This is why `end`
nodes are exempt from `FD-V13`, `FD-V19` and `FD-V22`** — sharing one between two paths creates no
ambiguity about anything, because nothing about it is per-path.

A `join`'s single edge carries neither `when` nor `on` (`FD-V7`): a predicate's
`DecisionContext.outcome` would have nothing to hold.

`end.outcome` is a non-empty author-defined string. **The driver does not interpret it** — the
run-level outcome vocabulary is run state's, not the definition's ([Q25](../doc/open-questions.md)).

### `optional`

`optional` is a boolean, default `false`, passed through to the scheduler task
(`AGENTS.md` section 5). It is the authoring-level form of ADR 0004 rule 7:

> **`optional: true` means the flow handles this node's failure. The default means a human does.**

That is not a convention laid over the library — it is the library's own branch. A task that fails
with no retries left reaches `state = 'failed'` **only** inside `if (task.optional)`
(`../fyflow-scheduler/core/FyflowScheduler.ts:894-897`, and again at `:1130-1133`); otherwise it
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
{ "id": "score", "kind": "task", "workerType": "ScoreWorker",
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

**What this is NOT.** A retry here is the scheduler's, inside one task id — [Q16](../doc/open-questions.md)'s
TASK half. Re-dispatching a *node* under a new attempt, which is the task id's fourth segment
([Q111](../doc/open-questions.md)) and may route elsewhere, is that question's other half and stays
open. `limitKey`, the scheduler's per-workload bucket for a keyed group, is not configuration and has
no home here ([Q248](../doc/open-questions.md)); `handleRejection` is irrelevant to a driver that
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
| `type` | required | the name of a node type in the registry's `nodeTypes`, whose `worker` the registry's `workers` declares — `FD-V32`, both clauses. A non-string `type` is `FD-V21`; a task with no `type` is `FD-V23` |
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
recorded in ADR 0049 as the road not taken, with its cost ([Q250](../doc/open-questions.md)).

**Why a SCHEMA now, where v0.17 had a validator function.** A JSON registry cannot carry a
function, and the settings language P16 left to P18 is the worker's `settingsSchema` — JSON Schema
restricted to the thirteen keywords of section 3's subset, [ADR 0053](../doc/decisions/0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md).
A keyword outside the subset is REFUSED at construction naming it, never ignored
([Q278](../doc/open-questions.md)); reached by this rule anyway, it is reported under `FD-V33` and
never applied, because a keyword ignored is a constraint dropped in silence. The type's defaults are
merged under the node's BEFORE the schema is applied, so a worker that requires a key is satisfied
by a type that supplies it (P18 decision 12), and what the worker receives is the merged object —
a default validated and not delivered would be [W43](../doc/work-items/w43-the-two-blocked-flows-on-real-workers.md)'s
silent shape. *Plain object* is checked as the shape `JSON.parse` can produce — an object, not
`null`, not an array. An unregistered `type` beside a malformed `settings` reports **both**
`FD-V32` and `FD-V33`, section 5's *every violation*. **The schema runs at construction and nowhere
else.** Measured at W59: the driver holds the definition **by reference**, so a document mutated
after `new Driver` is dispatched as mutated, and no rule here sees it; that road pre-dates this
version, is the same for every key, and is recorded rather than closed ([Q259](../doc/open-questions.md)).

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
collision [Q260](../doc/open-questions.md) recorded — a type's name against a bare pool key nothing
compared — is a refusal for a NAMED instance in the document's `pools`, `NameCollision` at construction;
a pool a consumer builds by hand and spreads into the scheduler beside the helper's is still nothing's
to compare, and Q260 stays open for it.)*

**What this is NOT.** A type's worker SAYS what it expects and returns — `inputSchema` and
`outputSchema` on the worker entry — enforced on no SETTLEMENT: declared and carried since
v0.19, held to one value per run each since v0.21 (`FD-R4`), and since v0.20 confirmed on a run by an authoring-time check, `scripts/check-workers.mjs`, over each schema's declared `examples` ([ADR 0056](../doc/decisions/0056-an-example-is-an-annotation-validated-against-the-schema-it-sits-on.md), [W72](../doc/work-items/w72-the-contract-an-example-beside-every-schema-and-a-worker-run-on-it.md)) *(this said "nothing enforces either yet … P19's strict mode" — P19 was DECLARED 2026-09-18 under a different name, *what a schema buys an author*, per-settlement enforcement is OUT of it as a default, and what it enforces at run time is the entry payload and a person's resolution, once each — `FD-R4`, W73)*. A transform on the envelope is the `transform` subsection below (v0.18).
A node type has no VERSION ([Q249](../doc/open-questions.md)). Cases: `spec/examples/valid/typed.flow.json`
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
into a typed pool's config ONLY for a type some node of which declares a transform, and only for the
languages those nodes name, and which the envelope worker loads in `setup()` once per worker instance,
compiling each distinct expression once per instance rather than per task; **`check`** is RESERVED
for P18's pre-flight and implemented by nothing — optional, not absent. **The two halves can
DISAGREE**: one module read twice is one language and two modules, or two versions on the two sides
of a thread, are two ([Q264](../doc/open-questions.md)); the worker half refusing what the registry
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
stop-and-ask**: measured, a throw in the wrapper's `setup()` is a WORKER error — the task stays
`pending` with `attempts: 0`, the pool restarts its worker, and the scheduler emits nothing a driver
could record — so the wrapper remembers the load failure and throws it from `run()` on exactly the
tasks whose transform names that language, while a task with no transform, or in a language that did
load, still runs. No `FD-R` is added: `RunState.outcome` never says `stopped` for a transform.

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
matches, a scalar at one, absent at zero — and that is [Q263](../doc/open-questions.md), shown by
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
| `branch` | required | **one** node id, whose kind is a `task` (`FD-V25`). Not a list |

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
(`FD-V25` makes a map's `branch` a `task` and `FD-V9` a fanout's entries tasks), so `JP-R11` does not
reach what a map node receives — only what its instances do.

**What each INSTANCE receives is `over`'s array at that instance's index, as its own copy** —
`JP-R11` in [spec/join-policy.md](join-policy.md) section 4, and
[ADR 0037](../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
rule 3. **That is what makes `over` mean something**: handed the whole value instead, an instance can
only find its own item by an index nothing gives it, and `over` would name an array whose sole use is
its `length`.

*(This paragraph read *"deliberately not settled here … what a node receives is
[Q11](../doc/open-questions.md) and belongs to
[W34](../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md)"*. **It is the same
shape as the `FD-R2` paragraph below and it is answered rather than left**: that one addressed a
run-time question to W33 by name, W33 built the answer and shipped it with **no rule id anywhere in
`spec/`**, and only its conformity reader caught it. The rule is `JP-R11` and it lives in
`spec/join-policy.md` because that is the document whose section 4 fixes what the driver does when it
opens a region; **[Q164](../doc/open-questions.md) is why it is not `FD-`-prefixed.** Q11 itself stays
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
| `type` | required | a registered GATE type — a built-in (`distinct`) or one the registry's `gateTypes` adds (`FD-V39`). Gate types are CODE, not document entries: a type's decision is a function, which a JSON registry cannot carry (ADR 0002 rule 1) — the section 3 registry subsection's *Gate types* |
| `settings` | optional | a plain object its type's `settingsSchema` accepts, `{}` when absent (`FD-V40`). **`key` is the one setting the library reads**: where present it is a KEY PATH, below |
| `edges` | required | each `{ to, route? }` — `route` names one of the type's routes and is ABSENT for the DEFAULT route; nothing else may sit beside them (`FD-V41`) |

**It routes and computes nothing.** What leaves a gate on the route its type chooses is exactly the value
that reached it — the same value, never its settings and never the predecessor's whole record — so a gate
is invisible to what the next node receives: `FD-C1`'s *"the value this node receives"* for the node after
a gate is the value the gate received. **It is dispatched to no scheduler**, so it has no task id and
**produces no output** — `FD-V27` refuses a reference to one, as it refuses a reference to any node that is
not a `task`.

**Routes, and the DEFAULT route.** A gate type DECLARES its routes; `distinct` declares `first`,
`duplicate` and `nokey`, with `first` its default. An edge names a route with `route`, and **an edge with
no `route` carries the type's DEFAULT route — never *every* route**: the precedent is a `task`'s edge with
no `on`, which means `done` and nothing else. The default is whichever route the type names, **not
necessarily its first**; for `distinct` the two coincide, which is why W92's suite registers a type whose
default is not its first route.

**Every route is wired exactly once, and a drop is an edge to an `end`** (P24 decision 4). An unwired
route, an edge naming a route the type does not declare, and two edges for one route are all refused at
instantiation against the registry (`FD-V41`) — and a gate edge carrying `when`, `on` or `needs` is refused
too: a gate has no terminal state for `on` to select, runs no predicate for `when` to name, and hands on
what reached it, so an edge `needs` would have no reader. *Over*: dropping by OMISSION, which the library
allows for a task's terminal states because those are a fixed list the library owns; a gate type's routes
are the registry's, the registry carries no version ([Q249](../doc/open-questions.md)), and a route added
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
keep those a `task`, unchanged. Inside a region a gate is a member like a task (`FD-V13`, `FD-V19` and
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
2. **A route the type does not declare stops the run** — `FD-R5`, `UndeclaredRoute`, through `OR-R10`; and
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
before its first decision, and holds the payload to that route's target alone; a type that throws or returns
an undeclared route there holds nothing past the gate, and the run then stops on it for real. The static
wiring check still lists every route's target, since any of them is a place the payload may land.

**`distinct` — the one built-in gate type:**

| route | taken when |
|---|---|
| `first` | **the default.** The key has not reached this gate before in this run |
| `duplicate` | it has |
| `nokey` | the key is missing, `null`, or not a string or a number (P24 stop-and-ask (c)) — **and a number that is not FINITE is not a key either**: W92's refinement of (c)'s words rather than (c) itself, because `NaN` and the infinities have no JSON value (`JSON.stringify(NaN)` is `"null"`), so two of them could not be told apart from `null` or from each other — *over* stopping the run (one bad file ends a batch) and treating the missing key as a key (every unidentified file after the first dropped as a duplicate of *"undefined"*) |

Its settings are `{ key }` — required, a non-empty string, no other key — and keys are compared as JSON
values, so `"1"` and `1` are two keys. **Which branch is FIRST is the order branches reach the gate in a
run, which varies between runs** (P24 decision 7) — no test may assert which one wins, only that exactly one
does per key ([Q379](../doc/open-questions.md)).

## 3. Edges, decisions, and which outcomes route

```json
{ "id": "score", "kind": "task", "workerType": "ScoreWorker", "optional": true, "edges": [
    { "on": ["failed"], "to": "quarantine" },
    { "when": "isLowConfidence", "to": "review" },
    { "to": "publish" }
] }
```

| Edge key | | |
|---|---|---|
| `to` | required | a node id |
| `on` | optional, default `["done"]` | the terminal states this edge is eligible for. Values: `"done"`, `"failed"` (`FD-V18`) |
| `when` | optional | a predicate name. An edge without one is the default for its eligible states |
| `needs` | optional, v0.12 | **what this edge's PREDICATE sees**, under `ctx.needs` — `FD-C3` below. Same grammar as a node's `needs`, **minus the `"."` form** (`FD-V26`). An edge with no `when` may carry one and no predicate ever reads it |
| `route` | optional, v0.23, **a GATE's edges only** | which of the gate type's routes this edge carries; absent means the type's DEFAULT route. On any other node's edge it is refused, and a gate's edge carries `to` and `route` and nothing else (`FD-V41`) — section 2's `gate` subsection. **The routing rules below are a `task`'s and a `join`'s**; a gate's edge is chosen by the route its type returns |

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
2. Among the eligible edges, **in declaration order**, the first whose `when` predicate returns true
   is taken. Later edges are not evaluated. An edge with no `when` always passes.
3. `when` is resolved against the predicate registry at instantiation, never at routing time
   (ADR 0002 rule 3). An unknown name is an instantiation error (`FD-V4`).
4. A predicate receives a single `DecisionContext` argument and returns a boolean. It carries
   **`outcome`** — always the node's effective outcome, one shape whether the node settled or was
   resolved — and, since v0.12, **`needs`**: what **this edge** declared, or `{}`. *(This rule read
   *"P1 populates exactly one field … whether the context also carries accumulated run state is
   [Q8](../doc/open-questions.md); adding a field later is additive rather than a signature change"*.
   **It was additive and the sentence was right about that**; what it did not predict is that the
   field would be declared on the EDGE — see `FD-C3`.)*
5. A predicate is pure (ADR 0002 rule 4). Purity is not enforced by this document;
   [Q9](../doc/open-questions.md) is about the mechanism.

**What the edge CARRIES, as opposed to which edge is taken — v0.10.** Routing above decides *which*;
this is the other half and until v0.10 no document in `spec/` stated it, which is the gap
[Q11](../doc/open-questions.md) and [Q154](../doc/open-questions.md) both lived in.

> **An ordinary edge carries the source node's effective-outcome `result`, deep-copied.** The copy is
> `spec/outcome-record.md` section 4's *"copying the field copies the reference"* applied to the one
> exit that reaches a worker: without it the next task's payload **is** the record's `result`, and an
> inline worker mutating what it was given edits a record already in the log.

### `needs` — what a node receives, when it is not the previous node's output — v0.11

[ADR 0040](../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md),
answering [Q11](../doc/open-questions.md) **in general**, with
[Q166](../doc/open-questions.md) and [Q165](../doc/open-questions.md) as its cases.

```json
{ "id": "score", "kind": "task", "workerType": "ScoreWorker",
  "needs": { "item": ".", "run": "ingest" },
  "edges": [ { "to": "collect" } ] }
```

**`needs` is optional, and a node without one receives exactly what the paragraph above says.** That
is the whole of rule 1: the default is unchanged, so every flow written against v0.10 behaves at
v0.11 exactly as it did — measured, at 574 L1-L5 cases unmoved.

A node that declares one receives **the object `needs` describes, and nothing else**. There is no
wrapper and no reserved key, because `"."` is how an author asks for what the edge carried.

| a reference is | and resolves to |
|---|---|
| `"."` | **whatever this node would have received had it declared nothing** — whichever of this document's arcs it sits on: the ordinary edge's value above, a `fanout` branch entry's own copy or a `map` instance's own item (`JP-R11`), or a satisfied join's collection (`JP-R12`). *(This row enumerated the first and the last of those and omitted the two in between; **`map-over-region-output`'s `rank` sits on a join's exit edge**, so one of the omissions is in this item's own corpus. W41's conformity reader.)* It is one of the grammar's **two** invented tokens — `?` is the other, one row down — and it is safe because `.` is outside `FD-V16`'s charset, so no node may ever be called it. *(This read *"the one invented token"* and stayed that way ten lines above the row that added the second. W45's conformity reader; the neighbour-of-a-corrected-line class.)* |
| `"score"` | that node's output **on this node's own branch path**. **None, and the run stops** (`FD-R3`); more than one is unreachable, because `FD-V28` refuses this form wherever the graph admits more |
| `["score"]` | **those of that node's outputs that are VISIBLE on this node's own path** — see the note below the table — as an **array**, in ascending `branchPath` order compared segment-wise as numbers — `JP-R12`'s order rule, and the same reason: it is what makes the value the same whatever order the branches settled in. Legal only where this node is **outside a `map` region** containing the named one (`FD-V28`). *(This row read *"outside a region"* — the very confusion `FD-V28`'s own note two blockquotes down records its first version making, where a node after a two-branch `fanout` join was refused and told to index `[0]` out of a list. Measured on `fanout-join.flow.json`: `["scoreA"]` is REFUSED and `"scoreA"` accepted, so the row's condition was not the rule's. W49's conformity reader, in a row this item edited.)* **Since v0.15 that is ALL of them wherever the two nodes' region chains share no entry** — a reader after the region, and a reader inside a SIBLING one, which used to receive the one output whose index happened to match its own ([ADR 0044](../doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)) |
| **a `?` suffix on either of the two above** — `"score?"`, `["score?"]` | **the same outputs, and `FD-C4` instead of `FD-R3` when there are none**: the key is **ABSENT** for `"score?"` and **`[]`** for `["score?"]`, and the run does not stop. v0.13. This is what says *if it ran*, and writing it is what exempts a reference from `FD-V29` |

**The array form is JSON's own array syntax rather than a second sigil**, so the grammar invents two
tokens rather than three, and a definition still survives `JSON.parse(JSON.stringify(x))`
(ADR 0002 rule 1).

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
> [Q206](../doc/open-questions.md) was.** W45's conformity reader found it: `FD-V28` asks a REGION
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
[Q11](../doc/open-questions.md)'s second candidate is the state and its third is the access, and only
the third can reach a worker at all, because `createTask` takes **one** value
(`{id, workerType, payload, optional}` — measured).

**What NAMES an output is the pair `(node id, branchPath)`** — `FD-C2` — and a node id alone does
not. Measured over the region-bearing flows in `spec/examples/valid/` — **four when this was written,
ten at v0.15 and THIRTEEN now** (W84's conformity reader), the census deriving the set from the directory: the pairs are distinct in every one, while
the node ids collapse in exactly the flows with a `map` region, at any depth, and in **none** of the
**five** with only `fanout`s. That is
[ADR 0036](../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md)'s
deciding fact for the **third** time ([Q160](../doc/open-questions.md)), and it is why an author
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
> [Q206](../doc/open-questions.md).

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
[Q19](../doc/open-questions.md)'s *"if Q8 or Q11 retains every node output"* described **today**
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
> **112x**. [Q186](../doc/open-questions.md)'s row says 85x and P13's declaration 64x, on the third
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
> [Q179](../doc/open-questions.md), and [Q208](../doc/open-questions.md) for what it is a cause of.
>
> **And nothing WARNS about it, which is a decision** — [Q186](../doc/open-questions.md), W46, and
> **no ADR**, on [Q190](../doc/open-questions.md)'s precedent: a decision recorded in this section and
> asserted at ladder L2, which is what `doc/workflow.md` section 1 rule 3 asks of one.
>
> | | |
> |---|---|
> | **the predicate that needs no size judgement fires on every INTENDED use, and on nothing else** | *a reference on a node inside a map region naming one outside it* is decidable from the document. Over both corpora it fires on **3 of 13** references in **2 distinct flows**, and **`map-with-context`'s is the CLIFF rather than a false positive**: measured on the shipped document, unedited, **604.9-643.6 ms as the corpus writes it against 7.9-9.1 ms with the `run` key removed** — ~70x, on the flow this feature exists for. So the predicate is RIGHT, and it is right about **3 of 3** intended uses; the only remedy for the expensive one is the reshaping node [ADR 0040](../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md) exists to remove. **A predicate that fires on every intended use and nothing else restates the feature's definition rather than diagnosing anything.** *(This cell read *"warns about the FEATURE"* on the ground that the showcase was a false positive, which W46's adequacy reader falsified with the measurement above. **The conclusion held and its reason was the opposite of the truth.**)* And it is **not the only** such predicate: *a reference naming the node the `over` array was read from* fires on the same 3, which both readers found independently |
> | **there is no threshold, and the question is THIS ROW's own** | a run-time guard must answer *how large is too large*. **That phrase occurs in exactly one place in the register — [Q186](../doc/open-questions.md)'s own row** — and not in [Q22](../doc/open-questions.md), which asks whether a result must be structured-CLONEABLE and where that constraint sits. *(This cell deferred to Q22, and W46's conformity reader found that answering Q22 as written would supply no threshold. So the question is not owned elsewhere: it is the reason this row stays OPEN with its decision recorded, rather than resolved.)* |
> | **a REPORT channel exists and is declined rather than absent** | [ADR 0027](../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md) faced *stop / ignore / report* and chose **report** — `onUnmintedTask`. That is the option between a refusal and silence, it is in this codebase, and it is **weighed here rather than omitted**: `onUnmintedTask` reports a fact about a RUN that a caller could not otherwise know, and *this reference is resolved once per item* is a fact about the DOCUMENT, decidable by reading it. `validateDefinition` and `Finding` are both exported from the package root, so a `severity` field would be a **type** change rather than a new option — cheaper than an option and still a change to a published type, for a diagnostic with no action behind it. *(This cell read *"there is no CHANNEL"*, which stated an absence where what exists is an unweighed choice. W46's conformity reader.)* |
> | **and MEASURING is not the obstacle** | Q186's row makes the guessing the whole of the objection, and it is right. A size measurement is **~29% of ONE clone** — `JSON.stringify().length` at **0.140 ms** against **0.482 ms**, independently re-derived at 0.125 against 0.418 — and it is taken **once per (node, key)** against **N** clones, because for the case a guard would target the value is the same for all N. At N = 1000 that is **~0.03%** of what it would warn about. *(This cell claimed **~1%** from a budgeted walk at 0.0053 ms; W46's conformity reader could not reproduce any budget below 0.02-0.03 ms, because the first pop expands a 1000-element array. The budgeted figure is withdrawn and the two that reproduce are what the row now rests on — a stronger number by two orders of magnitude.)* **The scope is stated**: *the value is the same for all N* is true of a reference from inside a map region to a node outside it, and false for `"."` and for a reference to another node in the same region |
>
> **What would force it:** an author reporting a flow whose cost surprised them, a **threshold** arriving from anywhere, or a second reference form for which the size is not a property of the whole node.

**The effective outcome, never the raw record** — rule 4 above, one level out. A resumed node has two
records and neither alone is right to hand anybody; a node still suspended has **no** effective
outcome and therefore **no entry**, which is what makes `FD-R3` fire rather than a reference quietly
resolving to `undefined`.

| id | | Test owed by |
|---|---|---|
| `FD-C1` | **What a node receives.** *(v0.15 — the VISIBILITY half of this rule is amended by [ADR 0044](../doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md): an output is visible to a reader when their two branch paths agree on the regions their two region CHAINS share, and *one path is a prefix of the other* is that rule's special case. Everything else in this row is unchanged. **The derivation shipped with the rule and the RESOLVER followed in W50**, so a run applies it — see the header. Test: at ladder L1, `test/definition/sibling-regions.test.ts` — `sharedRegionDepth` and `outputIsVisible` against a hand-derived table over six documents, the old rule pinned to the sentence this document carried before v0.15, and the two compared over every nesting pair and every sibling pair.)* With no `needs`, the source node's effective-outcome `result`, deep-copied — the paragraph above, unchanged. With a `needs`, **exactly** the object it describes: one key per declared key, each resolved by the table above and each its own copy. Test: at ladder L2, over `map-with-context.flow.json` and `map-over-region-output.flow.json`, asserting the composed payload of **every dispatch a `needs` composes** — which is 2 of that flow's 4 and 3 of this one's 7, the rest being nodes that declare none; and that a node with no `needs` is byte-unchanged, which the L1-L5 suite asserts as a whole — **574 cases when `FD-C1` was written and 681 now**, and the claim is that the number MOVES only for reasons an item names | **[W41](../doc/work-items/w41-what-a-node-can-reach-and-what-names-it.md)** |
| `FD-C4` | **What a CONDITIONAL reference carries when its target produced nothing on this path** — v0.13, [ADR 0042](../doc/decisions/0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md) rule 4. For `"n?"` the key is **absent** from the composed object — not present holding `null`, and not present holding `undefined`, because `null` is what a reference to a task that ran and FAILED already resolves to. For `["n?"]` the key is present holding **`[]`**. Everything else is `FD-C1`'s row for the unsuffixed form, unchanged: the visibility predicate, the order, and the per-key copy. **At both declaration sites**, by the same expression — an edge's conditional reference that resolves to nothing leaves `ctx.needs` without that key, so a predicate reads `'f' in ctx.needs` (`FD-C3`). Test: at ladder L2, over `reference-if-it-ran.flow.json` — one flow, **two runs**, the key present on one and absent on the other, and the run completing on both; and the array form over a SIBLING map region past the first's arity, giving `[]`. *(This cell said *"a nested map region"*; `reference-past-a-map-arity`'s two regions are sequential siblings — `rank` is in `after(split)`, not in `region(split)` — and the nested-map flows are `map-in-fanout` and `nested-map`, neither of which is used. Third occurrence in this document of a rule cell naming a test other than the one that exists. W45's conformity reader.)* | **[W45](../doc/work-items/w45-what-a-reference-must-be-able-to-say.md)** |
| `FD-C2` | **What names an output is the pair `(node id, branchPath)`.** A node id alone names one output outside a `map` region and **N** inside one, so a projection keyed by node id collapses a map's instances — which is what a reference must not do. A `needs` reference names a node **id**, because a branch path inside a map region is a property of the **dispatch** (section 4, `ID-R6`) and no author can write one. Test: at ladder L2, the pairs are distinct over **every region-bearing corpus flow** — the census derives that set from the directory rather than from a list beside itself, and it is **ten** flows since W50 added `sibling-fanouts` — while the node ids collapse in exactly the map-bearing ones. *(This cell read *"all four … and the two this item adds"*, which was W41's count and went stale twice. W50's conformity reader.)* | **[W41](../doc/work-items/w41-what-a-node-can-reach-and-what-names-it.md)** |
| `FD-C5` | **What EVERY task node's worker receives: the envelope `{ settings, input }`** — v0.17 for a typed node, v0.19 for every node ([ADR 0054](../doc/decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md)), [ADR 0049](../doc/decisions/0049-a-node-type-is-a-registry-entry-and-its-worker-receives-an-envelope.md) rule 3, section 2's `type` subsection. `settings` is the node's effective `settings` — the type's defaults merged UNDER the node's, `{}` when neither declares any — as its **own copy** per dispatch; **`input` is THE VALUE THIS NODE RECEIVES** — what a bare node was handed as its whole payload until v0.19: the ordinary edge's value (section 3), the object its `needs` describes (`FD-C1`), its own item as a map instance (`JP-R11`), or the collection as a join's successor (`JP-R12`). No more and no less: an untyped node receives no envelope and no reserved key (ADR 0040 rule 6 untouched), and a typed node's worker reads its two keys by name. **Defined as the value RECEIVED and never as "what `needs` composed"**, deliberately, so a later per-node transform ([Q251](../doc/open-questions.md)) sits between composition and this envelope without rewording the rule. Two typed nodes of one type with different `settings` receive different envelopes and the same `input` rule, which is what the exit artifact shows on real workers | **[W59](../doc/work-items/w59-what-a-node-type-is.md)** — `test/driver/node-type.test.ts` at L2 on all three shapes, as a PAIR against the untyped node's whole payload; `examples/l6.ts` at L6 |
| `FD-C6` | **What a typed node's POOL receives when the node declares a `transform`, and what its WORKER receives then** — v0.18, [ADR 0051](../doc/decisions/0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md) rule 3, section 2's `transform` subsection. The envelope the driver dispatches is `{ settings, input, transform }`: `settings` and `input` exactly as `FD-C5` states them — **`input` is STILL the value this node receives, untransformed**, because the driver evaluates nothing (P17 decision 1) — and `transform` is the declared `{ lang, expr }`, as its own copy, **present exactly when the node declares one**. The type's envelope worker evaluates the expression over `input` with `settings` bound as `$settings` and hands the inner worker `{ settings, input }` with `input` REPLACED by the result — `undefined` included — and no third key; a transform it cannot evaluate, or a language whose module did not load, is the TASK's failure (section 2). A typed node declaring no transform receives `FD-C5`'s two-key envelope to the byte, and an untyped node receives no envelope at all — ADR 0040 rule 6 untouched. Test: at ladder L2, `test/driver/transform.test.ts` on all four shapes `FD-C5` enumerates — the third key present exactly when declared, and `input` untransformed as a PAIR against the bare node's whole payload; at L1, `test/scheduler/transform.test.ts` — the wrapper over the four kinds of input, and on a real inline and threaded pool where one can load its script | **[W61](../doc/work-items/w61-what-a-transform-is.md)** |

### An EDGE may declare `needs` too, and what it gives is what its PREDICATE sees — v0.12

[ADR 0041](../doc/decisions/0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md),
answering [Q8](../doc/open-questions.md).

```json
{ "when": "isLowConfidence", "to": "review", "needs": { "earlier": "ingest" } }
```

**Same grammar, same aiming rules, minus the `"."` form.** A reference on an edge is a node id or a
one-element array holding one; `"."` is refused by `FD-V26`, because *what this predicate would have
received anyway* is `ctx.outcome` and it already has it. `FD-V27` and `FD-V28` ask the same two
questions of an edge's references as of a node's, **with the same reader** — an edge has no path of
its own, so the node it hangs on is what a reference resolves relative to.

**Why the EDGE and not the node**, stated because it is the whole of what
[P12](../doc/plans/p12-what-a-node-receives-and-what-a-decision-sees.md) prediction 3 got wrong:

| | |
|---|---|
| a node's `needs` would rewrite what its **WORKER** receives | measured: `score` with no `needs` receives `{"flagged":true}`, and with `needs: {"own": ".", "up": "ingest"}` receives `{"own":…,"up":…}`. **Giving the predicate reach would change the worker's contract** |
| and *what the node received* is **not derivable at routing time** | The **entry** node's payload is `start(payload)` and is in **no record**: an `OutcomeRecord` carries `result` and no payload field, so that node has no derivation at all — not a hard one, none. For every other node a derivation re-implements `compose`, `JP-R11` and `JP-R12` at a second site, which [ADR 0040](../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md) rule 2 refuses by name; keeping it instead is a payload retained per dispatched node, which is [Q19](../doc/open-questions.md)'s own subject. *(This row cited a **diamond** and append order, and W42's conformity reader derived the diamond with neither.)* |
| the **references** are derivable, and cost nothing new | they resolve from the same projection `FD-C1` uses, at the moment the decision is made, with **no new driver state** |

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
| `FD-C3` | **What a decision sees.** Its node's **effective outcome** (rule 4, unchanged since P1), and **`needs`** — the object THIS EDGE's `needs` describes, resolved by `FD-C1`'s table with the reader being the node the edge hangs on, or `{}` when the edge declares none. **A different edge of the same node may declare something different**, so the context is built per edge and only for an edge that carries a `when`. Test: at ladder L2, over `decision-on-an-earlier-step.flow.json` — one flow, two runs, the predicate answering differently because of a node it does not sit on; that a node with no `needs` anywhere has its worker payload **unchanged**; and that an edge which is never REACHED is never resolved, so a later edge's unresolvable reference does not stop a run the flow routes correctly. **On a CONSTRUCTED fixture, because that corpus flow cannot express them**: that another edge of the same node sees `{}`, which needs a node with **two guarded edges** since a default carries no `when` and so builds no context; and that a **resumed** node's predicate sees the resolution's result under `outcome` while `needs` resolves against the run. *(This cell prescribed both of those over the corpus flow, and prescribed the second as "the resolution's result under BOTH fields" — which no flow can express, because for `needs` to carry the resumed node's own result the edge would have to name its own node, and `FD-V27` refuses that. Section 6's "FD-R1's test, corrected" is the same class and this is its second occurrence in this document. W42's conformity reader.)* | **[W42](../doc/work-items/w42-what-a-decision-sees.md)** |


**A fan-out edge and a join's exit edge are the two that are not ordinary**, and both are
[spec/join-policy.md](join-policy.md) section 4's — `JP-R11` for what each opened branch receives, and
`JP-R12` for what a satisfied join carries. They live there because that section already fixes what
the driver owes at both ends of a region, and because splitting one payload contract across documents
is what left it unstated for ten plans. **[Q164](../doc/open-questions.md)** records the other reason:
this document has an id prefix for a **validation** rule and one for a **runtime refusal**, and none
for a rule about what a run *carries*.

**Rule 4's *"always the effective outcome"* is what closes a hole the second pass found.** A resumed
node has two records in the log — the `user_action` settlement and the resolution — and neither is
the right thing to hand a predicate: the first cannot see the human's answer, the second has no
`terminalState` at all. A predicate written `ctx.outcome.terminalState === "done"` must mean one
thing, so the fold derives one record and routing never sees the pair.

**A `user_action` settlement routes nowhere.** It **suspends** the path (ADR 0004 rule 3), and `on`
may not name it (`FD-V18`, [Q30](../doc/open-questions.md)). The path resumes when a resolution
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
| `pools` | object, by key | NAMED instances of a node type. **Every type has a DEFAULT instance, implicit, keyed by the type's name and built from the type's own `config`**; a named instance is the same derivation over its own config, and a pool named as a type is refused |
| `predicates` | array of names | the predicates the flows may name in `when`. `code.predicates` supplies each; one named and not supplied is refused (`NameMissing`) |
| `languages` | array of names | the languages the flows may name in `transform.lang`. `code.languages` supplies each adapter; one named and not supplied is refused — **the runtime imports NO engine** (ADR 0052 rule 4, decision 13) |

#### A worker entry

| key | | |
|---|---|---|
| `url` | required | the worker class's module URL — its default export is the class, the scheduler's own contract. A relative URL resolves against the `base` the runtime is given (decision 7): inside a bundle `import.meta.url` is the bundle ([Q261](../doc/open-questions.md)) and the runtime cannot guess |
| `configSchema` | optional, CHECKED | what the worker's CONSTRUCTOR argument must satisfy — a type's derived config (its default instance's) and every named instance's, at construction |
| `settingsSchema` | optional, CHECKED | what a node's effective `settings` must satisfy — `FD-V33`, at `new Driver`, a schema where v0.17 had a function. The type's `settings` defaults are merged UNDER the node's before it is applied |
| `inputSchema` | optional, CARRIED | what the worker's `run()` receives as `input`. Declared, held to the subset, and enforced on ONE value per run — the entry payload at `start()`, `FD-R4` (v0.21, W73) — never per settlement; what it buys an author before any run is the wiring check (the subsection below). **Since v0.20 it may carry `examples`** — the subset's thirteenth keyword, an annotation held to the schema at construction ([ADR 0056](../doc/decisions/0056-an-example-is-an-annotation-validated-against-the-schema-it-sits-on.md)) — and the first example is what `scripts/check-workers.mjs` RUNS the worker on; with none, the generator's witness, and the verdict says which |
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
| `pool` | optional | the declared pool options: what a derivation returns (below) MINUS `config` and `groups`, which the type states beside it. A key inside it that is not one of those is refused (`UndeclaredKey`) |
| `groups` | optional | the POOL's group keys, every one in `groups`; the scheduler unions them with a node's own `workerGroups` (W58's measurement), and a pool naming a group the scheduler lacks acquires nothing in silence (P16 fact 2), so an unknown key is refused here (`NameMissing`) |
| `retryPolicy` | optional | the type's retry default for its nodes — `FD-V30`'s shape, held at construction naming the type, merged as v0.17 says: the node's own, whole; else the type's; else the driver's |
| `settings` | optional | settings DEFAULTS, a plain object merged UNDER a node's `settings` before the worker's `settingsSchema` is applied and before the envelope is built — decision 12, the one new field on a type. What a worker receives is the merged object |

**A node type is a DERIVATION from an instance's config to pool options** (decision 2), and the
document form above is the IDENTITY derivation: an instance's config merges shallowly over the
declared `config` (two plain objects merge key by key, the instance's winning; anything else, the
instance's replaces the type's when given), and `pool`'s fields and `groups` are copied as declared.
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
| `residentGroups` | optional, group keys or `{ key: cost }` | held for the WORKER's lifetime rather than per task |

A key is present only when the derivation has something to say — **a `groups` key is ABSENT when the
type declares none, not present and empty** — which is P18 fact 5's captured shape and what keeps
every pool built before this version equal to itself as CANONICAL JSON (prediction 2 — key order is what
today's literal happens to be and not a rule, and `test/definition/registry.test.ts` compares fact 5's
capture that way). A key beside the six, a
wrong type, a repeated group (in `groups` or in `residentGroups`), a zero cost, and a derivation that THROWS or returns a non-object are
each refused (`DerivationRefused`), naming the type or the instance. **A resident group beside
`idleTimeout: 0` is refused** (decision 9): a worker that never idles never releases a resident
group, and a second pool contending for it waits for ever — measured on 0.5.2 at P18's declaration
(fact 6), the scheduler reference's own sentence, reproduced to the field.

#### A pool instance, and a group

| key | | |
|---|---|---|
| `type` | required | for a pool, a node type's name (`PoolTypeMissing` otherwise); for a group, a group type's name — a built-in below, or one registered in `code.groupTypes` (`GroupTypeMissing` otherwise) |
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
| `KeyedRateLimitGroup` | `{ windows }`, as above | `new KeyedRateLimitGroup(windows, { id: key })` |

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
built-in `distinct` included — is a value of ONE public interface, `GateType` in `src/definition/types.ts`:

| member | |
|---|---|
| `routes` | every route the type may return — a non-empty list of distinct names, each in `FD-V16`'s charset. Every one must be wired by exactly one edge (`FD-V41`) |
| `defaultRoute` | one of `routes` — what an edge with no `route` carries. **Not necessarily the first** |
| `settingsSchema` | optional — what a gate's `settings` must satisfy, in the built-in subset; absent means UNCHECKED (P18 decision 3). `FD-V40` applies it |
| `fn(ctx)` | the decision, synchronous: handed `{ key, input, settings, memory }` — `settings.key` resolved over the value that reached the gate, that value, the gate's settings, and the gate's memory — and returning one of `routes`. **Called by the driver where a branch enters the gate, since v0.24** — and once more at `start()` for an ENTRY gate, against a throwaway memory, for `FD-R4` alone, so a type is the pure function of its context Q9 asks every decision to be |

**A type is CODE, not a document entry** — `fn` is a function, which a JSON registry cannot carry, so a
consumer registers their types in the driver registry's **`gateTypes`** (a `Map` or a plain object keyed
by name), the way a language adapter's `compile` is supplied in code. **Absent, the built-ins alone**: the
set only ever ADDS, and a consumer type named as a built-in is refused rather than merged (`NameCollision`),
exactly as a custom group type named as a built-in is. **`distinct` is registered THROUGH the interface**:
nothing in the validator, the wiring check or the driver names it; each reads the four members off
whatever type a gate names, and `distinct` is held to the same predicate as a consumer's
(`gateTypeProblem`), so the extension road is exercised the day it ships (P24 decision 2). **A driver is
handed the set as `DriverOptions.gateTypes`, and a runtime consumer as `RegistryCode.gateTypes`**, which the
runtime holds to `GateType` where it is built and hands every driver it starts or resumes as
`runtime.registry.gateTypes` — v0.24, [W93](../doc/work-items/w93-what-a-gate-does-in-a-run.md).

#### The schema subset

Every schema above is JSON Schema restricted to the thirteen keywords below — twelve that CONSTRAIN
and one ANNOTATION (`examples`, v0.20, [ADR 0056](../doc/decisions/0056-an-example-is-an-annotation-validated-against-the-schema-it-sits-on.md)) — the built-in subset
[ADR 0053](../doc/decisions/0053-the-schema-validator-is-a-built-in-subset-and-a-keyword-outside-it-is-refused.md)
chose over a 42 KB or a 262 KB dependency, at 1.5 KB bundled as fact 1's prototype and **4.2 KB as the
shipped module** (`src/definition/schema.ts` minified by esbuild at W65 — the diagnostics and the
construction-time check the prototype did not have), measured to cover 14 of 14 of the
plan's sample cases (fact 1). **A keyword outside it is REFUSED at construction naming the keyword,
never ignored** ([Q278](../doc/open-questions.md)): JSON Schema's own semantics ignore an unknown
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

An EMPTY schema `{}` is in the subset and accepts every value. Every keyword's VALUE has the shape
the table states, and a wrong one is refused as the keyword's misuse (`SchemaRefused`) before any
value is checked. What is NOT in the subset, and is refused rather than ignored: `pattern`, `format`,
`oneOf`/`anyOf`/`allOf`/`not`, `$ref`, exclusive bounds, `maxItems`, `uniqueItems`, and the
annotation keywords `title` and `description` — a consequence of the rule rather than a judgement
about annotations. **`examples` is the one annotation admitted, and it is admitted because it is
CHECKED**: an annotation the validator cannot hold to anything (`title`) would be the ignored kind
Q278 refused, and an example is held to its schema.

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
| `SchemaRefused` | a declared schema — any of a worker's four, a group type's, a class's — carries a keyword outside the subset or a keyword with a malformed value ([Q278](../doc/open-questions.md)); **or, since v0.20, carries an `examples` value the schema it sits on refuses** ([ADR 0056](../doc/decisions/0056-an-example-is-an-annotation-validated-against-the-schema-it-sits-on.md)) — the same class, because an example that refutes its schema is a defect of the DECLARATION, and the message says which kind |
| `UndeclaredKey` | the document, a worker, a node type, its `pool`, a pool instance or a group carries a key its kind does not declare; a section is not an object keyed by name; or `predicates` / `languages` is not an array of names |
| `NameMissing` | a predicate or language the document names and `code` does not supply (or a language whose adapter has no `compile`); a node type's declared group, or a group a derivation names, that `groups` lacks |
| `DerivationRefused` | a derivation throws or returns something that is not a `PoolSpec`; a `pool`, `inline`, `groups`, `retryPolicy` or `settings` field of the wrong shape; a resident group beside `idleTimeout: 0` |
| `GateTypeRefused` | **a registered gate type is not a `GateType`** (v0.23, W92): not an object, a key beside the interface's four, `routes` empty or repeated or outside `FD-V16`'s charset, a `defaultRoute` that is not one of them, a `settingsSchema` outside the subset, or no `fn`. **Checked by `checkRegistry` on EVERY call** — the built-ins are held to the same predicate whether or not the registry carries `gateTypes`, and a consumer's are checked beside them. *Gate types are code, so this row's fixtures both ways are in `test/definition/gate.test.ts` and not in `registry.test.ts` — the one exception to this section's opening sentence* |

**What the DRIVER reads of a resolved registry, and how `new Driver` relates to it.** The driver's
registry — `predicates`, `groups`, `workers`, `nodeTypes`, `pools`, `languages` — is DERIVED from the
resolved document and exposed by the runtime as `runtime.registry` (decision 14), so a consumer who
builds a `Driver` by hand passes the same shape the runtime does. Of a node type the driver reads
`worker` (to find the `settingsSchema`, `FD-V33`), `settings` (the defaults) and `retryPolicy`; of a
pool it reads its `type` (`FD-V38`); it constructs nothing and never calls a derivation. **A flow
references registry keys only, so a flow document is portable across runtimes that agree on keys**
(decision 10).

#### What the schemas buy an author — the wiring check — v0.21

**A worker's `inputSchema` and `outputSchema` were never for the run; they were for the AUTHOR** — a person
or an agent wiring a flow — so that a tool can say, before anything runs, whether what one node
produces is what the next one reads ([P19](../doc/plans/p19-what-a-schema-buys-an-author.md), the maintainer's argument of 2026-09-18; [W73](../doc/work-items/w73-the-wiring-check-a-verdict-per-edge-and-two-boundaries-validated-once.md)).
`checkWiring(registry, flow)` in `src/definition/wiring.ts` (exported from the root) reads the two schemas
through each task's TYPE's worker and gives EVERY ARC one verdict. What arrives on the producer side
of an arc is what `FD-C1`, `JP-R11` and `JP-R12` say the consumer receives, as a SCHEMA:

| arc | what arrives |
|---|---|
| `edge` | the producer task's `outputSchema` — section 3's ordinary edge |
| `branch` | what the fan-out received, the same value to every branch (`JP-R11`) |
| `item` | one element of the array the map received under `over` — the `items` sub-schema of the producer's property; a CLOSED producer (`additionalProperties: false`) whose schema never emits `over`, or any producer that calls it something other than an array, is `no`, which is `FD-R2` predicted before a run; an OPEN producer that says nothing about `over` is `unchecked` (it may emit it — the leniency, one row down). The sample is the example's array, and a transform on the branch task runs once PER ELEMENT |
| `record` | `JP-R12`'s record, at a join's successor — for a `fanout`, EXACT in its keys — every declared branch path a property of its arriving node's output, no other key — and REQUIRING none of them, because a branch that is lost has no entry and a branch is lost by three roads no document shows (an `optional` task failing, a person resolving a suspended task `failed` — `RS-R3`, `spec/join-policy.md` section 2 — or a policy firing before it settles), so a consumer REQUIRING a branch key is `no` (the safe direction: a `fits` the run can falsify is the unsafe kind); for a `map`, an object whose keys are branch paths minted at run time, each of the one branch's output shape. **The subset cannot write that** — measured at W73's declaration, `additionalProperties: <schema>` is refused by `schemaProblem` — so the check carries the record's shape itself and no author writes it; a declared input schema for a join successor is `{ type: object }` at best (P19 decision 8) |
| `needs` | `FD-C1`'s table composed: `"."` the arc's value, an id that node's output, `[id]` an array of it, a `?` an optional key — one object schema, and the same object as a sample; over a map's `item`, one composed object PER ELEMENT, evaluated per element as the run does (W73's adequacy reader found the first cut composing the whole array under the key and reading a correct wiring `transform-fails`). An ENTRY task's `needs` composes the run's payload and is NO ARC — `FD-R4`'s, below |

| verdict | means |
|---|---|
| `fits` | every value the producer's schema admits, the consumer's `inputSchema` accepts — P19 fact 3's relation over the twelve constraining keywords (`examples` is read by nothing, ADR 0056 rule 1), promoted from the declaration's harness verbatim, with its ONE stated leniency: a key the consumer describes and does not require, which an open producer does not name, is read as never emitted — because an author who leaves an output schema open means *there are keys I do not describe*, not *the keys you describe may hold anything* |
| `no` | it does not, and no transform is declared; the reason names the path and the keyword, in the words the twelve controls print (`$.confidence: consumer bounds maximum 1, producer declares no maximum`) |
| `transform-passes` | the consumer declares a `transform`; it is run by the language's WORKER half (imported by its URL, never an engine) on a SAMPLE of the producer side — the first declared `examples` entry, else the generator's witness (`src/definition/witness.ts`, P19 fact 5) — and every result satisfies the consumer's `inputSchema`. **The verdict names the sample's SOURCE and, where the producer is a region or a map, its ARITY** ([Q301](../doc/open-questions.md), [Q263](../doc/open-questions.md)): a transform's result changes type with the arity, and a witness is not a proof — a sample that passes is *the sample passed*, never *fits* (P19 prediction 2) |
| `transform-fails` | the transform threw on that sample, or its result fails the consumer's `inputSchema` — the message or the finding in the reason |
| `unchecked` | a side declares no schema (P18 decision 3, *absent means UNCHECKED*), a type, worker or language the registry lacks, or a transform with no sample to run on — named, never a throw, because a report is what an author reads |

**The relation is TOTAL**: every arc gets exactly one of the five, and none is *cannot tell* (P19
prediction 2) — including a region inside a `map` region, which the validator accepts and which
**since v0.22 the driver RUNS** ([ADR 0062](../doc/decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md),
[W84](../doc/work-items/w84-what-a-regions-identity-is.md), [Q160](../doc/open-questions.md)): the
record's sample keys take item index 0 for every enclosing map, which is a SAMPLE and was already the
right reading — *(this said the driver refuses it at construction and that a static check gives a
verdict where a run would not start; the first half expired when W84 lifted the refusal, and the
second was an argument for the sample rather than for the verdict, so the verdict stands and its
reason is now the one that survives)*. **A GATE is a PASS-THROUGH** (v0.23): what leaves it on any
route is exactly what reached it, so an arc through a gate is the arc INTO it, verdict and all — the
consumer after a gate is judged against what reached the gate, and a gate routing into a join carries its
branch's key into the record as the node before it would. A gate has no worker, so it is never a consumer.
*(Before W92 taught the check the kind, every arc after a gate vanished from the report and a gate routing
into a join dropped its branch's key — measured at W92's declaration step.)* **The ENTRY has no arc**: the run's payload reaches the entry task — or every branch task
of an entry region, recursively, or every route target of an entry GATE (v0.23: which one a run takes is
the gate's decision at run time, so the report lists them all) — with no worker in between, and that is `FD-R4`'s boundary, held at
`start()` (section 6). **What it costs to be wrong is what the check exists to find**: measured on the
shipped L6 corpus at W73's declaration, fourteen of fifteen task-to-task edges fit (the fifteenth had no
input schema to meet) and NINE arcs of the other shapes did not — seven of them one dropped bound
flowing through six map items and one `needs` — which P19 fact 3 could not see because it counted one shape. Held by `test/definition/wiring.test.ts`:
the twelve controls as fixtures, the wiring fixture corpus (section 7) with a positive case per
verdict, the L6 corpus's census as an EQUALITY (62 fit, 1 `no` — `map-no-array`'s `FD-R2`, predicted — 5
transform-passes, 2 transform-fails, 8 unchecked, every arc shape reached), and both enumerations
above held to this document both ways.

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
sequential fan-outs sharing one `end` is such a flow, it is [Q45](../doc/open-questions.md)'s shape,
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
5. **`FD-V19`, and therefore [Q27](../doc/open-questions.md).** Its condition is *a non-`end` node in
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
[Q4](../doc/open-questions.md) before W4 has run.

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
has exactly one, since `branch` is required, must name a node that exists, and must name a `task`.
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
| `FD-V4` | an edge's `when` names a predicate absent from the registry |
| `FD-V5` | **Nothing. Retired at v0.19 with `workerType`, and the id is now deliberately absent** — a held id with no rule behind it, so a gap in the sequence is not read as a rule someone lost ([ADR 0054](../doc/decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md), [W65](../doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md)). It refused *a `task`'s `workerType` that is not a key in the scheduler's `workerPools`*; since v0.19 a task names a node TYPE, whose default pool exists by construction, and the question this rule asked is `FD-V32`'s |
| `FD-V6` | a `join`'s `of` does not name a `fanout` **or a `map`**, or a `fanout` **or a `map`** has zero or more than one `join` naming it |
| `FD-V7` | a `task` node has no `edges`; or no edge of a `task` node is eligible for `done`; or, for some terminal state any of its edges opts into, the eligible edges for that state contain no edge lacking `when`, contain more than one, or the one lacking `when` is not last among them. **A `join` node** is rejected unless it has exactly one edge, carrying neither `when` nor `on` |
| `FD-V8` | an `end` node has `edges`, or its `outcome` is absent or empty |
| `FD-V9` | a `fanout` has fewer than two `branches`, has a repeated branch entry, has `edges`, or names a branch entry whose kind is not `task` |
| `FD-V10` | the graph contains a cycle |
| `FD-V11` | a node is not reachable from `entry` |
| `FD-V12` | a `fanout`'s branch entry, **or a `map`'s `branch`**, is its own `join` |
| `FD-V13` | a node whose kind is not `end` is in **both** `region(F)` and `after(F)` — a branch re-entering the path the join feeds |
| `FD-V14` | **deliberately absent.** The id is held so the gap is not read as a lost rule — see section 4 |
| `FD-V15` | **Nothing. Retired at v0.7, and the id is now deliberately absent** — a held id with no rule behind it, so a gap in the sequence is not read as a rule someone lost. It refused a `fanout` inside another fanout's region; nested fan-out is expressible since [W20](../doc/work-items/w20-what-a-nested-region-is.md), and the id is **retired rather than reused**. Whether a *policy* can serve a nested region is a different question with a different home — `spec/join-policy.md`, because `validateDefinition` is not given the policy |
| `FD-V16` | `flowId` or any node `id` does not match `^[A-Za-z0-9_-]{1,64}$` — the charset is [spec/task-id.md](task-id.md)'s, and this is where it is enforced |
| `FD-V17` | a node object, **an edge object**, or the document carries a key its kind does not declare |
| `FD-V18` | an edge's `on` is present and is not a non-empty array of distinct values drawn from `"done"` and `"failed"`. **`"user_action"` is refused** — it suspends rather than routes (ADR 0004 rule 3, [Q30](../doc/open-questions.md)) |
| `FD-V19` | a node whose kind is not `end` belongs to `branchOf(F, bᵢ)` for **two distinct** branch entries of the same `fanout`. Convergent branches make `branchPath` a property of the traversal rather than of the node, and P1 refuses them ([Q27](../doc/open-questions.md)) |
| `FD-V20` | a node outside `region(F)` has an edge to `F`'s join |
| `FD-V21` | a declared key holds a value of the wrong type **or outside its declared range** — `optional` not a boolean, `edges` not an array, `outcome` not a string, `version` not an integer or below 1, **`type`** or **`pool`** not a string (v0.17, v0.19; a `gate`'s `type` too, v0.23), and so on |
| `FD-V22` | a node in `region(F)` whose kind is not `end` has an incoming edge from a node that is neither in `region(F)` nor `F` itself. **The only way into a region is through the node that OPENED it** — its `fanout` or, since v0.8, its `map`. Section 4's *"where a rule says a fanout `F` it means whichever kind opened the region"* is scoped to that section, so this rider says it in the section where the rule lives |
| `FD-V23` | a **required key is absent** — a node without `id` or `kind`; a `task` without `edges` **or without `type`** (v0.19: `type` is required on every task node, and the *neither of two keys* clause v0.17 wrote here went with `workerType`); a `fanout` without `branches`; **a `map` without `over` or `branch`**; a `join` without `of` or `edges`; an `end` without `outcome`; **a `gate` without `type` or `edges`** (v0.23); an edge without `to`; or the document without `flowId`, `version`, `entry` or `nodes`. **`version` is required**, matching section 1 — an omitted version is one that silently means nothing |
| `FD-V24` | a node's `kind` is not one of `task`, `fanout`, **`map`**, `join`, `end`, **`gate`** (v0.23). **`kind: "decision"` is the case this exists for** — section 2 warns the author away from that word, and until v0.4 nothing rejected it |
| `FD-V25` | a `map` has `edges`; its `branch` names a node whose kind is not `task`; or its `over` is not a string matching `^[A-Za-z0-9_-]{1,64}$`. **The map's own rule, and `FD-V9` is unchanged** — each is about one node kind, because a rule about two kinds is the confusion [ADR 0036](../doc/decisions/0036-a-map-is-a-second-node-kind-and-a-branch-path-inside-one-is-a-property-of-the-dispatch.md) exists to remove. A map declares ONE branch, so `FD-V9`'s arity floor and repeated-entry clause have nothing to say about it and are not restated here |
| `FD-V26` | a `needs` — **on a node OR on an edge** — is not an object, is an empty one, has a key outside `^[A-Za-z0-9_-]{1,64}$`, or has a value that is not `"."`, a node id **with an optional `?` suffix**, or a one-element array holding one; **or is on an EDGE and uses `"."`**, which a predicate has no use for because `ctx.outcome` already carries what it would otherwise name (v0.12). **Section 3's grammar and nothing else** — where the reference POINTS is `FD-V27`'s and `FD-V28`'s. *"Only a `task` or a `map` may carry `needs`"* is **deliberately not a clause here**: `needs` is absent from the other three kinds' key lists, so `FD-V17` already refuses it and names the kind, and a second rule saying the same thing is one `FD-V17` could never disagree with |
| `FD-V27` | a `needs` reference names a node that does not exist, names a node whose kind is not `task` (**only a `task` produces an output** — section 2), or names a node **this node is not reachable from**. The last is what makes a reference a statement about the graph rather than a hope about the run: a reference pointing sideways or backwards names a node that may not have run, and without this the only thing to say so is `FD-R3`, at run time, on the one workload that takes that branch — which is ADR 0002 rule 3's own argument for validating at instantiation. **This rule is UNCHANGED at v0.13 and `FD-V29` is what finished the sentence**: reachability says *it is not upstream of you at all*, and *upstream and yet not certain* is a second question with a different fix ([Q187](../doc/open-questions.md)). Both apply to a conditional reference too — a `?` excuses a target that may not have run, never a target that does not exist, is not a `task`, or is not upstream |
| `FD-V28` | a `needs` reference's **form does not match the graph** — `"n"` where this node is outside a **`map`** region containing `n` (so `n` produces one output per ITEM), or `["n"]` where it is not (so `n` produces exactly one). **A `fanout` region is not this case**: `FD-V19` gives every node in one exactly one output, so the bare form is legal from outside it, and the rule's first version refused a valid document by asking *a region* where it meant *a map region*. **Its own id rather than a clause of `FD-V27`** because an author fixes the two differently: `FD-V27` is *that node cannot have produced anything for you* and this is *it produced a different NUMBER of things than you asked for*, and the message names the form to write instead. **The `?` suffix does not change which form is legal** and is stripped before this rule is evaluated (v0.13) — `FD-V28` asks *how many* and a conditional reference asks the same question |
| `FD-V29` | a `needs` reference in an **unconditional** form names a node that a run can reach the declaring node **without having run** — v0.13, [ADR 0042](../doc/decisions/0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md). **It is not dominance**, and that is the whole of the rule: the graph has two kinds of branching and dominance treats them the same — a `task`'s `edges` are **disjunctive**, exactly one being taken (section 3's routing rule 2), while a `fanout`'s `branches` and a `map`'s `branch` are **conjunctive**, all being entered before any dispatch (`JP-R5`). So a node is *certain* for a reader when it is on every path from `entry` to it **with a region's branch entries counted as certain for that region's join**, and a branch entry never dominates its own join. **Measured: over both corpora as they stood when this rule was decided (26 flows), of the 127 references `FD-V26`/`FD-V27`/`FD-V28` admit, dominance refuses 30 and this rule refuses 8** — a strict subset, over 7 distinct shapes, and **0 of the 6 references the corpora actually write**. **Its own id rather than a clause of `FD-V27`, on `FD-V28`'s own stated precedent**: `FD-V27` is *that node cannot have produced anything for you* and the fix is to re-point the reference; this is *it MIGHT not have* and the fix is to write `?`. **Its LIMIT is written into it, and it is the POLICY rather than any particular road**: *the join fired, therefore every branch entry settled* is a property of the policy, and `validateDefinition` is not given one (`FD-V15`'s note, [Q97](../doc/open-questions.md)) — so a policy that fires a join while a branch entry has **not settled**, for any reason at all, falsifies the credit. *(This clause said *"parked at `user_action`"*, and W45's conformity reader measured that parking is inessential: a policy satisfied on the first arrival, with the other branch entry simply **never settling**, dispatches the reader and `FD-R3` fires with no `user_action` anywhere. **The rule text was right and every enumeration of its limit named one road.**)* So this rule removes cases from `FD-R3`'s reach and does not replace it. Case: `spec/examples/invalid/FD-V29--reference-across-a-decision.flow.json` |
| `FD-V30` | a `task`'s `retryPolicy` is not **exactly** the scheduler's shape — v0.16, section 2: not an object; missing `maxRetries` or `backoffMs`; **carrying any key beside those two**; `maxRetries` not an integer >= 0; or `backoffMs` not a finite number >= 0. **Every clause is a measurement of what the scheduler does with the shape in silence** — `{}` means *no retries*, a string `maxRetries` retries by coercion, an extra key is dropped — and a definition may not mean something quietly. **Its own id rather than a clause of `FD-V21`, on `FD-V26`'s precedent**: the rule owns the key's whole shape because the fix is one row whichever clause fired. Case: `spec/examples/invalid/FD-V30--retry-policy-max-retries-is-a-string.flow.json`, the coercion case, because it is the one the scheduler gets *wrong* rather than merely quiet about |
| `FD-V31` | a `task`'s `workerGroups` is not a **non-empty array of distinct strings every one of which the registry's `groups` set declares** — v0.16, section 2. **The registry set is EMPTY when absent**, so a document declaring any group is refused against a registry that says nothing about groups; the alternative reading was priced and refused. The rule exists because the scheduler runs a task whose group id it does not know **as if the group were not there** — no throw, no `resource.blocked`, `done` — so the name is caught nowhere downstream (ADR 0002 rule 3, `FD-V5`'s shape). An empty array is refused for `FD-V26`'s empty-`needs` reason, and a repeat because the scheduler's own source unions a task's groups with its pool's through a `Set`, so a repeat is dropped in silence — **read from the published build, not measured**, which is the one clause here whose provenance is the source rather than a run (W58's conformity reader). Case: `spec/examples/invalid/FD-V31--worker-group-not-in-registry.flow.json`, against `spec/examples/registry.json`, which deliberately omits the id it names |
| `FD-V32` | a `task`'s `type` names **no registered node type**, or names one **whose `worker` the registry's `workers` does not declare** — v0.17, section 2; the second clause v0.19's. The registry's `nodeTypes` and `workers` are each **EMPTY when absent**, on `FD-V31`'s reading. **Two clauses under one id** because both mean *this node cannot run* and the fix is the registry either way; the second is reported only when the first passed. *(v0.17's second clause — a registered type with no POOL of its name — has no instance since v0.19: every type has a default instance, built from its own config, and a registry whose type names a missing worker is refused at construction by name too, `WorkerMissing`.)* Case: `spec/examples/invalid/FD-V32--type-not-in-registry.flow.json`, against `spec/examples/registry.json`, which deliberately omits the name |
| `FD-V33` | a `task`'s `settings` is **not a plain object**, or the type's worker **`settingsSchema` refuses the effective settings** — the type's `settings` defaults merged UNDER the node's, `{}` when neither declares anything — by any finding of the built-in subset (ADR 0053), the detail naming the path and what failed there (`required`, `not declared`, `expected number`, `below minimum 0`); **a schema outside the subset is reported here and never applied**. v0.17, section 2; the schema in place of v0.17's validator function since v0.19. **Its own id rather than a clause of `FD-V21`, on `FD-V30`'s precedent**: the rule owns the key's whole shape because an author fixes both clauses in the same place. Case: `spec/examples/invalid/FD-V33--settings-the-type-refuses.flow.json`, against the corpus worker `scorer`'s `settingsSchema` in `spec/examples/registry.json` — `factor: "ten"` where the schema says a number |
| `FD-V34` | **Nothing. Retired at v0.19 with `workerType`, and the id is now deliberately absent** — a held id with no rule behind it ([ADR 0054](../doc/decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md), [W65](../doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md)). It refused the typed and untyped halves *mixed* on one `task` — `type` beside `workerType`, a `workerType` naming a type, `settings` on a node with no `type` — and with one road there are no halves to mix: `workerType` is `FD-V17`'s undeclared key, and a node with no `type` is `FD-V23` |
| `FD-V35` | a typed `task`'s `transform.lang` names **no registered language** — v0.18, section 2's `transform` subsection. The registry's `languages` set is **EMPTY when absent**, on `FD-V31`'s reading: a definition declaring any transform against a registry that says nothing about languages is refused, because the alternative — absent means *unchecked* — would carry the name to a wrapper that meets it with nothing to evaluate it and fails every task of the node. Reported alone; `FD-V36` is not asked of a language that does not exist. Case: `spec/examples/invalid/FD-V35--transform-language-not-in-registry.flow.json`, against `spec/examples/registry.json`, which deliberately omits `jsonata` |
| `FD-V36` | a typed `task`'s `transform.expr` is **refused by the named language's `compile`** — v0.18, section 2. The registry half of an adapter is a synchronous compiler that THROWS on an expression it refuses (P17 fact 2: JSONata throws `S0203` at position 12 for `$sum(*.score`), so the refusal is decided at `new Driver` rather than on the one workload that reaches the node — ADR 0002 rule 3's whole argument, and the reason the adapter's compile is required to be synchronous. The detail is the language's own message, with its `position` and `code` where it sets them. A `compile` that is not a function is the REGISTRY's mistake and is refused at construction naming the LANGUAGE, as a non-function settings validator is under `FD-V33`. **What this cannot see**: `$eval` re-compiles at run time, so a syntax error inside it lands as a task failure ([Q265](../doc/open-questions.md)). Case: `spec/examples/invalid/FD-V36--transform-the-language-refuses.flow.json`, against the fake language `path`, whose grammar refuses `$sum(*.score` |
| `FD-V37` | a `transform` is **not exactly `{ lang, expr }`** — not an object, missing either key, either not a string, or carrying any other key. v0.18, section 2. A key beside the two would be read by nothing (`FD-V30`'s reason). *(v0.18's other clause — a transform on a `task` with no `type` — has no instance since v0.19: every task node is typed, the wrapper fronts every pool, and a node with no `type` is `FD-V23` with the transform's own clauses still applied beside it.)* Case: `spec/examples/invalid/FD-V37--transform-not-lang-and-expr.flow.json` |
| `FD-V38` | a `task`'s `pool` names **no registered pool instance**, or names an instance **of another type than the node's** — v0.19, section 2, [ADR 0054](../doc/decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md). The registry's `pools` is **EMPTY when absent**; the type's own name is the default instance and is accepted; a non-string `pool` is `FD-V21`; and the rule is asked only once the type is registered (`FD-V32` first). **Its own id rather than a clause of `FD-V32`** because the fix is different: `FD-V32` sends an author to the registry's types, this to its instances or to the node. Case: `spec/examples/invalid/FD-V38--pool-not-an-instance-of-the-type.flow.json`, against `spec/examples/registry.json`, whose `scorer-fast` is an instance of `Scorer` named by a `ScoreWorker` node |
| `FD-V39` | a `gate`'s `type` names **no registered gate type** — none of the built-ins and none the registry's `gateTypes` adds — or names one that **is not a `GateType`**, or one **registered twice** (a built-in and the registry's) — v0.23, section 2's `gate` subsection, [ADR 0066](../doc/decisions/0066-a-gate-is-a-decision-with-memory-that-names-a-registered-type-and-wires-every-route-exactly-once.md). **Two readings of one fix**, on `FD-V32`'s precedent: the name or the registry. A malformed or colliding type is the REGISTRY's mistake and is refused at construction by name (`GateTypeRefused`, `NameCollision`); reached here directly, it is reported on the gate that names it, as `FD-V36` reports a `compile` that is not a function. Case: `spec/examples/invalid/FD-V39--gate-type-not-registered.flow.json` |
| `FD-V40` | a `gate`'s `settings` is **not a plain object**; its **`key` is not a KEY PATH** — dot-separated object keys, each in `FD-V16`'s charset, no index, no wildcard, no expression (P24 stop-and-ask (d)) — checked on every gate that declares `key`, because the library resolves it; or its type's **`settingsSchema` refuses** the settings, `{}` when absent, asked once `FD-V39` passed. v0.23. **Its own id rather than a clause of `FD-V33`**, whose subject is a node TYPE's worker: an author fixes this in the gate's own settings, and the key grammar is the library's rather than a schema's — the subset has no `pattern`. Case: `spec/examples/invalid/FD-V40--gate-key-path-with-an-index.flow.json` — `files[0].series` |
| `FD-V41` | **the `route` key and a gate's wiring** — v0.23: a gate's edge **names a route its type does not declare**; a route the type declares has **no edge** or **more than one**, an edge with no `route` counting for the DEFAULT route and never for every route (both asked once `FD-V39` passed — a document alone cannot know a type's routes); a gate's edge carries **`when`, `on` or `needs`**, or a `route` that is not a string; or **an edge of any node that is not a `gate` carries `route`**. **One rule owns the key on every edge**, `FD-V26`'s precedent for `needs`, so `FD-V17`'s key table does not move; and a gate's edge carrying only `to` and `route` is `FD-V7`'s precedent for a join's edge carrying neither `when` nor `on`. **Why every route is wired rather than a drop being an omission**: a route a type grows later would be dropped in silence by every flow that had omitted it (P24 decision 4). Case: `spec/examples/invalid/FD-V41--a-declared-route-with-no-edge.flow.json` — `distinct`'s `duplicate` unwired |

**`FD-V19`'s second clause is derived rather than stated.** *"One branch entry is reachable from
another"* needs no rule of its own: `FD-V9` requires every branch entry to be a `task`, and a branch
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
live outside the region ([Q23](../doc/open-questions.md)); `FD-V19` and `FD-V22` are
[Q27](../doc/open-questions.md). All were stated as refusals rather than left undefined so that
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
| `FD-R3` | **an UNCONDITIONAL** `needs` reference names a node and **no output of that node is on this node's branch path**. Reported as an `UnresolvedReference` naming the declaring node, its branch path, the key and the target. **Since v0.13 the decision-routed-around case is `FD-V29`'s and is refused at instantiation**, and what is left is the two things a validator provably cannot see, both measured rather than argued: (a) **a reader whose branch path is comparable with none of the target's**, which needs no policy at all — two `map` regions of different arity, `reference-past-a-map-arity.flow.json`, where `FD-V29` correctly says the target ran and the third instance of the second region can see neither output of the first; and (b) a join **policy** firing before a branch entry has SETTLED — for any reason, parking at `user_action` being one and a branch entry that has simply not settled yet being another — which `validateDefinition` cannot know about because it is not given the policy (`FD-V15`'s note, [Q97](../doc/open-questions.md)). *(This clause read *"parked at `user_action`"*, as did four other statements of the same limit, and W45's conformity reader measured that parking is inessential: a policy satisfied on the first arrival, with the other branch entry never settling, dispatches the reader and this rule fires with no `user_action` anywhere. `test/driver/needs.test.ts` asserts it under a constructed policy, with a shipped-policy control beside it.)* **A CONDITIONAL reference never reaches this rule** — `FD-C4` is what it does instead. **AND v0.15 REMOVES (a), which leaves (b) as the only road.** [ADR 0044](../doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md) makes a reader in a SIBLING region see **all** of the target's outputs, so *comparable with none of the target's* has no instance there — the case (a) names was the sibling road, and it was `FD-C1`'s defect rather than a fact about what a validator can see. **So this rule now has exactly one road that a shipped policy can reach, and it is the POLICY one** — which is `FD-V29`'s own history one version on: that rule removed the decision case and this removes the arity case, each leaving the backstop narrower. *(The removal landed with the DRIVER, in **W50**: `reference-past-a-map-arity` resolves at every arity pair now, and this rule's remaining road is the policy one — [Q218](../doc/open-questions.md).)* *(Before v0.13 this row read *"a decision routed around it, or it settled `user_action`"* and said *"no validator rule could have seen this"*. **The first clause was `FD-V29`'s all along and the sentence was the argument against looking**; the second half is (b), and (a) was in neither. W45.)* **`FD-V27` has already checked that this node is reachable FROM the named one** and `FD-V29` that it must have run, which together are everything the graph can say. **Why its own class and not `UnresolvedMapArity`**: that one says *the previous node did not return an array*, which is a WORKER's bug, and this says *the node you named did not run on your path*, which is the FLOW's shape, and the two send a reader to different places. Reported through `OR-R10` from a listener, and reported **and rethrown** from `resolve()`, which is caller-initiated. **Not from `start()`, and that is a property of `FD-V27` rather than of this rule**: `start()` composes only the entry node, and a reference from the entry node names a target the entry node must be reachable from — which with `FD-V11` makes the entry reachable from it, and that is an `FD-V10` cycle. So the `start()` road is refused at instantiation and has no case. *(This row said `start()` and `resolve()`, and the test named for it asserted neither. W41's conformity reader, and it is `FD-R1`'s own *test that cannot be built* one section up.)* Test: `test/driver/needs.test.ts` | **[W41](../doc/work-items/w41-what-a-node-can-reach-and-what-names-it.md)** |
| `FD-R4` | **the run's PAYLOAD fails the `inputSchema` of a task it reaches with no worker in between, at `start()`; or a PERSON's `done` resolution fails the parked node's worker `outputSchema`, at `resolve()`** — v0.21, [P19](../doc/plans/p19-what-a-schema-buys-an-author.md) decision 5, [W73](../doc/work-items/w73-the-wiring-check-a-verdict-per-edge-and-two-boundaries-validated-once.md). Once per run and once per human action, NEVER per settlement (per-settlement validation of a worker's result is OUT of P19 as a default). **A REJECTED COMMAND and not a terminated run — the one row of this table whose heading clause does not hold, and it says so**: thrown at the caller as `BoundaryRefused` (naming the boundary, the node, the worker, the task where there is one, and every finding), NOTHING appended, nothing reported through `OR-R10`. At `start` it is thrown before the driver counts itself started, so a corrected payload starts the same driver (`ID-R3` sees nothing, because nothing ran); at `resolve` the task is still suspended and a corrected value resolves it — `RS-R1`'s own reading, *it came from outside and a caller can retry* — and the worker's declared example is a value a person can supply (ADR 0056 rule 3). A boundary that STOPPED the run would turn a typo in a human's value into a dead run, the opposite of what the schemas are for; the maintainer's choice at W73's stop-and-ask 2. **The targets at `start` are the wiring check's own walk** (`boundaryTargets`, one derivation, two callers): the entry task, or every branch task of an entry fan-out recursively over the same value, or a map's branch task once per element of the array under `over` (a non-array is `FD-R2`'s, as before) — each value composed through the node's `needs` as `enter` composes it (at an entry only `"."` can be named, `FD-V27`, and an entry `map`'s own `needs` is composed the same way before `over` is read). A `done` resolution with no `result` is held as `null`, which is what the record stores for it (`RS-R2`). A worker declaring no schema on that side is UNCHECKED (P18 decision 3); `DriverOptions.validateBoundaries: false`, forwarded by `createRuntime`'s `RuntimeOptions`, turns both off. **Measured before the rule was written** (W73's declaration, fact D): 0.47-1.28 µs per check on every corpus payload and resolution, 0.35 ms at the walking worst case (a 1000-item array under a schema that walks items), against ~100 ms per real run at L6. Test: `test/driver/boundary.test.ts` at L2 — a task entry, a fan-out entry naming the refusing branch, a map entry refusing one item, an entry composing `"."`, the resolve boundary with the task still suspended and then resolved on the declared example, both switches, and the runtime forwarding — and `examples/l6.ts` on real workers in both runtimes: an entry payload refused with NOTHING dispatched to the scheduler and the row's run then started beside it, and a person's resolution refused and then accepted on the SAME driver. **The same-driver half of the start boundary is L2's alone**: `createRuntime`'s `start` builds a driver and starts it in one call, so a refused driver is a value no caller of the runtime holds (W73's adequacy reader, f1 — [Q307](../doc/open-questions.md)) | **W73** |
| `FD-R5` | **a GATE's type returns a route it does not declare** — v0.24, P24 decision 8, [ADR 0067](../doc/decisions/0067-a-gate-runs-in-the-driver-its-memory-is-the-drivers-and-its-decision-is-recorded.md), [W93](../doc/work-items/w93-what-a-gate-does-in-a-run.md). The counterpart of `FD-R1`, and like it unreachable at load: `FD-V41` wires every route the type DECLARES, and a route nobody declared has no edge to be wired by — only running `fn` reveals it. Reported as an `UndeclaredRoute` naming the rule, the run, the gate, its type, what was returned and the routes the type declares, through `OR-R10` (reported from a listener; reported AND rethrown from `start()` and `resolve()`, which are caller-initiated), **with nothing recorded for the gate** — no `gated` element, because no route was taken. **A type whose `fn` THROWS is not this rule**: the run stops with the thrown error as it is, a throwing decision predicate's road, measured at W93's declaration step. Test: at ladder L2, a type returning an undeclared string, a number and nothing, each from a gate after a task — stopped, one report of kind `UndeclaredRoute` naming the rule, the gate and the type, no `gated` element and nothing past the gate dispatched — and from an ENTRY gate, where `start()` rethrows it; and a type that throws, from both roads, stopping with its own error | **[W93](../doc/work-items/w93-what-a-gate-does-in-a-run.md)** |

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
| `map-with-context.flow.json` | **[Q166](../doc/open-questions.md)'s flow** — *score each item against the run's config*. A map instance that receives its own item **and** the value the map node received, through `needs: {"item": ".", "run": "ingest"}`. v0.11 |
| `map-over-region-output.flow.json` | **[Q165](../doc/open-questions.md)'s flow** — *score, then fan out over the scores*. A `map` whose `over` names a key `needs: {"scores": ["score"]}` composed from a whole map region's output, **with no `over: "0"` and therefore no coupling to branch numbering**. v0.11 |
| `decision-on-an-earlier-step.flow.json` | **[Q8](../doc/open-questions.md)'s own flow, carried in that row since P1** — *route to review if an earlier step flagged low confidence*. An **edge** declares `needs: {"earlier": "ingest"}` and its predicate answers on a node it does not sit on, **with the worker's payload unchanged**. v0.12 |
| `map-in-fanout.flow.json` | **a map region nested inside a static one** — the shape that shows the outer `branchPath` prefix is still derived while only the map's own segment is supplied at run time |
| `reference-if-it-ran.flow.json` | **[Q187](../doc/open-questions.md)'s flow** — *route to review if an earlier step flagged it, and publish either way*. `publish` declares `needs: {"own": ".", "verdict": "review?"}`, so the key is **present on the review road and absent on the other** and both roads complete. Written unconditionally the same document is `FD-V29`, which is the whole of what the suffix is for. v0.13 |
| `reference-past-a-map-arity.flow.json` | **the document that KEPT `FD-R3` reachable with no custom policy, until v0.15** — two **sibling** `map` regions over different keys, and `publish`'s `needs: {"scored": ["score"]}` names a node `FD-V29` correctly calls certain. Every instance of `rank` beyond `split`'s arity HAD a branch path comparable with **none** of `score`'s outputs, which is the half `FD-V29` cannot see: *did it run* and *is it on your path* are two questions. **And within the arity it exposes the other half of the same fact** — the array holds the ONE index-matched output rather than all N, which is the note under section 3's reference table and [Q206](../doc/open-questions.md), not something this flow introduces. **BOTH halves are what v0.15 removes, and the opening sentence of this cell is what it costs**: [ADR 0044](../doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md) makes `publish` see all N at every arity pair, so **this document no longer keeps `FD-R3` reachable** and what it demonstrates instead is the fix — every instance receives all N at every arity pair, asserted at L2. *(The opening sentence is the record of what it was FOR, and it is what its removal cost: `FD-R3` now has one road and it needs a join policy `validateDefinition` is not given ([Q218](../doc/open-questions.md)). This cell asserted both halves in the present tense at once, which W49's conformity reader caught, and W50 is where the second became true.)* v0.13 |
| `sibling-fanouts.flow.json` | **the case neither corpus contained, and the one that shows the defect was never about a `map`** — two sequential `fanout` regions, with **both** branches of the second declaring `needs: {"own": ".", "first": "scoreA1"}` against branch 0 of the first — and the two branch entries of the FIRST region declare different worker types. **This document is validated at L4 and never RUN**, so nothing here observes a result; the two roles are here so that its L6 counterpart, `examples/flows/sibling-fanouts.flow.json`, can tell which branch a reader received. **The two are separate documents against separate registries and they DIVERGE at that node** — `ReviewWorker` here, `TallyWorker` there, because the corpus registry has no worker whose result differs from `ScoreWorker`'s and is not a failing role. W51's rule 8 set graded *both branches return the same thing* a SURVIVOR at zero, and W51's conformity reader found this sentence claiming the fix where nothing runs. Under the prefix rule `publishB1` at path `0` resolved and `publishB2` at path `1` **stopped the run** at `FD-R3`, on a document validating with **zero findings** whose target `FD-V29` correctly calls certain — no arity, no `map`, and the branch the author wrote the reference in deciding whether the run completed. **The two branches are a discriminating PAIR and their difference is asserted rather than left to a literal** (`doc/workflow.md` section 5 rule 8's fourth requirement on the set). Built by [W49](../doc/work-items/w49-what-a-reference-across-sibling-regions-means.md), which could not add it — a corpus flow is validated at L4 AND RUN, and until the resolver followed it was a valid document whose run stopped. v0.15 |
| `task-config.flow.json` | **what a node says about its own task, in all three shapes** — v0.16, [W58](../doc/work-items/w58-what-a-node-says-about-its-own-task.md). `retryPolicy` and `workerGroups` on a top-level task (`ingest`), on a task inside a `fanout` branch (`scoreA`, with `scoreB` declaring neither so the two branches differ), and on the **branch task of a `map`** (`rank`), where both are per INSTANCE — the shape the feature was not built for, and `doc/workflow.md` section 5 rule 8 obligation (a)'s v0.16 clause is why it is here rather than only in a unit test. Names both of `registry.json`'s groups, `gpu` and `api`, one node naming both. **Validated at L4 and never RUN**: its `MergeWorker` is the corpus's, and what a real run of a retry looks like is `examples/flows/retry.flow.json` and `group.flow.json` at ladder L6 |
| `typed.flow.json` | **a node TYPE, in all FOUR shapes `FD-C5` enumerates** — v0.17, [W59](../doc/work-items/w59-what-a-node-type-is.md). `type: "Scorer"` on the top-level entry (`ingest`, declaring **no** `settings`, so the `{}` default the validator sees is in the corpus), on the **branch task of a `map`** (`rank`, `settings: { factor: 100 }` — per INSTANCE, the envelope wrapping each instance's own item under `JP-R11`), on a task inside a `fanout` branch (`scoreA`, `settings: { factor: 10 }`, beside `scoreB`, a `ScoreWorker` — a former bare pool, a type like any other since v0.19 — so two types sit in one region), and on a **join's successor** (`publish`, `settings: { factor: 1 }`, whose `input` is `JP-R12`'s collection — the fourth kind, which no suite instantiated until W59's adequacy reader found a driver handing it `{}` cost zero). `Scorer` is a document-declared type in `registry.json` whose worker `scorer` carries the `settingsSchema` `FD-V33` applies and whose `settings` defaults (`factor: 1`) merge under each node's — so the entry's absent settings are the defaults road, in the corpus (v0.19). **Validated at L4 and never RUN**: what two typed nodes of one type with different settings do on real workers is `examples/flows/typed.flow.json` and `typed-regions.flow.json` at ladder L6 |
| `pooled.flow.json` | **a node on a NAMED pool instance of its type, and one on the default by name** — v0.19, [W65](../doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md). `score` is a `Scorer` on `pool: "scorer-fast"`, an instance `registry.json` declares under `pools` with its own config merged over the type's; `publish` is a `Scorer` on `pool: "Scorer"`, the default instance stated explicitly, which `FD-V38` accepts. The pair `FD-V38` refuses is `spec/examples/invalid/FD-V38--pool-not-an-instance-of-the-type.flow.json`, the same instance named by a node of another type. **Validated at L4 and never RUN** |
| `transformed.flow.json` | **a TRANSFORM, on all FOUR shapes `FD-C5` enumerates** — v0.18, [W61](../doc/work-items/w61-what-a-transform-is.md). `transform` in the fake language `path` on the top-level entry (`ingest`, `document`), on the **branch task of a `map`** (`rank`, `confidence` — its own item under `JP-R11`), on a task inside a `fanout` branch that declares `needs` (`scoreA`, `run.config` — what `needs` composed, the kind `typed.flow.json` does not carry), and on a **join's successor** (`publish`, `$settings.factor` — reading the binding rather than the collection, so the corpus shows `$settings`). `path` is in `registry.json` under `languages` and resolves to the test fixture's adapter in `test/definition/corpus-types.ts`, as `Scorer`'s validator does. **Validated at L4 and never RUN**: what a transform does on real workers is W63's exit artifact |
| `gated-map.flow.json` | **a GATE, v0.23** — [W92](../doc/work-items/w92-what-a-gate-is.md). The maintainer's ingest (P24): a `map` over `files` whose one branch identifies each file and reaches `dedupe`, a `distinct` gate keyed by the KEY PATH `series.id`, whose DEFAULT route (an edge with no `route`) opens the per-series `setup` and whose `duplicate` and `nokey` routes DROP to two `end` nodes inside the region, one per route so the graph stays local. Every route wired exactly once. **Validated at L4, and RUN at L2 since v0.24**: `new Driver` refused a flow holding a gate until W93, and `test/driver/needs.test.ts` asserted THAT refusal on this document where it runs every other region-bearing one — so W93's lift failed that assertion on its first run, and the document joined that census as a row. What a gate does on real workers is W94's exit artifact |

**This table and the directory are compared BOTH WAYS, and that is v0.8's addition rather than a
restatement.** `test/definition/l4-corpus.test.ts` asserts the set of `.flow.json` files in
`spec/examples/valid/` equals the set of filenames in this table — **equality, not a floor**, for
`S12`'s reason in `scripts/check-source.mjs`: a floor answers *are there at least N* and goes stale
in the direction of weakness ([Q102](../doc/open-questions.md)), while an equality fails both when a
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
L4 corpus's `corpus://` workers declare no schemas ([Q300](../doc/open-questions.md); the maintainer's choice at
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
