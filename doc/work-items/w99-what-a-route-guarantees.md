# W99 — what a ROUTE guarantees, and the declaration that says so

**Status:** **DONE** 2026-09-29 — see the Record. Declared on `54ff41d` ([P25](../plans/p25-what-a-route-guarantees-about-the-value-it-carries.md)'s
declaration), before any file under `Owns` was edited.
**Plan:** [P25](../plans/p25-what-a-route-guarantees-about-the-value-it-carries.md) — *what does a gate's
ROUTE guarantee about the value it carries, and what must its KEY PATH satisfy for that guarantee to exist?*

```
Spec:       spec/flow-definition.md, BOTH tables in section 3 (measured, not guessed: the interface's
            member table is under *Gate types — CODE, beside the built-ins*, and the arc-shape table
            under *What the schemas buy an author — the wiring check*). The member table gains a ROW;
            the arc table gains a GATE row: what leaves a gate on a route the type calls key-resolved is
            what arrived, REFINED. **NO RULE ID** — a separate `FD-V42` was written first and
            `check:spec`'s `C4` REFUSED it, by asking for a case in spec/examples/invalid/ that cannot
            exist: that corpus is a flow plus a JSON registry document and a gate type is CODE. A
            malformed member of this interface is `FD-V39`'s second clause, which is where the one
            predicate `gateTypeProblem` already reports. The count stays 37.
            **ADR 0068** — the decision is that the TYPE declares it, which P25 stop-and-ask (a) settled.
Owns:       src/definition/types.ts (the interface), src/definition/validate.ts (GATE_TYPE_KEYS, its two
            prose messages, and `distinct`'s own declaration), src/definition/wiring.ts (the reader and
            the derivation), spec/flow-definition.md, test/definition/wiring.test.ts,
            test/definition/gate.test.ts, doc/decisions/0068-*.md,
            examples/l6.ts (the W94 clause — see correction 4; the plan's table says W101),
            AGENTS.md and README.md (correction 5: each carries the claim this item narrows)
Inputs:     P25 facts 1-9, RE-RUN here (P15 decision 5) — 89 arcs over 28 flows with 2 `no` and
            all five key variants giving identical counts both reproduce; Q391; ADR 0066 (the
            interface) and ADR 0067 (what a gate does in a run); spec/flow-definition.md v0.24;
            `distinct`'s own `fn`, which is what defines "the key resolved".
Outputs:    (1) `GateType` gains ONE optional member naming the routes on which the key path
                RESOLVED, allowed by GATE_TYPE_KEYS, with `distinct` declaring `['first',
                'duplicate']` — its own `fn` returns `nokey` for every other case
            (2) `WiringRegistry` widened with `gateTypes`, and the gate arc carrying its ROUTE —
                mapped through the type's `defaultRoute` where the edge declares none
            (3) the derivation: on a declared key-resolved route the arrival's schema gains
                `required` along the node's key path, at every step — PRESENCE and not the leaf's
                type, which is type-specific (see *What the member is, and what it is not*)
            (4) the corpus number MOVES: `checkWiring` over `examples/flows` goes from
                **89 arcs / 2 `no`** to **89 / 1**, the survivor `map-no-array`'s deliberate FD-R2
            (5) ADR 0068, and `examples/l6.ts`' W94 clause replaced by its opposite
Depends on: nothing
Blocks:     W100 (the key-path verdict reads the same `gateTypes`), W101 (the session teaches the member)
Tests:      L1 on the member's shape (a type carrying it is accepted; one naming a route it does not
            declare is refused) and L2 on the derivation — the TV arc `fits`, and a control where the
            type declares NO key-resolved route so the same arc is `no` again. Expected values from
            `spec/` and from `distinct`'s `fn`, never from the check's output.
Gate:       L0 (`lint`, five typecheck lanes, each separately); `npm test` (L1-L5, three runtimes);
            `check:spec` (`C4`/`C8` move with the document); `check:docs` (`AGENTS.md`'s `GateType`
            literal is an executed snippet — X3/X4); L6 node and deno, which this item MOVES; then
            `npm run gate` with a content digest identical at both ends.
Reserves:   Q410-Q414, ADR 0068
```

