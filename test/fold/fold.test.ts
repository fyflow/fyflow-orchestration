/**
 * The fold — `spec/run-state.md`, and ladder **L3**.
 *
 * Every fixture here is a **hand-written log**. None is captured from the driver:
 * a log the driver produced would prove only that the fold and the driver agree,
 * which is `doc/workflow.md` section 5 rule 4's whole point. The shapes come from
 * `spec/outcome-record.md` sections 1 and 5.
 */
import { equal, ok, suite } from '../harness.ts';
import { fold, foldLog, step, emptyState, type FoldInput } from '../../src/fold/run-state.ts';
import type { LogRecord } from '../../src/driver/log.ts';
import type { RegionEvent } from '../../src/driver/events.ts';

const NOW = 1_756_512_000_000;

const settled = (
  taskId: string,
  terminalState: 'done' | 'failed' | 'user_action',
  over: Partial<LogRecord> = {},
): LogRecord => ({
  kind: 'outcome', taskId, terminalState,
  result: terminalState === 'done' ? { of: taskId } : null,
  error: terminalState === 'done' ? null : 'boom',
  attempts: 0, schedulerTimestamp: NOW, observedAt: NOW,
  startTime: NOW - 5, endTime: NOW, executionTime: 5,
  ...over,
} as LogRecord);

const resolution = (taskId: string, resolvedAs: 'done' | 'failed'): LogRecord => ({
  kind: 'resolution', taskId, resolvedAs,
  result: resolvedAs === 'done' ? { by: 'human' } : null,
  error: resolvedAs === 'failed' ? 'gave up' : null,
  actor: 'ops:jane', observedAt: NOW + 60_000,
} as LogRecord);

const region = (e: RegionEvent): FoldInput => ({ kind: 'region', event: e });
const rec = (r: LogRecord): FoldInput => ({ kind: r.kind, record: r });

suite('L3 — determinism: fold the same log twice and deep-compare', (test) => {
  const log: FoldInput[] = [
    rec(settled('r1:ingest:-:0', 'done')),
    region({ type: 'branch.opened', regionId: 'split', regionPath: '-', branchPath: '0' }),
    region({ type: 'branch.opened', regionId: 'split', regionPath: '-', branchPath: '1' }),
    rec(settled('r1:scoreA:0:0', 'done')),
    region({ type: 'branch.arrived', regionId: 'split', regionPath: '-', branchPath: '0' }),
    rec(settled('r1:scoreB:1:0', 'user_action')),
    region({ type: 'branch.suspended', regionId: 'split', regionPath: '-', branchPath: '1', at: 'scoreB' }),
    rec(resolution('r1:scoreB:1:0', 'done')),
    region({ type: 'branch.resumed', regionId: 'split', regionPath: '-', branchPath: '1', at: 'scoreB', resolvedAs: 'done' }),
    region({ type: 'branch.arrived', regionId: 'split', regionPath: '-', branchPath: '1' }),
  ];

  test('two independent folds are deeply equal', () => {
    equal(fold(log), fold(log),
      'RN-R1: no clock, no hidden state, no memoisation. A fold that read scheduler.tasks or ' +
      'called Date.now() would pass a green suite and fail exactly here');
  });

  test('and they are not the same object', () => {
    ok(fold(log) !== fold(log), 'two folds, not one cached result — otherwise the check is circular');
  });

  test('step never mutates the state it was given', () => {
    const before = fold(log.slice(0, 4));
    const snapshot = JSON.parse(JSON.stringify(before));
    step(before, log[4]!);
    equal(before, snapshot, 'RN-R2 needs this: a prefix fold must survive being extended');
  });
});

suite('RN-R2 — the fold is total over any prefix', (test) => {
  const log: FoldInput[] = [
    rec(settled('r1:a:-:0', 'done')),
    region({ type: 'branch.opened', regionId: 'f', regionPath: '-', branchPath: '0' }),
    rec(settled('r1:b:0:0', 'failed')),
    region({ type: 'branch.lost', regionId: 'f', regionPath: '-', branchPath: '0', reason: 'failed' }),
  ];

  test('folding n then applying n+1 equals folding n+1, for every n', () => {
    for (let n = 0; n < log.length; n++) {
      equal(step(fold(log.slice(0, n)), log[n]!), fold(log.slice(0, n + 1)),
        `prefix ${n}: this is what makes a run observable WHILE it runs, and what Q15 needs ` +
        'if durability is ever added');
    }
  });

  test('the empty log folds to a defined state', () => {
    equal(fold([]), emptyState(), 'not an error, not null — a run that has dispatched nothing');
  });
});

