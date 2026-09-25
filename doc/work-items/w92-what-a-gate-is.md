# W92 — what a GATE is

**Status:** **DONE** 2026-09-25 — see the Record. Declaration step RUN on `03190d0`, digest `274bf5c489098d2f` over
399 files; its findings are the section below, written before any `src/` edit
**Plan:** [P24](../plans/p24-what-a-node-may-remember-across-a-runs-branches.md) — *what may a node
remember across a run's branches?* — and this is its FIRST item: the definition, not the run.

```
Spec:       spec/flow-definition.md — a sixth node kind, the edge key `route`, and the load-time
            refusals of P24 decision 4; the registry's gate types. spec/README.md's rows.
Owns:       src/definition/**, src/driver/**, spec/**, test/**, doc/decisions/0066-*
Inputs:     P24 decisions 1-8 and stop-and-asks (a)-(d), all ANSWERED 2026-09-25 as recommended;
            P24 facts 1, 5 and 6, RE-RUN at this item's declaration step, never transcribed
            (P15 decision 5); ADR 0002 (a definition is data, code registered by name); ADR 0054
            (a task node names a type); ADR 0053 (the schema subset that checks `settings`);
            ADR 0044 (why a branch cannot see its siblings); Q380.
Outputs:    (1) ADR 0066 — a gate is a decision with memory, names a registered TYPE, and every
                route its type declares is wired exactly once
            (2) the grammar: `kind: "gate"`, `type`, `settings`, `edges` whose members carry
                `route` and `to` and nothing else; an edge with no `route` means the type's
                DEFAULT route
            (3) the refusals, each an `FD-V` with a fixture both ways: an unknown gate type;
                `settings` its type's schema refuses; an edge naming a route the type does not
                declare; a declared route with no edge; two edges for one route; `when` or `on`
                on a gate edge; a key path outside stop-and-ask (d)'s grammar
            (4) gate TYPES in the registry, on ONE public interface — `{ routes, defaultRoute,
                settingsSchema, fn }` — with `distinct` (routes `first`, `duplicate`, `nokey`;
                default `first`; settings `{ key }`) built in THROUGH that interface, so a
                consumer's type is registered the way `distinct` is
            (5) the validator, `checkWiring` and the region walks taught the kind: a gate is a
                region member like a task, and what leaves it is exactly what reached it
            (6) a flow holding a gate REFUSED by `new Driver` by name until W93 runs one — W32's
                precedent for a kind valid before any driver executes it, taken at construction
                rather than at run time (the declaration step decides, with a measurement)
            (7) `AGENTS.md` section 3's node kinds, and every executed snippet that enumerates
                them or the refusal classes
Depends on: nothing
Blocks:     W93
Tests:      L1 `test/definition/gate.test.ts` — every refusal of (3) with its accepted
            neighbour, derived from the spec's rule text and never from the validator's output;
            the default-route rule against its unsafe reading (one edge with no `route` must NOT
            carry `duplicate`); `distinct` registered through the public interface, asserted by
            registering a SECOND type the same way in the test. L4: a valid gate document in
            `spec/examples/valid/`, held to section 7 both ways.
Gate:       L0 under all five typecheck lanes and `lint`, EACH RUN SEPARATELY and re-run after the
            last test file is written; L1-L5 in node, deno and chromium; `check:spec`;
            `check:docs`; `check:markdown`; L6 UNMOVED at 1853 / 100; then the full
            `npm run gate` with a content digest identical at both ends.
Reserves:   Q381-Q385, ADR 0066
```

*Reserves derived by grep off the tree at P24's declaration: the highest question raised on disk is
**Q380**, which P24 raised, so this item starts at **Q381**; P24 reserved ADR 0066-0067 and this item
takes **0066**.*

## Scope

**In**

1. **The kind and its grammar** — Outputs (2), and `spec/flow-definition.md`'s key tables.
2. **The refusals** — Outputs (3). **Every one is at LOAD**, against the registry: a document alone
   cannot know a type's routes, so shape is checked without a registry and exhaustiveness with one.
