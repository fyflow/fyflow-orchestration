# W191 — the map instance's item as a reference: `"$item"`, and what an instance keeps for it

**Status:** done 2026-10-19 — `npm run gate:item` on the final tree, one command, EXIT 0 (the Record); two reader rounds RAN, round 1's one BLOCKER (C1) fixed and confirmed by round 2; record-step pointers written; no question raised; not committed. Earlier: READY-FOR-READERS 2026-10-19; declared 2026-10-19 on `68f9f3b` (W190 committed, the tree clean); P38's SECOND item: stop-and-asks
(a), (c)-(e), (g)-(i) as answered, facts 5-7 and 9; ADR 0118 (reserved for it); W190's S-1 (the maintainer's answer,
2026-10-19: W191 fixes it); not committed
**Plan:** [P38](../plans/p38-may-a-reference-name-what-reached-the-run-and-its-map-instance.md) — *may a `needs` reference
name the value that reached the RUN and, inside a `map` instance, the item that opened it — always there, copied like any
reference, refused where it means nothing, and derived again on a resume with nothing new in the checkpoint?* — the
fyflow-app ask *pass 1 follow-up*, case 2 (an ask as a MAP BRANCH entry, whose successor in the same instance receives the
answer and cannot reach the item). **As answered**: (a) both references, this item the item; (c) `"$item"` names the
INNERMOST map region that CONTAINS the reader as a member — a `map` node's own `"$item"` is its ENCLOSING instance's, and a
node in a `fanout` inside a map instance names the map's; (d) legal on every node and edge inside a map instance, the branch
entry included (where it equals `"."`); (e) each instance's item kept BY REFERENCE to the element the map received, only
where the region has a `"$item"` reader (decided at construction), released when that INSTANCE's branch goes terminal, and
rebuilt by the replay on a resume; (g) `FD-V49` for `"$item"` outside any map instance, its message naming the fix; (h) the
union W190 widened, now composed; (i) `checkWiring` composes a `"$item"` key over the enclosing map's ITEM arrival; (l) a
copy per key per read; (m) an ask's `asked.input` keeps its copy.

