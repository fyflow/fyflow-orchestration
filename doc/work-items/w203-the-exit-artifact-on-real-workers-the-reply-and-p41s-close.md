# W203 — the shared copy on real workers, the driver re-timed, the reply to fyflow-app, and P41's close

**Status:** done 2026-10-22 — `npm run gate:full` on the final tree, one command, EXIT 0 (the Record); both readers RAN, every finding acted on or declared; 7 provocations KILLED, none surviving; the reply written. Earlier: declared 2026-10-22 on `f46abfc` (W202 committed, the tree clean); P41's LAST item: exit clauses (2) and (3), the reply, P41's Record and retro; the declaration step's re-takes below, run before any other edit
**Plan:** [P41](../plans/p41-what-a-reference-to-a-large-value-costs-inside-a-map.md) — *what does a reference to a large
value cost inside a map, and can every instance read one shared copy?* — and this is its LAST item.

```
Spec:       none moves — this item holds ADR 0126's shared copy on real workers and re-times the driver; spec/README.md
            untouched.
Owns:       from P41's W203 row, exactly: examples/l6.ts (the WHOLE file, sentence D′), examples/README.md,
            examples/map-cost.ts, examples/flows/** and examples/workers/** (neither expected to be edited: the block
            writes its registry and flow in itself, W197's and W200's shape), test/definition/l4-corpus.test.ts (if a
            census moves); OUTSIDE this repository,
            ../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass2-followup-2.reply.md
            Exceptions (declared BEFORE the edit, workflow section 7 rule 2): doc/workflow.md — the plan's-last-item
            bookkeeping ONLY (the Status line's count of plans run, section 6's overlap ordinal, the ledger rows a retro
            appends to), P40's close (7046745) the precedent, P41's W203 row naming it. The record step's four files
            carry P41's Record and retro and any dated note. Anything else found to need an edit is a STOP-AND-ASK.
Inputs:     P41 decisions 1-8, facts 1-10, stop-and-asks (a)-(g) ANSWERED ((f) as (f2), (g) as (g1)); W202's Record
            (its numbers, its readers' RegExp finding taken as recommended — a RegExp shared UNFROZEN and named in the
            gap, the maintainer's position relayed to this item: kept, and recorded in P41's Record as revisable);
            ADR 0126; W200's L6 block and examples/map-cost.ts as the shapes this item extends; fyflow-app's
            pass2-followup-2.md and the two earlier reply files beside it for form.
Outputs:    (1) one L6 block in examples/l6.ts, `W203 exit`, node 24 and deno, a THREADED and an INLINE pool. Per pool:
                (a) the fetch-then-map shape — `fetch` returns a LARGE result holding the item list (TWELVE items,
                    `10` and `11` beside `1`) beside a nested catalogue; a map over it whose branch `work` declares
                    `needs: { item: "$item", all: "fetch", run: "$payload" }`. Every instance's `all` EQUAL to
                    fetch's result BY HAND, its `run` the payload by hand, its `item` its own — and the pool's
                    observable: on the INLINE pool every instance's `all` FROZEN at depths 0, 1 and 3 — `all`, `catalogue`, `rows[0]`;
                    *declared as depth 0 and 2, a miscount the conformity reader found (N4)* (the shared copy
                    handed as is), on the THREADED one NOT (`postMessage`'s clone). CONTROL: the same hand value with
                    ONE element changed differs from every `all` compared.
                (b) an INLINE worker writing into a nested plain field of its `all` value: that task's attempt fails
                    with `TypeError`, read off the outcome record's error (optional, `maxRetries: 0` as declared; BUILT
                    `maxRetries: 1`, two attempts each failed, so the retry policy's end is shown — the conformity
                    reader's S1, recorded here rather than rewritten); its siblings and a LATER reader after the join see the value as
                    fetched. Beside it, the THREADED worker's same write lands on its own clone (its own `after`
                    shows the mark) and reaches no sibling and no later reader. Each its own claim, each with its
                    control (the writer's own record, the throwing one's error name read where a no-throw reads none).
                (c) a PREDICATE on `work`'s edge writing into its `ctx.needs.all`: the run STOPS (`halted`) with that
                    `TypeError` reported once — beside the CONTROL run whose predicate writes its own `"$item"` and
                    completes. Runtime-independent of the pool (a predicate runs in the driver), so asserted once
                    per pool flow.
                (d) the gap's real-worker witness ((f2)): `fetch`'s result holds a `Uint8Array` and a `Map`; an INLINE
                    worker writing `bytes[0]` and `map.set` — no throw — and a LATER reader of `fetch` (after the
                    join) sees both writes; the stored record (the outcome record's result) does not. On the THREADED
                    pool the same writes land on the worker's clone and the later reader sees the value as fetched.
            (2) examples/map-cost.ts — the LARGE-READ subjects (the fetch-then-map shape, fetch's result ~100 KB, and
                the same flow reading a SMALL node), the driver alone, at 1,000 / 2,000 / 4,000 items, each size a
                fresh process, time and peak heap over baseline, BEFORE on `88059b7` (W202's re-take, the same
                harness) and AFTER on the final tree, node 24 and deno. A measurement, NOT a gate entry (Q179).
            (3) examples/README.md — X10's copies of the L6 counts moved by this block alone; the map-cost row.
            (4) the reply to fyflow-app, once this item's gate is green.
            (5) P41's Record and retro; doc/workflow.md's plan-close bookkeeping (the declared exception).
Depends on: W202
Blocks:     nothing — the plan closes with this item
Tests:      Output (1) is the test: expected values by hand from the worker's source and ADR 0126 rules 1-3, the
            gap from ADR 0126 rule 2 and spec/flow-definition.md section 3's READ-ONLY sentence. Output (2) is a
            measurement. W202's L1-L5 suites are re-run, not edited.
Gate:       `npm run gate:full` (the plan's LAST item, workflow v0.29) — ONCE, on the final tree, after the readers
            (sentence C); `npm run gate` before the readers; L6 in node 24 and deno; then the conformity reader and the
            adequacy reader, workflow section 6.
Reserves:   Q755-Q759, ADR 0127 (expected unused)
```

