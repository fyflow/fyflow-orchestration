# W62 — The JSONata adapter

**Status:** done — 2026-09-13
**Plan:** [P17](../plans/p17-what-a-node-may-do-to-its-input-before-its-worker-sees-it.md)

```
Spec:       spec/runtime-targets.md section 4 — what the published source may depend
            on, and by which specifier (RT-R11's shape for a SECOND dependency
            reached from ONE sub-path); spec/flow-definition.md's transform
            subsection for the adapter's obligations (W61's, cited not edited)
Owns:       src/jsonata/** (new), package.json, deno.json, test/jsonata/** (new),
            spec/runtime-targets.md section 4, AGENTS.md one new section,
            doc/decisions/0052-*.md
Inputs:     P17 decisions 2, 3, 6, 7 and 10, read from the PLAN's own file; facts
            2, 3, 4, 5, 6 and 9 re-run from dev-dist/p17/facts.mjs with
            JSONATA_URL set; W61's LanguageAdapter interface and its conformance
            suite; ADR 0048 and RT-R11 for how the first dependency is declared;
            W57's adequacy finding that fields ADJACENT to the one a check reads
            (`peerDependenciesMeta`) are where a hole lives; Q252 — a green
            `deno publish --dry-run` was the wrong answer once.
Outputs:    (1) ADR 0052 — how a second bare dependency is declared when only one
                sub-path reaches it, with `dependencies`, an optional peer and
                `optionalDependencies` each priced on a scratch copy by
                `npm pack` and `deno publish --dry-run`, and the maintainer's
                choice; OR the clause folded into ADR 0051 and 0052 skipped,
                the plan saying which
            (2) `fyflow-orchestration/jsonata` in both manifests' export maps and
                deno.json's publish allowlist (S6), exporting `jsonata:
                LanguageAdapter` whose `worker` is its own import.meta.url
            (3) the adapter: compile synchronous and throwing with jsonata's
                own code, position and message; `$now`, `$millis` and `$random`
                shadowed on EVERY compile with a thrower naming the function;
                `$` bound to the input and `$settings` to the settings; `check`
                absent (P18's hook, declared optional)
            (4) the conformance suite passed by the JSONata adapter, and the
                probe for prediction 4: every built-in in the language's function
                table evaluated twice on one input, none but the three differing
            (5) the cost of fact 6 RE-TAKEN inside the wrapper, inline and
                THREADED, quoted as shape and ratio against the envelope's own
                clone (W54's rule)
            (6) the browser bundle carrying jsonata (fact 9: 242 190 bytes), the
                adapter suite green in chromium, firefox and webkit
            (7) spec/runtime-targets.md: the rule for a second specifier — which
                files may import it, which may not, and what S7/S8 or a new
                clause refuse
            (8) AGENTS.md: a new section — the adapter, a `run` snippet
                validating a transformed flow, a `check` snippet wiring the
                sub-path, and the three unbound names with the reason
Depends on: W61
Blocks:     W63
Tests:      expected values from spec/ and from jsonata's documented semantics,
            never from output. Negative controls: remove one shadow and the
            conformance suite's by-name assertion for it fails while the
            two-evaluation comparison MAY still pass (fact 3's flaky $millis —
            asserted as a pair, so the suite says which check caught it); make
            compile swallow the syntax error and FD-V36's fixture stops firing;
            point `worker` at a different module and Q264's assertion fails.
Gate:       L0 under all five typechecks with jsonata.d.ts in; L1-L5 in five
            runtimes; check:source (S6, and whatever refuses a second bare
            specifier after output 7); check:scheduler (D8 unmoved — the pin is
            the scheduler's); check:docs on the new section; then
            spec-conformity pass (two readers), rule 8 re-run with their edits
Reserves:   Q270-Q273, ADR 0052
```

## Scope

**In**

1. **The dependency decision**, priced before the maintainer chooses — never installed into this
   repository until it is chosen. The three shapes and what each costs a consumer who imports only
   the root, only the scheduler sub-path, or the jsonata sub-path.
2. **The adapter**, the three shadows, the bindings, and the conformance suite W61 wrote passing on
   it unchanged — if the suite has to change for JSONata, the interface was wrong and W61's Record
   is corrected under section 6 pass 3 rule 6.