3. **Gate types** — the interface, the registry slot, and `distinct` built through it.
4. **Every site that must learn the kind** — Q380's fifty-one in `src/`, found by a failing test or by
   reading, since the typechecker names one.

**Out** — named rather than left implicit, with where it goes instead

- **Running a gate**: memory, the `gated` fold input, the undeclared-route stop, replay — **W93**.
- **Memory per region instance** — declared out by P24 stop-and-ask (a).
- **A second built-in gate type** — the interface ships and `distinct` is its only built-in.
- **The exit artifact and `README.md`** — **W94**.

## What the declaration step must re-take before anything is edited

*P15 decision 5: every fact is re-run by the item that acts on it.*

| # | re-take | against |
|---|---|---|
| 1 | P24 fact 5: `GateNode` in the union, the five lanes run separately — the number of typecheck errors and their sites | the churn this item must pay; Q380 |
| 2 | every one of the 51 `src/` sites and the 45 outside it, each classified: must learn the kind / falls through correctly / falls through WRONG | Outputs (5); the seeded exceptions |
| 3 | what `new Driver` does today with a gate document: `FD-V24` from the validator, and what reaches the driver's `default` arm | Outputs (6) |
| 4 | which corpus censuses pinned outside the corpus a new valid example moves ([Q342](../open-questions.md), [Q360](../open-questions.md)) | the seeded exceptions |
| 5 | Q142's margins on the tree this item starts from | `M3` 5, `M4` 22 after P24's declaration |

### What the re-takes found — 2026-09-25, before any `src/` edit

*Node 24.20.0, deno 2.9.6, in `dev-dist/w92/` (a byte copy of the tree for rows 1 and 3, `node_modules` copied,
zero links). Re-run, never transcribed.*

**Row 1 — REPRODUCES, and the plan's wording is corrected.** `GateNode` added to the `FlowNode` union in the copy:
**one error, `src/driver/driver.ts:2451` — `Type 'GateNode' is not assignable to type 'never'` — in ALL FIVE lanes**,
`typecheck:deno` included; `lint` exit 0. P24 fact 5 and [Q380](../open-questions.md) say *four lanes* (fact 5 adds
*"`typecheck:deno` fails on it too"*, which makes five): it is five of five.

**Row 2 — the census, re-derived with a STATED predicate, because the plan's is recorded nowhere on disk.**
`dev-dist/p24/facts.ts` holds the flows and not the count. The predicate here: every match over `src/` of
`kind ===|!== '<kind>'`, `case '<kind>'`, `opensWith ===|!==`, and the `KINDS` literal — **55 matches in the same six
files** (`regions.ts` 12, `validate.ts` 13, `wiring.ts` 13, `driver.ts` 10, `routing.ts` 1, `bootstrap.ts` 1) —
**plus what that regex cannot see**: 11 `kindOf(…)` comparisons in `validate.ts` and the two KEY TABLES
(`NODE_KEYS`, `EDGE_KEYS`) the validator indexes BY kind. *51 is not reproducible because its predicate is not
written down; 55 is, and the difference is a predicate, not the tree.* Each read against a gate:

| verdict | sites |
|---|---|
| **must learn the kind** — ELEVEN *(this read *ten* over a list of eleven until W92's conformity reader counted it)* | `validate.ts`: `KINDS` (`FD-V24`); the per-kind block (a gate's `type` and `settings`); the edge rules `FD-V7` gives a `task` and a `join` and nothing gives a gate; `NODE_KEYS` and `EDGE_KEYS`. `wiring.ts`: `entryWalk` (an entry gate ends the walk), the `inbound` map (a gate's edges add no arrival, so every arc after a gate VANISHES from the report), `arrivingAt` and `record` (a gate routing into a join is not an arriving node, so the record LOSES that branch's key). `driver.ts`: the `enter()` switch's `never` — the one exhaustive site — and the constructor (the refusal) |
| **falls through WRONG, unreachable here** — one | `routing.ts:53` `eligibleEdges` returns `[]` for a gate, which reads as *no eligible edge* — a path ended in silence. Nothing routes out of a gate until W93, which owns it |
| **falls through CORRECTLY** — the rest | `regions.ts`' `succ` (a gate's arcs ARE its edges' `to`), `allRegions`, `certainlySettled` (a gate's out-arcs are disjunctive, which is the default intersection); `validate.ts`' `kindOf` sites — `FD-V3` (an entry gate is not refused), `FD-V9`/`FD-V25` (a gate is not a branch entry — refused, correctly), `FD-V13`/`FD-V19`/`FD-V22` (a gate is a non-`end` member), `FD-V27` (a gate produces no output — refused as a target, correctly); `wiring.ts`' consumer loop and `schemaOf` (a gate has no worker); `driver.ts` 1349, 1607, 1930, 2988, 3333; `bootstrap.ts` |