suite('RN-R3 and OR-R5 — append order, never a timestamp', (test) => {
  test('the fold follows append order even when the clocks disagree', () => {
    // The scheduler's clock and ours are different clocks; two settlements can
    // share a millisecond; and for a suspended node the gap between a settlement
    // and its resolution is hours. None of that is a total order — the array is.
    const backwards: FoldInput[] = [
      rec(settled('r1:a:-:0', 'done', { observedAt: NOW + 5_000, schedulerTimestamp: NOW + 5_000 })),
      rec(settled('r1:a:-:0', 'failed', { observedAt: NOW, schedulerTimestamp: NOW })),
    ];
    equal(fold(backwards).nodes['r1:a:-:0']!.state, 'failed',
      'the LAST record in append order wins, even though its stamps are earlier. A fold that ' +
      'sorted by time would report "done" and be wrong in exactly the case OR-R5 describes');
  });

  test('two records sharing a millisecond are not reordered', () => {
    const tied: FoldInput[] = [
      rec(settled('r1:a:-:0', 'done', { observedAt: NOW })),
      rec(settled('r1:b:-:0', 'failed', { observedAt: NOW })),
    ];
    equal(Object.keys(fold(tied).nodes), ['r1:a:-:0', 'r1:b:-:0'], 'insertion order preserved');
  });
});

suite('RN-R4, RN-R5 — a run holds only what the log says, keyed by task id', (test) => {
  test('nodes are keyed by task id, so two branches of one fan-out stay distinct', () => {
    const s = foldLog([settled('r1:score:0:0', 'done'), settled('r1:score:1:0', 'failed')]);
    equal(Object.keys(s.nodes).sort(), ['r1:score:0:0', 'r1:score:1:0'],
      'RN-R5: keying by nodeId would silently merge two branches into one entry');
    equal(s.nodes['r1:score:0:0']!.nodeId, 'score', 'and the node id is recovered by the parse');
    equal(s.nodes['r1:score:0:0']!.branchPath, '0', 'along with the branch path');
    equal(s.nodes['r1:score:1:0']!.branchPath, '1', 'which is what tells the two apart');
  });

  test('a node absent from the log is absent from run state', () => {
    const s = foldLog([settled('r1:a:-:0', 'done')]);
    equal(s.nodes['r1:never:-:0'], undefined,
      'RN-R4: absence means "never dispatched" and nothing else — the fold invents no entries');
  });

  test('runId comes from the log, not from a caller', () => {
    equal(foldLog([settled('r7c1f:a:-:0', 'done')]).runId, 'r7c1f', 'derived, not supplied');
    equal(fold([]).runId, null, 'and null when nothing has been dispatched');
  });
});

suite('RN-R9 — a resolved node is indistinguishable from one that settled that way', (test) => {
  test('resolving done gives the same node state as settling done', () => {
    const resolved = foldLog([settled('r1:a:-:0', 'user_action'), resolution('r1:a:-:0', 'done')]);
    equal(resolved.nodes['r1:a:-:0']!.state, 'done', 'the resolution supplies the state');
    equal(resolved.nodes['r1:a:-:0']!.result, { by: 'human' }, "and the human's answer is the result");
    equal(resolved.nodes['r1:a:-:0']!.error, null, 'error clears with the state');
  });

  test('resolving failed lands in the same shape as an optional node failing', () => {
    const resolved = foldLog([settled('r1:a:-:0', 'user_action'), resolution('r1:a:-:0', 'failed')]);
    const settledFailed = foldLog([settled('r1:a:-:0', 'failed')]);
    equal(resolved.nodes['r1:a:-:0']!.state, settledFailed.nodes['r1:a:-:0']!.state,
      "RS-R3's promise kept one layer up: a human giving up and the flow handling a failure are " +
      'the same downstream shape, deliberately');
  });

  test('a suspended node with no resolution stays suspended', () => {
    equal(foldLog([settled('r1:a:-:0', 'user_action')]).nodes['r1:a:-:0']!.state, 'suspended',
      'user_action is NOT terminal at flow level — it is the fifth state, and calling it ' +
      'terminal is what makes a design drop it');
  });
});