3. **The reach prediction's probe**: the function table walked, not the documentation read.
4. **The cost across the thread.** Fact 6 was one process and no thread; a threaded pool clones the
   envelope in and the result out, and the number an author is quoted must include that.

**Out** — named rather than left implicit, with where each goes instead

- **A second language** — the interface's, not this item's; CEL refused by the maintainer.
- **Unbinding `$eval`** — decided here at the stop-and-ask ([Q265](../questions/q265.md)), and if
  refused, recorded with what a consumer would have lost.
- **The exit artifact** — W63's.
- **P18's `check` hook** — declared optional, absent here.

## Exceptions

| path | why |
|---|---|
| `scripts/check-source.mjs`, `scripts/check-source-selftest.mjs` | predicted: output 7 needs a clause — `S7` refuses only the scheduler's names, so a `jsonata` import from `src/definition/**` would pass today; whichever clause refuses it outside `src/jsonata/**` gets a probe and a `META` entry |
| `scripts/check-docs.mjs`, `scripts/check-docs-selftest.mjs` | predicted from W59's table: the extractor rewrites the root and the scheduler specifiers; the jsonata sub-path needs a third rewrite, with a probe; `RUN_FLOOR` rises for the section's `run` snippet |
| `scripts/build-browser-tests.mjs` | only if the bundle needs a resolve hint for a CJS module — fact 9 says it does not |
| `scripts/check-markdown.mjs` | predicted NOT to fire; checked |
| `test/definition/l4-corpus.test.ts` | **declared at the start, from W61's `d7` probe**: the L4 suite census names every suite that runs, both ways, so the item's new suites (`test/jsonata/**`) must be added to it in the same commit or the census refuses the run |
| `test/scheduler/adapter-conformance.ts` | **LATE, from the maintainer's answer to this item's third stop-and-ask (the suite was declared UNCHANGED)**: inside a browser bundle `import.meta.url` is the bundle's own URL (Q261), so the suite's `import(adapter.worker)` yielded no default export for any adapter that imports an engine — six clauses red in all three browsers, measured — and the suite gains an optional `workerHalf` handle in its probes for a runtime that cannot import the URL, with Node and Deno asserting the URL's default export IS that function. W61's Record is corrected under section 6 pass 3 rule 6 |
| `package-lock.json` | **LATE, the conformity reader's finding 3**: `npm install` of the chosen dependency regenerated the npm lock (12 lines) exactly as `deno.lock` was declared for, and the table declared one lock and not the other — ADR 0052 consequence 3 names both |
| `AGENTS.md` section 13 | **LATE, the conformity reader's finding 1**: section 13's paragraph said the sub-path was *W62's, not yet on this tree*, a claim with an expiry date this item is the one to un-write (section 1 rule 5's third direction), and the `Owns` line names *one new section* |
| `scripts/check-scheduler-selftest.mjs` | **LATE, found by the FIRST gate over the final tree — `GATE EXIT=1` on one line, `D8 deno.json maps no fyflow-scheduler import — the mutation matched nothing`**: that probe deletes `deno.json`'s `imports` block by its literal two-line text, and this item's `jsonata` mapping made the block three lines. Rule 7 (b) firing correctly on a file no item's `Owns` names (W57's `D8` was written when the block had one entry); re-anchored agnostically on the scheduler's own line so the next mapping does not reproduce it |
| `spec/README.md` | the `Owns` consequence section 1 rule 5's note names: `C8` makes its version row a consequence of any `spec/**` bump, and this item bumps `spec/runtime-targets.md` to v0.11 for `RT-R12` |
| `deno.lock` | **declared before the repository's lock is touched, from W36's and W37's precedent and from a measurement**: `deno.json`'s new `npm:jsonata@2.2.2` mapping makes `deno check` regenerate the lock with the npm entry — measured in the isolated copy, where the typecheck rung rewrote it mid-run and moved the held-still digest. Regenerated once, by the same rung, on the tree the item ships |

## Verification

