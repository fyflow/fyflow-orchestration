# W217 — #1: a join's collection keyed by each branch's own key; `CHECKPOINT_FORMAT` 2; ADR 0138

**Status:** done 2026-10-25 — `npm run gate:item` on the final tree, one command, EXIT 0 (the Record); both readers RAN, every finding acted on or declared; ADR 0138 written, ADR 0037 and ADR 0062 amended by note; the format-2 refusal measured both ways against the 0.11.0 driver; no stop-and-ask, no exception beyond the record step, no question raised. Earlier: declared 2026-10-25 on `5d14a2c`, P44's FOURTH item: (a1), (b); decisions 4-6; facts 1-5; this file written from the plan's row BEFORE any other edit
**Plan:** [P44](../plans/p44-what-a-join-hands-on-and-how-a-key-path-reaches-into-it.md) — *what does a join hand on, and
how does a key path reach into it?* — and this is its FOURTH item: fyflow-app's pass 5 #1, answered by the maintainer's
(a1) and, for #1 (d), by the maintainer's modification (b): no backward compatibility.

```
Spec:       spec/join-policy.md v0.24 -> v0.25 — JP-R12 (the key, the order clause, the depth-2 hazard and the v0.18
            nesting paragraph's prefix argument), the v0.17 status paragraph's prefix sentence (:48), section 2's
            satisfied row (:556); spec/run-state.md v0.35 -> v0.36 — RN-R16 (the format is 2), RN-R23 (format 1 named
            as refused), section 6's join bullet (:394); spec/flow-definition.md only if a sentence on the join's
            record moves; spec/README.md's rows.
Owns:       from P44's W217 row, exactly: src/driver/driver.ts, src/definition/wiring.ts, src/definition/assist.ts
            (the comment), src/definition/regions.ts (only if a docblock moves), test/driver/**, test/definition/**,
            test/fold/**, test/matrix/**, test/scheduler/**, test/definition/l4-corpus.test.ts (counted),
            examples/l6.ts (fact 3's twenty-two claims — re-derived, no block added), examples/README.md (if a copy
            moves), spec/join-policy.md (v0.25: JP-R12, :48, :556), spec/run-state.md (v0.36: RN-R16, RN-R23, :394),
            spec/flow-definition.md (only if a sentence on the join's record moves), spec/README.md, AGENTS.md (the
            WHOLE file, sentence D'), README.md (the X8 fence), scripts/check-docs.mjs (RUN_FLOOR only),
            doc/decisions/0138-*; this file.
            Exceptions (declared BEFORE the edit, workflow section 7 rule 2): the record step's four files — ADR 0037
            and ADR 0062 each carry an amendment note, and ADR 0102 (rule 4) and ADR 0130 (rule 2) each a factual
            note that format 2 refuses the checkpoints they speak of (doc/decisions/**; the last two added to this line
            after the conformity reader's NIT 7 — they were made inside the record step's folder and disclosed in the
            Re-takes, but not named here first); P44's plan file is not touched (its Record is
            W218's). No `run` snippet is planned, so RUN_FLOOR is not expected to move. Anything else found to need an
            edit is a STOP-AND-ASK.
Inputs:     P44 decisions 4-6, facts 1-5, (a1), (b); fyflow-app pass 5 #1 (read only); ADR 0037 rule 4 (JP-R12), ADR
            0062 consequence 5, ADR 0046 (the lifetime, unmoved), ADR 0064/0065 (the checkpoint, the resume), ADR 0128
            (inputOf), ADR 0130 (a checkpoint-compat ADR, the model); the draft patch at the session scratchpad's
            p44/draft.patch.
Outputs:    (1) the OWN KEY in `collectArrivals` (driver.ts): a map instance's arrival keyed by its item index (the
                arriving branchPath's LAST segment), a fan-out branch's by its ENTRY NODE ID (`branches[segment]`),
                at every depth; inserted in ascending item index / `branches` order (compareBranchPaths over the
                full paths, unmoved); built by OWN-PROPERTY DEFINITION (`Object.fromEntries`), never by assignment,
                so a `__proto__` entry id is an own key; a branch that did not arrive has no key; `{}` when nothing
                arrived. Recording, the instance key, the lifetime and the release (ADR 0046) unmoved.
            (2) the wiring check's record (`record()`, wiring.ts): a fan-out's properties and sample keyed by entry
                id, a map's sample keyed `"0"`…`"n-1"`, both by own-property definition; its comments; assist.ts's.
            (3) `CHECKPOINT_FORMAT` = 2 (driver.ts) and its docblocks; a format-1 checkpoint refused `format` by
                `resume()`, `runtime.resume` and `inputOf` before anything is replayed — whether or not the run has a
                join; ONE keying, no header field, no dual path.
            (4) every fixture of fact 3 re-derived by hand from the row's own steps: L2 (depth one, two, three; the
                key-order fixtures, their reason restated), L5 (every cell whose join fires; the four whole-matrix
                claims), the wiring/ask/gate definition suites, every hand-built format-1 checkpoint rewritten to 2
                with ONE kept as the refusal's subject, the constant's literal; examples/l6.ts's twenty-two claims.
            (5) new L2 cases: a fan-out whose entries are "b" and "2" listing "2" first; one whose entry is
                `__proto__` carrying it as an OWN key, through `structuredClone`; the wiring record naming an entry id
                `fits`; the format-1 refusal by resume(), runtime.resume and inputOf, each beside the same run at
                format 2 resuming / reading.
            (6) ADR 0138, amending ADR 0037 rule 4 (JP-R12) and ADR 0062 consequence 5; spec/join-policy.md v0.25,
                spec/run-state.md v0.36, spec/README.md; AGENTS.md section 5 ("What a join carries downstream") and
                every snippet; README.md's X8 fence.
Depends on: W216 (5d14a2c)
Blocks:     W218
Tests:      Outputs (4), (5). Expected values from ADR 0138 and the spec as written before the first run, derived by
            hand from each row's own steps, never from the old literal by substitution and never from output.
Gate:       `npm run gate:item` (not the plan's last item; no edit to scripts/check-register*.mjs,
            scripts/state.mjs or doc/questions/README.md); `npm run gate` on the B' draft (spec, AGENTS.md and README
            edits included) before the Owns are fixed and before the readers (sentence C); L2: the collection at
            depth one (a fan-out by entry id, a map by index), two and three, every expected value re-derived from
            the row's steps; a fan-out whose entries are "b" and "2" listing "2" first and one whose entry is
            `__proto__` carrying it as an OWN key; the N = 12 descending fixtures keeping their shapes, their reason
            restated; a branch that did not arrive having no key; L5: every cell whose join fires and the four
            whole-matrix claims; the wiring record keyed the same, a successor's `inputSchema` naming an entry id
            checked `fits`; `CHECKPOINT_FORMAT` 2; a format-1 checkpoint refused `format` by `resume()`,
            `runtime.resume` and `inputOf`, its control the same run at 2 resuming; L6 green with fact 3's claims
            re-derived; `RUN_FLOOR` and `check:docs` green; the 0.11.0 driver (`bdbdb1c`, in a worktree) refusing a
            format-2 checkpoint `format`; then the conformity reader and the adequacy reader, workflow section 6.
Reserves:   Q786-Q787, ADR 0138
```

