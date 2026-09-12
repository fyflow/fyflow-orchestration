/**
 * The exported surface W2 and W4 consume, and the two region guards that keep
 * region events out of non-region paths.
 *
 * Everything here was exported, cited by a spec rule, and called by nothing —
 * so a regression in any of it would have shipped green. `spec/README.md` rule 3
 * is the reason it matters: these are the values W2 and W3 are supposed to meet
 * at, rather than meeting at each other's code.
 */
import { deepEqual, equal, ok, suite } from '../harness.ts';
// The scheduler's task class, by name — ADR 0048 rule 5 is a statement about it and this file is
// where that statement is falsifiable without a scheduler running. Permitted in `test/**` since `S9`
// was retired with the same decision.
import { FyflowTask } from 'fyflow-scheduler';
import { readText, ROOT } from '../harness.ts';
import { Driver } from '../../src/driver/driver.ts';
import { innermostRegionOf } from '../../src/definition/regions.ts';
import { POLICIES } from '../../src/fold/policies.ts';
import { validateDefinition } from '../../src/definition/validate.ts';
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
    // **`r1:scoreC:1.0:0`, not `r1:scoreC:0:0` — W21.** Until the driver derived a
    // node's `branchPath` from the graph it threaded one, and the `fanout` arm
    // discarded the outer prefix, so a node two deep minted the id of a node one
    // deep. These four cases were written against the wrong ids and moved with the
    // fix, which is the clearest statement of what W21 changed.
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
    scheduler.settle('r1:scoreC:1.0:0', 'user_action', { result: null });

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
    ['branch.lost', (s: Fake) => s.settle('r1:scoreC:1.0:0', 'failed', { error: 'x' })],
    ['branch.resumed', (s: Fake, d: Driver) => {
      s.settle('r1:scoreC:1.0:0', 'user_action', { result: null });
      d.resolve('r1:scoreC:1.0:0', 'done', { actor: 'a-person' });
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

  test('a nested run mints the ids the grammar reserved — W21, and it is L2', async () => {
    // **The whole of what W21 delivers, and `spec/task-id.md` section 1 is where
    // every value comes from**: four segments, and the third is a dotted path for
    // a node inside a nested region. Before W21 the driver threaded a path and the
    // `fanout` arm discarded the outer prefix, so `scoreC` minted `r1:scoreC:0:0`
    // — the id of a node one level up, differing from `scoreA`'s only by node id.
    //
    // **`ID-R1` is what would have caught the collision if the node ids had
    // matched**, which is why this is the row that matters rather than a
    // cosmetic one: a discarded prefix is how two branches mint one id.
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
    // **Read from the SCHEDULER, and with a field only the scheduler has.**
    // `d.dispatchedIds()` is the driver's own bookkeeping and would satisfy an
    // id-only assertion identically — measured: with the driver recording a
    // dispatch it never hands to `addTask`, the scheduler-sourced form fails and
    // the driver-sourced form passes. Pairing `workerType` with the id makes the
    // wrong source unable to satisfy this at all, rather than merely unwise.
    // `doc/workflow.md` section 5 rule 4, and v0.8's provenance obligation.
    equal(scheduler.added.map((t) => `${t.id}@${(t as { workerType?: string }).workerType}`), [
      'r1:scoreA:0:0@ScoreWorker', 'r1:scoreB:1:0@ScoreWorker',
      'r1:scoreC:1.0:0@ScoreWorker', 'r1:scoreD:1.1:0@ScoreWorker',
    ], 'the inner branches are at 1.0 and 1.1 — outer branch 1, inner branches 0 and 1');
    // And the region events carry the same paths, because both are derived from
    // the graph rather than one being read off the other.
    equal(events.filter((e) => e.regionId === 'inner').map((e) => e.branchPath), ['1.0', '1.1'],
      'a nested fanout opens its branches at their own paths, not at their bare indices');
    equal(events.filter((e) => e.regionId === 'outer').map((e) => e.branchPath), ['0', '1', '0'],
      'and the outer region is unchanged — opened 0, opened 1, arrived 0');
    // `ID-R1`: every dispatched id distinct. It is what a discarded prefix breaks.
    equal(new Set(scheduler.added.map((t) => t.id)).size, scheduler.added.map((t) => t.id).length, 'ID-R1: every dispatched id is distinct');
  });

  test('a join routes out of itself at the path its REGION sits at — Q114, closed by W21', async () => {
    // **[Q114](../../doc/open-questions.md).** `settleJoin` entered a join's
    // successor with no `fromBranch` at all, which is right at depth 1 — a join's
    // successor is outside every region — and wrong inside a nested one. Measured
    // before the fix, this run's last event was `branch.arrived@outer` with path
    // `'-'`: the outer region recorded branch **1**'s arrival as *no branch*.
    //
    // Read from `spec/flow-definition.md` section 4: the inner region is entered
    // from `scoreB`, which is outer branch 1, so the whole inner region — and
    // therefore its join's exit — sits at outer path `1`.
    const def = await load('valid/nested-fanout.flow.json');
    const scheduler = new Fake();
    const events: RegionEvent[] = [];
    const d = new Driver(def, {
      runId: 'r1', scheduler, createTask: (c) => c, predicates: new Map(),
      workerTypes: reg.workerTypes, now: () => 1, joinPolicy: POLICIES['live-token'],
      onRegionEvent: (e) => events.push(e),
    });
    d.start({});
    for (const id of ['r1:scoreA:0:0', 'r1:scoreB:1:0', 'r1:scoreC:1.0:0', 'r1:scoreD:1.1:0']) {
      scheduler.settle(id, 'done', { result: null });
    }
    equal(events.map((e) => `${e.type}@${e.regionId}:${e.branchPath}`), [
      'branch.opened@outer:0', 'branch.opened@outer:1',
      'branch.arrived@outer:0',
      'branch.opened@inner:1.0', 'branch.opened@inner:1.1',
      'branch.arrived@inner:1.0', 'branch.arrived@inner:1.1',
      'branch.arrived@outer:1',
    ], 'the inner join`s exit arrives at OUTER BRANCH 1, not at `-`');
  });

  test('a join`s exit path is the WHOLE path, and truncating it hangs a run — W21`s adequacy reader', () => {
    // **The Q114 case above cannot see this**, and that is the finding: at depth 2
    // `pathOf('inner')` is `'1'`, so `.split('.')[0]` is the identity there. The
    // fix was asserted only where its own distinction collapses.
    //
    // Two SIBLING nested regions inside one outer branch. `src/fold/policies.ts`
    // keys distinct arrivals on `branchPath`, so two exits truncated to the same
    // outer segment collapse into one arrival and the enclosing join never fires.
    // Values from `spec/flow-definition.md` section 4 and `spec/task-id.md`
    // section 1: `g1` and `g2` are branches 0 and 1 of `mid`, which is branch 1 of
    // `outer`, so their joins exit at `1.0` and `1.1`.
    const t = (id: string, to: string) => ({ id, kind: 'task', workerType: reg.workerTypes[0], edges: [{ to }] });
    // `FD-V9` requires a branch entry to be a TASK, so each of `mid`'s branches
    // is a task that then fans out — which is also the only shape a nested
    // fan-out can take at all, and is worth knowing.
    const nodes = [
      { id: 'outer', kind: 'fanout', branches: ['scoreA', 'scoreB'] },
      t('scoreA', 'outerJoin'), t('scoreB', 'mid'),
      { id: 'mid', kind: 'fanout', branches: ['m1', 'm2'] },
      t('m1', 'g1'), t('m2', 'g2'),
      { id: 'g1', kind: 'fanout', branches: ['h1', 'h2'] },
      t('h1', 'j1'), t('h2', 'j1'),
      { id: 'j1', kind: 'join', of: 'g1', edges: [{ to: 'midJoin' }] },
      { id: 'g2', kind: 'fanout', branches: ['h3', 'h4'] },
      t('h3', 'j2'), t('h4', 'j2'),
      { id: 'j2', kind: 'join', of: 'g2', edges: [{ to: 'midJoin' }] },
      { id: 'midJoin', kind: 'join', of: 'mid', edges: [{ to: 'outerJoin' }] },
      { id: 'outerJoin', kind: 'join', of: 'outer', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ];
    const def = { flowId: 'siblings-depth3', version: 1, entry: 'outer', nodes } as unknown as FlowDefinition;
    equal(validateDefinition(def, { workerTypes: reg.workerTypes, predicates: [] }), [],
      'a legal definition — which is what makes a hang here a defect');
    const scheduler = new Fake();
    const events: RegionEvent[] = [];
    const d = new Driver(def, {
      runId: 'r1', scheduler, createTask: (c) => c, predicates: new Map(),
      workerTypes: reg.workerTypes, now: () => 1, joinPolicy: POLICIES['arrival-count'],
      onRegionEvent: (e) => events.push(e),
    });
    d.start({});
    for (const id of [
      'r1:scoreA:0:0', 'r1:scoreB:1:0', 'r1:m1:1.0:0', 'r1:m2:1.1:0',
      'r1:h1:1.0.0:0', 'r1:h2:1.0.1:0', 'r1:h3:1.1.0:0', 'r1:h4:1.1.1:0',
    ]) {
      scheduler.settle(id, 'done', { result: null });
    }
    // **The two sibling joins arrive at mid as DISTINCT branches.** Truncated to
    // `'1'` they are one arrival, `arrival-count` never reaches 2, and the run
    // hangs — 0 failures without this line.
    equal(events.filter((e) => e.regionId === 'mid' && e.type === 'branch.arrived').map((e) => e.branchPath),
      ['1.0', '1.1'], 'each sibling join exits at its OWN path, not at their shared outer segment');
    equal(d.joinStatusOf('mid')?.status, 'satisfied', 'so the enclosing join fires');
    equal(d.joinStatusOf('outer')?.status, 'satisfied', 'and so does the one above it');
  });

  test('an inner join routing to an `end` TERMINATES the outer branch — W21`s conformity reader', () => {
    // **A valid definition that hung**, and the half of [Q114](../../doc/open-questions.md)
    // the first fix missed. `settleJoin` carried the path but passed `undefined`
    // for `fromRegion`, and the `end` arm attributes a `branch.exited` by
    // `fromRegion` alone — so an inner join routing to an `end` inside the
    // enclosing region emitted NO terminal event for the outer branch, and the
    // outer join sat at `live: 1` forever.
    //
    // `spec/join-policy.md` section 2 and `JP-R5`: a branch reaches the join,
    // reaches an `end`, or runs out of eligible edges — a branch that is neither
    // suspended nor in flight has **exactly one** terminal event. That is the rule
    // this asserts, and the values come from it rather than from the run.
    //
    // Inline for [Q44](../../doc/open-questions.md)'s reason: the corpus's nested
    // flow routes its inner join to the OUTER JOIN, which is the shape that
    // already worked.
    const nodes = [
      { id: 'outer', kind: 'fanout', branches: ['scoreA', 'scoreB'] },
      { id: 'scoreA', kind: 'task', workerType: reg.workerTypes[0], edges: [{ to: 'outerJoin' }] },
      { id: 'scoreB', kind: 'task', workerType: reg.workerTypes[0], edges: [{ to: 'inner' }] },
      { id: 'inner', kind: 'fanout', branches: ['scoreC', 'scoreD'] },
      { id: 'scoreC', kind: 'task', workerType: reg.workerTypes[0], edges: [{ to: 'innerJoin' }] },
      { id: 'scoreD', kind: 'task', workerType: reg.workerTypes[0], edges: [{ to: 'innerJoin' }] },
      { id: 'innerJoin', kind: 'join', of: 'inner', edges: [{ to: 'stopHere' }] },
      { id: 'stopHere', kind: 'end', outcome: 'completed' },
      { id: 'outerJoin', kind: 'join', of: 'outer', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ];
    const def = { flowId: 'inner-join-exits', version: 1, entry: 'outer', nodes } as unknown as FlowDefinition;
    equal(validateDefinition(def, { workerTypes: reg.workerTypes, predicates: [] }), [],
      'the shape is VALID — which is what makes the hang a defect rather than a refusal');
    const scheduler = new Fake();
    const events: RegionEvent[] = [];
    const d = new Driver(def, {
      runId: 'r1', scheduler, createTask: (c) => c, predicates: new Map(),
      workerTypes: reg.workerTypes, now: () => 1, joinPolicy: POLICIES['live-token'],
      onRegionEvent: (e) => events.push(e),
    });
    d.start({});
    for (const id of ['r1:scoreA:0:0', 'r1:scoreB:1:0', 'r1:scoreC:1.0:0', 'r1:scoreD:1.1:0']) {
      scheduler.settle(id, 'done', { result: null });
    }
    // Outer branch 1 EXITS — it reached an `end` rather than the outer join.
    equal(events.map((e) => `${e.type}@${e.regionId}:${e.branchPath}`), [
      'branch.opened@outer:0', 'branch.opened@outer:1',
      'branch.arrived@outer:0',
      'branch.opened@inner:1.0', 'branch.opened@inner:1.1',
      'branch.arrived@inner:1.0', 'branch.arrived@inner:1.1',
      'branch.exited@outer:1',
    ], 'JP-R5: outer branch 1 has exactly one terminal event, and it is an exit');
    // And the outer join therefore settles rather than waiting forever.
    equal(d.joinStatusOf('outer')?.status, 'satisfied',
      'live-token: the outer count reaches zero having been positive, so the join fires');
  });

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
    scheduler.settle('r1:scoreC:1.0:0', 'done', { result: null });
    equal(events.filter((e) => e.type === 'branch.exited').map((e) => e.regionId), ['inner'],
      'the hop out of a settled node carries the INNERMOST region it was in');
  });
});