**And the plan's *"the moment `gate` joins that literal every other site is silent"* is FALSE in the loud
direction** — measured in the copy: `gate` added to `KINDS` alone makes `validateDefinition` **THROW**
`TypeError: Cannot read properties of undefined (reading 'req')`, because `NODE_KEYS[nd.kind]!` is typed
`Record<string, …>` and the `!` hides the missing row from all five lanes. Section 5's *"reported, never thrown"*
broken by the second site to meet the kind — **a throw the typechecker cannot name, found by running**.

**Outside `src/`: 58 matches by the same predicate, in FIFTEEN files** — `examples/l6.ts`,
`examples/settlement-cost.ts`, both `check-spec` files, ten test files and the helper `test/definition/task-shapes.ts`
*(this read *59* and *ten test files* until W92's conformity reader re-derived both on the pre-W92 tree: the 59 was
taken after one edit of this item's, and the helper is not a `.test.ts`)*. **Must learn**, each found by reading what it asserts over the corpus:
`test/definition/l4-corpus.test.ts`'s kind list; `test/definition/task-config.test.ts`'s every-kind-row binding
(`(task|fanout|map|join|end)`, count 5); `test/definition/needs.test.ts`' independent `succOf` oracle (a gate's
edges dropped) and its EDGE-key-table binding; `test/definition/map.test.ts`'s copy of `KINDS`;
`test/driver/needs.test.ts`' region-bearing census, **which RUNS every region-bearing valid flow on a `Driver`**;
and — outside the regex — `examples/l6.ts`' cross-row clause *L6 runs a flow containing every node kind the spec
corpus expresses*. **`check-spec`'s six `C7` sites fall through CORRECTLY**: a gate's type is CODE (a function),
like a language's `compile`, so it is ladder L4's and not `registry.json`'s.

**Row 3 — today a gate document is `FD-V24` at `new Driver`, and taught to the validator it would RUN a task
first.** On `03190d0`: `InvalidDefinition`, `FD-V24 at dedupe: node kind "gate" is not task|fanout|map|join|end`.
In the copy with `KINDS`, `NODE_KEYS` and `EDGE_KEYS` taught and the driver untouched: the definition validates
clean, **`new Driver` constructs, `start()` dispatches `identify`**, and only when that task SETTLES does the
`default` arm report `InvalidDefinition … whose kind "gate" this driver cannot execute` through `OR-R10`. **So the
refusal is taken at CONSTRUCTION** (Outputs (6)): a run-time refusal lets a real worker run before the run stops —
the one workload that reaches the gate, which is ADR 0002 rule 3's whole argument — and W33's refusal of a region
inside a map (lifted by W84) is the precedent for a VALID definition refused at construction, **with
`InvalidDefinition` and no rule ids**: *"the document names a node this driver cannot execute, which is what that
class already means"*. No new class. The `default` arm keeps its `never`; the gate gets an explicit arm behind the
construction refusal, so a SEVENTH kind is still a compile error.

