# W89 — what RESUMING is

**Status:** done
**Plan:** [P23](../plans/p23-what-a-run-needs-to-outlive-its-process.md) — *what does a run need so
that it can be saved while it runs and resumed after the process that ran it is gone?*

```
Spec:       spec/run-state.md — a new section, WHAT A RESUME DOES, and the rules for it (the
            replay with dispatch held, the prefix check, the in-flight set and its re-dispatch,
            the refusals, the positions a resumed run hands out, the `resumed` input). Rules are
            ADDED; which existing rule text moves, and why, is measured rather than predicted —
            P23 prediction 4 already REVERSED at W88 and is not re-litigated here.
Owns:       src/driver/**, src/fold/**, src/scheduler/**, spec/**, test/**, doc/decisions/0065-*
Inputs:     P23 decisions 6, 7, 9 and 10, facts 1-6 (fact 1 as W88 corrected it), predictions 1-3
            and stop-and-asks (a)-(c), ALL ANSWERED; ADR 0064 and spec/run-state.md section 8
            (RN-R14 to RN-R18); ADR 0014 and ADR 0058 (the sequence, and the runtime that composes
            onFoldInput); ID-R1, ID-R3, ID-R4; OR-R6, OR-R10, OR-R11; Q364, Q365, Q366. P23's
            facts are RE-TAKEN at this item's declaration step, never transcribed (P15 decision 5):
            dev-dist/w88/replay-fixed.ts and dev-dist/p23/kill-resume.ts, the latter checked for
            Q366's shape before its numbers are trusted.
Outputs:    (1) ADR 0065 — what resuming is
            (2) Driver.resume(checkpoint): the stored settlements and resolutions REPLAYED through
                the driver's own routing from header.entryPayload, every dispatch HELD
            (3) the PREFIX check: a stored event the replay does not produce at the same index is
                REFUSED naming the index, and a replay may run past the stored prefix (a checkpoint
                taken inside onFoldInput ends mid-step)
            (4) the IN-FLIGHT set — dispatched and never settled in the replayed sequence — handed
                to the scheduler at the SAME task ids; a task parked at user_action stays parked and
                resolve() works on it after the resume
            (5) a `resumed` FoldInput naming the re-dispatched ids, appended after the replay and
                before the re-dispatch, bound into W88's Record<FoldInput['kind'], …> both ways
            (6) the refusals, by name: an unknown format (RN-R16), a flowId or version mismatch
                (no migration), a STOPPED run (P23 decision 10), and a run id LIVE on the runtime
                (Q364) — with the runtime's minted counter skipping ids in use
            (7) runtime.resume(flow, checkpoint, options) returning { driver, done, header }, as
                start does, handing the consumer the DRIVER's positions from the stored length on
Depends on: W88
Blocks:     W90
Tests:      test/driver/** at L1-L2 on a fake scheduler, test/scheduler/** at L1 through
            createRuntime's two construction seams, test/fold/** for the new input. Every stored
            checkpoint a test resumes is TAKEN from a real run of the same test's flow, never
            written by hand, and every expected value — the in-flight ids, the refused index, the
            positions — is derived from the flow and the settlements the test itself delivered.
            Resume SELECTS (doc/workflow.md rule 8 obligation (a), v0.23): which tasks are in
            flight, which prefix, which index diverged, which run id. Each fixture puts the right
            selection where the well-formed wrong ones differ — named in Verification below.
Gate:       L0 under all five typecheck lanes and lint, EACH RUN SEPARATELY and RE-RUN after the
            last test file is written; L1-L5 in node, deno and chromium; check:spec; check:docs;
            L6 UNMOVED at 1833 / 60 in node 24.20.0 AND deno 2.9.6; then the full npm run gate
            with a content digest identical at both ends.
Reserves:   Q371-Q375, ADR 0065
```

*Reserves derived by grep off the tree at this declaration: the highest question on disk is Q367
(W88 raised Q366-Q367 and left Q368-Q370 unused and not reused), so this item starts at **Q371**;
the highest ADR is 0064, so **0065**, which P23 reserved for this item.*

## Scope

**In**

