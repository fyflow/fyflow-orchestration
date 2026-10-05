# W43 — The two blocked flows on real workers

**Status:** done
**Plan:** [P12](../plans/p12-what-a-node-receives-and-what-a-decision-sees.md)

```
Spec:       none - this item defines no rule. spec/flow-definition.md v0.12 is
            W41's and W42's and is NOT reopened; FD-C1, FD-C2 and FD-C3 are what
            this item DEMONSTRATES rather than what it decides.
Owns:       examples/**
            (written from P12's index row, not from this item's title -
            doc/workflow.md section 7 rule 2. The row gives ONE tree and it is
            the whole of it: no src/, no spec/, no test/, no scripts/.)
Inputs:     P12's index row for W43 and plan decisions 1-4, read from the PLAN's
            own file; ADR 0040 and ADR 0041, read from doc/decisions/;
            spec/flow-definition.md v0.12 sections 2-3 (needs, the three
            reference forms, FD-C1/FD-C2/FD-C3) and section 6 (FD-R3);
            spec/join-policy.md JP-R11 and JP-R12; spec/task-id.md section 1;
            the two corpus flows W41 added - spec/examples/valid/
            map-with-context.flow.json and map-over-region-output.flow.json -
            and W42's decision-on-an-earlier-step.flow.json;
            examples/l6.ts's Expectation type, ROW_KEYS, PER_REGION_ROW,
            PER_PLAIN_ROW, CROSS_ROW and DECLARED_TOTAL;
            examples/run-flow.ts's buildScheduler pool registry;
            examples/workers/flow-worker.ts's seven roles.
Outputs:    (1) Q166's flow - *score each item against the run's config* - end to
                end on a real FyflowScheduler, in BOTH L6 runtimes.
            (2) Q165's flow - *score, then fan out over the scores* - the same,
                with NO `over: "0"` anywhere.
            (3) A row that exercises W42, without which reverting W42 costs ZERO
                L6 failures (see the declaration measurement below).
            (4) What reverting W41 costs, in L6 failures.
            (5) What reverting W42 costs, in L6 failures.
Depends on: W41 (the projection and the rule), W42 (the edge site)
Blocks:     nothing - P12's last item
Tests:      L6 IS the test, and every expected value is derived from spec/ before
            the first run (doc/workflow.md section 5 rule 1): the dispatched ids
            from spec/task-id.md section 1 and ID-R6, what each instance receives
            from FD-C1/FD-C2 and JP-R11, what the join carries from JP-R12, and
            what a predicate sees from FD-C3. L1-L5 are a REGRESSION this item
            must not move; L6's own assertion floors are what stop a row being
            silently skipped.
Gate:       L0-L6 in three runtimes (both L6 runtimes), then the two
            spec-conformity readers, then rule 8's whole set re-run with the
            readers' edits checked in, then npm run gate.
Reserves:   Q194-Q198. NO ADR - see Scope Out.
```

## Scope

**In**

1. **P12's exit artifact.** The two flows the plan named as *ordinary flows this library cannot
   express today*, expressed and **run on real workers in both L6 runtimes**:
   [Q166](../questions/q166.md)'s *score each item against the run's config* and
   [Q165](../questions/q165.md)'s *score, then fan out over the scores*.
2. **A third row, for W42.** The plan's row asks for *what reverting each item costs measured in L6
   failures*, and measurement 3 below shows that neither of the two flows carries an edge-level
   `needs` — so without a third row that clause is unsatisfiable for W42 and its revert cost is
   **0 by construction**. The row is `decision-on-an-earlier-step` on real workers. It is inside
   `examples/**` and it is what makes the row's own last clause reachable, so it is not a scope
   amendment; it is declared here rather than taken silently.
3. **Whatever `examples/workers/flow-worker.ts` needs to make the rows DISCRIMINATING.** Measurement
   2 below: run today, `map-with-context` scores every instance **0**, because no shipped role reads
   a declared key. A row that cannot tell ADR 0040 rule 6 from its negation is P10's *the thing it
   created went unmeasured*, and W35's own `text` reasoning one rule across.
4. **The two revert measurements**, each in L6 failures, on the tree this item ships.

**Out** — named rather than left implicit, with where it goes instead

