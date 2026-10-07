/**
 * **What the driver hands `createTask` for EVERY task node — the envelope, the pool key, and the
 * merges** — `spec/flow-definition.md` section 2 (v0.19) and `FD-C5` in section 3, ladder L2,
 * [ADR 0049](../../doc/decisions/0049-a-node-type-is-a-registry-entry-and-its-worker-receives-an-envelope.md),
 * [ADR 0054](../../doc/decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md),
 * [W59](../../doc/work-items/w59-what-a-node-type-is.md), [W65](../../doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md).
 *
 * Every claim is asserted on the four shapes a task node takes (`doc/workflow.md` section 5 rule 8
 * obligation (a)): a top-level task, a task inside a `fanout` branch, the branch task of a `map` —
 * where the envelope wraps each instance's OWN item under `JP-R11` — and a join's successor, whose
 * `input` is `JP-R12`'s collection. The shape list is compared to the typed corpus flow's structure.
 *
 * **`input` is asserted against what the SPEC says the node receives** — section 3's ordinary edge
 * (the previous node's result), `JP-R11` (a branch's copy; an instance's own item) and `JP-R12` (the
 * collection keyed by branch path) — written from the fixture's settlements before the driver runs,
 * because since v0.19 there is no bare node whose whole payload could stand as the other half of a
 * pair. *(W59 measured `input` against an untyped node in the same position; that road retired with
 * `workerType`.)* Every expected value is copied from the definition and the fixture, never the run.
 */
import { equal, ok, readText, ROOT, suite, throws } from '../harness.ts';
import { typesFor } from '../registry-fixture.ts';
import { Driver, InvalidDefinition } from '../../src/driver/driver.ts';
import { DerivationRefused, NameCollision, PoolTypeMissing, SchemaRefused, UndeclaredKey, WorkerMissing } from '../../src/definition/registry.ts';
import { POLICIES } from '../../src/fold/policies.ts';
import { fold } from '../../src/fold/run-state.ts';
import { shapesOf, typedNode } from '../definition/task-shapes.ts';
import type { FlowDefinition, NodeTypeEntry, NodeTypes, RetryPolicy, WorkerEntry } from '../../src/definition/types.ts';