1. **The replay** — a fresh driver regenerates a stored run by routing its stored stimuli
   (settlements and resolutions, and the `resumed` inputs of an earlier resume) from the header's
   entry payload, with every dispatch held rather than handed to the scheduler.
2. **The prefix check** — the stored events must be a prefix of what the replay regenerates; the
   first stored event the replay does not produce at the same index is a refusal naming that index.
3. **The re-dispatch** — the in-flight set at the end of the replay, handed to the scheduler at the
   same task ids (stop-and-ask (c)); parked tasks stay parked and `resolve()` works on them.
4. **The `resumed` input** (stop-and-ask (a)) — appended after the replay and before the
   re-dispatch, naming the ids; what the fold makes of it.
5. **The refusals** — format, flow id or version, a stopped run, a run id in use (stop-and-ask (b)),
   and a replay that diverges.
6. **`runtime.resume`**, returning `{ driver, done, header }`, with the consumer handed the DRIVER's
   positions from the stored length on — which is where W88's two DATED ceilings, `c3` and `r6`,
   expire and are re-run.

**Out** — named rather than left implicit, with where it goes instead

- **The real-worker kill and resume**, the reference teaching append-then-resume, and a `README.md`
  fence — W90.
- **The version bump** — `0.5.0` is W90's (stop-and-ask (a)); this item ships the breaking shape with
  the manifest unmoved, on W84's and W88's precedent.
- **Storage, serializers, redaction, any memory option** — P23 decisions 1 and 8.
- **Migrating a checkpoint across flow versions, versioning the registry, resuming a stopped run,
  exactly-once** — P23 decisions 6, 7 and 10.
- **A retry budget carried across a resume** ([Q365](../questions/q365.md)) — measured and stated as
  decision 6's consequence, not fixed.

## What the declaration step must re-take before anything is edited

| # | re-take | from |
|---|---|---|
| 1 | the replay still reproduces L6's own drivers — W88's corrected fact 1 (57 of 61, 324 prefixes, 261 / 261 payloads) | `dev-dist/w88/replay-fixed.ts`, on the starting tree |
| 2 | the kill-and-resume harness is free of Q366's shape (a wrapper capturing its own calls), and then its 14 of 14 kill points | `dev-dist/p23/kill-resume.ts`, READ first, then re-run |
| 3 | how many tasks each kill point re-dispatches, and whether any SETTLED task is re-dispatched — P23 prediction 2 | the same run, per kill point |
| 4 | what state lives OUTSIDE the log at a kill — attempts spent ([Q365](../questions/q365.md)), a held resource-group slot, a transform's compiled cache — P23 prediction 3 | a spike on real schedulers |
| 5 | which exhaustive walks over `FoldInput['kind']` and which enumerations of the root's `Error` subclasses a new kind and new classes reach — the seeded rows below | grep, then the rungs |

### What the re-takes found

*On `3fe0558` plus this declaration, node 24.20.0, before any file under `src/` was edited.*