**Row 4 — FIVE censuses a valid gate example moves, and the seeded table named NONE of them** (it seeded
`l6.ts` for dispatch sites, which is a different reason): `test/definition/wiring.test.ts`' L4 arc total, a
LITERAL (`56`, [Q342](../open-questions.md)'s shape); `spec/outcome-record.md` section 4's task-node split, DERIVED
by `test/fold/result-value.test.ts` ([Q360](../open-questions.md)) — and a gate is not a task node, so only the
example's tasks count; `test/driver/needs.test.ts`' region-bearing census, derived and RUN; the L4 kind list; and
**`examples/l6.ts`' kind clause, which makes W92's declared valid example and W92's declared *L6 UNMOVED*
incompatible as written** — a gate in the corpus is a kind no L6 row runs, and no L6 row CAN run one until W94.
Resolved by a DATED exemption inside the SAME `check` (so the count stays 1853): a kind is flagged when it is
missing at L6 and not exempt, **or exempt and present** — so W94's row turns it red and removes it.
**And a sixth, from the rule ids rather than the corpus**: three new `FD-V`s move *34 refusals* in `AGENTS.md`
section 3, `spec/README.md`, `validate.ts`' header and **the anchors of BOTH self-tests** — `check-spec-selftest.mjs`
is seeded, **`check-docs-selftest.mjs` is not**.

**Row 5 — REPRODUCES exactly**: probe 1 (`doc/decisions` removed) 118 files, `M3` margin **5**; probe 2 (`doc/decisions`
and `doc/plans` removed) 5248 links, `M4` margin **22**. This item's one new document is an ADR, which both probes
cut, so `M3` is predicted unmoved; `M4` is predicted to fire at the record step.

**The design the re-takes leave, decided here and argued in ADR 0066:**

| | |
|---|---|
| the kind | `{ id, kind: "gate", type, settings?, edges }`. Dispatches nothing, has no task id, produces no output |
| an edge's `route` | a declared EDGE key (section 3's table), with ONE rule owning it everywhere — `FD-V41`, on `FD-V26`'s precedent for `needs`: on a gate edge it names a declared route or is absent (the DEFAULT route); on any other edge it is refused; a gate edge carries `to` and `route` and nothing else (`when`, `on`, `needs` refused, `FD-V7`'s precedent for a join edge); every declared route wired exactly once. **So `FD-V17`'s text does not move** |
| the refusal ids | `FD-V39` the type (unregistered, or not a gate type); `FD-V40` the settings (not a plain object, refused by the type's `settingsSchema`, or a `key` outside stop-and-ask (d)'s grammar); `FD-V41` the routes. Split by what an author FIXES, on `FD-V28`'s precedent |
| the key | `settings.key` is the ONE setting the LIBRARY reads on a gate — a key path the driver resolves (W93) and a `gated` input will record (stop-and-ask (b)); the type's `fn` is handed the resolved key |
| the interface | `GateType { routes, defaultRoute, settingsSchema?, fn(ctx) }`, `ctx = { key, input, settings, memory }`, `fn` returning a route name. `distinct` is a `GateType` value in `BUILT_IN_GATE_TYPES` and nothing names it anywhere else |
| the registry | `Registry.gateTypes`, a consumer's, beside the built-ins — **absent means the built-ins alone**. A consumer type named as a built-in, or not a gate type, is refused at construction by name (`NameCollision`, and a new `GateTypeRefused`). **`DriverOptions` does NOT gain it**: W76's binding holds every `DriverOptions` member to a road through the runtime, and the runtime is W93's — so a hand-built `Driver` validates against the built-ins, and refuses every gate flow anyway |

## Exceptions — files outside `Owns`

*Seeded from P24's table; marked at the build.*

| file | why | predicted? |
|---|---|---|
| `scripts/check-markdown.mjs` | `M4`'s margin is 22 links at P24's declaration; this item's record step is predicted to cross it ([Q142](../open-questions.md)) | P24 seed |
| `examples/l6.ts` | node-kind dispatch sites; a registry or type member its walks list — **re-taken: the reason is its cross-row clause *L6 runs a flow containing every node kind the spec corpus expresses*, which a valid gate example turns red** (row 4) | P24 seed, reason corrected at the declaration step |
| `scripts/check-spec.mjs`, `scripts/check-spec-selftest.mjs` | six node-kind sites; `C7` reads every task's type — **re-taken: the six sites fall through correctly; the self-test's anchors on *34 refusals* are what move** | P24 seed, reason corrected |
| `AGENTS.md` | section 3's *five node kinds* and *34 refusals*; section 9's executed error-class enumeration if a class is added | P24 seed |
| `scripts/check-docs-selftest.mjs` | two probes anchored on `AGENTS.md`'s *There are **34 refusals** over the id range `FD-V1` … `FD-V38`*, which three new rules move — rule 7 (b) would abort them | **declaration step**, not seeded |

