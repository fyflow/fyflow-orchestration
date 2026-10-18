/**
 * **L1 and L3 — what an `asked` element folds to** — `spec/run-state.md` `RN-R36` (v0.22), `RN-R7`, `RN-R9`, `RN-R30`,
 * `RN-R32`; `spec/outcome-record.md` `RS-R1` and section 7 (v0.18);
 * [ADR 0109](../../doc/decisions/0109-an-ask-parks-with-nothing-dispatched-and-its-answer-is-its-result.md), P35
 * stop-and-asks (b), (c), (e) and (f), [W180](../../doc/work-items/w180-asking-and-answering-in-a-run.md).
 *
 * Over HAND-WRITTEN input sequences, never a driver's: the node is `suspended` from its `asked` element with what
 * reached it kept as `input`; the run is `awaiting_action` by `RN-R7` with no precedence moved; the answer — the
 * existing `resolution` — takes the node to its state and result exactly as it does a parked task's, and the input
 * stays. Each claim beside a CONTROL: a parked TASK's sequence, the same but for the one element the claim is about.
 */
import { collected, deepEqual, equal, ok, suite } from '../harness.ts';
import { fold, step, type FoldInput } from '../../src/fold/run-state.ts';
import { effectiveOutcome, isSuspended, type LogRecord } from '../../src/driver/log.ts';

const SUITE = 'L1 — RN-R36: an `asked` element folds the node `suspended` with its input KEPT, and the run `awaiting_action`';

const A = 'r1:approve:-:0';
const T = 'r1:review:-:0';
const asked = (taskId: string, input: unknown): FoldInput => ({ kind: 'asked', taskId, input });
const answer = (taskId: string, resolvedAs: 'done' | 'failed', result: unknown, error: string | null = null): FoldInput =>
  ({ kind: 'resolution', record: { kind: 'resolution', taskId, resolvedAs, result, error, actor: 'ana', observedAt: 9 } });
const parked = (taskId: string): FoldInput[] => [
  { kind: 'dispatched', taskId },
  { kind: 'outcome', record: { kind: 'outcome', taskId, terminalState: 'user_action', result: null, error: 'x', attempts: 1, schedulerTimestamp: 1, observedAt: 2, startTime: 1, endTime: 2, executionTime: 1 } },
];

