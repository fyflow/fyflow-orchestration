# W140 — Refusal messages name their class once: the nine classes drop the class name from the message and set their own `name` (Q533)

**Status:** done — declared 2026-10-07 on `5cbfbd0`, the first item of P31; built, both readers and the fix round done 2026-10-07
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
| `test/definition/map.test.ts` | **YES — the maintainer, 2026-10-07, written here before the edit.** Comment only, at ~622-623: `throws()` matches `${name}: ${message}`, and the `instanceof` check stays because it is stronger | the conformity reader's finding 6: the comment says `throws()` matches on the message, false since the `test/harness.ts` row above |
| `test/driver/nested-regions.test.ts` | **YES — the maintainer, 2026-10-07, written here before the edit.** Comment only, at ~965: the quoted text is the `${kind}: ${message}` render | the conformity reader's finding 7: `h.failures` holds `{kind, message}`, and since this item the message alone no longer opens with the class |

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

*Filled in 2026-10-07 on `74d3487`. The tree was held still from the confirming gate to this Record:
`git status --short` was empty before and after the gate (`tree-before-item.txt`).* Scratch is
`dev-dist/w140-2595/` (this item's shell pid), which holds every log and script named below. Node v24.20.0
by `fnm use 24` in every shell, Deno 2.9.6. Every rung was redirected and its EXIT read in the same command,
never piped. Ids here are bare text, as the header says.

### Gate

| command | EXIT | reading |
|---|---|---|
| `npm run gate:item > dev-dist/w140-2595/item.log 2>&1; echo "EXIT=$?"` | **0** | run ONCE, on `74d3487`, after both readers' fixes and rule 8's last pass; 0 `FAIL` lines |
| — L0 (lint, typecheck) | 0 | inside the gate |
| — L1-L5 | 0 | **1528** cases in node 24.20.0, deno 2.9.6 and chromium (parity 1528): **unchanged**. Every added assertion sits inside an existing case, so prediction 4 held for cases |
| — L6 | 0 | **2466** assertions over **162** real runs, in node and in deno. The +1 is the FD-R2 row's `stoppedByNamesItOnce` clause. It was derived in `l6.ts`'s comment above `DECLARED_TOTAL` before the file was re-run, and the first run read 2466 |
| — self-tests | 0 | 10/10 lanes ok, 845.0 s wall, `check:register:selftest` left out (workflow v0.29; this item edits none of the files that would bring it back) |
| `npm run gate` on an earlier tree | 0 | `gate1.log`, the ladder only, before the resume-door assertion and the readers' fixes |

L7 did not run, because no person looked at a trace. This item changes no trace.

### Scope 1 — the measurement, before any edit

- **Where the nine are thrown.** All nine are thrown only in `src/driver/driver.ts`, from **eleven** literals that open `<Class>: `. BoundaryRefused and MultipleRuns have two each. Nothing under `src/definition` or `src/scheduler` throws them.
- **What reads the message.** No spec rule quotes one of these messages, and no check under `scripts/` counts message text, so prediction 4 was not threatened. `AGENTS.md` needs no edit: its one quote, `reason: 'DuplicateTaskId: x'`, is a hand-written fold input and is already in the once-form.
- **What read the class out of the prefix:** `throws(…, '<Class>', …)` in `test/harness.ts`, which matched `e.message` alone. The grep counted 24 such sites. The adequacy reader found that one of them (fold-inputs.test.ts:394) is a comment, so there are **23** call sites, in 8 files (`count-throws.mjs`). That is what made the first stop-and-ask necessary.

### Outputs

| | output | where | what fails without it |
|---|---|---|---|
| (1) | each of the nine sets its own `name` | `src/driver/driver.ts` (eight new constructors; BoundaryRefused already did) | probes n-* (9 of 9 CAUGHT), a1-UR, a1-UT |
| (2) | the eleven literals lose `<Class>: ` and nothing else | `src/driver/driver.ts` | probes p-BR1 … p-UREF (11 of 11 CAUGHT); a2-MJP CAUGHT; a2-NS and a2-UT are declared survivors (below) |
| (3) | `String(e)` names the class EXACTLY once and the message opens with what was refused; for the five run-stopping classes `stoppedBy` and `${kind}: ${message}` name it once | inside existing cases in the boundary, checkpoint, driver, gate, lifetime, map, needs and resume `.test.ts` files | p-MR1-end, p-UMA-end, p12, p13, a4-l2 |
| (4) | the FD-R2 row's `stoppedByNamesItOnce`; `DECLARED_TOTAL` 2466 | `examples/l6.ts`, and both `examples/README.md` copies | p-row, p-row-p12, p-UMA (the row's Q63 clause), p12 |
| (5) | the 23 class-matching `throws` sites still assert the class, now through `name` | `test/harness.ts`, answer (A) | p-harness (16 cases red) |
| (6) | l6.ts's two Q533 comments true of the new tree | `examples/l6.ts` | a comment; the conformity reader read both (finding 8) |
| (7) | Q533 resolved | `doc/questions/q533.md` | the record step |