```
Spec:       spec/flow-definition.md v0.44 -> v0.45: section 3's reference table (+1 row, "$item"), its prose on the "$"
            prefix, FD-C1 (a "$item" key composed from the instance's kept item), FD-C3 (an edge may name it), the EDGE
            subsection's grammar sentence, the wiring table's `needs` row (the map's item arrival), *A sample the caller
            GIVES* (j); section 5's FD-V26 row (the "$item" refusal RETIRED) and a NEW FD-V49 row, the count sentences
            (44 -> 45 refusals over FD-V1 ... FD-V49); section 6's FD-R4 row (a "$item" key composed from the walk's own
            element; any `needs` on an entry map's branch task composes — S-1); the v0.45 version paragraph.
            spec/run-state.md v0.27 -> v0.28: RN-R13 a SIXTH term (each map instance's item, where its region has a
            "$item" reader, from the instance's opening until nothing of it may still be entered); the v0.28 paragraph.
            spec/README.md: both rows and their version columns.
Owns:       from P38's W191 row, exactly: src/definition/validate.ts, src/definition/regions.ts, src/definition/wiring.ts,
            src/driver/driver.ts, spec/flow-definition.md (the WHOLE file — the row's parenthetical is a forecast, P36's
            clause), spec/run-state.md (the WHOLE file, likewise), spec/README.md, spec/examples/invalid/**,
            test/definition/**, test/driver/**, examples/l6.ts (the WHOLE file — `DRIVER_FIELDS` and the censuses are a
            forecast), examples/run-flow.ts (`NOT_RUN_STATE` — measured UNMOVED, M2), AGENTS.md (the WHOLE file, D′),
            scripts/check-docs.mjs (RUN_FLOOR), doc/decisions/0118-*.
            Exceptions: none declared. Anything else found to need an edit is a STOP-AND-ASK (S-n), never an edit.
            Record-step files (doc/workflow.md section 1 rule 5): doc/decisions/** (ADR 0040 rule 2 and ADR 0046 — a dated
            pointer each to ADR 0118), doc/questions/** (Q705-Q709 only if raised; Q166 — a dated note, the plan's row),
            the plan's Record, README.md, this file.
            Overlap with W192 (next, serial): examples/l6.ts, AGENTS.md (W192's row: examples/l6.ts, examples/flows/**,
            examples/workers/**, examples/README.md).
Inputs:     P38 facts 5-7 and 9, decisions 1-8, stop-and-asks (a)-(n) as answered, the D′ list for this row (the siblings of
            "." and of "$payload" — referenceTarget's union and every reader switching on `form`; the siblings of
            FD-V27/FD-V29 for FD-V49; DRIVER_FIELDS, NOT_RUN_STATE; RUN_FLOOR; LATE_SUITES; the PREMISES of fact 10),
            sentences B′, C, D′, E and the three brief sentences; W190's Record, readings R1-R6, its provocations and its
            lessons (a copy claim provoked by an ALIAS and a SHALLOW copy over a NESTED fixture, read both ways AND with two
            keys on one node and one edge; a substring assertion on a refusal must not be a prefix of a sibling's; a census
            reading a spec table moves with the table; an Owns parenthetical is a forecast; the sibling grep; an observer is
            vacuous until a control sees something; *held*/*released* needs a horizon told by an event); fyflow-app's
            request (the session scratchpad's app-request-pass1-followup.md, case 2).
Outputs:    (1) src/definition/regions.ts: `innermostMapOf(regions, nodeId)` — the innermost map region containing the
                node as a member, by `regionChainOf`'s walk; the ONE answer the validator, the driver and the wiring
                check read (an ADDITIVE export of a module `index.ts` re-exports whole — stated, not BREAKING).
            (2) src/definition/validate.ts: FD-V26's "$item" refusal RETIRED at both sites (W190's reading R1); the
                grammar messages list "$item"; FD-V49 on the FD-V27-FD-V29 loop's `item` arm, at a node and at an edge,
                its message naming both fixes.
            (3) src/driver/driver.ts: `Driver.items` — the kept maps (from the document) and the held items (instance
                branch path -> item, by reference), written in the map arm, released in `emit` once nothing of the
                instance may still be entered (its branch terminal, no nested branch live) and at the four run-level moments `arrivals` is cleared at; `compose` and `resolveNeeds`
                compose a "$item" key as its own copy per key per read (`itemOf`); FD-R4 composes it from the walk's own
                element; `compose` derives a branch path only for a NODE reference (S-1).
            (4) src/definition/wiring.ts: `composed` reads a "$item" key over the enclosing map's ITEM arrival, one
                composed object per element; `entryWalk`'s comments.
            (5) spec flow-definition v0.45, run-state v0.28, spec/README.md's rows; spec/examples/invalid/ +2 FD-V49 cases.
            (6) tests: test/definition/map-item.test.ts (L1, NEW); test/driver/map-item.test.ts (L2, NEW);
                test/definition/run-payload.test.ts (W190's "$item"-refused case retired, its message case moved);
                test/definition/needs.test.ts (the table bound, +1 row); test/driver/retention.test.ts (DRIVER_FIELDS);
                l4-corpus's census (+2 suites, a per-suite count case, +2 invalid examples).
            (7) examples/l6.ts: DRIVER_FIELDS +1 (`items`); the reference censuses learn the "$item" row
                (`NOT_YET_AT_L6` += 'item', W192 empties it).
            (8) AGENTS.md: section 3's `needs` subsection — the table row, the `"$item"` subsection with the app's
                map-branch-ask worked example as a `run` snippet, the refusals (44 -> 45), the cost; sections 7, 9, 15, 17
                and 18 where they state a premise this falsifies; `RUN_FLOOR` 48 -> 49.
            (9) doc/decisions/0118-a-map-instance-keeps-its-item-while-a-node-of-it-may-still-be-entered.md.
Depends on: W190 (committed, 68f9f3b)
Blocks:     W192
Tests:      L1, expected values hand-written from (c), (d), (g), (i) and section 3's grammar, never from output:
            `innermostMapOf` on nested maps (the innermost), a map node (its enclosing), a node in a fanout inside a map
            (the map), a node outside (none), a node after the map's join (none); FD-V26 no longer refusing "$item" at either
            site, its array and suffix clauses unmoved; FD-V49 at a node and at an edge outside any map instance, on a
            top-level map node, and after a map's join — FD-V49 alone, at the reader, its message naming both fixes —
            beside "." in the same position accepted; "$item" ACCEPTED on the branch entry (beside "."), two hops in after
            an ask, on an edge, in a fanout inside a map instance, and on a map node inside a map; `checkWiring` over a
            "$item" key composed from the map's item arrival, one sample per element (fits / no), `unchecked` for an entry
            map. L2 over a scheduler double: the branch entry (one value, two objects); the app's case 2 — an ENTRY map whose
            branch is an ask, each successor its OWN item beside its OWN answer at arity 3, answered out of order; two hops
            into an instance; an edge predicate routing on `needs.it.amount` from "$item", both ways in ONE run; a NESTED
            map (the inner node the innermost item, the inner map node its enclosing one); a node in a fanout inside an
            instance; arity 11 (`"1"` against `"10"`, section 3's segment-wise rule); the COPY claim over NESTED items,
            two "$item" keys on one node and on one edge, read both ways (a worker's and a predicate's nested write; the
            caller's payload after start()) against an ALIAS and a SHALLOW-copy mutant; the store EMPTY for a region with
            no "$item" reader beside a control that shows the observer SEES the store; each instance's item RELEASED by its
            own branch's terminal event (read inside `onRegionEvent`), a parked instance's kept until its answer, and the
            run-level release on a halt; a run STOPPED at a parked map-branch ask and RESUMED on a fresh driver — the store
            rebuilt by the replay, the successor receiving the uninterrupted control's value, the header five keys at
            format 1, no fold-input kind the "." control lacks; S-1's regression — an ENTRY map's branch task declaring "."
            , "$payload" or "$item" with an `inputSchema`: accepted, and `BoundaryRefused` (never `UnresolvedBranchPath`)
            for a bad element; a map flow naming "$item" nowhere unchanged. W190's R6 probe (FD-R4 composing from the
            walk's value vs the payload) re-run after the walk's item reaches FD-R4. A real-scheduler probe in node and deno
            only if useful, not checked in — W192 owns L6. One-clause mutations (sentence E) in the byte copy C:/tmp-w191/m.
Gate:       `npm run gate` before the readers (sentence C); the conformity and adequacy readers, NOT this item's author;
            then `npm run gate:item` ONCE on the final tree. B′: `check:docs:selftest` (a `run` snippet added) and
            `check:budget:selftest` only if an always-read document moves (none is planned).
Reserves:   Q705-Q709 (P38's per-item line); ADR 0118 (P38 decision 7)
```

