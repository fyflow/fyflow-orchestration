# W176 — the exit artifact: cancelling, stopping and pausing a run, on real workers in both runtimes

**Status:** done 2026-10-17 — **`npm run gate:full` EXIT 0** on the final tree, one command, the plan's last item; both reader passes RAN — conformity: all seven clauses CONFORM, one DEFECT fixed, the R1 GAP closed, two notes acted on; adequacy: six gaps closed, equivalents agreed; Q633 closed; no question raised; no exception — declared 2026-10-17 on `4758862`; P34's LAST item, its exit
artifact
**Plan:** [P34](../plans/p34-what-cancelling-stopping-and-pausing-a-run-do.md) — *what does a run do when its owner
cancels it, stops it to resume it elsewhere, or pauses it — and what does each leave in the log?* — its LAST item and its
EXIT ARTIFACT: the header's seven clauses, one cross-row block in `examples/l6.ts`, green in node 24 and in deno.

```
Spec:       NONE moves — an exit artifact writes no rule (W94's, W155's, W160's and W167's precedent). The expected values
            are written from spec/run-state.md v0.20 — RN-R23 (a cancelled run's resume refused at its cancel request),
            RN-R25 (a run id in use), RN-R21/RN-R22 (the in-flight set re-dispatched, `resumed` naming it), RN-R30/RN-R31
            (`cancelRequested`; `cancelling` while any dispatched task is unsettled, then `cancelled`; a second call
            appending nothing and forwarding its graceMs), RN-R32/RN-R33 (`interrupted`; deaf before the cancels; resolve()
            refused; `done` once the stop's cancels resolve), RN-R34/RN-R35 (`paused`/`unpaused`; a held dispatch appended
            and not handed on; the unpause handing on in DISPATCH order), section 3's precedence (h); spec/join-policy.md
            JP-R5 (every branch.opened before any branch is entered); spec/task-id.md section 1; spec/flow-definition.md
            FD-R4 v0.40 (a transforming target is unchecked at start — ADR 0101) and the group-types row v0.39 (a built-in
            KeyedRateLimitGroup refused resident — Q619 option B); P34 facts 8 and 9 and stop-and-asks (a)-(i) as answered;
            the scheduler's AGENTS.md sections 5 and 8 at the pin (the cancel roads; the forced stop).
Owns:       from P34's W176 row: examples/l6.ts, examples/flows/**, examples/workers/**, examples/README.md,
            examples/deno-import-map.json (only if clause (6) needs `jsonata` under deno — it does NOT, M3: NOT edited).
            examples/flows/** and examples/workers/** are in the row and are NOT edited: the flows and the workers are
            written in the block (W141's, W160's, W163's and W167's precedent).
            Exceptions: none declared.
            Record-step files (doc/workflow.md section 1 rule 5): doc/questions/** (Q633 closed — its L6 clause, W170's
            hand-off; Q658-Q659 if raised), doc/decisions/** (pointers only, if any), this file. NOT the plan's Record or
            Retro — the coordinator's, after this item.
Inputs:     P34's Exit artifact (seven clauses), facts 8, 9 and 10, decisions 3, 4, 8 and 9, stop-and-asks (a)-(i), sentences
            B′, C, D′ and E; W169-W175's Outs, each naming its L6 clause as W176's; W173's F6 (examples/README.md:118) handed
            on; W170's Q633 left open for this item; W160's cancel block and W167's exit block as the shape.
Outputs:    (1) ONE cross-row block in examples/l6.ts — `W176 exit` — its registry DOCUMENTS written in the block with data:
                workers, bounded by settleWithin, every runtime shut down in a finally, bound by CROSS_ROW_SUBJECTS. By the
                header's clauses:
                (1) a fan-out whose three branches are `honours` and `ignores` (one threaded type `Stops`, two threads, the
                    node's settings choosing whether the worker honours its signal) and `queued` (behind a
                    ConcurrentLimitGroup(1) the harness holds); cancelled through driver.cancel once both run, with a long
                    graceMs; then cancelled AGAIN with graceMs 0 once `honours` and `queued` have stopped; the checkpoint
                    resumed on a fresh runtime.
                (2) runtime A: a two-branch fan-out S beside a one-task sibling T, all three tasks running; S stopped
                    through RunHandle.stop; A.resume refused; S's checkpoint resumed on a FRESH runtime B.
                (3) a task that fails and parks user_action; the run stopped; resolve() on A; its checkpoint resumed on a
                    fresh runtime and resolved THERE (the control).
                (4) a two-branch fan-out a -> a2, b -> b2 on a threaded pool, paused at once after start, unpaused once a
                    and b have settled and a macrotask has passed.
                (5) one threaded task cancelled through driver.cancel synchronously after start (PRE-PICKUP); one whose
                    first attempt fails into a 3 s retry BACKOFF, cancelled there.
                (6) an ENTRY node of a threaded type whose worker's inputSchema requires `label`, declaring the JSONata
                    transform `{ "label": word }` — Q633's own fixture — given each of Q633's two payloads, tryTransform
                    first, then start; the same entry UNTRANSFORMED as the control.
                (7) createRuntime given a built-in KeyedRateLimitGroup in residentGroups — on a type's default pool and
                    on a named instance's — and, the control, the same document with a RateLimitGroup.
            (2) the claims, each in CROSS_ROW_SUBJECTS, by clause: (1) ELEVEN — the arrangement at the cancel, the fold
                from the request on, the log, nothing dispatched further, `honours`' road, `queued`'s road, the second
                call appending nothing while the first is pending, the escalation, `done` after the LAST task.cancelled,
                `done` IS the caller's fold, the resume refused `cancelled`; (2) EIGHT — three tasks running at the stop,
                S's log ending at `interrupted` with nothing settled, `done` after the stop's cancels, `done` IS the fold,
                the sibling untouched, A refusing the resume, B re-dispatching exactly the in-flight ids, B completed;
                (3) FOUR — parked, stopped, resolve() refused on A, resolved on the resumed run (the control); (4) FOUR —
                the held dispatches appended while paused, nothing handed on, handed on in DISPATCH order at unpause,
                completed; (5) FOUR — pre-pickup's road and fold, backoff's road and fold; (6) FOUR — tryTransform's two
                verdicts, both payloads admitted, what the worker received, the untransformed CONTROL refused; (7) THREE —
                two refusals naming pool and group, the control built. THIRTY-EIGHT cross-row assertions over ELEVEN runs,
                declared before the block ran. *(FORTY-SEVEN over FOURTEEN after the readers: (2) +1, when stop()
                resolves; (4) +4, the pause run twice; (5) +4, each road through the scheduler's cancel(id) too.)*
            (3) every L6 census the block moves, in the same diff: CROSS_ROW 331 -> 369, DECLARED_TOTAL 2664 -> 2702,
                DECLARED_RUNS 176 -> 187 *(378, 2711 and 190 after the readers)*, CROSS_ROW_SUBJECTS, pairRunCount, the file header (P34 in the exit-artifact list,
                one table row); examples/README.md's two X10 copies, and its section 2 sentence (W173's F6).
            (4) Q633 closed — its closes-when's L6 run on real workers is clause (6).
Depends on: W175 (done, 4758862)
Blocks:     nothing — P34's Record and retro follow
Tests:      examples/l6.ts at ladder L6 in node 24.20.0 and deno 2.9.6. Every expected value hand-written from the spec and
            the fixture — never from a run's output: each sequence from RN-R4/JP-R5 and the flow's own shape; each outcome
            from section 3's precedence; each id from spec/task-id.md section 1; each road from the scheduler's AGENTS.md
            section 5 and P34 fact 8. NEVER a fan-out completion order and NEVER task.running order on threads (W175's
            note): a set where the order is the scheduler's, the log's own dispatch order where the claim IS an order.
            At graceMs 0 NEVER `forced` (P34 (g), S12): the escalation is asserted as the ignoring task stopping before
            its worker's own end, which it reaches only if nothing forces it. Each claim shown able to fail by a
            ONE-clause provocation (sentence E) — of src/ under test and of the block's own arrangement — in the byte copy
            C:/tmp-w176/m; every survivor argued.
Gate:       `npm run gate` before the readers (P34 sentence C), plus test:l6 and test:l6:deno repeated (≥ 5 each) on the
            tree held still; then the conformity and adequacy readers, NOT run by this item's author; then `npm run
            gate:full` ONCE on the final tree — the plan's LAST item (workflow v0.29).
Reserves:   Q658-Q659 (P34's per-item line); no ADR (an exit artifact decides nothing; ADR 0107 is the plan's, expected
            unused)
```

