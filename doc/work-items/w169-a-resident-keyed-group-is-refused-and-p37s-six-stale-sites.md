# W169 — a built-in keyed group held resident is refused at `createRuntime`, and P37's six stale sites

**Status:** done 2026-10-16 — **`npm run gate:item` EXIT 0** on the final tree, one command; both reader passes RAN, no defect, their items acted on (A1-A3 cases added, C1 the message held to one hand-written literal, C2-C7 docs and the record step); Q619 resolved; no question raised; no exception. Declared 2026-10-16 on `982a190`; the declaration step RUN the same day in a byte copy (M1-M4 below); P34's FIRST item
**Plan:** [P34](../plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md) — *what does a run do when its owner
cancels it, stops it to resume it elsewhere, or pauses it?* — its FIRST item, carrying the two hand-ons of P37's retro
that are not run control: [Q619](../questions/q619.md) option B (P37 retro (i), P34 decision 12) and the six stale sites
(P37 retro (j), P34 fact 12).

```
Spec:       spec/flow-definition.md v0.38 -> v0.39: section 3's *What the registry refuses at construction* — the
            `DerivationRefused` row gains a built-in `KeyedRateLimitGroup` named in a derived pool's `residentGroups`,
            refused by the resolver at `createRuntime` naming the pool and the group (Q619 option B, P34 decision 12); the
            group-types table's `KeyedRateLimitGroup` row and *What a derivation returns*'s `residentGroups` row say so;
            `FD-R6`'s row (section 6) replaces *which Q619 asks whether to refuse* with the refusal, and its Test clause's
            *a resident one* control with the refusal at `createRuntime`. No rule id moves and none is added — the FD-V
            count stays 42, the rule count 135; no refusal CLASS is added (the twelve stay twelve).
            spec/outcome-record.md v0.13 -> v0.14: `OR-R13`'s *ADR 0053's thirteen keywords* -> the subset's SEVENTEEN
            (P34 fact 12; seventeen since W164, ADR 0098). No rule moves.
Owns:       from P34's W169 row: src/definition/registry.ts, src/definition/wiring.ts (the `:187` comment),
            src/driver/driver.ts (the `:2140` comment, `:1383`'s message), src/scheduler/runtime.ts (`:673-677`),
            spec/flow-definition.md, spec/outcome-record.md, spec/README.md, test/definition/registry.test.ts,
            test/scheduler/runtime.test.ts, test/driver/result-schema.test.ts, AGENTS.md, scripts/check-docs.mjs.
            scripts/check-docs.mjs is in the row and is NOT expected to be edited: no `run` snippet is added or removed
            (AGENTS.md changes in prose only), so RUN_FLOOR stays 37.
            NO NEW SUITE: every case is inside an existing suite (registry.test.ts's refusal suite, runtime.test.ts's
            W163 suite), because test/definition/l4-corpus.test.ts's LATE_SUITES is not in this row. AND NO NEW CASE in
            registry.test.ts's refusal suite: l4-corpus.test.ts:812 also COUNTS that suite's cases (15) — found by the first
            gate (M4) — so the W169 cases are a block inside the existing `DerivationRefused` test, not a sixteenth case.
            Exceptions: none declared.
            Record-step files (doc/workflow.md section 1 rule 5): doc/questions/** (Q619 resolved; Q635-Q637 if raised),
            doc/decisions/** (ADR 0097's status/note line only, if its rule 1 pointer to Q619 is to say it is answered),
            the plan's Record, README.md, this file.
Inputs:     P34 decision 12, fact 11 and fact 12; P37 retro (i) and (j) as P34 copies them; Q619 option B as the maintainer
            answered it; spec/flow-definition.md v0.38 section 3 (the group types, *What a derivation returns*, the refusal
            table) and section 6 (`FD-R6`); ADR 0097 rule 1; ADR 0098 (seventeen keywords, five annotations); sentences B′,
            C, D′ and E (P34 *Work items*).
Outputs:    (1) registry.ts: `resolveRegistry` refuses, AFTER every pool is derived (P34 decision 12) and before the
                predicates are read, a pool whose DERIVED `residentGroups` (list or `{ key: cost }`) names a group of the
                BUILT-IN type `KeyedRateLimitGroup` — `DerivationRefused`, `at` the pool key, the message naming the pool
                (as `derivePool` names it — a type's default instance or a named instance of a type), the group, why (the
                scheduler resolves no key for a resident group: every worker counted in ONE `""` bucket), and the roads
                that work. So a type's pool, a named instance's merged pool and a CLASS derivation's output are refused
                alike; a CODE group type's group — keyed or not — and a resident `ConcurrentLimitGroup` or
                `RateLimitGroup` are accepted. `DerivationRefused`'s doc comment names the new clause.
            (2) driver.ts: `InvalidDefinition.fromFindings(flowId, findings)` — the definition's findings as an
                `InvalidDefinition`, its `rules` `violatedRules(findings)` and its message `definition "<flowId>" is
                invalid: ` then `<rule> at <at ?? '<document>'>: <detail>` joined by `; ` — the ONE function `new Driver`
                (`:1381-1386`) and `runtime.ts`'s `openRun` (`:673-677`) both call. A STATIC on an already-exported class:
                no new root export name, but new public surface, stated as such (spec is silent on the message; AGENTS.md
                section 9 states it). The `:2140` comment's *thirteen* -> seventeen. *(After the readers, C3: its
                precondition is at least one finding — an EMPTY list is refused with a `RangeError`, stated in its doc
                comment and in AGENTS.md section 9.)*
            (3) runtime.ts `:673-677`: the inline build replaced by the call.
            (4) wiring.ts `:187`: *`examples` is read by nothing* -> the five annotations are read by nothing.
            (5) test/driver/result-schema.test.ts `:62` and `:309`: *thirteen* -> seventeen (comments).
            (6) spec v0.39 and v0.14 (above), and spec/README.md's two rows.
            (7) AGENTS.md: the refusal where a type's `pool` and `residentGroups` are described (section 13), where FD-R6's
                reach is described (section 12, `:2098-2110`), and `fromFindings` beside `.rules` (section 9).
            (8) L1 tests (below).
Depends on: nothing (P34's first item; P37 done at 985efe6)
Blocks:     W170
Tests:      L1 test/definition/registry.test.ts — INSIDE the refusal suite's DerivationRefused test (see Owns): a built-in keyed group
            named resident by (a) a DOCUMENT type's `pool`, (b) a named instance's own `pool` merged over its type's,
            (c) a CLASS derivation's output — the default instance AND a named instance of the class — each refused
            `DerivationRefused`, `at` the pool key, the message naming the pool, the group and Q619; both
            `residentGroups` shapes (a list and a `{ key: cost }` record); a pool naming it in BOTH `groups` and
            `residentGroups` refused for the resident one; and the CONTROLS, each resolving: the same document with the
            group held in `groups` (FD-R6's road, not this one), a resident `ConcurrentLimitGroup`, a resident
            `RateLimitGroup`, a resident group of a CODE group type (P18's `DailyBudgetGroup`), and a keyed group the
            registry declares that no pool holds resident.
            test/scheduler/runtime.test.ts — in the W163 suite: the same three roads refused at `createRuntime` (through
            the seams), with NO pool and NO scheduler built; a CODE group type building a `KeyedRateLimitGroup` with a
            `keyFrom`, held resident, accepted and its pool built; a `ConcurrentLimitGroup` held resident accepted;
            and FACT 11's ONE control FLIPPED — `:3096-3098`'s *a keyed group held only as a RESIDENT group … none is
            FD-R6* becomes `createRuntime` THROWING `DerivationRefused` for that document. And the InvalidDefinition
            message: one flow with two findings, one of them with no `at`, refused by `start` and by `new Driver` over
            `runtime.registry` — each message EQUAL to a hand-written literal, `definition "…" is invalid: <r> at <a>:
            <d>; …`, and the two byte-equal; `fromFindings` on hand-written findings equal to the same form.
            Expected values from Q619 option B as answered, P34 decision 12, the spec rows above and the fixtures'
            literals — never from the implementation's output. Each case shown able to fail by a ONE-clause mutation
            (sentence E) in the byte copy C:/tmp-w169/m.
            *(After the readers: the registry block gains a named instance of the built-in `Transform` (A1), a MIXED
            resident set with the keyed group second, list and record (A2), and the roads-that-work text asserted (A3);
            the `start`/`new Driver` message is held to ONE WHOLE hand-written literal, details included — before, only
            `fromFindings`' case was (C1); and `fromFindings([])` is refused (C3).)*
Gate:       `npm run gate` before the readers (P34 sentence C); then the conformity and adequacy readers, NOT run by this
            item's author; then `npm run gate:item` ONCE on the final tree. The row's clauses: L1 a built-in keyed group in
            the residentGroups of a type's pool, a named instance's pool and a class derivation's output each refused at
            createRuntime naming the pool and the group; a CODE group type's keyed group and a ConcurrentLimitGroup held
            resident each accepted; fact 11's one control flipped; the InvalidDefinition message byte-equal on both roads.
Reserves:   Q635-Q637 (P34's W169 row); no ADR (P34 reserves none for this row)
```

