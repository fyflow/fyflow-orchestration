/**
 * The exported surface W2 and W4 consume, and the two region guards that keep
 * region events out of non-region paths.
 *
 * Everything here was exported, cited by a spec rule, and called by nothing —
 * so a regression in any of it would have shipped green. `spec/README.md` rule 3
 * is the reason it matters: these are the values W2 and W3 are supposed to meet
 * at, rather than meeting at each other's code.
 */
import { equal, ok, suite } from '../harness.ts';
import { readText, ROOT } from '../harness.ts';
import { Driver } from '../../src/driver/driver.ts';
import { isTerminalEvent, TERMINAL_EVENTS } from '../../src/driver/events.ts';
import { branchIndices } from '../../src/driver/ids.ts';
import { allRegions, branchIndexOf, buildGraph, toRegion } from '../../src/definition/regions.ts';
import type { RegionEvent } from '../../src/driver/events.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';

const EX = `${ROOT}spec/examples`;
const load = async (rel: string) => JSON.parse(await readText(`${EX}/${rel}`)) as FlowDefinition;
const reg = JSON.parse(await readText(`${EX}/registry.json`)) as { workerTypes: string[] };

const waiting = {
  id: 'waiting', open: () => null, step: (s: null) => s,
  status: () => 'waiting' as const, describe: () => null,
} as unknown as JoinPolicy;

class Fake {
  added: { id: string }[] = [];
  private l = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(t: unknown) { this.added.push(t as { id: string }); }
  addEventListener(t: string, f: (e: { detail: unknown }) => void) { this.l.set(t, [...(this.l.get(t) ?? []), f]); }
  settle(id: string, state: string, over: Record<string, unknown> = {}) {
    const d = { id, state, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, ...over };
    if (state === 'done') this.fire('task.completed', d);
    else { this.fire('task.failed', d); if (state === 'user_action') this.fire('task.user_action', d); }
  }
  private fire(t: string, detail: unknown) { for (const f of this.l.get(t) ?? []) f({ detail }); }
}

suite('TERMINAL_EVENTS is the one list, and it is right', (test) => {
  test('exactly the three terminal types', () => {
    equal([...TERMINAL_EVENTS], ['branch.arrived', 'branch.exited', 'branch.lost'],
      'JP-R5: a branch is opened once, may suspend/resume any number of times, then ends once');
  });
  test('suspended and resumed are NOT terminal', () => {
    const t = (type: string) => isTerminalEvent({ type, regionId: 'r', branchPath: '0' } as RegionEvent);
    ok(!t('branch.opened'), 'opened is not terminal');
    ok(!t('branch.suspended'), 'a branch waiting on a person is still live — this is Q7, not a hang');
    ok(!t('branch.resumed'), 'resumed is not terminal either');
    ok(t('branch.arrived') && t('branch.exited') && t('branch.lost'), 'and the three that are');
  });
});

suite('branchIndices and branchIndexOf — the two derivations of branchPath', (test) => {
  test('branchIndices parses the segment the id format reserves', () => {
    equal(branchIndices('-'), null, 'a node in no region');
    equal(branchIndices('1'), [1], 'a single index');
    equal(branchIndices('1.0'), [1, 0], 'the reserved nested shape — outermost first');
  });

  test('branchIndexOf agrees with the branch path the driver threads through', async () => {
    // spec/task-id.md section 1 says branchPath is "a property of the node", and
    // FD-V19/FD-V22 are what make that true. The driver derives it by threading
    // `fromBranch` through enter(); this function derives it from the region sets.
    // TWO derivations of one value — so they are checked against each other.
    const def = await load('valid/p1-routed-away.flow.json');
    const regions = allRegions(buildGraph(def), def);
    equal(branchIndexOf(regions, 'scoreA'), 0, 'branch 0');
    equal(branchIndexOf(regions, 'scoreB'), 1, 'branch 1');
    equal(branchIndexOf(regions, 'abandoned'), 1, "the routed-away branch's end node is in branch 1");
    equal(branchIndexOf(regions, 'ingest'), null, 'a node before the fanout is in no region');
    equal(branchIndexOf(regions, 'publish'), null, 'and a node after the join is in none either');
  });

  test('toRegion sorts members and drops the validator working set', async () => {
    const def = await load('valid/p1-routed-away.flow.json');
    const r = toRegion(allRegions(buildGraph(def), def)[0]!);
    equal(Object.keys(r).sort(), ['branches', 'fanoutId', 'joinId', 'members'],
      'four fields — branchOf and after are not handed to a policy');
    equal(r.members, ['abandoned', 'scoreA', 'scoreB'], 'sorted, so the value is stable across folds');
  });
});

