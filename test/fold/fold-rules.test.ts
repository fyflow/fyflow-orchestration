/**
 * The rules W2 owes whose tests could not fail, and the two it owed and never
 * shipped.
 *
 * W2's conformity pass ran 52 mutations and found the pattern all four prior
 * passes found: **correct code, tests pointed at the wrong half.** An impure
 * `step` on the record path, a run that ignored its own stop, a `lost` recorded
 * as an `exited`, a `describe` that dropped its discriminating field, and an
 * `arrival-count` that never read its `Region` all survived a green suite in five
 * runtimes.
 *
 * `OR-R7` and `OR-R8` are worse than untested: `spec/outcome-record.md` assigns
 * both to **W2** with prescribed tests, W2's declaration repeats them verbatim,
 * and neither shipped. The only suites carrying those names are W3's, and they
 * assert something else.
 */
import { equal, ok, suite } from '../harness.ts';
import { fold, foldLog, step, type FoldInput, type RunState } from '../../src/fold/run-state.ts';
import { arrivalCount, liveToken } from '../../src/fold/policies.ts';
import type { LogRecord } from '../../src/driver/log.ts';
import type { RegionEvent } from '../../src/driver/events.ts';
import type { Region } from '../../src/driver/policy.ts';

const NOW = 1_756_512_000_000;
const settled = (taskId: string, terminalState: 'done' | 'failed' | 'user_action'): LogRecord => ({
  kind: 'outcome', taskId, terminalState,
  result: terminalState === 'done' ? { of: taskId } : null,
  error: terminalState === 'done' ? null : 'boom',
  attempts: 0, schedulerTimestamp: NOW, observedAt: NOW,
  startTime: NOW - 5, endTime: NOW, executionTime: 5,
} as LogRecord);
const resolution = (taskId: string, resolvedAs: 'done' | 'failed'): LogRecord => ({
  kind: 'resolution', taskId, resolvedAs,
  result: resolvedAs === 'done' ? { by: 'human' } : null,
  error: resolvedAs === 'failed' ? 'gave up' : null,
  actor: 'ops:jane', observedAt: NOW + 60_000,
} as LogRecord);
const rec = (r: LogRecord): FoldInput => ({ kind: r.kind, record: r });
const region = (e: RegionEvent): FoldInput => ({ kind: 'region', event: e });
const dispatched = (taskId: string): FoldInput => ({ kind: 'dispatched', taskId });

suite('RN-R1 — step is pure on the RECORD path, not only the region path', (test) => {
  test('a settlement does not mutate the state it was given', () => {
    // The v0.1 test called step() with a REGION event, so the record branch —
    // which runs for every log record — was never exercised. Replacing its
    // `{ ...prev.nodes }` with `prev.nodes` survived all 184 assertions.
    const before = foldLog([settled('r1:a:-:0', 'done')]);
    const snapshot = structuredClone(before);
    const after = step(before, rec(settled('r1:b:-:0', 'failed')));
    equal(before, snapshot, 'the input state is untouched');
    ok(before.nodes !== after.nodes, 'and `nodes` is a new object, not the same one written into');
    equal(Object.keys(before.nodes), ['r1:a:-:0'], 'the new node did not appear in the old state');
  });

  test('a resolution does not mutate it either', () => {
    const before = foldLog([settled('r1:a:-:0', 'user_action')]);
    const snapshot = structuredClone(before);
    step(before, rec(resolution('r1:a:-:0', 'done')));
    equal(before, snapshot, 'the same branch, reached the other way');
  });

  test('a dispatch does not mutate it', () => {
    const before = foldLog([settled('r1:a:-:0', 'done')]);
    const snapshot = structuredClone(before);
    step(before, dispatched('r1:b:-:0'));
    equal(before, snapshot, 'and the input kind added in v0.2 obeys the same rule');
  });
});

