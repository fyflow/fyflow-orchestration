# W192 — the exit artifact: the run's payload and the map instance's item as references, on real workers in both runtimes

**Status:** done 2026-10-19 — **`npm run gate:full` EXIT 0** on the final tree, one command, the plan's last item; both reader passes RAN, no BLOCKER — C1 and A1 SHOULDs and C2-C4, A2-A4 NITs acted on; readers' overlap ONE (clause (6)'s instance-1 race); no question raised; no exception. Earlier: READY-FOR-READERS 2026-10-19 (`npm run gate` EXIT 0, L6 4/4 in node and 4/4 in deno, 33 of 34 one-clause probes KILLED and D17 SURVIVED as declared, grader controls as declared); declared 2026-10-19 on `9aa51b1` (W191 committed, the tree clean); P38's LAST item and its EXIT
ARTIFACT; not committed
**Plan:** [P38](../plans/p38-may-a-reference-name-what-reached-the-run-and-its-map-instance.md) — *may a `needs` reference
name the value that reached the RUN and, inside a `map` instance, the item that opened it — always there, copied like any
reference, refused where it means nothing, and derived again on a resume with nothing new in the checkpoint?* — its LAST
item and its EXIT ARTIFACT: the header's five clauses, one cross-row block in `examples/l6.ts`, green in node 24 and in
deno; and fyflow-app's *pass 1 follow-up* cases 1-3 on real workers.

```
Spec:       NONE moves — an exit artifact writes no rule (W94's, W155's, W160's, W167's, W176's, W182's and W188's
            precedent). The expected values are written from spec/flow-definition.md v0.45 — section 3's reference table
            and its "$payload" and "$item" rows, FD-C1 (a "$payload" key the run's payload, a "$item" key the instance's
            kept item, each its own copy per key per read), FD-C3 (an edge's), FD-V26 and FD-V49 (section 5); spec/run-
            state.md v0.28 — RN-R13 (the entry payload retained for the run's life; each map instance's item, where its
            region has a "$item" reader, until nothing of the instance may still be entered), RN-R19/RN-R21 (the replay),
            RN-R32/RN-R33 (a stop), RN-R36/RN-R37 (an ask's park, its `asked` element keeping the composed input),
            RN-R15/RN-R39 (the header's five facts); spec/join-policy.md JP-R11 (a copy per instance); spec/task-id.md
            section 1 (the ids); ADR 0117 and ADR 0118; P38's facts 4-6, decisions 3-5 and stop-and-asks (c)-(e), (l), (m)
            as answered.
Owns:       from P38's W192 row, exactly: examples/l6.ts, examples/flows/**, examples/workers/**, examples/README.md.
            examples/flows/** and examples/workers/** are in the row and are NOT expected to be edited: the flows and the
            worker are written in the block with data: workers (W182's and W188's precedent).
            Exceptions: none declared. Anything else (src/**, spec/**, AGENTS.md, test/**, scripts/**,
            examples/run-flow.ts) found to need an edit is a STOP-AND-ASK (S-n, a recommendation and alternatives), never
            an edit.
            Record-step files (doc/workflow.md section 1 rule 5): doc/questions/** (Q710-Q713 only if raised),
            doc/decisions/** (dated pointers only, if any), README.md (only if the precedent touches it), this file.
            NOT the plan's Record or Retro — the coordinator's, after this item.
            Overlap with W191 (serial, P38's rows): examples/l6.ts (W191's row owned it whole for DRIVER_FIELDS and the
            censuses; W191 set NOT_YET_AT_L6 to ['item', 'payload'], which this item empties).
Inputs:     P38's Exit artifact (five clauses, read word for word), facts 4-6, decisions 3-5, stop-and-asks (a)-(n) as
            answered, prediction 4, sentences B′, C, D′, E and the three brief sentences; W190's and W191's hand-ons (R4:
            NOT_YET_AT_L6 is W192's to empty; their M7 probes C:/tmp-w190/m/scratch-w190/probe.ts and
            C:/tmp-w191/m/scratch-w191/probe.ts as clauses (1), (2) and (4) in miniature) and their lessons; W182's and
            W188's blocks as the shape and their Records' lessons; fyflow-app's request (the session scratchpad's
            app-request-pass1-followup.md, cases 1-3).
Outputs:    (1) ONE cross-row block in examples/l6.ts — `W192 exit` — its registry DOCUMENT written in the block with ONE
                data: worker (records what it received, writes into the nested field of the keys its settings name, holds
                where its item says, returns what it saw before and after), a THREADED and an INLINE node type, one
                registered predicate; every runtime shut down in a finally, each clause guarded by its own catch (W188's
                atClause), every wait a latch that throws a NAMED error at 15 s, bound by CROSS_ROW_SUBJECTS. By the
                header's clauses:
                (1) an ENTRY ask `approve` (needs { invoice: "$payload" }) answered, its successor `pay` on a THREADED
                    pool receiving { invoice: <the run's payload>, answer: <the answer> }; `pay`'s edge routing on
                    `needs.run.amount` from an edge `needs: { run: "$payload" }` — run TWICE, 120 to `audit` and 50
                    past it, each run the other's control; the `asked` element keeping { invoice: <the payload> }.
                (2) an ENTRY map over three invoices whose branch is an ask `review` (needs { invoice: "$item" })
                    followed by `pay` on an INLINE pool (needs { invoice: "$item", answer: "review" }): each `pay` its
                    OWN item beside its OWN answer, answered OUT OF ORDER (2, 0, 1), each next answer only after the
                    previous instance's branch ARRIVED; `pay`'s edge on `needs.it.amount` sending 0 and 2 to `audit` on a
                    THREADED pool, which reads "$item", "$payload" and "." two hops in.
                (3) the copy claim over a NESTED payload and NESTED items, read both ways, with TWO keys of each token on
                    ONE node and on ONE edge: the caller writing a nested field of its payload (and of an item) after
                    start(); an INLINE worker writing a nested field of each "$payload" and "$item" key it received; a
                    registered predicate writing the same on its edge — none of it reaching the second key on the same
                    node or edge, the next node's read (THREADED), or another instance; and clause (1)'s INLINE `audit`
                    writing its "$payload" key with `file` reading after it.
                (4) clause (2)'s flow parked at its three asks, instance 1 answered and ARRIVED, then STOPPED and its
                    consumer's store (onHeader + onFoldInput at its POSITION) resumed on a FRESH runtime and answered
                    there: the successors received the same values as clause (2)'s uninterrupted run; the header the
                    five keys at format 1; the stored and resumed kinds no kind the control lacks but `interrupted` and
                    `resumed`; nothing handed on the fresh runtime for the instance that ended before the stop.
                (5) the same map flow with a task after the map's join reading "$item": FD-V49 alone, at the reader,
                    naming both fixes; `start()` refusing it InvalidDefinition with nothing handed; the CONTROL — the
                    same document with "." in its place, accepted.
                (6) — beyond the header (reading R1): the release horizon on real workers — a map of three whose
                    instances each nest a fanout in a fanout, both inner joins fired at their FIRST arrival by a
                    consumer's policy, the reader `x` two levels down; the arrangement both ways (instances P and R
                    ARRIVE at the map's join before `x` is entered, Q after) read off the log; each `x` its own item.
            (2) the claims, each in CROSS_ROW_SUBJECTS, counted at the build and written here before the block's first
                complete run.
            (3) every L6 census the block moves, in the same diff: CROSS_ROW, DECLARED_TOTAL, DECLARED_RUNS,
                CROSS_ROW_SUBJECTS, pairRunCount, the file header (P38 in the exit-artifact list, one table row);
                examples/README.md's two X10 copies and the l6.ts row's run tail and block list.
            (4) NOT_YET_AT_L6 REMOVED (W190's R4, W191's hand-on): the reference censuses read the flows this block
                STARTED beside EXPECTED's (W182's precedent for the every-kind clause), so "$payload" and "$item" are
                L6's own forms and spellings; the comments naming the list rewritten.
Depends on: W191 (done, `9aa51b1`)
Blocks:     nothing — P38's Record and retro follow
Tests:      examples/l6.ts at ladder L6 in node 24 and deno. Every expected value hand-written from the spec and the fixture,
            never from a run's output: each id from spec/task-id.md section 1; each value a node receives from FD-C1 / FD-C3
            over the fixture's payload and items; each worker result from the worker's source BY HAND; each route from the
            `when` and the amounts. NEVER a completion order across tasks the block does not ARRANGE: clause (2)'s order
            is arranged by the answers' latches, clause (6)'s by the item's hold times, each read back as a claim. Each
            claim shown able to fail by a ONE-clause provocation (sentence E) — of src/ under test and of the block's own
            arrangement — in the byte copy C:/tmp-w192/m (find -type l empty; every file restored and its digest compared;
            a timeout NO VERDICT; grader controls CLEAN, CRASH and WRONG-REASON); probes in node, those reading a runtime's
            behaviour in deno too.
Gate:       `npm run gate` before the readers (P38 sentence C); then the conformity and adequacy readers, NOT run by this
            item's author; then `npm run gate:full` ONCE on the final tree — the plan's LAST item (workflow v0.29).
Reserves:   Q710-Q713 (P38's per-item line); no ADR (an exit artifact decides nothing; ADR 0119 the plan's, expected unused)
```

## Scope

**In** — Outputs (1)-(4).

**Out** — named rather than left implicit, with where it goes instead

- **`FD-V26`'s form refusals, `FD-R4` over an entry map's branch task (S-1), `checkWiring`'s arcs, a `"$item"` in NESTED
  maps (the innermost), a map node's own `"$item"`, arity eleven, a zero-item map, the store EMPTY where no reader exists,
  the run-level release at a halt / cancel / stop** — held at L1/L2 by W190's and W191's suites
  (`test/definition/run-payload.test.ts`, `test/driver/run-payload.test.ts`, `test/definition/map-item.test.ts`,
  `test/driver/map-item.test.ts`); the header names none of them, and the store is driver state no real scheduler shows.
- **`givenVerdict` / `tryTransform(…, { input })`** — (j): unchanged, compose nothing; `AGENTS.md` section 15.
- **Anything in `src/`, `spec/`, `AGENTS.md`, `test/`, `scripts/`, `examples/run-flow.ts`** — out of the row; a defect or a
  now-false sentence there is a stop-and-ask, never an edit.

## Verification

`npm run gate` on the real tree, held still, its exit read in the same command; `npm run test:l6` and `npm run
test:l6:deno` repeated on the same tree; the author's ONE-clause provocations in the byte copy `C:/tmp-w192/m`, graded on
L6's `FAIL` blocks naming `W192 exit`; then the readers; then `npm run gate:full` once. Routing coverage: no matching
decision edge (Q10) — not exercised: every `when` here has a DEFAULT edge beside it (`FD-V7`); a branch routed away from
its join (Q4) — not applicable: clause (2)'s instances route `pay -> collect` or `pay -> audit -> collect`, both to the
join; a nested fan-out (Q6) — EXERCISED: clause (6) nests a fanout in a fanout inside each map instance, its reader two
levels down; `user_action` (Q17) — not applicable, no task fails; a duplicate task id (Q13) — clause (4)'s resume re-parks
at the SAME ids on a fresh scheduler.

## What the declaration step measured

*Measured 2026-10-19 in the BYTE COPY `C:/tmp-w192/m` (`git archive` of `9aa51b1`, `node_modules` copied, never linked;
`find -type l` 0), node 24.20.0 and deno 2.9.6.*

| # | fact | measured |
|---|---|---|
| M1 | the baseline, in the copy | `node examples/l6.ts`: **2767 assertions, 0 failed, 214 real runs** |
| M2 | **the six clauses in miniature** (`C:/tmp-w192/m/scratch-w192/probe.ts`, a real `FyflowScheduler` through `createRuntime`, the block's worker, flows and predicate) | node and deno EXIT 0 and EQUAL on every value once the hand-offs are sorted by id: (1) `pay` handed `{ invoice: <payload>, answer }`, 120 routed to `audit` then `file`, 50 to `file`, the `asked` element's input `{ invoice: <payload> }`; (2) each `pay` its own item beside its own answer, `audit` for 0 and 2 only; (3) every value `original` after the caller's, the inline worker's and the predicate's writes, the writers' own `after` showing the write; (4) stopped `interrupted`, the header `[entryPayload, flowId, format, runId, version]` at `format` 1, the stored kinds `asked`, `interrupted`, `region`, `regionEntered`; (5) `FD-V49` alone at the reader, `start()` throwing `InvalidDefinition` naming it; (6) `completed`, and the log's order in BOTH runtimes: instances 0 and 2 ARRIVED at the map's join before their `x` was dispatched, instance 1 after |
| M3 | **a scheduler default is part of the arrangement** — `compose`'s `"$payload"` arm made an ALIAS (`out[key] = runPayload`) | clause (1)'s `file` received `deep.mark: "touched-by-audit"` and clause (3)'s every `check` `"touched-by-touch"`: an INLINE pool hands the worker the composed object ITSELF, so an inline worker's write reaches the driver; a THREADED pool clones at the thread boundary, where an alias is invisible. So every direction-2 copy claim reads an INLINE writer, and a THREADED reader after it |
| M4 | **pool capacity is part of the arrangement** | the default pool is `maxThreads: 2 × maxConcurrentTasks: 1` (the scheduler's `AGENTS.md`), which serialises clause (6)'s held tasks; the inline type declares `pool: { maxConcurrentTasks: 16 }` |

## Readings the plan did not settle — taken here, for the readers

| | the reading | why |
|---|---|---|
| R1 | **Clause (6), the release horizon, is beyond the header** — two claims | W191's C1 BLOCKER and its round 2: a release horizon is provoked by an early-firing policy, nesting deeper than one level, and per instance with ≥2 instances; no shipped policy fires early (Q583), so it is a CONSUMER's policy through `StartOptions.joinPolicy`, which a real runtime takes. L2 holds it on a double; this is the same horizon with real timing |
| R2 | **Clause (1)'s *an edge predicate on that task routes on `needs.run.amount`* is the `when` subset** (`{ path, op, value }`), the app's and `AGENTS.md`'s own example; clause (3)'s EDGE copy claim is a REGISTERED predicate | a `when` cannot write, so the edge's copy claim needs code that does |
| R3 | **"Changes nothing any other node or instance receives" is read on the next node's HANDED input** (the scheduler's `addTask`, wrapped before any run, cloned at the hand-off) and **on the second key of the same node and edge** — with the WRITER's own `after` read too, so the observer is shown to see a write (an observer is vacuous until a control shows it sees) | W190's A1 and W191's lesson: a copy *per key* is read with two keys on one site |
| R4 | **Clause (4)'s "no kind the control lacks" is set difference against clause (2)'s uninterrupted run**: the stopped-and-resumed run's kinds less the control's are exactly `interrupted` and `resumed` (`RN-R32`, `RN-R21`) | the plan names *the uninterrupted control* for the values; the same run is the control for the kinds |
| R5 | **Clause (4) answers instance 1 on A, lets it ARRIVE, and only then stops** — so the resume rebuilds the store across an instance that ended before the stop (W191's C5) | a resume of three untouched parks rebuilds nothing a release could have taken |
| R6 | **Clause (2)'s answers are serialised by the instances' ARRIVALS** (answer 2, its branch arrives, answer 0, arrives, answer 1) | a release keyed to the map rather than the instance is caught only if an instance ends while another is still to be answered (W191's lesson: per instance, out of order, a horizon told by an event) |

## How each exit clause is asserted — `examples/l6.ts`, `W192 exit (n)`, every claim in `CROSS_ROW_SUBJECTS`

Twenty-two claims over EIGHT runs (seven before the readers; (5)'s control is the eighth). Observers: the scheduler's `addTask`,
wrapped before any run, recording each task's pool key as handed (`workerType` — since the readers, C3) and its handed `input` CLONED AT THE HAND-OFF (an instrument inside what it measures — X10 shows the clone is load-bearing); the
LOG (`foldInputs()`, and a consumer's positional store in (4)); the worker's own result (`got` before its write, `after`
it); the predicate's own record of `ctx.needs` before and after its write; the caller's own object after its write.

| clause | the claims | the CONTROL beside them |
|---|---|---|
| (1) the entry ask, TWICE | per run (120, 50): nothing handed at the park, the `asked` element `[id, { invoice: P }]`, `pay` handed `{ invoice: P, answer: { approved: true, by: 'ana' } }` on a pool read back `threaded`; the route — `completed`, the ids handed `[pay, audit, file]` at 120 and `[pay, file]` at 50, `audit` handed `{ run: P, again: P }` (or NOT HANDED), `file` `{ run: P }` | the two runs are each other's: a fixed selection of the `when` fails one (X13) |
| (2) the map-branch ask, three instances | three parks, nothing handed, each `asked` element `{ invoice: <its item> }`; each `pay` on a pool read back `inline` handed `{ invoice: item_i, answer: { approved: true, by: 'p<i>' } }`; `audit` for 0 and 2 only, on `threaded`, handed `{ it: item_i, tenant: <the payload>, prev: <pay_i's result, by hand> }`; the ARRANGEMENT — the map's `branch.arrived` order `['2', '0', '1']` | the instances are each other's: an item read off the wrong instance fails (D11); answered in order, the arrangement claim fails (X4) |
| (3) the copy claim | **the payload**: per run, the caller's own object shows its nested write AND the run's header, `asked` element and every hand-off carry none of it; `audit` (INLINE) — its own `after.run` shows `touched-by-audit`, its second key `again` and `file`'s read after it `original`. **Nested items** (the copy flow): each `touch` handed two `"$item"` and two `"$payload"` keys equal to the item and payload AS STARTED (handed inside `start()`, so NOT the caller's direction — the readers' C1); its `after` `[touched, original, touched, original]` for `[it, it2, run, run2]` on `inline`; the predicate's `ctx.needs` before its write the values as started, after it `[touched-by-edge, original, touched-by-edge, original]`; each `check` (THREADED) handed its own item and the payload, `original` — handed after the caller's two writes, which the caller's own object shows (the caller's direction for the items, since the readers) | every writer's own object SHOWS its write (X2, X3, X9 kill those halves) — so an observer reading `original` elsewhere could have seen a write |
| (4) stopped on A, resumed on a fresh B | on A: `interrupted`; the header's keys `[entryPayload, flowId, format, runId, version]`, `format` 1, `entryPayload` the payload as started; the stored kinds `[asked, attempted, dispatched, interrupted, outcome, region, regionEntered, resolution]`; A handed `[pay@1]` only; the asks stored with no resolution `[review:0, review:2]` (since the readers, C4). On B: `completed`, B handed exactly `[audit@0, audit@2, pay@0, pay@2]`, their inputs the hand-written values AND equal to (2)'s uninterrupted run's | the kinds against (2)'s run, both ways: `[['interrupted', 'resumed'], []]` |
| (5) `FD-V49` | `validateDefinition`: `['FD-V49']` at `['report']`, the detail naming `"."` and *move this node inside the map*; `start()` of a flow whose ENTRY task reads `"$item"` throwing `InvalidDefinition` whose message names `FD-V49`, nothing handed for its run id (since the readers, A1 — the after-join flow enters through an ask, which hands nothing anyway) | the after-join document with `"."` at `report`: `[]` (X8); the entry document with `"."` STARTS, its entry handed `[w192w:intake:-:0]`, `completed` (R2, R3) |
| (6) the release horizon | the arrangement read off the log: per instance `[arrived seen, x dispatched seen, arrived BEFORE x]` — `[true, true, true]`, `[true, true, false]`, `[true, true, true]`; each `x` (THREADED) handed `{ it: <its own item> }`, `completed` | instance 1 is 0's and 2's: `x` entered BEFORE its instance arrived, held by `l` AND `p` so neither inner join can fire first (the order both ways; since the readers, C2/A2); without the early policy (X6) or the holds (X5) the arrangement claim fails |

## What the build measured

*Measured 2026-10-19 on `9aa51b1` plus this item's diff, node 24.20.0 and deno 2.9.6.*

| # | fact | measured |
|---|---|---|
| M5 | **the block's first complete run**, in node | every one of the 22 claims GREEN; the only reds the three count guards (`2755` derived against `2777`; `2767` declared against `2790`, the guard's line among them; `214` runs declared against `221`). `CROSS_ROW` 434 -> 456, `DECLARED_TOTAL` 2767 -> 2789, `DECLARED_RUNS` 214 -> 221 |
| M6 | **the reference censuses with `NOT_YET_AT_L6` REMOVED**, reading the block's flows | node and deno: ONE red — `CROSS_ROW_SUBJECTS`' both-ways clause, because the spellings clause's relabelled text had dropped its subject *the conditional ARRAY form included*; relabelled to keep it, both green — **2789 assertions, 0 failed, 221 real runs**, EXIT 0 in node and in deno |
| M7 | **B′ / D′ — the census sites this change moves** | `CROSS_ROW`, `DECLARED_TOTAL`, `DECLARED_RUNS`, `CROSS_ROW_SUBJECTS` (+22), `pairRunCount` (+`piBlock`), the file header (P38 in the exit-artifact list, one table row); `examples/README.md`'s two `X10` copies and the `l6.ts` row's block list and run tail (`check:docs` EXIT 0, `X10` *every current copy … IS what examples/l6.ts declares*). **NOT moved**: `DRIVER_FIELDS` (its `items` COMMENT only), `RUN_FLOOR` (no snippet), `LATE_SUITES` (no suite), the row-label count (no label), `examples/flows/` and `examples/workers/` (nothing added) |
| M8 | **now-false statements**, `git grep` over the tree but `dev-dist/` and `node_modules/` for *NOT_YET_AT_L6*, *W192*, *2767*, *214 real runs*, *214 runs*, *All FIVE*, *over five and not over four*, *four of them since W45* | rewritten in `Owns`: `examples/l6.ts`'s list and its two census clauses, the spellings census's *All FIVE* comment and its *over five and not over four* label, the forms census's *four of them* comment, `DRIVER_FIELDS`' `items` comment (*empty on every run here, since no L6 row names `"$item"` until W192*); `examples/README.md`'s two `X10` copies and the `l6.ts` row's tail. **Left**: dated history in `doc/plans/**` and `doc/work-items/**` (W93, W94, W190, W191 and P38's fact 12) and the `ask` exemption's history comment in `examples/l6.ts` |

## The author's provocations (before the readers)

`C:/tmp-w192/mutate.mjs` with `C:/tmp-w192/probes.mjs`, in three byte copies `C:/tmp-w192/m`, `m2`, `m3` (`git archive` of
`9aa51b1`, `node_modules` copied, never linked — `find -type l` zero in each; this item's `examples/l6.ts` and
`examples/README.md` copied in and `cmp`-equal). Before each file's first touch the copy's file is asserted byte-equal to the
real tree's; each anchor asserted to occur ONCE in the CURRENT text and the edit to change the file; every touched file
restored from its FIRST snapshot and its SHA-256 compared after each probe, and against the real tree at the end; node 24
asserted; a 900 s time-out graded NO VERDICT (none occurred). Graded on L6's `FAIL` blocks: KILLED when one names a claim the
probe declares, WRONG-REASON when only others fail, CLEAN when nothing fails, CRASH when no summary is printed.

**First pass (`C:/tmp-w192/mut{A,B,C}.jsonl`): 34 probes + 3 grader controls — 30 KILLED, D17 SURVIVED as declared, and X1,
X14, X15 SURVIVED; CONTROL CLEAN, G1 CRASH, and G2 CLEAN where WRONG-REASON was declared.** The three survivors were ONE
real gap: every pool claim read a TYPE NAME's pool (`a.pool('EchoI')`), so moving a node to the other type changed nothing a
claim read — the claim *on an INLINE pool* was about the registry, not about the node. G2 graded X1's edit, so it could not
come back WRONG-REASON while X1 survived: the grader control did its job by failing. **Fixed**: each pool claim reads the pool
of the type the NODE's own definition names (`poolOf(flow, nodeId)`).

**Whole re-run on the final tests (`C:/tmp-w192/mut2{A,B,C}.jsonl`), node: 34 probes + 3 grader controls — 33 KILLED, 1
SURVIVED as declared (D17), CONTROL CLEAN, G1 CRASH, G2 WRONG-REASON; no NO VERDICT, no ABORTED; every file restored, its
digest equal, and equal to the real tree at the end.** **In deno 2.9.6 (`C:/tmp-w192/mut2D.jsonl`), the probes whose claim
reads a runtime's behaviour: CONTROL CLEAN, G1 CRASH, G2 WRONG-REASON; D1, D3, D5, D7, D12, D13, D14, D15, D16, X1, X6 KILLED
— 14 of 14 as declared.** Every one of the 22 claims is named by at least one one-clause kill
(`C:/tmp-w192/cov.mjs`).

| id | the ONE clause broken | verdict (node) |
|---|---|---|
| CONTROL / G1 / G2 | — / a syntax error / X1's edit graded against (6) | CLEAN / CRASH / WRONG-REASON |
| D1 / D2 | `compose`'s `"$payload"`: an ALIAS / a SHALLOW copy | KILLED / KILLED — (3) the inline worker's write reaches `file` and `run2`; (1, 120)'s route |
| D3 / D4 | `compose`'s `"$item"`: an ALIAS / a SHALLOW copy | KILLED / KILLED — (3) `it2` and `check` see the worker's write |
| D5 / D6 | `resolveNeeds`' `"$payload"`: an ALIAS / a SHALLOW copy | KILLED / KILLED — (3) the predicate's `run2` and `check` |
| D7 / D8 | `resolveNeeds`' `"$item"`: an ALIAS / a SHALLOW copy | KILLED / KILLED — (3) the predicate's `it2` and `check` |
| D9 / D10 | `"$payload"` / `"$item"` composed from the EDGE's value (the answer) | KILLED / KILLED — (1) both runs; (2) every `pay` |
| D11 | `itemOf` reads the first held instance's item | KILLED — (2) `pay` and `audit`, (3), (4) |
| D12 | W191's C1 restored — released on the instance's OWN terminal event alone | KILLED — (6) both claims: the reader entered after its instance arrived halts the run |
| D13 | `releaseItem` releases the whole MAP | KILLED — (2) all four, (4) |
| D14 | the header keeps the CALLER's payload object | KILLED — (1) both runs, (3) the caller's write, (2) `audit`'s `"$payload"` |
| D15 | an entry-reached map keeps the CALLER's element (W191 R3) | KILLED — (2) `pay@0`, (3) `check`, (4) |
| D16 | the item store NOT rebuilt by the replay | KILLED — (4) resumed and kinds (B's run halts) |
| D17 | the release horizon NOT tracked during a replay | **SURVIVED — DECLARED**: a leak, never a value — no node of the instance that ended before the stop is entered again, so an item kept too long is read by nobody (W191's M7 class) |
| V1 / V2 | `FD-V49` never reported / its message drops the second fix | KILLED / KILLED — (5) |
| X1 / X14 / X15 | (1)'s writer `audit` THREADED / (1)'s `pay` INLINE / (2)'s `pay` THREADED | KILLED ×3 after the fix (SURVIVED ×3 before it) |
| X2 / X3 / X9 | the worker / the predicate / the caller writes nothing | KILLED ×3 — each writer's own object is a claim (the observer's control) |
| X4 / X5 / X6 | (2) answered in order / (6) no holds / (6) `liveToken` | KILLED ×3 — the arrangement claims |
| X7 | (4) instance 1 not answered before the stop | KILLED — (4) |
| X8 | (5)'s control also `"$item"` | KILLED — (5)'s control |
| X10 | the harness records the handed input UNCLONED | KILLED — (3): the instrument's clone is load-bearing |
| X11 / X12 | the forms / spellings census reads EXPECTED only | KILLED / KILLED — the two census clauses: `NOT_YET_AT_L6`'s removal is held by the block's flows |
| X13 | (1)'s two runs both at 120 | KILLED — (1, 50)'s route: the pair's own difference |

**Third pass, after acting on the readers (`C:/tmp-w192/mut3{A,B,C}.jsonl`, the copies re-synced and `cmp`-clean, `find -type l`
zero), node: 40 probes + 3 grader controls — 39 KILLED, 1 SURVIVED as declared (D17), CONTROL CLEAN, G1 CRASH, G2
WRONG-REASON; no NO VERDICT, no ABORTED; every file restored, digests equal. Deno (`C:/tmp-w192/mut3D.jsonl`): CONTROL, G1,
G2, D1, D3, D5, D7, D12-D16, X1, X6, R1, R2, R4, R5 — 18 of 18 as declared.** R1-R6 are the readers' fixed halves, one clause
each: R1 (the copy flow's caller writes nothing) kills `c4`; R2 (the refused start given the `"."` document) and R3 (the
harness records nothing handed) kill (5)'s start claim; R4 (the handed pool key a constant) kills every pool claim it reaches;
R5 (instance 1 held at `q`) kills (6)'s arrangement; R6 (instance 0 also answered before the stop) kills (4)'s stop claim.
X5 and X10 were re-anchored on the fixed text; X8 now grades (5)'s validation claim, where its control moved. Every one of the
22 claims is still named by at least one one-clause kill.

## Gate before the readers — RAN

| clause | verdict | notes |
|---|---|---|
| `npm run gate`, the real tree held still (SHA-256 of `examples/l6.ts` and `examples/README.md` equal before and after the gate and the repeats, `C:/tmp-w192/dig-before.txt`) | **RAN, `GATE EXIT=0`** | `C:/tmp-w192/gate.log`: `lint` 168 files; `check:spec` 7 documents / 86 examples / 152 rules; `check:docs` `X10` *compared 2 copies … 2789 / 221*; L1-L5 **84 files / 2098 assertions** in node 24.20.0, deno 2.9.6 and chromium (parity 2098); L6 **2789 assertions, 0 failed, 221 real runs** in node and in deno |
| `npm run test:l6` and `npm run test:l6:deno`, repeated on the same tree | **RAN — 3/3 and 3/3 EXIT 0**, each `2789 assertions, 0 failed`, 221 runs | with the gate's own two runs, 4/4 in each runtime (`C:/tmp-w192/rep-*.log`) — clauses (2) and (6) are arranged by latches and hold times, and none flaked |
| conformity and adequacy readers | owed — NOT run by this item's author | |
| `npm run gate:full` | owed ONCE, on the final tree, after the readers | firefox and webkit NOT RUN |

## Readers — round 1 (2026-10-19), and what was acted on

*Both readers ran in their own worktrees, spec first; each reported and fixed nothing; the worktrees were removed with no
links in them. No BLOCKER. The adequacy reader's own seven mutants — E1 (a direct-children horizon), E2 (the instance key's
depth + 1), E3 (an index-shifted store), E4 (a replay rebuilding the store from element 0), E5 (one clone per `compose` shared by
two `"$item"` keys), E6 (one clone per edge shared by two `"$payload"` keys), E7 (`itemOf` reading the LAST held instance) — and
this item's D2, D4, D6, D8 in deno: ALL KILLED in node and in deno (its harness and logs in the session scratchpad: `rh.mjs`,
`node.jsonl`, `deno.jsonl`).*

| reader | finding | kind | acted on |
|---|---|---|---|
| conformity | **C1 SHOULD** — (3)'s *the caller's nested writes after start() in none* on the copy flow CANNOT FAIL: its entry is a map, so every `touch` is handed INSIDE `start()` (the entry step is synchronous) and the harness clones at the hand-off, before the caller writes | test | **FIXED** — `c1` claims the values as started only; the caller's direction is read off `check`, handed after both writes, beside the caller's own object showing them (`c4`). R1 (the caller writes nothing) KILLS `c4`; D14 and D15 now kill it too |
| adequacy | **A1 SHOULD** — (5)'s *nothing handed* cannot fail: the refused flow enters through a map whose branch is an ask, which hands nothing until answered | test | **FIXED** — the refused START is a flow whose ENTRY is a task reading `"$item"`; its CONTROL, `"."` in its place, STARTS and its entry IS handed (`['w192w:intake:-:0']`, `completed`) — a run, so `DECLARED_RUNS` 221 -> **222**. The after-join flow keeps `validateDefinition`'s claim, its `"."` control beside it. R2 (the refused start given the `"."` document) and R3 (the harness records nothing handed) KILLED |
| conformity + adequacy | **C2 / A2 NIT** — (6)'s instance 1 *reader entered BEFORE the arrival* rested on an unheld race (`q -> x` against `p -> f2j -> fj -> c`), and its comment misdescribed `l: 600` | test + text | **FIXED** — instance 1 holds `l` AND `p`, so neither inner join can fire before `x`'s own branch arrives; the comment says so. R5 (instance 1 held at `q` instead) KILLED |
| conformity | **C3 NIT** — `poolOf` read the DEFINITION's pool, not the handed task's | test | **FIXED** — the `addTask` wrapper records each task's pool key as HANDED (`workerType`), and every pool claim reads the distinct pools of the tasks the scheduler was handed (`poolsOf`). R4 (the key recorded as a constant) KILLED |
| conformity | **C4 NIT** — (4)'s *two asks parked* at the stop asserted only indirectly | test | **FIXED** — `s1` reads the asks stored with no resolution: `['w192s:review:0:0', 'w192s:review:2:0']`. R6 (instance 0 also answered on A) KILLED |
| conformity | R4 (*no kind the control lacks* read as less `interrupted` and `resumed`) | record | **ACCEPTED** — kept declared |
| adequacy | **A3 NIT** — `f.every(...)` passes on an empty list | test | **FIXED** — `f.length > 0 &&` on both; the rule-list equality beside them was the other guard |
| adequacy | **A4 NIT** — E4 is caught by the replay-divergence check, not by the successor-value comparison | record | **NOTED** — clause (4)'s *same values* claim is not what kills a store rebuilt from the wrong element: the replay refuses first — `ResumeRefused (diverged)`, the regenerated element not the stored one; D16 (no rebuild at all) IS killed by the values |

**The readers' overlap: ONE** — clause (6)'s instance-1 race (C2, A2). Every other finding was one reader's alone.

## Predictions, written before the build

| | prediction | outcome |
|---|---|---|
| 1 | **P38 prediction 4**: *W192 moves `X10` by its block alone, and no existing L6 row* | **HOLDS**: `X10` 2767 / 214 -> 2789 / 221, the block's 22 claims and 7 runs — **2789 / 222 after its readers** ((5)'s control run, A1); no `EXPECTED` row, pair row or other block's count moved |
| 2 | **Mine**: TWENTY-ONE claims over SEVEN runs — (1) four over two runs, (2) four over one, (3) six over one (two for clause (1)'s payload run, four for the copy flow), (4) three over two (A and B), (5) two and no run (a refused start builds no driver), (6) two over one; `X10` 2767 / 214 -> **2788 / 221**; `CROSS_ROW` 434 -> 455 | **REFUTED by one claim**: TWENTY-TWO — the caller's write was built as one claim PER payload run (two), not one for the pair; runs SEVEN as forecast; `CROSS_ROW` 434 -> **456** (M5) |
| 3 | **Mine**: removing `NOT_YET_AT_L6` moves NO count — the two census clauses that read it stay two, and their values hold with the block's flows read — and the forms set reads `['all', 'item', 'one', 'payload', 'self', 'suffix']` with no list beside it | **HOLDS**: no count moved; the set reads the six forms with nothing beside it, in node and deno (M6). X11 / X12 show the two clauses would fail without the block's flows |
| 4 | **Mine**: NOT moved — `DRIVER_FIELDS`, `RUN_FLOOR`, `LATE_SUITES`, the row-label count, `examples/flows/` and `examples/workers/`; no stop-and-ask (nothing outside `Owns` needs an edit) | **HOLDS** — `DRIVER_FIELDS` moved by its `items` COMMENT only (M7, M8); no stop-and-ask |
| 5 | **Mine**: every claim green at the block's first complete run in node and in deno, but the count guards (M2: the probe's values agree across the runtimes once sorted) | **HOLDS** for the 22 claims (M5); the one other red of the first census run was this item's own relabel dropping a `CROSS_ROW_SUBJECTS` substring (M6) |
| 6 | **Mine**: each copy claim is KILLED by an ALIAS and by a SHALLOW-copy mutant of each of `compose`'s and `resolveNeeds`' `"$payload"` and `"$item"` arms (M3), and clause (6) by W191's C1 bug restored (the item released on the instance's own terminal event alone) | **HOLDS** (D1-D8, D12 KILLED, node and deno) — and the same pass found the POOL claims unbound (X1, X14, X15), fixed |

## Record

*Filled 2026-10-19, after the readers' round. Not committed. Written before `npm run gate:full`, but for its row and the Status line.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate`, before the readers | **RAN, `GATE EXIT=0`** | the table above: L6 **2789 / 221**, 0 failed, node and deno; `test:l6` and `test:l6:deno` 3/3 each besides |
| conformity reader | **RAN** — no BLOCKER | C1 SHOULD (the copy flow's caller half could not fail), C2-C4 NITs — all acted on (the readers' table) |
| adequacy reader | **RAN** — no BLOCKER | its seven mutants E1-E7 and this item's D2, D4, D6, D8 KILLED in node and deno; A1 SHOULD ((5)'s *nothing handed* could not fail), A2-A4 NITs — acted on or noted |
| **the readers' overlap** | **ONE shared subject** | clause (6)'s instance-1 race — C2 and A2. Every other finding was one reader's alone (`doc/workflow.md` section 6) |
| author's provocations, re-run after the readers | **RAN** | node: 40 probes + 3 grader controls — 39 KILLED, D17 SURVIVED as declared, controls CLEAN / CRASH / WRONG-REASON; deno 18 of 18 as declared; every file restored, digests equal, `find -type l` zero |
| L6 after the readers' fixes | **RAN — EXIT 0**, node and deno: `2789 assertions, 0 failed, 222 real runs` | no claim added; (5)'s control is one run; `check:docs` `X10` 2789 / 222 |
| **`npm run gate:full`, the confirming run** | **RAN, `GATE:FULL EXIT=0`** | ONE command on the final tree, held still (SHA-256 of `examples/l6.ts`, `examples/README.md` and this file equal before and after; `C:/tmp-w192/gatefull.log`), after the readers' items and this Record (but for this row and the Status line): the ladder — `lint` 168 files, `check:spec` 7 documents / 86 examples / 152 rules, `check:docs` `X10` 2789 / 222, L1-L5 **84 files / 2098 assertions** in node 24.20.0, deno 2.9.6 and chromium (parity 2098), L6 **2789 assertions, 0 failed, 222 real runs** in node and deno — then EVERY self-test, `check:register:selftest` included: **11/11 completed, 11 ok**, 2272.9 s wall (2458 s for the command). firefox and webkit NOT RUN |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the `W192 exit` block, five clauses and (6) | yes | the `CROSS_ROW_SUBJECTS` both-ways clause (22 subjects), `CROSS_ROW` 456, `DECLARED_TOTAL` 2789, `DECLARED_RUNS` 222 |
| (2) the claims | yes — 22 over 8 runs | each named by a one-clause kill (`C:/tmp-w192/cov.mjs`) |
| (3) the census | yes | `check:docs` `X10` (the two README copies, 2789 / 222); L6's own count guards |
| (4) `NOT_YET_AT_L6` removed, the censuses reading the block's flows | yes | X11, X12 — each census clause RED without the block's flows |

**Owns, checked by hand** (`git status --porcelain`): `examples/l6.ts`, `examples/README.md` — in the row; this file — the record
step. `examples/flows/**`, `examples/workers/**`, `src/`, `spec/`, `AGENTS.md`, `test/`, `scripts/` NOT edited; no
`doc/questions/**` or `doc/decisions/**` file touched. No exception taken. Every changed file LF.

**Predictions** — P38 prediction 4 HOLDS (`X10` moved by the block alone: 2767 / 214 -> 2789 / 221, and 2789 / 222 after the
readers). Mine: 2 REFUTED by one claim (22, not 21 — the caller's write built per payload run); 3-6 HOLD.

**What broke.** At the ladder, nothing. Before READY, the author's first provocation pass found the POOL claims unbound (X1,
X14, X15 SURVIVED: each read a type name's pool) — fixed, and the grader control G2 caught it by grading CLEAN where
WRONG-REASON was declared. At the readers, the block's ADEQUACY in two SHOULDs and three NITs: a caller-write claim taken
BEFORE the write could happen (C1), a *nothing handed* on a flow that hands nothing anyway (A1), an order arranged on one side
and raced on the other (C2/A2), a pool read off the definition rather than the hand-off (C3), and a park asserted indirectly
(C4).

**What this taught.** *For the retro*: **an observer's CONTROL must be taken after the event it denies, on the same object the
claim reads** — C1 and A1 are one finding: a claim of absence (*the caller's write in none*, *nothing handed*) on an observer
that read before the write could land, or on a flow that never hands at its start, is vacuous however good the observer is;
the fix in both was a control on the same observer that DOES see (the caller's own object beside `check`, handed after the
write; a `"."` start whose entry is handed). And **an arrangement held by delay must hold BOTH branches of a race**, not the
one the author pictured (C2/A2). And the first pass's own: **a claim *on a THREADED/INLINE pool* reads the pool the TASK was
handed to**, never a type name the test writes.

**Questions raised.** None — Q710-Q713 unused, skipped. **Closed.** None. **ADR** none (ADR 0119 the plan's, unused).

**For P38's Record and retro** — not edited here:
- **P38 prediction 4** HOLDS; `X10` 2789 / 222 on the final tree.
- **The scheduler, measured at the pin**: an INLINE pool hands the worker the driver's composed object itself, a THREADED one a
  clone — so an alias or shallow copy is visible at L6 only through an INLINE writer (M3); the default pool capacity
  (`maxThreads: 2 × maxConcurrentTasks: 1`) serialises held tasks (M4).
- **E4 (A4)**: a store rebuilt from the wrong element is refused by the replay's divergence check, not by clause (4)'s
  successor-value comparison; D16 (no rebuild at all) is killed by the values.
- **`NOT_YET_AT_L6` is removed, not emptied** — X11 and X12 show the two censuses now depend on the block's flows.
- **Clause (6), the release horizon, is beyond the header** (R1) — W191's C1 restored (D12) is KILLED on real workers.
- The readers' overlap: ONE shared subject.
