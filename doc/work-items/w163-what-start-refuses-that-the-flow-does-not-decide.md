# W163 — what `start` refuses that the flow does not decide

**Status:** done 2026-10-15 — **`npm run gate:item` EXIT 0** on the final tree, one command; declared 2026-10-15 on
`9769e45`, declaration step RUN the same day in a byte copy; stop-and-ask S1 and exceptions E1 and E2 ASKED at the declaration
step and ANSWERED by the maintainer 2026-10-15, *"as recommended"* — S1 option A, E1 YES, E2 YES — recorded before any edit
outside this file; both reader passes RUN, neither found a code defect; Q619 raised, nothing closed
**Plan:** [P37](../plans/p37-a-runtime-is-its-registry.md) — *what may a running runtime be asked to accept, when its
registry is fixed at `createRuntime`?* — its SECOND item.

```
Spec:       spec/flow-definition.md v0.34 -> v0.35: section 6 gains FD-R6 (a task node REACHING a group the built-in
            KeyedRateLimitGroup factory built, started with no createTask — reported by runtime.check, thrown by start and
            resume as LimitKeyMissing); section 3's "A runtime is its registry" states check's FD-R6 finding, start's
            order (InvalidDefinition first, then LimitKeyMissing when no createTask), and defaultRetryPolicy held to FD-V30
            at createRuntime; the group-types table and section 2's limitKey sentence point at FD-R6. No FD-V id moves and
            none is added — the count stays 42; the rule count moves 134 -> 135.
Owns:       from P37's W163 row: src/scheduler/runtime.ts, spec/flow-definition.md, spec/README.md,
            test/scheduler/runtime.test.ts, test/definition/l4-corpus.test.ts, examples/l6.ts, examples/README.md,
            scripts/check-docs.mjs, AGENTS.md, doc/decisions/0097-*.
            scripts/check-docs.mjs is in the row and is NOT edited: no `run` snippet is added or removed (M5).
            And by the Exceptions below, ANSWERED YES 2026-10-15: src/scheduler/index.ts (E1), src/definition/types.ts (E2).
Inputs:     P37 decisions 5 and 7, facts 1 and 6, stop-and-asks (b) and (c) as answered, prediction 3, sentences B' and C
            and paragraph D; ADR 0096 rules 4 and 5 and consequence 4; W162's Out (the two items handed to W163); Q248;
            the scheduler's AGENTS.md and its key resolution at the pin (`_groupsForTask`, `_resolveResourceKeys`).
Outputs:    (1) runtime.ts: `LimitKeyMissing extends RuntimeError`; `check` = validateDefinition's findings + one FD-R6
                finding per task node reaching a built-in keyed group; openRun throws the non-FD-R6 findings as
                InvalidDefinition (new Driver's message, unchanged), then, with no createTask, the FD-R6 findings as
                LimitKeyMissing — before a run id is minted or a driver built; createRuntime holds defaultRetryPolicy to
                FD-V30 FIRST, as new Driver's InvalidDefinition and message.
            (2) the sub-path exports LimitKeyMissing (E1).
            (3) spec/flow-definition.md v0.35 (above); spec/README.md's row.
            (4) ADR 0097, amending ADR 0096 rules 4 and 5.
            (5) AGENTS.md: section 3's defaultRetryPolicy sentence, section 9's runtime classes (four, LimitKeyMissing),
                section 11's row (a limitKey from the flow: deferred, Q248), section 12's check-then-start paragraph
                (FD-R6, the createTask road, filtering it from check, defaultRetryPolicy at construction).
            (6) L1 tests (below) and their two suites in l4-corpus's LATE_SUITES.
            (7) L6: the keyed block in examples/l6.ts — one run; CROSS_ROW, DECLARED_TOTAL, DECLARED_RUNS,
                CROSS_ROW_SUBJECTS and pairRunCount moved; examples/README.md's two X10 copies and its run tally.
Depends on: W162 (done, 9769e45)
Blocks:     W164
Tests:      L1 test/scheduler/runtime.test.ts — P37 fact 1's three refused roads (the type's pool, the node's
            workerGroups, the keyed node second), each: check returns exactly [FD-R6 at the node] naming the group, both
            roads and Q248; start throws LimitKeyMissing at the node, a RuntimeError and not InvalidDefinition; nothing
            dispatched, the scheduler never subscribed to (no driver), and the next start mints r1 — with a control that
            a start which builds a driver does subscribe. A named instance whose class derivation adds the group is FD-R6
            and the same type's default instance is not. Two nodes reaching it: a finding each, at the first. Controls: a RateLimitGroup (type and node), a keyed group no
            node reaches, a resident-only keyed group, a code group type building a keyed group with a keyFrom (and a
            node reaching it and the built-in one: FD-R6 for the built-in alone). The createTask road on each fact-1 road:
            not refused, the task carries the key, check still reports FD-R6. A definition defect beside FD-R6:
            InvalidDefinition with FD-V32 alone, with and without a createTask, new Driver's message by hand. ORDER:
            FD-R6 before RunIdInUse and ID-R2 (control: with a createTask, RunIdInUse); resume refuses it from the same
            call, no driver built, and resumes with a createTask. defaultRetryPolicy: seven shapes FD-V30 refuses (each
            confirmed refused by new Driver by hand) are InvalidDefinition FD-V30 at createRuntime with new Driver's
            message, nothing built; before a registry defect (control: WorkerMissing alone); a valid one accepted and
            reaching the task. On a REAL scheduler (node and deno; skipped in the browser, RT-R10): no createTask is
            LimitKeyMissing with no task queued; a createTask setting limitKey completes, the group's keys that key; a
            createTask setting none meets the scheduler's own "Missing limit key" throw.
            L6 examples/l6.ts — the keyed block on a THREADED data: worker: check FD-R6 at both nodes (control: nothing on a
            RateLimitGroup), start refused LimitKeyMissing at the entry with no task held, the createTask road under r1
            done completed terminal, both nodes done, every task's limitKey and the group's keys the factory's, the group's
            acquired/released 2/2.
            Expected values from the spec, P37 fact 1's table and the fixtures — FD-V30's message read from new Driver by
            hand — never from the runtime's output.
Gate:       `npm run gate` before the readers (P37 sentence C); then the conformity and adequacy readers, NOT run by this
            item's author; then `npm run gate:item` ONCE on the final tree. The row's clauses: L1 each of fact 1's roads
            refused by name before a driver exists, no run id spent, and the createTask road green; defaultRetryPolicy
            refused at construction; L6 fact 1's createTask road on a real keyed group.
Reserves:   Q619-Q622, ADR 0097
```

