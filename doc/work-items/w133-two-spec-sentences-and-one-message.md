# W133 — Two spec sentences and one message: OR-R6 on a thread pool (Q61), RN-R6's `suspended` is current (Q62), `UncloneableResult` names itself once (Q63)

**Status:** done — declared 2026-10-06 on `f6d1dbf`, the first item of P30; built, both readers and the fix round done 2026-10-06
**Plan:** P30, `doc/plans/p30-which-open-questions-close-by-a-fix-already-named.md`

*This file carries NO relative link, deliberately* — W127's note and Q142's mechanism. A linking
document here is one more in `check-markdown`'s second `removes` probe tree and can cross `M4`'s
floor, so `check:markdown:selftest` would exit 1 while `check:markdown` stays green. Ids and paths
are bare text.

```
Spec:       spec/outcome-record.md section 4 (OR-R6) and spec/run-state.md (RN-R6), both CHANGED
            by this item, each as its own change with its rationale stated; P30 decision 2, which
            fixes all three directions
Owns:       spec/outcome-record.md, spec/run-state.md, src/driver/listener.ts,
            test/driver/log.test.ts, test/driver/driver.test.ts, examples/l6.ts,
            AGENTS.md ONLY if a snippet or sentence quotes the message text, and this file
            (P30's index row)
Inputs:     the tree at `f6d1dbf`; fyflow-scheduler 0.5.2 (npm) and jsr:@fyflow/scheduler@0.5.2;
            P2's measurement (doc/plans/p2-the-non-success-half-on-a-real-scheduler.md, decision 2)
Outputs:    (1) OR-R6 gains the thread-pool sentence, written FROM this item's 0.5.2 measurement;
                outcome-record v0.10 -> v0.11, its version block stating why
            (2) an L6 row, `uncloneable / OR-R6, threaded`: the existing row's flow with
                `threaded: true`, asserting what 0.5.2 actually does — P2 says the task ends
                `user_action` and no result reaches the listener, so no `UncloneableResult`
            (3) RN-R6 states that regions[*].suspended is CURRENT — a branch path leaves it on
                that branch's terminal event; run-state v0.12 -> v0.13, its version block stating why
            (4) an L2 test in test/driver/driver.test.ts, expected values from (3)'s sentence: a
                suspended branch is listed while suspended and NOT listed once resolved
            (5) src/driver/listener.ts: the message becomes
                `the result of task "<id>" is not structured-cloneable`
            (6) a test asserting `stoppedBy` names `UncloneableResult` EXACTLY ONCE, and the
                message does not open with the class name (test/driver/log.test.ts, and L6's
                existing row's `stoppedBy` assertion tightened if it reads only a prefix)
            (7) examples/l6.ts's comments at ~564-571 (Q62 "reported rather than patched") and
                ~4961-5016 (Q63's doubling) made true of the new tree
            (8) Q61, Q62, Q63 resolved, `resolved-by` naming W133 and the spec version
Depends on: nothing
Blocks:     W131 (P30 decision 7: serial on one tree)
Tests:      (2), (4), (6). Expected values come from the NEW spec sentences and P30 decision 2,
            never from running the code. (2)'s expected values come from the measurement, which
            is the one place a run is the source — so the row is reviewed line by line at
            birth (workflow section 5 rule 4) and the measurement's command is in the Record
Gate:       L0-L6 (L0-L5 in Node, Deno and Chromium; L6 in Node and Deno); the conformity and
            adequacy readers (P30 decision 8); `npm run gate:full` EXIT 0 once, on a still tree
Reserves:   Q533-Q535, ADR 0085. No W beyond W133
```

**Exceptions**: six files. The first three were declared 2026-10-06 after Scope 1's measurement and
BEFORE the first edit; the next three were each declared before its own first edit, two of them LATE —
found by a gate run, as their rows say (`doc/workflow.md` section 7 rule 2). Output (2) presumed that a row's `threaded: true` puts
`MergeWorker` on a thread. It does not: `examples/registry.json` declares that type `inline: true`, and
`registryDocumentFor` writes `inline` only into the types whose `inline` the document leaves unsaid.