*Reserves: `npm run state` on `982a190` reads the next free ids as **P38, W169, Q635, ADR 0101** from the tree and the same
W169, Q635, ADR 0101 from the ledger (P37's Retro) — they AGREE. P34's own reservation gives this item Q635-Q637.*

## Scope

**In** — Outputs (1)-(8).

**Out** — named rather than left implicit, with where it goes instead

- **`bootstrap`'s own road** (`src/scheduler/bootstrap.ts`, outside the row): it is handed group OBJECTS, not a document,
  so it cannot tell a built-in factory's keyed group from a code group type's — and Q619 option B is a refusal *at
  `createRuntime`*, which reaches `bootstrap` only through `resolveRegistry`. A consumer calling `bootstrap` by hand with a
  `KeyedRateLimitGroup` held resident is not refused; no question raised (the answer names `createRuntime`). *(After the
  readers, C4: `AGENTS.md` section 13 says so too.)*
- **A `Driver` built by hand** — it never derives a pool and never sees a group's type, as `FD-R6`'s row already says.
- **The other refusals' messages** (`FD-V30`, `FD-V31`, `FD-V36`, `FD-V39`, `FD-V41`) — fact 12 names the definition
  message built twice; the rest are built once each.
- **An L6 clause** — the exit artifact's clause (7) is W176's.
- **ADR 0097's text** — its rule 1 names Q619 as the open question; whether the record step adds a status note there is
  the Record's, under `doc/decisions/**`. *(It did: one in-place italic sentence after rule 1's pointer — C5.)*