## Scope

**In**

1. **The exit artifact on real workers** — Output (1): P41 exit clause (3).
2. **The driver re-timed** — Output (2): P41 exit clause (2).
3. **The counts' copies** — Output (3).
4. **The reply, the plan's close** — Outputs (4), (5).

**Out** — named rather than left implicit, with where it goes instead

- **Any logic in `src/`** — W202's; this item places none (P41's W203 row: *a counter or `src/` site it cannot read is
  an Exception named before the edit*).
- **The RegExp's treatment** — W202's, taken as recommended (shared unfrozen, named in the gap); the maintainer may
  revise it, and P41's Record says so.
- **The 0.10.0 version bump, the push and the publish** — the maintainer's ((d)).

## What the declaration step re-took, before anything was edited

*P15 decision 5. Taken 2026-10-22 on `f46abfc`, the tree clean; harnesses and logs in the session scratchpad's `w203/`.*

| # | re-take | measured |
|---|---|---|
| 1 | the release state | npm `fyflow-orchestration`: `0.0.0-stage`, `0.7.0`, `0.8.0`, `0.9.0`, `0.9.1`, `latest` 0.9.1; JSR `@fyflow/orchestration` latest 0.9.1 (2026-10-22T08:54Z); tags `v0.7.0`-`v0.9.1`, `v0.9.1` at `6957919`; `origin/main` at `6957919` (`git ls-remote`) — P41's `88059b7` and `f46abfc` NOT pushed; manifests 0.9.1 / 0.9.1 |
| 2 | `npm run state` | P42 W203 Q755 ADR 0127 from the tree; W202 Q750 ADR 0126 from the ledger — the two DISAGREE until P41's retro writes its sentence (expected); L6 2815 / 230 |

## Verification

