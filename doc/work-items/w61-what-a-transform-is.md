# W61 — What a transform is

**Status:** done — 2026-09-12, started on `7e074af` and finished the same day
**Plan:** [P17](../plans/p17-what-a-node-may-do-to-its-input-before-its-worker-sees-it.md)

```
Spec:       spec/flow-definition.md sections 2, 3, 5 and 7 — the `type` subsection gains
            `transform`, section 3 gains FD-C6, section 5 gains FD-V35-FD-V37 (ids
            confirmed against section 5 at this item's start: FD-V34 and FD-C5 are the
            highest at declaration)
Owns:       src/definition/**, src/driver/**, src/scheduler/**,
            spec/flow-definition.md, spec/README.md, spec/examples/**,
            test/definition/**, test/driver/**, test/scheduler/**,
            AGENTS.md sections 3 and 13, doc/decisions/0051-*.md
Inputs:     P17 decisions 1, 3, 4, 5, 6, 7, 8, 9 and 10, read from the PLAN's own
            file; facts 1, 7 and 8 re-run from dev-dist/p17/facts.mjs (the
            jsonata facts need JSONATA_URL and are W62's to re-run); FD-C5's
            wording (`input` is the value this node receives); the envelope
            worker's header (a third key is the wrapper's to consume); W58's
            rule that a dispatch key is added only when present; ADR 0002 rule 3
            (registered by name, refused at instantiation); doc/workflow.md
            v0.17 obligation (a)'s enumeration clause — FD-C5 lists FOUR kinds
            of `input` and every one of them is a shape here.
Outputs:    (1) ADR 0051 — what a transform is: a declared expression in a
                registered language, applied in the type's worker wrapper to
                the value the node receives, never in the driver; the adapter's
                two halves and why (fact 7); the roads not taken with their
                cost — a transform on an untyped node (the driver would
                evaluate), a transform as a registry entry rather than a flow
                key (the flow could not say what it does to its input)
            (2) `LanguageAdapter` and `Registry.languages` in
                src/definition/types.ts: `{ compile(expr): void, worker: string,
                check?(expr, inputShape) }` — compile synchronous and throwing,
                worker a module URL, check reserved for P18 and implemented by
                nothing
            (3) `transform: { lang, expr }` on a typed task node with FD-V35
                (unregistered language; an absent set is empty), FD-V36 (an
                expression compile refuses, the language's message as detail)
                and FD-V37 (a transform on a node with no `type`, or not an
                object of two strings)
            (4) FD-C6: what a typed node's worker receives WHEN a transform is
                declared — `input` is the transform applied to the value this
                node receives, with `$settings` bound; FD-C5 unchanged
            (5) the driver: `transform` in the envelope only when declared,
                the untransformed envelope byte-identical (decision 8)
            (6) the envelope worker: loads the adapter's worker module in
                setup(), compiles each node's expression ONCE per worker
                instance, evaluates in run() and hands the inner worker
                `{ settings, input }` with `input` replaced; `TransformFailed`
                naming the expression and the language's code, a task failure
            (7) the bootstrap helper writes the adapter URL into the typed
                pool's config beside `worker` and `config`, only for a type
                some node of which declares a transform
            (8) the ADAPTER CONFORMANCE SUITE in test/scheduler/**, run here
                against a FAKE language shipped as a test fixture (a data: URL
                module), so that W62's JSONata adapter is a second
                implementation of an interface that already has a suite
            (9) AGENTS.md: section 3's key table gains `transform`; section 13
                gains the paragraph and a `run` snippet against the fake
                language, so the section is executable without jsonata
Depends on: nothing — P16 is merged
Blocks:     W62, W63
Tests:      expected values from spec/ and ADR 0051, never from output.
            Obligation (a) with the ENUMERATION: FD-C5 names four kinds of
            `input` — the ordinary edge, `needs`, a map item, a join's
            collection — and a transform is fixtured on ALL FOUR, at L1
            through the wrapper and at L2 through the envelope. Negative
            controls: delete the wrapper's evaluation and the inner worker
            receives the untransformed value (L1 fails, L2 does NOT —
            prediction 3); add the key unconditionally and the byte-identical
            comparison fails; make the fake language's compile accept
            everything and FD-V36's fixture stops firing. Make the transformed
            and untransformed fixtures' expected values EQUAL and the pair
            must FAIL (v0.13 change 3).
Gate:       L0-L5 in five runtimes, check:spec (C4 on three new invalid
            documents, C8 on the version row), check:source (S6 if a file is
            added under src/), check:docs (the section 13 snippet executes),
            then spec-conformity pass (two readers), rule 8 re-run with their
            edits checked in
Reserves:   Q266-Q269, ADR 0051
```

