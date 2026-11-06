# P46 — What may a registry document declare of the scheduler's admission rework, and does a type's worker see which unit it holds?

**Status:** complete and retro'd 2026-11-06 — W224-W226 done; `gate:full` on W226's final tree (the Record); the retro raises THREE stop-and-asks (section 8 (a)-(c)); answered 2026-11-06: (b) b1, (c) commit, bump and push — publish awaiting the maintainer; (a) OPEN. Earlier: declared 2026-11-05 on `fd6227f` (the tree clean, `main` at 0.13.0, tagged `v0.13.0`,
`origin/main` = `fd6227f`), answering fyflow-app's *pass 7* #1-#5 and the scheduler's 0.7.0 release; facts 1-9 MEASURED at
this declaration in a byte copy; the evaluation's stop-and-asks (a)-(h) ANSWERED by the maintainer 2026-11-05, *"All as
recommended"*.
**Question this plan answers:** *with `fyflow-scheduler` 0.7.0 as the peer, may a registry document declare a `UnitGroup`, a
`KeyedConcurrentLimitGroup` and a resident unit request — each refused at `createRuntime` where the scheduler would throw
later — and does a type's worker, behind the envelope, see the units it was granted, resident and per task?*
**Exit artifact:** *on the final tree: (1) both pins at 0.7.0 and the whole ladder green on them, with every claim 0.7.0
makes false corrected; (2) an L1 suite holding the two new built-in group types' configs and factories, the resident
request's every refusal (`DerivationRefused`, naming the pool and the group), `FD-R6` / `LimitKeyMissing` and the Q619
refusal extended to `KeyedConcurrentLimitGroup`, every expected verdict derived from the scheduler's `AGENTS.md` at the pin;
(3) one block in `examples/l6.ts`, green in node 24 and deno, in which a type's worker reads `workerContext.grants` and
`context.grants` from a document-declared `UnitGroup` on a threaded and an inline pool and on a named instance pinned by
`from`, and a task's `units` set by `createTask` reaches the group, each beside its control; and `npm run gate:full` EXIT 0
— the LAST item runs it (workflow v0.29).*
**Reserves:** W224-W227 (W224-W226 issued; W227 SKIPPED, unissued), Q799-Q808 (all SPENT, unissued), ADR 0143-0144 (ADR 0143 issued; ADR 0144 SKIPPED); no S id

```
Question: what may a registry document declare of the scheduler's admission rework, and does a type's worker see its units?
Items:    W224 (#1 the pin moves to 0.7.0; D7 learns this library's own version; the claims 0.7.0 makes false),
          W225 (#2, #3, #5 — UnitGroup and KeyedConcurrentLimitGroup as built-ins, a resident unit request; ADR 0143),
          W226 (#4 — grants reach a type's worker on real workers; AGENTS.md; the reply; P46's Record and retro)
Reserves: W224-W227, Q799-Q808, ADR 0143-0144
Raises:   no question at this declaration; no S entry
Baseline: `npm run state` at this declaration — P46, W224, Q799, ADR 0143, from the tree and from the ledger, which AGREE
Measured: in a byte copy of `fd6227f` (`git archive` into C:/tmp-p46/m, node_modules copied, zero links), node 24 and deno;
          the scheduler's 0.6.0 and 0.7.0 npm tarballs unpacked into C:/tmp-p46/pkg
```

## Why this plan, and why now

