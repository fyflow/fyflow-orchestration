/**
 * The matrix's rows — every way a branch can finish, as
 * `spec/join-policy.md` section 2 reduced them.
 *
 * **Q5 names four cases and section 2 shows they are three events, with two of
 * the four being one.** The rows below keep all four *situations* even where two
 * produce the same event, because the point of the `optional-null` row is to make
 * that collapse visible rather than to assume it: an `optional` node settling and
 * a human resolving `failed` are the same two lines of the same branch upstream
 * (`core/FyflowScheduler.ts:894-897` at 0.3.0), and `resolve(null)` is
 * invisible to a listener.
 *
 * A row is INPUT only. What each policy does with it is the cell, and the cell's
 * expected value is written by hand in `matrix.test.ts`.
 *
 * **Line citations into the scheduler are into its REPOSITORY, not into
 * `node_modules`.** Since [ADR 0029](../../doc/decisions/0029-the-scheduler-is-a-registry-dependency-and-nothing-reaches-the-working-tree.md)
 * the npm package ships `dist/` and `AGENTS.md` and no TypeScript source, so
 * the file below is read at **github.com/fyflow/fyflow-scheduler** and the line
 * numbers are the ones measured at 0.3.0.
 */
import type { Scenario } from './run.ts';
import {
  fanoutFailure, fanoutJoin, nested, nestedExit, nestedLost, optionalLost, p1RoutedAway,
  sixEvents, twoRegions,
} from './flows.ts';

const bail = { isLowConfidence: () => true };

const INGEST = 'r1:ingest:-:0';
const PUBLISH = 'r1:publish:-:0';

export const SCENARIOS: Scenario[] = [
  {
    key: 'all-arrive',
    title: 'both branches succeed and reach the join',
    flow: fanoutJoin,
    fanoutId: 'split',
    downstream: PUBLISH,
    // `ingest` carries a result **on this row only**, so the matrix has one place
    // where an ordinary edge is seen forwarding a payload. Without it every
    // payload in every cell is `null` and the join's `null` cannot be told apart
    // from a harness that reports `null` unconditionally.
    steps: [
      { do: 'settle', taskId: INGEST, state: 'done', result: { from: 'ingest' } },
      { do: 'settle', taskId: 'r1:scoreA:0:0', state: 'done' },
      { do: 'settle', taskId: 'r1:scoreB:1:0', state: 'done' },
    ],
  },
  {
    key: 'routed-away',
    title: "P1's case — a decision inside a branch sends it to an `end`",
    flow: p1RoutedAway,
    fanoutId: 'split',
    downstream: PUBLISH,
    predicates: bail,
    steps: [
      { do: 'settle', taskId: INGEST, state: 'done' },
      { do: 'settle', taskId: 'r1:scoreA:0:0', state: 'done' },
      { do: 'settle', taskId: 'r1:scoreB:1:0', state: 'done', result: { confidence: 0.1 } },
    ],
  },
  {
    key: 'lost-settled',
    title: 'an `optional` branch settles `failed` and no edge opts in',
    flow: optionalLost,
    fanoutId: 'split',
    downstream: PUBLISH,
    steps: [
      { do: 'settle', taskId: INGEST, state: 'done' },
      { do: 'settle', taskId: 'r1:scoreA:0:0', state: 'done' },
      { do: 'settle', taskId: 'r1:scoreB:1:0', state: 'failed' },
    ],
  },
  {
    key: 'lost-resolved',
    title: 'a human resolves a suspended branch `failed` and no edge opts in',
    flow: fanoutJoin,
    fanoutId: 'split',
    downstream: PUBLISH,
    steps: [
      { do: 'settle', taskId: INGEST, state: 'done' },
      { do: 'settle', taskId: 'r1:scoreA:0:0', state: 'done' },
      { do: 'settle', taskId: 'r1:scoreB:1:0', state: 'user_action' },
      { do: 'resolve', taskId: 'r1:scoreB:1:0', resolvedAs: 'failed' },
    ],
  },
  {
    key: 'optional-null',
    title: 'an `optional` branch fails WITH an `on:["failed"]` edge, so it exits',
    flow: fanoutFailure,
    fanoutId: 'split',
    downstream: PUBLISH,
    steps: [
      { do: 'settle', taskId: INGEST, state: 'done' },
      { do: 'settle', taskId: 'r1:scoreA:0:0', state: 'failed' },
      { do: 'settle', taskId: 'r1:reviewB:1:0', state: 'done' },
    ],
  },
  {
    key: 'suspended',
    title: 'a branch is parked on a person and nobody has acted yet',
    flow: fanoutJoin,
    fanoutId: 'split',
    downstream: PUBLISH,
    steps: [
      { do: 'settle', taskId: INGEST, state: 'done' },
      { do: 'settle', taskId: 'r1:scoreA:0:0', state: 'done' },
      { do: 'settle', taskId: 'r1:scoreB:1:0', state: 'user_action' },
    ],
  },
  {
    key: 'resumed',
    title: 'a suspended branch is resolved `done` and then arrives',
    flow: fanoutJoin,
    fanoutId: 'split',
    downstream: PUBLISH,
    steps: [
      { do: 'settle', taskId: INGEST, state: 'done' },
      { do: 'settle', taskId: 'r1:scoreA:0:0', state: 'done' },
      { do: 'settle', taskId: 'r1:scoreB:1:0', state: 'user_action' },
      { do: 'resolve', taskId: 'r1:scoreB:1:0', resolvedAs: 'done' },
    ],
  },
  {
    key: 'all-exit',
    title: 'every branch reaches an `end` and NOTHING arrives at the join',
    flow: fanoutFailure,
    fanoutId: 'split',
    downstream: PUBLISH,
    steps: [
      { do: 'settle', taskId: INGEST, state: 'done' },
      { do: 'settle', taskId: 'r1:scoreA:0:0', state: 'failed' },
      { do: 'settle', taskId: 'r1:reviewB:1:0', state: 'user_action' },
      { do: 'resolve', taskId: 'r1:reviewB:1:0', resolvedAs: 'failed' },
    ],
  },
  {
    key: 'six-events',
    title: 'one branch lost, one exited, one suspended-resumed-arrived',
    flow: sixEvents,
    fanoutId: 'split',
    downstream: PUBLISH,
    predicates: bail,
    steps: [
      { do: 'settle', taskId: INGEST, state: 'done' },
      { do: 'settle', taskId: 'r1:lostA:0:0', state: 'failed' },
      { do: 'settle', taskId: 'r1:exitB:1:0', state: 'done' },
      { do: 'settle', taskId: 'r1:arriveC:2:0', state: 'user_action' },
      { do: 'resolve', taskId: 'r1:arriveC:2:0', resolvedAs: 'done' },
    ],
  },
];

