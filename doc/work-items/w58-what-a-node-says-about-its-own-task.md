# W58 — What a node says about its own task

**Status:** done — 2026-09-12, built on `48975d7`; author pass, both readers and rule 8's re-run with their edits checked in; **no ADR**. `spec/flow-definition.md` is v0.16
**Plan:** [P16](../plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md)

```
Spec:       spec/flow-definition.md section 2 (the node-kind key table, which
            FD-V17 refuses against), section 5 (validation refusals) and
            section 7 (the examples index)
Owns:       src/definition/**, src/driver/driver.ts (the `dispatch` site and
            `DriverOptions` only - W57 has closed before this starts),
            spec/flow-definition.md, spec/README.md, spec/examples/**,
            test/definition/**, test/driver/**, examples/**, AGENTS.md section 3
Inputs:     P16 facts 1 and 2, read from the PLAN's own file and RE-RUN from
            dev-dist/p16/facts.mjs rather than transcribed. ADR 0004 rule 7
            (`optional` is the precedent: a node field passed through to the
            task); ADR 0002 rule 3 (an unknown name fails at instantiation);
            the scheduler's AGENTS.md task table at 0.5.2; Q16's and Q111's
            rows; ADR 0048 (W57) for the widened TaskFactory.
Outputs:    (1) `retryPolicy` and `workerGroups` as DECLARED keys on a `task`
                node, in section 2's key table, each with a refusal:
                FD-V30 (retryPolicy shape: integer maxRetries >= 0, number
                backoffMs >= 0) and FD-V31 (workerGroups: an array of names
                every one of which the registry declares) - ids confirmed
                against section 5 at this item's start, never renumbered
            (2) `Registry.groups`, the third set beside predicates and
                workerTypes, because fact 2 measured that the scheduler
                ignores an unknown group id silently
            (3) `DriverOptions.defaultRetryPolicy`, with the merge rule in
                spec/flow-definition.md section 2: the node wins
            (4) `TaskFactory` widened and `dispatch` passing both through -
                one call site, driver.ts:1839 at declaration
            (5) fixtures: one valid corpus flow carrying both keys, and one
                invalid example per new rule under spec/examples/invalid/
            (6) TWO L6 rows in both runtimes: a worker role that fails ONCE
                and succeeds on retry, asserting `attempts === 1` on the
                outcome record; and a task carrying a group that is
                `resource.blocked` behind a ConcurrentLimitGroup(1) the row
                holds, then runs when it is released
            (7) AGENTS.md section 3's kind table gains the two keys, in a
                `run` snippet that validates a definition carrying them
Depends on: W57
Blocks:     W59
Tests:      expected values from spec/flow-definition.md, never from output.
            Negative controls: revert the passthrough and the retry row must
            report `attempts === 0` and a `user_action` (the role is
            non-optional), and the group row must run unblocked; empty
            `Registry.groups` and FD-V31's valid fixture must be REFUSED.
Gate:       L0-L6 in five runtimes, check:spec (C4 covers the new FD-V ids),
            then spec-conformity pass (two readers)
Reserves:   Q256-Q258, no ADR (P16 decision 3 is the decision, taken at the
            plan; this item adds keys to a table and rules beside them)
```

## Scope

**In**

1. **The two static task fields a node can carry, as declared keys.** Fact 1: the scheduler
   accepts eight fields and the driver passes four; of the four unreachable ones, `retryPolicy` and
   `workerGroups` are static per node, `limitKey` is per workload ([Q248](../open-questions.md)) and
   `handleRejection` is irrelevant to a driver that routes on events. **P16 decision 3 says declared
   keys, not an opaque bag**, on the ground that `FD-V17`'s whole job is refusing a key the kind
   does not declare, and an opaque bag is a hole where a typo lives until run time.
2. **A registry set for group ids.** Fact 2 is the reason: a task carrying `workerGroups:
   ["nope"]` against a scheduler with no such group **runs and settles `done`**, no throw, no
   `resource.blocked`. So the name is caught nowhere downstream, and ADR 0002 rule 3's shape — an
   unknown name fails at instantiation — is the only place it can be. `Registry.groups` is the same
   `ReadonlySet<string> | readonly string[]` the other two sets are.
