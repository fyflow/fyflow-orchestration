/**
 * OR-R1 to OR-R9, RS-R1 to RS-R3, ID-R1, ID-R2 — the listener boundary, the log,
 * and the effective outcome.
 *
 * Expected values come from `spec/outcome-record.md` and `spec/task-id.md`, never
 * from what the code returned. Every fixture here is hand-written from the spec's
 * three-row table in section 3; none is captured from a run.
 */
import { equal, ok, suite, throws } from '../harness.ts';
import { normalizeEvent, UncloneableResult, type TaskDetailLike } from '../../src/driver/listener.ts';
import { effectiveOutcome, isSuspended, type LogRecord } from '../../src/driver/log.ts';
import { buildTaskId, InvalidRunId, parseTaskId, assertRunId } from '../../src/driver/ids.ts';

const NOW = 1_756_512_000_000;

/** A live task, mutable on purpose — OR-R1's test needs to mutate it after the listener returns. */
function liveTask(over: Partial<TaskDetailLike> = {}): TaskDetailLike {
  return {
    id: 'r7c1f:score:-:0',
    state: 'done',
    result: { score: 0.41 },
    error: undefined,
    attempts: 0,
    timestamp: NOW - 1,
    startTime: NOW - 200,
    endTime: NOW - 2,
    executionTime: 198,
    ...over,
  };
}

suite('OR-R3 — one record per settlement, keyed on terminal state not event name', (test) => {
  // The three rows of spec/outcome-record.md section 3, verbatim.
  test('done: task.completed writes one record', () => {
    const r = normalizeEvent('task.completed', liveTask({ state: 'done' }), NOW);
    equal(r?.terminalState, 'done', 'a completed task must record terminalState "done"');
  });

  test('failed (optional task): task.failed writes one record', () => {
    const r = normalizeEvent('task.failed', liveTask({ state: 'failed', error: 'boom' }), NOW);
    equal(r?.terminalState, 'failed', 'an optional task settling failed must record "failed"');
    equal(r?.error, 'boom', 'error is a string on the task; the Error object never reaches a listener');
  });

  test('user_action: task.failed writes NOTHING, task.user_action writes the record', () => {
    const task = liveTask({ state: 'user_action', result: undefined, error: 'out of retries' });
    equal(
      normalizeEvent('task.failed', task, NOW),
      null,
      'task.failed carrying an already-user_action task is the precursor and must write nothing — ' +
        'a driver keying on the event name double-counts and routes a human case down an error edge',
    );
    const second = normalizeEvent('task.user_action', task, NOW);
    equal(second?.terminalState, 'user_action', 'the second event writes the one record');
  });
});

suite('OR-R4 — task.running and task.progress produce no record', (test) => {
  test('task.running writes nothing', () => {
    equal(normalizeEvent('task.running', liveTask({ state: 'running' }), NOW), null, 'running is not a settlement');
  });
  test('task.progress writes nothing even with a terminal-looking state', () => {
    equal(normalizeEvent('task.progress', liveTask({ state: 'done' }), NOW), null, 'progress is not a settlement');
  });
});

suite('OR-R1 — nothing reachable from e.detail is retained', (test) => {
  test('mutating the live task after the listener returns does not change the record', () => {
    const task = liveTask();
    const record = normalizeEvent('task.completed', task, NOW)!;

    // Exactly what the scheduler does to a task it keeps: timestamp is stamped
    // before every later event, and an inline worker may still hold `result`.
    task.timestamp = NOW + 5_000;
    task.state = 'failed';
    task.error = 'mutated afterwards';
    (task.result as { score: number }).score = -1;

    equal(record.schedulerTimestamp, NOW - 1, 'schedulerTimestamp must be the value read in the listener');
    equal(record.terminalState, 'done', 'terminalState must not follow the live task');
    equal(record.error, null, 'error must not follow the live task');
    equal(
      record.result,
      { score: 0.41 },
      'result must be a deep copy — a {...e.detail} spread copies the top level and still aliases result',
    );
  });
});

suite('OR-R2 and OR-R6 — result is deep-copied, and an uncloneable one fails the run', (test) => {
  test('a nested object mutated by the worker does not reach the record', () => {
    const inner = { deep: { n: 1 } };
    const record = normalizeEvent('task.completed', liveTask({ result: inner }), NOW)!;
    inner.deep.n = 999;
    equal(record.result, { deep: { n: 1 } }, 'the copy must be deep, not a shallow spread');
  });

  test('a non-cloneable result throws UncloneableResult naming the task', () => {
    throws(
      () => normalizeEvent('task.completed', liveTask({ result: () => 1 }), NOW),
      'UncloneableResult',
      'a function result cannot be logged, handed to a predicate, or persisted',
    );
    ok(new UncloneableResult('x') instanceof Error, 'UncloneableResult is an Error');
  });

  test('result is null unless the terminal state is done', () => {
    const r = normalizeEvent('task.failed', liveTask({ state: 'failed', result: { stale: true } }), NOW)!;
    equal(r.result, null, 'the guard is part of the expression, not a caveat on it');
  });
});