| file | the edit | why |
|---|---|---|
| `examples/registry.json` | `MergeWorker` loses `"inline": true`, and nothing else | so the row knob reaches it. The existing `uncloneable / OR-R6` row is `threaded: false` and so still runs inline. `THREADABLE_TYPES` gains `MergeWorker`, and the literal `l6.ts` compares it to moves with it |
| `examples/run-flow.ts` | comments only: the threadable-type count beside `registryDocumentFor`, the dated *costs ZERO* sentence below it (the conformity reader's finding 6), and `failureKinds`' sentence that the message begins with its class name | both become false |
| `examples/workers/uncloneable.ts` | header comment only: *"declares `inline: true` and must"* | becomes false. The type is inline on the row that needs it, by the knob |
| `examples/README.md` | the two current L6 count copies `check-docs`' `X10` compares, each with the one-clause history parenthetical every copy there carries (W133 as bare text, no link), and that cell's row-label, entry and run counts | output (2) adds a row, so `DECLARED_TOTAL` and `DECLARED_RUNS` move, and `X10` is red until both copies follow. Declared before `l6.ts` was edited |
| `spec/README.md` | the version column of the `outcome-record.md` and `run-state.md` rows, and nothing else | `check-spec`'s `C8` holds that column to each document's own header, so outputs (1) and (3) cannot land without it. **Declared late**: found by the first `npm run gate` after both bumps, and declared here before `spec/README.md` was edited |
| `test/definition/l4-corpus.test.ts` | the two suite names outputs (4) and (6) add, appended to `LATE_SUITES` | the L1 census holds suite names both ways, and its own message says to add a new one in the same commit. **Declared late**, by the second `npm run gate`, before the file was edited |

## Scope

**In**

1. **Measure first (Q61).** Before writing any sentence, run the `uncloneable` flow on a THREAD
   pool on 0.5.2, in Node and in Deno, and record: the task's terminal state, the events fired,
   whether `onRunFailure` fires, the run's `outcome`, and the message the scheduler records. If it
   differs from P2's table — the task not ending `user_action`, or a result reaching the listener —
   **STOP: that is P30 stop-and-ask (b)**, and nothing under `spec/` is written until the
   maintainer answers.
2. **Write OR-R6's sentence** from that measurement. It states that OR-R6 is reachable only from
   an inline pool, says what a thread pool produces instead, and names the L6 row that holds it.
   ADR 0007 is not edited. If the sentence turns out to need a rule ADR 0007 does not hold, that
   is prediction 4 reversed: stop and say so.
3. **Write RN-R6's lifetime sentence**, then the L2 test against it, then confirm the fold already
   satisfies it. If the fold does NOT clear `suspended` on resolution, the spec sentence still
   says current (P30 decision 2) — **stop and report the conflict**, never patch the fold to fit
   silently.
4. **Change the message**, then the tests that pin it. `driver.ts:1806` is NOT edited: it
   supplies the class name, which is the point.
5. Grep the tree for the old message text `UncloneableResult: the result` and for `Q61`, `Q62`,
   `Q63`, excluding `dev-dist/`, and make every sentence that is now false true (workflow
   section 1 rule 5, the *un-write* direction).

**Out**

- `driver.ts`'s `stoppedBy` construction, and `OR-R12` (`resolve()`'s `DataCloneError`): unchanged.
- An `inline` option exposed to flow authors, and any change to which pool a type runs in.
- The other nine open questions, and P30's other items.

## Verification

- **L0-L5**: `npm run gate` covers them, and section 4 requires all three runtimes; L6 in Node and
  Deno: `npm run test:l6`, `npm run test:l6:deno`. Each rung is RUN and never piped:
  `cmd > log 2>&1; echo "EXIT=$?"`.
