# W196 — the run's live state on its handle: `state()`, `outcome()`, `node()`

**Status:** done 2026-10-21 — `npm run gate:item` on the final tree, one command, EXIT 0 (the Record); both readers RAN, the conformity reader's one BLOCKER (C1) fixed as a stated exception and provoked; 29 provocations KILLED, 2 declared survivors (unreachable through a driver); no question raised. Earlier: declared 2026-10-21 on `e2b62c8` (W195 committed, the tree clean); P39's THIRD item: stop-and-asks (b), (c), (d) and (f) as answered; the declaration step RUN before any `src/` edit (below)
**Plan:** [P39](../plans/p39-what-a-step-costs-and-where-a-live-run-state-is-read.md) — *what does a step cost on a long
run, and where may its owner read the run's live state?* — and this is its THIRD item: the surface, fyflow-app pass 2 #2.

```
Spec:       spec/run-state.md v0.30 -> v0.31 — RN-R25 (the handle's members), a new RN-R44 (what the handle's state is:
            a frozen copy, cached until the next fold input that moves it, equal to fold(driver.foldInputs()) at a
            quiescent point, on start and on resume; done the same object); spec/README.md's row for v0.31.
Owns:       from P39's W196 row: src/scheduler/runtime.ts, src/scheduler/index.ts, src/fold/accumulator.ts,
            test/scheduler/**, test/definition/l4-corpus.test.ts, spec/run-state.md (the WHOLE file), spec/README.md,
            AGENTS.md (the WHOLE file, sentence D′), README.md (the "More examples" row), scripts/check-docs.mjs
            (RUN_FLOOR), scripts/publish-output_test.ts (only if it lists the handle's members — re-take 1: it does
            not, not edited), doc/decisions/0122-*
            Exceptions (declared BEFORE the edit, workflow section 7 rule 2): none. The record step's four files carry
            ADR 0058's dated amendment notes (doc/decisions/**) and P39's stop-and-ask (f) answer (the plan's Record
            step). Anything else found to need an edit is a STOP-AND-ASK, never an edit.
Inputs:     P39 stop-and-asks (b), (c), (d) ANSWERED 2026-10-21 as recommended, and (f) ANSWERED 2026-10-21 as
            recommended — `done` resolves with the SAME frozen object `state()` returns, BREAKING in 0.9.0 for code
            that mutates it; P39 fact 10, RE-RUN here; ADR 0058 rules 1, 5 and 6 and consequence 3; ADR 0007 (why not a
            live view); ADR 0064 rule 4 (a copy); ADR 0091 (release when done settles); ADR 0120 rule 5 (what a
            materialised state shares); RN-R12, RN-R19, RN-R22, RN-R25.
Outputs:    (1) ADR 0122 — a runtime's live state is a FROZEN copy on its handle, cached until the next fold input that
                moves it; amends ADR 0058 rules 1 (the handle's shape) and 5 (what is kept: the accumulator, not one
                stepped RunState), and consequence 3 (what the kept state shares).
            (2) the runtime keeps ONE accumulator per run and applies each input to it (runtime.ts:844-852), the
                stored events applied before the first read or the first delivered input, whichever is first; a
                settlement's or a resolution's record taken as the runtime's OWN copy (re-take 3: the kept state
                shared its result with what the consumer's onFoldInput is handed).
            (3) `RunHandle.state(): RunState` — frozen at every depth; the SAME object on every read with no input
                between that moves the state.
            (4) `RunHandle.outcome(): RunOutcome` and `RunHandle.node(taskId): NodeRun | null` (frozen) — O(1).
            (5) `done` per (f): the same frozen object `state()` returns when it settles, still asked at a microtask
                (ADR 0058 rule 6); after release, `state()` keeps returning it — but for an `unpause` of a run that
                finished while paused, the one run control a finished run takes (`RN-R35`; the conformity reader's C1,
                stated in RN-R44, not suppressed).
            (6) RN-R25's text, RN-R44, ADR 0122; AGENTS.md section 8 (the handle's reads, replacing "fold incrementally
                from onFoldInput" for a runtime's consumer, and prediction 4's cost of reading state() per input) with
                a `run` snippet; RUN_FLOOR 50 -> 51; README.md's row; BREAKING in 0.9.0 for code that BUILDS a handle
                and for code that mutates `await done`.
Depends on: W195, and P39 (f)
Blocks:     W197
Tests:      L1 on a double — test/scheduler/live-state.test.ts: at EVERY quiescent point of a run (a microtask after
            each delivered input) `state()` deep-equals `fold(driver.foldInputs())`, key order included — the caller's
            own expression, a second route — over a linear flow, a fan-out, a map nested in a fan-out, and every
            valid corpus flow; on `start`, and on `resume` at its first quiescent point (the stored events folded),
            with the premise that no read can precede the first delivered input (RN-R22) asserted. Two reads with no
            input between are `===`; a read after an input that moves the state is not, and the earlier one is
            unchanged by it. Frozen at every depth the state has (nodes, a node's NESTED result, an ask's nested
            input, a gate's nested key, regions and their lists, pathEnds, resumes); a consumer's mutation — of the
            read itself (an alias), of a shallow copy, and of the NESTED result its onFoldInput was handed — changes
            neither a later read nor `done`. `outcome()` and `node(id)` equal the state's at each point, `node` of an
            unknown, a `toString` or a `__proto__` id `null`; a parked `user_action` read through both. `done` per (f)
            — `===` `state()`, frozen — over `completed`, `halted`, `interrupted` and `cancelled`. A released run's
            `state()` the final state, a late settlement and a refused run control moving nothing. A result
            `Object.freeze` cannot reach (a typed array, a `Map`) neither crashing `state()` nor `done`. The runtime's
            materialisations COUNTED (a test-side wrapper, no counter in `src/`): one per state read after an input,
            none for `outcome()`. The source binding in runtime.test.ts: the runtime keeps W194's accumulator and
            reads no `foldInputs()`. The `run` snippet executed by check:docs.
Gate:       `npm run gate:item`; then the conformity reader and the adequacy reader, workflow section 6.
Reserves:   Q730-Q734, ADR 0122
```

