# W202 — one shared copy per output read: a reference costs one copy, not one per reader

**Status:** done 2026-10-22 — `npm run gate:item` on the final tree, one command, EXIT 0 (the Record); both readers RAN, every finding acted on or declared; Q186 resolved by ADR 0126. Earlier: declared 2026-10-22 on `88059b7`; P41's FIRST item: decisions 1-8, stop-and-asks (a)-(c), (f2), (g1) as answered; the declaration step's re-takes RUN before any `src/` edit (below) — **this FILE was written just after the first `src/` edit**, not before it: a deviation from *write the item file when you start*, recorded rather than hidden
**Plan:** [P41](../plans/p41-what-a-reference-to-a-large-value-costs-inside-a-map.md) — *what does a reference to a large
value cost inside a map, and can every instance read one shared copy?* — and this is its FIRST item: the shared copy,
ADR 0126, the spec change, the count in the gate.

```
Spec:       spec/flow-definition.md v0.46 -> v0.47 — section 3's reference rules and cost note (the copy, the READ-ONLY
            sentence and its named gap, the table re-taken, P38 (l)'s refusal dated and reversed), :509, :527, FD-C1,
            FD-C3; spec/run-state.md v0.32 -> v0.33 — RN-R13's new term; spec/join-policy.md v0.23 -> v0.24 — JP-R11's
            HEADLINE scoped to an opener's branches (its copies unmoved); spec/README.md's rows.
Owns:       from P41's W202 row, exactly: src/driver/driver.ts, test/driver/**, test/definition/l4-corpus.test.ts
            (counted), test/fold/map-cost.test.ts and a sibling test/fold/*-cost.test.ts (the case is placed in a
            SIBLING, test/fold/reference-copy-cost.test.ts), spec/flow-definition.md, spec/run-state.md (RN-R13),
            spec/join-policy.md (JP-R11's headline), spec/README.md, AGENTS.md (the WHOLE file, sentence D′),
            doc/decisions/0126-*
            Exceptions (declared BEFORE the edit, workflow section 7 rule 2) — the row's: scripts/check-docs.mjs and
            scripts/check-docs-selftest.mjs (X6's anchors and its two probes, moved with the table — nothing else),
            examples/l6.ts (fact 7's W192 claims and their fixtures; its header's W192 row; DRIVER_FIELDS if it moves),
            examples/README.md (X10 if those claims' counts move — and, declared HERE, the one W192 sentence in its l6.ts
            cell that says *each its own copy*, a claim this item withdraws: section 1 rule 5's un-write direction).
            The record step's four files carry ADR 0126, the dated notes on ADR 0040 and ADR 0117, Q186's closing and
            P41's stop-and-ask record (doc/decisions/**, doc/questions/**, the plan). Anything else found to need an
            edit is a STOP-AND-ASK.
Inputs:     P41 decisions 1-8, facts 1-10, stop-and-asks (a)-(g) ANSWERED 2026-10-22 ((f) as (f2), (g) as (g1)); Q186;
            ADR 0040 rule 6, ADR 0117 rule 4, ADR 0041 rule 4, ADR 0002 rule 4, ADR 0046; W199's Record and
            test/fold/map-cost.test.ts as W199 left it.
Outputs:    (1) src/driver/driver.ts: `deepFreeze` (P41 decision 1's walk: plain Objects and Arrays recursed and frozen;
                every other object frozen SHALLOWLY; an ArrayBuffer view never handed to Object.freeze) and `sharedCopy`.
            (2) the shared copy per output entry — `OutputEntry.shared`, made at the entry's first read by `sharedOf`,
                kept on the entry object, so it goes where `place` replaces or removes the entry; `resolveReference`
                handing it at both call sites ((g1)); an `all` answer a fresh array of the entries' copies.
            (3) the `"$payload"` copy — `outputsCache.payload`, one per run, made at its first read (`sharedPayload`)
                and afresh by a resumed driver; handed at both sites; `FD-R4` keeps its clone of the caller's value.
            (4) the private counter `outputsCache.copies` — one per shared copy made. Never public (ADR 0121 rule 7).
            (5) test/driver/shared-reference.test.ts (new, L2): the row's claims, each expected value from the spec.
            (6) test/fold/reference-copy-cost.test.ts (new, L1-L2): `copies` EXACT at 2,000 / 8,000 items on the
                fetch-then-map shape (`"fetch"`, `"fetch?"`, `"$payload"`), the `all` form where FD-V28 makes it the
                form (a sibling map reading `["score"]`), and the edge site; a second observer (distinct objects
                handed); the per-read clone restored at each call site, each clause alone, bounded.
            (7) fact 8's L2 identity claims and fact 7's L6 claims re-stated under ADR 0126.
            (8) ADR 0126; spec/flow-definition.md v0.47; spec/run-state.md v0.33; spec/join-policy.md v0.24;
                spec/README.md's rows; AGENTS.md's reference rows, *What it costs*, the `"$payload"` table and every line
                saying a referenced value is the reader's own; X6's anchors and probes.
Depends on: P41's declaration (88059b7)
Blocks:     W203
Tests:      Outputs (5)-(7). Expected values from ADR 0126 and P41's decisions, and from derivations beside each count.
            Measurements, not gate entries (Q179): the driver re-timed (fact 4's table), the composed payloads over the
            corpus byte-identical to 88059b7's, RN-R13's figure by its own method, section 3's cost table re-taken.
Gate:       `npm run gate:item` (not the plan's last item; no row edits scripts/check-register*.mjs,
            scripts/state.mjs or doc/questions/README.md); `npm run gate` before the readers (sentence C); then the
            conformity reader and the adequacy reader, workflow section 6.
Reserves:   Q750-Q754, ADR 0126
```