| clause | command |
|---|---|
| L0 | `npm run lint`, `npm run typecheck` — all five configurations, read by `$?`; `jsonata.d.ts` under `deno check` is the one fact 9 did not measure |
| L1-L5 | `npm test`, `npm run test:deno`, `npm run test:browser:all`, redirected, read by exit code; baseline W61's shipped numbers, re-taken |
| checks | `npm run check:source`, `npm run check:scheduler`, `npm run check:docs` |
| cost | the wrapper harness, inline and threaded, medians over N runs with the method stated |
| readers | conformity: spec first — `spec/runtime-targets.md`'s new rule and the transform subsection's adapter obligations re-derived; adequacy: isolated copy, the shadows and the bindings mutated |

## Record

**Gate — what ran.** Every rung RUN and redirected to `dev-dist/w62/*.log`, verdict read from `$?`
(`doc/workflow.md` section 4, v0.16); rule 8's harness (`dev-dist/w62/rule8.mjs`, W61's with a
FUNCTION replacement and per-chunk runs) carries a control, asserts every restore byte for byte,
checks each edit's anchor against the CURRENT text, undoes what an aborting probe applied, RUNS every
declared ceiling against the rung its reason names, and holds the tree still by a content digest.
**The item's code was written in the repository and RUN in an isolated copy of the tree with
`jsonata` installed there alone until the maintainer chose how the dependency is declared** — nothing
was installed into the repository before that answer, and every number below was re-taken in the
repository afterwards.