## Verification

**Routing:** this item adds no routing — a gate is refused by the driver until W93. Of the states the
template names: a branch routed away from its join, `user_action`, a missing decision edge, a duplicate id
and a nested fan-out are **not applicable** here; a gate inside a nested region is a VALIDATION fixture
(region membership), not a run.

**What this item SELECTS, and the fixture where each wrong selection DIFFERS** (rule 8 obligation (a),
v0.23):

| selection | the right one | the well-formed wrong ones, each to be shown to DIFFER |
|---|---|---|
| the route an edge with no `route` carries | the type's DEFAULT route | *every* route; the FIRST declared route (for `distinct` they coincide — so the fixture registers a type whose default is NOT its first route) |
| the edge a declared route is wired by | exactly one, by name | the first edge; any edge (a gate with two routes and one edge must be refused) |
| the value a gate hands on | what reached it | the gate's settings; the predecessor's whole record |

| rung | what it covers here | result |
|---|---|---|
| L0 `lint`, `typecheck:node`, `:browser`, `:deno`, `:tests`, `:examples` — each separately | the union, the driver's `default` arm, the interface | see Record |
| L1-L5 node / deno / chromium | `gate.test.ts`, the corpus census | see Record |
| `check:spec` | the new rules and the valid example | see Record |
| `check:docs`, `check:markdown` | `AGENTS.md` section 3; ADR 0066 | see Record |
| L6 node and deno | UNMOVED | see Record |
| `npm run gate` | everything, digest at both ends | see Record |

## Record

**DONE 2026-09-25.** A `gate` is a VALID definition, checked by `validateDefinition` and `checkWiring`, and refused
by every `Driver` at construction until W93 runs one —
[ADR 0066](../decisions/0066-a-gate-is-a-decision-with-memory-that-names-a-registered-type-and-wires-every-route-exactly-once.md).
`spec/flow-definition.md` is **v0.23**: a sixth node kind, an edge key `route`, **`FD-V39`** (the type), **`FD-V40`**
(the settings and the KEY PATH) and **`FD-V41`** (the routes, and `route` on every edge); `FD-V21`, `FD-V23` and
`FD-V24`'s enumerations name the kind, and **`FD-V17` does not move** — `route` is a declared edge key and one rule
owns it everywhere, `FD-V26`'s precedent. **37 refusals.** `distinct` is the one built-in gate type and a value of the
ONE public interface `GateType { routes, defaultRoute, settingsSchema?, fn }`; the suite registers a second type,
`threshold`, whose DEFAULT is not its FIRST route, and a COPY of `distinct` under another name that validates exactly
as `distinct` does.

### Outputs, each with what fails without it (measured by rule 8, below)

