# W145 — The browser lane reports a Node baseline that RAN and failed as that, naming its failures (Q541)

**Status:** in progress — declared 2026-10-08 on `b9dd0c8`, the fourth item of P31
**Plan:** P31, `doc/plans/p31-which-open-questions-close-by-a-decision-taken-now.md`

*This file carries NO relative link, deliberately* — W127's note and Q142's mechanism (`M4`), as in
W140's, W141's and W142's files. Ids and paths are bare text.

```
Spec:       none changes. P31 decision 3 fixes the direction: Q541's own closes-when — a node
            baseline that RAN and exited non-zero is reported as that, naming its failures, and
            the advice "run `node test/runner.ts` first" stays only for a baseline that could not
            run at all. RT-R1 (spec/runtime-targets.md: the SAME suites in all three runtimes,
            parity against node) binds it and its text does not move
Owns:       scripts/run-browser-tests.mjs (P31's W145 row); its provocation,
            test/provocations/q541.ts — OUTSIDE the runner's glob and the browser bundle's (not a
            `.test.ts`), as W132's q272.ts is; and this file
Inputs:     the tree at b9dd0c8 (W140, W142, W141 done); Q541's file; W132's Record (its Scope 1
            measurement and its conformity reader's finding 5, which raised Q541);
            test/runner.ts's count line and failure list, read and NOT edited;
            test/provocations/throws-on-import.ts, reused and NOT edited
Outputs:    (1) the measurement, BEFORE any edit to run-browser-tests.mjs, each command's EXIT
                read in the same command: what `npm run test:browser` prints and exits (a) with a
                Node baseline that RAN and exited 1 (throws-on-import.ts copied into the glob as a
                temporary `.test.ts`, as W132 did), (b) with a baseline that could not run at all
                (no test/runner.ts: a byte copy of the script under a scratch root that has none),
                and (c) chromium given a bundle that throws on import while the baseline is green
                — how long it waits and what it names
            (2) run-browser-tests.mjs: a baseline whose output carries the runner's count line
                RAN. One that ran and exited non-zero is reported as that — its exit code, and
                the runner's own report from its count line on, which names every failure — and
                the lane exits 1 without starting a browser. The advice is printed only when the
                runner produced no count line and did not exit 0. A baseline that exits 0 with no
                count line keeps its own message
            (3) Q541's second clause, MEASURED against (2): whether the fix reaches a bundle that
                throws on import. If the fix to it is small and inside Owns, it is made: a
                `pageerror` before the suite reports ends the wait at once and names the error,
                instead of a 60 s timeout; a run with no `pageerror` is unchanged. Otherwise it is
                stated in the Record
            (4) test/provocations/q541.ts, runnable as `node test/provocations/q541.ts`: under a
                per-process scratch root it runs a BYTE COPY of the real script (asserted
                identical) in each case and compares each case's full SET of report lines, rule 7
                (a)-(c). Node only: run-browser-tests.mjs is a Node script. *Amended at the fix
                round (the conformity reader's finding 2: the four letters declared here no longer
                matched the file).* The cases as built: A, the real runner plus
                throws-on-import.ts (ran and failed); B, no runner (could not run); C, a runner
                that dies before its count line (advice); D, exit 0 and no count line ("could not
                read"); E, a green baseline and a bundle that throws on import; F, the CONTROL,
                EXIT 0; G, a console error that must not shorten the wait; H, a page error from a
                suite that goes on to report, whose report must be kept
            (5) Q541 resolved, `resolved-by` starting "P31 W145 —"
Depends on: W141 (P31 decision 5: serial on one tree)
Blocks:     W144
Tests:      (4) is the test of (2) and (3). Its expected values come from Q541's closes-when and
            P31 decision 3 — the baseline's failure is NAMED (throws-on-import.ts and
            `could not be imported`, from W132's runner contract), the advice is absent where the
            runner ran and present where it did not, the exit is 1 — and, for (3), from the page
            error the fixture bundle throws, written into the fixture, never read back from a run
Gate:       L0-L5 in node, deno and chromium (`npm run gate`, L6 in node and deno inside it);
            the provocation EXIT 0; rule 8 on every output in dev-dist/w145-14690/; one
            conformity reader (P31 decision 6); `npm run gate:item` EXIT 0 once, on a still tree
            (decision 4)
Reserves:   Q562-Q564. No ADR. No W beyond W145
```