| Clause | Verdict | Notes |
|---|---|---|
| declaration | measured | Started on `15584e2` (W61 committed by this session; the digest at commit was `f95d8e0788a71eb1` over 290 files against W61's gate digest `b28afc80c26516cc` — the ONE file newer than the gate was W61's own Record, whose gate row says it was written after the digest). Facts 2, 3, 4, 5, 6 and 9 re-run under Node 24.20.0 and Deno 2.9.6 against a `jsonata` 2.2.2 install OUTSIDE the repository: all reproduce (fact 9's bundle 242 198 bytes against 242 190; fact 0 vacuous as [Q253](../questions/q253.md) records). Baseline RE-TAKEN: **36 / 958 in five runtimes, L6 1281 / 46 in both, spec 7 / 55 / 103 with 35 refusals, check-spec self-test 29 / 28, docs 26 / 21, markdown 115 / 5029 / 253, census 209 / 156 / 2 / 51**, digest `f95d8e0788a71eb1` before and after. `M4`'s two-directory fixture **3694 against 3960** on a scratch copy before any document — W61's number exactly — and `M3`'s one-directory fixture **88 against 90**, two files of headroom, spent by nothing here (the one new document is an ADR, which that probe cuts). **Three facts of this item's own before a line of the adapter**: jsonata throws PLAIN OBJECTS, not `Error`s (both `jsonata(expr)` and `evaluate()`); no JSR package carries it and `npm:jsonata@2.2.2` loads under Deno; and a `deno publish --dry-run` REFUSES every manifest shape without `node_modules` and PASSES with it and the `deno.json` entry deleted ([Q252](../questions/q252.md)'s shape, extended) |
| stop-and-ask | answered | **Three, put to the maintainer together with the three manifest shapes priced on scratch copies (ADR 0052's table), and all three recommendations taken on 2026-09-13**: `dependencies` at exactly `2.2.2` (not the optional peer, whose consumer installs NOTHING; not `optionalDependencies`, absent under `--omit=optional`); `$eval` UNBOUND ([Q265](../questions/q265.md), priced: bound it was the engine's `D3120` at evaluation, a task failure `FD-V36` never saw; `$lookup` covers the computed-key case); and the conformance suite gaining an optional `workerHalf` handle for a runtime that cannot import the adapter's URL — because in the browser bundle `import.meta.url` is the bundle itself ([Q261](../questions/q261.md)) and six conformance clauses were red in chromium, firefox and webkit, measured, with parity intact |
| L0 | GREEN | `lint` 0; `typecheck` 0 across all five sub-typechecks with `jsonata.d.ts` in — under `moduleResolution: bundler` the default import of a CJS engine needs no flag |
| L1-L5 | GREEN | **38 files / 979 cases in node 24.20.0, deno 2.9.6, chromium, firefox and webkit** — from 36 / 958. `test/jsonata/jsonata.test.ts`: the conformance suite over the real adapter with probes from JSONata's documented semantics and P17 facts 4 and 5 (the three arities, `$settings`, `S0203` at 12, `T0412`); the item's own claims — one module (the URL's default export IS the worker half, asserted in Node and Deno; the bundle's URL stated in the browser), five names unbound BY NAME each separately with the loop counted, the by-name/by-twice PAIR reported, the shadow reaching `$eval` and `$eval` itself unbound, the engine's plain objects re-thrown as `Error`s carrying all four fields, plain values at every depth against the RAW engine's markers (a discriminating pair, array-element depth included), and the wrapper on real inline AND threaded pools where the inner worker reports the realm it ran in and the own keys of the array it received. `test/jsonata/function-table.test.ts`: **P17 prediction 4's probe** — the engine's 63 built-ins from its own `staticFrame.bind` list (held to the source both ways in Node and Deno; the browser walks the literal and checks each name is bound), each evaluated twice over 27 argument shapes with a 3 ms gap: exactly `now`, `millis`, `random` and **`shuffle`** differ, 61 of 63 observed with a defined value, `$assert` and `$error` the two unobservable, `$eval` the one declared deterministic exception. The four suite names are in the L4 census |
| L4 | GREEN | `check:spec` — **7 documents, 55 examples, 104 rules** (`RT-R12`), 35 refusals unmoved; the self-test 29 / 28 unmoved; `C8` saw `spec/README.md`'s row move to v0.11 |
| L6 | GREEN | **1281 assertions over 46 real runs in node AND deno, UNMOVED** — the declared result; reverting this item's behaviour at L6 (the shadows off, the markers kept) costs **0** (`rev62`), the number W63 has to move from. **L6's manifest clause (2c) reads the scheduler sub-path by literal**, so removing the `./jsonata` export from either manifest cost 0 there (measured, `b3`) and `S15` is that export's observer |
| checks | GREEN | `check:source` 0 with **`S14`** (the engine reached from `src/jsonata/**` alone, by the bare specifier alone: the root and the scheduler sub-path re-exporting the adapter refused, `npm:`, a path and a package sub-path refused) and **`S15`** (one declaration in `dependencies` at `JSONATA_PIN`, none in five adjacent fields including the two array-valued ones, `deno.json`'s mapping at `npm:jsonata@<pin>` in `imports` and no `scopes`, `./jsonata` exported by both manifests); its self-test **60 probes / 40 gradings / 10 SELF** from 46 / 31 (a probe and a grading per clause, the `S8` dependencies probe re-anchored because the manifest now HAS the block it used to insert); `check:docs` 0 — **28 snippets, 22 run**, section 14's `run` snippet validating a transformed flow through the REAL adapter and driving the envelope worker by the adapter's own URL, `RUN_FLOOR` 21 → 22 (declared), the third sub-path rewrite with its probe, the self-test 20 / 10 from 19 / 10; `check:markdown` (**116 documents, 5059 relative links, 254 anchored**), `check:policies`, `check:wiring`, `check:scheduler` 0 |
| cost | measured | **Fact 6 re-taken INSIDE the wrapper on real pools**, `dev-dist/w62/cost.mjs`, both runtimes: one scheduler per cell, `maxThreads` 1 so one worker is set up once and every task is serial on it, 3 warm-ups discarded, the MEDIAN wall time of 21 tasks from `addTask()` to `task.completed`; ratio against the same envelope with NO transform on the same backend. **Inline there is no clone, so the transform is the whole cost**: a thousand-branch reduction is 18-19x a near-zero baseline. **Threaded, the same reduction adds a third to a half of the thread's own clone of the record; a filter-and-reshape over the thousand adds two to three clones.** The second observer — the adapter's `evaluate()` timed directly, fact 6's own method — agrees with the inline differences at every N, and the identity costs nothing after the input shortcut (before it, the marker scan over a thousand branches was a fifth of a clone: measured and removed). Quoted as shape and ratio, never the millisecond |
| rule 8, author pass | **79 probes in the COPY: 1 control green, 62 caught, 15 declared ceilings each RUN against its rung, 2 measured, 0 undeclared, 0 crashes, 0 aborts on its final pass** | The first pass read **1 UNDECLARED SURVIVOR, 1 CRASH and, on the re-run, 1 ABORT**: `d8` — the by-name loop sliced to one name passed, W61's m50 one suite over — closed by an `asked` count and then aborted on the anchor its own fix moved (rule 7 (b)); `b6` — the default export removed CRASHED the test rung, Node's ESM loader refusing a suite's import before any test ran, exit 1 with zero FAIL lines ([Q272](../questions/q272.md)), graded on the typecheck rung that names it. **Then in the REPOSITORY, after the maintainer's answers, the same set plus `$eval` and `S15` probes: 3 aborts on anchors this item's own edits had moved (c2, d6, d7), 1 ceiling CAUGHT against declaration (p4 — the by-name/by-twice pair, a ceiling on the copy's tree and a catch the moment `eval` joined the list: v0.17's dated-ceiling clause firing INSIDE the item), and the tree MOVED once with no probe reporting it** — `deno.lock`, rewritten by a probe's `deno check` for a mutated `deno.json` and outside that probe's restore set; captured by a no-op edit on the lock now. `rev62` = 0 at L6; `c4` measured 1: without the 3 ms gap the clock does NOT differ on this machine, fact 3's flakiness reproduced |
| readers | **13 / 3 blocking and 21 mutations (19 graded, 2 measurements) / 17 survivors / 7 blocking, OVERLAP 1** | The **thirty-sixth** measurement, inside the 0-4 band, neither primed; the one shared subject reached from both ends — the pin literal in `AGENTS.md` section 14, which the ADR and the spec said was written nowhere in prose. **Conformity, blocking 3**: section 13 still said the sub-path was *W62's, not yet on this tree* (a claim with an expiry date, in the consumer reference, this item's to un-write); the pin literal; and `package-lock.json` modified undeclared where `deno.lock` had been declared for the same reason. Non-blocking, taken: the suite header's *UNCHANGED*; *nothing else differs* stated wider than measured; *fifteen* browser cases with no derivation (the six clauses that reach the worker half); KB against KiB; the `Owns` line naming a SECTION while the document's header moved (W46's shape, second occurrence); an item correcting a prior item's Record (W35's, second occurrence — for the retro). **Adequacy, blocking 7, every one a direction the author's 79 never took**: (m01) **two of the four error fields ADR 0052 rule 6 names had no observer** — `token` and `value` dropped for 0; (m02) **the marker stripping at ARRAY-ELEMENT depth had none** — `$map([1,2], function($x){ $$.*.score })` marks the outer sequence and each element, measured on the raw engine; (m09b) `S14`'s form clause weakened to a PREFIX passed its self-test, the two form probes being non-prefixes; (m13b) two of `S15`'s four enumerated fields had no probe of their own; (m11) **`bundledDependencies: ["jsonata"]` shipped the engine's eight files in the tarball with every check green** — an array's keys are its indices, W57's adjacent field one field over; (m16) the pin literal; (m21) **the threaded half of *inline and threaded* was bound by the one `inline: backend === 'inline'` expression** — (c)'s LIMIT verbatim, closed by the inner worker reporting whether it shares the test's realm and the own keys of the array it received across the thread. Real non-blocking, taken: `plain()`'s identity return had no observer (m03); the walk suite's browser flag guarded the source equality alone (m07); *62 of 63 observed* counted two names seen only as `undefined` (m08 — 61 now, `$assert` joins `$error`); a `jsonata/` prefix key in `imports`, an `overrides` entry and a lock out of step each pass every check, stated in `RT-R12` as its limits (m14, m10, m15). The reader also found the isolated copy's git baseline had failed silently in `make-copy.sh` (`core.longpaths`), so its own runner built one |
| re-run, tree held still | **97 probes: 1 control green, 71 caught, 23 declared ceilings each RUN against its rung, 2 measured, 0 undeclared survivors, 0 crashes, 0 against declaration on the final pass** | the author's 79 plus the conformity reader's two revertible edits (`r1`, `r2`, both declared — prose no check compares) and the adequacy reader's sixteen (`r3`-`r18`); every blocking edit CAUGHT by the test or clause it forced. **The re-run's first pass read 2 aborts and 1 against declaration, all three the instrument**: `d6` on the self-test floor this item's own probe additions moved twice, `r10` on a grading anchor first aimed at `S15` where the form clause's is `S14`'s, and `r18` — the reader's *vacuous* — a CATCH on the tree that ships, because m08's fix made "observed" require a defined value and the timestamp member became load-bearing (p4's shape a second time). Digest identical before and after every chunk |
| `npm run gate` | **GATE EXIT=0, zero lines beginning FAIL, 15 chain entries — on the SECOND run over the final tree**; the first was `GATE EXIT=1` on ONE line, `check-scheduler self-test — 40/41`: its `D8` probe deleted `deno.json`'s `imports` block by a two-line literal that this item's `jsonata` mapping made three lines — *the mutation matched nothing*, rule 7 (b) firing on a file in nobody's `Owns`, re-anchored on the scheduler's own line (a late exception, above), 41/41, and the gate re-run whole. Digest `8d3c17c604846034` over 294 files before and after, identical; selftests 7/7 completed, 7 ok, 545.4 s wall. This row and the markdown count beside it are the edits after the gate's digest | 38 / 979 in node, deno and chromium; **firefox and webkit at 979 by `test:browser:all`** on the same tree, exit 0; L6 **1281 / 0 in both runtimes**; spec 7 / 55 / 104; docs 28 / 22; **markdown 116 documents, 5088 relative links, 257 anchored** (the checks row above was taken before the record step's prose); every self-test at its full count. **`W62` outside `doc/`: 52 hits in 17 files after the record step**, the five new ones `CLAUDE.md`, `README.md` and `scripts/check-scheduler-selftest.mjs`'s own annotations. **[Q142](../questions/q142.md) predicted NOT to fire and did not**: the two-directory fixture is **3741 against 3960** on a scratch copy of the tree this item ships (3714 before the record step, 3694 at W61's end), `M3`'s **88 against 90** unmoved |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) ADR 0052 | `doc/decisions/0052-*.md` — the three shapes priced, six facts, the maintainer's three answers, eight rules, six costs, eight roads not taken | `b1`: `M1` |
| (2) `fyflow-orchestration/jsonata` in both manifests, exporting `jsonata: LanguageAdapter` whose `worker` is its own `import.meta.url` | `package.json` and `deno.json` exports, the JSR allowlist, `src/jsonata/index.ts` | `b2`, `b3` (`S15`), `b4` (`S6`), `b5`, `a17` (Q264's identity), `a18` |
| (3) the adapter: compile synchronous and throwing with the engine's own code, position and message; the names shadowed with a thrower naming the function; `$` and `$settings`; `check` absent | `compile`, `compileExpression` (the default export), `asError`, `unbound`, `plain`, `UNBOUND_FUNCTIONS` — **FIVE names**: the three, `$shuffle` and `$eval` | `a1`-`a12`, `a16`, `a20`, `a21`, `adj1`, `adj4`, `r3` |
| (4) the conformance suite passed, and prediction 4's probe | `adapterConformance('jsonata …', jsonata, JSONATA_PROBES)`; `function-table.test.ts` — **prediction 4 REVERSED**: `$shuffle` | `b7`, `b14`, `c3`, `d2`, `d3`, `p1`, `p2`, `r8`, `r9`, `r18`; the suite's `workerHalf` handle (ADR 0052 rule 8), the one change to W61's suite, declared |
| (5) fact 6's cost re-taken inside the wrapper, inline and threaded, as shape and ratio | the `cost` row above; `dev-dist/w62/cost.mjs` | not a rung — the method is stated and the harness kept |
| (6) the browser bundle carrying jsonata, the adapter suite green in three browsers | 979 in chromium, firefox and webkit; the bundle's own URL stated where the handle is taken | `b8`, `d7`, `e1` (the census); the handle's identity clause has a second observer in the one-module case (`e11`, `e12` declared with it named) |
| (7) `spec/runtime-targets.md`: the rule for a second specifier | `RT-R12`, v0.11 — which files, which forms, which fields, which checks, and three stated limits | `b15`-`b17` (`S14`), `e5`-`e9`, `r11`-`r14` (`S15`), `d5`, `e2`, `e4`, `b12` (the self-test) |
| (8) `AGENTS.md`: a new section with a `run` snippet through the REAL adapter, a `check` snippet wiring the sub-path, the unbound names with the reason | section 14; section 13's expiry-dated sentence un-written | `b9`, `b13`, `adj3`, `r17` (declared), `b10`/`b11` (declared, Q102's shape), `r1`/`r2` (declared) |

