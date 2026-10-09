# W141 — A type's worker that cannot set up fails its tasks instead of hanging them, and the registry's shape is checked by ONE function (Q266, Q283)

**Status:** done — declared 2026-10-07 on `625d98b`, the third item of P31; built, both readers and the fix round done, `gate:item` EXIT 0 on `511a009`, 2026-10-08
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
| `AGENTS.md` | the ONE section-20 snippet comment sentence that says a wrong `base` leaves *the tasks pending for ever (Q266)*, rewritten to the new behaviour | **asked under rule 6 and answered YES by the maintainer, 2026-10-07 (answer (A))** — output (2) makes the sentence false |
| `scripts/build-browser-tests.mjs` | one `join(ROOT, 'src', 'definition', 'registry.ts')` line in the inlined-corpus list, with the W76/W77 comment convention | **asked under rule 6 and answered YES by the maintainer, 2026-10-07 (answer (B), option 1)** — output (7)'s membership case reads that file's source and was RED in chromium with *fixture not inlined* |

**Known at declaration, and ASKED rather than edited** *(answered YES, 2026-10-07 — the table above)* (workflow section 1 rule 6): `AGENTS.md`'s
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

*Filled in 2026-10-08 on `511a009`, the tree the confirming gate ran on, held still from the final rule-8
pass through that gate to this Record.* Scratch is `dev-dist/w141-12912/` (this item's shell pid): the
measurement scripts and logs, `rule8.mjs` and its three passes, and `item.log`.

**Gate — what ran.**

| Clause | Verdict | Notes |
|---|---|---|
| L0 | RAN, green | `lint` 0, all five typechecks 0 |
| L1-L5 | RAN, green | **56 files / 1580 cases in node 24.20.0, deno 2.9.6 and chromium** (from 1538): the three W141 suites and the two cases the readers bought. Firefox and webkit NOT RUN (`test:browser:all` is not on `gate:item`) |
| L6 | RAN, green | **2487 assertions over 164 real runs in node AND deno** (from 2474 / 162): the setup-fails block, 13 cross-row assertions over two runs. *(Its first run read 2475 against a derived 2462 — 13 — in a log the later runs overwrote; the arithmetic is `CROSS_ROW` 246 -> 259.)* |
| the measurement | RAN | output (1), below |
| rule 8 | RAN, three passes | author 48/48; the re-run with both readers' edits 61/65 and then 65/65 on four corrected DECLARATIONS; **final, on the still tree, 65 of 65 at their declared verdict**, digest `1152490c17f3bd67` before and after — below |
| conformity reader | RAN | 10 findings, 2 blocking — below |
| adequacy reader | RAN | 24 mutations and an 8-input probe: 14 caught, 10 survived (4 real gaps, 1 real defect, 1 unchecked comment, 3 vacuous) — below |
| `npm run gate` | RAN, EXIT 0 | on the tree after the two asked edits (`b2ce762`), before the readers |
| **`npm run gate:item`** | **RAN once, EXIT 0, on `511a009`** | `item.log`; selftests 10/10 ok, 879.4 s wall, `check:register:selftest` left out (P31 decision 4: this item touches no register script) |

**The measurement — output (1).**

*Q266, the hang.* `node dev-dist/w141-12912/measure3.mjs 3` — the L6 block's own shape (three OPTIONAL nodes of
a type whose worker's `setup()` throws, a fanout, `on:["failed"]` edges, a live-token join), inline and
threaded, three repeats each, a **12 s deadline**, called a hang because by then the pool has reported
`worker.restart_limit_exceeded` and nothing can settle the tasks after it (`measure2-before.log` counts the
events). **Before: 6 of 6 HUNG** — the three tasks `pending`, the fold `running`. **After: 6 of 6
`completed`** in 2-45 ms, each node `failed` with the setup message. *(`measure3-before.log`,
`measure3-after.log`.)*

**ADR 0051 F1, corrected** (`measure-before.log`, `measure2-before.log`, through `createRuntime` on 0.5.2):
**a SINGLE task with no retry on a worker whose `setup()` throws did NOT hang** — it settled `user_action`
(`failed` when optional), `attempts: 0`, in both pool modes. The hang needs a worker that fails again after
the task it failed on: three tasks on one worker (both modes, every time), or one task with a retry
(threaded). F1's mechanism is real; its single-task statement does not reproduce here. Recorded beside F1
in ADR 0051 (record step) and in the L6 block's comment. **`spec/flow-definition.md` section 2 says the same
single-task sentence** (*"the task stays `pending` with `attempts: 0` … emits nothing a driver could
record"*, around line 726) — a spec text, so this item did not move it: it is put to the caller as an ask
(Questions, below).

*Q283, the shape checks each caller made* (read off `625d98b`):

| check | `checkRegistry` before | `resolveRegistry` before | after |
|---|---|---|---|
| gate types (`NameCollision`, `GateTypeRefused`) | yes | no (`createRuntime` calls `checkGateTypes`) | unchanged — `checkRegistry` only |
| worker not an object | yes | yes | ONE function, both |
| worker undeclared key | yes | yes | ONE function, both |
| worker `url` missing or empty | yes | yes, **another message** | ONE function, one message |
| the four worker schemas in the subset | yes | yes | ONE function, both |
| node type named as a built-in | yes, one message | yes, **two directional messages** | ONE function, one message |
| `checkNodeTypeShape` (not an object, undeclared key, `pool` object/keys/PoolSpec, `groups`, a class's `configSchema`, `worker` present/absent, `inline`, `retryPolicy`, `settings`) | yes, over the built-ins too | yes, the consumer's only | ONE function, both, built-ins included |
| a type's worker declared | yes ("registry's") | yes ("registry document's") | ONE function, one message |
| pool not an object | yes | yes | ONE function, both |
| pool undeclared key | yes | yes | ONE function, both |
| pool named as a type or a built-in | yes | yes | ONE function, both |
| pool's type is a node type | yes | yes | ONE function, both |

The resolver keeps what only a DOCUMENT has: its own shape and keys, the sections, group types, groups,
the document-against-code collision, a document type's declared groups, the derivations, predicates and
languages. **The order of kinds is the resolver's as before** — workers, group types, groups, node types
(their declared groups and default instances), pools — because the shape is three functions, one per
kind, which `checkRegistry` calls in sequence and `resolveRegistry` calls where each kind was always read
(the conformity reader's finding 1).

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| (1) the measurement | above; `measure*.mjs` and `*-before.log` / `*-after.log` | — |
| (2) setup() never throws; every task fails from run() | `src/scheduler/envelope-worker.ts`: `setup()` wraps `setupOrThrow()`, remembers every throw (six stages), tears a constructed inner worker down once, starts a second call clean; `run()` reads the memory FIRST and throws a fresh Error naming the WHOLE worker URL, the stage and the error; `teardown()` clears it; `printable()` / `messageOf()` cannot throw | e1, e1-l6, e2, e3a-e3f, e4-e9, cr2, cr4, cr5, A1, A1b, A3, A9, A9-l6, A9i, A12 |
| (3) L1 | the W141 suite in `test/scheduler/transform.test.ts` (12 cases), and the three moved refusal cases | every e-probe; `drove` binds the backends |
| (4) L2 | the W141 suite in `test/driver/node-type.test.ts` (2 cases) | l2a |
| (5) L6 | the "W141 setup fails" block in `examples/l6.ts`, two runs, 13 cross-row assertions, bounded, crash-guarded | e1-l6, A1-l6, A9-l6, t1b-l6; `crash-l6` grades the guard |
| (6) one shape function | `checkRegistryShape` = `checkWorkersShape` + `checkNodeTypesShape` + `checkPoolsShape`, called by `checkRegistry` and, kind by kind, by `resolveRegistry`; built-in lookups own-key | r1, r2, r4, r3-00 to r3-20, cr1, Rc, Rf, Rl |
| (7) L1 for (6) | the W141 suite in `test/definition/registry.test.ts` (26 cases): 21 defects refused identically, the source-site membership both ways, a control, two ORDER cases, the prototype-name case | the same probes |
| (8) Q266, Q283 resolved | the record step | — |

**Exceptions, reconciled** — `git diff --name-only 625d98b..HEAD` before the record step lists 14 paths.
Owned: `src/scheduler/envelope-worker.ts`, `src/definition/registry.ts`, the four test files, `examples/l6.ts`,
this file. Declared at declaration: `examples/README.md`, `test/definition/l4-corpus.test.ts`. Asked and
answered YES before their edits: `AGENTS.md` (the one section-20 sentence), `scripts/build-browser-tests.mjs`
(the one corpus line). Record-step files (workflow section 1 rule 5): `doc/decisions/0051-*` (F1's
correction) and `doc/decisions/0075-*` (rule 4's *setup() has refused that*, now false — the conformity
reader's 3). `spec/README.md` NOT edited: no spec document moved. Nothing else.

**Rule 8 — the three passes** (`dev-dist/w141-12912/rule8.mjs`; each `must` is the FULL key — a test's
own name, or `<row key> :: <what>` at L6; node 24 asserted; every anchor checked against the CURRENT text and
unique or the pass aborts; every edit asserted to change its input; each file restored to its FIRST
snapshot byte for byte and compared; a digest before and after).

- **Author pass: 48 / 48.**
- **Re-run with both readers' edits checked in** (re-anchored where the fix moved the code): 61 / 65. The
  four were the HARNESS's declarations, each corrected and re-run: e4 gained a second observer (the
  unprintable case also sees a teardown never called); e5's anchor stopped being unique when `setup()`
  gained its reset; t1-l6's anchor moved when the L6 clause gained the URL; A9 (threaded only) still drives
  both backends, so `drove` is not tripped. None was a code defect.
- **Final pass, the still tree: 65 / 65** — 56 CAUGHT, 6 CLEAN, 2 WRONG-REASON, 1 CRASH, each its declared verdict:
  - **controls of the grader**: `c0-test`, `c0-l6` CLEAN; `crash-l6` CRASH; `wrong-l6` WRONG-REASON (a label
    renamed trips the subject membership and not the clause it names);
  - **declared survivors, each RUN**: `t1-l6` (the L6 error clause made a tautology — it is the ONLY L6
    observer of the message; second routes t1b-l6 and A1-l6 at L6, e9 and A1 at L1); `race-l6` (the race
    removed — the deadline never fires on a correct tree; second route e1-l6, where the deadline IS the
    verdict); **`Ri` — a stated LIMIT**: a resolve-only check written inside the resolver's own node-type
    loop survives, because the membership reads only the shape functions' source; there is no second route;
  - **`Rh` WRONG-REASON, the same limit's other face**: such a check outside the shape functions is caught only
    by an unrelated URL test, never by the Q283 suite that names the url check;
  - **order** (obligation (f)): `f1-l6`, the failing worker's `setup()` delayed 300 ms, CLEAN in both pool
    modes; both pool modes are themselves the block's two runs, and A9 / A9i bring the hang back in ONE mode
    and are caught by that mode's clauses alone.
  - **Not re-run here**: the adequacy reader's A10 (the hang under Deno only) — this harness grades node;
    the reader ran it in its copy and both deno rungs caught it (`deno-test` 13 FAIL, `deno-l6` 12 FAIL).

**Readers — fresh contexts, differed briefs, the tree still** (`b2ce762` throughout).

*Conformity* (spec, ADRs, P31 first; then the code; probes in its own scratch):

| # | finding | done |
|---|---|---|
| 1 BLOCKING | the first cut called the whole shape at the top of `resolveRegistry`, moving node types' declared groups and default instances after the pools and groups before node types — five documents refused differently than before, against section 3's *every entry of a kind before the next* | the shape split into three per-kind functions, each called where its kind was always read; an ORDER-across-KINDS case pins the five documents and Rf; `cr1` puts the first cut back and is CAUGHT |
| 2 BLOCKING | `setup()` could still throw: `String()` on an inner teardown's `Object.create(null)`; and an inner setup throwing one lost the URL and the stage | `printable()` and a `messageOf()` that cannot throw; a case for both; `cr2` |
| 3 | three claims that `setup()` refuses a malformed config, false since the refusal moved to `run()` | `envelope-worker.ts` and `registry.ts` corrected; ADR 0075 rule 4 corrected at the record step |
| 4 | `brief()` cut a worker URL past 117 characters | the URL is named WHOLE; the L1 stage cases and the L6 error clause compare the whole URL; `cr4`, A1, A1-l6, A1b |
| 5 | a second `setup()` kept the first one's failure | reset at the top of `setup()`; a case; `cr5` |
| 6 | the measurement contradicts F1's and the spec's single-task sentence; the L6 comment over-generalised | F1 corrected in ADR 0051 and above; the L6 comment narrowed (*no retry*); the spec sentence is an ask, below |
| 7 | the record step not yet done | done below |
| 8 | three refusal messages changed (worker url; a type's worker; the built-in collision no longer says which source) | stated here; no spec text, test or document pins the old ones (the reader's grep: only W109's historical Record) |
| 9 | verified true: six stages, 21 sites, the L6 counts, the browser comment, AGENTS.md's new sentence | — |
| 10 | expected values from spec and fixtures | — |

*Adequacy* (mutation in an isolated `tar` COPY, `node_modules` copied, `find -type l` empty before and after,
copy left in place; baselines green in node and deno first):

| finding | done |
|---|---|
| **Rl — a real defect, older than W141**: `name in BUILT_IN_NODE_TYPES` reads `Object.prototype`, so a type called `constructor` / `toString` / `__proto__` was refused on both roads as *a built-in names a worker* — which made the Q283 membership's one exemption ("unreachable") false; and `name in declared` raised a false collision for a class named `toString` | own-key lookups everywhere in `registry.ts` (`isBuiltInNodeType`, `hasOwn`); a case over the three names on both roads; the exemption comment now true and says why; probe `Rl` |
| A1 / A1b — the URL check was a 40-character prefix every fixture shares | the whole URL; probes A1, A1-l6, A1b |
| A3 — a non-envelope task on a failed worker | the stage cases send one; probe A3 |
| A12 — *a fresh Error per task* checked by nothing | the stage cases assert distinct objects; probe A12 |
| Rc — checkRegistry's worker-before-type order unpinned | a third ORDER case; probe Rc |
| Rf — the document-against-code collision's position unpinned | the ORDER-across-KINDS case; probe Rf |
| Ri, Rh — a check written OUTSIDE the shape functions | a stated limit, run as `Ri` (survivor) and `Rh` (wrong reason) |
| A6, Re, A17 — vacuous | stated |
| caught: A5, A18, A22, A9, A9i, A10, Ra, Rb, Rc, Rd, Rg, Rk1, Rk2 | — |

**Overlap: THREE shared subjects — the eighty-sixth measurement**, inside the 0-4 band, the briefs differed
(the conformity brief named the order and the claims; the adequacy brief named narrowing mutations, the
merge and the pool modes): (1) the order of kinds in `resolveRegistry` — conformity 1, adequacy Rc/Rf; (2) an
unprintable throw inside `setup()`'s catch — conformity 2, adequacy's input probe; (3) the worker URL in the
message — conformity 4, adequacy A1/A1b.

**What broke.**

1. **The first cut of Q283 moved the order of refusals and no test of mine saw it.** It called the whole
   shape up front, which is the natural shape for *one function called from both* — and section 3's rule is
   about the RESOLVER's order of kinds, which `checkRegistry` has fewer of. The repair keeps one
   implementation per kind and two call patterns.
2. **The hang's premise was half wrong.** ADR 0051 F1 says a single task never settles; on 0.5.2 through
   `createRuntime` it did. The L6 block runs three tasks because the measurement said one would not hang.
3. **`String(e)` in a catch is a throw site** — W132's lesson, met again inside the one method this item
   promised would never throw.
4. **A membership's exemption rested on a false sentence** (*no consumer input reaches it*) because of a
   prototype lookup older than the item.
5. **Four rule-8 declarations were wrong on the re-run**, every one a consequence of the readers' repairs
   (a new observer, a duplicated line, a moved line, a loop that keeps going) — the harness reported each
   as BAD or ABORT rather than letting it pass.

**What this taught.** A *one function for both callers* refactor has a second invariant beside *same
checks*: *same ORDER where the spec states one* — the caller with more kinds owns the order. And a
membership over a SOURCE REGION binds only that region (Ri, Rh): Q283's class can still come back as a check
written elsewhere in the resolver; the defence is the per-defect both-roads comparison, which catches any
check that changes a verdict, not one that adds a refusal.

**Questions — closed and raised** (workflow section 1 rule 6).

- **Closed: Q266, Q283**, each `resolved-by` starting "P31 W141 —". No ADR names them; none was needed
  (ADR 0089 unused).
- **Raised: none.** Q559-Q561 are reserved and UNUSED.
- **Rule 6 fired twice and both were asked, not raised**: `AGENTS.md`'s section-20 sentence (YES) and the
  browser corpus line (YES, option 1), both 2026-10-07.
- **One ask outstanding, put to the caller rather than raised**: `spec/flow-definition.md` section 2's
  single-task F1 sentence (*the task stays `pending` with `attempts: 0` …*) does not reproduce on 0.5.2 —
  correct the sentence to the measured mechanism (several tasks on a failing worker, or a retry), or leave it
  as F1's historical measurement. A spec text, so a change of its own. *Answered on 2026-10-08: the sentence
  corrected, its old reading kept, as `spec/flow-definition.md` v0.29 (`b9dd0c8`) — P31's retro, which
  corrected this line under workflow section 6 pass 3 rule 6.*
- **Stated limits, not questions**: Ri / Rh above.