| # | re-take | measured | what it corrects |
|---|---|---|---|
| 1 | `dev-dist/w88/replay-fixed.ts`, re-run unchanged | **62 starts, 61 captured over 30 flows, 57 reproduce exactly, 324 prefixes, 261 / 261 dispatched payloads, 998 events all clone exactly** — W88's corrected fact 1 to the unit; the four that do not are the two `FD-R4` refusals and the two `OR-R6` stops | nothing |
| 2 | `dev-dist/p23/kill-resume.ts` — **read first for [Q366](../questions/q366.md)'s shape** | it wraps NO prototype: each driver is built by hand and the replay emits into listeners it registered itself, so it cannot capture its own calls. Re-run: **14 of 14 kill points complete IDENTICALLY**, re-dispatching 1-4 tasks each, every stored log a prefix of its replay by 1-7 events — fact 4 reproduces | nothing about the numbers; **its re-dispatch set is `held − settled` BY CONSTRUCTION**, so it cannot report a settled task re-dispatched — the sensor answers its own question, which is re-take 3's reason |
| 3 | per kill point, from an INDEPENDENT reading (`dev-dist/w89/kill-resume-count.ts`): which re-dispatched tasks the STORED prefix had seen dispatched | **29 re-dispatched over 14 kill points, 0 of them settled in the stored events — and 14 of the 29 were dispatched ONLY in the regenerated tail**, never stored, at **8 of 14** kill points (fan-out K=1: 2 of 2; triage K=1: 3 of 3) | **P23 prediction 2's wording is FALSE and its substance holds**: the at-least-once set is the in-flight set at the end of the REPLAY, not *at the stored prefix* — a checkpoint taken inside `onFoldInput` ends before the dispatches its last settlement causes. This is also the fixture: *held dispatches after the prefix* and *in flight per the stored events* are two well-formed wrong selections, each right at some kill points |
| 4 | what lives OUTSIDE the log at a kill — a spike on real schedulers, inline pools (`dev-dist/w89/outside-log.ts`), resume by hand as re-take 2 does it | **(a) attempts**: a task declaring `maxRetries: 1` — a budget of TWO attempts — killed after its first attempt failed ran **THREE times** (1 before, 2 after; shutdown ran no retry). **(b) a group slot**: a task holding a `ConcurrentLimitGroup(1)` slot, killed mid-run — the re-dispatch ACQUIRED the fresh runtime's slot with no `resource.blocked`, and the task ran twice in all. **(c) a person**: a run parked at `user_action`, killed and resumed, re-dispatches `[]`, stays `awaiting_action`, and `resolve()` on the resumed driver completes it. **(d) a transform's compiled cache**: triage's `report`, which carries a JSONata transform, was re-dispatched at kill point 5 and completed identically (re-take 2) | **[Q365](../questions/q365.md) is MEASURED** where P23 derived it: a fresh budget, 3 attempts against 2. P23 prediction 3's reversal list: the retry budget is REAL state outside the log; a group slot and a compiled transform are per-process state a fresh runtime rebuilds, so they differ from a run nobody killed in COST, not in result |
| 5 | exhaustive walks over `FoldInput['kind']` outside `Owns`; enumerations of the root's `Error` subclasses | `examples/**` has NO exhaustive walk over the kind — every read is a filter or an `if` chain; the one `Record<FoldInput['kind'], …>` is W88's, in `test/driver/checkpoint.test.ts` (owned). `AGENTS.md` §9's executed snippet enumerates the root's classes (Q101); `src/scheduler/index.ts`'s export list is an ALLOWLIST (owned) | the seeded `examples/l6.ts` row fires for W88's reason (a driver field), not P23's (a kind) — marked below |

**Baseline, re-taken** by a full `npm run gate` on `3fe0558` plus this declaration — **`GATE EXIT=0`,
zero `FAIL` lines, digest `8b840abd4862b30c` over 393 files identical at both ends**: L6 **1833 / 60**
in node 24.20.0 and deno 2.9.6; L1-L5 **49 files / 1339 assertions** in node, deno and chromium;
`check:spec` **7 / 61 / 113**; `check:docs` **35 snippets, 29 run, 6 check**; `check:markdown`
**151 documents, 6873 links, 366 anchored** (150 plus this file). `selftests` took **1114 s wall**
against W39's 365 s — slower than any recorded, unexplained, and not this item's to explain.

## Exceptions — files outside `Owns`

*Seeded at the declaration, as P23 seeds them and W88 did not until its build began; each row is
re-measured at the build and marked.*

| file | why | predicted? |
|---|---|---|
| `examples/l6.ts` | the byte walk's `DRIVER_FIELDS` gains `replay`, WALKED — the one L6 failure the new field cost (`1833 assertions, 1 failed`, naming it) | **yes** — W88's reason, seeded here; **P23's reason did not fire**: `examples/**` has no exhaustive walk over `FoldInput['kind']` (re-take 5) |
| `AGENTS.md` | §9's executed enumeration went red at `X4` on `ResumeRefused`; the runtime's refusal prose (`RunIdInUse` makes four); the throws table; and *"resuming from one is not built yet"*, a W88 sentence with an expiry date, found by the conformity reader | **the FILE yes, and its seeded reason fired**; the stale sentence was not predicted |
| `examples/run-flow.ts` | — | seeded, **not needed**: it walks by exclusion |
| `scripts/build-browser-tests.mjs` | — | seeded conditionally, **not needed**: no new suite reads a `spec/**` document the bundle does not inline |
| `doc/plans/p23-what-a-run-needs-to-outlive-its-process.md` | prediction 2's wording and the seeded table's W89 rows corrected in place; the W89 row marked done | **no** — W88's row one item on |

