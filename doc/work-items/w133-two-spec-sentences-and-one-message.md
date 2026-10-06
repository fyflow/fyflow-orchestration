# W133 — Two spec sentences and one message: OR-R6 on a thread pool (Q61), RN-R6's `suspended` is current (Q62), `UncloneableResult` names itself once (Q63)

**Status:** todo — declared 2026-10-06 on `f6d1dbf`, the first item of P30
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

**Exceptions**: none declared. Any file edited outside `Owns` and outside the record step is
named here BEFORE its first edit (`doc/workflow.md` section 7 rule 2).

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

*Filled in when the item is done.*
