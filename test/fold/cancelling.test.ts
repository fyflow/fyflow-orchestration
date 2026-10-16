/**
 * Ladder L1 and L3 — **a run its OWNER cancelled, in the FOLD**: `spec/run-state.md` v0.18 `RN-R30`, section 3's
 * eighth outcome `cancelling`, section 2's `cancelRequest`,
 * [ADR 0104](../../doc/decisions/0104-a-run-its-owner-cancels-is-cancelling-until-its-last-task-has-stopped.md),
 * [W173](../../doc/work-items/w173-cancelling-a-run.md), P34 stop-and-asks (c), (h) and (i).
 *
 * **Every input sequence here is hand-written from the spec** — no driver produced any of it — and every expected
 * outcome is read off section 3's table, highest-ranked match first (P34 (h)):
 *
 *   halted > cancelled > cancelling > awaiting_action > running > stuck > failed > completed
 *
 * and off `RN-R30`'s three sentences: from a `cancelRequested` element the run is `cancelling` while some dispatched
 * node is `running` and `cancelled` once none is; a parked node is not waited on and stays `suspended`; and a request
 * folded after the run is already `cancelled` moves nothing and is not recorded. **Each claim sits beside a CONTROL**:
 * the same sequence without the request, which reads what `RN-R28`, `RN-R7` or `RN-R10` say instead.
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
const request = (actor = 'ana', reason: string | null = 'no longer needed'): FoldInput => ({ kind: 'cancelRequested', actor, reason });
const halt: FoldInput = { kind: 'halted', reason: 'UndispatchedTask: x' };
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

const SUITE = 'L1 — RN-R30: a run its OWNER cancelled reads `cancelling` until its last task has stopped, then `cancelled`';
const DECLARED_CASES = [
  'the request over two running tasks: `cancelling`, still `cancelling` after the first `cancelled`, `cancelled` at the last',
  'the last wait is ended by WHATEVER settles it — a `done`, and a `failed`',
  'a parked node is NOT waited on, and stays `suspended` — `cancelling` outranks `awaiting_action`',
  'a request with nothing running is `cancelled` at once, and `reason` is `null` when none was given',
  '(h): `halted` outranks it in both orders, and the request is still recorded',
  'a request AFTER an RN-R28 cancel moves nothing and is not recorded — and a second request moves nothing',
  'a join the cancel left waiting is never `stuck`, under either outcome',
  'isTerminal: `cancelling` is not finished, `cancelled` is — and one step from the empty state, the whole shape',
  'L3 — every sequence above folded twice, deep-equal, and a stepped prefix equal to its fold',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

/** Every sequence the cases fold, for L3's case — named so a failure says which. */
const ALL: Record<string, FoldInput[]> = {};
const keep = (name: string, seq: FoldInput[]): FoldInput[] => { ALL[name] = seq; return seq; };

