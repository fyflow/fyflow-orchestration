/**
 * Ladder L1 and L3 — **a cancelled task in the FOLD**: `spec/run-state.md` section 3's seventh outcome and
 * section 4's fifth node state, `RN-R28`,
 * [ADR 0094](../../doc/decisions/0094-a-cancelled-task-is-a-terminal-state-that-routes-no-edge-and-ends-its-run-cancelled.md),
 * [W158](../../doc/work-items/w158-cancelled-is-a-library-state-and-a-run-outcome.md).
 *
 * **Every input sequence here is hand-written from the spec** — no driver produced any of it — and every
 * expected outcome is read off section 3's table, highest-ranked match first:
 *
 *   halted > cancelled > awaiting_action > running > stuck > failed > completed
 *
 * **The rule RANKS, so each case puts `cancelled` beside exactly one neighbour and asserts the neighbour
 * ALONE first** (`doc/workflow.md` section 5 rule 8 (a), *where it selects*): a fold that ranked `cancelled`
 * anywhere else in the chain reads one of these pairs as the neighbour, and a fold that ignored the state reads
 * every pair as the neighbour.
 */
import { equal, ok, suite } from '../harness.ts';
import { fold, isTerminal, step, emptyState, type FoldInput, type RunOutcome } from '../../src/fold/run-state.ts';
import type { RoutableState, TerminalState } from '../../src/definition/types.ts';

/**
 * **`RoutableState` is NOT widened — pinned at the TYPE level** (ADR 0094 rule 1, W158's adequacy reader F5). An
 * edge may opt into `done` and `failed` only; `FD-V18` refuses the rest at run time, and these lines make widening
 * the type itself fail `tsc -p tsconfig.json` (`typecheck:tests`): an unused `@ts-expect-error` is an error.
 */
const routable: RoutableState[] = ['done', 'failed'];
// @ts-expect-error — `cancelled` is a terminal state and NOT a routable one: a cancel routes no edge.
const notRoutableCancelled: RoutableState = 'cancelled';
// @ts-expect-error — `user_action` suspends and routes no edge (FD-V18, ADR 0004 rule 3).
const notRoutableParked: RoutableState = 'user_action';
void routable; void notRoutableCancelled; void notRoutableParked;

const settled = (taskId: string, state: TerminalState): FoldInput => ({
  kind: 'outcome',
  record: {
    kind: 'outcome', taskId, terminalState: state, result: state === 'done' ? { v: taskId } : null, error: null,
    attempts: 0, schedulerTimestamp: 1, observedAt: 1, startTime: 1, endTime: 2, executionTime: 1,
  },
});
const dispatched = (taskId: string): FoldInput => ({ kind: 'dispatched', taskId });
const ended = (reason: 'end' | 'no-eligible-edge', at = 'x'): FoldInput => ({ kind: 'pathEnded', reason, at });
const opened = (b: string): FoldInput =>
  ({ kind: 'region', event: { type: 'branch.opened', regionId: 'split', regionPath: '-', branchPath: b } });
const halt: FoldInput = { kind: 'halted', reason: 'DuplicateTaskId: x' };

/** A cancelled task, dispatched and settled — the two inputs a driver appends for one. */
const CANCEL: FoldInput[] = [dispatched('r1:c:-:0'), settled('r1:c:-:0', 'cancelled')];

/**
 * Each neighbour of `cancelled` in the chain, as a sequence that folds to that neighbour ALONE. Appending
 * `CANCEL` to the ones ranked below `cancelled` must give `cancelled`; to the one above it, the neighbour.
 */
const NEIGHBOURS: [RunOutcome, FoldInput[]][] = [
  ['completed', [dispatched('r1:a:-:0'), settled('r1:a:-:0', 'done'), ended('end')]],
  ['failed', [dispatched('r1:a:-:0'), settled('r1:a:-:0', 'done'), ended('no-eligible-edge')]],
  // A region that OPENED two branches and whose join never settled: `stuck` once nothing is live (RN-R10).
  ['stuck', [{ kind: 'regionEntered', regionId: 'split', regionPath: '-' }, opened('0'), opened('1'),
    dispatched('r1:a:0:0'), settled('r1:a:0:0', 'done'), ended('end'),
    { kind: 'joinSettled', regionId: 'split', regionPath: '-', joinId: 'collect', fired: false }]],
  ['running', [dispatched('r1:a:-:0')]],
  ['awaiting_action', [dispatched('r1:a:-:0'), settled('r1:a:-:0', 'user_action')]],
];

