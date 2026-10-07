# W140 — Refusal messages name their class once: the nine classes drop the class name from the message and set their own `name` (Q533)

**Status:** in progress — declared 2026-10-07 on `5cbfbd0`, the first item of P31
**Plan:** P31, `doc/plans/p31-which-open-questions-close-by-a-decision-taken-now.md`

*This file carries NO relative link, deliberately* — W127's note and Q142's mechanism (`M4`). A
linking document here is one more in `check-markdown`'s second `removes` probe tree and can cross
`M4`'s floor, so `check:markdown:selftest` would exit 1 while `check:markdown` stays green. Ids and
paths are bare text.

```
Spec:       none changed. P31 decision 2 (Q533's direction, the maintainer, 2026-10-07) fixes the
            change; OR-R10 (spec/outcome-record.md) and RN-R8 (spec/run-state.md) are what
            `stoppedBy` and `RunFailure` carry, and neither quotes a message (measured, Scope 1)
Owns:       src/driver/driver.ts — the ONLY file under src/driver, src/definition and src/scheduler
            where one of the nine is thrown (measured, Scope 1);
            the tests that pin the messages: test/driver/boundary.test.ts, checkpoint.test.ts,
            fold-inputs.test.ts, lifetime.test.ts, resume.test.ts, driver.test.ts, needs.test.ts,
            gate.test.ts, map.test.ts; test/scheduler/resume.test.ts, test/scheduler/runtime.test.ts;
            examples/l6.ts (the FD-R2 row, the comments that name Q533, DECLARED_TOTAL);
            AGENTS.md ONLY where a snippet or sentence quotes a message — measured: none does;
            and this file (P31's W140 row)
Inputs:     the tree at `5cbfbd0`; Q533's note; W133's Record (the same change for UncloneableResult)
Outputs:    (1) the nine classes — BoundaryRefused, DuplicateTaskId, MissingJoinPolicy,
                MultipleRuns, NotStarted, UndeclaredRoute, UndispatchedTask, UnresolvedMapArity,
                UnresolvedReference — each sets its own `name` (BoundaryRefused already does)
            (2) the eleven message literals that open `<Class>: ` drop that prefix and nothing else
            (3) assertions that each class's `String(e)` names it EXACTLY ONCE and its message does
                not open with it; and, for the five that stop a run (DuplicateTaskId,
                UndeclaredRoute, UndispatchedTask, UnresolvedMapArity, UnresolvedReference), that
                `stoppedBy` and `${kind}: ${message}` name it exactly once — added INSIDE existing
                cases, so no L1-L5 case count moves (P31 prediction 4)
            (4) L6's `map / FD-R2 — over names no array` row declares `stoppedByNamesItOnce: true`;
                DECLARED_TOTAL 2465 -> 2466 by arithmetic (one clause on one row), before L6 re-runs
            (5) the 23 `throws(…, '<Class>', …)` call sites still assert the class (see Exceptions)
            (6) l6.ts's comments at the `stoppedByNamesItOnce` declaration and the `runFailure`
                block, which say nine classes still self-name, made true of the new tree
            (7) Q533 resolved, `resolved-by` starting "P31 W140 —"
Depends on: nothing
Blocks:     W142 (P31 decision 5: serial on one tree)
Tests:      (3) and (4). Expected values come from P31 decision 2 — the message is the old
            literal less its `<Class>: ` prefix, `String(e)` is `<Class>: <message>`, `stoppedBy` is
            `<Class>: <message>` (driver.ts's `${constructor.name}: ${message}`) — never from output
Gate:       L0-L6 (L0-L5 in Node, Deno and Chromium; L6 in Node and Deno); rule 8 on every
            output; the conformity and adequacy readers (P31 decision 6); `npm run gate:item`
            EXIT 0 once, on a still tree (P31 decision 4)
Reserves:   Q553-Q555. No ADR. No W beyond W140
```

**Exceptions** — declared 2026-10-07, before the first edit (`doc/workflow.md` section 7 rule 2):

