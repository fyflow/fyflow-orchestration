/**
 * Ladder L2 — **cancelling a run through the driver**: `spec/run-state.md` v0.18 `RN-R31` (and `RN-R30`'s outcome read
 * off the driver's own sequence), [ADR 0104](../../doc/decisions/0104-a-run-its-owner-cancels-is-cancelling-until-its-last-task-has-stopped.md),
 * [W173](../../doc/work-items/w173-cancelling-a-run.md), P34 stop-and-asks (b), (c), (i), and the hazard
 * [ADR 0103](../../doc/decisions/0103-every-halt-shares-one-dispatch-hold.md) hands on (`RN-R29` (i)).
 *
 * **The fake's `cancel` plays each road P34 fact 8 measured on real workers, and nothing else**: a RUNNING task —
 * `task.cancelling` at the call, `task.cancelled` when the test says it stopped; a WAITING one — `task.cancelled`
 * INSIDE the call; one cancelled PRE-PICKUP on a threaded pool — `task.cancelling` and later `task.cancelled`, with no
 * `task.running` ever; one in a retry BACKOFF — `task.running`, `task.retrying`, then `task.cancelled` inside the call
 * with no `task.cancelling`; and an id the scheduler does not hold — `false`, nothing fired (the scheduler's
 * AGENTS.md section 5). A parked task is never sent: it is not in flight.
 *
 * **Every expected value is derived from `RN-R31`'s order and the flow's shape** — hold, ONE `cancelRequested`
 * element, then a cancel per task in flight in dispatch order (`RN-R21`'s set) — and never from a run's output. Each
 * claim sits beside its CONTROL where one exists.
 */