## Scope

**In**

1. **ADR 0051**, on P16 decision 2's and ADR 0049's shape: the decision, the measured facts under
   it (facts 1, 7, 8), and the roads not taken with their cost.
2. **The interface both halves of an adapter satisfy**, and a **fake language** that satisfies it,
   shipped as a test fixture so every clause of the interface has a positive case before a real
   language exists. The fake is deliberately trivial — an expression is a dotted key path, `compile`
   refuses anything else — so a reviewer can hold the whole language in one line and the suite is
   about the INTERFACE.
3. **The three refusals, the envelope key, the wrapper's evaluation and the helper's wiring**, each
   with its fixture, its negative control and its `spec/examples/invalid/` document.
4. **The byte-identical comparison** of decision 8, asserted the way W59 asserted the P12 flows: the
   two P16 typed flows dispatched with and without `languages` registered, compared as bytes.

**Out** — named rather than left implicit, with where each goes instead

- **JSONata**, and any dependency on it — W62's. This item's fake language is what makes that
  separation a test rather than a promise.
- **The exit artifact on real workers** — W63's. This item runs the wrapper on a real inline AND
  threaded pool at L1 (as W59's bootstrap suite does), which is real workers without being L6.
- **P18's `check` hook** — reserved in the interface, implemented nowhere, asserted optional.
- **A transform on an untyped node, on `over`, on an edge or on a decision** — refused, with the
  plan's reasons, and recorded in ADR 0051 rather than argued again.

## Exceptions

Files edited outside `Owns` and outside section 1 rule 5's record step, each named with its reason
**before it is edited** — W59's practice, whose six declared exceptions were predicted from W58's
late table and took no late one.

| path | why |
|---|---|
| `scripts/check-spec.mjs` | predicted from W59's table: `C7` reads typed tasks against `registry.json`; a task carrying `transform` names a language, and `registry.json` gains a `languages` list `C7` must read — mirroring the `nodeTypes` clause W59 added |
| `scripts/check-spec-selftest.mjs` | rule 7: a probe and a `META` entry per new `C7` site |
| `scripts/check-docs.mjs` | only if section 13's `run` snippet moves `RUN_FLOOR` (Q102's ratchet) |
| `spec/outcome-record.md` §4, `spec/run-state.md` §7 | predicted from W58's and W59's tables: the corpus split re-derived by W54's suite moves with every corpus flow this item adds |
| `scripts/check-markdown.mjs` | predicted NOT to fire: `M4`'s two-directory fixture measured **3610** against **3960** at P17's declaration; this item's prose lands under `doc/decisions/`, which the probe cuts. Checked, not assumed — **and it did NOT fire**: measured on a scratch copy before any document was written at **3642**, and on the tree this item ships at **3694 against 3960** (whole tree 115 documents, 5029 relative links, 253 anchored); the file was not edited |
| `examples/run-flow.ts`, `examples/l6.ts` | **LATE, two files, one cause**: the driver gained a field (`languages`, W61's fifth set) and ladder L6's byte walk enumerates every driver field BOTH WAYS — `NOT_RUN_STATE` in `run-flow.ts` and `DRIVER_FIELDS` plus the `skipped` literal in `l6.ts` — so the ratchet fired naming the field on the first L6 run, exactly as it did for W59's `nodeTypes` (which W59 could absorb because P16's row gave it `examples/**`). Three lines, no assertion moved, both L6 runtimes at 1281 / 46 before and after. The obligation is created by the CONTENT of the change, not by a file set — Q102's shape, the tenth recorded instance |
| `scripts/check-spec.mjs` (a second clause) | **declared above for `C7`, and it took ONE MORE clause under `C4`**: the author's rule 8 set (`e7`) reverted `spec/README.md`'s HEADLINE refusal count to 32 for ZERO, because `C4` reads the LAST `**N refusals**` in the row (the version paragraph's) and the row's opening sentence is a copy it did not read. A clause binding the first occurrence, one probe and one `META` entry; the self-test is **29 probes / 28 gradings** from 28 / 27 |

## Verification

| clause | command |
|---|---|
| L0 | `npm run lint`, `npm run typecheck`, redirected and read by `$?` |
| L1-L5 | `npm test`, `npm run test:deno`, `npm run test:browser:all`, redirected and read by exit code; baseline **32 files / 858 cases in five runtimes** at `4c269d4`, plus this item's suites. The fake language's data: URL module must load in the browser bundle too — W59's bootstrap suite already does this |
| L4 | `npm run check:spec` — three new invalid documents under `C4`, the version row under `C8`, `C7` widened as declared |
| checks | `npm run check:source`, `npm run check:docs` — the new section 13 snippet executes against the fake language |
| byte identity | the comparison test, and its negative control (the key added unconditionally) |
| conformity reader | spec first, code second: `FD-C6` and the three refusals re-derived from the new subsection before the code is read |
| adequacy reader | isolated copy, tree held still by content digest; mutations over the wrapper, the adapter interface and the four `input` kinds |

*Routing cases: a branch routed away from its join (Q4) — not applicable, no routing changes;
`user_action` (Q17) — **applicable**, a transform failure on a non-optional node parks the run and
the L1 wrapper suite asserts the failure reaches the scheduler as a task failure; no matching
decision edge (Q10), duplicate task id (Q13), nested fan-out (Q6) — not applicable.*

## Record

**Gate — what ran.** Every rung RUN and redirected to `dev-dist/w61/*.log`, verdict read from `$?`
(`doc/workflow.md` section 4, v0.16); rule 8's harness (`dev-dist/w61/rule8.mjs`, W59's lineage with
every v0.17 clause) checks each edit's anchor against the CURRENT text, undoes what an aborting probe
applied, asserts every restore byte for byte, RUNS every declared ceiling against the rung its reason
names, and holds the tree still by a content digest over every tracked and untracked-unignored file.
*(Author-pass numbers, then the re-run after the readers at the foot of the table.)*

