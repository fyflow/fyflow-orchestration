# W108 — A predicate is data

**Status:** done — see the Record.
**Plan:** [P26](../plans/p26-what-a-flow-can-say-without-code.md)

```
Spec: spec/flow-definition.md — a `when` may be a declared PREDICATE, and the FD-V family that
      refuses one. Version bump expected; the refusal count MOVES.
Owns: spec/flow-definition.md, src/driver/routing.ts, src/definition/validate.ts,
      test/driver/decision-context.test.ts, test/definition/predicate.test.ts (new),
      spec/examples/invalid/** (the FD-V fixtures), spec/examples/valid/** (one document),
      doc/decisions/0074-*.md, doc/work-items/w108-a-predicate-is-data.md
Inputs: P26 facts 1 and 2, each RE-TAKEN at this declaration rather than transcribed —
        fact 1 (jsonata's only evaluation entry returns a Promise; `selectEdge` is synchronous
        and pure; `driver.ts` holds 2 async/await) and fact 2 (the eight predicate shapes in
        the tree, of which THREE are not path+op+literal). Q444, Q9, Q251.
Outputs: (1) a `when` may be a registered NAME or a declared PREDICATE, and the name road is
             BYTE-UNCHANGED — asserted as an identical dispatch comparison, not as prose
         (2) the subset covers all eight shapes fact 2 measures, and REFUSES outside itself
             BY NAME (ADR 0053's shape), with the enumeration CLOSED and flat `all`/`any` only
         (3) every refusal is at CONSTRUCTION with its position, never at routing time —
             ADR 0002 rule 1's actual property, `FD-V36`'s precedent
         (4) a declared predicate CANNOT be impure, which is strictly stronger than Q9's
             measured 1-of-4 and is asserted rather than argued
Depends on: nothing. W109 is independent and SERIAL only because both edit the grammar
Blocks: W109 (the grammar's version), W110 (the exit artifact needs both)
Tests: L1 (the grammar, every FD-V both ways), L2 (routing from a fixture outcome log —
       where this repo's value is proved and where the evaluator lives), L4 (the corpus),
       check:spec (C4's count, C7), check:docs (AGENTS.md section 3's refusal count — X7)
Gate: npm test, check:spec, check:docs, npm run gate
Reserves: W108, Q444-Q450, ADR 0074
```

## Why

**A flow document cannot say what a branch depends on.** `when` names a predicate registered in
code, so the reference is data and the logic is not — and that is the last thing in this library
that a flow document cannot say for itself. [Q444](../open-questions.md) is the row; P26 is the
plan; `doc/concept.md` section 5's invariant is what makes the answer safe, because a predicate
that is data cannot reach a clock, a random source or the network.

## What to be careful of

1. **The name road must not move.** Every existing flow, every corpus document and all four of
   `PredicateRegistry`'s live consumers keep working, and the evidence is a byte-identical
   dispatch comparison of two runs — the device W59 used for a bare `workerType` node — not a
   sentence saying nothing changed.
2. **Fact 2 is a claim about THIS tree and nothing else.** It measures what eight predicates
   here need; it says nothing about what a consumer writes. The enumeration is CLOSED and
   refuses outside itself by name, which is ADR 0053's shape and is what stops this becoming a
   bad expression language one shape at a time. **The refusal is the deliverable as much as the
   subset is.**
3. **The absent path is a DECISION, not a default.** `(outcome.result.score ?? 0) > 0.5` is one
   of the eight shapes, and what a missing path compares as has to be stated in the grammar —
   silently reading `undefined` as `0` is the class of defect `FD-R2` exists for, one layer over.
4. **`readKeyPath` and W100's refusal walk are REUSE, and the scope differs.** That walk was
   built for an arc leaving a GATE; a decision reads `ctx.outcome.*` and `ctx.needs.*`, and
   `outcome.taskId` is the second most-read root in the tree. Whether the walk applies unchanged
   is a measurement this item takes, not an assumption it inherits — P26 prediction 2's own
   reversal condition.
5. **The evaluator goes where routing is PURE.** `selectEdge`'s comment says so and `FD-C3` gives
   each edge its own context. An evaluator that touches anything but its argument has broken
   ADR 0014, and that is the sentence this item's adequacy reader should try to falsify first.

## Declaration step — every input RE-TAKEN, and fact 2 was wrong for a THIRD time

