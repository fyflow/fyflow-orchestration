/**
 * Ladder L1 and L3 — **an `attempted` element in the FOLD**: `spec/run-state.md` v0.26 `RN-R40`,
 * [ADR 0113](../../doc/decisions/0113-a-tasks-attempts-are-recorded-and-carried-across-a-resume.md),
 * [W186](../../doc/work-items/w186-attempts-recorded-and-carried-across-a-resume.md), P36 stop-and-ask (f).
 *
 * **Every input sequence here is hand-written from the spec** — no driver produced any of it — and the one expected value
 * is `RN-R40`'s sentence: *the fold accepts it and moves NOTHING in run state at v0.26* — so each sequence is folded beside
 * its CONTROL, the same sequence with the `attempted` elements removed, and the two must be equal at EVERY prefix, over
 * each outcome a run can have. A fold that threw on the kind — every kind `step` does not name falls through to
 * `input.record` (W93's measurement) — fails every case here.
 */
import { equal, collected, suite } from '../harness.ts';
import { fold, step, emptyState, type FoldInput, type RunState } from '../../src/fold/run-state.ts';
import type { TerminalState } from '../../src/definition/types.ts';

const settled = (taskId: string, state: TerminalState, attempts = 0): FoldInput => ({
  kind: 'outcome',
  record: {
    kind: 'outcome', taskId, terminalState: state, result: state === 'done' ? { v: taskId } : null, error: state === 'done' ? null : 'boom',
    attempts, schedulerTimestamp: 1, observedAt: 1, startTime: 1, endTime: 2, executionTime: 1,
  },
});
const dispatched = (taskId: string): FoldInput => ({ kind: 'dispatched', taskId });
const attempted = (taskId: string, attemptNumber: number): FoldInput => ({ kind: 'attempted', taskId, attemptNumber });
const end: FoldInput = { kind: 'pathEnded', reason: 'end', at: 'done' };
const noEdge: FoldInput = { kind: 'pathEnded', reason: 'no-eligible-edge', at: 'a' };
const A = 'r1:a:-:0', B = 'r1:b:-:0';

/** One sequence per outcome reachable around an attempt, each carrying `attempted` elements where a run would. */
const SEQUENCES: Record<string, FoldInput[]> = {
  'running, an attempt in flight': [dispatched(A), attempted(A, 1)],
  'completed after a retry': [dispatched(A), attempted(A, 1), attempted(A, 2), settled(A, 'done', 1), dispatched(B), attempted(B, 1), settled(B, 'done'), end],
  'failed — no eligible edge — after its attempts': [dispatched(A), attempted(A, 1), settled(A, 'failed'), noEdge],
  'awaiting_action: out of retries': [dispatched(A), attempted(A, 1), attempted(A, 2), settled(A, 'user_action', 1)],
  'interrupted with an attempt in flight': [dispatched(A), attempted(A, 1), { kind: 'interrupted', actor: 'ops', reason: null }],
  'resumed: the stored attempts, then the new process`s next one': [dispatched(A), attempted(A, 1), attempted(A, 2), { kind: 'resumed', taskIds: [A] }, attempted(A, 3)],
  'halted after an attempt': [dispatched(A), attempted(A, 1), { kind: 'halted', reason: 'Boom: the store is down' }],
  'cancelling with an attempt in flight': [dispatched(A), attempted(A, 1), { kind: 'cancelRequested', actor: 'ana', reason: null }],
};
const without = (seq: readonly FoldInput[]) => seq.filter((e) => e.kind !== 'attempted');
/** The state after EACH element of the sequence with the `attempted` elements, against the control at the same point. */
const prefixes = (seq: readonly FoldInput[]): [RunState, RunState][] => {
  const out: [RunState, RunState][] = [];
  let s = emptyState(), c = emptyState();
  for (const e of seq) {
    s = step(s, e);
    if (e.kind !== 'attempted') c = step(c, e);
    out.push([s, c]);
  }
  return out;
};

const SUITE = 'L1 — RN-R40: an `attempted` element moves NOTHING in run state — the fold accepts it, at every prefix, whatever the outcome';
const DECLARED_CASES = [
  'folded with and without its `attempted` elements, every sequence reads the SAME state — at its end and at every prefix — over eight outcomes',
  'step on an `attempted` element returns the state it was handed — from the empty state, and from a settled one',
  'L3 — every sequence above folded twice, deep-equal, and a stepped prefix equal to its fold',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test('folded with and without its `attempted` elements, every sequence reads the SAME state — at its end and at every prefix — over eight outcomes', () => {
    // The CONTROL that the eight are eight: their outcomes, hand-written from section 3's precedence.
    equal(Object.values(SEQUENCES).map((s) => fold(without(s)).outcome),
      ['running', 'completed', 'failed', 'awaiting_action', 'interrupted', 'running', 'halted', 'cancelling'],
      'the CONTROL: the eight sequences reach eight readings of section 3 without their attempts');
    for (const [name, seq] of Object.entries(SEQUENCES)) {
      equal(fold(seq), fold(without(seq)), `${name}: the same RunState with its attempts as without`);
      const at = prefixes(seq).findIndex(([s, c]) => JSON.stringify(s) !== JSON.stringify(c));
      equal(at, -1, `${name}: and at EVERY prefix (RN-R2) — the first that differs, -1 for none`);
    }
  });

  test('step on an `attempted` element returns the state it was handed — from the empty state, and from a settled one', () => {
    const empty = emptyState();
    equal(step(empty, attempted(A, 1)) === empty, true, 'from the empty state: the SAME object back — nothing copied, nothing moved');
    const s = fold([dispatched(A), settled(A, 'done')]);
    equal(step(s, attempted(A, 7)) === s, true, 'from a settled run: the same object back');
  });

  test('L3 — every sequence above folded twice, deep-equal, and a stepped prefix equal to its fold', () => {
    for (const [name, seq] of Object.entries(SEQUENCES)) {
      equal(fold(seq), fold(seq), `${name}: folded twice, deep-equal (RN-R1)`);
      for (let n = 0; n <= seq.length; n += 1) {
        let s = emptyState();
        for (const e of seq.slice(0, n)) s = step(s, e);
        equal(s, fold(seq.slice(0, n)), `${name}: the stepped prefix of ${n} IS its fold (RN-R2)`);
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
