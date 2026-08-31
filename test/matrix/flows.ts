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
  workerTypes: string[];
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
    { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'split' }] },
    { id: 'split', kind: 'fanout', branches: ['scoreA', 'scoreB'] },
    { id: 'scoreA', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'collect' }] },
    { id: 'scoreB', kind: 'task', workerType: 'ScoreWorker', optional: true, edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', workerType: 'PublishWorker', edges: [{ to: 'done' }] },
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
    { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'split' }] },
    { id: 'split', kind: 'fanout', branches: ['lostA', 'exitB', 'arriveC'] },
    // optional + default-only edge: settles `failed`, nothing is eligible, lost.
    { id: 'lostA', kind: 'task', workerType: 'ScoreWorker', optional: true, edges: [{ to: 'collect' }] },
    {
      id: 'exitB',
      kind: 'task',
      workerType: 'ScoreWorker',
      edges: [{ when: 'isLowConfidence', to: 'abandoned' }, { to: 'collect' }],
    },
    { id: 'arriveC', kind: 'task', workerType: 'ReviewWorker', edges: [{ to: 'collect' }] },
    { id: 'abandoned', kind: 'end', outcome: 'branch-abandoned' },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', workerType: 'PublishWorker', edges: [{ to: 'done' }] },
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
    { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'split1' }] },
    { id: 'split1', kind: 'fanout', branches: ['a1', 'a2'] },
    { id: 'a1', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'collect1' }] },
    {
      id: 'a2',
      kind: 'task',
      workerType: 'ScoreWorker',
      edges: [{ when: 'isHighConfidence', to: 'shared' }, { to: 'collect1' }],
    },
    { id: 'collect1', kind: 'join', of: 'split1', edges: [{ to: 'mid' }] },
    { id: 'mid', kind: 'task', workerType: 'MergeWorker', edges: [{ to: 'split2' }] },
    { id: 'split2', kind: 'fanout', branches: ['b1', 'b2'] },
    { id: 'b1', kind: 'task', workerType: 'ReviewWorker', edges: [{ to: 'collect2' }] },
    {
      id: 'b2',
      kind: 'task',
      workerType: 'ReviewWorker',
      edges: [{ when: 'isLowConfidence', to: 'shared' }, { to: 'collect2' }],
    },
    { id: 'shared', kind: 'end', outcome: 'branch-abandoned' },
    { id: 'collect2', kind: 'join', of: 'split2', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', workerType: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
};
