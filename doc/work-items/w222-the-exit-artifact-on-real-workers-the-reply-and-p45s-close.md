# W222 — a comparison's `valueFrom` on real workers; the reply to fyflow-app; P45's close

**Status:** done 2026-10-25 — `npm run gate:full` on the final tree, one command, EXIT 0 (the Record); both readers RAN, every finding acted on or declared; 14 provocations, every one as declared; the reply written. Earlier: declared 2026-10-25 on `214e1d5` (W223 committed, the tree clean); P45's LAST item: exit clause (3), the reply, P45's Record and retro; this file written from the plan's row BEFORE any other edit
**Plan:** [P45](../plans/p45-what-a-comparison-may-compare-against-and-who-may-read-a-key-path.md) — *what may a
comparison compare against, and who may read a key path the way a gate does?* — and this is its LAST item.

```
Spec:       none moves — this item holds ADR 0140's `valueFrom` (spec/flow-definition.md v0.55: section 3's `when`
            subsection and its `valueFrom` table, FD-C3, FD-C7, FD-V42, FD-V43) on real workers; spec/README.md untouched.
Owns:       from P45's W222 row, exactly: examples/l6.ts (the WHOLE file, sentence D′), examples/README.md,
            examples/flows/** and examples/workers/** (neither expected to be edited: the block writes its registry and
            flow in itself, W218's shape — and W221's Record warns that a corpus file feeds every corpus-derived count,
            which a flow written in the block does not), test/definition/l4-corpus.test.ts (if a census moves);
            OUTSIDE this repository,
            ../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass6.reply.md
            Exceptions (declared BEFORE the edit, workflow section 7 rule 2): doc/workflow.md — the plan's-last-item
            bookkeeping ONLY (the Status line's count of plans run, section 6's overlap ordinal, the ledger rows a retro
            appends to), P44's close (W218) the precedent, P45's W222 row and its always-read-set sentence naming it.
            The record step's four files carry P45's Record and retro. AND P45's plan file OUTSIDE its Record — the
            header's Reserves line and the Ids section's "Reserved here" line, both reading "W223 expected unused
            unless (h1)", stale since (h1) issued W223 — by the instruction carried in this item's brief (P45's
            Status line moves at the close as P44's did). Anything else found to need an edit is a STOP-AND-ASK.
Inputs:     P45 decisions 2-9, facts 3-6, (a1), (b1), (d1), (g1); ADR 0140; W220's, W221's and W223's Records (their
            counts, walls, readers' findings and hand-offs); W218's L6 block as the shape this item extends;
            test/driver/value-from.test.ts (pass 6's flow at L2); fyflow-app's pass6.md and pass5.reply.md for form.
Outputs:    (1) one L6 block in examples/l6.ts, `W222 exit`, node 24 and deno, a THREADED and an INLINE pool. Per pool,
                ONE flow shape: the entry `if` gate `ab` on `input.a lt <right>` — `then` to the echo `abThen`, else to
                the echo `abElse`, both on to `sizeLimit`; `sizeLimit` (a Limit: returns `{ max }` from its settings);
                `stat` (a StatPath: returns `{ size }` from its settings), whose edge to `copy` is pass 6's own —
                `when: { path: "outcome.result.size", op: "lte", <right> }`, `needs: { limit: "sizeLimit" }` — with a
                default edge to `skip`; `copy` and `skip` -> the END `done`. FIVE runs per pool, each on its own runtime
                and run id, max 100 in every one:
                  A  CLAIMED     edge `valueFrom: "needs.limit.max"`, if `valueFrom: "input.b"`; size 50,  `{a:1,b:2}`
                  B  CLAIMED     the same rights;                                                 size 150, `{a:3,b:2}`
                  C  LITERAL     edge `value: 100`, if `value: 2`;                                size 50,  `{a:1,b:2}`
                  D  LITERAL     the same rights;                                                 size 150, `{a:3,b:2}`
                  E  ABSENT      edge `valueFrom: "needs.limit.nope"`, if `valueFrom: "input.b"`; size 50,  `{a:1}`
                Claims, each its own verdict, every expected value BY HAND below:
                (a) the EDGE, lte — run A routes `copy`: copy dispatched, skip not; the run completed; and the premise,
                    what the real workers returned: sizeLimit `{"max":100}`, stat `{"size":50}`;
                (b) the EDGE, gt — run B routes `skip`: skip dispatched, copy not; completed; stat `{"size":150}`;
                (c) the EDGE's LITERAL CONTROL — runs C and D route `copy` and `skip`, the roads A and B took;
                (d) the EDGE's ABSENT CONTROL — run E, `needs.limit.nope` (a declared key, an absent leaf), routes
                    `skip` where size 50 is below max 100 — the road A's present `valueFrom` did not take;
                (e) the IF, then — run A's `ab` routes `then`: abThen dispatched, abElse not;
                (f) the IF, else — run B's `ab` routes `else`: abElse dispatched, abThen not;
                (g) the IF's LITERAL CONTROL — runs C and D route `then` and `else`;
                (h) the IF's ABSENT CONTROL — run E, `input.b` absent, routes `else` where `input.a` is 1.
                EIGHT claims per pool, sixteen in all; TEN runs. **After the adequacy reader** (SHOULD 1-4, the Record):
                three runs per pool added — F (A's rights, size 100, `{a:2,b:2}`), G (F with the literals) and H (E's
                rights and inputs with both operators `gt`) — and three claims per pool: (i) the EDGE at the BOUNDARY,
                F and G `copy`; (j) the IF at the BOUNDARY, F and G `else`; (k) the ABSENT CONTROL under `gt`, H `skip`
                and `else`. Every `if` claim also reads the payload its echo handed on, and every edge claim the number
                of the run's tasks that ran in the main realm (0 threaded, 4 inline). ELEVEN claims per pool,
                twenty-two in all; SIXTEEN runs.
            (2) examples/README.md — X10's copies of the L6 counts moved by this block alone; the l6.ts header's table
                row and its list of plans. And (found at the edit, the conformity reader's NIT 1) the l6.ts cell's
                stale TAIL — "69 row labels and 246 runs", with no W218 entry in its enumeration, left by W218's
                record step — moved to 262 and given the W218 and W222 entries.
            (3) the reply to fyflow-app, once this item's gate is green.
            (4) P45's Record and retro; doc/workflow.md's plan-close bookkeeping (the declared exception).
Depends on: W221 (b7f9031), W223 (214e1d5)
Blocks:     nothing — the plan closes with this item
Tests:      Output (1) is the test: expected values by hand from the flow written in the block, the payloads, the
            settings and spec/flow-definition.md v0.55 (section 3's operators, the `valueFrom` table: compared as the
            literal would be; an ABSENT `valueFrom` no match for every operator; the `if`'s `input` root; FD-C3: the
            decision's `needs` is the object the edge's `needs` describes). W220's, W221's and W223's L1-L5 suites are
            re-run, not edited.
Gate:       `npm run gate:full` (the plan's LAST item, workflow v0.29) — ONCE, on the final tree, after the readers
            (sentence C); `npm run gate` before the readers (B′, the draft, in a byte copy under C:/tmp-w222); L6 in
            node 24 and deno; then the conformity reader and the adequacy reader, workflow section 6, in worktrees
            under C:/tmp-w222; rule 8 on any fix, with a no-op control.
Reserves:   Q795-Q796 (P45's per-item block); no ADR (ADR 0142 reserved by P45, expected unused)
```