suite('the region guards — no region event escapes a non-region path', (test) => {
  test('a path ending outside any region emits nothing', async () => {
    // Nothing would have noticed a driver that emitted branch.lost with an empty
    // regionId for every unrouted failure anywhere in a flow. JP-R4 warns that an
    // emission choice can decide Q4 by omission; this is the same hazard by
    // commission — a policy fed terminal events for branches that never opened.
    const events: RegionEvent[] = [];
    const scheduler = new Fake();
    const d = new Driver(await load('valid/failure-edge.flow.json'), {
      scheduler, createTask: (c) => c,
      predicates: new Map([['isLowConfidence', () => false]]),
      workerTypes: reg.workerTypes, now: () => 1, onRegionEvent: (e) => events.push(e),
    });
    d.start('r1', {});
    scheduler.settle('r1:extract:-:0', 'failed', { error: 'boom' });
    equal(events, [], 'this flow has no fan-out at all, so no region event is emitted');
  });

  test('an end node reached from outside a region emits no branch.exited', () => {
    // The shape FD-V22 makes legal: an `end` inside region(F), entered from
    // outside it. `fromBranch` is '-' there, and the guard is what stops a
    // spurious branch.exited for a branch that was never opened.
    const events: RegionEvent[] = [];
    const scheduler = new Fake();
    const def = {
      flowId: 'outside-end', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [
          { when: 'isLowConfidence', to: 'dropped' }, { to: 'split' }] },
        { id: 'split', kind: 'fanout', branches: ['a', 'b'] },
        { id: 'a', kind: 'task', workerType: 'ScoreWorker', edges: [
          { when: 'isLowConfidence', to: 'dropped' }, { to: 'j' }] },
        { id: 'b', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'j' }] },
        { id: 'dropped', kind: 'end', outcome: 'dropped' },
        { id: 'j', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const d = new Driver(def, {
      scheduler, createTask: (c) => c,
      predicates: new Map([['isLowConfidence', () => true]]),
      workerTypes: reg.workerTypes, now: () => 1,
      onRegionEvent: (e) => events.push(e), joinPolicy: waiting,
    });
    d.start('r1', {});
    scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    equal(events, [], 'the region was never entered, so its `end` node opens and closes nothing');
  });
});

suite('the log is not reachable from outside, including through result', (test) => {
  test('snapshot deep-copies result, so a caller cannot edit the run', async () => {
    const scheduler = new Fake();
    const d = new Driver(await load('valid/linear.flow.json'), {
      scheduler, createTask: (c) => c, predicates: new Map(),
      workerTypes: reg.workerTypes, now: () => 1,
    });
    d.start('r1', {});
    scheduler.settle('r1:ingest:-:0', 'done', { result: { deep: { n: 1 } } });

    const snap = d.snapshot();
    (snap[0] as { result: { deep: { n: number } } }).result.deep.n = 999;
    equal((d.snapshot()[0] as { result: { deep: { n: number } } }).result.deep.n, 1,
      'Object.freeze is SHALLOW and a spread aliases `result` — the mirror of the hazard ' +
      'OR-R2 exists for on the way in. OR-R7: nothing outside the inbound API writes to run state');
  });

  test('effectiveOutcomeOf hands out a copy too', async () => {
    const scheduler = new Fake();
    const d = new Driver(await load('valid/linear.flow.json'), {
      scheduler, createTask: (c) => c, predicates: new Map(),
      workerTypes: reg.workerTypes, now: () => 1,
    });
    d.start('r1', {});
    scheduler.settle('r1:ingest:-:0', 'done', { result: { deep: { n: 1 } } });
    const eff = d.effectiveOutcomeOf('r1:ingest:-:0') as { result: { deep: { n: number } } };
    eff.result.deep.n = 999;
    equal((d.effectiveOutcomeOf('r1:ingest:-:0') as { result: { deep: { n: number } } }).result.deep.n, 1,
      'effectiveOutcome returns the settlement record itself when there is no resolution');
  });

  test('dispatchedIds and terminalStateOf report what happened', async () => {
    const scheduler = new Fake();
    const d = new Driver(await load('valid/linear.flow.json'), {
      scheduler, createTask: (c) => c, predicates: new Map(),
      workerTypes: reg.workerTypes, now: () => 1,
    });
    d.start('r1', {});
    equal(d.dispatchedIds(), ['r1:ingest:-:0'], 'ID-R1 keeps this set; it is the refusal it asserts against');
    equal(d.terminalStateOf('r1:ingest:-:0'), null, 'nothing has settled yet');
    scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    equal(d.terminalStateOf('r1:ingest:-:0'), 'done', 'and after settling it reports the effective state');
  });
});
