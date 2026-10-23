/**
 * **L1 and L3 — `askedAt` on an ask's entry** — `spec/run-state.md` v0.35 `RN-R36`,
 * [ADR 0130](../../doc/decisions/0130-a-regenerated-asked-element-keeps-the-stored-runs-time.md) rule 4,
 * [W208](../../doc/work-items/w208-a-transforms-cause-and-when-an-ask-was-asked.md), P43 (e1), decision 7.
 *
 * Over HAND-WRITTEN input sequences, never a driver's: an `asked` element carrying `observedAt` folds its ask's entry with
 * `askedAt` equal to it, beside `input`; an element without one folds an entry without the key; a task's entry never
 * carries it; and the answer — a `done` or a decline — KEEPS it, as it keeps `input`. Every time below is a literal, and
 * every answer's record carries a DIFFERENT `observedAt` (`9`), so keeping the ask's and taking the answer's differ.
 */
import { collected, equal, ok, suite } from '../harness.ts';
import { fold, step, emptyState, type FoldInput } from '../../src/fold/run-state.ts';

const SUITE = 'L1 — RN-R36 v0.35: an ask`s entry carries askedAt from its `asked` element`s observedAt, only where the element says, kept through the answer';

const A = 'r1:approve:-:0';
const B = 'r1:approve:1:0';
const asked = (taskId: string, input: unknown, observedAt?: number): FoldInput =>
  (observedAt === undefined ? { kind: 'asked', taskId, input } : { kind: 'asked', taskId, input, observedAt });
const answer = (taskId: string, resolvedAs: 'done' | 'failed', result: unknown, error: string | null = null): FoldInput =>
  ({ kind: 'resolution', record: { kind: 'resolution', taskId, resolvedAs, result, error, actor: 'ana', observedAt: 9 } });
const task = (taskId: string): FoldInput[] => [
  { kind: 'dispatched', taskId },
  { kind: 'outcome', record: { kind: 'outcome', taskId, terminalState: 'done', result: 1, error: null, attempts: 0, schedulerTimestamp: 1, observedAt: 7, startTime: 1, endTime: 2, executionTime: 1 } },
];

const DECLARED_CASES = [
  'an `asked` element WITH observedAt: the entry carries askedAt equal to it, after input — and WITHOUT one, no askedAt key (the control on the same observer)',
  'askedAt is KEPT through a done answer and through a decline — the ask`s time, not the answer`s',
  'a TASK`s entry never carries askedAt, though its outcome record has an observedAt; two asks keep each their own',
  'every prefix folds to the same state as stepping it, and L3 — the sequence folded twice is equal and independent',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test(DECLARED_CASES[0]!, () => {
    const s = fold([asked(A, { n: 1 }, 100)]);
    equal(s.nodes[A], { runId: 'r1', nodeId: 'approve', branchPath: '-', flowAttempt: 0, attemptNumber: null, state: 'suspended', result: null, error: null, input: { n: 1 }, askedAt: 100 },
      'askedAt 100, from the element');
    equal(Object.keys(s.nodes[A]!).slice(-2), ['input', 'askedAt'], 'beside input, after it');
    const old = fold([asked(A, { n: 1 })]);
    ok('input' in old.nodes[A]! && !('askedAt' in old.nodes[A]!), 'an element with NO observedAt (written before 0.11.0): the entry has input and NO askedAt key');
    const undef = fold([{ kind: 'asked', taskId: A, input: 1, observedAt: undefined } as FoldInput]);
    ok(!('askedAt' in undef.nodes[A]!), 'an observedAt key holding undefined reads as absent — no askedAt key either');
  });

  test(DECLARED_CASES[1]!, () => {
    const done = fold([asked(A, 'x', 100), answer(A, 'done', { ok: true })]);
    equal([done.nodes[A]!.state, done.nodes[A]!.result, done.nodes[A]!.input, done.nodes[A]!.askedAt], ['done', { ok: true }, 'x', 100], 'done: askedAt 100 kept, not the answer`s 9');
    const declined = fold([asked(A, 'x', 100), answer(A, 'failed', null, 'no')]);
    equal([declined.nodes[A]!.state, declined.nodes[A]!.error, declined.nodes[A]!.askedAt], ['failed', 'no', 100], 'a decline: askedAt 100 kept');
    const old = fold([asked(A, 'x'), answer(A, 'done', 1)]);
    ok(!('askedAt' in old.nodes[A]!), 'the CONTROL: answered without one, the entry still has none — the answer adds no time');
  });

  test(DECLARED_CASES[2]!, () => {
    const s = fold([...task('r1:draft:-:0'), asked(A, 'a', 100), asked(B, 'b', 200)]);
    ok(!('askedAt' in s.nodes['r1:draft:-:0']!), 'the task`s entry has no askedAt — its record`s observedAt 7 is not one');
    equal([s.nodes[A]!.askedAt, s.nodes[B]!.askedAt], [100, 200], 'each ask its own time');
    equal(fold([asked(A, 'a', 100), asked(A, 'other', 300)]).nodes[A]!.askedAt, 100, 'a second asked for the same id moves nothing — the dispatched rule');
  });

  test(DECLARED_CASES[3]!, () => {
    const seq = [...task('r1:draft:-:0'), asked(A, { deep: [1] }, 100), asked(B, 'b'), answer(A, 'done', 2), answer(B, 'failed', null, 'no')];
    let s = emptyState();
    for (let n = 1; n <= seq.length; n += 1) {
      s = step(s, seq[n - 1]!);
      equal(s, fold(seq.slice(0, n)), `prefix ${n}: step equals fold`);
    }
    const one = fold(seq), two = fold(seq);
    equal(one, two, 'L3: folded twice, equal');
    ok(one !== two && one.nodes[A] !== two.nodes[A], 'and two independent values');
    equal([one.nodes[A]!.askedAt, 'askedAt' in one.nodes[B]!], [100, false], 'and the field is there to compare: 100 on A, none on B');
  });

  test(DECLARED_CASES[4]!, () => {
    const ran = collected().find((s) => s.suite === SUITE)!.cases.map((c) => c.name).sort();
    const declared: string[] = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership');
  });
});
