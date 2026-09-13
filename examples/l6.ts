/**
 * **Ladder L6 — the gate.** Every real run this repository makes: P1's exit
 * artifact, P2's, P4's, P5's, P6's, **P7's**, **P10's**, **P12's**, **P13's** and
 * **P14's**. *(This list stopped at P12 while W47's two rows and W51's two were in
 * the file — a count carried as prose in the paragraph above this file's own
 * monument to that. W51's conformity reader.)*
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
 * | **W14 — `two runs / two drivers / one scheduler`** | **P4's exit artifact**, and the only row that runs two drivers. The pairing `MultipleRuns` tells a caller to build: before [ADR 0023](../doc/decisions/0023-an-inbound-settlement-is-this-runs-only-if-this-driver-dispatched-it.md) each driver received the other's settlements and dispatched its successors — one task id under two outcomes, with nothing reported. It is `ID-R4` tier 1's only L6 coverage; tier 2 is not reachable here ([Q90](../doc/open-questions.md)) |
 * | **W17 — `all-exit` × all three policies** | **P5's exit artifact, and the row L6 has never had**: every branch reaches an `end` and nothing arrives at the join. It is the shape [ADR 0003](../doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md) records as `live-token`'s cost and the one [ADR 0025](../doc/decisions/0025-the-zero-arrival-join-is-reportable-and-arrival-counting-is-not-repaired.md) turns on. One flow, one payload, three policies, three answers — `completed`, silently `stuck`, and **`stuck` with `joined: false`**, which nothing at L6 had ever reached |
 * | **W19 - the second pair row** | **P6's exit artifact**: the same topology as the row above with **one variable changed** - the scheduler also carries a task this library did not mint. Its settlement lands FIRST, while both runs are live, and both runs still complete. [ADR 0027](../doc/decisions/0027-an-inbound-task-id-that-does-not-parse-was-minted-by-no-driver.md) and `ID-R5`, on real workers; under the ADR 0023 rule 2 it supersedes, one such settlement stopped **every** driver on the scheduler. The control row beside it is what makes `onUnmintedTask`'s empty array an assertion rather than a decoration |
 * | **W58 — `retry`** | **P16's first observable, and the first non-zero `attempts` a scheduler has ever set at any rung**: a `map` of three whose branch task declares `retryPolicy: { maxRetries: 1, backoffMs: 0 }` on a pool whose role fails every task id's FIRST attempt. Each instance is retried inside its own id and settles `done` with `attempts: 1` on two observers — the outcome record and the live task — and the per-instance policy is what a single-task row could not show (`doc/workflow.md` rule 8 obligation (a), v0.16) |
 * | **W58 — `group`** | **`workerGroups` on real workers, and P16 fact 2 answered where it shows**: a linear flow whose middle node names a `ConcurrentLimitGroup(1)` this harness holds when the run starts. The task is `resource.blocked` on dispatch, the harness lets go on that very event, and the task runs — the scheduler's own four resource events in order with `task.running` after the acquisition. Its pool declares no group, so nothing but the node's key put it there |
 * | **W59 — `typed`** | **P16's EXIT ARTIFACT, half one**: two nodes of ONE type (`Scorer`) with DIFFERENT settings — `factor` 10 against 100 — each receiving the envelope `{ settings, input }` (`FD-C5`) and computing a different answer from it (9 against 90 from one input); `high` retries ONCE under the TYPE's `retryPolicy` (the node declares none) and reports `attempts: 1` on both observers; both hold `scorer`, the group the type declares, registered through the bootstrap helper and read back by id. The pool is the helper's, keyed by the type's name |
 * | **W59 — `typed-regions`** | **half two, and obligation (a)'s shapes**: a typed task at path `1` inside a fanout branch feeding a typed `map` branch at `1.0`, `1.1`, `1.2` — arity three from a worker's return, each instance's envelope wrapping its OWN item (`JP-R11`) so three confidences give three scores from one settings object; branch 0 is a bare `ScoreWorker`, and the outer join carries the bare result beside the typed region's collection. Every typed id held `scorer`; no bare id did |
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
  // [Q221](../doc/open-questions.md) — an `export *` made them public the moment
  // they were declared, and nobody chose it.)*
  allRegions,
  branchIndices,
  buildGraph,
  buildTaskId,
  parseTaskId,
  sharedRegionDepth,
  // **W47, and it reaches the package ROOT like everything else here.** An example
  // that reached past `index.ts` would be exercising a surface no consumer has —
  // `AGENTS.md`'s own snippets import this name from `'fyflow-orchestration'`, so
  // asserting a refusal here asserts the refusal a consumer gets.
  validateDefinition,
  type FlowDefinition,
  type PolicyId,
  type Predicate,
  type RunOutcome,
  type UnmintedTask,
  type UnsatisfiableJoin,
} from '../index.ts';
import {
  runFlow, runPair, violations,
  // W59: the ONE node-type registry the helper built pools from and every driver was handed —
  // compared here to the types the flows name and to the pools the scheduler reports.
  NODE_TYPES,
  type ForeignTask, type PairFacts, type Retention, type RunReport,
} from './run-flow.ts';
import fanoutJoin from '../spec/examples/valid/fanout-join.flow.json' with { type: 'json' };
import routedAway from '../spec/examples/valid/p1-routed-away.flow.json' with { type: 'json' };
// **Local to `examples/`, and that is [Q44](../doc/open-questions.md) again.** The
// corpus cannot express an `optional` branch node with no `on: ["failed"]` edge —
// the only shape that reaches `branch.lost` by SETTLING — so W4 defined one in
// `test/matrix/` and W5 defines one here. Second occurrence; the register row says
// a gap re-found by every later item is the signal, and this is that.
import optionalLoss from './flows/optional-loss.flow.json' with { type: 'json' };
// W6's two, and the same [Q44](../doc/open-questions.md) reasoning: the corpus has
// no flow whose branch is a NON-optional task that fails (the only road to
// `user_action`), and none whose task returns a value `structuredClone` refuses.
import suspendResume from './flows/suspend-resume.flow.json' with { type: 'json' };
import uncloneable from './flows/uncloneable.flow.json' with { type: 'json' };
import exitLast from './flows/exit-last.flow.json' with { type: 'json' };
// **W17's, and the same [Q44](../doc/open-questions.md) reasoning a third time.**
// The corpus's `fanout-failure` is the all-exit SHAPE and is not usable here: it
// reaches the second exit through a `user_action` and a human, which would add a
// resolution race to a row whose point is elsewhere. This one takes the two roads
// to `branch.exited` that need no person — a decision, and an `on: ["failed"]`
// edge — and both branches share one `end`.
import allExit from './flows/all-exit.flow.json' with { type: 'json' };
import nested from './flows/nested.flow.json' with { type: 'json' };
import nestedSuspend from './flows/nested-suspend.flow.json' with { type: 'json' };
// **W35's three, and [Q44](../doc/open-questions.md) a FOURTH time — but the reason
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
// [Q44](../doc/open-questions.md) has recorded since W5.
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
//   - `map-with-context` — [Q166](../doc/open-questions.md)'s *score each item
//     against the run's config*. The corpus points its map-feeding node at
//     `IngestWorker`, which returns no array, so the corpus document run verbatim
//     here stops at `FD-R2` — measured at W43's declaration. It points at
//     `SplitWorker`, and its branch entry at **`WeighWorker`**, the role W43 adds
//     because no shipped role reads a declared key.
//   - `map-over-region-output` — [Q165](../doc/open-questions.md)'s *score, then
//     fan out over the scores*, with **no `over: "0"` anywhere**, which is the
//     brittleness that row names rather than a workaround for it. Same
//     `SplitWorker` substitution and nothing else.
//   - `decision-on-an-earlier-step` — [Q8](../doc/open-questions.md)'s own
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
// **W58's two, and [Q44](../doc/open-questions.md)'s reason a further time, narrower still**:
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
 * The corpus's `isLowConfidence`, registered for real. It reads the **effective
 * outcome** (`OR-R9`), so it sees one shape whether the node settled or a human
 * resolved it.
 */
