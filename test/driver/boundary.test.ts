/**
 * **`FD-R4` — the two runtime boundaries no static check can reach, validated ONCE each** —
 * `spec/flow-definition.md` section 6 (v0.21), [P19](../../doc/plans/p19-what-a-schema-buys-an-author.md)
 * decision 5, [W73](../../doc/work-items/w73-the-wiring-check-a-verdict-per-edge-and-two-boundaries-validated-once.md),
 * at ladder L2 on a fake scheduler.
 *
 * The rule's clauses, each with its positive and negative case (rule 8 obligation (a)), and the
 * SHAPES the start boundary ranges over — a task entry, a fan-out entry (every branch task, the same
 * value), a map entry (one per item), an entry composing a `"."` reference — because W73's
 * declaration found two of forty-four corpus entries open a fan-out. Every expected value is read
 * from the schema the case declares, never from the driver.
 */
import { equal, ok, suite, throws } from '../harness.ts';
import { BoundaryRefused, Driver, MultipleRuns } from '../../src/driver/driver.ts';
import { liveToken } from '../../src/fold/policies.ts';
import { createRuntime } from '../../src/scheduler/runtime.ts';
import type { FlowDefinition, JsonSchema } from '../../src/definition/types.ts';
import type { JoinPolicy } from '../../src/driver/policy.ts';

class FakeScheduler {
  readonly added: { id: string; workerType: string; payload: unknown }[] = [];
  private listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(task: unknown): void { this.added.push(task as { id: string; workerType: string; payload: unknown }); }
  addEventListener(type: string, fn: (e: { detail: unknown }) => void): void { this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]); }
  settle(id: string, state: 'done' | 'failed' | 'user_action', over: Record<string, unknown> = {}): void {
    const detail = { id, state, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1, ...over };
    if (state === 'done') this.fire('task.completed', detail);
    else { this.fire('task.failed', detail); if (state === 'user_action') this.fire('task.user_action', detail); }
  }
  private fire(type: string, detail: unknown): void { for (const fn of this.listeners.get(type) ?? []) fn({ detail }); }
}

const CONF: JsonSchema = { type: 'number', minimum: 0, maximum: 1 };
const IN: JsonSchema = { type: 'object', required: ['confidence'], properties: { confidence: CONF } };
const OUT: JsonSchema = { type: 'object', required: ['score'], properties: { score: { type: 'integer', minimum: 0, maximum: 100 } }, additionalProperties: false, examples: [{ score: 7 }] };
const WORKERS = {
  checked: { url: 'test://checked', inputSchema: IN, outputSchema: OUT },
  loose: { url: 'test://loose' },
  wrapped: { url: 'test://wrapped', inputSchema: { type: 'object', required: ['own'], properties: { own: IN } } },
};
const TYPES = { Checked: { worker: 'checked' }, Loose: { worker: 'loose' }, Wrapped: { worker: 'wrapped' } };
const t = (id: string, type: string, to: string, extra: Record<string, unknown> = {}) => ({ id, kind: 'task', type, edges: [{ to }], ...extra });
const END = { id: 'done', kind: 'end', outcome: 'completed' };
const flow = (nodes: unknown[], entry = (nodes[0] as { id: string }).id): FlowDefinition => ({ flowId: 'b', version: 1, entry, nodes: nodes as FlowDefinition['nodes'] });
const LINEAR = flow([t('a', 'Checked', 'b'), t('b', 'Checked', 'done'), END]);

function driver(def: FlowDefinition, extra: Record<string, unknown> = {}, policy: JoinPolicy = liveToken as JoinPolicy) {
  const scheduler = new FakeScheduler();
  const failures: string[] = [];
  const d = new Driver(def, {
    runId: 'r1', scheduler, createTask: (c) => c, predicates: new Map(),
    workers: WORKERS, nodeTypes: TYPES, joinPolicy: policy,
    onRunFailure: (f) => failures.push(f.kind),
    ...extra,
  });
  return { d, scheduler, failures };
}

