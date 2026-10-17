/**
 * Ladder L1 and L3 — **a run its OWNER paused, in the FOLD**: `spec/run-state.md` v0.20 `RN-R34`, section 2's `paused`,
 * [ADR 0106](../../doc/decisions/0106-a-run-its-owner-pauses-routes-on-and-holds-every-dispatch-until-unpaused.md),
 * [W175](../../doc/work-items/w175-pausing-a-run.md), P34 stop-and-ask (e).
 *
 * **Every input sequence here is hand-written from the spec** — no driver produced any of it — and every expected value
 * is read off `RN-R34`'s sentences: a `paused` element sets `RunState.paused` and an `unpaused` one clears it; **it is a
 * FLAG, NOT an outcome** — the outcome is exactly what the same sequence without the pause elements reads, so no
 * precedence moves (P34 (e)); a held dispatch is a `dispatched` element and reads `running` (P34 fact 3); one that would
 * not change the flag moves nothing; and neither `resumed`, `interrupted`, a cancel nor a halt lifts it. **Each claim sits
 * beside a CONTROL**: the same sequence without the pause elements.
 */
import { equal, collected, suite } from '../harness.ts';
import { fold, isTerminal, step, emptyState, type FoldInput, type RunState } from '../../src/fold/run-state.ts';
import type { TerminalState } from '../../src/definition/types.ts';

const settled = (taskId: string, state: TerminalState): FoldInput => ({
  kind: 'outcome',
  record: {
    kind: 'outcome', taskId, terminalState: state, result: state === 'done' ? { v: taskId } : null, error: null,
    attempts: 0, schedulerTimestamp: 1, observedAt: 1, startTime: 1, endTime: 2, executionTime: 1,
  },
});
const dispatched = (taskId: string): FoldInput => ({ kind: 'dispatched', taskId });
const paused = (actor = 'ops'): FoldInput => ({ kind: 'paused', actor });
const unpaused = (actor = 'ops'): FoldInput => ({ kind: 'unpaused', actor });
const stopped: FoldInput = { kind: 'interrupted', actor: 'ops', reason: null };
const resumed = (...taskIds: string[]): FoldInput => ({ kind: 'resumed', taskIds });
const request: FoldInput = { kind: 'cancelRequested', actor: 'ana', reason: null };
const halt: FoldInput = { kind: 'halted', reason: 'UndispatchedTask: x' };
const end: FoldInput = { kind: 'pathEnded', reason: 'end', at: 'done' };
const noEdge: FoldInput = { kind: 'pathEnded', reason: 'no-eligible-edge', at: 'a' };
const openJoin: FoldInput = { kind: 'joinSettled', regionId: 'split', regionPath: '-', joinId: 'collect', fired: false };

const A = 'r1:a:-:0', B = 'r1:b:-:0', C = 'r1:c:-:0';
const isPause = (e: FoldInput) => e.kind === 'paused' || e.kind === 'unpaused';

/** The flag after EACH element — what a consumer folding incrementally reads, prefix by prefix (`RN-R2`). */
const flags = (seq: readonly FoldInput[]): boolean[] => {
  const out: boolean[] = [];
  let s = emptyState();
  for (const i of seq) { s = step(s, i); out.push(s.paused); }
  return out;
};