### Exceptions, reconciled to `git status --short` to the path

Sixteen paths, counted after the record step.

- **Owns, 12.** `src/driver/driver.ts`; eight `test/driver` files: boundary, checkpoint, driver, gate, lifetime, map, needs and resume `.test.ts`; `examples/l6.ts`; and this file. Of the declared Owns, `test/driver/fold-inputs.test.ts`, `test/scheduler/resume.test.ts` and `test/scheduler/runtime.test.ts` were NOT edited, and neither was `AGENTS.md` (no snippet or sentence quotes a message).
- **Exceptions, 4, each written before its edit.**
  - `examples/README.md` was declared at the start.
  - `test/harness.ts`, `test/definition/map.test.ts` and `test/driver/nested-regions.test.ts` each needed a YES from the maintainer under workflow section 1 rule 6. Each YES was written into its row before the file was touched.
  - The `test/definition/l4-corpus.test.ts` row was not used, because no suite was added.
- **Record step, 2.** P31's plan file (its Record and status line) and `doc/questions/q533.md`. `README.md` was not edited: no copy of a moved figure lives there. `doc/decisions/**` was not touched.

### Rule 8 — two passes and a re-grade, the last on the tree that shipped

Harness: `rule8.mjs`, adapted from W133's. It works as follows:
- an anchor must match ONCE in the CURRENT text, and the edit must change it;
- each touched file is restored to its FIRST snapshot and compared back byte for byte;
- a digest over every tracked and untracked-unignored file is taken before and after;
- node 24 is asserted;
- the set includes a no-op control, a CRASH grader and a WRONG-REASON grader;
- each probe declares the full SET of named failures it must trip.

```
pass 1    31 probes: 28 as declared,  3 against declaration   digest e0a5ae46e7f7c58a IDENTICAL
pass 1b    3 probes:  3 as declared                            digest e0a5ae46e7f7c58a IDENTICAL
pass 2    39 probes: 39 as declared,  0 against declaration   digest 0eea6136e4c9a191 IDENTICAL
```

**Pass 1's three were all the GRADER's.**
- `g-crash`: since W132 the L1 runner names a file it cannot import, so a syntax error is no longer zero named failures there. The CRASH grader moved to the L6 rung.
- `g-wrong` and `p-MJP` ABORTED: the MissingJoinPolicy anchor also matched the `InvalidDefinition` message beside it, and was lengthened.
- Pass 1b re-ran exactly those three on the same tree.

**W133's p12 — the driver dropping the class from `stoppedBy` — is CAUGHT on the `map / FD-R2 — over names no array` row**, by both its OR-R10 `startsWith` clause and its Q63 once-clause. That is the masking Q533 recorded, and it is gone.

**Pass 2 added the readers' exact edits.** Four **declared survivors and ceilings, by id**:
- **a2-NS** and **a2-UT**: a message BODY cut. No test pins the whole of these two literals. The second route is the conformity reader's finding 2, which read every hunk and found only the prefix gone.
- **a4-l6**: `RunFailure.message` given the class prefix stays green at L6. P31 declares only `stoppedByNamesItOnce` there, and a4-l2 catches the same edit at L2, in 8 cases.
- **a5**: `throws()` over-matching, with the constructor name prepended. This is the stated limit of answer (A).

