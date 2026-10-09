# W151 — A runtime releases a run when its `done` settles: the driver and its routing entries go, the run id stays (Q513, ADR 0091)

**Status:** done 2026-10-09 — see the Record. Declared on `bb612da` (committed `282427a`), before any file under `Owns` was edited.
**Plan:** none — an item outside any plan, on W98's, W139's and W150's precedent. Its source is the
maintainer's decision of 2026-10-09 on Q513 (*release on done*), taken after the main session measured
one long-lived runtime keeping every finished run.

*This file carries NO relative link, as W140-W150's files do: ids and paths are bare text, so a link
here moves no probe tree.*

**Question:** *when a run's `done` settles, can the runtime drop that run's driver and its routing
entries and keep only its run id — so a runtime's memory is bounded by its LIVE runs — with
`RunIdInUse` still refusing a reused id and nothing a caller holds losing anything?*

```
Spec:       spec/run-state.md RN-R25 — its REFUSAL is unchanged (a run id held by any driver the
            runtime built, from the moment it exists, is refused, and the minted counter skips it);
            its stated REASON is not: "a FINISHED run's driver still hears every settlement under
            its id — measured, its sequence grows after it completed" and the test column's "the
            finished run's sequence growing" become false by the decision. That text moves, with a
            version bump (v0.13 -> v0.14) and its rationale, as its own commit. A change to what
            RN-R25 REFUSES, or to ID-R4, ID-R5, OR-R10 or RN-R23, is a stop. ADR 0088 rule 5 is
            what this amends; ADR 0023, 0027, 0058 and 0065 rule 9 must keep meaning what they mean
Owns:       src/scheduler/runtime.ts (the router's release, openRun's settle, the inUse comment
            and RunIdInUse's message);
            test/scheduler/*.test.ts (a W151 suite in runtime.test.ts; the two cases that pin the
            withdrawn behaviour — runtime.test.ts's "rule 5, RN-R25: a FINISHED run`s driver
            still hears its own run id" and resume.test.ts's "RN-R25 — why a finished run`s id
            stays in use" — rewritten to the new rule, never deleted);
            examples/retention.ts (a `release` mode: N sequential runs on one runtime, heap after
            GC, a predicate that FAILS on growth per finished run above a stated bound — the
            second observer, independent of the L1 delivery instrument);
            doc/decisions/0091-*.md; doc/decisions/0088-*.md (a dated amendment note on rule 5
            and on the rejected alternative it now takes);
            AGENTS.md, only where it says what a runtime retains or how long a run lives
            (section 12's topology paragraph, section 18's "a refused resume may SPEND its run
            id" bullet);
            spec/run-state.md (RN-R25's text and the status line) and spec/README.md's version
            column for it;
            this file
Inputs:     the tree at bb612da; Q513, Q19; ADR 0046, 0058, 0065, 0088, 0090; RN-R23, RN-R25,
            ID-R4, ID-R5; createRuntime's openRun, inUse, mint and settlementRouter (byRun,
            every); the main session's script dev-dist/w133-59497/q513-measure.ts and its figures
            (+17.5 / +81.3 / +160.9 / +319.8 MiB at 100 / 500 / 1000 / 2000 runs)
Outputs:    (1) the BEFORE figure, re-taken on this tree by the same script and command, and
                which structures in runtime.ts hold a finished run, and why
            (2) ADR 0091 — the rule (release on done, keep the id), its consequences for RN-R25,
                ADR 0088 rules 4-5, ADR 0023, ADR 0027 / ID-R5, ADR 0058, ADR 0065 rule 9, a
                parked run, a stopped run's in-flight tasks and a refused resume; the rejected
                alternatives "keep for the runtime's life, documented" and "keep with a lookup
                and a clear-up action"; `resolves: Q513`
            (3) the release in createRuntime: on `done` settling, the run's driver leaves byRun
                and every; inUse keeps the id
            (4) L1-L2 tests, expected values from ADR 0091: a finished run's driver is handed
                nothing more (its own id, an unminted id); a parked (`awaiting_action`) run and a
                running one are NOT released and `resolve()` on a parked run still completes it;
                a released id's settlement reaches no driver and no onUnmintedTask, and live runs
                beside it are untouched; RunIdInUse refuses a released run's id at start and at
                resume, and the minted counter skips it; a caller holding the handle reads
                foldInputs, snapshot, checkpoint and done after release, equal to before
            (5) the AFTER figure by the same script, and retention.ts `release` mode, showing
                the heap flat in finished runs with the per-id residue sized
            (6) RN-R25's text at v0.14, spec/README.md's column; AGENTS.md's two passages;
                check:spec and check:docs EXIT 0
            (7) Q513 resolved by ADR 0091, its `resolved-by` and the ADR's `resolves` filled
                together (check:register R8)
Depends on: nothing
Blocks:     nothing
Tests:      (4). Every expected value is a row of ADR 0091 or of a rule it names (ADR 0088 rule
            4, RN-R25, RN-R23, ID-R5), never this module's output
Gate:       L0-L6 (L0-L5 in node, deno and chromium; L6 in node and deno); the heap before and
            after; rule 8 on every output in dev-dist/w151-27362/ with a no-op control, a CRASH
            grader and a WRONG-REASON grader; the conformity and adequacy readers, fresh
            contexts, differed briefs, a still tree; `npm run gate:item` EXIT 0 ONCE, on a still
            tree. Not gate:full: no file this item owns is scripts/check-register*.mjs,
            scripts/state.mjs or doc/questions/README.md, and it is no plan's last item
Reserves:   Q577-Q579, ADR 0091. No W beyond W151
```

