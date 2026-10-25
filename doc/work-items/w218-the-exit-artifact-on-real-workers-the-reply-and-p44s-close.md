# W218 — a join's own keys, a bracket index and format 2, on real workers; the reply to fyflow-app; P44's close

**Status:** done 2026-10-25 — `npm run gate:full` on the final tree, one command, EXIT 0 (the Record), after a first run red on a half-written close; both readers RAN, every finding acted on or declared; 13 provocations, every one KILLED or CLEAN as declared; the reply written. Earlier: declared 2026-10-25 on `177234d` (W217 committed, the tree clean); P44's LAST item: exit clause (3), the reply, P44's Record and retro; this file written from the plan's row BEFORE any other edit
**Plan:** [P44](../plans/p44-what-a-join-hands-on-and-how-a-key-path-reaches-into-it.md) — *what does a join hand on,
and how does a key path reach into it?* — and this is its LAST item.

```
Spec:       none moves — this item holds ADR 0138's own keys and CHECKPOINT_FORMAT 2 (spec/join-policy.md v0.25 JP-R12,
            spec/run-state.md v0.36 RN-R16, RN-R23) and ADR 0137's bracket index (spec/flow-definition.md v0.53-v0.54,
            FD-V40, the KEY PATH paragraph) on real workers; spec/README.md untouched.
Owns:       from P44's W218 row, exactly: examples/l6.ts (the WHOLE file, sentence D′), examples/README.md,
            examples/flows/** and examples/workers/** (neither expected to be edited: the block writes its registry and
            flow in itself, W200's … W212's shape), test/definition/l4-corpus.test.ts (if a census moves);
            OUTSIDE this repository,
            ../fyflow-app/.scratch/mu-upstream-adoption/requests/fyflow-orchestration.pass5.reply.md
            Exceptions (declared BEFORE the edit, workflow section 7 rule 2): doc/workflow.md — the plan's-last-item
            bookkeeping ONLY (the Status line's count of plans run, section 6's overlap ordinal, the ledger rows a retro
            appends to), P43's close (4531616) the precedent, P44's W218 row and its always-read-set sentence naming it.
            The record step's four files carry P44's Record and retro. Anything else found to need an edit is a
            STOP-AND-ASK.
Inputs:     P44 decisions 3-5, facts 2-6, (a1), (b), (c1), (e1), (f1); ADR 0137, ADR 0138; W214-W217's Records (their
            counts, walls, readers' findings and hand-offs); W212's and W206's L6 blocks as the shapes this item extends;
            test/driver/own-key.test.ts case 1 (pass 5's flow at L2); fyflow-app's pass5.md and pass4.reply.md for form.
Outputs:    (1) one L6 block in examples/l6.ts, `W218 exit`, node 24 and deno, a THREADED and an INLINE pool. Per pool,
                pass 5's own flow — `split` (a fanout over `prep`, `side`), `prep` -> the map `each` over `xs` whose
                branch `work` -> its join `inner` -> `outer`; `side` -> `outer`, the fan-out's join — every task an echo
                of its input, item 0's `work` held back so the fan-out's branches settle `side` first and the map's
                instances 1 first; then `check` (an echo), the `if` gate `byIf` on `when.path`, the `distinct` gate
                `byKeyA` on a bracket-index key into the collection, the `distinct` gate `byKeyB` on an entry-id-and-index
                key, each route to its own echo, and the ask `confirm` (`needs: { got: "." }`) -> the END `done`. Two
                settings of the three paths: the CLAIMED (`input.prep.1`, `side.xs[1]`, `prep.1`) and the CONTROL
                (`input.0.0.1`, `side.xs.1`, `prep[1]`). Runs per pool: the claimed run on runtime A, parked at `confirm`,
                its checkpoint kept through JSON and A shut down; on a FRESH runtime B the store at format 1 (the header's
                `format` alone changed) refused, then the store as written resumed and answered; and the control run on
                its own runtime — SIX runs. **A `distinct` key is rooted at the value the gate receives, with no
                `input.` root** (the KEY PATH paragraph, ADR 0137), so the plan's *a gate keyed `input.side.xs[1]`* /
                *`input.<entry id>.<index>`* is spelled `side.xs[1]` / `prep.1` here — with the root it would read
                nothing (the conformity reader's SHOULD 2: a departure from the row's literal spelling, stated so no
                later reader restores it). Claims, each its own verdict, every expected value BY HAND from the flow,
                the payload `{ "xs": [1, 2] }` and JP-R12 v0.25 / ADR 0137 / RN-R16 / RN-R23:
                (a) the COLLECTION — `check`'s outcome result (what its worker received, returned through the pool) and
                    `confirm`'s asked `got` are `{"prep":{"0":1,"1":2},"side":{"xs":[1,2]}}`, byte for byte as JSON —
                    `branches` order though `side` settled first;
                (b) the IF — `byIf` on `input.prep.1 eq 2` routes `then`, `ifThen` dispatched and `ifElse` not;
                (c) its CONTROL — `input.0.0.1` (the path a reader would try for 0.11.0's keys, which named nothing
                    there either — so it shows the `if` is not constant-`then`; the claim separates the keyings)
                    routes `else`;
                (d) the INDEX — `byKeyA` keyed `side.xs[1]` routes `first` with key `2` (element 1, not element 0's 1);
                (e) its CONTROL — `side.xs.1`, a plain numeric segment over an array, routes `nokey` with no key;
                (f) the OWN KEY — `byKeyB` keyed `prep.1` (entry id, item index) routes `first` with key `2`;
                (g) its CONTROL — `prep[1]`, an index over a plain object, routes `nokey` with no key;
                (g2) the IF on an INDEX — a fourth gate, the `if` `byIfIdx` on `input.side.xs[1] eq 2`, routes `then`;
                     its CONTROL `input.side.xs.1` routes `else` — ADDED after the conformity reader's SHOULD 1: P44's
                     exit clause (3) says *an `if` on a bracket index*, its *W218 — outputs* paragraph an `if` on
                     `input.prep.1` and a gate on the index; the block now holds both;
                (h) FORMAT 1 REFUSED — on B, once A is gone, `runtime.resume` of the store at format 1 throws
                    `ResumeRefused` `format` at index `null`, its message naming format 1 met and format 2 read; the
                    stored header's own `format` is 2 (the arrangement);
                (i) its CONTROL — on the same runtime B the store as written resumes: `awaiting_action`, `confirm`
                    suspended with the collection as its stored input; answered, the run completes.
            (2) examples/README.md — X10's copies of the L6 counts moved by this block alone; the l6.ts header's table
                row and its list of plans.
            (3) the reply to fyflow-app, once this item's gate is green.
            (4) P44's Record and retro; doc/workflow.md's plan-close bookkeeping (the declared exception).
Depends on: W217 (177234d)
Blocks:     nothing — the plan closes with this item
Tests:      Output (1) is the test: expected values by hand from the flow written in the block, the payload, JP-R12 v0.25
            (each branch under its own key; a map's inserted ascending, a fan-out's in `branches` order; the object's own
            order), ADR 0137 rules (an index on a real array only; a plain numeric segment an own key) and RN-R16/RN-R23
            (format 2; format 1 refused `format`). W214-W217's L1-L5 suites are re-run, not edited.
Gate:       `npm run gate:full` (the plan's LAST item, workflow v0.29) — ONCE, on the final tree, after the readers
            (sentence C); `npm run gate` before the readers (B′, the draft); L6 in node 24 and deno; then the
            conformity reader and the adequacy reader, workflow section 6.
Reserves:   Q788-Q789, ADR 0139 (expected unused)
```