suite('L1 — a cancelled settlement folds to a cancelled NODE, verbatim (spec/run-state.md section 4)', (test) => {
  test('the node is `cancelled`, carrying the record`s result and error, and the run is `cancelled`', () => {
    const s = fold(CANCEL);
    equal(s.nodes['r1:c:-:0'], { nodeId: 'c', branchPath: '-', state: 'cancelled', result: null, error: null },
      'the state is COPIED from the record (OR-R3, ADR 0007 rule 2), as `done` and `failed` are — not `failed`, not `suspended`');
    equal(s.outcome, 'cancelled', 'and the run`s outcome is the seventh, `cancelled` (RN-R28)');
    equal(s.haltedBy, null, 'with no `halted` element in the sequence, nothing names a refusal: a cancel is not a halt');
  });

  test('`cancelled` is TERMINAL — `isTerminal` and `done` read it as over (RN-R12)', () => {
    ok(isTerminal(fold(CANCEL)), 'a cancelled run is terminal, so `done` settles on it');
    // The CONTROL: the same task dispatched and not yet settled is `running`, which is not terminal.
    ok(!isTerminal(fold([dispatched('r1:c:-:0')])), 'the control: before the cancel settles, the run is running and NOT terminal');
  });

  test('a task STILL IN FLIGHT when the cancel lands does not hold the run `running`', () => {
    const s = fold([dispatched('r1:a:0:0'), dispatched('r1:b:1:0'), settled('r1:a:0:0', 'cancelled')]);
    equal([s.nodes['r1:b:1:0']?.state, s.outcome], ['running', 'cancelled'],
      'the in-flight node stays `running` in `nodes` and the run is `cancelled` — the driver has halted it, and what is in flight settles routed nowhere');
    const after = step(s, settled('r1:b:1:0', 'done'));
    equal([after.nodes['r1:b:1:0']?.state, after.outcome], ['done', 'cancelled'],
      'and when it settles it is folded into `nodes`, while the outcome stays `cancelled`');
  });
});

suite('L1 — RN-R28: `cancelled` ranks below `halted` and above every other outcome', (test) => {
  for (const [neighbour, seq] of NEIGHBOURS) {
    test(`above \`${neighbour}\`: the neighbour alone, then with a cancel, in both orders`, () => {
      equal(fold(seq).outcome, neighbour, `the ARRANGEMENT: this sequence folds to \`${neighbour}\` without the cancel`);
      equal(fold([...seq, ...CANCEL]).outcome, 'cancelled', `a cancel AFTER it outranks \`${neighbour}\``);
      equal(fold([...CANCEL, ...seq]).outcome, 'cancelled', `and a cancel BEFORE it — precedence, not recency`);
    });
  }

  test('below `halted` — a run refused for a defect AND cancelled reads as the defect (RN-R8)', () => {
    equal(fold(CANCEL).outcome, 'cancelled', 'the ARRANGEMENT: the cancel alone is `cancelled`');
    const after = fold([...CANCEL, halt]);
    equal([after.outcome, after.haltedBy], ['halted', 'DuplicateTaskId: x'], 'a halt after the cancel: `halted`, naming the refusal');
    equal(fold([halt, ...CANCEL]).outcome, 'halted', 'and a halt before it: still `halted`');
  });

  test('a PARKED task does not make a cancelled run read as waiting for a person (P33 stop-and-ask (c))', () => {
    const seq = [dispatched('r1:p:0:0'), settled('r1:p:0:0', 'user_action'), ...CANCEL];
    const s = fold(seq);
    equal([s.nodes['r1:p:0:0']?.state, s.outcome], ['suspended', 'cancelled'],
      'the parked node stays `suspended` in `nodes`; the run is `cancelled`, not `awaiting_action`');
  });

  test('a join a cancel left waiting is NOT `stuck` — the run is already terminal (P33 decision 3)', () => {
    const seq: FoldInput[] = [{ kind: 'regionEntered', regionId: 'split', regionPath: '-' }, opened('0'), opened('1'),
      dispatched('r1:a:0:0'), dispatched('r1:b:1:0'), settled('r1:a:0:0', 'cancelled'), settled('r1:b:1:0', 'done')];
    const s = fold(seq);
    equal(s.regions.split?.['-']?.joined, null, 'the ARRANGEMENT: the join never settled — the condition `stuck` reads (RN-R10)');
    equal(Object.values(s.nodes).some((n) => n.state === 'running'), false, 'and nothing is live');
    equal(s.outcome, 'cancelled', 'and the run is `cancelled`, not `stuck`');
  });
});

suite('L3 — a cancelled run`s sequence folds the same way twice, and prefix by prefix (RN-R1, RN-R2)', (test) => {
  const SEQ: FoldInput[] = [{ kind: 'regionEntered', regionId: 'split', regionPath: '-' }, opened('0'), opened('1'),
    dispatched('r1:a:0:0'), dispatched('r1:b:1:0'), settled('r1:a:0:0', 'cancelled'), settled('r1:b:1:0', 'done')];

  test('folded twice, deep-equal', () => {
    equal(fold(SEQ), fold(SEQ), 'the fold reads nothing but its input — two folds of one sequence are one state');
  });

  test('stepped one input at a time equals the whole fold at every prefix', () => {
    let s = emptyState();
    for (let i = 0; i < SEQ.length; i++) {
      s = step(s, SEQ[i]!);
      equal(s, fold(SEQ.slice(0, i + 1)), `step(fold(prefix ${i}), next) === fold(prefix ${i + 1})`);
    }
    equal(s.outcome, 'cancelled', 'and the last prefix is the cancelled run');
  });
});