| Clause | Verdict | Notes |
|---|---|---|
| declaration | measured | Started on `7e074af`, tree clean, no other session (last `dev-dist/` write 17:48 against a commit at 18:34). `dev-dist/p17/facts.mjs` re-run under Node 24.20.0 and Deno 2.9.6 against a `jsonata` 2.2.2 install OUTSIDE the repository: **facts 1, 7 and 8 reproduce** — `async`/`await` 0, the envelope at line 2030 in one expression, a threaded pool's function config *could not be cloned* while a URL string crosses, `unpackEnvelope` keeps `["settings","input"]` — identical in both runtimes outside timings. Baseline RE-TAKEN, not inherited: **32 / 858 in five runtimes, L6 1281 / 46 in both, spec 7 / 51 / 99, census 207 / 154 / 2 / 51**, digest `8a879f2c12fe0fe9` over 279 files before and after. Section 5's highest id confirmed `FD-V34`, section 3's `FD-C5`. `M4`'s two-directory fixture **3642 against 3960** on a scratch copy before any document. **Four facts of this item's own** (`dev-dist/w61/facts.mjs`, both runtimes): **F1 a wrapper whose `setup()` THROWS is a WORKER error** — the task `pending` with `attempts: 0` forever, the pool restarting, no task event after `task.running` (P17 prediction 2's reversal condition, real); F2 a `data:` URL language module `import()`ed from inside a real thread works; F3 a throw from `run()` is `failed` on an optional task and `failed` then `user_action` on a non-optional one, inline and threaded; F4 fact 8 re-taken |
| stop-and-ask | answered | **One, put to the maintainer after F1 and before the wrapper's final form, three roads priced** (ADR 0051's context table): load in `setup()` and throw (the plan's literal text — F1's hang); **load in `setup()`, REMEMBER the failure, fail the TASK from `run()` on exactly the tasks naming that language — chosen**; load lazily in `run()`. Asserted on the class and on real inline and threaded pools |
| L0 | GREEN | `lint` 0; `typecheck` 0 across all five sub-typechecks |
| L1-L5 | GREEN | **36 files / 958 cases in node 24.20.0, deno 2.9.6, chromium, firefox and webkit** — from 32 / 858. **+4 files**: `test/definition/transform.test.ts` (`FD-V35`-`FD-V37`, every clause, on all FOUR shapes `FD-C5` enumerates — the enumeration clause's first item — the corpus flow's shapes derived through `task-shapes.ts`'s new predicate, `registry.json`'s `languages` against `corpus-types.ts` both ways), `test/driver/transform.test.ts` (the third key present exactly when declared, the untransformed `input` as a PAIR against the bare node on all four shapes — **P17 prediction 3 asserted** — decision 8 as a byte-identical dispatch of the two P12 flows and `typed.flow.json` with and without `languages`), `test/scheduler/transform.test.ts` (the wrapper over the four kinds of input, `$settings` as a pair, `undefined` not a failure, one compile per instance per `(lang, expr)`, `TransformFailed` with the language's code, the not-loaded and did-not-load roads, and **a real `FyflowScheduler` inline AND threaded** where a pool can load the wrapper — the class itself in the browser, stated), `test/scheduler/fake-language.test.ts` (the **adapter conformance suite** over the FAKE language, whose two halves are two copies of one grammar so the *halves agree* clause has something to disagree about) — plus `adapter-conformance.ts` and `fake-language.ts`, helpers rather than suites; and a W61 suite in `bootstrap.test.ts` (the helper writes a language's worker URL only where a node of the type transforms, obligation (e) both ways over two flows). **The browser's real-pool cases drive the wrapper CLASS** (a pool loads its script by URL and `ENVELOPE_WORKER_URL` resolves beside the bundle, Q261), with the case count identical in all five runtimes as the parity check asks |
| L4 | GREEN | `check:spec` — **7 documents, 55 examples, 103 rules**, from 51 / 99; `C4` covered **35** definition refusals; `C7` gained two clauses (declared) and `C4` one (late, above); the self-test **29 / 28** from 26 / 25, 28/28 then 29/29 caught; `C8` saw `spec/README.md`'s row move to v0.18 |
| L6 | GREEN | **1281 assertions over 46 real runs in node AND deno, UNMOVED** — the declared result; an item with no L6 row adds no assertion, and reverting the whole of W61 at L6 costs **0** (`rev61`), which is the number W63 has to move from |
| checks | GREEN | `check:docs` 0 — **26 snippets, 21 `run`**, section 13's second `run` snippet building a toy language's two halves, validating a transformed flow, throwing on each of the three refusals and driving the envelope worker through a transform, `$settings` and a `TransformFailed`; `RUN_FLOOR` 20 → 21 (declared); `check:source`, `check:markdown` (**115 documents, 5029 relative links, 253 anchored**), `check:policies`, `check:wiring`, `check:scheduler` 0 |
| rule 8, author pass | **83 probes: 1 control green, 72 caught, 9 declared ceilings each RUN against its rung (four of them W59's, re-anchored and re-run under v0.17's dated-ceiling clause — all four hold), 1 revert measurement, 0 undeclared, 0 crashes, 0 aborts, 0 against declaration — on the final pass** | **The first pass read 1 CRASH, 1 ABORT and 1 UNDECLARED SURVIVOR, and two of the three were the instruments.** `b19` CRASHED because its replacement text was `'$'` and `String.replace` with a STRING reads `$'` as *the text after the match* — [Q184](../open-questions.md)'s shape (W41's harness) in a harness copied from W59's; closed by a function replacement. `c5` ABORTED on an anchor that could not match because **the file it anchored on carried a NUL byte** — the memo key's separator, written as the byte by the author's tool — which every rung had been green over ([Q267](../open-questions.md)); replaced by a JSON pair. `e7` SURVIVED: `spec/README.md`'s headline refusal count reverted to 32 at `check:spec` exit 0, because `C4` reads the last `**N refusals**` and the row's first sentence is a copy; closed by a `C4` clause (late exception above). **Prediction 3 measured** (`b8`): the wrapper's evaluation deleted costs **14 at L1** (11 in the wrapper suite, 3 on real pools), **0 in every L2-L5 suite, 0 at L6** — and `check:docs` `X4` red, a third observer |
| readers | **10 / 1 blocking and 66 mutations / 10 survivors / 1 vacuous / 3 blocking, OVERLAP 1** | The **thirty-fifth** measurement, inside the 0-4 band, neither primed. **Conformity, blocking 1**: the spec and ADR said the conformance suite asserts the three unbound names BY NAME, and the suite asserted a count of three — any three refused expressions passed; closed by name. Non-blocking, all closed: `run-state.md`'s ordinal (third move, not fourth) and frame; the v0.17 `type` subsection's *a transform is P17's* in the forward tense and its *three shapes* where section 7 says four (pre-existing, in the subsection this item edited around); `types.ts` widening the worker half's `evaluate` past the spec; `AGENTS.md`'s *a typo is `FD-V36`* (only a SYNTAX error is), a broken sentence, and a present-tense sub-path that does not exist yet; *`compile` returns nothing* with no observer (pinned in the suite); the brief's stale self-test counts; the `Owns` audit **clean** — five declared exceptions, the two late `examples/` files, nothing else. **Adequacy, blocking 3**: (m23) **the memo keyed by expression TEXT alone survived** — a task in language B silently received language A's compiled expression, and no suite ran two languages with one text on one worker; the author's `c5` probed the mirror (keyed by lang) and was caught; closed by a two-language case on one instance. (m39) **`BACKENDS` narrowed to `inline` with 953 unmoved** — the backends loop is inside each case, so the case count cannot see it; closed by a membership assertion against the scheduler's two modes and a record of what the cases DROVE, compared both ways. (m11) **`FD-V37`'s *reported alone* had no COUNT observer** — the untyped and shape clauses reporting together at one node was invisible to a deduped id set; `refused()` takes a finding count now. Real non-blocking, taken: `undefinedCase` REQUIRED of every adapter (m60, so W62 inherits P17 fact 4's silent half); the nondeterminism loop's count (m50); the non-function guard's exact message (m08); the byte-identity pair's difference asserted (m40); the fixture lists held to the grammar (m41/m42, stated as fixture lists). Vacuous, stated: m58. **The split held**: the conformity reader found claims that were false (a count, an ordinal, a tense, a widened type, a typo's kind); the adequacy reader found bounds that were not there (a memo key, a backend list, a finding count, a required case, a loop count, a pair) |
| re-run, tree held still | **93 probes: 1 control green, 81 caught, 10 declared ceilings each RUN against its rung, 1 revert measurement, 0 undeclared survivors, 0 crashes, 0 against declaration on the final pass — 1 abort re-anchored and then caught (a13, an anchor the adequacy fix moved) and 1 author probe rewritten (r7, first aimed at the wrong branch)** | the author's 83 plus the two conformity edits (`r1`, `r2`) and the eight adequacy edits (`r3`-`r10`) — every reader edit CAUGHT by the test it forced, except `r9` (one fixture entry out), DECLARED as the reader prescribed. Digest identical before and after every probe |
| `npm run gate` | **GATE EXIT=0, zero lines beginning FAIL, 15 chain entries — on the SECOND run over the final tree** (the first was red at one line, *What broke* 12); digest `b28afc80c26516cc` over 290 files before and after, identical; selftests 7/7 completed, 7 ok, 442.5 s wall. This row and the markdown count beside it are the edits after the gate's digest | 36 / 958 in node, deno and chromium (firefox and webkit at 958 by `test:browser:all`, same directory); L6 **1281 / 0 in both runtimes**; spec 7 / 55 / 103; docs 26 / 21; markdown 115 documents, 5029 relative links, 253 anchored; every self-test at its full count. **`W61` outside `doc/`: 74 hits in 24 tracked files, 88 in 30 with the 11 files this item created**, every one this item's own annotation or a record-step index line (62 hits in 24 tracked files before the record step). **[Q142](../open-questions.md) predicted NOT to fire and did not**: the two-directory fixture is **3694 against 3960** (whole tree 115 documents, 5029 relative links, 253 anchored) on a scratch copy of the tree this item ships |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) ADR 0051 | `doc/decisions/0051-*.md` — three of P17's facts re-run, four of this item's own, the stop-and-ask priced three ways, seven rules, six costs, ten roads not taken | `b1`: `M1` and `C5`, five links from three documents |
| (2) `LanguageAdapter`, `Languages`, `Registry.languages` | `src/definition/types.ts`; `languagesOf`, `transformShapeProblem`, `compileProblem` in `validate.ts`, shared by the validator, the driver and the helper | `b2` (typecheck); `a2` (absent read as registered); `adj1` |
| (3) `transform: { lang, expr }`, `FD-V35`-`FD-V37` | the key table row, the three rules, three invalid cases, `transformed.flow.json` on all four shapes, `registry.json`'s `languages` resolved by `corpus-types.ts` | `a1`-`a12`, `a13`/`a16` (the shapes), `b3`, `b4`, `b6`, `b7`, `e6`, `e8`, `adj2`, `adj4`, `adj5`, `r5`, `r6` |
| (4) `FD-C6`, `FD-C5` unchanged | section 3's row; `FD-C5`'s row byte-identical to `HEAD` (the conformity reader diffed it) | `b5`, `b9`, `b10`, `r10` |
| (5) the driver: the key only when declared, byte-identical otherwise | `dispatch`'s one expression; the byte-identical comparison of the two P12 flows and `typed.flow.json` with and without `languages` | `b9`, `b10`, `c9` (declared), `adj1` |
| (6) the envelope worker | `languages` in the pool config, loaded in `setup()`, a load failure REMEMBERED; `run()` evaluating with `$`/`$settings`, one compile per `(lang, expr)` per instance, `TransformFailed` naming the language, the expression and the code; `unpackEnvelope` keeping a well-formed `transform` and refusing a malformed one | `b8`, `b21`, `b22`, `c1`-`c3`, `c5`-`c7`, `d6`, `d8`, `r3`, `r7`, `w59-adj5` (declared) |
| (7) the bootstrap helper | `languages` and `flows` options; `transformLanguagesByType`; URLs written only for a type some node of which transforms, direction one a refusal and direction two stated as not one | `b11`, `b12`, `c4`, `d4`, `d5`, `adj6` |
| (8) the adapter conformance suite, over a FAKE language | `test/scheduler/adapter-conformance.ts` and `fake-language.ts`, run by `fake-language.test.ts` — seven clauses, the three names by name, `undefinedCase` required | `b13`, `b14`, `b19`, `d2`, `d3`, `p3`, `r1`, `r2`, `r7`, `r8`, `r9` (declared) |
| (9) `AGENTS.md` sections 3 and 13 | the task row and the refusal count; section 13's `transform` row, paragraph, `run` snippet and the amended `check` snippet | `b15` (the floor), `b16` (declared: Q102), `w59-r10` (declared: nothing compares the count sentence) |

**What broke.**

1. **A NUL byte shipped through every rung.** The wrapper's memo key was written with a literal NUL as its separator; `lint`, five typechecks, L1-L5 in five runtimes and both L6 runtimes were green over it because a NUL inside a template literal is legal JavaScript. Found by rule 8's harness aborting on an anchor typed with a space, and by `grep` calling the file binary. Replaced by a JSON pair; [Q267](../open-questions.md).
2. **The harness reproduced [Q184](../open-questions.md) on its first crash.** `'$'` — JSONata's context token — in a probe's replacement text is `$'` to `String.replace`, and the probe wrote a file Node could not parse. A function replacement is literal.
3. **`C4` read the last of two counts.** `spec/README.md`'s row opens with *"and **N refusals**"* and closes with *"now holds **N refusals**"*; `C4` was written to read the last (the earlier ones being historical) and so did not read the first. The author's set reverted the headline for zero; a clause binds it now.
4. **A `setup()` throw is a worker error the run never hears of** (F1) — P17 prediction 2's reversal condition, measured real and then avoided by the maintainer's choice rather than reversed: every failure a TRANSFORM can produce is a task's. The inner worker's own `setup()` throw, W59's road, still hangs and is [Q266](../open-questions.md).
5. **The driver's new field reached two `examples/` files this item does not own** — the L6 byte walk's both-ways field lists, W55's universe binding firing on W61 exactly as on W59, which owned `examples/**`. Two late exceptions.
6. **The L2 census in `test/driver/needs.test.ts` and the `EIGHT flows with a map region` literal both moved** — the corpus flow is region-bearing; the census's both-ways derivation from the directory caught it, and the count beside it (Q102's shape, stated there) was raised by hand.
7. **W54's corpus split moved for the third item running and, for the first time, in the NUMERATOR**: `transformed.flow.json` carries five task nodes and one `needs` — **15 of 155, 140 (90%)** — all three copies moved together, the two spec documents declared before the flow was written.
8. **The conformance suite asserted a COUNT where the spec said BY NAME** (the conformity reader's blocking finding), and its nondeterminism loop could be sliced to one name with the count clause green (the adequacy reader's m50) — the same clause, two readers, opposite ends: the item's one overlap.
9. **The memo's key was a fact with one observer, and the observer looked the other way** (m23): the author's `c5` keyed the memo by language and was caught by the compile count; keyed by expression text it was invisible, because no suite ran two languages over one text. The blocking hole was in the direction the author's probe did not take — W17's finding at its sixth iteration.
10. **`BACKENDS` was a list bound by nothing** (m39): the browser parity constraint forced the backends loop INSIDE each case, and that is exactly what made a narrowed list invisible to the case count. A membership assertion and a record of what ran, compared both ways.
11. **P17's own facts harness went vacuous at exit 0 on this item's first edit to the line it reads** — fact 0's anchor `input: payload }` — three items after Q253 recorded the same for P16's. Recorded in that row, not patched.
12. **The FIRST gate over the final tree was RED at one line, `check-docs self-test — 18/19`, and the probe had fired for a reason it does not name.** The `X4` probe *a `run` snippet whose assertions are deleted* strips every line containing `throw new Error(`; section 13's new snippet declared its toy language's registry half on such a line inside an object literal, so the deletion removed the `compile` property and the snippet stopped COMPILING — `got [X3,X4,X5]` where `[X4]` was declared. P9's *for the reason it names*, read off the failure line rather than the exit code. The compile throws a `SyntaxError` now, which is what it is, and the gate was re-run whole on the tree that ships.

