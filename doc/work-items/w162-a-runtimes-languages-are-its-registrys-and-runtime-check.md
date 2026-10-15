# W162 — a runtime's languages are its registry's, and `runtime.check`

**Status:** done 2026-10-15 — **`npm run gate:item` EXIT 0** on the final tree, one command; declared 2026-10-15 on
`bdd1b48`, declaration step RUN the same day in a byte copy; exceptions E1 and E2 ASKED at the declaration step and E3
after the readers, each ANSWERED YES by the maintainer 2026-10-15 and recorded before its edit; both reader passes RUN,
neither found a code defect; Q285 closed, nothing raised
**Plan:** [P37](../plans/p37-a-runtime-is-its-registry.md) — *what may a running runtime be asked to accept, when its
registry is fixed at `createRuntime`?* — its FIRST item.

```
Spec:       spec/flow-definition.md v0.33 -> v0.34: the `transform` subsection's worker-half sentence (every typed
            pool carries every registered language, superseding ADR 0051 rule 4); the registry document's `languages`
            row; a new section-3 subsection, "A runtime is its registry — check, then start", stating runtime.check
            and that start and resume refuse from it, with the payload's and the run id's refusals excluded by name.
            No FD-V id moves, no rule is added, no refusal class is added; the count stays 42.
Owns:       from P37's W162 row: src/scheduler/runtime.ts, src/scheduler/bootstrap.ts, src/scheduler/index.ts,
            spec/flow-definition.md, spec/README.md, test/scheduler/**, test/definition/l4-corpus.test.ts,
            examples/l6.ts, examples/run-flow.ts, examples/settlement-cost.ts, examples/README.md,
            scripts/check-docs.mjs, AGENTS.md, README.md, doc/decisions/0096-*.
            scripts/check-docs.mjs is in the row and is NOT edited: no `run` snippet is added or removed (M8).
            And by the Exceptions below, ANSWERED YES 2026-10-15: src/scheduler/envelope-worker.ts (E1),
            scripts/jsr-smoke.ts and scripts/pack-smoke.mjs (E2); examples/retention.ts's four buildRuntime calls (E3).
Inputs:     P37 decisions 1-3 and 10-11, facts 2, 6 and 8, stop-and-asks (a) and (b) as answered, predictions 1-2,
            sentences B' and C and the census-site paragraph D; ADR 0051 rule 4 and consequences 2 and 5; ADR 0075
            consequence 3; Q285; ADR 0058 and ADR 0091 (what start and resume hand back, and when a run id is spent).
Outputs:    (1) bootstrap writes EVERY adapter's worker URL into EVERY pool it builds, sorted by name, a copy per pool;
                none given, no `languages` key. BootstrapOptions.flows and transformLanguagesByType REMOVED.
            (2) createRuntime: RuntimeOptions.flows and LanguageNotBuilt REMOVED; Runtime.check(flow): Finding[] —
                validateDefinition against the runtime's own registry, derived once; openRun (start and resume)
                throws InvalidDefinition from check's findings before a run id is minted, with new Driver's message.
            (3) the sub-path's exports less the two removed names.
            (4) spec/flow-definition.md v0.34 (above); spec/README.md's row.
            (5) ADR 0096, superseding ADR 0051 rule 4, amending ADR 0075 in part, resolving Q285.
            (6) AGENTS.md: section 9's runtime-error paragraph (three, not four), section 11's `runtime.register`
                row (declined), section 12's paragraph (a runtime is its registry, check then start, BREAKING, the
                cost, two runtimes overlapping), section 14's one sentence on the load, eleven snippets' `flows`
                removed, and section 15's STEP 6 run snippet extended with `check` — mirrored byte for byte in
                README.md (X8).
            (7) examples: the four l6.ts createRuntime sites and the four settlement-cost.ts sites lose `flows`;
                run-flow.ts's buildRuntime and buildUiRuntime CHECK the flows they are given (choice 1); l6.ts's
                three language clauses re-cut in place (choice 6); examples/README.md's transform-row sentence.
            (8) tests (below), and the L1 census's two renamed suites.
Depends on: nothing (P37's first item)
Blocks:     W163
Tests:      L1 test/scheduler/bootstrap.test.ts — every pool (default, named, built-in) carries exactly the given
            languages, both ways, as worker URLs, in name order; no languages (omitted, {}, an empty Map) builds what
            no options builds, with a control; an adapter with no worker URL refused; a copy per pool; `flows` a
            compile error (@ts-expect-error). test/scheduler/runtime.test.ts — every pool both ways with
            runtime.registry.languages; no language, no key, with a control; a transforming flow never shown to the
            runtime starts, in one language and two; check returns every finding and start throws exactly them with
            new Driver's message, by hand, and spends no run id; FD-R4 and RunIdInUse excluded from check; resume
            refuses from the same call; and over the WHOLE spec corpus — every invalid file's named rule reported by
            check, check equal to the L4 validator, start's rules check's and its message new Driver's, every valid
            file clean. L6 the three re-cut clauses. Expected values from the spec, the corpus file names, the
            document literals and new Driver by hand — never from the runtime's output.
Gate:       `npm run gate` before the readers (P32-retro C); then the conformity and adequacy readers, NOT run by this
            item's author; then `npm run gate:item` ONCE on the final tree. The row's clauses: L1 every pool of every
            typed type carries exactly the registry's languages, both ways with registry.languages, and a registry
            with none builds P18 fact 5's pool options unmoved; check equal to start's refusal on every invalid flow
            of the corpus; L6 the re-cut language clause; the thread and inline cost of fact 2 re-taken and recorded.
Reserves:   Q615-Q618, ADR 0096
```

