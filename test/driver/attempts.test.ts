/**
 * Ladder L2 — **a task's ATTEMPTS, recorded and carried across a resume** — `spec/run-state.md` v0.26 `RN-R40` (and
 * `RN-R19`'s seventh fed kind, `RN-R21`'s `attemptsSpent`),
 * [ADR 0113](../../doc/decisions/0113-a-tasks-attempts-are-recorded-and-carried-across-a-resume.md),
 * [P36](../../doc/plans/p36-what-is-a-tasks-attribution-and-what-survives-a-resume.md) stop-and-asks (f)-(i),
 * [W186](../../doc/work-items/w186-attempts-recorded-and-carried-across-a-resume.md).
 *
 * **The contract, as P36 answered it**: (f) one FED fold input `{ kind: 'attempted', taskId, attemptNumber }` per
 * `task.running` of a task THIS run dispatched, ONLY when the number exceeds the last recorded for that task (a requeue
 * repeats its number and appends nothing), for every task; (g) a resume re-hands each in-flight task with `attemptsSpent` the
 * highest number recorded — absent at 0, present for a task with no `retryPolicy` too, a spent budget handed on all the
 * same; (h) a stopped attempt counts, as a kill does. And the reading this item adds (its R1, from the scheduler's own
 * behaviour at the pin): an attempt heard on the driver's OWN step — an inline pool fires `task.running` inside `addTask` —
 * is appended when that step ENDS, so the element lies between two steps, where the replay feeds it.
 *
 * **The double plays the scheduler's attempt numbering** (its `AGENTS.md` §5: `attemptNumber` 1-based, `attempts + 1` at
 * dispatch, a requeue repeating its number) and, in its INLINE mode, fires `task.running` synchronously inside `addTask`
 * with `(attemptsSpent ?? 0) + 1` — the measured shape of an inline pool (W186's declaration step, M3). Every expected value
 * is written from the rule and the flow's shape, never read off a run; each claim beside a CONTROL showing its observer live.
 */
import { collected, equal, ok, suite, throws } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { Driver, ResumeRefused, type Checkpoint, type RunFailure, type UnmintedTask } from '../../src/driver/driver.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { fold, type FoldInput } from '../../src/fold/run-state.ts';
import { liveToken } from '../../src/fold/policies.ts';

/** The consumer's own error class — read as `AttemptBoom.name`, because the browser bundle renames classes. */
class AttemptBoom extends Error {}

type Config = { id: string; attemptsSpent?: unknown; retryPolicy?: unknown };