## Scope

**In**

1. **The exit artifact on real workers** — Output (1): P45 exit clause (3).
2. **The counts' copies** — Output (2).
3. **The reply, the plan's close** — Outputs (3), (4).

**Out** — named rather than left implicit, with where it goes instead

- **Any logic in `src/`** — W220's, W221's; this item places none (P45's W222 row: *a counter or `src/` site it cannot
  read is an Exception named before the edit*).
- **A flow file under `examples/flows/`** — the block writes its flow in itself (W218's shape), so no corpus-derived count
  (`wiring.test.ts`' arcs, `result-value.test.ts`' outcome-record figure, W211's partition) moves.
- **The 0.13.0 version bump, the push and the publish** — the maintainer's ((e1)).
- **P44 retro (b)** — ADR 0102's `stopped` dual read; no P45 row touches resume.

## Hand-derived values (written before the first run)

From spec/flow-definition.md v0.55. `lte` is true where both sides are numbers and left ≤ right; `lt` where left < right.
A `valueFrom` resolving to a number is compared as that literal would be; an ABSENT one is no match for every operator.
The edge's decision context: `outcome` is `stat`'s outcome (`result` `{ size }`), `needs.limit` is `sizeLimit`'s result
(`{ max: 100 }`) by FD-C3 and the edge's `needs`. The `if`'s context is `{ input }`, `input` the run's payload (the
entry node is handed the payload). A gate passes the value that reached it on, so `abThen`/`abElse` hand the payload to
`sizeLimit`, whose own result comes from its settings.

| run | edge: left, op, right | edge verdict | road | if: left, op, right | if verdict | route |
|---|---|---|---|---|---|---|
| A | 50 lte `needs.limit.max` = 100 | true | `copy` | 1 lt `input.b` = 2 | true | `then` |
| B | 150 lte 100 | false | `skip` (default) | 3 lt 2 | false | `else` |
| C | 50 lte literal 100 | true | `copy` | 1 lt literal 2 | true | `then` |
| D | 150 lte literal 100 | false | `skip` | 3 lt literal 2 | false | `else` |
| E | 50 lte `needs.limit.nope` = absent | **no match** | `skip` | 1 lt `input.b` = absent | **no match** | `else` |
| F *(after the readers)* | 100 lte `needs.limit.max` = 100 | true (equality) | `copy` | 2 lt `input.b` = 2 | false (equality) | `else` |
| G *(after the readers)* | 100 lte literal 100 | true | `copy` | 2 lt literal 2 | false | `else` |
| H *(after the readers)* | 50 **gt** `needs.limit.nope` = absent | **no match** | `skip` | 1 **gt** `input.b` = absent | **no match** | `else` |

**Why E separates**: run E's left sides are run A's (50, 1), and with the right side present (A) both comparisons are
true; so a `valueFrom` that resolved a missing key to anything that ordered above 50 and 1 — or an evaluator ignoring the
right side — would take `copy` / `then`. And A against B shows the right side is READ: a `valueFrom` treated as absent
would send A to `skip` / `else`.

## Predictions, written before the change

1. **P45 prediction 6**: `X10` moved by this block alone — 2883 / 252 → **2899 / 262** (+16 claims, +10 runs);
   `CROSS_ROW` 550 → 566; no existing L6 row, pair row or block moves.
2. No L1-L5 count moves (106 files / 2,321 cases, W223's figure): the block is `examples/**`, outside the bundle (`RT-R10`).
3. Every claim green on both pools in node 24 and deno on the first full run (the pass-6 shapes ran at L2 in W221).

## Verification

`npm run gate` on the draft in a byte copy `C:/tmp-w222/m` (a worktree at `214e1d5`, the diff applied, `node_modules`
COPIED, scanned: no links, no reparse points) before the readers (sentence C); the two readers in their own worktrees
under `C:/tmp-w222/`; the author's provocations in `m`, re-run after acting on the readers; then `npm run gate:full` once,
on the final tree, held still. **Routing coverage**: no matching decision edge (Q10) — the subject: run E's edge and its
`if` both fall to the default; a branch routed away (Q4) — no join here; `user_action` (Q17) — not reached; a duplicate
task id (Q13) — each run its own id, each its own runtime; a nested fan-out (Q6) — none.

## The author's provocations

`mut.mjs` (the session scratchpad's `w222/`; logs `C:/tmp-w222/mut1.log` on the first cut, `mut2.log` on the block as
the readers left it) in the byte copy `C:/tmp-w222/m`, node 24 asserted at its head: each probe edits ONE clause, its
anchor checked to occur once in the CURRENT text and the edit checked to change the file; `node examples/l6.ts`; the W222
claims that went red graded against the SET the probe declares, per pool, matched exactly; every file restored from its
FIRST snapshot and its SHA-256 compared. Written to spec/flow-definition.md v0.55's `valueFrom` table and FD-C3/FD-C7.

| probe | the clause broken | declared, both pools | mut1 | mut2 |
|---|---|---|---|---|
| CONTROL | none | none | **CLEAN** | **CLEAN** |
| CRASH | grader control: a syntax error in the evaluator | CRASH | **CRASH** (right) | **CRASH** (right) |
| R1 | `valueFrom` is READ — taken as the literal (undefined) | EDGE lte, IF then (+ EDGE at the BOUNDARY, mut2) | **KILLED** | **KILLED** |
| R2 | an ABSENT `valueFrom` is NO MATCH — answered as a match | both ABSENT controls (+ the ABSENT CONTROL under gt, mut2) | **KILLED** | **KILLED** |
| R3 | no default stands in for an absent right side — the left value does | EDGE's ABSENT | **KILLED** | **KILLED** |
| R4 | the right side reads its own path — it reads the left's | EDGE gt, EDGE's ABSENT, IF then | **KILLED** | **KILLED** |
| B1 | the block: the absent control run takes the claimed right side and input | both ABSENT controls | **KILLED** | **KILLED** |
| B2 | the block: the literal controls compare against 40 and 0 | both LITERAL controls | **KILLED** | **KILLED** |
| O1 | rule 8 (c): `sizeLimit`'s worker returns max 40 | every EDGE claim | **KILLED** | **KILLED** |
| S1a | (reader E7) `valueFrom`-only `lte` answered as `lt` | EDGE at the BOUNDARY | — | **KILLED** |
| S1b | (reader E8) `valueFrom`-only `lt` answered as `lte` | IF at the BOUNDARY | — | **KILLED** |
| S3 | (reader E3) an absent `valueFrom` read as `0` | the ABSENT CONTROL under gt | — | **KILLED** |
| S2 | (reader T2) run E's payload `a` 1 → 3 | IF's ABSENT | — | **KILLED** |
| S4 | (reader T1) the inline type made threaded | every INLINE edge claim, no threaded one | — | **KILLED** |

## Record

*Filled 2026-10-25, after both readers, the provocations and the confirming gate. Logs in `C:/tmp-w222/`.*

**What the declaration step re-took** (P15 decision 5, on `214e1d5`, the tree clean): the release state, 17:43 local —
npm `fyflow-orchestration` latest **0.12.0**, JSR `@fyflow/orchestration` latest **0.12.0**, `v0.12.0` and `origin/main`
both `ffcc774` (`git ls-remote`), P45's four commits and Q790's NOT pushed, manifests 0.12.0; L1-L5 106 / 2,321 and L6
2883 / 252 (W223's figures, re-taken by B′ below); the chromium lane not re-taken — this item adds nothing to the bundle
(`RT-R10`).

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L6 on the author's draft, node and deno | RAN — node EXIT 0 (`l6node-1.log`), deno EXIT 0 (`l6deno-1.log`), **2899 / 262**, 0 failed | the first cut; typecheck, lint, `check:docs` (X10 2 copies) EXIT 0 |
| B′ — the draft in the byte copy `C:/tmp-w222/m` (a worktree at `214e1d5`, the three files `cmp`-identical, `node_modules` COPIED, 0 links, 0 reparse points), `npm run gate` before the readers (sentence C) | RAN — **EXIT 0**, 17:49:57 → 17:58:08 (`gate-m.log`) | L1-L5 **106 files / 2,321** in node 24.20.0, deno 2.9.6 and chromium; L6 **2899 / 262, 0 failed** in node and deno; every check EXIT 0. P45 prediction 6 and this item's prediction 2 HOLD |
| conformity reader (`C:/tmp-w222/rc`) | RAN | 0 BLOCKER, 0 SHOULD, 4 NIT; re-derived every route before reading the table, all matched; node, deno and `check:docs` green in its copy |
| adequacy reader (`C:/tmp-w222/ra`, harness and logs in `ra-scratch`) | RAN | 29 mutants in node, 6 re-run in deno, a no-op control green and a CRASH grader right, X10 provoked 4 ways; 0 BLOCKER, 4 SHOULD, 3 NIT; every file restored by digest |
| L6 after the readers' fixes | RAN — node EXIT 0 (`l6node-2.log`), deno EXIT 0 (`l6deno-2.log`), **2905 / 268**, 0 failed; typecheck, lint, `check:docs` (X10 at 2905 / 268) EXIT 0 | runs F, G, H and the premise reads added |
| the author's provocations, mut1 and mut2 (rule 8 on the fixes, with the no-op CONTROL) | RAN — **EXIT 0** both | mut1 9/9 as declared; mut2 **14/14 as declared** — every reader survivor re-introduced and KILLED by the claim the fix added; digests equal |
| **`npm run gate:full`** on the final tree, held still | RAN — **EXIT 0**, one command, 18:38:42 → 19:40:29 (`gatefull.log`) | lint; typecheck; every check, `check:docs` 55 `run` and X10 2 copies at 2905 / 268; L1-L5 **106 files / 2,321** in node 24.20.0, deno 2.9.6 and chromium (parity 2,321); L6 **2905 / 268, 0 failed** in node and deno — no Q599 row red; selftests **11/11 ok**, `check:register:selftest` included (3,215.4 s wall, 10 lanes). The tree's diff digest (this file included) equal before and after. Run over this Record, P45's Record and retro and the bookkeeping already written, this item's commit hash and this row's figures left as placeholders; written after it: this row, the two commit hashes — `check:register`, `check:markdown`, `check:spec`, `check:budget`, `check:wiring` and `check:docs` re-run on them |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the `W222 exit` L6 block — twenty-two claims, sixteen runs | yes | R1-R4, B1, B2, O1, S1a-S4; `CROSS_ROW_SUBJECTS` (twenty-two names); `CROSS_ROW` 572, `DECLARED_TOTAL` / `DECLARED_RUNS`; `X10` |
| (2) `examples/README.md`'s copies, the stale tail; the l6.ts header's row and its list of plans | yes | `X10` (2 copies at 2905 / 268); the tail and the list — prose, read by both readers |
| (3) the reply | yes — `../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass6.reply.md`, status UNRELEASED | — (outside the repository) |
| (4) P45's Record and retro; `doc/workflow.md`'s bookkeeping; the two Reserves lines | yes | `check:register`, `check:budget`, `npm run state` |
| `examples/flows/**`, `examples/workers/**`, `l4-corpus.test.ts` | **not touched** — the flow is written in the block, so no corpus-derived count moved | — |

**Predictions.** 1 **HOLDS, at a different figure**: `X10` moved by this block alone — 2883 / 252 → 2899 / 262 as
predicted for the first cut, then **2905 / 268** once the adequacy reader's findings added six claims and six runs; no
`EXPECTED` row, pair row or other block moved. 2 **HOLDS**: L1-L5 106 / 2,321 unmoved. 3 **HOLDS**: green on the first
full run in both runtimes. This item placed no logic: no `src/` file edited.

**The readers, and what was acted on.**

| reader | finding | acted on |
|---|---|---|
| conformity NIT 1 | the README cell's tail also lacked a W218 entry, which W222 added silently | **FIXED** — the tail's parenthetical names both; Outputs (2) declares the repair |
| conformity NIT 2 | *pass 6's flow*: the fragment wires `sizeLimit` to `copy`; the block runs `sizeLimit` before `stat` | **FIXED** — said in the block comment, the header row, the README and the reply; `stat`'s edge is the accepted form verbatim |
| conformity NIT 3 | claims (c) and (g) each check two runs as one verdict, where P45's paragraph says *each claim its own verdict* | **DECLARED** — the item's claim list defines them over both runs; a failure names both runs' actuals |
| conformity NIT 4 | the comment named the worker `P6Echo`, its key is `p6Echo` | **FIXED** |
| adequacy SHOULD 1 | the boundary is never compared — `valueFrom`-only `lte`→`lt` and `lt`→`lte` survive (E7, E8) | **FIXED** — runs F (`valueFrom`) and G (literal) at size 100 and `{a:2,b:2}`, two claims per pool; mut2 S1a, S1b KILLED |
| adequacy SHOULD 2 | the IF's absent control does not read its own premise (T2) | **FIXED** — every `if` claim reads the payload its echo handed on; mut2 S2 KILLED |
| adequacy SHOULD 3 | *no match for every operator* claimed, only `lte`/`lt` tested; an absent right side read as `0` survives (E3) | **FIXED** — run H, both comparisons `gt` with the right side absent, one claim per pool; the absent controls' labels no longer say *for every operator*; mut2 S3 KILLED |
| adequacy SHOULD 4 | the per-pool label is not verified (T1) | **FIXED** — every edge claim reads how many of the run's tasks ran in the main realm (0 threaded, 4 inline); mut2 S4 KILLED. W218's block has the same shape — P45 retro section 4 (j) |
| adequacy NIT 1, 2 | the object/array row and type-strictness not reached at L6 (E5, E11 equivalent) | **DECLARED** — L1's (`test/definition/value-from.test.ts`), outside the exit clause |
| adequacy NIT 3 | a literal control could become a second `valueFrom` run and stay green (T5) | **DECLARED** — a test-side edit; B2 shows the literal is read |
| adequacy, the rest | E4 equivalent (the type-strict arms already refuse `undefined` under `lt`/`lte`); T4 the known Q217 regress, `X10` red until both README copies move | — |

**Decisions taken by this item**: the flow written in the block, not under `examples/flows/` (W221's warning); one
runtime per run; the realm read through a `globalThis` counter the worker keeps, rather than through the scheduler's
pool record — the one observer both runtimes share.

**What broke.** At no rung of the product. The first cut's controls separated only the wrong answers the author thought
of — its own *Why E separates* paragraph said *anything that ordered above* — found by the adequacy reader; and a README
tail stale since W218, found while editing it.

**What this taught.** *For the retro*: **a block labelled by POOL must read the pool** (P45 retro 4 (j)); and **an
absent-value control needs an operator under which every plausible wrong resolution differs** — `lte` and `lt` cannot see
an absent value read as anything below the left side (rule 8 (a), followed and short).

**Questions raised.** None (Q795-Q796 SPENT, unissued). **Closed.** None. No ADR. **Declared exceptions used**:
`doc/workflow.md`'s bookkeeping; P45's two Reserves lines.

**The readers' overlap.** **ONE** — run E's separation: the conformity reader re-derived that only the absent right side
separates E from A; the adequacy reader showed it holds only for resolutions ordering ABOVE the left (SHOULD 3). One
subject, two compatible findings. The briefs were written apart and named no common specific.

**Leftover worktrees.** `C:/tmp-w222/m`, `rc`, `ra` (git worktrees at `214e1d5` plus this item's diff — `rc` and `ra` the
first cut, `m` synced to the final block; `node_modules` COPIED; scanned before use: 0 links, 0 reparse points), with
`C:/tmp-w222/rc-scratch` and `ra-scratch` (the adequacy reader's four byte copies `c1`-`c4` inside it) — left for the
maintainer; none removed with `--force`.
