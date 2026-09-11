# W57 — The scheduler is a dependency

**Status:** done — 2026-09-11, on the tree above `3ab3f3f`; ADR 0048 taken, Q71 resolved, Q252-Q253 raised, W60 not issued
**Plan:** [P16](../plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md)

```
Spec:       spec/runtime-targets.md section 4 (what the source may depend on)
            and ADR 0013 rule 1, which this item SUPERSEDES as ADR 0048
Owns:       package.json, deno.json, tsconfig.docs.json, src/driver/**,
            test/driver/**, scripts/check-source.mjs,
            scripts/check-source-selftest.mjs, scripts/check-scheduler.mjs,
            scripts/check-scheduler-selftest.mjs, spec/runtime-targets.md,
            spec/README.md, AGENTS.md sections 1 and 12,
            doc/decisions/0048-*.md
Inputs:     P16 facts 1, 3, 4 and 5, read from the PLAN's own file and RE-RUN
            from dev-dist/p16/facts.mjs rather than transcribed. ADR 0013's
            context facts 1 and 2 with their expiry notes; ADR 0029 rules 1-2
            and its D1-D3; Q71's row; the check-source.mjs header comment on
            S7, S8 and S9.
Outputs:    (1) ADR 0048 - the scheduler is a declared dependency; ADR 0013
                rule 1 superseded on the ground that its forcing fact expired
            (2) `peerDependencies: { "fyflow-scheduler": <range> }` in
                package.json, the range being the maintainer's call (P16
                stop-and-ask 1), bound to `PIN` by a check-scheduler clause so
                the peer range and the devDependency pin cannot drift apart
            (3) `import type { FyflowScheduler }` in src/driver/driver.ts and
                Q71 RESOLVED: `SchedulerLike` accepts a real FyflowScheduler
                under the DOM lib, and AGENTS.md section 12's cast paragraph is
                DELETED rather than apologised for
            (4) a default `createTask` of `new FyflowTask(config)` when the
                option is omitted, and the option kept for the L2-L5 fakes
            (5) S7, S8 and S9 NARROWED to what still holds - no working-tree
                reach, no path in deno.json's import map - or RETIRED if D1-D3
                already cover it (prediction 4), with every probe and META
                entry that named them repointed
            (6) tsconfig.docs.json gains "DOM", so every AGENTS.md snippet is
                typechecked under the configuration fact 3 fails in today
Depends on: nothing
Blocks:     W58, W59
Tests:      expected values from ADR 0048 and spec/runtime-targets.md, never
            from output. The negative controls: with S7 narrowed, a probe that
            writes a `file:` specifier must still trip it (or D1); with the
            peer range removed, the new check-scheduler clause must fail; with
            the `import type` reverted, fact 3's DOM tsconfig must report
            TS2322 again.
Gate:       L0-L6 in five runtimes, check:source:selftest,
            check:scheduler:selftest, check:docs, then spec-conformity pass
            (two readers)
Reserves:   Q252-Q255, ADR 0048
```

## Exceptions

`doc/workflow.md` section 7 rule 2: every file this item edits outside its `Owns` and outside
section 1 rule 5's record step, named before the edit, with the reason. **Declared at the start of
the item, on 2026-09-11, before any of them was touched.**