## What the member is, and what it is not

**It names the routes on which the KEY PATH resolved, and the library derives the schema.** Three shapes were
weighed and one is refuted by a fact rather than by taste:

| | Shape | Verdict |
|---|---|---|
| **(A)** | the type names the routes on which the key path resolved; the library composes `required` along the node's own key path | **TAKEN.** It is the only guarantee the LIBRARY computes — P25 fact 9's bound — because the key path is the one thing the driver resolves and hands to `fn` as `ctx.key` |
| **(B)** | the type carries a per-route SCHEMA literal | **REFUTED by a fact**: a `GateType` is registered ONCE per name and the key path is per NODE (`settings.key`), so a literal on the type cannot name `series`. It could only say something the settings do not parameterise |
| **(C)** | the type carries a FUNCTION the check calls with the node's settings, returning a refinement per route | Possible and more general, and what P25 prediction 3's reversal would force. Not taken now: it buys nothing this corpus or `distinct` can express, and the repository's precedent is against speculative generality (P19: *a type-level JSONata interpreter stays refused*) |

**And the guarantee is PRESENCE, not the leaf's TYPE.** `distinct`'s `fn` returns `nokey` unless `ctx.key` is
a string or a finite number, so its `first` route guarantees more than *the path is there*. The library will
not derive that part, because *which leaf values count as a key* is the type's judgement and differs between
types — so the refinement is `required` along the path and the item says so where a reader would otherwise
assume the stronger claim.

## What re-running P25's facts CORRECTED — four things, before any file was edited

1. **`GATE_TYPE_KEYS` is a CLOSED list and `gateTypeProblem` refuses an extra key BY NAME** —
   `it carries "…", which a gate type does not declare`. So the new member is not merely added to an
   interface: a consumer's type carrying it is **refused today**, and `src/definition/validate.ts` must be
   edited. **That file is not in P25's seeded exceptions table**, which names `types.ts`, `wiring.ts`, the
   spec, the two suites and the examples — the one file that decides whether the member may exist at all.