## Scope

**In**

1. **The runtime's accumulator** — Outputs (2); **the three reads** — Outputs (3), (4); **`done`** — Outputs (5).
2. **The record** — Outputs (6).

**Out** — named rather than left implicit, with where it goes instead

- **State handed to `onFoldInput`** — DECLINED, P39 (b). **What `onFoldInput` hands** — unchanged (P39 decision 5): the
  runtime takes its own copy rather than freezing the consumer's.
- **A live mutable view** — refused, P39 (b), ADR 0007's hazard.
- **A public accumulator** — refused, P39 (c).
- **Making `state()` O(1) per input** — not possible for a frozen plain `RunState` (P39 prediction 4); the cheap reads are
  the answer, and the reply says so (W197).
- **A counter in the runtime** — none placed; W197 reads the runtime's work by wrapping the accumulator's prototype in a
  test, as this item's own count case does.
- **The version bump to 0.9.0** — the maintainer's `chore:` commit after the plan, as 0.8.0's was (`581d0e5`).
- **L6** — W197.

## What the declaration step re-took, before anything was edited

*P15 decision 5: every fact is re-run by the item that acts on it. Taken 2026-10-21 on `e2b62c8`, the tree clean. The
script is the session scratchpad's `w196/retake3.ts` (its output `w196/retake3.log`), importing the tree by file URL.*