| # | output | shipped as | what fails without it |
|---|---|---|---|
| 1 | ADR 0066 | seven rules, each chosen over a named alternative with the measurement that decided it | `check:spec` `C5`, six links |
| 2 | the grammar | `GateNode`, `Edge.route`; `NODE_KEYS.gate` and `EDGE_KEYS`' `route`; section 2's row and subsection, section 3's `route` row | the every-kind-row and edge-key-table bindings, both ways — the three L1 failures before the spec was written |
| 3 | the refusals, each with a fixture both ways | `FD-V39`/`FD-V40`/`FD-V41`; three invalid cases; `test/definition/gate.test.ts`, every refusal on THREE shapes (no region, a `fanout` branch, a `map` branch) beside its accepted neighbour | `a1`-`a11`, `a16`, `d1`, `r1`-`r5`: every one CAUGHT, naming its case |
| 4 | gate types on ONE interface, `distinct` through it | `GateType`, `GateContext`, `BUILT_IN_GATE_TYPES`, `gateTypesOf`, `gateTypeProblem`; `checkGateTypes` and the twelfth registry class `GateTypeRefused` | `b6` (15 failures), `a8`, `a9`, `r4`, `r5` |
| 5 | the validator, `checkWiring` and the region walks taught the kind | the validator's gate block and edge loop; `wiring.ts`' PASS-THROUGH — `inbound`, `arrivingAt`, `record`, `entryWalk`; **`regions.ts` UNCHANGED** — its three walks fall through correctly, asserted in case 8 (membership, `ID-R6`, disjunctive certainty through a gate) | `b3`-`b5`, `r7`-`r9` |
| 6 | a gate flow refused by `new Driver`, by name | after validation, before any listener, `InvalidDefinition` with NO rule ids; an explicit `case 'gate'` behind it keeps the `never` | `b1`, `b2`, `c2`; and `test/driver/needs.test.ts` asserts the refusal on `gated-map` where it RUNS every other region-bearing corpus flow, so W93's lift fails there |
| 7 | `AGENTS.md` | section 3's six kinds, a gate row and a paragraph, *37 refusals*; section 9's executed class list gains `GateTypeRefused` | `X4` and `X7`; **the prose half is a CEILING (`r12`, Q310's class)** |

### Verification — every rung RUN, never piped, its exit code read

| rung | result |
|---|---|
| L0 `lint`, `typecheck:node`, `:browser`, `:deno`, `:tests`, `:examples` — EACH separately, re-run after the last test file | **exit 0, all six** — and on the first full pass (`c1`) **`typecheck:tests` exited 2 with ZERO `FAIL` lines**, a fixture helper typed `object` where `WorkerEntry` wants a `JsonSchema`; read off the exit code, as section 4 says |
| L1-L5 node / deno / chromium | **52 files / 1398 assertions in all three**, from 51 / 1376 |
| `check:spec` | **7 documents / 65 examples / 123 rules**, from 7 / 61 / 120; *C4 covered 37 definition refusals* |
| `check:docs` | **36 snippets: 30 run, 6 check**, unmoved |
| `check:markdown` | **156 documents, 7159 relative links, 390 anchored**, exit 0 — from 155 / 7105 / 386 at P24's declaration; its self-test **7/7 bounded** after `M4`'s retune |
| `check:spec:selftest` / `check:docs:selftest` | **29/29 graded** / **34/34 probes, 21/21 graded** — the latter after two `META` entries ABORTED on probe names this item changed (rule 7 (b)) |
| L6 node and deno | **1853 assertions over 100 real runs, UNMOVED, in both** |
| Q142 | before the record step: `M3` margin **5**, `M4` margin **1** — this item's own documents had spent 21 of the 22 links; after it the both-removed fixture read **5291 against the floor of 5270 — FIRED, as P24's seeded table predicted** — and `M4` is retuned **5270 -> 6225**, the midpoint of its window `(5291, 7159]`, on W80's rule; `M3` is unmoved at 123 (margin 5, and it has not fired) |
| `npm run gate` | **`GATE EXIT=0`, 986 s, ZERO `FAIL` lines**, content digest `9984382be4ed612b` over 405 files IDENTICAL at both ends; `selftests` 8/8 in 884 s wall. The Record cell you are reading is the one edit made after it |

### Rule 8 — three passes, a harness with v0.24's grader controls

`dev-dist/w92/rule8.py`: node 24 and deno 2 asserted; a CONTROL; every edit's anchor exactly once against the current
bytes, undone on abort; restores byte-asserted; a content digest over tracked and untracked-unignored files at both
ends; a timeout on every rung; the reason matched on the clause's OWN failure line (`FAIL  <case>` for L1-L5, the one
line after `FAIL  <key>` for L6, the check id for a check); and **a CRASH control (`gX`, the suite throws at load) and
a WRONG-REASON control (`gW`, a real break graded against a clause it does not break), graded on every pass**.

