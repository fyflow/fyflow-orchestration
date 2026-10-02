/**
 * The flow definitions the matrix runs on.
 *
 * Three come from `spec/examples/valid/` and are loaded, not copied — a matrix
 * that carried its own copy of a corpus flow could drift from the one L4
 * validates, and then the two rungs would be checking different things.
 *
 * **Two are W4-local, and that is a reported gap rather than a preference.** The
 * corpus cannot express either shape:
 *
 *   1. `matrix-optional-lost` — an `optional` branch node whose only edge is the
 *      default one. This is the ONLY way `branch.lost` is reached **by settling**
 *      rather than by a human resolving a suspended node: a non-optional task out
 *      of retries becomes `user_action`, not `failed`
 *      (`core/FyflowScheduler.ts:894-897` at 0.3.0), so a `failed`
 *      outcome record requires `optional: true`. `fanout-failure` has an optional
 *      node but gives it an `on: ["failed"]` edge, so that branch **exits**.
 *      Without this flow the settled-`failed` half of `JP-R4`'s `branch.lost` is
 *      unreachable and the row would have to be written from the resolution path
 *      twice.
 *   2. `matrix-six-events` — three branches, one of each terminal event, with a
 *      suspension and a resumption on the arriving one. `JP-R4` asks W4 for *"a
 *      matrix column that exercises every event"*, and no two-branch flow can
 *      carry three distinct terminal events.
 *   3. `matrix-two-regions` — **two sequential fan-outs sharing one `end` node.**
 *      Every other fixture in the repository has exactly one `fanout`. `FD-V15`
 *      refuses *nested* fan-out; sequential fan-out is legal, and a shared `end`
 *      is legal too because `end` nodes are exempt from `FD-V13`, `FD-V19` and
 *      `FD-V22`. See its own comment — this one was added by a reviewer's
 *      finding, not by the plan.
 *
 * Both are defined here rather than added to `spec/examples/`, because the corpus
 * is W1's and a spec change is its own change with its own rationale
 * (`spec/README.md` rule 1). They are still validated in full: `new Driver(...)`
 * runs `validateDefinition` on them before anything is queued, so a malformed one
 * throws `InvalidDefinition` rather than producing a quiet cell.
 *
 * **Line citations into the scheduler are into its REPOSITORY, not into
 * `node_modules`.** Since [ADR 0029](../../doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)
 * the npm package ships `dist/` and `AGENTS.md` and no TypeScript source, so
 * the file below is read at **github.com/fyflow/fyflow-scheduler** and the line
 * numbers are the ones measured at 0.3.0.
 */
import { readText, ROOT } from '../harness.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';

const EX = `${ROOT}spec/examples`;

export const registry = JSON.parse(await readText(`${EX}/registry.json`)) as {
  predicates: string[];
  workers: Record<string, { url: string }>;
  nodeTypes: Record<string, { worker: string }>;
  pools: Record<string, { type: string }>;
};

const corpus = async (name: string): Promise<FlowDefinition> =>
  JSON.parse(await readText(`${EX}/valid/${name}.flow.json`)) as FlowDefinition;

export const fanoutJoin: FlowDefinition = await corpus('fanout-join');
export const fanoutFailure: FlowDefinition = await corpus('fanout-failure');
export const p1RoutedAway: FlowDefinition = await corpus('p1-routed-away');

/**
 * `fanout-join` with one branch marked `optional`. The node then *settles*
 * `failed` instead of parking in `user_action`, and its only edge defaults to
 * `on: ["done"]` — so no edge is eligible and the branch is **lost inside the
 * region** without reaching an `end` node.
 */
