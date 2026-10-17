/**
 * Ladder L1 and L3 — **a run its OWNER stopped, in the FOLD**: `spec/run-state.md` v0.19 `RN-R32`, section 3's ninth
 * outcome `interrupted`, section 2's `interruption`, `RN-R22`'s v0.19 sentence,
 * [ADR 0105](../../doc/decisions/0105-a-run-its-owner-stops-goes-deaf-before-it-cancels-and-resumes-elsewhere.md),
 * [W174](../../doc/work-items/w174-stopping-a-run-to-resume-it-elsewhere.md), P34 stop-and-asks (d), (h) and (i).
 *
 * **Every input sequence here is hand-written from the spec** — no driver produced any of it — and every expected
 * outcome is read off section 3's table, highest-ranked match first (P34 (h), whole at v0.19):
 *
 *   halted > cancelled > cancelling > interrupted > awaiting_action > running > stuck > failed > completed
 *
 * and off `RN-R32`'s sentences: from an `interrupted` element the run is `interrupted` until a `resumed` element ends it
 * (`interruption` back to `null` — CURRENT, not cumulative); nothing is written per task, so a parked node stays
 * `suspended` and a stopped one `running`; and an `interrupted` folded while one is current moves nothing. **Each claim
 * sits beside a CONTROL**: the same sequence without the element, which reads what `RN-R7`, `RN-R10`, `RN-R28` or
 * `RN-R30` say instead.
 */
import { equal, collected, suite } from '../harness.ts';
import { fold, isTerminal, step, emptyState, type FoldInput, type RunOutcome, type RunState } from '../../src/fold/run-state.ts';
import type { TerminalState } from '../../src/definition/types.ts';

const settled = (taskId: string, state: TerminalState): FoldInput => ({
  kind: 'outcome',
  record: {
    kind: 'outcome', taskId, terminalState: state, result: state === 'done' ? { v: taskId } : null, error: null,
    attempts: 0, schedulerTimestamp: 1, observedAt: 1, startTime: 1, endTime: 2, executionTime: 1,
  },
});
const dispatched = (taskId: string): FoldInput => ({ kind: 'dispatched', taskId });
const stopped = (actor = 'ops', reason: string | null = 'upgrade'): FoldInput => ({ kind: 'interrupted', actor, reason });
const resumed = (...taskIds: string[]): FoldInput => ({ kind: 'resumed', taskIds });
const request: FoldInput = { kind: 'cancelRequested', actor: 'ana', reason: null };
const halt: FoldInput = { kind: 'halted', reason: 'UndispatchedTask: x' };
const end: FoldInput = { kind: 'pathEnded', reason: 'end', at: 'done' };
const opened = (b: string): FoldInput =>
  ({ kind: 'region', event: { type: 'branch.opened', regionId: 'split', regionPath: '-', branchPath: b } });

/** The outcome after EACH element — what a consumer folding incrementally reads, prefix by prefix (`RN-R2`). */
const outcomes = (seq: readonly FoldInput[]): RunOutcome[] => {
  const out: RunOutcome[] = [];
  let s = emptyState();
  for (const i of seq) { s = step(s, i); out.push(s.outcome); }
  return out;
};

const A = 'r1:a:-:0', B = 'r1:b:-:0';

