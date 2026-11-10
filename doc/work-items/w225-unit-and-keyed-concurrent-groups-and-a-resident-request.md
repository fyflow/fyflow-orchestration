# W225 — `UnitGroup` and `KeyedConcurrentLimitGroup` as built-in group types, and a resident unit request

**Status:** done 2026-11-05 — **`npm run gate:item` EXIT 0** on the final tree, its FOURTH run (the first three RED, below);
declared 2026-11-05 on `5113a18`; both readers RUN and acted on; nothing raised; one occurrence appended to Q599
**Plan:** [P46](../plans/p46-what-the-scheduler-0-7-0-admission-rework-lets-a-document-declare.md) — its second item.

```
Spec:       spec/flow-definition.md section 3 (the registry document): the built-in group types table gains UnitGroup
            and KeyedConcurrentLimitGroup with their configs; the PoolSpec residentGroups row gains the request; FD-R6
            names both keyed built-ins; the version note. Changed FIRST, as its own edit with its rationale.
Owns:       spec/flow-definition.md (section 3 and its version note), src/definition/registry.ts,
            src/definition/types.ts, src/scheduler/runtime.ts, src/scheduler/bootstrap.ts, test/definition/**,
            test/scheduler/**, AGENTS.md sections 12-13 (groups, pool options, FD-R6, the Q619 refusal),
            doc/decisions/0143-*.md
Inputs:     P46 decisions 3-5 and 7, facts 4 and 7; the scheduler's AGENTS.md at 0.7.0 §5 and its .d.ts
Outputs:    (1) BUILT_IN_GROUP_TYPES gains UnitGroup ({ units: integer >= 1 | non-empty list of non-empty strings })
                and KeyedConcurrentLimitGroup ({ limit: integer >= 1, limits?: object }); the checks beside the schema
                (distinct units; each per-key limit a positive integer) refused GroupConfigRefused naming the group.
            (2) the two factories in runtime.ts: new UnitGroup(units, { id: key });
                new KeyedConcurrentLimitGroup(limit, { id: key, limitFor: (k) => limits[k] ?? limit }).
            (3) poolSpecProblem: a residentGroups record value is a positive INTEGER cost or { cost?, from?, prefer? }
                (shape only); a non-integer cost now refused.
            (4) resolveRegistry, after every pool is derived: a request held against the named group — a built-in
                UnitGroup's declared units (an id it lacks; cost above from's size or the unit count); from/prefer
                naming a ConcurrentLimitGroup, RateLimitGroup, KeyedRateLimitGroup or KeyedConcurrentLimitGroup;
                each DerivationRefused naming the pool (or type's default instance) and the group. A code group
                type's request handed on untouched.
            (5) copyResident copies a request deeply (from/prefer arrays fresh).
            (6) FD-R6 / LimitKeyMissing and the Q619 resident refusal extended to KeyedConcurrentLimitGroup.
            (7) ADR 0143; AGENTS.md sections 12-13 document the two types, the request and the refusals, each with a
                snippet check:docs runs.
Depends on: W224
Blocks:     W226
Tests:      L1 suites: every refusal above by its message's subject; every acceptance (count units, named units,
            { cost } alone on a ConcurrentLimitGroup, a request on a code group type handed on); the factories
            build the scheduler's own classes with the declared id, units and limitFor; FD-R6 for a node reaching a
            built-in KeyedConcurrentLimitGroup; the Q619 refusal for one held resident; copyResident's copy not
            aliasing. Expected values from the scheduler's AGENTS.md at 0.7.0, not from output.
Gate:       `npm run gate` before the readers; conformity and adequacy readers; `npm run gate:item` once on the
            final tree.
Reserves:   Q801-Q802, ADR 0143
```

## Scope

**In** — Outputs (1)-(7).

**Out** — grants on real workers and the L6 block (W226); a request from a flow or a node (P46 Out); `requestFrom` /
`keyFrom` as data.

## Record

**Author's record, 2026-11-05, on `5113a18` plus W224's uncommitted pin — in review.** Nothing committed.

### Gate