## Scope

**In** — Outputs (1)-(9).

**Out** — named rather than left implicit, with where it goes instead

- **The exit artifact on real workers** — W192: no L6 assertion or run is added here (`X10` unmoved); the censuses move by
  the spec table's new row only, and `NOT_YET_AT_L6` names it until W192 runs it.
- **An OUTER map's item from inside an inner one** — (c): out; a node of the outer instance that declares it passes it down.
- **`givenVerdict` / `tryTransform(…, { input })`** — (j): unchanged; `AGENTS.md` says why for `"$item"` as for `"$payload"`.
- **`boundaryTargets`' return shape** — unchanged: a target inside a map instance IS that map's branch entry (reading R2), so
  the walk's value is the item and nothing new is returned.
- **A size warning** — (l), Q186: none; an item is one element, so the cost is the element's.

## Verification

`npm run gate` on the real tree, held still, its exit read in the same command; `check:docs:selftest` (B′: a snippet added);
the author's ONE-clause provocations in the byte copy `C:/tmp-w191/m` (node_modules copied, never linked, `find -type l`
empty), graded on the named suites' `FAIL` lines, a time-out NO VERDICT, grader controls CLEAN, CRASH and WRONG-REASON; then
the readers; then `npm run gate:item` once. Routing coverage: no matching decision edge (Q10) — not applicable, the L2 edge
case routes both ways with a default; a branch routed away from its join (Q4) — covered where it touches this item: an
instance whose branch is LOST or EXITS releases its item by that event (the release case); a nested fan-out (Q6) — a fanout
inside a map instance reads the map's item (L1 and L2); `user_action` (Q17) — a parked node keeps its instance live, the
ask's park being the case P38 names (L2); a duplicate task id (Q13) — not applicable, no id moves.

## What the declaration step measured

*Measured 2026-10-19 in the BYTE COPY `C:/tmp-w191/m` (`git archive` of `68f9f3b`, `node_modules` copied, never linked;
`find -type l` 0), node 24.20.0.*

