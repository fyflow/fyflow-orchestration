/**
 * Ladder L2 — **stopping a run through the driver, to resume it elsewhere**: `spec/run-state.md` v0.19 `RN-R33` (and
 * `RN-R32`'s outcome read off the driver's own sequence, `RN-R19`'s fourth fed kind),
 * [ADR 0105](../../doc/decisions/0105-a-run-its-owner-stops-goes-deaf-before-it-cancels-and-resumes-elsewhere.md),
 * [W174](../../doc/work-items/w174-stopping-a-run-to-resume-it-elsewhere.md), P34 decisions 3 and 9 and stop-and-ask (d).
 *
 * **The fake's `cancel` plays the scheduler's roads, as `test/driver/cancel.test.ts`'s does** (P34 fact 8): a RUNNING
 * task — `task.cancelling` at the call, `task.cancelled` when the test says it stopped; a WAITING one and one in a retry
 * BACKOFF — `task.cancelled` fired INSIDE the call; one PRE-PICKUP — `task.cancelling`, later `task.cancelled`, no
 * `task.running`; and an id it does not hold — `false`. **The WAITING and BACKOFF roads are the instrument of the ORDER**:
 * their `task.cancelled` fires inside the very `cancel()` call, so a driver that went deaf AFTER its first cancel — or not
 * at all — would append it. And a hook the fake runs at the START of its first `cancel()` reads the log and calls
 * `resolve()` from inside the call, so *recorded, deaf and refusing before the first cancel* is observed where it happens.
 *
 * **Every expected value is derived from `RN-R33`'s order and the flow's shape** — refuse; (taken at rest) hold, ONE
 * `interrupted` element, deaf, then one cancel per task in flight in dispatch order (`RN-R21`'s set) — and never from a
 * run's output. Each claim sits beside its CONTROL where one exists.
 */
