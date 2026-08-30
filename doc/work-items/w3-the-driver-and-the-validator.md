# W3 — The driver, the definition validator, and the toolchain the layer is built with

**Status:** in review — gate complete, second conformity pass outstanding
**Plan:** [P1](../plans/p1-what-satisfies-a-join.md)

```
Spec:       spec/flow-definition.md (all of it - the validator implements section 5
            and FD-R1), spec/task-id.md sections 1 and 3, spec/outcome-record.md
            sections 2, 3, 5 and 6, spec/join-policy.md section 2 (the driver
            EMITS the vocabulary; it implements no policy), spec/runtime-targets.md
Owns:       src/driver/**, src/definition/**, test/driver/**, test/definition/**,
            and the toolchain: package.json, deno.json, tsconfig.json,
            tsconfig.node.json, tsconfig.browser.json, the test runner
            (no other item may edit these - but see "The toolchain is shared" below)
Inputs:     spec/ at a6edc92 - five documents, 55 rules, 29 examples and
            spec/examples/registry.json; ADR 0001 (the driver is the only thing
            that touches the scheduler and the only thing with side effects),
            ADR 0002 rule 3 (validate in full at instantiation), ADR 0004
            (opt-in routing, suspension, resolution as a log record), ADR 0007
            (normalize at the listener boundary); fyflow-scheduler 0.3.0 as
            SOURCE at ../fyflow-scheduler, not as a remembered line number
Outputs:    (1) a definition validator: definition + registry -> ok | a list of
            violated rule ids, which is what ladder L4 runs against
            spec/examples/**; (2) a driver that dispatches, normalizes events into
            the log, routes, and accepts a resolution; (3) the region event stream
            JP-R5 constrains, which W2's policies consume; (4) a three-runtime
            gate W2, W4 and W5 inherit
Depends on: W1 (done, a6edc92). NOT W2 - P1's table has both fanning out off W1
Blocks:     W5 (needs a real driver). W2, W4 and W5 also inherit the toolchain,
            which is a sequencing consequence of running W3 first, not a
            dependency in the plan
Tests:      one per named rule, expected values from spec/ and never from output.
            20 rules name W3 - listed in Verification below. The corpus is the
            L4 fixture and is W1's, hand-written, never regenerated
            (doc/workflow.md section 5 rule 4)
Gate:       L0-L2 and L4, each in all three runtimes (RT-R1), then the
            spec-conformity pass of doc/workflow.md section 6
Reserves:   Q36-Q40, ADR 0005-0006
```

**ADR 0005-0006 is the last of P1's block.** 0003 is held for Q4 and is W4's; W1 took 0004; 0007
was taken from outside the block. **W2, W4 and W5 reserve ADRs from 0008 onward**, and Q ids from
**Q41**. Recorded here rather than left for whoever declares W2 to discover.

## Scope

**In**

1. **The definition validator** — `spec/flow-definition.md` section 5's 23 refusals plus
   `FD-V14`'s deliberate absence, evaluated against a predicate registry and a worker-pool set at
   instantiation (ADR 0002 rule 3). It reports **every** rule a document violates, not the first:
   `spec/flow-definition.md` section 5 requires an invalid example to be rejected *and* the named
   rule to appear among the findings, and several cases legitimately violate more than one.
2. **Ladder L4** — every file in `spec/examples/valid/` validates, every file in
   `spec/examples/invalid/` is rejected **naming the rule in its filename**. See *The check this
   item exists to make permanent*.
3. **The driver** — subscribe, normalize at the listener boundary into outcome records, derive the
   effective outcome, route, dispatch, refuse a duplicate task id, emit the region event stream.
4. **The inbound resolution API** (ADR 0004 rules 4-6) — the one place anything outside this
   process can change a run, and the only place the driver accepts a command rather than an event.