*Reserves: `npm run state` on `bdd1b48` reads the next free ids as **W162, Q615, ADR 0096** from the tree and from the
ledger, which AGREE. P37 reserves Q615-Q634 and ADR 0096-0100; its W162 row gives this item Q615-Q618 and ADR 0096.*

## Scope

**In** — Outputs (1)-(8).

**Out** — named rather than left implicit, with where it goes instead

- **`createRuntime` holding `defaultRetryPolicy` to `FD-V30` at construction** — P37 stop-and-ask (b)'s other half, and
  the plan's W163 row (*"(b)'s `defaultRetryPolicy` at `createRuntime`"*). So until W163 a malformed one passes `check`
  and every `start` throws `FD-V30` from `new Driver` — stated in the spec's new subsection and ADR 0096 consequence 4.
- **The keyed-group refusal in `check` and `start`** — P37 stop-and-ask (c), W163, ADR 0097.
- **`new Driver` validating a second time** — `src/driver/**` is no item's (P37's paragraph D), so the driver keeps its
  own validation for a driver built by hand and `start` pays it twice; priced in M6 and ADR 0096 consequence 2.
- **The InvalidDefinition message is FORMATTED twice** — in `new Driver` and in `openRun`, the same template, because the
  driver's is not exported and `src/driver/**` is not this item's. The corpus case holds the two equal byte for byte on
  every invalid corpus file, which is what keeps them from drifting.
- **A value that is not a flow at all** (`null`, `nodes` not iterable) — `validateDefinition` throws its own `TypeError`
  (M5), from `check` as from `start` and `new Driver`. `check` is typed `FlowDefinition`; (b)'s *never throwing for a
  flow's defect* is read as a defect the validator reports. Stated in the spec's table and ADR 0096 consequence 5.
- **A browser Web Worker's cost of loading the engine** — not measured (P37 fact 2 left it with the inline cost; the
  row's gate clause names the thread and inline costs, which M4 takes).
- **The exit artifact** — `runtime.check` on real workers in both runtimes, a flow the runtime never saw: W167. The L6
  rows here run on runtimes given no flows, which is the same road, asserted by the re-cut clauses (choice 6).
