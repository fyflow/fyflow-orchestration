# W208 — a transform's cause on `transform-fails`, and when an ask was asked, kept across a replay

**Status:** done 2026-10-23 — `npm run gate:item` on the final tree, one command, EXIT 0 (the Record), after ONE asked exception (`examples/l6.ts`, six W182 comparisons, answered (a), YES); both readers RAN, every finding acted on or declared; Q760 resolved. Earlier: declared 2026-10-23 on `e52348d`, P43's FIRST item: (d1), (e1), (f1) as answered; decisions 6, 7, 9; facts 4, 6, 7; this file written from the plan's row BEFORE any other edit; the declaration step's re-takes below, taken before any `src/` edit
**Plan:** [P43](../plans/p43-what-a-flow-and-a-run-say-as-data-rather-than-as-prose.md) — *what do a flow and a run say
as data rather than as prose?* — and this is its FIRST item: pass 4 #3 (`cause`), #4 (`observedAt`), #5 (Q760 resolved)
and #6 (pass 1 #11 recorded withdrawn, in the plan).

```
Spec:       spec/run-state.md v0.34 -> v0.35 — RN-R36 (the fold's field on an ask's entry), RN-R37 (the asked
            element's time), RN-R19's regenerated clause (a regenerated asked element takes the stored one's time),
            RN-R45 only if its prose moves; spec/flow-definition.md v0.47 -> v0.48 — the verdict table's
            transform-fails row (cause); spec/README.md's rows.
Owns:       from P43's W208 row, exactly: src/definition/wiring.ts, src/definition/assist.ts (only if a reader there
            moves), src/driver/driver.ts, src/fold/run-state.ts, src/fold/accumulator.ts, test/definition/**,
            test/driver/**, test/fold/**, test/scheduler/** (if a handle's state() case moves),
            test/definition/l4-corpus.test.ts (counted), spec/run-state.md, spec/flow-definition.md (the verdict
            table's row), spec/README.md, AGENTS.md (the WHOLE file, sentence D′), scripts/check-docs.mjs (RUN_FLOOR
            only), doc/decisions/0130-*
            Exceptions (declared BEFORE the edit, workflow section 7 rule 2): none beyond the row. The record step's
            four files carry ADR 0130, doc/questions/q760.md (resolved) and the optional dated note in
            doc/questions/q372.md; P43's plan file is not touched (its Record is W212's — pass 1 #11 is already
            recorded WITHDRAWN there at its declaration). Anything else found to need an edit is a STOP-AND-ASK.
            Exception ASKED and answered YES (2026-10-23, before the edit — workflow section 1 rule 6; the coordinator
            taking option (a) under P43 (h), the maintainer's standing instruction that items take decisions as
            recommended): examples/l6.ts, ONLY the six expected comparisons of the W182 block that read a whole `asked`
            element or ask entry (exit (1) x2, (2) x2, (3), (5)) — each sets aside `observedAt` / `askedAt` and
            nothing else; the assertion count and X10 unmoved (re-take 4).
Inputs:     P43 decisions 6, 7, 9, facts 4, 6, 7, stop-and-asks (d1), (e1), (f1) ANSWERED 2026-10-23; ADR 0014,
            ADR 0065, ADR 0109, ADR 0128; RN-R16, RN-R17, RN-R19, RN-R20, RN-R24, RN-R36, RN-R37, RN-R45; W205's Record.
Outputs:    (1) src/definition/wiring.ts — `WiringVerdict.cause?: 'threw' | 'schema'`, set at judgeTransform's two
                transform-fails sites (the catch: 'threw'; the consumer's finding: 'schema'), absent on every other
                kind; VerdictKind, VERDICT_KINDS, every count and every `why` unmoved.
            (2) src/fold/run-state.ts — the asked FoldInput gains an optional `observedAt: number`; NodeRun an
                optional field (its name this item's) carrying it on an ask's entry.
            (3) src/driver/driver.ts — ask() stamps `observedAt` from the injected `now`; within a replay's stored
                prefix the regenerated element TAKES the stored element's `observedAt`, or carries none where the
                stored one has none; past the stored tail it is now(). freezeInput carries it.
            (4) src/fold/accumulator.ts — the asked arm keeps it on the ask's NodeRun, and the resolution arm keeps it
                through the answer as it keeps `input`.
            (5) tests (L1-L3): cause on each of the catch's roads and on a finding, through tryTransform AND
                checkWiring, absent on fits, no, transform-passes, unchecked, why unmoved; observedAt the injected clock
                on a fresh asked; on a resume from EVERY stored prefix of a run with an ask, the regenerated
                element's observedAt the STORED one under a DIFFERENT clock, its control a fresh element past the tail
                with the new clock; an asked stored WITHOUT one resuming equal with none; inputOf over the same stores
                never diverged; the fold's field on a suspended ask, absent on every other entry, kept through the
                answer; L3 folded twice.
            (6) ADR 0130 (a regenerated asked element keeps the stored run's time), fact 7's older-driver direction
                MEASURED on a byte copy at e52348d and stated there; spec/run-state.md v0.35,
                spec/flow-definition.md v0.48, spec/README.md; AGENTS.md section 15's cell and snippet (the prefix
                assertion kept, cause asserted beside it) and every place it states an asked element's shape.
            (7) the record step: Q760 resolved (P43, pass 4 #5); a dated note on Q372 (pass 1 #11 withdrawn by its
                asker, the question kept for other hosts).
Depends on: P43's declaration (e52348d) — stop-and-asks (a)-(h) answered
Blocks:     W209
Tests:      Outputs (5). Expected values from P43 decisions 6 and 7 and the spec, derived by hand: a clock injected
            with known values, so every observedAt is a literal written before the run.
Gate:       `npm run gate:item` (not the plan's last item; no row edits scripts/check-register*.mjs,
            scripts/state.mjs or doc/questions/README.md); `npm run gate` before the readers (sentence C); then the
            conformity reader and the adequacy reader, workflow section 6.
Reserves:   Q770-Q771, ADR 0130
```