## Scope

**In**

1. **The exit artifact on real workers** — Output (1): P44 exit clause (3).
2. **The counts' copies** — Output (2).
3. **The reply, the plan's close** — Outputs (3), (4).

**Out** — named rather than left implicit, with where it goes instead

- **Any logic in `src/`** — W215's-W217's; this item places none (P44's W218 row: *a counter or `src/` site it cannot
  read is an Exception named before the edit*).
- **`check:spec`'s blindness to a refusal row citing a missing corpus file** (W216's S1) — `scripts/check-spec.mjs` is on
  no P44 row; the retro routes it.
- **ADR 0102's `stopped` dual read, unreachable since format 2** — removing it is a separate decision (W217's); the retro
  names it.
- **The 0.12.0 version bump, the push and the publish** — the maintainer's ((e1)).

## What the declaration step re-took, before anything was edited

*P15 decision 5. Taken 2026-10-25 on `177234d`, the tree clean; harnesses and logs in the session scratchpad's `w218/`.*

| # | re-take | measured |
|---|---|---|
| 1 | the release state (2026-10-25 03:53 local) | npm `fyflow-orchestration`: `0.0.0-stage`, `0.7.0`-`0.9.1`, `0.10.0`, `0.11.0`, `latest` **0.11.0**; JSR `@fyflow/orchestration` latest **0.11.0** (2026-10-24T06:14Z); `v0.11.0` and `origin/main` both at `bdbdb1c` (`git ls-remote`) — P44's commits (`61b0344` … `177234d`) NOT pushed; manifests 0.11.0 / 0.11.0 |
| 2 | `npm run state` | P45 W218 Q788 ADR 0139 from the tree; W214 Q780 ADR 0135 from the ledger — the two DISAGREE until this retro writes its sentence (expected); L6 2861 / 246 |
| 3 | the shape, on a scratch prototype (`w218/proto.ts`) over `177234d`, node 24 — the gates and the format refusal | the flow validates; `check`'s result `{"prep":{"0":1,"1":2},"side":{"xs":[1,2]}}` on both pools; `byIf` `then` / `else`, the two `distinct` gates `first` key 2 / `nokey`; format 1 refused `format` at `null` on a fresh runtime, the store as written resuming `awaiting_action` and completing. A feasibility check, never the expected side |
| 4 | W214-W217's counts on this item's draft — `npm run gate` (sentence C), 03:58:33 → 04:03:39, **EXIT 0** (`w218/gate-1.log`) | L1-L5 **103 files / 2,295 cases** in node 24.20.0, deno 2.9.6 and chromium (parity) — W217's figure, this item touching no suite; every check EXIT 0, `check:docs` X10 2 copies; L6 **2,879 / 0** over 252 real runs in node and deno (the block's first cut, eighteen claims) |
| 5 | the chromium lane | **this item adds nothing to the bundle** (L6 is `examples/**`, `RT-R10`), so W214's share stands; not re-taken |