- **ADR 0075's Context fact 5** — history as written; its consequence 3 is amended in place (record step).
- **`runtime.registry` is a plain object a consumer can MUTATE after `createRuntime`** (the conformity reader's F7) —
  `check` validates against a registry derived ONCE at construction (choice 3), while each `new Driver` reads
  `runtime.registry` as it stands, so a consumer who edits that object could see `check` and `start`'s driver
  disagree. Recorded, not built: nothing in the library writes it, and freezing it is a surface change no plan names.
- **`checkedFor` does not AWAIT the shutdown it starts on a refusal** (the conformity reader's F5) — left as `void`,
  deliberately: `buildRuntime` and `buildUiRuntime` are synchronous and every caller uses their return value at
  once, so awaiting would make both async and move every call site (E3's question, not this one's). The throw that
  follows IS the failure the harness reports; the shutdown only releases pools on the way out.

## What the declaration step measured before anything was edited

*P15 decision 5 and sentence B′: measured 2026-10-15 in a BYTE COPY of `bdd1b48` (`git archive` into `C:/tmp-w162/m`,
`node_modules` copied, **zero links** by `find -type l` and by PowerShell's `ReparsePoint` scan), node 24.20.0 and deno
2.9.6. The change was built there whole, and every lane run.*

| # | fact | measured |
|---|---|---|
| M1 | the baseline, in the copy | `npm run gate` **EXIT 0**: `check:spec` 7 documents / 75 examples / 134 rules; `check:docs` 42 snippets (36 run, 6 check); L1-L5 **62 files / 1689 cases** in node, deno and chromium; L6 **2640 assertions / 173 runs** in node and deno, 29 s each |
| M2 | what the removal breaks at L0 | with `src/` changed alone: `typecheck:tests` 18 errors in `test/scheduler/{bootstrap,runtime}.test.ts`, `typecheck:examples` 11 in `examples/{l6,run-flow,settlement-cost}.ts` — exactly fact 2's census (four `l6.ts` sites and its import, four `settlement-cost.ts`, the two `run-flow.ts` builders). `examples/retention.ts` calls `buildRuntime` and is unmoved (choice 1) |
| M3 | **prediction 1, measured** — the shipped L1 cases and L6 clauses run on the changed `src/`, with the removed names stubbed so the files load | **L1: NINE cases red, not five** — `bootstrap.test.ts`'s whole W61 suite (5: `:338`, `:351`, `:363`, `:375`, `:382`) and `:442`; `runtime.test.ts` `:497`, `:528`, `:540`. **L6: 68 assertions red, not one** — the per-row ADR 0051 rule 4 clause on all **67** rows, and the cross-row *the SAME type carries the engine* clause; the clause the plan named (`:10551`, the helper's reading against this file's) stayed GREEN, because it compares two readings of the DEFINITION and reads no pool. **No case whose registry gives no language moved**, P18 fact 5's captures among them — that half held |
| M4 | **the cost of fact 2, re-taken** (`dev-dist`-free scratch script, node 24.20.0, median of 7) | a `worker_threads` thread importing the JSONata worker half and evaluating `$`: **22.5 ms and 6 524 KiB of heap**, against 0.0 ms and 171 KiB importing nothing (P37: 40.6 ms / 6 087 KiB, another load of the same machine). **Inline**: the envelope's `setup()` with `languages: { jsonata }` **0.018 ms** against 0.003 ms without (0.466 ms the first, cold) — the module is already in the realm. **L6 wall, after the change**: node 29-30 s, deno 29 s, against 29 s each before — no measurable movement over 173 runs. A browser Web Worker: NOT measured |
| M5 | what `validateDefinition` does with a value that is not a flow | `null`, `undefined` and `{ nodes: 5 }` THROW a `TypeError`; `5`, `'x'`, `[]`, `{}` and `{ nodes: [null] }` return findings. The same function `new Driver` calls — Out |
| M6 | what `check` costs, so what `start`'s second validation costs | over the 30 `examples/flows` files that validate against the shared document: median **29.5 µs** per `check`, max **173 µs** (`transformed.flow.json`, whose `FD-V36` compiles three expressions), against ~100 ms per real L6 run |
| M7 | the change whole, in the copy | **`npm run gate` EXIT 0**: `check:spec` 7 / 75 / 134 (unmoved); `check:docs` 42 snippets, 36 run (unmoved); L1-L5 **62 files / 1691 cases** in node, deno and chromium (+2: `runtime.test.ts` +3 in the re-cut suite, `bootstrap.test.ts` -1); L6 **2640 / 173, 0 failed** in node and deno — unmoved, the three clauses re-cut in place. **With E1 and E2 applied**: `deno task jsr:smoke` EXIT 0 (J5, a typed node threaded and inline with a `jsonata` transform, no `flows`), `npm run pack:smoke` EXIT 0 (P7, P11) |
| M8 | the census sites the row names | `spec/README.md`'s row: moved (`check:spec` `C8`). `l4-corpus.test.ts`: the two re-cut suites are RENAMED in `SUITES`, in place, each with a one-line comment — no suite added. `examples/README.md`'s `X10` copies: unmoved (2640 / 173); one sentence of its transform rows changed. `scripts/check-docs.mjs` `RUN_FLOOR`: unmoved — no `run` snippet added or removed (section 15's STEP 6 is EXTENDED), so `check:docs:selftest` is NOT bound by B′ and was NOT run; no always-read document moves, so `check:budget:selftest` is NOT bound either |
| M9 | what the removal leaves stale OUTSIDE the row | `src/scheduler/envelope-worker.ts:12-14`, `:77-79` (comments) and `:379-380` (a `TransformFailed` message telling the reader the helper *needs the flow*) — **E1**; `scripts/jsr-smoke.ts:130` and `scripts/pack-smoke.mjs:297`, `:385`, each passing `flows` to `createRuntime` — **E2**. Neither file is typechecked by any lane and neither is on a gate, so both stay GREEN unedited: the option is an unread key at run time. `examples/retention.ts`: unmoved |

## Exceptions — ASKED at the declaration step, ANSWERED YES by the maintainer 2026-10-15, recorded BEFORE the edit

*`doc/workflow.md` section 1 rule 6 and section 7 rule 2. Each is the edit and nothing else; both were applied in the byte
copy, where every lane and both smoke scripts are green (M7).*

| | file | the edit, and nothing else | why, and its precedent | answer |
|---|---|---|---|---|
| **E1** | `src/scheduler/envelope-worker.ts` | three passages. `:12-14` *"and — for a type some node of which declares a transform — the worker-side module URL of each language those nodes name (`languages`)"* becomes *"and the worker-side module URL of every language the registry names (`languages` — every typed pool's since ADR 0096, W162)"*; `:77-79` *"written by the bootstrap helper ONLY for a type some node of which declares a `transform`, and only for the languages those nodes name — so a pool whose nodes never transform loads no engine."* becomes *"written by the bootstrap helper into EVERY pool, for every language it is given — ADR 0096 rule 2 (W162), superseding ADR 0051 rule 4's *only for a type some node of which declares a transform*."*; `:380`, the thrown message's second half *"the bootstrap helper writes an adapter URL for a type some node of which declares a transform, and needs the flow and the languages to do it"* becomes *"the bootstrap helper writes every language it is given into every pool, so this one was not in the registry the pool was built from"* | all three state ADR 0051 rule 4, which ADR 0096 supersedes; the third is a message a consumer reads, and it sends them looking for a `flows` option that no longer exists. No test asserts any of the three. **Precedent: W159's E1 and E2** (a census site the row omitted, asked and answered YES). **Alternative**: leave them for W166 or P34 (W159's Out left `:346` there), with the message false until then. **Recommended: YES** | **YES** 2026-10-15 |
| **E2** | `scripts/jsr-smoke.ts:130`, `scripts/pack-smoke.mjs:297`, `:385` | `, flows: [flow]` removed from each of the three `createRuntime` calls, nothing else | the publish smokes call `createRuntime` with an option that no longer exists; no lane typechecks either file, so they pass as they stand — and they are the two files that RUN the published artifact, so they should show the published API. Proven green in the copy with the edit (M7). **Precedent: the same as E1.** **Alternative**: leave them — green, and a removed option in the two scripts that document the published surface. **Recommended: YES** | **YES** 2026-10-15 |
| **E3** | `examples/retention.ts:298`, `:431`, `:432`, `:516` | `buildRuntime(false, [MAL], undefined, 0)` becomes `buildRuntime(false, undefined, 0)` at each of the four, nothing else — beside the in-Owns edit that removes `flows` from `examples/run-flow.ts`'s `buildRuntime` and `buildUiRuntime` (deleting `checkedFor`, so choice 1 and the Out entry on its `void` shutdown are SUPERSEDED) and moves `examples/l6.ts`'s eleven call sites | ASKED after the readers (coordinator, 2026-10-15): choice 1 kept a parameter whose only job was a harness check. Proven green in the byte copy (`npm run gate` EXIT 0, `node examples/retention.ts` EXIT 0). **Precedent: E1/E2** | **YES** 2026-10-15 |
| — | `doc/decisions/0051-*`, `doc/decisions/0075-*`, `doc/questions/q285.md` | **not exceptions — the record step's** (`doc/workflow.md` section 1 rule 5): ADR 0051's status line names rule 4 superseded; ADR 0075 consequence 3 is amended in place; Q285 resolved by ADR 0096. Written now rather than at the Record because ADR 0096's `resolves: Q285` and Q285's `resolved-by` are compared both ways by `check:register` (`R7`) | | — |

## Choices made inside the declaration and not named by P37

1. *(SUPERSEDED by E3, after the readers: the parameter and `checkedFor` were removed and every call site moved.)* **`run-flow.ts`'s `buildRuntime` and `buildUiRuntime` KEEP their `flows` parameter and CHECK each flow** against the
   runtime before returning it, shutting it down and throwing every finding on a refusal. The alternative — drop the
   parameter — moves eleven `l6.ts` call sites, three in `run-flow.ts` itself and four in `examples/retention.ts`, which is
   outside the row. Giving the
   parameter a job keeps it from being an option that does nothing, and it is ADR 0096's *check, then start*.
2. **`check` runs before the run id is minted**, so a refused flow advances no counter: before W162 `start` minted
   (`r<n>`, the counter moved) and `new Driver` then threw. The next minted id after a refusal is now the one it would
   have been without it — asserted (`r1`).
3. **The validator's registry is derived ONCE at `createRuntime`** from `runtime.registry`, through the validator's own
   normalisers, exactly as `new Driver` derives it; the corpus case holds `check` equal to the L4 validator on every
   corpus file and `start`'s refusal equal to `new Driver`'s by hand.
4. **Each pool gets its own copy of the `languages` record** — W61's per-type record was one object shared by every
   instance of a type; asserted.
5. **The two re-cut suites are RENAMED, not added**, so `l4-corpus.test.ts`'s `SUITES` changes two names in place.
6. **L6's three language clauses are re-cut IN PLACE, so no count moves**: the per-row clause asserts every pool carries
   exactly `LANGUAGES` (ADR 0096 rule 2); the cross-row *SAME type carries the engine* clause asserts `Scorer` carries
   it on every run, `typed` and `transform-fails` included; and the `:10551` clause — whose function is removed — is
   replaced by its control, *a run whose flow transforms on NOTHING still carries the engine — every such row, and there
   are such rows*, with `CROSS_ROW_SUBJECTS`' entry renamed. The row's Owns parenthetical names fact 2's sites and
   `:10551`; M3 measured the per-row and `SAME type` clauses as the loud ones, so they are re-cut too.

## Predictions checked

| P37 prediction | verdict |
|---|---|
| **1** — LOUD at exactly fact 2's five L1 cases and its one L6 clause (`:10551`), and nowhere else; no case whose registry gives no languages moves | **FALSE in its census, TRUE in its second half** (M3): nine L1 cases and 68 L6 assertions, and the named L6 clause was NOT one of them. The half about registries with no language held |
| **2** — `check` and `start` never disagree on the corpus | **TRUE**, asserted on every invalid and valid corpus file (the corpus case) |
| 3-6 | W163-W166's |

## Verification

`npm run gate` (each rung's exit read on its own line), then the readers, then `npm run gate:item` once. Routing
coverage: none of a branch routed away from its join (Q4), `user_action` (Q17), no matching decision edge (Q10), a
duplicate task id (Q13) or a nested fan-out (Q6) is this item's — it routes nothing; the corpus case reaches every
`FD-V` refusal through `check` and `start`, routing nothing.

## Record

**Gate — what ran.** Baseline `bdd1b48`; every number below is the final tree's, from the confirming `gate:item`.

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **RAN, pass** | `deno lint` (146 files), the five `typecheck` lanes |
| the checks | **RAN, pass** | the ladder's twelve; `check:spec` 7 documents / 75 examples / **134 rules** — unmoved, no rule added; `check:docs` 42 snippets, 36 run — unmoved |
| L1-L5 | **RAN, pass** | **62 files / 1695 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 1695); firefox and webkit NOT RUN (`test:browser:all` is not on the gate). Baseline 62 / 1689 |
| L6 node 24 | **RAN, pass** | **2640 assertions / 173 real runs**, 0 failed — unmoved; the three language clauses re-cut in place (choice 6) |
| L6 deno | **RAN, pass** | **2640 / 173**, 0 failed |
| row clause: every pool carries exactly the registry's languages, both ways; none builds fact 5's options unmoved | **RAN, at L1** | `runtime.test.ts` and `bootstrap.test.ts`' W162 suites; P18 fact 5's captures (`:160` and bootstrap's `:91`) unmoved |
| row clause: `check` equal to `start`'s refusal on every invalid corpus flow | **RAN, at L1** | the corpus case — every invalid and valid file of `spec/examples/` |
| row clause: L6 the re-cut language clause | **RAN** | per-row, `SAME type`, and the `transforms on NOTHING` control |
| row clause: the thread and inline cost re-taken | **RAN** | M4: 22.5 ms / 6 524 KiB per node thread, 0.018 ms inline; a browser Web Worker NOT measured |
| `npm run gate`, before the readers | **RAN, `GATE EXIT=0`** | on the real tree (P32-retro C), twice — the second after a spec citation fix (`RN-R19` to `RN-R23`) |
| E1/E2 applied, then `npm run gate`, `deno task jsr:smoke`, `npm run pack:smoke` | **RAN, each EXIT 0** | |
| conformity reader | **RAN** | F1-F7, no code defect; acted on below |
| adequacy reader | **RAN** | F1-F7, no code defect; acted on below |
| overlap | | **1 shared subject**: the runtime `start`'s refusal order against `ID-R2` and `RunIdInUse` was neither stated nor tested (conformity F2 = adequacy F1) |
| after the readers' items, `npm run gate` | **RAN, `GATE EXIT=0`** | 1695 cases, L6 2640 / 173 both runtimes |
| E3 applied, `npm run gate` and `node examples/retention.ts` | **RAN, each EXIT 0** | |
| **`gate:item`, the confirming run** | **RAN, `GATE:ITEM EXIT=0`** | ONE command on the final tree, held still: the ladder, then the self-tests less `check:register:selftest` — **10/10 lanes completed, 10 ok**, 850.1 s self-test wall, 1040 s in all, `check:register:selftest` left out. `gate:full` NOT RUN and not owed (W167 is P37's last item) |

**What was done for each finding.**

| | finding | done |
|---|---|---|
| C-F2 / A-F1 | `start`'s order against `ID-R2` and `RunIdInUse` neither stated nor tested | case *ORDER on start*: an invalid flow with a run id in use, and with `'a:b'`, each `InvalidDefinition` `FD-V32`, with controls on a valid flow; the spec subsection and ADR 0096 rule 5 state the order, and ADR 0096 **amends ADR 0022 rule 3** for the runtime road (front matter, and an inline note at ADR 0022 rule 3 — ADR 0058 rule 3's precedent) |
| A-F2 | *resume refuses from the same call* did not discriminate | the case resumes the broken flow on the runtime that HOLDS the run id and asserts `InvalidDefinition`, not `RunIdInUse`, with a control |
| A-F3 | resume's order (header, clone, then `check`) unheld | case *ORDER on resume*: a refused header with an invalid flow is `ResumeRefused`; an uncloneable entry payload with an invalid flow is `DataCloneError` |
| A-F4 | the removal of `LanguageNotBuilt` and `transformLanguagesByType` pinned by nothing | a case asserting both absent from the sub-path module and the root, with a control |
| A-F5 | the `at ?? '<document>'` branch | reached by the corpus (`FD-V10--cycle`, `FD-V8--end-node-with-edges`), now ASSERTED on the cycle file: a finding at `null`, and `start`'s message names `FD-V10 at <document>` |
| A-F6 | E1's message asserted by nothing | a bootstrap case drives `EnvelopeWorker` with `lang: 'nope'`: names the language and what the pool carries, points at the registry, never at a flow |
| A-F7 | `runtime.ts:196` named `flows` as a live option | marked *as it stood: W162 removed it* |
| C-F1 | what `check` THROWS on was stated loosely | the spec's `check` row and ADR 0096 consequence 5: exactly `null`/`undefined` in place of the flow, and a `nodes` present and not iterable; `5` or `{}` return `FD-V23` |
| C-F3 | ADR 0096 front matter should say `ADR 0075 consequence 3` | **NOT done**: `check:register` `R7` refuses that qualifier (only `rule(s) N`, `decision(s) N`, `in part`), measured EXIT 1; the field stays `in part` and the prose names consequence 3 |
| C-F4 | `q285.md` had a backtick for an apostrophe | corrected |
| C-F5 | `checkedFor`'s `void runtime.shutdown()` | first recorded as deliberate in Out; then MOOT — E3 deleted `checkedFor` |
| C-F6 | `AGENTS.md` said a caller passing `flows` fails to compile | a LITERAL fails to compile; an options object held in a variable compiles and `flows` is unread |
| C-F7 | `runtime.registry` mutable after `createRuntime`, so `check` and a later `new Driver` could disagree | recorded in Out; no code change |

**The provocations after the readers** (rule 8, in the byte copy, each edit asserted to change its file and each
restore digest-checked; the harness is a scratch script, `C:/tmp-w162/mutate.py`, NOT in the tree), run against
`runtime.test.ts`: **R6c** `RunIdInUse` placed before `check`, mint untouched — **KILLED** (3 cases red, the new ORDER case
among them); **R9** resume skips `check`, the driver validating instead — **KILLED** (the discriminating clause alone);
**R10** `check` before the header refusal — **KILLED**; **R10b** `check` before the entry payload's clone — **KILLED**;
**R8** `LanguageNotBuilt` exported again — **KILLED**; **R8b** `transformLanguagesByType` exported again — **KILLED**; the
no-edit CONTROL — EXIT 0. 6 of 6 killed.

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) bootstrap writes every language into every pool; `flows` and `transformLanguagesByType` removed | `bootstrap` | the W162 bootstrap suite; L6 per-row clause on 67 rows (M3); the removed-surface case; `@ts-expect-error` at `typecheck:tests` |
| (2) `Runtime.check`; `start`/`resume` refuse from it; `flows` and `LanguageNotBuilt` removed | `createRuntime`, `openRun` | the W162 runtime suite, the corpus case, both ORDER cases (R6c, R9, R10, R10b) |
| (3) the sub-path's exports | `src/scheduler/index.ts` | the removed-surface case (R8, R8b) |
| (4) spec v0.34 and its README row | | `check:spec` `C8` |
| (5) ADR 0096 | | `check:register` `R7` (its `resolves` against Q285's `resolved-by`) |
| (6) `AGENTS.md` and `README.md` | | `check:docs` X3/X4 (the snippets run), X8 (README byte for byte) |
| (7) examples | | `typecheck:examples`; L6 in both runtimes |
| (8) tests and the census | | `l4-corpus`'s suite census |

**`git diff --name-only` against `Owns` and the exceptions**, on the final tree: 22 modified and 2 new files — `AGENTS.md`, `README.md`, `examples/README.md`, `examples/l6.ts`, `examples/run-flow.ts`, `examples/settlement-cost.ts`, `spec/README.md`, `spec/flow-definition.md`, `src/scheduler/bootstrap.ts`, `src/scheduler/index.ts`, `src/scheduler/runtime.ts`, `test/definition/l4-corpus.test.ts`, `test/scheduler/bootstrap.test.ts`, `test/scheduler/runtime.test.ts` (Owns); `src/scheduler/envelope-worker.ts` (E1); `scripts/jsr-smoke.ts`, `scripts/pack-smoke.mjs` (E2); `examples/retention.ts` (E3); `doc/decisions/0022-*`, `0051-*`, `0075-*`, `doc/questions/q285.md` (the record step); new `doc/decisions/0096-*` (Owns) and this file. Nothing is undeclared.

**Predictions, as measured.** P37 prediction 1 **FALSE in its census** — nine L1 cases and 68 L6 assertions went red
on the change, and the one L6 clause it named (`:10551`) did not (M3); its second half, *no case whose registry gives no
language moves*, **TRUE**. Prediction 2 **TRUE** on every corpus file.

**What broke.**

1. **Prediction 1's census was a census of the wrong thing**: fact 2 found the sites that NAME the removed functions,
   while the assertions that HOLD the reversed rule were elsewhere — the per-row L6 clause and the `SAME type` clause,
   which name neither. Found by running the old assertions on the new code (M3), before any edit to them.
2. **The new subsection cited the wrong rule** for resume's header refusal (`RN-R19`, the replay rule; `RN-R23` is
   the refusal) — caught by the author re-reading before the readers, fixed, gate re-run.
3. **The refusal ORDER was decided and not written down**: moving `check` ahead of the run id reversed ADR 0022 rule
   3's order on the runtime road, and nothing said or tested so until both readers found it (the overlap).

**What this taught.** Nothing proposed here; the retro decides.

**Questions.** Raised: none. Closed: **Q285**, resolved by ADR 0096. **Q615-Q618 released unused**. ADR 0096 issued.
**Exceptions**: E1, E2 (YES at the declaration step) and E3 (YES after the readers), each recorded before its edit.
