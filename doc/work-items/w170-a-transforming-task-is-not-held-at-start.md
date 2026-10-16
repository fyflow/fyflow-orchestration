# W170 — a TRANSFORMING task is not held at `start`, and `tryTransform(…, { input })` is the check before a run

**Status:** done 2026-10-16 — **`npm run gate:item` EXIT 0** on the final tree, one command; declared 2026-10-16 on `d7553ba`; P34's SECOND item, [Q633](../questions/q633.md)'s road (a) as the maintainer answered it (road 2); both reader passes RAN and their items are acted on (C1 the check-before-a-run recipe corrected everywhere, A1-A6 cases); exception E1 granted by the maintainer 2026-10-16; no question raised, Q633 left OPEN for W176
**Plan:** [P34](../plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md) — *what does a run do when its owner
cancels it, stops it to resume it elsewhere, or pauses it?* — its second item, carrying the defect P37's retro (g) routed
here to land before 0.8.0: `FD-R4` holds a TRANSFORMING entry's payload to its worker's `inputSchema` BEFORE the
transform runs, so `start()` and `tryTransform(…, { input })` give opposite verdicts on one value (P34 fact 10).

```
Spec:       spec/flow-definition.md v0.39 -> v0.40: section 6's `FD-R4` row — a boundary target that DECLARES A
            `transform` is UNCHECKED at `start`, as a worker declaring no `inputSchema` is: the value its worker's
            `inputSchema` holds is what the node RECEIVES (`FD-C5`), which for a transforming node is the transform's
            RESULT, made only in the type's worker wrapper (`FD-C6`); the check before a run is `givenVerdict`
            (`tryTransform(…, { input })` on the declared transform, v0.38's `given`) on each transforming TARGET, with
            the value that task RECEIVES; at run time the transform's own failure (`TransformFailed`), and a result the
            schema would refuse reaches the worker unchecked. The `resolve` boundary is UNMOVED. The row's bold head
            clause, the entry-GATE paragraph, section 3's worker-entry `inputSchema` row, *The ENTRY has no arc* and
            *A sample the caller GIVES* say so in place. No rule id moves and none is added — the FD-V count stays 42,
            the rule count 135; no refusal class moves.
Owns:       from P34's W170 row: src/driver/driver.ts, spec/flow-definition.md, spec/README.md,
            test/driver/boundary.test.ts, test/definition/l4-corpus.test.ts, AGENTS.md (sections 9-11, 15),
            scripts/check-docs.mjs, doc/decisions/0101-*.
            test/definition/l4-corpus.test.ts and scripts/check-docs.mjs are in the row and were NOT edited: NO NEW
            SUITE (every case is inside boundary.test.ts's three existing FD-R4 suites, so LATE_SUITES does not move)
            and none of those three suites has a per-suite case COUNT in l4-corpus.test.ts (its counted suites are
            W109's, W110's and W93's — the site W169 hit at :812 is W110's registry refusal suite); NO `run` snippet is
            added or removed, so RUN_FLOOR stays 37.
            Exceptions: E1 — granted by the maintainer 2026-10-16 (YES, after the readers; see S1 below):
            src/definition/wiring.ts, two doc comments (`WiringReport.entry` :146-149 and `boundaryTargets` :311-313),
            one clause each; AGENTS.md section 13, the snippet comment at about :2475 and the broad statement at about
            :2784, one clause each — the transform exception, nothing else changed there.
            Record-step files (doc/workflow.md section 1 rule 5): doc/questions/** (Q633's dated note; Q638-Q640 if
            raised), doc/decisions/** (ADR 0101 is in Owns), the plan's Record, README.md, this file.
Inputs:     P34 stop-and-ask (a) as answered 2026-10-16 (road 2), fact 10; Q633 (its table and roads); spec v0.39's
            `FD-R4` row, `FD-C5`/`FD-C6`, the `given` subsection (v0.38); W166's `tryTransform(…, { input })` and
            `givenVerdict`; `boundaryTargets` (W73, exported from the root).
Outputs:    (1) driver.ts: `start()`'s `FD-R4` walk skips a target task that declares a `transform` (`continue`, as
                the no-`inputSchema` skip) — every other target of the same walk still held; `resolve()` unchanged.
                `BoundaryRefused`'s and `validateBoundaries`'s doc comments and the start-boundary comment say so.
            (2) spec v0.40 (above), and spec/README.md's flow-definition row.
            (3) ADR 0101 — road (2), with roads (1) and (3) as alternatives rejected.
            (4) AGENTS.md: section 9 (`BoundaryRefused`'s paragraph), section 10 (a common mistake), section 11 (a row:
                a start-time check of a transforming task's payload does not exist — check, then start), section 15
                (*A sample you GIVE*: it is the check before a run, on the value each target receives; and the
                section's opening statement).
            (5) L2 tests (below).
            (6) E1: wiring.ts's two comments and AGENTS.md section 13's two sentences.
Depends on: W169 (done, d7553ba)
Blocks:     W171
Tests:      L2 test/driver/boundary.test.ts, inside the existing suites:
            START suite — Q633's own flow (a worker whose inputSchema requires `label`, a string; an entry of its type
            declaring the JSONata transform `{ "label": word }`): BOTH of Q633's payloads ADMITTED by `start`, each
            dispatched with `input` the payload UNTRANSFORMED and the declared transform as the envelope's third key
            (FD-C6); and `tryTransform(…, { input })` on the SAME node still giving each its OWN verdict — `{ word: "x" }`
            transform-passes with result `{ label: "x" }`, `{ label: "y" }` transform-fails naming `$.label`; the
            CONTROL — the same flow with no transform: `{ word: "x" }` REFUSED, `BoundaryRefused` at the entry with
            `findings` `[{ path: '$.label', says: 'required' }]`, nothing dispatched or appended, and `{ label: "y" }`
            admitted. SHAPES (rule 8 obligation (a)): a FAN-OUT entry whose FIRST branch transforms and whose SECOND
            does not; a MAP entry whose branch transforms (and its untransformed control); an entry GATE (the built-in
            `if`) routing to a transforming target and, on the other route, to an untransformed one that still
            refuses; an entry composing `"."` AND transforming; a transform in the fake `path` language. THE RECIPE
            (ADR 0101 rule 3): `givenVerdict` on the value the task RECEIVES passes where on the raw payload it fails —
            a `needs: { own: "." }` entry and a map branch's element — `boundaryTargets` names each target and value,
            and a region entry gives `[]`.
            RESOLVE suite — a parked TRANSFORMING node's `done` value still held to its worker's `outputSchema`.
            RUNTIME suite — `createRuntime` naming the `jsonata` language: Q633's `{ word: "x" }` started through
            `rt.start` on the transforming flow, and refused on the untransformed control.
            Expected values from Q633's table, the answer to (a), the schemas the cases declare, FD-C1's composition and
            JSONata's documented semantics (an absent path yields no key) — never from the implementation's output.
            Each case shown able to fail by a ONE-clause mutation (sentence E) in the byte copy C:/tmp-w170/m.
Gate:       `npm run gate` before the readers (P34 sentence C); then the conformity and adequacy readers, NOT run by
            this item's author; then `npm run gate:item` ONCE on the final tree. The row's clauses: L2 a transforming
            ENTRY whose value differs against the schema before and after its transform — both of Q633's payloads
            ADMITTED by `start` (road 2), and `tryTransform(…, { input })` still giving each its own verdict; an
            untransformed entry's `FD-R4` refusal unmoved.
Reserves:   Q638-Q640 (P34's W170 row); ADR 0101 (P34 decision 11)
```