suite('FD-R4 at START — the payload is held to the first task(s) it reaches, once, and a refusal leaves the driver unstarted', (test) => {
  test('a payload the entry`s inputSchema refuses: BoundaryRefused, nothing dispatched, no run failure, the driver UNSTARTED', () => {
    const { d, scheduler, failures } = driver(LINEAR);
    let caught: unknown;
    try { d.start({ confidence: 2 }); } catch (e) { caught = e; }
    ok(caught instanceof BoundaryRefused, `a BoundaryRefused, got ${String(caught)}`);
    const e = caught as BoundaryRefused;
    equal([e.name, e.boundary, e.nodeId, e.taskId], ['BoundaryRefused', 'start', 'a', null], 'the class, the boundary, the node, no task yet');
    // W140 — Q533, P31 decision 2: the class names the refusal ONCE, by its own `name`; the message does not.
    equal([e.message.startsWith('the payload handed to run "r1"'), String(e).split('BoundaryRefused').length], [true, 2],
      `String(e) names the class EXACTLY once, and the message opens with what was refused: ${String(e).slice(0, 80)}`);
    equal(e.findings, [{ path: '$.confidence', says: 'above maximum 1' }], 'the schema`s own finding');
    ok(e.message.includes('node "a"') && e.message.includes('worker "checked"') && e.message.includes('FD-R4') && e.message.includes('above maximum 1'), `the message names the node, the worker, the rule and the finding: ${e.message}`);
    equal(scheduler.added.length, 0, 'nothing was dispatched');
    equal(failures, [], 'nothing was reported through onRunFailure — a rejected command, not a run failure');
    equal(d.snapshot().length, 0, 'nothing was appended');
    // UNSTARTED: a corrected payload starts the run — ID-R3 sees nothing, because nothing ran.
    d.start({ confidence: 0.4 });
    equal(scheduler.added.map((x) => x.id), ['r1:a:-:0'], 'the corrected payload dispatched the entry');
    throws(() => d.start({ confidence: 0.4 }), 'MultipleRuns', 'and a SECOND start is ID-R3`s refusal as ever');
    ok(MultipleRuns !== undefined, 'the class this refers to');
    // W140 — Q533, P31 decision 2: the class names the refusal ONCE, by its own `name`; the message does not.
    let second: unknown;
    try { d.start({ confidence: 0.4 }); } catch (x) { second = x; }
    ok(second instanceof MultipleRuns, `the refusal is the class: ${String(second)}`);
    equal([(second as Error).name, (second as Error).message.startsWith('this driver already started run "r1"'), String(second).split('MultipleRuns').length],
      ['MultipleRuns', true, 2], `String(e) names the class EXACTLY once: ${String(second).slice(0, 80)}`);
  });
  test('a payload the schema accepts is dispatched as it always was, to the byte', () => {
    const { d, scheduler } = driver(LINEAR);
    d.start({ confidence: 0.4, extra: 'kept' });
    equal(scheduler.added[0]!.payload, { settings: {}, input: { confidence: 0.4, extra: 'kept' } }, 'the envelope, the payload untouched');
  });
  test('a missing required key is a refusal too — the shape a caller most often gets wrong', () => {
    const { d } = driver(LINEAR);
    throws(() => d.start({}), 'BoundaryRefused', 'confidence required');
  });
  test('a worker declaring no inputSchema is UNCHECKED: any payload starts (P18 decision 3)', () => {
    const { d, scheduler } = driver(flow([t('a', 'Loose', 'done'), END]));
    d.start('anything at all');
    equal(scheduler.added.length, 1, 'dispatched');
  });
  test('validateBoundaries: false turns the start boundary off — the same bad payload dispatches', () => {
    const { d, scheduler } = driver(LINEAR, { validateBoundaries: false });
    d.start({ confidence: 2 });
    equal(scheduler.added.length, 1, 'dispatched with the check off');
  });
  test('SHAPE: a fan-out entry — every branch task is held to its own schema over the SAME value (JP-R11), the refusal naming the branch', () => {
    const fan = flow([{ id: 'split', kind: 'fanout', branches: ['l', 'r'] }, t('l', 'Loose', 'join'), t('r', 'Checked', 'join'), { id: 'join', kind: 'join', of: 'split', edges: [{ to: 'done' }] }, END], 'split');
    const { d, scheduler } = driver(fan);
    let caught: unknown;
    try { d.start({ confidence: -1 }); } catch (e) { caught = e; }
    ok(caught instanceof BoundaryRefused && caught.nodeId === 'r', 'the CHECKED branch task is named, the loose one passes');
    equal(scheduler.added.length, 0, 'nothing dispatched — not even the branch whose schema accepted');
    d.start({ confidence: 0.5 });
    equal(scheduler.added.map((x) => x.id).sort(), ['r1:l:0:0', 'r1:r:1:0'], 'both branches on the corrected payload');
  });
  test('SHAPE: a map entry — every ITEM is held to the branch task`s schema, the refusal on the bad one', () => {
    const map = flow([{ id: 'each', kind: 'map', over: 'items', branch: 'b' }, t('b', 'Checked', 'join'), { id: 'join', kind: 'join', of: 'each', edges: [{ to: 'done' }] }, END], 'each');
    const { d, scheduler } = driver(map);
    let caught: unknown;
    try { d.start({ items: [{ confidence: 0.1 }, { confidence: 9 }] }); } catch (e) { caught = e; }
    ok(caught instanceof BoundaryRefused && caught.nodeId === 'b' && caught.findings[0]!.path === '$.confidence', 'the second item`s confidence');
    equal(scheduler.added.length, 0, 'nothing dispatched');
    d.start({ items: [{ confidence: 0.1 }, { confidence: 0.2 }] });
    equal(scheduler.added.length, 2, 'two instances on the corrected payload');
    // Not an array under `over`: nothing to hold — FD-R2's refusal is the run's, and it still fires.
    const { d: d2, failures } = driver(map);
    throws(() => d2.start({ items: 'no' }), 'UnresolvedMapArity', 'FD-R2, as before');
    // W140 — Q533, P31 decision 2: the class names the refusal ONCE, by its own `name`; the message does not.
    const { d: d3 } = driver(map);
    let arity: unknown;
    try { d3.start({ items: 'no' }); } catch (x) { arity = x; }
    equal([(arity as Error).name, (arity as Error).message.startsWith('map node "each"'), String(arity).split('UnresolvedMapArity').length],
      ['UnresolvedMapArity', true, 2], `String(e) names the class EXACTLY once: ${String(arity).slice(0, 80)}`);
    equal(failures, ['UnresolvedMapArity'], 'reported and rethrown, as W33 left it');
  });
  test('SHAPE: an entry composing a "." reference — the COMPOSED value is what the schema sees', () => {
    const wrapped = flow([t('a', 'Wrapped', 'done', { needs: { own: '.' } }), END]);
    const { d, scheduler } = driver(wrapped);
    throws(() => d.start({ confidence: 3 }), 'BoundaryRefused', 'own.confidence above maximum');
    d.start({ confidence: 0.3 });
    equal(scheduler.added[0]!.payload, { settings: {}, input: { own: { confidence: 0.3 } } }, 'the composed object, dispatched');
  });
});