| pass | probes | result |
|---|---|---|
| author | 35 | control clean, both grader controls RIGHT, 31 caught, 2 declared ceilings RUN, **1 against declaration — the probe, not the product**: `d2` renamed a case where it meant to delete one, and the name it left, `undefined`, crashed W76's suite (it calls `.endsWith` on every registered name). Rewritten and re-run: CAUGHT |
| 2 — with the readers' 13 exact edits | 48 | **4 against declaration**: `a13` SURVIVED because the fix for conformity finding 10 made its guard unreachable (the guard is removed and the probe re-aimed); and **`r7`, `r8`, `r9` graded WRONG-REASON — the new case's NAME had been appended after the self-check's in `DECLARED_CASES` while its BODY sat before it, so each case ran under the other's name.** No assertion in the file could see it — the in-file membership is a SET — and v0.24's reason-on-the-failure-line is what did ([Q382](../open-questions.md)) |
| 3 — the final tree | 48 | **control clean, `gX` CRASH and `gW` WRONG-REASON as declared, 41 caught, 4 declared ceilings RUN, 0 aborts, 0 against declaration**, digest `d53a765d26fa2d77` identical at both ends |

**The four ceilings, each run against the rung its reason names**: `b10` — the `enter()` gate arm returning silently
survives L1-L5 and `tsc`, because the constructor refusal makes it unreachable, and `b1` is what binds the refusal;
`r6` — the built-ins dropped from `checkGateTypes`, equivalent while `distinct` is a `GateType`, which is asserted
directly; `r10` — `distinct`'s `minLength: 1` to 0, equivalent because `KEY_PATH_RE` already refuses `''`; `r12` —
`AGENTS.md`'s prose count, which no check reads. **`b9` was a ceiling DATED TO W94 on the author pass and is a CATCH on
the final tree**: the adequacy reader's #18 made the L6 clause a tautology for zero, and the clause now evaluates two
constructed inputs beside the real one — a phantom kind no row runs, and `gate` present at L6 while still exempt — so
both halves of the exemption can fail today, and the count is still one assertion.

### What broke, and which rung caught it