**What broke.**

1. **The browser bundle cannot import the worker half by URL, for any adapter that imports an engine** — Q261's fact meeting the second module a thread must load. Six clauses red in three browsers on the first bundle run; the handle, the maintainer's choice, and W61's Record corrected.
2. **JSONata throws plain objects, not `Error`s**, so both halves would have failed the conformance suite's `instanceof Error` clause and `TransformFailed` would have read `[object Object]`. Both halves re-throw.
3. **JSONata marks the arrays it builds** — own `sequence`/`keepSingleton` keys that survive a thread and fail any deep-equal. The adapter strips them; the reader found the array-element depth unobserved.
4. **P17 prediction 4 REVERSED before its probe was written**: `$shuffle` draws from `Math.random()`, found in the engine's own bind list. The rule was right to be a property.
5. **`deno publish --dry-run` proves the presence of `node_modules`** and nothing about the declaration, in both directions — Q252's shape on the second dependency.
6. **L6's manifest clause reads the scheduler sub-path by literal**, so the `./jsonata` export had no observer until `S15`.
7. **The harness's rungs can rewrite the tree**: a probe's `deno check` regenerated `deno.lock` outside the probe's restore set, and the digest moved with no probe reporting it. The same rung regenerates the repository's lock, declared.
8. **Two floors and one anchor moved under the item's own edits** (d6 twice, c2, d7, r10) — rule 7 (b) firing as it should, six aborts across the passes, every one an instrument.
9. **Two ceilings were catches by the time the tree shipped** (p4, r18) — v0.17's dated-ceiling clause firing inside the item that moved the values, twice.
10. **The item's own `S8` re-anchor was needed because the manifest gained the block a probe used to insert**: a second `dependencies` key, of which `JSON.parse` keeps the last, silenced the scheduler's runtime-dependency probe in the copy.
11. **The isolated copy's git baseline failed silently** in `make-copy.sh` (`git add -A` on Windows without `core.longpaths`), so its digest universe included the harness's own log file until the log moved under `dev-dist/`; the adequacy reader hit the same and committed its own baseline.
12. **The Bash tool collapses backslash escapes inside a heredoc**, so three harness edits carrying `\n` landed as real newlines and the harness failed to parse twice — the Edit tool is literal and was used instead.