- **Any `spec/` change.** `spec/flow-definition.md` is v0.12 and this item demonstrates it. If a rule
  turns out to be wrong on real workers that is a finding and it goes to P12's retro, which is not
  this session — and the correction would be W41's or W42's file, by exception, not a v0.13.
- **Any ADR.** P12 reserved ADR 0040-0041 and both are spent; **0042 is not reserved by this plan**,
  and taking it would make the plan's ledger false — W36's precedent. An exit artifact demonstrates;
  it does not decide. If real workers force a decision, that is a **stop and ask the maintainer**.
- **W44.** Reserved and expected unused, and this item does not need it.
- **Q19's actual question** (is retention bounded), **Q21** redaction, **Q15** resumability, **Q9**
  predicate purity, **Q22**'s constraint decision, and **the gate** — [Q181](../questions/q181.md),
  [Q182](../questions/q182.md) and [Q183](../questions/q183.md) are live, unowned and not P12's.
  All named OUT by the plan.
- **[Q165](../questions/q165.md)'s reducer.** The plan takes *the FLOW as a case and not the reducer
  as a feature*. The flow runs here; `reduce:` is not built and stays unowned.
- **[Q186](../questions/q186.md)** — the cost of pointing a `needs` key at a large value. W41 raised
  it; L6 runs three-word payloads and would measure nothing about it.

## What the declaration measured

*`doc/workflow.md` section 4: measure the load-bearing inputs before building, and expect one to be
wrong.* **Four were taken and two of them are corrections.**