| # | fact | measured |
|---|---|---|
| M1 | the baseline, in the copy | `node test/runner.ts` EXIT 0: **82 files / 2071 cases** |
| M2 | **B′ — the `src/` change ALONE** (the four `src/` files built in the copy; no test, spec or example touched) | L0 `npm run typecheck` EXIT 0. L1-L5 **3 of 2071 RED**: W190's two `"$item"`-reading cases in `test/definition/run-payload.test.ts` (the grammar message now lists `"$item"`; `"$item"` no longer refused) and `test/driver/retention.test.ts`'s `DRIVER_FIELDS` (`items`). L6 node **1 of 2767 RED**: `examples/l6.ts`'s `DRIVER_FIELDS` cross-row clause, naming `items`. `check:spec` and `check:docs` EXIT 0. **`NOT_RUN_STATE` UNMOVED** — `items` holds strings, a `Map` and the items, and the byte walk serializes it (no `-1`); **P38 prediction 2 HOLDS so far**: the field moves by its NAME, no retention value moved |
| M3 | **prediction 3 — the spec table's new ROW**, measured on the real tree before the censuses learned it, and again as one-clause probes S1/S2 | `test/definition/needs.test.ts`'s table bound RED (*6 rows, 5 hit*); L6: dropping `item` from `NOT_YET_AT_L6` turns **3** `cross-row` clauses RED (S1), renaming the row's token turns one RED (S2) — no `EXPECTED` flow uses the token: the censuses read the TABLE, W190's lesson, now a prediction that held |
| M4 | the two new suites against `68f9f3b`'s `src/` (written from the plan before any run; `C:/tmp-w191/m4.log`) | L1 **CRASH** — `test/definition/map-item.test.ts` cannot import `innermostMapOf`, which does not exist there; L2 **12 of 13 RED** (green: the membership) — the S-1 case among them, its `"."` label throwing `UnresolvedBranchPath` |
| M5 | **B′ / D′ — the census sites**, each by its lane, on the real tree | `RUN_FLOOR` 48 -> 49 (`check:docs` **49 `run` / 6 `check`**, EXIT 0); `LATE_SUITES` +2 and a count case (7, 13); `spec/examples/invalid/` 50 -> 52 (`l4-corpus` +2 cases; `check:spec` *C4 covered **45** definition refusals*, after its two count sentences — the spec's own version paragraph and `spec/README.md`'s *C4 covered* — learned 45: it went RED on both first, as designed); `needs.test.ts`'s table bound +1 row; `DRIVER_FIELDS` +1 in both lists; `NOT_RUN_STATE` and `X10` UNMOVED (L6 **2767 / 0 failed**, 214 runs); spec v0.45 and v0.28 and their `spec/README.md` rows; one rule id, `FD-V49`. L1-L5 node **84 files / 2094 cases** (+2 files, +23: 7 + 13 + 1 count case + 2 invalid examples) |
| M6 | **now-false statements** — `git grep` (not `dev-dist/`) for each changed name and PREMISE (*until W191*, *does not compose*, *not composed yet*, *44 refusals*, *covered 44*, *FD-V1 … FD-V48*, *Forty-four*, *keeps nothing*, *pass-through task*, *branch entry receives*, *one hop later*) and for a SIBLING of `FD-V49` (`FD-V47`'s every list) | rewritten in `Owns`: validate.ts (header count, `referenceTarget`'s doc, the two grammar messages, the interim clause's doc), wiring.ts (`entryWalk`'s two comments, `composed`), driver.ts (FD-R4's comment, `compose`, `resolveNeeds`), spec (v0.45: section 3's prose and table, the cost section, `FD-C1`, the EDGE subsection, `FD-C3`, the wiring row, *A sample the caller GIVES*, `FD-V26`, `FD-V49`, `FD-R4`), run-state v0.28 (`RN-R13`), AGENTS.md sections 3, 4, 7, 15, 17, 18. **Left, true of their version**: spec's v0.42 and v0.44 history paragraphs. **Outside `Owns`, record-step files**: ADR 0117 rule 7 (*refused … until P38's W191 composes it*) — amended by ADR 0118's front matter; a dated pointer at the record step. No other list of refusals names `FD-V47`'s siblings |
| M7 | **a real-scheduler probe** — `C:/tmp-w191/m/scratch-w191/probe.ts`, `createRuntime` over a real `FyflowScheduler`, `pay` on a THREADED pool and `audit` on an INLINE one; not checked in (W192 owns L6) | node 24.20.0 and deno 2.9.6 EXIT 0, **the same JSON byte for byte** (`C:/tmp-w191/probe-node.json`, `probe-deno.json`): an ENTRY map of three whose branch is an ask, answered out of order — each `pay` its own invoice beside its own answer, the caller's post-`start()` nested write absent; the edge on `needs.it.amount` routed 120 and 300 to `audit` (`{ it: <its invoice>, prev: <pay's result> }`) and 50 to the join; a run STOPPED with three asks parked, resumed on a fresh runtime and answered there: the same values, the header the five keys at `format` 1, the stored kinds `asked`, `interrupted`, `region` and `regionEntered` alone |

## Readings the plan did not settle — taken here, for the readers

| | reading | why | where stated |
|---|---|---|---|
| **R1** | **`innermostMapOf` is an ADDITIVE public export** — `src/definition/regions.ts` is re-exported whole by `index.ts`, as `regionChainOf` and `sharedRegionDepth` are | the row owns regions.ts *if a region-chain helper is added*; ONE function three callers read (validator, driver, wiring check) is the alternative to three copies of a walk that could disagree about which item a reader names. Not BREAKING, and P38 decision 8's *stated where it changes*: the v0.45 paragraph names it | regions.ts's doc; spec v0.45's paragraph |
| **R2** | **`FD-R4` composes `"$item"` from the walked VALUE, and `boundaryTargets` returns nothing new** | every walk target inside a map instance IS that map's branch entry — the walk ends at the first task, and `FD-V25` makes a branch a task or an ask — so its value is the instance's item; a second field on a public return would be a shape change for a value already there | driver.ts's FD-R4 comment; wiring.ts's doc |
| **R3** | **By reference — except where the map's received element may be the CALLER's**: a map reached from the entry through gates alone and declaring no `needs` receives `start()`'s own payload, and there the instance keeps its OWN copy | (e) says *by reference to the map's own received element*; at that one site the element is not the driver's (`start()` hands `enter` the value it was called with, as an entry ask receives it — P35 (f)'s reason for `asked.input`'s copy), and a caller's later write would reach a `"$item"` read — the copy claim's direction 1 | driver.ts's `itemMaps`; ADR 0118 |
| **R4** | **Released also at the four RUN-LEVEL moments `arrivals` is cleared at** — a halt, a cancel, a stop, a `cancelled` settlement | after each no node of the run is entered, so no instance can read; ADR 0046's run-level moment, one structure over | driver.ts; `RN-R13` v0.28 |
| **R5** | **ONE field, `items`, with two halves** — `kept` (from the document) and `held` (the instances' items) | P38 prediction 2: `DRIVER_FIELDS` moves by ONE name; the two halves are one rule's (*kept where a reader exists*, *held while the instance lives*) | driver.ts's doc |
| **R6** | **A miss in `itemOf` throws a plain `Error` naming the invariant** | unreachable on a document a `Driver` accepts (a node is entered only while its instance lives); `undefined` may be a legitimate item, so a silent `undefined` would be a wrong value, not a refusal — W190's R5 precedent | driver.ts |
| **R7** | **An ENTRY map's item arrival is `unchecked`** in `checkWiring` (no arrival: the run's payload, which no schema declares), as is a map with two or more arrivals | (i): *unchecked where the map has no single arrival* | wiring.ts; spec's wiring row |

## Predictions, and what happened

| | prediction (at declaration) | outcome |
|---|---|---|
| 1 | **P38 prediction 2**: *W191's store is empty on every existing flow (no corpus flow declares `$item`), so `DRIVER_FIELDS` moves by its NAME and no retention assertion moves by a VALUE; `RN-R13`'s text moves by one term* | **HOLDS** (M2, M5): one name in both lists, no retention value, `NOT_RUN_STATE` unmoved; `RN-R13` gains one term — its SIXTH (v0.20's held dispatches are the fifth; this file said *fifth* until the count was read off the rule) |
| 2 | **P38 prediction 3**: *no item moves `CHECKPOINT_FORMAT`, `RUN_FOR`, `isFed` or `snapshot()`* | **HOLDS**: none is edited; the L2 resume case and M7 read the header's five keys at `format` 1 and no fold-input kind the `"."` control lacks |
| 3 | **Mine, W190's lesson applied**: the spec table's new `"$item"` row moves `test/definition/needs.test.ts`'s table bound and the two L6 censuses that read the TABLE (`referenceFormsInSpec`, `REFERENCE_SPELLINGS_IN_SPEC`), red until `NOT_YET_AT_L6` names `item` — with no `EXPECTED` flow using the token | **HOLDS** (M3) |
| 4 | census: `RUN_FLOOR` 48 -> 49; `LATE_SUITES` +2 with a count case; `spec/examples/invalid/` +2 (`l4-corpus` +2 cases; `check:spec` C4 *45 definition refusals*); `DRIVER_FIELDS` +1 in both lists; `NOT_RUN_STATE` and `X10` unmoved (2767 / 214) | **HOLDS** (M5) — and `check:spec`'s two count sentences moved with it, which the row did not name (both in `Owns`) |
| 5 | **S-1**: making `compose`'s branch path lazy is the whole fix for `"."` and `"$payload"` on an entry map's branch task; `"$item"` there needs the walk's element and no index | **HOLDS**: D9 (the branch path derived eagerly again) is KILLED by the `"."` label alone; no item index reaches `FD-R4` |

## The author's provocations (before the readers)

`C:/tmp-w191/mutate.mjs` in the byte copy `C:/tmp-w191/m` (synced to the real tree, `find -type l` 0, node 24.20.0 asserted at
the head of the run) — W190's harness, its grading unchanged: each anchor checked to occur once in the CURRENT text, every file
restored from its FIRST snapshot and its SHA-256 compared after every probe and at the end; graded on the FAIL lines of the
cases each probe DECLARES — `node test/runner.ts map-item` (both suites), `definition/run-payload`, `driver/run-payload`,
`definition/needs`, L6 `node examples/l6.ts`; a time-out NO VERDICT; an import failure CRASH; failures only outside the
declared cases WRONG-REASON. **Grader controls**: CONTROL must grade CLEAN, GRADER-CRASH CRASH, GRADER-WRONG-REASON (D5's edit
declared against `innermostMapOf`'s case) WRONG-REASON.

**First pass (`C:/tmp-w191/mut.log`): 45 probes + 3 controls — 41 KILLED, 4 SURVIVED (D11, D16, D28, W3), controls CLEAN /
CRASH / WRONG-REASON, no NO VERDICT, no ABORTED; every file restored, digests equal.** Acted on: **W3** was a real gap — no case
had a map entered from TWO producers, so *unchecked where the map has no single arrival* was one half untested; the wiring case
gained one (a valid two-producer flow, `unchecked`, *2 arrivals*), and W3 re-run alone is KILLED (`C:/tmp-w191/mut-w3.log`).
The other three are declared EQUIVALENTS, by id:

| id | the ONE clause broken | verdict |
|---|---|---|
| CONTROL / GRADER-CRASH / GRADER-WRONG-REASON | — | CLEAN / CRASH / WRONG-REASON |
| V1 | FD-V49 refuses `"$item"` outside every map instance | KILLED — node, edge, and W190's retired case |
| V2 / V3 / V4 | `innermostMapOf`: a MAP region (not a fanout) / the INNERMOST / never the region a node opens | KILLED / KILLED / KILLED |
| V5 / V6 | FD-V26's interim `"$item"` refusal stays retired at a NODE / an EDGE | KILLED / KILLED |
| V7 / V8 | FD-V49's message names the second fix / it is reported AT the edge | KILLED / KILLED |
| V9 / V10 | the node's / the edge's grammar message lists `"$item"` | KILLED / KILLED |
| D1 / D2 | `compose`: an ALIAS / a SHALLOW copy of the kept item | KILLED / KILLED — the nested copy claim |
| D3 / D4 | an edge's `"$item"`: an ALIAS / a SHALLOW copy | KILLED / KILLED — the predicate's nested write absent from `also` |
| D5 / D6 | `"$item"` composed from the edge's value / `enter` handing the edge's value as the item | KILLED / KILLED — case 2, two hops, nested |
| D7 | FD-R4's `"$item"` from the walk's ELEMENT | KILLED |
| D8 | **W190's R6, re-run**: FD-R4 composes `"$payload"` from the WALKED value | **KILLED** — no longer an equivalent: the walk now reaches an entry map's branch task with `needs`, where the walked value is the element and not the payload |
| D9 | S-1: the branch path derived only for a node reference | KILLED |
| D10 | the store's own copy where the element may be the caller's | KILLED — the copy claim's direction 1, entry and gate roads |
| D11 | the store BY REFERENCE elsewhere — always copying instead | SURVIVED — **a declared EQUIVALENT**: an extra copy is memory, never a value a reader sees (every read clones, and the map's received element is reachable by no caller) |
| D12 / D13 | kept only where a reader exists / the reader's INNERMOST map is the one kept | KILLED / KILLED |
| D14 / D15 | the caller's object reached through GATES / an entry-reached map keeps its own copy | KILLED / KILLED |
| D16 | … only where that map declares no `needs` | SURVIVED — **a declared EQUIVALENT**: with `needs` every `"."` key is already a copy, so a further copy is redundant, not wrong |
| D17 / D18 / D19 | released on the terminal event / only on a terminal one / BEFORE the event is delivered | KILLED / KILLED / KILLED |
| D20 / D21 / D22 | `releaseItem` keyed by the branch path / that instance alone / the map's key with its last | KILLED / KILLED / KILLED |
| D23 / D24 / D25 / D26 | released whole at a halt / a cancel / a stop / a `cancelled` settlement | KILLED ×4 |
| D27 | `itemOf` reads the INSTANCE's path, not the reader's | KILLED — the fanout inside an instance |
| D28 | `itemOf`'s miss THROWS | SURVIVED — **a declared EQUIVALENT**: unreachable on a document a `Driver` accepts (R6; W190's P21 precedent) |
| W1 / W2 / W4 / W5 | the map's ITEM arrival / one object per element / `"."` keeps the arc's one value / an entry map unchecked | KILLED ×4 |
| W3 | a map with no SINGLE arrival unchecked | SURVIVED first pass — **a gap, fixed** (a two-producer case); KILLED on re-run |
| S1 / S2 | `NOT_YET_AT_L6` names `item` / section 3's table has the row | KILLED / KILLED — L6 `cross-row` (S2: the L1 bound counts rows, not tokens — the second route) |

**Whole re-run on the final tests, before the readers (`C:/tmp-w191/mut2.log`)**: 45 probes + 3 controls — 42 KILLED, 3
SURVIVED (D11, D16, D28 — declared equivalents), controls CLEAN / CRASH / WRONG-REASON, no NO VERDICT; digests equal.

## Readers — round 1 (2026-10-19), and what was acted on

*Both readers ran in their own worktrees, spec first; each reported and fixed nothing. One BLOCKER (C1).*

| reader | finding | kind | acted on |
|---|---|---|---|
| conformity | **C1 BLOCKER** — an item released too EARLY when a join NESTED in the instance fires early: a consumer's policy satisfies a `fanout`'s join inside the instance at its first arrival, the instance's branch ARRIVES at the map's join, its item is released — and the fanout's other branch then enters `x`, which reads `"$item"`: `itemOf` throws, the run halts (the `"."` control runs clean). ADR 0118 rule 5's and `RN-R13`'s *after which no node of the instance is entered* was false | code + spec | **FIXED** — the horizon is now what (e) and ADR 0118's title say, *nothing of the instance may still be entered*: the instance's branch terminal AND no branch of a region NESTED in it live. `trackItems` counts each nested region's open branches per instance (`within`, `nested`, `ended` — still the one field `items`, O(nesting depth) per region event, nothing where no map keeps) and releases on whichever comes last. Not a design fork: (e)'s recommended answer states this horizon (*after which no node of that instance can be entered*), and its refused alternatives (the region's join, the run's life) are unchanged. ADR 0118 rule 5, `RN-R13` v0.28, the v0.45 paragraph, `spec/README.md`'s rows and AGENTS.md's row say it; L2 case *a NESTED join fired early* with its `"."` control. Re-cut H1-H5, all KILLED |
| conformity | **C2 SHOULD** — `FD-V26`'s row's value list omitted `"$item"` | spec | **FIXED** |
| conformity | **C3 SHOULD** — AGENTS.md section 17's *the inner map reads its list off the OUTER item with `needs: { lines: '$item' }`* is true only where the outer item IS the list; that section's own orders are `{ id, size }` — `UnresolvedMapArity` | text | **REMOVED** — the `"$item"` subsection already states a map node's `"$item"` is its enclosing instance's item |
| conformity | **C4 NIT** — AGENTS.md's release row said *reaches an `end`*; `branch.exited` is any route out of the region | text | **FIXED**, with the new horizon |
| conformity | **C5 NIT** — no case resumed a run where an instance had already ended before the stop | test | **FIXED** — the resume case declines instance 2 before the stop: the store `['0','1']` before the stop and rebuilt identically, the release included |
| conformity | **C6 NIT** — an item schema with no per-element sample left a `"$item"` key's sample `undefined` | code | **HANDLED** — the item schema's own witness; no road reaches it today (stated in place) |
| adequacy | **A1 SHOULD** — *per INSTANCE, never with the region's join* untested: every case used `liveToken` (R12 survived) | test | **FIXED** — L2 case *a map's join fired at its FIRST arrival*, a consumer's policy through the public seam; R12r KILLED |
| adequacy | **A2 SHOULD** — `releaseItem` keyed by its map untested (R10 survived) | test | **FIXED** — the same case: a second map's instance `"1"` arrives while the first map's `"1"` is live; R10r KILLED |
| adequacy | **A3 SHOULD** — `"$item"` on a branch-entry (per-item) arc never exercised (R1 survived) | test | **FIXED** — a wiring case with `"$item"` beside `"."` at the branch entry, transformed per element; R1r KILLED |
| adequacy | **A4 SHOULD** — no nested-map wiring case (R2 survived) | test | **FIXED** — a nested-map wiring case, the inner item fitting where the outer would be `no`; R2r KILLED |
| adequacy | **A5 NIT** — a ZERO-item map with a reader left an empty entry (R7 survived) | test | **FIXED** — the KEPT case starts a map over `[]`: nothing held; R7r KILLED |
| adequacy | D11, D16, D28 — the declared equivalents hold (D11 attacked two ways, no leak) | record | — |

**Re-run after acting on the readers (`C:/tmp-w191/mut3.log`): 55 probes + 3 controls — 52 KILLED, 3 SURVIVED (D11, D16,
D28 — declared equivalents, by id), controls CLEAN / CRASH / WRONG-REASON, no NO VERDICT, no ABORTED; every file restored,
digests equal.** H1-H5 are the C1 horizon's own clauses (released on the instance's own event alone, an ended instance never
released, the instance key's depth, `within` counting non-nested regions, a nested branch counted live from its opening);
R1r, R2r, R7r, R10r and R12r are the adequacy reader's survivors re-cut as one clause each. The L2 suite now registers
FIFTEEN cases (`l4-corpus`'s count moved with it); its SUITE name still reads *released by its branch`s terminal event*,
census-bound, and is left.