## Scope

**In**

1. **`cause`** — Output (1) and its cases.
2. **`observedAt`** — Outputs (2)-(4) and their cases.
3. **The record** — Outputs (6), (7).

**Out** — named rather than left implicit, with where it goes instead

- **Finer causes or new verdict kinds** ((d2), (d3)) — refused by the plan.
- **`observedAt` excluded from the replay's comparison** ((e2)) — refused by the plan.
- **Any `CHECKPOINT_FORMAT` move**, a structured error code, the error reference (W209), the schemas (W210, W211), the
  L6 block and the reply (W212) — P43 Scope's *Out* and the later rows.
- **The version bump, the push, the publish** — the maintainer's ((h1)).

## What the declaration step re-took, before anything in `src/` was edited

*Taken 2026-10-23. The baseline in the worktree `C:/tmp-w208/base` at `e52348d` (`node_modules` COPIED, 0 links, 0
reparse points); logs in the session scratchpad's `w208/`.*

| # | re-take | measured |
|---|---|---|
| 1 | the ladder counts — `npm run gate` on `e52348d` in `C:/tmp-w208/base`, EXIT 0, 18:12:54 → 18:20:49 (`w208/gate-base.log`) | L1-L5 **94 files / 2,197 cases** in node 24.20.0, deno 2.9.6 and chromium (parity); L6 **2,847 / 0 failed** over 238 real runs in node and deno; `check:docs` 58 snippets, **52 `run`**, 6 `check`; C4 45 |
| 2 | every reader of `transform-fails` (D′) | `assist.ts:318-319` (`sampledOutput` selects on the kind and `'result' in sample` — `cause` moves neither); `checkWiring`'s counts (`wiring.ts:918`); `examples/l6.ts` reads `kind`, `why` and `sample.result` field by field (`:10339`, `:11057`) — no whole-verdict comparison; `AGENTS.md` `:4063-4064`, `:4152`, `:4206-4207`, `:4217-4219`; `spec/flow-definition.md:2174`; `test/definition/assist.test.ts` field by field |
| 3 | every reader of an `asked` element and of an ask's `NodeRun` (D′) | `src/`: `ask()` (the one writer), `freezeInput` (`{ ...i, input }` — carries any other key), the accumulator's arm, `append`/`sameData`. `test/`: six whole-element or whole-entry literals (`test/driver/ask.test.ts` ×4, `test/driver/ask-control.test.ts` ×2), and `test/fold/accumulator.test.ts`'s ORACLE equivalence over the driven corpus — the oracle (`test/fold/oracle-run-state.ts`) is NEVER EDITED (ADR 0120 rule 8). **`examples/l6.ts`: the W182 block compares SIX whole elements / entries through `askCanon` (`:11530`, `:11541`, `:11606` and three `askEntry` reads)** — measured red, below |
| 4 | B′ — the change built in the working tree and L6 run in node (`w208/l6-node-1.log`) | **L6 EXIT 1: 2,847 assertions, 6 failed**, every one a W182 row whose expected element or entry lacks the new key and whose actual carries `observedAt` (a live `Date.now()`) or `askedAt`: exit (1) ×2, exit (2) ×2, exit (3), exit (5). Nothing else moved. **`examples/l6.ts` is outside this row's `Owns` (it is W212's) — STOP-AND-ASK, below** |

