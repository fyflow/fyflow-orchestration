/**
 * **L2 — asking and answering in a run** — `spec/run-state.md` `RN-R37` (v0.22), `spec/outcome-record.md` `RS-R1` and
 * section 7 (v0.18), `spec/flow-definition.md` `FD-R4` (v0.43), `spec/join-policy.md` `JP-R5` (v0.23);
 * [ADR 0109](../../doc/decisions/0109-an-ask-parks-with-nothing-dispatched-and-its-answer-is-its-result.md),
 * [W180](../../doc/work-items/w180-asking-and-answering-in-a-run.md), P35 stop-and-asks (b)-(f).
 *
 * **Every expected value is written from those rows**, never from a run: an ask PARKS — one `asked` element carrying
 * what reached it, NOTHING handed to the scheduler, the node `suspended` and the run `awaiting_action`; the person's
 * answer is `resolve()`, a `done` answer held to `answerSchema` and a `failed` one a decline held to nothing; the
 * answer IS the node's result, derived as section 7's effective outcome of an ask (`attempts` 0, every scheduler
 * field `null`), and routes as a task's settlement does. Each claim sits beside a CONTROL that differs by the one
 * thing the claim is about — most often the same flow with the ask replaced by a task — and every case asserts on the
 * scheduler's `addTask` calls as well as on the sequence, because *nothing handed to the scheduler* is a claim about
 * the scheduler.
 */
import { collected, equal, ok, readText, ROOT, suite } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { BoundaryRefused, Driver, DuplicateTaskId, ResumeRefused, RunControlRefused, UndispatchedTask } from '../../src/driver/driver.ts';
import type { Checkpoint } from '../../src/driver/driver.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';
import type { DecisionContext } from '../../src/driver/routing.ts';
import type { FlowDefinition } from '../../src/definition/types.ts';
import { fold, type FoldInput } from '../../src/fold/run-state.ts';
import { liveToken } from '../../src/fold/policies.ts';

const SUITE = 'L2 — RN-R37: asking and answering in a run — an ask parks with nothing handed to the scheduler, and its answer is its result';

const EX = `${ROOT}spec/examples`;
const load = async (rel: string) => JSON.parse(await readText(`${EX}/${rel}`)) as FlowDefinition;
const TYPES = typesFor(['IngestWorker', 'ScoreWorker', 'PublishWorker', 'ReviewWorker']);

/** A scheduler double: it RECORDS every `addTask` and every `cancel`, and fires nothing on its own. */
class Fake {
  readonly added: { id: string; payload: { input?: unknown } }[] = [];
  readonly cancelled: string[] = [];
  private readonly listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(t: unknown): void { this.added.push(t as { id: string; payload: { input?: unknown } }); }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
  }
  cancel(id: string): Promise<boolean> { this.cancelled.push(id); return Promise.resolve(true); }
  ids(): string[] { return this.added.map((t) => t.id); }
  inputOf(id: string): unknown { return this.added.find((t) => t.id === id)?.payload?.input; }
  settle(id: string, state: 'done' | 'user_action' | 'cancelled', result: unknown = null): void {
    const detail = { id, state, result, error: state === 'done' ? null : 'x', attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
    const ev = state === 'done' ? ['task.completed'] : state === 'cancelled' ? ['task.cancelled'] : ['task.failed', 'task.user_action'];
    for (const name of ev) for (const fn of this.listeners.get(name) ?? []) fn({ detail });
  }
}

interface Made {
  driver: Driver;
  sch: Fake;
  failures: { kind: string; message: string }[];
  /** The kinds `onFoldInput` was handed, in order, with the region event's type where there is one. */
  seen: string[];
}

function make(def: FlowDefinition, extra: Record<string, unknown> = {}, predicates: Map<string, (c: DecisionContext) => boolean> = new Map()): Made {
  const sch = new Fake();
  const failures: Made['failures'] = [];
  const seen: string[] = [];
  const userFoldInput = extra.onFoldInput as ((e: FoldInput, seq: number) => void) | undefined;
  const driver = new Driver(def, {
    runId: 'r1', scheduler: sch as never, createTask: (c) => c as never, predicates, now: () => 42,
    joinPolicy: liveToken as unknown as JoinPolicy, ...TYPES,
    onRunFailure: (f) => failures.push({ kind: f.kind, message: f.message }),
    ...extra,
    onFoldInput: (e, seq) => {
      seen.push(e.kind === 'region' ? `${e.event.type.replace('branch.', '')}(${e.event.branchPath})` : e.kind);
      userFoldInput?.(e, seq);
    },
  });
  return { driver, sch, failures, seen };
}

const outcome = (d: Driver) => fold(d.foldInputs()).outcome;
const nodeOf = (d: Driver, id: string) => fold(d.foldInputs()).nodes[id];
const askedOf = (d: Driver) => d.foldInputs().filter((e) => e.kind === 'asked');