suite('OR-R5 and OR-R7 — the log is ordered by append', (test) => {
  test('observedAt and schedulerTimestamp are separate fields', () => {
    const r = normalizeEvent('task.completed', liveTask({ timestamp: NOW - 50 }), NOW)!;
    equal(r.observedAt, NOW, "observedAt is the driver's own clock");
    equal(r.schedulerTimestamp, NOW - 50, "schedulerTimestamp is the library's");
    ok(r.observedAt !== r.schedulerTimestamp, 'the gap between them is the listener latency (ADR 0007 rule 4)');
  });
});

suite('OR-R8 and OR-R9 — the effective outcome', (test) => {
  const id = 'r7c1f:review:-:0';
  const settled: LogRecord = {
    kind: 'outcome', taskId: id, terminalState: 'user_action', result: null, error: 'needs a human',
    attempts: 2, schedulerTimestamp: NOW, observedAt: NOW, startTime: NOW - 9, endTime: NOW, executionTime: 8,
  };

  test('a suspended node has no effective outcome', () => {
    equal(effectiveOutcome([settled], id), null, 'it has not finished, so nothing routes');
  });

  test('a resolution replaces terminalState, result and error — and nothing else', () => {
    const log: LogRecord[] = [
      settled,
      { kind: 'resolution', taskId: id, resolvedAs: 'done', result: { approved: true }, error: null,
        actor: 'ops:jane', observedAt: NOW + 60_000 },
    ];
    const eff = effectiveOutcome(log, id)!;
    equal(eff.terminalState, 'done', "resolvedAs becomes the terminal state");
    equal(eff.result, { approved: true }, "the human's answer is what routes");
    equal(eff.error, null, 'error clears with the state');
    equal(eff.attempts, 2, 'attempts describes the dispatch that happened; a resolution executed nothing');
    equal(eff.startTime, NOW - 9, 'timing fields stay the settlement’s');
    equal(eff.schedulerTimestamp, NOW, "schedulerTimestamp stays the settlement's — no scheduler resolved anything");
    equal(eff.observedAt, NOW + 60_000, "observedAt is the resolution's: the later record BY APPEND ORDER");
    equal(eff.kind, 'outcome', 'an effective outcome has an outcome record’s shape (OR-R9: one shape)');
  });

  test('the effective outcome is derived, never appended', () => {
    const log: LogRecord[] = [
      settled,
      { kind: 'resolution', taskId: id, resolvedAs: 'failed', result: null, error: 'gave up',
        actor: 'ops:sam', observedAt: NOW + 10 },
    ];
    const before = log.length;
    effectiveOutcome(log, id);
    effectiveOutcome(log, id);
    equal(log.length, before, 'deriving it twice must not grow the log (OR-R8)');
  });
});

suite('RS-R1 — a resolution is refused unless the LAST record is user_action', (test) => {
  const id = 'r7c1f:review:-:0';
  const susp: LogRecord = {
    kind: 'outcome', taskId: id, terminalState: 'user_action', result: null, error: 'x',
    attempts: 0, schedulerTimestamp: NOW, observedAt: NOW, startTime: null, endTime: null, executionTime: null,
  };

  test('a suspended task is resolvable', () => {
    ok(isSuspended([susp], id), 'last record is an outcome in user_action');
  });

  test('an already-resolved task is NOT suspended — this is the second-resolution case', () => {
    const log: LogRecord[] = [
      susp,
      { kind: 'resolution', taskId: id, resolvedAs: 'done', result: null, error: null, actor: 'a', observedAt: NOW + 1 },
    ];
    ok(
      !isSuspended(log, id),
      'an implementation keyed on "has a user_action record" rather than "last record is" accepts a ' +
        'second resolution and appends two — this is the case RS-R1 exists for',
    );
  });

  test('a done task and an unknown task are not suspended', () => {
    const done: LogRecord = { ...susp, terminalState: 'done', error: null };
    ok(!isSuspended([done], id), 'a settled-done task is not suspended');
    ok(!isSuspended([], 'r7c1f:nope:-:0'), 'an unknown task id is not suspended');
  });
});

suite('spec/task-id.md — the scheme, the parse, and ID-R2', (test) => {
  test('four segments, always four', () => {
    equal(buildTaskId('r7c1f', 'score', null), 'r7c1f:score:-:0', 'a node in no region uses "-"');
    equal(buildTaskId('r7c1f', 'scoreB', 1), 'r7c1f:scoreB:1:0', 'a branch index is the third segment');
  });

  test('the parse is total for anything this module built', () => {
    equal(parseTaskId('r7c1f:scoreB:1:0'), { runId: 'r7c1f', nodeId: 'scoreB', branchPath: '1', attempt: 0 },
      'split(":") asserting length 4');
    equal(parseTaskId('r7c1f:scoreB:1.0:2').branchPath, '1.0', 'the reserved nested shape parses');
  });

  test('an id with the wrong arity is refused rather than half-read', () => {
    throws(() => parseTaskId('r7c1f:score'), '2 segments', 'fixed arity is the point');
    throws(() => parseTaskId('a:b:-:0:extra'), '5 segments', 'five is as wrong as two');
  });

  test('ID-R2 — a runId outside the charset is refused at run creation', () => {
    throws(() => assertRunId('run:1'), 'not [A-Za-z0-9_-]', 'a colon would make the parse ambiguous');
    throws(() => assertRunId(''), 'not [A-Za-z0-9_-]', 'empty is not a run id');
    ok(new InvalidRunId('x') instanceof Error, 'InvalidRunId is an Error');
  });
});
