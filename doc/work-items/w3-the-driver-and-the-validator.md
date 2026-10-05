# W3 — The driver, the definition validator, and the toolchain the layer is built with

**Status:** done
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
  region events; **what a run *is* is [Q14](../questions/q14.md), which W2 tests.** The driver must
  not accumulate a second copy of run truth on the side, and if it turns out to need one that is a
  finding about the spec rather than a thing to build.
- **Either join policy.** `JP-R1`'s pure state machines are W2's. W3 emits the vocabulary
  (`JP-R5`) and calls `status()`; it must not decide what satisfies a join, and **an implementation
  detail here cannot be allowed to settle [Q4](../questions/q4.md)** — see *Traps*.
- **The join/failure matrix.** W4, gate L0-L5.
- **A real scheduler end to end.** W5, gate L0-L6. W3's tests use a fake `EventTarget` that
  reproduces the two dispatch shapes `OR-R3` describes; **that fake is a fixture and must be
  hand-written from `spec/outcome-record.md` section 3, never captured from a live run** the driver
  also produced.
- **Ladder L3 and L5.** Determinism is a property of the fold (W2); the matrix is W4's.
- **Whether L6 runs in all three runtimes** — [Q33](../questions/q33.md), answered at W5.

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
| **`JP-R5`/`JP-R7`/`JP-R8`** | the driver decides *when* events are emitted, and the opening-order rule exists because `live-token` fires early without it. **Emitting for convenience rather than to the rule can settle [Q4](../questions/q4.md) from inside W3**, where nobody is looking for it |
| **`FD-V14`** | the absent rule. If the validator "helpfully" requires every branch path to reach its join, P1's own example stops validating |
| **`RT-R3`/`RT-R5`** | `types: []` versus `types: ["node"]`, and which config carries the DOM lib. Get these wrong and L0 still passes while checking nothing |

### The named routing cases

`doc/work-items/TEMPLATE.md` asks which of these the item covers.

| Case | | Covered by W3 |
|---|---|---|
| A branch routed away from its join ([Q4](../questions/q4.md)) | **emitted, not judged** | W3 emits `branch.exited`; whether that satisfies a join is W2's policy and W4's answer |
| `user_action` ([Q17](../questions/q17.md)) | **yes, fully** | `OR-R3` detection, suspension, `RS-R1`-`RS-R3` resolution, `branch.suspended`/`branch.resumed` |
| No matching decision edge ([Q10](../questions/q10.md)) | **yes** | `FD-V7` in the validator, `FD-R1` at run time |
| A duplicate task id ([Q13](../questions/q13.md)) | **yes** | `ID-R1`, asserting the scheduler received nothing |
| Nested fan-out ([Q6](../questions/q6.md)) | **refused** | `FD-V15` in the validator. No driver support, deliberately |

## Record

**Gate — what ran.** `RT-R1`: a rung is not green until it is green where it is required to run, and
a row that does not name its runtimes ran in one (`doc/workflow.md` section 4).

| Clause | Verdict | Runtimes | Notes |
|---|---|---|---|
| L0 typecheck | **RAN** — pass | **Node, browser, Deno** | `tsc -p tsconfig.node.json`, `tsconfig.browser.json`, `tsconfig.json` (adds `test/`), `deno check index.ts src/`. Both config gates negative-tested: the browser config rejects `process`, the node config rejects `document` |
| L0 spec check | **RAN** — pass | n/a | `node scripts/check-spec.mjs`, 8 checks, 57 rules. C6, C7 and C8 were each added by a conformity pass and each failed on this item's own output when written |
| L0 source check | **RAN** — pass | n/a | `node scripts/check-source.mjs`, 6 checks, each negative-tested. S6 was added by pass 3 and caught a real break |
| L0 lint | **RAN** — pass | n/a | `deno lint src/ test/ index.ts`, 20 files |
| L0 publish | **RAN** — pass | Deno/JSR | `deno publish --dry-run`. Pass 3 found it **broken**: `index.ts` exported a module the allowlist did not list |
| L1 unit | **RAN** — pass | **Node 24, Deno, chromium, firefox, webkit** | the log, the listener boundary, ids, the region maths |
| L2 routing | **RAN** — pass | **all five** | a fixture log in, an asserted node sequence out, **no scheduler**. The fake is 22 lines |
| L4 conformance | **RAN** — pass | **all five** | 6 valid flows clean, 23 invalid each rejected naming its own rule, `FD-V14` has no case, `p1-routed-away` still valid. Browser parity is enforced against the Node count — verified by dropping one fixture (exit 1) |
| **142 assertions, identical in all five runtimes** | | | |
| spec-conformity ×3 | **RAN** — 1, 1 and 4 blocking | n/a | 85 / 146 / 100 mutations. Every finding acted on; every genuine survivor re-run and caught |
| re-run at `<sha>` | **RAN** — pass | all five | the gate above **is** the re-run acting on pass 3; it lacks only the commit that carries it |

