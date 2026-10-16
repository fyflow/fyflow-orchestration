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
import { tryTransform } from '../../src/definition/assist.ts';
import { boundaryTargets, givenVerdict } from '../../src/definition/wiring.ts';
import { PATH_LANGUAGE } from '../scheduler/fake-language.ts';
import compileExpression, { jsonata } from '../../src/jsonata/index.ts';
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

/**
 * **W170 — Q633's own flow** (its table; P34 fact 10; ADR 0101): a worker whose `inputSchema` requires `label`, a
 * string, and a node of its type declaring the JSONata transform `{ "label": word }`. Under JSONata `word` read from
 * `{ word: "x" }` is `"x"`, so the transform makes `{ label: "x" }` — what the worker requires — while from
 * `{ label: "y" }` the path `word` is absent and JSONata drops the key, making `{}`, which the schema refuses. **The two
 * payloads are each other's mirror against the schema before and after the transform**, which is the row's clause.
 */
const LABEL_IN: JsonSchema = { type: 'object', required: ['label'], properties: { label: { type: 'string' } } };
const LABEL_OUT: JsonSchema = { type: 'object', required: ['ok'], properties: { ok: { type: 'boolean' } }, examples: [{ ok: true }] };
const Q633_WORKERS = { ...WORKERS, labelled: { url: 'test://labelled', inputSchema: LABEL_IN, outputSchema: LABEL_OUT } };
const Q633_TYPES = { ...TYPES, Labelled: { worker: 'labelled' } };
const RENAME = { lang: 'jsonata', expr: '{ "label": word }' };
const Q633 = { workers: Q633_WORKERS, nodeTypes: Q633_TYPES, languages: { jsonata } };
const JOIN = (of: string) => ({ id: 'join', kind: 'join', of, edges: [{ to: 'done' }] });

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
  // **W170 — ADR 0101, Q633's road 2, P34 stop-and-ask (a) as answered.** Every expected value below is read from Q633's
  // table, the schemas declared above and JSONata's own semantics — never from a run.
  test('W170 — Q633: a TRANSFORMING entry is not held at start — BOTH of its payloads admitted, each dispatched UNTRANSFORMED with the transform as the third key', () => {
    const transforming = flow([t('a', 'Labelled', 'done', { transform: RENAME }), END]);
    // `{ word }` fails LABEL_IN before the transform and passes after; `{ label }` the other way round (Q633's table).
    for (const payload of [{ word: 'x' }, { label: 'y' }]) {
      const { d, scheduler, failures } = driver(transforming, Q633);
      d.start(payload);
      equal(scheduler.added.map((x) => x.id), ['r1:a:-:0'], `${JSON.stringify(payload)}: admitted, and the entry dispatched`);
      // FD-C6: `input` is the value RECEIVED, untransformed — the transform runs in the worker wrapper, never here.
      equal(scheduler.added[0]!.payload, { settings: {}, input: payload, transform: RENAME }, `${JSON.stringify(payload)}: the envelope, the transform its third key`);
      equal(failures, [], `${JSON.stringify(payload)}: no run failure`);
    }
  });
  test('W170 — the CONTROL: the same entry with NO transform is held as before — { word } REFUSED at the entry, { label } admitted', () => {
    const plain = flow([t('a', 'Labelled', 'done'), END]);
    const { d, scheduler } = driver(plain, Q633);
    let caught: unknown;
    try { d.start({ word: 'x' }); } catch (e) { caught = e; }
    ok(caught instanceof BoundaryRefused, `a BoundaryRefused, got ${String(caught)}`);
    const e = caught as BoundaryRefused;
    equal([e.boundary, e.nodeId, e.findings], ['start', 'a', [{ path: '$.label', says: 'required' }]], 'LABEL_IN requires `label`, and `{ word }` has none');
    equal(scheduler.added.length, 0, 'nothing dispatched');
    equal(d.snapshot().length, 0, 'nothing appended');
    d.start({ label: 'y' });
    equal(scheduler.added.map((x) => x.id), ['r1:a:-:0'], '`{ label: "y" }` satisfies LABEL_IN and starts the same, still unstarted, driver');
  });
  test('W170 — tryTransform(…, { input }) on the SAME node still gives each payload its OWN verdict — Q633`s table', async () => {
    const transforming = flow([t('a', 'Labelled', 'done', { transform: RENAME }), END]);
    const reg = Q633 as unknown as Parameters<typeof tryTransform>[0];
    // The worker half handed in, as W166's suite does — the browser bundle cannot import the adapter's URL (Q261).
    const opts = { workerHalf: { jsonata: compileExpression } };
    const pass = await tryTransform(reg, transforming, 'a', RENAME, { ...opts, input: { word: 'x' } });
    equal(pass.map((v) => [v.consumer, v.shape, v.kind]), [['a', 'given', 'transform-passes']], '`{ word: "x" }` passes AFTER its transform');
    equal(pass[0]!.sample, { source: 'given', value: { word: 'x' }, result: { label: 'x' } }, 'the transform made `{ label: "x" }` of it');
    const fail = await tryTransform(reg, transforming, 'a', RENAME, { ...opts, input: { label: 'y' } });
    equal(fail.map((v) => [v.consumer, v.shape, v.kind]), [['a', 'given', 'transform-fails']], '`{ label: "y" }` fails AFTER its transform');
    equal(fail[0]!.sample, { source: 'given', value: { label: 'y' }, result: {} }, '`word` is absent, so JSONata drops the key');
    ok(fail[0]!.why.includes('$.label required'), `the finding names the path: ${fail[0]!.why}`);
  });
  test('W170 — SHAPE: a fan-out entry whose FIRST branch transforms — the skip does not end the walk, and the SECOND, untransformed, still refuses', () => {
    const fan = flow([{ id: 'split', kind: 'fanout', branches: ['tx', 'r'] }, t('tx', 'Labelled', 'join', { transform: RENAME }), t('r', 'Checked', 'join'), JOIN('split'), END], 'split');
    const { d, scheduler } = driver(fan, Q633);
    let caught: unknown;
    try { d.start({ word: 'x' }); } catch (e) { caught = e; }
    ok(caught instanceof BoundaryRefused, `a BoundaryRefused, got ${String(caught)}`);
    equal([(caught as BoundaryRefused).nodeId, (caught as BoundaryRefused).findings], ['r', [{ path: '$.confidence', says: 'required' }]], 'the UNTRANSFORMED branch is named — IN requires `confidence`');
    equal(scheduler.added.length, 0, 'nothing dispatched');
    // `{ word, confidence }` satisfies IN, and before its transform would fail LABEL_IN at `tx` — which is not held.
    d.start({ word: 'x', confidence: 0.5 });
    equal(scheduler.added.map((x) => x.id).sort(), ['r1:r:1:0', 'r1:tx:0:0'], 'both branches dispatched — the transforming one unheld');
  });
  test('W170 — SHAPE: a map entry whose branch task transforms — no item is held, one instance per item; the untransformed map refuses the same items', () => {
    const items = { items: [{ word: 'p' }, { word: 'q' }] };
    const transformingMap = flow([{ id: 'each', kind: 'map', over: 'items', branch: 'b' }, t('b', 'Labelled', 'join', { transform: RENAME }), JOIN('each'), END], 'each');
    const { d, scheduler } = driver(transformingMap, Q633);
    d.start(items);
    equal(scheduler.added.map((x) => x.id).sort(), ['r1:b:0:0', 'r1:b:1:0'], 'two instances, neither item held to LABEL_IN before its transform');
    const plainMap = flow([{ id: 'each', kind: 'map', over: 'items', branch: 'b' }, t('b', 'Labelled', 'join'), JOIN('each'), END], 'each');
    const { d: d2, scheduler: s2 } = driver(plainMap, Q633);
    throws(() => d2.start(items), 'BoundaryRefused', 'the CONTROL: untransformed, `{ word }` has no `label`');
    equal(s2.added.length, 0, 'and nothing dispatched');
    equal(d2.snapshot().length, 0, 'and nothing appended');
  });
  test('W170 — SHAPE: an entry GATE (the built-in `if`) — its chosen target transforms and is not held; the OTHER route, untransformed, still refuses', () => {
    // `if` routes `then` where `input.priority >= 5` and takes the unlabelled edge otherwise (the gate's own settings).
    const gated = flow([{ id: 'g', kind: 'gate', type: 'if', settings: { when: { path: 'input.priority', op: 'gte', value: 5 } }, edges: [{ route: 'then', to: 'a' }, { to: 'r' }] },
      t('a', 'Labelled', 'done', { transform: RENAME }), t('r', 'Checked', 'done'), END], 'g');
    const { d, scheduler } = driver(gated, Q633);
    d.start({ word: 'x', priority: 7 });
    equal(scheduler.added.map((x) => x.id), ['r1:a:-:0'], 'priority 7 routes to the transforming `a`, which is not held before its transform');
    const { d: d2, scheduler: s2 } = driver(gated, Q633);
    let caught: unknown;
    try { d2.start({ word: 'x', priority: 1 }); } catch (e) { caught = e; }
    ok(caught instanceof BoundaryRefused && caught.nodeId === 'r', `priority 1 routes to the untransformed r, refused — IN requires confidence: ${String(caught)}`);
    equal(s2.added.length, 0, 'nothing dispatched');
  });
  test('W170 — SHAPE: an entry composing "." AND transforming — not held; the composed value is what it receives', () => {
    const own = { lang: 'jsonata', expr: '{ "label": own.word }' };
    const composed = flow([t('a', 'Labelled', 'done', { transform: own, needs: { own: '.' } }), END]);
    const { d, scheduler } = driver(composed, Q633);
    d.start({ word: 'x' });
    equal(scheduler.added.map((x) => x.id), ['r1:a:-:0'], 'admitted');
    equal(scheduler.added[0]!.payload, { settings: {}, input: { own: { word: 'x' } }, transform: own }, 'the COMPOSED value, untransformed, and the transform as the third key');
  });
  test('W170 — a transform in ANOTHER language (the fake `path`) is not held either: the skip reads the declaration, not the language', () => {
    const inner = { lang: 'path', expr: 'inner' };
    const { d, scheduler } = driver(flow([t('a', 'Labelled', 'done', { transform: inner }), END]), { ...Q633, languages: { path: PATH_LANGUAGE } });
    // `{ inner: { label } }` has no `label` at the top, so LABEL_IN refuses it BEFORE the transform; the path reads it out.
    d.start({ inner: { label: 'z' } });
    equal(scheduler.added.map((x) => x.id), ['r1:a:-:0'], 'admitted');
  });
  test('W170 — the check BEFORE a run (ADR 0101 rule 3): givenVerdict on each transforming TARGET, on the value that task RECEIVES — not on the raw payload, not on a region entry', async () => {
    const reg = Q633 as unknown as Parameters<typeof givenVerdict>[0];
    const opts = { workerHalf: { jsonata: compileExpression } };
    const at = async (f: FlowDefinition, node: string, v: unknown) => (await givenVerdict(reg, f, node, v, opts)).map((x) => [x.kind, x.sample?.result]);
    // `needs: { own: "." }`: the task receives `{ own: payload }` (FD-C1), and that is what the transform sees as `$`.
    const composed = flow([t('a', 'Labelled', 'done', { transform: { lang: 'jsonata', expr: '{ "label": own.word }' }, needs: { own: '.' } }), END]);
    equal(boundaryTargets(composed, { word: 'x' }), [{ node: 'a', value: { word: 'x' } }], 'the target and the value reaching it, before its needs');
    equal(await at(composed, 'a', { own: { word: 'x' } }), [['transform-passes', { label: 'x' }]], 'on the value it RECEIVES: passes');
    equal(await at(composed, 'a', { word: 'x' }), [['transform-fails', {}]], 'on the raw payload: `own` is absent and JSONata drops the key — the WRONG question');
    // A map's branch receives each ELEMENT under `over`.
    const map = flow([{ id: 'each', kind: 'map', over: 'items', branch: 'b' }, t('b', 'Labelled', 'join', { transform: RENAME }), JOIN('each'), END], 'each');
    const payload = { items: [{ word: 'p' }] };
    equal(boundaryTargets(map, payload), [{ node: 'b', value: { word: 'p' } }], 'one target per element, the element its value');
    equal(await at(map, 'b', { word: 'p' }), [['transform-passes', { label: 'p' }]], 'on the element: passes');
    equal(await at(map, 'b', payload), [['transform-fails', {}]], 'on the whole payload: no `word` at the top');
    equal(await givenVerdict(reg, map, 'each', payload, opts), [], 'a REGION entry is no task: `[]`, which checks nothing');
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
  test('W170 — a parked TRANSFORMING node`s resolution is STILL held to its worker`s outputSchema: a transform changes what a worker receives, never what it returns', () => {
    const h = driver(flow([t('a', 'Labelled', 'done', { transform: RENAME }), END]), Q633);
    // `{ label: "y" }` satisfies LABEL_IN as it stands, so this setup starts with or without the start-side skip.
    h.d.start({ label: 'y' });
    h.scheduler.settle('r1:a:-:0', 'user_action', { error: 'needs a person' });
    let caught: unknown;
    try { h.d.resolve('r1:a:-:0', 'done', { result: { ok: 'yes' }, actor: 'ops' }); } catch (e) { caught = e; }
    ok(caught instanceof BoundaryRefused, `a BoundaryRefused, got ${String(caught)}`);
    equal([(caught as BoundaryRefused).boundary, (caught as BoundaryRefused).findings], ['resolve', [{ path: '$.ok', says: 'expected boolean, got string' }]], 'LABEL_OUT types `ok` boolean');
    equal(h.d.resolve('r1:a:-:0', 'done', { result: (LABEL_OUT.examples as unknown[])[0], actor: 'ops' }), true, 'the declared example resolves it');
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
  test('W170 — through the runtime: Q633`s `{ word: "x" }` STARTS a transforming entry, and the untransformed control refuses it', () => {
    const s = seams();
    const rt = createRuntime({ ...DOC, workers: Q633_WORKERS, nodeTypes: Q633_TYPES, languages: ['jsonata'] }, { languages: { jsonata } }, { createPool: s.createPool, createScheduler: s.createScheduler });
    rt.start(flow([t('a', 'Labelled', 'done', { transform: RENAME }), END]), { word: 'x' });
    equal(s.added.length, 1, 'admitted and dispatched — ADR 0101');
    throws(() => rt.start(flow([t('a', 'Labelled', 'done'), END]), { word: 'x' }), 'BoundaryRefused', 'the CONTROL, refused through the runtime as before');
    equal(s.added.length, 1, 'and the control dispatched nothing');
  });
});