## Scope

**In**

1. **The walk, the shared copy, its holder and its release** — Outputs (1)-(3).
2. **The counter and the cost case** — Outputs (4), (6).
3. **The L2 suite and the moved claims** — Outputs (5), (7).
4. **The record** — Outputs (8).

**Out** — named rather than left implicit, with where it goes instead

- **`"."` and `"$item"`** ((b)) — already one reader's own; their per-key clone stays.
- **`JP-R11`'s copies, `OR-R2`'s clone and the stored record, `FD-R4`'s composition, an ask's `asked` element, a gate's
  input** — P41 Scope's *Out*.
- **The L6 exit block, `examples/map-cost.ts`, the reply, P41's Record** — W203.
- **A size warning** — Q186's *nothing warns* stays decided; the cost it was about is removed instead.

## What the declaration step re-took, before anything was edited

*P15 decision 5. Taken 2026-10-22 on `88059b7`, the tree clean; harnesses in the session scratchpad's `w202/` and `perf/`.*

| # | re-take | measured |
|---|---|---|
| 1 | fact 4's table, `perf/q186.ts`, each size a fresh process, `--expose-gc` | node 24.20.0: **529 ms / 178 MB, 1,993 ms / 468 MB, 15,475 ms / 1,448 MB** at 1,000 / 2,000 / 4,000 items (fact 4: 579 / 2,123 / 22,903 ms, 178 / 468 / 1,445 MB — the heap reproduced, the 4,000-item time 32% lower); deno 2.9.6: **1,442 ms / 173 MB, 2,068 / 468, 16,598 / 1,438**. The same flow whose `all` names a SMALL node (`perf/q186small.ts`): 28 / 45 / 80 ms, 5 / 11 / 15 MB (node) |
| 2 | fact 5's freeze probe (`w202/freeze-probe.js`), node 24.20.0, deno 2.9.6, chromium 151.0.7922.34 (playwright) | **identical in all three**: `Object.freeze` on a `Uint8Array` with elements THROWS `TypeError`; on an empty one and on a `DataView` it succeeds — and a frozen `DataView` still writes its bytes (`setUint8`, node); a frozen `Map` takes `set`, `Set` `add`, `Date` `setTime`, and a frozen `ArrayBuffer`'s bytes are written through a view; a frozen plain object's write throws `TypeError` (the control). **Prediction 7 HOLDS — no runtime differs** |
| 3 | the composed payloads (W199's `payloads.ts`, copied to `w202/`): every valid corpus flow, seven drains, a resume from every rest point | 182 lines, `payloads-before.jsonl` on `88059b7` (worktree `C:/tmp-w202/base`) |
| 4 | the ladder counts — `npm run gate` on `88059b7` (worktree `C:/tmp-w202/base`, `node_modules` copied, no link, 0 reparse points), EXIT 0, 14:07:08 → 14:14:04 (`w202/gate-base.log`) | L1-L5 **89 files / 2,155 cases** in node, deno and chromium (parity); L6 **2,815 / 0 failed** over 230 real runs in node and deno; `check:docs` 51 `run`; `check:spec` C4 45 |

## Verification

`npm run gate` before the readers; the two readers in their own worktrees; the readers' survivors re-cut by the author;
then `npm run gate:item` once, on the final tree. **Routing coverage**: a nested fan-out (Q6) — the shared copy read by
instances of a map and by the edges of a node inside one (the constructed cases); `user_action` (Q17) — a `done` then a
`user_action` removing an entry and its copy, then a resolution placing a new one; a branch routed away from its join
(Q4) — not applicable: sharing changes what a read is handed, never which branch arrives; no matching decision edge
(Q10) — a predicate's write that throws stops the run before any edge is chosen; a duplicate task id (Q13) — not
applicable.

## Record

*Filled 2026-10-22, after both readers and the confirming gate. Harnesses and logs in the session scratchpad's `w202/`.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate` before the readers (sentence C) | RAN — **EXIT 0**, 14:49:46 → 14:54:08 (`w202/gate-1.log`) | L1-L5 **91 files / 2,173 cases** in node 24.20.0, deno 2.9.6 and chromium (parity); L6 **2,815 / 0 failed** over 230 real runs in node and deno; `check:docs` 51 `run`; C4 45. **The chromium lane passed its 60 s** — the cost suite is ~1.7-2.0 s of node wall |
| `check:docs:selftest` (B′: X6's two probes moved) | RAN — **EXIT 0**, 47/47 probes caught (`w202/docs-selftest.log`) | |
| conformity reader (`C:/tmp-w202/rc`) | RAN | no BLOCKER; 3 SHOULD, 7 NIT — below. Its own differential: constructed values (cycles, aliasing, primitives, Error, RegExp, nested Map, Set, Date, shared-buffer typed arrays, sparse arrays), old driver against new, ALL SAME; the payload harness 182 lines `cmp` 0; 24 JSONata expressions over a frozen input equal to unfrozen |
| adequacy reader (`C:/tmp-w202/ra`) | RAN | 78 mutations; survivors argued EQUIVALENT: F12, F13, F15, S11c; REAL: R8, R8b, R14, R15, F14 (SHOULD), F7b, F8, S4, S4b, L1, L2, L3 (NIT); two L6 runs under mutation killed (S15a, F17) |
| the author's re-cut of the survivors (`C:/tmp-w202/recut/`, the reader's own harness against the new tests, a control beside) | RAN | CONTROL clean; **KILLED**: RX (the RegExp frozen again), R8, R8b, R14, R15, F7b, F8, S4b (shared-reference), L1 (retention's new entry-keys claim); **F14 now HANGS the suite** (timed out at 240 s — the cycle reaches the walk; before, every suite was green); **SURVIVED, declared**: S4 (an `undefined` result re-copied: values identical, the counter alone), L2 (a clone kept OUTSIDE the driver: neither observer can see it — named in the cost suite's header); `ra`'s `driver.ts` SHA-256 equal to its original after |
| **`npm run gate:item`** on the final tree, held still | RAN — **EXIT 0**, one command, 15:52:08 → 16:14:28 (`w202/gateitem.log`) | lint; typecheck; every check, `check:docs` 51 `run`, C4 45; L1-L5 **91 files / 2,174 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 2,174); L6 **2,815 / 0 failed** over 230 real runs in node and deno; selftests **10/10 ok** (1,080.9 s wall, 9 lanes), `check:register:selftest` left out by `--without`. Written after it: this Record and Status — `check:register`, `check:markdown`, `check:spec`, `check:budget`, `check:wiring` and `check:docs` re-run on them |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `deepFreeze`, `sharedCopy` | yes | shared-reference cases 0-2, 8, 9; F1-F11, F16-F19, RX killed |
| (2) `OutputEntry.shared`, `sharedOf`, both sites | yes | cases 0, 3-6, 9; S1-S3, R1-R16 killed; the cost suite's compose and resolveNeeds probes |
| (3) `outputsCache.payload`, `sharedPayload`; `FD-R4`'s clone | yes | case 1, case 7; S7-S11b, S15-S15d killed; run-payload's FD-R4 cases |
| (4) `outputsCache.copies` | yes | the cost suite's exact pins; S5, S6, S14c killed |
| (5) `test/driver/shared-reference.test.ts` | yes | eleven cases; the census counts them; 9 of its first 10 red on `88059b7` (the membership the expected survivor) |
| (6) `test/fold/reference-copy-cost.test.ts` | yes | seven cases, seven shapes; each probe red on its exact clause set; the census counts them |
| (7) the moved claims | yes | fact 8's four L2 cases, re-stated; W192's three L6 claims — exactly those three red with the old driver under the new `l6.ts` |
| (8) ADR 0126, the spec, AGENTS.md, X6 | yes | `check:register` (R8: ADR 0126 resolves Q186), `check:spec`, `check:docs` X6 both ways, `check:docs:selftest` |