## Scope

**In**

1. **The own key** — Output (1).
2. **The wiring record** — Output (2).
3. **The format** — Output (3).
4. **The re-derivation, the new cases** — Outputs (4), (5).
5. **ADR 0138, the spec, `AGENTS.md`, `README.md`** — Output (6). BREAKING: every key of every collection moves, and
   every 0.11.0 checkpoint is refused.

**Out** — named rather than left implicit, with where it goes instead

- **A format-1 checkpoint resumed, migrated or read under the old keying** — (b), the maintainer's: no dual path.
- **Refusing an all-digit or `__proto__` node id** — (a1): no id is refused.
- **`branch.*` events, task ids, `RunState.regions`, `inputOf`'s `branchPath`** — unmoved (fact 4).
- **A join reducer** — [Q165](../questions/q165.md), deferred.
- **A new L6 block** — W218.
- **The version bump, push and publish** — the maintainer's ((e1)).

## Re-takes (P44's *W217 — Re-takes*), at `5d14a2c`, before any `src/` edit

1. **Fact 3's census, built WITH the spec edits (B′)** — the driver's own key, the wiring record and `CHECKPOINT_FORMAT` 2
   applied, then `spec/join-policy.md` v0.25, `spec/run-state.md` v0.36, `spec/flow-definition.md` v0.54 and
   `spec/README.md`, every lane run in node 24.20.0 (the session scratchpad's `w217/c1.test.log`, `c2.*.log`): **L1-L5
   41 failed** — the same 41 cases in the same files as fact 3; **L6 22 failed** of 2,861; **`check:docs` X4 on the same
   five `run` snippets**; `check:spec`, `check:policies`, `check:workers`, `check:wiring`, `check:markdown` EXIT 0. The spec
   edits added NO reader. Deno and chromium were not re-taken at the census; the B′ gate below ran all three.
2. **What the census by run does not see, found by grep for each premise the change falsifies** (*keys are branch
   paths*, *dotted keys keep settlement order*, *a checkpoint before 0.11.0 resumes*): `AGENTS.md` section 3's map
   paragraph, the `"$payload"` and `"$item"` tables' *`CHECKPOINT_FORMAT` stays 1*, section 4's ADR 0130 bullet, the 0.8.0
   rename paragraph, section 13's expression paragraph and its reduction snippet's hand-built `{ '0': …, '1': … }`, section
   17's instance table row, the resume refusals' 0.7.0 sentence; `spec/flow-definition.md`'s `record` row, its `["n"]`
   row's *`JP-R12`'s order rule* and its *invisible at depth 1* citation; `RN-R23`'s 0.7.0 clause; ADR 0102 rule 4's and
   ADR 0130 rule 2's *resumes*; and in `examples/l6.ts` the W206 block's two CONTROLS (`collection[1] !==` and `ask[1]
   !==` a `{ 0: …, 1: … }` literal) — passing, and VACUOUS once the keys moved, since an old-shaped literal differs from
   any new collection. All moved.
3. **Fact 2's `__proto__` through a threaded pool's clone, measured** (`w217/proto-clone.mjs`, a `postMessage` round
   trip through a worker — the scheduler's threaded pool hands `task.payload` by `postMessage`, `dist/node/index.js`):
   in node 24.20.0 and deno 2.9.6 an own `__proto__` key built by `Object.fromEntries` survives `structuredClone`, is an
   own key INSIDE the worker and on the way back, prototype `Object.prototype` throughout. **New: a plain assignment
   `o['__proto__'] = v` drops the key in node and DEFINES it in deno** (deno 2.9.6 has no `Object.prototype.__proto__`
   accessor) — so the definition-vs-assignment case discriminates in node and a browser only, which `own-key.test.ts`'
   header states.

## Predictions, written before the change

1. **P44 prediction 4**: the census is fact 3's plus its spec edits' readers — 41 L1-L5 cases and 22 L6 claims at
   least, at most five more files than fact 3 names; no `branch.*` event, task id, `regions` value or `inputOf` path
   moves.
2. **P44 prediction 5**: no L5 matrix CELL's own assertion moves — only the four whole-matrix JP-R12 claims.

## Verification

`npm run gate` on the B' draft before the `Owns` are fixed; the two readers in their own worktrees under `C:/tmp-w217/`
(`node_modules` COPIED, scanned for links and reparse points, never removed with `--force`); the 0.11.0 driver's refusal
in a worktree at `bdbdb1c`; then `npm run gate:item` once, on the final tree, held still. **Routing coverage**: a nested
fan-out and a map in a fan-out (Q6) are the subject; a branch routed away (Q4) has no key; `user_action` (Q17), an
unmatched decision (Q10) and the task id (Q13) are not moved — the matrix's cells keep their verdicts.

## Record

*Filled 2026-10-25, after both readers. Harnesses and logs in the session scratchpad's `w217/` (`probe.mjs`,
`rule8.log`, `rule8-why.log`, `proto-clone.mjs`, `cross-version.mjs`, `cross-version.log`, `gate-draft2.log`,
`gateitem.log`, the edit scripts); the readers' in `C:/tmp-w217/rc-scratch` and `C:/tmp-w217/ra-scratch`.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| B′ — `npm run gate` on the draft (code, tests, spec v0.25 / v0.36 / v0.54, `spec/README.md`, `AGENTS.md`, `README.md`, ADR 0138), before the readers | RAN — first EXIT 1 (`check:register` R7: ADR 0138's `amends` not in the field's form; fixed), then **EXIT 0**, 02:35:34 → 02:40:41 (`gate-draft2.log`) | L1-L5 **103 files / 2,295 cases** in node 24.20.0, deno 2.9.6 and chromium; L6 **2,861 / 0 failed** over 246 real runs in node and deno |
| L2: the collection at depth one, two and three, by hand | RAN | `own-key.test.ts` case 1 (pass 5's flow); `nested-regions.test.ts` (two instances, a lost branch, depth three, twelve instances, N = 0, the latch); `matrix.test.ts`' JP-R12 tables; `map.test.ts` |
| L2: `"b"`/`"2"` → `["2","b"]`; `__proto__` an OWN key | RAN | own-key cases 2-3; `__proto__` through `structuredClone` and a resume's re-dispatch |
| L2: the N = 12 descending fixtures keep their shapes, reason restated | RAN | `map.test.ts` (each value under its OWN index), `nested-regions.test.ts` (inner `p`,`q` in `branches` order though `q` settled first); the sort's discriminating fixtures are own-key case 2's — three settled in reverse, TWELVE in order (lexicographic) |
| a branch that did not arrive has no key | RAN | `matrix.test.ts` routed-away (and no POSITION key), nested-regions' lost/exited cases |
| L5: every cell whose join fires and the four whole-matrix claims | RAN | `matrix.test.ts`, `matrix/ask.test.ts`; no cell's own assertion moved (P44 prediction 5 HOLDS) |
| the wiring record, a successor naming an entry id `fits` | RAN | own-key case 4 (entry id and item index, `prep.10` `no`, `prep.01` and `0.0` and `0` meet nothing, the fan-out SAMPLE keyed `["__proto__","x"]`, `__proto__` a property); `wiring.test.ts`, `definition/ask.test.ts`, `definition/gate.test.ts` re-keyed |
| `CHECKPOINT_FORMAT` 2; a format-1 checkpoint refused `format` by `resume()`, `runtime.resume`, `inputOf`, the control at 2 | RAN | own-key case 5 (with a join and without; `runtime.resume` on the join run); `resume.test.ts`, `input-of.test.ts`, `scheduler/resume.test.ts` each keep one format-1 refusal |
| **the 0.11.0 driver refusing format 2** | RAN — **both ways** (`cross-version.log`, the worktree `C:/tmp-w217/old` at `bdbdb1c`) | each driver writes pass 5's run; the new one refuses the 0.11.0 checkpoint `format` by `resume`, `resumeRefusal`, `inputOf` and `runtime.resume`, nothing dispatched; the 0.11.0 one refuses the new checkpoint the same way (*header.format is 2 … reads format 1 only*); each resumes and reads its OWN (the controls) — the new handing `check` `{"prep":{"0":1,"1":2},"side":{"xs":[1,2]}}`, the old `{"0":{"0.0":1,"0.1":2},"1":{"xs":[1,2]}}` |
| L6 with fact 3's claims re-derived | RAN | 22 claims re-derived from each flow's `branches`; the W206 block's two CONTROLS re-keyed (Re-take 2) |
| `RUN_FLOOR`, `check:docs` | RAN | `RUN_FLOOR` not moved — no `run` snippet added; `check:docs` EXIT 0 with the five snippets re-derived |
| conformity reader (`C:/tmp-w217/rc`) | RAN | 0 BLOCKER, 3 SHOULD, 8 NIT, below; every expected value re-derived before the tests, all matched; its own both-ways format check agreed |
| adequacy reader (`C:/tmp-w217/ra`) | RAN | 29 probes: **23 KILLED, 6 SURVIVED** (M8 lexicographic sort; W1d, W2, W2d the record's fan-out props/sample by assignment or position; W5, W6 `BRANCH_KEY` narrowed / leading zero); positive control KILLED, no-op control SURVIVED in every lane; restore proved by digests and `git diff --stat` |
| rule 8 — each fix on the readers broken (`probe.mjs`, `rule8-why.log`), graded on its named assertion | RAN | the six survivors re-run: **all six KILLED** by the case each fix added, each by its own message (M8 by the twelve-entry order, W2 and W2d by the sample's keys, W1d by `__proto__.k`, W5 by `prep.10`, W6 by `prep.01`); the no-op control SURVIVED; files restored by digest |
| **`npm run gate:item`** on the final tree, held still | RAN — **EXIT 0**, one command, 2026-10-25 03:25:25 → 03:48:15 (`gateitem.log`) | lint; typecheck; every check; L1-L5 **103 files / 2,295 cases** in node 24.20.0, deno 2.9.6 and chromium (parity) — 2,289 + 6, the new suite; L6 **2,861 / 0 failed** over 246 real runs in node and deno; selftests **10/10 ok** (1,074.1 s wall, 9 lanes), `check:register:selftest` left out by `--without`. Written after it: this row and the status line alone — `check:markdown`, `check:spec`, `check:budget`, `check:wiring`, `check:docs` and `check:register` re-run on it |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the own key in `collectArrivals`, by `Object.fromEntries` | yes — `driver.ts` | own-key cases 1-3, the re-derived L2/L5 suites, L6; adequacy M1-M9, author P-* |
| (2) `record()`'s keys, `BRANCH_KEY` | yes — `wiring.ts`; `assist.ts`' comment | own-key case 4, `wiring.test.ts`; adequacy W1-W6 |
| (3) `CHECKPOINT_FORMAT` 2 and the refusals | yes | own-key case 5, `checkpoint.test.ts`' literal, the kept format-1 cases; adequacy F1-F4, H1-H3 |
| (4) every fixture of fact 3 re-derived | yes — 41 L1-L5 cases, 22 L6 claims, 5 snippets | the suites themselves |
| (5) the new cases | yes — `test/driver/own-key.test.ts`, 6 cases, counted in `l4-corpus.test.ts` | the census itself |
| (6) ADR 0138, the spec, `AGENTS.md`, `README.md` | yes; notes in ADR 0037, 0062, 0102, 0130 | `check:spec` C8, `check:docs` X4/X8, `check:register` R6-R7; the prose is held by readers |
| `examples/README.md` (if a copy moves) | moved — two sentences (conformity SHOULD 1) | — |
| `src/definition/regions.ts` (only if a docblock moves) | **not touched** — its `branches` docblock was already right | — |

**Predictions.** 1 (**P44 prediction 4**) **HOLDS at its floor**: the census with the spec edits is fact 3's exactly —
41 L1-L5 cases, 22 L6 claims, the same five snippets, zero more files — and no `branch.*` event, task id, `regions` value
or `inputOf` path moved. 2 (**P44 prediction 5**) **HOLDS**: no L5 cell's own assertion moved; the four whole-matrix
claims did.

**The readers, and what was acted on.**

| reader | finding | acted on |
|---|---|---|
| conformity SHOULD 1 | `examples/README.md:74` — nested-map's *collection at key `1`*, and *keyed by branch path* | **FIXED** |
| conformity SHOULD 2 | `examples/l6.ts` comments still stating the old key (`:3193`, `:663`, `:2107`, `:2133`) | **FIXED** |
| conformity SHOULD 3 | `AGENTS.md`: *a driver older than 0.11.0 refuses a newer checkpoint `diverged`* — any pre-0.12.0 driver refuses a 0.12.0 one `format` | **FIXED** |
| conformity NIT 1 | *`regionPath` + `.` + the position* is wrong at the top level (`-`) | **FIXED** — JP-R12, ADR 0138, `AGENTS.md` |
| conformity NIT 2, 3 | JP-R12's and RN-R16's Test clauses named fixtures the suite does not hold | **FIXED** — both restated to what the suite holds |
| conformity NIT 4 | own-key case 1's control message overclaimed | **FIXED** — the message says what the control separates |
| conformity NIT 5 / adequacy NIT 3 | stale *keyed by branch path* comments and messages in tests (top-level maps, values right) | **FIXED** — comments and messages; the `retention.test.ts` case NAME kept (a top-level map's index and path are one string) |
| conformity NIT 6 | `assist.ts:99` comment | **FIXED** |
| conformity NIT 7 | the Exceptions line named 0037 and 0062 only; ADR 0138 called ADR 0130's clause *superseded* | **FIXED** — the line names 0102 and 0130; ADR 0138 consequence 3 says the rule is unmoved and has no checkpoint left to apply to |
| conformity NIT 8 | `AGENTS.md` disagreed with itself on a stored `stopped` element | **FIXED** |
| adequacy SHOULD 1 (M8) | a lexicographic sort survived every lane — W217's integer-like map keys lost the old kill | **FIXED** — own-key case 2, twelve non-integer-like entries settled in order; `map.test.ts`' docblock corrected; rule 8 KILLED |
| adequacy SHOULD 2 (W2, W2d) | the record's fan-out SAMPLE keys were unpinned | **FIXED** — own-key case 4 reads a transformed successor's sample; rule 8 KILLED both |
| adequacy SHOULD 3 (W1d) | the record's own-property definition was unpinned | **FIXED** — `__proto__.k` as a string `no`; rule 8 KILLED |
| adequacy NIT 1 (W5, W6) | `BRANCH_KEY`'s exact spelling untested | **FIXED** — `prep.10` `no`, `prep.01` `fits`; rule 8 KILLED both |
| adequacy NIT 2 | RN-R23's Test clause still listed *format 2* among the refusals | **FIXED** |
| adequacy NIT 4 | L6 (vii) derives its expected keys by `collectArrivals`' own expression (from the run's `regions`) | **DECLARED** — the regions are an independent source and the r51/r52 row literals are hand-written, so M1/M2 are still killed at L6 |

**Decisions taken by this item** (within decisions 4-6, ADR 0138): the `stopped` dual read KEPT (unreachable from any
written checkpoint; removing it is not P44's); `BRANCH_KEY` is `String(i)`'s spelling; the wiring record built by
`Object.fromEntries` like the collection; one format-1 refusal kept per resume/read suite, every other format-1 header
rewritten to 2.

**What broke.** At no rung. Two passing CONTROLS in `examples/l6.ts` would have become vacuous (Re-take 2), found by
reading rather than by any lane; and a lexicographic sort lost its only killer when the map keys became integer-like,
found by the adequacy reader.

**What this taught.** Nothing for `doc/workflow.md`. *For the retro*: **a re-keying changes what a CONTROL literal
means** — an old-shaped literal used as a control differs from every new value, so it passes and proves nothing; a
census by failing cases cannot see it, because it does not fail. **And a change of key TYPE moves which kill the
LANGUAGE does for you**: integer-like keys made the sort unobservable on every map fixture. And deno 2.9.6 has no
`__proto__` accessor, so an assignment-vs-definition probe kills in node and a browser only.

**Questions raised.** None — Q786-Q787 SPENT, unissued. **Closed.** None. **ADR 0138** written; **ADR 0037** and **ADR
0062** carry amendment notes, **ADR 0102** and **ADR 0130** factual notes (the record step). **Exceptions used**: the
record step's `doc/decisions/**`, as declared.

**The readers' overlap.** **ONE** — the stale *keyed by branch path* message at `test/driver/ask.test.ts:368`
(conformity NIT 5, adequacy NIT 3). The two Test-clause findings are on two rules (`RN-R16`, `RN-R23`) and are not
counted as one.

**Leftover worktrees.** `C:/tmp-w217/old` (at `bdbdb1c`, for the both-ways measurement), `C:/tmp-w217/rc` and
`C:/tmp-w217/ra` (at `5d14a2c` with the pre-reader change applied), each with `node_modules` COPIED and scanned (0
links, 0 reparse points), and `C:/tmp-w217/rc-scratch`, `ra-scratch` — left for the maintainer; not removed with
`--force`.