/** The ENTRY ask: `needs: { request: "." }`, a decline, a `when` over the answer, and a default — and its task twin. */
const ENTRY = (asTask = false): FlowDefinition => ({
  flowId: 'ask-entry', version: 1, entry: 'approve',
  nodes: [
    asTask
      ? { id: 'approve', kind: 'task', type: 'ReviewWorker', needs: { request: '.' },
        edges: [{ on: ['failed'], to: 'declined' }, { when: { path: 'outcome.result.approved', op: 'eq', value: true }, to: 'publish' }, { to: 'declined' }] }
      : { id: 'approve', kind: 'ask', needs: { request: '.' },
        answerSchema: { type: 'object', required: ['approved'], properties: { approved: { type: 'boolean' } } },
        edges: [{ on: ['failed'], to: 'declined' }, { when: { path: 'outcome.result.approved', op: 'eq', value: true }, to: 'publish' }, { to: 'declined' }] },
    { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
    { id: 'declined', kind: 'end', outcome: 'declined' },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
}) as unknown as FlowDefinition;

const A = 'r1:approve:-:0';

const DECLARED_CASES = [
  'an ENTRY ask parks: one `asked` element carrying the composed input, nothing handed to the scheduler, the run awaiting_action',
  'an ask AFTER a task keeps the predecessor`s result as its input, and nothing is handed on past it',
  'a done answer IS the node`s result: routed by `when` over the answer, handed to the successor, and the input still reachable by `needs`',
  'a predicate sees the DERIVED outcome of an ask: attempts 0, every scheduler field null',
  'a decline (`failed`) routes `on: ["failed"]`, held to nothing — and with no failed edge the path ends `no-eligible-edge`',
  'FD-R4 at the answer: a refused answer is thrown by name with NOTHING appended, the ask still parked, and the corrected one routes',
  'RS-R1 widened: a second answer, an id never asked, and an ask not yet reached are each refused with nothing appended',
  'an ask as a fan-out`s branch entry holds the join until answered, and every branch.opened precedes its branch.suspended (JP-R5)',
  'an ask as a MAP`s branch: one ask and one kept item per instance, every branch.opened first, answered in any order',
  'an ask inside a branch BEFORE its join, reached through a task: the join waits for the person',
  'an answer given MID-STEP on the `asked` element is accepted and TAKEN AT REST: the park completes, the resolution follows the step, and the checkpoint resumes',
  'the same, in a MAP, and the refusals still at the call: a second answer while one is pending, an FD-R4 refusal thrown at once, a cancel on the step dropping the pending answer',
  'the `asked` input is compared as STRUCTURED-CLONE data at a resume: a changed Map, Set, Date or array hole is refused diverged, the unchanged one resumes',
  'a consumer callback throwing on a driver call`s step: on `resolve()` the throw reaches its caller after the element, the run HALTED and reported once (W184); on `resume()` it reaches the caller and the run is halted',
  'a resume RE-CREATES the `asked` element at its position: the same input re-parks with nothing re-dispatched, a different one is refused diverged there',
  'a consumer callback THROWING on `asked`: on a driver call it reaches the caller after the element; on a scheduler event`s step it is reported once and halts the run',
  'the three `ended` refusals count an unanswered ask as parked: cancel, stop and pause are each accepted on a run waiting only on an ask',
  'ID-R4 for an ask`s id: a settlement carrying it is UndispatchedTask — an ask is never dispatched',
  'RN-R29 at the park: a CANCEL raised on the `asked` element emits no branch.suspended and enters no further branch',
  'RN-R29 BEFORE the park: a halt raised while `needs` composes the entry payload parks nothing',
  'ID-R1 for an ask`s id: a settlement delivered TWICE re-enters the ask, and the second park is refused DuplicateTaskId',
  'EVERY mid-step resolution is taken at rest: a parked TASK resolved on its own user_action element in a region reads in order, folds consistently and resumes',
  'every case this suite declares actually ran — a deleted case fails naming itself',
];

suite(SUITE, (test) => {
  test(DECLARED_CASES[0]!, () => {
    const m = make(ENTRY());
    const payload = { doc: { title: 'x' } };
    m.driver.start(payload);
    equal(m.sch.ids(), [], 'NOTHING handed to the scheduler — an ask is never dispatched');
    // And no TASK is BUILT for it either: `createTask` is never called (the adequacy reader's T09).
    const made: unknown[] = [];
    const mk = make(ENTRY(), { createTask: (c: unknown) => { made.push(c); return c as never; } });
    mk.driver.start({});
    equal(made, [], '`createTask` is never called for an ask');
    equal(m.driver.dispatchedIds(), [], 'and no dispatch is recorded');
    equal(m.seen, ['asked'], 'ONE element, `asked` — no `dispatched`, no outcome record');
    equal(m.driver.foldInputs()[0], { kind: 'asked', taskId: A, input: { request: { doc: { title: 'x' } } }, observedAt: 42 },
      'its task id by task-id`s scheme, attempt 0, and its input what `needs: { request: "." }` composed');
    equal(m.driver.snapshot(), [], 'the LOG is empty: a park is not a record (P35 decision 5)');
    equal(nodeOf(m.driver, A), { runId: 'r1', nodeId: 'approve', branchPath: '-', flowAttempt: 0, attemptNumber: null, state: 'suspended', result: null, error: null, input: { request: { doc: { title: 'x' } } }, askedAt: 42 },
      'the node `suspended`, its input KEPT');
    equal(outcome(m.driver), 'awaiting_action', 'the run `awaiting_action` (RN-R7)');
    payload.doc.title = 'MOVED';
    equal((m.driver.foldInputs()[0] as { input: unknown }).input, { request: { doc: { title: 'x' } } },
      'the kept input is the driver`s OWN copy: the caller`s object moving later moves nothing');
    // And what a CONSUMER is handed is a copy too (`RN-R17`, `freezeInput`'s asked arm): a write into the input of an
    // element `foldInputs()` handed out — below its frozen top level — reaches nothing the driver holds.
    const handed = (m.driver.foldInputs()[0] as { input: { request: { doc: { title: string } } } }).input;
    handed.request.doc.title = 'WRITTEN BY A CONSUMER';
    equal((m.driver.foldInputs()[0] as { input: unknown }).input, { request: { doc: { title: 'x' } } },
      'a consumer writing into a handed-out input moves nothing the driver holds');
    // And with NO `needs`, where what reaches the entry ask IS the caller's own `start()` payload — the road on which only
    // the park's own copy stands between the caller's object and the kept input (`needs` composes a fresh object).
    const bare = make({ flowId: 'ask-bare-entry', version: 1, entry: 'approve', nodes: [
      { id: 'approve', kind: 'ask', edges: [{ to: 'done' }] }, { id: 'done', kind: 'end', outcome: 'completed' },
    ] } as unknown as FlowDefinition);
    const own = { doc: { title: 'x' } };
    bare.driver.start(own);
    own.doc.title = 'MOVED';
    equal((bare.driver.foldInputs()[0] as { input: unknown }).input, { doc: { title: 'x' } }, 'with no `needs`, the caller`s payload is COPIED at the park');
    equal(nodeOf(bare.driver, A)!.input, { doc: { title: 'x' } }, 'and the fold reads the copy');
    // CONTROL — the same node as a task: dispatched, with no `asked` element.
    const c = make(ENTRY(true));
    c.driver.start({ doc: { title: 'x' } });
    equal(c.sch.ids(), [A], 'the CONTROL: a task in the ask`s place IS handed to the scheduler, at the same id');
    equal(c.seen, ['dispatched'], 'and appends `dispatched`, not `asked`');
    equal(outcome(c.driver), 'running', 'and reads `running`');
  });

  test(DECLARED_CASES[1]!, async () => {
    const m = make(await load('valid/ask-after-a-task.flow.json'));
    m.driver.start({ seed: 1 });
    equal(m.sch.ids(), ['r1:summarise:-:0'], 'the task before the ask is dispatched');
    m.sch.settle('r1:summarise:-:0', 'done', { text: 'a summary' });
    equal(m.sch.ids(), ['r1:summarise:-:0'], 'nothing is handed on past the ask');
    equal(m.seen, ['dispatched', 'outcome', 'asked'], 'the settlement, then the park');
    equal(askedOf(m.driver), [{ kind: 'asked', taskId: A, input: { text: 'a summary' }, observedAt: 42 }],
      'the kept input is the predecessor`s RESULT — the ordinary edge`s value, the ask declaring no `needs`');
    equal(outcome(m.driver), 'awaiting_action', 'awaiting the person');
    equal(m.failures, [], 'nothing reported');
  });

  test(DECLARED_CASES[2]!, async () => {
    const yes = make(await load('valid/ask-after-a-task.flow.json'));
    yes.driver.start({});
    yes.sch.settle('r1:summarise:-:0', 'done', { text: 's' });
    ok(yes.driver.resolve(A, 'done', { result: { approved: true }, actor: 'ana' }), 'the answer is accepted');
    equal(yes.sch.ids(), ['r1:summarise:-:0', 'r1:publish:-:0'], 'approved: the `when` over `outcome.result.approved` takes `publish`');
    equal(yes.sch.inputOf('r1:publish:-:0'), { approved: true }, 'and the successor RECEIVES the answer (FD-C1: the node`s result)');
    equal(yes.driver.snapshot(), [
      { kind: 'outcome', taskId: 'r1:summarise:-:0', terminalState: 'done', result: { text: 's' }, error: null, attempts: 0, schedulerTimestamp: 1, observedAt: 42, startTime: 1, endTime: 2, executionTime: 1 },
      { kind: 'resolution', taskId: A, resolvedAs: 'done', result: { approved: true }, error: null, actor: 'ana', observedAt: 42 },
    ], 'the answer is the EXISTING resolution record (P35 (b)) — the log gains no new kind');
    const n = nodeOf(yes.driver, A);
    equal(n, { runId: 'r1', nodeId: 'approve', branchPath: '-', flowAttempt: 0, attemptNumber: null, state: 'done', result: { approved: true }, error: null, input: { text: 's' }, askedAt: 42 },
      'the node `done`, its result the answer, its input KEPT after the answer (P35 (f))');
    // The other road: not approved — the DEFAULT edge, to `revise`, whose `needs` reaches BOTH the input's producer and the answer.
    const no = make(await load('valid/ask-after-a-task.flow.json'));
    no.driver.start({});
    no.sch.settle('r1:summarise:-:0', 'done', { text: 's' });
    ok(no.driver.resolve(A, 'done', { result: { approved: false, note: 'tighten it' }, actor: 'ana' }), 'accepted');
    equal(no.sch.ids(), ['r1:summarise:-:0', 'r1:revise:-:0'], 'not approved: the default edge takes `revise`, never `publish`');
    equal(no.sch.inputOf('r1:revise:-:0'), { draft: { text: 's' }, answer: { approved: false, note: 'tighten it' } },
      '`needs: { draft: "summarise", answer: "approve" }` — the value that reached the ask by naming its producer, and the answer by naming the ask (P35 (e))');
  });

  test(DECLARED_CASES[3]!, () => {
    let ctx: DecisionContext | null = null;
    const def = {
      flowId: 'ask-ctx', version: 1, entry: 'approve',
      nodes: [
        { id: 'approve', kind: 'ask', edges: [{ when: { predicate: 'look' }, to: 'done' }, { to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const m = make(def, {}, new Map([['look', (c: DecisionContext) => { ctx = c; return true; }]]));
    m.driver.start({});
    equal(ctx, null, 'no predicate runs while the ask waits — a suspended node has no effective outcome');
    ok(m.driver.resolve(A, 'done', { result: { pick: 1 }, actor: 'p' }), 'accepted');
    equal(ctx!.outcome, {
      kind: 'outcome', taskId: A, terminalState: 'done', result: { pick: 1 }, error: null,
      attempts: 0, schedulerTimestamp: null, observedAt: 42, startTime: null, endTime: null, executionTime: null,
    }, 'section 7`s effective outcome of an ASK: the answer`s state and result, attempts 0, every scheduler field null, observedAt the answer`s');
    equal(m.driver.effectiveOutcomeOf(A), ctx!.outcome, 'and `effectiveOutcomeOf` reads the same record');
    // CONTROL — a resolved TASK keeps its settlement's scheduler fields.
    const c = make(ENTRY(true));
    c.driver.start({});
    c.sch.settle(A, 'user_action');
    ok(c.driver.resolve(A, 'done', { result: { approved: false }, actor: 'p' }), 'the CONTROL task resolves');
    equal(c.driver.effectiveOutcomeOf(A)!.schedulerTimestamp, 1, 'the CONTROL: a resolved TASK`s outcome keeps the scheduler`s stamp');
    equal(c.driver.effectiveOutcomeOf(A)!.startTime, 1, 'and its timing');
  });

  test(DECLARED_CASES[4]!, () => {
    const m = make(ENTRY());
    m.driver.start({});
    ok(m.driver.resolve(A, 'failed', { error: 'not this one', result: { approved: 'anything' }, actor: 'ana' }),
      'a decline is accepted — held to NOTHING, so a value the answerSchema would refuse does not refuse it');
    equal(m.sch.ids(), [], 'nothing dispatched: the decline`s edge goes to an `end`');
    equal(m.driver.snapshot()[0], { kind: 'resolution', taskId: A, resolvedAs: 'failed', result: null, error: 'not this one', actor: 'ana', observedAt: 42 },
      'the decline is a `failed` resolution: its error kept, its result null');
    const s = fold(m.driver.foldInputs());
    equal(s.pathEnds, [{ reason: 'end', at: 'declined' }], 'routed `on: ["failed"]` to `declined`');
    equal(s.outcome, 'completed', 'a path ended at an `end` — `completed` (section 3, not *some node failed*)');
    equal(s.nodes[A]!.state, 'failed', 'and the node reads `failed`, its error the decline`s');
    // No failed edge: the path ends `no-eligible-edge` and the run is `failed` — RS-R3, as for a resolved task.
    const bare = make({ flowId: 'ask-bare', version: 1, entry: 'approve', nodes: [
      { id: 'approve', kind: 'ask', edges: [{ to: 'done' }] }, { id: 'done', kind: 'end', outcome: 'completed' },
    ] } as unknown as FlowDefinition);
    bare.driver.start({});
    ok(bare.driver.resolve(A, 'failed', { actor: 'ana' }), 'declined with no `error` given');
    equal(bare.driver.snapshot()[0]!.error, 'resolved as failed', 'the default decline error');
    equal(fold(bare.driver.foldInputs()).pathEnds, [{ reason: 'no-eligible-edge', at: 'approve' }], 'no failed edge: the path ends there');
    equal(outcome(bare.driver), 'failed', 'and the run is `failed`');
  });

  test(DECLARED_CASES[5]!, () => {
    const m = make(ENTRY());
    m.driver.start({});
    const before = m.driver.foldInputs().length;
    let err: unknown;
    try { m.driver.resolve(A, 'done', { result: { approved: 'yes' }, actor: 'ana' }); } catch (e) { err = e; }
    ok(err instanceof BoundaryRefused, `refused BY NAME: ${String(err)}`);
    const b = err as BoundaryRefused;
    equal([b.boundary, b.nodeId, b.taskId], ['resolve', 'approve', A], 'naming the resolve boundary, the ask and its task id');
    ok(b.findings.length > 0 && b.findings.some((f) => f.path.includes('approved')), `with the finding that refused it: ${JSON.stringify(b.findings)}`);
    ok(b.message.includes('answerSchema'), `and the message names the ask's answerSchema: ${b.message}`);
    equal(m.driver.foldInputs().length, before, 'NOTHING appended');
    equal(m.driver.snapshot(), [], 'no record');
    equal(nodeOf(m.driver, A)!.state, 'suspended', 'the ask is STILL parked');
    let noResult: unknown;
    try { m.driver.resolve(A, 'done', { actor: 'ana' }); } catch (e) { noResult = e; }
    ok(noResult instanceof BoundaryRefused, 'a `done` answer with NO result is held as `null` — refused by an object schema');
    // Held as `null` and not as anything else (`FD-R4`: *a `done` resolution with no `result` is held as `null`*): a schema
    // that admits every object but not `null` refuses the answer with no result, and admits `{}`.
    const anyObject = make({ flowId: 'ask-any-object', version: 1, entry: 'approve', nodes: [
      { id: 'approve', kind: 'ask', answerSchema: { type: 'object' }, edges: [{ to: 'done' }] }, { id: 'done', kind: 'end', outcome: 'completed' },
    ] } as unknown as FlowDefinition);
    anyObject.driver.start({});
    let bare: unknown;
    try { anyObject.driver.resolve(A, 'done', { actor: 'ana' }); } catch (e) { bare = e; }
    ok(bare instanceof BoundaryRefused, 'no result, held as `null`: refused by `{ type: "object" }`');
    ok(anyObject.driver.resolve(A, 'done', { result: {}, actor: 'ana' }), 'the CONTROL: `{}` is admitted by the same schema');
    ok(m.driver.resolve(A, 'done', { result: { approved: true }, actor: 'ana' }), 'the CORRECTED answer is accepted on the same driver');
    equal(m.sch.ids(), ['r1:publish:-:0'], 'and routes by `when` over it, to `publish`');
    equal(m.failures, [], 'a refused answer is a rejected command — never a run failure');
    // `validateBoundaries: false` turns it off: the same refused value is accepted, and routes by the same `when`.
    const off = make(ENTRY(), { validateBoundaries: false });
    off.driver.start({});
    ok(off.driver.resolve(A, 'done', { result: { approved: 'yes' }, actor: 'ana' }), 'with the switch OFF the value is accepted');
    equal(fold(off.driver.foldInputs()).pathEnds, [{ reason: 'end', at: 'declined' }], '`"yes"` is not `true`, so the default edge takes it');
    // An ask with NO answerSchema holds nothing.
    const free = make({ flowId: 'ask-free', version: 1, entry: 'approve', nodes: [
      { id: 'approve', kind: 'ask', edges: [{ to: 'done' }] }, { id: 'done', kind: 'end', outcome: 'completed' },
    ] } as unknown as FlowDefinition);
    free.driver.start({});
    ok(free.driver.resolve(A, 'done', { result: 7, actor: 'ana' }), 'no answerSchema: any answer is accepted');
    equal(outcome(free.driver), 'completed', 'and routes');
  });

  test(DECLARED_CASES[6]!, async () => {
    const m = make(await load('valid/ask-after-a-task.flow.json'));
    m.driver.start({});
    const n0 = m.driver.foldInputs().length;
    equal(m.driver.resolve(A, 'done', { result: { approved: true }, actor: 'early' }), false,
      'the ask is not REACHED yet (its predecessor runs) — not suspended, refused');
    equal(m.driver.foldInputs().length, n0, 'nothing appended');
    m.sch.settle('r1:summarise:-:0', 'done', { text: 's' });
    equal(m.driver.resolve('r1:nope:-:0', 'done', { result: { approved: true }, actor: 'x' }), false, 'an id never asked is refused');
    ok(m.driver.resolve(A, 'done', { result: { approved: true }, actor: 'ana' }), 'the first answer is accepted');
    const n1 = m.driver.foldInputs().length;
    equal(m.driver.resolve(A, 'done', { result: { approved: false }, actor: 'bob' }), false, 'a SECOND answer is refused like a second resolution');
    equal(m.driver.resolve(A, 'failed', { actor: 'bob' }), false, 'and so is a decline after it');
    equal(m.driver.foldInputs().length, n1, 'nothing appended by either');
    equal(m.sch.ids(), ['r1:summarise:-:0', 'r1:publish:-:0'], 'and nothing dispatched twice');
  });

  test(DECLARED_CASES[7]!, async () => {
    const m = make(await load('valid/ask-in-a-fanout.flow.json'));
    m.driver.start({});
    m.sch.settle('r1:ingest:-:0', 'done', { n: 1 });
    // JP-R5: every `branch.opened` precedes any other event for the region — here, the ask's `branch.suspended`, which
    // entering the branch-entry ask EMITS. A driver that interleaved emission with entering would put `suspended(0)`
    // between the two opens (W179's G1).
    equal(m.seen, ['dispatched', 'outcome', 'regionEntered', 'opened(0)', 'opened(1)', 'asked', 'suspended(0)', 'dispatched'],
      'regionEntered, BOTH opens, then the ask`s park and its `branch.suspended`, then branch 1`s dispatch');
    equal(m.sch.ids(), ['r1:ingest:-:0', 'r1:score:1:0'], 'the ask`s branch handed NOTHING to the scheduler; its sibling task was');
    equal(m.driver.foldInputs().filter((e) => e.kind === 'region' && e.event.type === 'branch.suspended').map((e) => (e as { event: unknown }).event),
      [{ type: 'branch.suspended', regionId: 'split', regionPath: '-', branchPath: '0', at: 'review' }],
      'the park`s region event, field for field — the opener, the instance, the branch and the ASK it is parked at (T10)');
    m.sch.settle('r1:score:1:0', 'done', { s: 0.9 });
    equal(m.sch.ids(), ['r1:ingest:-:0', 'r1:score:1:0'], 'the sibling arrived and the join does NOT fire: the ask`s branch is live');
    const s = fold(m.driver.foldInputs());
    equal(s.regions.split!['-']!.suspended, ['0'], 'the region lists the ask`s branch as suspended (RN-R6)');
    equal(s.outcome, 'awaiting_action', 'and the run waits on the person, not `stuck`');
    ok(m.driver.resolve('r1:review:0:0', 'done', { result: { ok: true }, actor: 'ana' }), 'answered');
    equal(m.seen.slice(-5), ['resolution', 'resumed(0)', 'arrived(0)', 'joinSettled', 'dispatched'], 'resumed, arrived, the join fires, publish dispatched');
    equal(m.sch.inputOf('r1:publish:-:0'), { review: { ok: true }, score: { s: 0.9 } }, 'the join carries the ANSWER as branch `review`s arrival — keyed by the entry id, ask-in-a-fanout`s `[review, score]` (JP-R12 v0.25)');
    equal(fold(m.driver.foldInputs()).regions.split!['-']!.suspended, [], 'and the region lists nothing suspended');
  });

  test(DECLARED_CASES[8]!, () => {
    const def = {
      flowId: 'ask-map', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'each' }] },
        { id: 'each', kind: 'map', over: 'files', branch: 'approve' },
        { id: 'approve', kind: 'ask', edges: [{ on: ['failed'], to: 'skipped' }, { to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'each', edges: [{ to: 'publish' }] },
        { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
        { id: 'skipped', kind: 'end', outcome: 'skipped' },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const m = make(def);
    m.driver.start({});
    m.sch.settle('r1:ingest:-:0', 'done', { files: ['a', 'b', 'c'] });
    equal(m.seen.slice(2), ['regionEntered', 'opened(0)', 'opened(1)', 'opened(2)', 'asked', 'suspended(0)', 'asked', 'suspended(1)', 'asked', 'suspended(2)'],
      'every `branch.opened` first (JP-R5, the map arm`s two passes), then each instance parks');
    equal(askedOf(m.driver).map((e) => [e.taskId, (e as { input: unknown }).input]),
      [['r1:approve:0:0', 'a'], ['r1:approve:1:0', 'b'], ['r1:approve:2:0', 'c']], 'one ask and one task id PER ITEM, each keeping its own item');
    equal(m.sch.ids(), ['r1:ingest:-:0'], 'nothing handed to the scheduler for any of them');
    ok(m.driver.resolve('r1:approve:2:0', 'done', { result: 'c!', actor: 'p' }), 'item 2 answered first');
    ok(m.driver.resolve('r1:approve:1:0', 'failed', { actor: 'p' }), 'item 1 declined — it exits to `skipped`');
    equal(m.sch.ids(), ['r1:ingest:-:0'], 'the join still waits for item 0');
    ok(m.driver.resolve('r1:approve:0:0', 'done', { result: 'a!', actor: 'p' }), 'item 0 answered last');
    equal(m.sch.inputOf('r1:publish:-:0'), { 0: 'a!', 2: 'c!' }, 'the join carries the two answers that ARRIVED, keyed by item index (a top-level map: index and branch path are one string)');
  });

  test(DECLARED_CASES[9]!, () => {
    const def = {
      flowId: 'ask-mid-branch', version: 1, entry: 'split',
      nodes: [
        { id: 'split', kind: 'fanout', branches: ['a', 'b'] },
        { id: 'a', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'check' }] },
        { id: 'check', kind: 'ask', edges: [{ to: 'collect' }] },
        { id: 'b', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
        { id: 'publish', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const m = make(def);
    m.driver.start({});
    m.sch.settle('r1:b:1:0', 'done', 'B');
    m.sch.settle('r1:a:0:0', 'done', 'A');
    equal(askedOf(m.driver), [{ kind: 'asked', taskId: 'r1:check:0:0', input: 'A', observedAt: 42 }], 'the ask inside branch 0 parks with its task`s result, at branch path 0');
    equal(m.seen.slice(-2), ['asked', 'suspended(0)'], 'and its branch suspends');
    equal(m.sch.ids(), ['r1:a:0:0', 'r1:b:1:0'], 'branch 1 arrived and the join does NOT fire');
    equal(outcome(m.driver), 'awaiting_action', 'waiting on the person');
    ok(m.driver.resolve('r1:check:0:0', 'done', { result: 'ok', actor: 'p' }), 'answered');
    equal(m.sch.inputOf('r1:publish:-:0'), { a: 'ok', b: 'B' }, 'the join fires, carrying the answer for branch `a` — keyed by `split`s entries `[a, b]` (JP-R12 v0.25)');
  });

  test(DECLARED_CASES[10]!, async () => {
    // The answer is given ON the `asked` element's own callback — mid-step. It is ACCEPTED at the call (`true`) and
    // TAKEN when the step ends (`RN-R37`, the conformity reader's R4): the park completes in its step, so the resolution
    // lands BETWEEN two steps — where a resume's replay feeds it (`RN-R19`).
    const answered: boolean[] = [];
    const ref: { driver?: Driver } = {};
    const def = await load('valid/ask-in-a-fanout.flow.json');
    const m = make(def, {
      onFoldInput: (e: FoldInput) => {
        if (e.kind === 'asked') answered.push(ref.driver!.resolve(e.taskId, 'done', { result: { ok: true }, actor: 'auto' }));
      },
    });
    ref.driver = m.driver;
    m.driver.start({});
    m.sch.settle('r1:ingest:-:0', 'done', { n: 1 });
    equal(answered, [true], 'the answer given inside the callback is ACCEPTED — `true` means accepted, its resolution pending');
    equal(m.seen.slice(2), ['regionEntered', 'opened(0)', 'opened(1)', 'asked', 'suspended(0)', 'dispatched', 'resolution', 'resumed(0)', 'arrived(0)'],
      'the step completes first — the park and its `branch.suspended`, branch 1 dispatched — and THEN the resolution, at rest');
    const s = fold(m.driver.foldInputs());
    equal([s.regions.split!['-']!.suspended, s.regions.split!['-']!.settled], [[], { 0: 'arrived' }], 'nothing suspended, branch 0 ARRIVED (RN-R6)');
    // The checkpoint resumes on a fresh driver: the replay regenerates the step and FEEDS the resolution at its position.
    const again = make(def);
    again.driver.resume(m.driver.checkpoint());
    equal(again.driver.foldInputs().slice(0, m.driver.foldInputs().length), m.driver.foldInputs(), 'resumed: no `diverged`, every element regenerated or fed');
    equal(fold(again.driver.foldInputs().slice(0, -1)), fold(m.driver.foldInputs()), 'and the same fold, the `resumed` element aside');
    equal(again.sch.ids(), ['r1:score:1:0'], 'the one task in flight handed to the new scheduler');
    m.sch.settle('r1:score:1:0', 'done', { s: 1 });
    equal(m.sch.ids(), ['r1:ingest:-:0', 'r1:score:1:0', 'r1:publish:-:0'], 'the sibling arrives and the join fires');
    // The AT-REST road is unchanged: an answer given between steps is appended and routed in its own call.
    const rest = make(def);
    rest.driver.start({});
    rest.sch.settle('r1:ingest:-:0', 'done', { n: 1 });
    const before = rest.seen.length;
    ok(rest.driver.resolve('r1:review:0:0', 'done', { result: { ok: true }, actor: 'p' }), 'at rest: accepted');
    equal(rest.seen.slice(before), ['resolution', 'resumed(0)', 'arrived(0)'], 'and appended and routed in the call itself — the join still waits for branch 1');
  });

  test(DECLARED_CASES[11]!, async () => {
    const def = {
      flowId: 'ask-map-mid', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'each' }] },
        { id: 'each', kind: 'map', over: 'files', branch: 'approve' },
        { id: 'approve', kind: 'ask', answerSchema: { type: 'string' }, edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'each', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const calls: string[] = [];
    const ref: { driver?: Driver } = {};
    const m = make(def, {
      onFoldInput: (e: FoldInput) => {
        if (e.kind !== 'asked') return;
        const d = ref.driver!;
        // Item 0: answered, then answered AGAIN while the first is pending — refused, as a second resolution is.
        // Item 1: an answer FD-R4 refuses — thrown AT THE CALL, nothing pending — then a conforming one.
        if (e.taskId === 'r1:approve:0:0') {
          calls.push(String(d.resolve(e.taskId, 'done', { result: 'a!', actor: 'p' })));
          calls.push(String(d.resolve(e.taskId, 'done', { result: 'again', actor: 'q' })));
        } else {
          try { d.resolve(e.taskId, 'done', { result: 7, actor: 'p' }); calls.push('not thrown'); } catch (x) { calls.push(x instanceof BoundaryRefused ? 'BoundaryRefused' : String(x)); }
          calls.push(String(d.resolve(e.taskId, 'done', { result: 'b!', actor: 'p' })));
        }
      },
    });
    ref.driver = m.driver;
    m.driver.start({});
    m.sch.settle('r1:ingest:-:0', 'done', { files: ['a', 'b'] });
    equal(calls, ['true', 'false', 'BoundaryRefused', 'true'], 'accepted, a second refused while pending, FD-R4 thrown at once, the corrected one accepted');
    // A pending ANSWER is not a pending PAUSE: a run already paused, answered mid-step and then paused again on the same
    // step, is refused `paused` — the pause the owner asked for is read past the answer in the queue.
    const pz = make(await load('valid/ask-after-a-task.flow.json'), {
      onFoldInput: (e: FoldInput) => {
        if (e.kind !== 'asked') return;
        ref.driver!.resolve(e.taskId, 'done', { result: { approved: true }, actor: 'p' });
        try { ref.driver!.pause({ actor: 'ops' }); calls.push('pause accepted'); } catch (x) { calls.push(x instanceof RunControlRefused ? x.reason : String(x)); }
      },
    });
    ref.driver = pz.driver;
    pz.driver.start({});
    pz.driver.pause({ actor: 'ops' });
    pz.sch.settle('r1:summarise:-:0', 'done', { text: 's' });
    equal(calls.at(-1), 'paused', 'a second pause behind a pending answer is refused `paused`');
    equal(m.seen.slice(2), ['regionEntered', 'opened(0)', 'opened(1)', 'asked', 'suspended(0)', 'asked', 'suspended(1)',
      'resolution', 'resumed(0)', 'arrived(0)', 'resolution', 'resumed(1)', 'arrived(1)', 'joinSettled', 'pathEnded'],
      'both instances park in the step; the two answers are taken at rest, in call order');
    equal(m.driver.snapshot().filter((r) => r.kind === 'resolution').map((r) => [r.taskId, r.result]),
      [['r1:approve:0:0', 'a!'], ['r1:approve:1:0', 'b!']], 'one resolution each — the second answer to item 0 appended nothing');
    const again = make(def);
    again.driver.resume(m.driver.checkpoint());
    equal(outcome(again.driver), 'completed', 'and the checkpoint resumes, completed');
    // A CANCEL on the same step drops the pending answer: it would be refused were it given now (`takePause`'s rule).
    const c = make({ flowId: 'ask-mid-cancel', version: 1, entry: 'approve', nodes: [
      { id: 'approve', kind: 'ask', edges: [{ to: 'done' }] }, { id: 'done', kind: 'end', outcome: 'completed' },
    ] } as unknown as FlowDefinition, {
      onFoldInput: (e: FoldInput) => {
        if (e.kind !== 'asked') return;
        calls.push(String(ref.driver!.resolve(e.taskId, 'done', { result: 1, actor: 'p' })));
        void ref.driver!.cancel({ actor: 'ops' });
      },
    });
    ref.driver = c.driver;
    c.driver.start({});
    equal(calls.at(-1), 'true', 'the answer was accepted at the call');
    equal(c.seen, ['asked', 'cancelRequested'], 'and DROPPED at rest, the run cancelled on its step: no resolution');
    equal(outcome(c.driver), 'cancelled', 'the run reads `cancelled`');
  });

  test(DECLARED_CASES[12]!, async () => {
    const def = await load('valid/ask-after-a-task.flow.json');
    const RICHER = () => ({ m: new Map<unknown, unknown>([['k', 1]]), s: new Set([1, 2]), d: new Date(5), a: [1, undefined], r: /x/g, e: new Error('e1'), b: new Uint8Array([1, 2]), ab: new Uint8Array([3, 4]).buffer });
    const first = make(def);
    first.driver.start({});
    first.sch.settle('r1:summarise:-:0', 'done', RICHER());
    const cp = first.driver.checkpoint();
    const at = cp.events.findIndex((e) => e.kind === 'asked');
    const same = make(def);
    same.driver.resume(cp);
    equal(outcome(same.driver), 'awaiting_action', 'the CONTROL: the unchanged structured-clone input resumes, re-parked');
    const forge = (edit: (input: Record<string, unknown>) => void) => {
      const f = structuredClone(cp) as Checkpoint;
      edit(((f.events as FoldInput[])[at] as { input: Record<string, unknown> }).input);
      const d = make(def);
      try { d.driver.resume(f); return 'resumed'; } catch (e) { return e instanceof ResumeRefused ? `${e.reason}@${e.index}` : String(e); }
    };
    equal(forge((i) => { (i.m as Map<unknown, unknown>).set('k', 2); }), `diverged@${at}`, 'a Map whose value changed');
    equal(forge((i) => { (i.s as Set<unknown>).add(3); }), `diverged@${at}`, 'a Set with one more member');
    equal(forge((i) => { (i.d as Date).setTime(6); }), `diverged@${at}`, 'a Date one millisecond on');
    equal(forge((i) => { (i.a as unknown[]).length = 1; }), `diverged@${at}`, 'an array that lost its trailing hole');
    equal(forge((i) => { i.r = /x/i; }), `diverged@${at}`, 'a RegExp with other flags');
    equal(forge((i) => { i.e = new Error('e2'); }), `diverged@${at}`, 'an Error with another message');
    equal(forge((i) => { (i.b as Uint8Array)[1] = 9; }), `diverged@${at}`, 'binary data with one byte changed');
    equal(forge((i) => { new Uint8Array(i.ab as ArrayBuffer)[0] = 7; }), `diverged@${at}`, 'a bare ArrayBuffer with one byte changed — it has no own keys to compare');
    equal(forge((i) => { i.d = { }; }), `diverged@${at}`, 'a Date replaced by a plain object');
    equal(forge(() => {}), 'resumed', 'the CONTROL: an untouched clone resumes');
  });

  test(DECLARED_CASES[13]!, async () => {
    const boom = new Error('consumer callback threw');
    // On `resolve()`'s step: the callback throws on the RESOLUTION's element — the throw reaches resolve()'s caller,
    // after the element, the run halted and reported once.
    const r = make(ENTRY(), { onFoldInput: (e: FoldInput) => { if (e.kind === 'resolution') throw boom; } });
    r.driver.start({});
    let err: unknown;
    try { r.driver.resolve(A, 'done', { result: { approved: true }, actor: 'ana' }); } catch (e) { err = e; }
    equal(err, boom, 'on resolve() the consumer`s throw reaches the caller');
    // **W184** (P35 (k), P36 fact 11 R2): the run is HALTED after the element and reported once — nothing routed, the
    // successor never dispatched. *Before W184 the throw left `appendResolution` with nothing else done, and the run folded
    // `completed` — a run that never reached its end (W180's Notes).*
    equal(r.seen, ['asked', 'resolution', 'halted'], 'after the element, which is in the log — then `halted`, and nothing routed');
    equal([r.failures.map((f) => f.message), outcome(r.driver), r.sch.ids()], [['consumer callback threw'], 'halted', []],
      'reported ONCE, the run `halted` — not `completed` — and nothing handed to the scheduler');
    // On `resume()`'s step: the store LOST the `asked` element (the tail past its last write), so the replay regenerates
    // it past the stored events and DELIVERS it (`RN-R24`) — and the callback throws there. The replay's boundary halts the
    // run and reports it once, and the resume is refused `ResumeRefused('halted')` at the element after it (`RN-R23`).
    const def = await load('valid/ask-after-a-task.flow.json');
    const first = make(def);
    first.driver.start({});
    first.sch.settle('r1:summarise:-:0', 'done', { text: 's' });
    const full = first.driver.checkpoint();
    const at = full.events.findIndex((e) => e.kind === 'asked');
    const z = make(def, { onFoldInput: (e: FoldInput) => { if (e.kind === 'asked') throw boom; } });
    let rz: unknown;
    try { z.driver.resume({ header: full.header, events: full.events.slice(0, at) }); } catch (e) { rz = e; }
    ok(rz instanceof ResumeRefused && rz.reason === 'halted', `on resume() the throw reaches the caller as ResumeRefused(halted): ${String(rz)}`);
    equal(z.failures.map((f) => f.message), ['consumer callback threw'], 'reported once');
    equal(z.sch.ids(), [], 'nothing handed to the scheduler');
    equal(outcome(z.driver), 'halted', 'and the resumed run is halted');
  });

  test(DECLARED_CASES[14]!, async () => {
    const def = await load('valid/ask-after-a-task.flow.json');
    const first = make(def);
    first.driver.start({ seed: 1 });
    first.sch.settle('r1:summarise:-:0', 'done', { text: 's', tags: ['x'] });
    const cp = first.driver.checkpoint();
    const at = cp.events.findIndex((e) => e.kind === 'asked');
    equal(at, 2, 'the stored `asked` element sits at position 2, after the dispatch and the settlement');
    // SAME input: the replay re-enters the ask and regenerates the element, compared input and all.
    const again = make(def);
    again.driver.resume(cp);
    equal(again.sch.ids(), [], 'nothing re-dispatched: the ask is never in flight and summarise had settled');
    equal(again.driver.foldInputs().slice(0, cp.events.length), cp.events, 'the stored events, regenerated element for element');
    equal(again.driver.foldInputs().at(-1), { kind: 'resumed', taskIds: [] }, 'and `resumed` names nothing');
    equal(nodeOf(again.driver, A)!.input, { text: 's', tags: ['x'] }, 'the ask RE-PARKED with the same kept input');
    ok(again.driver.resolve(A, 'done', { result: { approved: true }, actor: 'ana' }), 'and is answered on the resumed driver');
    equal(again.sch.ids(), ['r1:publish:-:0'], 'routing on there');
    // A DIFFERENT stored input: the replay composes `{ text: 's', tags: ['x'] }` and the store says otherwise.
    const forged = structuredClone(cp) as Checkpoint;
    ((forged.events as FoldInput[])[at] as { input: unknown }).input = { text: 's', tags: ['y'] };
    const div = make(def);
    let err: unknown;
    try { div.driver.resume(forged); } catch (e) { err = e; }
    ok(err instanceof ResumeRefused, `refused: ${String(err)}`);
    equal([(err as ResumeRefused).reason, (err as ResumeRefused).index], ['diverged', at], 'as `diverged`, AT the asked element`s position');
    equal(div.sch.ids(), [], 'nothing handed to the scheduler');
    // A STORED ANSWER is fed by the replay: RS-R1's widened suspended holds there too.
    first.driver.resolve(A, 'done', { result: { approved: true }, actor: 'ana' });
    const answered = make(def);
    answered.driver.resume(first.driver.checkpoint());
    equal(answered.sch.ids(), ['r1:publish:-:0'], 'the stored answer was FED and routed: `publish`, in flight in the stored run, is handed on again');
    equal(nodeOf(answered.driver, A)!.state, 'done', 'the ask reads answered');
  });

  test(DECLARED_CASES[15]!, async () => {
    const boom = new Error('consumer callback threw');
    const thrower = (e: FoldInput) => { if (e.kind === 'asked') throw boom; };
    // A DRIVER CALL's step: the entry ask's `asked` element is appended inside `start()`.
    const call = make(ENTRY(), { onFoldInput: thrower });
    let err: unknown;
    try { call.driver.start({}); } catch (e) { err = e; }
    equal(err, boom, 'on a driver call the consumer`s throw reaches the CALLER');
    equal(call.seen, ['asked', 'halted'], 'after the element, which is in the log — and the run is halted');
    equal(call.failures.map((f) => f.message), ['consumer callback threw'], 'reported ONCE');
    equal(call.sch.ids(), [], 'nothing handed to the scheduler');
    // A SCHEDULER EVENT's step: the ask after a task is reached on `summarise`'s settlement.
    const ev = make(await load('valid/ask-after-a-task.flow.json'), { onFoldInput: thrower });
    ev.driver.start({});
    let leaked: unknown = null;
    try { ev.sch.settle('r1:summarise:-:0', 'done', { text: 's' }); } catch (e) { leaked = e; }
    equal(leaked, null, 'NOTHING leaves the scheduler`s event (OR-R10): the listener boundary catches it');
    equal(ev.seen, ['dispatched', 'outcome', 'asked', 'halted'], 'the element, then the halt');
    equal(ev.failures.map((f) => f.message), ['consumer callback threw'], 'reported ONCE, with the consumer`s error');
    equal(outcome(ev.driver), 'halted', 'and the run is HALTED');
    equal(ev.driver.resolve(A, 'done', { result: { approved: true }, actor: 'ana' }), false, 'a halted run`s ask takes no answer');
    // CONTROL: the same run with a callback that does not throw.
    const quiet = make(await load('valid/ask-after-a-task.flow.json'), { onFoldInput: () => {} });
    quiet.driver.start({});
    quiet.sch.settle('r1:summarise:-:0', 'done', { text: 's' });
    equal([quiet.failures, outcome(quiet.driver)], [[], 'awaiting_action'], 'the CONTROL: no throw, no report, the run awaiting the person');
  });

  test(DECLARED_CASES[16]!, async () => {
    const pausing = make(ENTRY());
    pausing.driver.start({});
    pausing.driver.pause({ actor: 'ops' });
    equal(fold(pausing.driver.foldInputs()).paused, true, 'PAUSE accepted on a run waiting only on an ask');
    const cancelling = make(ENTRY());
    cancelling.driver.start({});
    await cancelling.driver.cancel({ actor: 'ops' });
    equal(cancelling.sch.cancelled, [], 'CANCEL accepted, sending the scheduler nothing — the ask is not in flight');
    equal(outcome(cancelling.driver), 'cancelled', 'and the run reads `cancelled` at once (RN-R30)');
    equal(cancelling.driver.resolve(A, 'done', { result: { approved: true }, actor: 'ana' }), false, 'a cancelled run`s ask takes no answer');
    const stopping = make(ENTRY());
    stopping.driver.start({});
    await stopping.driver.stop({ actor: 'ops' });
    equal(outcome(stopping.driver), 'interrupted', 'STOP accepted, the run `interrupted`');
    // CONTROL: the same run once the ask is answered and the run has finished — each refused `ended`.
    const done = make(ENTRY());
    done.driver.start({});
    done.driver.resolve(A, 'failed', { actor: 'ana' });
    equal(outcome(done.driver), 'completed', 'the CONTROL run finished');
    for (const [name, call] of [
      ['cancel', () => done.driver.cancel({ actor: 'ops' })],
      ['stop', () => done.driver.stop({ actor: 'ops' })],
      ['pause', () => done.driver.pause({ actor: 'ops' })],
    ] as const) {
      let r: unknown;
      try { call(); } catch (e) { r = e; }
      ok(r instanceof RunControlRefused && r.reason === 'ended', `the CONTROL: ${name} refused \`ended\` once the ask is answered: ${String(r)}`);
    }
  });

  test(DECLARED_CASES[17]!, () => {
    const m = make(ENTRY());
    m.driver.start({});
    m.sch.settle(A, 'done', { approved: true });
    equal(m.failures.map((f) => f.kind), [UndispatchedTask.name], 'a settlement for the ask`s id is ID-R4`s: this driver never dispatched it');
    equal(outcome(m.driver), 'halted', 'and the run is halted');
    equal(m.driver.snapshot(), [], 'nothing appended for it');
  });

  test(DECLARED_CASES[18]!, async () => {
    // The hold at the park (`RN-R29`): a consumer's callback on the `asked` element cancels the run — a halt that does
    // not THROW, so the park's own code goes on — and nothing further is emitted or entered on that stack.
    const ref: { driver?: Driver } = {};
    const m = make(await load('valid/ask-in-a-fanout.flow.json'), {
      onFoldInput: (e: FoldInput) => { if (e.kind === 'asked') void ref.driver!.cancel({ actor: 'ops' }); },
    });
    ref.driver = m.driver;
    m.driver.start({});
    m.sch.settle('r1:ingest:-:0', 'done', { n: 1 });
    equal(m.seen.slice(2), ['regionEntered', 'opened(0)', 'opened(1)', 'asked', 'cancelRequested'],
      'the cancel lands on the `asked` element, and NOTHING follows it — no `branch.suspended`, no dispatch of branch 1');
    equal(m.sch.ids(), ['r1:ingest:-:0'], 'branch 1`s task is never handed to the scheduler');
    equal(outcome(m.driver), 'cancelled', 'and the run reads `cancelled` (RN-R30): nothing is running');
    // CONTROL: the same run with no cancel parks and runs its sibling.
    const c = make(await load('valid/ask-in-a-fanout.flow.json'));
    c.driver.start({});
    c.sch.settle('r1:ingest:-:0', 'done', { n: 1 });
    equal(c.seen.slice(5, 7), ['asked', 'suspended(0)'], 'the CONTROL: the park announces its branch');
  });

  test(DECLARED_CASES[19]!, () => {
    // The park's FIRST hold check is reachable (W172's road for a dispatch): `enter` checks the hold and then calls
    // `compose`, and an entry ask declaring `needs: { v: "." }` clones the CALLER's payload — running its getters, consumer
    // code between the head of `enter` and the head of the park. A getter whose SECOND read (the first is `start()`'s
    // header clone) halts the run — here by delivering a settlement for an id this driver never dispatched (`ID-R4`).
    const drive = (raise: boolean) => {
      const m = make({ flowId: 'ask-compose', version: 1, entry: 'approve', nodes: [
        { id: 'approve', kind: 'ask', needs: { v: '.' }, edges: [{ to: 'done' }] }, { id: 'done', kind: 'end', outcome: 'completed' },
      ] } as unknown as FlowDefinition);
      let reads = 0;
      const payload = {};
      Object.defineProperty(payload, 'k', { enumerable: true, get() {
        reads += 1;
        if (raise && reads === 2) m.sch.settle('r1:nobody:-:0', 'done');
        return 1;
      } });
      m.driver.start(payload);
      equal(reads, 2, 'the getter ran twice: the header`s clone, then `compose``s');
      return m;
    };
    const control = drive(false);
    equal(control.seen, ['asked'], 'the CONTROL: the ask parks');
    const halted = drive(true);
    equal(halted.seen, ['halted'], 'the halt is the whole sequence: no `asked` after it');
    equal(halted.failures.map((f) => f.kind), [UndispatchedTask.name], 'the refusal reported once');
  });

  test(DECLARED_CASES[20]!, async () => {
    // `ID-R1`'s guard at the park is REACHABLE: the same settlement delivered twice routes twice (ADR 0022), so the ask
    // after it is entered a second time at the same id — refused there, as a task's re-dispatch is.
    const m = make(await load('valid/ask-after-a-task.flow.json'));
    m.driver.start({});
    m.sch.settle('r1:summarise:-:0', 'done', { text: 's' });
    m.sch.settle('r1:summarise:-:0', 'done', { text: 's' });
    equal(m.failures.map((f) => f.kind), [DuplicateTaskId.name], 'the second park is refused DuplicateTaskId, reported once');
    equal(askedOf(m.driver).length, 1, 'ONE `asked` element — the second was refused before it was appended');
    equal(outcome(m.driver), 'halted', 'and the run is halted');
    // CONTROL: the same duplicate delivery with a TASK after it — ID-R1's existing refusal of the re-dispatch.
    const c = make({ flowId: 'twice-task', version: 1, entry: 'a', nodes: [
      { id: 'a', kind: 'task', type: 'IngestWorker', edges: [{ to: 'b' }] },
      { id: 'b', kind: 'task', type: 'PublishWorker', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ] } as unknown as FlowDefinition);
    c.driver.start({});
    c.sch.settle('r1:a:-:0', 'done', 1);
    c.sch.settle('r1:a:-:0', 'done', 1);
    equal(c.failures.map((f) => f.kind), [DuplicateTaskId.name], 'the CONTROL: a task successor`s re-dispatch is refused the same way');
  });

  test(DECLARED_CASES[21]!, () => {
    // The maintainer's answer to S-4: the at-rest take covers a parked TASK's resolution too. Before it, this road read
    // `... resolution resumed(0) arrived(0) suspended(0)` — a `branch.suspended` after its branch had ARRIVED — the fold
    // listed `suspended: ["0"]` beside `settled: { 0: "arrived" }`, and the checkpoint was refused `diverged`.
    const def = {
      flowId: 'task-mid-resolve', version: 1, entry: 'split',
      nodes: [
        { id: 'split', kind: 'fanout', branches: ['a', 'b'] },
        { id: 'a', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'j' }] },
        { id: 'b', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'j' }] },
        { id: 'j', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const accepted: boolean[] = [];
    const ref: { driver?: Driver } = {};
    const m = make(def, {
      onFoldInput: (e: FoldInput) => {
        if (e.kind === 'outcome' && e.record.kind === 'outcome' && e.record.terminalState === 'user_action') accepted.push(ref.driver!.resolve(e.record.taskId, 'done', { result: 1, actor: 'p' }));
      },
    });
    ref.driver = m.driver;
    m.driver.start({});
    m.sch.settle('r1:a:0:0', 'user_action');
    equal(accepted, [true], 'accepted at the call');
    equal(m.seen.slice(-5), ['outcome', 'suspended(0)', 'resolution', 'resumed(0)', 'arrived(0)'],
      'the park completes in its step — `branch.suspended` — and the resolution follows at rest');
    const s = fold(m.driver.foldInputs());
    equal([s.regions.split!['-']!.suspended, s.regions.split!['-']!.settled], [[], { 0: 'arrived' }], 'the fold: nothing suspended, branch 0 arrived');
    const again = make(def);
    again.driver.resume(m.driver.checkpoint());
    equal(again.driver.foldInputs().slice(0, -1), m.driver.foldInputs(), 'and the checkpoint RESUMES — no `diverged`');
    equal(again.sch.ids(), ['r1:b:1:0'], 'branch 1, in flight, handed on again');
  });

  test(DECLARED_CASES[22]!, () => {
    const ran = collected().filter((s) => s.suite === SUITE).flatMap((s) => s.cases.map((c) => c.name)).sort();
    const declared = [...DECLARED_CASES].sort();
    equal(declared.filter((n) => !ran.includes(n)), [], 'a declared case did not run — it was deleted, renamed, or its suite stopped loading');
    equal(ran.filter((n) => !declared.includes(n)), [], 'a case ran that this list does not name. Add it here in the same commit');
    equal(ran.length, DECLARED_CASES.length, 'and the COUNT beside the membership, which catches a duplicated name');
  });
});
