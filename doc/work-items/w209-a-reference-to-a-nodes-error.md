# W209 — a `needs` reference naming a node's ERROR: `"lookup!error"`

**Status:** done 2026-10-23 — `npm run gate:item` on the final tree, one command, EXIT 0 (the Record), after TWO asked exceptions (`spec/outcome-record.md`'s figure sentence; `examples/l6.ts`'s two reference-form checks, `NOT_YET_AT_L6 = ['error']`), each answered (a), YES; both readers RAN, every finding acted on or declared. Earlier: declared 2026-10-23 on `0c42377`, P43's SECOND item: (c1) as answered; decision 5; fact 5; this file written from the plan's row BEFORE any other edit; the declaration step's re-takes below, taken before the `Owns` were fixed
**Plan:** [P43](../plans/p43-what-a-flow-and-a-run-say-as-data-rather-than-as-prose.md) — *what do a flow and a run say
as data rather than as prose?* — and this is its SECOND item: pass 4 #2, a failed task's error reachable by the nodes its
failed edge leads to.

```
Spec:       spec/flow-definition.md v0.48 -> v0.49 — section 3's reference table (a row for the error form), FD-C1,
            FD-V26 (the "!" clauses), FD-V27-FD-V29 (the error form aimed as the plain one, stated), the whole-node
            paragraph's dated clause, section 7's corpus table (the new valid flow); spec/README.md's rows.
Owns:       from P43's W209 row, exactly: src/definition/validate.ts, src/definition/types.ts (the needs comments),
            src/definition/wiring.ts (the needs arc's sample), src/definition/condition.ts (only if a predicate's
            ctx.needs reader moves), src/driver/driver.ts, test/definition/**, test/driver/**, test/fold/** (an L5 case
            if a join's arrival reads one), test/definition/l4-corpus.test.ts (counted), spec/examples/valid/** and
            spec/examples/invalid/** (new files only), spec/flow-definition.md, spec/README.md, AGENTS.md (the WHOLE
            file, sentence D′), scripts/check-docs.mjs (RUN_FLOOR only), doc/decisions/0131-*
            Exceptions (declared BEFORE the edit, workflow section 7 rule 2): none beyond the row. The record step's
            four files carry ADR 0131; P43's plan file is not touched (its Record is W212's). Anything else found to
            need an edit is a STOP-AND-ASK.
            Exception ASKED and answered YES (2026-10-23, before the edit — workflow section 1 rule 6; the coordinator
            taking option (a) under P43 (h), the maintainer's standing instruction that items take decisions as
            recommended): spec/outcome-record.md, ONLY section 4's figure sentence -> "21 of 221", "200 (90%)", with
            the dated note earlier corpus additions wrote; no rule moves, the version line unchanged (re-take 5).
            Exception ASKED and answered YES (2026-10-23, before the edit — stop-and-ask 2, option (a), the coordinator
            under P43 (h)): examples/l6.ts, ONLY the two reference-form checks — NOT_YET_AT_L6 = ['error'] brought
            back as W190 and W191 did, an "!error" spelling counted in its own 'error' bucket by `part`, its spellings
            exempted; no run, flow or assertion added (re-take 6). **W212's L6 block must RUN the error form and
            REMOVE NOT_YET_AT_L6 again** (as W192 did).
Inputs:     P43 decisions 5, 9, fact 5, stop-and-ask (c1) ANSWERED 2026-10-23; ADR 0040, ADR 0041, ADR 0042,
            ADR 0044, ADR 0124, ADR 0126; FD-C1, FD-C3, FD-C4, FD-V26-FD-V29, FD-R3; spec/outcome-record.md's `error`
            row; RS-R1 (a resolution's error); W208's Record.
Outputs:    (1) the grammar — "n!error", its "?" form "n!error?", its array forms ["n!error"] and ["n!error?"]: the
                node id, then "!error", then the optional "?". Parsed by referenceTarget ALONE: the aimed member gains
                an optional `part: 'error'`, PRESENT only on the error form, so every existing spelling's parse is
                byte-identical (prediction 3). ADR 0131 states it.
            (2) FD-V26's "!" clauses, at both sites, each naming the fix: a "?" before the "!" ("n?!error" -> write
                "n!error?"); a part other than "error" after it ("n!err", "n!", "n!result" -> the one part is
                "error"); no node before it ("!error"); FD-V27-FD-V29 aim the error form exactly as the plain one,
                their messages spelling the reference as written.
            (3) src/driver/driver.ts — an output entry carries its effective outcome's `error`; resolveReference
                hands it for the error form: the string where the output failed, `null` where it succeeded (the
                record's own `error`), absent ("n!error?") where the node did not run, one per visible output in
                branch-path order for the array form. A string: no copy, no freeze, no count in `copies`.
            (4) src/definition/wiring.ts — the needs arc composes the error form as `{ type: ['string','null'] }`
                with a string sample (its witness, `''`), never the producer's output schema.
            (5) tests: L1 in test/definition/error-reference.test.ts, L2 in test/driver/error-reference.test.ts, both
                counted in l4-corpus.test.ts; the existing wiring counts moved by the new corpus flow, stated.
            (6) corpus: spec/examples/valid/ask-after-a-failure.flow.json (an ask after a failure edge reading the
                error, and a task after both roads reading it); spec/examples/invalid/FD-V26--* for the "!" refusals.
            (7) ADR 0131 (a reference may name a node's error); spec/flow-definition.md v0.49, spec/README.md;
                AGENTS.md's needs table, a snippet, and every place it states the grammar.
Depends on: W208 (0c42377)
Blocks:     W210
Tests:      Outputs (5). Expected values from P43 decision 5, FD-C1 and spec/outcome-record.md's `error` row, derived
            by hand: a scheduler double settling known error strings, so every resolved value is a literal written
            before the run.
Gate:       `npm run gate:item` (not the plan's last item; no edit to scripts/check-register*.mjs, scripts/state.mjs
            or doc/questions/README.md); `npm run gate` before the readers (sentence C); then the conformity reader and
            the adequacy reader, workflow section 6.
Reserves:   Q772-Q773, ADR 0131
```

