/**
 * The two seam paths that exist **solely to serve the richer join policy**, and
 * the one thing W4's whole result rests on.
 *
 * W3's third conformity pass found both `settleJoin` calls on the non-arrival
 * paths — after `branch.exited` and after `branch.lost` — surviving deletion
 * against a green 132-assertion suite in five runtimes. Every earlier seam test
 * used a stub that counts arrivals, so every one of them exercised the `arrived`
 * path and only that.
 *
 * **With one of those calls deleted, `live-token` gives `arrival-count`'s answer
 * on P1's own flow.** That is the false result `JP-R7` and `JP-R8` were written to
 * forbid, reachable by a one-line regression that nothing would have reported.
 *
 * So the policies below are the two of `spec/join-policy.md` section 3, written
 * **verbatim from the document**. They live here to test the DRIVER, not to be
 * shipped: W3 ships no policy, and which of the two is right is W4's question.
 */
import { equal, ok, suite } from '../harness.ts';
import { readText, ROOT } from '../harness.ts';
import { Driver } from '../../src/driver/driver.ts';
import type { RegionEvent } from '../../src/driver/events.ts';
import type { JoinPolicy, Region } from '../../src/driver/policy.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';

const EX = `${ROOT}spec/examples`;
const load = async (rel: string) => JSON.parse(await readText(`${EX}/${rel}`)) as FlowDefinition;
const reg = JSON.parse(await readText(`${EX}/registry.json`)) as { workers: Record<string, { url: string }>; nodeTypes: Record<string, { worker: string }>; groups: Record<string, unknown>; pools: Record<string, { type: string }>; predicates: string[]; languages: string[] };

/** `arrival-count`, section 3, verbatim: N fixed at open, satisfied on N arrivals, never unsatisfiable. */
const arrivalCount: JoinPolicy<{ need: number; seen: number }> = {
  id: 'arrival-count',
  open: (r: Region) => ({ need: r.branches.length, seen: 0 }),
  step: (s, e) => (e.type === 'branch.arrived' ? { ...s, seen: s.seen + 1 } : s),
  status: (s) => (s.seen >= s.need ? 'satisfied' : 'waiting'),
  describe: (s) => ({ need: s.need, seen: s.seen }),
};

/** `live-token`, section 3, verbatim: opened increments; arrived/exited/lost decrement; */
/** suspended and resumed do neither; satisfied at zero HAVING BEEN POSITIVE. */
const liveToken: JoinPolicy<{ live: number; positive: boolean }> = {
  id: 'live-token',
  open: () => ({ live: 0, positive: false }),
  step: (s, e) => {
    if (e.type === 'branch.opened') return { live: s.live + 1, positive: true };
    if (e.type === 'branch.arrived' || e.type === 'branch.exited' || e.type === 'branch.lost') {
      return { ...s, live: s.live - 1 };
    }
    return s;
  },
  status: (s) => (s.positive && s.live === 0 ? 'satisfied' : 'waiting'),
  describe: (s) => ({ live: s.live, positive: s.positive }),
};

class Fake {
  added: { id: string; payload: unknown }[] = [];
  private l = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(t: unknown) { this.added.push(t as { id: string; payload: unknown }); }
  addEventListener(t: string, f: (e: { detail: unknown }) => void) { this.l.set(t, [...(this.l.get(t) ?? []), f]); }
  settle(id: string, state: string, over: Record<string, unknown> = {}) {
    const d = { id, state, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, ...over };
    if (state === 'done') this.fire('task.completed', d);
    else { this.fire('task.failed', d); if (state === 'user_action') this.fire('task.user_action', d); }
  }
  private fire(t: string, detail: unknown) { for (const f of this.l.get(t) ?? []) f({ detail }); }
}