## Verification

`npm run gate` on the draft before the readers (sentence C); the two readers in their own worktrees under `C:/tmp-w218/`
(`177234d` plus this diff, `node_modules` copied, scanned before use: 0 links, 0 reparse points); the author's provocations
in a third copy, re-run after acting on the readers; then `npm run gate:full` once, on the final tree. **Routing coverage**:
a nested fan-out and a map inside a fan-out (Q6) — the subject; a branch routed away (Q4) — no (W217's L2 holds it);
`user_action` (Q17) — not reached; no matching decision edge (Q10) — not reached (every route has an edge, every `if` a
default); a duplicate task id (Q13) — each run its own id, each runtime its own; a resume on the same runtime after a
refused one — the refusal spends no id (the control resumes there).

## The author's provocations

`mut.mjs` (the session scratchpad's `w218/`, logs `mut1.log` on the first cut, `mut2.log` on the block as the readers
left it) in the byte copy `C:/tmp-w218/m`, node 24 asserted at its head: each probe edits ONE clause, its anchor checked to
occur once in the CURRENT text and the edit checked to change the file; `node examples/l6.ts`; the W218 claims that went
red graded against the SET the probe declares, both pools, matched exactly; every file restored from its FIRST snapshot and
its SHA-256 compared. Written to JP-R12 v0.25, ADR 0137 and RN-R16 / RN-R23, not to the block.

| probe | the clause broken | declared, both pools | mut1 | mut2 |
|---|---|---|---|---|
| CONTROL | none | none | **CLEAN** | **CLEAN** |
| CRASH | grader control: a syntax error in the driver | CRASH | **CRASH** (right) | **CRASH** (right) |
| P1 | JP-R12: a fan-out branch keyed by POSITION | COLLECTION, IF, INDEX, OWN KEY, FORMAT's CONTROL (+ the IF on an INDEX, mut2) | **KILLED** | **KILLED** |
| P2 | JP-R12: a map instance keyed by its FULL path (0.11.0's) | COLLECTION, IF, OWN KEY, FORMAT's CONTROL | **KILLED** | **KILLED** |
| P3 | JP-R12: inserted in ARRIVAL order | COLLECTION, FORMAT's CONTROL | **KILLED** — the arrangement makes it discriminating | **KILLED** |
| P4 | ADR 0137: an index reads an own key of ANY object | OWN KEY's CONTROL | **KILLED** | **KILLED** |
| P5 | (c1): a plain numeric segment INDEXES an array | INDEX's CONTROL (+ the IF on an INDEX's CONTROL, mut2) | **KILLED** | **KILLED** |
| P6 | ADR 0137: `[n]` reads element 0 | INDEX (+ the IF on an INDEX, mut2) | **KILLED** | **KILLED** |
| P7 | RN-R16: the format is 1 | FORMAT 1 REFUSED, its CONTROL (wider: W188's and W192's format claims) | **KILLED** | **KILLED** |
| P8 | RN-R23: format 1 not refused | FORMAT 1 REFUSED, its CONTROL | **KILLED** | **KILLED** |
| B1 | the block: the control run takes the claimed paths | the three CONTROLS (+ the IF on an INDEX's, mut2) | **KILLED** | **KILLED** |
| B2 | the block: the refused store left at format 2 | FORMAT 1 REFUSED, its CONTROL | **KILLED** | **KILLED** |
| O1 | rule 8 (f): item 1 held back instead of item 0 | COLLECTION (its premise) | **KILLED** | **KILLED** |

*P7, P8 and B2 kill the CONTROL by a throw (`RunIdInUse`: the accepted format-1 resume holds the run id on B) beside the
FORMAT claim's own expected / actual — the adequacy reader's NIT 2, below.*

## Readers (2026-10-25), and what was acted on

*Both read the spec first; each reported and fixed nothing; each verified its copy green first (`node examples/l6.ts` EXIT 0,
2879 / 0, 252 runs; both in deno too). The adequacy copy's `git diff` digest equal before and after its 36 probes.*

| reader | finding | acted on |
|---|---|---|
| conformity SHOULD 1 | P44's exit clause (3) promises *an `if` on a bracket index*; the block's `if` was on `input.prep.1` and the index only on a `distinct` key — the plan's *W218 — outputs* paragraph and its exit clause disagree, and the block met only the first | **FIXED** — a fourth gate, the `if` `byIfIdx` on `input.side.xs[1] eq 2` (`then`), its CONTROL `input.side.xs.1` (`else`), in the same six runs: +4 claims, **2883 / 252**; mut2's P1, P5, P6 and B1 kill the new claims |
| conformity SHOULD 2 | the plan's gate key `input.side.xs[1]` would read nothing (a `distinct` key has no `input.` root); the block spells it `side.xs[1]` without saying it departs from the row | **FIXED** — stated in Outputs (1) and the block comment; P44's Record names it |
| conformity NIT 3 | the IF's control `input.0.0.1` named nothing under 0.11.0 too, so it shows a non-constant gate, not the keying; three labels read as if it worked on 0.11.0 | **FIXED** — the README, Outputs (c), the block comment and the claim's label say *the path a reader would try for 0.11.0's keys*; the path kept (the plan's row names it) |
| conformity NIT 4 | `prep` < `side`, so `branches` order and a SORTED order coincide on pass 5's flow — the outer order discriminates settlement order, not a sort | **FIXED** — said in the block comment, the sort's kill named as own-key case 2's; the flow kept verbatim |
| adequacy NIT 1 | without the hold, node's threaded pool met *instance 1 before 0* by chance (only inline went red); deno both | **DECLARED** — the premise fails toward detection, and the comment already says the map half is a premise, not a discriminator |
| adequacy NIT 2 | an accepted format-1 resume holds the run id on B, so the CONTROL reports *the clause THREW* rather than a verdict | **DECLARED** — the FORMAT claim goes red with its own expected / actual first; the plan's row puts the control on the same fresh runtime |
| adequacy NIT 3 | only `runtime.resume` of the three refusal doors runs at L6 | **DECLARED** — `resume()` and `inputOf` are W217's L2 (`own-key.test.ts` case 5); the row names `runtime.resume` |
| adequacy, the sweep | 36 probes: N0 clean, PC KILLED; 28 KILLED; 7 SURVIVED — M5 (assignment; no `__proto__` id here — L1 kills it), M8 and M18b (equivalent), M9 (a hole — L1 kills it), B1 (a tautology, survives by construction; B1M3 shows FORMAT's CONTROL still catches the order), B7 / B7M6 (a weaker control `prep[9]`, showing `prep[1]` is the discriminating one); M3, M6, M10, M11 re-run in deno with the same verdicts | — |
| conformity, re-derivation | every expected value re-derived from the spec before reading the block, all matched; the arithmetic (2861 + 18, 246 + 6, 528 + 18) right | — |

## Record

*Filled 2026-10-25, after both readers, the provocations and the confirming gate.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate` before the readers (sentence C) | RAN — **EXIT 0**, 03:58:33 → 04:03:39 (`w218/gate-1.log`) | re-take 4 |
| L6 after the readers' fixes | RAN — node EXIT 0 (`l6-node-2.log`), deno EXIT 0 (`l6-deno-2.log`), **2,883 / 252**, 0 failed; `check:docs`, `lint`, `typecheck` EXIT 0 | the `if` on an index added |
| conformity reader (`C:/tmp-w218/rc`) | RAN | no BLOCKER, 2 SHOULD, 2 NIT — above |
| adequacy reader (`C:/tmp-w218/ra`, harness and logs in `ra-scratch`) | RAN | 36 probes; no BLOCKER, no SHOULD, 3 NIT — above |
| the author's provocations (`C:/tmp-w218/m`) | RAN | mut1 **11 KILLED as declared**, CONTROL CLEAN, CRASH right; mut2 the same on the re-cut block; digests equal after every probe |
| the FIRST `npm run gate:full`, on the tree with this Record, P44's Record and the bookkeeping written, held still | RAN — **EXIT 1**, 04:54:31 → 05:35:25 (`w218/gatefull.log`); the tree's diff digest equal before and after | every ladder lane and check green (L1-L5 103 / 2,295 in three runtimes, L6 2,883 / 252 in node and deno); selftests 10/11 ok — `check:register:selftest`'s STATE control red: `scripts/state.mjs` refused P44's Status line still reading *declared* beside its Record and Retro (*plans whose declared status AGREES with their own structure: 43, and the floor is 44*). A half-written close, not a defect: the Status line moved and the gate re-run |
| **`npm run gate:full`** on the final tree, held still | RAN — **EXIT 0**, one command, 05:37:21 → 06:19:52 (`w218/gatefull2.log`, 2,551 s) | lint; typecheck; every check, `check:docs` 54 `run` and X10 2 copies at 2883 / 252; L1-L5 **103 files / 2,295 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 2,295); L6 **2,883 / 252, 0 failed** in node and deno — no Q599 row red; selftests **11/11 ok**, `check:register:selftest` included (2,245.5 s wall, 10 lanes). The tree's diff digest (this file included) equal before and after. Written after it: this row and the Status line, the plan's gate cells and the commit hashes — `check:register`, `check:markdown`, `check:spec`, `check:budget`, `check:wiring` and `check:docs` re-run on them |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the `W218 exit` L6 block — twenty-two claims, six runs | yes | P1-P8, B1, B2, O1; `CROSS_ROW_SUBJECTS` (twenty-two names); `CROSS_ROW`, `DECLARED_TOTAL` / `DECLARED_RUNS`; `X10` |
| (2) `examples/README.md`'s copies; the l6.ts header's row and its list of plans | yes | `X10` (2 copies at 2883 / 252) |
| (3) the reply | yes | — (outside the repository) |
| (4) P44's Record and retro; `doc/workflow.md`'s bookkeeping | yes | `check:register`, `check:budget`, `npm run state` (the two id derivations AGREE) |
| `examples/flows/**`, `examples/workers/**`, `l4-corpus.test.ts` | **not touched** — the block writes its registry and flow in itself; no suite added | — |

**Predictions.** P44 prediction 6 **HOLDS**: `X10` moved by this block alone, 2861 / 246 → 2883 / 252; no `EXPECTED` row,
pair row or other block moved. This item placed no logic: no `src/` file edited.

**What broke.** At no rung of the product. The first cut met one of its plan's two wordings for clause (3) and not the
other, and departed from the row's literal key spelling without saying so — both found by the conformity reader.

**What this taught.** *For the retro*: **a plan that states its exit twice can state it two ways** — the exit clause and
the item's outputs paragraph named different gates for the bracket index, and the item built from the paragraph. And
**pass 5's own flow cannot discriminate a sort from `branches` order** (`prep` < `side`): a fixture taken verbatim from a
consumer carries the consumer's coincidences.

**Questions raised.** None (Q788-Q789 SPENT, unissued). **Closed.** None. ADR 0139 SKIPPED. **Record step**: P44's Record
and Retro; `doc/workflow.md`'s bookkeeping (the declared exception).

**The readers' overlap.** **ZERO** — the conformity reader's subjects (the exit clause's wording, the key's root, the
`if`-control's label, the sort coincidence) and the adequacy reader's (the hold's reliability, the control's throw, the
three refusal doors) share none. The two briefs were written apart and named no common specific.

**Leftover worktrees.** `C:/tmp-w218/m`, `rc`, `ra` (git worktrees at `177234d` plus this item's diff — `rc` and `ra` the
first cut, `m` the final block; `node_modules` COPIED; scanned before use: 0 links, 0 reparse points), with
`C:/tmp-w218/rc-scratch` and `ra-scratch` — left for the maintainer; none removed with `--force`.
