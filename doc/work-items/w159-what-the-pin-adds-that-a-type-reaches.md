# W159 — what the pin adds that a type reaches: `cancelGraceMs` and `messages` on a type's `pool`, and the task context through the envelope

**Status:** done 2026-10-15 — **`npm run gate:item` EXIT 0** on the final tree, one command; declared 2026-10-15 on
`c0816d0`, declaration step RUN the same day in a byte copy; exceptions E1 and E2 ASKED at the declaration step,
ANSWERED YES by the maintainer 2026-10-15 and recorded before their edits; both reader passes RUN; nothing raised,
nothing closed
**Plan:** [P33](../plans/p33-what-a-run-does-when-a-task-ends-cancelled.md) — *what does a run fold to when the
scheduler under it can end a task cancelled?* — its THIRD item.

```
Spec:       spec/flow-definition.md v0.32 -> v0.33: section 3's "What a derivation returns" table gains two rows
            (cancelGraceMs, messages) and its refusal sentence counts eight keys; FD-C5's text gains its SECOND
            argument — the scheduler's task context, passed through the envelope unchanged — and its test column
            the new file. No FD-V id moves, no rule is added, no refusal class is added.
Owns:       from P33's index row: src/definition/registry.ts, src/definition/types.ts, spec/flow-definition.md,
            test/definition/registry.test.ts, test/scheduler/envelope-worker.test.ts (new), AGENTS.md section 13.
            And by the Exceptions below, ANSWERED YES 2026-10-15: spec/README.md's flow-definition row (E1),
            test/definition/l4-corpus.test.ts's LATE_SUITES (E2).
Inputs:     P33 facts 4 and 5, decision 6, scope 3, P32-retro sentences B and C; W157's and W158's Out (each hands
            this item exactly cancelGraceMs, messages, context.signal, context.emit, and nothing else); the
            scheduler's contract at the pin — node_modules/fyflow-scheduler/AGENTS.md sections 4 (context.signal,
            emit), 5 (WorkerManager's cancelGraceMs and messages, cancel()), 6 (task.message's order) and 8 (the
            forced stop), and its dist/ (validateGraceMs, resolveMessageOptions) for the exact rules.
Outputs:    (1) POOL_SPEC_KEYS gains cancelGraceMs and messages (so DECLARED_POOL_KEYS does, by its filter);
                MESSAGE_OPTION_KEYS, the messages object's two keys.
            (2) poolSpecProblem holds both to the scheduler's own rules: cancelGraceMs a number, not NaN, >= 0,
                Infinity admitted; messages a plain object of flushIntervalMs (finite, > 0) and maxBuffered (an
                integer >= 1), each optional, each held whenever PRESENT (undefined included), a stray key refused.
            (3) PoolSpec (types.ts) gains the two optional members; NodeTypeDeclaration.pool admits them by its Omit.
            (4) nodeTypeFromDeclaration copies a declared messages object rather than aliasing it.
            (5) spec/flow-definition.md v0.33 (above).
            (6) AGENTS.md section 13: one paragraph (the two options, the context), and the second `run`
                snippet extended — the context through the wrapper, a refusal and an admission. No new snippet.
            (7) tests (below).
Depends on: W157 (the pin), W158 (serial — both edit src/definition/types.ts and AGENTS.md)
Blocks:     W160
Tests:      L1 test/definition/registry.test.ts — each new key refused on each malformed value and admitted on
            each well-formed one, on three roads (poolSpecProblem, a document type, a class); the spec table both
            ways (POOL_SPEC_KEYS, and MESSAGE_OPTION_KEYS against the messages row); both SHAPES fixtures set
            every key; the identity derivation copies messages. test/scheduler/envelope-worker.test.ts — FD-C5's
            context is the SAME object through the wrapper (every runtime); the declared options read back off
            the WorkerManager bootstrap builds (inline and threaded, with the undeclared default as control);
            the scheduler's own constructor as a SECOND observer of every numeric refusal; and on a real
            FyflowScheduler, inline and threaded (Node, Deno) or the class (browser): context.emit arriving as
            task.message before the settlement, and context.signal aborted by cancel() on the running task with
            the reason given, the task ending cancelled. Expected values from the spec's table and the
            scheduler's reference, never from a run.
Gate:       `npm run gate` before the readers (P32-retro C); then the conformity and adequacy readers, NOT run by
            this item's author; then `npm run gate:item` ONCE on the final tree.
Reserves:   Q610-Q612, and NO ADR
```