/**
 * **Not one of `SCENARIOS`, deliberately.** The nine rows above are Q5's cases,
 * and [ADR 0003](../../doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)
 * counts them; a region *shape* is a different axis and adding it to that list
 * would silently restate the ADR's arithmetic.
 *
 * Region 1 all-arrives under **both** policies, so both reach region 2 and the
 * row is a real two-column cell rather than a live-token-only one. Region 2 then
 * runs P1's case. `shared` is reachable from `a2` and from `b2`, so it belongs to
 * both regions and a driver resolving it by node id cannot tell them apart.
 */
export const TWO_REGIONS: Scenario = {
  key: 'two-regions',
  title: 'two sequential fan-outs sharing one `end` node',
  flow: twoRegions,
  fanoutId: 'split2',
  downstream: PUBLISH,
  // `isHighConfidence` is false, so `a2` does NOT take its edge to `shared` and
  // region 1 all-arrives. `isLowConfidence` is true, so `b2` does.
  predicates: { isHighConfidence: () => false, isLowConfidence: () => true },
  steps: [
    { do: 'settle', taskId: INGEST, state: 'done' },
    { do: 'settle', taskId: 'r1:a1:0:0', state: 'done' },
    { do: 'settle', taskId: 'r1:a2:1:0', state: 'done' },
    { do: 'settle', taskId: 'r1:mid:-:0', state: 'done' },
    { do: 'settle', taskId: 'r1:b1:0:0', state: 'done' },
    { do: 'settle', taskId: 'r1:b2:1:0', state: 'done' },
  ],
};

