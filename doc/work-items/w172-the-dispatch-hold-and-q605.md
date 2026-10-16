# W172 — the dispatch hold every halt shares, and Q605's two doors shut

**Status:** done 2026-10-16 — **`npm run gate:item` EXIT 0** on the final tree, one command; declared 2026-10-16 on `24253b2`; P34's FOURTH item, decision 8; both reader passes RAN, no DEFECT, their items acted on (C1, C2, C4-C7, C9, C10; A1-A6); stop-and-asks S-1 and S-2 answered YES by the maintainer 2026-10-16 — S-1 built (decision 8's three places are four), S-2 as exception E1; Q605 RESOLVED by ADR 0103; no question raised
**Plan:** [P34](../plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md) — *what does a run do when its owner
cancels it, stops it to resume it elsewhere, or pauses it?* — its FOURTH item: decisions 5 and 8. **One hold, re-checked
at three places** — `dispatch()` before its append, `enter`'s head (Q605's door (a)), and between `appendResolution` and
`advance` (door (b)) — shared by every halt, today's two (a refusal, `OR-R10`; a cancelled settlement, `RN-R28`) and
P34's cancel and stop to come. The replay's hold keeps its form. [Q605](../questions/q605.md) closes on its own
`closes-when`.

```
Spec:       spec/run-state.md v0.16 -> v0.17: section 12 and ONE rule, `RN-R29` — the dispatch hold: where it is
            checked, that a resolution halted on its own element stays accepted, and the three things it does not
            hold, stated; `RN-R28`'s sentence naming Q605's two open doors rewritten (the one existing rule whose TEXT
            moves). No `FoldInput` kind, no cell of run state and no outcome added — the outcome count stays SEVEN.
            spec/README.md: run-state.md's row, its version column and prose.
Owns:       from P34's W172 row: src/driver/driver.ts, spec/run-state.md, spec/README.md, test/driver/**,
            test/definition/l4-corpus.test.ts, test/driver/retention.test.ts, examples/l6.ts (DRIVER_FIELDS).
            B′ (M5): `test/driver/retention.test.ts` and `examples/l6.ts` are NOT edited — the hold is a METHOD over
            the two existing halt flags (ADR 0103 rule 1), so no `Driver` instance field is added and `DRIVER_FIELDS`
            does not move.
            Exceptions: E1 — granted by the maintainer 2026-10-16 (YES to S-2, after the readers): AGENTS.md, the
            ONE cell at :1023 (section 6's cancelled-task table, *the rest of the run*), its last sentence — the
            *"can let one more dispatch through (Q605)"* limit — replaced by what `RN-R29` says; nothing else
            changed there. No snippet, so `check:docs` and `RUN_FLOOR` are unmoved.
            Record-step files (doc/workflow.md section 1 rule 5): doc/questions/** (Q605 closed; Q644-Q646 if
            raised), doc/decisions/** (ADR 0103 new; ADR 0094 rule 3 and consequence 6, which ADR 0103 amends), the plan's
            Record, README.md, this file.
Inputs:     P34 decisions 5, 8, 10 and 11, facts 1-4, prediction 4, sentences B′, C, D′ and E; Q605's `closes-when`;
            ADR 0094 (consequence 6, the doors), ADR 0065 (`RN-R19`'s replay hold), `OR-R10`, `RN-R8`, `RN-R28`.
Outputs:    (1) src: `Driver.shut()` — the hold for good, `failed || cancelled` — read at `enter`'s head, `dispatch`'s
                head, `appendResolution` after its append, `resolve()` after `appendResolution`, before each of
                `resume()`'s re-dispatches (S-1, the maintainer's YES), and in place of the
                three existing `failed || cancelled` reads (`resolve()`'s entry, `settle`, `settleJoin`).
            (2) spec v0.17 (`RN-R29`, `RN-R28`'s sentence) and spec/README.md's row.
            (3) ADR 0103.
            (5) AGENTS.md's one cell (E1).
            (4) tests: test/driver/hold.test.ts (one suite, seventeen cases); l4-corpus.test.ts's census row and the
                suite's case count.
Depends on: W171 (done, 24253b2)
Blocks:     W173
Tests:      L2 — test/driver/hold.test.ts, Q605's `closes-when` case per door per halt: a fan-out's FIRST branch and a
            `map`'s FIRST instance (door (a), the halt raised on that task's `dispatched` element) and a resolution's
            own element (door (b)), each under a REFUSAL (a settlement for an id the run never dispatched,
            `UndispatchedTask`, `OR-R10`) and a CANCELLED settlement (`RN-R28`), raised from `onFoldInput`, each
            BESIDE ITS CONTROL — the same hook at the same element raising nothing. Each held case asserts the LOG
            (hand-written from `JP-R5`, `RN-R4` and `RS-R2`), the scheduler's tasks and the fold's outcome; door (a)'s
            cases also `dispatchedIds()` and the region events. **A later settlement after the halt is asserted where
            it is the claim** — on the three refusal cases of doors (a) and (b) and on the gate case under a cancel —
            and where only `settle`'s own check holds it the state is chosen so: a `user_action` (fan-out, gate) or a
            `failed` with no edge opting in (`map`), never a `done` that `enter`'s check would hold anyway (adequacy
            A2). Plus: a refusal AND a cancel on the resolution's `branch.resumed`, resolved `failed` so its routing
            ends the path inside `advance` (door (b)'s second check, which nothing else holds); a refusal AND a cancel
            on a gate's `gated` element whose route is an `end` (the head of `enter` on a node that dispatches
            nothing); a refusal raised by a getter while the entry's `needs` is composed (the head of `dispatch`,
            REACHED — adequacy A1); and `RN-R29`'s limits (ii) — on `regionEntered`, `branch.arrived` and
            `branch.lost` (conformity C1) — asserted as it is; and a resume whose `resumed` element raises a refusal or a
            cancel, handing nothing on, and one whose first hand-off raises a refusal, holding the second (S-1). The file's own `DECLARED_CASES`
            membership, and l4-corpus's count of 17.
            "Every replay case unmoved": test/driver/resume.test.ts, checkpoint.test.ts and test/scheduler/resume.test.ts
            run unchanged.
            Expected values from spec v0.17 and the flows' own shape — never from the implementation's output. Each
            clause shown able to fail by a ONE-clause mutation (sentence E) in the byte copy C:/tmp-w172/m.
Gate:       `npm run gate` before the readers (P34 sentence C); then the conformity and adequacy readers, NOT run by
            this item's author; then `npm run gate:item` ONCE on the final tree. The row's clause: L2 Q605's
            `closes-when` — a halt and a cancelled settlement each raised on the stack of a fan-out's first branch and
            of a `map`'s first instance (door a) and of a resolution's append (door b), nothing further dispatched,
            routed or emitted, beside each control; every replay case unmoved.
Reserves:   Q644-Q646 (P34's W172 row); ADR 0103 (P34 decision 11)
```