## Readers — round 2 (2026-10-19), on the release horizon alone

*One reader, focused on round 1's C1 fix, in its own worktree. It found the fix CORRECT — thirteen behaviour shapes probed,
no early release, no leak, a resume rebuilding `held`, `nested` and `ended` identically — and four of its clauses unbound.*

| finding | kind | acted on |
|---|---|---|
| **R2-1 SHOULD** — the instance key's depth (`slice(0, depth)`) unbound: M1 (one segment) survived, and under it a kept map under an outer fanout — instance `"1.0"` — with an early nested join is round 1's blocker again | test | **FIXED** — L2 case *a nested branch ending LOST or EXITED … and a map under an outer fanout*; M1 KILLED |
| **R2-2 SHOULD** — a nested branch ending `lost` or `exited` uncounts it: M3 (arrivals only) survived and leaked | test | **FIXED** — the same case, both ways, after the instance's branch arrived; M3 KILLED |
| **R2-3 / R2-4 SHOULD** — per-INSTANCE counting (M4, per map) and nesting deeper than one level (M8, direct children only) unbound | test | **FIXED** — L2 case *nesting DEEPER than one level, per instance, both orders*: three instances, a fanout in a fanout, instance 1 released while instance 0's two-deep branch is live; M4, M8 KILLED |
| **R2-5** — *whichever comes last* bound one way only | test | **FIXED** — the same case's instance 2: every nested branch ends first, released by its own arrival |
| **R2-6 NIT** — M6 (the `kept` short-circuit) and M7 (`releaseAllItems` clearing the counts) survive | record | **DECLARED EQUIVALENTS** — M6 is cost only (`within` is empty where nothing is kept); M7 is invisible, since no region event is routed after a run-level moment |
| **R2-7 NIT** — AGENTS.md's row read *may still run* | text | **FIXED** — *may still be entered*, ADR 0118 rule 5's and `RN-R13`'s words |