Measured on `59e4ad6` (the declaration committed and gated — `npm run gate` **EXIT 0, zero FAIL
lines**, L1-L5 **54 / 1446** in three runtimes, L6 **2176 / 154**, `check:spec` **7 / 65 / 126**,
`C4` at **37**). Spawn health taken first: `node -e ""` through `spawnSync` is a **52.8 ms** median
over twelve, against the ~54 ms a healthy machine gives — so every figure below is about the change
and not about the machine ([Q179](../open-questions.md)'s own precondition).

### Fact 1 re-takes STRONGER than it is written

`jsonata` **2.2.2** as installed. The expression object's whole surface is `assign, ast, errors,
evaluate, registerFunction` — five members, exactly as the plan says, and **the only entry matching
`/sync|eval/` is `evaluate` itself**. `evaluate()` returns `[object Promise]`. `selectEdge` is
declared `function`, returns `RoutingResult`, and `src/driver/routing.ts` holds **0** `async`/`await`
in code.

**And `driver.ts` holds ZERO in code, not two.** One occurrence in the whole file, at line 3033, and
it is **inside a comment** — the sentence about a language's evaluator being async. The file is
**3730** lines of which **1159** are code. P26 fact 1 is corrected in place; its conclusion is not
merely intact but stronger, because there is nothing there to make async around.

### Fact 2 re-takes as TEN bodies over ELEVEN sites, and one of the two it missed is a new SHAPE

Scanned over `src/ test/ examples/ scripts/` and both corpora. Eleven registration sites hold a
predicate body that READS its context; constant `() => true` / `() => false` fixtures and
`driver.test.ts:125`, which is instrumentation returning a constant, are not shapes.

| | site | body | shape |
|---|---|---|---|
| 1 | `examples/run-flow.ts:191` | `typeof r?.confidence === 'number' && r.confidence < 0.5` | typeof-guard + compare |
| 2 | `examples/run-flow.ts:228` | `typeof r?.score === 'number' && r.score < 50` | typeof-guard + compare |
| 3 | `examples/run-flow.ts:214` | `typeof e?.confidence === 'number' && e.confidence < 0.5`, root `needs` | typeof-guard + compare |
| 4 | `test/driver/resume.test.ts:82` | `(r?.score ?? 0) > 0.5` | absent-DEFAULT + compare, **unguarded** |
| 5 | `test/driver/resume.test.ts:84` | `!isHigh(ctx)` | **NEGATION — fact 2 does not list it** |
| 6 | `test/matrix/scenarios.ts:221` | `r?.bail === true` | equality, root `outcome.result` — **fact 2's only equality is on `needs`** |
| 7 | `test/driver/decision-context.test.ts:225` | `needs.earlier?.flagged === true` | equality |
| 8 | `test/driver/decision-context.test.ts:396` | `needs.mine?.flag === true` | equality |
| 9 | `test/driver/decision-context.test.ts:556` | `outcome.taskId.startsWith('r1:publish:')` | string prefix |
| 10 | `test/driver/decision-context.test.ts:597`, `:624` | `(needs.f ?? []).length > 0` | array `length` + absent-default |

**The ROOTS, by BODY rather than by text occurrence: `ctx.needs` 5, `ctx.outcome.result` 4,
`ctx.outcome.taskId` 1.** Fact 2's `6 / 5 / 8` re-takes as `5 (+1 in prose) / 5 / 31` counted as text
over whole files, and those counts are dominated by ASSERTION sites in one test file —
`decision-context.test.ts` reads `ctx.outcome.taskId` five times and **four of the five are a test
locating a captured context**, not a predicate. *The conclusion survives and its ordering reverses:
`needs` is the most-read root, not `result`.*

### The measurement that decides the absent-rule, and it is the negation that forces it

A candidate evaluator — key path + type-strict operator + literal, with the absent-rule as a
parameter — run against the ten JS bodies verbatim over **1800 contexts** (20 results × 18 `needs`
× 5 task ids, covering absent, `null`, wrong-type, boundary and in-range):

| absent-rule | bodies agreeing on all 1800 |
|---|---|
| **absent is NO MATCH** | 8 of 10. `notIsHigh` agrees **720 / 1800**; `isHigh` **1710 / 1800** |
| **absent substitutes a declared `default`** | 9 of 10. `isHigh` still **1710 / 1800** |

Three things fall out, and each is a decision rather than an observation:

1. **The three `typeof`-guarded bodies reduce EXACTLY — 1800 / 1800 — and only because the comparison
   is TYPE-STRICT.** Under JS comparison `{confidence: "0.4"} < 0.5` is **true** and the body is
   **false**, so a loose subset would disagree on every wrong-typed value. *Fact 2's reduction is
   right and its reason is unstated.*
2. **A NEGATION is expressible only when a comparison may carry a `default`.** Under *no match* both
   `score > 0.5` and `score <= 0.5` are false for an absent path, so **no pair of operators
   complements** and `!isHigh` has no form; with `default: 0` the complementary operator is exact.
   So the six comparisons being closed under negation (`==`/`!=`, `<`/`>=`, `>`/`<=`) buys nothing by
   itself — *the absent-rule is what makes the closure real*, and `?? 0` is already one of the
   measured shapes.
3. **`isHigh` disagrees at 1710 / 1800 under BOTH rules, and the 90 are `{score: "9"}`.** Its JS body
   has no `typeof` guard, so it coerces; a type-strict data form says no match. **This is a real
   divergence and it is in the safe direction** — it is `FD-V30`'s own argument (*a string
   `maxRetries` retries by coercion*) one rule over. It means *the subset covers the ten shapes* is
   true of every value these flows can produce and **false of a string where the JS body coerces**,
   which the grammar must say rather than leave to be discovered.

### `readKeyPath` is REUSE UNCHANGED; W100's refusal walk is NOT, and the reason is measured

Point 4 of *What to be careful of* is a measurement, and it came back clean on one half and
negative on the other. Captured from a **real `DecisionContext`** through a real `Driver`:

| | plain object? | frozen? | `readKeyPath` reaches it |
|---|---|---|---|
| `ctx.outcome` | **yes**, 11 own keys | no | `outcome.result.confidence` → `0.4` |
| `ctx.outcome.result` | **yes** | no | `outcome.result.nested.deep` → `7` |
| `ctx.needs` | **yes** | **yes** — and freezing does not change a prototype | `needs.anything` → `undefined` |

**So the whole context is addressable by ONE key path rooted at `ctx`**, with `outcome` and `needs`
as ordinary first segments, and `readKeyPath` is reused with **zero** change. The hazard it brings is
the one P25 exists for: a first segment that is neither root resolves to `undefined` silently, so a
typo'd `outcom.result.x` is a wrong key — which is why the grammar must **refuse a first segment
other than `outcome` or `needs` at construction**, and that refusal is the same clause whether or not
the root is a separate key.

**W100's refusal walk does NOT carry over, and the measurement says why.** That walk refines a
producer's schema along a key path; a decision's second root is `outcome.taskId`, and
`ctx.outcome`'s eleven own keys are the DRIVER's — `taskId`, `terminalState`, `attempts`,
`observedAt`, `startTime`, `endTime`, `executionTime`, `schedulerTimestamp`, `kind`, `error`,
`result`. **No schema describes any of them except `result`**, so the walk's premise is false for
1 of the 10 bodies and for 2 of the 3 roots. A wiring verdict over a predicate's key path is
therefore a different item's, and this one takes none. **P26 prediction 2 is REVERSED, and not by the mechanism it named.** Its reversal column says *a
grammar key colliding with `when`'s current string form*, and that condition is re-taken and does
**NOT** fire — `when` is a string today and the discriminator is `typeof`, so there is no collision.
**The prediction itself — *W108 moves no existing flow and no existing predicate* — is false**: the
maintainer's answer to stop-and-ask (b) retires the bare string, and `git diff --name-only` over the
three corpus directories is **21 existing flow documents moved**. *(This paragraph reported only
that the CONDITION did not fire, which is a different act — W108's conformity reader, 14. A
prediction reversed by a DECISION rather than by its named mechanism is a shape P26's retro should
read beside P15's *a reversal clause DIRECTS an item*: here a stop-and-ask reversed one.)*

### What NOTHING in the tree exercises, said rather than left looking covered

**Not one of the ten bodies is a conjunction or a disjunction of two paths.** The three that look
like one (`typeof X && X < t`) collapse to a single leaf, measured above. So P26 decision 3's flat
`all` / `any` is exercised by the corpus at **ZERO**, and **prediction 1 is confirmed vacuously by
this tree** — it says the subset needs no composition beyond flat `all`/`any`, and the tree needs no
composition at all. The cases must be **CONSTRUCTED**, which is rule 8's *construct the case that
makes each guard fire, and where the corpus cannot express one, record that*; whether two conditions
are enough is [W110](w110-a-flow-a-ui-could-have-emitted.md)'s to answer, not this item's.

### The five STOP-AND-ASKS, put to the maintainer on 2026-10-02 and answered the same day

**Five shipped files cite this list by letter and it existed nowhere** — `spec/flow-definition.md`,
`spec/README.md`, `doc/decisions/0074-*.md` and `src/definition/types.ts` cite *(b)*, and
`src/driver/routing.ts` cites *(d)*. W108's conformity reader (5), and it is `doc/workflow.md`
section 1 rule 5's provenance clause from the other end: two SOURCE files carried an address that
resolved to nothing.

| | the question, priced | the answer |
|---|---|---|
| **(a)** | the JSON SHAPE of a declared predicate: named keys `{ path, op, value }` against a prefix form `{ "lt": [path, value] }`. Priced against the three declared-object precedents here — `retryPolicy { maxRetries, backoffMs }` (`FD-V30`, 5 clauses), `transform { lang, expr }` (`FD-V37`), a gate type's five keys (8 clauses) — all named-key objects with a CLOSED key set | **named keys**, AS RECOMMENDED. In the prefix form the key IS the operator, so a typo'd `ltt` reads as an undeclared key rather than an unknown operator, and a leaf and a group become one shape |
| **(b)** | does `when` keep its STRING form for names, or do both become objects? Priced at 24 corpus sites, 69 in-code sites and 2 in spec prose | **both become objects**, `{ "predicate": "x" }` — **AGAINST the recommendation**, for one uniform shape, and it is what makes this item BREAKING. The migration moved 102 sites in 38 files |
| **(c)** | how are the two ROOTS addressed — a key path over `ctx`, or a separate `root` key? Measured: `ctx.outcome`, `ctx.outcome.result` and the FROZEN `ctx.needs` are all plain objects, so `readKeyPath` reaches the whole context unchanged | **a key path over `ctx`**, first segment refused unless `outcome` or `needs`, AS RECOMMENDED. A `root` key adds a key and a refusal and the first-segment refusal is the same clause either way |
| **(d)** | what does a comparison do with a value it cannot compare — an ABSENT path, and a wrong-typed one? Measured over 1800 contexts: *no match* alone makes the NEGATION shape inexpressible at 720 / 1800 | **absent is NO MATCH, a comparison may declare a `default`, and comparisons are TYPE-STRICT**, AS RECOMMENDED. *(Both readers then found the answer's own gap: `default` fired on `undefined` alone, so a key holding `null` was not `??`. Corrected in the code.)* |
| **(e)** | the package VERSION, since (b) makes this BREAKING and P26 never priced one. Precedent: P22 answered `0.4.0` at W86's close with W84 and W85 shipping the shape unmoved; P24 moved at W94's | **`0.7.0` at W110's close, the manifest UNMOVED here**, AS RECOMMENDED — and the L6 corpus migrates with L6 RUN and UNMOVED, also as recommended |

### The seams a new `FD-V` family reaches — enumerated, not discovered late

**Seven code readers of `when` in the whole tree**, and the sweep is the whole of the surface:

| reader | what this item does to it |
|---|---|
| `src/definition/validate.ts:879` — `FD-V4` | **narrowed to the string form.** It fires today on `typeof ed.when !== 'string'`, so an object `when` is refused as *"when names "[object Object]""* until it is narrowed |
| `src/definition/validate.ts:996` — `FD-V7`'s default edge | `when === undefined`. **Zero change**, and asserted rather than stated |
| `src/definition/validate.ts:1007` — `FD-V7`'s join edge | `when !== undefined`. **Zero change** |
| `src/definition/validate.ts:892` — `FD-V41` | a gate's edge may carry no `when`. **Zero change** |
| `src/driver/routing.ts:103-105` — `selectEdge` | branches on the form; the name road must stay byte-identical |
| `scripts/check-spec.mjs:316` — **`C7`** | **MEASURED RED.** A valid corpus document with an object `when` gives `C7: predicate "[object Object]" is not in registry.json` at `check:spec` **EXIT 1**. A declared exception |

**The migration, with its SCOPE, because one measurement was reported as two.** The survey over the
whole tree found **105 sites in 41 files**, which counts `doc/**` and the `.md` prose; the migration
CHANGED **102 sites in 38 files**, which is that set less the three `doc/` quotations left as
history. Both figures shipped, in different files, with no scope attached to either — W108's
conformity reader (6), which re-took both and reproduced the file counts and neither site count,
because its own regex counted key occurrences rather than string-valued ones.
| `scripts/check-spec.mjs:325` — `C7`'s `FD-V4` fixture clause | `.map(e => e.when).filter(Boolean)` counts an object as a name; untouched, because no `FD-V4` fixture carries a declared predicate |

And the document-side seams: **`C4`**'s count against three copies (`spec/README.md`'s bold, its
`"C4 covered N definition refusals"` quote, and `spec/flow-definition.md`'s own version paragraph);
**`C8`**'s version column; **`X7`**, which compares `AGENTS.md`'s refusal count **and its id range
end** to section 5's rows; **`spec/examples/invalid/`**, one fixture per new id, which `C4` requires
to exist. *(W99 found `C4` refuses a rule id whose fixture CANNOT exist — a gate type is code. Every
refusal this item takes is about a key in a FLOW DOCUMENT, so each one is expressible as a
flow-plus-registry document, and that is confirmed per id before the id is taken.)*

### Declared exceptions, at the declaration

- **`doc/plans/p26-what-a-flow-can-say-without-code.md`** — facts 1 and 2 corrected in place, above.
  A plan is on nobody's `Owns` once declared.
- **`src/definition/types.ts`** — `Edge.when` is `when?: string` at line 61 and must widen. In no
  `Owns` and in no row of P26's item table.
- **`scripts/check-spec.mjs`** — `C7`'s predicate clause, measured red above.
- **`spec/README.md`** — its version column moves with `spec/flow-definition.md` (`C8`), which
  `doc/workflow.md` section 1 rule 5 records as an `Owns` question rather than a record-step one.
- **`AGENTS.md`** — section 3's refusal count and id range end are `X7`'s subject and move with the
  family. The reference is also the only document a consumer reads for what a `when` may be.
- **`test/definition/l4-corpus.test.ts`** — the suite census, which every new suite and case count
  reaches. W100's conformity reader found this one for W100 and it is taken in advance here.
- **`examples/registry.json` / `spec/examples/registry.json`** — only if a fixture needs a name they
  do not declare; predicted NOT needed, because a declared predicate names nothing. **Correct: not
  needed.**

### The exceptions this list MISSED — TWENTY-FOUR paths, found by the conformity reader

**The sweep above enumerated the READERS of `when` and the migration touches its CARRIERS**, and the
item's own seams section called that sweep *the whole of the surface*. It is the surface of the
GRAMMAR change and not of the MIGRATION, which the declaration had already priced at 38 files.
W108's conformity reader (9), from `git status --porcelain` against the `Owns` block:

| | why |
|---|---|
| **`test/driver/predicate.test.ts`** | **a NEW FILE in nobody's `Owns`** — the block names `test/definition/predicate.test.ts (new)` and the L2 suite is a second file. The sharpest of the twenty-six, because `Owns` is what a reader audits against |
| `examples/flows/**` — eight documents | the L6 corpus migration, which stop-and-ask (e) authorised and this list did not name |
| `test/**` — thirteen files | the migration's 64 in-code sites, plus `test/definition/wiring.test.ts`'s arc census and `test/definition/l4-corpus.test.ts`'s two new clauses |
| `spec/outcome-record.md` | section 4's corpus split, which the new valid document moves — **predicted by nothing**, and found by the suite that re-derives it on every run |
| `scripts/check-docs.mjs` | `RUN_FLOOR` 32 → 33, Q102's ratchet. A shipped comment there says *declared in that item's exceptions table* and it was not — the conformity reader (8). It is now |
| `scripts/check-spec-selftest.mjs` | three probe strings that must match the migrated corpus text |

*(The reader counted **twenty-six** and the number is **TWENTY-FOUR**: `README.md` and
`doc/decisions/README.md` are two of the record step's own SIX files and are not exceptions at all.
Re-derived here by classifying all 60 changed paths against the `Owns` block, the record-step list
and the declaration — **25 `Owns`, 6 record step, 5 declared, 24 late** — rather than by copying the
reader's figure, which is `doc/workflow.md` section 1 rule 5's provenance clause on the one number
in this section that a reader handed me.)*

*Twenty-four late against five declared. Not one of the twenty-six is predictable from a FILE SET —
each is created by what the change CONTAINS — which is P10's retro's finding and the standing reason
an `Owns` pre-declaration rule has been refused for thirteen plans.*

## Verification

| clause | how it is run |
|---|---|
| L1 — the grammar, every `FD-V` both ways | `node test/runner.ts`. `test/definition/predicate.test.ts`: every one of the seven operators ACCEPTED and sixteen plausible non-members REFUSED BY NAME under the same claim; `FD-V42`'s three shapes and their key lists; `FD-V43`'s eight-case root list; `FD-V45` on BOTH group kinds; and `FD-C7`'s evaluator table over absent, `null`, wrong-type and boundary |
| L2 — routing from a fixture outcome log | `node test/runner.ts`. `test/driver/predicate.test.ts`: a flow routes both ways on one definition and two payloads **with an EMPTY predicate registry**, asserted as one named object rather than five literals |
| L4 — the corpus | `npm run check:spec` `C1`/`C3`/`C4`/`C7`; `spec/examples/valid/declared-predicate.flow.json` carries all three shapes and all seven operators in ONE document |
| L6 — UNMOVED | `npm run test:l6` and `npm run test:l6:deno`. The ten L6 `when` sites migrate to `{ predicate }` and no row is added; **2176 / 154 in both runtimes is the declared result** |
| `check:spec` | `C4`'s count against three copies, `C7`'s predicate clause (rewritten — measured RED first), `C8`'s version column |
| `check:docs` | `X7`'s refusal count and id-range end, `X4` over the new section 4 snippet, `RUN_FLOOR` 32 → 33 |

**The sentence this item's adequacy reader was asked to falsify first**, named here rather than left
implicit: *the evaluator goes where routing is PURE — an evaluator that touches anything but its
argument has broken [ADR 0014](../decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md)*.
**It falsified the auditable half and not the behavioural one**, which is finding 10 below and
[Q450](../open-questions.md).

**Obligation (f) — break the ORDER — has nothing to break here, and that is measured rather than
assumed.** This item adds no L6 row and no worker; all ten `when` sites in `examples/flows/**` are
the `{ predicate }` form after the migration, and `examples/run-flow.ts` registers the same three
functions. Confirmed by the adequacy reader (13).

## Record

**Status: DONE.**

**Gate — what ran.** Every rung RUN and its exit code read on its own line, never piped.

| Clause | Verdict | Notes |
|---|---|---|
| `npm test` (L1-L5) | **RAN, EXIT 0** | **56 files / 1479 cases** in node 24.20.0, deno 2.9.6 and chromium, from 54 / 1446 |
| `npm run check:spec` | **RAN, EXIT 0** | **7 documents / 70 examples / 131 rules**, *C4 covered 41 definition refusals*, from 7 / 65 / 126 |
| `npm run check:docs` | **RAN, EXIT 0** | **39 snippets — 33 run, 6 check**, X1-X11 all ok |
| `npm run test:l6` / `:deno` | **RAN, EXIT 0** | **2176 assertions over 154 real runs in BOTH runtimes — UNMOVED**, the declared result |
| `npm run gate` | **RAN, EXIT 0, zero FAIL lines** | the confirming gate, on the final tree |
| conformity reader | **RAN** | 19 findings, **2 blocking**. Central obligation: **ZERO disagreements on the VALUES** |
| adequacy reader | **RAN** | 42 mutations, 23 survivors, 13 findings, **8 blocking** |
| rule 8, final pass | **RAN** | the whole set re-run with the readers' exact edits checked in |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) a `when` may be a NAME or a declared PREDICATE, and the name road is BYTE-UNCHANGED, asserted as an identical dispatch comparison | **yes, and the claim is NARROWER than declared** — the name road's SPELLING moved, by the maintainer's answer to stop-and-ask (b); what is byte-unchanged is the DISPATCH | probes `b1` (the comparison made a tautology — caught by the identity control the adequacy reader forced) and `R-adq4b` |
| (2) the subset covers all the shapes fact 2 measures and REFUSES outside itself BY NAME, the enumeration CLOSED and flat `all`/`any` only | yes | probes `a8` (an eighth operator admitted), `b2`/`d2` (the non-member list emptied), `d3` (the member loop narrowed), `a12`/`R-adq3a` (nesting accepted) |
| (3) every refusal is at CONSTRUCTION with its position, never at routing time | yes — and **its position and its message had NO observer until the adequacy reader (9)** | probes `b3`, `w3`, `R-adq9a`, `R-adq9b` |
| (4) a declared predicate CANNOT be impure, strictly stronger than Q9 and **asserted rather than argued** | **the guarantee yes, the ASSERTION no** — it is a property of the SOURCE and no rung reads the source | probe `R-adq10` is the declared ceiling and `R-adq10b` its pair; [Q450](../open-questions.md) |

**Rule 8 — FOUR passes, the last two with the readers nineteen exact edits checked in.**
Final pass: **72 probes — 58 CAUGHT, 10 declared ceilings, 1 declared CRASH, 1 control clean, ZERO
undeclared survivors, ZERO wrong-reason, ZERO aborts, ZERO against declaration**, and the content
digest is **IDENTICAL at both ends of every pass**. Both GRADER controls — one whose right verdict is
CRASH, one whose right verdict is WRONG-REASON — were right on all four passes, and on their FIRST
outing both came back SURVIVED, because the two grader-control EDITS did not do what they claimed: an
overload signature is not a throw, and a message no assertion reads is not a failure. *A controlled
grader found its own controls wrong before it graded anything else.* The author pass found **seven real survivors**; the
readers found **eight more blocking**, every one of which is now a probe that fires.

**What broke.** Twenty-one things, and the ones worth carrying:

1. **BOTH READERS FOUND THE SAME DEFECT FROM OPPOSITE ENDS, and it is the item's biggest** — the
   pair's only shared SUBJECT. `default` was substituted for `undefined` alone, and `readKeyPath`
   returns a terminal `null` as a RESOLVED value, so on a key holding `null` an operator and its
   complement were **BOTH false** and the declared form was not `??`. The adequacy reader reached it
   by mutation and the conformity reader by running the JS body against the declared one with no
   mutation at all. **Five documents said *it is `?? 0`*** — the spec, the reference, the type, the
   ADR and a test comment. *The 1800-context measurement at the declaration step is what should have
   caught it and did not: its table carries `{ confidence: null }` and never `{ score: null }`, so
   the one root that uses `default` was never given a null. A value kind covered on one root is not
   covered.* Fixed in `evalLeaf`, in two statements rather than one, because a blanket *null is no
   match* would have broken `eq null`.
2. **The second blocking conformity finding is the same sentence from the other side**: *the six
   comparisons are closed under negation*, stated flatly in six places, is **false for every resolved
   non-number** — `gt` and `lte` are both false for `"9"`, and no `default` fires on a path that
   resolved. The code is right and type-strictness is deliberate; the SENTENCE needed its scope, and
   the two paragraphs stating it contradicted each other fifteen lines apart.
3. **`readKeyPath` was swapped for a naive property walk for ZERO.** The evaluator's resolution was
   bound by nothing but the paths the other cases happened to use, so `outcome.result.toString`
   would have answered about `Object.prototype.toString` — W65's, W74's and W99's class one layer
   along. Closed by a five-shape case with its own control.
4. **The empty predicate registry was five literals and a sentence.** Populating `new Map()` at every
   site cost ZERO, so *a flow routes on DATA with no predicate registered at all* — the item's whole
   point — was unbound. One named object, asserted empty.
5. **Both of this item's suites were EMPTIABLE for zero.** `l4-corpus.test.ts`'s census is over suite
   NAMES, and W88 and W89 each added a per-suite CASE COUNT for exactly that reason; W108 took the
   census row and not the count. 1477 → 1453 with every check green. *The counter-measure existed,
   was two lines, and was in the file this item had already edited.*
6. **The byte-identical dispatch comparison was a tautology one token away, and v0.21's own answer
   was unavailable**: both sides were STRINGS, and identity cannot exist over equal strings. Closed
   by returning the arrays — [Q447](../open-questions.md).
7. **Three of the four rows in the L1 suite's own SELECTION table described fixtures that are not in
   the file** — a two-segment path that is three segments, an `ORDER_SENSITIVE` identifier that does
   not exist, and *no fixture uses `eq` as its only operator* when the file's own helper defaults to
   `eq`. The selection WAS bound; the table said it was bound by something else.
8. **Five shipped files cite *W108's stop-and-ask (b)* or *(d)* and the list existed nowhere** — two
   of them SOURCE files. The decisions were taken and recorded in the conversation and never written
   into the item. Written now, as the section above.
9. **The `workerType` correction was made at one site and the identical defect shipped twice more in
   the same document**, 150 lines either side of the note recording the correction — section 1 rule
   5's withdrawn-claim clause, broken by the item that was quoting it. [Q449](../open-questions.md).
10. **Output (4)'s *asserted rather than argued* is false.** An `evalLeaf` reading `Date.now()`,
    `Math.random()`, a module-level cell and the predicate registry passes **every rung at exit 0**;
    only one whose state MOVES an answer is caught. The guarantee is the source's and no rung reads
    the source — [Q450](../open-questions.md).
11. **My own purity test was FLAKY and five runs is what found it.** It compared two runs' fold
    inputs including real clock reads, passed on its first sample and failed on its second by one
    millisecond — section 5 rule 5's class, in this item's own test. Both the driver's `now` and the
    settlement detail's `timestamp` are pinned now, and the assertion says what it holds still.
12. **ADR 0074's fact 4 carried numbers that contradicted the item's own table two documents away**
    (*nine of ten*, *1800 of 1800*, under a headline saying *exactly*), and its alternatives row said
    *the walk's premise is false for 2 of the 3 roots* when `needs` IS schema-describable by
    `wiring.ts`'s own `composed()`. The conformity reader re-derived all 1800 contexts independently
    and reproduced the item's figures to the number.
13. **`spec/README.md`'s row put v0.27 BEFORE v0.26**, so the row's closing present-tense sentence
    read *the count stays 37* — and `C4` was green only because that sentence does not use the
    spelling its regex reads.
14. **The exceptions table was short by TWENTY-FOUR paths, one of them a NEW FILE** in nobody's
    `Owns`. The declaration's seams sweep enumerated the READERS of `when` and the migration touches
    its CARRIERS, which it had already priced at 38 files. *(The reader said twenty-SIX and the
    number is twenty-four — two of its rows are record-step files. Re-derived by classifying all 60
    changed paths rather than by copying the figure, which is the same clause this item kept finding
    broken in other people's documents.)*
15. Two `python -c` edits had their backticks eaten by the shell, corrupting a comment and an index
    row — found by auditing every added line for the signature, not by reading. My own discipline
    rule, broken twice in one session.
16. An assertion asserted a position I had **guessed** (`score.edges[0]`); it is `score#edge0`, built
    by `validate.ts:1032`. Caught by a syntax error in the same line, not by the claim being checked.
17. A refusal MESSAGE claimed a restriction neither the code nor the spec had — an array `default`
    with no `length`. The restriction is right, so the CODE moved to the message.
18. `git stash` on a tree whose untracked new files depend on its tracked changes produces a
    meaningless measurement, and briefly put this item's own work at risk. W35's defect, by hand.
19. The browser bundle inlines fixtures by PATH and `${ROOT}` already ends in a separator, so
    `${ROOT}/spec/...` asked for `/spec/...` and took the suite down in chromium alone — W32's
    finding, on a dynamic import the bundler's static scan cannot see.
20. A non-finite `value` printed its `typeof`, so `NaN` was refused with a message reading
    *when value is number … a FINITE number*.
21. `d7`, a CONTROL written to make another control fire, used `startsWith` — which with the leaf
    helper's numeric default is refused anyway, by a different clause. It went red for a reason it
    did not name, and the grader said so.

**What this taught.** Four things for P26's retro:

- **The declaration step's own measurement had a hole its shape predicted.** Rule 8 obligation (a)'s
  shapes clause says *for every KIND a rule names, instantiate more than one value of it* — and the
  1800-context table instantiated `null` on one root and not on the root whose feature depends on it.
  *A value kind covered somewhere is not covered where it matters*, which is the selection clause
  (v0.23) applied to a MEASUREMENT rather than to a fixture.
- **P26 prediction 2 is REVERSED by a DECISION rather than by its named mechanism** — the condition
  it names did not fire and the prediction is false anyway, because the maintainer's answer to
  stop-and-ask (b) retired the string form. P15's *a reversal clause DIRECTS an item*, inverted.
- **A claim whose two sides are primitives has no identity control available** — v0.21's answer to
  the vacuity class assumes the sides are values that can be distinct. [Q447](../open-questions.md).
- **`doc/` is refused for a check for the twenty-fifth time, and this item supplies a class that is
  NOT `doc/`**: `spec/**`'s own snippets and its own claims about its own rules, which
  `check:docs` does not reach and `check:spec` does not read. [Q449](../open-questions.md).

**Questions raised.** [Q447](../open-questions.md) (a two-run equality has no identity control when
its sides are strings), [Q448](../open-questions.md) (a module-scope fixture turns a product break
into a runner CRASH, so rule 8 cannot grade it), [Q449](../open-questions.md) (nothing compares a
`spec/**` snippet or claim to the grammar the same document declares),
[Q450](../open-questions.md) (a declared predicate's purity is a property of the SOURCE and no rung
reads it). **[Q444](../open-questions.md) RESOLVED** by ADR 0074.

**Census CONFIRMED 342 / 267 / 1 / 74, derived TWO ways** — and the parser that derived it was wrong
TWICE first, in the two directions this register has already recorded. Stripping CODE SPANS before
splitting aborted on `Q148`, **which renders perfectly**, because GFM cuts a row on `|` FIRST and
parses inline code afterwards — W30's finding, *a parser more careful than the renderer reads a
different document*. Splitting as the renderer does and demanding four cells then aborted on
`Q123`, **which renders WRONG**. Classifying the status by PATTERN rather than by position
reproduces the committed baseline **exactly** (338 / 264 / 1 / 73) and this tree at 342 / 267 / 1 / 74.
*(The register's convention, which no document states: *resolved* is the **Resolved table's row
count**, not the live rows marked resolved — 74 against 69 — and *questions* is the live rows plus
the five ids that appear only in that table.)*

**And it measured the live population of [Q131](../open-questions.md)'s own class: TWELVE rows carry
an unescaped pipe inside a code span and so split where the renderer splits them too** — Q119, Q71,
Q123, Q131, Q135, Q204, Q215, Q301, Q343, Q411, Q415 and **Q445**, which P26's declaration added two
days ago. The register declares **two** of them as exemptions. None of W108's four is among them.