`npm run gate` before the readers (sentence C); the two readers in their own worktrees under `C:/tmp-w203/` (`f46abfc`
plus this diff, `node_modules` copied, scanned for links and reparse points before use); the readers' findings acted on;
the author's provocations in a third copy; then `npm run gate:full` once, on the final tree. **Routing coverage**: a
nested fan-out (Q6) — not in the block (W202's L2 case 9 holds the shared copy two maps deep); `user_action` (Q17) — the
inline writer is OPTIONAL so its failed attempt ends `failed`, stated; a non-optional writer would park `user_action`
by Q17's rule, not asserted here; a branch routed away from its join (Q4) — not reached: the failed optional writer's instance routes on by
its `on: ["failed"]` edge and ARRIVES (as declared this read *its join firing over the rest*; the edge was in the flow
from its first run); no matching decision edge (Q10) — the predicate's throw stops the run
before any edge is chosen; a duplicate task id (Q13) — not applicable.

## The author's provocations

`mut.mjs` (the session scratchpad's `w203/`, logs `mut1.log`, `mut2.log`, `mut3.log`) in the byte copy `C:/tmp-w203/m`,
node 24.20.0 asserted at its head: each probe edits ONE clause of `src/driver/driver.ts`, its anchor checked to occur once
in the CURRENT text and the edit checked to change the file; `node examples/l6.ts`; the W203 claims that went red graded
against the SET the probe declares, matched exactly; the file restored from its FIRST snapshot and its SHA-256 compared
after every probe. Written to ADR 0126's rules, not to the block. Re-run in full after acting on the readers (mut2).

| probe | the clause broken | declared, per pool | verdict |
|---|---|---|---|
| CONTROL | none | none | **CLEAN** — 2831 / 0, every run |
| P1 | rule 1: the per-read clone restored at `compose`'s node-reference site | inline: run, holds, writer, gap, edge | mut1 **WRONG-SET** — `inline:edge` red beyond the declared four: the writer now settles `done`, so its edge predicate runs too (12 calls, 11 expected) — the declaration's omission, derived after the fact; re-cut, mut2 **KILLED** |
| P2 | (g1), ADR 0041 rule 4: the per-read clone at `resolveNeeds` | both: edge, halt | **KILLED** |
| P3 | rule 1 / decision 2: `"$payload"` cloned per read | inline: holds | **KILLED** |
| P4 | rule 2: the freeze SHALLOW | inline: run, holds, writer, reach, edge, halt; threaded: edge, halt; inline `read` declared MAYBE before the run (whether the landed write reaches a sibling's settlement clone is the fan-out's order) | **KILLED** — `read` went red too |
| P5 | rule 6: the STORED record frozen in place and shared | inline: gap | **KILLED** |
| P6 | rule 5: an edge handed its OWN shared copy (the adequacy reader's D12, unseen at L6 before its construction) | inline: gap | **KILLED** — by the new edge-predicate element |
| P7 | rule 2's gap CLOSED for a `Map` (its `set` throws) — the adequacy reader's NIT 2 | inline: run, gap, reach | mut2 **WRONG-SET** — `inline:reach` red too: a failed `scribe` has no result, so REACHES reads `NO MARK` for it — the declaration's omission; re-cut, mut3 **KILLED** in 49 s (a GAP verdict on a SETTLED run, where before the readers' fix it was a 30 s deadline) |

**7 KILLED, 0 SURVIVED, the control CLEAN, digests equal after every probe.** Two first verdicts WRONG-SET, each a
declared set short by one observer the probe's own effect reaches — recorded, re-cut, re-run.

## Readers (2026-10-22), and what was acted on

*Both read the spec first; each reported and fixed nothing; the author's tree held still while they read (the gate ran
on it, read-only). Each verified its copy green first: `node examples/l6.ts` EXIT 0, 2831 / 0 (the conformity reader in
deno too).*

| reader | finding | acted on |
|---|---|---|
| conformity S1 | the declaration says `maxRetries: 0`, the code `maxRetries: 1` | **RECORDED** in the declaration in place (a dated note) — the code is the stronger form |
| conformity S2 | nothing shows `shCanon` can see a `Map`-only difference: the gap joined both halves into one string, so a canonicaliser blind to `Map` passes on the bytes half alone | **FIXED** — the gap's halves compared APART, and the claim carries the canonicaliser's SELF-CONTROL (a one-entry `Map` difference and a one-byte difference, each told apart) |
| conformity N3 | `includes("'mark'")` matches any error naming `mark` | **FIXED** — `"read only property 'mark'"`, the freeze's own message |
| conformity N4 | *depths 0-2* where `rows[0]` is depth 3 | **FIXED** — block, header row, label, declaration |
| conformity N5 | the label `ctx.needs.fetch` (the key is `all`); the subject *an INLINE worker's write* on the threaded check | **FIXED** — `ctx.needs.all (fetch's copy)`; the subject is *the WRITER* |
| conformity N6 | `map-cost.ts`' `BEFORE_DENO` and `BEFORE` comments | **FIXED** |
| conformity N7 | README: *every instance handed …* where 11 are compared | **FIXED** — *every non-writing instance* |
| conformity, constructions | no real-worker claim holds an edge's `ctx.needs.all` to be the worker's object; `"$payload"` identity; threaded cannot tell shared from per-read; inline *reaches nothing else* trivially true | the first **FIXED** with the adequacy reader's construction (below); the rest **DECLARED** — L2's (`shared-reference.test.ts`), and the threaded one unavoidable (`postMessage` clones) |
| adequacy | 59 mutant runs on five byte copies: clause mutants D1-D19 and Dval, block mutants B1-B10 with their named trees, order probes O1-O8 | — |
| adequacy NIT 1 | *a map of at least twelve* held by nothing (`SH_ITEMS = 4` green) | **FIXED** — the READ claim reads the instance count off the run, `>= 12` |
| adequacy NIT 2 | a CLOSED gap (D4) caught only by the 30 s deadline: `scribe` non-optional parks `user_action` | **FIXED** — `scribe` optional, `maxRetries: 0`, its failure routed on; P7 KILLED on a settled run |
| adequacy, construction | no L6 claim witnesses rule 5's ONE resolver (D12 green at L6, red only at L2) | **FIXED** — `later`'s edge predicate reads `fetch` after the gap's write: on the inline pool it sees the write, on the threaded pool not; P6 KILLED |
| adequacy, survivors | D3 (a view's buffer frozen) and B6a EQUIVALENT; D6, D7, D9b, D12, D16, D19 killed at L2 — exit (3) does not ask for the `all` or `?` forms, cross-run copies or `"$payload"` identity; B1, B2, B4, B10 constants on the green tree, each named tree killed but B10D8a (a frozen `"$item"`, W192's at L6) | **DECLARED** — the reader's own arguments, checked against exit (3); D12 now killed at L6 too (P6) |
| adequacy, order | O1-O8 all green, in node and deno where run; O8 shows the injection fires | — |

## Record

*Filled 2026-10-22, after both readers, the provocations and the confirming gate. Harnesses and logs in the session
scratchpad's `w203/`.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate` before the readers (sentence C) | RAN — **EXIT 0**, 16:34:49 → 16:39:16 (`w203/gate-1.log`) | lint; typecheck; every check, `check:docs` X10 2 copies at 2831 / 234; L1-L5 **91 files / 2,174 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 2,174); L6 **2,831 / 234, 0 failed** in node and deno — the block green on its second run (its first found two harness bugs of the author's: task ids written without their `-` path, and an edge value compared after an inline write had reached the object) |
| L6 after the readers' fixes | RAN — node EXIT 0 (`l6-3.log`), deno EXIT 0 (`l6d-3.log`), 2,831 / 234, 0 failed | no claim added: every fix widened an existing tuple |
| conformity reader (`C:/tmp-w203/rc`) | RAN | no BLOCKER; 2 SHOULD, 5 NIT — above |
| adequacy reader (`C:/tmp-w203/ra`, five byte copies `ra-scratch/t1`-`t5`) | RAN | 59 mutant runs; no BLOCKER, no SHOULD; 2 NIT and one construction — above; `ra` byte-identical after (its manifest) |
| the author's provocations (`C:/tmp-w203/m`) | RAN | **7 KILLED, 0 SURVIVED**, control CLEAN; two WRONG-SET first verdicts re-cut |
| **`npm run gate:full`** on the final tree, held still | RAN — **EXIT 0**, one command, 17:31:34 → 18:19:52 (`w203/gatefull.log`, 2,898 s) | lint; typecheck; every check, `check:docs` 51 `run` and X10 2 copies at 2831 / 234, `check:spec` C4 45; L1-L5 **91 files / 2,174 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 2,174); L6 **2,831 / 234, 0 failed** in node and deno; selftests **11/11 ok**, `check:register:selftest` included (2,632.3 s wall, 10 lanes). The tree's diff digest equal before and after. Written after it: this Record's gate row and Status, the plan's Status and gate cells, and the commit hash — `check:register`, `check:markdown`, `check:spec`, `check:budget`, `check:wiring` and `check:docs` re-run on them |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the `W203 exit` L6 block — sixteen claims, four runs | yes | P1-P7; `CROSS_ROW_SUBJECTS` (sixteen names); `DECLARED_TOTAL` / `DECLARED_RUNS`; `X10` |
| (2) `examples/map-cost.ts`' large-read subjects | yes | L0 (lint, `tsconfig.examples.json`); `l6.ts`' construction clause reads its text (`CONSTRUCTION_PRICED`, unmoved). A measurement, not a gate entry |
| (3) `examples/README.md`'s copies | yes | `X10` (2 copies at 2831 / 234) |
| (4) the reply | yes | — (outside the repository) |
| (5) P41's Record and retro; `doc/workflow.md`'s bookkeeping | yes | `check:register`, `check:budget`, `npm run state` (the two id derivations AGREE) |