suite(SUITE, (test) => {
  test(DECLARED_CASES[0]!, () => {
    const seq = keep('two-running', [dispatched(A), dispatched(B), request(), settled(A, 'cancelled'), settled(B, 'cancelled')]);
    equal(outcomes(seq), ['running', 'running', 'cancelling', 'cancelling', 'cancelled'],
      'running before the request; `cancelling` from it while either task is unsettled; `cancelled` at the LAST settlement');
    equal(fold(seq).cancelRequest, { actor: 'ana', reason: 'no longer needed' }, 'the cell carries the element`s actor and reason');
    equal([fold(seq).nodes[A]!.state, fold(seq).nodes[B]!.state], ['cancelled', 'cancelled'], 'each task folded verbatim');
    // The CONTROL: no request — the first `cancelled` settlement is RN-R28's and ends the run at once.
    equal(outcomes([dispatched(A), dispatched(B), settled(A, 'cancelled')]), ['running', 'running', 'cancelled'],
      'the control: without the request the FIRST cancelled settlement is `cancelled` (RN-R28) — so the `cancelling` above is the request`s');
  });

  test(DECLARED_CASES[1]!, () => {
    const done = keep('last-done', [dispatched(A), dispatched(B), request(), settled(A, 'cancelled'), settled(B, 'done')]);
    const failed = keep('last-failed', [dispatched(A), dispatched(B), request(), settled(B, 'failed'), settled(A, 'cancelled')]);
    equal(outcomes(done).slice(2), ['cancelling', 'cancelling', 'cancelled'], 'a task that finished `done` before its cancel took ends the last wait');
    equal(outcomes(failed).slice(2), ['cancelling', 'cancelling', 'cancelled'], 'a `failed` one ends ITS wait and the run waits on the other');
    equal([fold(done).nodes[B]!.state, fold(failed).nodes[B]!.state], ['done', 'failed'], 'each settlement folded as it arrived');
    equal(fold(done).pathEnds, [], 'and nothing routes from it: the fold invents no path end');
  });

  test(DECLARED_CASES[2]!, () => {
    const seq = keep('beside-parked', [dispatched(A), settled(A, 'user_action'), dispatched(B), request(), settled(B, 'cancelled')]);
    equal(outcomes(seq), ['running', 'awaiting_action', 'awaiting_action', 'cancelling', 'cancelled'],
      '`awaiting_action` before the request; `cancelling` OVER it while B stops; `cancelled` once B has — the parked A is not waited on');
    equal(fold(seq).nodes[A]!.state, 'suspended', 'and A stays `suspended`: nothing is written per parked task (P34 (i))');
    // The CONTROL: the same without the request — `awaiting_action` throughout, the parked task outranking everything.
    equal(fold([dispatched(A), settled(A, 'user_action'), dispatched(B)]).outcome, 'awaiting_action',
      'the control: a parked task and a running one, no request, is `awaiting_action` (RN-R7)');
  });

  test(DECLARED_CASES[3]!, () => {
    const seq = keep('nothing-running', [dispatched(A), settled(A, 'user_action'), request('ops', null)]);
    equal(outcomes(seq), ['running', 'awaiting_action', 'cancelled'], 'nothing running at the request: `cancelled` at the element itself');
    equal(fold(seq).cancelRequest, { actor: 'ops', reason: null }, '`reason` is `null` when the caller gave none');
  });

  test(DECLARED_CASES[4]!, () => {
    const before = keep('halt-then-request', [dispatched(A), halt, request()]);
    const after = keep('request-then-halt', [dispatched(A), request(), halt]);
    equal([fold(before).outcome, fold(after).outcome], ['halted', 'halted'], '`halted` outranks `cancelling` in both orders (RN-R8)');
    equal([fold(before).cancelRequest, fold(after).cancelRequest], [{ actor: 'ana', reason: 'no longer needed' }, { actor: 'ana', reason: 'no longer needed' }],
      'and the request is recorded either way — only a `cancelled` run refuses to record it');
    equal(fold(after).haltedBy, 'UndispatchedTask: x', 'with the halt`s reason');
  });

  test(DECLARED_CASES[5]!, () => {
    const prefix = [dispatched(A), dispatched(B), settled(A, 'cancelled')];
    const seq = keep('request-after-rn-r28', [...prefix, request()]);
    equal(fold(prefix).outcome, 'cancelled', 'the ARRANGEMENT: RN-R28 ended the run with B still running');
    equal(fold(seq), fold(prefix), 'the request after it moves NOTHING — the state is the prefix`s, `cancelRequest` still `null`');
    // The CONTROL: the same two settlements' worth with the request FIRST — `cancelling`, so the order is what decides.
    equal(fold([dispatched(A), dispatched(B), request(), settled(A, 'cancelled')]).outcome, 'cancelling',
      'the control: the request BEFORE the cancelled settlement reads `cancelling` while B runs');
    const twice = keep('second-request', [dispatched(A), request('ana'), request('bob', 'again')]);
    equal(fold(twice), fold(twice.slice(0, 2)), 'a SECOND request moves nothing: the first is the run`s');
  });

  test(DECLARED_CASES[6]!, () => {
    const region: FoldInput[] = [{ kind: 'regionEntered', regionId: 'split', regionPath: '-' }, opened('0'), opened('1'),
      dispatched('r1:a:0:0'), dispatched('r1:b:1:0')];
    // The CONTROL: both branches settle, no join fires, no path ends — RN-R10's `stuck`.
    equal(fold([...region, settled('r1:a:0:0', 'done'), settled('r1:b:1:0', 'done')]).outcome, 'stuck',
      'the control: a region whose join never fired, nothing live — `stuck`');
    const cancelled = keep('join-cancelled', [...region, request(), settled('r1:a:0:0', 'cancelled'), settled('r1:b:1:0', 'cancelled')]);
    const finished = keep('join-done', [...region, request(), settled('r1:a:0:0', 'done'), settled('r1:b:1:0', 'done')]);
    equal(outcomes(cancelled).slice(5), ['cancelling', 'cancelling', 'cancelled'], 'the same region under a request: `cancelling`, then `cancelled` — never `stuck`');
    equal(fold(finished).outcome, 'cancelled', 'and `cancelled` even when both branches finished `done` before their cancels took');
    equal(fold(cancelled).regions.split?.['-']?.joined, null, 'the join stays unfired: the condition `stuck` reads, outranked');
  });

  test(DECLARED_CASES[7]!, () => {
    const cancelling = fold([dispatched(A), request()]);
    const cancelled = fold([dispatched(A), request(), settled(A, 'cancelled')]);
    equal([cancelling.outcome, isTerminal(cancelling)], ['cancelling', false], '`cancelling` is NOT terminal: a settlement is still coming (RN-R12)');
    equal([cancelled.outcome, isTerminal(cancelled)], ['cancelled', true], '`cancelled` is');
    // Section 2's whole shape, one step from the empty state: the request alone, nothing running — `cancelled`.
    equal(step(emptyState(), request('ops', 'r')),
      { runId: null, outcome: 'cancelled', nodes: {}, regions: {}, pathEnds: [], haltedBy: null, cancelRequest: { actor: 'ops', reason: 'r' }, interruption: null, resumes: [], gated: [] } satisfies RunState,
      'step() on the empty state: `cancelRequest` and `outcome` set, nothing else');
  });

  test(DECLARED_CASES[8]!, () => {
    const names = Object.keys(ALL);
    equal(names.length, 11, 'the ARRANGEMENT: eleven sequences kept by the cases above');
    for (const name of names) {
      const seq = ALL[name]!;
      equal(fold(seq), fold(seq), `${name}: folded twice, deep-equal (RN-R1, L3)`);
      for (let n = 0; n < seq.length; n += 1) {
        equal(step(fold(seq.slice(0, n)), seq[n]!), fold(seq.slice(0, n + 1)), `${name}: step over the prefix of ${n} equals the fold of ${n + 1} (RN-R2)`);
      }
    }
  });

  test(DECLARED_CASES[9]!, () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name));
    equal(ran, DECLARED_CASES, 'each declared case registered, in order, and no other — an emptied or renamed case fails here');
  });
});