suite('FD-R4 at RESOLVE — a person`s value is held to the parked node`s worker outputSchema, once, and a refusal leaves the task suspended', (test) => {
  /** A run parked at `b`, a `Checked` node whose worker declares `OUT`. */
  const parked = () => {
    const h = driver(LINEAR);
    h.d.start({ confidence: 0.4 });
    h.scheduler.settle('r1:a:-:0', 'done', { result: { score: 40 } });
    h.scheduler.settle('r1:b:-:0', 'user_action', { error: 'needs a person' });
    return h;
  };
  test('a resolution the outputSchema refuses: BoundaryRefused naming the task, nothing appended, the task STILL suspended', () => {
    const { d, scheduler, failures } = parked();
    const before = d.snapshot().length;
    let caught: unknown;
    try { d.resolve('r1:b:-:0', 'done', { result: { score: 'high' }, actor: 'ops' }); } catch (e) { caught = e; }
    ok(caught instanceof BoundaryRefused, `a BoundaryRefused, got ${String(caught)}`);
    const e = caught as BoundaryRefused;
    equal([e.boundary, e.nodeId, e.taskId], ['resolve', 'b', 'r1:b:-:0'], 'the boundary, the node, the task');
    // W140 — Q533, P31 decision 2: the class names the refusal ONCE, by its own `name`; the message does not.
    equal([e.name, e.message.startsWith('the resolution of "r1:b:-:0"'), String(e).split('BoundaryRefused').length], ['BoundaryRefused', true, 2],
      `String(e) names the class EXACTLY once, and the message opens with what was refused: ${String(e).slice(0, 80)}`);
    equal(e.findings, [{ path: '$.score', says: 'expected integer, got string' }], 'the schema`s own finding');
    ok(e.message.includes('outputSchema') && e.message.includes('still suspended') && e.message.includes('declared example'), e.message);
    equal(d.snapshot().length, before, 'nothing appended');
    equal(failures, [], 'no run failure');
    equal(scheduler.added.length, 2, 'nothing dispatched');
    // Still suspended: the corrected value — the worker's declared example is one — resolves it and the run goes on.
    equal(d.resolve('r1:b:-:0', 'done', { result: (OUT.examples as unknown[])[0], actor: 'ops' }), true, 'resolved on the second attempt');
    equal(d.snapshot().length, before + 1, 'one resolution appended');
  });
  test('a `failed` resolution carries an error and no result, and nothing holds it', () => {
    const { d } = parked();
    equal(d.resolve('r1:b:-:0', 'failed', { error: 'no', actor: 'ops' }), true, 'accepted');
  });
  test('a node whose worker declares no outputSchema is UNCHECKED at resolve', () => {
    const h = driver(flow([t('a', 'Loose', 'done'), END]));
    h.d.start({});
    h.scheduler.settle('r1:a:-:0', 'user_action', { error: 'x' });
    equal(h.d.resolve('r1:a:-:0', 'done', { result: 'anything', actor: 'ops' }), true, 'accepted');
  });
  test('validateBoundaries: false turns the resolve boundary off', () => {
    const h = driver(LINEAR, { validateBoundaries: false });
    h.d.start({ confidence: 0.4 });
    h.scheduler.settle('r1:a:-:0', 'done', { result: { score: 40 } });
    h.scheduler.settle('r1:b:-:0', 'user_action', { error: 'x' });
    equal(h.d.resolve('r1:b:-:0', 'done', { result: { score: 'high' }, actor: 'ops' }), true, 'accepted with the check off');
  });
  test('RS-R1`s other refusals come FIRST: a task that is not suspended returns false, whatever the value', () => {
    const { d } = driver(LINEAR);
    d.start({ confidence: 0.4 });
    equal(d.resolve('r1:a:-:0', 'done', { result: { score: 'high' }, actor: 'ops' }), false, 'not suspended — no schema was consulted');
  });
});

