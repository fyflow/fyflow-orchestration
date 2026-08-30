/**
 * Ladder L2 — routing from a fixture log of outcomes, with no scheduler.
 *
 * `doc/workflow.md` section 4: *"Level 2 is where this repo's value is proved and
 * it costs almost nothing"* — and *"if level 2 is hard to write, the driver has
 * reached for the scheduler somewhere it should not have."* The fake below is
 * twelve lines, which is the check passing.
 *
 * Covers FD-R1, ID-R1, JP-R5, RS-R2, RS-R3, and the region event stream P1's whole
 * question is asked over. Expected values come from `spec/`, and every event
 * sequence is asserted against the vocabulary in `spec/join-policy.md` section 2 —
 * never against what the driver happened to emit.
 */
import { equal, ok, suite, throws } from '../harness.ts';
import { readText, ROOT } from '../harness.ts';
import { Driver, DuplicateTaskId, InvalidDefinition } from '../../src/driver/driver.ts';
import type { RegionEvent } from '../../src/driver/events.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { selectEdge, type Predicate } from '../../src/driver/routing.ts';

const EX = `${ROOT}spec/examples`;
const load = async (rel: string) => JSON.parse(await readText(`${EX}/${rel}`)) as FlowDefinition;
const reg = JSON.parse(await readText(`${EX}/registry.json`)) as { workerTypes: string[] };

/** The whole scheduler, for level 2. It queues nothing and runs nothing. */
class FakeScheduler {
  readonly added: { id: string; workerType: string; payload: unknown; optional: boolean }[] = [];
  private listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(task: unknown): void {
    this.added.push(task as { id: string; workerType: string; payload: unknown; optional: boolean });
  }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  /** Deliver a settlement exactly as 0.3.0 does — including the pair for `user_action`. */
  settle(id: string, state: 'done' | 'failed' | 'user_action', over: Record<string, unknown> = {}): void {
    const detail = { id, state, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, ...over };
    if (state === 'done') this.fire('task.completed', detail);
    else {
      this.fire('task.failed', detail);              // fires for user_action too, first
      if (state === 'user_action') this.fire('task.user_action', detail);
    }
  }
  private fire(type: string, detail: unknown): void {
    for (const fn of this.listeners.get(type) ?? []) fn({ detail });
  }
}

function harness(def: FlowDefinition, predicates: Record<string, Predicate> = {}) {
  const scheduler = new FakeScheduler();
  const events: RegionEvent[] = [];
  let clock = 1000;
  const driver = new Driver(def, {
    scheduler,
    createTask: (c) => c,
    predicates: new Map(Object.entries(predicates)),
    workerTypes: reg.workerTypes,
    now: () => ++clock,
    onRegionEvent: (e) => events.push(e),
  });
  return { scheduler, driver, events, ids: () => scheduler.added.map((t) => t.id) };
}

const alwaysFalse: Predicate = () => false;
const alwaysTrue: Predicate = () => true;

suite('L2 — sequence routes from a fixture log, with no scheduler', (test) => {
  test('linear: each settlement dispatches the next node', async () => {
    const h = harness(await load('valid/linear.flow.json'));
    h.driver.start('r1', { seed: 1 });
    equal(h.ids(), ['r1:ingest:-:0'], 'start dispatches the entry node and nothing else');
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { a: 1 } });
    equal(h.ids(), ['r1:ingest:-:0', 'r1:publish:-:0'], 'the settlement routes to the next node');
    equal(h.scheduler.added[1]!.payload, { a: 1 }, "the next node receives the previous node's output");
    h.scheduler.settle('r1:publish:-:0', 'done', { result: null });
    equal(h.ids().length, 2, 'an `end` node dispatches nothing');
  });
});

suite('L2 — a decision picks the first eligible edge whose predicate passes', (test) => {
  test('the guarded edge is taken when its predicate is true', async () => {
    const h = harness(await load('valid/decision.flow.json'), { isLowConfidence: alwaysTrue });
    h.driver.start('r1', {});
    h.scheduler.settle('r1:score:-:0', 'done', { result: { confidence: 0.1 } });
    equal(h.ids(), ['r1:score:-:0', 'r1:review:-:0'], 'the first matching edge in declaration order wins');
  });

  test('the default edge is taken when no guard passes', async () => {
    const h = harness(await load('valid/decision.flow.json'), { isLowConfidence: alwaysFalse });
    h.driver.start('r1', {});
    h.scheduler.settle('r1:score:-:0', 'done', { result: { confidence: 0.9 } });
    equal(h.ids(), ['r1:score:-:0', 'r1:publish:-:0'], 'the no-`when` edge is the default and is last');
  });

  test('the predicate receives the effective outcome, not the raw event', async () => {
    let seen: unknown = undefined;
    const h = harness(await load('valid/decision.flow.json'), {
      isLowConfidence: (ctx) => { seen = ctx.outcome; return false; },
    });
    h.driver.start('r1', {});
    h.scheduler.settle('r1:score:-:0', 'done', { result: { confidence: 0.9 } });
    const o = seen as { kind: string; terminalState: string; result: unknown };
    equal(o.kind, 'outcome', 'OR-R9 — one shape, always');
    equal(o.terminalState, 'done', 'terminalState is never undefined in a DecisionContext');
    equal(o.result, { confidence: 0.9 }, 'the predicate sees the copied result');
  });
});

