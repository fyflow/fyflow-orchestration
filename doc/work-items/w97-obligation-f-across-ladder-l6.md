# W97 — obligation (f) across ladder L6: every worker delayed past its peers, every threadable pool flipped

**Status:** **DONE** 2026-09-26 — see the Record. Declared 2026-09-26 on `5667621` (W96), before any file under `Owns` was edited.
**Plan:** none — an item outside any plan, on W69-W71's and [W96](w96-the-counts-and-the-index-a-check-can-compare-and-q394.md)'s
precedent, asked for by the maintainer on 2026-09-26: *"push then sweep"*. It takes the next id, so **the next plan starts at
W98**.

```
Spec:       none — an order `spec/` does not fix is found and either stops being asserted or becomes a
            DECLARED arrangement asserted beside the claim; no rule is written.
Owns:       examples/** (l6.ts and what it reads; registry.json's delays are the SUBJECT of the sweep and
            are restored after every arrangement), README.md and examples/README.md (the L6 counts, X10)
Inputs:     doc/workflow.md v0.25 rule 8 obligation (f) and its stated limit; P24's retro (the TV rows'
            pathEnds: sampled 0 of 6, arranged 6 of 6); W96 (Q394's arrangement, `f3`/`f4`); W94's
            declared ceiling `rc2`, whose reason is itself a completion order; examples/registry.json's
            23 node types and their knobs.
Outputs:    (1) the SWEEP: for each of the 21 types with a delay knob, L6 re-run with that type delayed
                past its peers (delayMs -> 300 ms; msPerMB 30 -> 300; msPerChar 60 -> 600; SecondPass
                120 -> 600); for each of the 4 threadable types, the opposite pool mode; each in node AND
                deno; every red confirmed by a second run and classified by the clause its FAIL line names
            (2) each red that is an UNARRANGED completion order: the assertion made order-free, or the
                order declared as an arrangement and its effect asserted beside the claim
            (3) each red that is a DECLARED arrangement naming itself: recorded as the obligation working
            (4) W94's ceiling `rc2` re-graded under the download arrangement
            (5) the table of every arrangement and its verdict, in this file
Depends on: nothing
Blocks:     nothing
Tests:      the sweep is the test; every fix is re-swept at the arrangement that found it, and the
            shipped tree's L6 must stay green in both runtimes
Gate:       L0 (`lint`, five typecheck lanes, each separately); L6 node and deno; `check:docs` (X10 if
            a count moves); then `npm run gate` with a content digest identical at both ends.
Reserves:   Q400-Q404, and NO ADR
```

*Reserves by grep: highest question on disk **Q395** (W96 reserved Q395-Q399 and used one), so this item takes **Q400**; highest
work item **W96**; highest ADR **0067**.*

## Scope