## Scope

**In** — Outputs (1)-(4).

**Out** — named rather than left implicit, with where it goes instead

- **Any new halt** — a requested cancel (W173, ADR 0104), a stop (W174, ADR 0105). Each joins `shut()`.
- **The DEFERRED form for a pause** — W175, ADR 0106, at `dispatch`'s door beside the replay's.
- **A check after every append** — refused by ADR 0103 (a settlement of a task in flight must still be appended
  after a halt); `RN-R29`'s limits (i) and (ii) are what that leaves, stated and asserted.
- **Cancelling the in-progress task of limit (i) after its hand-off** — W173 and W174 (ADR 0103's inherited hazard,
  conformity C2).

## Verification

`npm run gate` on the real tree, held still, its exit read in the same command; the author's ONE-clause provocations
in the byte copy `C:/tmp-w172/m`, each graded on the hold suite's `FAIL` lines; then the readers; then
`npm run gate:item` once. Routing coverage: a nested fan-out (Q6) — not exercised (the hold is checked at `enter`'s head,
which every region arm reaches through the same call); `user_action` (Q17) — door (b)'s parked branch; a branch routed
away from its join (Q4), no matching decision edge (Q10), a duplicate task id (Q13) — not applicable: this item adds no
route and mints no id.

## What the declaration step measured

*Measured 2026-10-16 in a BYTE COPY of `24253b2` (`git archive` into `C:/tmp-w172/m`, `node_modules` copied, never
linked; `find -type l` zero), node 24.20.0 and deno 2.9.6.*

