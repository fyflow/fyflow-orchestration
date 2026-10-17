/**
 * **L2 — an ask under cancel, stop, pause and resume** — `spec/run-state.md` `RN-R38` (v0.23), read with `RN-R31`,
 * `RN-R33`, `RN-R35`, `RN-R21` and `RN-R37`; P35 stop-and-ask (g) as answered, fact 5;
 * [ADR 0109](../../doc/decisions/0109-an-ask-parks-with-nothing-dispatched-and-its-answer-is-its-result.md),
 * [ADR 0104](../../doc/decisions/0104-a-run-its-owner-cancels-is-cancelling-until-its-last-task-has-stopped.md),
 * [ADR 0105](../../doc/decisions/0105-a-run-its-owner-stops-goes-deaf-before-it-cancels-and-resumes-elsewhere.md),
 * [ADR 0106](../../doc/decisions/0106-a-run-its-owner-pauses-routes-on-and-holds-every-dispatch-until-unpaused.md);
 * [W181](../../doc/work-items/w181-an-ask-under-run-control.md).
 *
 * **A parked ask is a parked task to run control** — (g)'s words — and every expected value below is written from that
 * sentence and the four rows it names, never from a run: a cancel sends the scheduler NOTHING for an ask (it is not in
 * flight, `RN-R21`) and the run reads `cancelled` once its last RUNNING task has stopped (`RN-R30`); a stop sends nothing
 * for it, refuses its answer on the stopping driver, and a resume elsewhere REGENERATES its `asked` element at its
 * position with nothing handed on for it; an answer is accepted while paused and whatever it routes to is appended and
 * HELD until the unpause; and an answer is an owner element the replay FEEDS, taken at rest (`RN-R19`).
 *
 * **What W180's `test/driver/ask.test.ts` already holds is not repeated here** (W181's measurement, its file): the three
 * `ended` refusals on a run waiting only on an ask (its case 16); a cancel raised on the `asked` element in a fan-out
 * (case 18) and at the entry with an answer pending (case 11); a resume re-parking an UNSTOPPED run, a forged input over
 * every structured-clone kind, and a stored answer fed (cases 12, 14). **Every case here asserts on the scheduler as
 * well as on the sequence** — what was handed on (`addTask`), built (`createTask`) and cancelled — because *nothing
 * handed to the scheduler for an ask* is a claim about the scheduler; and each claim sits beside a CONTROL that differs
 * by the one thing claimed (most often the ask replaced by a task, or the run not stopped or not paused).
 */