suite('FD-R1 — eligible edges exist and none matches: the run fails loudly', (test) => {
  test('the error names the run and the node', () => {
    // FD-R1 is UNREACHABLE through the public API on a valid definition — FD-V7
    // guarantees a default edge with no `when`, and a default always passes. That
    // is the rule working, so the assertion is made against the pure routing
    // function directly rather than by contorting a driver into an invalid state.
    const node = {
      id: 'score', kind: 'task' as const, workerType: 'ScoreWorker',
      edges: [{ when: 'isLowConfidence', to: 'review' }, { when: 'isHighConfidence', to: 'publish' }],
    };
    const ctx = { outcome: { kind: 'outcome', terminalState: 'done' } as never };
    throws(
      () => selectEdge(node, 'r1', 'done', ctx, new Map([
        ['isLowConfidence', alwaysFalse], ['isHighConfidence', alwaysFalse],
      ])),
      'FD-R1',
      'reaching a node with eligible edges and no match must terminate the run, not stop quietly',
    );
    throws(
      () => selectEdge(node, 'r1', 'done', ctx, new Map([
        ['isLowConfidence', alwaysFalse], ['isHighConfidence', alwaysFalse],
      ])),
      'r1',
      'the error names the run so a stuck run is attributable',
    );
  });

  test('no eligible edge at all is a path end, NOT FD-R1', () => {
    // The two are different things and only the second is an error
    // (spec/flow-definition.md section 3).
    const node = {
      id: 'score', kind: 'task' as const, workerType: 'ScoreWorker',
      edges: [{ to: 'publish' }], // opts into "done" only, by default
    };
    const r = selectEdge(node, 'r1', 'failed', { outcome: {} as never }, new Map());
    equal(r, { taken: null, reason: 'no-eligible-edge' }, 'a failure with no on:["failed"] edge ends the path');
  });

  test('a definition with no default edge is rejected at instantiation instead', async () => {
    const bad = JSON.parse(await readText(`${EX}/invalid/FD-V7--no-default-edge.flow.json`)) as FlowDefinition;
    throws(
      () => harness(bad, { isLowConfidence: alwaysFalse, isHighConfidence: alwaysFalse }),
      'FD-V7',
      'ADR 0002 rule 3 — validated in full before any task is queued',
    );
  });
});

suite('ID-R1 — a duplicate dispatch is refused before addTask sees it', (test) => {
  test('the refusal names the id and the scheduler receives nothing', async () => {
    const h = harness(await load('valid/linear.flow.json'));
    h.driver.start('r1', {});
    const before = h.scheduler.added.length;
    throws(
      () => h.driver.start('r1', {}),
      'DuplicateTaskId',
      'a second dispatch of the same (run, node, branch, attempt) must be refused',
    );
    equal(h.scheduler.added.length, before, 'addTask is NOT called — at 0.3.0 both tasks would run');
    ok(new DuplicateTaskId('x') instanceof Error, 'DuplicateTaskId is an Error');
  });
});

suite('JP-R5 — the region event stream', (test) => {
  test('every branch.opened precedes any other event for the region', async () => {
    const h = harness(await load('valid/fanout-join.flow.json'));
    h.driver.start('r1', {});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    equal(
      h.events.map((e) => e.type),
      ['branch.opened', 'branch.opened'],
      'the fanout opens both branches before dispatching either — without this a live-token ' +
        'policy can see the count reach zero while a branch is still running',
    );
    equal(h.ids().slice(1), ['r1:scoreA:0:0', 'r1:scoreB:1:0'], 'branch index is the third id segment');

    h.scheduler.settle('r1:scoreA:0:0', 'done', { result: {} });
    equal(h.events.at(-1), { type: 'branch.arrived', regionId: 'split', branchPath: '0' }, 'branch 0 arrives');
    h.scheduler.settle('r1:scoreB:1:0', 'done', { result: {} });
    equal(h.events.at(-1), { type: 'branch.arrived', regionId: 'split', branchPath: '1' }, 'branch 1 arrives');
    equal(h.events.filter((e) => e.type === 'branch.arrived').length, 2, 'exactly two arrivals');
  });

  test('at most one terminal event per branch, and none for a branch still in flight', async () => {
    const h = harness(await load('valid/fanout-join.flow.json'));
    h.driver.start('r1', {});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:scoreA:0:0', 'done', { result: {} });
    const terminals = h.events.filter((e) => e.type !== 'branch.opened');
    equal(terminals.length, 1, 'JP-R5 says AT MOST one — branch 1 has not settled and emits nothing');
  });
});