## Scope

**In**

1. **The grammar and its refusals** — Outputs (1), (2).
2. **The resolution and the wiring sample** — Outputs (3), (4).
3. **The tests, the corpus and the record** — Outputs (5)-(7).

**Out** — named rather than left implicit, with where it goes instead

- **A failed edge handing `{ error }` by default** ((c2), BREAKING) and **a node-less `"$error"` token** ((c3)) —
  refused by the plan.
- **A structured error code** — a scheduler ask (P35), P43 Scope's *Out*.
- **A path inside a node's result** — the whole-node rule stands: the error is a field of the OUTCOME, not a path inside
  `result` (fact 5).
- **The schemas (W210, W211), the L6 block and the reply (W212)**; the version bump, the push, the publish ((h1)).

## Predictions, written before the change

1. **P43 prediction 3**: `!` collides with nothing — no valid or invalid corpus file changes verdict, and no existing
   reference spelling parses differently (the `part` key absent on every one).
2. No existing composed payload, fold input, checkpoint or `outputsCache.copies` / `examined` count moves; L6 2,847 / 0
   unmoved.
3. The wiring corpus's verdict counts move ONLY by the new valid flow's arcs.

## What the declaration step re-took, before the `Owns` were fixed

*Taken 2026-10-23; logs in the session scratchpad's `w209/`.*

