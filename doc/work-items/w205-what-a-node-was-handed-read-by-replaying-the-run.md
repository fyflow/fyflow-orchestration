# W205 — what a node was handed, read by replaying the run to the target's composition

**Status:** done 2026-10-22 — `npm run gate:item` on the final tree, one command, EXIT 0 (the Record), after ONE asked exception (`RUN_FLOOR` 51 -> 52, answered YES); both readers RAN, every finding acted on or declared; Q760 raised. Earlier: declared 2026-10-22 on `27d73b6`, P42's FIRST item: decisions 1-9, stop-and-asks (a)-(e) as answered; this file written from the plan's row BEFORE any other edit; the declaration step's re-takes below, taken before any `src/` edit
**Plan:** [P42](../plans/p42-what-a-node-was-handed-asked-after-the-fact.md) — *what was a node handed, asked after the
fact?* — and this is its FIRST item: the replay cut, the export and `handle.inputOf`, ADR 0128, the spec, the L2 suite
and its oracle, the count.

```
Spec:       spec/run-state.md v0.33 -> v0.34 — RN-R45 (the reading: its target, the answer per kind, the refusals, the
            cost, the limits) and RN-R25 (the handle's new member); section 5's table only if a claim moves;
            spec/README.md's rows; spec/flow-definition.md FD-C1 — a dated pointer to RN-R45 only, if a reader is found
            there.
Owns:       from P42's W205 row, exactly: src/driver/driver.ts, src/scheduler/runtime.ts, src/scheduler/index.ts and
            index.ts (if an export needs a line), test/driver/**, test/scheduler/**, test/fold/** (if the count sits
            beside the cost suites), test/definition/l4-corpus.test.ts (counted), spec/run-state.md, spec/README.md,
            spec/flow-definition.md (FD-C1's dated pointer only), AGENTS.md (the WHOLE file, sentence D′),
            doc/decisions/0128-*
            Exceptions (declared BEFORE the edit, workflow section 7 rule 2) — the row's: examples/l6.ts, ONLY where a
            census of RunHandle's members there moves with RunHandle. The record step's four files carry ADR 0128, the
            post-transform question (doc/questions/**) and P42's plan file only where its Record is touched (it is
            W206's). Anything else found to need an edit is a STOP-AND-ASK.
            Exception ASKED and answered YES (2026-10-22, before the edit — workflow section 1 rule 6; the coordinator
            taking option (a) under the maintainer's standing instruction for P42 (e), W196's precedent): ONE literal in
            scripts/check-docs.mjs, RUN_FLOOR 51 -> 52, because section 8's new `run` snippet makes 52 and
            check:docs:selftest's deletion probe no longer trips X4 at 51. Nothing else in that file.
Inputs:     P42 decisions 1-9, facts 1-10, stop-and-asks (a)-(e) ANSWERED 2026-10-22; ADR 0001 rules 1 and 4, ADR 0014,
            ADR 0040 rule 2, ADR 0046, ADR 0051, ADR 0065, ADR 0122, ADR 0124, ADR 0126; RN-R13, RN-R15, RN-R19-RN-R25,
            RN-R37, RN-R44; W202's Record and test/fold/reference-copy-cost.test.ts as W202 left it.
Outputs:    (1) src/driver/driver.ts — the CUT: a reading's hook the replay consults (a node's composition in `enter`, a
                join's firing, a task's held envelope), and a reading built on `replayStored` with nothing handed to a
                scheduler and no consumer callback; `headerRefusal`, `resumeRefusal`'s header half, shared by both.
            (2) the root export `inputOf(flow, options, { header, events }, target)` and its target, answer and
                refusal types (names settled in ADR 0128).
            (3) `RunHandle.inputOf(target)` — the same function over the run's own `checkpoint()`, synchronously.
            (4) decision 3's per-kind answers (task: the envelope; ask, gate, fanout, map, end: the composed value;
                join: an arrival at an arriving branch's path, the collection at the opener's); decision 4's
                node-id-alone list, in replay order; decision 5's refusals — `unknown`, `not-reached`, `diverged`,
                `format`, `flow` — returned, never thrown; a stored `halted` / `stopped` / `cancelRequested` ENDING the
                prefix the reading verifies.
            (5) the private counter of the stored elements a reading consumes — a field of the reading's own driver,
                read by a cast (ADR 0121 rule 7's constraints), never public.
            (6) test/driver/input-of.test.ts (new, L2): the row's claims, each expected value from the spec or derived
                by hand on a flow where every wrong selection differs; the corpus-and-every-resume-prefix oracle against
                the envelope the driver handed `createTask`, bounded for chromium's 60 s.
            (7) the cost suite (a new test/fold/*-cost.test.ts sibling): the count EXACT at 2,000 and 8,000 items for
                the first and the last instance of a map, derived from the counted code, the cut's removal red at its
                pin, the uncounted named.
            (8) handle.inputOf's cases beside test/scheduler/live-state.test.ts's.
            (9) ADR 0128; spec/run-state.md v0.34; spec/README.md's rows; AGENTS.md (the reading where a stored run is
                read back, the handle's member, the snippet-local `inputOf`'s collision measured by check:docs);
                the post-transform input's register question (Q760, `deferred`).
Depends on: P42's declaration (27d73b6) — stop-and-asks (a)-(e) answered
Blocks:     W206
Tests:      Outputs (6)-(8). Expected values from P42 decision 3 and the spec, and from derivations beside each count.
            Measurements, not gate entries (Q179): fact 4's whole-run figures re-taken; the replay's `held` retention
            measured with and without the cut; the export timed once at 2,000 / 8,000 / 16,000 items, node and deno.
Gate:       `npm run gate:item` (not the plan's last item; no row edits scripts/check-register*.mjs,
            scripts/state.mjs or doc/questions/README.md); `npm run gate` before the readers (sentence C); then the
            conformity reader and the adequacy reader, workflow section 6.
Reserves:   Q760-Q764, ADR 0128
```

