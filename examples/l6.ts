/**
 * **Ladder L6 — the gate.** Every real run this repository makes: P1's exit
 * artifact, P2's, P4's, P5's, P6's, **P7's**, **P10's**, **P12's**, **P13's**,
 * **P14's**, **P16's**, **P17's**, **P18's**, **P20's**, **P21's**, **P22's**, **P23's** and **P24's**. *(**P22's** was missing from this
 * list for the whole of P23 — W86 added its rows and not its entry, a THIRD time; W90 adds both.)* *(This list stopped at P12 while W47's two rows and W51's two were in
 * the file — a count carried as prose in the paragraph above this file's own
 * monument to that. W51's conformity reader. **It then stopped at P18 while W78's
 * consumer-road block was in the file**, and the table below omitted that block
 * while carrying W67's SHIM RUN, which is not a row either — W78's conformity
 * reader, finding 6, in the paragraph that is this file's own monument to the
 * class. Twice now, and both times the item that added the rows wrote the
 * monument and not the entry.)*
 *
 * **A run and a row label are two different counts.** A row label is an entry in
 * `EXPECTED[]` or a `PairRow`; a run is one `Driver` on one flow, and a `PairRow`
 * is one label producing **two**. Both numbers in the printed header are derived
 * from the arrays rather than typed, and **this comment no longer states either of
 * them**, which is the whole of the fix.
 *
 * **It carried them as literals through THREE wrong values.** It read *six* for two
 * rows longer than it was true; then *twenty-one* and *nineteen* for the whole of
 * W23, found by that item's conformity reader; then **twenty-five and twenty-three
 * for the whole of P10 and P11** — the file printed 31 and 29 — found at W43's
 * declaration step. The printed counts were right every time; only these were not.
 * **The second fix wrote *"Derive them: `EXPECTED.length + PAIR_ROWS.length` labels,
 * `EXPECTED.length + 2 * PAIR_ROWS.length` runs"* and then restated the literals in
 * the same paragraph** — so the instruction to derive was itself carried as prose
 * beside the numbers it was correcting, and W35 added five rows past it without
 * moving either. *A comment that tells the next reader to derive a number, in the
 * same breath as carrying that number as a literal, is a literal.* The expressions
 * are kept; the numbers are gone, and the only place either count is written is the
 * line this file PRINTS.
 *
 * ```
 *   npm run test:l6         node examples/l6.ts
 *   npm run test:l6:deno    deno run --import-map=examples/deno-import-map.json ... examples/l6.ts
 * ```
 *
 * **Every expected value below was written from the spec before anything ran**,
 * and each is derivable without a scheduler:
 *
 *   - the run-state outcome from `spec/run-state.md` section 3's precedence;
 *   - which policy fires from
 *     [ADR 0003](../doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)'s
 *     matrix, whose eighteen cells were themselves hand-derived from
 *     `spec/join-policy.md` sections 2-4;
 *   - the dispatched task ids from `spec/task-id.md`'s four-segment scheme and
 *     the flow's own node ids.
 *
 * A value taken from output is a snapshot rather than a test
 * (`doc/workflow.md` section 5 rule 2), and the rendered table at the bottom is a
 * **by-product** of the same values the assertions use — never their source.
 *
 * ## What each row is for
 *
 * | | |
 * |---|---|
 * | `fanout-join` x both | the control. Both policies must agree, or the comparison has no baseline — ADR 0003's `all-arrive` row |
 * | `p1-routed-away` at **high** confidence x both | the predicate returns **false**, both branches arrive, both policies fire. Without this row `isLowConfidence` is an assertion that cannot fail |
 * | `p1-routed-away` at **low** confidence x both | **P1's case, on real workers.** `live-token` completes; `arrival-count` hangs, and run state now says `stuck` rather than `completed` ([ADR 0015](../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md)) |
 * | `optional-loss` x both | **ADR 0003's second mechanism, and the ordinary one.** No decision and no routing away — an `optional` task simply fails and its branch is LOST. `live-token` still fires the join; `arrival-count` is `stuck` anyway. It is also the only row where a task settles as anything but `done`, which is what makes the terminal-state assertions able to fail |
 * | **W6 — `failure-edge`** | a failure that **routes**. The one definition feature no P1 row reached: an `on: ["failed"]` edge, ADR 0004's central mechanism, and the case `spec/run-state.md` section 3 uses to define `completed` against `failed` |
 * | **W6 — `suspend / resolve / resume`** | the human-in-the-loop half, and the only inbound API the library has. `user_action` → `awaiting_action` → `Driver.resolve()` → the branch arrives |
 * | **W6 — `suspend / nobody comes`** | the row that separates **waiting on a person** from **stuck**. Same flow, no human: the join has not fired and the run is `awaiting_action`, not `stuck`. It is the only row that ends with a node still `suspended`, and it is expected NOT to finish |
 * | **W6 — `uncloneable`** | a refusal that stops a run, on real workers. `OR-R6` at the listener boundary, reported rather than thrown, folding to `stopped` |
 * | **W133 — `uncloneable`, threaded** | the same flow on a THREAD pool, where `OR-R6` is unreachable (`spec/outcome-record.md` v0.11): the scheduler's own clone refuses the value at the worker boundary, the task ends `user_action`, nothing is reported and the run is `awaiting_action` |
 * | **W14 — `two runs / two drivers / one scheduler`** | **P4's exit artifact**, and the only row that runs two drivers. The pairing `MultipleRuns` tells a caller to build: before [ADR 0023](../doc/decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md) each driver received the other's settlements and dispatched its successors — one task id under two outcomes, with nothing reported. It is `ID-R4` tier 1's only L6 coverage; tier 2 is not reachable here ([Q90](../doc/questions/q90.md)) |
 * | **W17 — `all-exit` × all three policies** | **P5's exit artifact, and the row L6 has never had**: every branch reaches an `end` and nothing arrives at the join. It is the shape [ADR 0003](../doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) records as `live-token`'s cost and the one [ADR 0025](../doc/decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md) turns on. One flow, one payload, three policies, three answers — `completed`, silently `stuck`, and **`stuck` with `joined: false`**, which nothing at L6 had ever reached |
 * | **W19 - the second pair row** | **P6's exit artifact**: the same topology as the row above with **one variable changed** - the scheduler also carries a task this library did not mint. Its settlement lands FIRST, while both runs are live, and both runs still complete. [ADR 0027](../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md) and `ID-R5`, on real workers; under the ADR 0023 rule 2 it supersedes, one such settlement stopped **every** driver on the scheduler. The control row beside it is what makes `onUnmintedTask`'s empty array an assertion rather than a decoration |
 * | **W58 — `retry`** | **P16's first observable, and the first non-zero `attempts` a scheduler has ever set at any rung**: a `map` of three whose branch task declares `retryPolicy: { maxRetries: 1, backoffMs: 0 }` on a pool whose role fails every task id's FIRST attempt. Each instance is retried inside its own id and settles `done` with `attempts: 1` on two observers — the outcome record and the live task — and the per-instance policy is what a single-task row could not show (`doc/workflow.md` rule 8 obligation (a), v0.16) |
 * | **W58 — `group`** | **`workerGroups` on real workers, and P16 fact 2 answered where it shows**: a linear flow whose middle node names a `ConcurrentLimitGroup(1)` this harness holds when the run starts. The task is `resource.blocked` on dispatch, the harness lets go on that very event, and the task runs — the scheduler's own four resource events in order with `task.running` after the acquisition. Its pool declares no group, so nothing but the node's key put it there |
 * | **W59 — `typed`** | **P16's EXIT ARTIFACT, half one**: two nodes of ONE type (`Scorer`) with DIFFERENT settings — `factor` 10 against 100 — each receiving the envelope `{ settings, input }` (`FD-C5`) and computing a different answer from it (9 against 90 from one input); `high` retries ONCE under the TYPE's `retryPolicy` (the node declares none) and reports `attempts: 1` on both observers; both hold `scorer`, the group the type declares, registered through the bootstrap helper and read back by id. The pool is the helper's, keyed by the type's name |
 * | **W59 — `typed-regions`** | **half two, and obligation (a)'s shapes**: a typed task at path `1` inside a fanout branch feeding a typed `map` branch at `1.0`, `1.1`, `1.2` — arity three from a worker's return, each instance's envelope wrapping its OWN item (`JP-R11`) so three confidences give three scores from one settings object; branch 0 is a bare `ScoreWorker`, and the outer join carries the bare result beside the typed region's collection. Every typed id held `scorer`; no bare id did |
 * | **W63 — `transformed` at arity TWO, ONE and ZERO** | **P17's EXIT ARTIFACT, and it is [Q263](../doc/questions/q263.md) as three rows.** One flow: a typed `map` branch whose declared `transform` RESHAPES its own item with the map's settings read through `$settings`, then a fanout of two typed scorers into a join whose typed successor declares `transform: { lang: "jsonata", expr: "$sum([*.score])" }` and NO reshaping node — its worker receiving the reduced value as `input` (`FD-C6`), echoed from the run: **990** when both branches arrive, **400** when one is routed away (P1's own case under `live-token`), **0** — the NUMBER, not `undefined` — when the join is reached by nothing and `live-token` fires it. Every value is what the worker RECEIVED, read off the outcome record and never a literal the row alone carries; the `Echo` pool that evaluates the expression is a real THREAD in both runtimes, loading the adapter by its module URL, and every result it returns reports the fresh realm it ran in. **What these rows observe is the VALUE the successor received and not the record's shape**: JP-R12's key set is observed by `transform-fails`' untyped `publish`, and its `{}` by W17's `all-exit` row — the reduction is key-blind and sums `null` to 0 as it sums `{}` (the adequacy reader, M2 and M6) |
 * | **W63 — `transform-fails`** | **P17 decision 5 end to end.** Two non-optional typed nodes whose transforms fail at run time — `$.confidence + " points"` (`T2002`, an author who meant `&`) and `$now()` (`UNBOUND`, ADR 0052 rule 7) — are retried ONCE under the type's policy, fail again, and are parked `user_action` with `TransformFailed`'s message as the task's error on two observers (`attempts: 1`); a person `resolve()`s each with the value the transform did not supply, the join fires over all four branches and the run completes. Beside them a typed node with NO transform receives `FD-C5`'s two-key envelope to the byte, in the flow whose `Scorer` pool carries no engine — and `note`, a typed node whose transform SUCCEEDS over an ordinary edge's value, `FD-C5`'s first kind, which the exit-artifact flow cannot carry |
 * | **W67 — `triage LOW` and `triage HIGH`** | **P18's EXIT ARTIFACT: a flow and the runtime it needs from TWO JSON DOCUMENTS and a shim.** `examples/registry.json` says what exists — sixteen worker modules (fourteen when W67 wrote this; W82's `gauge` and `stamp` are the other two), five resource groups, seventeen node types (fifteen then), one NAMED pool instance — and `examples/flows/triage.flow.json` names registry keys and nothing else; `run-flow.ts` supplies only what P18 decision 7 keeps as code (a predicate, a custom group TYPE, a custom node-type CLASS, a language adapter) and calls `createRuntime` once. The two rows carry, from the run: a DOCUMENT-declared type (`Prompt`) and a CLASS registered in code (`GpuModel`) over the SAME worker, so the pools they built differ in their derivation alone; a node on its type's DEFAULT instance (`audit`) against one on a NAMED instance of that type (`review` on `prompt-big`), told apart by the pool the scheduler says each ran on AND by what the worker returned — four words against two, because the class derives the model from the instance's config; a BUILT-IN group and a CUSTOM one acquired by real tasks, the custom one naming its object something other than its key; the TYPE's `settings` default reaching a `Prompt` node and not a `GpuModel` one; and a declared `transform` reducing `JP-R12`'s record for the node after the join, with no reshaping node. The HIGH row is the control: one payload field different, `review` never dispatched, and the reduced report six words instead of eight |
 * | **W73 — `FD-R4` on three existing rows** | **P19 decision 5 on real workers, with no new run.** `map / live-token` and `nested-map / live-token` try a payload FIRST that the entry's worker `inputSchema` refuses — a TASK entry naming `ingest`, a FAN-OUT entry naming `scoreA` (every branch held to its own schema over the same value, the first named) — and assert a `BoundaryRefused` at the caller with the scheduler holding nothing, then run on the real payload; W63's `transform-fails` tries its two resolutions FIRST with the values the transforms did not supply, which `echo`'s `outputSchema` refuses with the task still suspended, and then resolves each with the worker's declared example. Both refusal sets are held to the rows that declare them both ways, with their controls as subjects |
 * | **W78 — the CONSUMER ROAD** | **P20's EXIT ARTIFACT, and no `EXPECTED` row could be it**: `runFlow` IS the machinery this block exists not to use — its own `onFoldInput`, its own `inputs` array, its own predicate raced against a backstop. So it is W67's shim-run shape one plan on: ONE label, TWO runs, outside the row loop. **Run A** is a fan-out in which the consumer holds only `{ driver, done }` — the region events counted through `StartOptions.onRegionEvent` ([W76](../doc/work-items/w76-what-start-accepts.md), [Q297](../doc/questions/q297.md)) and the end awaited in ONE line ([W77](../doc/work-items/w77-what-start-returns.md), [ADR 0058](../doc/decisions/0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md)), with no poll, no fold and no deadline but the one ADR 0058 rule 8 says a consumer writes; what `onRegionEvent` received is held EQUAL to the region subsequence of the driver's own fold inputs, element for element, which had never run on a real pool. **Run B** is the pair: its driver REFUSES, and `done` **RESOLVES** with `stopped` carrying `stoppedBy` rather than rejecting — ADR 0058 rules 3 and 4, which had no observer at this rung and none on real workers anywhere. **Reverting W76 alone costs 2 here, W77 alone 8 and both 10** — additive, and before this block each cost ZERO, because both items declared L6 UNMOVED and nothing at this rung reached either. *(W77's read 4 until the conformity reader found the `?? foldedA` fallback handing two clauses the caller's own fold; those two are the difference.)* |
 * | **W82 — `nonconforming` at eleven words and at two** | **P21's EXIT ARTIFACT, and the first rows here whose WORKERS are wrong on purpose.** Four task nodes, two of which return values their own `outputSchema` refuses and are reported BY NAME through `onNonconformingResult` — `gauge`'s `$.load above maximum 1`, a bound its code does not keep past its declared example (`check:workers` runs that example and is GREEN), and `stamp`'s `$.label required`, a key that is present on what `run()` returned and absent from what `OR-R2`'s clone wrote. **Three observers of that second one and the middle is the RECORD**: the scheduler's live `detail.result` still has the key at the harness's own listener, the record does not, and the finding says so — which is why `StampWorker` is INLINE, because a thread hides the attribution and not the finding. The two conforming nodes beside them are EXISTING corpus workers and are reported on not at all, and `attest` reports the key set it RECEIVED, so the value flowing downstream unaltered is an assertion rather than ADR 0060's sentence. **The two-word row is the control** — same flow, same workers, only the payload's word count different, and `gauge` goes silent while `stamp` does not, which separates the two legs from each other |
 * | **W82 — the check-OFF pair** | **ADR 0060 decision 3, and no row could be it**: the row above run AGAIN with the one option removed and the SAME run id, held identical record for record. Dispatched ids, the log with only the clocks zeroed, the folded outcome and every settled result all agree; **the reports are the one thing the two runs differ in**, two against zero. *You cannot audit a behaviour with an instrument that alters it*, which is the sentence P21 tells an adequacy reader to falsify first, and this is the only place it has ever been run on real workers. What it COSTS is asserted as a COUNT and printed as a ratio: a check whose answer is discarded has one observable, and a ratio of two clocks is still two clocks ([Q179](../doc/questions/q179.md)) |
 * | **W90 — block (2g), KILLED and RESUMED** | **P23's EXIT ARTIFACT: a run killed mid-run on real workers and resumed on a FRESH runtime from a store the consumer built by appending events** — the header from the handle, every `onFoldInput` element at its POSITION. At EVERY kill point of `fan-out-per-item` and `triage`, the store frozen mid-step at a settlement and the runtime shut down, then `runtime.resume` on a fresh one: identical to a run nobody killed on outcome AND every node, the re-dispatched ids equal to a derivation from the KILLED process and to what the fresh scheduler holds when `resume` returns. **`shutdown()` DRAINS** (W90's declaration, measured), so the kill is the store and not the shutdown — and every re-dispatched task visibly ran twice. Beside the sweep: THREE processes appending to ONE positional store, with the same events keyed by arrival refused `diverged`; one killed run cut MID-STEP and QUIESCENT, re-dispatching the same set; and a PARKED kill that re-dispatches nothing and is resolved on the resumed driver |
 * | **W94 — `tv-ingest` arranged LAST-first, FIRST-first, and threaded** | **P24's EXIT ARTIFACT: a TV library's files through a `map` whose branch fetches each file and fans out BESIDE — a thumbnail for every file, and `identify` then a `distinct` GATE keyed on `series.id`.** The FIRST file of each series to ARRIVE opens the per-series work and every other file ends at an `end` (`duplicate`, or `nokey` for a file whose name carries no series); both joins fire and the run completes. **No assertion names which file won** (P24 decision 7): the gate clause reads the run's own `gated` elements — one `first` per series, the first of its series to arrive, the per-series task for exactly those branches, what reached the gate handed on. The sizes ARRANGE the order ([Q379](../doc/questions/q379.md)): LAST-first makes first-to-arrive differ from the lowest index and the first dispatched, FIRST-first is its pair (a different file opens each multi-file series, the same series once each), and the threaded row at equal work names no order at all. **The per-series road ends at its own `end`**, so every `beside` instance ends the same way whatever wins |
 * | **W94 — block (2h), the TV ingest KILLED and RESUMED** | **P24's exit artifact, its second half**: block (2g)'s kill — the consumer's store frozen mid-step, the runtime shut down (it DRAINS) — at EVERY one of the run's 25 kill points, resumed on a fresh runtime and IDENTICAL to a run nobody killed on outcome, every node, every branch's decision and the gate's MEMORY, which the replay rebuilt (`RN-R26`). Fifteen kill points lie BEFORE the first decision — [Q386](../doc/questions/q386.md)'s case — and the sweep is shown to DISCRIMINATE the rebuilt memory from a fresh one and from the killed process's, both derived from the killed run |
 * | **W67 — the shim run** | **P18's sample shim's own call, and no row could make it**: `runtime.start(flow, payload)` with NO options. The runtime MINTS the run id and defaults the join policy (decision 10), and both defaults were replaceable by a `throw` for ZERO until this run existed — every row names the ids it expects and the policy it is about. The flow is `p1-routed-away` at LOW, where the two candidate policies DISAGREE: `live-token` satisfies the join and the run completes, `arrival-count` waits for an arrival that cannot come. So *the run completed* IS *the default is `live-token`*, observed rather than named |
 */
import {
  InvalidTaskId,
  POLICIES,
  // W58: the two keys `FD-V30` requires, compared to the scheduler's own `.d.ts` in the
  // cross-row block — through the package root, like everything else here.
  RETRY_POLICY_KEYS,
  // **W51's, and they reach the package ROOT like everything else here.** The
  // cross-row block below reads a reference's SHARED REGION DEPTH through the
  // shipped derivation rather than from a list of node names beside itself, so a
  // flow that stops being a sibling pair moves the clause with it.
  // *(That these three are on the package surface at all is
  // [Q221](../doc/questions/q221.md) — an `export *` made them public the moment
  // they were declared, and nobody chose it.)*
  allRegions,
  branchIndices,
  branchPathOf,
  buildGraph,
  buildTaskId,
  parseTaskId,
  sharedRegionDepth,
  // **W86**: `UnresolvedBranchPath` is `ID-R6`'s own class, and the clause that reads it names the
  // class rather than catching everything — see its comment.
  UnresolvedBranchPath,
  // **W78, and they reach the package ROOT like everything else here.** P20's exit artifact
  // holds `done` against the caller's own expression — `fold(driver.foldInputs())` — so the two
  // halves of decision 2's invariant are the same two functions a consumer would have called,
  // imported the way `AGENTS.md`'s own snippets import them.
  // W82: the printed cost line below applies the SHIPPED value check to every result this rung
  // settled, which is the same expression `OR-R13` runs — reached through the package ROOT, so the
  // number is about what a consumer's driver would pay rather than about a copy of it.
  findings,
  fold,
  isTerminal,
  // **W47, and it reaches the package ROOT like everything else here.** An example
  // that reached past `index.ts` would be exercising a surface no consumer has —
  // `AGENTS.md`'s own snippets import this name from `'fyflow-orchestration'`, so
  // asserting a refusal here asserts the refusal a consumer gets.
  validateDefinition,
  // **W94**: the route-coverage clause reads the routes the built-in TYPE declares — a second source beside the file
  // table the TV rows derive their counts from — through the package ROOT, as a consumer would.
  distinct,
  // **W90, P23's EXIT ARTIFACT**: block (2g) resumes runs through `runtime.resume` and names the refusal a
  // wrongly-keyed store gets, the header it stores and the driver it reads back — through the package ROOT.
  ResumeRefused,
  type CheckpointHeader,
  type Driver,
  type FlowDefinition,
  // **W86**: block (2f)'s SECOND ROAD to the overlap annotates the sequence it walks, and nothing
  // else in this file names the union. `lint` and both L6 rungs STRIP types, so the only rung that
  // reads this is `typecheck:examples` — which is why the item's own `Gate:` line runs the five
  // lanes separately, and why the confirming gate is where a missing type import surfaces.
  type FoldInput,
  // W82: the check-OFF pair compares two runs' LOGS record for record, so it names the record type
  // rather than stringifying an `unknown[]` — the comparison is over `OR-R2`'s own shape.
  type JsonSchema,
  type LogRecord,
  type PolicyId,
  type RegionEvent,
  type RunOutcome,
  type RegionRun,
  type RunState,
  type UnmintedTask,
  type UnsatisfiableJoin,
} from '../index.ts';
import {
  runFlow, runPair, violations, registryDocumentFor, THREADABLE_TYPES, codeFor,
  // W78: P20's exit artifact builds its own runtime, because it holds NOTHING `runFlow` builds.
  buildRuntime,
  // W67: the registry DOCUMENT this rung runs, and the predicates the shim registers. Compared
  // here to the types the flows name, to the pools the scheduler reports, and to the document's
  // own bytes read back off disk.
  REGISTRY_DOCUMENT, PREDICATES,
  // W110: the DERIVED UI document a row runs, so the clause that bounds the derivation can read it.
  uiRegistryDocumentFor,
  // W63: the ONE languages object the helper wrote pool configs from and every driver was handed —
  // compared here to the languages the flows NAME, both ways.
  LANGUAGES,
  // **W110 — P26's exit artifact.** `UI_REGISTRY_DOCUMENT` is the second document, read here for
  // the clause that says it declares NO predicates and that its worker and type entries are the
  // shared document's; `UI_NAMED_PREDICATES` is the one name the paired flow needs, and the only
  // predicate FUNCTION this artifact reaches.
  UI_REGISTRY_DOCUMENT, UI_NAMED_PREDICATES,
  type ForeignTask, type PairFacts, type Retention, type RunReport,
} from './run-flow.ts';
/** W110: a row may carry its own predicate registry, so `Expectation` needs the type. */
import type { Predicate } from '../index.ts';
// **W63, through the sub-path's ENTRY — the one path the reaches-past-index clause below exempts by
// name.** The helper's own reading of which types transform in which languages, compared on every
// L6 definition to a derivation this file makes without it, so the function the pools were built
// from cannot quietly read a different document than the row runs.
import { transformLanguagesByType, type RunHandle } from '../src/scheduler/index.ts';
import fanoutJoin from '../spec/examples/valid/fanout-join.flow.json' with { type: 'json' };
import routedAway from '../spec/examples/valid/p1-routed-away.flow.json' with { type: 'json' };
// **Local to `examples/`, and that is [Q44](../doc/questions/q44.md) again.** The
// corpus cannot express an `optional` branch node with no `on: ["failed"]` edge —
// the only shape that reaches `branch.lost` by SETTLING — so W4 defined one in
// `test/matrix/` and W5 defines one here. Second occurrence; the register row says
// a gap re-found by every later item is the signal, and this is that.
import optionalLoss from './flows/optional-loss.flow.json' with { type: 'json' };
// W6's two, and the same [Q44](../doc/questions/q44.md) reasoning: the corpus has
// no flow whose branch is a NON-optional task that fails (the only road to
// `user_action`), and none whose task returns a value `structuredClone` refuses.
import suspendResume from './flows/suspend-resume.flow.json' with { type: 'json' };
import uncloneable from './flows/uncloneable.flow.json' with { type: 'json' };
import exitLast from './flows/exit-last.flow.json' with { type: 'json' };
// **W17's, and the same [Q44](../doc/questions/q44.md) reasoning a third time.**
// The corpus's `fanout-failure` is the all-exit SHAPE and is not usable here: it
// reaches the second exit through a `user_action` and a human, which would add a
// resolution race to a row whose point is elsewhere. This one takes the two roads
// to `branch.exited` that need no person — a decision, and an `on: ["failed"]`
// edge — and both branches share one `end`.
import allExit from './flows/all-exit.flow.json' with { type: 'json' };
import nested from './flows/nested.flow.json' with { type: 'json' };
import nestedSuspend from './flows/nested-suspend.flow.json' with { type: 'json' };
// **W35's three, and [Q44](../doc/questions/q44.md) a FOURTH time — but the reason
// is narrower than the three above and worth stating exactly.**
//
// `spec/examples/valid/map-fanout.flow.json` is usable here in every respect but
// one: its entry node is an `IngestWorker`, and that pool's role returns
// `{ confidence }`. A map's `over` needs an ARRAY on the value the map node
// receives, so running the corpus flow unchanged would mean making `IngestWorker`
// return items for **twenty other rows** that do not want them — a pool meaning two
// things so that one row need not declare a flow. `map.flow.json` is therefore the
// corpus flow with **two fields changed** — `ingest`'s `workerType`, and `flowId`,
// which every flow here must own. Diff them; the invitation is only worth making if
// it survives. *(This said "one field changed" and the diff shows two. W35's
// conformity reader, on a sentence that tells the reader to run the diff.)*
//
// `nested-map.flow.json` is the corpus's `map-in-fanout` **shape** and not a
// substitution on its text: nine node lines differ, because every pool it names runs
// a role that would break the row — `ExtractWorker` throws and `MergeWorker` returns
// a value `structuredClone` refuses. What is kept is the STRUCTURE: a map inside one
// branch of a fan-out, its own join, and the outer join over both. **Its entry is the
// `fanout` itself** (`FD-V3` refuses only a `join` or an `end` there), because
// `FD-V9` makes a fanout's branch entries tasks — so a map cannot BE a branch, and
// the task that feeds it must receive the run's own payload to have anything to
// split. *(This claimed "the same substitution", which the diff refutes. W35's
// conformity reader.)*
//
// `map-no-array.flow.json` is `map.flow.json` with `over` reading `"rows"`, which
// no worker here produces: `FD-R2`, the one map refusal no validator can make.
import map from './flows/map.flow.json' with { type: 'json' };
import nestedMap from './flows/nested-map.flow.json' with { type: 'json' };
import mapNoArray from './flows/map-no-array.flow.json' with { type: 'json' };
import mapAlias from './flows/map-alias.flow.json' with { type: 'json' };
// **W43 — P12's exit artifact, and the three flows are LOCAL rather than the
// corpus's for one reason each.** `spec/examples/valid/` holds all three under the
// corresponding `flowId`, and those are the normative documents; these are the same
// SHAPE with the `workerType` names this file's pools register, which is the split
// [Q44](../doc/questions/q44.md) has recorded since W5.
//
// **"The same GRAPH with the workerType names changed" is what this said, and it is
// true of two of the three** — W43's conformity reader.
// `decision-on-an-earlier-step` also renames its middle node `score` to `tally`,
// names a different predicate, and points `review` at a different pool, and the
// paragraph below then says the `TallyWorker` substitution *"is the whole of what
// makes it discriminating"* — true of the discrimination and false of the diff, in
// the sentence above the one that states the diff.
//
// **Each also owns its own `flowId`**, prefixed `l6-`. The first drafts reused the
// corpus ids verbatim, which would have been the first such collision in the
// repository and is refused by `examples/README.md`'s own sentence about
// `map.flow.json`: *"the `flowId` every flow here must own"*. Nothing enforces it,
// so the reader found it by reading — same conformity reader.
//
//   - `map-with-context` — [Q166](../doc/questions/q166.md)'s *score each item
//     against the run's config*. The corpus points its map-feeding node at
//     `IngestWorker`, which returns no array, so the corpus document run verbatim
//     here stops at `FD-R2` — measured at W43's declaration. It points at
//     `SplitWorker`, and its branch entry at **`WeighWorker`**, the role W43 adds
//     because no shipped role reads a declared key.
//   - `map-over-region-output` — [Q165](../doc/questions/q165.md)'s *score, then
//     fan out over the scores*, with **no `over: "0"` anywhere**, which is the
//     brittleness that row names rather than a workaround for it. Same
//     `SplitWorker` substitution and nothing else.
//   - `decision-on-an-earlier-step` — [Q8](../doc/questions/q8.md)'s own
//     sentence since P1, and the row W42 has no other coverage at. Its middle node
//     is **`TallyWorker`**, not the corpus's `ScoreWorker`, and that is the whole
//     of what makes it discriminating: `tally` returns `{seen, word}` and carries
//     **no `confidence` at all**, so a predicate reading `ctx.outcome` can never
//     route to review and one reading `ctx.needs` always can. With `ScoreWorker`
//     the two carry the same number and reverting W42 costs zero — measured at the
//     declaration step, on the flow this row would otherwise have been.
import mapWithContext from './flows/map-with-context.flow.json' with { type: 'json' };
import mapOverRegionOutput from './flows/map-over-region-output.flow.json' with { type: 'json' };
import decisionOnAnEarlierStep from './flows/decision-on-an-earlier-step.flow.json' with { type: 'json' };
import referenceIfItRan from './flows/reference-if-it-ran.flow.json' with { type: 'json' };
import mapPastADecision from './flows/map-past-a-decision.flow.json' with { type: 'json' };
import siblingFanouts from './flows/sibling-fanouts.flow.json' with { type: 'json' };
import siblingMapFanout from './flows/sibling-map-fanout.flow.json' with { type: 'json' };
// **W58's two, and [Q44](../doc/questions/q44.md)'s reason a further time, narrower still**:
// `spec/examples/valid/task-config.flow.json` carries both keys in all three shapes and is
// validated at L4 and never run, because its `MergeWorker` is the corpus's and every pool it
// names runs a role that would break a row. What a real retry and a real block look like are
// these two — one node each, on the pools `buildScheduler` registers for exactly that.
import retryFlow from './flows/retry.flow.json' with { type: 'json' };
import groupFlow from './flows/group.flow.json' with { type: 'json' };
// **W59 — P16's exit artifact: two nodes of ONE type with DIFFERENT settings**, and the typed
// shapes obligation (a) asks for: `typed` is the plain pair (one retrying under the TYPE's
// policy), `typed-regions` a typed task inside a fanout branch feeding a typed `map` branch at
// arity three.
import typedFlow from './flows/typed.flow.json' with { type: 'json' };
import typedRegions from './flows/typed-regions.flow.json' with { type: 'json' };
// **W63 — P17's exit artifact: a declared TRANSFORM on a join's typed successor, run at three
// arities**, and the failure road beside it. `transformed` is a typed map branch reshaping its own
// item, then two typed scorers into a join whose typed successor reduces `JP-R12`'s record through
// `$sum([*.score])` with no reshaping node; `transform-fails` is two typed nodes whose transforms
// fail at run time — parked `user_action`, resolved by the harness — beside one that has none.
import transformed from './flows/transformed.flow.json' with { type: 'json' };
import transformFails from './flows/transform-fails.flow.json' with { type: 'json' };
import triageFlow from './flows/triage.flow.json' with { type: 'json' };
// **W82, and it is the one flow here whose workers are WRONG on purpose.** `examples/workers/gauge.ts`
// declares a bound its own code does not keep past its declared domain and `examples/workers/stamp.ts`
// returns a value that conforms as `run()` returned it and does not survive `OR-R2`'s clone — the two
// legs of W80's prediction 3, constructed because P21 fact 3 measured that the corpus has no live
// instance of either left. Both modules' headers say so at the top.
import nonconformingFlow from './flows/nonconforming.flow.json' with { type: 'json' };
// **W86, and it is the flow this library could not express before
// [ADR 0062](../doc/decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md)**:
// a `map` whose branch opens a second `map`, so one opener is entered once per outer item and the
// inner arity comes from run-time data at BOTH levels. [W33](../doc/work-items/w33-a-map-at-run-time-arity.md)
// refused this shape at `Driver` construction; P22 lifted the refusal whole.
import fanOutPerItem from './flows/fan-out-per-item.flow.json' with { type: 'json' };
// **W94, P24's EXIT ARTIFACT**: a `map` over a TV library's files whose branch fetches each file and fans out BESIDE —
// a thumbnail for every file, and `identify` then a `distinct` GATE keyed on the dotted path `series.id` — so the first
// file of each series opens the per-series work and every other file ends at an `end`
// ([W94](../doc/work-items/w94-a-tv-series-ingest-through-a-gate-on-real-workers.md)).
import tvIngest from './flows/tv-ingest.flow.json' with { type: 'json' };
// **W110 — P26's EXIT ARTIFACT, and the two documents are a PAIR.** `ui-emitted.flow.json` is a
// complete flow whose only code is the domain workers; `ui-emitted-named.flow.json` is that document
// with ONE edge's `when` replaced by `{ "predicate": "weakAndPlural" }` and nothing else changed.
// The cross-row block asserts that the difference is still exactly that one edge, because whatever
// makes a pair differ is itself a claim (`doc/workflow.md` rule 8's fourth requirement on the set).
import uiEmitted from './flows/ui-emitted.flow.json' with { type: 'json' };
import uiEmittedNamed from './flows/ui-emitted-named.flow.json' with { type: 'json' };
import failureEdge from '../spec/examples/valid/failure-edge.flow.json' with { type: 'json' };

/**
 * **The scheduler version this run actually used — read from the half THIS RUNTIME
 * loaded.** [W36](../doc/work-items/w36-the-scheduler-pin-moves-to-0-5-1.md). The
 * banner at the end of this file named `0.3.0` as a literal, so the one line in the
 * repository reporting *which scheduler the real-worker rung ran against* could say
 * anything at all, and did not move when the pin did.
 *
 * **The two runtimes reach the scheduler by different roads and this reads the road
 * each one took** — ADR 0029: Node resolves the bare specifier through npm and gets
 * `node_modules/fyflow-scheduler`; Deno resolves it through the import map and gets
 * JSR. **The first version of this read `node_modules` in BOTH**, with a comment
 * claiming it was *"the thing that was loaded"* — true in Node and **false in
 * Deno**, where it reported the npm manifest for a run that had loaded JSR. It read
 * correctly only because `D3` forces the two halves to agree, so the bug was
 * invisible exactly while the check it depends on was passing. W36's adequacy
 * reader, and `doc/workflow.md` section 1 rule 5's writing clause applied to a
 * comment in code.
 *
 * **A path rather than `import ... with { type: 'json' }`**, because 0.5.2's
 * `exports` map does not expose `./package.json` — measured, and equally true at
 * 0.3.0 — so the specifier form is refused by Node's resolver.
 */
const SCHEDULER_VERSION: string = await (async () => {
  const isDeno = typeof (globalThis as Record<string, unknown>).Deno !== 'undefined';
  const read = async (u: URL): Promise<string> => {
    const deno = (globalThis as Record<string, unknown>).Deno as
      { readTextFile?: (x: URL) => Promise<string> } | undefined;
    return deno?.readTextFile
      ? await deno.readTextFile(u)
      : await (await import('node:fs/promises')).readFile(u, 'utf8');
  };
  try {
    if (isDeno) {
      // The import map IS the Deno pin — `D3` compares it to the npm one and `D6`
      // asserts this rung actually passes it to `deno run`.
      const map = JSON.parse(await read(new URL('./deno-import-map.json', import.meta.url))) as
        { imports?: Record<string, string> };
      const spec = map.imports?.['fyflow-scheduler'] ?? '';
      const m = /@([\d][^@]*)$/.exec(spec);
      return m ? m[1]! : `(unparsed: ${spec || 'no mapping'})`;
    }
    const pkg = JSON.parse(await read(new URL('../node_modules/fyflow-scheduler/package.json', import.meta.url))) as
      { version?: string };
    return pkg.version ?? '(no version in the installed manifest)';
  } catch (e) {
    // **Named for the runtime that failed, not for a road it never took.** This
    // returned `'(from the import map)'` unconditionally, so a Node run whose read
    // failed printed a claim about a file Node never consults — measured by pointing
    // it at a missing manifest: 489 assertions, exit 0, and a false banner. The
    // `catch` stays wide, because a banner must not fail a run; what it says is now
    // true of whichever runtime reached it.
    const why = e instanceof Error ? e.message : String(e);
    return isDeno ? `(unread from the import map: ${why})` : `(unread from node_modules: ${why})`;
  }
})();

/**
 * **The predicates this rung registers, and since W67 they live in the SHIM rather than here** —
 * P18 decision 7's *what stays code, exactly*, and P18's own sample puts the predicate beside
 * `createRuntime`. `examples/run-flow.ts` declares all three with their reasoning; the document's
 * `predicates` names them, and `createRuntime` compares the two halves BOTH ways.
 *
 * Aliased here so the rows below, and the cross-row clause that compares the map's keys to the
 * document's list, read one object.
 */
const predicates = PREDICATES;

interface Expectation {
  key: string;
  definition: FlowDefinition;
  /**
   * **`PolicyId`, not a hand-written literal union — W17.**
   *
   * It read `'arrival-count' | 'live-token'` until ADR 0025 shipped a third
   * policy, and W16's declaration claimed that line *"stops compiling the moment
   * `POLICIES` gains a member"*. **It does not, and W16 measured it**: a literal
   * union is a SUBSET of `PolicyId`, so `POLICIES[e.policyId]` still resolves and
   * the whole gate stays green with a policy nothing here runs. The type was inert
   * as a forcing function and is now merely honest — `keyof typeof POLICIES`,
   * derived from the shipped set rather than repeating half of it.
   *
   * **What actually forces a row per policy is an assertion**, and it is in the
   * cross-row block below: the set of `policyId`s these rows exercise must equal
   * `Object.keys(POLICIES)`. That is `JP-R9`'s shape one rung up — compare the two
   * halves rather than copy one of them.
   */
  policyId: PolicyId;
  /**
   * **`text` is W35's, and it is where a map's ARITY comes from.** The `split`
   * role returns one item per word, so the number of tasks a map row dispatches is
   * `text.split(' ').length` — a property of a value a worker returned, which is
   * the one thing `FD-V9` makes impossible for a `fanout`. An empty string is a
   * lawful map of zero items (`FD-R2`).
   */
  payload: { confidence?: number; text?: string; url?: string; files?: readonly TvFile[] };
  threaded: boolean;
  /**
   * **This row runs `examples/ui-registry.json` rather than `examples/registry.json`** — W110, and
   * P26's exit artifact is the only thing that sets it.
   *
   * The UI document declares the four workers `ui-emitted.flow.json` names and **no predicates**,
   * which is what makes `predicates` below able to be EMPTY: `createRuntime` compares the document's
   * names and the code's functions **both ways**, so an empty registry is unreachable against a
   * document that declares three. Measured at W110's declaration step, all four combinations.
   */
  uiRegistry?: true;
  /**
   * **The predicate registry THIS row runs with** — the seam W67 left for *a row that wants a
   * different predicate set*, and until W110 nothing used it (that item's own Record says so).
   *
   * **The artifact's rows are what it is for, in both directions**: `ui-emitted`'s four rows pass
   * an EMPTY map and the cross-row block asserts it was empty, and `ui-emitted-named`'s two pass a
   * map of exactly ONE name. Omitted, a row gets the shared three — so a row that forgets the key
   * does not quietly get an empty registry.
   */
  predicates?: ReadonlyMap<string, Predicate>;
  /**
   * **Which POOL each named task actually ran on, read off `scheduler.tasks` — W67.**
   *
   * The driver dispatches a task whose `workerType` is `node.pool ?? node.type` (v0.19), so this is
   * the run's own record of which INSTANCE of a type a node was sent to — the one observer that can
   * tell a node on its type's DEFAULT pool from one on a NAMED instance of the same type WITHOUT
   * re-reading the definition — which is the whole of its provenance, and the reason the cross-row
   * clause below pins its key set to the SCHEDULER's own task map rather than to this row's ids.
   * Swapping two entries here is red. *(This said the two differ *and nowhere else in a `RunReport`*,
   * which is false: `nodeResults` differ too, because the sample's worker answers differently per
   * MODEL — W67's adequacy reader, a4.)*
   */
  poolOfTask?: Record<string, string>;
  /** From `spec/run-state.md` section 3. */
  outcome: RunOutcome;
  /** From `spec/task-id.md`, in dispatch order. */
  dispatched: string[];
  /**
   * From ADR 0003's matrix: did the driver route out of the join. **Absent on a
   * flow with no fan-out** — a declared value there would be dead, and a
   * copy-paste from a fan-out row would carry it silently.
   */
  joined?: boolean | null;
  /** From `spec/join-policy.md` section 2 — how each branch left its region. */
  settled?: Record<string, 'arrived' | 'exited' | 'lost'>;
  why: string;

  // --- W6's rows need three things W5's did not ---
  /**
   * **The region this row is about** — `null` when the flow has no fan-out, and
   * then `regions` must be empty.
   *
   * **It used to be read as the literal `'split'` in eighteen places** and this
   * field was only ever compared to `null`. Every L6 flow named its fanout
   * `split`, so nothing had ever distinguished *the* region from *the region
   * called `split`* — which is W22's `Cell` finding one rung up, and which a
   * nested flow makes false immediately.
   */
  regionId?: string | null;
  /**
   * **Every OTHER region of the run, with its own expected answer** — W23.
   *
   * A nested flow has two, and `joined`/`settled`/`branchEvents` above are all
   * singular. This carries the rest, keyed by `fanoutId`; the row's own
   * `regionId` is not repeated here, so the two cannot disagree about it.
   *
   * **Declared per region rather than as a second pair of fields**, for the same
   * reason `Cell.regions` is a `Record`: a depth-3 row has three, and a row that
   * had to name which of its joins it was *really* about would be making the
   * choice this field exists to remove.
   */
  otherRegions?: Record<string, {
    joined: boolean | null;
    settled: Record<string, 'arrived' | 'exited' | 'lost'>;
  }>;
  /**
   * Dispatched ids this row expects to have **no** effective outcome. **Two rows
   * declare it, for two different rules**, and the first version of this comment
   * named only one:
   *
   *   - the refusal row — `OR-R6` throws at the listener boundary and therefore
   *     writes no record at all;
   *   - `suspend / nobody comes` — `spec/outcome-record.md` section 7: **a
   *     suspended node has no effective outcome**, because it has not finished and
   *     nothing routes.
   */
  unsettled?: string[];
  /**
   * The `RunFailure.kind` the single reported failure must have. Absent = none
   * expected. Checked against `kind` rather than against the message text, and
   * paired with an assertion that the message names the task id (`OR-R6`).
   */
  runFailure?: string;
  /**
   * Branch paths this row's "human" resolves when they suspend, and **the node
   * each one parks at**.
   *
   * **`at` is declared rather than derived — W23, and the derivation was wrong in
   * two ways at once.** The expected id used to be built as
   * `nodes.find((n) => n.kind === 'fanout').branches[Number(b)]`: the **first**
   * fanout, indexed by `Number(branchPath)`. At depth 1 both are right by
   * coincidence — there is one fanout and `Number('1')` is 1. On a nested flow the
   * first fanout is the OUTER one and `Number('1.0')` is **1**, so the expected id
   * named `scoreB` — the outer branch entry — for a branch that parked at
   * `reviewC` two levels in. It is [Q117](../doc/questions/q117.md)'s defect a
   * second time, on the **expected** side of the assertion that was supposed to
   * catch it.
   *
   * The id is still derived from `spec/task-id.md` — `buildTaskId` over
   * `branchIndices(path)` — but the NODE is the row's own claim.
   */
  resolveOnSuspend?: Record<string, { at: string; as: 'done' | 'failed'; result?: unknown; actor: string;
    /** **A value tried FIRST that `FD-R4` must REFUSE** — W73; `result` is then the second attempt. See `RunOptions.resolveOnSuspend`. */
    refusedFirst?: unknown }>;
  /**
   * **A payload tried FIRST that `FD-R4` must REFUSE at `start()`, and the task node the refusal must NAME** — W73.
   * The node is the row's own claim about which of the payload's first targets refuses it (the entry
   * task, or a branch task of an entry fan-out), read from the row's definition and the registry's schemas.
   */
  refuseAtStart?: { payload: { confidence: number; text?: string; url?: string }; node: string };
  /** Overrides the harness default. Set only where the backstop is the expected result. */
  backstopMs?: number;
  /** Outcomes the run must have passed through, even if it did not end in them. */
  outcomesSeen?: string[];
  /**
   * Outcomes the run must **never** have been in at a quiescent point.
   *
   * **Sound only because `outcomesSeen` is sampled at quiescent points.** While it
   * sampled every element it also contained the artefacts `spec/run-state.md`
   * section 3 enumerates — rows 10 and 11 both recorded a transient `completed`
   * and a transient `stuck` — so an exclusion would have been false. It is also
   * what makes the sampling point itself falsifiable: an inclusion passes whether
   * the tracker is quiescent or a constant.
   */
  outcomesNotSeen?: string[];
  /**
   * The region-event stream **for one branch**, in order.
   *
   * Per branch rather than across branches, because the order *between* branches
   * is fan-out completion order and `doc/workflow.md` section 5 rule 5 forbids
   * asserting it. Within one branch the causal order is fixed by `JP-R5`.
   */
  branchEvents?: Record<string, string[]>;
  /** How each path ended, in order — `spec/run-state.md` section 3's discriminant. */
  pathEnds?: { reason: string; at: string }[];
  /**
   * `regions[*].suspended` — branch paths parked on a person **right now**.
   *
   * **CURRENT, not cumulative — `spec/run-state.md` `RN-R6` v0.13** (W133): a path
   * enters on its `branch.suspended` and leaves on its `branch.resumed` or its
   * terminal event. *(Until v0.13 the spec said nothing about the lifetime, and
   * this comment asserted it as the fold behaved and reported the gap as
   * [Q62](../doc/questions/q62.md).)*
   */
  regionSuspended?: string[];
  /** `stoppedBy` — set only when a refusal terminated the run (`OR-R10`, `RN-R8`). */
  stoppedBy?: string;
  /**
   * **`stoppedBy` names the refusal's class EXACTLY ONCE** — W133, P30 decision 2 ([Q63](../doc/questions/q63.md)).
   * Declared by the `uncloneable` row and, since W140, by the `FD-R2` row: until W140 `UnresolvedMapArity`'s
   * message opened with its own class name, as nine refusal classes' messages did ([Q533](../doc/questions/q533.md)),
   * so that row could not declare it — and W133's probe p12, the driver dropping the class from `stoppedBy`, stayed
   * green there because the message supplied the prefix. P31 decision 2 dropped the name from all nine.
   */
  stoppedByNamesItOnce?: true;
  /**
   * **What the reported failure's message must name — W35.** Every string here
   * must occur in it. Omitted, the row asserts its own `dispatched` ids, which is
   * `OR-R6`'s wording and was the only case until `FD-R2` — a refusal that fires
   * before any task of the node it names has been dispatched.
   */
  failureNames?: string[];
  /**
   * A dispatched node's folded `result`. Used to pin **`JP-R12`** — a satisfied
   * join carries the arrived branches' results keyed by `branchPath`
   * ([ADR 0037](../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md),
   * answering [Q36](../doc/questions/q36.md)). The matrix asserts it at L5; these
   * two rows are the same claim **on real workers**, which is the only place the
   * value has crossed a worker boundary. *(This read *"a satisfied join carries
   * `null` downstream, which `spec/` does not fix"* — both halves false since v0.13,
   * and left in the present tense above the corrected expectations. W34's
   * conformity reader.)*
   */
  nodeResults?: Record<string, unknown>;
  /**
   * **Which region event satisfied the join — W17, and it exists because the
   * arrangement it pins was reversible with the whole gate green.**
   *
   * `spec/join-policy.md` section 4 asks the policy after **every** terminal
   * event, *"because a join can become satisfiable when the last live branch was
   * `lost` or `exited`"*, and W6 built two rows to reach those two paths by giving
   * the settling-last role a longer delay in `buildScheduler`. **That arrangement
   * was held down by nothing.** Measured by this item's provocation sweep: swap
   * which role gets the long delay and
   *
   *   - `settleJoin` can be deleted from the **`lost`** path with all 336
   *     assertions passing — W6's original defect, exactly, restored;
   *   - `exit-last` stops catching its deletion from the **`exited`** path
   *     entirely, dropping from four failures to none.
   *
   * So the row that exists to reach a path stopped reaching it, silently, on a
   * one-word edit to a different file. This field is the assertion that makes the
   * arrangement's *effect* observable rather than hoped for — read from the
   * sequence as the last `region` element before `joinSettled`.
   *
   * **Declared only where the causal order is ARRANGED, never where it is a
   * race.** On `p1-routed-away` both branches are `ScoreWorker`s with the same
   * delay, so which of them settles the join is genuinely non-deterministic and
   * asserting it would be the flake `doc/workflow.md` section 5 rule 5 forbids.
   * The presence of this field is therefore itself a claim: *this row's causal
   * path is determinate, and here is why* — in the row's own comment.
   */
  joinSettledBy?: 'branch.arrived' | 'branch.exited' | 'branch.lost';
  /**
   * **What `onUnsatisfiableJoin` reported — W17, and the clause nothing here had.**
   *
   * `spec/join-policy.md` section 4: on `unsatisfiable` the driver *"reports it
   * with the policy's own `describe`, and routes nowhere"*. Three things have to be
   * true and only one of them was assertable before this field existed:
   *
   *   - the callback fired, **once** — the whole array is compared, so twice fails;
   *   - it carried the policy's own `describe`, which is the half that says **why**
   *     the join can never fire, and which the harness used to flatten to a string
   *     and throw away;
   *   - `joined: false` and the successor never dispatched, which the `joined` and
   *     `dispatched` fields above already carry.
   *
   * **Checked on every row, not only where it is non-empty.** `[]` everywhere else
   * is what makes this an assertion about the driver rather than about one row: a
   * policy reporting a dead join on a run that finished would fail twelve rows.
   *
   * `describe`'s expected value comes from `spec/join-policy.md` section 3's third
   * row read against `JP-R2` — the live count at zero, having been positive, with
   * no arrival — and it is the same value `test/matrix/matrix.test.ts` asserts for
   * the `all-exit/live-token-requiring-arrival` cell at L5. Two rungs, one
   * derivation, neither read off the other.
   */
  unsatisfiable?: UnsatisfiableJoin[];
  /**
   * **This row's run is expected NOT to finish**, and reaching the backstop is
   * its result rather than its failure. True only for a run parked on a person
   * that nobody resolves — `RN-R12` makes `awaiting_action` non-terminal because
   * such a run genuinely is not over, and asserting otherwise would be asserting
   * the opposite of the rule.
   */
  expectBackstop?: true;
  /**
   * **The `attempts` a settled task's OUTCOME RECORD must carry, per task id — W58, and it is
   * the first non-zero `attempts` a SCHEDULER has ever set at any rung** (P16 prediction 2:
   * `test/driver/log.test.ts` feeds 2 and 3 to the listener from fixtures, and nothing above
   * L1 had ever seen one). Two assertions per id, over two observers that reach the field by
   * different roads: the record, which is the driver's listener copying the live task's
   * field (`OR-R2`), and `RunReport.attemptsSeen`, read at the harness's own listener off the
   * live object. A row that declares this is the only kind of row on which `attempts` is
   * non-zero, and the cross-row clause says so both ways.
   */
  attempts?: Record<string, number>;
  /**
   * **What the scheduler said about a task's resources, in order, per task id — W58.** The
   * `resource.*` events on the task's behalf with its `task.running` interleaved (see
   * `RunReport.resourceEvents`), so a row asserts not only that the task was blocked but that
   * it was blocked BEFORE it ran. Two assertions per id. Every row that does not declare it is
   * covered by the cross-row clause: no task anywhere else produced a resource event, because
   * no other node names a group and no pool declares one.
   */
  resourceEvents?: Record<string, string[]>;
  /**
   * **WHICH groups a task acquired, by id, per task id — W59.** `resourceEvents` says a resource
   * event happened; this says the group was the one the node's TYPE declares. Read from
   * `RunReport.heldGroups`, the `groupId` of every `resource.acquired` on the task's behalf, so a
   * pool that quietly lost its `groups` — or gained a second one — fails on the value. One
   * assertion per declared id, and the cross-row clause beside the resource-event one requires
   * every task that reported a resource event to be declared under this OR `resourceEvents`.
   */
  heldGroups?: Record<string, string[]>;
  /**
   * A group `buildScheduler` registers whose one slot the HARNESS holds when the run starts
   * and releases once a task is reported blocked behind it — `RunOptions.holdGroup`.
   */
  holdGroup?: string;
  /**
   * **W63 — the ERROR a task settled with, by id: substrings its outcome record's `error` must
   * carry, asserted on two observers.** A declared `transform` that fails at run time is the TASK's
   * failure (ADR 0051 rule 5) and `TransformFailed`'s message — the language, the expression, the
   * engine's own code in brackets — is what the scheduler records as the task's error; the record
   * (`OR-R2`) and the live task at the harness's own listener (`RunReport.errorsSeen`) must both
   * carry it. Declared on the failing-transform row alone; the cross-row clause requires that a
   * `transform failed` error occurs in exactly the rows that declare one. **W133 declares the second kind**: the
   * scheduler's own clone error on the threaded `uncloneable` row, which is not a transform's, so that clause reads
   * the rows whose declared substrings name a `transform failed` rather than every row declaring this field.
   */
  taskErrors?: Record<string, string[]>;
  /**
   * **The rule a row's `taskErrors` are about — W133.** Omitted, `ADR 0051 rule 5` (a failed transform), which is
   * every row that declared `taskErrors` before W133. The threaded `uncloneable` row declares the scheduler's own
   * clone error, which is `OR-R6` v0.11's, and its adequacy reader (finding 5) measured that row going red under a
   * TRANSFORM's rule id — a provocation is evidence only when it fires for the reason it names.
   */
  taskErrorsRule?: string;
  /**
   * **Every record the LOG holds for a task, in order — W133**, as `<kind>:<terminalState>:<result|no result>`.
   * One assertion per declared id. Its adequacy reader (finding 1, BLOCKING) made the listener write a SECOND
   * `outcome` record for the threaded row's clone-error `user_action` and L6 stayed green: `OR-R3`'s drop of the
   * first event of the pair is held at L2, but that settlement exists only on a real thread.
   */
  records?: Record<string, string[]>;
  /**
   * **Turn `OR-R13`'s result check ON for this row — W82, and the PRESENCE of the option is the
   * whole of the switch** ([ADR 0060](../doc/decisions/0060-a-run-time-result-check-is-a-reading-and-never-a-refusal.md)
   * decision 4, and there is no boolean beside it here for the same reason there is none there).
   * Every row that omits it asserts `nonconforming: []`, in the cross-row block, which is what
   * makes the OFF position a claim about the DRIVER rather than a fact about one row.
   */
  checkResults?: true;
  /**
   * **What the check must report, per task id, in document order — W82, `OR-R13`.**
   *
   * Each value is the finding list as `describeFindings` renders it, derived from the worker's
   * declared `outputSchema` and the payload BEFORE anything runs: `gauge`'s eleven words over a
   * ten-word budget is `1.1` against a declared `maximum: 1`, and `stamp`'s label is a
   * non-enumerable own property, which `required` accepts on the value `run()` returned and
   * `structuredClone` does not carry.
   *
   * **A row declaring this asserts the WHOLE report** — the id set both ways and the findings per
   * id — so a driver that reported a third node, or reported one of these twice, fails on the set
   * rather than on a count.
   */
  nonconforming?: Record<string, string>;
  /**
   * **The own property NAMES the SCHEDULER's live result carried at settlement, per task id — W82,
   * and it is the first of three observers of one fact.**
   *
   * `RunReport.settledOwnKeys` is read at the harness's own listener before `OR-R2` has cloned
   * anything, so this is what the worker returned; the RECORD's own keys are what the run carries;
   * and `nonconforming` above is what the check says about the second. **Only an INLINE pool makes
   * the first two differ** — a thread serialises the result at its own boundary, so a row declaring
   * this is making a claim about `OR-R2` and its type must be inline, which is `tally.ts`'s
   * reasoning one rule across.
   */
  settledOwnKeys?: Record<string, string[]>;
  /**
   * **A region with MORE THAN ONE INSTANCE, by the opener's own `branchPath` — W86, and it is the
   * field `regionId`/`otherRegions` structurally could not be.**
   *
   * Those two name a region by its OPENER and read it through `soleRegion`, which is total only
   * while every opener is entered once in a run
   * ([ADR 0062](../doc/decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md):
   * *a region INSTANCE is the pair*). A `map` whose branch opens a region enters that opener once
   * per item, so its answer is N answers and there is no sole one — which is the whole shape this
   * plan exists for.
   *
   * Keyed by opener id, then by the opener's own `branchPath`, valued exactly as `otherRegions` is.
   * Two assertions per instance, and the base clause that compares the set of openers the RUN
   * entered to the set the row declares reads these keys too — so an instance that stopped existing
   * fails naming its opener rather than passing at a lower count.
   */
  regionInstances?: Record<string, Record<string, {
    joined: boolean | null;
    settled: Record<string, 'arrived' | 'exited' | 'lost'>;
  }>>;
  /**
   * **Which region INSTANCE each branch path's events name — W86, `RegionEvent.regionPath`, and
   * nothing at this rung could observe it before.**
   *
   * ADR 0062 rule 3 gives every one of the six `RegionEvent` variants a `regionPath` beside its
   * `regionId`, *so the two places a region is named to a consumer agree*. W84 shipped that field
   * and declared **L6 UNMOVED**, which is exactly the statement that no run here read it: the value
   * crossed the fold, reached `onRegionEvent`, and was asserted by nothing on real workers.
   *
   * Declared per branch path as `openerId@openerPath`, and compared against the SET of pairs that
   * branch's events actually carried — so an event stream that named the right region and the wrong
   * instance is red on the value, and one that named two different instances for one branch is red
   * on the set.
   */
  regionEventKeys?: Record<string, string>;
  /**
   * **What the row's GATE decided, asserted from the run's OWN `gated` elements — W94, P24's exit artifact.**
   *
   * P24 decision 7: *first* means first to reach the gate in THIS run, so **no assertion here names which file
   * won** — only that exactly one did per key, that it was the first of its key to ARRIVE, that the per-series task
   * ran for exactly the branches the gate routed `first` (so `dispatched` above leaves `opens`' ids out, and they
   * are asserted here instead, derived from the run), and that what reached the gate is what left it. `keys` and
   * `routes` are the PAYLOAD's — written from the file names, never read off the run.
   *
   * `arranged` is the row's ARRANGEMENT, and it is asserted beside the claim ([Q379](../doc/questions/q379.md), and
   * `doc/workflow.md` rule 8 obligation (a)'s selection clause): `last-first` says the first to arrive is NOT the
   * lowest index of any multi-file series and not the first `from` dispatched; `first-first` is the pair's other half,
   * where the order IS the index order. A row with no `arranged` (the threaded one) asserts no order at all.
   */
  gate?: {
    node: string;
    from: string;
    opens: string;
    keys: readonly string[];
    routes: { first: number; duplicate: number; nokey: number };
    arranged?: 'last-first' | 'first-first';
    /**
     * **Where the row's `from` task must have RUN — declared, and NOT derived from `threaded`.** Rule 8's second pass
     * measured the first cut, which compared the realm to `threaded ? 'thread' : 'harness'`: the adequacy reader's exact
     * edit — the threaded row flipped to `threaded: false` — moved BOTH sides and survived. A knob and the claim about
     * it cannot share a source.
     */
    realm: 'harness' | 'thread';
  };
}

const FJ = fanoutJoin as unknown as FlowDefinition;
const RA = routedAway as unknown as FlowDefinition;
const OL = optionalLoss as unknown as FlowDefinition;
const SR = suspendResume as unknown as FlowDefinition;
const UC = uncloneable as unknown as FlowDefinition;
const EL = exitLast as unknown as FlowDefinition;
const FE = failureEdge as unknown as FlowDefinition;
const AE = allExit as unknown as FlowDefinition;
const NE = nested as unknown as FlowDefinition;
const NS = nestedSuspend as unknown as FlowDefinition;
const MP = map as unknown as FlowDefinition;
const NM = nestedMap as unknown as FlowDefinition;
const MNA = mapNoArray as unknown as FlowDefinition;
const MAL = mapAlias as unknown as FlowDefinition;
const MWC = mapWithContext as unknown as FlowDefinition;
const MRO = mapOverRegionOutput as unknown as FlowDefinition;
const DES = decisionOnAnEarlierStep as unknown as FlowDefinition;
const RIR = referenceIfItRan as unknown as FlowDefinition;
/**
 * **W47's, and it exists because its adequacy reader CONSTRUCTED it.** The item
 * had recorded the conditional ARRAY form as unreachable at L6 and its reader built
 * a flow of exactly the shape P13 is about — a decision routing around a whole map
 * region — that validates with zero findings, runs, and makes
 * [ADR 0042](../doc/decisions/0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md)
 * rule 4's ARRAY half observable: `resolveReference`'s `t.form === 'all' ? [] :
 * ABSENT` was deletable for **zero** L6 failures before these two rows.
 */
const MPD = mapPastADecision as unknown as FlowDefinition;

/**
 * **W51's, and the row this plan exists to produce.** Two sequential `fanout`
 * regions, with BOTH branches of the second declaring `needs: {"own": ".",
 * "first": "scoreA1"}` against branch 0 of the first.
 *
 * **Before [ADR 0044](../doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)
 * this document validated with ZERO findings and its run STOPPED**: `publishB1` at
 * path `0` resolved because the two strings matched, and `publishB2` at path `1`
 * hit `FD-R3`. No arity anywhere in it, `FD-V29` correctly calling the target
 * certain, and which branch the author wrote the reference in deciding whether the
 * run completed. *The corpus contained no sibling `fanout` pair at all, which is
 * why nothing had seen it* — P14 decision 3.
 */
const SFO = siblingFanouts as unknown as FlowDefinition;
const TY = typedFlow as unknown as FlowDefinition;
const TR = typedRegions as unknown as FlowDefinition;
const TX = transformed as unknown as FlowDefinition;
const TF = transformFails as unknown as FlowDefinition;
/**
 * **P18's SAMPLE, and it is W67's exit artifact** — `examples/flows/triage.flow.json` beside
 * `examples/registry.json`: two JSON documents, one shim, and a run.
 *
 * It carries, in one flow, every shape P18's exit-artifact paragraph names: a DOCUMENT-declared
 * type (`Fetch`, `Prompt`) and a CLASS registered in code (`GpuModel`); a node on its type's DEFAULT
 * pool instance (`audit`) and one on a NAMED instance of the SAME type (`review`, on `prompt-big`);
 * a BUILT-IN resource group (`vendor`, a `RateLimitGroup`; `gpu`, a `ConcurrentLimitGroup` held as
 * RESIDENT) and a CUSTOM one (`budget`, a `DailyBudgetGroup` the shim registers as a group TYPE); a
 * predicate on a decision edge inside a fanout branch; and a declared `transform` reducing the
 * join's record (`JP-R12`) for the node after it, with no reshaping node.
 */
const TRI = triageFlow as unknown as FlowDefinition;
/**
 * **A `map` region and a `fanout` region as SIBLINGS, at arities neither derives
 * from the other** — W51, and it is P14's question in one document.
 *
 * The map's arity is a run-time fact (`split` returns one item per word) and the
 * fanout's is written down (`branches` has two). At `'a bb ccc'` that is **three
 * against two**, and both `pubA` at path `0` and `pubB` at path `1` receive **all
 * three** scores. Under the prefix rule each received the ONE output whose index
 * matched its own — `pubA` got `score@0` and `pubB` got `score@1`, and the third
 * was reachable from nowhere.
 *
 * **This is the row that makes reverting ADR 0044 cost something at L6.** W50
 * measured that revert at **6 L1-L5 failures and ZERO here**, because all eleven
 * aimed references in both corpora had a shared region depth of zero and paths
 * that were prefix-comparable anyway ([Q214](../doc/questions/q214.md)).
 */
const SMF = siblingMapFanout as unknown as FlowDefinition;
const RT = retryFlow as unknown as FlowDefinition;
const GR = groupFlow as unknown as FlowDefinition;
/**
 * **W82 — P21's EXIT ARTIFACT: a flow whose workers return values their own `outputSchema`
 * refuses, and a run that says so BY NAME without changing anything.**
 *
 * Four task nodes on one path, two of which are reported and two of which are not:
 *
 * | node | worker | what the check says |
 * |---|---|---|
 * | `gauge` | `gauge` | **`$.load above maximum 1`** — a bound the producer's own code does not keep past its declared domain, which is [Q302](../doc/questions/q302.md)'s shape reconstructed |
 * | `stamp` | `stamp` | **`$.label required`** — a value that CONFORMS as `run()` returned it and does not survive `OR-R2`'s clone |
 * | `attest` | `attest` | nothing — and it reports the key set it RECEIVED, which is `['words']`, so the key the record lost is missing downstream too |
 * | `publish` | `publish` | nothing |
 *
 * **The two silent nodes are EXISTING corpus workers**, so the check is silent on the corpus's own
 * in the very run where it fires twice — and `nonconforming` is asserted as a SET both ways, so a
 * driver reporting a third is red on the id rather than on a count.
 *
 * **Both workers are GREEN at `npm run check:workers`** — it runs each on its declared input
 * example, and one example confirms a schema at ONE value — **and `checkWiring` calls every arc of
 * this flow `fits`**, because it reads two SCHEMAS and never a value. *Neither tool is wrong and
 * neither can see either of these*, which is
 * [ADR 0060](../doc/decisions/0060-a-run-time-result-check-is-a-reading-and-never-a-refusal.md)
 * consequence 8 with an observer on real workers.
 *
 * **Its two types are INLINE and must be**, for `tally.ts`'s reason one rule across: a threaded
 * pool serialises a result at the thread boundary, so `stamp`'s label would be gone before the
 * driver saw it. The finding would still be reported — measured at this item's declaration step,
 * identical at `inline: true` and `inline: false` — and *the ATTRIBUTION would not survive*, which
 * is the whole of what makes this leg a claim about `OR-R2` rather than about a transport.
 */
const NC = nonconformingFlow as unknown as FlowDefinition;

/**
 * **W86 — P22's EXIT ARTIFACT: *score each item, then fan out per item*, and it is the first flow
 * in this repository where a region opens INSIDE a `map` region.**
 *
 * ```
 * ingest -> perWord(map over items, branch shard)
 *   shard -> perShard(map over shards, branch grade)
 *     grade -> recheck          when isLowScore
 *     grade -> gather           otherwise
 *     recheck -> gather
 *   gather(join of perShard) -> collect(join of perWord) -> publish -> done
 * ```
 *
 * **`perShard` is entered ONCE PER OUTER ITEM**, so at two items it has two INSTANCES —
 * `perShard@0` and `perShard@1` — which is exactly what
 * [W33](../doc/work-items/w33-a-map-at-run-time-arity.md) refused at `Driver` construction and what
 * [ADR 0062](../doc/decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md)
 * rule 1 keys by `(opener node id, the opener's own branchPath)`. Under the refusal this document
 * could not be run at all; under a driver keyed by the opener ALONE it reported `stuck` with every
 * task settled.
 *
 * **Both arities come from DATA and neither is in the document.** `perWord`'s comes from `split`'s
 * items — one per word — and `perShard`'s from what `shard` returned for THAT item, one per
 * character. So the two instances of `perShard` differ in WIDTH (two shards against three) and in
 * ROAD (one of instance 0's shards scores below fifty and is sent to `recheck`), and neither
 * difference is expressible in a `fanout`, whose branch entries `FD-V9` requires to be written down.
 *
 * **The road difference and the word-length stagger are the ARRANGEMENT, and the block below
 * asserts their EFFECT rather than trusting it** — [W17](../doc/work-items/w17-the-all-exit-row-at-l6.md)'s
 * `joinSettledBy` lesson, whose whole point is that *the row that exists to reach a path stopped
 * reaching it, silently, on a one-word edit to a different file*. What the arrangement buys is the
 * one thing a per-instance key is FOR: an instant at which TWO instances of one opener are each
 * holding a collection. `ADR 0046` rule 3 releases a region's collection the moment its join becomes
 * terminal, so without an overlap a driver that keyed `arrivals` by the opener alone would give the
 * RIGHT answer — the window would never contain two instances at once
 * ([Q349](../doc/questions/q349.md), [Q353](../doc/questions/q353.md)).
 *
 * **A real pool does not arrange that for you**, which is the plan's own *it must try what no fact
 * here measured*: the overlap below is DERIVED from the run's own fold-input sequence and asserted,
 * never hoped for, and the control row is the same flow at ONE item, where the derivation must
 * report that it did not happen.
 */
const FOPI = fanOutPerItem as unknown as FlowDefinition;

/**
 * **P18's sample's payload, and the ONE field the two rows differ in** — W67. `text` and `url` are
 * shared so that everything downstream is a function of the model and the settings; `confidence` is
 * what `isLowConfidence` reads off `classify`'s result, so it is the whole of what decides whether
 * the NAMED pool instance runs. Four words, because that is what makes the small model's two and
 * the large model's four distinguishable — at one or two words they would be equal.
 */
const TRIAGE_TEXT = 'alpha bb ccc dddd';
const TRIAGE_URL = 'https://example.invalid/doc';
const TRIAGE_LOW = { confidence: 0.4, text: TRIAGE_TEXT, url: TRIAGE_URL };
const TRIAGE_HIGH = { confidence: 0.9, text: TRIAGE_TEXT, url: TRIAGE_URL };

/* **W86's two payloads live BELOW W67's block, not above it** — this item first inserted them
 * between that docblock and the `TRIAGE_*` constants it documents, so a paragraph reading *`text`
 * and `url` are shared … **Four words*** sat immediately above a two-word payload with no `url`.
 * W86's conformity reader, finding 8. */
/**
 * **W86's two payloads, and every number in its two rows is derived from these two strings.**
 *
 * `split` makes one item per word and `shard` one shard per character, so the text chooses BOTH
 * arities; `shardConfidence` maps `a`-`j` to 0.1-1.0, so it also chooses each inner branch's score
 * and therefore its road. `'ja eee'` is two items of widths two and three, with `a` at 0.1 the one
 * shard `isLowScore` sends to `recheck`; `'ja'` is the same item alone.
 *
 * **The two differ in the word COUNT and in nothing else** — `'ja'` occurs in both, so the control
 * row's every value is the other row's instance 0, character for character. Whatever makes a
 * discriminating pair differ is itself a claim (`doc/workflow.md` rule 8), and here it is one word.
 */
const TWO_THEN_THREE = { confidence: 0.9, text: 'ja eee' };
const ONE_THEN_TWO = { confidence: 0.9, text: 'ja' };

/**
 * **W94 — P24's EXIT ARTIFACT, and every number in its three rows and block (2h) is derived from the table below.**
 *
 * A TV library's seven files: three of `Dark`, two of `Lost`, one of `Fargo`, and `trailer.mkv`, whose name carries no
 * series. `identify` PARSES the series out of the name, so the gate's key is data a worker computed in the same branch
 * — a branch cannot see its siblings, which is the whole reason a gate exists — and `trailer.mkv` reaches the gate with
 * NO key at all: `distinct`'s `nokey` route (P24 stop-and-ask (c)). **The table is hand-written from `identify`'s
 * documented rule** (`Show.S01E02.ext` is series `show`, episode `S01E02`; anything else is no series), never computed
 * by calling it: a fixture from the code under test proves the code agrees with itself (`doc/workflow.md` section 5
 * rule 4).
 *
 * **The SIZES are the ARRANGEMENT** ([Q379](../doc/questions/q379.md)). `identify` waits in proportion to a file's
 * size and its pool is as wide as the map — W94's declaration measured a SERIAL pool running identify in dispatch order
 * whatever the delays — so a row decides the ORDER the branches reach the gate by the sizes it declares. LAST-first
 * falls with the index, so the LAST file of each series arrives first, and neither the lowest index nor the first
 * dispatched is the right answer; FIRST-first rises with it, the pair's other half, where the order IS the index order.
 * **The two differ in the ORDER of the sizes and in nothing else**, which the cross-row block asserts (whatever makes a
 * pair differ is itself a claim). EQUAL is the threaded row's: the POOL decides the order, and the row names no winner.
 */
const TV = tvIngest as unknown as FlowDefinition;
type TvFile = { name: string; sizeMB: number };
const TV_IDENTIFIED: readonly { name: string; series?: { id: string; title: string }; episode?: string }[] = [
  { name: 'Dark.S01E01.mkv', series: { id: 'dark', title: 'Dark' }, episode: 'S01E01' },
  { name: 'Lost.S01E01.mkv', series: { id: 'lost', title: 'Lost' }, episode: 'S01E01' },
  { name: 'Dark.S01E02.mkv', series: { id: 'dark', title: 'Dark' }, episode: 'S01E02' },
  { name: 'trailer.mkv' },
  { name: 'Lost.S01E02.mkv', series: { id: 'lost', title: 'Lost' }, episode: 'S01E02' },
  { name: 'Dark.S01E03.mkv', series: { id: 'dark', title: 'Dark' }, episode: 'S01E03' },
  { name: 'Fargo.S01E01.mkv', series: { id: 'fargo', title: 'Fargo' }, episode: 'S01E01' },
];
const TV_N = TV_IDENTIFIED.length;
const TV_LAST_FIRST = { files: TV_IDENTIFIED.map((f, i): TvFile => ({ name: f.name, sizeMB: TV_N - i })) };
const TV_FIRST_FIRST = { files: TV_IDENTIFIED.map((f, i): TvFile => ({ name: f.name, sizeMB: i + 1 })) };
const TV_EQUAL = { files: TV_IDENTIFIED.map((f): TvFile => ({ name: f.name, sizeMB: 2 })) };
/** The series the files belong to, sorted — from the table, a second source beside the run's own `gated` keys. */
const TV_KEYS = [...new Set(TV_IDENTIFIED.flatMap((f) => (f.series ? [f.series.id] : [])))].sort();
/** Every series with more than one file: where *first to arrive* and *lowest index* CAN differ. */
const TV_MULTI = TV_KEYS.filter((k) => TV_IDENTIFIED.filter((f) => f.series?.id === k).length > 1);
/** `distinct`'s three routes over the table: one `first` per series, the rest of the identified files `duplicate`, the unidentified `nokey`. */
const TV_ROUTES = {
  first: TV_KEYS.length,
  duplicate: TV_IDENTIFIED.filter((f) => f.series).length - TV_KEYS.length,
  nokey: TV_IDENTIFIED.filter((f) => !f.series).length,
};
/**
 * **What a TV row dispatches BESIDE the per-series task** — from the flow's shape and the payload's arity: the map opens
 * one `download` per file at once, each one's `beside` fan-out dispatches `thumbnail` then `identify` at `i.0` and
 * `i.1`, and `publish` is last. **The fourteen `beside` ids are compared as a SET** (`TV_UNORDERED`): the order they are
 * dispatched in is the order seven concurrent downloads SETTLE in, a fan-out's completion order, which `spec/` does not
 * fix and `doc/workflow.md` section 5 rule 5 forbids a row to assert — W94's conformity reader, finding 2 (the first cut
 * compared them in order, justified by the inline pool's timer FIFO, W51's exact class). **`setupSeries` is left out ON PURPOSE** — which file opens a series is the one thing P24
 * decision 7 says no test may name, so its ids are asserted by the gate clause from the run's own `gated` elements.
 */
const tvDispatched = (run: string): string[] => [
  ...TV_IDENTIFIED.map((_, i) => `${run}:download:${i}:0`),
  ...TV_IDENTIFIED.flatMap((_, i) => [`${run}:thumbnail:${i}.0:0`, `${run}:identify:${i}.1:0`]),
  `${run}:publish:-:0`,
];
const TV_INSTANCES = {
  beside: Object.fromEntries(TV_IDENTIFIED.map((_, i) =>
    [String(i), { joined: true, settled: { [`${i}.0`]: 'arrived' as const, [`${i}.1`]: 'exited' as const } }])),
};
const TV_MAP_SETTLED = Object.fromEntries(TV_IDENTIFIED.map((_, i) => [String(i), 'arrived' as const]));
/** The region events per branch: the map's and the thumbnail's arrive, the gate road's EXITS — `all` for the first row, the gate road alone for the other two. */
const tvBranchEvents = (all: boolean): Record<string, string[]> => Object.fromEntries([
  ...(all ? TV_IDENTIFIED.map((_, i) => [String(i), ['branch.opened', 'branch.arrived']]) : []),
  ...(all ? TV_IDENTIFIED.map((_, i) => [`${i}.0`, ['branch.opened', 'branch.arrived']]) : []),
  ...TV_IDENTIFIED.map((_, i) => [`${i}.1`, ['branch.opened', 'branch.exited']]),
]);
/** `thumbnail`'s documented answer: the name with its extension replaced by `.jpg`, under `thumbs/`. */
const tvThumb = (name: string) => ({ name, thumbnail: `thumbs/${name.slice(0, name.lastIndexOf('.'))}.jpg` });
/**
 * **What `publish` receives is `JP-R12` at TWO levels and it names NO winner**: `all`'s record is one entry per map
 * branch, each being that branch's `perFile` record — which holds the thumbnail at `i.0` and nothing at `i.1`, because
 * the gate road EXITED in every instance.
 */
const tvPublish = () => ({
  published: true,
  joinPayload: Object.fromEntries(TV_IDENTIFIED.map((f, i) => [String(i), { [`${i}.0`]: tvThumb(f.name) }])),
});
const tvResults = (run: string, files: readonly TvFile[], which: 'all' | 'identify' | 'publish'): Record<string, unknown> => ({
  ...(which === 'all' ? Object.fromEntries(files.map((f, i) => [`${run}:download:${i}:0`, { name: f.name, sizeMB: f.sizeMB, path: `cache/${f.name}` }])) : {}),
  ...(which === 'all' ? Object.fromEntries(files.map((f, i) => [`${run}:thumbnail:${i}.0:0`, tvThumb(f.name)])) : {}),
  // `realm: 'harness'` — these rows run `identify` INLINE, in this module's realm (the adequacy reader's finding 4).
  ...(which !== 'publish' ? Object.fromEntries(TV_IDENTIFIED.map((f, i) => [`${run}:identify:${i}.1:0`, { ...f, realm: 'harness' }])) : {}),
  [`${run}:publish:-:0`]: tvPublish(),
});
const TV_GATE = { node: 'dedupe', from: 'identify', opens: 'setupSeries', keys: TV_KEYS, routes: TV_ROUTES };

const HIGH = { confidence: 0.9 };
const LOW = { confidence: 0.1 };
/**
 * **The three map payloads — W35.** `text` is what the `split` role counts, so
 * these three literals are the only place a map row's ARITY is decided, and none
 * of them says a number: three words, two words, and none.
 *
 * The words have **different lengths on purpose**. The role derives each item's
 * confidence from its own word's length, so the three instances of one node
 * compute three different scores — and a driver that handed every instance the
 * whole value instead of its own item would produce three identical ones, which is
 * the negation of [ADR 0037](../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)
 * rule 3 and is what `nodeResults` below is pointed at.
 */
const THREE_WORDS = { confidence: 0.9, text: 'a bb ccc' };
/**
 * **The same three words at a confidence a decision routes on** — W47. `LOW` above
 * carries no `text`, so it cannot drive a map, and `THREE_WORDS` cannot drive a
 * decision: the pair `map-past-a-decision` runs at needs both, and this is the half
 * that did not exist.
 */
const THREE_WORDS_LOW = { confidence: 0.1, text: 'a bb ccc' };
const TWO_WORDS = { confidence: 0.9, text: 'a bb' };
const NO_WORDS = { confidence: 0.9, text: '' };
/**
 * **ELEVEN words, and the number is the whole of why the row reports anything — W82.**
 *
 * `gauge` returns `words / 10` against a declared `maximum: 1`, so the bound holds at every arity
 * its own declared example reaches and breaks at eleven. That is `memoisedItems`' pre-W73
 * arithmetic — `word.length / 10` at an eleven-LETTER word — moved one noun across, which is
 * [Q302](../doc/questions/q302.md)'s shape and is why this payload is a count rather than a value.
 *
 * **Its pair is `TWO_WORDS` above, unchanged and already in the file** — two words is `0.2`, inside
 * the bound, so the control row reports `stamp` and NOT `gauge`. That is what makes the first
 * finding a function of the DATA rather than of the node: a worker that simply always failed would
 * be reported on both rows, and `gauge`'s claim is *the bound holds in its declared domain and
 * breaks outside it*. The two payloads differ in the word count and in nothing else, and the rows
 * assert that difference rather than resting on it (`doc/workflow.md` rule 8's fourth requirement
 * on the set).
 *
 * `confidence` rides along because every other payload in this file carries one; `gauge`'s
 * `inputSchema` declares `text` alone and does not close the object, so `FD-R4` admits it at
 * `start()` and nothing downstream reads it.
 */
const ELEVEN_WORDS = { confidence: 0.9, text: 'one two three four five six seven eight nine ten eleven' };
/**
 * **One word, twice — W35's adequacy reader.** The `split` role memoises per word,
 * so this payload produces an `items` array holding **one object at both indices**,
 * which is the only shape that can tell ADR 0037 rule 1 — *no two nodes ever receive
 * the same object* — from its negation.
 */
const SAME_WORD_TWICE = { confidence: 0.9, text: 'a a' };
/**
 * **W43's payload, and its `confidence` is 0.4 for a reason rule 8 found.**
 *
 * `map-with-context`'s `score` node declares `{item: ".", run: "ingest"}` and
 * `weigh` returns `round(item.confidence * run.confidence * 100)`, so the `run`
 * key's contribution is only observable if `run.confidence` differs from every
 * literal a worker could plausibly carry. **At `THREE_WORDS`' 0.9 it did not**:
 * replacing `theirs` with that literal left **every assertion green** (measured at
 * the author pass, when the file declared 728 of them), so the row could not tell
 * *reads its declared `run` key* from *hardcodes the number that key happens to
 * hold*. That is [W34](../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md)'s
 * finding — **a provenance probe cannot be graded against a correct
 * implementation**.
 *
 * **Changing the payload MOVED the coincidence rather than removing it, and that is
 * the correction to make**: at 0.4 the literal `0.4` passed just as `0.9` had. What
 * removes it is `CONTEXTED_AGAIN` — **two rows whose run configs differ** — and the
 * substitution now costs 4. *(This paragraph said the fix "is not a compound probe
 * but a payload"; a payload is what moved it and a PAIR is what removed it. It also
 * quoted 728, which was the total before the second row and the reference-form
 * check existed, with no scope stated — the writing clause, in the comment that
 * explains why the fixture changed. W43's conformity reader.)*
 *
 * `0.4` also keeps the three items' own confidences (0.1, 0.2, 0.3) distinct from
 * it. **Swapping `mine` and `theirs` costs 8 — by the `confidence:` echo rather
 * than by `score`**, because the product is commutative: right conclusion, wrong
 * stated mechanism, and W43's adequacy reader measured which assertion fires.
 */
const CONTEXTED = { confidence: 0.4, text: 'a bb ccc' };
/**
 * **The second run config, and it exists because ONE was not enough** — rule 8
 * obligation (c), and the finding is that the fixture rather than the probe was
 * what could not discriminate.
 *
 * `weigh` returns `round(item.confidence * run.confidence * 100)`. With a single
 * row, replacing `run.confidence` with **the literal that row's run happens to
 * hold** leaves every assertion green — measured at 0.9 and again at 0.4, so
 * changing the payload moved the coincidence rather than removing it. **The
 * property that removes it is TWO rows whose run configs differ**, because no
 * single literal satisfies both: the same substitution that passes at 0.4 fails at
 * 0.6 and the other way round.
 *
 * That is [W34](../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md)'s
 * *a provenance probe cannot be graded against a correct implementation* answered
 * with a FIXTURE rather than with a compound probe — this file's own `r5`/`r6`,
 * `r14`/`r15`/`r16` and `nested LOW`/`nested HIGH` shape, applied to a declared
 * key instead of to a policy. **Two runs differing in one variable** is what L6 has
 * reached for every time a value needed to be shown to come from where it claims.
 */
const CONTEXTED_AGAIN = { confidence: 0.6, text: 'a bb ccc' };
/**
 * **W63's third payload: the one at which BOTH of `transformed.flow.json`'s scorers score below
 * `isLowScore`'s threshold** (4 and 40 against 50), so both branches are routed away and the join is
 * reached by NOTHING — `live-token` fires it over `{}` (ADR 0025's live-token column) and the
 * successor's transform is evaluated over an empty record. `THREE_WORDS` (0.9 → 90 and 900) is the
 * arity-two payload and `CONTEXTED` (0.4 → 40 and 400) the arity-one one; the three items and their
 * per-word confidences are the same in all three, because a word's confidence is its length.
 */
const FAINT = { confidence: 0.04, text: 'a bb ccc' };
/** `SplitWorker`'s three items for `'a bb ccc'`, spelled once for the three `transformed` rows. */
const ITEMS_ABC = [{ word: 'a', confidence: 0.1 }, { word: 'bb', confidence: 0.2 }, { word: 'ccc', confidence: 0.3 }];
/**
 * **What `Echo` returns for each RESHAPED map item, derived from the transform's text and the
 * item** — `{ "word": word, "score": $round(confidence * $settings.scale), "fields": $keys($) }`
 * at `scale: 100`: `a` → 10, `bb` → 20, `ccc` → 30 (rounded, because 0.1 × 100 is not 10 in a
 * double), and `fields` is the item's own key list, which JSONata builds as a MARKED sequence and the
 * adapter hands out plain — `markedKeys: []` is that claim, `arrays: 1` says the walk REACHED the one
 * array it is a claim about (rule 8 measured a walk stopping at the top level surviving without it),
 * and `inputType: 'object'` is the reshape's.
 */
const RESHAPED = (word: string, score: number) => ({
  keys: ['input', 'settings'], extraKeys: [], settingsKeys: ['scale'], inputType: 'object', markedKeys: [], arrays: 1, realm: 'thread',
  input: { word, score, fields: ['word', 'confidence'] },
});
/** What `Echo` returns for the join's successor: the REDUCED value as `input`, a number at every arity — and no array for the walk to reach. */
/**
 * **What a person resolves an `Echo` node with, once `FD-R4` holds the value to the worker's `outputSchema`** —
 * W73. The value ADR 0056 rule 3 says a tool reaches for, and here a person does: the worker's own
 * declared example, read from the DOCUMENT rather than typed. Its eight required keys are what made
 * W63's `{ points: … }` a refused first attempt.
 */
const ECHO_EXAMPLE = ((REGISTRY_DOCUMENT.workers as unknown as Record<string, { outputSchema: { examples: unknown[] } }>).echo.outputSchema.examples[0]) as Record<string, unknown>;

const REDUCED = (total: number) => ({
  keys: ['input', 'settings'], extraKeys: [], settingsKeys: [], inputType: 'number', markedKeys: [], arrays: 0, realm: 'thread', input: total,
});
/**
 * What `Echo` returns for the ONE node whose transform succeeds on an ORDINARY EDGE's value —
 * `FD-C5`'s first kind, which `transformed.flow.json` cannot carry (its entry is an untyped
 * `SplitWorker`) and which the adequacy reader found absent with a successful transform: `note`, in
 * `transform-fails.flow.json`, reshaping ingest's result. `realm: 'thread'` on all three helpers is
 * W62's realm observer one rung up: the `Echo` pool is a real thread, or this is red.
 */
const NOTED = {
  keys: ['input', 'settings'], extraKeys: [], settingsKeys: [], inputType: 'object', markedKeys: [], arrays: 0, realm: 'thread',
  input: { confidence: 0.9, doubled: 1.8 },
};
/** What a `Scorer` returns when its `needs` composed `{ run }` and its transform selected `run` — ingest's whole result, items echoed. */
const SCORED = (confidence: number, factor: number) => ({
  keys: ['input', 'settings'], extraKeys: [], settingsKeys: ['factor'], confidence, factor, score: Math.round(confidence * factor), retried: false, items: ITEMS_ABC,
});

/**
 * **W110 — P26's EXIT ARTIFACT: a flow a UI could have emitted, and the ONLY code it reaches is the
 * domain workers and the language adapter the library itself ships.**
 *
 * ```
 * intake    SplitWorker   -> { confidence, items: [ {word, confidence}, … ] }    SEQUENCE
 * each      map over "items", branch "rate"                                     FAN-OUT, run-time arity
 * rate      ScoreWorker   -> { confidence, score: round(confidence * 100) }      its own item, JP-R11
 * gather    join of "each" -> { "0": {…}, "1": {…} }                            JOIN, JP-R12
 * rollup    Transform      needs { joined: ".", cfg: "intake" }                  SELECTION + TIER-3 COMPUTATION
 *           all[ weak eq true, n gte 2 ] -> remediate                            DECISION, a GROUP
 *           any[ n eq 1, weak eq false ] -> publish
 *           (default)                    -> stalled                              a tripwire, never reached
 * remediate WeighWorker    transform reshapes rollup's output into { item, run }  TIER-2 COMPUTATION
 *           score lt 20 -> escalated ; -> done
 * publish   PublishWorker -> { published, joinPayload: rollup's output }
 * ```
 *
 * **What makes it the artifact rather than another transform row**: there is no predicate FUNCTION,
 * no reshaping WORKER, no gate type, no custom group type and no node-type class — `predicates` is
 * an EMPTY Map on all four of this document's rows and the cross-row block says so — and the whole
 * registry is `examples/ui-registry.json`, which declares four workers, four types and `languages`.
 *
 * **The TIER-THREE node is REQUIRED and not chosen**, which is the one thing about this flow worth
 * reading twice. A `transform` transforms its node's INPUT and a decision reads its node's OUTPUT,
 * so a computation feeding a DECISION cannot be a tier-two transform on the consuming node — which
 * is what [ADR 0075](../doc/decisions/0075-a-node-that-only-transforms-is-a-built-in-type-with-no-inner-worker.md)
 * rule 1's tier table means by *reshape for … a decision*. Move `rollup`'s transform onto `publish`
 * and the decision cannot see `total` at all. **All three tiers are in this one flow**: `needs` on
 * `rollup` is tier one, `remediate`'s own transform is tier two, `rollup` is tier three.
 *
 * **And the decision depends on TWO of the run's own values**, which a comparison cannot say: the
 * subset reads ONE path and compares it to ONE literal, so *is the mean below the threshold the run
 * carries* is not a comparison and neither is any arithmetic. W110's declaration step measured all
 * four spellings of a path-as-value — two refused by `FD-V44`, one refused for its KIND, and
 * `{ op: "eq", value: "needs.cfg.threshold" }` **ACCEPTED as a literal string**
 * ([Q456](../doc/questions/q456.md)). The route around it is data: `rollup` computes `weak` and the
 * `when` reads `outcome.result.weak`.
 */
const UI = uiEmitted as unknown as FlowDefinition;
/**
 * **The PAIR's other half** — the same document with `rollup`'s FIRST `when` replaced by
 * `{ "predicate": "weakAndPlural" }`, and nothing else changed. Generated from `UI`'s own bytes, so
 * the difference is one edit by construction; the cross-row block asserts it is still one, and that
 * the two route IDENTICALLY on the payloads that route both ways. **That is P26 prediction 3's
 * answer as a measurement**: the data road reproduces a registered function, and the row that uses
 * the function is what stops the comparison being vacuous.
 *
 * Its second decision stays a declared `any` group, so **this document carries BOTH roads** — which
 * is W110's output (2), and the reason the name road is shown alive rather than merely possible.
 */
const UIN = uiEmittedNamed as unknown as FlowDefinition;

/** An empty predicate registry, written once so the four rows that use it cannot disagree about it. */
const NO_PREDICATES: ReadonlyMap<string, Predicate> = new Map();

/**
 * **The node types the LIBRARY ships, as a LITERAL here** — v0.28, W109, and **HOISTED to module
 * scope by W110** because a second clause needs it. `examples/l6.ts` reads the package through
 * `index.ts` as a consumer does and does not import `src/`, so the list is written down;
 * `test/definition/node-type.test.ts`'s W109 suite holds the same literal to `BUILT_IN_NODE_TYPES`
 * itself, so a built-in added without these clauses moving is red there — **checked rather than
 * cited** at W110's declaration step, because W109's finding 6 was five files naming an observer
 * that did not exist ([Q453](../doc/questions/q453.md)).
 *
 * **It was declared INSIDE the (2b) block until W110**, where the pools clause could see it and the
 * `documentTypes` clause three hundred lines up could not — which is why that clause went red the
 * moment a flow named a built-in and had no way to say so.
 */
const BUILT_IN_NODE_TYPES_L6: readonly string[] = ['Transform'];

/** What `SplitWorker` returns for a text — one item per word, each carrying `min(1, word.length / 10)`. */
const uiItems = (text: string): { word: string; confidence: number }[] => {
  const seen = new Map<string, { word: string; confidence: number }>();
  return text.split(' ').filter((w) => w.length > 0).map((word) => {
    const hit = seen.get(word);
    if (hit) return hit;
    const made = { word, confidence: Math.min(1, word.length / 10) };
    seen.set(word, made);
    return made;
  });
};
/**
 * **What `rollup`'s transform computes, DERIVED from the two workers' own arithmetic** — not read
 * off a run. `ScoreWorker` returns `round(confidence * 100)` for the item it was handed, so the
 * scores are a function of the WORDS and the `weak` verdict is a function of the words AND the
 * payload's own confidence, which is the two-path comparison.
 */
const uiRollup = (confidence: number, text: string) => {
  const scores = uiItems(text).map((i) => Math.round(i.confidence * 100));
  const n = scores.length;
  const total = scores.reduce((a, b) => a + b, 0);
  const mean = total / n;
  return { n, total, mean, weak: mean < confidence * 100 };
};
/**
 * **What `WeighWorker` returns on the `remediate` road** — and this is output (3)'s whole point:
 * every field is a function of what the TRANSFORM produced. `keys` is the transform's own output
 * shape read back by the worker, `confidence` is `mean / 100`, and `score` is computed FROM it, so
 * a wrong transform gives a wrong score and a different key set rather than an absent one.
 */
const uiRemediated = (mean: number) => ({
  keys: ['item', 'run'], extraKeys: [], word: 'mean', confidence: mean / 100, score: Math.round((mean / 100) * 1 * 100),
});

const EXPECTED: Expectation[] = [
  {
    key: 'fanout-join / live-token',
    definition: FJ, policyId: 'live-token', payload: HIGH, threaded: true,
    outcome: 'completed',
    dispatched: ['r1:ingest:-:0', 'r1:scoreA:0:0', 'r1:scoreB:1:0', 'r1:publish:-:0'],
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived' },
    // **Q36's ANSWER, on real workers** — `JP-R12`, and this row is where it is
    // seen crossing a real scheduler rather than a fixture. **Derived, not copied
    // from the run**: the entry payload is `HIGH`, so `ingest` returns
    // `{confidence: 0.9}`; each branch receives its own copy of that (`JP-R11`)
    // and the `score` role returns `{confidence, score: Math.round(0.9 * 100)}` =
    // `{confidence: 0.9, score: 90}`; both branches arrive, so `JP-R12` collects
    // them under their branch paths `0` and `1`, and `publish` echoes what it was
    // handed. **This read `joinPayload: null` until
    // [ADR 0037](../doc/decisions/0037-what-a-branch-receives-is-a-property-of-the-fan-out-and-what-a-join-carries-is-a-property-of-the-region.md)**,
    // with the comment calling it *"Q36's current answer"* — which is exactly why
    // the row went red rather than quietly agreeing.
    nodeResults: {
      'r1:publish:-:0': {
        published: true,
        joinPayload: {
          '0': { confidence: 0.9, score: 90 },
          '1': { confidence: 0.9, score: 90 },
        },
      },
    },
    // The only road available: every branch arrives, so whichever settles last,
    // the join is satisfied by a `branch.arrived`. It is the direction that makes
    // this field able to fail both ways — without it every declaration below
    // reads the same value and a constant would satisfy them all.
    joinSettledBy: 'branch.arrived',
    why: 'both branches arrive; the live count reaches zero having been positive (JP section 3)',
  },
  {
    key: 'fanout-join / arrival-count',
    definition: FJ, policyId: 'arrival-count', payload: HIGH, threaded: true,
    outcome: 'completed',
    dispatched: ['r2:ingest:-:0', 'r2:scoreA:0:0', 'r2:scoreB:1:0', 'r2:publish:-:0'],
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived' },
    why: 'the control row — N=2 arrivals of 2. ADR 0003 all-arrive: the two policies MUST agree here',
  },
  {
    key: 'p1-routed-away high / live-token',
    definition: RA, policyId: 'live-token', payload: HIGH, threaded: true,
    outcome: 'completed',
    dispatched: ['r3:ingest:-:0', 'r3:scoreA:0:0', 'r3:scoreB:1:0', 'r3:publish:-:0'],
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived' },
    why: 'isLowConfidence is FALSE at 0.9, so scoreB takes the default edge to the join',
  },
  {
    key: 'p1-routed-away high / arrival-count',
    definition: RA, policyId: 'arrival-count', payload: HIGH, threaded: true,
    outcome: 'completed',
    dispatched: ['r4:ingest:-:0', 'r4:scoreA:0:0', 'r4:scoreB:1:0', 'r4:publish:-:0'],
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived' },
    why: 'same flow, same predicate, false — arrival-counting is correct whenever every branch arrives',
  },
  {
    key: 'p1-routed-away LOW / live-token',
    definition: RA, policyId: 'live-token', payload: LOW, threaded: true,
    outcome: 'completed',
    dispatched: ['r5:ingest:-:0', 'r5:scoreA:0:0', 'r5:scoreB:1:0', 'r5:publish:-:0'],
    joined: true,
    settled: { '0': 'arrived', '1': 'exited' },
    why: 'P1 CASE. branch 1 reaches `abandoned`; branch.exited decrements, the count reaches zero, ' +
      'the join fires and publish is dispatched (ADR 0003 routed-away)',
  },
  {
    key: 'p1-routed-away LOW / arrival-count',
    definition: RA, policyId: 'arrival-count', payload: LOW, threaded: true,
    outcome: 'stuck',
    // **Four ids, not five.** `publish` is NEVER dispatched, and that absence is
    // the whole finding: it is also why the fold needed `joinSettled` rather than
    // being able to read the answer off `regions` (ADR 0015).
    dispatched: ['r6:ingest:-:0', 'r6:scoreA:0:0', 'r6:scoreB:1:0'],
    joined: null,
    settled: { '0': 'arrived', '1': 'exited' },
    why: 'P1 CASE, and the policy that loses. N is fixed at 2 and only one branch ever arrives, so ' +
      'the join waits forever with nothing queued and nothing running. Run state says stuck ' +
      '(RN-R10); at spec/run-state.md v0.2 it said completed',
  },
  {
    key: 'optional-loss / live-token',
    // **Inline, so the LOST branch settles last.** With a threaded `ScoreWorker`
    // the arriving branch always finished after the failing one, so the join was
    // always fired by the arrival and `settleJoin` on the `lost` path was
    // unreachable at L6 — deleting it was invisible across twelve rows.
    definition: OL, policyId: 'live-token', payload: HIGH, threaded: false,
    branchEvents: { '1': ['branch.opened', 'branch.lost'] },
    // **The `lost` path, reached because `flaky` settles after `scoreA`.** Reverse
    // `buildScheduler`'s `SETTLES_LAST` and the arriving branch settles last, the
    // join is fired by the arrival, and `settleJoin` can be deleted from the lost
    // path with the whole gate green — measured by W17. This is the assertion that
    // says the arrangement took. **Which mechanism produces the order is a
    // separate question and the answer is not the one that comment used to give**:
    // emptying the set or dropping the 4x to 1x changes nothing, because the
    // inline pools settle in dispatch order anyway ([Q99](../doc/questions/q99.md)).
    joinSettledBy: 'branch.lost',
    outcome: 'failed',
    dispatched: ['r7:ingest:-:0', 'r7:scoreA:0:0', 'r7:flaky:1:0', 'r7:publish:-:0'],
    joined: true,
    settled: { '0': 'arrived', '1': 'lost' },
    why: 'ADR 0003s SECOND mechanism, and the ordinary one: an `optional` task fails, no edge opts ' +
      'into `failed`, the branch is LOST and the count still reaches zero — so the join fires and ' +
      'the run reaches its `end`. `failed` outranks `completed` because a path ended with no ' +
      'eligible edge (RN-R10s neighbour in section 3)',
  },
  {
    key: 'optional-loss / arrival-count',
    definition: OL, policyId: 'arrival-count', payload: HIGH, threaded: false,
    outcome: 'stuck',
    dispatched: ['r8:ingest:-:0', 'r8:scoreA:0:0', 'r8:flaky:1:0'],
    joined: null,
    settled: { '0': 'arrived', '1': 'lost' },
    why: 'the row that matters most: NO decision, NO routing away, just a task that failed. ' +
      'Arrival-counting hangs anyway, which is ADR 0003s finding that the sharp edge is the ' +
      'common case. `stuck` outranks `failed` — the run did not merely fail, it will not finish',
  },
  {
    key: 'failure-edge / routes on',
    definition: FE, policyId: 'live-token', payload: HIGH, threaded: false,
    regionId: null,
    outcome: 'completed',
    // One task, and one only: `quarantine` is an `end`, and an `end` dispatches
    // nothing. `review` and `publish` are never reached.
    dispatched: ['r9:extract:-:0'],
    pathEnds: [{ reason: 'end', at: 'quarantine' }],
    why: 'W6 row 1 — a failure that ROUTES, the one definition feature no L6 flow reached. ' +
      '`extract` is optional and throws, so it settles `failed`; its FIRST edge opts into ' +
      '`failed` and goes to the `quarantine` end. The path ended AT AN END NODE, so the run is ' +
      '`completed` and not `failed` — spec/run-state.md section 3, and the case W2s conformity ' +
      'pass found the code getting wrong',
  },
  {
    key: 'suspend / resolve / resume',
    definition: SR, policyId: 'live-token', payload: HIGH, threaded: false,
    outcome: 'completed',
    dispatched: ['r10:ingest:-:0', 'r10:scoreA:0:0', 'r10:needsAPerson:1:0', 'r10:publish:-:0'],
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived' },
    // The same throwing worker as `optional-loss`, on a node that is NOT
    // `optional` — so the scheduler ends it `user_action` rather than `failed`.
    // One worker, two outcomes, chosen by the definition.
    resolveOnSuspend: { '1': { at: 'needsAPerson', as: 'done', result: { confidence: 0.9 }, actor: 'a-person' } },
    outcomesSeen: ['awaiting_action'],
    // Never quiescently either: `stuck` would mean the join can no longer fire,
    // and `failed` would mean a path ended with no eligible edge. Both appear if
    // the outcome is sampled mid-turn instead.
    outcomesNotSeen: ['stuck', 'failed'],
    // **The only assertion in the gate that `branch.resumed` reaches.** Deleting
    // the emission from `src/` was invisible across all twelve rows: the fold
    // clears `regions[*].suspended` on `branch.arrived` too, so nothing the gate
    // read could tell. Found by both of W6's readers, independently.
    branchEvents: { '1': ['branch.opened', 'branch.suspended', 'branch.resumed', 'branch.arrived'] },
    pathEnds: [{ reason: 'end', at: 'done' }],
    regionSuspended: [],
    why: 'W6 row 2 — the whole human-in-the-loop half, and the only inbound API the library has. ' +
      'The branch suspends (ADR 0007 rule 2), the join keeps waiting because `branch.suspended` ' +
      'decrements nothing, run state is `awaiting_action` (RN-R7), a person resolves it `done`, ' +
      'and RN-R9 makes the resumed branch indistinguishable from one that settled that way — so ' +
      'it ARRIVES and the join fires',
  },
  {
    key: 'suspend / nobody comes',
    definition: SR, policyId: 'live-token', payload: HIGH, threaded: false,
    outcome: 'awaiting_action',
    // **Three, not four.** The join never fires, because a suspended branch is
    // still live and `branch.suspended` decrements nothing — so `publish` is
    // never dispatched. That is the same shape as the `arrival-count` rows and it
    // is NOT the same thing, which is the entire point of this row.
    dispatched: ['r11:ingest:-:0', 'r11:scoreA:0:0', 'r11:needsAPerson:1:0'],
    joined: null,
    settled: { '0': 'arrived' },
    unsettled: ['r11:needsAPerson:1:0'],
    outcomesSeen: ['awaiting_action'],
    outcomesNotSeen: ['stuck', 'completed'],
    // Branch 1 has **no terminal event at all**, which `JP-R5` permits and which
    // nothing in this repository had exhibited outside a fixture.
    branchEvents: { '1': ['branch.opened', 'branch.suspended'] },
    pathEnds: [],
    regionSuspended: ['1'],
    expectBackstop: true,
    backstopMs: 400,
    why: 'W6 row 4 — the row that separates WAITING ON A PERSON from STUCK, which ADR 0003 and ' +
      'ADR 0015 both lean on and which no L6 row demonstrated. Same flow as row 2 with nobody to ' +
      'resolve it: the join has not fired and never will unaided, and run state says ' +
      '`awaiting_action` rather than `stuck` — RN-R10 sits BELOW awaiting_action for exactly this ' +
      'case. It is also the only row that ends with a node still `suspended`, which is what makes ' +
      'the effective-outcome mapping falsifiable',
  },
  {
    key: 'exit-last / join fires on exit',
    definition: EL, policyId: 'live-token', payload: HIGH, threaded: false,
    outcome: 'completed',
    dispatched: ['r12:ingest:-:0', 'r12:scoreA:0:0', 'r12:flaky:1:0', 'r12:publish:-:0'],
    joined: true,
    settled: { '0': 'arrived', '1': 'exited' },
    branchEvents: { '1': ['branch.opened', 'branch.exited'] },
    pathEnds: [{ reason: 'end', at: 'abandoned' }, { reason: 'end', at: 'done' }],
    // **The claim this row was built to make, asserted at last.** Its comment has
    // said "the exiting branch is given a longer delay so it settles LAST" since
    // W6; nothing held it down, and reversing `SETTLES_LAST` dropped this row from
    // four failures to none against a deleted `settleJoin` on the exited path
    // (W17). The *delay* is not what produces the order — dispatch order is — so
    // this pins the effect and not the stated mechanism ([Q99](../doc/questions/q99.md)).
    joinSettledBy: 'branch.exited',
    why: 'W6 row 5, added by the adequacy reader. `spec/join-policy.md` section 4 says status is asked ' +
      'after EVERY terminal event because a join can become satisfiable when the last live branch was ' +
      'LOST or EXITED - which is P1s case - and no L6 row reached either path: the arriving branch ' +
      'always settled last, so the join was always fired by the arrival. Deleting settleJoin from ' +
      'both other paths was invisible across twelve rows. Here the exiting branch is given a longer ' +
      'delay so it settles LAST, which ARRANGES the causal order rather than depending on one',
  },
  {
    key: 'uncloneable / OR-R6',
    definition: UC, policyId: 'live-token', payload: HIGH, threaded: false,
    regionId: null,
    outcome: 'stopped',
    dispatched: ['r13:merge:-:0'],
    pathEnds: [],
    // **`OR-R6` writes no record.** `normalizeEvent` throws before anything is
    // appended, so the task is dispatched and has no effective outcome — the one
    // place in the gate where Q32's property legitimately does not hold.
    unsettled: ['r13:merge:-:0'],
    runFailure: 'UncloneableResult',
    stoppedBy: 'UncloneableResult',
    stoppedByNamesItOnce: true,
    why: 'W6 row 3 — a refusal that stops a run, on a real scheduler. The worker returns a ' +
      'function; from an INLINE pool it reaches the driver intact and our own structuredClone ' +
      'refuses it (Q61). OR-R6, caught at the listener boundary, reported through onRunFailure ' +
      'and NOT thrown — because dispatchEvent discards a listener throw — and RN-R8 makes the ' +
      'run `stopped` whatever its nodes say',
  },

  // --- W17: the row L6 has never had — EVERY branch reaches an `end` ------------
  //
  // Three rows, one flow, one payload, one set of workers, and **the shipped set
  // of policies exhausted**: the cross-row block below asserts that these three
  // `policyId`s together are `Object.keys(POLICIES)`.
  //
  // **The shape.** `all-exit.flow.json`'s two branches take the two roads to
  // `branch.exited` that need no person: branch 0 settles `done` and its
  // `when: isLowConfidence` edge sends it to `abandoned` (P1's case, and the
  // predicate is TRUE here because the payload is LOW); branch 1 is `optional`,
  // throws, and its `on: ["failed"]` edge sends it to the same node. Nothing
  // arrives at `collect`. The matrix reaches this shape through a suspension and a
  // human (`test/matrix/scenarios.ts`, `all-exit`); doing that here would add a
  // resolution race to a row whose point is elsewhere, and L6 already has three
  // `user_action` rows.
  //
  // **`abandoned` is ONE `end` node shared by both branches**, which
  // `spec/flow-definition.md` section 2 permits — `end` nodes are exempt from
  // `FD-V13`, `FD-V19` and `FD-V22` because nothing about them is per-path — and
  // it is the first time L6 exercises that exemption. It is also what makes
  // `pathEnds` assertable: two branches ending at two *different* `end` nodes
  // would put fan-out completion order into an ordered array, which
  // `doc/workflow.md` section 5 rule 5 forbids asserting. Ending at the same node
  // makes the two entries identical, so the assertion is order-free rather than
  // order-dependent-and-lucky.
  //
  // **The causal order is ARRANGED, and here is which branch settles last.**
  // Branch 1's `ReviewWorker` has role `fail`, which `buildScheduler`'s
  // `SETTLES_LAST` gives `delayMs * 4` — 20 ms against branch 0's 5 ms — so **the
  // join is settled by branch 1's `branch.exited`, every time**. W6's hazard was
  // the mirror image of this one: there the arriving branch always settled last,
  // so the join was never fired from the exited path. Here there is no arriving
  // branch at all, so the join is *necessarily* settled from the exited path — and
  // the arrangement is still worth having, because *which* exit settles it is
  // otherwise a race between two timers, and a fact stated in a comment should be
  // a fact rather than a coin flip. **Nothing below depends on it**, which is the
  // other half of section 5 rule 5: the two branches' `branchEvents` are asserted
  // separately, `settled` is a map, and `pathEnds`' first two entries are equal.
  {
    key: 'all-exit / live-token',
    definition: AE, policyId: 'live-token', payload: LOW, threaded: false,
    outcome: 'completed',
    dispatched: ['r14:ingest:-:0', 'r14:scoreA:0:0', 'r14:flaky:1:0', 'r14:publish:-:0'],
    joined: true,
    settled: { '0': 'exited', '1': 'exited' },
    branchEvents: {
      '0': ['branch.opened', 'branch.exited'],
      '1': ['branch.opened', 'branch.exited'],
    },
    // Both branches end at `abandoned`, then the join fires and `publish` reaches
    // `done`. The first two entries are identical, so this array does not encode
    // which branch finished first.
    pathEnds: [
      { reason: 'end', at: 'abandoned' },
      { reason: 'end', at: 'abandoned' },
      { reason: 'end', at: 'done' },
    ],
    // **`JP-R12`'s `{}`, and it is a LIVE case rather than a defensive one.** Every
    // branch reaches an `end`, so `live-token` fires a join that NOTHING arrived
    // at — [ADR 0003](../doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)'s
    // recorded cost for that policy — and an empty collection is what a join with
    // no arrivals carries. `publish` echoes it, and `{} ?? null` is `{}`, so this
    // is the payload rather than the worker's fallback. **It read `null` until
    // ADR 0037**, where `null` was the same value for two different reasons.
    nodeResults: { 'r14:publish:-:0': { published: true, joinPayload: {} } },
    // **STRUCTURAL here, not arranged, and that is the row's quiet contribution.**
    // Every branch exits, so the join is satisfied by a `branch.exited` whichever
    // one settles last. `exit-last` reaches the same path by a delay nothing
    // checked; this row reaches it by the shape of the flow.
    joinSettledBy: 'branch.exited',
    why: 'W17 — the row ADR 0003 records as live-token`s COST, on real workers for the first time. ' +
      'Every branch reaches an `end`, so the live count reaches zero having been positive and the ' +
      'join FIRES having been reached by nothing: `publish` is dispatched, receives `null`, and ' +
      'the run is `completed` because every path ended at an `end` node (spec/run-state.md ' +
      'section 3). Nothing is reported, because `live-token` cannot say `unsatisfiable`',
  },
  {
    key: 'all-exit / arrival-count',
    definition: AE, policyId: 'arrival-count', payload: LOW, threaded: false,
    outcome: 'stuck',
    // Three, not four. `publish` is never dispatched.
    dispatched: ['r15:ingest:-:0', 'r15:scoreA:0:0', 'r15:flaky:1:0'],
    joined: null,
    settled: { '0': 'exited', '1': 'exited' },
    branchEvents: {
      '0': ['branch.opened', 'branch.exited'],
      '1': ['branch.opened', 'branch.exited'],
    },
    pathEnds: [{ reason: 'end', at: 'abandoned' }, { reason: 'end', at: 'abandoned' }],
    why: 'W17 — the same run under the policy that cannot see it. N is fixed at 2 and NOTHING ' +
      'ever arrives, so the join waits forever; nothing is running and nothing is suspended, so ' +
      'RN-R10 says `stuck`. It is the SILENT kind: `joined` is null, no callback fires, and a ' +
      'consumer learns only that the run stopped moving',
  },
  {
    key: 'all-exit / live-token-requiring-arrival',
    definition: AE, policyId: 'live-token-requiring-arrival', payload: LOW, threaded: false,
    outcome: 'stuck',
    dispatched: ['r16:ingest:-:0', 'r16:scoreA:0:0', 'r16:flaky:1:0'],
    // **`false`, and nothing at L6 had ever reached it.** Every `stuck` row above
    // is `null` — a join still waiting. This one is a join a policy REPORTED dead:
    // `spec/join-policy.md` section 4, and `src/driver/driver.ts` appends
    // `joinSettled(fired: false)` before routing nowhere (ADR 0015).
    joined: false,
    settled: { '0': 'exited', '1': 'exited' },
    branchEvents: {
      '0': ['branch.opened', 'branch.exited'],
      '1': ['branch.opened', 'branch.exited'],
    },
    pathEnds: [{ reason: 'end', at: 'abandoned' }, { reason: 'end', at: 'abandoned' }],
    // From `spec/join-policy.md` section 3's third row, read against `JP-R2`: the
    // live count is at zero, it has been positive, and no arrival was seen. That
    // last field is the whole reason this row is not the row above it.
    unsatisfiable: [{
      fanoutId: 'split',
      // **The region INSTANCE, not just its opener** — W84, ADR 0062. `split` opens
      // at top level, so its instance is `'-'`, derived from the document.
      regionPath: '-',
      joinId: 'collect',
      policyId: 'live-token-requiring-arrival',
      describe: { live: 0, positive: true, arrived: 0 },
    }],
    // Structural, as on the `live-token` row above — and here the event that
    // "satisfies" the join is the one that reports it dead, which is the same
    // section 4 clause reaching the other verdict.
    joinSettledBy: 'branch.exited',
    why: 'W17 — ADR 0025 on real workers, and the FIRST L6 row in this repository where a join is ' +
      'reported dead rather than merely never firing. Same flow, same workers, same events as the ' +
      'two rows above: the live count reaches zero having been positive with no arrival, so ' +
      'section 3`s third row says `unsatisfiable`, the driver reports it with the policy`s own ' +
      '`describe` and routes nowhere, and the fold reaches `stuck` with `joined: false`. The run ' +
      'that COMPLETES under live-token is the run that is reported dead under this one',
  },
  {
    // **Added by this item's own provocation sweep, and it is rule 8 working.**
    // The three rows above run `live-token-requiring-arrival` on exactly one
    // scenario, and on that scenario `arrived` is **always zero** — so *"stop
    // counting `branch.arrived` altogether"* was a mutation the whole of L6
    // survived. The policy's discriminating clause was exercised in one direction
    // only: it was shown to say `unsatisfiable` when nothing arrives and never to
    // say `satisfied` when something does. That is section 5 rule 3 at row
    // granularity, and one more row is what closes it.
    //
    // **It is also ADR 0025's other half asserted rather than argued.** The
    // decision's claim is that this policy is `live-token` plus one clause, not a
    // different policy — so on every shape where a branch arrives it must give
    // `live-token`'s answer. This is P1's own case: one branch arrives, one exits.
    // The cross-row block below asserts the two runs agree.
    key: 'p1-routed-away LOW / live-token-requiring-arrival',
    definition: RA, policyId: 'live-token-requiring-arrival', payload: LOW, threaded: true,
    outcome: 'completed',
    dispatched: ['r17:ingest:-:0', 'r17:scoreA:0:0', 'r17:scoreB:1:0', 'r17:publish:-:0'],
    joined: true,
    settled: { '0': 'arrived', '1': 'exited' },
    branchEvents: {
      '0': ['branch.opened', 'branch.arrived'],
      '1': ['branch.opened', 'branch.exited'],
    },
    // Branch 1's exit is the only path end before the join fires; `done` cannot
    // precede it, because the join cannot fire until branch 1 is terminal. Branch
    // 0 arriving is not a path end.
    pathEnds: [{ reason: 'end', at: 'abandoned' }, { reason: 'end', at: 'done' }],
    why: 'W17 — the row that makes the third policy`s clause able to fail in BOTH directions. ' +
      'One branch arrives and one exits, so the live count reaches zero having been positive ' +
      'WITH an arrival: spec/join-policy.md section 3`s third row says `satisfied`, and this run ' +
      'is r5 under a different policy in every respect. ADR 0025`s claim that the refinement is ' +
      '`live-token` plus one clause is what this asserts',
  },
  // =========================================================================
  // **P7's exit artifact — a nested fan-out on real workers.** W23, and the three
  // rows below are one flow, one worker set and three answers.
  //
  // `nested.flow.json` is the corpus shape one level down: `outer` fans out to
  // `scoreA` and `scoreB`; `scoreB` enters `inner`; both inner branches carry a
  // decision edge to an `end` **inside** `region(inner)`, so the payload alone
  // decides whether the inner join is reached. `FD-V19` and `FD-V22` are what make
  // `region(inner)` wholly inside `region(outer)`'s branch 1, which is what makes
  // `branchPath` a property of the node (`spec/task-id.md` section 1).
  //
  // **These are the first dotted task ids any rung above L2 has asserted.**
  // `scoreC` and `scoreD` are dispatched at `1.0` and `1.1` — the shape the grammar
  // reserved in P1, that W21 taught the driver to mint, and that nothing on a real
  // scheduler had ever produced.
  {
    key: 'nested HIGH / live-token',
    definition: NE, policyId: 'live-token', payload: HIGH, threaded: false,
    // Every branch at both depths reaches its join, so both fire and the run
    // reaches its `end` — `spec/run-state.md` section 3.
    outcome: 'completed',
    dispatched: ['r18:ingest:-:0', 'r18:scoreA:0:0', 'r18:scoreB:1:0',
      'r18:scoreC:1.0:0', 'r18:scoreD:1.1:0', 'r18:publish:-:0'],
    regionId: 'outer',
    joined: true,
    // **The outer join fires over a branch it never opened**, which is P7's exit
    // artifact in one field: branch `1` arrives because the INNER join routed to
    // `outerJoin` carrying `pathOf('inner')`, and `outer` opened `scoreB` — not
    // `scoreC` or `scoreD`.
    settled: { '0': 'arrived', '1': 'arrived' },
    otherRegions: {
      inner: { joined: true, settled: { '1.0': 'arrived', '1.1': 'arrived' } },
    },
    branchEvents: {
      '1.0': ['branch.opened', 'branch.arrived'],
      '1.1': ['branch.opened', 'branch.arrived'],
    },
    pathEnds: [{ reason: 'end', at: 'done' }],
    why: 'W23 — P7`s EXIT ARTIFACT. A nested fan-out on real workers, and the outer join fires ' +
      'over branches it never opened: `inner` is entered from `outer`s branch 1, its two ' +
      'grandchildren are dispatched at the dotted paths `1.0` and `1.1` — the first such ids any ' +
      'rung above L2 has seen — and when `innerJoin` fires it enters `outerJoin` at the path its ' +
      'own REGION sits at, which IS branch 1 arriving. ADR 0030 rules 1-3, on real workers',
  },
  {
    key: 'nested LOW / live-token',
    definition: NE, policyId: 'live-token', payload: LOW, threaded: false,
    // `isLowConfidence` is true, so BOTH inner branches take their first edge to
    // `abandoned`. `live-token`: the inner count reaches zero having been
    // positive, so the join fires **having been reached by nothing** — ADR 0003's
    // recorded cost, one level down — and the run completes.
    outcome: 'completed',
    dispatched: ['r19:ingest:-:0', 'r19:scoreA:0:0', 'r19:scoreB:1:0',
      'r19:scoreC:1.0:0', 'r19:scoreD:1.1:0', 'r19:publish:-:0'],
    regionId: 'outer',
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived' },
    otherRegions: {
      inner: { joined: true, settled: { '1.0': 'exited', '1.1': 'exited' } },
    },
    branchEvents: {
      '1.0': ['branch.opened', 'branch.exited'],
      '1.1': ['branch.opened', 'branch.exited'],
    },
    pathEnds: [{ reason: 'end', at: 'abandoned' }, { reason: 'end', at: 'abandoned' },
      { reason: 'end', at: 'done' }],
    why: 'W23 — ADR 0003`s cost at depth 2, and the run the row below reports dead. Both inner ' +
      'branches reach an `end`, so `inner`s live count reaches zero having been positive and the ' +
      'join fires having been reached by NOTHING — then that firing arrives at `outer` and the ' +
      'whole run completes. Same flow, same payload and same workers as the next row; only the ' +
      'policy differs',
  },
  {
    key: 'nested LOW / live-token-requiring-arrival',
    definition: NE, policyId: 'live-token-requiring-arrival', payload: LOW, threaded: false,
    // **ADR 0030 rules 4 and 5 on real workers.** `inner` reaches zero having been
    // positive with **no** arrival, so section 3's third row says `unsatisfiable`;
    // `JP-R10` then ends `outer`s branch 1, and `outer` — which DID see `scoreA`
    // arrive — fires anyway. `RN-R10` reads every region, so `inner.joined ===
    // false` carries the run to `stuck` regardless.
    outcome: 'stuck',
    // **`publish` IS dispatched**, which is rule 5's stated cost: real downstream
    // work runs in a run that can only end `stuck`.
    dispatched: ['r20:ingest:-:0', 'r20:scoreA:0:0', 'r20:scoreB:1:0',
      'r20:scoreC:1.0:0', 'r20:scoreD:1.1:0', 'r20:publish:-:0'],
    regionId: 'outer',
    joined: true,
    // Branch 1 is **`lost`**, not `arrived` — the event `JP-R10` emits, and the one
    // thing that separates this row from the one above it.
    settled: { '0': 'arrived', '1': 'lost' },
    otherRegions: {
      inner: { joined: false, settled: { '1.0': 'exited', '1.1': 'exited' } },
    },
    branchEvents: {
      '0': ['branch.opened', 'branch.arrived'],
      '1': ['branch.opened', 'branch.lost'],
    },
    pathEnds: [{ reason: 'end', at: 'abandoned' }, { reason: 'end', at: 'abandoned' },
      { reason: 'end', at: 'done' }],
    // **`branch.exited`, and the value is a finding about the FIELD.** W23's
    // conformity reader asked this row to pin the most novel causal fact in
    // ADR 0030 rule 4 — that the OUTER join is satisfied by a `JP-R10`-emitted
    // `branch.lost`. **It cannot**: `joinSettledBy` is read as the last region
    // event before the FIRST `joinSettled` in the sequence, and on this row that
    // is the INNER join being declared dead, whose last event is `scoreD`
    // exiting.
    //
    // **The field was named when a run had one join.** Declared as what it
    // measures rather than as what the row wanted it to say; a per-region version
    // is a widening this item did not declare. The outer join's satisfaction by
    // `branch.lost` IS still pinned — by `settled['1'] === 'lost'` and by
    // `branchEvents['1']` above, both of which fail if `JP-R10` stops firing.
    joinSettledBy: 'branch.exited',
    // From `spec/join-policy.md` section 3's third row against `JP-R2`, and it
    // names the INNER region — the outer join is not reported, because a policy
    // said nothing about it. ADR 0030 rule 4's *"not the driver deciding"*.
    unsatisfiable: [{
      fanoutId: 'inner',
      // **The region INSTANCE** — W84, ADR 0062. `inner` opens inside branch `1` of
      // `outer`, so its instance is `'1'` and NOT `'-'`: this is the one row in the
      // ladder where the two differ, and it is what makes the field observable here
      // rather than a constant. Derived from `nested.flow.json` on paper.
      regionPath: '1',
      joinId: 'innerJoin',
      policyId: 'live-token-requiring-arrival',
      describe: { live: 0, positive: true, arrived: 0 },
    }],
    why: 'W23 — ADR 0030 rules 4 and 5 on real workers, and the row P7 exists for. `inner` is ' +
      'reached by nothing and is REPORTED dead; `JP-R10` then ends the outer branch it sat in, ' +
      'and `outer` fires anyway because `scoreA` arrived — so `publish` runs real work in a run ' +
      'that folds to `stuck`, which is rule 5`s stated cost rather than a surprise. At depth 1 an ' +
      'unsatisfiable join dispatches nothing at all',
  },
  {
    // **The row that makes [Q117](../doc/questions/q117.md)'s fix able to fail**,
    // and it exists because reverting that fix cost **0 assertions** across the
    // three rows above — `doc/workflow.md` rule 8's founding case, in this item's
    // own declared output.
    //
    // The inbound `resolve()` step mints an id from the suspended branch's
    // `branchPath`, and no nested row had ever suspended. `reviewC` is **not
    // optional** and its pool runs the throwing role, so it ends `user_action`
    // (ADR 0007 rule 2) and the branch parks at the **dotted** path `1.0`. With
    // `Number('1.0')` the harness mints `r21:reviewC:1:0` — a well-formed id for a
    // different task — and `resolve()` refuses it as not-suspended; with
    // `branchIndices` it mints `r21:reviewC:1.0:0`, which is what the driver
    // dispatched.
    key: 'nested / a person resolves a branch at a dotted path',
    definition: NS, policyId: 'live-token', payload: HIGH, threaded: false,
    outcome: 'completed',
    dispatched: ['r21:ingest:-:0', 'r21:scoreA:0:0', 'r21:scoreB:1:0',
      'r21:reviewC:1.0:0', 'r21:scoreD:1.1:0', 'r21:publish:-:0'],
    regionId: 'outer',
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived' },
    otherRegions: {
      // **Order-insensitive since W23's conformity reader, and the comment this
      // replaces was FALSE.** It claimed `scoreD` always arrives first because
      // `reviewC` cannot arrive until a person resolves it — a premise that is
      // true and a conclusion that does not follow, since the causal chain
      // constrains `reviewC`'s timeline and says nothing about `scoreD`'s. What
      // actually ordered them was `buildScheduler`'s `SETTLES_LAST`: `ReviewWorker`
      // runs the `fail` role at `delayMs * 4`. Remove the 4x and the order
      // reverses, because `reviewC` is dispatched first and the whole
      // suspend/resolve/resume chain completes between two timer callbacks.
      //
      // **That 4x was measured INERT by W17's adequacy reader** ([Q99](../doc/questions/q99.md)):
      // reducing it to 1x left all 342 assertions green. This row would have made
      // it load-bearing for the first time — silently, and with the effect
      // attributed to something else. `sortedSettled` removes the dependency
      // rather than pinning it.
      inner: { joined: true, settled: { '1.0': 'arrived', '1.1': 'arrived' } },
    },
    // `RN-R9`: a resumed branch is indistinguishable from one that settled that
    // way, so `1.0` ARRIVES — at a dotted path, which is the whole point.
    branchEvents: {
      '1.0': ['branch.opened', 'branch.suspended', 'branch.resumed', 'branch.arrived'],
      '1.1': ['branch.opened', 'branch.arrived'],
    },
    resolveOnSuspend: { '1.0': { at: 'reviewC', as: 'done', result: { confidence: 0.9 }, actor: 'ops' } },
    pathEnds: [{ reason: 'end', at: 'done' }],
    outcomesSeen: ['awaiting_action'],
    why: 'W23 — the row that makes Q117`s fix falsifiable, and the only nested row where a person ' +
      'is in the loop. `reviewC` is non-optional and throws, so it ends `user_action` and parks ' +
      'the branch at the DOTTED path `1.0`; the harness`s inbound step then has to mint the id ' +
      'the driver dispatched, which is exactly what `Number(branchPath)` could not do. Reverting ' +
      'the fix cost 0 assertions before this row existed',
  },

  // --- W35: a map on real workers, and P10's exit artifact --------------------
  //
  // **What these five rows add that nothing below L6 can say.** `test/matrix/` runs
  // a map from a fixture outcome log, so the arity is a literal in a fixture and
  // the ids are strings compared to strings. Here the arity is the **length of an
  // array a worker returned**, the ids are minted into a real `FyflowScheduler`'s
  // task map — which `spec/task-id.md` section 2 says **overwrites silently** on a
  // collision, the whole reason the id scheme is a correctness rule
  // ([Q13](../doc/questions/q13.md)) — and the three instances of one node run
  // concurrently in one pool.
  //
  // **Read `dispatched` first on every one of them.** Not one of those ids is
  // written in a flow definition: `map.flow.json` says `over: "items"` and says
  // nothing about how many, and no constant in this file says three either. The
  // literal below is the EXPECTATION, derived from `spec/task-id.md` before the row
  // ran, which is what makes a miscount a failure rather than a silent re-plan.
  {
    key: 'map / live-token',
    definition: MP, policyId: 'live-token', payload: THREE_WORDS, threaded: false,
    // **`FD-R4` at a TASK entry — W73.** `split`'s `inputSchema` bounds `confidence` at 1; a payload of 2 is
    // refused naming `ingest` before anything reaches the scheduler, and the row's run then starts on the
    // payload above. Read from `examples/registry.json` (the schema) and this row's definition (the entry).
    refuseAtStart: { payload: { confidence: 2, text: 'a bb ccc' }, node: 'ingest' },
    outcome: 'completed',
    // `spec/task-id.md` section 1: `runId:nodeId:branchPath:attempt`, and a map
    // instance's `branchPath` is the **dispatch's** item index (`ID-R6`, ADR 0036).
    // `ingest` and `publish` are outside the region and take `-`.
    dispatched: ['r22:ingest:-:0', 'r22:score:0:0', 'r22:score:1:0', 'r22:score:2:0',
      'r22:publish:-:0'],
    regionId: 'split',
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived', '2': 'arrived' },
    branchEvents: {
      '0': ['branch.opened', 'branch.arrived'],
      '1': ['branch.opened', 'branch.arrived'],
      '2': ['branch.opened', 'branch.arrived'],
    },
    // Order-independent: every branch arrives, so whichever settles last, the event
    // before `joinSettled` is an arrival. `spec/join-policy.md` section 4.
    joinSettledBy: 'branch.arrived',
    pathEnds: [{ reason: 'end', at: 'done' }],
    // **Five results, and each pins a different rule.**
    //
    //   - `ingest` is where the arity came from — `items.length` is 3 and nothing
    //     else in this run says 3;
    //   - the three `score` instances got **different** items, which is ADR 0037
    //     rule 3 (`JP-R11`). Handed the whole value they would read `confidence:
    //     0.9` and return three identical `{0.9, 90}`;
    //   - `publish` got the join's collection — `JP-R12`, keyed by `branchPath`,
    //     ascending, one entry per branch that arrived.
    nodeResults: {
      'r22:ingest:-:0': {
        confidence: 0.9,
        items: [
          { word: 'a', confidence: 0.1 },
          { word: 'bb', confidence: 0.2 },
          { word: 'ccc', confidence: 0.3 },
        ],
      },
      'r22:score:0:0': { confidence: 0.1, score: 10 },
      'r22:score:1:0': { confidence: 0.2, score: 20 },
      'r22:score:2:0': { confidence: 0.3, score: 30 },
      'r22:publish:-:0': {
        published: true,
        joinPayload: {
          '0': { confidence: 0.1, score: 10 },
          '1': { confidence: 0.2, score: 20 },
          '2': { confidence: 0.3, score: 30 },
        },
      },
    },
    why: 'W35 — P10`s EXIT ARTIFACT. A map on real workers: the run dispatches three tasks ' +
      'because a worker returned an array of three, and that number is in no flow definition and ' +
      'no constant here. Each instance receives its OWN item (ADR 0037 rule 3) and computes a ' +
      'different score; the join carries all three back keyed by branch path (JP-R12). A `fanout` ' +
      'cannot reach this shape at all — FD-V9 makes its branches things somebody wrote down',
  },
  {
    // **The row W33's re-sourcing exists for, and the assertion that catches its
    // absence is `nodeResults`.**
    //
    // `arrival-count` needs `N`. A map region's `branches` is the ONE declared
    // entry whatever the run opens (`spec/join-policy.md` section 1), so reading
    // `N` from it gives **1 at every arity** — and the join then fires on the FIRST
    // arrival with two branches still in flight. The run still reports `completed`
    // and every branch still arrives, so `outcome`, `settled` and `branchEvents`
    // are all unmoved: what changes is that `publish` receives a collection with
    // **one** key instead of three, because the join fired before the other two
    // existed. W4's matrix recorded only `N` too LARGE, which hangs; this is `N`
    // too small, which completes the run wrong.
    key: 'map / arrival-count',
    definition: MP, policyId: 'arrival-count', payload: THREE_WORDS, threaded: false,
    outcome: 'completed',
    dispatched: ['r23:ingest:-:0', 'r23:score:0:0', 'r23:score:1:0', 'r23:score:2:0',
      'r23:publish:-:0'],
    regionId: 'split',
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived', '2': 'arrived' },
    branchEvents: {
      '0': ['branch.opened', 'branch.arrived'],
      '1': ['branch.opened', 'branch.arrived'],
      '2': ['branch.opened', 'branch.arrived'],
    },
    joinSettledBy: 'branch.arrived',
    pathEnds: [{ reason: 'end', at: 'done' }],
    nodeResults: {
      'r23:publish:-:0': {
        published: true,
        joinPayload: {
          '0': { confidence: 0.1, score: 10 },
          '1': { confidence: 0.2, score: 20 },
          '2': { confidence: 0.3, score: 30 },
        },
      },
    },
    why: 'W35 — arrival-counting at an arity nobody declared. `N` comes from the `branch.opened` ' +
      'events this run emitted, not from the region`s one declared branch entry, and the three-key ' +
      'joinPayload above is what says so: sourced from `branches.length` the count is 1 at every ' +
      'arity, the join fires on the first arrival with two branches live, and this row completes ' +
      'with one key. Same flow, same payload, same workers as the row above; only the policy differs',
  },
  {
    // **N = 0 on real workers — the arity `FD-V9`'s floor makes the static feature
    // unable to reach.** No text, so no items, so the map opens nothing at all.
    //
    // `ingest` is the only task the run dispatches, and `publish` is never reached:
    // the region was ENTERED and its join can never fire, so `RN-R10` folds the run
    // to `stuck`. `joined` is **`null`** rather than `false` — `RN-R11` gives
    // `false` the meaning *"a policy reported it unsatisfiable"* and none did.
    //
    // **The reason is scoped, and the scope is not decoration.** `spec/join-policy.md`
    // section 5 rules that **the three policies section 3 names** answer `waiting`
    // for a region whose state is byte-identical to its state before any branch
    // opened — and v0.13 corrected that ruling in place precisely because it is
    // **false of a policy in general**: `arrival-count-decrementing`, the variant
    // `JP-R7` proposed and ADR 0025 refused, has no `need > 0` pin and reports
    // **`satisfied`** at `0 >= 0`. What holds this row up is therefore its policy
    // and not a universal: under `live-token` no verdict is available, so `joined`
    // is `null` and the run is stuck **with the reason not reported**, which is
    // [Q97](../doc/questions/q97.md) exactly where section 5 leaves it. *(The first
    // version of this comment and of the `why` below said "no policy can" and "section
    // 5 says none can" — the unscoped form, in a row whose declared Input is W34, the
    // item that scoped it. W35's conformity reader.)*
    key: 'map / N = 0',
    definition: MP, policyId: 'live-token', payload: NO_WORDS, threaded: false,
    outcome: 'stuck',
    dispatched: ['r24:ingest:-:0'],
    regionId: 'split',
    joined: null,
    settled: {},
    // No branch was opened, so there is no `branchEvents` entry to declare: the
    // emptiness is pinned by `settled` and by `dispatched` above, both of which
    // fail loudly if a phantom branch is opened.
    pathEnds: [],
    why: 'W35 — a map of ZERO items on real workers. A worker returned an empty array, so the ' +
      'region opened no branches, dispatched no tasks and can never be joined: the run folds to ' +
      '`stuck` by RN-R10 and `publish` never runs. `joined` is null, not false — this row`s policy said ' +
      'nothing, and section 5 says the three shipped policies cannot; its refused fourth variant ' +
      'reports `satisfied` at 0 >= 0, which is why the scope is stated. FD-V9`s arity floor means a ' +
      '`fanout` can never be here',
  },
  {
    // **A map INSIDE a fan-out branch — dotted branch paths minted by a run-time
    // arity, and the artifact that puts W23's and W33's results in one run.**
    //
    // `outer` is the ENTRY node, so both its branches receive a copy of the run's
    // own payload; `prep` sits at branch `1` and its map opens two instances at
    // `1.0` and `1.1`. Those are the first dotted ids anywhere that were **not**
    // written down in a definition — W23's `1.0`/`1.1` came from a `fanout` whose
    // two branch entries are named in `nested.flow.json`.
    //
    // **And the outer join carries the inner join's collection.** `gather` fires
    // and routes to `collect` at the path its own REGION sits at, which is branch
    // `1` arriving — carrying `JP-R12`'s object for `perItem`. So `publish` receives
    // a collection whose `'1'` is itself a collection, which is `JP-R12` closed
    // under nesting and is asserted in one literal below.
    key: 'nested-map / live-token',
    definition: NM, policyId: 'live-token', payload: TWO_WORDS, threaded: false,
    // **`FD-R4` at a FAN-OUT entry — W73, the shape two of forty-four corpus entries have.** `outer` opens
    // on the payload, so every branch task is held to its own schema over the SAME value (`JP-R11`):
    // `scoreA` (`score`, confidence at most 1) is the first branch and is the one named.
    refuseAtStart: { payload: { confidence: 2, text: 'a bb' }, node: 'scoreA' },
    outcome: 'completed',
    dispatched: ['r25:scoreA:0:0', 'r25:prep:1:0', 'r25:item:1.0:0', 'r25:item:1.1:0',
      'r25:publish:-:0'],
    regionId: 'outer',
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived' },
    otherRegions: {
      perItem: { joined: true, settled: { '1.0': 'arrived', '1.1': 'arrived' } },
    },
    branchEvents: {
      '0': ['branch.opened', 'branch.arrived'],
      '1': ['branch.opened', 'branch.arrived'],
      '1.0': ['branch.opened', 'branch.arrived'],
      '1.1': ['branch.opened', 'branch.arrived'],
    },
    pathEnds: [{ reason: 'end', at: 'done' }],
    nodeResults: {
      // Branch 0 got a copy of the run's payload and scored it whole; branch 1's
      // map split it into two and scored each item on its own. **Every dispatched
      // id, because this row now declares a node-level `needs`** — W43's adequacy
      // reader's bound, and W47 is the first item it obliged.
      'r25:scoreA:0:0': { confidence: 0.9, score: 90 },
      'r25:prep:1:0': {
        confidence: 0.9,
        items: [{ word: 'a', confidence: 0.1 }, { word: 'bb', confidence: 0.2 }],
      },
      'r25:item:1.0:0': { confidence: 0.1, score: 10 },
      'r25:item:1.1:0': { confidence: 0.2, score: 20 },
      'r25:publish:-:0': {
        published: true,
        joinPayload: {
          // `"."` — what this node would have received had it declared nothing,
          // which after a join is `JP-R12`'s collection. The row's original claim,
          // unchanged and now reached through the self form.
          own: {
            '0': { confidence: 0.9, score: 90 },
            '1': {
              '1.0': { confidence: 0.1, score: 10 },
              '1.1': { confidence: 0.2, score: 20 },
            },
          },
          // **`["item?"]` — the FIFTH spelling of section 3's table, on real
          // workers.** `item` is inside `perItem`, which is inside `outer`'s branch
          // 1, so `FD-V28` requires the array form and `FD-V29` refuses it
          // WITHOUT the suffix: a run can reach `publish` without `item` having
          // run, because branch 1 can be lost. Ascending `branchPath` order,
          // `JP-R12`'s rule, so the value does not depend on settle order.
          scores: [{ confidence: 0.1, score: 10 }, { confidence: 0.2, score: 20 }],
        },
      },
    },
    why: 'W35 — a map inside a fan-out branch, on real workers. The dotted ids `1.0` and `1.1` are ' +
      'minted at an arity a worker chose, where W23`s dotted ids came from branch entries somebody ' +
      'wrote down; the inner join fires and enters the outer one AS branch 1 arriving, carrying its ' +
      'own JP-R12 collection — so the outer collection`s `1` is a collection. ADR 0030 rules 1-3 ' +
      'and ADR 0037 rule 4, in one run. W47 gave `publish` a `needs` of {own: ".", scores: ' +
      '["item?"]}, which is the FIFTH spelling of section 3`s table reaching a real worker: ' +
      'without the suffix FD-V29 refuses this document, so the `?` is load-bearing here and not ' +
      'decoration — and `own` carries the collection this row has always asserted',
  },
  {
    // **`FD-R2` on real workers — the map's ONE run-time refusal, and the only
    // rule in `spec/` about what a RUN does that is not an `FD-V`.**
    //
    // `map-no-array.flow.json` is `map.flow.json` with **one field changed**:
    // `over` reads `"rows"`, and the `split` role returns `items`. No validator
    // could have seen it — `FD-V25` checks that `over` is a key NAME — so the run
    // starts, dispatches `ingest`, and stops when the map cannot find an array.
    //
    // **This is where `UnresolvedMapArity` earns its own class rather than being
    // an `InvalidDefinition`.** The definition is valid and the DATA is wrong,
    // which is a different person's bug: a flow author handed `InvalidDefinition`
    // would go and read their flow, where there is nothing to find.
    //
    // **`regionId: null` although this flow HAS a region**, and that is the row's
    // second fact: `mapItems` throws before the `regionEntered` append, so the
    // region is in the definition and not in the run. `RN-R8` then makes the run
    // `stopped` whatever its nodes say — it never reaches `RN-R10`, so this run is
    // `stopped` where the N = 0 row is `stuck`. **Two map runs that dispatch one
    // task each and end differently**, which is the whole difference between *the
    // flow asked for zero items* and *the flow asked for something that is not
    // there*.
    key: 'map / FD-R2 — over names no array',
    definition: MNA, policyId: 'live-token', payload: THREE_WORDS, threaded: false,
    outcome: 'stopped',
    dispatched: ['r26:ingest:-:0'],
    regionId: null,
    joined: null,
    runFailure: 'UnresolvedMapArity',
    // `FD-R2`: *"naming the node and the key"*. Neither is a task id, and no task
    // of `split` exists to be named — which is why the assertion reads what the
    // row declares rather than the row's dispatched ids.
    failureNames: ['"split"', '"rows"'],
    stoppedBy: 'UnresolvedMapArity',
    // W140 (Q533, P31 decision 2): the message no longer opens with the class name, so the driver's
    // `${constructor.name}: ` is the only place it comes from — and this row can hold it to once.
    stoppedByNamesItOnce: true,
    // The path did not end at an `end` node and did not end at all: the driver
    // stopped routing. `RN-R8` outranks section 3's discriminants.
    pathEnds: [],
    why: 'W35 — FD-R2 on real workers, and the one map refusal a validator cannot make. The flow ' +
      'is valid, `over` names `rows`, and the worker returns `items`: the run dispatches `ingest`, ' +
      'the map cannot resolve an arity and the driver stops routing with UnresolvedMapArity naming ' +
      'the node and the key. The region is in the definition and never in the run, because the ' +
      'throw precedes the regionEntered append — so this run is `stopped` where a map of zero ' +
      'items is `stuck`',
  },
  {
    // **ADR 0037 rule 1 — the INVARIANT — made falsifiable at L6, and it was not.**
    //
    // The driver hands each map instance `cloneValue(items[i])` and its own comment
    // says why: *"`structuredClone` preserves aliasing WITHIN one clone, so
    // `{items: [x, x]}` survives the edge hop as an array holding one object twice
    // — measured — and instances 0 and 1 would share it."* **Dropping that clone
    // cost 0 failures**, because every other payload here produces distinct items
    // and no row could express the case the comment names. W35's adequacy reader.
    //
    // `'a a'` is two references to one object, and `TallyWorker` MUTATES what it is
    // handed. So: **with the clone, both instances read `seen: 1`; without it, the
    // second instance reads the first's write and returns `seen: 2`.** An identity
    // fact turned into a value two assertions can compare.
    //
    // **The `word` field is carried through** so the row also shows the two
    // instances got the same ITEM — which is the half `map / live-token` cannot
    // show, since its three items differ.
    key: 'map / one item, two instances — ADR 0037 rule 1',
    definition: MAL, policyId: 'live-token', payload: SAME_WORD_TWICE, threaded: false,
    outcome: 'completed',
    dispatched: ['r27:ingest:-:0', 'r27:tally:0:0', 'r27:tally:1:0', 'r27:publish:-:0'],
    regionId: 'split',
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived' },
    branchEvents: {
      '0': ['branch.opened', 'branch.arrived'],
      '1': ['branch.opened', 'branch.arrived'],
    },
    joinSettledBy: 'branch.arrived',
    pathEnds: [{ reason: 'end', at: 'done' }],
    nodeResults: {
      // The arity is two because the worker returned two references; `items.length`
      // is 2 and the distinct-word count is 1.
      'r27:ingest:-:0': {
        confidence: 0.9,
        items: [{ word: 'a', confidence: 0.1 }, { word: 'a', confidence: 0.1 }],
      },
      // **Both read 1.** This is the assertion the invariant rests on.
      'r27:tally:0:0': { seen: 1, word: 'a' },
      'r27:tally:1:0': { seen: 1, word: 'a' },
      'r27:publish:-:0': {
        published: true,
        joinPayload: { '0': { seen: 1, word: 'a' }, '1': { seen: 1, word: 'a' } },
      },
    },
    why: 'W35 — ADR 0037 rule 1, the invariant, on the one shape that can falsify it. The split ' +
      'worker memoises per word, so `a a` returns an items array holding ONE object twice; ' +
      'structuredClone preserves that aliasing across the edge hop, and only the driver`s ' +
      'per-instance clone separates them. TallyWorker mutates what it is handed, so sharing would ' +
      'make the second instance read the first`s write: both read `seen: 1` here and the second ' +
      'reads 2 without the clone. Dropping that clone cost 0 failures before this row existed',
  },

  // === W43 — P12's EXIT ARTIFACT =============================================
  //
  // Three flows, four rows, and the two the plan names are **ordinary flows this
  // library could not express before P12**. Every expected value below is derived
  // from `spec/flow-definition.md` v0.12 and `spec/join-policy.md` before the first
  // run — `doc/workflow.md` section 5 rule 1 — and the derivations are written out
  // in the comments rather than left as numbers to take on trust.
  {
    /**
     * **[Q166](../doc/questions/q166.md) on real workers, and the row is about what
     * a node RECEIVES rather than about what it produces.**
     *
     * A map instance receives its own item — ADR 0037 rule 3, *map* means `f(x_i)` —
     * and that is exactly the cost Q166 recorded: given `{confidence, items}` an
     * instance sees `items[i]` and the run's own configuration is reachable by **no
     * route at all**. `needs: {"item": ".", "run": "ingest"}` is ADR 0040's answer,
     * and this row is it crossing a real scheduler.
     *
     * **The derivation, from `spec/` and from the worker roles, before the run:**
     *
     *   `ingest` is a `SplitWorker`, so it returns `{confidence: 0.9, items: [...]}`
     *   with one item per word of `THREE_WORDS` and each item's confidence its own
     *   word's length over ten — `0.1`, `0.2`, `0.3`.
     *
     *   `split` is a map over `items`, so the run opens **three** branches at the
     *   run-time arity — `spec/join-policy.md` section 4's owner table and ADR 0036,
     *   and the number is in no field of the definition. *(This cited `ID-R6`, which
     *   is the REFUSAL when no item index is supplied rather than what opens N
     *   branches; the dotted ids themselves are `spec/task-id.md` section 1's. W43's
     *   conformity reader.)*
     *
     *   `score` declares two keys, so by `FD-C1` and ADR 0040 rule 6 it receives
     *   **exactly** `{item, run}`: `item` is the `"."` form — what it would have
     *   received anyway, which for a map instance is its own item (`JP-R11`) — and
     *   `run` is the node-id form aimed at a node OUTSIDE the map region, which by
     *   `FD-C2` names one output and is written unbracketed.
     *
     *   `weigh` returns `keys`, `word`, its item's own `confidence`, and
     *   `score = round(item.confidence * run.confidence * 100)` — so with
     *   `CONTEXTED`'s 0.4 that is `round(0.1 * 0.4 * 100) = 4`,
     *   `round(0.2 * 0.4 * 100) = 8`, `round(0.3 * 0.4 * 100) = 12`. **The 0.4 is
     *   load-bearing and rule 8 is what found it** — see `CONTEXTED`.
     *
     *   `collect` is satisfied by `live-token` when the live count reaches zero
     *   having been positive, and carries the arrived branches keyed by
     *   `branchPath` in ascending segment-wise-numeric order (`JP-R12`).
     *
     * **Three independent things fail if the mechanism is wrong, and no two of them
     * fail together**: `keys` is `['item','run']` and nothing else, which is the
     * only assertion here that catches a driver giving a node MORE than it asked
     * for; the three scores are three DIFFERENT numbers, which catches an instance
     * handed the whole value or handed item 0; and `word` names which item each
     * instance actually got, so a failure says which rather than that a number
     * differed.
     */
    key: 'map-with-context / Q166 — a map instance sees the run',
    definition: MWC, policyId: 'live-token', payload: CONTEXTED, threaded: true,
    outcome: 'completed',
    dispatched: ['r28:ingest:-:0', 'r28:score:0:0', 'r28:score:1:0', 'r28:score:2:0', 'r28:publish:-:0'],
    regionId: 'split',
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived', '2': 'arrived' },
    joinSettledBy: 'branch.arrived',
    pathEnds: [{ reason: 'end', at: 'done' }],
    nodeResults: {
      'r28:ingest:-:0': {
        confidence: 0.4,
        items: [{ word: 'a', confidence: 0.1 }, { word: 'bb', confidence: 0.2 }, { word: 'ccc', confidence: 0.3 }],
      },
      'r28:score:0:0': { keys: ['item', 'run'], extraKeys: [], word: 'a', confidence: 0.1, score: 4 },
      'r28:score:1:0': { keys: ['item', 'run'], extraKeys: [], word: 'bb', confidence: 0.2, score: 8 },
      'r28:score:2:0': { keys: ['item', 'run'], extraKeys: [], word: 'ccc', confidence: 0.3, score: 12 },
      'r28:publish:-:0': {
        published: true,
        joinPayload: {
          '0': { keys: ['item', 'run'], extraKeys: [], word: 'a', confidence: 0.1, score: 4 },
          '1': { keys: ['item', 'run'], extraKeys: [], word: 'bb', confidence: 0.2, score: 8 },
          '2': { keys: ['item', 'run'], extraKeys: [], word: 'ccc', confidence: 0.3, score: 12 },
        },
      },
    },
    why: 'W43 — P12 EXIT ARTIFACT, Q166 on real workers. A map instance receives its own item AND ' +
      'the value its map node received, because it DECLARED both: needs {"item": ".", "run": ' +
      '"ingest"}, ADR 0040 rules 5 and 6. The scores are 4/8/12 because each is a function of ' +
      'BOTH keys, so neither can be dropped for zero; `keys` is [item, run] and nothing else, ' +
      'which is the only clause here that catches a driver handing a node MORE than it asked for. ' +
      'Before ADR 0040 the run config was reachable by no route and the workaround was a ' +
      'reshaping task node',
  },
  {
    /**
     * **[Q165](../doc/questions/q165.md) on real workers — *score, then fan out over
     * the scores* — and the point is what is NOT in the document.**
     *
     * That row's affordance was `{"kind": "map", "over": "0"}` after a join, which
     * validates and runs and **couples the flow to the fan-out's branch numbering**:
     * insert a branch and it silently re-points. There is no `over: "0"` here.
     * `rank` declares `needs: {"scores": ["score"]}` — the bracketed form, because
     * `score` is inside a map region `rank` is outside of, so by `FD-C2` it names
     * **N** outputs and `FD-V28` refuses the unbracketed spelling — and `over` names
     * that key. The list is in branch order by construction rather than by the
     * flow's arithmetic.
     *
     * **Two regions, and the second is opened by a value the first produced.** This
     * is the only row at L6 where a map's arity comes from a JOIN's collection: the
     * outer `split` opens three branches from a worker's array, and `rank` opens
     * three more from what those three branches returned. Nothing in the definition
     * says three, twice over.
     *
     * **The derivation, before the run**: `score` is an ordinary `ScoreWorker` here
     * and declares nothing, so by ADR 0040 rule 1 it receives what it received at
     * v0.10 — its own item — and returns `{confidence, score: round(confidence *
     * 100)}`, giving `10`, `20`, `30`. `collect` carries them keyed `0`/`1`/`2`
     * (`JP-R12`); `rank`'s `scores` is the same three as a LIST; each `publish`
     * instance receives its own element (`JP-R11`) and echoes it; `gather` collects
     * the three `publish` results, and `done` ends the run.
     */
    key: 'map-over-region-output / Q165 — a map over what a join collected',
    definition: MRO, policyId: 'live-token', payload: THREE_WORDS, threaded: true,
    outcome: 'completed',
    dispatched: [
      'r29:ingest:-:0', 'r29:score:0:0', 'r29:score:1:0', 'r29:score:2:0',
      'r29:publish:0:0', 'r29:publish:1:0', 'r29:publish:2:0',
    ],
    regionId: 'split',
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived', '2': 'arrived' },
    otherRegions: {
      rank: { joined: true, settled: { '0': 'arrived', '1': 'arrived', '2': 'arrived' } },
    },
    pathEnds: [{ reason: 'end', at: 'done' }],
    nodeResults: {
      'r29:ingest:-:0': {
        confidence: 0.9,
        items: [{ word: 'a', confidence: 0.1 }, { word: 'bb', confidence: 0.2 }, { word: 'ccc', confidence: 0.3 }],
      },
      'r29:score:0:0': { confidence: 0.1, score: 10 },
      'r29:score:1:0': { confidence: 0.2, score: 20 },
      'r29:score:2:0': { confidence: 0.3, score: 30 },
      // **Each instance receives its own ELEMENT of the resolved list**, not the
      // list and not the join's collection — which is what makes the second map a
      // map rather than a second reference.
      'r29:publish:0:0': { published: true, joinPayload: { confidence: 0.1, score: 10 } },
      'r29:publish:1:0': { published: true, joinPayload: { confidence: 0.2, score: 20 } },
      'r29:publish:2:0': { published: true, joinPayload: { confidence: 0.3, score: 30 } },
    },
    why: 'W43 — P12 EXIT ARTIFACT, Q165 on real workers. A map over what a join collected, with NO ' +
      '`over: "0"` anywhere: rank declares needs {"scores": ["score"]}, the bracketed form FD-C2 ' +
      'requires for a node inside a map region this one is outside of, and `over` names that key. ' +
      'Two regions, and the second`s arity comes from what the first`s branches returned — nothing ' +
      'in the definition says three, twice over. The workaround this replaces is a reshaping task ' +
      'node between the join and the map',
  },
  {
    /**
     * **[Q8](../doc/questions/q8.md)'s own sentence since P1, on real workers** —
     * *route to review if an earlier step flagged low confidence* — and the row
     * [W42](../doc/work-items/w42-what-a-decision-sees.md) has no other coverage at.
     *
     * **What makes it able to fail is the middle node.** `tally` returns
     * `{seen, word}` and carries **no `confidence`**, so a predicate reading
     * `ctx.outcome.result` finds nothing on either payload and routes both runs to
     * `publish`. `earlierWasLowConfidence` reads `ctx.needs.earlier`, which
     * `FD-C3` fills from the edge's own declaration — `{"earlier": "ingest"}` — and
     * that is the entry payload's confidence, `0.1`. **The two predicates disagree
     * at every input on this flow**, which is what the corpus's own
     * `ScoreWorker` spelling could not do: there `score` passes `confidence`
     * through, so both read `0.1` and reverting W42 costs nothing.
     *
     * **The pair is the assertion.** LOW dispatches `review`; HIGH does not; and
     * neither is meaningful without the other, which is this file's `r5`/`r6` and
     * `r14`/`r15`/`r16` shape applied to a declaration rather than to a policy.
     */
    key: 'decision-on-an-earlier-step LOW / Q8 — the predicate reads its edge',
    definition: DES, policyId: 'live-token', payload: LOW, threaded: false,
    outcome: 'completed',
    dispatched: ['r30:ingest:-:0', 'r30:tally:-:0', 'r30:review:-:0', 'r30:publish:-:0'],
    regionId: null,
    pathEnds: [{ reason: 'end', at: 'done' }],
    nodeResults: {
      'r30:ingest:-:0': { confidence: 0.1 },
      // **No `confidence` field at all** — this is the whole discriminator, and it
      // is asserted rather than described so the row fails if the role ever changes.
      'r30:tally:-:0': { seen: 1, word: null },
      // **The review node`s own result — W43`s conformity reader.** Without it the
      // whole W42 revert is caught by ONE assertion, the `dispatched` list; with it
      // the row says what the branch it took actually did. `review` is a
      // `PublishWorker` here, and its payload is `tally`s result on the ordinary
      // edge (ADR 0040 rule 1: it declares nothing, so it receives what it always
      // did) — NOT the edge`s `needs`, which reaches the predicate and no worker.
      'r30:review:-:0': { published: true, joinPayload: { seen: 1, word: null } },
    },
    why: 'W43 — Q8 on real workers, and the row W42 has no other coverage at. `tally` returns no ' +
      'confidence, so a predicate reading ctx.outcome routes BOTH payloads to publish; ' +
      'earlierWasLowConfidence reads ctx.needs.earlier, which FD-C3 fills from the edge`s own ' +
      '{"earlier": "ingest"}, and routes this one to review. Without an edge-level needs the ' +
      'declaration is refused at construction and this run does not start',
  },
  {
    /**
     * **The negative half, and it is what makes the row above an assertion rather
     * than a demonstration.** Same flow, same predicate, same worker roles; only
     * the entry payload differs. `ingest` returns `{confidence: 0.9}`, the edge's
     * `earlier` is that, `0.9 < 0.5` is false, and the default edge is taken —
     * `review` is never dispatched. A predicate that ignored its declaration and
     * returned a constant would pass one of these two rows and fail the other,
     * whichever constant it chose.
     */
    key: 'decision-on-an-earlier-step HIGH / Q8 — the default edge',
    definition: DES, policyId: 'live-token', payload: HIGH, threaded: false,
    outcome: 'completed',
    dispatched: ['r31:ingest:-:0', 'r31:tally:-:0', 'r31:publish:-:0'],
    regionId: null,
    pathEnds: [{ reason: 'end', at: 'done' }],
    nodeResults: {
      'r31:ingest:-:0': { confidence: 0.9 },
      'r31:tally:-:0': { seen: 1, word: null },
    },
    why: 'W43 — the control for the row above. Same flow, same predicate, same roles; the entry ' +
      'payload is 0.9, so the edge`s declared `earlier` is 0.9, the guard is false and the ' +
      'default edge is taken. review is never dispatched, and a predicate returning a constant ' +
      'fails one of these two rows whichever constant it returns',
  },
  {
    /**
     * **The same flow at a DIFFERENT run config, and it exists because one row could
     * not tell a declared key from a literal** — rule 8 obligation (c), and it is
     * [W34](../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md)'s
     * finding answered with a FIXTURE rather than with a compound probe. See
     * `CONTEXTED_AGAIN`.
     *
     * Everything is identical to `map-with-context / Q166` except `run.confidence`:
     * `0.6` rather than `0.4`, so `round(item.confidence * run.confidence * 100)` is
     * `6`, `12`, `18` where the other row is `4`, `8`, `12`. **No single literal
     * substituted for `run.confidence` passes both**, which is the whole of what the
     * second row buys and is not reachable from any number of assertions on one.
     *
     * **The items are the same three**, so what differs between the two rows is one
     * variable, and `word` and `confidence` are unmoved across them — which is what
     * makes the SCORE the thing being measured rather than the payload.
     */
    key: 'map-with-context / a SECOND run config — the key is read, not guessed',
    definition: MWC, policyId: 'live-token', payload: CONTEXTED_AGAIN, threaded: true,
    outcome: 'completed',
    dispatched: ['r32:ingest:-:0', 'r32:score:0:0', 'r32:score:1:0', 'r32:score:2:0', 'r32:publish:-:0'],
    regionId: 'split',
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived', '2': 'arrived' },
    joinSettledBy: 'branch.arrived',
    pathEnds: [{ reason: 'end', at: 'done' }],
    nodeResults: {
      'r32:ingest:-:0': {
        confidence: 0.6,
        items: [{ word: 'a', confidence: 0.1 }, { word: 'bb', confidence: 0.2 }, { word: 'ccc', confidence: 0.3 }],
      },
      'r32:score:0:0': { keys: ['item', 'run'], extraKeys: [], word: 'a', confidence: 0.1, score: 6 },
      'r32:score:1:0': { keys: ['item', 'run'], extraKeys: [], word: 'bb', confidence: 0.2, score: 12 },
      'r32:score:2:0': { keys: ['item', 'run'], extraKeys: [], word: 'ccc', confidence: 0.3, score: 18 },
      'r32:publish:-:0': {
        published: true,
        joinPayload: {
          '0': { keys: ['item', 'run'], extraKeys: [], word: 'a', confidence: 0.1, score: 6 },
          '1': { keys: ['item', 'run'], extraKeys: [], word: 'bb', confidence: 0.2, score: 12 },
          '2': { keys: ['item', 'run'], extraKeys: [], word: 'ccc', confidence: 0.3, score: 18 },
        },
      },
    },
    why: 'W43 — the same flow at a different run config, and the row exists because ONE could not ' +
      'tell *reads its declared `run` key* from *hardcodes the number that key happens to hold*: ' +
      'substituting the literal left every assertion green at 0.9 and again at 0.4, so moving the ' +
      'payload moved the coincidence rather than removing it. The scores here are 6/12/18 against ' +
      'the other row`s 4/8/12, so no single literal passes both. Two runs differing in one ' +
      'variable, which is what this file reaches for whenever a value has to be shown to come ' +
      'from where it claims',
  },
  {
    /**
     * **P13's flow, on real workers: *route to review if an earlier step flagged it,
     * and publish either way*.** [W45](../doc/work-items/w45-what-a-reference-must-be-able-to-say.md),
     * [ADR 0042](../doc/decisions/0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md),
     * `FD-C4`.
     *
     * **Written UNCONDITIONALLY the same document does not start** — `FD-V29`
     * refuses it, which is [Q187](../doc/questions/q187.md)'s whole point. So this
     * row is the accepted half of a decision whose refused half is an
     * `spec/examples/invalid/` case rather than a row here.
     *
     * **The pair is the assertion, and its halves differ by ONE payload field.** LOW
     * takes the review road and `verdict` is THERE; HIGH routes around it and
     * `verdict` is ABSENT — and the run completes either way, which before v0.13
     * was `FD-R3` stopping it. Neither row means anything without the other:
     * a driver that always composed the key would pass LOW and fail HIGH, and one
     * that never did would do the reverse.
     *
     * **`AttestWorker` reports the key set AND the `in` test**, two independent
     * expressions over the same fact — `doc/workflow.md` section 5 rule 8
     * obligation (c)'s LIMIT, which W43 paid eight failures to discover on a clause
     * with a single observer.
     */
    key: 'reference-if-it-ran LOW / FD-C4 — the key is THERE',
    definition: RIR, policyId: 'live-token', payload: LOW, threaded: false,
    outcome: 'completed',
    dispatched: ['r33:ingest:-:0', 'r33:decide:-:0', 'r33:review:-:0', 'r33:publish:-:0'],
    regionId: null,
    pathEnds: [{ reason: 'end', at: 'done' }],
    nodeResults: {
      'r33:ingest:-:0': { confidence: 0.1 },
      'r33:decide:-:0': { confidence: 0.1 },
      // `review` is a `ScoreWorker` and receives `decide`'s result on the ordinary
      // edge, so `score` is `round(0.1 * 100)`.
      'r33:review:-:0': { confidence: 0.1, score: 10 },
      // `publish` declares `{own: ".", verdict: "review?"}`. `"."` is what it would
      // have received anyway — `review`'s result, this path's ordinary edge — and
      // `verdict` is `review`'s output on this path, which exists. So both keys
      // arrive and `sawVerdict` is true.
      'r33:publish:-:0': {
        keys: ['own', 'verdict'],
        sawVerdict: true,
        verdict: { confidence: 0.1, score: 10 },
      },
    },
    why: 'W45 — the flow P13 exists for, on real workers. `isLowConfidence` reads decide`s 0.1 and ' +
      'routes to review, so the conditional reference`s target DID run and `verdict` is present ' +
      'holding review`s own result. Written as `"review"` rather than `"review?"` the document is ' +
      'refused by FD-V29 and this run does not start',
  },
  {
    /**
     * **The half that could not exist before v0.13.** Same flow, same predicate,
     * same roles; only `confidence` differs, so `decide` returns `0.9`, the guard is
     * false, the default edge is taken and `review` is never dispatched. **The run
     * COMPLETES with the key absent**, where the unconditional form would stop it
     * with `FD-R3` — which is `FD-C4` and the whole of what the suffix buys, on real
     * workers.
     *
     * **`keys: ['own']` is the assertion that no count could make.** A driver that
     * composed `verdict: null` or `verdict: undefined` would give the same task
     * count, the same outcome and the same dispatch list; only the key SET says
     * which happened, and `sawVerdict` says it a second, independent way.
     */
    key: 'reference-if-it-ran HIGH / FD-C4 — the key is ABSENT, and the run completes',
    definition: RIR, policyId: 'live-token', payload: HIGH, threaded: false,
    outcome: 'completed',
    dispatched: ['r34:ingest:-:0', 'r34:decide:-:0', 'r34:publish:-:0'],
    regionId: null,
    pathEnds: [{ reason: 'end', at: 'done' }],
    nodeResults: {
      'r34:ingest:-:0': { confidence: 0.9 },
      'r34:decide:-:0': { confidence: 0.9 },
      // `"."` is `decide`'s result here, because that is the edge `publish` came in
      // on. `verdict` names a node this run routed around, so under `FD-C4` the key
      // is not written at all — not `null`, which is what a reference to a task that
      // RAN and FAILED already resolves to.
      'r34:publish:-:0': { keys: ['own'], sawVerdict: false, verdict: null },
    },
    why: 'W45 — the control for the row above, and the row FD-C4 exists for. 0.9 fails the guard, ' +
      'review is never dispatched, and `publish` receives ONE key rather than two. The run ' +
      'completes; the unconditional form would have stopped it with FD-R3 on exactly this ' +
      'workload, which is the moment Q187 says is wrong',
  },
  {
    /**
     * **The conditional ARRAY form on real workers, and its target is routed around
     * by a DECISION** — W47, and the flow is its adequacy reader's construction.
     *
     * **What it exists for.** The item's first answer recorded `["n?"]` as
     * unreachable at L6 and gave a reason its conformity reader falsified; its
     * adequacy reader then measured the consequence — `resolveReference`'s
     * `t.form === 'all' ? [] : ABSENT` arm, which is
     * [ADR 0042](../doc/decisions/0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md)
     * rule 4's ARRAY half, was **deletable for zero L6 failures** — and built the
     * flow that observes it. *Two readers, opposite ends, one hole.*
     *
     * **The shape is `map-over-region-output` plus a DECISION**, which is the whole
     * difference: there `rank`'s `["score"]` is certain, so `FD-V29` is silent and no
     * `?` is needed. Here `ingest` routes to `split` only when its own result is low
     * confidence, so a run can reach `rank` without `score` having run — measured:
     * without the suffix the document is refused under **`FD-V29` alone**, and with
     * the ONE form under **`FD-V28`**, so all three of section 3's axes decide this
     * one reference.
     *
     * **This row is the arriving half.** The payload is low confidence, so `split`
     * runs, three `score` instances settle, and `["score?"]` resolves to their three
     * outputs in ascending `branchPath` order — which `rank`'s `over` then makes an
     * arity of three. Neither this row nor the next means anything without the
     * other: the pair is *the key is there* against *the key is `[]`*.
     */
    key: 'map-past-a-decision LOW / FD-C4 — the array RESOLVES',
    definition: MPD, policyId: 'live-token', payload: THREE_WORDS_LOW, threaded: false,
    outcome: 'completed',
    dispatched: [
      'r35:ingest:-:0', 'r35:score:0:0', 'r35:score:1:0', 'r35:score:2:0',
      'r35:publish:0:0', 'r35:publish:1:0', 'r35:publish:2:0',
    ],
    regionId: 'split',
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived', '2': 'arrived' },
    otherRegions: {
      rank: { joined: true, settled: { '0': 'arrived', '1': 'arrived', '2': 'arrived' } },
    },
    pathEnds: [{ reason: 'end', at: 'done' }],
    nodeResults: {
      'r35:ingest:-:0': {
        confidence: 0.1,
        items: [{ word: 'a', confidence: 0.1 }, { word: 'bb', confidence: 0.2 }, { word: 'ccc', confidence: 0.3 }],
      },
      'r35:score:0:0': { confidence: 0.1, score: 10 },
      'r35:score:1:0': { confidence: 0.2, score: 20 },
      'r35:score:2:0': { confidence: 0.3, score: 30 },
      'r35:publish:0:0': { published: true, joinPayload: { confidence: 0.1, score: 10 } },
      'r35:publish:1:0': { published: true, joinPayload: { confidence: 0.2, score: 20 } },
      'r35:publish:2:0': { published: true, joinPayload: { confidence: 0.3, score: 30 } },
    },
    why: 'W47 — the conditional ARRAY form `["score?"]` on real workers, past a DECISION. This is ' +
      'map-over-region-output plus one guarded edge, and the edge is the whole difference: a run ' +
      'can reach `rank` without `score` having run, so FD-V29 refuses the unconditional form and ' +
      'FD-V28 refuses the one form — all three of section 3`s axes on one reference. Here the ' +
      'guard holds, so the array resolves to three outputs in ascending branchPath order and ' +
      '`over` makes them an arity of three. Its adequacy reader built this flow after measuring ' +
      'ADR 0042 rule 4`s array half deletable for ZERO',
  },
  {
    /**
     * **`[]`, and the run STOPS ON ITS OWN ARITHMETIC** — W47, and the row ADR 0042
     * rule 4's array half exists for.
     *
     * The payload is high confidence, so `ingest`'s guard is false and the run goes
     * straight to `rank`. `score` never ran, so `["score?"]` resolves to **`[]`**
     * rather than stopping the run with `FD-R3` — which is the whole of the `?` —
     * and `over: "scores"` then names an **empty array**. A map of zero items opens
     * no branches, dispatches nothing and can never be joined, so
     * `spec/run-state.md`'s `RN-R10` makes the run **`stuck`** with **one** task
     * dispatched. W33's N = 0 ruling, reached for the first time by a REFERENCE
     * rather than by a worker returning an empty list.
     *
     * **`joined` is `null`, not `false`**: no policy said anything, exactly as the
     * `map / N = 0` row records.
     *
     * **The discriminating pair.** With the arm deleted — `return ABSENT` for both
     * forms — `scores` is absent instead of `[]`, `over` finds no key, and this run
     * is `stopped` with an `UnresolvedReference` rather than `stuck`. *One row where
     * `[]` and absent are two different run outcomes*, which is what neither of
     * W45's two rows could say: there the form is `"n?"` and both spellings of
     * *nothing* collapse to an absent key.
     */
    key: 'map-past-a-decision HIGH / FD-C4 — the array is `[]`, and the run is stuck',
    definition: MPD, policyId: 'live-token', payload: THREE_WORDS, threaded: false,
    outcome: 'stuck',
    dispatched: ['r36:ingest:-:0'],
    regionId: 'rank',
    joined: null,
    settled: {},
    pathEnds: [],
    nodeResults: {
      'r36:ingest:-:0': {
        confidence: 0.9,
        items: [{ word: 'a', confidence: 0.1 }, { word: 'bb', confidence: 0.2 }, { word: 'ccc', confidence: 0.3 }],
      },
    },
    why: 'W47 — the control for the row above, and the row ADR 0042 rule 4`s ARRAY half exists ' +
      'for. 0.9 fails `ingest`s guard, so the run reaches `rank` without `score` having run: the ' +
      'conditional array resolves to `[]` rather than stopping the run with FD-R3, `over` names ' +
      'an empty array, and a map of zero items folds to `stuck` by RN-R10 with ONE task ' +
      'dispatched. Delete the `t.form === "all" ? [] : ABSENT` arm and this run is `stopped` with ' +
      'an UnresolvedReference instead — `[]` and ABSENT are two different run outcomes here, ' +
      'which neither of W45`s rows can say',
  },
  {
    /**
     * **P14's EXIT ARTIFACT, and the row a run used to fail** — W51.
     *
     * Two sequential `fanout` regions. **Both** branches of the second declare the
     * same reference against branch 0 of the first, so the only thing that differs
     * between the two readers is the branch the author wrote it in. Before
     * [ADR 0044](../doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)
     * `publishB1` at path `0` resolved — because the two strings matched — and
     * `publishB2` at path `1` stopped the run at `FD-R3`, on a document
     * `validateDefinition` accepts with **zero findings** and whose target `FD-V29`
     * correctly calls certain.
     *
     * **No arity anywhere in it**, which is the half [Q206](../doc/questions/q206.md)'s
     * row and P14's own facts did not have: every sibling pair in both corpora was
     * `map`/`map`, so the shape that shows the defect is not about arity existed
     * nowhere until W49 built it.
     *
     * `own: "."` is here so that `first` resolving is distinguishable from the
     * composition working at all. **It is NOT this row's evidence for `JP-R11`, and
     * the first version of this docblock said it was** — W51's adequacy reader
     * measured it: handing every branch the SAME object rather than its own copy,
     * which is exactly what `JP-R11` forbids, costs **ZERO here** and is caught at
     * L1-L5 by `L2 — JP-R11: a fanout of arity THREE`. The reason is that `check`
     * compares by `JSON.stringify`, which cannot see identity. *A value assertion
     * cannot observe an aliasing rule*, and the scope belongs in the sentence
     * (`doc/workflow.md` section 1 rule 5's writing clause).
     *
     * **The same goes for `JP-R12`'s ORDER half**: `own`'s keys are `'0'` and `'1'`,
     * canonical array indices, which V8 emits ascending however they were inserted —
     * so *keys in ascending segment-wise-numeric order* is unobservable on this row
     * and is asserted where the paths are dotted.
     */
    key: 'sibling-fanouts / ADR 0044 — a run that used to STOP',
    definition: SFO, policyId: 'live-token', payload: { confidence: 0.4 }, threaded: false,
    outcome: 'completed',
    dispatched: [
      'r37:ingest:-:0', 'r37:scoreA1:0:0', 'r37:scoreA2:1:0',
      'r37:publishB1:0:0', 'r37:publishB2:1:0',
    ],
    regionId: 'splitA',
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived' },
    otherRegions: {
      splitB: { joined: true, settled: { '0': 'arrived', '1': 'arrived' } },
    },
    pathEnds: [{ reason: 'end', at: 'done' }],
    nodeResults: {
      'r37:ingest:-:0': { confidence: 0.4 },
      // **The two branch entries run DIFFERENT roles, and that is the pair's own
      // claim** (`doc/workflow.md` section 5 rule 8's fourth requirement on the
      // set). With both on `ScoreWorker` their results were IDENTICAL, so which
      // one `first` names was unobservable: rule 8 graded re-pointing the
      // reference at `scoreA2` a SURVIVOR at **0** L6 failures. Two roles, two
      // shapes, and reading the wrong branch is now a failure that says so.
      'r37:scoreA1:0:0': { confidence: 0.4, score: 40 },
      'r37:scoreA2:1:0': { seen: 1, word: null },
      'r37:publishB1:0:0': { published: true, joinPayload: { own: { '0': { confidence: 0.4, score: 40 }, '1': { seen: 1, word: null } }, first: { confidence: 0.4, score: 40 } } },
      'r37:publishB2:1:0': { published: true, joinPayload: { own: { '0': { confidence: 0.4, score: 40 }, '1': { seen: 1, word: null } }, first: { confidence: 0.4, score: 40 } } },
    },
    why: 'W51 — P14`s exit artifact. Two SIBLING fanout regions on real workers, with both ' +
      'branches of the second reading branch 0 of the first. Under the prefix rule this document ' +
      'validated with zero findings and its run STOPPED at FD-R3 in branch 1 while branch 0 ' +
      'resolved — the two branches receiving different answers to one reference because their ' +
      'indices were compared across unrelated namespaces. Both receive `scoreA1` now, and the two ' +
      'payloads being IDENTICAL is what says the reader`s own index reaches nothing',
  },
  {
    /**
     * **INDEPENDENT ARITIES, which is P14's question in one document** — W51.
     *
     * A `map` region and a `fanout` region as siblings. The map's arity is a
     * run-time fact — `split` returns one item per word, and `'a bb ccc'` is three
     * — and the fanout's is written down as two. **Neither is derived from the
     * other**, which is what makes this the plan's own shape rather than
     * `map-over-region-output`'s, where the second region's `over` names the
     * resolved reference itself and the two arities are equal by construction.
     *
     * **Both branches receive all THREE scores.** Under the prefix rule `pubA` at
     * path `0` received `score@0` and `pubB` at path `1` received `score@1`, and
     * the third output was reachable from nowhere — the shape
     * [Q206](../doc/questions/q206.md) measured, on real workers.
     *
     * **This is the row that makes reverting ADR 0044 cost something at L6.** W50
     * measured that revert at 6 L1-L5 failures and ZERO here, because all eleven
     * aimed references in both corpora had a shared region depth of zero
     * ([Q214](../doc/questions/q214.md)).
     */
    key: 'sibling-map-fanout / ADR 0044 — three items, two branches, all three seen',
    definition: SMF, policyId: 'live-token', payload: THREE_WORDS, threaded: false,
    outcome: 'completed',
    dispatched: [
      'r38:ingest:-:0', 'r38:score:0:0', 'r38:score:1:0', 'r38:score:2:0',
      'r38:refine:0:0', 'r38:refine:1:0', 'r38:refine:2:0',
      'r38:pubA:0:0', 'r38:pubB:1:0',
    ],
    // **Each `refine` is dispatched when ITS OWN `score` settles**, and the three
    // `score` instances are genuinely in flight together — this row's own `overlap`
    // column reads `yes`. So their relative order is the fan-out's and not the
    // run's, and declaring it in order made a correct row depend on the inline
    // pool's timer FIFO. W51's conformity reader, BLOCKING, measured at 12/12
    // reversed under `threaded: true`.
    regionId: 'split',
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived', '2': 'arrived' },
    otherRegions: {
      splitB: { joined: true, settled: { '0': 'arrived', '1': 'arrived' } },
    },
    pathEnds: [{ reason: 'end', at: 'done' }],
    nodeResults: {
      'r38:ingest:-:0': {
        confidence: 0.9,
        items: [{ word: 'a', confidence: 0.1 }, { word: 'bb', confidence: 0.2 }, { word: 'ccc', confidence: 0.3 }],
      },
      'r38:score:0:0': { confidence: 0.1, score: 10 },
      'r38:score:1:0': { confidence: 0.2, score: 20 },
      'r38:score:2:0': { confidence: 0.3, score: 30 },
      // **The WITHIN-region reference, and it is the other direction.** `refine` is
      // inside `region(split)` with `score`, so their chains SHARE that region and
      // the shared segment must AGREE: each instance sees its OWN score and never a
      // sibling's. `FD-V28` demands the BARE form here for the same reason — a node
      // in a map region produces one output per item, and from inside that region a
      // reader wants one. **Three different values is what says so**: a resolver
      // that made every entry visible would hand all three `score@0`, which is the
      // permissive direction and which nothing at L6 could observe before this row.
      'r38:refine:0:0': { published: true, joinPayload: { mine: { confidence: 0.1, score: 10 } } },
      'r38:refine:1:0': { published: true, joinPayload: { mine: { confidence: 0.2, score: 20 } } },
      'r38:refine:2:0': { published: true, joinPayload: { mine: { confidence: 0.3, score: 30 } } },
      'r38:pubA:0:0': { published: true, joinPayload: { scored: [{ confidence: 0.1, score: 10 }, { confidence: 0.2, score: 20 }, { confidence: 0.3, score: 30 }] } },
      'r38:pubB:1:0': { published: true, joinPayload: { scored: [{ confidence: 0.1, score: 10 }, { confidence: 0.2, score: 20 }, { confidence: 0.3, score: 30 }] } },
    },
    why: 'W51 — P14`s question at the rung that runs. A map region of THREE and a fanout region ' +
      'of TWO, siblings, with neither arity derived from the other: both branches receive all ' +
      'three scores in ascending branchPath order. Under the prefix rule each received the one ' +
      'output whose index matched its own and the third was reachable from nowhere. Revert the ' +
      'resolver and this row is what goes red — before it, that revert cost ZERO at L6',
  },

  // --- W58: what a node says about its own task, on real workers ----------------
  //
  // **Two rows, and P16's prediction 2 is the first.** `retry.flow.json` is a `map` over
  // three items whose branch task declares `retryPolicy: { maxRetries: 1, backoffMs: 0 }`
  // on a pool whose role fails the FIRST attempt of every task id and succeeds the second.
  // So three tasks each fail once, the scheduler re-dispatches each inside its own id, all
  // three settle `done`, and every outcome record carries `attempts: 1` — read twice, from
  // the record and from the live task. **A map rather than a single task, deliberately**:
  // `doc/workflow.md` section 5 rule 8 obligation (a)'s v0.16 clause says instantiate the
  // shape the feature was NOT built for, and a per-node policy inside a map region is per
  // INSTANCE — three separate retry budgets from one declared object, which no single-task
  // row can show. `nodeResults` pins the second attempt's marker, so a scheduler that
  // reported `attempts: 1` while running the first attempt's code would fail on the value.
  //
  // **The negative control is the row's `why`**: revert the passthrough and every instance
  // ends `user_action` on its first failure with `attempts: 0` — the run suspends, and
  // `dispatched`, `outcome`, `settled` and both `attempts` observers all go red at once.
  {
    key: 'retry / a task fails ONCE and the scheduler retries it — attempts is 1, per instance',
    definition: RT, policyId: 'live-token', payload: THREE_WORDS, threaded: false,
    regionId: 'split',
    outcome: 'completed',
    // Three instances at the map's arity, dispatched in one turn in index order (JP-R5), each
    // re-dispatched once by the scheduler under the SAME id — a retry mints nothing.
    dispatched: ['r39:ingest:-:0', 'r39:flaky:0:0', 'r39:flaky:1:0', 'r39:flaky:2:0', 'r39:publish:-:0'],
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived', '2': 'arrived' },
    pathEnds: [{ reason: 'end', at: 'done' }],
    // Derived from `spec/flow-definition.md` section 2 (v0.16) and the worker's `retry` arm:
    // each instance's SECOND attempt returns `score`'s shape plus `retried: true`, so a run in
    // which the first attempt had somehow succeeded fails here on the value.
    nodeResults: {
      'r39:ingest:-:0': {
        confidence: 0.9,
        items: [{ word: 'a', confidence: 0.1 }, { word: 'bb', confidence: 0.2 }, { word: 'ccc', confidence: 0.3 }],
      },
      'r39:flaky:0:0': { confidence: 0.1, score: 10, retried: true },
      'r39:flaky:1:0': { confidence: 0.2, score: 20, retried: true },
      'r39:flaky:2:0': { confidence: 0.3, score: 30, retried: true },
      'r39:publish:-:0': { published: true, joinPayload: {
        '0': { confidence: 0.1, score: 10, retried: true },
        '1': { confidence: 0.2, score: 20, retried: true },
        '2': { confidence: 0.3, score: 30, retried: true },
      } },
    },
    // `maxRetries: 1` and one failure each: exactly one retry used, per instance, on both
    // observers. `OR-R2` carries the field; `spec/flow-definition.md` section 2 says what it
    // counts.
    attempts: { 'r39:flaky:0:0': 1, 'r39:flaky:1:0': 1, 'r39:flaky:2:0': 1 },
    why: 'W58 — Q16`s TASK half on real workers, and P16 prediction 2: the first non-zero ' +
      '`attempts` a scheduler has ever set at any rung. The node declares `retryPolicy`, the ' +
      'driver passes it through as it passes `optional`, the worker fails each instance`s first ' +
      'attempt, and the scheduler retries inside the same task id — three budgets from one ' +
      'declared object, because inside a map the policy is per instance. With the passthrough ' +
      'reverted every instance ends `user_action` at attempts 0 and the run suspends',
  },
  // **The group row.** `group.flow.json` is linear — ingest, a `gated` node declaring
  // `workerGroups: ["gate"]`, publish — on a scheduler whose one group is a
  // `ConcurrentLimitGroup(1)` named `gate`. The harness takes that one slot before the run
  // starts (`holdGroup`), so `gated` is `resource.blocked` on dispatch; the harness gives the
  // slot back on the scheduler's own `resource.blocked` event, and the task then runs. The
  // sequence asserted is the scheduler reference's own ordering — blocked on the push,
  // unblocked on the exit, acquired immediately after `onStart`, released immediately after
  // `onFinish` — with `task.running` where a dispatch can only come after acquisition.
  // **The negative control**: with the passthrough reverted the task names no group, is never
  // blocked, runs at once, and has NO resource events at all — the sequence assertion and the
  // cross-row clause both go red.
  {
    key: 'group / a task blocked behind a ConcurrentLimitGroup(1) the harness holds, then released',
    definition: GR, policyId: 'live-token', payload: HIGH, threaded: false,
    regionId: null,
    outcome: 'completed',
    dispatched: ['r40:ingest:-:0', 'r40:gated:-:0', 'r40:publish:-:0'],
    pathEnds: [{ reason: 'end', at: 'done' }],
    nodeResults: {
      'r40:ingest:-:0': { confidence: 0.9 },
      'r40:gated:-:0': { confidence: 0.9, score: 90 },
      'r40:publish:-:0': { published: true, joinPayload: { confidence: 0.9, score: 90 } },
    },
    holdGroup: 'gate',
    resourceEvents: {
      'r40:gated:-:0': ['resource.blocked', 'resource.unblocked', 'resource.acquired', 'task.running', 'resource.released'],
    },
    why: 'W58 — `workerGroups` on real workers, and P16 fact 2`s answer at the rung that shows ' +
      'it: the node names a group the registry declares, the driver passes it through, and the ' +
      'scheduler blocks the task behind a slot the harness holds — then runs it when the slot is ' +
      'released. Nothing but the node`s own key puts the task behind that group: its pool ' +
      'declares none. With the passthrough reverted the task runs unblocked and reports no ' +
      'resource event, which is exactly what the scheduler does with an UNKNOWN group id too',
  },
  // **W59 — P16's EXIT ARTIFACT, and it is two rows.** `typed.flow.json` is linear: ingest, then
  // `low` and `high`, two nodes of the ONE type `Scorer` with DIFFERENT settings — `factor` 10
  // against 100, `failFirst` false against true — then publish. Each typed worker receives the
  // envelope `{ settings, input }` (`FD-C5`) and returns a score computed from BOTH keys, so the
  // two answers differ because the settings do and for no other reason; `high` fails its first
  // attempt on purpose and is retried under the TYPE's `retryPolicy` — the node declares none —
  // so `attempts` reads 1 on both observers. Both hold `scorer`, the group the type declares
  // and the helper registered, read back by id. The pool is the helper's, keyed `Scorer`.
  //
  // **The negative controls are the item's own `Tests:` line**: delete the envelope and every
  // typed worker reads its settings as `undefined` — `factor` 0, both scores 0, the pair
  // collapses to one value and `keys` is no longer the two; make the two settings EQUAL and
  // the cross-row pair clause goes red before any worker runs, because whatever makes a
  // discriminating pair differ is itself a claim.
  {
    key: 'typed / two nodes of ONE type with DIFFERENT settings — the envelope, the type`s retry, the type`s group',
    definition: TY, policyId: 'live-token', payload: HIGH, threaded: false,
    regionId: null,
    outcome: 'completed',
    dispatched: ['r41:ingest:-:0', 'r41:low:-:0', 'r41:high:-:0', 'r41:publish:-:0'],
    pathEnds: [{ reason: 'end', at: 'done' }],
    // Derived from the `typed` role's return shape and each node's own settings: `keys` is the
    // envelope's key set, `score` is `round(confidence * factor)`, and `high`'s `retried` is the
    // second attempt's marker. Key order is the worker's return order, because `check` compares
    // JSON text.
    nodeResults: {
      'r41:ingest:-:0': { confidence: 0.9 },
      'r41:low:-:0': { keys: ['input', 'settings'], extraKeys: [], settingsKeys: ['factor', 'failFirst'], confidence: 0.9, factor: 10, score: 9, retried: false },
      'r41:high:-:0': { keys: ['input', 'settings'], extraKeys: [], settingsKeys: ['factor', 'failFirst'], confidence: 0.9, factor: 100, score: 90, retried: true },
      'r41:publish:-:0': { published: true, joinPayload: { keys: ['input', 'settings'], extraKeys: [], settingsKeys: ['factor', 'failFirst'], confidence: 0.9, factor: 100, score: 90, retried: true } },
    },
    // The TYPE's policy — `maxRetries: 1` — spent once, on the node whose settings say so.
    attempts: { 'r41:high:-:0': 1 },
    // Both typed tasks acquired the type's group, by id — the scheduler's map KEY, which is not the
    // object's own name (`buildScheduler` registers it under a different one on purpose). **And a
    // task acquires its pool's group once per ADMISSION**: `high` is admitted twice, once per
    // attempt, so it reads two — measured on the first run of this row, which expected one. The
    // adequacy reader then measured the same doubling with NO retry, on a threaded pool at
    // `maxThreads: 2` whose third instance was admitted, found no free worker, and was admitted
    // again — so the mechanism is admission and not retry (Q262), and these literals are a
    // property of an INLINE pool with no contention, which the type's `pool` declares.
    heldGroups: { 'r41:low:-:0': ['scorer'], 'r41:high:-:0': ['scorer', 'scorer'] },
    why: 'W59 — P16`s exit artifact, half one: two typed nodes of ONE type receive `{ settings, input }` ' +
      'and compute DIFFERENT answers from their settings (9 against 90 from one input); `high` ' +
      'retries once under a policy the TYPE declares and the node does not; both hold the group the ' +
      'type declares, registered through the bootstrap helper. With the envelope deleted both ' +
      'scores are 0 and `keys` is wrong; with the two settings made equal the pair clause is red',
  },
  // **`typed-regions.flow.json` — the two shapes the feature was NOT built for, on real workers**
  // (obligation (a), v0.16): branch 1 of a fanout is a typed task (`relay`, at path `1`), and it
  // feeds a `map` whose branch is a typed task (`rank`, at `1.0`, `1.1`, `1.2` — arity three from
  // the `split` role's items, written in no definition field). Each map instance's envelope
  // wraps its OWN item under `JP-R11` — three different confidences, three different scores —
  // and never the map node's value. Branch 0 is a bare `ScoreWorker`, so the two halves sit in
  // one region and the outer join carries a bare result beside a typed region's collection.
  {
    key: 'typed-regions / a typed task inside a fanout branch feeding a typed map branch at arity three',
    definition: TR, policyId: 'live-token', payload: THREE_WORDS, threaded: false,
    regionId: 'fan',
    outcome: 'completed',
    // Both branches opened in one turn in declaration order (JP-R5); the three instances when
    // `relay` settles, in index order; publish when the outer join fires.
    dispatched: ['r42:ingest:-:0', 'r42:inB:0:0', 'r42:relay:1:0', 'r42:rank:1.0:0', 'r42:rank:1.1:0', 'r42:rank:1.2:0', 'r42:publish:-:0'],
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived' },
    otherRegions: {
      each: { joined: true, settled: { '1.0': 'arrived', '1.1': 'arrived', '1.2': 'arrived' } },
    },
    branchEvents: {
      '0': ['branch.opened', 'branch.arrived'],
      '1': ['branch.opened', 'branch.arrived'],
      '1.0': ['branch.opened', 'branch.arrived'],
      '1.1': ['branch.opened', 'branch.arrived'],
      '1.2': ['branch.opened', 'branch.arrived'],
    },
    pathEnds: [{ reason: 'end', at: 'done' }],
    nodeResults: {
      'r42:ingest:-:0': {
        confidence: 0.9,
        items: [{ word: 'a', confidence: 0.1 }, { word: 'bb', confidence: 0.2 }, { word: 'ccc', confidence: 0.3 }],
      },
      'r42:inB:0:0': { confidence: 0.9, score: 90 },
      // `relay` received ingest's whole result as `input` (the ordinary edge inside the envelope),
      // scored it by its own factor, and echoed the items the map then iterates.
      'r42:relay:1:0': {
        keys: ['input', 'settings'], extraKeys: [], settingsKeys: ['factor'], confidence: 0.9, factor: 20, score: 18, retried: false,
        items: [{ word: 'a', confidence: 0.1 }, { word: 'bb', confidence: 0.2 }, { word: 'ccc', confidence: 0.3 }],
      },
      // Each instance's `input` is ITS OWN item — `JP-R11` inside `FD-C5` — so the three scores
      // are three different numbers from one declared settings object.
      'r42:rank:1.0:0': { keys: ['input', 'settings'], extraKeys: [], settingsKeys: ['factor'], confidence: 0.1, factor: 1000, score: 100, retried: false },
      'r42:rank:1.1:0': { keys: ['input', 'settings'], extraKeys: [], settingsKeys: ['factor'], confidence: 0.2, factor: 1000, score: 200, retried: false },
      'r42:rank:1.2:0': { keys: ['input', 'settings'], extraKeys: [], settingsKeys: ['factor'], confidence: 0.3, factor: 1000, score: 300, retried: false },
      // The outer join's collection: branch 0's bare result, and at key `1` the inner join's
      // collection keyed by the whole dotted path — `nested-map`'s shape with typed instances.
      'r42:publish:-:0': {
        published: true,
        joinPayload: {
          '0': { confidence: 0.9, score: 90 },
          '1': {
            '1.0': { keys: ['input', 'settings'], extraKeys: [], settingsKeys: ['factor'], confidence: 0.1, factor: 1000, score: 100, retried: false },
            '1.1': { keys: ['input', 'settings'], extraKeys: [], settingsKeys: ['factor'], confidence: 0.2, factor: 1000, score: 200, retried: false },
            '1.2': { keys: ['input', 'settings'], extraKeys: [], settingsKeys: ['factor'], confidence: 0.3, factor: 1000, score: 300, retried: false },
          },
        },
      },
    },
    // Every typed task — the branch entry and all three instances — held the type's group; the
    // bare branch and the bare ends held none.
    heldGroups: {
      'r42:relay:1:0': ['scorer'],
      'r42:rank:1.0:0': ['scorer'], 'r42:rank:1.1:0': ['scorer'], 'r42:rank:1.2:0': ['scorer'],
    },
    why: 'W59 — P16`s exit artifact, half two, and obligation (a)`s shapes: a typed task at path 1 ' +
      'inside a fanout and a typed map branch at 1.0, 1.1, 1.2, each instance`s envelope wrapping its ' +
      'OWN item (three confidences, three scores from one settings object). The outer join carries ' +
      'a bare branch beside the typed region`s collection. Every typed id held `scorer`; no bare id did',
  },
  // **W63 — P17's EXIT ARTIFACT, and it is [Q263](../doc/questions/q263.md) as THREE rows on ONE
  // flow.** `transformed.flow.json`: `ingest` (a `SplitWorker`, three items from `'a bb ccc'`), a
  // `map` whose typed branch `reshape` (`Echo`, `settings: { scale: 100 }`) declares a transform
  // that RESHAPES its own item — `{ word, score: $round(confidence * $settings.scale), fields:
  // $keys($) }` — into `gather`; then a fanout of two `Scorer`s with factors 100 and 1000, each
  // reading ingest's whole result through `needs: { run: "ingest" }` and the transform `run`, each
  // routed to `abandoned` when `isLowScore` (score below 50) says so; then `collect`, whose typed
  // successor `total` (`Echo`) declares `transform: { lang: "jsonata", expr: "$sum([*.score])" }`
  // and NO reshaping node — its worker receiving the REDUCED value as `input` (`FD-C6`).
  //
  // **The payload decides the arity, and every expected value is derived from the flow's text and
  // the spec, never from output**: `JP-R12` says the join carries `{ [branchPath]: result }` for the
  // branches that ARRIVED and `{}` for none; ADR 0051 rule 3 says the wrapper hands the inner
  // worker `{ settings, input }` with `input` REPLACED; JSONata's documented semantics say
  // `$sum([*.score])` over that record is the sum of the arrived scores and `0` over `{}`, where
  // `$sum(*.score)` would be `undefined` — so `inputType: 'number'` on the arity-zero row is the
  // whole of Q263's third arity, and the two scorers' factors make the three totals 990, 400 and 0.
  // The `Echo` pool is a real THREAD (see `NODE_TYPES`), so the adapter's worker half crossed to it
  // by URL; `markedKeys: []` on every reshaped item is ADR 0052 rule 6 observed on an array the
  // engine built (`$keys($)` is a marked sequence, measured), which no JSON comparison could see.
  //
  // **Branch paths `0` and `1` belong to TWO sibling regions here** — the map's instances and the
  // fanout's branches — so a path's event list is both regions' in causal order: the map region
  // completes before `gather` fires and `split` opens. Path `2` is the map's alone.
  //
  // **The negative controls are the item's own `Tests:` line**: swap the arity-one and arity-two
  // rows' expected totals and both are red on the value; delete `total`'s transform and it receives
  // the raw record (`inputType: 'object'`, `input` a keyed record); put the reshaping node back —
  // a task between `collect` and `total` — and the DOCUMENT still validates with zero findings,
  // because that road is removed rather than forbidden (the cross-row block asks the validator; at
  // RUN time a relay whose worker returns `{ published, joinPayload }` changes what `total` receives,
  // so the sentence is a validator-level one — the adequacy reader, M26).
  {
    key: 'transformed / arity TWO — the join`s typed successor receives $sum([*.score]) over both branches, and NO reshaping node',
    definition: TX, policyId: 'live-token', payload: THREE_WORDS, threaded: false,
    regionId: 'split',
    outcome: 'completed',
    // The three map instances when `ingest` settles, in index order (JP-R5); both scorers in one
    // turn when `gather` fires, in declaration order; `total` when `collect` fires.
    dispatched: ['r43:ingest:-:0', 'r43:reshape:0:0', 'r43:reshape:1:0', 'r43:reshape:2:0', 'r43:scoreA:0:0', 'r43:scoreB:1:0', 'r43:total:-:0'],
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived' },
    otherRegions: { each: { joined: true, settled: { '0': 'arrived', '1': 'arrived', '2': 'arrived' } } },
    branchEvents: {
      '0': ['branch.opened', 'branch.arrived', 'branch.opened', 'branch.arrived'],
      '1': ['branch.opened', 'branch.arrived', 'branch.opened', 'branch.arrived'],
      '2': ['branch.opened', 'branch.arrived'],
    },
    pathEnds: [{ reason: 'end', at: 'done' }],
    nodeResults: {
      'r43:ingest:-:0': { confidence: 0.9, items: ITEMS_ABC },
      // Each instance's `input` is its OWN item RESHAPED by the transform (`JP-R11` inside `FD-C6`).
      'r43:reshape:0:0': RESHAPED('a', 10),
      'r43:reshape:1:0': RESHAPED('bb', 20),
      'r43:reshape:2:0': RESHAPED('ccc', 30),
      // Each scorer's `input` is ingest's whole result — `needs` composed `{ run }` and the
      // transform selected `run` — so the score is `confidence * factor` and the items are echoed.
      'r43:scoreA:0:0': SCORED(0.9, 100),
      'r43:scoreB:1:0': SCORED(0.9, 1000),
      // **The exit artifact's value**: `$sum([*.score])` over `{ "0": {…score: 90}, "1": {…score: 900} }`.
      'r43:total:-:0': REDUCED(990),
    },
    heldGroups: { 'r43:scoreA:0:0': ['scorer'], 'r43:scoreB:1:0': ['scorer'] },
    why: 'W63 — P17`s exit artifact at arity two: a typed map branch reshapes its own item through a ' +
      'declared transform reading $settings, two typed scorers arrive at the join, and the join`s ' +
      'typed successor receives $sum([*.score]) over JP-R12`s record — 990 — as its input, with no ' +
      'reshaping node between the join and it (FD-C6). Every value is what the worker RECEIVED',
  },
  {
    key: 'transformed / arity ONE — a branch routed away (P1`s case), the successor receives the one score and not an array',
    definition: TX, policyId: 'live-token', payload: CONTEXTED, threaded: false,
    regionId: 'split',
    outcome: 'completed',
    dispatched: ['r44:ingest:-:0', 'r44:reshape:0:0', 'r44:reshape:1:0', 'r44:reshape:2:0', 'r44:scoreA:0:0', 'r44:scoreB:1:0', 'r44:total:-:0'],
    joined: true,
    // `scoreA` scores 40 and `isLowScore` routes it to `abandoned`; `scoreB` scores 400 and arrives.
    settled: { '0': 'exited', '1': 'arrived' },
    otherRegions: { each: { joined: true, settled: { '0': 'arrived', '1': 'arrived', '2': 'arrived' } } },
    branchEvents: {
      '0': ['branch.opened', 'branch.arrived', 'branch.opened', 'branch.exited'],
      '1': ['branch.opened', 'branch.arrived', 'branch.opened', 'branch.arrived'],
      '2': ['branch.opened', 'branch.arrived'],
    },
    pathEnds: [{ reason: 'end', at: 'abandoned' }, { reason: 'end', at: 'done' }],
    nodeResults: {
      'r44:ingest:-:0': { confidence: 0.4, items: ITEMS_ABC },
      // The reshaped items do not depend on the payload's confidence — a word's is its length.
      'r44:reshape:0:0': RESHAPED('a', 10),
      'r44:reshape:1:0': RESHAPED('bb', 20),
      'r44:reshape:2:0': RESHAPED('ccc', 30),
      'r44:scoreA:0:0': SCORED(0.4, 100),
      'r44:scoreB:1:0': SCORED(0.4, 1000),
      // **Q263's second arity**: the record holds ONE entry, `*.score` would be the SCALAR 400
      // (JSONata's singleton rule), `[*.score]` is `[400]`, and the sum is 400 — a number, like the
      // row above and unlike it in value, which is the pair the cross-row block asserts.
      'r44:total:-:0': REDUCED(400),
    },
    heldGroups: { 'r44:scoreA:0:0': ['scorer'], 'r44:scoreB:1:0': ['scorer'] },
    why: 'W63 — Q263 at arity one, P1`s own case under live-token: scoreA is routed away by a decision ' +
      'and the join fires when scoreB arrives, so the successor`s transform runs over a one-entry ' +
      'record and receives 400 — the array form makes it a number rather than the scalar the path ' +
      'alone would give. Swapped with the arity-two row`s expected total, both rows are red',
  },
  {
    key: 'transformed / arity ZERO — a join nothing reached fires with {} under live-token, and the successor receives 0 rather than undefined',
    definition: TX, policyId: 'live-token', payload: FAINT, threaded: false,
    regionId: 'split',
    outcome: 'completed',
    dispatched: ['r45:ingest:-:0', 'r45:reshape:0:0', 'r45:reshape:1:0', 'r45:reshape:2:0', 'r45:scoreA:0:0', 'r45:scoreB:1:0', 'r45:total:-:0'],
    joined: true,
    // 4 and 40 are both below 50: both branches exit at `abandoned`, `live-token` fires the join
    // having been reached by nothing (ADR 0025's live-token column, `all-exit`'s shape), and
    // `total` is still dispatched — over `{}`.
    settled: { '0': 'exited', '1': 'exited' },
    otherRegions: { each: { joined: true, settled: { '0': 'arrived', '1': 'arrived', '2': 'arrived' } } },
    branchEvents: {
      '0': ['branch.opened', 'branch.arrived', 'branch.opened', 'branch.exited'],
      '1': ['branch.opened', 'branch.arrived', 'branch.opened', 'branch.exited'],
      '2': ['branch.opened', 'branch.arrived'],
    },
    // Both branches end at `abandoned`, then `total` reaches `done`; the first two entries are
    // identical, so this array does not encode which branch exited first.
    pathEnds: [{ reason: 'end', at: 'abandoned' }, { reason: 'end', at: 'abandoned' }, { reason: 'end', at: 'done' }],
    nodeResults: {
      'r45:ingest:-:0': { confidence: 0.04, items: ITEMS_ABC },
      'r45:reshape:0:0': RESHAPED('a', 10),
      'r45:reshape:1:0': RESHAPED('bb', 20),
      'r45:reshape:2:0': RESHAPED('ccc', 30),
      'r45:scoreA:0:0': SCORED(0.04, 100),
      'r45:scoreB:1:0': SCORED(0.04, 1000),
      // **Q263's third arity, and the reason the plan's expression is the ARRAY form**: over `{}`
      // `$sum(*.score)` is `undefined` and `$sum([*.score])` is `0` (P17 fact 5, re-run at this
      // item's start in both runtimes). The worker received the NUMBER 0, and `inputType` is a
      // SECOND expression over that value (obligation (c)'s LIMIT): the value already discriminates,
      // because an `undefined` input drops its key from the JSON text `check` compares — this read
      // *"because JSON text cannot tell the two apart"*, which both readers found false.
      'r45:total:-:0': REDUCED(0),
    },
    heldGroups: { 'r45:scoreA:0:0': ['scorer'], 'r45:scoreB:1:0': ['scorer'] },
    why: 'W63 — Q263 at arity zero: both scorers are routed away, live-token fires the join over {} ' +
      '(ADR 0025), and the successor`s transform is evaluated over an empty record — $sum([*.score]) ' +
      'is 0 where $sum(*.score) would be undefined, so the worker receives a NUMBER and the run ' +
      'completes with every path at an end; inputType is the second expression over that value',
  },
  // **W63 — P17 decision 5 measured end to end, with a person in the loop.** `transform-fails.flow.json`
  // is `suspend-resume`'s shape with two failing transforms instead of a failing worker: `review`
  // (`Echo`) declares `$.confidence + " points"`, an author who meant `&` — `T2002`, `1 + "a"`'s
  // shape — and `stamp` declares `{ confidence: $.confidence, at: $now() }`, the clock ADR 0052
  // rule 7 unbinds — `UNBOUND`. Neither node is `optional`, so each is parked `user_action` with
  // `TransformFailed`'s message as the task's error (read on two observers), run state is
  // `awaiting_action`, and a person `resolve()`s each `done` with the value the transform did not
  // supply; RN-R9 makes the resumed branch arrive, the join fires over all three branches and the
  // run completes. `scoreA` beside them is a typed node with NO transform — `FD-C5`'s two-key
  // envelope to the byte, `keys: ['input', 'settings']`, in a run whose `Scorer` pool carries no
  // engine (the cross-row pair with the three rows above, same type, decided by the flow). And
  // `note` is the fourth branch: a typed node whose transform SUCCEEDS over the ordinary edge's
  // value — `FD-C5`'s FIRST kind, which `transformed.flow.json` cannot carry because its entry is an
  // untyped `SplitWorker`, so before this branch the two flows carried a successful transform on
  // three of the four kinds the rule enumerates (the adequacy reader; v0.17's enumeration clause).
  //
  // **The `Echo` type declares ONE retry**, so each failing transform is evaluated AGAIN under the
  // TYPE's policy — a transform failure is a task failure and takes the retry road any worker throw
  // takes — fails again, and parks the task on its second attempt: `attempts: 1` on both observers.
  // *(The type declared ZERO retries first and rule 8 measured that INERT — the scheduler's default
  // is zero, so the row read 0 with the declaration deleted; one retry is what the default cannot
  // supply.)* With W62's shadows reverted `$now()` returns a timestamp, `stamp` never parks, its
  // resolve step never fires and the row is red — the L6 observer of ADR 0052 rule 7 W62 had none of.
  {
    key: 'transform-fails / a transform FAILS at run time on two non-optional nodes (T2002, UNBOUND) — parked as user_action, resolved by a person, the run completes',
    definition: TF, policyId: 'live-token', payload: HIGH, threaded: false,
    outcome: 'completed',
    dispatched: ['r46:ingest:-:0', 'r46:scoreA:0:0', 'r46:review:1:0', 'r46:stamp:2:0', 'r46:note:3:0', 'r46:publish:-:0'],
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived', '2': 'arrived', '3': 'arrived' },
    resolveOnSuspend: {
      // **`FD-R4` at the resolve boundary — W73.** W63's values (`{ points: … }`, `{ confidence, at }`) are what the
      // TRANSFORM did not supply and not what the WORKER returns, and `echo`'s `outputSchema` refuses both:
      // each is tried first and REFUSED with the task still suspended, and the person then resolves
      // with the worker's declared example — the value a schema tells a person to supply.
      '1': { at: 'review', as: 'done', refusedFirst: { points: 'nine, supplied by a person' }, result: ECHO_EXAMPLE, actor: 'a-person' },
      '2': { at: 'stamp', as: 'done', refusedFirst: { confidence: 0.9, at: 'a clock a person read' }, result: ECHO_EXAMPLE, actor: 'a-person' },
    },
    outcomesSeen: ['awaiting_action'],
    outcomesNotSeen: ['stuck', 'failed'],
    branchEvents: {
      '0': ['branch.opened', 'branch.arrived'],
      '1': ['branch.opened', 'branch.suspended', 'branch.resumed', 'branch.arrived'],
      '2': ['branch.opened', 'branch.suspended', 'branch.resumed', 'branch.arrived'],
      '3': ['branch.opened', 'branch.arrived'],
    },
    pathEnds: [{ reason: 'end', at: 'done' }],
    regionSuspended: [],
    nodeResults: {
      'r46:ingest:-:0': { confidence: 0.9 },
      // A typed node with NO transform: the two-key envelope, byte for byte (`FD-C5`).
      'r46:scoreA:0:0': { keys: ['input', 'settings'], extraKeys: [], settingsKeys: ['factor'], confidence: 0.9, factor: 10, score: 9, retried: false },
      // RN-R9: a resolved task's result is the person's, and that is what the branch carries in.
      'r46:review:1:0': ECHO_EXAMPLE,
      'r46:stamp:2:0': ECHO_EXAMPLE,
      // A transform that SUCCEEDS over the ordinary edge's value — kind 1 of `FD-C5`'s four.
      'r46:note:3:0': NOTED,
      'r46:publish:-:0': { published: true, joinPayload: {
        '0': { keys: ['input', 'settings'], extraKeys: [], settingsKeys: ['factor'], confidence: 0.9, factor: 10, score: 9, retried: false },
        '1': ECHO_EXAMPLE,
        '2': ECHO_EXAMPLE,
        '3': NOTED,
      } },
    },
    // ONE retry under the TYPE's policy (the nodes declare none): each transform evaluated twice,
    // failing twice, the task parked on its second attempt — on both observers.
    attempts: { 'r46:review:1:0': 1, 'r46:stamp:2:0': 1 },
    // `TransformFailed`'s message: the language, the expression, the engine's code in brackets, why.
    taskErrors: {
      'r46:review:1:0': ['transform failed — jsonata', '[T2002]', 'must evaluate to a number'],
      'r46:stamp:2:0': ['transform failed — jsonata', '[UNBOUND]', '$now() is unbound'],
    },
    heldGroups: { 'r46:scoreA:0:0': ['scorer'] },
    why: 'W63 — P17 decision 5 end to end: two declared transforms fail at run time (a type error, and ' +
      'a clock the adapter unbinds), each task is retried once under the type`s policy and parked ' +
      'user_action with TransformFailed`s message as its error, a person resolves each — the value the ' +
      'transform did not supply is REFUSED first by FD-R4 (W73), and the worker`s declared example is what goes through — ' +
      'the join fires and the run completes. Beside them one typed node ' +
      'declares no transform and receives FD-C5`s two keys to the byte, and one transforms an ' +
      'ordinary edge`s value successfully — the fourth of FD-C5`s kinds',
  },
  // **P18's SAMPLE, on real workers, in both L6 runtimes — W67, and it is the plan's exit
  // artifact.** Two JSON documents and a shim: `examples/registry.json` says what exists,
  // `examples/flows/triage.flow.json` says what runs, and `run-flow.ts` supplies the four things
  // P18 decision 7 keeps as code — a predicate, a custom group TYPE, a custom node-type CLASS and a
  // language adapter. Nothing below builds a pool, a group, a scheduler or a `Driver`.
  //
  // **Two rows, because the pair the artifact turns on needs both GpuModel instances in ONE run.**
  // `classify`'s decision edge reads `isLowConfidence` off its own result, so the LOW row visits
  // `review` on the NAMED instance `prompt-big` (the large model, one thread, two units of resident
  // VRAM) while `audit` runs on the type's DEFAULT instance (the small model, four threads, one
  // unit) — the same TYPE, two instances, told apart by the pool the scheduler says each task ran
  // on AND by what the worker returned. The HIGH row is the control: the same flow, the same
  // documents, one payload field different, and `review` never dispatched.
  //
  // **Every expected value below is derived from the two documents and from `spec/`, on paper,
  // before the row was run.** `words` is the four words of the payload's `text`; `answer` is the
  // first two of them for `model: "small"` and all four for `"large"`, which is the whole of what
  // `DETAIL` in `examples/workers/prompt.ts` says a bigger model buys; `temperature` is `0` on a
  // `Prompt` node because the TYPE declares `settings: { temperature: 0 }` (decision 12) and `null`
  // on a `GpuModel` node because that class declares none; `report`'s input is the join's record
  // reduced by the declared transform, so its `text` is the three answers joined by a space and its
  // `words` is their total — 8 on the LOW row and 6 on the HIGH one, which is the arity of the
  // region and the two models' detail levels, together, in one number.
  {
    key: 'triage LOW / P18`s sample from two documents — a class type on a NAMED instance, a document type on its DEFAULT',
    definition: TRI, policyId: 'live-token', payload: TRIAGE_LOW, threaded: false,
    regionId: 'split',
    outcome: 'completed',
    // `fetch` first; the three branch entries in declaration order when it settles (`JP-R5`);
    // `review` when `classify` settles down the `isLowConfidence` edge; `report` when the join fires.
    dispatched: [
      'r47:fetch:-:0',
      'r47:summarise:0:0', 'r47:classify:1:0', 'r47:audit:2:0',
      'r47:review:1:0',
      'r47:report:-:0',
    ],
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived', '2': 'arrived' },
    branchEvents: {
      '0': ['branch.opened', 'branch.arrived'],
      // Branch 1 arrives through `review` rather than through `classify` — the decision edge is
      // INSIDE the branch, so the branch is not routed away and its terminal event is unchanged.
      '1': ['branch.opened', 'branch.arrived'],
      '2': ['branch.opened', 'branch.arrived'],
    },
    pathEnds: [{ reason: 'end', at: 'done' }],
    nodeResults: {
      'r47:fetch:-:0': { url: TRIAGE_URL, text: TRIAGE_TEXT, confidence: 0.4 },
      'r47:summarise:0:0': {
        model: 'small', prompt: 'Summarise the text.', temperature: 0,
        text: TRIAGE_TEXT, answer: 'alpha bb', words: 4, confidence: 0.4,
      },
      'r47:classify:1:0': {
        model: 'small', prompt: 'Classify the text; report confidence.', temperature: 0,
        text: TRIAGE_TEXT, answer: 'alpha bb', words: 4, confidence: 0.4,
      },
      // **The NAMED instance.** `prompt-big` is `GpuModel` with `config: { model: "large" }`, so the
      // CLASS derivation gave it the large model — and the large model keeps every word. Its
      // `temperature` is `null` because `GpuModel` declares no `settings` defaults where the
      // document-declared `Prompt` declares `{ temperature: 0 }`.
      'r47:review:1:0': {
        model: 'large', prompt: 'Classify carefully.', temperature: null,
        text: TRIAGE_TEXT, answer: TRIAGE_TEXT, words: 4, confidence: 0.4,
      },
      // **The DEFAULT instance of the same type**, whose config is the class's own `config` member —
      // `{ model: "small" }` — so two words where `review` gets four. Same worker, same type, same
      // settings shape; the instance is the whole of the difference.
      'r47:audit:2:0': {
        model: 'small', prompt: 'Audit the text.', temperature: null,
        text: TRIAGE_TEXT, answer: 'alpha bb', words: 4, confidence: 0.4,
      },
      // **`FD-C6` over `JP-R12`'s record, with no reshaping node**: the transform builds
      // `{ "text": $join([*.answer], " ") }` from the three branches' answers in ascending branch
      // order — `'alpha bb'`, the large model's four words, `'alpha bb'` — so eight words reach the
      // worker and the small model answers with the first two. `confidence` is 0 because the
      // transform's result carries none, which is what a total `confidenceOf` reports.
      'r47:report:-:0': {
        model: 'small', prompt: 'Write the report.', temperature: 0,
        text: `alpha bb ${TRIAGE_TEXT} alpha bb`, answer: 'alpha bb', words: 8, confidence: 0,
      },
    },
    // **Which POOL each task ran on, off the scheduler** — the pair, and swapping these two entries
    // is red. `node.pool ?? node.type` (v0.19): `review` names `prompt-big` and `audit` names none.
    poolOfTask: {
      'r47:fetch:-:0': 'Fetch',
      'r47:summarise:0:0': 'Prompt',
      'r47:classify:1:0': 'Prompt',
      'r47:review:1:0': 'prompt-big',
      'r47:audit:2:0': 'GpuModel',
      'r47:report:-:0': 'Prompt',
    },
    // **A BUILT-IN group and a CUSTOM one, acquired by real tasks.** The `Prompt` type declares
    // `groups: ["vendor", "budget"]` in the document — a `RateLimitGroup` the library builds and a
    // `DailyBudgetGroup` the shim registers as a group TYPE — and the CLASS derivation returns
    // `groups: ["vendor"]`, so a `GpuModel` task holds one where a `Prompt` task holds two.
    //
    // **Declared for EVERY task that acquires anything, and the count is one per group per
    // ADMISSION.** A group is acquired once per admission and not once per task (Q262, W59's
    // adequacy reader), so a task re-admitted because its pool had no free worker holds its groups
    // TWICE — which `typed.flow.json`'s `high` shows at `['scorer', 'scorer']`. Nothing here is
    // re-admitted: `Prompt` is an INLINE pool, so `summarise` and `classify` run on the event loop
    // with no worker to wait for, and the two `GpuModel` pools are threaded at four threads and one
    // for one task each. *(The first draft of this comment said the map was "declared only for the
    // three tasks whose pools cannot re-admit" and then declared five — the two it argued to leave
    // out were the inline pair, which cannot re-admit either. W67's conformity reader, finding 4:
    // the literal was right and the sentence beside it was not, and only a run says which.)*
    heldGroups: {
      'r47:summarise:0:0': ['vendor', 'budget'],
      'r47:classify:1:0': ['vendor', 'budget'],
      'r47:audit:2:0': ['vendor'],
      'r47:review:1:0': ['vendor'],
      'r47:report:-:0': ['vendor', 'budget'],
    },
    why: 'W67 — P18`s exit artifact: a flow and the runtime it needs from two JSON documents, on a ' +
      'real FyflowScheduler. A document type (`Prompt`, `Fetch`) and a class type (`GpuModel`) over ' +
      'ONE worker; a node on its type`s DEFAULT instance (`audit`) and one on a NAMED instance of ' +
      'the same type (`review` on `prompt-big`), told apart by the pool the scheduler says each ran ' +
      'on and by what the worker returned; a built-in group and a custom one acquired; the type`s ' +
      '`settings` default reaching a Prompt node and not a GpuModel one; and a declared transform ' +
      'reducing the join`s record with no reshaping node',
  },
  {
    key: 'triage HIGH / the control — one payload field different, and the NAMED instance is never dispatched',
    definition: TRI, policyId: 'live-token', payload: TRIAGE_HIGH, threaded: false,
    regionId: 'split',
    outcome: 'completed',
    dispatched: [
      'r48:fetch:-:0',
      'r48:summarise:0:0', 'r48:classify:1:0', 'r48:audit:2:0',
      'r48:report:-:0',
    ],
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived', '2': 'arrived' },
    branchEvents: {
      '0': ['branch.opened', 'branch.arrived'],
      '1': ['branch.opened', 'branch.arrived'],
      '2': ['branch.opened', 'branch.arrived'],
    },
    pathEnds: [{ reason: 'end', at: 'done' }],
    nodeResults: {
      'r48:fetch:-:0': { url: TRIAGE_URL, text: TRIAGE_TEXT, confidence: 0.9 },
      'r48:summarise:0:0': {
        model: 'small', prompt: 'Summarise the text.', temperature: 0,
        text: TRIAGE_TEXT, answer: 'alpha bb', words: 4, confidence: 0.9,
      },
      // The same node, the same settings, the same model — and `isLowConfidence` is FALSE at 0.9, so
      // branch 1 arrives from here instead of from `review`.
      'r48:classify:1:0': {
        model: 'small', prompt: 'Classify the text; report confidence.', temperature: 0,
        text: TRIAGE_TEXT, answer: 'alpha bb', words: 4, confidence: 0.9,
      },
      'r48:audit:2:0': {
        model: 'small', prompt: 'Audit the text.', temperature: null,
        text: TRIAGE_TEXT, answer: 'alpha bb', words: 4, confidence: 0.9,
      },
      // Three small-model answers of two words each — SIX where the LOW row's is eight, and the
      // difference is exactly the large model's two extra words. The number is what makes the pair
      // a claim about the instance rather than about which nodes ran.
      'r48:report:-:0': {
        model: 'small', prompt: 'Write the report.', temperature: 0,
        text: 'alpha bb alpha bb alpha bb', answer: 'alpha bb', words: 6, confidence: 0,
      },
    },
    poolOfTask: {
      // The entry node too, so the PAIR makes the same claim on both halves — the control declared
      // one id fewer than the row it controls (W67's conformity reader, finding 10).
      'r48:fetch:-:0': 'Fetch',
      'r48:summarise:0:0': 'Prompt',
      'r48:classify:1:0': 'Prompt',
      'r48:audit:2:0': 'GpuModel',
      'r48:report:-:0': 'Prompt',
    },
    heldGroups: {
      'r48:summarise:0:0': ['vendor', 'budget'],
      'r48:classify:1:0': ['vendor', 'budget'],
      'r48:audit:2:0': ['vendor'],
      'r48:report:-:0': ['vendor', 'budget'],
    },
    why: 'W67 — the control for the row above. Same flow, same registry document, same predicates, ' +
      'same workers; only the entry payload`s `confidence` differs, so `isLowConfidence` is false, ' +
      '`review` is never dispatched, the NAMED pool instance runs nothing, and the reduced report is ' +
      'six words instead of eight. Whatever makes a discriminating pair differ is itself a claim',
  },
  {
    key: 'nonconforming — eleven words',
    definition: NC, policyId: 'live-token', payload: ELEVEN_WORDS, threaded: false,
    checkResults: true,
    outcome: 'completed',
    dispatched: ['r49:gauge:-:0', 'r49:stamp:-:0', 'r49:attest:-:0', 'r49:publish:-:0'],
    pathEnds: [{ reason: 'end', at: 'done' }],
    // **Derived from the two schemas and the payload before anything ran**: eleven words over a
    // ten-word budget is 1.1 against `maximum: 1`, and `stamp`'s `label` is a non-enumerable own
    // property, which `required` reads with `hasOwnProperty` and `structuredClone` does not copy.
    nonconforming: {
      'r49:gauge:-:0': '$.load above maximum 1',
      'r49:stamp:-:0': '$.label required',
    },
    // **The FIRST of three observers, and it is the scheduler's own.** Read off the live
    // `detail.result` at the harness's listener, before `OR-R2` has cloned anything — so `label` is
    // here and, below, absent from what the record carries. Declared on `stamp` alone because it is
    // the only node whose returned value and recorded value differ. **`gauge` is NOT a control for
    // this observer, and the first version of this comment called it one** — nothing compares gauge's
    // live own keys to its record's, so the word named an assertion that does not exist (W82's
    // conformity reader, finding 14). What IS a control here is the cross-row clause below, which
    // requires an entry for EVERY settled object result on every row.
    settledOwnKeys: { 'r49:stamp:-:0': ['label', 'words'] },
    // **The SECOND observer — what the run CARRIES — and the THIRD is `attest` reading it.**
    // `gauge` is recorded with the value its schema refuses, unaltered; `stamp` is recorded without
    // the key; and `attest`'s `keys` is the key set its successor RECEIVED, which is `['words']`.
    // *That is ADR 0060's declared cost — a value that fails its schema still flows downstream —
    // as an assertion rather than as a sentence.*
    nodeResults: {
      'r49:gauge:-:0': { words: 11, load: 1.1 },
      'r49:stamp:-:0': { words: 11 },
      'r49:attest:-:0': { keys: ['words'], sawVerdict: false, verdict: null },
      'r49:publish:-:0': { published: true, joinPayload: { keys: ['words'], sawVerdict: false, verdict: null } },
    },
    regionId: null,
    why: 'W82 — P21`s EXIT ARTIFACT. Two workers return values their own outputSchema refuses and the run ' +
      'reports each BY NAME, on real workers, in both runtimes — and reports NOTHING about the two ' +
      'conforming nodes beside them. The two are the two legs of W80`s prediction 3: a bound the producer`s ' +
      'own code does not keep past its declared domain (Q302 reconstructed), and a value that conforms as ' +
      'run() returned it and does not survive OR-R2`s clone. Both workers are GREEN at check:workers and ' +
      'every arc of this flow is `fits` at checkWiring, because one runs a worker on ONE example and the ' +
      'other reads two SCHEMAS — so this is the reach ADR 0060 consequence 8 names, with an observer',
  },
  {
    key: 'nonconforming — two words (the control)',
    definition: NC, policyId: 'live-token', payload: TWO_WORDS, threaded: false,
    checkResults: true,
    outcome: 'completed',
    dispatched: ['r50:gauge:-:0', 'r50:stamp:-:0', 'r50:attest:-:0', 'r50:publish:-:0'],
    pathEnds: [{ reason: 'end', at: 'done' }],
    // **ONE finding, not two, and the missing one is the claim.** Two words is `0.2`, inside the
    // declared bound — so `gauge` is silent here and reported on the row above, from the same code
    // and the same schema. A worker that simply always failed would be reported on both.
    nonconforming: { 'r50:stamp:-:0': '$.label required' },
    settledOwnKeys: { 'r50:stamp:-:0': ['label', 'words'] },
    nodeResults: {
      'r50:gauge:-:0': { words: 2, load: 0.2 },
      'r50:stamp:-:0': { words: 2 },
      'r50:attest:-:0': { keys: ['words'], sawVerdict: false, verdict: null },
      'r50:publish:-:0': { published: true, joinPayload: { keys: ['words'], sawVerdict: false, verdict: null } },
    },
    regionId: null,
    why: 'W82 — the control for the row above, and the one that makes gauge`s finding a function of the DATA ' +
      'rather than of the node. Same flow, same registry, same two workers; only the payload`s WORD COUNT ' +
      'differs, and gauge is reported on eleven words and silent on two. stamp is reported on both, because ' +
      'its defect is in the clone rather than in the arithmetic — so the pair also separates the two legs ' +
      'from each other. Whatever makes a discriminating pair differ is itself a claim',
  },
  {
    /**
     * **W86 — P22's EXIT ARTIFACT, and the first run anywhere in this repository in which one
     * region OPENER has two INSTANCES.**
     *
     * `'ja eee'` is two words, so `perWord` opens two branches and `shard` runs twice; `shard`
     * returns one shard per CHARACTER, so `perShard@0` is two branches wide and `perShard@1` is
     * three. **Every number here is a property of the text and of `shardConfidence`, and none of
     * them is in the flow document** — which is what a `map` buys and a `fanout` cannot
     * (`FD-V9` requires branch entries to be written down).
     *
     * | shard | confidence | `grade`'s score | road |
     * |---|---|---|---|
     * | `0.0` = `j` | 1.0 | 100 | straight to `gather` |
     * | `0.1` = `a` | 0.1 | 10 | `isLowScore` → `recheck`, then `gather` |
     * | `1.0`–`1.2` = `e` | 0.5 | 50 | straight to `gather` — fifty is not *below* fifty |
     *
     * **So the run's shape is the arrangement**: `shard@0` settles first (`msPerChar` times two
     * characters against three), which opens `perShard@0` first and starts its window at `0.0`'s
     * arrival; `perShard@1` then opens, runs three fast branches and **fires its join while
     * instance 0 is still holding**; and `perShard@0`'s join comes last, behind `recheck`'s
     * second pass. *The non-first instance closes first, and instance 0 is also `values()[0]`*
     * ([Q353](../doc/questions/q353.md)) — which is the whole reason the order is a claim here and
     * not a detail.
     *
     * **`joinPayload` is `JP-R12` at TWO LEVELS on real workers**: the outer collection's `0` and
     * `1` are themselves the two inner collections, keyed by their own branch paths, and the two key
     * sets are DISJOINT — ADR 0062 consequence 5 turned from an argument into a value.
     */
    key: 'fan-out-per-item / P22 — a map whose branch opens a MAP, two instances of one opener, overlapping',
    definition: FOPI, policyId: 'live-token', payload: TWO_THEN_THREE, threaded: false,
    outcome: 'completed',
    dispatched: ['r51:ingest:-:0', 'r51:shard:0:0', 'r51:shard:1:0',
      'r51:grade:0.0:0', 'r51:grade:0.1:0', 'r51:recheck:0.1:0',
      'r51:grade:1.0:0', 'r51:grade:1.1:0', 'r51:grade:1.2:0', 'r51:publish:-:0'],
    // **`recheck` is dispatched by a COMPLETION — W97.** It goes out when `grade:0.1` SETTLES, and the three `grade:1.x`
    // when `shard:1` does: two branches, and the arrangement above fixes only that `shard@0` settles first. With
    // `ScoreWorker` threaded, or delayed to 300 ms (`doc/workflow.md` rule 8 obligation (f)), `grade:0.1` lands after
    // `shard:1` and this row's ordered list went red in both runtimes while every clause that NAMES the arrangement stayed
    // green. So `recheck` ALONE leaves the ordered list — W97's adequacy reader measured the three `grade:1.x` loosened for
    // nothing — and the other nine keep their order. **The overlap asserted beside it cannot fail on this row**: `shard:0`
    // and `shard:1` always overlap, so W51's justification says nothing about `recheck` in particular ([Q400](../doc/questions/q400.md)).
    regionId: 'perWord',
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived' },
    // **The two instances, each with its own answer** — and `otherRegions` could not carry this,
    // because it is keyed by the opener and there is no sole instance to read.
    regionInstances: {
      perShard: {
        '0': { joined: true, settled: { '0.0': 'arrived', '0.1': 'arrived' } },
        '1': { joined: true, settled: { '1.0': 'arrived', '1.1': 'arrived', '1.2': 'arrived' } },
      },
    },
    branchEvents: {
      '0': ['branch.opened', 'branch.arrived'],
      '1': ['branch.opened', 'branch.arrived'],
      '0.0': ['branch.opened', 'branch.arrived'],
      '0.1': ['branch.opened', 'branch.arrived'],
      '1.0': ['branch.opened', 'branch.arrived'],
      '1.1': ['branch.opened', 'branch.arrived'],
      '1.2': ['branch.opened', 'branch.arrived'],
    },
    // **ADR 0062 rule 3 reaching a consumer.** The outer region's two branches are named
    // `perWord@-`; every inner branch is named by the INSTANCE it belongs to, and `0.0` and `1.0`
    // differ in exactly the field W84 added.
    regionEventKeys: {
      '0': 'perWord@-', '1': 'perWord@-',
      '0.0': 'perShard@0', '0.1': 'perShard@0',
      '1.0': 'perShard@1', '1.1': 'perShard@1', '1.2': 'perShard@1',
    },
    pathEnds: [{ reason: 'end', at: 'done' }],
    nodeResults: {
      'r51:ingest:-:0': { confidence: 0.9, items: [{ word: 'ja', confidence: 0.2 }, { word: 'eee', confidence: 0.3 }] },
      'r51:shard:0:0': { word: 'ja', shards: [{ shard: 'j', confidence: 1 }, { shard: 'a', confidence: 0.1 }] },
      'r51:shard:1:0': { word: 'eee', shards: [{ shard: 'e', confidence: 0.5 }, { shard: 'e', confidence: 0.5 }, { shard: 'e', confidence: 0.5 }] },
      'r51:grade:0.0:0': { confidence: 1, score: 100 },
      'r51:grade:0.1:0': { confidence: 0.1, score: 10 },
      // The second pass returns the same answer — it is a SLOWER road and not a different verdict,
      // which is what keeps the arrangement a property of the ROUTE rather than of the arithmetic.
      'r51:recheck:0.1:0': { confidence: 0.1, score: 10 },
      'r51:grade:1.0:0': { confidence: 0.5, score: 50 },
      'r51:grade:1.1:0': { confidence: 0.5, score: 50 },
      'r51:grade:1.2:0': { confidence: 0.5, score: 50 },
      'r51:publish:-:0': {
        published: true,
        joinPayload: {
          '0': { '0.0': { confidence: 1, score: 100 }, '0.1': { confidence: 0.1, score: 10 } },
          '1': {
            '1.0': { confidence: 0.5, score: 50 },
            '1.1': { confidence: 0.5, score: 50 },
            '1.2': { confidence: 0.5, score: 50 },
          },
        },
      },
    },
    why: 'W86 — P22`s EXIT ARTIFACT on real workers: score each item, then fan out per item. A `map` ' +
      'whose branch opens a second `map`, which W33 refused at Driver construction and ADR 0062 lifted ' +
      'whole. `perShard` is ONE opener with TWO instances, `perShard@0` two branches wide and ' +
      '`perShard@1` three, and both arities come from data no document carries. The two instances ' +
      'OVERLAP — instance 1`s join fires while instance 0 is still holding — and instance 1 closes ' +
      'FIRST, which is what makes the key discriminating rather than merely present, because ' +
      'instance 0 is also values()[0]. JP-R12 at two levels, with the two collections disjoint',
  },
  {
    /**
     * **The control, and what it changes is the PAYLOAD** — one word instead of two, so `perWord`
     * opens one branch, `shard` runs once and `perShard` has exactly ONE instance.
     *
     * It is the tree on which the overlap derivation must report that nothing overlapped
     * (`doc/workflow.md` v0.22: *a control is one only if you can NAME THE TREE on which it fails
     * and its claim passes*). The same flow, the same workers, the same `recheck` road for shard
     * `a` — and the two numbers the block above asserts both move.
     *
     * **It is also the regression half of ADR 0062 rule 3**: with one instance the opener's entry is
     * still keyed by a path (`'0'`, because `perShard` sits inside `perWord`'s branch 0), so the
     * two-level carrier is exercised at N = 1 and not only where it was needed.
     */
    key: 'fan-out-per-item / ONE item (the control) — one instance, so no two of them ever hold at once',
    definition: FOPI, policyId: 'live-token', payload: ONE_THEN_TWO, threaded: false,
    outcome: 'completed',
    dispatched: ['r52:ingest:-:0', 'r52:shard:0:0',
      'r52:grade:0.0:0', 'r52:grade:0.1:0', 'r52:recheck:0.1:0', 'r52:publish:-:0'],
    regionId: 'perWord',
    joined: true,
    settled: { '0': 'arrived' },
    regionInstances: {
      perShard: { '0': { joined: true, settled: { '0.0': 'arrived', '0.1': 'arrived' } } },
    },
    branchEvents: {
      '0': ['branch.opened', 'branch.arrived'],
      '0.0': ['branch.opened', 'branch.arrived'],
      '0.1': ['branch.opened', 'branch.arrived'],
    },
    regionEventKeys: { '0': 'perWord@-', '0.0': 'perShard@0', '0.1': 'perShard@0' },
    pathEnds: [{ reason: 'end', at: 'done' }],
    nodeResults: {
      'r52:ingest:-:0': { confidence: 0.9, items: [{ word: 'ja', confidence: 0.2 }] },
      'r52:shard:0:0': { word: 'ja', shards: [{ shard: 'j', confidence: 1 }, { shard: 'a', confidence: 0.1 }] },
      'r52:grade:0.0:0': { confidence: 1, score: 100 },
      'r52:grade:0.1:0': { confidence: 0.1, score: 10 },
      'r52:recheck:0.1:0': { confidence: 0.1, score: 10 },
      'r52:publish:-:0': {
        published: true,
        joinPayload: { '0': { '0.0': { confidence: 1, score: 100 }, '0.1': { confidence: 0.1, score: 10 } } },
      },
    },
    why: 'W86 — the control for the row above, and the only thing that differs is the payload`s word ' +
      'count. One item means ONE instance of `perShard`, so the overlap derivation must report that ' +
      'no two instances of one opener ever held at once — which is what makes the row above`s two ' +
      'and its closing order claims rather than constants. It also runs the two-level carrier at ' +
      'N = 1, where the instance`s key is `0` and not `-`',
  },
  {
    /**
     * **P24's EXIT ARTIFACT, and the row whose ARRANGEMENT makes both wrong selections differ from the right one** —
     * [W94](../doc/work-items/w94-a-tv-series-ingest-through-a-gate-on-real-workers.md).
     *
     * Seven files, the LAST-first sizes: `identify` finishes the smallest file first, so `Fargo` (one file), then the
     * last `Dark` and the last `Lost` reach the gate before anything else of their series — and the FIRST file
     * dispatched to `identify` is the LAST to arrive. **The gate clause asserts that from the run's own sequence** and
     * never names a file: exactly one `first` per series, the `first` branch the first of its series to arrive, the
     * per-series task run for exactly those branches, and that arrival NOT the lowest index of `dark` or `lost`.
     *
     * `pathEnds` is the ORDER in which the roads ended and it names no file: three `seriesReady` (each opened series,
     * in arrival order), the unidentified trailer, the three duplicates, then `done`.
     */
    key: 'tv-ingest / arranged LAST-first — the last file of each series reaches the gate first, so the first to ARRIVE is neither the lowest index nor the first dispatched',
    definition: TV, policyId: 'live-token', payload: TV_LAST_FIRST, threaded: false,
    outcome: 'completed',
    dispatched: tvDispatched('r53'),
    regionId: 'episodes',
    joined: true,
    settled: TV_MAP_SETTLED,
    regionInstances: TV_INSTANCES,
    branchEvents: tvBranchEvents(true),
    pathEnds: [
      { reason: 'end', at: 'seriesReady' }, { reason: 'end', at: 'seriesReady' }, { reason: 'end', at: 'seriesReady' },
      { reason: 'end', at: 'dropUnidentified' },
      { reason: 'end', at: 'dropDuplicate' }, { reason: 'end', at: 'dropDuplicate' }, { reason: 'end', at: 'dropDuplicate' },
      { reason: 'end', at: 'done' },
    ],
    nodeResults: tvResults('r53', TV_LAST_FIRST.files, 'all'),
    gate: { ...TV_GATE, realm: 'harness', arranged: 'last-first' },
    why: 'W94 — P24`s EXIT ARTIFACT on real workers: a TV library`s files through a `map`, each fetched and fanned out ' +
      'BESIDE into a thumbnail and a `distinct` GATE keyed on `series.id`. Exactly ONE file per series opens the ' +
      'per-series work and every other file ends at an `end`; thumbnails run for all seven; both joins fire and the run ' +
      'completes. The sizes are ARRANGED so the last file of each series arrives first, which makes first-to-arrive ' +
      'differ from the lowest index and from the first dispatched — asserted from the run`s own sequence, never a file name',
  },
  {
    /**
     * **The pair: the same seven files, the sizes in the OPPOSITE order** — so the order the gate sees IS the index
     * order, the default position [Q379](../doc/questions/q379.md) warns about, taken deliberately as the other half.
     * A DIFFERENT file opens `dark` and `lost` than in the row above and the count per series is the same, which the
     * cross-row block asserts: *exactly one per series whatever order the files arrive in* (P24's exit sentence).
     */
    key: 'tv-ingest / arranged FIRST-first (the pair) — the same files in index order, so a DIFFERENT file opens each series and the count is the same',
    definition: TV, policyId: 'live-token', payload: TV_FIRST_FIRST, threaded: false,
    outcome: 'completed',
    dispatched: tvDispatched('r54'),
    regionId: 'episodes',
    joined: true,
    settled: TV_MAP_SETTLED,
    regionInstances: TV_INSTANCES,
    branchEvents: tvBranchEvents(false),
    pathEnds: [
      { reason: 'end', at: 'seriesReady' }, { reason: 'end', at: 'seriesReady' },
      { reason: 'end', at: 'dropDuplicate' }, { reason: 'end', at: 'dropUnidentified' },
      { reason: 'end', at: 'dropDuplicate' }, { reason: 'end', at: 'dropDuplicate' },
      { reason: 'end', at: 'seriesReady' },
      { reason: 'end', at: 'done' },
    ],
    nodeResults: tvResults('r54', TV_FIRST_FIRST.files, 'identify'),
    gate: { ...TV_GATE, realm: 'harness', arranged: 'first-first' },
    why: 'W94 — the pair for the row above: the same files with the sizes reversed, so the gate sees them in index ' +
      'order. A different file opens each multi-file series and exactly one still does, which is the whole of P24 ' +
      'decision 7 on real workers',
  },
  {
    /**
     * **Threaded, at EQUAL work, and no winner asserted** — the POOL decides the order. W94's declaration measured it:
     * four winner sets over ten runs in node and two in deno, where Deno's threaded order is close to the index order
     * (28 of 30 keys), so this row cannot discriminate the two selections and does not claim to. What it claims is the
     * one thing that must hold whatever the pool does: one `first` per series, the per-series task for exactly those
     * branches, what reached the gate handed on, and a thumbnail for every file. `pathEnds` is undeclared because its
     * ORDER is the pool's.
     */
    key: 'tv-ingest / threaded, equal work — the pool decides the order and exactly one file per series still opens it',
    definition: TV, policyId: 'live-token', payload: TV_EQUAL, threaded: true,
    outcome: 'completed',
    dispatched: tvDispatched('r55'),
    regionId: 'episodes',
    joined: true,
    settled: TV_MAP_SETTLED,
    regionInstances: TV_INSTANCES,
    branchEvents: tvBranchEvents(false),
    nodeResults: tvResults('r55', TV_EQUAL.files, 'publish'),
    gate: { ...TV_GATE, realm: 'thread' },
    why: 'W94 — the same flow with `identify` on THREADS at equal work: whatever order the pool delivers, exactly one ' +
      'file per series opens it and every file gets its thumbnail. No winner and no order is asserted',
  },

  // ---------------------------------------------------------------------------------------------
  // **W110 — P26's EXIT ARTIFACT. Six rows over TWO documents, and the second document exists so
  // that the first one's claim can be falsified.**
  //
  // The four `ui-emitted` rows reach every road the flow has and every member of both groups is
  // load-bearing on a payload no other row covers:
  //
  //   | | payload | rollup | which member decides |
  //   |---|---|---|---|
  //   | A | 0.9 / "alpha beta" | n 2, mean 45, weak TRUE  | `all`'s FIRST  -> remediate -> done |
  //   | B | 0.2 / "alpha beta" | n 2, mean 45, weak FALSE | `any`'s SECOND -> publish |
  //   | C | 0.9 / "alpha"      | n 1, mean 50, weak TRUE  | **`all`'s SECOND** -> publish — the first member alone would have sent it to `remediate` |
  //   | D | 0.9 / "a b"        | n 2, mean 10, weak TRUE  | remediate's own `lt 20` -> escalated |
  //
  // **A and B differ in ONE payload field**, and the decision between them depends on BOTH the
  // join's mean and the run's own confidence — the two-path comparison the subset cannot say,
  // computed by the tier-three node. **C is what makes the `all` group's second member a claim**
  // rather than decoration: at one item it is the only thing standing between `weak: true` and the
  // `remediate` road. Nothing in this tree exercised `all` or `any` before this row
  // ([ADR 0074](../doc/decisions/0074-a-predicate-is-a-registered-name-or-a-declared-comparison-over-the-context.md)
  // consequence 5 says so), so these are the group's first instances on real workers.
  //
  // **`stalled` is never reached on any of the six**, which `pathEnds` says per row. It is a
  // TRIPWIRE and is called one rather than a control: it fires when a group is wrong, and the claim
  // it would make non-vacuous is its own.
  {
    key: 'ui-emitted / P26 — a flow a UI could have emitted: an EMPTY predicate registry, a declared group, and a reshaping step with no code',
    definition: UI, policyId: 'live-token', payload: { confidence: 0.9, text: 'alpha beta' }, threaded: false,
    uiRegistry: true, predicates: NO_PREDICATES,
    outcome: 'completed',
    regionId: 'each',
    // `intake` settles; the map opens two instances in index order (`JP-R5`); `gather` fires and
    // `rollup` goes; its `all` group matches and `remediate` goes.
    dispatched: ['r56:intake:-:0', 'r56:rate:0:0', 'r56:rate:1:0', 'r56:rollup:-:0', 'r56:remediate:-:0'],
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived' },
    branchEvents: { '0': ['branch.opened', 'branch.arrived'], '1': ['branch.opened', 'branch.arrived'] },
    pathEnds: [{ reason: 'end', at: 'done' }],
    nodeResults: {
      'r56:intake:-:0': { confidence: 0.9, items: uiItems('alpha beta') },
      'r56:rate:0:0': { confidence: 0.5, score: 50 },
      'r56:rate:1:0': { confidence: 0.4, score: 40 },
      'r56:rollup:-:0': uiRollup(0.9, 'alpha beta'),
      'r56:remediate:-:0': uiRemediated(45),
    },
    // **The built-in's own pool ran it** — `node.pool ?? node.type`, read off `scheduler.tasks`, so
    // this is the one observer that says the `Transform` type's pool is what the task went to and
    // not some pool a document declared. No L6 row has ever named a built-in node type.
    poolOfTask: { 'r56:rollup:-:0': 'Transform', 'r56:remediate:-:0': 'WeighWorker' },
    why: 'W110 — P26`s exit artifact. One flow, no predicate function, no reshaping worker, no gate type: ' +
      '`needs` selects (tier 1), a Transform node computes the two-path comparison a comparison cannot say ' +
      '(tier 3), a declared `all` group routes on its result, and `remediate``s own transform reshapes that ' +
      'result into what WeighWorker reads (tier 2). `RunOptions.predicates` is EMPTY and the cross-row block ' +
      'asserts it was',
  },
  {
    key: 'ui-emitted / the SAME document at a lower confidence — `weak` is FALSE, so the `any` group`s second member routes it to publish',
    definition: UI, policyId: 'live-token', payload: { confidence: 0.2, text: 'alpha beta' }, threaded: false,
    uiRegistry: true, predicates: NO_PREDICATES,
    outcome: 'completed',
    regionId: 'each',
    dispatched: ['r57:intake:-:0', 'r57:rate:0:0', 'r57:rate:1:0', 'r57:rollup:-:0', 'r57:publish:-:0'],
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived' },
    branchEvents: { '0': ['branch.opened', 'branch.arrived'], '1': ['branch.opened', 'branch.arrived'] },
    pathEnds: [{ reason: 'end', at: 'done' }],
    nodeResults: {
      'r57:intake:-:0': { confidence: 0.2, items: uiItems('alpha beta') },
      'r57:rate:0:0': { confidence: 0.5, score: 50 },
      'r57:rate:1:0': { confidence: 0.4, score: 40 },
      'r57:rollup:-:0': uiRollup(0.2, 'alpha beta'),
      // **The transform`s output, echoed whole by a worker on the OTHER road** — a second observer
      // of the same value, which is what keeps output (3) from resting on `remediate` alone.
      'r57:publish:-:0': { published: true, joinPayload: uiRollup(0.2, 'alpha beta') },
    },
    why: 'W110 — A`s pair, and the ONE field that differs is the payload`s confidence. The scores are identical ' +
      '(a word`s confidence is its length), the mean is identical, and `weak` flips — so the decision is a ' +
      'function of BOTH the join`s mean and the run`s own value, which is what no comparison can express',
  },
  {
    key: 'ui-emitted / ONE item — `weak` is still TRUE and the `all` group`s SECOND member is what routes it to publish',
    definition: UI, policyId: 'live-token', payload: { confidence: 0.9, text: 'alpha' }, threaded: false,
    uiRegistry: true, predicates: NO_PREDICATES,
    outcome: 'completed',
    regionId: 'each',
    dispatched: ['r58:intake:-:0', 'r58:rate:0:0', 'r58:rollup:-:0', 'r58:publish:-:0'],
    joined: true,
    settled: { '0': 'arrived' },
    branchEvents: { '0': ['branch.opened', 'branch.arrived'] },
    pathEnds: [{ reason: 'end', at: 'done' }],
    nodeResults: {
      'r58:intake:-:0': { confidence: 0.9, items: uiItems('alpha') },
      'r58:rate:0:0': { confidence: 0.5, score: 50 },
      'r58:rollup:-:0': uiRollup(0.9, 'alpha'),
      'r58:publish:-:0': { published: true, joinPayload: uiRollup(0.9, 'alpha') },
    },
    why: 'W110 — the row that makes the `all` group`s second member a CLAIM. `weak` is TRUE here, so the first ' +
      'member alone would route to `remediate`; `n gte 2` is false at one item and the `any` group`s FIRST ' +
      'member then routes it to publish. Both groups decide a different row, in both directions',
  },
  {
    key: 'ui-emitted / low scores — remediate`s OWN declared decision routes it to a second `end`, on the value its transform produced',
    definition: UI, policyId: 'live-token', payload: { confidence: 0.9, text: 'a b' }, threaded: false,
    uiRegistry: true, predicates: NO_PREDICATES,
    outcome: 'completed',
    regionId: 'each',
    dispatched: ['r59:intake:-:0', 'r59:rate:0:0', 'r59:rate:1:0', 'r59:rollup:-:0', 'r59:remediate:-:0'],
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived' },
    branchEvents: { '0': ['branch.opened', 'branch.arrived'], '1': ['branch.opened', 'branch.arrived'] },
    // **The one row that ends anywhere but `done`** — and the value it turns on is the one
    // `remediate`'s own tier-two transform computed, so a wrong transform moves this `at`.
    pathEnds: [{ reason: 'end', at: 'escalated' }],
    nodeResults: {
      'r59:intake:-:0': { confidence: 0.9, items: uiItems('a b') },
      'r59:rate:0:0': { confidence: 0.1, score: 10 },
      'r59:rate:1:0': { confidence: 0.1, score: 10 },
      'r59:rollup:-:0': uiRollup(0.9, 'a b'),
      'r59:remediate:-:0': uiRemediated(10),
    },
    why: 'W110 — two one-letter words, so the mean is 10 and `remediate``s own `score lt 20` fires. It is the ' +
      'second declared decision in the flow and the only row that reaches `escalated`, and what it reads is a ' +
      'field WeighWorker computed from the transform`s output',
  },
  {
    key: 'ui-emitted-named / the SAME flow with the group replaced by a REGISTERED NAME — one predicate registered, and the routing is identical to A',
    definition: UIN, policyId: 'live-token', payload: { confidence: 0.9, text: 'alpha beta' }, threaded: false,
    uiRegistry: true, predicates: UI_NAMED_PREDICATES,
    outcome: 'completed',
    regionId: 'each',
    dispatched: ['r60:intake:-:0', 'r60:rate:0:0', 'r60:rate:1:0', 'r60:rollup:-:0', 'r60:remediate:-:0'],
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived' },
    branchEvents: { '0': ['branch.opened', 'branch.arrived'], '1': ['branch.opened', 'branch.arrived'] },
    pathEnds: [{ reason: 'end', at: 'done' }],
    nodeResults: {
      'r60:intake:-:0': { confidence: 0.9, items: uiItems('alpha beta') },
      'r60:rate:0:0': { confidence: 0.5, score: 50 },
      'r60:rate:1:0': { confidence: 0.4, score: 40 },
      'r60:rollup:-:0': uiRollup(0.9, 'alpha beta'),
      'r60:remediate:-:0': uiRemediated(45),
    },
    why: 'W110 — output (2): this document carries BOTH roads, one `when` a registered name and one a declared ' +
      '`any` group. It is A`s document with exactly one edge changed, and it routes identically — which is ' +
      'P26 prediction 3`s answer as a measurement rather than a sentence',
  },
  {
    key: 'ui-emitted-named / the name road at the lower confidence — the registered function answers FALSE where the group did',
    definition: UIN, policyId: 'live-token', payload: { confidence: 0.2, text: 'alpha beta' }, threaded: false,
    uiRegistry: true, predicates: UI_NAMED_PREDICATES,
    outcome: 'completed',
    regionId: 'each',
    dispatched: ['r61:intake:-:0', 'r61:rate:0:0', 'r61:rate:1:0', 'r61:rollup:-:0', 'r61:publish:-:0'],
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived' },
    branchEvents: { '0': ['branch.opened', 'branch.arrived'], '1': ['branch.opened', 'branch.arrived'] },
    pathEnds: [{ reason: 'end', at: 'done' }],
    nodeResults: {
      'r61:intake:-:0': { confidence: 0.2, items: uiItems('alpha beta') },
      'r61:rate:0:0': { confidence: 0.5, score: 50 },
      'r61:rate:1:0': { confidence: 0.4, score: 40 },
      'r61:rollup:-:0': uiRollup(0.2, 'alpha beta'),
      'r61:publish:-:0': { published: true, joinPayload: uiRollup(0.2, 'alpha beta') },
    },
    why: 'W110 — the pair`s other half on the name road, so the agreement is over payloads that route BOTH ways ' +
      'rather than over one. A predicate that returned a constant would be red on one of these two',
  },
  {
    /**
     * **THREADED, and it is the adequacy reader's F9.** The six rows above are all `threaded: false`, so
     * `uiRegistryDocumentFor` writes `inline: true` into the two types whose `inline` the document leaves
     * unsaid — and the `"maxThreads": 2` they declare was reached by no row at all. The reader measured
     * row A flipped to threads GREEN at 2390, so the axis was never taken rather than broken.
     *
     * **What it buys is not a second reading of the same values.** Threaded is the ONLY road on which a
     * pool's config crosses a `structuredClone` into a worker thread, which is the reason ADR 0075 rule 4
     * gives for WRITING the `transformOnly` marker rather than letting an absent `worker` speak — and
     * W109's finding 22 is that its own threaded arm was unobserved for exactly this reason. So this row
     * runs the tier-three node's pool config across that boundary on real threads, and the `map` at
     * run-time arity dispatches two instances into a pool two wide instead of one.
     *
     * **Same payload as row A, same expected values** — the realm is the only thing that differs, which
     * is what makes it a pair rather than a seventh claim. If a threaded pool answered differently, this
     * row is red on the values and not on a realm field nothing reads.
     */
    key: 'ui-emitted / THREADED — the same payload as the first row, with the pool config crossing a clone into a real thread',
    definition: UI, policyId: 'live-token', payload: { confidence: 0.9, text: 'alpha beta' }, threaded: true,
    uiRegistry: true, predicates: NO_PREDICATES,
    outcome: 'completed',
    regionId: 'each',
    dispatched: ['r62:intake:-:0', 'r62:rate:0:0', 'r62:rate:1:0', 'r62:rollup:-:0', 'r62:remediate:-:0'],
    joined: true,
    settled: { '0': 'arrived', '1': 'arrived' },
    branchEvents: { '0': ['branch.opened', 'branch.arrived'], '1': ['branch.opened', 'branch.arrived'] },
    pathEnds: [{ reason: 'end', at: 'done' }],
    nodeResults: {
      'r62:intake:-:0': { confidence: 0.9, items: uiItems('alpha beta') },
      'r62:rate:0:0': { confidence: 0.5, score: 50 },
      'r62:rate:1:0': { confidence: 0.4, score: 40 },
      'r62:rollup:-:0': uiRollup(0.9, 'alpha beta'),
      'r62:remediate:-:0': uiRemediated(45),
    },
    poolOfTask: { 'r62:rollup:-:0': 'Transform', 'r62:remediate:-:0': 'WeighWorker' },
    why: 'W110 — the adequacy reader`s F9: every other artifact row is inline, so the `maxThreads: 2` the UI ' +
      'document declares was reached by nothing and the tier-three node`s pool config never crossed a clone into ' +
      'a thread, which is the one road ADR 0075 rule 4`s marker exists for. Same payload and same values as the ' +
      'first row, so the realm is the only difference',
  },
  {
    /**
     * **`OR-R6` v0.11 — the rule is reachable only from an INLINE pool, and this is the other pool** (W133, Q61).
     *
     * The `uncloneable / OR-R6` row's flow, worker and payload with `threaded: true`, which since W133 reaches
     * `MergeWorker`: the document leaves its `inline` unsaid so the knob can set it. On a thread the worker's
     * `{ fn: () => 1 }` has to cross the worker boundary before any listener sees it, and the scheduler's own
     * structured clone refuses it there. So every expected value below is the spec sentence's and not `OR-R6`'s:
     * the task ends `user_action` with the scheduler's clone error, it has no effective outcome (section 7), NO
     * run failure is reported, and the run is `awaiting_action` (`RN-R7`) and never finishes — the backstop is the
     * expected result, as on `suspend / nobody comes`. `could not be cloned` is the substring both runtimes'
     * messages share: Node prints the function as `() => 1` and Deno as `()=>1`.
     *
     * **Appended LAST and not beside its pair**, because a row's run id is its position: inserting it at row 14
     * would renumber every later row's `dispatched`.
     */
    key: 'uncloneable / OR-R6, threaded — the scheduler`s own clone refuses the value first, the task ends user_action and nothing reaches the listener',
    definition: UC, policyId: 'live-token', payload: HIGH, threaded: true,
    regionId: null,
    outcome: 'awaiting_action',
    dispatched: ['r63:merge:-:0'],
    // A suspended node has no effective outcome (`spec/outcome-record.md` section 7), the same entry `OR-R6`'s
    // row makes for the other reason: there no record is written, here the one record is `user_action`.
    unsettled: ['r63:merge:-:0'],
    outcomesSeen: ['awaiting_action'],
    outcomesNotSeen: ['stopped', 'completed'],
    pathEnds: [],
    taskErrors: { 'r63:merge:-:0': ['could not be cloned'] },
    taskErrorsRule: 'OR-R6 v0.11',
    // ONE record, and it is the `user_action` one with no result: the `task.failed` that precedes `task.user_action`
    // writes nothing (`OR-R3`), and the value never crossed the worker boundary.
    records: { 'r63:merge:-:0': ['outcome:user_action:no result'] },
    expectBackstop: true,
    backstopMs: 400,
    why: 'W133 — OR-R6 v0.11. The same worker bug on the other pool: the scheduler`s structured clone refuses ' +
      'the function at the worker boundary, so the task ends user_action (task.failed then task.user_action) ' +
      'and no result reaches the listener. Nothing is reported through onRunFailure and the run is ' +
      'awaiting_action rather than stopped. Measured on 0.5.2 in node and deno before the sentence was written',
  },
];

// --- assertions ---------------------------------------------------------------

const failures: string[] = [];
let passed = 0;

/**
 * **A `settled` map compared by CONTENT, not by key order — W23's conformity
 * reader, BLOCKING.**
 *
 * `check` compares `JSON.stringify`, and the fold writes `settled[branchPath]` in
 * **terminal-event order**. For a depth-1 row the keys are `'0'`/`'1'` — canonical
 * array indices, which V8 emits in ascending numeric order however they were
 * inserted — so no depth-1 row has ever depended on branch completion order, by
 * accident rather than by design. **`'1.0'`/`'1.1'` are not array indices**, so
 * they stringify in insertion order, and every one of W23's nested rows was
 * therefore asserting a fan-out completion order that `spec/` does not fix and
 * `doc/workflow.md` section 5 rule 5 forbids depending on. Three of the four run
 * `scoreC` and `scoreD` as the SAME role at the SAME delay in the SAME pool —
 * the configuration `Expectation.joinSettledBy`'s own comment calls "genuinely
 * non-deterministic".
 *
 * Sorting both sides is the fix; picking a different declared order would only
 * move the race.
 */
const sortedSettled = (m: Record<string, string> | undefined) =>
  m === undefined ? undefined : Object.fromEntries(Object.entries(m).sort(([x], [y]) => x.localeCompare(y)));

/**
 * **The ONE instance of a region, by its opener's id** - W84.
 *
 * `RunState.regions` is two-level since [ADR 0062](../doc/decisions/0062-a-region-instance-is-its-opener-and-the-openers-own-branch-path.md):
 * `regions[openerId][openerPath]`, because a `map` can enter one opener N times.
 * **Every flow this ladder runs enters each of its openers exactly once** - the key
 * measurement over both corpora says openers inside a map region are 0 of 50 - so
 * every row here names a region that has exactly one instance, and this reads it.
 *
 * **It ASSERTS that rather than assuming it.** With more than one instance there is
 * no sole one, and returning either would make a row's verdict depend on which
 * instance the driver entered first. It returns `undefined` instead, which is
 * `joinStatusOf`'s own rule at the one other place a region is read by its opener
 * alone.
 *
 * **What `undefined` then DID was caller-dependent, and two of the callers below did
 * NOT go red on it** — recorded in this comment by W84 rather
 * than repaired because no flow this ladder ran had two instances (0 of 50 openers
 * sat inside a map region) and the repair belonged with the row that creates one.
 * The `joined` caller read `soleRegion(...)?.joined ?? null`, so `undefined` became
 * `null` and the **eight** `EXPECTED` rows declaring `joined: null` would have passed
 * that clause in silence; `regionsOf` below *filtered the region out of the rendered
 * table* rather than naming it.
 *
 * **[W86](../doc/work-items/w86-score-each-item-then-fan-out-per-item.md) adds the
 * first such flow and BOTH sites are decided here** — the dated-ceiling clause
 * (`doc/workflow.md` v0.17) firing on the item it named. The `joined` clauses compare
 * a PAIR whose first member is `Object.keys(regions[id]).length`, so *exactly one
 * instance* is part of what a row asserts and the `?? null` can absorb nothing; and
 * `regionsOf` walks `regions[id]` whole and prints one line per INSTANCE. **A
 * multi-instance region is now red at all three sites**, and a row that means to have
 * one declares it under `Expectation.regionInstances`, which reads
 * `regions[openerId][openerPath]` directly and never through this helper.
 *
 * *(Not to be confused with `soleRegionOf` further down, which answers a different
 * question — **the one OPENER a row's flow declares**, not the one INSTANCE of an
 * opener. Same prefix, different subject; the reader found them 126 lines apart.)*
 */
/* **Measured: `return byPath[paths[0]!]` — this helper GUESSING rather than refusing —
 * costs 0 at both L6 rungs** (W84's adequacy reader, finding 9), because no flow this
 * ladder runs has two instances of one opener. So is dropping the instance flatten in
 * the independent-arities walk below. Both are forward-looking for W86, and the number
 * is carried here rather than the adjective. */
const soleRegion = (state: RunState, id: string): RegionRun | undefined => {
  const byPath = state.regions[id];
  if (byPath === undefined) return undefined;
  const paths = Object.keys(byPath);
  return paths.length === 1 ? byPath[paths[0]!] : undefined;
};

/**
 * **Every cross-row label, as it runs** — W47's adequacy reader, BLOCKING finding 1.
 *
 * It deleted each of W47's three new blocks in turn and then **all of W47's cross-row
 * work at once**, editing `CROSS_ROW` and `DECLARED_TOTAL` and one import line, and
 * L6 came back at **806 assertions / 38 real runs, 0 failed** in both runtimes with
 * all five checks at exit 0 — *exactly the pre-W47 numbers.* That is W23's finding at
 * its THIRD iteration: W35 answered the ROW half with `ROW_KEYS`, set equality **and**
 * order, so *"a deleted row fails naming itself"* — and **there was no analogue for
 * the cross-row layer**, which is where W47 put all of its output.
 *
 * `CROSS_ROW_SUBJECTS` below is that analogue, and this array is what feeds it.
 */
const crossRowLabels: string[] = [];
/**
 * **What each PER-ROW assertion was about, and which row it ran for** — W55's
 * adequacy reader, BLOCKING, and it is W23's finding at its FIFTH iteration.
 *
 * `ROW_KEYS` makes a deleted ROW fail naming itself and `CROSS_ROW_SUBJECTS` makes a
 * deleted cross-row BLOCK fail naming its subject. **Nothing did either for a per-row
 * assertion**, and that is where this item's product lives: measured, deleting the one
 * `check` call that carries the whole revert cost and editing THREE integers —
 * `PER_REGION_ROW`, `PER_PLAIN_ROW`, `DECLARED_TOTAL` — left **1012 assertions, 0
 * failed, exit 0**, after which reverting ADR 0046 rule 3 cost **2 instead of 25**.
 * *Three integer edits took "the rung Q214 said nobody had written" back to almost
 * nothing, and nothing named what had left.*
 *
 * `PER_ROW_SUBJECTS` below is the analogue, and this map is what feeds it.
 */
const perRowLabels = new Map<string, string[]>();
const note = (row: string, what: string): void => {
  if (row === 'cross-row') crossRowLabels.push(what);
  else perRowLabels.set(row, [...(perRowLabels.get(row) ?? []), what]);
};
const check = (row: string, what: string, actual: unknown, expected: unknown): void => {
  note(row, what);
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) passed++;
  else failures.push(`${row}\n      ${what}\n      expected: ${e}\n      actual:   ${a}`);
};
const assertThat = (row: string, what: string, cond: boolean, detail = ''): void => {
  note(row, what);
  if (cond) passed++;
  else failures.push(`${row}\n      ${what}${detail ? `\n      ${detail}` : ''}`);
};

/**
 * **Every region this row declares an answer for, as `[joined, settled]`** — W55.
 *
 * A row's own region is `regionId`/`joined`/`settled` and every OTHER one is a value
 * of `otherRegions`, which is how `Expectation` has carried a nested run since W23.
 * Both derivations below iterate this, so a depth-2 row is two regions to them and a
 * region-free row is none — and adding a third region to a row moves both numbers
 * without either of them being rewritten.
 */
const regionsDeclaredBy = (e: Expectation): [boolean | null | undefined, Record<string, string> | undefined][] => [
  [e.joined, e.settled],
  ...Object.values(e.otherRegions ?? {}).map(
    (r) => [r.joined, r.settled] as [boolean | null, Record<string, string>],
  ),
  // **W86 — and every INSTANCE is a region here, not every opener.** `ADR 0046`'s window and
  // `JP-R12`'s collection are both per instance (`RN-R13`'s second term reads *a join*, which is
  // per instance under `RN-R6`), so a row whose opener has two instances records two collections
  // and the retention clauses count both. Flattening to the opener would have made this row's
  // `peakEntries` short by the width of its second instance — which is the arithmetic form of the
  // defect the whole plan is about.
  ...Object.values(e.regionInstances ?? {}).flatMap((byPath) => Object.values(byPath).map(
    (r) => [r.joined, r.settled] as [boolean | null, Record<string, string>],
  )),
];

const arrivedIn = (settled: Record<string, string> | undefined): number =>
  Object.values(settled ?? {}).filter((how) => how === 'arrived').length;

/**
 * **How many entries this run's driver RECORDED, by
 * [ADR 0046](../doc/decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)
 * rule 4** — one per branch that emitted `branch.arrived`, and **nothing outside that
 * window**.
 *
 * `spec/join-policy.md`'s `JP-R12` is where the window is stated: it opens at a
 * region's first arrival and closes when its join becomes terminal. Every shipped
 * policy settles a join only once nothing is left to arrive — `arrival-count` on the
 * N-th of N, both `live-token`s when the last live branch goes terminal — so on this
 * corpus *recorded* and *arrived* are the same number, and a driver that recorded a
 * late arrival would be one entry over. **That equality is the assertion**; a policy
 * that settled a join early would make the two differ, and there is none here
 * ([Q95](../doc/questions/q95.md) is the row that records why not).
 *
 * A branch that was routed away, lost, or is still suspended has no entry — which is
 * `JP-R12`'s own sentence, and it is why this counts `arrived` rather than the
 * region's width.
 */
const arrivedInRun = (e: Expectation): number =>
  regionsDeclaredBy(e).reduce((n, [, settled]) => n + arrivedIn(settled), 0);

/**
 * **What the driver is still holding when the run is over**, by ADR 0046 rules 3 and
 * 5 — and the two are a DISCRIMINATING PAIR whose discriminating property is the
 * row's own `joined`.
 *
 *   - **rule 3, the run-level moment.** A refusal that stops the run releases
 *     **every** region's collection, including one whose join is still `waiting`,
 *     because the driver has stopped routing (`OR-R10`). So a row with a `stoppedBy`
 *     holds nothing, whatever its regions did.
 *   - **rule 3, the two per-region moments.** A join that was routed out of, or
 *     reported `unsatisfiable`, is TERMINAL — `joined` is `true` or `false` — and its
 *     collection was released at that exit. Nothing.
 *   - **rule 5.** A region whose join never became terminal — `joined: null` — holds
 *     what arrived until the caller releases the driver. **That is the bound rather
 *     than a leak**, and it is the run whose footprint matters most: this rung's two
 *     instances of it are a `stuck` run under `arrival-count` and a run parked on a
 *     person nobody answers.
 *
 * **`joined` is absent on a flow with no fan-out**, and `undefined !== null`, so a
 * region-free row asserts that the driver recorded and holds **nothing at all** —
 * which is a claim about `arrivalsOf` being empty rather than a vacuous zero.
 */
/**
 * **The one region a row's own `settled`/`joined` are about, read from the FLOW** —
 * W55, and it exists because `Expectation.regionId` is optional and most rows leave
 * it out.
 *
 * `null` when the flow declares no region at all (then `settled` must be absent too)
 * or when it declares more than one — a nested row names its regions explicitly, in
 * `regionId` and `otherRegions`, precisely so that nothing has to guess.
 */
const soleRegionOf = (e: Expectation): string | null => {
  const rs = allRegions(buildGraph(e.definition), e.definition);
  return rs.length === 1 ? rs[0]!.fanoutId : null;
};

/**
 * **Which of this row's regions are still holding when the run is over** — the region
 * NAMES behind `heldWhenOver`'s count, so `Retention.endByRegion`'s per-region shape
 * is asserted rather than only its sum (W55's adequacy reader).
 *
 * The others are the keys of `otherRegions`. A region is still holding when its join
 * never became terminal AND something arrived at it — an empty collection is never
 * recorded at all (`JP-R12`).
 *
 * **The row's OWN region is named from the DEFINITION, not from `regionId`**, and
 * that is W55's conformity reader's finding 5 reached from the other side.
 * `Expectation.regionId` is optional — `null` means *this flow has no fan-out*, and
 * **absent means the row simply never spelled it**: three of the four rows that hold
 * do not, and `all-exit / live-token-requiring-arrival` does not either, which is
 * what made the absence clause below read *no arrivals recorded* for the row it is
 * most about. So the id comes from the flow document the row runs, through the
 * shipped `allRegions` — an independent source, and the same one the resolver uses.
 */
const regionsStillLive = (e: Expectation): string[] => {
  if (e.stoppedBy !== undefined) return [];
  const out: string[] = [];
  const own = e.regionId ?? soleRegionOf(e);
  if (own != null && e.joined === null && arrivedIn(e.settled) > 0) out.push(own);
  for (const [id, r] of Object.entries(e.otherRegions ?? {})) {
    if (r.joined === null && arrivedIn(r.settled) > 0) out.push(id);
  }
  // W86: an instance that is still holding names its OPENER here, because
  // `Retention.endByRegion` is keyed by the opener and sums its instances — which is
  // ADR 0062 consequence 7's *the opener's own entry goes when its last instance's does*.
  for (const [id, byPath] of Object.entries(e.regionInstances ?? {})) {
    if (Object.values(byPath).some((r) => r.joined === null && arrivedIn(r.settled) > 0)) out.push(id);
  }
  return out.sort();
};

/** How many of a row's resolutions declare a value `FD-R4` must refuse first — W73. */
const refusedFirstCount = (e: Expectation): number =>
  Object.values(e.resolveOnSuspend ?? {}).filter((h) => h.refusedFirst !== undefined).length;

const heldWhenOver = (e: Expectation): number =>
  e.stoppedBy !== undefined
    ? 0
    : regionsDeclaredBy(e).reduce((n, [joined, settled]) => n + (joined === null ? arrivedIn(settled) : 0), 0);

/**
 * **Which types a definition transforms on, in which languages — derived from the DOCUMENT, with no
 * help from the helper** — W63. One `{ type: [lang, …] }` entry per node type some `task` of which
 * declares a `transform`, keys and languages sorted, so it compares as JSON text to
 * `RunReport.poolLanguages` filtered to the pools that carry one. Deliberately not
 * `transformLanguagesByType` from the package: that function is what the helper READ to build the
 * pools, and a clause that compared the pools to their own source would be a sensor corroborating
 * itself (rule 8 obligation (c)'s LIMIT). The cross-row block holds the two derivations to each other.
 */
const transformingTypesOf = (d: FlowDefinition): Record<string, string[]> => {
  const by = new Map<string, Set<string>>();
  for (const n of d.nodes) {
    const node = n as unknown as { type?: string; transform?: { lang?: string } };
    if (node.type === undefined || typeof node.transform?.lang !== 'string') continue;
    (by.get(node.type) ?? by.set(node.type, new Set()).get(node.type)!).add(node.transform.lang);
  }
  return Object.fromEntries([...by].sort(([a], [b]) => a.localeCompare(b)).map(([t, ls]) => [t, [...ls].sort()]));
};

const reports: RunReport[] = [];
/** Per row: key, shape, assertions actually run, and how many are row-specific extras. */
const rowCosts: [string, string, number, number][] = [];

/**
 * **What order a RUN fixes over its own dispatches — W98, and [Q400](../doc/questions/q400.md).**
 *
 * A dispatch happens in the TURN a settlement opens: the driver hears a task settle, routes, and
 * dispatches synchronously. So the settlement that opened the turn is that dispatch's **TRIGGER**
 * (the entry's turn has none), and **three relations, and only these three, fix an order between two
 * dispatches**:
 *
 * | | why the run fixes it |
 * |---|---|
 * | **causal** — `a` is the trigger of `b`'s turn, or transitively | `a` was dispatched and SETTLED before `b`'s turn existed |
 * | **one turn** — `a` and `b` share a trigger | the driver dispatches a turn's tasks in the DOCUMENT's order, in one synchronous pass (`spec/join-policy.md` section 2: *a fanout dispatches all its branches in one turn*) |
 * | **a join BARRIER** — a `joinSettled` for region R precedes `b` in `b`'s own turn | the join could not settle until every branch of R was terminal, so every task of R settled first, whatever order they settled in |
 *
 * **Everything else is a completion order and this rung asserts none of it** — two turns opened by
 * settlements that RACED. [W97](../doc/work-items/w97-obligation-f-across-ladder-l6.md) found four such
 * assertions by perturbing them one at a time; this item's declaration step derived the whole set and
 * found **210 racing pairs asserted across 37 of the 55 rows**, which is why the comparison is derived
 * rather than declared. *`unorderedDispatch` is RETIRED with it* — the field, the five rows that declared it and the helper that fed three of
 * them are gone from this file: a row no longer says which ids are loose, because the run says it. W51's flag justified
 * a loose set by whether the ROW overlapped at all, which is true of every fan-out row and names no id (Q400). *(Three
 * comments here said it was retired while all seven sites stood with zero readers — both of W98's readers, blocking.)*
 *
 * The barrier is what keeps this from weakening the rung: without it a join's successor would be
 * unordered against every branch task, and that order IS fixed.
 */
const dispatchOrder = (report: Pick<RunReport, 'inputs'>) => {
  const trigger = new Map<string, string>();
  const pos = new Map<string, number>();
  /** Per dispatch: the join barriers in force when it was dispatched — the branch paths terminal AT that join, and where. */
  const barrier = new Map<string, { paths: string[]; at: number }[]>();
  const terminal = new Map<string, Set<string>>();
  const dispatched: string[] = [];
  let turn = '-';
  let joins: { paths: string[]; at: number }[] = [];
  report.inputs.forEach((inp, at) => {
    if (inp.kind === 'outcome' || inp.kind === 'resolution') { turn = inp.record.taskId; joins = []; }
    else if (inp.kind === 'region' && (inp.event.type === 'branch.arrived' || inp.event.type === 'branch.exited' || inp.event.type === 'branch.lost')) {
      terminal.set(inp.event.regionId, (terminal.get(inp.event.regionId) ?? new Set()).add(inp.event.branchPath));
    } else if (inp.kind === 'joinSettled' && inp.fired) {
      // **The paths terminal AT THIS MOMENT, copied** — a policy may fire a join with branches still live
      // (`arrival-count` does), and those branches' tasks may be dispatched AFTER this successor; reading the set at the
      // END of the run would claim they came first. *(Both of this line's guards — the copy and `at` — are DECLARED
      // CEILINGS: no row on this rung pairs an early-firing join with a later dispatch in its region, so neither has a
      // live case. W98's rule 8 `a4`, and its adequacy reader's `M14`.)*
      joins = [...joins, { paths: [...(terminal.get(inp.regionId) ?? new Set<string>())], at }];
    } else if (inp.kind === 'dispatched') {
      trigger.set(inp.taskId, turn);
      barrier.set(inp.taskId, joins);
      pos.set(inp.taskId, at);
      dispatched.push(inp.taskId);
    }
  });
  const under = (paths: readonly string[], id: string): boolean => {
    const bp = parseTaskId(id).branchPath;
    return paths.some((p) => bp === p || bp.startsWith(`${p}.`));
  };
  const siblings = (d: string): string[] => dispatched.filter((id) => id !== d && trigger.get(id) === trigger.get(d));
  /**
   * The dispatches this run fixes BEFORE `b`, and by WHICH relation — `RN-R27`'s three, kept apart, because a barrier
   * over-reaching by exactly what a chain under-reaches is invisible to one number (W98's adequacy reader, `M2`/`B2`).
   *
   * **A member's SAME-TURN siblings precede `b` too**, which is (a) composed with (b) and is why this is a closure rather
   * than a walk: a member SETTLED before `b`'s turn existed, and its siblings were dispatched in the same synchronous
   * pass, so they were dispatched before that settlement. W98's conformity reader derived it and measured what it is
   * worth — **281 pairs the first cut called racing** — which is the enumeration clause (v0.17) on this item's own rule.
   */
  const before = (b: string) => {
    const chain = new Set<string>();
    const viaBarrier = new Set<string>();
    const seen = new Set<string>();
    const add = (d: string, into: Set<string>) => {
      if (d === b) return;
      if (!chain.has(d)) into.add(d);
      expand(d);
    };
    const expand = (d: string) => {
      if (seen.has(d)) return;
      seen.add(d);
      const t = trigger.get(d);
      if (t !== undefined && t !== '-') add(t, chain);
      if (d !== b) for (const s of siblings(d)) add(s, chain);
      for (const j of barrier.get(d) ?? []) {
        for (const id of dispatched) if ((pos.get(id) ?? Infinity) < j.at && under(j.paths, id)) add(id, viaBarrier);
      }
    };
    expand(b);
    for (const d of chain) viaBarrier.delete(d);
    return { chain, viaBarrier };
  };
  /** Which of `RN-R27`'s relations fixes these two dispatches, if any? `turn` is the DEFINITION's order, or the DATA's. */
  const fixes = (a: string, b: string): 'chain' | 'barrier' | 'turn' | null => {
    const fb = before(b), fa = before(a);
    if (fb.chain.has(a) || fa.chain.has(b)) return 'chain';
    if (fb.viaBarrier.has(a) || fa.viaBarrier.has(b)) return 'barrier';
    const ta = trigger.get(a), tb = trigger.get(b);
    return ta !== undefined && ta === tb ? 'turn' : null;
  };
  return { fixes, trigger };
};

/**
 * **The derivation's own CONTROL, on two CONSTRUCTED sequences — W98's adequacy reader, `B1`.** The census below is what
 * catches a `fixes` that collapses, and it had no control of its own: `rows: orderCensus.length` compared against
 * `EXPECTED.length` is a self-comparison, and with the two literals gone a derivation returning one relation for every
 * pair was green. These two inputs are the tree v0.22 asks for — a tree on which the control fails while the census's
 * claim passes — and neither exists as a run: ONE turn dispatching three tasks (every pair the document's order, nothing
 * racing), and TWO turns opened by settlements that raced (the cross pairs fixed by nothing).
 */
const dispatchOrderControl = (): { oneTurn: string[]; racing: (string | null)[] } => {
  const rec = (taskId: string) => ({ kind: 'outcome' as const, record: { taskId } as LogRecord });
  const dis = (taskId: string) => ({ kind: 'dispatched' as const, taskId });
  const one = dispatchOrder({ inputs: [rec('r:a:-:0'), dis('r:x:0:0'), dis('r:y:1:0'), dis('r:z:2:0')] as FoldInput[] });
  const two = dispatchOrder({
    inputs: [rec('r:a:-:0'), dis('r:x:0:0'), dis('r:y:1:0'), rec('r:x:0:0'), dis('r:p:0:0'), rec('r:y:1:0'), dis('r:q:1:0')] as FoldInput[],
  });
  return {
    // one turn: all three pairs are the DOCUMENT's order
    oneTurn: [one.fixes('r:x:0:0', 'r:y:1:0'), one.fixes('r:y:1:0', 'r:z:2:0'), one.fixes('r:x:0:0', 'r:z:2:0')].map((x) => String(x)),
    // two racing turns: x < p by the chain, y < q by the chain, and p against q by NOTHING
    racing: [two.fixes('r:x:0:0', 'r:p:0:0'), two.fixes('r:y:1:0', 'r:q:1:0'), two.fixes('r:p:0:0', 'r:q:1:0')],
  };
};

const orderCensus: { key: string; ids: number; free: number; chain: number; barrier: number; turn: number }[] = [];

for (const [i, e] of EXPECTED.entries()) {
  let report: Awaited<ReturnType<typeof runFlow>>;
  try {
    report = await runFlow({
      definition: e.definition,
      policy: POLICIES[e.policyId],
      runId: `r${i + 1}`,
      payload: e.payload,
      // **The row's own registry where it declares one, the shared three otherwise** — W110, and
      // the default matters: a row that forgets the key gets the three rather than an empty map,
      // so the empty case has to be asked for. `??` is nullish, so an EMPTY Map passes through.
      predicates: e.predicates ?? predicates,
      ...(e.uiRegistry === true ? { uiRegistry: true as const } : {}),
      threaded: e.threaded,
      resolveOnSuspend: e.resolveOnSuspend,
      refuseAtStart: e.refuseAtStart?.payload,
      // Short only for the row whose result IS the backstop. Nothing can change
      // after the branch suspends, so a longer wait would measure the same thing
      // more slowly — and if it were ever too short the row fails loudly, with the
      // outcome reading `running` rather than `awaiting_action`.
      backstopMs: e.backstopMs,
      holdGroup: e.holdGroup,
      // **W82: the PRESENCE of this is the switch** — `RunOptions.checkResults` is spread into
      // `StartOptions` only where a row asks, so every row that omits it runs with the check OFF
      // and asserts an empty report in the cross-row block (ADR 0060 decision 4).
      ...(e.checkResults === true ? { checkResults: true as const } : {}),
    });
  } catch (err) {
    // **A row whose run THROWS is a FAIL line naming the row, never a process crash with zero
    // FAIL lines** — W59, closing the shape W58 recorded (`groups` misspelled on the harness's
    // `DriverOptions` took the process down before any assertion) and W23 recorded before it.
    // Measured on this item's own wiring probe: with `nodeTypes` dropped from the driver's
    // options, `new Driver` threw `FD-V32` inside `runFlow` and ladder L6 exited 1 with no
    // failure line at all — `doc/workflow.md` section 4's *a crash is not a detection*, in the
    // rung's own output. The remaining rows are not run: the cross-row layer indexes `reports`
    // by row, so a missing report would be a second crash further down rather than a verdict.
    failures.push(`${e.key}\n      the run THREW before any assertion could run — a crash is not a detection: ` +
      `${err instanceof Error ? err.message.slice(0, 240) : String(err)}`);
    for (const f of failures) console.log(`  FAIL  ${f}`);
    exit(1);
  }
  reports.push(report);
  const before = passed + failures.length;

  // The backstop is not a result. Reaching it means the run neither finished nor
  // reached a terminal outcome, and every row below is then meaningless.
  // **The wait ended BECAUSE `isTerminal(state)` fired, not because a clock did.**
  // `!timedOut` alone does not say that: a harness whose wait ends on a 1 ms timer
  // sets no flag and still reports every value correctly, because
  // `scheduler.shutdown()` drains the run before the report is built. That
  // mutation survived every assertion here until this line existed.
  const wantFinish = e.expectBackstop ? 'backstop' : 'run-state';
  assertThat(e.key,
    e.expectBackstop
      ? 'RN-R12: the run did NOT finish, because it is parked on a person'
      : 'RN-R12: the wait ended because the run-state outcome became terminal',
    report.finishedBy === wantFinish,
    `finishedBy=${report.finishedBy}, wall ${report.wallMs}ms, outcome ${report.state.outcome}`);
  if (report.finishedBy !== wantFinish) continue;

  check(e.key, 'run-state outcome — spec/run-state.md section 3', report.state.outcome, e.outcome);
  // **The SET, and the ORDER THE RUN FIXES — nothing else. W98, `RN-R27`.** A row's `dispatched` list is its
  // documentation of what ran and in what order it reads; what is ASSERTED about the order is `dispatchOrder`'s three
  // relations (above), derived from this run's own sequence. A pair the run does not fix is a completion order, and
  // [Q401](../doc/questions/q401.md)'s sweep could only find the ones a delay happened to move.
  {
    // **W94: a row with a GATE leaves the per-series task's ids to the gate clause**, which derives them from the run's
    // own `gated` elements — P24 decision 7: which file opens a series varies between runs, so no literal may name it.
    const besideGate = (ids: readonly string[]) => (e.gate ? ids.filter((id) => parseTaskId(id).nodeId !== e.gate!.opens) : ids);
    const got = besideGate(report.dispatched);
    const want = besideGate(e.dispatched);
    check(e.key, 'the dispatched task ids, as a SET — spec/task-id.md', [...got].sort(), [...want].sort());
    const { fixes } = dispatchOrder(report);
    const at = (id: string) => got.indexOf(id);
    const pairs: string[] = [];
    const wrong: string[] = [];
    // **Counted, not subtracted — W98's own rule 8 pass, probe `c1`.** `free` read `total - fixed`, so the census's two
    // numbers were ONE reading and re-sourcing `fixed` to a literal left both agreeing: obligation (c)'s LIMIT, *a sensor
    // cannot corroborate itself*. It counts the pairs `fixes` REFUSES now, so the two sides move independently.
    let free = 0;
    const byRelation = { chain: 0, barrier: 0, turn: 0 };
    for (let i = 0; i < want.length; i++) {
      for (let j = i + 1; j < want.length; j++) {
        const [a, b] = [want[i]!, want[j]!];
        const how = fixes(a, b);
        if (how === null) { free++; continue; }            // a completion order: not this rung's to assert
        pairs.push(`${a} < ${b} (${how})`);
        byRelation[how] += 1;
        // *(`at(a) >= 0 && at(b) >= 0` is a DEAD guard and is kept as a total function rather than removed: the SET
        // clause above already fails where an expected id was not dispatched. W98's adequacy reader, `M5`.)*
        if (at(a) >= 0 && at(b) >= 0 && at(a) > at(b)) wrong.push(`${b} before ${a}, and the run fixes ${a} < ${b} (${how})`);
      }
    }
    check(e.key, 'and every PAIR of them whose order this run FIXES — a trigger chain, one turn, or a join barrier — ' +
      'came out in that order (RN-R27)', wrong, []);
    // **The control, per row, and it is `n - 1` rather than `> 0`** — W98's adequacy reader (`M1`): every row's dispatches
    // form at least a chain from the entry, so `ids - 1` pairs are fixed at minimum, and the eight rows with three ids all
    // read 3. `> 0` was satisfied by a derivation that found ONE pair on a row of twenty-five. *(The comment here read *any
    // row with two dispatches has at least one fixed pair*, which is false in general — two dispatches in two racing turns
    // are fixed by nothing — and true of this corpus, where the five rows with no fixed pair are the five with one id.)*
    assertThat(e.key, 'and the run FIXED at least one pair per dispatch beyond the first, so the clause above is a claim ' +
      'about this run rather than a derivation that fixes almost nothing', pairs.length >= want.length - 1,
      `${pairs.length} fixed pairs over ${want.length} dispatched ids`);
    orderCensus.push({ key: e.key, ids: want.length, free,
      chain: byRelation.chain, barrier: byRelation.barrier, turn: byRelation.turn });
  }
  // **The region-event stream, per branch.** Between branches the order is fan-out
  // completion order and nothing may assert it (section 5 rule 5); within one
  // branch `JP-R5` fixes it. This is what makes `branch.resumed` and
  // `branch.exited` reachable by an assertion at all.
  for (const [branch, want] of Object.entries(e.branchEvents ?? {})) {
    const got = report.inputs
      .filter((x) => x.kind === 'region' && x.event.branchPath === branch)
      .map((x) => (x as { event: { type: string } }).event.type);
    check(e.key, `the region events for branch ${branch}, in order — JP-R5`, got, want);
  }
  // `spec/run-state.md` section 3's discriminant between `completed` and `failed`,
  // asserted directly rather than only through the outcome it produces.
  if (e.pathEnds) {
    // **A row through a GATE compares its path ends as a MULTISET** — W94's confirming gate, RED in deno on the LAST-first
    // row: the per-series road reaches `seriesReady` only once its task SETTLES, while a drop ends synchronously at the gate,
    // so the two interleave by a task's COMPLETION time — a fan-out completion order, which `spec/` does not fix and section
    // 5 rule 5 forbids asserting (the conformity reader's finding 2, one field over; ten green runs held it by timing
    // alone). The ORDER the gate decided in is asserted where it is a fact — the arrangement clause's `arrival`.
    const endsOf = (ends: readonly { reason: string; at: string }[]) =>
      e.gate ? [...ends].map((x) => JSON.stringify(x)).sort().map((x) => JSON.parse(x) as { reason: string; at: string }) : ends;
    check(e.key, 'pathEnds — section 3 discriminates completed from failed by these',
      endsOf(report.state.pathEnds), endsOf(e.pathEnds));
  }
  if (e.regionSuspended) {
    check(e.key, 'regions[*].suspended — who is parked on a person right now',
      soleRegion(report.state, e.regionId ?? 'split')?.suspended, e.regionSuspended);
  }
  if (e.stoppedBy !== undefined) {
    // **The class FIRST, then `: `** — the driver's `${constructor.name}: ${message}`. It read `includes` until
    // W133, which a doubled name, or a message that merely mentioned the class, also satisfied.
    assertThat(e.key, 'OR-R10: stoppedBy names the refusal that terminated the run, as its class and then its message',
      (report.state.stoppedBy ?? '').startsWith(`${e.stoppedBy}: `), `stoppedBy: ${report.state.stoppedBy}`);
  }
  if (e.stoppedByNamesItOnce) {
    assertThat(e.key, 'Q63: and the class name occurs in stoppedBy EXACTLY ONCE — the message does not repeat it',
      (report.state.stoppedBy ?? '').split(e.stoppedBy ?? '\u0000').length === 2, `stoppedBy: ${report.state.stoppedBy}`);
  }
  for (const [id, want] of Object.entries(e.nodeResults ?? {})) {
    check(e.key, `Q36: what ${id.split(':')[1]} received`, report.state.nodes[id]?.result, want);
  }
  // **W58 — `attempts`, on two observers that reach the field by different roads.** The
  // record is the driver's listener copying the live task's field (`OR-R2`); `attemptsSeen`
  // is the harness's own listener reading the same live object. A driver that normalised the
  // field to 0 would fail the first and not the second; a scheduler that never retried would
  // fail both — and a row asserting only the record would be reading one sensor through a
  // normaliser, which is obligation (c)'s LIMIT.
  for (const [id, want] of Object.entries(e.attempts ?? {})) {
    const record = report.log.find((r) => r.kind === 'outcome' && r.taskId === id);
    check(e.key, `OR-R2: the outcome record's attempts for ${id.split(':')[1]}@${id.split(':')[2]} — the scheduler retried inside this id`,
      record?.kind === 'outcome' ? record.attempts : undefined, want);
    check(e.key, `and the LIVE task the scheduler settled carried the same attempts — the second observer`,
      report.attemptsSeen[id], want);
  }
  // **W58 — the scheduler's account of a task's resources, in order, and that the task was
  // blocked BEFORE it ran.** The whole sequence first, so a missing or extra event names
  // itself; then the ordering claim the row is for, separately, so it reads as a claim.
  for (const [id, want] of Object.entries(e.resourceEvents ?? {})) {
    const got = report.resourceEvents[id] ?? [];
    check(e.key, `resource events for ${id.split(':')[1]}, in order, with task.running interleaved`, got, want);
    assertThat(e.key, 'and it was resource.blocked BEFORE it ran — the group the node declared held it',
      got.includes('resource.blocked') && got.indexOf('resource.blocked') < got.indexOf('task.running'),
      `sequence: ${got.join(', ') || '(none)'}`);
  }
  // **W59 — WHICH group a task held, by id.** The `groupId` of every `resource.acquired` on the
  // task's behalf, so a typed task is shown holding the group its TYPE declares — and only that:
  // a pool that gained or lost a group is red on the value, where the event-name sequence above
  // could not tell one group from another.
  for (const [id, want] of Object.entries(e.heldGroups ?? {})) {
    check(e.key, `the groups ${id.split(':')[1]}@${id.split(':')[2]} ACQUIRED, by id — the type's declared groups and no other`,
      report.heldGroups[id] ?? [], want);
  }
  // **W67 — WHICH pool a task ran on, off the scheduler.** `poolOfTask` is built from
  // `scheduler.tasks` after the run, so it is the scheduler's own record and not the harness's:
  // a node on its type's default instance and one on a named instance of the SAME type differ here
  // and nowhere else in a `RunReport`.
  for (const [id, want] of Object.entries(e.poolOfTask ?? {})) {
    check(e.key, `the POOL ${id.split(':')[1]}@${id.split(':')[2]} ran on, read off scheduler.tasks — node.pool ?? node.type`,
      report.poolOfTask[id] ?? '(not held)', want);
  }
  for (const never of e.outcomesNotSeen ?? []) {
    assertThat(e.key, `the run was never quiescently \`${never}\``,
      !report.outcomesSeen.includes(never as RunOutcome),
      `saw: ${report.outcomesSeen.join(', ')}`);
  }
  // **W63 — the ERROR a failed transform's task settled with, on two observers that reach the
  // string by different roads**: the outcome record (the driver's listener copying the live task's
  // `error`, `OR-R2`) and `errorsSeen` (the harness's own listener reading the same live object).
  // The substrings are the row's declaration of `TransformFailed`'s message — the language, the
  // engine's code in brackets, the reason — so a wrapper that reported the failure under a bare
  // message, or a scheduler that recorded none, is red on the first; a driver that normalised the
  // message away is red on the second and not the first.
  for (const [id, wants] of Object.entries(e.taskErrors ?? {})) {
    const record = report.log.find((r) => r.kind === 'outcome' && r.taskId === id);
    const err = record?.kind === 'outcome' ? record.error : undefined;
    // **A declared substring must be NON-EMPTY, and there must be one** — W133's adequacy reader, finding 4: `['']`
    // satisfied `includes` and left the row asserting nothing about WHICH error, at EXIT 0.
    assertThat(e.key, `${e.taskErrorsRule ?? 'ADR 0051 rule 5'}: the outcome record's error for ${id.split(':')[1]} carries — ${wants.join(' · ')}`,
      typeof err === 'string' && wants.length > 0 && wants.every((w) => w.length > 0 && err.includes(w)), `error: ${String(err)}`);
    check(e.key, `and the LIVE task the scheduler settled carried the same error string — the second observer`,
      report.errorsSeen[id], err);
  }
  for (const [id, want] of Object.entries(e.records ?? {})) {
    check(e.key, `OR-R3 / OR-R6 v0.11: the log holds exactly these records for ${id.split(':')[1]} — kind, terminal state, and whether a result crossed`,
      report.log.filter((r) => r.taskId === id).map((r) => `${r.kind}:${r.kind === 'outcome' ? r.terminalState : 'resolution'}:${r.result === null ? 'no result' : 'result'}`),
      want);
  }
  // **W82 — `OR-R13`: the WHOLE report, as a set both ways and then per id.**
  //
  // The set first, because a driver that reported a THIRD node — or one of these twice — is a
  // defect in the check's reach rather than in a finding, and a per-id loop alone could not see it.
  // The findings are then compared as `describeFindings` renders them, which is the string the
  // callback's own `message` embeds, so a driver that reported the right node for the wrong reason
  // fails on the value.
  if (e.nonconforming !== undefined) {
    check(e.key, 'OR-R13: the check reported on exactly the settlements this row declares, both ways',
      report.nonconforming.map((f) => f.taskId).sort(), Object.keys(e.nonconforming).sort());
    for (const [id, says] of Object.entries(e.nonconforming)) {
      const got = report.nonconforming.find((f) => f.taskId === id);
      check(e.key, `and ${id.split(':')[1]}`, got?.findings.map((x) => `${x.path} ${x.says}`).join('; '), says);
      // **The callback carries the NODE and the WORKER, not only the task id** — `OR-R13`'s own
      // wording, and the half that makes a finding actionable: the schema is findable in one
      // lookup. Derived from the definition and the registry document rather than declared beside
      // the row, so a driver that named the wrong worker is red without this row saying which.
      const nodeId = id.split(':')[1]!;
      const type = (e.definition.nodes.find((n) => n.id === nodeId) as { type?: string } | undefined)?.type;
      const worker = (REGISTRY_DOCUMENT.nodeTypes ?? {})[type ?? '']?.worker;
      check(e.key, `and it names ${nodeId}'s node, type and worker — the schema findable in one lookup`,
        [got?.nodeId, got?.type, got?.worker], [nodeId, type, worker]);
    }
  }
  // **W82 — the report DERIVED from this row's own log, beside the literal above.**
  //
  // The clauses above hold the report to what the ROW DECLARES, and a literal is bound by whatever
  // compares it: re-source either side to the other and both go vacuous with every count unmoved
  // (`doc/workflow.md` v0.21). **This is the second road and it reads no literal at all** — for every
  // `done` settlement of this row, look up the node's type, its worker and that worker's
  // `outputSchema` exactly as `OR-R13` says the driver does, apply the value check to the RECORD, and
  // require the callback's report to be precisely the settlements that failed.
  //
  // **What it binds is the driver's DISPATCH of the check** — which settlements it reaches, which it
  // skips, and what it names them — and each of the rule's three *and nothing else* clauses is one of
  // those: `done` ONLY (`OR-R2` writes `result: null` otherwise), a worker with NO `outputSchema` is
  // UNCHECKED, and a node that is not a task is not checked at all. Every one of those had no observer
  // at this rung until this clause, because all four of this flow's nodes settle `done` and all four
  // declare a schema — measured, as three undeclared survivors, by this item's own rule-8 pass.
  //
  // **It does NOT bind `findings` itself, and that is the row's literal's job** — the same function
  // applied at a different SITE, to a value reached by a different ROAD (this file's snapshot against
  // the callback's payload). *Three roads, and only the first two can disagree about the same call.*
  if (e.checkResults === true) {
    const want: Record<string, { nodeId: string; type: string; worker: string; says: string }> = {};
    // **What the walk REACHED, beside what it found** — the adequacy reader's findings 1 and 2, and
    // it is the whole of what makes the clause below a second road rather than a second reading.
    const reached: string[] = [];
    for (const r of report.log) {
      if (r.kind !== 'outcome' || r.terminalState !== 'done') continue;
      const nodeId = r.taskId.split(':')[1]!;
      const node = e.definition.nodes.find((n) => n.id === nodeId);
      if (node?.kind !== 'task') continue;
      const type = (node as { type: string }).type;
      const worker = (REGISTRY_DOCUMENT.nodeTypes ?? {})[type]?.worker;
      const schema = worker === undefined ? undefined : (REGISTRY_DOCUMENT.workers ?? {})[worker]?.outputSchema;
      if (schema === undefined) continue;
      reached.push(r.taskId);
      const fs = findings(schema as JsonSchema, r.result);
      if (fs.length === 0) continue;
      want[r.taskId] = { nodeId, type, worker: worker!, says: fs.map((x) => `${x.path} ${x.says}`).join('; ') };
    }
    check(e.key, 'OR-R13: and the report IS the settlements of this row whose RECORD fails its worker`s declared outputSchema — ' +
      'derived from the log and the registry, reading no literal, so it holds the driver`s dispatch of the check rather than its arithmetic',
      report.nonconforming.map((f) => ({ taskId: f.taskId, nodeId: f.nodeId, type: f.type, worker: f.worker, says: f.findings.map((x) => `${x.path} ${x.says}`).join('; ') }))
        .sort((x, y) => x.taskId.localeCompare(y.taskId)),
      Object.entries(want).map(([taskId, w]) => ({ taskId, ...w })).sort((x, y) => x.taskId.localeCompare(y.taskId)));
    // **CONTROL: the walk reached the CONFORMING settlements too, which the report never names.**
    //
    // *Every observer of the report is downstream of the report* — obligation (c)'s LIMIT at its
    // sharpest, and the adequacy reader measured what that costs: with the walk above re-sourced to
    // `report.nonconforming` the clause became a projection of the report compared with itself, and
    // the control it carried — *the derivation found SOMETHING* — was then *the report is non-empty*,
    // **exactly as true as before**. Pointed at the report by one more edit, a driver reporting
    // `$.NOTHING garbled` for every settlement left this rung at 1720, 0 failed.
    //
    // What refuses it is a property the LOG has and the report does not: this flow settles FOUR
    // tasks whose workers declare an `outputSchema` and the report names TWO. A walk built from the
    // report reaches two, and this fails naming both lists. *It is a relation over the walk rather
    // than an expression over one of its operands* — `doc/workflow.md` v0.21's clause.
    const withSchemaHere = report.log.flatMap((r) => {
      if (r.kind !== 'outcome' || r.terminalState !== 'done') return [];
      const node = e.definition.nodes.find((n) => n.id === r.taskId.split(':')[1]);
      if (node?.kind !== 'task') return [];
      const w = (REGISTRY_DOCUMENT.nodeTypes ?? {})[(node as { type: string }).type]?.worker;
      return (w !== undefined && (REGISTRY_DOCUMENT.workers ?? {})[w]?.outputSchema !== undefined) ? [r.taskId] : [];
    }).sort();
    check(e.key, 'CONTROL: and the walk above reached EVERY `done` settlement of this row whose worker declares an outputSchema — ' +
      'including the CONFORMING ones, which the report never names, so it cannot have been built from the report',
      reached.sort(), withSchemaHere);
    assertThat(e.key, 'CONTROL: and it reached STRICTLY MORE than the report names — a row on a flow whose every record conforms, or ' +
      'whose every record fails, would make the clause above an equality this control cannot discriminate',
      reached.length > report.nonconforming.length && report.nonconforming.length > 0,
      `walked ${reached.length}, reported ${report.nonconforming.length}`);
  }
  // **W82 — the FIRST of the row's three observers: what the SCHEDULER settled with.**
  //
  // Read off the live `detail.result` before `OR-R2` cloned anything, so this and the record's own
  // key set are two readings of what is nominally one value — and where they differ, the difference
  // is the clone's. The record's side is derived here rather than declared, because the row already
  // declares the record's whole value under `nodeResults` and a second literal would be a second
  // source that could agree with nothing.
  for (const [id, keys] of Object.entries(e.settledOwnKeys ?? {})) {
    check(e.key, `OR-R11: the LIVE result ${id.split(':')[1]} settled with carried these own keys`,
      report.settledOwnKeys[id], keys);
    const rec = report.log.find((r) => r.kind === 'outcome' && r.taskId === id);
    const carried = rec?.kind === 'outcome' && typeof rec.result === 'object' && rec.result !== null
      ? Object.getOwnPropertyNames(rec.result).sort() : undefined;
    assertThat(e.key, `and the RECORD carries FEWER — OR-R2's clone copies own ENUMERABLE keys and nothing else, ` +
      `so the same schema applied to the two lawfully disagrees and no authoring-time tool holds the second`,
      carried !== undefined && carried.length < keys.length && carried.every((k) => keys.includes(k)),
      `live ${JSON.stringify(keys)} against record ${JSON.stringify(carried)}`);
  }
  // **W63 — ADR 0051 rule 4 on EVERY row: the pools whose config carries a language are exactly the
  // types some node of THIS row's flow transforms on, in exactly the languages those nodes name,
  // both ways.** `poolLanguages` is read off the built pools; the other side is derived here from
  // the definition WITHOUT the helper's own `transformLanguagesByType` (which the cross-row block
  // holds to this derivation separately), so a helper that wrote the engine into every typed pool —
  // or into none — is red on the value, and on the forty-two rows that declare no transform the
  // assertion is that no pool carries one: `Scorer`'s pool loads the engine on a `transformed` run
  // and not on a `typed` one, which is the discriminating pair the cross-row block names.
  check(e.key, 'ADR 0051 rule 4: the pools carrying a language are exactly the types this flow transforms on, in the languages it names, both ways',
    Object.fromEntries(Object.entries(report.poolLanguages).filter(([, ls]) => ls.length > 0).sort(([a], [b]) => a.localeCompare(b))),
    transformingTypesOf(e.definition));

  if (e.regionId === null) {
    // A flow with no fan-out enters no region, and `RN-R10` must therefore not
    // be able to call it `stuck` — which is the clause a fan-out-free flow
    // exists to hold down.
    //
    // **W35 widened the WORDING and not the assertion**, because a region can also
    // go unentered in a flow that HAS one: `FD-R2` throws while resolving a map's
    // arity, which happens before the `regionEntered` append, so `map-no-array`
    // has a region in its definition and none in its run. The old spelling — *a
    // flow with no fan-out* — would have been a false sentence attached to a true
    // check, which is `doc/workflow.md` section 1 rule 5's writing clause applied
    // to an assertion label.
    check(e.key, 'the run entered no region', Object.keys(report.state.regions), []);
  } else {
    // **`e.regionId`, not the literal `'split'`** — W23. The row declares which
    // region it is about and this reads it, so a flow whose fanout has another
    // name is expressible at all.
    const rid = e.regionId ?? 'split';
    // **The instance COUNT is inside the claim, and the paragraph above `soleRegion` is why** — W84
    // wrote there that two sites make a multi-instance region SILENT, and named W86 as the item that
    // has to decide them. *(That paragraph credits **W84's conformity reader, finding 10**, and W84's
    // file enumerates no such numbered finding — it does not contain the string `soleRegion` at all.
    // The measurement reproduces and the attribution does not; W86's conformity reader, finding 5,
    // and it is W85's own *a citation with no referent* one item later, INHERITED rather than
    // invented.)* This is the first: `?? null` turns *there is
    // no sole instance* into `null`, which is what eight rows here declare, so a region that
    // quietly gained a second instance would have passed this clause in silence. Comparing the PAIR
    // costs no assertion and makes *exactly one instance* part of what the row asserts — a region
    // with N answers is red on the count rather than absorbed by the fallback.
    check(e.key, 'the join fired — RN-R11, and this opener has exactly ONE instance to read it from',
      { instances: Object.keys(report.state.regions[rid] ?? {}).length, joined: soleRegion(report.state, rid)?.joined ?? null },
      { instances: 1, joined: e.joined });
    check(e.key, 'how each branch left its region — spec/join-policy.md section 2',
      sortedSettled(soleRegion(report.state, rid)?.settled), sortedSettled(e.settled));

    // **Every OTHER region of the run — W23**, and the two halves are checked
    // separately: each declared region must answer as declared, AND the set of
    // regions the RUN entered must be exactly the set the row declares. Without
    // the second half a row could declare one of its two and read as complete,
    // which is W22's adequacy reader's loop-bound finding one rung up.
    for (const [id, want] of Object.entries(e.otherRegions ?? {})) {
      check(e.key, `${id}: the join fired — RN-R11, and this opener has exactly ONE instance to read it from`,
        { instances: Object.keys(report.state.regions[id] ?? {}).length, joined: soleRegion(report.state, id)?.joined ?? null },
        { instances: 1, joined: want.joined });
      check(e.key, `${id}: how each branch left its region`,
        sortedSettled(soleRegion(report.state, id)?.settled), sortedSettled(want.settled));
    }
    // **W86 — a region with MORE THAN ONE instance, read at `regions[openerId][openerPath]`.**
    //
    // ADR 0062 rule 2's carrier, from the outside: the row names the instance by the opener's own
    // branch path and this reads that key and no other. Two assertions per instance, and they are
    // what a `soleRegion` read structurally cannot make — there is no sole instance, and returning
    // either would make the verdict depend on which one the driver entered first.
    for (const [id, byPath] of Object.entries(e.regionInstances ?? {})) {
      for (const [path, want] of Object.entries(byPath)) {
        check(e.key, `${id}@${path}: the join fired — RN-R11 per INSTANCE, ADR 0062 rule 2`,
          report.state.regions[id]?.[path]?.joined ?? null, want.joined);
        check(e.key, `${id}@${path}: how each branch left THIS instance — and its keys carry the instance's own path as their prefix`,
          sortedSettled(report.state.regions[id]?.[path]?.settled), sortedSettled(want.settled));
      }
    }
    check(e.key, 'the run entered exactly the regions this row declares',
      Object.keys(report.state.regions).sort(),
      [rid, ...Object.keys(e.otherRegions ?? {}), ...Object.keys(e.regionInstances ?? {})].sort());

  }
  // **W86 — `RegionEvent.regionPath` on real workers, per branch, as a SET.**
  //
  // ADR 0062 rule 3 put `regionPath` on all six variants and W84 declared L6 UNMOVED, which is the
  // statement that nothing at this rung read it. This is the read: every region event of one branch
  // must name one instance, and it must be the instance the row says. A set rather than a first
  // element, so a stream that named two different instances for one branch fails on the set.
  for (const [branch, want] of Object.entries(e.regionEventKeys ?? {})) {
    const got = [...new Set(report.inputs
      .filter((x) => x.kind === 'region' && x.event.branchPath === branch)
      .map((x) => `${(x as { event: { regionId: string } }).event.regionId}@${(x as { event: { regionPath: string } }).event.regionPath}`))].sort();
    check(e.key, `ADR 0062 rule 3: branch ${branch}'s region events all name the instance ${want}`, got, [want]);
  }

  // **W94 — the GATE, from the run's OWN `gated` elements, and no assertion here names a file** (P24 decision 7). Six
  // claims on every row that declares `gate`, and a seventh — the ARRANGEMENT's own effect — on the two that arrange
  // it. Each expected side is the PAYLOAD's (`keys`, `routes`, the file names) or a relation over the run, never a
  // literal naming which file won.
  if (e.gate) {
    const g = e.gate;
    const files = e.payload.files ?? [];
    const gated = report.inputs.filter((x): x is Extract<FoldInput, { kind: 'gated' }> => x.kind === 'gated');
    const itemOf = (bp: string) => Number(bp.split('.')[0]);
    const runId = report.state.runId ?? 'no-run';
    const count = (route: string) => gated.filter((x) => x.route === route).length;
    check(e.key, 'the gate decided ONCE per file, at the declared gate — its route counts, P24 decision 4`s three routes',
      { gates: [...new Set(gated.map((x) => x.gateId))], decisions: gated.length, first: count('first'), duplicate: count('duplicate'), nokey: count('nokey') },
      { gates: [g.node], decisions: files.length, ...g.routes });
    check(e.key, 'exactly ONE `first` per series, across every map instance — the memory is the RUN`s, one per gate (P24 stop-and-ask (a))',
      gated.filter((x) => x.route === 'first').map((x) => String(x.key)).sort(), [...g.keys]);
    check(e.key, 'the branch routed `first` for each series is the FIRST of that series to ARRIVE at the gate — P24 decision 7, read from the run`s own sequence',
      g.keys.filter((k) => gated.find((x) => x.key === k)?.route !== 'first'), []);
    check(e.key, 'the per-series task ran for EXACTLY the branches the gate routed `first`, both ways — derived from the run`s gated elements, never a literal naming a file',
      report.dispatched.filter((id) => parseTaskId(id).nodeId === g.opens).sort(),
      gated.filter((x) => x.route === 'first').map((x) => `${runId}:${g.opens}:${x.branchPath}:0`).sort());
    check(e.key, 'RN-R26: RunState.gated IS the run`s gated fold inputs, in order — the fold`s own copy of every decision',
      report.state.gated.map((d) => [d.gateId, d.branchPath, d.route, d.key ?? null]),
      gated.map((d) => [d.gateId, d.branchPath, d.route, d.key ?? null]));
    // **ADR 0066 rule 1 — what LEFT the gate is what REACHED it**: the per-series worker returns the file NAME it
    // received, which neither the gate's key (`series.id`) nor its settings carry, so a gate that handed on either would
    // leave `openedBy` empty. Compared to the name the PAYLOAD has at the branch the gate recorded, and the series to
    // the key it recorded there — both halves from outside the per-series task.
    // **Every field `identify` returns, against the FILE TABLE at the recorded branch** — the adequacy reader's finding 2:
    // compared on the name and the series alone, a gate handing on the name and the key and nothing else read green in
    // both runtimes, at L1 and in `check:docs`.
    check(e.key, 'ADR 0066 rule 1: what LEFT the gate is what REACHED it — each per-series task received its own branch`s whole identify result, the name neither the key nor the settings carries',
      Object.entries(report.state.nodes).filter(([id]) => parseTaskId(id).nodeId === g.opens).map(([id, n]) => {
        const r = n.result as { series?: unknown; openedBy?: unknown } | null;
        return { id, series: (r as { series?: unknown } | null)?.series, title: (r as { title?: unknown } | null)?.title,
          episode: (r as { episode?: unknown } | null)?.episode, openedBy: r?.openedBy };
      }).sort((a, b) => a.id.localeCompare(b.id)),
      gated.filter((x) => x.route === 'first').map((x) => ({
        id: `${runId}:${g.opens}:${x.branchPath}:0`, series: x.key, title: TV_IDENTIFIED[itemOf(x.branchPath)]?.series?.title,
        episode: TV_IDENTIFIED[itemOf(x.branchPath)]?.episode, openedBy: files[itemOf(x.branchPath)]?.name,
      })).sort((a, b) => a.id.localeCompare(b.id)));
    // **The realm the `from` task ran in — threads on the threaded row, this module's realm on the others** (the adequacy
    // reader's finding 4: the threaded row read green with `threaded: false`, nothing reading what the pool was).
    check(e.key, 'the per-file task before the gate ran in the realm the row asks for — a THREAD on the threaded row',
      [...new Set(Object.entries(report.state.nodes).filter(([id]) => parseTaskId(id).nodeId === g.from).map(([, n]) => (n.result as { realm?: unknown } | null)?.realm))],
      [g.realm]);
    if (g.arranged) {
      const byKey = new Map<string, number[]>();
      for (const x of gated) if (typeof x.key === 'string') byKey.set(x.key, [...(byKey.get(x.key) ?? []), itemOf(x.branchPath)]);
      // **Two halves: the arrangement DID its work, and it made the selection DIFFER.** The branches reached the gate in
      // the order of the files' SIZES — the arrangement's own effect, read from the run's sequence — and, on the LAST-first
      // row, the first to arrive is not the lowest index of any multi-file series. *(The first cut's second half compared
      // the first arrival with the first `identify` DISPATCHED, which rests on seven concurrent downloads settling in
      // index order — a completion order (W94's conformity reader, finding 2). And its adequacy reader (finding 5) found the
      // two wrong selections are ONE here: identify is dispatched per file as its download settles, so within a series the
      // first dispatched IS the lowest index, and this fixture discriminates the two together or not at all.)*
      const bySize = files.map((f, i) => [f.sizeMB, i] as const).sort((a, b) => a[0] - b[0]).map(([, i]) => i);
      check(e.key, 'the ARRANGEMENT`s own effect (Q379) — the branches reached the gate in the order of the files` SIZES, and ' + (g.arranged === 'last-first'
        ? 'so the first to ARRIVE is not the lowest index of any multi-file series'
        : 'so the order IS the index order, the pair`s other half'),
        { notLowest: [...byKey].filter(([, idx]) => idx[0] !== Math.min(...idx)).map(([k]) => k).sort(), arrival: gated.map((x) => itemOf(x.branchPath)) },
        { notLowest: g.arranged === 'last-first' ? TV_MULTI : [], arrival: bySize });
    }
  }

  // **Q32 — every dispatched node produces an outcome record.** Cheap insurance
  // since 0.3.0's `_failOrphanedTask` rather than the validity gate P1 wrote it
  // as, and it is the assertion no fixture can make: it is about the scheduler
  // actually settling what it accepted.
  //
  // **Asserted against the scheduler's own events, not against the driver's
  // record of them.** `report.settled` is built by calling
  // `driver.terminalStateOf`, so an assertion over it alone is an assertion about
  // the code it exists to check — section 5 rule 4, found by W5's test-adequacy
  // pass, which replaced `terminalStateOf` with the constant `'done'` and watched
  // this pass. The two sources must agree, and both must cover every dispatch.
  //
  // **W6 added the exception, and it is a real one rather than a loosening.**
  // `OR-R6` throws at the listener boundary *before* anything is appended, so a
  // task can be dispatched, settle at the scheduler, and have no record here. A
  // row that expects that must SAY which id and why; every other row still
  // expects none, so the assertion did not get weaker.
  const unsettled = report.dispatched.filter((id) => report.settled[id] === null);
  check(e.key, 'Q32: the driver has an effective outcome for every dispatched task, except as declared',
    unsettled, e.unsettled ?? []);
  const unheard = report.dispatched.filter((id) => !report.settledByScheduler.includes(id));
  assertThat(e.key, 'Q32: and the SCHEDULER reported a settlement event for every one of them',
    unheard.length === 0, unheard.length ? `no event seen: ${unheard.join(', ')}` : '');
  check(e.key, 'Q32: the two sources agree on which ids settled',
    [...report.settledByScheduler].sort(), [...report.dispatched].sort());
  // And the two paths through the driver's own data agree on WHAT each settled
  // as: `settled` comes from `effectiveOutcomeOf`, `nodes` from folding the
  // sequence. Without this, replacing `terminalStateOf` with the constant
  // `'done'` survived — because until the `optional-loss` rows existed, **no L6
  // task settled as anything but `done`**, so no assertion could tell a constant
  // from the truth. Found by W5's test-adequacy pass.
  //
  // `running` and `suspended` both mean *not settled*, and `effectiveOutcome`
  // returns `null` for each — for `suspended` because a node parked on a person
  // has not finished and nothing routes (`spec/outcome-record.md` section 7). The
  // mapping is that rule, written out.
  const asTerminal = (st: string | undefined) =>
    st === undefined || st === 'running' || st === 'suspended' ? null : st;
  check(e.key, 'the effective outcome and the folded node state agree, per task',
    report.settled,
    Object.fromEntries(report.dispatched.map((id) => [id, asTerminal(report.state.nodes[id]?.state)])));

  // `ID-R1` at L6 — the only rung where the ids the driver mints reach the
  // scheduler's real task map, which is what `spec/task-id.md` section 2 is about.
  assertThat(e.key, 'ID-R1: every dispatched id is distinct',
    new Set(report.dispatched).size === report.dispatched.length);

  // **ADR 0048 rule 5 at the one rung that runs the DEFAULT `createTask` — W57's rule 8 probe
  // `a3`.** `FyflowScheduler.addTask` duck-types its task: with the driver's default swapped for
  // `(config) => config`, every row here stayed green at 1061 / 0, because a plain object runs to
  // `done` too — with `attempts` left UNDEFINED and `instanceof FyflowTask` false, and nothing
  // here read either. So the two properties the documents already promise are asserted, per row
  // and vacuously true only for a row that dispatched nothing (the cross-row clause below refuses
  // that being every row): every task the scheduler holds is the class's own, and every outcome
  // settlement the scheduler reported carried a numeric `attempts` on its LIVE task object — read
  // at the harness's own listener, because the driver's listener normalises `attempts` and a log
  // record cannot see it (rule 8 probe `a3c` measured that: with the first observer re-sourced,
  // a record-based second one caught nothing). Two observers on two different structures, so
  // re-sourcing either (`a3c`, `a3n`) leaves the other live.
  assertThat(e.key, 'ADR 0048 rule 5: every task the scheduler holds is a FyflowTask the default createTask built',
    report.fyflowTasksHeld === report.tasksHeld, `${report.fyflowTasksHeld} of ${report.tasksHeld}`);
  assertThat(e.key, 'ADR 0048 rule 5, second observer: every settlement the scheduler reported carried a NUMERIC attempts on its live task — a plain object has none',
    report.numericAttemptsSeen === report.settlementsSeen, `${report.numericAttemptsSeen} of ${report.settlementsSeen}`);

  // `RN-R4` — a node in `nodes` was dispatched, and every dispatched node is there.
  check(e.key, 'RN-R4: `nodes` holds exactly the dispatched task ids',
    Object.keys(report.state.nodes).sort(), [...report.dispatched].sort());

  // **ADR 0014's redundancy, checked rather than trusted.** `snapshot()` is
  // defined as the record-kind subsequence of `foldInputs()`; the driver keeps
  // two arrays and a drift between them would be silent.
  const fromInputs = report.inputs
    .filter((x) => x.kind === 'outcome' || x.kind === 'resolution')
    .map((x) => (x as { record: { taskId: string } }).record.taskId);
  check(e.key, 'ADR 0014: snapshot() is exactly the record-kind subsequence of foldInputs()',
    fromInputs, report.log.map((r) => r.taskId));

  if (e.runFailure) {
    // **`kind` and `message` are checked separately**, because
    // `UncloneableResult`'s message began with its own class name until W133
    // ([Q63](../doc/questions/q63.md)) — so a substring over `${kind}: ${message}`
    // was satisfied by the message alone and `RunFailure.kind` was pinned by
    // nothing anywhere in the repository. Nine other refusal classes' messages
    // began with their own name until W140 ([Q533](../doc/questions/q533.md)). And
    // `OR-R6`'s wording is *"fails with UncloneableResult **naming the task
    // id**"*, so the id is the half worth asserting. Found by W6's adequacy
    // reader.
    assertThat(e.key, `OR-R10: exactly one run failure, of kind ${e.runFailure}`,
      report.failures.length === 1 && report.failureKinds[0] === e.runFailure,
      `kinds: ${report.failureKinds.join(', ') || '(none)'}`);
    // **What the message must NAME, declared by the row — W35, and it is a
    // widening that leaves every existing row byte-identical.**
    //
    // `OR-R6`'s wording is *"fails with `UncloneableResult` **naming the task
    // id**"*, and while that was the only refusal L6 reached, the row's own
    // `dispatched` list was the right source. **`FD-R2` names a NODE and a KEY
    // instead** — *"reported as an `UnresolvedMapArity` naming the node and the
    // key"* — because a map's arity is refused before any task of that map exists
    // to be named. A row that declares nothing still asserts its ids; the
    // `uncloneable` row dispatches exactly one, so `some` and `every` are the same
    // assertion there and it did not get weaker.
    // **`?.length ?` and not `??`, and rule 8 is what found it.** With `??` a
    // declared `failureNames: []` made `every` vacuously true, so the row that
    // declares what its message must name could disable the assertion by declaring
    // NOTHING — green, with the check present and asserting no content. Falling
    // back to the ids means an empty declaration asserts the default instead, which
    // the `FD-R2` row fails. *(Probe b3, which was written as a control and was a
    // survivor: `doc/workflow.md` rule 8's requirement that a provocation is
    // evidence only when it fires for the reason it names, read the other way
    // round — a probe declared as costing 0 has to be checked for whether it
    // SHOULD.)*
    // **What a row may DECLARE is derived from its own DEFINITION — W35's adequacy
    // reader, BLOCKING, and it found three spellings of one escape hatch.**
    //
    // `failureNames` was a free list, so the row could weaken the assertion it
    // declares: `['']` passes because every string contains the empty one; dropping
    // `'"rows"'` passes because the remaining name is still there; and `every` ->
    // `some` passes because a correct list agrees with both. All three cost **0**.
    // The `?.length ?` fix that probe `b3` bought closed one spelling of three.
    //
    // Two things close the rest. **The declaration is checked against the
    // definition** — `FD-R2` says the message names *"the node and the key"*, and
    // both are in `e.definition`, so a row cannot declare fewer, blanker or other.
    // And the message assertion is **one per name** rather than one `every` over the
    // list: the quantifier a mutation could weaken no longer exists, and a failure
    // says which name is missing.
    const named = e.failureNames?.length ? e.failureNames : e.dispatched;
    if (e.failureNames) {
      const mapNode = e.definition.nodes.find((n) => n.kind === 'map');
      check(e.key, 'FD-R2: the declared names ARE the node and the key, read from this row`s definition',
        [...e.failureNames].sort(),
        (mapNode ? [JSON.stringify(mapNode.id), JSON.stringify(mapNode.over)] : []).sort());
    }
    // **The rule id stays in the label.** `OR-R6` is the rule for a row that names
    // its own task id and `FD-R2` for one that declares what its message must name;
    // one version of this label dropped both and printed the ERROR CLASS, so the
    // `uncloneable` row read *"UncloneableResult: and its message names the task
    // id"* and cited no rule at all. W35's conformity reader.
    for (const s of named) {
      assertThat(e.key,
        e.failureNames ? `FD-R2: and its message names ${s}` : `OR-R6: and its message names ${s}`,
        report.failures.length === 1 && report.failures[0]!.includes(s),
        report.failures.join('; ') || '(none reported)');
    }
  } else {
    // **`onRunFailure` only, since W17.** The two callbacks used to share this
    // array, which was harmless while no shipped policy could return
    // `unsatisfiable` — and would have made this assertion unsatisfiable itself on
    // the one row where one does. They report different things:
    // `spec/join-policy.md` section 4 has the driver report an unsatisfiable join
    // and invent no run-level outcome, where a refusal **stops** the run and
    // `RN-R8` makes it `stopped`. The other half is the unconditional check below.
    assertThat(e.key, 'no run failure was reported',
      report.failures.length === 0, report.failures.join('; '));
  }

  // **Which event satisfied the join — W17.** `spec/join-policy.md` section 4 asks
  // the policy after every terminal event; this reads which one it was, as the
  // last `region` element before `joinSettled` in the sequence the driver produced
  // (ADR 0014). Declared only where the row ARRANGES a determinate order — see
  // `Expectation.joinSettledBy` for what happens to `exit-last` and
  // `optional-loss` when that arrangement is reversed and nothing checks it.
  //
  // **The `joinSettled` anchor is insurance and cannot currently fail**, measured:
  // reading the last region event of the whole sequence instead gives the same
  // answer on every row, because no shipped policy can settle a join while a
  // branch is still live — all three require the live count at zero or every
  // branch arrived — so nothing follows `joinSettled` in a region's stream. The
  // anchor is still the correct reading and it costs nothing; it is named here so
  // it is not mistaken for something the gate holds down.
  if (e.joinSettledBy) {
    const at = report.inputs.findIndex((x) => x.kind === 'joinSettled');
    const before = report.inputs.slice(0, at < 0 ? 0 : at)
      .filter((x) => x.kind === 'region')
      .map((x) => (x as { event: { type: string } }).event.type);
    check(e.key, 'spec/join-policy.md section 4: which terminal event satisfied the join',
      before[before.length - 1] ?? null, e.joinSettledBy);
  }

  // **What the driver reported about a dead join — W17, and it runs on EVERY row.**
  //
  // `spec/join-policy.md` section 4: on `unsatisfiable` the driver reports it with
  // the policy's own `describe` and routes nowhere. Asserted as the whole list
  // rather than as a count, so it pins three things at once — that the callback
  // fired exactly once, that it named this region's fanout and join, and that the
  // policy's own account of WHY reached the caller.
  //
  // **Run on every row, and the empty case is load-bearing TODAY — which is not
  // what this comment said until both of W17's readers falsified it.**
  //
  // It read *"on the other sixteen it is insurance rather than a test … the
  // current system cannot falsify it"*. Three measurements say otherwise:
  //
  //   - adding `onUnsatisfiableJoin?.({…})` to the driver's **satisfied** path as
  //     well as its unsatisfiable one is **caught, 11 failures** — ten of them
  //     this check firing on rows that have no cross-row assertion at all;
  //   - on `p1-routed-away LOW / ltra` it is not the empty case and it is a test:
  //     remove it and the item's headline mutation, deleting the `arrived`
  //     increment, drops from six catches to five;
  //   - making it conditional on `e.unsatisfiable` costs **16 failures** against
  //     the per-row assertion floor, not zero.
  //
  // The true and narrower claim is that no shipped **policy** can make it
  // non-empty on the other rows. A **driver** defect can, and that is the shape a
  // per-row check exists for.
  check(e.key, 'spec/join-policy.md section 4: what the driver reported about an unsatisfiable join',
    report.unsatisfiableJoins, e.unsatisfiable ?? []);

  // **RN-R12, checked rather than assumed.** A terminal outcome means no more
  // input is coming; an input that arrives after the run was declared finished
  // means the predicate was read at a point that was not quiescent. W5's own
  // mutation sweep found that removing the microtask boundary survived every
  // other assertion here, because `scheduler.shutdown()` happened to take long
  // enough to hide it.
  assertThat(e.key, 'RN-R12: nothing arrived after the run was declared finished',
    report.lateInputs.length === 0, `late: ${report.lateInputs.join(', ')}`);

  // **An outcome the run passed THROUGH.** `awaiting_action` is durable — a
  // branch parked on a person — but a run that is then resolved ends
  // `completed`, so the final state does not record that it happened. Asserted
  // as an inclusion only; see `RunReport.outcomesSeen` for why an exclusion
  // would not be sound.
  for (const want of e.outcomesSeen ?? []) {
    assertThat(e.key, `the run passed through \`${want}\` on its way to ${e.outcome}`,
      report.outcomesSeen.includes(want as RunOutcome),
      `saw: ${report.outcomesSeen.join(', ')}`);
  }
  // The human actually acted. Without this the row would pass if the branch
  // suspended and the resolution silently never fired — the run would then hit
  // the backstop, but `finishedBy` is the only thing that would say so.
  check(e.key, 'the inbound step resolved exactly the branches the row declares',
    [...report.resolved].sort(),
    Object.entries(e.resolveOnSuspend ?? {}).map(([b, how]) =>
      buildTaskId(`r${i + 1}`, how.at, branchIndices(b), 0)).sort());

  // **And every resolved id is one this row DISPATCHED, from the hand-written
  // list** — W23's conformity reader, `doc/workflow.md` section 5 rule 4.
  //
  // The assertion above derives its expected id with `buildTaskId` over
  // `branchIndices`, and `run-flow.ts` mints the actual id with the **same two
  // functions** — so a common-mode defect in either satisfies it. `e.dispatched`
  // is the row's own literal, written by hand from `spec/task-id.md` before
  // anything ran, and it is the only genuinely independent derivation of these
  // ids anywhere in this file. Comparing against it costs one line and removes
  // the common mode.
  // **What the DRIVER said, against what the ROW declared** — two sources for the
  // node a branch parks at, and W23's adequacy reader found there was one.
  // Substituting the row's own value for the event's in `run-flow.ts` cost 0
  // failures until this existed; a driver emitting the wrong `at` went from 5
  // failures to 0 with that swap in place.
  for (const [path, how] of Object.entries(e.resolveOnSuspend ?? {})) {
    check(e.key, `branch.suspended for ${path} named the node the row declares`,
      report.suspendedAt[path], how.at);
  }
  for (const id of report.resolved) {
    assertThat(e.key, `the resolved id ${id} is one this row dispatched`,
      e.dispatched.includes(id),
      `resolved ${id}; dispatched ${e.dispatched.join(' ')}`);
  }

  // **`FD-R4` on real workers — W73, P19 decision 5.** A row declaring `refuseAtStart` asserts the refusal
  // by CLASS, boundary and the node it names, that the scheduler held NOTHING at that moment, and that the
  // message names the schema kind and the rule; a row declaring `refusedFirst` on a resolution asserts the
  // set of refused task ids equals the set it declares (both ways) and each refusal's class and message.
  if (e.refuseAtStart) {
    check(e.key, 'FD-R4 at start: a BoundaryRefused naming the task node the row declares, at the start boundary',
      [report.startRefusal?.name, report.startRefusal?.boundary, report.startRefusal?.nodeId], ['BoundaryRefused', 'start', e.refuseAtStart.node]);
    assertThat(e.key, 'and the SCHEDULER held nothing when it was thrown — nothing was dispatched for the refused payload',
      report.startRefusal?.dispatchedThen === 0, `tasks held: ${report.startRefusal?.dispatchedThen}`);
    assertThat(e.key, 'and the message names the inputSchema and FD-R4, so the caller reads the VALUE and not the flow',
      (report.startRefusal?.message ?? '').includes('inputSchema') && (report.startRefusal?.message ?? '').includes('FD-R4'),
      report.startRefusal?.message ?? '(no refusal)');
  }
  if (refusedFirstCount(e) > 0) {
    const declaredRefused = Object.entries(e.resolveOnSuspend ?? {})
      .filter(([, how]) => how.refusedFirst !== undefined)
      .map(([b, how]) => buildTaskId(`r${i + 1}`, how.at, branchIndices(b), 0)).sort();
    check(e.key, 'FD-R4 at resolve: exactly the resolutions the row declares refused-first were REFUSED, both ways',
      [...report.refusedResolutions].sort(), declaredRefused);
    for (const id of declaredRefused) {
      const err = report.refusedResolutionErrors[id];
      assertThat(e.key, `and ${id}'s refusal is a BoundaryRefused naming the outputSchema, with the task still suspended for the second attempt`,
        err?.name === 'BoundaryRefused' && err.message.includes('outputSchema') && err.message.includes('still suspended'),
        err ? `${err.name}: ${err.message.slice(0, 160)}` : '(not refused)');
    }
  }

  // **`branchesOverlapped` is REPORTED and not asserted, deliberately.** Whether
  // two branches are in flight at the same instant is a timing property the spec
  // does not fix, and W5 measured it varying run to run on the same machine — so
  // asserting it would be a test that flakes in CI and nowhere else, which
  // `doc/workflow.md` section 5 rule 5 forbids for exactly this reason. It is a
  // column in the table below instead, and the cost is named in the Record: the
  // `threaded` and `delayMs` knobs have no assertion behind them.

  // **What ADR 0046 says this run's driver is still holding, and what it recorded on
  // the way — W55, and it is P15's exit artifact stated as a RELATION.**
  //
  // The two numbers are derived from the row's own `joined`, `settled` and
  // `stoppedBy` and from the decision's rules; **nothing here reads a byte count**,
  // because a footprint is a property of one run on one machine
  // ([Q179](../doc/questions/q179.md)) and the rule is about *which structures hold a
  // result, and for how long*. The bytes are printed by `examples/retention.ts`.
  //
  // **This is the rung [Q214](../doc/questions/q214.md) said could not exist.** Before
  // this item, reverting ADR 0046 rule 3 — the two `releaseArrivals` calls — cost
  // **0** L6 failures and 8 at L1-L5, measured on the tree this item started from:
  // a whole structure leaving the driver was invisible to a rung made of runs,
  // because nothing a run REPORTS changes when it goes. The Record carries what it
  // costs now.
  check(e.key, 'ADR 0046 — when the run was over the driver held exactly the arrivals whose join ' +
    'never became terminal, and nothing else',
    report.retention.endEntries, heldWhenOver(e));
  check(e.key, 'ADR 0046 rule 4 — and it had recorded one entry per branch that arrived, and none ' +
    'after a join became terminal',
    report.retention.peakEntries, arrivedInRun(e));
  // The row's declared extras, derived from the expectation rather than typed, so
  // adding an optional assertion to a row updates the floor along with it.
  const extras = (e.outcomesSeen?.length ?? 0)
    + (e.outcomesNotSeen?.length ?? 0)
    + Object.keys(e.branchEvents ?? {}).length
    + Object.keys(e.nodeResults ?? {}).length
    + (e.pathEnds ? 1 : 0)
    // **The run-failure block is no longer a fixed two.** It is the kind assertion,
    // one per name the message must carry — the row's own `failureNames` if it
    // declares them, its `dispatched` ids if it does not — plus one for the check
    // that the declaration is what `FD-R2` owes. W35's adequacy reader.
    // (The KIND assertion is in the per-row base, which is why this counts only
    // the message assertions and the declaration check.)
    + (e.runFailure ? (e.failureNames?.length ? e.failureNames.length + 1 : e.dispatched.length) : 0)
    + (e.regionSuspended ? 1 : 0)
    + Object.keys(e.otherRegions ?? {}).length * 2
    + Object.keys(e.resolveOnSuspend ?? {}).length * 2
    // W73: three per declared `refuseAtStart`; one set comparison plus one per resolution declaring `refusedFirst`.
    + (e.refuseAtStart ? 3 : 0)
    + (refusedFirstCount(e) > 0 ? 1 + refusedFirstCount(e) : 0)
    + (e.joinSettledBy ? 1 : 0)
    // *(`unorderedDispatch` bought two here until W98 retired it: the dispatch comparison is THREE clauses on EVERY row
    // now — the set, the pairs the run FIXES, and the control that the run fixed one — and all three are in the base.)*
    + (e.stoppedBy !== undefined ? 1 : 0)
    // W133: the exactly-once clause, on the row that declares it.
    + (e.stoppedByNamesItOnce ? 1 : 0)
    // W58: two observers per declared `attempts`, and a sequence plus an ordering per
    // declared `resourceEvents` — derived from the expectation like every other extra here.
    + Object.keys(e.attempts ?? {}).length * 2
    + Object.keys(e.resourceEvents ?? {}).length * 2
    // W59: one per declared `heldGroups` id — derived from the expectation like the two above.
    + Object.keys(e.heldGroups ?? {}).length
    // W67: one per declared `poolOfTask` id — the same shape.
    + Object.keys(e.poolOfTask ?? {}).length
    // W63: two observers per declared `taskErrors` id — the record's error and the live task's.
    + Object.keys(e.taskErrors ?? {}).length * 2
    // W133: one per declared `records` id.
    + Object.keys(e.records ?? {}).length
    // **W82: the report's id SET, plus two per declared finding — its text and the node/type/worker
    // it names.** Derived from the expectation like every other extra here, so declaring a finding
    // moves the floor with it.
    + (e.nonconforming !== undefined ? 1 + Object.keys(e.nonconforming).length * 2 : 0)
    // W82: two per declared `settledOwnKeys` id — the live result's own keys, and that the RECORD
    // carries strictly fewer of them.
    + Object.keys(e.settledOwnKeys ?? {}).length * 2
    // W82: the LOG-DERIVED report and its TWO controls, on a row that asks for the check — the walk's
    // REACH and that it reached strictly more than the report names, which is what the adequacy
    // reader's findings 1 and 2 bought. Derived from the expectation like every other extra here, so
    // declaring `checkResults` moves the floor with it.
    + (e.checkResults === true ? 3 : 0)
    // **`JP-R12`'s SECOND-COPY claim, and only where there is something to be a copy
    // of.** A row that records no arrival would assert `0 === 0`, which is the
    // vacuity `doc/workflow.md` section 5 rule 3 refuses — so it is an extra derived
    // from the row's own `settled`, and declaring an arrival moves the floor with it.
    + (arrivedInRun(e) > 0 ? 1 : 0)
    // W55's adequacy reader: the region NAMES behind the count, on the rows that hold.
    + (heldWhenOver(e) > 0 ? 1 : 0)
    // **W86: two per declared region INSTANCE** — its join's verdict and how each of its branches
    // left it — derived from the expectation like every other extra here, so declaring an instance
    // moves the floor with it. An opener with N instances costs 2N and `otherRegions`' 2-per-region
    // is untouched, because the two fields answer different questions.
    + Object.values(e.regionInstances ?? {}).reduce((n, byPath) => n + Object.keys(byPath).length * 2, 0)
    // W86: one per declared `regionEventKeys` branch — ADR 0062 rule 3 at this rung.
    + Object.keys(e.regionEventKeys ?? {}).length
    // W94: seven gate claims on a row that declares `gate` (six, and the realm since the readers), and the arrangement's own
    // effect where it declares one.
    + (e.gate ? 7 + (e.gate.arranged ? 1 : 0) : 0);
  if (arrivedInRun(e) > 0) {
    // **The OTHER side's size is in the assertion, and it has to be** — W55's
    // adequacy reader, BLOCKING. `peakAliasingLog` is the size of an intersection,
    // so `0` is what a real second copy gives AND what an empty observer gives:
    // measured, `loggedResults` returning `[]` cost **zero** and left these
    // twenty-six assertions comparing against an empty `Set`. Asserting the pair
    // makes the sensor's own reach part of the claim, which is obligation (c)'s
    // LIMIT — *a sensor cannot corroborate itself*.
    check(e.key, 'JP-R12 — and what it collected is a SECOND COPY: no held value is the log ' +
      'record`s own result object, on real workers — and the log had results to compare against',
      { aliasing: report.retention.peakAliasingLog, logHadResults: report.retention.loggedResults > 0 },
      { aliasing: 0, logHadResults: true });
  }
  // **WHICH region is holding, not just how many entries** — W55's adequacy reader.
  // `endByRegion`'s per-region shape was unbound: only the sum is read anywhere, so
  // collapsing it to one aggregate key cost zero. On a row that holds, the region
  // named is the one whose join never became terminal, and the row declares which.
  if (heldWhenOver(e) > 0) {
    check(e.key, 'ADR 0046 rule 5 — and it names WHICH region is still holding: the one whose ' +
      'join never became terminal',
      Object.keys(report.retention.endByRegion).sort(), regionsStillLive(e));
  }
  rowCosts.push([e.key, e.regionId === null ? 'no-region' : 'region',
    passed + failures.length - before, extras]);
}

// --- cross-row assertions, which are where the finding lives -------------------

/**
 * **Every row produced a report, asserted BEFORE anything indexes `reports`** —
 * W43, rule 8 obligation (e).
 *
 * Emptying the loop above (`for (const [i, e] of [].entries())`) used to reach the
 * cross-row block with `reports` empty and die inside `settledOf` with
 * *"Cannot read properties of undefined (reading 'state')"* — loud, at exit 1, and
 * naming a helper rather than the wiring. [Q138](../doc/questions/q138.md): a crash
 * is not a detection, because it cannot tell a fired clause from a broken harness.
 * The assertion-count floors further down would have caught it and never ran.
 *
 * **It is placed here rather than beside those floors** for the same reason: this
 * is the first line that would read `reports[...]`, so it is the last point at
 * which the failure can still be described.
 */
check('cross-row', 'every EXPECTED row produced a report — the loop above ran at all',
  reports.length, EXPECTED.length);
// **And it STOPS here rather than reporting and continuing**, which is the half
// that makes it a detection instead of a crash. Reporting alone left the run to
// reach `reports[i]!` two hundred lines down and die with *"Cannot read properties
// of undefined (reading 'state')"* — so the file printed a correct diagnosis and
// then a stack trace that buried it. **Every assertion below reads `reports`, so
// past this point they are claims about a tree that is not there** — which is
// [W31](../doc/work-items/w31-the-self-list-check-policies-never-had.md)'s finding
// exactly: a whole pass can measure its own harness rather than its subject.
if (reports.length !== EXPECTED.length) {
  console.log('\n' + failures.map((f) => `  FAIL  ${f}`).join('\n\n') + '\n');
  exit(1);
}

const byRun = (prefix: string) => reports.find((r) => r.runId === prefix);
const low = byRun('r5');
const lowAc = byRun('r6');
const highRouted = byRun('r3');

if (low && lowAc) {
  // **ADR 0015's motivating claim, asserted rather than argued.** The two runs
  // are the same flow, the same payload and the same workers; `regions` apart
  // from `joined` is identical, and only `joined` — and therefore the outcome —
  // differs. Q43's register entry said `regions` already held the data to tell
  // them apart. This is the assertion that says it did not.
  check('cross-row', 'RN-R6: the two policies agree on WHAT HAPPENED in the region',
    { opened: soleRegion(low.state, 'split')?.opened, settled: soleRegion(low.state, 'split')?.settled },
    { opened: soleRegion(lowAc.state, 'split')?.opened, settled: soleRegion(lowAc.state, 'split')?.settled });
  check('cross-row', 'RN-R11: and disagree only on whether the driver routed out of the join',
    [soleRegion(low.state, 'split')?.joined, soleRegion(lowAc.state, 'split')?.joined], [true, null]);
  assertThat('cross-row',
    'ADR 0015: at spec/run-state.md v0.2 both of these folded to completed; they no longer do',
    low.state.outcome === 'completed' && lowAc.state.outcome === 'stuck',
    `${low.state.outcome} / ${lowAc.state.outcome}`);

  // Q41's own point: the sequence exists and carries the kinds nothing produced.
  const kinds = new Set(lowAc.inputs.map((i) => i.kind));
  assertThat('cross-row', 'Q41: the sequence carries pathEnded, which had no producer anywhere',
    kinds.has('pathEnded'), `kinds seen: ${[...kinds].sort().join(', ')}`);
  assertThat('cross-row', 'Q41: and dispatched, which had no channel at all',
    kinds.has('dispatched'));
}

// The predicate has to be able to return both answers, or the routed-away rows
// prove only that a constant is constant (`doc/workflow.md` section 5 rule 3).
//
// **`['-']` by hand rather than through `soleRegion`, and the reason is stated** —
// W84's conformity reader, finding 15. `split` in this flow is a top-level `fanout`,
// so its one instance is `'-'` DERIVED FROM THE DOCUMENT and written here as a
// literal; `soleRegion` would answer the same and would also silently accept a
// second instance by returning `undefined`, which this block's `===` would read as
// *not arrived*. The literal is the stronger reading here because the claim is about
// the PREDICATE and not about the region.
assertThat('cross-row', 'isLowConfidence returned FALSE at 0.9 and TRUE at 0.1 — it can fail',
  highRouted?.state.regions['split']?.['-']?.settled['1'] === 'arrived' &&
    low?.state.regions['split']?.['-']?.settled['1'] === 'exited',
  `high: ${highRouted?.state.regions['split']?.['-']?.settled['1']}, ` +
  `low: ${low?.state.regions['split']?.['-']?.settled['1']}`);

// --- W17's cross-row block: one run, three policies, three different answers ----
//
// **ADR 0025's motivating claim asserted rather than argued**, the way the r5/r6
// block above does it for ADR 0015. The three runs are the same flow, the same
// payload and the same workers, and they emit the same six region events; what
// differs is only what the policy makes of them. Read one row at a time this is
// three outcomes; read together it is the decision.
const aeLt = byRun('r14');
const aeAc = byRun('r15');
const aeLtra = byRun('r16');
if (aeLt && aeAc && aeLtra) {
  const AE_RUNS = [aeLt, aeAc, aeLtra];
  // `RN-R6` again, and the same point Q43's register entry got wrong: `regions`
  // records WHAT HAPPENED, and all three policies agree about that completely.
  check('cross-row', 'RN-R6: all three policies agree on what happened in the region',
    AE_RUNS.map((r) => ({
      opened: soleRegion(r.state, 'split')?.opened, settled: soleRegion(r.state, 'split')?.settled,
    })),
    AE_RUNS.map(() => ({ opened: ['0', '1'], settled: { 0: 'exited', 1: 'exited' } })));
  // `RN-R11`, and the three values are three different things: the join fired, the
  // join is still waiting, the join was reported dead. Only the middle one is
  // silent.
  check('cross-row', 'RN-R11: and disagree only on whether — and whether they can SAY — the join fired',
    AE_RUNS.map((r) => soleRegion(r.state, 'split')?.joined ?? null), [true, null, false]);
  // **The whole of ADR 0025 in one line.** The run that completes under the
  // blessed policy is the run that is reported dead under the third one, and the
  // one in the middle is `stuck` with nobody told.
  check('cross-row', 'ADR 0025: the same run completes, hangs silently, and is reported dead',
    AE_RUNS.map((r) => r.state.outcome), ['completed', 'stuck', 'stuck']);
  // And only one of the three said anything at all. `arrival-count` is
  // structurally unable to (section 3), `live-token` was left byte-identical by
  // ADR 0025, and the third is the only shipped policy that can return the value.
  check('cross-row', 'ADR 0025: and exactly one of the three told the caller why',
    AE_RUNS.map((r) => r.unsatisfiableJoins.length), [0, 0, 1]);
}

// **ADR 0025's other half: the refinement is `live-token` plus one clause.**
//
// r5 and r17 are the same flow, the same payload and the same policy *up to* that
// clause, on the shape where a branch does arrive — so every field of the region
// must agree, and the outcome with it. If they ever diverge here, the third policy
// has stopped being a refinement of the second and ADR 0025's argument has gone
// with it.
const raLt = byRun('r5');
const raLtra = byRun('r17');
if (raLt && raLtra) {
  check('cross-row', 'ADR 0025: where a branch ARRIVES, the refinement is live-token exactly',
    { joined: soleRegion(raLtra.state, 'split')?.joined, settled: soleRegion(raLtra.state, 'split')?.settled,
      outcome: raLtra.state.outcome, reported: raLtra.unsatisfiableJoins.length },
    { joined: soleRegion(raLt.state, 'split')?.joined, settled: soleRegion(raLt.state, 'split')?.settled,
      outcome: raLt.state.outcome, reported: raLt.unsatisfiableJoins.length });
}

// **Every shipped policy is exercised by at least one row — W17.**
//
// This is the forcing function `Expectation.policyId`'s type was believed to be
// and is not: a literal union is a subset of `PolicyId`, so `POLICIES` gaining a
// member left `typecheck:examples` and both L6 runtimes green with a policy no row
// here runs. W16 measured that, and an assertion is what closes it — `JP-R9`'s
// shape one rung up, comparing the two halves instead of copying one.
check('cross-row', 'JP-R9 at L6: every policy in POLICIES is exercised by at least one row',
  [...new Set(EXPECTED.map((e) => e.policyId))].sort(), Object.keys(POLICIES).sort());

// **And on every join verdict it can reach — W17's adequacy reader defeated the
// line above.**
//
// A set over `policyId` is satisfied by a row that RUNS a policy without
// discriminating on it. Measured: deleting `p1-routed-away LOW / ltra` — the row
// this item added *because* the third policy's clause was exercised in one
// direction only — leaves the assertion above **green**, because the `all-exit`
// row still names the policy. The forcing function was over the policy set and
// not over the shapes each policy is told apart on.
//
// The expected values are `spec/join-policy.md` section 3 read as a claim about
// **reachable verdicts**, one row of that table each, and they are three
// different claims rather than three spellings of one:
//
//   arrival-count                 satisfied or waiting. **Never `unsatisfiable`**
//   live-token                    satisfied or waiting. **Never `unsatisfiable`**
//   live-token-requiring-arrival  all three — it is the only policy that can
//                                 report a join dead, and a suite that never sees
//                                 it say `satisfied` has not told it from a
//                                 policy that always says `unsatisfiable`
//
// `RN-R11` maps those onto `regions[…].joined`: `true` where the driver routed
// out, `null` where the join is still waiting, `false` where a policy reported it
// dead. Rows with no fan-out are excluded — they have no region to carry a
// verdict.
const verdictsPerPolicy = Object.fromEntries(
  Object.keys(POLICIES).map((id) => [
    id,
    [...new Set(EXPECTED.filter((e) => e.policyId === id && e.regionId !== null)
      .map((e) => JSON.stringify(e.joined ?? null)))].sort(),
  ]),
);
check('cross-row', 'and on every join verdict spec/join-policy.md section 3 lets it reach',
  verdictsPerPolicy, {
    'arrival-count': ['null', 'true'],
    'live-token': ['null', 'true'],
    'live-token-requiring-arrival': ['false', 'true'],
  });

/**
 * **L6 runs a MAP shape, and these five are what say so — W35**, written from
 * [W23](../doc/work-items/w23-a-nested-flow-on-real-workers.md)'s finding rather
 * than after repeating it.
 *
 * That item's adequacy reader measured that its four nested rows could be deleted,
 * `DECLARED_TOTAL` edited to match, and L6 was **green at 388** with every check
 * passing — P7's exit artifact held down by a number a human writes. **P10's exit
 * artifact is in exactly that position**, and the rows above are worth more to
 * delete: they are the only place in the repository where the number of tasks a run
 * dispatches is not written down anywhere in the run's inputs.
 *
 * **Each clause names a different thing that would be gone**, and none is
 * satisfiable by another's presence:
 *
 *   1. a `map` node runs here **at all** — the declaration side;
 *   2. a map region opened **more than one** branch, which is the whole feature: at
 *      N = 1 a map is a sequence with extra vocabulary;
 *   3. one opened **none**, which `FD-V9`'s arity floor makes unreachable for a
 *      `fanout` and is therefore the one arity only this feature has;
 *   4. one was dispatched at a **dotted** path — a run-time arity inside a region,
 *      which W23's own dotted-path clause cannot tell from a `fanout`'s, since it
 *      asks only whether some id has a dot;
 *   5. a join carried **three or more** branches back downstream. No `fanout` in
 *      this file declares three branches, so a three-key collection cannot be
 *      produced by the static feature at all — which is what makes the number a
 *      bound rather than a magic constant.
 *
 * **Read from `reports` rather than from `EXPECTED` wherever the claim is about the
 * RUN.** Clause 1 is about what this file declares and reads the definitions;
 * 2-5 are about what a real scheduler did and read the folded state, so a row that
 * declared a map and was never dispatched satisfies one of the five and fails four.
 *
 * **They sit HERE, above the derived-total check, and that was a measurement.**
 * Written below it they were green in the same place — and `CROSS_ROW` counts only
 * the cross-row assertions that run **before** that check, so everything after it
 * is held down by `DECLARED_TOTAL` alone: one floor rather than two, and the one
 * that a person edits when a count moves. **Seven** assertions are in that position
 * today — W23's two dotted-path clauses, its three printed-table clauses (one of
 * which is a two-iteration loop) and W19's two foreign-list clauses — and these five
 * were nearly the eighth through the twelfth. *(This read "twelve", counting these
 * five as if they had stayed below the check, in the paragraph explaining that they
 * were moved above it. W35's conformity reader.)*
 * [Q170](../doc/questions/q170.md).
 */
{
  const mapRegionsOf = (d: FlowDefinition) => d.nodes.filter((n) => n.kind === 'map').map((n) => n.id);
  const mapRegions = EXPECTED.flatMap((e, i) =>
    mapRegionsOf(e.definition).map((id) => [reports[i]!, id] as const));
  const settledOf = (r: RunReport, id: string) => Object.keys(soleRegion(r.state, id)?.settled ?? {});
  check('cross-row', 'L6 runs a `map` — the node kind P10 added, and the second one there is',
    EXPECTED.some((e) => mapRegionsOf(e.definition).length > 0), true);
  // **The negative control, and without it four of the five clauses are about
  // REGIONS rather than about maps — W35's adequacy reader, BLOCKING.** Swapping
  // this filter to `'fanout'` cost **1** and widening it to both kinds cost **0**:
  // the pre-W35 fanout corpus satisfies *runs at all*, *opened more than one*, *a
  // dotted path* and *a three-key collection* by itself. The filter is the only
  // thing making the block about a map, and nothing was pointed at it — which is
  // this item's own lesson from W34 restated: a negative control must sit on the
  // expression the mutation changes.
  check('cross-row', 'and `mapRegionsOf` is about `map` and not about regions — its negative control',
    mapRegionsOf(FJ), []);
  assertThat('cross-row', 'and one map region opened MORE than one branch — an arity in no definition',
    mapRegions.some(([r, id]) => settledOf(r, id).length > 1));
  assertThat('cross-row', 'and one opened NONE — the arity FD-V9`s floor makes a fanout unable to reach',
    mapRegions.some(([r, id]) =>
      soleRegion(r.state, id) !== undefined && settledOf(r, id).length === 0 && r.state.outcome === 'stuck'));
  assertThat('cross-row', 'and one map instance ran at a DOTTED path — a run-time arity inside a region',
    mapRegions.some(([r, id]) => settledOf(r, id).some((p) => p.includes('.'))));
  assertThat('cross-row', 'and a join carried THREE branches back downstream — JP-R12 above any declared arity',
    reports.some((r) => Object.values(r.state.nodes).some((n) => {
      const jp = (n.result as { joinPayload?: unknown } | null | undefined)?.joinPayload;
      return typeof jp === 'object' && jp !== null && Object.keys(jp).length > 2;
    })));
}

/**
 * **The rows this file runs, DECLARED — W35's adequacy reader, BLOCKING, and it is
 * [W23](../doc/work-items/w23-a-nested-flow-on-real-workers.md)'s finding
 * reproduced on the item written to prevent it.**
 *
 * That reader deleted W23's four nested rows, edited `DECLARED_TOTAL` to match, and
 * L6 was green at 388 with P7's exit artifact gone. W35 answered with five cross-row
 * clauses — and this reader then deleted **W35's own five rows**, the cross-row block
 * with them, and edited **two** numbers: `DECLARED_TOTAL` 605 to 489 and `CROSS_ROW`
 * 18 to 13. **Cost: 0.** *A layer whose floor is a second number a human writes is
 * not a second floor.* Each of the five rows is separately deletable the same way,
 * and two of those deletions make a `src/` revert this item measured at **5** and
 * **1** failures cost **0** again.
 *
 * So the rows are named. `S12`'s shape one rung down: **set equality AND order**, not
 * a count — a swapped row fails where a floor passes, and a deleted row fails
 * **naming itself** rather than moving a total. Deleting a row is still possible and
 * is now an edit that says in the diff which artifact left.
 *
 * **It is deliberately not derived from `EXPECTED`.** A list derived from the thing
 * it bounds is [Q102](../doc/questions/q102.md)'s shape and W30's `GRADED_IDS`
 * finding: *the authority was the artefact and the scope was a literal with nothing
 * beyond it.* This IS the literal, and the clause below it is what stands outside.
 */
const ROW_KEYS: readonly string[] = [
  'fanout-join / live-token',
  'fanout-join / arrival-count',
  'p1-routed-away high / live-token',
  'p1-routed-away high / arrival-count',
  'p1-routed-away LOW / live-token',
  'p1-routed-away LOW / arrival-count',
  'optional-loss / live-token',
  'optional-loss / arrival-count',
  'failure-edge / routes on',
  'suspend / resolve / resume',
  'suspend / nobody comes',
  'exit-last / join fires on exit',
  'uncloneable / OR-R6',
  'all-exit / live-token',
  'all-exit / arrival-count',
  'all-exit / live-token-requiring-arrival',
  'p1-routed-away LOW / live-token-requiring-arrival',
  'nested HIGH / live-token',
  'nested LOW / live-token',
  'nested LOW / live-token-requiring-arrival',
  'nested / a person resolves a branch at a dotted path',
  'map / live-token',
  'map / arrival-count',
  'map / N = 0',
  'nested-map / live-token',
  'map / FD-R2 — over names no array',
  'map / one item, two instances — ADR 0037 rule 1',
  'map-with-context / Q166 — a map instance sees the run',
  'map-over-region-output / Q165 — a map over what a join collected',
  'decision-on-an-earlier-step LOW / Q8 — the predicate reads its edge',
  'decision-on-an-earlier-step HIGH / Q8 — the default edge',
  'map-with-context / a SECOND run config — the key is read, not guessed',
  'reference-if-it-ran LOW / FD-C4 — the key is THERE',
  'reference-if-it-ran HIGH / FD-C4 — the key is ABSENT, and the run completes',
  'map-past-a-decision LOW / FD-C4 — the array RESOLVES',
  'map-past-a-decision HIGH / FD-C4 — the array is `[]`, and the run is stuck',
  'sibling-fanouts / ADR 0044 — a run that used to STOP',
  'sibling-map-fanout / ADR 0044 — three items, two branches, all three seen',
  'retry / a task fails ONCE and the scheduler retries it — attempts is 1, per instance',
  'group / a task blocked behind a ConcurrentLimitGroup(1) the harness holds, then released',
  'typed / two nodes of ONE type with DIFFERENT settings — the envelope, the type`s retry, the type`s group',
  'typed-regions / a typed task inside a fanout branch feeding a typed map branch at arity three',
  'transformed / arity TWO — the join`s typed successor receives $sum([*.score]) over both branches, and NO reshaping node',
  'transformed / arity ONE — a branch routed away (P1`s case), the successor receives the one score and not an array',
  'transformed / arity ZERO — a join nothing reached fires with {} under live-token, and the successor receives 0 rather than undefined',
  'transform-fails / a transform FAILS at run time on two non-optional nodes (T2002, UNBOUND) — parked as user_action, resolved by a person, the run completes',
  'triage LOW / P18`s sample from two documents — a class type on a NAMED instance, a document type on its DEFAULT',
  'triage HIGH / the control — one payload field different, and the NAMED instance is never dispatched',
  'nonconforming — eleven words',
  'nonconforming — two words (the control)',
  'fan-out-per-item / P22 — a map whose branch opens a MAP, two instances of one opener, overlapping',
  'fan-out-per-item / ONE item (the control) — one instance, so no two of them ever hold at once',
  'tv-ingest / arranged LAST-first — the last file of each series reaches the gate first, so the first to ARRIVE is neither the lowest index nor the first dispatched',
  'tv-ingest / arranged FIRST-first (the pair) — the same files in index order, so a DIFFERENT file opens each series and the count is the same',
  'tv-ingest / threaded, equal work — the pool decides the order and exactly one file per series still opens it',
  'ui-emitted / P26 — a flow a UI could have emitted: an EMPTY predicate registry, a declared group, and a reshaping step with no code',
  'ui-emitted / the SAME document at a lower confidence — `weak` is FALSE, so the `any` group`s second member routes it to publish',
  'ui-emitted / ONE item — `weak` is still TRUE and the `all` group`s SECOND member is what routes it to publish',
  'ui-emitted / low scores — remediate`s OWN declared decision routes it to a second `end`, on the value its transform produced',
  'ui-emitted-named / the SAME flow with the group replaced by a REGISTERED NAME — one predicate registered, and the routing is identical to A',
  'ui-emitted-named / the name road at the lower confidence — the registered function answers FALSE where the group did',
  'ui-emitted / THREADED — the same payload as the first row, with the pool config crossing a clone into a real thread',
  'uncloneable / OR-R6, threaded — the scheduler`s own clone refuses the value first, the task ends user_action and nothing reaches the listener',
];

/**
 * **What the cross-row layer ASSERTS ABOUT, one subject per block** — W47, and it is
 * `ROW_KEYS`' analogue one layer in.
 *
 * `ROW_KEYS` makes a deleted ROW fail naming itself. Nothing did that for the
 * cross-row clauses, so W47's adequacy reader deleted all three of this item's blocks
 * for **two integers and one import line** and L6 reported the pre-W47 numbers, green.
 * Each string below is a substring of a label some cross-row block emits; the clause
 * at the foot of this file requires every one of them to have been emitted, so
 * **deleting a block fails naming the subject that left** rather than passing at a
 * lower count.
 *
 * **The residual regress is stated rather than hidden**: this list is a literal, so
 * deleting a block AND its subject is two edits in one diff — which is exactly what
 * `ROW_KEYS`' own header says of itself, and is [Q102](../doc/questions/q102.md)'s
 * shape. What it removes is the *silent* case, where an integer edit leaves no name
 * behind. [Q217](../doc/questions/q217.md).
 *
 * **A substring rather than the whole label**, because a label is prose that gets
 * re-worded and a subject is what the block is about — the same reason `ROW_KEYS`
 * holds keys rather than `why` strings.
 */
/**
 * **What every ROW must have been asked, by subject and by HOW MANY rows** — W55's
 * adequacy reader, BLOCKING, and it is `CROSS_ROW_SUBJECTS`' analogue one layer in.
 *
 * Each entry is a substring of a per-row label and a function giving how many rows
 * must have emitted it, derived from the rows themselves. **The count is derived and
 * the subject is a literal**, which is the split `ROW_KEYS` and `CROSS_ROW_SUBJECTS`
 * both use: a deleted assertion fails naming what it was about rather than moving an
 * integer, and a row that stops paying for one fails without the floor having to see
 * it.
 *
 * **Its limit is theirs**: the list is a literal, so deleting a clause AND its subject
 * is two edits in one diff — [Q102](../doc/questions/q102.md)'s shape,
 * [Q217](../doc/questions/q217.md). What it removes is the silent case, where three
 * integer edits leave no name behind.
 *
 * **Scoped to W55's own assertions, deliberately.** Every other per-row assertion in
 * this file predates this list and is bound the way it always was; claiming them here
 * would be a membership list nobody measured.
 */
const PER_ROW_SUBJECTS: readonly [string, (rows: readonly Expectation[]) => number][] = [
  ['when the run was over the driver held exactly the arrivals', (rows) => rows.length],
  ['it had recorded one entry per branch that arrived', (rows) => rows.length],
  ['what it collected is a SECOND COPY', (rows) => rows.filter((e) => arrivedInRun(e) > 0).length],
  ['it names WHICH region is still holding', (rows) => rows.filter((e) => heldWhenOver(e) > 0).length],
  // **W67, and its adequacy reader (a12) is why it is here**: the whole per-row half of Outputs (2)
  // — ten assertions naming which POOL each task ran on — left for three edits and an integer, with
  // nothing but `DECLARED_TOTAL` counting it. v0.14's *a count is not a membership*, in the file
  // that records the clause.
  ['ran on, read off scheduler.tasks', (rows) => rows.filter((e) => Object.keys(e.poolOfTask ?? {}).length > 0).length],
  // **W94 — the gate clause's claims AND its control, by name** (v0.18: a membership names the controls beside its
  // claims). `decided ONCE per file` is the control: without it the other five compare empty lists on a run that
  // reached no gate at all.
  ['the gate decided ONCE per file', (rows) => rows.filter((e) => e.gate).length],
  ['exactly ONE `first` per series', (rows) => rows.filter((e) => e.gate).length],
  ['is the FIRST of that series to ARRIVE', (rows) => rows.filter((e) => e.gate).length],
  ['the per-series task ran for EXACTLY the branches', (rows) => rows.filter((e) => e.gate).length],
  ['RunState.gated IS the run`s gated fold inputs', (rows) => rows.filter((e) => e.gate).length],
  ['what LEFT the gate is what REACHED it', (rows) => rows.filter((e) => e.gate).length],
  ['the ARRANGEMENT`s own effect', (rows) => rows.filter((e) => e.gate?.arranged).length],
  ['ran in the realm the row asks for', (rows) => rows.filter((e) => e.gate).length],
];

// **The two W57 observers above are vacuous on a row that dispatched nothing, so this says they
// were not vacuous everywhere** — the tasks the scheduler held and the outcome records it produced,
// summed over every row, are both positive, read from the reports rather than from a literal.
assertThat('cross-row', 'ADR 0048 rule 5 was observed on tasks the scheduler actually HELD, and on settlements it actually reported',
  reports.reduce((n, r) => n + r.tasksHeld, 0) > 0 && reports.reduce((n, r) => n + r.settlementsSeen, 0) > 0,
  `${reports.reduce((n, r) => n + r.tasksHeld, 0)} tasks held, ${reports.reduce((n, r) => n + r.settlementsSeen, 0)} settlements seen`);

const CROSS_ROW_SUBJECTS = [
  // **W99**: the arc that was Q391's false `no`, asserted FITTING at the consumer each gate row names, and the
  // consumer's own requirement beside it. Its sibling `rowsWithNo` was listed here and it was not (its adequacy
  // reader, F4).
  'and the arc that WAS that false `no` FITS on every gate row',
  'and the per-series worker REQUIRES what that route guarantees',
  'the loop above ran at all',
  'ADR 0048 rule 5 was observed on tasks the scheduler actually HELD',
  'RN-R6',
  'Q41: the sequence carries pathEnded',
  'isLowConfidence returned FALSE at 0.9',
  'ADR 0025: the same run completes',
  'JP-R9 at L6',
  'L6 runs a `map`',
  'EXPECTED runs exactly the rows this file declares',
  'every node kind the spec corpus expresses',
  'whose NODE declares a needs',
  'the two map-with-context rows run at DIFFERENT run configs',
  'the two `reference-if-it-ran` rows are a PAIR',
  '`earlierWasLowConfidence` returned TRUE on one row',
  'one reference form per row of spec/flow-definition.md',
  'L6 runs the flow P13 exists for',
  'one more SPELLING than it has rows',
  'the conditional ARRAY form included',
  'is a registry type',
  // W67 — what replaced `ROLES` against the switch when one worker file became fourteen modules.
  'is one the document declares, both ways — what replaced `ROLES` against the switch',
  'every worker some node TYPE names',
  'reaches past index.ts into src/',
  'at least one DOTTED branch path',
  'the printed table names region',
  'the foreign-task list is six',
  'a reference across SIBLING regions',
  'TWO branches of one region both declare a reference',
  'two regions opened DIFFERENT numbers of branches',
  'RELEASED it when its join became terminal',
  'and that class is not empty',
  'is still holding what arrived',
  'told apart by ONE property',
  'COUNTED before they are reported absent',
  'the other two release moments have NO case at this rung',
  'the reporter`s predicate is SILENT on a real released run',
  // **Narrowed by W90**: it read *every run this file makes*, which was false from W78's consumer road on — W78's two runs,
  // W82's check-OFF arm and W90's forty all sit outside the retention claim, and the clause's own arithmetic below counts
  // exactly the row loop, the pair rows and the shim. A claim states the scope it was measured at (`doc/workflow.md`
  // section 1 rule 5).
  'every run the row loop, the pair rows and the shim make is in the retention claim',
  'FIVE more runs than the row loop produces',
  'the byte measurement WALKS every growing structure',
  'is on the WALKED side of that split',
  'every PER-ROW subject this file declares was asked',
  'no per-row assertion about ADR 0046 or JP-R12 is left uncovered',
  // W58
  'non-zero attempts occurs in exactly the rows that declare it',
  'the groups the L6 flows NAME are the groups the scheduler DECLARES',
  'the groups the scheduler was BUILT with, read as source text',
  'a resource event was reported for exactly the task ids some row declares',
  'the scheduler`s own declaration of retryPolicy',
  // W59
  'the node TYPES the L6 flows name are the types the registry holds',
  'are the ones the driver was handed — two readings of one registry',
  'the pools the scheduler REPORTS are exactly one per type',
  'the two settings of the typed pair DIFFER',
  'under a policy the NODE does not declare',
  'the typed map instances received three DIFFERENT inputs',
  'deno.json exports the sub-path',
  'package.json exports `./scheduler`',
  'under a `scheduler/` directory of its own build',
  // W63
  'Q263 as three rows',
  'the arity-one and arity-two rows are a PAIR',
  'the SAME type carries the engine',
  'the languages the L6 flows NAME are the languages the harness registered',
  'the helper`s reading of every L6 definition agrees',
  'asked of at least one array the ENGINE built',
  'a `transform failed` error occurs in exactly the rows',
  'the reshaping road is removed and not FORBIDDEN',
  // **The two CONTROLS of block (2d), named as subjects because the adequacy reader deleted them
  // with two counts lowered and a validator accepting everything was green in both runtimes**
  // (G3b): the list named the claims and not their controls — v0.14's *a count is not a membership*
  // one layer inside the membership list.
  'the validator SAW that document',
  'a transform really failed somewhere',
  // **P17's retro measured the same shape in W58's block**: its retry control — *and that set is
  // not empty — a real retry happened somewhere* — deleted with `CROSS_ROW` and `DECLARED_TOTAL`
  // lowered by one was green in both runtimes (`retro-w58ctl`, 0 failures). Second occurrence, in a
  // block two plans older, so `doc/workflow.md` v0.18 makes the controls members by rule; this is
  // the member.
  'a real retry happened somewhere',
  // W73 — FD-R4's two claims and their two controls, as v0.18's membership clause asks.
  'FD-R4 refused a START on exactly the rows that declare refuseAtStart',
  'a payload really was refused somewhere',
  'FD-R4 refused a RESOLUTION on exactly the rows that declare refusedFirst',
  'a person`s value really was refused somewhere',
  'the wiring check over the runtime`s registry reads `no` on exactly the FD-R2 row',
  'no arc is unchecked over the runtime`s registry',
  'the wiring reports are not empty',
  // **W78 — P20's EXIT ARTIFACT.** NINE claims and THREE controls — twelve entries, which is what
  // the `CROSS_ROW` comment beside the count also says. *(This read "seven" over twelve entries
  // until the conformity reader counted them, finding 13.)* The controls are members
  // by rule since v0.18: a membership over claims alone binds the vacuity of nothing, which is
  // what W63's adequacy reader measured and what P17's retro then found live in W58's block.
  'the consumer passed `start` nothing but `onRegionEvent`',
  '`await done` WON THE RACE and the deadline did not',
  '`done` resolved with the TERMINAL RunState',
  'a fan-out watched through StartOptions.onRegionEvent on a real FyflowScheduler',
  'IS the region subsequence of the driver`s own',
  '`await done` deep-equals `fold(driver.foldInputs())`',
  '`done` RESOLVED with a RunState rather than rejecting',
  'resolves `done` with outcome `stopped` carrying `stoppedBy`',
  'the two runs of this block are a PAIR',
  'CONTROL: the two sides of the region equality are DIFFERENT VALUES',
  'CONTROL: the two sides of the fold invariant are DIFFERENT OBJECTS',
  'CONTROL: `stoppedBy` DISCRIMINATES',
  // W65
  'retried under a policy of its OWN',
  // W67
  'one per named instance PLUS one per built-in, both ways',
  'at least one NAMED instance exists',
  'differs from the document ON DISK in exactly `inline`',
  'the sample flow runs from two DOCUMENTS',
  'a DOCUMENT type and a CLASS type over ONE worker',
  'the DEFAULT instance and the NAMED instance of one type',
  'resolved a group by its KEY and not by the object`s own name',
  // **The CONTROLS of the W67 block, named beside their claims** — v0.18's clause: a membership over
  // claims binds the vacuity of nothing, and these are the assertions that make the three above
  // non-vacuous (the pair actually ran; the two derivations actually differ; the custom group was
  // actually acquired).
  'both GpuModel instances RAN in one row',
  'and the two derivations DIFFER',
  'and the custom group was ACQUIRED',
  'and a node whose settings drop the key the WORKER`s settingsSchema requires',
  // The CONTROL of (vi), named beside its claim — v0.18's clause: without it the refusal above is
  // satisfied by a document the validator refuses for some other reason, or for all of them.
  'the sample flow validates against the registry the run was BUILT from, with zero findings',
  // W67, after its adequacy reader
  'the pools those readings came from are the SCHEDULER`s own WorkerManagers',
  'the custom group`s object NAMES ITSELF something other than its key',
  'a run started with NO options completes',
  'the runtime MINTED the run id',
  'it is the id this RUN dispatched under',
  'the types whose `inline` the document leaves UNSAID are exactly the four this file expects',
  'a node whose worker entry declares NO settingsSchema takes any settings at all',
  // W72 — the clause was rewritten from four entries to the rule's enumeration over fourteen, and the
  // corpus's examples gained a subject of their own: a membership names its claims (v0.14).
  'the runtime CARRIES every schema the twenty-one worker entries declare, exactly',
  // W94 — block (2h)'s three claims and two controls, and the TV pair's two claims and its route control.
  'W94 (2h): at EVERY kill point the TV ingest resumed',
  'W94 (2h), W97: and the ARRANGEMENT held across every kill',
  'W94 (2h): and the replay REGENERATED every stored `gated` element',
  'W94 (2h): and the re-dispatched ids are the killed process`s in-flight set',
  'W94 (2h) CONTROL: the sweep is EVERY kill point',
  'W94 (2h) CONTROL: the selections DISCRIMINATE',
  'W94: the LAST-first and FIRST-first rows are a PAIR',
  'W94: and the SAME series were opened once each',
  'W94: and every route `distinct` DECLARES was TAKEN',
  'every schema every corpus worker entry declares carries an `examples`',
  'the pool map is read off the SCHEDULER`s own task map',
  'CONSTRUCT a pool, a scheduler, a Driver or a built-in resource group are exactly the ones that DECLARE it',
  'BOTH detectors fire on the shapes they refuse',
  // **W82 — P21's EXIT ARTIFACT.** Six claims and TWO controls; the controls are members by rule
  // since v0.18, and v0.21 is why each of them reads the RELATION rather than the emptiness of an
  // operand: every clause of the check-OFF block compares two strings, so a control over one side
  // would stay exactly as true after the claim was made a tautology by re-sourcing.
  'OR-R13 is a READING: with the check ON and OFF the same flow dispatches the same ids',
  'the LOG is identical record for record with only the clocks zeroed',
  'the folded outcome is the same',
  'every settled RESULT is the same value',
  'what the check COSTS the run, ON and OFF, as a COUNT rather than a clock',
  'the check LOOKED AT every settlement of the run',
  'CONTROL: the two arms are DIFFERENT RUNS of one flow',
  'OR-R13 reported on exactly the rows that ASKED for the check',
  'CONTROL: and that set is NOT every row',
  // **The SIX the first version left out** — the adequacy reader's findings 4 and 5, measured: the
  // derived block's four and two of the check-OFF block's three CONTROLS deleted for TWO integer
  // edits, with L6 green at the lowered numbers and nothing named. The derived block is this item's
  // SECOND DERIVATION and its control is rule 8's fourth requirement on the set — *whatever makes a
  // discriminating pair differ is itself a claim* — so a membership that omits them omits the half
  // v0.18's clause is about.
  'the registry DOCUMENT declares a `maximum` for gauge`s `load`',
  'which row must report `gauge` is ARITHMETIC over the document`s declared maximum',
  'and the finding it declares names the bound the DOCUMENT declares',
  'CONTROL: the two rows DISAGREE about gauge',
  'CONTROL for the cost: the OFF arm reported NOTHING',
  'CONTROL: and the ON arm IS the row',
  // W82, after its adequacy reader: the clause that makes `settledOwnKeys`' own sentence true. The
  // two clauses that make the log-derived road a ROAD are PER-ROW (they are emitted under the row's
  // own key), so they move the row's declared extra rather than this list.
  'every settled task whose result is an OBJECT has its own key set recorded, on every row',
  'CONTROL: and there are MANY more of those than the two ids any row declares',
  // **W86 — P22's EXIT ARTIFACT.** Nineteen entries — fifteen claims and four controls; the controls are members by rule
  // since v0.18, and v0.22 is why each names the tree it fails on rather than the emptiness of an
  // operand: the overlap walk's claim is a RELATION over a sequence, so a control over one of its
  // operands would stay exactly as true after the claim was made a tautology.
  'the openers that do are exactly W86`s `map` in a `map` and W94`s `fanout` in a `map`',
  'CONTROL: and the same detector asked about a FANOUT region',
  'one opener is entered once per outer item',
  'perShard@0 was STILL HOLDING',
  'the NON-FIRST instance closed FIRST',
  'CONTROL: the same flow at ONE item',
  'CONTROL: and across every row this rung runs, ONLY the P22 artifact and the rows through a gate',
  'rows this block is about both RAN',
  'the two collections are DISJOINT',
  'the pair IS the region, over every ROW this rung runs',
  'CONTROL: and this rung emits region events whose regionPath is NOT',
  'JP-R12 at TWO LEVELS on real workers',
  'the ARRANGEMENT that makes that order determinate',
  'the printed table names BOTH instances of one opener',
  'a row declaring `regionInstances` exists for the printed-table clause to read',
  'read off the sequence`s own INDICES rather than off that walk',
  'ADR 0062 consequence 6, the SAME set by another road',
  '`soleRegion` REFUSES the opener that has TWO instances',
  'P22 prediction 3, the REACH',
  // **W90 — P23's EXIT ARTIFACT.** Twenty entries — sixteen claims and four controls; the controls are members by
  // rule since v0.18, and each names the tree it fails on (v0.22).
  'P23 EXIT ARTIFACT: a run killed at EVERY kill point',
  'RN-R21 at L6: the re-dispatched ids ARE the in-flight set',
  'the re-dispatch COUNT read from the SCHEDULER',
  'RN-R22 and RN-R24 at L6',
  'RN-R19 at L6: the LOST TAIL is regenerated',
  'P23 prediction 2 at L6',
  'the at-least-once set is NOT the stored events` in-flight set',
  'AT-LEAST-ONCE, visible',
  'RN-R18 at L6: the HEADER arrives AFTER the first events',
  'THREE processes, ONE store keyed by position',
  'the store holds the WHOLE run again',
  'a store keyed by an ARRIVAL counter per process',
  'a MID-STEP cut and a QUIESCENT cut of ONE killed run',
  'W98: over every row of this rung, the pairs the RUN FIXES',
  'the stored events` in-flight set is right at the quiescent cut',
  'a PARKED task is not in flight',
  'resolve() on the RESUMED driver',
  'CONTROL: outcome alone does NOT discriminate',
  'CONTROL: the K = 1 re-dispatch of each flow is the DOCUMENT`s',
  'CONTROL: the fresh runtime RAN every task its scheduler held',
  'CONTROL: the sweep is EVERY kill point, counted from a second source',
  // **W110 — THIRTEEN subjects, one per clause of P26's exit artifact's block, and BOTH READERS
  // found their absence from opposite ends.** The conformity reader grepped this array (178 entries,
  // none W110's); the adequacy reader (F1) DELETED the whole block for **two integer edits** —
  // `CROSS_ROW` 236 -> 226 and `DECLARED_TOTAL` 2390 -> 2380 — at **exit 0 with nothing named**, and
  // a single clause for the same price. That is W47's own finding reproduced by the mechanism built
  // for it, sixty lines under the comment that records the lesson. v0.18's extension — *a membership
  // names the CONTROLS beside its claims* — is why the control is listed too.
  'the predicate registry each artifact row`s driver was handed',
  'the names each document`s own `when`s cite',
  'the two artifact documents differ in the ONE `when`',
  'the DECLARED road dispatches these exact node sequences',
  'and the NAME road dispatches the same exact sequences',
  'W110 CONTROL: and those two payloads route DIFFERENTLY',
  'no artifact row ended at `stalled`',
  'the UI registry document declares exactly these three sections',
  'and exactly these four workers and four types, as a LITERAL',
  'every one of those entries is BYTE-EQUAL to the shared document`s',
  'the artifact`s registry declares no groups, no group types, no classes',
  'is in NO registry the driver was handed, while every artifact row`s registry',
  'the UI document the rows RUN is the file on disk',
];

/**
 * **How many reference forms `spec/flow-definition.md` section 3 declares** — read
 * from the document, so the bound below cannot be satisfied by a literal.
 *
 * Same shape as W41's `referenceTableRows()` at L1 and as the node-kind bound
 * below: *compare the two halves rather than copy one of them*, which is `JP-R9`'s
 * sentence and the only defence this file has against a clause it wrote itself.
 */
async function referenceFormsInSpecAsync(): Promise<number> {
  const deno = (globalThis as Record<string, unknown>).Deno as
    { readTextFile?: (x: URL) => Promise<string> } | undefined;
  const u = new URL('../spec/flow-definition.md', import.meta.url);
  const text = deno?.readTextFile
    ? await deno.readTextFile(u)
    : await (await import('node:fs/promises')).readFile(u, 'utf8');
  const lines = text.split(/\r?\n/);
  const head = lines.findIndex((l) => l.startsWith('| a reference is | and resolves to |'));
  if (head < 0) throw new Error('spec/flow-definition.md section 3`s reference table is not there');
  let n = 0;
  for (let i = head + 2; i < lines.length && lines[i]!.startsWith('|'); i++) n++;
  if (n === 0) throw new Error('the reference table has no body rows, so the bound would be vacuous');
  return n;
}
const REFERENCE_FORMS_IN_SPEC = await referenceFormsInSpecAsync();
const referenceFormsInSpec = () => REFERENCE_FORMS_IN_SPEC;

/**
 * **A SPELLING is not a ROW, and section 3's table has four rows and five
 * spellings** — [W47](../doc/work-items/w47-the-blocked-flow-on-real-workers.md).
 *
 * `referenceFormsInSpec()` above counts the table's body ROWS, which is what the
 * `forms` bucketing below is a claim about. **W45 made `?` a MODIFIER rather than a
 * fourth form**, so the table's fourth row carries *two* spellings — `"score?"` and
 * `["score?"]` — and a bucketing over rows cannot see that L6 runs one of them and
 * not the other. This is the second source, and the claim it supports is an
 * ABSENCE — which the row set has otherwise only ever recorded in a comment, the
 * control pair's empty `onUnmintedTask` array being an absence this file already
 * asserts.
 *
 * **One normaliser, two sources.** `spellingOf` is used on the table's tokens and on
 * the definitions the rows run, so the comparison is about the two SOURCES rather
 * than about two copies of one expression — `doc/workflow.md` section 5 rule 8
 * obligation (c)'s procedure. **Its LIMIT applies and is answered**: a normaliser
 * shared by both sides moves both sides together, so the count clause below is the
 * second, independent observer over it — collapse `spellingOf` and the table stops
 * naming one more spelling than it has rows.
 */
const spellingOf = (ref: unknown): string => {
  const one = Array.isArray(ref) ? ref[0] : ref;
  const suffix = typeof one === 'string' && one.endsWith('?') ? '?' : '';
  return ref === '.' ? '.' : `${Array.isArray(ref) ? '["n"]' : '"n"'}${suffix}`;
};

async function referenceSpellingsInSpecAsync(): Promise<string[]> {
  const deno = (globalThis as Record<string, unknown>).Deno as
    { readTextFile?: (x: URL) => Promise<string> } | undefined;
  const u = new URL('../spec/flow-definition.md', import.meta.url);
  const text = deno?.readTextFile
    ? await deno.readTextFile(u)
    : await (await import('node:fs/promises')).readFile(u, 'utf8');
  const lines = text.split(/\r?\n/);
  const head = lines.findIndex((l) => l.startsWith('| a reference is | and resolves to |'));
  if (head < 0) throw new Error('spec/flow-definition.md section 3`s reference table is not there');
  const out = new Set<string>();
  for (let i = head + 2; i < lines.length && lines[i]!.startsWith('|'); i++) {
    // The FIRST cell only — the second is prose about what the form resolves to and
    // quotes node ids and rule ids in backticks.
    const cell = lines[i]!.slice(1).split('|')[0] ?? '';
    for (const m of cell.matchAll(/`([^`]+)`/g)) {
      // **A spelling, not the row's own commentary.** Section 3's grammar admits a
      // JSON string or a one-element JSON array and nothing else, so a token that
      // does not parse as one of those is prose — which is exactly what the fourth
      // row's `?` is, and it is why this filters by PARSE rather than by position.
      let v: unknown;
      try {
        v = JSON.parse(m[1]!);
      } catch {
        continue;
      }
      const one = Array.isArray(v) ? v[0] : v;
      if (typeof one !== 'string') continue;
      out.add(spellingOf(v));
    }
  }
  if (out.size === 0) {
    throw new Error('section 3`s reference table names no spellings, so the bound would be vacuous');
  }
  return [...out].sort();
}
const REFERENCE_SPELLINGS_IN_SPEC = await referenceSpellingsInSpecAsync();

/**
 * **The registry DOCUMENT and the worker MODULES on disk are two lists saying the same fourteen
 * things, and the flows are a third** — W67, and it is this file's instantiation of
 * `doc/workflow.md` section 5 rule 8 obligation (e)'s **THIRD SHAPE** at v0.13: *a LIST is a claim
 * about another list; find the other list and compare BOTH WAYS.*
 *
 * **What this replaces, and why the replacement is stronger.** Until W67 the three lists were the
 * pool registry inside `buildScheduler`, the one worker file's `ROLES`, and the twelve arms of that
 * file's `switch` — three copies of one fact in two files, and the measurement W47 recorded was that
 * *all three pairs agree in both directions and no defect is live*. W43 had closed one direction
 * with a TYPE (`pool`'s parameter was `Role`, so an invented role was `TS2345` at ladder L0) and
 * [Q196](../doc/questions/q196.md) is the finding that **a type closes one direction only** — a role
 * declared and used by nothing cost zero.
 *
 * **A registry document removes the copies rather than binding them.** A node type names a worker
 * KEY, which `resolveRegistry` refuses by name at construction (`WorkerMissing`); a worker entry
 * names a URL, which `createRuntime` resolves against the consumer's base and a real thread then
 * loads. So the only pair left is *the workers the document declares* against *the modules that
 * exist*, and it is compared here both ways: a key whose module is missing is red before a task
 * runs, and a module no entry names is red in the same clause. The `role` switch, the `Role` union
 * and both directions of Q196's asymmetry are GONE — there is nothing left for a type to half-close.
 *
 * **Measured on the tree this item ships**: the document declares **16** workers and
 * `examples/workers/` holds sixteen modules beside `shared.ts`; it declares **17** node types (the
 * eleven pre-W65 ones, `Echo`, `Scorer`, W67's `Fetch` and `Prompt`, and W82's `GaugeWorker` and
 * `StampWorker`) and the 26 flow documents
 * name exactly those the rows run — **18** with the `GpuModel` CLASS the shim registers; it declares **5** groups and the scheduler
 * reports exactly those five. *(This paragraph read 14 / fourteen / 15 / 25 / 16 on the tree W82
 * ships, four numbers wrong in the paragraph whose heading is `Measured on the tree this item
 * ships` — W82's conformity reader, finding 4. The CLAUSE below reads the file and passed
 * throughout; only the prose was false.)* Both sides of each pair are read from somewhere other than the object
 * the runtime was built from — the document from its own BYTES, the modules from the DIRECTORY —
 * which is what keeps a re-sourced export from making the comparison vacuous.
 *
 * **Read from the FILE rather than from the export**, deliberately: `run-flow.ts` exports
 * `REGISTRY_DOCUMENT`, and comparing that to itself would be a sensor corroborating itself. This is
 * v0.12's own procedure for obligation (e)'s second question — *read the default DECLARATION rather
 * than running it* — and every extraction **throws** when it finds nothing, because a read that
 * silently returns `[]` makes a set equality pass on two empty sides.
 */
/** A manifest's text, relative to this file, in either runtime — W59's (2c) clause reads both. */
async function readManifest(rel: string): Promise<string> {
  const u = new URL(rel, import.meta.url);
  const deno = (globalThis as Record<string, unknown>).Deno as { readTextFile?: (x: URL) => Promise<string> } | undefined;
  return deno?.readTextFile ? await deno.readTextFile(u) : await (await import('node:fs/promises')).readFile(u, 'utf8');
}

async function workerListsAsync(): Promise<{
  /** The `nodeTypes` keys of the registry DOCUMENT, read from the file rather than from the export — every pool is one of these (W59's second observer of the registry the driver was handed). */
  types: string[];
  /** The `workers` keys of the same document — since W67 one module per worker, so this is the whole of what `examples/workers/` must hold. */
  workers: string[];
  /** The `groups` keys of the same document — W58's second observer of `scheduler.groups`, which since W67 is exactly what the document declares. */
  groupIds: string[];
  /** The module URLs those worker entries name, as declared (relative, as a portable document writes them). */
  workerUrls: string[];
  /** The worker modules actually on disk under `examples/workers/`, as the same relative URLs — `shared.ts` excluded, because it is not a worker. */
  modulesOnDisk: string[];
  /** The `pools` keys — the NAMED instances, which since W67 is `prompt-big` and nothing else. */
  namedPools: string[];
  /** The node-type CLASSES the shim registers in `code.nodeTypes`, read from its source — the half of the registry no document holds. */
  classTypes: string[];
}> {
  const deno = (globalThis as Record<string, unknown>).Deno as
    { readTextFile?: (x: URL) => Promise<string>; readDir?: (x: URL) => AsyncIterable<{ name: string; isFile: boolean }> } | undefined;
  const read = async (rel: string): Promise<string> => {
    const u = new URL(rel, import.meta.url);
    return deno?.readTextFile
      ? await deno.readTextFile(u)
      : await (await import('node:fs/promises')).readFile(u, 'utf8');
  };
  const nonEmpty = <T>(xs: T[], what: string): T[] => {
    if (xs.length === 0) throw new Error(`${what} extracted nothing, so the bound would be vacuous`);
    return xs;
  };

  // ---- the DOCUMENT, read from the FILE rather than from `REGISTRY_DOCUMENT` — W67, and it is the
  //      second observer W59's source-text extraction was. The runtime imports the JSON module; this
  //      reads the bytes and parses them, so a `REGISTRY_DOCUMENT` re-sourced to a literal in
  //      `run-flow.ts` is red here rather than invisible. ----
  const doc = JSON.parse(await read('./registry.json')) as {
    workers?: Record<string, { url: string }>;
    groups?: Record<string, unknown>;
    nodeTypes?: Record<string, unknown>;
    pools?: Record<string, unknown>;
  };
  const types = nonEmpty(Object.keys(doc.nodeTypes ?? {}), 'the document`s nodeTypes');
  const workers = nonEmpty(Object.keys(doc.workers ?? {}), 'the document`s workers');
  const groupIds = nonEmpty(Object.keys(doc.groups ?? {}), 'the document`s groups');
  const workerUrls = nonEmpty(Object.values(doc.workers ?? {}).map((w) => w.url), 'the document`s worker urls');

  // ---- and the MODULES on disk, which is the other half of that list — W67, rule 8 obligation (e)'s
  //      third shape. Until this item the binding was `ROLES` against a twelve-arm switch against a
  //      pool registry, three lists in two files; a worker entry names a URL now, so the list the
  //      document must agree with is the DIRECTORY. `shared.ts` is excluded by name because it is
  //      what the modules import rather than a worker anything loads. ----
  let names: string[];
  if (deno?.readDir) {
    names = [];
    for await (const e of deno.readDir(new URL('./workers/', import.meta.url))) if (e.isFile) names.push(e.name);
  } else {
    names = await (await import('node:fs/promises')).readdir(new URL('./workers/', import.meta.url));
  }
  const modulesOnDisk = nonEmpty(
    names.filter((n) => n.endsWith('.ts') && n !== 'shared.ts').map((n) => `./workers/${n}`),
    'the worker modules on disk',
  );

  // ---- and the node-type CLASSES, read from the SHIM's source — W67. A class is code by decision
  //      2 and lives in no document, so the registry a driver is handed is the union of the two.
  //      Read as text rather than imported for the same reason the document is read as bytes: the
  //      thing this is a second observer OF is `runtime.registry.nodeTypes`. ----
  const rf = await read('./run-flow.ts');
  const classTypes = nonEmpty(
    [...rf.matchAll(/^ {4}nodeTypes: \{ (\w+): new \w+\(\) \},$/gm)].map((m) => m[1]!),
    'the shim`s code.nodeTypes',
  );

  return {
    types: [...new Set(types)].sort(),
    classTypes: [...new Set(classTypes)].sort(),
    workers: [...new Set(workers)].sort(),
    groupIds: [...new Set(groupIds)].sort(),
    workerUrls: [...new Set(workerUrls)].sort(),
    modulesOnDisk: [...new Set(modulesOnDisk)].sort(),
    namedPools: Object.keys(doc.pools ?? {}).sort(),
  };
}
const WORKER_LISTS = await workerListsAsync();

/**
 * **`examples/registry.json` parsed from its OWN BYTES — W110, and it is a different SOURCE rather
 * than a second expression over one object.**
 *
 * The UI document duplicates four worker entries and four type entries, and the clause that says the
 * duplication cannot drift compared BOTH sides to `UI_REGISTRY_DOCUMENT` in its first cut — so
 * `"workers": {}` passed both sides (the conformity reader, 10) and re-sourcing the expected side to
 * the same import passed too (the adequacy reader, F4). `REGISTRY_DOCUMENT` is the IMPORT the runtime
 * was built from; this is the file. v0.13's correction to obligation (e)'s third shape: *a both-ways
 * comparison is worth having; what it is not is a second observer.*
 */
const SHARED_ON_DISK = JSON.parse(await readManifest('./registry.json')) as {
  workers?: Record<string, unknown>;
  nodeTypes?: Record<string, unknown>;
};

/**
 * A registry derived from a document's OWN task nodes — one document-form type per name it uses,
 * over a placeholder worker — for the cross-row clauses that validate a document against a registry
 * that must not be a second variable (W47's conformity reader). Since W65 (ADR 0054) a task node
 * names a TYPE, so the derivation is over `type` where it was over `workerType`; the validator reads a
 * type's WORKER for its schema and nothing else, so this is the smallest registry that says nothing.
 */
function registryOf(d: FlowDefinition) {
  const names = [...new Set(d.nodes.filter((n) => n.kind === 'task').map((n) => (n as unknown as { type: string }).type))];
  return { predicates: [...predicates.keys()], workers: { flow: { url: 'l6://flow' } }, nodeTypes: Object.fromEntries(names.map((t) => [t, { worker: 'flow' }])) };
}

/**
 * **Does ladder L6 exercise the surface a CONSUMER has?** — W47, and it is this
 * item's instantiation of `doc/workflow.md` section 5 rule 8 obligation (e)'s
 * **SECOND QUESTION** at v0.12: not *was the check run*, but **was what it RAN what
 * SHIPS.**
 *
 * An example reaching past `index.ts` into `src/` would be exercising a surface **no
 * consumer resolves**, and the reason is the manifests rather than any prose: npm
 * ships a bundle and `exports["."]` selects `dist/node/index.js`, while JSR's
 * `deno.json` publishes `src/` behind a `publish.exclude` allowlist and gates the
 * whole of it behind `exports: "./index.ts"`. **Either way `src/…` is not a specifier
 * a consumer of either package can name.** *(This cited `spec/runtime-targets.md`
 * section 1 for *"both publish `./index.ts` and nothing else"*, which that table says
 * of neither half — it is mirrored from the SCHEDULER's manifests and its npm row
 * reads `dist/node/index.js`. W47's conformity reader; the conclusion survives on the
 * two facts above and its stated evidence did not.)* **No document states the
 * consequence for `examples/**` as a rule** — which is why this clause states it
 * rather than citing it. This item is the first to import a *validator* into L6 —
 * every earlier import here was a driver, an id helper or a policy — so it is the
 * first item for which the shorter path was available and tempting.
 *
 * **Measured with the item's own provocation set, and RE-TAKEN on the tree this item
 * ships** (section 1 rule 5's WHEN clause): rewriting `l6.ts`'s `validateDefinition`
 * import to `'../src/definition/validate.ts'` leaves `check-source` at **`All checks
 * passed`, exit 0**, `deno lint` at `Checked 48 files`, both typechecks clean — and
 * **this clause red**, reporting `expected: [] / actual: ["./l6.ts"]`. *(The first
 * version of this paragraph said "both L6 rungs at 818 assertions" and "nothing
 * noticed", which was the tree BEFORE this clause and the two beside it existed —
 * true of no tree the item ships. W47's conformity reader.)* Today no file under
 * `examples/` reaches into `src/` at all, so it is a bound with no live case and its
 * probe is the whole of its evidence — and P12's retro found that *the author reaches
 * none of* obligation (e)'s instances, all nine of its own passing and every one found
 * by a reader. **This one is the author's**, which is a datum P13's retro is owed.
 *
 * **It lives here rather than in `scripts/check-source.mjs`** because `scripts/**` is
 * in nobody's `Owns` — [Q121](../doc/questions/q121.md)'s and
 * [Q126](../doc/questions/q126.md)'s standing problem, and P8's own reason for
 * declining two checks — and because the claim is about `examples/**`, which is this
 * item's block. The regress it leaves is [Q213](../doc/questions/q213.md): a check
 * inside the thing it checks is deletable with it, and what stands against that here
 * is `D6` (both rungs run THIS file) plus `DECLARED_TOTAL`.
 */
// **One path is EXEMPT since W59, by its full spelling: the sub-path's entry.** `fyflow-orchestration/scheduler`
// is a published export (both manifests carry it — P16 decision 5, ADR 0049 rule 5), so
// `../src/scheduler/index.ts` is what a consumer resolves the sub-path TO, and `run-flow.ts`
// imports the bootstrap helper through it exactly as `l6.ts` imports the driver through
// `../index.ts`. A file UNDER the sub-path — `bootstrap.ts`, `envelope-worker.ts` — is still an
// offender, and `REACH_CASES` carries one of each.
// **And a SECOND path since W63, by the same argument**: `fyflow-orchestration/jsonata` is a published
// export (ADR 0052 rule 3), `../src/jsonata/index.ts` is what a consumer resolves it to, and
// `run-flow.ts` imports the adapter through it. A file under `src/jsonata/` other than the entry
// would be an offender, and `REACH_CASES` carries one.
const REACHES_PAST_INDEX = /from\s+'(?:\.\.\/)+src\/(?!(?:scheduler|jsonata)\/index\.ts')/;
/**
 * **The detector's POSITIVE case, checked in** — W47's adequacy reader, finding 4.
 *
 * Neutralising the regex — `src` to `zzz` — cost **zero**, and the compound (the real
 * defect present, the regex neutralised) came back green in both runtimes with
 * `check-source`, `lint` and both typechecks at exit 0. **The clause had exactly one
 * observer and no case that made it fire**, which is obligation (c)'s LIMIT stated of
 * a detector rather than of a value: *a sensor cannot corroborate itself.*
 *
 * These three strings are that second observer. They are not a sample of the tree —
 * the tree is clean, which is the whole problem — so they are the only place the
 * matching itself is exercised, and the third one is what stops the regex being
 * widened to `/src/` and matching every relative import here.
 */
// **Assembled from parts, and it has to be**: written as literals these three cases
// would make THIS file its own offender — the sweep reads `l6.ts` and the regex would
// match the fixture. Measured: it did, and the clause failed naming `./l6.ts`. *A
// detector's positive fixture cannot be written in a file the detector reads.*
const UP = '..' + '/';
const REACH_CASES: [string, boolean][] = [
  [`import { validateDefinition } from '${UP}src/definition/validate.ts';`, true],
  [`import { Driver } from '${UP}${UP}src/driver/driver.ts';`, true],
  [`import { POLICIES } from '${UP}index.ts';`, false],
  // W59: the sub-path's ENTRY is a consumer surface and is exempt; a file under it is not.
  [`import { bootstrap } from '${UP}src/scheduler/index.ts';`, false],
  [`import { bootstrap } from '${UP}src/scheduler/bootstrap.ts';`, true],
  // W63: the second sub-path's entry, and a file beside it that no manifest exports.
  [`import { jsonata } from '${UP}src/jsonata/index.ts';`, false],
  [`import { compile } from '${UP}src/jsonata/engine.ts';`, true],
];
/**
 * **What a file under `examples/` may not CONSTRUCT — W67's adequacy reader (a8), BLOCKING.**
 *
 * `S16` binds `RT-R13` over the PUBLISHED set (`src/` and `index.ts`) and `examples/**` is outside
 * its scope, by design: an example may legitimately hold a scheduler. What changed at W67 is that
 * P18's exit-artifact sentence — *`examples/**` holding no role switch and no `pool()` call* — and
 * this item's own Outputs (1) — *no hand-built group, no `Driver` constructed by hand* — became
 * CLAIMS about this directory, and the reader measured them held by nothing: a
 * `new ConcurrentLimitGroup(99)` added to `run-flow.ts` cost ZERO at every rung.
 *
 * So the sweep below reports both. The list is the scheduler objects a RUNTIME is now responsible
 * for — a pool, a scheduler, a driver, and each of the three built-in group classes — and it is the
 * same list `S16` enumerates plus `Driver`, because the point here is that the harness builds none
 * of them rather than that the pure entry loads none.
 *
 * **And since W81 the clause is an EQUALITY against what the files DECLARE rather than against
 * `[]`** — [W81](../doc/work-items/w81-what-a-settlement-costs.md). That item's whole subject is
 * what `runtime.start`'s always-on completion handle costs a consumer who never asked for it
 * ([Q320](../doc/questions/q320.md)), and the ONLY road that declines it is building the `Driver`
 * yourself from `runtime.registry` — which is
 * [P18](../doc/plans/p18-a-flow-and-its-runtime-from-documents-alone.md) decision 14's own
 * sentence, and which this clause forbade. *(This cited ADR 0055, which has five numbered decisions
 * and none about the registry, and linked a bare directory. W81's conformity reader, and it is the
 * class a `doc/` check has been refused for nineteen times: a claim attributed to a named file that
 * the file does not make.)* *The claim was written for the files that DRIVE flows,
 * where the runtime does every instantiation; a file that PRICES the two roads has to hold both.*
 *
 * **The declaration is a marker in the file's own text AND a path in a list here, and the second
 * half is a correction to the first.** The marker alone was measured: a file that constructs one
 * without declaring it is red naming itself, and a file that declares it and constructs nothing is
 * red too — which `[]` could never catch — **but one comment line was then the whole of the
 * permission.** W67's adequacy reader's own mutation is GREEN under a marker it typed itself
 * (`dev-dist/w81/a8-check.txt`). *A marker is a file granting itself permission; a list here is
 * that permission granted where the claim lives.* W39's `SELFTEST-EXCLUSIVE:` precedent is the
 * marker's, and it is a precedent for DECLARING a property rather than for waiving a claim.
 */
const CONSTRUCTS_A_SCHEDULER_OBJECT =
  /\bnew\s+(WorkerManager|FyflowScheduler|Driver|ConcurrentLimitGroup|RateLimitGroup|KeyedRateLimitGroup)\s*\(/;

/**
 * **The marker a file writes to declare that constructing one is its SUBJECT** — W81.
 *
 * **Assembled from parts, and it has to be**, for exactly the reason `REACH_CASES` and `UP` are:
 * this sweep reads `l6.ts`, so a literal here would make THIS file a declarer that constructs
 * nothing — the other direction of the equality below, which is the direction `[]` never had.
 */
const CONSTRUCTOR_MARKER = 'PRICES' + '-THE-CONSTRUCTION:';

/**
 * **One expression, two callers** — the sweep below and `CONSTRUCT_CASES`'s third column, so the
 * marker detector is exercised by a fixture exactly as the regex beside it is.
 */
const declaresConstruction = (text: string): boolean => text.includes(CONSTRUCTOR_MARKER);

/**
 * **And the files this claim EXEMPTS, named HERE — so an exemption costs an edit in the file that
 * wants it AND an edit in the file that makes the claim.**
 *
 * **The measurement this rests on, taken on the shipped tree** (`dev-dist/w81/a8-check.txt`): with
 * the marker alone, W67's adequacy reader's own mutation — `new ConcurrentLimitGroup(99)` in
 * `run-flow.ts` — is still **RED** when it declares nothing, and **GREEN** the moment one comment
 * line is typed above it. *The claim caught the careless and stopped catching the deliberate*, and
 * a marker is permission a file grants itself.
 *
 * So the equality below is THREE-way. The marker still earns its place — it carries the REASON at
 * the site, which a path in a list cannot — and this list is what makes the reason answerable to
 * somebody. [P21](../doc/plans/p21-what-a-run-time-schema-check-buys-and-what-it-costs.md)
 * decision 8 is where the decision lives, because *a decision that is not in `spec/`, an ADR, or a
 * plan did not happen* (`doc/workflow.md` section 1 rule 3) and an assertion's own comment is not
 * one of the three.
 *
 * It is [Q217](../doc/questions/q217.md)'s shape deliberately: a member and its name are two edits
 * in one diff. **Here that IS the mechanism** rather than its limit — the two edits are the point,
 * and they are in different files.
 */
const CONSTRUCTION_PRICED: readonly string[] = ['./settlement-cost.ts'];

/**
 * **The positive fixture, assembled from parts** — as `REACH_CASES` is, and for the same reason: the
 * tree is clean, so an empty offender list is what a broken matcher returns too. The second element
 * is what the detector must say.
 */
/**
 * **Both detectors, one fixture, one assertion** — W81's adequacy reader, whose finding is that
 * `CONSTRUCTOR_MARKER` had **no positive or negative case at all** while the regex beside it had
 * four. The third element is what `declaresConstruction` must say.
 *
 * **What this does NOT bind, stated rather than argued** (v0.10, *where the corpus cannot express
 * the case, RECORD it*): it binds the two DETECTORS and not the sweep's choice of which to call.
 * Re-sourcing `declared.push` to the regex leaves both lists equal, because this tree has exactly
 * ONE file in either — and a corpus of one declarer cannot tell two source expressions apart, which
 * is [Q216](../doc/questions/q216.md)'s recorded limit (*a both-ways comparison is worth having and
 * is not a second observer*). What DOES bind the sweep is the pair of mutations in W81's own set:
 * the marker deleted from the file that constructs, and the marker added to a file that does not.
 */
const CONSTRUCT_CASES: readonly [string, boolean, boolean][] = [
  [`const g = new${' '}ConcurrentLimitGroup(1, 'gate');`, true, false],
  [`const s = new${' '}FyflowScheduler(pools, groups);`, true, false],
  [`const d = new${' '}Driver(flow, opts);`, true, false],
  [`const p = new${' '}WorkerManager(url, options);`, true, false],
  // What the shim DOES hold, and must keep holding: a custom group class of the consumer's own,
  // constructed inside the factory the runtime calls (P18 decision 4), and a node-type class.
  [`create: (config, key) => new${' '}DailyBudgetGroup(key, config.tokensPerDay),`, false, false],
  [`nodeTypes: { GpuModel: new${' '}GpuModel() },`, false, false],
  ['const runtime = createRuntime(doc, code, { base });', false, false],
  // The marker's own two cases, assembled from parts for the reason `CONSTRUCTOR_MARKER` is: a
  // literal here would make `l6.ts` declare itself and the equality above would fail from the
  // other side, which is that equality working.
  [`const d = new${' '}Driver(flow, opts);   // ${CONSTRUCTOR_MARKER} this file prices the road`, true, true],
  ['a file that merely mentions the word PRICES, and constructs nothing', false, false],
];

async function examplesReachingPastIndexAsync(): Promise<
  { files: string[]; read: string[]; offenders: string[]; constructors: string[]; declared: string[] }
> {
  const deno = (globalThis as Record<string, unknown>).Deno as {
    readTextFile?: (x: URL) => Promise<string>;
    readDir?: (x: URL) => AsyncIterable<{ name: string }>;
  } | undefined;
  const listDir = async (rel: string): Promise<string[]> => {
    const u = new URL(rel, import.meta.url);
    if (deno?.readDir) {
      const out: string[] = [];
      for await (const e of deno.readDir(u)) out.push(e.name);
      return out;
    }
    return await (await import('node:fs/promises')).readdir(u);
  };
  const readText = async (rel: string): Promise<string> => {
    const u = new URL(rel, import.meta.url);
    return deno?.readTextFile
      ? await deno.readTextFile(u)
      : await (await import('node:fs/promises')).readFile(u, 'utf8');
  };
  // Both directories that hold TypeScript here, listed from disk rather than named:
  // a third one appearing is not this clause's business, but a file appearing in
  // either of these is. **Since W81 that scope is worth restating rather than
  // inheriting**: the clause is an EQUALITY now, so `examples/getting-started/`'s
  // eleven files are in neither list and a `Driver` built there would be in neither
  // — the equality would hold vacuously. No live offender; W81's conformity reader.
  const files: string[] = [];
  for (const dir of ['./', './workers/']) {
    for (const name of await listDir(dir)) if (name.endsWith('.ts')) files.push(`${dir}${name}`);
  }
  if (files.length === 0) {
    throw new Error('the examples/ sweep listed no TypeScript at all, so the bound would be vacuous');
  }
  const offenders: string[] = [];
  const constructors: string[] = [];
  // **Read from the RAW text, because the marker lives in a comment** and the constructor scan
  // below strips comments before matching. Two reads of one file, two different questions.
  const declared: string[] = [];
  // **`read` is what was actually OPENED, and it is a different list from `files`** —
  // the adequacy reader's finding 4b: narrowing this loop to `files.slice(1)` skipped
  // `l6.ts`, the one file the clause was written against, and the companion clause
  // below read the LISTING and passed. Both lists are returned and compared.
  const read: string[] = [];
  for (const f of files) {
    read.push(f);
    // `from '<any number of ../>src/...'` — the shape a shortcut takes whichever
    // directory it is written from.
    const text = await readText(f);
    if (REACHES_PAST_INDEX.test(text)) offenders.push(f);
    // **Comments stripped first, and the limit is stated rather than hidden.** Both files here
    // DISCUSS the constructors they must not call — this clause's own header quotes
    // `new ConcurrentLimitGroup(99)` and `run-flow.ts` records what its `Driver` line used to be —
    // so a scan over raw text reports the files that explain the rule as the files that break it.
    // A line comment is cut at `//`, which also cuts anything after a `https://` on the same line:
    // a constructor written after a URL on one line would be missed, and that is the bound. The
    // positive fixture below is tested against RAW strings for exactly this reason — it is what the
    // stripper must not be allowed to make vacuous.
    const code = text.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/.*$/gm, ' ');
    if (CONSTRUCTS_A_SCHEDULER_OBJECT.test(code)) constructors.push(f);
    if (declaresConstruction(text)) declared.push(f);
  }
  return { files, read, offenders, constructors, declared };
}
const EXAMPLES_REACH = await examplesReachingPastIndexAsync();

check('cross-row', 'EXPECTED runs exactly the rows this file declares, in order',
  EXPECTED.map((e) => e.key), ROW_KEYS);

/**
 * **And a bound whose authority is OUTSIDE this file: L6 runs every node kind the
 * spec corpus expresses.**
 *
 * `ROW_KEYS` above is a literal, so deleting a row and its name is two edits in one
 * diff rather than an impossibility. This is the half that cannot be edited from
 * here at all: `spec/examples/valid/**` is the normative corpus,
 * `spec/flow-definition.md` section 7's table is compared to it **both ways** by
 * `check-spec`'s `C8`, and W32 closed the hole where a corpus flow could be renamed
 * out of the glob unnoticed. So the set of node kinds in that directory is a fact
 * about `spec/`, and this asserts that ladder L6 runs a flow containing each of
 * them.
 *
 * **`EXPECTED` only, and the two pair rows are not read.** They run `fanout-join`,
 * whose kinds every other row already covers, and `PairRow` carries no `definition`
 * field — so reading them would be a widening with no case behind it.
 *
 * **What it costs to delete P10's exit artifact is now a `spec/` edit.** Removing
 * the map rows leaves `map` in the corpus and in no L6 row, and this fails naming
 * the kind. It would have caught nothing about W23's nested rows — nesting is not a
 * node kind — which is why it stands **beside** `ROW_KEYS` rather than instead of it.
 */
{
  const readText = async (u: URL): Promise<string> => {
    const deno = (globalThis as Record<string, unknown>).Deno as
      { readTextFile?: (x: URL) => Promise<string> } | undefined;
    return deno?.readTextFile
      ? await deno.readTextFile(u)
      : await (await import('node:fs/promises')).readFile(u, 'utf8');
  };
  const listDir = async (u: URL): Promise<string[]> => {
    const deno = (globalThis as Record<string, unknown>).Deno as
      { readDir?: (x: URL) => AsyncIterable<{ name: string }> } | undefined;
    if (deno?.readDir) {
      const out: string[] = [];
      for await (const e of deno.readDir(u)) out.push(e.name);
      return out;
    }
    return await (await import('node:fs/promises')).readdir(u);
  };
  const corpus = new URL('../spec/examples/valid/', import.meta.url);
  const kindsInCorpus = new Set<string>();
  for (const name of (await listDir(corpus)).filter((n) => n.endsWith('.flow.json'))) {
    const doc = JSON.parse(await readText(new URL(name, corpus))) as { nodes?: { kind?: string }[] };
    for (const n of doc.nodes ?? []) if (typeof n.kind === 'string') kindsInCorpus.add(n.kind);
  }
  const kindsAtL6 = new Set<string>();
  for (const e of EXPECTED) for (const n of e.definition.nodes) kindsAtL6.add(n.kind);
  // **`gate` WAS exempt until W94, and the exemption EXPIRED LOUDLY, as W92 built it to** — a valid gate document
  // entered the corpus at `spec/flow-definition.md` v0.23 and no L6 row could run one until P24's exit artifact, so
  // W92 flagged a kind that was exempt and PRESENT here. **W94's three TV rows made it red on their first run** —
  // `[["gate"],["gate","phantom"],["gate"]]` against `[[],["phantom"],["gate"]]`, logged in
  // `dev-dist/w94/b1-l6.log` — and the exemption was then removed: a kind is flagged when it is in the corpus and
  // missing here, with nothing exempt. *A dated exemption with no expiry is a hole*; this one had one, and it fired.
  //
  // **And the clause is still evaluated on TWO constructed inputs beside the real one, inside the same check** —
  // W92's adequacy reader (#18): replaced by `.filter(() => false)` the clause went on printing `[]`. On a corpus
  // with a PHANTOM kind no row runs, it must name it; and with the kind W94 added taken back OUT of L6, it must name
  // `gate` — the second input's meaning changed with the exemption (it was *`gate` present while exempt*). Neither
  // tree exists; the clause is shown able to fail on each, and the count does not move.
  const flagged = (corpus: ReadonlySet<string>, atL6: ReadonlySet<string>) => [...corpus].sort().filter((k) => !atL6.has(k));
  check('cross-row', 'L6 runs a flow containing every node kind the spec corpus expresses',
    [flagged(kindsInCorpus, kindsAtL6), flagged(new Set([...kindsInCorpus, 'phantom']), kindsAtL6), flagged(kindsInCorpus, new Set([...kindsAtL6].filter((k) => k !== 'gate')))],
    [[], ['phantom'], ['gate']]);
  // The negative control: the set is non-empty, so the clause above is not vacuous
  // on an empty corpus read. Without it a `listDir` that returns nothing passes.
  assertThat('cross-row', 'and the corpus read found node kinds at all — the clause`s own negative control',
    kindsInCorpus.size >= 5, `kinds in the corpus: ${[...kindsInCorpus].sort().join(', ')}`);
}


// --- the pair rows: two runs, two Drivers, ONE scheduler -------------------------
//
// **Two rows, and the second is P6's exit artifact.** They are the same topology,
// the same flow, the same payloads and the same policy; they differ in **one
// variable** — whether the scheduler also carries a task this library did not
// mint. That is the r5/r6 and r14/r15/r16 shape this file uses for its sharpest
// claims, applied to a scheduler rather than to a policy, and it is what gives
// `onUnmintedTask` a negative control: row 1 must report **nothing**, row 2 must
// report the foreign settlement, and neither is assertable without the other.
//
// **Row 1 — P4's exit artifact**, unchanged. [Q72](../doc/questions/q72.md):
// before W13 this corrupted both runs SILENTLY — each driver received the other's
// settlements and dispatched the other's successors, so `pa:publish:-:0` was
// dispatched twice under two outcomes (`spec/task-id.md` section 2's collision)
// and `ID-R1` could not fire, because each driver keeps its own dispatched-id set.
//
// **It is also the only L6 coverage `ID-R4` TIER 1 has, and it has none for tier
// 2.** W13's adequacy reader measured that the single-driver rows give the rule
// nothing at all: one run, no foreign settlements, nothing to drop. Here every
// settlement of run `pa` reaches `pb`'s listener and tier 1 drops it — so deleting
// tier 1 makes EACH driver hit tier 2 on the other`s settlements, stop with
// `UndispatchedTask`, and fail this row. Measured: 7 failures across BOTH runs —
// the first version of this comment said `pb` alone.
//
// **Tier 2 is still not reachable here**, which W14's own negative test measured
// rather than assumed: deleting tier 2 leaves row 1 **green**, because a foreign
// settlement returns at tier 1 and never reaches it. Tier 2 needs a settlement
// carrying THIS run's id for a task the driver never dispatched, and nothing on a
// real scheduler produces one unless something injects it. **W19 builds the
// injector and still does not cover it** — `ForeignTask.id` is passed to the
// scheduler verbatim, so `pc:notanode:-:0` would reach tier 2 and the marginal
// cost is the string. It stays out because widening a scope the plan settled is
// not this item's call (`doc/workflow.md` section 1 rule 3);
// [Q90](../doc/questions/q90.md) is the row, and W19's Record recommends it be
// updated to say the instrument now exists.
//
// **Row 2 — a task this library did not mint, on a real scheduler.**
// [ADR 0027](../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md)
// and `ID-R5`, on real workers. Under ADR 0023 rule 2 — the rule ADR 0027
// supersedes — this row was **not reachable at all**. Measured by restoring that
// rule (tier 0 rethrows) and running THIS row, on THIS flow: both runs `stopped`,
// each reported `InvalidTaskId` **twice** — once per foreign task — and each
// dispatched **1 of its 4** tasks, so the scheduler settled 4 of the 10 it would
// otherwise have been handed. As an L6 result that is **12 failures**.
//
// *(W19's declaration holds an earlier version of this measurement and it does not
// say the same thing: it ran `valid/linear.flow.json`, which has two task nodes,
// not `fanout-join`'s four. The number above is re-measured on the flow this row
// runs. `doc/workflow.md` section 1 rule 5's provenance clause — a claim is read
// from its source, and a number is read from the thing it is a number about.
// Found by W19's conformity reader, who noticed the four could not have come from
// a three-node flow.)*
//
// **The hostile ordering is arranged, and the arrangement is asserted.** A foreign
// task settling *after* both runs have finished is the benign case and would pass
// a row written carelessly. `runPair` queues these before either driver is
// constructed, on a single-slot inline pool, so they are the **first** settlements
// the scheduler dispatches.
//
// **What that pins, stated as what the assertions actually establish rather than
// as a slogan.** Two things: `settlementIds[0..n]` are the foreign ids, so no run
// had settled anything when they arrived; and
// `listenersAtFirstSettlement === listenersTotal`, so both drivers were **attached**
// when they were delivered. Each run then dispatching all four of its own ids is
// the third. *(This paragraph read "while both runs are live". A `Driver` attaches
// its listeners in its CONSTRUCTOR — ADR 0022, `src/driver/driver.ts:382` — so the
// listener count proves construction, not that either run had `start()`ed. The
// three facts above are what `ID-R5` needs and they are what is asserted; "live"
// was a stronger word than any of them. W19's conformity reader.)*
//
// Expected values derived from the spec before running, as every row's are:
// `spec/run-state.md` section 3 (both runs reach an `end`, so both are
// `completed`); `spec/task-id.md` section 2 (a task id identifies one
// `(run, node, branch, attempt)`, so the two dispatch sets are disjoint and
// neither has a repeat); and ADR 0027 rule 3 for what `onUnmintedTask` carries.

/**
 * **Six ids over the five refusals `parseTaskId` makes** — one each, plus
 * [Q107](../doc/questions/q107.md)'s `weekly-report`, which repeats the arity
 * refusal down a different scheduler event. **That is the point of the
 * table rather than of any one row.**
 *
 * `ID-R5` is **one guard over the five refusals** `parseTaskId` makes
 * (`src/driver/ids.ts:62,65,66,67,68` — arity, runId, nodeId, branchPath,
 * attempt; ADR 0027's producer table and `spec/outcome-record.md` section 6 both
 * say five). L6 reached **one** of them and then **two**, and each time the same
 * probe found the hole: narrowing tier 0 by the shape of the id — `if
 * (taskId.includes(':')) throw e`, then a message-prefix test — restored ADR 0023
 * rule 2 for every shape L6 did not inject, with all assertions green.
 *
 *   - the first version was found by this item's **own** rule-8 sweep and closed
 *     with `pc:ingest:x:0`;
 *   - **the residue was found by its adequacy reader**, who measured that closing
 *     it had taken L6 from one shape to two and named the three still invisible.
 *     Half-closing a survivor is worse than not closing it, so the table is now
 *     the whole grammar.
 *
 * *(The **sixth** way tier 0 fires — a `detail` carrying no string `id` at all,
 * which is the version-skew case `UnmintedTask.taskId` is typed `unknown` for —
 * cannot be reached by injecting a task, because a real `FyflowScheduler` always
 * sets `id`. It has L1-L5 coverage in `test/driver/lifetime.test.ts` and no L6
 * coverage, and that is a property of the scheduler rather than a gap here.)*
 *
 * **Every `id` is malformed in exactly ONE segment**, and `parseTaskId` tests them
 * in order — arity, runId, nodeId, branchPath, attempt — so each row reaches the
 * site it names and no earlier one.
 *
 * **`reason` has two halves and only one comes from the grammar** — said plainly,
 * because the first version of this claimed both did. *Which* clause refuses is
 * derived from `spec/task-id.md` section 1. The *wording* is read from
 * `parseTaskId` itself, because nothing in `spec/` fixes it — and pinning it is
 * still right, since ADR 0027 rule 3 makes `parseTaskId`'s own message the
 * contract and therefore public surface. W19's conformity reader.
 */
const UNMINTED: {
  id: string;
  site: string;
  reason: string;
  /** Defaults to `IngestWorker`, whose worker returns. */
  worker?: string;
  /** Only an `optional` task can settle `failed` — Q107's whole mechanism. */
  optional?: boolean;
  /** The scheduler event tier 0 reports this one under. */
  event?: string;
}[] = [
  {
    // ADR 0027's **first** producer row, spelled the way that table spells it — *a
    // plain non-flow task on a shared scheduler*, and one of the two the decision
    // calls the common case and wrong to stop on. No `:` at all, so it splits into
    // **1** segment where section 1 fixes **4**.
    id: 'nightly-cleanup', site: 'arity',
    reason: 'task id "nightly-cleanup" has 1 segments, expected exactly 4',
  },
  {
    // **[Q107](../doc/questions/q107.md), closed by W23.** The five entries around
    // this one all run `IngestWorker`, whose worker RETURNS — so `ID-R5` at L6 had
    // only ever been reached from `task.completed`, which both of W19's readers
    // found independently and neither could fix without this field.
    //
    // `ReviewWorker`'s pool runs the `fail` role, which throws; `optional: true`
    // is what makes the scheduler settle it `failed` rather than end it
    // `user_action` (`core/FyflowScheduler.ts:894-897`). So this is the SAME
    // refusal as the row above — one segment where four are required — reaching
    // tier 0 down a different event, which is what makes the `event` field able to
    // fail rather than a constant with five copies.
    id: 'weekly-report', site: 'arity, via task.failed',
    reason: 'task id "weekly-report" has 1 segments, expected exactly 4',
    worker: 'ReviewWorker', optional: true, event: 'task.failed',
  },
  {
    // **The one producer ADR 0027 says could be OURS, and the row that decision's
    // table did not have until W19 built the shape.** Its third row reads *"a
    // `detail` with no `id`, or an `id` that is not a string"*; this is a
    // four-segment string and was none of its three producers, while being squarely
    // the class the argument turns on — *"a library that assumes `detail.id` is
    // forever what it dispatched"*, which
    // `test/driver/lifetime.test.ts`'s `SHAPES` suite calls *"a corrupted id for a
    // task that IS ours"*. The correction is
    // [ADR 0027's producer row 4](../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md),
    // added by this item under `doc/workflow.md` v0.7 change 3; it changes no rule.
    // Found by W19's conformity reader.
    //
    // `pc` is a real run id on this scheduler and `ingest` a real node id, which is
    // what makes tier 0's position load-bearing at L6 rather than merely stated:
    // under any order that compared a run id before parsing, driver `pd` would drop
    // this in silence and its report array would be short.
    //
    // **It is one character from [Q90](../doc/questions/q90.md) and deliberately
    // not it.** `pc:notanode:-:0` would PARSE, reach `ID-R4` tier 2, and be
    // `UndispatchedTask` — a different rule and a different outcome. Q90 stays out
    // (P6's Scope/Out, `doc/workflow.md` section 1 rule 3); that the instrument now
    // exists is W19's recommendation to the register.
    id: 'pc:ingest:x:0', site: 'branchPath',
    reason: 'branchPath segment "x" is malformed',
  },
  // The remaining three refusal sites. A space is outside `ID-R2`'s
  // `[A-Za-z0-9_-]` charset, and `00` has a leading zero where section 1 fixes
  // `0 | [1-9][0-9]*`.
  {
    id: 'p c:ingest:-:0', site: 'runId charset',
    reason: 'runId segment is not [A-Za-z0-9_-]{1,64}',
  },
  {
    id: 'pc:ing est:-:0', site: 'nodeId charset',
    reason: 'nodeId segment is not [A-Za-z0-9_-]{1,64}',
  },
  {
    id: 'pc:ingest:-:00', site: 'attempt',
    reason: 'attempt segment "00" is malformed',
  },
];

interface PairRow {
  key: string;
  /** Two, and distinct — `ID-R3` and `spec/task-id.md` section 2. */
  runIds: [string, string];
  payloads: [{ confidence: number }, { confidence: number }];
  /** Injected before either driver starts. Empty on the control row. */
  foreign: ForeignTask[];
  /**
   * What **each** driver must report through `onUnmintedTask`, minus the `runId`
   * — which is added per run below, because ADR 0027 rule 3 says the report
   * carries *this driver's* run and an unparseable id has none to parse one out
   * of. Building it that way makes the run-id clause an assertion rather than a
   * copy: a driver reporting the other's id fails one of the two runs.
   */
  unminted: Omit<UnmintedTask, 'runId'>[];
  why: string;
}

const PAIR_ROWS: PairRow[] = [
  {
    key: 'two runs / two drivers / one scheduler',
    runIds: ['pa', 'pb'], payloads: [HIGH, LOW],
    foreign: [],
    // **The negative control, and it is `ID-R4` tier 1 asserted from the other
    // side.** Every settlement of `pa` reaches `pb`'s listener and is dropped in
    // silence (ADR 0023 rule 3) — a *parseable* foreign id must not reach
    // `onUnmintedTask`, which is ADR 0027 rule 4's asymmetry. Merging the two
    // channels would make this array non-empty on a row where the decision says
    // it must not be.
    unminted: [],
    why: 'P4 exit artifact — the pairing MultipleRuns tells you to build, on real workers. Before ' +
      'W13 each driver received the other`s settlements and dispatched its successors: one task id ' +
      'under two outcomes, with nothing reported. It is also ID-R4 TIER 1`s only L6 coverage — ' +
      'every settlement of one run reaches the other driver and is dropped by tier 1, in silence, ' +
      'which is what the empty onUnmintedTask array here asserts',
  },
  {
    key: 'two runs / one scheduler / tasks we did not mint',
    runIds: ['pc', 'pd'], payloads: [HIGH, LOW],
    // **FIVE on `IngestWorker` and one on `ReviewWorker`, and the margin is now a
    // cross-pool comparison rather than queue discipline** — W23's conformity
    // reader. This read *"All on `IngestWorker`, which is where the ordering comes
    // from: one slot, inline, so they are dispatched in this order"*, and
    // [Q107](../doc/questions/q107.md)'s sixth task falsified it in this item.
    //
    // What still holds: every foreign settlement lands ahead of either run's own
    // first one. **How it holds has changed.** The five `IngestWorker` ids
    // serialize on one inline slot to ~25 ms; `weekly-report` settles on its own
    // pool at `delayMs * 4` = ~20 ms; each run's `ingest` lands at ~30 ms. So the
    // margin is ~5-10 ms produced by comparing two pools, **and it would tie if an
    // `IngestWorker` foreign id were removed** — a coupling the previous comment's
    // "queue discipline" reading would have hidden. Stated rather than tightened,
    // because the assertion below checks the SHAPE of the whole sequence and does
    // not depend on the order the six arrive in relative to each other.
    foreign: UNMINTED.map((u) => ({
      id: u.id, workerType: u.worker ?? 'IngestWorker', optional: u.optional,
    })),
    // From ADR 0027 rule 3, field by field, one entry per foreign task. **Compared
    // sorted by `taskId`** — the order the driver reports them in is the scheduler's
    // settlement order, which `spec/` does not fix and `doc/workflow.md` section 5
    // rule 5 forbids asserting; every field is still pinned.
    //
    // **`event` takes TWO values here since [Q107](../doc/questions/q107.md), and
    // that is what W19's two readers independently asked for.** It used to read
    // *"`task.completed` for all five because all five SUCCEED — the `event` field
    // therefore takes one value at L6"*, which was true and which W23's own change
    // falsified in the same file. `weekly-report` runs `ReviewWorker`, whose pool
    // serves the throwing role, and `optional: true` makes the scheduler settle it
    // `failed` rather than end it `user_action` — so tier 0 reports it under
    // `task.failed`. **A field with one value cannot fail**; this one now can.
    //
    // The `task.user_action` half of ADR 0007 rule 2's pair is still L1-L5's
    // (`test/driver/lifetime.test.ts`) and not reached here, which needs a
    // NON-optional foreign task and is a third event again.
    // **Sorted here, not left to declaration order — W23.** The assertion compares
    // by `taskId`, and this list happened to be in sorted order until Q107 added a
    // sixth entry whose place in the ARRANGEMENT (`foreign:` above, where order is
    // the hostile-ordering claim) is not its place in the comparison. Two orders,
    // one list; the dependency was accidental and is now stated.
    // and with the SAME comparator the actual side uses — `localeCompare`, which
    // orders `p c:…` and `pc:…` differently from `<`. Two comparators over one
    // list is the same hazard as two orders over one list, one layer down.
    unminted: [...UNMINTED].sort((x, y) => x.id.localeCompare(y.id))
      .map((u) => ({ event: u.event ?? 'task.completed', taskId: u.id, reason: u.reason })),
    why: 'W19 — P6 exit artifact. A scheduler carrying tasks this library did not mint, two ' +
      'drivers running flows on it, and BOTH RUNS COMPLETING. Both foreign settlements land first, ' +
      'before either run has settled anything and with both drivers already attached; ID-R5 ' +
      'decides them at tier 0, ahead of ID-R4`s two tiers because ' +
      'both of those compare a run id and an unparseable id has none; each driver reports both ' +
      'under its OWN run id and keeps routing. Two shapes, not one: a plain non-flow task, and an ' +
      'id that could have been ours with its branchPath corrupted — the second is the case the ' +
      'against-side of ADR 0027 was entirely about. Under ADR 0023 rule 2 both runs stopped here',
  },
];

/**
 * From `spec/task-id.md` section 1's four segments and `fanout-join`'s own node
 * ids — **written once and used for two INDEPENDENT sources**: what the driver
 * says it dispatched, and what the scheduler says it settled. One derivation,
 * two readers, neither read off the other.
 */
const pairTaskIds = (who: string): string[] =>
  [`${who}:ingest:-:0`, `${who}:scoreA:0:0`, `${who}:scoreB:1:0`, `${who}:publish:-:0`];

/**
 * **The audit ADR 0027's *Consequences* says a consumer can now write**, written.
 *
 * `parseTaskId` and `InvalidTaskId` are both exported from the package root, so
 * *"was this task minted by a driver"* is a `try`/`catch` a caller has — which is
 * what makes the report actionable rather than merely informative.
 *
 * **It is independent of the DRIVER, not of the GRAMMAR, and the difference is
 * worth stating** (W19's conformity reader). Its data source is genuinely
 * independent — the scheduler's own `settlementIds`, recorded by a listener
 * registered before either driver existed — but its predicate is the same
 * `parseTaskId` tier 0 calls, so a common-mode change to the grammar moves both
 * sides. What it therefore catches is **a driver that reported the wrong set**,
 * which is the half that matters here; it is not a second opinion about what the
 * grammar accepts.
 *
 * *(The name is `AGENTS.md` section 9's, deliberately. That snippet is written
 * WITHOUT the rethrow — [Q104](../doc/questions/q104.md): `check-docs`' `X4a` is
 * satisfied by any `throw` in a `run` snippet, so a helper's own rethrow answered
 * for the assertions. This file is not a doc snippet and the rethrow is right
 * here, which is why the two spellings differ.)*
 */
const mintedByADriver = (id: string): boolean => {
  try {
    parseTaskId(id);
    return true;
  } catch (e) {
    if (e instanceof InvalidTaskId) return false;
    throw e;
  }
};

const pairResults: { row: PairRow; runs: [string, RunReport][]; facts: PairFacts }[] = [];

for (const row of PAIR_ROWS) {
  const [idA, idB] = row.runIds;
  const { a: ra, b: rb, facts } = await runPair(
    { definition: FJ, policy: POLICIES['live-token'], runId: idA, payload: row.payloads[0], predicates },
    { definition: FJ, policy: POLICIES['live-token'], runId: idB, payload: row.payloads[1], predicates },
    row.foreign,
  );
  const runs: [string, RunReport][] = [[idA, ra], [idB, rb]];
  pairResults.push({ row, runs, facts });

  // **The subjects, named once and asserted to be two DISTINCT runs.** W14's
  // adequacy reader iterated `pa` twice, leaving `pb` asserted by nothing at an
  // unchanged 233 — no counting floor can see a duplicated subject, so the floor
  // is not where that is caught. This is.
  check(row.key, 'the block asserts on TWO distinct runs',
    [...new Set(runs.map(([who]) => who))].sort(), [...row.runIds].sort());

  for (const [who, r] of runs) {
    check(row.key, `${who}: run-state outcome`, r.state.outcome, 'completed');
    check(row.key, `${who}: finished by run state, not the backstop`, r.finishedBy, 'run-state');
    check(row.key, `${who}: nothing was reported`, r.failureKinds, []);
    check(row.key, `${who}: the join fired`, soleRegion(r.state, 'split')?.joined, true);
    // From `spec/join-policy.md` section 2-3, not from output: `live-token` opens
    // two branches, both arrive, the count reaches zero having been positive.
    check(row.key, `${who}: both branches arrived`, soleRegion(r.state, 'split')?.settled,
      { 0: 'arrived', 1: 'arrived' });
    // The full list, in dispatch order — a prefix predicate would pass for a run
    // that dispatched one task or seven. **On the foreign row this is the exit
    // artifact**: all four are dispatched, and the first of them settles *after*
    // the foreign settlement the ordering assertion below pins. Under ADR 0023
    // rule 2 this list was one id long.
    check(row.key, `${who}: the four task ids the scheme fixes`, [...r.dispatched], pairTaskIds(who));
    // `RN-R12`: a terminal outcome means no more input is coming. **These rows are
    // the best place in the file for it** — they are the only ones where a
    // settlement for another run, or for no run at all, genuinely arrives while
    // this run is live, so a tier-0 or tier-1 regression that appended one lands
    // here.
    check(row.key, `${who}: nothing arrived after the run was declared finished`, [...r.lateInputs], []);
    check(row.key, `${who}: its log holds only its own run's records`,
      r.log.map((rec) => rec.taskId).filter((id) => !id.startsWith(`${who}:`)), []);
    // **ADR 0027 rule 3, whole — and rule 4's asymmetry with it.** The `runId` is
    // spliced in per run rather than declared, so a driver reporting the other's
    // id fails; the empty case on row 1 is the assertion that a *parseable*
    // foreign settlement stays silent.
    check(row.key, `${who}: what onUnmintedTask reported — ADR 0027 rules 3 and 4`,
      [...r.unmintedTasks].sort((x, y) => String(x.taskId).localeCompare(String(y.taskId))),
      row.unminted.map((u) => ({ runId: who, ...u }))
        .sort((x, y) => String(x.taskId).localeCompare(String(y.taskId))));
  }

  // --- what the SCHEDULER saw, which is the only source here that is not the code
  // --- under test (`doc/workflow.md` section 5 rule 4)
  //
  // Every assertion above reads a `Driver`. W14's adequacy reader removed the
  // `ID-R4` guard and filtered `dispatchedIds()`/`snapshot()` by run id, and the
  // row stayed **green at 233/0** while the scheduler was handed 55 `addTask`
  // calls for 50 distinct ids. These are read from the scheduler itself, before
  // either driver was constructed, and they are counts of structure rather than
  // of order — `doc/workflow.md` section 5 rule 5.
  const wantSettlements = [...row.runIds.flatMap(pairTaskIds), ...row.foreign.map((f) => f.id)].sort();
  check(row.key, `the scheduler settled ${wantSettlements.length} tasks, none of them twice`,
    [...facts.settlementIds].sort(), wantSettlements);
  check(row.key, 'and it was handed exactly that many tasks to run',
    facts.addTaskCalls, wantSettlements.length);
  // **One scheduler, two drivers, both attached before anything settled.** A
  // sequential pair leaves the first count short of the second; a run given its
  // own scheduler leaves `addTaskCalls` at zero on this one. Neither depends on
  // which run wins a race. **On the foreign row it carries a second job**: the
  // first settlement IS the foreign one, so this is what says the drivers were
  // there to receive it.
  // **One recording per settlement**, which is what stops the line below being a
  // tautology: with a single latched field, deleting its "only on the first" guard
  // let every later settlement overwrite it and the claim became unfalsifiable
  // with all 370 assertions green - the count at the moment it was measured. W19's
  // adequacy reader.
  check(row.key, 'the scheduler-side record holds one listener count per settlement',
    facts.listenersAtSettlement.length, facts.settlementIds.length);
  assertThat(row.key, 'both drivers were ATTACHED to the one scheduler before the first SETTLEMENT',
    facts.addTaskCalls > 0 && facts.listenersAtSettlement[0] === facts.listenersTotal,
    `at the first settlement ${facts.listenersAtSettlement[0]} of ${facts.listenersTotal}`);
  // `runFlow` must not shut down a scheduler it did not build — `runPair` owns it.
  // Mutating that flag lets whichever run finishes first drain the other, which is
  // the third occurrence of `shutdown()` silently repairing this harness.
  check(row.key, 'the shared scheduler was shut down exactly once, by its owner',
    facts.shutdownCalls, 1);
  // **What the scheduler's own record says the partition is.** Row 1 asserts that
  // **every** settlement it dispatched was minted by a driver — an empty list on
  // both sides, and reachable rather than vacuous only because `buildTaskId` could
  // in principle emit an id `parseTaskId` refuses, which is what
  // `test/driver/lifetime.test.ts`'s `FD-V16`/`ID-R2` agreement case exists to
  // stop. Row 2 asserts that exactly the **two** injected ids were not, and names
  // them. *(This comment said "non-empty on both rows" and "exactly one"; both were
  // wrong, and W19's conformity reader read the values rather than the sentence.)*
  //
  // Independent of the driver, not of the grammar — see `mintedByADriver`.
  //
  // **Both sides SORTED — W23, and the dependency was accidental.** This compared
  // `settlementIds` (settlement order) against `row.foreign` (declaration order)
  // and passed because every foreign task ran the SAME pool with the same delay,
  // so the two orders coincided. [Q107](../doc/questions/q107.md)'s sixth task
  // runs `ReviewWorker` instead — a different pool, a different settling time —
  // and the assertion failed on an order `spec/` does not fix, which is exactly
  // what `doc/workflow.md` section 5 rule 5 forbids depending on. **The claim was
  // always about the SET**; it is now written as one.
  check(row.key, 'ADR 0027: a consumer can tell a minted id from an unminted one, from the package root',
    facts.settlementIds.filter((id) => !mintedByADriver(id)).sort((x, y) => x.localeCompare(y)),
    row.foreign.map((f) => f.id).sort((x, y) => x.localeCompare(y)));

  // **The hostile ordering, arranged and then checked — over the WHOLE settlement
  // sequence.** `doc/workflow.md` section 5 rule 5 forbids depending on an order
  // the spec does not fix; it does not forbid choosing inputs that make a causal
  // path reachable, which is the same move `buildScheduler`'s `SETTLES_LAST`
  // makes. The arrangement is in `runPair` — queued before either driver is
  // constructed, on a single-slot inline pool — and this is its effect, which is
  // the half W17 found held down by nothing.
  //
  // Without it the row is satisfied by foreign tasks settling after both runs have
  // finished, which is the benign case and proves nothing about a live run.
  //
  // **The SHAPE of the sequence, not the ids, and that is three repairs in one**
  // (W19's two readers, from two directions):
  //
  //   - it says nothing about the order the foreign settlements arrive in relative
  //     to EACH OTHER, so it no longer pins single-slot FIFO dispatch — an order
  //     `spec/` does not fix;
  //   - it covers **every** settlement rather than a prefix, so the benign ordering
  //     fails on the whole sequence rather than on one slice of it;
  //   - and it **cannot be sourced from a driver**. The previous form compared a
  //     `slice` against the declared ids, and substituting
  //     `runs[0][1].unmintedTasks.map((u) => u.taskId)` for `facts.settlementIds`
  //     left it green. The item's Output (3) says this claim must come from the
  //     scheduler *because* reading it from a driver asserts the absence of a thing
  //     from the thing accused of dropping it — and nothing said so. A driver knows
  //     only what it was told about; this expects the full sequence, so no
  //     driver-sourced list can satisfy it.
  //
  // **Run on both rows.** The control row's version reads *"all eight settlements
  // the scheduler dispatched were ours"*, which is a claim rather than a vacuous
  // `[]` against `[]`.
  const foreignIds = row.foreign.map((f) => f.id);
  check(row.key, 'every foreign settlement landed BEFORE either run`s own first — the hostile order',
    facts.settlementIds.map((id) => (foreignIds.includes(id) ? 'foreign' : 'ours')),
    [...foreignIds.map(() => 'foreign'), ...row.runIds.flatMap(pairTaskIds).map(() => 'ours')]);
}

/**
 * **`settledByScheduler` carries ids NO driver dispatched — W35's adequacy reader,
 * BLOCKING, and it is the provenance axis this directory exists for.**
 *
 * `RunReport.settledByScheduler` is documented as *"counted at the listener boundary
 * and independent of anything the driver recorded"*, and two `Q32` assertions rest
 * on that: *the SCHEDULER reported a settlement for every dispatched id*, and *the
 * two sources agree*. Measured: re-sourcing it as `settledByScheduler: [...dispatched]`
 * in `run-flow.ts` — **one expression, nothing else** — costs **0 failures**, and
 * both assertions become `dispatched` compared with `dispatched`. The negative
 * control is on the same expression: deleting the `task.failed` listener that feeds
 * the real one costs **20** with it and **0** with the swap.
 *
 * The pair row that injects foreign tasks is where the two sources can be told
 * apart, because the scheduler settles ids **this library did not mint** and no
 * driver dispatched any of them. A list read from a driver cannot contain them.
 * *(Pre-existing rather than W35's, and closed here because `examples/**` is this
 * item's `Owns` and provenance is the axis its Verification section names.)*
 */
{
  const withForeign = pairResults.find(({ row }) => row.foreign.length > 0);
  const ids = withForeign?.row.foreign.map((f) => f.id) ?? [];
  for (const [who, rep] of withForeign?.runs ?? []) {
    check(`two runs / one scheduler / tasks we did not mint (${who})`,
      'settledByScheduler carries every foreign id and dispatched none of them — so it is NOT the driver`s list',
      {
        seenByScheduler: ids.filter((id) => rep.settledByScheduler.includes(id)),
        dispatchedByThisDriver: ids.filter((id) => rep.dispatched.includes(id)),
      },
      { seenByScheduler: ids, dispatchedByThisDriver: [] });
  }
}
/** One per run of the pair row that carries foreign tasks. */
const PAIR_EXTRA = 2;

/** Per pair row: one distinctness check, nine per run, seven scheduler-side. */
const PAIR_PER_RUN = 9;
const PAIR_CROSS = 8;
/**
 * Derived from the rows rather than typed. **Nothing currently depends on the
 * derivation, and W19's own sweep is what says so**: replacing this with the
 * literal it evaluates to changes no observable, because `EXPECTED_TOTAL` follows
 * the rows on both sides and only `DECLARED_TOTAL` — a number a human wrote down —
 * notices a row disappearing. Kept because it is right, and recorded as
 * **maintenance rather than an assertion** so that a reader does not count it as
 * one. It is W6's shared-source finding, still live.
 */
const PAIR_ROW = pairResults.reduce(
  (n, { runs }) => n + PAIR_PER_RUN * runs.length + PAIR_CROSS,
  0,
) + PAIR_EXTRA;

// --- the table a person looks at ----------------------------------------------

const runtime = typeof (globalThis as Record<string, unknown>).Deno !== 'undefined'
  ? `deno ${(globalThis as unknown as { Deno: { version: { deno: string } } }).Deno.version.deno}`
  : `node ${(globalThis as unknown as { process: { versions: { node: string } } }).process.versions.node}`;

const w = (s: string, n: number) => s.padEnd(n).slice(0, n);
// **Derived, because a hard-coded 40 silently TRUNCATED a row key.** W17's
// `p1-routed-away LOW / live-token-requiring-arrival` printed as
// `p1-routed-away LOW / live-token-requirin` — a human artifact quietly lying
// about which run it was showing, which is L7's rung and the one nothing else
// checks. The width now comes from the keys.
// **Every printed label is in this list, and it names its ROW.** It used to be a
// template written out twice - once for the width and once in the loop below -
// reading `two runs / one scheduler (pa)` for the only pair there was. With two
// pair rows that spelling cannot say which run belongs to which, so the label is
// built from the row's own key: a reader of the table can tell the control pair
// from the one carrying a foreign task, which is the whole point of printing it.
const pairLabel = (row: PairRow, who: string) => `${row.key} (${who})`;
const KEY_W = Math.max(
  ...EXPECTED.map((e) => e.key.length),
  ...PAIR_ROWS.map((r) => r.key.length),
  ...PAIR_ROWS.flatMap((r) => r.runIds.map((who) => pairLabel(r, who).length)),
) + 2;
// The count is derived, not typed: this line said "six" for two rows longer than
// it was true, which is the smallest possible version of the thing this whole
// review pass was about. **It counts RUNS, not row labels** - a pair row is
// one label producing two runs, so the two numbers differ and always have.
/**
 * **P18's SAMPLE SHIM's own call, run — `runtime.start(flow, payload)` with NO options at all** —
 * W67's adequacy reader (a15), BLOCKING.
 *
 * P18 decision 10 says two things about a run nobody configures: the runtime MINTS a run id (`r<n>`
 * from its own counter), and the join policy defaults to `live-token` (ADR 0003 rule 1). **Both were
 * reachable by no row**, because every row names the ids it expects and therefore must name the run,
 * and every row names the policy it is about — so replacing either default with a `throw` cost
 * ZERO, on the item that was the last chance to observe them. The plan's shim is exactly this call
 * and it was the one call this rung did not make.
 *
 * **The flow is `p1-routed-away` at LOW, and the choice is the assertion.** A policy NAME proves
 * nothing — it would be a literal standing in for the default. This flow's two candidate policies
 * DISAGREE on this payload: a branch is routed away from its join, so `live-token` satisfies the
 * join and the run completes, while `arrival-count` waits for an arrival that can never come and the
 * run folds to `stuck` (P1's own case, and the four `p1-routed-away` rows above are where both
 * halves are asserted). So *the run completed* IS *the default is `live-token`*, observed rather
 * than named. The minted id is read off the driver (`Driver.runId`, readable since W66 for exactly
 * this) and matched against `r<n>` — inside `ID-R2`'s charset — and every task the run dispatched
 * must begin with it, which is what makes the id the RUN's rather than a string this file printed.
 */
let shimReport: RunReport | null = null;
try {
  shimReport = await runFlow({ definition: RA, payload: LOW });
} catch (err) {
  // **A crash is not a detection** — `doc/workflow.md` section 4, and the row loop above has carried
  // this guard since W59. The shim run sits OUTSIDE that loop, so a throw here took the whole file
  // down with exit 1 and ZERO failure lines — measured by this item's own rule 8 re-run, where the
  // probes that replace decision 10's two defaults with a `throw` (the reader's `a15`) crashed
  // rather than being caught. W59's closed shape, reappearing in the block added after it.
  failures.push(`shim run\n      the run THREW before any assertion could run — a crash is not a detection: ` +
    `${err instanceof Error ? err.message.slice(0, 240) : String(err)}`);
}
if (shimReport !== null) {
  const key = 'cross-row';
  check(key, 'P18 decision 10: a run started with NO options completes — which on `p1-routed-away` at LOW is what `live-token` does ' +
    'and `arrival-count` does not, so the runtime`s DEFAULT policy is observed rather than named',
    shimReport.state.outcome, 'completed');
  assertThat(key, 'P18 decision 10: the runtime MINTED the run id — `r<n>` from its own counter, inside ID-R2`s charset',
    /^r[0-9]+$/.test(shimReport.runId), `runId: ${JSON.stringify(shimReport.runId)}`);
  assertThat(key, 'and it is the id this RUN dispatched under: every task id begins with it — the minted id is the run`s, not a string this file read back',
    shimReport.dispatched.length > 0 && shimReport.dispatched.every((id) => id.startsWith(`${shimReport.runId}:`)),
    `runId ${shimReport.runId}, dispatched ${shimReport.dispatched.join(', ')}`);
}

/**
 * **P20's EXIT ARTIFACT — the run a consumer holds in ONE LINE** —
 * [W78](../doc/work-items/w78-the-run-a-consumer-holds-in-one-line.md), and it is the only place
 * at this rung where the consumer holds **nothing but what `start` returned**.
 *
 * **Why it is not an `EXPECTED` row** (W78 finding C). A row runs through `runFlow`, and `runFlow`
 * IS the machinery this artifact exists not to use: it installs its own `onFoldInput`, keeps its own
 * `inputs` array, races a declared predicate against a backstop timer and derives `finishedBy` from
 * which won. A row cannot hold only `{ driver, done }` by construction. **W67's SHIM RUN is the
 * precedent** — `runtime.start(flow, payload)` with no options, added outside the row loop because
 * every row names the ids it expects and the policy it is about — and this is that shape one plan
 * on: one labelled block, TWO runs, bound by `CROSS_ROW_SUBJECTS` rather than by `ROW_KEYS`.
 *
 * **What the two runs are for, and they are a DISCRIMINATING PAIR.** Run A is a fan-out that
 * completes: `onRegionEvent` counted through `StartOptions` ([W76](../doc/work-items/w76-what-start-accepts.md),
 * [Q297](../doc/questions/q297.md)) and the end awaited in one line
 * ([W77](../doc/work-items/w77-what-start-returns.md), [ADR 0058](../doc/decisions/0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md)).
 * Run B's driver REFUSES — `uncloneable` returns a value `structuredClone` cannot copy — and `done`
 * **RESOLVES** with `outcome: 'stopped'` carrying `stoppedBy`, which is ADR 0058 rules 3 and 4 and
 * which had no observer at L6 and no observer on real workers anywhere. *With one run the
 * `completed` below is a constant; with the pair it is a measurement, and `doc/workflow.md` rule 8's
 * fourth requirement on the set says to assert what makes the two differ, which the last clause
 * does.*
 *
 * **The deadline is part of the artifact rather than around it.** ADR 0058 rule 8 says there is no
 * library deadline and `Promise.race([done, …])` is the consumer's one line; so racing is what a
 * consumer writes, it is what this block writes, and **which side won is asserted** — the analogue
 * of `runFlow`'s `finishedBy`, and the second observer P20 stop-and-ask (e)'s answer promised to put
 * beside that field rather than instead of it. It is also [Q323](../doc/questions/q323.md)'s
 * counter-measure in the file that needs it: an unbounded `await` on a real scheduler produces no
 * verdict at all, because a scheduler never shut down keeps the process alive.
 */
const CONSUMER_ROAD_DEADLINE_MS = 30_000;
/**
 * **Every `await` on a `done` here is BOUNDED, and the scheduler is shut down in a `finally`** —
 * [Q323](../doc/questions/q323.md), and this file is where that row was earned. W77's final rule 8
 * pass ran for two and a half hours on one probe because a real-pool case awaited `done` unbounded:
 * `CLAUDE.md` records that a scheduler never shut down keeps the process alive, so a probe that
 * stops `done` settling produces **no verdict at all** rather than a failure. *Bounding it is also
 * what ADR 0058 rule 8 says a consumer writes* — there is no library deadline and
 * `Promise.race([done, …])` is the one line — so the counter-measure and the artifact are the same
 * expression, and WHICH SIDE WON is asserted below.
 *
 * *(The first version of this block raced once and then wrote `const stateA = await done;` on the
 * next line. It is green on a correct tree and hangs for ever the moment a probe stops `done`
 * settling, which is Q323's defect reproduced inside the block written to close it — one line over,
 * exactly as W77's was one case over. Found by this item's own revert-cost measurement, which is a
 * probe that stops `done` settling by construction.)*
 */
/**
 * **It returns WHICH SIDE WON, and that is the whole of the fix for the adequacy reader's `S1`.**
 * The first version returned `T | null` and `endedBy` was derived as `settled !== null` — which is
 * true whenever `done` settles AT ALL, race or no race. So `await Promise.race([p, deadline])`
 * could be replaced by `await p` for **ZERO**, and with it went Q323's counter-measure: compounded
 * with the W77 revert, the reader's run went past 120 s with no exit code and no FAIL line, where
 * the shipped harness reports `EXIT 1, 4 FAIL` in 66 s. *A deadline whose winner nobody reads is a
 * deadline nobody can tell from its own absence.*
 *
 * **The residue, stated rather than argued** (v0.10's clause): a timeout on a CORRECT tree never
 * fires, so nothing any run of a correct tree does can observe that it is there. What the verdict
 * below binds is that the value came out of a RACE — delete the race and `by` has no producer, so
 * the deletion is two edits rather than one token. The second route is the rule 8 harness's own
 * per-rung `timeout`, where a rung that cannot finish is a verdict instead of a wait.
 */
const settleWithin = async <T>(p: Promise<T>, ms: number): Promise<{ by: 'done'; value: T } | { by: 'the deadline' }> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<{ by: 'the deadline' }>((resolve) => {
    timer = setTimeout(() => resolve({ by: 'the deadline' }), ms);
  });
  const won = await Promise.race([p.then((value) => ({ by: 'done' as const, value })), deadline]);
  if (timer !== undefined) clearTimeout(timer);
  return won;
};
type ConsumerRoad = {
  optionKeys: string[];
  /** Which side of the race ended the wait — `runFlow`'s `finishedBy` on the road that has none. */
  endedBy: 'done' | 'the deadline';
  /** **PROJECTED at capture, like run B's**, and that asymmetry was the adequacy reader's `S3`. */
  outcomeA: RunOutcome | 'NEVER SETTLED';
  terminalA: boolean;
  stoppedByA: string | null;
  stateA: RunState | null;
  foldedA: RunState;
  regionSeen: string[];
  regionFolded: string[];
  outcomeB: RunOutcome | 'NEVER SETTLED';
  stoppedByB: string | null;
  settledBWithARunState: boolean;
  /** The flows this block actually STARTED, so the printed run count is a length and not a literal. */
  runs: string[];
};
let consumerRoad: ConsumerRoad | null = null;
try {
  const rt = buildRuntime(false, [FJ, UC]);
  try {
    // ---- RUN A: a fan-out, and the consumer holds `{ driver, done }` and NOTHING ELSE.
    // The options object is a named const so its key set is an assertion rather than a reading of
    // this file's own source: *the consumer passed no `onFoldInput`, no `createTask` and no policy*
    // is what makes "in one line" a claim about this call and not about the prose above it.
    const regionSeen: string[] = [];
    const consumerOptions = { onRegionEvent: (e: RegionEvent) => { regionSeen.push(`${e.type} ${e.branchPath}`); } };
    const { driver, done } = rt.start(FJ, { confidence: 0.9 }, consumerOptions);
    const wonA = await settleWithin(done, CONSUMER_ROAD_DEADLINE_MS);
    const settledA = wonA.by === 'done' ? wonA.value : null;
    // The caller's OWN expression over the driver's OWN sequence — P20 decision 2, which W77 bound
    // at L1 and on real inline pools and which nothing had run on a real scheduler.
    const inputsA = driver.foldInputs();
    const foldedA = fold(inputsA);
    const regionFolded = inputsA.flatMap((i) => (i.kind === 'region' ? [`${i.event.type} ${i.event.branchPath}`] : []));
    // ---- RUN B: the same call, on a flow whose driver REFUSES. `done` must RESOLVE.
    // A `by: 'the deadline'` is `done` never settling. **A REJECTION does NOT arrive here** — see
    // the `catch` below, whose first message claimed it did and was measured false.
    const wonB = await settleWithin(rt.start(UC, { confidence: 0.9 }).done, CONSUMER_ROAD_DEADLINE_MS);
    const settledB = wonB.by === 'done' ? wonB.value : null;
    consumerRoad = {
      optionKeys: Object.keys(consumerOptions).sort(),
      endedBy: wonA.by,
      // **PROJECTED here rather than read off `stateA` below** — the adequacy reader's `S3`, and the
      // asymmetry is the argument: run B was already projected to `outcomeB`/`stoppedByB` and was
      // IMMUNE, while run A handed the clauses an object reference and one token could re-source it
      // to the caller's own fold. *One block, two shapes, and the projected one survived.*
      outcomeA: settledA !== null ? settledA.outcome : 'NEVER SETTLED',
      terminalA: settledA !== null && isTerminal(settledA),
      stoppedByA: settledA !== null ? (settledA.stoppedBy ?? null) : null,
      // **NULLABLE, and the `?? foldedA` this used to carry was a hole** — the conformity reader's
      // finding 9 and the adequacy reader's `S3`, reached from opposite ends. The fallback existed
      // so the clauses would report WHICH claim failed rather than dying on a null; what it did was
      // hand them the CALLER'S OWN FOLD, so where `done` never settles the invariant below compared
      // `foldedA` with itself — P20 decision 2's headline claim, one route compared with itself,
      // which is the shape W77's adequacy reader closed one item ago. Measured then: the W77 revert
      // cost 4, and the two clauses that did not fire were exactly those two.
      stateA: settledA,
      foldedA,
      regionSeen,
      regionFolded,
      outcomeB: settledB !== null ? settledB.outcome : 'NEVER SETTLED',
      stoppedByB: settledB !== null ? (settledB.stoppedBy ?? null) : null,
      settledBWithARunState: settledB !== null && typeof settledB === 'object' && 'outcome' in settledB,
      // The flows this block STARTED, in order — so `pairRunCount` adds a LENGTH. The adequacy
      // reader's `S10`: with `? 2 : 0` the derivation bought honesty against DELETION and nothing
      // against a wrong constant, and one token printed `56 real runs` with every check green.
      runs: [FJ.flowId, UC.flowId],
    };
  } finally {
    // **In a `finally`, because a scheduler left running keeps the process alive** and would turn
    // any failure above into no verdict at all — the second half of Q323.
    await rt.shutdown();
  }
} catch (err) {
  // **A crash is not a detection** — `doc/workflow.md` section 4, and W67's shim run carries the
  // same guard for the same reason: this block sits outside the row loop, so a throw here would take
  // the whole file down with exit 1 and ZERO failure lines.
  //
  // **It does NOT catch a `done` that rejects, and the first version of this message said it did** —
  // the adequacy reader's `S11`, measured: a runtime made to reject `done` on a `stopped` run kills
  // this file at ROW 13, forty rows above here, because `runFlow` destructures `{ driver }` and
  // never attaches to its handle, so Node fatally reports the unhandled rejection with **exit 1 and
  // zero FAIL lines**. Narrowed to this block's own runs the guard does fire and names it. *So the
  // guard works and the road that matters never reaches it* — which is
  // [Q321](../doc/questions/q321.md) at L6, and it is ADR 0058's own decisive measurement (the
  // reject road kills the consumer's process) reproduced at this rung.
  failures.push(`consumer road\n      the block THREW before any assertion could run — a crash is not a detection: ` +
    `${err instanceof Error ? err.message.slice(0, 240) : String(err)}`);
}
if (consumerRoad !== null) {
  const key = 'cross-row';
  const c = consumerRoad;
  // (1) the CALL. What a consumer holds after `start` is a pair, and what they passed is one name.
  check(key, 'P20: the consumer passed `start` nothing but `onRegionEvent` — no onFoldInput, no poll, no ' +
    'deadline option and no join policy, so what follows is what `start` RETURNED and not what this file wired',
    c.optionKeys, ['onRegionEvent']);
  // (2) the END, in one line — and WHICH SIDE of the race ended it, which is `finishedBy`'s analogue.
  check(key, 'ADR 0058 rule 3: `await done` WON THE RACE and the deadline did not — the run ended because its own ' +
    'fold reached a terminal outcome, not because a clock did (ADR 0014`s Correction, on the road that has no `finishedBy`). ' +
    'The value is the race`s own verdict, so deleting the race leaves it with no producer',
    c.endedBy, 'done');
  check(key, 'ADR 0058 rule 3: `done` resolved with the TERMINAL RunState — the outcome and isTerminal PROJECTED off the ' +
    'value the promise carried, at the moment it carried it, and never off the caller`s own fold',
    [c.outcomeA, c.terminalA], ['completed', true]);
  // (3) W76's forwarding, on a REAL pool for the first time. W76 bound it at L1 and in AGENTS §10;
  //     nothing had watched a fan-out through `StartOptions` on a scheduler.
  check(key, 'Q297 at L6: a fan-out watched through StartOptions.onRegionEvent on a real FyflowScheduler — two ' +
    'branches opened and two arrived, on the road createRuntime gives a consumer',
    c.regionSeen.slice().sort(), ['branch.arrived 0', 'branch.arrived 1', 'branch.opened 0', 'branch.opened 1']);
  // (4) and the EQUALITY that makes it total rather than true of one topology — W76's adequacy
  //     reader's answer, re-asserted here because this is a different seam: a REAL pool, and a
  //     consumer who passed no `onFoldInput` at all, so the two streams cannot be one variable.
  check(key, 'Q297 at L6, totally: what onRegionEvent received IS the region subsequence of the driver`s own ' +
    'fold inputs, element for element — the invariant the shapes are instances of, on real workers',
    c.regionSeen, c.regionFolded);
  // (5) P20 decision 2 at L6: `done` is the SAME expression moved.
  check(key, 'RN-R2 at L6: `await done` deep-equals `fold(driver.foldInputs())` — the caller`s own expression over ' +
    'the driver`s own sequence, on a real scheduler. The RULE is `RN-R2` (a stepped prefix equals a fold of that prefix), ' +
    'which ADR 0058 rule 5 names as the licence for keeping ONE RunState; P20 decision 2 is the plan`s wording of it',
    c.stateA === null ? 'NEVER SETTLED' : JSON.stringify(c.stateA), JSON.stringify(c.foldedA));
  // (6) RUN B — ADR 0058 rules 3 and 4, which had no observer at L6 and none on real workers.
  assertThat(key, 'ADR 0058 rule 3 on a REFUSAL: `done` RESOLVED with a RunState rather than rejecting — a rejection ' +
    'would have arrived as a throw at the catch above, and a non-settlement as the deadline`s null',
    c.settledBWithARunState, `settled with: ${JSON.stringify(c.outcomeB)}`);
  check(key, 'ADR 0058 rule 4: a driver refusal resolves `done` with outcome `stopped` carrying `stoppedBy` — ' +
    '`failRun` appends the stopped element BEFORE it calls onRunFailure, so a refusal is already terminal when a consumer hears of it',
    [c.outcomeB, (c.stoppedByB ?? '').split(':')[0]], ['stopped', 'UncloneableResult']);
  // (7) the PAIR, asserted rather than arranged — rule 8's fourth requirement on the set.
  assertThat(key, 'and the two runs of this block are a PAIR: one flow completes and the other is refused, so ' +
    '`completed` above is a measurement rather than a constant this block could have printed either way',
    c.outcomeA !== c.outcomeB,
    `run A ${c.outcomeA}, run B ${c.outcomeB}`);
  // ---- the CONTROLS, named as subjects beside the claims (`doc/workflow.md` v0.18).
  //
  // **They guard VACUITY and not merely EMPTINESS, and the first version guarded only emptiness** —
  // the adequacy reader's `S5`, which is v0.18's own clause FOLLOWED and SHORT for the third and
  // fourth time (W63's block, then W58's, then these). Its test was *make each claim vacuous without
  // tripping its control*, and all three fell: a one-token re-source made two of the claims compare
  // a list with itself while both `length > 0` readings stayed true, because a re-sourced list is
  // exactly as non-empty as the one it came from. **The two IDENTITY controls below are what an
  // emptiness control cannot be**: they refuse the two sides of a comparison BEING the same value,
  // which is the whole of that probe class. And the third was worse than weak — it asserted
  // `stoppedBy` is a non-empty string, which the claim beside it ENTAILS, so no tree could make it
  // fire alone. *A control entailed by its own claim is a fourth claim.*
  assertThat(key, 'CONTROL: the two sides of the region equality are DIFFERENT VALUES — what the consumer`s callback ' +
    'filled is not the array the driver`s own inputs were read into, so the equality above is two sources and not one',
    c.regionSeen !== c.regionFolded && c.regionFolded.length > 0,
    `same array: ${c.regionSeen === c.regionFolded}, length ${c.regionFolded.length}`);
  assertThat(key, 'CONTROL: the two sides of the fold invariant are DIFFERENT OBJECTS — what `done` resolved with is not ' +
    'the state the caller folded, so the equality above is two routes and not one',
    c.stateA !== null && (c.stateA as unknown) !== (c.foldedA as unknown) && Object.keys(c.foldedA.nodes).length > 0,
    `same object: ${c.stateA === c.foldedA}, nodes ${Object.keys(c.foldedA.nodes).length}`);
  assertThat(key, 'CONTROL: `stoppedBy` DISCRIMINATES — run A completed and carries none, so the `stopped` reading above ' +
    'is a property of the refusal rather than something every RunState has. (The first version asserted run B`s stoppedBy ' +
    'is non-empty, which the claim beside it entails — a control no tree could make fire alone)',
    c.stoppedByA === null && typeof c.stoppedByB === 'string' && c.stoppedByB.length > 0,
    `run A stoppedBy: ${JSON.stringify(c.stoppedByA)}, run B: ${JSON.stringify(c.stoppedByB)}`);
}

/**
 * **W82 — P21's EXIT ARTIFACT, second half: the check is a READING, and here is the run that says
 * so with nothing left to argue.**
 *
 * `ADR 0060` decision 3 is the sentence P21 tells an adequacy reader to falsify first: *an item
 * that writes a record, changes a terminal state, or routes differently has broken this decision.*
 * Every observer of that claim so far is L2's, on a fake scheduler. This is the same claim on a
 * real `FyflowScheduler`: **the `nonconforming — eleven words` row run AGAIN, same flow, same
 * payload, same run id, with the one option removed**, and the two runs held identical — the
 * dispatched ids, the log record for record with the clocks zeroed, the folded outcome, and every
 * settled node's result — **with the reports the one thing they differ in.**
 *
 * **The run id is the ROW's, derived from its index and not typed**, which is what makes the two
 * logs literally comparable rather than comparable-after-normalisation: `runFlow` builds its own
 * runtime and therefore its own scheduler, so two drivers minting one id set never meet (`ID-R3`
 * is about two drivers on ONE scheduler, and these are on two).
 *
 * **What it costs, ON and OFF, is a COUNT and not a clock**, which is [Q179](../doc/questions/q179.md)
 * and P21 decision 5. A check whose answer is discarded has exactly one observable — *how many
 * answers it produced* — so that is what is asserted: 2 against 0 over four settlements whose
 * workers all declare an `outputSchema`. The RATIO of the two costs over every result this rung
 * settles is PRINTED beside it and asserted nowhere, because a ratio of two clocks is still two
 * clocks ([Q335](../doc/questions/q335.md), W81).
 */
type CheckOffRun = {
  onKey: string;
  runId: string;
  dispatchedOn: readonly string[];
  dispatchedOff: readonly string[];
  /**
   * **The two arms' logs THEMSELVES, and the claim and its control are two projections of these.**
   *
   * They were four strings — two zeroed and two raw — and that was two sources per arm: this
   * item's own rule-8 pass re-sourced the OFF arm's ZEROED log to the ON arm's and the RAW control
   * passed, because `rawOff` was still reading the real off-run. *A control over a SECOND
   * projection of an arm cannot see the FIRST projection being re-sourced.* One array per arm, and
   * both projections computed where they are asserted, is what closes it.
   */
  logRecordsOn: readonly LogRecord[];
  logRecordsOff: readonly LogRecord[];
  outcomeOn: RunOutcome;
  outcomeOff: RunOutcome;
  resultsOn: string;
  resultsOff: string;
  reportsOn: number;
  reportsOff: number;
  settledDone: number;
  withSchema: number;
  /** The flows this block STARTED, so the printed run count is a length and not a literal. */
  runs: string[];
};
let checkOff: CheckOffRun | null = null;
{
  // **The ON arm is the ROW's own run, not a third one** — so the pair is one variable changed on a
  // run this file already asserts forty ways, rather than two runs nobody else looks at.
  const onIndex = EXPECTED.findIndex((e) => e.key === 'nonconforming — eleven words');
  const onRow = EXPECTED[onIndex];
  const onReport = reports[onIndex];
  if (onIndex < 0 || onRow === undefined || onReport === undefined) {
    failures.push('cross-row\n      the check-OFF pair could not find its ON arm — the row `nonconforming — eleven words` is gone');
  } else {
    try {
      // Every option the row loop passes, MINUS `checkResults`. Written out rather than spread from
      // the row so that a row gaining an option this block does not pass is a visible difference
      // here rather than a silent one.
      const off = await runFlow({
        definition: onRow.definition,
        policy: POLICIES[onRow.policyId],
        runId: `r${onIndex + 1}`,
        payload: onRow.payload,
        predicates,
        threaded: onRow.threaded,
      });
      // **The clocks are zeroed and NOTHING else is** — `observedAt` and the scheduler's four
      // timings are the only fields two runs of one flow may lawfully differ in, and zeroing more
      // than that would be the comparison excusing itself.
      const resultsOf = (r: typeof onReport) => JSON.stringify(
        r.log.filter((x) => x.kind === 'outcome').map((x) => [x.taskId, (x as { result: unknown }).result]));
      const workers = REGISTRY_DOCUMENT.workers ?? {};
      const types = REGISTRY_DOCUMENT.nodeTypes ?? {};
      const settledDone = onReport.log.filter((r) => r.kind === 'outcome' && r.terminalState === 'done').length;
      // **Derived from the DOCUMENT and not from the same walk** — the adequacy reader's finding 8:
      // read off the log with the same predicate, `settledDone` and this become one expression
      // computed twice, and *four settled, four with a schema* is `4 === 4`. The flow's TASK NODES
      // are what the document describes, so the count is a property of the registry.
      const withSchema = onRow.definition.nodes.filter((n) => n.kind === 'task'
        && (workers[types[(n as { type: string }).type]?.worker ?? '']?.outputSchema !== undefined)).length;
      checkOff = {
        onKey: onRow.key,
        runId: `r${onIndex + 1}`,
        dispatchedOn: onReport.dispatched, dispatchedOff: off.dispatched,
        logRecordsOn: onReport.log, logRecordsOff: off.log,
        outcomeOn: onReport.state.outcome, outcomeOff: off.state.outcome,
        resultsOn: resultsOf(onReport), resultsOff: resultsOf(off),
        reportsOn: onReport.nonconforming.length, reportsOff: off.nonconforming.length,
        settledDone, withSchema,
        runs: [onRow.definition.flowId],
      };
    } catch (err) {
      // **A crash is not a detection** — `doc/workflow.md` section 4. This block sits outside the
      // row loop, so a throw here would take the whole file down with exit 1 and ZERO failure lines.
      failures.push(`cross-row\n      the check-OFF pair THREW before any assertion could run — a crash is not a detection: ` +
        `${err instanceof Error ? err.message.slice(0, 240) : String(err)}`);
    }
  }
}
if (checkOff !== null) {
  const key = 'cross-row';
  const c = checkOff;
  // **The clocks are zeroed and NOTHING else is** — `observedAt` and the scheduler's four timings
  // are the only fields two runs of one flow may lawfully differ in, and zeroing more than that
  // would be the comparison excusing itself. Both projections are taken HERE, off the one array
  // per arm the block captured, so the claim and its control cannot read different sources.
  //
  // **What this rung is therefore BLIND to, said rather than left to be assumed** — the adequacy
  // reader's finding 7: a record WRITE into any of those five fields is invisible here. The check
  // holds the record by reference, so `record.observedAt = 0` inside `reportResultSchema` leaves
  // L6 at 1720, 0 failed, and is RED at L1 — `test/driver/result-schema.test.ts` asserts all eleven
  // fields against a literal. So P21 decision 3's *writes a record* is held at L2 and this block
  // holds the other two, *routes differently* and *changes a terminal state*, on real workers.
  const zeroed = (rs: readonly LogRecord[]) => JSON.stringify(rs.map((r) => (r.kind === 'outcome'
    ? { ...r, observedAt: 0, schedulerTimestamp: 0, startTime: 0, endTime: 0, executionTime: 0 }
    : { ...r, observedAt: 0 })));
  const logOn = zeroed(c.logRecordsOn), logOff = zeroed(c.logRecordsOff);
  const rawOn = JSON.stringify(c.logRecordsOn), rawOff = JSON.stringify(c.logRecordsOff);
  // (1) the headline: OR-R13 changes NOTHING about the run. Four clauses, because "nothing" has
  // four observable halves and decision 3 names three of them by name.
  check(key, 'OR-R13 is a READING: with the check ON and OFF the same flow dispatches the same ids — no dispatch moves',
    c.dispatchedOn, c.dispatchedOff);
  assertThat(key, 'and the LOG is identical record for record with only the clocks zeroed — no record is written differently ' +
    'and no terminal state is authored (OR-R3`s source column says terminalState comes from d.state and is never the driver`s)',
    logOn === logOff, `ON ${logOn.slice(0, 200)} / OFF ${logOff.slice(0, 200)}`);
  check(key, 'and the folded outcome is the same — the run proceeds exactly as it would with the check off',
    c.outcomeOn, c.outcomeOff);
  assertThat(key, 'and every settled RESULT is the same value — a result that fails its schema reaches its successor ' +
    'UNALTERED, which is the cost ADR 0060 states rather than hides',
    c.resultsOn === c.resultsOff, `ON ${c.resultsOn.slice(0, 200)} / OFF ${c.resultsOff.slice(0, 200)}`);
  // (2) what it COSTS, on and off, as the only observable a check whose answer is discarded has.
  check(key, 'what the check COSTS the run, ON and OFF, as a COUNT rather than a clock — the reports are the one thing ' +
    'the two runs differ in (Q179, P21 decision 5: a ratio of two clocks is still two clocks)',
    { on: c.reportsOn, off: c.reportsOff }, { on: 2, off: 0 });
  assertThat(key, 'CONTROL for the cost: the OFF arm reported NOTHING on a run whose records DO fail their schemas — a relation ' +
    'between two different things, so it cannot be made true by re-sourcing one side of the pair above to the other',
    c.reportsOff === 0 && c.reportsOn > 0,
    `off ${c.reportsOff} / on ${c.reportsOn}`);
  check(key, 'and the check LOOKED AT every settlement of the run — four settled `done`, four whose worker declares an ' +
    'outputSchema, so the two it stayed silent about are silent by CONFORMANCE and not by absence',
    { settledDone: c.settledDone, withSchema: c.withSchema }, { settledDone: 4, withSchema: 4 });
  // (3) CONTROL: the two sides of every equality above are DIFFERENT RUNS.
  //
  // Each of the four clauses compares two STRINGS, and re-sourcing either side to the other makes
  // all four tautologies while leaving a control over one OPERAND exactly as true as before — which
  // is `doc/workflow.md` v0.21's clause, adopted because every control v0.18 produced fell to
  // precisely that. So this reads the RELATION, in the one form two runs of one flow admit:
  // **the RAW logs must DIFFER while the zeroed ones agree.** `observedAt` and the scheduler's four
  // timings are real clocks, so two runs cannot produce identical bytes — and one run compared with
  // itself cannot produce different ones. *It fails where the claim is VACUOUS and not only where
  // its subject is absent.*
  assertThat(key, 'CONTROL: the two arms are DIFFERENT RUNS of one flow — their RAW logs DIFFER, because the clocks in them ' +
    'are real, while the zeroed logs above agree. A claim made vacuous by re-sourcing one arm to the other fails HERE',
    rawOn !== rawOff && logOn === logOff,
    `raw differ: ${rawOn !== rawOff}, zeroed agree: ${logOn === logOff}`);
  assertThat(key, 'CONTROL: and the ON arm IS the row — same run id, so nothing but the option removed can make the two agree, ' +
    'and the arm this block calls ON is one this file asserts forty other ways',
    c.reportsOn !== c.reportsOff && c.runId === `r${EXPECTED.findIndex((e) => e.key === c.onKey) + 1}`,
    `on ${c.reportsOn} / off ${c.reportsOff} / id ${c.runId}`);
}
/**
 * **WHICH of the two `nonconforming` rows must report `gauge` is DERIVED from the registry
 * DOCUMENT and each row's payload, never from either row's declaration** — W82.
 *
 * The two rows declare their findings as literals, and a literal is bound by whatever compares it.
 * The per-row clauses compare each to the REPORT, so re-sourcing a row's declared side to its own
 * report would make both rows tautologies and leave every count unmoved — v0.21's clause, asked of
 * this item's own headline. **This is the second derivation**: `gauge` returns `words / BUDGET` and
 * its schema declares a `maximum`, so which payloads breach it is arithmetic over two numbers the
 * DOCUMENT states and one the payload states, and neither is anything a run produced.
 *
 * *It is the discriminating property of the pair, asserted rather than rested on* — rule 8's fourth
 * requirement on the set.
 */
{
  const gauge = (REGISTRY_DOCUMENT.workers ?? {}).gauge as unknown as
    { outputSchema?: { properties?: { load?: { maximum?: number } } } } | undefined;
  const max = gauge?.outputSchema?.properties?.load?.maximum;
  // The budget is the worker's, read from its own module rather than repeated here: ten words, the
  // number the schema's `maximum: 1` is a fraction OF.
  const BUDGET = 10;
  const wordsIn = (p: { text?: string }) => (p.text ?? '').split(' ').filter((w) => w.length > 0).length;
  const rows = EXPECTED.map((e, i) => [e, `r${i + 1}`] as const).filter(([e]) => e.definition.flowId === 'l6-nonconforming');
  assertThat('cross-row', 'the registry DOCUMENT declares a `maximum` for gauge`s `load`, so the rows below have a second source',
    typeof max === 'number' && rows.length === 2, `maximum ${String(max)} over ${rows.length} row(s)`);
  if (typeof max === 'number' && rows.length === 2) {
    const derived = rows
      .filter(([e]) => wordsIn(e.payload) / BUDGET > max)
      .map(([, id]) => `${id}:gauge:-:0`).sort();
    const declared = rows
      .flatMap(([e, id]) => (e.nonconforming?.[`${id}:gauge:-:0`] !== undefined ? [`${id}:gauge:-:0`] : []))
      .sort();
    check('cross-row', 'which row must report `gauge` is ARITHMETIC over the document`s declared maximum and each payload`s word ' +
      'count — one of the two, derived without reading either row`s declaration or any run',
      declared, derived);
    // And the FINDING's own text names the document's bound rather than a number typed beside it.
    for (const [e, id] of rows) {
      const says = e.nonconforming?.[`${id}:gauge:-:0`];
      if (says !== undefined) {
        check('cross-row', 'and the finding it declares names the bound the DOCUMENT declares', says, `$.load above maximum ${max}`);
      }
    }
    assertThat('cross-row', 'CONTROL: the two rows DISAGREE about gauge — exactly one of them is in that set, so the clause above ' +
      'is a discrimination rather than a count, and a worker that always failed would put both there',
      derived.length === 1 && rows.length === 2, `${derived.length} of ${rows.length} rows breach the declared bound`);
  }
}
/**
 * **The check is OFF everywhere it was not asked for — W82, and it is the switch's OFF position as
 * an assertion about the DRIVER rather than a fact about one row.**
 *
 * `onNonconformingResult`'s PRESENCE is the whole of the switch (ADR 0060 decision 4). So a driver
 * that checked a settlement nobody asked it to check would be reported here on every row at once —
 * and, because two of this rung's rows DO ask and are reported, the clause is a partition rather
 * than an emptiness test.
 */
/**
 * **`settledOwnKeys` is recorded for EVERY settled task on EVERY row — W82, the adequacy reader's
 * finding 6.**
 *
 * The field's own comment says so and calls the rows that do not declare it the control; nothing
 * held it. Measured by that reader: narrowing the RECORDING to task ids containing `:stamp:` costs
 * **zero**, because the value is read at exactly the two ids the two `nonconforming` rows declare.
 * So the sentence was a claim about a harness with no assertion under it, and this is the assertion:
 * every settled task of every row whose result is an OBJECT has an entry, derived from each row's
 * own log rather than from the field it checks.
 */
{
  const missing: string[] = [];
  let objectResults = 0;
  EXPECTED.forEach((e, i) => {
    const r = reports[i];
    if (r === undefined) return;
    for (const rec of r.log) {
      if (rec.kind !== 'outcome' || typeof rec.result !== 'object' || rec.result === null) continue;
      objectResults++;
      if (r.settledOwnKeys[rec.taskId] === undefined) missing.push(`${e.key}: ${rec.taskId}`);
    }
  });
  check('cross-row', 'every settled task whose result is an OBJECT has its own key set recorded, on every row — the observer the ' +
    'two nonconforming rows read is recorded for all of them, which is what makes those rows` declarations a sample rather than the whole of it',
    missing, []);
  assertThat('cross-row', 'CONTROL: and there are MANY more of those than the two ids any row declares — so the clause above ranges ' +
    'over the rung rather than over the two settlements it is pointed at',
    objectResults > 20, `${objectResults} settled object results across the rung`);
}
{
  const asked = EXPECTED.filter((e) => e.checkResults === true).map((e) => e.key).sort();
  const reported = EXPECTED.filter((_, i) => (reports[i]?.nonconforming.length ?? 0) > 0).map((e) => e.key).sort();
  check('cross-row', 'OR-R13 reported on exactly the rows that ASKED for the check, both ways — the callback`s presence is the switch',
    reported, asked);
  assertThat('cross-row', 'CONTROL: and that set is NOT every row — forty-eight rows ran with the check off and were reported on none, ' +
    'so the clause above is a partition rather than an emptiness test',
    asked.length > 0 && asked.length < EXPECTED.length, `${asked.length} of ${EXPECTED.length} rows asked`);
}

/**
 * **Block (2f) — W86, P22's EXIT ARTIFACT, and the claim no row could make alone: TWO INSTANCES OF
 * ONE OPENER HELD COLLECTIONS AT ONE INSTANT.**
 *
 * The rows above assert what each instance CARRIED. That is the answer a per-instance key gives,
 * and on a run where the instances never overlap it is the answer the WRONG key gives too:
 * [ADR 0046](../doc/decisions/0046-a-run-retains-what-its-tasks-returned-and-a-region-releases-its-collection-when-its-join-becomes-terminal.md)
 * rule 3 releases a region's collection the moment its join becomes terminal, so a driver that
 * filed `arrivals` under the opener ALONE would fill, read and empty one entry per instance in turn
 * and report exactly the right collections. **The mis-keying is observable only where two instances
 * are alive together** — [Q349](../doc/questions/q349.md), and
 * [W85](../doc/work-items/w85-what-a-nested-region-carries-and-how-it-ends.md) had to ARRANGE that
 * by hand at L2 because a fake scheduler settles what you tell it to.
 *
 * **A real pool does not arrange it, so this DERIVES it from the run rather than hoping for it.**
 * The walk below reads the fold-input sequence — `branch.arrived` opens an instance's window,
 * `joinSettled` closes it, which is `JP-R12`'s window and `RN-R13`'s release stated as a walk — and
 * reports, per instance whose join became terminal, **which OTHER instances of the same opener were
 * still holding at that moment.** Nothing is declared beside it except the answer.
 *
 * **Three controls, each with the tree on which it fails named** (`doc/workflow.md` v0.22 — *a
 * control is one only if you can NAME THE TREE on which it fails and its claim passes*):
 *
 *   - the CONTROL ROW is the same flow at ONE item, where the same walk must report that nothing
 *     overlapped — so the detector is not a constant;
 *   - over every ROW the rung runs, exactly one has two instances of one opener holding at once, so the
 *     detector is not *true of everything*; *(this read *the WHOLE rung*, which W90's block (2g) made false — it runs
 *     `fan-out-per-item` at two items twenty-odd times more. W90's conformity reader.)*
 *   - and the ARRANGEMENT that makes the closing order determinate is asserted as a fact about the
 *     run — `shard@0` settled before `shard@1`, and `recheck` ran under instance 0 alone — so a
 *     stagger that stopped working fails HERE rather than turning the overlap into a coin flip
 *     ([W17](../doc/work-items/w17-the-all-exit-row-at-l6.md)'s `joinSettledBy`, whose finding was
 *     exactly that a row can stop reaching the path it exists for, silently).
 */
{
  /**
   * **What a run's fold-input sequence says about when each region INSTANCE was holding.**
   *
   * `branch.arrived` is the first thing `JP-R12` records and `joinSettled` is the moment ADR 0046
   * rule 3 releases — so the set between them IS the driver's `arrivals` for that instance, read
   * from the sequence a consumer receives rather than from the driver's internals. The measurement
   * at a close is taken BEFORE the release, because *the instant the join became terminal* is
   * precisely when a mis-keyed collection would hand it somebody else's entries.
   */
  const holdingWalk = (r: RunReport) => {
    const holding = new Map<string, Set<string>>();
    const closedOrder: string[] = [];
    const othersAtClose: Record<string, string[]> = {};
    let maxTogether = 0;
    for (const inp of r.inputs) {
      if (inp.kind === 'region' && inp.event.type === 'branch.arrived') {
        const s = holding.get(inp.event.regionId) ?? new Set<string>();
        s.add(inp.event.regionPath);
        holding.set(inp.event.regionId, s);
        maxTogether = Math.max(maxTogether, s.size);
      } else if (inp.kind === 'joinSettled') {
        const s = holding.get(inp.regionId) ?? new Set<string>();
        maxTogether = Math.max(maxTogether, s.size);
        closedOrder.push(`${inp.regionId}@${inp.regionPath}`);
        othersAtClose[`${inp.regionId}@${inp.regionPath}`] = [...s].filter((p) => p !== inp.regionPath).sort();
        s.delete(inp.regionPath);
      }
    }
    return { maxTogether, closedOrder, othersAtClose };
  };

  const ARTIFACT = 'fan-out-per-item / P22 — a map whose branch opens a MAP, two instances of one opener, overlapping';
  const CONTROL = 'fan-out-per-item / ONE item (the control) — one instance, so no two of them ever hold at once';
  // **The two rows this block is about are LOOKED UP BY KEY, so it REPORTS rather than crashes** —
  // W86's own rule 8 pass, probe `d1`, and it is the shape `doc/workflow.md` section 4 names: *a
  // crash is not a detection*, because it cannot tell a fired clause from a broken harness. Renaming
  // one of the two keys made `findIndex` return `-1`, `reports[-1]` `undefined`, and the walk below
  // died in a `TypeError` naming a helper — loud, at exit 1, and with ZERO failure lines, while
  // `ROW_KEYS` two hundred lines further down would have named exactly what left and never ran.
  // W59 closed this shape for the ROW LOOP and W67 found it twice more in what that item added;
  // this is the third file-level occurrence and the first in a block that indexes `reports` by key.
  const reportFor = (key: string): RunReport | undefined => reports[EXPECTED.findIndex((e) => e.key === key)];
  const artifact = reportFor(ARTIFACT);
  const control = reportFor(CONTROL);
  assertThat('cross-row', 'the two `fan-out-per-item` rows this block is about both RAN — a key that stopped matching is a ' +
    'FAIL line naming it here, never a TypeError two hundred lines before ROW_KEYS could say what left',
    artifact !== undefined && control !== undefined,
    `artifact: ${artifact === undefined ? 'missing' : 'present'}, control: ${control === undefined ? 'missing' : 'present'}`);
  if (artifact === undefined || control === undefined) {
    for (const f of failures) console.log(`  FAIL  ${f}`);
    exit(1);
  }
  const walkA = holdingWalk(artifact);
  const walkB = holdingWalk(control);

  // **(i) The shape itself, read from the DOCUMENTS this rung runs and not from a row key.**
  // An opener sits inside a `map` region exactly when some MAP region's member set contains it —
  // which is the condition `FD-V25` and W33's refusal were both about — and before this item no
  // flow in either corpus had one (the key measurement: 0 of 50).
  const openersInsideAKindOfRegion = (kind: 'map' | 'fanout') => {
    const out: string[] = [];
    for (const e of EXPECTED) {
      const rs = allRegions(buildGraph(e.definition), e.definition);
      for (const r of rs) {
        if (rs.some((o) => o.fanoutId !== r.fanoutId && o.opensWith === kind && o.members.has(r.fanoutId))) {
          out.push(`${e.key.split(' /')[0]}:${r.fanoutId}`);
        }
      }
    }
    return [...new Set(out)].sort();
  };
  check('cross-row', 'ADR 0062 rule 4: L6 runs a region whose opener sits INSIDE a `map` region — the shape W33 refused at ' +
    'Driver construction — and the openers that do are exactly W86`s `map` in a `map` and W94`s `fanout` in a `map`, both ways',
    // **+1 since W94**: the TV ingest's `beside` is a FANOUT opened once per file inside `episodes`, so it is the second
    // opener here and the first of the two kinds ADR 0062 rule 4 names together — `fanout`-in-`map`.
    openersInsideAKindOfRegion('map'), ['fan-out-per-item:perShard', 'tv-ingest:beside']);
  // **The SAME set by a completely different road — ADR 0062 consequence 6** — and it is the
  // adequacy reader's finding 2, BLOCKING: the clause above could have its `map` arm HARD-CODED to
  // `perShard` with the `fanout` arm left real, and the declared control (which asks that the
  // fanout arm find something else) passed unchanged, because it was written against a detector
  // that hard-codes BOTH arms. *A control that exercises the other arm does not bind this one.*
  //
  // `branchPathOf` throws `ID-R6` for exactly the openers a static walk cannot path, which is
  // exactly the openers inside a `map` region — *those three are what make the derived key TOTAL*.
  // Two roads to one set: a membership over the region sets, and a REFUSAL from the shipped
  // derivation. Hard-coding either is red on the other.
  {
    const throwsId6: string[] = [];
    for (const e of EXPECTED) {
      const rs = allRegions(buildGraph(e.definition), e.definition);
      for (const r of rs) {
        // **The catch names the CLASS, and a bare one cost this clause its whole meaning on its
        // first run**: `branchPathOf` was not in this file's import list, so every call threw a
        // `ReferenceError`, the bare `catch` read all 37 of them as the refusal, and the clause
        // reported the entire corpus. *A `catch` that treats ANY throw as the answer is an
        // assertion about its own wiring* — `doc/workflow.md` section 4's *a crash is not a
        // detection*, on the expected side of a comparison.
        try {
          branchPathOf(rs, r.fanoutId);
        } catch (err) {
          if (!(err instanceof UnresolvedBranchPath)) throw err;
          throwsId6.push(`${e.key.split(' /')[0]}:${r.fanoutId}`);
        }
      }
    }
    check('cross-row', 'ADR 0062 consequence 6, the SAME set by another road: the openers `branchPathOf` REFUSES with ID-R6 — ' +
      'a static walk cannot supply a map`s item index — are exactly the openers inside a map region, both ways',
      [...new Set(throwsId6)].sort(), openersInsideAKindOfRegion('map'));
  }
  // **CONTROL: the detector is about the enclosing region's KIND and not about nesting.** Asked of
  // `fanout` it returns the corpus's long-standing nested regions — which is what makes the empty
  // answer above a fact about maps rather than a walk that finds nothing. Without it, a detector
  // that always returned `[]` for a `fanout` and hard-coded `perShard` would pass.
  assertThat('cross-row', 'CONTROL: and the same detector asked about a FANOUT region finds the corpus`s long-standing nested ' +
    'ones and NOT this flow`s — so it reads the enclosing region`s kind',
    openersInsideAKindOfRegion('fanout').length > 0 &&
      !openersInsideAKindOfRegion('fanout').includes('fan-out-per-item:perShard'),
    `fanout-nested openers: ${openersInsideAKindOfRegion('fanout').join(', ') || '(none)'}`);

  // **(ii) One opener, N instances — ADR 0062 rule 1, and the arity is the PAYLOAD's.**
  check('cross-row', 'ADR 0062 rule 1: one opener is entered once per outer item, and the two rows` instance keys differ ' +
    'in exactly the word count of their payloads',
    { artifact: Object.keys(artifact.state.regions['perShard'] ?? {}).sort(), control: Object.keys(control.state.regions['perShard'] ?? {}).sort() },
    { artifact: ['0', '1'], control: ['0'] });

  // **(iii) THE OVERLAP, derived from the run.** At the instant `perShard@1`'s join became terminal
  // — the moment ADR 0046 rule 3 releases it — instance `0` was still holding. That is the state in
  // which a collection keyed by the opener alone hands one instance the other's entries, and it is
  // the only state in which the key is observable at all.
  check('cross-row', 'ADR 0062 and Q349: at the instant perShard@1`s join became terminal, perShard@0 was STILL HOLDING — ' +
    'two instances of ONE opener held collections at one instant, derived from the run`s own fold-input sequence',
    walkA.othersAtClose['perShard@1'], ['0']);
  // **A SECOND ROAD to the same fact, and it is what the four controls could not supply** — the
  // adequacy reader's finding 1, BLOCKING: `maxTogether`, `closedOrder` and `othersAtClose` are
  // three projections of ONE walk, so a control over any of them leaves the others free, and the
  // clause above was made a tautology — `othersAtClose['perShard@1'] = ['0']` keyed off how many
  // regions the run closed — **with all four controls green**. *A relation over a sequence needs a
  // second EXPRESSION over that sequence, not a third projection of the same one.*
  //
  // This reads the sequence's INDICES and never `holdingWalk`: instance 0's first arrival must come
  // BEFORE instance 1's join settles, and instance 0's own join must come AFTER it. That is the
  // overlap stated as an ordering rather than as a set, and on the tree where the overlap does not
  // happen (the second pass's road flattened) it is RED for the same reason the clause above is.
  {
    const at = (pred: (x: FoldInput) => boolean) => artifact.inputs.findIndex(pred);
    const firstArrival = (rp: string) => at((x) => x.kind === 'region' && x.event.type === 'branch.arrived' &&
      x.event.regionId === 'perShard' && x.event.regionPath === rp);
    const settledAt = (rp: string) => at((x) => x.kind === 'joinSettled' && x.regionId === 'perShard' && x.regionPath === rp);
    const [a0, s1, s0] = [firstArrival('0'), settledAt('1'), settledAt('0')];
    assertThat('cross-row', 'and the SAME fact read off the sequence`s own INDICES rather than off that walk: perShard@0`s first ' +
      'arrival precedes perShard@1`s join settling, which precedes perShard@0`s — a second EXPRESSION, not a third projection',
      a0 >= 0 && s1 > a0 && s0 > s1, `arrived@0 at ${a0}, settled@1 at ${s1}, settled@0 at ${s0}`);
  }
  // **(iv) And the NON-FIRST instance closed FIRST.** Q353: instance 0 is also `values()[0]`, so a
  // driver that read *the first instance* instead of *this instance* is indistinguishable from a
  // correct one wherever instance 0 closes first. The order is the arrangement's whole point.
  check('cross-row', 'Q353: and the NON-FIRST instance closed FIRST — so `values()[0]` and *this instance* are different ' +
    'answers here, which is what makes the key discriminating rather than merely present',
    walkA.closedOrder, ['perShard@1', 'perShard@0', 'perWord@-']);
  // **CONTROL 1: the same walk on the same flow at ONE item.** The tree on which the two clauses
  // above fail while their claims pass is this one — it runs the identical document and the
  // identical `recheck` road, and the derivation must report that nothing overlapped.
  check('cross-row', 'CONTROL: the same flow at ONE item — the same walk reports that no two instances of one opener ever ' +
    'held at once, so the two clauses above are claims about THIS run rather than constants',
    { together: walkB.maxTogether, others: walkB.othersAtClose['perShard@0'], closed: walkB.closedOrder },
    { together: 1, others: [], closed: ['perShard@0', 'perWord@-'] });
  // *(W94: fifty-five rows of a hundred and fifty-four runs now, and FOUR hold two instances at once — the paragraph just
  // below this one's first sentence was left reading the old figures by W94's first cut; its conformity reader, 5d.)*
  // **CONTROL 2: over every ROW.** Fifty-two rows of the rung's hundred runs, and exactly one of them ever had two
  // instances of one opener holding together *(this read *the whole rung* and *SIXTY real runs* — true until W90's
  // forty runs, which the walk does not reach. W90's conformity reader)* — so the walk is not *true of everything it is shown*.
  // *(This comment read *fifty-eight*, which is the count this item's own two rows take to sixty —
  // and one of the two is the single positive case, so the figure understated the control by
  // exactly the runs that make it one. W86's conformity reader, finding 7.)*
  // **and its own REACH is inside it** — the adequacy reader's finding 5: a control whose whole
  // content is its UNIVERSE is worth nothing once the universe can be narrowed for free, and
  // restricting this filter to the two rows the block is already about cost ZERO.
  const walksHere = EXPECTED.map((_, i) => holdingWalk(reports[i]!));
  // **`rowsWalked` is incremented INSIDE the predicate for the same reason**: the first version
  // read `walksHere.length`, which a narrowed FILTER does not move. The reader's exact edit
  // replaces this predicate whole, so a counter inside it goes to zero and the pair is red.
  let rowsWalked = 0;
  const runsWithTwoTogether = EXPECTED.filter((_, i) => { rowsWalked++; return walksHere[i]!.maxTogether > 1; }).map((e) => e.key);
  // **Four since W94, and the three it adds are DERIVED from the rows that declare a gate**: the TV ingest opens a `beside`
  // fan-out per file, all seven at once, and each holds its thumbnail's arrival until the gate road exits. **That is an
  // ARRANGEMENT and not construction** — [Q394](../doc/questions/q394.md), found by P24's retro applying `doc/workflow.md`
  // rule 8 obligation (f): `Thumbnail` waits 5 ms and `identify` 30 ms per MB, so the thumbnail arrives first; delayed to
  // 300 ms, this clause was RED in both runtimes with the TV rows gone from `only`. This comment said *by construction*
  // until W96. So the arrangement's own EFFECT is asserted beside the claim, W17's `joinSettledBy`: in every gated row,
  // every `beside` instance's thumbnail ARRIVED before its gate road ENDED — read off the sequence's own indices, a second
  // expression over the same run rather than a third projection of the walk. The control's claim is unchanged: the walk
  // is not true of everything it is shown (fifty-one of fifty-five rows read one).
  const thumbnailFirst = (r: RunReport): boolean => {
    const at = (type: string, branchPath: string) => r.inputs.findIndex((x) => x.kind === 'region' &&
      x.event.type === type && x.event.regionId === 'beside' && x.event.branchPath === branchPath);
    const instances = [...new Set(r.inputs.flatMap((x) => x.kind === 'region' && x.event.regionId === 'beside' &&
      x.event.type === 'branch.opened' ? [x.event.regionPath] : []))];
    return instances.length > 0 && instances.every((p) => {
      const arrived = at('branch.arrived', `${p}.0`);
      const ended = at('branch.exited', `${p}.1`);
      return arrived >= 0 && ended >= 0 && arrived < ended;
    });
  };
  const gatedKeys = EXPECTED.filter((e) => e.gate).map((e) => e.key);
  check('cross-row', 'CONTROL: and across every row this rung runs, ONLY the P22 artifact and the rows through a gate have two instances of one opener holding ' +
    'together — the walk is not true of everything it is shown, and it was SHOWN every one of them; and the gated rows hold by their ARRANGEMENT, ' +
    'every thumbnail arriving before its gate road ended (Q394)',
    { only: runsWithTwoTogether, rowsWalked, arranged: EXPECTED.flatMap((e, i) => e.gate && thumbnailFirst(reports[i]!) ? [e.key] : []) },
    { only: [ARTIFACT, ...gatedKeys], rowsWalked: EXPECTED.length, arranged: gatedKeys });

  // **`soleRegion` REFUSES a multi-instance opener and ANSWERS a single-instance one, and this is
  // its first live case anywhere** — the adequacy reader's finding 6, and it is W84's conformity
  // reader's finding 10 reached from the other side. That helper returns `undefined` rather than
  // guessing precisely because *returning either would make a row's verdict depend on which
  // instance the driver entered first*, and until this row existed the refusal had no instance:
  // W84's adequacy reader measured `return byPath[paths[0]!]` at ZERO at both L6 rungs. **The two
  // rows are the pair** — the same opener, the same document, one word of payload apart.
  assertThat('cross-row', 'W84 finding 10: `soleRegion` REFUSES the opener that has TWO instances and ANSWERS the one that ' +
    'has one — the same opener in two runs, so the refusal is a function of the RUN and not of the name',
    soleRegion(artifact.state, 'perShard') === undefined && soleRegion(control.state, 'perShard') !== undefined,
    `artifact: ${soleRegion(artifact.state, 'perShard') === undefined ? 'refused' : 'answered'}, ` +
    `control: ${soleRegion(control.state, 'perShard') === undefined ? 'refused' : 'answered'}`);

  // **(v) ADR 0062 consequence 5, turned from an argument into a value.** *A branch inside an
  // instance carries that instance's path as its own prefix*, so two instances of one opener hold
  // DISJOINT key sets and their collections cannot collide. Asserted as a relation over the run's
  // own regions rather than against a literal: every branch path of every instance must begin with
  // that instance's path, and the union must be every branch that arrived.
  const instanceKeys = (r: RunReport, opener: string) =>
    Object.entries(r.state.regions[opener] ?? {}).map(([path, run]) => [path, Object.keys(run.settled).sort()] as const);
  const keysA = instanceKeys(artifact, 'perShard');
  const prefixed = keysA.every(([path, ks]) => ks.every((k) => k === path || k.startsWith(`${path}.`)));
  const union = keysA.flatMap(([, ks]) => ks);
  assertThat('cross-row', 'ADR 0062 consequence 5: every branch key of an instance carries that instance`s own path as its ' +
    'prefix, so the two collections are DISJOINT and their union is every branch that arrived',
    prefixed && new Set(union).size === union.length && union.length === 5,
    `${JSON.stringify(keysA)}`);

  // **(vi) ADR 0062 rule 3 as a RELATION over every region event this rung emits**, not only over
  // the two rows that declare `regionEventKeys`: a `regionPath` is either `-` or a prefix of the
  // branch path the event is about. One expression, SIXTY runs, and it is the invariant the
  // two rows' literals are instances of.
  // **`runsWalked` is incremented INSIDE the walk, and the first version counted `reports.length`**
  // — which the mutation this clause exists to refuse does not touch. So the reach was asserted
  // beside the finding and still not bound BY it, and the adequacy reader's exact edit survived
  // the fix for it. *A re-run found a defect in the FIX rather than in the product*, which is
  // rule 8's founding observation and what its second pass is for.
  let runsWalked = 0;
  const badPaths = reports.flatMap((r) => { runsWalked++; return r.inputs.flatMap((x) => {
    if (x.kind !== 'region') return [];
    const ev = x.event as { regionId: string; regionPath: string; branchPath: string };
    const ok = ev.regionPath === '-' ? !ev.branchPath.includes('.')
      : ev.branchPath === ev.regionPath || ev.branchPath.startsWith(`${ev.regionPath}.`);
    return ok ? [] : [`${ev.regionId}@${ev.regionPath} b=${ev.branchPath}`];
  }); });
  // **The REACH is inside the claim** — the adequacy reader's finding 4, BLOCKING: an ABSENCE over
  // an unbound universe is satisfied by walking nothing, and `reports.slice(0, 1)` — one report, and
  // not even a W86 row — cost ZERO. The control beside it could not see that, because it is a
  // DIFFERENT expression and binds its own universe. So the number of runs walked is asserted
  // beside the finding, derived from `EXPECTED` rather than typed.
  check('cross-row', 'ADR 0062 rule 3: every RegionEvent`s regionPath is the opener`s own path and its branchPath extends ' +
    'it — the pair IS the region, over every ROW this rung runs',
    { bad: badPaths, runsWalked }, { bad: [], runsWalked: EXPECTED.length });
  // **CONTROL: and the relation is not vacuous on a rung of top-level regions**, where it is
  // satisfied by any depth-1 branch path.
  //
  // *(This comment read **"Before this item every region event here carried `regionPath: '-'`"**,
  // which is FALSE and was measured so by the adequacy reader, finding 13: **28** non-root events
  // across five variants predate W86 — W23's and W35's nested rows emit them — against the **14**
  // these two rows add, so the control is satisfied two-to-one by runs this item did not write. The
  // control is sound and its stated reason was not. **And the census names a scope this item does
  // not otherwise state**: `branch.lost` carries a non-root `regionPath` NOWHERE at L6, so ADR 0062
  // rule 3's six-variant enumeration is observed at FIVE of six at this rung and at two of six in
  // the artifact's own flow — W85 drives the other four at L2, under nesting, at a non-first
  // instance.)*
  const nonRootEvents = reports.flatMap((r) => r.inputs.filter((x) =>
    x.kind === 'region' && (x.event as { regionPath: string }).regionPath !== '-')).length;
  assertThat('cross-row', 'CONTROL: and this rung emits region events whose regionPath is NOT `-` — without them the ' +
    'relation above is satisfied by every top-level region and says nothing',
    nonRootEvents > 0, `${nonRootEvents} events at a non-root instance`);

  // **(vii) `JP-R12` at TWO LEVELS on real workers.** The outer join's collection is keyed by the
  // outer branch paths, and each VALUE is the inner instance's own collection — derived from the
  // run's regions rather than from the row's literal, so the two roads to one value can disagree.
  const outerPayload = (artifact.state.nodes['r51:publish:-:0']?.result as { joinPayload?: Record<string, Record<string, unknown>> })?.joinPayload ?? {};
  check('cross-row', 'JP-R12 at TWO LEVELS on real workers: the outer collection`s keys are the outer branches and each ' +
    'VALUE`s keys are that instance`s own collection, derived from the run`s regions',
    Object.fromEntries(Object.entries(outerPayload).map(([k, v]) => [k, Object.keys(v).sort()])),
    Object.fromEntries(keysA.map(([path, ks]) => [path, ks])));

  // **(viii) The ARRANGEMENT, asserted rather than trusted.** Two facts of the run make the closing
  // order determinate: `shard@0` settled before `shard@1` (the worker's work is proportional to the
  // word it splits, and `ja` is shorter than `eee`), and `recheck` ran under instance 0 alone (one
  // shard of one word scores below fifty). Neither is a clock; both are read from the run.
  const settleOrder = artifact.log.filter((r) => r.taskId.includes(':shard:')).map((r) => r.taskId);
  const recheckUnder = artifact.dispatched.filter((id) => id.includes(':recheck:')).map((id) => id.split(':')[2]!.split('.')[0]);
  check('cross-row', 'and the ARRANGEMENT that makes that order determinate is a fact about the run: shard@0 settled first ' +
    'and the second pass ran under instance 0 alone — a stagger that stopped working fails HERE',
    { shards: settleOrder, recheckUnder },
    { shards: ['r51:shard:0:0', 'r51:shard:1:0'], recheckUnder: ['0'] });

  // **(ix) P22 prediction 3, the REACH, asserted from the DOCUMENT.** *A consumer writing "score
  // each item, then fan out per item" needs no reshaping node and no second flow.* What that means
  // on this tree is checkable: the flow declares no `needs` and no `transform` anywhere, and the
  // road from the outer map's branch entry to the inner map is ONE node — the item's own task. A
  // reshaping node would be a second one whose only job is to change the shape.
  const fopiNodes = FOPI.nodes as unknown as { id: string; kind: string; needs?: unknown; transform?: unknown; edges?: { to: string }[] }[];
  const outerBranch = fopiNodes.find((n) => n.id === 'shard')!;
  check('cross-row', 'P22 prediction 3, the REACH: this flow declares NO needs and NO transform, and the road from the outer ' +
    'map`s branch entry to the inner map is ONE node — the workaround ADR 0040 exists to remove is gone for this shape',
    {
      needs: fopiNodes.filter((n) => n.needs !== undefined).map((n) => n.id),
      transforms: fopiNodes.filter((n) => n.transform !== undefined).map((n) => n.id),
      hop: (outerBranch.edges ?? []).map((x) => x.to),
    },
    { needs: [], transforms: [], hop: ['perShard'] });
}

/**
 * **Block (2g) — W90, P23's EXIT ARTIFACT: a run KILLED mid-run on real workers and RESUMED on a
 * FRESH runtime from a store the consumer built by appending events** —
 * [W90](../doc/work-items/w90-a-run-killed-and-resumed-on-real-workers.md),
 * [ADR 0064](../doc/decisions/0064-a-checkpoint-is-the-whole-event-sequence-and-a-header-and-it-is-a-copy.md),
 * [ADR 0065](../doc/decisions/0065-a-resume-replays-the-stored-stimuli-refuses-what-it-cannot-regenerate-and-re-dispatches-what-was-in-flight.md).
 *
 * **What a KILL is here, measured before it was relied on** (W90's declaration, re-take 2):
 * `runtime.shutdown()` DRAINS — in both runtimes it waits while tasks are running, a settlement
 * routed during that wait dispatches the next one, and a run killed one settlement in ends
 * COMPLETED inside `shutdown()`. So a shutdown is not a kill. **The kill is the STORE**: the consumer
 * stops appending at the kill point, which is exactly what a process that died would have written,
 * and the shutdown is cleanup whose drain the store never sees. That drain is also what makes
 * at-least-once VISIBLE here — every task the resume runs again already ran in the killed runtime —
 * and it is asserted rather than hidden (claim (8)).
 *
 * **Why it is a block and not an `EXPECTED` row** — W78's finding C: a row runs through `runFlow`,
 * which installs its own `onFoldInput` and keeps its own sequence; this block's whole subject is a
 * consumer's store. Every `await` on a `done` is BOUNDED and every runtime is shut down in a
 * `finally` ([Q323](../doc/questions/q323.md)), and a throw is a FAIL line, never a crash.
 *
 * **What it SELECTS, and the fixture where each well-formed wrong selection DIFFERS** (`doc/workflow.md`
 * rule 8 obligation (a), v0.23):
 *
 *   - **the re-dispatched set** is the in-flight set at the END of the replay, derived from the
 *     KILLED process's own sequence up to its next stimulus past the cut — never from the resumed
 *     driver being judged. The STORED events' in-flight set is the wrong selection W89 corrected P23
 *     prediction 2 away from, and it DIFFERS at the kill points where the lost tail dispatched;
 *   - **the cut** — mid-step at every kill point of the sweep, and one killed run cut both mid-step
 *     and quiescent, which store different lengths and re-dispatch the same set;
 *   - **the store's keys** — the driver's positions across THREE processes, against an arrival
 *     counter per process, which is a different store and is refused;
 *   - **a parked task** is not in flight;
 *   - **"completed identically"** is judged on outcome AND every node, and the control is a second
 *     payload's reference that also completes, with different nodes.
 */
const SWEEP_FLOWS = ['fan-out-per-item', 'triage'];
/** Every run here takes well under a second; ten is a verdict rather than a wait when one never ends (Q323). */
const KILL_RESUME_DEADLINE_MS = 10_000;
/** A refused resume, named — every `runtime.resume` in the block reports through this rather than throwing. */
const refusalOf = (err: unknown): string =>
  err instanceof ResumeRefused ? `ResumeRefused ${err.reason} at ${err.index}` : `${err instanceof Error ? err.name : 'a throw'}: ${String(err).slice(0, 120)}`;
const isStimulus = (i: FoldInput): boolean => i.kind === 'outcome' || i.kind === 'resolution';
// **In KEY order, never insertion order — W97.** The fold inserts a node's key when its task is DISPATCHED, and a dispatch
// can depend on a completion (`recheck` goes out when `grade:0.1` settles), so `JSON.stringify` of `RunState.nodes`
// carried a completion order into every identity that compared two runs' nodes. With `ScoreWorker` threaded
// (`doc/workflow.md` rule 8 obligation (f)) P23's block (2g) went red in both runtimes with every node's state and result
// EQUAL and `recheck`'s key one place earlier — W23's class (a serialisation's key order), latent since W90. *(This said
// *settle* and named (2h) too until W97's conformity reader: the key goes in at dispatch, and (2h) was never red there.)*
const nodesOf = (s: RunState): Record<string, { state: string; result: unknown }> =>
  Object.fromEntries(Object.entries(s.nodes).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([k, v]) => [k, { state: v.state, result: v.result }]));
const sameNodes = (a: RunState, b: RunState): boolean => JSON.stringify(nodesOf(a)) === JSON.stringify(nodesOf(b));
/** Dispatched and never settled in `seq[0, end)`, in dispatch order — `RN-R21`'s set over any prefix. */
const inFlightIn = (seq: readonly FoldInput[], end: number): string[] => {
  const settled = new Set(seq.slice(0, end).flatMap((i) => (i.kind === 'outcome' ? [i.record.taskId] : [])));
  return seq.slice(0, end).flatMap((i) => (i.kind === 'dispatched' && !settled.has(i.taskId) ? [i.taskId] : []));
};
type KillPoint = {
  label: string;
  stored: number;
  /** Where the KILLED process's next stimulus past the cut sits — the end of what a replay regenerates. */
  q: number;
  /** The `resumed` element's ids, read at position `q` of the resumed driver's own sequence. */
  ids: string[] | null;
  derived: string[];
  storedInFlight: string[];
  /** The fresh scheduler's own task map at the instant `runtime.resume` returned — ids in INSERTION order. */
  heldAtReturn: string[];
  /** The same, each id with the PAYLOAD the fresh scheduler holds for it. */
  heldWithPayload: string[];
  /** What the KILLED process's own scheduler held at the kill, in the order it was handed them, with payloads — for the held ids. */
  killedWithPayload: string[];
  ranOnFresh: string[];
  settledInKilled: string[];
  killedOutcome: string;
  positionsFromStored: boolean;
  tailRegenerated: boolean;
  settledRedispatched: string[];
  /** The resumed run's outcome and node projection, and the reference's — the PROJECTIONS, so claim (1) compares values. */
  got: string;
  want: string;
  /** A refusal `runtime.resume` threw, by name — a FINDING, never a crash of this block (the adequacy reader's p9). */
  refused: string;
};
type KillResume = {
  points: KillPoint[];
  expectedLabels: string[];
  k1: { flow: string; ids: string[] | null; fromDocument: string[] }[];
  otherRefSameOutcome: boolean;
  otherRefNodesDiffer: boolean;
  chain: {
    beforeHandle: number; identical: boolean; refused: string; resumes: string[][]; resumedIds: string[][];
    holes: number; foldIsDone: boolean; arrivalDiffers: boolean; arrivalRefused: string;
  } | null;
  cuts: { midStored: number; quietStored: number; quietStimuli: number; midAt: number; quietAt: number; midIds: string[]; quietIds: string[]; refused: string;
    midStoredInFlight: string[]; quietStoredInFlight: string[]; bothCompleted: boolean } | null;
  parked: { ids: string[] | null; before: string; parkedStored: boolean; scoreFirst: boolean; accepted: boolean; refused: string;
    outcome: string; identical: boolean } | null;
  /** Every run this block made on a real scheduler, so the printed run count is a LENGTH. */
  runs: string[];
};
let killResume: KillResume | null = null;
try {
  const runs: string[] = [];
  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
  /** A run nobody killed. `person` resolves the parked task in-process, as a person would. */
  const referenceRun = async (flow: FlowDefinition, payload: unknown, runId: string, person?: (d: Driver) => Promise<void>) => {
    const rt = buildRuntime(false, [flow]);
    try {
      const h = rt.start(flow, payload, { runId });
      runs.push(`${flow.flowId} reference`);
      if (person) await person(h.driver);
      const won = await settleWithin(h.done, KILL_RESUME_DEADLINE_MS);
      if (won.by !== 'done') throw new Error(`the reference run of ${flow.flowId} never settled`);
      return { state: won.value, inputs: h.driver.foldInputs() };
    } finally { await rt.shutdown(); }
  };
  /**
   * **One KILLED process.** The consumer's store is keyed by POSITION and FROZEN at `freeze`'s
   * answer — inside `onFoldInput`, so the cut is mid-step unless `freeze` says to wait a microtask —
   * and the runtime is then shut down. The driver is returned so the killed process's own sequence
   * can be read AFTER the drain.
   */
  const killedRun = async (flow: FlowDefinition, payload: unknown, runId: string, freezeAt: (i: FoldInput, stimuli: number) => 'now' | 'after-this-turn' | 'no') => {
    const rt = buildRuntime(false, [flow]);
    try {
      const store: FoldInput[] = [];
      // Assigned from inside the callback, so declared through a cast: a `let` initialised to `null`
      // is NARROWED to `null` at every later read, and the checks below would type as dead code.
      let mid = null as FoldInput[] | null;
      let quiet = null as FoldInput[] | null;
      let stimuli = 0;
      const h = rt.start(flow, payload, {
        runId,
        onFoldInput: (i, seq) => {
          if (quiet !== null) return;                        // a dead process writes nothing
          store[seq] = structuredClone(i);                   // the consumer's append, BY POSITION
          if (mid === null && isStimulus(i)) {
            const verdict = freezeAt(i, ++stimuli);
            if (verdict === 'now') { mid = store.slice(); quiet = mid; }
            else if (verdict === 'after-this-turn') { mid = store.slice(); queueMicrotask(() => { quiet = store.slice(); }); }
          }
        },
      });
      // **What had arrived when the handle came back** — read off the STORE's length at the instant `start` returned,
      // not counted by a flag: the elements a consumer was handed before it could have written a header.
      const beforeHandle = store.length;
      runs.push(`${flow.flowId} killed`);
      for (let w = 0; quiet === null && w < 3000; w++) await sleep(1);
      // **A kill that never happened is a FINDING, not a throw**: a run that stops short of its kill point (rule 8's `a5`
      // measured one) would otherwise take every clause of this block down with it. The store is kept as it stands.
      const froze = quiet !== null && mid !== null;
      // **What the killed process's own SCHEDULER held at the kill**, in its insertion order — which is `addTask`'s order —
      // each with the payload it was handed: the source the scheduler-side claim compares against, and it reads neither the
      // resumed driver nor either driver's sequence. Read BEFORE `shutdown()`, which clears the map. *(The first version
      // listened for `task.running`, and that event is not heard for every task the drain runs — `grade:1.2` and `audit`
      // settled in the killed driver with no `task.running` delivered, measured; a record that misses work is not a source.)*
      const heldWith: [string, string][] = [...rt.scheduler.tasks.entries()].map(([id, t]) => [id, JSON.stringify(t.payload)]);
      return { header: h.header, mid: mid ?? store.slice(), quiet: quiet ?? store.slice(), driver: h.driver, beforeHandle, froze, heldWith };
    } finally { await rt.shutdown(); }
  };
  /** A FRESH runtime resuming from a store. */
  const resumedRun = async (flow: FlowDefinition, header: CheckpointHeader, events: FoldInput[], sink?: (i: FoldInput, seq: number) => void) => {
    const rt = buildRuntime(false, [flow]);
    try {
      const ran: string[] = [];
      rt.scheduler.addEventListener('task.running', (e: Event) => ran.push((e as unknown as { detail: { id: string } }).detail.id));
      const positions: number[] = [];
      let h: RunHandle;
      try {
        h = rt.resume(flow, { header, events }, { onFoldInput: (i, seq) => { positions.push(seq); sink?.(i, seq); } });
      } catch (err) {
        // **A refused resume is a FINDING, not a crash** — the adequacy reader's p9: unguarded, one kill point refused
        // `diverged` erased every clause of this block, which is the defect family ADR 0065 decides.
        const refused = refusalOf(err);
        return { driver: null, state: null, positions, heldAtReturn: [] as string[], heldWithPayload: [] as string[], ran, refused };
      }
      const held = [...rt.scheduler.tasks.entries()];
      const heldAtReturn = held.map(([id]) => id);
      const heldWithPayload = held.map(([id, t]) => `${id} ${JSON.stringify(t.payload)}`);
      runs.push(`${flow.flowId} resumed`);
      const won = await settleWithin(h.done, KILL_RESUME_DEADLINE_MS);
      return { driver: h.driver, state: won.by === 'done' ? won.value : null, positions, heldAtReturn, heldWithPayload, ran, refused: '' };
    } finally { await rt.shutdown(); }
  };

  // ---- THE SWEEP: every kill point of two flows, each on its own killed process and its own fresh runtime.
  const SWEEP: [string, FlowDefinition, unknown, string][] = [
    ['fan-out-per-item', FOPI, TWO_THEN_THREE, 'kr'],
    ['triage', TRI, TRIAGE_LOW, 'kt'],
  ];
  const points: KillPoint[] = [];
  const expectedLabels: string[] = [];
  const refs: Record<string, RunState> = {};
  for (const [name, flow, payload, runId] of SWEEP) {
    const ref = await referenceRun(flow, payload, runId);
    refs[name] = ref.state;
    const stimuli = ref.inputs.filter(isStimulus).length;
    for (let K = 1; K < stimuli; K++) expectedLabels.push(`${name} K=${K}`);
    for (let K = 1; K < stimuli; K++) {
      const k = await killedRun(flow, payload, runId, (_i, n) => (n === K ? 'now' : 'no'));
      const killed = k.driver.foldInputs();
      const p = k.mid.length - 1;
      let q = killed.findIndex((i, j) => j > p && isStimulus(i));
      if (q < 0) q = killed.length;
      const r = await resumedRun(flow, k.header, k.mid.slice());
      const seq = r.driver?.foldInputs() ?? [];
      const at = seq[q];
      const ids = at?.kind === 'resumed' ? [...at.taskIds] : null;
      const storedSettled = new Set(k.mid.flatMap((i) => (i.kind === 'outcome' ? [i.record.taskId] : [])));
      points.push({
        label: `${name} K=${K}`,
        stored: k.mid.length,
        q,
        ids,
        derived: inFlightIn(killed, q),
        storedInFlight: inFlightIn(k.mid, k.mid.length),
        heldAtReturn: r.heldAtReturn,
        heldWithPayload: r.heldWithPayload,
        killedWithPayload: k.heldWith.filter(([id]) => (ids ?? []).includes(id)).map(([id, payload]) => `${id} ${payload}`),
        ranOnFresh: r.ran,
        settledInKilled: killed.flatMap((i) => (i.kind === 'outcome' ? [i.record.taskId] : [])),
        killedOutcome: fold(killed).outcome,
        positionsFromStored: r.positions.length > 0 && r.positions.every((s, j) => s === k.mid.length + j),
        tailRegenerated: JSON.stringify(seq.slice(p + 1, q)) === JSON.stringify(killed.slice(p + 1, q)) && q > p,
        settledRedispatched: (ids ?? []).filter((id) => storedSettled.has(id)),
        got: !k.froze ? 'NEVER FROZE' : r.refused !== '' ? `REFUSED ${r.refused}` : r.state === null ? 'NEVER SETTLED' : `${r.state.outcome} ${JSON.stringify(nodesOf(r.state))}`,
        want: `${ref.state.outcome} ${JSON.stringify(nodesOf(ref.state))}`,
        refused: r.refused,
      });
    }
  }
  // The K = 1 re-dispatch, from the DOCUMENT: a mid-step cut at the entry's settlement loses exactly
  // what that settlement dispatches — one `shard` per word of the payload, and triage's fan-out branches.
  const triFanout = TRI.nodes.find((n) => n.kind === 'fanout') as { branches: string[] } | undefined;
  const k1 = [
    { flow: 'fan-out-per-item', ids: points.find((p) => p.label === 'fan-out-per-item K=1')?.ids ?? null,
      fromDocument: TWO_THEN_THREE.text.split(' ').map((_, i) => `kr:shard:${i}:0`) },
    { flow: 'triage', ids: points.find((p) => p.label === 'triage K=1')?.ids ?? null,
      fromDocument: (triFanout?.branches ?? []).map((b, i) => `kt:${b}:${i}:0`) },
  ];
  // The CONTROL for "identical": the same flow on another payload also completes, with other nodes.
  const other = await referenceRun(FOPI, ONE_THEN_TWO, 'kr');

  // ---- THE CHAIN: three processes, ONE store keyed by position — and beside it the same events
  // keyed by an ARRIVAL counter per process, the well-formed wrong key.
  let chain: KillResume['chain'] = null;
  {
    const byPosition: FoldInput[] = [];
    const byArrival: FoldInput[] = [];
    let arrivals = 0;
    const p1 = await killedRun(FOPI, TWO_THEN_THREE, 'kr', (_i, n) => (n === 1 ? 'now' : 'no'));
    p1.mid.forEach((e, j) => { byPosition[j] = e; byArrival[arrivals++] = e; });
    // process two, killed again at its third delivered stimulus — its own store frozen by the same rule
    const rt2 = buildRuntime(false, [FOPI]);
    let resumedIds2: string[] = [];
    let p2froze = false;
    let p2refused = '';
    try {
      let frozen = false, stimuli = 0;
      arrivals = 0;
      // **Guarded as every resume here is** — rule 8's pass 2 (`r6`): the fix for the adequacy reader's finding 3 guarded
      // `resumedRun` and left THIS resume, which is called directly, so a refused replay still took the whole block down.
      let h2: RunHandle | null = null;
      try {
        h2 = rt2.resume(FOPI, { header: p1.header, events: byPosition.slice() }, {
          onFoldInput: (i, seq) => {
            if (frozen) return;
            byPosition[seq] = structuredClone(i);
            byArrival[arrivals++] = structuredClone(i);
            if (isStimulus(i) && ++stimuli === 3) frozen = true;
          },
        });
      } catch (err) { p2refused = refusalOf(err); }
      if (h2 !== null) {
        runs.push(`${FOPI.flowId} resumed and killed`);
        for (let w = 0; !frozen && w < 3000; w++) await sleep(1);
        p2froze = frozen;
        const r2 = h2.driver.foldInputs().find((i) => i.kind === 'resumed');
        resumedIds2 = r2?.kind === 'resumed' ? [...r2.taskIds] : [];
      }
    } finally { await rt2.shutdown(); }
    // **A refusal here is a FINDING and not a crash**: a store written under the wrong key is refused by `runtime.resume`,
    // and that must fail the chain's own clauses by name rather than take the whole block down.
    let r3: Awaited<ReturnType<typeof resumedRun>> | null = null;
    let r3refused = '';
    try {
      r3 = await resumedRun(FOPI, p1.header, byPosition.slice(), (i, seq) => { byPosition[seq] = structuredClone(i); });
      r3refused = r3.refused;
    } catch (err) { r3refused = err instanceof Error ? err.message.slice(0, 160) : String(err); }
    const r3at = r3?.driver?.foldInputs().filter((i) => i.kind === 'resumed') ?? [];
    let arrivalRefused = 'NOT REFUSED';
    const rt4 = buildRuntime(false, [FOPI]);
    try {
      try { rt4.resume(FOPI, { header: p1.header, events: byArrival.slice() }); } catch (err) {
        arrivalRefused = err instanceof ResumeRefused ? `${err.reason} at ${err.index}` : `a ${err instanceof Error ? err.name : 'non-Error'}`;
      }
    } finally { await rt4.shutdown(); }
    chain = {
      beforeHandle: p1.beforeHandle,
      identical: p1.froze && p2froze && r3refused === '' && r3 !== null && r3.state !== null && r3.state.outcome === refs['fan-out-per-item']!.outcome && sameNodes(r3.state, refs['fan-out-per-item']!),
      refused: [p2refused, r3refused].filter((x) => x !== '').join('; '),
      resumes: r3?.state?.resumes.map((ids) => [...ids]) ?? [],
      // Process three's sequence holds BOTH `resumed` elements — process two's, FED at its stored position, and its own —
      // so its own is the LAST one; process two's is read off process two's driver, a different process.
      resumedIds: [resumedIds2, ...r3at.slice(-1).map((i) => (i.kind === 'resumed' ? [...i.taskIds] : []))],
      holes: byPosition.length - Object.keys(byPosition).length,
      foldIsDone: r3 !== null && r3.state !== null && JSON.stringify(fold(byPosition)) === JSON.stringify(r3.state),
      arrivalDiffers: JSON.stringify(byArrival) !== JSON.stringify(byPosition.slice(0, byArrival.length)),
      arrivalRefused,
    };
  }

  // ---- THE TWO CUTS of ONE killed run: mid-step at its second stimulus, and quiescent a microtask later.
  let cuts: KillResume['cuts'] = null;
  {
    const k = await killedRun(FOPI, TWO_THEN_THREE, 'kr', (_i, n) => (n === 2 ? 'after-this-turn' : 'no'));
    const mid = await resumedRun(FOPI, k.header, k.mid.slice());
    const quiet = await resumedRun(FOPI, k.header, k.quiet.slice());
    const resumedOf = (d: Driver | null) => {
      const seq = d?.foldInputs() ?? [];
      const at = seq.findIndex((i) => i.kind === 'resumed');
      const e = seq[at];
      return { at, ids: e?.kind === 'resumed' ? [...e.taskIds] : [] };
    };
    const m = resumedOf(mid.driver), qq = resumedOf(quiet.driver);
    cuts = {
      midStored: k.mid.length, quietStored: k.quiet.length, quietStimuli: k.quiet.filter(isStimulus).length,
      midAt: m.at, quietAt: qq.at, midIds: m.ids, quietIds: qq.ids,
      midStoredInFlight: inFlightIn(k.mid, k.mid.length), quietStoredInFlight: inFlightIn(k.quiet, k.quiet.length),
      refused: [mid.refused, quiet.refused].filter((x) => x !== '').join('; '),
      bothCompleted: k.froze && mid.state?.outcome === 'completed' && quiet.state?.outcome === 'completed',
    };
  }

  // ---- A PARKED kill: `suspend-resume` frozen a turn after `needsAPerson` parks, resumed, resolved.
  let parked: KillResume['parked'] = null;
  {
    const RESOLUTION = { result: { reviewed: 'by a person' }, actor: 'ana' };
    const PARKED_ID = 'kp:needsAPerson:1:0';
    const isPark = (i: FoldInput) => i.kind === 'outcome' && i.record.kind === 'outcome' && i.record.terminalState === 'user_action';
    const ref = await referenceRun(SR, HIGH, 'kp', async (d) => {
      for (let w = 0; w < 3000 && !d.foldInputs().some(isPark); w++) await sleep(1);
      d.resolve(PARKED_ID, 'done', RESOLUTION);
    });
    const k = await killedRun(SR, HIGH, 'kp', (i) => (isPark(i) ? 'after-this-turn' : 'no'));
    const rt = buildRuntime(false, [SR]);
    try {
      let h: RunHandle | null = null;
      let refused = '';
      try { h = rt.resume(SR, { header: k.header, events: k.quiet.slice() }); } catch (err) { refused = refusalOf(err); }
      if (h === null) {
        parked = { ids: null, before: 'REFUSED', parkedStored: false, scoreFirst: false, accepted: false, refused, outcome: 'REFUSED', identical: false };
      } else {
      runs.push(`${SR.flowId} resumed`);
      const e = h.driver.foldInputs().find((i) => i.kind === 'resumed');
      const before = fold(h.driver.foldInputs()).outcome;
      const accepted = h.driver.resolve(PARKED_ID, 'done', RESOLUTION);
      const won = await settleWithin(h.done, KILL_RESUME_DEADLINE_MS);
      const at = (id: string) => k.quiet.findIndex((i) => i.kind === 'outcome' && i.record.taskId === id);
      parked = {
        ids: e?.kind === 'resumed' ? [...e.taskIds] : null,
        before,
        parkedStored: k.froze && k.quiet.some((i) => i.kind === 'dispatched' && i.taskId === PARKED_ID) && k.quiet.some((i) => isPark(i) && i.kind === 'outcome' && i.record.taskId === PARKED_ID),
        scoreFirst: at('kp:scoreA:0:0') >= 0 && at('kp:scoreA:0:0') < at(PARKED_ID),
        accepted,
        refused: '',
        outcome: won.by === 'done' ? won.value.outcome : 'NEVER SETTLED',
        identical: won.by === 'done' && sameNodes(won.value, ref.state),
      };
      }
    } finally { await rt.shutdown(); }
  }

  killResume = {
    points, expectedLabels, k1,
    otherRefSameOutcome: other.state.outcome === refs['fan-out-per-item']!.outcome,
    otherRefNodesDiffer: !sameNodes(other.state, refs['fan-out-per-item']!),
    chain, cuts, parked, runs,
  };
} catch (err) {
  failures.push(`kill and resume\n      the block THREW before its assertions could run — a crash is not a detection: ` +
    `${err instanceof Error ? err.message.slice(0, 240) : String(err)}`);
}
if (killResume !== null) {
  const key = 'cross-row';
  const kr = killResume;
  console.log('\n  P23 exit artifact — killed mid-step at every kill point, resumed on a fresh runtime:');
  for (const p of kr.points) {
    console.log(`    ${p.label.padEnd(22)} stored ${String(p.stored).padStart(2)}  lost tail ${String(p.q - p.stored).padStart(2)}  ` +
      `re-dispatched ${String(p.ids?.length ?? '-').padStart(1)}  ${(p.ids ?? []).join(' ')}`);
  }
  const reDispatched = kr.points.reduce((n, p) => n + (p.ids?.length ?? 0), 0);
  const tailOnly = kr.points.reduce((n, p) => n + (p.ids ?? []).filter((id) => !p.storedInFlight.includes(id)).length, 0);
  console.log(`    ${kr.points.length} kill points, ${reDispatched} tasks re-dispatched, ${tailOnly} of them dispatched only in the lost tail\n`);

  // (1) the headline, at EVERY kill point — the list of labels is derived from the references' own stimuli.
  check(key, 'P23 EXIT ARTIFACT: a run killed at EVERY kill point of two flows and resumed on a fresh runtime completes IDENTICALLY ' +
    'to a run nobody killed — outcome AND every node`s state and result, read from the run',
    // **The PROJECTIONS, not a boolean over them** — the adequacy reader's finding 2: a boolean made the node comparison
    // one token from gone (`&& sameNodes(…)` deleted, a re-dispatch given another task's payload, L6 green), and control 1
    // reads the projection on a DIFFERENT pair of runs, so it guarded the helper and not this use of it. The labels come
    // from the references' own stimuli; the payload is also held at the scheduler by claim (3), a second observer.
    kr.points.map((p) => `${p.label} ${p.got}`),
    kr.expectedLabels.map((l) => `${l} ${kr.points.find((p) => p.label === l)?.want ?? 'NO REFERENCE'}`));
  // (2) the re-dispatched ids, against a derivation that never reads the resumed driver.
  check(key, 'RN-R21 at L6: the re-dispatched ids ARE the in-flight set at the END of the replay — derived from the KILLED ' +
    'process`s own sequence up to its next stimulus past the cut, in dispatch order',
    kr.points.map((p) => `${p.label} ${JSON.stringify(p.ids)}`),
    kr.points.map((p) => `${p.label} ${JSON.stringify(p.derived)}`));
  // (3) the COUNT, read from the SCHEDULER.
  // **COUNT, ORDER and PAYLOAD, from two SCHEDULERS** — the adequacy reader's findings 1 and 2: the first version compared
  // SORTED sets, so RN-R21's dispatch order had one observer (claim (2), whose expected side one token re-sources to the
  // value it judges), and a re-dispatch carrying another task's payload had one too. This side reads neither driver: the
  // fresh scheduler's own task map in insertion order, against the KILLED process's scheduler's task map at the kill, in
  // its insertion order, with the payload it held.
  check(key, 'the re-dispatch COUNT read from the SCHEDULER: at the instant runtime.resume returns, the fresh scheduler holds ' +
    'exactly the tasks the `resumed` element names — before any settlement could dispatch anything new — in the ORDER the killed ' +
    'process`s scheduler was handed them and with the PAYLOAD it held (RN-R21: the same ids, the replay`s composition)',
    kr.points.map((p) => `${p.label} ${p.heldWithPayload.join(' | ')}`),
    kr.points.map((p) => `${p.label} ${p.killedWithPayload.join(' | ')}`));
  // (4) where `resumed` sits, and the positions the consumer is handed.
  check(key, 'RN-R22 and RN-R24 at L6: `resumed` sits at the killed run`s next stimulus — after the whole regenerated tail — and ' +
    'the consumer is handed positions from the STORED LENGTH on, contiguous',
    kr.points.map((p) => `${p.label} resumed ${p.ids !== null} positions ${p.positionsFromStored}`),
    kr.points.map((p) => `${p.label} resumed true positions true`));
  // (5) the lost tail, element for element.
  check(key, 'RN-R19 at L6: the LOST TAIL is regenerated exactly as the killed process appended it — every element between the ' +
    'cut and the next stimulus, element for element',
    kr.points.map((p) => `${p.label} ${p.tailRegenerated}`), kr.points.map((p) => `${p.label} true`));
  // (6) P23 prediction 2's substance.
  check(key, 'P23 prediction 2 at L6: no task that SETTLED in the stored events is re-dispatched, at any kill point',
    kr.points.flatMap((p) => p.settledRedispatched), []);
  // (7) and its wording, reversed by W89: the stored events' in-flight set is a WRONG selection that differs.
  assertThat(key, 'and the at-least-once set is NOT the stored events` in-flight set — tasks dispatched only in the lost tail run again, ' +
    'and the two selections DIFFER at some kill points and AGREE at others, so neither is a constant',
    tailOnly > 0 && kr.points.some((p) => JSON.stringify(p.ids) !== JSON.stringify(p.storedInFlight)) &&
      kr.points.some((p) => JSON.stringify(p.ids) === JSON.stringify(p.storedInFlight)),
    `${tailOnly} tail-only re-dispatches`);
  // (8) at-least-once, made visible by the drain.
  check(key, 'AT-LEAST-ONCE, visible: every re-dispatched task ALSO SETTLED in the killed runtime — `shutdown()` DRAINS, and ' +
    'the killed run ended `completed` inside it, so the store froze and the work did not',
    kr.points.map((p) => `${p.label} ${(p.ids ?? []).filter((id) => p.settledInKilled.includes(id)).length}/${p.ids?.length ?? 0} ${p.killedOutcome}`),
    kr.points.map((p) => `${p.label} ${p.ids?.length ?? 0}/${p.ids?.length ?? 0} completed`));
  // (9)-(12) the chain.
  const c = kr.chain;
  assertThat(key, 'RN-R18 at L6: the HEADER arrives AFTER the first events — the handle is returned once start has delivered at ' +
    'least one — so a store keyed by position is the one that does not care',
    c !== null && c.beforeHandle >= 1, `delivered before the handle: ${c?.beforeHandle}`);
  check(key, 'THREE processes, ONE store keyed by position: the third completes identically, and RunState.resumes records BOTH ' +
    'resumes — process two`s and process three`s own `resumed` elements, in order',
    c === null ? null : [c.identical, c.refused, c.resumes], c === null ? 'a chain' : [true, '', c.resumedIds]);
  check(key, 'and the store holds the WHOLE run again: no hole at any position, and its fold IS what `done` resolved with',
    c === null ? null : [c.holes, c.foldIsDone], [0, true]);
  check(key, 'a store keyed by an ARRIVAL counter per process is a DIFFERENT store — the wrong selection, arranged — and a ' +
    'resume from it is refused `diverged` at position 0',
    c === null ? null : [c.arrivalDiffers, c.arrivalRefused], [true, 'diverged at 0']);
  // (13)-(14) the cuts.
  const u = kr.cuts;
  // **And the ARRANGEMENT the pair rests on — W97's adequacy reader (N1).** Both cuts are one STEP only while no other
  // settlement lands in the second stimulus's turn: with `Shard` at 0 ms per character `shard:1` settled in that turn, the
  // quiescent store held a THIRD stimulus and the two cuts resumed at 13 and 21. `shard@0`'s two characters against
  // `shard@1`'s three at 60 ms each is the arrangement; its effect — the quiescent store holds exactly TWO stimuli — is
  // asserted here, so that delay now names it. Found by a SPEED-UP, which obligation (f)'s *delayed past its peers* never
  // tries ([Q401](../doc/questions/q401.md)).
  check(key, 'a MID-STEP cut and a QUIESCENT cut of ONE killed run: the quiescent store is longer, `resumed` lands at the same ' +
    'position after both, and both re-dispatch the SAME tasks — the set is the replay`s, not the store`s; and the arrangement holds, the quiescent store two stimuli',
    u === null ? null : [u.midStored < u.quietStored, u.midAt, u.quietAt, u.midIds, u.bothCompleted, u.refused, u.quietStimuli],
    u === null ? 'two cuts' : [true, u.quietStored, u.quietStored, u.quietIds, true, '', 2]);
  check(key, 'and that is the PAIR: the stored events` in-flight set is right at the quiescent cut and WRONG at the mid-step one',
    u === null ? null : [JSON.stringify(u.quietStoredInFlight) === JSON.stringify(u.quietIds), JSON.stringify(u.midStoredInFlight) === JSON.stringify(u.midIds)],
    [true, false]);
  // (15)-(16) parked.
  const pk = kr.parked;
  check(key, 'a PARKED task is not in flight: killed a turn after it parked — with the other branch settled first, arranged and ' +
    'asserted — the resume re-dispatches NOTHING and the run is awaiting_action, where counting it would give [needsAPerson]',
    pk === null ? null : [pk.refused, pk.parkedStored, pk.scoreFirst, pk.ids, pk.before], ['', true, true, [], 'awaiting_action']);
  check(key, 'and resolve() on the RESUMED driver completes it IDENTICALLY to a person resolving in the process that never died',
    pk === null ? null : [pk.accepted, pk.outcome, pk.identical], [true, 'completed', true]);
  // ---- the CONTROLS (v0.22: each names the tree on which it fails while its claim passes).
  check(key, 'CONTROL: outcome alone does NOT discriminate — the same flow on another payload also completes, with DIFFERENT ' +
    'nodes; so claim (1) rests on the node comparison (fails on a tree whose node projection returns a constant)',
    [kr.otherRefSameOutcome, kr.otherRefNodesDiffer], [true, true]);
  check(key, 'CONTROL: the K = 1 re-dispatch of each flow is the DOCUMENT`s — one `shard` per word of the payload, and triage`s ' +
    'fan-out branches (fails on a tree whose derivation is re-sourced to the value it judges and that value is wrong)',
    kr.k1.map((k) => `${k.flow} ${JSON.stringify(k.ids)}`), kr.k1.map((k) => `${k.flow} ${JSON.stringify(k.fromDocument)}`));
  // *(Its first version also required the killed runtime to have run on past every freeze. The adequacy reader could name
  // no tree on which that conjunct fails while its claim passes — every tree it names is red on six other clauses — so by
  // v0.22's test it was not a control, and it is gone.)*
  assertThat(key, 'CONTROL: the fresh runtime RAN every task its scheduler held when resume returned, at every kill point — so the ' +
    'held set claim (3) reads is work that happened, not a map nobody drained',
    kr.points.every((p) => p.heldAtReturn.every((id) => p.ranOnFresh.includes(id))) && reDispatched > 0,
    kr.points.filter((p) => !p.heldAtReturn.every((id) => p.ranOnFresh.includes(id))).map((p) => p.label).join(', '));
  check(key, 'CONTROL: the sweep is EVERY kill point, counted from a second source — nine of `fan-out-per-item` (ten ' +
    'settlements: the entry, two shards, five grades, one recheck, publish) and five of `triage` — so a bound narrowed in both ' +
    'loops at once, which claim (1) cannot see, is a count that moved (fails on a tree where `stimuli` is capped)',
    // And the block's RUNS, which the printed count adds and nothing asserted (the adequacy reader's finding 7): four
    // references, fourteen kills and fourteen resumes, three processes of the chain, one kill and two resumes of the cuts,
    // one kill and one resume parked.
    [...SWEEP_FLOWS.map((f) => `${f} ${kr.points.filter((p) => p.label.startsWith(`${f} K=`)).length}`), `runs ${kr.runs.length}`],
    ['fan-out-per-item 9', 'triage 5', 'runs 40']);
}

/**
 * **Block (2h) — W94, P24's EXIT ARTIFACT, its second half: the TV ingest KILLED at EVERY kill point and RESUMED on a
 * FRESH runtime** — [W94](../doc/work-items/w94-a-tv-series-ingest-through-a-gate-on-real-workers.md),
 * [ADR 0067](../doc/decisions/0067-a-gate-runs-in-the-driver-its-memory-is-the-drivers-and-its-decision-is-recorded.md)
 * rule 2 and `RN-R26`: the gate's memory is a DRIVER field created empty and REBUILT by replay, never written down.
 *
 * **Block (2g)'s kill, one flow on**: the consumer's store keyed by POSITION and FROZEN mid-step at the K-th stimulus
 * (inside `onFoldInput`), then `runtime.shutdown()` — which DRAINS ([Q376](../doc/questions/q376.md)), so the killed
 * process runs to completion and its driver's memory ends holding EVERY key — and `runtime.resume` on a fresh runtime
 * from the store. Every `done` is BOUNDED and every runtime shut down in a `finally` ([Q323](../doc/questions/q323.md));
 * a refused resume is a FINDING carried in the point, never a crash of this block.
 *
 * **What it SELECTS, and where each well-formed wrong selection DIFFERS** (`doc/workflow.md` rule 8 obligation (a)):
 *
 *   - **the kill point** — EVERY stimulus of the run, 25 of them: BEFORE the first decision (fifteen at W94's
 *     declaration — [Q386](../doc/questions/q386.md)'s case, where a memory kept by the PROCESS resumed WRONG in
 *     silence at W93's), BETWEEN decisions, and AFTER the last;
 *   - **the resumed memory** — the one the replay rebuilds, against a FRESH one (which would route `first` again a key
 *     decided before the cut) and the KILLED process's (which drained to every key, so would route every later
 *     `first` as `duplicate`). Both wrong answers are DERIVED from the killed process's own sequence, never from the
 *     resumed driver being judged, and the control below requires each to differ somewhere in the sweep;
 *   - **identical** — outcome, every node's state and result, every branch's decision, and the gate's MEMORY, read
 *     from the resumed DRIVER's private field (`gateMemory`, a map this harness reads the way `rawArrivalsOf` reads
 *     `arrivals`) against a run nobody killed.
 *
 * The flow and payload are the LAST-first row's, on the INLINE pool: W94's declaration measured 25 / 25 identical in
 * both runtimes there, and on threads too — but a thread's timing moves an arrival past the kill, which is the pool's
 * right. **The identity holds by ARRANGEMENT and not by construction — W97**: a resume re-dispatches what was in flight,
 * so the arrivals after the cut are a FRESH sample, identical to the reference only because `identify`'s 30 ms per MB
 * dwarfs the skew a re-dispatch adds. `Download` delayed to 300 ms (obligation (f)) turned the identity red in both
 * runtimes, 2 of 2 each; so the arrangement's effect — the files reach the gate in SIZE order in every resumed run —
 * is asserted beside it, and the same delay now names the arrangement.
 */
type GateKillPoint = {
  K: number;
  stored: number;
  category: 'before the first decision' | 'between decisions' | 'after the last decision';
  freshDiffers: boolean;
  killedDiffers: boolean;
  killedMemoryComplete: boolean;
  prefixRegenerated: boolean;
  /** The resumed run's files reached the gate in SIZE order — the arrangement the identity rests on (W97). */
  arrivedInSizeOrder: boolean;
  /** The stimuli the STORE holds at the freeze — K, read off the store itself rather than a counter upstream of it. */
  storedStimuli: number;
  /** The stimulus count at the instant the store froze — `K` itself, or the sweep ran duplicates (the adequacy reader's finding 1). */
  killedAt: number;
  /** The gate memory's keys the instant `runtime.resume` returned — the replay done, nothing live yet. */
  rebuilt: string;
  /** What the replay must have rebuilt: the keys the KILLED run decided up to the end of the replay (`q`). */
  wantRebuilt: string;
  ids: string[] | null;
  derived: string[];
  got: string;
  want: string;
};
let gateKill: { points: GateKillPoint[]; stimuli: number; runs: string[] } | null = null;
/** Each series' own file indices, smallest file FIRST — the order `identify`'s `msPerMB` arranges within a series. */
const SIZE_ORDER_BY_SERIES: Record<string, number[]> = TV_IDENTIFIED.reduce((acc, f, i) => {
  const key = f.name.includes('.') ? f.name.split('.')[0]!.toLowerCase() : '';
  return key === '' ? acc
    : { ...acc, [key]: [...(acc[key] ?? []), i].sort((a, b) => TV_LAST_FIRST.files[a]!.sizeMB - TV_LAST_FIRST.files[b]!.sizeMB) };
}, {} as Record<string, number[]>);
// ONE predicate for the run and for the constructed input below, so a comparison weakened here (sorted, truncated) is
// weakened for both and the constructed input goes green where it must be refused (W97's adequacy reader, p2b).
/**
 * **Per SERIES, not over the whole list — W98.** W97 asserted the total size order across all seven files, and it was
 * RED 1 run in 6 on node (`K=4`): a resume re-dispatches what was in flight, and two files of DIFFERENT series 30 ms
 * apart in `identify` time can swap without changing any winner. What the identity rests on is each series' own arrivals
 * being ordered, so that is what this asserts — a flake this item's conformity reader found in a PUSHED commit, which
 * is [Q401](../doc/questions/q401.md)'s *each GREEN is one sample* inside the file W97 owned.
 */
const inSizeOrder = (arrivals: readonly { key: string; file: number }[]): boolean =>
  Object.entries(SIZE_ORDER_BY_SERIES).every(([key, want]) => {
    const got = arrivals.filter((a) => a.key === key).map((a) => a.file);
    return JSON.stringify(got) === JSON.stringify(want.filter((f) => got.includes(f)));
  });
try {
  const runs: string[] = [];
  const RUN_ID = 'kg';
  type Gated = Extract<FoldInput, { kind: 'gated' }>;
  const gatedIn = (seq: readonly FoldInput[]) => seq.filter((i): i is Gated => i.kind === 'gated');
  const decisionsOf = (st: RunState) => st.gated.map((d) => [d.branchPath, d.route, d.key ?? null]).sort();
  const memoryOf = (d: Driver) =>
    [...(d as unknown as { gateMemory: Map<string, Map<string, unknown>> }).gateMemory].map(([g, m]) => [g, [...m.keys()].sort()]);
  const projection = (st: RunState, d: Driver) =>
    `${st.outcome} ${JSON.stringify(nodesOf(st))} ${JSON.stringify(decisionsOf(st))} ${JSON.stringify(memoryOf(d))}`;
  // The reference: nobody kills it.
  const rtRef = buildRuntime(false, [TV]);
  let want = '';
  let refMemory = '';
  let stimuli = 0;
  try {
    const h = rtRef.start(TV, TV_LAST_FIRST, { runId: RUN_ID });
    runs.push('tv-ingest reference');
    const won = await settleWithin(h.done, KILL_RESUME_DEADLINE_MS);
    if (won.by !== 'done') throw new Error('the TV reference run never settled');
    want = projection(won.value, h.driver);
    refMemory = JSON.stringify(memoryOf(h.driver));
    stimuli = h.driver.foldInputs().filter(isStimulus).length;
  } finally { await rtRef.shutdown(); }
  const points: GateKillPoint[] = [];
  for (let K = 1; K <= stimuli; K++) {
    // ---- the KILLED process: the store frozen mid-step at the K-th stimulus, then the runtime shut down (it drains).
    const rt1 = buildRuntime(false, [TV]);
    const store: FoldInput[] = [];
    let frozen = false;
    let seen = 0;
    let header: CheckpointHeader | null = null;
    let killedDriver: Driver | null = null;
    try {
      const h1 = rt1.start(TV, TV_LAST_FIRST, {
        runId: RUN_ID,
        onFoldInput: (i, seq) => {
          if (frozen) return;                                // a dead process writes nothing
          store[seq] = structuredClone(i);                   // the consumer's append, BY POSITION
          if (isStimulus(i) && ++seen === K) frozen = true;
        },
      });
      header = h1.header;
      killedDriver = h1.driver;
      runs.push(`tv-ingest killed K=${K}`);
      for (let w = 0; !frozen && w < 3000; w++) await new Promise<void>((r) => setTimeout(r, 1));
    } finally { await rt1.shutdown(); }
    const killed = killedDriver!.foldInputs();
    const pre = gatedIn(store);
    const post = gatedIn(killed.slice(store.length));
    const preKeys = new Set(pre.map((x) => JSON.stringify(x.key)));
    const p = store.length - 1;
    let q = killed.findIndex((i, j) => j > p && isStimulus(i));
    if (q < 0) q = killed.length;
    // ---- the RESUME on a fresh runtime.
    const rt2 = buildRuntime(false, [TV]);
    let got = '';
    let ids: string[] | null = null;
    let prefixRegenerated = false;
    let rebuilt = 'NOT RESUMED';
    let arrivedInSizeOrder = false;
    try {
      let h2: RunHandle | null = null;
      try {
        h2 = rt2.resume(TV, { header: header!, events: store.slice() });
        // **Read where the memory is REBUILT, not where the run ends** — the conformity reader's finding 7: at the end of
        // a completed run every memory holds every key, so an end-of-run comparison discriminates nothing. `resume`
        // replays synchronously and returns, so this is the memory the replay built and nothing live has touched.
        rebuilt = JSON.stringify(memoryOf(h2.driver));
      } catch (err) {
        got = `REFUSED ${refusalOf(err)}`;
      }
      if (h2 !== null) {
        runs.push(`tv-ingest resumed K=${K}`);
        const won = await settleWithin(h2.done, KILL_RESUME_DEADLINE_MS);
        const seq = h2.driver.foldInputs();
        got = won.by === 'done' ? projection(won.value, h2.driver) : 'NEVER SETTLED';
        const at = seq[q];
        ids = at?.kind === 'resumed' ? [...at.taskIds] : null;
        prefixRegenerated = JSON.stringify(gatedIn(seq.slice(0, store.length))) === JSON.stringify(pre);
        arrivedInSizeOrder = inSizeOrder(gatedIn(seq).map((x) => ({
          key: typeof x.key === 'string' ? x.key : '', file: Number(x.branchPath.split('.')[0]) })));
      }
    } finally { await rt2.shutdown(); }
    points.push({
      K,
      stored: store.length,
      category: pre.length === 0 ? 'before the first decision' : post.length === 0 ? 'after the last decision' : 'between decisions',
      // A FRESH memory routes `first` any key it has not seen: wrong wherever a key decided before the cut comes again after it.
      freshDiffers: post.some((x) => x.key !== undefined && preKeys.has(JSON.stringify(x.key))),
      // The KILLED process's memory drained to every key: wrong wherever a decision after the cut was a `first`.
      killedDiffers: post.some((x) => x.route === 'first'),
      killedMemoryComplete: JSON.stringify(memoryOf(killedDriver!)) === refMemory,
      prefixRegenerated,
      arrivedInSizeOrder,
      storedStimuli: store.filter((x) => x !== undefined && isStimulus(x)).length,
      killedAt: seen,
      rebuilt,
      wantRebuilt: JSON.stringify(gatedIn(killed.slice(0, q)).length === 0 ? [] : [['dedupe', [...new Set(gatedIn(killed.slice(0, q)).flatMap((x) => (x.key === undefined ? [] : [JSON.stringify(x.key)])))].sort()]]),
      ids,
      derived: inFlightIn(killed, q),
      got,
      want,
    });
  }
  gateKill = { points, stimuli, runs };
} catch (err) {
  failures.push(`TV ingest kill and resume\n      the block THREW before its assertions could run — a crash is not a detection: ` +
    `${err instanceof Error ? err.message.slice(0, 240) : String(err)}`);
}
if (gateKill !== null) {
  const key = 'cross-row';
  const gk = gateKill;
  const by = (c: string) => gk.points.filter((p) => p.category === c).length;
  console.log(`\n  P24 exit artifact — the TV ingest killed at all ${gk.points.length} kill points and resumed: ` +
    `${by('before the first decision')} before the first decision, ${by('between decisions')} between, ${by('after the last decision')} after the last; ` +
    `a FRESH memory would route differently at ${gk.points.filter((p) => p.freshDiffers).length}, the KILLED process's at ${gk.points.filter((p) => p.killedDiffers).length}\n`);
  // *(The memory at the END of a completed run holds every key whatever road it took — the conformity reader's finding 7 —
  // so this claim's memory term confirms the end state and nothing more; where the memory is REBUILT is the clause below.)*
  check(key, 'W94 (2h): at EVERY kill point the TV ingest resumed on a fresh runtime is IDENTICAL to a run nobody killed — outcome, ' +
    'every node, every branch`s gate decision, and the gate`s MEMORY at the end (RN-R26)',
    gk.points.filter((p) => p.got !== p.want).map((p) => `K=${p.K} ${p.category}: ${p.got.slice(0, 200)}`), []);
  // **And the memory the replay REBUILT, read the instant `resume` returned** — the keys the killed run had decided up to
  // the end of the replay, which is what a FRESH memory (empty) and the KILLED process's (every key: it drained, Q376)
  // are not. The adequacy reader's finding 3: a memory cleared the moment the replay ended was one observer from gone
  // here, the identity claim alone; this is the second, and it reads the memory where the selection is made.
  // **Its control is a CONSTRUCTED input, W92's kind clause's shape**: the same predicate over the size order REVERSED must
  // refuse it. W97's adequacy reader sorted both sides of the comparison and the clause went green with `Download` at 60 ms,
  // where it is the ONLY observer (the identity holds there) — a clause with no tree named on which it fails (v0.22).
  check(key, 'W94 (2h), W97: and the ARRANGEMENT held across every kill — in every resumed run EACH SERIES` files reached the gate in SIZE order, ' +
    'which is SUFFICIENT for the post-cut decisions to be identical: a resume re-dispatches what was in flight, and the order after the cut is a fresh sample',
    { failing: gk.points.filter((p) => !p.arrivedInSizeOrder).map((p) => `K=${p.K}`), reversedRefused: !inSizeOrder(Object.entries(SIZE_ORDER_BY_SERIES)
        .flatMap(([key, fs]) => [...fs].reverse().map((file) => ({ key, file })))) },
    { failing: [], reversedRefused: true });
  check(key, 'W94 (2h): and the replay REGENERATED every stored `gated` element exactly, and the memory it REBUILT is exactly the keys the killed run had decided by the end of the replay',
    gk.points.filter((p) => !p.prefixRegenerated || p.rebuilt !== p.wantRebuilt).map((p) => `K=${p.K} prefix ${p.prefixRegenerated} rebuilt ${p.rebuilt} want ${p.wantRebuilt}`), []);
  check(key, 'W94 (2h): and the re-dispatched ids are the killed process`s in-flight set at the END of the replay, at every kill point',
    gk.points.filter((p) => JSON.stringify(p.ids) !== JSON.stringify(p.derived)).map((p) => `K=${p.K} ${JSON.stringify(p.ids)} vs ${JSON.stringify(p.derived)}`), []);
  // ---- the CONTROLS (v0.22: each names the tree on which it fails while its claim passes).
  // A sweep narrowed to a few kill points leaves every claim above true of fewer points — so the COUNT is asserted from
  // two sources: the reference's own stimuli, and the PAYLOAD (three tasks a file — download, thumbnail, identify — one
  // per-series task per series, and publish). Fails on a tree whose loop bound is capped.
  check(key, 'W94 (2h) CONTROL: the sweep is EVERY kill point — one per stimulus of the reference, and that count from the PAYLOAD: three tasks a file, one per series, and publish — each point DISTINCT',
    // **And the points are DISTINCT** — the adequacy reader's finding 1: a count cannot see K = 19..24 all killed at 18,
    // which with a memory fresh between decisions read green in both runtimes. The stimulus count at each freeze is K.
    // *(A `rising` term read the stored LENGTHS strictly rising from one point to the next until W97 — but each point is
    // a SEPARATE run, and how many regenerated events precede its K-th stimulus is a completion order: with `Download`
    // threaded (obligation (f)) it went red intermittently in both runtimes.)* **`killedAt` is a counter UPSTREAM of the
    // store**, and W97's adequacy reader wrote K = 19..24 from K = 18's store with it honest at 1..25 — W94's finding 1
    // reopened, green with a memory cleared mid-run. So the STORE is read too: each holds exactly K stimuli, which is
    // order-free (measured green with `Download` threaded, where `rising` went red).
    { points: gk.points.length, fromReference: gk.stimuli, runs: gk.runs.length,
      killedAt: gk.points.map((p) => p.killedAt).join(), storedStimuli: gk.points.map((p) => p.storedStimuli).join() },
    { points: TV_N * 3 + TV_KEYS.length + 1, fromReference: TV_N * 3 + TV_KEYS.length + 1, runs: 1 + 2 * (TV_N * 3 + TV_KEYS.length + 1),
      killedAt: Array.from({ length: TV_N * 3 + TV_KEYS.length + 1 }, (_, j) => j + 1).join(),
      storedStimuli: Array.from({ length: TV_N * 3 + TV_KEYS.length + 1 }, (_, j) => j + 1).join() });
  // Fails on a tree whose kills all land before the first decision (a memory never rebuilt from anything) or whose
  // arrangement puts every decision on one side of every cut — where identity says nothing about the memory at all.
  check(key, 'W94 (2h) CONTROL: the selections DISCRIMINATE on this sweep — kill points before the first decision (Q386`s case), between and after the last; ' +
    'points where a FRESH memory would route a later decision differently, and — between decisions — where the KILLED process`s would, having drained to every key (Q376)',
    {
      before: by('before the first decision') > 0, between: by('between decisions') > 0, after: by('after the last decision') > 0,
      // `killedDiffers` is read BETWEEN decisions: before the first one every `first` is post-cut, so it held by
      // construction wherever `before` did — a control entailed by another (the adequacy reader's finding 6).
      freshDiffers: gk.points.some((p) => p.freshDiffers), killedDiffers: gk.points.some((p) => p.category === 'between decisions' && p.killedDiffers),
      killedMemoryComplete: gk.points.every((p) => p.killedMemoryComplete),
    },
    { before: true, between: true, after: true, freshDiffers: true, killedDiffers: true, killedMemoryComplete: true });
}

/**
 * **The TV rows' PAIR — P24's exit sentence, *exactly one per-series branch per series WHATEVER order the files arrive
 * in*, on real workers.** W94. The LAST-first and FIRST-first rows run the same seven files with the sizes in opposite
 * orders, and whatever makes a pair differ is itself a claim (`doc/workflow.md` rule 8), so the first clause asserts
 * the arrangement differs in its ORDER and in nothing else; the second, read from each run's own `gated` elements,
 * that a DIFFERENT file opened every multi-file series while the SAME series were opened, once each. **No file is
 * named**: the claim is the difference, and each row's own clause says exactly one.
 */
{
  const iLast = EXPECTED.findIndex((e) => e.gate?.arranged === 'last-first');
  const iFirst = EXPECTED.findIndex((e) => e.gate?.arranged === 'first-first');
  const filesOf = (i: number) => EXPECTED[i]?.payload.files ?? [];
  const firstBy = (i: number) => Object.fromEntries((reports[i]?.inputs ?? [])
    .filter((x): x is Extract<FoldInput, { kind: 'gated' }> => x.kind === 'gated' && x.route === 'first')
    .map((x) => [String(x.key), x.branchPath]));
  check('cross-row', 'W94: the LAST-first and FIRST-first rows are a PAIR — the same files and names, the SIZES in the opposite order, which is the whole of the arrangement',
    { both: iLast >= 0 && iFirst >= 0, names: filesOf(iLast).map((f) => f.name), sizes: filesOf(iLast).map((f) => f.sizeMB) },
    { both: true, names: filesOf(iFirst).map((f) => f.name), sizes: filesOf(iFirst).map((f) => f.sizeMB).reverse() });
  const a = firstBy(iLast);
  const b = firstBy(iFirst);
  check('cross-row', 'W94: and the SAME series were opened once each in both runs by a DIFFERENT file for every multi-file series — exactly one per series WHATEVER the arrival order (P24 decision 7)',
    { opened: [Object.keys(a).sort(), Object.keys(b).sort()], differ: TV_KEYS.filter((k) => a[k] !== undefined && b[k] !== undefined && a[k] !== b[k]) },
    { opened: [TV_KEYS, TV_KEYS], differ: TV_MULTI });
  // **Every route `distinct` DECLARES was TAKEN on the rows through a gate** — obligation (a)'s enumeration, and W94's
  // own rule 8 planning found why it is needed: each row's expected route COUNTS derive from the file table, so a table
  // that lost `trailer.mkv` took `nokey` out of every run with every per-row clause agreeing. Read from the TYPE — the
  // one source the table cannot move — so the tree on which it fails is exactly that one.
  const routesTaken = [...new Set(EXPECTED.flatMap((e, i) => (e.gate ? (reports[i]?.inputs ?? [])
    .filter((x): x is Extract<FoldInput, { kind: 'gated' }> => x.kind === 'gated').map((x) => x.route) : [])))].sort();
  check('cross-row', 'W94: and every route `distinct` DECLARES was TAKEN on the rows through a gate — read from the TYPE, never from the file table the rows derive their counts from',
    routesTaken, [...distinct.routes].sort());
}

/**
 * **What `OR-R13` would cost this WHOLE RUNG, against the `structuredClone` `OR-R2` already pays on
 * the same settlements — PRINTED, and asserted by nothing** — W82, P21 decision 5.
 *
 * **Nothing here is an assertion and that is the decision rather than an omission.**
 * [Q179](../doc/questions/q179.md) says wall time here is not reproducible, and W81 measured how
 * badly: the same two values over eight readings of one row read between 58% and 95%, a spread as
 * wide as the effect. *A ratio of two clocks is still two clocks* ([Q335](../doc/questions/q335.md)),
 * so a rung that asserted a magnitude would be a ratchet on hardware. What IS asserted is the
 * COUNT, in the check-OFF block above — the only observable a check whose answer is discarded has.
 *
 * **It is PRINTED rather than left to a document for [Q171](../doc/questions/q171.md)'s reason**:
 * this is the one place that holds every result the rung settled, so the number is re-taken on every
 * run instead of transcribed into prose nothing compares. The two sides are timed on the SAME values
 * and in BOTH orders, because W46 measured that run ORDER costs nothing here and ACCUMULATION in one
 * process costs up to 4.4x — so two readings that disagree are a warning the reader can see.
 */
{
  const workers = REGISTRY_DOCUMENT.workers ?? {};
  const types = REGISTRY_DOCUMENT.nodeTypes ?? {};
  const pairs: { schema: unknown; value: unknown }[] = [];
  EXPECTED.forEach((e, i) => {
    for (const r of reports[i]?.log ?? []) {
      if (r.kind !== 'outcome' || r.terminalState !== 'done') continue;
      const node = e.definition.nodes.find((n) => n.id === r.taskId.split(':')[1]);
      const w = node?.kind === 'task' ? workers[types[(node as { type: string }).type]?.worker ?? ''] : undefined;
      if (w?.outputSchema !== undefined) pairs.push({ schema: w.outputSchema, value: r.result });
    }
  });
  if (pairs.length > 0) {
    // Both roads warmed before either is timed, so neither pays the other's JIT.
    for (let i = 0; i < 5; i++) for (const p of pairs) { structuredClone(p.value); findings(p.schema as JsonSchema, p.value); }
    const median = (xs: number[]) => xs.slice().sort((a, b) => a - b)[xs.length >> 1]!;
    const time = (f: () => void) => { const xs: number[] = []; for (let i = 0; i < 31; i++) { const t = performance.now(); f(); xs.push(performance.now() - t); } return median(xs); };
    const clone = time(() => { for (const p of pairs) structuredClone(p.value); });
    const check = time(() => { for (const p of pairs) findings(p.schema as JsonSchema, p.value); });
    const check2 = time(() => { for (const p of pairs) findings(p.schema as JsonSchema, p.value); });
    const clone2 = time(() => { for (const p of pairs) structuredClone(p.value); });
    console.log(`  OR-R13 over this whole rung, OBSERVED and asserted by nothing (Q179): ${pairs.length} settled results with a declared ` +
      `outputSchema — check/clone ${(check / clone).toFixed(2)}x, and ${(check2 / clone2).toFixed(2)}x with the two timed in the ` +
      `opposite order. The COUNT is what the check-OFF block asserts.\n`);
  }
}

// **`+ 1` is W67's SHIM RUN, `+ 2` is W78's consumer-road block and `+ 1` is W82's check-OFF arm.**
// W78's makes two runs under one label — a fan-out that completes and a refusal that stops; W82's
// makes ONE, because its ON arm is a row the loop above already ran. All three sit OUTSIDE the row
// loop, so none is in `ROW_KEYS`, and this expression is the only thing that counts them. *(It named
// the first two and not the third, in the paragraph that calls itself the only thing that counts
// them — W82's conformity reader, finding 15.)*
//
// **W78's two are DERIVED from the block having run rather than written as a literal**, which is
// [Q217](../doc/questions/q217.md)'s regress paid down by one edit: with a literal, deleting the
// block leaves this line claiming two runs nobody made, and the printed count — the thing a human
// reads at L7 — becomes the false half of `l6.ts`'s own output. Probes `d4` and `d4b` are the
// measurement. *The regress does not close: deleting the block, its twelve subjects and the two
// counts is still possible, and this makes it one edit dearer and the printed count honest.*
// **And `+ killResume.runs.length` since W90**: block (2g) counts every run it made — each reference, each killed process and
// each resume on a fresh runtime — as a LENGTH, on W78's precedent, so deleting the block moves the printed count with it.
const pairRunCount = pairResults.reduce((n, { runs }) => n + runs.length, 0) + 1 + (consumerRoad?.runs.length ?? 0) + (checkOff?.runs.length ?? 0) + (killResume?.runs.length ?? 0) + (gateKill?.runs.length ?? 0);
console.log(`\n  ladder L6 — ${reports.length + pairRunCount} real runs on fyflow-scheduler ${SCHEDULER_VERSION}, on ${runtime}\n`);
/**
 * **Every region of the run, in the row's declared order** — W23's conformity
 * reader, BLOCKING.
 *
 * The per-row ASSERTIONS were converted off the hard-coded `'split'`; this, the
 * table **a person reads**, was not. All four nested rows printed `-` for join
 * and branches, which is this renderer's spelling for *"the run entered no
 * region"* — so P7's exit artifact rendered as a region-free run in the one
 * artifact L7 exists for. That is [Q100](../doc/questions/q100.md)'s open
 * question — *whether a formatting bug can make the table say something FALSE
 * rather than merely ugly* — answered **yes**, by the item that introduced it.
 *
 * A multi-region run prints each region's own answer, prefixed, because a
 * `0:arrived 1:lost` with no region name cannot be told from an inner one.
 */
/*
 * **W86 — and this is the SECOND of the two sites the `soleRegion` comment names**, which W84 wrote
 * and dated to this item.
 *
 * It read every declared region through `soleRegion` and then **filtered out** whatever came back
 * `undefined` — so a region with two instances vanished from the table a person reads, silently,
 * which is [Q100](../doc/questions/q100.md)'s *a formatting bug can make the table say something
 * FALSE rather than merely ugly* one shape further on. It now walks `regions[id]` whole and prints
 * one row per INSTANCE, labelling each `opener@path` when there is more than one — so the two
 * instances of `perShard` are visible as two, and a region that is missing prints nothing because
 * it is missing rather than because there was no sole one.
 */
const regionsOf = (r: RunReport, e: {
  regionId?: string | null;
  otherRegions?: Record<string, unknown>;
  regionInstances?: Record<string, unknown>;
}) =>
  (e.regionId === null
    ? []
    : [e.regionId ?? 'split', ...Object.keys(e.otherRegions ?? {}), ...Object.keys(e.regionInstances ?? {})])
    .flatMap((id) => {
      const byPath = r.state.regions[id];
      if (byPath === undefined) return [];
      const paths = Object.keys(byPath).sort();
      return paths.map((p) => [paths.length === 1 ? id : `${id}@${p}`, byPath[p]] as const);
    })
    .filter(([, reg]) => reg !== undefined);

const renderRegions = (pairs: ReturnType<typeof regionsOf>) => {
  if (pairs.length === 0) return { branches: '-', joined: '-' };
  const one = pairs.length === 1;
  return {
    branches: pairs.map(([id, reg]) =>
      (one ? '' : `${id} `) + Object.entries(reg!.settled).map(([b, st]) => `${b}:${st}`).join(' ')).join('  '),
    joined: pairs.map(([, reg]) => (reg!.joined === null ? 'never' : String(reg!.joined))).join('/'),
  };
};

/**
 * **Both variable columns are DERIVED — W23**, for the reason `KEY_W`'s own
 * comment already gives: *"a hard-coded 40 silently TRUNCATED a row key … a human
 * artifact quietly lying about which run it was showing"*. A nested row prints two
 * regions, so `branches` roughly doubled and `join` became `true/false`; the first
 * version of this fix hard-coded 46 and truncated `inner 1.0:exited 1.1:e` — the
 * same defect, in the same file, on the same day.
 */
const allCells = [
  ...reports.map((r, i) => renderRegions(regionsOf(r, EXPECTED[i]!))),
  ...pairResults.flatMap(({ runs }) => runs.map(([, r]) => renderRegions(regionsOf(r, { regionId: 'split' })))),
];
const BR_W = Math.max('branches'.length, ...allCells.map((c) => c.branches.length)) + 2;
const J_W = Math.max('join'.length, ...allCells.map((c) => c.joined.length)) + 2;

console.log(`  ${w('run', KEY_W)}${w('outcome', 17)}${w('join', J_W)}${w('branches', BR_W)}${w('tasks', 6)}${w('ms', 6)}overlap`);
console.log(`  ${'-'.repeat(KEY_W + 35 + J_W + BR_W)}`);
for (const [i, r] of reports.entries()) {
  const { branches, joined } = renderRegions(regionsOf(r, EXPECTED[i]!));
  console.log(
    `  ${w(EXPECTED[i]!.key, KEY_W)}${w(r.state.outcome, 17)}${w(joined, J_W)}` +
    `${w(branches, BR_W)}${w(String(r.dispatched.length), 6)}${w(String(r.wallMs), 6)}` +
    `${r.branchesOverlapped ? 'yes' : 'no'}`,
  );
}

for (const { row, runs } of pairResults) {
  for (const [who, r] of runs) {
    // Both pair flows are depth-1 and their fanout is `split`; stated rather
    // than hard-coded through the same helper the rows above use.
    const { branches, joined } = renderRegions(regionsOf(r, { regionId: 'split' }));
    console.log(
      `  ${w(pairLabel(row, who), KEY_W)}${w(r.state.outcome, 17)}${w(joined, J_W)}` +
      `${w(branches, BR_W)}${w(String(r.dispatched.length), 6)}${w(String(r.wallMs), 6)}` +
      `${r.branchesOverlapped ? 'yes' : 'no'}`,
    );
  }
}

// Where each row's expected values came from. Printed so the human artifact
// carries its own derivation: `doc/workflow.md` section 5 rule 1 — expected
// values come from the spec, and a reader should not have to take that on trust.
console.log('\n  why each row reads as it does:');
for (const e of EXPECTED) console.log(`    ${w(e.key, KEY_W)}${e.why}`);
// **Read from `PAIR_ROWS[*].why`, not written out a second time here.** It used
// to be a string literal in this call, so the pair row's stated reason and the
// row itself could drift with nothing to say so - which is the same defect one
// rung down from the counts this file already derives.
for (const row of PAIR_ROWS) console.log(`    ${w(row.key, KEY_W)}${row.why}`);

// **An assertion-count floor, because a skipped assertion reports as a pass.**
// `doc/workflow.md` section 1 rule 4 at assertion granularity: W5's test-adequacy
// pass turned the per-row `continue` into an unconditional one and watched this
// file print `24 assertions, 0 failed` — 48 assertions silently gone, exit 0. Same
// for the cross-row block, which is where ADR 0015's motivating claim lives.
//
// The total is derived from two declared constants rather than typed as one
// number, so adding an assertion to the loop updates it in one place. What it pins
// is that **every row ran the whole block**.
// **Shape-aware since W6**, because the rows are no longer uniform: a flow with no
// fan-out asserts one thing about `regions` where a fan-out asserts two, and a row
// may declare extra `outcomesSeen` assertions. So the floor is per-row and derived,
// and it is checked TWO ways — every row ran what its shape says, and the total is
// what this file declares. Either alone misses a uniform reduction.
/**
 * **17 since W23**, from 16: a row that enters a region now also asserts that the
 * run entered **exactly** the regions it declares. That check is in the base
 * rather than in `extras` because every region row pays it, and a row's
 * `otherRegions` cost is two per region and is in `extras` because it is not.
 *
 * **21 and 19 since W57, from 19 and 17**: every row now asserts ADR 0048 rule 5 (every task
 * the scheduler holds is a `FyflowTask`) and `OR-R1`'s numeric `attempts`, in the base because
 * every row pays them — they are vacuous only for a row that dispatched nothing, and the
 * cross-row clause beside `CROSS_ROW_SUBJECTS` refuses that being every row.
 */
/**
 * **22 and 20 since W63, from 21 and 19**: every row now asserts ADR 0051 rule 4 — the pools
 * carrying a language are exactly the types its flow transforms on — in the base because every
 * row pays it, and on the forty-two rows declaring no transform it says that NO pool carries one.
 */
// **24 since W98**: +2, the dispatch comparison going from one clause (in order) to three (the SET, the pairs the run
// FIXES, and the per-row control). `unorderedDispatch`'s two extras are gone with it.
const PER_REGION_ROW = 24;
const PER_PLAIN_ROW = 22;
/**
 * **A number a human writes, and its NAME over-reads** — 13 at W23, 18 at W35, 32
 * at W43, 39 at W45, **61 at W47** and **68 at W51**.
 *
 * *(This read "57 at W47" and the constant that item shipped was **61** — the
 * sequence was mis-stated in the same commit as the parenthetical telling the next
 * item to append to it, and W51 took it 61 → 68 without appending. And it is NOT
 * "the cross-row block's own size": measured on the shipped file, **66** assertions
 * run under the `cross-row` label, **58** of them before the line that consumes
 * this constant, and the constant is **68** — it silently absorbs one per-row
 * assertion that runs after the row loop, so adding a row moves it for two
 * unrelated reasons at once. W51's conformity reader.)*
 *
 * They are cross-row rather
 * than per-row for the reason W23's dotted-path clause is — a per-row assertion
 * dies with the row it is in, and what W23's adequacy reader deleted was the rows.
 *
 * *(This paragraph read "18 since W35, from 13" for two plans while the constant
 * below went to 39 and then to 57, three lines above the number it described —
 * [Q202](../doc/questions/q202.md)'s shape in the file that carries the count.
 * W47's conformity reader; it is now a SEQUENCE rather than a latest value, so the
 * next item appends rather than rewriting.)*
 *
 * **81 at W57, from 80**: one cross-row clause — the two rule 5 observers were not vacuous
 * everywhere.
 *
 * **87 at W58, from 81**: six cross-row assertions in four clauses — non-zero `attempts` in
 * exactly the declaring rows and that set non-empty, the groups named against the groups
 * declared and against the groups the scheduler was BUILT with (the adequacy reader's second
 * observer), the resource-event ids against the declaring rows, and `RETRY_POLICY_KEYS` against
 * the scheduler's own `.d.ts`. *(86 at the author pass.)*
 *
 * **92 at W59, from 87**: five cross-row assertions in one block (2b) — the node TYPES the flows
 * name against the registry both ways, the registry against its own source text, the pools the
 * scheduler REPORTS against the bare `pool()` lines plus one per type, the typed pair's two
 * settings DIFFERING in both keys (read from the definition), and every typed retry having run
 * under a policy the NODE does not declare. The two W58 clauses beside them are widened, not
 * added to: groups NAMED now includes the types', and the resource-event ids declared include
 * `heldGroups`. **95 the same day**: three more in block (2c), binding the two manifests' sub-path
 * exports — the one declaration of this item nothing else read. **96 after the readers**: the three
 * map instances' inputs pairwise distinct, read from the run (the adequacy reader).
 *
 * **109 at W63, from 96**: ten cross-row assertions in block (2d) — Q263's three totals distinct
 * and numeric, the arity pair differing in arrivals and totals, `Scorer`'s pool carrying the engine
 * in exactly the transforming runs, the languages the flows name against the harness's registry
 * both ways, the helper's reading of every definition against this file's, the plain-values clause
 * asked of an engine-built array, a `transform failed` error in exactly the declaring rows plus
 * that set non-empty, and the reshaping road validating with zero findings plus its positive
 * fixture — **and three more from W43's per-row clause below**, which asserts a `nodeResults`
 * entry for every dispatched id on every row whose NODE declares a `needs`, and the three
 * `transformed` rows do. *(Written as 104 before the first run, which reported three assertions
 * the rows' extras did not account for; the clause is labelled per row and counted here.)*
 * **110 since W65**: block (2b)'s retry clause split into a pair — the type's-budget half and the
 * own-policy half — because every task node is typed now and *typed* stopped discriminating.
 */
// **+16 since W65 — W67.** Nine for block (2e)'s four claims and their four controls plus the
// document DIFF; two for the `FD-V33` fixture and its control that W67's own rule 8 pass forced
// (`a10`: a schema requiring a key, with every node declaring it, is a guard with no live case); and
// five its adequacy reader forced — the scheduler's own `scriptUrl` behind the pool readings (a10),
// the custom group's object NAME as a claim rather than a factory string (a1), and the three of the
// SHIM RUN, which is P18's sample's own call and which no row could make (a15); and two for
// Outputs (1) as an ASSERTION — the files under `examples/` that construct a pool, a scheduler, a
// driver or a built-in group are exactly the ones that DECLARE it, with the positive fixture that
// keeps the detectors honest (a8). *(This read "nothing under `examples/` constructs …" and stayed
// present-tense through the commit that replaced the `[]` with an equality — section 1 rule 5's
// WITHDRAWN-claim direction, in the file the item was editing. W81's conformity reader.)* And four more
// its reader forced — `THREADABLE_TYPES` as a MEMBERSHIP (a2), the ABSENT-schema case (a13), the
// four schemas CARRIED (a6), and the pool map anchored to the scheduler's own task map (a4).
// *(110 at W65, 119 at this item's first run, 121 after its author pass. The convention this file
// keeps is that the next item APPENDS; W67's conformity reader, finding 9, found the chain stopping
// at W65 with the +11 unaccounted for — which is how the assertion count then shipped stale by two
// in two documents.)*
// **+12 since W73 — W78, P20's EXIT ARTIFACT.** Seven claims of the consumer-road block and its
// three CONTROLS, plus the pair clause and the option-key membership: the block makes two runs
// and every one of its assertions is cross-row, because it is not an `EXPECTED` row and could
// not be (finding C). *The convention this file keeps is that the next item APPENDS.*
// **+17 since W78 - W82, P21's EXIT ARTIFACT**, and the decomposition is: the check-OFF pair's SIX
// claims and THREE controls (9); the partition that says the check was OFF on every row which did
// not ask for it, with its own control (2); the DERIVED block — which row must report `gauge` is
// arithmetic over the document's declared `maximum` and each payload's word count — as a
// precondition, a claim, ONE per-row reading and a control (4); and `settledOwnKeys`' own sentence
// with its control (2). All seventeen are cross-row because the ON arm IS a row and the OFF arm is a
// second run of that row, so each claim is about the two together and belongs to neither.
//
// *(It read **+14** beside a correct literal and its decomposition was wrong three ways — two
// controls where the block has three, one partition assertion where there are two, and two per-row
// readings where the loop executes once. W82's conformity reader, finding 7, in the comment that
// explains the number rather than in the number.)*
// **+17 since W82 — W86, P22's EXIT ARTIFACT**, and the decomposition is: block (2f)'s TWELVE claims
// — the shape read from the documents, one opener's N instances, the OVERLAP at the instant a join
// became terminal, the closing ORDER, the two collections' disjointness, `regionPath` as a relation
// over every event this rung emits, `JP-R12` at two levels, the arrangement that makes the order
// determinate, and prediction 3's reach read from the document — and its FOUR controls: the
// detector asked about a `fanout`, the control ROW, the whole rung, and the non-root events that
// keep the relation from being vacuous — plus the FIVE its two readers forced: a SECOND ROAD to the
// overlap (the sequence's own indices, because `maxTogether`, `closedOrder` and `othersAtClose` are
// three projections of ONE walk and a control over any of them leaves the others free), a second
// road to the detector (`ID-R6`'s refusal, ADR 0062 consequence 6), `soleRegion`'s refusal against
// its answer as a PAIR, and the two reach clauses folded into the claims they bound. All thirteen are cross-row because the central claim is
// about a pair of runs and the controls range over all SIXTY, plus the clause that makes this block
// REPORT rather than crash when one of its two keys stops matching (probe `d1`). **A FIFTEENTH assertion this item
// adds is NOT in this number and the reason is positional**: the rendered table's own clause sits
// beside its sibling, below the line that checks this constant, so — like the three that were
// already there — it moves `DECLARED_TOTAL` and not `CROSS_ROW`. *This constant is the cross-row
// count AT THAT LINE, which is the quirk its own header records.*
// *The convention this file keeps is that the next item APPENDS.*
// **+20 since W86 — W90, P23's EXIT ARTIFACT**: block (2g)'s SIXTEEN claims — identical at every kill point, the
// re-dispatched ids against the killed process, the count read from the scheduler, where `resumed` sits and the positions,
// the lost tail regenerated, prediction 2's substance and its wording, at-least-once made visible by the drain, the header
// after the first events, the three-process chain, the whole run in the store, the arrival-keyed store refused, the two
// cuts and their pair, the parked task and its resolution — and its FOUR controls. All twenty are cross-row because
// the block is outside the row loop and every claim is about a pair of processes. *(Written as 20 at the declaration,
// and 20 at the build.)*
// **+7 since W90 — W94, P24's EXIT ARTIFACT**: block (2h)'s THREE claims — identical at every kill point, the stored `gated`
// prefix regenerated, the re-dispatched ids against the killed process — and its TWO controls (every kill point from two
// sources; the selections discriminate), and the TV pair's two: the arrangement differs in its order alone, and a different
// file opened every multi-file series with the same series opened once each. The three TV ROWS are per-row (199) and not
// here. *(Written as 7 at the declaration, and 7 at the build.)* **+1 the same day, before either reader**: the route
// control above, which W94's own rule 8 planning showed was missing (`d2`: the file table losing its trailer took `nokey`
// out of every run with every clause green).
// **+1 since W94 — W97**: block (2h)'s arrangement, asserted beside the identity it rests on (obligation (f)).
// **+2 since W98 — W99**: the arc that was Q391's false `no`, asserted fitting on every gate row, and the
// per-series consumer's own requirement beside it (ADR 0068; its adequacy reader, F4 and F5).
// **+2 since W97 — W98**: the dispatch-order derivation's own census — `RN-R27`'s three relations counted apart — and
// its CONTROL on two constructed sequences, which is what the census itself had none of (its adequacy reader, B1).
// **+16 since W99 — W110, P26's EXIT ARTIFACT, and the sixteen split 10 + 6.** TEN are its own block: the predicate
// registry each row's driver was handed against the names its document cites, with the control that exactly one name
// was registered SOMEWHERE; the two documents differing in the ONE `when`; the two roads' dispatch sequences, with the
// control that the shared payloads route differently from each other; the `stalled` tripwire unreached; the UI
// document's key set and its entries against the shared document's, both ways; its empty groups/pools; and `Transform`
// in no registry the driver was handed. **The other SIX are not this item's clause at all** — W43's *a row declaring a
// NODE-level `needs` declares what every task it dispatched returned* iterates over EXPECTED, and all six artifact rows
// declare one on `rollup`, so each adds one.
// **+8 more after BOTH READERS, so +24 in total, and the eight are REPAIRS rather than new claims.** Clause (1) gained a
// second reading (the document's own `when`s, a different object from the registry); clause (3) became TWO literal
// comparisons where it was one derived equality; clause (5) became THREE (the section list, a four-and-four key literal,
// and byte-equality against `registry.json`'s own bytes) where it was two; and clause (7) is NEW — the DERIVED document
// against the file at BOTH settings of the knob, six assertions because each setting checks the diff set plus the two
// types whose `inline` the file leaves unsaid. **Every one of the eight exists because a reader measured the clause it
// replaces at ZERO.** Derived: with the block rewritten the run read **2386** against a derived **2378**, so +8.
// *(An earlier version of this comment said *the first run read 2378 against a derived 2362, and 2378 - 2362 = 16*. That
// arithmetic cannot be reconstructed from the shipped tree — 2176 + 198 = 2374, not 2362 — because the per-row figure at
// that moment was 186 and the rows gained twelve assertions afterwards. The conformity reader's 20: self-consistent at
// the time and unverifiable now, which is why the live sentence states only the figures this tree produces.)*
// **+2 for the SEVENTH row, which the adequacy reader's F9 bought**: the threaded row's own pair clause (the inline
// row's sequence on the same payload), and one more from W43's per-row `needs` clause, which iterates over EXPECTED.
const CROSS_ROW = 246;
const base = (shape: string) => (shape === 'region' ? PER_REGION_ROW : PER_PLAIN_ROW);
for (const [key, shape, cost, extras] of rowCosts) {
  if (cost !== base(shape) + extras) {
    failures.push(`gate\n      ${key} ran ${cost} assertions, not ${base(shape) + extras}` +
      ` (${shape}, +${extras} declared extra) — a block was skipped`);
  }
}
if (rowCosts.length !== EXPECTED.length) {
  failures.push(`gate\n      ${rowCosts.length} of ${EXPECTED.length} rows completed their assertion block`);
}
/**
 * **L6 runs a `needs` at BOTH SITES, and this is what says so — W43.**
 *
 * The four rows this item adds are P12's exit artifact, and W23's adequacy reader
 * measured what holds a set of rows down: **nothing**. Its four nested rows could
 * be deleted, `DECLARED_TOTAL` edited to match, and the two now-unused imports
 * dropped, and L6 was green at 388 with every check passing. `ROW_KEYS` is a
 * literal, so deleting a row and its name is two edits in one diff rather than an
 * impossibility; the cross-row block is where a bound whose authority is elsewhere
 * belongs.
 *
 * **Both halves, because either alone is satisfied by the other's absence** — and
 * the two are genuinely different mechanisms rather than one written twice. A
 * `needs` on a NODE says what its worker receives, is resolved in `enter`, and
 * reaches a real worker process; a `needs` on an EDGE says what that edge's
 * predicate sees, is resolved in `advance` per edge, and reaches no worker at all.
 * [ADR 0040](../doc/decisions/0040-what-a-node-can-reach-is-the-runs-own-outputs-and-a-node-id-names-them-relative-to-a-branch-path.md)
 * and [ADR 0041](../doc/decisions/0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md)
 * are two decisions, and this is two clauses.
 *
 * **Read from the DEFINITIONS the rows run, not from a list of row keys**, so
 * renaming a row does not move it and deleting the rows does.
 */
{
  const nodeNeeds = EXPECTED.some((e) => e.definition.nodes.some(
    (n) => (n as { needs?: unknown }).needs !== undefined));
  const edgeNeeds = EXPECTED.some((e) => e.definition.nodes.some(
    (n) => ((n as { edges?: { needs?: unknown }[] }).edges ?? []).some((x) => x.needs !== undefined)));
  check('cross-row', 'L6 runs a flow whose NODE declares a needs — ADR 0040 on real workers',
    nodeNeeds, true);
  /**
   * **A row that declares a NODE-level `needs` declares what every task it
   * dispatched RETURNED — W43's adequacy reader, BLOCKING.**
   *
   * Measured: deleting the whole `nodeResults` block from the three map rows and
   * editing **one** number — `DECLARED_TOTAL` — leaves `736 assertions, 0 failed`
   * at `36 real runs`, with `ROW_KEYS` untouched and all three bounds in this block
   * still green. **ADR 0040 rules 5 and 6, `JP-R11` and `JP-R12` become unasserted
   * for one edited literal**, and the W41 revert falls from 18 failures to 7, all of
   * them structural. The per-row floor cannot see it: `extras` is derived from the
   * expectation, so a thinner expectation lowers both sides of that comparison.
   *
   * **The bound is derived from the row's own `dispatched` list**, which `ROW_KEYS`
   * and the row's other clauses already pin — so it cannot be satisfied by trimming
   * it, and it says the thing the rows exist to say: *what did each node receive*
   * is only answerable if each node's result is written down.
   *
   * **Scoped to the NODE site**, because that is where the claim is about a value a
   * worker computed. The two edge-site rows assert their mechanism through
   * `dispatched` — which of two edges was taken — and pinning every node's result
   * there would be a bound with no argument behind it.
   */
  for (const e of EXPECTED) {
    if (!e.definition.nodes.some((n) => (n as { needs?: unknown }).needs !== undefined)) continue;
    check(e.key, 'declares a nodeResults entry for every id it dispatched — ADR 0040 rules 5 and 6 ' +
      'are only asserted where a result is written down',
      Object.keys(e.nodeResults ?? {}).sort(), [...e.dispatched].sort());
  }
  check('cross-row', 'and a flow whose EDGE declares one — ADR 0041, a different site and a different call',
    edgeNeeds, true);
  /**
   * **The two discriminating PAIRS actually differ — W43's adequacy reader, and it
   * is the same shape twice.**
   *
   * This item added two rows whose whole purpose is to be the *other half* of a row
   * beside them, and in both cases the differing property was carried by literals
   * that nothing compared:
   *
   *   - `map-with-context` runs twice at two run configs, so that no single literal
   *     substituted for the declared `run` key passes both. Editing
   *     `CONTEXTED_AGAIN` back to `0.4` and its five expected scores to match cost
   *     **0** — and with the two rows identical, `theirs = 0.4` in the worker cost
   *     **0** too. *The declared key is never read and the whole of Q166 is green.*
   *   - `decision-on-an-earlier-step` runs LOW and HIGH so a predicate cannot pass
   *     by returning a constant. Editing the HIGH row's payload to `LOW` cost **0**,
   *     and a predicate of `() => true` then cost **0**.
   *
   * Both are `check-policies`' own `JP-R9` sentence — *compare the two halves rather
   * than copy one of them* — unapplied to the fixtures this item added for exactly
   * that reason. `isLowConfidence` has carried a *"returned FALSE at 0.9 and TRUE at
   * 0.1 — it can fail"* clause since W5; W43's predicate was given none.
   *
   * **Read from the rows' PAYLOADS and from the runs' own verdicts**, so neither
   * clause can be satisfied by renaming a row.
   */
  {
    const runConfigs = EXPECTED.filter((e) => e.key.startsWith('map-with-context'))
      .map((e) => e.payload.confidence);
    check('cross-row', 'the two map-with-context rows run at DIFFERENT run configs — without which ' +
      'a literal in the worker stands in for the declared `run` key and costs nothing',
      new Set(runConfigs).size, runConfigs.length);
    assertThat('cross-row', 'and there are two of them at all — the pair is the assertion',
      runConfigs.length === 2, `run configs: ${runConfigs.join(', ')}`);

    /**
     * **W45's pair, and its adequacy reader found it held down by nothing.** The
     * two `reference-if-it-ran` rows exist to be each other's other half — LOW takes
     * the review road and `verdict` arrives, HIGH routes around it and the key is
     * absent — and the row's own docblock says *"Neither row means anything without
     * the other"*. Measured: making the HIGH row take the LOW payload, with its
     * `dispatched` and `nodeResults` edited to match and `DECLARED_TOTAL` bumped by
     * one, cost **0 failures** — after which `FD-C4` resolving to `null` instead of
     * ABSENT cost 0, and the whole conditional branch could be deleted for 0.
     *
     * `doc/workflow.md` section 5 rule 8's fourth requirement on the SET: whatever
     * makes a discriminating pair differ is itself a claim. Read from the rows.
     */
    const ifItRanRows = EXPECTED.filter((e) => e.key.startsWith('reference-if-it-ran'));
    check('cross-row', 'the two `reference-if-it-ran` rows are a PAIR — two rows, at two payloads',
      ifItRanRows.length, 2);
    check('cross-row', 'and the payloads they run at DIFFER, which is the whole of what the pair is',
      new Set(ifItRanRows.map((e) => e.payload.confidence)).size, ifItRanRows.length);
    // And what the two runs DID differ in: one dispatches `review` and the other
    // does not. A driver that always composed the key, or never did, passes one row
    // and fails the other only while the two roads are two roads.
    check('cross-row', 'one row routes through `review` and the other around it',
      ifItRanRows.map((e) => e.dispatched.some((id) => id.includes(':review:'))).sort(),
      [false, true]);
    // And the OBSERVABLE the pair turns on, read from the rows' own expectations
    // rather than from a literal here: `sawVerdict` is true on one and false on the
    // other. Collapsing the payloads makes these two equal and this clause red.
    check('cross-row', 'and `sawVerdict` differs across them — FD-C4`s only observable',
      ifItRanRows.map((e) => Boolean(
        (Object.values(e.nodeResults ?? {})
          .find((r) => r !== null && typeof r === 'object' && 'sawVerdict' in (r as object)) as
          { sawVerdict?: boolean } | undefined)?.sawVerdict,
      )).sort(),
      [false, true]);

    const decisionRows = EXPECTED.filter((e) => e.key.startsWith('decision-on-an-earlier-step'));
    const tookReview = decisionRows.map((e) => e.dispatched.some((id) => id.includes(':review:')));
    check('cross-row', '`earlierWasLowConfidence` returned TRUE on one row and FALSE on the other — ' +
      'it can fail, which a constant predicate cannot be told from without both',
      [...tookReview].sort(), [false, true]);
  }
  /**
   * **And the reference FORMS, because a form is what `FD-V28` decides on** — four of
   * them since W45 made `?` a modifier, which is what the bound below compares.**
   * `"."` is *what I would have received anyway*, a bare node id names ONE output,
   * and `["n"]` names one per item of a map region the reader is outside of. Two of
   * the three were unreachable at L6 before this item and the third has never been
   * here at all; a row set carrying only the bare form would satisfy both clauses
   * above while leaving `FD-C2`'s whole distinction untested on real workers.
   */
  const forms = new Set<string>();
  for (const e of EXPECTED) {
    for (const n of e.definition.nodes) {
      const sites = [(n as { needs?: Record<string, unknown> }).needs,
        ...((n as { edges?: { needs?: Record<string, unknown> }[] }).edges ?? []).map((x) => x.needs)];
      for (const site of sites) {
        for (const ref of Object.values(site ?? {})) {
          // **`suffix` is a FOURTH bucket and not a variant of the other three** —
          // W45, and it is what `spec/flow-definition.md` section 3's table says: the
          // `?` is a MODIFIER, so the table has four rows and five spellings. Before
          // this the bucketing was three-way and could not see a conditional
          // reference at all — so the two new spellings would have collapsed into
          // `one` and `all`, and this clause would have read 3 against a table of 4
          // with no row to point at. *A bucketing that cannot express the thing the
          // table just gained is a list bound to nothing* (`doc/workflow.md`
          // section 5 rule 8 obligation (e)'s third shape).
          const spelling = Array.isArray(ref) ? ref[0] : ref;
          forms.add(
            ref === '.'
              ? 'self'
              : typeof spelling === 'string' && spelling.endsWith('?')
                ? 'suffix'
                : Array.isArray(ref)
                  ? 'all'
                  : 'one',
          );
        }
      }
    }
  }
  // **The expected side comes from `spec/flow-definition.md`'s own table, not from
  // a literal here** — the pattern the node-kind bound above uses, and for the same
  // reason: a literal on both sides of a comparison is a list bound to nothing.
  // Deleting a row from that table now moves this bound and the run goes red, which
  // a literal `3` could never see.
  //
  // **What it does NOT fix is the probe named beside it, and this comment claimed
  // otherwise** — W43's adequacy reader. *"A probe that replaces the computed side
  // with the expected one leaves the two equal"* is true of `referenceFormsInSpec()`
  // exactly as it was of `3`: substituting the expected side for the computed one
  // still costs zero. **Re-sourcing the EXPECTED half cannot close a hole in the
  // COMPUTED half**, and the two clauses above — one per site — are what stand
  // against it. The claim is corrected rather than the bound removed, because the
  // bound is right for the reason that survives.
  check('cross-row', 'L6 runs one reference form per row of spec/flow-definition.md section 3`s table',
    [...forms].length, referenceFormsInSpec());
  // And WHICH four, so a fifth bucket appearing is a finding rather than a silently
  // absorbed one — the same both-ways shape `test/definition/needs.test.ts` uses at
  // L1, and the half a count cannot see on its own.
  check('cross-row', 'and they are the four the table names, not four of something else',
    [...forms].sort(), ['all', 'one', 'self', 'suffix']);

  /**
   * **`FD-V29`'s REFUSAL, made observable at L6 — W47, and it is this item's
   * headline.**
   *
   * **Measured before this block existed: deleting `FD-V29` from
   * `src/definition/validate.ts` cost ZERO L6 failures.** `806 assertions, 0 failed,
   * exit 0`, against a clean control before and after. So
   * [ADR 0042](../doc/decisions/0042-a-reference-says-whether-it-is-conditional-and-the-bare-form-means-the-target-certainly-ran.md)
   * rule 2 — the half [Q187](../doc/questions/q187.md) was asked for — was
   * unobserved on real workers, while `FD-C4` cost 5 and the suffix going unparsed
   * stopped the run from reporting at all.
   *
   * **The reason is structural rather than an oversight in the row set.** Every
   * reference any L6 row runs is either certain or written with a `?`, because a row
   * is a RUN and *a document `FD-V29` refuses does not start*. A row for the refused
   * document would be a row with no run, no dispatch and no worker — which is why
   * this is not another `EXPECTED` entry. **A rule whose whole effect is that a run
   * never happens is invisible to a rung made of runs**, which is
   * [W35](../doc/work-items/w35-a-map-on-real-workers.md)'s *`N` too small completes
   * and is silent* one rule along, and W23's *four rows deletable for one edited
   * number* from the other direction.
   *
   * So the refusal is asserted **on the definition this file RUNS**: take `RIR`, make
   * its one reference unconditional, and require `validateDefinition` — reached
   * through `index.ts`, which is the surface a consumer has — to refuse it under
   * `FD-V29` and nothing else.
   *
   * **Two observers over one fact** (obligation (c)'s LIMIT): the finding's `rule`
   * and the finding's `detail`. A refusal that fired under the wrong id passes
   * neither; a refusal reported with a useless message passes the first only.
   *
   * **The registry is held CONSTANT across the pair** and is derived from the
   * document's own nodes, deliberately: the claim is about the suffix, so the
   * registry must not be a second variable. **It is a source both assertions read** —
   * W47's conformity reader measured that a registry missing `AttestWorker` takes the
   * refusal set to `["FD-V29","FD-V5"]` and the control from 0 to 1 — so the probe
   * for it is a PROVENANCE probe rather than a ceiling, and the literal it substitutes
   * has to differ from the derived value or it changes nothing. **`FD-V5` WAS the
   * workerType rule** — *a `task`'s `workerType` is not a key in the scheduler's
   * `workerPools`* — and this block's first version cited `FD-V16`, which is the id
   * charset. *(Since W65 the registry is derived as TYPES and the missing-type refusal is
   * `FD-V32`; `FD-V5` is retired with `workerType`.)*
   */
  {
    const ran = EXPECTED.filter((e) => e.definition === RIR);
    check('cross-row', 'L6 runs the flow P13 exists for, and runs it at both of its payloads',
      ran.length, 2);
    // The reference the rows above actually carry, read off the definition rather
    // than restated here — so editing the flow moves this clause with it.
    const needsOf = (d: FlowDefinition, id: string) =>
      (d.nodes.find((n) => n.id === id) as unknown as { needs: Record<string, unknown> }).needs;
    check('cross-row', 'and its reference is written CONDITIONALLY, which is what lets it run at all',
      needsOf(RIR, 'publish').verdict, 'review?');

    // The same document with the suffix removed — one character, and nothing else.
    const bare = JSON.parse(JSON.stringify(RIR)) as FlowDefinition;
    needsOf(bare, 'publish').verdict = 'review';
    // **And that the pair differs in exactly that one character is itself a claim** —
    // rule 8's fourth requirement on the SET. Putting the suffix back must give the
    // document L6 runs, byte for byte; without this the `bare` construction could
    // drift into a second difference and the refusal below would be about that.
    const restored = JSON.parse(JSON.stringify(bare)) as FlowDefinition;
    needsOf(restored, 'publish').verdict = 'review?';
    check('cross-row', 'and the two documents differ in exactly that one character — the pair`s own claim',
      JSON.stringify(restored), JSON.stringify(RIR));

    const registry = registryOf(RIR);
    const refused = validateDefinition(bare, registry);
    check('cross-row', 'and WITHOUT the suffix the same document is REFUSED, under FD-V29 and nothing else',
      [...new Set(refused.map((f) => f.rule))].sort(), ['FD-V29']);
    assertThat('cross-row',
      'and the refusal names the fix — `"review?"`, which is the document L6 actually runs',
      refused.some((f) => f.detail.includes('"review?"')),
      `details: ${refused.map((f) => f.detail).join(' | ').slice(0, 240)}`);
    // **The CONTROL, and it is what stops all of the above passing for the wrong
    // reason** (`doc/workflow.md` section 5 rule 8's requirement on the harness): the
    // document L6 runs is ACCEPTED, so the refusal is a property of the suffix rather
    // than of the flow, of the registry, or of a validator that refuses everything.
    check('cross-row', 'while the document L6 RUNS is accepted — the control for the three above',
      validateDefinition(RIR, registry).length, 0);
  }

  /**
   * **All FIVE of section 3's spellings reach a real worker** — W47, and this item's
   * declared Output (3).
   *
   * The `forms` bound above compares four buckets to the table's four ROWS and is
   * satisfied by four spellings, because the table's fourth row carries **two** —
   * `"n?"` and `["n?"]` — and a bucketing over rows cannot see that one of them is
   * absent. So a spelling is not a row, and this is the second source.
   *
   * **The first version of this block asserted an ABSENCE and its stated reason was
   * FALSE** — W47's conformity reader. It said `["n?"]` needs *"a map region inside a
   * branch the run loses, which is a flow this repository does not have"*, and
   * `nested-map.flow.json` is that shape and is a row on this rung; `map-in-fanout`
   * in the normative corpus is a second instance, and ADR 0042's own seven-shape list
   * names both. **Measured on the shipped document**: `publish.needs.x = ["item"]`
   * gives `FD-V29`, `["item?"]` is ACCEPTED. So the coverage the item owed was one
   * `needs` key away on a flow already running, and it is taken rather than recorded
   * as an absence.
   *
   * **Both halves**, because either alone is satisfiable by the other's absence: the
   * COUNT says the table names one more spelling than it has rows, and the SET says
   * which five.
   */
  {
    const l6Spellings = new Set<string>();
    for (const e of EXPECTED) {
      for (const n of e.definition.nodes) {
        const sites = [(n as { needs?: Record<string, unknown> }).needs,
          ...((n as { edges?: { needs?: Record<string, unknown> }[] }).edges ?? []).map((x) => x.needs)];
        for (const site of sites) for (const ref of Object.values(site ?? {})) l6Spellings.add(spellingOf(ref));
      }
    }
    // **Derived from the ROW count rather than from a literal `5`**, and it says the
    // structural thing: exactly one of the table's rows carries two spellings, which
    // is what *`?` is a modifier* means in the table rather than in the prose.
    check('cross-row', 'section 3`s table names exactly one more SPELLING than it has rows — `?` is a modifier',
      REFERENCE_SPELLINGS_IN_SPEC.length, referenceFormsInSpec() + 1);
    assertThat('cross-row', 'and the conditional ARRAY spelling is one the table actually NAMES, ' +
      'so the set equality below is over five and not over four',
      REFERENCE_SPELLINGS_IN_SPEC.includes('["n"]?'),
      `the table names: ${REFERENCE_SPELLINGS_IN_SPEC.join(', ')}`);
    check('cross-row', 'and L6 runs every one of them, the conditional ARRAY form included',
      [...l6Spellings].sort(), REFERENCE_SPELLINGS_IN_SPEC);
    // **And that the fifth one's `?` is LOAD-BEARING where L6 runs it**, which is
    // what stops it being a spelling somebody wrote for the sake of the count:
    // strip the suffix from `nested-map`'s own reference and `FD-V29` refuses the
    // document. Same shape as the `RIR` block above, at the other aimed form, and
    // derived from the definition this file runs rather than from a literal.
    {
      // **`?? {}` and not a dereference** — rule 8's own requirement that a
      // provocation fires FOR THE REASON IT NAMES. Removing the reference from
      // `nested-map.flow.json` left this `undefined` and L6 **crashed**, which reads
      // as a detection and is not one: the run reported no assertions at all. It now
      // fails as an assertion naming the key that left.
      const nmPublish = ((NM.nodes.find((n) => n.id === 'publish') as unknown as
        { needs?: Record<string, unknown> }).needs) ?? {};
      check('cross-row', 'and the fifth spelling is written where `FD-V28` requires the array form',
        nmPublish.scores ?? null, ['item?']);
      // Built defensively for the same reason as above: with the reference gone this
      // must still produce a document, so that the clause which FAILS is the one that
      // says the reference left rather than a `TypeError` that says nothing.
      const bareNm = JSON.parse(JSON.stringify(NM)) as FlowDefinition;
      const bareNmPublish = bareNm.nodes.find((n) => n.id === 'publish') as unknown as
        { needs?: Record<string, unknown> };
      bareNmPublish.needs = { ...(bareNmPublish.needs ?? {}), scores: ['item'] };
      const reg = registryOf(NM);
      check('cross-row', 'and WITHOUT its suffix that document is REFUSED under FD-V29 — the `?` ' +
        'is load-bearing at the ARRAY form too, which the `RIR` pair cannot say',
        [...new Set(validateDefinition(bareNm, reg).map((f) => f.rule))].sort(), ['FD-V29']);
      check('cross-row', 'while the document L6 runs is accepted — the control for the two above',
        validateDefinition(NM, reg).length, 0);
    }
  }

  /**
   * **The three lists, compared both ways** — W47, and the reasoning is at
   * `workerListsAsync` above.
   *
   * **This block claimed each clause was the OTHER two's evidence that the extraction
   * worked, and that is FALSE** — W47's adequacy reader. It is true of an extraction
   * returning NOTHING, which `nonEmpty` throws on; it is false of one **re-sourced to
   * its counterpart.** Measured: `poolRoles` sourced from `declaredRoles` costs 0, and
   * the compound — a role declared with an arm and no pool, which is the one direction
   * these clauses exist for — comes back **green** where the real source costs 1. The
   * same for `poolTypes` sourced from `documentTypes`.
   *
   * **So each of the three facts has exactly ONE observer, and that is a declared
   * limit rather than a repaired one** ([Q216](../doc/questions/q216.md)). The second
   * observer v0.13 asks for would have to be a second DERIVATION of the same fact, and
   * the only one available is a second regex over the same text — *a sensor
   * corroborating itself*, which is what obligation (c)'s LIMIT names. What the block
   * does buy is measured and is not nothing: `'zzz'` in `ROLES` costs **2**, an arm
   * for a role nothing declares costs **1**, a pool no document names costs **1**, and
   * all three were **0** before it. [Q212](../doc/questions/q212.md)'s shape — a proxy
   * bounded in one direction, recorded rather than dressed up.
   */
  {
    const documentTypes = new Set<string>();
    for (const e of EXPECTED) {
      for (const n of e.definition.nodes) {
        // **A TASK node's type, and only a task node's — W94.** A `gate` carries a `type` too, and it names a GATE type
        // (`distinct`, built in — ADR 0066 rule 3), which is no entry of the registry's `nodeTypes`: read off every node,
        // this clause named `distinct` as an unregistered node type on W94's first run, a node-kind site W92's census
        // (fifteen files outside `src/`) did not list because its read is `.type`, not `kind ===`.
        if (n.kind !== 'task') continue;
        const t = (n as unknown as { type?: string }).type;
        if (t !== undefined) documentTypes.add(t);
      }
    }
    // Since W65 every task node names a TYPE and every pool is one of the registry's types, so the
    // three-way agreement W47 wrote for `workerType` is over `type` — read from the source text here
    // and from the object the driver was handed in (2b) below.
    //
    // **The expected side gained the BUILT-INS at W110, and the reason is a THIRD namespace rather
    // than a looser clause.** A node type's name comes from one of three places since v0.28
    // ([ADR 0075](../doc/decisions/0075-a-node-that-only-transforms-is-a-built-in-type-with-no-inner-worker.md)
    // rule 5): the document's `nodeTypes`, the classes `code` supplies, and `BUILT_IN_NODE_TYPES`,
    // which is merged at every READ and declared by no document. This clause read the first two, so
    // it went RED on this item's first run naming `Transform` as an unregistered type —
    // **W109's own comment predicted exactly that** (*No L6 flow names one: a `Transform` node on
    // real workers is W110's*), and the figure is 2 of the 7 failures that run produced.
    //
    // **It is still both ways and still a MEMBERSHIP**: a built-in the flows never name is red here
    // as a consumer's unused type would be, which is what keeps the addition from being a widening.
    check('cross-row', 'every type the flows L6 runs name is a registry type or a BUILT-IN, and every one of those ' +
      'is named by one of them — the registry is not a list bound to nothing, and the library`s own types are a third namespace',
      [...documentTypes].sort(), [...WORKER_LISTS.types, ...WORKER_LISTS.classTypes, ...BUILT_IN_NODE_TYPES_L6].sort());
    // **W67: the pair that replaced `ROLES` against the switch.** A worker entry names a URL and a
    // module has to be at it — so the document's worker urls and the modules on disk are the two
    // halves, compared both ways. A key with no module is a task that fails to load; a module no
    // entry names is dead code the tree still typechecks and lints. Neither was observable before
    // this item, because there was ONE worker file and a `role` string chose an arm inside it.
    check('cross-row', 'every worker url the registry document declares has a module on disk, and every ' +
      'module under examples/workers/ is one the document declares, both ways — what replaced `ROLES` against the switch',
      WORKER_LISTS.workerUrls, WORKER_LISTS.modulesOnDisk);
    // And the WORKERS the types name are the workers the document declares — the third list, and the
    // one `resolveRegistry` refuses by name at construction, so this says the corpus reaches all of it.
    check('cross-row', 'and every worker some node TYPE names is one the document declares, both ways — ' +
      'a worker entry no type reaches is a registry entry nothing can run',
      [...new Set(Object.values(REGISTRY_DOCUMENT.nodeTypes ?? {}).map((t) => t.worker))].sort(),
      WORKER_LISTS.workers);

    // **W58 — four cross-row clauses, each a membership rather than a count.**
    //
    // (1) A non-zero `attempts` on an outcome record occurs in EXACTLY the rows that declare
    //     `attempts`, both ways. The per-row assertion says a declared id carried its number;
    //     this says no undeclared row's task was ever retried — and that at least one was,
    //     which is P16 prediction 2 stated as a set rather than a boolean.
    {
      const rowsWithRetries = EXPECTED
        .filter((_, i) => reports[i]!.log.some((r) => r.kind === 'outcome' && r.attempts > 0))
        .map((e) => e.key).sort();
      const rowsDeclaring = EXPECTED.filter((e) => e.attempts !== undefined).map((e) => e.key).sort();
      check('cross-row', 'non-zero attempts occurs in exactly the rows that declare it, both ways — ' +
        'the first non-zero attempts a scheduler has ever set at this rung, and only where a node asked for a retry',
        rowsWithRetries, rowsDeclaring);
      assertThat('cross-row', 'and that set is not empty — a real retry happened somewhere',
        rowsDeclaring.length > 0, 'no row declares attempts');
    }
    // (2) Obligation (e) on `Registry.groups`, the direction `runFlow` does not close by
    //     construction: every group a flow document NAMES is one the scheduler declares, and
    //     every group the scheduler declares is named by some flow this file runs — so a group
    //     registered and used by nothing is red here, as a pool no document names is above.
    //     **Since W59 a group is also named by a TYPE**: `NODE_TYPES[*].groups` are the pool's,
    //     registered through the helper, so they join the flows' `workerGroups` on the NAMED
    //     side — and a type's group the scheduler lacks, or a scheduler group no type and no
    //     flow names, is red here either way.
    {
      const named = new Set<string>();
      for (const e of EXPECTED) {
        for (const n of e.definition.nodes) {
          for (const g of ((n as unknown as { workerGroups?: string[] }).workerGroups ?? [])) named.add(g);
        }
      }
      for (const t of Object.values(REGISTRY_DOCUMENT.nodeTypes ?? {})) for (const g of t.groups ?? []) named.add(g);
      // **W67: a group a POOL's derivation names, where the derivation is a CLASS.** `GpuModel`'s
      // `pool()` computes `groups: ['vendor']` and `residentGroups: { gpu: … }`, and neither appears
      // in any document `nodeTypes` entry — so a clause reading the document alone would call them
      // groups nothing names. Read off the DERIVED pools the runtime built, which is where a class's
      // output is visible at all.
      for (const p of Object.values(reports[0]!.derivedPools)) {
        for (const g of p.groups) named.add(g);
        // `residentGroups` carries `key:cost` where the derivation gives a cost (see `derivedPools`),
        // and this clause is about the KEY — which is the name the scheduler resolves by.
        for (const g of p.residentGroups) named.add(g.split(':')[0]!);
      }
      const declaredBySchedulers = [...new Set(reports.flatMap((r) => r.schedulerGroups))].sort();
      check('cross-row', 'the groups the L6 flows NAME are the groups the scheduler DECLARES, both ways, with the groups the TYPES declare on the named side — ' +
        'FD-V31`s registry set is read off the scheduler, and this is the other direction',
        [...named].sort(), declaredBySchedulers);
      // **A SECOND observer of what the scheduler declares, read from the constructor call's
      // source rather than from the running object** — the adequacy reader's c04b: re-sourcing
      // `schedulerGroups` to a literal and registering a second group nothing names cost ZERO,
      // because the driver's registry and this clause both read the one variable. The two readings
      // must agree, so a literal in either place is red the moment the source moves.
      check('cross-row', 'and the groups the scheduler was BUILT with, read as source text, are the groups it reports holding — ' +
        'two readings of one fact, so neither can be a literal standing in for the other',
        WORKER_LISTS.groupIds, declaredBySchedulers);
    }
    // (2b) **Obligation (e) on `Registry.nodeTypes`, both ways, read from the SCHEDULER — W59.**
    //     Three readings of one registry, none a literal beside another: the types the L6 flows
    //     NAME (the documents), the types the driver was HANDED (`NODE_TYPES`, the object the
    //     helper built pools from), the `NODE_TYPES` literal as SOURCE TEXT (the second observer,
    //     W58's `groupIds` shape), and the pools the scheduler REPORTS holding (`schedulerPools`,
    //     read off `scheduler.workerPools` at construction) — which must be exactly one pool per
    //     type, since W65 turned the last `pool()` line into a type. A type the helper did not build
    //     a pool for, a pool no type accounts for, or a document naming a type the registry
    //     lacks, is red here; `FD-V32` refuses the last at construction and this is the rung
    //     that says the registry the driver checked is the scheduler the run used.
    {
      const namedTypes = new Set<string>();
      for (const e of EXPECTED) {
        for (const n of e.definition.nodes) {
          // A TASK node's type only — the clause above's W94 note: a gate's `type` is a gate type.
          if (n.kind !== 'task') continue;
          const t = (n as unknown as { type?: string }).type;
          if (t !== undefined) namedTypes.add(t);
        }
      }
      // **The registry the DRIVER was handed, which is the document's types UNION the classes the
      // `code` argument supplied — W67.** `GpuModel` is a class in no document, and `FD-V32` is
      // applied against the union, so a clause written over `REGISTRY_DOCUMENT.nodeTypes` alone
      // would call the sample's own class type unregistered.
      const registryTypes = [...new Set(reports.flatMap((r) => r.registryTypes))].sort();
      // **The built-ins are stored in no registry (ADR 0075 rule 5), so `registryTypes` does NOT
      // carry them and the flows now DO** — W110, and the asymmetry is the decision's own observable
      // rather than an exemption. `registryTypes` is what the DRIVER was handed, which is the
      // document's types union the classes `code` supplied; a built-in is merged at every READ and
      // stored nowhere, exactly as a gate type is. So the moment an L6 flow names one, the two sides
      // differ by exactly the built-ins — which is what this clause now says, both ways.
      //
      // *(It needed no exemption at W109 and W109's own comment said why: no L6 flow named one, and
      // *a `Transform` node on real workers is W110's*. This is that item. The clause that carried a
      // subtraction while `resolveRegistry` STORED them is gone for good — the storage went at W109's
      // finding 3, and what is added here is the other direction.)*
      const builtInTypes = [...BUILT_IN_NODE_TYPES_L6].sort();
      check('cross-row', 'the node TYPES the L6 flows name are the types the registry holds PLUS the library`s own, both ways — a type registered and used by nothing, or named and unregistered, is red, and a built-in STORED in the registry is red too',
        [...namedTypes].sort(), [...registryTypes, ...builtInTypes].sort());
      check('cross-row', 'and the types the registry holds, read from the DOCUMENT`s own bytes plus the classes the code supplies, are the ones the driver was handed — two readings of one registry',
        [...WORKER_LISTS.types, ...WORKER_LISTS.classTypes].sort(), registryTypes);
      // **No third clause for *the built-ins are stored in no registry*, because the two above already
      // say it**: a stored built-in would be in `registryTypes` and in neither `namedTypes` nor the
      // document's own lists, so BOTH go red. A clause entailed by its neighbours is a fourth claim
      // (`doc/workflow.md` v0.21's test), and L6's counts are W110's to move.
      const reported = [...new Set(reports.flatMap((r) => r.schedulerPools))].sort();
      // **One per TYPE plus one per NAMED instance, both ways — W67.** Until this item every pool
      // was a type's DEFAULT instance and the two lists were the same list; `prompt-big` is the
      // first named instance this rung has ever built, so the expected set is the types UNION the
      // document's `pools` keys, and a named instance nobody declared — or a declared one no pool
      // was built for — is red here. Both halves are read from the document's own bytes.
      check('cross-row', 'and the pools the scheduler REPORTS are exactly one per type PLUS one per named instance PLUS one per built-in, both ways — ' +
        'the runtime builds every type`s default under the type`s name, every `pools` entry under its own, and the library`s own types last',
        reported, [...WORKER_LISTS.types, ...WORKER_LISTS.classTypes, ...WORKER_LISTS.namedPools, ...builtInTypes].sort());
      assertThat('cross-row', 'and at least one NAMED instance exists — the control, because a document with no `pools` section makes the clause above a restatement of the one before it',
        WORKER_LISTS.namedPools.length > 0, 'the document declares no named pool instance');
      // **The discriminating PAIR is a claim** (rule 8's fourth requirement on the set): the two
      // typed nodes of `typed.flow.json` differ in BOTH settings keys, read from the DEFINITION
      // rather than from two literals in a row. Made equal, this is red before any worker runs.
      // *(Selected by `type !== undefined` until W65; every task node is typed now, so the pair is
      // the two nodes that carry `settings` — still the two `Scorer` nodes, and the length is asserted.)*
      const pair = TY.nodes.filter((n) => (n as unknown as { settings?: unknown }).settings !== undefined)
        .map((n) => (n as unknown as { settings: { factor: number; failFirst: boolean } }).settings);
      assertThat('cross-row', 'the two settings of the typed pair DIFFER in both keys — whatever makes a discriminating pair differ is itself a claim',
        pair.length === 2 && pair[0]!.factor !== pair[1]!.factor && pair[0]!.failFirst !== pair[1]!.failFirst,
        `settings: ${JSON.stringify(pair)}`);
      // **The retry ran under the TYPE's policy and not the node's**: every row declaring a
      // non-zero `attempts` names a node that either declares its OWN `retryPolicy` (W58's `flaky`)
      // or declares none and names a TYPE that does (W59's `high`, W63's two) — so the budget the
      // second kind spent came from `NODE_TYPES`, which is what those rows are for, and a node that
      // quietly gained its own policy would pass the per-row number and fail here. *(Until W65 this
      // filtered on `type !== undefined`; every task node is typed now, so the discriminator is
      // whether the NODE declares a policy, and both kinds must occur or the clause is vacuous.)*
      const retries = EXPECTED.flatMap((e) => Object.keys(e.attempts ?? {}).map((id) => {
        const node = e.definition.nodes.find((n) => n.id === id.split(':')[1]) as unknown as { type: string; retryPolicy?: unknown } | undefined;
        return { id, type: node?.type ?? null, ownPolicy: node?.retryPolicy !== undefined, typePolicy: node !== undefined && (REGISTRY_DOCUMENT.nodeTypes ?? {})[node.type]?.retryPolicy !== undefined };
      }));
      assertThat('cross-row', 'every task that retried under a policy the NODE does not declare names a TYPE that declares one — the type`s budget — and there is at least one',
        retries.some((x) => !x.ownPolicy) && retries.filter((x) => !x.ownPolicy).every((x) => x.typePolicy),
        `retries: ${JSON.stringify(retries)}`);
      assertThat('cross-row', 'and at least one task retried under a policy of its OWN — the other half of the pair, so the clause above is not every retry there is',
        retries.some((x) => x.ownPolicy), `retries: ${JSON.stringify(retries)}`);
      // **The three map instances' inputs DIFFER, read from the run** — the adequacy reader: the
      // typed-regions row's *its own item, three confidences, three scores* rested on `THREE_WORDS`
      // and three literals nothing compared. Read off the settled results rather than the row.
      const rankInputs = reports.flatMap((r) => Object.entries(r.state.nodes)
        .filter(([id]) => /:rank:1\.\d+:0$/.test(id))
        .map(([, n]) => (n.result as { confidence?: number } | undefined)?.confidence));
      assertThat('cross-row', 'the typed map instances received three DIFFERENT inputs — their confidences pairwise distinct, read from the run, so "its own item" is not three copies of one',
        rankInputs.length === 3 && new Set(rankInputs).size === 3, `rank inputs: ${JSON.stringify(rankInputs)}`);
    }
    // (2c) **The sub-path is EXPORTED, in both manifests, and nothing else reads that** — obligation
    //     (e)'s second question asked of the DECLARATION a consumer resolves `fyflow-orchestration/
    //     scheduler` through. `check-docs` REWRITES the specifier to the source entry before it
    //     typechecks `AGENTS.md`'s snippet, `S6` reads the allowlist and not `exports`, and the JSR
    //     dry run is not in the gate (Q252) — so an `exports` entry deleted from either manifest
    //     was green everywhere until this clause (measured at W59's rule 8 pass). Read from the two
    //     files rather than restated: the Deno entry must name the sub-path's source entry and that
    //     entry must be in the publish allowlist (the dry run refuses an exported-but-excluded
    //     module, measured); the npm entry must carry the same four conditions `.` carries.
    {
      const denoJson = JSON.parse(await readManifest('../deno.json')) as { exports: Record<string, string>; publish: { exclude: string[] } };
      const pkgJson = JSON.parse(await readManifest('../package.json')) as { exports: Record<string, Record<string, unknown>> };
      check('cross-row', 'deno.json exports the sub-path `./scheduler` at the source entry `l6.ts` reaches it by, and that entry is in the publish allowlist',
        { target: denoJson.exports['./scheduler'], allowed: denoJson.publish.exclude.includes('!src/scheduler/index.ts') },
        { target: './src/scheduler/index.ts', allowed: true });
      check('cross-row', 'and package.json exports `./scheduler` under exactly the conditions `.` carries, both ways',
        Object.keys(pkgJson.exports['./scheduler'] ?? {}).sort(), Object.keys(pkgJson.exports['.'] ?? {}).sort());
      assertThat('cross-row', 'and every npm condition of the sub-path points under a `scheduler/` directory of its own build — a copy of `.`\'s paths is red',
        Object.entries(pkgJson.exports['./scheduler'] ?? {}).every(([, v]) =>
          (typeof v === 'string' ? [v] : Object.values(v as Record<string, string>)).every((p) => /\/scheduler\/index\.(js|d\.ts)$/.test(p))),
        JSON.stringify(pkgJson.exports['./scheduler']));
    }
    // (2d) **W63 — P17's exit artifact stated ACROSS its rows, which is where Q263 lives.** A single
    //     row can say what its successor received; only the three together can say the value
    //     CHANGED with the arity and stayed a number — and only a pair of runs can say a pool
    //     loads an engine because the FLOW says so.
    {
      // **Q263 as three rows, read from the RUN**: the value `total`'s worker received on every
      // `transformed` row, off the settled results rather than off the rows' literals — three
      // arities, three DIFFERENT values, every one a number (the array form; `$sum(*.score)` over
      // `{}` would have been `undefined`, and the arity-one row's a scalar the sum would still add).
      const totals = reports.flatMap((r) => Object.entries(r.state.nodes)
        .filter(([id]) => /:total:-:0$/.test(id))
        .map(([, n]) => (n.result as { input?: unknown; inputType?: string } | undefined)));
      assertThat('cross-row', 'Q263 as three rows: the join`s successor received three DIFFERENT values at three arities, every one a NUMBER, read from the run',
        totals.length === 3 && new Set(totals.map((t) => JSON.stringify(t?.input))).size === 3 && totals.every((t) => t?.inputType === 'number' && typeof t?.input === 'number'),
        `totals: ${JSON.stringify(totals.map((t) => t?.input))}`);
      // **The arity-one and arity-two rows are a PAIR, and whatever makes them differ is asserted**
      // (rule 8's fourth requirement on the set): the two runs differ in how many branches ARRIVED
      // at `collect`, read from the folded run — two against one — and their totals differ. Both
      // halves, so making the two payloads equal is red here before any literal is compared.
      const byTotal = (n: number) => reports.find((r) => Object.entries(r.state.nodes).some(([id, x]) => /:total:-:0$/.test(id) && (x.result as { input?: unknown })?.input === n));
      const two = byTotal(990); const one = byTotal(400);
      const arrivedAt = (r: RunReport | undefined) =>
        Object.values(r === undefined ? {} : soleRegion(r.state, 'split')?.settled ?? {})
          .filter((s) => s === 'arrived').length;
      assertThat('cross-row', 'the arity-one and arity-two rows are a PAIR: two arrivals against one at the join, read from the run, and two different totals',
        two !== undefined && one !== undefined && two !== one && arrivedAt(two) === 2 && arrivedAt(one) === 1,
        `arrived: ${arrivedAt(two)} / ${arrivedAt(one)}`);
      // **A pool loads an engine because the FLOW says so** (ADR 0051 rule 4): the SAME type,
      // `Scorer`, carries `jsonata` in every run of the flow whose scorers transform and in NO other
      // run — including `transform-fails`, where a `Scorer` node runs without a transform beside
      // two `Echo` nodes that do. The per-row clause says each run's pools match its flow; this says
      // the two answers for one type were both observed, so the clause was not vacuous everywhere.
      const scorerPools = reports.map((r) => [r.flowId, r.poolLanguages['Scorer'] ?? []] as const);
      const loaded = scorerPools.filter(([, ls]) => ls.includes('jsonata')).map(([f]) => f);
      const bare = scorerPools.filter(([, ls]) => ls.length === 0).map(([f]) => f);
      assertThat('cross-row', 'the SAME type carries the engine in exactly the runs whose flow transforms on it — Scorer`s pool loads jsonata on every `transformed` run and on no other, `transform-fails` included',
        loaded.length === 3 && loaded.every((f) => f === TX.flowId) && bare.includes(TF.flowId) && bare.includes(TY.flowId) && loaded.length + bare.length === reports.length,
        `loaded in: ${JSON.stringify([...new Set(loaded)])}; bare in ${bare.length} runs`);
      // **Obligation (e) on `Registry.languages`, both ways**: every language a flow document NAMES in
      // a `transform.lang` is one the harness registered, and every registered language is named by
      // some flow this file runs — a language registered and used by nothing is red here, as a type
      // or a group is above. `FD-V35` refuses the first direction at construction; this is the rung
      // that says the registry the driver checked is the one the helper wrote the pools from.
      const namedLangs = [...new Set(EXPECTED.flatMap((e) => e.definition.nodes.flatMap((n) => {
        const l = (n as unknown as { transform?: { lang?: string } }).transform?.lang;
        return typeof l === 'string' ? [l] : [];
      })))].sort();
      check('cross-row', 'the languages the L6 flows NAME are the languages the harness registered, both ways — FD-V35`s registry set, and the other direction',
        namedLangs, Object.keys(LANGUAGES).sort());
      // **The helper's own reading of a definition agrees with this file's, on every L6 definition** —
      // two derivations of one document, so the function the pools were BUILT from cannot read a
      // different set of transforming types than the per-row clause derives without it.
      const disagreeing = EXPECTED.filter((e) => JSON.stringify(
        Object.fromEntries([...transformLanguagesByType([e.definition])].sort(([a], [b]) => a.localeCompare(b)).map(([t, ls]) => [t, [...ls].sort()])),
      ) !== JSON.stringify(transformingTypesOf(e.definition))).map((e) => e.key);
      check('cross-row', 'the helper`s reading of every L6 definition agrees with this file`s own derivation of which types transform in which languages',
        disagreeing, []);
      // **The plain-values clause was asked of an ARRAY the engine built, at least once** — otherwise
      // `markedKeys: []` on every `Echo` result is a claim about inputs that carry no array. Read from
      // the settled results: some echoed `input` holds an array at some depth.
      const holdsArray = (v: unknown): boolean => Array.isArray(v) || (typeof v === 'object' && v !== null && Object.values(v).some(holdsArray));
      const echoedArrays = reports.flatMap((r) => Object.values(r.state.nodes))
        .filter((n) => (n.result as { markedKeys?: unknown } | undefined)?.markedKeys !== undefined)
        .filter((n) => holdsArray((n.result as { input?: unknown }).input)).length;
      assertThat('cross-row', 'ADR 0052 rule 6 was asked of at least one array the ENGINE built — an echoed input holding an array at some depth, so `markedKeys: []` is not vacuous',
        echoedArrays > 0, `echo results whose input holds an array: ${echoedArrays}`);
      // **The failure road is bound the way `attempts` is**: an outcome record whose error says
      // `transform failed` occurs in exactly the rows that declare `taskErrors`, both ways — a
      // transform that failed on a row that did not expect it is red here, and the set is not empty.
      const rowsFailing = EXPECTED
        .filter((_, i) => reports[i]!.log.some((r) => r.kind === 'outcome' && typeof r.error === 'string' && r.error.includes('transform failed')))
        .map((e) => e.key).sort();
      // **A row may declare `taskErrors` for an error that is NOT a transform's** — W133's threaded `uncloneable` row
      // declares the scheduler's clone error — so the declared side is the rows whose substrings say `transform failed`.
      const rowsDeclaringErrors = EXPECTED
        .filter((e) => Object.values(e.taskErrors ?? {}).some((subs) => subs.some((x) => x.includes('transform failed'))))
        .map((e) => e.key).sort();
      check('cross-row', 'a `transform failed` error occurs in exactly the rows that declare one in taskErrors, both ways',
        rowsFailing, rowsDeclaringErrors);
      assertThat('cross-row', 'and that set is not empty — a transform really failed somewhere', rowsDeclaringErrors.length > 0, 'no row declares taskErrors');
      // **`FD-R4` occurs in exactly the rows that declare it, both ways, and each set is not empty** — W73,
      // v0.18's membership clause: the two claims AND their two controls, each a subject below.
      const rowsRefusedAtStart = EXPECTED.filter((_, i) => reports[i]!.startRefusal !== undefined).map((e) => e.key).sort();
      const rowsDeclaringStart = EXPECTED.filter((e) => e.refuseAtStart !== undefined).map((e) => e.key).sort();
      check('cross-row', 'FD-R4 refused a START on exactly the rows that declare refuseAtStart, both ways', rowsRefusedAtStart, rowsDeclaringStart);
      assertThat('cross-row', 'and at least one row declares a refused start — a payload really was refused somewhere', rowsDeclaringStart.length > 0, 'no row declares refuseAtStart');
      const rowsRefusedResolve = EXPECTED.filter((_, i) => reports[i]!.refusedResolutions.length > 0).map((e) => e.key).sort();
      const rowsDeclaringResolve = EXPECTED.filter((e) => refusedFirstCount(e) > 0).map((e) => e.key).sort();
      check('cross-row', 'FD-R4 refused a RESOLUTION on exactly the rows that declare refusedFirst, both ways', rowsRefusedResolve, rowsDeclaringResolve);
      assertThat('cross-row', 'and at least one row declares a refused resolution — a person`s value really was refused somewhere', rowsDeclaringResolve.length > 0, 'no row declares refusedFirst');
      // **The wiring check over the RUNTIME's registry, on every row** — W73. Decision 14's object carries the
      // class-form `GpuModel`, so triage's arcs get verdicts here that the document alone cannot give (the L1
      // census reads three unchecked there); and the one `no` the corpus holds is `map-no-array`'s `FD-R2`,
      // predicted before the run that this file then measures as `UnresolvedMapArity`.
      // **The three TV rows carried a FALSE `no` at the per-series task from W94 until W99** ([Q391](../doc/questions/q391.md)),
      // because `checkWiring` read a gate as a flat PASS-THROUGH: the arc `identify` → `setupSeries` was judged as if the
      // gate were not there, `series` is not required of what `identify` returns (a trailer has none) and IS required of
      // what the per-series worker receives. W94 asserted that `no` rather than hiding it and wrote the condition for its
      // own inversion here: *the day the check learns a route's guarantee, this clause is red and names the rows.*
      // **[ADR 0068](../doc/decisions/0068-a-route-guarantees-what-its-type-declares-and-the-library-derives-it-from-the-key-path.md)
      // is that day** — `distinct` declares `first` and `duplicate` key-resolved, so what leaves the gate on the route the
      // per-series task sits on carries `series` REQUIRED, and the arc FITS. The clause below is the inversion, and the
      // one beside it is why the inversion is not a DELETION: a gate row that merely stopped appearing in this list
      // would read identically with the derivation removed and the worker's `inputSchema` weakened, so the arc is
      // asserted FITTING at the consumer the row itself names.
      const rowsWithNo = EXPECTED.flatMap((e, i) => reports[i]!.wiring.counts.no > 0
        ? [e.gate ? `${e.key} at ${reports[i]!.wiring.verdicts.filter((v) => v.kind === 'no').map((v) => v.consumer).join(' ')}` : e.key]
        : []).sort();
      check('cross-row', 'the wiring check over the runtime`s registry reads `no` on exactly the FD-R2 row, both ways — the static prediction of the refusal the row then runs — ' +
        'and on NOTHING else: the three rows through a gate read `no` at the per-series task until W99, a FALSE one (Q391), and ADR 0068 is what removed it',
        rowsWithNo, ['map / FD-R2 — over names no array']);
      // **The inversion, asserted rather than left as an absence** (W99): on every gate row, the arc the false `no` sat
      // on FITS, at the consumer that row's own `gate.opens` names — so the claim is about the verdict and not about
      // a row having dropped out of a list.
      const gateArcs = EXPECTED.flatMap((e, i) => e.gate === undefined ? [] : reports[i]!.wiring.verdicts
        .filter((v) => v.consumer === e.gate!.opens).map((v) => `${e.key}: ${v.producer} → ${v.consumer} ${v.kind}`)).sort();
      // Its subject is in `CROSS_ROW_SUBJECTS` (W99's adequacy reader, F4: it was held by the COUNT alone, so the
      // whole clause was deletable to green in three integer edits and four count copies, and not one failure
      // on the way named what had left — v0.14's *a count is not a membership*, in the file whose own header
      // records that finding at its fifth iteration).
      check('cross-row', 'and the arc that WAS that false `no` FITS on every gate row — what leaves the gate on a key-resolved route carries the key path required (ADR 0068)',
        gateArcs, EXPECTED.filter((e) => e.gate).map((e) => `${e.key}: identify → ${e.gate!.opens} fits`).sort());
      // **And what makes that pair a DISCRIMINATOR rather than a second reading of `rowsWithNo`** (W99's adequacy
      // reader, F5): the arc FITS is exactly what a WEAKENED consumer gives for free, and it measured the whole
      // set satisfied with the derivation reverted AND `series`' `required` cut to `["name"]` — 0 at every rung.
      // So the consumer's own requirement is asserted here, off the registry document the rows run against: the
      // guarantee is only doing work while the thing it guarantees is the thing the worker demands.
      const perSeriesWorker = EXPECTED.filter((e) => e.gate).map((e) => {
        const node = (TV.nodes as { id: string; type?: string }[]).find((n) => n.id === e.gate!.opens);
        const worker = (REGISTRY_DOCUMENT.nodeTypes ?? {})[node?.type ?? '']?.worker ?? '';
        const schema = (REGISTRY_DOCUMENT.workers as unknown as Record<string, { inputSchema?: { required?: string[] } }>)[worker]?.inputSchema;
        return `${e.key}: ${node?.type} requires ${JSON.stringify((schema?.required ?? []).slice().sort())}`;
      }).sort();
      check('cross-row', 'and the per-series worker REQUIRES what that route guarantees — the arc above FITS for free if the consumer stops asking (ADR 0068`s cost, and its adequacy reader`s F5)',
        perSeriesWorker, EXPECTED.filter((e) => e.gate).map((e) => `${e.key}: SeriesSetup requires ["name","series"]`).sort());
      const triageUnchecked = EXPECTED.map((e, i) => [e.key, reports[i]!.wiring.counts.unchecked] as const).filter(([k]) => k.startsWith('triage')).map(([k, n]) => `${k}: ${n}`);
      check('cross-row', 'and on the two triage rows the CLASS type is resolved — no arc is unchecked over the runtime`s registry, where the document alone leaves three', triageUnchecked,
        EXPECTED.filter((e) => e.key.startsWith('triage')).map((e) => `${e.key}: 0`));
      assertThat('cross-row', 'and every row`s flow has at least one arc — the wiring reports are not empty', reports.every((r) => r.wiring.verdicts.length > 0 || r.flowId === 'uncloneable'), 'a row with no verdicts');
      // **The reshaping road is REMOVED, not forbidden** — the item's own `Tests:` line, asked of the
      // package's own validator rather than stated: `transformed` with a reshaping `task` node put
      // back between its join and the transformed successor still validates with ZERO findings
      // against the registry every row runs under. And the detector's positive fixture beside it, so
      // a validator that accepted everything could not satisfy the first: the SAME document with a
      // malformed transform on the relay node is refused, by exactly `FD-V37` at that node.
      {
        const relay = { id: 'relay', kind: 'task', type: 'PublishWorker', edges: [{ to: 'total' }] };
        const withRelay = (transformOnRelay: boolean) => ({
          ...TX,
          nodes: (TX.nodes as unknown as Record<string, unknown>[]).flatMap((n) => n.id === 'collect'
            ? [{ ...n, edges: [{ to: 'relay' }] }, transformOnRelay ? { ...relay, transform: { lang: 'jsonata' } } : relay]
            : [n]),
        }) as unknown as FlowDefinition;
        const registry = {
          predicates: [...predicates.keys()], groups: reports[0]!.schedulerGroups,
          workers: REGISTRY_DOCUMENT.workers, nodeTypes: REGISTRY_DOCUMENT.nodeTypes, languages: LANGUAGES,
        };
        const findings = (d: FlowDefinition) => validateDefinition(d, registry).map((f) => `${f.rule}@${f.at}`).sort();
        check('cross-row', 'the reshaping road is removed and not FORBIDDEN: `transformed` with a reshaping task node put back between its join and the transformed successor validates with zero findings',
          findings(withRelay(false)), []);
        // *(Until W65 the positive fixture was a well-formed transform on a BARE relay — v0.18's `FD-V37`
        // untyped clause. Every node is typed now and may transform, so the fixture is a MALFORMED one.)*
        check('cross-row', 'and the validator SAW that document: the same one with a malformed transform on the relay node is refused by FD-V37 at that node, and by nothing else',
          findings(withRelay(true)), ['FD-V37@relay']);
      }
    }
    // (2e) **W67 — P18's exit artifact, as four claims about the whole rung rather than about a row.**
    //
    //     A row says what one run did; these say what the DOCUMENTS are. Each is paired with the
    //     control that makes it non-vacuous, because a membership over claims binds the vacuity of
    //     nothing (`doc/workflow.md` v0.18, obligation (d)) — and the controls are members of
    //     `CROSS_ROW_SUBJECTS` beside the claims, which is what that clause asks for.
    {
      // **(i) Every row runs the DOCUMENT.** `registryDocumentFor` is the one thing this harness
      // does to `examples/registry.json`, and what it may change is bounded here rather than
      // described: the two variants differ from the file in `inline` on exactly `THREADABLE_TYPES`
      // and in nothing else — not a worker, not a group, not a pool, not a predicate, not a
      // language, and not another field of another type. Computed as a DIFF, so a derivation that
      // quietly rewrote a config or dropped a group is red naming the key.
      const onDisk = JSON.parse(JSON.stringify(REGISTRY_DOCUMENT)) as Record<string, unknown>;
      const diffKeys = (v: boolean): string[] => {
        const got = JSON.parse(JSON.stringify(registryDocumentFor(v))) as Record<string, unknown>;
        const out: string[] = [];
        for (const k of new Set([...Object.keys(onDisk), ...Object.keys(got)])) {
          if (k !== 'nodeTypes') {
            if (JSON.stringify(got[k]) !== JSON.stringify(onDisk[k])) out.push(k);
            continue;
          }
          const a = (onDisk.nodeTypes ?? {}) as Record<string, Record<string, unknown>>;
          const b = (got.nodeTypes ?? {}) as Record<string, Record<string, unknown>>;
          for (const t of new Set([...Object.keys(a), ...Object.keys(b)])) {
            for (const f of new Set([...Object.keys(a[t] ?? {}), ...Object.keys(b[t] ?? {})])) {
              if (JSON.stringify(a[t]?.[f]) !== JSON.stringify(b[t]?.[f])) out.push(`nodeTypes.${t}.${f}`);
            }
          }
        }
        return out.sort();
      };
      // **`THREADABLE_TYPES` is compared to a literal, both ways** — W67's adequacy reader (a2),
      // BLOCKING: the diff clause computed its expected side FROM `THREADABLE_TYPES` and its actual
      // side from a derivation that also reads it, so both moved together and dropping a member cost
      // ZERO. `run-flow.ts`'s own header claimed this comparison existed; it did not. The literal is
      // the four types `examples/registry.json` deliberately leaves `inline` unsaid on — `Identify` the third since W94, and
      // `MergeWorker` the fourth since W133, so the `uncloneable` flow can be run on a thread pool (`OR-R6` v0.11).
      check('cross-row', 'the types whose `inline` the document leaves UNSAID are exactly the four this file expects, both ways — ' +
        'the knob`s membership, where the diff clause below computes both of its sides from it',
        [...THREADABLE_TYPES].sort(), ['Identify', 'MergeWorker', 'ScoreWorker', 'WeighWorker']);
      const wantThreaded = THREADABLE_TYPES.map((t) => `nodeTypes.${t}.inline`).sort();
      // **The VALUE as well as the key set** — rule 8's `p4`: a derivation that wrote `inline: true`
      // whatever the row asked passed the diff clause, because the key it differs in is the same key
      // either way. So the knob's SETTING is asserted beside its BOUND, and a `registryDocumentFor`
      // that stopped reading `threaded` is red here where L6 is otherwise blind to it (Q99).
      const inlineAt = (v: boolean): boolean[] =>
        THREADABLE_TYPES.map((t) => (registryDocumentFor(v).nodeTypes ?? {})[t]?.inline === true);
      check('cross-row', 'the document a row RUNS differs from the document ON DISK in exactly `inline`, on exactly the types that declare none — ' +
        'at both settings of the one knob that has no document spelling, in no other key of no other section, and in the DIRECTION the row asked for',
        { inline: diffKeys(false), threaded: diffKeys(true), inlineValues: inlineAt(false), threadedValues: inlineAt(true) },
        { inline: wantThreaded, threaded: wantThreaded,
          inlineValues: THREADABLE_TYPES.map(() => true), threadedValues: THREADABLE_TYPES.map(() => false) });

      // **(ii) The sample runs from two DOCUMENTS and a shim.** The flow's every task node names a
      // type the registry document or the shim's classes declare, and every pool it names is a
      // named instance the document declares — so nothing about `triage` is wired in TypeScript.
      const triageTypes = [...new Set(TRI.nodes.filter((n) => n.kind === 'task')
        .map((n) => (n as unknown as { type: string }).type))].sort();
      const triagePools = [...new Set(TRI.nodes.filter((n) => (n as unknown as { pool?: string }).pool !== undefined)
        .map((n) => (n as unknown as { pool: string }).pool))].sort();
      check('cross-row', 'the sample flow runs from two DOCUMENTS: every type it names is one the registry declares, ' +
        'and every pool it names is a named instance the registry declares',
        { unknownTypes: triageTypes.filter((t) => !reports[0]!.registryTypes.includes(t)), pools: triagePools },
        { unknownTypes: [], pools: WORKER_LISTS.namedPools });

      // **(iii) A DOCUMENT type and a CLASS type over ONE worker, and their derivations DIFFER.**
      // `Prompt` is declared in `examples/registry.json` and `GpuModel` is a class the shim
      // registers; both name the `prompt` worker, so the pools they built differ in nothing but the
      // DERIVATION. The control is the second half: made to return the same options, this is red.
      // **Guarded, because an unguarded lookup CRASHES where it should FAIL.** With a `triage` row
      // repointed at another document the index is -1, `reports[-1]` is `undefined`, and the block
      // took the file down with exit 1 and no failure line — this item's own rule 8 re-run (`e3`),
      // and W59's *a crash is not a detection* in the block added after it.
      const lowIndex = EXPECTED.findIndex((e) => e.definition === TRI && e.payload === TRIAGE_LOW);
      assertThat('cross-row', 'a row runs the SAMPLE flow at the LOW payload, so this block has something to read — ' +
        'a row repointed at another document is a failure naming itself rather than an undefined dereference',
        lowIndex >= 0 && reports[lowIndex] !== undefined,
        `EXPECTED holds no row with definition=triage and payload=TRIAGE_LOW (findIndex ${lowIndex})`);
      const low = reports[lowIndex] ?? reports[0]!;
      const promptPool = low.derivedPools.Prompt!;
      const gpuDefault = low.derivedPools.GpuModel!;
      const gpuNamed = low.derivedPools['prompt-big']!;
      // **Read off the CLASS's own `worker` member, not a ternary on its name** — W67's adequacy
      // reader (a14b): with `GpuModel.worker` repointed at a schema-less worker the clause stayed
      // green, because the literal `'prompt'` said what the class no longer did.
      const CODE_TYPES = codeFor(PREDICATES).nodeTypes ?? {};
      const workerOf = (t: string): string | undefined =>
        (REGISTRY_DOCUMENT.nodeTypes ?? {})[t]?.worker ?? CODE_TYPES[t]?.worker;
      check('cross-row', 'a DOCUMENT type and a CLASS type over ONE worker: `Prompt` and `GpuModel` name the same worker entry, ' +
        'so the pools they built differ in their DERIVATION and in nothing else — and one is INLINE where the other is a real thread, ' +
        'which a derived PoolSpec cannot say and only the built pool can',
        { workers: [workerOf('Prompt'), workerOf('GpuModel')], inline: [promptPool.inline, gpuDefault.inline] },
        { workers: ['prompt', 'prompt'], inline: [true, false] });
      // **And the pools these were read off are the SCHEDULER's**, which is what `scriptUrl` says and
      // a derived `PoolSpec` cannot: every pool a runtime builds is fronted by the package's envelope
      // worker (ADR 0054), so the script a `WorkerManager` loads is never the type's own worker url.
      // W67's adequacy reader (a10): re-sourcing this whole map from the document and the class cost
      // ZERO, because the identity derivation COPIES `inline` and the class DECLARES it.
      check('cross-row', 'and the pools those readings came from are the SCHEDULER`s own WorkerManagers — every one loads the ' +
        'package`s envelope worker, which is the one field a derived PoolSpec cannot carry',
        Object.values(low.derivedPools).map((d) => d.scriptUrl.endsWith('/envelope-worker.ts')),
        Object.values(low.derivedPools).map(() => true));
      assertThat('cross-row', 'and the two derivations DIFFER — the identity derivation copies the declared fields where the class COMPUTES them, ' +
        'so a class made to return the document type`s options is red here',
        promptPool.maxThreads !== gpuDefault.maxThreads
          && JSON.stringify(promptPool.groups) !== JSON.stringify(gpuDefault.groups)
          && promptPool.residentGroups.length === 0 && gpuDefault.residentGroups.length > 0,
        `Prompt: ${JSON.stringify(promptPool)} / GpuModel: ${JSON.stringify(gpuDefault)}`);

      // **(iv) The DEFAULT instance and the NAMED instance of ONE type.** `GpuModel`'s default is
      // built from the class's own `config` member and `prompt-big` from the document's `pools`
      // entry, and the CLASS computes both pools from `config.model` — so the two differ in the
      // thread count and in the resident cost. The control is that both actually RAN in one row:
      // without it the clause is a claim about two objects nothing dispatched to.
      check('cross-row', 'the DEFAULT instance and the NAMED instance of one type were derived DIFFERENTLY, ' +
        'by the class, from their own configs — four threads against one, one unit of resident VRAM against two',
        { def: gpuDefault.maxThreads, named: gpuNamed.maxThreads, defRes: gpuDefault.residentGroups, namedRes: gpuNamed.residentGroups },
        { def: 4, named: 1, defRes: ['gpu:1'], namedRes: ['gpu:2'] });
      assertThat('cross-row', 'and both GpuModel instances RAN in one row — a task on the default and a task on the named one, ' +
        'read off the scheduler, so the pair is about a run rather than about two objects',
        Object.values(low.poolOfTask).includes('GpuModel') && Object.values(low.poolOfTask).includes('prompt-big'),
        `poolOfTask: ${JSON.stringify(low.poolOfTask)}`);

      // **(iv-b) `poolOfTask` is the SCHEDULER's map and not a re-reading of the definition** —
      // W67's adequacy reader (a4), BLOCKING: re-deriving it as `node.pool ?? node.type` over the
      // flow's own nodes — the expression the field's note NAMES — cost ZERO, so Outputs (2)'s
      // stated provenance was falsifiable for nothing, and the control that makes the pair about a
      // RUN was satisfied by re-reading the document. The discriminator is already in this file and
      // could not be derived from any definition: W19's pair rows put FIVE task ids on the shared
      // scheduler that no flow declares, and the scheduler's task map holds them.
      {
        const foreign = UNMINTED.map((u) => u.id).sort();
        const pairPools = pairResults[1]!.runs[0]![1].poolOfTask;
        // **The POOL each foreign id ran on, not merely that the key is there** — this item's own rule
        // 8 re-run (`ra4`): the reader's edit still ITERATES `scheduler.tasks`, so every key was
        // present and mapped to `'(none)'`, and a membership test passed. The value is what only the
        // scheduler holds: a task this library did not mint has no node in any document.
        check('cross-row', 'the pool map is read off the SCHEDULER`s own task map: on the pair row that injects them it holds the five ' +
          'task ids this library did not mint AND the pool each ran on, which no reading of a flow document could produce',
          Object.fromEntries(foreign.map((id) => [id, pairPools[id] ?? '(absent)'])),
          Object.fromEntries(UNMINTED.map((u) => [u.id, u.worker ?? 'IngestWorker']).sort(([a], [b]) => a.localeCompare(b))));
      }

      // **(v) A group is resolved by its KEY and the object's own name is inert** — ADR 0049 fact 2,
      // and W59's adequacy reader found every fixture in the tree had the two equal. The built-in
      // factories pass the document's key as the id, correctly, so the only place a consumer can
      // still get this wrong is a CUSTOM factory — and the shim's names its object
      // `budget-by-object-name` on purpose. The control is that the group was actually ACQUIRED.
      const budgetHolders = Object.entries(low.heldGroups).filter(([, gs]) => gs.includes('budget')).map(([id]) => id).sort();
      // **And the object really IS named something else** — W67's adequacy reader (a1), BLOCKING:
      // the clause below rested entirely on a string inside the shim's factory, and making the two
      // equal cost ZERO. That is W59's own finding (*every fixture in the tree had the two equal*)
      // reproduced inside the fixture built to correct it, and v0.13's *whatever makes a
      // discriminating pair differ is itself a claim*. The two BUILT-IN groups are the other half of
      // the pair: `createRuntime`'s own factories pass the document's key as the id, correctly, so
      // they must agree where the custom one must not.
      check('cross-row', 'the custom group`s object NAMES ITSELF something other than its key, and every built-in one does not — ' +
        'the pair the clause below turns on, read off the objects the runtime created',
        { custom: low.groupObjectIds.budget, builtIn: [low.groupObjectIds.gate, low.groupObjectIds.scorer, low.groupObjectIds.vendor] },
        { custom: 'budget-by-object-name', builtIn: ['gate', 'scorer', 'vendor'] });
      check('cross-row', 'the scheduler resolved a group by its KEY and not by the object`s own name: the custom group type names its object ' +
        '`budget-by-object-name` and every acquisition reports `budget`',
        [...new Set(Object.values(low.heldGroups).flat())].sort(), ['budget', 'vendor']);
      assertThat('cross-row', 'and the custom group was ACQUIRED by real tasks — a group type registered in code, created by its own factory, ' +
        'holding tasks on a real scheduler',
        budgetHolders.length > 0, 'no task acquired the custom group');

      // **(vi) A worker`s `settingsSchema` REFUSES, and the case had to be constructed** — P18
      // decision 3's *a schema that requires a key refuses absence*, and rule 8's requirement that a
      // provocation is evidence only when it FIRES. The `prompt` worker requires `prompt`, and every
      // node of every Prompt-worker type in the sample declares one — so widening the schema cost
      // ZERO (`a10`, an undeclared survivor of this item's author pass): a guard with no live case,
      // exactly what `doc/workflow.md` v0.10 says to construct rather than argue. The fixture is the
      // sample flow with ONE node's `settings` emptied, validated against the registry the RUN was
      // built from, and its control is the same document unedited.
      {
        const registryForSample = {
          predicates: [...predicates.keys()],
          groups: reports[0]!.schedulerGroups,
          workers: REGISTRY_DOCUMENT.workers,
          // The CLASS type is in no document, so the validator is handed the union the driver got —
          // a document-form stand-in for it whose worker is the one the class names.
          nodeTypes: { ...REGISTRY_DOCUMENT.nodeTypes, GpuModel: { worker: 'prompt' } },
          pools: REGISTRY_DOCUMENT.pools,
          languages: LANGUAGES,
        };
        const sampleFindings = (d: FlowDefinition) =>
          validateDefinition(d, registryForSample as never).map((f) => `${f.rule}@${f.at}`).sort();
        const withoutPrompt = {
          ...TRI,
          nodes: (TRI.nodes as unknown as Record<string, unknown>[])
            .map((n) => (n.id === 'review' ? { ...n, settings: {} } : n)),
        } as unknown as FlowDefinition;
        check('cross-row', 'the sample flow validates against the registry the run was BUILT from, with zero findings — ' +
          'the control, without which the refusal below could be a document nothing accepts',
          sampleFindings(TRI), []);
        check('cross-row', 'and a node whose settings drop the key the WORKER`s settingsSchema requires is refused by FD-V33 at that node, and by nothing else — ' +
          'decision 3`s `a schema that requires a key refuses absence`, on a case the corpus cannot supply',
          sampleFindings(withoutPrompt), ['FD-V33@review']);
        // **And the ABSENT case is a case** — W67's adequacy reader (a13). `fetch` declares no
        // `settingsSchema`, which decision 3 says means UNCHECKED; nothing distinguished that from a
        // permissive one, so ADDING a schema to that entry cost zero. A node of that type carrying
        // settings nothing declares must validate, which is what *absent means unchecked* IS.
        const fetchWithSettings = {
          ...TRI,
          nodes: (TRI.nodes as unknown as Record<string, unknown>[])
            .map((n) => (n.id === 'fetch' ? { ...n, settings: { anything: 1, atAll: 'yes' } } : n)),
        } as unknown as FlowDefinition;
        check('cross-row', 'and a node whose worker entry declares NO settingsSchema takes any settings at all — ' +
          'decision 3`s `an absent schema means UNCHECKED`, which nothing told apart from a permissive one',
          sampleFindings(fetchWithSettings), []);
        // **All four of a worker entry's schemas are CARRIED**, which is the other half of decision
        // 3's enumeration: this plan enforces two and P19 enforces the rest, so *carried* is the
        // whole claim the other two have — and it had no observer (a6).
        // **Compared to a DECLARED list and not to the document** — this item's own rule 8 re-run
        // (`ra6`): sourcing the expected side from `REGISTRY_DOCUMENT` made both halves move with the
        // probe, so deleting the two schemas this plan does not enforce was green again. Decision 3
        // enumerates FOUR and the sample's `prompt` entry is the one place all four occur, so the
        // list is the rule's rather than the document's — v0.17's *where a rule enumerates its own
        // values, the set is that enumeration*.
        // **Since W72 (P19, ADR 0056) EVERY worker declares the two P19 schemas** — an `inputSchema` on all
        // sixteen and an `outputSchema` on the fourteen whose output a JSON Schema can describe (`fail` never
        // returns and `uncloneable` returns a function) — beside the config and settings schemas the four
        // entries that had them keep. The expected side is the RULE's enumeration over every entry rather
        // than a literal for four, because the claim is now about the whole document and a four-entry
        // literal would let ten entries drop a schema for zero; and it is still a LITERAL rather than a
        // read of `REGISTRY_DOCUMENT` (`ra6`), so the probe that deletes a schema moves one side only.
        check('cross-row', 'the runtime CARRIES every schema the twenty-one worker entries declare, exactly: the two P19 schemas on every entry ' +
          '(no outputSchema on the two undescribable workers), plus prompt`s configSchema and the three settingsSchemas — ' +
          'two enforced by the runtime, the other two declared, carried, and checked by `check-workers` on a run',
          Object.fromEntries(Object.entries(reports[0]!.workerSchemas).sort(([a], [b]) => a.localeCompare(b))),
          {
            attest: ['inputSchema', 'outputSchema'],
            // W94: the four workers P24's exit artifact adds — download (its fetch), identify, thumbnail and series. Both P19
            // schemas like every other corpus entry, and no `configSchema`: `identify`'s `msPerMB` is an arrangement, and
            // `check:workers` constructs from `{}` so the conformance run does not pay for it.
            download: ['inputSchema', 'outputSchema'],
            echo: ['inputSchema', 'outputSchema', 'settingsSchema'],
            fail: ['inputSchema'],
            fetch: ['inputSchema', 'outputSchema'],
            // W82: the two workers P21's exit artifact adds. They declare both P19 schemas like
            // every other corpus entry — which is half of why `check:workers` and `checkWiring` are
            // GREEN on them and `OR-R13` is not.
            gauge: ['inputSchema', 'outputSchema'],
            identify: ['inputSchema', 'outputSchema'],
            ingest: ['inputSchema', 'outputSchema'],
            prompt: ['configSchema', 'inputSchema', 'outputSchema', 'settingsSchema'],
            publish: ['inputSchema', 'outputSchema'],
            retry: ['inputSchema', 'outputSchema'],
            score: ['inputSchema', 'outputSchema'],
            series: ['inputSchema', 'outputSchema'],
            // W86: the ONE worker P22 stop-and-ask (c) grants. Both P19 schemas like every other
            // corpus entry, and no `configSchema` — `check:workers` constructs from `{}`, so the
            // conformance run does not pay for the stagger only a real run needs.
            shard: ['inputSchema', 'outputSchema'],
            split: ['inputSchema', 'outputSchema'],
            stamp: ['inputSchema', 'outputSchema'],
            tally: ['inputSchema', 'outputSchema'],
            thumbnail: ['inputSchema', 'outputSchema'],
            typed: ['inputSchema', 'outputSchema', 'settingsSchema'],
            uncloneable: ['inputSchema'],
            weigh: ['inputSchema', 'outputSchema'],
          });
        // **And every schema the corpus declares carries an `examples`** — the library leaves it OPTIONAL
        // (ADR 0056 rule 3, the maintainer's choice) and THIS corpus declares one everywhere, because a
        // declared example is what `check-workers` runs a worker on and the witness exercises less (W72's
        // declaration, fact 3). Read off the document this run was built from, against the enumeration
        // above rather than against the document again: a corpus entry that dropped its example would run
        // green on the witness in `check:workers` and be red here, by name.
        check('cross-row', 'every schema every corpus worker entry declares carries an `examples` — the corpus declares what the library leaves optional, and nothing here runs on a witness',
          Object.fromEntries(Object.entries(REGISTRY_DOCUMENT.workers as unknown as Record<string, Record<string, unknown>>)
            .map(([k, w]) => [k, Object.keys(w).filter((f) => f.endsWith('Schema') && Array.isArray((w[f] as { examples?: unknown }).examples) && ((w[f] as { examples: unknown[] }).examples.length > 0)).sort()] as const)
            .sort(([a], [b]) => a.localeCompare(b))),
          {
            attest: ['inputSchema', 'outputSchema'],
            // W94: the four workers P24's exit artifact adds — download (its fetch), identify, thumbnail and series. Both P19
            // schemas like every other corpus entry, and no `configSchema`: `identify`'s `msPerMB` is an arrangement, and
            // `check:workers` constructs from `{}` so the conformance run does not pay for it.
            download: ['inputSchema', 'outputSchema'],
            echo: ['inputSchema', 'outputSchema', 'settingsSchema'],
            fail: ['inputSchema'],
            fetch: ['inputSchema', 'outputSchema'],
            // W82: the two workers P21's exit artifact adds. They declare both P19 schemas like
            // every other corpus entry — which is half of why `check:workers` and `checkWiring` are
            // GREEN on them and `OR-R13` is not.
            gauge: ['inputSchema', 'outputSchema'],
            identify: ['inputSchema', 'outputSchema'],
            ingest: ['inputSchema', 'outputSchema'],
            prompt: ['configSchema', 'inputSchema', 'outputSchema', 'settingsSchema'],
            publish: ['inputSchema', 'outputSchema'],
            retry: ['inputSchema', 'outputSchema'],
            score: ['inputSchema', 'outputSchema'],
            series: ['inputSchema', 'outputSchema'],
            // W86: the ONE worker P22 stop-and-ask (c) grants. Both P19 schemas like every other
            // corpus entry, and no `configSchema` — `check:workers` constructs from `{}`, so the
            // conformance run does not pay for the stagger only a real run needs.
            shard: ['inputSchema', 'outputSchema'],
            split: ['inputSchema', 'outputSchema'],
            stamp: ['inputSchema', 'outputSchema'],
            tally: ['inputSchema', 'outputSchema'],
            thumbnail: ['inputSchema', 'outputSchema'],
            typed: ['inputSchema', 'outputSchema', 'settingsSchema'],
            uncloneable: ['inputSchema'],
            weigh: ['inputSchema', 'outputSchema'],
          });
      }
    }
    // (3) The resource-event observer is bound the way `attempts` is: a resource event was
    //     reported for exactly the task ids some row declares `resourceEvents` for. Every other
    //     task of every other row produced none, because no other node names a group and no
    //     pool declares one — so the group row's sequence is the ONLY place the scheduler said
    //     anything about a resource, and a pool that quietly gained `groups` would show here.
    //     **Since W59 a row may declare a task's resources under `heldGroups` instead** — the
    //     typed rows, whose tasks hold a POOL group and are never blocked — so the declared side
    //     is the union of both fields, and a typed task that reported no acquisition, or a bare
    //     one that reported any, is red here.
    {
      const seen = reports.flatMap((r) => Object.keys(r.resourceEvents)).sort();
      const declared = [...new Set(EXPECTED.flatMap((e) => [...Object.keys(e.resourceEvents ?? {}), ...Object.keys(e.heldGroups ?? {})]))].sort();
      check('cross-row', 'a resource event was reported for exactly the task ids some row declares, under resourceEvents or heldGroups, both ways',
        seen, declared);
    }
    // (4) Obligation (e)'s third shape on the SCHEDULER's side: `RETRY_POLICY_KEYS` — the two
    //     keys `FD-V30` requires and refuses anything beside — equals the two keys the
    //     scheduler's own published declaration destructures, both ways. Read as SOURCE TEXT
    //     from the npm build's `.d.ts` at the pin, the same way `workerListsAsync` reads the
    //     worker file: a bump that renames or adds a field to `retryPolicy` upstream is red
    //     here before a document could declare it.
    {
      const dtsUrl = new URL('../node_modules/fyflow-scheduler/dist/types/core/FyflowScheduler.d.ts', import.meta.url);
      const deno = (globalThis as Record<string, unknown>).Deno as
        { readTextFile?: (x: URL) => Promise<string> } | undefined;
      const dts = deno?.readTextFile
        ? await deno.readTextFile(dtsUrl)
        : await (await import('node:fs/promises')).readFile(dtsUrl, 'utf8');
      const m = /retryPolicy\?: \{([^}]*)\}/.exec(dts);
      if (!m) throw new Error('the scheduler`s .d.ts no longer declares a `retryPolicy?: { … }` field, so this bound would be vacuous');
      const upstream = [...m[1]!.matchAll(/(\w+): number/g)].map((x) => x[1]!).sort();
      check('cross-row', 'the scheduler`s own declaration of retryPolicy has exactly the keys FD-V30 requires, both ways — ' +
        'read from the published .d.ts at the pin, not from a literal beside RETRY_POLICY_KEYS',
        upstream, [...RETRY_POLICY_KEYS].sort());
    }

    // **Obligation (e)'s SECOND QUESTION, and the reasoning is at
    // `examplesReachingPastIndexAsync` above**: no file under `examples/` may reach
    // past `index.ts` into `src/`, because L6's whole standing is that it exercises
    // the surface a consumer has. **Both halves**, because an empty offender list is
    // also what a sweep that read nothing returns — obligation (e)'s own shape one
    // level in, and the same reason the extractions above throw.
    check('cross-row', 'no file under examples/ reaches past index.ts into src/ — L6 runs the ' +
      'surface a consumer resolves, which is the whole of why it is evidence',
      EXAMPLES_REACH.offenders, []);
    // **The detector FIRES on the shape it refuses, and not on the shape it must
    // not** — the positive case the adequacy reader found missing. Without this the
    // regex is bound to nothing: the tree is clean, so an empty offender list is what
    // a broken matcher returns too.
    check('cross-row', 'and the detector fires on an import that reaches past index.ts, at either ' +
      'depth, and NOT on one that does not — the case the clean tree cannot supply',
      REACH_CASES.map(([text]) => REACHES_PAST_INDEX.test(text)), REACH_CASES.map(([, want]) => want));
    // **What was READ, both ways against what was LISTED** — obligation (e)'s third
    // shape, and the half the first version got wrong: it read the LISTING, so a
    // narrowed read loop skipped `l6.ts` and this clause passed.
    // **Outputs (1), as an assertion** — W67's adequacy reader (a8). Nothing under `examples/` builds
    // a pool, a scheduler, a driver or a built-in group any more: the runtime does, from a document.
    check('cross-row', 'the files under examples/ that CONSTRUCT a pool, a scheduler, a Driver or a built-in resource ' +
      'group are exactly the ones that DECLARE it, and exactly the ones this file NAMES — THREE ways, so an ' +
      'exemption costs an edit here as well as there. P18`s exit artifact is that the library does every ' +
      'instantiation, and W81`s subject is what the one road that declines it costs',
      [[...EXAMPLES_REACH.constructors].sort(), [...EXAMPLES_REACH.declared].sort()],
      [[...CONSTRUCTION_PRICED].sort(), [...CONSTRUCTION_PRICED].sort()]);
    check('cross-row', 'and BOTH detectors fire on the shapes they refuse and NOT on the ones they must not — the four ' +
      'constructors, the consumer`s own classes the shim still builds, and the marker`s own two cases',
      CONSTRUCT_CASES.map(([text]) => [CONSTRUCTS_A_SCHEDULER_OBJECT.test(text), declaresConstruction(text)]),
      CONSTRUCT_CASES.map(([, constructs, declares]) => [constructs, declares]));
    check('cross-row', 'and the sweep OPENED exactly the files it listed, both ways',
      [...EXAMPLES_REACH.read].sort(), [...EXAMPLES_REACH.files].sort());
    assertThat('cross-row', 'and the listing reached both directories, naming the three files this ' +
      'block`s own extractions read',
      ['./l6.ts', './run-flow.ts', './workers/shared.ts', './workers/prompt.ts']
        .every((f) => EXAMPLES_REACH.files.includes(f)),
      `swept ${EXAMPLES_REACH.files.length}: ${EXAMPLES_REACH.files.join(', ')}`);
  }
}

/**
 * **L6 runs a reference across SIBLING regions, at a shared depth of ZERO and of
 * MORE than zero** — W51, and it is P14's subject stated as a bound.
 *
 * **W50 measured that this rung was BLIND to
 * [ADR 0044](../doc/decisions/0044-a-reference-is-visible-when-two-paths-agree-on-the-regions-that-contain-both-of-them.md)**:
 * all eleven aimed references in both corpora had a shared region depth of **zero**
 * AND paths that were prefix-comparable anyway, so `outputIsVisible` returned true
 * without entering its loop for everything L6 ran, and reverting the resolver to the
 * prefix rule cost **0** L6 failures against 6 at L1-L5.
 * [Q214](../doc/questions/q214.md)'s shape in a second mechanism — W47's was *a
 * document the validator refuses never starts*, this is *a filter no run exercises*.
 *
 * **So the bound is over the two DIRECTIONS a wrong predicate can be wrong in**, and
 * one row alone satisfies neither:
 *
 *   - **depth 0** — a reader in a SIBLING region, where the answer is *everything*
 *     and a predicate that filters is too narrow. Reverting the resolver costs 12.
 *   - **depth above 0** — a reader inside the SAME map region as its target, where
 *     the answer is *the index-matched one* and a predicate that does not filter is
 *     too permissive. Making every entry visible costs 2.
 *
 * **Read from the DEFINITIONS through `sharedRegionDepth`**, which is the shipped
 * derivation, rather than from a list of node names beside itself: a flow that stops
 * being a sibling pair moves this clause with it.
 */
{
  const depthsIn = (d: FlowDefinition): number[] => {
    const rs = allRegions(buildGraph(d), d);
    const out: number[] = [];
    for (const n of d.nodes) {
      const needs = (n as unknown as { needs?: Record<string, unknown> }).needs;
      if (!needs) continue;
      for (const v of Object.values(needs)) {
        const raw = Array.isArray(v) ? v[0] : v;
        if (typeof raw !== 'string' || raw === '.') continue;
        out.push(sharedRegionDepth(rs, n.id as string, raw.replace(/\?$/, '')));
      }
    }
    return out;
  };
  const depths = EXPECTED.flatMap((e) => depthsIn(e.definition));
  // **The SET of shared depths, as an EQUALITY rather than two floors** — `S12`'s
  // reason one file across, and rule 8 is what earned it here: written as
  // `filter(d => d === 0).length > 0` and `some(d => d > 0)`, each clause was its
  // OWN ONLY OBSERVER, and relaxing either comparison to `>=` cost **zero**
  // ((c)'s LIMIT — count the observers). An equality over the set cannot be
  // relaxed, fails when a direction LEAVES, and fails loudly and namefully when a
  // depth nobody has thought about ARRIVES.
  check('cross-row', 'L6 runs a reference across SIBLING regions AND one inside a shared region — ' +
    'the two directions ADR 0044 can be got wrong in, and this rung could see NEITHER before W51',
    [...new Set(depths)].sort(), [0, 1]);
  // **A sibling FANOUT pair specifically** — P14 decision 3, and the case neither
  // corpus contained. Read from the region openers rather than from a flow name.
  const siblingFanoutPairs = EXPECTED.filter((e) => {
    const rs = allRegions(buildGraph(e.definition), e.definition);
    if (rs.length < 2) return false;
    if (!rs.every((r) => r.opensWith === 'fanout')) return false;
    return rs.some((a) => rs.some((b) => a !== b &&
      ![...a.members].every((x) => b.members.has(x)) &&
      ![...b.members].every((x) => a.members.has(x))));
  });
  assertThat('cross-row', 'and a sibling FANOUT pair runs here — the shape neither corpus ' +
    'contained, which P14 decision 3 required the evidence to include because the two kinds ' +
    'behave oppositely and a probe set drawn from the corpus cannot see the missing one',
    siblingFanoutPairs.length > 0,
    `rows whose regions are all fanouts and at least one pair siblings: ${siblingFanoutPairs.length}`);
  // **And the KINDS are asserted, not merely filtered on.** Rule 8 graded dropping
  // the `opensWith === 'fanout'` filter a SURVIVOR at 0: three other rows carry a
  // sibling pair — `map`/`map` and `map`/`fanout` — so the clause above passed on
  // one of those instead, and P14 decision 3's requirement was satisfied by
  // precisely the case it exists to exclude. Reading the opener kinds off the
  // selected row is what makes the filter load-bearing.
  // **A reference is declared in MORE THAN ONE BRANCH of the reader's region, across
  // a pair the chains do not share** — W51's adequacy reader's finding 4, and it is
  // the clause `siblingFanoutPairs` above could not make: that one asks whether a
  // row HAS a sibling fanout pair, and the reader deleted `publishB2`'s reference
  // for **zero**, leaving a row whose key still read *a run that used to STOP* and
  // whose run never could have. *The pair is the evidence and the pair is two
  // BRANCHES both declaring, not one.*
  {
    // **Scoped to the sibling FANOUT rows, and that scoping is the finding.** Written
    // over every row this clause was satisfied by `sibling-map-fanout`'s `pubA`/`pubB`
    // and could not see `sibling-fanouts` losing its second reader — so it asserted
    // *some row somewhere* where P14 decision 3 asks for THIS one.
    const crossBranchReaders = siblingFanoutPairs.filter((e) => {
      const rs = allRegions(buildGraph(e.definition), e.definition);
      const readers = (e.definition.nodes ?? []).filter((n) => {
        const needs = (n as unknown as { needs?: Record<string, unknown> }).needs;
        if (!needs || !rs.some((r) => r.members.has(n.id as string))) return false;
        return Object.values(needs).some((v) => {
          const raw = Array.isArray(v) ? v[0] : v;
          if (typeof raw !== 'string' || raw === '.') return false;
          const target = raw.replace(/\?$/, '');
          // the target is inside a region too, and the two share none
          return rs.some((r) => r.members.has(target)) &&
            sharedRegionDepth(rs, n.id as string, target) === 0;
        });
      });
      if (readers.length < 2) return false;
      // and the two sit in DIFFERENT branches of one region, which is the property
      // that makes the cross-index case exist at all.
      return rs.some((r) => new Set(readers.map((n) =>
        [...r.branchOf.entries()].find(([, set]) => set.has(n.id as string))?.[0])
        .filter((b) => b !== undefined)).size >= 2);
    });
    assertThat('cross-row', 'and TWO branches of one region both declare a reference across the ' +
      'pair — the cross-index case, which is what makes a reader`s own index reach the answer ' +
      'and which one branch alone cannot show',
      crossBranchReaders.length > 0,
      `rows with two cross-region readers in different branches: ${crossBranchReaders.length}`);
  }

  // **And two sibling regions that OPENED different numbers of branches, read from
  // the folded state rather than from the definition** — W51's adequacy reader's
  // finding 2. Collapsing `sibling-map-fanout` to two items beside two branches cost
  // **zero** and left the row's key still saying *three items, two branches*: the
  // arities being INDEPENDENT is P14's whole question and no literal in this file
  // could see it. *An arity is a fact about the RUN, so the claim has to be read
  // from one.*
  {
    const differingArities = reports.filter((r) => {
      // **Over region INSTANCES** — W84. `regions` is two-level since ADR 0062, so
      // `Object.values` alone yields the inner RECORDS and every `opened` reads
      // `undefined`. An arity is a property of an INSTANCE, which is exactly why
      // this had to move rather than being flattened at the opener.
      const opened = Object.values(r.state.regions ?? {})
        .flatMap((byPath) => Object.values(byPath))
        .map((v) => v.opened.length)
        .filter((n) => n > 0);
      return new Set(opened).size >= 2;
    });
    assertThat('cross-row', 'and a run in which two regions opened DIFFERENT numbers of branches ' +
      '— the arities are independent, which is P14`s question and which equal arities cannot ask',
      differingArities.length > 0,
      `runs whose regions opened differing branch counts: ${differingArities.length}`);
  }

  check('cross-row', 'and BOTH its openers really are `fanout`s, which is what decision 3 asks',
    siblingFanoutPairs.length === 0
      ? []
      : allRegions(buildGraph(siblingFanoutPairs[0]!.definition), siblingFanoutPairs[0]!.definition)
        .map((r) => r.opensWith).sort(),
    ['fanout', 'fanout']);
}

/**
 * **ADR 0046's two answers are a DISCRIMINATING PAIR, and both halves are here** —
 * W55, and it is P15's exit artifact at the rung its prediction 4 said could not see
 * it.
 *
 * The per-row clauses above assert what each run held; **nothing there says the row
 * set contains both kinds**, and a class with no member is a clause that passes by
 * being empty — W23's finding, at the layer `ROW_KEYS` does not reach. So: at least
 * one region collected and RELEASED (rule 3), at least one collected and is STILL
 * HOLDING (rule 5), and the property that tells them apart is asserted rather than
 * assumed (`doc/workflow.md` section 5 rule 8's fourth requirement on the set —
 * *whatever makes a discriminating pair differ is itself a claim*).
 *
 * **Read from the REPORTS on one side and from the DECLARATIONS on the other**, so a
 * driver that released everything and a row set that declared everything terminal
 * are two different failures rather than one silent agreement.
 */
{
  const held = reports.filter((r) => r.retention.endEntries > 0).map((r) => r.runId);
  const released = reports
    .filter((r) => r.retention.peakEntries > 0 && r.retention.endEntries === 0)
    .map((r) => r.runId);
  // **A SET, both ways, rather than a floor** — W55's adequacy reader. `released`
  // was `> 0`, so truncating it to one entry, or computing it over the first thirty
  // reports, cost zero; only the `held` half had a declaration-side counterpart.
  // Both halves are read from the reports on one side and from the rows' own
  // declarations on the other now, and neither is a floor.
  const releasedByDeclaration = EXPECTED
    .map((e, i) => [e, `r${i + 1}`] as const)
    .filter(([e]) => arrivedInRun(e) > 0 && heldWhenOver(e) === 0).map(([, id]) => id);
  check('cross-row', 'ADR 0046 rule 3: a region on real workers collected what arrived and ' +
    'RELEASED it when its join became terminal — the saving P15 measured at 49.8% of a ' +
    'region-bearing run', [...released].sort(), [...releasedByDeclaration].sort());
  assertThat('cross-row', 'and that class is not empty, so the rule has a case at this rung at all',
    released.length > 0, `released: ${released.join(' ') || 'none'}`);
  assertThat('cross-row', 'ADR 0046 rule 5: and a region whose join NEVER became terminal is still ' +
    'holding what arrived — the bound rather than a leak, and the run whose footprint matters most',
    held.length > 0, `holding: ${held.join(' ') || 'none'}`);
  // **The pair's discriminating property, from the ROWS' own declarations.** Both
  // lists above come from the reports; this is the other source, and the two are
  // compared as sets. Collapsing the pair — making every row's join terminal — empties
  // the second list and fails the clause above; making the two classes agree by
  // reading one from the other is what this clause refuses.
  const heldByDeclaration = EXPECTED
    .map((e, i) => [e, `r${i + 1}`] as const)
    .filter(([e]) => heldWhenOver(e) > 0).map(([, id]) => id);
  check('cross-row', 'and the two classes are told apart by ONE property — whether the join became ' +
    'terminal — read from the reports and from the rows` own `joined`, both ways',
    [...held].sort(), [...heldByDeclaration].sort());
  // **The reporter's own PREDICATE, and its positive case** — W55's adequacy reader,
  // BLOCKING, and it is W47's `REACH_CASES` shape one file across.
  //
  // `examples/retention.ts` is not in the gate chain and nothing at L6 runs it, so
  // `violations()` — the one thing that makes that file able to fail — was deletable
  // for **zero**. It lives in `run-flow.ts` now and this is what binds it: a REAL
  // report must produce no complaint, and a report carrying each of the four defects
  // ADR 0046 rule 3 and `JP-R12` forbid must produce one naming it. **The negative
  // case alone is what a broken detector also returns**, which is the whole reason a
  // detector over a clean tree needs a constructed positive one.
  {
    // **Guarded, and the guard is an assertion rather than a `!`** — found by this
    // item's own revert probe, which is v0.10's requirement on the set firing inside
    // the item that quotes it. With ADR 0046 rule 3 reverted no run released anything,
    // so `find` returned `undefined` and this block died with *Cannot read properties
    // of undefined* — **a crash, not a detection**, and it took the whole rung's
    // report down before any of the twenty-five real failures could be read.
    const real = reports.find((r) => r.retention.peakEntries > 0 && r.retention.endEntries === 0);
    assertThat('cross-row', 'there is a released run to point the reporter`s predicate at — without ' +
      'one the block below cannot run, and a crash is not a detection',
      real !== undefined, `${reports.length} runs, none of them collected and released`);
    const arity = real?.retention.peakEntries ?? 0;
    const bent = (over: Partial<Retention>): RunReport | undefined =>
      real && ({ ...real, retention: { ...real.retention, ...over } });
    check('cross-row', 'the reporter`s predicate is SILENT on a real released run and FIRES on each ' +
      'of the four things ADR 0046 rule 3 and JP-R12 forbid — a detector with no case that makes ' +
      'it fire is bound to nothing',
      // **Fires or is silent, not HOW MANY times.** The claim is that the detector
      // discriminates; a count is a property of how the complaints are worded, and
      // the first version of this asserted 2 where the code says 1 because the
      // no-serializer arm short-circuits the reconstruction arm.
      [
        real !== undefined && violations(real, arity).length === 0,
        ...([
          { endEntries: 1 },
          { peakAliasingLog: 1 },
          { loggedResults: 0 },
          { snapshotEntries: 99 },
          { bytesAtEnd: null },
          { bytesBeforeRelease: real?.retention.bytesAtEnd ?? null },
        ] as Partial<Retention>[]).map((over) => {
          const r = bent(over);
          return r !== undefined && violations(r, arity).length > 0;
        }),
      ],
      [true, true, true, true, true, true, true]);
  }

  // **All FORTY-FOUR runs (forty-two until W58), not thirty-eight** — W55's conformity reader. `reports` is
  // the `EXPECTED` loop's; the two PAIR rows produce four more real runs on a SHARED
  // scheduler, they carry `retention` like every other run, and nothing read it. They
  // run `fanout-join` under `live-token`, so every branch arrives and the join fires:
  // the arity is read from the flow's own region rather than typed, so a document
  // that changed width would move this clause with it.
  {
    const pairArity = allRegions(buildGraph(FJ), FJ)[0]!.branches.length;
    const pairRuns = pairResults.flatMap(({ runs }) => runs.map(([who, rep]) => [who, rep] as const));
    check('cross-row', 'every run the row loop, the pair rows and the shim make is in the retention claim, the pair rows included — ' +
      'two drivers on ONE scheduler each collected their own region and released it',
      pairRuns.map(([who, rep]) => `${who} ${rep.retention.peakEntries}/${rep.retention.endEntries}`),
      pairRuns.map(([who]) => `${who} ${pairArity}/0`));
    check('cross-row', 'and that is FIVE more runs than the row loop produces — four from the two pair rows and ONE from the ' +
      'shim run, so the claim covers every run of those three — not W78`s two, W82`s one or W90`s forty',
      reports.length + pairRuns.length + 1, EXPECTED.length + pairResults.reduce((n, { runs }) => n + runs.length, 0) + 1);
  }

  // **The byte measurement's own UNIVERSE, bound both ways** — obligation (e)'s third
  // shape, *a LIST is a claim about another list*, and it is the clause this item's
  // own provocation set bought.
  //
  // `run-flow.ts`'s `NOT_RUN_STATE` decides what `retainedBytes` walks, and it is a
  // literal. Measured: adding `'arrivals'` to it costs **ZERO** at both L6 rungs,
  // because every other clause in this file reads the collection's SIZE through the
  // driver's own map and never through the walk — so the number `examples/retention.ts`
  // prints would silently stop counting the one structure this item is about, while
  // every assertion here stayed green. **`DRIVER_FIELDS` is the other list**, and it
  // is `test/driver/retention.test.ts`'s own ratchet at ladder L2 — a field added to
  // the driver fails here naming itself, which is what `RN-R13` needs from an
  // observer with one of them.
  const DRIVER_FIELDS = [
    'arrivals', 'def', 'dispatched', 'failed', 'firedJoins', 'graph', 'inputs', 'joinState',
    // `nodeTypes` since W59: the registry's node types, skipped by the walk as `opts` is.
    'languages', 'log', 'nodeTypes', 'now', 'opts', 'outputsCache', 'regions', 'runId', 'started',
    // `workers` since W73: the registry's worker entries, skipped by the walk as `nodeTypes` is.
    'workers',
    // `header` since W88: the checkpoint's header (`RN-R15`, ADR 0064), holding the driver's own
    // copy of the entry payload — WALKED, because it is run state the driver retains, so
    // `run-flow.ts`'s `NOT_RUN_STATE` is unchanged and only this list moves.
    'header',
    // `replay` since W89: the resume's stored events and held dispatches (`RN-R19`, ADR 0065),
    // `null` outside `resume()` and so retaining nothing on any run here — WALKED, as `header` is,
    // and a declared exception of W89's, seeded at its declaration from W88's own row.
    'replay',
    // `gateMemory` and `gateTypes` since W93 (`RN-R26`, ADR 0067): each gate's memory — run state, WALKED,
    // `RN-R13`'s fourth term, empty on every run here since no L6 row runs a gate — and the gate types, whose
    // `fn` is a FUNCTION, SKIPPED as `languages` is. A declared exception of W93's, seeded by P24.
    'gateMemory', 'gateTypes',
  ].sort();
  const anyRun = reports[0]!;
  check('cross-row', 'the byte measurement WALKS every growing structure the driver has and skips ' +
    'only the definition and the caller`s options — the two lists account for the driver`s own ' +
    'fields, both ways',
    [...anyRun.retention.walked, ...anyRun.retention.skipped].sort(), DRIVER_FIELDS);
  check('cross-row', 'and `arrivals` is on the WALKED side of that split, which is the one structure ' +
    'ADR 0046 rule 3 is about',
    { walked: anyRun.retention.walked.includes('arrivals'), skipped: anyRun.retention.skipped },
    { walked: true, skipped: ['def', 'gateTypes', 'graph', 'languages', 'nodeTypes', 'opts', 'workers'] });
  // **The two release moments this rung cannot reach, recorded rather than argued** —
  // `doc/workflow.md` section 5 rule 8: *construct the case that makes each guard
  // fire, and where the corpus cannot express one, RECORD that.*
  //
  // ADR 0046 rule 3 names three moments. The satisfied exit is exercised above. The
  // `unsatisfiable` exit and `failRun`'s run-level clear are **not**, and neither is
  // a gap in the row set: **no shipped policy declares a region dead with an arrival
  // recorded in it** — which is the ADR's own reason for the L2 row needing a
  // constructed policy — and no flow here stops a run after a branch has arrived.
  // Asserted as empty so that a row which DOES reach one fails here, naming it,
  // instead of passing under a clause written when there were none.
  //
  // **The question is about a REGION and the first version of it asked about a
  // ROW**, which `nested LOW / live-token-requiring-arrival` falsified on its first
  // run: that row's INNER join is reported dead and its OUTER region has an arrival,
  // so *this row reports `unsatisfiable` and this row recorded an arrival* are both
  // true of a run where the dead region collected nothing. `UnsatisfiableJoin`
  // carries the `fanoutId`, so the region is nameable — W22's `Cell` finding, in a
  // clause written to record an absence.
  // **The lookup has to RESOLVE, and on the shipped tree one of its two cases did
  // not** — W55's conformity reader, BLOCKING, and W55's adequacy reader from the
  // other end. `all-exit / live-token-requiring-arrival` reports a dead `split` and
  // never spells `regionId`, so `e.regionId === fanoutId` was false and the lookup
  // returned `undefined` — the clause read *no arrivals recorded* for the row it is
  // most about, **by accident**. Three separate edits then cost zero: emptying the
  // `unsatisfiable` list, falsifying the `stoppedBy` filter, and making the lookup
  // return `undefined` outright. So the pairs are counted and every one must have
  // resolved, and the region id falls back to the FLOW's own rather than to nothing.
  const settledOfRegion = (e: Expectation, fanoutId: string): Record<string, string> | undefined =>
    (e.regionId ?? soleRegionOf(e)) === fanoutId ? e.settled : e.otherRegions?.[fanoutId]?.settled;
  const unsatisfiablePairs = EXPECTED.flatMap((e) =>
    (e.unsatisfiable ?? []).map((u) => ({ key: e.key, region: u.fanoutId, settled: settledOfRegion(e, u.fanoutId) })));
  const stoppedRows = EXPECTED.filter((e) => e.stoppedBy !== undefined);
  check('cross-row', 'the two release moments this rung cannot reach are COUNTED before they are ' +
    'reported absent — every unsatisfiable join names a region this row declares, and every ' +
    'stopped row is looked at',
    {
      unsatisfiable: unsatisfiablePairs.length,
      resolved: unsatisfiablePairs.filter((p) => p.settled !== undefined).length,
      stopped: stoppedRows.length,
    },
    {
      unsatisfiable: EXPECTED.reduce((n, e) => n + (e.unsatisfiable?.length ?? 0), 0),
      resolved: EXPECTED.reduce((n, e) => n + (e.unsatisfiable?.length ?? 0), 0),
      stopped: EXPECTED.filter((e) => e.stoppedBy !== undefined).length,
    });
  const unsatisfiableWithArrival = unsatisfiablePairs
    .filter((p) => arrivedIn(p.settled) > 0).map((p) => `${p.key} / ${p.region}`);
  const stoppedWithArrival = stoppedRows.filter((e) => arrivedInRun(e) > 0).map((e) => e.key);
  check('cross-row', 'and the other two release moments have NO case at this rung: no row reports an ' +
    'unsatisfiable join with an arrival recorded, and none stops a run after one — recorded, not argued',
    { unsatisfiableWithArrival, stoppedWithArrival }, { unsatisfiableWithArrival: [], stoppedWithArrival: [] });
}

// **The DERIVATION's own census — W98.** Every row asserts the pairs `dispatchOrder` returns, so a `fixes` that collapsed
// — to `null` everywhere, or to one relation everywhere — makes every row's clause vacuous or unsatisfiable while each row
// stays green on its own terms. The rung-wide totals are what see that, and they are this item's measurement:
// **941 pairs this rung's runs FIX and 264 they do not**, the same in node and deno and in repeated runs of each.
//
// *Two earlier cuts of this derivation read differently and each was corrected by a MEASUREMENT rather than by an
// argument*: one collected only branches that ARRIVED at a join and read them at the END of the run, and its census
// read 656 in one run and 657 in the next; the next composed (a) with nothing, and read 660 / 545 until this item's
// conformity reader derived that everything dispatched in a FIXED predecessor's own turn is fixed too — worth 281
// pairs. **What the rung asserted before W98 is left to the Record**, because the figure the declaration step took
// (647, of which 210 racing) came from that same first relation and its reader recomputed it at 566.
{
  const sum = (k: 'free' | 'chain' | 'barrier' | 'turn') => orderCensus.reduce((n, r) => n + r[k], 0);
  const [chain, barrier, turn, free] = [sum('chain'), sum('barrier'), sum('turn'), sum('free')];
  console.log(`\n  W98 — dispatch order: ${orderCensus.length} rows, ${chain + barrier + turn} pairs the run FIXES ` +
    `(${chain} by a chain, ${barrier} by a join barrier, ${turn} in one turn), ${free} it does not (asserted by nothing)\n`);
  // **`turn` apart from the other two, and the other two only as a SUM** — the adequacy reader's `B2` asked for all three
  // apart, and MEASURED they cannot be: `chain` and `barrier` read 759/5 in one run of this tree and 760/4 in the next,
  // because which of them reaches a join's successor depends on WHICH BRANCH SETTLED LAST. Their sum is a property of the
  // run and their split is a property of the sample — this item's own subject, one layer in. **What binds the three labels
  // is the CONSTRUCTED control below**, which answers each of them deterministically; what the census binds is the counts.
  // `turn` is a property of the DOCUMENT and is invariant, so B2's own probe — swapping the `chain` and `turn` labels — is
  // caught here.
  check('cross-row', 'W98: over every row of this rung, the pairs the RUN FIXES — by its own CAUSALITY (a trigger chain or ' +
    'a join barrier, which trade places between runs) and in ONE TURN, which is the document`s — and the pairs it does not (RN-R27)',
    // *(A `rows` term compared `orderCensus.length` against `EXPECTED.length` until W98's own rule 8 pass 3: re-sourcing
    // the left side to `EXPECTED.length` SURVIVED, and row completeness is `ROW_KEYS`' job two hundred lines down, by set
    // equality AND order. A decorative term in a control is worse than no term: it reads as a claim.)*
    // **W110 moved two of the three and the arithmetic is DERIVED rather than pasted.** Its SEVEN rows
    // dispatch 5, 5, 4, 5, 5, 5 and 5 ids and every pair in them is FIXED, so they add
    // `sum k(k-1)/2 = 10+10+6+10+10+10+10 = 66` pairs; SIX of those are the two map instances of the
    // six rows that have two, dispatched in ONE turn in the data's order; the other **60** are the
    // run's own causality (`intake` triggers the region, the join is a barrier, `rollup` triggers its
    // successor). So `turn` 177 -> 183 and `byCausality` 764 -> 824 — **and `free` is UNMOVED at 264**,
    // which is the claim worth reading: the artifact's rows assert no pair the run does not fix, and
    // the adequacy reader's F8 confirmed it the other way — each worker delayed past its peers through
    // `uiRegistryDocumentFor`, one at a time, all four GREEN.
    // *(815 / 182 for the six rows this item first shipped; the seventh is the THREADED one its
    // adequacy reader's F9 bought, and it adds 10 pairs of which 1 is a turn.)*
    { byCausality: chain + barrier, turn, free },
    { byCausality: 824, turn: 183, free: 264 });
  // Its CONTROL, on two constructed sequences no run produces (above): the census's claim passes on this tree and this
  // fails on any `fixes` that answers one relation everywhere, or none.
  check('cross-row', 'W98 CONTROL: and the derivation answers two CONSTRUCTED sequences correctly — three dispatches in ' +
    'ONE turn are the document`s order, and two turns opened by settlements that RACED fix their own chains and nothing across',
    dispatchOrderControl(), { oneTurn: ['turn', 'turn', 'turn'], racing: ['chain', 'chain', null] });
}

/**
 * **W110 — what P26's EXIT ARTIFACT claims, as cross-row clauses, because every one of them is a
 * claim about the SET of rows rather than about any one of them.**
 *
 * The four `ui-emitted` rows each assert their own dispatches, results and path end; none of them
 * can say *and the registry was empty*, *and the two documents differ in one edge*, or *and the two
 * roads agree* — those are properties of the rows together, which is what this layer is for.
 *
 * **EVERY CLAIM HERE IS ASSERTED AGAINST A LITERAL, PER ARM, AND THAT IS BOTH READERS' FINDING.**
 * The first cut wrote each claim as *OBSERVED equals DERIVED* with a control over the observed side,
 * and that is the exact class `doc/workflow.md` v0.21 exists for: the adequacy reader re-sourced
 * clause (1)'s expected side to `uiReports[i]!.predicateNames` and clause (3)'s to `roadsOf(nameRows)`
 * and both came back **GREEN at 2390 with their controls still green**, because a control reading the
 * observed side is exactly as true after a re-source as before. **They pass v0.22's test and fail
 * v0.21's** — there IS a tree on which each control fails and its claim passes, and neither fails
 * where its claim is VACUOUS. **Identity is not available here**: every operand is freshly built and
 * the values are equal STRINGS ([Q447](../doc/questions/q447.md)), which is
 * [W80](../doc/work-items/w80-what-a-run-time-result-check-is.md)'s own situation — and its answer is
 * the one taken here, *a LITERAL for each arm*. A re-sourced list cannot equal a literal that names
 * the other arm's value.
 *
 * **The subjects are in `CROSS_ROW_SUBJECTS`, one per clause, and that is the other shared finding.**
 * The conformity reader grepped the array and found none of this item's; the adequacy reader deleted
 * the whole block for **two integer edits** — `CROSS_ROW` 236 -> 226 and `DECLARED_TOTAL` 2390 -> 2380
 * — at **exit 0 with nothing named**. That is W47's finding reproduced by the mechanism built for it,
 * sixty lines under the comment that records the lesson.
 */
{
  const uiRows = EXPECTED.filter((e) => e.uiRegistry === true);
  const uiReports = uiRows.map((e) => reports[EXPECTED.indexOf(e)]!);
  const dataRows = uiRows.filter((e) => e.definition === UI);
  const nameRows = uiRows.filter((e) => e.definition === UIN);

  // (1) **The predicate registry the DRIVER was handed, per run, against a LITERAL per arm** —
  //     output (1), and careful-point 1's *an unused empty map proves nothing*. `predicateNames` is
  //     `runtime.registry.predicates`'s own keys; the expected side is a LITERAL naming which arm
  //     each row is in, so re-sourcing either side to the other leaves a list that cannot equal it.
  check('cross-row', 'W110: the predicate registry each artifact row`s driver was handed — EMPTY on all four ' +
    '`ui-emitted` rows and exactly one name on both `ui-emitted-named` rows, as a LITERAL per arm, so output (1) ' +
    'is a reading of the runtime rather than a sentence about an option',
    uiRows.map((e, i) => [e.definition.flowId, uiReports[i]!.predicateNames] as const),
    [
      ['ui-emitted', []], ['ui-emitted', []], ['ui-emitted', []], ['ui-emitted', []],
      ['ui-emitted-named', ['weakAndPlural']], ['ui-emitted-named', ['weakAndPlural']],
      // the THREADED row, which is `ui-emitted` again and therefore empty again
      ['ui-emitted', []],
    ] as unknown as readonly (readonly [string, string[]])[]);
  // And the DOCUMENT's own `when`s cite exactly those names, which is the second reading: the
  // registry a driver was handed and the names a flow may use are two different objects, and
  // `FD-V4` is applied between them. Read from the DEFINITION, so neither side is the other's source.
  const namedByDocument = (d: FlowDefinition): string[] => [...new Set(d.nodes.flatMap((n) =>
    ((n as { edges?: { when?: { predicate?: unknown } }[] }).edges ?? [])
      .map((x) => x.when?.predicate).filter((p): p is string => typeof p === 'string')))].sort();
  check('cross-row', 'W110: and the names each document`s own `when`s cite are those same lists — the registry the ' +
    'driver holds and the names the flow may use are two objects, and a flow naming one the registry lacks is `FD-V4`',
    uiRows.map((e) => namedByDocument(e.definition)),
    [[], [], [], [], ['weakAndPlural'], ['weakAndPlural'], []]);

  // (2) **The two documents differ in EXACTLY ONE edge's `when`** — rule 8's fourth requirement on
  //     the set: whatever makes a discriminating pair differ is itself a claim.
  //
  //     **It needs no control and here is why, rather than being called one** (v0.21's test): its
  //     expected side is a LITERAL of four specific leaf paths, not a second derived list, so the
  //     vacuous version — comparing `[]` to `[]` — fails against a non-empty literal. The adequacy
  //     reader measured the provenance direction too: `b = leaves(UIN)` re-sourced to `leaves(UI)`
  //     costs **1**. *Its stated LIMIT is the index collapse*: `.replace(/\.\d+\./g, '.N.')` folds
  //     every array index, so a change to any OTHER `all`-member's `path`, `op` or `value` lands on
  //     the same four paths and is invisible here — the conformity reader's 14. What catches that is
  //     the per-row routing, which is where a changed comparison moves a road.
  const leaves = (v: unknown, path = ''): [string, unknown][] =>
    v !== null && typeof v === 'object'
      ? Object.entries(v as Record<string, unknown>).flatMap(([k, x]) => leaves(x, `${path}.${k}`))
      : [[path, v]];
  const a = new Map(leaves(UI)), b = new Map(leaves(UIN));
  const differing = [...new Set([...a.keys(), ...b.keys()])]
    .filter((k) => JSON.stringify(a.get(k)) !== JSON.stringify(b.get(k)))
    .map((k) => k.replace(/\.\d+\./g, '.N.'))
    .filter((k) => k !== '.flowId');
  check('cross-row', 'W110: the two artifact documents differ in the ONE `when` and in nothing else but their flowId — ' +
    'the pair`s own difference, asserted, so collapsing it is a failure rather than a smaller suite',
    [...new Set(differing)].sort(),
    ['.nodes.N.edges.N.when.all.N.op', '.nodes.N.edges.N.when.all.N.path', '.nodes.N.edges.N.when.all.N.value',
      '.nodes.N.edges.N.when.predicate'].sort());

  // (3) **The two roads, each against a LITERAL node sequence** — output (2) and P26 prediction 3's
  //     answer as a measurement. The first cut compared `roadsOf(dataRows)` to `roadsOf(nameRows)`,
  //     and the adequacy reader re-sourced the left side to the right for ZERO with the control
  //     green. A literal per payload refuses that: the DECLARED road and the NAME road must each
  //     dispatch this exact sequence, so the two agreeing is a consequence of both matching the
  //     literal rather than the claim itself.
  const roadsOf = (rows: Expectation[]) => rows.map((e) => {
    const r = reports[EXPECTED.indexOf(e)]!;
    return [JSON.stringify(e.payload), r.dispatched.map((t) => t.split(':').slice(1).join(':')).join(' ')] as const;
  });
  const SHARED_ROADS = [
    ['{"confidence":0.9,"text":"alpha beta"}', 'intake:-:0 rate:0:0 rate:1:0 rollup:-:0 remediate:-:0'],
    ['{"confidence":0.2,"text":"alpha beta"}', 'intake:-:0 rate:0:0 rate:1:0 rollup:-:0 publish:-:0'],
  ] as const;
  const shared = new Set(nameRows.map((e) => JSON.stringify(e.payload)));
  check('cross-row', 'W110: the DECLARED road dispatches these exact node sequences on the payloads the two documents ' +
    'share — a LITERAL, so the agreement below is two matches rather than one list compared with itself',
    roadsOf(dataRows.filter((e) => !e.threaded && shared.has(JSON.stringify(e.payload)))), SHARED_ROADS);
  // **And the THREADED row dispatches the FIRST of those sequences too** — the adequacy reader's F9,
  // and the reason it is a pair rather than a seventh claim: the realm is the only thing that differs,
  // so a threaded pool answering differently is red on the SEQUENCE here and on the values in the row.
  check('cross-row', 'W110: and the THREADED row dispatches the inline row`s own sequence on the same payload — the ' +
    'pool config crosses a clone into a real thread and nothing about the run moves',
    roadsOf(dataRows.filter((e) => e.threaded === true)), [SHARED_ROADS[0]]);
  check('cross-row', 'W110: and the NAME road dispatches the same exact sequences — the subset reproduces a registered ' +
    'function, which is P26 prediction 3`s answer rather than its assertion',
    roadsOf(nameRows), SHARED_ROADS);
  // The CONTROL survives, and what it is for has narrowed: with both sides literal, *they agree* is
  // no longer the claim, so this says the two payloads are not two copies of one answer — which is
  // what makes the pair a discriminator rather than a repetition.
  assertThat('cross-row', 'W110 CONTROL: and those two payloads route DIFFERENTLY from each other, so the pair ' +
    'discriminates rather than repeating one answer',
    new Set(SHARED_ROADS.map(([, road]) => road)).size === SHARED_ROADS.length,
    `the shared payloads produced ${new Set(SHARED_ROADS.map(([, road]) => road)).size} distinct sequences for ${SHARED_ROADS.length} payloads`);

  // (4) **The `stalled` tripwire was never reached** — the third edge of `rollup`, taken when neither
  //     group matches. **It is a TRIPWIRE and not a control, and the adequacy reader confirmed why**:
  //     over `weak` x `n >= 1` the two groups are EXHAUSTIVE, so no payload this flow admits can
  //     reach `stalled` and the only thing that sends a run there is a broken transform or a broken
  //     group. The claim it would make non-vacuous is its own, which is v0.21's test answered
  //     honestly rather than dressed up.
  check('cross-row', 'W110: no artifact row ended at `stalled` — the third edge of `rollup` exists so that a wrong group ' +
    'is a NAMED end rather than a fall-through, and it is a tripwire rather than a control',
    uiReports.flatMap((r) => r.state.pathEnds.filter((p) => p.at === 'stalled')), []);

  // (5) **The UI registry document, against the FILE'S OWN BYTES and against LITERALS** — obligation
  //     (e)'s third shape, with v0.13's correction applied. The first cut keyed BOTH sides off
  //     `UI_REGISTRY_DOCUMENT`'s own key sets, so `"workers": {}` passed both (the conformity
  //     reader) and re-sourcing the expected side to the same import passed too (the adequacy
  //     reader's F4). Now: the key sets are LITERALS, and the entries are compared to the shared
  //     document read from `registry.json`'s own BYTES by `uiRegistryBytes` below — a different
  //     SOURCE, not a second expression over one object.
  check('cross-row', 'W110: the UI registry document declares exactly these three sections and no `predicates` key — ' +
    'the file`s own bytes, which is why an EMPTY registry is reachable at all',
    Object.keys(UI_REGISTRY_DOCUMENT).sort(), ['languages', 'nodeTypes', 'workers']);
  check('cross-row', 'W110: and exactly these four workers and four types, as a LITERAL — so a section emptied or a ' +
    'key added is red here rather than passing on two sides of one object',
    [Object.keys(UI_REGISTRY_DOCUMENT.workers ?? {}).sort(), Object.keys(UI_REGISTRY_DOCUMENT.nodeTypes ?? {}).sort()],
    [['publish', 'score', 'split', 'weigh'], ['PublishWorker', 'ScoreWorker', 'SplitWorker', 'WeighWorker']]);
  check('cross-row', 'W110: and every one of those entries is BYTE-EQUAL to the shared document`s, read from ' +
    '`registry.json``s own bytes — so the duplication cannot drift and `check:workers`, which reads only the shared ' +
    'document, covers both',
    [
      Object.keys(UI_REGISTRY_DOCUMENT.workers ?? {}).sort().map((k) => JSON.stringify((UI_REGISTRY_DOCUMENT.workers ?? {})[k])),
      Object.keys(UI_REGISTRY_DOCUMENT.nodeTypes ?? {}).sort().map((k) => JSON.stringify((UI_REGISTRY_DOCUMENT.nodeTypes ?? {})[k])),
    ],
    [
      Object.keys(UI_REGISTRY_DOCUMENT.workers ?? {}).sort().map((k) => JSON.stringify(SHARED_ON_DISK.workers?.[k])),
      Object.keys(UI_REGISTRY_DOCUMENT.nodeTypes ?? {}).sort().map((k) => JSON.stringify(SHARED_ON_DISK.nodeTypes?.[k])),
    ]);

  // (6) **The artifact reaches NO code but the domain workers and the language adapter** — the one
  //     narrowing P26 prediction 3 needs, asserted rather than described.
  check('cross-row', 'W110: the artifact`s registry declares no groups, no group types, no classes and no named pool ' +
    'instances — so the whole of what a code-free flow costs in TypeScript is the LANGUAGE adapter the library itself ships',
    {
      groups: Object.keys((UI_REGISTRY_DOCUMENT as { groups?: object }).groups ?? {}),
      pools: Object.keys((UI_REGISTRY_DOCUMENT as { pools?: object }).pools ?? {}),
      languages: (UI_REGISTRY_DOCUMENT as { languages?: readonly string[] }).languages ?? [],
    },
    { groups: [], pools: [], languages: ['jsonata'] });
  // And the built-in is in NO registry the driver was handed while a pool of that name ran the
  // tier-three node. **The non-emptiness term is the conformity reader's**: `[false] x 6` against
  // `[false] x 6` passes on an EMPTY `registryTypes` exactly as on a correct one, so the LITERAL
  // beside it is what says the registry was read at all.
  check('cross-row', 'W110: and `Transform` is in NO registry the driver was handed, while every artifact row`s registry ' +
    'holds exactly the four types its document declares — ADR 0075 rule 5 from the artifact`s side, with the ' +
    'registry asserted non-empty so `includes` on `[]` cannot pass for it',
    uiReports.map((r) => r.registryTypes),
    uiRows.map(() => ['PublishWorker', 'ScoreWorker', 'SplitWorker', 'WeighWorker']));

  // (7) **The DERIVED document the rows actually ran, against the file on disk** — the adequacy
  //     reader's F6. `uiRegistryDocumentFor` writes TWO keys and its docstring claimed both were
  //     *asserted the same way* `registryDocumentFor`'s one override is. They were not: deleting the
  //     `inline` write cost **ZERO**, because clause (5) reads the raw import and no clause read the
  //     derived object at all. This is `registryDocumentFor`'s own clause one document over — the
  //     derived document compared to the file key by key, with `inline` the ONLY admitted difference
  //     and in the direction the row asked for.
  for (const threaded of [false, true]) {
    const derived = uiRegistryDocumentFor(threaded, new Map());
    const diffs: string[] = [];
    for (const k of new Set([...Object.keys(UI_REGISTRY_DOCUMENT), ...Object.keys(derived)])) {
      if (k === 'nodeTypes') continue;
      if (JSON.stringify((UI_REGISTRY_DOCUMENT as Record<string, unknown>)[k]) !== JSON.stringify((derived as Record<string, unknown>)[k])) diffs.push(k);
    }
    for (const [name, t] of Object.entries(derived.nodeTypes ?? {})) {
      const onDisk = (UI_REGISTRY_DOCUMENT.nodeTypes ?? {})[name] as Record<string, unknown> | undefined;
      for (const f of new Set([...Object.keys(onDisk ?? {}), ...Object.keys(t)])) {
        if (JSON.stringify((onDisk ?? {})[f]) !== JSON.stringify((t as Record<string, unknown>)[f])) diffs.push(`${name}.${f}`);
      }
      // and the override's VALUE is the one the row asked for, not merely present
      if (onDisk?.inline === undefined) {
        check('cross-row', `W110: and \`${name}\`'s derived \`inline\` is the row's own knob at threaded=${threaded} — ` +
          'the value and not merely the key, which is what *asserted the same way* has to mean',
          (t as { inline?: unknown }).inline, !threaded);
      }
    }
    check('cross-row', `W110: the UI document the rows RUN is the file on disk with \`inline\` written into the types that ` +
      `declare none and NOTHING else, at threaded=${threaded} — \`registryDocumentFor\`'s own clause, which this ` +
      'function\'s docstring claimed and did not have (its adequacy reader, F6)',
      [...new Set(diffs)].sort(), ['ScoreWorker.inline', 'WeighWorker.inline']);
  }
}

const EXPECTED_TOTAL =
  rowCosts.reduce((n, [, shape, , extras]) => n + base(shape) + extras, 0) + CROSS_ROW + PAIR_ROW;
if (passed + failures.length !== EXPECTED_TOTAL) {
  failures.push(
    'gate\n      the derived assertion count is not what the rows declare — a block was skipped\n' +
      `      expected: ${EXPECTED_TOTAL}\n` +
      `      actual:   ${passed + failures.length}`,
  );
}

// **The absolute anchor, and it is the only number here not derived from the
// others.** Both checks above read `base()`, so decrementing an assertion **and**
// the constant that counts it passes them both — measured at 174 assertions and
// exit 0 by W6's adequacy reader, whose finding is that the Record's claim of
// *"checked two ways … either alone misses something"* was false, because both
// ways shared a source. This is the second source: a number a human wrote down.
/**
 * **L6 runs a NESTED shape, and this is what says so** — W23's adequacy reader,
 * BLOCKING.
 *
 * Measured: the four nested rows could be deleted, `DECLARED_TOTAL` edited to
 * match, and the two now-unused flow imports dropped — and L6 was **green at 388**
 * with `lint`, `typecheck` and all five `check:*` passing. After that no run here
 * had two regions, `Expectation.otherRegions` was dead code, the *"entered exactly
 * the regions"* check was vacuous on every remaining row, and **no dotted task id
 * was dispatched anywhere above L2** — this item's own Output (4). The cross-row
 * block above forces a row per POLICY and a row per reachable join VERDICT; there
 * was no analogue forcing a row per SHAPE, so P7's exit artifact was held down by
 * a number a human writes.
 *
 * Both halves, because either alone is satisfiable by the other's absence.
 */
check('cross-row', 'L6 dispatches at least one DOTTED branch path — the shape P1 reserved and W21 mints',
  reports.some((r) => r.dispatched.some((id) => parseTaskId(id).branchPath.includes('.'))), true);
check('cross-row', 'and at least one row declares a SECOND region, so a nested join is asserted at all',
  EXPECTED.some((e) => Object.keys(e.otherRegions ?? {}).length > 0), true);

/**
 * **The foreign-task list has a declared size** — W23's adequacy reader, BLOCKING.
 *
 * `UNMINTED` feeds both the arrangement (`foreign:`) and the expectation
 * (`unminted:`) through `.map`, and every pair-row assertion is a fixed count
 * independent of its length — so entries could be deleted, **up to and including
 * all six**, for 0 failures and an unmoved total. That deletes P6's exit artifact
 * and W23's own Q107 closure with the gate green. The entries are individually
 * load-bearing when present (changing one `event` costs 2); nothing bounded the
 * list itself.
 *
 * Five refusal sites, plus Q107's second event road.
 */
/**
 * **The rendered table names every region of a nested run** — W23's adequacy
 * reader, and [Q100](../doc/questions/q100.md) in a fifth file.
 *
 * The conformity reader found this table printing `-` for all four nested rows —
 * its spelling for *"entered no region"* — so P7's exit artifact rendered as a
 * region-free run. Fixing the renderer left it **asserted by nothing**: pointing
 * it back at the hard-coded `'split'` still costs 0 at L6, because a print is not
 * a check. This reads the same helper the table is built from.
 */
{
  const nestedRow = EXPECTED.findIndex((e) => Object.keys(e.otherRegions ?? {}).length > 0);
  const cells = renderRegions(regionsOf(reports[nestedRow]!, EXPECTED[nestedRow]!));
  for (const id of ['outer', 'inner']) {
    assertThat('cross-row', `the printed table names region "${id}" on a nested row`,
      cells.branches.includes(`${id} `), `printed: ${cells.branches}`);
  }
  assertThat('cross-row', 'and prints a verdict per region rather than one for the run',
    cells.joined.includes('/'), `printed: ${cells.joined}`);
}

// **SITE TWO of the `soleRegion` comment's two: the table a PERSON reads names both INSTANCES**
// — W86, and W84 dated the repair to this item there by name. `regionsOf` read every declared
// region through `soleRegion` and FILTERED OUT whatever came back `undefined`, so a region with two
// instances vanished from the table entirely. A by-product nothing reads is a by-product that can
// LIE, which is [Q100](../doc/questions/q100.md) answered *yes* by the item that introduced it — so
// the repair is asserted rather than merely made. **The clause above covers a NESTED row** (two
// openers, one instance each); this covers an INSTANCED one, which is the shape that used to
// disappear, and the two are different mechanisms in `regionsOf` rather than one written twice.
{
  // **And it REPORTS rather than crashes, for the reason block (2f) does** — the adequacy reader's
  // finding 3, and it is this item's OWN repair shipped at one site while the identical defect went
  // out one block over: renaming `regionInstances` made `findIndex` return `-1`, `reports[-1]!`
  // `undefined`, and `regionsOf` died in a `TypeError` at exit 1 with ZERO failure lines — masking
  // SIX named detections that the guarded version reports. *A crash is not a detection*
  // (`doc/workflow.md` section 4), and an author who has just written that sentence is not thereby
  // immune to the next instance of it.
  const iRow = EXPECTED.findIndex((e) => Object.keys(e.regionInstances ?? {}).length > 0);
  assertThat('cross-row', 'a row declaring `regionInstances` exists for the printed-table clause to read — a field that stopped ' +
    'being declared is a FAIL line naming it, never a TypeError inside the renderer',
    iRow >= 0, 'no EXPECTED row declares regionInstances');
  const cells = iRow < 0 ? { branches: '(no instanced row)', joined: '' } : renderRegions(regionsOf(reports[iRow]!, EXPECTED[iRow]!));
  assertThat('cross-row', 'W84 finding 10: the printed table names BOTH instances of one opener — `perShard@0` and `perShard@1` — ' +
    'and prints a verdict per instance, where a region with two instances used to vanish from it entirely',
    cells.branches.includes('perShard@0 ') && cells.branches.includes('perShard@1 ') && cells.joined.split('/').length === 3,
    `printed: ${cells.branches} | ${cells.joined}`);
}

check('cross-row', 'the foreign-task list is six: one per parseTaskId refusal, plus Q107 second event road',
  UNMINTED.length, 6);
check('cross-row', 'and they reach ID-R5 under TWO scheduler events, not one',
  [...new Set(UNMINTED.map((u) => u.event ?? 'task.completed'))].sort(),
  ['task.completed', 'task.failed']);

/**
 * **Every cross-row SUBJECT was asserted about** — W47's adequacy reader, finding 1,
 * and the last cross-row clause in the file because it reads what all the others did.
 *
 * Both directions matter and only one is available: a subject that left is NAMED here,
 * and a block nobody declared a subject for is invisible — which is `ROW_KEYS`' own
 * limit, and is why `CROSS_ROW` stays beside this rather than being replaced by it.
 */
/**
 * **And every PER-ROW subject, on the number of rows that owe it** — W55's adequacy
 * reader, BLOCKING. See `PER_ROW_SUBJECTS`: this item's whole product is thirty-eight
 * pairs of per-row assertions, and before this clause three integer edits deleted the
 * one that carries its headline number and left nothing naming it.
 *
 * **Both halves**: the subject must have been asked, and it must have been asked the
 * number of times the ROWS require — so an assertion that quietly stops running
 * inside a row that is still there fails here, which a count of everything cannot see.
 */
check('cross-row', 'every PER-ROW subject this file declares was asked, on exactly the rows that ' +
  'owe it — an assertion deleted with the floors is one that fails naming what it was about',
  PER_ROW_SUBJECTS.map(([subject]) =>
    `${subject}: ${[...perRowLabels.values()].filter((ls) => ls.some((l) => l.includes(subject))).length}`),
  PER_ROW_SUBJECTS.map(([subject, howMany]) => `${subject}: ${howMany(EXPECTED)}`));

/**
 * **And BOTH WAYS, which is what stops a subject being deleted alongside the clause it
 * names** — W55's adequacy reader, and it is `CROSS_ROW_SUBJECTS`' own recorded limit
 * ([Q217](../doc/questions/q217.md)) closed on this side of it.
 *
 * The clause above maps over the LIST, so removing an entry removes it from both
 * halves and costs nothing. This maps over the LABELS: every per-row assertion whose
 * subject is one of the two rules W55 is about must be covered by a declared subject,
 * so a deleted entry leaves its own labels uncovered and fails naming them.
 *
 * **The prefix is what makes it computable** and it is stated rather than inferred:
 * these are the assertions whose text begins with the rule they are about, which is
 * the convention W55 introduced and the only thing here that could tell its own
 * per-row assertions from the thirty-odd that predate it.
 */
check('cross-row', 'and no per-row assertion about ADR 0046 or JP-R12 is left uncovered by that ' +
  'list — the other direction, so a subject cannot leave with the clause it names',
  [...new Set([...perRowLabels.values()].flat())]
    .filter((l) => /^(ADR 0046|JP-R12)/.test(l))
    .filter((l) => !PER_ROW_SUBJECTS.some(([subject]) => l.includes(subject))),
  []);


check('cross-row', 'every cross-row SUBJECT this file declares was asserted about — a block ' +
  'deleted with the counts is a block that fails naming what it was about',
  CROSS_ROW_SUBJECTS.filter((t) => crossRowLabels.some((l) => l.includes(t))), CROSS_ROW_SUBJECTS);
// **1277 at W59, from 1203** — +74: the typed pair row (plain, 19 + 9 extras: four `nodeResults`,
// `pathEnds`, one `attempts` on two observers, two `heldGroups`), the typed-regions row (region,
// 21 + 20: seven `nodeResults`, `pathEnds`, one `otherRegions` at two, five `branchEvents`, four
// `heldGroups`, one arrival held), and five cross-row assertions in block (2b). The count matched
// this arithmetic on the file's second run, after the first taught the pair row that a retried
// task acquires its group once per attempt. **1280 the same day**: block (2c)'s three manifest
// assertions. **1281 after the readers**: the map instances' inputs distinct.
// **1499 at W63, from 1281** — +218: +42 for the pool-languages clause on every existing row; three
// `transformed` rows (region, 22 + 16 extras: seven `nodeResults`, `pathEnds`, one `otherRegions`
// at two, three `branchEvents`, two `heldGroups`, one arrival held) at 38 each; the
// `transform-fails` row (region, 22 + 27: five `nodeResults`, `pathEnds`, three `branchEvents`, two
// `resolveOnSuspend` at two, one `outcomesSeen`, two `outcomesNotSeen`, `regionSuspended`, two
// `attempts` at two, two `taskErrors` at two, one `heldGroups`, one arrival held) at 49; ten
// cross-row assertions in block (2d); and three from W43's per-row node-`needs` clause, which the
// three `transformed` rows reach. *(Written as 1494 from the arithmetic before the file was run;
// the first run reported 1497 and the three are that clause, missed in the arithmetic; 1499 once
// the reshaping-road pair joined block (2d).)* **1501 after the readers**: the `transform-fails`
// row's fourth branch, `note` — one `nodeResults`, one `branchEvents` — at 51. **1502 since W65**:
// one more cross-row assertion, the own-policy half of block (2b)'s retry pair; no row moved.
// **+96 since W65 — W67.** Two rows of P18's sample (`triage LOW` and `triage HIGH`,
// each carrying `poolOfTask` and `heldGroups` extras the floor derives from the row) plus the 11
// cross-row assertions above. *(1502 at W65; 1595 at this item's first green run; 1597 after the
// `FD-V33` fixture its author pass forced; 1598 after its conformity reader's finding 10 gave the
// control row the entry node's pool; 1609 after its adequacy reader's eleven cross-row assertions
// and the per-row subject its a12 forced. W67's conformity reader, finding 9 — the arithmetic belongs
// here, and its absence is why two documents shipped 1595.)*
// **+12 since W73 — W78.** P20's exit artifact adds no row and twelve cross-row assertions: the
// consumer-road block, which holds nothing but `{ driver, done }` and makes two runs. No row
// moved, because nothing here changes what a worker receives (P20 decision 7). *(Written as 12
// from the arithmetic before the file was run, and the first run reported exactly that.)*
// **+20 since W86 — W90.** P23's exit artifact adds no row and twenty cross-row assertions: block (2g), which makes forty
// runs of its own. No row moved. *(Written as 20 from the arithmetic before the file was run.)*
// **+206 since W90 — W94, P24's EXIT ARTIFACT.** Three TV rows (region, 22 each): LAST-first 88 (21 `branchEvents`, 22
// `nodeResults`, `pathEnds`, seven `beside` instances at two, one arrival held, and SEVEN gate claims — six on every gated
// row and the arrangement's own effect), FIRST-first 60 (7, 8, `pathEnds`, 14, 1, 7) and threaded 51 (7, 1, 14, 1, 6) —
// 199 — plus seven cross-row: block (2h)'s five and the pair's two. Fifty-four more real runs: the three rows, and block
// (2h)'s reference with a killed and a resumed run at each of its twenty-five kill points. *(Written as 2059 / 154 in
// W94's file before the file was run; the first complete run read 2060 with ONE failure — the derived-count clause's own
// mismatch line, which counts itself — and 2059 once `CROSS_ROW` moved.)* **2060** with the route control, +1 before
// either reader read the tree — the arithmetic's own cross-row term was short by the control its enumeration needed.
// **2069 after the readers**, +9 and all per-row: each TV row compares its fourteen `beside` ids as a SET and asserts the
// overlap that justifies it (+2 — the conformity reader's finding 2: the first cut asserted a fan-out's completion
// order), and the realm its `identify` ran in (+1 — the adequacy reader's finding 4). No cross-row count moved: block
// (2h)'s distinct kill points and rebuilt memory, and its re-stated control, widened clauses that were already there.
// **2175 since W99**: +2 cross-row — the arc that was Q391's false `no` asserted FITTING on every gate row,
// and the per-series consumer's own `required` beside it, which is what makes the pair a discriminator rather than
// a second reading of `rowsWithNo` (its adequacy reader, F5). No run moved and no row's per-row cost moved.
// **2174 since W98**: +1 cross-row, the derivation's census. *(This entry read **2173** until W99, which is wrong by
// one: `git show` at W98's commit gives `DECLARED_TOTAL = 2174`, and `README.md`'s trail says 2174 too. `X10`
// compares only the CURRENT value, so a stale HISTORY line is invisible to it — W99's adequacy reader, note 1,
// which also found that W99 had appended nothing to either block.)* *(2172 while W98's three per-row clauses landed and its
// census was still a `console.log`.)*
// **2172 since W97**: +1 cross-row, block (2h)'s arrangement, and +2 on P22's row, which compares `recheck` as a set and
// asserts the overlap beside it (the `unorderedDispatch` pair). No run moved.
// **2176 until W110 — P26's EXIT ARTIFACT, and +214 over SIX new runs.** The split is DERIVED and it reconciles to the
// assertion: **+198 per-row** and **+16 cross-row**, which is 214. All six rows are region-shaped (each declares
// `regionId: 'each'`), so the base is `6 x PER_REGION_ROW = 144`, and the declared extras are **54** — 29 `nodeResults`
// entries, 11 `branchEvents` paths, 6 `pathEnds`, 2 `poolOfTask`, and **6 for `arrivedInRun`**, one per row, which is
// the term a hand count misses. 144 + 54 = 198. The cross-row sixteen are ten of this item's own and six from W43's
// per-row `needs` clause, which iterates over EXPECTED — see `CROSS_ROW`. **160 runs, from 154.**
// **2390 for the hours between the first green run and both readers' reports**; **2398** once the block was rewritten
// with a literal per arm (`CROSS_ROW` 236 -> 244, no row and no run touched); **2435 / 161** with the SEVENTH row, the
// THREADED one the adequacy reader's F9 bought — **+37**, DERIVED: one region-shaped row at `PER_REGION_ROW` (24) plus
// its eleven declared extras (five `nodeResults`, two `branchEvents`, one `pathEnds`, two `poolOfTask`, one
// `arrivedInRun`) is **35**, and `CROSS_ROW` 244 -> 246 is the other **2**. *(This read +36 and nine extras for the
// hour between the row landing and the arithmetic being re-taken; 2398 + 35 + 2 = 2435 is what the run says.)* *Both readers' edits are checked in as rule-8 probes rather than described here.*
// **2465 / 162 since W133** — +30 and one run, DERIVED before the file was re-run: the threaded `uncloneable` row is a
// PLAIN row (`regionId: null`) at `PER_PLAIN_ROW` (22) plus its six declared extras (one `outcomesSeen`, two
// `outcomesNotSeen`, one `pathEnds`, two for its one `taskErrors` id), which is 28, and the existing `uncloneable` row's
// `stoppedByNamesItOnce` clause is the 29th. `CROSS_ROW` does not move: the `inline` membership and the `taskErrors`
// clause each changed what they compare, not how many times they assert. *(2464 until the adequacy reader's finding 1
// bought the threaded row's one `records` clause, the 30th.)*
// **2466 / 162 since W140** — +1, DERIVED before the file was re-run: the `map / FD-R2` row declares
// `stoppedByNamesItOnce`, one clause on one row (the per-row extra `e.stoppedByNamesItOnce ? 1 : 0`). No row, no run and
// no `CROSS_ROW` term moved.
const DECLARED_TOTAL = 2466;
// **And the RUN count, declared outright beside it — W96.** It was printed on every gate run and written nowhere, so the
// copies of it in `README.md` and `examples/README.md` had nothing to be compared against: `check-docs`' `X10` reads
// BOTH declarations and holds each current copy to them ([Q171](../doc/questions/q171.md), named by P20's retro and built
// by none of the four plans after it). Checked here the way `DECLARED_TOTAL` is — a mismatch is a named failure and NOT a
// counted assertion, so neither number moves the other — though, like `DECLARED_TOTAL`'s own guard, a mismatch run prints
// a total one higher, because the report adds `failures.length` (W96's adequacy reader).
const DECLARED_RUNS = 162;
if (passed + failures.length !== DECLARED_TOTAL) {
  failures.push(
    'gate\n      the assertion count is not the number this file declares outright\n' +
      `      declared: ${DECLARED_TOTAL}\n` +
      `      actual:   ${passed + failures.length}\n` +
      '      If you added or removed an assertion deliberately, update DECLARED_TOTAL.',
  );
}
if (reports.length + pairRunCount !== DECLARED_RUNS) {
  failures.push(
    'gate\n      the real-run count is not the number this file declares outright\n' +
      `      declared: ${DECLARED_RUNS}\n` +
      `      actual:   ${reports.length + pairRunCount}\n` +
      '      If you added or removed a run deliberately, update DECLARED_RUNS — and check-docs X10 then names every copy.',
  );
}

console.log(`\n  ${passed + failures.length} assertions, ${failures.length} failed`);
if (failures.length) {
  console.log('\n' + failures.map((f) => `  FAIL  ${f}`).join('\n\n') + '\n');
  exit(1);
}
console.log('  all passed\n');

function exit(code: number): never {
  const g = globalThis as Record<string, any>;
  if (g.Deno) g.Deno.exit(code);
  g.process.exit(code);
  throw new Error('unreachable');
}