function run(def: FlowDefinition, policy: JoinPolicy<never>, preds: Record<string, () => boolean> = {}) {
  const scheduler = new Fake();
  const events: RegionEvent[] = [];
  const driver = new Driver(def, {
    runId: 'r1',
    scheduler, createTask: (c) => c,
    predicates: new Map(Object.entries(preds)),
    workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools, now: () => 1,
    onRegionEvent: (e) => events.push(e),
    joinPolicy: policy as unknown as JoinPolicy,
  });
  return { scheduler, driver, events, ids: () => scheduler.added.map((t) => t.id) };
}

suite('the exited path — status is asked after branch.exited, not only after arrival', (test) => {
  test("live-token fires on P1's flow and arrival-count does not", async () => {
    // The difference between these two lines IS P1's question. If the driver
    // stopped asking after `branch.exited`, both would say the same thing and W4
    // would report "the two policies are equivalent" — from a driver bug.
    const def = await load('valid/p1-routed-away.flow.json');

    const lt = run(def, liveToken as never, { isLowConfidence: () => true });
    lt.driver.start({});
    lt.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    lt.scheduler.settle('r1:scoreA:0:0', 'done', { result: {} });
    lt.scheduler.settle('r1:scoreB:1:0', 'done', { result: { c: 0.1 } });
    equal(lt.ids().includes('r1:publish:-:0'), true,
      'live-token: the region has no live branches left, so the join fires — this is the whole ' +
      'argument for token accounting, and it only works if the driver asks after branch.exited');

    const ac = run(def, arrivalCount as never, { isLowConfidence: () => true });
    ac.driver.start({});
    ac.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    ac.scheduler.settle('r1:scoreA:0:0', 'done', { result: {} });
    ac.scheduler.settle('r1:scoreB:1:0', 'done', { result: { c: 0.1 } });
    equal(ac.ids().includes('r1:publish:-:0'), false,
      'arrival-count: one arrival is not two, and it never says unsatisfiable — the run hangs');
  });
});

suite('the lost path — status is asked after branch.lost too', (test) => {
  test('live-token fires when the last live branch is lost rather than arriving', async () => {
    // fanout-join has no `on:["failed"]` edge, so a resolved-to-failed branch has
    // no eligible edge and is LOST inside the region. Under live-token that still
    // empties the region; under arrival-count it never can.
    const def = await load('valid/fanout-join.flow.json');

    const lt = run(def, liveToken as never);
    lt.driver.start({});
    lt.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    lt.scheduler.settle('r1:scoreA:0:0', 'done', { result: {} });
    lt.scheduler.settle('r1:scoreB:1:0', 'user_action', { error: 'needs a human' });
    equal(lt.ids().includes('r1:publish:-:0'), false, 'a suspended branch is still live');
    lt.driver.resolve('r1:scoreB:1:0', 'failed', { error: 'gave up', actor: 'ops' });
    equal(lt.events.map((e) => e.type).filter((t) => t === 'branch.lost').length, 1, 'the branch is lost');
    equal(lt.ids().includes('r1:publish:-:0'), true,
      'and the join fires: the region is empty. This is the second path nothing asserted on');

    const ac = run(def, arrivalCount as never);
    ac.driver.start({});
    ac.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    ac.scheduler.settle('r1:scoreA:0:0', 'done', { result: {} });
    ac.scheduler.settle('r1:scoreB:1:0', 'user_action', { error: 'x' });
    ac.driver.resolve('r1:scoreB:1:0', 'failed', { error: 'gave up', actor: 'ops' });
    equal(ac.ids().includes('r1:publish:-:0'), false, 'arrival-count still waits for an arrival');
  });
});