## Verification

`npm run gate` before the readers; the two readers in their own worktrees under `C:/tmp-w208/`; the readers' survivors
re-cut by the author; then `npm run gate:item` once, on the final tree, held still. **Routing coverage**: an ask in a
fan-out (a map's instances asked, each stamped); `user_action` (Q17) — not applicable to `observedAt` (a parked TASK
has an outcome record's `observedAt` already), applicable to the resolution arm's keep; a branch routed away from its
join (Q4), no matching decision edge (Q10), a nested fan-out (Q6) — not applicable: no routing moves; a duplicate task id
(Q13) — not applicable: no id is minted that was not before.

## Record

*Filled 2026-10-23, after both readers and the confirming gate. Harnesses and logs in the session scratchpad's `w208/`.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| B′ — L6 in node on the change, before the `Owns` exception (re-take 4) | RAN — **EXIT 1**, 2,847 / 6 failed (`w208/l6-node-1.log`) | the six W182 whole-element comparisons; STOP-AND-ASK, answered (a), YES (Exceptions). After the edit: **EXIT 0**, 2,847 / 0 failed (`w208/l6-node-2.log`) — the count unmoved |
| `npm run gate` before the readers (sentence C) | RAN — first **EXIT 1**, 18:30:21 → 18:30:52 (`w208/gate-1.log`): `check:register` `R8` — Q760's `resolved-by` named ADR 0128, whose `resolves` does not list it; the text reworded (no ADR id). Then **EXIT 0**, 18:31:29 → 18:39:15 (`w208/gate-2.log`) | L1-L5 **97 files / 2,216 cases** in node 24.20.0, deno 2.9.6 and chromium (parity); L6 **2,847 / 0 failed** over 238 real runs in node and deno; `check:docs` 58 snippets, **52 `run`**, 6 `check`; C4 45 |
| the author's sweep (`C:/tmp-w208/m`, `w208/sweep.mjs`, `w208/sweep-1.log`) | RAN, before the readers reported | 20 mutations, one clause at one call site each (sentence E): the control M00 SURVIVED (its right verdict); M01-M04 and M06-M19 **KILLED**; M05 MALFORMED (anchor x2), re-cut on a unique anchor and **SURVIVED** — a `cause` on the `unchecked` road where the transform ran and the consumer has no `inputSchema`: case 3's NAME claimed that road and its body never reached it. Pinned (a consumer schema removed, through `tryTransform` and `checkWiring`), re-cut **KILLED** (`w208/sweep-recut.log`) |
| conformity reader (`C:/tmp-w208/rc`) | RAN | no BLOCKER; 1 SHOULD, 3 NIT, below. 48 predictions written before running constructions (a fan-out ask, nested maps, a resume of a resume over three hops, stop and pause, `observedAt` 0 / -5 / `null`, a swapped or replaced stored element, `inputOf` on a halted run, a `user_action` task, every arc shape and the given road): 47 held, the miss the reader's own (a jsonata expression it expected to throw) |
| adequacy reader (`C:/tmp-w208/ra`) | RAN | 31 mutations and a control: 26 KILLED; SURVIVED: D6 (EQUIVALENT — no kind but `asked` carries a top-level `observedAt`, and `sameData` refuses any other element there), W6a, W6b, W7, W8; no BLOCKER, 1 SHOULD, 4 NIT, below |
| prediction 1 (`w208/pred1.ts`) | RAN, at `e52348d` and on the final tree | every valid corpus flow under three drains, each resumed from EVERY element prefix: **1,372 runs** — composed payloads, fold sequences, folds, checkpoints and every resume **byte-identical** (`cmp` 0) once an `asked` element's `observedAt` and an entry's `askedAt` are removed; the CONTROL, the same output unremoved, differs (`cmp` 1; 1,477 `observedAt: 42` on the new side) |
| fact 7's older-driver direction (`w208/older.ts`) | RAN | a checkpoint written by this driver resumed on `e52348d`'s: **refused `diverged` at position 2**, the `asked` element; `e52348d`'s checkpoint on this driver: resumed, no time; each on its own: resumed. ADR 0130 consequence 2 |
| **`npm run gate:item`** on the final tree, held still | RAN — **EXIT 0**, one command, 19:29:05 → 19:55:37 (`w208/gateitem.log`) | lint; typecheck; every check, `check:docs` 58 / **52 `run`**, C4 45; L1-L5 **97 files / 2,216 cases** in node 24.20.0, deno 2.9.6 and chromium (parity); L6 **2,847 / 0 failed** over 238 real runs in node and deno; selftests **10/10 ok** (1,131.5 s wall, 9 lanes), `check:register:selftest` left out by `--without`. Written after it: this Record and the Status line — `check:register`, `check:markdown`, `check:spec`, `check:budget`, `check:wiring` and `check:docs` re-run on them |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `WiringVerdict.cause`, `TransformFailureCause`, the two sites | yes | `transform-cause.test.ts` cases 0-3 (M01-M06); `AGENTS.md` section 15's snippet (`check:docs` X4 — the adequacy reader's W1-W3) |
| (2) `asked`'s `observedAt?`, `NodeRun.askedAt?` | yes | `typecheck:tests` (the suites read both) |
| (3) `ask()`'s stamp and take-the-stored rule, `storedAskedAt`, `freezeInput` carrying it | yes | `asked-at.test.ts` cases 0-6 (M07-M14); `ask.test.ts`, `ask-control.test.ts` |
| (4) the accumulator's two arms | yes | `test/fold/asked-at.test.ts`; `accumulator.test.ts`'s oracle-plus-`askedAt` (M15-M19) |
| (5) the three suites, the six moved literals, the oracle delta, the census | yes | counted in `l4-corpus.test.ts` (5, 8, 5) |
| (6) ADR 0130, `spec/run-state.md` v0.35, `spec/flow-definition.md` v0.48, `spec/README.md`, `AGENTS.md` | yes | `check:register` (R6), `check:spec`, `check:docs` |
| (7) Q760 resolved, Q372's dated note | yes | `check:register` (R3, R8) |

