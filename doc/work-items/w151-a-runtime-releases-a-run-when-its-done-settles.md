# W151 — A runtime releases a run when its `done` settles: the driver and its routing entries go, the run id stays (Q513, ADR 0091)

**Status:** in progress — declared 2026-10-09 on `bb612da`, before any file under `Owns` was edited.
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

*Filled in when the item is done.*
