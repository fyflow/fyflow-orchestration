# W141 — A type's worker that cannot set up fails its tasks instead of hanging them, and the registry's shape is checked by ONE function (Q266, Q283)

**Status:** in progress — declared 2026-10-07 on `625d98b`, the third item of P31
**Plan:** P31, `doc/plans/p31-which-open-questions-close-by-a-decision-taken-now.md`

*This file carries NO relative link, deliberately* — W127's note and Q142's mechanism (`M4`), as in
W140's and W142's files. Ids and paths are bare text.

```
Spec:       none changed. P31 decision 3 fixes both directions: Q266 on W61's road (the envelope
            worker REMEMBERS a setup failure and fails each task from run()), and Q283 one shape
            function called from both checkRegistry and resolveRegistry. FD-C5, FD-C6 (the envelope
            and its worker, spec/flow-definition.md section 3), section 2's transform subsection
            (a language that does not load is the TASK's failure), section 3's registry subsection
            and its refusal table (every entry of a kind before the next kind is read; a bad pool
            AND a bad worker names the worker) bind it, and none of their texts may move — a text
            that would have to is a stop. ADR 0004 (a failure routes), ADR 0007 rule 2 (key on
            terminal state), ADR 0051 rule 5 and its fact F1, ADR 0049 rule 4, ADR 0054, ADR 0075
            are the decisions it must leave meaning what they mean
Owns:       src/scheduler/envelope-worker.ts (the envelope worker: P31's W141 row);
            src/definition/registry.ts (checkRegistry, resolveRegistry and the shared shape function);
            the tests: test/scheduler/transform.test.ts (a W141 suite — the wrapper class, and real
            inline and threaded pools where a pool can load its script — and the two existing
            setup()-refusal cases the change moves to run()), test/scheduler/bootstrap.test.ts (its
            one setup()-refusal case, moved the same way), test/driver/node-type.test.ts (a W141
            suite at L2), test/definition/registry.test.ts (a W141 suite for Q283);
            examples/l6.ts (one labelled block of TWO real runs, inline and threaded, outside the
            row loop as the consumer road is; DECLARED_TOTAL, DECLARED_RUNS, CROSS_ROW and
            CROSS_ROW_SUBJECTS by arithmetic; pairRunCount gains the block's runs);
            and this file
Inputs:     the tree at 625d98b; Q266, Q283; W61's Record (F1, the stop-and-ask and its road);
            ADR 0051 F1 and rule 5; W65's Record (P1, P2 — checkRegistry missing two checks) and
            W109's (the built-in collision on one road only), the two divergences Q283 names;
            W142's Record (what W141 inherits: ID-R4 tier 1 is L2-only, and runPair refuses a shared
            pair with no routed registration — this item adds no pair row)
Outputs:    (1) the measurement, before any edit to src/: Q266 reproduced on this tree — the
                command, the outcome, the deadline called a hang — and the two registry callers'
                shape checks listed check by check, each with which caller makes it
            (2) the envelope worker: setup() NEVER throws. Every way the TYPE's worker can fail to
                set up — the module does not load, it exports no default class, its constructor
                throws, its own setup() throws — and the two pool-config refusals setup() made by
                name (no worker URL; transformOnly beside a worker) are REMEMBERED, a constructed
                inner worker is torn down at once (the scheduler's own rule for a failed setup), and
                every task on that worker fails from run() naming the worker URL, the stage and the
                error. run() before setup() and after teardown() stay refused as they are
            (3) L1: the class over every failure stage and a healthy control; and on a real
                FyflowScheduler, inline and threaded, where a pool can load the script (Node and
                Deno — the class in the browser, Q261), three tasks on one failing worker each
                settle failed / user_action with the message, where before they stayed pending
            (4) L2: a typed node whose task fails with that message routes per ADR 0004 — optional
                down its on:["failed"] edge, non-optional parked user_action — on a fixture
                outcome log, no scheduler
            (5) L6: one block, TWO real runs (inline, threaded): a fanout of three optional nodes
                of a type whose worker's setup() throws, each with an on:["failed"] edge to an end,
                joined under live-token. The run COMPLETES inside a bounded race; each node failed
                with the setup error; no task of the type is left pending. Before the fix the same
                block reports the deadline (measured, output 1)
            (6) Q283: one shape function in registry.ts, called by checkRegistry and by
                resolveRegistry; the resolver's own copies of those checks deleted
            (7) L1 for (6): for EVERY check in output (1)'s list, one defect refused by both callers
                with the same class, the same `at` and the same message; and a both-ways membership
                of the defects against the list
            (8) Q266 and Q283 resolved, each `resolved-by` starting "P31 W141 —"
Depends on: W142 (P31 decision 5: serial on one tree)
Blocks:     W145
Tests:      (3), (4), (5), (7). Expected values come from ADR 0051 rule 5's road, ADR 0004, ADR 0007
            rule 2, spec section 3's refusal table and P31 decision 3 — the message parts are the
            worker URL and the error text each fixture throws, written into the fixture, never read
            back from a run
Gate:       L0-L6 (L0-L5 in Node, Deno and Chromium; L6 in Node and Deno); rule 8 on every output;
            the conformity and adequacy readers (P31 decision 6); `npm run gate:item` EXIT 0 once,
            on a still tree (decision 4)
Reserves:   Q559-Q561, and ADR 0089 only if a stop-and-ask answer needs one. No W beyond W141
```

