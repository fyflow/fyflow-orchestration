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
| **7** | **A WRONG key path is caught by NOTHING.** A typo (`sereis.id`), a path the producer does not emit (`series.slug`) and a nonsense one (`name.id`, where `name` is a string) each give `validateDefinition` **0 findings** and `checkWiring` verdict counts **identical to the correct flow**, with **not one verdict mentioning a key, a gate or a route**. Only an EMPTY key is refused, by `FD-V40`'s shape clause — *the grammar catches an absent key and nothing catches a wrong one* | Constructed from `tv-ingest`, five keys, read-only on the live tree |
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
| `examples/flows/tv-ingest.flow.json` | likely | no | likely | the one gate flow the corpus runs |
| `examples/l6.ts` | no | no | **owns** | the W94 clause is W101's to replace |
| `AGENTS.md`, `README.md` | no | no | **owns** | the session and its `X8` twin |
| `examples/registry.json` | possible | possible | likely | a second gate type, or a second worker for the session |
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
revert that crashes L6 at module link with zero failure lines) is W101's hazard by construction, since W101
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

*Filled in when the plan is complete.*