*`README.md`, `CLAUDE.md`, `doc/README.md`, `doc/open-questions.md` and `doc/decisions/README.md` are record-step files. **Zero undeclared**: `git status` against `Owns` by hand, and by the conformity reader.*

## Verification

**Routing:** this item adds a road INTO routing, not a routing rule. Of the five states the template
names, the fixtures resume across: **`user_action`** (a task parked in the stored run stays parked and is
resolved on the resumed driver), **a fan-out join** (a three-branch region, and a join a policy declares
dead), and **a nested fan-out's** absence is stated — no resume fixture nests a region, because the replay
feeds stored elements through the same routing every nested-region suite already binds. Not covered: a
branch routed away from its join, a missing decision edge, a duplicate id.

**What resume SELECTS, and the wrong selections each fixture makes differ** (rule 8 obligation (a), v0.23):

| selection | the right one | the well-formed wrong ones, each shown to DIFFER in the fixture |
|---|---|---|
| the in-flight set | dispatched, no settlement record, at the END of the replay, in dispatch order | a parked task counted as in flight; tasks dispatched after the last stored settlement; dispatches past the stored prefix only; every dispatch the replay held; the in-flight set AT the stored prefix (misses the tail's dispatch) |
| the diverging position | the first element the replay does not reproduce | 0; the FED settlement's position that led to it; the last stored position; the stored length; a comparison of KINDS only (both roads dispatch a task) |
| the positions a consumer is handed | the driver's, from the stored length | a count from the wrapper's first call — **W88's dated ceilings `c3`, `r6`** |
| the run id in use | held by any driver the runtime built, from construction | only running runs; only started (not `FD-R4`-refused) runs; a counter that does not skip |
| the entry payload the replay enters with | a copy of the header's | the header's own object |

| rung | what it covers here | result |
|---|---|---|
| L0 `lint`, `typecheck:node`, `:browser`, `:deno`, `:tests`, `:examples` — **each run separately, re-run after the last test file was written** | `resume()`, `ResumeRefused`, `resumeRefusal`, `RunIdInUse`, `ResumeOptions`, the `resumed` kind — and W88's `Record<FoldInput['kind'], …>`, which went red by NAME (`TS2741: Property 'resumed' is missing`) on this item's first run | see Record |
| L1-L2 `test/driver/resume.test.ts` | `RN-R19`-`RN-R24` on a fake scheduler | 15 cases |
| L1 `test/scheduler/resume.test.ts` | `RN-R25` and the positions through `createRuntime` | 6 cases |
| L1 `test/scheduler/runtime.test.ts` | every `StartOptions` member but `runId` observed on a RESUMED driver, and that list bound to the members both ways | 10 cases added |
| L1-L5 in node, deno and chromium | the whole suite, the census naming both new suites and COUNTING their cases | see Record |
| `check:spec` | `spec/run-state.md` v0.10 (seven rules), `spec/task-id.md` v0.11 | see Record |
| `check:docs` | `AGENTS.md` §9's enumeration gains `ResumeRefused` | see Record |
| L6 node and deno | **UNMOVED**, as declared | see Record |
| `npm run gate` | everything, digest at both ends | see Record |

## Record

**DONE 2026-09-24.** ADR 0065; `spec/run-state.md` **v0.10** — section 9 and `RN-R19` to `RN-R25`, one
`FoldInput` kind (`resumed`), one cell of run state (`resumes`), and a clause each on `RN-R15` and
`RN-R18`; `spec/task-id.md` **v0.11** (`ID-R3`); `Driver.resume`, `ResumeRefused`, `resumeRefusal`;
`runtime.resume`, `ResumeOptions`, `RunIdInUse`. **L6 UNMOVED at 1833 / 60 in both runtimes**, which is the
declared result.

### Gate — on the tree this item ships

| rung | result |
|---|---|
| `lint`, and `typecheck:node`, `:browser`, `:deno`, `:tests`, `:examples` — **each run separately, re-run after the last test file was written** | EXIT 0, all six. *(The re-run is not decoration: after the readers' fixes `typecheck:tests` was RED on a cast in the newest test — TS2352 — while `npm test` was green, W88's What broke 6 on its first chance to recur, caught this time before a table said otherwise.)* |
| L1-L5, node 24.20.0 / deno 2.9.6 / chromium | **51 files / 1376 assertions** in all three, from 49 / 1339 — two new files, the resume observers and a census case |
| `check:spec` | **7 / 61 / 120**, from 113 — the seven rules |
| `check:docs` | **35 snippets: 29 run, 6 check** — unmoved |
| `check:markdown` | **152 documents, 6955 links, 374 anchored**, from 151 / 6873 / 366 — ADR 0065 and this file |
| L6 node 24.20.0 and deno 2.9.6 | **1833 / 60** in both — UNMOVED |
| `npm run gate` | **`GATE EXIT=0`, zero `FAIL` lines**, `selftests` 8 / 8 in 958.7 s wall ([Q373](../questions/q373.md)), content digest `0e9cccb55b340ef5` over 396 files identical at both ends — taken on the tree with this Record written but for these three cells, which were filled after it |
| Q142, measured BEFORE the record step | probe 1 (`doc/decisions` cut) **115 files against `M3`'s 123 — margin 8**, as the declaration predicted; probe 2 (`doc/decisions` + `doc/plans` cut) **5093 links against `M4`'s 5270 — margin 177**, from 201; **re-measured AFTER the record step: `M3` 8, `M4` 129** — Q142 does not fire |

### Outputs

| | output | what fails without it |
|---|---|---|
| 1 | ADR 0065 | `C5` (the spec's and `AGENTS.md`'s links) and `check:markdown` |
| 2 | `Driver.resume`: the replay, dispatch held | the every-position case (`d2`), the as-stored case (`r01`, `r02`, `r04`, `r05`), the entry-copy case (`a9`), `c4`'s declared ceiling |
| 3 | the prefix check | the divergence cases (`a6`, `a7`, `a8`, `b10`, `b11`), the data-comparison case (`r08`-`r11`), the never-dispatched case (`b15`, `b16`) |
| 4 | the in-flight re-dispatch | the in-flight case (`a1`-`a4`, `b4`, `r30`), the mid-step case (`a5`), the parked case |
| 5 | `resumed` | `b1`, `b2`, `b3`, `r26`, `r27`, `b17`, `r06`, `b22` (the copy), and `d1` at L0 in W88's `Record<FoldInput['kind'], …>` |
| 6 | the refusals | `b13`, `b14`, `b18`-`b21`, `r18`-`r24`, `k1`, `k3`, `a10`-`a13`, `b24`, `b25`, `k2` |
| 7 | `runtime.resume` and the positions | `b23`, `r28`, `r29`, `c1` and `c2` — **W88's dated ceilings, now catches** — `d7`, `e1` |

### What broke, and the rung that caught it

| | what | rung |
|---|---|---|
| 1 | **P23 prediction 2's wording**: the at-least-once set is the in-flight set at the END of the replay — 14 of 29 re-dispatched tasks over 14 kill points were dispatched only in the regenerated tail | none; the declaration step's re-take 3, read independently of the harness whose re-dispatch set was `held − settled` by construction |
| 2 | **`freezeInput` handed a consumer the driver's own `taskIds` array** — `resumed` is the first non-flat kind since that function's fall-through was written | W88's every-kind copy case (`RN-R17`), on its first run — the case doing exactly what it was built for |
| 3 | the ratchets, each moved deliberately: W88's `Record<FoldInput['kind'], …>` (TS2741 by name), `retention.test.ts`'s and `examples/l6.ts`'s `DRIVER_FIELDS` (`replay`), W76's two literal anchors (the literal moved into `openRun`), `AGENTS.md` §9's enumeration (`X4`) | L0, L1, L6 and `check:docs` — every one naming its subject |
| 4 | author pass: **three real holes** — the entry task handed the header's OWN payload (`a9`), `onUnsatisfiableJoin` ungated during a replay (`b9`), a stored resolution for a task not parked (`b16`) — each deletable for ZERO | rule 8's author pass, AGAINST DECLARATION |
| 5 | author pass: a probe that was a SyntaxError (`a12`, a dangling `else`) and a `names` quoting a runtime message where the report prints the source line (`e2`) | the harness's own verdicts — CRASH and WRONG-REASON, **the new reason check firing on its first run** |
| 6 | **the runtime minted, built and spent an id for a header with no `runId`**, then heard the driver refuse it — `RN-R25`'s *refused before any driver exists* false | the conformity reader (BLOCKING 1) |
| 7 | `AGENTS.md` said *resuming from one is not built yet*, and `DriverOptions.onFoldInput`'s doc said positions are *counted from 0* | the conformity reader (BLOCKING 2, 3) — the first sentence did not carry W89's id, so the item's own-id grep could not find it |
| 8 | **a driver refused mid-replay stayed subscribed**: a settlement under its id was appended, delivered and reported, and with `failed` unset it ROUTED | BOTH readers, from opposite ends — the overlap |
| 9 | eight blocking adequacy findings: fed records restamped or aliased (a01-a05), the data comparison bound only at flat shapes (a08-a11), a stored `resumed` tested only against a permutation (a06), the `stopped` index only where the wrong answers coincide (a18, a19 — v0.23's clause, on this item's own refusal), `format` at one value (a20), spent-after-a-replay-refusal untested (a21-a23, e01), `resumes` checked with one resume (a26), `done`'s seed only with `resumed` delivered first (a28, a29) | the adequacy reader, 21 real survivors |
| 10 | a stale Test cell (`RN-R21`'s fixture described backwards), `ID-R3`'s owner cell, section 2's shape without `resumes`, the §9 table's *"Two more"* counting five | the conformity reader |
| 11 | `typecheck:tests` RED on a cast in the newest test while `npm test` was green | L0, re-run after the last test file — this item's own gate line |

### Predictions

- **1 — *resume needs no change to routing* — CONFIRMED as a STRUCTURE.** The listener's post-normalisation
  path became `settle()` and `resolve()`'s append became `appendResolution()`; the replay FEEDS through both,
  and the only new branches in routing are a dispatch HELD during a replay and a callback GATED by position.
  Neither decides a road.
- **2 — *the at-least-once cost is exactly the in-flight set at the stored prefix* — its SUBSTANCE CONFIRMED,
  its WORDING REVERSED**: no settled task was re-dispatched at any of 14 kill points, and the set is the
  replay's at its END, 14 of 29 dispatched only in the lost tail. `RN-R21` says so.
- **3 — the REACH: *nothing but `runtime.resume` and a store* — CONFIRMED with one real exception named.**
  Through the shipped `runtime.resume` on real schedulers a store of the header and every `onFoldInput`
  element by position resumes at all 14 kill points identically. The exception is the one its reversal
  column named first: **a retry budget half spent** — measured, three attempts against a budget of two
  ([Q365](../questions/q365.md)). A group slot and a compiled transform differ from a run nobody killed in
  cost and not in result. W90 measures it again on real workers.
- **4 — already REVERSED at W88 and not re-litigated. What W89 adds, measured**: ONE `FoldInput` kind and
  ONE cell of run state, both allowed by the prediction's first half; and the TEXT of two existing rules
  moves by a clause each — `RN-R15` (a resumed driver's header) and `RN-R18` (positions from the stored
  length) — with `ID-R3` in `spec/task-id.md`. Neither clause changes what the rule said of a run never
  resumed.

### Rule 8

**Author pass: 53 probes — control clean, 44 caught, 3 declared ceilings survived, 5 AGAINST DECLARATION**
(`a9`, `b9`, `b16` real and closed; `a12` a crash and `e2` a wrong reason, both the harness), the five
then re-run and caught. **Pass 2, with both readers' exact edits checked in: 77 probes — control clean,
73 caught, 3 declared ceilings survived, 0 wrong-reason, 0 crashes, 0 aborts, 0 against declaration**,
digest `f3033f23a735e397` identical at both ends. The three ceilings: `b12` (a fed element's position
check, which the pre-feed length check already enforces — two guards for one fact), `c3` (a runtime
counter SEEDED from the checkpoint's length, which agrees with the driver while delivery is contiguous
past it — the reason ADR 0065 rejects it is a second source, not a wrong number), `c4` (the header's
`runId` read from the checkpoint, which `run` makes equal). **W88's dated ceilings `c3` and `r6` —
re-anchored, because `openRun` moved their line — are CATCHES here** (`c1`, `c2`), on a resumed run whose
consumer's first position is 3 and not 0. Harness `dev-dist/w89/rule8.py` — environment pinned by its
install directory, control, anchors exactly once against current bytes, undo on abort, byte-asserted
restore, digest over tracked and untracked-unignored files — and **one requirement W88's What broke 8
asked for: a probe is CAUGHT only when a failure line carries the case title its declaration names**,
which reported `e2` WRONG-REASON on its first run.

### Readers

**Conformity: 12 findings, 3 blocking — and ZERO disagreements on the VALUES**: the reference run's 28
elements, the quiescent checkpoint's 17, the in-flight `[R:b:1:0, R:a2:0:0]` and their re-dispatched
payloads, the mid-step cut's tail and positions, the inverted predicate's refusal at position 4, the
runtime's r1 / r3 and positions 3-5 — derived on paper from the spec before any output was read. What it
found were a refusal the runtime made one step too late, and CLAIMS. **Adequacy: 72 mutations, 39 caught,
21 real survivors confirmed by a second-route probe each, 11 equivalent, 1 ceiling — 10 findings, 8
blocking.** **Overlap 2** — the replay-refused driver still listening, and the unparseable-id clause with
no fixture — **the FIFTY-FIFTH measurement**, inside the 0-4 band, both unprimed; both ran concurrently in
separate copies with the author's tree held still at `945c7338ec2beaa6` until both had reported, and
nothing was acted on before the second report arrived.

### What this taught

- **A selection clause is owed by a REFUSAL's own number too.** v0.23 was applied to the in-flight set,
  the diverging position and the positions a consumer is handed — and not to the `stopped` refusal's
  `index`, whose only fixtures put the stop at the stored length and at the last element, exactly where
  the two wrong answers are the right one. *Every number a refusal reports is a selection.*
- **An inert-by-construction claim is a claim.** *A refused resume leaves the driver spent* was true of
  its doors and false of its SUBSCRIPTION, which nothing in the driver can undo — the fix is that a spent
  driver hears nothing, and the residue is [Q371](../questions/q371.md).
- **The fed half of a replay is trusted, and every observer of it was blind to the trust.** Both clocks
  at 0 and every attempt at 0 made *appended as stored* unfalsifiable; [Q374](../questions/q374.md) is the
  same trust from the store's side.

### Questions raised

[Q371](../questions/q371.md) (a runtime spends an id for every driver it built — a driver cannot be
detached), [Q372](../questions/q372.md) (the prefix check's blind tail), [Q373](../questions/q373.md)
(`selftests` at 1114 s wall), [Q374](../questions/q374.md) (the store trusted for every fed element).
**Q375 unused and not reused. ADR 0065 taken.** **[Q15](../questions/q15.md), [Q364](../questions/q364.md)
and [Q366](../questions/q366.md) RESOLVED**; [Q365](../questions/q365.md) MEASURED and left open. Census
**292 / 227 / 1 / 64**, by W88's parser unchanged.

### What W90 inherits

- **A resume through `runtime.resume` on real workers is IDENTICAL at 14 of 14 kill points already**
  (`dev-dist/w89/kill-resume-real.ts`, untracked): W90's exit artifact is that measurement made a row, in
  both L6 runtimes, with the re-dispatch COUNT asserted — 29 over those 14 points, 1-4 each.
- **The reference has no executed snippet for `resume`**: `AGENTS.md` names it in a table and an
  enumeration only. W90 teaches append-then-resume, and must say three things in words: at-least-once and a
  fresh retry budget ([Q365](../questions/q365.md)); the prefix check's blind tail ([Q372](../questions/q372.md));
  and that a refused resume spends its run id on that runtime ([Q371](../questions/q371.md)).
- **The `resumed` kind and `RunState.resumes` are BREAKING** for a consumer switching on `kind`
  exhaustively; the package moves to `0.5.0` at W90's close (stop-and-ask (a)).
- `examples/l6.ts`'s `DRIVER_FIELDS` carries `replay`; `examples/run-flow.ts` walks by exclusion and did not
  need it.
