# W132 — The test harness: a suite the runner cannot import is one named FAIL (Q272), and the definition gate suite names its cases at the call site (Q382)

**Status:** in progress — declared 2026-10-07 on `2faf288`, the third item of P30
**Plan:** P30, `doc/plans/p30-which-open-questions-close-by-a-fix-already-named.md`

*This file carries NO relative link, deliberately*, as W133's and W131's do — Q142's mechanism. A
linking document here is one more in `check-markdown`'s second `removes` probe tree and can cross
`M4`'s floor. Ids and paths are bare text.

```
Spec:       none changes. The rules are doc/workflow.md section 5 rules 7 and 8; P30's W132 index
            row, decisions 6, 7 and 8, prediction 2, and its Out section's "Q272 in the browser"
Owns:       test/runner.ts, test/definition/gate.test.ts, and the checked-in provocation for
            Q272, which is two files OUTSIDE the runner's default glob (neither ends `.test.ts`):
            test/provocations/throws-on-import.ts (a suite that throws on import) and
            test/provocations/q272.ts (runs the runner on it, clean and provoked, and grades the
            pair); and this file (P30's index row)
Inputs:     the tree at `2faf288` (W133 and W131 done); P30 decisions 6, 7, 8 and prediction 2;
            Q272's and Q382's own files; test/driver/gate.test.ts as the call-site model
Outputs:    (1) Scope 1's measurement, recorded BEFORE any edit: what test/runner.ts does today
                when one suite throws on import, in node and deno — exit code, FAIL lines, and
                whether the other suites run — and what `test:browser` and Chromium itself do
                with the same suite (P30 Out: stated, measured, not fixed)
            (2) test/runner.ts imports each suite inside its own `try`: a suite it cannot import
                is ONE `FAIL` line naming that file, every other suite still runs, and the run
                exits 1 (Q272). The `N file(s), M assertions` line keeps its shape, since
                scripts/run-browser-tests.mjs reads M from it as its parity baseline
            (3) test/runner.ts accepts `--with <path>`, an extra suite file outside the glob, so
                the provocation reaches the runner without a `.test.ts` name the normal runs see
            (4) test/provocations/throws-on-import.ts and test/provocations/q272.ts, runnable as
                `node test/provocations/q272.ts` and
                `deno run --allow-read --allow-run test/provocations/q272.ts`: the clean run exits
                0 with no FAIL line; the provoked run exits 1 with EXACTLY one FAIL line, naming
                throws-on-import.ts, and the SAME case count as the clean run (section 5 rule 7
                (a)-(c): checked in and runnable, asserts its input changed, declares the full set)
            (5) test/definition/gate.test.ts: the 17 cases named at the call site, as
                test/driver/gate.test.ts names its 20, with DECLARED_CASES kept as the second copy
                its membership case compares both ways; the case count does not move (Q382)
            (6) Q272 and Q382 resolved, `resolved-by` starting "P30 W132 —"
Depends on: W131 (P30 decision 7: serial on one tree)
Blocks:     W134
Tests:      (4) is the test of (2) and (3), and its expected values come from Q272's own sentence
            and P30's row — one named FAIL, EXIT 1, the other suites run — never from a run. (5)'s
            test is the suite's own membership case, unchanged in what it asserts, plus the
            counts: 1528 L1-L5 cases in node, deno and chromium before and after, and the L1
            census's 17 for the W92 suite
Gate:       L0-L5 in node, deno and chromium (`npm run gate`, which also runs L6 in node and
            deno), the case count unchanged; Q272's provocation in node and deno showing one named
            FAIL and EXIT 1; rule 8 over every output in dev-dist/w132-63479/; one conformity
            reader (P30 decision 8); `npm run gate:full` EXIT 0 once, on a still tree, after the
            reader's fixes
Reserves:   Q541-Q545. No ADR (P30's block 0085-0086 is spent). No W beyond W132.
            (Q537-Q540 were W131's, spent unissued)
```

**Exceptions**: none declared. **W133's drag files were checked up front and none applies**: no new
suite enters the default glob (the provocation suite throws before it registers one, and it is not a
`.test.ts`), so `test/definition/l4-corpus.test.ts`'s census does not move; no case is added,
removed or renamed — the 17 names keep their exact text, only where they are written moves — so no
`DECLARED_CASES` list and no L1 case count moves; and no spec is bumped, so `spec/README.md` does not
move. `scripts/run-browser-tests.mjs` reads the runner's count line and is NOT edited: output (2)
keeps that line's shape. Any file edited outside `Owns` and outside the record step is declared here
before its first edit, and anything outside `Owns` that a fix needs is P30 stop-and-ask (g), asked
first.

## Scope

**In**

1. **Measure first.** Copy throws-on-import.ts into the glob as a temporary `.test.ts` and run
   `node test/runner.ts`, `deno run --allow-read test/runner.ts` and `npm run test:browser`, each
   redirected with its EXIT read; and run the bundle in Chromium directly, because
   run-browser-tests.mjs takes its baseline from the node runner and so may never reach the browser.
   Remove the copy, and show the tree back byte for byte.
2. **Q272.** The `try` per import, the named FAIL, EXIT 1, and the `--with` option; then the
   provocation, run in node and deno.
3. **Q382.** Each `test(DECLARED_CASES[i]!` becomes `test('<the same text>'`. The counts before and
   after, in node, deno and chromium. If a rename changed an identity some check or DECLARED_CASES
   list counts, that is prediction 2's reversal: STOP and ask.
4. **Rule 7 for each new clause and rule 8 on every output**, in a harness under
   dev-dist/w132-63479/.
5. Grep for `W132`, `Q272`, `Q382` and every withdrawn sentence or number, excluding `dev-dist/`.

**Out**

- **Q272 in the browser** (P30 Out): scripts/build-browser-tests.mjs and
  scripts/run-browser-tests.mjs are not edited. Scope 1 states what they do.
- **Wiring the provocation into `npm run gate`**: package.json is outside `Owns`. The provocation is
  checked in and runnable by the commands in output (4).
- The other P30 questions, and W134.

## Verification

- **L0-L5**: `npm run gate` (lint, typecheck, the checks, `npm test`, `test:deno`, `test:browser` in
  chromium) and L6 in node and deno, inside it. Each rung RUN, never piped:
  `cmd > log 2>&1; echo "EXIT=$?"`.
- **The provocation**: `node test/provocations/q272.ts` and
  `deno run --allow-read --allow-run test/provocations/q272.ts`, each EXIT 0 meaning the provoked
  runner did what Q272 says.
- **Rule 8**: break each output's clause — the `try` removed, the FAIL line unnamed, the exit code
  left 0, the loop stopped at the first failure, a call-site name changed, deleted or duplicated — and
  watch the provocation or the suite go red for the reason it names. *A call-site name SWAPPED with its
  neighbour's cannot go red: the membership compares sets and a length. It is declared survivor S2, and
  the call-site form puts it in front of a reader instead (the conformity reader's finding 4).*
- **Reader**: one conformity reader, fresh context, P30 and this file first, then the code; it reports
  and does not fix, and the tree holds still while it reads.
- **Confirming gate**: `npm run gate:full > dev-dist/w132-63479/full.log 2>&1; echo "EXIT=$?"`, once,
  on the final tree.
- **Routing cases** (template): not applicable. This item changes the test harness, not routing.

## Record

*Filled in when the item is done.*
