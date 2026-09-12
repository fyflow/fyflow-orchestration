/**
 * **What the driver hands `createTask` for a TYPED node — the envelope, the pool, and the merge**
 * — `spec/flow-definition.md` section 2 (v0.17) and `FD-C5` in section 3, ladder L2,
 * [ADR 0049](../../doc/decisions/0049-a-node-type-is-a-registry-entry-and-its-worker-receives-an-envelope.md),
 * [W59](../../doc/work-items/w59-what-a-node-type-is.md).
 *
 * Every claim is asserted on the three shapes a task node takes (`doc/workflow.md` section 5 rule
 * 8 obligation (a), v0.16): a top-level task, a task inside a `fanout` branch, and the branch task
 * of a `map` — where the envelope wraps each instance's OWN item under `JP-R11`, not the map
 * node's value, which is the shape the feature was not built for. The shape list is compared to
 * the typed corpus flow's structure rather than written a fourth time.
 *
 * **`input` is asserted as a PAIR**: the same document run once with the node typed and once
 * untyped, in two fakes, and the typed envelope's `input` must deep-equal the untyped node's whole
 * payload. That is `FD-C5`'s definition — *the value this node receives* — made a measurement
 * rather than a restatement of the driver's own expression.
 *
 * Every expected value is copied from the definition under test, never from the run.
 */
import { equal, ok, readText, ROOT, suite, throws } from '../harness.ts';
import { Driver, InvalidDefinition } from '../../src/driver/driver.ts';
import { POLICIES } from '../../src/fold/policies.ts';
import { shapesOf, typedNode } from '../definition/task-shapes.ts';
import type { FlowDefinition, NodeType, NodeTypes, RetryPolicy } from '../../src/definition/types.ts';

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

const TYPES: Readonly<Record<string, NodeType>> = {
  Scorer: { worker: 'test://Scorer', retryPolicy: TYPE_POLICY, groups: ['gpu'], settings: (s) => (s.factor === undefined || typeof s.factor === 'number' ? null : 'factor must be a number') },
  // No retry default and no groups, so the third level of the merge has a case.
  Ranker: { worker: 'test://Ranker' },
};
const WORKER_TYPES = ['IngestWorker', 'ScoreWorker', 'Scorer', 'Ranker'];
const BASE = { predicates: new Map(), workerTypes: WORKER_TYPES, groups: ['gpu', 'api'], nodeTypes: TYPES, now: () => 1 } as const;
type Opts = Partial<ConstructorParameters<typeof Driver>[1]>;

/**
 * Each shape: build the document with `extra` on the task under test, drive it far enough for that
 * task to be dispatched, and return the dispatched ids of the task under test plus one id of a
 * task that declares nothing. The entry's settlement for the map shape is the items array.
 */
const SHAPES: readonly [string, (extra: Record<string, unknown>, s: Fake, opts: Opts) => { subject: string[]; control: string }][] = [
  ['top-level task', (extra, s, opts) => {
    const def = {
      flowId: 'top', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'score' }] },
        { id: 'score', kind: 'task', edges: [{ to: 'done' }], ...extra },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const d = new Driver(def, { runId: 'r1', scheduler: s, createTask: (c) => c, ...BASE, ...opts });
    d.start({ confidence: 0.9 });
    s.settle('r1:ingest:-:0', { confidence: 0.9, items: ['a', 'b', 'c'] });
    return { subject: ['r1:score:-:0'], control: 'r1:ingest:-:0' };
  }],
  ['task inside a fanout branch', (extra, s, opts) => {
    const def = {
      flowId: 'fan', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'split' }] },
        { id: 'split', kind: 'fanout', branches: ['scoreA', 'scoreB'] },
        { id: 'scoreA', kind: 'task', edges: [{ to: 'collect' }], ...extra },
        { id: 'scoreB', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const d = new Driver(def, { runId: 'r1', scheduler: s, createTask: (c) => c, ...BASE, joinPolicy: POLICIES['live-token'], ...opts });
    d.start({ confidence: 0.9 });
    s.settle('r1:ingest:-:0', { confidence: 0.9, items: ['a', 'b', 'c'] });
    return { subject: ['r1:scoreA:0:0'], control: 'r1:scoreB:1:0' };
  }],
  ['branch task of a map', (extra, s, opts) => {
    const def = {
      flowId: 'map', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'each' }] },
        { id: 'each', kind: 'map', over: 'items', branch: 'rank' },
        { id: 'rank', kind: 'task', edges: [{ to: 'gather' }], ...extra },
        { id: 'gather', kind: 'join', of: 'each', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const d = new Driver(def, { runId: 'r1', scheduler: s, createTask: (c) => c, ...BASE, joinPolicy: POLICIES['live-token'], ...opts });
    d.start({ confidence: 0.9 });
    s.settle('r1:ingest:-:0', { confidence: 0.9, items: ['a', 'b', 'c'] });
    return { subject: ['r1:rank:0:0', 'r1:rank:1:0', 'r1:rank:2:0'], control: 'r1:ingest:-:0' };
  }],
  // **The FOURTH shape, a join's successor — the adequacy reader (q51).** `FD-C5` names four kinds
  // of `input` and the three above instantiate three; a driver handing a typed successor `{}`
  // instead of `JP-R12`'s collection cost ZERO at L2 and at L6 while the clean tree demonstrably
  // produced the collection there. The pair assertion below now compares the envelope's `input`
  // to the bare successor's whole payload, which is the collection `{ '0': …, '1': … }`.
  ['successor of a join', (extra, s, opts) => {
    const def = {
      flowId: 'after', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', workerType: 'IngestWorker', edges: [{ to: 'split' }] },
        { id: 'split', kind: 'fanout', branches: ['scoreA', 'scoreB'] },
        { id: 'scoreA', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'collect' }] },
        { id: 'scoreB', kind: 'task', workerType: 'ScoreWorker', edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'publish' }] },
        { id: 'publish', kind: 'task', edges: [{ to: 'done' }], ...extra },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const d = new Driver(def, { runId: 'r1', scheduler: s, createTask: (c) => c, ...BASE, joinPolicy: POLICIES['live-token'], ...opts });
    d.start({ confidence: 0.9 });
    s.settle('r1:ingest:-:0', { confidence: 0.9, items: ['a', 'b', 'c'] });
    s.settle('r1:scoreA:0:0', { score: 1 });
    s.settle('r1:scoreB:1:0', { score: 2 });
    return { subject: ['r1:publish:-:0'], control: 'r1:scoreA:0:0' };
  }],
];

