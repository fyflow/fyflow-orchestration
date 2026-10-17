/**
 * Ladder L2 — **pausing a run through the driver**: `spec/run-state.md` v0.20 `RN-R35` (and `RN-R34`'s flag read off the
 * driver's own sequence, `RN-R19`'s fifth and sixth fed kinds),
 * [ADR 0106](../../doc/decisions/0106-a-run-its-owner-pauses-routes-on-and-holds-every-dispatch-until-unpaused.md),
 * [W175](../../doc/work-items/w175-pausing-a-run.md), P34 stop-and-ask (e).
 *
 * **The fake is `test/driver/stop.test.ts`'s** — a `cancel` that plays the scheduler's roads (P34 fact 8) — with every
 * `addTask` recorded in order, so *nothing handed on while paused* and *handed on in dispatch order* are read where the
 * scheduler sees them, and every `createTask` call recorded, so the factory is shown to be called at RELEASE. **The
 * fixture is chosen so every wrong order differs**: the held tasks are dispatched `c2`, `a2`, `b2` — not their id order
 * (`a2`, `b2`, `c2`), not its reverse, and not the order their branches were opened.
 *
 * **Every expected value is derived from `RN-R35` and the flows' own shape** — refuse; taken at rest; a `paused` element,
 * then every dispatch appended and held; an `unpaused` element, then each held task handed on, first held first — and
 * never from a run's output. Each claim sits beside its CONTROL where one exists.
 */