const isLowConfidence: Predicate = (ctx) => {
  const r = ctx.outcome.result as { confidence?: number } | null;
  return typeof r?.confidence === 'number' && r.confidence < 0.5;
};
/**
 * **W43's predicate, and it reads `ctx.needs` where the one above reads
 * `ctx.outcome`** — [ADR 0041](../doc/decisions/0041-a-decision-sees-its-nodes-outcome-and-whatever-its-own-edge-declares.md)
 * and `FD-C3`: a decision sees its node's effective outcome **and whatever its own
 * edge declares**.
 *
 * **It is deliberately NOT total in the way `isLowConfidence` is.** That one guards
 * its read so a node with no `confidence` routes down the default edge; this one
 * does the same, and the guard is what carries the claim: on
 * `decision-on-an-earlier-step` the node it sits on is a `TallyWorker`, whose
 * result has **no `confidence` field**, so `isLowConfidence` applied to
 * `ctx.outcome` there is `false` on **both** payloads. The two predicates therefore
 * disagree on that flow at every input, which is what makes the row able to fail:
 * a driver that left `ctx.needs` empty routes the LOW run to `publish` and the row
 * says so by name.
 *
 * **`ctx.needs` is frozen, and that is a DRIVER-level decision rather than an ADR
 * rule.** This cited *"ADR 0041 rule 4"*, which is the grammar rule; `grep -i frozen`
 * over that ADR returns nothing, and neither it nor `FD-C3` says so. The freeze is
 * W42's adequacy reader's, and it lives in `src/driver/driver.ts` beside
 * `EMPTY_NEEDS` — W43's conformity reader. This predicate reads and does not write,
 * which is what a predicate is for; [Q9](../doc/open-questions.md) is untouched and
 * still declined.
 */
const earlierWasLowConfidence: Predicate = (ctx) => {
  const e = (ctx.needs as { earlier?: { confidence?: number } }).earlier;
  return typeof e?.confidence === 'number' && e.confidence < 0.5;
};
const predicates = new Map<string, Predicate>([
  ['isLowConfidence', isLowConfidence],
  ['earlierWasLowConfidence', earlierWasLowConfidence],
]);

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
  payload: { confidence: number; text?: string };
  threaded: boolean;
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
   * `reviewC` two levels in. It is [Q117](../doc/open-questions.md)'s defect a
   * second time, on the **expected** side of the assertion that was supposed to
   * catch it.
   *
   * The id is still derived from `spec/task-id.md` — `buildTaskId` over
   * `branchIndices(path)` — but the NODE is the row's own claim.
   */
  resolveOnSuspend?: Record<string, { at: string; as: 'done' | 'failed'; result?: unknown; actor: string }>;
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
   * **`spec/run-state.md` does not fix whether this array is cumulative or
   * current.** `RN-R6` names it as one of the three fields `regions` carries and
   * says nothing about its lifetime; the fold clears it on the branch's terminal
   * event, so it is *current*. Asserted here as the code behaves, and the gap is
   * reported rather than patched — it is W1's and W2's document. Raised as
   * [Q62](../doc/open-questions.md).
   */
  regionSuspended?: string[];
  /** `stoppedBy` — set only when a refusal terminated the run (`OR-R10`, `RN-R8`). */
  stoppedBy?: string;
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
   * answering [Q36](../doc/open-questions.md)). The matrix asserts it at L5; these
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
   * **The ids whose DISPATCH ORDER this run does not fix** — W51's conformity
   * reader, BLOCKING, and it is `sortedSettled`'s finding one field across.
   *
   * `dispatched` is compared **in order**, which is right wherever the order is
   * causal. It is not causal when a node is dispatched by the settlement of ONE
   * map instance and the instances are genuinely in flight together: then the
   * list is the settle order of a fan-out, which
   * `doc/workflow.md` section 5 rule 5 forbids a test from depending on.
   *
   * **Measured rather than argued** — 25 runs of `sibling-map-fanout` per
   * configuration: `threaded: false` gives the same order 25/25 in node and in
   * deno, and `threaded: true` gives a DIFFERENT order 12/12. So the row was green
   * on a property of the inline pool's timer FIFO, and `Expectation.threaded` is a
   * knob this file records as held down by no assertion
   * ([Q99](../doc/open-questions.md)) — flipping it would have turned a correct row
   * red.
   *
   * Names listed here are compared as a SET; everything else keeps its order, so
   * the dependency is removed exactly where it exists and nowhere else.
   */
  unorderedDispatch?: readonly string[];
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
 * that were prefix-comparable anyway ([Q214](../doc/open-questions.md)).
 */