import { collected, equal, ok, readText, ROOT, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { Driver, ResumeRefused } from '../../src/driver/driver.ts';
import type { Checkpoint } from '../../src/driver/driver.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { fold, type FoldInput } from '../../src/fold/run-state.ts';
import { liveToken } from '../../src/fold/policies.ts';

const SUITE = 'L2 — RN-R38: an ask under cancel, stop, pause and resume — a parked ask is a parked task to run control';

const EX = `${ROOT}spec/examples`;
const load = async (rel: string) => JSON.parse(await readText(`${EX}/${rel}`)) as FlowDefinition;
const TYPES = typesFor(['IngestWorker', 'ScoreWorker', 'PublishWorker', 'ReviewWorker']);

/**
 * A scheduler double that RECORDS every `addTask` and every `cancel`, and fires only what a case tells it to. `cancel`
 * plays the scheduler's RUNNING road (P34 fact 8): it is recorded, and its promise resolves — and `task.cancelled` fires
 * — only when the case says the worker has stopped (`finish`).
 */
class Fake {
  readonly added: string[] = [];
  readonly inputs = new Map<string, unknown>();
  readonly cancels: string[] = [];
  private readonly stopping = new Map<string, (v: boolean) => void>();
  private readonly listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(t: unknown): void {
    const task = t as { id: string; payload?: { input?: unknown } };
    this.added.push(task.id);
    this.inputs.set(task.id, task.payload?.input);
  }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  cancel(id: string): Promise<boolean> {
    this.cancels.push(id);
    // An id it was never handed is not its to cancel: `false` at once, as the scheduler answers — so a driver that sent
    // one for an ask fails this suite's assertions rather than hanging the `stop()` a case awaits.
    if (!this.added.includes(id)) return Promise.resolve(false);
    return new Promise<boolean>((r) => { this.stopping.set(id, r); });
  }
  settle(id: string, state: 'done' | 'user_action' | 'cancelled', result: unknown = null): void {
    const detail = { id, state, result, error: state === 'done' ? null : 'x', attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
    const ev = state === 'done' ? ['task.completed'] : state === 'cancelled' ? ['task.cancelled'] : ['task.failed', 'task.user_action'];
    for (const name of ev) for (const fn of this.listeners.get(name) ?? []) fn({ detail });
  }
  /** The worker of `id` has stopped: `task.cancelled` fires, then its `cancel()` resolves. */
  finish(id: string): void {
    const r = this.stopping.get(id);
    ok(r !== undefined, `fixture: "${id}" was never sent a cancel`);
    this.settle(id, 'cancelled');
    r!(true);
  }
}

interface Made {
  driver: Driver;
  sch: Fake;
  /** Every `createTask` call, by task id — a held dispatch builds its task only when it is handed on (`RN-R35`). */
  built: string[];
  failures: string[];
  /** The kinds `onFoldInput` was handed, in order, with a region event's type and branch where there is one. */
  seen: string[];
}

function make(def: FlowDefinition, extra: Record<string, unknown> = {}): Made {
  const sch = new Fake();
  const built: string[] = [];
  const failures: string[] = [];
  const seen: string[] = [];
  const userFoldInput = extra.onFoldInput as ((e: FoldInput, seq: number) => void) | undefined;
  const driver = new Driver(def, {
    runId: 'r1', scheduler: sch as never, createTask: (c) => { built.push((c as { id: string }).id); return c as never; },
    predicates: new Map(), now: () => 42, joinPolicy: liveToken as unknown as JoinPolicy, ...TYPES,
    onRunFailure: (f) => failures.push(f.message),
    ...extra,
    onFoldInput: (e, seq) => {
      seen.push(e.kind === 'region' ? `${e.event.type.replace('branch.', '')}(${e.event.branchPath})` : e.kind);
      userFoldInput?.(e, seq);
    },
  });
  return { driver, sch, built, failures, seen };
}

/** The same driver options again, for a FRESH driver a checkpoint is resumed on — a new scheduler, nothing shared. */
const fresh = (def: FlowDefinition, extra: Record<string, unknown> = {}) => make(def, extra);

const state = (d: Driver) => fold(d.foldInputs());
const turn = () => new Promise<void>((r) => setTimeout(r, 0));
/** Whether a promise has settled after a turn — `cancel()` and `stop()` resolve once every task they cancelled stopped. */
async function settledYet(p: Promise<unknown>): Promise<boolean> {
  let done = false;
  void p.then(() => { done = true; });
  await turn();
  return done;
}

/** `ingest` -> split(review: ASK, score: task) -> collect -> publish — the corpus flow; and its CONTROL twin with a task. */
const FANOUT = () => load('valid/ask-in-a-fanout.flow.json');
async function fanoutAsTask(): Promise<FlowDefinition> {
  const d = structuredClone(await FANOUT()) as unknown as { nodes: Record<string, unknown>[] };
  const i = d.nodes.findIndex((n) => n.id === 'review');
  d.nodes[i] = { id: 'review', kind: 'task', type: 'ReviewWorker', edges: [{ on: ['failed'], to: 'dropped' }, { to: 'collect' }] };
  return d as unknown as FlowDefinition;
}
/** `summarise` -> approve (ASK) -> publish | revise — the corpus flow. */
const AFTER = () => load('valid/ask-after-a-task.flow.json');
/** `ingest` -> a map over `files`, each instance an ASK -> collect -> publish. */
const MAP = {
  flowId: 'ask-map-control', version: 1, entry: 'ingest',
  nodes: [
    { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'each' }] },
    { id: 'each', kind: 'map', over: 'files', branch: 'approve' },
    { id: 'approve', kind: 'ask', edges: [{ to: 'collect' }] },
    { id: 'collect', kind: 'join', of: 'each', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;
/** The ENTRY ask, then a task: approve (ASK) -> publish -> done. */
const ENTRY = {
  flowId: 'ask-entry-control', version: 1, entry: 'approve',
  nodes: [
    { id: 'approve', kind: 'ask', edges: [{ to: 'publish' }] },
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

const INGEST = 'r1:ingest:-:0', REVIEW = 'r1:review:0:0', SCORE = 'r1:score:1:0', PUBLISH = 'r1:publish:-:0';
const SUMMARISE = 'r1:summarise:-:0', APPROVE = 'r1:approve:-:0';

/** The fan-out run, parked at its ask with its sibling task RUNNING: the arrangement half the cases start from. */
async function fanoutParked(def?: FlowDefinition, extra: Record<string, unknown> = {}): Promise<Made> {
  const m = make(def ?? await FANOUT(), extra);
  m.driver.start({});
  m.sch.settle(INGEST, 'done', { n: 1 });
  return m;
}
/** The task-then-ask run, parked at its ask with nothing in flight. */
async function afterParked(extra: Record<string, unknown> = {}, result: unknown = { text: 's' }): Promise<Made> {
  const m = make(await AFTER(), extra);
  m.driver.start({});
  m.sch.settle(SUMMARISE, 'done', result);
  return m;
}

const DECLARED_CASES = [
  'CANCEL beside a RUNNING task: the cancel is sent for the task alone, never the ask; `cancelling` until it stops, then `cancelled`; the answer refused',
  'CANCEL beside a PARKED task, and in a MAP: nothing in flight, nothing sent — `cancelled` at once, every answer refused',
  'CANCEL of a PAUSED run parked on an ask: the HELD task is handed on and cancelled, the ask sent nothing',
  'STOP of a run parked on an ask ALONE: nothing sent, `interrupted`, the answer refused there — and RESUMED on a fresh driver, the `asked` element regenerated at its position with nothing handed on, answered to `completed`',
  'STOP beside a RUNNING task: only the task is cancelled, and the resume re-dispatches it and NOT the ask, which is answered there',
  'a stored ANSWER fed across a stop: answered on the resumed driver, stopped again, resumed a third time — the resolution fed at its position, nothing re-asked',
  'a STOPPED checkpoint whose `asked` input was changed is refused `diverged` at the element: a Map, a Date and a plain value, beside the untouched clone',
  'an ANSWER while PAUSED, at rest: accepted, its successor appended and HELD — built and handed on only by the unpause',
  'an ANSWER while PAUSED in a fan-out: the join fires on the sibling`s settlement and its successor is held until the unpause',
  'an ANSWER while PAUSED, then STOPPED and resumed: the held successor is never handed on the stopping driver, and is held again on the resumed one until its unpause',
  'STOP of a PAUSED run parked on an ask: the resumed run is PAUSED with the ask re-parked — an answer there is held, the unpause hands it on',
  'an answer MID-STEP on a PAUSED run: given on the `asked` element, or on a sibling`s settlement — taken at rest, its successor held, and the checkpoint resumes paused',
  'run control raised from onFoldInput ON the `asked` element: a PAUSE, on a driver call`s step and on a scheduler event`s, is taken when the step ends',
  'run control raised from onFoldInput ON the `asked` element: a STOP on a driver call`s step and on a scheduler event`s — taken at rest, the ask sent nothing, and the run resumes elsewhere re-parked',
  'run control raised from onFoldInput ON the `asked` element: an UNPAUSE of a paused run, on a scheduler event`s step and on `resume()`s — taken at rest, and the answer after it handed on at once',
  'run control raised ON the `asked` element a RESUME regenerates in the stored run`s lost tail: a cancel, a stop and a pause on `resume()`s step',
  'an answer and a pause, or an answer and a stop, raised on ONE step are taken in CALL order: a stop called first refuses the answer',
  'STOP beside a PARKED task: nothing sent for either, both answers refused — resumed, BOTH re-parked, answered and resolved to `completed`',
  'an ANSWER while PAUSED beside a parked task, and in a MAP: the join waits, fires, and its successor is held until the unpause',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test(DECLARED_CASES[0]!, async () => {
    const m = await fanoutParked();
    equal(m.sch.added, [INGEST, SCORE], 'the ARRANGEMENT: the ask parked, its sibling handed on');
    const cancelled = m.driver.cancel({ actor: 'ops' });
    equal(m.sch.cancels, [SCORE], 'the cancel is sent for the RUNNING task alone — never for the ask, which is not in flight (RN-R21)');
    equal(state(m.driver).outcome, 'cancelling', '`cancelling` while the task runs (RN-R30)');
    equal(state(m.driver).nodes[REVIEW]!.state, 'suspended', 'the ask stays `suspended` — nothing is written per node (P34 (i))');
    equal(m.driver.resolve(REVIEW, 'done', { result: { ok: true }, actor: 'ana' }), false, 'its answer is refused: the run is held');
    equal(await settledYet(cancelled), false, 'cancel() still pending: the task has not stopped');
    m.sch.finish(SCORE);
    equal(await settledYet(cancelled), true, 'it resolves once the task stopped');
    equal(state(m.driver).outcome, 'cancelled', '`cancelled` — the ask, suspended, is no RUNNING node');
    equal(m.seen.slice(-2), ['cancelRequested', 'outcome'], 'ONE element, then the scheduler`s own settlement of the task — nothing for the ask');
    equal(m.sch.added, [INGEST, SCORE], 'and nothing handed on after the cancel');
    // CONTROL — the same run with a TASK where the ask is: both are in flight, and both are sent a cancel.
    const c = await fanoutParked(await fanoutAsTask());
    void c.driver.cancel({ actor: 'ops' });
    equal(c.sch.cancels, [REVIEW, SCORE], 'the CONTROL: a task in the ask`s place IS sent a cancel, at the same id');
  });

  test(DECLARED_CASES[1]!, async () => {
    // Beside a PARKED task: the sibling ends `user_action`, so nothing at all is in flight.
    const m = await fanoutParked();
    m.sch.settle(SCORE, 'user_action');
    equal(state(m.driver).outcome, 'awaiting_action', 'the ARRANGEMENT: an ask and a task parked, nothing running');
    const cancelled = m.driver.cancel({ actor: 'ops' });
    equal(m.sch.cancels, [], 'nothing sent: neither an ask nor a parked task is in flight (P34 (i))');
    equal(state(m.driver).outcome, 'cancelled', '`cancelled` AT ONCE — nothing runs');
    equal(await settledYet(cancelled), true, 'and cancel() resolves at once');
    equal([state(m.driver).nodes[REVIEW]!.state, state(m.driver).nodes[SCORE]!.state], ['suspended', 'suspended'], 'both nodes stay parked');
    equal([m.driver.resolve(REVIEW, 'done', { result: { ok: true }, actor: 'a' }), m.driver.resolve(SCORE, 'done', { result: 1, actor: 'a' })],
      [false, false], 'the ask`s answer and the task`s resolution are both refused');
    // In a MAP: three asks parked, one per item.
    const map = make(MAP);
    map.driver.start({});
    map.sch.settle(INGEST, 'done', { files: ['a', 'b', 'c'] });
    const ids = ['r1:approve:0:0', 'r1:approve:1:0', 'r1:approve:2:0'];
    equal(map.driver.foldInputs().filter((e) => e.kind === 'asked').map((e) => (e as { taskId: string }).taskId), ids, 'the ARRANGEMENT: three asks parked');
    await map.driver.cancel({ actor: 'ops' });
    equal([map.sch.cancels, map.sch.added], [[], [INGEST]], 'nothing sent and nothing handed on for any of the three');
    equal(state(map.driver).outcome, 'cancelled', '`cancelled` at once');
    equal(ids.map((id) => map.driver.resolve(id, 'done', { result: 'x', actor: 'a' })), [false, false, false], 'each answer refused');
    // CONTROL — the same parked task beside a RUNNING task where the ask was: the double records the cancel sent for it.
    const c = await fanoutParked(await fanoutAsTask());
    c.sch.settle(SCORE, 'user_action');
    void c.driver.cancel({ actor: 'ops' });
    equal([c.sch.cancels, state(c.driver).outcome], [[REVIEW], 'cancelling'], 'the CONTROL: a running task in the ask`s place IS sent a cancel, and the run waits on it');
  });

  test(DECLARED_CASES[2]!, async () => {
    // Paused BEFORE ingest settles: its settlement routes on, the ask parks, and `score`'s dispatch is appended and HELD.
    const m = make(await FANOUT());
    m.driver.start({});
    m.driver.pause({ actor: 'ops' });
    m.sch.settle(INGEST, 'done', { n: 1 });
    equal([m.sch.added, m.built], [[INGEST], [INGEST]], 'the ARRANGEMENT: `score` dispatched and held — neither built nor handed on');
    equal(state(m.driver).nodes[REVIEW]!.state, 'suspended', 'and the ask parked');
    const cancelled = m.driver.cancel({ actor: 'ops' });
    equal(m.sch.added, [INGEST, SCORE], 'the HELD task is handed on (P34 (c), RN-R35) …');
    equal(m.sch.cancels, [SCORE], '… and cancelled — and the ask is sent NOTHING');
    equal(state(m.driver).outcome, 'cancelling', '`cancelling` until it stops');
    m.sch.finish(SCORE);
    equal(await settledYet(cancelled), true, 'cancel() resolves once it stopped');
    equal(state(m.driver).outcome, 'cancelled', 'and the run reads `cancelled`');
    // A second shape (R3): a MAP whose branch is an ask then a task, paused; item 0 answered — its task dispatched and
    // HELD — item 1 still asking. The cancel hands the held task on and cancels it; nothing for the ask still parked.
    const def = {
      flowId: 'ask-map-held', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'each' }] },
        { id: 'each', kind: 'map', over: 'files', branch: 'approve' },
        { id: 'approve', kind: 'ask', edges: [{ to: 'work' }] },
        { id: 'work', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'each', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const mp = make(def);
    mp.driver.start({});
    mp.sch.settle(INGEST, 'done', { files: ['a', 'b'] });
    mp.driver.pause({ actor: 'ops' });
    ok(mp.driver.resolve('r1:approve:0:0', 'done', { result: 'a!', actor: 'p' }), 'item 0 answered while paused');
    equal(mp.sch.added, [INGEST], 'the ARRANGEMENT: its task `work` dispatched and HELD, item 1 still asking');
    const mc = mp.driver.cancel({ actor: 'ops' });
    equal([mp.sch.added, mp.sch.cancels], [[INGEST, 'r1:work:0:0'], ['r1:work:0:0']], 'the held task handed on and cancelled — nothing for item 1`s ask');
    mp.sch.finish('r1:work:0:0');
    equal([await settledYet(mc), state(mp.driver).outcome, state(mp.driver).nodes['r1:approve:1:0']!.state], [true, 'cancelled', 'suspended'],
      '`cancelled` once it stopped, the unanswered ask still `suspended`');
  });

  test(DECLARED_CASES[3]!, async () => {
    const def = await AFTER();
    const a = await afterParked();
    equal(a.sch.added, [SUMMARISE], 'the ARRANGEMENT: summarise settled, the ask parked');
    await a.driver.stop({ actor: 'ops', reason: 'upgrade' });
    equal(a.sch.cancels, [], 'NOTHING sent: the ask is not in flight (RN-R21, fact 5 (i))');
    equal(state(a.driver).outcome, 'interrupted', 'the run `interrupted` (RN-R32)');
    equal(state(a.driver).nodes[APPROVE]!.state, 'suspended', 'the ask still `suspended`');
    equal(a.driver.resolve(APPROVE, 'done', { result: { approved: true }, actor: 'ana' }), false,
      'its ANSWER is refused on the stopping driver (P34 decision 9): it is answered where the run resumes');
    equal(a.seen.at(-1), 'interrupted', 'and nothing appended by the refused answer');
    // CONTROL — the same run not stopped takes the same answer.
    const twin = await afterParked();
    ok(twin.driver.resolve(APPROVE, 'done', { result: { approved: true }, actor: 'ana' }), 'the CONTROL: the unstopped twin`s answer is accepted');
    // CONTROL — the same run stopped BEFORE the ask, with summarise RUNNING: the double records the stop's cancel for it.
    const running = make(def);
    running.driver.start({});
    void running.driver.stop({ actor: 'ops' });
    equal(running.sch.cancels, [SUMMARISE], 'the CONTROL: a task in flight IS sent the stop`s cancel');

    const cp = a.driver.checkpoint();
    const at = cp.events.findIndex((e) => e.kind === 'asked');
    equal(cp.events.map((e) => e.kind), ['dispatched', 'outcome', 'asked', 'interrupted'], 'the stored run: the park, then the stop');
    const b = fresh(def);
    b.driver.resume(cp);
    equal([b.sch.added, b.built], [[], []], 'the resume hands NOTHING on and builds nothing: summarise settled, the ask never in flight');
    equal(b.driver.foldInputs().slice(0, cp.events.length), cp.events, 'every stored element regenerated or fed, element for element');
    equal(b.driver.foldInputs()[at], { kind: 'asked', taskId: APPROVE, input: { text: 's' } }, 'the `asked` element REGENERATED at its position — same id, same kept input');
    equal(b.driver.foldInputs().at(-1), { kind: 'resumed', taskIds: [] }, '`resumed` names nothing in flight');
    equal([state(b.driver).outcome, state(b.driver).interruption], ['awaiting_action', null], 'the resumed run waits on the person again, the stop ended');
    ok(b.driver.resolve(APPROVE, 'done', { result: { approved: true }, actor: 'ana' }), 'and the answer is accepted THERE');
    equal(b.sch.added, [PUBLISH], 'routing on the resumed driver`s scheduler');
    b.sch.settle(PUBLISH, 'done', 'published');
    equal(state(b.driver).outcome, 'completed', 'to `completed`');
    equal([a.sch.added, a.sch.cancels], [[SUMMARISE], []], 'and the stopping driver`s scheduler saw nothing after the stop');
  });

  test(DECLARED_CASES[4]!, async () => {
    const def = await FANOUT();
    const a = await fanoutParked(def);
    void a.driver.stop({ actor: 'ops' });
    equal(a.sch.cancels, [SCORE], 'the stop cancels the RUNNING task alone — nothing for the ask');
    equal(state(a.driver).outcome, 'interrupted', '`interrupted`');
    equal(a.driver.resolve(REVIEW, 'done', { result: { ok: true }, actor: 'ana' }), false, 'the answer refused on the stopping driver');
    const b = fresh(def);
    b.driver.resume(a.driver.checkpoint());
    equal(b.sch.added, [SCORE], 'the resume re-dispatches the in-flight task, and NOT the ask');
    equal(b.driver.foldInputs().at(-1), { kind: 'resumed', taskIds: [SCORE] }, '`resumed` names the task alone');
    equal(state(b.driver).nodes[REVIEW]!.input, { n: 1 }, 'the ask re-parked with its kept input');
    ok(b.driver.resolve(REVIEW, 'done', { result: { ok: true }, actor: 'ana' }), 'answered on the resumed driver');
    equal(b.sch.added, [SCORE], 'the join still waits for the task');
    b.sch.settle(SCORE, 'done', { s: 1 });
    equal(b.sch.added, [SCORE, PUBLISH], 'the join fires');
    equal(b.sch.inputs.get(PUBLISH), { 0: { ok: true }, 1: { s: 1 } }, 'carrying the answer for the ask`s branch');
    b.sch.settle(PUBLISH, 'done', 'p');
    equal(state(b.driver).outcome, 'completed', 'to `completed`');
  });

  test(DECLARED_CASES[5]!, async () => {
    const def = await AFTER();
    const a = await afterParked();
    await a.driver.stop({ actor: 'ops' });
    const b = fresh(def);
    b.driver.resume(a.driver.checkpoint());
    ok(b.driver.resolve(APPROVE, 'done', { result: { approved: true }, actor: 'ana' }), 'answered on B');
    equal(b.sch.added, [PUBLISH], 'publish handed on there');
    void b.driver.stop({ actor: 'ops' });
    equal(b.sch.cancels, [PUBLISH], 'B stopped with publish in flight');
    const cp = b.driver.checkpoint();
    const at = cp.events.findIndex((e) => e.kind === 'resolution');
    equal(cp.events.map((e) => e.kind), ['dispatched', 'outcome', 'asked', 'interrupted', 'resumed', 'resolution', 'dispatched', 'interrupted'],
      'the stored run: park, stop, resume, the ANSWER, its dispatch, a second stop');
    const c = fresh(def);
    c.driver.resume(cp);
    equal(c.driver.foldInputs()[at], cp.events[at], 'the stored answer FED at its position (RN-R19)');
    equal(c.driver.foldInputs().filter((e) => e.kind === 'asked').length, 1, 'and the ask asked ONCE — re-parked by the replay, then answered by the fed element');
    equal(c.sch.added, [PUBLISH], 'only publish, in flight, handed on — nothing for the answered ask');
    equal(state(c.driver).nodes[APPROVE], { nodeId: 'approve', branchPath: '-', state: 'done', result: { approved: true }, error: null, input: { text: 's' } },
      'the ask reads answered, its input kept');
    equal(c.driver.resolve(APPROVE, 'done', { result: { approved: false }, actor: 'bob' }), false, 'and a second answer is refused');
    c.sch.settle(PUBLISH, 'done', 'p');
    equal(state(c.driver).outcome, 'completed', 'to `completed`');
  });

  test(DECLARED_CASES[6]!, async () => {
    const def = await AFTER();
    const a = await afterParked({}, { m: new Map([['k', 1]]), d: new Date(5), t: 'x' });
    await a.driver.stop({ actor: 'ops' });
    const cp = a.driver.checkpoint();
    const at = cp.events.findIndex((e) => e.kind === 'asked');
    const forge = (edit: (input: Record<string, unknown>) => void) => {
      const f = structuredClone(cp) as Checkpoint;
      edit(((f.events as FoldInput[])[at] as { input: Record<string, unknown> }).input);
      const d = fresh(def);
      try { d.driver.resume(f); return `resumed, handed ${JSON.stringify(d.sch.added)}`; } catch (e) {
        return e instanceof ResumeRefused ? `${e.reason}@${e.index}, handed ${JSON.stringify(d.sch.added)}` : String(e);
      }
    };
    equal(forge((i) => { (i.m as Map<string, number>).set('k', 2); }), `diverged@${at}, handed []`, 'a Map entry changed');
    equal(forge((i) => { (i.d as Date).setTime(6); }), `diverged@${at}, handed []`, 'a Date a millisecond on');
    equal(forge((i) => { i.t = 'y'; }), `diverged@${at}, handed []`, 'a plain value changed');
    equal(forge(() => {}), 'resumed, handed []', 'the CONTROL: the untouched clone resumes, past the stop');
  });

  test(DECLARED_CASES[7]!, async () => {
    const a = await afterParked();
    a.driver.pause({ actor: 'ops' });
    equal(state(a.driver).paused, true, 'the ARRANGEMENT: paused while parked on the ask');
    const before = a.seen.length;
    ok(a.driver.resolve(APPROVE, 'done', { result: { approved: true }, actor: 'ana' }), 'the answer is ACCEPTED while paused (RN-R35)');
    equal(a.seen.slice(before), ['resolution', 'dispatched'], 'appended and ROUTED: the successor`s dispatch is recorded …');
    equal([a.sch.added, a.built], [[SUMMARISE], [SUMMARISE]], '… and HELD: neither built nor handed on');
    equal([state(a.driver).nodes[PUBLISH]!.state, state(a.driver).outcome], ['running', 'running'], 'a held dispatch reads `running` (RN-R34)');
    a.driver.unpause({ actor: 'ops' });
    equal(a.seen.slice(before + 2), ['unpaused'], 'the unpause');
    equal([a.sch.added, a.built], [[SUMMARISE, PUBLISH], [SUMMARISE, PUBLISH]], 'and only then is the successor built and handed on');
    equal(a.sch.inputs.get(PUBLISH), { approved: true }, 'receiving the answer');
    // CONTROL — not paused: the same answer hands publish on in the call itself.
    const c = await afterParked();
    c.driver.resolve(APPROVE, 'done', { result: { approved: true }, actor: 'ana' });
    equal(c.sch.added, [SUMMARISE, PUBLISH], 'the CONTROL: unpaused, the successor is handed on at once');
  });

  test(DECLARED_CASES[8]!, async () => {
    const m = await fanoutParked();
    m.driver.pause({ actor: 'ops' });
    ok(m.driver.resolve(REVIEW, 'done', { result: { ok: true }, actor: 'ana' }), 'answered while paused');
    equal(m.seen.slice(-3), ['resolution', 'resumed(0)', 'arrived(0)'], 'its branch resumes and ARRIVES — routing goes on');
    m.sch.settle(SCORE, 'done', { s: 1 });
    equal(m.seen.slice(-4), ['outcome', 'arrived(1)', 'joinSettled', 'dispatched'], 'the sibling arrives, the join FIRES, its successor dispatched');
    equal(m.sch.added, [INGEST, SCORE], 'and HELD — not handed on');
    m.driver.unpause({ actor: 'ops' });
    equal(m.sch.added, [INGEST, SCORE, PUBLISH], 'the unpause hands it on');
    equal(m.sch.inputs.get(PUBLISH), { 0: { ok: true }, 1: { s: 1 } }, 'with the answer as the ask`s branch`s arrival');
  });

  test(DECLARED_CASES[9]!, async () => {
    const def = await AFTER();
    const a = await afterParked();
    a.driver.pause({ actor: 'ops' });
    a.driver.resolve(APPROVE, 'done', { result: { approved: true }, actor: 'ana' });
    equal(a.sch.added, [SUMMARISE], 'the ARRANGEMENT: publish held');
    await a.driver.stop({ actor: 'ops' });
    equal([a.sch.added, a.sch.cancels], [[SUMMARISE], []], 'the stop hands nothing on and cancels nothing: a HELD task is never the scheduler`s (RN-R33 v0.20)');
    const b = fresh(def);
    b.driver.resume(a.driver.checkpoint());
    equal(state(b.driver).paused, true, 'the resumed run is PAUSED (RN-R21 v0.20)');
    equal(b.driver.foldInputs().at(-1), { kind: 'resumed', taskIds: [PUBLISH] }, 'publish — dispatched and unsettled — is the in-flight set');
    equal([b.sch.added, b.built], [[], []], 'and HELD again: nothing handed on, nothing built');
    b.driver.unpause({ actor: 'ops' });
    equal(b.sch.added, [PUBLISH], 'the resumed run`s unpause hands it on');
    equal(b.sch.inputs.get(PUBLISH), { approved: true }, 'receiving the answer given on the stopped driver');
    b.sch.settle(PUBLISH, 'done', 'p');
    equal(state(b.driver).outcome, 'completed', 'to `completed`');
  });

  test(DECLARED_CASES[10]!, async () => {
    const def = await AFTER();
    const a = await afterParked();
    a.driver.pause({ actor: 'ops' });
    await a.driver.stop({ actor: 'ops' });
    equal(a.sch.cancels, [], 'nothing sent');
    const b = fresh(def);
    b.driver.resume(a.driver.checkpoint());
    equal([state(b.driver).paused, state(b.driver).outcome, b.sch.added], [true, 'awaiting_action', []],
      'the resumed run is PAUSED, waiting on the person, nothing handed on');
    equal(b.driver.foldInputs().filter((e) => e.kind === 'asked').map((e) => (e as { input: unknown }).input), [{ text: 's' }], 'the ask re-parked with its input');
    ok(b.driver.resolve(APPROVE, 'done', { result: { approved: true }, actor: 'ana' }), 'answered on the PAUSED resumed run');
    equal([b.seen.slice(-2), b.sch.added], [['resolution', 'dispatched'], []], 'its successor dispatched and HELD');
    b.driver.unpause({ actor: 'ops' });
    equal(b.sch.added, [PUBLISH], 'and handed on by the unpause');
  });

  test(DECLARED_CASES[11]!, async () => {
    // (a) On the `asked` element itself, a scheduler event's step (summarise's settlement), the run paused before it.
    const def = await AFTER();
    const ref: { driver?: Driver } = {};
    const answers: boolean[] = [];
    const a = make(def, {
      onFoldInput: (e: FoldInput) => { if (e.kind === 'asked') answers.push(ref.driver!.resolve(e.taskId, 'done', { result: { approved: true }, actor: 'auto' })); },
    });
    ref.driver = a.driver;
    a.driver.start({});
    a.driver.pause({ actor: 'ops' });
    a.sch.settle(SUMMARISE, 'done', { text: 's' });
    equal(answers, [true], 'accepted at the call');
    equal(a.seen, ['dispatched', 'paused', 'outcome', 'asked', 'resolution', 'dispatched'], 'the park`s step completes, the resolution follows AT REST, its dispatch recorded');
    equal(a.sch.added, [SUMMARISE], 'and HELD: the run is paused');
    const b = fresh(def);
    b.driver.resume(a.driver.checkpoint());
    equal([state(b.driver).paused, b.sch.added, b.driver.foldInputs().at(-1)], [true, [], { kind: 'resumed', taskIds: [PUBLISH] }],
      'the checkpoint resumes PAUSED — the answer fed, publish held again');
    b.driver.unpause({ actor: 'ops' });
    equal(b.sch.added, [PUBLISH], 'and the unpause hands it on');
    // (b) On a SIBLING's settlement in the fan-out, the ask already parked.
    const r2: { driver?: Driver } = {};
    const f = await fanoutParked(undefined, {
      onFoldInput: (e: FoldInput) => { if (e.kind === 'outcome' && e.record.taskId === SCORE) r2.driver!.resolve(REVIEW, 'done', { result: { ok: true }, actor: 'auto' }); },
    });
    r2.driver = f.driver;
    f.driver.pause({ actor: 'ops' });
    f.sch.settle(SCORE, 'done', { s: 1 });
    equal(f.seen.slice(-7), ['outcome', 'arrived(1)', 'resolution', 'resumed(0)', 'arrived(0)', 'joinSettled', 'dispatched'],
      'the sibling`s step completes — it arrives — then the answer, at rest: its branch arrives, the join fires, publish dispatched');
    equal(f.sch.added, [INGEST, SCORE], 'publish HELD');
    const g = fresh(await FANOUT());
    g.driver.resume(f.driver.checkpoint());
    equal([state(g.driver).paused, g.sch.added], [true, []], 'that checkpoint resumes too, paused, publish held');
    f.driver.unpause({ actor: 'ops' });
    equal(f.sch.added, [INGEST, SCORE, PUBLISH], 'and on the first driver the unpause hands it on');
  });

  test(DECLARED_CASES[12]!, async () => {
    // A driver call's step: the ENTRY ask parks inside `start()`, and the pause is raised on its `asked` element.
    const ref: { driver?: Driver } = {};
    const e = make(ENTRY, { onFoldInput: (x: FoldInput) => { if (x.kind === 'asked') ref.driver!.pause({ actor: 'ops' }); } });
    ref.driver = e.driver;
    e.driver.start({});
    equal(e.seen, ['asked', 'paused'], 'accepted mid-step — never `ended` there — and taken when `start()`s step ends');
    equal([state(e.driver).paused, state(e.driver).outcome], [true, 'awaiting_action'], 'paused, and waiting on the person');
    ok(e.driver.resolve(APPROVE, 'done', { result: 1, actor: 'ana' }), 'answered while paused');
    equal([e.seen.slice(-2), e.sch.added], [['resolution', 'dispatched'], []], 'its successor held');
    // A scheduler event's step: the fan-out's ask parks on ingest's settlement, and the pause is raised there.
    const r2: { driver?: Driver } = {};
    const f = make(await FANOUT(), { onFoldInput: (x: FoldInput) => { if (x.kind === 'asked') r2.driver!.pause({ actor: 'ops' }); } });
    r2.driver = f.driver;
    f.driver.start({});
    f.sch.settle(INGEST, 'done', { n: 1 });
    equal(f.seen.slice(2), ['regionEntered', 'opened(0)', 'opened(1)', 'asked', 'suspended(0)', 'dispatched', 'paused'],
      'the step completes unpaused — the park`s region event, the sibling`s dispatch — and THEN the pause');
    equal(f.sch.added, [INGEST, SCORE], 'so the sibling dispatched on that step WAS handed on');
  });

  test(DECLARED_CASES[13]!, async () => {
    // A driver call's step: the ENTRY ask, the stop raised on its `asked` element inside `start()`.
    const ref: { driver?: Driver } = {};
    const e = make(ENTRY, { onFoldInput: (x: FoldInput) => { if (x.kind === 'asked') void ref.driver!.stop({ actor: 'ops' }); } });
    ref.driver = e.driver;
    e.driver.start({ q: 1 });
    equal(e.seen, ['asked', 'interrupted'], 'accepted mid-step and taken when the step ends');
    equal([e.sch.cancels, e.sch.added], [[], []], 'nothing sent, nothing handed on');
    equal(e.driver.resolve(APPROVE, 'done', { result: 1, actor: 'ana' }), false, 'the answer refused on this driver');
    const eb = fresh(ENTRY);
    eb.driver.resume(e.driver.checkpoint());
    equal([eb.sch.added, state(eb.driver).nodes[APPROVE]!.input], [[], { q: 1 }], 'resumed elsewhere: re-parked with its input, nothing handed on');
    ok(eb.driver.resolve(APPROVE, 'done', { result: 1, actor: 'ana' }), 'and answered there');
    equal(eb.sch.added, [PUBLISH], 'routing on');
    // A scheduler event's step: the fan-out's ask, the stop raised on its `asked` element during ingest's settlement.
    const def = await FANOUT();
    const r2: { driver?: Driver } = {};
    const f = make(def, { onFoldInput: (x: FoldInput) => { if (x.kind === 'asked') void r2.driver!.stop({ actor: 'ops' }); } });
    r2.driver = f.driver;
    f.driver.start({});
    f.sch.settle(INGEST, 'done', { n: 1 });
    equal(f.seen.slice(2), ['regionEntered', 'opened(0)', 'opened(1)', 'asked', 'suspended(0)', 'dispatched', 'interrupted'],
      'the step is WHOLE in the log — the sibling dispatched — and the stop lands after it');
    equal([f.sch.added, f.sch.cancels], [[INGEST, SCORE], [SCORE]], 'the sibling handed on in the step and cancelled by the stop; nothing for the ask');
    const fb = fresh(def);
    fb.driver.resume(f.driver.checkpoint());
    equal(fb.sch.added, [SCORE], 'resumed: the sibling re-dispatched, the ask re-parked');
    equal(state(fb.driver).nodes[REVIEW]!.state, 'suspended', 'waiting on the person');
  });

  test(DECLARED_CASES[14]!, async () => {
    const ref: { driver?: Driver } = {};
    const a = make(await AFTER(), { onFoldInput: (x: FoldInput) => { if (x.kind === 'asked') ref.driver!.unpause({ actor: 'ops' }); } });
    ref.driver = a.driver;
    a.driver.start({});
    a.driver.pause({ actor: 'ops' });
    a.sch.settle(SUMMARISE, 'done', { text: 's' });
    equal(a.seen, ['dispatched', 'paused', 'outcome', 'asked', 'unpaused'], 'the unpause raised on the `asked` element is taken at rest');
    equal(state(a.driver).paused, false, 'the run is no longer paused');
    a.driver.resolve(APPROVE, 'done', { result: { approved: true }, actor: 'ana' });
    equal(a.sch.added, [SUMMARISE, PUBLISH], 'so the answer`s successor is handed on at once');
    // A DRIVER CALL's step: `resume()` of the same paused run whose store lost the tail from the `asked` element on — the
    // replay feeds `paused`, regenerates `asked` past the stored events and delivers it, and the unpause is raised there.
    const paused = make(await AFTER());
    paused.driver.start({});
    paused.driver.pause({ actor: 'ops' });
    paused.sch.settle(SUMMARISE, 'done', { text: 's' });
    const cp = paused.driver.checkpoint();
    const lost = { header: cp.header, events: cp.events.slice(0, cp.events.findIndex((e) => e.kind === 'asked')) };
    const r2: { driver?: Driver } = {};
    const z = fresh(await AFTER(), { onFoldInput: (x: FoldInput) => { if (x.kind === 'asked') r2.driver!.unpause({ actor: 'ops' }); } });
    r2.driver = z.driver;
    z.driver.resume(lost);
    equal(z.seen, ['asked', 'resumed', 'unpaused'], 'on resume()`s step the unpause is taken at rest, after `resumed`');
    equal(state(z.driver).paused, false, 'the resumed run is no longer paused');
    z.driver.resolve(APPROVE, 'done', { result: { approved: true }, actor: 'ana' });
    equal(z.sch.added, [PUBLISH], 'and the answer`s successor is handed on at once');
    // CONTROL — the same resume with no unpause stays paused, and the successor is held.
    const y = fresh(await AFTER());
    y.driver.resume(lost);
    y.driver.resolve(APPROVE, 'done', { result: { approved: true }, actor: 'ana' });
    equal([state(y.driver).paused, y.sch.added], [true, []], 'the CONTROL: resumed PAUSED, the successor held');
  });

  test(DECLARED_CASES[15]!, async () => {
    // The store LOST the tail past the settlement: the replay regenerates the `asked` element PAST the stored events and
    // DELIVERS it (`RN-R24`), and the consumer's callback raises run control there — on `resume()`'s own step.
    const def = await AFTER();
    const first = await afterParked();
    const cp = first.driver.checkpoint();
    const lost = { header: cp.header, events: cp.events.slice(0, cp.events.findIndex((e) => e.kind === 'asked')) };
    const on = (control: 'cancel' | 'stop' | 'pause') => {
      const ref: { driver?: Driver } = {};
      const z = fresh(def, { onFoldInput: (x: FoldInput) => {
        if (x.kind !== 'asked') return;
        if (control === 'pause') ref.driver!.pause({ actor: 'ops' }); else void ref.driver![control]({ actor: 'ops' });
      } });
      ref.driver = z.driver;
      z.driver.resume(lost);
      return z;
    };
    const c = on('cancel');
    // A cancel is taken where it is called (`RN-R31`), so it lands on the regenerated element, before `resumed`.
    equal(c.seen, ['asked', 'cancelRequested', 'resumed'], 'CANCEL: the element regenerated and delivered, the cancel on it, then `resumed`');
    equal([c.sch.added, c.sch.cancels, state(c.driver).outcome], [[], [], 'cancelled'], 'nothing handed on, nothing sent, `cancelled` at once');
    const s = on('stop');
    // A stop is taken AT REST — when `resume()`'s step ends, after `resumed` (`RN-R33`).
    equal(s.seen, ['asked', 'resumed', 'interrupted'], 'STOP: pending on the regenerated element, taken when resume() returns');
    equal([s.sch.added, s.sch.cancels, state(s.driver).outcome], [[], [], 'interrupted'], 'nothing handed on, nothing sent, `interrupted`');
    equal(s.driver.resolve(APPROVE, 'done', { result: { approved: true }, actor: 'a' }), false, 'and the answer refused there');
    const p = on('pause');
    equal(p.seen, ['asked', 'resumed', 'paused'], 'PAUSE: taken at rest too, after `resumed`');
    equal([state(p.driver).paused, state(p.driver).outcome], [true, 'awaiting_action'], 'paused, waiting on the person');
    ok(p.driver.resolve(APPROVE, 'done', { result: { approved: true }, actor: 'a' }), 'the answer accepted while paused');
    equal(p.sch.added, [], 'and its successor held');
  });

  test(DECLARED_CASES[16]!, async () => {
    const def = await AFTER();
    /** The run, its `asked` element's callback making the two calls in `order`. */
    const drive = (order: string[]) => {
      const ref: { driver?: Driver } = {};
      const answers: boolean[] = [];
      const m = make(def, { onFoldInput: (x: FoldInput) => {
        if (x.kind !== 'asked') return;
        for (const call of order) {
          if (call === 'answer') answers.push(ref.driver!.resolve(APPROVE, 'done', { result: { approved: true }, actor: 'p' }));
          else if (call === 'pause') ref.driver!.pause({ actor: 'ops' });
          else void ref.driver!.stop({ actor: 'ops' });
        }
      } });
      ref.driver = m.driver;
      m.driver.start({});
      m.sch.settle(SUMMARISE, 'done', { text: 's' });
      return { ...m, answers };
    };
    const ap = drive(['answer', 'pause']);
    equal(ap.seen.slice(2), ['asked', 'resolution', 'dispatched', 'paused'], 'answer THEN pause: the answer is taken first, unpaused …');
    equal(ap.sch.added, [SUMMARISE, PUBLISH], '… so its successor is handed on');
    const pa = drive(['pause', 'answer']);
    equal(pa.seen.slice(2), ['asked', 'paused', 'resolution', 'dispatched'], 'pause THEN answer: the pause is taken first …');
    equal(pa.sch.added, [SUMMARISE], '… so the successor is HELD');
    const as = drive(['answer', 'stop']);
    equal([as.answers, as.seen.slice(2)], [[true], ['asked', 'resolution', 'dispatched', 'interrupted']],
      'answer THEN stop: the answer, accepted before the stop was, is taken first and its successor handed on — then the stop');
    equal(as.sch.cancels, [PUBLISH], 'which cancels that successor, now in flight');
    const b = fresh(def);
    b.driver.resume(as.driver.checkpoint());
    equal([b.sch.added, state(b.driver).nodes[APPROVE]!.state], [[PUBLISH], 'done'], 'and the resume re-dispatches it, the answer fed');
    const sa = drive(['stop', 'answer']);
    equal([sa.answers, sa.seen.slice(2)], [[false], ['asked', 'interrupted']], 'stop THEN answer: the answer is REFUSED — a stop accepted refuses it (P34 decision 9)');
    equal(sa.sch.cancels, [], 'and nothing is sent: the ask is the only thing waiting');
  });

  test(DECLARED_CASES[17]!, async () => {
    // Beside a PARKED task: the sibling ends `user_action`, so nothing is in flight.
    const def = await FANOUT();
    const a = await fanoutParked(def);
    a.sch.settle(SCORE, 'user_action');
    await a.driver.stop({ actor: 'ops' });
    equal([a.sch.cancels, state(a.driver).outcome], [[], 'interrupted'], 'nothing sent for either — `interrupted`');
    equal([a.driver.resolve(REVIEW, 'done', { result: { ok: true }, actor: 'a' }), a.driver.resolve(SCORE, 'done', { result: { s: 2 }, actor: 'a' })],
      [false, false], 'the ask`s answer and the task`s resolution both refused on the stopping driver');
    const b = fresh(def);
    b.driver.resume(a.driver.checkpoint());
    equal([b.sch.added, b.driver.foldInputs().at(-1)], [[], { kind: 'resumed', taskIds: [] }], 'resumed: nothing handed on, nothing in flight');
    equal([state(b.driver).nodes[REVIEW]!.state, state(b.driver).nodes[SCORE]!.state, state(b.driver).outcome], ['suspended', 'suspended', 'awaiting_action'],
      'BOTH re-parked — the ask regenerated, the task`s settlement fed');
    ok(b.driver.resolve(REVIEW, 'done', { result: { ok: true }, actor: 'ana' }), 'the ask answered on B');
    equal(b.sch.added, [], 'the join waits for the parked task');
    ok(b.driver.resolve(SCORE, 'done', { result: { s: 2 }, actor: 'ana' }), 'the task resolved on B');
    equal(b.sch.added, [PUBLISH], 'the join fires');
    b.sch.settle(PUBLISH, 'done', 'p');
    equal(state(b.driver).outcome, 'completed', 'to `completed`');
  });

  test(DECLARED_CASES[18]!, async () => {
    // Beside a PARKED task, paused: the answer arrives, the join waits for the task's resolution, then its successor is held.
    const m = await fanoutParked();
    m.sch.settle(SCORE, 'user_action');
    m.driver.pause({ actor: 'ops' });
    ok(m.driver.resolve(REVIEW, 'done', { result: { ok: true }, actor: 'ana' }), 'the ask answered while paused');
    ok(m.driver.resolve(SCORE, 'done', { result: { s: 2 }, actor: 'ana' }), 'the parked task resolved while paused');
    equal(m.seen.slice(-2), ['joinSettled', 'dispatched'], 'the join fires and publish is dispatched …');
    equal(m.sch.added, [INGEST, SCORE], '… and HELD');
    m.driver.unpause({ actor: 'ops' });
    equal(m.sch.added, [INGEST, SCORE, PUBLISH], 'the unpause hands it on');
    // In a MAP: two asks, both answered while paused — the join fires on the second, its successor held.
    const map = make(MAP);
    map.driver.start({});
    map.sch.settle(INGEST, 'done', { files: ['a', 'b'] });
    map.driver.pause({ actor: 'ops' });
    ok(map.driver.resolve('r1:approve:1:0', 'done', { result: 'b!', actor: 'p' }), 'item 1 answered while paused');
    equal(map.seen.at(-1), 'arrived(1)', 'it arrives; the join waits for item 0');
    ok(map.driver.resolve('r1:approve:0:0', 'done', { result: 'a!', actor: 'p' }), 'item 0 answered');
    equal([map.seen.slice(-2), map.sch.added], [['joinSettled', 'dispatched'], [INGEST]], 'the join fires, publish dispatched and HELD');
    map.driver.unpause({ actor: 'ops' });
    equal(map.sch.added, [INGEST, PUBLISH], 'the unpause hands it on');
    equal(map.sch.inputs.get(PUBLISH), { 0: 'a!', 1: 'b!' }, 'carrying both answers');
  });

  test(DECLARED_CASES[19]!, () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name)).sort();
    const declared = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run — it was deleted, renamed, or its suite stopped loading');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name. Add it here in the same commit');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership, which catches a duplicated name');
  });
});