- **Rule 8 (section 5)** on every output: break each new sentence's claim and watch the gate go
  red. Make the fold keep a resolved branch in `suspended`, so (4) goes red. Restore the old
  message prefix, so (6) goes red. Flip the threaded row's `threaded` to `false`, so (2) goes red
  for the reason it names. Obligation (f): the threaded row is ARRANGED, never sampled.
- **Readers**: conformity reads the two spec documents first, then the code. Adequacy mutates in an
  isolated COPY, and before any `--force` removal it scans the copy for links (section 6).
- **Confirming gate**: `npm run gate:full > dev-dist/w133-<pid>/full.log 2>&1; echo "EXIT=$?"`,
  once, on the final tree, after the readers' fixes.
- **Routing cases** (template): `user_action` (Q17) is IN, as Q62's subject and as Q61's
  thread-pool outcome. Routed-away, no-matching-edge, duplicate id and nested fan-out are not
  applicable.

## Record

*Filled in 2026-10-06 on `9d73ab1` plus this item's uncommitted tree, held still from the confirming gate
to this Record.* Scratch `dev-dist/w133-59497/` (this item's shell pid): every log and script named below.
Node v24.20.0 by `fnm use 24` in every shell, Deno 2.9.6; every rung redirected, its EXIT read in the same
command, never piped. Ids here are bare text, as the header says.

### Gate

| command | EXIT | reading |
|---|---|---|
| `npm run gate:full > dev-dist/w133-59497/full.log 2>&1; echo "EXIT=$?"` | **0** | run ONCE, on the final tree, after both readers' fixes and rule 8's last pass; 0 `FAIL` lines; `git status --short` identical before and after (`tree-before-full.txt`) |
| — L1-L5 | 0 | **1528** cases in node 24.20.0, deno 2.9.6 and chromium (parity 1528): **+12**, all W133's (1 in `log.test.ts`, 11 in `driver.test.ts`) |
| — L6 | 0 | **2465** assertions over **162** real runs, node and deno: +30 and +1 run, derived in `l6.ts`'s comment above `DECLARED_TOTAL` before the file was re-run |
| — self-tests | 0 | 11/11 lanes ok, 2312.9 s wall |

L7 did not run (no person looked at a trace); this item changes no trace.

### Scope 1 — the measurement, before any sentence

`node dev-dist/w133-59497/measure.ts` and `deno run --import-map=examples/deno-import-map.json --allow-read
--allow-net --allow-env dev-dist/w133-59497/measure.ts`, both EXIT 0 (`node.log`, `deno.log`). The
`uncloneable` flow with `MergeWorker`'s `inline` written both ways, on fyflow-scheduler 0.5.2:

| pool | events | task | records | `onRunFailure` | run |
|---|---|---|---|---|---|
| inline | running, completed (`result` an object) | `done` at the scheduler | none | `UncloneableResult` | `stopped` |
| thread | running, `task.failed` then `task.user_action`, both state `user_action`, no result | `user_action`, error `() => 1 could not be cloned.` (node) / `()=>1 could not be cloned.` (deno) | one `outcome`, `user_action` | none | `awaiting_action` |

**It matches P2's table**, so P30 stop-and-ask (b) did not fire. The OPTIONAL half (`measure-optional.ts`,
both runtimes EXIT 0: `task.failed` only, state `failed`, one `failed` record, run `failed`) was measured
after the conformity reader found the sentence claimed more than this table — see *what broke*.

### Outputs