import { equal, ok, collected, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { Driver, RunControlRefused, resumeRefusal, type Checkpoint } from '../../src/driver/driver.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { fold, type FoldInput } from '../../src/fold/run-state.ts';
import { liveToken } from '../../src/fold/policies.ts';

type Road = 'running' | 'waiting' | 'prepickup' | 'backoff';

/** L2's fake, with a `cancel` that plays the scheduler's roads. It queues nothing and runs nothing. */
class StopFake {
  readonly added: string[] = [];
  /** Every `cancel` call, in order: the id, the options as handed, and whether the scheduler HELD the id at the call. */
  readonly cancels: { id: string; options: unknown; held: boolean }[] = [];
  /** Every event fired, `type id`, in order — the scheduler's own view, whatever the driver hears. */
  readonly fired: string[] = [];
  readonly roads = new Map<string, Road>();
  /** Run at the START of each `cancel()` call, before the scheduler does anything — the ORDER's observation point. */
  onCancel: ((id: string) => void) | null = null;
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
    this.onCancel?.(id);
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

/** split(a, w, p, k, u) -> collect -> publish -> done: one branch per road and one that parks. */
const FIVE = {
  flowId: 'stop-five', version: 1, entry: 'split',
  nodes: [
    { id: 'split', kind: 'fanout', branches: ['a', 'w', 'p', 'k', 'u'] },
    ...['a', 'w', 'p', 'k', 'u'].map((id) => ({ id, kind: 'task', type: 'T', edges: [{ to: 'collect' }] })),
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

/** split(a, b) -> collect -> publish -> done. */
const TWO = {
  flowId: 'stop-two', version: 1, entry: 'split',
  nodes: [
    { id: 'split', kind: 'fanout', branches: ['a', 'b'] },
    { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    { id: 'b', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

/** split(u, x); u -> collect; x -> y -> collect; collect -> done — a parked branch beside a two-task one. */
const PAIR = {
  flowId: 'stop-pair', version: 1, entry: 'split',
  nodes: [
    { id: 'split', kind: 'fanout', branches: ['u', 'x'] },
    { id: 'u', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    { id: 'x', kind: 'task', type: 'T', edges: [{ to: 'y' }] },
    { id: 'y', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

/** x -> y -> done. */
const LINE = {
  flowId: 'stop-line', version: 1, entry: 'x',
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
    case 'interrupted': return `interrupted ${e.actor} ${String(e.reason)}`;
    case 'resumed': return `resumed ${e.taskIds.join(',')}`;
    case 'pathEnded': return `pathEnded ${e.reason}`;
    default: return e.kind;
  }
};

function harness(def: FlowDefinition, scheduler: object = new StopFake(), extra: Record<string, unknown> = {}) {
  const events: string[] = [];
  const failures: string[] = [];
  const driver = new Driver(def, {
    runId: 'r1', scheduler: scheduler as StopFake, createTask: (c) => c, predicates: new Map(), ...typesFor(['T']),
    joinPolicy: liveToken as unknown as JoinPolicy, now: () => 0,
    onRegionEvent: (e) => events.push(`${e.type} ${e.branchPath}`),
    onRunFailure: (f) => failures.push(f.kind),
    ...extra,
  });
  const log = () => driver.foldInputs().map(label);
  return { scheduler: scheduler as StopFake, driver, events, failures, log };
}

/** A turn of the event loop: every microtask queued so far has run. */
const turn = () => new Promise<void>((r) => setTimeout(r, 0));

const refusedBy = (fn: () => unknown): RunControlRefused => {
  try { fn(); } catch (e) { if (e instanceof RunControlRefused) return e; throw e; }
  throw new Error('expected RunControlRefused, nothing was thrown');
};

/** A checkpoint as a store holds it: a structured clone, so nothing the first driver holds is shared. */
const stored = (d: Driver): Checkpoint => structuredClone(d.checkpoint()) as Checkpoint;

const SUITE = 'L2 — RN-R33: stopping a run — hold, one element, DEAF, then each task in flight cancelled, and a resume elsewhere';
const DECLARED_CASES = [
  'the ORDER over every road — RUNNING, WAITING, PRE-PICKUP, BACKOFF and PARKED: recorded, deaf and refusing resolve() BEFORE the first cancel; no `task.cancelled` appended; the in-flight set left unsettled',
  'each refusal by name — unsupported, not-started, halted, cancelled (RN-R28 and requested), ended — graceMs refused, and a cancel after a stop refused `interrupted`, nothing recorded or sent',
  'a SECOND stop appends nothing and forwards its graceMs to each task still stopping, and to none that stopped — both resolving once it stops',
  'a run PARKED with nothing in flight: nothing sent, the promise resolved, resolve() refused — and resumed elsewhere, resolved THERE to `completed`',
  'RN-R29 (i): a stop raised on a task`s own `dispatched` element is taken when the step ends — the next branch entered and handed on, then both cancelled after their hand-off',
  'a stop raised MID-STEP on a settlement`s element: resolve() and cancel() refused from the call, the successor dispatched in the step and cancelled after — and the checkpoint resumes it',
  'the stopped checkpoint resumed on a FRESH driver re-dispatches EXACTLY its in-flight set at the same ids — and stopped and resumed again, both stops in order, to `completed`',
  'a stop raised on a resumed run`s `resumed` element: each task handed on by the resume, then cancelled when it returns',
  'a stop raised on an element of a resume`s LOST TAIL is taken when resume() returns: `resumed`, each task handed on, then the element and the cancels',
  'DEAF with the hold: a settlement a callback on the `interrupted` element provokes is not heard — the task stays in flight and runs again on the resume',
  'a callback that THROWS on the `interrupted` element — at rest and mid-step: the throw reaches the caller, and the cancels are still sent and every promise settles',
  'R9: a stop raised on the settlement that ENDS the run is taken after the step — the element last, the promise resolved, `interrupted`',
  'R9: a stop whose step then HALTS the run is taken after it — the element after `halted`, the promise resolved, the fold `halted`',
  'R9: a stop whose step then has a task settle `cancelled` (RN-R28) is taken after it — the promise resolved, the fold `cancelled`',
  'a SECOND stop while the first is still PENDING mid-step: nothing sent yet, its graceMs kept for the cancels to come, one element, both resolving on the stop',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test(DECLARED_CASES[0]!, async () => {
    const h = harness(FIVE);
    const s = h.scheduler;
    const ids = { a: 'r1:a:0:0', w: 'r1:w:1:0', p: 'r1:p:2:0', k: 'r1:k:3:0', u: 'r1:u:4:0' };
    s.roads.set(ids.w, 'waiting');
    s.roads.set(ids.p, 'prepickup');
    s.roads.set(ids.k, 'backoff');
    h.driver.start({});
    // The ARRANGEMENT, each road set up as P34 fact 8 measured it; u parks.
    s.emit('task.running', ids.a, 'running');
    s.emit('task.running', ids.k, 'running');
    s.emit('task.retrying', ids.k, 'running');
    s.settle(ids.u, 'user_action');
    const before = h.log();
    const eventsBefore = [...h.events];
    const addedBefore = [...s.added];
    equal(fold(h.driver.foldInputs()).outcome, 'awaiting_action', 'the ARRANGEMENT: u parked, four in flight');

    // **Inside the FIRST cancel**, before the scheduler does anything: what the log holds, and whether resolve() is refused.
    // **And DEAF at that first call** (W174's conformity reader, finding 6): a's own road is RUNNING, so nothing it fires
    // inside its call could show deafness — the hook PROVOKES a settlement from inside it, p's `done`, and reads whether it
    // was appended.
    let inside: { length: number; last: string | undefined; resolved: boolean; heard: number } | null = null;
    s.onCancel = () => {
      if (inside !== null) return;
      const length = h.log().length;
      const last = h.log().at(-1);
      const resolvedInside = h.driver.resolve(ids.u, 'done', { actor: 'ops', result: null });
      s.emit('task.completed', ids.p, 'done');
      inside = { length, last, resolved: resolvedInside, heard: h.log().length - length };
    };
    let resolved = false;
    const pr = h.driver.stop({ actor: 'ops', reason: 'upgrade', graceMs: 500 }).then(() => { resolved = true; });
    equal(inside, { length: before.length + 1, last: 'interrupted ops upgrade', resolved: false, heard: 0 },
      'at the first cancel the ONE element is already the log`s last, resolve() of the parked task is refused (P34 decision 9), and a settlement fired from inside that call is NOT heard — deaf before the first cancel');
    equal(s.cancels.map((c) => c.id), [ids.a, ids.w, ids.p, ids.k], 'each task in flight cancelled, in dispatch order — u, parked, sent nothing');
    equal(s.cancels.map((c) => [c.options, c.held]), Array(4).fill([{ reason: 'upgrade', graceMs: 500 }, true]),
      'each with the caller`s reason and graceMs, and each an id the scheduler held');
    // **DEAF before the first cancel**: the waiting and backoff tasks' `task.cancelled` fired INSIDE their calls ...
    ok(s.fired.includes(`task.cancelled ${ids.w}`) && s.fired.includes(`task.cancelled ${ids.k}`),
      'the ARRANGEMENT: w and k each fired `task.cancelled` inside its cancel() call');
    // ... and NONE reached the log: the element is the last thing appended.
    equal(h.log(), [...before, 'interrupted ops upgrade'], 'ONE element, and no `task.cancelled` of the stop appended — the driver was deaf');
    const st = fold(h.driver.foldInputs());
    equal([st.outcome, st.interruption], ['interrupted', { actor: 'ops', reason: 'upgrade' }], '`interrupted` from the element (RN-R32)');
    equal([ids.a, ids.w, ids.p, ids.k, ids.u].map((id) => st.nodes[id]!.state), ['running', 'running', 'running', 'running', 'suspended'],
      'the in-flight set is left `running` — dispatched and unsettled — and the parked u `suspended` (P34 (i))');

    await turn();
    equal(resolved, false, 'the promise waits while a and p are still stopping');
    s.finish(ids.p);
    await turn();
    equal(resolved, false, 'still waiting on a');
    s.finish(ids.a);
    await pr;
    equal(resolved, true, 'stop() resolves once the LAST task it cancelled has stopped');
    equal(h.log(), [...before, 'interrupted ops upgrade'], 'and a and p`s `task.cancelled` were not appended either');
    s.settle(ids.u, 'done');
    equal(h.log(), [...before, 'interrupted ops upgrade'], 'nor anything the scheduler fires for the run afterwards');
    equal([s.added, h.events, h.failures], [addedBefore, eventsBefore, []], 'nothing handed on, no region event, no failure reported');
    equal(fold(h.driver.foldInputs()), fold(h.driver.foldInputs()), 'L3: the driver`s sequence folded twice, deep-equal');

    // The CONTROL for DEAF: the same arrangement CANCELLED (RN-R31), which is not deaf — w's and k's settlements ARE appended.
    const c = harness(FIVE);
    c.scheduler.roads.set(ids.w, 'waiting');
    c.scheduler.roads.set(ids.k, 'backoff');
    c.driver.start({});
    void c.driver.cancel({ actor: 'ops' });
    equal(c.log().filter((l) => l.endsWith(' cancelled')), [`outcome ${ids.w} cancelled`, `outcome ${ids.k} cancelled`],
      'the control: under a cancel the same two in-call settlements are appended — so their absence above is the stop`s deafness');
  });

  test(DECLARED_CASES[1]!, () => {
    // `unsupported` — a scheduler with no `cancel`: the run still drives, and the stop refuses before it records anything.
    const plain = { added: [] as string[], ls: new Map<string, ((e: { detail: unknown }) => void)[]>(),
      addTask(t: unknown) { this.added.push((t as { id: string }).id); },
      addEventListener(type: string, fn: (e: { detail: unknown }) => void) { this.ls.set(type, [...(this.ls.get(type) ?? []), fn]); } };
    const u = harness(LINE, plain);
    u.driver.start({});
    const ul = u.log();
    const unsupported = refusedBy(() => u.driver.stop({ actor: 'ops' }));
    equal([unsupported.reason, unsupported.control, unsupported.name], ['unsupported', 'stop', 'RunControlRefused'],
      '`unsupported`: the scheduler has no cancel — refused by name, `control` naming the call');
    equal([u.log(), fold(u.driver.foldInputs()).outcome], [ul, 'running'], 'nothing appended, the run untouched');

    // `not-started` — before start(), and on a driver a refused resume left spent.
    const n = harness(LINE);
    equal(refusedBy(() => n.driver.stop({ actor: 'ops' })).reason, 'not-started', '`not-started`: no start()');
    const spent = harness(LINE);
    try { spent.driver.resume({ header: { format: 99 }, events: [] } as never); } catch { /* refused: format */ }
    equal(refusedBy(() => spent.driver.stop({ actor: 'ops' })).reason, 'not-started', '`not-started`: a resume refused and spent');
    equal([n.scheduler.cancels, spent.scheduler.cancels, n.log(), spent.log()], [[], [], [], []], 'neither sent nor appended anything');

    // `halted` — a refusal halted the run (a settlement for an id it never dispatched, ID-R4 tier 2).
    const hl = harness(LINE);
    hl.driver.start({});
    hl.scheduler.settle('r1:nope:-:0', 'done');
    const hll = hl.log();
    equal(hll.at(-1), 'halted', 'the ARRANGEMENT: the run is halted, x still in flight');
    equal(refusedBy(() => hl.driver.stop({ actor: 'ops' })).reason, 'halted', '`halted`: a halted run is not resumable');
    equal([hl.log(), hl.scheduler.cancels], [hll, []], 'nothing appended, nothing sent');

    // `cancelled` — RN-R28's cancel, and a cancel its owner requested (P34 (c): after a cancel, a stop is refused).
    const c = harness(TWO);
    c.driver.start({});
    c.scheduler.settle('r1:a:0:0', 'cancelled');
    const cl = c.log();
    equal(refusedBy(() => c.driver.stop({ actor: 'ops' })).reason, 'cancelled', '`cancelled`: RN-R28 ended it, b still running');
    equal([c.log(), c.scheduler.cancels], [cl, []], 'nothing appended, nothing sent');
    // `cancelled` BEFORE `ended` (the adequacy reader's C12): RN-R28 ended this run with NOTHING in flight, so it is both.
    const ce = harness(LINE);
    ce.driver.start({});
    ce.scheduler.settle('r1:x:-:0', 'cancelled');
    equal(fold(ce.driver.foldInputs()).outcome, 'cancelled', 'the ARRANGEMENT: x cancelled by the scheduler, nothing in flight, nothing parked');
    equal(refusedBy(() => ce.driver.stop({ actor: 'ops' })).reason, 'cancelled', 'refused `cancelled`, not `ended` — RN-R33 checks it first');
    const r = harness(TWO);
    r.driver.start({});
    void r.driver.cancel({ actor: 'ana' });
    const rl = r.log();
    const rc = r.scheduler.cancels.length;
    equal(refusedBy(() => r.driver.stop({ actor: 'ops' })).reason, 'cancelled', '`cancelled`: its owner cancelled it, tasks still stopping');
    equal([r.log(), r.scheduler.cancels.length], [rl, rc], 'nothing appended, nothing more sent');

    // `ended` — a run that completed.
    const e = harness(LINE);
    e.driver.start({});
    e.scheduler.settle('r1:x:-:0', 'done');
    e.scheduler.settle('r1:y:-:0', 'done');
    const el = e.log();
    equal(fold(e.driver.foldInputs()).outcome, 'completed', 'the ARRANGEMENT: it completed');
    equal(refusedBy(() => e.driver.stop({ actor: 'ops' })).reason, 'ended', '`ended`: nothing in flight and nothing parked, at rest');
    equal([e.log(), e.scheduler.cancels], [el, []], 'nothing appended, nothing sent — its outcome stays `completed`');
    // **`ended` only AT REST** — the CONTROL beside it: the same prefix MID-STEP (on x's settlement element, nothing in
    // flight and nothing parked) is accepted, and taken once the step has dispatched y.
    let midPromise: Promise<void> | null = null;
    const mbox: { driver?: Driver } = {};
    const mid = harness(LINE, new StopFake(), {
      onFoldInput: (x: FoldInput) => { if (midPromise === null && x.kind === 'outcome') midPromise = mbox.driver!.stop({ actor: 'ops' }); },
    });
    mbox.driver = mid.driver;
    mid.driver.start({});
    mid.scheduler.settle('r1:x:-:0', 'done');
    equal(mid.log(), ['dispatched r1:x:-:0', 'outcome r1:x:-:0 done', 'dispatched r1:y:-:0', 'interrupted ops null'],
      'mid-step the same prefix is NOT `ended`: accepted, and taken after the step dispatched y');
    equal(mid.scheduler.cancels.map((c) => c.id), ['r1:y:-:0'], 'and y cancelled after its hand-off');

    // graceMs — the scheduler's own refusals, raised before anything is recorded.
    const g = harness(LINE);
    g.driver.start({});
    const gl = g.log();
    const thrown = (graceMs: unknown) => { try { g.driver.stop({ actor: 'ops', graceMs: graceMs as number }); } catch (x) { return (x as Error).constructor.name; } return 'nothing'; };
    equal([thrown('5'), thrown(-1), thrown(Number.NaN)], ['TypeError', 'RangeError', 'RangeError'], 'a non-number, a negative, NaN');
    equal([g.log(), g.scheduler.cancels], [gl, []], 'nothing appended, nothing sent');

    // The CONTROL: the same run accepts a stop — and THEN a cancel is refused `interrupted`, by name.
    void g.driver.stop({ actor: 'ops', graceMs: 0 });
    equal(g.log(), [...gl, 'interrupted ops null'], 'the control: a valid call on the same run appends its element');
    const sent = g.scheduler.cancels.length;
    const after = refusedBy(() => g.driver.cancel({ actor: 'ana' }));
    equal([after.reason, after.control], ['interrupted', 'cancel'], 'a cancel AFTER a stop is refused `interrupted` (P34 (c))');
    equal([g.log().length, g.scheduler.cancels.length], [gl.length + 1, sent], 'and it records and sends nothing');
  });

  test(DECLARED_CASES[2]!, async () => {
    const h = harness(TWO);
    h.driver.start({});
    const first = h.driver.stop({ actor: 'ops', graceMs: 2000 });
    equal(h.scheduler.cancels.map((c) => [c.id, c.options]), [['r1:a:0:0', { graceMs: 2000 }], ['r1:b:1:0', { graceMs: 2000 }]],
      'the first call: both tasks, with its graceMs and no reason key — none was given');
    h.scheduler.finish('r1:a:0:0');
    await turn();
    const length = h.log().length;
    let resolved = false;
    const second = h.driver.stop({ actor: 'bob', reason: 'faster', graceMs: 0 }).then(() => { resolved = true; });
    equal(h.scheduler.cancels.slice(2).map((c) => [c.id, c.options]), [['r1:b:1:0', { graceMs: 0 }]],
      'the second: ONLY the task still stopping, with the SHORTER graceMs — a, stopped, is not sent again though it is still unsettled in the log');
    equal(h.log().length, length, 'and nothing appended');
    await turn();
    equal(resolved, false, 'it resolves when what is still stopping has stopped, not before');
    h.scheduler.finish('r1:b:1:0');
    await Promise.all([first, second]);
    const s = fold(h.driver.foldInputs());
    equal([s.outcome, s.interruption], ['interrupted', { actor: 'ops', reason: null }], 'the run`s stop is the FIRST: ops, and no reason');
    equal(h.log().filter((l) => l.startsWith('interrupted')).length, 1, 'one element for two calls');
  });

  test(DECLARED_CASES[3]!, async () => {
    const h = harness(LINE);
    h.driver.start({});
    h.scheduler.settle('r1:x:-:0', 'user_action');
    equal(fold(h.driver.foldInputs()).outcome, 'awaiting_action', 'the ARRANGEMENT: x parked, nothing in flight (P34 fact 4)');
    const before = h.log();
    await h.driver.stop({ actor: 'ops' });
    equal(h.scheduler.cancels, [], 'nothing sent: a parked task is not in flight, and the scheduler cannot end it');
    equal(h.log(), [...before, 'interrupted ops null'], 'the element is the whole of the stop');
    equal(h.driver.resolve('r1:x:-:0', 'done', { actor: 'ops', result: null }), false, 'and resolve() on THIS runtime is refused (decision 9)');
    equal([h.log().length, h.scheduler.added], [before.length + 1, ['r1:x:-:0']], 'nothing appended or handed on by it');
    const st = fold(h.driver.foldInputs());
    equal([st.outcome, st.nodes['r1:x:-:0']!.state], ['interrupted', 'suspended'], '`interrupted`, the parked node still `suspended`');
    // The CONTROL: the same run, not stopped, takes the same resolve().
    const c = harness(LINE);
    c.driver.start({});
    c.scheduler.settle('r1:x:-:0', 'user_action');
    equal(c.driver.resolve('r1:x:-:0', 'done', { actor: 'ops', result: null }), true, 'the control: unstopped, the resolve() is accepted');

    // RESUMED ELSEWHERE: not refused, nothing re-dispatched, and the person resolves x THERE.
    const cp = stored(h.driver);
    equal(resumeRefusal(LINE, cp), null, 'a stopped run`s checkpoint is not refused (RN-R23 v0.19)');
    // A store that dropped the element's `null` reason (JSON-style) — the replay feeds it back as `null`, not `undefined`.
    delete (cp.events.at(-1) as { reason?: unknown }).reason;
    const b = harness(LINE);
    b.driver.resume(cp);
    equal((b.driver.foldInputs()[cp.events.length - 1] as { reason?: unknown }).reason, null,
      'the fed element is normalised: a missing reason is `null` (the conformity reader`s finding 10)');
    equal([b.log().slice(cp.events.length), b.scheduler.added], [['resumed '], []], '`resumed` naming nothing, nothing handed on');
    equal(fold(b.driver.foldInputs()).outcome, 'awaiting_action', 'the resumed run waits on its person again');
    equal(b.driver.resolve('r1:x:-:0', 'done', { actor: 'ops', result: { ok: 1 } }), true, 'and resolve() is accepted on the runtime that resumed it');
    equal(b.scheduler.added, ['r1:y:-:0'], 'y handed to the NEW scheduler');
    b.scheduler.settle('r1:y:-:0', 'done');
    equal(fold(b.driver.foldInputs()).outcome, 'completed', 'to `completed`');
  });

  test(DECLARED_CASES[4]!, async () => {
    const drive = (raise: boolean) => {
      let promise: Promise<void> | null = null;
      const box: { driver?: Driver } = {};
      const h = harness(TWO, new StopFake(), {
        onFoldInput: (e: FoldInput) => {
          if (raise && promise === null && e.kind === 'dispatched' && e.taskId === 'r1:a:0:0') promise = box.driver!.stop({ actor: 'ops' });
        },
      });
      box.driver = h.driver;
      h.driver.start({});
      return { h, promise: () => promise };
    };
    const ctl = drive(false);
    const run = drive(true);
    equal(ctl.h.log(), ['regionEntered', 'branch.opened 0', 'branch.opened 1', 'dispatched r1:a:0:0', 'dispatched r1:b:1:0'],
      'the control: the fan-out dispatches both branches');
    equal(run.h.log(), [...ctl.h.log(), 'interrupted ops null'],
      'the stop is taken when the step ENDS: b is still entered and dispatched, and the element follows the whole step');
    equal(run.h.scheduler.added, ['r1:a:0:0', 'r1:b:1:0'], 'both handed on in the step');
    equal(run.h.scheduler.cancels.map((c) => [c.id, c.options, c.held]), [['r1:a:0:0', {}, true], ['r1:b:1:0', {}, true]],
      'and both cancelled AFTER their hand-off — a, whose own element carried the call, among them (RN-R29 (i)); no option keys, none given');
    let resolved = false;
    void run.promise()!.then(() => { resolved = true; });
    run.h.scheduler.finish('r1:a:0:0');
    await turn();
    equal(resolved, false, 'pending while b stops');
    run.h.scheduler.finish('r1:b:1:0');
    await turn();
    equal(resolved, true, 'and resolved once both have');
  });

  test(DECLARED_CASES[5]!, async () => {
    const U = 'r1:u:0:0', X = 'r1:x:1:0', Y = 'r1:y:1:0';
    const drive = (raise: boolean) => {
      const seen: { resolved?: boolean; cancel?: string } = {};
      let promise: Promise<void> | null = null;
      const box: { driver?: Driver } = {};
      const h = harness(PAIR, new StopFake(), {
        onFoldInput: (e: FoldInput) => {
          if (seen.resolved !== undefined || e.kind !== 'outcome' || e.record.taskId !== X) return;
          if (raise) {
            promise = box.driver!.stop({ actor: 'ops', reason: 'mid' });
            seen.cancel = refusedBy(() => box.driver!.cancel({ actor: 'ana' })).reason;
          }
          seen.resolved = box.driver!.resolve(U, 'done', { actor: 'ops', result: null });
        },
      });
      box.driver = h.driver;
      h.driver.start({});
      h.scheduler.settle(U, 'user_action');
      h.scheduler.settle(X, 'done');
      return { h, seen, promise: () => promise };
    };
    // The CONTROL: the same callback with no stop — its resolve() is accepted.
    const ctl = drive(false);
    equal(ctl.seen.resolved, true, 'the control: on x`s settlement element, unstopped, resolve(u) is accepted');
    const run = drive(true);
    equal(run.seen, { cancel: 'interrupted', resolved: false },
      'from the ACCEPTED call on — the stop still pending on this step — resolve() is refused and a cancel refused `interrupted`');
    const tail = run.h.log().slice(run.h.log().indexOf(`outcome ${X} done`));
    equal(tail, [`outcome ${X} done`, `dispatched ${Y}`, 'interrupted ops mid'],
      'the step is WHOLE: x`s successor y dispatched, and the element after it — nothing of the routing dropped');
    equal(run.h.scheduler.added.at(-1), Y, 'y handed on in the step');
    equal(run.h.scheduler.cancels.map((c) => [c.id, c.held]), [[Y, true]], 'and cancelled after — the one task in flight; u parked, x settled');
    const st = fold(run.h.driver.foldInputs());
    equal([st.outcome, st.nodes[U]!.state, st.nodes[X]!.state, st.nodes[Y]!.state], ['interrupted', 'suspended', 'done', 'running'],
      '`interrupted`, u parked, x done, y the in-flight set');
    run.h.scheduler.finish(Y);
    await run.promise();

    // RESUMED: the stop is fed where it was taken (RN-R19), and y — routed in the step the stop interrupted — runs again.
    const b = harness(PAIR);
    const cp = stored(run.h.driver);
    b.driver.resume(cp);
    equal(b.log().slice(cp.events.length), [`resumed ${Y}`], 'not refused: `resumed` names y');
    equal(b.scheduler.added, [Y], 'y handed to the new scheduler at the same id');
    equal(b.driver.resolve(U, 'done', { actor: 'ops', result: null }), true, 'u resolved on the runtime that resumed it');
    b.scheduler.settle(Y, 'done');
    equal(fold(b.driver.foldInputs()).outcome, 'completed', 'both branches arrived and the join fired: `completed`');
  });

  test(DECLARED_CASES[6]!, async () => {
    const A = 'r1:a:0:0', B = 'r1:b:1:0', P = 'r1:publish:-:0';
    const h = harness(TWO);
    h.driver.start({});
    h.scheduler.settle(A, 'done');
    const pr = h.driver.stop({ actor: 'ops', reason: 'first' });
    h.scheduler.finish(B);
    await pr;
    equal(h.scheduler.cancels.map((c) => c.id), [B], 'the ARRANGEMENT: a settled `done`, b in flight and cancelled');
    const cp1 = stored(h.driver);

    // A FRESH driver over a fresh scheduler.
    const b = harness(TWO);
    b.driver.resume(cp1);
    equal(b.log().slice(cp1.events.length), [`resumed ${B}`], '`resumed` names EXACTLY the in-flight set — b, not a, which settled');
    equal(b.scheduler.added, [B], 'and exactly b is handed to the new scheduler, at the SAME id');
    const sb = fold(b.driver.foldInputs());
    equal([sb.outcome, sb.interruption, sb.resumes], ['running', null, [[B]]], 'the resume ENDS the stop: `running`, `interruption` null');

    // b settles THERE and the run moves on — then it is stopped AGAIN, with publish in flight.
    b.scheduler.settle(B, 'done');
    equal(b.scheduler.added, [B, P], 'on the resumed driver b`s settlement fires the join and publish is dispatched');
    const pr2 = b.driver.stop({ actor: 'bob', reason: 'second' });
    b.scheduler.finish(P);
    await pr2;
    const cp2 = stored(b.driver);
    // A THIRD fresh driver: its replay is held from the first stop and routes again from the first `resumed` — so b's
    // settlement there regenerates publish's dispatch — and is held again from the second stop.
    const c = harness(TWO);
    c.driver.resume(cp2);
    equal(c.log().slice(cp2.events.length), [`resumed ${P}`], 'not refused: the replay reproduced the stored run, and `resumed` names publish');
    equal(c.scheduler.added, [P], 'the third driver hands on EXACTLY the second stop`s in-flight set — publish, not b');
    c.scheduler.settle(P, 'done');
    const sc = fold(c.driver.foldInputs());
    equal([sc.outcome, sc.resumes, sc.interruption], ['completed', [[B], [P]], null], 'to `completed`, both resumes recorded');
    equal(c.log().filter((l) => l.startsWith('interrupted')), ['interrupted ops first', 'interrupted bob second'],
      'both stops in the sequence, in order — the history is the log`s, not run state`s (RN-R32: CURRENT)');
  });

  test(DECLARED_CASES[7]!, async () => {
    const A = 'r1:a:0:0', B = 'r1:b:1:0';
    const h = harness(TWO);
    h.driver.start({});
    const pr = h.driver.stop({ actor: 'ops' });
    h.scheduler.finish(A);
    h.scheduler.finish(B);
    await pr;
    const cp = stored(h.driver);
    const drive = (raise: boolean) => {
      let promise: Promise<void> | null = null;
      const box: { driver?: Driver } = {};
      const r = harness(TWO, new StopFake(), {
        onFoldInput: (e: FoldInput) => { if (raise && promise === null && e.kind === 'resumed') promise = box.driver!.stop({ actor: 'bob' }); },
      });
      box.driver = r.driver;
      r.driver.resume(cp);
      return { r, promise: () => promise };
    };
    const ctl = drive(false);
    equal([ctl.r.scheduler.added, ctl.r.scheduler.cancels], [[A, B], []], 'the control: the resume hands both on, and cancels nothing');
    const run = drive(true);
    equal(run.r.scheduler.added, [A, B], 'the stop on `resumed` is taken when resume() RETURNS: both are handed on first');
    equal(run.r.scheduler.cancels.map((c) => [c.id, c.held]), [[A, true], [B, true]], 'and then each is cancelled, after its hand-off');
    equal(run.r.log().slice(cp.events.length), [`resumed ${A},${B}`, 'interrupted bob null'], 'the element follows `resumed`');
    run.r.scheduler.finish(A);
    run.r.scheduler.finish(B);
    await run.promise();
    equal(fold(run.r.driver.foldInputs()).outcome, 'interrupted', 'and the run is stopped again, for the next resume');
  });

  test(DECLARED_CASES[8]!, async () => {
    const X = 'r1:x:-:0', Y = 'r1:y:-:0';
    // A checkpoint taken INSIDE the callback for x's settlement: it ends mid-step, before y's dispatch (the lost tail).
    const box: { driver?: Driver; cp?: Checkpoint } = {};
    const first = harness(LINE, new StopFake(), {
      onFoldInput: (e: FoldInput) => { if (box.cp === undefined && e.kind === 'outcome') box.cp = structuredClone(box.driver!.checkpoint()) as Checkpoint; },
    });
    box.driver = first.driver;
    first.driver.start({});
    first.scheduler.settle(X, 'done');
    const cp = box.cp!;
    equal(cp.events.map(label), [`dispatched ${X}`, `outcome ${X} done`], 'the ARRANGEMENT: the store holds x`s settlement and not y`s dispatch');
    let promise: Promise<void> | null = null;
    const rbox: { driver?: Driver } = {};
    const r = harness(LINE, new StopFake(), {
      onFoldInput: (e: FoldInput) => { if (promise === null && e.kind === 'dispatched' && e.taskId === Y) promise = rbox.driver!.stop({ actor: 'ops' }); },
    });
    rbox.driver = r.driver;
    r.driver.resume(cp);
    equal(r.log().slice(cp.events.length), [`dispatched ${Y}`, `resumed ${Y}`, 'interrupted ops null'],
      'the stop raised on the regenerated tail is taken when resume() RETURNS: the tail, `resumed`, then the element');
    equal(r.scheduler.added, [Y], 'y handed on by the resume');
    equal(r.scheduler.cancels.map((c) => [c.id, c.held]), [[Y, true]], 'and then cancelled, after its hand-off');
    r.scheduler.finish(Y);
    await promise!;
    equal(fold(r.driver.foldInputs()).outcome, 'interrupted', 'the resumed run is stopped, for the next resume');
  });

  test(DECLARED_CASES[9]!, async () => {
    const A = 'r1:a:0:0', B = 'r1:b:1:0';
    const box: { driver?: Driver } = {};
    const s = new StopFake();
    const h = harness(TWO, s, {
      // On the `interrupted` element — before any cancel is sent — the scheduler fires a's `done` (a race a real scheduler
      // can produce: a task finishing at that instant). A driver deaf only AFTER the element would append it, routed nowhere.
      onFoldInput: (e: FoldInput) => { if (e.kind === 'interrupted') s.settle(A, 'done'); },
    });
    box.driver = h.driver;
    h.driver.start({});
    const before = h.log();
    const pr = h.driver.stop({ actor: 'ops' });
    ok(s.fired.includes(`task.completed ${A}`), 'the ARRANGEMENT: a`s `done` fired on the element`s callback');
    equal(h.log(), [...before, 'interrupted ops null'], 'NOT heard: the element is still the last thing in the log');
    equal(fold(h.driver.foldInputs()).nodes[A]!.state, 'running', 'so a stays in flight');
    s.finish(B);
    await pr;
    const cp = stored(h.driver);
    const b = harness(TWO);
    b.driver.resume(cp);
    equal(b.scheduler.added, [A, B], 'and the resume runs a AGAIN — at-least-once — rather than losing its routing');
    b.scheduler.settle(A, 'done');
    b.scheduler.settle(B, 'done');
    equal(b.scheduler.added.at(-1), 'r1:publish:-:0', 'both arrive: the join fires and publish is dispatched');
  });

  test(DECLARED_CASES[10]!, async () => {
    const A = 'r1:a:0:0', B = 'r1:b:1:0';
    const boom = new Error('W174: the consumer`s store failed on the element');
    // AT REST: stop() itself throws, after the element and with the cancels sent.
    const rest = harness(TWO, new StopFake(), { onFoldInput: (e: FoldInput) => { if (e.kind === 'interrupted') throw boom; } });
    rest.driver.start({});
    let thrown: unknown = null;
    try { void rest.driver.stop({ actor: 'ops' }); } catch (e) { thrown = e; }
    equal(thrown, boom, 'at rest the throw reaches stop()`s caller');
    equal(rest.log().at(-1), 'interrupted ops null', 'the element is in the log');
    equal(rest.scheduler.cancels.map((c) => c.id), [A, B], 'and the tasks it says were stopped ARE cancelled — in a finally');
    let again = false;
    const second = rest.driver.stop({ actor: 'ops' }).then(() => { again = true; });
    rest.scheduler.finish(A);
    await turn();
    equal(again, false, 'a second call waits on b still stopping');
    rest.scheduler.finish(B);
    await second;
    // MID-STEP: the stop raised on a's `dispatched` element is taken as start() ends — the throw escapes start(), and the
    // FIRST call's promise still settles once the tasks stop.
    let promise: Promise<void> | null = null;
    const box: { driver?: Driver } = {};
    const mid = harness(TWO, new StopFake(), {
      onFoldInput: (e: FoldInput) => {
        if (e.kind === 'interrupted') throw boom;
        if (promise === null && e.kind === 'dispatched') promise = box.driver!.stop({ actor: 'ops' });
      },
    });
    box.driver = mid.driver;
    let midThrown: unknown = null;
    try { mid.driver.start({}); } catch (e) { midThrown = e; }
    equal(midThrown, boom, 'mid-step the throw reaches the step`s caller — here start()');
    equal(mid.scheduler.cancels.map((c) => c.id), [A, B], 'both tasks cancelled after their hand-off, though the element`s callback threw');
    let settled = false;
    void promise!.then(() => { settled = true; });
    mid.scheduler.finish(A);
    mid.scheduler.finish(B);
    await turn();
    equal(settled, true, 'and the first call`s promise settles — `took` was resolved');
  });

  test(DECLARED_CASES[11]!, async () => {
    const X = 'r1:x:-:0', Y = 'r1:y:-:0';
    let promise: Promise<void> | null = null;
    const box: { driver?: Driver } = {};
    const h = harness(LINE, new StopFake(), {
      onFoldInput: (e: FoldInput) => { if (promise === null && e.kind === 'outcome' && e.record.taskId === Y) promise = box.driver!.stop({ actor: 'ops' }); },
    });
    box.driver = h.driver;
    h.driver.start({});
    h.scheduler.settle(X, 'done');
    h.scheduler.settle(Y, 'done');
    equal(h.log().slice(-3), [`outcome ${Y} done`, 'pathEnded end', 'interrupted ops null'],
      'the step ended the run — its `pathEnded` in the log — and the stop was taken after it: the element LAST');
    equal(h.scheduler.cancels, [], 'nothing in flight, nothing sent');
    await promise!;
    equal(fold(h.driver.foldInputs()).outcome, 'interrupted', 'the promise resolved, and the fold reads the element (it outranks `completed`)');
  });

  test(DECLARED_CASES[12]!, async () => {
    const X = 'r1:x:-:0';
    let promise: Promise<void> | null = null;
    const box: { driver?: Driver; s?: StopFake } = {};
    const s = new StopFake();
    const h = harness(LINE, s, {
      onFoldInput: (e: FoldInput) => {
        if (promise !== null || e.kind !== 'outcome' || e.record.taskId !== X) return;
        promise = box.driver!.stop({ actor: 'ops' });
        s.settle('r1:nope:-:0', 'done');   // ID-R4 tier 2: a settlement for an id the run never dispatched halts it
      },
    });
    box.driver = h.driver;
    h.driver.start({});
    s.settle(X, 'done');
    equal(h.log().slice(-3), [`outcome ${X} done`, 'halted', 'interrupted ops null'],
      'the halt landed in the step, x`s successor never routed, and the stop was taken after it');
    await promise!;
    equal(fold(h.driver.foldInputs()).outcome, 'halted', 'the promise resolved, and `halted` outranks the stop (RN-R8): not resumable');
  });

  test(DECLARED_CASES[13]!, async () => {
    const A = 'r1:a:0:0', B = 'r1:b:1:0';
    let promise: Promise<void> | null = null;
    const box: { driver?: Driver } = {};
    const s = new StopFake();
    const h = harness(TWO, s, {
      onFoldInput: (e: FoldInput) => {
        if (promise !== null || e.kind !== 'outcome' || e.record.taskId !== A) return;
        promise = box.driver!.stop({ actor: 'ops' });
        s.settle(B, 'cancelled');   // the scheduler cancelled b on its own, inside the step (RN-R28)
      },
    });
    box.driver = h.driver;
    h.driver.start({});
    s.settle(A, 'done');
    equal(h.log().slice(-2), [`outcome ${B} cancelled`, 'interrupted ops null'], 'b`s cancel landed in the step, and the stop was taken after it');
    equal(s.cancels, [], 'nothing left in flight to send a cancel to');
    await promise!;
    equal(fold(h.driver.foldInputs()).outcome, 'cancelled', 'the promise resolved, and RN-R28`s `cancelled` outranks the stop: not resumable');
  });

  test(DECLARED_CASES[14]!, async () => {
    const A = 'r1:a:0:0', B = 'r1:b:1:0';
    const box: { driver?: Driver } = {};
    const seen: { first?: Promise<void>; second?: Promise<void>; sentInside?: number } = {};
    const h = harness(TWO, new StopFake(), {
      onFoldInput: (e: FoldInput) => {
        if (seen.first !== undefined || e.kind !== 'dispatched') return;
        seen.first = box.driver!.stop({ actor: 'ops', graceMs: 1000 });
        seen.second = box.driver!.stop({ actor: 'bob', graceMs: 5 });
        seen.sentInside = h.scheduler.cancels.length;
      },
    });
    box.driver = h.driver;
    h.driver.start({});
    equal(seen.sentInside, 0, 'while PENDING, the second call sends nothing');
    equal(h.scheduler.cancels.map((c) => [c.id, c.options]), [[A, { graceMs: 5 }], [B, { graceMs: 5 }]],
      'the stop, taken at the step`s end, cancels with the SECOND call`s graceMs — kept for the cancels to come');
    equal(h.log().filter((l) => l.startsWith('interrupted')), ['interrupted ops null'], 'ONE element, the first call`s actor');
    let both = 0;
    void seen.first!.then(() => { both += 1; });
    void seen.second!.then(() => { both += 1; });
    h.scheduler.finish(A);
    await turn();
    equal(both, 0, 'neither resolves while b is stopping');
    h.scheduler.finish(B);
    await turn();
    equal(both, 2, 'both resolve once it has');
  });

  test(DECLARED_CASES[15]!, () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name));
    equal(ran, DECLARED_CASES, 'each declared case registered, in order, and no other — an emptied or renamed case fails here');
  });
});