**Exceptions** — declared 2026-10-07, before the first edit (`doc/workflow.md` section 7 rule 2):

| file | the edit | why |
|---|---|---|
| `examples/README.md` | the two current L6 count copies `check-docs`' `X10` compares, each with the one-clause history parenthetical every copy there carries (W141 as bare text, no link), and the l6.ts cell's tail count of runs | output (5) moves `DECLARED_TOTAL` and `DECLARED_RUNS`, and `X10` is red until both copies follow |
| `test/definition/l4-corpus.test.ts` | suite names appended to `LATE_SUITES` | outputs (3), (4) and (7) are new suites, and the L1 census holds suite names both ways |
| `spec/README.md` | its version line — **ONLY if** a spec document is bumped | none is planned; a spec text that must move is a stop, not an exception |

**Known at declaration, and ASKED rather than edited** (workflow section 1 rule 6): `AGENTS.md`'s
section-20 snippet says, of a wrong `base`, *the tasks stay pending for ever (Q266)*. Output (2) makes
that false — a module that does not load fails every task of the type. `AGENTS.md` is outside `Owns`,
so the item asks to widen it before any edit, and the answer goes in this table first.

## Scope

**In**

1. **Measure first** (output 1), into `dev-dist/w141-12912/`, before any edit to `src/`.
2. **Q266** (outputs 2-5). The reading taken here: the decision's *an inner setup() failure* is read as
   **every throw `setup()` could make**, because ADR 0051 F1 is a fact about the envelope's `setup()`
   throwing, whatever threw — so the two pool-config refusals move to `run()` with the rest, and
   `setup()` has no throw left. Stated here so the readers can contest it.
3. **Q283** (outputs 6-7). The shared function takes the three things both callers hold — workers, the
   node types merged with the built-ins, the named pools — and the resolver keeps only what is the
   DOCUMENT's: its own top-level shape, the sections, group types, groups, the document-against-code
   collision, a document type's declared groups, the derivations, predicates and languages.
4. **Rule 8 on every output**, in `dev-dist/w141-12912/`, written to the RULE: the envelope forgets a
   failure (setup throws again, at each stage — the hang returns); the failure remembered but run()
   not consulting it; a constructed inner worker not torn down; teardown not clearing the memory;
   one registry caller skipping the shared function (each caller, each check); the shared function
   dropping a check. A no-op control, a CRASH grader on L6 and a WRONG-REASON grader; each L6 `must`
   written with the FULL row key.
5. Grep the tree for `W141`, `Q266`, `Q283` and every withdrawn sentence, excluding `dev-dist/`.

**Out**

- **Recovering a worker whose setup failed for a transient reason** (a database down for a minute).
  Before this item the pool restarted the worker and the tasks hung; after it the worker stays up and
  fails every task until the pool is rebuilt. A retry of `setup()` from `run()` is a different design
  and not P31 decision 3's.
- **Naming the TYPE in the message.** The envelope's pool config carries the worker URL and not the
  type's name; adding the name changes every pool config `poolOptionsOf` writes, which is P18 fact
  5's byte-identity and `bootstrap.ts`, outside this row. The run's record names the node, and the
  node names the type.
- The scheduler's requeue behaviour itself — stop-and-ask (b) applies only if the hang cannot be
  closed from the envelope, and output (1) is what says whether it can.
- P31's other items.

## Verification

- **L0-L5**: `npm run gate` covers them in all three runtimes; L6: `npm run test:l6`,
  `npm run test:l6:deno`. Every rung is RUN and never piped: `cmd > log 2>&1; echo "EXIT=$?"`.
- **The hang**: `node dev-dist/w141-12912/measure2.mjs` before and after — three tasks on one failing
  worker, inline and threaded, retry on and off, a 12 s deadline.
- **Rule 8**: the probes of Scope 4, anchors checked against the CURRENT text and unique, every edit
  asserted to change its input, restore to the first snapshot byte for byte, a digest before and after.
- **Readers**: conformity (the spec, the ADRs and P31 first, then the code; reports, does not fix) and
  adequacy (the spec first, then the tests; mutates only in an isolated `cp -r` COPY,
  `find <copy> -type l` before any removal, the copy left in place), fresh contexts, differed briefs,
  the tree still.
- **Confirming gate**: `npm run gate:item > dev-dist/w141-12912/item.log 2>&1; echo "EXIT=$?"`, once,
  on the final tree.
- **Routing cases** (template): no routing changes. `user_action` (Q17) is IN — a non-optional task
  failing from `run()` is parked, and ADR 0007 rule 2's two events key on terminal state. A failure
  edge (ADR 0004) is IN. Routed-away (Q4), no-matching-edge (Q10), a duplicate id (Q13) and nested
  fan-out (Q6) are not applicable.

## Record

*Filled in when the item is done.*