*Reserves: `npm run state` on `9769e45` reads the next free ids as **W163, Q615, ADR 0097** from the tree, and W162, Q615,
ADR 0096 from the ledger (P33's Retro) — they DISAGREE because P37 was declared and W162 spent ADR 0096 since that
sentence; P37's own reservation governs. Its W163 row gives this item Q619-Q622 and ADR 0097.*

## Stop-and-ask S1 — how `check` reports the keyed condition — ANSWERED 2026-10-15: A, as recommended

**What the plan settles, read closely.** Stop-and-ask (c)'s answer: *"refuse at `check` and at `start` … when `start` was
given no `createTask`; **`check` reads as `start` with none, so it reports it**."* So `check` takes no `createTask` and needs
none: it ALWAYS reports the condition, and the caller who will pass a `createTask` discards it. That part is decided — an
option on `check` would contradict (c)'s sentence, and (b) refused a second `check` parameter for the payload's one check.

**What the plan does not settle.** `check` returns `Finding[]` — `{ rule, at, detail }` — and every `rule` today is a spec
id (`FD-V…`, from `validateDefinition`). The keyed condition is no `FD-V` rule: `validateDefinition` and `new Driver` never
refuse it, and it is not expressible as an invalid example flow (it depends on the registry and on `createTask`). So what
is its `rule`?

| | option | what it changes |
|---|---|---|
| **A** | **recommended — a new spec rule, `FD-R6`, in `spec/flow-definition.md` section 6 (*Runtime refusals* — "not expressible as an invalid example, so each names the test that must exist")**; `check` returns `{ rule: 'FD-R6', at: <node id>, detail }` per such node; `start`/`resume` throw the non-`FD-R6` findings as `InvalidDefinition` FIRST (unchanged — still exactly `new Driver`'s), then, with no `createTask`, the `FD-R6` ones as `LimitKeyMissing` | a consumer filters by a spec id, `check:spec` holds the id (`C2`, `C6`: declared once, an owner named), rule count 134 -> 135, the `FD-V` count stays 42. `FD-R4` is the precedent for an `FD-R` row that is a rejected command rather than a terminated run |
| B | the class name as the rule — `{ rule: 'LimitKeyMissing', … }`, no spec id | no spec rule; a `rule` value `spec/` does not declare and `check:spec` does not hold, beside forty-two that it does |
| C | `check(flow, { createTask })`, or `check` leaving it out | contradicts (c)'s *"check reads as start with none, so it reports it"* — listed for completeness, not recommended |

**Built in the byte copy as A** (M3-M4) — green on every lane — and **ANSWERED A by the maintainer, 2026-10-15** (*"as
recommended"*, relayed by the coordinator): the copy's files are what the real tree received.

**And a reading the maintainer CONFIRMED with that answer, recorded here and in ADR 0097's Context**: **no upstream fix is
needed, and there is no `doc/scheduler-upstream.md` entry.** The scheduler's throw is the CORRECT behaviour for a keyed
limit with no key — a keyless task would otherwise share one bucket with every other keyless task, or skip the limit.
The gap is OURS: a document cannot supply a key ([Q248](../questions/q248.md)). The later fix is ours too — a
document-declared key derivation handed to the group as its `keyFrom`, which the scheduler already accepts.

## Exceptions — ASKED at the declaration step, ANSWERED YES by the maintainer 2026-10-15, recorded BEFORE the edit

*`doc/workflow.md` section 1 rule 6 and section 7 rule 2. Each is the edit and nothing else; both applied in the byte copy
(M3), where every lane is green.*

| | file | the edit, and nothing else | why, and its precedent | answer |
|---|---|---|---|---|
| **E1** | `src/scheduler/index.ts:10` | `GroupUnusable, RunIdInUse, RuntimeError } from './runtime.ts';` becomes `GroupUnusable, LimitKeyMissing, RunIdInUse, RuntimeError } from './runtime.ts';` | the sub-path's value exports are an explicit list, and (c)'s *"a named `RuntimeError`"* is a class a consumer catches by name — unexported, it is reachable only by `instanceof RuntimeError` plus a message match. `test/scheduler/runtime.test.ts`'s *every value runtime.ts exports is reachable from fyflow-orchestration/scheduler* goes RED without it (that is the binding). The row omitted the file because W162 owned it. **Precedent: W162's E1/E2** (census sites the row omitted, asked, YES). **Alternative**: throw a bare `RuntimeError` and export nothing — no class to catch by. **Recommended: YES** | **YES** 2026-10-15 |
| **E2** | `src/definition/types.ts:860` | the `Finding.rule` doc comment `` /** `FD-V1` … `FD-V46`. Never renumbered, so it is safe to assert on. */ `` becomes `` /** `FD-V1` … `FD-V46` from the validator; `runtime.check` adds `FD-R6` (ADR 0097). Never renumbered, so it is safe to assert on. */ `` | under S1's A, the comment an editor shows on `f.rule` would say `FD-V` only while `check` returns `FD-R6`. A comment; no lane reads it. **Precedent: the same.** **Alternative**: leave it and record it in Out. **Recommended: YES** (moot under S1's B or C) | **YES** 2026-10-15 |
| — | `doc/decisions/0096-*` | **not an exception — the record step's** (`doc/workflow.md` section 1 rule 5): two inline notes, at rule 5 (*amended by ADR 0097 rules 2-4*) and at consequence 4 (*closed by ADR 0097 rule 5*) — W162's precedent at ADR 0022 rule 3 | | — |

## Scope

**In** — Outputs (1)-(7).

**Out** — named rather than left implicit, with where it goes instead

- **A key DERIVED from the flow or the payload** — #17's feature, [Q248](../questions/q248.md), deferred (P37 Scope Out).
- **A `Driver` built by hand** — `FD-R6` reads the runtime's derived pools and which factory built each group; the driver
  sees neither, and `src/driver/**` is no P37 item's (paragraph D). Such a driver still meets the scheduler's throw.
  ADR 0097 consequence 4.
- **A keyed group held as a RESIDENT group** — not one of fact 1's roads: the scheduler resolves keys over a task's
  `workerGroups` and its pool's `groups` only (`_groupsForTask`, at the pin), so it is not `FD-R6`. **MEASURED after the
  readers** (the conformity reader's observation 8), node 24.20.0 and deno 2.9.6, the pool inline and threaded: a built-in
  keyed group held ONLY as resident — `check` `[]`, `start` not refused, `done` `completed`, and the group's keys `[""]`, ONE
  bucket with the empty key for every worker, acquired 1 and released 0 (the worker holds it). The sharing the scheduler's
  throw prevents for a task-held group, silently. Whether to refuse it is **[Q619](../questions/q619.md), raised here,
  owned by P37**.
- **Q248's `note`** (*"waits on an author with a keyed group…"*) is now stale beside ADR 0097 — left to **P37's record
  step**, deliberately, and not edited here (the conformity reader's F7).
- **`check` equal to the L4 validator** — still true of every corpus flow (no corpus registry declares a keyed group,
  prediction 3), and no longer of every flow: ADR 0097 consequence 2.
- **A `createTask` that sets no key** — meets the scheduler's own throw from `addTask`, a run id spent; the factory's to
  own (stop-and-ask (c)), asserted on a real scheduler at L1 and not refused.

## What the declaration step measured before anything was edited

*P15 decision 5 and sentence B′: measured 2026-10-15 in a BYTE COPY of `9769e45` (`git archive` into `C:/tmp-w163/m`,
`node_modules` copied, **zero links** by `find -type l`), node 24.20.0 and deno 2.9.6. The change was built there whole,
under S1's A with E1 and E2 applied, and every lane run.*

| # | fact | measured |
|---|---|---|
| M1 | the baseline, in the copy | `npm run gate` **EXIT 0**: `check:spec` 7 documents / 75 examples / 134 rules; `check:docs` 42 snippets (36 run, 6 check); L1-L5 **62 files / 1695 cases** in node, deno and chromium; L6 **2640 assertions / 173 runs** in node and deno |
| M2 | **P37 prediction 3, measured** — `src/scheduler/runtime.ts` and `index.ts` changed ALONE, every test and example as shipped | `npm run gate` **EXIT 0**, every count unmoved: 1695 cases in all three runtimes, L6 2640 / 173 in both. **No existing assertion moved** — prediction 3 TRUE |
| M3 | the change whole, in the copy | `npm run gate` **EXIT 0** (before E2 and M4's added case): `check:spec` 7 / 75 / **135 rules** (+1, `FD-R6`; the `FD-V` count 42); `check:docs` 42 snippets, 36 run — unmoved; L1-L5 **62 files / 1704 cases** in node, deno and chromium (+9: the two W163 suites); L6 **2646 assertions / 174 runs** in node and deno (+6 cross-row clauses, +1 run). Then E2 applied: `lint` and the five `typecheck` lanes EXIT 0; and M4's added case: node L1-L5 EXIT 0 at **1705** |
| M4 | the author's provocations (rule 8, in the copy, each edit asserted to change its file, each restore digest-checked; harness `C:/tmp-w163/mutate.py`, NOT in the tree) | **L1, node, 16 runs**: the no-edit CONTROL EXIT 0; **15 of 15 mutations KILLED** after one survivor was acted on — M1 `check` the validator only (6 cases red), M2 no `LimitKeyMissing` (3), M3 `createTask` ignored (3), M4 the pool read with `residentGroups` (1), M5 `workerGroups` not read (3), M6 the type's default pool for a named-instance node (1), M7 the pool not read (6), M8 every KEYED group, a code one included (1), M9 `FD-R6` thrown before `InvalidDefinition` (3), M10 `InvalidDefinition` carrying `FD-R6` (1), M11 `defaultRetryPolicy` unchecked at construction (1), M12 checked AFTER the registry (1), M14 the detail without Q248 (1), M15 the keyed refusal after `RunIdInUse` (1); **M13 `at` the LAST node SURVIVED** — every road had one keyed node — and a case with TWO (choice 4) was added, after which M13 is KILLED (1). **L6, node**: CONTROL EXIT 0 at 2646; `check` the validator only, KILLED (3 clauses); no `LimitKeyMissing`, KILLED (2 — the refusal and `r1`: the scheduler's bare throw SPENT the run id, P37 fact 1 reproduced); `createTask` ignored, KILLED (the block crashed and named itself) |
| M5 | the census sites the row names | `spec/README.md`'s row: moved (`C8`). `l4-corpus.test.ts`: two suites added to `LATE_SUITES`. `examples/README.md`'s `X10` copies: moved, 2646 / 174, and its run tally. `scripts/check-docs.mjs` `RUN_FLOOR`: unmoved — no `run` snippet added or removed (AGENTS.md's changes are prose), so `check:docs:selftest` is NOT bound by B′ and was NOT run; no always-read document moves, so `check:budget:selftest` is NOT bound either |

## Choices made inside the declaration and not named by P37

1. **A node REACHES a group through `workerGroups` or its pool's DERIVED `groups`, and not through `residentGroups`** — the
   two sets the scheduler unions for a task (`_groupsForTask`); it resolves no key for a resident group (Out).
2. **"The pool it runs on" is the node's `pool`, else its type's default instance** — the driver's own `workerType`
   (`node.pool ?? node.type`); asserted with a class type whose named instance alone adds the group.
3. **Built-in is read off the DOCUMENT's group type name**, `KeyedRateLimitGroup` — a code group type cannot take that name
   (`NameCollision`) — not off the built object's `keyed` flag, so a keyed code group with a `keyFrom` is never `FD-R6`.
4. **One finding per NODE**, naming every built-in keyed group it reaches, sorted; `LimitKeyMissing.at` is the first such
   node in the flow's `nodes` order, its message every finding.
5. **`defaultRetryPolicy` is checked FIRST in `createRuntime`**, before `resolveRegistry` — an options defect beside a
   registry defect is the policy's refusal; asserted with a control.
6. **The L6 block is outside the `EXPECTED` rows** (W141's shape): its registry declares a keyed group, which the shared
   document must not (every row reaching it would be `FD-R6`, and `runFlow` passes no `createTask`). One run on a
   THREADED `data:` worker; the `RateLimitGroup` control is a `check`, not a run.
7. **`AGENTS.md` section 11 gains a row** — *a `limitKey` from the FLOW*, deferred to Q248 — because section 12's paragraph
   tells a consumer what to do instead, and section 11 is where a reader looks for what does not exist.

## Predictions checked

| P37 prediction | verdict |
|---|---|
| **3** — #17's refusal moves NO existing assertion | **TRUE** (M2): the source change alone, every test as shipped, `npm run gate` EXIT 0 with every count unmoved |

## Verification

`npm run gate` (each rung's exit read on its own line), then the readers, then `npm run gate:item` once. Routing
coverage: none of a branch routed away from its join (Q4), `user_action` (Q17), no matching decision edge (Q10), a
duplicate task id (Q13) or a nested fan-out (Q6) is this item's — it routes nothing; `FD-R6` is refused before a driver
exists, and the L6 run is a two-task sequence.

## Record

**Gate — what ran.** Baseline `9769e45`; every number below is the final tree's.

| Clause | Verdict | Notes |
|---|---|---|
| L0 | **RAN, pass** | `deno lint`, the five `typecheck` lanes |
| the checks | **RAN, pass** | the ladder's twelve; `check:spec` 7 documents / 75 examples / **135 rules** (+1, `FD-R6`; the `FD-V` count 42, unmoved); `check:docs` 42 snippets, 36 run — unmoved |
| L1-L5 | **RAN, pass** | **62 files / 1708 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 1708); firefox and webkit NOT RUN (`test:browser:all` is not on the gate). Baseline 62 / 1695: +13, the two W163 suites — nine cases at the build, the two-node case after M4, three after the readers |
| L6 node 24 | **RAN, pass** | **2646 assertions / 174 real runs**, 0 failed (baseline 2640 / 173): the keyed block, six cross-row clauses and one run |
| L6 deno | **RAN, pass** | **2646 / 174**, 0 failed |
| row clause: L1 each of fact 1's roads refused by name before a driver exists, no run id spent, and the `createTask` road green | **RAN, at L1** | the W163 suite's three-road case, its `createTask`-road case, and the real-scheduler case |
| row clause: `defaultRetryPolicy` refused at construction | **RAN, at L1** | seven refused shapes, each `new Driver`'s message by hand; the order before a registry defect; a valid one accepted |
| row clause: L6 fact 1's `createTask` road on a real keyed group | **RAN** | the keyed block, node and deno: `done` `completed`, both nodes `done`, the group's keys the factory's, acquired / released 2 / 2 |
| `npm run gate`, before the readers | **RAN, `GATE EXIT=0`** | on the real tree: 1705 cases in three runtimes, L6 2646 / 174 in both |
| conformity reader | **RAN** | F1-F7 and observation 8, no code defect; acted on below |
| adequacy reader | **RAN** | F1-F4, no code defect; acted on below |
| overlap | | **1 shared subject**: `FD-R6`'s DETAIL text — the conformity reader's F5 (a backtick for the apostrophe in *scheduler`s*) and the adequacy reader's F4 (the `createTask` road's sentence deletable for zero). Two findings about two halves of one string; counted as ONE, as the coordinator counted it |
| after the readers' items, `npm run gate` | **RAN, `GATE EXIT=0`** | 1708 cases in three runtimes, L6 2646 / 174 in both |
| **`gate:item`, the confirming run** | **RAN, `GATE:ITEM EXIT=0`** | ONE command on the final tree, held still (this Record written before it, but for this row and the Status line): the ladder — 1708 cases in node, deno and chromium, L6 2646 / 174 in both — then the self-tests less `check:register:selftest`: **10/10 lanes completed, 10 ok**, 1212.5 s self-test wall. `gate:full` NOT RUN and not owed (W167 is P37's last item) |

**What was done for each finding.**

| | finding | done |
|---|---|---|
| A-F1 | the task-only guard (`n.kind !== 'task'`) deletable for zero | a case: a consumer GATE type named `Keyed`, a gate node of it beside a keyed task — `check` is `FD-R6` at the task alone. Mutant G1 (guard deleted) KILLED |
| A-F2 | `FD-R6`'s place in `resume` unpinned | a case: a refused header (another flow id) beside a keyed flow and no `createTask` is `ResumeRefused`. Mutant R2 (`FD-R6` refused ahead of `resumeRefusal`) KILLED |
| A-F3 | the `Set` and the `sort` over the named groups unpinned | a case: a pool `['api2', 'api']` is named `"api", "api2"`; one group reached by both roads is named once, in the singular. Mutants S1 (no `Set`) and S2 (no `sort`) KILLED |
| A-F4 / C-F5 | the detail text: the `createTask` road's sentence deletable for zero; *scheduler`s* | `NAMED` now asserts `sets limitKey` and `keyFrom that derives`, phrases only each road's sentence carries — mutant N1 (the road sentence deleted) KILLED; the apostrophe corrected. **The first correction broke the build**: the detail was a single-quoted literal, so *scheduler's* ended it — caught at once by every suite failing to import in the mutation run's CONTROL, before any gate; the literal is now a template string, typecheck EXIT 0 |
| C-F1 | `FD-R4`'s *"the one row of this table whose heading clause does not hold"* false since `FD-R6` | reworded: *one of the TWO rows … (`FD-R6` is the other, since v0.35)* — in v0.35 |
| C-F2 | `AGENTS.md` section 12: *"throwing `InvalidDefinition` with exactly those rules"* included `FD-R6` | *"— every one but `FD-R6`, below —"* |
| C-F3 | ADR 0097 rule 2: *"every keyed group"* | *"every BUILT-IN keyed group"*, as the spec and the code say |
| C-F4 | `AGENTS.md` section 12 named the type's pool and `workerGroups`, not the named-instance road | *"through the pool it runs on — the named instance its `pool` says, else its type's default — or its `workerGroups`"* |
| C-F6 | `examples/l6.ts`'s `CROSS_ROW` comment garbled (*"+6 since W160 — W163"*) | *"+6 since W160's readers, by W163"* |
| C-F7 | Q248's `note` stale beside ADR 0097 | **not edited** — left to P37's record step, and said so in Out |
| C-obs 8 | a built-in keyed group held only as RESIDENT is not `FD-R6`, and the item said *not measured* | **measured** (Out): node and deno, inline and threaded — `check` `[]`, `completed`, keys `[""]`, one bucket for every worker. **Raised as [Q619](../questions/q619.md)**, owned by P37, with options A-D; cited from the spec's `FD-R6` row and ADR 0097 rule 1 |

**The provocations** (rule 8, in the byte copy `C:/tmp-w163/m`, each edit asserted to change its file and each restore
digest-checked; harnesses `C:/tmp-w163/mutate*.py`, NOT in the tree). **At the build** (M4): L1 15 of 15 KILLED after
M13's survivor was acted on, L6 3 of 3 KILLED. **After the readers**, on the copy synced from the final tree: the no-edit
CONTROL EXIT 0; **G1, R2, S1, S2, N1 — 5 of 5 KILLED**, each by exactly the case written for it.

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `LimitKeyMissing`, `check`'s `FD-R6`, `openRun`'s order, `defaultRetryPolicy` at construction | `src/scheduler/runtime.ts` | the W163 suites (M1-M15, G1, R2, S1, S2, N1) |
| (2) the sub-path export (E1) | `src/scheduler/index.ts` | *every value src/scheduler/runtime.ts exports is reachable from fyflow-orchestration/scheduler* |
| (3) spec v0.35 and its README row | | `check:spec` `C2`, `C6` (`FD-R6` declared, an owner), `C8` |
| (4) ADR 0097 | | `check:register` `R6`-`R7` (front matter, `amends`) |
| (5) `AGENTS.md` | | NOTHING mechanical — prose, no snippet added; the readers |
| (6) L1 tests and the census | | `l4-corpus`'s suite census |
| (7) L6 keyed block, counts, `examples/README.md` | | L6 in both runtimes (`DECLARED_TOTAL`, `DECLARED_RUNS`, `CROSS_ROW`, `CROSS_ROW_SUBJECTS`); `check:docs` `X10` |

**`git diff --name-only` against `Owns` and the exceptions**, on the final tree: 11 modified and 3 new files —
`AGENTS.md`, `examples/README.md`, `examples/l6.ts`, `spec/README.md`, `spec/flow-definition.md`,
`src/scheduler/runtime.ts`, `test/definition/l4-corpus.test.ts`, `test/scheduler/runtime.test.ts` (Owns);
`src/scheduler/index.ts` (E1); `src/definition/types.ts` (E2); `doc/decisions/0096-*` (the record step); new
`doc/decisions/0097-*` (Owns), `doc/questions/q619.md` (the record step) and this file. `scripts/check-docs.mjs` is in
the row and is not edited. Nothing is undeclared.

**Predictions, as measured.** P37 prediction 3 **TRUE** — #17's refusal moved no existing assertion: measured by this
item's author (M2, the source changed alone, every count unmoved) and confirmed by a reader.

**What broke.**

1. **M13 survived the build's own provocations**: every road carried ONE keyed node, so `at` from the first or the last
   node could not differ — the case the rule's own choice 4 SELECTS on. A two-node case was added (workflow section 5
   rule 8 obligation (a), *where it SELECTS*).
2. **Four guards had no case that made them fire** (A-F1-F4): the task-only filter, `resume`'s order, the `Set` and
   `sort`, and one of the two roads in the detail — each now has one.
3. **A one-character fix broke the build** (C-F5): an apostrophe inside a single-quoted literal. Caught by the mutation
   run's CONTROL, not by a gate; the control is what makes that run worth reading.
4. **A claim said "not measured" where one command measured it** (C-obs 8) — and the measurement was a finding: Q619.

**What this taught.** Nothing proposed here; the retro decides.

**Questions.** Raised: **Q619** (a built-in keyed group held as a resident group, P37's). Closed: none. **Q620-Q622
released unused.** ADR 0097 issued. **Exceptions**: E1 and E2, ASKED at the declaration step, ANSWERED YES 2026-10-15,
recorded before their edits; stop-and-ask S1 ANSWERED A.