**What is NOT run, and is not this item's:** L3 (determinism — W2), L5 (the join/failure matrix —
W4), L6 (a real scheduler — W5), L7 (a person). `RT-R8` is vacuous: no `*.node.ts` file exists.

**What broke.**

Two things in the decomposition, found by filling in the header block. Fourteen in the artifact,
found by three conformity passes — and the shape of those fourteen is the finding.

1. **L0 as written does not exist for a document item** (the W1 problem, inherited): resolved by
   redefining the rung and paying one file of ownership.
2. **The validator had no owner.** ADR 0002 rule 3 validates at instantiation and instantiation is a
   driver action, so it is W3's — recorded in P1's table rather than discovered at L4.
3. **`deno check` accepts TypeScript Node 24 cannot execute.** A constructor parameter property;
   `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` at load. Four typecheck configurations accepted it. Now
   `RT-R9`, and the first rule here that **no static check enforces** — running the suite under Node
   is the only thing that finds it.
4. **`FD-R1` was unreachable through the public API and the first test lied about that** by
   contorting a driver into an invalid state.
5. **A wrongly-typed edge target slipped all 23 refusals** and produced a run that stopped mid-flow
   with one log record, no error and no `end` node — the silent stop `spec/flow-definition.md`
   section 3 refuses on P1's own validity grounds, reached from an authoring typo.
6. **The corpus tests one case per rule *id* and the rules have clauses.** 23 clause-deletion
   mutations survived; `FD-V7`'s case trips two of its own clauses, so each shadowed the other.
7. **`RT-R4`'s grep did not exist** — the negative tests had been run by hand once and written into
   this Record as though they were a gate.
8. **`JP-R5`'s ordering test could not fail**, and still cannot: `FD-V9` makes branch entries tasks
   and tasks emit nothing on entry, so the interleaving case is unfalsifiable until `FD-V19` or
   `FD-V9` is relaxed. Recorded in `spec/join-policy.md` rather than papered over.
9. **The join could never fire.** No policy seam existed — no `joinPolicy`, no `status()` call, no
   `Region` accessor — and **all 132 assertions passed anyway**, because every test asserted on the
   event stream and none asserted that a run *completes*.
10. **`Region` was never produced in its declared shape** — the one interface W1 wrote so W2 and W3
    would meet at a document rather than at each other's code.
11. **`snapshot()` and `effectiveOutcomeOf` handed out a live `result`.** `Object.freeze` is shallow
    and a spread aliases it: the mirror of `OR-R2`, repeated on the way out by the code written to
    respect it on the way in. **Then the same defect a third time**, on the one exit that actually
    reaches a worker — the next task's payload *was* the previous record's `result`.
12. **The seam's two non-arrival paths had no test**, and deleting either makes `live-token` give
    `arrival-count`'s answer on P1's own flow. Every seam test used an arrival-counting stub.
