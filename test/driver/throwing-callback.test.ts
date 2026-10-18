/**
 * Ladder L2 — **a consumer callback that THROWS, on every road** — `spec/outcome-record.md` v0.19 `OR-R10`,
 * `spec/run-state.md` v0.24 `RN-R31`, `RN-R33`, `RN-R35`, `RN-R37`, [P36](../../doc/plans/p36-what-is-a-tasks-attribution-and-what-survives-a-resume.md)
 * stop-and-asks (b) and (c), P35's retro (k), [W184](../../doc/work-items/w184-a-consumer-callback-that-throws-on-every-road.md).
 *
 * **The rule, ONE, with three parts** (P36's brief to W184): a consumer `onFoldInput` throw on ANY element the driver
 * appends (i) is reported ONCE through `onRunFailure`, its `kind` the consumer's error class; (ii) HALTS the run — the
 * `halted` element appended after the element thrown on, nothing further dispatched, routed or emitted; (iii) on a
 * DRIVER CALL's step the consumer's own error is ALSO thrown at the caller — and on a scheduler event's step it is not.
 *
 * **THE SWEEP**: every driver call — `start`, `resume`, `resolve` of an ask and of a parked task, `cancel`, `stop`,
 * `pause`, `unpause` — AT REST, and each control also called MID-STEP and taken at its step's end, × a callback throwing
 * ONCE on EACH element that call's step appends. Each road's step is a HAND-WRITTEN list (`step`), derived from the
 * flow's shape and the rule that appends each element (`RN-R31`'s one `cancelRequested`, `RN-R33`'s one `interrupted`,
 * `RN-R35`'s one `paused`/`unpaused`, `RN-R22`'s `resumed`, `RN-R37`'s `asked`, `JP-R5`'s every `branch.opened` before any
 * branch is entered) — and the CONTROL, which throws nothing, must append exactly it, so the sweep's loop bound is a
 * membership the control is held to and never a count read off a run. Per element the verdict is `ok` or the list of
 * clauses that failed, so a red run names the ROAD and the ELEMENT: on the tree before W184 exactly P36 fact 11's
 * non-halting roads — R2, R4, R5-R9 and R11 — go red, and R1, R3 and R10 do not.
 *
 * **P36 (b)**: the element's own side effects survive the halt — a stop's and a cancel's cancels, an unpause's and a
 * cancel's hand-off of HELD tasks — asserted, for a throw on that element, equal to the control's. **P36 (c)**: a throw
 * on `resumed` hands NOTHING on; the lost tail keeps `ResumeRefused('halted')` (`RN-R37`).
 */