3. **A global default the node overrides.** The scheduler has no pool-level retry default
   (`WorkerManagerOptions` carries none), so a global default is this library's: a driver option,
   applied when a node declares no `retryPolicy`. **The merge rule is one sentence in section 2 and
   it is asserted**: the node's policy wins, whole, never field-by-field.
4. **This is Q16's TASK half.** The scheduler retries an attempt of a task inside one task id and
   reports it on the outcome record's `attempts` field (`OR-R2` carries it through, `log.test.ts`
   asserts 2 and 3 from fixtures). The id's fourth segment is for a FLOW-level retry
   ([Q111](../open-questions.md)) and this item does not mint one; Q16's flow half stays open, with
   its row corrected to say which half landed.
5. **The retry row is the first non-zero `attempts` a scheduler has ever set at any rung** —
   prediction 2, as corrected by its own grep. `examples/workers/flow-worker.ts` gains a role that
   throws on its first call and returns on its second, and the row asserts the record.

**Out** — named rather than left implicit, with where each goes instead

- **`limitKey`.** Per workload; a `needs`-shaped reference if anything. [Q248](../open-questions.md),
  no owner.
- **Flow-level retry** — re-dispatching a node at attempt 1. Q16's other half, out of the plan.
- **A node TYPE carrying these as defaults** — W59's, and it rides on this item's passthrough.
- **A pool-level default in the scheduler** — an upstream want if anyone needs it; not raised, since
  the driver option answers it here.
- **`FD-V17`'s edge table.** An edge carries `to`, `on`, `when`, `needs` and nothing here; both
  new keys are node keys.

## Exceptions

Files edited outside `Owns` and outside section 1 rule 5's record step, each a late exception with
its reason — none was predictable from the `Owns` block, every one is the CONTENT of the change
reaching a sentence somewhere else:

| path | why |
|---|---|
| `spec/outcome-record.md` section 4 | W54's suite re-derives its corpus split on every run and this item's three flows moved it (14 of 136, 122, 90%); the document is a consequence of any corpus change, `spec/README.md`'s `C8` shape |
| `spec/run-state.md` section 7 | the THIRD copy of the same count, standing in the present tense after the other two moved — found by the conformity reader, not by the author's grep, which searched `spec/outcome-record.md`'s phrasing and not the number |
| `AGENTS.md` §11 | the *What does NOT exist* table's retry row said *the scheduler's `retryPolicy`, per task* as the alternative to a feature that now exists |
| `AGENTS.md` §12 | the wiring snippet passes `groups: Object.keys(scheduler.groups)` beside `workerTypes`, because that is where a consumer copies the driver's options from |
| `scripts/check-markdown.mjs` | **[Q142](../open-questions.md) FIRED in the item's final gate**: `M4`'s two-directory fixture rose 3102 → 3532 past a floor of 3490 — this item's spec subsection, register rows, Record and index paragraphs are all link-dense documents neither `removes` probe cuts — so the probe declaring `[M1,M3,M4]` reported `got [M1,M3]` with every other rung green. Retuned 3490 → 3960 from three counts on a scratch copy outside the repository (108 / 4792, 83 / 4386, 66 / 3532), W42's and P15's precedent; the first of the eight retunes found by the gate rather than predicted from the pre-edit margin, which P16's declaration had measured at 388 |

*(The declaration intended to name `AGENTS.md` §9 here; the refusal-count sentence it edited is in
section 3, which is in `Owns`, and §9 has no hunk — the conformity reader.)*

## Verification

How each clause of `Gate:` is actually run. Name the commands.