/**
 * **A dead inner join ends the outer branch it sits in** —
 * [ADR 0030](../../doc/decisions/0030-a-join-is-transitive-and-a-dead-join-ends-the-branch-it-sits-in.md)
 * rule 4, and W22.
 *
 * `settleJoin`'s `unsatisfiable` arm reported the join and returned, emitting
 * nothing. At depth 1 there is nothing to emit — a top-level fanout is in no
 * region — so the gap was **unobservable rather than absent**, which is
 * [Q114](../../doc/open-questions.md)'s shape one item earlier.
 *
 * Every expected value below comes from `spec/join-policy.md` sections 2, 3 and 4
 * and was derived before the run: `live-token-requiring-arrival` is *"satisfied
 * when the live count reaches zero having been positive AND at least one
 * `branch.arrived` has been seen; **`unsatisfiable`** when the count reaches zero
 * having been positive with no arrival"*, and `branch.lost` is *"the path ended
 * inside the region without reaching an `end` node"*.
 */
suite('a dead inner join, and what it does to the branch it sits in', (test) => {
  /**
   * `outer` fans out to `scoreA` and `scoreB`; `scoreB` enters `inner`; both
   * inner branches route away to an `end` inside `region(inner)`, so the inner
   * join is reached by nothing.
   *
   * **Built as a function of the node ORDER**, because W20's finding was that
   * `regionOf` answered *"which region"* with *"the order the author declared the
   * fanouts in"*, and every nested assertion here is run in both orders.
   */
  const deadInner = (innerFirst: boolean) => {
    const outerNodes = [
      { id: 'outer', kind: 'fanout', branches: ['scoreA', 'scoreB'] },
      { id: 'scoreA', kind: 'task', workerType: reg.workerTypes[0], edges: [{ to: 'outerJoin' }] },
      { id: 'scoreB', kind: 'task', workerType: reg.workerTypes[0], edges: [{ to: 'inner' }] },
    ];
    const innerNodes = [
      { id: 'inner', kind: 'fanout', branches: ['scoreC', 'scoreD'] },
      { id: 'scoreC', kind: 'task', workerType: reg.workerTypes[0],
        edges: [{ when: 'always', to: 'bail' }, { to: 'innerJoin' }] },
      { id: 'scoreD', kind: 'task', workerType: reg.workerTypes[0],
        edges: [{ when: 'always', to: 'bail' }, { to: 'innerJoin' }] },
    ];
    const nodes = [
      ...(innerFirst ? innerNodes : outerNodes),
      ...(innerFirst ? outerNodes : innerNodes),
      { id: 'bail', kind: 'end', outcome: 'branch-abandoned' },
      { id: 'innerJoin', kind: 'join', of: 'inner', edges: [{ to: 'outerJoin' }] },
      { id: 'outerJoin', kind: 'join', of: 'outer', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ];
    return { flowId: 'dead-inner-join', version: 1, entry: 'outer', nodes } as unknown as FlowDefinition;
  };

  const drive = (def: FlowDefinition) => {
    const scheduler = new Fake();
    const events: RegionEvent[] = [];
    const dead: string[] = [];
    const d = new Driver(def, {
      runId: 'r1', scheduler, createTask: (c) => c, predicates: new Map([['always', () => true]]),
      workerTypes: reg.workerTypes, now: () => 1,
      joinPolicy: POLICIES['live-token-requiring-arrival'],
      onRegionEvent: (e) => events.push(e),
      onUnsatisfiableJoin: (u) => dead.push(u.fanoutId),
    });
    d.start({});
    for (const id of ['r1:scoreA:0:0', 'r1:scoreB:1:0', 'r1:scoreC:1.0:0', 'r1:scoreD:1.1:0']) {
      scheduler.settle(id, 'done', { result: null });
    }
    return { d, events, dead, scheduler };
  };

  for (const innerFirst of [false, true]) {
    const order = innerFirst ? 'inner declared FIRST' : 'outer declared first';

    test(`${order}: the dead inner join ends the outer branch, and JP-R5 holds`, () => {
      const def = deadInner(innerFirst);
      equal(validateDefinition(def, { workerTypes: reg.workerTypes, predicates: ['always'] }), [],
        'the shape is VALID — which is what makes a branch with no terminal event a defect');
      const { d, events, dead } = drive(def);

      equal(events.map((e) => `${e.type}@${e.regionId}:${e.branchPath}`), [
        'branch.opened@outer:0', 'branch.opened@outer:1',
        'branch.arrived@outer:0',
        'branch.opened@inner:1.0', 'branch.opened@inner:1.1',
        'branch.exited@inner:1.0', 'branch.exited@inner:1.1',
        'branch.lost@outer:1',
      ], 'the last event is the one W22 added. Without it outer branch 1 has NO terminal event, ' +
         'in a run that is neither suspended nor in flight — a state JP-R5 does not admit');

      equal(dead, ['inner'],
        'exactly one region is reported dead, and it is the inner one. Reporting the outer join ' +
        'too would be the driver deciding satisfaction, which section 4 gives to a policy');
      equal(d.joinStatusOf('inner')?.status, 'unsatisfiable',
        'the inner count reached zero having been positive with no arrival');
      equal(d.joinStatusOf('outer')?.status, 'satisfied',
        'and the OUTER join fires: its count reached zero too, and `scoreA` arrived. That is the ' +
        'policy answering the fact the driver reported, not the driver walking outward');
    });

    test(`${order}: the ended branch is stamped with the ENCLOSING region, at the fanout's own path`, () => {
      // Both halves of the emission, separately: a `branch.lost` carrying the
      // inner region's id would decrement the join that just died, and one
      // carrying `'-'` or `'1.0'` would end a branch that is not the one that
      // stopped. `regionOf` and `pathOf` are the two sources and this is the only
      // assertion that reads them apart.
      const { events } = drive(deadInner(innerFirst));
      const lost = events.filter((e) => e.type === 'branch.lost');
      equal(lost.map((e) => [e.regionId, e.branchPath]), [['outer', '1']],
        'one `branch.lost`, in `region(outer)`, at the path `inner`’s own fanout sits at');
    });
  }

  test('at depth 3 the cascade is emergent — one emission, three different verdicts', () => {
    // **No walk outward.** `settleJoin` calls itself for the enclosing region, so
    // a dead join ends its branch, and whether THAT kills the next join up is the
    // next policy's answer. Measured here: `inner` dies with nothing arrived;
    // `mid` therefore also has nothing arrived and dies too; `outer` had `a`
    // arrive, so it fires. Three verdicts, one line of driver code, none of them
    // the driver's.
    const nodes = [
      { id: 'outer', kind: 'fanout', branches: ['a', 'b'] },
      { id: 'a', kind: 'task', workerType: reg.workerTypes[0], edges: [{ to: 'outerJoin' }] },
      { id: 'b', kind: 'task', workerType: reg.workerTypes[0], edges: [{ to: 'mid' }] },
      { id: 'mid', kind: 'fanout', branches: ['c', 'd'] },
      { id: 'c', kind: 'task', workerType: reg.workerTypes[0],
        edges: [{ when: 'always', to: 'gone' }, { to: 'midJoin' }] },
      { id: 'd', kind: 'task', workerType: reg.workerTypes[0], edges: [{ to: 'inner' }] },
      { id: 'inner', kind: 'fanout', branches: ['e', 'f'] },
      { id: 'e', kind: 'task', workerType: reg.workerTypes[0],
        edges: [{ when: 'always', to: 'gone' }, { to: 'innerJoin' }] },
      { id: 'f', kind: 'task', workerType: reg.workerTypes[0],
        edges: [{ when: 'always', to: 'gone' }, { to: 'innerJoin' }] },
      { id: 'gone', kind: 'end', outcome: 'branch-abandoned' },
      { id: 'innerJoin', kind: 'join', of: 'inner', edges: [{ to: 'midJoin' }] },
      { id: 'midJoin', kind: 'join', of: 'mid', edges: [{ to: 'outerJoin' }] },
      { id: 'outerJoin', kind: 'join', of: 'outer', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ];
    const def = { flowId: 'dead-inner-depth3', version: 1, entry: 'outer', nodes } as unknown as FlowDefinition;
    equal(validateDefinition(def, { workerTypes: reg.workerTypes, predicates: ['always'] }), [], 'valid');
    const scheduler = new Fake();
    const events: RegionEvent[] = [];
    const dead: string[] = [];
    const d = new Driver(def, {
      runId: 'r1', scheduler, createTask: (c) => c, predicates: new Map([['always', () => true]]),
      workerTypes: reg.workerTypes, now: () => 1,
      joinPolicy: POLICIES['live-token-requiring-arrival'],
      onRegionEvent: (e) => events.push(e),
      onUnsatisfiableJoin: (u) => dead.push(u.fanoutId),
    });
    d.start({});
    for (const id of ['r1:a:0:0', 'r1:b:1:0', 'r1:c:1.0:0', 'r1:d:1.1:0', 'r1:e:1.1.0:0', 'r1:f:1.1.1:0']) {
      scheduler.settle(id, 'done', { result: null });
    }
    equal(events.filter((e) => e.type === 'branch.lost').map((e) => `${e.regionId}:${e.branchPath}`),
      ['mid:1.1', 'outer:1'],
      'the inner join`s death ends `mid`s branch 1.1, and `mid`s death ends `outer`s branch 1. ' +
      'Two emissions from one line, at the paths the two fanouts sit at');
    equal(dead, ['inner', 'mid'],
      'both dead regions are reported, in the order they died — and `outer` is not among them');
    equal([d.joinStatusOf('inner')?.status, d.joinStatusOf('mid')?.status, d.joinStatusOf('outer')?.status],
      ['unsatisfiable', 'unsatisfiable', 'satisfied'],
      'nothing arrived at `inner` or at `mid`; `a` arrived at `outer`. The policy decides each one');
  });

  test('and a dead join at depth 1 still emits nothing, which is why this was invisible', () => {
    // The discriminator for the whole suite. If the new emission fired for a
    // top-level region too, every depth-1 row in the matrix would have changed —
    // and the reason it did not is that `regionOf(fanoutId)` is `undefined` there.
    const nodes = [
      { id: 'split', kind: 'fanout', branches: ['x', 'y'] },
      { id: 'x', kind: 'task', workerType: reg.workerTypes[0],
        edges: [{ when: 'always', to: 'bail' }, { to: 'collect' }] },
      { id: 'y', kind: 'task', workerType: reg.workerTypes[0],
        edges: [{ when: 'always', to: 'bail' }, { to: 'collect' }] },
      { id: 'bail', kind: 'end', outcome: 'branch-abandoned' },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ];
    const def = { flowId: 'dead-join-depth1', version: 1, entry: 'split', nodes } as unknown as FlowDefinition;
    const scheduler = new Fake();
    const events: RegionEvent[] = [];
    const dead: string[] = [];
    const d = new Driver(def, {
      runId: 'r1', scheduler, createTask: (c) => c, predicates: new Map([['always', () => true]]),
      workerTypes: reg.workerTypes, now: () => 1,
      joinPolicy: POLICIES['live-token-requiring-arrival'],
      onRegionEvent: (e) => events.push(e),
      onUnsatisfiableJoin: (u) => dead.push(u.fanoutId),
    });
    d.start({});
    for (const id of ['r1:x:0:0', 'r1:y:1:0']) scheduler.settle(id, 'done', { result: null });
    equal(dead, ['split'], 'the join is dead and reported');
    equal(events.filter((e) => e.type === 'branch.lost'), [],
      'and NOTHING is ended by it: `split` is in no region, so there is no branch to end. ' +
      'This is why the gap survived every plan before nesting existed');
    equal(d.joinStatusOf('split')?.status, 'unsatisfiable', 'the depth-1 answer is unchanged');
  });
});

// **ADR 0048 rule 5, both halves, at L1 — W57's adequacy reader (m37, m38, m39).** Every fake in
// this repository hands the driver `createTask: (c) => c` and reads the plain object back, and NONE
// asserted that the object it received was the one its factory RETURNED: with the option ignored
// outright, 703 cases and 1138 L6 assertions stayed green. And the two L6 observers accept ANY
// `FyflowTask`, so a default that quietly added a `retryPolicy` or a `workerGroups` entry — the two
// fields W58 then made node-declared (this read "is about to" until W58's conformity reader) — was green everywhere. Rule 5 says the default is
// EXACTLY `new FyflowTask(config)` and the option is honoured; this is where each is one assertion.
suite('ADR 0048 rule 5 — createTask: the option is honoured, and the default is exactly new FyflowTask(config)', (test) => {
  const def: FlowDefinition = {
    flowId: 'ct', version: 1, entry: 'a',
    nodes: [
      { id: 'a', kind: 'task', workerType: 'W', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  };
  test('the object the scheduler receives is the one the FACTORY returned — not a FyflowTask built beside it', () => {
    const s = new Fake();
    new Driver(def, {
      runId: 'r1', scheduler: s, predicates: new Map(), workerTypes: ['W'],
      createTask: (c) => ({ marker: 'from-my-factory', ...c }),
    }).start({ x: 1 });
    equal(s.added.length, 1, 'one dispatch');
    const got = s.added[0] as { marker?: string; id: string };
    equal(got.marker, 'from-my-factory', 'the factory`s own object reached addTask — the option is honoured, not overridden by the default');
    equal(got.id, 'r1:a:-:0', 'and it carries the config the driver handed the factory');
    ok(!(got instanceof FyflowTask), 'a plain object from the factory stays a plain object');
  });
  test('omitted, the driver builds EXACTLY new FyflowTask(config) — the four fields and nothing added', () => {
    const s = new Fake();
    new Driver(def, { runId: 'r1', scheduler: s, predicates: new Map(), workerTypes: ['W'] }).start({ x: 1 });
    equal(s.added.length, 1, 'one dispatch');
    const built = s.added[0] as unknown;
    ok(built instanceof FyflowTask, 'the default builds the scheduler`s own class (ADR 0048 rule 5)');
    // Field for field against a task built from the same four fields, private bookkeeping aside:
    // a default that injected `retryPolicy`, `workerGroups`, `handleRejection` or `limitKey`
    // beyond what the config carries differs here and nowhere else at L1-L6.
    const expected = new FyflowTask({ id: 'r1:a:-:0', workerType: 'W', payload: { x: 1 }, optional: false });
    const own = (t: object) => Object.fromEntries(Object.entries(t).filter(([k]) => !k.startsWith('_')));
    ok(deepEqual(own(built as object), own(expected)),
      `the default task equals new FyflowTask(config) field for field — got ${JSON.stringify(own(built as object))}`);
    equal((built as { retryPolicy?: unknown }).retryPolicy, undefined, 'no retryPolicy the node did not declare (W58`s field)');
    equal(JSON.stringify((built as { workerGroups?: unknown }).workerGroups), '[]', 'no workerGroups the node did not declare (W58`s field)');
  });
  // **W58 changed what the default may carry, and this suite is changed DELIBERATELY rather than
  // around** — the item's brief. The test above still holds for a node that declares nothing; this
  // is the other half of rule 5 now that a node CAN declare: the default builds exactly
  // `new FyflowTask(config)` for a six-field config too, and the two new fields arrive on the
  // scheduler's own class as the node wrote them.
  test('and for a node that DECLARES both keys, the default builds EXACTLY new FyflowTask(config) with them — W58', () => {
    const s = new Fake();
    const declared: FlowDefinition = {
      flowId: 'ct2', version: 1, entry: 'a',
      nodes: [
        { id: 'a', kind: 'task', workerType: 'W', retryPolicy: { maxRetries: 2, backoffMs: 50 }, workerGroups: ['gpu'], edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    };
    new Driver(declared, { runId: 'r1', scheduler: s, predicates: new Map(), workerTypes: ['W'], groups: ['gpu'] }).start({ x: 1 });
    const built = s.added[0] as unknown;
    ok(built instanceof FyflowTask, 'still the scheduler`s own class');
    const expected = new FyflowTask({
      id: 'r1:a:-:0', workerType: 'W', payload: { x: 1 }, optional: false,
      retryPolicy: { maxRetries: 2, backoffMs: 50 }, workerGroups: ['gpu'],
    });
    const own = (t: object) => Object.fromEntries(Object.entries(t).filter(([k]) => !k.startsWith('_')));
    ok(deepEqual(own(built as object), own(expected)),
      `field for field, six fields in — got ${JSON.stringify(own(built as object))}`);
    equal((built as { retryPolicy?: unknown }).retryPolicy, { maxRetries: 2, backoffMs: 50 }, 'the node`s retryPolicy, whole');
    equal((built as { workerGroups?: unknown }).workerGroups, ['gpu'], 'the node`s workerGroups');
  });
});