**What this taught.**

- **A hard constraint on a runtime was what stopped a wiring hole being visible.** The browser's parity check needs one case count in five runtimes, so the real-pool backends had to loop inside a case, and a loop inside a case is a list the runner cannot count. The fix is the loop-bounds obligation's own: declare the members, and record what ran.
- **A stop-and-ask is cheapest right after the measurement and before the design is built around either answer.** F1 was measured at the declaration, the wrapper was written with the plan's literal text, everything that did not depend on the answer was built, and the maintainer chose with three roads priced; the chosen road cost eight lines.
- **Two copies of one grammar are what make a *the halves agree* clause load-bearing.** The JSONata adapter's halves are one module and the clause is trivially true of it; the fixture keeps its halves apart on purpose, and the probe that made the worker half accept everything is the clause's positive case.
- **The readers' split held for the thirty-fifth time**: claims that were false on one side, bounds that were not there on the other, one subject shared from opposite ends.

**Questions raised.** [Q266](../open-questions.md) (a type's inner worker whose `setup()` throws hangs every task of the type, and the run never hears of it), [Q267](../open-questions.md) (nothing in the gate refuses a control byte in a tracked text file). [Q184](../open-questions.md) and [Q253](../open-questions.md) extended. **Q268 and Q269 spent and not reused. ADR 0051 taken.**