import { equal, ok, collected, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { Driver, ResumeRefused, type Checkpoint, type RunFailure } from '../../src/driver/driver.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { fold, type FoldInput } from '../../src/fold/run-state.ts';
import { liveToken } from '../../src/fold/policies.ts';
import { resumeRefusal } from '../../src/driver/driver.ts';

/** The consumer's own error class — `onRunFailure`'s `kind` must name it (`OR-R10`: the class name), read as `Boom.name`: the browser bundle renames the class. */
class Boom extends Error {}

/** L2's scheduler double: records what it is handed and cancelled, and fires only what a test tells it to. */
class Fake {
  readonly added: string[] = [];
  readonly cancels: string[] = [];
  private readonly listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(task: unknown): void { this.added.push((task as { id: string }).id); }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  /** Set to make the NEXT `cancel` throw synchronously, once — a scheduler that fails inside a cancel or a stop (R3). */
  cancelThrows: Error | null = null;
  cancel(id: string): Promise<boolean> {
    const e = this.cancelThrows;
    if (e !== null) { this.cancelThrows = null; throw e; }
    this.cancels.push(id);
    return Promise.resolve(true);
  }
  private fire(type: string, id: string, state: string): void {
    const detail = { id, state, result: state === 'done' ? { v: id } : null, error: state === 'done' ? null : 'needs a person',
      attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
    for (const fn of this.listeners.get(type) ?? []) fn({ detail });
  }
  settle(id: string, state: 'done' | 'user_action'): void {
    if (state === 'done') this.fire('task.completed', id, 'done');
    else { this.fire('task.failed', id, state); this.fire('task.user_action', id, state); }
  }
}

const flow = (flowId: string, nodes: unknown[], entry: string): FlowDefinition =>
  ({ flowId, version: 1, entry, nodes } as unknown as FlowDefinition);
/** x -> y -> done. */
const LINE = flow('throw-line', [
  { id: 'x', kind: 'task', type: 'T', edges: [{ to: 'y' }] },
  { id: 'y', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
  { id: 'done', kind: 'end', outcome: 'completed' },
], 'x');
/** split(a, b) -> collect -> done: an ENTRY fan-out, so start()'s step appends five elements. */
const TWO = flow('throw-two', [
  { id: 'split', kind: 'fanout', branches: ['a', 'b'] },
  { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
  { id: 'b', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
  { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
  { id: 'done', kind: 'end', outcome: 'completed' },
], 'split');
/** q (an ask) -> y -> done. */
const ASK = flow('throw-ask', [
  { id: 'q', kind: 'ask', edges: [{ to: 'y' }] },
  { id: 'y', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
  { id: 'done', kind: 'end', outcome: 'completed' },
], 'q');
/** split(a, b); a -> a2 -> collect; b -> b2 -> collect; collect -> done — a parked b to resolve and a HELD a2 beside it. */
const FORK = flow('throw-fork', [
  { id: 'split', kind: 'fanout', branches: ['a', 'b'] },
  { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'a2' }] },
  { id: 'b', kind: 'task', type: 'T', edges: [{ to: 'b2' }] },
  { id: 'a2', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
  { id: 'b2', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
  { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
  { id: 'done', kind: 'end', outcome: 'completed' },
], 'split');

const X = 'r1:x:-:0', Y = 'r1:y:-:0', Q = 'r1:q:-:0';
const A = 'r1:a:0:0', B = 'r1:b:1:0', A2 = 'r1:a2:0:0', B2 = 'r1:b2:1:0';

const label = (e: FoldInput): string => {
  switch (e.kind) {
    case 'dispatched': return `dispatched ${e.taskId}`;
    case 'asked': return `asked ${e.taskId}`;
    case 'outcome': return `outcome ${e.record.taskId} ${(e.record as { terminalState: string }).terminalState}`;
    case 'resolution': return `resolution ${e.record.taskId}`;
    case 'region': return `${e.event.type} ${e.event.branchPath}`;
    case 'regionEntered': return `regionEntered ${e.regionId}`;
    case 'resumed': return `resumed ${e.taskIds.join(',')}`;
    default: return e.kind;
  }
};

/** What the sweep installs as the run's `onFoldInput` for the duration of the call; `null` while the run is arranged. */
type Hook = ((e: FoldInput, seq: number) => void) | null;
interface Run {
  readonly d: Driver;
  readonly s: Fake;
  readonly failures: RunFailure[];
  /** The first position the call's step appends — `foldInputs().length` before it, or a resume's stored length. */
  readonly from: number;
  readonly call: () => unknown;
  /** `s.added.length` when `halted` was delivered, so a hand-off after the halt is visible. */
  addedAtHalt: number | null;
  /** `s.cancels.length` when `halted` was delivered — so the ORDER of the cancels and the halt is observed (A2). */
  cancelsAtHalt: number | null;
}

/** A driver over a fresh double whose `onFoldInput` is whatever `hook.on` is at the moment of the element. */
function make(def: FlowDefinition, hook: { on: Hook }, s: Fake = new Fake()): { d: Driver; s: Fake; failures: RunFailure[]; box: { addedAtHalt: number | null; cancelsAtHalt: number | null } } {
  const failures: RunFailure[] = [];
  const box: { addedAtHalt: number | null; cancelsAtHalt: number | null } = { addedAtHalt: null, cancelsAtHalt: null };
  const d = new Driver(def, {
    runId: 'r1', scheduler: s, createTask: (c) => c, predicates: new Map(), ...typesFor(['T']),
    joinPolicy: liveToken as unknown as JoinPolicy, now: () => 0,
    onFoldInput: (e, seq) => {
      if (e.kind === 'halted' && box.addedAtHalt === null) { box.addedAtHalt = s.added.length; box.cancelsAtHalt = s.cancels.length; }
      hook.on?.(e, seq);
    },
    onRunFailure: (f) => { failures.push(f); },
  });
  return { d, s, failures, box };
}

/** A checkpoint of LINE with `x` in flight, at rest — and one cut INSIDE `onFoldInput` at x's settlement (a lost tail). */
function lineCheckpoint(cutAtSettlement: boolean): Checkpoint {
  let cut: Checkpoint | null = null;
  const hook: { on: Hook } = { on: null };
  const m = make(LINE, hook);
  hook.on = (e) => { if (cutAtSettlement && e.kind === 'outcome') cut = structuredClone(m.d.checkpoint()); };
  m.d.start({});
  if (!cutAtSettlement) return structuredClone(m.d.checkpoint());
  m.s.settle(X, 'done');
  ok(cut !== null, 'fixture: the checkpoint was cut at x`s settlement');
  return cut!;
}

interface Road {
  /** P36 fact 11's row, where the road is one. */
  readonly name: string;
  /** Builds the run and ARRANGES it — nothing installed in `hook.on` yet — and names the call. */
  readonly run: (hook: { on: Hook }) => Run;
  /** A control called MID-STEP from a callback on the step's own element — raised BEFORE any throw on that element. */
  readonly raise?: (r: Run, e: FoldInput) => void;
  /** HAND-WRITTEN: every element the call's step appends, in order. */
  readonly step: readonly string[];
  /** A scheduler event's step: nothing reaches whoever fired it (rule (iii)'s other half, W178's road). */
  readonly scheduler?: boolean;
  /**
   * The element whose side effects survive the halt (P36 (b)), what reads them, and — HAND-WRITTEN — what they are; and,
   * for a stop's or a cancel's element, how many cancels are sent BEFORE `halted` (the `finally`, then the halt: A2).
   */
  readonly own?: { readonly element: string; readonly effects: (r: Run) => unknown; readonly expected: unknown; readonly cancelsBeforeHalt?: number };
  /** A stop raised on this step: taken SILENTLY after a halt (`RN-R33`), so its `interrupted` may follow `halted`. */
  readonly silentStop?: boolean;
  /** An element the replay REGENERATES past the stored events: a throw there is `ResumeRefused('halted')` (`RN-R37`). */
  readonly lostTail?: (label: string) => boolean;
  /** What else must hold for a throw on element `label`. */
  readonly also?: (label: string, r: Run) => string | null;
}

const wrap = (m: ReturnType<typeof make>, from: number, call: () => unknown): Run => {
  const r: Run = { d: m.d, s: m.s, failures: m.failures, from, call,
    get addedAtHalt() { return m.box.addedAtHalt; }, get cancelsAtHalt() { return m.box.cancelsAtHalt; } } as Run;
  return r;
};

const ROADS: readonly Road[] = [
  {
    name: 'R1 — start(), an ENTRY fan-out of two: the CONTROL road (halting before W184)',
    run: (hook) => { const m = make(TWO, hook); return wrap(m, 0, () => m.d.start({})); },
    step: ['regionEntered split', 'branch.opened 0', 'branch.opened 1', `dispatched ${A}`, `dispatched ${B}`],
  },
  {
    name: 'R2 and R3 — resolve() of an ASK at rest: its `resolution`, then its successor`s `dispatched`',
    run: (hook) => {
      const m = make(ASK, hook);
      m.d.start({});
      return wrap(m, m.d.foldInputs().length, () => m.d.resolve(Q, 'done', { result: { ok: true }, actor: 'ana' }));
    },
    step: [`resolution ${Q}`, `dispatched ${Y}`],
  },
  {
    name: 'R4 — resolve() of a PARKED TASK at rest: its `resolution`, then its successor`s `dispatched`',
    run: (hook) => {
      const m = make(LINE, hook);
      m.d.start({});
      m.s.settle(X, 'user_action');
      return wrap(m, m.d.foldInputs().length, () => m.d.resolve(X, 'done', { result: { ok: true }, actor: 'ana' }));
    },
    step: [`resolution ${X}`, `dispatched ${Y}`],
  },
  {
    name: 'R5 — a PAUSE raised mid-step on resolve()`s step, TAKEN at its end (RN-R35)',
    run: (hook) => {
      const m = make(LINE, hook);
      m.d.start({});
      m.s.settle(X, 'user_action');
      return wrap(m, m.d.foldInputs().length, () => m.d.resolve(X, 'done', { result: { ok: true }, actor: 'ana' }));
    },
    raise: (r, e) => { if (e.kind === 'resolution') r.d.pause({ actor: 'ops' }); },
    step: [`resolution ${X}`, `dispatched ${Y}`, 'paused'],
  },
  {
    name: 'R6 — pause() AT REST',
    run: (hook) => { const m = make(LINE, hook); m.d.start({}); return wrap(m, m.d.foldInputs().length, () => m.d.pause({ actor: 'ops' })); },
    step: ['paused'],
  },
  {
    name: 'R7 — unpause() AT REST, a task HELD: its hand-off survives the halt (P36 (b))',
    run: (hook) => {
      const m = make(LINE, hook);
      m.d.start({});
      m.d.pause({ actor: 'ops' });
      m.s.settle(X, 'done');
      return wrap(m, m.d.foldInputs().length, () => m.d.unpause({ actor: 'ops' }));
    },
    step: ['unpaused'],
    // x handed on at start; y dispatched while paused, HELD, and handed on by the unpause.
    own: { element: 'unpaused', effects: (r) => r.s.added, expected: [X, Y] },
  },
  {
    name: 'R8 — stop() AT REST: its cancels survive the halt (P36 (b)), and the run is NOT resumable',
    run: (hook) => { const m = make(LINE, hook); m.d.start({}); return wrap(m, m.d.foldInputs().length, () => m.d.stop({ actor: 'ops' })); },
    step: ['interrupted'],
    // x, the one task in flight, is cancelled.
    own: { element: 'interrupted', effects: (r) => r.s.cancels, expected: [X], cancelsBeforeHalt: 1 },
    also: (_l, r) => (resumeRefusal(LINE, r.d.checkpoint())?.reason === 'halted' ? null : 'the checkpoint is not refused `halted`'),
  },
  {
    name: 'R9 — cancel() AT REST: its cancels survive the halt (P36 (b))',
    run: (hook) => { const m = make(LINE, hook); m.d.start({}); return wrap(m, m.d.foldInputs().length, () => m.d.cancel({ actor: 'ana' })); },
    step: ['cancelRequested'],
    own: { element: 'cancelRequested', effects: (r) => r.s.cancels, expected: [X], cancelsBeforeHalt: 1 },
  },
  {
    name: 'R9 — cancel() AT REST of a PAUSED run, a task HELD: handed on and cancelled through the halt (P36 (b))',
    run: (hook) => {
      const m = make(LINE, hook);
      m.d.start({});
      m.d.pause({ actor: 'ops' });
      m.s.settle(X, 'done');
      return wrap(m, m.d.foldInputs().length, () => m.d.cancel({ actor: 'ana' }));
    },
    step: ['cancelRequested'],
    // x settled; y HELD — handed on by the cancel, then cancelled (P34 (c)).
    own: { element: 'cancelRequested', effects: (r) => [r.s.added, r.s.cancels], expected: [[X, Y], [Y]], cancelsBeforeHalt: 1 },
  },
  {
    name: 'R10 — a SCHEDULER EVENT`s step: reported once and halted, and NOTHING reaches whoever fired it (W178`s road, unchanged)',
    run: (hook) => { const m = make(LINE, hook); m.d.start({}); return wrap(m, m.d.foldInputs().length, () => m.s.settle(X, 'done')); },
    step: [`outcome ${X} done`, `dispatched ${Y}`],
    scheduler: true,
  },
  {
    name: 'R11 — resume() AT REST, a task in flight: a throw on `resumed` hands NOTHING on (P36 (c))',
    run: (hook) => {
      const cp = lineCheckpoint(false);
      const m = make(LINE, hook);
      return wrap(m, cp.events.length, () => m.d.resume(cp));
    },
    step: [`resumed ${X}`],
    also: (l, r) => (l.startsWith('resumed') && r.s.added.length !== 0 ? `handed on ${JSON.stringify(r.s.added)}` : null),
  },
  {
    name: 'R11 — resume() of a checkpoint cut mid-step: a throw in the LOST TAIL keeps ResumeRefused(halted) (RN-R37); on `resumed` the consumer`s error (P36 (c))',
    run: (hook) => {
      const cp = lineCheckpoint(true);
      const m = make(LINE, hook);
      return wrap(m, cp.events.length, () => m.d.resume(cp));
    },
    step: [`dispatched ${Y}`, `resumed ${Y}`],
    lostTail: (l) => l.startsWith('dispatched'),
    also: (_l, r) => (r.s.added.length !== 0 ? `handed on ${JSON.stringify(r.s.added)}` : null),
  },
  {
    name: 'mid-step — a STOP raised on start()`s step, taken at its end: its cancels survive the halt',
    run: (hook) => { const m = make(LINE, hook); return wrap(m, 0, () => m.d.start({})); },
    raise: (r, e) => { if (e.kind === 'dispatched') void r.d.stop({ actor: 'ops' }); },
    step: [`dispatched ${X}`, 'interrupted'],
    // x is handed on in the step and cancelled when the stop is taken at its end (`RN-R29` (i)).
    own: { element: 'interrupted', effects: (r) => r.s.cancels, expected: [X], cancelsBeforeHalt: 1 },
    silentStop: true,
  },
  {
    name: 'mid-step — a CANCEL raised on start()`s step, appended where it is called',
    run: (hook) => { const m = make(LINE, hook); return wrap(m, 0, () => m.d.start({})); },
    raise: (r, e) => { if (e.kind === 'dispatched') void r.d.cancel({ actor: 'ana' }); },
    step: [`dispatched ${X}`, 'cancelRequested'],
  },
  {
    name: 'mid-step — an ANSWER given on start()`s step, on the `asked` element, taken at its end (RN-R37)',
    run: (hook) => { const m = make(ASK, hook); return wrap(m, 0, () => m.d.start({})); },
    raise: (r, e) => { if (e.kind === 'asked') r.d.resolve(Q, 'done', { result: { ok: true }, actor: 'ana' }); },
    step: [`asked ${Q}`, `resolution ${Q}`, `dispatched ${Y}`],
  },
  {
    name: 'mid-step — a PAUSE raised on resume()`s `resumed` element, taken when resume() returns',
    run: (hook) => {
      const cp = lineCheckpoint(false);
      const m = make(LINE, hook);
      return wrap(m, cp.events.length, () => m.d.resume(cp));
    },
    raise: (r, e) => { if (e.kind === 'resumed') r.d.pause({ actor: 'ops' }); },
    step: [`resumed ${X}`, 'paused'],
  },
  {
    name: 'mid-step — an UNPAUSE raised on resolve()`s step of a PAUSED run, taken at its end: its hand-off survives the halt',
    run: (hook) => {
      const m = make(FORK, hook);
      m.d.start({});
      m.s.settle(B, 'user_action');
      m.d.pause({ actor: 'ops' });
      m.s.settle(A, 'done');
      return wrap(m, m.d.foldInputs().length, () => m.d.resolve(B, 'done', { result: { ok: true }, actor: 'ana' }));
    },
    raise: (r, e) => { if (e.kind === 'resolution') r.d.unpause({ actor: 'ops' }); },
    step: [`resolution ${B}`, 'branch.resumed 1', `dispatched ${B2}`, 'unpaused'],
    // a and b at start; a2 held when a settled; b2 dispatched in the step, HELD; the unpause hands a2 then b2 on.
    own: { element: 'unpaused', effects: (r) => r.s.added, expected: [A, B, A2, B2] },
  },
  // ONCE, at each boundary a halt can reach TWICE: a cancel() called from a callback appends its element where it is
  // called and HALTS the run at its own boundary when that element throws — and the throw then leaves the callback,
  // through the step that called it, to that step's own boundary, which must not report it again.
  {
    name: 'mid-step — a CANCEL raised on resolve()`s step, on its successor`s `dispatched` (ONCE at resolve()`s routing boundary)',
    run: (hook) => {
      const m = make(LINE, hook);
      m.d.start({});
      m.s.settle(X, 'user_action');
      return wrap(m, m.d.foldInputs().length, () => m.d.resolve(X, 'done', { result: { ok: true }, actor: 'ana' }));
    },
    raise: (r, e) => { if (e.kind === 'dispatched') void r.d.cancel({ actor: 'ana' }); },
    step: [`resolution ${X}`, `dispatched ${Y}`, 'cancelRequested'],
  },
  {
    name: 'mid-step — a CANCEL raised on resume()`s `resumed` element (ONCE at resume()`s hand-off boundary)',
    run: (hook) => {
      const cp = lineCheckpoint(false);
      const m = make(LINE, hook);
      return wrap(m, cp.events.length, () => m.d.resume(cp));
    },
    raise: (r, e) => { if (e.kind === 'resumed') void r.d.cancel({ actor: 'ana' }); },
    step: [`resumed ${X}`, 'cancelRequested'],
  },
  {
    name: 'mid-step — an ANSWER given on start()`s step and a CANCEL on its successor`s `dispatched` (ONCE at the taken answer`s routing boundary)',
    run: (hook) => { const m = make(ASK, hook); return wrap(m, 0, () => m.d.start({})); },
    raise: (r, e) => {
      if (e.kind === 'asked') r.d.resolve(Q, 'done', { result: { ok: true }, actor: 'ana' });
      if (e.kind === 'dispatched') void r.d.cancel({ actor: 'ana' });
    },
    step: [`asked ${Q}`, `resolution ${Q}`, `dispatched ${Y}`, 'cancelRequested'],
  },
  // C1 (the readers' blocker): a SECOND, non-throwing call pending BEHIND the one thrown on. The first throw halts the run
  // at its own element, so the call behind it is DROPPED by its halted guard — never taken, its successor never handed on
  // to a scheduler for a run reported halted. Before the fix the halt landed at the boundary and the second was taken.
  {
    name: 'C1 — on resolve()`s step an UNPAUSE and then an ANSWER pending: a throw on either halts there, and what is behind it is DROPPED',
    run: (hook) => {
      const m = make(FORK, hook);
      m.d.start({});
      m.s.settle(A, 'user_action');
      m.s.settle(B, 'user_action');
      m.d.pause({ actor: 'ops' });
      return wrap(m, m.d.foldInputs().length, () => m.d.resolve(A, 'done', { result: { ok: true }, actor: 'ana' }));
    },
    raise: (r, e) => {
      if (e.kind === 'resolution' && e.record.taskId === A) { r.d.unpause({ actor: 'ops' }); r.d.resolve(B, 'done', { result: { ok: true }, actor: 'ana' }); }
    },
    // a's resolution routes to a2, HELD (still paused); the unpause hands a2 on; b's answer, taken behind it, routes to b2.
    step: [`resolution ${A}`, 'branch.resumed 0', `dispatched ${A2}`, 'unpaused', `resolution ${B}`, 'branch.resumed 1', `dispatched ${B2}`],
    // the unpause's own hand-off — a2, held — survives a throw on its element; b2, the dropped answer's, is never handed on
    // (the sweep's *nothing handed on after the halt*).
    own: { element: 'unpaused', effects: (r) => r.s.added.filter((id) => id === A2), expected: [A2] },
  },
  {
    name: 'C1 — on a SCHEDULER EVENT`s step a PAUSE and then an ANSWER pending: a throw on either halts there, and what is behind it is DROPPED',
    run: (hook) => {
      const m = make(FORK, hook);
      m.d.start({});
      m.s.settle(B, 'user_action');
      return wrap(m, m.d.foldInputs().length, () => m.s.settle(A, 'done'));
    },
    raise: (r, e) => {
      if (e.kind === 'outcome' && e.record.taskId === A) { r.d.pause({ actor: 'ops' }); r.d.resolve(B, 'done', { result: { ok: true }, actor: 'ana' }); }
    },
    // a settles and routes to a2, handed on in the step; the pause is taken at its end, then b's answer, routing to b2 HELD.
    step: [`outcome ${A} done`, `dispatched ${A2}`, 'paused', `resolution ${B}`, 'branch.resumed 1', `dispatched ${B2}`],
    scheduler: true,
  },  {
    name: 'C1 — on start()`s step an ANSWER and then a PAUSE pending: a throw on the answer`s resolution halts there, and the pause behind it is DROPPED',
    run: (hook) => { const m = make(ASK, hook); return wrap(m, 0, () => m.d.start({})); },
    raise: (r, e) => {
      if (e.kind === 'asked') { r.d.resolve(Q, 'done', { result: { ok: true }, actor: 'ana' }); r.d.pause({ actor: 'ops' }); }
    },
    // the answer, taken first, routes to y — handed on (not yet paused); the pause is taken behind it.
    step: [`asked ${Q}`, `resolution ${Q}`, `dispatched ${Y}`, 'paused'],
  },
];

/** One road's sweep: the control, then one run per element of its step with the callback throwing ONCE on it. */
function sweep(road: Road): { control: string; verdicts: string[] } {
  // THE CONTROL — nothing throws.
  const hook: { on: Hook } = { on: null };
  const c = road.run(hook);
  hook.on = (e) => road.raise?.(c, e);
  let controlThrew: unknown = null;
  try { c.call(); } catch (e) { controlThrew = e; }
  const got = c.d.foldInputs().slice(c.from).map(label);
  const control = JSON.stringify({ step: got, threw: controlThrew === null ? null : String(controlThrew),
    failures: c.failures.length, halted: c.d.hasFailed(), effects: road.own ? road.own.effects(c) : null });
  const ownEffects = road.own ? JSON.stringify(road.own.expected) : null;

  const verdicts = road.step.map((element, k) => {
    const boom = new Boom(`the consumer's store failed on ${element}`);
    const h: { on: Hook } = { on: null };
    const r = road.run(h);
    let threw = false;
    // Where `halted` must land: right after the element thrown on — after whatever the raiser appended on that same
    // callback before the throw (a cancel raised there is appended in the call).
    let haltAt = -1;
    h.on = (e, seq) => {
      road.raise?.(r, e);
      if (!threw && seq === r.from + k) { threw = true; haltAt = r.d.foldInputs().length; throw boom; }
    };
    let err: unknown = null;
    try { r.call(); } catch (e) { err = e; }
    const bad: string[] = [];
    const seqs = r.d.foldInputs().map(label);
    if (!threw) bad.push('the callback never threw');
    if (seqs[r.from + k] !== element) bad.push(`position ${r.from + k} is ${seqs[r.from + k]}`);
    // (iii) the throw at the caller — the consumer's own error, or, in a resume's lost tail, `ResumeRefused('halted')` —
    // and on a scheduler event's step nothing escaping.
    if (road.scheduler) {
      if (err !== null) bad.push(`escaped ${String(err)}`);
    } else if (road.lostTail?.(element)) {
      if (!(err instanceof ResumeRefused && err.reason === 'halted')) bad.push(`the lost tail threw ${String(err)}, not ResumeRefused(halted)`);
    } else if (err !== boom) {
      bad.push(`the caller got ${String(err)}`);
    }
    // (i) reported ONCE, under the consumer's class.
    if (r.failures.length !== 1) bad.push(`${r.failures.length} reports`);
    else if (r.failures[0]!.kind !== Boom.name || r.failures[0]!.cause !== boom) bad.push(`reported ${r.failures[0]!.kind}`);
    // (ii) HALTED: the element after the one thrown on, and nothing dispatched, routed, emitted or handed on after it.
    if (!r.d.hasFailed()) bad.push('not hasFailed()');
    const outcome = fold(r.d.foldInputs()).outcome;
    if (outcome !== 'halted') bad.push(`folds ${outcome}`);
    // ... IMMEDIATELY after the element thrown on (C4), and NOTHING after it in that step — but a stop raised on the step,
    // which `RN-R33` takes even after a halt, silently (P36's brief point 5).
    const at = seqs.indexOf('halted');
    if (at !== haltAt) bad.push(`halted at ${at}, not right after the element (${haltAt})`);
    const after = at === -1 ? [] : seqs.slice(at + 1).filter((l) => !(road.silentStop && l === 'interrupted'));
    if (after.length) bad.push(`after halted: ${JSON.stringify(after)}`);
    if (r.addedAtHalt !== null && r.s.added.length !== r.addedAtHalt) bad.push(`handed on after the halt: ${JSON.stringify(r.s.added.slice(r.addedAtHalt))}`);
    // (b)'s ORDER (A2): a stop's or a cancel's cancels are sent in the element's `finally`, BEFORE the halt.
    if (road.own?.cancelsBeforeHalt !== undefined && road.own.element === element && r.cancelsAtHalt !== road.own.cancelsBeforeHalt) {
      bad.push(`${String(r.cancelsAtHalt)} cancel(s) sent before \`halted\`, not ${road.own.cancelsBeforeHalt}`);
    }
    // (b) the element's own side effects, made in a `finally`, equal to the control's.
    if (road.own && road.own.element === element.split(' ')[0] && JSON.stringify(road.own.effects(r)) !== ownEffects) {
      bad.push(`side effects ${JSON.stringify(road.own.effects(r))}, expected ${ownEffects}`);
    }
    const also = road.also?.(element, r);
    if (also) bad.push(also);
    return bad.length === 0 ? 'ok' : `${element}: ${bad.join('; ')}`;
  });
  return { control, verdicts };
}

const SUITE = 'L2 — OR-R10 v0.19: a consumer callback that THROWS on any element a step appends — reported once, the run halted, and on a driver call the throw at the caller (P35 (k))';
const DECLARED_CASES = [
  ...ROADS.map((r) => `the SWEEP — ${r.name}`),
  'ONCE (P36 brief 5): a step whose callback throws TWICE — the FIRST throw halts and is the one reported AND thrown: a pause and a stop pending, both throwing, the stop taken silently after the halt; and a throw on the step`s own element with a stop pending, the same',
  'R3: a SCHEDULER throwing inside a call`s accepted step — cancel()`s cancels, and a stop`s at rest — halts the run, reported once, its error at the caller',
  'P36 (c): a run halted on its `resumed` element is a checkpoint refused `halted` if resumed again — and the halt hands on nothing of a PAUSED resume either',
  'a REFUSED call halts nothing: a refusal raised before the call is accepted — RunControlRefused, BoundaryRefused, a second answer — appends nothing and reports nothing',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  ROADS.forEach((road, i) => {
    test(DECLARED_CASES[i]!, () => {
      const { control, verdicts } = sweep(road);
      // The CONTROL appends exactly the hand-written step, throws nothing and halts nothing — so the sweep below visits
      // every element of it and no other (the loop bound is this membership, never a count off a run).
      equal(JSON.parse(control), { step: road.step, threw: null, failures: 0, halted: false, effects: road.own ? road.own.expected : null },
        `${road.name}: the control appends exactly the hand-written step, makes exactly the hand-written side effects, and throws, reports and halts nothing`);
      equal(verdicts, road.step.map(() => 'ok'), `${road.name}: a throw on EACH element is reported once, halts the run and reaches the caller`);
    });
  });

  test(DECLARED_CASES[ROADS.length]!, () => {
    // THE RULE (P36's brief points 1 and 5, `OR-R10` v0.19): the FIRST throw halts the run — `halted` right after its
    // element — and is the error reported AND the error at the caller; a pause or an answer pending behind it is dropped,
    // and a stop pending behind it is taken (`RN-R33`: even after a halt) SILENTLY — its own throw reported nowhere.
    // (1) A pause AND a stop called on the resolution's element, both pending at resolve()'s end; the callback throws on
    // `paused` and on `interrupted`.
    const p1 = new Boom('on paused'), p2 = new Boom('on interrupted');
    const hook: { on: Hook } = { on: null };
    const m = make(LINE, hook);
    m.d.start({});
    m.s.settle(X, 'user_action');
    hook.on = (e) => {
      if (e.kind === 'resolution') { m.d.pause({ actor: 'ops' }); void m.d.stop({ actor: 'ops' }); }
      if (e.kind === 'paused') throw p1;
      if (e.kind === 'interrupted') throw p2;
    };
    let err: unknown = null;
    try { m.d.resolve(X, 'done', { result: null, actor: 'ana' }); } catch (e) { err = e; }
    equal(m.d.foldInputs().map(label).slice(-5), [`resolution ${X}`, `dispatched ${Y}`, 'paused', 'halted', 'interrupted'],
      'halted right after `paused`, the first element thrown on; the stop taken after the halt');
    equal([m.failures.length, m.failures[0]?.cause === p1, err === p1], [1, true, true],
      'ONE report — the FIRST throw`s — and it is the error the caller receives; the stop`s throw is discarded');
    // x is PARKED, not in flight; y was handed on in the step (the pause is taken after it) — so the stop cancels y alone.
    equal([m.s.added, m.s.cancels, fold(m.d.foldInputs()).outcome], [[X, Y], [Y], 'halted'],
      'the stop`s cancel was sent for the one task in flight; the run is halted');

    // (2) A throw on the step's OWN element halts the run there; the stop pending on it is TAKEN after the halt
    // (`RN-R33`: taken even if the step halted the run) and its own throw is NOT reported again.
    const q1 = new Boom('on resolution'), q2 = new Boom('on interrupted');
    const hook2: { on: Hook } = { on: null };
    const n = make(LINE, hook2);
    n.d.start({});
    n.s.settle(X, 'user_action');
    hook2.on = (e) => {
      if (e.kind === 'resolution') { void n.d.stop({ actor: 'ops' }); throw q1; }
      if (e.kind === 'interrupted') throw q2;
    };
    let err2: unknown = null;
    try { n.d.resolve(X, 'done', { result: null, actor: 'ana' }); } catch (e) { err2 = e; }
    equal(n.d.foldInputs().map(label).slice(-3), [`resolution ${X}`, 'halted', 'interrupted'],
      'halted on the resolution, nothing routed, the stop taken after it');
    equal([n.failures.length, n.failures[0]?.cause === q1], [1, true], 'ONE report — the first throw`s');
    equal(err2, q1, 'and the first throw is what leaves resolve(): the stop`s, taken silently, is discarded');
    equal(fold(n.d.foldInputs()).outcome, 'halted', 'halted outranks interrupted');
  });

  test(DECLARED_CASES[ROADS.length + 1]!, async () => {
    // R3 (`OR-R10` v0.19): once a call is accepted, ANY throw that reaches its boundary halts — the scheduler's too. A
    // double whose `cancel` throws synchronously, once: at rest, a cancel's sends and a stop's cancels each meet it AFTER
    // the element, and the run is halted, reported once under the scheduler's error class, that error at the caller.
    class SchedulerDown extends Error {}
    for (const call of ['cancel', 'stop'] as const) {
      const m = make(LINE, { on: null });
      m.d.start({});
      const down = new SchedulerDown(`the scheduler failed inside ${call}`);
      m.s.cancelThrows = down;
      let err: unknown = null;
      try { void (call === 'cancel' ? m.d.cancel({ actor: 'ana' }) : m.d.stop({ actor: 'ops' })); } catch (e) { err = e; }
      const element = call === 'cancel' ? 'cancelRequested' : 'interrupted';
      equal(err, down, `${call}: the scheduler's error reaches the caller`);
      equal(m.d.foldInputs().map(label).slice(-2), [element, 'halted'], `${call}: the element, then \`halted\``);
      equal([m.failures.map((f) => [f.kind, f.cause === down]), fold(m.d.foldInputs()).outcome], [[[SchedulerDown.name, true]], 'halted'],
        `${call}: reported ONCE under the scheduler's class, the run halted`);
    }
    // And a stop's promise still SETTLES when its cancel throws (`taken()` in its own `finally`): a stop called MID-STEP,
    // and a second call made while it is pending, whose promise waits on the take — taken at start()'s end, where the
    // scheduler's `cancel` throws.
    const hook: { on: Hook } = { on: null };
    const m = make(LINE, hook);
    let second: Promise<void> | null = null;
    hook.on = (e) => {
      if (e.kind === 'dispatched' && second === null) { void m.d.stop({ actor: 'ops' }); second = m.d.stop({ actor: 'ops' }); }
    };
    const down = new SchedulerDown('the scheduler failed inside the stop taken at the step`s end');
    m.s.cancelThrows = down;
    let err: unknown = null;
    try { m.d.start({}); } catch (e) { err = e; }
    equal([err === down, m.failures.length, fold(m.d.foldInputs()).outcome], [true, 1, 'halted'], 'start(): the scheduler`s error, once, halted');
    const settled = await Promise.race([second!.then(() => 'settled'), new Promise<string>((r) => setTimeout(() => r('PENDING'), 200))]);
    equal(settled, 'settled', 'and the second call`s promise, waiting on the take, settles');
  });

  test(DECLARED_CASES[ROADS.length + 2]!, () => {
    // A run halted on its `resumed` element: its checkpoint holds `resumed` then `halted`, and a resume of IT is refused
    // `halted` there (`RN-R23`) — by the pure function and by a fresh driver.
    const cp = lineCheckpoint(false);
    const hook: { on: Hook } = { on: (e) => { if (e.kind === 'resumed') throw new Boom('on resumed'); } };
    const m = make(LINE, hook);
    let err: unknown = null;
    try { m.d.resume(cp); } catch (e) { err = e; }
    ok(err instanceof Boom, `the consumer's error at resume()'s caller, got ${String(err)}`);
    const again = structuredClone(m.d.checkpoint());
    equal(again.events.map(label), [`dispatched ${X}`, `resumed ${X}`, 'halted'], 'the checkpoint: the stored run, `resumed`, `halted`');
    equal(resumeRefusal(LINE, again)?.reason, 'halted', 'refused `halted` by the pure function');
    const fresh = make(LINE, { on: null });
    let refused: unknown = null;
    try { fresh.d.resume(again); } catch (e) { refused = e; }
    ok(refused instanceof ResumeRefused && refused.reason === 'halted' && refused.index === 2, `and by a driver, at position 2: ${String(refused)}`);
    equal(fresh.s.added, [], 'nothing handed on');

    // A PAUSED checkpoint: the in-flight set is held again, and a throw on `resumed` hands none of it on — nor does a
    // later unpause, refused `halted`.
    const pm = make(LINE, { on: null });
    pm.d.start({});
    pm.d.pause({ actor: 'ops' });
    const pcp = structuredClone(pm.d.checkpoint());
    const ph = make(LINE, { on: (e) => { if (e.kind === 'resumed') throw new Boom('on resumed'); } });
    let perr: unknown = null;
    try { ph.d.resume(pcp); } catch (e) { perr = e; }
    ok(perr instanceof Boom, 'the consumer`s error');
    equal([ph.s.added, ph.failures.length, fold(ph.d.foldInputs()).outcome], [[], 1, 'halted'], 'nothing handed on, reported once, halted');
    let unpaused: unknown = null;
    try { ph.d.unpause({ actor: 'ops' }); } catch (e) { unpaused = e; }
    ok(unpaused instanceof Error && unpaused.name === 'RunControlRefused' && (unpaused as { reason?: string }).reason === 'halted',
      `and an unpause is refused \`halted\`, handing nothing on: ${String(unpaused)}`);
    equal(ph.s.added, [], 'still nothing handed on');
  });

  test(DECLARED_CASES[ROADS.length + 3]!, () => {
    // The CONTROL beside the rule: a call refused BEFORE it is accepted is a rejected command — nothing appended,
    // nothing reported, not halted — whatever the callback would have done.
    // A second pause, refused `paused` — the callback, installed to throw on ANY element, is never called.
    const hook: { on: Hook } = { on: null };
    const m = make(ASK, hook);
    m.d.start({});
    m.d.pause({ actor: 'ops' });
    const before = m.d.foldInputs().length;
    hook.on = () => { throw new Boom('never reached: nothing is appended'); };
    let refused: unknown = null;
    try { m.d.pause({ actor: 'ops' }); } catch (e) { refused = e; }
    ok(refused !== null && (refused as Error).name === 'RunControlRefused', `a second pause refused: ${String(refused)}`);
    equal([m.d.foldInputs().length, m.failures.length, m.d.hasFailed()], [before, 0, false], 'nothing appended, reported or halted');
    // An answer refused by its schema — BoundaryRefused, nothing appended.
    const schemaAsk = flow('throw-ask-schema', [
      { id: 'q', kind: 'ask', answerSchema: { type: 'object', required: ['ok'] }, edges: [{ to: 'y' }] },
      { id: 'y', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ], 'q');
    const sh: { on: Hook } = { on: null };
    const sa = make(schemaAsk, sh);
    sa.d.start({});
    const n0 = sa.d.foldInputs().length;
    sh.on = () => { throw new Boom('never reached: nothing is appended'); };
    let br: unknown = null;
    try { sa.d.resolve(Q, 'done', { result: {}, actor: 'ana' }); } catch (e) { br = e; }
    ok(br !== null && (br as Error).name === 'BoundaryRefused', `refused by its schema: ${String(br)}`);
    equal([sa.d.foldInputs().length, sa.failures.length, sa.d.hasFailed()], [n0, 0, false], 'nothing appended, reported or halted');
  });

  test(DECLARED_CASES[ROADS.length + 4]!, () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name));
    equal(ran, DECLARED_CASES, 'each declared case registered, in order, and no other — an emptied or renamed case fails here');
  });
});
