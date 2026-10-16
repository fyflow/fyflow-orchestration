# W167 — the exit artifact: a runtime that is its registry, on real workers

**Status:** done 2026-10-16 — **`npm run gate:full` EXIT 0** on the final tree, one command, the plan's last item; both reader passes RAN, all seven exit clauses MET, their items R1-R8 acted on; Q633 raised (DEFECT, the maintainer's answer to F-1), Q634 released; no exception. Declared 2026-10-16 on `0a7aae3`; the declaration step RUN the same day in a byte copy (M1-M5 below); P37's LAST item
**Plan:** [P37](../plans/p37-a-runtime-is-its-registry.md) — *what may a running runtime be asked to accept, when its
registry is fixed at `createRuntime`?* — and this is its LAST item and its EXIT ARTIFACT.

```
Spec:       NONE moves — an exit artifact writes no rule (W94's, W155's and W160's precedent). The expected values are
            written from spec/flow-definition.md v0.38: section 3's "A runtime is its registry — check, then start" (check
            equal to what start refuses; every typed pool — each type's default, each named instance, the built-in
            Transform — carrying every language the registry names), "A pool instance, and a group"'s `pool` row (an
            instance's options merged SHALLOWLY over its document type's), "The schema subset"'s four annotations
            (accepted, constraining nothing; `format` refused by name), "A sample the caller GIVES" (one verdict, shape
            `given`, no producer, source `given`), the `transform` subsection and FD-C5 (the worker receives the
            TRANSFORMED value as `input`), FD-R4 (the payload held once at start), FD-R6 (a node reaching a built-in
            keyed group, start given no createTask), FD-V32 and FD-V35; spec/run-state.md section 3 (the outcome);
            spec/task-id.md section 1 (the four segments); ADR 0096-0099.
Owns:       from P37's W167 row: examples/l6.ts, examples/flows/**, examples/workers/**, examples/README.md.
            examples/flows/** and examples/workers/** are in the row and are NOT edited: the flows and the workers are
            written in the block (W141's, W160's and W163's precedent) — a file under examples/flows/ is walked by the L6
            corpus censuses (test/definition/wiring.test.ts; spec/outcome-record.md section 4's task-node census) and a
            worker under examples/workers/ by check:workers and the shared registry.json, all outside this row.
            Exceptions: none declared.
            Record-step files (doc/workflow.md section 1 rule 5): doc/questions/** (Q633-Q634 if raised), this file.
            NOT the plan's Record or Retro — the coordinator's, after this item.
Inputs:     P37's Exit artifact (seven clauses), decisions 1-4, 8-9, stop-and-asks (a)-(e) as answered, facts 1, 4 and 5,
            sentences B' and C and paragraph D (an L6 assertion or run moves examples/README.md's X10 copies); W162-W166's
            Outs, each naming its L6 clause as W167's; W163's keyed block and W160's cancel block as the shape.
Outputs:    (1) ONE cross-row block in examples/l6.ts, W163's shape: its registry DOCUMENT written in the block — data:
                workers whose schemas carry title, description, readOnly and writeOnly; two document node types (`Intake`,
                `Shape`, the latter declaring pool options); a NAMED pool instance `shape-wide` of `Shape` declaring its own
                `pool`; a document-declared KeyedRateLimitGroup `api` no flow but D reaches; `languages: ["jsonata"]` —
                and ONE runtime from `createRuntime(document, { languages })`, given NO flow. On it, in this order: flow A
                (no transform) runs to done; flow C (a definition defect) and flow D (a node reaching `api`) are checked and
                refused; flow B, never shown before, is checked and runs to done; tryTransform on B's entry with a given
                input. Beside it, the same document with `format` added to one schema, refused at createRuntime.
            (2) the claims, one per subject, each in CROSS_ROW_SUBJECTS — by exit clause:
                (1) every pool the scheduler holds (Intake, Shape, shape-wide, Transform) carries exactly the registry's
                    one language; the runtime's resolved languages are the document's;
                (2) A under r1: done settled completed, terminal, its node done;
                (3) check(B) is []; B under r2 (neither refusal spent an id) settled completed, terminal; the untransformed
                    entry's worker received the payload unchanged (the CONTROL); t1's worker received t1's transformed
                    value; t2's worker received t2's; t1 ran on pool Shape and t2 on shape-wide (the scheduler's own
                    tasks); the two pools as the scheduler built them — the instance's own maxThreads, the type's
                    idleTimeout merged under it;
                (4) check(C)'s rule ids EQUAL the InvalidDefinition start(C) throws, both the hand-written set; nothing
                    reached the scheduler *(this second claim REMOVED at the build — M3: it cannot fail)*;
                (5) the worker schemas as the runtime resolved them are the declared ones, the four annotations kept; the
                    same document with `format` beside `readOnly` refused SchemaRefused naming the keyword and its path;
                (6) tryTransform on B's entry given an input: ONE verdict, shape given, no producer, source given,
                    transform-passes, the hand-derived result; its CONTROL, the same call with no input, [] (P37 fact 4);
                (7) check(D) is FD-R6 at the keyed node; start(D) throws LimitKeyMissing at it with nothing reaching the
                    scheduler.
                Eighteen cross-row assertions over TWO runs, as declared before the block ran. *(SEVENTEEN as built — M3; EIGHTEEN after the readers — R7.)*
            (3) every L6 census the block moves, moved in the same diff: CROSS_ROW, DECLARED_TOTAL, DECLARED_RUNS,
                CROSS_ROW_SUBJECTS, pairRunCount, the file header (P37 in the exit-artifact list, one table row); and
                examples/README.md's two X10 copies and the run tally in its l6.ts cell.
Depends on: W166 (done, 0a7aae3)
Blocks:     nothing — P37's Record and retro follow
Tests:      examples/l6.ts at ladder L6 in node 24.20.0 and deno 2.9.6. Every expected value written from the spec, the
            fixture's own literals (payload, expressions, pool options, the given input) and the JSONata expressions
            evaluated by hand BEFORE the block was run; nothing depends on a completion order (every flow is linear).
            Each claim shown able to fail by a provocation (workflow section 5 rule 8), ONE clause per mutation, in a byte
            copy, recorded below.
Gate:       `npm run gate` before the readers (P37 sentence C); then the conformity and adequacy readers, NOT run by this
            item's author; then `npm run gate:full` ONCE on the final tree (the plan's LAST item, workflow v0.29).
Reserves:   Q633-Q634 (P37's W167 row); no ADR (ADR 0100 expected unused); W168 stays reserved and expected unused
```