**1. `examples/l6.ts`'s own header is wrong, and it is the THIRD time in the same comment.** It reads
*"Twenty-five real runs"* and *"twenty-five runs and twenty-three row labels"*; the file prints
**31 real runs** and there are **29 labels** (27 `EXPECTED` + 2 `PairRow`, and a `PairRow` is one
label producing two runs — the comment's own predicate). The comment records that this line read
*six* for two rows too long and then *twenty-one* and *nineteen* for the whole of W23, says
**"Derive them"**, and gives the two expressions — and then W35 added five map rows and moved
neither number. *A comment that tells the next reader to derive a number, in the same breath as
carrying it as a literal, is a literal.* **Corrected in place**, and it is this item's first finding
rather than a late exception: the file is in this item's `Owns`.

**2. Neither blocked flow DISCRIMINATES on the shipped worker roles, and one of them proves nothing
at all.** Both run end to end on a real `FyflowScheduler` today — measured before anything was
built, which is the half that matters:

```
map-with-context        completed   ingest, score:0, score:1, score:2, publish
map-over-region-output  completed   ingest, score:0..2, publish:0..2
```

But `map-with-context`'s three instances each returned **`{confidence: 0, score: 0}`**. The `score`
role reads `payload.confidence`, and under a `needs` the payload is exactly the object `needs`
describes — `{item, run}` — so `confidenceOf` returns its total's zero and **every instance computes
the same value**. That is precisely the shape [W35](w35-a-map-on-real-workers.md)'s `text` comment
exists to refuse one rule across: *handed the whole value rather than its own item, every instance
would compute the same score and the row could not tell ADR 0037 rule 3 from its negation.* Here it
is ADR 0040 **rule 6** — *exactly the object `needs` describes, each key its own copy* — and the row
as the corpus writes it cannot see it. **A role that reads its declared keys is a requirement of the
item, not a decoration**, and nothing in the plan's row says so.

**3. Reverting W42 costs ZERO L6 failures against the two flows the plan names.** Neither carries an
edge-level `needs`: `map-with-context` and `map-over-region-output` have no `when` on any edge at
all. So *what reverting each item costs measured in L6 failures* — the last clause of this item's own
plan row — is unsatisfiable for one of the two items it names, and the answer would have been a
truthful **0** that says nothing about W42. Hence Scope In 3.

**4. And the obvious third row cannot discriminate either, for a different reason.** Run today,
`decision-on-an-earlier-step` routes correctly on real workers and the predicate does see its
declaration — `ctx.needs = {"earlier":{"confidence":0.1}}` beside
`ctx.outcome.result = {"confidence":0.1,"score":10}`. **The two carry the same number**, because
`score` passes `confidence` through: a predicate reading `ctx.outcome` instead of `ctx.needs` routes
the run identically, so reverting W42 would cost 0 on this row as well. **What discriminates is a
node whose output DISAGREES with its predecessor's on the field the predicate reads** — and the
shipped `tally` role already is one: it returns `{seen, word}` and carries no `confidence` at all, so
a predicate reading the outcome can never route to review and one reading `needs` always can. *The
discriminating fixture was already in the file; what was missing was the question.*

## Verification

How each clause of `Gate:` is actually run. Name the commands.

| clause | how |
|---|---|
| L0 | `npm run lint` and `npm run typecheck` — **run on their own before the gate**, because `lint` is the chain's first entry since [ADR 0039](../decisions/0039-the-gate-climbs-the-ladder-and-the-self-tests-run-concurrently.md) and W42 was red there **twice** at `exit 1` with zero `FAIL` lines |
| L1-L5 | `npm test`, `npm run test:deno`, `npm run test:browser` — a **regression** here: this item adds no `test/**` case and must not move 633 |
| L1-L5, all browsers | `npm run test:browser:all` **only if L1 moves**, which it must not; stated so the answer is recorded rather than assumed |
| L6 | `npm run test:l6` **and** `npm run test:l6:deno` — both runtimes, which is the plan row's own word |
| the seven static checks | `npm run check:scheduler check:policies check:spec check:source check:markdown check:wiring check:docs` |
| conformity reader | fresh context, `spec/` first and this item's artifact second; reports, does not fix |
| adequacy reader | fresh context, in an **isolated copy**; reports, does not fix |
| rule 8 | the whole set — five obligations, the three requirements on the set, and the requirement on the harness (a control, and the restore asserted) — run once by the author and **re-run after the readers**, with their exact edits checked back in |
| `npm run gate` | last, in the background, with a **control** first: W42's two red runs are this gate's standing evidence that it can fail |

**Routing coverage, per the template.** A branch routed away from its join ([Q4](../questions/q4.md)):
**not applicable** — no row here routes a branch away; `p1-routed-away` covers it and is unmoved.
`user_action` ([Q17](../questions/q17.md)): **not covered by this item's rows**; W6's two rows are
unmoved. No matching decision edge ([Q10](../questions/q10.md)): **not covered** — every decision
row here has a default edge, and the refusal is L1's. A duplicate task id
([Q13](../questions/q13.md)): **not covered directly**, and the map rows are its live pressure —
three instances of one node id at three branch paths, which is `ID-R6`'s whole reason for existing.
A nested fan-out ([Q6](../questions/q6.md)): **not covered by this item's rows**; W23's four rows
and W35's `nested-map` are unmoved.

## Record

**Status: done.** Author pass, both readers, and rule 8's set re-run with the readers' own edits
checked back in.

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L0 — `lint`, `typecheck` | **RAN**, green | `deno lint` 48 files; five `tsc` projects. **Run on its own before the gate**, on W42's precedent — that item was RED here twice at `exit 1` with zero `FAIL` lines |
| L1-L5, node 24 | **RAN**, green | **24 files, 633 cases — UNMOVED**, which is the declared result: this item adds no `test/**` case |
| L1-L5, deno 2.9.6 | **RAN**, green | 633, parity |
| L1-L5, chromium / firefox / webkit | **RAN**, green | 633 in each, `PARITY` in all three. `test:browser:all` was run **although L1 did not move**, because this item edits a file the browser bundle globs a sibling of; the answer is recorded rather than assumed |
| **L6, node 24** | **RAN**, green — **760 assertions over 36 real runs**, from 638 / 31 | P12's exit artifact |
| **L6, deno 2.9.6** | **RAN**, green — **760 / 36**, identical | `RT-R10`, both runtimes, which is the plan row's own word |
| the seven static checks | **RAN**, green | `spec` (7 documents, 40 examples, 87 rules — **unmoved**, this item writes no rule), `source`, `wiring`, `markdown`, `scheduler`, `policies`, `docs` |
| conformity reader | **RAN** | **11 findings, 3 blocking** |
| adequacy reader | **RAN** | **28 mutations, 19 survivors (4 blocking)**, in an isolated copy |
| **overlap** | **2 of 39** | see below |
| rule 8, author pass | **RAN** | 33 probes: 24 caught, 9 declared ceilings, 0 undeclared, 0 crash, 0 aborted — after three rounds of re-anchoring and two fixes to the item |
| rule 8, re-run after the readers | **RAN** | **43 probes: 32 caught, 11 declared ceilings, 0 undeclared, 0 crash, 0 aborted**, with **ten of the readers' own edits checked back in and all ten firing** |
| `npm run gate` | **RAN**, `GATE EXIT=0`, zero `FAIL` lines | 15 chain entries, `selftests — 7/7 completed, 7 ok`, **380.1 s wall / 723.6 s serial-equivalent over 5 lanes**. **A CONTROL was held first**: every entry was run individually green before the chain, and W42`s two red runs — at entry 1 and at entry 15, both with ZERO `FAIL` lines — are this gate`s standing evidence that it can fail. **[Q142](../questions/q142.md) did not fire**: `M3` and `M4` were retuned to 74 and 2700 four documents earlier, and this item adds one |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) **[Q166](../questions/q166.md)'s flow on real workers, both runtimes** | yes — `map-with-context / Q166`, and a second row at another run config | probe 9 renames it out of `ROW_KEYS`: `cross-row` red. Probe 40 hollows its `nodeResults`: red |
| (2) **[Q165](../questions/q165.md)'s flow, with no `over: "0"`** | yes — `map-over-region-output / Q165`, two regions, the second's arity from the first's results | probe 10 drops `rank`'s `needs` and the run stops at `UnresolvedMapArity` |
| (3) **A row that exercises W42** | yes — `decision-on-an-earlier-step` LOW and HIGH | probe 13 is the W42 revert and costs 2; probes 36 and 37 are the reader's edits to the pair and both fire |
| (4) **What reverting W41 costs, in L6 failures** | yes — **18**, on all three map rows | it is probe 12, and it is the measurement |
| (5) **What reverting W42 costs, in L6 failures** | yes — **2**, on the LOW decision row | it is probe 13. **Before this item it was 0** |

