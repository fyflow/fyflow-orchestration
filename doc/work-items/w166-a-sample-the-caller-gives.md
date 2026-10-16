# W166 — a sample the caller gives

**Status:** done 2026-10-16 — **`npm run gate:item` EXIT 0** on the final tree, one command; both reader passes RAN, no code defect against the spec, their items acted on (C-F1: `givenVerdict` stated as new public surface and given `tryTransform`'s contract); no exception; no question raised. Declared 2026-10-16 on `da08a1f`; declaration step RUN the same day in a byte copy (M1-M5 below)
**Plan:** [P37](../plans/p37-a-runtime-is-its-registry.md) — *what may a running runtime be asked to accept, when its
registry is fixed at `createRuntime`?* — its FIFTH item.

```
Spec:       spec/flow-definition.md v0.37 -> v0.38: section 3's "What the schemas buy an author" — a SAMPLE THE CALLER
            GIVES (P37 stop-and-ask (d)'s answer): `tryTransform(registry, flow, node, transform, { input })` evaluates
            the node's transform on what the node RECEIVES — `$`, the value given, no `needs` composed over it — ONCE,
            and returns ONE verdict whatever the node's arcs, the ENTRY node included: shape `given`, NO producer, no
            `through`, `sample.source: 'given'`, the result held to the consumer's `inputSchema` (`transform-passes` /
            `transform-fails` with the findings) and a compile or evaluation error `transform-fails` as today. The arc
            table gains a `given` row stating it is NOT an arc and `checkWiring` never produces it; the `unchecked` row
            gains the given input with no transform to run it through. A given value never reaches the two-valued
            aggregations of P37 fact 4 (`wiring.ts`'s record and `needs` sources) and is never reported `example` or
            `witness`. Without `input` (or with `input: undefined`) `tryTransform` is unchanged. No rule id moves and
            none is added — the FD-V count stays 42.
Owns:       from P37's W166 row: src/definition/witness.ts, src/definition/wiring.ts, src/definition/assist.ts,
            spec/flow-definition.md, spec/README.md, test/definition/assist.test.ts, test/definition/wiring.test.ts,
            test/definition/l4-corpus.test.ts, scripts/check-docs.mjs, AGENTS.md.
            scripts/check-docs.mjs: RUN_FLOOR 36 -> 37, because AGENTS.md section 15 gains a NEW `run` snippet under its
            own `###` heading (section 15's existing snippet is held byte-equal to README.md's by X8, and README.md is
            not in Owns — so the existing snippet is NOT edited).
            Exceptions: none declared.
            Record-step files (doc/workflow.md section 1 rule 5): doc/questions/** (Q630-Q632 if raised),
            doc/decisions/** (status/note lines only, if any), this file.
Inputs:     P37 stop-and-ask (d)'s answer, decision 10 (BREAKING stated where the surface changes), fact 4, prediction 6,
            sentences B' and C and paragraph D; fyflow-app request #7 as P37 states it; spec/flow-definition.md section 3's
            wiring subsection; ADR 0056 rule 3 and Q301 (a sample's source is named on its verdict).
Outputs:    (1) witness.ts: SampleSource = 'example' | 'witness' | 'given' (BREAKING: widened); sampleOf's return typed
                `Exclude<SampleSource, 'given'>` inline. (wiring.ts holds the PRIVATE alias ArcSampleSource — the two
                values an arc's sample can carry, over which the aggregations are typed, so a 'given' cannot reach them;
                this line said ArcSampleSource lived here until the conformity reader's F6.)
            (2) wiring.ts: WiringShape gains 'given' and WIRING_SHAPES with it (BREAKING); WiringVerdict.producer
                optional — absent on a `given` verdict and only there (BREAKING); the transformed-arc evaluation lifted
                into ONE private function both roads call; `givenVerdict(registry, flow, node, input, options)` — the
                given road, exported beside `checkWiring` as `boundaryTargets` is for the driver — and so a ROOT export,
                stated as new public surface after the conformity reader's F1, holding `undefined` to no input as
                tryTransform does; describeVerdict prints a `given` road and names the source `the given input`.
            (3) assist.ts: TryTransformOptions (WiringOptions plus `input`, new public surface); tryTransform calls
                givenVerdict on the SAME substituted copy of the flow — one road, one contract.
            (4) spec v0.38 (above) and spec/README.md's row.
            (5) AGENTS.md section 15: the assists table's tryTransform row, a new `###` subsection with an executed
                `run` snippet (the entry node and an inner node given an input; the value, the findings, a compile
                error), and the BREAKING sentence.
            (6) scripts/check-docs.mjs RUN_FLOOR 36 -> 37.
            (7) L1 tests (below) and their suite in l4-corpus's LATE_SUITES.
Depends on: W165 (done, da08a1f)
Blocks:     W167
Tests:      L1 test/definition/assist.test.ts — the W166 suite, on fact 4's flow shape (a two-task flow `a` -> `b`, one
            worker declaring both schemas and an output example): a given input on the ENTRY node `a` and on the inner
            node `b` — ONE verdict each, shape `given`, no producer, no through, source `given`, `sample.value` the value
            given and `sample.result` what the transform made of it; `transform-passes` where the result satisfies the
            inputSchema and `transform-fails` naming the finding where it does not; a compile error `transform-fails`
            naming the throw; never `example` or `witness` (and the same candidate WITHOUT `input` on `b` still says
            `example` — the control); the node's arcs ignored (a node with two inbound arcs returns ONE verdict); `needs`
            not composed over the given value; a language the registry lacks, a type with no worker, and no transform
            each `unchecked` with the given sample; `input: undefined` is not given; a node id naming no task `[]`.
            test/definition/wiring.test.ts — WIRING_SHAPES held to the arc table both ways (now six); checkWiring over the
            L6 corpus reaches every shape but `given`, and its seven transformed arcs each an `example` or `witness`
            source; `givenVerdict` among the root's exports. (describeVerdict on a `given` verdict, printing no
            `undefined`, is in the assist suite.)
            Expected values from P37 (d)'s answer, the spec's tables and the declared example/schemas — never from the
            implementation's output.
Gate:       `npm run gate` before the readers (P37 sentence C); then the conformity and adequacy readers, NOT run by this
            item's author; then `npm run gate:item` ONCE on the final tree. The row's clauses: L1 a given input on fact 4's
            entry node and on its inner node — the value, the findings against inputSchema, a compile error — and a given
            value never reported 'example' or 'witness'.
Reserves:   Q630-Q632 (P37's W166 row); no ADR (ADR 0100 stays expected unused)
```

*Reserves: `npm run state` on `da08a1f` reads the next free ids as **P38, W166, Q627, ADR 0100** from the tree, and W162, Q615,
ADR 0096 from the ledger (P33's Retro) — they DISAGREE because P37 was declared and W162-W165 spent ids since that sentence;
P37's own reservation governs. Its W166 row gives this item Q630-Q632.*

## Scope

**In** — Outputs (1)-(7).

**Out** — named rather than left implicit, with where it goes instead

- **The PRODUCER-side reading of a given value** (one verdict per arc, the given value replacing each arc's sample) — (d)'s
  rejected alternative.
- **`sampledOutput` on a given input** — not asked by (d); its options stay `WiringOptions`.
- **An L6 clause** — P37 exit clause (6), `tryTransform` given an input on B's entry node, is W167's.
- **An ADR** — none reserved; the change is (d)'s answer applied to an authoring reading that adds no rule.
- **Executing the `// …` output comments of a `run` snippet** (the adequacy reader's S1) — a repo-wide convention:
  `check:docs` runs the snippet and its `throw` lines, never compares a comment to what was printed. Not W166's;
  no question raised.
- **Keeping `givenVerdict` off the package root** — needs `index.ts`, outside `Owns`; stated as surface instead
  (Record, F1).

## What the declaration step measured before anything was edited

*P15 decision 5 and sentence B′: measured 2026-10-16 in a BYTE COPY of `da08a1f` (`git archive` into `C:/tmp-w166/m`,
`node_modules` copied, never linked), node 24.20.0 and deno 2.9.6.*

| # | fact | measured |
|---|---|---|
| M1 | the baseline, in the copy | `npm run gate` **EXIT 0**: `check:spec` 7 documents / 75 examples / 135 rules; `check:docs` 42 snippets (36 run, 6 check); L1-L5 **62 files / 1747 cases** in node, deno and chromium; L6 **2646 assertions** in node and deno |
| M2 | **P37 prediction 6, measured** — the CODE changed alone (`witness.ts`, `wiring.ts`, `assist.ts`), every test, spec and doc as shipped | `lint`, `typecheck` **EXIT 0** — widening `SampleSource` is loud NOWHERE in `src/`, `examples/` or `test/`, and `producer` made optional breaks no compile (every reader of it is a template literal or an equality); `npm test` **EXIT 1 with exactly TWO failures**, both `WIRING_SHAPES`' bindings in `test/definition/wiring.test.ts` (*exactly the arc table*, and *every arc shape occurs in the census*) — the enumeration widened, nothing about the source. **The two aggregations of fact 4 are not reached**: `givenVerdict` reads no arrival, and they are now TYPED over the two sources a schema supplies (K20, K21 below are killed by `typecheck`) |
| M3 | the change whole, in the copy | `npm run gate` **EXIT 0**: `check:spec` 7 / 75 / **135 rules** (unmoved); `check:docs` **43 snippets, 37 run**, 6 check; L1-L5 **62 files / 1757 cases** in node, deno and chromium (+10: the W166 suite); L6 **2646** in node and deno, unmoved. B′'s floor clause: a `run` snippet was added, so **`npm run check:docs:selftest` EXIT 0** — 47/47 probes caught, 24/24 noticed. No always-read document moves, so `check:budget:selftest` is not bound. Copy scanned: zero links |
| M4 | the author's provocations (rule 8, written to the RULE — P37 (d)'s clauses, ONE clause per mutation; harness `C:/tmp-w166/mutate.mjs`, NOT in the tree; each edit asserted to match once and to change its file, each restore digest-checked; the runner UNFILTERED) | the no-edit CONTROL **EXIT 0**; **28 of 28 KILLED**, 1 declared EQUIVALENT — K1 the input ignored, K2 `undefined` read as an input, K3 `null` read as none, K4 shape `edge`, K5 a producer on the given verdict, K6 source `example`, K7 source `witness`, K8 an array given evaluated per element, K9 `needs` composed over the value, K10 the result not held to `inputSchema`, K11 the reason not naming the given input, K12-K14 the no-transform road returning `[]` / passing / dropping its sample, K15 a non-task node given a verdict, K16 the original flow read instead of the substituted copy, K17-K18 `describeVerdict`'s road and source word, K19 `WIRING_SHAPES` without `given`, K20 an ARC's sample made `given` (`typecheck`), K21 `sampleOf` widened (`typecheck`), K22 the value not handed to the transform, K23 the value copied, K24 `checkWiring`'s arcs losing their producer; T1 the spec's `given` row gone; D1-D3 the `AGENTS.md` snippet (X4) — its own input removed, and the code's K1 and K6. **K25 — `checkWiring` handed `input` too — SURVIVED, declared EQUIVALENT**: `checkWiring` reads no `input`, so the strip in `tryTransform` is hygiene, not behaviour |
| M5 | the census sites the row names | `spec/README.md`'s row: moved. `l4-corpus.test.ts`: one suite in `LATE_SUITES`. `scripts/check-docs.mjs` `RUN_FLOOR` 36 -> 37 (the new `run` snippet). README.md not touched: section 15's existing snippet is unedited, so `X8`'s pair is byte-equal as shipped |

**One reading taken under (d), named so a reader can dispute it**: (d) says what a given verdict is when there is a
transform to run. With NO transform (a `null` candidate) there is nothing to evaluate; this item returns the ONE
verdict `unchecked`, naming that there is no transform, with the given sample and no result — rather than holding
the raw value to the `inputSchema` and calling it `fits`/`no` (which are statements about two DECLARATIONS, and
`transform-passes` would claim a transform ran). Holding one value to a schema is `findings`, already exported.

**And one stale figure found and corrected in a file this item owns**: the spec's wiring subsection closed with *the L6
corpus's census as an EQUALITY (73 fit, … 8 unchecked …)* — W73's declaration figures — while
`test/definition/wiring.test.ts` holds 76 and 14. The sentence was being edited for *every arc shape reached*; the
figures were replaced by a pointer to the suite (a count a check derives is not written down, P27 decision 4).

## Verification

`npm run gate` (each rung's exit read on its own line), then the readers, then `npm run gate:item` once. Routing coverage:
none of a branch routed away from its join (Q4), `user_action` (Q17), no matching decision edge (Q10), a duplicate task id
(Q13) or a nested fan-out (Q6) is this item's — it routes nothing; a given verdict reads no arc.

## Record

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate`, before the readers | **RAN, `GATE EXIT=0`** | on the real tree after the port, 2026-10-16, node 24.20.0: `check:spec` 7 / 75 / 135 rules; `check:docs` 43 snippets, 37 run, 6 check; L1-L5 **62 files / 1757 cases** in node, deno 2.9.6 and chromium; L6 **2646 assertions**, 0 failed, in node and deno. firefox and webkit NOT RUN |
| conformity reader | **RAN** | F1-F7; no code defect against the spec — F1 a root export with no decision behind it and a contract differing from `tryTransform`'s on `undefined`; the rest docs and nits; acted on below |
| adequacy reader | **RAN** | 26 one-clause mutations of its own: 20 killed by node or `check:docs`, A4 only by chromium, A19 only by `typecheck`, **5 survivors** (A5, A9, A13, A24, S1); and it found three of the author's set COMPOUND (K8, K9, K10); acted on below |
| overlap | | **1 shared subject**: the given verdict's reason where the consumer side is missing — conformity F2 (the no-transform reason claims a worker and never names a missing type) and the adequacy reader's A24 (the *worker the registry lacks* reason never asserted) |
| **`gate:item`, the confirming run** | **RAN, `GATE:ITEM EXIT=0`** | ONE command on the final tree, held still, after the readers' items (this Record written before it, but for this row and the Status line): the ladder — `check:spec` 7 / 75 / 135 rules, `check:docs` 43 snippets (37 run, 6 check), L1-L5 **62 files / 1763 cases** in node 24.20.0, deno 2.9.6 and chromium (+6 since the first gate: the readers' six cases), L6 **2646 assertions**, 0 failed, in node and deno — then the self-tests less `check:register:selftest`: **10/10 completed, 10 ok**, 986.5 s self-test wall. firefox and webkit NOT RUN; `gate:full` NOT RUN and not owed (W167 is P37's last item) |

**What was done for each finding.** Every expected value is from P37 (d)'s answer, the spec's tables or the fixture's
declarations, never from the code's output.

| | finding | done |
|---|---|---|
| C-F1 | `givenVerdict` is a root export (`index.ts` re-exports `wiring.ts` whole) with no decision behind it, and `givenVerdict(…, undefined)` returned an `unchecked` verdict where the spec says `undefined` is no input | **the reader's acceptable alternative, taken**: keeping it off the root needs `index.ts`, outside `Owns` — a stop-and-ask for a name whose only cost is being public. So it is STATED as new public surface (spec v0.38's paragraph and its subsection, `spec/README.md`'s row, `AGENTS.md` section 15, its own doc comment), with `TryTransformOptions` beside it; and **one contract**: `givenVerdict` answers `undefined` with the node's ARCS (`checkWiring`'s verdicts on it, `[]` on the entry), and `tryTransform` is now ONE call to it on the substituted copy. A case pins `givenVerdict(…, undefined)` equal to `checkWiring`'s verdicts on the node and `null` as an input |
| C-F2 | the no-transform reason said *its worker receives the value unchanged* — false for a `Transform` node — and never named a type the registry lacks | **fixed**: the reason claims nothing about a worker, and appends the consumer side's own reason where it is missing (`; and type "Nope" of "x" is not in the registry`); a case on `Transform` and on a missing type (R5, R6) |
| C-F3 | `assist.ts` still said *pass `null`, which is where an author starts*; `AGENTS.md`'s row read as if `null` on a node that DECLARES a transform differed | **fixed**: the doc comment says that with an input and `null` the one verdict is `unchecked` and points to `findings(schema, value)`; the row says a `null` candidate takes away any declared transform too. The spec's row says the same |
| C-F4 | the spec wrote *76 and 14* back in while removing *73 and 8* | **fixed**: no count; the sentence points to the suite (P27 decision 4) |
| C-F5 | the `arc` table's `given` row negates its own header | **fixed by a note, header kept** (`tableIds` reads `\| arc \|`): the sentence introducing the table says it is five arc shapes and a sixth row for the one shape that is not an arc, so the table is every `WiringShape` |
| C-F6 | Outputs (1) put `ArcSampleSource` in `witness.ts` | **fixed** in this file: it is `wiring.ts`'s private alias; `witness.ts` types `sampleOf` with an inline `Exclude` |
| C-F7 | `AGENTS.md`'s BREAKING paragraph ran into `---`, a setext heading | **fixed**: a blank line. The base's own instance was the same line — section 15's last paragraph before `---` — so there is one site and it is fixed |
| A-A1 (A5) | `$settings` on the given road untested — losing the TYPE survived | **case added**: a type's `settings` default reaches `$settings.k`, and a node's setting overrides it. R2 KILLED |
| A-A2 (A9) | an arity-1 item arc's result shape unpinned — every map fixture had arity 2 | **case added**: a one-element example; `arity` 1 and the result `[r]`. R3 (`results.length > 1` for `perItem`) KILLED |
| A-A3 (A13) | widening `ArcSampleSource` was held only by the author's out-of-tree harness | **in-tree**: a `// @ts-expect-error` const in `wiring.ts` (`'given'` is not an `ArcSampleSource`) and one in the W166 suite (`'given'` is not `sampleOf`'s source). R1 KILLED by `typecheck` (TS2578, the unused directive) |
| A-A4 (A24) | the *worker the registry lacks* reason never asserted | **case added**: a type naming a missing worker, and a worker with no `inputSchema` — each `unchecked`, its reason's prefix, the result present. R4 KILLED |
| A-A19 | a map, join or `end` node given a verdict was caught only by `typecheck` | **case added**: `givenVerdict` and `tryTransform` on `each`, `j` and `done` return `[]`, the map's branch task one verdict (the control). K15 KILLED by node |
| A-A4 (workerHalf) | dropping `workerHalf` on the given road is caught only by chromium | **noted, not changed**: the browser lane is in `gate` and is that clause's observer, as it is for the W74 suite |
| A-S1 | a `run` snippet's `// …` output comments are not executed | **Out** (Scope): a repo-wide convention, not W166's; no question raised |
| compound | **K8, K9 and K10 of the build's set were COMPOUND** — K8 changed the inputs AND the `perItem` flag, K9 composed `needs` into the sample's value AND what the transform was handed, K10 withheld the consumer schema AND changed its reason — so the build's *28 of 28* counted three kills that were each two clauses | **re-cut one clause each** as K8b, K9b, K10b in the re-run below, each KILLED |

**The provocations, re-run after the readers' items** (workflow section 5 rule 8; in the byte copy synced from the real
tree and compared clean by `diff -rq`; harness `C:/tmp-w166/mutate2.mjs`, NOT in the tree, every anchor re-taken against
the current text; ONE clause per mutation): the no-edit CONTROL **EXIT 0**; **34 of 34 KILLED** — the build's K1-K7 and
K11-K24 re-anchored (K2 and K16 now on the one road; K25, the build's declared equivalent, no longer exists: `tryTransform`
calls `checkWiring` nowhere), K8b, K9b and K10b, R1-R6 from the readers' items, T1, D1-D3.

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `witness.ts`: `SampleSource` widened, `sampleOf` narrowed | `src/definition/witness.ts` | `typecheck` (K21, and the suite's directive) |
| (2) `wiring.ts`: `WiringShape`/`WIRING_SHAPES` `given`, `producer` optional, `judgeTransform`, `givenVerdict`, `describeVerdict` | `src/definition/wiring.ts` | the W166 suite (K2-K18, K22-K23, R2-R6), `wiring.test.ts`'s bindings (K19, T1, K24), `typecheck` (K20, R1) |
| (3) `assist.ts`: `TryTransformOptions`, one road | `src/definition/assist.ts` | the W166 suite (K1, K16) |
| (4) spec v0.38 and its README row | | the arc table both ways (T1); `check:spec` `C8`; the prose — the readers |
| (5) `AGENTS.md` section 15 | | `check:docs` `X3`/`X4` (D1-D3); the prose — the readers |
| (6) `RUN_FLOOR` 37 | `scripts/check-docs.mjs` | `check:docs` `X4`'s floor, and `check:docs:selftest`'s deleted-snippet probe |
| (7) L1 tests and the census | | `l4-corpus`'s suite census |

**`git diff --name-only` against `Owns`**, on the final tree: 10 modified files and 1 new — `src/definition/witness.ts`,
`src/definition/wiring.ts`, `src/definition/assist.ts`, `spec/flow-definition.md`, `spec/README.md`,
`test/definition/assist.test.ts`, `test/definition/wiring.test.ts`, `test/definition/l4-corpus.test.ts`,
`scripts/check-docs.mjs`, `AGENTS.md` (Owns); new: this file. No record-step file was needed (no question, no ADR).
Nothing is undeclared, and no exception was taken.

**Predictions, as measured.** P37 prediction 6 **TRUE** (M2): widening `SampleSource` is loud nowhere in `src/`, and a
given value never reaches fact 4's two aggregations — now held by `typecheck` in the tree (R1), not only by the absence
of a road.

**What broke.**

1. **A helper exported for one caller is a public name** (C-F1): `export *` in `index.ts` publishes every name of
   `wiring.ts`, so `boundaryTargets`' precedent carried a public surface nobody decided — and its contract had drifted
   from the function it served on the one value the spec defines (`undefined`). Stated, and the two made one road.
2. **Compound provocations again** (the adequacy reader): three of 28 — the W165 Record's *one claim per mutation* was
   in this item's brief and was still not followed for edits that change a call's arguments, where two arguments moved
   in one replacement.
3. **A reason that described a worker on a road that may have none** (C-F2), and a reason no case asserted (A24) — the
   one subject both readers raised.

**What this taught.** Nothing proposed here; the retro decides.

**Questions.** Raised: none. Closed: none. **Q630-Q632 released unused.** No ADR (ADR 0100 stays unused as P37
expected). **Exceptions**: none.