## What the declaration step measured before anything was edited

*P15 decision 5 and sentence B′: measured 2026-10-16 in a BYTE COPY of `982a190` (`git archive` into `C:/tmp-w169/m`,
`node_modules` copied, never linked; `find -type l` zero), node 24.20.0 and deno 2.9.6.*

| # | fact | measured |
|---|---|---|
| M1 | the baseline, in the copy | `npm run gate` **EXIT 0**: `lint` 146 files; `check:spec` 7 documents / 75 examples / 135 rules; `check:docs` 43 snippets (37 run, 6 check); L1-L5 **62 files / 1763 cases** in node 24.20.0, deno 2.9.6 and chromium; L6 **2664 assertions / 176 real runs**, 0 failed, in node and deno |
| M2 | **P34 prediction 1, measured** — the change against the existing tests | exactly ONE existing assertion moved: fact 11's resident control in `test/scheduler/runtime.test.ts` (`rr.check(…)` equal `[]` -> `createRuntime` throwing `DerivationRefused` at `Holds`), flipped in the same diff and bound (K1 turns it red). **The message refactor moved none** — the four existing *to the byte* assertions (`runtime.test.ts` `:605`, `:724`, `:3130`, `:3169` at `982a190`) pass unchanged: the two roads already built one text |
| M3 | the author's provocations (rule 8, written to the RULE — Q619 option B's clauses and fact 12's one-function clause; ONE clause per mutation, sentence E; harness `C:/tmp-w169/mutate.mjs`, NOT in the tree, run in the byte copy `C:/tmp-w169/m`; each anchor asserted to occur once and to change its file, each file restored from its FIRST snapshot and digest-compared; node 24 asserted; graded on the runner's own `FAIL` lines over `registry.test` and `runtime.test`) | the no-edit CONTROL clean in both; **22 of 22 KILLED**, none compound, none declared equivalent. The refusal: K1 never fires; K2 the wrong built-in (`RateLimitGroup`); K3 the `{ key: cost }` record read as empty; K4 `groups` read too (the `FD-R6` road refused); K5 named instances skipped; K6 the default/instance naming swapped; K7 `at` the type not the pool key; K8-K12 the message losing the group, `residentGroups`, `Q619`, the built-in type; K21 a CODE group type matched by name (`/Keyed/`); K22 every resident group refused but a `RateLimitGroup`. The message: K13 `<document>` -> `null`; K14 `; ` -> `, `; K15 rules unsorted and repeated; K16 the flow id unquoted; K17 the runtime road one finding short; K18 the driver road one finding short; K19 the runtime road handing `FD-R6` to `InvalidDefinition`; K20 the runtime road naming another flow id. **Spec and `AGENTS.md` prose are bound by no test** — no row of either moves a table a test compares (the refusal table is compared by CLASS name, and no class is added) |
| M4 | the whole ladder on the REAL tree, held still | first run **`GATE EXIT=1`**: one failure, `l4-corpus.test.ts`'s *W110's two suites still REGISTER the cases they declare* — the refusal suite counted **16** against **15**, because the registry cases had been written as a NEW `test`. That file is outside the row, so the cases were folded into the existing `DerivationRefused` test (Owns) rather than the count widened; K1-K12, K21, K22 re-run after the fold, all still KILLED. Second run **`GATE EXIT=0`**: `lint` 146 files; `check:spec` 7 / 75 / **135 rules** (unmoved); `check:docs` 43 snippets, 37 run, 6 check (unmoved — `RUN_FLOOR` 37, `scripts/check-docs.mjs` not edited); L1-L5 **62 files / 1765 cases** in node 24.20.0, deno 2.9.6 and chromium (+2: the W163 suite's two W169 cases); L6 **2664 / 176**, 0 failed, in node and deno — UNMOVED, so `examples/README.md`'s `X10` copies do not move (P34's D′ paragraph lists W169 among the items moving them; it does not). firefox and webkit NOT RUN |

## Verification

`npm run gate` (each rung's exit read on its own line), the author's rule-8 provocations in the byte copy; then the
readers; then `npm run gate:item` once. Routing coverage: a branch routed away from its join (Q4), `user_action` (Q17), no
matching decision edge (Q10), a duplicate task id (Q13), a nested fan-out (Q6) — not applicable: this item routes nothing;
its refusal is at `createRuntime`, before any run, and its message refactor is a construction-time throw.

## Record

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate`, before the readers | **RAN, `GATE EXIT=0`** | M4's second run, real tree held still, node 24.20.0: `check:spec` 7 / 75 / 135 rules; `check:docs` 43 snippets (37 run, 6 check); L1-L5 **62 files / 1765 cases** in node, deno 2.9.6 and chromium; L6 **2664 / 176**, 0 failed, in node and deno. The first run was `EXIT=1` on `l4-corpus.test.ts:812`'s case count (M4). firefox and webkit NOT RUN |
| conformity reader | **RAN** | spec first; every claim probed true, `Owns` respected, the five readings the author flagged judged acceptable (`DerivationRefused` over a new class included); **no defect**; C1 SHOULD-FIX, C2-C7 notes — acted on below |
| adequacy reader | **RAN** | its own 25 one-clause mutations: **22 killed, 3 survivors** — its R6 (A1), R3 (A2), R10 (A3); A4 and A5 notes; **no defect** — acted on below |
| overlap | | **0 shared subjects**: conformity read the spec, the message test's provenance and the prose; adequacy the refusal's reach and its message's unasserted half |
| author's provocations, re-run after the readers' items | **RAN** | harness `C:/tmp-w169/mutate.mjs` in the byte copy `C:/tmp-w169/m`, re-synced with the final tree: control clean; **26 of 26 KILLED** — the 22 of M3, and R1-R4 below |
| **`gate:item`, the confirming run** | **RAN, `GATE:ITEM EXIT=0`** | ONE command on the final tree, held still, after the readers' items and the record step (this Record written before it, but for this row and the Status line): the ladder — `check:spec` 7 / 75 / 135 rules, `check:docs` 43 snippets (37 run, 6 check), L1-L5 **62 files / 1765 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 1765; the readers' cases are inside existing cases, so the count did not move), L6 **2664 / 176**, 0 failed, in node and deno — then the self-tests less `check:register:selftest`: **10/10 completed, 10 ok**, 955.4 s self-test wall. firefox and webkit NOT RUN; `gate:full` NOT RUN and not owed (W176 is P34's last item) |

**The author's mutation table** (M3, then the readers' items; each ONE clause, sentence E; graded on the runner's `FAIL` lines over `registry.test` and `runtime.test`).

| id | the clause broken | killed by |
|---|---|---|
| K1 | the refusal never fires | registry; runtime (the flipped control and the W169 case) |
| K2 | `RateLimitGroup` refused in place of the keyed one | registry; runtime |
| K3 | the `{ key: cost }` record read as holding nothing | registry; runtime |
| K4 | `groups` read beside `residentGroups` (`FD-R6`'s road refused) | registry; runtime (every FD-R6 case) |
| K5 | named instances skipped | registry; runtime |
| K6 | default instance and named instance named the wrong way round | registry; runtime |
| K7 | `at` the type, not the pool key | registry; runtime |
| K8 | the message drops the group | registry; runtime |
| K9 | `ConfigRefused` in place of `DerivationRefused` | registry; runtime |
| K10 | the message drops `residentGroups` | registry; runtime |
| K11 | the message drops `Q619` | registry only |
| K12 | the message drops the built-in type | registry; runtime |
| K21 | a CODE group type matched by name (`/Keyed/`) | runtime only |
| K22 | every resident group refused but a `RateLimitGroup` | registry; runtime |
| K13 | `<document>` written `null` | runtime |
| K14 | findings joined by `, ` | runtime |
| K15 | `rules` unsorted and repeated | runtime |
| K16 | the flow id unquoted | runtime |
| K17 | the RUNTIME road one finding short | runtime |
| K18 | the DRIVER road one finding short | runtime |
| K19 | the runtime road hands `FD-R6` to `InvalidDefinition` | runtime |
| K20 | the runtime road names another flow id | runtime |
| R1 | A1's survivor, re-cut: pools of a type the consumer did not declare exempted (`!nodeTypes.has(p.type)` — the built-in `Transform`) | registry (the A1 case) |
| R2 | A2's survivor, re-cut: only the FIRST resident key read (`.slice(0, 1)`) | registry (the A2 cases) |
| R3 | A3's survivor, re-cut: the roads-that-work sentence dropped from the message | registry (the A3 assertion) |
| R4 | C3: the empty-list precondition removed | runtime |

**The adequacy reader's table, as reported**: 25 one-clause mutations, 22 KILLED; its survivors R6, R3 and R10 are A1, A2 and A3 below, each closed by a case and re-cut as the author's R1-R3 above, now KILLED. *(The reader's per-mutation list is its own report; this file carries its count and its survivors.)*

**What was done for each finding.** Every expected value is from Q619 option B, the spec's rows or the fixtures' literals.

| | finding | done |
|---|---|---|
| A-A1 (R6, SHOULD-FIX) | no case held a named instance of the BUILT-IN `Transform` holding the keyed group resident; exempting non-consumer types survived | **case added** in the registry block: `pools.reshape = { type: 'Transform', pool: { residentGroups: ['api'], idleTimeout: 1000 } }` refused `at` `reshape`, naming `pool "reshape" (an instance of "Transform")` and `group "api"`. R1 KILLED |
| A-A2 (R3, SHOULD-FIX) | no MIXED resident set; reading the first key only survived | **cases added**: `['gpu', 'api']` and `{ gpu: 1, api: 1 }`, the keyed group second, each refused naming `group "api"`. R2 KILLED |
| A-A3 (R10, note) | Outputs (1) says the message names the roads that work, and nothing asserted it | **asserted** on the list case: `Name "api" in groups` and `hold a ConcurrentLimitGroup or RateLimitGroup resident`. R3 KILLED |
| A-A4 (note) | *no pool and no scheduler built* cannot be made to fail by one clause — statement order guarantees it | **kept as a REGRESSION GUARD and counted as no kill**: `resolveRegistry` runs before any group, pool or scheduler is constructed in `createRuntime`, so the assertion would see a reordering, not a clause |
| A-A5 (note) | the runtime road's coverage is narrow — no `Q619` assertion there, `idleTimeout` always 1000, `resume` not asserted on its own road | **recorded, not widened**: the refusal is `resolveRegistry`'s and `createRuntime`'s ONE call to it precedes `start` and `resume` alike, so both roads share one function the registry block exercises in full (K11 is registry-only for this reason) |
| C-C1 (SHOULD-FIX) | the `start` / `new Driver` expected message was built from `r.check(two)`'s details by a copy of the template — an expected value from output (workflow section 5 rule 1); the Tests line claimed a hand-written literal, true of `fromFindings`' case alone | **fixed**: ONE whole hand-written literal, details included — FD-V17's and FD-V32's own sentences from `src/definition/validate.ts` read for this flow (the stray key; `Nobody` against `"Flat", "Keyed", "Plain", "Transform"`); the Tests line says so |
| C-C2 (note) | `AGENTS.md` section 9's form said `<node, or <document>>`; `at` may be an edge site `id#edgeN` (`validate.ts:996`) | **reworded**: `<rule> at <at>: <detail>`, `at` a node id, an edge site or `<document>`; the doc comment too |
| C-C3 (note) | `fromFindings('z', [])` built *"is invalid: "* naming nothing; `at: ''` prints `at : d` | **an empty list is REFUSED** (`RangeError`), stated in the doc comment and `AGENTS.md` section 9, asserted (R4 KILLED); `at` is printed as given, stated |
| C-C4 (note) | the `bootstrap` gap stated only in this file's Out | **added** to `AGENTS.md` section 13, mirroring `FD-R6`'s *a Driver built by hand is not covered* |
| C-C5 (note) | ADR 0097 rule 1 still said *whether to refuse it is Q619, P37's*; `q619.md` open | **record step**: `q619.md` `status: resolved`, `resolved-by` W169 and spec v0.39, a dated paragraph; ADR 0097 rule 1 gains one in-place italic sentence pointing to the answer, the rule itself unchanged |
| C-C6 (note) | `spec/flow-definition.md`'s prose list of `DerivationRefused` cases (*What a derivation returns*, `:1697-1699`) omitted the new clause | **added** there, beside the `idleTimeout: 0` sentence (v0.39, no version moved again) |
| C-C7 (note) | `AGENTS.md` section 9 lists `DerivationRefused` among what `new Driver` throws; the new clause is `resolveRegistry`'s alone | **clarified in place**: `DerivationRefused`'s other clauses need a derivation run and are `resolveRegistry`'s alone |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the refusal in `resolveRegistry` | yes | K1-K12, K21, K22, R1-R3 |
| (2) `InvalidDefinition.fromFindings`, the one function | yes | K13-K16, K18, R4; the W169 message case |
| (3) the runtime road calling it | yes | K17, K19, K20 |
| (4) `wiring.ts:187` | yes | a comment — no check reads it |
| (5) `result-schema.test.ts` `:62`, `:309` | yes | comments — no check reads them |
| (6) spec v0.39, v0.14 and both README rows | yes | `check:spec` C8 binds each Status to its README row; the prose is bound by no test |
| (7) `AGENTS.md` sections 9, 12, 13 | yes | prose — no snippet added, so `check:docs` reads none of it |
| (8) the L1 cases | yes | the tables above |

**What broke.** The first gate: `test/definition/l4-corpus.test.ts:812` COUNTS the registry refusal suite's cases (15), and a sixteenth was added — fixed by folding the cases into the existing `DerivationRefused` test, inside `Owns` (M4). Nothing else.

**What this taught.**
- **A census site P34's D′ paragraph does not name**: `l4-corpus.test.ts`'s per-SUITE case counts (`:812` and its siblings), beside the `LATE_SUITES` names the paragraph does name. An item adding a `test` to a counted suite moves it. For P34's retro.
- **W169 does not move `X10`**: P34's D′ paragraph lists it among the items moving `examples/README.md`'s copies, and L6 is unmoved at 2664 / 176. For P34's retro.
- **P34 prediction 1 held**: exactly one existing assertion flipped, and the message refactor moved none (M2).

**Questions raised.** None — Q635-Q637 unused, skipped. **Closed**: [Q619](../questions/q619.md), resolved by this item.