| file | why this item reaches it |
|---|---|
| `scripts/check-docs.mjs` | **`X5` carries an allowance for exactly ONE snippet failing under the DOM lib, and names Q71 as the one.** Output (3) removes that snippet's failure, so `hit.size > 1` becomes a hole one snippet wide — section 1 rule 5's third direction, a withdrawn claim searched for. And `RUN_FLOOR` is [Q102](../open-questions.md)'s ratchet: this item makes section 12's snippet a `run` one, so the floor moves 18 -> 19, which is the obligation Q102's row says the item adding a snippet owes |
| `scripts/check-docs-selftest.mjs` | the `META` entry for `X5` anchors on `if (hit.size > 1)` and is named *"so Q71 can get worse unnoticed"*; both follow the clause, or rule 7 (b) reports *the mutation matched nothing* |
| `examples/run-flow.ts` | the L6 harness is the ONE place a real `FyflowScheduler` is driven, and its `createTask: (config) => new FyflowTask(config)` is what output (4) makes the default. **Rule 8 obligation (e) — was what it RAN what SHIPS** — is answered by L6 running with the option OMITTED, which the Verification section above declares and which is in this file. Its header comment also states ADR 0013 rule 1 as current |
| `examples/README.md` | states *"the published library depends on the scheduler not at all"* as current, in the document L6's reader opens first |
| `examples/deno-import-map.json` | its `_note` states ADR 0013 rule 1 as the reason the mapping is not in `deno.json` |
| `package-lock.json` | mirrors `package.json`'s dependency fields at its root entry, so a `peerDependencies` block lands there on the next `npm install` |
| `deno.lock` | **conditional on P16 stop-and-ask 2**: if `deno.json` gains an `imports` entry for the scheduler, Deno may rewrite the lock's workspace section. Declared so the audit does not read it as undeclared |
| `examples/l6.ts` | **LATE — declared after rule 8's author pass, on a measurement.** Probe `a3` made the default `createTask` return the plain config instead of `new FyflowTask(config)` and **L6 stayed green at 1061 / 0**, because `FyflowScheduler.addTask` duck-types its task: a plain object runs to `done` with `attempts` **undefined** and `instanceof FyflowTask` false, and no L6 row read either. So output (4) had NO observer at the one rung that runs the default. The observers are two properties the documents already promise — every task the scheduler holds is a `FyflowTask` (ADR 0048 rule 5) and every outcome record's `attempts` is a number (`spec/outcome-record.md`'s eleven fields) — and per-row assertions live in this file, which `examples/run-flow.ts` (declared above) feeds |

## Scope

**In**

1. **ADR 0048, superseding ADR 0013 rule 1.** The decision record on the shape of ADR 0029 and the
   S9 note: the forcing fact — *the pinned version is on no registry* — expired on 2026-08-31, the
   second fact — *Node cannot load the source* — expired at 0.5.2, and rule 1 is the last clause of
   that ADR resting on nothing it was decided on. *(As declared; the conformity reader found the
   argument false of ADR 0013 — rule 1 rests on that ADR's fact 4 and on ADR 0001's separation, which
   ADR 0048 now answers on its own terms. What broke, item 11 in the Record.)* **What survives is
   stated in the same document**:
   `SchedulerLike` stays as the L2-L5 test seam, because that is a testing decision the manifest never
   touched; `createTask` stays as an option, because W3's tests supply a plain object through it.
2. **Q71 closed by construction.** `import type { FyflowScheduler }` and either a widened
   `SchedulerLike` or a type that the real class satisfies under `lib: ["DOM"]`. Fact 3 is the test:
   `dev-dist/p16/facts.mjs` reports `TS2322 x1` under `ES2022+DOM` today and must report `x0` after.
3. **The manifest says what the driver is sensitive to.** AGENTS.md section 1 says *install whichever
   version you like* and section 12 says *pin at 0.5.2*; the second is true and the first is not. A
   `peerDependencies` range is where a consumer's installer reads that. **The range is the
   maintainer's call**, priced both ways in the ADR: exact is unusual and honest, caret is
   conventional and false the day upstream changes an event shape again with no changelog.
4. **The three source checks re-derived from what the decision keeps.** `S7` refuses any scheduler
   import in a published file; `S8` refuses a manifest entry and a `deno.json` import; `S9` refuses
   the import in the browser bundle's input set. Each is re-read against ADR 0048: the browser
   half is moot because the scheduler ships a `browser` export condition (fact 5); the
   working-tree half is ADR 0029's and is already refused by `D1`-`D3`. **Prediction 4 says `S7`
   survives narrowed rather than deleted; W57 measures whether `D1`-`D3` already cover it and takes
   the retirement if they do**, which is the stop-and-ask.
5. **The one configuration the reference is not checked under.** `tsconfig.docs.json` sets
   `lib: ["ES2022"]` explicitly and section 12 says *the failing configuration is the common one*.
   Adding `DOM` makes every snippet compile under the consumer's default, and is what turns output
   (3) from a claim into a gate.

**Out** — named rather than left implicit, with where each goes instead

- **Anything a node declares.** `retryPolicy`, `workerGroups`, `settings`, `type` — W58's and W59's.
  This item widens what `createTask` may be handed by nothing; it only gives the option a default.
- **Deno's half of the dependency declaration.** JSR has no `peerDependencies`; a JSR package's
  dependency is an `imports` entry in `deno.json`, which `S8` refuses today under ADR 0013 rule 3 and
  which ADR 0029 rule 2 put in `examples/deno-import-map.json` instead. **Whether the published JSR
  package declares the scheduler at all, and how, is decided in ADR 0048 and is the second
  stop-and-ask** — if it needs the import map to move, that is ADR 0050's shape and may issue W60.
- **The scheduler pin itself** — 0.5.2, Q3, unchanged. A version bump is its own item on W36's and
  W37's precedent.
- **`RT-R5`, no DOM API in published source.** Adding `DOM` to the *docs* tsconfig typechecks the
  snippets under it; the published source keeps `tsconfig.node.json` as the mechanism `RT-R5` names.

## Verification

How each clause of `Gate:` is actually run. Name the commands.

| clause | command |
|---|---|
| L0 | `npm run lint > dev-dist/p16/w57-lint.log 2>&1; echo $?` and the same for `npm run typecheck`. **A rung is RUN, never PIPED** — `doc/workflow.md` section 4, v0.16: redirect it and read `$?`; a tail line is never the predicate |
| L1-L5 | `npm test`, `npm run test:deno`, `npm run test:browser:all`, each redirected and read by exit code. The baseline is **27 files / 703 cases in five runtimes** at `8550978` |
| L6 | `npm run test:l6` and `npm run test:l6:deno`. The baseline is **1061 assertions over 42 real runs**; this item adds no row and must leave both numbers unmoved |
| checks | `npm run check:source:selftest` and `npm run check:scheduler:selftest` — every narrowed or added clause with a probe declaring the exact set it trips (rule 7 (c)), and a `META` entry per clause; `npm run check:docs` under the widened `tsconfig.docs.json` |
| fact 3 | `node dev-dist/p16/facts.mjs` before and after — `TS2322 x1` to `x0` under `ES2022+DOM`, `x0` to `x0` under `ES2022` |
| conformity reader | spec first, code second, re-deriving ADR 0048's stated facts before reading them — especially the two expiry claims, each of which cites a commit |
| adequacy reader | **in an isolated copy**, and the AUTHOR's tree holds still while it reads (section 6, v0.15); rule 8's set is not run during the review |

**Routing coverage.** This item touches no routing. A branch routed away from its join
([Q4](../open-questions.md)), `user_action` ([Q17](../open-questions.md)), no matching decision edge
([Q10](../open-questions.md)), a duplicate task id ([Q13](../open-questions.md)) and a nested fan-out
([Q6](../open-questions.md)) are all **not applicable**: the default `createTask` builds the same
object the L6 harness has built by hand since W5, and reverting to the hand-built one is the control.

**Rule 8 obligation (e) has a named target here.** The default factory is a value that ships and a
test double is what L1-L5 run; *was what it RAN what SHIPS* is answered by L6 running with the option
**omitted** in at least one row, so the default is the thing a real scheduler exercised.

**Before this item is done it greps the tree for `W57`** outside `doc/` — section 1 rule 5's third
direction. At this declaration that returns **1** hit, in `CLAUDE.md`.

## Record

*Filled in when the item is done. Delete the italic lines.*

**Gate — what ran.** Every rung RUN and redirected to `dev-dist/w57/*.log`, verdict read from `$?`
(`doc/workflow.md` section 4, v0.16); the tree held still for each whole-tree measurement, with
`git status --porcelain` written before and after and compared.

| Clause | Verdict | Notes |
|---|---|---|
| L0 | GREEN | `lint` 0; `typecheck` 0 — all five sub-typechecks, so `import type { FyflowScheduler }`, the value import of `FyflowTask` and the type-level `FyflowScheduler extends SchedulerLike` assertion cost **0** under node, browser, deno, tests and examples (P16 prediction 1, L0 half) |
| L1-L5 | GREEN | **27 files / 705 cases in node 24.20.0, deno 2.9.6, chromium, firefox and webkit** — 703 at the baseline, unmoved by the import itself (prediction 1's other half, with the scheduler's browser build now in the test bundle), **+2** for the L1 suite the adequacy reader's findings forced (ADR 0048 rule 5, both halves) |
| L6 | GREEN | **1138 assertions over 42 real runs in node AND deno**, from 1061 / 42. The **+77** is this item's: two per-row observers for ADR 0048 rule 5 on the 38 rows that run the per-row block, and one cross-row non-vacuity clause. No row added; `createTask` OMITTED on every row, so the default the driver ships is what L6 ran |
| checks | GREEN | `check:source` 0 with `S7`/`S8` narrowed and `S9` retired; `check:source:selftest` **41 probes / 27 META / 10 SELF** (from 35 / 24 / 10), one of them a `clean` CONTROL; `check:scheduler` 0 with `D8`; `check:scheduler:selftest` **41 probes / 36 graded** (from 32 / 29) plus the PIN-value bound; `check:docs` 0 — **23 snippets, 19 `run`, 0 failing under the DOM lib**; `check:docs:selftest` 18/18, 10/10 noticed; `check:spec` 0 — **7 documents, 44 examples, 93 rules**, from 92, for `RT-R11`; `check:markdown` 0; `check:wiring` 0 |
| fact 3 | GREEN | `node dev-dist/p16/facts.mjs`: `TS2322 x1 -> x0` under `ES2022+DOM`, `x0 -> x0` under `ES2022`. Fact 1's anchor had to be widened first — see *What broke* |
| rule 8, author pass | 44 provocations, 38 caught, 6 declared survivors | `dev-dist/w57/rule8.mjs`, with a control and byte-asserted restores. See *What broke*: **two real survivors** (`a3`, `b4`) closed by two observers, one harness ceiling (`c1`) closed by binding the check's source, two mis-declared rows (`b6`, `a10`) re-targeted and caught |
| conformity reader | 13 findings / 2 blocking | **Blocking 1 — the ADR's supersession ARGUMENT was a claim about ADR 0013 that ADR 0013 does not make.** It said rule 1 rested on context fact 1 (*the pinned version is on no registry*) and was "left standing on nothing it was decided on"; 0013 grounds rule 1 on fact 4 (ADR 0001 rule 2 and `RT-R2` "already imply it"), PREDICTS rules 1, 2 and 4 unchanged when the pin reaches a registry, and states the claim the rule protected — *a driver that can construct a scheduler is a driver that will* — which the ADR addressed NOWHERE. The sentence came from P16 and was copied into four documents. **ADR 0048's Context now names both grounds and answers the real one on ADR 0001's own terms**; ADR 0013's header, ADR 0029's note and P16 are corrected in place, dated. **Blocking 2** — the ADR stated L6 at **1061** under a heading naming the tree that ships; it is **1138**, and the +77 is explained there now (section 1 rule 5's WHEN). Non-blocking, all closed: "twelve documents that link" the ADR is **9 markdown files**; `check:spec` moved to **93 rules** and nothing said so; `X5`'s report label still read *reported (Q71)*; six stale identifiers inside the item's own files (`browserBundleInputs`, `SCHEDULER_REACH` in a present-tense sentence, *ADR 0013 rule 1's ONLY enforcement*, a META name, a driver comment); Consequence 3's arithmetic (five entries in four files, one file wider — not "four places", not "five files"); Consequence 4 described a prior state that never existed; the `clean` control printed `undefined` for its id; **`dev-dist/p16/facts.mjs` misread fact 1 at exit 0 a SECOND way** — `/^[a-z]+$/` dropped `workerType` and `payload,`, so it printed two fields of four from the day P16 was declared (Q253 extended); section 1's `check` snippet still drew the seam's listener as `{ detail: unknown }`; `S8`'s deno.json half admits an alias key (stated as a limit in `RT-R11`). **Confirmed independently**: both expiry claims, the rule map, the peer table (own `npm pack` harness), the JSR table (own scratch copy, plus `deno info` in-repo with and without the flag), the Q71 table (own `seam.ts`, four configurations), `D1`-`D3` read no source file, the plain-object task, every number (27/703 ×5, 1138/0 ×2 with 1061 + 2×38 + 1 derived from the file, 23/19/0, 39/27/10, 39/34, 18/18 10/10, census 197/144/2/51, fact 3 x0), section 12's snippet is a faithful program, `Owns` audit **25 paths, ZERO undeclared**. `W57` outside `doc/`: **58 hits in 16 files**, all this item's own annotations. Tree digest identical at start and end |
| adequacy reader | 64 mutations / 13 survivors / 5 blocking | **Every survivor was in ONE direction the author's set never took: fields, keys and spellings ADJACENT to the ones the checks read, and the option half of rule 5, which no fake ever asserted.** Blocking, all closed: **(1)** `peerDependenciesMeta: { optional: true }` made the peer optional with `D2`, `D8` and `S8` green — measured at the installer, a fresh consumer added the library and NOT the scheduler; `D8` now refuses it, probed and graded. **(2)** a `deno.json` `scopes` block re-mapped `fyflow-scheduler` for `./src/` to a working tree with the `imports` entry intact — `deno info` showed the driver resolving to `../fyflow-scheduler/index.ts`, `S8` and `D8` both read `imports` alone; both now walk `scopes`, probed in both self-tests. **(3)** the PIN-literal bound the author wrote to close its own `c1` split on `'0.5.2'` and was blind to `"0.5.2"` and to `'jsr:@fyflow/scheduler@0.5.2'` — the compounds showed the cost: on a bump that forgets the peer, `D8` dropped out of the failure ids; the bound now counts the bare version string in the check's CODE with comments stripped, any spelling. **(4)** the `createTask` OPTION could be ignored outright — `(defaultCreateTask)` in place of `(this.opts.createTask ?? defaultCreateTask)` — with **703 cases and 1138 L6 assertions green**, because every fake reads a plain object back and none asserted the object was the one its factory RETURNED; an L1 suite in `test/driver/surface.test.ts` now hands a factory that adds a marker and asserts the marker arrived. **(5)** a default that INJECTS `retryPolicy` or `workerGroups` — the two fields W58 is about to make node-declared — was green at every rung, because both L6 observers accept any `FyflowTask`; the same L1 suite asserts the default equals `new FyflowTask(config)` field for field, and names the two fields. Non-blocking, closed: a template-literal `import(\`jsr:…\`)` passed `S7`'s quote class (backtick added, probed); a Windows absolute path passed `S8`'s path predicate (added); `PKG_PIN_RE` matched the FIRST `fyflow-scheduler` entry so a legitimate manifest reorder turned the scheduler self-test red (anchored inside `devDependencies`). Non-blocking, RECORDED as limits: `import.meta.resolve('jsr:…')` passes everything and is observable only when called (the stated *built at run time* class); the `clean` CONTROL probe can be made vacuous or deleted for one floor edit at 41/41 — its second observer is `driver.ts`'s own import on the real tree (reverting `S7` to refuse-all costs 6/41 and `check:source` red), W31's one-edited-floor shape in the one self-test with no cited list; `X5`'s lib set collapsed to `X3`'s costs 0 (the pair's difference, `DOM.Iterable`, is bound by nothing; three observers of the seam remain); at L6 nothing observes that the harness OMITS `createTask` — section 12's snippet is the sole observer of *the default is what ships*; the cross-row non-vacuity clause's predicate can be weakened to `>= 0` under its unchanged label (W55's own recorded limit of a subject list). Confirmed as declared: `b2`, `c2`, the two rule 5 observers each alone at 38, the control. Harness incident, recorded: one restore failed on a broken relative log path and left the copy's `package.json` mutated until a later grep found it — in the COPY, and the author's tree was never opened |
| re-run, tree held still | **54 provocations, 48 caught, 6 survived — every one declared — 0 aborted, 0 against declaration** | the author's 44 plus the adequacy reader's ten exact edits checked back in (`r20`, `r22`, `r22s`, `r28`, `r29`, `r39`, `r37`, `r38`, `r05`, `r24`), all ten CAUGHT by the clause written for each. The six survivors: the control, the positive control of the narrowing (`a15`), fact 3's meter (`a1f`, reading `x1`), DOM-alone (`b2`), the explicit-factory control (`b5`), the single-observer assertion whose pair `a2` covers it (`c2`). `git status --porcelain` identical before and after |
| `npm run gate` | **GATE EXIT=0, zero lines beginning FAIL, 15 chain entries** | run over the shipping tree, redirected to `dev-dist/w57/gate.log` and read from `$?`; `git status --porcelain` identical before and after. Inside it: 27 / 705 in node, deno and chromium (firefox and webkit at 705 by `test:browser:all`, same log directory); L6 1138 / 0 in both runtimes; spec 7 / 44 / 93; markdown 108 documents, 4748 relative links, 245 anchored; selftests 7/7 completed, 7 ok, 442.6 s wall, 5 lanes. **`W57` outside `doc/`: 76 hits in 18 files, every one this item's own annotation** (58 in 16 before the readers' closes; 1 at declaration) |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| ADR 0048 | `doc/decisions/0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md`, superseding ADR 0013 rules 1, 2 and 6 — **its supersession argument rewritten after the conformity reader read ADR 0013 against it** | `check:markdown` M1 on the nine markdown documents that link it (probe `b1`; *twelve* until the reader counted) |
| the peer range, bound to `PIN` | `package.json` `peerDependencies: { "fyflow-scheduler": "0.5.2" }` — EXACT, the maintainer's call with both priced; `D8` in `check-scheduler.mjs` | `D8` at a caret, a missing entry or a different version (`a5`, `a6`, `a18`); the self-test's PIN-literal bound if the comparison stops reading `PIN` (`c1`) |
| `import type` and Q71 resolved | the type import is the L0 assertion `FyflowScheduler extends SchedulerLike`; **what closed Q71 is `SchedulerLike`'s listener parameter, `object`** — P16 fact 3's mechanism was wrong and is corrected in the ADR and the register | `typecheck:browser` (`a1`), P16 fact 3's meter reads `x1` again (`a1f`), and section 12's snippet under the DOM tsconfig (`a2`) |
| the default `createTask` | `defaultCreateTask` in `src/driver/driver.ts`; `createTask?: TaskFactory`; L6 and section 12 both omit it | `typecheck:examples` if the option is required again (`a4`); **L6's two rule 5 observers** if the default hands the scheduler a plain object (`a3`, `a3c`, `a3n`), and section 12's `instanceof` assertion (`a3d`, `b4`) |
| `S7`/`S8`/`S9` narrowed or retired | `S7` NARROWED to the form of the reach (prediction 4 confirmed, on a measurement); `S8` narrowed to a second declaration and a path; `S9` RETIRED; `CHECK_SOURCE_DENO` | `check:source` on each refused shape (`a10`-`a14`, `a16`, `a17`, `a9s`); the CONTROL probe if the bare import is refused again; `check:source:selftest` if the predicate or the list goes inert (`d1`, `e6`) |
| `tsconfig.docs.json` under DOM | `"lib": ["ES2022", "DOM"]`; `X5`'s allowance at zero | alone, **nothing** (`b2`, a declared ceiling: with Q71 closed no snippet fails under DOM) — the pair `b2c` is what it buys: with the seam reverted and the L0 assertion gone, `X5` still sees it |

