# P25 — What a ROUTE guarantees about the value it carries

**Status:** **DECLARED** 2026-09-29 on `787d8fc` ([W98](../work-items/w98-what-a-row-may-assert-about-a-dispatch-order.md),
pushed), with P1-P24 complete and retro'd, `doc/workflow.md` [v0.25](../workflow.md), and three items outside
any plan since P24's retro ([W96](../work-items/w96-the-counts-and-the-index-a-check-can-compare-and-q394.md),
[W97](../work-items/w97-obligation-f-across-ladder-l6.md), W98) all DONE. **Both stop-and-asks ANSWERED the
same day, each as recommended** — see below. Its facts were measured into `dev-dist/p25/` on that tree and
**nothing there is checked in**, on P22 stop-and-ask (a)'s precedent, so each item's declaration step
RE-RUNS them (P15 decision 5).

**Question this plan answers:** *What does a gate's ROUTE guarantee about the value it carries — and what
must its KEY PATH satisfy for that guarantee to exist at all?*

**Exit artifact:** an **authoring session a human can watch**, executed by `npm run gate` on
[W74](../work-items/w74-the-assists-and-the-exit-artifact.md)'s precedent: a gate flow whose key path is
misspelled, named by the check before anything runs; the spelling corrected; the per-series consumer's arc
going from a **false `no`** to `fits` because the route now says the key resolved — and, at ladder L6, the
clause `examples/l6.ts` has carried since W94 asserting that false `no` **going red and being replaced by
its opposite**, in both runtimes, where L6 MOVES.

## Why this plan, and why now

