# W132 — The test harness: a suite the runner cannot import is one named FAIL (Q272), and the definition gate suite names its cases at the call site (Q382)

**Status:** done — declared 2026-10-07 on `2faf288`, the third item of P30; built, the reader and the fix round done 2026-10-07
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

*Filled in 2026-10-07 on `c72e704`, held still from the confirming gate to this Record.* Scratch
`dev-dist/w132-63479/` (this item's shell pid): every log and script named below. Node v24.20.0 by
`fnm use 24` in every shell, Deno 2.9.6; every rung redirected, its EXIT read in the same command, never
piped. Ids here are bare text, as the header says.

### Gate

| command | EXIT | reading |
|---|---|---|
| `npm run gate:full > dev-dist/w132-63479/full.log 2>&1; echo "EXIT=$?"` | **0** | run ONCE, on `c72e704`, after the reader's fixes and rule 8's pass 2; 0 `FAIL` lines; `git status --short` empty before and after (`tree-before-full.txt`); 09:35 to 10:16 |
| — L1-L5 | 0 | **1528** cases in node 24.20.0, deno 2.9.6 and chromium (parity 1528): **unchanged** |
| — L6 | 0 | **2465** assertions over **162** real runs, node and deno: unchanged |
| — self-tests | 0 | 11/11 lanes ok, 2328.8 s wall |
| `node test/provocations/q272.ts`; `deno run --allow-read --allow-run test/provocations/q272.ts` | 0, 0 | every clause held: one named `FAIL`, EXIT 1, 1528 cases run both ways — and as rule 8's controls `c-q272` and `c-q272-deno` in pass 2 |

**After the record step** (four doc files a check reads): `npm run gate` EXIT 0 (`gate-record.log`, 1528
in all three, 162 L6 runs) and `npm run check:markdown:selftest` EXIT 0 (`md-selftest.log`, Q541 being a
new markdown file); `check:register:selftest` was not re-run alone, `gate:full` having run it at `c72e704`.

L7 did not run; this item changes no trace. **Prediction 2 held**: 1528 L1-L5 cases before (`npm test`,
`test:deno`, `test:browser` on `2faf288`'s two files, `base-node.log`, `base-deno.log`,
`browser-before.log`) and after, in all three; the L1 census still counts 17 for the W92 suite.

### Scope 1 — the measurement, before any edit to the runner

`bash dev-dist/w132-63479/measure.sh before`: the provocation copied into the glob as a temporary
`.test.ts`, each command run and its EXIT read, the copy removed, the tree's digest identical before and
after (`measure-before.txt`). Repeated as `measure.sh after` on `c72e704` (`measure-after.txt`).

| command | before W132 | after W132 |
|---|---|---|
| `node test/runner.ts` | EXIT 1, a stack trace through `runner.ts:38`, **0 `FAIL` lines, 0 cases run** | EXIT 1, **1** `FAIL` line naming the file, **1528** cases run and ok, `1 file(s) could not be imported`, `1 FAILURE(S)` |
| `deno run --allow-read test/runner.ts` | EXIT 1, `Uncaught (in promise) SyntaxError`, **0 `FAIL` lines, 0 cases** | the same as node |
| `npm run test:browser` | EXIT 1 at `could not establish the Node baseline — run node test/runner.ts first`: chromium never starts | **the same**: run-browser-tests.mjs takes its baseline from the node runner and any non-zero exit stops it there. Its advice is now wrong — the runner HAS run — raised as Q541 |
| the bundle in chromium directly (`chromium.mjs`) | a `pageerror` naming the JSON error and no result: the bundle is one module and the throw stops its evaluation, so no suite runs and `__FYFLOW_RESULT__` is never set; the 60 s wait times out | the same — P30 Out: not fixed. *`chromium direct EXIT=0` in both files is the measuring script's exit, not chromium's* |

**What *one named FAIL* means for a whole run.** The provocation is not in the L1 census, so the runner's
line is the only `FAIL`. A DECLARED suite that fails to import also fails the census
(`l4-corpus.test.ts`: *a declared suite did not run*), so `npm test` then prints two `FAIL` lines: the
runner's, naming the file, and the census corroborating it. Q272's *one named FAIL* is the runner's own
report (the conformity reader's finding 7; derived, not run — it needs a declared suite broken).

### Outputs

| | output | where | status |
|---|---|---|---|
| (1) | the measurement, before and after | above; `measure-before.txt`, `measure-after.txt` | built |
| (2) | each import in its own `try`; one named `FAIL`; exit 1; the other suites run; the count line's shape kept | `test/runner.ts` | built; widened by the fix round (`describe`, the summary line) |
| (3) | `--with <path>`, imported FIRST | `test/runner.ts` | built |
| (4) | the provocation and its grader, runnable in node and deno | `test/provocations/throws-on-import.ts`, `test/provocations/q272.ts` | built |
| (5) | 17 call-site names, byte-identical to `DECLARED_CASES` (the reader's `q382-compare.mjs`) | `test/definition/gate.test.ts` | built |
| (6) | Q272 and Q382 resolved | `doc/questions/` | the record step |

### Exceptions, reconciled to `git status --short` to the path

Nine paths across the item's commits and the record step. **Owns, 5**: `test/runner.ts`,
`test/definition/gate.test.ts`, `test/provocations/throws-on-import.ts`, `test/provocations/q272.ts` and
this file. **Exceptions, 0**: none of W133's drag files applied, as declared. **Record step, 4**: P30's
plan (its Record), `doc/questions/q272.md`, `q382.md` (resolved) and `q541.md` (raised). `README.md` was
not edited: it is a page for a consumer, and nothing in it moved. `doc/decisions/**` was not touched — no
ADR (prediction 4).

### Rule 7 and rule 8 — two passes, the second on the tree that shipped

Harness `rule8.mjs`: an anchor must match ONCE in the CURRENT text and must change it; each touched file is
restored to its FIRST snapshot and compared back byte for byte; a digest over every tracked and untracked
unignored file outside dev-dist/ before and after; node 24 asserted; three no-op controls (q272 in node and
deno, the runner), a CRASH grader (`g-crash`) and a WRONG-REASON grader (`g-wrong`); each probe declares
the full SET of failure lines it must trip, each `must` a prefix of a line the rung prints.

```
pass 1    22 probes: 21 as declared, 1 against declaration   digest 348c393e05e13dd4 IDENTICAL
pass 1b    1 probe:   1 as declared (p11 re-declared)        digest 348c393e05e13dd4 IDENTICAL
pass 2    27 probes: 27 as declared, 0 against declaration   digest 1576fb8082276d9f IDENTICAL
```

**Pass 1's one was the GRADER's**: p11 (the provocation made NOT to throw) was declared to fail *and every
one of them passed*, and it does not — the provocation's own case passes, so 1528 cases are still ok, and
the L1 census is what fails. **It was re-declared from that run's output** (the conformity reader's finding
8 asks that this be said): the probe was right and the declaration was wrong, as W133's were. Pass 2 adds
the reader's exact throws as probes (rb3, rb3-old, rb4, rc) and its finding 2 reverted (rw2). **Declared
survivors, by id**: **S1** (p6) — the loop stopped at the first failure with `--with` imported LAST is
green, because nothing is left to skip; the ordering is what makes p5 red. **S2** (p13) — two call-site
names swapped is green: the membership compares sets and a length, and name-to-body is a reader's check,
which is what Q382's fix puts in front of one. **S3** (t1) — p3 with q272's naming clause narrowed to a
count is green: that clause is the FAIL line's only observer.

### The reader — fresh context, plan and questions first, tree still

**Conformity** (8 findings, 3 should-fix, 5 notes; constructed cases A-L run in node and deno):
(1) a thrown value with no string form (`Object.create(null)`, a throwing `toString`) escaped the `catch`
through `String(e)` and restored Q272's crash; **fixed** by `describe`, which cannot throw (probes rb3, rb4
CAUGHT; rb3-old, the fallback removed, CAUGHT as the old crash). (2) `… and none of their cases ran` is
false of a file that registers a case and then throws; **fixed** — the line says only how many files, and
q272 holds the whole line (rc, rw2 CAUGHT). (3) the comment's reason for keeping the file out of the case
count named run-browser-tests.mjs's parity baseline, which never reads a run that exits 1; **fixed**,
restated as *the file is not a case*. (4) this file's Verification promised red for a swapped name;
**fixed**, it names S2. (5) the after-state of `test:browser` was unstated; **measured** above, and its
wrong advice raised as Q541. (6) argument edge cases — a second positional ignored, `--with --with` takes a
flag as a path, a filter matching nothing does not refuse when `--with` is given, a file both globbed and
`--with`ed counts twice in `N file(s)`, a never-settling top-level await exits 13 with no `FAIL`; **not
acted on**: none falsifies Q272, and each would be one more unprovoked clause in tooling. (7) *one named
FAIL* is the runner's report, not the run's; **stated** above. (8) p11 re-declared after a run; **stated**.

Prediction 6 held: the reader's finding 1 put Q272's own symptom back through the fix.

### What broke

1. **The fix's first form could still crash in its own `catch`** — finding 1. A `catch` that formats what
   it caught has a second throw site; nothing in the declared set reached it, because every probe threw an
   `Error`.
2. **A comment gave a reason that was false of the code it cited** — finding 3: the parity baseline only
   reads a run that exits 0.
3. **The grader's declaration was wrong once** (p11), and the probe was right.

### What this taught

- **A provocation whose input is ONE throw tests ONE shape of throw.** The reader's constructed values
  (non-`Error`, unprintable, after `suite()`) found what the checked-in provocation could not. Rule 8
  obligation (a)'s *shapes* clause, met by the reader rather than by the author.
- **Nothing in the spec, the plan or `doc/workflow.md` changes.**

### Raised

- **Q541** — `npm run test:browser` reports any failing node baseline as *could not establish the Node
  baseline — run node test/runner.ts first*, which is wrong once the runner has run and failed, and chromium
  alone never reports a bundle that throws on import.