**The numbers** — `examples/map-cost.ts`' large-read subjects, the driver alone, each size a fresh process started with
`--expose-gc`, time / peak heap over a post-GC baseline. BEFORE on `88059b7` (worktree `C:/tmp-w203/base`, this harness
copied in; `w203/large-before.jsonl`), AFTER on this item's tree (`w203/large-after.jsonl`; no `src/` edit since W202),
node 24.20.0 / deno 2.9.6:

| subject | items | before, node | **after, node** | before, deno | **after, deno** |
|---|---|---|---|---|---|
| large read (fetch-then-map, ~100 KB) | 1,000 | 543 ms / 179 MB | **29 / 6** | 836 / 174 | **33 / 6** |
| | 2,000 | 1,949 / 470 | **44 / 12** | 2,116 / 467 | **53 / 12** |
| | 4,000 | 7,936 / 1,440 | **75 / 15** | 8,383 / 1,433 | **92 / 15** |
| the same flow reading a SMALL node | 1,000 | 62 / 6 | 27 / 5 | 33 / 6 | 30 / 6 |
| | 2,000 | 73 / 10 | 50 / 11 | 55 / 12 | 52 / 10 |
| | 4,000 | 118 / 16 | 77 / 15 | 98 / 15 | 89 / 15 |

**P41 prediction 2 HOLDS on this harness**: at 4,000 items the large read is 75 ms against 77 for a small node (within
2x), 15 MB against 1,440 (1%). This harness's BEFORE time is about half the maintainer's at 4,000 (7,936 ms against
W202's 15,475 on `perf/q186.ts`): it walks its queue by index and releases each config once walked, where that one
`shift()`s and keeps them — the heap figures agree (1,440 against 1,448 MB). The conformity reader re-ran AFTER: 34 / 54
/ 92 ms, 6 / 12 / 16 MB.

**Predictions.** P41 prediction 6 **HOLDS**: `X10` moved by this block alone, 2815 / 230 → 2831 / 234; no `EXPECTED` row,
pair row or other block moved. Prediction 2 **HOLDS** (above). This item placed no logic: no `src/` file edited.

**What broke.** At no rung. Two harness bugs of the author's, found on the block's first run, before the gate. The
readers found what the author's set did not: a canonicaliser whose `Map` half could go blind behind the bytes half, a
declared floor (twelve items) held by nothing, a closed gap seen only by a deadline, and rule 5's one resolver with no
real-worker witness — each now part of an existing claim, each with a probe that kills it.

**What this taught.** *For the retro*: **a probe's declared set is a derivation over EVERY observer its effect reaches,
not over the claim it targets** — P1 and P7 each went WRONG-SET by one claim the probe's effect reached downstream (an
edge that now runs, a result that is now absent). The harness grading the SET exactly is what caught both; a *went red*
predicate would have called each KILLED with the derivation wrong. One item, two occurrences.

**Questions raised.** None (Q755-Q759 SPENT, unissued). **Closed.** None. ADR 0127 SKIPPED. **Record step**: P41's Record
and Retro; `doc/workflow.md`'s bookkeeping (the declared exception); ADR 0126 consequence 1's *six shapes* corrected to
seven, dated (`doc/decisions/**`).

**The readers' overlap.** **TWO** — the canonicaliser's blindness (conformity S2; adequacy B2B3, *the READ control is the
sole sensor of a vacuous `shCanon`*), and no real-worker witness that an edge's object is a worker's (the conformity
reader's first construction; the adequacy reader's construction, D12). Every other finding was one reader's alone. The
two briefs were written apart and named no common specific.

**Leftover worktrees.** `C:/tmp-w203/base` (at `88059b7`, `examples/map-cost.ts` replaced by this item's with its BEFORE
placeholders zeroed), `rc`, `ra`, `m` (at `f46abfc` plus this item's diff) — git worktrees, `node_modules` COPIED, scanned
before use: 0 links, 0 reparse points; and `ra-scratch`, `rc-scratch` (plain directories, the readers'). Left for the
maintainer; none removed with `--force`.