13. **`deno publish` was broken**: `index.ts` exported `policy.ts` and `deno.json`'s allowlist did
    not list it. `check-source.mjs` derived its published set by walking `src/` on disk, so it could
    never disagree with the allowlist it claimed to check. Now `S6`.
14. **"The run terminates" was a `throw` from an `EventTarget` listener**, which `dispatchEvent`
    **discards** — measured. `FD-R1`, `ID-R1` and `OR-R6` all said it. Now `OR-R10`: caught at the
    boundary, reported, run stopped. The third appearance of the silent-stop signature in this item.
15. **Three things the driver decided that `spec/` did not state**: what a join carries downstream
    (order-dependent — now `null`, and `settleJoin` takes no payload so it cannot be reintroduced),
    what happens when a policy throws, and whether `undefined` is a legal policy state. Q36, and
    `OR-R10`.

**What this taught.**

- **A suite cannot answer a question nothing in it asks.** Three passes, three shapes of the same
  thing: an assertion that could not fail; a half of the system nothing asserted on; a half of the
  *seam* nothing asserted on. Each time the code was correct and the gap was in what the tests were
  **pointed at**. Mutation testing is what converted "would the tests have noticed" from an argument
  into a number, and the number moved 37 → 42 → 20 survivors while the suite grew 68 → 142.
- **The most dangerous defect was invisible to every check and to two reviewers.** The join never
  firing was not subtle — it was the largest behaviour in the item — and it survived a full gate in
  five runtimes plus one conformity pass. **A declared output that was not built has no rung on the
  ladder**: `doc/workflow.md` section 4 climbs over behaviour that exists and never asks whether an
  item produced what its declaration promised. Three occurrences now (the seam, the `Region`
  accessor, `RT-R4`'s grep), which is enough to put to the retro as a rule rather than an anecdote.
- **A guard written against a named failure does not transfer to the author's own blind side.**
  `JP-R7` forbids repairing `arrival-count` with one line; this item's own `live-token` carried
  exactly such a refinement. The same pattern recurred in `spec/runtime-targets.md`, three times: a
  correct observation about one tool generalised into a false claim about the toolchain, twice
  *inside the rewrite written to record the previous instance*.
- **An equivalent-mutant claim is a test hole with a justification attached, so it has to be
  argued.** Four were claimed and three held; the fourth (`assertRunId` in `start()`) was wrong and
  a fanout-entry flow discriminates it. Two more were found and recorded rather than chased — a test
  that chases an equivalent mutant asserts an implementation detail.
- **`RT-R1` earned itself.** *"A runtime is supported only if the gate runs in it"* read as
  ceremony until Node refused to load a construct all four typecheckers accepted, and until the
  browser rung turned out able to run **fewer** assertions than Node while reporting "all passed".

**Questions raised.** Q36-Q39, from the reserved block. Q40 is skipped, never reissued.

| Q | | raised by |
|---|---|---|
| Q36 | What does a satisfied join carry downstream? Currently `null`, deliberately | pass 3 |
| Q37 | Who asks whether a join is stuck, and how often? `joinStatusOf` is a poll | pass 3 |
| Q38 | Is a run that a refusal stopped resumable, or terminal? | `OR-R10` |
| Q39 | Does the library ship a reference join policy for testing, or does that become a default? | the seam |

**ADR 0005-0006 were reserved and neither was used.** Every decision this item made is a spec rule
with its rationale stated in place — `OR-R10`, `RT-R9`, `FD-V24`, `S6`, and the join seam's contract
in `spec/join-policy.md` section 4. `doc/decisions/README.md`: a spec rule with a rationale paragraph
beats a spec rule plus an ADR restating it. The numbers are skipped.

**Spec changes this item made**, each with its rationale in place and none weakening a rule to make
code pass (checked by pass 3): `flow-definition` v0.6, `outcome-record` v0.5, `join-policy` v0.7,
`runtime-targets` v0.6, `task-id` v0.3. Two were **reported conflicts** rather than fixes —
`FD-R1` prescribed a test that cannot be constructed, and three rules said "terminates the run"
where a throw is discarded.