5. **The toolchain**, under `spec/runtime-targets.md`: `package.json`, `deno.json`, three
   tsconfigs, a test runner that runs on all three runtimes. **The configuration details are
   normative, not taste** — `RT-R3`, `RT-R4` and `RT-R5` each name a setting that silently disables
   a check if it is wrong.

**Out** — named rather than left implicit, with where it goes instead

- **Run state and the fold.** W2 owns `src/fold/**`. The driver produces the ordered log and the
  region events; **what a run *is* is [Q14](../open-questions.md), which W2 tests.** The driver must
  not accumulate a second copy of run truth on the side, and if it turns out to need one that is a
  finding about the spec rather than a thing to build.
- **Either join policy.** `JP-R1`'s pure state machines are W2's. W3 emits the vocabulary
  (`JP-R5`) and calls `status()`; it must not decide what satisfies a join, and **an implementation
  detail here cannot be allowed to settle [Q4](../open-questions.md)** — see *Traps*.
- **The join/failure matrix.** W4, gate L0-L5.
- **A real scheduler end to end.** W5, gate L0-L6. W3's tests use a fake `EventTarget` that
  reproduces the two dispatch shapes `OR-R3` describes; **that fake is a fixture and must be
  hand-written from `spec/outcome-record.md` section 3, never captured from a live run** the driver
  also produced.
- **Ladder L3 and L5.** Determinism is a property of the fold (W2); the matrix is W4's.
- **Whether L6 runs in all three runtimes** — [Q33](../open-questions.md), answered at W5.

### The toolchain is shared, and the fix is structural rather than a permission

W2, W4 and W5 all need to add test suites. `doc/workflow.md` section 7 rule 2 says two items that
edit the same file are one item — which is about merge cost, and P1 is now running **sequentially**,
so the cost is zero. That does not make a shared mutable file a good idea.

> **The test runner MUST discover suites by globbing a directory, so a later item adds a *file*
> rather than editing a shared list.** Same for the tsconfigs: `include` patterns, not enumerated
> files. This is the sibling's shape (`../fyflow-scheduler/tests/runner.ts` takes a suite name) and
> it is what makes "W3 owns `package.json`" a statement about who *creates* it rather than a gate
> every later item has to pass through.

A later item still editing one of these files is permitted, is additive only, and is named in that
item's declaration. Anything else is a spec change to this paragraph.

## Verification

### The rules this item owes a test, and where the expected value comes from

Twenty rules name W3. Each is a coverage requirement (`spec/README.md` rule 4), and
`scripts/check-spec.mjs` check C6 asserts they name an owner — **it cannot assert the test exists,
which is this item's gate and nobody else's.**

| | rules | |
|---|---|---|
| **Definition** | `FD-R1` | routing reaches a node, eligible edges exist, none matches. Unreachable given `FD-V7`; the test is the assertion that `FD-V7` held |
| **Task ids** | `ID-R1`, `ID-R2` | the duplicate-dispatch refusal, and the `runId` charset at run creation. **`ID-R1` must assert the scheduler received nothing** — `addTask` is not called |
| **The log** | `OR-R1`, `OR-R2`, `OR-R3`, `OR-R4`, `OR-R6`, `OR-R9` | the listener boundary, the `result` deep copy, one record per settlement keyed on terminal state, no record for `running`/`progress`, the uncloneable-result refusal, and `DecisionContext.outcome` always being an effective outcome |
| **Resolution** | `RS-R1`, `RS-R2`, `RS-R3` | refusing a resolution for a task that is not suspended — **including a second resolution**, which is the case `RS-R1`'s discriminator exists for |
| **Join vocabulary** | `JP-R5` | at most one terminal event per branch with nothing after it, and every `branch.opened` for a region before any other event for it |
| **Runtimes** | `RT-R1`-`RT-R6`, `RT-R8` | the three-runtime gate itself, the `node:`/global grep, the DOM refusal, the caller-supplied `runId` |