*Reserves: `npm run state` on `c0816d0` reads the next free ids as **W159, Q607, ADR 0095** from the tree and
**W157, Q600, ADR 0094** from the ledger, which DISAGREE because P33 has been declared since that sentence (both are
printed, neither picked). P33 reserves Q600-Q614 and ADR 0094-0095; W157 reserved Q600-Q604 and spent none, W158
spent Q605-Q606 and RELEASED Q607-Q609, which stay skipped. So this item takes **Q610-Q612**. **No ADR**: P33
decision 6 is the decision, and the spec's version carries it — ADR 0095 is left for W160 or unused.*

## Scope

**In** — Outputs (1)-(7).

**Out** — named rather than left implicit, with where it goes instead

- **`idleCheckIntervalMs`, `requeueFailedTasks`, `maxWorkerRestarts`, and pool options on a named INSTANCE** —
  P37 (#19), P33 Out.
- **`task.message`, `task.progress`, `worker.message` as anything the library records or routes** — P36. This item
  asserts that a typed worker's `emit` REACHES the scheduler; nothing in `src/` subscribes to it, and the outcome
  record is unchanged.
- **The exit artifact — a cancel while running and while queued, on real workers, in `examples/l6.ts`** — W160.
  **The plan row's "L6 a typed worker that sees both members" is met inside `Owns`, not at L6**: L6 is
  `examples/**` (`RT-R10`) and `examples/l6.ts` is W160's. The real-pool cases are in
  `test/scheduler/envelope-worker.test.ts`, on `test/scheduler/transform.test.ts`'s precedent (W61, W141): a real
  `FyflowScheduler` over the real `WorkerManager` the bootstrap helper builds, inline and threaded, in Node and
  Deno; in the browser the wrapper CLASS, because the envelope worker's URL resolves beside the bundle (Q261). They
  run in the L1-L5 lanes. **W160 may add an L6 row through `createRuntime`**; nothing here requires one.
- **A refusal of `cancelGraceMs` on an INLINE type** — the scheduler accepts it there and ignores it (its
  reference, section 5), and this item holds the option to the scheduler's rules, which P33 decision 6 says. Stated
  in the spec's row, not refused.
- **`runtime.ts`'s doc comments** — P34 (W158's Out).
- **`residentGroups` is a declared pool object handed on AS DECLARED on the document road** — an alias that
  PREDATES this item (the conformity reader's F3), left as found and stated in `nodeTypeFromDeclaration`'s comment.
  A class derivation's output is handed on as returned, `messages` included, which is harmless because the
  scheduler spreads it (the adequacy reader's F7). Owner: none; a later item touching the identity derivation.
- **`src/scheduler/envelope-worker.ts:346`'s doc comment** — *"the inner worker receives `{ settings, input }` and
  nothing else"* — reads as if the second argument were not passed, which `FD-C5` v0.33 now states it is. That file
  is not this item's; **W160 or P34** may correct it (the conformity reader's F5).

## What the declaration step measured before anything was edited

*P15 decision 5 and P32-retro B: measured 2026-10-15 in a BYTE COPY of `c0816d0` (`git archive` into `C:/tmp-w159/m`,
`node_modules` copied, **zero links** by `find -type l` and by PowerShell's `ReparsePoint` scan), node 24.20.0 and
deno 2.9.6. The change was built there whole, and every lane run.*

| # | fact | measured |
|---|---|---|
| M1 | where the pool-key list is asserted | `POOL_SPEC_KEYS` / `DECLARED_POOL_KEYS`: `src/definition/registry.ts:126-128`, read at `:204` and `:290`; asserted ONLY in `test/definition/registry.test.ts` (`:223`, `:227`, `:244` the both-shapes fixtures, `:464` the spec table both ways) and the literal key list of `poolOptionsOf`'s test (`:195`). No script, no `examples/` file, no other test names either list |
| M2 | where the worker context is typed or constructed | nowhere in `src/`: `src/scheduler/envelope-worker.ts` passes the worker context to the inner constructor (`:315`) and the task context to the inner `run` (`:371`) as `unknown` (P33 fact 4). Asserted only by `test/scheduler/bootstrap.test.ts:259-283`, by deep equality and a `taskId` — never identity, never `signal` or `emit` |
| M3 | the scheduler's rules at the pin | `dist/node/index.js`: `validateGraceMs` (`:1388`) — `TypeError` unless `typeof number`, `RangeError` on `NaN` or `< 0`, Infinity admitted; read as `options.cancelGraceMs ?? 2e3` (`:1588`), so `null` is ABSENT to it. `resolveMessageOptions` (`:740`) spreads `messages` over `{ 20, 100 }` — so a present `undefined` throws, and a non-object (`null`, `5`, `'x'`, `[]`) is silently the defaults |
| M4 | the census a new SUITE moves | `test/definition/l4-corpus.test.ts`'s suite census (`SUITES` + `LATE_SUITES`, set-equal and counted): RED on the new file's one suite name — **E2**. Every new case in `registry.test.ts` goes into an EXISTING suite, so that file moves no suite name |
| M5 | the census a spec VERSION moves | `check:spec` `C8`: `spec/README.md`'s version column for `flow-definition.md` must equal the document's header — RED on v0.33 — **E1**. `spec/README.md` is not in this item's row (W157 and W158 each owned it) |
| M6 | the census a SNIPPET moves | `scripts/check-docs.mjs` `RUN_FLOOR = 36` reads the count of `run` snippets, and a `run` snippet ADDED makes the floor stale for `check:docs:selftest`'s X4 probe (W158's E5). **None is added**: section 13's second `run` snippet is EXTENDED, so the floor is unmoved |
| M7 | with E1 and E2 applied in the copy | **`npm run gate` EXIT 0**: `check:spec` 7 documents / 75 examples / 134 rules (unmoved); L1-L5 **62 files / 1689 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 1689; baseline 61 / 1682 — one file, seven cases: six in the new file, one in `registry.test.ts`); L6 **2602 assertions / 168 real runs, 0 failed** in node and deno, UNMOVED. **On the real tree, E1 and E2 NOT applied**: `npm run gate` EXIT 1 at `check:spec` `C8` alone (the chain stops there), and `npm test` EXIT 1 at the l4 census alone — exactly M4 and M5 |
| M9 | the author's own provocations, in the copy | 22 mutations of the new clauses against `registry.test.ts` and `envelope-worker.test.ts`: **21 RED**. The one survivor — dropping `!Number.isNaN` from `cancelGraceMs`'s clause — was a REDUNDANT guard (`NaN >= 0` is false), so the guard was deleted and the comment says why. The envelope probes: dropping the task context (4 cases red), COPYING it (`{...context}`, 1 red — the identity case alone, as designed: a copy still carries the same `signal` and `emit`), dropping the worker context (1 red) |
| M8 | the new file in both runtimes | `node test/runner.ts envelope-worker`, `deno run --allow-read test/runner.ts envelope-worker`: 6 cases each, EXIT 0. One expectation was WRONG at first and the scheduler corrected it: `cancelGraceMs: null` — refused here, ACCEPTED by the scheduler (`?? 2000`); it left the second-observer list and is asserted in `registry.test.ts` alone as a stricter rule |