import { equal, ok, collected, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { Driver, RunControlRefused, type Checkpoint } from '../../src/driver/driver.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { fold, type FoldInput } from '../../src/fold/run-state.ts';
import { liveToken } from '../../src/fold/policies.ts';

type Road = 'running' | 'waiting';

/** L2's fake: it queues nothing and runs nothing; `cancel` plays the RUNNING and WAITING roads (P34 fact 8). */
class PauseFake {
  readonly added: string[] = [];
  readonly cancels: { id: string; options: unknown; held: boolean }[] = [];
  readonly roads = new Map<string, Road>();
  /** Run inside `addTask`, after the task is recorded — a scheduler that fires on the hand-off's own stack. */
  onAdd: ((id: string) => void) | null = null;
  private readonly settled = new Set<string>();
  private readonly stopping = new Map<string, { promise: Promise<boolean>; resolve: (v: boolean) => void }>();
  private listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(task: unknown): void {
    const id = (task as { id: string }).id;
    this.added.push(id);
    this.onAdd?.(id);
  }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  emit(type: string, id: string, state: string): void {
    const detail = { id, state, result: state === 'done' ? { v: id } : null, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
    for (const fn of this.listeners.get(type) ?? []) fn({ detail });
  }
  settle(id: string, state: 'done' | 'user_action' | 'cancelled'): void {
    this.settled.add(id);
    if (state === 'done') this.emit('task.completed', id, 'done');
    else if (state === 'cancelled') this.emit('task.cancelled', id, 'cancelled');
    else { this.emit('task.failed', id, state); this.emit('task.user_action', id, state); }
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
    if (this.roads.get(id) === 'waiting') {
      this.settle(id, 'cancelled');
      return Promise.resolve(true);
    }
    // A repeat call returns the SAME promise, as the scheduler's does.
    const repeat = this.stopping.get(id);
    if (repeat) return repeat.promise;
    let resolve!: (v: boolean) => void;
    const promise = new Promise<boolean>((r) => { resolve = r; });
    this.stopping.set(id, { promise, resolve });
    return promise;
  }
}

/** split(a, b, c); each X -> X2 -> collect; collect -> done. */
const FAN3 = {
  flowId: 'pause-fan3', version: 1, entry: 'split',
  nodes: [
    { id: 'split', kind: 'fanout', branches: ['a', 'b', 'c'] },
    ...['a', 'b', 'c'].flatMap((x) => [
      { id: x, kind: 'task', type: 'T', edges: [{ to: `${x}2` }] },
      { id: `${x}2`, kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
    ]),
    { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

/** x -> y -> done. */
const LINE = {
  flowId: 'pause-line', version: 1, entry: 'x',
  nodes: [
    { id: 'x', kind: 'task', type: 'T', edges: [{ to: 'y' }] },
    { id: 'y', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

const A = 'r1:a:0:0', B = 'r1:b:1:0', C = 'r1:c:2:0', A2 = 'r1:a2:0:0', B2 = 'r1:b2:1:0', C2 = 'r1:c2:2:0';
const X = 'r1:x:-:0', Y = 'r1:y:-:0';

const label = (e: FoldInput): string => {
  switch (e.kind) {
    case 'dispatched': return `dispatched ${e.taskId}`;
    case 'outcome': return `outcome ${e.record.taskId} ${(e.record as { terminalState: string }).terminalState}`;
    case 'resolution': return `resolution ${e.record.taskId}`;
    case 'region': return `${e.event.type} ${e.event.branchPath}`;
    case 'paused': return `paused ${e.actor}`;
    case 'unpaused': return `unpaused ${e.actor}`;
    case 'interrupted': return `interrupted ${e.actor}`;
    case 'cancelRequested': return `cancelRequested ${e.actor}`;
    case 'resumed': return `resumed ${e.taskIds.join(',')}`;
    case 'pathEnded': return `pathEnded ${e.reason}`;
    default: return e.kind;
  }
};

function harness(def: FlowDefinition, extra: Record<string, unknown> = {}, scheduler: object = new PauseFake()) {
  const created: string[] = [];
  const failures: string[] = [];
  const driver = new Driver(def, {
    runId: 'r1', scheduler: scheduler as PauseFake, createTask: (c) => { created.push(c.id); return c; }, predicates: new Map(), ...typesFor(['T']),
    joinPolicy: liveToken as unknown as JoinPolicy, now: () => 0,
    onRunFailure: (f) => failures.push(f.kind),
    ...extra,
  });
  const log = () => driver.foldInputs().map(label);
  return { scheduler: scheduler as PauseFake, driver, created, failures, log };
}

/** A driver whose `onFoldInput` calls `fn` with the driver, once a predicate first matches. */
function withCallback(def: FlowDefinition, when: (e: FoldInput) => boolean, fn: (d: Driver, e: FoldInput) => void) {
  const box: { driver?: Driver; fired: boolean } = { fired: false };
  const h = harness(def, {
    onFoldInput: (e: FoldInput) => { if (!box.fired && when(e)) { box.fired = true; fn(box.driver!, e); } },
  });
  box.driver = h.driver;
  return h;
}

const turn = () => new Promise<void>((r) => setTimeout(r, 0));

const refusedBy = (fn: () => unknown): RunControlRefused => {
  try { fn(); } catch (e) { if (e instanceof RunControlRefused) return e; throw e; }
  throw new Error('expected RunControlRefused, nothing was thrown');
};

const stored = (d: Driver): Checkpoint => structuredClone(d.checkpoint()) as Checkpoint;

/** FAN3 started, paused at rest, and three tasks held in the order c2, a2, b2: c done, a done, b parked and resolved. */
function heldThree(extra: Record<string, unknown> = {}) {
  const h = harness(FAN3, extra);
  h.driver.start({});
  h.driver.pause({ actor: 'ops' });
  h.scheduler.settle(C, 'done');
  h.scheduler.settle(A, 'done');
  h.scheduler.settle(B, 'user_action');
  ok(h.driver.resolve(B, 'done', { actor: 'ana', result: null }), 'the ARRANGEMENT: a person resolves b while the run is paused');
  return h;
}

const SUITE = 'L2 — RN-R35: pausing a run — it routes on, every dispatch is appended and HELD, and an unpause hands them on in dispatch order';
const DECLARED_CASES = [
  'paused: routing and resolve() go on, each dispatch appended and HELD — `dispatched` and `running` in the fold, nothing handed on, createTask not called — and the unpause hands them on in DISPATCH ORDER',
  'each refusal by name — not-started, halted, cancelled (RN-R28 and requested), interrupted, paused, not-paused, ended at rest — nothing recorded; and an unpause of a paused run that FINISHED is accepted',
  'a pause raised MID-STEP on a fan-out`s first `dispatched` element is taken when the step ends: every branch handed on, the element after the step — and its checkpoint resumes PAUSED, where the same element mid-step is refused `diverged`',
  'a pause and an unpause raised in ONE step are each taken at its end, in call order — a second of each in that step refused — and one whose step then HALTS or CANCELS the run is DROPPED',
  'a dispatch made on the unpause`s own stack joins the END of the hand-off — the held tasks first, in dispatch order',
  'a callback THROWING on the `paused` and on the `unpaused` element, taken at rest and at the end of a DRIVER CALL`s step: the throw reaches the caller, the pause holds, and the unpause still hands every held task on',
  'a STOP of a paused run cancels only what was handed on — the held tasks sent nothing and left in flight — and its checkpoint resumes PAUSED on a fresh driver, a task RUNNING at the stop held too, nothing handed on until an unpause there, to `completed`; both calls refused `interrupted` after the stop',
  'a CANCEL of a paused run hands each held task on and THEN cancels it: `cancelling`, then `cancelled` with every held task settled by the scheduler',
  'a pause and a STOP raised in one step: the pause taken first, then the stop — and an unpause and a stop: the held tasks handed on, then every task cancelled',
  'a HALT raised inside the unpause`s hand-off holds the rest: the task after it never handed on',
  'a pause raised on a resumed run`s `resumed` element is taken when resume() returns: the in-flight set handed on first',
  'a cancel raised on a HELD task`s own `dispatched` element hands it on and cancels it — `cancelling`, then `cancelled`; a halt there hands it on as the dispatch in progress',
  'a paused run RESUMED holds its in-flight set BEFORE `resumed`: a dispatch a callback on that element causes is handed on after them, in dispatch order',
  'W178 (j): a callback THROWING on the `paused` and on the `unpaused` element TAKEN at the end of a SCHEDULER EVENT`s step is caught at the listener boundary — nothing leaves the event, onRunFailure hears it once, and the run is HALTED — beside the control that does not throw; and S-1: a throw on `halted` itself, or from onRunFailure, DISCARDED at both boundaries after the report',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test(DECLARED_CASES[0]!, () => {
    const h = heldThree();
    equal(h.scheduler.added, [A, B, C], 'NOTHING handed on while paused: the scheduler holds only the three the fan-out handed on before the pause');
    equal(h.created, [A, B, C], 'and createTask was called for exactly those — a held task`s factory call waits for its release (RN-R21`s rule)');
    const log = h.log();
    const at = log.indexOf('paused ops');
    equal(log.slice(at).filter((l) => l.startsWith('dispatched') || l.startsWith('paused') || l.startsWith('resolution')),
      ['paused ops', `dispatched ${C2}`, `dispatched ${A2}`, 'resolution r1:b:1:0', `dispatched ${B2}`],
      'each held task`s `dispatched` element IS appended, in the order it was routed: c2, a2, then b2 after the resolution');
    const s = fold(h.driver.foldInputs());
    equal([s.outcome, s.paused, s.nodes[C2]!.state, s.nodes[A2]!.state, s.nodes[B2]!.state], ['running', true, 'running', 'running', 'running'],
      'the held tasks read `running` and so does the run — never finished while one is held (P34 fact 3); `paused` true');
    equal(fold(h.driver.foldInputs()), fold(h.driver.foldInputs()), 'L3: the driver`s sequence folded twice, deep-equal');
    const heldOf = (d: Driver) => (d as unknown as { pauseHeld: Map<string, unknown> }).pauseHeld.size;
    equal(heldOf(h.driver), 3, 'RN-R13 v0.20: while paused the driver retains one configuration per held task');

    h.driver.unpause({ actor: 'ana' });
    equal(heldOf(h.driver), 0, 'and none once the unpause has handed them on');
    equal(h.log().at(-1), 'unpaused ana', 'ONE `unpaused` element, and nothing after it — the hand-off appends nothing');
    equal(h.scheduler.added, [A, B, C, C2, A2, B2],
      'handed on in DISPATCH ORDER: c2, a2, b2 — not id order (a2, b2, c2), not its reverse, not branch order');
    equal(h.created, [A, B, C, C2, A2, B2], 'createTask called at the release, in the same order');
    equal(fold(h.driver.foldInputs()).paused, false, '`paused` false again');
    for (const id of [C2, A2, B2]) h.scheduler.settle(id, 'done');
    equal(fold(h.driver.foldInputs()).outcome, 'completed', 'the held tasks ran and the run completed');

    // The CONTROL: the same run never paused hands each successor on as it is routed.
    const c = harness(FAN3);
    c.driver.start({});
    c.scheduler.settle(C, 'done');
    equal(c.scheduler.added, [A, B, C, C2], 'the control: unpaused, c`s successor reaches the scheduler at once');

    // D6: what is handed on at the unpause is the configuration the never-paused run hands on — the held one, unchanged.
    const capture = () => {
      const got = new Map<string, unknown>();
      return { got, createTask: (cfg: { id: string }) => { got.set(cfg.id, structuredClone(cfg)); return cfg; } };
    };
    const pc = capture(), cc = capture();
    const ph = heldThree({ createTask: pc.createTask });
    ph.driver.unpause({ actor: 'ops' });
    const ch = harness(FAN3, { createTask: cc.createTask });
    ch.driver.start({});
    ch.scheduler.settle(C, 'done');
    ch.scheduler.settle(A, 'done');
    ch.scheduler.settle(B, 'user_action');
    ch.driver.resolve(B, 'done', { actor: 'ana', result: null });
    equal([C2, A2, B2].map((id) => pc.got.get(id)), [C2, A2, B2].map((id) => cc.got.get(id)),
      'c2, a2 and b2 handed on with the configuration a never-paused run gives them');

    // U5: the `unpaused` element precedes everything the hand-off causes — a scheduler settling c2 on its own addTask.
    const u5 = heldThree();
    u5.scheduler.onAdd = (id) => { if (id === C2) u5.scheduler.settle(C2, 'done'); };
    u5.driver.unpause({ actor: 'ops' });
    const ul = u5.log();
    ok(ul.indexOf('unpaused ops') >= 0 && ul.indexOf('unpaused ops') < ul.indexOf(`outcome ${C2} done`),
      'the `unpaused` element is appended BEFORE c2`s settlement, which its hand-off caused');
  });

  test(DECLARED_CASES[1]!, () => {
    const n = harness(LINE);
    equal([refusedBy(() => n.driver.pause({ actor: 'ops' })).reason, refusedBy(() => n.driver.unpause({ actor: 'ops' })).reason],
      ['not-started', 'not-started'], '`not-started`: no start()');
    const spent = harness(LINE);
    try { spent.driver.resume({ header: { format: 99 }, events: [] } as never); } catch { /* refused: format */ }
    equal(refusedBy(() => spent.driver.pause({ actor: 'ops' })).reason, 'not-started', '`not-started`: a resume refused and spent');

    const hl = harness(LINE);
    hl.driver.start({});
    hl.scheduler.settle('r1:nope:-:0', 'done');
    const hll = hl.log();
    equal(hll.at(-1), 'halted', 'the ARRANGEMENT: halted, x still in flight');
    const hp = refusedBy(() => hl.driver.pause({ actor: 'ops' }));
    equal([hp.reason, hp.control, hp.name], ['halted', 'pause', 'RunControlRefused'], '`halted`, `control` naming the call');
    equal(refusedBy(() => hl.driver.unpause({ actor: 'ops' })).control, 'unpause', 'and an unpause names its own call');
    equal(hl.log(), hll, 'nothing appended');

    const c = harness(LINE);
    c.driver.start({});
    c.scheduler.settle(X, 'cancelled');
    equal(refusedBy(() => c.driver.pause({ actor: 'ops' })).reason, 'cancelled', '`cancelled`: RN-R28 ended it');
    const r = harness(LINE);
    r.driver.start({});
    void r.driver.cancel({ actor: 'ana' });
    equal(refusedBy(() => r.driver.pause({ actor: 'ops' })).reason, 'cancelled', '`cancelled`: its owner cancelled it, x still stopping');

    const st = harness(LINE);
    st.driver.start({});
    void st.driver.stop({ actor: 'ops' });
    const stl = st.log();
    equal([refusedBy(() => st.driver.pause({ actor: 'ops' })).reason, st.log()], ['interrupted', stl], '`interrupted`: a stopped run is a resume`s to pause');

    const p = harness(LINE);
    p.driver.start({});
    p.driver.pause({ actor: 'ops' });
    const pl = p.log();
    const second = refusedBy(() => p.driver.pause({ actor: 'bob' }));
    equal([second.reason, p.log()], ['paused', pl], '`paused`: a SECOND pause is refused by name, nothing appended');
    const u = harness(LINE);
    u.driver.start({});
    const ul = u.log();
    equal([refusedBy(() => u.driver.unpause({ actor: 'ops' })).reason, u.log()], ['not-paused', ul], '`not-paused`: an unpause of a run not paused');
    // And the CONTROLS: the same calls the right way round are accepted, each appending its element.
    u.driver.pause({ actor: 'ops' });
    p.driver.unpause({ actor: 'bob' });
    equal([u.log().at(-1), p.log().at(-1)], ['paused ops', 'unpaused bob'], 'the controls: a pause of a run not paused, and an unpause of a paused one');

    // `ended` — a run that completed, at rest.
    const e = harness(LINE);
    e.driver.start({});
    e.scheduler.settle(X, 'done');
    e.scheduler.settle(Y, 'done');
    const el = e.log();
    equal([refusedBy(() => e.driver.pause({ actor: 'ops' })).reason, e.log()], ['ended', el], '`ended`: nothing in flight, nothing parked');
    // The CONTROL beside it: the same prefix MID-STEP, on x's settlement element — accepted, taken once y is dispatched.
    const mid = withCallback(LINE, (x) => x.kind === 'outcome', (d) => d.pause({ actor: 'ops' }));
    mid.driver.start({});
    mid.scheduler.settle(X, 'done');
    equal(mid.log().slice(-3), [`outcome ${X} done`, `dispatched ${Y}`, 'paused ops'], 'mid-step it is not `ended`: accepted, taken after the step');

    // An UNPAUSE is never `ended`: a run paused and then finished may be unpaused.
    const f = harness(LINE);
    f.driver.start({});
    f.scheduler.settle(X, 'user_action');
    f.driver.pause({ actor: 'ops' });
    ok(f.driver.resolve(X, 'failed', { actor: 'ana', error: 'no' }), 'the ARRANGEMENT: x resolved failed while paused');
    equal(fold(f.driver.foldInputs()).outcome, 'failed', 'and the run ENDED, paused, with nothing in flight');
    f.driver.unpause({ actor: 'ops' });
    equal([f.log().at(-1), fold(f.driver.foldInputs()).paused], ['unpaused ops', false], 'an unpause of the finished run is accepted');
  });

  test(DECLARED_CASES[2]!, () => {
    const h = withCallback(FAN3, (e) => e.kind === 'dispatched' && e.taskId === A, (d) => d.pause({ actor: 'ops' }));
    h.driver.start({});
    equal(h.log(), ['regionEntered', 'branch.opened 0', 'branch.opened 1', 'branch.opened 2',
      `dispatched ${A}`, `dispatched ${B}`, `dispatched ${C}`, 'paused ops'],
    'the step is WHOLE — b and c entered and dispatched — and the element FOLLOWS it, between two steps');
    equal(h.scheduler.added, [A, B, C], 'every branch handed on: the step a pause is called on finishes unpaused');
    h.scheduler.settle(A, 'done');
    equal([h.scheduler.added.length, h.log().at(-1)], [3, `dispatched ${A2}`], 'from the element on, a2 is appended and held');

    // Its checkpoint resumes on a fresh driver: the replay FEEDS `paused` where it lies, and the run resumes PAUSED.
    const cp = stored(h.driver);
    const b = harness(FAN3);
    b.driver.resume(cp);
    equal(b.log().slice(cp.events.length), [`resumed ${B},${C},${A2}`], 'not refused: `resumed` names the in-flight set, held a2 among it');
    equal([b.scheduler.added, fold(b.driver.foldInputs()).paused], [[], true], 'and nothing is handed on — the resumed run is PAUSED');
    b.driver.unpause({ actor: 'ana' });
    equal(b.scheduler.added, [B, C, A2], 'the unpause hands the whole in-flight set on, in dispatch order');
    // And THAT run's checkpoint — `paused` and `unpaused` both stored — resumes UNPAUSED: the fed `unpaused` lifts it.
    const cp2 = stored(b.driver);
    const e = harness(FAN3);
    e.driver.resume(cp2);
    equal([e.scheduler.added, fold(e.driver.foldInputs()).paused], [[B, C, A2], false],
      'a checkpoint whose pause was lifted resumes unpaused: the in-flight set handed on at once');

    // The CONTROL: the same element MID-step — where a pause taken at once would have put it — is refused `diverged`.
    const moved = structuredClone(cp);
    const events = [...moved.events];
    const [el] = events.splice(events.findIndex((e) => e.kind === 'paused'), 1);
    events.splice(events.findIndex((e) => e.kind === 'dispatched' && e.taskId === B), 0, el!);
    const d = harness(FAN3);
    let refused: { reason?: string; index?: number | null } = {};
    try { d.driver.resume({ header: moved.header, events }); } catch (x) { refused = x as { reason: string; index: number }; }
    equal([refused.reason, refused.index], ['diverged', 5],
      'the control: with the element between `dispatched a` and `dispatched b`, the replay — which regenerates the step whole — refuses it at 5');
  });

  test(DECLARED_CASES[3]!, () => {
    const seen: string[] = [];
    const h = withCallback(LINE, (e) => e.kind === 'outcome', (d) => {
      d.pause({ actor: 'ops' });
      seen.push(refusedBy(() => d.pause({ actor: 'bob' })).reason);
      d.unpause({ actor: 'ana' });
      seen.push(refusedBy(() => d.unpause({ actor: 'bob' })).reason);
    });
    h.driver.start({});
    h.scheduler.settle(X, 'done');
    equal(seen, ['paused', 'not-paused'],
      'the requested state: a second pause after a PENDING pause is refused `paused`, a second unpause after a pending unpause `not-paused`');
    equal(h.log().slice(-4), [`outcome ${X} done`, `dispatched ${Y}`, 'paused ops', 'unpaused ana'],
      'both taken when the step ends, in call order, after the step whole');
    equal([h.scheduler.added, fold(h.driver.foldInputs()).paused], [[X, Y], false], 'y handed on in its step; the run not paused');

    // The PAUSE's flag is set BEFORE its element: a callback on `paused` that resolves a parked task has its successor HELD.
    const pr = harness(LINE, { onFoldInput: (e: FoldInput) => { if (e.kind === 'paused') pr.driver.resolve(X, 'done', { actor: 'ana', result: null }); } });
    pr.driver.start({});
    pr.scheduler.settle(X, 'user_action');
    pr.driver.pause({ actor: 'ops' });
    equal([pr.log().slice(-3), pr.scheduler.added], [['paused ops', `resolution ${X}`, `dispatched ${Y}`], [X]],
      'the resolution on the `paused` element routes, and y is appended and HELD');
    // The UNPAUSE's flag is cleared BEFORE its element: a pause called on `unpaused` is accepted, taken after the hand-off.
    const up = harness(LINE, { onFoldInput: (e: FoldInput) => { if (e.kind === 'unpaused') up.driver.pause({ actor: 'bob' }); } });
    up.driver.start({});
    up.driver.pause({ actor: 'ops' });
    up.scheduler.settle(X, 'done');
    up.driver.unpause({ actor: 'ana' });
    equal([up.log().slice(-2), up.scheduler.added, fold(up.driver.foldInputs()).paused], [['unpaused ana', 'paused bob'], [X, Y], true],
      'a pause on the `unpaused` element is not refused `paused`: taken after y is handed on, and the run paused again');

    // A pause ACCEPTED mid-step whose step then HALTS the run is DROPPED at the take (RN-R35, the conformity reader's
    // G1): it would be refused `halted` now, and nothing is recorded for it.
    const hh = withCallback(LINE, (e) => e.kind === 'outcome', (d) => {
      d.pause({ actor: 'ops' });
      hh.scheduler.settle('r1:nope:-:0', 'done');
    });
    hh.driver.start({});
    hh.scheduler.settle(X, 'done');
    equal(hh.log().slice(-2), [`outcome ${X} done`, 'halted'], 'the halt in the step, and NO `paused` element after it');
    const sh = fold(hh.driver.foldInputs());
    equal([sh.outcome, sh.paused, hh.scheduler.added], ['halted', false, [X]], '`halted`, not paused, y never dispatched');
    // ... and one whose step then CANCELS the run (a requested cancel in the same callback): dropped too.
    const hc = withCallback(LINE, (e) => e.kind === 'outcome', (d) => { d.pause({ actor: 'ops' }); void d.cancel({ actor: 'ana' }); });
    hc.driver.start({});
    hc.scheduler.settle(X, 'done');
    equal([hc.log().slice(-2), fold(hc.driver.foldInputs()).paused], [[`outcome ${X} done`, 'cancelRequested ana'], false],
      'the request in the step, and NO `paused` element after it — a cancelled run never reads paused by a later pause');
    // ... and one whose step then has a task settle `cancelled` on its own (RN-R28): dropped too.
    const h28 = harness(FAN3, {
      onFoldInput: (e: FoldInput) => { if (e.kind === 'outcome' && e.record.taskId === A) { h28.driver.pause({ actor: 'ops' }); h28.scheduler.settle(B, 'cancelled'); } },
    });
    h28.driver.start({});
    h28.scheduler.settle(A, 'done');
    equal([fold(h28.driver.foldInputs()).outcome, h28.log().includes('paused ops')], ['cancelled', false], 'RN-R28 cancelled the run in the step: no `paused` element');
    // ... and an UNPAUSE pending when a cancel lands in its step: dropped — the cancel already released the held tasks.
    const uc = harness(LINE, {
      onFoldInput: (e: FoldInput) => { if (e.kind === 'outcome' && e.record.taskId === X) { uc.driver.unpause({ actor: 'ana' }); void uc.driver.cancel({ actor: 'bob' }); } },
    });
    uc.driver.start({});
    uc.driver.pause({ actor: 'ops' });
    uc.scheduler.settle(X, 'done');
    // The cancel holds the run from x's own element, so y is never routed; the unpause pending beside it is dropped.
    equal([uc.log().slice(-3), uc.scheduler.added, uc.scheduler.cancels],
      [['paused ops', `outcome ${X} done`, 'cancelRequested bob'], [X], []],
      'no `unpaused` after the request — the pending unpause recorded nothing — and nothing handed on');
    const su2 = fold(uc.driver.foldInputs());
    equal([su2.outcome, su2.paused], ['cancelled', true], '`cancelled`, and still `paused`: only an `unpaused` element lifts it (R5)');
  });

  test(DECLARED_CASES[4]!, () => {
    const h = heldThree({});
    // The UNPAUSE's callback resolves b, which parked while paused — so b2 is dispatched ON the hand-off's stack, while
    // c2 and a2 are still held.
    const k = harness(FAN3, {
      onFoldInput: (e: FoldInput) => {
        if (e.kind === 'unpaused') ok(k.driver.resolve(B, 'done', { actor: 'ana', result: null }), 'resolved on the `unpaused` element');
      },
    });
    k.driver.start({});
    k.driver.pause({ actor: 'ops' });
    k.scheduler.settle(C, 'done');
    k.scheduler.settle(A, 'done');
    k.scheduler.settle(B, 'user_action');
    k.driver.unpause({ actor: 'ops' });
    equal(k.log().slice(k.log().indexOf('unpaused ops')).filter((l) => l.startsWith('dispatched') || l.startsWith('unpaused')),
      ['unpaused ops', `dispatched ${B2}`], 'the ARRANGEMENT: b2 is dispatched after the `unpaused` element, on its callback');
    equal(k.scheduler.added, [A, B, C, C2, A2, B2], 'b2 joins the END: c2 and a2, held first, are handed on first');
    // The CONTROL: heldThree's b2 was dispatched WHILE paused and is handed on in the same place — so the order above is
    // the queue's, and not b2 happening to be last for another reason.
    h.driver.unpause({ actor: 'ana' });
    equal(h.scheduler.added.slice(3), [C2, A2, B2], 'the control: the same three, b2 held while paused');
  });

  test(DECLARED_CASES[5]!, () => {
    const throwing = (kind: string) => ({ onFoldInput: (e: FoldInput) => { if (e.kind === kind) throw new Error(`boom on ${kind}`); } });
    const p = harness(LINE, throwing('paused'));
    p.driver.start({});
    let thrown = '';
    try { p.driver.pause({ actor: 'ops' }); } catch (x) { thrown = (x as Error).message; }
    equal(thrown, 'boom on paused', 'the throw reaches pause()`s caller');
    equal([p.log().at(-1), fold(p.driver.foldInputs()).paused], ['paused ops', true], 'the element is in the log');
    p.scheduler.settle(X, 'done');
    equal(p.scheduler.added, [X], 'and the pause HOLDS: y is held, not handed on');
    // M7: the driver is back at rest after the throw — an unpause at rest is taken at once and hands y on.
    p.driver.unpause({ actor: 'ops' });
    equal([p.log().at(-1), p.scheduler.added], ['unpaused ops', [X, Y]], 'after the throw the driver is at rest: the unpause is taken and y handed on');
    // MID-STEP on `paused`, on a DRIVER CALL's step: a pause called on x's own `dispatched` element is taken as start()
    // ends and its callback throws — out of start(), to ITS caller — and the pause holds. (On a SCHEDULER EVENT's step
    // the listener boundary catches it instead: case 13, W178 (j).)
    let pmid = '';
    const pm = harness(LINE, {
      onFoldInput: (e: FoldInput) => {
        if (e.kind === 'dispatched' && e.taskId === X) pm.driver.pause({ actor: 'ops' });
        if (e.kind === 'paused') throw new Error('boom mid paused');
      },
    });
    try { pm.driver.start({}); } catch (x) { pmid = (x as Error).message; }
    equal([pmid, pm.log().at(-1), fold(pm.driver.foldInputs()).paused, pm.failures], ['boom mid paused', 'paused ops', true, []],
      'mid-step on start()`s step: the throw reaches start()`s caller, the run is paused, and nothing is reported — not halted');
    pm.scheduler.settle(X, 'done');
    equal(pm.scheduler.added, [X], 'and the pause HOLDS: y is held, not handed on');

    const u = harness(LINE, throwing('unpaused'));
    u.driver.start({});
    u.driver.pause({ actor: 'ops' });
    u.scheduler.settle(X, 'done');
    thrown = '';
    try { u.driver.unpause({ actor: 'ana' }); } catch (x) { thrown = (x as Error).message; }
    equal(thrown, 'boom on unpaused', 'the throw reaches unpause()`s caller');
    equal([u.log().at(-1), fold(u.driver.foldInputs()).paused, u.scheduler.added], ['unpaused ana', false, [X, Y]],
      'the element is in the log, the run not paused — and y WAS handed on: the hand-off is in a `finally`');
    // MID-STEP, on a DRIVER CALL's step: an unpause called on the RESOLUTION element of a person's resolve() is taken as
    // resolve() ends, and its element's callback throws — out of resolve(), to ITS caller — and the held tasks, b2
    // dispatched in that very step among them, are still handed on in dispatch order.
    let midThrown = '';
    const mm = harness(FAN3, {
      onFoldInput: (e: FoldInput) => {
        if (e.kind === 'resolution' && e.record.taskId === B) mm.driver.unpause({ actor: 'ops' });
        if (e.kind === 'unpaused') throw new Error('boom mid');
      },
    });
    mm.driver.start({});
    mm.scheduler.settle(B, 'user_action');
    mm.driver.pause({ actor: 'ops' });
    mm.scheduler.settle(C, 'done');
    mm.scheduler.settle(A, 'done');
    try { mm.driver.resolve(B, 'done', { actor: 'ana', result: null }); } catch (x) { midThrown = (x as Error).message; }
    equal([midThrown, mm.failures], ['boom mid', []], 'mid-step on resolve()`s step: the throw reaches resolve()`s caller, nothing reported');
    equal([mm.log().at(-1), mm.scheduler.added], ['unpaused ops', [A, B, C, C2, A2, B2]],
      'and c2, a2 and b2 — held, b2 in the very step — are handed on in dispatch order');
  });

  test(DECLARED_CASES[6]!, async () => {
    const g = heldThree();
    const before = g.log();
    const pr = g.driver.stop({ actor: 'ops', reason: 'upgrade' });
    equal(g.scheduler.cancels.map((c) => c.id), [], 'every task the scheduler held has settled (a, c done; b resolved) — the HELD c2, a2, b2 are sent NOTHING');
    equal(g.log(), [...before, 'interrupted ops'], 'one element');
    await pr;
    const s = fold(g.driver.foldInputs());
    equal([s.outcome, s.paused, [C2, A2, B2].map((id) => s.nodes[id]!.state)], ['interrupted', true, ['running', 'running', 'running']],
      '`interrupted`, still paused, the held tasks left IN FLIGHT — dispatched and unsettled');

    // Resumed on a FRESH driver: the replay feeds `paused`, and the in-flight set is HELD again.
    const cp = stored(g.driver);
    const b = harness(FAN3);
    b.driver.resume(cp);
    equal(b.log().slice(cp.events.length), [`resumed ${C2},${A2},${B2}`], '`resumed` names the held tasks — in flight in the log');
    equal([b.scheduler.added, b.created], [[], []], 'nothing handed on, no createTask: the run resumes PAUSED');
    const sb = fold(b.driver.foldInputs());
    equal([sb.outcome, sb.paused, sb.interruption], ['running', true, null], '`running` and `paused`, the stop ended by `resumed`');
    b.driver.unpause({ actor: 'ana' });
    equal(b.scheduler.added, [C2, A2, B2], 'the unpause THERE hands them on, in dispatch order, at the same ids');
    for (const id of [C2, A2, B2]) b.scheduler.settle(id, 'done');
    equal(fold(b.driver.foldInputs()).outcome, 'completed', 'to `completed`');

    // With a task still RUNNING on the old runtime: that one is cancelled, the held one is not.
    const m = harness(LINE);
    m.driver.start({});
    m.driver.pause({ actor: 'ops' });
    // The CONTROL arrangement: x handed on before the pause and still running.
    const pm = m.driver.stop({ actor: 'ops' });
    equal(m.scheduler.cancels.map((c) => [c.id, c.held]), [[X, true]], 'the control: x, handed on before the pause, IS cancelled');
    m.scheduler.finish(X);
    await pm;
    // Its checkpoint resumes PAUSED: x — RUNNING when the run stopped, never held — is HELD on the fresh driver too (the
    // log cannot tell it from a held task, and the pause holds every dispatch from its element on), until an unpause.
    const mr = harness(LINE);
    const mcp = stored(m.driver);
    mr.driver.resume(mcp);
    equal([mr.log().slice(mcp.events.length), mr.scheduler.added], [[`resumed ${X}`], []], 'x named by `resumed` and NOT handed on');
    mr.driver.unpause({ actor: 'ops' });
    equal(mr.scheduler.added, [X], 'handed on at the unpause');
    // Z6: the resumed driver's prefix IS the stored run — the fed `paused` appended as stored.
    equal(mr.log().slice(0, mcp.events.length), m.log(), 'the replayed prefix equals the stored run, element for element, `paused` among them');

    // R12: a STOPPED paused run refuses both calls `interrupted`, appending and handing on nothing.
    const g2 = heldThree();
    await g2.driver.stop({ actor: 'ops' });
    const g2l = g2.log();
    equal([refusedBy(() => g2.driver.unpause({ actor: 'ana' })).reason, refusedBy(() => g2.driver.pause({ actor: 'ana' })).reason, g2.log(), g2.scheduler.added],
      ['interrupted', 'interrupted', g2l, [A, B, C]], 'unpause and pause each refused `interrupted`, nothing appended, nothing handed on');

    // Z7: the configurations handed on after a RESUME are the ones a never-paused run hands the scheduler.
    const configs = (def: FlowDefinition) => {
      const got = new Map<string, unknown>();
      const h = harness(def, { createTask: (c: { id: string }) => { got.set(c.id, structuredClone(c)); return c; } });
      return { h, got };
    };
    const ctl = configs(FAN3);
    ctl.h.driver.start({});
    ctl.h.scheduler.settle(C, 'done');
    ctl.h.scheduler.settle(A, 'done');
    ctl.h.scheduler.settle(B, 'user_action');
    ctl.h.driver.resolve(B, 'done', { actor: 'ana', result: null });
    const g3 = heldThree();
    await g3.driver.stop({ actor: 'ops' });
    const rr = configs(FAN3);
    rr.h.driver.resume(stored(g3.driver));
    rr.h.driver.unpause({ actor: 'ops' });
    equal([C2, A2, B2].map((id) => rr.got.get(id)), [C2, A2, B2].map((id) => ctl.got.get(id)),
      'each held task`s configuration, held across a stop and a resume, is the never-paused run`s');
  });

  test(DECLARED_CASES[7]!, async () => {
    const h = heldThree();
    h.scheduler.roads.set(C2, 'waiting');
    let resolved = false;
    const pr = h.driver.cancel({ actor: 'ana', reason: 'no' }).then(() => { resolved = true; });
    equal(h.scheduler.added, [A, B, C, C2, A2, B2], 'each held task HANDED ON, in dispatch order');
    equal(h.scheduler.cancels.map((c) => [c.id, c.held, c.options]), [[C2, true, { reason: 'no' }], [A2, true, { reason: 'no' }], [B2, true, { reason: 'no' }]],
      'and each cancelled AFTER its hand-off — an id the scheduler holds — with the cancel`s options');
    const log = h.log();
    equal(log.slice(log.indexOf('cancelRequested ana')), ['cancelRequested ana', `outcome ${C2} cancelled`],
      'the request, then c2`s `task.cancelled` — the waiting road settles inside the call');
    equal(fold(h.driver.foldInputs()).outcome, 'cancelling', '`cancelling` while a2 and b2 stop');
    await turn();
    equal(resolved, false, 'the promise waits');
    void h.driver.cancel({ actor: 'ana', graceMs: 5 });
    equal(h.scheduler.cancels.slice(3).map((c) => [c.id, c.options]), [[A2, { reason: 'no', graceMs: 5 }], [B2, { reason: 'no', graceMs: 5 }]],
      'a SECOND cancel forwards its graceMs to the formerly-held tasks still stopping — they are handed on, so the scheduler holds them');
    h.scheduler.finish(A2);
    h.scheduler.finish(B2);
    await pr;
    const s = fold(h.driver.foldInputs());
    equal([s.outcome, [C2, A2, B2].map((id) => s.nodes[id]!.state)], ['cancelled', ['cancelled', 'cancelled', 'cancelled']],
      '`cancelled`, every held task SETTLED BY THE SCHEDULER — none left dispatched and unsettled');
    equal(refusedBy(() => h.driver.unpause({ actor: 'ops' })).reason, 'cancelled', 'and an unpause after is refused `cancelled`');

    // A cancel raised INSIDE the unpause's hand-off (the scheduler fires on c2's own addTask): each held task gets ONE
    // cancel, after its own hand-off — none for an id the scheduler does not hold yet.
    const k = heldThree();
    k.scheduler.onAdd = (id) => { if (id === C2) void k.driver.cancel({ actor: 'ana' }); };
    k.driver.unpause({ actor: 'ops' });
    equal(k.scheduler.added.slice(3), [C2, A2, B2], 'all three handed on');
    // The cancel runs INSIDE c2's addTask: it releases a2 and b2 (handed on and cancelled within the call), and c2 — being
    // handed on when the call came — is cancelled when its addTask returns (`RN-R29` (i)), so it is the LAST cancel.
    equal(k.scheduler.cancels.map((c) => [c.id, c.held]), [[A2, true], [B2, true], [C2, true]],
      'each cancelled ONCE, each an id the scheduler held — a2 and b2 released by the cancel, c2 after its own hand-off returned');

    // A SECOND cancel raised inside the FIRST cancel's hand-off of c2 (the scheduler fires on its addTask): a2 and b2, not
    // yet handed on, are sent nothing by it — each gets one cancel, after its own hand-off.
    const q = heldThree();
    q.scheduler.onAdd = (id) => { if (id === C2) void q.driver.cancel({ actor: 'ana', graceMs: 9 }); };
    void q.driver.cancel({ actor: 'ana' });
    equal(q.scheduler.cancels.filter((c) => !c.held), [], 'no cancel for an id the scheduler did not hold');
    equal(q.scheduler.cancels.map((c) => c.id), [C2, A2, B2], 'and one per held task, each after its hand-off, in dispatch order');

    // A cancel raised on a resumed PAUSED run's `resumed` element: its in-flight set is handed on and cancelled, not held.
    const g = heldThree();
    const pg = g.driver.stop({ actor: 'ops' });
    await pg;
    const cp = stored(g.driver);
    const rc = harness(FAN3, { onFoldInput: (e: FoldInput) => { if (e.kind === 'resumed') void rc.driver.cancel({ actor: 'ana' }); } });
    rc.driver.resume(cp);
    equal([rc.scheduler.added, rc.scheduler.cancels.map((c) => [c.id, c.held])], [[C2, A2, B2], [[C2, true], [A2, true], [B2, true]]],
      'not held under the request: each handed on and cancelled, so each will settle and the run reads `cancelled`');
  });

  test(DECLARED_CASES[8]!, () => {
    const both = withCallback(LINE, (e) => e.kind === 'outcome', (d) => { d.pause({ actor: 'ops' }); void d.stop({ actor: 'bob' }); });
    both.driver.start({});
    both.scheduler.settle(X, 'done');
    equal(both.log().slice(-4), [`outcome ${X} done`, `dispatched ${Y}`, 'paused ops', 'interrupted bob'],
      'the step whole, then the pause, then the stop — in call order');
    equal(both.scheduler.cancels.map((c) => c.id), [Y], 'y, handed on in the step, cancelled by the stop');

    const un = harness(FAN3, {
      onFoldInput: (e: FoldInput) => {
        if (e.kind === 'outcome' && e.record.taskId === A) { un.driver.unpause({ actor: 'ana' }); void un.driver.stop({ actor: 'bob' }); }
      },
    });
    un.driver.start({});
    un.driver.pause({ actor: 'ops' });
    un.scheduler.settle(C, 'done');
    un.scheduler.settle(A, 'done');
    equal(un.log().slice(-4), [`outcome ${A} done`, `dispatched ${A2}`, 'unpaused ana', 'interrupted bob'], 'the unpause taken first, then the stop');
    equal(un.scheduler.added, [A, B, C, C2, A2], 'the unpause handed c2 and a2 on');
    equal(un.scheduler.cancels.map((c) => c.id), [B, C2, A2], 'and the stop cancelled every task in flight, the released ones included');
    // A stop raised on the `unpaused` element is taken AFTER the hand-off — the take is a step of its own — so every held
    // task is handed on, and then cancelled with the rest.
    const su = harness(LINE, { onFoldInput: (e: FoldInput) => { if (e.kind === 'unpaused') void su.driver.stop({ actor: 'bob' }); } });
    su.driver.start({});
    su.driver.pause({ actor: 'ops' });
    su.scheduler.settle(X, 'done');
    su.driver.unpause({ actor: 'ana' });
    equal([su.log().slice(-2), su.scheduler.added, su.scheduler.cancels.map((c) => [c.id, c.held])],
      [['unpaused ana', 'interrupted bob'], [X, Y], [[Y, true]]],
      'y handed on by the unpause, THEN the stop: its element after, and y cancelled — not left held');
    // A stop PENDING, then a pause: refused `interrupted`.
    const seen: string[] = [];
    const sp = withCallback(LINE, (e) => e.kind === 'outcome', (d) => { void d.stop({ actor: 'bob' }); seen.push(refusedBy(() => d.pause({ actor: 'ops' })).reason); });
    sp.driver.start({});
    sp.scheduler.settle(X, 'done');
    equal(seen, ['interrupted'], 'a pause after a pending stop is refused `interrupted`');
  });

  test(DECLARED_CASES[9]!, () => {
    const h = heldThree({});
    h.scheduler.onAdd = (id) => { if (id === C2) h.scheduler.settle('r1:nope:-:0', 'done'); };
    h.driver.unpause({ actor: 'ops' });
    equal(h.scheduler.added, [A, B, C, C2], 'c2 handed on, and its hand-off halted the run (ID-R4): a2 and b2 NEVER handed on');
    equal([fold(h.driver.foldInputs()).outcome, h.failures], ['halted', ['UndispatchedTask']], '`halted` (ID-R4: a settlement for an id the run never dispatched), reported once');
    // The scheduler THROWING from addTask inside the hand-off: reported AND rethrown, the run halted, the rest held.
    const t = heldThree({});
    t.scheduler.onAdd = (id) => { if (id === C2) throw new Error('pool gone'); };
    let thrown = '';
    try { t.driver.unpause({ actor: 'ops' }); } catch (x) { thrown = (x as Error).message; }
    equal([thrown, fold(t.driver.foldInputs()).outcome, t.failures.length, t.scheduler.added.slice(3)], ['pool gone', 'halted', 1, [C2]],
      'the throw reaches unpause()`s caller, the run is HALTED and reported once (start()`s and resume()`s treatment), a2 and b2 never handed on');
    // The CONTROL: the same unpause with nothing raised hands all three on.
    const c = heldThree({});
    c.driver.unpause({ actor: 'ops' });
    equal(c.scheduler.added.slice(3), [C2, A2, B2], 'the control: all three handed on');
  });

  test(DECLARED_CASES[10]!, () => {
    const a = harness(LINE);
    a.driver.start({});
    const cp = stored(a.driver);
    const r = harness(LINE, { onFoldInput: (e: FoldInput) => { if (e.kind === 'resumed') r.driver.pause({ actor: 'ops' }); } });
    r.driver.resume(cp);
    equal(r.log().slice(cp.events.length), [`resumed ${X}`, 'paused ops'], '`resumed`, then the pause — taken when resume() returned');
    equal(r.scheduler.added, [X], 'x handed on by the resume, before the pause was taken');
    r.scheduler.settle(X, 'done');
    equal(r.scheduler.added, [X], 'and y, routed after, is held');
  });

  test(DECLARED_CASES[11]!, async () => {
    // D1: a cancel raised on a HELD task's own `dispatched` element — y is handed on and cancelled, not held for ever.
    const box1: { p: Promise<void> | null } = { p: null };
    const d1 = harness(LINE, { onFoldInput: (e: FoldInput) => { if (e.kind === 'dispatched' && e.taskId === Y) box1.p = d1.driver.cancel({ actor: 'ana' }); } });
    d1.driver.start({});
    d1.driver.pause({ actor: 'ops' });
    d1.scheduler.settle(X, 'done');
    equal([d1.scheduler.added, d1.scheduler.cancels.map((c) => [c.id, c.held])], [[X, Y], [[Y, true]]],
      'y handed on after the cancel its own element carried, and cancelled after its hand-off (RN-R29 (i))');
    let done1 = false;
    void box1.p!.then(() => { done1 = true; });
    await turn();
    equal([fold(d1.driver.foldInputs()).outcome, done1], ['cancelling', false], '`cancelling` while y stops — the promise waits');
    d1.scheduler.finish(Y);
    await box1.p!;
    equal(fold(d1.driver.foldInputs()).outcome, 'cancelled', 'and `cancelled` once it has');
    // The HALT variant: a refusal on y's own element — y, the dispatch in progress, is handed on (RN-R29 (i)), not held.
    const d2 = harness(LINE, { onFoldInput: (e: FoldInput) => { if (e.kind === 'dispatched' && e.taskId === Y) d2.scheduler.settle('r1:nope:-:0', 'done'); } });
    d2.driver.start({});
    d2.driver.pause({ actor: 'ops' });
    d2.scheduler.settle(X, 'done');
    equal([fold(d2.driver.foldInputs()).outcome, d2.scheduler.added], ['halted', [X, Y]], 'halted on y`s element, and y handed on as the dispatch in progress');
  });

  test(DECLARED_CASES[12]!, () => {
    // D2: a paused run resumed, a callback on `resumed` resolving a parked task — its successor joins the END of the hold.
    const h = harness(FAN3);
    h.driver.start({});
    h.scheduler.settle(B, 'user_action');
    h.driver.pause({ actor: 'ops' });
    h.scheduler.settle(A, 'done');
    void h.driver.stop({ actor: 'ops' });
    const cp = stored(h.driver);
    const r = harness(FAN3, { onFoldInput: (e: FoldInput) => { if (e.kind === 'resumed') r.driver.resolve(B, 'done', { actor: 'ana', result: null }); } });
    r.driver.resume(cp);
    equal(r.log().slice(cp.events.length).filter((l) => !l.startsWith('branch.')), [`resumed ${C},${A2}`, `resolution ${B}`, `dispatched ${B2}`],
      'the ARRANGEMENT: `resumed` names c (running at the stop) and a2 (held), and b2 is dispatched on its callback');
    equal(r.scheduler.added, [], 'nothing handed on: the run resumed paused');
    r.driver.unpause({ actor: 'ops' });
    equal(r.scheduler.added, [C, A2, B2], 'handed on in DISPATCH ORDER — c and a2, held before `resumed`, ahead of b2');
  });

  test(DECLARED_CASES[13]!, () => {
    const boom = new Error('W178: the consumer`s store failed on the element');
    /** A harness whose `onRunFailure` keeps the whole failure, and whose `onFoldInput` is `fn` with the driver. */
    const watched = (def: FlowDefinition, fn: (d: Driver, e: FoldInput) => void) => {
      const box: { driver?: Driver } = {};
      const reported: { kind: string; message: string; cause: unknown }[] = [];
      const h = harness(def, {
        onFoldInput: (e: FoldInput) => fn(box.driver!, e),
        onRunFailure: (f: { kind: string; message: string; cause: unknown }) => reported.push({ kind: f.kind, message: f.message, cause: f.cause }),
      });
      box.driver = h.driver;
      return { ...h, reported };
    };
    const escapes = (fn: () => void): unknown => { try { fn(); } catch (x) { return x; } return null; };

    // `paused`: a pause called on x's SETTLEMENT element — a scheduler event's step — is taken when that step ends,
    // after y was handed on (RN-R35); the callback throws on the element. P35 fact 10's shape.
    const onPaused = (throws: boolean) => watched(LINE, (d, e) => {
      if (e.kind === 'outcome' && e.record.taskId === X) d.pause({ actor: 'ops' });
      if (throws && e.kind === 'paused') throw boom;
    });
    const pc = onPaused(false);
    pc.driver.start({});
    equal(escapes(() => pc.scheduler.settle(X, 'done')), null, 'the control: nothing thrown');
    equal([pc.log().slice(-2), pc.reported, pc.driver.hasFailed(), fold(pc.driver.foldInputs()).outcome],
      [[`dispatched ${Y}`, 'paused ops'], [], false, 'running'], 'the control: y handed on in the step, then `paused` — not halted');

    const pt = onPaused(true);
    pt.driver.start({});
    equal(escapes(() => pt.scheduler.settle(X, 'done')), null,
      'NOTHING leaves the scheduler event — today`s tree threw it out of the listener, an uncaught exception in node and deno');
    equal(pt.log().slice(-3), [`dispatched ${Y}`, 'paused ops', 'halted'], 'the element is in the log, and then the run`s `halted`');
    equal(pt.reported.map((f) => [f.kind, f.message, f.cause === boom]), [['Error', boom.message, true]],
      'onRunFailure hears it ONCE, carrying the consumer`s own error');
    const ps = fold(pt.driver.foldInputs());
    equal([pt.driver.hasFailed(), ps.outcome, ps.paused], [true, 'halted', true], 'the run is HALTED — OR-R10`s treatment of a throw on any other element of the step');
    pt.scheduler.settle(Y, 'done');
    equal([pt.log().at(-1), fold(pt.driver.foldInputs()).outcome], [`outcome ${Y} done`, 'halted'], 'y`s settlement is appended and routed nowhere: no `end` reached');

    // `unpaused`: FAN3 paused, c settled (c2 HELD); an unpause called on a's SETTLEMENT element is taken when that step
    // ends — a2, dispatched in the step, held too — and the callback throws on the element. The hand-off is in a
    // `finally`, so c2 and a2 ARE handed on, in dispatch order; then the run halts.
    const onUnpaused = (throws: boolean) => watched(FAN3, (d, e) => {
      if (e.kind === 'outcome' && e.record.taskId === A) d.unpause({ actor: 'ops' });
      if (throws && e.kind === 'unpaused') throw boom;
    });
    const uc = onUnpaused(false);
    uc.driver.start({});
    uc.driver.pause({ actor: 'ops' });
    uc.scheduler.settle(C, 'done');
    equal(escapes(() => uc.scheduler.settle(A, 'done')), null, 'the control: nothing thrown');
    equal([uc.log().at(-1), uc.scheduler.added, uc.reported, fold(uc.driver.foldInputs()).outcome],
      ['unpaused ops', [A, B, C, C2, A2], [], 'running'], 'the control: c2 and a2 handed on, not halted');

    const ut = onUnpaused(true);
    ut.driver.start({});
    ut.driver.pause({ actor: 'ops' });
    ut.scheduler.settle(C, 'done');
    equal(escapes(() => ut.scheduler.settle(A, 'done')), null, 'NOTHING leaves the scheduler event');
    equal(ut.log().slice(-2), ['unpaused ops', 'halted'], 'the element, then `halted`');
    equal(ut.scheduler.added, [A, B, C, C2, A2], 'the held c2 and a2 were handed on first, in dispatch order — the hand-off`s `finally`');
    equal(ut.reported.map((f) => [f.kind, f.cause === boom]), [['Error', true]], 'onRunFailure hears it once');
    const us = fold(ut.driver.foldInputs());
    equal([ut.driver.hasFailed(), us.outcome, us.paused], [true, 'halted', false], 'HALTED, and no longer paused');

    // R2 — ONCE: the SCHEDULER throwing inside that hand-off (`drainHeld` reports it and rethrows, for a caller at rest)
    // reaches the boundary already reported: onRunFailure hears it once, and nothing leaves the event.
    const sx = onUnpaused(false);
    sx.scheduler.onAdd = (id) => { if (id === C2) throw new Error('pool gone'); };
    sx.driver.start({});
    sx.driver.pause({ actor: 'ops' });
    sx.scheduler.settle(C, 'done');
    equal(escapes(() => sx.scheduler.settle(A, 'done')), null, 'NOTHING leaves the scheduler event');
    equal(sx.reported.map((f) => f.message), ['pool gone'], 'the scheduler`s throw is reported ONCE — not again at the boundary');
    equal([sx.scheduler.added, fold(sx.driver.foldInputs()).outcome], [[A, B, C, C2], 'halted'], 'c2`s addTask threw, a2 is held by the halt, the run `halted`');

    // S-1 (the maintainer's YES): a throw OUT OF failRun — the consumer's `onFoldInput` on the `halted` element itself,
    // or its `onRunFailure` — is DISCARDED at BOTH listener boundaries, AFTER the report (`OR-R10` v0.17).
    // (1) `onEvent`'s — the take's end: a throw on `paused`, then on `halted`.
    const h1 = watched(LINE, (d, e) => {
      if (e.kind === 'outcome' && e.record.taskId === X) d.pause({ actor: 'ops' });
      if (e.kind === 'paused' || e.kind === 'halted') throw boom;
    });
    h1.driver.start({});
    equal(escapes(() => h1.scheduler.settle(X, 'done')), null, 'onEvent`s boundary: the throw on `halted` does not leave the event');
    equal([h1.reported.map((f) => f.cause === boom), h1.log().slice(-2), fold(h1.driver.foldInputs()).outcome],
      [[true], ['paused ops', 'halted'], 'halted'], 'onRunFailure heard it ONCE — reported before the throw on `halted` — and the run is halted');
    // (2) `onEventStep`'s — a throw on a SETTLEMENT's element (OR-R10's own road), then on `halted`.
    const h2 = watched(LINE, (_d, e) => {
      if ((e.kind === 'outcome' && e.record.taskId === X) || e.kind === 'halted') throw boom;
    });
    h2.driver.start({});
    equal(escapes(() => h2.scheduler.settle(X, 'done')), null, 'onEventStep`s boundary: the throw on `halted` does not leave the event');
    equal([h2.reported.length, h2.log().slice(-2), h2.scheduler.added, fold(h2.driver.foldInputs()).outcome],
      [1, [`outcome ${X} done`, 'halted'], [X], 'halted'], 'reported ONCE, y never dispatched, the run halted');
    // (3) a THROWING onRunFailure, on each road: discarded, the run halted, the element in the log.
    const loud = (def: FlowDefinition, fn: (d: Driver, e: FoldInput) => void) => {
      const box: { driver?: Driver } = {};
      let heard = 0;
      const h = harness(def, {
        onFoldInput: (e: FoldInput) => fn(box.driver!, e),
        onRunFailure: () => { heard += 1; throw new Error('the consumer`s reporter is down'); },
      });
      box.driver = h.driver;
      return { ...h, heard: () => heard };
    };
    const h3 = loud(LINE, (d, e) => {
      if (e.kind === 'outcome' && e.record.taskId === X) d.pause({ actor: 'ops' });
      if (e.kind === 'paused') throw boom;
    });
    h3.driver.start({});
    equal(escapes(() => h3.scheduler.settle(X, 'done')), null, 'the take`s road: a throwing onRunFailure does not leave the event');
    equal([h3.heard(), h3.log().at(-1), fold(h3.driver.foldInputs()).outcome], [1, 'halted', 'halted'], 'called once, and the run halted');
    const h4 = loud(LINE, (_d, e) => { if (e.kind === 'outcome' && e.record.taskId === X) throw boom; });
    h4.driver.start({});
    equal(escapes(() => h4.scheduler.settle(X, 'done')), null, 'onEventStep`s road: a throwing onRunFailure does not leave the event');
    equal([h4.heard(), h4.log().at(-1), fold(h4.driver.foldInputs()).outcome], [1, 'halted', 'halted'], 'called once, and the run halted');
    // The DRIVER-CALL road is unchanged: start() refusing on its own step reports, and the throw on `halted` reaches start()`s caller.
    const h5 = watched(LINE, (_d, e) => { if ((e.kind === 'dispatched' && e.taskId === X) || e.kind === 'halted') throw boom; });
    equal([escapes(() => h5.driver.start({})), h5.reported.length, fold(h5.driver.foldInputs()).outcome], [boom, 1, 'halted'],
      'a driver call: reported once, the run halted, and the throw reaches the caller');
  });

  test(DECLARED_CASES[14]!, () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name));
    equal(ran, DECLARED_CASES, 'each declared case registered, in order, and no other — an emptied or renamed case fails here');
  });
});