| # | fact | measured |
|---|---|---|
| M1 | the baseline, in the copy | `npm run gate` **EXIT 0**: `lint` 146 files; `check:spec` 7 / 75 / 135 rules; `check:docs` 43 snippets (37 run, 6 check); L1-L5 **62 files / 1780 cases** in node, deno and chromium; L6 **2664 / 176**, 0 failed, in node and deno |
| M2 | **Q605 reproduced at L2** — `test/driver/hold.test.ts` (its thirteen cases then; the gate case came after the first provocation run, below) run against the copy's (HEAD's) driver | **8 of 13 cases RED**: all six door cases under both halts, the `branch.resumed` case and limit (ii) — each red with the leaked `dispatched` elements fact 1 names; the three controls, limit (iii) and the membership green |
| M3 | **P34 prediction 4** — the hold built, every other suite unchanged | node L1-L5 **63 files / 1793 cases, 0 failed** (1780 + the suite's 13 — at that measurement 12 — + l4-corpus's count case): no existing L2-L6 assertion moved; resume, checkpoint and gate suites unmoved. **Prediction 4 HOLDS** |
| M4 | **a THIRD door**, `resume()`'s re-dispatch (P34 fact 1's second `addTask` site, which decision 8 does not list) | `C:/tmp-w172/probe-resume.ts`, x -> y with `y` in flight, resumed with a callback on the `resumed` element: control hands `y` on; a refusal raised there -> outcome `halted`, **`y` STILL handed to the scheduler**; a `cancelled` settlement for `y` raised there -> `cancelled`, **`y` still handed on**. On a REAL scheduler the cancel road is closed (nothing of the run is in it yet at that element), the refusal road is open (e.g. `resolve()` from the callback reaching a refusal). S-1 |
| M5 | **B′ / D′ — the census sites this change moves** | a new SUITE -> `l4-corpus.test.ts`'s `LATE_SUITES` and a case count (W88's form); a spec version -> `spec/README.md`'s row; NO `Driver` field (`Object.keys` of a driver unmoved — a method is on the prototype) -> `DRIVER_FIELDS` in `retention.test.ts` and `examples/l6.ts` unmoved; NO snippet -> `RUN_FLOOR` unmoved; NO L6 change -> `X10` unmoved; `check:spec`'s rule count 135 -> 136 (derived, written nowhere) |
| M6 | **the tree's now-false statements**, grepped for `Q605`, *re-entrant*, *one more dispatch* over everything but `dev-dist/` and `node_modules` | in `Owns`: `spec/run-state.md` `RN-R28` (rewritten); OUT of `Owns`: **`AGENTS.md:1023`** (*"One limit, shared with a stop … can let one more dispatch through (Q605)"*) — S-2; record step: `doc/decisions/0094-*` consequence 6, `doc/questions/q605.md` (incl. `:32`'s *(or `stopped`)*, W171's C-C5). History (P33's Record, W158's file) is true of its version and stays |

## Stop-and-asks — ANSWERED by the maintainer 2026-10-16: YES to both, as recommended

| | the question | recommended | the alternatives |
|---|---|---|---|
| **S-1** | **Is `resume()`'s re-dispatch a fourth door?** (M4) P34 decision 8 lists three places; fact 1 found `addTask` at two sites and the hold covers one. A halt raised on the `resumed` element's stack still hands the whole in-flight set on — for a `halted` or `cancelled` run. | **YES — widen decision 8 by one check, in this item**: `if (this.shut()) break` before each re-dispatch (one line, `driver.ts`, in `Owns`); `RN-R29`'s limit (iii) becomes a door; the hold suite's limit-(iii) case flips to assert nothing handed on. W174 (a stop raised on the same stack) and W175 (a paused resume) edit this loop next and would inherit it | **Leave it to W174/W175**, which edit the loop: (iii) stays a stated limit until then. **Raise a question** (Q644): only if the fix is not small, which it is |
| **S-2** | **`AGENTS.md:1023` becomes false** — *"One limit, shared with a stop: a cancel raised SYNCHRONOUSLY from your own `onFoldInput` … can let one more dispatch through ([Q605])"*. `AGENTS.md` is not in P34's W172 row | **YES — widen `Owns` by that one cell**: replace the sentence with what `RN-R29` says (a halt on that stack holds every further dispatch; the task whose own element raised it is still handed on). Prose in a table, no snippet: `check:docs` unmoved | **Leave it for W173**, whose row owns `AGENTS.md` sections 6, 8, 11 and 12 — this cell is in section 6's cancelled-task table, so W173 may rewrite it anyway; meanwhile the reference states a limit the library no longer has |