| # | re-take | measured |
|---|---|---|
| 1 | the ladder counts — `npm run gate` on `0c42377` in `C:/tmp-w209/base` (`node_modules` COPIED; 0 links, 0 reparse points), EXIT 0, 20:00:39 → 20:08:57 (`w209/gate-base.log`) | L1-L5 **97 files / 2,216 cases** in node 24.20.0, deno 2.9.6 and chromium (parity); L6 **2,847 / 0 failed** over 238 real runs in node and deno; `check:docs` **52 `run`** snippets; C4 45 |
| 2 | every site `referenceTarget`'s result is switched on (D′) | `validate.ts` (FD-V26 ×2, FD-V27-29's loop), `wiring.ts` (`:395` a map's entry composition — `self`/`payload` only, untouched; `composed` — the error arm added), `driver.ts` (`:1091` `"$item"` only, untouched; `compose`, `resolveNeeds` → `resolveReference`, the error arm added). `src/definition/condition.ts` reads no reference (unmoved). Nothing in `examples/`, `scripts/` or `index.ts` reads one |
| 3 | whether the index's `OutputEntry` reaches the error | it did NOT: `{ path, result, shared? }`, `result` the effective outcome's alone — the entry gains `error`, set in `place` from the same effective outcome |
| 4 | what a failed `user_action` resolution and a declined ask put in `error` | `resolveStep` (`driver.ts:3123`): `value.error ?? 'resolved as failed'` for `'failed'`, `null` for `'done'`; `effectiveOutcome` (`log.ts:91`) takes the resolution's `error`. The scheduler clears `task.error` at every dispatch (`_dispatchTask`, and `_settleCancelled`), so a `done` settlement's `error` is `null` |
| 5 | B′ — the change built in the working tree (the parse, the resolution, the wiring arm, the corpus flow and three `FD-V26` files) and every lane run | typecheck clean; **every check EXIT 0**; **L6 node EXIT 0, 2,847 / 0 failed** (`w209/l6-node-1.log`); **L1-L5 node EXIT 1, 5 failed** (`w209/test-1.log`): four in `Owns` — section 7's table (the new flow's row), `FD-V29`'s corpus count 26 → 27, the wiring corpus's arcs 74 → 76, `retention.test.ts`'s entry keys (`error` beside `path`, `result`, `shared`) — and **ONE OUTSIDE IT: `test/fold/result-value.test.ts`'s OR-R11 derivation reads `spec/outcome-record.md` section 4's figure, `20 of 219` → `21 of 221`** (the new flow's two task nodes, `lookup` named by `publish`'s `"found": "lookup"`). Every earlier item that added a valid flow moved that sentence (W180, W155, W110, W109, W108, …) — **STOP-AND-ASK, below** |
| 6 | the `gate` before the readers, on the tree with the spec's section 3 row (`w209/gate-1.log`) | **EXIT 1 at L6, 2,847 / 2 failed**: `examples/l6.ts`'s two reference-form checks bind every row of section 3's table to an L6 run (7 rows against 6 forms; 7 spellings against 8). Re-take 5's L6 was taken BEFORE the row existed, so B′ missed it. **STOP-AND-ASK 2**: answered (a), YES — `NOT_YET_AT_L6 = ['error']` back, as W190/W191 held it (Exceptions); after the edit **L6 node EXIT 0, 2,847 / 0** (`w209/l6-node-2.log`), and with the list emptied **EXIT 1** on both checks (`w209/l6-probe.log`, restored, `cmp` equal) — the exemption is load-bearing |

### Stop-and-ask — an `Owns` miss found by B′ (re-take 5), asked BEFORE the edit

`spec/outcome-record.md` is outside the row. Its section 4 states `needs`' named share of the corpus's task nodes
(`20 of 219`, `199 (91%)`), and `test/fold/result-value.test.ts` re-derives it from both corpora on every run — so ANY
valid flow carrying a task node moves it.

| | option | what it changes |
|---|---|---|
| **(a)** *recommended* | **YES — one exception**: `spec/outcome-record.md`, ONLY section 4's figure sentence → `21 of 221`, `200 (90%)`, with the dated parenthetical every earlier corpus addition wrote (W180, W155, W110, …); no rule moves, no version line | the flagship case — a failed TASK's error read by an ask after its failure edge — is in the corpus, as P43's W209 outputs name |
| (b) | NO — the corpus flow carries no task node (an ask declined, a second ask reading `"approve!error"`) | the figure does not move; the task case lives only in L2 and W212's L6 |
| (c) | NO — no valid corpus flow | departs from P43's W209 outputs (*at least one valid corpus flow*) |

## Verification

`npm run gate` before the readers; the two readers in their own worktrees under `C:/tmp-w209/`; the readers'
survivors re-cut by the author; then `npm run gate:item` once, on the final tree, held still. **Routing coverage**:
`user_action` (Q17) — a parked task resolved `failed` is read, its resolution's `error`; a nested fan-out (Q6) — the
array form inside a map, one per instance in item order; a branch routed away from its join (Q4) — the `?` form absent
where the node did not run; no matching decision edge (Q10) and a duplicate task id (Q13) — not applicable: no routing
moves and no id is minted.

## Record