/** L2's scheduler double: what it was handed, what it fired, and the scheduler's attempt numbering on demand. */
class AttemptFake {
  readonly added: Config[] = [];
  readonly fired: string[] = [];
  readonly cancels: string[] = [];
  /** INLINE mode: `task.running` fired synchronously INSIDE `addTask`, numbered `(attemptsSpent ?? 0) + 1`. */
  inline = false;
  private readonly listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(task: unknown): void {
    const t = task as Config;
    this.added.push(t);
    if (this.inline) this.running(t.id, (typeof t.attemptsSpent === 'number' ? t.attemptsSpent : 0) + 1);
  }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  private emit(type: string, detail: unknown): void { for (const fn of this.listeners.get(type) ?? []) fn({ detail }); }
  /** An attempt STARTS — the task's detail with the scheduler's number, and `attempts` one less, as at dispatch. */
  running(id: unknown, attemptNumber: unknown): void {
    this.fired.push(`task.running ${String(id)} ${String(attemptNumber)}`);
    this.emit('task.running', { id, state: 'running', attemptNumber, attempts: typeof attemptNumber === 'number' ? attemptNumber - 1 : 0, timestamp: 1 });
  }
  settle(id: string, state: 'done' | 'user_action', attempts = 0): void {
    this.fired.push(`settle ${id} ${state}`);
    const detail = { id, state, result: state === 'done' ? { v: id } : null, error: state === 'done' ? undefined : 'boom', attempts, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
    if (state === 'done') this.emit('task.completed', detail);
    else { this.emit('task.failed', detail); this.emit('task.user_action', detail); }
  }
  /** The scheduler's RUNNING road, never settling here: a stopped driver hears nothing anyway. */
  cancel(id: string): Promise<boolean> { this.cancels.push(id); return Promise.resolve(true); }
}

const flow = (flowId: string, nodes: unknown[], entry: string): FlowDefinition =>
  ({ flowId, version: 1, entry, nodes } as unknown as FlowDefinition);
/** x -> y -> done; neither declares a retryPolicy. */
const LINE = flow('att-line', [
  { id: 'x', kind: 'task', type: 'T', edges: [{ to: 'y' }] },
  { id: 'y', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
  { id: 'done', kind: 'end', outcome: 'completed' },
], 'x');
/** An entry fan-out of THREE whose branches declare: nothing, `maxRetries: 0`, and a budget of two retries. */
const THREE = flow('att-three', [
  { id: 'split', kind: 'fanout', branches: ['a', 'b', 'c'] },
  { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
  { id: 'b', kind: 'task', type: 'T', retryPolicy: { maxRetries: 0, backoffMs: 0 }, edges: [{ to: 'collect' }] },
  { id: 'c', kind: 'task', type: 'T', retryPolicy: { maxRetries: 2, backoffMs: 0 }, edges: [{ to: 'collect' }] },
  { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
  { id: 'done', kind: 'end', outcome: 'completed' },
], 'split');
/** One task with a budget of ONE retry — two attempts in all. */
const RETRY = flow('att-retry', [
  { id: 'x', kind: 'task', type: 'T', retryPolicy: { maxRetries: 1, backoffMs: 0 }, edges: [{ to: 'done' }] },
  { id: 'done', kind: 'end', outcome: 'completed' },
], 'x');

/** One fold input as a line: an attempt by its task and number, a dispatch or settlement by its task, else the kind. */
const label = (e: FoldInput): string =>
  e.kind === 'attempted' ? `attempted ${e.taskId} #${e.attemptNumber}`
    : e.kind === 'dispatched' ? `dispatched ${e.taskId}`
      : e.kind === 'outcome' ? `outcome ${e.record.taskId} ${e.record.kind === 'outcome' ? e.record.terminalState : ''}`
        : e.kind === 'region' ? `${e.event.type} ${e.event.branchPath}`
          : e.kind === 'resumed' ? `resumed ${e.taskIds.join(',')}`
            : e.kind;

interface Rig {
  readonly d: Driver;
  readonly s: AttemptFake;
  /** Every element `onFoldInput` was handed, labelled, with its position. */
  readonly delivered: string[];
  readonly failures: RunFailure[];
  readonly unminted: UnmintedTask[];
}

function rig(def: FlowDefinition, opts: { inline?: boolean; onFold?: (e: FoldInput, d: Driver) => void; runId?: string } = {}): Rig {
  const s = new AttemptFake();
  s.inline = opts.inline === true;
  const delivered: string[] = [];
  const failures: RunFailure[] = [];
  const unminted: UnmintedTask[] = [];
  const box: { d: Driver | null } = { d: null };
  const d = new Driver(def, {
    runId: opts.runId ?? 'r1', scheduler: s, createTask: (c) => c, predicates: new Map(), ...typesFor(['T']),
    joinPolicy: liveToken as unknown as JoinPolicy, now: () => 0,
    onFoldInput: (e, seq) => { delivered.push(`${seq} ${label(e)}`); opts.onFold?.(e, box.d!); },
    onRunFailure: (f) => { failures.push(f); },
    onUnmintedTask: (u) => { unminted.push(u); },
  });
  box.d = d;
  return { d, s, delivered, failures, unminted };
}
const seq = (d: Driver): string[] => d.foldInputs().map(label);
/** A FRESH driver resuming `cp`, on its own double. */
function resumed(def: FlowDefinition, cp: Checkpoint, opts: { inline?: boolean } = {}): Rig {
  const r = rig(def, opts);
  r.d.resume(cp);
  return r;
}
const configOf = (s: AttemptFake, id: string): Config | undefined => s.added.find((c) => c.id === id);

const SUITE = 'L2 — RN-R40: a task`s attempts — one `attempted` element per attempt started, fed to a replay, and carried across a resume as attemptsSpent (P36 (f)-(i))';
const DECLARED_CASES = [
  'one `attempted` per task.running of a dispatched task, in the order heard — and a REQUEUE repeating its number, or a lower one, appends nothing',
  'NONE for another run`s task, an id no driver minted, a task this run never dispatched, or a detail with no positive integer attemptNumber — none reported, none halting',
  'for EVERY task — one declaring no retryPolicy, one declaring maxRetries 0, and one declaring a budget',
  'an attempt heard INSIDE addTask — an inline pool — is appended when the step ENDS: after every element of the step, never between two of them',
  'at the step`s end the attempts are taken FIRST — before a pause and before a stop called on that step, so (h)`s stopped attempt is recorded',
  '(h): a STOPPED attempt counts — in the log before `interrupted`, an attempt heard after the stop is not, and the resume re-hands the task with that number',
  'a resume FEEDS each stored `attempted` element at its position and re-hands each in-flight task with attemptsSpent the HIGHEST recorded — ABSENT on a task with none',
  'a task with NO retryPolicy is re-handed with attemptsSpent too, and a SPENT budget is handed on all the same — the driver writes no settlement for it',
  'a stored `attempted` the replay cannot place is refused `diverged` AT ITS POSITION — a task the replay never dispatched, a number that is not a positive integer — nothing handed on',
  'a resume of a PAUSED run holds each in-flight task WITH its attemptsSpent, and the unpause hands it on so',
  'a consumer THROW on an `attempted` element: on a scheduler event`s step reported once and halted, nothing thrown out; at the end of start()`s step reported once, halted, and thrown at the caller',
  'a run on a double that fires NO task.running is unmoved — no `attempted` element, and a resume re-hands every task WITHOUT attemptsSpent (P36 prediction 3)',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test('one `attempted` per task.running of a dispatched task, in the order heard — and a REQUEUE repeating its number, or a lower one, appends nothing', () => {
    const r = rig(LINE);
    r.d.start({});
    r.s.running('r1:x:-:0', 1);
    r.s.running('r1:x:-:0', 2);
    r.s.running('r1:x:-:0', 2);   // a REQUEUE: the scheduler's §5 — the same number again
    r.s.running('r1:x:-:0', 1);   // lower than recorded
    r.s.running('r1:x:-:0', 3);
    equal(r.s.fired.length, 5, 'the CONTROL: the double fired all FIVE task.running events at the driver');
    // Hand-written from (f): three numbers that ROSE, in the order heard; the repeat and the lower one, nothing.
    equal(seq(r.d), ['dispatched r1:x:-:0', 'attempted r1:x:-:0 #1', 'attempted r1:x:-:0 #2', 'attempted r1:x:-:0 #3'],
      'one element per attempt STARTED — the requeue`s repeated #2 and the stale #1 append nothing');
    equal(r.delivered, ['0 dispatched r1:x:-:0', '1 attempted r1:x:-:0 #1', '2 attempted r1:x:-:0 #2', '3 attempted r1:x:-:0 #3'],
      'and onFoldInput is handed each at its position, as any element');
    equal(r.d.foldInputs()[1], { kind: 'attempted', taskId: 'r1:x:-:0', attemptNumber: 1 }, 'the element`s shape: the kind, the task id, the number — nothing else');
    ok(Object.isFrozen(r.d.foldInputs()[1]), 'handed out FROZEN, as every element is (OR-R7)');
    equal(r.d.snapshot(), [], 'and NO log record: task.running writes none (OR-R4) — the element is a fold input, `cancelRequested``s precedent');
    equal([r.failures, r.unminted], [[], []], 'nothing reported');
  });

  test('NONE for another run`s task, an id no driver minted, a task this run never dispatched, or a detail with no positive integer attemptNumber — none reported, none halting', () => {
    const r = rig(LINE);
    r.d.start({});
    r.s.running('r2:x:-:0', 1);       // another run's (ID-R4 tier 1)
    r.s.running('nightly-cleanup', 1); // minted by no driver (ID-R5)
    r.s.running(undefined, 1);         // no id at all
    r.s.running('r1:y:-:0', 1);        // OUR run, a task never dispatched (ID-R4 tier 2's shape)
    for (const bad of [0, -1, 1.5, '1', null, undefined, Number.NaN]) r.s.running('r1:x:-:0', bad);
    equal(seq(r.d), ['dispatched r1:x:-:0'], 'NOTHING appended for any of them');
    equal([r.failures.length, r.unminted.length, r.d.hasFailed()], [0, 0, false],
      'and NONE is reported or halts: an attempt start never stops a run by existing — not even an unminted id or our own undispatched one');
    // The CONTROLS: each observer is live. A valid attempt of `x` appends; a SETTLEMENT of the unminted id reaches
    // onUnmintedTask; a settlement of our undispatched `y` is ID-R4 tier 2`s UndispatchedTask — the channels the attempts did not use.
    r.s.running('r1:x:-:0', 1);
    equal(seq(r.d), ['dispatched r1:x:-:0', 'attempted r1:x:-:0 #1'], 'the CONTROL: the same task`s valid attempt is recorded');
    r.s.settle('nightly-cleanup', 'done');
    equal(r.unminted.map((u) => u.taskId), ['nightly-cleanup'], 'the CONTROL: onUnmintedTask is wired — the unminted id`s SETTLEMENT reaches it');
    r.s.settle('r1:y:-:0', 'done');
    equal(r.failures.map((f) => f.kind), ['UndispatchedTask'], 'the CONTROL: onRunFailure is wired — our undispatched task`s SETTLEMENT halts the run');
    // A HALTED run still records an attempt (RN-R40, as it records a settlement): `x`'s next attempt, heard on a
    // scheduler event's own step AFTER the halt, is appended after `halted` (W186's adequacy reader, A2).
    r.s.running('r1:x:-:0', 2);
    equal(seq(r.d).slice(-2), ['halted', 'attempted r1:x:-:0 #2'], 'the halted run records the attempt the scheduler started after the halt');
  });

  test('for EVERY task — one declaring no retryPolicy, one declaring maxRetries 0, and one declaring a budget', () => {
    const r = rig(THREE);
    r.d.start({});
    r.s.running('r1:a:0:0', 1);
    r.s.running('r1:b:1:0', 1);
    r.s.running('r1:c:2:0', 1);
    equal(seq(r.d).filter((l) => l.startsWith('attempted ')), ['attempted r1:a:0:0 #1', 'attempted r1:b:1:0 #1', 'attempted r1:c:2:0 #1'],
      'each task`s attempt is recorded whatever its policy — (f): for EVERY task, not only those with retries to carry');
    // The ARRANGEMENT read back: the three tasks were handed on with the three policies.
    equal([configOf(r.s, 'r1:a:0:0')?.retryPolicy, configOf(r.s, 'r1:b:1:0')?.retryPolicy, configOf(r.s, 'r1:c:2:0')?.retryPolicy],
      [undefined, { maxRetries: 0, backoffMs: 0 }, { maxRetries: 2, backoffMs: 0 }], 'the ARRANGEMENT: none, a zero budget, and a budget of two');
  });

  test('an attempt heard INSIDE addTask — an inline pool — is appended when the step ENDS: after every element of the step, never between two of them', () => {
    // Arranged ONE way: the double fires each task.running inside its addTask, on start()'s own step.
    const inl = rig(THREE, { inline: true });
    inl.d.start({});
    equal(inl.s.fired, ['task.running r1:a:0:0 1', 'task.running r1:b:1:0 1', 'task.running r1:c:2:0 1'],
      'the ARRANGEMENT: three attempts heard DURING start(), one inside each hand-off');
    // Hand-written: JP-R5's start of an entry fan-out (regionEntered, every branch.opened, the three dispatches in branch
    // order, RN-R4), THEN the three attempts in the order heard — none between two elements of the step.
    const START = ['regionEntered', 'branch.opened 0', 'branch.opened 1', 'branch.opened 2', 'dispatched r1:a:0:0', 'dispatched r1:b:1:0', 'dispatched r1:c:2:0'];
    equal(seq(inl.d), [...START, 'attempted r1:a:0:0 #1', 'attempted r1:b:1:0 #1', 'attempted r1:c:2:0 #1'],
      'the step whole first, then its attempts — appended when start()`s step ended');
    equal(inl.delivered.length, 10, 'all ten delivered BEFORE start() returned — the attempts on start()`s own step end');
    // Arranged the OTHER way: the same attempts heard AFTER start() returned, each on a scheduler event`s own step — the
    // same positions, so where the element lands does not depend on which pool started the task.
    const later = rig(THREE);
    later.d.start({});
    equal(seq(later.d), START, 'the CONTROL: with nothing heard during start(), its step appends the seven alone');
    for (const id of ['r1:a:0:0', 'r1:b:1:0', 'r1:c:2:0']) later.s.running(id, 1);
    equal(seq(later.d), seq(inl.d), 'heard later, on their own steps: the SAME sequence');
    // And a replay of the inline run's checkpoint is refused NOWHERE: every attempt lies between two steps.
    const back = resumed(THREE, inl.d.checkpoint());
    equal(seq(back.d), [...START, 'attempted r1:a:0:0 #1', 'attempted r1:b:1:0 #1', 'attempted r1:c:2:0 #1', 'resumed r1:a:0:0,r1:b:1:0,r1:c:2:0'],
      'the inline run`s checkpoint RESUMES — its attempts fed at their positions — where an element between two of the step`s would be `diverged`');
  });

  test('at the step`s end the attempts are taken FIRST — before a pause and before a stop called on that step, so (h)`s stopped attempt is recorded', () => {
    // A PAUSE called from a callback on the step's own `dispatched` element — pending until the step ends (RN-R35).
    const p = rig(LINE, { inline: true, onFold: (e, d) => { if (e.kind === 'dispatched') d.pause({ actor: 'ops' }); } });
    p.d.start({});
    equal(seq(p.d), ['dispatched r1:x:-:0', 'attempted r1:x:-:0 #1', 'paused'], 'the attempt, THEN the pause taken at the step`s end');
    // A STOP called the same way — taken at the step's end, deaf from it: an attempt after it would be lost.
    const s = rig(LINE, { inline: true, onFold: (e, d) => { if (e.kind === 'dispatched') void d.stop({ actor: 'ops' }); } });
    s.d.start({});
    equal(seq(s.d), ['dispatched r1:x:-:0', 'attempted r1:x:-:0 #1', 'interrupted'], 'the attempt, THEN the stop — the attempt in flight at the stop is in the log');
    equal(s.s.cancels, ['r1:x:-:0'], 'the CONTROL: the stop was TAKEN — it cancelled the task in flight');
  });

  test('(h): a STOPPED attempt counts — in the log before `interrupted`, an attempt heard after the stop is not, and the resume re-hands the task with that number', async () => {
    const r = rig(LINE);
    r.d.start({});
    r.s.running('r1:x:-:0', 1);
    r.s.running('r1:x:-:0', 2);
    await r.d.stop({ actor: 'ops', reason: 'upgrade' });
    r.s.running('r1:x:-:0', 3);   // after the stop: the driver is DEAF (RN-R33)
    equal(r.s.fired.at(-1), 'task.running r1:x:-:0 3', 'the CONTROL: the double DID fire the third attempt at the stopped driver');
    equal(seq(r.d), ['dispatched r1:x:-:0', 'attempted r1:x:-:0 #1', 'attempted r1:x:-:0 #2', 'interrupted'],
      'the attempts heard BEFORE the stop are in the log before its element; the one after, nowhere');
    const back = resumed(LINE, r.d.checkpoint());
    equal(configOf(back.s, 'r1:x:-:0')?.attemptsSpent, 2, '(h): re-handed with attemptsSpent 2 — the STOPPED attempt counted as spent, as a kill`s is');
  });

  test('a resume FEEDS each stored `attempted` element at its position and re-hands each in-flight task with attemptsSpent the HIGHEST recorded — ABSENT on a task with none', () => {
    const r = rig(THREE);
    r.d.start({});
    r.s.running('r1:a:0:0', 1);
    r.s.running('r1:a:0:0', 2);
    r.s.running('r1:c:2:0', 1);
    // `b` never started. A REQUEUE of `a` at #2 again appends nothing.
    r.s.running('r1:a:0:0', 2);
    const cp = r.d.checkpoint();
    const back = resumed(THREE, cp);
    equal(seq(back.d).slice(0, cp.events.length), seq(r.d), 'the replay regenerated and FED the stored run element for element — refused nowhere');
    equal(back.delivered, [`${cp.events.length} resumed r1:a:0:0,r1:b:1:0,r1:c:2:0`], 'and the consumer is handed only what it does not hold: `resumed`');
    // Hand-written from (g): the highest number recorded per task, and NO key where none was.
    equal(back.s.added.map((c) => [c.id, 'attemptsSpent' in c ? c.attemptsSpent : 'ABSENT']),
      [['r1:a:0:0', 2], ['r1:b:1:0', 'ABSENT'], ['r1:c:2:0', 1]], 'a: its highest, 2; b: no attempt recorded, so the key is ABSENT; c: 1 — in dispatch order');
    // The CONTROL for the SOURCE: the same run's checkpoint cut before its attempts re-hands every task without the key.
    const before = rig(THREE);
    before.d.start({});
    const bare = resumed(THREE, before.d.checkpoint());
    equal(bare.s.added.map((c) => 'attemptsSpent' in c), [false, false, false], 'the CONTROL: no stored attempt, no attemptsSpent on any task');
    // And the requeue rule survives the resume: the new runtime's repeat of #2 appends nothing, its #3 appends.
    back.s.running('r1:a:0:0', 2);
    back.s.running('r1:a:0:0', 3);
    equal(seq(back.d).slice(cp.events.length + 1), ['attempted r1:a:0:0 #3'], 'after the resume the recorded #2 is the bar: a repeat appends nothing, #3 appends');
    // A SECOND resume, from B's checkpoint, onto a third driver C: the counts ACCUMULATE — `a` handed on with B's #3
    // (W186's adequacy reader, A4).
    const third = resumed(THREE, back.d.checkpoint());
    equal(third.s.added.map((c) => [c.id, 'attemptsSpent' in c ? c.attemptsSpent : 'ABSENT']),
      [['r1:a:0:0', 3], ['r1:b:1:0', 'ABSENT'], ['r1:c:2:0', 1]], 'A -> B -> C: `a` carries 3, the attempt B recorded; `b` still none; `c` 1');
    // And the attempt the resume's OWN hand-off starts, on an INLINE pool — heard inside resume()'s `addTask` — is
    // appended when resume()'s step ends, after `resumed`, numbered on from the spent count (adequacy A1).
    const inl = resumed(THREE, cp, { inline: true });
    equal(seq(inl.d).slice(cp.events.length), ['resumed r1:a:0:0,r1:b:1:0,r1:c:2:0', 'attempted r1:a:0:0 #3', 'attempted r1:b:1:0 #1', 'attempted r1:c:2:0 #2'],
      'the resumed tail: `resumed`, then each re-handed task`s first attempt in THIS process — a at #3, b at #1, c at #2');
  });

  test('a task with NO retryPolicy is re-handed with attemptsSpent too, and a SPENT budget is handed on all the same — the driver writes no settlement for it', () => {
    // No policy: one attempt recorded.
    const n = rig(LINE);
    n.d.start({});
    n.s.running('r1:x:-:0', 1);
    equal(configOf(n.s, 'r1:x:-:0')?.retryPolicy, undefined, 'the ARRANGEMENT: `x` declares no retryPolicy');
    equal(configOf(resumed(LINE, n.d.checkpoint()).s, 'r1:x:-:0')?.attemptsSpent, 1, 'no retryPolicy: re-handed with attemptsSpent 1 — the attempt numbering continues');
    // A SPENT budget: one retry allowed, two attempts recorded.
    const sp = rig(RETRY);
    sp.d.start({});
    sp.s.running('r1:x:-:0', 1);
    sp.s.running('r1:x:-:0', 2);
    const cp = sp.d.checkpoint();
    const back = resumed(RETRY, cp);
    equal([configOf(back.s, 'r1:x:-:0')?.attemptsSpent, configOf(back.s, 'r1:x:-:0')?.retryPolicy], [2, { maxRetries: 1, backoffMs: 0 }],
      'its budget of 1 retry SPENT (2 attempts) — handed on anyway, with attemptsSpent 2 and its policy');
    equal(seq(back.d).slice(cp.events.length), ['resumed r1:x:-:0'], 'and NOTHING after `resumed`: no settlement the driver wrote (P36 decision 7)');
    back.s.settle('r1:x:-:0', 'user_action', 2);
    equal(seq(back.d).slice(cp.events.length), ['resumed r1:x:-:0', 'outcome r1:x:-:0 user_action'], 'the CONTROL: the SCHEDULER`s settlement is what ends it, appended when it fires');
  });

  test('a stored `attempted` the replay cannot place is refused `diverged` AT ITS POSITION — a task the replay never dispatched, a number that is not a positive integer — nothing handed on', () => {
    const r = rig(LINE);
    r.d.start({});
    r.s.running('r1:x:-:0', 1);
    const good = r.d.checkpoint();
    equal(good.events.map((e) => e.kind), ['dispatched', 'attempted'], 'the ARRANGEMENT: the stored run holds a real `attempted` element at position 1, the one forged below');
    for (const [what, forged] of [
      ['a task the replay never dispatched', { kind: 'attempted', taskId: 'r1:y:-:0', attemptNumber: 1 }],
      ['another run`s task', { kind: 'attempted', taskId: 'r2:x:-:0', attemptNumber: 1 }],
      ['attemptNumber 0', { kind: 'attempted', taskId: 'r1:x:-:0', attemptNumber: 0 }],
      ['attemptNumber "1"', { kind: 'attempted', taskId: 'r1:x:-:0', attemptNumber: '1' }],
      ['attemptNumber 1.5', { kind: 'attempted', taskId: 'r1:x:-:0', attemptNumber: 1.5 }],
    ] as const) {
      const cp = { header: good.header, events: [good.events[0]!, forged as unknown as FoldInput] } as Checkpoint;
      const f = rig(LINE);
      let err: unknown = null;
      try { f.d.resume(cp); } catch (e) { err = e; }
      equal([err instanceof ResumeRefused ? `${err.reason} at ${err.index}` : String(err), f.s.added.length], ['diverged at 1', 0],
        `${what}: refused \`diverged\` at the forged element's position, nothing handed on`);
    }
    // A stored number that does not RISE for its task — the driver never appends one — is refused at its position
    // (W186's adequacy reader A3, conformity C5): #2 then #1, and #1 twice.
    for (const [what, numbers] of [['#2 then #1', [2, 1]], ['#1 twice', [1, 1]]] as const) {
      const events = [good.events[0]!, ...numbers.map((n) => ({ kind: 'attempted', taskId: 'r1:x:-:0', attemptNumber: n }) as FoldInput)];
      const f = rig(LINE);
      let err: unknown = null;
      try { f.d.resume({ header: good.header, events } as Checkpoint); } catch (e) { err = e; }
      equal([err instanceof ResumeRefused ? `${err.reason} at ${err.index}` : String(err), f.s.added.length], ['diverged at 2', 0],
        `${what}: the number that does not rise refused \`diverged\` at its position, nothing handed on`);
    }
    // The CONTROL: the checkpoint as the driver wrote it resumes — its `attempted` element FED, not refused.
    const ok1 = resumed(LINE, good);
    equal(ok1.s.added.map((c) => [c.id, c.attemptsSpent]), [['r1:x:-:0', 1]], 'the CONTROL: the unforged checkpoint resumes and re-hands `x`, its attempt fed');
  });

  test('a resume of a PAUSED run holds each in-flight task WITH its attemptsSpent, and the unpause hands it on so', () => {
    const r = rig(LINE);
    r.d.start({});
    r.s.running('r1:x:-:0', 1);
    r.d.pause({ actor: 'ops' });
    const back = resumed(LINE, r.d.checkpoint());
    equal(back.s.added, [], 'the ARRANGEMENT: a paused run resumes PAUSED — nothing handed on (RN-R35)');
    back.d.unpause({ actor: 'ops' });
    equal(back.s.added.map((c) => [c.id, c.attemptsSpent]), [['r1:x:-:0', 1]], 'the unpause hands `x` on WITH attemptsSpent 1');
    // On an INLINE pool the unpause's own hand-off starts the attempt inside `addTask`: appended when unpause()'s step
    // ends, after `unpaused`, numbered #2 (W186's adequacy reader, A1).
    const inl = resumed(LINE, r.d.checkpoint(), { inline: true });
    const n = inl.d.foldInputs().length;
    inl.d.unpause({ actor: 'ops' });
    equal(seq(inl.d).slice(n), ['unpaused', 'attempted r1:x:-:0 #2'], 'the unpause`s inline attempt, after its element, as attempt #2');
  });

  test('a consumer THROW on an `attempted` element: on a scheduler event`s step reported once and halted, nothing thrown out; at the end of start()`s step reported once, halted, and thrown at the caller', () => {
    const thrower = (e: FoldInput) => { if (e.kind === 'attempted') throw new AttemptBoom('the store is down'); };
    // A scheduler event's step: the listener boundary catches it (OR-R10).
    const ev = rig(LINE, { onFold: thrower });
    ev.d.start({});
    ev.s.running('r1:x:-:0', 1);   // nothing escapes into the scheduler's dispatch
    equal([seq(ev.d), ev.failures.map((f) => f.kind), ev.d.hasFailed()],
      [['dispatched r1:x:-:0', 'attempted r1:x:-:0 #1', 'halted'], [AttemptBoom.name], true],
      'the element in the log, then `halted` right after it, reported ONCE under the consumer`s class');
    // The end of a DRIVER CALL's step: an inline pool's attempt, appended as start()'s step ends — thrown at start()'s caller.
    const st = rig(LINE, { inline: true, onFold: thrower });
    throws(() => st.d.start({}), 'the store is down', 'the consumer`s error reaches start()`s caller');
    equal([seq(st.d), st.failures.map((f) => f.kind)], [['dispatched r1:x:-:0', 'attempted r1:x:-:0 #1', 'halted'], [AttemptBoom.name]],
      'and the run is HALTED after the element, reported ONCE (OR-R10 v0.19, W184`s rule at a new element)');
    // ONCE: a callback throwing on the step's SECOND `dispatched` element — after `a` was handed on and started — halts the
    // run THERE; `a`'s attempt, heard in that step, is still appended at its end (the scheduler started it), and a second
    // throw, on it, is discarded: the FIRST error reaches the caller and is reported once.
    class AttemptAgain extends Error {}
    const twice = rig(THREE, { inline: true, onFold: (e) => {
      if (e.kind === 'dispatched' && e.taskId === 'r1:b:1:0') throw new AttemptBoom('first');
      if (e.kind === 'attempted') throw new AttemptAgain('second');
    } });
    let thrown: unknown = null;
    try { twice.d.start({}); } catch (e) { thrown = e; }
    equal([thrown instanceof AttemptBoom, seq(twice.d).slice(4), twice.failures.map((f) => f.kind)],
      [true, ['dispatched r1:a:0:0', 'dispatched r1:b:1:0', 'halted', 'attempted r1:a:0:0 #1'], [AttemptBoom.name]],
      'halted at the element thrown on; `a`s attempt recorded after the halt, its own throw discarded; the FIRST error at the caller, reported once');
    // The CONTROL: the same run whose callback does not throw has no halt.
    const fine = rig(LINE, { inline: true });
    fine.d.start({});
    equal([seq(fine.d), fine.failures.length], [['dispatched r1:x:-:0', 'attempted r1:x:-:0 #1'], 0], 'the CONTROL: no throw, no halt');
  });

  test('a run on a double that fires NO task.running is unmoved — no `attempted` element, and a resume re-hands every task WITHOUT attemptsSpent (P36 prediction 3)', () => {
    const r = rig(LINE);
    r.d.start({});
    r.s.settle('r1:x:-:0', 'done');
    // Hand-written from the flow and RN-R4: x dispatched, settled, y dispatched — the sequence before W186.
    equal(seq(r.d), ['dispatched r1:x:-:0', 'outcome r1:x:-:0 done', 'dispatched r1:y:-:0'], 'no `attempted` element where no attempt was heard');
    equal(fold(r.d.foldInputs()).outcome, 'running', 'and the fold is what it always was');
    const back = resumed(LINE, r.d.checkpoint());
    equal(back.s.added.map((c) => [c.id, 'attemptsSpent' in c]), [['r1:y:-:0', false]], 'the in-flight `y` re-handed with NO attemptsSpent key — the four-field config it always was');
  });

  test('every case this suite declares actually ran — a deleted case fails naming itself', () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name)).sort();
    const declared = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run — it was deleted, renamed, or its suite stopped loading');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name. Add it here in the same commit');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership, which catches a duplicated name');
  });
});
