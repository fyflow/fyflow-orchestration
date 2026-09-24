# W90 — a run KILLED and RESUMED on real workers

**Status:** done
**Plan:** [P23](../plans/p23-what-a-run-needs-to-outlive-its-process.md) — *what does a run need so
that it can be saved while it runs and resumed after the process that ran it is gone?* — and this is
its EXIT ARTIFACT.

```
Spec:       NONE — this item writes no rule and moves no rule id. `check:spec` stays
            **7 / 61 / 120**. An exit artifact demonstrates what W88 and W89 decided; a rule it
            needed would mean ADR 0064 or ADR 0065 shipped short, and that is a stop-and-ask, not
            an edit (`spec/**` is outside `Owns`).
Owns:       examples/**, AGENTS.md, README.md, examples/README.md, package.json, deno.json
Inputs:     P23 decisions 1, 5, 6, 9 and 10, predictions 2 and 3 (2's wording as W89 corrected it),
            stop-and-ask (a) (BREAKING -> 0.5.0 at this item's close); W89's Record, "What W90
            inherits"; W88's Record; ADR 0064, ADR 0065, spec/run-state.md sections 8-9 (RN-R14 to
            RN-R25); ADR 0058 (the handle); ADR 0039 (the gate); Q365, Q371, Q372, Q373, Q374.
            W89's `dev-dist/w89/kill-resume-real.ts` is RE-RUN at this declaration, in both
            runtimes, never transcribed (P15 decision 5) — the table below.
Outputs:    (1) the EXIT ARTIFACT as L6 block (2g) in BOTH runtimes: two flows killed at EVERY kill
                point on a real FyflowScheduler — the consumer's store frozen at the kill, the
                runtime shut down — and resumed on a FRESH runtime through `runtime.resume` from a
                store built exactly as the reference teaches (the header from the handle, every
                `onFoldInput` element BY POSITION), completing exactly as a run nobody killed:
                outcome AND every node's state and result, read from the run
            (2) the re-dispatch asserted as a COUNT and BY TASK ID, from the `resumed` element, from
                the fresh SCHEDULER, and against a derivation from the killed process's own sequence
            (3) the selections the artifact makes, each with a fixture where the well-formed wrong
                one DIFFERS (Verification): a mid-step cut against a quiescent one, the in-flight
                set at the END of the replay against the stored events', a store keyed by POSITION
                against one keyed by arrival across THREE processes, a PARKED kill against none,
                and *completed identically* judged on every node against the outcome alone
            (4) `AGENTS.md` section 18 — append-then-resume as an EXECUTED `run` snippet on a real
                `createRuntime` — and `README.md`'s sixth paired fence, held byte-equal by `X8`;
                the words the snippet cannot carry (at-least-once and a fresh retry budget, the
                blind tail, the trusted store, a refused resume's spent id, the five reasons, a
                stopped run), and the "W90 teaches it" sentences W88 and W89 left, corrected
            (5) the package at **`0.5.0`**, with `README.md` naming every breaking change since
                `0.4.0` — W88's and W89's
            (6) every copy of the L6 counts moved together, derived where they can be
Depends on: W89
Blocks:     nothing — P23's retro follows
Tests:      `examples/l6.ts` at ladder L6 in node 24.20.0 and deno 2.9.6. **Every expected value is
            derived from the flow document, from `spec/`, or from a run the block itself makes —
            never from the resumed driver it is judging**: the in-flight set from the KILLED
            process's own sequence (the elements up to its next stimulus past the cut); the
            identity from a reference run nobody killed; the K = 1 re-dispatch of each flow from
            the document and the payload — a derivation from the DOCUMENT, not a literal (the
            adequacy reader's finding 9).
Gate:       L0 under all five typecheck lanes and `lint`, EACH RUN SEPARATELY and RE-RUN after the
            last snippet and harness edit; L1-L5 UNMOVED at 51 / 1376 in node, deno and chromium;
            L6 in BOTH runtimes, MOVED by exactly what this declaration says; `check:docs` and its
            self-test; `check:markdown`; `check:spec` unmoved; then the full `npm run gate` with a
            content digest identical at both ends.
Reserves:   Q376-Q378, and NO ADR
```

*Reserves derived by grep off the tree at this declaration: the highest question RAISED on disk is
**Q374** (W89 raised Q371-Q374 and left Q375 unused and not reused), so this item starts at
**Q376**, and P23's block ends at Q378. The highest ADR is **0065** and P23 reserved 0064-0065, both
taken — so this item takes none. W91 stays reserved and expected unused.*

## Scope

**In**

1. **The kill.** A run on a real `FyflowScheduler`, its consumer's store FROZEN at a chosen position
   and its runtime shut down. *What the kill is, is measured below and it is not what P23 assumed*:
   `shutdown()` DRAINS.
2. **The resume.** A FRESH runtime, `runtime.resume(flow, { header, events })` from that store, and
   the resumed run compared with a run nobody killed on outcome AND every node.
3. **The re-dispatch as a COUNT and by task id**, read three ways — the `resumed` element, the fresh
   scheduler, and a derivation from the killed process — at every kill point of two flows.
4. **The selections**, each arranged so the wrong one differs (Verification).
5. **The reference**: `AGENTS.md` section 18 and its `README.md` fence; section 8's and section 9's
   sentences that name this item.
6. **`0.5.0`** and every copy of the L6 counts.

**Out** — named rather than left implicit, with where it goes instead

- **`src/**`, `spec/**`, `test/**`** — a defect found there is a stop-and-ask; L1-L5 must be UNMOVED.
- **Storage and serializers, redaction, any memory option** — P23 decisions 1 and 8.
- **Exactly-once, a retry budget carried across a resume ([Q365](../open-questions.md)), a scheduler
  that persists its own queue** — P23 decision 6 and Out.
- **A killed PROCESS.** The artifact kills a RUNTIME inside one process; what a real crash loses that
  this does not — module-level state an inline worker keeps — is recorded, not simulated.
- **P23's retro** — a separate step after this item.

## What the declaration step re-took before anything was edited

*On `3635789` (W89), node 24.20.0 and deno 2.9.6, in `dev-dist/w90/`, before any tracked file was
edited.*

| # | re-take | measured | what it corrects |
|---|---|---|---|
| 1 | `dev-dist/w89/kill-resume-real.ts`, unchanged, in node AND deno | **14 of 14 kill points IDENTICAL, 29 re-dispatched, 0 refused, positions contiguous from the stored length at all 14 — byte-identical output in both runtimes** | nothing; W89's measurement reproduces, and in deno for the first time |
| 2 | what `runtime.shutdown()` does to work in flight and to a pending retry (`dev-dist/w90/shutdown.ts`) | **IT DRAINS, in both runtimes.** Called one stimulus into `fan-out-per-item` with 2 tasks running and the store at 7 elements, it resolved 308 ms later with the driver at **41 — the WHOLE run, completed** — and 9 settlements heard after the call; at K = 2, 5 and 8 the same, every time ending at 41. The scheduler's own source: `shutdown()` waits up to 5 s while `stats.running > 0`, and a settlement routed during that wait dispatches the next task into pools not yet torn down. **A PENDING RETRY does not run**: a `RetryWorker` task (`maxRetries: 1`, `backoffMs: 300`) whose first attempt had thrown heard NOTHING after the call — W89's (a) reproduced in deno | **P23's exit artifact says "killed mid-run with its scheduler thrown away" and a shutdown is not a kill.** So the kill IS the consumer's store freezing — what a process wrote before it died — and the shutdown is cleanup whose drain the store never sees. Two consequences, both measured in re-take 5: the killed runtime RAN every re-dispatched task (at-least-once made visible, 29 of 29), and it ran every task the resume dispatches fresh as well — which a real crash would not |
| 3 | which L6 rows, counts and cross-row subjects a new block moves | the block sits OUTSIDE the row loop, as W78's and W86's do: **no `EXPECTED` row moves**, no per-row count moves; `CROSS_ROW` and `DECLARED_TOTAL` move by the block's assertions, `CROSS_ROW_SUBJECTS` gains one entry per claim AND per control (v0.18), and `pairRunCount` gains the block's runs as a LENGTH (W78's `runs`). **Predicted: +20 assertions and +40 real runs — 1853 / 100** | P23's row says L6 MOVES and "this row says by how much": this is how much, to be re-taken at the build |
| 4 | every file outside `Owns` that binds the version string or the L6 counts | **version**: `scripts/check-docs-selftest.mjs:218`, whose `X9` probe anchors on the README's literal `` `0.4.0` `` (it will ABORT under rule 7 (b)); `scripts/check-docs.mjs`'s `X9` reads the manifests by regex and binds no literal. **`package-lock.json` reads `0.1.0` and has through FOUR version moves** — nothing reads it, and it is left as every earlier bump left it. **L6 counts**: `CLAUDE.md` and `doc/README.md` (record-step files); `README.md` and `examples/README.md` (owned); `AGENTS.md` carries none | the seeded table gains a VERSION row it did not have; `check:scheduler` binds only the scheduler's pin |
| 5 | a prototype of the block, both runtimes (`dev-dist/w90/block-spike.ts`) — the selections the real scheduler lets differ | **sweep**: 14 of 14 identical; the `resumed` ids equal a derivation from the killed process at all 14; **14 of the 29 dispatched only in the lost tail** (W89's figure); every stored log's lost tail regenerated EXACTLY as the killed process appended it; **29 of 29 re-dispatched tasks settled in the killed runtime too** (the drain). **Chain**: the header arrived after **1** element; three processes, one store by position, `RunState.resumes` two entries, the fold of the store equal to `done`, no holes; **the same store keyed by ARRIVAL is refused `diverged` at 0**. **Cuts**: one killed run cut mid-step (8 elements) and quiescent (13) re-dispatch the SAME three ids, `resumed` at 13 both times; the stored events' in-flight set is right at 13 and wrong at 8. **Parked**: `resumed []`, `awaiting_action`, and `resolve()` on the resumed driver completing identically to a person resolving in-process. **Output byte-identical in node and deno**; 9.6 s | re-take 2's second consequence: *the fresh scheduler ran exactly the re-dispatched ids* is FALSE as an equality over a whole run, because the killed runtime dispatched everything — the scheduler-side count is read at the instant `resume` RETURNS, before any settlement can dispatch anything new |

**Baseline, re-taken** by a full `npm run gate` on `3635789` plus this declaration — see Record.

## Exceptions — files outside `Owns`

*Seeded at the declaration from P23's W90 rows plus re-take 4, each marked at the build. **Zero undeclared** — the diff's
files against `Owns`, by hand and by the conformity reader.*

| file | why | predicted? |
|---|---|---|
| `scripts/check-docs.mjs` | `RUN_FLOOR` 29 -> 30 (section 18's `run` snippet), `README_SNIPPET_FLOOR` 5 -> 6 and a sixth `README_SNIPPETS` pair | **yes** — P23's seed; **fired as seeded** |
| `scripts/check-docs-selftest.mjs` | the `X9` probe's anchor, `` `0.4.0` `` -> `` `0.5.0` `` (rule 7 (b) aborts it otherwise); the unclosed-fence probe's comment names the section whose fence is last | **yes** — P23's seed, and re-take 4 for the version; **fired as seeded**, and the *assertions deleted* probe went red at 33 / 34 on the item's own snippet first (What broke 3) |
| `test/definition/wiring.test.ts`, `spec/outcome-record.md` section 4 | — | seeded conditionally; **did not fire**: no flow document added — three existing ones resumed |
| `scripts/check-workers-selftest.mjs` | — | seeded conditionally; **did not fire**: no worker added |
| `doc/plans/p23-what-a-run-needs-to-outlive-its-process.md` | the W90 row marked done, P23 COMPLETE pending its retro, the seeded W90 rows marked, and predictions 2 and 3 given verdicts | **yes** — W88's and W89's precedent; **fired** |
| `doc/decisions/0064-*`, `doc/decisions/0065-*` | each names *W90's close* as the version move — READ at the record step and TRUE | re-take 4; **not needed** |

*`CLAUDE.md`, `doc/README.md` and `doc/open-questions.md` are record-step files.*

## Verification

**Routing:** this item adds no routing. Of the states the template names, the artifact resumes
across **`user_action`** (a task parked at the kill stays parked and is resolved on the resumed
driver), **a fan-out join**, **a nested fan-out** (`fan-out-per-item`'s map inside a map, at dotted
paths), and **a decision** (`isLowScore`, `isLowConfidence`). Not covered: a branch routed away from
its join, a missing decision edge, a duplicate id — each is the replay's routing, bound at L1-L2 by
W89.

**What the artifact SELECTS, and the fixture where each wrong selection DIFFERS** (rule 8 obligation
(a), v0.23 — and W89's lesson that every number a report carries is a selection):

| selection | the right one | the well-formed wrong ones, each shown to DIFFER |
|---|---|---|
| the cut | the store as the consumer wrote it: MID-STEP (frozen inside `onFoldInput` at a settlement) at every kill point of the sweep, and QUIESCENT (frozen a microtask later) once | the other cut: a quiescent store holds the tail, a mid-step one does not — both resumed from ONE killed run, same ids, different stored lengths |
| the re-dispatched set | dispatched and unsettled at the END of the replay — derived from the killed process up to its next stimulus | the STORED events' in-flight set (differs at 8 of 14 points and at the mid-step cut); every held dispatch; the killed driver's in-flight set after `shutdown()`, which is `[]` because it drained |
| the re-dispatch COUNT | read three ways: the `resumed` element, the fresh scheduler at the instant `resume` returns, the killed-process derivation | the fresh scheduler over the whole run (the killed runtime dispatched everything, so every task it runs is one the killed one ran) |
| the positions a store is keyed by | the DRIVER's, from the stored length on, across three processes | an arrival counter per process: the same elements, a different store — refused `diverged` at 0 |
| a parked task | not in flight: `resumed []`, `awaiting_action`, resolvable | counted as in flight — `[needsAPerson]` |
| *completed identically* | outcome AND every node's state and result | the outcome alone — a second payload's reference also `completed`, with different nodes |
| the K = 1 re-dispatch | the document's: two shards for two words, three branches of triage's fan-out | a derivation re-sourced to the value it judges — the literal is the arm that refuses it |

| rung | what it covers here | result |
|---|---|---|
| L0 `lint`, `typecheck:node`, `:browser`, `:deno`, `:tests`, `:examples` — each separately, re-run after the last edit | `examples/l6.ts`'s block (2g) (`:examples`, `lint`); section 18's snippet (`check:docs` `X3`) | see Record |
| L1-L5 node / deno / chromium | UNMOVED | see Record |
| L6 node and deno | block (2g) | see Record |
| `check:docs` and its self-test | section 18, the sixth pair, `X9` at `0.5.0` | see Record |
| `check:markdown`, `check:spec` | this file; spec unmoved | see Record |
| `npm run gate` | everything, digest at both ends | see Record |

## Record

**DONE 2026-09-24. P23's EXIT ARTIFACT.** `examples/l6.ts` block (2g): two flows KILLED at every kill point on a
real `FyflowScheduler` — the consumer's positional store frozen, the runtime shut down — and RESUMED on a fresh
runtime through `runtime.resume`, in BOTH L6 runtimes; `AGENTS.md` section 18 and `README.md`'s sixth paired fence;
the package at **`0.5.0`**. No ADR, no rule; `src/`, `spec/` and `test/` untouched. **L6 1853 / 100 in node 24.20.0
and deno 2.9.6, from 1833 / 60 — exactly the +20 assertions and +40 runs the declaration predicted.**

### Gate — on the tree this item ships

| rung | result |
|---|---|
| `lint`, `typecheck:node`, `:browser`, `:deno`, `:tests`, `:examples` — each run separately, RE-RUN after the last snippet and harness edit | EXIT 0, all six — re-run on the final tree after the last harness and snippet edit |
| L1-L5, node 24.20.0 / deno 2.9.6 / chromium | **51 files / 1376 assertions** in all three — UNMOVED |
| L6 node 24.20.0 and deno 2.9.6 | **1853 assertions over 100 real runs** in both, from 1833 / 60 — the kill-point table byte-identical in the two runtimes |
| `check:docs` | **36 snippets: 30 run, 6 check**, from 35 / 29 / 6; `X8` pairs **6**; `X9` at `0.5.0` |
| `check:docs:selftest` | **34 / 34 probes caught** — after one red run the item caused and fixed (What broke 3) |
| `check:spec` | **7 / 61 / 120** — unmoved |
| `check:markdown` | **153 documents, 6980 links, 374 anchored** before the record step, from 152 / 6955 / 374 — see the gate row for the tree that ships |
| `npm run gate` | **`GATE EXIT=0`, zero `FAIL` lines**, 1354 s; `selftests` 8 / 8 in 1240.6 s wall ([Q373](../open-questions.md)); spec 7 / 61 / 120, markdown **153 / 7011 / 378**, docs 36 / 30 / 6, L1-L5 51 / 1376 in node, deno and chromium, L6 1853 / 100 in node and deno; content digest `3d1249b7317910ed` over 397 files identical at both ends — taken on the tree with this Record written but for this cell. Baseline, on `3635789` plus the declaration: `GATE EXIT=0`, 1448 s, `selftests` 1346.5 s, digest `f2677fd204e846a4` identical at both ends |
| Q142, measured BEFORE the record step | probe 1 (`doc/decisions` cut) **116 files against `M3`'s 123 — margin 7**, as P23's declaration predicted; probe 2 (`doc/decisions` + `doc/plans` cut) **5166 links against `M4`'s 5270 — margin 104**, from 129; **re-measured AFTER the record step: `M3` 7, `M4` 78** *(**77 on the tree this item ships** — P23's
retro, pass 3 rule 6, by W88's `q142.py` unchanged: the gate cell above was filled after this
measurement and carries one more link)* — Q142 does not fire, and the next item that adds a document outside `doc/decisions` takes `M3` to 6 |

### Outputs

| | output | what fails without it |
|---|---|---|
| 1 | block (2g): every kill point of two flows, killed and resumed, identical on outcome and every node | claim (1) — `a8`, `d1`, `r6`; the whole block — `b1`, `b2` |
| 2 | the re-dispatch as a count and by id, three ways | claims (2) and (3) — `a1`-`a3`, `a5`, `c2`, `r1`-`r5`; control K = 1 — `c1` |
| 3 | the selections, each where the wrong one differs | the cut — claim (13)-(14), `r7`; the store's keys — `a6`; the header — `a7`; the parked task — `a4`; completed identically — `a8b`, `r5` |
| 4 | `AGENTS.md` section 18 and `README.md`'s sixth fence | `X8` — `b6`, `b7`; `X4` — `e3`, `e4`; the snippet's own guards are ceilings `b8`-`b10` with L6 as second observer |
| 5 | `0.5.0`, and six breaking changes named | `X9` — `b3`-`b5`; the three sites together are a CEILING, `r9` ([Q377](../open-questions.md)) |
| 6 | the L6 counts moved together | `DECLARED_TOTAL`, `CROSS_ROW`, `CROSS_ROW_SUBJECTS`, and control 4's `runs 40` — `d4` (ceiling, Q217), `d5`, `r8` |

### What broke, and the rung that caught it

| | what | rung |
|---|---|---|
| 1 | **P23's exit artifact assumed a shutdown kills a run, and `shutdown()` DRAINS** — in both runtimes a run one settlement in completed inside it; a pending retry never ran | none; the declaration step's re-take 2, measured before it was relied on ([Q376](../open-questions.md)) |
| 2 | `typecheck:examples` red twice on the block's own types — an untyped listener parameter, and a `LogRecord` union read without narrowing; and a `let` initialised to `null` narrowed to `null` at every later read | L0 `typecheck:examples`, each run separately |
| 3 | **`check:docs:selftest` RED at 33 / 34**: its *assertions deleted* probe deleted section 18's two narrowing `throw` guards, and the snippet stopped TYPECHECKING — `[X3,X4,X5,X8]` against a declared `[X4,X8]`. The guards were rewritten so the snippet is type-correct with every assertion gone | the self-test, rule 7 (c) discriminating exactly as designed |
| 4 | the three-process chain expected process two's `resumed` TWICE — process three's sequence holds the fed one as well as its own | L6, the block's first run |
| 5 | **rule 8's author pass graded a CRASH as a CATCH three times** (`a5`, `c1`, `c5`): the harness matched a probe's name in the four lines after a FAIL, which reached into `CROSS_ROW_SUBJECTS`' printed list, where every name appears — while the block had THROWN (*process two never froze*). Both fixed: the name is matched on the FAIL line and the one after it, and a kill that never froze is a named finding | reading the failure lines rather than the verdict; the fixed grading then reported `c5` WRONG-REASON — a malformed probe of the author's own, `void stored` with `stored` undefined |
| 6 | **the scheduler-side claim compared SORTED sets**, so RN-R21's dispatch ORDER had one observer and a re-dispatch with ANOTHER task's payload had one too; a reversal above three ids with the expected set re-sourced was L6 GREEN in both runtimes | the adequacy reader (BLOCKING 1, 2) |
| 7 | **claim (1) was a BOOLEAN** over the node projection, one token from gone, and control 1 read the projection on another pair of runs | the adequacy reader (BLOCKING 2) |
| 8 | **a resume refused mid-replay CRASHED the whole block** — every clause lost to one refusal, the defect family ADR 0065 decides | the adequacy reader (BLOCKING 3) |
| 9 | the first source for claim (3)'s expected side, the killed scheduler's `task.running` events, **is not heard for every task the drain runs** — `grade:1.2` and `audit` settled in the killed driver with no `task.running` delivered | L6, on the first run after the readers' fix |
| 10 | README's **BREAKING IN FOUR WAYS** listed `header` on the handle and `runtime.resume` as additive — both REQUIRED members of interfaces a consumer may construct, which the `0.4.0` paragraph twelve lines below calls breaking | the conformity reader (BLOCKING 1) |
| 11 | **three sibling "whole rung / SIXTY runs / every run" claims** in `l6.ts` made false by W90's forty runs, beside the one W90 narrowed | the conformity reader (BLOCKING 2) |
| 12 | `examples/README.md`'s section list and pair count stale since W82 and W86; README's `test:l6` cell at **58 / 1724** through all of W86-W89; README's `doc/plans` entry at *P22 is DECLARED* through five commits; `l6.ts`'s plan list missing **P22**, the monument class a third time; `AGENTS.md` section 9's `NotStarted` row without `RN-R23`'s exception | reading, by this item — none has a rung |

### Predictions

- **P23 prediction 2 — CONFIRMED on real workers in both runtimes, in the wording W89 gave it.** No task SETTLED in the
  stored events was re-dispatched at any of 14 kill points, and the set is the in-flight set at the END of the replay:
  14 of 29 re-dispatched tasks were dispatched only in the lost tail, and the stored events' in-flight set is a WRONG
  selection at 8 of 14 points and at the mid-step cut, right at the quiescent one.
- **P23 prediction 3, the REACH — CONFIRMED for the store, with its exceptions named.** A consumer holding nothing
  but the handle's header and every `onFoldInput` element at its position resumes on a fresh runtime, THREE processes
  deep, through nothing but `runtime.resume` — section 18 executes it and block (2g) asserts it. The exceptions are the
  reversal column's first entry, a retry budget half spent ([Q365](../open-questions.md), W89's measurement, stated in
  section 18); and one the column did not name: **the consumer's own `shutdown()` is not a kill** — it runs the work in
  flight AND what that work dispatches, so a process that shuts down cleanly has run more than its store says, and
  every re-dispatched task here demonstrably ran twice ([Q376](../open-questions.md)).

### Rule 8

**Author pass: 35 probes — 2 controls clean, 26 caught, 7 declared ceilings each RUN and surviving as declared, 0
against declaration, digest identical — and the grading was WRONG three times.** The harness matched a probe's name in
the four lines after a FAIL, which reached into `CROSS_ROW_SUBJECTS`' printed list where every name appears, so `a5`,
`c1` and `c5` were graded CAUGHT while the block had THROWN (What broke 5). Re-graded on the FAIL line and the one after
it: `c5` came back **WRONG-REASON** — a malformed probe of the author's own, `void stored` with `stored` undefined, a
ReferenceError in the runtime rather than a skipped seed — and was corrected. **Pass 2, with both readers' exact edits
checked in (`r1`-`r11`): 46 probes, 34 caught, 9 ceilings, 1 AGAINST** — `r6`, the adequacy reader's refused-resume
probe, still a CRASH: the fix for its finding guarded `resumedRun` and left the chain's process two and the parked resume,
which call `runtime.resume` directly. *The fix for a reader's finding was half a fix, found by the re-run v0.8 exists
for.* **Pass 3, final, on the tree this item ships: 46 probes — 2 clean, 35 caught, 9 declared ceilings, 0 wrong-reason,
0 crashes, 0 aborts, 0 against declaration**, digest `f9922c00beddcee0` identical at both ends — after one abort, `a6`,
whose anchor the pass-2 guard re-indented: rule 7 (b) firing rather than passing, re-anchored and caught. `r6` now fires
**13** named clauses where it crashed the block. **The nine ceilings**, each with the tree or the second observer named:
`b8`-`b10`, section 18's guards made tautologies, second observer L6 claims (2), (7), (10), (11) ([Q310](../open-questions.md));
`c3` = `r10`, the lost tail compared with itself, claims (2) and (4); `c4`, the drain's half of claim (8) re-sourced to the
resumed run, its other half standing; `d4`, a claim, its subject and both counts deleted together ([Q217](../open-questions.md));
`e1`, the PRINTED run count ([Q100](../open-questions.md)) — control 4 now asserts the block's forty runs, which the
readers found asserted by nothing; `r9`, the three version sites moved together ([Q377](../open-questions.md)). Harness
`dev-dist/w90/rule8.py`: environment pinned by install directory and asserted for node and deno, control, anchors exactly
once against current bytes, undo on abort, byte-asserted restore, digest over tracked and untracked-unignored files, and
**a timeout on every rung** ([Q323](../open-questions.md)) — new here.

### Readers

**Conformity: 7 findings, 2 blocking — and ZERO disagreements on the VALUES.** It derived on paper, before reading any
output, the kill points (9 and 5), the re-dispatched ids at seven kill points including both K = 1 sets, 29 in all with 14
tail-only and the stored set wrong at 8 of 14, the chain's `RunState.resumes`, the parked run's `resumed []` and
`awaiting_action`, the two cuts at 8 and 13 with `resumed` at 13 both times, section 18's 8 stored events and three
re-dispatched ids, 1853 / 100 and its decomposition, and the four named breaking changes — and every one matched, in
both runtimes. It measured the drain itself and agreed. What it found were CLAIMS: two breaking changes README listed as
additive (What broke 10), three "whole rung" siblings of the claim this item narrowed (11), shutdown's five-second
limit unstated in section 18, `examples/README.md`'s list scoped ambiguously, README calling P23 complete before its
record step, and the exceptions table unmarked. **Adequacy: 60 mutations — 28 caught, 29 real survivors each confirmed
reachable by a second route, 1 crash, 2 equivalent — 11 findings, 3 blocking** (What broke 6, 7, 8), and a survivor list
that is mostly the author's own declared ceilings reached independently. **Overlap 1** — the rung's run count, which the
conformity reader found claimed in prose (*SIXTY runs*, *the whole rung*) and the adequacy reader found printed and
asserted by nothing — **the FIFTY-SIXTH measurement**, inside the 0-4 band, both unprimed. Both ran concurrently, each in
an isolated copy verified green and scanned for links and reparse points (zero each), with the author's tree held still
at digest `3220c50ecca34639` until both had reported; nothing was acted on before the second report arrived.

### What this taught

- **The artifact's KILL was a claim and it was false.** The plan wrote *killed with its scheduler thrown away* and
  a shutdown is a drain; W89's harness had frozen the store all along, so its measurement was sound and its word was
  not. *Measure the instrument that performs the event before the event is a claim* — the prompt said so and it paid.
- **A block outside the row loop must REPORT a refusal, not throw on it** — W78's and W86's lesson a third time, and
  this block shipped it for one of its four resumes and not the other three.
- **A grader that searches four lines after a FAIL reads the membership list's own failure**, where every name is
  printed: a crash graded as a catch three times, in the harness whose header promised the opposite.
- **Two independent observers of one fact must not share a source**: claim (3)'s first source was the killed
  scheduler's events, which a drain does not deliver in full; its second is the scheduler's own task map.

### Questions raised

[Q376](../open-questions.md) (`shutdown()` drains, so a clean shutdown is not a kill), [Q377](../open-questions.md)
(the manifest version is anchored by nothing absolute), [Q378](../open-questions.md) (the artifact kills a RUNTIME,
not a process). No question resolved. Census **295 / 230 / 1 / 64**, by W88's parser unchanged, every id in exactly one cluster cell.

### What P23's retro inherits

- Predictions 2 and 3 have verdicts; prediction 1 was confirmed as a structure at W89 and prediction 4 reversed at W88.
- **The kill is a store, not a shutdown** — Q376 — and the reference now says so.
- **Rule 8's grader matched names too widely** until this item's author pass; the fix is in `dev-dist/w90/rule8.py`,
  untracked, like every harness before it.
- **The readers' overlap was 1 of 17 findings — the FIFTY-SIXTH measurement**, and W89's fifty-fifth is not yet in
  `doc/workflow.md` section 6's list: that list is appended by retros.