| # | re-take | measured |
|---|---|---|
| 1 | every reader of `RunHandle` and every literal that BUILDS one, over `src/`, `test/`, `examples/`, `scripts/` and `AGENTS.md` — by grep, and by adding the three members and counting typecheck errors per lane | **ONE literal builds a handle** — `openRun`'s return (`runtime.ts:880`). With the members added: **one error in each of the five lanes** (node, browser, deno, tests, examples), all at that literal; no `AGENTS.md` snippet builds one (the sixth lane, `check:docs`); `examples/l6.ts` names the type four times and builds none; `scripts/publish-output_test.ts` does not list the handle's members — not edited |
| 2 | the resume road's `seed` (`runtime.ts:771`, `:845-848`) | the stored events are stepped at the FIRST delivered element; **`resume()` delivers at least one before it returns** — 1 on a three-element store (the `resumed` element, `RN-R22`: appended always) — so through the public API no read of the handle can precede the first delivered input. The reads catch up anyway, so they are total |
| 3 | what `freezeInput` and `foldInputs()` share with the kept state | **the kept state's `result` IS the object the consumer's `onFoldInput` was handed** (`input.record.result`, `===`), which `freezeInput` cloned from the scheduler's and froze one level deep — the input and its record frozen, the result NOT; `foldInputs()` clones again and shares nothing with it |
| 4 | P39 (f)'s answer, and every test reading `await done` by identity or mutating it | (f) answered 2026-10-21 as recommended. **A consumer writing the NESTED result its `onFoldInput` was handed moves `await done`'s value** (measured: `true`), and `await done` is mutable at every depth today (`outcome` written). No test or example compares `await done` by identity except the W77 suite's `!==` against a caller's own fold, which still holds; none writes into it (grep over `test/`, `examples/`, `AGENTS.md`) |
| 5 | the ladder counts — `npm run gate` on `e2b62c8`, EXIT 0 (scratchpad `w196/gate-base.log`) | L1-L5 **2,122 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 2,122); L6 **2,789 assertions / 0 failed** in node and deno; `check:docs` **50** `run` snippets; `check:spec` C4 45 |

## Verification

`npm run gate` before the readers; then the two readers; then `npm run gate:item` once, on the final tree. **Routing
coverage**: not applicable to routing — the handle routes nothing; `user_action` (Q17) — a parked task read
`awaiting_action` through `outcome()` and `suspended` through `node()`; a nested fan-out (Q6) — the regions' freeze depth,
and the map nested in a fan-out branch; a branch routed away from its join (Q4) and no matching decision edge (Q10) — the
valid corpus flows (`p1-routed-away`, `failure-edge`), each read at every quiescent point; a duplicate task id (Q13) — not
applicable, the handle reads what the fold holds.

## The author's provocations

`mutate.mjs` (kept with its logs in the session scratchpad, `w196/`) in the byte copy `C:/tmp-w196/m` (a worktree of
`e2b62c8` with this diff applied, `node_modules` copied, `find -type l` 0 and no reparse point, green before use; node
24.20.0 asserted at the head of each run): each probe edits ONE clause, its anchor checked to occur once in the CURRENT
text; every file restored from its FIRST snapshot and its SHA-256 compared after every probe and at the end; graded on the
FAIL lines of the cases each probe DECLARES in `node test/runner.ts scheduler/live-state` and `scheduler/runtime`.
**Grader controls**: CONTROL CLEAN, GRADER-CRASH CRASH, GRADER-WRONG-REASON (D08's edit declared against the cache case)
WRONG-REASON.

| pass | probes | result |
|---|---|---|
| before the readers (`mut1.log`) | 27 + 3 controls | 24 KILLED; **3 SURVIVED**: D07 and D27, unreachable by design (below); **D15 — the predicate materialising per input, ADR 0122 consequence 5's own provocation** — survived because the count case settled every task in ONE synchronous turn, so the cache absorbed it (fixed before the readers reported: one settlement per turn; D15 KILLED) |
| after the readers (`mut2.log`) | **31 + 3** | **29 KILLED, 2 SURVIVED (D07, D27, declared)**, controls CLEAN / CRASH / WRONG-REASON, digests equal |

The clauses, by id: D01-D02 rule 1 (an input applied; the cost restored, a materialisation per input); D03-D07 rule 2's
`state()` (the cache dropped by a moving input, kept between inputs, frozen at all, frozen at every depth, kept on an
unmoved input); D08-D12 rule 2's cheap reads (`outcome()` and `node()` never materialise, `node` own-only and frozen,
`outcome` current); D13-D15 rule 3 (`done` the same object, frozen, its predicate on the outcome alone); D16-D20 rule 4 (a
settlement's and a resolution's record copied, an object result, deeply); D21-D22, D29-D31 rule 5 (every typed array left
as it is, a Map's members and keys, a Set's members); D23-D27 rule 6 (the stored events applied, once, through the copy,
never before the replay accepts them, caught up by a read); D28 consequence 4 (the step restored in the machinery); D32 the
conformity reader's C1 (every element applied after `done` too).