suite('RN-R6 — regions record what happened, not what a policy concluded', (test) => {
  test('the region carries events, and a policy could not be inferred from it', () => {
    const s = fold([
      region({ type: 'branch.opened', regionId: 'split', regionPath: '-', branchPath: '0' }),
      region({ type: 'branch.opened', regionId: 'split', regionPath: '-', branchPath: '1' }),
      region({ type: 'branch.arrived', regionId: 'split', regionPath: '-', branchPath: '0' }),
      region({ type: 'branch.exited', regionId: 'split', regionPath: '-', branchPath: '1', at: 'abandoned' }),
    ]);
    equal(s.regions['split']!['-']!.opened, ['0', '1'], 'both branches opened, in emission order');
    equal(s.regions['split']!['-']!.settled, { '0': 'arrived', '1': 'exited' },
      'and how each one left. **No verdict**: if run state carried a policy conclusion, W4 would ' +
      'be comparing two run states rather than two policies and every cell would be a tautology');
  });

  test('suspended and resumed move a branch in and out of `suspended` without settling it', () => {
    const s = fold([
      region({ type: 'branch.opened', regionId: 'f', regionPath: '-', branchPath: '0' }),
      region({ type: 'branch.suspended', regionId: 'f', regionPath: '-', branchPath: '0', at: 'review' }),
    ]);
    equal(s.regions['f']!['-']!.suspended, ['0'], 'a branch waiting on a person is still live');
    equal(s.regions['f']!['-']!.settled, {}, 'and has not left the region');

    const resumed = step(s, region({ type: 'branch.resumed', regionId: 'f', regionPath: '-', branchPath: '0', at: 'review', resolvedAs: 'done' }));
    equal(resumed.regions['f']!['-']!.suspended, [], 'and resuming clears it');
  });
});

suite('RN-R7, RN-R8 — the run-level outcome vocabulary and its precedence', (test) => {
  test('awaiting_action outranks running', () => {
    const s = foldLog([
      settled('r1:a:-:0', 'user_action'),
      settled('r1:b:-:0', 'done'),
    ]);
    equal(s.outcome, 'awaiting_action',
      'RN-R7: one suspended node beats any amount of live work, because the thing a reader must ' +
      'know is that a human is needed. This is Q17 answered at run level');
  });

  test('stopped outranks everything', () => {
    const s = step(foldLog([settled('r1:a:-:0', 'user_action')]),
      { kind: 'stopped', reason: 'DuplicateTaskId' });
    equal(s.outcome, 'stopped', 'RN-R8: the log after a refusal is incomplete by construction');
    equal(s.stoppedBy, 'DuplicateTaskId', 'and it says which refusal');
  });

  test('completed, failed and running', () => {
    equal(foldLog([settled('r1:a:-:0', 'done')]).outcome, 'completed', 'every node settled done');
    equal(foldLog([settled('r1:a:-:0', 'failed')]).outcome, 'failed', 'a path ended with no eligible edge');
    equal(fold([]).outcome, 'running', 'a run that has dispatched nothing is not finished');
  });

  test('the vocabulary is closed and ours, not the definition’s', () => {
    const outcomes = new Set([
      foldLog([]).outcome,
      foldLog([settled('r1:a:-:0', 'done')]).outcome,
      foldLog([settled('r1:a:-:0', 'failed')]).outcome,
      foldLog([settled('r1:a:-:0', 'user_action')]).outcome,
      step(fold([]), { kind: 'stopped', reason: 'x' }).outcome,
      // **`stuck` is the sixth, added by W5** — `spec/run-state.md` v0.3,
      // [ADR 0015](../../doc/decisions/0015-a-run-whose-join-can-no-longer-fire-is-stuck.md).
      // One line in W2's file, and it is here rather than only in
      // `test/fold/stuck.test.ts` because a test that names the vocabulary closed
      // and lists five of six is a test that stopped being about closure.
      step(
        step(fold([]), { kind: 'region', event: { type: 'branch.opened', regionId: 'f', regionPath: '-', branchPath: '0' } }),
        { kind: 'pathEnded', reason: 'end', at: 'done' },
      ).outcome,
    ]);
    equal([...outcomes].sort(),
      ['awaiting_action', 'completed', 'failed', 'running', 'stopped', 'stuck'],
      'Q25: an author labels WHY a path ended via end.outcome; run state says WHAT the run is, ' +
      'and letting a definition supply that would let a flow invent a state no UI could render');
  });
});