**Exceptions** — declared 2026-10-09, before the first edit (workflow section 7 rule 2). Anything
else outside `Owns` and the record step is asked first under section 1 rule 6, and its YES written
here before the edit.

| file | the edit | why |
|---|---|---|
| test/definition/l4-corpus.test.ts | one suite name appended to `LATE_SUITES` | output (4) is a new suite in test/scheduler/runtime.test.ts, and the L1 census holds suite names both ways |
| src/driver/driver.ts, and a case in test/driver/*.test.ts | **YES, the maintainer, 2026-10-09, written here before the edit (workflow section 1 rule 6):** the guard in `onEvent` that makes a refused resume's driver deaf, widened to the refusal whose replay regenerated a stop in the lost tail, plus a test that such a hand-built Driver hears nothing afterwards. **Its drag, found by the control:** test/driver/retention.test.ts's `DRIVER_FIELDS` gains `deaf` (RN-R13's field ratchet), and test/definition/l4-corpus.test.ts's W89 census moves 19 to 20; and examples/l6.ts's own `DRIVER_FIELDS` (the cross-row byte-walk clause, the same ratchet at L6, as W89 and W93 each declared) gains `deaf` — found by the gate after the answers, which exited 1 on that clause alone. No L6 count moves | the conformity reader's finding 6: `onEvent`'s guard is `started && header === null`, and that refusal keeps its header (the stopped run's checkpoint is one a store may take), so the driver appended and reported later events — against RN-R23's *a refused resume ... hears nothing from its scheduler* |
| examples/l6.ts, examples/README.md | `DECLARED_TOTAL` / `DECLARED_RUNS` and the two X10 copies — **ONLY if** an L6 row has to move | none is planned: no L6 row reads a finished run through the runtime as far as the declaration step found. A row that DOES is a stop (the brief's third), not an exception |

**The record step** (section 1 rule 5): `doc/questions/q513.md` (resolved), `doc/decisions/**` — ADR
0091's `resolves`, ADR 0088's dated note, and a dated note on ADR 0065 (its fact 5 and its rejected
alternative "freeing a run id when its run finishes" rest on the measurement this item withdraws) —
and `README.md` if it carries a copy of anything moved.

## Scope

**In**

1. Measure first (output 1), into dev-dist/w151-27362/, before any edit to src/.
2. ADR 0091 (output 2), committed as `adr:` before the implementation.
3. The spec text (output 6, RN-R25) as its own `spec:` commit, with its rationale.
4. Implement (output 3) and test (output 4); rewrite the two cases that pin the withdrawn behaviour.
5. Measure after (output 5).
6. AGENTS.md (output 6).
7. Rule 8 on every output, with probes that keep the driver after done (the leak returns), that
   release a parked or running run, that release only one of the two structures (byRun, every), that
   drop the id too (RunIdInUse lost), that release before the quiescent point, and that release on
   the first terminal-looking input rather than on `done`.
8. Both readers; act; re-run rule 8 with their exact edits; the confirming gate; the Record; the
   record step and the grep for W151, Q513 and every withdrawn sentence.

**Out**

- A hand-built `Driver` on `runtime.scheduler`: it subscribes to the scheduler itself and nothing
  can detach it (ADR 0088 rule 7). It is the caller's, and this item does not reach it.
- The scheduler's own retention (`scheduler.tasks`, `maxCompletedTasks`): the scheduler's, ADR 0046
  rule 6's subject. Measured and reported if it is what remains, not changed.
- A lookup of past runs on `Runtime`, or a clear-up action: rejected by the decision, and either is
  a public-surface change.
- The collector's history in fyflow-react-components (their Q14): theirs; nothing is written there.

## Verification

- **L0-L5**: `npm run gate` covers them in all three runtimes; L6: `npm run test:l6`,
  `npm run test:l6:deno`. Every rung is RUN and never piped: `cmd > log 2>&1; echo "EXIT=$?"`.
- **Heap**: `node --expose-gc dev-dist/w151-27362/q513-measure.ts 2000 4` (the main session's script,
  copied unchanged) before and after, and `node --expose-gc examples/retention.ts release N` after.
- **Rule 8**: dev-dist/w151-27362/rule8.mjs; anchors checked against the CURRENT text and unique, every
  edit asserted to change its input, restore to the first snapshot byte for byte, a digest before and
  after, node 24 asserted, a no-op control, a CRASH grader and a WRONG-REASON grader, every `must`
  copied from a failure line seen.
- **Readers**: conformity (ADR 0091, 0088 and the spec first, then the code; reports, does not fix)
  and adequacy (the spec first, then the tests; mutates only in an isolated `cp -r` copy,
  `find <copy> -type l` before any removal, the copy left in place), fresh contexts, differed briefs,
  the tree still.
- **Confirming gate**: `npm run gate:item > dev-dist/w151-27362/item.log 2>&1; echo "EXIT=$?"`, once,
  on the final tree.
- **Routing cases** (template): the driver's routing is untouched; only how long the RUNTIME keeps a
  driver moves. `user_action` (Q17) is IN: a parked run is `awaiting_action`, not terminal, and is not
  released. A duplicate task id (Q13) is IN as RunIdInUse on a released id. Routed-away (Q4),
  no-matching-edge (Q10) and nested fan-out (Q6) are not applicable.

## Record

*Filled in 2026-10-09 on `1159ccb`, the tree the confirming gate ran on, held still from rule 8's last pass to the gate.*
Scratch is dev-dist/w151-27362/ (this item's shell pid); every log and script named below is there. Node v24.20.0 by
`fnm use 24` in every shell. Every rung was redirected and its EXIT read in the same command, never piped. Ids are bare
text, as the header says.

### Gate

| command | EXIT | reading |
|---|---|---|
| `npm run gate:item > dev-dist/w151-27362/item.log 2>&1; echo "EXIT=$?"` | **0** | run ONCE, on `1159ccb`, after both readers' fixes and rule 8's last pass |
| — L0 (lint, typecheck) | 0 | inside the gate |
| — L1-L5 | 0 | node, deno and chromium; the W151 suite's **twelve** cases in one new suite named in `LATE_SUITES`, and two existing cases rewritten (below) |
| — L6 | 0 | **2487** assertions, unchanged: no L6 row reads a finished run through the runtime, so `DECLARED_TOTAL`, `DECLARED_RUNS` and examples/README.md were not touched (the declared exception row was not used) |
| — self-tests | 0 | `check:register:selftest` left out (workflow v0.29); this item edits none of the files that bring it back |

L7 did not run: no person looked at a trace.

### The heap, before and after — the same command, two trees

`node --expose-gc dev-dist/w151-27362/q513-measure.ts 2000 4` (the main session's script, copied byte for byte):
map-alias run sequentially on one runtime, arity 4, ~4 KiB results, no handle kept, heap above base after two
forced collections.

| finished runs | 100 | 250 | 500 | 1000 | 1500 | 2000 |
|---|---|---|---|---|---|---|
| **before**, `bb612da` (`before.log`) | 17.51 | 41.53 | 81.34 | 160.91 | 240.57 | 319.81 MiB |
| **after**, `e45646e` (`after.log`) | 5.19 | 10.56 | 19.42 | 37.04 | 54.96 | 72.54 MiB |

**About 160 KiB a run before; about 37 KiB a run after, and the 37 KiB is the SCHEDULER's**, not this library's: a
`FyflowScheduler` keeps every completed task in `scheduler.tasks` unless `maxCompletedTasks` caps it, and
`createRuntime` builds it uncapped. The second observer separates the two —
`node --expose-gc examples/retention.ts release N 4 4 [keep-tasks]` (W151's new mode, which deletes each finished
run's tasks from `scheduler.tasks` unless told to keep them):

| | per finished run | held-handle control |
|---|---|---|
| `release 1000 4 4 keep-tasks` | 37 497 B | 177.4 KiB per held run |
| `release 1000 4 4` (tasks evicted) | 433-486 B over four runs | 141.8 KiB |
| `release 2000 4 4` | **26 B** | 141.6 KiB |

**The library's own residue, with no scheduler at all** (`residue.ts`, the seam): **79 B per finished run at 20 000
runs** (140 B at 5 000), of which a `Set` of such ids alone is **57 B per id**. That is ADR 0091 rule 2's one string per
run. So the heap is flat in finished runs for what the RUNTIME holds; the scheduler's share is named in ADR 0091's
Context, AGENTS.md section 12 and below as an ask.

### Outputs

| | output | where | what fails without it |
|---|---|---|---|
| (1) | the before figure, and what holds a finished run | `before.log`; ADR 0091's Context table (`byRun`, `every`, `inUse`) | — a measurement |
| (2) | ADR 0091 | doc/decisions/0091-*.md | `check:register` (front matter, R6, R8 with Q513); the rule (3)-(5) are graded against |
| (3) | the release | src/scheduler/runtime.ts: `settleIfTerminal`, `openRun`'s `try`/`catch`, `settlementRouter.release` | p-keep, p-keep-every, p-keep-byrun, p-mid-turn, p-throw-keep, p-wrong-run, p-release-all, p-empty-delete, d-first-name, d-last-name, a-M21, a-M22, a-M23, a-M24, a-M20 (all CAUGHT) |
| (4) | the W151 suite (twelve cases) and the two rewritten cases | test/scheduler/runtime.test.ts, test/scheduler/resume.test.ts; the suite's name in test/definition/l4-corpus.test.ts | every probe in (3), and p-drop-id, p-drop-id-throw, p-id-after-start, p-release-parked, p-release-running; b-instrument (the `handed` instrument made blind: 13 cases fail) |
| (5) | the after figure; the `release` mode | above; examples/retention.ts | b-rel-control (its control fires), p-keep / d-last-name / a-M21 (its predicate fires); b-rel-off is its declared ceiling |
| (6) | RN-R25 v0.14, spec/README.md's column; AGENTS.md sections 9, 12 and 18 | spec/, AGENTS.md | `check:spec` C8 (version column) and `check:docs` EXIT 0 |
| (7) | Q513 resolved | doc/questions/q513.md; ADR 0091's `resolves` | `check:register` R8 both ways |

### Exceptions, reconciled to `git status --short` and `git diff --name-only bb612da..HEAD` to the path

**Eleven paths** in `git diff --name-only bb612da..1159ccb`, and `git status --short` was empty when the gate ran.
- **Owns: 10.** src/scheduler/runtime.ts, test/scheduler/runtime.test.ts, test/scheduler/resume.test.ts,
  examples/retention.ts, doc/decisions/0091-*.md, doc/decisions/0088-*.md (the dated notes), AGENTS.md (sections 9, 12
  and 18 — what a runtime keeps and how long a run's id lives), spec/run-state.md and spec/README.md (v0.14, its own
  `spec:` commit), and this file.
- **Exceptions: 1, declared at the start.** test/definition/l4-corpus.test.ts, one `LATE_SUITES` name. The second
  row (l6.ts and examples/README.md) was **not used**: L6 stayed at 2487.
- **Record step: 3.** doc/questions/q513.md (resolved), ADR 0091's `resolves`, and a dated note on ADR 0065 (fact 5
  and its rejected alternative rest on the measurement ADR 0091 withdraws). README.md was not edited: it carries no copy
  of anything this item moved.
- **Not edited at the confirming gate, on purpose:** src/driver/driver.ts (outside Owns then; its two *cannot be
  detached* comments are still true of a Driver) and doc/questions/q371.md (asked). Both moved AFTER the maintainer's
  answers — the section below.
- **Re-runs after the record step**, because it changed files the checks read: `check:register`, `check:markdown`, `check:budget`, `check:docs` and `check:spec` each EXIT 0, then `npm run gate` EXIT 0 (`gate-final.log`) on the tree with the Record and the record step in it.

### Rule 8 — an observe pass, two graded passes, the last on the tree that shipped

dev-dist/w151-27362/rule8.mjs, adapted from W142's: an anchor must match ONCE in the CURRENT text and the edit must
change it, else the probe aborts and undoes; each touched file is restored to its FIRST snapshot and compared back byte
for byte; a digest over every tracked and untracked-unignored file before and after; node 24 asserted; a no-op control
`c0`, a CRASH grader `g-crash` and a WRONG-REASON grader `g-wrong`; every `must` copied from a failure line an observe
pass printed (`--observe` runs the set ungraded). Rungs: L1-L5 in node (`t`), the runtime suite alone (`trt`), the
release mode at 1000 runs (`rel`), the refused-resume heap observer (`rr`, dev-dist/w151-27362/refused-resumes.ts), L6.

```
pass 0  (observe) 22 probes                                         digest 6645b645c00efeca IDENTICAL
pass 1            22 probes: 22 as declared, 0 against declaration  digest 6645b645c00efeca IDENTICAL
pass 2  (observe) 31 probes, after the readers' fixes
pass 2            31 probes: 31 as declared, 0 against declaration  digest 39148d6a78901110 IDENTICAL
```

**What the observe pass changed in the set before it was graded:** c0's release rung FAILED at 300 runs (1721 B a run
on correct code — a constant spread over too few runs), so the rung runs 1000; and p-mid-turn was caught at L1-L5 only
by a HANG (exit 13, W88's case) before the W151 suite was reached, so it also runs the runtime suite alone (`trt`),
where `rule 1's MOMENT` fails by name.

**The probes the brief asked for, by id:** the driver KEPT after done — p-keep, p-keep-every, p-keep-byrun,
d-first-name, d-last-name, a-M21, a-M23 (the leak returns; the release mode reads ~130 KB a run on each that keeps a
table); a PARKED or running run released — p-release-parked, p-release-running; the id DROPPED too — p-drop-id,
p-drop-id-throw, p-id-after-start (RunIdInUse lost). All CAUGHT.

**Declared survivors, by id:** a-M06 (release before `settle`), a-M15 (`every` filtered in place), a-M17 (the `settled`
guard removed) — each EQUIVALENT, with the adequacy reader's reason in the probe; b-rel-off — the release mode's own
predicate off, a declared ceiling (a measurement, not a rung; L1 is the route). **CRASH-graded, by id:** g-crash (the
grader control) and a-M16 (the release's guard removed: a TypeError out of a microtask, no named failure — the
adequacy reader's own grading).

### The readers — fresh contexts, ADR and spec first, the tree still, briefs written apart

brief-conformity.md and brief-adequacy.md. Both ran on `e45646e`, after rule 8's pass 1; `git status` stayed clean.

**Conformity** (8 findings: 3 should-fix, 5 notes, no blocking; ID-R4, ID-R5, OR-R10 and RN-R23 byte-identical to
`bb612da`, RN-R25's refusal set unchanged; every expected value it checked derives from ADR 0091 or the spec).
1. ADR 0091 credited the router with the whole ~160 KiB; ~37 KiB is `scheduler.tasks`. **Fixed** in the Context and
   rule 2, and the Q19 consequence qualified.
2. ADR 0091 named W89's collision as tier 2; it was `ID-R1` (`DuplicateTaskId`). **Fixed.**
3. Three stale sentences in owned files (runtime.ts `resume`, the W142 suite's doc, a resume.test message). **Fixed.**
4. Stale sentences outside Owns: AGENTS.md's `RunIdInUse` definition (**fixed** — AGENTS.md is owned where it says
   how long a run lives); src/driver/driver.ts:345 and :1544 (*nothing can detach it*) — **left**: still true of a
   Driver, and the id is still spent; outside Owns. ADR 0065 — the record step's note. Q371 — **asked** (below).
5. ADR 0091's reading of ADR 0058's *the runtime keeps*. **Fixed.**
6. A pre-existing RN-R23 deviation in src/driver/driver.ts: a hand-built driver whose resume is refused by a stop
   regenerated in the tail is not deaf. Not W151's code; W151 makes the runtime path hold. **Asked; the maintainer
   said FIX IT, and it is fixed** (below).
7. Rule 4's resume doors untested. **Fixed** with the adequacy reader's M03 (the same subject).
8. Q513 not yet closed — the record step.

**Adequacy** (24 mutations in an isolated `cp -r` copy at C:\Users\matij\Documents\dev\w151-adequacy-28150, node_modules
copied; `find -type l` and the ReparsePoint scan empty before and after; the copy left in place): 15 killed, 5
survived, 3 equivalent, 1 crashed; seven constructed inputs.
- **M03** (a resume refused mid-replay never released), **M22** (a failed run kept), **M24** (a resumed run kept),
  **M21 / M23** (only `task.completed` released), **M20** (order after a release) — **all fixed** by four new cases
  (the refused-resume door through a PROTOTYPE instrument, a failed and a resumed run, every event name, one shared
  order log), and each checked back in as a probe (a-M20 to a-M24; M03 is p-throw-keep-resume, now caught at L1 too).
- **The release mode failed at 300 runs on correct code.** **Fixed**: it refuses to grade fewer than 900 runs past its
  warm-up mark.
- M05 caught by a hang in the full ladder — **stated** (the rule-8 rung `trt` is the named route).
- M16 a crash — **graded CRASH** (a-M16).
- C6, a settlement in the same synchronous turn as the terminal input is handed and can still move the outcome —
  **stated** in ADR 0091 (rule 1's moment).

**The overlap is TWO shared subjects, the eighty-seventh measurement:** (1) rule 4's resume door untested
(conformity 7; adequacy M03); (2) the scheduler's share of the heap figure (conformity 1; adequacy's release-mode
finding, which is the same constant seen from the measuring side). The briefs were written apart and named no shared
obligation.

### What broke

1. **The first heap observer measured a pending microtask queue.** refused-resumes.ts read 77 KiB per refusal with the
   fix in, because the loop was synchronous and every run's `settleIfTerminal` microtask still held its driver at the
   weighing. A macrotask before the heap read fixed it; the bisect is leak-bisect.ts.
2. **The release mode's ceiling was graded at a run count where a constant reads as a per-run cost**: the observe
   pass's control and the adequacy reader both caught it.
3. **A prototype instrument cannot see a driver whose instance `onEvent` is already shadowed** — the first version of
   the refused-resume case read `[]` for the live run.

### What this taught

- **A heap figure taken through a runtime is the library's AND the scheduler's.** Q513's 160 KiB was 123 + 37.
- **An observer of a run's release must outlast the run's microtasks**, or it weighs the queue.

### After the maintainer's three answers (2026-10-09) — the asks, acted on

The Record above was written on `1159ccb`. The three asks went up through the coordinator; the maintainer answered
all three the same day.

1. **Q371: close it on ADR 0091.** Done — `resolved-by` names ADR 0091 (W151); ADR 0091's `resolves` is
   `Q513, Q371`. `check:register` EXIT 0 (R8 both ways; the first try wrote `Q513; Q371` and R7 refused the
   separator, which is `, `).
2. **The RN-R23 deviation: fix it.** The YES is in Exceptions above, committed (`cf76f19`) before the edit.
   - **The fix** (`cc23eaf`): a `deaf` flag on `Driver`, set where `resume()` refuses a stop regenerated in the lost
     tail, and read in `onEvent` beside the old *started with no header* test. That refusal keeps its header — the
     stopped run's checkpoint is one a store may take — so the old test could not see it.
   - **The test**, in test/driver/resume.test.ts: `RN-R23 — a run STOPPED in the lost tail, once refused, is DEAF:
     nothing appended, delivered or reported after`. Expected values from RN-R23's *no settlement is appended,
     routed, delivered or reported*. A hand-built Driver resumes the existing tail-stop arrangement, then is handed
     its settled task again (done and failed), a task it never dispatched, and an unminted id: the checkpoint is
     unchanged, `onFoldInput` and `onRunFailure` hear nothing, `onUnmintedTask` reports nothing, nothing is added.
   - **Its drag**, found by the control and added to the YES row: test/driver/retention.test.ts's `DRIVER_FIELDS`
     gains `deaf` (RN-R13's field ratchet, a boolean walked beside `failed` and `started`), and
     test/definition/l4-corpus.test.ts's W89 census moves 19 to 20. A third, examples/l6.ts's `DRIVER_FIELDS`, was
     found by the gate after the answers (EXIT 1 on the cross-row byte-walk clause alone, `gate-answers.log`) and added.
   - **Provoked** (dev-dist/w151-27362/rule8-deaf.mjs, 6 probes, 0 against declaration, digest `31b641c9cd4ef83b`
     identical): c0 GREEN; **d-revert** (the guard back to its pre-W151 form) and **d-unset** (the flag never set)
     each CAUGHT by the new case alone; **d-too-wide** (deaf on every failed run, `failRun` included) CAUGHT by
     `the stopped position is the stop's own` — OR-R10 stops routing, not appending; g-wrong graded WRONG; g-crash
     (a syntax error: 67 suites fail to import, 8 censuses cascade) graded WRONG against a declared catch of the new
     case, so a breakage cannot pass as a catch.
3. **The scheduler's cap: document only, no change.** As left: ADR 0091's Context and rule 2, and AGENTS.md section
   12, name `scheduler.tasks` and `RuntimeOptions.createScheduler`.

**Gate after the answers:** `npm run gate > dev-dist/w151-27362/gate-answers.log 2>&1` on `27671b3` read **EXIT 1** — the L6 cross-row byte-walk clause alone, its `DRIVER_FIELDS` missing `deaf`. Fixed in `2d51bc2`, and the same command, once, on a still tree at `2d51bc2` (`gate-answers2.log`) read **EXIT 0**: L1-L5 1593 cases in node, deno and chromium (+1, the DEAF case), L6 2487 in node and deno (unchanged). `check:register` re-run after this paragraph: EXIT 0. `gate:item` was not re-run: the maintainer asked for `npm run gate`.

### Questions closed and raised (workflow section 1 rule 6)

- **Closed: Q513 and Q371**, each `resolved-by` naming ADR 0091, whose `resolves` lists both.
- **Raised: none.** Q577-Q579 are unissued. Three ASKS went up instead (rule 6), and the maintainer answered all three
  on 2026-10-09: close Q371 on ADR 0091; fix the RN-R23 deviation; document the scheduler's cap only.
- **Ids.** Issued: W151 and ADR 0091. Q577-Q579 were reserved and are SPENT, unused. **The next plan starts at W152,
  Q580 and ADR 0092.**