*Reserves: `npm run state` on `0a7aae3` (in the byte copy) reads the next free ids as **P38, W167, Q627, ADR 0100** from the
tree and W162, Q615, ADR 0096 from the ledger (P33's Retro) — they DISAGREE because P37 was declared and W162-W166 spent ids
since that sentence; P37's own reservation governs. Its W167 row gives this item Q633-Q634.*

## Scope

**In** — Outputs (1)-(3).

**Out** — named rather than left implicit, with where it goes instead

- **The `createTask` road on a keyed group** — W163's keyed block holds it on real workers; clause (7) is the REFUSAL.
- **`runtime.register`** — declined (P37 decision 1, #5).
- **A file under `examples/flows/` or `examples/workers/`** — see Owns.
- **Any edit to `src/`, `spec/`, `AGENTS.md`** — none needed; an exit artifact writes no rule.

## What the declaration step measured before anything was edited

*P15 decision 5 and sentence B′: measured 2026-10-16 in a BYTE COPY of `0a7aae3` (`git archive` into `C:/tmp-w167/m`,
`node_modules` copied, **zero links** by `find -type l` and by PowerShell's `ReparsePoint` scan), node 24.20.0 and deno
2.9.6.*

| # | fact | measured |
|---|---|---|
| M1 | the baseline, in the copy | `node examples/l6.ts` **EXIT 0, 2646 assertions / 174 real runs**; `npm run test:l6:deno` **EXIT 0, 2646 / 174** |
| M2 | the block, before any count moved | node: **18 new assertions, all passing on the first run**; EXIT 1 on exactly the three count lines — derived 2652 against 2634; `DECLARED_TOTAL` 2665 against 2646 (2646 + 18 passing, plus the ONE failure pushed before that check, the derived count's — 2664 passed + 1; the conformity reader's F1 corrected this cell, which read *the three failures counted in*); `DECLARED_RUNS` 176 against 174. 18 and 2 runs, as declared |
| M3 | **one claim REMOVED as unable to fail** | *the refused start(C) handed the scheduler nothing*: `new Driver` validates the definition again (ADR 0096 consequence 2), so no single edit dispatches a task for an invalid flow — a claim no provocation can turn red is a placeholder (workflow section 5 rule 3). **Seventeen claims**: `CROSS_ROW` 313 -> 330, `DECLARED_TOTAL` 2646 -> 2663, `DECLARED_RUNS` 174 -> 176, `CROSS_ROW_SUBJECTS` +17, `pairRunCount` + the block's runs, the header (P37 in the list, one table row); `examples/README.md`'s two `X10` copies and the l6 cell's run tally. Also at the build: the runtime is handed `structuredClone`s of the document, the payload and the given input (rule 8 (c): an in-place edit by the runtime would otherwise edit the expectation with it), and a start of A or B that THROWS is recorded on the claims rather than crashing the block. **Unmoved, measured**: L1-L5 (no test), `check:spec` (no rule), `RUN_FLOOR` (no snippet), no file under `examples/flows/` or `examples/workers/`, no always-read document — so neither self-test B′ names is bound |
| M4 | the whole ladder, in the copy and then on the real tree | **`npm run gate` EXIT 0** both: `lint` 146 files; the five `typecheck` lanes; `check:spec` 7 documents / 75 examples / 135 rules; `check:docs` `X10` compared 2 copies against **2663 / 176**; L1-L5 **62 files / 1763 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 1763) — unmoved; L6 **2663 / 176, 0 failed** in node and in deno |
| M5 | the author's provocations (rule 8, written to the RULE, ONE clause per mutation; harness `C:/tmp-w167/mutate.mjs`, NOT in the tree, run in byte copies `C:/tmp-w167/p` (node) and `C:/tmp-w167/q` (deno); each anchor asserted to occur once and to change its file, every file restored from its first snapshot and digest-compared, node 24 asserted; graded on the run's own FAIL lines, each probe's declared W167 set matched EXACTLY) | **node and deno identical**: the no-edit CONTROL **CLEAN**; **24 of 24 KILLED** for the reason each names — p01 a named instance built without the language (1a, and t2's transform then fails: 3b, 3e); p02 the resolved languages' provenance (1b); p03 A not awaited (2); **p04b** check validating B against no languages, ADR 0096 reverted (3a-3f — `start` refuses from `check`, so the run's claims fall with it); p05 / p06 an `InvalidDefinition` / `LimitKeyMissing` refusal spending a run id (3b); p07 `readOnly` made to constrain at FD-R4 (3b-3f); p08 the envelope handing the worker the UNtransformed input (3d, 3e); p09 t2's expression alone (3e); p10 the driver ignoring a node's `pool` (3f); p11 / p12 the instance's options not merged / replacing the type's (3g); p13 start throwing only the first rule (4); p14 check and start AGREEING on one rule (4 — the hand-written set, not only the equality); p15 the resolver stripping `writeOnly` (5a); p16 `format` admitted (5b); p17 a given source `example` (6a); p18 `undefined` read as an input (6b); p19 the given input ignored (6a); p20 `workerGroups` not read for reach (7a, 7b, and 3b — D's start then mints r2); p21 the refusal a plain `RuntimeError` (7b); h01 the block's runs not counted (`DECLARED_RUNS`); h02 a claim deleted with both counts lowered (the subjects clause); and **pf**, a `flows` option handed to `createRuntime` — `typecheck:examples` TS2353 naming `flows` (clause (1)'s *no flow*, by the compiler). **The grader's controls**: g-crash (the runtime cannot be built) graded CRASH; g-wrong (p10's edit declared as 3g) graded WRONG. **(f)**: every flow is linear, so nothing is arranged; the OTHER pool modes (Intake threaded, Shape inline) **CLEAN**. **Two first-pass verdicts were the harness's, not the block's**: p04 — the same mutation unscoped — aborted the file at an EARLIER transforming row before the block ran (WRONG, a crash elsewhere), re-cut as p04b scoped to B; h02's declared failure line was misspelt in the harness (the clause that fired was the right one), corrected and re-run, both lanes. *(Stated after the adequacy reader: **p02, p03 and p09 mutate the BLOCK, not the library** — provenance probes of the harness's own readings, rule 8 (c) — and **h02 is three edits forming ONE clause**, a claim deleted with the two counts that would otherwise name it.)* |

## Found while building — reported to the maintainer, not acted on (outside `Owns`)

**F-1 — RAISED as [Q633](../questions/q633.md)** (DEFECT), by the maintainer's answer of 2026-10-16: *yes, raise it; do not
fix it in W167*; owner P37's join or retro to route. Q633 carries the conformity reader's sharper form — on the same
transforming entry, `tryTransform(…, { input })` and `start()` give OPPOSITE verdicts — and corrects this paragraph's
reading of the spec: **`FD-R4`'s row DOES decide which value is held** (*composed through the node's `needs` as `enter`
composes it*) and is SILENT on the transform — inconsistent by implication with the `transform` subsection, `FD-C5`,
`transform-passes` and the `given` row, which treat `inputSchema` as what the worker receives AFTER the transform. And the
design constraint: `start()` is synchronous and a transform's evaluation is not. *The paragraph below is as reported.*

**F-1 — `FD-R4` holds an ENTRY node's payload to its worker `inputSchema` BEFORE that node's `transform`.** Measured in the
byte copy (`C:/tmp-w167/fdr4-entry-transform.ts`, NOT in the tree; node 24.20.0): a worker whose `inputSchema` requires
`label`, an entry node of its type transforming `{ "label": word }`. The payload `{ word: "x" }` — which the transform
turns into exactly what the worker requires — is REFUSED at `start` (`BoundaryRefused`, *$.label required*); the payload
`{ label: "y" }` — which the transform turns into `{}` — is ADMITTED, the run completes, and the worker received `{}`,
which its own `inputSchema` refuses. The driver's boundary walk (`src/driver/driver.ts`, `boundaryTargets` then
`compose`) applies `needs` and never the transform; the spec's `FD-R4` row and its `transform` subsection say nothing
about a transform at the entry. **This block does not reach it** — B's entry `prep` declares no transform — so no exit
clause depends on it; but it is the road a flow published to a running runtime takes the moment its FIRST node transforms.
The fix is in `src/driver/**` and `spec/`, which no P37 item may edit (paragraph D) — **recommended: raise it as Q633**
for P37's retro to route, rather than widen this item.

## Verification

`npm run gate` (each rung's exit read on its own line), the author's rule-8 provocations in a byte copy; then the readers;
then `npm run gate:full` once. Routing coverage: a branch routed away from its join (Q4), `user_action` (Q17), no matching
decision edge (Q10), a nested fan-out (Q6) — not applicable, every flow is linear; a duplicate task id (Q13) — not
applicable, the runtime mints each run's id.

## The readers' items — directed by the coordinator 2026-10-16, recorded here before their edits

*Conformity: all seven exit clauses MET, findings F1-F4. Adequacy: 22 one-clause library mutations, 16 killed, 6
survivors, no exit clause broken; A1-A3 and four minor notes. Every edit below is in `examples/l6.ts`, `examples/README.md`
(the `X10` copies), this file, or the record step (`doc/questions/q633.md`). Nothing outside them was needed.*

| | finding | the edit |
|---|---|---|
| **R1** | C-F1: M2's *the three failures counted in* is wrong | M2 corrected: 2646 + 18 passing + ONE failure pushed before that check |
| **R2** | C-F2 (nit): the FD-R6 refusal asserted by class and `at` only; (c)'s answer also names the group, both roads and Q248 | claim (7b) widened: the message names `"api"`, `createTask`, `limitKey`, `keyFrom` and `Q248` — each a word of (c)'s answer. Provoked by **r4** (Q248 dropped from the detail) |
| **R3** | C-F3 (nit): (5b)'s substring was `schema.ts`'s wording, not the spec's | loosened to the keyword `"format"` and its path `$.properties.id`. **p16** re-run, still KILLED |
| **R4** | C-F4: F-1 understated `FD-R4` | F-1 prefaced, and [Q633](../questions/q633.md) written with the reader's form, the spec's actual reading, and the synchronous-`start` constraint |
| **R5** | A-A1 (the strongest): no claim held a pool's realm; building `shape-wide` (or every pool) inline survived | claim (3g) widened: each pool's `inline` off the scheduler's `WorkerManager` — Intake `true`, Shape and `shape-wide` `false`. Provoked by **r1** (the named instance built inline); the build's **f-modes** (modes swapped) is now red on (3g) ALONE, every other claim green — which is the (f) result restated |
| **R6** | A-A2: (5a) read `rt.resolved`; drivers and `tryTransform` read `rt.registry.workers` | claim (5a) widened to both. Provoked by **r2** (writeOnly stripped from the registry the drivers read, and only there) |
| **R7** | A-A3: (6) could not tell *held to the entry worker's inputSchema* from *held to nothing* | a NEW claim (6c): given `{}`, the transform makes `{}` by hand (both keys absent, dropped by JSONata), ONE verdict `transform-fails` naming `$.word required`. Provoked by **r3** (the given road held to an empty schema) |
| **R8** | A-minor: (4) compared findings in validator order; (1b) cannot differ on a constructing runtime; p02/p03/p09 mutate the block; h02 is three edits | (4) compared SORTED, the label says the spec states no order (p13, p14 re-run, KILLED); (1b) commented as the document's set read back; M5 states the other two |

## Record

**Gate — what ran.** Baseline `0a7aae3`; every number below is the final tree's. Node 24.20.0, deno 2.9.6.

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **RAN, pass** | `lint` 146 files, the five `typecheck` lanes |
| the checks | **RAN, pass** | the ladder's twelve; `check:spec` 7 documents / 75 examples / 135 rules (unmoved); `check:docs` `X10` compared both README copies against **2664 / 176** |
| L1-L5 | **RAN, pass** | **62 files / 1763 cases** in node, deno and chromium (parity) — UNMOVED; firefox and webkit NOT RUN |
| L6 node 24 | **RAN, pass** | **2664 assertions / 176 real runs**, 0 failed. Baseline 2646 / 174 |
| L6 deno | **RAN, pass** | **2664 / 176**, 0 failed |
| `npm run gate`, before the readers | **RAN, `GATE EXIT=0`** | on the real tree at 2663 / 176 |
| conformity reader | **RAN** | all seven exit clauses MET; F1-F4 (R1-R4) |
| adequacy reader | **RAN** | 22 one-clause library mutations, 16 killed, 6 survivors, no exit clause broken; A1-A3 and minors (R5-R8) |
| overlap | | **0 shared subjects**: the conformity reader's F1-F4 (a Record figure, the refusal's message, the subset's wording, F-1's reading of `FD-R4`) and the adequacy reader's A1-A3 and minors (a pool's realm, the registry drivers read, what the given result is held to, finding order) name no subject in common *(read from the findings as relayed by the coordinator)* |
| provocations after the readers | **RAN, both lanes** | in the byte copies synced from the final block (`diff -rq` clean): control CLEAN; **r1-r4, p13, p14, p16 and f-modes KILLED** for the reason each names, node and deno identical |
| **`gate:full`, the confirming run** | **RAN, `GATE:FULL EXIT=0`** | ONE command on the final tree, held still, after the readers' items (this Record written before it, but for this row and the Status line): the ladder — `lint` 146 files, `check:spec` 7 / 75 / 135 rules, `check:docs` `X10` 2 copies against 2664 / 176, L1-L5 **62 files / 1763 cases** in node, deno and chromium (parity 1763), L6 **2664 assertions / 176 runs**, 0 failed, in node and deno — then **11/11 self-test lanes ok** (`check:register:selftest` included), 1937.8 s self-test wall. No lane flaked; nothing was re-run. firefox and webkit NOT RUN |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the block | `examples/l6.ts`, one runtime, four flows, two runs, the `format` variant beside it | every probe in M5 and R1-R8; `DECLARED_RUNS` (h01) |
| (2) the claims | **18** cross-row assertions — 18 declared, one removed at the build as unable to fail (M3), one added by the readers (R7) | `CROSS_ROW_SUBJECTS` (h02); each claim's provocation |
| (3) the censuses | `CROSS_ROW` 313 -> 331, `DECLARED_TOTAL` 2646 -> 2664, `DECLARED_RUNS` 174 -> 176, subjects +18, `pairRunCount`, the header; `examples/README.md`'s two `X10` copies and the tally | the file's own count checks; `X10` |

**`git diff --name-only` against `Owns`**, on the final tree: `examples/l6.ts`, `examples/README.md` (Owns); new
`doc/questions/q633.md` (record step) and this file. Nothing is undeclared; no exception was taken.

**What broke.**

1. **A claim that could not fail was declared** — *start(C) handed the scheduler nothing* (M3): the driver validates the same
   definition again, so it was a placeholder; found at the build by asking which edit would turn it red.
2. **Three claims read one observer where the consumer reads another** (A1-A3): the pool's realm was asserted by a comment,
   the annotations by `rt.resolved` while drivers read `rt.registry`, and the given verdict by a result every schema passes.
3. **The harness, twice** (M5): an unscoped library mutation that crashed the file at an earlier row, and a misspelt expected
   line — both graded WRONG by the harness's own controls and re-cut, never counted as kills.
4. **A defect on the road this plan is about, outside every P37 item's `Owns`** — Q633.

**What this taught.** Nothing proposed here; the retro decides.

**Questions.** Raised: **[Q633](../questions/q633.md)** (DEFECT, owner P37's join or retro). Closed: none. **Q634 released
unused.** No ADR (**ADR 0100 unused**, as P37 expected). **W168 unused**, as P37 expected.