`fyflow-scheduler` 0.7.0 was published on 2026-11-05 (npm and JSR). It reworks admission: concurrency limits become hard
caps, a resident waiter is woken by a release rather than a heartbeat — which fixes the stall fyflow-app hits today, a task
waiting on a resident group never started once the worker holding it idled out (fact 5) — and it adds two group types,
`UnitGroup` (units with names, granted to the work) and `KeyedConcurrentLimitGroup` (a concurrency limit per key). Our
`peerDependencies` pins 0.6.0 exactly, so the app cannot take the fix without a release of ours (#1, P1). The app's Host
wants to declare a card-per-worker `gpu` group as data (#3), pin a pool to particular cards (#2), and needs its Python
Worker bridge — a type's worker, behind our envelope — to read which card it holds (#4). #5 is a nice-to-have for a per-disk
limit.

## What fyflow-app asked, held against this declaration

Read at `../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass7.md` (read, not edited; its own
status line *drafted, not sent*).

| the app's item | answer at this declaration | item |
|---|---|---|
| #1 the new scheduler as the peer; re-measure `residentGroups` beside `idleTimeout: 0` | accepted; the refusal STAYS, re-measured (fact 6) | W224 |
| #2 a unit request in `residentGroups` | accepted, decision 4 | W225 |
| #3 `UnitGroup` built-in | accepted, decision 3 | W225 |
| #4 grants reach a type's worker; `units` survives `createTask` | accepted: confirmed on real workers and documented, decision 6 | W226 |
| #5 `KeyedConcurrentLimitGroup` built-in, held to the keyed rules | accepted, decision 5 | W225 |

## Facts read at this declaration

| # | fact | measured |
|---|---|---|
| 1 | 0.7.0 on both registries | npm `time` 2026-11-05T17:20:27Z; JSR `latest` 0.7.0, created 2026-11-05T17:18:37Z |
| 2 | the copy at 0.7.0 | both pins at 0.7.0 and `PIN`; `npm install` EXIT 0, zero links; `deno check --min-dep-age=0 index.ts src/` EXIT 0, `deno.lock` holding ONE JSR entry `@fyflow/scheduler@0.7.0`, integrity `2794c531…c2ee9bd` — W157's lock shape |
| 3 | the ladder at 0.7.0 | `npm run gate` EXIT 1 at `check:scheduler` alone: **D7** on `spec/flow-definition.md:52`, `spec/README.md:26`, `spec/run-state.md:621` — each names THIS library's own 0.7.0 (the Q619 break; the `stopped` checkpoint kind) on a line that also says *scheduler*. Every other lane run singly: `lint`, `typecheck`, `check:policies`…`check:register`, `test`, `test:deno`, `test:browser` (parity 2321), `test:l6`, `test:l6:deno` — **all EXIT 0**. Nothing behavioural moved |
| 4 | the scheduler's reference, 0.6.0 → 0.7.0 | `AGENTS.md` 61,295 → 82,987 bytes. §1: concurrency limits are HARD CAPS; a rate group caps starts. §4: `grants` on `workerContext` (set before the constructor) and on a task's `context` (per attempt; frozen; `{}` when none). §5: `units` on a task; `residentGroups` value `{ cost?, from?, prefer? }`; `UnitGroup(units, { id?, requestFrom? })`; `KeyedConcurrentLimitGroup(limit, { id?, keyFrom?, limitFor? })`, rejected resident at construction; costs positive integers no larger than the group's limit. §6: `superseded` no longer emitted; `migrated` and `failed` new `unblocked` reasons; `getAdmissionQueue()` lists every waiter |
| 5 | the app's resident stall | scratch probe, two inline pools sharing a resident `ConcurrentLimitGroup(1)`, both `idleTimeout: 100`: **0.6.0 — the second pool's task still waiting after 3 s; 0.7.0 — done** |
| 6 | `registry.ts:515`'s refusal re-measured | the same probe with the holder at `idleTimeout: 0`: the second pool's task still waiting after 3 s on **0.7.0** as on 0.6.0, `getAdmissionQueue()` listing it at position 0. The refusal stays; its *measured on* clause is re-dated to this plan |
| 7 | the schema subset | `type` may be a list (`['integer', 'array']`); no `uniqueItems`, no `oneOf`, `additionalProperties` boolean only — so *distinct units* and *each per-key limit a positive integer* are checks beside the schema, not in it |
| 8 | the envelope | `src/scheduler/envelope-worker.ts:315` constructs the inner worker with the envelope's own `workerContext`; `:372` hands `run` the task's `context` untouched — so both grants SHOULD reach a type's worker; nothing tests it |
| 9 | false at 0.7.0 in this tree | `CLAUDE.md:268` and `doc/concept.md:108`: *groups are optimistic … nothing is a hard cap*; `doc/concept.md:81`'s `unblocked` reasons |

## Scope

**In** — the pin (#1), the two built-in group types and the resident request (#2, #3, #5), grants reaching a type's worker
and `units` through `createTask` on real workers (#4), the reply, the release's preparation.

**Out** — a unit request from a flow or a node (the app's own *not asking*; Q248's counterpart for `limitKey`);
`requestFrom` / `keyFrom` as data (a function, and the task's request comes from `createTask`); folding `resource.*`
events (we fold none); the version bump and the publish (the maintainer's word).

## Decisions taken at this declaration

1. **The peer is 0.7.0, exactly** ((a)). Both pins, both locks, `PIN`; BREAKING only in that a consumer moves the scheduler
   with us; documents unchanged; no `CHECKPOINT_FORMAT` move. Intended as **0.14.0**, released only when the maintainer
   says so.
2. **D7 skips a version written as THIS library's** ((f)): an occurrence qualified as `orchestration <v>` (or
   `fyflow-orchestration@<v>`) is not the pin's token; the three lines of fact 3 say so. A probe proves a qualified
   occurrence does not hide a bare one on the same line, and a META entry disables the exemption.
3. **`UnitGroup` is a fourth built-in group type** ((c)): config `{ "units": n }` (an integer >= 1, units `0..n-1`) or
   `{ "units": ["gpu0", …] }` (non-empty, non-empty strings, distinct — a repeat refused `GroupConfigRefused` beside the
   schema). Its factory builds `new UnitGroup(units, { id: key })`; no `requestFrom` in a document.
4. **A `residentGroups` record value may be a cost or a request `{ cost?, from?, prefer? }`** ((b)). `poolSpecProblem` holds
   its shape: a cost a positive INTEGER — **also for a plain cost, where `1.5` was accepted until now**, a change in what
   is accepted that refuses only what the scheduler throws on at construction — `from` / `prefer` non-empty lists of
   distinct ids (strings, or integers for a counted group), no other key. `resolveRegistry` holds it against the GROUP,
   after every pool is derived, as `DerivationRefused` naming the pool and the group: against a built-in `UnitGroup`'s
   declared units — an id it lacks, a cost above `from`'s size or above its unit count; `from` / `prefer` naming a group of
   the other built-in types, which take no request (`{ cost }` alone is fine for any group); a CODE group type's request
   is handed on, and the scheduler's `checkRequest` holds it at construction. `copyResident` copies a request deeply.
5. **`KeyedConcurrentLimitGroup` is a fifth built-in** ((d)): config `{ "limit": n, "limits"?: { key: n } }`, the factory's
   `limitFor` reading `limits[key] ?? limit`, each value a positive integer (checked beside the schema). Held to
   `KeyedRateLimitGroup`'s rules: `FD-R6` / `LimitKeyMissing` for a node reaching it with no `createTask`, and the Q619
   refusal when held resident.
6. **#4 is confirmed on real workers, not argued** ((h)): an L6 block in which a TYPE's worker reads
   `workerContext.grants` and `context.grants` from a document-declared `UnitGroup` — threaded, inline, a named instance
   pinned by `from` — and a task's `units` set by `createTask` pins it; `AGENTS.md` says where a type's worker reads both.
7. **One ADR, W225's ADR 0143** ((e)): *the scheduler's `UnitGroup` and `KeyedConcurrentLimitGroup` are built-in group
   types, and a resident request is checked against a built-in group's declared config*; `spec/flow-definition.md`
   section 3 changes first.

### Stop-and-asks — (a)-(h) ANSWERED by the maintainer, 2026-11-05, *"All as recommended"*

| | the question | answered |
|---|---|---|
| **(a)** | the release | one plan; 0.14.0, BREAKING only by the peer; no format move; released on the maintainer's word |
| **(b)** | #2's shape | decision 4 |
| **(c)** | #3's config | decision 3 |
| **(d)** | #5's config and rules | decision 5, taken now rather than deferred |
| **(e)** | the ADR | decision 7 |
| **(f)** | D7's collision | decision 2 — the exemption with its probe, not a rewording alone |
| **(g)** | the claims 0.7.0 makes false | W224: `CLAUDE.md`, `doc/concept.md`, the `resource.*` notes, the refusal's *measured on* clause |
| **(h)** | the items | W224, W225, W226, serial, each authored by a subagent and read by two more (P44's (f1) carried) |

## Work items

| Id | Item | Owns | Depends on | Gate |
|---|---|---|---|---|
| [W224](../work-items/w224-the-pin-moves-to-0-7-0.md) | the pin moves to 0.7.0; D7 learns this library's own version; the claims 0.7.0 makes false | `package.json`, `package-lock.json`, `deno.json`, `deno.lock`, `examples/deno-import-map.json`, `scripts/check-scheduler*.mjs`, `CLAUDE.md` (the scheduler facts), `doc/concept.md`, `doc/scheduler-upstream.md`, the three spec lines of fact 3, `src/definition/registry.ts` (the refusal's message only) | nothing | `gate:item` |
| [W225](../work-items/w225-unit-and-keyed-concurrent-groups-and-a-resident-request.md) | `UnitGroup`, `KeyedConcurrentLimitGroup`, a resident unit request; ADR 0143 | `spec/flow-definition.md` section 3, `src/definition/registry.ts`, `src/definition/types.ts`, `src/scheduler/runtime.ts`, `test/definition/**`, `test/scheduler/**`, `AGENTS.md` sections 12-13 | W224 | `gate:item` |
| [W226](../work-items/w226-grants-reach-a-types-worker-the-reply-and-p46s-close.md) | grants reach a type's worker on real workers; `AGENTS.md`; the reply; P46's Record and retro | `examples/l6.ts`, `examples/README.md`, `AGENTS.md` section 13's worker paragraph, the reply file | W225 | `gate:full` |

## Predictions, written before the items that test them

1. **W224 moves no L1-L6 case** in any runtime (fact 3) — only `check:scheduler` and its self-test move.
2. **W225 moves no existing case's verdict** except where a test asserts the built-in group types' list or a non-integer
   cost — at most three.
3. **W226 moves `examples/l6.ts` by its block alone**, and no existing L6 row.

## Open questions this plan carries

None at declaration. Q799-Q808 are reserved, two per item and four spare.

## Ids

`npm run state` on `fd6227f`: P46, W224, Q799, ADR 0143, from the tree and from the ledger, which AGREE. **Reserved here**:
W224-W227 (W227 expected unused), Q799-Q808, ADR 0143-0144 (ADR 0144 expected unused). No S id; the next is S13.

## Record

*Written 2026-11-05 by W226's author over W226's tree, and brought up to date on 2026-11-06 after W226's readers — the
orchestrator fills `gate:full`'s cells on the final tree. Every figure is read from the three items'
own files, or measured by W226 and named so. Nothing is committed: W224, W225 and W226 sit uncommitted on `fd6227f`.
Ids are bare text, as in P33's-P45's Records.*

**The items.** Each row is its own file's Record, which covers its declaration step, its provocations and its readers.

| item | built | spec | closed / raised | exceptions and rulings | the readers | L1-L5 / L6 after | confirming gate |
|---|---|---|---|---|---|---|---|
| **W224** uncommitted | both pins at 0.7.0 (`package.json` dev and peer exact, `deno.json`, the import map, `PIN`; `package-lock.json` by `npm install`, `deno.lock` written once, ONE JSR entry, P46 fact 2's integrity); `D7` skips an occurrence qualified as this library's (`orchestration <v>`, `fyflow-orchestration@<v>`), three probes and three META entries (`MIN_PROBES` 59, `MIN_META` 60); every undated claim 0.7.0 makes false corrected (hard caps, the `unblocked` reasons, `cancelled`'s date, *`stats` reporting idle*); the `idleTimeout: 0` refusal re-dated to P46 fact 6; undated line citations into the scheduler re-taken at 0.7.0 (the census) | none moves a rule; three lines reworded (fact 3) | — / — ; F6 closed in place (rule 6) | E-a, E-b, E-b+, E-c, E-d and (g), each granted under (f1) and recorded before its edit | conformity 3 SHOULD, 3 NIT; adequacy about 45 mutations, 2 SHOULD and 3 NIT survivors (A1, A2 closed by a probe each). **Overlap 1** | 106 / 2321; 2905 / 268 — **unmoved** | `gate:item` EXIT 0, 10/10, 1,340.7 s |
| **W225** uncommitted | `UnitGroup` and `KeyedConcurrentLimitGroup` built-ins, their configs and factories, distinct units and per-key limits `GroupConfigRefused` beside the schema; a resident value a positive-INTEGER cost or `{ cost?, from?, prefer? }`; a cost and a request held against the GROUP after every pool is derived (`DerivationRefused`, naming the pool and the group); `copyResident` deep; `FD-R6` / `LimitKeyMissing` and the Q619 refusal widened to `KeyedConcurrentLimitGroup`; ADR 0143; `AGENTS.md` sections 9, 12-13, one `run` snippet, `RUN_FLOOR` 56 | flow-definition **v0.56**; runtime-targets **v0.15** (F8) | — / — ; one occurrence appended to Q599 | six rows, each granted under (f1) and recorded before its edit; `examples/l6.ts:6964` left to W226 | conformity 3 SHOULD, 5 NIT; adequacy 76 run, 72 caught, 4 survived — three detailed (1 SHOULD, A1, closed; 2 equivalent), the fourth not itemised in the report. **Overlap 0** | 106 / **2334**; 2905 / 268 | `gate:item` EXIT 0 on its FOURTH run (run 1 `check:docs:selftest`, fixed; runs 2-3 one L6 row each of Q599's class, not W225's), 10/10, 1,343.5 s |
| **W226** uncommitted | the `W226 exit` L6 block — a document-declared `UnitGroup(['u0','u1'])` and a type's worker reporting `workerContext.grants` (constructor, `setup()`, `run()`) and `context.grants`, threaded and inline: a resident `{ gpu: 1 }` pool's two workers, held together by a barrier, holding `u0` and `u1` as a set with each task reading its worker's, beside a `ConcurrentLimitGroup` control reading `{}`; a named instance pinned `from: ['u1']` holding `u1`, beside `{ gpu: 1 }` holding `u0`; `units` set by `createTask` granting `u1`, beside no `units` granting `u0` — and, after the readers (F1/A1), a task holding `gpu` resident from `u0` AND per task asking `u1` reading its own `u1` — the scheduler's *its own winning on a clash* — beside the same without the task-held hold reading `u0`; `context.grants` asserted frozen — eighteen claims, sixteen runs; the construction sweep's group classes three → five; `examples/README.md`'s copies; `AGENTS.md` section 13's *Which UNITS your worker holds* and its `run` snippet, `RUN_FLOOR` 57; the reply | none moves a rule; `spec/flow-definition.md`'s `idleTimeout: 0` sentence re-dated (F2), no version bump | — / — | three, each granted under (f1): `scripts/check-docs.mjs`'s `RUN_FLOOR`; `spec/flow-definition.md:2155-2158` (F2); W225's Record, a correction (F5) | conformity 2 SHOULD, 5 NIT; adequacy about 22 mutations, 2 SHOULD and 2 NIT survivors — A2 (`from` vs `prefer`) a STATED survivor, the other three closed. **Overlap 1** (the clash) | 106 / 2334; **2923 / 284** | `gate` EXIT 0 after the readers (W226's Record); **`gate:full`** — *the orchestrator's* |

**No question raised or closed by the plan's items** (Q799-Q808 unused); one occurrence appended to Q599 (W225).

### The exit artifact, measured

| the exit sentence's clause | what was built and measured | verdict |
|---|---|---|
| (1) both pins at 0.7.0 and the whole ladder green on them, with every claim 0.7.0 makes false corrected | W224: both pins, both locks, `PIN`; `gate:item` EXIT 0 on 0.7.0 with L1-L6 UNMOVED (P46 prediction 1); the claims corrected, one of them (`AGENTS.md`'s *the current pin adds a sixth task state*) found by the conformity reader rather than the item's search | **met** |
| (2) an L1 suite holding the two new group types' configs and factories, the resident request's every refusal naming the pool and the group, `FD-R6` / `LimitKeyMissing` and Q619 extended, every verdict from the scheduler's `AGENTS.md` at the pin | W225: registry W225 cases 1-8 and runtime W225 cases 1-4 — 19 verdicts agreeing with a real `WorkerManager` + `FyflowScheduler` built from the scheduler's own classes, plus 5 STRICTER rows; 24 of 24 rule-8 probes red, 5 of 5 after the readers | **met** |
| (3) one L6 block, node 24 and deno: a type's worker reads `workerContext.grants` and `context.grants` from a document-declared `UnitGroup` on a threaded and an inline pool and on a named instance pinned by `from`, and a task's `units` set by `createTask` reaches the group, each beside its control | W226: the `W226 exit` block, **2923 / 284, 0 failed** in node 24 and in deno (W226's Record); each claim beside its control; a request `from: ['u1']` reaches the scheduler and is granted `u1` — `from` NOT told apart from `prefer` (A2, a stated survivor: the difference is the scheduler's); every expected value from the scheduler's `AGENTS.md` §4-5 at 0.7.0, written in the block's comment | **met** |
| `npm run gate:full` EXIT 0 — the LAST item runs it | **`GATE:FULL EXIT=0`** 2026-11-06, by the orchestrator, on the final tree after the retro — L6 2923 assertions / 0 failed in node and deno, selftests 11/11 ok across 10 lanes, 4391.5 s wall for the self-tests (log `C:/tmp-p46/p46-gatefull.log`) | **met** |

**The counts across the plan**, each from the items' gate tables: L1-L5 **106 / 2321 → 106 / 2334** in node, deno and
chromium; L6 **2905 / 268 → 2923 / 284** in node and deno; `check:docs` `RUN_FLOOR` **55 → 57**; `check:scheduler`
`MIN_PROBES` 56 → 59, `MIN_META` 57 → 60; spec/flow-definition **v0.55 → v0.56**, spec/runtime-targets **v0.14 → v0.15**;
**`CHECKPOINT_FORMAT` 2, unmoved**; the peer **0.6.0 → 0.7.0, exactly** — **intended as 0.14.0**, BREAKING only by the
peer (decision 1), not bumped and not released.

**Predictions, scored against the items' Records.**

| | prediction | verdict | evidence |
|---|---|---|---|
| 1 | W224 moves no L1-L6 case in any runtime — only `check:scheduler` and its self-test move | **HOLDS** | W224 Record: 106 / 2321 and 2905 / 268 unmoved |
| 2 | W225 moves no existing case's verdict except where a test asserts the built-in group types' list or a non-integer cost — at most three | **HOLDS at ONE** — the W165 fixture's group `k`, by W225's decision 1 (a plain cost above a built-in group's limit), a reason the prediction did not name | W225 Record, decision 1 |
| 3 | W226 moves `examples/l6.ts` by its block alone, and no existing L6 row | **HOLDS** — 2905 / 268 → 2923 / 284, +18 cross-row and +16 runs, all the block's (2919 / 280 before the readers); no `EXPECTED` row, pair row or other block moved. The construction sweep's regex widened to the five group classes, which moved no verdict | W226 Record |

**Handed on**, each with its owner:

| hand-off | from | owner | where it is recorded |
|---|---|---|---|
| **0.14.0** — the version bump, the commits, the push and the publish to npm and JSR | decision 1, (a) | **the maintainer** — *only when the maintainer says so* | this Record; the reply's status line |
| `gate:full` on the final tree | workflow v0.29 | **the orchestrator** | W226's Record |
| `X4`'s static clause counting ANY `throw` as a snippet's assertion (W226's A4) | W226's adequacy reader | **the orchestrator** — the retro | W226's Record |
| the reply to fyflow-app | #1-#5 | **written** — W226; sending it is the maintainer's | `../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass7.reply.md` |
| a unit request from a flow or a node; `requestFrom` / `keyFrom` as data | P46 Out | not asked for | ADR 0143 consequence 4 |
| the byte copies `C:/tmp-p46/m`, `C:/tmp-p46/pkg`, `C:/tmp-p46/jsr*` and the logs | every item | **the maintainer** — left in place, outside the repository | each item's Record |

*The Retro is the orchestrator's.*

## Retro

*Written 2026-11-06 by the orchestrator over the final tree, before its `gate:full` (section 6 pass 3). Every figure is
read from the three items' own files.*

### 1. The asks

fyflow-app's pass 7 #1-#5 are all answered **accepted** (the reply's Summary). The maintainer's (a)-(h) were taken
*as recommended*; every minor ruling after them was taken by the orchestrator under (f1) and recorded in the item's
Exceptions table before its edit — six in W224 (E-a, E-b, E-b+, E-c, E-d and the (g) row), six in W225, three in W226.
**One stop-and-ask went to the maintainer mid-plan** — W225's red confirming gates (section 4) — and was overtaken by
the fourth run's EXIT 0 before an answer.

### 2. The readers, and the overlap

| item | conformity | adequacy | overlap |
|---|---|---|---|
| W224 | 3 SHOULD, 3 NIT | ~45 mutations; 2 SHOULD, 3 NIT survivors | **1** — `D7`'s exemption hole |
| W225 | 3 SHOULD, 5 NIT | 76 run, 72 caught; 1 SHOULD, 2 equivalent (one not itemised) | **0** |
| W226 | 2 SHOULD, 5 NIT | ~22 mutations; 2 SHOULD, 2 NIT survivors | **1** — the clash (*its own winning*) |

**Three measurements, 1, 0, 1 — inside the 0-4 band.** The ordinal moves from a hundred and thirty-eight to a hundred
and forty-one. *The briefs differed by construction (spec-first re-derivation against mutation), and the one shared
subject each time was a CLAUSE of the scheduler's reference both read, not a priming.*

### 3. What the readers found that the authors did not, by rung (pass 3 rule 5)

| defect | found by | the rung that should have caught it |
|---|---|---|
| `AGENTS.md`'s *the current pin adds a sixth task state* (W224 F1) | conformity | **none** — prose about the scheduler; the 45th refusal below |
| a META entry graded only by the corpus, red at the NEXT pin move (W224 F3) | conformity | **none until the next bump** — a self-test that is green today and fails by construction later |
| the `fyflow-orchestration@` alternative graded by nothing (W224 A1) | adequacy | `check:scheduler:selftest` — closed by a probe |
| *stricter than the scheduler, twice* — measured five (W225 F1) | conformity, by construction against a real scheduler | **none** — a count in prose; closed by three test rows |
| the Q619 refusal not pinned to fire FIRST (W225 A1) | adequacy | L1 — closed by two fixtures |
| a snippet ending a function in `throw` breaks `check:docs:selftest`'s deletion probe (W225 `gate:item` run 1) | the confirming gate | `check:docs:selftest` — **it did catch it, in the item's confirming gate**, which `npm run gate` does not run |
| *its own winning on a clash* neither documented nor tested (W226 F1/A1) | both | L6 — closed by a claim and its control |
| `X4`'s static clause satisfied by ANY `throw` in a snippet (W226 A4) | adequacy | `check:docs:selftest` — **a hole in the check, not in the item**; section 7 (b) |

### 4. Rules followed that failed (pass 3 rule 3)

1. **A confirming gate red for no item's reason — twice, on two Q599 rows** (W225 runs 2 and 3: `W218 exit (threaded)`'s
   arranged premise; `uncloneable / OR-R6, threaded` at its 400 ms backstop), while another project's Tauri build and
   Vite servers shared the machine; five `test:l6` runs alone between them, all green, and the fourth `gate:item`
   green. Section 4's *do not start one over a tree with a known red lane* was followed and cost two ~22-minute gates.
   **Q599's return condition — *the first confirming gate one of them turns red* — is met**; section 8 (a).
2. **An author's "done" report that had not done it** (W224, after E-a and E-b were granted: the resumed author stopped
   after two tool calls and the orchestrator's `git status` found nothing applied). One occurrence; pass 3 rule 2's bar
   is not met. *Recorded, not adopted.*

### 5. The scheduler

0.7.0 is adopted as the peer. S10 still stands at 0.7.0 (W224 re-read; W224's conformity reader RAN it). S11 and S12 were
not re-read. Nothing raised in `doc/scheduler-upstream.md`; the next S id is S13.

### 6. Proposals (pass 3 rule 4)

**None adopted.** The two candidates are section 8's — each a fix with one decision, rule 6, not a rule.

### 7. Refusals, and what this retro changed

- **A check over `doc/` — considered and NOT proposed; it is the 45th refusal, P2-P46.** P46's prose defects (W224 F1,
  W225 F1-F3, W226 F1/F2) were each found by a reader with the scheduler's reference beside the text. **No other ledger
  row is re-raised.**

| file | why |
|---|---|
| this plan | the Status line; this Retro |
| `doc/workflow.md` | section 6 pass 3 rule 7 and P45's precedent: the Status line's count (FORTY-SIX, P1-P46), section 6's ordinal (a hundred and forty-one; the HUNDRED-AND-FORTY-SECOND next), the ledger's first row (45 times, P2-P46) |
| `doc/questions/q599.md` | W225's occurrence (the record step) |

**Ids.**

- **Issued**: W224, W225, W226; ADR 0143; no Q; no S entry.
- **Reserved and unissued, SKIPPED and never reissued** (section 3): W227; Q799-Q808 SPENT (two per item, four spare);
  ADR 0144.

**The next plan starts at W228, Q809 and ADR 0145.** The next S id is S13; the next plan id is P47.

### 8. Stop-and-asks for the maintainer

| | the question | recommended | alternatives |
|---|---|---|---|
| **(a)** | **Q599's return condition is met** — two of its class went red inside W225's confirming gates, under another project's load | **(a1)** Q599 becomes `open` and the next plan touching `examples/l6.ts` carries a small item: each named row's backstop or arrangement widened (OR-R6 threaded's 400 ms; W218's threaded premise; tv-ingest LAST-first; block (2h)), each with rule 8 | **(a2)** stays deferred — re-run on red, as P46 did. **(a3)** an item now, before 0.14.0 |
| **(b)** | **`X4` counts ANY `throw` in a `run` snippet as its assertion** (W226 A4) — a helper's throw hides the assertions' deletion | **(b1)** a small item in the next plan touching `scripts/check-docs.mjs`: `X4`'s deletion probe applied per snippet, or a snippet's helpers excluded | **(b2)** raise a question and leave it |
| **(c)** | **The release** — 0.14.0: commit P46 (three item commits and the plan's), bump, push, publish; send the reply | the maintainer's word, per (a) | — |

**Answered 2026-11-06 by the maintainer**: **(b) b1**, the next plan touching `scripts/check-docs.mjs` carries the item. **(c)**: commit, bump to 0.14.0 and push — YES; publish (the `v0.14.0` tag) waits for a separate word; sending the reply is not yet asked. **(a)** unanswered, OPEN.