suite('RN-R8 — stopped outranks everything, INCLUDING records that follow it', (test) => {
  test('a settlement appended after the stop does not change the outcome', () => {
    // The v0.1 test applied `stopped` LAST, and step's stopped branch sets the
    // outcome directly — so deleting withOutcome's guard survived. The rule says
    // "whatever its nodes say", which needs a node to say something afterwards.
    const stopped = step(foldLog([settled('r1:a:-:0', 'done')]), { kind: 'stopped', reason: 'DuplicateTaskId' });
    const after = step(stopped, rec(settled('r1:b:-:0', 'done')));
    equal(after.outcome, 'stopped', 'the log after a refusal is incomplete by construction');
    equal(after.stoppedBy, 'DuplicateTaskId', 'and it still names the refusal');
    ok(after.nodes['r1:b:-:0'] !== undefined, 'the record is still recorded — it is the OUTCOME that latches');
  });

  test('a suspended node after the stop does not make it awaiting_action', () => {
    const stopped = step(fold([]), { kind: 'stopped', reason: 'UncloneableResult' });
    equal(step(stopped, rec(settled('r1:a:-:0', 'user_action'))).outcome, 'stopped',
      'RN-R8 outranks RN-R7, which is the only ordering between them the spec states');
  });
});

suite('RN-R7 — awaiting_action outranks running, now that both are reachable', (test) => {
  test('a suspended node beats a live one', () => {
    // Before `dispatched` existed no state could hold both, so this rule was
    // unfalsifiable and swapping the two branches survived the suite.
    const s = fold([
      dispatched('r1:a:-:0'), dispatched('r1:b:-:0'),
      rec(settled('r1:a:-:0', 'user_action')),
    ]);
    equal(s.nodes['r1:b:-:0']!.state, 'running', 'b is dispatched and not settled');
    equal(s.nodes['r1:a:-:0']!.state, 'suspended', 'a is waiting on a person');
    equal(s.outcome, 'awaiting_action',
      'the thing a reader must know is that a human is needed, not that other work continues');
  });

  test('and a live node alone is running', () => {
    equal(fold([dispatched('r1:a:-:0')]).outcome, 'running', 'dispatched and not settled');
  });

  test('a dispatch for an already-settled task does not resurrect it', () => {
    const s = fold([dispatched('r1:a:-:0'), rec(settled('r1:a:-:0', 'done')), dispatched('r1:a:-:0')]);
    equal(s.nodes['r1:a:-:0']!.state, 'done', 'ID-R1 refuses a real duplicate before dispatch');
    equal(s.outcome, 'completed', 'so a late dispatch input is a malformed sequence, not a new task');
  });
});

suite('completed vs failed is about how a PATH ended, not how a node settled', (test) => {
  test('a failed node that routed on to an `end` is a completed run', () => {
    // spec/examples/valid/failure-edge.flow.json: an `optional` node fails and
    // routes through its on:["failed"] edge to `quarantine`. Every live path
    // reached an `end`. "Some node settled failed" calls this failed and is wrong.
    const s = fold([
      dispatched('r1:extract:-:0'),
      rec(settled('r1:extract:-:0', 'failed')),
      { kind: 'pathEnded', reason: 'end', at: 'quarantine' },
    ]);
    equal(s.nodes['r1:extract:-:0']!.state, 'failed', 'the node did fail');
    equal(s.outcome, 'completed', 'and the run completed — this is the case ADR 0004 forced into existence');
  });

  test('a path with no eligible edge is a failed run', () => {
    const s = fold([
      dispatched('r1:a:-:0'), rec(settled('r1:a:-:0', 'failed')),
      { kind: 'pathEnded', reason: 'no-eligible-edge', at: 'a' },
    ]);
    equal(s.outcome, 'failed', "section 3's own words: a path ended with no eligible edge");
  });

  test('no-eligible-edge outranks end when a run has both', () => {
    const s = fold([
      { kind: 'pathEnded', reason: 'end', at: 'done' },
      { kind: 'pathEnded', reason: 'no-eligible-edge', at: 'b' },
    ]);
    equal(s.outcome, 'failed', 'one path failing makes the run failed however many others finished');
  });
});