suite('what the driver reports and what it does must agree', (test) => {
  test('a satisfied status implies the join routed', async () => {
    // Under the deleted-call regression joinStatusOf said `satisfied` while the
    // join had not fired. A detector that disagrees with the behaviour is worse
    // than none, because Q7 is about trusting exactly this report.
    const def = await load('valid/p1-routed-away.flow.json');
    for (const [name, policy] of [['live-token', liveToken], ['arrival-count', arrivalCount]] as const) {
      const h = run(def, policy as never, { isLowConfidence: () => true });
      h.driver.start({});
      h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
      h.scheduler.settle('r1:scoreA:0:0', 'done', { result: {} });
      h.scheduler.settle('r1:scoreB:1:0', 'done', { result: { c: 0.1 } });
      const reported = h.driver.joinStatusOf('split')?.status;
      const routed = h.ids().includes('r1:publish:-:0');
      equal(reported === 'satisfied', routed,
        `${name}: joinStatusOf said "${reported}" and the join ${routed ? 'did' : 'did not'} route`);
    }
  });

  test('joinStatusOf reports the status, not a constant', async () => {
    const h = run(await load('valid/fanout-join.flow.json'), liveToken as never);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    equal(h.driver.joinStatusOf('split'), { status: 'waiting', describe: { live: 2, positive: true } },
      'two branches live');
    h.scheduler.settle('r1:scoreA:0:0', 'done', { result: {} });
    equal(h.driver.joinStatusOf('split')?.status, 'waiting', 'one still live');
    h.scheduler.settle('r1:scoreB:1:0', 'done', { result: {} });
    equal(h.driver.joinStatusOf('split'), { status: 'satisfied', describe: { live: 0, positive: true } },
      'and then satisfied — a detector that can only say "waiting" is not a detector');
  });
});

suite('every one of the six events reaches the policy', (test) => {
  test('including suspended and resumed, which no earlier test drove', async () => {
    const seen: string[] = [];
    const recorder = {
      id: 'recorder', open: () => null, step: (s: null, e: { type: string }) => { seen.push(e.type); return s; },
      status: () => 'waiting' as const, describe: () => null,
    };
    const h = run(await load('valid/fanout-join.flow.json'), recorder as never);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:scoreA:0:0', 'user_action', { error: 'x' });
    h.driver.resolve('r1:scoreA:0:0', 'done', { result: {}, actor: 'ops' });
    h.scheduler.settle('r1:scoreB:1:0', 'done', { result: {} });
    equal(seen, [
      'branch.opened', 'branch.opened', 'branch.suspended', 'branch.resumed',
      'branch.arrived', 'branch.arrived',
    ], 'spec/join-policy.md section 4: EVERY region event is forwarded, all six. A driver that ' +
       'filtered would decide Q4 by omission (JP-R4)');
  });
});

suite('a policy that misbehaves does not take the run down silently', (test) => {
  test('a throwing step is reported as a run failure', async () => {
    const failures: { kind: string }[] = [];
    const scheduler = new Fake();
    const boom = {
      id: 'boom', open: () => null, step: () => { throw new Error('policy exploded'); },
      status: () => 'waiting' as const, describe: () => null,
    };
    const d = new Driver(await load('valid/fanout-join.flow.json'), {
      runId: 'r1',
      scheduler, createTask: (c) => c, predicates: new Map(),
      workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools, now: () => 1,
      joinPolicy: boom as never, onRunFailure: (f) => failures.push(f),
    });
    d.start({});
    scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    equal(failures.length, 1, 'a throw from a listener is discarded by dispatchEvent, so it is ' +
      'caught at the boundary and reported instead');
    equal(failures[0]!.kind, 'Error', 'and carries what went wrong');
    ok(d.hasFailed(), 'the run is halted rather than left half-routed');
  });

  test('a throwing describe does not latch the region, so the report is not lost forever', async () => {
    const failures: { message: string }[] = [];
    const scheduler = new Fake();
    const badDescribe = {
      id: 'bad', open: () => null, step: (st: null) => st,
      status: () => 'unsatisfiable' as const,
      describe: () => { throw new Error('describe exploded'); },
    };
    const d = new Driver(await load('valid/fanout-join.flow.json'), {
      runId: 'r1',
      scheduler, createTask: (c) => c, predicates: new Map(),
      workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools, now: () => 1,
      joinPolicy: badDescribe as never, onRunFailure: (f) => failures.push(f),
    });
    d.start({});
    scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    scheduler.settle('r1:scoreA:0:0', 'done', { result: {} });

    // `describe` is computed BEFORE `firedJoins.add`. The other order marks the
    // join fired and then throws, so the region is latched, the report is lost,
    // and no later call can ever produce it — even a caller that catches.
    equal(failures.length, 1, 'the throw is caught at the listener boundary and reported');
    ok(failures[0]!.message.includes('describe exploded'), 'carrying what actually went wrong');
    ok(!d.joinStatusOf('split'), 'joinStatusOf reports null rather than rethrowing a broken policy');
  });
});