*Filled 2026-10-23, after both readers and the confirming gate. Harnesses and logs in the session scratchpad's `w209/`.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| B′ — every lane on the change before the `Owns` were fixed (re-takes 5, 6) | RAN — L1-L5 node **EXIT 1** (5 failed, one outside `Owns`: stop-and-ask 1); the `gate` **EXIT 1** at L6 (stop-and-ask 2) | both answered (a), YES, before the edit (Exceptions) |
| `npm run gate` before the readers (sentence C) | RAN — **EXIT 1**, 20:33:10 → 20:40:15 (`w209/gate-1.log`), L6's two reference-form checks only | L1-L5 **99 files / 2,242 cases** in node 24.20.0, deno 2.9.6 and chromium (parity); every check EXIT 0; `check:docs` **53 `run`**; `check:docs:selftest` 24/24. Fixed by the asked `examples/l6.ts` edit; L6 node then EXIT 0, 2,847 / 0 |
| the author's sweep (`C:/tmp-w209/m`, `w209/sweep.mjs`, `w209/sweep-1.log`) | RAN, before the readers reported | 18 mutations, one clause each: the control M00 SURVIVED (its right verdict); 16 KILLED; **M04 SURVIVED** — the one form reading the LAST visible entry: EQUIVALENT, since `FD-V28` admits the one form only where exactly one output is visible, and the plain form reads `[0]` alike |
| conformity reader (`C:/tmp-w209/rc`) | RAN | 1 BLOCKER (L6 red — stop-and-ask 2, fixed), 1 SHOULD, 6 NIT, below; 29 of 33 predictions held, its misses its own |
| adequacy reader (`C:/tmp-w209/ra`) | RAN | 48 mutations and a control (K0 SURVIVED, its right verdict): 43 KILLED; SURVIVED B5, B12, E6 (pinned, re-cut **KILLED**, `w209/recut.log`), B13 (EQUIVALENT), D13 (unreachable live), below |
| **`npm run gate:item`** on the final tree, held still | RAN — **EXIT 0**, one command, 21:42:29 → 22:09:08 (`w209/gateitem.log`) | lint; typecheck; every check, `check:docs` 59 snippets, **53 `run`**, 6 `check`, C4 45; L1-L5 **99 files / 2,242 cases** in node 24.20.0, deno 2.9.6 and chromium (parity); L6 **2,847 / 0 failed** over 238 real runs in node and deno; selftests **10/10 ok** (1,136.5 s wall, 9 lanes), `check:register:selftest` left out by `--without`. Written after it: this Record and the Status line — `check:register`, `check:markdown`, `check:spec`, `check:budget`, `check:wiring` and `check:docs` re-run on them |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the grammar, `AimedReference`, `part: 'error'` present only on the error form | yes | `error-reference.test.ts` (L1) the parse and the corpus walk (A1-A6, M01-M03) |
| (2) `FD-V26`'s three `!` clauses at both sites; `FD-V28`/`FD-V29` fixes spelled | yes | L1 `FD-V26` at a node and at an edge, `FD-V27`-`FD-V29` pairs (B1-B12, C1-C10, M09-M14); `AGENTS.md`'s snippet (`check:docs` X4) |
| (3) the driver: `OutputEntry.error`, `resolveReference`'s error arm | yes | `error-reference.test.ts` (L2) — every case (D1-D12, M04-M08) |
| (4) the wiring arm, `ERROR_SCHEMA`, the witness sample | yes | L1 `checkWiring` case (E1-E6, M15-M17) |
| (5) the two suites, counted; the moved census literals | yes | `l4-corpus.test.ts` (11, 10); `wiring.test.ts` 76; `retention.test.ts`; `needs.test.ts` seven rows; `result-value.test.ts` |
| (6) `ask-after-a-failure.flow.json`; three `FD-V26` invalid files | yes | L4 (`l4-corpus.test.ts`, section 7 both ways), the L2 corpus cases |
| (7) ADR 0131; `spec/flow-definition.md` v0.49, `spec/README.md`; `AGENTS.md` | yes | `check:register`, `check:spec`, `check:docs` (`RUN_FLOOR` 53) |

**Predictions.** 1 **HOLDS**: no valid or invalid corpus verdict moved, and the corpus walk finds `part` on exactly the new flow's two `"lookup!error"` keys. 2 **HOLDS on the final tree** (no composed payload, fold input, checkpoint or copy count moved; L6 2,847 / 0) — and **was false at the first gate**, until the asked `examples/l6.ts` edit. 3 **HOLDS**: the wiring corpus moved by the new flow's two arcs alone (74 → 76).

**The readers, and what was acted on.**