**The vacuity check the maintainer asked for.** `throws` was instrumented, with a temporary edit restored byte for byte, and `npm test` was run (`vac.txt`).
- Every site that matches through `e.name` and not the message matches its own class name. The adequacy reader measured the same 23 independently.
- One match string is EMPTY, at `test/driver/gate.test.ts:286`, so it matched any message before W140 as well. W140 does not move it, and it is not acted on.

### The readers — both fresh contexts, spec first, tree still, briefs written apart

**Conformity** (10 findings: 7 hold, 1 should-fix, 2 notes):
- 1-5 and 8-9 hold. Those were the nine names, the eleven sites, the coverage of the added assertions, Owns against status, the harness row, the tree-wide sentences, and the L6 arithmetic.
- (3, note) the comment saying `resolve()`'s rethrown error is the reported cause was asserted by nothing. **Fixed**: it is now asserted `===`.
- (6, should-fix) `test/definition/map.test.ts:622` said `throws()` matches on the message, which is false since the harness change. **Fixed** after a stop-and-ask: YES, comment only.
- (7, note) `test/driver/nested-regions.test.ts:965` quoted the old message as `h.failures`. **Fixed** after a stop-and-ask: YES, now quoted as the `${kind}: ${message}` render.
- (10) Q533 not yet resolved: done at the record step.

**Adequacy** (about 40 mutations in an isolated `cp -r` copy; `find -type l` empty before and after; copy left in place; 1 should-fix, 4 notes):
- (1, should-fix) a SUPERSTRING `name` (`'UndeclaredRouteError'`, `'UndispatchedTaskError'`) survived. **Fixed** with exact `.name` asserts (a1-UR, a1-UT CAUGHT).
- (2) "nothing else" in the messages was unpinned. **Fixed** for MissingJoinPolicy with an `endsWith` (a2-MJP CAUGHT); a2-NS and a2-UT are declared survivors.
- (3) 23, not 24, sites. **Fixed** in this file.
- (4) `${kind}: ${message}` is held at L2 only. **Kept and stated**: a4-l2 CAUGHT, a4-l6 a declared ceiling.
- (5) `throws` over-match is unguarded. **Kept**, as declared survivor a5.

**The overlap is FOUR shared subjects, the eighty-fourth measurement**:
1. the harness `throws` render (conformity 5; adequacy 5);
2. the count of `throws` sites (conformity 5 confirmed 24; adequacy 3 found 23);
3. the added once-assertions (conformity 3; adequacy 1);
4. the eleven message bodies (conformity 2; adequacy 2).

### What broke

1. **A file outside Owns was needed after the measurement.** P31's row did not name `test/harness.ts`, and `throws` read the class out of the very prefix this item removes. It was asked, not raised (rule 6), and answered (A).
2. **The readers found two more comments outside Owns** that the change made false or ambiguous. Both were asked and answered YES. Scope 1's grep looked for message TEXT, not for sentences about how `throws` matches.
3. **The site count was off by one.** The counting script read `throws(` inside a comment.
4. **The grader was wrong three times in pass 1.** One crash was no longer a crash (W132's runner change), and one anchor was not unique. The probes were right each time.

### What this taught

- **A message change drags the test helper that reads messages.** The next item that changes refusal text can name `test/harness.ts`'s `throws` at declaration.
- **Since W132, a CRASH grader on the L1 runner is not a crash.** The runner names an unloadable file, so the crash probe belongs on a rung that does not, here L6.

### Questions closed and raised (workflow section 1 rule 6)

- **Closed: Q533**, `resolved-by` "P31 W140 — …".
- **Raised: none.** Three stop-and-asks were each answered YES before the edit. The empty match string at gate.test.ts:286 is recorded here and not raised, because it is outside this item's subject and moves nothing. Q553-Q555 are unissued.