**What reverting each item costs, re-taken on the tree this item ships.**

| revert | L6 failures | where |
|---|---|---|
| **W41** — `compose` ignores `needs` | **18** | 4 + 10 + 4 across `map-with-context / Q166`, `map-over-region-output / Q165` and the second run config |
| **W42** — `ctx.needs` is always `{}` | **2** | `decision-on-an-earlier-step LOW`: the `dispatched` list, and `review`'s own result |
| **both** | **20** | additive — neither masks the other, which is why the pair was measured rather than inferred |

**And both numbers were WRONG when first written, in the direction v0.12 change 2 exists for.** They
were taken at 14 and 1, before the item's own last two edits — the second run config and `review`'s
declared result — and **18 − 14 is exactly the four assertions of the row added after the
measurement.** *A measured number is re-taken on the tree the item SHIPS*, and this item broke that
clause on its own headline figures and had it caught by its conformity reader. Fourth instance of
the WHEN clause since it was adopted, and the first on a number that is the item's whole point.

**What broke.**

**The item's two blocked flows RAN and PROVED NOTHING, and its declaration step is what found it.**
Both corpus documents run end to end on a real `FyflowScheduler` — measured before anything was
built — and `map-with-context`'s three instances each returned `{confidence: 0, score: 0}`. Every
shipped worker role reads `payload.confidence`, and under a `needs` the payload is exactly the object
`needs` describes, so `confidenceOf` returns its total's zero and **every instance computes the same
value**. That is W35's own `text` reasoning one rule across — *handed the whole value rather than its
own item, every instance would compute the same score and the row could not tell the rule from its
negation* — and here it is ADR 0040 **rule 6**. A role that reads its declared keys is a requirement
of the item; nothing in the plan's row says so.

**And the SECOND blocked flow's own pair could not discriminate either, for a different reason.**
`decision-on-an-earlier-step` run on the corpus's own spelling routes correctly and the predicate does
see its declaration — but `score` passes `confidence` through, so `ctx.outcome.result.confidence` and
`ctx.needs.earlier.confidence` are **the same number** and a predicate reading either routes
identically. Reverting W42 would have cost 0. The discriminating fixture was already in the file:
`tally` returns `{seen, word}` and carries no `confidence` at all. *The fixture existed; what was
missing was the question.*