suite('three things the driver decides that spec/ does not state', (test) => {
  test('the next task’s payload is a copy, not the log record’s result', async () => {
    // `effectiveOutcome` returns the stored settlement record BY REFERENCE when
    // there is no resolution, so handing `outcome.result` to `createTask` made the
    // next task's payload the previous record's field. An inline pool returns the
    // worker's own object (spec/outcome-record.md section 4), so a worker that
    // mutates what it was given mutates a record already in the log — and run
    // state stops being a fold of anything.
    const h = run(await load('valid/linear.flow.json'), liveToken as never);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: { deep: { n: 1 } } });
    const payload = (h.scheduler.added[1]!.payload as { input: { deep: { n: number } } }).input;
    payload.deep.n = 999;
    equal((h.driver.snapshot()[0] as { result: { deep: { n: number } } }).result.deep.n, 1,
      'the log is unchanged: "copying the field copies the reference", on the one exit that ' +
      'actually reaches a worker');
  });

  test('a policy whose open() returns undefined still drives the seam', async () => {
    // `S` is the policy's OWN opaque state type and `undefined` is a legal value
    // of it. Using `undefined` as the "region not entered" sentinel silently
    // disabled everything: no event reached step, the join never fired, and
    // joinStatusOf reported "not entered" about a region that was.
    let steps = 0;
    const undef = {
      id: 'undef', open: () => undefined, step: () => { steps++; return undefined; },
      status: () => 'satisfied' as const, describe: () => null,
    };
    const h = run(await load('valid/fanout-join.flow.json'), undef as never);
    h.driver.start({});
    h.scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    h.scheduler.settle('r1:scoreA:0:0', 'done', { result: {} });
    ok(steps > 0, 'events reach step even though the state is undefined');
    equal(h.driver.joinStatusOf('split')?.status, 'satisfied', 'and the region reports as entered');
    equal(h.ids().includes('r1:publish:-:0'), true, 'and the join fires');
  });

  test('a throwing describe fails the run and reports it', async () => {
    // The ordering `describe`-before-`firedJoins.add` is deliberate: the other
    // order marks the join fired and then throws, so the report is lost even for
    // a caller that catches. **That ordering is now unobservable**, because a
    // throwing policy fails the run at the listener boundary and no later event
    // is routed — so the latch can never be reached again either way. It is kept
    // as belt-and-braces and recorded here as an equivalent mutant rather than
    // chased with a test that asserts an implementation detail.
    const failures: { message: string }[] = [];
    const scheduler = new Fake();
    const badDescribe = {
      id: 'bad', open: () => null, step: (st: null) => st,
      status: () => 'unsatisfiable' as const,
      describe: () => { throw new Error('describe exploded'); },
    };
    const d = new Driver(await load('valid/fanout-join.flow.json'), {
      runId: 'r1',
      scheduler, createTask: (c) => c, predicates: new Map(),
      workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools, now: () => 1,
      joinPolicy: badDescribe as never, onRunFailure: (f) => failures.push(f),
    });
    d.start({});
    scheduler.settle('r1:ingest:-:0', 'done', { result: {} });
    scheduler.settle('r1:scoreA:0:0', 'done', { result: {} });
    equal(failures.length, 1, 'reported rather than swallowed by dispatchEvent');
    ok(failures[0]!.message.includes('describe exploded'), 'carrying what went wrong');
    ok(d.hasFailed(), 'and the run is halted rather than left half-routed');
  });
});
