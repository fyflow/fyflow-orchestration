# W212 — a failed task's error and an ask's time, on real workers; the reply to fyflow-app; P43's close

**Status:** done 2026-10-24 — `npm run gate:full` on the final tree, one command, EXIT 0 (the Record); both readers RAN, every finding acted on or declared; 16 provocations, every one KILLED or CLEAN as declared after the re-cut; the reply written. Earlier: declared 2026-10-24 on `7055c12` (W211 committed, the tree clean); P43's LAST item: exit clause (3), the reply, P43's Record and retro; this file written from the plan's row BEFORE any other edit
**Plan:** [P43](../plans/p43-what-a-flow-and-a-run-say-as-data-rather-than-as-prose.md) — *what do a flow and a run say
as data rather than as prose?* — and this is its LAST item.

```
Spec:       none moves — this item holds ADR 0131's `"n!error"` (spec/flow-definition.md v0.49) and ADR 0130's
            `observedAt` (spec/run-state.md v0.35, RN-R36, RN-R19) on real workers; spec/README.md untouched.
Owns:       from P43's W212 row, exactly: examples/l6.ts (the WHOLE file, sentence D′), examples/README.md,
            examples/flows/** and examples/workers/** (neither expected to be edited: the block writes its registry and
            flow in itself, W200's, W203's and W206's shape), test/definition/l4-corpus.test.ts (if a census moves);
            OUTSIDE this repository,
            ../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass4.reply.md
            Exceptions (declared BEFORE the edit, workflow section 7 rule 2): doc/workflow.md — the plan's-last-item
            bookkeeping ONLY (the Status line's count of plans run, section 6's overlap ordinal, the ledger rows a retro
            appends to), P42's close (b31a2a8) the precedent, P43's W212 row naming it. The record step's four files
            carry P43's Record and retro. Anything else found to need an edit is a STOP-AND-ASK.
Inputs:     P43 decisions 5, 7 and 9, facts 5-7, (c1), (e1), (h1); ADR 0130, ADR 0131, ADR 0132; W208-W211's Records
            (their counts, walls, readers' findings and hand-offs — W209's: this block RUNS the `!error` form and
            REMOVES `NOT_YET_AT_L6`); W206's and W197's L6 blocks as the shapes this item extends; fyflow-app's pass4.md
            and pass3.reply.md beside it for form.
Outputs:    (1) one L6 block in examples/l6.ts, `W212 exit`, node 24 and deno, a THREADED and an INLINE pool. Per pool,
                one flow: `fetch` (an item list of FOUR) -> a map whose branch `probe` (OPTIONAL, no retry) THROWS a
                known message for items 1 and 3, each its own, and returns for 0 and 2 — so every wrong order of the
                four answers differs but a swap of the two `null`s — every outcome on to the map's join `collect` -> `lookup`
                (OPTIONAL, no retry), which THROWS a known message where the run's payload says `fail` -> on its
                `on: ["failed"]` edge (and on its default edge) the ask `why`, whose `needs` reads ALL FOUR spellings of
                the error part — `"lookup!error"`, `"lookup!error?"`, `["probe!error"]`, `["probe!error?"]` -> the ask
                `confirm` -> the END `done`. Four runs per pool, each under an INJECTED clock: the FAILING run on
                runtime A (clock A) parked at `why`, A shut down, and the run RESUMED from what a store kept on a fresh
                runtime B (clock B); the same store less its last element (`why`'s `asked` element — a LOST TAIL) resumed on
                a fresh runtime D (clock D); and the SUCCEEDING run (clock C) — EIGHT runs. (g) was added after the
                author's provocation P6 survived (a)-(f). Claims, each its own verdict:
                (a) the ERROR — `why`'s `asked` input carries the thrown message, BY HAND from the worker's source, in
                    the bare and `?` forms, equal to `lookup`'s outcome record's `error`;
                (b) its CONTROL — the same ask after a SUCCEEDING `lookup` carries `null` in both forms;
                (c) the ARRAY forms — `["probe!error"]` and `["probe!error?"]` are `[null, <probe 1's message>, null,
                    <probe 3's>]` by hand, in item order, on both runs;
                (d) LIVE — `why`'s `asked` element carries `observedAt` clock A, and the fold's `askedAt` the same;
                (e) RESUMED — on B, once A is gone, the run is not refused, and `why`'s `askedAt` in B's state and its
                    `asked` element in B's checkpoint are clock A — the ORIGINAL;
                (f) its CONTROL, PAST THE TAIL — `confirm`, asked on B after the resume, carries clock B, and the run
                    completes;
                (g) a LOST TAIL — on D, `why` regenerated PAST the stored tail inside the replayed step, stamped clock D.
            (2) the two reference censuses read the block's flows; `NOT_YET_AT_L6` and `exemptSpelling` REMOVED, so both
                censuses compare section 3's whole table — the `!error` row and its four spellings — with no exemption.
            (3) examples/README.md — X10's copies of the L6 counts moved by this block alone.
            (4) the reply to fyflow-app, once this item's gate is green.
            (5) P43's Record and retro; doc/workflow.md's plan-close bookkeeping (the declared exception).
Depends on: W211
Blocks:     nothing — the plan closes with this item
Tests:      Output (1) is the test: expected values by hand from the worker's source, ADR 0131 rules 1 and 3, ADR 0130
            rules 1-2 and the flow's own definition; the clocks are constants the block injects. W208-W211's L1-L5 suites
            are re-run, not edited.
Gate:       `npm run gate:full` (the plan's LAST item, workflow v0.29) — ONCE, on the final tree, after the readers
            (sentence C); `npm run gate` before the readers; L6 in node 24 and deno; then the conformity reader and the
            adequacy reader, workflow section 6.
Reserves:   Q778-Q779, ADR 0134 (expected unused)
```

## Scope

**In**

1. **The exit artifact on real workers** — Outputs (1), (2): P43 exit clause (3).
2. **The counts' copies** — Output (3).
3. **The reply, the plan's close** — Outputs (4), (5).

**Out** — named rather than left implicit, with where it goes instead

- **Any logic in `src/`** — W208's and W209's; this item places none (P43's W212 row: *a counter or `src/` site it cannot
  read is an Exception named before the edit*).
- **`definitionSchema` at L6** — exit clause (1) is L1 in three runtimes (W210, W211); a schema has no real-worker half.
- **[Q774](../questions/q774.md)** — `FD-V21` and a non-string `of` / branch entry; the maintainer's call, named in the retro.
- **The 0.11.0 version bump, the push and the publish** — the maintainer's ((h1)).

## What the declaration step re-took, before anything was edited

*P15 decision 5. Taken 2026-10-24 on `7055c12`, the tree clean; harnesses and logs in the session scratchpad's `w212/`.*

| # | re-take | measured |
|---|---|---|
| 1 | the release state (01:42 +0200) | npm `fyflow-orchestration`: `0.0.0-stage`, `0.7.0`-`0.9.1`, `0.10.0`, `latest` **0.10.0**; JSR `@fyflow/orchestration` latest **0.10.0** (2026-10-23T05:11Z); tags `v0.7.0`-`v0.10.0`, `v0.10.0` at `26c55ed`; `origin/main` at `26c55ed` (`git ls-remote`) — P43's commits (`e52348d` … `7055c12`) NOT pushed; manifests 0.10.0 / 0.10.0 |
| 2 | `npm run state` | P44 W212 Q778 ADR 0133 from the tree; W208 Q770 ADR 0130 from the ledger — the two DISAGREE until P43's retro writes its sentence (expected); L6 2847 / 238 |
| 3 | the shape, on a scratch prototype (`w212/proto.ts`) over `7055c12`, node 24 — a THREE-item map and two of the four keys' names (`err`, `maybe`) beside the arrays; the block runs FOUR items (re-cut for rule 8 (a), below) | the flow validates (no finding) against its own registry; on both pools `why`'s `asked` input is `{ err, maybe }` the thrown message and `probes` / `maybeProbes` `[null, <message>, null]`; `observedAt` the injected clock; on B the run resumes, `askedAt` the stored clock, `confirm` the new one; the success run's `err` `null`. Every value as derived by hand — the prototype is a feasibility check, never the expected side |
| 4 | W208-W211's counts on this item's draft — `npm run gate` (sentence C), 01:53:01 → 02:00:58, **EXIT 0** (`w212/gate-1.log`) | L1-L5 **100 files / 2,267 cases** in node 24.20.0, deno 2.9.6 and chromium (parity) — W211's figure, this item touching no suite; every check EXIT 0, `check:docs` X10 2 copies, C4 45; L6 **2,859 / 0** over 244 real runs in node and deno (the block's first cut) |
| 5 | the chromium lane's wall (`w212/chromium-wall.mjs`, W210's harness writing `dev-dist/w212-timed`), on the final tree | in-page **57.0 s**, goto-to-result 57.4 s, of the 60 s wait (`w212/wall-1.txt`, an adequacy reader running beside it); the P39/P40 map-cost suite 34.1 s; W210's suite 0.79 s. **This item adds nothing to the bundle** (L6 is `examples/**`, `RT-R10`): headroom ~2.6-3.0 s, as W211 left it |

## Verification

`npm run gate` on the draft before the readers (sentence C); the two readers in their own worktrees under `C:/tmp-w212/`
(`7055c12` plus this diff, `node_modules` copied, scanned before use: 0 links, 0 reparse points); the author's provocations
in a third copy, re-run after acting on the readers; then `npm run gate:full` once, on the final tree. **Routing coverage**:
`user_action` (Q17) — not reached (both failing tasks are OPTIONAL, so `failed`); a branch routed away from its join (Q4) —
no; no matching decision edge (Q10) — not reached (`lookup` has an edge for each outcome); a duplicate task id (Q13) — each
run its own id, each runtime its own; a nested fan-out (Q6) — no.

## The author's provocations

`mut.mjs` / `mut2.mjs` (the session scratchpad's `w212/`, logs `mut1.log`-`mut3.log`) in the byte copy `C:/tmp-w212/m`, node
24.20.0 asserted at its head: each probe edits ONE clause, its anchor checked to occur once in the CURRENT text and the edit
checked to change the file; `node examples/l6.ts`; the W212 claims that went red graded against the SET the probe declares,
matched exactly; the file restored from its FIRST snapshot and its SHA-256 compared after every probe. Written to ADR 0131
rules 1-3 and ADR 0130 rules 1-4, not to the block. mut1 ran on the first cut, before the readers reported; mut2 on the block
as the readers left it; mut3 the re-cuts.

| probe | the clause broken | declared, both pools | mut1 | mut2 / mut3 |
|---|---|---|---|---|
| CONTROL | none | none | **CLEAN** | **CLEAN** |
| CRASH | grader control: a syntax error in the driver | CRASH | **CRASH** (right) | **CRASH** (right) |
| P1 | ADR 0131 rule 3, the one form: the error part reads the result | ERROR, CONTROL | **KILLED** | **KILLED** |
| P2 | the array form's branch-path order reversed | ARRAY | **KILLED** — on the four-item fixture; the first draft's three items `[null, m, null]` were a PALINDROME, and the fixture was re-cut before mut1 (rule 8 (a), *every wrong selection differs*) | **KILLED** |
| P3 | the array form reads each result | ARRAY | **KILLED** | **KILLED** |
| P4 | the output entry drops the effective outcome's error | ERROR, ARRAY | **KILLED** | **KILLED** |
| P5 | ADR 0130 rule 2: within the prefix, `now()` not the stored time | RESUMED, PAST THE TAIL (+ LOST TAIL), the clause's throw | **KILLED, wider**: W182's, W192's and W206's resume claims red too — every resume of a run with an ask is refused `diverged` | **KILLED, wider** |
| P6 | ADR 0130 rule 2: past the stored tail INSIDE a replay, the stored (none), not `now()` | PAST THE TAIL | **SURVIVED** — `confirm` is asked after `resume()` drops its replay | re-declared LOST TAIL: **KILLED** |
| P7 | ADR 0130 rule 1: the stamp is not `now()` | LIVE, RESUMED, PAST THE TAIL (+ LOST TAIL) | **KILLED** | **KILLED** |
| P8 | `RN-R36`: the fold drops `askedAt` | LIVE, RESUMED, PAST THE TAIL (+ LOST TAIL) | **KILLED** | **KILLED** |
| P9 | `RN-R36`: `askedAt` not kept through the answer | PAST THE TAIL | **KILLED** | **KILLED** |
| P10 | the forms census does not read the block's flows | the two forms clauses | **KILLED** | **KILLED** |
| P11 | the spellings census does not read the block's flows | the spellings clause | **KILLED** | **KILLED** |
| P12 | the adequacy reader's S12: the prefix test `<=` | LOST TAIL | — | **KILLED** |
| P13 | the adequacy reader's S13: past the tail in a replay takes the last stored time | LOST TAIL | — | **KILLED** |
| O1, O2 | rule 8 (f): items 0-1 held 300 ms past 2-3, and the reverse | none | **CLEAN** | **CLEAN** |

## Readers (2026-10-24), and what was acted on

*Both read the spec first; each reported and fixed nothing; each verified its copy green first (`node examples/l6.ts` EXIT 0,
2859 / 0, 244 runs; the conformity reader in deno too). Each copy byte-identical after (the adequacy reader's `cmp` against
its saved originals).*

| reader | finding | acted on |
|---|---|---|
| adequacy SHOULD 1; the author's P6 | PAST THE TAIL's `confirm` is asked LIVE, after `resume()` has dropped its replay, so ADR 0130's past-the-tail branch INSIDE a replay is unexercised: S12 (`<=`) and S13 (the last stored time) survive L6 (both killed at L2) | **FIXED** — claim (g), a LOST TAIL: the store without `why`'s `asked` element resumed on a fresh runtime D under clock D, `why` regenerated past the tail inside the replayed step, stamped D (its premise, that the lost element IS `why`'s, asserted). P6, P12, P13 **KILLED**; (f)'s label and comment now say it is asked live |
| conformity NIT 1 | the block comment's *three instances* — the map has four | **FIXED** |
| conformity NIT 2 | the item's *every wrong order differs* overstates (a swap of the two `null`s); re-take 3 read as the block's measurement | **FIXED** — the qualifier carried; re-take 3 names the prototype's three items and two keys |
| conformity NIT 3 | the census comment's *exactly one of the table's rows carries two spellings*, present tense, false at v0.49 | **FIXED** — dated |
| adequacy NIT 2 (B5) | the INLINE pool collapsed to the threaded type: every claim green — nothing observes which pool ran | **DECLARED** — W197's, W203's and W206's blocks share the shape; the claims are about values the pool does not change |
| adequacy NIT 3 (B10) | `rtA.shutdown()` deleted: green, then the process never exits | **DECLARED** — a missing shutdown hangs the lane (its runner's timeout), it does not pass it; "once A is shut down" is the arrangement |
| adequacy NIT 4 (S20, S21, S7, S24) | ADR 0131 rule 4 (no copy), the `?` form's ABSENCE, the resolution branch, and a non-number stored `observedAt`, unexercised at L6 | **DECLARED** — none claimed; each killed at L1-L5 (S7 by W182's block too); S24 equivalent on real workers |
| adequacy NIT 5 | the scheduler clearing `task.error` across a retry (W209's premise) is pinned by no claim | **DECLARED** — the reader's own probe (`lookup` retried once, its first attempt failing) stayed green on 0.6.0: the premise holds; a retry row is outside exit (3) |
| adequacy, the sweep | 32 mutants (20 `src/`, 12 block) + CONTROL + 2 order probes + a retry probe: 25 KILLED, 7 SURVIVED (S12, S13 — now killed; S20, S21, S24 — L1-L5's; B5, B10 — above), 0 CRASH; S1, S10, S14, B1 re-run in deno with the same verdicts | — |
| conformity, constructions | 7 predictions before running, 7 held: the error part reading the result (6 red), a regenerated element stamped the new clock (refused `diverged`), never stamped (6 red), the array reversed (2), the spelling census blind (1), an `"Error: "` prefix (4, CONTROL green) | — |

## Record

*Filled 2026-10-24, after both readers, the provocations and the confirming gate. Harnesses and logs in the session
scratchpad's `w212/`.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate` before the readers (sentence C) | RAN — **EXIT 0**, 01:53:01 → 02:00:58 (`w212/gate-1.log`) | re-take 4 |
| L6 after the readers' fixes | RAN — node EXIT 0 (`l6-node-4.log`), deno EXIT 0 (`l6-deno-4.log`), **2,861 / 246**, 0 failed | claim (g) and two runs added |
| conformity reader (`C:/tmp-w212/rc`) | RAN | no BLOCKER, no SHOULD, 3 NIT — above |
| adequacy reader (`C:/tmp-w212/ra`, harness and logs in `ra-scratch`) | RAN | 32 mutants; no BLOCKER; 1 SHOULD, 4 NIT — above |
| the author's provocations (`C:/tmp-w212/m`) | RAN | mut1 10 KILLED (P5 wider), P6 SURVIVED, control CLEAN, order CLEAN; mut2 **12 KILLED, 0 SURVIVED**; mut3 P6, P12, P13 KILLED; digests equal after every probe |
| **`npm run gate:full`** on the final tree, held still | RAN — **EXIT 0**, one command, 03:28:52 → 04:29:29 (`w212/gatefull.log`, 3,637 s) | lint; typecheck; every check, `check:docs` 54 `run` and X10 2 copies at 2861 / 246, `check:spec` C4 45; L1-L5 **100 files / 2,267 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 2,267); L6 **2,861 / 246, 0 failed** in node and deno — no Q599 row red; selftests **11/11 ok**, `check:register:selftest` included (3,168.0 s wall, 10 lanes). The tree's diff digest equal before and after. Written after it: this Record's gate row and Status, the plan's gate cells and the commit hashes — `check:register`, `check:markdown`, `check:spec`, `check:budget`, `check:wiring` and `check:docs` re-run on them |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the `W212 exit` L6 block — fourteen claims, eight runs | yes | P1-P13; `CROSS_ROW_SUBJECTS` (fourteen names); `DECLARED_TOTAL` / `DECLARED_RUNS`; `X10` |
| (2) the censuses reading the block; `NOT_YET_AT_L6` removed | yes | P10, P11 |
| (3) `examples/README.md`'s copies | yes | `X10` (2 copies at 2861 / 246) |
| (4) the reply | yes | — (outside the repository) |
| (5) P43's Record and retro; `doc/workflow.md`'s bookkeeping | yes | `check:register`, `check:budget`, `npm run state` (the two id derivations AGREE) |

**Predictions.** P43 prediction 7 **HOLDS**: `X10` moved by this block alone, 2847 / 238 → 2861 / 246; no `EXPECTED` row,
pair row or other block moved; removing `NOT_YET_AT_L6` moved no assertion. This item placed no logic: no `src/` file
edited. *Beside it, the l6.ts header's list of plans whose exit artifacts run there stopped at P39 — P40-P42's items each
added their table row and not their entry; this item adds P40-P43.*

**What broke.** At no rung of the product. The first cut's array fixture was a palindrome (caught by the author before the
sweep), and its past-the-tail claim could not see ADR 0130's past-the-tail branch inside a replay — found by the author's P6
and the adequacy reader's S12/S13, the same subject twice. Observed on the way: a resume's replayed elements are not
re-delivered to the resumed run's `onFoldInput` (only its new ones), so the resumed time is read from the state and the
checkpoint, never from the callback.

**What this taught.** *For the retro*: **a claim's OBSERVER is a shape too** recurred a third plan running — `confirm` is past
the stored tail of the RUN and of none of the REPLAY, so the claim named for one branch exercised the other. P42's
observation, carried in P43's brief, did not prevent it; the provocation written to the rule's clause did.

**Questions raised.** None (Q778-Q779 SPENT, unissued). **Closed.** None. ADR 0134 SKIPPED. **Record step**: P43's Record
and Retro; `doc/workflow.md`'s bookkeeping (the declared exception).

**The readers' overlap.** **ZERO** — the adequacy reader's SHOULD (the past-the-tail branch) was the author's P6, not the
conformity reader's; every finding was one reader's alone. The two briefs were written apart and named no common specific.

**Leftover worktrees.** `C:/tmp-w212/m`, `rc`, `ra` (git worktrees at `7055c12` plus this item's diff — `rc` and `ra` the
first cut, `m` the final block; `node_modules` COPIED; scanned before use: 0 links, 0 reparse points), with
`C:/tmp-w212/rc-scratch` and `ra-scratch` — left for the maintainer; none removed with `--force`.