| | output | where | status |
|---|---|---|---|
| (1) | `OR-R6` v0.11 — reachable only from an inline pool; a thread pool ends the task `user_action` (non-optional) or `failed` (optional) | `spec/outcome-record.md` v0.11 block and the `OR-R6` row | built; widened by the fix round |
| (2) | L6 row `uncloneable / OR-R6, threaded …`, appended LAST (run id `r63`) | `examples/l6.ts` | built, with `records`, `taskErrors` and `taskErrorsRule` |
| (3) | `RN-R6` v0.13 — `suspended` is CURRENT: enters on `branch.suspended`, leaves on `branch.resumed` or a terminal event, re-enters, per instance | `spec/run-state.md` v0.13 block and the `RN-R6` row | built |
| (4) | the L2 suite `RN-R6 v0.13 — …`: 9 cases plus a case census against a literal | `test/driver/driver.test.ts` | built; the fold already satisfied the sentence, so nothing was patched |
| (5) | the message `the result of task "<id>" is not structured-cloneable`; the class sets its own `name` | `src/driver/listener.ts` | built; `driver.ts` not edited |
| (6) | `stoppedBy` names the class exactly once: L2 (`driver.test.ts`), the message and `String(e)` (`log.test.ts`), and L6's `startsWith` plus `stoppedByNamesItOnce` | three files | built |
| (7) | `l6.ts`'s Q62 comment (`regionSuspended`) and Q63 comment (`kind`/`message`) true of the new tree | `examples/l6.ts` | built |
| (8) | Q61, Q62, Q63 resolved | `doc/questions/` | the record step |

### Exceptions, reconciled to `git status --short` to the path

Nineteen paths, counted after the record step. **Owns, 7**: `spec/outcome-record.md`, `spec/run-state.md`,
`src/driver/listener.ts`, `test/driver/log.test.ts`, `test/driver/driver.test.ts`, `examples/l6.ts` and this
file. `AGENTS.md` was NOT edited: no snippet or sentence quotes the message. **Exceptions, 6**, each
declared above before its own first edit: `examples/registry.json`, `examples/run-flow.ts`,
`examples/workers/uncloneable.ts`, `examples/README.md`, `spec/README.md` (late) and
`test/definition/l4-corpus.test.ts` (late). **Record step, 6**: P30's plan (its Record),
`doc/questions/q61.md`, `q62.md`, `q63.md` (resolved) and `q533.md`, `q534.md` (raised). `README.md` was not edited: it is a page for a consumer
(ADR 0073), and nothing in it moved. `doc/decisions/**` was not touched — prediction 4 held.

### Rule 8 — three passes, the last on the tree that shipped

Harness `rule8.mjs`: an anchor must match ONCE in the CURRENT text and must change it; each touched file is
restored to its FIRST snapshot and compared back byte for byte; a digest over every tracked and untracked
unignored file before and after; node 24 asserted; a no-op control, a CRASH grader and a WRONG-REASON grader;
each probe declares the full SET of named failures it must trip.

```
pass 1   21 probes: 11 as declared, 10 against declaration, 0 survivors   digest 2826bef759929d6d IDENTICAL
pass 2   27 probes: 18 as declared,  9 against declaration, 0 survivors   digest daab10283d2b0569 IDENTICAL
pass 2b   9 probes:  9 as declared                                         digest daab10283d2b0569 IDENTICAL
```

**Pass 1's ten were all CAUGHT for the reason they name and declared too narrowly**, re-declared from the
measured output (`redeclare.mjs`): a pre-W133 fold suite (*suspended and resumed move a branch in and out of
`suspended`*) is a second route under p1, p3 and p4; the threaded row's block aborts at `RN-R12` under p6,
p6d and p7, which the gate's count lines then report; and p8, p10, p12 and p13 had more observers than
named. **Pass 2's nine were the GRADER's**: `THR` was the threaded row key's PREFIX, so `THR + ' › …'`
matched nothing; p3's and p4's `must` put `› ` before mid-label text; and `g-crash`'s anchor was the
one-line class the fix round replaced, so it ABORTED rather than mis-graded. Pass 2b re-ran exactly those
nine on the same tree (`fixgrader.mjs`). **One survivor across all three: none.** p15, a case out of the
RN-R6 loop, was a declared GREEN ceiling in pass 1 and is CAUGHT in pass 2 by the case census the adequacy
reader's finding 3 bought. *The pass-1 and pass-2 deviations are the harness's own class — a declaration is
a claim, and both readings of it were written before it was run.*

### The readers — both fresh contexts, spec first, tree still