suite('W59 — a typed node is dispatched to its type`s pool with the envelope { settings, input } — FD-C5, on every shape', (test) => {
  for (const [shape, drive] of SHAPES) {
    test(`${shape}: the pool is the type's name, the payload has exactly the two keys, and input IS what the untyped node received`, () => {
      // The PAIR: the same shape, once typed and once untyped, so `input` is measured against
      // the value the driver hands a bare node rather than against this file's reading of it.
      const typed = new Fake();
      const bare = new Fake();
      const t = drive({ type: 'Scorer', settings: SETTINGS_A }, typed, {});
      const b = drive({ workerType: 'ScoreWorker' }, bare, {});
      equal(t.subject, b.subject, 'the same task ids are minted either way — a type changes no id');
      for (const id of t.subject) {
        const c = typed.byId(id);
        equal(c.workerType, 'Scorer', `${id}: dispatched to the pool keyed by the type's name`);
        const env = c.payload as Record<string, unknown>;
        equal(Object.keys(env).sort(), ['input', 'settings'], `${id}: the envelope has exactly the two keys, no reserved third`);
        equal(env.settings, SETTINGS_A, `${id}: settings is the node's declared object`);
        equal(env.input, bare.byId(id).payload, `${id}: input deep-equals the WHOLE payload the untyped node in this position received — FD-C5`);
        equal(Object.keys(c).sort(), ['id', 'optional', 'payload', 'retryPolicy', 'workerType'],
          `${id}: the type's retryPolicy rode along and nothing else did — no workerGroups from the type, which are the POOL's`);
      }
      // And the node that declares nothing is byte-identical to before this item, in the typed run too.
      equal(Object.keys(typed.byId(t.control)).sort(), ['id', 'optional', 'payload', 'workerType'],
        `${t.control}: a bare node beside a typed one hands the factory the exact four-field object`);
      equal(typed.byId(t.control).payload, bare.byId(b.control).payload, 'and receives exactly what it received with no types registered');
    });

    test(`${shape}: settings is the node's OWN COPY per dispatch — JP-R11's invariant one field over`, () => {
      const s = new Fake();
      const declared = { factor: 7, nested: { deep: true } };
      const { subject } = drive({ type: 'Scorer', settings: declared }, s, {});
      const envs = subject.map((id) => (s.byId(id).payload as { settings: Record<string, unknown> }).settings);
      for (const [i, env] of envs.entries()) {
        ok(env !== declared, `${subject[i]}: not the declaration object itself`);
        ok((env.nested as object) !== declared.nested, `${subject[i]}: nor its nested object`);
        equal(env, declared, `${subject[i]}: equal by value`);
      }
      // A map's N instances get N distinct copies, so a worker mutating its settings cannot reach
      // a sibling's — measured as `!==` pairwise rather than assumed from the clone.
      for (let i = 0; i < envs.length; i++) for (let k = i + 1; k < envs.length; k++) ok(envs[i] !== envs[k], `instances ${i} and ${k} hold distinct settings objects`);
      // And the declaration survives a worker writing into what it was handed.
      (envs[0]!.nested as Record<string, unknown>).deep = false;
      equal(declared.nested.deep, true, 'a write into a dispatched copy does not reach the definition');
    });

    test(`${shape}: a typed node with NO settings is dispatched with settings {} — the validator saw the same object`, () => {
      const s = new Fake();
      const { subject } = drive({ type: 'Scorer' }, s, {});
      for (const id of subject) equal((s.byId(id).payload as { settings: unknown }).settings, {}, `${id}: settings is {}`);
    });

    test(`${shape}: with a needs declared, input is EXACTLY the composed object — FD-C1 inside FD-C5`, () => {
      const s = new Fake();
      const { subject } = drive({ type: 'Scorer', needs: { own: '.', run: 'ingest' } }, s, {});
      for (const id of subject) {
        const env = s.byId(id).payload as { input: Record<string, unknown> };
        equal(Object.keys(env.input).sort(), ['own', 'run'], `${id}: input has exactly the keys needs describes — no wrapper inside the wrapper`);
        equal(env.input.run, { confidence: 0.9, items: ['a', 'b', 'c'] }, `${id}: and the aimed key resolved to ingest's output`);
      }
    });

    test(`${shape}: the retry MERGE — node wins whole, then the type, then the driver default`, () => {
      // The three policies are a discriminating triple; their pairwise difference in BOTH fields
      // is asserted, because two equal literals made *the default wins* cost zero at W58.
      for (const [a, b] of [[NODE_POLICY, TYPE_POLICY], [TYPE_POLICY, DRIVER_DEFAULT], [NODE_POLICY, DRIVER_DEFAULT]]) {
        ok(a.maxRetries !== b.maxRetries && a.backoffMs !== b.backoffMs, 'the three policies differ pairwise in both fields');
      }
      const own = new Fake();
      const o = drive({ type: 'Scorer', retryPolicy: NODE_POLICY }, own, { defaultRetryPolicy: DRIVER_DEFAULT });
      for (const id of o.subject) equal(own.byId(id).retryPolicy, NODE_POLICY, `${id}: the node's own policy, whole, over the type's and the default`);
      const typ = new Fake();
      const y = drive({ type: 'Scorer' }, typ, { defaultRetryPolicy: DRIVER_DEFAULT });
      for (const id of y.subject) equal(typ.byId(id).retryPolicy, TYPE_POLICY, `${id}: the type's policy, whole, over the driver default`);
      equal(typ.byId(y.control).retryPolicy, DRIVER_DEFAULT, `${y.control}: a bare node beside it gets the driver default — a type's policy reaches only its own nodes`);
      const dflt = new Fake();
      const f = drive({ type: 'Ranker' }, dflt, { defaultRetryPolicy: DRIVER_DEFAULT });
      for (const id of f.subject) equal(dflt.byId(id).retryPolicy, DRIVER_DEFAULT, `${id}: a type declaring none falls through to the driver default`);
      const none = new Fake();
      const n = drive({ type: 'Ranker' }, none, {});
      for (const id of n.subject) equal(Object.keys(none.byId(id)).sort(), ['id', 'optional', 'payload', 'workerType'], `${id}: nothing anywhere, no retryPolicy key at all`);
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

  test('P16 decision 4: map-with-context and map-over-region-output dispatch byte-identically with and without node types registered', async () => {
    // The two flows P12 built, run through the fake with the registry as it stood before this item
    // and with `nodeTypes` present: every object handed to `createTask` must be deep-equal, in
    // order. A registry gaining types changes nothing for a document that names none.
    for (const name of ['map-with-context', 'map-over-region-output']) {
      const flow = JSON.parse(await readText(`${ROOT}spec/examples/valid/${name}.flow.json`)) as FlowDefinition;
      // `groups` is passed in BOTH runs, because `Scorer` declares one and the pair must differ in
      // `nodeTypes` alone.
      const runs = [{}, { nodeTypes: TYPES }].map((extra) => {
        const s = new Fake();
        const d = new Driver(flow, { runId: 'r1', scheduler: s, createTask: (c) => c, predicates: new Map(), workerTypes: [...WORKER_TYPES, 'SplitWorker', 'WeighWorker', 'PublishWorker', 'ReviewWorker'], groups: ['gpu', 'api'], joinPolicy: POLICIES['live-token'], now: () => 1, ...extra });
        d.start({ confidence: 0.9, text: 'a bb ccc' });
        s.settle('r1:ingest:-:0', { confidence: 0.9, items: [{ word: 'a', confidence: 0.1 }, { word: 'bb', confidence: 0.2 }] });
        return s.added;
      });
      ok(runs[0]!.length >= 3, `${name}: the run dispatched past the entry (${runs[0]!.length} tasks)`);
      equal(runs[1], runs[0], `${name}: identical dispatches with nodeTypes registered — no key, no envelope, no change`);
    }
  });
});

suite('W59 — what a type declares for its nodes: the retry merge and the groups, at construction and at dispatch', (test) => {
  const [, drive] = SHAPES[0]!;
  test('construction: a type declaring a malformed retryPolicy is FD-V30, naming the type, before anything is queued', () => {
    const s = new Fake();
    // **The malformed type is SECOND, behind a well-formed one** — the adequacy reader (q07): with
    // every construction fixture registering one type, the driver's loop over `nodeTypes` narrowed
    // to its first entry cost zero. The bound is a claim now.
    const bad: NodeTypes = { Ranker: { worker: 'y' }, Scorer: { worker: 'x', retryPolicy: { maxRetries: '1', backoffMs: 0 } as unknown as RetryPolicy } };
    throws(() => drive({ type: 'Scorer' }, s, { nodeTypes: bad }), 'FD-V30', 'refused under the same rule id a node`s policy is');
    let err: unknown;
    try { drive({ type: 'Scorer' }, new Fake(), { nodeTypes: bad }); } catch (e) { err = e; }
    ok(err instanceof InvalidDefinition && err.rules.includes('FD-V30') && err.message.includes('"Scorer"'), `names the type: ${(err as Error)?.message}`);
    equal(s.added, [], 'and nothing was queued');
  });
  test('construction: a type declaring a group the registry does not is FD-V31, naming the type and the id', () => {
    const s = new Fake();
    const bad: NodeTypes = { Ranker: { worker: 'y' }, Scorer: { worker: 'x', groups: ['gpu', 'nope'] } };
    let err: unknown;
    try { drive({ type: 'Scorer' }, s, { nodeTypes: bad }); } catch (e) { err = e; }
    ok(err instanceof InvalidDefinition && err.rules.includes('FD-V31') && err.message.includes('"Scorer"') && err.message.includes('"nope"'), `FD-V31 naming both: ${(err as Error)?.message}`);
    equal(s.added, [], 'and nothing was queued');
    // The strict reading, one level up: `groups` OMITTED on the driver is EMPTY, so a type declaring
    // any group is refused against it.
    throws(() => drive({ type: 'Scorer' }, new Fake(), { nodeTypes: bad, groups: undefined }), 'FD-V31', 'omitted groups means the type`s group is unknown');
  });
  test('construction: a document naming a type the registry lacks is FD-V32 through the validator — and nodeTypes omitted means EMPTY', () => {
    throws(() => drive({ type: 'Nope' }, new Fake(), {}), 'FD-V32', 'an unknown type');
    throws(() => drive({ type: 'Scorer' }, new Fake(), { nodeTypes: undefined }), 'FD-V32', 'nodeTypes omitted: every type is unknown');
    throws(() => drive({ type: 'Scorer', settings: { factor: 'ten' } }, new Fake(), {}), 'FD-V33', 'settings the type`s validator refuses');
    throws(() => drive({ type: 'Scorer', workerType: 'ScoreWorker' }, new Fake(), {}), 'FD-V34', 'type beside workerType');
  });
  test('construction: a type whose settings entry is NOT A FUNCTION is FD-V33, naming the type — the P18 shape refused at the registry, not blamed on the document', () => {
    // The adequacy reader's note: `settings: { factor: 'number' }` — the schema an author reaches
    // for — used to be refused on every NODE of the type as *the validator THREW … is not a
    // function*, a message blaming the document for the registry's shape. ADR 0002 rule 3's answer
    // is a construction check naming the type; second in the map, so the loop's bound is claimed.
    const s = new Fake();
    const bad: NodeTypes = { Ranker: { worker: 'y' }, Scorer: { worker: 'x', settings: { factor: 'number' } as unknown as NodeType['settings'] } };
    let err: unknown;
    try { drive({ type: 'Scorer' }, s, { nodeTypes: bad }); } catch (e) { err = e; }
    ok(err instanceof InvalidDefinition && err.rules.includes('FD-V33') && err.message.includes('"Scorer"') && err.message.includes('not a function'),
      `FD-V33 naming the type and the shape: ${(err as Error)?.message}`);
    equal(s.added, [], 'and nothing was queued');
  });
  test('construction: nodeTypes as a Map is read exactly as an object is', () => {
    const s = new Fake();
    const { subject } = drive({ type: 'Scorer', settings: SETTINGS_A }, s, { nodeTypes: new Map(Object.entries(TYPES)) });
    equal((s.byId(subject[0]!).payload as { settings: unknown }).settings, SETTINGS_A, 'dispatched with the envelope from a Map-shaped registry');
    equal(s.byId(subject[0]!).retryPolicy, TYPE_POLICY, 'and the type`s policy read from it');
  });
});