suite('OR-R7 and OR-R8 — the two tests W2 owed and did not ship', (test) => {
  const log: FoldInput[] = [
    dispatched('r1:review:-:0'),
    rec(settled('r1:review:-:0', 'user_action')),
    rec(resolution('r1:review:-:0', 'done')),
  ];

  test('OR-R7 — a resolution is appended, never applied', () => {
    // The prescribed test, verbatim from spec/outcome-record.md section 3:
    // "fold a log containing a resolution twice and deep-compare, then assert the
    // same run state is reached by folding from scratch."
    equal(fold(log), fold(log), 'folding twice gives the same state');
    let incremental: RunState = fold([]);
    for (const i of log) incremental = step(incremental, i);
    equal(incremental, fold(log),
      'and the same state is reached record by record — a resolution that MUTATED run state ' +
      'rather than being folded would make these two disagree');
  });

  test('OR-R8 — the effective outcome is derived, never appended', () => {
    const inputs = [...log];
    const before = inputs.length;
    fold(inputs);
    fold(inputs);
    equal(inputs.length, before,
      'folding must not grow its own input. A fold that appended a derived record would make ' +
      'the log contain its own conclusions, and a second fold would derive a third record');
  });
});

suite('regions record what happened — including the distinctions W4 needs', (test) => {
  test('lost and exited are different settlements', () => {
    // Recording a `lost` as an `exited` survived the whole suite. W5's failure
    // matrix is exactly where that distinction is the answer.
    const s = fold([
      region({ type: 'branch.opened', regionId: 'f', branchPath: '0' }),
      region({ type: 'branch.opened', regionId: 'f', branchPath: '1' }),
      region({ type: 'branch.lost', regionId: 'f', branchPath: '0', reason: 'failed' }),
      region({ type: 'branch.exited', regionId: 'f', branchPath: '1', at: 'abandoned' }),
    ]);
    equal(s.regions['f']!.settled, { '0': 'lost', '1': 'exited' },
      'Q5 separates these two, so run state must too');
  });

  test('a terminal event clears a suspension', () => {
    const s = fold([
      region({ type: 'branch.opened', regionId: 'f', branchPath: '0' }),
      region({ type: 'branch.suspended', regionId: 'f', branchPath: '0', at: 'review' }),
      region({ type: 'branch.lost', regionId: 'f', branchPath: '0', reason: 'failed' }),
    ]);
    equal(s.regions['f']!.suspended, [], 'a branch that ended is not still waiting on a person');
    equal(s.regions['f']!.settled, { '0': 'lost' }, 'it ended');
  });

  test('branch.opened is deduplicated', () => {
    const s = fold([
      region({ type: 'branch.opened', regionId: 'f', branchPath: '0' }),
      region({ type: 'branch.opened', regionId: 'f', branchPath: '0' }),
    ]);
    equal(s.regions['f']!.opened, ['0'], 'JP-R5 gives one per branch; a duplicate is a malformed stream');
  });

  test('runId comes from the FIRST record, not the last', () => {
    // Two records with the SAME run id cannot tell first from last, which is why
    // the earlier version of this assertion survived taking it from the last.
    equal(fold([rec(settled('r1:a:-:0', 'done')), rec(settled('r2:b:-:0', 'done'))]).runId, 'r1',
      'one fold is one run; taking it from the last record would mean a log that somehow ' +
      'carried two runs silently reported the wrong one');
  });
});

suite('the policies against a Region that is not two branches', (test) => {
  // Every policy test used one fixed two-branch region, so an arrival-count that
  // ignored its Region entirely and hardcoded `need: 2` survived. P1's own plan
  // says it will measure "what a join costs at fan-out width".
  const wide: Region = {
    fanoutId: 'f', joinId: 'j',
    branches: ['a', 'b', 'c', 'd'], members: ['a', 'b', 'c', 'd'],
  };
  const arrived = (b: string): RegionEvent => ({ type: 'branch.arrived', regionId: 'f', branchPath: b });
  const opened = (b: string): RegionEvent => ({ type: 'branch.opened', regionId: 'f', branchPath: b });

  test('arrival-count reads N from region.branches.length', () => {
    let s = arrivalCount.open(wide);
    equal(arrivalCount.describe(s), { need: 4, arrived: [] }, 'four branches, not a hardcoded two');
    for (const b of ['0', '1', '2']) s = arrivalCount.step(s, arrived(b));
    equal(arrivalCount.status(s), 'waiting', 'three of four');
    s = arrivalCount.step(s, arrived('3'));
    equal(arrivalCount.status(s), 'satisfied', 'and four of four');
  });

  test('live-token counts whatever opened, at any width', () => {
    let s = liveToken.open(wide);
    for (const b of ['0', '1', '2', '3']) s = liveToken.step(s, opened(b));
    equal(liveToken.describe(s), { live: 4, positive: true }, 'four live');
    for (const b of ['0', '1', '2']) s = liveToken.step(s, arrived(b));
    equal(liveToken.status(s), 'waiting', 'one still live');
  });

  test('a one-branch region: both agree, and neither divides by anything', () => {
    const one: Region = { fanoutId: 'f', joinId: 'j', branches: ['a'], members: ['a'] };
    const ac = arrivalCount.step(arrivalCount.open(one), arrived('0'));
    const lt = liveToken.step(liveToken.step(liveToken.open(one), opened('0')), arrived('0'));
    equal([arrivalCount.status(ac), liveToken.status(lt)], ['satisfied', 'satisfied'],
      'FD-V9 forbids it in a definition, but a policy that broke here would break at width 1 in W4');
  });
});