| Rung | Result |
|---|---|
| `npm run gate` on the author's tree | **EXIT 0** (`C:/tmp-p46/w225-gate.log`, `w225-gate2.log`) — node and chromium 106 files, 2334 assertions (2321 before: +8 registry, +4 runtime, +1 the L4 census count) |
| `npm run gate` after the readers' fixes, on the tree holding this Record | **EXIT 0** (`C:/tmp-p46/w225-gate3.log`) — 2334 assertions in node, deno and chromium, unchanged: the fixes are rows inside existing cases; `check:register` EXIT 0 after F5 |
| `check:docs` alone | EXIT 0 — 56 `run` snippets, `RUN_FLOOR` 56 |
| Workflow rule 8 — each refusal clause broken in place, the two suites run, the bytes restored and compared | **24 of 24 RED** (`C:/tmp-p46/w225-rule8.log`); restored byte-identical (sha256), both suites EXIT 0 after |
| Workflow rule 8 on the readers' fixes | **5 of 5 RED** (`C:/tmp-p46/w225-rule8b.log`): A1's order swapped; F1's array value, empty `prefer`, undeclared key and present `from: undefined` each accepted; restored byte-identical |
| Conformity reader | **RAN** — 3 SHOULD / 5 NIT, none BLOCKING; 33 verdicts re-derived, all matched |
| Adequacy reader | **RAN** — 76 run, 72 caught, 4 survived — three detailed (1 SHOULD, A1; 2 equivalent, A2 and A3), the fourth not itemised in the report *(read *76 mutations, 72 caught, 1 SHOULD survivor, 2 equivalent*, which sums to 75, until W226 corrected it under P46's (f1) — W226's conformity F5)* |
| Overlap | 0 |
| `npm run gate:item` on the final tree, by the orchestrator | **RUN 1 RED** — `check:docs:selftest`: its probe *a `run` snippet whose assertions are deleted* (it deletes every `throw new Error(` line) wanted `[X4,X8]` and got `[X3,X4,X5,X8]`: section 13's new snippet ended its `refusal` helper with `throw new Error('expected a refusal')`, so the deletion left a function that can fall off its end — a type error. **Fixed by the orchestrator under (f1)**: `return new Error('expected a refusal')`, which is no refusal class, so every check below it still throws; `check:docs` and `check:docs:selftest` re-run ALONE, EXIT 0, 24/24. **RUN 2 RED** — node L6, ONE claim: `W218 exit (threaded)`'s arranged premise (instance 1 settles before 0) read `false`. **RUN 3 RED** — node L6, `uncloneable / OR-R6, threaded` read `running` at its 400 ms backstop (five claims of one row). Both rows are Q599's class and neither is W225's; run 3 shared the machine with another project's Tauri build and Vite servers. `npm run test:l6` ALONE five times between them: EXIT 0, 2905 / 0 failed each. Run 2 appended to [Q599](../questions/q599.md). **RUN 4: `GATE:ITEM EXIT=0`** — L6 2905 / 0 failed in node and deno, **10/10 self-test lanes ok**, 1343.5 s wall (log `C:/tmp-p46/w225-gateitem4.log`) |

### Outputs