class Fake {
  added: Record<string, unknown>[] = [];
  private l = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(t: unknown) { this.added.push(t as Record<string, unknown>); }
  addEventListener(t: string, f: (e: { detail: unknown }) => void) { this.l.set(t, [...(this.l.get(t) ?? []), f]); }
  settle(id: string, result: unknown) {
    const d = { id, state: 'done', result, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
    for (const f of this.l.get('task.completed') ?? []) f({ detail: d });
  }
  byId(id: string): Record<string, unknown> {
    const t = this.added.find((x) => x.id === id);
    if (!t) throw new Error(`no task ${id} was added; added: ${this.added.map((x) => x.id).join(', ')}`);
    return t;
  }
}

const NODE_POLICY: RetryPolicy = { maxRetries: 1, backoffMs: 0 };
const TYPE_POLICY: RetryPolicy = { maxRetries: 3, backoffMs: 50 };
const DRIVER_DEFAULT: RetryPolicy = { maxRetries: 5, backoffMs: 100 };
/** Two settings values for the discriminating PAIR — asserted to differ, below. */
const SETTINGS_A: { factor: number } = { factor: 10 };
const SETTINGS_B: { factor: number } = { factor: 100 };
/** A type's settings DEFAULTS, for the merge (decision 12) — `factor` overridable, `mode` not overridden by any node here. */
const DEFAULTS = { factor: 3, mode: 'fast' } as const;

const WORKERS: Readonly<Record<string, WorkerEntry>> = {
  scorer: { url: 'test://scorer', settingsSchema: { type: 'object', properties: { factor: { type: 'number' }, mode: { type: 'string' } } } },
};
const TYPES: Readonly<Record<string, NodeTypeEntry>> = {
  Scorer: { worker: 'scorer', retryPolicy: TYPE_POLICY, groups: ['gpu'] },
  // No retry default and no groups, so the third level of the merge has a case.
  Ranker: { worker: 'ranker' },
  // Declares settings DEFAULTS.
  Defaulted: { worker: 'scorer', settings: DEFAULTS },
  // A CLASS-form type — the adequacy reader (M45, M46): no class reached `new Driver` in any suite, so a
  // driver reading a class's retryPolicy and settings as undefined was green at every rung.
  Classy: { worker: 'scorer', retryPolicy: TYPE_POLICY, settings: DEFAULTS, pool: () => ({}) },
};
const WORKER_TYPES = ['IngestWorker', 'ScoreWorker'];
const REG = typesFor(WORKER_TYPES, TYPES, WORKERS);
/** A named instance of `Scorer`, so a node may run on a pool that is not the default; and one of `Ranker`, for FD-V38's other-type case. */
const POOLS = { 'scorer-2': { type: 'Scorer' }, 'ranker-big': { type: 'Ranker' } };
const BASE = { predicates: new Map(), ...REG, pools: POOLS, groups: ['gpu', 'api'], now: () => 1 } as const;
type Opts = Partial<ConstructorParameters<typeof Driver>[1]>;

/** What `ingest` settles with, in every shape — the value the SPEC then says each subject receives. */
const INGEST = { confidence: 0.9, items: ['a', 'b', 'c'] };

/**
 * Each shape: build the document with `extra` on the task under test, drive it far enough for that
 * task to be dispatched, and return the dispatched ids of the task under test, one id of a task that
 * declares nothing beyond its type, and **what the spec says each subject's `input` is** — written
 * from the fixture, not read from the run.
 */
const SHAPES: readonly [string, (extra: Record<string, unknown>, s: Fake, opts: Opts) => { subject: string[]; control: string; expectedInput: Record<string, unknown> }][] = [
  ['top-level task', (extra, s, opts) => {
    const def = {
      flowId: 'top', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'score' }] },
        { id: 'score', kind: 'task', edges: [{ to: 'done' }], ...extra },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const d = new Driver(def, { runId: 'r1', scheduler: s, createTask: (c) => c, ...BASE, ...opts });
    d.start({ confidence: 0.9 });
    s.settle('r1:ingest:-:0', INGEST);
    // Section 3's ordinary edge: the previous node's result, whole.
    return { subject: ['r1:score:-:0'], control: 'r1:ingest:-:0', expectedInput: { 'r1:score:-:0': INGEST } };
  }],
  ['task inside a fanout branch', (extra, s, opts) => {
    const def = {
      flowId: 'fan', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
        { id: 'split', kind: 'fanout', branches: ['scoreA', 'scoreB'] },
        { id: 'scoreA', kind: 'task', edges: [{ to: 'collect' }], ...extra },
        { id: 'scoreB', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const d = new Driver(def, { runId: 'r1', scheduler: s, createTask: (c) => c, ...BASE, joinPolicy: POLICIES['live-token'], ...opts });
    d.start({ confidence: 0.9 });
    s.settle('r1:ingest:-:0', INGEST);
    // JP-R11: a branch receives its OWN copy of what the fanout received — equal by value.
    return { subject: ['r1:scoreA:0:0'], control: 'r1:scoreB:1:0', expectedInput: { 'r1:scoreA:0:0': INGEST } };
  }],
  ['branch task of a map', (extra, s, opts) => {
    const def = {
      flowId: 'map', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'each' }] },
        { id: 'each', kind: 'map', over: 'items', branch: 'rank' },
        { id: 'rank', kind: 'task', edges: [{ to: 'gather' }], ...extra },
        { id: 'gather', kind: 'join', of: 'each', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const d = new Driver(def, { runId: 'r1', scheduler: s, createTask: (c) => c, ...BASE, joinPolicy: POLICIES['live-token'], ...opts });
    d.start({ confidence: 0.9 });
    s.settle('r1:ingest:-:0', INGEST);
    // JP-R11: each instance receives its OWN item — `over`'s array at that instance's index.
    return { subject: ['r1:rank:0:0', 'r1:rank:1:0', 'r1:rank:2:0'], control: 'r1:ingest:-:0', expectedInput: { 'r1:rank:0:0': 'a', 'r1:rank:1:0': 'b', 'r1:rank:2:0': 'c' } };
  }],
  ['successor of a join', (extra, s, opts) => {
    const def = {
      flowId: 'after', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'IngestWorker', edges: [{ to: 'split' }] },
        { id: 'split', kind: 'fanout', branches: ['scoreA', 'scoreB'] },
        { id: 'scoreA', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
        { id: 'scoreB', kind: 'task', type: 'ScoreWorker', edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
        { id: 'publish', kind: 'task', edges: [{ to: 'done' }], ...extra },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const d = new Driver(def, { runId: 'r1', scheduler: s, createTask: (c) => c, ...BASE, joinPolicy: POLICIES['live-token'], ...opts });
    d.start({ confidence: 0.9 });
    s.settle('r1:ingest:-:0', INGEST);
    s.settle('r1:scoreA:0:0', { score: 1 });
    s.settle('r1:scoreB:1:0', { score: 2 });
    // JP-R12: the arrived branches' results keyed by branch path.
    return { subject: ['r1:publish:-:0'], control: 'r1:scoreA:0:0', expectedInput: { 'r1:publish:-:0': { '0': { score: 1 }, '1': { score: 2 } } } };
  }],
];

suite('W59 — a typed node is dispatched to its type`s pool with the envelope { settings, input } — FD-C5, on every shape', (test) => {
  for (const [shape, drive] of SHAPES) {
    test(`${shape}: the pool is the type's name, the payload has exactly the two keys, and input IS what the spec says the node receives`, () => {
      const s = new Fake();
      const t = drive({ type: 'Scorer', settings: SETTINGS_A }, s, {});
      for (const id of t.subject) {
        const c = s.byId(id);
        equal(c.workerType, 'Scorer', `${id}: dispatched to the pool keyed by the type's name — the default instance`);
        const env = c.payload as Record<string, unknown>;
        equal(Object.keys(env).sort(), ['input', 'settings'], `${id}: the envelope has exactly the two keys, no reserved third`);
        equal(env.settings, SETTINGS_A, `${id}: settings is the node's declared object`);
        equal(env.input, t.expectedInput[id], `${id}: input deep-equals what the spec says this position receives — FD-C5`);
        equal(Object.keys(c).sort(), ['id', 'optional', 'payload', 'retryPolicy', 'workerType'],
          `${id}: the type's retryPolicy rode along and nothing else did — no workerGroups from the type, which are the POOL's`);
      }
      // **Every task node is typed since v0.19**: the node that declares nothing beyond its type is
      // dispatched with the envelope too — `settings: {}` and its input — and the four-field object.
      const control = s.byId(t.control);
      equal(Object.keys(control).sort(), ['id', 'optional', 'payload', 'workerType'], `${t.control}: a node declaring nothing hands the factory the four-field object`);
      equal(Object.keys(control.payload as object).sort(), ['input', 'settings'], `${t.control}: and its payload is the envelope — there is no bare road`);
      equal((control.payload as { settings: unknown }).settings, {}, `${t.control}: with settings {}`);
    });

    test(`${shape}: a node naming a POOL is dispatched to that instance's key, and the type's name is the default stated explicitly — FD-V38 at dispatch`, () => {
      const s = new Fake();
      const { subject } = drive({ type: 'Scorer', pool: 'scorer-2' }, s, {});
      for (const id of subject) equal(s.byId(id).workerType, 'scorer-2', `${id}: the named instance's key, not the type's`);
      const d = new Fake();
      const byName = drive({ type: 'Scorer', pool: 'Scorer' }, d, {});
      for (const id of byName.subject) equal(d.byId(id).workerType, 'Scorer', `${id}: the default by name`);
      equal(subject, byName.subject, 'same ids either way — a pool changes no id');
    });

    test(`${shape}: settings is the node's OWN COPY per dispatch — JP-R11's invariant one field over`, () => {
      const s = new Fake();
      const declared = { factor: 7, nested: { deep: true } };
      const { subject } = drive({ type: 'Ranker', settings: declared }, s, {});
      const envs = subject.map((id) => (s.byId(id).payload as { settings: Record<string, unknown> }).settings);
      for (const [i, env] of envs.entries()) {
        ok(env !== declared, `${subject[i]}: not the declaration object itself`);
        ok((env.nested as object) !== declared.nested, `${subject[i]}: nor its nested object`);
        equal(env, declared, `${subject[i]}: equal by value`);
      }
      for (let i = 0; i < envs.length; i++) for (let k = i + 1; k < envs.length; k++) ok(envs[i] !== envs[k], `instances ${i} and ${k} hold distinct settings objects`);
      (envs[0]!.nested as Record<string, unknown>).deep = false;
      equal(declared.nested.deep, true, 'a write into a dispatched copy does not reach the definition');
    });

    test(`${shape}: a typed node with NO settings is dispatched with settings {} — the validator saw the same object`, () => {
      const s = new Fake();
      const { subject } = drive({ type: 'Scorer' }, s, {});
      for (const id of subject) equal((s.byId(id).payload as { settings: unknown }).settings, {}, `${id}: settings is {}`);
    });

    test(`${shape}: a type's settings DEFAULTS are merged UNDER the node's — the node wins per key, the rest reaches the worker (decision 12)`, () => {
      const s = new Fake();
      const { subject } = drive({ type: 'Defaulted', settings: { factor: 10 } }, s, {});
      for (const id of subject) equal((s.byId(id).payload as { settings: unknown }).settings, { factor: 10, mode: 'fast' }, `${id}: the node's factor over the default, the default's mode beside it`);
      const none = new Fake();
      const n = drive({ type: 'Defaulted' }, none, {});
      for (const id of n.subject) equal((none.byId(id).payload as { settings: unknown }).settings, DEFAULTS, `${id}: no node settings — the defaults, whole`);
      ok((DEFAULTS.factor as number) !== 10, 'the override differs from the default, so the merge is a claim');
    });

    test(`${shape}: with a needs declared, input is EXACTLY the composed object — FD-C1 inside FD-C5`, () => {
      const s = new Fake();
      const { subject } = drive({ type: 'Scorer', needs: { own: '.', run: 'ingest' } }, s, {});
      for (const id of subject) {
        const env = s.byId(id).payload as { input: Record<string, unknown> };
        equal(Object.keys(env.input).sort(), ['own', 'run'], `${id}: input has exactly the keys needs describes — no wrapper inside the wrapper`);
        equal(env.input.run, INGEST, `${id}: and the aimed key resolved to ingest's output`);
      }
    });

    test(`${shape}: the retry MERGE — node wins whole, then the type, then the driver default`, () => {
      for (const [a, b] of [[NODE_POLICY, TYPE_POLICY], [TYPE_POLICY, DRIVER_DEFAULT], [NODE_POLICY, DRIVER_DEFAULT]]) {
        ok(a.maxRetries !== b.maxRetries && a.backoffMs !== b.backoffMs, 'the three policies differ pairwise in both fields');
      }
      const own = new Fake();
      const o = drive({ type: 'Scorer', retryPolicy: NODE_POLICY }, own, { defaultRetryPolicy: DRIVER_DEFAULT });
      for (const id of o.subject) equal(own.byId(id).retryPolicy, NODE_POLICY, `${id}: the node's own policy, whole, over the type's and the default`);
      const typ = new Fake();
      const y = drive({ type: 'Scorer' }, typ, { defaultRetryPolicy: DRIVER_DEFAULT });
      for (const id of y.subject) equal(typ.byId(id).retryPolicy, TYPE_POLICY, `${id}: the type's policy, whole, over the driver default`);
      equal(typ.byId(y.control).retryPolicy, DRIVER_DEFAULT, `${y.control}: a node of a type with no policy beside it gets the driver default — a type's policy reaches only its own nodes`);
      const dflt = new Fake();
      const f = drive({ type: 'Ranker' }, dflt, { defaultRetryPolicy: DRIVER_DEFAULT });
      for (const id of f.subject) equal(dflt.byId(id).retryPolicy, DRIVER_DEFAULT, `${id}: a type declaring none falls through to the driver default`);
      const none = new Fake();
      const n = drive({ type: 'Ranker' }, none, {});
      for (const id of n.subject) equal(Object.keys(none.byId(id)).sort(), ['id', 'optional', 'payload', 'workerType'], `${id}: nothing anywhere, no retryPolicy key at all`);
    });

    test(`${shape}: a CLASS-form type's retryPolicy and settings defaults reach the dispatch exactly as a document type's do — both shapes of a type at the driver`, () => {
      const s = new Fake();
      const { subject } = drive({ type: 'Classy', settings: { factor: 10 } }, s, { defaultRetryPolicy: DRIVER_DEFAULT });
      for (const id of subject) {
        const c = s.byId(id);
        equal(c.retryPolicy, TYPE_POLICY, `${id}: the class's policy over the driver default`);
        equal((c.payload as { settings: unknown }).settings, { factor: 10, mode: 'fast' }, `${id}: the class's defaults under the node's settings`);
        equal(c.workerType, 'Classy', `${id}: the class's default pool, keyed by its name`);
      }
      const n = new Fake();
      const none = drive({ type: 'Classy' }, n, {});
      for (const id of none.subject) equal((n.byId(id).payload as { settings: unknown }).settings, DEFAULTS, `${id}: no node settings — the class's defaults, whole`);
    });

    test(`${shape}: a typed node's OWN workerGroups still passes through — the type's groups are the pool's and never appear on the task`, () => {
      const s = new Fake();
      const { subject } = drive({ type: 'Scorer', workerGroups: ['api'] }, s, {});
      for (const id of subject) equal(s.byId(id).workerGroups, ['api'], `${id}: the node's groups, and only those — 'gpu' (the type's) is on the pool`);
    });
  }

  test('the discriminating pair: two typed nodes of ONE type with DIFFERENT settings receive different envelopes', () => {
    ok(SETTINGS_A.factor !== SETTINGS_B.factor, 'the two settings values differ — the pair is a claim (rule 8, fourth requirement on the set)');
    const s = new Fake();
    const def = {
      flowId: 'pair', version: 1, entry: 'low',
      nodes: [
        { id: 'low', kind: 'task', type: 'Scorer', settings: SETTINGS_A, edges: [{ to: 'high' }] },
        { id: 'high', kind: 'task', type: 'Scorer', settings: SETTINGS_B, edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const d = new Driver(def, { runId: 'r1', scheduler: s, createTask: (c) => c, ...BASE });
    d.start({ confidence: 0.9 });
    s.settle('r1:low:-:0', { confidence: 0.9, score: 9 });
    const low = s.byId('r1:low:-:0').payload as { settings: unknown; input: unknown };
    const high = s.byId('r1:high:-:0').payload as { settings: unknown; input: unknown };
    equal(low.settings, SETTINGS_A, 'low carries A');
    equal(high.settings, SETTINGS_B, 'high carries B');
    equal(high.input, { confidence: 0.9, score: 9 }, 'and high`s input is low`s result — the ordinary edge, inside the envelope');
    equal(s.byId('r1:low:-:0').workerType, s.byId('r1:high:-:0').workerType, 'one type, one pool, two settings');
  });

  test('SHAPES here is the set of shapes the typed corpus flow`s typed nodes take, both ways', async () => {
    const flow = JSON.parse(await readText(`${ROOT}spec/examples/valid/typed.flow.json`)) as FlowDefinition;
    equal([...new Set(shapesOf(flow, typedNode))].sort(), SHAPES.map(([label]) => label).sort(), 'the shapes the corpus flow carries are the shapes every case here runs on');
  });

  test('a registry gaining a type and a named pool that no node names changes nothing: the two P12 flows dispatch byte-identically either way', async () => {
    // P16 decision 4's claim in its v0.19 form: what a registry declares beyond what a document
    // names is inert at dispatch. Every object handed to `createTask` must be deep-equal, in order.
    const corpus = JSON.parse(await readText(`${ROOT}spec/examples/registry.json`)) as { workers: Record<string, WorkerEntry>; nodeTypes: Record<string, NodeTypeEntry>; pools: Record<string, { type: string }> };
    for (const name of ['map-with-context', 'map-over-region-output']) {
      const flow = JSON.parse(await readText(`${ROOT}spec/examples/valid/${name}.flow.json`)) as FlowDefinition;
      const runs = [{}, { nodeTypes: { ...corpus.nodeTypes, Spare: { worker: 'scorer' } }, pools: { ...corpus.pools, 'spare-2': { type: 'Spare' } } }].map((extra) => {
        const s = new Fake();
        const d = new Driver(flow, { runId: 'r1', scheduler: s, createTask: (c) => c, predicates: new Map(), workers: corpus.workers, nodeTypes: corpus.nodeTypes, pools: corpus.pools, groups: ['gpu', 'api'], joinPolicy: POLICIES['live-token'], now: () => 1, ...extra });
        d.start({ confidence: 0.9, text: 'a bb ccc' });
        s.settle('r1:ingest:-:0', { confidence: 0.9, items: [{ word: 'a', confidence: 0.1 }, { word: 'bb', confidence: 0.2 }] });
        return s.added;
      });
      ok(runs[0]!.length >= 3, `${name}: the run dispatched past the entry (${runs[0]!.length} tasks)`);
      equal(runs[1], runs[0], `${name}: identical dispatches with an unused type and pool registered — no key, no change`);
    }
  });
});

suite('W59 — what a type declares for its nodes: the retry merge and the groups, at construction and at dispatch', (test) => {
  const [, drive] = SHAPES[0]!;
  test('construction: a type declaring a malformed retryPolicy is FD-V30, naming the type, before anything is queued', () => {
    const s = new Fake();
    // **The malformed type is SECOND, behind a well-formed one** — the adequacy reader (q07).
    const bad: NodeTypes = { ...REG.nodeTypes, Ranker: { worker: 'ranker' }, Scorer: { worker: 'scorer', retryPolicy: { maxRetries: '1', backoffMs: 0 } as unknown as RetryPolicy } };
    throws(() => drive({ type: 'Scorer' }, s, { nodeTypes: bad }), 'FD-V30', 'refused under the same rule id a node`s policy is');
    let err: unknown;
    try { drive({ type: 'Scorer' }, new Fake(), { nodeTypes: bad }); } catch (e) { err = e; }
    ok(err instanceof InvalidDefinition && err.rules.includes('FD-V30') && err.message.includes('"Scorer"'), `names the type: ${(err as Error)?.message}`);
    equal(s.added, [], 'and nothing was queued');
  });
  test('construction: a type declaring a group the registry does not is FD-V31, naming the type and the id', () => {
    const s = new Fake();
    const bad: NodeTypes = { ...REG.nodeTypes, Ranker: { worker: 'ranker' }, Scorer: { worker: 'scorer', groups: ['gpu', 'nope'] } };
    let err: unknown;
    try { drive({ type: 'Scorer' }, s, { nodeTypes: bad }); } catch (e) { err = e; }
    ok(err instanceof InvalidDefinition && err.rules.includes('FD-V31') && err.message.includes('"Scorer"') && err.message.includes('"nope"'), `FD-V31 naming both: ${(err as Error)?.message}`);
    equal(s.added, [], 'and nothing was queued');
    throws(() => drive({ type: 'Scorer' }, new Fake(), { nodeTypes: bad, groups: undefined }), 'FD-V31', 'omitted groups means the type`s group is unknown');
  });
  test('construction: the document`s refusals through the validator — FD-V32, FD-V33, FD-V38, FD-V23 and the retired key as FD-V17', () => {
    throws(() => drive({ type: 'Nope' }, new Fake(), {}), 'FD-V32', 'an unknown type');
    throws(() => drive({ type: 'Scorer' }, new Fake(), { nodeTypes: undefined, pools: undefined }), 'FD-V32', 'nodeTypes omitted: every type is unknown (pools omitted beside it — a named pool of an unregistered type is the registry`s own refusal, PoolTypeMissing, and fires first)');
    throws(() => drive({ type: 'Scorer', settings: { factor: 'ten' } }, new Fake(), {}), 'FD-V33', 'settings the worker`s settingsSchema refuses');
    throws(() => drive({ type: 'Scorer', pool: 'ranker-big' }, new Fake(), {}), 'FD-V38', 'a pool that is no instance of the type');
    throws(() => drive({}, new Fake(), {}), 'FD-V23', 'no type');
    throws(() => drive({ type: 'Scorer', workerType: 'ScoreWorker' }, new Fake(), {}), 'FD-V17', 'the retired key');
  });
  test('construction: the REGISTRY`s own defects are RegistryErrors naming the entry, thrown before anything is queued — never blamed on the document', () => {
    const s = new Fake();
    let err: unknown;
    // A worker's settingsSchema outside the subset — Q278: refused by name, not ignored.
    try { drive({ type: 'Scorer' }, s, { workers: { ...WORKERS, scorer: { url: 'test://scorer', settingsSchema: { type: 'object', pattern: 'x' } } } }); } catch (e) { err = e; }
    ok(err instanceof SchemaRefused && err.at === 'scorer' && err.message.includes('"pattern"'), `SchemaRefused naming the worker and the keyword: ${(err as Error)?.message}`);
    equal(s.added, [], 'and nothing was queued');
    // A type naming a worker the registry lacks.
    err = undefined;
    try { drive({ type: 'Scorer' }, new Fake(), { nodeTypes: { ...REG.nodeTypes, Scorer: { worker: 'gone' } } }); } catch (e) { err = e; }
    ok(err instanceof WorkerMissing && err.at === 'Scorer' && err.message.includes('"gone"'), `WorkerMissing naming the type and the worker: ${(err as Error)?.message}`);
    // A named pool of a type nobody registered, and a pool named as a type.
    err = undefined;
    try { drive({ type: 'Scorer' }, new Fake(), { pools: { big: { type: 'Nope' } } }); } catch (e) { err = e; }
    ok(err instanceof PoolTypeMissing && err.at === 'big', `PoolTypeMissing naming the pool: ${(err as Error)?.message}`);
    err = undefined;
    try { drive({ type: 'Scorer' }, new Fake(), { pools: { Scorer: { type: 'Scorer' } } }); } catch (e) { err = e; }
    ok(err instanceof NameCollision && err.at === 'Scorer', `NameCollision naming the pool: ${(err as Error)?.message}`);
  });
  // The adequacy reader (M06, M07, P1, P2): what `checkRegistry` runs at `new Driver` had one observer per
  // kind — settingsSchema alone of the four schemas, WorkerMissing alone of the type-shape clauses, and no
  // undeclared-key check on a worker or a pool at all (P1: `settingSchema`, a typo, meant NO schema applied).
  test('construction: ALL FOUR worker schemas are held to the subset at new Driver, a worker`s or a pool`s undeclared key is refused, and a type`s shape clauses fire — the resolver`s shape half, at the driver', () => {
    const at = (f: () => void): unknown => { try { f(); } catch (e) { return e; } return undefined; };
    for (const schema of ['configSchema', 'settingsSchema', 'inputSchema', 'outputSchema'] as const) {
      const err = at(() => drive({ type: 'Scorer' }, new Fake(), { workers: { ...WORKERS, scorer: { url: 'test://scorer', [schema]: { type: 'object', pattern: 'x' } } } }));
      ok(err instanceof SchemaRefused && err.at === 'scorer' && err.message.includes(schema) && err.message.includes('"pattern"'), `${schema}: SchemaRefused naming the worker, the field and the keyword: ${(err as Error)?.message}`);
    }
    const typo = at(() => drive({ type: 'Scorer' }, new Fake(), { workers: { ...WORKERS, scorer: { url: 'test://scorer', settingSchema: { type: 'object' } } as never } }));
    ok(typo instanceof UndeclaredKey && typo.at === 'scorer' && typo.message.includes('"settingSchema"'), `P1: a worker's undeclared key — the typo of settingsSchema — is refused, not silently unapplied: ${(typo as Error)?.message}`);
    const inert = at(() => drive({ type: 'Scorer' }, new Fake(), { pools: { 'scorer-3': { type: 'Scorer', maxThreads: 2 } as never } }));
    ok(inert instanceof UndeclaredKey && inert.at === 'scorer-3' && inert.message.includes('"maxThreads"'), `P2: a pool instance's undeclared key is refused: ${(inert as Error)?.message}`);
    for (const [label, bad] of [['pool not an object', { worker: 'scorer', pool: 'big' }], ['inline not a boolean', { worker: 'scorer', inline: 'yes' }], ['settings not an object', { worker: 'scorer', settings: [1] }]] as const) {
      const err = at(() => drive({ type: 'Scorer' }, new Fake(), { nodeTypes: { ...REG.nodeTypes, Scorer: bad as never } }));
      ok(err instanceof DerivationRefused && err.at === 'Scorer', `M07 ${label}: DerivationRefused naming the type: ${(err as Error)?.message}`);
    }
    const key = at(() => drive({ type: 'Scorer' }, new Fake(), { nodeTypes: { ...REG.nodeTypes, Scorer: { worker: 'scorer', pool: { maxThreads: 1, inline: true } } as never } }));
    ok(key instanceof UndeclaredKey && key.at === 'Scorer' && key.message.includes('"inline"'), `a key inside a type's pool that belongs beside it: ${(key as Error)?.message}`);
    // M21 at dispatch: another type's DEFAULT, named as a pool, is FD-V38 and the task is never routed to it.
    throws(() => drive({ type: 'Scorer', pool: 'Ranker' }, new Fake(), {}), 'FD-V38', 'a type name is not a pool key of another type');
  });
  test('construction: nodeTypes as a Map is read exactly as an object is', () => {
    const s = new Fake();
    const { subject } = drive({ type: 'Scorer', settings: SETTINGS_A }, s, { nodeTypes: new Map(Object.entries(REG.nodeTypes)) });
    equal((s.byId(subject[0]!).payload as { settings: unknown }).settings, SETTINGS_A, 'dispatched with the envelope from a Map-shaped registry');
    equal(s.byId(subject[0]!).retryPolicy, TYPE_POLICY, 'and the type`s policy read from it');
  });
});

/**
 * **W141 — a typed task that failed because its TYPE's worker could not set up is an ORDINARY task
 * failure to the run**, ladder L2 — Q266, P31 decision 3, ADR 0004 (a failure routes), ADR 0007 rule 2
 * (key on terminal state). The envelope worker (`src/scheduler/envelope-worker.ts`) remembers the setup
 * failure and throws it from `run()` on every task; the SCHEDULER then settles the task `failed` on an
 * optional node and `user_action` on a non-optional one (measured at W61, F3, and on W141's real pools
 * at L1). What this suite holds is the run's half: no worker and no scheduler, a fixture settlement
 * carrying the envelope's message — written here from the envelope's template, never read from a run —
 * and the routing the spec gives it. **The message is DATA to the driver and nothing in it is read for
 * routing**: the pair below differs in `optional` alone and routes two ways on one message.
 */
const W141_SETUP_FAILED = 'envelope worker: the type\'s worker "test://scorer" threw from its setup(): the database is down — every task on this worker fails with this until the pool is rebuilt';

class W141Fake {
  added: Record<string, unknown>[] = [];
  private l = new Map<string, ((e: { detail: unknown }) => void)[]>();
  addTask(t: unknown) { this.added.push(t as Record<string, unknown>); }
  addEventListener(t: string, f: (e: { detail: unknown }) => void) { this.l.set(t, [...(this.l.get(t) ?? []), f]); }
  /** Exactly as 0.5.2 delivers it: `task.failed` first, and `task.user_action` after it for a parked task (ADR 0007 rule 2). */
  fail(id: string, state: 'failed' | 'user_action', error: string) {
    const d = { id, state, error, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
    for (const f of this.l.get('task.failed') ?? []) f({ detail: d });
    if (state === 'user_action') for (const f of this.l.get('task.user_action') ?? []) f({ detail: d });
  }
}

const w141Flow = (optional: boolean): FlowDefinition => ({
  flowId: 'w141-setup-failed', version: 1, entry: 'score',
  nodes: [
    { id: 'score', kind: 'task', type: 'Scorer', ...(optional ? { optional: true } : {}), edges: [{ on: ['failed'], to: 'quarantine' }, { to: 'done' }] },
    { id: 'quarantine', kind: 'end', outcome: 'quarantined' },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition);

suite('W141 — a task failed by its type`s setup routes as any task failure: down on:["failed"] when optional, parked when not (Q266, ADR 0004)', (test) => {
  for (const optional of [true, false]) {
    test(`${optional ? 'optional' : 'non-optional'}: the setup failure is the node's error, and the run ${optional ? 'routes down the failure edge and completes' : 'waits on a person — awaiting_action, the node suspended'}`, () => {
      const s = new W141Fake();
      const d = new Driver(w141Flow(optional), { runId: 'r1', scheduler: s, createTask: (c) => c, ...BASE, joinPolicy: POLICIES['live-token'] });
      d.start({ confidence: 0.9 });
      equal(s.added.map((t) => t.id), ['r1:score:-:0'], 'one task dispatched, to the type`s pool');
      s.fail('r1:score:-:0', optional ? 'failed' : 'user_action', W141_SETUP_FAILED);
      const st = fold(d.foldInputs());
      const node = st.nodes['r1:score:-:0'];
      equal(node?.error, W141_SETUP_FAILED, 'the node carries the envelope`s message verbatim — what a person reading RunState sees');
      if (optional) {
        equal([node?.state, st.outcome], ['failed', 'completed'], 'failed, and the run completed (spec/run-state.md section 3: a path that reached an end)');
        equal(st.pathEnds, [{ reason: 'end', at: 'quarantine' }], 'ADR 0004: the failure ROUTED, down on:["failed"] to its end — not to `done`');
      } else {
        equal([node?.state, st.outcome], ['suspended', 'awaiting_action'], 'parked: a non-optional task out of retries is user_action, and the run waits on a person (ADR 0007 rule 2)');
        equal(st.pathEnds, [], 'and no path ended — nothing routed while the node is suspended');
      }
    });
  }
});
