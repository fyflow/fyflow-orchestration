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
import { innermostRegionOf } from '../../src/definition/regions.ts';
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
      runId: 'r1',
      scheduler, createTask: (c) => c,
      predicates: new Map([['isLowConfidence', () => false]]),
      workerTypes: reg.workerTypes, now: () => 1, onRegionEvent: (e) => events.push(e),
    });
    d.start({});
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
      runId: 'r1',
      scheduler, createTask: (c) => c,
      predicates: new Map([['isLowConfidence', () => true]]),
      workerTypes: reg.workerTypes, now: () => 1,
      onRegionEvent: (e) => events.push(e), joinPolicy: waiting,
    });
    d.start({});
    scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    equal(events, [], 'the region was never entered, so its `end` node opens and closes nothing');
  });
});

suite('the log is not reachable from outside, including through result', (test) => {
  test('snapshot deep-copies result, so a caller cannot edit the run', async () => {
    const scheduler = new Fake();
    const d = new Driver(await load('valid/linear.flow.json'), {
      runId: 'r1',
      scheduler, createTask: (c) => c, predicates: new Map(),
      workerTypes: reg.workerTypes, now: () => 1,
    });
    d.start({});
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
      runId: 'r1',
      scheduler, createTask: (c) => c, predicates: new Map(),
      workerTypes: reg.workerTypes, now: () => 1,
    });
    d.start({});
    scheduler.settle('r1:ingest:-:0', 'done', { result: { deep: { n: 1 } } });
    const eff = d.effectiveOutcomeOf('r1:ingest:-:0') as { result: { deep: { n: number } } };
    eff.result.deep.n = 999;
    equal((d.effectiveOutcomeOf('r1:ingest:-:0') as { result: { deep: { n: number } } }).result.deep.n, 1,
      'effectiveOutcome returns the settlement record itself when there is no resolution');
  });

  test('dispatchedIds and terminalStateOf report what happened', async () => {
    const scheduler = new Fake();
    const d = new Driver(await load('valid/linear.flow.json'), {
      runId: 'r1',
      scheduler, createTask: (c) => c, predicates: new Map(),
      workerTypes: reg.workerTypes, now: () => 1,
    });
    d.start({});
    equal(d.dispatchedIds(), ['r1:ingest:-:0'], 'ID-R1 keeps this set; it is the refusal it asserts against');
    equal(d.terminalStateOf('r1:ingest:-:0'), null, 'nothing has settled yet');
    scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    equal(d.terminalStateOf('r1:ingest:-:0'), 'done', 'and after settling it reports the effective state');
  });
});


/**
 * **The seam this file exists for, on a nested flow** — `spec/flow-definition.md`
 * section 4 (v0.7) meeting `src/driver/driver.ts`'s `regionOf`.
 *
 * This file's own header says these are *"the values W2 and W3 are supposed to
 * meet at, rather than meeting at each other's code"*, and `regionOf` is the
 * meeting point: the driver stamps `regionId` on every `branch.*` event from
 * whatever the definition layer says a node's region is.
 *
 * **It exists because [W20](../../doc/work-items/w20-what-a-nested-region-is.md)'s
 * own provocation sweep found that reverting `regionOf` to `.find` cost NOTHING.**
 * Every other probe against the resolver was caught by the region maths' own
 * tests; the driver's one-line delegation was held down by no assertion at all,
 * because nothing drove a `Driver` through a nested flow. That is rule 8's founding
 * case — a repair that could not fail — inside the item that made the repair.
 */
