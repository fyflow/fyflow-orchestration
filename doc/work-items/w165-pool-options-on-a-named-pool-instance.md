# W165 — pool options on a named pool instance

**Status:** done 2026-10-16 — **`npm run gate:item` EXIT 0** on the final tree, one command; both reader passes RAN, their items acted on, one code defect fixed (C-F1); Q626 raised; exception E1 granted. Declared 2026-10-16 on `eeea984`; declaration step RUN the same day in a byte copy (M1-M5 below); stop-and-ask S1
(one line of `src/scheduler/runtime.ts`, outside `Owns`) ASKED and ANSWERED by the maintainer 2026-10-16, YES — exception E1
**Plan:** [P37](../plans/p37-a-runtime-is-its-registry.md) — *what may a running runtime be asked to accept, when its
registry is fixed at `createRuntime`?* — its FOURTH item.

```
Spec:       spec/flow-definition.md v0.36 -> v0.37: section 3's registry subsection — "A pool instance, and a group" gains
            a `pool` row: a named instance of a DOCUMENT type may declare its own pool options (the type table's `pool`
            keys, DECLARED_POOL_KEYS), merged SHALLOWLY over the type's declared `pool`, the instance's key winning, a key
            present with `undefined` absent; an instance of a CLASS type carrying one is refused (`UndeclaredKey`) —
            a class owns how its pool is built and receives the instance key. The identity derivation COPIES
            `residentGroups` (decision 8) as it copies `messages` and `groups`. "What a derivation returns" bounds
            `messages.flushIntervalMs` at 2^31-1 (decision 9). The refusal table's `UndeclaredKey` and
            `DerivationRefused` rows name the instance's `pool`. No rule id moves and none is added — the FD-V count
            stays 42.
Owns:       from P37's W165 row: src/definition/registry.ts, src/definition/types.ts, src/scheduler/bootstrap.ts,
            spec/flow-definition.md, spec/README.md, test/definition/registry.test.ts, test/scheduler/bootstrap.test.ts,
            test/definition/l4-corpus.test.ts, scripts/check-docs.mjs, AGENTS.md, doc/scheduler-upstream.md (S11 only),
            doc/decisions/0099-*.
            scripts/check-docs.mjs is in the row and is NOT edited: no `run` snippet is added or removed (AGENTS.md's
            change is inside an existing `run` snippet), so RUN_FLOOR does not move.
            Exceptions: E1 — `src/scheduler/runtime.ts`, ONE line (the instance's `pool` carried into the pools entry
            `createRuntime` hands `bootstrap`), its type annotation widened and a one-line comment, nothing else in that
            file; S1 below, granted by the maintainer 2026-10-16 BEFORE the edit reached the real tree.
            Record-step files (doc/workflow.md section 1 rule 5): doc/decisions/0054-* (a status-line note, as W164
            noted ADR 0053 and 0056), doc/decisions/0075-* (a note line), doc/questions/q457.md (its note),
            doc/questions/q626.md (raised), this file.
Inputs:     P37 stop-and-ask (e)'s answer, decisions 8, 9 and 11, fact 5, fact 7, prediction 5, (f)'s answer, sentences
            B' and C and paragraph D; ADR 0054 decisions 2-3; S10's form in doc/scheduler-upstream.md; fyflow-app request
            #19 as P37 states it.
Outputs:    (1) registry.ts: POOL_INSTANCE_KEYS (type, config, pool) beside INSTANCE_KEYS (unchanged: a group instance's,
                and every instance's shared two); checkPoolsShape — on BOTH roads — refuses an instance's `pool` on a class
                type (UndeclaredKey), not a plain object (DerivationRefused), a key outside DECLARED_POOL_KEYS
                (UndeclaredKey), and a malformed value (poolSpecProblem, DerivationRefused); nodeTypeFromDeclaration(decl,
                over?) merges `over` shallowly over the declared pool and copies residentGroups; derivePool(…, pool?) runs
                the instance's merged identity derivation and holds its OUTPUT to the one check (decision 9's last
                sentence); a document type's resolved definition stays recognisable as one, so the runtime road (which
                hands bootstrap resolved definitions) admits what the document road admitted; flushIntervalMs <= 2^31-1.
            (2) types.ts: PoolInstance.pool?, Pools' entry type, ResolvedPool.pool? (the instance's own options, as
                declared, so createRuntime can hand them to bootstrap).
            (3) bootstrap.ts: a named instance's `pool` passed to derivePool.
            (4) spec v0.37 (above) and spec/README.md's row.
            (5) ADR 0099 — amends ADR 0054 decisions 2-3.
            (6) S11 in doc/scheduler-upstream.md — NOT RAISED, on S10's form: the scheduler bounds a grace timer at its own
                MAX_TIMER_MS and not the flush interval; what we do without it is decision 9's bound.
            (7) AGENTS.md section 13: the pool-options paragraph gains the per-instance rule and the bound; the existing
                `run` snippet gains an executed block.
            (8) L1 tests (below) and their suite in l4-corpus's LATE_SUITES.
Depends on: W164 (done, eeea984)
Blocks:     W166
Tests:      L1 test/definition/registry.test.ts — the W165 suite: each DECLARED_POOL_KEYS member overridden per instance
            (the merged spec carries the instance's value, the type's default instance the type's, and every other key
            the type's), each held to poolSpecProblem on the instance (a malformed value per key refused,
            DerivationRefused naming the pool and the key), a key outside the list refused (UndeclaredKey), a non-object
            refused; the merged output held to the derivation's checks (a resident group beside the TYPE's
            idleTimeout: 0; a resident group the document lacks); an instance of a class type refused (UndeclaredKey)
            and of the built-in Transform admitted; a group instance still refusing every pool key and `pool` itself;
            residentGroups not `===` the declaration's on the default instance and on a named one, list and record
            forms, and two instances not sharing one; flushIntervalMs 2^31-1 admitted and 2^31 refused, on
            poolSpecProblem, a document type, an instance and a class; both roads identical on every new shape site
            (W141's list both ways); the spec's instance table both ways with POOL_INSTANCE_KEYS and INSTANCE_KEYS.
            test/scheduler/bootstrap.test.ts — the per-instance options reach the WorkerManagerOptions bootstrap
            builds, the type's default pool unmoved, through bootstrap AND through createRuntime (the runtime road);
            P18 fact 5's captures unmoved (existing cases, not edited).
            Expected values from the spec's tables, P37 (e)'s answer and decisions 8-9, and the scheduler's MAX_TIMER_MS
            (2^31-1) — never from the resolver's output.
Gate:       `npm run gate` before the readers (P37 sentence C); then the conformity and adequacy readers, NOT run by this
            item's author; then `npm run gate:item` ONCE on the final tree. The row's clauses: L1 each DECLARED_POOL_KEYS
            member overridden per instance and held to poolSpecProblem; a group instance still refusing every pool key;
            residentGroups not `===` the declaration's; flushIntervalMs 2^31-1 admitted and 2^31 refused; P18 fact 5's
            captures unmoved.
Reserves:   Q626-Q629, ADR 0099, S11
```