const SMF = siblingMapFanout as unknown as FlowDefinition;
const RT = retryFlow as unknown as FlowDefinition;
const GR = groupFlow as unknown as FlowDefinition;

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
    // inline pools settle in dispatch order anyway ([Q99](../doc/open-questions.md)).
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
    // this pins the effect and not the stated mechanism ([Q99](../doc/open-questions.md)).
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
    // **The row that makes [Q117](../doc/open-questions.md)'s fix able to fail**,
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
      // **That 4x was measured INERT by W17's adequacy reader** ([Q99](../doc/open-questions.md)):
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
  // ([Q13](../doc/open-questions.md)) — and the three instances of one node run
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
    // [Q97](../doc/open-questions.md) exactly where section 5 leaves it. *(The first
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
     * **[Q166](../doc/open-questions.md) on real workers, and the row is about what
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
     * **[Q165](../doc/open-questions.md) on real workers — *score, then fan out over
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
     * **[Q8](../doc/open-questions.md)'s own sentence since P1, on real workers** —
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
     * refuses it, which is [Q187](../doc/open-questions.md)'s whole point. So this
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
     * **No arity anywhere in it**, which is the half [Q206](../doc/open-questions.md)'s
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
     * [Q206](../doc/open-questions.md) measured, on real workers.
     *
     * **This is the row that makes reverting ADR 0044 cost something at L6.** W50
     * measured that revert at 6 L1-L5 failures and ZERO here, because all eleven
     * aimed references in both corpora had a shared region depth of zero
     * ([Q214](../doc/open-questions.md)).
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
    unorderedDispatch: ['r38:refine:0:0', 'r38:refine:1:0', 'r38:refine:2:0'],
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
      'r41:low:-:0': { keys: ['input', 'settings'], settingsKeys: ['factor', 'failFirst'], confidence: 0.9, factor: 10, score: 9, retried: false },
      'r41:high:-:0': { keys: ['input', 'settings'], settingsKeys: ['factor', 'failFirst'], confidence: 0.9, factor: 100, score: 90, retried: true },
      'r41:publish:-:0': { published: true, joinPayload: { keys: ['input', 'settings'], settingsKeys: ['factor', 'failFirst'], confidence: 0.9, factor: 100, score: 90, retried: true } },
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
        keys: ['input', 'settings'], settingsKeys: ['factor'], confidence: 0.9, factor: 20, score: 18, retried: false,
        items: [{ word: 'a', confidence: 0.1 }, { word: 'bb', confidence: 0.2 }, { word: 'ccc', confidence: 0.3 }],
      },
      // Each instance's `input` is ITS OWN item — `JP-R11` inside `FD-C5` — so the three scores
      // are three different numbers from one declared settings object.
      'r42:rank:1.0:0': { keys: ['input', 'settings'], settingsKeys: ['factor'], confidence: 0.1, factor: 1000, score: 100, retried: false },
      'r42:rank:1.1:0': { keys: ['input', 'settings'], settingsKeys: ['factor'], confidence: 0.2, factor: 1000, score: 200, retried: false },
      'r42:rank:1.2:0': { keys: ['input', 'settings'], settingsKeys: ['factor'], confidence: 0.3, factor: 1000, score: 300, retried: false },
      // The outer join's collection: branch 0's bare result, and at key `1` the inner join's
      // collection keyed by the whole dotted path — `nested-map`'s shape with typed instances.
      'r42:publish:-:0': {
        published: true,
        joinPayload: {
          '0': { confidence: 0.9, score: 90 },
          '1': {
            '1.0': { keys: ['input', 'settings'], settingsKeys: ['factor'], confidence: 0.1, factor: 1000, score: 100, retried: false },
            '1.1': { keys: ['input', 'settings'], settingsKeys: ['factor'], confidence: 0.2, factor: 1000, score: 200, retried: false },
            '1.2': { keys: ['input', 'settings'], settingsKeys: ['factor'], confidence: 0.3, factor: 1000, score: 300, retried: false },
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
 * ([Q95](../doc/open-questions.md) is the row that records why not).
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
  return out.sort();
};

const heldWhenOver = (e: Expectation): number =>
  e.stoppedBy !== undefined
    ? 0
    : regionsDeclaredBy(e).reduce((n, [joined, settled]) => n + (joined === null ? arrivedIn(settled) : 0), 0);

const reports: RunReport[] = [];
/** Per row: key, shape, assertions actually run, and how many are row-specific extras. */
const rowCosts: [string, string, number, number][] = [];

for (const [i, e] of EXPECTED.entries()) {
  let report: Awaited<ReturnType<typeof runFlow>>;
  try {
    report = await runFlow({
      definition: e.definition,
      policy: POLICIES[e.policyId],
      runId: `r${i + 1}`,
      payload: e.payload,
      predicates,
      threaded: e.threaded,
      delayMs: 5,
      resolveOnSuspend: e.resolveOnSuspend,
      // Short only for the row whose result IS the backstop. Nothing can change
      // after the branch suspends, so a longer wait would measure the same thing
      // more slowly — and if it were ever too short the row fails loudly, with the
      // outcome reading `running` rather than `awaiting_action`.
      backstopMs: e.backstopMs,
      holdGroup: e.holdGroup,
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
  // **Order-insensitive only for the ids a row NAMES** — see `unorderedDispatch`.
  // The names are pulled out of both sides and compared as sorted sets; the rest of
  // the list keeps its order, so a row that declares none is compared exactly as
  // before and the two halves cannot drift apart.
  {
    const loose = new Set(e.unorderedDispatch ?? []);
    const split = (ids: readonly string[]) => [
      ids.filter((id) => !loose.has(id)),
      ids.filter((id) => loose.has(id)).slice().sort(),
    ] as const;
    const [gotOrdered, gotLoose] = split(report.dispatched);
    const [wantOrdered, wantLoose] = split(e.dispatched);
    check(e.key, 'dispatched task ids, in order — spec/task-id.md', gotOrdered, wantOrdered);
    if (loose.size > 0) {
      check(e.key, 'and the ids whose dispatch order the RUN does not fix, as a set',
        gotLoose, wantLoose);
      // **And the row's JUSTIFICATION for declaring them is asserted, not stated.**
      // The order is not causal only because the branches genuinely overlapped; a
      // row that declared `unorderedDispatch` on a sequential run would be
      // weakening an assertion for no reason, and nothing would say so. *Whatever
      // makes a clause affordable is itself a claim.*
      assertThat(e.key, 'and its branches really did OVERLAP, which is why that order is not the ' +
        'run`s to fix', report.branchesOverlapped,
        'declaring unorderedDispatch on a run whose branches did not overlap weakens the ' +
        'comparison for nothing');
    }
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
    check(e.key, 'pathEnds — section 3 discriminates completed from failed by these',
      report.state.pathEnds, e.pathEnds);
  }
  if (e.regionSuspended) {
    check(e.key, 'regions[*].suspended — who is parked on a person right now',
      report.state.regions[e.regionId ?? 'split']?.suspended, e.regionSuspended);
  }
  if (e.stoppedBy !== undefined) {
    assertThat(e.key, 'OR-R10: stoppedBy names the refusal that terminated the run',
      (report.state.stoppedBy ?? '').includes(e.stoppedBy), `stoppedBy: ${report.state.stoppedBy}`);
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
  for (const never of e.outcomesNotSeen ?? []) {
    assertThat(e.key, `the run was never quiescently \`${never}\``,
      !report.outcomesSeen.includes(never as RunOutcome),
      `saw: ${report.outcomesSeen.join(', ')}`);
  }

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
    check(e.key, 'the join fired — RN-R11', report.state.regions[rid]?.joined ?? null, e.joined);
    check(e.key, 'how each branch left its region — spec/join-policy.md section 2',
      sortedSettled(report.state.regions[rid]?.settled), sortedSettled(e.settled));

    // **Every OTHER region of the run — W23**, and the two halves are checked
    // separately: each declared region must answer as declared, AND the set of
    // regions the RUN entered must be exactly the set the row declares. Without
    // the second half a row could declare one of its two and read as complete,
    // which is W22's adequacy reader's loop-bound finding one rung up.
    for (const [id, want] of Object.entries(e.otherRegions ?? {})) {
      check(e.key, `${id}: the join fired — RN-R11`, report.state.regions[id]?.joined ?? null, want.joined);
      check(e.key, `${id}: how each branch left its region`,
        sortedSettled(report.state.regions[id]?.settled), sortedSettled(want.settled));
    }
    check(e.key, 'the run entered exactly the regions this row declares',
      Object.keys(report.state.regions).sort(),
      [rid, ...Object.keys(e.otherRegions ?? {})].sort());

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
    // `UncloneableResult`'s message begins with its own class name — so a
    // substring over `${kind}: ${message}` is satisfied by the message alone and
    // `RunFailure.kind` was pinned by nothing anywhere in the repository. And
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
  // ([Q179](../doc/open-questions.md)) and the rule is about *which structures hold a
  // result, and for how long*. The bytes are printed by `examples/retention.ts`.
  //
  // **This is the rung [Q214](../doc/open-questions.md) said could not exist.** Before
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
    + (e.joinSettledBy ? 1 : 0)
    // **The set comparison a row buys by declaring `unorderedDispatch`** — one
    // assertion, and it is derived from the expectation like every other extra here
    // so that declaring the field moves the floor with it.
    + (e.unorderedDispatch ? 2 : 0)
    + (e.stoppedBy !== undefined ? 1 : 0)
    // W58: two observers per declared `attempts`, and a sequence plus an ordering per
    // declared `resourceEvents` — derived from the expectation like every other extra here.
    + Object.keys(e.attempts ?? {}).length * 2
    + Object.keys(e.resourceEvents ?? {}).length * 2
    // W59: one per declared `heldGroups` id — derived from the expectation like the two above.
    + Object.keys(e.heldGroups ?? {}).length
    // **`JP-R12`'s SECOND-COPY claim, and only where there is something to be a copy
    // of.** A row that records no arrival would assert `0 === 0`, which is the
    // vacuity `doc/workflow.md` section 5 rule 3 refuses — so it is an extra derived
    // from the row's own `settled`, and declaring an arrival moves the floor with it.
    + (arrivedInRun(e) > 0 ? 1 : 0)
    // W55's adequacy reader: the region NAMES behind the count, on the rows that hold.
    + (heldWhenOver(e) > 0 ? 1 : 0);
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
 * naming a helper rather than the wiring. [Q138](../doc/open-questions.md): a crash
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
    { opened: low.state.regions['split']?.opened, settled: low.state.regions['split']?.settled },
    { opened: lowAc.state.regions['split']?.opened, settled: lowAc.state.regions['split']?.settled });
  check('cross-row', 'RN-R11: and disagree only on whether the driver routed out of the join',
    [low.state.regions['split']?.joined, lowAc.state.regions['split']?.joined], [true, null]);
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
assertThat('cross-row', 'isLowConfidence returned FALSE at 0.9 and TRUE at 0.1 — it can fail',
  highRouted?.state.regions['split']?.settled['1'] === 'arrived' &&
    low?.state.regions['split']?.settled['1'] === 'exited',
  `high: ${highRouted?.state.regions['split']?.settled['1']}, ` +
  `low: ${low?.state.regions['split']?.settled['1']}`);

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
      opened: r.state.regions['split']?.opened, settled: r.state.regions['split']?.settled,
    })),
    AE_RUNS.map(() => ({ opened: ['0', '1'], settled: { 0: 'exited', 1: 'exited' } })));
  // `RN-R11`, and the three values are three different things: the join fired, the
  // join is still waiting, the join was reported dead. Only the middle one is
  // silent.
  check('cross-row', 'RN-R11: and disagree only on whether — and whether they can SAY — the join fired',
    AE_RUNS.map((r) => r.state.regions['split']?.joined ?? null), [true, null, false]);
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
    { joined: raLtra.state.regions['split']?.joined, settled: raLtra.state.regions['split']?.settled,
      outcome: raLtra.state.outcome, reported: raLtra.unsatisfiableJoins.length },
    { joined: raLt.state.regions['split']?.joined, settled: raLt.state.regions['split']?.settled,
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
 * [Q170](../doc/open-questions.md).
 */
{
  const mapRegionsOf = (d: FlowDefinition) => d.nodes.filter((n) => n.kind === 'map').map((n) => n.id);
  const mapRegions = EXPECTED.flatMap((e, i) =>
    mapRegionsOf(e.definition).map((id) => [reports[i]!, id] as const));
  const settledOf = (r: RunReport, id: string) => Object.keys(r.state.regions[id]?.settled ?? {});
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
      r.state.regions[id] !== undefined && settledOf(r, id).length === 0 && r.state.outcome === 'stuck'));
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
 * it bounds is [Q102](../doc/open-questions.md)'s shape and W30's `GRADED_IDS`
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
 * `ROW_KEYS`' own header says of itself, and is [Q102](../doc/open-questions.md)'s
 * shape. What it removes is the *silent* case, where an integer edit leaves no name
 * behind. [Q217](../doc/open-questions.md).
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
 * is two edits in one diff — [Q102](../doc/open-questions.md)'s shape,
 * [Q217](../doc/open-questions.md). What it removes is the silent case, where three
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
];

// **The two W57 observers above are vacuous on a row that dispatched nothing, so this says they
// were not vacuous everywhere** — the tasks the scheduler held and the outcome records it produced,
// summed over every row, are both positive, read from the reports rather than from a literal.
assertThat('cross-row', 'ADR 0048 rule 5 was observed on tasks the scheduler actually HELD, and on settlements it actually reported',
  reports.reduce((n, r) => n + r.tasksHeld, 0) > 0 && reports.reduce((n, r) => n + r.settlementsSeen, 0) > 0,
  `${reports.reduce((n, r) => n + r.tasksHeld, 0)} tasks held, ${reports.reduce((n, r) => n + r.settlementsSeen, 0)} settlements seen`);

const CROSS_ROW_SUBJECTS = [
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
  'has a POOL',
  '`ROLES` declares, both ways',
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
  'every run this file makes is in the retention claim',
  'FOUR more runs than the row loop produces',
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
  'the types the registry holds, read as source text',
  'the pools the scheduler REPORTS are the bare pools plus one per type',
  'the two settings of the typed pair DIFFER',
  'under a policy the NODE does not declare',
  'the typed map instances received three DIFFERENT inputs',
  'deno.json exports the sub-path',
  'package.json exports `./scheduler`',
  'under a `scheduler/` directory of its own build',
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
 * **The pool registry, `ROLES` and `run()`'s arms are THREE lists saying the same
 * ten things *(nine until W58)*, and one of the three comparisons is recorded as costing zero** —
 * [W47](../doc/work-items/w47-the-blocked-flow-on-real-workers.md), and it is this
 * item's deliberate instantiation of `doc/workflow.md` section 5 rule 8 obligation
 * (e)'s **THIRD SHAPE** at v0.13: *a LIST is a claim about another list; find the
 * other list and compare BOTH WAYS.*
 *
 * `examples/workers/flow-worker.ts`'s own header says it: *"What is still bound to
 * nothing is `ROLES` -> the switch: adding `'zzz'` to `ROLES` with no arm and no pool
 * costs **zero**, at L6 and at typecheck."* W43 closed the other direction with a
 * **TYPE** — `pool`'s parameter is `Role`, so `pool('weighh', …)` is `TS2345` at
 * ladder L0 — and [Q196](../doc/open-questions.md) is the finding that **a type closes
 * one direction only.** This is the direction it cannot: a role declared and used by
 * nothing. **The THIRD pair is nobody's**: neither W43's Record nor Q196 says anything
 * about the registry against the documents' workerTypes, and this item is the first to
 * compare them. *(This paragraph read *"W43 recorded that two of the three comparisons
 * cost zero"* and *"nothing would have said so had W45 added only one"* — both false,
 * and both v0.7 change 4's case, a claim about another item read from somewhere other
 * than that item's own file. W47's conformity reader.)*
 *
 * **Measured before the clauses were written, and the measurement is the result:**
 * the pool registry declares **10** workerTypes and the 18 flow documents L6 runs
 * name exactly those **10**; the registry uses **9** distinct roles, `ROLES` declares
 * **9** and `run()` has **9** arms *(11 / 20 / 10 / 10 / 10 since W58 added `RetryWorker`, its
 * `retry` role and two flows — appended rather than rewritten, because the sentence is the
 * measurement W47 took)*; **all three pairs agree in both directions and no
 * defect is live.** So this is a bound with no live case, which is
 * [W25](../doc/work-items/w25-a-link-is-a-link-and-an-anchor-is-an-anchor.md)'s own
 * situation stated rather than dressed up: *a check written for a defect you just
 * fixed has no live case, so its probes are the whole of its evidence.* It is taken
 * because W45 added BOTH a role and a pool, and of the two ways that could have gone
 * wrong the pool-only one is `TS2345` at L0 and **the role-only one is silent** —
 * which is the asymmetry Q196 names.
 *
 * **Read as SOURCE TEXT rather than imported**, deliberately and for two reasons: the
 * pool registry is an object literal inside `buildScheduler` and is not a value any
 * module exports, and importing `flow-worker.ts` for `ROLES` would load a worker
 * module into the harness process. This is v0.12's own procedure for obligation (e)'s
 * second question — *read the default DECLARATION rather than running it* — and every
 * extraction **throws** when it finds nothing, because a regex that silently returns
 * `[]` makes a set equality pass on two empty sides.
 */
/** A manifest's text, relative to this file, in either runtime — W59's (2c) clause reads both. */
async function readManifest(rel: string): Promise<string> {
  const u = new URL(rel, import.meta.url);
  const deno = (globalThis as Record<string, unknown>).Deno as { readTextFile?: (x: URL) => Promise<string> } | undefined;
  return deno?.readTextFile ? await deno.readTextFile(u) : await (await import('node:fs/promises')).readFile(u, 'utf8');
}

async function workerListsAsync(): Promise<{
  poolTypes: string[];
  poolRoles: string[];
  declaredRoles: string[];
  switchArms: string[];
  /** The resource-group ids `buildScheduler` REGISTERS, read from the source — W58's second observer of `scheduler.groups`; since W59 the helper's `bootstrap(NODE_TYPES, {…})` groups too. */
  groupIds: string[];
  /** The keys of the `NODE_TYPES` literal, read from the source — W59's second observer of the registry the driver was handed. */
  typedPoolTypes: string[];
}> {
  const deno = (globalThis as Record<string, unknown>).Deno as
    { readTextFile?: (x: URL) => Promise<string> } | undefined;
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

  // ---- the pool registry: the object literal `buildScheduler` returns ----
  const rf = await read('./run-flow.ts');
  const at = rf.indexOf('return new FyflowScheduler({');
  if (at < 0) throw new Error('examples/run-flow.ts no longer returns a pool registry literal');
  const registry = [...rf.slice(at).matchAll(/^ {4}(\w+): pool\('(\w+)'/gm)];
  nonEmpty(registry, 'the pool registry');
  // ---- and the RESOURCE GROUPS the same constructor call registers, as source text — W58's
  // adequacy reader (c04b): `RunReport.schedulerGroups` is ONE reading of `scheduler.groups`
  // and the driver's `groups` option is derived from that same variable, so a literal in its
  // place hid a second registered group for zero. This is the other observer: the literal the
  // scheduler is BUILT from, which the runtime reading must agree with. ----
  // **Read over the whole of `buildScheduler` since W59, not the constructor call alone**: the
  // TYPES' group is registered through `bootstrap(NODE_TYPES, { … })` BEFORE the `return`, at the
  // same indentation, and the constructor call spreads the helper's result in. Anchored on the
  // function rather than the file so a group literal elsewhere would not be read as registered.
  const fnAt = rf.indexOf('export function buildScheduler(');
  if (fnAt < 0) throw new Error('examples/run-flow.ts no longer declares buildScheduler');
  const groupIds = nonEmpty([...rf.slice(fnAt).matchAll(/^ {4}(\w+): new ConcurrentLimitGroup\(/gm)].map((m) => m[1]!), 'the resource-group registry');
  // ---- and the NODE_TYPES literal: one key per type at two-space indentation inside it — W59.
  //      `bootstrap` keys a pool by each of these names, which is what `schedulerPools` must
  //      show beside the `pool()` lines. ----
  const ntAt = rf.indexOf('export const NODE_TYPES');
  if (ntAt < 0) throw new Error('examples/run-flow.ts no longer declares NODE_TYPES');
  const ntBlock = rf.slice(ntAt, rf.indexOf('\n};', ntAt));
  const typedPoolTypes = nonEmpty([...ntBlock.matchAll(/^ {2}(\w+): \{$/gm)].map((m) => m[1]!), 'the NODE_TYPES literal');
  // ---- and the ROLES those types run, from their `config: { role: '…' }` — the typed pool is
  //      not a `pool()` line, so without this the roles clause below read `typed` as a role
  //      `ROLES` declares and nothing uses (measured on this file's first run with the type). ----
  const typedRoles = nonEmpty([...ntBlock.matchAll(/config: \{ role: '(\w+)'/g)].map((m) => m[1]!), "the NODE_TYPES literal's roles");

  // ---- ROLES: comment lines dropped, because the block carries prose ----
  const wf = await read('./workers/flow-worker.ts');
  const rolesAt = wf.indexOf('export const ROLES = [');
  if (rolesAt < 0) throw new Error('examples/workers/flow-worker.ts no longer declares ROLES');
  const rolesBlock = wf.slice(rolesAt, wf.indexOf('] as const;', rolesAt))
    .split('\n').filter((l) => !l.trimStart().startsWith('//')).join('\n');
  const declaredRoles = nonEmpty([...rolesBlock.matchAll(/'(\w+)'/g)].map((m) => m[1]!), 'ROLES');
  // ---- and `run()`'s arms. One switch in that file, over `this.role`. ----
  const switchArms = nonEmpty([...wf.matchAll(/^ {6}case '(\w+)':/gm)].map((m) => m[1]!), "run()`s arms");

  return {
    groupIds: [...new Set(groupIds)].sort(),
    typedPoolTypes: [...new Set(typedPoolTypes)].sort(),
    poolTypes: [...new Set(registry.map((m) => m[1]!))].sort(),
    poolRoles: [...new Set([...registry.map((m) => m[2]!), ...typedRoles])].sort(),
    declaredRoles: [...new Set(declaredRoles)].sort(),
    switchArms: [...new Set(switchArms)].sort(),
  };
}
const WORKER_LISTS = await workerListsAsync();

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
 * in nobody's `Owns` — [Q121](../doc/open-questions.md)'s and
 * [Q126](../doc/open-questions.md)'s standing problem, and P8's own reason for
 * declining two checks — and because the claim is about `examples/**`, which is this
 * item's block. The regress it leaves is [Q213](../doc/open-questions.md): a check
 * inside the thing it checks is deletable with it, and what stands against that here
 * is `D6` (both rungs run THIS file) plus `DECLARED_TOTAL`.
 */
// **One path is EXEMPT since W59, by its full spelling: the sub-path's entry.** `fyflow-orchestration/scheduler`
// is a published export (both manifests carry it — P16 decision 5, ADR 0049 rule 5), so
// `../src/scheduler/index.ts` is what a consumer resolves the sub-path TO, and `run-flow.ts`
// imports the bootstrap helper through it exactly as `l6.ts` imports the driver through
// `../index.ts`. A file UNDER the sub-path — `bootstrap.ts`, `envelope-worker.ts` — is still an
// offender, and `REACH_CASES` carries one of each.
const REACHES_PAST_INDEX = /from\s+'(?:\.\.\/)+src\/(?!scheduler\/index\.ts')/;
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
];
async function examplesReachingPastIndexAsync(): Promise<
  { files: string[]; read: string[]; offenders: string[] }
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
  // either of these is.
  const files: string[] = [];
  for (const dir of ['./', './workers/']) {
    for (const name of await listDir(dir)) if (name.endsWith('.ts')) files.push(`${dir}${name}`);
  }
  if (files.length === 0) {
    throw new Error('the examples/ sweep listed no TypeScript at all, so the bound would be vacuous');
  }
  const offenders: string[] = [];
  // **`read` is what was actually OPENED, and it is a different list from `files`** —
  // the adequacy reader's finding 4b: narrowing this loop to `files.slice(1)` skipped
  // `l6.ts`, the one file the clause was written against, and the companion clause
  // below read the LISTING and passed. Both lists are returned and compared.
  const read: string[] = [];
  for (const f of files) {
    read.push(f);
    // `from '<any number of ../>src/...'` — the shape a shortcut takes whichever
    // directory it is written from.
    if (REACHES_PAST_INDEX.test(await readText(f))) offenders.push(f);
  }
  return { files, read, offenders };
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
  check('cross-row', 'L6 runs a flow containing every node kind the spec corpus expresses',
    [...kindsInCorpus].sort().filter((k) => !kindsAtL6.has(k)), []);
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
// **Row 1 — P4's exit artifact**, unchanged. [Q72](../doc/open-questions.md):
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
// [Q90](../doc/open-questions.md) is the row, and W19's Record recommends it be
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
 * [Q107](../doc/open-questions.md)'s `weekly-report`, which repeats the arity
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
    // **[Q107](../doc/open-questions.md), closed by W23.** The five entries around
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
    // **It is one character from [Q90](../doc/open-questions.md) and deliberately
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
    // [Q107](../doc/open-questions.md)'s sixth task falsified it in this item.
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
    // **`event` takes TWO values here since [Q107](../doc/open-questions.md), and
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
 * WITHOUT the rethrow — [Q104](../doc/open-questions.md): `check-docs`' `X4a` is
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
    { definition: FJ, policy: POLICIES['live-token'], runId: idA, payload: row.payloads[0], predicates, delayMs: 5 },
    { definition: FJ, policy: POLICIES['live-token'], runId: idB, payload: row.payloads[1], predicates, delayMs: 5 },
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
    check(row.key, `${who}: the join fired`, r.state.regions['split']?.joined, true);
    // From `spec/join-policy.md` section 2-3, not from output: `live-token` opens
    // two branches, both arrive, the count reaches zero having been positive.
    check(row.key, `${who}: both branches arrived`, r.state.regions['split']?.settled,
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
  // so the two orders coincided. [Q107](../doc/open-questions.md)'s sixth task
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
const pairRunCount = pairResults.reduce((n, { runs }) => n + runs.length, 0);
console.log(`\n  ladder L6 — ${reports.length + pairRunCount} real runs on fyflow-scheduler ${SCHEDULER_VERSION}, on ${runtime}\n`);
/**
 * **Every region of the run, in the row's declared order** — W23's conformity
 * reader, BLOCKING.
 *
 * The per-row ASSERTIONS were converted off the hard-coded `'split'`; this, the
 * table **a person reads**, was not. All four nested rows printed `-` for join
 * and branches, which is this renderer's spelling for *"the run entered no
 * region"* — so P7's exit artifact rendered as a region-free run in the one
 * artifact L7 exists for. That is [Q100](../doc/open-questions.md)'s open
 * question — *whether a formatting bug can make the table say something FALSE
 * rather than merely ugly* — answered **yes**, by the item that introduced it.
 *
 * A multi-region run prints each region's own answer, prefixed, because a
 * `0:arrived 1:lost` with no region name cannot be told from an inner one.
 */
const regionsOf = (r: RunReport, e: { regionId?: string | null; otherRegions?: Record<string, unknown> }) =>
  (e.regionId === null ? [] : [e.regionId ?? 'split', ...Object.keys(e.otherRegions ?? {})])
    .map((id) => [id, r.state.regions[id]] as const)
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
const PER_REGION_ROW = 21;
const PER_PLAIN_ROW = 19;
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
 * [Q202](../doc/open-questions.md)'s shape in the file that carries the count.
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
 */
const CROSS_ROW = 96;
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
   * rule 2 — the half [Q187](../doc/open-questions.md) was asked for — was
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
   * has to differ from the derived value or it changes nothing. **`FD-V5` is the
   * workerType rule** — *a `task`'s `workerType` is not a key in the scheduler's
   * `workerPools`* — and this block's first version cited `FD-V16`, which is the id
   * charset.
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

    const registry = {
      predicates: [...predicates.keys()],
      workerTypes: RIR.nodes.filter((n) => n.kind === 'task')
        .map((n) => (n as unknown as { workerType: string }).workerType),
    };
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
      const reg = {
        predicates: [...predicates.keys()],
        workerTypes: NM.nodes.filter((n) => n.kind === 'task')
          .map((n) => (n as unknown as { workerType: string }).workerType),
      };
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
   * limit rather than a repaired one** ([Q216](../doc/open-questions.md)). The second
   * observer v0.13 asks for would have to be a second DERIVATION of the same fact, and
   * the only one available is a second regex over the same text — *a sensor
   * corroborating itself*, which is what obligation (c)'s LIMIT names. What the block
   * does buy is measured and is not nothing: `'zzz'` in `ROLES` costs **2**, an arm
   * for a role nothing declares costs **1**, a pool no document names costs **1**, and
   * all three were **0** before it. [Q212](../doc/open-questions.md)'s shape — a proxy
   * bounded in one direction, recorded rather than dressed up.
   */
  {
    const documentTypes = new Set<string>();
    for (const e of EXPECTED) {
      for (const n of e.definition.nodes) {
        const wt = (n as unknown as { workerType?: string }).workerType;
        if (wt !== undefined) documentTypes.add(wt);
      }
    }
    check('cross-row', 'every workerType the flows L6 runs name has a POOL, and every pool is named ' +
      'by one of them — the registry is not a list bound to nothing',
      [...documentTypes].sort(), WORKER_LISTS.poolTypes);
    check('cross-row', 'and every role the registry uses is one `ROLES` declares, both ways — ' +
      'the direction W43`s TYPE cannot close (Q196)',
      WORKER_LISTS.poolRoles, WORKER_LISTS.declaredRoles);
    check('cross-row', 'and `run()` has an arm for every role `ROLES` declares, both ways — the ' +
      'comparison flow-worker.ts`s own header records as costing ZERO',
      WORKER_LISTS.switchArms, WORKER_LISTS.declaredRoles);

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
      for (const t of Object.values(NODE_TYPES)) for (const g of t.groups ?? []) named.add(g);
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
    //     read off `scheduler.workerPools` at construction) — which must be exactly the bare
    //     `pool()` lines plus one pool per type. A type the helper did not build a pool for, a
    //     pool no type and no `pool()` line accounts for, or a document naming a type the registry
    //     lacks, is red here; `FD-V32` refuses the last at construction and this is the rung
    //     that says the registry the driver checked is the scheduler the run used.
    {
      const namedTypes = new Set<string>();
      for (const e of EXPECTED) {
        for (const n of e.definition.nodes) {
          const t = (n as unknown as { type?: string }).type;
          if (t !== undefined) namedTypes.add(t);
        }
      }
      const registryTypes = Object.keys(NODE_TYPES).sort();
      check('cross-row', 'the node TYPES the L6 flows name are the types the registry holds, both ways — a type registered and used by nothing, or named and unregistered, is red',
        [...namedTypes].sort(), registryTypes);
      check('cross-row', 'and the types the registry holds, read as source text, are the ones the driver was handed — two readings of one literal',
        WORKER_LISTS.typedPoolTypes, registryTypes);
      const reported = [...new Set(reports.flatMap((r) => r.schedulerPools))].sort();
      check('cross-row', 'and the pools the scheduler REPORTS are the bare pools plus one per type, both ways — the helper built exactly one pool per registry entry, keyed by its name, and nothing else',
        reported, [...new Set([...WORKER_LISTS.poolTypes, ...WORKER_LISTS.typedPoolTypes])].sort());
      // **The discriminating PAIR is a claim** (rule 8's fourth requirement on the set): the two
      // typed nodes of `typed.flow.json` differ in BOTH settings keys, read from the DEFINITION
      // rather than from two literals in a row. Made equal, this is red before any worker runs.
      const pair = TY.nodes.filter((n) => (n as unknown as { type?: string }).type !== undefined)
        .map((n) => (n as unknown as { settings: { factor: number; failFirst: boolean } }).settings);
      assertThat('cross-row', 'the two settings of the typed pair DIFFER in both keys — whatever makes a discriminating pair differ is itself a claim',
        pair.length === 2 && pair[0]!.factor !== pair[1]!.factor && pair[0]!.failFirst !== pair[1]!.failFirst,
        `settings: ${JSON.stringify(pair)}`);
      // **The retry ran under the TYPE's policy and not the node's**: every row declaring a
      // non-zero `attempts` on a TYPED task names a node that declares NO `retryPolicy` of its own
      // — so the budget it spent came from `NODE_TYPES`, which is what the row is for, and a node
      // that quietly gained its own policy would pass the per-row number and fail here.
      const typedRetries = EXPECTED.flatMap((e) => Object.keys(e.attempts ?? {}).map((id) => {
        const node = e.definition.nodes.find((n) => n.id === id.split(':')[1]) as unknown as { type?: string; retryPolicy?: unknown } | undefined;
        return { id, typed: node?.type !== undefined, ownPolicy: node?.retryPolicy !== undefined };
      })).filter((x) => x.typed);
      assertThat('cross-row', 'every typed task that retried did so under a policy the NODE does not declare — the type`s — and there is at least one',
        typedRetries.length > 0 && typedRetries.every((x) => !x.ownPolicy),
        `typed retries: ${JSON.stringify(typedRetries)}`);
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
    check('cross-row', 'and the sweep OPENED exactly the files it listed, both ways',
      [...EXAMPLES_REACH.read].sort(), [...EXAMPLES_REACH.files].sort());
    assertThat('cross-row', 'and the listing reached both directories, naming the three files this ' +
      'block`s own extractions read',
      ['./l6.ts', './run-flow.ts', './workers/flow-worker.ts']
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
 * [Q214](../doc/open-questions.md)'s shape in a second mechanism — W47's was *a
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
      const opened = Object.values(r.state.regions ?? {})
        .map((v) => (v as { opened?: readonly string[] }).opened?.length ?? 0)
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
    check('cross-row', 'every run this file makes is in the retention claim, the pair rows included — ' +
      'two drivers on ONE scheduler each collected their own region and released it',
      pairRuns.map(([who, rep]) => `${who} ${rep.retention.peakEntries}/${rep.retention.endEntries}`),
      pairRuns.map(([who]) => `${who} ${pairArity}/0`));
    check('cross-row', 'and that is FOUR more runs than the row loop produces, so the claim covers ' +
      'every run rather than most of them',
      reports.length + pairRuns.length, EXPECTED.length + pairResults.reduce((n, { runs }) => n + runs.length, 0));
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
  ].sort();
  const anyRun = reports[0]!;
  check('cross-row', 'the byte measurement WALKS every growing structure the driver has and skips ' +
    'only the definition and the caller`s options — the two lists account for the driver`s own ' +
    'fields, both ways',
    [...anyRun.retention.walked, ...anyRun.retention.skipped].sort(), DRIVER_FIELDS);
  check('cross-row', 'and `arrivals` is on the WALKED side of that split, which is the one structure ' +
    'ADR 0046 rule 3 is about',
    { walked: anyRun.retention.walked.includes('arrivals'), skipped: anyRun.retention.skipped },
    { walked: true, skipped: ['def', 'graph', 'languages', 'nodeTypes', 'opts'] });
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
 * reader, and [Q100](../doc/open-questions.md) in a fifth file.
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
 * ([Q217](../doc/open-questions.md)) closed on this side of it.
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
const DECLARED_TOTAL = 1281;
if (passed + failures.length !== DECLARED_TOTAL) {
  failures.push(
    'gate\n      the assertion count is not the number this file declares outright\n' +
      `      declared: ${DECLARED_TOTAL}\n` +
      `      actual:   ${passed + failures.length}\n` +
      '      If you added or removed an assertion deliberately, update DECLARED_TOTAL.',
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