**Predictions.** 1 **HOLDS** (1,372 runs byte-identical but for the two keys; `CHECKPOINT_FORMAT`, `VerdictKind`, `VERDICT_KINDS` and every count unmoved; every `why` unmoved, asserted word for word). 2 **HOLDS**: `checkWiring`'s verdicts carry `cause`, and the corpus's one `transform-fails` file reads `'schema'`. **A consumer site the plan's D′ did not list**: `examples/l6.ts`'s W182 block (six assertions) — found by B′ before the `Owns` edit, asked and answered.

**The readers, and what was acted on.**

| reader | finding | acted on |
|---|---|---|
| adequacy SHOULD; author's sweep M05 | case 3 named *a consumer with no inputSchema* and never reached it — a claim of absence held by nothing (W6a) | **FIXED** — the consumer's schema removed: `unchecked`, its result reported, NO `cause`, through `tryTransform` and `checkWiring`; M05 re-cut **KILLED** |
| conformity SHOULD | `TransformFailureCause`, a new root export named nowhere (P43 decision 9) | **FIXED** — stated as new public surface in `spec/flow-definition.md` v0.48 and `AGENTS.md` section 15's `cause` row |
| conformity NIT 3 | a throw with no consumer schema reads `'threw'`, which the `unchecked` row could be read to cover | **FIXED** — one clause in v0.48, and a case pins it |
| adequacy NIT (W6b, W7, W8) | `cause` written onto `unchecked` at `checkWiring`'s no-transform no-schema road, at arity 0, or onto a refused `no` survives | **DECLARED** — each needs `cause` written OUTSIDE `judgeTransform`, where no line writes it; the corpus loop covers the kinds the wiring corpus reaches. Not pinned |
| adequacy NIT | nothing asserted a DRIVEN `asked` element carries a time, so `oracleStep`'s arm could go unreached | **FIXED** — the arrangement asserted in `accumulator.test.ts` |
| adequacy NIT | `RN-R19`'s test text read as if the hand-edited times were taken on every prefix | **FIXED** — *on the whole checkpoint* |
| adequacy NIT | `askUntimed` sets aside both keys on both shapes, so at L6 a misnamed leak is unseen | **DECLARED** — L1-L2 hold the names (M15, M19; the reader's F6, F7); L6's time is W212's claim; `e3`'s whole-element comparison still checks take-the-stored on real workers |
| conformity NIT 1 | a stored `NaN` / `Infinity` is taken (a JavaScript number), and a broken clock's `NaN` stored as JSON `null` refuses `diverged` | **DECLARED** — the spec's *a number*, read as JavaScript's; reachable only with a clock that returns a non-finite value |
| conformity NIT 2 | the fold copies a non-number `observedAt` from a hand-edited element into `askedAt` | **DECLARED** — no driver writes one and a resume refuses it before the fold; `RN-R36` says *where the element carries one* |

**Decisions taken by this item** (within P43's delegated shape): the fold field's name `askedAt` (P43 decision 7 left it open) — `observedAt` on an entry would read as a task record's time; `TransformFailureCause` named as an exported type; a stored `observedAt` that is not a number taken as none, so that resume is refused `diverged` (ADR 0130 rule 2); the oracle kept unedited and the accumulator held to it PLUS `RN-R36` v0.35's one field (`oracleStep`), never to the oracle with the field stripped.

**What broke.** At no rung of the product. `check:register` `R8` on the first gate (Q760's `resolved-by` naming ADR 0128) — the record step's wording. One test claim its body did not reach (M05; the adequacy reader's SHOULD — the same finding twice).

**What this taught.** *For the retro*: **B′ found an `Owns` miss that the plan's D′ enumeration did not** — D′ grepped for the changed NAMES, and `examples/l6.ts`'s six comparisons name no changed member: they compare the WHOLE element through a canonicaliser. A census by name cannot see a reader that compares the whole value; running the lane can. And again, a case's NAME claimed a road its body did not reach.

**Questions raised.** None (Q770-Q771 SPENT, unissued). **Closed.** [Q760](../questions/q760.md) resolved (P43 (f1)). [Q372](../questions/q372.md) kept `deferred`, a dated note added. ADR 0130 written. **Declared exception**: `examples/l6.ts`, the six W182 comparisons — USED.

**The readers' overlap.** **ONE** — the no-consumer-schema road (conformity NIT 3: a throw there reads `'threw'`; adequacy SHOULD: `unchecked` there carrying no `cause` was untested). Every other finding was one reader's alone.

**Leftover worktrees.** `C:/tmp-w208/base`, `m`, `rc`, `ra` (git worktrees at `e52348d`; `base` clean, the other three with the diff applied; `node_modules` COPIED; scanned: 0 links, 0 reparse points), with `C:/tmp-w208/rc-scratch` and `ra-scratch` — left for the maintainer; not removed with `--force`.