**`OR-R1` is the one to write first and the one most likely to pass for the wrong reason.** Its test
must settle a task, **mutate the live `FyflowTask` after the listener returns** — `timestamp`,
`result` and `error` — and assert the record is unchanged. A `{...e.detail}` implementation must
**fail** it. ADR 0007's *Consequences* says that spread "looks like compliance and is not"; if the
test passes against a deliberately-broken spread, the test is wrong.

### The check this item exists to make permanent

**Ladder L4 is the reason this item runs before W2.** A refusal rule that rejects the spec's own
valid examples has shipped in **two of the four versions of `spec/flow-definition.md`** — `FD-V13`
at v0.1, `FD-V19` at v0.2, the same defect one version apart, the second one rejecting the flow
[P1](../plans/p1-what-satisfies-a-join.md) exists to run. Today that property is held up by a
throwaway script that is **not in the repository** and by one conformity reader who reproduced it.

**L4 is what makes it true of every future version rather than of one that happened to get
checked**, and it is therefore an acceptance criterion for this item rather than a by-product:

1. every `spec/examples/valid/*.flow.json` validates clean against `spec/examples/registry.json`;
2. every `spec/examples/invalid/*.flow.json` is rejected **with its filename's rule id among the
   findings** — which is why the validator reports all violations rather than the first;
3. `FD-V14` has no case and must not acquire one (`scripts/check-spec.mjs` C4 already asserts this;
   L4 must not contradict it).

**If L4 disagrees with `spec/`, stop and report the conflict** rather than adjusting either
(`spec/README.md` rule 2). Given the history, a disagreement here is more likely to be the spec's
fault than the validator's — and that is exactly the finding worth having.

### Traps carried in from W1

Named because they are known, and because each is a way this item could quietly damage P1.

| | |
|---|---|
| **`OR-R1`** | `{...e.detail}` looks like compliance and is not — it copies the top level and still aliases `payload`, `result` and `error`. `spec/outcome-record.md` section 2's field table is the review instrument |
| **`OR-R3`** | a `user_action` task dispatches **`task.failed` first**. Keying on the event name double-counts it and routes a human-intervention case down an error edge |
| **`JP-R5`/`JP-R7`/`JP-R8`** | the driver decides *when* events are emitted, and the opening-order rule exists because `live-token` fires early without it. **Emitting for convenience rather than to the rule can settle [Q4](../open-questions.md) from inside W3**, where nobody is looking for it |
| **`FD-V14`** | the absent rule. If the validator "helpfully" requires every branch path to reach its join, P1's own example stops validating |
| **`RT-R3`/`RT-R5`** | `types: []` versus `types: ["node"]`, and which config carries the DOM lib. Get these wrong and L0 still passes while checking nothing |

### The named routing cases

`doc/work-items/TEMPLATE.md` asks which of these the item covers.

| Case | | Covered by W3 |
|---|---|---|
| A branch routed away from its join ([Q4](../open-questions.md)) | **emitted, not judged** | W3 emits `branch.exited`; whether that satisfies a join is W2's policy and W4's answer |
| `user_action` ([Q17](../open-questions.md)) | **yes, fully** | `OR-R3` detection, suspension, `RS-R1`-`RS-R3` resolution, `branch.suspended`/`branch.resumed` |
| No matching decision edge ([Q10](../open-questions.md)) | **yes** | `FD-V7` in the validator, `FD-R1` at run time |
| A duplicate task id ([Q13](../open-questions.md)) | **yes** | `ID-R1`, asserting the scheduler received nothing |
| Nested fan-out ([Q6](../open-questions.md)) | **refused** | `FD-V15` in the validator. No driver support, deliberately |

## Record

**Gate — what ran.** `RT-R1`: a rung is not green until it is green in all three runtimes, and a row
that does not name its runtimes ran in one (`doc/workflow.md` section 4).