const DECLARED_CASES = [
  'an `asked` element: the node `suspended`, its input KEPT, result and error null — and the run `awaiting_action`',
  'awaiting_action outranks running, and cancelled, cancelling and interrupted each outrank awaiting_action — no precedence moved',
  'an ANSWERED ask is indistinguishable in `nodes` from a resolved task but for `input`, kept after the answer',
  'a DECLINE folds the node `failed` with its error, its input kept',
  'the kept input is a COPY, and a second `asked` for the same id moves nothing',
  'RN-R2 over an ask`s sequence: every prefix folds, and folding a prefix then the next element is folding both',
  'L3 — an ask`s sequence folds the same way twice',
  'RS-R1 and section 7 at the log: an asked id with no record is suspended, and its answer`s effective outcome is DERIVED',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test(DECLARED_CASES[0]!, () => {
    const s = fold([asked(A, { request: { n: 1 } })]);
    // W187 (RN-R41): an ask is never handed to a scheduler — its attemptNumber is null.
    equal(s.nodes, { [A]: { runId: 'r1', nodeId: 'approve', branchPath: '-', flowAttempt: 0, attemptNumber: null, state: 'suspended', result: null, error: null, input: { request: { n: 1 } } } },
      'one entry, keyed by the ask`s task id, its node and path parsed from it');
    equal(s.runId, 'r1', 'the run id read from the task id, as a dispatch`s is');
    equal(s.outcome, 'awaiting_action', 'RN-R7: a suspended node, so the run waits on a person');
    // CONTROL: a parked task's sequence folds the node `suspended` too — and carries no `input`.
    const c = fold(parked(T));
    equal(c.outcome, 'awaiting_action', 'the CONTROL: a parked task, the same outcome');
    ok(!('input' in c.nodes[T]!), 'and a task`s entry has NO `input` key — it is set only on an ask`s node');
    const mid = fold([asked('r1:check:0.1:0', 'x')]);
    equal([mid.nodes['r1:check:0.1:0']!.nodeId, mid.nodes['r1:check:0.1:0']!.branchPath], ['check', '0.1'], 'a nested branch path parsed from the id');
  });

  test(DECLARED_CASES[1]!, () => {
    equal(fold([{ kind: 'dispatched', taskId: 'r1:other:-:0' }, asked(A, 1)]).outcome, 'awaiting_action', 'a running task beside it: still awaiting_action (RN-R7)');
    equal(fold([asked(A, 1), { kind: 'cancelRequested', actor: 'o', reason: null }]).outcome, 'cancelled',
      'a cancel REQUESTED with only an ask parked: `cancelled` at once — RN-R30 reads RUNNING nodes, and an ask is never running');
    equal(fold([{ kind: 'dispatched', taskId: 'r1:other:-:0' }, asked(A, 1), { kind: 'cancelRequested', actor: 'o', reason: null }]).outcome, 'cancelling',
      'and `cancelling` while a dispatched task is still unsettled');
    equal(fold([asked(A, 1), { kind: 'interrupted', actor: 'o', reason: null }]).outcome, 'interrupted', 'a stop: `interrupted` (RN-R32)');
    equal(fold([asked(A, 1), { kind: 'halted', reason: 'X: y' }]).outcome, 'halted', 'a halt: `halted` (RN-R8)');
    equal(fold([asked(A, 1), { kind: 'paused', actor: 'o' }]).outcome, 'awaiting_action', 'a pause moves no outcome (RN-R34)');
  });

  test(DECLARED_CASES[2]!, () => {
    const a = fold([asked(A, { doc: 'd' }), answer(A, 'done', { approved: true })]);
    const t = fold([...parked(A), answer(A, 'done', { approved: true })]);
    const { input, ...rest } = a.nodes[A]!;
    equal(input, { doc: 'd' }, 'the input is KEPT after the answer (P35 (f))');
    equal(rest, t.nodes[A], 'and with it set aside, the ask`s entry IS the resolved task`s (RN-R9, RS-R3 one layer up)');
    equal(a.nodes[A]!.state, 'done', 'state the answer`s `resolvedAs`');
    equal(a.nodes[A]!.result, { approved: true }, 'result the answer');
    ok(!deepEqual(a.nodes[A], t.nodes[A]), 'the CONTROL: WITH `input` the two differ — the one key the claim sets aside is really there');
    equal(a.outcome, 'completed', 'nothing live, nothing parked, no path end reported: the fall-back reads the node states');
  });

  test(DECLARED_CASES[3]!, () => {
    const s = fold([asked(A, 7), answer(A, 'failed', null, 'no thanks')]);
    equal(s.nodes[A], { runId: 'r1', nodeId: 'approve', branchPath: '-', flowAttempt: 0, attemptNumber: null, state: 'failed', result: null, error: 'no thanks', input: 7 },
      'the decline`s state and error, the input still kept');
  });

  test(DECLARED_CASES[4]!, () => {
    const input = { deep: { list: [1, 2] } };
    const seq = [asked(A, input)];
    const s = fold(seq);
    input.deep.list.push(3);
    equal(s.nodes[A]!.input, { deep: { list: [1, 2] } }, 'the state holds its OWN copy: the element`s value moving later moves nothing (RN-R2)');
    const again = fold([asked(A, { first: true }), asked(A, { second: true })]);
    equal(again.nodes[A]!.input, { first: true }, 'a second `asked` for one id is ignored — the driver mints an ask`s id once per path');
    const afterAnswer = fold([asked(A, 1), answer(A, 'done', 2), asked(A, 3)]);
    equal([afterAnswer.nodes[A]!.state, afterAnswer.nodes[A]!.input], ['done', 1], 'and one after the answer does not re-park it');
  });

  test(DECLARED_CASES[5]!, () => {
    const seq: FoldInput[] = [
      { kind: 'dispatched', taskId: 'r1:ingest:-:0' },
      { kind: 'outcome', record: { kind: 'outcome', taskId: 'r1:ingest:-:0', terminalState: 'done', result: { s: 1 }, error: null, attempts: 0, schedulerTimestamp: 1, observedAt: 1, startTime: 1, endTime: 2, executionTime: 1 } },
      asked(A, { s: 1 }),
      answer(A, 'done', { approved: true }),
      { kind: 'dispatched', taskId: 'r1:publish:-:0' },
    ];
    const outcomes: string[] = [];
    for (let n = 0; n <= seq.length; n++) {
      const whole = fold(seq.slice(0, n));
      outcomes.push(whole.outcome);
      if (n > 0) equal(step(fold(seq.slice(0, n - 1)), seq[n - 1]!), whole, `fold(prefix ${n - 1}) then element ${n - 1} IS fold(prefix ${n})`);
    }
    equal(outcomes, ['running', 'running', 'completed', 'awaiting_action', 'completed', 'running'],
      'each prefix`s outcome: nothing yet, the task in flight, the task done, the ask parked, answered, the successor in flight');
  });

  test(DECLARED_CASES[6]!, () => {
    const seq: FoldInput[] = [asked(A, { m: [1, { k: 'v' }] }), asked('r1:other:0:0', null), answer(A, 'done', { a: 1 })];
    const one = fold(seq);
    const two = fold(seq);
    equal(one, two, 'deep-equal');
    ok(one !== two && one.nodes[A]!.input !== two.nodes[A]!.input, 'and two independent values — no input shared between two folds');
  });

  test(DECLARED_CASES[7]!, () => {
    const rec: LogRecord = { kind: 'resolution', taskId: A, resolvedAs: 'done', result: { ok: 1 }, error: null, actor: 'p', observedAt: 5 };
    ok(isSuspended([], A, true), 'asked, with no record: suspended');
    ok(!isSuspended([], A, false), 'the CONTROL: the same empty log, NOT asked: not suspended');
    ok(!isSuspended([rec], A, true), 'answered: not suspended — so a second answer is refused');
    equal(effectiveOutcome([], A), null, 'an unanswered ask has no effective outcome: nothing routes');
    equal(effectiveOutcome([rec], A), {
      kind: 'outcome', taskId: A, terminalState: 'done', result: { ok: 1 }, error: null,
      attempts: 0, schedulerTimestamp: null, observedAt: 5, startTime: null, endTime: null, executionTime: null,
    }, 'answered: DERIVED from the resolution alone — attempts 0, every scheduler field null');
    const failed: LogRecord = { ...rec, resolvedAs: 'failed', result: null, error: 'no' };
    equal([effectiveOutcome([failed], A)!.terminalState, effectiveOutcome([failed], A)!.error], ['failed', 'no'], 'a decline`s state and error');
  });

  test(DECLARED_CASES[8]!, () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name)).sort();
    const declared = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership');
  });
});