import { equal, ok, collected, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { Driver, ResumeRefused, RunControlRefused, resumeRefusal } from '../../src/driver/driver.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { fold, type FoldInput } from '../../src/fold/run-state.ts';
import { liveToken } from '../../src/fold/policies.ts';

type Road = 'running' | 'waiting' | 'prepickup' | 'backoff';

/** L2's fake, with a `cancel` that plays the scheduler's roads. It queues nothing and runs nothing. */
class CancelFake {
  readonly added: string[] = [];
  /** Every `cancel` call, in order: the id, the options as handed, and whether the scheduler HELD the id at the call. */
  readonly cancels: { id: string; options: unknown; held: boolean }[] = [];
  /** Every event fired, `type id`, in order — the scheduler's own view, whatever the driver subscribes. */
  readonly fired: string[] = [];
  readonly roads = new Map<string, Road>();
  private readonly settled = new Set<string>();
  private readonly stopping = new Map<string, { promise: Promise<boolean>; resolve: (v: boolean) => void }>();
  private listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(task: unknown): void { this.added.push((task as { id: string }).id); }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  emit(type: string, id: string, state: string): void {
    this.fired.push(`${type} ${id}`);
    const detail = { id, state, result: state === 'done' ? { v: id } : null, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
    for (const fn of this.listeners.get(type) ?? []) fn({ detail });
  }
  /** A settlement the scheduler fires on its own — and a pending cancel of that task resolves `false`: it finished first. */
  settle(id: string, state: 'done' | 'failed' | 'user_action' | 'cancelled'): void {
    this.settled.add(id);
    if (state === 'done') this.emit('task.completed', id, 'done');
    else if (state === 'cancelled') this.emit('task.cancelled', id, 'cancelled');
    else {
      this.emit('task.failed', id, state);
      if (state === 'user_action') this.emit('task.user_action', id, state);
    }
    const s = this.stopping.get(id);
    if (s) { this.stopping.delete(id); s.resolve(state === 'cancelled'); }
  }
  /** A task being cancelled has stopped: `task.cancelled`, and its `cancel()` resolves `true`. */
  finish(id: string): void {
    ok(this.stopping.has(id), `fixture: "${id}" is not being cancelled`);
    this.settle(id, 'cancelled');
  }
  cancel(id: string, options?: unknown): Promise<boolean> {
    const held = this.added.includes(id);
    this.cancels.push({ id, options, held });
    if (!held || this.settled.has(id)) return Promise.resolve(false);
    const repeat = this.stopping.get(id);
    if (repeat) return repeat.promise;
    const road = this.roads.get(id) ?? 'running';
    if (road === 'waiting' || road === 'backoff') {
      this.settle(id, 'cancelled');
      return Promise.resolve(true);
    }
    this.emit('task.cancelling', id, 'running');
    let resolve!: (v: boolean) => void;
    const promise = new Promise<boolean>((r) => { resolve = r; });
    this.stopping.set(id, { promise, resolve });
    return promise;
  }
}

/** split(a, w, p, k, u, d) -> collect -> publish -> done: SIX branches, one per road and a parked one and a race. */
const SIX = {
  flowId: 'cancel-six', version: 1, entry: 'split',
  nodes: [
    { id: 'split', kind: 'fanout', branches: ['a', 'w', 'p', 'k', 'u', 'd'] },
    ...['a', 'w', 'p', 'k', 'u', 'd'].map((id) => ({ id, kind: 'task', type: 'T', edges: [{ to: 'collect' }] })),
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

/** split(a, b) -> collect -> publish -> done. */
const TWO = {
  flowId: 'cancel-two', version: 1, entry: 'split',
  nodes: [
    { id: 'split', kind: 'fanout', branches: ['a', 'b'] },
    { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    { id: 'b', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

/** x -> y -> done. */
const LINE = {
  flowId: 'cancel-line', version: 1, entry: 'x',
  nodes: [
    { id: 'x', kind: 'task', type: 'T', edges: [{ to: 'y' }] },
    { id: 'y', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

const label = (e: FoldInput): string => {
  switch (e.kind) {
    case 'dispatched': return `dispatched ${e.taskId}`;
    case 'outcome': return `outcome ${e.record.taskId} ${(e.record as { terminalState: string }).terminalState}`;
    case 'resolution': return `resolution ${e.record.taskId}`;
    case 'region': return `${e.event.type} ${e.event.branchPath}`;
    case 'cancelRequested': return `cancelRequested ${e.actor} ${String(e.reason)}`;
    default: return e.kind;
  }
};

function harness(def: FlowDefinition, scheduler: object = new CancelFake(), extra: Record<string, unknown> = {}) {
  const events: string[] = [];
  const failures: string[] = [];
  const driver = new Driver(def, {
    runId: 'r1', scheduler: scheduler as CancelFake, createTask: (c) => c, predicates: new Map(), ...typesFor(['T']),
    joinPolicy: liveToken as unknown as JoinPolicy, now: () => 0,
    onRegionEvent: (e) => events.push(`${e.type} ${e.branchPath}`),
    onRunFailure: (f) => failures.push(f.kind),
    ...extra,
  });
  const log = () => driver.foldInputs().map(label);
  return { scheduler: scheduler as CancelFake, driver, events, failures, log };
}

/** A turn of the event loop: every microtask queued so far has run. */
const turn = () => new Promise<void>((r) => setTimeout(r, 0));

const refusedBy = (fn: () => unknown): RunControlRefused => {
  try { fn(); } catch (e) { if (e instanceof RunControlRefused) return e; throw e; }
  throw new Error('expected RunControlRefused, nothing was thrown');
};

const SUITE = 'L2 — RN-R31: cancelling a run — hold, one element, then each task in flight cancelled, and `done` after the last';
const DECLARED_CASES = [
  'a cancel mid-fan-out over every road: RUNNING, WAITING, PRE-PICKUP, BACKOFF, PARKED and a task that finished first',
  'a SECOND cancel appends nothing and forwards its graceMs to each task still stopping, and to none that stopped',
  'each refusal by name — unsupported, not-started, halted, cancelled, ended — and graceMs refused as the scheduler would, nothing recorded or sent',
  'RN-R29 (i): a cancel raised on a task`s own `dispatched` element cancels that task AFTER its hand-off, beside its control',
  'a cancel raised on a resumed run`s `resumed` element hands each in-flight task on and cancels it, beside its control',
  'a run parked with nothing in flight reads `cancelled` at the element, nothing is sent, and resolve() is refused',
  'RN-R23: the checkpoint of a run its owner cancelled is refused `cancelled` at the element — with settlements after it, and with none',
  'D-1: a cancel raised MID-STEP — on a settlement`s element, and on a fan-out`s `regionEntered` — is accepted, and the hold stops what the step would dispatch',
  'D-2: TWO cancels on a task`s own `dispatched` element send it ONE cancel, after its hand-off, with the second call`s graceMs — and BOTH resolve only once it stops',
  'on the RUNNING road: a cancel on a task`s own `dispatched` element, and on a `resumed` element, resolves only once the task stops',
  'a cancel raised on a REGENERATED element of a resume`s lost tail sends nothing until the task is handed back — then one cancel, pending until it stops',
  'a run with one task DONE and one PARKED is not `ended`: the cancel is accepted, and reads `cancelled` at the element',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test(DECLARED_CASES[0]!, async () => {
    const h = harness(SIX);
    const s = h.scheduler;
    const ids = { a: 'r1:a:0:0', w: 'r1:w:1:0', p: 'r1:p:2:0', k: 'r1:k:3:0', u: 'r1:u:4:0', d: 'r1:d:5:0' };
    s.roads.set(ids.w, 'waiting');
    s.roads.set(ids.p, 'prepickup');
    s.roads.set(ids.k, 'backoff');
    h.driver.start({});
    // The ARRANGEMENT, each road set up as fact 8 measured it.
    s.emit('task.running', ids.a, 'running');
    s.emit('task.running', ids.d, 'running');
    s.emit('task.running', ids.k, 'running');
    s.emit('task.retrying', ids.k, 'running');
    s.settle(ids.u, 'user_action');
    const before = h.log();
    const eventsBefore = [...h.events];
    equal(fold(h.driver.foldInputs()).outcome, 'awaiting_action', 'the ARRANGEMENT: u parked, five in flight');

    let resolved = false;
    const pr = h.driver.cancel({ actor: 'ana', reason: 'stop', graceMs: 500 }).then(() => { resolved = true; });
    // One cancel per task IN FLIGHT, in dispatch order, the parked u not among them, each with both options as given.
    equal(s.cancels.map((c) => c.id), [ids.a, ids.w, ids.p, ids.k, ids.d], 'each task in flight cancelled, in dispatch order — u, parked, sent nothing');
    equal(s.cancels.map((c) => [c.options, c.held]), Array(5).fill([{ reason: 'stop', graceMs: 500 }, true]),
      'each with the caller`s reason and graceMs, and each an id the scheduler held');
    // The element, then the two settlements fired INSIDE the call — waiting and backoff — in the order they were sent.
    equal(h.log().slice(before.length), ['cancelRequested ana stop', `outcome ${ids.w} cancelled`, `outcome ${ids.k} cancelled`],
      'ONE element first, then the waiting and backoff tasks` `task.cancelled`, fired inside their calls');
    equal(s.fired.filter((f) => f.endsWith(ids.k)), [`task.running ${ids.k}`, `task.retrying ${ids.k}`, `task.cancelled ${ids.k}`],
      'the BACKOFF road: no `task.cancelling`');
    equal(s.fired.filter((f) => f.endsWith(ids.p)), [`task.cancelling ${ids.p}`], 'the PRE-PICKUP road so far: `task.cancelling` and no `task.running`');
    equal(fold(h.driver.foldInputs()).outcome, 'cancelling', '`cancelling`: a, p and d are still stopping');

    s.finish(ids.p);
    s.settle(ids.d, 'done');   // d finished before its cancel took: its `cancel()` resolves `false`
    await turn();
    equal([fold(h.driver.foldInputs()).outcome, resolved], ['cancelling', false], 'still `cancelling`, and cancel() unresolved, while a runs');
    s.finish(ids.a);
    await pr;
    equal(resolved, true, 'cancel() resolves once the last task has stopped');

    const tail = h.log().slice(before.length);
    equal(tail, ['cancelRequested ana stop', `outcome ${ids.w} cancelled`, `outcome ${ids.k} cancelled`,
      `outcome ${ids.p} cancelled`, `outcome ${ids.d} done`, `outcome ${ids.a} cancelled`],
    'everything after the request is a settlement — appended, nothing dispatched, routed or emitted between them');
    const s1 = fold(h.driver.foldInputs());
    equal([s1.outcome, s1.cancelRequest], ['cancelled', { actor: 'ana', reason: 'stop' }], '`cancelled` at the last settlement');
    equal(s1.nodes[ids.u]!.state, 'suspended', 'the parked task stays `suspended` (P34 (i))');
    equal(s.added, Object.values(ids), 'nothing handed to the scheduler after the fan-out — no `publish`, though d arrived `done`');
    equal(h.events, eventsBefore, 'no region event after the request — not even d`s `branch.arrived`');
    equal(h.driver.resolve(ids.u, 'done', { actor: 'ops', result: null }), false, 'the parked task`s resolve() is refused');
    equal(h.failures, [], 'a cancel is not a run failure');
    equal(fold(h.driver.foldInputs()), fold(h.driver.foldInputs()), 'L3: the driver`s sequence folded twice, deep-equal');
  });

  test(DECLARED_CASES[1]!, async () => {
    const h = harness(TWO);
    h.driver.start({});
    const first = h.driver.cancel({ actor: 'ana', graceMs: 2000 });
    equal(h.scheduler.cancels.map((c) => [c.id, c.options]), [['r1:a:0:0', { graceMs: 2000 }], ['r1:b:1:0', { graceMs: 2000 }]],
      'the first call: both tasks, with its graceMs and no reason key — none was given');
    h.scheduler.finish('r1:a:0:0');
    const length = h.log().length;
    let resolved = false;
    const second = h.driver.cancel({ actor: 'bob', reason: 'faster', graceMs: 0 }).then(() => { resolved = true; });
    equal(h.scheduler.cancels.slice(2).map((c) => [c.id, c.options]), [['r1:b:1:0', { graceMs: 0 }]],
      'the second: ONLY the task still stopping, with the SHORTER graceMs — a, stopped, is not sent again');
    equal(h.log().length, length, 'and nothing appended');
    await turn();
    equal(resolved, false, 'it resolves when what is still stopping has stopped, not before');
    h.scheduler.finish('r1:b:1:0');
    await Promise.all([first, second]);
    const s = fold(h.driver.foldInputs());
    equal([s.outcome, s.cancelRequest], ['cancelled', { actor: 'ana', reason: null }], 'the run`s request is the FIRST: ana, and no reason');
    equal(h.log().filter((l) => l.startsWith('cancelRequested')).length, 1, 'one element for two calls');

    // **A refusal AFTER the request does not refuse the second call** (RN-R31: never refused for a halt — its own, or a
    // later OR-R10's): it still forwards its graceMs to what is still stopping.
    const k = harness(TWO);
    k.driver.start({});
    void k.driver.cancel({ actor: 'ana' });
    k.scheduler.settle('r1:nope:-:0', 'done');
    equal(k.log().at(-1), 'halted', 'the ARRANGEMENT: a refusal halted the run after the request');
    void k.driver.cancel({ actor: 'ana', graceMs: 0 });
    equal(k.scheduler.cancels.slice(2).map((c) => [c.id, c.options]), [['r1:a:0:0', { graceMs: 0 }], ['r1:b:1:0', { graceMs: 0 }]],
      'the second call after the halt: both tasks, still stopping, sent the shorter graceMs');
  });

  test(DECLARED_CASES[2]!, () => {
    // `unsupported` — a scheduler with no `cancel`: the run still drives, and the call refuses before it records anything.
    const plain = { added: [] as string[], ls: new Map<string, ((e: { detail: unknown }) => void)[]>(),
      addTask(t: unknown) { this.added.push((t as { id: string }).id); },
      addEventListener(type: string, fn: (e: { detail: unknown }) => void) { this.ls.set(type, [...(this.ls.get(type) ?? []), fn]); } };
    const u = harness(LINE, plain);
    u.driver.start({});
    const ul = u.log();
    const unsupported = refusedBy(() => u.driver.cancel({ actor: 'ana' }));
    equal([unsupported.reason, unsupported.control, unsupported.name], ['unsupported', 'cancel', 'RunControlRefused'],
      '`unsupported`: the scheduler has no cancel — refused by name, `control` naming the call');
    equal(u.log(), ul, 'nothing appended');
    equal(fold(u.driver.foldInputs()).outcome, 'running', 'and the run is untouched — still `running`');

    // `not-started` — before start(), and on a driver a refused resume left spent.
    const n = harness(LINE);
    equal(refusedBy(() => n.driver.cancel({ actor: 'ana' })).reason, 'not-started', '`not-started`: no start()');
    const spent = harness(LINE);
    try { spent.driver.resume({ header: { format: 99 }, events: [] } as never); } catch { /* refused: format */ }
    equal(refusedBy(() => spent.driver.cancel({ actor: 'ana' })).reason, 'not-started', '`not-started`: a resume refused and spent');
    equal([n.scheduler.cancels, spent.scheduler.cancels, n.log(), spent.log()], [[], [], [], []], 'neither sent nor appended anything');

    // `halted` — a refusal halted the run (a settlement for an id it never dispatched, ID-R4 tier 2).
    const hl = harness(LINE);
    hl.driver.start({});
    hl.scheduler.settle('r1:nope:-:0', 'done');
    const hll = hl.log();
    equal(hll.at(-1), 'halted', 'the ARRANGEMENT: the run is halted');
    equal(refusedBy(() => hl.driver.cancel({ actor: 'ana' })).reason, 'halted', '`halted`');
    equal([hl.log(), hl.scheduler.cancels], [hll, []], 'nothing appended, nothing sent');

    // `cancelled` — a task the scheduler cancelled on its own ended the run (RN-R28), with b still running.
    const c = harness(TWO);
    c.driver.start({});
    c.scheduler.settle('r1:a:0:0', 'cancelled');
    const cl = c.log();
    equal(fold(c.driver.foldInputs()).outcome, 'cancelled', 'the ARRANGEMENT: RN-R28 ended it');
    equal(refusedBy(() => c.driver.cancel({ actor: 'ana' })).reason, 'cancelled', '`cancelled`');
    equal([c.log(), c.scheduler.cancels], [cl, []], 'nothing appended, nothing sent — b is cancelled by its id, not through the run');

    // `ended` — a run that completed.
    const e = harness(LINE);
    e.driver.start({});
    e.scheduler.settle('r1:x:-:0', 'done');
    e.scheduler.settle('r1:y:-:0', 'done');
    const el = e.log();
    equal(fold(e.driver.foldInputs()).outcome, 'completed', 'the ARRANGEMENT: it completed');
    equal(refusedBy(() => e.driver.cancel({ actor: 'ana' })).reason, 'ended', '`ended`: nothing in flight and nothing parked');
    equal([e.log(), e.scheduler.cancels], [el, []], 'nothing appended, nothing sent — its outcome stays `completed`');

    // graceMs — the scheduler's own refusals, raised before anything is recorded.
    const g = harness(LINE);
    g.driver.start({});
    const gl = g.log();
    const thrown = (graceMs: unknown) => { try { g.driver.cancel({ actor: 'ana', graceMs: graceMs as number }); } catch (x) { return (x as Error).constructor.name; } return 'nothing'; };
    equal([thrown('5'), thrown(-1), thrown(Number.NaN)], ['TypeError', 'RangeError', 'RangeError'], 'a non-number, a negative, NaN');
    equal([g.log(), g.scheduler.cancels], [gl, []], 'nothing appended, nothing sent');
    // The CONTROL: the same run accepts a cancel — so each refusal above is about its own reason.
    void g.driver.cancel({ actor: 'ana', graceMs: 0 });
    equal(g.log().length, gl.length + 1, 'the control: a valid call on the same run appends its element');
  });

  test(DECLARED_CASES[3]!, async () => {
    const drive = (raise: boolean) => {
      let promise: Promise<void> | null = null;
      const box: { driver?: Driver } = {};
      const s = new CancelFake();
      s.roads.set('r1:a:0:0', 'waiting');
      const h = harness(TWO, s, {
        onFoldInput: (e: FoldInput) => {
          if (raise && promise === null && e.kind === 'dispatched' && e.taskId === 'r1:a:0:0') promise = box.driver!.cancel({ actor: 'ana' });
        },
      });
      box.driver = h.driver;
      h.driver.start({});
      return { ...h, promise: () => promise };
    };
    const control = drive(false);
    equal([control.scheduler.added, control.scheduler.cancels], [['r1:a:0:0', 'r1:b:1:0'], []], 'the CONTROL: both branches handed on, nothing cancelled');
    const h = drive(true);
    equal(h.scheduler.added, ['r1:a:0:0'], 'the task whose element carried the cancel is handed on (RN-R29 (i)), and b is not');
    equal(h.scheduler.cancels.map((c) => [c.id, c.held]), [['r1:a:0:0', true]], 'and it is cancelled AFTER its hand-off — once, with the scheduler holding it');
    equal(h.log(), ['regionEntered', 'branch.opened 0', 'branch.opened 1', 'dispatched r1:a:0:0', 'cancelRequested ana null', 'outcome r1:a:0:0 cancelled'],
      'the log: the element right after a`s dispatch, then a`s settlement — b never entered');
    await h.promise();
    equal(fold(h.driver.foldInputs()).outcome, 'cancelled', 'and the run ends `cancelled`, its promise resolved');
  });

  test(DECLARED_CASES[4]!, async () => {
    const first = harness(LINE);
    first.driver.start({});
    first.scheduler.settle('r1:x:-:0', 'done');
    const cp = first.driver.checkpoint();
    const drive = (raise: boolean) => {
      let promise: Promise<void> | null = null;
      const box: { driver?: Driver } = {};
      const s = new CancelFake();
      s.roads.set('r1:y:-:0', 'waiting');
      const h = harness(LINE, s, {
        onFoldInput: (e: FoldInput) => { if (raise && e.kind === 'resumed') promise = box.driver!.cancel({ actor: 'ana' }); },
      });
      box.driver = h.driver;
      h.driver.resume(cp);
      return { ...h, promise: () => promise };
    };
    const control = drive(false);
    equal([control.scheduler.added, control.scheduler.cancels], [['r1:y:-:0'], []], 'the CONTROL: the in-flight y handed back, nothing cancelled');
    const h = drive(true);
    equal(h.scheduler.added, ['r1:y:-:0'], 'under the cancel y is STILL handed on — held, it would never settle and the run would read `cancelling` for ever');
    equal(h.scheduler.cancels.map((c) => [c.id, c.held]), [['r1:y:-:0', true]], 'and cancelled right after, the scheduler holding it');
    equal(h.log().slice(cp.events.length), ['resumed', 'cancelRequested ana null', 'outcome r1:y:-:0 cancelled'], 'resumed, the request, y`s settlement');
    await h.promise();
    equal(fold(h.driver.foldInputs()).outcome, 'cancelled', 'and the run ends `cancelled`');
  });

  test(DECLARED_CASES[5]!, async () => {
    const h = harness(LINE);
    h.driver.start({});
    h.scheduler.settle('r1:x:-:0', 'user_action');
    equal(fold(h.driver.foldInputs()).outcome, 'awaiting_action', 'the ARRANGEMENT: parked, nothing in flight');
    const p = h.driver.cancel({ actor: 'ana', reason: 'abandon' });
    equal(h.scheduler.cancels, [], 'nothing sent: a parked task is not in flight, and the scheduler cannot end it');
    equal(h.log().at(-1), 'cancelRequested ana abandon', 'the element is the last thing appended');
    equal(fold(h.driver.foldInputs()).outcome, 'cancelled', '`cancelled` at the element — nothing to wait for');
    await p;
    equal(h.driver.resolve('r1:x:-:0', 'done', { actor: 'ops', result: null }), false, 'resolve() is refused');
    equal(h.scheduler.added, ['r1:x:-:0'], 'and nothing more is handed on');

    // **The HOLD comes BEFORE the element** (`RN-R31` steps 2 and 3): a consumer's callback on the `cancelRequested`
    // element itself already sees the run held — its `resolve()` of the parked task is refused and routes nothing.
    const box: { driver?: Driver; answer?: boolean } = {};
    const ks = new CancelFake();
    ks.roads.set('r1:y:-:0', 'waiting');   // were the resolve to route, y settles at once rather than hanging this case
    const k = harness(LINE, ks, {
      onFoldInput: (e: FoldInput) => {
        if (e.kind === 'cancelRequested') box.answer = box.driver!.resolve('r1:x:-:0', 'done', { actor: 'ops', result: null });
      },
    });
    box.driver = k.driver;
    k.driver.start({});
    k.scheduler.settle('r1:x:-:0', 'user_action');
    await k.driver.cancel({ actor: 'ana' });
    equal(box.answer, false, 'a resolve() raised ON the element`s own stack is refused: the run was held before it was recorded');
    equal([k.log().at(-1), k.scheduler.added], ['cancelRequested ana null', ['r1:x:-:0']], 'no resolution appended after it, nothing handed on');

    // **The in-flight set is read AFTER the element** (`RN-R31` step 4): a callback on it that ends a task — here the
    // consumer cancelling a WAITING task by id itself, which settles inside that call — leaves that task out of the run's
    // cancels. Control: the other task is still sent its cancel.
    const ws = new CancelFake();
    ws.roads.set('r1:a:0:0', 'waiting');
    const w = harness(TWO, ws, {
      onFoldInput: (e: FoldInput) => { if (e.kind === 'cancelRequested') void ws.cancel('r1:a:0:0'); },
    });
    w.driver.start({});
    void w.driver.cancel({ actor: 'ana' });
    equal(ws.cancels.map((c) => c.id), ['r1:a:0:0', 'r1:b:1:0'],
      'a — settled by the consumer`s own cancel on the element`s stack — is not sent again; b is');
  });

  test(DECLARED_CASES[6]!, async () => {
    const withSettlements = harness(TWO);
    withSettlements.driver.start({});
    const p = withSettlements.driver.cancel({ actor: 'ana' });
    withSettlements.scheduler.finish('r1:a:0:0');
    withSettlements.scheduler.finish('r1:b:1:0');
    await p;
    const parked = harness(LINE);
    parked.driver.start({});
    parked.scheduler.settle('r1:x:-:0', 'user_action');
    await parked.driver.cancel({ actor: 'ana' });
    // Positions hand-derived: TWO's run is regionEntered(0), branch.opened ×2 (1, 2), two dispatches (3, 4), then the
    // element at 5; LINE's is dispatched(0), outcome user_action(1), the element at 2.
    for (const [name, h, def, at] of [['with settlements', withSettlements, TWO, 5], ['parked, no settlement after it', parked, LINE, 2]] as const) {
      const cp = h.driver.checkpoint();
      equal(cp.events[at]!.kind, 'cancelRequested', `${name}: the ARRANGEMENT — the element is at ${at}`);
      const r = resumeRefusal(def, cp, 'r1');
      equal([r?.reason, r?.index], ['cancelled', at], `${name}: the pure pre-check refuses it \`cancelled\` at the element`);
      const fresh = harness(def);
      let thrown: unknown = null;
      try { fresh.driver.resume(cp); } catch (e) { thrown = e; }
      ok(thrown instanceof ResumeRefused, `${name}: the driver refuses it too`);
      equal([(thrown as ResumeRefused).reason, (thrown as ResumeRefused).index, fresh.scheduler.added], ['cancelled', at, []],
        `${name}: \`cancelled\` at ${at}, nothing handed to the scheduler`);
    }
  });

  test(DECLARED_CASES[7]!, () => {
    // The consumer cancels from onFoldInput on the element `at` names, and records whether the call was accepted.
    const mid = (def: FlowDefinition, at: (e: FoldInput) => boolean, act: (s: CancelFake) => void) => {
      const box: { driver?: Driver; answer?: string } = {};
      const s = new CancelFake();
      const h = harness(def, s, {
        onFoldInput: (e: FoldInput) => {
          if (box.answer === undefined && at(e)) {
            try { void box.driver!.cancel({ actor: 'ops' }); box.answer = 'accepted'; } catch (x) { box.answer = `refused ${(x as RunControlRefused).reason}`; }
          }
        },
      });
      box.driver = h.driver;
      h.driver.start({});
      act(s);
      return { ...h, answer: () => box.answer };
    };
    // `x -> y`: on x's `outcome` element — the instant between x settling and y being dispatched.
    const line = mid(LINE, (e) => e.kind === 'outcome', (s) => s.settle('r1:x:-:0', 'done'));
    equal(line.answer(), 'accepted', 'accepted mid-step: nothing in flight THERE, and the step was about to dispatch y');
    equal([line.scheduler.added, line.log()], [['r1:x:-:0'], ['dispatched r1:x:-:0', 'outcome r1:x:-:0 done', 'cancelRequested ops null']],
      'the hold stops y: nothing dispatched or routed after the request');
    equal(fold(line.driver.foldInputs()).outcome, 'cancelled', 'and the run reads `cancelled` — not `running`');
    // A fan-out ENTRY: on `regionEntered`, the run's first element.
    const fan = mid(TWO, (e) => e.kind === 'regionEntered', () => {});
    equal(fan.answer(), 'accepted', 'accepted on `regionEntered`');
    equal([fan.scheduler.added, fan.log()], [[], ['regionEntered', 'cancelRequested ops null', 'branch.opened 0', 'branch.opened 1']],
      'no branch dispatched; the region`s openings land as RN-R29 (ii) says, and nothing after them');
    equal(fold(fan.driver.foldInputs()).outcome, 'cancelled', 'and the run reads `cancelled`');
    // The CONTROL: the same LINE run at REST, after it completed, is refused `ended`.
    const rest = harness(LINE);
    rest.driver.start({});
    rest.scheduler.settle('r1:x:-:0', 'done');
    rest.scheduler.settle('r1:y:-:0', 'done');
    equal(refusedBy(() => rest.driver.cancel({ actor: 'ops' })).reason, 'ended', 'the control: at rest, and finished, it is `ended`');
  });

  test(DECLARED_CASES[8]!, async () => {
    const s = new CancelFake();
    const ps: Promise<void>[] = [];
    const box: { driver?: Driver } = {};
    const h = harness(TWO, s, {
      onFoldInput: (e: FoldInput) => {
        if (ps.length === 0 && e.kind === 'dispatched' && e.taskId === 'r1:a:0:0') {
          ps.push(box.driver!.cancel({ actor: 'ana' }), box.driver!.cancel({ actor: 'ana', graceMs: 0 }));
        }
      },
    });
    box.driver = h.driver;
    h.driver.start({});
    equal(s.cancels.map((c) => [c.id, c.held, c.options]), [['r1:a:0:0', true, { graceMs: 0 }]],
      'ONE cancel, of an id the scheduler held — the second call sent nothing for an unhanded task — with the SECOND call`s graceMs');
    const done = [false, false];
    ps.forEach((p, i) => { void p.then(() => { done[i] = true; }); });
    await turn();
    equal(done, [false, false], 'BOTH pending while a stops — the second does not resolve on an empty set');
    s.finish('r1:a:0:0');
    await turn();
    equal(done, [true, true], 'and both resolve once it has');
  });

  test(DECLARED_CASES[9]!, async () => {
    // On a task's own `dispatched` element, RUNNING road (the waiting road settles inside the call and hides the wait).
    const s = new CancelFake();
    let p: Promise<void> | null = null;
    const box: { driver?: Driver } = {};
    const h = harness(TWO, s, {
      onFoldInput: (e: FoldInput) => { if (p === null && e.kind === 'dispatched' && e.taskId === 'r1:a:0:0') p = box.driver!.cancel({ actor: 'ana' }); },
    });
    box.driver = h.driver;
    h.driver.start({});
    let resolved = false;
    void p!.then(() => { resolved = true; });
    await turn();
    equal([resolved, fold(h.driver.foldInputs()).outcome], [false, 'cancelling'], 'pending, `cancelling`, while a stops');
    s.finish('r1:a:0:0');
    await turn();
    equal([resolved, fold(h.driver.foldInputs()).outcome], [true, 'cancelled'], 'resolved, `cancelled`, once a stopped');
    // On a resumed run's `resumed` element, RUNNING road.
    const first = harness(LINE);
    first.driver.start({});
    first.scheduler.settle('r1:x:-:0', 'done');
    const rs = new CancelFake();
    let q: Promise<void> | null = null;
    const rbox: { driver?: Driver } = {};
    const r = harness(LINE, rs, { onFoldInput: (e: FoldInput) => { if (q === null && e.kind === 'resumed') q = rbox.driver!.cancel({ actor: 'ana' }); } });
    rbox.driver = r.driver;
    r.driver.resume(first.driver.checkpoint());
    let rResolved = false;
    void q!.then(() => { rResolved = true; });
    await turn();
    equal([rResolved, rs.cancels.map((c) => [c.id, c.held])], [false, [['r1:y:-:0', true]]], 'pending while y stops; y cancelled once, after its hand-off');
    rs.finish('r1:y:-:0');
    await turn();
    equal(rResolved, true, 'resolved once y stopped');
  });

  test(DECLARED_CASES[10]!, async () => {
    const first = harness(LINE);
    first.driver.start({});
    first.scheduler.settle('r1:x:-:0', 'done');
    const cp = first.driver.checkpoint();
    equal(cp.events.map((e) => e.kind), ['dispatched', 'outcome', 'dispatched'], 'the ARRANGEMENT: y`s dispatch is the third element');
    // The store LOST the tail: it holds `dispatched x` and `outcome x`; the replay REGENERATES `dispatched y` past them.
    const cut = { ...cp, events: cp.events.slice(0, 2) };
    const s = new CancelFake();
    let p: Promise<void> | null = null;
    const box: { driver?: Driver } = {};
    const h = harness(LINE, s, {
      onFoldInput: (e: FoldInput) => { if (p === null && e.kind === 'dispatched' && e.taskId === 'r1:y:-:0') p = box.driver!.cancel({ actor: 'ana' }); },
    });
    box.driver = h.driver;
    h.driver.resume(cut as never);
    ok(p !== null, 'the ARRANGEMENT: the cancel was raised on the regenerated tail, during the replay');
    equal(s.cancels.map((c) => [c.id, c.held]), [['r1:y:-:0', true]], 'nothing sent during the replay; ONE cancel, after resume() handed y back');
    let resolved = false;
    void p!.then(() => { resolved = true; });
    await turn();
    equal(resolved, false, 'pending while y stops');
    s.finish('r1:y:-:0');
    await turn();
    equal([resolved, fold(h.driver.foldInputs()).outcome], [true, 'cancelled'], 'resolved, and `cancelled`, once y stopped');
  });

  test(DECLARED_CASES[11]!, () => {
    const h = harness(LINE);
    h.driver.start({});
    h.scheduler.settle('r1:x:-:0', 'done');
    h.scheduler.settle('r1:y:-:0', 'user_action');
    void h.driver.cancel({ actor: 'ana' });
    equal([h.log().at(-1), fold(h.driver.foldInputs()).outcome], ['cancelRequested ana null', 'cancelled'],
      'accepted — one task done and one PARKED is not finished — and `cancelled` at the element');
    equal(h.scheduler.cancels, [], 'nothing sent: neither task is in flight');
  });

  test(DECLARED_CASES[12]!, () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name));
    equal(ran, DECLARED_CASES, 'each declared case registered, in order, and no other — an emptied or renamed case fails here');
  });
});