## Scope

**In**

1. **The cut and the reading** — Outputs (1), (4), (5).
2. **The surface** — Outputs (2), (3).
3. **The suites** — Outputs (6)-(8).
4. **The record** — Outputs (9).

**Out** — named rather than left implicit, with where it goes instead

- **A reading over `RunState` alone** ((a2)), **recording inputs** ((a3)) — refused by the plan.
- **The post-transform input BUILT** ((b1)) — the register question this item raises.
- **`branchPath` on `pathEnded` / `pathEnds`** ((d1)), any `FoldInput` kind, `RunState` cell, checkpoint field or
  `CHECKPOINT_FORMAT` — P42 Scope's *Out*.
- **`resume()`'s own refusals and behaviour**, `FD-R4`, a cache of answers — P42 Scope's *Out*.
- **The L6 block, the timing subject under `examples/`, the reply, P42's Record** — W206.
- **The version bump, the push, the publish** — the maintainer's ((e1)).

## What the declaration step re-took, before anything in `src/` was edited

*P15 decision 5. Taken 2026-10-22 on `27d73b6` in the worktree `C:/tmp-w205/base` (`node_modules` COPIED, 0 links, 0
reparse points), the tree clean; harnesses and logs in the session scratchpad's `w205/`.*

| # | re-take | measured |
|---|---|---|
| 1 | fact 4's whole run — `examples/map-cost.ts "one step back"` (ADR 0124 consequence 1's subject: `post` reading its own instance's `work`), each size a fresh process | node 24.20.0: **66 / 198 / 380 ms** at 2,000 / 8,000 / 16,000 items (ADR 0124: 68 / 223 / 442); deno 2.9.6: **69 / 237 / 491** (ADR 0124: 79 / 258 / 560) |
| 2 | anything entered after a stored `cancelRequested` or a regenerated halt (`w205/retakes.ts` (b)) | after `cancelRequested` at 7: two `outcome` elements and NOTHING else — no `dispatched`, `asked`, `gated`, `regionEntered`, `pathEnded` or region event; after a predicate's throw halted the run at 14: nothing (the halt is the last element). **Decision 5's prefix end holds**: a reading that stops at either loses no entry the stored run made after it |
| 3 | the replay's `held` map (`w205/retakes.ts` (c)): a completed map of `n` items (`fetch` → map → `work` → join → end), resumed, `held` read at the end of `replayStored` | **2,001 entries / 157,971 B of composed payloads (`v8.serialize`) at 2,000 items; 8,001 / 631,971 B at 8,000** — every dispatch's config, kept until `resume()` drops the replay (`null` after it). Fact 4's *keeps EVERY dispatch's config* holds |
| 4 | every surface enumerating `RunHandle`'s members, every double building one (D′) | `RunHandle` is BUILT in one place, `openRun`'s return (`src/scheduler/runtime.ts:966`); no test, example or `AGENTS.md` snippet builds one or enumerates its keys (`Object.keys` of a handle: none; `retention.test.ts:1168` enumerates the DRIVER's, `DRIVER_FIELDS`). `examples/l6.ts` declares `let h: RunHandle` and builds none — **so the row's declared exception (`examples/l6.ts`) is expected UNUSED**. `AGENTS.md` section 8's reads table (`:1936`) lists the handle's reads |
| 5 | fact 8: no surface names the branch paths an end was reached on | `pathEnded` is `{ kind, reason, at }` (`src/fold/run-state.ts`); `branch.exited` carries the branch path for an end INSIDE a region only; an end outside every region is reached at `-` (or a join's opener path) and named nowhere. Holds |
| 6 | a join's arriving paths and its opener's never coincide, at every depth of the corpus (`w205/retakes.ts` (a)) | 26 valid corpus flows driven in order, **51 `branch.arrived` events at depths 1 and 2: 0 whose `branchPath` equals its `regionPath`, 0 whose path is not the opener's plus ONE segment**. Decision 3's *told apart by the path* holds on the corpus |
| 7 | `AGENTS.md`'s `inputOf` name | a snippet-local `const inputOf` at `:546` and `:637` (`"$payload"` and `"$item"`, each reading a captured task's `payload.input`); `examples/l6.ts:12258` has another, local to a helper. **`check:docs` writes each snippet as its OWN module** (`X3`: `docs-<pid>/<n>-line<m>.ts`) importing named exports, so a root export of the same name meets a snippet-local only where that snippet imports it — prediction 5's *meets* is measured at the build step below |
| 8 | `resumeRefusal`'s header half | `format` (shape, `header.format`, the three fields' types), `run` (only with a run id), `flow` (`:462-495`), then the `halted`/`stopped` scan (`:499`) and the `cancelled`/`cancelRequested` scan (`:520`) — the header half is the first 34 lines, separable with no change in order or message |
| 9 | the ladder counts — `npm run gate` on `27d73b6` in `C:/tmp-w205/base`, EXIT 0, 19:26:15 → 19:31:34 (`w205/gate-base.log`) | L1-L5 **91 files / 2,174 cases** in node 24.20.0, deno 2.9.6 and chromium (parity); L6 **2,831 / 0 failed** over 234 real runs in node and deno; `check:docs` 57 snippets, **51 `run`**, 6 `check`; `check:spec` C4 45 |