const SUITE = 'L1 — RN-R34: a run its OWNER paused reads `paused: true` until an `unpaused` element — a flag, never an outcome';
const DECLARED_CASES = [
  '`paused` sets the flag and `unpaused` clears it, and no other cell moves',
  'a HELD dispatch reads `running`: paused, `a` done and `b` dispatched after — `running`, not `completed` (P34 fact 3)',
  'NOT an outcome: over each of (h)`s outcomes — completed, failed, stuck, running, awaiting_action, interrupted, cancelling, cancelled, halted — the outcome is the sequence`s without the pause',
  'a second `paused`, and an `unpaused` of a run not paused, move nothing',
  'neither `interrupted`, `resumed`, a cancel request nor a halt lifts it — a run stopped while paused resumes paused',
  'isTerminal is unmoved by the flag — and one step from the empty state, the whole shape',
  'L3 — every sequence above folded twice, deep-equal, and a stepped prefix equal to its fold',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

const ALL: Record<string, FoldInput[]> = {};
const keep = (name: string, seq: FoldInput[]): FoldInput[] => { ALL[name] = seq; return seq; };

suite(SUITE, (test) => {
  test(DECLARED_CASES[0]!, () => {
    const seq = keep('pause-unpause', [dispatched(A), paused('ops'), dispatched(B), unpaused('ana')]);
    equal(flags(seq), [false, true, true, false], 'false, then true from `paused`, then false from `unpaused`');
    const at = fold(seq.slice(0, 3));
    const without = fold(seq.slice(0, 3).filter((e) => !isPause(e)));
    // The whole state at the pause equals the control's with only the flag different: nothing else moves.
    equal(at, { ...without, paused: true }, 'paused: the state is the control`s with `paused` true and NO other cell moved');
    equal(fold(seq), { ...fold(seq.filter((e) => !isPause(e))), paused: false },
      'unpaused: the state is exactly the control`s — `paused` false again');
  });

  test(DECLARED_CASES[1]!, () => {
    // x -> y: x settles while the run is paused, y is routed and HELD — its `dispatched` element is in the sequence.
    const held = keep('held-successor', [dispatched(A), paused(), settled(A, 'done'), dispatched(B)]);
    const s = fold(held);
    equal([s.outcome, s.nodes[B]?.state, s.paused], ['running', 'running', true],
      'the held B is `dispatched`, so `running`, and the run reads `running` — never finished while a held task waits');
    // The CONTROL, P34 fact 3: the same run with the held dispatch NOT appended would read `completed`.
    equal(fold([dispatched(A), paused(), settled(A, 'done'), end]).outcome, 'completed',
      'the control: hold BEFORE the append and the fold calls the run finished — which is why the element is appended');
  });

  test(DECLARED_CASES[2]!, () => {
    // One sequence per outcome, P34 (h)'s order read from the bottom; each gets a pause in the middle and the outcome
    // must be the one the SAME sequence without it reads — hand-written expectations, not a comparison alone.
    const rows: [string, FoldInput[]][] = [
      ['completed', [dispatched(A), settled(A, 'done'), end]],
      ['failed', [dispatched(A), settled(A, 'done'), end, noEdge]],
      ['stuck', [dispatched(A), settled(A, 'done'), end, noEdge, openJoin]],
      ['running', [dispatched(A), settled(A, 'done'), end, noEdge, openJoin, dispatched(B)]],
      ['awaiting_action', [dispatched(A), settled(A, 'done'), dispatched(B), dispatched(C), settled(C, 'user_action')]],
      ['interrupted', [dispatched(B), stopped]],
      ['cancelling', [dispatched(B), request]],
      ['cancelled', [dispatched(B), request, settled(B, 'cancelled')]],
      ['halted', [dispatched(B), halt]],
    ];
    for (const [expected, seq] of rows) {
      const withPause = keep(`over-${expected}`, [seq[0]!, paused(), ...seq.slice(1)]);
      equal([fold(seq).outcome, fold(withPause).outcome, fold(withPause).paused], [expected, expected, true],
        `${expected}: the control reads it, and the same sequence with a pause after its first element reads it too, paused`);
      const pausedLast = keep(`over-${expected}-paused-last`, [...seq, paused()]);
      equal(fold(pausedLast).outcome, expected, `${expected}: and with the pause as the LAST element, read by no later recomputation`);
      const withBoth = keep(`over-${expected}-unpaused`, [...withPause, unpaused()]);
      equal([fold(withBoth).outcome, fold(withBoth).paused], [expected, false], `${expected}: and unpaused at the end`);
    }
  });

  test(DECLARED_CASES[3]!, () => {
    const once = [dispatched(A), paused('ops')];
    const twice = keep('second-pause', [...once, paused('bob')]);
    equal(fold(twice), fold(once), 'a second `paused` moves nothing');
    const notPaused = keep('unpause-unpaused', [dispatched(A), unpaused('bob')]);
    equal(fold(notPaused), fold([dispatched(A)]), 'an `unpaused` of a run not paused moves nothing');
    const again = keep('pause-twice-over', [dispatched(A), paused(), unpaused(), paused('bob')]);
    equal(flags(again), [false, true, false, true], 'paused, unpaused, paused again: each read in turn');
  });

  test(DECLARED_CASES[4]!, () => {
    const stoppedPaused = keep('paused-stopped-resumed', [dispatched(A), paused(), stopped, resumed(A)]);
    equal(flags(stoppedPaused), [false, true, true, true], 'the stop and the resume leave the flag: a run stopped while paused resumes paused');
    equal(fold(stoppedPaused).outcome, 'running', 'and the resume ended the stop as ever — the outcome is the nodes`');
    const cancelled = keep('paused-cancelled', [dispatched(A), paused(), request, settled(A, 'cancelled')]);
    equal([fold(cancelled).outcome, fold(cancelled).paused], ['cancelled', true], 'a cancel ends the run and does not lift the pause');
    const halted = keep('paused-halted', [dispatched(A), paused(), halt]);
    equal([fold(halted).outcome, fold(halted).paused], ['halted', true], 'nor does a halt');
    // The CONTROL: `unpaused` after the stop and resume lifts it — so the `true` above is the absence of one.
    equal(fold([...stoppedPaused, unpaused()]).paused, false, 'the control: an `unpaused` after them lifts it');
  });

  test(DECLARED_CASES[5]!, () => {
    const live = fold([dispatched(A), paused()]);
    const done = fold([dispatched(A), paused(), settled(A, 'done'), end]);
    equal([isTerminal(live), isTerminal(done)], [false, true], 'a paused run with a task in flight is live; a paused run that completed is terminal');
    equal(step(emptyState(), paused('ops')),
      { runId: null, outcome: 'running', nodes: {}, regions: {}, pathEnds: [], haltedBy: null, cancelRequest: null,
        interruption: null, paused: true, resumes: [], gated: [] } satisfies RunState,
      'step() on the empty state: `paused` set, nothing else');
  });

  test(DECLARED_CASES[6]!, () => {
    const names = Object.keys(ALL);
    equal(names.length, 35, 'the ARRANGEMENT: thirty-five sequences kept by the cases above');
    for (const name of names) {
      const seq = ALL[name]!;
      equal(fold(seq), fold(seq), `${name}: folded twice, deep-equal (RN-R1, L3)`);
      for (let n = 0; n < seq.length; n += 1) {
        equal(step(fold(seq.slice(0, n)), seq[n]!), fold(seq.slice(0, n + 1)), `${name}: step over the prefix of ${n} equals the fold of ${n + 1} (RN-R2)`);
      }
    }
  });

  test(DECLARED_CASES[7]!, () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name));
    equal(ran, DECLARED_CASES, 'each declared case registered, in order, and no other — an emptied or renamed case fails here');
  });
});
