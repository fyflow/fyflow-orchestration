# W67 — A flow from documents, on real workers

**Status:** todo
**Plan:** [P18](../plans/p18-a-flow-and-its-runtime-from-documents-alone.md)

```
Spec:       none — this item writes no rule; it runs P18's sample on a real
            FyflowScheduler in both L6 runtimes and migrates the L6 corpus
Owns:       examples/**
Inputs:     P18's exit-artifact paragraph and its sample (registry, flow, shim, worker
            module), read from the PLAN's own file; W65's grammar and W66's runtime;
            fact 4 (146 nodes, eleven pool keys, every role reading its payload
            whole); examples/l6.ts's ROW_KEYS, CROSS_ROW_SUBJECTS (controls included,
            v0.18) and DECLARED_TOTAL discipline
Outputs:    (1) examples/ rewritten: one worker module per worker under
                examples/workers/, no role switch; a registry document beside the
                flows; run-flow.ts reduced to observers over a runtime — no `pool()`
                call, no hand-built group, no Driver constructed by hand
            (2) the sample flow (`triage`) as L6 rows in both runtimes: a document
                type and a class type, a built-in group and a custom one, a node on
                its type's default instance and one on a named instance, every
                value what the worker RECEIVED from the run — with the pool a task
                ran on asserted off the scheduler (fact 7's readable fields) and the
                discriminating pairs asserted (default against named instance,
                document type against class type deriving the same options)
            (3) every existing L6 row re-derived on `type`: the 22 flows under
                examples/flows/ migrated, every row's claims intact at a RE-TAKEN
                count, with the migration's shape recorded (workers reading `input`,
                or expectations moved — the stop-and-ask's answer)
            (4) what reverting W65, W66 and W67 EACH costs, in L6 failures, on the
                tree this item ships
            (5) examples/README.md and the counts it carries
Depends on: W66
Blocks:     nothing
Tests:      expected values from the sample's documents, from spec/ (FD-C5 for what
            a worker receives, JP-R12 for a join's record) and from the plan's
            decisions, never from output. The default-instance row and the
            named-instance row's pool keys SWAPPED must fail; the class type's
            derivation made to return the document type's options must fail the pair
            clause; a registry document with the runtime's own wiring removed
            (`flows`, `languages`) must fail the rows that transform
Gate:       L6 in both runtimes, redirected and read by exit code, at a re-taken
            count; three revert runs read by failure count; rule 8 over
            ROW_KEYS/CROSS_ROW_SUBJECTS/DECLARED_TOTAL with the controls as members;
            then spec-conformity pass (two readers), rule 8 re-run with their edits
Reserves:   Q289-Q292
```

## Scope

**In**

1. **The exit artifact**, on real workers, in both runtimes, from documents.
2. **The L6 corpus migration** — 22 flows, and the harness losing every hand-built object.
3. **The three revert costs**, taken last on the tree that ships.

**Out**

- **Any rule or refusal** — an exit artifact writes no rule (W43, W47, W51, W55, W59, W63).
- **A second sample flow** — the plan's one carries every shape the exit artifact names; if a
  reader's finding needs another, it is added here, not in a new item.

## Exceptions

*Seeded from the plan's table and from W63's late table.*

| path | why |
|---|---|
| `spec/outcome-record.md` §4, `spec/run-state.md` §7 | predicted from W58's, W59's, W61's and W63's tables: the corpus split moves if the sample flow's task nodes move the count (`test/fold/result-value.test.ts` derives it and compares) |
| `AGENTS.md` §13 | predicted from W63's table: *four worked typed flows run in `examples/`* becomes every flow, and the sentence that counts them moves |
| `scripts/check-markdown.mjs` | predicted NOT to fire: this item adds no document under `doc/`; checked against `M3`'s and `M4`'s fixtures before its record step |
| `scripts/build-browser-tests.mjs` | predicted NOT to fire: it walks `examples/flows/*.json` itself and picks up migrated documents; a registry document beside them is JSON too — checked |

## Verification

| clause | command |
|---|---|
| L6 | `npm run test:l6`, `npm run test:l6:deno`, redirected, read by `$?`; baseline W63's shipped numbers, **1501 assertions over 50 real runs**, re-taken at the declaration |
| revert costs | three L6 runs with W65, W66 and W67 reverted in turn, each read by exit code and failure count |
| readers | conformity: the sample's documents and `FD-C5` first, every expected value re-derived on paper before a row is read; adequacy: isolated copy with `core.longpaths` set, the rows' literals, the pool observers and the pair clauses mutated |

*Routing cases: a branch routed away from its join (Q4) — **covered**, the sample's `classify`
edge; `user_action` (Q17), no matching decision edge (Q10), duplicate task id (Q13), nested
fan-out (Q6) — **covered by the migrated corpus**, whose rows keep their claims; nothing new is
added for them.*

## Record

*Filled in when the item is done.*