| Clause | Verdict | Runtimes | Notes |
|---|---|---|---|
| L0 typecheck | **RAN** — pass | **Node, browser, Deno** | `tsc -p tsconfig.node.json`, `tsc -p tsconfig.browser.json`, `tsc -p tsconfig.json` (adds `test/`), `deno check index.ts src/`. **Both config gates negative-tested**: the browser config rejects `process` (`RT-R4`), the node config rejects `document` (`RT-R5`) |
| L0 spec check | **RAN** — pass | n/a | `node scripts/check-spec.mjs`, 8 checks, 56 rules |
| L1 unit | **RAN** — pass | **Node 24, Deno** | the log, the listener boundary, ids. 20 assertions |
| L2 routing | **RAN** — pass | **Node 24, Deno** | a fixture log in, an asserted node sequence out, **no scheduler**. 17 assertions |
| L4 conformance | **RAN** — pass | **Node 24, Deno** | 6 valid flows clean, 23 invalid each rejected naming its own rule, `FD-V14` has no case, `p1-routed-away` still valid. 31 assertions |
| **browser at L1/L2/L4** | **RAN** — pass | **chromium, firefox, webkit** | 105 assertions in each, the *same suites*: `scripts/build-browser-tests.mjs` inlines the corpus and generates the entry from the same glob, `scripts/run-browser-tests.mjs` serves the ESM bundle from a loopback origin. **`RT-R1` is now satisfied for all three runtimes.** Two things bit: the corpus assignment had to move into a module imported first, because ES imports hoist above it and the suites loaded fixtures before it ran; and a module script will not execute from an opaque origin |
| L0 source check | **RAN** — pass | n/a | `node scripts/check-source.mjs`, 5 checks, **each negative-tested**. This is `RT-R4`'s mandated grep, which W3 shipped without: the negative tests had been run by hand once and reported as a gate |
| L0 lint | **RAN** — pass | n/a | `deno lint src/ test/ index.ts` |
| spec-conformity | **RAN** — **1 blocking, 10 defects, 10 notes** | n/a | **85 mutations, 48 caught, 37 survived.** Four of the five mutations that would have mattered most were caught; `JP-R5`'s was not. Every finding acted on below |
| **mutations re-run** | **RAN** — pass | Node 24 | every genuine survivor is now caught: M10, M11, M16, M46, M48, M51, M53, M54, M59, M74, and D10's four divergences. Two survivors are **equivalent mutants** and are recorded as such rather than chased |
| re-run at `<sha>` | **NOT RUN** | — | |

**105 assertions after the pass, up from 68.** The additions are clause-level rather than
rule-level, which is what the survivors were about.

**L2 cost twelve lines of fake scheduler**, which is `doc/workflow.md` section 4's own test of
whether the driver leaked: *"if level 2 is hard to write, the driver has reached for the scheduler
somewhere it should not have."* It did not.

**What broke.**

1. **`deno check` accepts TypeScript that Node 24 cannot execute.** The driver used a constructor
   **parameter property** — ordinary TypeScript, accepted by all three typecheckers — and Node
   refused to load the module with `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX`. Node runs TypeScript by
   *erasing types*, not compiling them, so any construct that emits runtime code is rejected at
   load. **No static check in this repository catches it**, and it is now `RT-R9`.
   `spec/runtime-targets.md` v0.4.
2. **`FD-R1` is not reachable through the public API, and the first attempt to test it lied about
   that.** `FD-V7` guarantees a default edge with no `when`, and a default always passes — so a
   valid definition cannot reach "eligible edges exist and none matched". The first version of the
   test contorted a driver into an invalid state to force it, which tests the contortion. It now
   asserts against the pure `selectEdge` directly, and a second test pins the thing that *is*
   reachable: **no eligible edge at all is a path end, not `FD-R1`**.
3. **The three-runtime story is two-thirds true and the gate now says so.** Node and Deno both
   execute TypeScript directly, so `src/`, `test/` and the runner are one tree with no build step.
   The browser needs esbuild and a Playwright harness that do not exist, so its rung is `NOT RUN`
   rather than quietly folded into "all three".