| Output | Where | Tests |
|---|---|---|
| (1) `UnitGroup` and `KeyedConcurrentLimitGroup` built-ins; distinct units and per-key limits beside the schema, `GroupConfigRefused` | `src/definition/registry.ts` `BUILT_IN_GROUP_TYPES`, `builtInConfigProblem` | registry W225 cases 1-2 |
| (2) the two factories, `limitFor` reading a copy of `limits` by own key | `src/scheduler/runtime.ts` `BUILT_IN_GROUP_FACTORIES` | runtime W225 case 1 |
| (3) a resident value a positive INTEGER cost or `{ cost?, from?, prefer? }` | `residentValueProblem`, called from `poolSpecProblem` | registry case 3, 7 |
| (4) a cost or request held against the group, after every pool is derived | `residentEntriesOf`, `residentAgainstGroupProblem`, the Q619 loop | registry cases 4-7; runtime case 4 (19 agreeing verdicts plus 5 STRICTER rows, against a real `WorkerManager` + `FyflowScheduler` whose groups are built from the scheduler's own classes) |
| (5) `copyResident` deep | `copyResident`, `copyRequest` | registry case 8 |
| (6) `FD-R6` / `LimitKeyMissing` and Q619 reach `KeyedConcurrentLimitGroup` | `KEYED_BUILT_IN_GROUP_TYPES` (runtime), `KEYED_BUILT_INS` (registry) | runtime case 2, registry case 6 |
| (7) ADR 0143; `AGENTS.md` section 12 (FD-R6) and section 13 (the two types, the request, the refusals, one `ts run` snippet) | `doc/decisions/0143-*.md`, `AGENTS.md` | `check:docs` X3/X4 |
| spec | `spec/flow-definition.md` v0.56 — section 3, its version note; still **45 refusals** | `check:spec` |

### Decisions taken within the plan's room

1. **A plain cost above a built-in group's limit is refused too** — `ConcurrentLimitGroup`'s `limit`, `RateLimitGroup`'s smallest window, `UnitGroup`'s unit count — wider than decision 4's wording; each is a value the scheduler throws on at construction (`_bindResidentGroups`). It moved ONE existing verdict: the W165 fixture's group `k` (limit 1, resident cost 2) now carries limit 2. ADR 0143 consequence 3.
2. **Stricter than the scheduler in FIVE places** (this read *twice* until the conformity reader measured five, F1), each stated in ADR 0143 rule 4 and a STRICTER row against the real scheduler: a repeated id in `from` / `prefer`; a present `from: undefined`; `prefer: []`; an undeclared request key (`{ foo: 1 }`); an ARRAY as the value, which the scheduler destructures as `{ 0: … }`.
3. A request must be a PLAIN object (`messages`' reading); a non-plain one is refused.
4. `ResidentGroupRequest` is a structural interface in `src/definition/types.ts`, not the scheduler's type.
5. `limitFor` reads a `Map` built from `Object.entries(limits)` — own keys only, a later edit to the document moves nothing.
6. A `prefer` id outside `from` is accepted (the scheduler's reading; ADR 0143 consequence 5).
7. Q801-Q802 unused.

### The readers' findings, and what was done

| Finding | Done |
|---|---|
| F1 (SHOULD) *stricter, twice* is false — five | Record, ADR 0143 rule 4 and the runtime test corrected; three STRICTER rows added |
| F2 (SHOULD) *a code group's request handed on untouched* overstated | DECIDED by the orchestrator: the shape check stays. Qualified to *within `{ cost?, from?, prefer? }`* in ADR 0143 rule 5, `residentAgainstGroupProblem`'s docblock, `AGENTS.md` section 13, and the spec's v0.56 note and against-group table |
| F3 (SHOULD) `AGENTS.md` section 9's `LimitKeyMissing` and the not-available table's code-group road named `KeyedRateLimitGroup` alone | both name `KeyedConcurrentLimitGroup` |
| F4 (NIT) the deep copy is a document type's and a named instance's, not a class's output | ADR 0143 rule 6 and `copyResident`'s docblock |
| F5 (NIT) ADR 0143 amends ADR 0097 rule 2 | `amends: ADR 0097 in part`; the body says so |
| F6 (NIT) *21 verdicts*, and the scheduler's side built through the code under test | 19 + 5 STRICTER; the test builds its groups with `new UnitGroup` etc. |
| F7 (NIT) *(or a UnitGroup)* | `AGENTS.md` section 13 |
| F8 `RT-R13`'s *three* | `spec/runtime-targets.md` v0.15, its own note; `spec/README.md`'s row |
| A1 (SHOULD) nothing pinned the Q619 refusal FIRST | two fixtures: a request on a `KeyedConcurrentLimitGroup` and on a `KeyedRateLimitGroup`, each expecting the Q619 wording |
| A2 (equivalent) a default cost of 1 vs 0 | the reader's reason: unreachable past the shape check |
| A3 (equivalent) the UnitGroup factory's `[...units]` | redundant: the scheduler freezes its own copy (`dist/node/index.js:5432`) |

### Exceptions — files outside Owns

**Every row GRANTED by the orchestrator under P46's (f1), 2026-11-05**, each recorded here before its edit.

| File | Why |
|---|---|
| `spec/README.md` | the flow-definition row's version column — `check:spec` C8 holds it to the Status line; and `runtime-targets.md`'s row if F8's version note needs it |
| `scripts/check-source.mjs` | `S16`'s `CONSTRUCTS` gains `UnitGroup`, `KeyedConcurrentLimitGroup` (RT-R13), and its comment's count |
| `scripts/check-docs.mjs` | `RUN_FLOOR` 55 -> 56 for section 13's new snippet |
| `spec/flow-definition.md` outside section 3 | `FD-R6`'s section-2 sentence and its section-6 row name the second keyed factory — inside the item's `Spec:` line, outside the `Owns` parenthesis |
| `AGENTS.md` outside sections 12-13 | conformity F3: section 9's `LimitKeyMissing` definition and the code-group-road sentence near `:3240` named only `KeyedRateLimitGroup` |
| `spec/runtime-targets.md` | conformity F8: `RT-R13`'s *"The three built-in group types"*, its own spec edit with a version note |

**Left, and listed:** `examples/l6.ts:6964` (*"each of the three built-in group classes"*) is W226's.

### What broke

- `typecheck:tests` on a deep-copy assertion comparing two unrelated types (cast).
- `check:scheduler` `D7`: the v0.56 note named the pin's number; now *"the pin W224 moved to"*.
- The W165 fixture, by decision 1.
- A shape expectation of my own: a document type's malformed pool is refused at its shape check (`node type "T".pool`), not at its default instance.