| # | what | caught by |
|---|---|---|
| 1 | `gate` added to `KINDS` alone makes `validateDefinition` THROW (`NODE_KEYS[nd.kind]!`) | a RUN at the declaration step — **no rung: all five lanes pass** |
| 2 | the declared valid example and the declared *L6 UNMOVED* were incompatible — L6's kind clause | READING at the declaration step; `b8` since |
| 3 | the three spec-binding tests, before the spec was written | L1, by name — prediction 1's *the churn surfaces at L1* |
| 4 | every test shape carried an `end` no gate reached — an `FD-V11` in every clean case | L1, first run of the suite |
| 5 | the record fixture's join fed an `end`, so no consumer judged the record | L1 |
| 6 | `typecheck:tests` exit 2, zero `FAIL` lines | L0, READ OFF THE EXIT CODE — a `FAIL` count would have called it green |
| 7 | two `META` gradings named probes this item renamed | `check:docs:selftest`, rule 7 (b) ABORT |
| 8 | `check-spec-selftest`'s `lastIndexOf('**34 refusals**')` would have found a HISTORICAL 34 and gone vacuous | READING, before it ran — re-anchored COUNT-AGNOSTIC, as were the two `X7` probes, so the next rule id re-anchors nothing |
| 9 | the pass-through bound on the DEFAULT route only (#15, #14, #12), a Map-shaped collision (#9) | the ADEQUACY reader — **no rung; every one BLOCKING** |
| 10 | `readKeyPath` read a class instance's own field | the CONFORMITY reader, by reading the spec's *plain object* |
| 11 | two cases running under each other's names | rule 8 pass 2's GRADER — WRONG-REASON on the failure line |
| 12 | my `d2` probe renamed a case and crashed another suite; heredocs with backticks twice; reader copies past Windows' path limit | the INSTRUMENTS — each seen, none reached a verdict |

### Readers — both in isolated byte copies, the tree still at `62c5aed86e58389d` until both reported

**Conformity: 10 findings, 0 blocking, and ZERO disagreements on the VALUES** — the three invalid cases' and
`gated-map`'s findings, the first eight cases' expected sets, `distinct` over nine keys in one memory, and four wirings
of a two-route type whose default is not its first, all derived from the spec on paper first. What it found were
CLAIMS: *ten sites* over a list of eleven, and the ADR's *ten … plus key tables* (nine plus two); the outside census
**58 in fifteen files** where this file said 59 in *ten test files*; a test's quoted `FD-V24` message and *a sixth kind*
sentence this item made stale; `README.md`'s *34 validation refusals*; `GateTypeRefused`'s row saying it runs only when
a registry carries `gateTypes` (it runs on every call); `FD-V21`'s moved text named nowhere; the wiring check's ENTRY
sentence; *finite* attributed to stop-and-ask (c), which says *number*; and one behaviour — `readKeyPath` wider than
*plain object*. Owns audit: **zero undeclared**. **Adequacy: 19 mutations plus 21 constructions, 12 survivors, 4
BLOCKING** — and three of the four are ONE shape: every pass-through fixture sent the non-default routes to an `end`,
so a consumer on `duplicate` could leave the report (W92's own census defect, for every route but the default), an
entry gate could walk its default alone, and a transformed consumer after a gate existed nowhere; the fourth, a
Map-registered `distinct` dropped in silence. **Its constructions found NO validator defect.** Every finding is acted
on; the readers' 13 exact edits are probes `r1`-`r13`. **Overlap 1 — the FIFTY-SEVENTH measurement**: one shared
SUBJECT, L6's kind clause, which the conformity reader verified correct in both directions and the adequacy reader
made a tautology — two findings, one line, as W78's pair was.

### Exceptions — marked at the build

| file | used? |
|---|---|
| `scripts/check-markdown.mjs` | **used — PREDICTED, and it fired**: `M4` 5270 -> 6225 at the record step, measured before (5269) and after (5291) |
| `examples/l6.ts` | **used** — the kind clause's dated exemption, bound on both halves |
| `scripts/check-spec.mjs` | **not used** — its six `C7` sites fall through correctly (a gate type is code, L4's) |
| `scripts/check-spec-selftest.mjs` | **used** — two probes re-anchored count-agnostic |
| `AGENTS.md` | **used** — sections 3 and 9 |
| `scripts/check-docs-selftest.mjs` | **used** — two `X7` probes count-agnostic, two `META` names; declared at the declaration step |

**Zero undeclared** (the conformity reader's audit). `README.md`'s refusal count is a record-step file.

### Predictions (P24)

1. **CONFIRMED** — L0 named ONE site, the driver's `never`, in all five lanes; everything else surfaced at L1 (three
   bindings) or by reading. **With a second LOUD site no lane can name**: the validator's `NODE_KEYS` throw. No site
   mishandled a gate with every test green; what the adequacy reader found were TESTS bound at the default route, not
   code that was wrong.
2. and 3. — W93's and W94's; untouched here.
4. **Holding at W92**: `FD-V21`, `FD-V23` and `FD-V24` moved and all three are enumerations of kinds or of a kind's keys;
   `FD-V17` did not move, by design. `RN-R13` is W93's to move.

### Questions

**[Q380](../open-questions.md) RESOLVED** — answered by measurement, not fixed. **Raised: [Q381](../open-questions.md)**
(a new node kind is BREAKING for a consumer's exhaustive `switch` over `FlowNode`, through `index.ts`' `export *`, and
nothing names it for W94's `README.md` list) and **[Q382](../open-questions.md)** (a suite naming its cases by INDEX can
run two cases under each other's names, invisible to its own membership and to the outside count). **Q383-Q385 unused
and not reused.** Census ****299 / 233 / 1 / 65**, by a parser that first reproduced HEAD's **297 / 232 / 1 / 64** — and ABORTED four times on the way, each naming a row it could not classify: a pointer row's lower-case `**resolved`, a row followed directly by a heading, [Q87](../open-questions.md)'s blank lines inside one row, and an upper-case `**RESOLVED**`; every id in exactly one cluster cell**.