## Scope

**In** — Outputs (1)-(4).

**Out** — named rather than left implicit, with where it goes instead

- **`forced` at `graceMs: 0`** — never asserted (P34 (g), S12 written, not raised).
- **`examples/deno-import-map.json`** — NOT edited: `examples/l6.ts` resolves `jsonata` under deno already (M3).
- **Anything in `src/`, `spec/`, `AGENTS.md`, `test/`, `scripts/`** — out of the row; a defect or a now-false sentence there
  is a stop-and-ask below, never an edit.

## Verification

`npm run gate` on the real tree, held still, its exit read in the same command; `npm run test:l6` and `npm run test:l6:deno`
repeated on the same tree; the author's ONE-clause provocations in the byte copy `C:/tmp-w176/m`, graded on L6's `FAIL`
lines naming `W176 exit`; then the readers; then `npm run gate:full` once. Routing coverage: a nested fan-out (Q6) — not
exercised (run control adds no route); `user_action` (Q17) — clause (3), a parked run stopped and resolved on the
resumed runtime; a branch routed away from its join (Q4), no matching decision edge (Q10) — not applicable; a duplicate
task id (Q13) — clause (2)'s resume re-dispatches at the SAME ids on a fresh scheduler, and A, which still holds them,
refuses the resume.

## What the declaration step measured

*Measured 2026-10-17 on `4758862`, node 24.20.0 and deno 2.9.6.*