| clause | command |
|---|---|
| L0 | `npm run lint` and `npm run typecheck`, each redirected to a file and read by `$?` (section 4, v0.16) |
| L1-L5 | `npm test`, `npm run test:deno`, `npm run test:browser:all`, redirected and read by exit code. Baseline **27 files / 703 cases in five runtimes** at `8550978`, plus this item's suites |
| L4 | `npm run check:spec` — `spec/` is **7 documents, 44 examples, 92 rules** at declaration *(P16's figure on `8550978`; **93 rules** on `48975d7`, the tree this item started on, W57 having added `RT-R11` — the conformity reader)*; `C4` must report two more definition refusals and `C8` must see `spec/README.md`'s row move with the document's version |
| L6 | `npm run test:l6` and `npm run test:l6:deno`. Baseline **1061 assertions over 42 real runs** *(on `8550978`; **1138 / 42** on `48975d7`, W57's two observers in — the conformity reader)*; this item adds two rows and states the new numbers in its Record, taken on the tree it ships |
| conformity reader | spec first, code second, re-deriving `FD-V30`'s and `FD-V31`'s expected findings from section 5 before reading the fixtures |
| adequacy reader | **in an isolated copy**, with the author's tree held still (section 6, v0.15). Obligation (e) on `Registry.groups` BOTH WAYS: the validator's set against the scheduler's `resourceGroups` keys is a list-about-a-list, and the bootstrap that would compare them is W59's, so this item states the direction it does NOT close |

**Rule 8 obligation (a) at v0.16: the SHAPES, not only the clauses.** Both keys are exercised on a
task at the top level, on a task inside a `fanout` branch, and on the `branch` task of a `map` —
because a map instance is dispatched N times and a per-node `retryPolicy` is then per instance,
which is the shape the feature was not built for.

**Routing coverage.** A branch routed away from its join ([Q4](../open-questions.md)), no matching
decision edge ([Q10](../open-questions.md)) and a duplicate task id ([Q13](../open-questions.md)) are
**not applicable** — nothing here changes an edge or an id. `user_action`
([Q17](../open-questions.md)) **is covered**: the retry row's role is non-optional, so with the
passthrough reverted its first failure suspends the run, which is the negative control. A nested
fan-out ([Q6](../open-questions.md)) is covered by the fanout-branch shape above.

**Before this item is done it greps the tree for `W58`** outside `doc/` — at this declaration that
returns **0** hits. *(**False as written, and nobody had run it**: at `48975d7`, the tree this item
started on, `git grep W58 -- . ':!doc'` returns **6** — three in `CLAUDE.md`'s current-state lines
and three W57 wrote into `test/driver/surface.test.ts` naming the fields W58 was about to declare.
The 0 was P16's declaration guessing at a measurement. W58's conformity reader.)*

## Declaration step — what was measured before anything was built

Started on `48975d7` (W57's commit), tree clean, no other session in the tree (last `dev-dist/`
write 21:05 the previous evening). `node dev-dist/p16/facts.mjs` re-run first: **fact 1 printed all
FOUR fields** the driver hands `createTask` (`id,workerType,payload,optional`, call site at
`driver.ts:1902`) and fact 2 reproduced (`workerGroups: ["nope"]` → `done`, `task.running,
task.completed`, nothing blocked). Section 5's highest id confirmed **`FD-V29`**, in the document
and in `validate.ts`, so the two new ids are `FD-V30` and `FD-V31`.

**Three stop-and-ask decisions, each MEASURED on a real inline scheduler at 0.5.2 before the
maintainer chose** (`dev-dist/w58/facts.mjs`, 13 retry-policy shapes, the union, the hold, and
`attempts` on both optional settings):

| decision | measured | both priced | the maintainer chose |
|---|---|---|---|
| the shape `FD-V30` accepts | the published type is `{ maxRetries: number; backoffMs: number }`, both required; at run time `{maxRetries:1}` retries with 0 backoff, `{backoffMs:5}` and `{}` **never retry**, `{maxRetries:"1"}` **retries by coercion**, `1.5` retries, `-1` never, a negative `backoffMs` makes Node warn and retry at once; `attempts` reads **1** on the settled task after one retry, optional or not | exact shape (one type, no second default, the coercion refused at construction) against `backoffMs` optional (one fewer key; a second `|| 0` in the driver, a divergent type, `{}` needing its own ruling) | **exact** |
| a `defaultWorkerGroups` | a task's `workerGroups` is a **UNION** with its pool's `groups` — pool `[b]` + task `[a]` acquired `["a","b"]` — so a pool-level default exists upstream; `WorkerManagerOptions` mentions no retry at all | none (group defaults stay on the pool) against a third place stating membership under a second merge rule, and W60 issued | **none — W60's second condition does not fire** |
| when an unknown group is refused | re-measured **with a resource listener attached** (the scheduler emits `resource.*` only once something listens): `["nope"]` still `done`, `blocked=[]`; the scheduler exposes its ids as `Object.keys(scheduler.groups)`; 0 of the ~60 `new Driver(` sites declare a group today | strict (absent set = empty; no construction site changes; the item's own Tests line) against lenient (absent = unchecked; fact 2's silence returns for the consumer who forgot the option) | **strict** |

**The group row's mechanism measured before the row was written**: `ConcurrentLimitGroup` exposes
`onStart()`/`onFinish()`, so the harness can hold its one slot with no foreign task; held, a task
naming it sat `pending` for 150 ms with `resource.blocked@gate` the only event, and on release the
sequence was `blocked, unblocked, acquired, released`. And the scheduler's own retry path
**re-queues without emitting `task.failed`** while retries remain, so the driver sees `task.running`
twice and one `task.completed` — `OR-R4` unmoved.

## Record

**Gate — what ran.** Every rung RUN and redirected to `dev-dist/w58/*.log`, verdict read from `$?`
(`doc/workflow.md` section 4, v0.16); `git status --porcelain` written before and after each
whole-tree measurement and compared. *(Author-pass numbers; re-taken after the readers at the foot
of this table.)*

| Clause | Verdict | Notes |
|---|---|---|
| L0 | GREEN | `lint` 0; `typecheck` 0 across all five sub-typechecks |
| L1-L5 | GREEN | **29 files / 746 cases in node 24.20.0, deno 2.9.6, chromium, firefox and webkit** — from 27 / 705 (742 at the author pass; +4 for the readers' binds). **+2 files**: `test/definition/task-config.test.ts` (both rules, every clause, on all three SHAPES; every kind row of section 2's key table both ways; the corpus flow's three carrying nodes read from section 7's row; the SHAPES list bound to the corpus flow's structure) and `test/driver/task-config.test.ts` (the passthrough on all three shapes, the merge rule with both fields differing and the difference asserted, the byte-identical four-field object for a node that declares nothing, the strict construction refusal, a malformed `defaultRetryPolicy` refused), plus `test/definition/task-shapes.ts`, a helper rather than a suite |
| L4 | GREEN | `check:spec` — **7 documents, 47 examples, 95 rules**, from 44 / 93; `C4` covered **29** definition refusals; `C8` saw `spec/README.md`'s row move to v0.16 |
| L6 | GREEN | **1203 assertions over 44 real runs in node AND deno**, from 1138 / 42 — **+65**: the retry row (region, 21 + 13 extras), the group row (plain, 19 + 6), six cross-row assertions (five at the author pass, one the adequacy reader forced). **Both rows passed first time, and the count matched the arithmetic before the file was run** |
| checks | GREEN | `check:docs` 0 — 23 snippets, 19 `run`, section 3's snippet now carries both keys, a `groups` registry, and the STRICT demonstration (`FD-V31` at `score` with the set omitted); `check:source`, `check:markdown`, `check:policies`, `check:wiring`, `check:scheduler` all 0 |
| rule 8, author pass | **72 provocations, 61 caught, 9 declared ceilings (each RUN against the rung its reason names), 2 controls green, 0 undeclared, 0 aborts, 0 crashes, 0 against declaration** | `dev-dist/w58/rule8.mjs`, a control on all four rungs, restores byte-asserted. **The first pass read 3 undeclared, 2 crashes and 2 against declaration, and five of those seven were the HARNESS** — see *What broke* 1. The other two were message-only clauses masked under their own id (`a1`, `a11`), closed by binding the message |
| conformity reader | **12 findings / 2 blocking** | Spec first, code second, the three fixtures' expected findings re-derived from section 5 before any test was read — and they matched. **Blocking 1**: `spec/run-state.md` section 7 stated *110 of 124 task nodes (89%)* in the present tense — a THIRD copy of the count the item had corrected in two places, found by grepping the NUMBER where the author had grepped the phrase; corrected, a second late exception on that document for the same number. **Blocking 2**: the declaration's *the `W58` grep returns 0 hits* was false at `48975d7` — **6**, three in `CLAUDE.md` and three W57 wrote into `test/driver/surface.test.ts` — a measurement P16 guessed at and nobody ran; corrected in place. Non-blocking, all closed: the intended exception list named `AGENTS.md` §9, which has no hunk (the refusal count is in §3); a blank line inside section 7's table cut the new row off from it in GFM while L4's per-line regex read it anyway; `AGENTS.md` said *a number >= 0* where the rule says *finite*; the browser count in this table was 741 one bind before the final; the Verification table's L4 and L6 baselines were P16's `8550978` figures, not `48975d7`'s; W57's *fields W58 is about to make node-declared* had expired inside `Owns`; `FD-V31`'s repeat clause cited a measurement the harness never took (the provenance is the scheduler's source and now says so); C7 does not read `groups` (a stated limit); and **the tree moved by one line after the readers' digest was taken** — the register's census note, written after the copy — so the digest handed to the readers matched no tree that existed; recorded rather than hidden. **Confirmed independently, every number**: 7 / 47 / 95, C4 29, 23 / 19, 29 / 742 in all five runtimes, 1202 / 0 in both, the L6 arithmetic (21 + 13, 19 + 6, +5), 40 / 40 / 20 / 10 / 11 in `examples/README.md`, rule 8's 72 / 61 / 9 / 2 / 0, the census 200 / 147 / 2 / 51, the corpus split, the strict reading stated identically in seven places, the retry row's values derivable from the worker and the group row's sequence from the scheduler reference's own ordering statements; `Owns` audit 26 paths, nothing outside `Owns` but the intended exceptions. Digest unmoved during the review |
| adequacy reader | **106 mutations / 16 real survivors / 3 blocking**, in the isolated copy, controls green, sha identical at start and end | **Every clause of both rules, every SHAPE in the validator and in the driver, both directions of the merge rule, every Outputs row, both L6 negative controls and every wiring probe were caught** — 73, most by the test written for that clause. **Blocking 1 — the three SHAPES were a list bound to nothing but the printed case count**: the map shape deleted from either suite cost 0, and the compound — the map shape deleted AND a rule or the passthrough narrowed to the other two — cost **0** where the narrowing alone costs 2-3. The item's headline claim (v0.16's obligation (a)) was unfalsifiable by its own suite. Closed: both lists are compared, both ways, to the shapes `task-config.flow.json`'s carrying nodes take, derived from the document's structure in a helper both suites share. **Blocking 2 — the merge test's two policies were literals nothing compared** (W43's shape): made equal, *the default wins* cost 0; closed by asserting the pair differs in both fields. **Blocking 3 — `schedulerGroups` had ONE reading and the driver's registry was downstream of it** (v0.16's *independent*): a literal beside a second registered group cost 0 while clause (2)'s own comment claimed red; closed by a second observer reading the constructor call's source, so the two readings must agree. **And a probe the mutations could not reach: `defaultRetryPolicy` was validated NOWHERE** — `{}`, `null`, a string and an extra key all reached `createTask` — while `retryPolicyProblem`'s own comment claimed the driver's option read it; closed by holding the option to `FD-V30` at construction. Non-blocking, measured and recorded: the two list-about-a-list comparisons have one observer per direction (Q216's shape, declared); one `REFUSED` entry out costs 0 (the whole list out is caught); one map instance's `attempts` out plus one integer costs 0 (the third instance's `retried` marker still observes it); a `retryPolicy` accepted on a `map` kind cost 0 — **closed anyway**, every kind row is now compared; a driver whitelisting `gate` beside the option, and the listener passing a non-number `attempts` raw (a limit, `listener.ts` being outside `Owns`); the `retry` role's per-process memo makes a second row under the same run id red at 19 (nothing asserts the rows' run ids are distinct); and `groups` misspelled on the harness's `DriverOptions` CRASHES L6 with zero FAIL lines because the row loop has no per-row catch — W23's shape, recorded |
| re-run, tree held still | **83 provocations, 73 caught, 8 declared ceilings, 2 controls, 0 undeclared, 0 aborts, 0 crashes, 0 against declaration** on the final pass | the author's 72 plus the readers' eleven exact edits (`r1`-`r7` and their compounds), all caught by the clause written for each; two author-pass ceilings — the SHAPES slice (`d1`) and the literal-plus-second-group compound (`c3c`) — are CATCHES now. **The first pass of the re-run read 13 crashes and 4 aborts, and every one was the HARNESS a second time**: a probe that aborted on a missing anchor left the edit it had already applied in the tree, and every later Node-rung probe crashed at load on it while the held-still check — a `git status` diff — could not see a file that was modified either way. Fixed (an abort restores what it applied), the two leaked edits reverted by hand, the crashed probes re-run. `git status --porcelain` identical before and after each batch |
| `npm run gate` | **GATE EXIT=0, zero lines beginning FAIL, 15 chain entries — on the SECOND run** | The first run over the final tree was `GATE EXIT=1` with zero `FAIL` lines and every rung green but one self-test: `check:markdown:selftest` 36/37, **[Q142](../open-questions.md) fired** (the exceptions table). Retuned from a scratch copy, the self-test alone 37/37 and 7/7, then the whole gate re-run over the tree that ships, redirected to `dev-dist/w58/gate2.log` and read from `$?`, `git status --porcelain` identical before and after: 29 / 746 in node, deno and chromium (firefox and webkit at 746 by `test:browser:all`, same directory); L6 **1203 / 0 in both runtimes**; spec 7 / 47 / 95; markdown 108 documents, 4796 relative links, 247 anchored; docs 23 / 19; **selftests 7/7 completed, 7 ok, 428.1 s wall**; `check:markdown` 37/37, `check:docs` 18/18, `check:policies` 13/13, `check:source` 41/41, `check:scheduler` 41/41, `check:wiring` 24/24. **`W58` outside `doc/`: 92 hits in 19 files, every one this item's annotation** (86 / 17 before the index paragraphs; 6 at `48975d7`); tree digest at the gate `a1443a13b1b0f84c`, and this row is the one edit after it. Diff: 25 files changed, 1075 insertions, 90 deletions, plus 8 untracked |

**Numbers re-taken on the tree that ships, before the gate**: `lint` 0, `typecheck` 0, all seven
checks 0; **29 files / 746 cases in node 24.20.0, deno 2.9.6, chromium, firefox and webkit**;
**1203 assertions over 44 real runs in node and deno**; spec **7 / 47 / 95**, `C4` 29; docs 23 /
19; markdown 108 documents / 4781 relative links / 247 anchored; census **200 / 147 / 2 / 51**, 0
aborts, 200 of 200 in one cluster cell; **`W58` outside `doc/`: 86 hits in 17 files, every one this
item's own annotation** (6 at `48975d7`); every changed file `i/lf w/lf`; `git status --porcelain`
identical before and after the whole pass; tree digest `e99a1633d4e3b901` before the record step.

**Outputs — what was actually built.**

| Declared output | Exists | What would fail without it |
|---|---|---|
| `retryPolicy` and `workerGroups` keys, `FD-V30`/`FD-V31` | section 2's key table and a new subsection, section 5's two rows; `NODE_KEYS.task.opt`, `retryPolicyProblem`, the `FD-V31` block in `validate.ts`; `RetryPolicy` exported from the package root | every clause: `a1`-`a14` (19 of 19 caught after the message binds), the key table both ways (`a18`, `a19`, `b10`), the adjacent spelling `retryPolicies` (`adj1`) |
| `Registry.groups` | the third set, `ReadonlySet<string> \| readonly string[]`, **optional in shape and EMPTY when absent** | the strict reading inverted (`a14`), the registry's key misspelled (`adj3`), the driver reading a literal instead of the option (`e9`) or omitting the set (`e10`) |
| `defaultRetryPolicy` and the merge rule | `DriverOptions.defaultRetryPolicy`, **held to `FD-V30` at construction** (the adequacy reader's `x03` — the first version was typed and unchecked); section 2's sentence, with what is NOT observable stated | the default ignored (`b5`); the check removed (`r6`); the pair collapsed with the default winning (`r3c`). **A field-wise merge costs 0 (`b6`) and the reason is the FACT**: `FD-V30` requires both keys, so the two merges coincide on every valid document — declared, and written into the spec |
| `TaskFactory` widened, `dispatch` passing through | two optional fields on the config; the dispatch site adds a key **only when there is something to pass** | the passthrough reverted, either key: 7 and 5 L1 failures, **7 and 3 at L6** (`b7`, `b8` — the item's declared negative controls: attempts 0 and a `user_action`; the group row unblocked with no resource event); the passthrough narrowed to one SHAPE (`a15`, `a16`); the adjacent spelling `workerGroup` (`adj2`) |
| valid and invalid fixtures | `task-config.flow.json` (all three shapes), `FD-V30--retry-policy-max-retries-is-a-string` (the coercion case), `FD-V31--worker-group-not-in-registry`; `registry.json` gains `groups` | the registry without groups (`b1`), the map branch losing its key (`b2`), either invalid file made valid (`b3`, `b4`), the `FD-V30` file renamed or deleted (`adj4`, `e7`) |
| the retry row and the group row at L6 | `examples/flows/retry.flow.json` (a `map`, three instances each failing once), `group.flow.json`; `RetryWorker` and the `retry` role; `holdGroup`, `attemptsSeen`, `resourceEvents`, `schedulerGroups` on the report; `attempts` and `resourceEvents` on a row; four cross-row clauses | `b13`-`b15`, `d4`, `d5`, `e3`-`e6`, `p1`-`p5`, `c1`, the compounds `c2c`, `c3b`, `c4c` |
| AGENTS.md section 3 | the kind table's `task` row, the executed snippet (both keys, the `groups` registry, the strict demonstration), a subsection with the merge rule and `groups: Object.keys(scheduler.groups)` | `b11`, `b12` at `check:docs` |

**What broke.**

1. **The rule 8 harness applied only the LAST edit per file, and seven probes measured that
   instead of the tree.** `apply()` replaced against the ORIGINAL bytes on every edit, so a probe
   with two edits on one file kept only its second — W37's harness defect verbatim, inside a harness
   that carried a control and byte-asserted every restore (v0.11's two requirements, satisfied
   throughout). It surfaced as `a14` (the strict reading inverted) SURVIVING at exit 0 with the
   `ABSENT` tests reading `ok`, `c3c` CAUGHT *against declaration*, `c4c` and `d1` CRASHING, and
   `c2c`, `c5c`, `c6c` caught for the wrong reason — every compound was its second half alone.
   *Found by reading the failure LINES against what each probe claimed to have done*: a
   compound that costs exactly what its second edit costs alone is not a compound. Fixed; all
   seven re-run; `a14` then caught at 3, `c3c` declared as designed, `d5` caught at 7.
2. **Two clauses were observable only through their message, and their probes survived under
   their own rule id.** An array as a policy has no `maxRetries`, so the missing-key clause
   refuses it anyway (`a1`); a number as a group is not in the set, so the unknown-id clause
   refuses it (`a11`) — W29's `D5` masking shape, same id, same count. Both messages are now
   bound, because the message is what an author reads.
3. **The merge rule's *never field by field* has no observable while `FD-V30` requires both
   keys** (`b6`): a field-wise merge of a complete node policy IS the node policy. Not a hole in
   the test — a clause with no falsifier on any valid document. The spec sentence now says so and
   what it is written for.
4. **The compound `c4c` crashed on this harness's own `holdGroup` guard** rather than reaching
   the assertion it was for — a crash is not a detection — and was rewritten to put the typo in the
   flow rather than in the held group's name; caught at 4.
5. **W54's corpus split moved and its literal lives in a document this item does not own.**
   `test/fold/result-value.test.ts` re-derives *14 of 124, 110 (89%)* from both corpora on every
   run, and three flows with twelve task nodes and no `needs` make it *14 of 136, 122 (90%)*.
   `spec/outcome-record.md` section 4 and Q239 carry the new figure with the old one kept — a late
   exception, and the same shape as `spec/README.md`'s `C8` row: a document made a consequence of
   a corpus change by the suite that binds it.
6. **Four counts went stale the moment the roles and flows grew**, and section 1 rule 5's third
   direction is what found them before a reader did: *NINE roles / TEN pools* in the worker's
   header, *ten, naming nine* in the harness's, *eighteen* flows and *nine* roles in
   `examples/README.md`, *forty-two* runs in `retention.ts` and `run-flow.ts`, and W47's own
   measurement line in `l6.ts` (appended to, not rewritten). And the worker header's *this file
   does not read `context.taskId`* became false the moment the retry role needed a per-attempt
   memo — corrected in place, with what the id is and is not used for.
7. **P16's facts harness misreads fact 1 two MORE ways at exit 0** (Q253 extended): the doc
   comment inside `TaskFactory`'s type reaches the field regex (`…,optional,/**`), and the
   conditional spreads at the call site are dropped by the identifier filter, so it prints the two
   new fields as *unreachable* on the tree that reaches them.
8. **The item's headline claim — every case on THREE shapes — was unfalsifiable by its own
   suite** (the adequacy reader's blocking 1). `SHAPES` was a literal list in two suites, bound
   by nothing but the printed case count; the map shape deleted from either cost 0, and with it
   gone a rule narrowed to the other two shapes cost 0 too. That is W35's `ROW_KEYS` finding on a
   list the author wrote to satisfy v0.16's obligation (a) — *the shapes clause instantiated as a
   step, and the step itself bound by nothing*. Closed by deriving the shape set from the corpus
   flow's structure in a helper both suites compare to.
9. **The merge test's discriminating pair was two literals nothing compared** (blocking 2, W43's
   shape verbatim): made equal, *the default wins* cost 0. One `ok` closes it.
10. **`schedulerGroups` had one reading and the driver's registry was downstream of it**
    (blocking 3): the cross-row clause's own comment promised *a group registered and used by
    nothing is red here*, and with the reading a literal it was not. v0.16's *independent* clause,
    one item after it was written. Closed by a second observer over the constructor call's source.
11. **`defaultRetryPolicy` was validated nowhere while the predicate's comment said the driver's
    option read it** — a false sentence beside the function it described, found by a probe the
    mutations could not reach. Held to `FD-V30` at construction now.
12. **The re-run's harness leaked on its ABORT path**: a probe that aborted on a missing anchor
    kept the edit it had already applied, thirteen later Node-rung probes crashed at load on an
    unbalanced bracket, and the held-still check could not see a file that was modified either
    way. The second harness defect in one item, in the mechanism v0.11 wrote two requirements for
    and v0.14 a third; none of the three names *what happens between an edit and its restore when
    the probe itself fails*.
13. **A third present-tense copy of W54's corpus count stood in `spec/run-state.md`** after the
    author had corrected two (the conformity reader's blocking 1) — the author grepped the PHRASE
    from `outcome-record.md` and not the NUMBER, which is the procedure section 1 rule 5 states
    and the item did not follow to the letter.
14. **Renaming either new suite out of the glob crashed the OTHER at load** for one revision,
    because the L2 suite imported a helper from the L1 suite file: the census would have named
    the missing suite, and instead the runner died with zero FAIL lines. Moved into
    `test/definition/task-shapes.ts`, a helper rather than a suite.

**What this taught.**

- **A harness can satisfy every requirement this repository has written for it and still measure
  nothing** — a control, a byte-asserted restore, every ceiling run — because none of them asks
  whether the probe that ran was the probe that was written. W37 recorded the same defect; the
  requirement that would have caught it is *each edit's anchor is checked against the CURRENT text*,
  which is rule 7 (b) applied per edit rather than per probe. For P16's retro.
- **A masked clause under the same id is invisible to set equality and to the failure count**, as
  W29 found for `D5`; here the message was the only projection that could see it, and binding the
  message is cheap. Two instances in one item.
- **A rule clause can be extensionally vacuous on every admitted document and still be worth
  writing**, if the document says so: *whole* against *field-wise* differs only once a key is
  optional. What is not acceptable is the sentence standing as if it were falsifiable today.
- **The scheduler emits `resource.*` only once something listens**, which the reference does not
  say; P16 fact 2 was taken with no listener and could not have seen a `resource.blocked` even if
  one had been emitted — re-taken with one attached, the answer is the same and now means what it
  says.
- **An obligation instantiated as a step satisfies the step and not the obligation** — v0.13's
  recorded correction, reproduced on v0.16's newest clause. The author enumerated three shapes
  because the rule says to, and the enumeration was itself a literal nothing bound; the reader's
  question was not *did you run the shapes* but *what would say so if one left*. For P16's
  retro: the shapes clause asks for a set, and a set written down is a membership claim.
- **Two harness defects in one item, on opposite sides of the same edit**: the first applied only
  the last edit per file, the second kept the first edit when the second failed. Both were
  invisible to a control, to a byte-asserted restore and to running every ceiling, because all
  three requirements are about a probe that RAN. The requirement that would see both is per-edit:
  *each edit's anchor is checked against the current text, and an edit that cannot be completed
  is undone before the verdict*. For P16's retro, with W37's as the first occurrence.
- **The readers' split held for the thirty-third time**: the conformity reader found claims that
  were false (a count, a grep result, a section number, a word of a range), the adequacy reader
  found bounds that were not there (a list, a pair, an observer, a check). Overlap **1** — the
  `FD-V30` non-object clause's message, reached by the author's set before either reader.

**Questions raised.** [Q256](../open-questions.md), [Q257](../open-questions.md),
[Q258](../open-questions.md); [Q253](../open-questions.md) extended; [Q16](../open-questions.md)'s
row corrected to say which half landed; [Q111](../open-questions.md) confirmed still inert. **No
ADR.**