const SUITE = 'L1 — RN-R32: a run its OWNER stopped reads `interrupted` until a `resumed` element ends it';
const DECLARED_CASES = [
  'the element over a running task and a parked one: `interrupted`, the running node still `running`, the parked one still `suspended`',
  'a `resumed` after it ends the stop: `interruption` null, and the outcome what the nodes say — `awaiting_action`, `running`, then `completed`',
  'a SECOND `interrupted` while one is current moves nothing; after a `resumed`, a new stop is recorded and both resumes kept',
  '(h): `halted` outranks it in both orders; an RN-R28 cancel in both orders reads `cancelled`; a cancel request over a running task reads `cancelling`',
  'it outranks `stuck` and `completed`: a waiting join with nothing live, and a run whose path reached an end',
  'isTerminal: `interrupted` is finished on this runtime, and not once `resumed` follows — and one step from the empty state, the whole shape',
  'L3 — every sequence above folded twice, deep-equal, and a stepped prefix equal to its fold',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

/** Every sequence the cases fold, for L3's case — named so a failure says which. */
const ALL: Record<string, FoldInput[]> = {};
const keep = (name: string, seq: FoldInput[]): FoldInput[] => { ALL[name] = seq; return seq; };

suite(SUITE, (test) => {
  test(DECLARED_CASES[0]!, () => {
    const seq = keep('running-and-parked', [dispatched(A), settled(A, 'user_action'), dispatched(B), stopped()]);
    equal(outcomes(seq), ['running', 'awaiting_action', 'awaiting_action', 'interrupted'],
      '`awaiting_action` before the element (RN-R7); `interrupted` OVER it from the element on (P34 (h))');
    const s = fold(seq);
    equal([s.nodes[A]!.state, s.nodes[B]!.state], ['suspended', 'running'],
      'nothing is written per task (P34 (i)): the parked A stays `suspended`, the stopped B stays `running` — the in-flight set');
    equal(s.interruption, { actor: 'ops', reason: 'upgrade' }, 'the cell carries the element`s actor and reason');
    equal([s.cancelRequest, s.haltedBy, s.resumes], [null, null, []], 'and no other cell moves');
    // The CONTROL: the same sequence without the element — the parked task makes it `awaiting_action`.
    equal(fold(seq.slice(0, 3)).outcome, 'awaiting_action', 'the control: without the element the run is `awaiting_action` (RN-R7)');
    // And `reason` is `null` when the caller gave none.
    equal(fold(keep('no-reason', [dispatched(B), stopped('ops', null)])).interruption, { actor: 'ops', reason: null },
      '`reason` is `null` when none was given');
  });

  test(DECLARED_CASES[1]!, () => {
    const parked = keep('resumed-parked', [dispatched(A), settled(A, 'user_action'), dispatched(B), stopped(), resumed(B)]);
    const s = fold(parked);
    equal([s.outcome, s.interruption, s.resumes], ['awaiting_action', null, [[B]]],
      'the `resumed` element ENDS the stop (RN-R22 v0.19): `interruption` null, `resumes` recording it, and A parked makes it `awaiting_action`');
    const line = keep('resumed-line', [dispatched(A), stopped(), resumed(A), settled(A, 'done'), end]);
    // After A's `done` and before its `pathEnded`, the prefix has nothing live and no path end: section 3's fallback reads
    // `completed` there — a MID-TURN prefix (`RN-R12`'s quiescent-point caveat), the same as a run nobody stopped.
    equal(outcomes(line), ['running', 'interrupted', 'running', 'completed', 'completed'],
      'a stopped run resumed reads `running` again, and completes as a run nobody stopped');
    // The CONTROL: a `resumed` with NO stop before it moves nothing but `resumes` — the outcome is untouched.
    const plain = fold([dispatched(A), resumed(A)]);
    equal([plain.outcome, plain.interruption, plain.resumes], ['running', null, [[A]]],
      'the control: a resume of a run nobody stopped moves `resumes` and nothing else, as before v0.19');
  });

  test(DECLARED_CASES[2]!, () => {
    const once = [dispatched(A), stopped('ops', 'upgrade')];
    const twice = keep('second-stop', [...once, stopped('bob', 'again')]);
    equal(fold(twice), fold(once), 'a SECOND element while the first is current moves NOTHING: the first is the run`s');
    const again = keep('stop-resume-stop', [dispatched(A), stopped('ops', 'first'), resumed(A), stopped('bob', 'second'), resumed(A)]);
    equal(outcomes(again), ['running', 'interrupted', 'running', 'interrupted', 'running'],
      'stopped, resumed, stopped again, resumed again: each element read in turn');
    equal(fold(again.slice(0, 4)).interruption, { actor: 'bob', reason: 'second' }, 'the CURRENT stop is the second one — not the first');
    equal(fold(again).resumes, [[A], [A]], 'and both resumes are kept, in order (RN-R22): the history is in the sequence');
  });

  test(DECLARED_CASES[3]!, () => {
    const haltFirst = keep('halt-then-stop', [dispatched(A), halt, stopped()]);
    const haltAfter = keep('stop-then-halt', [dispatched(A), stopped(), halt]);
    equal([fold(haltFirst).outcome, fold(haltAfter).outcome], ['halted', 'halted'], '`halted` outranks `interrupted` in both orders (RN-R8)');
    equal([fold(haltFirst).interruption, fold(haltAfter).interruption], [{ actor: 'ops', reason: 'upgrade' }, { actor: 'ops', reason: 'upgrade' }],
      'and the stop is recorded either way');
    const cancelAfter = keep('stop-then-rn-r28', [dispatched(A), dispatched(B), stopped(), settled(A, 'cancelled')]);
    const cancelFirst = keep('rn-r28-then-stop', [dispatched(A), dispatched(B), settled(A, 'cancelled'), stopped()]);
    equal([fold(cancelAfter).outcome, fold(cancelFirst).outcome], ['cancelled', 'cancelled'],
      'a task the scheduler cancelled on its own (RN-R28) outranks the stop in both orders: a cancelled run never reads resumable');
    const requested = keep('stop-then-request', [dispatched(A), stopped(), request]);
    equal(outcomes(requested), ['running', 'interrupted', 'cancelling'],
      'a cancel request after the stop, A still `running` in the log: `cancelling` outranks `interrupted` (RN-R30)');
    // The CONTROL for the last: the same without the stop is `cancelling` too — and WITHOUT the request it is `interrupted`.
    equal(fold(requested.slice(0, 2)).outcome, 'interrupted', 'the control: the prefix before the request is `interrupted`');
  });

  test(DECLARED_CASES[4]!, () => {
    const region: FoldInput[] = [{ kind: 'regionEntered', regionId: 'split', regionPath: '-' }, opened('0'), opened('1'),
      dispatched('r1:a:0:0'), dispatched('r1:b:1:0'), settled('r1:a:0:0', 'done'), settled('r1:b:1:0', 'done')];
    // The CONTROL: both branches settled, no join fired, no path ended — RN-R10's `stuck`.
    equal(fold(region).outcome, 'stuck', 'the control: a region whose join never fired, nothing live — `stuck`');
    const waiting = keep('stopped-over-waiting-join', [...region, stopped()]);
    equal(fold(waiting).outcome, 'interrupted', 'the same region with the stop after it: `interrupted`, never `stuck`');
    equal(fold(waiting).regions.split?.['-']?.joined, null, 'the join stays unfired: the condition `stuck` reads, outranked');
    const ended = keep('stopped-after-end', [dispatched(A), settled(A, 'done'), end, stopped()]);
    equal(outcomes(ended).slice(2), ['completed', 'interrupted'], 'and it outranks `completed` — the element is the fact the fold reads');
  });

  test(DECLARED_CASES[5]!, () => {
    const at = fold([dispatched(A), stopped()]);
    const after = fold([dispatched(A), stopped(), resumed(A)]);
    equal([at.outcome, isTerminal(at)], ['interrupted', true], '`interrupted` IS terminal (RN-R12): nothing more moves it on this runtime');
    equal([after.outcome, isTerminal(after)], ['running', false], 'and once `resumed` follows, the run is live again');
    // Section 2's whole shape, one step from the empty state: the element alone.
    equal(step(emptyState(), stopped('ops', null)),
      { runId: null, outcome: 'interrupted', nodes: {}, regions: {}, pathEnds: [], haltedBy: null, cancelRequest: null,
        interruption: { actor: 'ops', reason: null }, paused: false, resumes: [], gated: [] } satisfies RunState,
      'step() on the empty state: `interruption` and `outcome` set, nothing else');
  });

  test(DECLARED_CASES[6]!, () => {
    const names = Object.keys(ALL);
    equal(names.length, 13, 'the ARRANGEMENT: thirteen sequences kept by the cases above');
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