**Exceptions**: none declared. **The drag files, checked up front, and none applies**:

| file | why it does not move |
|---|---|
| `scripts/check-wiring.mjs` | it reads run-browser-tests.mjs's `const BUNDLE = join(ROOT, 'dev-dist', 'browser', 'tests.js');` line by text; that line is kept byte for byte |
| `scripts/check-source.mjs`, `scripts/check-source-selftest.mjs` | they read the `test:browser` script in package.json, which does not change |
| `scripts/build-browser-tests.mjs`, `test/runner.ts`, `test/provocations/throws-on-import.ts` | read, never edited: the runner's count line and failure list are the contract (2) parses |
| `package.json` | the provocation is not wired into any gate script — P31 Out: no change to what `gate:item` or `gate:full` runs |
| `test/definition/l4-corpus.test.ts` | q541.ts is not a `.test.ts`, so no suite enters the glob and the census does not move |
| `CLAUDE.md`, `spec/runtime-targets.md` | their sentences about run-browser-tests.mjs (chromium only; RT-R1) stay true |

Any file edited outside `Owns` and outside the record step is asked first (workflow section 1 rule 6;
P31 decision 7), and its YES is written here before the edit. **No check reads run-browser-tests.mjs's
message text** (a grep over `scripts/`, `test/` and `examples/` on `b9dd0c8`); one that did would be a
stop.

## Scope

**In**

1. **Measure first**, output (1), on `b9dd0c8`, and show the tree back byte for byte.
2. **The baseline**, output (2).
3. **Q541's second clause**, output (3): measured, and fixed only if small and inside `Owns`.
4. **The provocation**, output (4), and rule 8 on every output in a harness under
   dev-dist/w145-14690/.
5. Grep for `W145`, `Q541` and every withdrawn sentence, excluding `dev-dist/`.

**Out**

- **Wiring the provocation into a gate script**: `package.json` and what `gate:item` / `gate:full`
  run are P31 Out.
- **Running the browser after a failed baseline**: the lane stops at the baseline as it does today;
  only what it SAYS changes. A browser run against a failing baseline would change what the lane
  does, which Q541 does not ask.
- **firefox and webkit**: (3) is measured in chromium, which is what `npm run gate` runs.
- The other P31 questions.

## Verification

- **L0-L5**: `npm run gate` (lint, typecheck, the checks, `npm test`, `test:deno`, `test:browser` in
  chromium), L6 in node and deno inside it. Each rung RUN, never piped: `cmd > log 2>&1; echo "EXIT=$?"`.
- **The provocation**: `node test/provocations/q541.ts`, EXIT 0 meaning each case printed exactly the
  set of lines the decision names.
- **Rule 8**: break each output's clause — the ran/not-ran split collapsed either way, the runner's
  report not printed, the exit left 0, a browser started after a failed baseline, the count line's
  predicate narrowed or widened, the `pageerror` race removed or made to fire on a console error — and
  watch the provocation go red for the reason it names; a no-op control, a CRASH grader and a
  WRONG-REASON grader.
- **Reader**: one conformity reader, fresh context, P31 and Q541 first, then the code; it reports and
  does not fix, and the tree holds still while it reads.
- **Confirming gate**: `npm run gate:item > dev-dist/w145-14690/item.log 2>&1; echo "EXIT=$?"`, once,
  on the final tree.
- **Routing cases** (template): not applicable. This item changes the browser lane, not routing.

## Record

*Filled in when the item is done.*