| # | fact | measured |
|---|---|---|
| M1 | the baseline | `npm run test:l6:deno` on the real tree: **2664 assertions, 0 failed** (30 s) |
| M2 | **B′ / D′ — the census sites this change moves** | `CROSS_ROW`, `DECLARED_TOTAL`, `DECLARED_RUNS`, `CROSS_ROW_SUBJECTS`, `pairRunCount` and the file header in `examples/l6.ts`; `examples/README.md`'s two `X10` copies (`check:docs`). **NOT moved**: `DRIVER_FIELDS` (no driver field), `RUN_FLOOR` (no snippet), `LATE_SUITES` (no suite), `examples/README.md`'s row-label count (no label), its `flows/` and `workers/` counts (nothing added under either) |
| M3 | **fact 10's `jsonata` under deno** | a probe run from OUTSIDE the repository fails to resolve `jsonata` with the import map alone; the same probe run from inside it, and `examples/l6.ts` under `npm run test:l6:deno`, resolve it from the package's own dependencies — W167's block already evaluates JSONata under deno. **The import map is not edited** |
| M4 | **a real-scheduler probe of every clause** (`C:/tmp-w176/p1.ts`, `p2.ts`, not checked in) | each clause's road reproduces in node and deno: the ignoring task forced only by the second call; the stop's log ending at `interrupted` with nothing settled; resolve() `false` on the stopped runtime and `true` on the resumed one; PRE-PICKUP `task.cancelling`, `task.cancelled` and no `task.running`; BACKOFF settled inside the call, `attempts` 1; Q633's two payloads admitted, the worker receiving `{ label: "x" }` and `{}`; `DerivationRefused` naming the default instance and the group |

## How each exit clause is asserted — `examples/l6.ts`, `W176 exit (n)`, every claim in `CROSS_ROW_SUBJECTS`

| clause | the claims | the CONTROL beside them |
|---|---|---|
| (1) cancelled, two running (one honouring, one not) and one queued | the arrangement read back off the scheduler at the cancel, the `Stops` pool's own `cancelGraceMs` among it; the fold `running` before the request, `cancelling` at it and at each settlement while one is unsettled, `cancelled` at the last, `cancelRequest` the caller's; the log — the fan-out's seven start elements, the request at position 7, then exactly the three cancelled settlements as a SET; nothing dispatched further (length at `done` and a macrotask later, no successor held, the nodes, nothing reported); `honours`' RUNNING road and its abort reason; `queued`'s WAITING road; the second call — made 2.5 s after the first, past the scheduler's DEFAULT grace, with `ignores` still `running` and not cancelled — appending NOTHING while the first is pending and the fold reads `cancelling`; the escalation; `done` after the LAST `task.cancelled`; `done` IS the fold; the resume refused `cancelled` at 7 | `honours` itself — it stopped under the first call, `ignores` did not, which is what makes the second call's subject |
| (2) stopped on A beside a sibling, resumed on a FRESH B | S is THREE branches — `a` honouring its signal, `b` not, `c` WAITING behind a held group; `a`, `b` and T's task `running` and `c` blocked at the stop; the stop given `graceMs: 300`; S's log ending at `interrupted` with nothing settled — not even `c`'s `task.cancelled`, fired INSIDE the stop's own `cancel()` call — and `interruption` the caller's; `done` `interrupted` with all three `task.cancelled` fired by then, `b` forced last; `stop()` RESOLVED only once all three had (read in its own `then`); `done` IS the fold; the sibling's task never cancelling, its run `completed` by its own end; B's scheduler holding exactly S's three ids when `resume()` returns, `resumes`, no new `dispatched`; B `completed` | A refusing the resume `RunIdInUse` — why B is FRESH |
| (3) parked, stopped | parked (`awaiting_action`, nothing in flight); stopped — `interrupted`, the scheduler's task still `user_action` (nothing sent), equal to the fold; `resolve()` refused on A, nothing appended or dispatched | the SAME `resolve()` accepted on the runtime that resumes it, to `completed` |
| (4) paused mid-fan-out, unpaused — TWICE, `a` slow in one run and `b` in the other | per run: while paused `a`, `b` settled, `a2`, `b2` dispatched (a set), `running`, `paused`; the scheduler holding `a` and `b` alone a macrotask later; the hand-off in the ARRANGED dispatch order — the fast branch's successor first — in the log and in the scheduler's `addTask` order, `unpaused` the next element, and the scheduler holding `a` and `b` alone ON that element; `completed`, `paused` false | the two runs are each other's: any FIXED hand-off order fails one |
| (5) PRE-PICKUP and BACKOFF — each through the scheduler's own `cancel(id)` AND through `driver.cancel` | pre-pickup: `task.cancelling`, `task.cancelled`, no `task.running`, the worker silent, the call NOT settling it; backoff: `task.running`, `task.retrying`, `task.cancelled`, no `task.cancelling`, settled INSIDE the call, `attempts` 1; the fold through `cancel(id)` fact 8's literal `[dispatched, outcome cancelled]`, through `driver.cancel` `[dispatched, cancelRequested, outcome cancelled]` | each road is the other's (one settles inside the call, the other does not); each `via` the other's (the request element) |
| (6) Q633's transforming entry | `tryTransform` first: `{ word }` passes, `{ label }` fails naming `$.label required`; `start` admits both, each `completed`; the worker (threaded) received `{ label: "x" }` and `{}` | the same entry UNTRANSFORMED refused `BoundaryRefused` at `start` naming `$.label required`, the scheduler handed nothing |
| (7) a resident keyed group | `DerivationRefused` naming `node type "Holds"'s default instance`, `group "api"`, the type and `residentGroups`; the same naming `pool "holds-api"` for a named instance | a `RateLimitGroup` held resident on both documents is BUILT |

## Readings the plan did not settle — taken here, for the readers

