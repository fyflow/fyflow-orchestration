/**
 * Ladder L1 and L3 — **a task's ATTRIBUTION on its `RunState.nodes` entry**: `spec/run-state.md` v0.27 `RN-R41`,
 * [ADR 0114](../../doc/decisions/0114-a-tasks-attribution-is-fields-and-its-messages-and-progress-are-passed-through.md),
 * [W187](../../doc/work-items/w187-attribution-on-the-fold-and-messages-passed-through.md), P36 stop-and-ask (j).
 *
 * **The contract, as P36 answered it**: every entry carries three REQUIRED fields — `runId` (the task id's first segment),
 * `flowAttempt` (its fourth, `0` on every id minted today) and `attemptNumber` (the scheduler's, the number the LATEST
 * `attempted` element for the task carried; `null` before its first attempt starts, on an ask, and on a log written before
 * 0.8.0, which holds no `attempted` element). Fold OUTPUT only.
 *
 * **Every input sequence here is hand-written from the spec** — no driver produced any of it — and every expected value is
 * written from the id's segments and the elements, never read off a fold. Each field is shown at BOTH values where it
 * varies: two run ids, a flow-level segment of `0` and of `1` (a segment the parse accepts and nothing mints today, Q16),
 * and `attemptNumber` at `null`, `1`, `2` and `3`.
 */
import { collected, equal, suite } from '../harness.ts';
import { fold, step, emptyState, type FoldInput, type NodeRun } from '../../src/fold/run-state.ts';
import type { TerminalState } from '../../src/definition/types.ts';

const settled = (taskId: string, state: TerminalState, attempts = 0): FoldInput => ({
  kind: 'outcome',
  record: {
    kind: 'outcome', taskId, terminalState: state, result: state === 'done' ? { v: taskId } : null, error: state === 'done' ? null : 'boom',
    attempts, schedulerTimestamp: 1, observedAt: 1, startTime: 1, endTime: 2, executionTime: 1,
  },
});
const resolved = (taskId: string, resolvedAs: 'done' | 'failed', result: unknown): FoldInput =>
  ({ kind: 'resolution', record: { kind: 'resolution', taskId, resolvedAs, result, error: null, actor: 'ana', observedAt: 9 } });
const dispatched = (taskId: string): FoldInput => ({ kind: 'dispatched', taskId });
const attempted = (taskId: string, attemptNumber: number): FoldInput => ({ kind: 'attempted', taskId, attemptNumber });
/** The three fields this item adds, off one entry — what every case reads. */
const attribution = (n: NodeRun | undefined) =>
  n === undefined ? 'NO ENTRY' : { runId: n.runId, flowAttempt: n.flowAttempt, attemptNumber: n.attemptNumber };