## Record

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate`, before the readers | **RAN, `GATE EXIT=0`** | real tree held still, node 24.20.0: `lint` 147 files; `check:spec` 7 / 75 / **136** rules; `check:docs` 43 snippets (37 run, 6 check); L1-L5 **63 files / 1795 cases** in node, deno 2.9.6 and chromium (+15 over M1: the suite's 14 cases then and l4-corpus's count case); L6 **2664 / 176**, 0 failed, in node and deno — unmoved, so `X10` does not move. firefox and webkit NOT RUN |
| L2 — Q605's `closes-when`, a case per door per halt beside each control | **RAN** | `test/driver/hold.test.ts`: door (a) on a fan-out's first branch and a `map`'s first instance, door (b) on a resolution's own element, each under a refusal and a cancelled settlement, each beside its control; M2 red on HEAD's driver, green on this one; K1-K23 below |
| every replay case unmoved | **RAN** | `test/driver/resume.test.ts` (21), `checkpoint.test.ts` (13), `test/scheduler/resume.test.ts` (7) and `checkpoint.test.ts` (3) green and unedited; l4-corpus's W88/W89 counts unmoved |
| conformity reader | **RAN** | **No DEFECT in `src/`**; C1, C2 SHOULD-FIX; C4-C7, C9, C10 notes — acted on below; recommended YES on S-1 and S-2 |
| adequacy reader | **RAN** | every check had a killer; survivors `dispatch_del` (REACHABLE — A1), `settle_cancelled`, `enter_failed`, `res2_failed`, `sj_del` (equivalent); A1, A2 SHOULD-FIX; A3-A6 notes — acted on below; recommended YES on S-1 and S-2 |
| author's provocations, re-run after the readers' items and S-1 | **RAN** | harness `C:/tmp-w172/mutate.mjs` in the byte copy re-synced with the final tree: control CLEAN; **26 one-clause probes: 24 KILLED, 2 declared survivors (K8, K21)**; 3 compound probes confirming reachability; every file restored, digest equal |
| **`gate:item`, the confirming run** | **RAN, `GATE:ITEM EXIT=0`** | ONE command on the final tree, held still, after the readers' items, S-1, E1 and the record step (this Record written before it, but for this row and the Status line): the ladder — `lint` 147 files, `check:spec` 7 / 75 / 136 rules, `check:docs` 43 snippets (37 run, 6 check), L1-L5 **63 files / 1798 cases** in node 24.20.0, deno 2.9.6 and chromium (the suite's 17 and l4-corpus's count case over M1), L6 **2664 / 176**, 0 failed, in node and deno — then the self-tests less `check:register:selftest`: **10/10 completed, 10 ok**, 1085.3 s self-test wall. firefox and webkit NOT RUN; `gate:full` NOT RUN and not owed (W176 is P34's last item) |

**The author's mutation table** — each ONE clause (sentence E), graded on the hold suite's `FAIL` lines (`full` = the
whole L1-L5 node run). First run (before the readers): K1, K4, K8, K9 SURVIVED — door (a)'s branches are tasks, so
`dispatch`'s check backs `enter`'s, and a `done` resolution's routing enters a node; the gate case and the `failed`
resolution were added for them. Final run:

| id | the clause broken | verdict, killed by |
|---|---|---|
| K1 | `enter`: its check removed | KILLED — the gate route, refusal and cancel |
| K2 | `dispatch`: its check removed | KILLED — the compose-getter case (adequacy A1; SURVIVED before it, the "forward guard" claim withdrawn) |
| K3 | `appendResolution`: its check removed | KILLED — door (b), refusal and cancel |
| K4 | `resolve()`: the check before routing removed | KILLED — `branch.resumed`, refusal and cancel |
| K5 | `resolve()` returns `false` for a resolution halted on its own stack | KILLED — four door-(b) cases |
| K6 | `shut()` without `cancelled` | KILLED — every cancel case |
| K7 | `shut()` without `failed` | KILLED — every refusal case |
| K8 | `enter`: narrowed to entries outside a map | **SURVIVED, declared** — `dispatch`'s check holds a map instance; C1 confirms the clause reachable |
| K9 | `enter`: narrowed to entries inside a map | KILLED — the gate cases |
| K10 | `appendResolution`: narrowed to the refusal | KILLED — door (b) cancel |
| K11 | `settle`: its check removed | KILLED — the later `user_action` / `failed` settlements (A2) |
| K12 | limit (i) changed: a check between the `dispatched` append and `addTask` | KILLED — door (a)'s four held cases |
| K13 | S-1: the `resume()` loop's check removed | KILLED — the resume case |
| K14 | limit (ii) changed: the fan-out's `branch.opened` loop checks the hold | KILLED — the limit case |
| K15 | `settle`: narrowed to the refusal (adequacy `settle_cancelled`) | KILLED — the gate cancel case's later `user_action` |
| K16 | `settle`: narrowed to the cancel | KILLED — door (a)'s refusal cases |
| K17 | `enter`: narrowed to the refusal (adequacy `enter_failed`) | KILLED — the gate cancel case |
| K18 | `enter`: narrowed to the cancel | KILLED — the gate refusal case |
| K19 | `resolve()`'s routing check narrowed to the refusal (adequacy `res2_failed`) | KILLED — `branch.resumed` cancel |
| K20 | `resolve()`'s routing check narrowed to the cancel | KILLED — `branch.resumed` refusal |
| K21 | `settleJoin`: its check removed (adequacy `sj_del`) | **SURVIVED, declared EQUIVALENT** (`full`) — subsumed by `enter`'s for routing; the collection is already released by `failRun` and a cancel |
| K22 | `dispatch`: narrowed to the cancel | KILLED — the compose-getter case |
| K23 | limit (ii) on a join changed: `settleJoin` checks before its satisfied `joinSettled` | KILLED — the limit case's join shape |
| K25 | S-1: the loop's check narrowed to the refusal | KILLED — the resume case's cancel |
| K26 | S-1: the loop's check narrowed to the cancel | KILLED — the resume case's refusal |
| C1 | COMPOUND K2+K8 | REACHABLE — the map cases red; kills nothing |
| C2 | COMPOUND K1+K2 | REACHABLE — every door-(a) case red; kills nothing |
| K24 | COMPOUND: S-1's check hoisted to once before the loop (two edits) | REACHABLE — the resume case's hand-off shape red; kills nothing, and per re-dispatch has no one-clause cut beyond K13 |

**The readers' tables, as relayed by the coordinator**: the adequacy reader's survivors are re-cut above as K2, K15,
K17, K19, K21 — all KILLED but K21, which is equivalent. *(The per-mutation lists are the readers' reports; C3 and C8
were not relayed and are not recorded here.)*

**What was done for each finding.**

| | finding | done |
|---|---|---|
| C-C1 (SHOULD-FIX) | `RN-R29` limit (ii) and ADR 0103 rule 5 narrower than the code: any element appended mid-step lets the step's rest land | **restated generally** in `RN-R29` (ii) and ADR 0103 rule 5, naming `regionEntered`, `branch.arrived` (`joinSettled` fired) and `branch.lost` (`pathEnded`, `joinSettled`, `onUnsatisfiableJoin` CALLED); the latter two **pinned** in the limit case; K23 |
| C-C2 (SHOULD-FIX) | limit (i) is a hazard W173/W174 inherit: a cancel on a task's own `dispatched` stack precedes its `addTask`, so `scheduler.cancel` resolves `false` and the task runs | **handed on** in ADR 0103's Consequences, in `RN-R29` (i) and in `dispatch`'s comment: W173 and W174 cancel the in-progress task AFTER its hand-off |
| C-C4 | ADR 0094 rule 3 (`:60`) also names the two open doors | **pointer added** at rule 3 and at consequence 6 (record step) |
| C-C5 | ADR 0103's `amends` | **`amends: ADR 0094 rule 3`**, unquoted; `check:register` R7's grammar has no form for a consequence (`ADR 0094 consequence 6` is refused), so consequence 6 is named in the Status paragraph |
| C-C6 | Q605's close should say which *stop* | **said**: today's halt; P34's cancel and stop covered by joining `shut()`, W173/W174 verify |
| C-C7 | `feedOne` does not mirror door (b)'s second check | **comment added**: unreachable — a replay delivers no callback for a stored position (`RN-R24`) |
| C-C9 | P34 D′ predicted `DRIVER_FIELDS` moves | stated in *What this taught* |
| C-C10 | the Status named one stop-and-ask | **corrected**, and now both are answered |
| A-A1 (SHOULD-FIX) | K2 REACHABLE: `compose` clones the caller's payload for `needs: { v: "." }`, running its getters | **case added** (the reader's P1, with a control); the "forward guard / unreachable" claim **withdrawn** in `dispatch`'s comment, ADR 0103 rule 2 and `RN-R29` (2); K2, K22 |
| A-A2 (SHOULD-FIX) | later settlements were `done`, held by `enter`; the Tests clause over-claimed | fan-out refusal's later settlement **`user_action`**, `map` refusal's **`failed`** with no edge opting in, the gate cancel case's in-flight `c` **`user_action`**; the Tests clause **rewritten** to say where a later settlement is asserted; K11, K15, K16 |
| A-A3 | `enter` and door (b)'s second check tested under a refusal only | **cases added**: the gate under a cancel (three branches, `a` cancelled from `gated`) and `branch.resumed` under a cancel (the reader's P4); K17-K20 |
| A-A4 | `settleJoin`'s check now redundant | **stated** as subsumed for routing and kept, in its comment, `RN-R29` and ADR 0103; K21 declared equivalent |
| A-A5 | cases 11 and 12 pin limits later items may move | case 12 **flipped** by S-1; case 11 stays the stated limit |
| A-A6 | door (b) cases assert no `dispatchedIds()` | the new door-(b) cancel case does; recorded only |
| S-1 | `resume()`'s re-dispatch — the maintainer's YES | **built**: `if (this.shut()) break;` before each re-dispatch; `RN-R29` check (4), ADR 0103 rule 7 and its last consequence (decision 8's *three places* are four); case 12 asserts nothing handed on, under a refusal and a cancel, and a halt in one hand-off holding the next; K13, K25, K26, K24 |
| S-2 | `AGENTS.md:1023` — the maintainer's YES | **E1**: the one cell's last sentence rewritten to `RN-R29`'s statement |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) `shut()` and its reads | yes | K1-K23, K25, K26; M2's eight red cases |
| (2) spec v0.17 and the README row | yes | `check:spec` C8 binds the Status to the row, C2/C6 the new rule's declaration and owner; the prose is bound by no test |
| (3) ADR 0103 | yes | `check:register` R6-R8 (its front matter, `resolves: Q605` against Q605's `resolved-by`) |
| (4) the tests | yes | the table above; l4-corpus's count of 17 and the census row |
| (5) `AGENTS.md`'s cell (E1) | yes | prose in a table — no check reads it |

**Record-step files**: `doc/decisions/0103-*` (new, `resolves: Q605`); `doc/decisions/0094-*` (pointers at rule 3 and
consequence 6); `doc/questions/q605.md` (resolved, `resolved-by` ADR 0103; `:32`'s *(or `stopped`)* glossed with
`halted` since W171 — W171's C-C5); this file. The plan's Record is the join's. `README.md` is not edited.

**Owns, checked by hand** (`git diff --name-only` and the untracked files against the block above): every file
changed is in P34's W172 row, is E1, or is a record-step file.

**What broke.** Nothing at the ladder. The first provocation run found four survivors (K1, K4, K8, K9): door (a)'s
branches are tasks, so two checks back each other, and a `done` resolution's routing enters a node — the cases did not
pick the shapes each check alone holds. The readers found the second half of that: a check called unreachable that was
reachable (A1), later settlements chosen so `enter` held them (A2), and a limit stated narrower than the code (C1).

**What this taught.**
- **P34's D′ sentence is wrong for W172**: it expected the hold to move `DRIVER_FIELDS`; the hold is a METHOD over the
  two existing flags (ADR 0103 rule 1), so no field moved (conformity C9).
- **P34 prediction 4 HOLDS**: no existing L2-L6 assertion moved (M3, and the gate's 2664 / 176).
- **P34 decision 8's three places were four** (S-1): fact 1 found `addTask` at two sites and the decision listed one of
  them. A decision that enumerates doors needs its enumeration checked against the measurement it came from.
- **Where two checks guard one door, a case per DOOR kills neither alone** — the shape that only one check holds has to
  be picked deliberately (K1/K2/K4 before the gate, the getter and the `failed` resolution). For P34's retro.

**Questions raised.** None — Q644-Q646 unused, skipped. **Closed**: [Q605](../questions/q605.md), by ADR 0103.
**Handed on**: the in-progress-task hazard of `RN-R29` (i) to W173 and W174 (ADR 0103's Consequences).
