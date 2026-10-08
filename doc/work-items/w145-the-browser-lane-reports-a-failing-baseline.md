# W145 — The browser lane reports a Node baseline that RAN and failed as that, naming its failures (Q541)

**Status:** done — declared 2026-10-08 on `b9dd0c8`, the fourth item of P31; built, the reader and the fix round done, `gate:item` EXIT 0 on `ff61ff6`, 2026-10-08
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
                `pageerror` before the suite reports shortens the wait to a 5 s grace and names the
                error, instead of a 60 s timeout; a run with no `pageerror` is unchanged. Otherwise
                it is stated in the Record. *Amended at the fix round: "ends the wait at once" was
                the first form, withdrawn by the conformity reader's finding 1*
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

*Filled in 2026-10-08 on `ff61ff6`, held still from the confirming gate to this Record.* Scratch
`dev-dist/w145-14690/` (this item's shell pid): every log and script named below. Node v24.20.0 by
`fnm use 24` in every shell, Deno 2.9.6; every rung redirected, its EXIT read in the same command, never
piped. Ids here are bare text, as the header says.

### Gate

| clause | verdict | notes |
|---|---|---|
| `npm run gate:item > dev-dist/w145-14690/item.log 2>&1; echo "EXIT=$?"` | **RAN, EXIT 0** | ONCE, on `ff61ff6`, after the reader's fixes and rule 8's pass 2; `git status --short` empty before; 08:35 to 08:51 |
| — L0-L5 | RAN, 0 | **1580** cases in node 24.20.0, deno 2.9.6 and chromium (`all passed (parity with node: 1580)`): **unchanged** — q541.ts is not a `.test.ts` |
| — L6 | RAN, 0 | **164** real runs in node and deno: unchanged |
| — self-tests | RAN, 0 | 10/10 ok, 9 lanes, `check:register:selftest` left out (P31 decision 4), 850.7 s wall |
| the provocation | RAN, EXIT 0 | `node test/provocations/q541.ts`, every clause held; and as rule 8's control `c0` in every pass |
| conformity reader | RAN | 8 findings: 2 should-fix, 6 notes — below |
| adequacy reader | NOT RUN | P31 decision 6: one conformity reader for W145 |

**After the record step** (three doc files that checks read): `check:markdown` EXIT 0, `check:register`
EXIT 0, `npm run gate` EXIT 0 (`gate-record.log`: 1580 in all three, 164 L6 runs in node and deno), and
`npm run check:markdown:selftest` EXIT 0 (`md-selftest-record.log`).

L7 did not run. firefox and webkit did not run (`test:browser:all`); output (3) was measured in chromium only.

### The measurement, before and after (output 1)

`node dev-dist/w145-14690/measure.mjs before` on `3c3aa06` (the declaration; run-browser-tests.mjs as on
`b9dd0c8`) and `measure.mjs after` on the first fix (`measure-before.txt`, `measure-after.txt`). Case (a)
copies throws-on-import.ts into the glob as a temporary `.test.ts` and removes it; the tree digest was
IDENTICAL before and after both runs. Cases (b)-(d) run a byte copy of the script under a scratch root.

| case | before W145 | after W145 |
|---|---|---|
| (a) `npm run test:browser`, a baseline that RAN and exited 1 | EXIT 1, the one line `could not establish the Node baseline — run node test/runner.ts first`; nothing named | EXIT 1, `the Node baseline RAN and exited 1: node test/runner.ts failed, so no browser was started. Its own report names each failure:` then the runner's report — `57 file(s), 1580 assertions, on node 24.20.0`, `1 file(s) could not be imported`, `test/provocations/w145-temp.test.ts › could not be imported` with its `SyntaxError`, `1 FAILURE(S)`; no advice |
| (b) no test/runner.ts | EXIT 1, node's `MODULE_NOT_FOUND` on stderr, then the advice | **the same** — the advice stays for a baseline that could not run at all |
| (c) a green baseline, a bundle that throws on import, chromium | EXIT 1 in **61 843 ms**: `FAIL the suite never reported: page.waitForFunction: Timeout 60000ms exceeded.`, the `PAGE ERROR` naming the JSON `SyntaxError`, `PARITY FAIL` | EXIT 1 in **1 608 ms** on the first fix; **~6.2 s** on `ff61ff6` (the reader's finding 1 added a 5 s grace): `FAIL the suite never reported: a page error stopped it (PAGE ERROR below)`, the same `PAGE ERROR` and `PARITY FAIL` |
| (d) control: a green baseline, a bundle that reports | EXIT 0, `all passed (parity with node: 2)` | the same |

**Q541's second clause, answered.** The baseline fix does NOT reach a bundle that throws on import: after a
failed baseline no browser starts, before W145 and after (Scope Out). The chromium half is reached on its
own road — a baseline that is green while the BUNDLE throws, which is the browser-only shape
build-browser-tests.mjs's own header records (a fixture missing from the corpus, read at module scope). It
was small and inside `Owns`, so it was fixed: a `pageerror` shortens the wait to a 5 s grace, and a suite
that still reports inside it is reported in full.

### Outputs

| | output | where | what fails without it |
|---|---|---|---|
| (1) | the measurement, before and after | above; `measure-before.txt`, `measure-after.txt` | — |
| (2) | the ran/not-ran split on the runner's count line; the runner's report printed from that line; EXIT 1, no browser; the advice only without a count line and not exit 0; `could not read` kept for exit 0 | `scripts/run-browser-tests.mjs` | q541 A, B, C, D (probes p1-p10) |
| (3) | a `pageerror` shortens the wait to `PAGE_ERROR_GRACE_MS` (5 s); a console error does not | `scripts/run-browser-tests.mjs` | q541 E, G, H (p11-p13, r1, r2) |
| (4) | the provocation, cases A-H, the full set of report kinds per case | `test/provocations/q541.ts` | t1, t2, and the graders |
| (5) | Q541 resolved | `doc/questions/q541.md` | the record step |

**Two changes beyond the letter of Q541, stated** (the reader's findings 3 and 4): the RAN predicate is the
runner's whole count line, `^ {2}\d+ file\(s\), (\d+) assertions, on `, narrower than the old
`(\d+) assertions`; and the baseline's `maxBuffer` is 256 MiB where execFileSync's default was 1 MiB, so a
runner printing more than 1 MiB is no longer reported as *could not establish*. A baseline killed by a
signal now names the signal (`exited SIGKILL`) rather than `null`.

### Exceptions, reconciled to `git status --short` to the path

Five paths across the item's commits and the record step (`git diff --name-only b9dd0c8`). **Owns, 3**:
`scripts/run-browser-tests.mjs`, `test/provocations/q541.ts` and this file. **Exceptions, 0**: none of the
declared drag files moved, and section 1 rule 6 did not fire — no fix needed a file outside `Owns`.
**Record step, 2**: P31's plan (its Status and Record) and `doc/questions/q541.md` (resolved).
`README.md` was not edited: a consumer page in which nothing moved. `doc/decisions/**` was not touched:
no ADR (prediction 2).

### Rule 7 and rule 8 — three passes, the last on the tree that shipped

Harness `rule8.mjs`: each anchor must match ONCE in the CURRENT text and must change it, or the pass
aborts and restores; every touched file restored to its FIRST snapshot and compared back byte for byte; a
digest over every tracked and untracked unignored file outside dev-dist/ before and after; node 24
asserted; a no-op control (`c0`), a CRASH grader (`g-crash`, the provocation throws first) and a
WRONG-REASON grader (`g-wrong`, p5's edit declared against case B); each probe declares the full SET of
`FAIL` clause prefixes it must trip, compared both ways, each `must` a prefix of a line q541.ts prints.

```
pass 1    21 probes: 17 as declared, 4 against declaration   digest d3a0e50daee1441f IDENTICAL   (250f1d1 plus case G, uncommitted)
pass 2    23 probes: 20 as declared, 3 against declaration   digest 13be7eeb460b7fd3 IDENTICAL   (ff61ff6)
pass 2b    4 probes:  4 as declared, 0 against declaration   digest 13be7eeb460b7fd3 IDENTICAL   (ff61ff6: c0, p9, r2, t2)
```

**Every probe against its declaration was the declaration's**, each re-declared from that run's output
and said so here: p8 (the widened regex also starts the report mid-line, at `1580 assertions`), p9 and t2
(case G, then case H, were added after they were declared), t1 (with throws-on-import.ts made valid the
runner still fails — on the L1 census, as W132's p11 found — so A is still RAN, and only the NAMING
clauses fail), r2 (the grace as long as the wait keeps the right message and fails only on time). **One
was the code's**: pass 1's p14 — the losing wait left without a rejection handler — was GREEN because
`Promise.race` subscribes to both inputs. The handler and its comment were false protection and were
removed at `a38a852`; the reader confirmed it (finding 5). The reader's exact edits are pass 2's r1 (its
finding 1 reverted: CAUGHT on H) and r2.

**Declared survivors, by id**: **S1** (p14 on `ff61ff6`) — a timeout swallowed into the page-error message
is green: no case reaches a plain 60 s timeout, and adding one costs every run of the provocation 60 s.
**S2** (t3) — the kinds comparison made a subset, with p6, is green: the exact-set comparison is p6's only
observer. **S3** (r3) — the signal dropped from `exited` is green: on Windows a killed runner has a status,
never `null` (the reader's finding 3, not checkable here).

### The reader — fresh context, P31 and Q541 first, tree still at `a38a852`

It re-derived A-D and F from the decision before reading the provocation, and agreed.

1. **should-fix — a page error ENDED the wait, losing the report of a suite that goes on to report** (an
   unhandled rejection, a throw in a timer), and its `FAIL` line then said falsely that the suite never
   reported. **Fixed** (`dad4c0c`): a bounded 5 s grace after the first page error; case H (a rejection,
   then a report) checked in; the comment that called a page error proof of a stop corrected. G's report
   was moved past the grace (`ff61ff6`) so p13 still sees a console error that shortened the wait.
2. **should-fix — the declaration's output (4) named cases A-D that no longer matched the file.**
   **Fixed**: output (4) amended in place, marked as amended.
3. **note — the RAN predicate**: right for the runner's real output (one match in 172 KB); a count line
   then a crash reports RAN with only the count line; a POSIX signal printed `exited null`. **Acted on**
   for the signal (S3); the rest **not acted on** — a runner that prints its count line has run every
   suite it could import.
4. **note — `maxBuffer` changed, undeclared.** **Stated** above.
5. **note — the `Promise.race` claim is true.** Confirms pass 1's p14.
6. **note — rule 7 (b)**: B's missing runner and C's and D's missing count line are true by construction,
   not asserted; and the header overclaimed the shim's exit as asserted. **Fixed** in the header's words.
7. **note — the declaration's other claims hold**: no check reads the message text; check-wiring's
   `BUNDLE` line is byte-identical.
8. **Files outside Owns: none.**

### What broke

1. **The first fix ended chromium's wait on ANY page error**, which is the over-reach the reader found: the
   argument *a page error fails the engine anyway* is true of the exit code and false of the report.
2. **A rejection handler guarded a rejection that could not go unhandled** — found by rule 8 (p14 green),
   not by reading.
3. **Five probe declarations lagged the provocation** as it grew cases G and H.

### What this taught

- **A wait shortened on a SIGNAL needs a case where the signal comes and the thing still arrives** — H —
  and the provocation had only cases where it did not. The same as W132's lesson on shapes, one layer out.
- **Nothing in the spec, the plan or `doc/workflow.md` changes.**

### Questions closed and raised (section 1 rule 6)

- **Closed: Q541**, `resolved-by` naming P31 W145.
- **Raised: none.** Q562-Q564 unused. Rule 6 did not fire: no fix needed a file outside `Owns`.