**In**: Outputs (1)-(5). **Out**: a delay on a worker with no knob (the obligation's stated limit — `Echo` and `Scorer` have
none, and are arranged by pool mode or not at all); widening a SERIAL pool (`maxThreads` 1), which is a different perturbation
([Q358](../questions/q358.md)'s) and is named here rather than folded in; `src/**`, `spec/**`, `test/**`.

## Verification

**Routing:** not applicable — no routing changes; the item asserts less about ORDER where the spec fixes none.

## Record

**DONE 2026-09-26.** Obligation (f) run across ladder L6 for the first time: **26 arrangements** — 21 node types delayed past
their peers, and FIVE pool flips (the three threadable types by the row knob, `Echo` and `Download` by their registry
`inline`) — each in node and deno, every red re-run and classified by its clause. *(The declaration said *4 threadable types*
and implied 25; the sweep's own header counted 26 once `Download`'s flip was added, and `Scorer` was never flipped — it has no
knob and is inline; the conformity reader's finding 7.)* **It found FOUR asserted orders `spec/` does not fix and NONE in
`src/`**, every one in `examples/l6.ts`; each is now order-free or asserts the arrangement it rests on. L6 **2072 assertions
over 154 runs** in both runtimes, from 2069 / 154. [Q400](../questions/q400.md)-[Q402](../questions/q402.md) raised; Q403-Q404
unused and not reused. No ADR.

### What the sweep found

| # | the order | found by | now |
|---|---|---|---|
| 1 | **`nodesOf` compared `RunState.nodes` by `JSON.stringify`, whose key order is DISPATCH order** — P23's block (2g) red with every node EQUAL and `recheck`'s key one place earlier; latent since W90 (W23's class) | `ScoreWorker` threaded, 2 of 2 in both runtimes | keys SORTED; confirmed by sorting in a copy and re-sweeping first |
| 2 | **W94's (2h): the resumed run identical to a run nobody killed, INCLUDING the post-cut winners** — a resume re-dispatches what was in flight, so arrivals after the cut are a fresh sample; identical only because `identify`'s 30 ms per MB dwarfs the re-dispatch skew | `Download` 300 ms, 2 of 2 in both runtimes, surviving the sort | the ARRANGEMENT asserted beside it — in every resumed run the files reach the gate in size order, a SUFFICIENT condition — with a constructed reversed input as its control |
| 3 | **(2h)'s CONTROL term `rising`: stored LENGTHS rising from one kill point to the next** — each point a SEPARATE run | `Download` threaded, intermittently in both runtimes | removed; replaced by an order-free read of the STORE — each holds exactly K stimuli (the adequacy reader: `killedAt` alone let duplicate stores through, W94's finding 1 reopened) |
| 4 | **P22's row ordered `recheck` against three `grade:1.x`** — dispatched by two branches' settlements | `ScoreWorker` threaded or delayed, both runtimes | `recheck` alone compared as a set (`unorderedDispatch`); the other nine keep their order |
| 5 | **(2g)'s mid-step and quiescent cuts: *one step* only while `shard:1` settles a turn after `shard:0`** | the ADEQUACY reader, with a SPEED-UP (`Shard` 0 ms) — out of (f)'s reach as worded ([Q401](../questions/q401.md)) | the arrangement's effect asserted inside the same check — the quiescent store holds two stimuli |

**Every other red names an arrangement its row DECLARES** — `joinSettledBy`, P22's overlap (Q349, Q353), a kill *arranged*
after a park, W19's hostile order, Q394's thumbnails, Q379's sizes — **or is a claim about pool mode itself** (the realm a
worker reports, the `inline` document clause). **W94's ceiling `rc2`** survives both arms: file 0's download still settles
first with downloads threaded, 3 of 3 — (f)'s limit, recorded. **The sweep on the final tree**: 26 arrangements, both
runtimes, every red of one of those two kinds (`dev-dist/w97/sweep-final.log`).

### Gate — what ran

| Clause | Verdict | Notes |
|---|---|---|
| L0 — `lint` and five typecheck lanes, each separately | RAN, exit 0 all six | `typecheck:examples` exit 2 once on a scope error in the readers' fix, read off the exit code |
| L6 node / deno | RAN, exit 0 | **2072 / 154 in both** |
| `check:docs` | RAN, exit 0 | **`X10` fired on its first live case** — all four copies named at 2069 against 2070 — and moved with them |
| conformity reader | RAN, isolated copy | 9 findings, 0 BLOCKING; ZERO disagreements on the VALUES; two false claims in my own comment (the key goes in at dispatch; (2h) never red under the Score flip) |
| adequacy reader | RAN, isolated copy | 86 invocations, 11 mutations; **3 BLOCKING** — the arrangement clause sortable for zero at `Download` 60 ms, duplicate stores through `killedAt`, and a SPEED-UP's order (N1) |
| rule 8 | RAN, two passes | pass 1 **13 / 8 caught / 3 ceilings** after two re-declarations; pass 2 with the readers' edits **18 / 11 / 4 — 0 against declaration**, digest identical at both ends |
| `npm run gate` | RAN, **`GATE EXIT=0`, ZERO `FAIL` lines** | content digest `3f28825ecaab9461` over 416 files IDENTICAL at both ends; spec 7 / 65 / 125, markdown 161 / 7417 / 415, docs 37 / 31 / 6, L1-L5 53 / 1423 in node, deno and chromium, L6 2072 / 154 in both. **`selftests` 1842.5 s wall against W96's 1441.5 s with NO self-test changed here** — 400 s of variance on an unchanged workload, [Q373](../questions/q373.md)'s shape, and not this item's cost. This row is the one edit made after the gate; `check:markdown` re-run over it |

**Readers — overlap 1** (the rule 8 ceiling `a3`/p2b: the arrangement clause's single observer, reached as a claim and as a
mutation). **Owns audit**: zero undeclared; `AGENTS.md`'s and P24's sentences left for [Q402](../questions/q402.md).

### Questions

**Raised: [Q400](../questions/q400.md)** (`unorderedDispatch` justifies by the row, not the ids), **[Q401](../questions/q401.md)**
(obligation (f) misses a speed-up and trusts one green sample — for P25's retro) and **[Q402](../questions/q402.md)**. Census
**308 / 238 / 1 / 69**. [Q142](../questions/q142.md): `M3` margin **1** before the record step — **the next plan's declaration
FIRES it on its first document.** The next plan starts at **W98, Q405 and ADR 0068**.