const SUITE = 'L1 — RN-R41: a task`s attribution as fields on its nodes entry — runId, flowAttempt and attemptNumber (P36 (j))';
const DECLARED_CASES = [
  'a dispatched task, before its first attempt: its run id and flow-level attempt from the id, attemptNumber null — at both values of each segment',
  'attemptNumber is the LATEST `attempted` element`s — 1, then 2 after a retry — and a settlement KEEPS it',
  'after a RESUME: the stored attempts, `resumed`, then the next process`s attempt 3 — the entry reads 3',
  'an ASK: attemptNumber null when it parks and null after its answer; a parked TASK`s resolution keeps the number it had',
  'a log written before 0.8.0 — no `attempted` element — reads attemptNumber null on every entry, whatever the settlement`s `attempts`',
  'a fan-out: each branch`s entry carries its own branchPath and the run`s id, and its own attempt number',
  'L3 — every sequence here folded twice, deep-equal, and each stepped prefix equal to its fold',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

/** Every sequence the cases fold, so L3 folds each one too. */
const SEQUENCES: Record<string, FoldInput[]> = {
  r1: [dispatched('r1:a:-:0')],
  r2: [dispatched('r2:a:-:0')],
  segment1: [dispatched('r1:a:-:1')],
  retry: [dispatched('r1:a:-:0'), attempted('r1:a:-:0', 1), attempted('r1:a:-:0', 2), settled('r1:a:-:0', 'done', 1)],
  resume: [dispatched('r1:a:-:0'), attempted('r1:a:-:0', 1), attempted('r1:a:-:0', 2), { kind: 'resumed', taskIds: ['r1:a:-:0'] }, attempted('r1:a:-:0', 3)],
  ask: [{ kind: 'asked', taskId: 'r1:approve:-:0', input: { n: 1 } }, resolved('r1:approve:-:0', 'done', { ok: true })],
  parked: [dispatched('r1:p:-:0'), attempted('r1:p:-:0', 1), attempted('r1:p:-:0', 2), settled('r1:p:-:0', 'user_action', 1), resolved('r1:p:-:0', 'done', { by: 'hand' })],
  legacy: [dispatched('r7:a:-:0'), settled('r7:a:-:0', 'done', 2), dispatched('r7:b:-:0'), settled('r7:b:-:0', 'user_action', 3), resolved('r7:b:-:0', 'failed', null)],
  fanout: [
    { kind: 'regionEntered', regionId: 'split', regionPath: '-' },
    dispatched('r1:a:0:0'), dispatched('r1:b:1:0'), attempted('r1:b:1:0', 1), attempted('r1:a:0:0', 1), attempted('r1:a:0:0', 2),
  ],
};

suite(SUITE, (test) => {
  test('a dispatched task, before its first attempt: its run id and flow-level attempt from the id, attemptNumber null — at both values of each segment', () => {
    equal(attribution(fold(SEQUENCES.r1!).nodes['r1:a:-:0']), { runId: 'r1', flowAttempt: 0, attemptNumber: null }, 'run r1, segment 0, no attempt yet');
    equal(attribution(fold(SEQUENCES.r2!).nodes['r2:a:-:0']), { runId: 'r2', flowAttempt: 0, attemptNumber: null }, 'run r2: the run id is the ID`s, not a constant');
    equal(attribution(fold(SEQUENCES.segment1!).nodes['r1:a:-:1']), { runId: 'r1', flowAttempt: 1, attemptNumber: null },
      'a flow-level segment of 1 — which the parse accepts and nothing mints today (Q16) — reads 1: the segment, not a constant');
    // The whole entry, hand-written, so the three are beside the five the entry always had and nothing else.
    equal(fold(SEQUENCES.r1!).nodes['r1:a:-:0'],
      { runId: 'r1', nodeId: 'a', branchPath: '-', flowAttempt: 0, attemptNumber: null, state: 'running', result: null, error: null },
      'the whole entry: eight fields, the three new and the five it always had');
  });

  test('attemptNumber is the LATEST `attempted` element`s — 1, then 2 after a retry — and a settlement KEEPS it', () => {
    const seq = SEQUENCES.retry!;
    equal(attribution(fold(seq.slice(0, 2)).nodes['r1:a:-:0']), { runId: 'r1', flowAttempt: 0, attemptNumber: 1 }, 'after its first attempt starts: 1');
    equal(attribution(fold(seq.slice(0, 3)).nodes['r1:a:-:0']), { runId: 'r1', flowAttempt: 0, attemptNumber: 2 }, 'after the retry starts: 2');
    equal(fold(seq).nodes['r1:a:-:0'],
      { runId: 'r1', nodeId: 'a', branchPath: '-', flowAttempt: 0, attemptNumber: 2, state: 'done', result: { v: 'r1:a:-:0' }, error: null },
      'settled done: 2 KEPT through the settlement — not the record`s `attempts` (1), and not attempts + 1 computed by the fold');
  });

  test('after a RESUME: the stored attempts, `resumed`, then the next process`s attempt 3 — the entry reads 3', () => {
    const seq = SEQUENCES.resume!;
    equal(attribution(fold(seq.slice(0, 4)).nodes['r1:a:-:0']), { runId: 'r1', flowAttempt: 0, attemptNumber: 2 }, 'at `resumed`: the stored 2 — `resumed` moves nothing');
    equal(attribution(fold(seq).nodes['r1:a:-:0']), { runId: 'r1', flowAttempt: 0, attemptNumber: 3 },
      'after the new process`s attempt: 3 — and flowAttempt still 0: the resume re-dispatched at the SAME id (RN-R22)');
  });

  test('an ASK: attemptNumber null when it parks and null after its answer; a parked TASK`s resolution keeps the number it had', () => {
    const ask = SEQUENCES.ask!;
    equal(attribution(fold(ask.slice(0, 1)).nodes['r1:approve:-:0']), { runId: 'r1', flowAttempt: 0, attemptNumber: null }, 'parked: never handed to a scheduler, null');
    equal(attribution(fold(ask).nodes['r1:approve:-:0']), { runId: 'r1', flowAttempt: 0, attemptNumber: null }, 'answered: still null');
    const parked = SEQUENCES.parked!;
    equal(attribution(fold(parked.slice(0, 4)).nodes['r1:p:-:0']), { runId: 'r1', flowAttempt: 0, attemptNumber: 2 }, 'the CONTROL: a task out of retries parks with its 2');
    equal(attribution(fold(parked).nodes['r1:p:-:0']), { runId: 'r1', flowAttempt: 0, attemptNumber: 2 }, 'and its resolution KEEPS it — a person resolved attempt 2');
  });

  test('a log written before 0.8.0 — no `attempted` element — reads attemptNumber null on every entry, whatever the settlement`s `attempts`', () => {
    const s = fold(SEQUENCES.legacy!);
    equal(Object.fromEntries(Object.entries(s.nodes).map(([k, n]) => [k, attribution(n)])), {
      'r7:a:-:0': { runId: 'r7', flowAttempt: 0, attemptNumber: null },
      'r7:b:-:0': { runId: 'r7', flowAttempt: 0, attemptNumber: null },
    }, 'null on both — a settled `attempts: 2` and a parked `attempts: 3`, then resolved, are NOT read as an attempt number (RN-R41: elements alone)');
    equal([s.nodes['r7:a:-:0']!.state, s.nodes['r7:b:-:0']!.state], ['done', 'failed'], 'the CONTROL: both entries did fold — settled and resolved');
  });

  test('a fan-out: each branch`s entry carries its own branchPath and the run`s id, and its own attempt number', () => {
    const s = fold(SEQUENCES.fanout!);
    equal(Object.fromEntries(Object.entries(s.nodes).map(([k, n]) => [k, [n.runId, n.nodeId, n.branchPath, n.flowAttempt, n.attemptNumber]])), {
      'r1:a:0:0': ['r1', 'a', '0', 0, 2],
      'r1:b:1:0': ['r1', 'b', '1', 0, 1],
    }, 'a on branch 0 after two attempts, b on branch 1 after one — the elements interleaved, each read for its own task');
    equal(Object.values(s.nodes).every((n) => n.runId === s.runId), true, 'and every entry`s runId is RunState.runId');
  });

  test('L3 — every sequence here folded twice, deep-equal, and each stepped prefix equal to its fold', () => {
    for (const [name, seq] of Object.entries(SEQUENCES)) {
      equal(fold(seq), fold(seq), `${name}: folded twice, deep-equal (RN-R1)`);
      let s = emptyState();
      for (let n = 0; n < seq.length; n += 1) {
        s = step(s, seq[n]!);
        equal(s, fold(seq.slice(0, n + 1)), `${name}: the stepped prefix of ${n + 1} IS its fold (RN-R2)`);
      }
    }
  });

  test('every case this suite declares actually ran — a deleted case fails naming itself', () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name)).sort();
    const declared = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run — it was deleted, renamed, or its suite stopped loading');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name. Add it here in the same commit');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership, which catches a duplicated name');
  });
});