**Three lists said the same thing and nothing compared them — obligation (e)'s second question on a
PRODUCT item, and it is W41's shape for the FOURTH time.** `Role`, the `switch` arms in
`FlowWorker.run()`, and the `config: { role }` literals in `buildScheduler`. Measured: one letter in
the pool's role and `run()` falls off the end of a switch TypeScript does not require to be
exhaustive, returns `undefined`, and from a **thread** pool the scheduler's own message handler dies
with `Cannot read properties of undefined (reading 'isWorkerTerminationRequest')` before any
assertion runs — [Q194](../questions/q194.md). Closed in one direction: `ROLES` is the list, `Role`
is derived from it, `pool()` takes a `Role`, so the typo is `TS2345` at **ladder L0** naming all
eight; and `run()` gains a `default` arm that throws naming the role. **The other direction is still
open and the adequacy reader is why it is stated**: a member added to `ROLES` with no arm and no pool
costs zero — [Q196](../questions/q196.md).

**What this taught.**

1. **A SENSOR CANNOT CORROBORATE ITSELF** — [Q195](../questions/q195.md). ADR 0040 rule 6's *exactly*
   can only be observed by something reading the composed payload's key set, and at L6 that is a
   worker. The author's rule 8 pass graded the provenance probe a **declared ceiling** on exactly
   that argument, and named L2 as the second route. **The adequacy reader measured what the ceiling
   cost**: with `keys` re-sourced to a literal, a driver composing an extra key cost **0** where it
   otherwise costs 8. *A ceiling declared with a correct reason is still a hole if the reason is
   about the observer rather than about the fact.* Closed by `extraKeys` — the negative form of the
   same reading, computed by a different expression — and the compound probe now fires.
2. **A discriminating PAIR is a claim, and a claim needs an assertion** — [Q197](../questions/q197.md).
   This item added two rows whose whole purpose is to be the other half of a row beside them, and in
   **both** cases the differing property was carried by literals nothing compared: making the two run
   configs equal cost 0, and making the HIGH decision row LOW cost 0 — and with either done, the
   mechanism underneath could then be deleted for 0 as well. Both are `JP-R9`'s own sentence —
   *compare the two halves rather than copy one of them* — unapplied to the fixtures added for
   exactly that reason. `isLowConfidence` has carried an *"it can fail"* cross-row clause since W5;
   this item's predicate was given none.
3. **A fixture coincidence is not removed by choosing a different number.** The `run` key's
   contribution was indistinguishable from the literal `0.9`; the item changed the payload to `0.4`
   and the literal `0.4` then passed exactly as `0.9` had. **Two fixtures that disagree** is what
   removes it, which is [W34](w34-what-a-branch-receives-and-what-a-join-carries.md)'s finding
   answered with a PAIRED FIXTURE where that item answered it with a COMPOUND PROBE. Nothing says
   which is right when.
4. **An item corrects a count where it is looking and not where it is not.** The declaration step
   found `examples/l6.ts`'s header carrying *"twenty-five real runs and twenty-three row labels"*
   against a printed 31 and 29 — the **third** wrong pair in that comment, in a paragraph that says
   *"Derive them"* and then restates the literals — and fixed it. **Its conformity reader then found
   the same class in `examples/README.md`, which this item also owns**, wrong in four places. The
   header's numbers are now gone rather than corrected; the README's are corrected, because a
   markdown file cannot derive one ([Q100](../questions/q100.md)).

**Obligation (e)'s SECOND QUESTION on a product item — what P12's retro is owed a verdict on.**

v0.12 earned *"was what it RAN what SHIPS"* entirely on `scripts/**` and it had **never been tested
on a product item**. W43 instantiated it deliberately, in the form W41's Record proposed — asked of a
**DECLARATION** rather than of a command: *what does this list have to agree with, and what would say
so?* **It fired, and it produced the fourth instance in one plan of *a LIST BOUND TO NOTHING***:
`RULE_PREFIXES` and an `accepted` list (W41), `EDGE_KEYS` (W42), and the three role lists here. The
first three are `scripts/**` and `src/`; **this one is a worker file and a pool registry, which is as
far from the gate's own wiring as this repository goes** — so the question is not a property of
check-writing. **Two differences worth the retro's attention**: the answer here was a **type**
(`typeof ROLES[number]`) rather than a set-equality assertion, which is available in product code and
not in a `.mjs` check; and it closed **one direction only**, which none of the three earlier
instances did — the check-side ones were set equality *both ways*. *The question generalises; the
answer does not.*