**The numbers** — the driver alone, `perf/q186.ts` (fetch-then-map, ~100 KB fetched), each size a fresh process,
`--expose-gc`: before on `88059b7`, after on the final tree.

| items | node before | node after | deno before | deno after | the same flow reading a SMALL node, node after |
|---|---|---|---|---|---|
| 1,000 | 529 ms / 178 MB | **29 ms / 5 MB** | 1,442 / 173 | **30 / 6** | 27 / 6 |
| 2,000 | 1,993 / 468 | **47 / 11** | 2,068 / 468 | **50 / 11** | 41 / 11 |
| 4,000 | 15,475 / 1,448 | **78 / 15** | 16,598 / 1,438 | **91 / 16** | 70 / 14 |

CPU profile at 4,000 items before (`w202/prof-before`): **`structuredClone` 87.7% self, GC 9.1%**; after
(`w202/prof-after`): flat — `structuredClone` 9.6% (`OR-R2`'s settlement clone), module loading, GC 4.4%. The heap
profile before (`w202/heap-before`) holds only what was live at exit, so it says nothing of the peak — the peak heap
above is the heap figure. **P41 prediction 2 HOLDS**: 78 ms against 70 for a small node (within 2x), 15 MB against
1,448 (1%).

Section 3's cost table (`w202/table.ts`, five fresh processes a cell, median): before, at arity 1000, 23.1 / 25.0 / 28.0
/ **483.3** / 496.8 ms; after 24.4 / 25.3 / 28.0 / **30.5** / 28.3 — 17x to 1.1x. Re-taken twice on the final tree (after
the readers' RegExp line): large 29.2 and 28.3 against small 27.9 and 27.3; the two cheapest rows BIMODAL, 23-39 ms in
one cell, under a foreign node process's background load (started 2026-10-15, not this session's). The table published
is the code-complete tree's; the re-takes are stated beside it in the spec (Q179).

**Counted** (`outputsCache.copies`, EXACT, equal per output at both sizes): `one`, `conditional`, `payload`, `edge,
node`, `edge, payload` **1 / 1** at 2,000 / 8,000; `all` and `all, conditional` **2,000 / 8,000** (one per `score`
output). The second observer equal at every pin. **What it does NOT count**, timed once: the suite's whole wall in node
is ~1.7-2.0 s (the subject at both sizes on seven shapes and five probes at 2,000).

**`RN-R13`** (`w202/bytes.ts`, its own method, `v8.serialize`): `post` reading `ingest` (one output of 1,000 integers)
**90.7 → 93.7 B an entry** at 1,000 instances (91.2 / 88.0 → 95.1 / 90.6 at 10 / 100) — ingest's result copied ONCE;
`post` reading its own `work` **97.1 → 105.6** (95.8 / 93.9 → 104.3 / 102.1). **P41 prediction 3 HOLDS**: one term; the
holder sets, `DRIVER_FIELDS` and `NOT_RUN_STATE` did not move (retention and L6 green); no `CHECKPOINT_FORMAT`,
`FoldInput`, `RunState`, `snapshot()` or signature moved.

**Payloads** (W199's `payloads.ts`): every composed payload and `ctx.needs` over every valid corpus flow under seven
drains, each with a resume from every rest point: **182 lines, byte-identical** to `88059b7`'s (`cmp`), re-run by the
conformity reader. The corpus holds no `"$payload"`; its values are held at L2 (`run-payload.test.ts`, green).

**Predictions.** 1 **HOLDS** — no composed VALUE moved; what moved is fact 8's identity claims and fact 7's writability
claims. 2, 3 **HOLD** (above). 4 **HOLDS** — the `one` shape counts 1 at both sizes; the restored per-read clone counts
`n` (red). 5 **HOLDS** — the L6 claims that moved are W192's (3) alone, three of them; the writers' census found one
worker writing its input (`tally`, its OWN input) and no other writer into a referenced value. 7 **HOLDS** — node 24.20.0,
deno 2.9.6 and chromium 151 identical; a `DataView` FREEZES without throwing (the plan's *throws on them* is true of a
typed array with elements only), and a frozen one still writes its bytes, so *never handed to `Object.freeze`* stands.

**The readers, and what was acted on.**

| reader | finding | acted on |
|---|---|---|
| both | **a frozen `RegExp`'s READS throw** (`lastIndex` read-only: a global or sticky one's `test`, `exec`, `replace`, `match`) — a third behaviour change | **FIXED, by P41 decision 8** (*TWO behaviours*, no third): a `RegExp` is shared UNFROZEN and named in the gap — `deepFreeze`, ADR 0126 rule 2, spec section 3, AGENTS.md; pinned in case 8 (shared, unfrozen, its `test` works, `lastIndex` shared). RX re-cut KILLED. **The maintainer may prefer naming the throw instead** — the alternative is one line |
| conformity S2 | *both writers are strict* is not guaranteed for a predicate (sloppy code drops the write) | **FIXED** — *in strict code* in spec section 3, ADR 0126 rule 3, AGENTS.md; a sloppy predicate's write is DROPPED, stated |
| conformity S3 | `RN-R13`'s *only `inputs` and `arrivals` hold a copy* made false by the new term | **FIXED** — the sentence names the shared copy and `payload` as the exception |
| both (conformity N4, adequacy C2, F7b, F8) | the gap list narrower than the rule: an `Error`'s `cause`, a `Map`'s keys, a `Set`'s members | **FIXED** — named in spec, ADR, AGENTS.md and `deepFreeze`'s doc; Map key and Set member pinned unfrozen (F7b, F8 KILLED) |
| conformity N1, N2, N3 | stale comments (`driver.ts` ×5, two test headers) and the v0.44 note beside its correction | **FIXED** |
| conformity N5 | a stray backtick in `examples/README.md` | **FIXED** |
| conformity N6 | Q186 and ADR 0126 closed before the gate | **DECLARED** — written at the record step of this same commit, after `gate:item` was EXIT 0 on the tree that holds them |
| conformity N7 | the gap case's *reaches the other reader* holds by identity | **DECLARED** — that is the claim: one object, so a write through it is every reader's |
| adequacy R8, R8b, R14, R15 | `["n?"]`, readers at depth 2, a `one` read of an in-region output — unpinned | **FIXED** — case 9 (two maps deep, both sites, the write throwing) and `["work?"]` beside `["work"]` in case 4; a seventh cost shape `all, conditional`; all four KILLED |
| adequacy F14 | no cyclic value, so *the walk never throws* unguarded | **FIXED** — a cycle in case 8; the mutation now HANGS the suite (a non-pass, not a FAIL line — declared) |
| adequacy S4, S4b | a falsy result re-copied, re-counted | **FIXED** for `0` (case 6, S4b KILLED); S4 (`undefined` only) **DECLARED** — the values are identical; the counter alone |
| adequacy L1, L2, L3 | a per-read clone kept or made that neither cost observer sees | L1 **FIXED** (retention: an entry holds only `path`, `result`, `shared` — KILLED); L2, L3 **DECLARED** in the cost suite's header (*what NEITHER observer sees*) |
| adequacy C5 | `Object.keys` over a large numeric array costs more than its clone | **DECLARED** — paid once per output read |

**What broke.** At no rung. The readers found what the author's set did not: a READ the freeze breaks (RegExp — no rung
asks whether a frozen value still WORKS), three slices of *every reader* unpinned, a cycle unguarded, and the gap list
narrower than the rule. One harness defect of the author's, found by running it: the cost suite's first provocations
shared one clone budget across shapes and its uncounted probe removed the shared copy — both fixed before the gate.

**What this taught.** *For the retro*: **a freeze is a behaviour change for READS too** — the plan enumerated the types
freezing cannot protect (writes that still land) and not the types freezing BREAKS (reads that now throw); both readers
found the second class independently by construction. And **a decision's *every* is a quantifier with shapes** (rule 8
(a) again): every reader at every depth in every form was asserted at depth 0 and in three of four forms.

**Questions raised.** None (Q750-Q754 SPENT, unissued). **Closed.** [Q186](../questions/q186.md) — by ADR 0126 and the
count in the gate. **Record step**: ADR 0126 written; ADR 0040 rule 6 and ADR 0117 rule 4 dated *superseded in part*;
Q186 resolved. P41's Record is the last item's (W203).

**The readers' overlap.** **TWO** — the RegExp whose reads throw (both, by construction), and the gap list narrower than
the rule (conformity N4; adequacy C2, F7b, F8). Every other finding was one reader's alone.

**Leftover worktrees.** `C:/tmp-w202/base`, `rc`, `ra` (git worktrees, `node_modules` COPIED, scanned: 0 links, 0
reparse points) and `C:/tmp-w202/recut` (a plain directory) — left for the maintainer; not removed with `--force`.
