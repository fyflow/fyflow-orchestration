/**
 * **What the driver hands `createTask` for a typed node that declares a TRANSFORM — the envelope's
 * THIRD key, present only when declared, and `input` still the value RECEIVED** — `FD-C6` in
 * `spec/flow-definition.md` section 3 (v0.18), ladder L2,
 * [ADR 0051](../../doc/decisions/0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md),
 * [W61](../../doc/work-items/w61-what-a-transform-is.md).
 *
 * Every claim is asserted on the FOUR shapes `FD-C5` enumerates (obligation (a), v0.17), and the
 * shape list is compared to the transformed corpus flow rather than written again. **The transform
 * is INVISIBLE here, by design** — P17 prediction 3: the driver dispatches inside a listener with
 * no `await`, so `input` reaches `createTask` UNTRANSFORMED and the type's worker wrapper is what
 * evaluates it. This suite asserts that invisibility as a PAIR against the untyped node's whole
 * payload; a driver that evaluated would fail here, and one that forwarded nothing would fail on
 * the third key.
 *
 * Every expected value is copied from the definition under test, never from the run.
 */
import { equal, ok, readText, ROOT, suite, throws } from '../harness.ts';
import { Driver, InvalidDefinition } from '../../src/driver/driver.ts';
import { POLICIES } from '../../src/fold/policies.ts';
import { shapesOf, transformingNode } from '../definition/task-shapes.ts';
import { PATH_LANGUAGE } from '../scheduler/fake-language.ts';
import type { FlowDefinition, LanguageAdapter, Languages, NodeType } from '../../src/definition/types.ts';

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

const TYPES: Readonly<Record<string, NodeType>> = {
  Scorer: { worker: 'test://Scorer', settings: (s) => (s.factor === undefined || typeof s.factor === 'number' ? null : 'factor must be a number') },
  Ranker: { worker: 'test://Ranker' },
};
const LANGS: Readonly<Record<string, LanguageAdapter>> = { path: PATH_LANGUAGE };
const WORKER_TYPES = ['IngestWorker', 'ScoreWorker', 'Scorer', 'Ranker'];
const BASE = { predicates: new Map(), workerTypes: WORKER_TYPES, groups: ['gpu', 'api'], nodeTypes: TYPES, languages: LANGS, now: () => 1 } as const;
type Opts = Partial<ConstructorParameters<typeof Driver>[1]>;
const SETTINGS: { factor: number } = { factor: 10 };
/** The declared transform, as the definition literal — its `expr` is a path INTO the input, so a driver that evaluated would hand a different value. */
const T = { lang: 'path', expr: 'confidence' };

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
    s.settle('r1:ingest:-:0', { confidence: 0.9, items: [{ confidence: 0.1 }, { confidence: 0.2 }, { confidence: 0.3 }] });
    return { subject: ['r1:rank:0:0', 'r1:rank:1:0', 'r1:rank:2:0'], control: 'r1:ingest:-:0' };
  }],
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
    s.settle('r1:scoreA:0:0', { score: 1, confidence: 0.4 });
    s.settle('r1:scoreB:1:0', { score: 2, confidence: 0.6 });
    return { subject: ['r1:publish:-:0'], control: 'r1:scoreA:0:0' };
  }],
];