**What this taught.**

- **A dependency shape is priced by a consumer INSTALL, not by `npm pack`**, because this package's tarball ships no code in any shape; the three consumer shapes said what the manifest could not.
- **The reach prediction reversed from the SOURCE, before the probe ran**: reading the engine's bind list found `$shuffle` in a minute; the walk then confirmed it and observed 61 of 63 names.
- **A hard constraint on a RUNTIME reshaped a suite for the second plan running**: W61's browser parity forced a loop inside a case; W62's browser bundle forced a handle into the suite's probes.
- **The readers' split held for the thirty-sixth time**: the conformity reader found claims that were false (a sentence with an expiry date, a number in prose, an undeclared lock, a count stated wider than measured); the adequacy reader found bounds that were not there (two fields, a depth, a predicate weakened rather than disabled, an adjacent array-valued field, one expression carrying the threaded half).

**Questions raised.** [Q270](../questions/q270.md) (a language's values may carry engine-private markers, and the conformance suite has no plain-values clause), [Q271](../questions/q271.md) (`deno.lock` carries an npm dependency's specifier and not its integrity), [Q272](../questions/q272.md) (one suite's import failure ends the Node runner with zero FAIL lines). [Q265](../questions/q265.md) decided as UNBOUND; [Q252](../questions/q252.md) and [Q261](../questions/q261.md) extended. **Q273 spent and not reused. ADR 0052 taken.** `W62` outside `doc/`: **47 hits in 16 files** before the record step, every one this item's own annotation or P17's declaration (`CLAUDE.md` 3, `README.md` 1).