suite('FD-R4 through the runtime — createRuntime forwards the switch to every driver it starts', (test) => {
  const seams = () => {
    const added: Record<string, unknown>[] = [];
    return {
      added,
      createPool: (url: string, options: unknown) => ({ url, options }) as never,
      createScheduler: () => ({ addTask(x: unknown) { added.push(x as Record<string, unknown>); }, addEventListener() {}, shutdown() { return Promise.resolve(); } }) as never,
    };
  };
  const DOC = { workers: WORKERS, nodeTypes: TYPES, predicates: [], languages: [] };
  test('on by default: the runtime`s start throws the driver`s BoundaryRefused and dispatches nothing', () => {
    const s = seams();
    const rt = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    throws(() => rt.start(LINEAR, { confidence: 2 }), 'BoundaryRefused', 'through the runtime');
    equal(s.added.length, 0, 'nothing dispatched');
    rt.start(LINEAR, { confidence: 0.2 });
    equal(s.added.length, 1, 'a good payload runs');
  });
  test('validateBoundaries: false on the runtime reaches the driver', () => {
    const s = seams();
    const rt = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler, validateBoundaries: false });
    rt.start(LINEAR, { confidence: 2 });
    equal(s.added.length, 1, 'the bad payload dispatched with the check off, runtime-wide');
  });
});