2. **The shape is stated in PROSE at two LIVE sites**, both inside `gateTypeProblem`'s own messages
   (`a gate type is an object { routes, defaultRoute, settingsSchema?, fn }`, twice). Neither is bound to
   `GATE_TYPE_KEYS`, so adding a member leaves two error messages describing an interface that no longer
   exists — `doc/workflow.md` obligation (e)'s THIRD shape, *a list is a claim about another list*, and a
   rule-8 target for this item rather than a thing to notice later. *(Corrections 1 and 2 first named
   `checkGateTypes`, which lives in `registry.ts` and only CALLS the predicate — W99's conformity reader, F8.)*
3. **`distinct.defaultRoute` is `first`, which is a RESOLVED route** — so P25 fact 6's prototype, which
   hard-coded `'(default)'` into the resolved set, was right only because the one type that exists has a
   resolved default. A type whose default is its unresolved route would have been refined wrongly, in
   silence. *That is v0.23's selection clause exactly: the well-formed wrong selection coinciding with the
   right answer at the DEFAULT position.* The shipped reader maps an edge with no `route` through the type's
   `defaultRoute` and then asks, and the suite carries a type whose default is NOT key-resolved.
4. **This item MOVES ladder L6, where P25's table gives `examples/l6.ts` to W101.** Read rather than
   assumed: the cross-row clause compares `rowsWithNo` against
   `['map / FD-R2 …', ...EXPECTED.filter((e) => e.gate).map(…)]`, a literal that names **every gate row** —
   so the moment the TV arc stops being a `no`, that comparison fails. W99's own gate cannot be green
   without replacing the clause, so the clause is W99's. **What W101 then moves at L6 is its own
   artifact's, and P25's row saying *L6 MOVES* there is corrected to say it moves HERE first.**

## Declared exceptions, at the declaration

**[P25](../plans/p25-what-a-route-guarantees-about-the-value-it-carries.md)'s own file**, for corrections 1
and 4: its seeded exceptions table gains `src/definition/validate.ts`, and its work-items row for W101
is corrected where it gives `examples/l6.ts` and *L6 MOVES* to that item. A plan is on nobody's `Owns`
once declared, and leaving the row would hand W101 a file this item must edit for its own gate to be
green — which is `doc/workflow.md` v0.7 change 3's argument in the directory it does not cover.

**`AGENTS.md`, `README.md` and [ADR 0066](../decisions/0066-a-gate-is-a-decision-with-memory-that-names-a-registered-type-and-wires-every-route-exactly-once.md)**, for correction 5. P25's table gives the first two to W101 and names the third nowhere; each carries a LIVE statement that a gate is a pass-through, which is the claim this item narrows, so leaving them would ship a reference and a front page contradicting the check they describe. ADR 0066's consequence is edited under `doc/workflow.md` v0.7 change 3, which put `doc/decisions/**` in the record step so a decision can be corrected by the item that supersedes part of it.

## The claim this item narrows, and every copy of it

Found by grepping for the sentence BEFORE editing anything (v0.14's third direction, whose usual failure is that it is run afterwards). **EIGHT live copies and four historical ones**, which is why correction 5 exists
— *and the count read SIX until W99's conformity reader found the two the grep's own pattern missed,
both of them inside `Owns`*:

| Where | Live? |
|---|---|
| `spec/flow-definition.md` section 3, *What the schemas buy an author* | **LIVE and NORMATIVE** — *A GATE is a PASS-THROUGH (v0.23): what leaves it on any route is exactly what reached it, so an arc through a gate is the arc INTO it, verdict and all.* The sentence this item replaces |
| `src/definition/wiring.ts`, the `inbound` comment | **LIVE** — and it states WHY the arc exists at all, which stays true |
| `AGENTS.md`, the gate section's caveat list | **LIVE**, in the document a consumer reads first |
| `README.md` | **LIVE**, citing Q391 beside it |
| `examples/l6.ts`, twice | **LIVE** — the clause and its comment, correction 4 |
| `test/definition/gate.test.ts` | **LIVE** — a declared case NAME a reader sees printed, which that suite's own census holds (F6) |
| `test/definition/wiring.test.ts` | **LIVE**, lowest severity — the arc's identity is unchanged and only the word is withdrawn (F6) |
| ADR 0066's Consequences | **LIVE as a decision's consequence**; ADR 0068 supersedes that one line |
| `CLAUDE.md`, `doc/README.md`, `doc/open-questions.md`'s Q391 row, `doc/plans/p24-*.md` | HISTORICAL — they record what was true, and Q391's row gets a resolution rather than an edit |

## Scope

**In**

1. Outputs (1)-(5).
2. The two prose messages of correction 2, bound to `GATE_TYPE_KEYS` rather than restated.
3. A second gate type in the suite whose `defaultRoute` is its UNRESOLVED route — correction 3's
   discriminating fixture, without which the default-route mapping is asserted by nothing.

**Out** — named rather than left implicit, with where it goes instead

- **The key-path verdict** (P25 fact 7) — W100's, and it reads the same widened `WiringRegistry` this item
  ships, which is why the two are serial rather than parallel.
- **The authoring session** — W101's. This item teaches the member nowhere a consumer reads except the
  interface's own doc comment and the spec.
- **Shape (C)**, the function form: named above with what would force it.
- **A leaf-type refinement**: the type's judgement, not the library's, stated above.
- **[Q405](../questions/q405.md), [Q406](../questions/q406.md), [Q407](../questions/q407.md)** — none is
  about a route.

## Verification

How each clause of `Gate:` is actually run. Every rung RUN, never piped, and its exit code read
(`doc/workflow.md` section 4).

| Clause | How |
|---|---|
| L0 | `npm run lint`, then each of the five typecheck lanes SEPARATELY — `npm run typecheck` is five lanes chained by `&&` and a chained rung reports its FIRST failure only (P20's declaration) |
| `npm test` | L1-L5 in three runtimes; the new L1/L2 cases are in `test/definition/wiring.test.ts` and `test/definition/gate.test.ts` |
| `check:spec` | `C4` (the document's own counts, which must stay 37 — see the `Spec:` line) and `C8` (`spec/README.md`'s version column). *`C2` is NOT in this row: it compares CITED rule ids against DECLARED ones and this item declares none, which its first cut named anyway — W99's conformity reader, F7* |
| `check:docs` | `X3`/`X4` over `AGENTS.md`'s `GateType` literal — an OPTIONAL member must leave that snippet compiling and executing unchanged, which is the additive claim's one executed observer |
| L6 node / deno | RUN in both; this item moves the W94 clause and must leave every count it does not claim unmoved |
| conformity reader | in an isolated copy, spec first: derive every verdict of the TV flow and of the suite's second type ON PAPER before reading output |
| adequacy reader | in an isolated copy: the member deletable, the default-route mapping narrowed, the derivation's `required` walk truncated to one step (correction 3's shape one level in), the corpus number's literal |
| rule 8 | obligations (a)-(f), with the harness carrying its control, its two GRADER controls (v0.24), per-edit anchors and a content digest |

*Routing cases this item covers:* none of Q4, Q17, Q10, Q13 or Q6 — it changes a static check and one
interface, and dispatches nothing. **Q391 is the case it exists for**, and L6 is where the answer is observed
on real workers.

## Record

**DONE 2026-09-29.** A gate type may declare **`keyResolvedRoutes`**, the routes on which its KEY PATH resolved, and `checkWiring` refines what leaves the gate on such a route with `required` along the node's own key path, at every step — [ADR 0068](../decisions/0068-a-route-guarantees-what-its-type-declares-and-the-library-derives-it-from-the-key-path.md), `spec/flow-definition.md` **v0.25**, and **NO rule id**. [Q391](../questions/q391.md) is RESOLVED: the corpus goes **89 arcs / 2 `no` to 89 / 1**, the survivor `map-no-array`'s deliberate `FD-R2`, and L6's clause is replaced by its opposite.

| | |
|---|---|
| L6 | **2176 assertions over 154 real runs**, node 24.20.0 and deno 2.9.6, from 2175 / 154 |
| L1-L5 | **53 files / 1430 assertions** in three runtimes, from 53 / 1423 |
| `check:spec` | **7 / 65 / 126 UNMOVED** and `C4 covered 37` — no rule id added |
| `check:docs` | **37 snippets, 31 run, 6 check**, unmoved; `X10` over four copies at 2176 / 154, `X11` at 38 / 38 |
| `checkWiring` over `examples/flows` | **89 arcs, 1 `no`**, 73 fits, from 89 / 2 |
| Census | **313 / 240 / 1 / 72** |

### What the declaration step and the gate CORRECTED, before and during — six

Five are in the declaration above (the closed key list and the file the plan's table missed, the two prose shape messages, `distinct`'s default route being a RESOLVED one, L6 moving HERE and not at W101, and the three live copies of the narrowed claim). **The sixth was caught by `check:spec` itself**: a separate **`FD-V42`** was written for the new member's validation, and `C4` refused it by asking for a case in `spec/examples/invalid/` that **cannot exist** — that corpus is a flow plus a JSON registry document and a gate type is CODE, carrying `fn`. A malformed member is `FD-V39`'s second clause, where the one predicate `gateTypeProblem` already reports. ***An impossible fixture is a rule id in the wrong place***, which is ADR 0068 rule 4 and is the only thing in this item a rung found rather than a person.

### The readers

**Conformity: 9 findings, 3 BLOCKING, and its central obligation came back with ZERO disagreements on the VALUES** — 27 values derived from `spec/` and the schemas ON PAPER before `wiring.ts` was opened (every arc of both gate flows with its producer, shape and reason, the route each edge carries, the two refinement steps, the nine edges that get no arc, and the census), plus a control from the other side: one line removed from `distinct` gives back `89 / 2` with Q391's reason **verbatim**, the string it had derived.

**Its F1 is the item's sharpest finding and it is bigger than this item.** `FD-V16`'s charset admits `toString`, `constructor`, `valueOf` and `__proto__` as key-path segments, and a gate keyed on one is a document the validator accepts with **ZERO findings**. Two bare property reads answered from `Object.prototype`: this item's own walk wrote `Object.prototype.toString` — a native FUNCTION — into a refined schema's `properties`, and **`fits` itself read it back through a bare `k in pp`**, which is P19's code and **reachable on an ORDINARY EDGE with no gate at all** — a consumer describing `toString` and not requiring it read `no` with an invented type union (`producer may be object|array|number|integer|boolean|null`) where the same consumer asking about `zzz` read `fits`. **Third and FOURTH occurrence of this class**: W65's conformity reader found bare `in` at three keyword sites, W74's found it in `pathsOf`. Three sites closed by one shared `own`, and **the first cut of the case written for it was VACUOUS** — it asked about a key the gate's path does not name and passed with both defects in place, measured by running it against the reverted guard, which is the only reason it is a test.

**Adequacy: 37 product mutations, 15 survived, 6 findings, 5 BLOCKING**, every survivor proved reachable or classified. Its five, each measured at ZERO and each now firing:

| | finding | what it cost then, and now |
|---|---|---|
| F1 | **the walk was bound at ONE STEP** — `i >= steps.length` → `i >= 1`, and the nested write deleted | **0 / 0**, because the suite's producer already declared `series: { required: ['id'] }` and so does the corpus's `identify`, so the only step the walk had to add was the ROOT. One field removed from the fixture: both now fire by name. *v0.23's selection clause one level in, and W84's* bound at ONE SEGMENT *in a new derivation* |
| F2 | **the default-route lookup could be a hard-coded `'first'`, or `routes[0]`** | **0 / 0 / 0**. Correction 3's `flipped` catches the *placeholder* shape alone, because its default edge is expected `no` EITHER WAY — and every type this tree could reach had `defaultRoute === routes[0]`, the only one expected to FIT being `distinct`, whose default is literally named `first`. **Three well-formed wrong selections all coincided with the right one.** Closed by a type whose default is NEITHER first in `routes` nor named `first` and IS key-resolved |
| F3 | **`GATE_TYPE_SHAPE`'s derivation had no observer** — Scope In row 2 | **0**, reverted to the exact stale sentence. *Closed after that reader was launched and before its report arrived*, by asserting the message against `GATE_TYPE_KEYS` both ways; its M32 half (the `?` marker) is closed here too. **A derivation is a construction and can be reverted for zero** |
| F4 | **the new L6 clause was held by a COUNT and not by `CROSS_ROW_SUBJECTS`** | deletable to green in **three integer edits and four count copies**, and not one failure on the way named what had left. Two subjects added. *v0.14's* a count is not a membership*, in the file whose own header records that finding at its fifth iteration* |
| F5 | **all four observers were satisfied with the derivation reverted AND the consumer weakened** | **0 at every rung**. `gateArcs` asserts the arc FITS, which a weakened consumer gives for free, so v0.22's question had no answer: there was no tree on which it failed while its claim passed — it was a fourth claim about `rowsWithNo`, and the compound its own comment named is exactly the one it did not catch. Closed by asserting the per-series worker's OWN `required` beside the verdict, off the registry the rows run against: the corpus consumer weakened now costs a named L6 failure |
| F6 | the two no-key guards have no observer | **0**, and declared a near-CEILING rather than closed: the discriminating document requires the EMPTY STRING in a worker schema, which the reader itself ranked below the other five for that reason |

**And its note 1 found a number `X10` cannot see.** `examples/l6.ts`' own history comment read *2173 since W98* where `git show` at W98's commit gives **2174**, and `README.md`'s trail says 2174 too — so one of the two was wrong by one, and **`X10` compares only the CURRENT value, so a stale HISTORY line is invisible to it**. W99 had also appended nothing to either running block. Corrected, and both blocks now carry W99's entry. *The check built to hold four count copies does not hold the sentence that says where they came from.*

**Readers — overlap 2, the sixty-third measurement** (derived from section 6's own list, which ends at *W96 1, W97 1, W98 3* with a count word of sixty-two). The two shared subjects were each reached from opposite ends: correction 2's repair, which the conformity reader VERIFIED exists and the adequacy reader showed nothing BOUND; and correction 3's `flipped` fixture, which one confirmed discharges v0.23's clause and the other showed catches one of three wrong selections.

### Gate — what ran

| Clause | Verdict | Notes |
|---|---|---|
| L0 — `lint`, five typecheck lanes, each separately | RAN, exit 0 | the five are node, browser, deno, tests, examples |
| `npm test` (L1-L5) | RAN, exit 0 | **53 / 1430** in three runtimes |
| L6 node / deno | RAN, exit 0 | **2176 / 154 in both**; `CROSS_ROW` 218 → 220, `DECLARED_TOTAL` 2174 → 2176 |
| `check:spec` | RAN, exit 0 | **7 / 65 / 126 unmoved**; `C4` is what retracted `FD-V42` |
| `check:docs` | RAN, exit 0 | `X10` four copies, `X11` 38 / 38 — it fired on the unindexed ADR 0068, as W96 built it to |
| `check:markdown`, `check:source`, `check:workers`, `check:policies`, `check:scheduler`, `check:wiring` | RAN, exit 0 | |
| conformity reader | RAN, isolated copy | 9 findings, **3 BLOCKING**; **ZERO disagreements on 27 derived values** |
| adequacy reader | RAN, isolated copy | **37 mutations, 15 survived, 6 findings, 5 BLOCKING** |
| rule 8 | RAN, two passes | **pass 2: 36 probes, 1 control CLEAN, 28 caught, 3 declared ceilings each RUN, all THREE grader controls right (1 crash, 2 wrong-reason), 0 aborts, 0 AGAINST DECLARATION**, digest `5e47a8c3aa688819` identical at both ends over 421 files, with all twelve of the readers' exact mutations checked in and every one firing. **Pass 1 read SIXTEEN against declaration and all sixteen were the HARNESS** — fourteen one defect: for the `test` rung the runner's `FAIL` line carries the CASE NAME and the assertion message sits in a detail block at the end, so a `names` written as an assertion message could never match and every probe that correctly fired came back WRONG-REASON. **Both grader controls exercised the `l6` rung**, where the reason IS the line after `FAIL`, so neither could see it: *v0.24's clause is satisfied per HARNESS and needs to hold per RUNG.* A third control, `gW2`, sits on the `test` rung now. The other two were real re-declarations the adequacy reader had already measured: `gateTypesOf(undefined)` is CAUGHT at L1 rather than the ceiling I declared (the suite passes its own types THROUGH the registry, so my ceiling's reason was true of the CORPUS and not of the rung), and removing the member from `GATE_TYPE_KEYS` makes `distinct` malformed so `resume.test.ts` throws at MODULE SCOPE — `npm test` exits 1 with ZERO named failures and the assertion written for it never runs, which makes it a third grader control by accident |
| `npm run gate` | **RAN, `GATE EXIT=0`, ZERO `FAIL` lines** over 31 chain entries | digest `b02383c5c95c4943` over 420 files, IDENTICAL at both ends — so the gate moved nothing. Only this row was written after it, and `check:markdown` and `check:docs` were RE-RUN over that edit |
| [Q142](../questions/q142.md) | MEASURED after the record step, and it does NOT fire | `M3` margin **17** files (125 against the floor of 142) and `M4` **586** links at probe 2, both probes exit 1. *This item adds three documents outside `doc/decisions` (the item file, ADR 0068 is inside it, and no plan) and the margin is 18 wide, so the next plan's declaration is where it gets interesting* |

### Questions

**[Q391](../questions/q391.md) RESOLVED** — the fix taken as its own row wrote it, with the AGAINST half kept as a stated cost: nothing cross-checks a type's declaration against its own `fn`, and nothing can, because `fn` is opaque (ADR 0068 consequence 6). **Raised: [Q410](../questions/q410.md)** (a wiring verdict carries no `route`, so it cannot say WHY an arc that read `no` now reads `fits` — the conformity reader's F9, and what W101's human will see) and **[Q411](../questions/q411.md)** (a bare `k in o` over a schema's `properties`, at its third and fourth occurrence, with no mechanism against a fifth). Q412-Q414 unused and not reused. **The next item is W100.**