**Declared survivors, each with its second route**: **D07** — an input the accumulator reports UNMOVED keeps the cache: no
driver appends one (the adequacy reader's probe3 counted ZERO such inputs over all 26 corpus flows in four modes; the driver
refuses every repeated run control), so the clause is the code's symmetry with `step`, unobservable through a driver.
**D27** — a read catching up a resume's stored events: `resume()` always delivers its `resumed` element before it returns
(`RN-R22`; re-take 2; the suite asserts the premise, `deliveredInside >= 1`), so the delivery always comes first. Kept so
the reads are total.

## Record

*Filled 2026-10-21, after both readers and the confirming gate.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate` before the readers (sentence C) | RAN — **EXIT 1** | lint through L6 node green: L1-L5 **2,134 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 2,134); `check:docs` **51** `run`; L6 node 2,789 / 0. **L6 deno: 2,792 assertions, 5 failed — ONE clause, `W188 exit (6)`**, *"the resumed task settling (on B) never happened within 15000 ms"*, and the cross-row and gate rows that read it. **Not reproduced**: deno L6 re-run alone, EXIT 0, 2,789 / 0 (scratchpad `w196/l6deno-2.log`), and again with both readers running, deno and node each 2,789 / 0 (`l6deno-3.log`, `l6node-3.log`). The clause waits on a real threaded worker failing its third attempt; it reads nothing W196 changed (no `state()`, its `done` unawaited) — **a timing flake under load, read so, and the confirming gate below is the evidence** |
| L1 the reads at every quiescent point, the corpus, a resume, the cache, the copy claim, the cheap reads, `done`, after release, the freeze's limit, the count | RAN — green | `test/scheduler/live-state.test.ts`, 11 cases; `runtime.test.ts`' source binding moved (ADR 0122 consequence 4); no other suite's expected value moved |
| conformity reader | RAN | C1 BLOCKER, C2 SHOULD, C3-C6 NIT — below |
| adequacy reader | RAN | ~60 mutations by the rule ids; G1-G3 SHOULD, G4-G7 NIT — below |
| the author's probes | RAN, twice | **after the readers: 31 probes + 3 grader controls — 29 KILLED, 2 SURVIVED (declared)** |
| **`npm run gate:item`** on the final tree, held still | RAN — **EXIT 0**, one command (`C:/tmp-w196/gateitem.log`) | lint; typecheck; every check, `check:docs` **51** `run`, `check:spec` C4 45; L1-L5 **2,134 cases** in node 24.20.0, deno 2.9.6 and chromium (parity 2,134); L6 **2,789 / 0 failed** in node AND deno (`W188 exit (6)` green); selftests 10/10 ok (1,062.5 s wall, 9 lanes), `check:register:selftest` left out by `--without`. Written after it: this Record and Status — `check:register`, `check:markdown`, `check:spec`, `check:budget` and `check:wiring` re-run on them, EXIT 0 — and ONE comment line in `runtime.ts` (`own`'s *holds only primitives of*, given C4's *BY TYPE*, found by the rule-5 grep), `lint`, `check:source` and `node test/runner.ts scheduler/` re-run, EXIT 0 |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) ADR 0122 | yes | `check:register`; `check:spec` C5 (the spec links it) |
| (2) the accumulator kept open; the record copied; the stored events applied first | yes | D01-D02, D16-D20, D23-D26 |
| (3) `state()` — frozen, deep, cached | yes | D03-D06, D21-D22, D29-D31 |
| (4) `outcome()`, `node()` — O(1) | yes | D08-D12 |
| (5) `done` the same object; after release | yes | D13-D15, D32 |
| (6) RN-R25, RN-R44, AGENTS.md section 8 and its `run` snippet, RUN_FLOOR 51, README's row, BREAKING notes | yes | `check:docs` X4 (51 `run`, the floor); `check:spec` C8 |

**The numbers** — a runtime's own cost, `start` to `done`, over a `map` on a scheduler double, every settlement in one
burst, each size a fresh process, node 24.20.0 (the session scratchpad's `w196/rt-cost.ts`, `rt-cost.log`):

| items | inputs | `e2b62c8` (stepped per input) | W196 | W196, `outcome()` read after every input |
|---|---|---|---|---|
| 1,000 | 4,005 | 987 ms | 54 ms | 57 ms |
| 2,000 | 8,005 | 8,284 ms | 75 ms | 75 ms |
| 4,000 | 16,005 | 34,311 ms | 111 ms | 115 ms |
| 8,000 | 32,005 | 157,679 ms | 204 ms | 201 ms |
| 16,000 | 64,005 | 683,151 ms | 366 ms | 373 ms |

Counted work: a 50-item map run delivers 205 inputs (4n + 5), each applied once, and costs ONE materialisation (`done`'s)
read through `outcome()` or `node()` after every input, and 204 read through `state()` twice after every input.

**Predictions.** P39 prediction 4 **HOLDS**: `outcome()` and `node()` per input cost nothing measurable (57 against 54 ms
at 1,000 items; 373 against 366 at 16,000), and `state()` read per input materialises once per input. Prediction 5 holds
for this item: no `FoldInput`, `RunState`, `CHECKPOINT_FORMAT`, `RUN_FOR`, `isFed` or `snapshot()` change.

**The readers, and what was acted on.**

| reader | finding | acted on |
|---|---|---|
| conformity | **C1 BLOCKER** — `await done === state()` after settlement does not hold for ONE call: `unpause` of a run that finished while paused, which the driver never refuses `ended` (ADR 0106, `RN-R35`); RN-R44, ADR 0122 rule 3, the `state` doc, Outputs (5) and AGENTS.md said a finished run refuses every run control | **FIXED as a stated exception** — option (a) of the reader's three: RN-R44, ADR 0122 rule 3, `RunHandle.state`/`done` docs, Outputs (5) and AGENTS.md name it; the runtime still applies every element its driver appends, so `state()` stays `fold(driver.foldInputs())` and `done` the state AT settlement. A case pins it (D32 KILLED). Option (b) breaks RN-R44's equality; (c) — the driver refusing such an unpause — amends ADR 0106 outside this item's `Owns`, and is put to the maintainer in this item's hand-back, not raised |
| conformity | C2 SHOULD — the freeze's stated limit omitted `Date` and `ArrayBuffer`, and said a write reaches nothing | **FIXED** — RN-R44, ADR 0122 rule 5, AGENTS.md, the `state` doc and `freezeDeep`'s comment: what `Object.freeze` does not stop stays writable and reaches later reads and `done` |
| conformity | C3 NIT — `node()`'s first read freezes the entry, O(the entry) | **FIXED** — "O(1) in the run" with the first-read cost, at every site |
| conformity | C4 NIT — a `reason` passed as an object by untyped code is held by reference | **STATED** — ADR 0122 rule 4: *by type* |
| conformity | C5 NIT — P39 decision 8 and ADR 0058 rule 6 | **FIXED** — dated notes (P39: (f)'s second breaking surface; ADR 0058 rule 6: *applying* for *stepping*) |
| conformity | C6 NIT — AGENTS.md's four `{ driver, done, header }` | **FIXED** — the whole handle named |
| adequacy | G1 SHOULD — the count case could not see a materialisation per input in the predicate | **FIXED** before its report (the author's own D15); and the count PINNED — 4 x 50 + 5 inputs, 204 materialisations for `state()` read per input |
| adequacy | G2 SHOULD — no fixture held a Set, an object Map key, other typed arrays, a cycle, an owner's cancel | **FIXED** — the limit case's first task returns all of them, read mid-run; an owner-cancelled run in the `done` case; D29-D31 KILLED |
| adequacy | G3 SHOULD — no gate key was an object | **FIXED** — `gated-map` keyed on `series` beside the corpus, its object keys counted and walked frozen |
| adequacy | G4 NIT — `Accumulator.entry`'s base branch untested | **FIXED** — read over a loaded state, own entries only |
| adequacy | G5 NIT — `done`'s microtask not pinned (one extra microtask passes) | **DECLARED** — the W77 suites' granularity, unmoved by W196 |
| adequacy | G6 NIT — `sameAsFold`'s second route shares `materialise` with `state()` | **DECLARED** — a materialise defect is W194's suites' (the oracle); the runtime's own logic is observed independently |
| adequacy | G7 NIT — the `run` snippet sees neither O4 nor R1 | **DECLARED** — the scheduler suites kill both; a reference snippet teaches, it is not the only observer |

**What this taught.** *For the retro*: **a cache hides a per-input cost from a count taken in one synchronous burst** — the
item's own headline provocation (a materialisation per input in `done`'s predicate) passed a count of exactly one, because
every microtask ran after the burst and all but the first hit the cache; one settlement per turn, as a scheduler delivers
them, is what makes the count an instrument. And a stated guarantee about *a finished run* has to be checked against every
run control the driver still TAKES on one — the reader found the one (`unpause`) the author's list of refusals omitted.

**Questions raised.** None (Q730-Q734 SPENT, unissued). **Closed.** None.
**Record step**: ADR 0122 written; ADR 0058 rules 1, 5 and 6 and consequence 3 carry dated notes; P39's stop-and-ask (f)
answer recorded in the plan, and decision 8's dated note. The plan's Record is the last item's (P38's precedent).

**The readers' overlap.** **TWO** — what the freeze walk reaches (the conformity reader's C2: `Date` and `ArrayBuffer`
writable; the adequacy reader's G2: Set members, Map keys, other typed arrays and a cycle unfixtured — one subject, two
halves) and `cancelRequest` (C4: its `reason` held by reference off the type; K8/G2: its freeze unexercised).

## Notes for W197

- **The runtime's work has no counter in `src/`** (ADR 0122 consequence 5): wrap `Accumulator.prototype.apply` and
  `.materialise` in the test, as `live-state.test.ts`'s count case does, and **drive one settlement per macrotask turn** —
  a burst lets the cache absorb a per-input materialisation (this item's D15). The provocation for clause (1)'s third
  subject is `isTerminal(current())` in `settleIfTerminal`, or `current()` inside `take`.
- **The exit artifact's L6 block (clause (3))**: `state()` before a resumed run's first delivered input cannot be read —
  `resume()` delivers before it returns (`RN-R22`) — so the block reads it at the first quiescent point after `resume()`.
  And mind C1: unpause after a paused run finishes moves `state()` past `done`.
- **The reply**: the runtime's own `start`-to-`done` cost over a `map`, 683 s -> 366 ms at 16,000 items on a double (table
  above); the cheap reads per input cost nothing measurable.
- **One flake to watch**: `W188 exit (6)` failed once on deno L6 inside this item's first `npm run gate` and never again
  (three re-runs green).