*Reserves: `npm run state` on `d7553ba` reads the next free ids as **P38, W170, Q635, ADR 0101** from the tree and
W169, Q635, ADR 0101 from the ledger (P37's Retro) — they DISAGREE on W only, because P34 was declared since that
sentence and W169 spent its id; P34's own reservation governs, and gives this item Q638-Q640 and ADR 0101.*

## Scope

**In** — Outputs (1)-(6).

**Out** — named rather than left implicit, with where it goes instead

- **Q633's L6 run on real workers** — its `closes-when` asks for one; it is P34's exit artifact clause (6), **W176**.
  So Q633 is NOT resolved by this item: the record step adds a dated note naming road 2 and W176 as the item that
  closes it, and ADR 0101's `resolves` is empty.
- **An async `start`** (road 1) and **a separate schema for what a transform receives** (road 3) — not taken, ADR 0101's
  alternatives.
- **A helper that composes a target's `needs` for the caller** — the recipe names `boundaryTargets` and states the
  composition (at an entry only `"."`); no new public function.

## S1 — the out-of-`Owns` sentences (asked after the readers, answered YES)

The conformity reader's C4 and the author's report named three places outside `Owns` that say `FD-R4` holds the payload
at `start()` with no exception: `src/definition/wiring.ts` `:146-149` (`WiringReport.entry`, public) and `:311-313`
(`boundaryTargets`), and `AGENTS.md` section 13 (the snippet comment at about `:2475`, the statement at about `:2784`).
**ANSWERED by the maintainer 2026-10-16: YES — exception E1**, one clause each, the transform exception (and *the value
the node receives* where it applies), nothing else changed there.

## Verification

`npm run gate` on the real tree, held still, each rung's exit read on its own line; the author's ONE-clause provocations
in the byte copy `C:/tmp-w170/m`; then the readers; then `npm run gate:item` once. Routing coverage: a branch routed away
from its join (Q4), `user_action` (Q17 — the resolve case parks a transforming node), no matching decision edge (Q10), a
duplicate task id (Q13), a nested fan-out (Q6) — not applicable beyond the `user_action` park and the entry gate's
route: this item changes which values one boundary holds at `start`, before anything routes.

## What the declaration step measured

*Measured 2026-10-16 in a BYTE COPY of `d7553ba` (`git archive` into `C:/tmp-w170/m`, `node_modules` copied, never
linked; `find -type l` zero), node 24.20.0 and deno 2.9.6.*

| # | fact | measured |
|---|---|---|
| M1 | the baseline, in the copy | `npm run gate` **EXIT 0**: `lint` 146 files; `check:spec` 7 / 75 / 135 rules; `check:docs` 43 snippets (37 run, 6 check); L1-L5 **62 files / 1765 cases** in node, deno and chromium; L6 **2664 / 176**, 0 failed, in node and deno |
| M2 | **P34 prediction 2** — the change against the existing tests | NO existing assertion moved: no case held a transforming entry before (K1 kills only W170 cases) |
| M3 | the census sites | no suite added (LATE_SUITES unmoved), the three FD-R4 suites carry no case count in `l4-corpus.test.ts`, no snippet added (RUN_FLOOR 37) |

## Record

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate`, before the readers | **RAN, `GATE EXIT=0`** | real tree held still, node 24.20.0: `lint` 146 files; `check:spec` 7 / 75 / 135 rules; `check:docs` 43 snippets (37 run, 6 check); L1-L5 **62 files / 1772 cases** in node, deno 2.9.6 and chromium (+7 over M1); L6 **2664 / 176**, 0 failed, in node and deno — unmoved, so `X10` does not move. firefox and webkit NOT RUN |
| conformity reader | **RAN** | C1 DEFECT (the check-before-a-run recipe gave the wrong verdict wherever the target does not receive the raw payload), C2 and C4 SHOULD-FIX, C5-C7 notes; readings (iii), (iv) and the ADR format acceptable; only `Owns` files changed — acted on below |
| adequacy reader | **RAN** | its own 19 one-clause mutations: **16 killed, 3 survivors** — M7 (no skip through an entry gate), M8 (one language only), M9 (`needs` and a transform at the entry); A4-A6 notes; **no defect** — acted on below |
| overlap | | **1 shared subject**: the entry GATE — conformity's C5 (rule 1 claims it, untested) and adequacy's A1 (M7 survives) |
| author's provocations, re-run after the readers' items | **RAN** | harness `C:/tmp-w170/mutate.mjs` in the byte copy re-synced with the final tree: control CLEAN; **11 of 11 KILLED** — K1-K8 of the first run and K9-K11, the readers' three survivors re-cut |
| **`gate:item`, the confirming run** | **RAN, `GATE:ITEM EXIT=0`** | ONE command on the final tree, held still, after the readers' items, E1 and the record step (this Record written before it, but for this row and the Status line): the ladder — `lint` 146 files, `check:spec` 7 / 75 / 135 rules, `check:docs` 43 snippets (37 run, 6 check), L1-L5 **62 files / 1776 cases** in node 24.20.0, deno 2.9.6 and chromium (+4 over the first gate: the readers' gate, composed, `path` and recipe cases), L6 **2664 / 176**, 0 failed, in node and deno — then the self-tests less `check:register:selftest`: **10/10 completed, 10 ok**, 1079.5 s self-test wall. firefox and webkit NOT RUN; `gate:full` NOT RUN and not owed (W176 is P34's last item) |

**The author's mutation table** (each ONE clause, sentence E; graded on the runner's `FAIL` lines over `boundary.test`).

| id | the clause broken | killed by |
|---|---|---|
| K1 | the skip removed (the pre-W170 boundary) | the Q633 admit case, fan-out, map, gate, composed `"."`, `path` language, runtime |
| K2 | `continue` → `break` | fan-out only |
| K3 | skip only where `node === def.entry` | fan-out, map, gate |
| K4 | condition inverted | 14 cases, old and new |
| K5 | every target skipped | 11 cases, the controls among them |
| K6 | the RESOLVE boundary skips a transforming node too | the resolve case only (since A5 its setup no longer depends on the start skip) |
| K7 | `givenVerdict` ignores its input (`wiring.ts`, copy only) | the `tryTransform` case; the recipe case |
| K8 | the envelope drops the transform (FD-C6) | the Q633 admit case; the composed case |
| K9 | no skip through an entry GATE (adequacy M7 re-cut) | the gate case only |
| K10 | no skip where the task declares `needs` (M9 re-cut) | the composed case only |
| K11 | the skip for `jsonata` only (M8 re-cut) | the `path` case only |

**The adequacy reader's table, as reported**: 19 one-clause mutations, 16 KILLED; survivors M7, M8 and M9, closed by A1, A3
and A2 and re-cut as K9, K11 and K10 above, now KILLED. *(The per-mutation list is the reader's report.)*

**What was done for each finding.** Every expected value is from Q633, the answer to (a), the cases' schemas and
FD-C1's composition.

| | finding | done |
|---|---|---|
| C-C1 (DEFECT) | the check-before-a-run recipe handed `givenVerdict` the raw payload, and named `flow.entry`; a given value is `$` with no `needs` composed, a map branch receives an element, and a fan-out, map or gate entry gives `[]` — so the recipe answered the wrong question on those shapes | **corrected at every site** — spec `FD-R4` row, the v0.40 paragraph, *The ENTRY has no arc*, *A sample the caller GIVES*; spec/README.md's row; ADR 0101 decision 3; `AGENTS.md` sections 9, 10, 11 and 15; `BoundaryRefused`'s comment: call it on each transforming TARGET with the value that task RECEIVES — the payload composed through its `needs` (at an entry only `"."`), a map branch's element — `boundaryTargets(flow, payload)` naming the targets and values, never on a region or gate entry. **Bound** by the recipe case (K7) |
| C-C2 | *starts and fails in the run* / *found in the run* overclaimed — Q633's `{ label: "y" }` completed with the worker receiving `{}` | **reworded**: it MAY fail in the run, or reach the worker unchecked and complete — `AGENTS.md` section 9, ADR 0101 rule 4 and Consequences, the spec row |
| C-C4 | the entry-GATE paragraph and `FD-R4`'s bold head clause had no transform exception; `AGENTS.md` section 15's opening statement too | **added** in each; section 13's two sentences were the pending question, done under E1 |
| C-C5 | ADR 0101 rule 1 claims the gate, untested | **tested**: A1's case (K9) |
| C-C6 | Q633 stays open for W176 | **record step**: a dated note on `q633.md` naming road 2, ADR 0101, v0.40 and W176 |
| C-C7 | *start on `transform-passes`* silent about `unchecked` | **a clause added**: an `unchecked` verdict (no `inputSchema`, or a language, type or worker the registry lacks) checked nothing — spec and `AGENTS.md` section 15, ADR rule 3 |
| A-A1 (M7) | no skip through an entry gate survived | **case added**: the built-in `if`, priority 7 to the transforming `a` (dispatched), priority 1 to the untransformed `r` (refused). K9 KILLED |
| A-A2 (M9, note) | `needs` + transform at the entry | **case added**: `needs: { own: "." }` and `{ "label": own.word }`, admitted, the composed value dispatched. K10 KILLED |
| A-A3 (M8, note) | one language only | **case added**: the fake `path` language. K11 KILLED |
| A-A4 (note) | `equal(givenVerdict(...), pass)` compared two computed values | **dropped** (W166 covers the identity); `givenVerdict` is now held to hand-written `[kind, result]` pairs in the recipe case |
| A-A5 (note) | the resolve case died under K1 only through its setup | **setup changed** to `{ label: "y" }`, valid before the transform; K1 no longer reaches it, K6 does |
| A-A6 (note) | the refused controls did not assert an empty log | **asserted** `snapshot().length === 0` on the entry and map controls |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the skip in `start()`'s walk | yes | K1-K5, K9-K11 |
| (2) spec v0.40 and the README row | yes | `check:spec` C8 binds the Status to the row; the prose is bound by no test |
| (3) ADR 0101 | yes | `check:register` reads its front matter |
| (4) `AGENTS.md` sections 9, 10, 11, 15 | yes | prose — no snippet added, `check:docs` reads none of it |
| (5) the L2 cases | yes | the table above |
| (6) E1's four sentences | yes | comments and prose — no check reads them |

**What broke.** Nothing at the ladder. The readers' C1 was a DEFECT in the item's own documentation — the recipe it
published for *check, then start* — which no rung reads; it is closed by prose at every site and bound by a case that
holds the recipe's two wrong questions to their wrong answers.

**What this taught.**
- **A recipe is a claim about every shape the boundary ranges over**, and the author's was written for the one shape
  Q633 measured (a task entry, no `needs`). Rule 8 obligation (a) was applied to the CODE's shapes and not to the
  DOCUMENTED call's. For P34's retro.
- **P34 prediction 2 held**: no existing assertion moved (M2).

**Questions raised.** None — Q638-Q640 unused, skipped. **Closed**: none; [Q633](../questions/q633.md) stays OPEN
for W176 (its L6 clause), with a dated note.