**What broke.**

1. **The default `createTask` had NO observer at the one rung that runs it, and the reason is a
   fact about the scheduler nobody had written down: `FyflowScheduler.addTask` duck-types its
   task.** Rule 8 probe `a3` swapped `defaultCreateTask` for `(config) => config` and L6 stayed
   green at 1061 / 0 in both runtimes; `a3d` and `b4` did the same to section 12's new `run`
   snippet and `check:docs` stayed green too. Measured directly (`dev-dist/w57/plain-task.mjs`): a
   plain `{ id, workerType, payload, optional }` handed to `addTask` runs to `done`, emits
   `task.running` and `task.completed`, and arrives at the listener with `attempts` **undefined**
   and `instanceof FyflowTask` **false** — while the driver's listener normalises `attempts` to `0`
   (`src/driver/listener.ts:98`), so no outcome record could see it either. **Closed with two
   observers on two different structures**: every task the scheduler HOLDS at the quiescent point
   is a `FyflowTask` (read from `scheduler.tasks`), and every settlement the scheduler REPORTED
   carried a numeric `attempts` on its live task object (read at the harness's own listener,
   `OR-R1`-style). `a3` now costs **76** L6 failures, and each observer alone — the other
   re-sourced (`a3c`, `a3n`) — costs **38**. Section 12's snippet asserts the `instanceof` half and
   `b4` costs 1 at `check:docs`. The late exception for `examples/l6.ts` is this finding.