suite('regionOf on a nested flow — the driver reads the INNERMOST region', (test) => {
  test('a branch event inside a nested region is stamped with the inner region, not the outer', async () => {
    // **`branchPath` is deliberately NOT asserted here and the reason is a seam.**
    // The ids this run mints are `r1:scoreC:0:0`, where `spec/task-id.md`'s dotted
    // shape wants `r1:scoreC:1.0:0` — `buildTaskId` cannot emit a path and nothing
    // pushes a segment. That is **W21**'s, and asserting it here would either fail
    // for W21's reason or pin the wrong value. What this row owns is `regionId`.
    const def = await load('valid/nested-fanout.flow.json');
    const scheduler = new Fake();
    const events: RegionEvent[] = [];
    const d = new Driver(def, {
      runId: 'r1', scheduler, createTask: (c) => c, predicates: new Map(),
      workerTypes: reg.workerTypes, now: () => 1, joinPolicy: waiting,
      onRegionEvent: (e) => events.push(e),
    });
    d.start({});
    scheduler.settle('r1:scoreA:0:0', 'done', { result: null });
    scheduler.settle('r1:scoreB:1:0', 'done', { result: null });
    // **`scoreC` SUSPENDS rather than completing, and that is the whole design of
    // this case.** Measured while writing it: settling `scoreC` `done` reaches
    // `regionOf` NOWHERE — `branch.arrived` is emitted on entering the join and
    // finds its region by `joinId`, which is a keyed lookup and unambiguous, and
    // `branch.opened` is keyed by `fanoutId` the same way. **`regionOf` is read on
    // exactly three paths — `branch.suspended`, `branch.lost` and the `fromRegion`
    // that attributes `branch.exited`** — so an arrival-only run left the driver's
    // delegation held down by nothing, which is what this item's sweep found.
    // `user_action` is the cheapest of the three: it needs no fixture the corpus
    // does not already have (ADR 0007 rule 2's event pair, from the same worker).
    scheduler.settle('r1:scoreC:0:0', 'user_action', { result: null });

    // Read from the spec, not from the run: `scoreA` is in `region(outer)` only,
    // so its arrival is outer's; `scoreB` routes INTO the nested region rather
    // than arriving, so it opens inner's two branches; and `scoreC` is in BOTH,
    // so section 4 says the region that names its suspension is `inner`.
    equal(events.map((e) => `${e.type}@${e.regionId}`), [
      'branch.opened@outer', 'branch.opened@outer',
      'branch.arrived@outer',
      'branch.opened@inner', 'branch.opened@inner',
      'branch.suspended@inner',
    ], 'the region a branch event names is the INNERMOST one containing the node');
    // And the same fact stated against the definition layer directly, so the two
    // sides of the seam are compared rather than one being read off the other.
    equal(innermostRegionOf(allRegions(buildGraph(def), def), 'scoreC')?.fanoutId, 'inner',
      'which is what the definition layer says on its own');
  });

  /**
   * **`regionOf` is read at FOUR sites that use the region's identity, and the
   * case above covers ONE.** W20's adequacy reader measured the other three:
   * reverting each individually to `.find` cost **0 failures** with the whole
   * gate green, and each emits a **wrong `regionId`** on a real driver.
   *
   * The consequence is not cosmetic. A `branch.lost` stamped `outer` decrements
   * the OUTER join's live count for a branch the outer region never opened, and
   * leaves the inner join waiting forever on a branch that died — a hang and a
   * premature join from one wrong string.
   *
   * *(The fifth site, `branchPathFor`, reads truthiness only and is
   * order-insensitive by construction.)*
   */
  for (const [path, drive] of [
    ['branch.lost', (s: Fake) => s.settle('r1:scoreC:0:0', 'failed', { error: 'x' })],
    ['branch.resumed', (s: Fake, d: Driver) => {
      s.settle('r1:scoreC:0:0', 'user_action', { result: null });
      d.resolve('r1:scoreC:0:0', 'done', { actor: 'a-person' });
    }],
  ] as const) {
    test(`${path} inside a nested region names the INNER region too`, async () => {
      const def = await load('valid/nested-fanout.flow.json');
      const scheduler = new Fake();
      const events: RegionEvent[] = [];
      const d = new Driver(def, {
        runId: 'r1', scheduler, createTask: (c) => c, predicates: new Map(),
        workerTypes: reg.workerTypes, now: () => 1, joinPolicy: waiting,
        onRegionEvent: (e) => events.push(e),
      });
      d.start({});
      scheduler.settle('r1:scoreA:0:0', 'done', { result: null });
      scheduler.settle('r1:scoreB:1:0', 'done', { result: null });
      drive(scheduler, d);
      // `spec/flow-definition.md` section 4: `scoreC` is in both regions and the
      // innermost is `inner`. Read from the spec, not from the run.
      equal(events.filter((e) => e.type === path).map((e) => e.regionId), ['inner'],
        `${path} is attributed to the innermost region containing the node`);
    });
  }

  test('branch.exited inside a nested region names the INNER region too — the fourth site', () => {
    // **The `fromRegion` hop**, `driver.ts:691`, and the third of the three sites
    // the adequacy reader found at zero cost. It needs a branch EXITING inside the
    // inner region, which the corpus flow has no road to — so the flow is inline,
    // for the reason `test/matrix/` uses inline shapes
    // ([Q44](../../doc/open-questions.md)): putting it in `spec/examples/valid/`
    // would add a corpus entry to reach one driver path.
    const nodes = [
      { id: 'outer', kind: 'fanout', branches: ['scoreA', 'scoreB'] },
      { id: 'scoreA', kind: 'task', workerType: reg.workerTypes[0], edges: [{ to: 'outerJoin' }] },
      { id: 'scoreB', kind: 'task', workerType: reg.workerTypes[0], edges: [{ to: 'inner' }] },
      { id: 'inner', kind: 'fanout', branches: ['scoreC', 'scoreD'] },
      // The exit: a decision edge out of the inner region to an `end` inside it.
      { id: 'scoreC', kind: 'task', workerType: reg.workerTypes[0],
        edges: [{ to: 'bail', when: 'always' }, { to: 'innerJoin' }] },
      { id: 'scoreD', kind: 'task', workerType: reg.workerTypes[0], edges: [{ to: 'innerJoin' }] },
      { id: 'bail', kind: 'end', outcome: 'completed' },
      { id: 'innerJoin', kind: 'join', of: 'inner', edges: [{ to: 'outerJoin' }] },
      { id: 'outerJoin', kind: 'join', of: 'outer', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ];
    const def = { flowId: 'nested-exit', version: 1, entry: 'outer', nodes } as unknown as FlowDefinition;
    const scheduler = new Fake();
    const events: RegionEvent[] = [];
    const d = new Driver(def, {
      runId: 'r1', scheduler, createTask: (c) => c,
      predicates: new Map([['always', () => true]]),
      workerTypes: reg.workerTypes, now: () => 1, joinPolicy: waiting,
      onRegionEvent: (e) => events.push(e),
    });
    d.start({});
    scheduler.settle('r1:scoreA:0:0', 'done', { result: null });
    scheduler.settle('r1:scoreB:1:0', 'done', { result: null });
    scheduler.settle('r1:scoreC:0:0', 'done', { result: null });
    equal(events.filter((e) => e.type === 'branch.exited').map((e) => e.regionId), ['inner'],
      'the hop out of a settled node carries the INNERMOST region it was in');
  });
});