[Q391](../open-questions.md) is the only open row that says a tool this repository ships gives a **wrong
answer about a correct flow**. P19 built the authoring surface to answer *what does a schema buy an author*;
P24 added the sixth node kind; and `checkWiring` reads a gate as a **pass-through**, so the arc through one
is judged as the arc INTO it. On P24's own exit artifact that produces `consumer requires "series", producer
does not guarantee it` for a flow that completes three times in both runtimes — because `distinct` routes a
branch `first` **only where the key resolved**, so the run cannot deliver the value the verdict fears.

W94 asserted that false `no` rather than hiding it, and wrote down the condition for this plan in its own
comment: *"the day the check learns a route's guarantee, this clause is red and names the rows."* This plan
is that day.

**And measuring it found a second gap nobody had raised** — fact 7 below. The first half is a tool that says
`no` where it should say `fits`; the second is a tool that says **nothing** where a flow will quietly do
nothing. They are one subject, because the key path is what MAKES the guarantee: a route can only promise
that a path resolved if the path is one the producer emits.

## What the design settled, and how

**Both stop-and-asks went to the maintainer with the alternatives priced, and both came back as
recommended.**

| | Answer | What it rules out |
|---|---|---|
| **(a)** How a route's guarantee reaches the check | **The TYPE declares it** — `GateType` gains an OPTIONAL per-route guarantee, so a consumer's own gate type gets what `distinct` gets. **ADR 0068.** | *Deriving it for `distinct` alone* — cheapest, fixes Q391 today, and leaves every consumer type a pass-through forever while the check knows a semantics nobody can tell it. *Reporting `unchecked`* — gives up the class, and overloads a word that today means *I could not read a schema* |
| **(b)** Where a wrong key path is caught | **A wiring VERDICT.** `checkWiring` says the key path is not described by what reaches the gate; a producer that declares no schema, or an OPEN one that says nothing, is `unchecked` rather than a false alarm | *An `FD-V` refusal at construction* — earliest and strongest, but the validator reads no producer schema today and it would refuse flows whose producer declares none. Named as a follow-on with its own measurement, not taken here |

**What that makes the change**: additive in both halves. `GateType`'s new member is optional and
`Registry.gateTypes` already is, so nothing a consumer wrote stops compiling — **measured, fact 5** — and a
new verdict reason is a string an author reads. **The package does not move**, which is the third
stop-and-ask this plan does NOT need to ask.

## What was measured before this plan is declared

Nine facts, on `787d8fc`, by `dev-dist/p25/facts.ts`, `facts2.ts`, `facts3.ts` and `proto.py`/`proto2.py`.
Every rung RUN and its exit code read; the prototype in an **isolated copy** (`git clone --no-hardlinks` +
`node_modules` COPIED, **4803 entries scanned, ZERO links or reparse points**, all five typecheck lanes green
before use) and **restored byte-for-byte**.

| | Fact | Scope it was measured at |
|---|---|---|
| **1** | **Q391 REPRODUCES exactly.** 28 flow documents, **89 arcs, 2 `no`** — `map-no-array`'s deliberate `FD-R2`, and `tv-ingest`'s `identify -> setupSeries: $: consumer requires "series", producer does not guarantee it` | `examples/flows` against `examples/registry.json`, which is that corpus's own registry and L6's |
| **2** | **A gate is never a PRODUCER in the report.** Arcs whose producer is a gate: **0, by construction** — the check names the node BEFORE the gate, so the verdict's own `producer` field points at something that is not the last thing to touch the value. *Q391 from the other side, and it is why the arc is judged as the arc into the gate* | The same 28 flows; read off `WiringVerdict.producer` |
| **3** | **The check cannot see a gate's type AT ALL.** `WiringRegistry = Pick<Registry, 'workers' \| 'nodeTypes' \| 'languages'>` and `src/definition/wiring.ts` contains **zero** occurrences of `gateTypes`. So it cannot know what routes exist, what the default is, or what any of them mean | The shipped type and one grep |
| **4** | **The guarantee is EXPRESSIBLE, and the producer already describes the path.** `identify`'s `outputSchema` describes 7 paths including `$.series` and `$.series.id`. What is missing is that they are not **required** — and the `first`/default route is exactly the condition under which they are | `pathsOf` over the producer's own schema |
| **5** | **Widening `WiringRegistry` with `gateTypes` costs ZERO.** `Registry.gateTypes` is optional, so the widened `Pick` is **exit 0, 0 TS errors on all five typecheck lanes**, restored byte-for-byte. *The surface change is free and the whole cost is the derivation* — P20's *the half-fix is free* shape, in the direction that helps | The isolated copy, `npm run typecheck` RUN and its exit code read |
| **6** | **The derivation WORKS.** Prototyped: the gate arc carries its ROUTE, the check is handed `gateTypes`, and on a route that means *the key resolved* the arrival's schema gains `required` along the key path. **The corpus goes 2 `no` → 1**, the survivor being `map-no-array`'s deliberate one; **typecheck 0 errors**; **+1587 bytes**; and **every other verdict is unmoved** (13 `unchecked`/`transform-*` lines identical) | The isolated copy, `distinct`'s resolved routes HARD-CODED — so it measures the derivation's VALUE, not the declaration's shape, which is (a)'s |
| **7** | **A WRONG key path is caught by NOTHING.** A typo (`sereis.id`), a path the producer does not emit (`series.slug`) and a nonsense one (`name.id`, where `name` is a string) each give `validateDefinition` **0 findings** and `checkWiring` verdict counts **identical to the correct flow**, with **not one verdict mentioning a key, a gate or a route**. Only an EMPTY key is refused, by `FD-V40`'s shape clause — *the grammar catches an absent key and nothing catches a wrong one*. *(**RE-TAKEN at [W100](../work-items/w100-what-a-key-path-must-satisfy.md)'s declaration step on the tree W99 SHIPS, where the COUNTS half no longer holds**: `series.slug` is still 4 fits / 0 `no` like the correct flow, and `sereis.id`, `name.id` and the absent key are 3 / 1 — because W99's refinement adds `required` for a step it cannot describe, so the arc reads [Q391](../open-questions.md)'s own string back. The row's CONCLUSION is unmoved and sharper: still not one verdict mentions a key, a gate or a route, and the worst of the three is the one whose counts DO match.)* | Constructed from `tv-ingest`, five keys, read-only on the live tree |
| **8** | **The assists are UNAFFECTED and the subject is `checkWiring` alone.** `pathsOf`, `describePaths`, `tryTransform`, `tsTypeOf`, `signatureOf` and `signaturesOf` every one take a SCHEMA or a worker entry, never a flow — so no gate reaches them | Their six signatures in `src/definition/assist.ts` |
| **9** | **A DECISION's guard is OUT, for a structural reason rather than on scope.** A predicate is an opaque registered function ([ADR 0002](../decisions/0002-a-flow-definition-is-data-and-a-predicate-is-registered-by-name.md) rule 1), so nothing static can be derived from it — where a gate's key path is resolved **by the library itself** and handed to `fn` as `ctx.key`. *What bounds this plan is not which guards matter but which guarantees the LIBRARY computes* | `src/definition/types.ts`' `GateContext`, and the absence of any predicate input to `checkWiring` |

### What the facts found that nobody asked about

- **The shipped comment already states the defect's shape correctly and calls it right.**
  `boundaryTargets`' header says *"`choose` is what a RUN knows and a static report does not: which route a
  gate takes — without it an entry gate hands the walk EVERY route's target, which is right for
  `checkWiring` (any of them is a place the payload may land)"*. **That is true and it is about the TARGET.**
  Q391 is orthogonal and one word away: the check knows every route's target and **nothing about each
  route's value**. A correct sentence about one axis sat where the missing axis would have been noticed.
- **This declaration's own first facts pass was wrong TWICE and both are recorded rather than quietly
  re-taken.** It counted `Object.keys` of a resolved registry, which holds **Maps**, and printed
  `0 workers, 0 node types` while producing correct verdicts; and it wired `spec/examples/valid/**` against
  `examples/registry.json`, which is **not those documents' registry**, so four of its six `no` verdicts were
  artefacts of the wrong registry. The scope above is the corrected one. *A harness that reports a registry
  as empty and verdicts as sound is not obviously broken, which is why the number is stated beside its
  divisor.*
- **And the prototype harness had NO RESTORE PATH.** Its first run aborted on an identifier the prototype
  had not destructured, and left the copy's `wiring.ts` **mutated** — so the second run's first anchor
  reported `occurs 0 times` rather than measuring anything. That is `doc/workflow.md` v0.17's per-edit
  integrity clause firing on the declaration's own harness, one plan after v0.25 added obligation (f);
  the restore and its byte assertion are in `proto2.py` now, and the copy was restored by hand first.

## Scope

**In**

1. **What a route GUARANTEES** — `GateType`'s optional declaration, `WiringRegistry` widened with
   `gateTypes`, `checkWiring` reading both, and the arc through a gate judged as the arc OUT of it.
2. **What a KEY PATH must satisfy** — a wiring verdict where the path is not described by what reaches the
   gate, `unchecked` where the producer says nothing, and the **run-time half MEASURED** (fact 7's prediction).
3. **The exit artifact** — the authoring session, and L6's W94 clause replaced by its opposite.

**Out** — named rather than left implicit, with where it goes instead

- **A decision's predicate**, by fact 9: opaque by ADR 0002 rule 1, so no static tool can read it. Nothing
  in this plan narrows [Q9](../open-questions.md).
- **An `FD-V` refusal for a wrong key path** — stop-and-ask (b)'s other road, named as a follow-on rather
  than refused: it needs the validator to read a producer's schema, which is a wider change than this plan.
- **[Q405](../open-questions.md) and [Q406](../open-questions.md)**, W98's two: a relation whose label
  varies between runs, and `RN-R27`'s barrier keyed by a region rather than a region instance. Neither is
  about a route, and Q406's case needs two instances of one opener.
- **[Q407](../open-questions.md)'s two unfixed rows** in `doc/README.md`'s plan-history table. This plan's
  own retro may take them under section 6 pass 3 rule 6, or they stay with that row's owner.
- **[Q401](../open-questions.md)'s WORDING half** — obligation (f)'s reach. That row says *P25's retro*, so
  this plan's retro owes it and no item does.

## Work items

Three, serial. Each is declared in its own file before it starts, from the row below (section 7 rule 2).

| | Item | What it answers | Spec / ADR |
|---|---|---|---|
| **W99** | what a ROUTE guarantees | `GateType`'s optional per-route guarantee, `WiringRegistry` widened, the derivation, and the arc out of a gate judged as its own arc. Fact 6's prototype rebuilt as a declaration the TYPE makes rather than a semantics the check knows | **ADR 0068**; `spec/flow-definition.md` — the arc-shape table gains a gate row, and the guarantee gets a rule id |
| **W100** | what a KEY PATH must satisfy | The wiring verdict of fact 7, `unchecked` where the producer says nothing, and **the run-time half measured**: a gate whose key path resolves nowhere routes every branch to its type's unresolved route and the run completes having done nothing | `spec/flow-definition.md` — one more clause on the same table; no `FD-V` |
| **W101** | the exit artifact | The authoring session, executed, with its `README.md` twin held byte-equal by `X8`. *(**Corrected at W99's declaration step**: this row gave W101 `examples/l6.ts` and said L6 moves here. It moves at **W99** — read rather than assumed, L6's cross-row clause compares against a literal naming EVERY gate row, so the moment the TV arc stops being a `no` that comparison fails and W99's own gate cannot be green without replacing it. What W101 moves at L6 is its own artifact's, and its declaration step settles it.)* | none — an exit artifact writes no rule |

**Reserves W99-W102, Q410-Q424, ADR 0068-0069**, derived by grep off the tree at this declaration (highest
W on disk 98; highest Q in the register 407, with W98's Q408-Q409 reserved-and-unused and therefore SPENT;
highest ADR on disk 0067). **W102 is expected unused and ADR 0069 expected skipped** — a reserved id is
skipped, never reused.

## The exceptions each item will take, seeded

From three plans' late tables (P16's refused procedure applied as a table rather than a rule). The point is
the ones this table gets WRONG, which the retro reads.

| File | W99 | W100 | W101 | Why |
|---|---|---|---|---|
| `src/definition/wiring.ts` | **owns** | **owns** | no | the check is the whole subject |
| `src/definition/types.ts` | **owns** | no | no | `GateType`'s new member |
| `src/definition/validate.ts` | **owns** | no | no | **ADDED at W99's declaration step**, which this table missed: `GATE_TYPE_KEYS` is a CLOSED list refusing an extra key by name, so it decides whether the member may exist at all — and `distinct`'s own declaration lives there |
| `spec/flow-definition.md` | **owns** | **owns** | no | the arc-shape table, both halves |
| `spec/README.md` | likely | likely | no | `C8`'s version column moves with the document |
| `test/definition/wiring.test.ts` | **owns** | **owns** | no | where the verdicts are asserted |
| `examples/flows/tv-ingest.flow.json` | likely | no | ~~likely~~ **no** | the one gate flow the corpus runs — *and W101 declares its own flow in a module rather than touching it* |
| `examples/l6.ts` | no | no | ~~**owns**~~ **no** | *the W94 clause was replaced at **W99**, which is where L6 moved (W99's correction 4 says so). W101 does not touch this file, and L6 is UNMOVED at 2176 / 154 there* |
| `examples/getting-started/**` | no | no | **owns** | **ADDED at W101's review**, which this table missed: an authoring session's workers and its registry module live here, as W74's do |
| `test/definition/gate-session.test.ts` | no | no | **owns** | **ADDED at W101's review** too — its adequacy reader made all nine of the session's guards TAUTOLOGIES at `check:docs` exit 0, and a snippet cannot be its own second observer |
| `AGENTS.md`, `README.md` | no | no | **owns** | the session and its `X8` twin |
| `examples/registry.json` | possible | possible | ~~likely~~ **no** | a second gate type, or a second worker for the session — *neither: the session's registry is `examples/getting-started/quota-registry.ts`, which is also why `check:workers` (whose corpus is this file) reaches none of its three workers* |
| `scripts/check-docs.mjs` | no | no | likely | `RUN_FLOOR` if the session adds a `run` snippet |

## Predictions, to be written down BEFORE the items that test them

| | Prediction | Scope of the measurement it rests on | What would reverse it |
|---|---|---|---|
| **1** | **W99 needs no change to any caller.** `Registry.gateTypes` and `GateType`'s new member are both optional, so every existing `checkWiring` call and every registered gate type compiles unchanged | Fact 5, measured on the **widened `Pick` alone**, not on the member — so this is DERIVED for the half nobody has measured | A `GateType` whose new member the check must read to answer at all, which would make it required. Watch for a shape where *absent* cannot mean *no guarantee* |
| **2** | **The corpus goes 2 `no` → 1 and nothing else moves.** The survivor is `map-no-array`'s deliberate `FD-R2` | Fact 6, measured with `distinct`'s routes hard-coded — the same corpus and the same registry | The declaration road disagreeing with the hard-coded one on any route. If it does, the type's declaration is wrong about its own semantics, which is the more interesting finding |
| **3** | **THE REACH: a consumer's own gate type gets a guarantee it can state, and nothing this repository ships exercises that.** The corpus has ONE gate and it is `distinct`; the session in W101 is where a second type first declares a guarantee | Nothing — this is the reach, measured nowhere, and the only prediction of the four that can go either way | A guarantee a consumer's type would want that `required` along a key path cannot express — a route that narrows a TYPE rather than asserting presence, or one whose guarantee depends on the settings. Then the declaration is a schema per route rather than a set of routes |
| **4** | **W100's run-time half completes.** A gate whose key path resolves nowhere routes every branch to its unresolved route, and the run reports `completed` having done none of the work the flow is for | Fact 7's STATIC half only — that both tools say nothing. The run was NOT taken at this declaration, and this row says so | The run not completing: a `nokey` route wired to something other than an `end` in the corpus flow, or the driver refusing an unresolvable key path somewhere this declaration did not read |

## Open questions this plan carries

**[Q391](../open-questions.md)** is the subject and W99 resolves it. **[Q392](../open-questions.md)** (a
revert that crashes L6 at module link with zero failure lines) was expected to be W101's hazard by construction, since that item was expected to edit the file that imports `distinct` from the root — **it does not**, and `examples/l6.ts` is not in its diff (W101's conformity reader, F6). The sentence stood while the item it names falsified it. *The original read:* since W101
edits the file that imports `distinct` from the root — it is named here so the item does not rediscover it.
**Raised by this declaration: none** — every gap it found is one of the two halves it takes.

## Stop and ask a human — BOTH ANSWERED 2026-09-29, each as recommended

The two rows of *What the design settled* above. Both were put with the alternatives priced from facts 5, 6
and 7, and both came back as recommended: **the TYPE declares the guarantee** (ADR 0068), and **a wrong key
path is a wiring VERDICT** rather than a construction refusal.

## A note on ids

Derived by grep off the tree at this declaration, never from an index sentence: `ls doc/work-items` gives 98,
the register's live table gives 407, `ls doc/decisions` gives 0067, `ls doc/plans` gives 24. `CLAUDE.md`,
`doc/README.md` and `README.md` all said W99 / Q410 / ADR 0068 and all three agreed with the grep. *Whether
that is unusual is not measured here — the retro can say, since it is the one pass that reads every index.*

## The baseline this plan was declared on

| | |
|---|---|
| L6 | **2174 assertions over 154 real runs**, node 24.20.0 and deno 2.9.6 |
| L1-L5 | **53 files / 1423 assertions** in three runtimes |
| `check:spec` | **7 documents, 65 examples, 126 rules** |
| `check:docs` | **37 snippets — 31 run, 6 check**; `X8` pairing seven, `X10` four count copies, `X11` 37 ADRs |
| `checkWiring` over `examples/flows` | **89 arcs, 2 `no`, 13 `unchecked`/`transform-*`** — the number W99 moves |
| Census | **311 / 239 / 1 / 71** |
| `M3` margin | **18** files, measured with this plan's own document on the tree (124 against the floor of 142, both `removes` probes still firing at exit 1) — so **[Q142](../open-questions.md) does NOT fire on this plan and is 18 documents away, not 2.** *This row first read 19 and predicted `M3` firing at this plan's SECOND document, inheriting P24's retro's prediction — which was made against a floor of 123, where the margin was 3. [W98](../work-items/w98-what-a-row-may-assert-about-a-dispatch-order.md) retuned `M3` to 142 and reset it. A prediction carried across a retune is a claim about a number that moved, and it was corrected here by taking the measurement rather than by reading the sentence.* `M4`'s binding margin is **644** links at probe 2 |
| Gate | `npm run gate` EXIT 0, zero FAIL lines, 31 entries, digest `bb186b0bbaca70a4` over 417 files |

## Record

**COMPLETE 2026-09-30, three items, all DONE, and the question is answered: a gate's ROUTE guarantees
what its TYPE declares, and the library derives it from the KEY PATH.**

| | | |
|---|---|---|
| [W99](../work-items/w99-what-a-route-guarantees.md) | what a route GUARANTEES | **ADR 0068**; `GateType.keyResolvedRoutes`, `WiringRegistry` widened with `gateTypes`, `requireAlong` along the key path; `spec/flow-definition.md` **v0.25**; [Q391](../open-questions.md) RESOLVED |
| [W100](../work-items/w100-what-a-key-path-must-satisfy.md) | what a KEY PATH must satisfy | `keyPathRefusal`: two shapes forbid a step, an OPEN producer silent there forbids nothing, the LEAF's type is never read; `spec/flow-definition.md` **v0.26**; no rule id, count stays 37 |
| [W101](../work-items/w101-the-authoring-session-wiring-a-gate-before-it-runs.md) | the EXIT ARTIFACT | `AGENTS.md` section 20, an authoring session the gate EXECUTES on a CONSUMER'S OWN gate type, with its `README.md` twin byte-equal under `X8`; no ADR |

**What the plan shipped that it did not set out to.** Both of the later items' central repairs came from
readers rather than from the plan: W100's verdict ORDER, where a refusal that belongs to a route was
being downgraded by what the CONSUMER declared, and W101's second observer, without which the exit
artifact's nine guards were all tautologisable at exit 0. **Neither is in this plan's scope section and
neither could have been**, because both are facts about what the evidence could not falsify.

**The one thing the plan got wrong about itself** is the seeded exceptions table: three of the rows it
gave W101 are `no` (`examples/l6.ts`, `tv-ingest.flow.json`, `examples/registry.json`) and it is silent
on the one directory that item creates. `examples/l6.ts` moved to W99 at that item's declaration step,
which its correction 4 records, and this table was not corrected until W101's reader read it.

**Both stop-and-asks were answered the same day, each as recommended, and both held**: the TYPE declares
the guarantee as an OPTIONAL member, so a consumer's own type gets what `distinct` gets — which is
prediction 3's reach and W101 is where it was first exercised; and a wrong key path is a wiring VERDICT
rather than a construction refusal, with the `FD-V` road named as a follow-on and not taken.

## Retro

*Pass 3, run 2026-09-30 on `33d393d`'s tree — W100 and W101 in ONE commit on top of W99's `e06fa68`, the
working tree clean. **NO CHANGE ADOPTED and SEVEN refused**, which is [P8](p8-what-can-be-deleted-with-the-gate-green.md)'s
precedent and pass 3 rule 1's expected verdict; `doc/workflow.md` stays [v0.25](../workflow.md) and gains
only this plan's occurrences in two clauses' own evidence. What follows is this plan's own evidence. Every
declared ceiling was re-run in an isolated copy at `dev-dist/p25r/tree`, and every number below was taken
on the tree this retro commits unless it says otherwise.*

### The central finding: the two clauses this plan's largest defects point at are COMPLETE, both name their remedy, and in both cases the author ran the diagnostic half and not the remedial one

**This is not a mechanism that needs replacing. It is pass 3 rule 3's other verdict — a rule BROKEN means
someone was careless — and the careless one was me, twice, in writing.**

**(1) v0.20's tautology clause.** [W101](../work-items/w101-the-authoring-session-wiring-a-gate-before-it-runs.md)'s
Verification table handed it to its adequacy reader BY NAME, and that reader made **ALL NINE** of section
20's guards tautologies at `check:docs` **EXIT 0** — individually and all nine at once — and deleted **two
of the five steps** whole for zero. `X4` counts a `throw` textually and refuses `if (false)` by name, so
`x !== x` and `includes('')` are outside both tests, and `RUN_FLOOR` counts SNIPPETS rather than what is
inside one. **The clause's own next paragraph already says what to do**: *the answer is a second observer,
not a better guard* — and it records that [W74](../work-items/w74-the-assists-and-the-exit-artifact.md)
re-asserted seven of section 15's eight claims in `test/definition/assist.test.ts` and wrote down that the
eighth has none. So the remedy was written three plans ago, by the item this one is modelled on, and §20
shipped its first cut with **no second observer at all**.

*The repair, once read, is the clause verbatim*: every declaration the session claims moved into
`examples/getting-started/quota-registry.ts` and `test/definition/gate-session.test.ts` asserts the same
verdicts from it. **The measurement that says it worked is the reader's own `b1` — the ONE probe of its
sixty-two that survived everything** (the two key-resolved routes SWAPPED, which leaves both `skip` arcs
sorting to `fits,no`) — now CAUGHT at BOTH rungs, `npm test` EXIT 1 with two named failures and
`check:docs` EXIT 1. The tautologies themselves still survive and that is the honest residue: what changed
is not the verdict but what it COSTS, because a tautologised snippet no longer leaves the claim unobserved.

**And the reader's own decomposition is the sharpest thing in the plan.** It measured `z2` — the product's
refinement reverted with the session intact — as CAUGHT at `check:docs` AND `npm test`; then `z1`, the same
revert with all eight tautologies applied, as `check:docs` EXIT 0 and `npm test` EXIT 1. *So the DERIVATION
was already bound at L1-L5 independently of the session, and what the session ALONE bound was nothing.*
What only the session had was the reach, and that was deletable for zero too.

**(2) v0.23's selection clause, and it was short THREE times across two plans on the same mechanism.** The
clause says the set names the well-formed WRONG selections and each fixture puts the right one where every
one of them DIFFERS — *and* that where only the default position is available the author **ARRANGES** the
other. Its own argument names the positions: *index 0, the first opened, a single segment, settlement in
dispatch order.*

| | the selection | where the fixture put it | what the wrong selection cost |
|---|---|---|---|
| [W84](../work-items/w84-what-a-regions-identity-is.md) (P22) | an instance, by its opener's path | every instance at ONE segment | truncating to the first segment: **0 at every rung** |
| [W99](../work-items/w99-what-a-route-guarantees.md) | how many steps the refinement must ADD | the fixture's producer already declared the nested `required`, so the only step to add was the ROOT | the walk bound at ONE STEP (`i >= steps.length` → `i >= 1`): **0 / 0** |
| [W100](../work-items/w100-what-a-key-path-must-satisfy.md) | the step a reason NAMES, as the whole PREFIX | every key in the tree and in the corpus at most TWO segments | `at` as the LAST SEGMENT: **0** |

**The third is the one worth reading twice, and it is why no fifth amendment is adopted below.** W100's
author had already moved OFF the clause's named default — the table carries `series.slug`, two segments —
and the wrong selection still coincided, because at two segments `$.owner` is both the prefix of
`owner.ident` and its last segment. *Moving one position off the default is not the same as exceeding the
last position at which the candidate expressions agree, and that point is a property of the EXPRESSIONS
rather than of the type.* Closed by a three-segment row, after which the probe fires.

**In every one of these five the probe EXISTED** — a loop-bound probe, a selection probe, a tautology probe
— **and the FIXTURE could not discriminate.** The obligations produce the probe; nothing but reading the
clause's second half produces the fixture. **And every one was caught by a reader**, which is what the
counter-measure for carelessness is, and it worked five times out of five.

### Name the rung: NINETY-SIX defects, TWENTY-EIGHT blocking, and not one of the twenty-eight was caught by a rung

| item | its own corrections | conformity | adequacy | blocking |
|---|---|---|---|---|
| [W99](../work-items/w99-what-a-route-guarantees.md) | 6 | 9 / 3 | 6 / 5 | 8 |
| [W100](../work-items/w100-what-a-key-path-must-satisfy.md) | ~6 | 16 / 4 | 19 / 6 | 10 |
| [W101](../work-items/w101-the-authoring-session-wiring-a-gate-before-it-runs.md) | ~6 | 16 / 3 | 12 / 7 | 10 |

**The rungs FIRED seven times and every firing was read correctly** — and every one was on something a
person had just typed wrong rather than on a claim about the product:

1. **`check:spec`'s `C4` refused an impossible fixture** (W99, and its own Record says this is *the only
   thing in this item a rung found rather than a person*): a separate `FD-V42` was written for the new
   member and `C4` asked for a case in `spec/examples/invalid/` that **cannot exist**, because that corpus
   is a flow plus a JSON document and a gate type is CODE. *An impossible fixture is a rule id in the
   wrong place.*
2. **the L1-L5 suite census, twice at W101** — the new suite undeclared, then its case count wrong.
3. **`check:docs`' `X3` and `X5`** on `WiringRegistry.languages` being a map of adapters where a registry
   document's is a list of names, so a document could not be spread into the check.
4. **rule 7 (b) twice at W101**, aborting a probe whose anchor was indented four spaces where the code is
   two, and one whose anchor was in the wrong file.
5. **`deno lint`, inside a READER's own probe**, standing in for a missing assertion (its F5): with the
   worker's body replaced by a constant, `no-unused-vars` fired — and with the parameter renamed so it
   could not, every rung was green.

**The other eighty-nine have no rung, and the split is the one P11 and P12 found**: they are in the
EVIDENCE, not the product. Eighteen of the twenty-eight blocking findings are an adequacy reader's — a
bound that was not there — and ten a conformity reader's — a claim that was false. **Nothing in L0-L6
climbs over whether the thing that says so could have said otherwise**, which is the third plan running
to record it.

**Eleven are in the INSTRUMENTS**, and two are worth carrying. W99's pass 1 read **sixteen against
declaration and fourteen were ONE defect**: for the `test` rung the runner's `FAIL` line carries the CASE
NAME and the assertion message is in a detail block at the end, so a `names` written as an assertion
message could never match — and **both grader controls sat on the `l6` rung**, where the reason IS the line
after `FAIL`, so neither could see it. That is v0.24's clause satisfied and short in the same breath, and
it is why a third control was added on the `test` rung. And at W101 **my own verification pattern could
never match**: `grep -c "^FAIL"` against a runner that indents by four, so every green run printed a FAIL
count of zero by construction. The exit code was read every time, which is the predicate, so no claim
rests on it — v0.15's clause holding while its own counter-measure was defeated by the literal
[Q276](../open-questions.md) is about.

### REFUSED, seven, each with a measurement — and the first two are the ones this retro drafted and then measured as already written

1. **A REMEDY clause for v0.20's tautology finding — refused because the clause already carries it.** The
   draft read *where the sole observer is a document the gate EXECUTES, the second expression lives OUTSIDE
   it*, on two occurrences (W74's seven guards, W101's nine). Then the clause's own next paragraph was read:
   **the answer is a second observer, not a better guard**, with W74's `test/definition/assist.test.ts` named
   as the instance. The one word the draft would have added — *outside* — is the only thing missing, and
   `test/definition/assist.test.ts` is outside `AGENTS.md` by construction, so the example supplies it.
   **A clause is not improved by restating it louder.** The occurrences go into its evidence table instead.
2. **A POSITION clause for v0.23 — refused for the same reason, and it would be the FIFTH amendment to
   obligation (a).** The draft read *where a selection is computed from a position — an index, a depth, a
   path length — the set includes a fixture whose position EXCEEDS the minimum.* The clause already says
   *where the corpus or the scheduler gives only the default position the author ARRANGES the other*, and
   names *a single segment* among the defaults. **What is genuinely new is only W100's finer point** — that
   the discriminating position is where the candidate EXPRESSIONS differ, not one step off the named default
   — and that is **one occurrence**, where [P23](p23-what-a-run-needs-to-outlive-its-process.md)'s retro
   refused a fifth amendment to (a) on the regress ground: four amendments, each the previous one followed
   and short. *A fifth would be the same regress with a finer grain, and the grain is already fine enough
   that the author's failure was reading rather than resolution.*
3. **A `doc/` check, for the TWENTY-FOURTH time — and P25 is the first plan whose instance is NOT the
   English class, which is why it goes to the MAINTAINER rather than into this refusal.**
   [W101](../work-items/w101-the-authoring-session-wiring-a-gate-before-it-runs.md) shipped its whole build
   with **none** of `doc/work-items/TEMPLATE.md`'s eight declaration lines, every rung green throughout, and
   the eight labels are a fixed list in a fixed file: comparing them needs no English at all. The standing
   refusal keeps the class it has always covered — and this plan supplies that too, in
   `examples/README.md`'s `getting-started/` paragraph, wrong in **three** counts at once (*nine workers*
   for a directory of fifteen, a section list missing 20, *six* README pairs where there are seven), whose
   own parenthetical records W71 doing the same thing. **[Q420](../open-questions.md) carries the
   machine-comparable one**, on [W96](../work-items/w96-the-counts-and-the-index-a-check-can-compare-and-q394.md)'s
   precedent: P23's retro handed two such classes forward, P24 refused them and sent them to the maintainer
   as an item outside any plan, and that item BUILT them as `X10` and `X11`.
4. **An `Owns` pre-declaration rule, for the THIRTEENTH plan — and W101's F1 must not be confused with it.**
   P13's retro measured that which files an item touches is a property of its CONTENT, and P25 reproduces
   that exactly: W99's declaration step added `src/definition/validate.ts` to its own `Owns`, and P25's
   SEEDED table was wrong in **three** of the rows it gave W101 (`examples/l6.ts`, `tv-ingest.flow.json`,
   `examples/registry.json` — all `no`) and silent on the one directory that item creates. What W101's
   reader found is not *which files* but *whether the block EXISTS*, which is Q420.
5. **A rule that a READER's harness carries a grader control per rung.** One occurrence: W101's adequacy
   reader recorded (its harness note 1) that its CRASH discriminator was wrong for the `lint` rung, because
   `deno lint` prints `error[no-unused-vars]` and never a line beginning `FAIL`, so two real detections were
   first graded CRASH. **Refused because v0.24 already says it of the harness rule 8 governs, and a reader's
   harness is not the item's deliverable** — the reader found its own defect, re-took both probes as `f4b`
   and `f6b`, and reported the correction, which is the mechanism working one layer out.
6. **A rule about a run that HANGS rather than failing.** W101's build met it: the session passed
   `base: import.meta.url` where the registry's worker urls are relative to the MODULE, so every worker
   resolved to a path that does not exist and the tasks stayed `pending` with the process alive. What
   isolated it was a TWO-file run timing out where a five-file one had worked — *which is what said the
   fault was not the file the item had just added.* **Refused at one occurrence**:
   [Q266](../open-questions.md) already carries the class, no rung can report a hang by construction, and
   the cost here was a diagnosis rather than a defect that shipped.
7. **A rule that a fix must not edit a row already carrying its own answer.** W100's conformity pass closed
   its reader's F5 by adding a scope sentence to `spec/flow-definition.md`'s `fits` row, and that row
   **already had one** — so the document shipped saying *its ONE scope* TWICE with the leniency's own clause
   stranded after a full stop, found one item later by W101's conformity reader (F15). **Refused at one
   occurrence and because it is refusal 3's class**: no expression compares two sentences of a normative row
   for saying the same thing, and v0.8's re-run cannot see prose. *It is also the sharpest single argument
   for reading a row whole before adding to it, which is not a rule but a habit.*

### Predictions: FOUR of FOUR CONFIRMED — the FOURTH plan to record that, and two of the four are interesting

| | verdict | |
|---|---|---|
| **1** | **CONFIRMED** | `keyResolvedRoutes` is still `readonly …?` and `checkWiring` reads it at two sites; a type declaring nothing is asked no question, so *absent* means *no guarantee* and the member never had to be required. Its scope column called the member half DERIVED, so this tested the inference and the inference held |
| **2** | **CONFIRMED** | 89 arcs / 2 `no` to 89 / 1, the survivor `map-no-array`'s deliberate `FD-R2`, and the census is UNMOVED at 73 fits / 1 / 5 / 2 / 8 through both later items — *nothing else moves* measured twice more than the prediction asked |
| **3** | **CONFIRMED, and its stated REVERSAL ARM measured REAL** | the reach: nothing shipped exercised a consumer's own type, and `examples/run-flow.ts`'s two mentions of `gateTypes` are both retention-walk key lists rather than a declaration, so ladder L6 runs `distinct` alone. **And the column's first arm is true of the session's own type** — `quota`'s `fn` returns `nokey` unless the key is a non-empty STRING, so `within` and `over` guarantee more than presence and the member cannot say so. That is not a reversal but ADR 0068 rule 3 working, and the prediction holds because the session needs presence only. *P17's shape: a reversal condition measured true and routed around by what the road needs* |
| **4** | **CONFIRMED on real workers, by the item AFTER the one that owned it** | the plan's own column says the run was NOT taken at the declaration. W100's declaration step took it in `dev-dist`; **W101 made it an ASSERTION** — `completed`, six branches on `nokey`, no per-owner task dispatched — and it did so because its adequacy reader (F4) measured that the sentence was the plan's unfired prediction sitting in the exit artifact's prose, asserted by nothing |

### The clauses this plan tested

- **v0.25's obligation (f), BREAK THE ORDER: CONFIRMED with a new shape — an item whose row asserts
  nothing order-dependent.** W101 is the plan's only item with a run. Its set reversed all six files
  (`f1`) and the probe is CAUGHT — by the file LIST's own equality in the test, a claim about the
  DECLARATION — while the run's routes are order-INVARIANT because the quota is counted per key. The
  adequacy reader measured the same permutation as SURVIVED and was right to (its e5). *So (f) was
  instantiated, the answer was that there is no completion order to assert, and the two agree.*
- **v0.24's per-rung grader control: CONFIRMED, and it is what W99's pass 1 was short of** (see the rung
  section). All three items ended with a CRASH and a WRONG-REASON control on **every** rung their set
  used — eight control probes across the plan, every one right on every pass.
- **v0.23's selection clause: FOLLOWED in all three items and SHORT twice — the central finding above,
  with the third occurrence from P22 beside them.** Its remedy is named in the clause and a fifth amendment
  is refused (refusal 2). **What is worth adding here is the one direction it caught**: W100's set probed
  `at` as *always `$`* and that probe FIRED, so two of the three well-formed wrong selections were named
  and the third — the last segment — was the one the fixture could not tell apart. *Naming two of three
  wrong selections reads, from inside, exactly like naming all of them.*
- **v0.14's WITHDRAWN-claim clause: FOLLOWED and SHORT once more.** W99 searched for and corrected three
  live copies of the claim it narrowed; W101's conformity reader then found P25's own file saying
  [Q392](../open-questions.md) *is W101's hazard by construction, since W101 edits the file that imports
  `distinct` from the root* — **W101 edits no such file**. A sentence naming the item that falsifies it,
  which is v0.15's third direction and its own recorded limit.
- **v0.8's re-run: CONFIRMED, and it caught a fix in the fix.** W100's F1 repair removed a dead arm whose
  string three documents quoted, and its own pass-2 probe `rC1` restores the arm to show it cannot be
  caught. W101's re-run found four verdicts wrong and **all four were the author's DECLARATIONS**, not
  product defects — including one that became the item's best measurement, `m1`, where `test` is EXIT 0
  and `docs` EXIT 1, which is the stated ceiling measured from both sides at once.

### The ceilings

**SEVENTEEN declared ceilings re-run on the shipped tree in an isolated copy — SIXTEEN hold and ONE is a
CATCH, and what is unusual about it is not that it is a catch but that NOBODY HAD TAKEN IT.** *(This
sentence first read *the first new catch since P18, breaking a run of six retros at zero*, taken from
`CLAUDE.md`'s summaries. Read from the plans' own files instead — section 1 rule 5's provenance clause —
P22 records **TWO** catches at its ceiling re-run, P23 **TWO** and P24 **ONE**, so catches are not rare at
all. What each of those three says is that the catch was **already taken by the item whose reason NAMES**
it. That is the distinction, and it is the one that bears on the hand-off refusal below.)*

| | ceilings | verdict |
|---|---|---|
| [W99](../work-items/w99-what-a-route-guarantees.md) | `b1`, `b6`, **`r6`** | two hold; **`r6` is a CATCH**, `npm test` EXIT 1 |
| [W100](../work-items/w100-what-a-key-path-must-satisfy.md) | `a5`, `c3`, `e2`, `rC1`, `rA2` | all five hold, digest IDENTICAL start to end |
| [W101](../work-items/w101-the-authoring-session-wiring-a-gate-before-it-runs.md) | `a7`, `a8`, `b1`, `b3`, `d3`, `d4`, `rA11`, `rC7`, `rC3` | all nine hold, digest IDENTICAL start to end |

**`r6` is v0.17's dated-ceiling clause firing exactly as written, and it is the FIRST in four plans that the
item which expired it did not take.** The probe removes the no-key guard (`key !== '' && route !== undefined` →
`route !== undefined`), and W99's adequacy reader ranked it a ceiling below F1-F5 with its reason stated:
*a gate naming no key then gains `required: [""]`, and the only consumer that can tell is one REQUIRING
the empty string — a pathological document.* **W100 then wrote that document**: its `keyless` gate-type
fixture, which asserts a gate with no key is one of ADR 0068's silences. So the case that now catches `r6`
is W100's own — *the FOUR silences: an OPEN producer, a producer with no schema, a type declaring no
guarantee, and a gate with no key.*

**And it makes the dated-ceiling HAND-OFF's fourth refusal concrete rather than theoretical.** The clause
says the item that MOVES the value re-runs the ceiling; P18's retro found that it tells the author who
WROTE the ceiling rather than the one who expires it, and P19 and P20 each refused a hand-off on the
ground that the earlier item cannot name the value its successor will move. **W100 moved the value and did
not re-run W99's set, and the retro's own re-run is what caught it** — which is the clause working as
designed and not an argument for changing it. *A reason that names the tree on which a ceiling fails is
what let this be read in one line: W99's reader wrote down the pathological document, and W100 built it.*

**Two instrument facts, recorded rather than smoothed over.** W99's re-run reported its digest **MOVED**
between start and end while W100's and W101's both ran **IDENTICAL**; after all three runs **every one of
the copy's 427 tracked files is byte-identical to the shipped tree**, so no probe edit survived and no
verdict rests on a mutated tree. The one honest candidate is that this measurement's FIRST attempt was
terminated mid-run by a network failure, so the tree W99's re-run started from is not guaranteed to have
been the shipped one — a harness killed between apply and restore, which is [Q323](../open-questions.md)'s
class, even though the restore evidently completed. **And twice in this retro the OBSERVER read a mutation
that was not there**, by sampling the copy while a harness was mid-restore: first concluding that
`AGENTS.md` and `README.md` had been left edited, then reading `l4-corpus.test.ts` as ten bytes longer.
Both were byte-identical when re-measured. *v0.15's held-still rule is written for the author and applies
to whoever is looking.*

### The readers

**Six passes, none empty. Overlaps 2, 4, 4 — the sixty-third to sixty-fifth measurements**, the last two
at the top of the settled 0-4 band. Twenty-eight blocking, split **10 conformity / 18 adequacy**.

**All three conformity readers' central obligations came back with ZERO disagreements on the VALUES — the
FIFTH plan running, and the largest sample yet: 27 + 43 + 39 = ONE HUNDRED AND NINE values derived on
paper before any output was read.** W99's reader derived the corpus verdicts and both gate arcs; W100's
derived ten table rows, four corpus keys, the leniency's four pairs and the L2 run-time pair; W101's
derived every arc's verdict, the step each reason names, the schema's own words, the route, and the run's
five routes and keys — then constructed an entry gate, a gate into a join and an `enum` container to check
the three silences against the CODE rather than against the register's rows.

**And in TWO of the three items the two readers' central findings were the same defect reached from
opposite ends.** At W100 the conformity reader read the spec's unconditional verdict and the adequacy
reader mutated the arrival's carried schema, and both arrived at the verdict loop's ORDER. At W101 the
conformity reader read the Verification table's `check:workers` row and the adequacy reader measured the
check's corpus, and both arrived at a rung that reaches none of the item's workers. *That is not overlap
in the counted sense — the subjects differ — and it is the strongest thing the two-reader split has
produced.*

### The numbers

| | at the declaration | at the close |
|---|---|---|
| L1-L5 | 53 files / 1423 cases | **54 / 1446** in three runtimes |
| L6 | 2174 / 154 | **2176 / 154**, moved at W99 and UNMOVED after |
| `check:spec` | 7 / 65 / 126 | **7 / 65 / 126**, `C4` at 37 |
| `check:docs` | 37 snippets / 31 run | **38 / 32**, `X8` pairing 8 |
| the corpus census | 89 arcs, 2 `no` | **89 arcs, 1 `no`** — 73 fits / 5 transform-passes / 2 transform-fails / 8 unchecked |
| the register | 311 / 239 / 1 / 71 | **317 / 244 / 1 / 72** at W101's close, **318 / 245 / 1 / 72** with this retro's own |

**This retro RAISES ONE question and resolves none, and it raised it against itself: its own confirming
gate reported a product failure that was the CLOCK.** The first `npm run gate` over the shipped tree came
back `EXIT 1` with one `FAIL` line — `X4 every `run` snippet executes, and asserts something (9)` —
every one of the nine reading *the snippet does not run: exit null*. **Three runs on a BYTE-IDENTICAL tree
settled it**, digest `ad1fa371f6522067` at every measurement: nine failures at `AGENTS.md` lines 1075,
1200, 1358, 1453 and more; then FOUR at **different** lines (592, 619, 661, 1814); then, alone on an idle
machine, **EXIT 0 in 15 seconds** for all thirty-two. `scripts/check-docs.mjs:237` runs each snippet with
`timeout: 30_000` and a timed-out child gives `status === null`, so a snippet that takes under a second
was slowed past thirty seconds — and two of the nine do nothing but call `validateDefinition` and
`fold`. **The cause is machine LOAD, and the retro first wrote down ONE cause where it went on to measure
THREE contributors**: its own `TaskStop` on a gate twenty minutes earlier, another project's CI
running node in a different fnm shell on this machine, and **[Q426](../open-questions.md)'s 12 574
leaked directories**. *The sharpest reading is one check, three times, over 32 snippets that never
moved: `check:docs` EXIT 0 in **15 s**, then in **639 s**, then in **563 s** — up to 43 times
slower, with every snippet inside the 30 s cap on all three, so the cap is crossed by LOAD alone and no
snippet has to be slow. The three trees differ in markdown prose and `AGENTS.md` is byte-identical
across all of them, which is where every snippet lives — the first draft of this sentence said
*the same bytes*, and three trees are not the same bytes however little the difference can matter.*
It is the SECOND time in this retro that a kill produced a misleading measurement and the third if the
ceiling re-run's terminated first attempt is counted — and the first attribution was itself a
fourth: *one cause is what you write when you stop measuring at the first one you recognise.* *A varying failure SET is what said it was not a
defect; one run would have read as nine broken snippets, and the message names the snippet rather than
the clock in either case.* [Q425](../open-questions.md), and it is
[Q327](../open-questions.md)'s class by a THIRD mechanism — not a killed harness reporting a rung as
zero cost, but a SHIPPED gate entry converting machine load into a named product failure, in the one
check a consumer runs. **It takes Q425 rather than Q421**, on
[P24](p24-what-a-node-may-remember-across-a-runs-branches.md)'s precedent, where Q393 was spent and that
retro's own question was Q394: a reserved-and-unused id is spent, never reused, and a retro's question
comes after its plan's block.

**And it EXTENDS [Q407](../open-questions.md) with a THIRD mechanism, by running that row's own proposed
clause over the five documents this retro edits**: `doc/README.md`'s plan-history rows for **P19 and
P21 carry TWO cells where their header has FOUR**, so those two plans' *exit artifact* and *date*
columns render EMPTY while every row around them carries both. It is the quietest of the three — a
row SHORT of its header rather than one broken by a pipe or a newline, so nothing is garbled and two
cells are simply absent. **Both pre-date this retro**, measured on the `HEAD` copy, and both are
**deliberately NOT fixed** on [P8](p8-what-can-be-deleted-with-the-gate-green.md)'s precedent for
[Q131](../open-questions.md): whoever builds that clause gets a live case, and filling two historical
rows in from memory is how a wrong date gets written down. *The clause was run here because this retro
appends a row to that very table, which is the one reason anybody looks at it.*

**And the retro's THIRD instrument fact is the one that would have SHIPPED.** Asked for a digest, the
author invoked this plan's own copy script as `mkcopy.py --digest-only`; that script has no such flag
and takes its first argument as a DESTINATION, so it wrote a 427-file copy of the whole tree to
`./--digest-only/` — **inside the repository and outside `.gitignore`**, where `git status` listed it
as 427 untracked files and the next `git add -A` would have tracked every one. It was caught by the
digest itself reading **854 files where the tree has 427**, which is the number that does not lie about
what is on disk. *`dev-dist/` is ignored and a directory named after a flag is not*, so the guard that
keeps twenty-five plans' scratch out of history has no reach over a path the tool invents — and
unlike [Q323](../open-questions.md) and [Q327](../open-questions.md) this is not a KILL but an ARGUMENT,
with no probe, no rung and no exit code involved. Removed, and the tree is the retro's five modified
files with zero untracked.

**Census CONFIRMED — 318 / 245 / 1 / 72 with this retro's own row, from 317 / 244 / 1 / 72** at W101's
close, 318 of 318 in exactly one
cluster cell, by the parser W100 wrote re-run here. *The ordinal is deliberately NOT stated: P23's retro
said TWENTY-FIFTH and P24's stated none, so writing one here would be the inherited count this
repository keeps finding wrong. The predicate is what matters and it held.* **[Q142](../open-questions.md) measured before this
retro's own edits and it does NOT fire**: `M3`'s margin is 15 files and `M4`'s 531 links. *The retro's own
paragraphs land in `doc/plans/`, which probe 2 cuts, and in `CLAUDE.md` and `doc/README.md`, which neither
probe cuts — so `M4` is the one to watch and it has 531.*

### The confirming gate did NOT complete, and this is what ran instead

**`npm run gate` was started three times over the final tree and none of the three finished**, for a
reason outside the retro: the machine's filesystem is degraded by roughly 20-100x, measured rather
than inferred. The first run reached its LAST chain entry and reported `EXIT 1` on `X4` with nine
snippets at *exit null* — [Q425](../open-questions.md), a 30 s per-snippet cap crossed by load.
The second reached `selftests` and **`check:wiring:selftest` ran 46 minutes at 1% CPU** without
finishing, against the 170-200 s that entry is recorded at — which is what found
**[Q426](../open-questions.md)**, the 12 574 empty directories leaked into `dev-dist/` by a sibling
self-test. The third, taken after deleting them, **blocked on `tsc` at 1% CPU with the log frozen**,
and was stopped. *Nothing computes at 1% CPU; all three were waiting on I/O.*

**So the verification is the four rungs this retro's edits can REACH, each RUN and each exit code read**
— and it edits markdown documents only, touching no source, no test, no fixture and no worker:

| rung | verdict, three passes | wall, three passes |
|---|---|---|
| `check:markdown` | **EXIT 0, EXIT 0, EXIT 0** | 131 / 109 / 80 s |
| `check:spec` | **EXIT 0, EXIT 0, EXIT 0** | 93 / 66 / 55 s |
| `check:source` | **EXIT 0, EXIT 0, EXIT 0** | 72 / 80 / 53 s |
| `check:docs` | **EXIT 0, EXIT 0, EXIT 0** — 38 snippets, 32 run each time | 639 / 563 / 618 s |

**TWELVE readings, and the EXIT CODE is the claim while the wall clock is a range.** Section 1 rule 5's
WHEN clause says a measured number is re-taken on the tree the item ships, and a verification table is
where that clause eats itself: writing the second pass's numbers down CHANGES the tree, so the third
pass reports a tree the table cannot describe without a fourth. *The regress stops at what did not
move* — twelve readings, twelve EXIT 0, and `check:docs` counting 38 snippets with 32 run on every
one. The walls are a range because the machine is degraded and because no rung asserts a clock
([Q179](../open-questions.md)). **And the sentence you are reading was written after the third pass**,
which is stated rather than hidden: it changes no relative link, no anchor, no count and no snippet, and
`AGENTS.md` — where all 32 executed snippets live — is byte-identical through every pass, as
`git status` shows five modified documents and nothing else.

**Plus three measurements no rung takes**: the census parser at **319 / 246 / 1 / 72 with 319 of 319 in
exactly one cluster cell**; [W98](../work-items/w98-what-a-row-may-assert-about-a-dispatch-order.md)'s
table checker over all five edited documents, clean but for the two rows
[Q407](../open-questions.md) already declares; and the tree's own content digest, **`434073cf37ca35fb`
over 427 files, identical before the first gate and after the last kill**, so nothing any killed
process touched survived. **Not run: `lint`, `typecheck`, `npm test`, L1-L5, L6 and `selftests`** 
— every one of them unreachable from a markdown edit, and every one of them currently unable to
finish on this machine. *The honest form of a gate that cannot run is the list of what did, beside the
list of what could have been affected, and not a green sentence.*

**ADR 0068 taken at W99; ADR 0069 SKIPPED and not reused. W102 CLOSED unissued. Q410-Q424: W99 used
Q410-Q411 with Q412-Q414 spent, W100 used Q415-Q417 with Q418-Q419 spent, W101 used Q420 with Q421-Q424
spent, and THIS RETRO takes Q425 and Q426 and extends Q407. The next plan starts at W103, Q427 and ADR 0070** — a reserved-and-unused
ADR id is SKIPPED, never reused, which is the rule P22's retro applied to 0063.