/**
 * **The depth-2 rows — W22, and they are NOT in `SCENARIOS`.** Same reasoning as
 * `TWO_REGIONS` above: the nine are Q5's cases and
 * [ADR 0003](../../doc/decisions/0003-a-join-is-satisfied-when-its-region-has-no-live-branches.md)
 * counts them, so appending here would silently restate that ADR's arithmetic.
 * Depth is a different axis, and
 * [ADR 0030](../../doc/decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md)
 * counts these four.
 *
 * **Each row is a depth-1 row one level down**, and the pairing is the claim:
 *
 * | | its inner region is | ≡ |
 * |---|---|---|
 * | `nested-all-arrive` | both inner branches arrive | `all-arrive` |
 * | `nested-inner-lost` | an `optional` inner branch settles `failed` | `lost-settled` |
 * | `nested-inner-exit` | one inner branch routes to an `end` | `routed-away` |
 * | `nested-inner-all-exit` | BOTH inner branches route away | `all-exit` |
 *
 * **`regions` names both joins**, because `Cell.status` is the row's declared
 * `fanoutId`'s and every one of these rows is about what the INNER join did and
 * what that did to the outer branch.
 *
 * **The last two share one flow and differ only in which settlements carry
 * `{ bail: true }`**, so the all-exit row cannot be blamed on a differently
 * shaped graph.
 */
const NESTED_A = 'r1:scoreA:0:0';
const NESTED_B = 'r1:scoreB:1:0';
const NESTED_C = 'r1:scoreC:1.0:0';
const NESTED_D = 'r1:scoreD:1.1:0';

/** Reads the settlement's own `result`, so one flow serves both exit rows. */
const bailOnResult = {
  isLowConfidence: (ctx: { outcome: { result: unknown } }) =>
    (ctx.outcome.result as { bail?: boolean } | null)?.bail === true,
};

export const NESTED_SCENARIOS: Scenario[] = [
  {
    key: 'nested-all-arrive',
    title: 'every branch at both depths reaches its join',
    flow: nested,
    fanoutId: 'outer',
    regions: ['outer', 'inner'],
    downstream: PUBLISH,
    steps: [
      { do: 'settle', taskId: NESTED_A, state: 'done' },
      { do: 'settle', taskId: NESTED_B, state: 'done' },
      { do: 'settle', taskId: NESTED_C, state: 'done' },
      { do: 'settle', taskId: NESTED_D, state: 'done' },
    ],
  },
  {
    key: 'nested-inner-lost',
    title: 'an `optional` INNER branch settles `failed` and no edge opts in',
    flow: nestedLost,
    fanoutId: 'outer',
    regions: ['outer', 'inner'],
    downstream: PUBLISH,
    steps: [
      { do: 'settle', taskId: NESTED_A, state: 'done' },
      { do: 'settle', taskId: NESTED_B, state: 'done' },
      { do: 'settle', taskId: NESTED_C, state: 'done' },
      { do: 'settle', taskId: NESTED_D, state: 'failed' },
    ],
  },
  {
    key: 'nested-inner-exit',
    title: "P1's case one level down — an INNER branch reaches an `end`",
    flow: nestedExit,
    fanoutId: 'outer',
    regions: ['outer', 'inner'],
    downstream: PUBLISH,
    predicates: bailOnResult,
    steps: [
      { do: 'settle', taskId: NESTED_A, state: 'done' },
      { do: 'settle', taskId: NESTED_B, state: 'done' },
      { do: 'settle', taskId: NESTED_C, state: 'done' },
      { do: 'settle', taskId: NESTED_D, state: 'done', result: { bail: true } },
    ],
  },
  {
    key: 'nested-inner-all-exit',
    title: 'EVERY inner branch reaches an `end`, so the inner join is reached by nothing',
    flow: nestedExit,
    fanoutId: 'outer',
    regions: ['outer', 'inner'],
    downstream: PUBLISH,
    predicates: bailOnResult,
    steps: [
      { do: 'settle', taskId: NESTED_A, state: 'done' },
      { do: 'settle', taskId: NESTED_B, state: 'done' },
      { do: 'settle', taskId: NESTED_C, state: 'done', result: { bail: true } },
      { do: 'settle', taskId: NESTED_D, state: 'done', result: { bail: true } },
    ],
  },
];