4. **`JP-R5`'s ordering clause has no test that can fail, and it cannot have one yet.** The
   assertion compared a multiset of event *types*, which is identical whether the driver emits both
   `branch.opened` before dispatching either branch or interleaves them. The reviewer replaced the
   two-pass loop with an interleaved one and all 68 assertions passed. **The fix is not a better
   assertion**: `FD-V9` forces every branch entry to be a `task`, and entering a task dispatches
   without emitting, so the two implementations are behaviourally identical today. The order
   assertion is now written properly and catches a driver that emits `opened` *after* a terminal
   event; the interleaving case is recorded in `spec/join-policy.md` as unfalsifiable until `FD-V9`
   or `FD-V19` is relaxed (Q27). **This is the rule whose failure would settle Q4 from inside W3.**
5. **A wrongly-typed edge target slipped every one of 23 refusals.** `{ "to": 5 }` produced zero
   findings: the graph builder filters non-string targets before `FD-V2` can see them, and `FD-V21`
   did not type-check `to`. Driven through the driver it produced a run that stopped mid-flow with
   one log record, no error and no `end` node — **the silent stop `spec/flow-definition.md` section
   3 refuses on P1's own validity grounds**, arrived at from the other direction.
6. **The corpus tests one case per rule *id*, and the rules have clauses.** 23 clause-deletion
   mutations survived. `FD-V7`'s corpus case trips both its "no default" and its "not last" clause,
   so each shadowed the other. Clause-level tests now live in `test/definition/clauses.test.ts` —
   **deliberately not as new files in `spec/examples/invalid/`**, which is W1's normative fixture and
   whose one-case-per-rule shape is a spec decision, not an oversight.
7. **Two crash paths**: `nodes: [null]` and `edges: [null]` threw raw `TypeError`s from inside the
   validator instead of returning findings, breaking the `InvalidDefinition`-carries-rule-ids
   contract W3's own test asserts.
8. **`RT-R4`'s grep did not exist.** The negative tests were run by hand once and written into the
   Record as though they were a gate. `scripts/check-source.mjs` is the checked-in version, and it
   covers what no typechecker does — including `localStorage`, which the Node config misses because
   `@types/node` declares it globally, and `RT-R9`, which nothing checks at all.

**What this taught.**

- **Mutation testing answered "would the tests have noticed" in a way no amount of reading could.**
  Three document passes argued about coverage; this one broke the code 85 times and counted. The
  four mutations that mattered most were caught — `{...e.detail}`, the missing `structuredClone`,
  keying on the event name, the duplicate-id refusal — and the one that was not is the one guarding
  Q4.
- **Two survivors turned out to be equivalent mutants, and saying so is part of the result.**
  Removing `assertRunId` from `start()` is caught only when the entry node is a *fanout*, because
  `buildTaskId` re-checks one frame later; the test now uses a fanout-entry flow so the region
  events cannot escape. Removing `FD-V7`'s "no default" clause leaves the rule still firing through
  its sibling clause with a different message — the rule id is the contract, the message is not, so
  that one is not a hole. **Chasing an equivalent mutant produces a test that asserts an
  implementation detail.**
- **The rule that no check enforces is the one running the code finds.** Seven checks, four
   typecheck configurations and three conformity passes all accepted a parameter property; importing
   the module under Node took under a second to reject it. `RT-R1`'s *"a runtime is supported only
   if the gate runs in it"* stopped being ceremonial the moment it was true.
- **A test that has to contort the system to reach its case is testing the contortion.** `FD-R1`'s
   unreachability is `FD-V7` working. The useful assertion was against the pure function, plus a
   second test for the reachable neighbour the first version silently conflated with it.
- **L4 is now a gate rather than a claim.** Three independent implementations have agreed on the
   corpus — mine at v0.3, the third conformity reader's, and this validator — and only this one runs
   on every change. That is what W3 was sequenced first for.

**Questions raised.** *From Q36-Q40. To be filled at review; none has been forced yet — the browser
rung (Q33) already covers the one gap this item found in P1's plan.*