export const optionalLost: FlowDefinition = {
  flowId: 'matrix-optional-lost',
  version: 1,
  entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
    { id: 'split', kind: 'fanout', branches: ['scoreA', 'scoreB'] },
    { id: 'scoreA', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
    { id: 'scoreB', kind: 'task', type: 'ScoreWorker', optional: true, edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};

/**
 * Three branches, one per terminal event, and the arriving one suspends and
 * resumes on the way. One run of this flow emits all six events of
 * `spec/join-policy.md` section 2.
 */
export const sixEvents: FlowDefinition = {
  flowId: 'matrix-six-events',
  version: 1,
  entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
    { id: 'split', kind: 'fanout', branches: ['lostA', 'exitB', 'arriveC'] },
    // optional + default-only edge: settles `failed`, nothing is eligible, lost.
    { id: 'lostA', kind: 'task', type: 'ScoreWorker', optional: true, edges: [{ to: 'collect' }] },
    {
      id: 'exitB',
      kind: 'task',
      type: 'ScoreWorker',
      edges: [{ when: { predicate: 'isLowConfidence' }, to: 'abandoned' }, { to: 'collect' }],
    },
    { id: 'arriveC', kind: 'task', type: 'ReviewWorker', edges: [{ to: 'collect' }] },
    { id: 'abandoned', kind: 'end', outcome: 'branch-abandoned' },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};

/**
 * **Two sequential fan-outs that share one `end` node** — the region shape
 * nothing in this repository covered, added by W4's test-adequacy pass rather
 * than by the plan.
 *
 * `src/driver/driver.ts` attributes a `branch.exited` to *the region the branch
 * was OPENED in*, not to the region containing the `end` node, and its comment
 * says why: attributing by node *"made the wrong join see a second terminal event
 * for a branch that had already arrived, breaking JP-R5"*. **That regression had
 * no test.** Reverting it here does not throw and does not report a failure — the
 * second join simply never fires and the run stops, which is the silent hang
 * [ADR 0003](../../doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)
 * claims is now attributable.
 *
 * The shape is legal on purpose. `end` nodes are exempt from `FD-V13`, `FD-V19`
 * and `FD-V22` (`spec/flow-definition.md` section 3), and `FD-V15` refuses only
 * **nested** fan-out — so `shared` sits in `region(split1)` **and**
 * `region(split2)`, and a driver resolving it by node id cannot tell which.
 *
 * `a2` carries a decision edge that is never taken (`isHighConfidence` is `false`
 * in this scenario) purely to put `shared` inside region 1's member set. Without
 * that edge the ambiguity does not exist and the flow proves nothing.
 *
 * Whether `spec/` should refuse this shape, support it explicitly, or leave it as
 * it is, is [Q45](../../doc/open-questions.md).
 */
export const twoRegions: FlowDefinition = {
  flowId: 'matrix-two-regions',
  version: 1,
  entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split1' }] },
    { id: 'split1', kind: 'fanout', branches: ['a1', 'a2'] },
    { id: 'a1', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect1' }] },
    {
      id: 'a2',
      kind: 'task',
      type: 'ScoreWorker',
      edges: [{ when: { predicate: 'isHighConfidence' }, to: 'shared' }, { to: 'collect1' }],
    },
    { id: 'collect1', kind: 'join', of: 'split1', edges: [{ to: 'mid' }] },
    { id: 'mid', kind: 'task', type: 'MergeWorker', edges: [{ to: 'split2' }] },
    { id: 'split2', kind: 'fanout', branches: ['b1', 'b2'] },
    { id: 'b1', kind: 'task', type: 'ReviewWorker', edges: [{ to: 'collect2' }] },
    {
      id: 'b2',
      kind: 'task',
      type: 'ReviewWorker',
      edges: [{ when: { predicate: 'isLowConfidence' }, to: 'shared' }, { to: 'collect2' }],
    },
    { id: 'shared', kind: 'end', outcome: 'branch-abandoned' },
    { id: 'collect2', kind: 'join', of: 'split2', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};

/**
 * **The nested shapes — W22, and there are three flows behind four rows.**
 *
 * `spec/examples/valid/nested-fanout.flow.json` exists and is NOT used, which is
 * a measured reason rather than a preference: its `outerJoin` routes to an `end`,
 * so **nothing is dispatched when the outer join fires** and a `Scenario` has no
 * `downstream` task id to read. A matrix row's whole definition of *the join
 * fired* is *this id reached `addTask`*.
 *
 * They are matrix-local for the same reason `matrix-optional-lost` is: the corpus
 * is W1's and a spec change is its own change with its own rationale
 * (`spec/README.md` rule 1). They are still validated in full — `new Driver(...)`
 * runs `validateDefinition` before anything is queued.
 *
 * **The shape is one shape.** `outer` fans out to `scoreA` and `scoreB`; `scoreB`
 * enters `inner`; `innerJoin` routes to `outerJoin`; `outerJoin` routes to
 * `publish`. So `region(inner)` is wholly inside `region(outer)`'s branch 1,
 * which is what `FD-V19` and `FD-V22` require and what makes `branchPath` a
 * property of the node (`spec/task-id.md` section 1). The three differ only in
 * how the INNER branches finish, because that is the only place a depth-2 row can
 * say anything a depth-1 row does not.
 */
const nestedNodes = (
  scoreC: FlowDefinition['nodes'][number],
  scoreD: FlowDefinition['nodes'][number],
  extra: FlowDefinition['nodes'] = [],
): FlowDefinition['nodes'] => [
  { id: 'outer', kind: 'fanout', branches: ['scoreA', 'scoreB'] },
  { id: 'scoreA', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'outerJoin' }] },
  { id: 'scoreB', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'inner' }] },
  { id: 'inner', kind: 'fanout', branches: ['scoreC', 'scoreD'] },
  scoreC,
  scoreD,
  ...extra,
  { id: 'innerJoin', kind: 'join', of: 'inner', edges: [{ to: 'outerJoin' }] },
  { id: 'outerJoin', kind: 'join', of: 'outer', edges: [{ to: 'publish' }] },
  { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
  { id: 'done', kind: 'end', outcome: 'completed' },
];

/** Every branch at both depths reaches its join — the depth-2 control row. */
export const nested: FlowDefinition = {
  flowId: 'matrix-nested',
  version: 1,
  entry: 'outer',
  nodes: nestedNodes(
    { id: 'scoreC', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'innerJoin' }] },
    { id: 'scoreD', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'innerJoin' }] },
  ),
};