**Re-run after round 2 (`C:/tmp-w191/mut4.log`): 61 probes + 3 controls — 56 KILLED, 5 SURVIVED (D11, D16, D28, M6, M7 —
declared equivalents, by id), controls CLEAN / CRASH / WRONG-REASON, no NO VERDICT, no ABORTED; every file restored, digests
equal.** The L2 suite registers SEVENTEEN cases (`l4-corpus` moved with it).

## Stop-and-asks

None. Every file edited is in `Owns` or is a record-step file (`git diff --name-only` read against the block above: the 14
modified files and 6 new ones, this file and ADR 0118 among them). S-1 (W190's) is fixed here as answered.

## Notes for the plan's Record

- **W190's R6 is no longer an equivalent** (D8): it is KILLED now that an entry map's branch task may declare `needs`.
- **`RN-R13`'s new term is its SIXTH**, not P38's *a fourth retained term* (ADR 0046's own count) nor this file's first
  *fifth*: v0.9's payload, v0.11's gate memory and v0.20's held dispatches came first.
- **Done at the record step, 2026-10-19** (`doc/decisions/**`, `doc/questions/**`): ADR 0117 rule 7 — a dated pointer to ADR 0118 (*`"$item"`
  refused until W191*); ADR 0040 rule 2 and ADR 0046 — a dated pointer each to ADR 0118; **Q166** — a dated note (*"Nothing it
  cannot ask for"* now true one hop in).
- `examples/l6.ts`'s `NOT_YET_AT_L6` is `['item', 'payload']` — W192's to empty.
- M7's probe (`C:/tmp-w191/m/scratch-w191/probe.ts`) is W192's exit clause (2) and (4)'s shape, left in place.
- `test/definition/needs.test.ts`'s case names still read *the five spellings* (seven since this item, six since W190): a
  case NAME is census-bound (`l4-corpus`), so it was left, as W190 left it.

## Record

*Filled 2026-10-19, after both reader rounds. Not committed.*

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| `npm run gate` before the readers (sentence C) | RAN — EXIT 0 | `C:/tmp-w191/gate.log`: every check; `check:docs` 49 `run` / 6 `check`; `check:spec` *C4 covered 45*; L1-L5 84 files / 2094 cases in node, deno and chromium; L6 2767 / 0 failed in node 24.20.0 and deno 2.9.6 |
| `check:docs:selftest` (B′: a snippet added) | RAN — EXIT 0, 24/24 noticed | `C:/tmp-w191/docs-self.log`. `check:budget:selftest` NOT RUN: no always-read document moved |
| L1 the grammar, `innermostMapOf`, FD-V26 retired, FD-V49 at both sites, the wiring check | RAN — green | `test/definition/map-item.test.ts` (7 cases; CRASH on `68f9f3b`, M4) — after the readers, the branch-entry arc, a nested map and a two-producer map in the wiring case |
| L2 composition, the copy claim, retention and release, resume, FD-R4 / S-1, a flow unchanged | RAN — green | `test/driver/map-item.test.ts` (17 cases; 12 of the first 13 RED on `68f9f3b`) — after the readers, a nested join and a map's join fired early, nesting two deep in both orders, a nested branch lost or exited, a map under a fanout, a resume across an ended instance, a zero-item map |
| real-scheduler probe (M7) | RAN — before the readers | node and deno byte-identical; not re-run: the release fix moves no value M7's runs read (liveToken only) |
| conformity reader, round 1 | RAN | C1 BLOCKER (fixed), C2-C6 (fixed / handled) |
| adequacy reader, round 1 | RAN | A1-A5 (fixed, re-cut as R1r, R2r, R7r, R10r, R12r — KILLED); D11, D16, D28 confirmed equivalents |
| release-horizon reader, round 2 | RAN | C1's fix CORRECT over thirteen shapes; R2-1 to R2-5 (cases added; M1, M3, M4, M8 KILLED), R2-6 (M6, M7 declared equivalents), R2-7 (text) |
| the author's probes | RAN, three times | first pass 45 + 3 controls (W3 a gap, fixed); before the readers 42 KILLED / 3 SURVIVED (`mut2.log`); after round 1 52 / 3 (`mut3.log`); **after round 2 61 probes + 3 grader controls: 56 KILLED, 5 SURVIVED (D11, D16, D28, M6, M7 — declared equivalents, by id)**, controls CLEAN / CRASH / WRONG-REASON, no NO VERDICT, digests equal (`C:/tmp-w191/mut4.log`) |
| `npm run gate` after round 1's fixes | RAN — EXIT 0 | `C:/tmp-w191/gate2.log`, L1-L5 2096 cases in three runtimes, L6 2767 / 0 in two |
| **`npm run gate:item`** on the final tree, held still | RAN — **EXIT 0**, one command (`C:/tmp-w191/gateitem.log`) | lint; typecheck; every check, `check:docs` 49 / 6, `check:spec` C4 45; L1-L5 **84 files / 2098 cases** in node 24.20.0, deno 2.9.6 and chromium; L6 2767 / 0 failed in node and deno; selftests 10/10 ok (1036.6 s wall, 9 lanes), `check:register:selftest` left out by `--without`. The record-step files written after it are `doc/decisions/**`, `doc/questions/q166.md` and this Record (`check:register` and `check:markdown` re-run on them, EXIT 0) |

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) regions.ts `innermostMapOf` | yes | V2-V4; the L1 helper case (CRASH without it, M4) |
| (2) validate.ts: FD-V26 retired, FD-V49, the messages | yes | V1, V5-V10; `check:spec` C4 |
| (3) driver.ts `items`, composition, release, FD-R4 / S-1 | yes | D1-D28, H1-H5, M1-M4, M8, R7r, R10r, R12r |
| (4) wiring.ts `"$item"` over the map's item arrival | yes | W1-W5, R1r, R2r |
| (5) spec v0.45 / v0.28, README rows, two invalid examples | yes | `check:spec` (C3, C4, C5); `l4-corpus`; S2 |
| (6) the tests | yes | M4; the probe tables |
| (7) examples/l6.ts `DRIVER_FIELDS`, `NOT_YET_AT_L6` | yes | S1; M2's `cross-row` |
| (8) AGENTS.md and its `run` snippet | yes | `check:docs` (`RUN_FLOOR` 49) |
| (9) ADR 0118 | yes | `check:register`; `check:spec` C5 links |

**Predictions** — all five hold (the table above); prediction 1's *one term* is `RN-R13`'s SIXTH.

**What broke.** Nothing at a rung after READY. The readers found what no rung saw: **C1, a BLOCKER** — the item released on
the instance's own terminal event, while a branch of a join a consumer's policy fired early, nested in the instance, could
still enter a node reading it (a run HALTED on a valid document); every case had used `liveToken`. Round 2 found the fix
correct and four of its clauses unbound (depth, lost/exited uncounting, per-instance counting, nesting deeper than one level).
Before READY: W3, a map with two arrivals, untested; a fixture whose `...extra` spread preceded `edges`, so the first L1 edge
cases tested nothing until the suite failed on it.

**What this taught.** *For the retro*: **a release horizon must be provoked by an early-firing policy AND by nesting depth
greater than one AND per instance with at least two instances** — C1 and A1 were one finding from two readers, and round 2's
M1, M4 and M8 each survived a suite that had one of the three but not the others. A premise sentence like *after which no
node of the instance can be entered* is a claim to construct a counterexample for, not to cite — (e)'s answer was right about
the horizon and wrong about where the event that marks it comes. And a test fixture that SPREADS overrides must spread them
LAST, or the override is silently discarded and the case is vacuous (caught here by a failing assertion, not by review).

**Questions raised.** None (Q705-Q709 SPENT, unissued). **Closed.** None. **S-1** (W190's) fixed, as answered.
**Record step done**: dated pointers to ADR 0118 in ADR 0117 rule 7, ADR 0040 rule 2 and ADR 0046 rule 3; Q166's `note`.

**The readers' overlap.** Round 1: **ONE** — the per-INSTANCE release under a join that fires before every branch is
terminal (the conformity reader's C1, nested; the adequacy reader's A1, the map's own join, and A2 its key). Every other
finding was one reader's alone. Round 2 was a single focused reader: no overlap is measured for it.