*Reserves: `npm run state` on `eeea984` reads the next free ids as **W165, Q620, ADR 0099** from the tree, and W162, Q615,
ADR 0096 from the ledger (P33's Retro) — they DISAGREE because P37 was declared and W162-W164 spent ids since that
sentence; P37's own reservation governs. Its W165 row gives this item Q626-Q629, ADR 0099 and S11.*

## Scope

**In** — Outputs (1)-(8).

**Out** — named rather than left implicit, with where it goes instead

- **The three `WorkerManagerOptions` fact 5 found admitted by nobody** — `idleCheckIntervalMs`, `requeueFailedTasks`,
  `maxWorkerRestarts`: NOT admitted, (e)'s answer; still refused as `UndeclaredKey` on a type's `pool` and an instance's.
- **Pool options on a CLASS type's instance** — refused, (e)'s answer; a class reads its instance's `config` and key.
- **`inline` per instance** — the type's, FIXED (the spec's own row); not a pool option.
- **An L6 row** — W167's exit artifact runs a named instance declaring its own pool options on real workers.
- **Raising S11** — (f) says NOT RAISED.
- **A `Map` or a function as a `pool`** (W165's conformity F9) — a Map passes `isPlainObject` and is read as empty; a
  function is reported *got undefined*. Pre-existing on a TYPE's `pool` since v0.19 and shared by the instance's, which
  copies that clause; not fixed here, because the type's road moves a refusal no P37 decision names.

## What the declaration step measured before anything was edited

*P15 decision 5 and sentence B′: measured 2026-10-16 in a BYTE COPY of `eeea984` (`git archive` into `C:/tmp-w165/m`,
`node_modules` copied, **zero links** by `find -type l`), node 24.20.0 and deno 2.9.6.*

| # | fact | measured |
|---|---|---|
| M1 | the baseline, in the copy | `npm run gate` **EXIT 0**: `check:spec` 7 documents / 75 examples / 135 rules; `check:docs` 42 snippets (36 run, 6 check); L1-L5 **62 files / 1718 cases** in node, deno and chromium; L6 **2646 assertions** in node and deno |
| M2 | **P37 prediction 5, measured** — the CODE changed alone (`registry.ts`, `types.ts`, `bootstrap.ts`, and S1's line of `runtime.ts`), every test, spec and example as shipped | `lint`, `typecheck` **EXIT 0**; `npm test` **EXIT 1 with exactly ONE failure**: W141's site census (`test/definition/registry.test.ts`), because the change ADDS four throw sites to the shape functions — and the first cut's instance message repeated a type site's fragment (*.pool must be an object of pool options*), which that census caught as a site matched twice; the message was reworded. **No pool option, no P18 fact 5 capture and no `residentGroups` assertion moved** — the copy breaks nothing, as the prediction says, because nothing compared identity |
| M3 | the change whole, in the copy | `npm run gate` **EXIT 0**: `check:spec` 7 / 75 / **135 rules** (unmoved); `check:docs` 42 snippets, 36 run, 6 check — unmoved (the AGENTS.md block is inside an existing `run` snippet); `check:register` green after ADR 0099's `amends` was written `decisions 2 and 3` (its first spelling, `2-3`, is outside R7's form); L1-L5 **62 files / 1742 cases** in node, deno and chromium (+24: the W165 registry suite's 16, W141's four new defects, the bootstrap suite's four); L6 **2646** in node and deno, unmoved. Copy scanned: zero links |
| M4 | the author's provocations (rule 8, written to the RULE — ADR 0099 rules 1-7, decisions 8-9; harness `C:/tmp-w165/mutate.mjs`, NOT in the tree; each edit asserted to match once and to change its file, each restore digest-checked; the runner UNFILTERED) | the no-edit CONTROL **EXIT 0**; **28 of 28 KILLED** — K1 the instance pool not merged, K2 the type's key winning, K3 `undefined` unsetting, K4 `messages` merged deep, K5 one key (`cancelGraceMs`) dropped from the merge, K6-K8 `residentGroups` aliased (whole, list, record), K9 the class-type refusal gone, K10-K12 the instance pool's undeclared-key, `poolSpecProblem` and non-object checks gone, K13 `pool` undeclared on an instance, K14 a GROUP admitting `pool`, K15 a resolved document type not remembered, K16 `bootstrap` and K17 `createRuntime` dropping the instance pool, K18 `ResolvedPool.pool` not carried, K19 its `messages` not copied, K20 the flush bound gone, K21-K22 off by one each way, K23 an instance exempt from the resident/`idleTimeout: 0` refusal, K24 the instance's derivation returned as its definition (*compound — it also dropped `pool`, so the swap alone was not shown killed until the Record's K25, A-A1*); T1 the spec's `pool` row gone, T2 the messages row's bound gone; A1-A2 `AGENTS.md`'s executed block (X4) |
| M5 | the census sites the row names | `spec/README.md`'s row: moved. `l4-corpus.test.ts`: two suites in `LATE_SUITES`. `scripts/check-docs.mjs` `RUN_FLOOR`: unmoved (no `run` snippet added), so `check:docs:selftest` is NOT bound by B′ and was NOT run; no always-read document moves, so `check:budget:selftest` is NOT bound either |

## Stop-and-ask

**S1 — ONE line of `src/scheduler/runtime.ts`, outside `Owns`.** ASKED at the declaration step; **ANSWERED by the maintainer 2026-10-16: YES — exception E1**, the one line, the wider
type annotation and the one-line comment, nothing else in `runtime.ts`. The real tree was not edited past this file
until the answer.

- **What forces it.** `createRuntime` hands `bootstrap` the named instances it resolved as `{ type, config }`
  (`src/scheduler/runtime.ts:493` on `eeea984`), so an instance's `pool` would be resolved and checked by
  `resolveRegistry` and then DROPPED: the pool the scheduler is handed would be built with the type's options, in
  silence, while every resolver assertion stayed green. That is the runtime road — the one fyflow-app's #19 is on.
  Measured in the copy: with the line reverted (M4's K17), the createRuntime case in `test/scheduler/bootstrap.test.ts`
  is the one assertion that goes red.
- **The edit**: `pools[key] = { type: p.type, config: p.config, ...(p.pool !== undefined ? { pool: p.pool } : {}) }`,
  its type annotation widened to carry `pool`, and a one-line comment. No other line of `runtime.ts`; no test in
  `test/scheduler/runtime.test.ts` (the runtime road is asserted in `bootstrap.test.ts`, which this item owns).
- **Recommendation: YES** — widen `Owns` by that one line (workflow section 1 rule 6: a defect one simple decision
  settles is asked, not raised). The alternative, NO, ships (e)'s answer on the document road and the helper and not
  on `createRuntime`, and needs a question.

**Also named, inside `doc/scheduler-upstream.md` but beyond S11's own section**: the index row for S11, and the two
sentences that said *S10 is not raised* as the whole of what is unraised (the top paragraph and *Raise order*), which
S11's arrival makes false — each now names S11 beside S10. **Accepted by the maintainer 2026-10-16 as within "S11
only"** — not an exception.

## Verification

`npm run gate` (each rung's exit read on its own line), then the readers, then `npm run gate:item` once. Routing
coverage: none of a branch routed away from its join (Q4), `user_action` (Q17), no matching decision edge (Q10), a
duplicate task id (Q13) or a nested fan-out (Q6) is this item's — it routes nothing; pool options are resolved at
construction and reach the scheduler's `WorkerManagerOptions`.

## Record

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate`, before the readers | **RAN, `GATE EXIT=0`** | on the real tree after the port, 2026-10-16, node 24.20.0: `check:spec` 7 / 75 / 135 rules; `check:docs` 42 snippets, 36 run, 6 check; L1-L5 **62 files / 1742 cases** in node, deno 2.9.6 and chromium; L6 **2646 assertions**, 0 failed, in node and deno. firefox and webkit NOT RUN |
| conformity reader | **RAN** | F1-F9; ONE code defect (F1), acted on below |
| adequacy reader | **RAN** | 42 mutations of its own: 36 killed, 1 equivalent, **3 survivors** (M21, M33, T3); acted on below |
| overlap | | **2 shared subjects**: (i) the remembered-declaration WeakMap — conformity F1 and the adequacy reader's mutations around it; (ii) `Transform`'s instance taking pool options — conformity F3 and the adequacy reader's built-in road |
| **`gate:item`, the confirming run** | **RAN, `GATE:ITEM EXIT=0`** | ONE command on the final tree, held still, after the readers' items (this Record written before it, but for this row and the Status line): the ladder — `check:spec` 7 / 75 / 135 rules, `check:docs` 42 snippets (36 run, 6 check), L1-L5 **62 files / 1747 cases** in node 24.20.0, deno 2.9.6 and chromium (+5 since the first gate: the readers' five cases), L6 **2646 assertions**, 0 failed, in node and deno — then the self-tests less `check:register:selftest`: **10/10 completed, 10 ok**, 870.9 s self-test wall. `gate:full` NOT RUN and not owed (W167 is P37's last item) |

**What was done for each finding.** Every expected value is from the spec's tables, ADR 0099 or P37's decisions, never
from the code's output.

| | finding | done |
|---|---|---|
| C-F1 | `DECLARATIONS` remembered the bare declaration, not the one `over` was merged into — a definition made with instance options and registered as a type lost them under a named instance (ADR 0099 rule 2) | **fixed**: `registry.ts` remembers `{ ...decl, pool: declaredPool }` when `over` is given; a case pins it (`idleTimeout` kept under an instance overriding `maxThreads`) |
| C-F2 | `AGENTS.md` section 21 said a named instance carries only `type` and `config` | **fixed**: it carries `pool` too, and reaches `residentGroups` (Q626); `inline` and `groups` still unreachable (Q457) |
| C-F3 | a `Transform` instance can now hold a RESIDENT group, against ADR 0075 rule 3's closing note and Q457's title, stated nowhere | **recorded and RAISED**: ADR 0099 consequence 5; the spec's `pool` row; **[Q626](../questions/q626.md)** (open, owner P37's join; recommendation *accept as stated*); a note line in ADR 0075 and in Q457's `note` (record-step, no substantive edit); a case pins the acceptance, and that `groups` and `inline` are still refused |
| C-F4 | ADR 0099 consequence 3 (a resolved definition is a document type, a copy a class) not in the spec or `AGENTS.md` | **fixed**: said in the spec's `pool` row and in `AGENTS.md` section 13 |
| C-F5 | the class refusal's message wrote *instance\`s* | **fixed** |
| C-F6 | `ResolvedPool.pool` and ADR 0099 consequence 4 said *as declared*; `copyPool` drops `undefined` keys | **fixed**: both say *copied, a key present with `undefined` dropped* |
| C-F7 | `NodeTypeDeclaration`'s comment did not say an instance's `pool` merges over it | **fixed** |
| C-F8 | S11's *Who meets it* omitted a class derivation's output | **fixed**: three roads, all held |
| C-F9 | a `Map` as `pool` passes `isPlainObject`; a function is reported *got undefined* — pre-existing, shared with a type's `pool` | **NOT fixed — Out** (below): the type's road has had it since v0.19, and changing it there moves a refusal no P37 decision names |
| A-A1 | no test pinned `ResolvedPool.definition === ` the TYPE's; the build's K24 bundled that swap with dropping `pool`, so its *28 of 28* overstated what was killed | **case added**, with and without instance options; K25 (the swap alone) now KILLED. *The build's 28 of 28 was a count over 28 mutations of which one was compound — the swap alone was not shown killed until now.* |
| A-A2 | a class instance with a non-object `pool` untested; moving the class check after the shape checks survived | **case added**: `4`, `[1]`, `null`, `'big'`, an undeclared key, a malformed value — each `UndeclaredKey` naming CLASS; K26 KILLED |
| A-A3 | `PoolInstance.pool` weakened to `unknown` typechecked | **a `// @ts-expect-error` line** on `{ type: 'T', pool: { requeueFailedTasks: true } }` in the W165 suite; K28 KILLED by `typecheck` (TS2578, the unused directive) |

**The provocations, re-run after the readers' items** (workflow section 5 rule 8; in the byte copy synced from the real
tree and compared clean by `diff -rq`; harnesses `C:/tmp-w165/mutate2.mjs` and `mutate3.mjs`, NOT in the tree): the
no-edit CONTROL **EXIT 0**; **32 of 32 KILLED** — the build's 28 (K15 re-anchored to the changed line and run as K15b)
and four from the readers: K25 (A1), K26 (A2), K27 the bare declaration remembered (F1), K28 (A3, by `typecheck`).

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `registry.ts`: `POOL_INSTANCE_KEYS`, the instance's `pool` held on both roads, the merged identity derivation, `residentGroups` copied, the flush bound | `src/definition/registry.ts` | the W165 suite and W141's four new sites (K1-K15, K18-K27) |
| (2) `types.ts`: `PoolInstance.pool?`, `Pools`, `ResolvedPool.pool?` | `src/definition/types.ts` | `typecheck` (K28); the per-key cases (K18) |
| (3) `bootstrap.ts` passes the instance's `pool` | `src/scheduler/bootstrap.ts` | the W165 bootstrap suite (K16) |
| E1 `runtime.ts` carries it to `bootstrap` | `src/scheduler/runtime.ts` | the `createRuntime` case (K17) |
| (4) spec v0.37 and its README row | | the instance-table case both ways, the rows case (T1, T2); `check:spec` `C8` |
| (5) ADR 0099 | | `check:register` `R6`-`R7` |
| (6) S11 | | nothing mechanical — the readers |
| (7) `AGENTS.md` | | `check:docs` `X3`/`X4` on the block (A1, A2); the prose — the readers |
| (8) L1 tests and the census | | `l4-corpus`'s suite census |

**`git diff --name-only` against `Owns`**, on the final tree: 12 modified and 3 new files — `src/definition/registry.ts`,
`src/definition/types.ts`, `src/scheduler/bootstrap.ts`, `spec/flow-definition.md`, `spec/README.md`,
`test/definition/registry.test.ts`, `test/scheduler/bootstrap.test.ts`, `test/definition/l4-corpus.test.ts`, `AGENTS.md`,
`doc/scheduler-upstream.md` (Owns); `src/scheduler/runtime.ts` (**E1**); `doc/decisions/0054-*`, `doc/decisions/0075-*`
(note lines) and `doc/questions/q457.md` (its `note`) — the record step; new `doc/decisions/0099-*` (Owns),
`doc/questions/q626.md` (record step) and this file. `scripts/check-docs.mjs` is in the row and is not edited. Nothing is
undeclared.

**Predictions, as measured.** P37 prediction 5 **TRUE** (M2): no pool option a registry without instance options builds
moved, P18 fact 5's captures are unedited and green, and the `residentGroups` copy broke no assertion.

**What broke.**

1. **A remembered declaration that was not the one applied** (C-F1): the WeakMap that tells a resolved document type from a
   class stored the input, not the merged pool — an identity question asked of the wrong object. No build provocation
   reached the code road that registers a definition made with `over`.
2. **A compound provocation counted as one kill** (A-A1): K24 swapped the definition AND dropped `pool`, so the second
   half killed it; the swap alone survived. Workflow section 5 rule 8's *each under the SAME CLAIM* — one claim per
   mutation — was not followed.
3. **A consequence nobody decided reached by a reading** (C-F3): counting `Transform` as a document type was this item's
   reading of (e), and it opened a road ADR 0075 said was closed. Raised as Q626 rather than decided here.

**What this taught.** Nothing proposed here; the retro decides.

**Questions.** Raised: **Q626**. Closed: none. **Q627-Q629 released unused.** ADR 0099 issued; S11 written, NOT RAISED.
**Exceptions**: **E1**, `src/scheduler/runtime.ts` — one line, its type annotation and a comment; granted by the
maintainer 2026-10-16 before the edit. The three `doc/scheduler-upstream.md` touches beyond S11's section — accepted by
the maintainer as within *S11 only*.