/**
 * `matrix-optional-lost` one level down: `scoreD` is `optional` and its only edge
 * is the default one, so settling `failed` ends the path **inside** `region(inner)`
 * with no edge eligible. The same reasoning as that flow's — this is the only road
 * to a settled `branch.lost`.
 */
export const nestedLost: FlowDefinition = {
  flowId: 'matrix-nested-lost',
  version: 1,
  entry: 'outer',
  nodes: nestedNodes(
    { id: 'scoreC', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'innerJoin' }] },
    { id: 'scoreD', kind: 'task', type: 'ScoreWorker', optional: true, edges: [{ to: 'innerJoin' }] },
  ),
};

/**
 * **Two rows share this one**, and the predicate is what separates them: BOTH
 * inner branches carry a decision edge to an `end` inside `region(inner)`, and
 * `isLowConfidence` reads the settlement's own `result`. So `nested-inner-exit`
 * bails one branch and `nested-inner-all-exit` bails both, **on the same
 * definition** — which is how a real flow reaches both, and which stops the
 * all-exit row being a differently-shaped graph whose result could be blamed on
 * the shape.
 */
export const nestedExit: FlowDefinition = {
  flowId: 'matrix-nested-exit',
  version: 1,
  entry: 'outer',
  nodes: nestedNodes(
    { id: 'scoreC', kind: 'task', type: 'ScoreWorker',
      edges: [{ when: { predicate: 'isLowConfidence' }, to: 'abandoned' }, { to: 'innerJoin' }] },
    { id: 'scoreD', kind: 'task', type: 'ScoreWorker',
      edges: [{ when: { predicate: 'isLowConfidence' }, to: 'abandoned' }, { to: 'innerJoin' }] },
    [{ id: 'abandoned', kind: 'end', outcome: 'branch-abandoned' }],
  ),
};

/**
 * **`matrix-map` — the matrix's first `map` region, and P10's Scope item 4.**
 * [W34](../../doc/work-items/w34-what-a-branch-receives-and-what-a-join-carries.md).
 *
 * **A map is a ROW question here and not a column one**, which was W34's written
 * prediction 3 and is confirmed by what this file needed: a column is a **policy**
 * (`MATRIX_COLUMNS`), and a map is not a policy. W33 measured that after
 * `arrival-count`'s re-sourcing **not one shipped policy reads its `Region` at
 * all**, so nothing about a map changes what a column is; what it changes is the
 * event stream a column is fed. So the four existing columns run unchanged over
 * new rows.
 *
 * **Why the matrix needs a map row at all, given W33 asserted the policies
 * directly.** `arrival-count`'s `N` is counted from `branch.opened` since
 * `spec/join-policy.md` v0.12, and **on every static region the counted N and the
 * declared N agree** — that is exactly why all 52 cells were unmoved by that
 * change. A `map` region is the only place they can differ, so it is the only
 * input under which the re-sourcing is a claim rather than an identity. Until this
 * row the L5 rung ran the re-sourced policy on inputs that could not tell.
 *
 * `over` is `items`, so the arity is whatever `ingest` settles with — which makes
 * one definition carry N = 3 and N = 0 without a second graph, the property
 * `FD-V9`'s floor denies a `fanout`.
 */
export const mapRegion: FlowDefinition = {
  flowId: 'matrix-map',
  version: 1,
  entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'per' }] },
    { id: 'per', kind: 'map', over: 'items', branch: 'score' },
    { id: 'score', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'per', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ] as unknown as FlowDefinition['nodes'],
};

/**
 * **The same region with a decision inside the mapped branch** — P1's case at an
 * arity nothing declared. `isLowConfidence` reads the settlement's own `result`,
 * so ONE definition gives *some items routed away* and *every item routed away*
 * depending only on what the fixture settles, which is the same trick
 * `nestedExit` uses and for the same reason: the all-exit row must not be a
 * differently-shaped graph whose result could be blamed on the shape.
 */
export const mapRoutedAway: FlowDefinition = {
  flowId: 'matrix-map-routed-away',
  version: 1,
  entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'per' }] },
    { id: 'per', kind: 'map', over: 'items', branch: 'score' },
    { id: 'score', kind: 'task', type: 'ScoreWorker',
      edges: [{ when: { predicate: 'isLowConfidence' }, to: 'abandoned' }, { to: 'collect' }] },
    { id: 'abandoned', kind: 'end', outcome: 'branch-abandoned' },
    { id: 'collect', kind: 'join', of: 'per', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ] as unknown as FlowDefinition['nodes'],
};

/**
 * **A mapped branch that is `optional` with no failure edge** — the only road to a
 * settled `branch.lost` inside a map region, for the same reason
 * `matrix-optional-lost` is the only road at depth 1: a non-optional task out of
 * retries becomes `user_action`, not `failed`.
 */
export const mapLost: FlowDefinition = {
  flowId: 'matrix-map-lost',
  version: 1,
  entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'per' }] },
    { id: 'per', kind: 'map', over: 'items', branch: 'score' },
    { id: 'score', kind: 'task', type: 'ScoreWorker', optional: true, edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'per', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ] as unknown as FlowDefinition['nodes'],
};
