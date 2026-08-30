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
 *      (`../fyflow-scheduler/core/FyflowScheduler.ts:894-897`), so a `failed`
 *      outcome record requires `optional: true`. `fanout-failure` has an optional
 *      node but gives it an `on: ["failed"]` edge, so that branch **exits**.
 *      Without this flow the settled-`failed` half of `JP-R4`'s `branch.lost` is
 *      unreachable and the row would have to be written from the resolution path
 *      twice.
 *   2. `matrix-six-events` — three branches, one of each terminal event, with a
 *      suspension and a resumption on the arriving one. `JP-R4` asks W4 for *"a
 *      matrix column that exercises every event"*, and no two-branch flow can
 *      carry three distinct terminal events.
 *
 * Both are defined here rather than added to `spec/examples/`, because the corpus
 * is W1's and a spec change is its own change with its own rationale
 * (`spec/README.md` rule 1). They are still validated in full: `new Driver(...)`
 * runs `validateDefinition` on them before anything is queued, so a malformed one
 * throws `InvalidDefinition` rather than producing a quiet cell.
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