| reader | finding | acted on |
|---|---|---|
| conformity BLOCKER | L6 red — section 3's new row has no L6 run | **FIXED** — stop-and-ask 2, (a): `NOT_YET_AT_L6 = ['error']`; L6 green, the emptied list red |
| conformity SHOULD; adequacy SHOULD | the spec's `FD-V27` row and `AGENTS.md` said every message spells the reference as written; `FD-V27`'s names the node | **FIXED** — both now say `FD-V27` names the node and `FD-V28`'s and `FD-V29`'s FIXES keep `!error` (ADR 0131 rule 2 already said *fixes*) |
| adequacy SHOULD (E6) | the composed sample's `source` (`witness`) asserted by nothing | **FIXED** — asserted, beside a plain-key control reading `example`; re-cut **KILLED** |
| adequacy NIT (B5) | `"n?!err"` unpinned: the part clause would offer `write "n?!error"`, itself refused | **FIXED** — pinned to the generic message; re-cut **KILLED** |
| adequacy NIT (B12) | the EDGE site's generic message unread | **FIXED** — pinned; re-cut **KILLED** |
| conformity NIT 1 | the no-node fix suggested a real-looking `"lookup!error"` | **FIXED** — `"<node>!error"` |
| conformity NIT 2 | a wrong part's fix dropped the `?` | **FIXED** — kept (`"n!err?"` → `write "n!error?", or "n?"`), with a case |
| conformity NIT 3 | `place`'s doc comment said `{ path, result }` | **FIXED** |
| conformity NIT 5 | *"a declined ask ends `skipped`"* read as the run's outcome | **FIXED** — *its path ends at the `end` node `skipped`* |
| conformity NIT 4 | `resolve(id, 'failed', { error: <object> })` from untyped JavaScript reaches a reader uncopied | **DECLARED** — the type says `string`; a scheduler's non-string error is normalised to `null` (measured by the reader) |
| conformity NIT 6 | the wiring arm runs on the L1 suite's constructed registry only — the corpus flow's arcs are `unchecked` at `"found": "lookup"` | **DECLARED** — the corpus workers declare no schemas (Q300) |
| adequacy B13 | `bangProblem`'s `$` guard | **DECLARED EQUIVALENT** — reached only where `dollarProblem` returned `null`, i.e. never for a `$` spelling |
| adequacy D13 | `place`'s replace branch writing `error` | **DECLARED** — unreachable live: a repeated settlement ends `DuplicateTaskId` before a reader composes (the reader's probe) |

**Decisions taken by this item** (within P43's delegated shape): the spelling `"n!error"`, the `?` LAST; `part?: 'error'` present only on the error form (the plain forms' objects unmoved) and the root type `AimedReference`; the value the effective outcome's `error` as recorded (no `terminalState` test — the scheduler clears `task.error` at every dispatch); the wiring key `{ type: ['string', 'null'] }`, witness `''`; three `!` clauses; FD-V28's fix keeps the pre-v0.49 omission of the `?`; the corpus flow's shape (an optional task, an ask after its failure edge, a node both roads reach).

**What broke.** At no rung of the product. B′ ran L6 BEFORE the spec's table row existed, so the L6 census binding table rows to runs was found by the first `gate` and the conformity reader — stop-and-ask 2.

**What this taught.** *For the retro*: **B′ is a census of the change, and a SPEC edit is part of the change** — the L6 checks read `spec/flow-definition.md`, so running the lanes on the code alone missed a reader of the spec. Second, W208's lesson recurred one level out: a census by name sees no reader that compares a whole table (W208: a whole element; here: a whole spec table's row count).

**Questions raised.** None (Q772-Q773 SPENT, unissued). **Closed.** None. ADR 0131 written. **Declared exceptions**: `spec/outcome-record.md` (the figure sentence) and `examples/l6.ts` (the two reference-form checks) — both USED. **For W212**: its L6 block must RUN the `!error` form and REMOVE `NOT_YET_AT_L6` from `examples/l6.ts`, as W192 did.

**The readers' overlap.** **ONE** — the `FD-V27` row's *each message spelling the reference as written* (conformity SHOULD, adequacy SHOULD). Every other finding was one reader's alone.

**Leftover worktrees.** `C:/tmp-w209/base` (clean at `0c42377`), `rc`, `ra`, `m` (git worktrees at `0c42377`, the diff applied — `rc` and `ra` before the reader fixes; `node_modules` COPIED; scanned: 0 links, 0 reparse points), with `C:/tmp-w209/rc-scratch` and `ra-scratch` — left for the maintainer; not removed with `--force`.
