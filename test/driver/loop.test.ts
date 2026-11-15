/**
 * **L2 — a loop at RUN time, one way out at a time** — `spec/join-policy.md` v0.26-v0.28 `JP-R13`-`JP-R15`,
 * `spec/flow-definition.md` v0.58-v0.59 `FD-R4` and `FD-R7`, P47 decisions 1, 2 and 4-6 and fact 16,
 * [W229](../../doc/work-items/w229-a-loop-at-run-time.md).
 *
 * From fixture outcome logs with no scheduler (`../matrix/run.ts`'s `Fake`). **Every expected value is written by hand
 * from the spec**, never read off a run: the task ids from `ID-R6` (a round is ONE segment), the region events from
 * `JP-R13`'s table, the join value from `JP-R15` — `{ last, iterations, exhausted, broke? }`, `last` the final arrival when
 * done or exhausted and the state the breaking round STARTED with on a break — and the fold's outcome from
 * `spec/run-state.md` (`RN-R10`: a join that can never fire is `stuck`). Rounds run one after another, so no case here
 * depends on completion order; the one map inside a body is settled in DESCENDING order and asserted the same.
 */
import { collected, equal, ok, readText, ROOT, suite, throws } from '../harness.ts';
import { BoundaryRefused, Driver, MissingJoinPolicy, UnresolvedLoopBound, type Checkpoint, type RunFailure } from '../../src/driver/driver.ts';
import type { RegionEvent } from '../../src/driver/events.ts';
import type { JoinPolicy, UnsatisfiableJoin } from '../../src/driver/policy.ts';
import type { Predicate } from '../../src/driver/routing.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { fold, type FoldInput } from '../../src/fold/run-state.ts';
import { liveToken } from '../../src/fold/policies.ts';
import { Fake } from '../matrix/run.ts';

const SUITE = 'W229 — L2: a loop at run time, one way out at a time — its rounds, its decision, its join value and FD-R7';

const reg = JSON.parse(await readText(`${ROOT}spec/examples/registry.json`)) as {
  workers: never; nodeTypes: never; pools?: never; groups?: Record<string, unknown>;
};

interface Run {
  d: Driver;
  sch: Fake;
  events: RegionEvent[];
  unsat: UnsatisfiableJoin[];
  failures: RunFailure[];
}

function drive(flow: FlowDefinition, o: {
  policy?: boolean | JoinPolicy; predicates?: Record<string, Predicate>; onEvent?: (e: RegionEvent, d: Driver) => void;
  /** W231: a worker table of the case's own, and FD-R4's check left ON (the default) — every earlier case turns it off. */
  workers?: unknown; boundaries?: boolean;
  /** W232: the scheduler double — `Sync` settles inside `addTask`; the default settles when a case says so. */
  sch?: Fake;
} = {}): Run {
  const sch = o.sch ?? new Fake();
  const events: RegionEvent[] = [];
  const unsat: UnsatisfiableJoin[] = [];
  const failures: RunFailure[] = [];
  const ref = {} as { d: Driver };
  ref.d = new Driver(flow, {
    runId: 'r1', scheduler: sch, createTask: (c) => c as never,
    predicates: new Map(Object.entries(o.predicates ?? {})),
    workers: (o.workers ?? reg.workers) as never, nodeTypes: reg.nodeTypes, pools: reg.pools, groups: Object.keys(reg.groups ?? {}),
    validateBoundaries: o.boundaries ?? false, now: () => 1,
    ...(o.policy === false ? {} : { joinPolicy: (typeof o.policy === 'object' ? o.policy : liveToken) as JoinPolicy }),
    onRegionEvent: (e) => { events.push(e); o.onEvent?.(e, ref.d); },
    onUnsatisfiableJoin: (u) => unsat.push(u),
    onRunFailure: (f) => failures.push(f),
  });
  return { d: ref.d, sch, events, unsat, failures };
}

/** The driver's loop instances, read WHITE-BOX for `JP-R15`'s lifetime — as `retention.test.ts` walks its fields. */
const loopRuns = (r: Run): Record<string, unknown>[] =>
  [...((r.d as unknown as { loops: Map<string, Map<string, Record<string, unknown>>> }).loops.values())].flatMap((m) => [...m.values()]);

const ids = (r: Run): string[] => r.sch.added.map((t) => t.id);
const input = (r: Run, id: string): unknown => (r.sch.added.find((t) => t.id === id)?.payload as { input?: unknown } | undefined)?.input;
const evs = (r: Run): string[] => r.events.map((e) => `${e.type.replace('branch.', '')}(${e.regionId}:${e.branchPath})`);
const done = (r: Run, id: string, result: unknown): void => r.sch.settle(id, 'done', result);

/** What a scripted scheduler does with one task: how it settles, or `undefined` to leave it in flight. */
type Script = (taskId: string) => { state: 'done' | 'failed'; result: unknown } | undefined;

/**
 * **W232 — a scheduler that settles a task INSIDE `addTask`**, which `SchedulerLike` allows and `fyflow-scheduler` at the
 * pin does not do: the settlement's listener runs on the stack of the dispatch that handed the task over, and the driver
 * takes it when that step ends (`spec/run-state.md` `RN-R46`). The suite's `Fake` with one line added, so both doubles
 * fire the same events with the same details.
 */
class Sync extends Fake {
  private readonly script: Script;
  constructor(script: Script) { super(); this.script = script; }
  override addTask(t: unknown): void {
    super.addTask(t);
    const id = (t as { id: string }).id;
    const s = this.script(id);
    if (s !== undefined) this.settle(id, s.state, s.result);
  }
}

/** The script run on a `Sync` scheduler: every settlement arrives inside the dispatch. */
function runSync(flow: FlowDefinition, script: Script, o: Parameters<typeof drive>[1] = {}): Run {
  const r = drive(flow, { ...o, sch: new Sync(script) });
  r.d.start({});
  return r;
}

/** The same script on the suite's `Fake`: each task settled LATER, at rest, in dispatch order. */
function runLater(flow: FlowDefinition, script: Script, o: Parameters<typeof drive>[1] = {}): Run {
  const r = drive(flow, o);
  r.d.start({});
  for (let i = 0; i < r.sch.added.length; i += 1) {
    const id = r.sch.added[i]!.id;
    const s = script(id);
    if (s !== undefined) r.sch.settle(id, s.state, s.result);
  }
  return r;
}

/** The round a `work` task id names: `r1:work:<round>:0`. */
const roundOf = (taskId: string): number => Number(taskId.split(':')[2]);