suite('JP-R2 — describe reports CONTENT, not just valid JSON', (test) => {
  const r: Region = { fanoutId: 'f', joinId: 'j', branches: ['a', 'b'], members: ['a', 'b'] };
  const opened = (b: string): RegionEvent => ({ type: 'branch.opened', regionId: 'f', branchPath: b });
  const arrived = (b: string): RegionEvent => ({ type: 'branch.arrived', regionId: 'f', branchPath: b });

  test('live-token describes both live AND positive', () => {
    // Dropping `positive` from describe survived: JP-R2's test only asserted a
    // JSON round-trip. `describe` is how W4's matrix reports what a policy thought
    // it was waiting for, and the only way state leaves a policy (JP-R1).
    const s = liveToken.step(liveToken.open(r), opened('0'));
    equal(liveToken.describe(s), { live: 1, positive: true },
      'a describe missing `positive` cannot distinguish "not started" from "all settled"');
    equal(liveToken.describe(liveToken.open(r)), { live: 0, positive: false }, 'and at open');
  });

  test('arrival-count describes both need AND which branches arrived', () => {
    const s = arrivalCount.step(arrivalCount.open(r), arrived('1'));
    equal(arrivalCount.describe(s), { need: 2, arrived: ['1'] }, 'which branch, not just how many');
  });

  test("describe does not hand out the policy's own array", () => {
    const s = arrivalCount.step(arrivalCount.open(r), arrived('0'));
    (arrivalCount.describe(s) as { arrived: string[] }).arrived.push('9');
    equal(arrivalCount.describe(s), { need: 2, arrived: ['0'] },
      'JP-R1 purity reaches the way OUT as well: a caller must not be able to edit policy state');
  });
});

suite('the policies on non-conformant streams — asymmetries W4 could misread', (test) => {
  const r: Region = { fanoutId: 'f', joinId: 'j', branches: ['a', 'b'], members: ['a', 'b'] };
  const opened = (b: string): RegionEvent => ({ type: 'branch.opened', regionId: 'f', branchPath: b });
  const arrived = (b: string): RegionEvent => ({ type: 'branch.arrived', regionId: 'f', branchPath: b });

  test('arrival-count counts DISTINCT arrivals, so a duplicate does not satisfy it', () => {
    let s = arrivalCount.open(r);
    s = arrivalCount.step(s, arrived('0'));
    s = arrivalCount.step(s, arrived('0'));
    equal(arrivalCount.status(s), 'waiting', '"distinct" is section 3’s word');
    equal(arrivalCount.describe(s), { need: 2, arrived: ['0'] }, 'and the duplicate is not recorded twice');
  });

  test('live-token does not fire on a negative count', () => {
    // `JP-R5` makes this unreachable from a conformant driver. It is pinned
    // anyway: a stream defect that showed up as a policy difference is exactly
    // the second cause P1 refuses to have behind its observation.
    let s = liveToken.open(r);
    s = liveToken.step(s, opened('0'));
    s = liveToken.step(s, arrived('0'));
    s = liveToken.step(s, arrived('1'));
    equal(liveToken.describe(s), { live: -1, positive: true }, 'more terminals than opens');
    equal(liveToken.status(s), 'waiting',
      'strictly zero, not "<= 0" — a negative count means the stream is wrong, not the join done');
  });
});