| file | the edit | why |
|---|---|---|
| `examples/README.md` | the two current L6 count copies `check-docs`' `X10` compares (lines ~38 and ~70), each with the one-clause history parenthetical every copy there carries (W140 as bare text, no link) | output (4) moves `DECLARED_TOTAL`, and `X10` is red until both copies follow. No run is added, so `DECLARED_RUNS` does not move |
| `test/definition/l4-corpus.test.ts` | a suite name appended to `LATE_SUITES` — **ONLY if** this item adds an L1-L5 suite | the L1 census holds suite names both ways. Output (3) is planned inside existing cases, so this row is expected to stay unused; it is declared so a late suite is not a late exception |
| `test/harness.ts` | **YES — the maintainer, 2026-10-07, option (A), written here before the edit.** One line: `throws` matches against the error's own render, `${e.name}: ${e.message}`, rather than `e.message` alone | 23 call sites in 8 test files (a 24th grep hit, fold-inputs.test.ts:394, is a comment — the adequacy reader, finding 3) (boundary, checkpoint, driver, fold-inputs, lifetime, needs and resume under test/driver, and test/scheduler/resume) match the class name (`throws(() => d.start({}), 'MultipleRuns', …)`) and read it out of the MESSAGE prefix this item removes. Section 1 rule 6: asked to widen after the measurement; option (B), rewriting the 23 sites inside Owns, was not chosen. A rule-8 probe reverts this line |

## Scope

**In**

1. **Measure first.** Grep every `new <Class>(` whose message opens with `<Class>: `, and every
   test, L6 row, `AGENTS.md` snippet or spec sentence that quotes one of those messages or
   reads the class out of one. The change set is known before any edit (the measurement is in
   the Record).
2. **Change the nine classes**: each sets its own `name`; each message drops the prefix. Then the
   tests that pin the messages, then the added assertions (output 3), then the FD-R2 row and
   `DECLARED_TOTAL` by arithmetic.
3. **Rule 8 on every output**, in a harness under `dev-dist/w140-2595/`, including W133's p12 (the
   driver dropping the class from `stoppedBy`), which must now be caught on the FD-R2 row too.
4. Grep the tree for `W140`, `Q533` and every withdrawn sentence (*nine refusal classes … still
   open/begin with their own class name*), excluding `dev-dist/`.

**Out**

- `driver.ts`'s `stoppedBy` and `RunFailure.kind` construction (`err.constructor.name`): unchanged —
  it supplies the class name, which is the point.
- `NoMatchingEdge`, `InvalidRunId`, `UnresolvedBranchPath` and `ResumeRefused`'s `(format):` form:
  not among the nine, and Q533 names them as not self-naming.
- Historical plan and item files quoting an old render (`doc/plans/p6`, `p13`, W85): records of
  their own time, not claims about the current tree.
- P31's other items.

## Verification

- **L0-L5**: `npm run gate` covers them in all three runtimes; L6: `npm run test:l6`,
  `npm run test:l6:deno`. Every rung is RUN and never piped: `cmd > log 2>&1; echo "EXIT=$?"`.
- **Rule 8**: restore one prefix per class, drop one `name` per class, drop the class from
  `stoppedBy` (W133's p12), drop `stoppedByNamesItOnce` from the FD-R2 row, and break the
  harness change if it lands; a no-op control, a CRASH grader and a WRONG-REASON grader; every
  anchor checked against the current text, every edit asserted to change its input, restore to
  the first snapshot byte for byte, a digest before and after.
- **Readers**: conformity (P31 and the spec first, then the code; reports, does not fix) and
  adequacy (the spec first, then the tests; mutates only in an isolated COPY, `find <copy> -type l`
  before any removal), fresh contexts, differed briefs, the tree still.
- **Confirming gate**: `npm run gate:item > dev-dist/w140-2595/item.log 2>&1; echo "EXIT=$?"`,
  once, on the final tree.
- **Routing cases** (template): a duplicate task id (Q13) is IN — `DuplicateTaskId` is one of the
  nine and its stop is asserted. Routed-away, `user_action`, no-matching-edge and nested fan-out
  are not applicable: no routing changes.

## Record

*Filled in when the item is done.*