suite('W61 — a typed node`s envelope carries its declared transform as a THIRD key, only when declared — FD-C6 at L2, on every shape', (test) => {
  for (const [shape, drive] of SHAPES) {
    test(`${shape}: the envelope is exactly { settings, input, transform }, transform is the declaration's own copy, and input is UNTRANSFORMED — the pair against the bare node`, () => {
      const typed = new Fake();
      const bare = new Fake();
      const declared = { ...T };
      const t = drive({ type: 'Scorer', settings: SETTINGS, transform: declared }, typed, {});
      const b = drive({ workerType: 'ScoreWorker' }, bare, {});
      equal(t.subject, b.subject, 'the same task ids are minted either way — a transform changes no id');
      for (const id of t.subject) {
        const c = typed.byId(id);
        const env = c.payload as Record<string, unknown>;
        equal(Object.keys(env).sort(), ['input', 'settings', 'transform'], `${id}: the envelope has exactly the three keys`);
        equal(env.transform, T, `${id}: transform is the declared { lang, expr }`);
        ok(env.transform !== declared, `${id}: as its own copy, not the declaration object`);
        equal(env.settings, SETTINGS, `${id}: settings as declared`);
        // **P17 prediction 3, asserted**: what `createTask` receives as `input` is the value the
        // untyped node received, WHOLE — the path `confidence` has not been read. A driver that
        // evaluated would hand 0.9 (or an item's confidence) here and fail this line.
        equal(env.input, bare.byId(id).payload, `${id}: input is what the untyped node received — untransformed at L2`);
        ok(typeof env.input === 'object' && env.input !== null, `${id}: and it is the whole object, not the path's value`);
        equal(Object.keys(c).sort(), ['id', 'optional', 'payload', 'workerType'], `${id}: nothing else rode along`);
      }
      equal(typed.byId(t.control).payload, bare.byId(b.control).payload, 'the node declaring nothing received exactly what it received with no languages registered');
      // The declaration survives a write into the dispatched copy.
      (typed.byId(t.subject[0]!).payload as { transform: { expr: string } }).transform.expr = 'mutated';
      equal(declared.expr, T.expr, 'a write into a dispatched copy does not reach the definition');
    });

    test(`${shape}: a typed node declaring NO transform is dispatched with the two-key envelope it had at v0.17 — no third key, no undefined`, () => {
      const s = new Fake();
      const { subject } = drive({ type: 'Scorer', settings: SETTINGS }, s, {});
      for (const id of subject) {
        const env = s.byId(id).payload as Record<string, unknown>;
        equal(Object.keys(env).sort(), ['input', 'settings'], `${id}: exactly two keys`);
        ok(!('transform' in env), `${id}: the key is ABSENT, not present holding undefined`);
      }
    });

    test(`${shape}: with a needs declared, the transform rides beside the composed input — FD-C1 inside FD-C6, and the input is still the composed object whole`, () => {
      const s = new Fake();
      const { subject } = drive({ type: 'Scorer', needs: { own: '.', run: 'ingest' }, transform: { lang: 'path', expr: 'run.confidence' } }, s, {});
      for (const id of subject) {
        const env = s.byId(id).payload as { input: Record<string, unknown>; transform: unknown };
        equal(Object.keys(env.input).sort(), ['own', 'run'], `${id}: input has exactly the keys needs describes — not the path's value`);
        equal(env.transform, { lang: 'path', expr: 'run.confidence' }, `${id}: and the transform is the declared one`);
      }
    });

    test(`${shape}: construction — FD-V35, FD-V36 and FD-V37 each refuse through the driver, and languages OMITTED means EMPTY`, () => {
      throws(() => drive({ type: 'Scorer', transform: { lang: 'jsonata', expr: 'confidence' } }, new Fake(), {}), 'FD-V35', 'an unregistered language');
      throws(() => drive({ type: 'Scorer', transform: T }, new Fake(), { languages: undefined }), 'FD-V35', 'languages omitted: every language is unknown');
      throws(() => drive({ type: 'Scorer', transform: { lang: 'path', expr: '$sum(' } }, new Fake(), {}), 'FD-V36', 'an expression the language refuses');
      throws(() => drive({ workerType: 'ScoreWorker', transform: T }, new Fake(), {}), 'FD-V37', 'a transform on an untyped node');
      throws(() => drive({ type: 'Scorer', transform: { lang: 'path' } }, new Fake(), {}), 'FD-V37', 'a transform that is not { lang, expr }');
    });
  }

  test('construction: a language whose compile is NOT A FUNCTION is FD-V36 naming the LANGUAGE — the registry`s mistake, second in the map', () => {
    const [, drive] = SHAPES[0]!;
    const s = new Fake();
    const bad: Languages = { path: PATH_LANGUAGE, schema: { compile: { grammar: 'paths' } as unknown as LanguageAdapter['compile'], worker: 'x' } };
    let err: unknown;
    try { drive({ type: 'Scorer', transform: T }, s, { languages: bad }); } catch (e) { err = e; }
    ok(err instanceof InvalidDefinition && err.rules.includes('FD-V36') && err.message.includes('"schema"') && err.message.includes('no compile function'),
      `FD-V36 naming the language: ${(err as Error)?.message}`);
    equal(s.added, [], 'and nothing was queued');
  });

  test('construction: languages as a Map is read exactly as an object is', () => {
    const [, drive] = SHAPES[0]!;
    const s = new Fake();
    const { subject } = drive({ type: 'Scorer', transform: T }, s, { languages: new Map(Object.entries(LANGS)) });
    equal((s.byId(subject[0]!).payload as { transform: unknown }).transform, T, 'dispatched with the third key from a Map-shaped registry');
  });

  test('SHAPES here is the set of shapes the transformed corpus flow`s transforming nodes take, both ways', async () => {
    const flow = JSON.parse(await readText(`${ROOT}spec/examples/valid/transformed.flow.json`)) as FlowDefinition;
    equal([...new Set(shapesOf(flow, transformingNode))].sort(), SHAPES.map(([label]) => label).sort(), 'the shapes the corpus flow carries are the shapes every case here runs on');
  });
});