2. **The first version of the first observer was vacuous on every row, and the cross-row clause
   written beside it caught that on its first run.** `tasksHeld` was read at the report literal,
   after the retention observer's awaits, and the scheduler's map was **empty on all 42 rows** —
   `0 === 0` per row, green, and the non-vacuity clause red: *0 tasks held, 154 settlements seen*.
   Sampled at the quiescent point where `dispatched`, `settled` and `log` are already read, it
   holds the run's tasks. **And the first version of the SECOND observer was a tautology**: it
   counted outcome records with a numeric `attempts`, which is every record, because the listener
   normalises the field. `a3c` — the first observer re-sourced — survived at **0** until the second
   observer moved to the live detail. *A second observer that reads a normalised copy of the first
   observer's subject is downstream of the normaliser, not independent* — v0.16's clause on (c)'s
   LIMIT, one layer in.
3. **P16 fact 3's stated mechanism was FALSE.** *An `import type { FyflowScheduler }` in `src/`
   closes Q71 by construction* — the import alone changes nothing about assignability. Measured
   over seven candidate shapes in four configurations (the table is in ADR 0048): `{ detail:
   unknown }`, `Event & { detail }`, `CustomEvent`, `never` and `{ detail?: unknown }` all fail for
   the real class or for the fakes or both; the union typechecks only with a cast at the boundary;
   **`object` and `unknown` are the two that both satisfy**. What closed Q71 is the seam's listener
   parameter. The type import is kept because it makes Q71 an L0 assertion,
   `FyflowScheduler extends SchedulerLike`, under the two typecheckers that carry the DOM lib
   (`a1` costs 1 TS error at `typecheck:browser`). The item's own declared negative control —
   *with the `import type` reverted, fact 3 must report TS2322 again* — named the wrong mechanism;
   the control that applies is the listener type reverted (`a1f`: fact 3's meter reads `x1` again).
4. **Section 12's new snippet read the fold mid-turn and got `completed` after ONE settled task.**
   `fold()` over `{ dispatched(ingest), outcome(ingest done) }` reports `completed` — no path end,
   every node settled — which is `RN-R12`'s stated limit (*at a quiescent point*), and section 8
   already tells a consumer reading from `onFoldInput` to read on a `queueMicrotask`. The snippet
   now does what section 8 says, and `e4` (the microtask removed) costs 1 at `check:docs`.
5. **`D8`'s peer comparison could be re-sourced to a literal for zero, and no probe can ever see
   that** — W34's rule, both sources agree until the pin moves — **and the compound showed the
   blindness**: with `PIN` moved to 0.5.3 and the literal left, `D8` named the JSR half and not the
   peer (`c1c`). A META entry cannot bind it (an entry must make a probe stop being caught). The
   self-test binds the SOURCE instead: the pin's value may appear as a string literal exactly once
   in `check-scheduler.mjs`, the `PIN` declaration. `c1` costs 1 there now.
6. **`S9` was retired and one META entry in `check-source-selftest.mjs` anchored on the walker it
   used** — reported as *the mutation matched nothing*, rule 7 (b) firing correctly, re-anchored
   to `testSources()`.
7. **P16's facts harness went silently vacuous on this item's first edit to the line it reads.**
   `lineOf(/this\.opts\.createTask\(\{/)` returned 0 once the call site became
   `(this.opts.createTask ?? defaultCreateTask)({`, and `facts.mjs` printed an empty field list and
   all eight constructor fields as unreachable at exit 0. Widened; [Q253](../open-questions.md).
8. **Two of the author's own probes were mis-declared and the harness said so.** `b6` renamed
   `RT-R11` to a non-grammatical id and tripped `check-spec` `C2` (*cited but never declared in a
   rules table*) — so the spec row IS bound, by the citations in `S7`'s and `S8`'s messages, and the
   ceiling I declared was not one. `a10` anchored on a string that occurs twice in `policies.ts`
   and aborted rather than grading. Both re-targeted; both caught.
9. **The shell layer collapses `\\` to `\` in a command**, which turned a regex's escapes into
   plain characters inside a heredoc twice and cut two long heredocs short. Every splice that
   needed a backslash was rewritten to read its bodies from files, and the ADR and the harness were
   written with the Write tool. Recorded because the first symptom — `facts.mjs` throwing
   *Unterminated group* — looked like a defect in the harness rather than in the transport.

11. **The conformity reader's blocking finding is the ADR's own ARGUMENT** — the supersession rested on a claim about ADR 0013 that ADR 0013 does not make (rule 1's ground is its fact 4, it predicts rules 1, 2 and 4 unchanged when the pin reaches a registry, and it names the claim the rule protects, *a driver that can construct a scheduler is a driver that will*, which the ADR addressed nowhere). The sentence came from P16's declaration and was copied into ADR 0013's header, ADR 0029's note and this item's own Scope; all are corrected, and the ADR answers the real ground on ADR 0001's terms. Its second blocking finding was a **1061** under a heading naming the tree that ships — section 1 rule 5's WHEN, on the item's own headline.
10. **The adequacy reader's five blocking survivors, every one in a direction the author's set never took** — the fields, keys and spellings ADJACENT to the ones a check reads (`peerDependenciesMeta`, `scopes`, `"0.5.2"`), and the option half of rule 5 (`createTask` ignored outright: 0 of 705, 0 of 1138; a default injecting `retryPolicy` or `workerGroups`: green everywhere). All closed — `D8` reads the third field and walks `scopes`, `S8` walks `scopes` and sees an absolute path, `S7`'s quote class carries the backtick, the PIN bound counts the bare version in comment-stripped code, and an L1 suite asserts both halves of rule 5. The reader's ten exact edits are probes `r20`-`r24` in the harness, all caught on the re-run. Its table is the adequacy row above.

**What this taught.**

- **A check that reads a FIELD is blind to the field beside it, and rule 8's set was written by the person who chose which field to read.** `S8` read two fields of `package.json` and `D8` one of `deno.json`; the adequacy reader mutated the third field and the sibling key, four times, for zero. (a)'s shapes clause (v0.16) says *instantiate more than one value of each KIND a rule names* — the kind here was *a manifest field that changes what the declaration means*, and the author's set instantiated one. For P16's retro: the shape is the same as W41's and W53's, on a manifest rather than a region.

- **A green dry run was the wrong answer, and only reading what it resolved TO said so.**
  `deno publish --dry-run` passes in this repository with a bare import and no `deno.json` mapping,
  because `package.json`'s `devDependencies` resolves the specifier through `node_modules` to the
  npm build. The refusal in a clean copy is what a JSR consumer would have hit; the pass here is
  what a publish from this tree would have shipped. [Q252](../open-questions.md).
- **Two decisions the plan handed this item as forks were priced and turned out to be one-sided.**
  Exact against caret differ on no version that exists (both `ERESOLVE` at 0.4.0 and 0.5.1, both
  install at 0.5.2, both auto-install when the consumer lists nothing); the difference is entirely
  about versions upstream has not published, which is what a range IS a claim about. And moving the
  L6 map into `deno.json` (W60's first condition) was unnecessary: the two copies coexist, resolve
  to the same URL with no warning, and `D8` binds the new one to the pin `D3` already binds the old
  one to. **W60 is not issued and ADR 0050 is not taken.**
- **Prediction 4 confirmed by the measurement it named**: `D1`-`D3` read `node_modules`,
  `package.json` and the L6 map and no source file; a `../fyflow-scheduler` reach from `src/`
  typechecks or fails depending on whether a sibling checkout exists on the machine. `S7` is
  narrowed to the FORM of the reach and keeps four of its five shapes.
- **Prediction 1 confirmed**: the peer entry and the imports cost 0 at L0 in all five typechecks
  and 0 at L1-L6 in every runtime, with the scheduler's browser build in the bundle.
- **The scheduler accepts a plain object as a task**, and this is the second fact about it in
  this plan that its own reference does not state (fact 2, the silently ignored group id, is the
  first). W58's retry row will read `attempts` for real; it now has an L6 observer that reads the
  live task's `attempts` at every settlement to build on.
- **A count check caught what an assertion count cannot**: raising `PER_REGION_ROW` and
  `PER_PLAIN_ROW` by two moved 38 rows and left 4 pair runs unmoved, which is how the `+77` was
  derived rather than assumed (42 × 2 would have been 85).

**Questions raised.** [Q252](../open-questions.md) (no `deno publish --dry-run` rung, and its verdict
depends on `package.json` in a way `S8` cannot see) and [Q253](../open-questions.md) (P16's facts
harness is untracked and went vacuous at exit 0). Q254-Q255 reserved and unused. [Q71](../open-questions.md)
RESOLVED. ADR 0048 taken; W60 not issued; ADR 0050 not taken.