**Conformity** (8 findings, 5 should-fix): (1) `OR-R6` v0.11 claimed `user_action` for every task — an
`optional` one ends `failed`; **fixed** in the spec from W133's own measurement. (2) Q533 and two `l6.ts`
comments said EVERY other refusal class self-names — nine do, `NoMatchingEdge`, `InvalidRunId`,
`UnresolvedBranchPath` and `ResumeRefused` do not; **fixed**. (3) the error itself lost its class name —
`UncloneableResult` set no `name`, so `String(e)` read `Error: …`; **fixed** by setting it, as
`BoundaryRefused` and `ResumeRefused` do, with an assertion (probe p18 CAUGHT). (4) the Exceptions
paragraph said three files beside a six-row table; **fixed**. (5) `AGENTS.md` states the inline-only
behaviour generally — outside `Owns`; **raised as Q534**. (6) `run-flow.ts`'s *costs ZERO* sentence is no
longer true; **fixed** as a dated parenthetical. (7) *listed twice* misreads as a duplicate; **fixed**.
(8) the README gained links into this link-free file; **fixed**, bare text.

**Adequacy** (36 probes in an isolated copy, `find -type l` empty before and after, copy left in place; 2
BLOCKING, 3 should-fix, 3 notes): (1) BLOCKING — a second `outcome` record for the clone-error
`user_action` survived L6; **fixed** by a declared `records` clause (probe a-M6 CAUGHT). (2) BLOCKING —
a `branch.resumed` emptying every OTHER instance survived; **fixed** by three per-instance cases (a-T7
CAUGHT). (3) a case out of the done/failed loop cost 0; **fixed** by a case census (p15, a-L1T9 CAUGHT).
(4) `taskErrors` blankable to `['']`; **fixed** (a-B1 CAUGHT). (5) the row failed under a TRANSFORM's rule
id; **fixed** by `taskErrorsRule`. (6) L6's exactly-once clause is backed only by L2 — **kept, stated**:
it is probe p14, CAUGHT at L2 by both new tests. (7) a test with no body passes — the runner's, not
W133's; **not acted on**. (8) parts of the threaded row are observed through other values — `user_action`
and *no result* are now read directly by the `records` clause.

**The overlap is TWO shared subjects, the eighty-third measurement**: `OR-R6` v0.11's thread-pool clauses
(conformity 1, the optional branch; adequacy 1 and 8, the record and the state) and `RN-R6` v0.13's sentence
and its `Test:` cell (conformity 7, the re-entry wording; adequacy 2 and 3, the instance and the loop).
*The two briefs were written apart and named different targets.*

### What broke

1. **Output (2) was unbuildable as declared.** `threaded: true` never reaches `MergeWorker`, which the
   document pinned `inline: true`; found at Scope 1, before any edit, and closed by an exception.
2. **The first `OR-R6` sentence claimed one branch of two.** Written from a measurement of a non-optional
   task and stated of every task: section 1 rule 5's *write* direction, measured at one scope and written at
   another. No rung covers a spec sentence's scope; the conformity reader did.
3. **Two late exceptions** (`spec/README.md`, `l4-corpus.test.ts`), each found by a gate run. Both are
   mechanical consequences a spec version bump and a new suite always have.
4. **The rule-8 grader's declarations were wrong twice**, in two different ways, and the probes were right
   both times.

### What this taught

- **A spec version bump drags `spec/README.md`'s version column, and a new L2 suite drags the L1 census.**
  Both are certain, and both were declared late. An item that bumps a spec or adds a suite can name them at
  declaration.
- **A suite whose cases come from a loop needs a case census**, or a loop entry is free to delete. W85's
  shape, needed again.
- **Q63's convention runs deeper than one message.** Nine classes self-name, and that hides a driver
  regression on the FD-R2 row (probe p12, recorded on Q533).

### Raised

- **Q533** — nine refusal classes still open their message with their class name.
- **Q534** — `AGENTS.md` states the inline-only `OR-R6` behaviour generally.