/** `ingest → L(work) → J → after → done`; `until: input.ok == true`. Options add the bound key, a break and needs. */
function pollFlow(o: {
  maxIterations?: number; from?: string; optional?: boolean; breakable?: boolean; needs?: Record<string, unknown>;
  edgeNeeds?: Record<string, unknown>; entryLoop?: boolean;
  /** W231: the entry is an `if` gate whose `then` leads to the loop — the payload reaches the loop with no worker between. */
  gated?: boolean;
} = {}): FlowDefinition {
  const workEdges = o.breakable
    ? [{ to: 'stop', when: { predicate: 'isLowConfidence' }, ...(o.edgeNeeds ? { needs: o.edgeNeeds } : {}) }, { to: 'J' }]
    : [{ to: 'J' }];
  return {
    flowId: 'w229-poll', version: 1, entry: o.gated ? 'g' : o.entryLoop ? 'L' : 'ingest',
    nodes: [
      ...(o.gated ? [
        { id: 'g', kind: 'gate', type: 'if', settings: { when: { path: 'input.go', op: 'eq', value: true } }, edges: [{ route: 'then', to: 'L' }, { to: 'other' }] },
        { id: 'other', kind: 'task', type: 'IngestWorker', edges: [{ to: 'done' }] },
      ] : o.entryLoop ? [] : [{ id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'L' }] }]),
      { id: 'L', kind: 'loop', branch: 'work', until: { path: 'input.ok', op: 'eq', value: true },
        maxIterations: o.maxIterations ?? 3, ...(o.from ? { maxIterationsFrom: o.from } : {}) },
      { id: 'work', kind: 'task', type: 'ScoreWorker', ...(o.optional ? { optional: true } : {}), ...(o.needs ? { needs: o.needs } : {}), edges: workEdges },
      ...(o.breakable ? [{ id: 'stop', kind: 'end', outcome: 'stopped' }] : []),
      { id: 'J', kind: 'join', of: 'L', edges: [{ to: 'after' }] },
      { id: 'after', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition;
}

/** `isLowConfidence` reads `stop` off the settled result — the break's decision edge. */
const STOP: Record<string, Predicate> = { isLowConfidence: (ctx) => (ctx.outcome.result as { stop?: boolean } | null)?.stop === true };

const DECLARED_CASES = [
  'CONTINUE then DONE: round 1 opens in the routing step of round 0`s arrival, until holds on round 1, the join hands { last, iterations, exhausted } and the run completes',
  'EXHAUSTED at the bound, and until read BEFORE the bound: a last round on which until holds is done, not exhausted',
  'BREAK: an end in the body fires the join with `broke`, and `last` the state the breaking round STARTED with — the seed in round 0 — each an object no round was handed',
  'LOST: a round with no eligible edge makes the join unsatisfiable — joinSettled false, onUnsatisfiableJoin with policyId "loop", the run stuck',
  'the BOUND: maxIterationsFrom lowers maxIterations and does not raise it, read once',
  'FD-R7: absent, a string, a fraction, 0 and a negative number refused from the listener and from start(), and from resolve(), nothing of the loop appended',
  '"$iteration" is the round index in rounds 0..n, on a node`s needs and on an edge`s',
  'a reader AFTER the loop receives every round`s output in ROUND order, a round that routed around the node contributing nothing; and a map inside the body, settled descending',
  'a loop inside a MAP instance: ids unique by their round segment, each instance its own loop, a lost instance ending its map branch (JP-R10)',
  'a loop takes NO policy: a flow of loops runs with none, a map beside a loop still needs one, and no policy is handed, opened or stepped on a loop region',
  // W229's readers (F1, D1 and the adequacy reader's survivors M15, M20, M24, M42-M47, M49, M52) — each a clause the
  // ten cases above did not reach.
  'a HALT taken in the step of a round`s terminal event decides NOTHING — no round, no joinSettled, nothing reported — on every road',
  'the LIFETIME: a loop instance holds its state while a round is live, and nothing at fire, at a loss, at a break or at a cancel',
  'a loop`s join leading to an END inside an enclosing fan-out: the join value is entered IN that region, so its branch exits',
  'a LOST loop resumed: replayed as a decision edge is, reported only past the stored length',
  '"$iteration" under NESTING is the INNERMOST loop`s round — under a map in the body, and under an inner loop',
  // W231 — the review of the pull request carrying P47: a loop the PAYLOAD reaches. Every case above either puts a task
  // before the loop or turns FD-R4's check off, so none of the three was reachable.
  'W231 FD-R4 through an ENTRY loop: the body entry reading "$iteration" is held at start() with round 0 composed, and a schema round 0 cannot satisfy refuses',
  'W231 JP-R15 for a loop the payload reaches: the seed is the loop`s OWN copy — a caller`s later write reaches nothing it hands on, live or resumed',
  'W231 FD-R7 for a loop the payload reaches: the bound is read from the copy the run holds, so a class instance in the payload resolves as its clone does',
  // W232 — the review's finding 3: a settlement heard inside the driver's own step was routed on that stack, so a
  // scheduler settling inside `addTask` grew the stack by a round's frames per round. `RN-R46`: it is taken when the step
  // ends. What is not a loop's is in `settle-inside.test.ts`.
  'W232 a scheduler that settles INSIDE addTask runs 5000 rounds: every round dispatched, the join fired, the run completed, nothing reported',
  'W232 RN-R46 on such a scheduler: a loop`s log IS the log of one that settles later, and each round is handed what JP-R15 says — done, exhausted, a break, a lost round, a loop in a loop, a loop in a map',
  'W232 a cancel taken on a round`s own settlement, on such a scheduler, opens no next round',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

/** `ingest → M(map) → pre → L(work) → J → MJ → after → done`: a loop inside each map instance, `work` optional. */
const IN_A_MAP = {
  flowId: 'w229-in-a-map', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'M' }] },
    { id: 'M', kind: 'map', over: 'items', branch: 'pre' },
    { id: 'pre', kind: 'task', type: 'ExtractWorker', edges: [{ to: 'L' }] },
    { id: 'L', kind: 'loop', branch: 'work', until: { path: 'input.ok', op: 'eq', value: true }, maxIterations: 2 },
    { id: 'work', kind: 'task', type: 'ScoreWorker', optional: true, edges: [{ to: 'J' }] },
    { id: 'J', kind: 'join', of: 'L', edges: [{ to: 'MJ' }] },
    { id: 'MJ', kind: 'join', of: 'M', edges: [{ to: 'after' }] },
    { id: 'after', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

/** Case 8's settlements of `IN_A_MAP`: instance 0 continues then is done, instance 1 loses round 0. */
function runInAMap(r: Run): void {
  r.d.start({});
  done(r, 'r1:ingest:-:0', { items: ['a', 'b'] });
  done(r, 'r1:pre:0:0', { p: 0 });
  done(r, 'r1:pre:1:0', { p: 1 });
  done(r, 'r1:work:0.0:0', { ok: false });
  done(r, 'r1:work:0.1:0', { ok: true });
  r.sch.settle('r1:work:1.0:0', 'failed', null);
}

suite(SUITE, (test) => {
  test(DECLARED_CASES[0]!, () => {
    const r = drive(pollFlow());
    r.d.start({ from: 'caller' });
    done(r, 'r1:ingest:-:0', { seed: 1 });
    equal(input(r, 'r1:work:0:0'), { seed: 1 }, 'round 0`s entry receives the loop`s value — the SEED, ingest`s result (JP-R15)');
    equal(r.d.joinStatusOf('L'), { status: 'waiting', describe: { iterations: 1, bound: 3 } }, 'round 0 live: waiting, one round opened of a bound of 3');
    done(r, 'r1:work:0:0', { ok: false, n: 0 });
    equal(input(r, 'r1:work:1:0'), { ok: false, n: 0 }, 'round 1`s entry receives what round 0 ARRIVED at the join with');
    equal(r.d.joinStatusOf('L'), { status: 'waiting', describe: { iterations: 2, bound: 3 } }, 'until did not hold: round 1 opened');
    // JP-R13 / fact 16: nothing is appended between round 0's arrival and round 1's opening.
    const seq = r.d.foldInputs();
    const at = seq.findIndex((e) => e.kind === 'region' && e.event.type === 'branch.arrived' && e.event.branchPath === '0');
    const next = seq[at + 1];
    ok(at >= 0 && next?.kind === 'region' && next.event.type === 'branch.opened' && next.event.branchPath === '1',
      'the element right after round 0`s branch.arrived IS round 1`s branch.opened — one routing step (JP-R13)');
    done(r, 'r1:work:1:0', { ok: true, n: 1 });
    equal(ids(r), ['r1:ingest:-:0', 'r1:work:0:0', 'r1:work:1:0', 'r1:after:-:0'], 'the ids: one per round at its own segment, then after');
    equal(evs(r), ['opened(L:0)', 'arrived(L:0)', 'opened(L:1)', 'arrived(L:1)'], 'the region events: one branch per round, one at a time');
    const v = input(r, 'r1:after:-:0') as Record<string, unknown>;
    equal(Object.keys(v), ['last', 'iterations', 'exhausted'], 'the join value`s keys, in order, `broke` ABSENT');
    equal(v.last, { ok: true, n: 1 }, '`last`: the arrival until held on');
    equal(v.iterations, 2, '`iterations`: two rounds opened');
    equal(v.exhausted, false, '`exhausted`: the bound did not end it');
    equal(r.d.joinStatusOf('L'), { status: 'satisfied', describe: { iterations: 2, bound: 3 } }, 'after: satisfied');
    equal(r.unsat, [], 'nothing reported unsatisfiable');
    done(r, 'r1:after:-:0', { published: true });
    const st = fold(r.d.foldInputs());
    equal(st.outcome, 'completed', 'the fold: completed');
    equal([st.regions.L?.['-']?.opened, st.regions.L?.['-']?.joined], [['0', '1'], true], 'the fold`s region: two rounds opened, joined');

    // JP-R15: the seed is the loop's value UNCHANGED — a predecessor settling `null` hands round 0 `null`, not a default.
    const z = drive(pollFlow());
    z.d.start({});
    done(z, 'r1:ingest:-:0', null);
    equal(input(z, 'r1:work:0:0'), null, 'a null seed reaches round 0 as null');
  });

  test(DECLARED_CASES[1]!, () => {
    const r = drive(pollFlow());
    r.d.start({});
    done(r, 'r1:ingest:-:0', { seed: 1 });
    for (let i = 0; i < 3; i++) done(r, `r1:work:${i}:0`, { ok: false, n: i });
    equal(ids(r), ['r1:ingest:-:0', 'r1:work:0:0', 'r1:work:1:0', 'r1:work:2:0', 'r1:after:-:0'], 'three rounds, then after — and no fourth');
    equal(new Set(ids(r)).size, ids(r).length, 'every id the run minted is distinct, by its round segment');
    equal(evs(r), ['opened(L:0)', 'arrived(L:0)', 'opened(L:1)', 'arrived(L:1)', 'opened(L:2)', 'arrived(L:2)'], 'the region events');
    equal(input(r, 'r1:after:-:0'), { last: { ok: false, n: 2 }, iterations: 3, exhausted: true }, 'exhausted: the FINAL arrival, 3 rounds, exhausted true');
    done(r, 'r1:after:-:0', {});
    equal(fold(r.d.foldInputs()).outcome, 'completed', 'the fold: completed');

    const b = drive(pollFlow({ maxIterations: 2 }));
    b.d.start({});
    done(b, 'r1:ingest:-:0', { seed: 1 });
    done(b, 'r1:work:0:0', { ok: false });
    done(b, 'r1:work:1:0', { ok: true });
    equal(input(b, 'r1:after:-:0'), { last: { ok: true }, iterations: 2, exhausted: false }, 'until holds on the bound`s last round: DONE, exhausted false');
  });

  test(DECLARED_CASES[2]!, () => {
    const r = drive(pollFlow({ breakable: true }), { predicates: STOP });
    r.d.start({});
    done(r, 'r1:ingest:-:0', { seed: 1 });
    done(r, 'r1:work:0:0', { ok: false, stop: false });
    done(r, 'r1:work:1:0', { stop: true, why: 'x' });
    equal(ids(r), ['r1:ingest:-:0', 'r1:work:0:0', 'r1:work:1:0', 'r1:after:-:0'], 'the ids: the break ends the loop and the join`s successor runs');
    equal(evs(r), ['opened(L:0)', 'arrived(L:0)', 'opened(L:1)', 'exited(L:1)'], 'round 1 EXITS — no round 2');
    const v = input(r, 'r1:after:-:0') as Record<string, unknown>;
    equal(Object.keys(v), ['last', 'iterations', 'exhausted', 'broke'], 'the keys, `broke` last');
    equal(v.last, { ok: false, stop: false }, '`last`: the state round 1 STARTED with — round 0`s arrival');
    equal(v.iterations, 2, '`iterations`: the breaking round included');
    equal(v.exhausted, false, '`exhausted`: false');
    equal(v.broke, { at: 'stop', value: { stop: true, why: 'x' } }, '`broke`: the end`s id and what reached it');
    ok(v.last !== input(r, 'r1:work:1:0'), '`last` is not the object round 1`s entry was handed — each its own copy (JP-R15)');
    done(r, 'r1:after:-:0', {});
    equal(fold(r.d.foldInputs()).outcome, 'completed', 'the fold: completed');

    const z = drive(pollFlow({ breakable: true }), { predicates: STOP });
    z.d.start({});
    done(z, 'r1:ingest:-:0', { seed: 1 });
    done(z, 'r1:work:0:0', { stop: true });
    equal(evs(z), ['opened(L:0)', 'exited(L:0)'], 'a break in round 0');
    equal(input(z, 'r1:after:-:0'), { last: { seed: 1 }, iterations: 1, exhausted: false, broke: { at: 'stop', value: { stop: true } } },
      'round 0 broke: `last` is the SEED, iterations 1');
    ok((input(z, 'r1:after:-:0') as { last: unknown }).last !== input(z, 'r1:work:0:0'), 'and not the object round 0 was handed');
  });

  test(DECLARED_CASES[3]!, () => {
    const r = drive(pollFlow({ optional: true }));
    r.d.start({});
    done(r, 'r1:ingest:-:0', { seed: 1 });
    done(r, 'r1:work:0:0', { ok: false });
    r.sch.settle('r1:work:1:0', 'failed', null);
    equal(ids(r), ['r1:ingest:-:0', 'r1:work:0:0', 'r1:work:1:0'], 'no round 2 and no after');
    equal(evs(r), ['opened(L:0)', 'arrived(L:0)', 'opened(L:1)', 'lost(L:1)'], 'round 1 LOST');
    equal(r.unsat, [{ fanoutId: 'L', regionPath: '-', joinId: 'J', describe: { iterations: 2, bound: 3 }, policyId: 'loop' }],
      'reported once, the driver`s answer: policyId "loop", describe { iterations, bound }');
    equal(r.d.joinStatusOf('L'), { status: 'unsatisfiable', describe: { iterations: 2, bound: 3 } }, 'joinStatusOf: unsatisfiable');
    const st = fold(r.d.foldInputs());
    equal(st.outcome, 'stuck', 'the fold: stuck — a join that can never fire (RN-R10)');
    equal(st.regions.L?.['-']?.joined, false, 'the region: joined false');
    equal(r.failures, [], 'not a run failure');
  });

  test(DECLARED_CASES[4]!, () => {
    for (const [rounds, bound] of [[2, 2], [3, 3], [10, 3]] as const) {
      const r = drive(pollFlow({ from: 'budget.rounds' }));
      r.d.start({});
      done(r, 'r1:ingest:-:0', { budget: { rounds } });
      for (let i = 0; i < 5; i++) if (ids(r).includes(`r1:work:${i}:0`)) done(r, `r1:work:${i}:0`, { ok: false, budget: { rounds: 1 } });
      equal(r.d.joinStatusOf('L'), { status: 'satisfied', describe: { iterations: bound, bound } }, `budget ${rounds} against maxIterations 3: the bound is ${bound}`);
      equal(input(r, 'r1:after:-:0'), { last: { ok: false, budget: { rounds: 1 } }, iterations: bound, exhausted: true },
        `budget ${rounds}: exhausted after ${bound} rounds — and a later arrival's own budget of 1 moved nothing: read ONCE`);
    }
  });

  test(DECLARED_CASES[5]!, () => {
    const BAD: [string, unknown][] = [['absent', undefined], ['a string', '2'], ['a fraction', 1.5], ['0', 0], ['a negative number', -1]];
    for (const [what, v] of BAD) {
      const seed = v === undefined ? {} : { budget: { rounds: v } };
      const r = drive(pollFlow({ from: 'budget.rounds' }));
      r.d.start({});
      done(r, 'r1:ingest:-:0', seed);
      equal(r.failures.length, 1, `${what}, from the listener: reported once`);
      const f = r.failures[0]!;
      ok(f.cause instanceof UnresolvedLoopBound, `${what}: an UnresolvedLoopBound`);
      ok(f.message.includes('FD-R7') && f.message.includes('"L"') && f.message.includes('budget.rounds'), `${what}: the message names the rule, the loop and the key — ${f.message}`);
      equal(ids(r), ['r1:ingest:-:0'], `${what}: nothing of the loop dispatched`);
      ok(!r.d.foldInputs().some((e) => (e.kind === 'regionEntered' && e.regionId === 'L') || e.kind === 'region'), `${what}: nothing of the loop appended`);

      const s = drive(pollFlow({ from: 'budget.rounds', entryLoop: true }));
      throws(() => s.d.start(seed), 'FD-R7', `${what}, an ENTRY loop: start() rethrows`);
      equal(s.failures.length, 1, `${what}: and reports it`);
      equal(ids(s), [], `${what}: nothing dispatched`);
    }
    const p = drive(pollFlow({ from: 'budget.rounds' }));
    p.d.start({});
    p.sch.settle('r1:ingest:-:0', 'user_action', null);
    throws(() => p.d.resolve('r1:ingest:-:0', 'done', { result: { budget: { rounds: 0 } }, actor: 'ana' }), 'FD-R7', 'from resolve(): rethrown');
    equal(p.failures.length, 1, 'and reported');
    equal(ids(p), ['r1:ingest:-:0'], 'nothing of the loop dispatched');
  });

  test(DECLARED_CASES[6]!, () => {
    const seen: unknown[] = [];
    const r = drive(pollFlow({ breakable: true, needs: { state: '.', it: '$iteration' }, edgeNeeds: { i: '$iteration' } }), {
      predicates: { isLowConfidence: (ctx) => { seen.push(ctx.needs.i); return false; } },
    });
    r.d.start({});
    done(r, 'r1:ingest:-:0', { seed: 1 });
    for (let i = 0; i < 3; i++) done(r, `r1:work:${i}:0`, { ok: false, n: i });
    equal(input(r, 'r1:work:0:0'), { state: { seed: 1 }, it: 0 }, 'round 0: the seed, and "$iteration" 0');
    equal(input(r, 'r1:work:1:0'), { state: { ok: false, n: 0 }, it: 1 }, 'round 1: round 0`s arrival, and 1');
    equal(input(r, 'r1:work:2:0'), { state: { ok: false, n: 1 }, it: 2 }, 'round 2: round 1`s arrival, and 2');
    equal(seen, [0, 1, 2], 'an EDGE`s "$iteration": each round`s index, as its predicate saw it');
  });

  test(DECLARED_CASES[7]!, async () => {
    const flow = {
      flowId: 'w229-reader', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'L' }] },
        { id: 'L', kind: 'loop', branch: 'work', until: { path: 'input.ok', op: 'eq', value: true }, maxIterations: 3 },
        { id: 'work', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'J', when: { predicate: 'isLowConfidence' } }, { to: 'extra' }] },
        { id: 'extra', kind: 'task', type: 'MergeWorker', edges: [{ to: 'J' }] },
        { id: 'J', kind: 'join', of: 'L', edges: [{ to: 'after' }] },
        { id: 'after', kind: 'task', type: 'PublishWorker', needs: { extras: ['extra?'] }, edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const r = drive(flow, { predicates: { isLowConfidence: (ctx) => (ctx.outcome.result as { skip?: boolean }).skip === true } });
    r.d.start({});
    done(r, 'r1:ingest:-:0', {});
    done(r, 'r1:work:0:0', { skip: false });
    done(r, 'r1:extra:0:0', { ok: false, r: 0 });
    done(r, 'r1:work:1:0', { skip: true, ok: false });
    done(r, 'r1:work:2:0', { skip: false });
    done(r, 'r1:extra:2:0', { ok: false, r: 2 });
    ok(!ids(r).includes('r1:extra:1:0'), 'round 1 routed around extra');
    equal(input(r, 'r1:after:-:0'), { extras: [{ ok: false, r: 0 }, { ok: false, r: 2 }] },
      'after the loop, ["extra?"]: rounds 0 and 2, in ROUND order; round 1 contributes nothing (ADR 0044, P47 decision 1 (b′))');

    // The corpus's training flow: a map inside the body, each round's instances settled DESCENDING.
    const tr = drive(JSON.parse(await readText(`${ROOT}spec/examples/valid/loop-training.flow.json`)) as FlowDefinition);
    tr.d.start({});
    done(tr, 'r1:ingest:-:0', { budget: { rounds: 2 } });
    for (const round of [0, 1]) {
      done(tr, `r1:plan:${round}:0`, { items: ['a', 'b'] });
      done(tr, `r1:rollout:${round}.1:0`, { roll: `${round}.1` });
      done(tr, `r1:rollout:${round}.0:0`, { roll: `${round}.0` });
      equal(input(tr, `r1:fit:${round}:0`), { 0: { roll: `${round}.0` }, 1: { roll: `${round}.1` } },
        `round ${round}: the inner join fires once per round, its collection keyed by the item index whatever the settlement order`);
      done(tr, `r1:fit:${round}:0`, { fit: round });
      done(tr, `r1:evaluate:${round}:0`, { score: 0.1 });
    }
    equal(tr.events.filter((e) => e.regionId === 'envs').map((e) => `${e.type.replace('branch.', '')}:${e.branchPath}`),
      ['opened:0.0', 'opened:0.1', 'arrived:0.1', 'arrived:0.0', 'opened:1.0', 'opened:1.1', 'arrived:1.1', 'arrived:1.0'],
      'the inner map: one instance of its region per round, each at the round`s prefix');
    equal(input(tr, 'r1:promote:-:0'), { result: { last: { score: 0.1 }, iterations: 2, exhausted: true }, fits: [{ fit: 0 }, { fit: 1 }] },
      'promote: the join value under "." and every round`s fit, in round order');
  });

  test(DECLARED_CASES[8]!, () => {
    const r = drive(IN_A_MAP);
    runInAMap(r);
    // JP-R13 inside a map instance, as case 0 asserts it at top level: one routing step from arrival to the next opening.
    const seq = r.d.foldInputs();
    const at = seq.findIndex((e) => e.kind === 'region' && e.event.type === 'branch.arrived' && e.event.branchPath === '0.0');
    const next = seq[at + 1];
    ok(at >= 0 && next?.kind === 'region' && next.event.type === 'branch.opened' && next.event.branchPath === '0.1',
      'inside a map instance too, the element right after round 0`s arrival IS round 1`s opening (JP-R13)');
    equal(ids(r), ['r1:ingest:-:0', 'r1:pre:0:0', 'r1:pre:1:0', 'r1:work:0.0:0', 'r1:work:1.0:0', 'r1:work:0.1:0', 'r1:after:-:0'],
      'each instance`s rounds at `item.round`');
    equal(new Set(ids(r)).size, ids(r).length, 'and every id distinct');
    equal(evs(r), ['opened(M:0)', 'opened(M:1)', 'opened(L:0.0)', 'opened(L:1.0)', 'arrived(L:0.0)', 'opened(L:0.1)', 'arrived(L:0.1)', 'arrived(M:0)', 'lost(L:1.0)', 'lost(M:1)'],
      'two loop instances, one per item; instance 1`s lost round ends its map branch (JP-R10)');
    equal(r.unsat, [{ fanoutId: 'L', regionPath: '1', joinId: 'J', describe: { iterations: 1, bound: 2 }, policyId: 'loop' }], 'instance 1 reported, by its path');
    equal(r.d.joinStatusOf('L'), null, 'two instances and no path: no sole one');
    equal(r.d.joinStatusOf('L', '0')?.status, 'satisfied', 'instance 0 satisfied');
    equal(r.d.joinStatusOf('L', '1')?.status, 'unsatisfiable', 'instance 1 unsatisfiable');
    equal(input(r, 'r1:after:-:0'), { 0: { last: { ok: true }, iterations: 2, exhausted: false } },
      'the map`s join (live-token): instance 0`s loop value under its item index, instance 1 lost and absent');
  });

  test(DECLARED_CASES[9]!, () => {
    const r = drive(pollFlow(), { policy: false });
    r.d.start({});
    done(r, 'r1:ingest:-:0', {});
    done(r, 'r1:work:0:0', { ok: true });
    equal(input(r, 'r1:after:-:0'), { last: { ok: true }, iterations: 1, exhausted: false }, 'a flow whose only region is a loop runs with no join policy');
    equal(r.d.regionsForPolicies(), [], 'and no policy is handed its region');
    const mapped = {
      flowId: 'w229-map-and-loop', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'M' }] },
        { id: 'M', kind: 'map', over: 'items', branch: 'pre' },
        { id: 'pre', kind: 'task', type: 'ExtractWorker', edges: [{ to: 'MJ' }] },
        { id: 'MJ', kind: 'join', of: 'M', edges: [{ to: 'L' }] },
        { id: 'L', kind: 'loop', branch: 'work', until: { path: 'input.ok', op: 'eq', value: true }, maxIterations: 2 },
        { id: 'work', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'J' }] },
        { id: 'J', kind: 'join', of: 'L', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    let refused: unknown = null;
    try { drive(mapped, { policy: false }); } catch (e) { refused = e; }
    ok(refused instanceof MissingJoinPolicy && (refused as Error).message.includes('has 1 '), `a map beside the loop still needs one, the map counted alone: ${String(refused)}`);
    equal(drive(mapped).d.regionsForPolicies().map((g) => g.fanoutId), ['M'], 'and only the map`s region is a policy`s');

    // JP-R14: the policy is never OPENED or STEPPED on a loop region — a recording `live-token`, over a run with a loop
    // inside each map instance, continuing, done and lost.
    const asked: string[] = [];
    const spy = {
      ...liveToken,
      open: (g: { fanoutId: string }) => { asked.push(`open:${g.fanoutId}`); return liveToken.open(g as never); },
      step: (s: never, e: RegionEvent) => { asked.push(`step:${e.regionId}`); return liveToken.step(s, e); },
    } as unknown as JoinPolicy;
    const s = drive(IN_A_MAP, { policy: spy });
    runInAMap(s);
    ok(asked.includes('open:M') && asked.includes('step:M'), `the ARRANGEMENT: the recorder saw the map's region — ${asked.join(' ')}`);
    equal(asked.filter((a) => !a.endsWith(':M')), [], 'and nothing of the loop`s region L — no open, no step');
  });

  test(DECLARED_CASES[10]!, () => {
    const ROADS: [string, FlowDefinition, RegionEvent['type'], unknown][] = [
      ['an arrival that would open round 1', pollFlow(), 'branch.arrived', { ok: false }],
      ['an arrival at the bound', pollFlow({ maxIterations: 1 }), 'branch.arrived', { ok: false }],
      ['an arrival until holds on', pollFlow(), 'branch.arrived', { ok: true }],
      ['a break', pollFlow({ breakable: true }), 'branch.exited', { stop: true }],
      ['a lost round', pollFlow({ optional: true }), 'branch.lost', null],
    ];
    for (const [road, flow, on, result] of ROADS) {
      const r = drive(flow, {
        predicates: STOP,
        onEvent: (e, d) => { if (e.regionId === 'L' && e.type === on) void d.cancel({ actor: 'ana' }); },
      });
      r.d.start({});
      done(r, 'r1:ingest:-:0', { seed: 1 });
      if (result === null) r.sch.settle('r1:work:0:0', 'failed', null);
      else done(r, 'r1:work:0:0', result);
      const seq = r.d.foldInputs();
      const c = seq.findIndex((e) => e.kind === 'cancelRequested');
      ok(c > 0, `${road}: the ARRANGEMENT — the cancel was taken, from the consumer's callback on the round's ${on}`);
      equal(seq.slice(c + 1).filter((e) => e.kind === 'region' || e.kind === 'joinSettled').map((e) => e.kind), [],
        `${road}: nothing of the loop appended after cancelRequested — no round opened, no joinSettled (JP-R14, RN-R29)`);
      equal(ids(r), ['r1:ingest:-:0', 'r1:work:0:0'], `${road}: nothing dispatched past round 0`);
      equal(r.unsat, [], `${road}: nothing reported unsatisfiable`);
      equal(r.failures, [], `${road}: and no run failure — the break road read a released exit before W229's F1`);
      equal(r.d.joinStatusOf('L')?.status, 'waiting', `${road}: the loop decided nothing — still waiting`);
      equal(fold(seq).outcome, 'cancelled', `${road}: the fold reads the owner's cancel (RN-R31), nothing in flight`);
    }
  });

  test(DECLARED_CASES[11]!, () => {
    const live = (r: Run): string[] =>
      loopRuns(r).flatMap((run) => ['state', 'arrival', 'exit'].filter((k) => run[k] !== undefined));
    const f = drive(pollFlow());
    f.d.start({});
    done(f, 'r1:ingest:-:0', { seed: 1 });
    equal(live(f), ['state'], 'round 0 live: the state it started with, the seed');
    done(f, 'r1:work:0:0', { ok: false });
    equal(live(f), ['state'], 'round 1 live: its state — the arrival moved into it, not kept beside it');
    done(f, 'r1:work:1:0', { ok: true });
    equal(live(f), [], 'the join FIRED: nothing held (JP-R15)');

    const l = drive(pollFlow({ optional: true }));
    l.d.start({});
    done(l, 'r1:ingest:-:0', { seed: 1 });
    l.sch.settle('r1:work:0:0', 'failed', null);
    equal(live(l), [], 'the join UNSATISFIABLE: nothing held');

    const b = drive(pollFlow({ breakable: true }), { predicates: STOP });
    b.d.start({});
    done(b, 'r1:ingest:-:0', { seed: 1 });
    done(b, 'r1:work:0:0', { stop: true });
    equal(live(b), [], 'a BREAK fired the join: nothing held, the exit included');

    const c = drive(pollFlow());
    c.d.start({});
    done(c, 'r1:ingest:-:0', { seed: 1 });
    done(c, 'r1:work:0:0', { ok: false });
    equal(live(c), ['state'], 'the ARRANGEMENT: round 1 live, its state held');
    void c.d.cancel({ actor: 'ana' });
    equal(live(c), [], 'a CANCEL, a run-level moment: nothing held');
    equal(loopRuns(c).length, 1, 'and the instance itself kept — its counts are what joinStatusOf reads');
    equal(c.d.joinStatusOf('L'), { status: 'waiting', describe: { iterations: 2, bound: 3 } }, 'joinStatusOf still answers');
  });

  test(DECLARED_CASES[12]!, () => {
    const flow = {
      flowId: 'w229-loop-then-end', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'F' }] },
        { id: 'F', kind: 'fanout', branches: ['side', 'pre'] },
        { id: 'side', kind: 'task', type: 'ExtractWorker', edges: [{ to: 'FJ' }] },
        { id: 'pre', kind: 'task', type: 'ExtractWorker', edges: [{ to: 'L' }] },
        { id: 'L', kind: 'loop', branch: 'work', until: { path: 'input.ok', op: 'eq', value: true }, maxIterations: 2 },
        { id: 'work', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'J' }] },
        { id: 'J', kind: 'join', of: 'L', edges: [{ to: 'bend' }] },
        { id: 'bend', kind: 'end', outcome: 'stopped' },
        { id: 'FJ', kind: 'join', of: 'F', edges: [{ to: 'after' }] },
        { id: 'after', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const r = drive(flow);
    r.d.start({});
    done(r, 'r1:ingest:-:0', {});
    done(r, 'r1:pre:1:0', {});
    done(r, 'r1:work:1.0:0', { ok: true });
    ok(evs(r).includes('arrived(L:1.0)') && evs(r).includes('exited(F:1)'),
      `the loop's join value reaches \`bend\` INSIDE F's branch 1, which EXITS — ${evs(r).join(' ')}`);
    equal(r.d.joinStatusOf('F')?.status, 'waiting', 'F waits on its other branch only');
    done(r, 'r1:side:0:0', { s: 0 });
    equal(r.d.joinStatusOf('F')?.status, 'satisfied', 'and fires on it — live-token, no branch live');
    equal(input(r, 'r1:after:-:0'), { side: { s: 0 } }, 'the collection (JP-R12, a fan-out keyed by ENTRY id): `side`, the exited branch absent');
  });

  test(DECLARED_CASES[13]!, () => {
    const flow = pollFlow({ optional: true });
    const inside: Checkpoint[] = [];
    const ref = {} as { d: Driver };
    const sch = new Fake();
    ref.d = new Driver(flow, {
      runId: 'r1', scheduler: sch, createTask: (c) => c as never, predicates: new Map(),
      workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools, groups: Object.keys(reg.groups ?? {}),
      validateBoundaries: false, now: () => 1, joinPolicy: liveToken as JoinPolicy,
      onFoldInput: (_i: FoldInput, seq: number) => { inside[seq] = ref.d.checkpoint(); },
    });
    ref.d.start({});
    sch.settle('r1:ingest:-:0', 'done', { seed: 1 });
    sch.settle('r1:work:0:0', 'done', { ok: false });
    sch.settle('r1:work:1:0', 'failed', null);
    const quiet = ref.d.checkpoint();
    ok(quiet.events.some((e) => e.kind === 'joinSettled' && e.regionId === 'L' && e.fired === false), 'the ARRANGEMENT: the stored loop was lost');
    const resumed = (cp: Checkpoint) => {
      const seen: UnsatisfiableJoin[] = [];
      const d = new Driver(flow, {
        runId: 'r1', scheduler: new Fake(), createTask: (c) => c as never, predicates: new Map(),
        workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools, groups: Object.keys(reg.groups ?? {}),
        validateBoundaries: false, now: () => 1, joinPolicy: liveToken as JoinPolicy,
        onUnsatisfiableJoin: (u) => seen.push(u),
      });
      d.resume(cp);
      return { d, seen };
    };
    const q = resumed(quiet);
    equal(q.seen, [], 'a lost loop the store HOLDS is not reported again (RN-R24)');
    equal(q.d.foldInputs().slice(0, quiet.events.length), quiet.events, 'and the replay regenerates the stored log exactly — no divergence');
    equal(q.d.foldInputs().slice(quiet.events.length).map((e) => e.kind), ['resumed'], 'and appends only the resume`s own element (RN-R19)');
    equal(q.d.joinStatusOf('L'), { status: 'unsatisfiable', describe: { iterations: 2, bound: 3 } }, 'and the replayed loop answers as the live one did');
    const cut = inside[quiet.events.findIndex((e) => e.kind === 'outcome' && e.record.taskId === 'r1:work:1:0')]!;
    ok(!cut.events.some((e) => e.kind === 'joinSettled'), 'the ARRANGEMENT: a store cut at round 1`s settlement, before the loss');
    equal(resumed(cut).seen, [{ fanoutId: 'L', regionPath: '-', joinId: 'J', describe: { iterations: 2, bound: 3 }, policyId: 'loop' }],
      'and a loss the replay regenerates PAST the stored length is reported, once');
  });

  test(DECLARED_CASES[14]!, () => {
    // Under a MAP in the body: `"$iteration"` is the loop's round, not the map's item index (the LAST segment).
    const mapped = {
      flowId: 'w229-iter-map', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'L' }] },
        { id: 'L', kind: 'loop', branch: 'plan', until: { path: 'input.ok', op: 'eq', value: true }, maxIterations: 2 },
        { id: 'plan', kind: 'task', type: 'ExtractWorker', edges: [{ to: 'M' }] },
        { id: 'M', kind: 'map', over: 'items', branch: 'roll' },
        { id: 'roll', kind: 'task', type: 'ScoreWorker', needs: { it: '$iteration' }, edges: [{ to: 'MJ' }] },
        { id: 'MJ', kind: 'join', of: 'M', edges: [{ to: 'J' }] },
        { id: 'J', kind: 'join', of: 'L', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const m = drive(mapped);
    m.d.start({});
    done(m, 'r1:ingest:-:0', {});
    done(m, 'r1:plan:0:0', { items: ['a', 'b'] });
    equal([input(m, 'r1:roll:0.0:0'), input(m, 'r1:roll:0.1:0')], [{ it: 0 }, { it: 0 }], 'round 0, items 0 and 1: "$iteration" 0 for both');
    done(m, 'r1:roll:0.0:0', {});
    done(m, 'r1:roll:0.1:0', {});
    done(m, 'r1:plan:1:0', { items: ['a', 'b'] });
    equal([input(m, 'r1:roll:1.0:0'), input(m, 'r1:roll:1.1:0')], [{ it: 1 }, { it: 1 }], 'round 1, items 0 and 1: 1 for both');

    // Under an INNER LOOP: the inner loop's round, not the outer's.
    const nested = {
      flowId: 'w229-iter-nested', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'O' }] },
        { id: 'O', kind: 'loop', branch: 'pre', until: { path: 'input.last.done', op: 'eq', value: true }, maxIterations: 2 },
        { id: 'pre', kind: 'task', type: 'ExtractWorker', edges: [{ to: 'I' }] },
        { id: 'I', kind: 'loop', branch: 'w', until: { path: 'input.ok', op: 'eq', value: true }, maxIterations: 3 },
        { id: 'w', kind: 'task', type: 'ScoreWorker', needs: { it: '$iteration' }, edges: [{ to: 'IJ' }] },
        { id: 'IJ', kind: 'join', of: 'I', edges: [{ to: 'OJ' }] },
        { id: 'OJ', kind: 'join', of: 'O', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const n = drive(nested);
    n.d.start({});
    done(n, 'r1:ingest:-:0', {});
    done(n, 'r1:pre:0:0', {});
    done(n, 'r1:w:0.0:0', { ok: false });
    done(n, 'r1:w:0.1:0', { ok: true, done: false });
    done(n, 'r1:pre:1:0', {});
    equal([input(n, 'r1:w:0.0:0'), input(n, 'r1:w:0.1:0'), input(n, 'r1:w:1.0:0')], [{ it: 0 }, { it: 1 }, { it: 0 }],
      'outer round 0`s inner rounds 0 and 1, then outer round 1`s inner round 0 — each the INNER round');
  });

  /** `score` with an `inputSchema` of the case's own: `round` an integer `>= min`. The corpus registry declares none. */
  const scoreHeldTo = (min: number): unknown => ({
    ...(reg.workers as unknown as Record<string, unknown>),
    score: { url: 'corpus://score', inputSchema: { type: 'object', required: ['state', 'round'], properties: { round: { type: 'integer', minimum: min } } } },
  });

  /** The two roads by which a PAYLOAD reaches a loop with no worker between: the loop IS the entry, or an entry gate leads to it. */
  const ROADS: [string, { entryLoop?: boolean; gated?: boolean }, Record<string, unknown>][] = [
    ['an ENTRY loop', { entryLoop: true }, {}],
    ['a loop behind an entry GATE', { gated: true }, { go: true }],
  ];

  test(DECLARED_CASES[15]!, () => {
    for (const [road, shape, base] of ROADS) {
      const flow = pollFlow({ ...shape, needs: { state: '.', round: '$iteration' } });
      const r = drive(flow, { workers: scoreHeldTo(0), boundaries: true });
      r.d.start({ ...base, a: 1 });
      equal(ids(r), ['r1:work:0:0'], `${road}: start() returns and round 0's entry is dispatched — FD-R4 held it and it passed`);
      equal(input(r, 'r1:work:0:0'), { state: { ...base, a: 1 }, round: 0 }, `${road}: round 0's entry receives the payload and "$iteration" 0 (JP-R13, JP-R15)`);

      // The check RAN: the same flow, a schema round 0 cannot satisfy. Without this, the lines above pass with FD-R4 skipped.
      const z = drive(flow, { workers: scoreHeldTo(1), boundaries: true });
      let thrown: unknown = null;
      try { z.d.start({ ...base, a: 1 }); } catch (e) { thrown = e; }
      ok(thrown instanceof BoundaryRefused, `${road}: round 0 composed as 0 fails \`minimum: 1\`: a BoundaryRefused, at start() — got ${String(thrown)}`);
      equal(ids(z), [], `${road}: and nothing was dispatched`);
    }

    // The index is the TARGET's loop's, not the flow's first: a second loop declared AHEAD of the entry one (the adequacy
    // reader's M06, which survived every case while each flow held one loop).
    const two = {
      flowId: 'w231-two-loops', version: 1, entry: 'LA',
      nodes: [
        { id: 'LB', kind: 'loop', branch: 'workB', until: { path: 'input.ok', op: 'eq', value: true }, maxIterations: 2 },
        { id: 'workB', kind: 'task', type: 'ExtractWorker', edges: [{ to: 'JB' }] },
        { id: 'JB', kind: 'join', of: 'LB', edges: [{ to: 'done' }] },
        { id: 'LA', kind: 'loop', branch: 'workA', until: { path: 'input.ok', op: 'eq', value: true }, maxIterations: 2 },
        { id: 'workA', kind: 'task', type: 'ScoreWorker', needs: { state: '.', round: '$iteration' }, edges: [{ to: 'JA' }] },
        { id: 'JA', kind: 'join', of: 'LA', edges: [{ to: 'LB' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const t2 = drive(two, { workers: scoreHeldTo(0), boundaries: true });
    t2.d.start({ a: 1 });
    equal(input(t2, 'r1:workA:0:0'), { state: { a: 1 }, round: 0 }, 'two loops, the entry one declared SECOND: its body entry is held under its OWN loop`s round 0');
  });

  test(DECLARED_CASES[16]!, () => {
    for (const [road, shape, base] of ROADS) {
      const flow = pollFlow({ ...shape, breakable: true });
      // A nested object (a shallow copy would share it) and two values JSON cannot carry (a JSON round-trip would lose them).
      const payload: Record<string, unknown> = { ...base, seed: 1, inner: { x: 1 }, at: new Date(0), tags: new Set(['x']) };
      const r = drive(flow, { predicates: STOP });
      r.d.start(payload);
      // The caller's object, written AFTER start() returned — at the top and one level down.
      payload.writtenAfterStart = true;
      (payload.inner as { x: number }).x = 2;
      done(r, 'r1:work:0:0', { stop: true });
      const v = input(r, 'r1:after:-:0') as { last: Record<string, unknown>; iterations: number };
      equal(v.iterations, 1, `${road}, the ARRANGEMENT: round 0 broke`);
      equal(Object.keys(v.last), [...Object.keys(base), 'seed', 'inner', 'at', 'tags'], `${road}: \`last\` has the keys the payload had AT start() — the later top-level write is not in it`);
      equal(v.last.inner, { x: 1 }, `${road}: nor the later NESTED write — a deep copy (JP-R15 v0.27: the loop's own copy)`);
      ok(v.last !== payload && v.last.inner !== payload.inner, `${road}: and neither it nor its parts are the caller's objects`);
      ok(v.last.at instanceof Date && v.last.at.getTime() === 0, `${road}: a Date survives the copy — a structured clone, not a JSON round-trip`);
      ok(v.last.tags instanceof Set && v.last.tags.has('x'), `${road}: and a Set`);
      ok(v.last !== input(r, 'r1:work:0:0'), `${road}: and \`last\` is not the object round 0's entry was handed`);

      // CONTROLS — true before W231 too: the header's copy, and what a resume hands on. What W231 changed is that the
      // LIVE run above now agrees with them.
      const cp = r.d.checkpoint();
      const sch = new Fake();
      const d = new Driver(flow, {
        runId: 'r1', scheduler: sch, createTask: (c) => c as never, predicates: new Map(Object.entries(STOP)),
        workers: reg.workers, nodeTypes: reg.nodeTypes, pools: reg.pools, groups: Object.keys(reg.groups ?? {}),
        validateBoundaries: false, now: () => 1, joinPolicy: liveToken as JoinPolicy,
      });
      d.resume(cp);
      const again = (sch.added.find((x) => x.id === 'r1:after:-:0')?.payload as { input?: { last?: Record<string, unknown> } } | undefined)?.input?.last;
      equal(again?.inner, { x: 1 }, `${road}, control: the RESUMED run hands on the value as it was at start() (RN-R15, RN-R19)`);
      equal(Object.keys(again ?? {}), Object.keys(v.last), `${road}: so the live run and its resume hand on the same \`last\``);
    }
  });

  test(DECLARED_CASES[17]!, () => {
    class Budget { rounds = 2; }
    for (const [road, shape, base] of ROADS) {
      const r = drive(pollFlow({ ...shape, from: 'budget.rounds', maxIterations: 5 }));
      r.d.start({ ...base, budget: new Budget() });
      done(r, 'r1:work:0:0', { ok: false });
      done(r, 'r1:work:1:0', { ok: false });
      equal(ids(r), ['r1:work:0:0', 'r1:work:1:0', 'r1:after:-:0'], `${road}: start() does not refuse, and two rounds run and no third — the bound is the 2 the loop's own copy holds (FD-R7 v0.59), below maxIterations 5`);
      equal(input(r, 'r1:after:-:0'), { last: { ok: false }, iterations: 2, exhausted: true }, `${road}: exhausted at the bound the key named`);
    }
  });

  test(DECLARED_CASES[18]!, () => {
    const ROUNDS = 5000; // the declaration's figure: far past any stack a round's frames could fill, not a measured threshold
    const script: Script = (id) => id === 'r1:ingest:-:0' ? { state: 'done', result: { seed: 1 } }
      : id.startsWith('r1:work:') ? { state: 'done', result: { ok: roundOf(id) === ROUNDS - 1, n: roundOf(id) } }
      : { state: 'done', result: {} };
    const r = runSync(pollFlow({ maxIterations: ROUNDS }), script);
    equal(r.failures, [], 'nothing reported');
    equal(r.sch.added.length, ROUNDS + 2, 'ingest, one task per round, and the join`s successor');
    equal(r.sch.added[ROUNDS]!.id, `r1:work:${ROUNDS - 1}:0`, 'the last round is dispatched at its own path');
    equal(input(r, 'r1:after:-:0'), { last: { ok: true, n: ROUNDS - 1 }, iterations: ROUNDS, exhausted: false },
      'the join fired with the final arrival: done on the last round, not exhausted (JP-R14: until is read before the bound)');
    equal(r.d.joinStatusOf('L'), { status: 'satisfied', describe: { iterations: ROUNDS, bound: ROUNDS } }, 'and the loop says so');
    equal(fold(r.d.foldInputs()).outcome, 'completed', 'the fold: completed');
  });

  test(DECLARED_CASES[19]!, () => {
    const ingest = { state: 'done' as const, result: { seed: 1 } };
    const other = { state: 'done' as const, result: {} };
    /** `pre → LI(work) → JI → post`, the body of `LO`: a loop in a loop, one task in flight at a time. */
    const nested = {
      flowId: 'w232-nested', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'LO' }] },
        { id: 'LO', kind: 'loop', branch: 'pre', until: { path: 'input.ok', op: 'eq', value: true }, maxIterations: 3 },
        { id: 'pre', kind: 'task', type: 'ExtractWorker', edges: [{ to: 'LI' }] },
        { id: 'LI', kind: 'loop', branch: 'work', until: { path: 'input.ok', op: 'eq', value: true }, maxIterations: 2 },
        { id: 'work', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'JI' }] },
        { id: 'JI', kind: 'join', of: 'LI', edges: [{ to: 'post' }] },
        { id: 'post', kind: 'task', type: 'MergeWorker', edges: [{ to: 'JO' }] },
        { id: 'JO', kind: 'join', of: 'LO', edges: [{ to: 'after' }] },
        { id: 'after', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const ROWS: [string, FlowDefinition, Script, string[], Record<string, Predicate>][] = [
      ['done on round 2', pollFlow(), (id) => id === 'r1:ingest:-:0' ? ingest : id.startsWith('r1:work:') ? { state: 'done', result: { ok: roundOf(id) === 2 } } : other,
        ['r1:ingest:-:0', 'r1:work:0:0', 'r1:work:1:0', 'r1:work:2:0', 'r1:after:-:0'], {}],
      ['exhausted', pollFlow(), (id) => id === 'r1:ingest:-:0' ? ingest : id.startsWith('r1:work:') ? { state: 'done', result: { ok: false } } : other,
        ['r1:ingest:-:0', 'r1:work:0:0', 'r1:work:1:0', 'r1:work:2:0', 'r1:after:-:0'], {}],
      ['a break in round 1', pollFlow({ breakable: true }), (id) => id === 'r1:ingest:-:0' ? ingest : id.startsWith('r1:work:') ? { state: 'done', result: { stop: roundOf(id) === 1 } } : other,
        ['r1:ingest:-:0', 'r1:work:0:0', 'r1:work:1:0', 'r1:after:-:0'], STOP],
      ['round 1 lost', pollFlow({ optional: true }), (id) => id === 'r1:ingest:-:0' ? ingest : id === 'r1:work:1:0' ? { state: 'failed', result: null } : id.startsWith('r1:work:') ? { state: 'done', result: { ok: false } } : other,
        ['r1:ingest:-:0', 'r1:work:0:0', 'r1:work:1:0'], {}],
      // The inner loop is done on its round 1 in each outer round; the outer is done on its round 1.
      ['a loop in a loop', nested, (id) => id === 'r1:ingest:-:0' ? ingest
        : id.startsWith('r1:work:') ? { state: 'done', result: { ok: id.split(':')[2]!.endsWith('.1') } }
        : id.startsWith('r1:post:') ? { state: 'done', result: { ok: roundOf(id) === 1 } } : other,
        ['r1:ingest:-:0', 'r1:pre:0:0', 'r1:work:0.0:0', 'r1:work:0.1:0', 'r1:post:0:0',
          'r1:pre:1:0', 'r1:work:1.0:0', 'r1:work:1.1:0', 'r1:post:1:0', 'r1:after:-:0'], {}],
    ];
    for (const [row, flow, script, wantIds, predicates] of ROWS) {
      const s = runSync(flow, script, { predicates });
      const l = runLater(flow, script, { predicates });
      equal(ids(s), wantIds, `${row}: the tasks a scheduler settling inside addTask is handed, by hand from ID-R6`);
      equal(s.failures, [], `${row}: nothing reported`);
      equal(s.d.foldInputs(), l.d.foldInputs(), `${row}: its log IS the log of the scheduler that settles later, element for element (RN-R46)`);
    }

    // What each ROUND is handed — a `dispatched` element carries no payload, so the log comparison above cannot see it
    // (the first attempt's adequacy reader: a round opened from a stale state passed every case).
    const fed = runSync(pollFlow({ maxIterations: 4 }), (id) => id === 'r1:ingest:-:0' ? ingest
      : id.startsWith('r1:work:') ? { state: 'done', result: { ok: false, r: roundOf(id) } } : other);
    equal([0, 1, 2, 3].map((k) => input(fed, `r1:work:${k}:0`)), [{ seed: 1 }, { ok: false, r: 0 }, { ok: false, r: 1 }, { ok: false, r: 2 }],
      'round 0 is handed the seed and round k what round k − 1 arrived with (JP-R15)');
    equal(input(fed, 'r1:after:-:0'), { last: { ok: false, r: 3 }, iterations: 4, exhausted: true }, 'and the join its value');

    // A loop inside a MAP instance: both instances' rounds interleave as a scheduler settling later in dispatch order
    // interleaves them, so the logs ARE compared — and the ids (ID-R6) and each instance's loop value (JP-R15) by hand.
    const mapScript: Script = (id) => id === 'r1:ingest:-:0' ? { state: 'done', result: { items: ['a', 'b'] } }
      : id.startsWith('r1:pre:') ? { state: 'done', result: { p: roundOf(id) } }
      : id === 'r1:work:0.0:0' ? { state: 'done', result: { ok: false } }
      : id.startsWith('r1:work:') ? { state: 'done', result: { ok: true } } : other;
    const m = runSync(IN_A_MAP, mapScript);
    equal(ids(m), ['r1:ingest:-:0', 'r1:pre:0:0', 'r1:pre:1:0', 'r1:work:0.0:0', 'r1:work:1.0:0', 'r1:work:0.1:0', 'r1:after:-:0'],
      'a loop in a map: both instances` round 0, then instance 0`s round 1 — each id at its own path');
    equal(input(m, 'r1:after:-:0'), { 0: { last: { ok: true }, iterations: 2, exhausted: false }, 1: { last: { ok: true }, iterations: 1, exhausted: false } },
      'and the map`s join hands on each instance`s loop value, keyed by its item index');
    equal(m.d.foldInputs(), runLater(IN_A_MAP, mapScript).d.foldInputs(), 'its log IS the later scheduler`s too');
    equal(m.failures, [], 'nothing reported');
  });

  test(DECLARED_CASES[20]!, () => {
    const script: Script = (id) => id === 'r1:ingest:-:0' ? { state: 'done', result: { seed: 1 } }
      : id.startsWith('r1:work:') ? { state: 'done', result: { ok: false } } : { state: 'done', result: {} };
    const r = runSync(pollFlow({ maxIterations: 5 }), script, {
      onEvent: (e, d) => { if (e.regionId === 'L' && e.type === 'branch.arrived' && e.branchPath === '1') void d.cancel({ actor: 'ana' }); },
    });
    equal(ids(r), ['r1:ingest:-:0', 'r1:work:0:0', 'r1:work:1:0'], 'rounds 0 and 1 ran; the cancel on round 1`s arrival opened no round 2');
    equal(evs(r), ['opened(L:0)', 'arrived(L:0)', 'opened(L:1)', 'arrived(L:1)'], 'and no further region event (JP-R14: a halted run decides nothing)');
    ok(!r.d.foldInputs().some((e) => e.kind === 'joinSettled'), 'nor a joinSettled');
  });

  test(DECLARED_CASES[DECLARED_CASES.length - 1]!, () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name)).sort();
    equal(ran, [...DECLARED_CASES].sort(), 'the cases that ran ARE the declared ones, both ways');
  });
});