## Exceptions — ASKED at the declaration step, ANSWERED YES by the maintainer 2026-10-15, recorded BEFORE the edit

*`doc/workflow.md` section 1 rule 6 and section 7 rule 2. Each is the edit and nothing else.*

| | file | the edit, and nothing else | why, and its precedent | answer |
|---|---|---|---|---|
| **E1** | `spec/README.md:21` | the version column `**v0.32**` becomes `**v0.33**`, and the prose cell gains one sentence after v0.32's: *"**v0.33 is W159** (linked to this file): a type's `pool` may declare the scheduler's `cancelGraceMs` and `messages`, held to its own rules, and `FD-C5` states the context the envelope passes through to the inner worker; no rule id moves and the count stays 42."* | `check:spec` `C8` binds the column to the header (M5); a spec change is versioned. **Precedent: W157 and W158**, whose rows OWNED `spec/README.md`; P33's row for this item omits it | **YES** 2026-10-15 |
| **E2** | `test/definition/l4-corpus.test.ts:426` | `LATE_SUITES` gains the new file's ONE suite name, under a two-line comment naming the file | the census is set-equal by design (M4). **Precedent: W158's E1, W153 and W154** | **YES** 2026-10-15 |
| — | `src/definition/types.ts`, `AGENTS.md` | **not an exception — the declared overlap with W158** (P33's *serial, never concurrent*). W158 is committed (`c0816d0`); this item edits `PoolSpec` in `types.ts` and section 13 of `AGENTS.md`, neither of which W158 touched | `doc/workflow.md` section 7 rule 2 | — |

## Choices made inside the declaration and not named by P33

1. **`FD-C5`'s text is AMENDED, not a new `FD-C9`.** The context is the second argument beside the envelope —
   what the worker receives — and no new rule id moves `check:spec`'s counts or the README's *42*.
2. **A `messages` key that is PRESENT is held whatever its value**, unlike every top-level key here, because the
   scheduler treats the two differently (M3). Stated in the spec's row and in `poolSpecProblem`'s comment.
3. **Stricter than the scheduler in two places, each where the scheduler is SILENT**: a `messages` that is not a
   PLAIN object — its prototype `Object.prototype` or `null`, so no Map, Date, array or class instance — and
   `cancelGraceMs: null`, each refused here and defaulted by the scheduler without a word. `poolSpecProblem`'s
   existing comment is the precedent (*the scheduler coerces or ignores a wrong option in silence … so the shape is
   pinned here*). **A stray key inside `messages` is refused too, and that one the scheduler does NOT merely
   ignore** — it carries the object to every worker, so on a threaded pool an uncloneable stray value fails the
   task at run time with *could not be cloned* (the conformity reader's F1; this sentence said *defaulted* until
   then). The plainness test is LOCAL to `messages`; the module-wide `isPlainObject` is unchanged (the readers'
   shared subject (i)). *(Rewritten after the readers: as first declared, "a non-object `messages`" was refused
   only where it was not an object at all, and a Map, a Date or a class instance passed.)*
4. **The `messages` type is written out in `PoolSpec`, not imported** from the scheduler, as `POOL_SPEC_KEYS` is a
   literal — and so no new exported TYPE name; `MESSAGE_OPTION_KEYS` is a new exported CONSTANT beside
   `POOL_SPEC_KEYS`, which the spec-table test reads.
5. **The real-pool cases cancel on the worker's own `started` message**, so the task is provably RUNNING when
   `cancel()` is called — the one road on which `signal` aborts (a waiting task is removed and never runs).

## Verification

`npm run gate` (each rung's exit read on its own line), then the readers, then `npm run gate:item` once. Routing
coverage: none of a branch routed away from its join (Q4), `user_action` (Q17), no matching decision edge (Q10), a
duplicate task id (Q13) or a nested fan-out (Q6) applies — this item routes nothing; the real-pool cases drive one
task on a bare scheduler with no driver.

## Record

**Gate — what ran.** Baseline `c0816d0`; every number below is the final tree's, from the confirming `gate:item`.

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **RAN, pass** | `deno lint`, the five `typecheck` lanes |
| the checks | **RAN, pass** | the ladder's twelve; `check:spec` 7 documents / 75 examples / **134 rules** — unmoved, no rule added |
| L1-L5 | **RAN, pass** | **62 files / 1689 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 1689); firefox and webkit NOT RUN (`test:browser:all` is not on the gate). Baseline 61 / 1682 |
| L6 node 24 | **RAN, pass** | **2602 assertions / 168 real runs**, 0 failed — unmoved; this item touches no `examples/**` |
| L6 deno | **RAN, pass** | **2602 / 168**, 0 failed |
| the plan row's "L6, a typed worker that sees both members" | **RAN, at L1-L5 lanes** | `test/scheduler/envelope-worker.test.ts` on real pools, inline and threaded, node and deno (Out says why not `examples/`); the threaded pool proved by its own `inline` flag and by the worker reporting it ran OFF the main thread |
| `npm run gate`, before the readers | **RAN, `GATE EXIT=0`** | on the real tree after E1-E2 (P32-retro C); before them EXIT 1 at `C8` and at the l4 census alone — M4, M5 |
| `check:docs:selftest`, once, before the readers | **RAN, EXIT 0** | 47/47 — the extended snippet moved no floor (M6) |
| conformity reader | **RAN** | F1-F5, all acted on or handed on (below) |
| adequacy reader | **RAN** | F1-F9, all acted on or recorded (below) |
| overlap | | **2 shared subjects**: (i) the `messages` check read `in` and admitted any `isPlainObject` value where the copy and the scheduler read own-enumerable keys (conformity F4 = adequacy F6); (ii) declared-object aliasing beyond `messages` (conformity F3, `residentGroups` on the document road = adequacy F7, the class road) |
| `npm run gate`, after the fixes | **RAN, first RED, then `GATE EXIT=0`** | the first run was RED in chromium alone: the inner worker's `import('node:worker_threads')`, though caught, is a PAGE ERROR to the browser runner; guarded by `process.versions.node`, re-run green |
| **`gate:item`, the confirming run** | **RAN, `GATE:ITEM EXIT=0`** | ONE command on the final tree, held still: the ladder, then the self-tests less `check:register:selftest` — **10/10 lanes completed, 10 ok**, 824.0 s self-test wall, 962 s in all. `gate:full` NOT RUN and not owed (W160 is P33's last item) |

**What was done for each finding.**

| | finding | done |
|---|---|---|
| C-F4 / A-F6 | `messages` read with `in` (inherited, non-enumerable) while its readers see own-enumerable keys; a Map, a Date, a class instance passed `isPlainObject` | `messages` must have prototype `Object.prototype` or `null` — a test LOCAL to it, the module's `isPlainObject` unchanged and the comment says so; presence is own-AND-enumerable; cases for a Map, a Date, a class instance with a prototype getter, `Object.create({ flushIntervalMs: 9 })`, a null-prototype object (admitted) and a non-enumerable own key (admitted, being invisible to both readers) |
| C-F1 | *"the scheduler would ignore"* a stray `messages` key — false on a threaded pool with an uncloneable value | reworded in `poolSpecProblem`'s comment, `AGENTS.md` section 13, the spec's row and choice 3: the refusal prevents a run-time *could not be cloned* |
| C-F2 | `cancelGraceMs: null` refused here and defaulted by the scheduler, unstated in the reference | `AGENTS.md` section 13, the spec's row and `spec/README.md`'s E1 sentence name it |
| C-F3 / A-F7 | `nodeTypeFromDeclaration`'s comment called `messages` the only declared pool object | corrected: `residentGroups` is aliased on the document road (pre-existing, Out); a class's output is handed on as returned, harmless |
| C-F5 | a transform-only type's context reaches nothing; `envelope-worker.ts:346`'s comment stale | one sentence in `FD-C5` (v0.33, same version); the comment is in Out, for W160 or P34 |
| A-F1 | `-0.5` and `-Number.MIN_VALUE` unasserted | added to both lists; the scheduler throws on both |
| A-F2 | `messages: []` asserted only by a mention of `messages` | added, and every non-plain refusal asserted on *must be a plain object* |
| A-F3 / A-F4 | the settle timer never cleared (~7.5 s idle per lane); `shutdown()` awaited unbounded, so a worker that never stops HUNG the suite | `bounded()` clears its timer; settle 8 s, shutdown 3 s, each a FAILED assertion. **Wall per lane: 8.3 s before, 0.3 s after** (node 305 ms, deno 224 ms). **E5 re-run** (the signal swapped for a fresh controller's): EXIT 1 in 11.4 s in each runtime, the case failing on the shutdown bound, no hang |
| A-F5 | *threaded* asserted by nothing in the file | the pool's `inline` read back, and the worker emits `offThread` — `WorkerGlobalScope` in deno, `isMainThread` in node — asserted `true` threaded and `false` inline |
| A-F8 | `maxBuffered`'s admission of a large integer unpinned | `2 ** 53` admitted in both lists; the scheduler accepts it |
| A-F9 | `flushIntervalMs: 1e300` is admitted by both, and `setTimeout` clamps it to 1 ms | **recorded, not raised**: a scheduler observation, a candidate for `doc/scheduler-upstream.md` at the retro — not this item's to raise |

**The author's provocations, re-run after the readers** (rule 8, in the byte copy, each edit asserted to change its
file and each restore digest-checked; the harness is a scratch script and is NOT in the tree):
**28 of 28 RED** — the eight clauses of both keys, the plainness test, own-enumerable presence (against `in` and
against `hasOwnProperty`, each RED on the non-enumerable case), the null prototype, the copy, the key lists, the spec
row, `poolOptionsOf`, and the envelope's four (task context dropped, copied, its signal swapped, worker context
dropped). The declaration step's one survivor (a redundant `NaN` guard) was deleted then (M9).

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the key lists | `POOL_SPEC_KEYS`, `MESSAGE_OPTION_KEYS` | the both-shapes fixtures, the spec table both ways, the `messages` row both ways |
| (2) the refusals | `poolSpecProblem` | the v0.33 case on three roads; the scheduler's constructor as second observer |
| (3) the type | `PoolSpec` | `typecheck` (the fixtures and the snippet set both members) |
| (4) the copy | `nodeTypeFromDeclaration` | the not-aliased assertion |
| (5) the spec | v0.33, `FD-C5`, two rows | `check:spec` `C8` (E1), `registry.test.ts`'s table comparisons |
| (6) `AGENTS.md` section 13 | one paragraph, the extended snippet | `check:docs` X3/X4 (the snippet runs) |
| (7) tests | one new file, one extended | — |

**`git diff --name-only` against `Owns` and the exceptions**, on the final tree: 7 modified and 2 new files —
`AGENTS.md` (section 13), `spec/README.md` (E1), `spec/flow-definition.md`, `src/definition/registry.ts`,
`src/definition/types.ts`, `test/definition/l4-corpus.test.ts` (E2), `test/definition/registry.test.ts`; new
`test/scheduler/envelope-worker.test.ts` and this file. Nothing is undeclared.

**What broke.**

1. **Choice 3 was false as declared**: *"a non-object `messages` is refused"* held only for values that are not
   objects at all — a Map, a Date and a class instance passed, and an inherited key counted as present. Both readers
   found it (overlap (i)); no mutation of the code as written could have, since the claim was in the prose.
2. **A suite that could not hang was assumed, not built**: the first real-pool cases waited unbounded on
   `shutdown()` (A-F4), and left an uncleared timer that cost each lane ~7.5 s (A-F3).
3. **A caught import is still a browser page error** — found by the gate after the fixes, not by the readers.

**What this taught.** Nothing proposed here; the retro decides. A second-observer test (the scheduler's own
constructor) caught one expectation of the author's wrong at the declaration step (M8), which the readers did not
need to.

**Questions.** Raised: none. Closed: none. **Q610-Q612 released unused**; no ADR (ADR 0095 not this item's).