## Verification

`npm run gate` before the readers; the two readers in their own worktrees under `C:/tmp-w205/`; the readers' survivors
re-cut by the author; then `npm run gate:item` once, on the final tree, held still. **Routing coverage**: a nested
fan-out (Q6) — the corpus's nested flows in the oracle, and a join's arrivals at depth 2; `user_action` (Q17) — a parked
task resolved, its answer the one dispatch's envelope; a branch routed away from its join (Q4) — an early-firing join's
LATE arrival answered; no matching decision edge (Q10) — a path ending `no-eligible-edge`, the next node `not-reached`;
a duplicate task id (Q13) — not applicable: a reading appends nothing and mints only what the replay mints.

## Record

*Filled 2026-10-22, after both readers and the confirming gate. Harnesses and logs in the session scratchpad's `w205/`.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate` before the readers (sentence C) | RAN — first EXIT **2** (20:05:47 → 20:06:00, `w205/gate-1.log`): `typecheck:tests` refused three `includes` over a literal tuple and one `.map` over a union in the new suites — typechecking had been run on `tsconfig.node.json` alone. Fixed, then **EXIT 0**, 20:08:01 → 20:13:46 (`w205/gate-2.log`) | L1-L5 **94 files / 2,197 cases** in node 24.20.0, deno 2.9.6 and chromium (parity); L6 **2,831 / 0 failed** over 234 real runs in node and deno; `check:docs` 58 snippets, **52 `run`**, 6 `check`; C4 45 |
| conformity reader (`C:/tmp-w205/rc`) | RAN | no BLOCKER; 2 SHOULD, 2 NIT, below. ~60 predictions written from `RN-R45` before running them over constructed flows (an entry fanout, an ask in a map, a gate at the entry, zero-item maps, a nested map's join at depth 2, a paused and twice-resumed run, every element prefix of two flows, a transform, a `user_action` resolved, a Map/Date payload): every one held but the two findings |
| adequacy reader (`C:/tmp-w205/ra`) | RAN | 88 mutations: 64 killed, 22 survived (one the no-op control); 1 BLOCKER, 4 SHOULD, 3 NIT, below; survivors argued EQUIVALENT: M03, M70, M04, M69, M27, M33, M64, M65, M72, M38, M40 (the last two by measurement over the corpus, not proof) |
| the author's sweep (`C:/tmp-w205/m`, `w205/sweep.mjs`) | RAN, before the readers reported | 28 mutations: 25 killed; **3 SURVIVED** — an end's path from the graph (`pathOf`), no default join policy, the options spread whole — each then pinned (a shared end, a reading with no `joinPolicy`, a mid-step prefix and a halted run in the deaf case) and **KILLED** on re-cut; 2 malformed probes (a syntax error and a two-match anchor) re-cut, both KILLED |
| the re-cut of the readers' survivors (`w205/recut/`, the adequacy reader's own harness and mutations against the final tests) | RAN | **KILLED**: M02, M07, M08, M09, M43, M50, M68, M68G, M87 (the BLOCKER). **SURVIVED**: M73, the reader's no-op control (its right verdict) |
| prediction 1 (`w205/payloads.ts`) | RAN, on `27d73b6` and on the final tree | every valid corpus flow under four drains, each with a resume from every rest: **685 runs, composed payloads and checkpoints byte-identical** (`cmp` 0). *A first comparison differed — at `observedAt`, the harness's own clock; `now` pinned and both sides re-taken* |
| `npm run gate:item`, the first | RAN — **EXIT 1**, one command, 20:39:20 → 20:58:39 (`w205/gateitem.log`) | the LADDER green (lint; typecheck; every check, `check:docs` 52 `run`, C4 45; L1-L5 94 files / 2,197 cases in node, deno and chromium; L6 2,831 / 0 failed over 234 runs in both); selftests 9 of 10 ok — **`check:docs:selftest` EXIT 1**: its probe *a whole `run` snippet deleted* wanted [X4, X8] and got [X8], because `RUN_FLOOR` (`scripts/check-docs.mjs:742`) is 51 and section 8's new snippet makes 52 — B′'s floor, not run before the `Owns` was written, and a file outside it. **STOP-AND-ASK**, uncommitted — answered (a), YES, the one literal moved (Exceptions above) |
| `check:docs:selftest`, after the edit | RAN — **EXIT 0**, 47/47 probes caught (`w205/docs-selftest.log`) | the deletion probe trips [X4, X8] again |
| **`npm run gate:item`** on the final tree, held still | RAN — **EXIT 0**, one command, 21:11:33 → 21:39:53 (`w205/gateitem2.log`) | lint; typecheck; every check, `check:docs` 58 snippets / **52 `run`**, C4 45; L1-L5 **94 files / 2,197 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 2,197); L6 **2,831 / 0 failed** over 234 real runs in node and deno; selftests **10/10 ok** (1,380.9 s wall, 9 lanes), `check:register:selftest` left out by `--without`. Written after it: this row and Status — `check:register`, `check:markdown`, `check:spec`, `check:budget`, `check:wiring` and `check:docs` re-run on them |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the cut (`Reading`, `offer`, `take`, the three sites, the confirmation in `append`), `Driver.read`, `readStep`, `DEAF_SCHEDULER`, `headerRefusal` / `haltRefusal` | yes | every case of the three suites; the sweep's and the readers' kills (M28, M87 the confirmation; `own < stored`; the truncation set) |
| (2) `inputOf` and its types | yes | `check:docs` (section 8's snippet imports it); the L2 suite |
| (3) `RunHandle.inputOf` | yes | `test/scheduler/input-of.test.ts`; M68, M68G, the policy probe |
| (4) the per-kind answers, node-id-alone, refusals, prefix end | yes | cases 2-10 of the L2 suite |
| (5) `replay.reading.fed` / `elements` | yes | the cost suite's pins; its provocation |
| (6) `test/driver/input-of.test.ts` | yes | 13 cases; counted by the census |
| (7) `test/fold/input-of-cost.test.ts` | yes | 5 cases; counted |
| (8) `test/scheduler/input-of.test.ts` | yes | 4 cases; counted |
| (9) ADR 0128, `spec/run-state.md` v0.34, `spec/README.md`, `FD-C1`'s pointer, AGENTS.md, Q760 | yes | `check:register` (front matter, Q760), `check:spec` (C2, C6, C8), `check:docs` |

**The numbers.**

- **Counted** (the cost suite, EXACT, derived from the stored layout in its header): a map of n items whose instances each reach an end — the first instance's reading fed **2** stimuli and compared **2n + 5** elements (4,005 / 16,005); the last's **n + 1** and **5n + 2** (2,001 / 10,002 and 8,001 / 40,002) of the stored **5n + 5**; the node id alone n + 1 and 5n + 5. The second observer (the reading driver's own log length) equal. **What it does not count**: the composition, the predicates' and gates' re-runs, the header's clone, `new Driver`'s validation, and the work of a fed step beyond its compared elements.
- **Timed once** (`w205/timing.ts`, a fresh process per size; Q179): `post` reading its own `work`, the LAST instance — **35 / 138 / 263 ms** at 2,000 / 8,000 / 16,000 items in node 24.20.0, **52 / 166 / 352** in deno 2.9.6; the first instance 10 / 39 / 74 and 9 / 46 / 83; the cost flow's `exit` first 15 / 49 / 94 and last 27 / 111 / 202 (node). Beside re-take 1's whole run live: 66 / 198 / 380 (node), 69 / 237 / 491 (deno). **P42 prediction 3 HOLDS for the timing** (263 ms against 442, within 2x) **and for `fed`** (constant for the first instance), and **NOT for `elements`**: the first instance's work is linear — a map opens every instance in one step and a step is replayed whole up to the cut.
- **Retention** (P42 decision 6's measurement): a resume's replay held **2,001 configs, 157,971 B of payloads at 2,000 items; 8,001 / 631,971 B at 8,000** (re-take 3). **A reading holds NONE** — `held` stays empty (pinned in the cost suite beside the resume's 2,001 as the control). What the reading's driver retains besides is what any replaying driver does (its log, outputs, region state), dropped when the reading returns.
- **chromium**: the bundle's in-page evaluation 22.8 s on W205's tree (39.5 s on `27d73b6` in the same session — noise-dominated); the three new suites ~3 s of node wall.

**Predictions.** 1 **HOLDS** (685 byte-identical). 2 **MOVED**: the cut is THREE sites plus the confirmation in `append` — a task's envelope is offered where `dispatch` builds it, and an offer is taken only when its node's own element is compared (ADR 0128 rule 2). 3 holds for `fed` and the timing, not for `elements` (above). 4 **HOLDS**: no corpus flow's answer differs from its captured envelope, on the run, at every element prefix, or on a resume from every rest. 5 **FALSE in its first half**: `check:docs` was EXIT 0 with the root export beside the snippet-local `const inputOf` (each snippet is its own module, `X3`); the two were RENAMED `handedInput` all the same, so the reference uses one name in one meaning.

**The readers, and what was acted on.**

| reader | finding | acted on |
|---|---|---|
| adequacy 1 (BLOCKER) | the confirmation unpinned: taking a PATH target's offer before the comparison was green — the `diverged` case asked the node id alone, which replays on and diverges anyway | **FIXED** — a path target on the end and on a gate (a definition built for it) refused `diverged`, never answered; M87 re-cut KILLED |
| adequacy 2, author's sweep | the deaf case's checkpoint at rest delivers nothing even with the callbacks wired, so the options spread survived | **FIXED** — a mid-step prefix (a lost tail) and a regenerated halt read with every callback handed; M07 KILLED |
| adequacy 3; conformity 2 | the reading's RUN ID: every fixture `r1` (M08, M09 survived); and a header `runId` of the right type that is no run id made `inputOf` THROW (`InvalidRunId`) | **FIXED** — a run `r7` read, `r1:…` unknown there; `Driver.read` refuses such a header `format` before a driver exists (`assertRunId`), two cases added; RN-R45, ADR 0128 rule 5, the refusal table |
| adequacy 4, author's sweep | no reading omitted `joinPolicy` (M02) | **FIXED** — a reading with none equals one with `liveToken`; KILLED |
| adequacy 5 | the handle's predicates and gate types unpinned (M68, M68G) | **FIXED** — a handle reading through a registered predicate into a CODE gate type; both KILLED |
| adequacy 6 | *handed as built, not copied again* unpinned (M43, M50) | **FIXED** — a needs-composed part frozen and the envelope not, on a task and on an ask; both KILLED |
| adequacy 7 | a non-object element AFTER the prefix's end is not refused | **STATED** — RN-R45: an element past the prefix's end is not read |
| adequacy 8 | dropping the transform at the SHARED dispatch site survives W205's suites (the oracle shares `dispatch`) | **DECLARED** — the brief's sentence: the oracle proves the cut, not the composition; the full suite kills it in 17 cases elsewhere, and a READING-side drop (M46) is killed by the oracle on `transformed.flow.json` |
| conformity 1 | an end shared by two SIBLING regions is reached TWICE on one path; a path target answers only the first | **STATED, with a decision** — a path target answers the FIRST composition on its path; the node id alone lists both (pinned). Carrying the region on `NodeInput` would tell them apart — a surface no decision took (ADR 0128 rule 3, RN-R45, AGENTS.md, the export's doc) |
| conformity 3 | consequence 1 cites an empty Record and ADR 0124's baseline | **FIXED** — this Record; consequence 1 names both baselines |
| conformity 4 | RN-R45's *never thrown* read absolute | **FIXED** — RN-R45 names what it throws: what `new Driver` throws |
| author's sweep | an end's path taken from the graph survived: no fixture where the graph's path and the arriving branch differ | **FIXED** — an end shared by two sequential regions, reached at 0 and at 1; KILLED |

**Decisions taken by this item** (within P42's delegated shape): the names (`inputOf`, `InputTarget`, `InputOfOptions`, `InputReading`, `NodeInput`, `HandedAs`, `InputRefusalReason`) and the signature `inputOf(flow, options, run, target)`, `options` a `Pick` of the routing members with `joinPolicy` defaulting to `liveToken`; an answer handed as the reading's driver built it (not copied, not frozen further); an offer confirmed by its node's own element; a halted, stopped or cancel-requested run's prefix ending at that element; `format` for a non-object element and a header `runId` that is no run id; a path target answering the FIRST composition on its path.

**What broke.** At no rung of the product: the readers found what the author's set did not — the one mechanism that makes the cut exact was pinned only through a target form that cannot observe it, and a `runId` the header half does not hold threw out of a function documented never to throw. One rung the author skipped: `typecheck:tests` before the first gate.

**What this taught.** *For the retro*: **a claim pinned through the wrong target form is not pinned** — the `diverged` case asked the node id alone, which replays to the end and diverges whether or not the cut confirms, so the case read *a predicate routing into the target refused* while the confirmation was deletable (adequacy 1). Rule 8 (a)'s *each SHAPE* — here the target's form — once more.

**Questions raised.** [Q760](../questions/q760.md) — the input a task's worker sees after its transform, `deferred` (Q761-Q764 SPENT, unissued). **Closed.** None. ADR 0129 unissued (P42's reservation). **Record step**: ADR 0128 written; Q760 raised; P42's Record is the last item's (W206). **Declared exception**: `examples/l6.ts` UNUSED — no census of `RunHandle`'s members exists there (re-take 4).

**The readers' overlap.** **ONE** — the reading's run id (conformity 2: a malformed header `runId` throws; adequacy 3: no fixture's run is other than `r1`). Every other finding was one reader's alone. *The tests were extended in the author's tree while the readers read their copies, taken before; no reader measured the author's tree.*

**Leftover worktrees.** `C:/tmp-w205/base`, `rc`, `ra`, `m` (git worktrees at `27d73b6`, the diff applied, `node_modules` COPIED, scanned: 0 links, 0 reparse points) — left for the maintainer; not removed with `--force`.
