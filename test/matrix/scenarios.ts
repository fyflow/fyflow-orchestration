/**
 * The matrix's rows — every way a branch can finish, as
 * `spec/join-policy.md` section 2 reduced them.
 *
 * **Q5 names four cases and section 2 shows they are three events, with two of
 * the four being one.** The rows below keep all four *situations* even where two
 * produce the same event, because the point of the `optional-null` row is to make
 * that collapse visible rather than to assume it: an `optional` node settling and
 * a human resolving `failed` are the same two lines of the same branch upstream
 * (`../fyflow-scheduler/core/FyflowScheduler.ts:894-897`), and `resolve(null)` is
 * invisible to a listener.
 *
 * A row is INPUT only. What each policy does with it is the cell, and the cell's
 * expected value is written by hand in `matrix.test.ts`.
 */
import type { Scenario } from './run.ts';
import { fanoutFailure, fanoutJoin, optionalLost, p1RoutedAway, sixEvents } from './flows.ts';

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
    steps: [
      { do: 'settle', taskId: INGEST, state: 'done' },
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