**Overlap: 2 of 39** — the TWENTY-SECOND measurement, inside the settled 0-4 band, both readers
unprimed.
*(This read **the twentieth** until P12's retro. `doc/workflow.md` section 6 lists nineteen measurements ending at W39, and [W36](w36-the-scheduler-pin-moves-to-0-5-1.md) and [W39](w39-what-the-gate-proves-and-what-it-costs.md) number themselves eighteenth and nineteenth in their own Records — so this item is the twenty-second. **All three of P12's items were wrong by two, each inheriting the ordinal from the one before**: W41 took W36's number and W42 and W43 incremented from it. Section 1 rule 5's provenance clause — *any copy including your own* — on a number that was derivable by counting one list. Corrected under section 6 pass 3 rule 6.)*

Their shared subjects: **the revert costs** (conformity by re-running the measurement, adequacy by
hitting it in passing — the same wrong number from two directions), and **the thinness of the W42
row** (conformity noting that declaring `review`'s result would add a second assertion, adequacy
showing the row's whole pair could be collapsed). **The split is again what the two roles predict**:
the conformity reader found **claims that were false** — two revert costs, four counts in
`examples/README.md`, a rule citation, a scope, a `flowId` convention — and the adequacy reader found
**bounds that were not there**, all four of its blocking survivors aimed at what the item CREATED
rather than at what the spec already had, and **three of the four one shape**: *a pair whose
discriminating property is carried by literals nothing compares.*

**`Owns` audit — 8 paths, ZERO undeclared, ONE late exception.**

| late exception | why |
|---|---|
| `doc/plans/p12-*.md` | the `Reserves:` block, extended to **Q198**, and the W43 index-row link. Section 1 rule 5's record-step list names the plan's **Record**, not its declaration block — and **W41 declared exactly this file for exactly this reason one item ago**. W43's conformity reader |

Everything else is inside `examples/**`: `l6.ts`, `run-flow.ts`, `workers/flow-worker.ts`,
`README.md` and the three new flows. **One is the lowest late-exception count of any product item in
three plans** (W32 five, W33 nine, W34 five, W35 three, W41 and W42 eight and ten) — and the reason is
structural rather than a virtue: **an exit artifact owns one tree and writes no rule**, so the
`spec/**`, `AGENTS.md` and `scripts/**` obligations that produced every earlier late column have no
instance here. **[Q142](../questions/q142.md) did not fire** — this item adds one document and the
`M3`/`M4` floors were retuned to 74 and 2700 at W42, four documents earlier.

**The one thing found and NOT fixed, because it is not this item's** — `spec/join-policy.md`
section 4's *"What is NOT decided here"* carries three sentences W41 and W42 falsified: *an ordinary
edge still carries the previous node's `result` unchanged*, *a per-edge mapping is still unbuilt*,
*[Q166] is Q11-in-general's to fix* (ADR 0040 closes it), and *a predicate still receives one field*.
They survived because `spec/flow-definition.md`'s v0.11 and v0.12 headers both assert that
join-policy section 4 is **untouched** — **true of its rules and false of its prose**. W43 owns no
`spec/**` and writes no rule; correcting them is section 6 pass 3 rule 6's case, **for P12's retro**.
Found by W43's conformity reader while reading the spec before the artifact, which is the whole
argument for that ordering.

**Questions raised.** [Q194](../questions/q194.md) a worker with no arm for its role kills the
scheduler's own handler. [Q195](../questions/q195.md) a sensor cannot corroborate itself.
[Q196](../questions/q196.md) `ROLES` binds its uses and not the switch arms.
[Q197](../questions/q197.md) a fixture coincidence moves rather than vanishes when the fixture
changes. [Q198](../questions/q198.md) a cross-row bound cannot detect its own vacuity and L6 has no
self-test.

**Resolved:** none. **That is what an exit artifact looks like in the register** — it demonstrates
decisions other items took, and the questions it answers were closed by ADR 0040 and ADR 0041.

**Census re-derived: 155 questions — 107 open, 2 deferred, 46 resolved**, 41 ids in both tables, both
halves at 155 of 155 in exactly one cluster cell, **CONFIRMED for the eleventh plan running**. The
parser was written **from scratch** from the register's own note and **aborted ZERO times on its
first run** — the second time that has happened and the first on a product item — then aborted
**five** times, correctly, on this item's own new ids in no cluster cell, which is W34's instance for
the fourth consecutive item.