suite('W61 — the untransformed envelope is byte-identical with and without languages registered — P17 decision 8', (test) => {
  const drive = (flow: FlowDefinition, extra: Opts, items: unknown, then: string[] = []) => {
    const s = new Fake();
    const d = new Driver(flow, { runId: 'r1', scheduler: s, createTask: (c) => c, predicates: new Map(), workerTypes: [...WORKER_TYPES, 'SplitWorker', 'WeighWorker', 'PublishWorker', 'ReviewWorker'], groups: ['gpu', 'api'], nodeTypes: TYPES, joinPolicy: POLICIES['live-token'], now: () => 1, ...extra });
    d.start({ confidence: 0.9, text: 'a bb ccc' });
    s.settle('r1:ingest:-:0', { confidence: 0.9, items, document: { id: 1 } });
    for (const id of then) s.settle(id, { score: 1 });
    return s.added;
  };
  test('the two P12 flows and the typed corpus flow dispatch identically with and without `languages` registered — a registry gaining a set changes nothing for a document that names it nowhere', async () => {
    for (const name of ['map-with-context', 'map-over-region-output', 'typed']) {
      const flow = JSON.parse(await readText(`${ROOT}spec/examples/valid/${name}.flow.json`)) as FlowDefinition;
      const items = name === 'typed' ? ['a', 'b', 'c'] : [{ word: 'a', confidence: 0.1 }, { word: 'bb', confidence: 0.2 }];
      const EXTRAS: Opts[] = [{}, { languages: LANGS }];
      equal(EXTRAS.map((e) => Object.keys(e)), [[], ['languages']], 'the pair differs in `languages` alone — the difference is a claim (the adequacy reader, m40)');
      const runs = EXTRAS.map((extra) => drive(flow, extra, items));
      ok(runs[0]!.length >= 3, `${name}: the run dispatched past the entry (${runs[0]!.length} tasks)`);
      equal(runs[1], runs[0], `${name}: identical dispatches with languages registered — no key, no change`);
      ok(runs[1]!.every((t) => !('transform' in (t.payload as Record<string, unknown> ?? {}))), `${name}: and no envelope carries a third key`);
    }
  });
  test('the transformed corpus flow: the third key appears on EXACTLY the nodes that declare one, as declared, and nowhere else', async () => {
    const flow = JSON.parse(await readText(`${ROOT}spec/examples/valid/transformed.flow.json`)) as FlowDefinition;
    // Settle both map instances and both fanout branches, so the run reaches the join's successor
    // and all four transforming nodes are dispatched: ingest, rank x2, scoreA, scoreB, publish.
    const added = drive(flow, { languages: LANGS }, [{ confidence: 0.1 }, { confidence: 0.2 }], ['r1:rank:0:0', 'r1:rank:1:0', 'r1:scoreA:0:0', 'r1:scoreB:1:0']);
    const declared = new Map(flow.nodes.filter(transformingNode).map((n) => [n.id, (n as { transform: unknown }).transform]));
    equal(added.length, 6, `dispatched through the map and the fanout to the join's successor (${added.map((t) => t.id).join(', ')})`);
    for (const t of added) {
      const nodeId = (t.id as string).split(':')[1]!;
      const env = t.payload as Record<string, unknown>;
      if (declared.has(nodeId)) equal(env.transform, declared.get(nodeId), `${t.id}: carries the declared transform`);
      else ok(!('transform' in env), `${t.id}: carries none`);
    }
    equal([...new Set(added.filter((t) => 'transform' in (t.payload as Record<string, unknown>)).map((t) => (t.id as string).split(':')[1]))].sort(), [...declared.keys()].sort(), 'the set of transforming nodes dispatched is the set the document declares');
  });
});