| | the reading | why |
|---|---|---|
| R1 | **Clause (5) runs each road TWICE**: through the scheduler's own `cancel(id)` — fact 8's measurement road, its fold fact 8's literal `[dispatched, outcome cancelled]` (`RN-R28`) — and through `driver.cancel`, the owner's, whose fold carries the request: `[dispatched, cancelRequested, outcome cancelled]`. *(Changed after the readers — the conformity reader's GAP: the first build ran `driver.cancel` alone and read fact 8's fold as "the road's events", which is not the clause's literal text.)* | the clause says *folding as fact 8 says*, and fact 8's fold column is the scheduler's road; the plan is about the owner's cancel, so both |
| R2 | **The escalation is asserted as the ignoring task stopping BEFORE its worker's own end** — its messages at `done` are `['started']`, where reaching its end emits `finished` 50 ms before it returns — **and never as `cancellation.forced`**. **The `Stops` pool holds `cancelGraceMs: 600 000`**, read back, and the second call is made 2.5 s after the first — past the scheduler's DEFAULT 2000 ms — with `ignores` asserted still `running` and not cancelled then. *(Corrected after the readers — the adequacy reader's M1: the first build relied on the first call's `graceMs: 60_000` alone, and the pool's default 2000 ms grace forced `ignores` under the FIRST call whatever the driver forwarded; its premise — "nothing but the second call can stop that task" — was false, and graceMs forwarding was never proven.)* | P34 (g) and S12: `forced` at `graceMs: 0` is a timer race on an HONOURING worker; this worker ignores its signal, and the claim is what the escalation DOES rather than the flag |
| R3 | **"Two of its tasks RUN on a threaded pool" is ONE pool** — one type `Stops`, `maxThreads: 2`, the node's `settings` choosing whether the worker honours its signal (`FD-C5`'s envelope) | the header's singular; two types would be two pools |
| R4 | **The sibling is a one-task run on the same runtime, RUNNING at the stop**, and *untouched* is: its task never `task.cancelling`, run to its own end, its run `completed` | a sibling that had finished before the stop would be untouched trivially |
| R5 | **Clause (2)'s *re-dispatching exactly the in-flight tasks at the same ids* is three observers**: what B's scheduler holds when `resume()` returns, `RunState.resumes`, and the `dispatched` elements in B's log (the stored three, no fourth). **The in-flight set is THREE** since the readers: the WAITING `c` is in flight under `RN-R21` (dispatched, unsettled in the log) and B, a fresh runtime whose group nobody holds, runs it | `RN-R21`/`RN-R22`; the scheduler is the observer beside the log |
| R6 | **Clause (3) has a CONTROL the header does not name**: the same `resolve()` accepted on the runtime that resumes the stopped checkpoint | P34 decision 9's other half — *resolved on the runtime that resumes it* — and a `false` beside no `true` could be a `resolve()` that always refuses |
| R7 | **Clause (4) pauses at once after `start`**, with `a` and `b` already on the scheduler, and **runs TWICE**: `a` slow (400 ms) in one run, `b` in the other, so the held successors' dispatch order is ARRANGED each way and written as a literal per run; *nothing handed on while paused* is the scheduler's task map holding `a` and `b` alone a macrotask past both settlements AND on the `unpaused` element; *handed on in order* is the map's insertion order (`addTask`'s) — **never `task.running` order**. *(Changed after the readers — the adequacy reader's M12d and M11: unarranged, `b` won every run measured, so dispatch order and reverse-id order coincided; and the element's place before the hand-off was unobserved.)* | the held order IS a completion order, so it is arranged rather than read |
| R8 | **Clause (6) needs no `jsonata` in `examples/deno-import-map.json`** (M3) — the file is NOT edited | under `npm run test:l6:deno` the module is inside the package, whose own dependencies resolve the bare specifier; W167's block already evaluates JSONata there |
| R9 | **Clause (7) is run on a type's default pool AND on a named instance's**, the `RateLimitGroup` control on both | the header's *naming the pool*: the two roads name it differently (`node type "…"'s default instance`, `pool "…"`) |
| R10 | **A clause that throws fails its OWN claims** (`rcClause`) — one failure line naming the clause, its claims reading values nothing wrote — and the next clause still runs | W141's block-level guard makes one clause's crash every clause's, and a provocation that crashes one clause should be graded on that clause |
| R11 | **Q633 closed with `resolved-by` naming ADR 0101, and ADR 0101's `resolves` set to `Q633`** — a pointer in a decision's front matter, and one sentence in its status paragraph | `check:register` `R8` pairs the two both ways; the decision IS the answer, the L6 run its last evidence (its status paragraph said it did not resolve Q633 *alone*) |
| R12 | **Clause (2)'s stop gives `graceMs: 300`, and S's `b` IGNORES its signal** (the `Holds` worker, its node's `settings.honour: false`), on a pool whose own grace is 600 000 ms — so `a` and `c` stop at once and `b` only when the forwarded grace forces it, and *after the stop's cancels* separates the FIRST `task.cancelled` from the LAST *(the adequacy reader, M8: two honouring tasks settled in one turn, 2/7 flaky)*. On B the same `b` runs to its own end | `forced` is not asserted at 300 ms either; the claim reads which tasks had stopped when `done` settled |
| R13 | **When `stop()` RESOLVES is a claim of its own** — read in `stopP.then(…)`: all three `task.cancelled` fired by then *(the adequacy reader, M6/M7)*. Only `RunHandle.stop` is used here, and it IS `driver.stop` forwarded (`src/scheduler/runtime.ts`) | `RN-R33`: *resolves once every task it cancelled has stopped* |
| R14 | **S's WAITING task makes *deaf before it cancels* observable** *(the adequacy reader, M5)*: its `task.cancelled` fires INSIDE the stop's `cancel()` call (P34 fact 8), so a driver that went deaf after its first cancel — or never — appends it after `interrupted`; the claim reads the log ending at `interrupted` beside that task's own `['task.cancelled']` | the only road on which a not-yet-deaf driver is HANDED a stop's settlement synchronously |

## The author's provocations (before the readers)

`C:/tmp-w176/mutate.mjs` in the byte copy `C:/tmp-w176/m` (`tar` of the working tree less `.git` and `dev-dist`,
`node_modules` copied, never linked — `find -type l` zero; every changed file `cmp`-equal to the real tree before each
pass). Each probe ONE clause (sentence E) unless marked COMPOUND; each anchor checked to occur once; graded on L6's
`FAIL` lines naming `W176 exit` in node 24.20.0, and each against the claim it was written to fail; every file restored
and its digest compared; CONTROL clean (three times). **45 one-clause probes: 42 KILLED, each by the claim named; 3
SURVIVED, each argued and each confirmed REACHABLE by a compound probe killed by that claim; 2 retired as invalid and
re-cut.** Every one of the 38 claims is named by at least one kill.

| id | the clause broken | verdict, the claim that failed |
|---|---|---|
| D1, D1b | a second cancel forwards nothing; it does not take its `graceMs` | KILLED — (1) escalation (`ignores` reached its own end) |
| D2 | a second cancel appends a second request | KILLED — (1) second call appends NOTHING |
| D3 | the first cancel sends no cancel to a task handed on | KILLED — (1) `honours`, the fold, the log, `done` |
| D4, D4b | no `cancelRequested` element; the element drops the reason | KILLED — (1) the fold from the request on |
| F1 | the fold never reads `cancelling` | KILLED — (1) the fold; `done` after the LAST |
| D6 | `isTerminal` calls `cancelling` terminal | KILLED — (1) `done` after the LAST `task.cancelled` |
| D7 | a resume refused at the first cancelled settlement, not at the request | KILLED — (1) refused at 7 |
| D22 | the runtime's per-run view does not forward `cancel` | KILLED — (1), (2), (3), (5): each call refused `unsupported`, each clause's claims |
| D8, D9 | the stop does not go deaf; appends no `interrupted` | KILLED — (2) S's log |
| D10 | the stop cancels nothing | KILLED — (2) `done` after the stop's cancels |
| D11 | a stopped run's `done` settles at the element, not after the cancels | KILLED — (2) `done` after the stop's cancels |
| F2 | the fold never reads `interrupted` | KILLED — (2) `done` |
| D24 | the runtime frees a stopped run's id at its `done` | KILLED — (2) A refuses the resume |
| D23 | a stopped run's `done` releases EVERY run on the runtime | KILLED — (2) the sibling untouched |
| D17 | a resume re-dispatches nothing | KILLED — (2) B re-dispatched exactly the in-flight set, B completed *(first graded SURVIVED: the harness's 400 s timeout ended L6 inside block (2g)'s kill sweep, which this probe slows past its deadlines, before this block ran; re-run with 1800 s, 494 s)* |
| D25 | a resume does not FEED `interrupted` | KILLED — (2) B; (3) the CONTROL |
| D13 | a parked run counts as ended to a stop | KILLED — (3) stopped, refused, CONTROL |
| F5 | a parked task does not make the run `awaiting_action` (`RN-R7`) | KILLED — (3) the run PARKED |
| D14 | a dispatch under a pause is not held | KILLED — (4) nothing handed on |
| D15 | the unpause hands the held tasks on in REVERSE | KILLED — (4) DISPATCH order |
| D16 | the unpause hands nothing on | KILLED — (4) the hand-off; completed |
| F3, F4 | the fold never sets / never clears `paused` | KILLED — (4) while PAUSED; COMPLETED |
| D21 | a transforming entry held at start again (W170 reverted) | KILLED — (6) start ADMITS both |
| D29 | the start boundary holds nothing | KILLED — (6) CONTROL |
| D27 | `tryTransform` drops the given input | KILLED — (6) tryTransform FIRST |
| D28 | the envelope worker does not apply the transform | KILLED — (6) the worker RECEIVED |
| D19 | a resident keyed group is not refused | KILLED — (7) both refusals |
| D20 | a named instance's pool is not walked | KILLED — (7) the named instance |
| D30b | the refusal widened to `RateLimitGroup` | KILLED — (7) CONTROL |
| A1 | `ignores` honours its signal — no task left to escalate | KILLED — (1) second call (the first had already resolved) |
| A3 | the second cancel without `graceMs: 0` | KILLED — (1) escalation |
| A4 | the group not held — `queued` runs | KILLED — (1) the arrangement and onward |
| A7 | the pre-pickup cancel made 400 ms after `start` | KILLED — (5) PRE-PICKUP's road |
| A8 | the backoff cancel made before the first attempt fails | KILLED — (5) BACKOFF's road |
| A9 | the Q633 control given the transform | KILLED — (6) CONTROL |
| A10 | the keyed group named in `groups`, not held resident | KILLED — (7) the type's default pool |
| A11 | unpaused before `a` and `b` settle | KILLED — (4) while PAUSED |
| A12b | the sibling's state read under another id (attempt 1) | KILLED — (2) at the stop |
| **D12** | `resolve()`'s `\|\| this.stopRequest !== null` removed | **SURVIVED — EQUIVALENT on this road**: a stop TAKEN is in `shut()` already, which refuses first; the removed disjunct is for a stop still PENDING mid-step, which L6 does not arrange (L2's `test/driver/stop.test.ts` does). **D12c** (COMPOUND — both guards) KILLED by (3) `resolve()` REFUSED |
| **D31** | a settlement's `shut()` check removed (`RN-R29` after a settlement) | **SURVIVED — EQUIVALENT on this road**: every settlement after the request is `cancelled`, and `RN-R28`'s branch returns before any routing |
| **D32** | `RN-R28`'s branch falls through to routing | **SURVIVED here — EQUIVALENT on this road** (killed by W160's rows): under a requested cancel `shut()` returns first. **D33** (COMPOUND — D31 + D32) KILLED by (1) the log, the fold, nothing dispatched further. *Clause (1)'s "nothing routed after it" is held by two independent guards; no arrangement on real workers puts a non-`cancelled` settlement after the request (the scheduler ends every cancelled task `cancelled`, its AGENTS.md section 5)* |
| D30 | *(retired)* every resident group refused | CRASH at the first row — `run-flow.ts`'s `GpuModel` holds `gpu` resident, so the shared registry is refused; not a probe of this block. Re-cut as D30b |
| A12 | *(retired)* the sibling's state replaced by the literal `'running'` | substituted the EXPECTED value, so it cannot fail by construction. Re-cut as A12b |

## Gate before the readers — RAN (superseded by the Record below)

| clause | verdict | notes |
|---|---|---|
| `npm run gate`, the real tree held still | **RAN, `GATE EXIT=0`** | `lint` 153 files; `check:spec` 7 documents / 75 examples / 142 rules; `check:docs` 46 snippets (40 run, 6 check); L1-L5 **69 files / 1877 assertions** in node 24.20.0, deno 2.9.6 and chromium; L6 **2702 assertions, 0 failed, 187 real runs** in node and in deno |
| `npm run test:l6` and `npm run test:l6:deno`, repeated on the same tree | **RAN — 5/5 and 5/5 EXIT 0**, each `2702 assertions, 0 failed` | with the gate's own two runs, 6/6 in each runtime. W174's deno flake (`uncloneable / OR-R6, threaded`; `perShard` ordering) did NOT recur in six deno runs |
| conformity and adequacy readers | **NOT RUN** — owed, not by this item's author | |
| `npm run gate:full` | **NOT RUN** — owed ONCE, on the final tree, after the readers | firefox and webkit NOT RUN |

*This file's sections below its declaration were written after the gate; nothing else moved.*

## Record

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate`, before the readers | **RAN, `GATE EXIT=0`** | the table above: L6 **2702 / 187**, 0 failed, in node and deno; `test:l6` and `test:l6:deno` 5/5 each besides |
| conformity reader | **RAN** — the seven clauses CONFORM, green in both runtimes | one DEFECT (W160's block comment *"No call in `src/` cancels"*, false since W173/W174), one GAP (R1: fact 8's fold is the scheduler's own `cancel(id)` road, and the block ran `driver.cancel` alone), two NOTES (the pool observer not strict; `examples/README.md`'s *"a paused run reads `running`"* over-general) and a list of stale sentences OUT of `Owns` (below, for P34's Record) — all acted on |
| adequacy reader | **RAN** — 30 one-clause probes; *do not record until the first three are tightened* | six REAL GAPS — M1 (`graceMs` forwarding never proven: the pool's DEFAULT 2000 ms grace forced `ignores` under the FIRST cancel, R2's premise false), M12d (the pause's hand-off order could not tell dispatch order from reverse-id order — `b` won every run), M8 (the stop's two honouring tasks settled in one turn, 2/7 flaky), M6/M7 (when `stop()` resolves never checked), M5 (*deaf before it cancels* unobservable with no WAITING task), M11 (the `unpaused` element's place before the hand-off unobserved); equivalents agreed: D12 (= its M13b/M13c), D31/D32, M14, M19, A4 — all acted on |
| L6 after the readers' items, the real tree held still | **RAN — `test:l6` 5/5 and `test:l6:deno` 5/5 EXIT 0**, each **2711 assertions, 0 failed, 190 real runs** | W174's deno flake did not recur in eleven deno runs across both rounds (and the gate's) |
| author's provocations, re-run on the tightened claims | **RAN** | the table below — CONTROL clean in node and deno, every file restored, digest equal |
| **`npm run gate:full`, the confirming run** | **RAN, `GATE:FULL EXIT=0`** | ONE command on the final tree, held still, after the readers' items and the record step (this Record written before it, but for this row and the Status line): the ladder — `lint` 153 files, `check:spec` 7 / 75 / 142 rules, `check:docs` 46 snippets (40 run, 6 check), L1-L5 **69 files / 1877 assertions** in node 24.20.0, deno 2.9.6 and chromium (parity 1877), L6 **2711 assertions, 0 failed, 190 real runs** in node and deno — then EVERY self-test, `check:register:selftest` included: **11/11 completed, 11 ok**, 2113.5 s wall. firefox and webkit NOT RUN |

**What was done for each finding.**

| | finding | done |
|---|---|---|
| conformity DEFECT | W160's comment at `examples/l6.ts` *"No call in `src/` cancels"* | **fixed** — *"No call in `src/` makes THIS cancel"*, with the history in place |
| conformity GAP (R1) | clause (5) did not fold *as fact 8 says* — fact 8's fold is `[dispatched, outcome cancelled]`, the scheduler's own `cancel(id)` road | **fixed** — each road now runs TWICE, through `runtime.scheduler.cancel(id)` (fact 8's literal fold, `RN-R28`) and through `driver.cancel` (the request between); +2 runs, +4 claims. R1 rewritten |
| conformity NOTE | the `Stops` pool observer read `inline === true ? 'inline' : 'threaded'` | **fixed** — strict both ways, a missing pool reading as neither; the pool's own `cancelGraceMs` read back beside it |
| conformity NOTE | `examples/README.md` section 2: *"so a paused run reads `running`"* | **fixed** — *"a paused run with a task held reads `running` and the wait goes on until the unpause hands it on"* |
| adequacy M1 | `graceMs` forwarding never proven; R2 false | **fixed** — `Stops` and `Holds` pools hold `cancelGraceMs: 600 000` (read back in clause (1)'s arrangement claim); the second cancel is made 2.5 s after the first, PAST the scheduler's default 2000 ms, with `ignores` asserted still `running` and not cancelled then; `RC_IGNORE_MS` 4000 -> 6000 for the margin. R2 corrected |
| adequacy M12d | the hand-off order indistinguishable from reverse-id order | **fixed** — clause (4) runs TWICE, `a` slow (400 ms) in one and `b` in the other; the expected order is the ARRANGED one, a literal per run, in the log AND the scheduler's `addTask` order; +1 run, +4 claims. R7 rewritten |
| adequacy M8 | *done after the stop's cancels* flaky: two honouring tasks settled in one turn | **fixed** — S's `b` IGNORES its signal (`Holds`, `settings.honour: false`) and the stop gives `graceMs: 300` on a pool whose own grace is 600 000 ms, so `b` stops LAST, by the forwarded grace; the claim also reads `b`'s messages at `done` — `['started']`, never its own end's `finished`. R12 |
| adequacy M6/M7 | when `stop()` resolves never checked | **fixed** — a new claim, read inside `stopP.then(…)`: all three `task.cancelled` fired by then (`RunHandle.stop`, which IS `driver.stop` forwarded); +1 claim. R13 |
| adequacy M5 | *deaf before it cancels* unobservable | **fixed** — S gains a third branch `c` WAITING behind a group the harness holds on A, whose `task.cancelled` fires INSIDE the stop's `cancel()`; the log is asserted ending at `interrupted` beside `c`'s own `['task.cancelled']`. The in-flight set the resume re-dispatches is THREE (B's group held by nobody, so `c` runs there), its expected values re-written from `RN-R21`/`RN-R22`. R5, R14 |
| adequacy M11 | the `unpaused` element's place before the hand-off unobserved | **fixed** — `onFoldInput` records the scheduler's task count ON the `unpaused` element: 2, `a` and `b` alone |

**The author's provocations after the readers** — `C:/tmp-w176/mutate.mjs`, the byte copy re-synced (`cmp` per changed file, `find -type l` zero), each anchor checked once, a time-out graded NO VERDICT (none occurred; D17's slow detection given 1800 s), graded on `W176 exit` `FAIL` lines. **60 probes over the final claims: 57 KILLED, 3 SURVIVED.** Of them 57 are ONE clause — **54 KILLED, 3 SURVIVED, each argued** — and 3 are COMPOUND (D12c, D33, M11), each KILLED by the claim named. **Every one of the 47 claims is named by at least one kill.** The readers' gaps, re-cut on the tightened claims, **five times in EACH runtime**: M1, M5, M6, M7, M8 — **50 of 50 KILLED**; M11, M12d, M12e KILLED in deno as in node.

| id | the clause broken | verdict |
|---|---|---|
| D1, D1b, D2, D3, D4, D4b, F1, D6, D7, D22 | clause (1)'s cancel: forwarding, its graceMs, a second request, the cancels, the element and its reason, `cancelling`, `isTerminal`, the refusal index, the view's `cancel` | KILLED, each |
| D8, D9, D10, D11, F2, D24, D23, D17, D25 | clause (2)'s stop and resume | KILLED, each (D17 in 498 s — block (2g)'s sweep slows first) |
| **M1** ×5 node, ×5 deno | `cancelTask` drops the forwarded `graceMs` | KILLED 10/10 — (1) escalation |
| **M5** ×5 / ×5 | the stop never deaf (now with the WAITING task) | KILLED 10/10 — (2) S's log |
| **M6** ×5 / ×5 | `stop()`'s promise does not wait on its cancels | KILLED 10/10 — (2) when `stop()` resolved |
| **M7** ×5 / ×5 | `stop()` resolves when the stop is TAKEN | KILLED 10/10 — (2) when `stop()` resolved |
| **M8** ×5 / ×5 | a stopped run's `done` settles at the element | KILLED 10/10 — (2) `done` after the cancels |
| M8b | a stopped run's `done` settles at the FIRST cancel to stop | KILLED — (2) |
| D12c, D13, F5 | clause (3) | KILLED |
| D14, D15, D16, F3, F4, **M12d**, **M12e** | clause (4): the hold, a reversed / an id-ordered / a reverse-id-ordered hand-off, no hand-off, the flag | KILLED, each — M12d by the `a`-slow run, M12e by the `b`-slow run |
| **M11** (COMPOUND, one statement moved) | the unpause hands on BEFORE its element | KILLED — (4) both runs |
| D32 | `RN-R28`'s cancelled settlement falls through to routing | **KILLED now** — by (5)'s claims through the scheduler's `cancel(id)` (it SURVIVED before the readers) |
| D33 (COMPOUND) | D31 + D32 | KILLED |
| D21, D29, D27, D28 | clause (6) | KILLED |
| D19, D20, D30b | clause (7) | KILLED |
| A1, A3, A4, A7, A8, A9, A10, A11, A12b, A14, A15b | the block's own arrangement — incl. A14 (the stop without its `graceMs`: `b` reaches its own end) and A15b (the `b`-slow run unarranged) | KILLED, each |
| A13 | the `Stops` pool on the scheduler's DEFAULT grace | KILLED by (1)'s arrangement read-back alone — the first cancel's own `graceMs: 60 000` overrides the pool's, so (1)'s escalation claim needs M1 beside it to see the default (the adequacy reader's A2 + A2M1, killed) |
| **D12** | `resolve()`'s `\|\| this.stopRequest !== null` | **SURVIVED — EQUIVALENT on this road** (agreed by the adequacy reader): a TAKEN stop is in `shut()`, which refuses first; D12c kills both |
| **D31** | a settlement's `shut()` check | **SURVIVED — EQUIVALENT on this road** (agreed): every settlement after the request is `cancelled`, and `RN-R28`'s branch returns before routing; D33 kills both |
| **A15** | the `a`-slow run unarranged | **SURVIVED — COINCIDENT**: unarranged, `b` wins on this machine (the adequacy reader's M12d sample), which IS that run's arranged order; the arrangement is load-bearing in the `b`-slow run, where A15b is KILLED |
| D30, A12 | *(retired before the readers — invalid as cut)* | re-cut as D30b, A12b |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the `W176 exit` block, seven clauses | yes | the `CROSS_ROW_SUBJECTS` both-ways clause (47 subjects), `CROSS_ROW` 378, `DECLARED_TOTAL` 2711, `DECLARED_RUNS` 190 |
| (2) the claims | yes — 47 over 14 runs | each named by a kill in the table above |
| (3) the census | yes | `check:docs` `X10` (the two README copies, 2711 / 190); L6's own count guards |
| (4) Q633 closed | yes | `check:register` `R3`, `R8` (ADR 0101 `resolves` it) |

**Owns, checked by hand** (`git status --porcelain`): `examples/l6.ts`, `examples/README.md` — in the row; `doc/questions/q633.md`,
`doc/decisions/0101-a-transforming-task-is-not-held-at-start.md`, this file — record-step files. `examples/flows/**`,
`examples/workers/**` and `examples/deno-import-map.json` NOT edited. No exception taken. Every changed file LF, no
carriage return.

**What broke.** At the ladder, nothing, in either round. At the readers, the block's ADEQUACY: three claims an
arrangement made unfalsifiable (M1 — a pool default that did the second call's work; M12d — a natural completion order
that hid the hand-off's; M8 — two tasks stopping in one turn), two moments unobserved (M6/M7, M11), one property with no
road to fail on (M5), and one clause read loosely (R1).

**What this taught.**
- **A default the scheduler supplies is part of the arrangement**: R2's premise named the first call's `graceMs` and not
  the POOL's, and the pool's 2000 ms did the escalation's work. A claim about a forwarded option needs every other source
  of that option pinned beyond it, and read back.
- **An order claim needs the order ARRANGED both ways** (M12d): a natural completion order the scheduler happens to keep
  is a constant, and a constant cannot tell two rules apart. W94's *ARRANGE, never sample* (workflow section 5 rule 8 (f))
  — applied to the driver's own hand-off rather than to a fan-out.
- **"After X" needs X to have a first and a last** (M8), and **a property of a road needs the road arranged** (M5: deaf
  is only visible to a settlement fired INSIDE the call).

**Questions raised.** None — Q658-Q659 unused, skipped.

**For P34's Record and retro** — not edited here (out of `Owns`), the conformity reader's list: `doc/concept.md:217` and
`:101`; `doc/scheduler-upstream.md:194` (a dated quote — historical); `doc/questions/q583.md:9`, `:20` (*a queued task
cannot be cancelled* — false since S2 shipped); `test/fold/stuck.test.ts:162` and `test/definition/l4-corpus.test.ts:611`
(suite titles omit `cancelling`, `RN-R12` since v0.18); `test/scheduler/runtime.test.ts:1989` (*"the six outcomes"* —
nine); ADR 0014:57 historical, leave. And: road (2)'s cost is now visible on real workers — the worker receives `{}`,
which its own `inputSchema` refuses, and nothing in the run checks it (ADR 0101's stated cost, not a defect); a
mutation harness must grade a TIME-OUT as NO VERDICT (D17's first pass read SURVIVED); a probe that substitutes the
expected literal (A12) cannot fail; two clauses here are held by TWO guards each (`resolve()` after a taken stop; nothing
routed after a cancel request), so their single-clause probes survive by design.