suite("P1's case — a decision inside a branch routes away from the join", (test) => {
  test('the routed-away branch emits branch.exited and the join sees one arrival', async () => {
    // The flow the whole plan exists to run. The driver reports what happened;
    // whether the join is satisfied is a policy's answer (W2) and W4's question.
    const h = harness(await load('valid/p1-routed-away.flow.json'), { isLowConfidence: alwaysTrue });
    h.driver.start('r1', {});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:scoreA:0:0', 'done', { result: {} });
    h.scheduler.settle('r1:scoreB:1:0', 'done', { result: { confidence: 0.1 } });

    equal(
      h.events.map((e) => `${e.type}:${e.branchPath}`),
      ['branch.opened:0', 'branch.opened:1', 'branch.arrived:0', 'branch.exited:1'],
      'branch 1 reached an `end` node instead of the join — this is the event the experiment turns on',
    );
    const exited = h.events.find((e) => e.type === 'branch.exited') as { at: string };
    equal(exited.at, 'abandoned', '`at` names the `end` node reached, which is INSIDE region(split)');
    equal(h.ids().includes('r1:publish:-:0'), false, 'the join has not fired: no policy said it was satisfied');
  });
});

suite('ADR 0004 — user_action suspends, and a resolution resumes the path', (test) => {
  const susp = 'r1:reviewB:1:0';

  test('a user_action settlement suspends rather than routing', async () => {
    const h = harness(await load('valid/fanout-failure.flow.json'));
    h.driver.start('r1', {});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    const before = h.ids().length;
    h.scheduler.settle(susp, 'user_action', { error: 'needs a human' });
    equal(h.ids().length, before, 'a suspended node dispatches nothing');
    equal(
      h.events.at(-1),
      { type: 'branch.suspended', regionId: 'split', branchPath: '1', at: 'reviewB' },
      'branch.suspended is NOT terminal — a join waiting on a person is not stuck (Q7)',
    );
    equal(h.driver.snapshot().filter((r) => r.taskId === susp).length, 1,
      'OR-R3: the task.failed that precedes task.user_action wrote nothing');
  });

  test('RS-R3 — resolving failed routes through the on:["failed"] edge of a NON-optional node', async () => {
    const h = harness(await load('valid/fanout-failure.flow.json'));
    h.driver.start('r1', {});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle(susp, 'user_action', { error: 'needs a human' });
    equal(h.driver.resolve(susp, 'failed', { error: 'gave up', actor: 'ops:sam' }), true, 'a suspended task resolves');
    equal(h.events.at(-1), { type: 'branch.exited', regionId: 'split', branchPath: '1', at: 'droppedB' },
      'the human giving up routes down the failure edge to an `end` — the only road a non-optional ' +
      'node has to an on:["failed"] edge');
  });

  test('RS-R1 — a second resolution is refused and appends nothing', async () => {
    const h = harness(await load('valid/fanout-failure.flow.json'));
    h.driver.start('r1', {});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle(susp, 'user_action', { error: 'x' });
    h.driver.resolve(susp, 'done', { result: { ok: true }, actor: 'a' });
    const len = h.driver.snapshot().length;
    equal(h.driver.resolve(susp, 'failed', { error: 'again', actor: 'b' }), false, 'refused, not thrown');
    equal(h.driver.snapshot().length, len, 'nothing appended — a rejected command, not a run failure');
  });

  test('RS-R2 — a resolution supplies an outcome and never re-dispatches', async () => {
    const h = harness(await load('valid/fanout-failure.flow.json'));
    h.driver.start('r1', {});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle(susp, 'user_action', { error: 'x' });
    const before = h.ids().filter((id) => id === susp).length;
    h.driver.resolve(susp, 'done', { result: {}, actor: 'a' });
    equal(h.ids().filter((id) => id === susp).length, before, 'the node is not re-run — that is Q16/Q28');
  });
});

suite('ADR 0002 rule 3 — the definition is validated in full at instantiation', (test) => {
  test('an unknown predicate name fails before any task is queued', async () => {
    const def = await load('valid/decision.flow.json');
    throws(
      () => harness(def, {}), // registry has no predicates at all
      'FD-V4',
      'a typo must not become a routing failure on the one workload that takes that branch',
    );
  });

  test('the error carries the rule ids, so a caller can act on them', async () => {
    const bad = JSON.parse(await readText(`${EX}/invalid/FD-V24--unknown-node-kind.flow.json`)) as FlowDefinition;
    try {
      harness(bad, { isLowConfidence: alwaysTrue });
      ok(false, 'expected InvalidDefinition');
    } catch (e) {
      ok(e instanceof InvalidDefinition, 'InvalidDefinition is thrown');
      ok((e as InvalidDefinition).rules.includes('FD-V24'), 'the rule id is on the error, not just in the text');
    }
  });
});
