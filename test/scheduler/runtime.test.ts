/**
 * **`createRuntime` — a registry DOCUMENT and the consumer's code become pools, groups and a
 * `Driver`** — [P18](../../doc/plans/p18-a-flow-and-its-runtime-from-documents-alone.md) decisions
 * 4, 7-11, 13 and 14, [W66](../../doc/work-items/w66-the-runtime-entry.md), ladder L1.
 *
 * **Every expected value comes from the plan's decisions and from P18's facts re-run at W66's
 * declaration step (`dev-dist/w66/facts-{node,deno}.log`), never from this module's output.** The
 * group-member list is the one the maintainer decided FROM those measurements — `canRun`, `onStart`
 * and `onFinish` because the scheduler calls them (omitting the second THROWS and the third leaves
 * a task running for ever), `getMetrics`, `id` and `type` because the interface requires them — and
 * it is instantiated here member by member, because the rule ENUMERATES its values
 * (`doc/workflow.md` section 5 rule 8 obligation (a) at v0.17).
 */
import { AssertionError, collected, deepEqual, equal, listDir, ok, readText, ROOT, suite, throws } from '../harness.ts';
import {
  BUILT_IN_GROUP_FACTORIES, createRuntime, GROUP_MEMBERS, GroupNotBuildable, GroupUnusable,
  LimitKeyMissing, RunIdInUse, RuntimeError,
} from '../../src/scheduler/runtime.ts';
import type { RuntimeRegistry, StartOptions } from '../../src/scheduler/runtime.ts';
import { bootstrap, ENVELOPE_WORKER_URL } from '../../src/scheduler/bootstrap.ts';
import { BUILT_IN_GROUP_TYPES, DerivationRefused, GateTypeRefused, GroupTypeMissing, NameCollision, NameMissing, WorkerMissing } from '../../src/definition/registry.ts';
import type { GateType } from '../../src/definition/types.ts';
import { PATH_LANGUAGE } from './fake-language.ts';
import { arrivalCount, liveTokenRequiringArrival } from '../../src/fold/policies.ts';
import { canonical, describeFindings } from '../../src/definition/schema.ts';
import { BoundaryRefused, Driver, InvalidDefinition, ResumeRefused, RunControlRefused } from '../../src/driver/driver.ts';
import { validateDefinition, violatedRules } from '../../src/definition/validate.ts';
import { CORPUS_LANGUAGES, corpusRegistry, type CorpusRegistryDocument } from '../definition/corpus-types.ts';
import type { Checkpoint } from '../../src/driver/driver.ts';
import { liveToken } from '../../src/fold/policies.ts';
import type { ResourceGroup } from 'fyflow-scheduler';
import { FyflowTask, KeyedRateLimitGroup } from 'fyflow-scheduler';
import { emptyState, fold, isTerminal, step } from '../../src/fold/run-state.ts';
import type { FoldInput, RunState } from '../../src/fold/run-state.ts';
import type { Finding, FlowDefinition, LanguageAdapter, NodeTypeDefinition, RegistryCode, RegistryDocument } from '../../src/definition/types.ts';
import { BUILT_IN_NODE_TYPES } from '../../src/definition/validate.ts';
/**
 * **`BUILT_INS` is ADDED to the pool and type expectations below rather than written into them** —
 * v0.28, [W109](../../doc/work-items/w109-a-node-that-only-transforms.md): `nodeTypesOf` merges the
 * library's own node types, so every registry holds them and every type's default pool instance is
 * built, which these sets see. **The built-in's PRESENCE is not what they claim** — their claim is
 * *one pool per DECLARED type, nothing added and nothing dropped* — so deriving the addition keeps
 * them about that, and the literal `'Transform'` is asserted where the merge IS the claim, in
 * `test/definition/node-type.test.ts`'s W109 suite.
 */
const BUILT_INS = Object.keys(BUILT_IN_NODE_TYPES);
/**
 * **The pools a CONSUMER's registry asked for** — every pool whose config names an inner worker. A
 * built-in node type names none (ADR 0075), so its pool config carries `transformOnly: true` and no
 * `worker`; the claims below are about what a DOCUMENT declares, and this is what keeps them about
 * that rather than about how many types the library happens to ship. The built-in's own pool is the
 * subject of the W109 cases at the end of this file.
 */
const consumerPools = <T extends { options: { config?: unknown } }>(pools: readonly T[]): T[] =>
  pools.filter((p) => (p.options.config as { worker?: unknown } | undefined)?.worker !== undefined);


/** A group object with every member `GROUP_MEMBERS` names — a PLAIN object, deliberately: `EventTarget` is not required (fact 2, measured). */
const goodGroup = (id: string): Record<string, unknown> => ({
  id, type: 'test',
  canRun: () => true, onStart: () => {}, onFinish: () => {},
  getMetrics: () => ({ limit: 1, running: 0, available: 1, utilization: 0 }),
});

/** The seams: every pool and the scheduler recorded rather than built, so L1 needs no worker file. */
function seams() {
  const pools: { url: string; options: Record<string, unknown> }[] = [];
  const built: { pools: Record<string, unknown>; groups: Record<string, unknown> }[] = [];
  const added: Record<string, unknown>[] = [];
  const createPool = (url: string, options: unknown) => {
    const rec = { url, options: options as Record<string, unknown> };
    pools.push(rec);
    return rec as never;
  };
  /** The listeners the driver attaches, so a case can SETTLE a dispatched task and drive the run on. */
  const listeners = new Map<string, ((e: { detail: unknown }) => void)[]>();
  const settle = (id: string, result: unknown) => {
    const detail = { id, state: 'done', result, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
    for (const fn of listeners.get('task.completed') ?? []) fn({ detail });
  };
  /**
   * **A settlement that is NOT `done`** — W77, which needs the outcomes `settle` cannot produce.
   * The driver keys on the terminal STATE and not on the event name (ADR 0007 rule 2), and the
   * scheduler dispatches `task.failed` AND `task.user_action` with the same object for a
   * non-optional task out of retries — so a `user_action` case emits the pair, exactly as
   * `core/FyflowScheduler.ts` does, rather than the one event a reader would guess.
   */
  const emitSettlement = (id: string, state: 'failed' | 'user_action', error: unknown = 'boom') => {
    const detail = { id, state, result: null, error, attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1 };
    const names = state === 'user_action' ? ['task.failed', 'task.user_action'] : ['task.failed'];
    for (const name of names) for (const fn of listeners.get(name) ?? []) fn({ detail });
  };
  const createScheduler = (p: Record<string, unknown>, g: Record<string, unknown>) => {
    built.push({ pools: p, groups: g });
    return {
      workerPools: p, groups: g,
      addTask(t: unknown) { added.push(t as Record<string, unknown>); },
      addEventListener(type: string, fn: (e: { detail: unknown }) => void) { listeners.set(type, [...(listeners.get(type) ?? []), fn]); },
      shutdown() { return Promise.resolve(); },
    } as never;
  };
  /** Any scheduler event, to every listener on its name — W187's `task.message` and `task.progress`, whose details are not tasks. */
  const emit = (type: string, detail: unknown) => { for (const fn of listeners.get(type) ?? []) fn({ detail }); };
  return { pools, built, added, settle, emitSettlement, emit, createPool, createScheduler };
}

/** The minimum document: one worker, one type, one named instance of it, one group the type holds. */
const DOC: RegistryDocument = {
  workers: { w: { url: 'https://example.test/w.js', settingsSchema: { type: 'object', properties: { factor: { type: 'number' } } } } },
  groups: { gpu: { type: 'ConcurrentLimitGroup', config: { limit: 2 } } },
  nodeTypes: { Scorer: { worker: 'w', inline: true, config: { role: 'typed' }, pool: { maxThreads: 2 }, groups: ['gpu'] } },
  pools: { 'scorer-fast': { type: 'Scorer', config: { role: 'typed', fast: true } } },
  predicates: [],
  languages: [],
};
/** The document's sections are readonly, so an edited clone is typed loosely — W65's registry suite's shape. */
type Loose = Record<string, Record<string, Record<string, unknown>>> & Record<string, unknown>;
const edited = (f: (d: Loose) => void): RegistryDocument => {
  const d = JSON.parse(JSON.stringify(DOC)) as Loose;
  f(d);
  return d as unknown as RegistryDocument;
};
const FLOW: FlowDefinition = {
  flowId: 'f', version: 1, entry: 'a',
  nodes: [
    { id: 'a', kind: 'task', type: 'Scorer', settings: { factor: 1 }, edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

suite('W66 — createRuntime builds from a document: pools, groups and the driver`s registry', (test) => {
  test('the minimum document: one pool per instance keyed as declared, the group created, nothing else', () => {
    const s = seams();
    const r = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    equal(Object.keys(r.pools).sort(), ['Scorer', 'scorer-fast', ...BUILT_INS].sort(), 'the type`s default instance under its own name, plus the named one and the built-ins');
    equal(Object.keys(r.groups), ['gpu'], 'one group object, keyed as the document declares it');
    equal(consumerPools(s.pools).length, 2, 'two pools built from the document');
    ok(s.pools.every((p) => p.url === ENVELOPE_WORKER_URL), 'every pool loads the package`s envelope worker, not the type`s own');
    equal(s.built.length, 1, 'one scheduler, over those pools and groups');
    equal(Object.keys(s.built[0]!.pools).sort(), ['Scorer', 'scorer-fast', ...BUILT_INS].sort(), 'the scheduler holds them by key');
  });

  test('fact 3 on the runtime`s own pools: two instances over ONE worker url are two pools, with different derived configs', () => {
    const s = seams();
    createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const configs = consumerPools(s.pools).map((p) => (p.options.config as { worker: string; config: unknown }));
    equal([...new Set(configs.map((c) => c.worker))], ['https://example.test/w.js'], 'one worker url');
    equal(configs.map((c) => JSON.stringify(c.config)).sort(),
      [JSON.stringify({ role: 'typed' }), JSON.stringify({ role: 'typed', fast: true })].sort(),
      'and two derived configs — the type`s default and the instance`s override merged over it');
  });

  test('a default instance`s options are exactly what `bootstrap` builds for the same registry — the runtime adds no option of its own', () => {
    const viaRuntime = seams();
    createRuntime(DOC, {}, { createPool: viaRuntime.createPool, createScheduler: viaRuntime.createScheduler });
    const viaBootstrap: { url: string; options: unknown }[] = [];
    bootstrap(
      { workers: { w: { url: 'https://example.test/w.js' } }, nodeTypes: { Scorer: DOC.nodeTypes!.Scorer! }, pools: DOC.pools },
      { gpu: goodGroup('gpu') as unknown as ResourceGroup },
      { createPool: (url, options) => { viaBootstrap.push({ url, options }); return {} as never; } },
    );
    equal(viaRuntime.pools.map((p) => p.options), viaBootstrap.map((p) => p.options), 'option for option, both instances');
  });

  test('and the SECOND observer of that claim: a type declared as P18 fact 5 captured it builds fact 5`s exact options (rule 8, c2)', () => {
    // The test above compares two calls, so re-sourcing either side to the other leaves it green —
    // a sensor corroborating itself (obligation (c)'s limit). This compares the runtime's output to
    // the MEASUREMENT instead: fact 5's capture of what `bootstrap` handed `WorkerManager` at v0.17,
    // re-run at W65 in both runtimes, as canonical JSON with the worker url elided.
    const s = seams();
    createRuntime({
      workers: { flow: { url: 'https://example.test/flow.js' } },
      nodeTypes: { Echo: { worker: 'flow', inline: false, config: { role: 'echo' }, pool: { maxThreads: 2, idleTimeout: 0 }, retryPolicy: { maxRetries: 1, backoffMs: 0 } } },
    }, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    equal(canonical({ ...s.pools[0]!.options, config: { ...(s.pools[0]!.options.config as object), worker: '<url>' } }),
      '{"config":{"config":{"role":"echo"},"worker":"<url>"},"idleTimeout":0,"inline":false,"maxThreads":2}',
      'P18 fact 5`s Echo capture, option for option, through the runtime');
    ok(!('groups' in s.pools[0]!.options), 'and a groups key is ABSENT where the type declares none — fact 5`s shape, not an empty array');
  });

  test('decision 14: `registry` is the driver`s shape and a Driver built BY HAND from it runs the same flow — the claim, with a driver in it', () => {
    const s = seams();
    const r = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    equal(Object.keys(r.registry).sort(), ['groups', 'languages', 'nodeTypes', 'pools', 'predicates', 'workers'], 'the six sets, and nothing else');
    equal(r.registry.groups, ['gpu'], 'groups are the KEYS the scheduler resolves by');
    // **The claim, exercised** — W66's conformity reader (finding 4): this test asserted the SHAPE
    // and built no driver, and the shape it asserted refused a valid flow, because `predicates` held
    // the document's NAMES where a driver wants the functions keyed by name. Spread whole, as a
    // consumer would, with a predicate a flow actually routes on.
    const withPredicate = createRuntime(edited((d) => { (d as Record<string, unknown>).predicates = ['isHigh']; }),
      { predicates: { isHigh: () => true } }, { createPool: s.createPool, createScheduler: s.createScheduler });
    const guarded = {
      flowId: 'g', version: 1, entry: 'a',
      nodes: [
        { id: 'a', kind: 'task', type: 'Scorer', settings: { factor: 1 }, edges: [{ when: { predicate: 'isHigh' }, to: 'done' }, { to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const fake = seams();
    const byHand = new Driver(guarded, {
      runId: 'by-hand',
      scheduler: fake.createScheduler({}, {}),
      ...withPredicate.registry,
      joinPolicy: liveToken,
    });
    byHand.start({ x: 1 });
    equal(fake.added.map((t) => t.id), ['by-hand:a:-:0'], 'a Driver built by hand from runtime.registry validates AND dispatches the flow');
    equal([...(withPredicate.registry.predicates as ReadonlyMap<string, unknown>).keys()], ['isHigh'], 'predicates are the FUNCTIONS, keyed by the name the document declared');
    equal(Object.keys(r.registry.nodeTypes as object).sort(), ['Scorer'], 'the types — the built-ins are merged at every READ and stored in no registry (ADR 0075 rule 5)');
    equal(Object.keys(r.registry.pools as object), ['scorer-fast'], 'the NAMED instances only — a type`s default needs no entry, its key being the type`s name');
    ok((r.registry.workers as Record<string, { url: string }>).w!.url === 'https://example.test/w.js', 'the workers, with their urls resolved');
  });
});

suite('W66 — decision 7: a relative worker url resolves against the consumer`s BASE, and without one is refused', (test) => {
  test('a relative url with a base is resolved before any pool is built — the pool config carries the absolute url', () => {
    const s = seams();
    const r = createRuntime(edited((d) => { d.workers.w!.url = './workers/w.js'; }), {},
      { base: 'https://example.test/app/main.js', createPool: s.createPool, createScheduler: s.createScheduler });
    equal((r.registry.workers as Record<string, { url: string }>).w!.url, 'https://example.test/app/workers/w.js', 'resolved against the base');
    // **And ONLY the url changes** — the adequacy reader (F9): a resolver that rebuilt the entry
    // dropped the worker's schemas, and `FD-V33` then accepted settings it exists to refuse, on the
    // one road `AGENTS.md` section 12 tells a consumer to take.
    const entry = (r.registry.workers as unknown as Record<string, Record<string, unknown>>).w!;
    const declared = (DOC.workers as unknown as Record<string, Record<string, unknown>>).w!;
    equal(Object.keys(entry).sort(), Object.keys(declared).sort(), 'the entry carries every key it declared');
    equal(entry.settingsSchema, declared.settingsSchema, 'its settingsSchema among them — the schema FD-V33 applies');
    ok(consumerPools(s.pools).every((p) => (p.options.config as { worker: string }).worker === 'https://example.test/app/workers/w.js'), 'and that is what every pool loads');
  });

  test('a relative url with NO base is a RuntimeError naming the worker and the fix — `new URL` on its own throws (fact 8)', () => {
    const s = seams();
    let err: unknown;
    try { createRuntime(edited((d) => { d.workers.w!.url = './workers/w.js'; }), {}, { createPool: s.createPool, createScheduler: s.createScheduler }); } catch (e) { err = e; }
    ok(err instanceof RuntimeError && err.at === 'w', `a RuntimeError naming the worker: ${(err as Error)?.message}`);
    ok((err as Error).message.includes('base: import.meta.url'), `and naming the fix: ${(err as Error).message}`);
    equal(s.pools, [], 'and nothing was built');
  });

  test('an absolute url needs no base, and a data: url is absolute too', () => {
    for (const url of ['https://example.test/w.js', 'data:text/javascript,export default class W {}']) {
      const s = seams();
      const r = createRuntime(edited((d) => { d.workers.w!.url = url; }), {}, { createPool: s.createPool, createScheduler: s.createScheduler });
      equal((r.registry.workers as Record<string, { url: string }>).w!.url, url, `${url.slice(0, 24)}: carried as declared`);
    }
  });
});

suite('W66 — decision 4: the group factories, and what a created group is held to', (test) => {
  test('the three built-in FACTORIES are exactly the three built-in group TYPES, both ways — two halves of one list', () => {
    equal(Object.keys(BUILT_IN_GROUP_FACTORIES).sort(), Object.keys(BUILT_IN_GROUP_TYPES).sort(),
      'every type with a schema has a factory and every factory a schema');
  });

  test('each built-in is constructed by its OWN constructor, and the KEY is the id (fact 2, ADR 0049 fact 2)', () => {
    const s = seams();
    const r = createRuntime({
      groups: {
        c: { type: 'ConcurrentLimitGroup', config: { limit: 3 } },
        rl: { type: 'RateLimitGroup', config: { windows: [{ limit: 2, windowMs: 1000 }] } },
        k: { type: 'KeyedRateLimitGroup', config: { windows: [{ limit: 2, windowMs: 1000 }] } },
      },
      workers: { w: { url: 'https://example.test/w.js' } },
      nodeTypes: { T: { worker: 'w', groups: ['c', 'rl', 'k'] } },
    }, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    equal(Object.keys(r.groups).sort(), ['c', 'k', 'rl'], 'three groups');
    for (const key of ['c', 'rl', 'k']) {
      equal((r.groups[key] as unknown as { id: string }).id, key, `${key}: the group's id is the document's KEY, not the type's name`);
    }
    equal((r.groups.k as unknown as { keyed?: boolean }).keyed, true, 'and only the keyed built-in is keyed');
    ok((r.groups.c as unknown as { keyed?: boolean }).keyed !== true, 'the concurrency group is not');
  });

  test('a group type whose create() is missing is refused by the RESOLVER, before this module asks for a factory', () => {
    const s = seams();
    const doc = edited((d) => { d.groups.gpu = { type: 'Custom', config: {} }; });
    const code: RegistryCode = { groupTypes: { Custom: { create: undefined as unknown as () => never } } };
    let err: unknown;
    try { createRuntime(doc, code, { createPool: s.createPool, createScheduler: s.createScheduler }); } catch (e) { err = e; }
    ok(err instanceof GroupTypeMissing && (err as Error).message.includes('create'), `GroupTypeMissing naming the shape: ${(err as Error)?.constructor?.name}`);
    equal(s.pools, [], 'and nothing was built');
  });

  test('`GroupNotBuildable` is the guard for the two halves DISAGREEING, and it has no live case — stated rather than left to be inferred', () => {
    ok(Object.getPrototypeOf(GroupNotBuildable.prototype) === RuntimeError.prototype, 'a RuntimeError, so a consumer catches it with the rest');
    equal(Object.keys(BUILT_IN_GROUP_TYPES).filter((n) => !(n in BUILT_IN_GROUP_FACTORIES)), [],
      'no built-in type lacks a factory today, so nothing reaches the guard — the both-ways test above is what keeps that true');
  });

  test('EVERY member the list names, one at a time: a factory omitting it is GroupUnusable naming that member — the rule`s own enumeration', () => {
    ok(GROUP_MEMBERS.length === 6, 'six members: what the scheduler CALLS and what the interface requires');
    for (const m of GROUP_MEMBERS) {
      const s = seams();
      const code: RegistryCode = { groupTypes: { Custom: { create: (_c: unknown, key: string) => { const g = goodGroup(key); delete g[m.name]; return g as never; } } } };
      let err: unknown;
      try { createRuntime(edited((d) => { d.groups.gpu = { type: 'Custom', config: {} }; }), code, { createPool: s.createPool, createScheduler: s.createScheduler }); } catch (e) { err = e; }
      ok(err instanceof GroupUnusable && err.at === 'gpu', `${m.name}: a GroupUnusable naming the group's key — got ${(err as Error)?.constructor?.name}`);
      ok((err as Error).message.includes(m.name), `${m.name}: and naming the member: ${(err as Error).message}`);
      equal(s.pools, [], `${m.name}: and nothing was built`);
    }
  });

  test('a member of the WRONG KIND is refused as an absent one is — the list declares a kind and the check applies it (rule 8, a5)', () => {
    // The list says `canRun` is a FUNCTION and `id` a STRING. Present-but-wrong is the shape a
    // presence test cannot see, and nothing here supplied one until this fixture: a group carrying a
    // string where the scheduler will call a function throws on its first task exactly as an absent
    // one does, and a numeric `id` is a group a viewer cannot key.
    for (const [label, broken] of [
      ['canRun a string', { canRun: 'yes' }],
      ['onFinish an object', { onFinish: {} }],
      ['id a number', { id: 5 }],
      ['type null', { type: null }],
    ] as const) {
      const s = seams();
      const code: RegistryCode = { groupTypes: { Custom: { create: (_c: unknown, key: string) => ({ ...goodGroup(key), ...broken }) as never } } };
      let err: unknown;
      try { createRuntime(edited((d) => { d.groups.gpu = { type: 'Custom', config: {} }; }), code, { createPool: s.createPool, createScheduler: s.createScheduler }); } catch (e) { err = e; }
      const member = Object.keys(broken)[0]!;
      ok(err instanceof GroupUnusable && (err as Error).message.includes(member), `${label}: GroupUnusable naming ${member} — got ${(err as Error)?.message ?? 'nothing'}`);
      equal(s.pools, [], `${label}: and nothing was built`);
    }
  });

  test('the no-trip twin: a PLAIN object carrying all six is accepted — EventTarget is NOT required (measured)', () => {
    const s = seams();
    const code: RegistryCode = { groupTypes: { Custom: { create: (_c: unknown, key: string) => goodGroup(key) as never } } };
    const r = createRuntime(edited((d) => { d.groups.gpu = { type: 'Custom', config: {} }; }), code, { createPool: s.createPool, createScheduler: s.createScheduler });
    ok(!(r.groups.gpu instanceof EventTarget), 'the object is not an EventTarget');
    equal((r.groups.gpu as unknown as { id: string }).id, 'gpu', 'and it is what the scheduler holds, keyed by the document`s key');
    equal(consumerPools(s.pools).length, 2, 'and both of the document`s instances were built');
  });

  test('TWO members missing are named in ONE refusal, not just the first — ADR 0055 rule 1 (the conformity reader, finding 9)', () => {
    const s = seams();
    const code: RegistryCode = { groupTypes: { Custom: { create: (_c: unknown, key: string) => { const g = goodGroup(key); delete g.onStart; delete g.getMetrics; return g as never; } } } };
    let err: unknown;
    try { createRuntime(edited((d) => { d.groups.gpu = { type: 'Custom', config: {} }; }), code, { createPool: s.createPool, createScheduler: s.createScheduler }); } catch (e) { err = e; }
    const m = (err as Error)?.message ?? '';
    ok(err instanceof GroupUnusable && m.includes('onStart') && m.includes('getMetrics'), `both members named in one message: ${m}`);
    // And the WHY strings are what makes the message actionable — the rule's second half.
    ok(m.includes('unguarded') || m.includes('viewer'), `and the message says what happens without them: ${m}`);
  });

  test('a factory returning a NON-OBJECT is GroupUnusable saying so — the clause that is not about a member (the conformity reader, finding 10)', () => {
    for (const bad of [null, undefined, 5, 'a group'] as const) {
      const s = seams();
      const code: RegistryCode = { groupTypes: { Custom: { create: () => bad as never } } };
      let err: unknown;
      try { createRuntime(edited((d) => { d.groups.gpu = { type: 'Custom', config: {} }; }), code, { createPool: s.createPool, createScheduler: s.createScheduler }); } catch (e) { err = e; }
      ok(err instanceof GroupUnusable && (err as Error).message.includes('not an object'), `${JSON.stringify(bad) ?? 'undefined'}: refused as not an object — got ${(err as Error)?.message ?? 'nothing'}`);
      equal(s.pools, [], `${JSON.stringify(bad) ?? 'undefined'}: and nothing was built`);
    }
  });

  test('a factory that THROWS is GroupUnusable carrying its message, not the throw', () => {
    const s = seams();
    const code: RegistryCode = { groupTypes: { Custom: { create: () => { throw new Error('boom'); } } } };
    let err: unknown;
    try { createRuntime(edited((d) => { d.groups.gpu = { type: 'Custom', config: {} }; }), code, { createPool: s.createPool, createScheduler: s.createScheduler }); } catch (e) { err = e; }
    ok(err instanceof GroupUnusable && err.at === 'gpu' && (err as Error).message.includes('boom'), `GroupUnusable carrying the cause: ${(err as Error)?.message}`);
  });

  /**
   * **A group the DOCUMENT declares that no pool names is CREATED and registered — W67's
   * declaration step, stop-and-ask 1, and it REPLACES a case that asserted the opposite.**
   *
   * `bootstrap`'s direction two refuses a group OBJECT no pool names, and it is right to: a consumer
   * calling the helper passes the objects in, so one nothing names is registered and used by nothing.
   * **A document's `groups` is a different thing**: it is the SET a node's `workerGroups` may name,
   * which is what `FD-V31` validates against and what `runtime.registry.groups` carries to the
   * driver. A group named by a NODE and by no pool is the ordinary case — W58's group row IS it,
   * and it is why `examples/run-flow.ts` registered `gate` beside the helper's result for two plans.
   * A consumer holding only a runtime has no "beside", so the runtime splits the two sets and the
   * helper's own refusal stays exactly as it is (`test/scheduler/bootstrap.test.ts`, direction two).
   */
  test('a group the DOCUMENT declares that no pool names is CREATED, registered and reachable — the node-named case, which is FD-V31`s whole set', () => {
    const s = seams();
    const r = createRuntime(edited((d) => { d.groups.spare = { type: 'ConcurrentLimitGroup', config: { limit: 1 } }; }), {},
      { createPool: s.createPool, createScheduler: s.createScheduler });
    equal(Object.keys(r.groups).sort(), ['gpu', 'spare'], 'both groups were created');
    equal(r.registry.groups, ['gpu', 'spare'], 'and both reach the driver, which is what FD-V31 reads');
    equal(Object.keys(s.built[0]!.groups).sort(), ['gpu', 'spare'], 'and the SCHEDULER holds both — a task naming `spare` in workerGroups resolves');
    // The KEY is the group's identity (ADR 0049 fact 2), so the object carries the document's key.
    equal((r.groups.spare as unknown as { id: string }).id, 'spare', 'built with the document`s key as its id');
  });

  test('and direction ONE is untouched: a POOL naming a group the document does not declare is still refused', () => {
    const s = seams();
    let err: unknown;
    try { createRuntime(edited((d) => { d.nodeTypes.Scorer.groups = ['ghost']; }), {}, { createPool: s.createPool, createScheduler: s.createScheduler }); } catch (e) { err = e; }
    ok(err instanceof NameMissing, `refused by the resolver before anything is built: ${(err as Error)?.constructor?.name}`);
    equal(s.pools, [], 'and nothing was built');
  });

  test('a type naming a group the document does not declare is refused by NAME, before anything is created', () => {
    const s = seams();
    throws(() => createRuntime(edited((d) => { d.nodeTypes.Scorer.groups = ['gpu', 'nope']; }), {},
      { createPool: s.createPool, createScheduler: s.createScheduler }), 'nope', 'NameMissing from the resolver');
    let err: unknown;
    try { createRuntime(edited((d) => { d.nodeTypes.Scorer.groups = ['nope']; }), {}, { createPool: s.createPool, createScheduler: s.createScheduler }); } catch (e) { err = e; }
    ok(err instanceof NameMissing, `a NameMissing: ${(err as Error)?.constructor?.name}`);
  });
});

suite('W66 — decision 9 at the runtime: a resident group beside idleTimeout 0 is refused (P18 fact 6, re-run at W66)', (test) => {
  test('fact 6`s exact configuration — residentGroups against idleTimeout 0 — is refused at construction, naming the type', () => {
    const s = seams();
    let err: unknown;
    try {
      createRuntime(edited((d) => {
        d.nodeTypes.Scorer.pool = { maxThreads: 1, idleTimeout: 0, residentGroups: ['gpu'] };
      }), {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    } catch (e) { err = e; }
    ok(err instanceof DerivationRefused && err.at === 'Scorer', `a DerivationRefused naming the type: ${(err as Error)?.constructor?.name}`);
    ok((err as Error).message.includes('idleTimeout'), `and naming the option: ${(err as Error).message}`);
    equal(s.pools, [], 'and nothing was built — the deadlock fact 6 measured cannot be constructed');
  });

  test('the same resident group with a POSITIVE idleTimeout builds — the refusal is about the pair, not about residency', () => {
    const s = seams();
    const r = createRuntime(edited((d) => {
      d.nodeTypes.Scorer.pool = { maxThreads: 1, idleTimeout: 30000, residentGroups: ['gpu'] };
    }), {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    equal(r.pools.Scorer!.spec.residentGroups, ['gpu'], 'the derived spec carries it');
    equal((s.pools[0]!.options as { idleTimeout?: number }).idleTimeout, 30000, 'and the pool was built with the positive timeout');
  });
});

suite('W66 — decision 10: start() mints a run id, defaults the policy, and hands the driver this runtime`s registry', (test) => {
  test('a minted id is `r<n>`, inside ID-R2`s charset, and distinct across two runs of one runtime', () => {
    const s = seams();
    const r = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const { driver: a } = r.start(FLOW, { x: 1 });
    const { driver: b } = r.start(FLOW, { x: 2 });
    equal([a.runId, b.runId], ['r1', 'r2'], 'r<n> from the runtime`s own counter');
    for (const id of [a.runId, b.runId]) ok(/^[A-Za-z0-9_-]{1,64}$/.test(id), `${id}: inside ID-R2's charset`);
    ok(a.runId !== b.runId, 'and distinct — two runs on one runtime never share a run id');
  });

  test('a caller`s runId is taken as given, and the run is STARTED — the first task is dispatched under it', () => {
    const s = seams();
    const r = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const { driver: d } = r.start(FLOW, { x: 1 }, { runId: 'mine-1' });
    equal(d.runId, 'mine-1', 'the caller`s id');
    equal(s.added.map((t) => t.id), ['mine-1:a:-:0'], 'and start() started the run: one task, under that id');
    equal((s.added[0]!.workerType as string), 'Scorer', 'dispatched to the type`s default pool');
    equal(Object.keys(s.added[0]!.payload as object).sort(), ['input', 'settings'], 'with the envelope — FD-C5');
  });

  test('the driver is given this runtime`s registry: a flow naming a type the document lacks is FD-V32 at start', () => {
    const s = seams();
    const r = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const bad = { ...FLOW, nodes: [{ id: 'a', kind: 'task', type: 'Nope', edges: [{ to: 'done' }] }, FLOW.nodes[1]!] } as unknown as FlowDefinition;
    throws(() => r.start(bad, {}), 'FD-V32', 'the document`s types are what the driver validates against');
  });

  test('decision 10: the join policy defaults to live-token — a FAN-OUT flow starts with none given, and an explicit one is taken (rule 8, a12)', () => {
    // Every flow this suite started was LINEAR until this fixture, and a linear flow needs no join
    // policy — so `joinPolicy: … ?? liveToken` was inert and could be deleted for nothing. A fan-out
    // document is refused at `new Driver` (`MissingJoinPolicy`) when no policy reaches it, which is
    // what makes the default observable.
    const fanout = {
      flowId: 'fan', version: 1, entry: 'a',
      nodes: [
        { id: 'a', kind: 'task', type: 'Scorer', settings: { factor: 1 }, edges: [{ to: 'split' }] },
        { id: 'split', kind: 'fanout', branches: ['b', 'c'] },
        { id: 'b', kind: 'task', type: 'Scorer', settings: { factor: 1 }, edges: [{ to: 'j' }] },
        { id: 'c', kind: 'task', type: 'Scorer', settings: { factor: 1 }, edges: [{ to: 'j' }] },
        { id: 'j', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const s = seams();
    const r = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const { driver: d } = r.start(fanout, { x: 1 });
    equal(s.added.map((t) => t.id), [`${d.runId}:a:-:0`], 'the run started, so a policy reached the driver');
    // And the caller's own policy is taken where given — the other half of the pair.
    const explicit = seams();
    const r2 = createRuntime(DOC, {}, { createPool: explicit.createPool, createScheduler: explicit.createScheduler });
    const { driver: d2 } = r2.start(fanout, { x: 1 }, { joinPolicy: liveTokenRequiringArrival });
    equal(explicit.added.map((t) => t.id), [`${d2.runId}:a:-:0`], 'and so does an explicitly given one');
  });

  test('two runtimes over one document mint the same ids — decision 10`s scope, stated rather than assumed (Q20)', () => {
    const one = createRuntime(DOC, {}, { ...seams() });
    const two = createRuntime(DOC, {}, { ...seams() });
    equal([one.start(FLOW, {}).driver.runId, two.start(FLOW, {}).driver.runId], ['r1', 'r1'],
      'unique per RUNTIME and not globally — two runtimes on one scheduler must be given their ids by the caller');
  });
});

/**
 * **W162 — a runtime's languages are its REGISTRY's, and `start` refuses from `runtime.check`** —
 * [ADR 0096](../../doc/decisions/0096-a-runtime-is-its-registry-and-start-refuses-from-runtime-check.md), P37
 * decision 3 and stop-and-asks (a) and (b). Re-cut from W66's *decision 13* suite, which asserted the rule this
 * reverses (a language reached a pool only through the `flows` given at construction, and `start` refused
 * `LanguageNotBuilt` otherwise). **Expected values are the document and code literals here and the spec's corpus
 * file names, never the runtime's output**: a pool carries the languages the document names, each the adapter's
 * worker half; a refused flow's rule is the one its corpus file is named for; and `start`'s refusal is held to the
 * error `new Driver` throws by hand over `runtime.registry` — a second route, not a second definition.
 */
suite('W162 — every typed pool carries the registry`s languages, and start refuses from runtime.check (ADR 0096)', (test) => {
  const TRANSFORMING: FlowDefinition = {
    flowId: 't', version: 1, entry: 'a',
    nodes: [
      { id: 'a', kind: 'task', type: 'Scorer', transform: { lang: 'path', expr: 'confidence' }, edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition;
  const withLang = edited((d) => { (d as Record<string, unknown>).languages = ['path']; });
  const code: RegistryCode = { languages: { path: PATH_LANGUAGE } };
  const OTHER: LanguageAdapter = { compile: () => {}, worker: 'test://other-language.js' };
  const twoLangs = edited((d) => { (d as Record<string, unknown>).languages = ['path', 'other']; });
  const both: RegistryCode = { languages: { path: PATH_LANGUAGE, other: OTHER } };
  /** A scheduler that holds nothing — what `new Driver` is handed BY HAND, the second route to the same refusal. */
  const inert = { addTask() {}, addEventListener() {} };
  /** What `new Driver` throws for `flow` over `runtime.registry` — the error `start` must reproduce, read by a different road. */
  const byHand = (registry: RuntimeRegistry, flow: FlowDefinition): InvalidDefinition | null => {
    try {
      new Driver(flow, { ...registry, runId: 'hand', scheduler: inert, joinPolicy: liveToken });
      return null;
    } catch (e) {
      if (e instanceof InvalidDefinition) return e;
      throw e;
    }
  };

  test('EVERY pool — the default and named instances of the declared type, and the built-in — carries exactly the registry`s languages, both ways with runtime.registry.languages, each the adapter`s worker URL', () => {
    const s = seams();
    const r = createRuntime(twoLangs, both, { createPool: s.createPool, createScheduler: s.createScheduler });
    const registered = Object.keys(r.registry.languages as Record<string, LanguageAdapter>).sort();
    equal(registered, ['other', 'path'], 'the runtime`s registry names the document`s two languages');
    equal(s.pools.length, Object.keys(r.pools).length, 'one recorded pool per pool the runtime derived');
    ok(s.pools.length === BUILT_INS.length + 2, 'the two instances of Scorer plus the built-ins — so the loop below reaches a pool with no inner worker');
    for (const p of s.pools) {
      const carried = (p.options.config as { languages?: Record<string, string> }).languages ?? {};
      const names = Object.keys(carried).sort();
      equal(registered.filter((n) => !names.includes(n)), [], 'no registered language is missing from a pool');
      equal(names.filter((n) => !registered.includes(n)), [], 'and no pool carries a language the registry does not name');
      for (const n of names) equal(carried[n], (both.languages as Record<string, LanguageAdapter>)[n]!.worker, `${n}: the URL is the adapter's worker half`);
    }
  });

  test('a registry naming NO language builds no pool carrying a `languages` key — the pool options it built before W162 (P18 fact 5`s capture, asserted above, is unmoved)', () => {
    const s = seams();
    createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    ok(s.pools.length > 0 && s.pools.every((p) => !('languages' in (p.options.config as object))), 'no pool config carries a languages key');
    const c = seams();
    createRuntime(withLang, code, { createPool: c.createPool, createScheduler: c.createScheduler });
    ok(c.pools.every((p) => 'languages' in (p.options.config as object)), 'CONTROL: the same document naming one language puts the key on every pool');
  });

  test('a TRANSFORMING flow the runtime was never shown starts — in one language and in two — and `createRuntime` takes no `flows`', () => {
    const s = seams();
    const r = createRuntime(withLang, code, { createPool: s.createPool, createScheduler: s.createScheduler });
    equal(r.check(TRANSFORMING), [], 'check: nothing refused');
    const { driver: d } = r.start(TRANSFORMING, { confidence: 0.9 });
    equal(s.added.map((t) => t.id), [`${d.runId}:a:-:0`], 'one task, dispatched');
    equal(Object.keys(s.added[0]!.payload as object).sort(), ['input', 'settings', 'transform'], 'with the transform as the third key — FD-C6');
    // W66's F13 case, inverted: a type transforming in TWO languages, neither announced, starts.
    const two = {
      flowId: 'two', version: 1, entry: 'a',
      nodes: [
        { id: 'a', kind: 'task', type: 'Scorer', transform: { lang: 'path', expr: 'confidence' }, edges: [{ to: 'b' }] },
        { id: 'b', kind: 'task', type: 'Scorer', transform: { lang: 'other', expr: 'confidence' }, edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const t = seams();
    const r2 = createRuntime(twoLangs, both, { createPool: t.createPool, createScheduler: t.createScheduler });
    equal(r2.check(two), [], 'check: nothing refused for a flow transforming in both');
    r2.start(two, {});
    equal(t.added.length, 1, 'and it starts');
    // ADR 0096 rule 3: the option is GONE, so passing it fails to COMPILE — the `@ts-expect-error` fails `typecheck`
    // the day `flows` comes back — and at run time it is an unread key.
    // @ts-expect-error — `flows` was removed from `RuntimeOptions` by W162
    const ignored = createRuntime(withLang, code, { createPool: seams().createPool, createScheduler: seams().createScheduler, flows: [] });
    equal(ignored.check(TRANSFORMING), [], 'and passing it anyway changes nothing');
  });

  test('check returns every finding, and start throws exactly them as `new Driver` would — InvalidDefinition, the same rules, the same message — dispatching nothing and spending no run id', () => {
    const s = seams();
    const r = createRuntime(withLang, code, { createPool: s.createPool, createScheduler: s.createScheduler });
    // Two defects in one flow, so `check` is seen returning ALL of them rather than the first: an unregistered
    // language (FD-V35) and an unregistered type (FD-V32).
    const bad = {
      flowId: 'bad', version: 1, entry: 'a',
      nodes: [
        { id: 'a', kind: 'task', type: 'Scorer', transform: { lang: 'nope', expr: 'x' }, edges: [{ to: 'b' }] },
        { id: 'b', kind: 'task', type: 'Nobody', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    let found: Finding[] = [];
    let threwFromCheck: unknown = null;
    try { found = r.check(bad); } catch (e) { threwFromCheck = e; }
    equal(threwFromCheck, null, 'check does not throw for a flow`s defect');
    equal(violatedRules(found), ['FD-V32', 'FD-V35'], 'both defects, each under its rule');
    equal(found.map((f) => f.at).sort(), ['a', 'b'], 'each at its node');
    let err: unknown;
    try { r.start(bad, {}); } catch (e) { err = e; }
    ok(err instanceof InvalidDefinition, `start throws InvalidDefinition: ${(err as Error)?.constructor?.name}`);
    const hand = byHand(r.registry, bad);
    ok(hand !== null, 'and `new Driver` over runtime.registry refuses the same flow');
    equal((err as InvalidDefinition).rules, violatedRules(found), 'start`s rules are check`s');
    equal((err as InvalidDefinition).rules, hand!.rules, 'and new Driver`s, by hand');
    equal((err as Error).message, hand!.message, 'and its message is new Driver`s, to the byte');
    equal(s.added, [], 'nothing was dispatched');
    equal(r.start(FLOW, {}).driver.runId, 'r1', 'and the next start mints r1 — the refusal spent no run id');
  });

  test('`check` EXCLUDES the payload`s refusal (FD-R4) and the run id`s (RunIdInUse) — each is start`s alone, by name', () => {
    const guarded = edited((d) => { (d.workers.w as Record<string, unknown>).inputSchema = { type: 'object', required: ['text'] }; });
    const s = seams();
    const r = createRuntime(guarded, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    equal(r.check(FLOW), [], 'check: a flow whose entry worker requires `text` is not refused — no payload is involved');
    throws(() => r.start(FLOW, {}), 'text', 'start with a payload lacking it is refused');
    let err: unknown;
    try { r.start(FLOW, {}); } catch (e) { err = e; }
    ok(err instanceof BoundaryRefused, `and that refusal is FD-R4's BoundaryRefused: ${(err as Error)?.constructor?.name}`);
    r.start(FLOW, { text: 'x' }, { runId: 'taken' });
    equal(r.check(FLOW), [], 'check, after a run id is taken: still nothing — the run id is not the flow`s');
    let used: unknown;
    try { r.start(FLOW, { text: 'x' }, { runId: 'taken' }); } catch (e) { used = e; }
    ok(used instanceof RunIdInUse, `and start naming that id is RunIdInUse: ${(used as Error)?.constructor?.name}`);
  });

  test('ORDER on start: an invalid flow is InvalidDefinition even with a run id IN USE or outside ID-R2`s charset — check runs before both (the readers` shared finding)', () => {
    const s = seams();
    const r = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    r.start(FLOW, {}, { runId: 'taken' });
    const broken = { ...FLOW, nodes: FLOW.nodes.map((n) => (n.id === 'a' ? { ...n, type: 'Nobody' } : n)) } as unknown as FlowDefinition;
    for (const [label, runId] of [['a run id in use', 'taken'], ['a run id outside ID-R2`s charset', 'a:b']] as const) {
      let err: unknown;
      try { r.start(broken, {}, { runId }); } catch (e) { err = e; }
      ok(err instanceof InvalidDefinition, `${label}: InvalidDefinition, not the run id's refusal — got ${(err as Error)?.constructor?.name}: ${(err as Error)?.message}`);
      equal((err as InvalidDefinition).rules, ['FD-V32'], `${label}: the flow's rule`);
    }
    // CONTROL: the same two run ids on a VALID flow are each refused by their own rule, so the pair above discriminates.
    throws(() => r.start(FLOW, {}, { runId: 'taken' }), 'in use', 'control: a valid flow with the id in use is RunIdInUse');
    throws(() => r.start(FLOW, {}, { runId: 'a:b' }), 'a:b', 'control: a valid flow with a bad id is ID-R2`s');
    let bad: unknown;
    try { r.start(FLOW, {}, { runId: 'a:b' }); } catch (e) { bad = e; }
    ok(!(bad instanceof InvalidDefinition), `control: and ID-R2's refusal is not an InvalidDefinition: ${(bad as Error)?.constructor?.name}`);
  });

  test('`resume` refuses an invalid flow from the same call, before any driver — and the run id is not spent', () => {
    const s = seams();
    const r = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const { driver } = r.start(FLOW, {});
    const checkpoint = driver.checkpoint();
    // Same flow id and version, so the header is not what refuses it; its one node names a type nobody registered.
    const broken = { ...FLOW, nodes: FLOW.nodes.map((n) => (n.id === 'a' ? { ...n, type: 'Nobody' } : n)) } as unknown as FlowDefinition;
    const fresh = seams();
    const r2 = createRuntime(DOC, {}, { createPool: fresh.createPool, createScheduler: fresh.createScheduler });
    let err: unknown;
    try { r2.resume(broken, checkpoint); } catch (e) { err = e; }
    ok(err instanceof InvalidDefinition && err.rules.includes('FD-V32'), `resume throws InvalidDefinition FD-V32: ${(err as Error)?.message}`);
    equal(err && (err as InvalidDefinition).rules, violatedRules(r2.check(broken)), 'its rules are check`s');
    const { driver: again } = r2.resume(FLOW, checkpoint);
    equal(again.runId, checkpoint.header.runId, 'and the same checkpoint resumes on that runtime under its own id — the refusal spent nothing');
    // **Discriminating (the adequacy reader's F2)**: on the runtime that ALREADY holds the run id, the broken flow is
    // still InvalidDefinition — `check` runs inside `openRun` before `RunIdInUse`, so a resume that skipped it (and
    // left the flow to `new Driver`) would be refused RunIdInUse here instead.
    let held: unknown;
    try { r.resume(broken, checkpoint); } catch (e) { held = e; }
    ok(held instanceof InvalidDefinition, `on the runtime holding the id: InvalidDefinition, not RunIdInUse — got ${(held as Error)?.constructor?.name}`);
    throws(() => r.resume(FLOW, checkpoint), 'in use', 'control: the VALID flow there is RunIdInUse, so the case above discriminates');
  });

  test('ORDER on resume: the header`s refusal and the entry payload`s clone come BEFORE check — an invalid flow behind either is refused by that, not by InvalidDefinition', () => {
    const s = seams();
    const r = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const checkpoint = r.start(FLOW, {}).driver.checkpoint();
    const fresh = () => createRuntime(DOC, {}, { createPool: seams().createPool, createScheduler: seams().createScheduler });
    // An invalid flow whose flowId is NOT the checkpoint's: the header refuses it first (RN-R23).
    const otherAndBroken = { ...FLOW, flowId: 'other', nodes: FLOW.nodes.map((n) => (n.id === 'a' ? { ...n, type: 'Nobody' } : n)) } as unknown as FlowDefinition;
    ok(fresh().check(otherAndBroken).length > 0, 'the flow IS invalid, so InvalidDefinition was available');
    let h: unknown;
    try { fresh().resume(otherAndBroken, checkpoint); } catch (e) { h = e; }
    ok(h instanceof ResumeRefused, `a refused header with an invalid flow: ResumeRefused — got ${(h as Error)?.constructor?.name}`);
    // An invalid flow with the checkpoint's own id, and an entry payload the clone refuses: DataCloneError first (RN-R15).
    const broken = { ...FLOW, nodes: FLOW.nodes.map((n) => (n.id === 'a' ? { ...n, type: 'Nobody' } : n)) } as unknown as FlowDefinition;
    const uncloneable = { ...checkpoint, header: { ...checkpoint.header, entryPayload: { f: () => 1 } } } as unknown as Checkpoint;
    let c: unknown;
    try { fresh().resume(broken, uncloneable); } catch (e) { c = e; }
    ok(c instanceof Error && c.name === 'DataCloneError', `an uncloneable entry payload with an invalid flow: DataCloneError — got ${(c as Error)?.name}: ${(c as Error)?.message}`);
  });

  test('the removed surface is ABSENT: `LanguageNotBuilt` and `transformLanguagesByType` are exported by neither the scheduler sub-path nor the root (ADR 0096 rule 3)', async () => {
    const sub = await import('../../src/scheduler/index.ts') as Record<string, unknown>;
    const rootModule = await import('../../index.ts') as Record<string, unknown>;
    for (const name of ['LanguageNotBuilt', 'transformLanguagesByType']) {
      ok(!(name in sub), `${name} is not exported by fyflow-orchestration/scheduler`);
      ok(!(name in rootModule), `${name} is not exported by the root`);
    }
    // CONTROL: the module objects are the real ones — a name each does export is found.
    ok('createRuntime' in sub && 'RunIdInUse' in sub && 'validateDefinition' in rootModule, 'control: the sub-path and the root are read');
  });

  test('over the WHOLE spec corpus: check never throws; every invalid flow is refused naming the rule its file is named for, and start throws exactly check`s rules with new Driver`s message; every valid flow checks clean — and equals the L4 validator`s reading', async () => {
    const EX = `${ROOT}spec/examples`;
    const doc = JSON.parse(await readText(`${EX}/registry.json`)) as CorpusRegistryDocument;
    // The corpus's predicates are NAMES; a runtime keys functions, so each is supplied as one that is never called here.
    const predicates = Object.fromEntries((doc.predicates ?? []).map((n) => [n, () => true]));
    const s = seams();
    const r = createRuntime(doc, { predicates, languages: CORPUS_LANGUAGES }, { createPool: s.createPool, createScheduler: s.createScheduler });
    const l4 = corpusRegistry(doc);
    const invalid = (await listDir(`${EX}/invalid`)).filter((n) => n.endsWith('.flow.json')).sort();
    const valid = (await listDir(`${EX}/valid`)).filter((n) => n.endsWith('.flow.json')).sort();
    ok(invalid.length >= 40 && valid.length >= 20, `the corpus is not empty: ${invalid.length} invalid, ${valid.length} valid`);
    const ran: string[] = [];
    for (const name of invalid) {
      const flow = JSON.parse(await readText(`${EX}/invalid/${name}`)) as FlowDefinition;
      const named = name.slice(0, name.indexOf('--'));
      let found: Finding[] = [];
      let threw: unknown = null;
      try { found = r.check(flow); } catch (e) { threw = e; }
      equal(threw, null, `${name}: check does not throw`);
      ok(violatedRules(found).includes(named), `${name}: check reports ${named} — got ${violatedRules(found).join(', ')}`);
      equal(violatedRules(found), violatedRules(validateDefinition(flow, l4)), `${name}: the same rules the L4 validator reports over the corpus registry`);
      let err: unknown;
      try { r.start(flow, {}); } catch (e) { err = e; }
      ok(err instanceof InvalidDefinition, `${name}: start throws InvalidDefinition`);
      equal((err as InvalidDefinition).rules, violatedRules(found), `${name}: start's rules are check's`);
      equal((err as Error).message, byHand(r.registry, flow)?.message, `${name}: and its message is new Driver's, by hand`);
      ran.push(name);
    }
    equal(ran, invalid, 'every invalid corpus file was compared — the loop`s own membership');
    // **The `at ?? '<document>'` branch of the message is reached by the corpus** (the adequacy reader's F5): a
    // document-level finding (FD-V10, a cycle) carries `at: null`, and start's message names it `<document>`.
    const cycle = JSON.parse(await readText(`${EX}/invalid/FD-V10--cycle.flow.json`)) as FlowDefinition;
    ok(r.check(cycle).some((f) => f.at === null), 'FD-V10--cycle carries a finding at the DOCUMENT (at: null)');
    throws(() => r.start(cycle, {}), 'FD-V10 at <document>', 'and start`s message names it `<document>`');
    for (const name of valid) {
      const flow = JSON.parse(await readText(`${EX}/valid/${name}`)) as FlowDefinition;
      equal(r.check(flow), [], `${name}: a valid flow checks clean on the runtime built from the corpus registry`);
      equal(byHand(r.registry, flow), null, `${name}: and new Driver accepts it by hand`);
    }
    equal(s.added, [], 'nothing was dispatched by any refused start');
  });

  test('BOTH WAYS: an adapter or a predicate SUPPLIED and named by no document is refused too — decision 13 (the conformity reader, finding 5)', () => {
    const s = seams();
    let err: unknown;
    try { createRuntime(DOC, code, { createPool: s.createPool, createScheduler: s.createScheduler }); } catch (e) { err = e; }
    ok(err instanceof RuntimeError && (err as Error).message.includes('"path"'), `the adapter the document names nowhere is refused: ${(err as Error)?.message ?? 'nothing'}`);
    equal(s.pools, [], 'and nothing was built');
    const p = seams();
    let perr: unknown;
    try { createRuntime(DOC, { predicates: { isHigh: () => true } }, { createPool: p.createPool, createScheduler: p.createScheduler }); } catch (e) { perr = e; }
    ok(perr instanceof RuntimeError && (perr as Error).message.includes('"isHigh"'), `and so is the predicate: ${(perr as Error)?.message ?? 'nothing'}`);
    // The no-trip twin: named AND supplied, both ways, is what the whole suite runs on.
    const okRt = createRuntime(withLang, code, { createPool: seams().createPool, createScheduler: seams().createScheduler });
    equal([...(okRt.registry.languages as Record<string, unknown> instanceof Map ? [] : Object.keys(okRt.registry.languages as Record<string, unknown>))], ['path'], 'named and supplied: resolved');
  });

  test('a language the document names and the code does not supply is refused at construction, before any pool', () => {
    const s = seams();
    throws(() => createRuntime(withLang, {}, { createPool: s.createPool, createScheduler: s.createScheduler }), 'path', 'NameMissing from the resolver');
    equal(s.pools, [], 'and nothing was built');
  });
});

// **On a REAL pool, with no seam** — the Gate line's L1 clause, and W61's real-pool suite's shape.
// A browser cannot load this repository's `.ts` worker (`RT-R10`), so the case is skipped there and
// the SKIP is asserted rather than left to a silent difference in the case count.
/**
 * **What `start` forwards, what `createRuntime` holds, and what the runtime EXPOSES** — W66's
 * adequacy reader, F1-F4, F8, F10-F12, F19-F22. Every member below was forwarded or exposed by the
 * code and observed by nothing: deleting the forward, or emptying the member, cost zero on all four
 * rungs. **A runtime that dropped every predicate, every start option, the run's own payload and the
 * groups the scheduler holds passed the whole suite — and `AGENTS.md` section 12's snippet.**
 */
suite('W66 — every option start forwards, and every member the runtime exposes, observed', (test) => {
  /** A document with a predicate to route on, a named instance to dispatch to, and a group a node may name. */
  const ROUTED = {
    workers: { w: { url: 'https://example.test/w.js' } },
    groups: { gate: { type: 'ConcurrentLimitGroup', config: { limit: 1 } } },
    nodeTypes: { T: { worker: 'w', inline: true, groups: ['gate'] } },
    pools: { 'T-slow': { type: 'T', config: { slow: true } } },
    predicates: ['high'],
  } as unknown as RegistryDocument;
  const high = () => true;
  const guarded = (extra: Record<string, unknown> = {}): FlowDefinition => ({
    flowId: 'r', version: 1, entry: 'a',
    nodes: [
      { id: 'a', kind: 'task', type: 'T', ...extra, edges: [{ when: { predicate: 'high' }, to: 'done' }, { to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  }) as unknown as FlowDefinition;
  const FANOUT = {
    flowId: 'fan', version: 1, entry: 'a',
    nodes: [
      { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'fanout', branches: ['b', 'c'] },
      { id: 'b', kind: 'task', type: 'T', edges: [{ to: 'j' }] },
      { id: 'c', kind: 'task', type: 'T', edges: [{ to: 'j' }] },
      { id: 'j', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition;

  test('F1: the predicate MAP reaches the driver — from a record AND from a Map, with a routed edge as the proof', () => {
    for (const [shape, supplied] of [['record', { high }], ['Map', new Map([['high', high]])]] as const) {
      const s = seams();
      const r = createRuntime(ROUTED, { predicates: supplied }, { createPool: s.createPool, createScheduler: s.createScheduler });
      equal([...(r.registry.predicates as ReadonlyMap<string, unknown>).keys()], ['high'], shape + ': keyed by the name the document declares');
      const { driver: d } = r.start(guarded(), { x: 1 });
      equal(s.added.map((t) => t.id), [d.runId + ':a:-:0'], shape + ': and a flow whose edge NAMES it starts — FD-V4 refuses it otherwise');
    }
  });

  test('F2: a caller supplied joinPolicy reaches the driver, and a run still starts with none given', () => {
    let opened = 0;
    const counting = { ...arrivalCount, open: (region: never) => { opened++; return arrivalCount.open(region); } } as typeof arrivalCount;
    const s = seams();
    const r = createRuntime(ROUTED, { predicates: { high } }, { createPool: s.createPool, createScheduler: s.createScheduler });
    const { driver: d } = r.start(FANOUT, { x: 1 }, { joinPolicy: counting });
    // The region opens when the fanout is REACHED, so the entry has to settle first — the policy is
    // asked to open it, and a driver holding a different policy would not ask this object.
    s.settle(d.runId + ':a:-:0', { ok: true });
    ok(opened > 0, 'the caller policy was asked to open the region — it reached the driver');
    const dflt = seams();
    createRuntime(ROUTED, { predicates: { high } }, { createPool: dflt.createPool, createScheduler: dflt.createScheduler }).start(FANOUT, { x: 1 });
    equal(dflt.added.length, 1, 'and with none given the run still starts — the default is a policy, not an absence');
  });

  test('F3, F4, F5: createTask, the driver default and onFoldInput all arrive where start forwards them', () => {
    const s = seams();
    const seen: string[] = [];
    const r = createRuntime(ROUTED, { predicates: { high } }, {
      createPool: s.createPool, createScheduler: s.createScheduler,
      defaultRetryPolicy: { maxRetries: 3, backoffMs: 11 },
    });
    const { driver: d } = r.start(guarded(), { x: 1 }, {
      createTask: (c) => ({ ...(c as Record<string, unknown>), MARK: 7 }) as never,
      onFoldInput: () => { seen.push('fold'); },
      onRunFailure: () => { seen.push('failure'); },
      onUnsatisfiableJoin: () => { seen.push('unsatisfiable'); },
      onUnmintedTask: () => { seen.push('unminted'); },
      now: () => 12345,
    });
    equal((s.added[0] as { MARK?: number }).MARK, 7, 'F3: the caller createTask built the task the scheduler got');
    equal(s.added[0]!.retryPolicy, { maxRetries: 3, backoffMs: 11 }, 'F4: the runtime defaultRetryPolicy reached a node that declares none');
    ok(seen.includes('fold'), 'F5: onFoldInput was called');
    equal(d.runId, 'r1', 'and the run is the runtime own minted one');
  });

  test('F8: the scheduler is BUILT with the groups the runtime created — the silent mode P16 fact 2 measured', () => {
    const s = seams();
    createRuntime(ROUTED, { predicates: { high } }, { createPool: s.createPool, createScheduler: s.createScheduler });
    equal(Object.keys(s.built[0]!.groups), ['gate'], 'the group objects reach the scheduler, keyed as the document declared them');
  });

  test('F10, F11: the registry SPREAD is what the driver validates against — a node naming a pool and one naming workerGroups both start', () => {
    const s = seams();
    const r = createRuntime(ROUTED, { predicates: { high } }, { createPool: s.createPool, createScheduler: s.createScheduler });
    const { driver: d } = r.start(guarded({ pool: 'T-slow', workerGroups: ['gate'] }), { x: 1 });
    equal(s.added.map((t) => t.id), [d.runId + ':a:-:0'], 'FD-V38 and FD-V31 both passed, so pools and groups crossed into the driver');
    equal(s.added[0]!.workerType, 'T-slow', 'and the task went to the NAMED instance');
    equal(s.added[0]!.workerGroups, ['gate'], 'carrying the node own group');
  });

  test('F12: the PAYLOAD start is given is what the entry node receives', () => {
    const s = seams();
    createRuntime(ROUTED, { predicates: { high } }, { createPool: s.createPool, createScheduler: s.createScheduler })
      .start(guarded(), { x: 1, deep: { y: 2 } }).driver;
    equal((s.added[0]!.payload as { input: unknown }).input, { x: 1, deep: { y: 2 } }, 'the envelope input IS what the caller passed');
  });

  test('F19: a caller supplied runId does NOT consume a mint — the counter counts what it minted', () => {
    const s = seams();
    const r = createRuntime(ROUTED, { predicates: { high } }, { createPool: s.createPool, createScheduler: s.createScheduler });
    const { driver: a } = r.start(guarded(), {}, { runId: 'mine' });
    const { driver: b } = r.start(guarded(), {});
    equal([a.runId, b.runId], ['mine', 'r1'], 'the first run took the caller id and the counter is untouched by it');
  });

  test('F20, F21: resolved and scheduler are what they say — the two members with no reader', () => {
    const s = seams();
    const r = createRuntime(ROUTED, { predicates: { high } }, { createPool: s.createPool, createScheduler: s.createScheduler });
    equal([...r.resolved.nodeTypes.keys()].sort(), ['T'], 'resolved carries what the document MEANT, before anything was built');
    equal([...r.resolved.pools.keys()].sort(), ['T', 'T-slow'], 'including the default instance the document never names');
    equal([...r.resolved.predicates], ['high'], 'and the names it declared');
    equal(Object.keys((r.scheduler as unknown as { workerPools: object }).workerPools).sort(), ['T', 'T-slow', ...BUILT_INS].sort(),
      'and scheduler is the one holding this runtime pools — shared across its runs (decision 10)');
  });

  test('F22: the refusal message carries each member REASON, not just its name — ADR 0055 rule 1 second half', () => {
    const s = seams();
    const code: RegistryCode = { predicates: { high }, groupTypes: { Custom: { create: (_c: unknown, key: string) => { const g = goodGroup(key); delete g.onFinish; return g as never; } } } };
    let err: unknown;
    try {
      createRuntime({ ...ROUTED, groups: { gate: { type: 'Custom', config: {} } } } as unknown as RegistryDocument, code,
        { createPool: s.createPool, createScheduler: s.createScheduler });
    } catch (e) { err = e; }
    const m = (err as Error)?.message ?? '';
    ok(m.includes('RUNNING for ever'), 'the why string is in the message a consumer reads: ' + m);
  });
});

/**
 * **The sub-path's public surface is a claim about this module** — the adequacy reader, F14. Every
 * name below is imported here from `src/scheduler/runtime.ts` DIRECTLY, so nothing bound the
 * re-export a consumer actually resolves: cutting `src/scheduler/index.ts` back to `createRuntime`
 * alone cost zero on all four rungs. W59's adequacy reader's finding (ADR 0049 rule 5's second half
 * had no observer) one item later, in the same file.
 */
suite('W66 — the sub-path re-exports what this module exports, both ways', (test) => {
  test('every value src/scheduler/runtime.ts exports is reachable from fyflow-orchestration/scheduler', async () => {
    const subPath = await import('../../src/scheduler/index.ts') as Record<string, unknown>;
    const module = await import('../../src/scheduler/runtime.ts') as Record<string, unknown>;
    const names = Object.keys(module).sort();
    equal(names.filter((n) => n in subPath), names, 'the sub-path carries all of them');
    ok(names.includes('createRuntime') && names.includes('RuntimeError') && names.includes('GROUP_MEMBERS'),
      'and the list is not empty: ' + names.join(', '));
  });
});

const IN_BROWSER = typeof (globalThis as { document?: unknown }).document !== 'undefined';
// **One module per worker since W67** — `examples/workers/` holds a module per worker entry and no
// `role` switch, so this names the two it needs rather than one file twice with two configs.
const INGEST_URL = '../../examples/workers/ingest.ts';
const PUBLISH_URL = '../../examples/workers/publish.ts';

suite('W66 — a runtime on REAL pools: a document in, a completed run out', (test) => {
  test(`a flow built entirely from a document runs to completed on a real FyflowScheduler — ${IN_BROWSER ? 'SKIPPED in the browser (RT-R10)' : 'inline pools, no seam'}`, async () => {
    if (IN_BROWSER) {
      ok(true, 'skipped: a browser loads no .ts worker file, which is RT-R10 and is why ladder L6 runs in Node and Deno only');
      return;
    }
    const runtime = createRuntime({
      workers: { ingest: { url: INGEST_URL }, publish: { url: PUBLISH_URL } },
      groups: { gate: { type: 'ConcurrentLimitGroup', config: { limit: 1 } } },
      nodeTypes: {
        Ingest: { worker: 'ingest', inline: true, config: {}, pool: { maxThreads: 1, idleTimeout: 0 } },
        Publish: { worker: 'publish', inline: true, config: {}, pool: { maxThreads: 1, idleTimeout: 0 }, groups: ['gate'] },
      },
    }, {}, { base: import.meta.url });

    const flow = {
      flowId: 'real', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'Ingest', edges: [{ to: 'publish' }] },
        { id: 'publish', kind: 'task', type: 'Publish', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;

    const inputs: FoldInput[] = [];
    const state = await new Promise<RunState>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('the run did not settle in 10 s')), 10000);
      runtime.start(flow, { confidence: 0.9 }, {
        onFoldInput: (input) => {
          inputs.push(input);
          queueMicrotask(() => { const s = fold(inputs); if (isTerminal(s)) { clearTimeout(timer); resolve(s); } });
        },
        onRunFailure: (f) => { clearTimeout(timer); reject(new Error(`${f.kind}: ${f.message}`)); },
      });
    });
    // Read BEFORE shutdown, which clears the scheduler's maps.
    const poolKeys = Object.keys(runtime.scheduler.workerPools as Record<string, unknown>).sort();
    const groupKeys = Object.keys(runtime.scheduler.groups as Record<string, unknown>).sort();
    const real = (runtime.scheduler.workerPools as Record<string, { scriptUrl?: string }>).Ingest;
    await runtime.shutdown();

    equal(state.outcome, 'completed', 'the run the document describes completed on real workers');
    equal(poolKeys, ['Ingest', 'Publish', ...BUILT_INS].sort(), 'one real pool per type instance, keyed by the type`s name, plus the built-ins');
    equal(groupKeys, ['gate'], 'and the group the document declared is the scheduler`s, keyed as declared');
    ok(typeof real?.scriptUrl === 'string' && real.scriptUrl.endsWith('/envelope-worker.ts'),
      `every real pool loads the package's envelope worker: ${real?.scriptUrl}`);
    // **What the second worker RECEIVED is the envelope's `input`** — the value this node was handed
    // (`FD-C5`), and the `publish` role echoes it back as `joinPayload`, so the run itself says that
    // the first node's result crossed the envelope rather than a `settings` wrapper or a `null`.
    const publish = Object.values(state.nodes).find((n) => n.nodeId === 'publish');
    const received = (publish?.result as { published?: boolean; joinPayload?: { confidence?: number } } | null);
    equal(received?.published, true, 'the second node ran its own role');
    equal(received?.joinPayload?.confidence, 0.9, 'and what it received is what the first node returned, through the envelope');
  });
});

suite('W66 — what the runtime refuses that the document alone could not say', (test) => {
  test('a type naming a worker the document lacks is refused before a url is resolved', () => {
    const s = seams();
    let err: unknown;
    try { createRuntime(edited((d) => { d.nodeTypes.Scorer.worker = 'gone'; }), {}, { createPool: s.createPool, createScheduler: s.createScheduler }); } catch (e) { err = e; }
    ok(err instanceof WorkerMissing && err.at === 'Scorer', `WorkerMissing naming the type: ${(err as Error)?.constructor?.name}`);
  });

  test('shutdown is the scheduler`s, forwarded — a runtime owns its pools', async () => {
    let shut = 0;
    const r = createRuntime(DOC, {}, {
      createPool: () => ({} as never),
      createScheduler: () => ({ workerPools: {}, groups: {}, addTask() {}, addEventListener() {}, shutdown() { shut++; return Promise.resolve(); } } as never),
    });
    await r.shutdown();
    equal(shut, 1, 'forwarded once');
  });
});

/**
 * **W76 — what `start` ACCEPTS: the two lists bound BOTH WAYS, and the partition with no residue.**
 * [P20](../../doc/plans/p20-what-the-runtime-owes-a-consumer.md) decisions 4 and 5,
 * [W76](../../doc/work-items/w76-what-start-accepts.md), ladder L1.
 *
 * **Why this reads the SOURCE.** `StartOptions`' `Pick` and the conditional spreads inside `start`
 * are two hand-written lists, and **P20 fact 2 measured that they were bound by nothing**: widening
 * the first and forgetting the second is green on all five typecheckers, `npm test`, `check:source`
 * AND `check:docs`, so a typed option a consumer passed was silently dropped. That is
 * `doc/workflow.md` rule 8 obligation (e)'s third shape — *a LIST is a claim about another list,
 * find the other list and compare BOTH WAYS* — and the only place both lists exist is the source.
 * Both files are inlined into the browser bundle for exactly this (a declared exception on
 * `scripts/build-browser-tests.mjs`), so
 * this suite is identical in all five runtimes rather than skipped in three.
 *
 * **The second road is DERIVED, not declared.** P20 decision 5 warns that a naive comparison reports
 * a false positive, because `joinPolicy` is legitimately in the `Pick` with no spread line — it is
 * applied as `?? liveToken`. W76's declaration step measured that `??` is not an exception but a
 * second ROAD, and that it has TWO members: `runId` is the other, declared in `StartOptions`' own
 * BODY rather than in the `Pick`, which is the half P20 fact 1 could not see and which W71's
 * conformity reader had measured from the other end. **The BINDING below writes down no member
 * name; the `exactly one road` case that follows it PINS the `??` road to two, deliberately, and
 * the two claims are kept apart here because the first version of this paragraph ran them
 * together and both of W76's readers said so.**
 *
 * **Every expected value comes from P20 fact 1 and from W76's declaration-step measurements taken on
 * the shipped tree before a line was edited** (`dev-dist/w76/decl-partition.txt`,
 * `dev-dist/w76/decl-before.txt`), never from this module's output.
 */
/**
 * **W76's source-reading helpers, at module scope so the two suites below share ONE expression.**
 * They were a copy each, and W76's adequacy reader measured what that cost: the text binding and
 * the behavioural membership derived names with the same regex written twice, so *"the item's
 * declared second observer is a second copy of the first sensor"* — obligation (c)'s LIMIT one
 * level in. One definition, two callers.
 *
 * **The member pattern admits three spellings, because two of them shipped invisible.** A
 * nineteenth `DriverOptions` member written `readonly onSilentlyMissed?: () => void;` or
 * `onShorthand?(e: RegionEvent): void;` — both ordinary, both legal — was reachable by NO road and
 * caught by NOTHING (that reader's m21, m22, m23), which makes W76's own Outputs (2) and (3) false
 * for two spellings of the defect they exist to refuse. *The count beside the membership could not
 * see it either, because the count is derived from the same regex and is downstream of the
 * apparatus it is meant to corroborate.*
 */
/**
 * A newline and a comment-line test, as CONSTANTS. W77 mangled both through a shell quoting
 * layer twice on the way in; `CLAUDE.md`'s rule is to write a script as a FILE rather than a
 * heredoc, and this is the same hazard one layer further in — a literal that survives no round
 * trip belongs in exactly one place.
 */
const NL = String.fromCharCode(10);
const COMMENT_LINE = new RegExp('^\\s*(//|\\*|/\\*)');

const w76MembersOf = (text: string, anchor: string): string[] => {
  const at = text.indexOf(anchor);
  if (at < 0) throw new Error(`W76: anchor not found in source: ${anchor}`);
  const body = text.slice(at);
  const end = body.indexOf('\n}\n');
  if (end < 0) throw new Error(`W76: no closing brace for: ${anchor}`);
  return [...body.slice(0, end).matchAll(/^ {2}(?:readonly )?([a-zA-Z][a-zA-Z0-9]*)\??[:(]/gm)].map((m) => m[1] as string);
};
/** The quoted names inside a `Pick<DriverOptions, 'a' | 'b'>` type argument. */
const w76PickNames = (text: string, anchor: string): string[] => {
  const at = text.indexOf(anchor);
  if (at < 0) throw new Error(`W76: anchor not found in source: ${anchor}`);
  const tail = text.slice(at, at + 400);
  const close = tail.indexOf('>');
  if (close < 0) throw new Error(`W76: unterminated Pick in: ${anchor}`);
  return [...tail.slice(0, close).matchAll(/'([a-zA-Z][a-zA-Z0-9]*)'/g)].map((m) => m[1] as string);
};
/** `StartOptions`' whole membership — the `Pick` AND its own body (W76 finding B). */
const w76StartMembers = (runtimeSrc: string): string[] => {
  const anchor = 'export interface StartOptions extends Pick<DriverOptions,';
  return [...new Set([...w76PickNames(runtimeSrc, anchor), ...w76MembersOf(runtimeSrc, anchor)])].sort();
};

/**
 * **A consumer's GATE types, on the runtime's road** — [W93](../../doc/work-items/w93-what-a-gate-does-in-a-run.md),
 * ADR 0067. Gate types are CODE with no document entry, so `RegistryCode.gateTypes` is where a runtime consumer hands
 * them over; the runtime holds them to `GateType` where it is BUILT and hands them to every driver it starts or
 * resumes as `registry.gateTypes`. `pick` routes to its NON-default route only when the key says so, so a run that
 * reaches `toB` is one whose gate was decided by the consumer's `fn` and by nothing else.
 */
const pickGate: GateType = { routes: ['a', 'b'], defaultRoute: 'a', fn: (ctx) => (ctx.key === 'go-b' ? 'b' : 'a') };
const GATED: FlowDefinition = {
  flowId: 'gated', version: 1, entry: 'a',
  nodes: [
    { id: 'a', kind: 'task', type: 'Scorer', settings: { factor: 1 }, edges: [{ to: 'g' }] },
    { id: 'g', kind: 'gate', type: 'pick', settings: { key: 'k' }, edges: [{ to: 'toA' }, { route: 'b', to: 'toB' }] },
    { id: 'toA', kind: 'task', type: 'Scorer', settings: { factor: 1 }, edges: [{ to: 'done' }] },
    { id: 'toB', kind: 'task', type: 'Scorer', settings: { factor: 1 }, edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

suite('W93 — a consumer`s GATE types reach every driver the runtime starts or resumes, and a malformed one is refused where the runtime is built', (test) => {
  test('code.gateTypes IS runtime.registry.gateTypes, and a started run`s gate is decided by the consumer`s fn', () => {
    const s = seams();
    const code = { gateTypes: { pick: pickGate } };
    const r = createRuntime(DOC, code, { createPool: s.createPool, createScheduler: s.createScheduler });
    ok(r.registry.gateTypes === code.gateTypes, 'the object the consumer handed over, as the registry every driver is handed (decision 14)');
    const { driver } = r.start(GATED, {}, { runId: 'g1' });
    s.settle('g1:a:-:0', { k: 'go-b' });
    equal(s.added.map((t) => t.id), ['g1:a:-:0', 'g1:toB:-:0'], 'the gate took `b`, its NON-default route — only the consumer`s fn chooses it');
    equal(driver.foldInputs().flatMap((i) => (i.kind === 'gated' ? [[i.gateId, i.route, i.key]] : [])), [['g', 'b', 'go-b']], 'and recorded the decision');
  });

  test('absent code.gateTypes: the built-ins alone — a flow naming a consumer type is FD-V39 at start', () => {
    const s = seams();
    const r = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    equal('gateTypes' in r.registry, false, 'the registry carries no gateTypes key when the code supplies none — absent means the built-ins');
    throws(() => r.start(GATED, {}), 'FD-V39', 'so "pick" is an unregistered gate type at new Driver');
  });

  test('a consumer type named as a built-in, or not a GateType, is refused at createRuntime — before any run', () => {
    const s = seams();
    let err: unknown;
    try { createRuntime(DOC, { gateTypes: { pick: pickGate, distinct: pickGate } }, { createPool: s.createPool, createScheduler: s.createScheduler }); } catch (e) { err = e; }
    ok(err instanceof NameCollision, `a gate type named as a built-in: ${String(err)}`);
    err = undefined;
    try { createRuntime(DOC, { gateTypes: { pick: { ...pickGate, routes: [] } } }, { createPool: s.createPool, createScheduler: s.createScheduler }); } catch (e) { err = e; }
    ok(err instanceof GateTypeRefused, `a value that is not a GateType: ${String(err)}`);
    equal(s.built.length, 0, 'and no scheduler was built — refused where the runtime is built, not on a first start');
  });

  test('runtime.resume carries them too — the replay re-asks the consumer`s fn, and without it the resume is refused FD-V39', () => {
    const s = seams();
    const code = { gateTypes: { pick: pickGate } };
    const r = createRuntime(DOC, code, { createPool: s.createPool, createScheduler: s.createScheduler });
    const { driver } = r.start(GATED, {}, { runId: 'g2' });
    s.settle('g2:a:-:0', { k: 'go-b' });
    const cp = driver.checkpoint();
    const s2 = seams();
    const r2 = createRuntime(DOC, code, { createPool: s2.createPool, createScheduler: s2.createScheduler });
    const { driver: resumed } = r2.resume(GATED, cp);
    equal(resumed.foldInputs().flatMap((i) => (i.kind === 'gated' ? [i.route] : [])), ['b'], 'the replay regenerated the gate`s answer through the same fn, unrefused');
    equal(s2.added.map((t) => t.id), ['g2:toB:-:0'], 'and re-dispatched what was in flight — the task the route led to');
    const s3 = seams();
    const r3 = createRuntime(DOC, {}, { createPool: s3.createPool, createScheduler: s3.createScheduler });
    throws(() => r3.resume(GATED, cp), 'FD-V39', 'a runtime without the type cannot resume a run its gate decided');
  });
});

suite('W76 — StartOptions and start() are two lists, and nothing compared them', (test) => {
  const membersOf = w76MembersOf;
  const pickNames = w76PickNames;
  const sorted = (xs: readonly string[]) => [...new Set(xs)].sort();

  /** Everything this suite derives from the two source files, read once per case. */
  async function surfaces() {
    const runtime = await readText(ROOT + 'src/scheduler/runtime.ts');
    const driver = await readText(ROOT + 'src/driver/driver.ts');
    const startAt = runtime.indexOf('const driver = new Driver(flow, {');
    if (startAt < 0) throw new Error('W76: the `new Driver` literal inside start() was not found');
    const litEnd = runtime.indexOf('driver.start(payload);', startAt);
    if (litEnd < 0) throw new Error('W76: the end of start() was not found');
    const literal = runtime.slice(startAt, litEnd);
    // **W89 moved the literal into `openRun`**, the one function `start` AND `resume` build a driver
    // through (ADR 0065), so the signature this reads from is that function's and the literal's keys
    // sit two spaces shallower. Moved deliberately, with the item that moved them — this binding
    // went red naming both on W89's first run, which is its job.
    const sigAt = runtime.indexOf('function openRun(flow: FlowDefinition, payload: unknown, startOptions: StartOptions, from: Checkpoint | null): RunHandle {');
    if (sigAt < 0) throw new Error('W76: openRun()`s own signature was not found');
    return {
      /** The universe: every member of `DriverOptions`, from its own declaration. */
      all: membersOf(driver, 'export interface DriverOptions'),
      /** Road (a): the keys the `new Driver(…)` literal writes itself, as bare `name,` lines. */
      supplied: [...literal.matchAll(/^ {6}([a-zA-Z][a-zA-Z0-9]*),$/gm)].map((m) => m[1] as string),
      /** Road (b). */
      registry: pickNames(runtime, 'export type RuntimeRegistry = Pick<DriverOptions,'),
      /**
       * **Road (c), and it is what `start` FORWARDS from `RuntimeOptions` — not `RuntimeOptions`
       * itself.** P20 fact 1 reads the whole interface and calls road (c) six, but **four of those
       * six are not `DriverOptions` members at all**: `base`, `flows`, `createPool` and
       * `createScheduler` are the runtime's own, and the plan's *"the runtime supplies two,
       * `RuntimeRegistry` carries six, `RuntimeOptions` carries six, `StartOptions` carries seven"*
       * is 21 slots over 18 members, which cannot be a partition. Derived from the forwarding lines
       * the road is **two** — `defaultRetryPolicy` and `validateBoundaries` — and 2 + 6 + 2 + 7 is
       * 17, with `onRegionEvent` the eighteenth and the orphan the fact is about. *The conclusion
       * was right and the table under it was not a partition* (W76 finding D).
       *
       * Reading it this way also makes the road a real binding rather than a superset: a
       * `DriverOptions` member added to `RuntimeOptions` and never spread would still be an orphan,
       * and reading the declaration would have hidden it.
       */
      runtimeOptions: [...literal.matchAll(/\.\.\.\(options\.([a-zA-Z][a-zA-Z0-9]*) !== undefined/g)].map((m) => m[1] as string),
      /** Road (d), and it is the INTERFACE rather than the `Pick` — W76 finding B. */
      startPick: pickNames(runtime, 'export interface StartOptions extends Pick<DriverOptions,'),
      startOwn: membersOf(runtime, 'export interface StartOptions extends Pick<DriverOptions,'),
      /**
       * **How `start` reaches each one — THREE roads since W77.** Conditionally spread, defaulted
       * with `??`, or COMPOSED: wrapped in the runtime's own callback which then calls the
       * consumer's. The third road arrived because ADR 0058's `done` needs `onFoldInput` and a
       * consumer may pass one too, so replacing it would silently drop theirs — and this binding
       * FIRED by name on W77's first run (`expected: [] actual: ["onFoldInput"]`), which is W76's
       * Outputs (2) doing exactly what it was built for.
       */
      spreads: [...literal.matchAll(/\.\.\.\(startOptions\.([a-zA-Z][a-zA-Z0-9]*) !== undefined/g)].map((m) => m[1] as string),
      defaulted: [...runtime.slice(sigAt, litEnd).matchAll(/startOptions\.([a-zA-Z][a-zA-Z0-9]*) \?\?/g)].map((m) => m[1] as string),
      composed: [...literal.matchAll(/startOptions\.([a-zA-Z][a-zA-Z0-9]*)\?\.\(/g)].map((m) => m[1] as string),
    };
  }

  /**
   * **The extraction's own positive control.** Every assertion below is a set difference, and a
   * regex that matched NOTHING makes most of them vacuously true — rule 7 (b) one layer in, and
   * W47's *a harness can produce a verdict having run nothing*. These names are in their lists by
   * construction rather than by choice: `runId` and `scheduler` are the two the runtime must supply
   * (`ID-R3`, P18 decision 10), `predicates` is what makes a decision route at all, `base` is what
   * a relative worker url resolves against, and `onRegionEvent` is the member this item exists for.
   */
  test('the extraction is not vacuous — each derived list carries a name that is in it by construction', async () => {
    const s = await surfaces();
    ok(s.all.includes('runId') && s.all.includes('scheduler') && s.all.includes('onRegionEvent'),
      `DriverOptions read from the shipped source: ${s.all.length} members`);
    equal(sorted(s.supplied), ['runId', 'scheduler'], 'road (a): the two the runtime supplies, and nothing else');
    ok(s.registry.includes('predicates'), 'road (b) carries predicates — decision 14');
    equal(sorted(s.runtimeOptions), ['defaultRetryPolicy', 'validateBoundaries'],
      'road (c) is what start FORWARDS from RuntimeOptions, which is TWO — not the interface`s five (six until W162 removed `flows`), three of which are not DriverOptions members (W76 finding D)');
    ok(s.startPick.includes('onRegionEvent'), 'road (d) carries onRegionEvent — Q297, and this item');
    equal(s.startOwn, ['runId'], 'and StartOptions declares exactly one member in its own body');
    ok(s.spreads.length > 0 && s.defaulted.length > 0 && s.composed.length > 0,
      'start() reaches members by all THREE roads — a road whose regex matched nothing would make the set differences below vacuously true');
  });

  /**
   * **Q297, and fact 1's partition with the residue gone.** A `createRuntime` consumer reaches a
   * `DriverOptions` member by exactly four roads. Before this item the partition had ONE residue,
   * `onRegionEvent`, and it was the UNIQUE one — *not a judgement about which callbacks are worth
   * carrying, but the leftover of a partition that is otherwise total.* Set equality BOTH ways, so
   * that a nineteenth member added to `DriverOptions` and reached by nothing fails HERE, naming
   * itself, rather than becoming a second Q297 in silence.
   */
  test('every DriverOptions member is reachable from createRuntime — ORPHAN COUNT 0, both ways', async () => {
    const s = await surfaces();
    const reached = sorted([...s.supplied, ...s.registry, ...s.runtimeOptions, ...s.startPick, ...s.startOwn]);
    const universe = sorted(s.all);
    equal(reached.filter((n) => !universe.includes(n)), [],
      'nothing the four roads carry is missing from DriverOptions — the direction that catches a renamed member');
    equal(universe.filter((n) => !reached.includes(n)), [],
      'and NO DriverOptions member is unreachable from createRuntime: that is Q297`s whole shape, and W76 is where the count went to zero');
    // The COUNT stays BESIDE the membership rather than replacing it (`doc/workflow.md` rule 8
    // obligation (d) at v0.14): the membership above cannot see an extraction that silently found
    // three members instead of eighteen, because three reachable members also have no residue.
    // **19 since [W80](../../doc/work-items/w80-what-a-run-time-result-check-is.md)**, moved
    // here in the same diff as the two roads that carry it: `onNonconformingResult` is
    // `OR-R13`'s switch and a per-RUN diagnostic, so it joins `StartOptions`' `Pick` and
    // `start`'s conditional spread. **This pin and the orphan clause above BOTH fired by name
    // when it arrived**, which is what the pin is for. *(This said *both clauses above*, meaning
    // the two set differences — but only the second of those can fire for a member added to
    // `DriverOptions` and not yet on a road, and this change added the road in the same edit, so
    // neither did. W80's conformity reader, finding 10.)*
    // **20 since [W93](../../doc/work-items/w93-what-a-gate-does-in-a-run.md)**: `gateTypes`, the consumer's gate types,
    // on road (b) — `RuntimeRegistry` — because they are CODE registered once per runtime, as `languages` are. This pin
    // FIRED by name on W93's first run (`expected: 19 actual: 20`) and the orphan clause did not, because the road was
    // added in the same edit — moved here deliberately, with the road.
    // **21 since [W185](../../doc/work-items/w185-the-header-before-the-first-event.md)**: `onHeader` (`RN-R39`, ADR 0112,
    // P36 (d)) on road (d), `StartOptions`' `Pick`, conditionally spread. This pin FIRED by name on W185's first run
    // (`expected: 20 actual: 21`, its declaration step, `src/` changed and no test touched) and the orphan clause did not,
    // because the road was added in the same edit — moved here deliberately, with the road.
    // **23 since [W187](../../doc/work-items/w187-attribution-on-the-fold-and-messages-passed-through.md)**: `onTaskMessage`
    // and `onTaskProgress` (`RN-R42`, ADR 0114, P36 (k)) on road (d), conditionally spread. This pin FIRED by name on W187's
    // declaration step (`expected: 21 actual: 23`, `src/` changed and no test touched) and the orphan clause did not — moved
    // here deliberately, with the road.
    equal(s.all.length, 23, 'DriverOptions has twenty-three members — the eighteen P20 fact 1 counted, W80`s, W93`s gateTypes, W185`s onHeader and W187`s onTaskMessage and onTaskProgress. Move this deliberately, with the roads');
  });

  /**
   * **The two hand-written lists, compared BOTH WAYS — this item's Outputs (2).** P20 fact 2 p1
   * measured the first direction FREE and p3 measured the second bound only by a consumer's own
   * typecheck. *You could widen the list silently; you could not narrow it.* Now neither.
   */
  test('every StartOptions member is REACHED by start, and everything start reaches is DECLARED', async () => {
    const s = await surfaces();
    const declared = sorted([...s.startPick, ...s.startOwn]);
    const reached = sorted([...s.spreads, ...s.defaulted, ...s.composed]);
    equal(declared.filter((n) => !reached.includes(n)), [],
      'a name in StartOptions that start() never reads is a typed option silently dropped — P20 fact 2 p1, green on all four rungs before this item');
    equal(reached.filter((n) => !declared.includes(n)), [],
      'and a name start() reads that StartOptions does not declare is a forward no caller can type');
  });

  /**
   * **Exactly one road each, and the `??` road is DERIVED.** P20 decision 5 expected ONE legitimate
   * spread-less member and named `joinPolicy`; the measurement found TWO, because `runId` is the
   * same shape one declaration site over. Asserting *exactly one of the two roads* rather than
   * *`joinPolicy` is exempt* is what keeps the first clause from being an exception list with one
   * entry, and a member on BOTH — a spread that would overwrite a computed default — fails it.
   *
   * **The second clause is a PIN and not a derivation, and it is deliberate.** Moving a member
   * between the roads — `now` written `startOptions.now ?? (() => Date.now())`, which is the
   * driver's own default and is behaviourally identical — fails here and must be done
   * deliberately. That is [Q102](../../doc/questions/q102.md)'s ratchet shape, and it is what
   * catches a behaviour-preserving move that nothing else in the suite can see. *An earlier
   * version of this comment claimed such a move "still passes, which is right"; W76's adequacy
   * reader measured it FALSE and its conformity reader derived the same thing by reading — the
   * only subject the two shared.*
   */
  /**
   * **P20 decision 2, made FALSIFIABLE — and its own sentence says to try.** *"`done` resolves from
   * `fold(inputs)` and `isTerminal` … An item that reimplements either has broken this decision, and
   * that is the sentence its adequacy reader should try to falsify first."* W77's adequacy reader
   * falsified it: inlining `isTerminal`'s body into the runtime (`state.outcome !== 'running' &&
   * state.outcome !== 'awaiting_action'`) cost **ZERO**, and so did computing `done` from
   * `fold(driver.foldInputs())` instead of stepping — which would make the headline invariant one
   * route compared with itself.
   *
   * Neither is reachable behaviourally: a copied predicate agrees with the original until
   * `RunOutcome` gains a member, and a re-folding mechanism is behaviourally identical by `RN-R2`
   * (rule 8's `b3` measures exactly that, and it is a declared ceiling for it). **What separates
   * them is retention and time, which no rung here weighs** — so the binding is over the SOURCE,
   * beside the two lists it already reads, and it is a second observer rather than a better probe
   * (obligation (c)'s LIMIT).
   */
  /**
   * **Every type `runtime.ts` DECLARES is re-exported by the sub-path — both ways.** W77's
   * conformity reader, finding 1: `RunHandle` — this item's headline type, the thing `start`
   * RETURNS — shipped declared and unexported, so `import type { RunHandle } from
   * 'fyflow-orchestration/scheduler'` resolved to nothing. The sub-path's type export is an explicit
   * ALLOWLIST rather than an `export *`, which makes it `doc/workflow.md` rule 8 obligation (e)'s
   * third shape — *a LIST is a claim about another list* — with the procedure *find the other list
   * and compare BOTH WAYS*.
   *
   * **Nothing else can see it, and the reason is structural**: a `export type` is erased, so the
   * existing export case (which compares `Object.keys(module)`) is blind to it by construction, and
   * so is every typechecker — an absent export is not an error anywhere. *Q297's own shape one layer
   * over: the thing the seam produces, unreachable on the road `AGENTS.md` recommends.*
   *
   * **Writing this found a SECOND instance the reader had not**: `RuntimeRegistry` was missing too,
   * and it is the type P18 decision 14's road needs — the object a consumer spreads into
   * `new Driver(…)` by hand. *A list bound to nothing is wrong more than once.*
   */
  test('every type the sub-path`s modules declare is re-exported by it, all three, both ways', async () => {
    const index = await readText(ROOT + 'src/scheduler/index.ts');
    /** Each module the sub-path re-exports types from, and what it DECLARES against what it re-exports. */
    const MODULES = ['runtime.ts', 'bootstrap.ts', 'envelope-worker.ts'] as const;
    const seen: string[] = [];
    for (const mod of MODULES) {
      const src = await readText(ROOT + 'src/scheduler/' + mod);
      const declared = [...src.matchAll(/^export (?:interface|type) ([A-Za-z][A-Za-z0-9]*)/gm)].map((m) => m[1] as string).sort();
      const line = index.split(NL).find((l) => l.startsWith('export type {') && l.includes("'./" + mod + "'"));
      ok(line !== undefined, `the sub-path re-exports types from ./${mod} at all`);
      const inBraces = (line as string).slice((line as string).indexOf('{') + 1, (line as string).indexOf('}'));
      const reExported = [...inBraces.matchAll(/([A-Za-z][A-Za-z0-9]*)/g)].map((m) => m[1] as string).sort();
      // the CONTROL, per module: both lists are real, so the set differences are not vacuously empty
      ok(declared.length > 0 && reExported.length > 0,
        `${mod}: declares ${declared.length} type(s) and the sub-path re-exports ${reExported.length}`);
      equal(declared.filter((n) => !reExported.includes(n)), [],
        `a type ${mod} declares and the sub-path does not re-export is a type no consumer can NAME — ` +
        'which is what `RunHandle`, `RuntimeRegistry` AND `BootstrapRegistry` all were, the last being the first parameter type of `bootstrap` itself');
      equal(reExported.filter((n) => !declared.includes(n)), [],
        `and a name the sub-path re-exports that ${mod} does not declare would not resolve at all`);
      seen.push(mod);
    }
    // the loop's own membership: a module dropped from MODULES takes its comparison with it
    equal(seen, ['runtime.ts', 'bootstrap.ts', 'envelope-worker.ts'],
      'and all three modules were compared — a module that leaves this list fails here naming itself');
  });

  test('the runtime CALLS `isTerminal` and keeps the fold`s own accumulator rather than reimplementing either — P20 decision 2, W196', async () => {
    const runtime = await readText(ROOT + 'src/scheduler/runtime.ts');
    const at = runtime.indexOf('const driver = new Driver(flow, {');
    const from = runtime.indexOf('const runId = startOptions.runId');
    ok(from >= 0 && at > from, 'the `done` machinery sits between the minted runId and the `new Driver` literal');
    // **Comment lines are stripped before any of this is read.** The first version of this case
    // went RED on the machinery's own PROSE, which quotes `foldInputs()` while explaining why the
    // mechanism does not call it — W25's *a comment that quotes the code it explains makes that
    // code unmutatable*, here in the mirror direction: it made correct code unreadable.
    const machinery = runtime.slice(from, runtime.indexOf('driver.start(payload);', at))
      .split(NL).filter((l) => !COMMENT_LINE.test(l)).join(NL);
    ok(/\bisTerminal\(/.test(machinery),
      'the terminality predicate is CALLED, not copied — a copy agrees with the original until `RunOutcome` gains a member, and nothing behavioural can see that');
    ok(!/outcome\s*!==\s*['"]running['"]/.test(machinery),
      'and `isTerminal``s BODY does not appear here: inlining it cost ZERO on every rung (W77`s adequacy reader, BLOCKING 4)');
    // **W196, ADR 0122**: the kept prefix is the fold's ONE accumulator held OPEN (`RN-R43`) — W194's class, the very
    // definition `fold` runs — where until W196 it was one `RunState` `step`ped per input (O(run) a step since W194).
    ok(/\bAccumulator\.load\(/.test(machinery) && /\bacc\.apply\(/.test(machinery),
      'and the mechanism keeps the FOLD`S OWN accumulator and applies each input to it — `fold` is this, and RN-R2 is what licenses keeping it');
    ok(!/\bstep\(/.test(machinery),
      'and it does not STEP: a step loads and materialises the whole state, O(run) per input (RN-R43) — W196`s whole point');
    ok(!/\bfoldWith\(|\bfold\(/.test(machinery),
      'nor re-fold: a fold per input is the same O(run) per input by another road');
    ok(!/foldInputs\(\)/.test(machinery),
      'and it does NOT read `driver.foldInputs()`: if it did, the headline invariant would be one route compared with itself rather than two ' +
      '(W77`s adequacy reader, BLOCKING 3 — measured at ZERO failures)');
  });

  test('each StartOptions member reaches the driver by EXACTLY ONE of the three roads', async () => {
    const s = await surfaces();
    const both = (a: readonly string[], b: readonly string[]) => a.filter((n) => b.includes(n));
    equal(both(s.spreads, s.defaulted), [],
      'no member is both conditionally spread and `??`-defaulted — the second would silently win over the first');
    equal(both(s.spreads, s.composed), [],
      'and none is both spread and COMPOSED — the spread would overwrite the wrapper, so the consumer`s callback would be the only one called and `done` would never settle');
    equal(both(s.defaulted, s.composed), [],
      'and none is both `??`-defaulted and composed');
    equal(sorted(s.defaulted), ['joinPolicy', 'runId'],
      'the `??` road has TWO members, not the one P20 decision 5 named: runId is the same shape a declaration site over (W76 finding B)');
    equal(sorted(s.composed), ['onFoldInput'],
      'and the COMPOSED road has exactly one: `onFoldInput`, which ADR 0058 needs for `done` and which a consumer may also pass. ' +
      'A second member arriving here is a second callback the runtime has taken over, and that is a decision, not a refactor');
  });
});

/**
 * **W76 Outputs (4) — the SECOND observer, because the suite above is two regexes over one text.**
 * `doc/workflow.md` rule 8 obligation (c)'s LIMIT: *when the compound probe is green, count the
 * observers; at one, the fix is a second independent expression over the same fact.* The suite above
 * says the LIST is complete; this one says each member ARRIVES, by running a real `Driver` on the
 * recorded pool seam and watching the thing that option does. Neither is downstream of the other:
 * re-sourcing the text comparison leaves these live, and deleting a forwarding line fails both.
 *
 * **The observer set is bound to the TYPE, both ways**, so a `StartOptions` member added later
 * cannot arrive with no behavioural observer — which is W66's adequacy reader's finding (*every
 * option start forwards was forwarded by the code and observed by nothing*) closed as a MEMBERSHIP
 * rather than as five more cases.
 */
suite('W76 — every StartOptions member ARRIVES at the driver, and the observer set is the type`s', (test) => {
  const DOCUMENT = {
    workers: {
      w: { url: 'https://example.test/w.js' },
      // **W80** — a worker that DECLARES what it returns, so `onNonconformingResult`
      // has something to report. Additive: every observer above runs on type `T`, whose
      // worker declares nothing and is therefore UNCHECKED either way (P18 decision 3).
      wChecked: {
        url: 'https://example.test/checked.js',
        outputSchema: { type: 'object', required: ['score'], properties: { score: { type: 'integer' } } },
      },
    },
    nodeTypes: { T: { worker: 'w', inline: true }, TChecked: { worker: 'wChecked', inline: true } },
    predicates: [],
  } as unknown as RegistryDocument;

  const LINEAR = {
    flowId: 'lin', version: 1, entry: 'a',
    nodes: [
      { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition;
  /** Two branches, so a region OPENS and ARRIVES — the topology that produces region events. */
  const FANOUT = {
    flowId: 'fan', version: 1, entry: 'a',
    nodes: [
      { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'fanout', branches: ['b', 'c'] },
      { id: 'b', kind: 'task', type: 'T', edges: [{ to: 'j' }] },
      { id: 'c', kind: 'task', type: 'T', edges: [{ to: 'j' }] },
      { id: 'j', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition;
  /** W80 — one task whose worker declares an `outputSchema` the loop's settlement value fails. */
  const CHECKED = {
    flowId: 'chk', version: 1, entry: 'a',
    nodes: [
      { id: 'a', kind: 'task', type: 'TChecked', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition;
  /** `over` names a key the entry's result carries as a NUMBER — `UnresolvedMapArity`, W33. */
  const BAD_MAP = {
    flowId: 'badmap', version: 1, entry: 'a',
    nodes: [
      { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'm' }] },
      { id: 'm', kind: 'map', over: 'items', branch: 'b' },
      { id: 'b', kind: 'task', type: 'T', edges: [{ to: 'j' }] },
      { id: 'j', kind: 'join', of: 'm', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition;

  /** A policy whose region can never fire — the one shape that reaches `onUnsatisfiableJoin`. */
  const deadJoin = {
    id: 'w76-dead-join',
    open: () => ({}),
    step: (state: object) => state,
    status: () => 'unsatisfiable' as const,
    describe: () => ({ w76: true }),
  };

  interface Observer {
    option: StartOptions;
    flow: FlowDefinition;
    /** Anything that must happen AFTER every dispatched task has settled. */
    drive: (s: ReturnType<typeof seams>) => void;
    saw: (d: Driver) => unknown;
    want: unknown;
  }

  /**
   * One observer per `StartOptions` member: the option to pass, and what running a real `Driver`
   * with it does that running one without it does not. **Each reports the thing it SAW**, so a
   * forwarding line deleted leaves the observer empty and the case fails naming the member.
   */
  const OBSERVERS: Record<string, (s: ReturnType<typeof seams>) => Observer> = {
    runId: () => ({
      option: { runId: 'w76-mine' }, flow: LINEAR, drive: () => {},
      saw: (d) => d.runId, want: 'w76-mine',
    }),
    createTask: (s) => ({
      option: { createTask: (c) => ({ ...(c as unknown as Record<string, unknown>), W76: 'mark' }) as never },
      flow: LINEAR, drive: () => {},
      saw: () => (s.added[0] as { W76?: string } | undefined)?.W76, want: 'mark',
    }),
    joinPolicy: () => {
      const opened: string[] = [];
      const counting = { ...liveToken, open: (r: never) => { opened.push('open'); return liveToken.open(r); } } as typeof liveToken;
      return {
        option: { joinPolicy: counting }, flow: FANOUT, drive: () => {},
        saw: () => opened.length > 0, want: true,
      };
    },
    onFoldInput: () => {
      const kinds: string[] = [];
      return {
        option: { onFoldInput: (i: FoldInput) => { kinds.push(i.kind); } }, flow: LINEAR, drive: () => {},
        saw: () => kinds.length > 0, want: true,
      };
    },
    // **W185, `RN-R39`** — what the driver hands `onHeader` is ITS header, once: forwarded, the one call carries the
    // driver's own checkpoint header; dropped, nothing is seen. Start-only: `ResumeOptions` omits it (`RESUME_OMITS`).
    onHeader: () => {
      const seen: unknown[] = [];
      return {
        option: { onHeader: (h) => { seen.push(h); } }, flow: LINEAR, drive: () => {},
        saw: (d) => ({ calls: seen.length, isTheDrivers: seen.length === 1 && deepEqual(seen[0], d.checkpoint().header) }),
        want: { calls: 1, isTheDrivers: true },
      };
    },
    // **W187, `RN-R42`** — a worker's `context.emit()` of the run's own task, as the scheduler fires it (`taskId`, no `id`):
    // forwarded, the callback is handed it with the node's id as a FIELD; dropped, the driver never subscribed and sees nothing.
    onTaskMessage: () => {
      const seen: string[] = [];
      return {
        option: { onTaskMessage: (m) => { seen.push(`${m.nodeId} ${m.name} ${m.seq}`); } }, flow: LINEAR,
        drive: (s) => {
          s.emit('task.message', { taskId: String(s.added[0]!.id), workerId: 'w-1', attemptNumber: 1, name: 'log', data: { line: 1 }, seq: 0, timestamp: 1 });
        },
        saw: () => seen, want: ['a log 0'],
      };
    },
    // **W187, `RN-R42`** — a progress report of the run's own task, its detail the task SPREAD FLAT (`id`, as the scheduler's).
    onTaskProgress: () => {
      const seen: string[] = [];
      return {
        option: { onTaskProgress: (p) => { seen.push(`${p.nodeId} ${p.progress}`); } }, flow: LINEAR,
        drive: (s) => {
          s.emit('task.progress', { ...s.added[0]!, attemptNumber: 1, progress: 0.5, message: 'half', details: null, workerId: 'w-1', workerType: 'inline', timestamp: 1 });
        },
        saw: () => seen, want: ['a 0.5'],
      };
    },
    onRegionEvent: () => {
      const types: string[] = [];
      const frozen: boolean[] = [];
      return {
        // **Q297, and this item's reason for existing.** Before W76 this callback reached the driver
        // by NO road at all, so `types` came back empty on the one topology that produces region
        // events. The expected values are W76's declaration-step measurement of the same two-branch
        // fanout on a hand-built driver (`dev-dist/w76/decl-before.txt`): two opens and two
        // arrivals, every one FROZEN — `OR-R7` and [Q73](../../doc/questions/q73.md) at the seam,
        // which this item inherits rather than re-establishes because the driver already does it.
        option: { onRegionEvent: (e) => { types.push(e.type); frozen.push(Object.isFrozen(e)); } },
        flow: FANOUT, drive: () => {},
        saw: () => ({ types: [...new Set(types)].sort(), count: types.length, allFrozen: frozen.length > 0 && frozen.every(Boolean) }),
        want: { types: ['branch.arrived', 'branch.opened'], count: 4, allFrozen: true },
      };
    },
    // `now`'s value reaches the fold's records as `observedAt`, so this reads it back through
    // `onFoldInput`. That makes this one observer's claim ride on another option's road, which is
    // stated rather than hidden: if `onFoldInput`'s forwarding went, THIS case would go too — and
    // `onFoldInput` has its own case above, so the pair cannot both pass on one broken forward.
    onRunFailure: () => {
      const kinds: string[] = [];
      return {
        option: { onRunFailure: (f) => { kinds.push(f.kind); } }, flow: BAD_MAP, drive: () => {},
        saw: () => kinds.length > 0, want: true,
      };
    },
    onUnsatisfiableJoin: () => {
      const seen: string[] = [];
      return {
        option: { joinPolicy: deadJoin as never, onUnsatisfiableJoin: (i) => { seen.push(i.policyId); } },
        flow: FANOUT, drive: () => {},
        saw: () => seen, want: ['w76-dead-join'],
      };
    },
    onUnmintedTask: () => {
      // `unknown[]`, because `UnmintedTask.taskId` is deliberately `unknown`: a `detail` with no
      // `id` at all is one of the ways `ID-R5` fires, and reporting `''` for it would hide the
      // sharpest case. Narrowing it here would be this suite disagreeing with the surface it reads.
      const seen: unknown[] = [];
      return {
        option: { onUnmintedTask: (i) => { seen.push(i.taskId); } }, flow: LINEAR,
        // An id no driver minted, settled on the shared scheduler — `ID-R5`, ADR 0027.
        drive: (s) => { s.settle('nightly-cleanup', { ok: true }); },
        saw: () => seen, want: ['nightly-cleanup'],
      };
    },
    onNonconformingResult: () => {
      // **W80, `OR-R13`.** The loop settles every dispatched task with `{ items: 7, ok: true }`,
      // which `wChecked`'s `outputSchema` refuses for a missing `score` — so what is read
      // back is the FINDING itself rather than a count, and a forwarding line deleted leaves
      // it empty.
      const seen: string[] = [];
      return {
        option: { onNonconformingResult: (f) => { seen.push(f.nodeId + '/' + f.worker + '/' + describeFindings(f.findings)); } },
        flow: CHECKED, drive: () => {},
        saw: () => seen, want: ['a/wChecked/$.score required'],
      };
    },
    now: () => {
      const at: number[] = [];
      return {
        option: {
          now: () => 424242,
          onFoldInput: (i: FoldInput) => { if (i.kind === 'outcome' || i.kind === 'resolution') at.push(i.record.observedAt); },
        },
        flow: LINEAR, drive: () => {},
        saw: () => [...new Set(at)], want: [424242],
      };
    },
  };
  /** The `StartOptions` members `ResumeOptions` OMITS — held to the source's `Omit` by the last case of this suite. */
  const RESUME_OMITS: readonly string[] = ['runId', 'onHeader'];

  /**
   * **The membership, both ways** — `doc/workflow.md` rule 8 obligation (d) at v0.14: the list above
   * is a claim about `StartOptions`, and a member added there with no observer here would leave this
   * suite passing on a smaller surface. Derived from the shipped source, as the suite above is.
   */
  test('the observer list IS StartOptions` membership — a member with no behavioural observer fails here', async () => {
    const src = await readText(ROOT + 'src/scheduler/runtime.ts');
    const members = w76StartMembers(src);
    // The extraction's own control, because every assertion below it is a set comparison and an
    // empty derivation satisfies most of them by construction.
    ok(members.includes('onRegionEvent') && members.includes('runId'), `StartOptions read from the shipped source: ${members.join(', ')}`);
    equal(members, Object.keys(OBSERVERS).sort(),
      'every StartOptions member has a behavioural observer below, and every observer names a real member');
  });

  for (const name of Object.keys(OBSERVERS)) {
    test(`${name} reaches the driver start() built`, () => {
      const s = seams();
      const o = OBSERVERS[name]!(s);
      const r = createRuntime(DOCUMENT, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
      const { driver: d } = r.start(o.flow, { items: 7 }, o.option);
      // Settle every task the driver dispatches, in the order it dispatched them, so a fanout
      // reaches its join and a map reaches its arity refusal. `added` grows as the run advances.
      for (let i = 0; i < s.added.length && i < 20; i += 1) s.settle(String(s.added[i]!.id), { items: 7, ok: true });
      o.drive(s);
      equal(o.saw(d), o.want, `${name}: what the driver did with the option start() forwarded`);
    });
  }

  // **W89 — and the SAME member reaches the driver `resume()` built** (`RN-R25`). `resume` builds its
  // driver through the one literal `start` does (`openRun`), and this is the behavioural half of that
  // claim: each observer again, on a run RESUMED from a checkpoint whose header a real run on another
  // runtime handed out and whose events are EMPTY — a store that kept the header and lost every
  // element, which replays from the entry and delivers every element, so each observer sees exactly
  // the run `start` gave it. `runId` is not a `ResumeOptions` member: the run's id is the header's — and since W185 nor is
  // `onHeader` (`RN-R39`, P36 (d)): the resume's caller holds the header already. `RESUME_OMITS` is held to the `Omit` in
  // the source by the membership case below, both ways.
  for (const name of Object.keys(OBSERVERS).filter((n) => !RESUME_OMITS.includes(n))) {
    test(`${name} reaches the driver resume() built`, () => {
      const s = seams();
      const o = OBSERVERS[name]!(s);
      const header = createRuntime(DOCUMENT, {}, { createPool: seams().createPool, createScheduler: seams().createScheduler })
        .start(o.flow, { items: 7 }).header;
      const r = createRuntime(DOCUMENT, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
      const { runId: _omitted, ...option } = o.option as StartOptions;
      const { driver: d } = r.resume(o.flow, { header, events: [] }, option);
      for (let i = 0; i < s.added.length && i < 20; i += 1) s.settle(String(s.added[i]!.id), { items: 7, ok: true });
      o.drive(s);
      equal(o.saw(d), o.want, `${name}: what the driver did with the option resume() forwarded`);
    });
  }

  // **The loop above is a membership over `StartOptions` minus what `ResumeOptions` omits, and it is bound as one** —
  // `doc/workflow.md` rule 8 obligation (d): filtered to nothing, it registers no case and every case
  // it would have run is silent. So the cases that REGISTERED are compared with the members, both ways — and since W185
  // the FILTER is a list too (`RESUME_OMITS`), so it is compared with the `Omit` the source declares, both ways: a name
  // added to the `Omit` and not here would register an observer for a member resume() no longer takes, and one here and
  // not in the `Omit` would leave a member resume() takes with none.
  test('every StartOptions member ResumeOptions keeps has a resume() observer that registered — the Omit read from the source', async () => {
    const src = await readText(ROOT + 'src/scheduler/runtime.ts');
    const omitted = w76PickNames(src, 'export type ResumeOptions = Omit<StartOptions,').sort();
    equal(omitted, [...RESUME_OMITS].sort(), 'RESUME_OMITS is what ResumeOptions` Omit names — runId and, since W185, onHeader');
    const members = w76StartMembers(src).filter((n) => !omitted.includes(n));
    const suffix = ' reaches the driver resume() built';
    const registered = collected().flatMap((x) => x.cases.map((c) => c.name)).filter((n) => n.endsWith(suffix)).map((n) => n.slice(0, -suffix.length)).sort();
    ok(members.length >= 9, `the CONTROL: StartOptions minus the Omit read from the shipped source, ${members.length} members`);
    equal(registered, members, 'one registered resume() observer per ResumeOptions member, and none for a name that is not one');
  });
});

/**
 * **W76, the ADEQUACY reader's central finding: the forwarding was bound at EXACTLY ONE SHAPE, and
 * the answer is an IDENTITY rather than more shapes.**
 *
 * `RegionEvent` has six variants and a region is a `fanout` or a `map`, at depth 1 or nested
 * (`doc/workflow.md` rule 8 obligation (a)'s shapes clause names this exact kind). Every observer
 * of the forwarding — the behavioural case above and `AGENTS.md` section 10 — ran ONE topology: a
 * two-branch `fanout` at depth 1 whose branches all arrive. So the forwarding could be narrowed
 * three ways for **zero** on `npm test`, `check:docs` and `typecheck`, each of them a consumer
 * being told they can watch a fan-out and silently never shown half of it:
 *
 * | | the narrowed forward | cost before this suite |
 * |---|---|---|
 * | m1 | only `branch.opened` and `branch.arrived` are passed on | **0 on all three rungs** |
 * | m2 | events whose `branchPath` is dotted — every NESTED region's — are dropped | **0 on all three** |
 * | m3 | only a `fanout` region's events are passed on, never a `map`'s | **0 on all three** |
 *
 * **Enumerating shapes would not have closed it**, because the enumeration is the author's and the
 * variants are the driver's. What closes it totally is the one claim the runtime actually owes:
 * **what `onRegionEvent` receives IS the region subsequence of what `onFoldInput` receives, element
 * for element, by IDENTITY.** [ADR 0014](../../doc/decisions/0014-the-driver-produces-the-folds-ordered-input-sequence.md)
 * rule 1 puts every region event into the fold's ordered sequence, so a forward that drops,
 * duplicates, reorders or substitutes an event fails whatever its variant, kind or depth.
 *
 * **It is VALUE equality and not identity, and that was measured rather than assumed.** The first
 * version of this suite asserted `===` on the reasoning that `emit()` freezes ONE copy and both
 * stores and hands out that same object (W12) — and it went RED on its first run: `freezeInput`
 * (`src/driver/driver.ts`) gives `onFoldInput` its own frozen copy, `{ ...i, event: Object.freeze({
 * ...i.event }) }`, so the two outbound paths hand out two different frozen objects carrying the
 * same event. *The claim survived and its stated mechanism did not*, which is why it is written
 * down here rather than quietly changed.
 *
 * **It is a second SOURCE and not a second call site** (P20 decision 2's shape, one option over):
 * the two lists arrive through two different `StartOptions` members, so neither is downstream of
 * the other's apparatus — and because both being empty would satisfy the equality vacuously, the
 * non-emptiness is asserted beside it, which is `doc/workflow.md` v0.18's *a membership names the
 * CONTROLS beside its claims*.
 *
 * It also closes the reader's **m17/m20** — the `count: 4` literal above had `AGENTS.md` section 10
 * as its only second observer, and section 10's count guard is inside this item's own declared
 * Q310 ceiling, so tautologising it and doubling the forwarding was green on both rungs. Doubling
 * is a length mismatch here and no literal is involved.
 */
suite('W76 — the forwarded stream IS the driver`s region stream, at every variant, kind and depth', (test) => {
  const DOCUMENT = {
    workers: { w: { url: 'https://example.test/w.js' } },
    nodeTypes: { T: { worker: 'w', inline: true } },
    predicates: [],
  } as unknown as RegistryDocument;

  /**
   * One flow carrying THREE shapes the one-topology observer could not reach: a `map` region
   * (m3), a region NESTED inside a fan-out branch so its `branchPath` is dotted (m2), and a branch
   * that leaves its region by an edge out of it rather than by arriving, which is `branch.exited`
   * and is a fourth variant (m1).
   */
  const SHAPES = {
    flowId: 'shapes', version: 1, entry: 'a',
    nodes: [
      { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'split' }] },
      // `FD-V9` requires a fan-out's branch ENTRY to be a task (or, since v0.42, an ask), so the map hangs off one rather
      // than being one — which is how `nested-map` in the corpus is shaped too.
      { id: 'split', kind: 'fanout', branches: ['pre', 'leaver'] },
      { id: 'pre', kind: 'task', type: 'T', edges: [{ to: 'm' }] },
      // branch 0: a MAP nested inside a fan-out branch — dotted branchPaths, a second region kind
      { id: 'm', kind: 'map', over: 'items', branch: 'item' },
      { id: 'item', kind: 'task', type: 'T', edges: [{ to: 'mj' }] },
      { id: 'mj', kind: 'join', of: 'm', edges: [{ to: 'j' }] },
      // branch 1: leaves the region for the end node instead of the join — `branch.exited`
      { id: 'leaver', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
      { id: 'j', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition;

  const FANOUT = {
    flowId: 'fan', version: 1, entry: 'a',
    nodes: [
      { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'fanout', branches: ['b', 'c'] },
      { id: 'b', kind: 'task', type: 'T', edges: [{ to: 'j' }] },
      { id: 'c', kind: 'task', type: 'T', edges: [{ to: 'j' }] },
      { id: 'j', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition;

  /** Run one flow through `runtime.start`, holding both streams, and settle every dispatch. */
  const both = (flow: FlowDefinition, payload: unknown) => {
    const s = seams();
    const forwarded: unknown[] = [];
    const folded: unknown[] = [];
    const frozen: boolean[] = [];
    const r = createRuntime(DOCUMENT, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    r.start(flow, payload, {
      onRegionEvent: (e) => { forwarded.push(e); frozen.push(Object.isFrozen(e)); },
      onFoldInput: (i) => { if (i.kind === 'region') folded.push(i.event); },
    });
    for (let i = 0; i < s.added.length && i < 40; i += 1) s.settle(String(s.added[i]!.id), { items: ['x', 'y'], ok: true });
    return { forwarded, folded, frozen };
  };

  for (const [name, flow, payload] of [
    ['a two-branch fan-out', FANOUT, { items: ['x', 'y'] }],
    ['a map NESTED in a fan-out branch, beside a branch that EXITS', SHAPES, { items: ['x', 'y'] }],
  ] as const) {
    test(`${name}: what onRegionEvent receives IS the region subsequence of onFoldInput, by identity`, () => {
      const { forwarded, folded, frozen } = both(flow, payload);
      // The CONTROL, and it is what stops the equality below holding on two empty lists — which is
      // how a run with both forwards deleted would otherwise pass this.
      ok(folded.length > 0, `the driver produced region events on this flow: ${folded.length}`);
      equal(forwarded.length, folded.length, 'the runtime forwarded exactly as many as the driver emitted — a dropped or duplicated event is a length');
      for (let i = 0; i < folded.length; i += 1) {
        ok(deepEqual(forwarded[i], folded[i]), `event ${i} is the one the fold received at the same position: ${JSON.stringify(forwarded[i])} against ${JSON.stringify(folded[i])}`);
      }
      ok(frozen.length > 0 && frozen.every(Boolean), 'and every one crossed the seam frozen — OR-R7 / Q73, inherited from the driver rather than re-established here');
    });
  }

  /**
   * The shapes the identity above is TOTAL over, asserted as a membership so that a flow which
   * silently stopped producing one of them would be visible. These are read from the RUN, never
   * written beside it — `doc/workflow.md` section 5 rule 1.
   */
  test('the second flow really does carry the three shapes the one-topology observer could not reach', () => {
    const { folded } = both(SHAPES, { items: ['x', 'y'] });
    const events = folded as { type: string; regionId: string; branchPath: string }[];
    ok(events.some((e) => e.branchPath.includes('.')), `a NESTED region's dotted branchPath occurs: ${[...new Set(events.map((e) => e.branchPath))].sort().join(' ')}`);
    equal([...new Set(events.map((e) => e.regionId))].sort(), ['m', 'split'],
      'two regions, and one of them is the MAP — the kind m3 could drop for zero');
    ok(events.some((e) => e.type === 'branch.exited'),
      `a variant beyond opened/arrived occurs: ${[...new Set(events.map((e) => e.type))].sort().join(' ')}`);
  });
});


/**
 * **W77 — what `start` RETURNS: `done`, and the invariant that makes the claim total.**
 * [ADR 0058](../../doc/decisions/0058-runtime-start-returns-a-completion-handle-the-runtime-keeps.md),
 * [P20](../../doc/plans/p20-what-the-runtime-owes-a-consumer.md) decisions 1 and 2,
 * [Q293](../../doc/questions/q293.md).
 *
 * **The invariant, and why it is asserted before the enumeration.** `done` quantifies over six run
 * outcomes, over a run already terminal when a handler is attached and one that is not, over both
 * region kinds and over a run with a person in the loop. Enumerating those would be the AUTHOR's
 * enumeration, which is the thing `doc/workflow.md` rule 8 (a)'s own clause says keeps failing —
 * and W76's sharpest finding was that the answer to a claim bound at one shape is *look for the
 * invariant the shapes are instances of before enumerating them*. Here it is:
 *
 * > **`await done` IS `fold(driver.foldInputs())` — the caller's own expression over the driver's
 * > own sequence — and it settles exactly when that value first becomes terminal.**
 *
 * That is total over outcome, over topology and over pool kind, because it names none of them. It
 * is also a SECOND ROUTE rather than a second call site, which is obligation (c)'s LIMIT: the
 * runtime `step`s a prefix it keeps, and this folds the whole sequence the DRIVER keeps, so
 * re-sourcing either leaves the other live. *(`RN-R2` is the rule that says the two must agree —
 * "folding `n` then applying record `n+1` equals folding `n+1`" — so a disagreement here is a
 * `RN-R2` failure and not a rounding error.)*
 *
 * **The enumeration is still here, under a DIFFERENT claim**, and that is v0.18's same-claim
 * clause: the invariant says what `done` resolves WITH; the enumeration says whether it settles at
 * all, and `isTerminal` ENUMERATES its own values — `running` and `awaiting_action` are the two
 * that say more input is coming, every other outcome is terminal. Six members, one claim each way.
 * *(W77's count. Since W173 there are eight outcomes and THREE that say more is coming — `cancelling`, ADR 0104 — and since W174 nine, `interrupted` terminal (ADR 0105, its `done` the W174 suite's) —
 * and this suite's enumeration is W77's own; `cancelling`'s `done` is the W151 suite's Q606 case.)*
 *
 * **Every expected value comes from `src/fold/run-state.ts`'s own `isTerminal` and from this item's
 * declaration-step measurements** (`dev-dist/w77/decl-probe{,2,3,4,6}.txt`), never from this
 * module's output.
 */
/**
 * **`await done`, bounded — because an unsettled promise HANGS a runner rather than failing it.**
 * W77's own rule 8 author pass returned four CRASH verdicts (`exit 13, 0 named failures`) where a
 * case awaited a `done` the probe had broken: Node drains the event loop, finds a pending top-level
 * await and exits, so the suite reports NOTHING. That is `doc/workflow.md` section 4's *a crash is
 * not a detection* and [W59](../../doc/work-items/w59-what-a-node-type-is.md)'s *exit 1 with zero
 * FAIL lines*, reached from inside this item's own tests.
 *
 * So every `await done` in these suites goes through here: a `done` that does not settle, and a
 * `done` that REJECTS — which ADR 0058 rule 3 says it never does — are both named failures **at the
 * handles these suites actually hold**.
 *
 * **That qualification is the honest one and it was measured.** `start` now creates a promise for
 * EVERY run, and most cases in this file (W66's, W76's) never attach a handler to theirs — so a
 * `done` made to reject reaches them as an UNHANDLED REJECTION and kills the runner mid-file with
 * zero `FAIL` lines, which this helper cannot see. W77's rule 8 `b2` grades that as a DECLARED
 * crash discriminated by its message rather than swallowing it, and W77's adequacy reader reached
 * the same structural fact from the other end (its 10). *A helper can only bound the promises its
 * own cases hold.*
 */
const w77Settlement = async (d: Promise<RunState>, ms = 300): Promise<RunState> => {
  const NEVER = Symbol('never settled');
  const r = await Promise.race([
    d.then((s) => s as RunState | symbol | Error, (e: unknown) => new Error(`done REJECTED, and ADR 0058 rule 3 says it never does: ${String((e as Error)?.message ?? e).slice(0, 80)}`)),
    new Promise<symbol>((res) => setTimeout(() => res(NEVER), ms)),
  ]);
  if (r === NEVER) throw new AssertionError(`\`done\` did not settle within ${ms} ms — ADR 0058 rule 3, and the run this case drove reached a terminal outcome`);
  if (r instanceof Error) throw new AssertionError(r.message);
  return r as RunState;
};

suite('W77 — `done` IS the caller`s own fold, and it settles exactly when that becomes terminal', (test) => {
  const DOCUMENT = {
    workers: { w: { url: 'https://example.test/w.js' } },
    nodeTypes: { T: { worker: 'w', inline: true } },
    predicates: [],
  } as unknown as RegistryDocument;

  const LINEAR = {
    flowId: 'lin', version: 1, entry: 'a',
    nodes: [
      { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'b' }] },
      { id: 'b', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition;

  /** A two-branch fan-out, so a region OPENS, ARRIVES and JOINS inside the sequence `done` folds. */
  const FANOUT = {
    flowId: 'fan', version: 1, entry: 'a',
    nodes: [
      { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'fanout', branches: ['b', 'c'] },
      { id: 'b', kind: 'task', type: 'T', edges: [{ to: 'j' }] },
      { id: 'c', kind: 'task', type: 'T', edges: [{ to: 'j' }] },
      { id: 'j', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition;

  /** A MAP nested in a fan-out branch — dotted branch paths, the second region kind, W76's SHAPES. */
  const NESTED = {
    flowId: 'nest', version: 1, entry: 'a',
    nodes: [
      { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'fanout', branches: ['pre', 'plain'] },
      { id: 'pre', kind: 'task', type: 'T', edges: [{ to: 'm' }] },
      { id: 'm', kind: 'map', over: 'items', branch: 'item' },
      { id: 'item', kind: 'task', type: 'T', edges: [{ to: 'mj' }] },
      { id: 'mj', kind: 'join', of: 'm', edges: [{ to: 'j' }] },
      { id: 'plain', kind: 'task', type: 'T', edges: [{ to: 'j' }] },
      { id: 'j', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition;

  /** Start a run on the recorded seam and settle every dispatch `done`, driving it to terminality. */
  const runToEnd = (flow: FlowDefinition, payload: unknown) => {
    const s = seams();
    const r = createRuntime(DOCUMENT, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const handle = r.start(flow, payload, {});
    for (let i = 0; i < s.added.length && i < 60; i += 1) s.settle(String(s.added[i]!.id), { items: ['x', 'y'], ok: true });
    return { ...handle, s };
  };

  /**
   * **The SHAPES this loop runs over, as a MEMBERSHIP** — `doc/workflow.md` rule 8 obligation (d).
   * W77's adequacy reader deleted the nested row for **0 failures** and the fan-out row for 0 more,
   * and the printed count moved 1262 -> 1261 -> 1260 without anything noticing, because the runner
   * counts `test()` CASES. A count is not a membership, so the rows are named here and the
   * properties that make them DIFFERENT shapes are asserted rather than trusted to the label.
   */
  const SHAPE_ROWS = ['a linear flow', 'a two-branch fan-out', 'a map NESTED inside a fan-out branch'] as const;
  /** What the loop BELOW actually ran, pushed by each case — the other half of the membership. */
  const ranShapes: string[] = [];
  test('the three shapes this suite runs `done` over are the three it declares, and they really differ', () => {
    equal([...SHAPE_ROWS].sort(), ['a linear flow', 'a map NESTED inside a fan-out branch', 'a two-branch fan-out'],
      'the shape list is a membership, not a count — a row that leaves fails here naming itself');
    const kinds = (f: FlowDefinition) => [...new Set((f.nodes as { kind: string }[]).map((n) => n.kind))].sort();
    equal(kinds(LINEAR), ['end', 'task'], 'LINEAR opens no region at all');
    ok(kinds(FANOUT).includes('fanout') && !kinds(FANOUT).includes('map'), 'FANOUT opens a `fanout` region and no map');
    ok(kinds(NESTED).includes('fanout') && kinds(NESTED).includes('map'),
      'and NESTED opens BOTH region kinds, one inside the other — the dotted branchPath depth no other row reaches');
  });

  for (const [name, flow, payload] of [
    [SHAPE_ROWS[0], LINEAR, { x: 1 }],
    [SHAPE_ROWS[1], FANOUT, { x: 1 }],
    [SHAPE_ROWS[2], NESTED, { items: ['x', 'y'] }],
  ] as const) {
    test(`${name}: await done deep-equals fold(driver.foldInputs()) — the caller's own expression, by a second route`, async () => {
      ranShapes.push(name);
      const { driver, done } = runToEnd(flow, payload);
      const settled = await w77Settlement(done);
      // The CONTROL, and it is what stops the equality holding on two empty states: a run that
      // dispatched nothing folds to `running` with no nodes, and `deepEqual` would be satisfied by
      // two of those. `doc/workflow.md` v0.18 — a membership names the CONTROLS beside its claims.
      ok(driver.foldInputs().length > 3, `the driver produced a real sequence on this flow: ${driver.foldInputs().length} fold inputs`);
      ok(Object.keys(settled.nodes).length > 0, `and the state done resolved with describes settled nodes: ${Object.keys(settled.nodes).length}`);
      const byTheCaller = fold(driver.foldInputs());
      // **Value-equal AND not the SAME OBJECT.** *(The first version of this comment said the
      // identity clause is what stops the comparison being re-sourced to itself. W77's adequacy
      // reader measured that FALSE: re-sourcing to `structuredClone(settled)` is `!==` AND
      // deep-equal, so the clause does not discriminate a re-sourcing — what does is the THIRD
      // observer, the refusal suite's own `deepEqual(settled, fold(driver.foldInputs()))`, which is
      // why `b5` and `b6` are ceilings that the compound with a broken `step` catches at 5. The
      // clause is kept because it catches the cheap re-sourcing rule 8's `b5` writes, and its
      // stated reason is now the measured one.)*
      ok(settled !== byTheCaller,
        'the two states are computed by two ROUTES and are therefore two objects — the runtime stepped a prefix it kept, this folded the sequence the DRIVER kept');
      ok(deepEqual(settled, byTheCaller),
        `what done resolved with IS what a caller folding the driver's own sequence computes — RN-R2, and P20 decision 2's "the same expression moved". ` +
        `${JSON.stringify(settled.outcome)} against ${JSON.stringify(byTheCaller.outcome)}`);
      ok(isTerminal(settled), `and it is terminal: ${settled.outcome}`);
    });
  }

  /**
   * **Set equality against the rows that RAN, which is what `SHAPE_ROWS` alone could not give.**
   * rule 8's `r-a7` — the adequacy reader's own edit, deleting the NESTED row from the loop above —
   * SURVIVED the first membership, because that one compared the `SHAPE_ROWS` DECLARATION with a
   * literal and a deleted loop row leaves the declaration alone. W35's `ROW_KEYS` is set equality
   * *against the rows that ran*, and this is that, read the right way round: a row that leaves the
   * loop now fails HERE, naming itself. *A membership over a declaration binds the declaration.*
   */
  test('and all three shapes really RAN — set equality against what the loop executed, both ways', () => {
    equal([...ranShapes].sort(), [...SHAPE_ROWS].sort(),
      'every declared shape ran exactly once and nothing else did — a row deleted from the loop fails here naming itself, which `SHAPE_ROWS` alone did not catch');
  });

  /**
   * **`RN-R2` at ladder L3, which is what licenses the mechanism at all.** The runtime keeps a
   * stepped prefix where the copied block keeps the inputs and re-folds; `RN-R2` says those agree
   * at EVERY prefix, not only at the end. Asserted at every n rather than once, because the claim
   * the runtime relies on is the general one — and if it held only at the end, a consumer folding a
   * live run (which `RN-R2` exists for) would get a different answer from `done`'s own bookkeeping.
   */
  test('RN-R2: the stepped prefix equals the folded prefix at EVERY n, not only at the end', async () => {
    const { driver, done } = runToEnd(FANOUT, { x: 1 });
    await w77Settlement(done);
    const seq = driver.foldInputs();
    ok(seq.length > 3, `a sequence worth stepping: ${seq.length}`);
    let stepped = emptyState();
    for (let n = 0; n < seq.length; n += 1) {
      stepped = step(stepped, seq[n]!);
      const folded = fold(seq.slice(0, n + 1));
      ok(stepped !== folded, `prefix ${n + 1}: two objects, by two routes — re-sourcing either to the other is what rule 8's b6 probe does`);
      ok(deepEqual(stepped, folded), `prefix ${n + 1} of ${seq.length}: step(fold(prefix), next) === fold(prefix + next)`);
    }
  });

  /**
   * **The ENUMERATION, under the other claim: does `done` settle at all.** `isTerminal` is
   * `outcome !== 'running' && outcome !== 'awaiting_action'` (and, since W173, `!== 'cancelling'` — that third value is
   * the W151 suite's Q606 case, not this enumeration's), so it names its own values and this
   * is the list the rule enumerates rather than the list an author chose
   * (`doc/workflow.md` rule 8 (a) at v0.17). Three settle, two do not — and the two that do not are
   * the whole of why `done` can wait for ever, which is what the reference has to teach. *(W178, P34
   * retro (m): the title read "the six outcomes: four terminal ones settle" — six was v0.2's vocabulary,
   * this block never ran `halted`, and `RunOutcome` has NINE values since P34. The other four are each
   * their own suite's: `halted` W77's refusal suite, `cancelled` and `cancelling` W151's Q606 case,
   * `interrupted` W174's.)*
   */
  test('five of the nine outcomes: three terminal ones settle `done`, and the two non-terminal ones do NOT — halted, cancelled, cancelling and interrupted in their own suites', async () => {
    const pending = Symbol('still pending');
    /** Whether `done` has settled by the next macrotask turn — a microtask is not enough, because the predicate runs in one. */
    const settledYet = (d: Promise<RunState>): Promise<RunState | symbol> =>
      Promise.race([d, new Promise<symbol>((r) => setTimeout(() => r(pending), 5))]);

    const startedWith = (flow: FlowDefinition, payload: unknown, opts: StartOptions) => {
      const s = seams();
      const r = createRuntime(DOCUMENT, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
      return { ...r.start(flow, payload, opts), s };
    };
    const started = (flow: FlowDefinition, payload: unknown) => startedWith(flow, payload, {});

    // --- running: nothing settled at all -------------------------------------------------------
    {
      const h = started(LINEAR, { x: 1 });
      const v = await settledYet(h.done);
      equal(v, pending, 'running: a dispatched task that has not settled leaves `done` pending — `isTerminal` says more input is coming');
      equal(fold(h.driver.foldInputs()).outcome, 'running', 'and the caller`s own fold agrees about which outcome that is');
    }
    // --- awaiting_action: a person is in the loop ----------------------------------------------
    {
      const h = started(LINEAR, { x: 1 });
      h.s.emitSettlement(String(h.s.added[0]!.id), 'user_action');
      const v = await settledYet(h.done);
      equal(v, pending, 'awaiting_action: a run parked on a PERSON leaves `done` pending — fact 6C, and it is the trap the reference must teach');
      equal(fold(h.driver.foldInputs()).outcome, 'awaiting_action', 'and the caller`s own fold agrees');
      // and the CONTROL for this row: resolving the person`s task drives it to terminal, so the
      // pending above is a statement about `awaiting_action` rather than about a broken harness.
      h.driver.resolve(String(h.s.added[0]!.id), 'done', { actor: 'a-person', result: { ok: true } });
      for (let i = 1; i < h.s.added.length && i < 10; i += 1) h.s.settle(String(h.s.added[i]!.id), { ok: true });
      const after = await settledYet(h.done);
      ok(after !== pending && isTerminal(after as RunState), `and after resolve() it settles: ${(after as RunState).outcome}`);
    }
    // --- completed -----------------------------------------------------------------------------
    {
      const h = runToEnd(LINEAR, { x: 1 });
      const v = await settledYet(h.done);
      ok(v !== pending, 'completed: `done` settles');
      equal((v as RunState).outcome, 'completed', 'with the outcome the flow`s end node declares — BY NAME, for the reason the `stuck` row below carries');
    }
    // --- failed: a task settles `failed` on a node with no failure edge -------------------------
    {
      const h = started(LINEAR, { x: 1 });
      h.s.emitSettlement(String(h.s.added[0]!.id), 'failed');
      const v = await settledYet(h.done);
      ok(v !== pending, 'failed: `done` settles');
      equal((v as RunState).outcome, 'failed', 'with `failed`, which is a flow outcome an author asked for and not an error');
    }
    // --- stuck: a region whose join can never fire ----------------------------------------------
    // **This block asserted the OUTCOME BY NAME only after W77's adequacy reader measured that it
    // was not reaching it.** As first written it failed ONE branch of a `live-token` fan-out and
    // settled the other, then asserted only *settled*, *terminal* and *agrees with the caller's
    // fold* — every one of which `failed` satisfies. So the run folded to `failed`, `failed` was
    // observed twice, `stuck` zero times, and a runtime that hung `done` for ever on a stuck run
    // shipped green. *The label was the only thing that said `stuck`.* A policy that REQUIRES an
    // arrival, with every branch lost, is what actually reaches it — and the outcome is now named.
    {
      const h = startedWith(FANOUT, { x: 1 }, { joinPolicy: liveTokenRequiringArrival });
      h.s.settle(String(h.s.added[0]!.id), { x: 1 });
      // every branch LOST and none ARRIVED, so the join can never fire: `JP-R8`'s own case
      for (const a of h.s.added.slice(1)) h.s.emitSettlement(String(a.id), 'failed');
      const v = await settledYet(h.done);
      ok(v !== pending, 'stuck: `done` settles — a run whose join can no longer fire is terminal (ADR 0015)');
      equal((v as RunState).outcome, 'stuck',
        'and the outcome is STUCK BY NAME — without this the row is satisfied by `failed`, which is what it was measuring before W77`s adequacy reader');
      equal((v as RunState).outcome, fold(h.driver.foldInputs()).outcome, 'and it is the outcome the caller`s own fold reports');
    }
  });
});

/**
 * **W77 — the three classes of driver REFUSAL, and why `done` resolves rather than rejects.**
 * The maintainer's answer to P20 stop-and-ask (c), and it REVERSED that plan's lean on a
 * measurement taken at this item's declaration step.
 *
 * `src/driver/driver.ts` has exactly three doors into `failRun`, and they differ in what the CALLER
 * ends up holding:
 *
 * | | door | the caller |
 * |---|---|---|
 * | **I** | refused BEFORE the run begins — `InvalidDefinition` (since W162 thrown from `runtime.check`'s findings), `BoundaryRefused` at `start` (`LanguageNotBuilt` until W162 removed it) | `runtime.start` throws; `failRun` is never reached; no run exists |
 * | **II** | refused DURING `start()` — `failRun(e)` **then `throw e`**, the caller being on the stack | `runtime.start` throws, so the caller **never receives the handle** |
 * | **III** | refused from a LISTENER — `failRun(e)` alone, a throw from a listener reaching nobody who can act on it (`dispatchEvent` rethrows it out of band: an uncaught exception in node 24 and deno, P35 fact 10) | the caller **holds** the handle |
 *
 * **Two measurements decide it.** First, `failRun` appends the `halted` fold input BEFORE calling
 * `onRunFailure`, so a refusal is ALREADY terminal when a consumer hears of it — the resolve road
 * does not hang, it settles with `halted` and `haltedBy` carrying the reason. Second, on class II
 * the reject road rejects a promise nobody can attach to: measured in a CHILD process with no
 * `unhandledRejection` listener (because a listener suppresses the default and measures the event
 * rather than the consequence), **the reject road exited 1 — the process DIED** on an authoring
 * error the consumer had correctly caught, and the resolve road exited 0
 * (`dev-dist/w77/decl-probe3.txt`).
 *
 * *(A fourth fixture died on the way: the first class-III probe used a decision with no matching
 * edge, and the validator refused the document by name — **`FD-V7`: a task's edges must include an
 * unguarded default, so `NoMatchingEdge` is not reachable from a VALID document at all.** That is
 * W71's `MissingJoinPolicy` finding one refusal over, and it is why class III below is a `map` over
 * a non-array.)*
 */
suite('W77 — a driver refusal RESOLVES `done` with `halted`, and never rejects', (test) => {
  const DOCUMENT = {
    workers: { w: { url: 'https://example.test/w.js' } },
    nodeTypes: { T: { worker: 'w', inline: true } },
    predicates: [],
  } as unknown as RegistryDocument;

  /** A `map` AFTER a task, whose producer returns no array — `UnresolvedMapArity` from the LISTENER. */
  const LATE_MAP = {
    flowId: 'latemap', version: 1, entry: 'a',
    nodes: [
      { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'spread' }] },
      { id: 'spread', kind: 'map', over: 'items', branch: 'each' },
      { id: 'each', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
      { id: 'collect', kind: 'join', of: 'spread', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition;

  /** A task that PARKS on a person, then a `map` — so a refused RESOLUTION throws from `advance`. */
  const PARK_THEN_MAP = {
    flowId: 'parkmap', version: 1, entry: 'a',
    nodes: [
      { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'spread' }] },
      { id: 'spread', kind: 'map', over: 'items', branch: 'each' },
      { id: 'each', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
      { id: 'collect', kind: 'join', of: 'spread', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition;

  /** The same `map` AT THE ENTRY — `enter` throws inside `start()`, which reports AND rethrows. */
  const MAP_AT_ENTRY = {
    flowId: 'mapentry', version: 1, entry: 'spread',
    nodes: [
      { id: 'spread', kind: 'map', over: 'items', branch: 'each' },
      { id: 'each', kind: 'task', type: 'T', edges: [{ to: 'collect' }] },
      { id: 'collect', kind: 'join', of: 'spread', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition;

  test('class III — refused from a LISTENER: `done` RESOLVES with `halted`, carrying `haltedBy`', async () => {
    const s = seams();
    const r = createRuntime(DOCUMENT, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    let reported = 0;
    const { driver, done } = r.start(LATE_MAP, { x: 1 }, { onRunFailure: () => { reported += 1; } });
    // the producer returns an object with no `items` array, so entering the map throws from the
    // scheduler listener — `failRun` reports and nothing is rethrown to any caller.
    s.settle(String(s.added[0]!.id), { notAnArray: true });
    const settled = await w77Settlement(done);
    equal(reported, 1, 'the CONTROL: onRunFailure fired, so this row is about a refusal rather than about a quiet run');
    equal(settled.outcome, 'halted', 'and `done` RESOLVED rather than rejecting — `halted` is a terminal outcome like any other');
    ok(String(settled.haltedBy).includes('UnresolvedMapArity'),
      `and the reason survives in the RunState rather than being thrown away: ${String(settled.haltedBy).slice(0, 60)}`);
    ok(deepEqual(settled, fold(driver.foldInputs())), 'and it is still the caller`s own fold — the invariant holds through a refusal too');
  });

  test('class II — refused DURING start(): `start` throws, and nothing is left rejected behind it', async () => {
    const s = seams();
    const r = createRuntime(DOCUMENT, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    let unhandled: unknown = null;
    const onU = (reason: unknown) => { unhandled = reason; };
    const proc = (globalThis as { process?: { on?: (e: string, f: (r: unknown) => void) => void; off?: (e: string, f: (r: unknown) => void) => void } }).process;
    proc?.on?.('unhandledRejection', onU);
    let threw: string | null = null;
    try {
      r.start(MAP_AT_ENTRY, { items: 'not-an-array' }, {});
    } catch (e) { threw = (e as Error).constructor.name; }
    await new Promise((res) => setTimeout(res, 20));
    proc?.off?.('unhandledRejection', onU);
    equal(threw, 'UnresolvedMapArity',
      '`start` reports through onRunFailure AND rethrows, because the caller is on the stack — so the caller learns by the throw and never holds a handle');
    equal(unhandled, null,
      'and because `done` RESOLVES rather than rejecting, nothing is left rejected with nobody able to attach: on the reject road this case exited 1 in a child process');
  });

  /**
   * **The `resolve()` door — a FOURTH `failRun` call site, and a distinct caller-visibility class.**
   * W77's conformity reader, finding 2: this item's own table said *"exactly three doors into
   * `failRun`"* and listed a row that is not a door at all (class I never reaches it), while
   * omitting `src/driver/driver.ts:1140` — `resolve()`'s, which reports AND rethrows **with the
   * caller already holding the handle**, because `start` returned long ago.
   *
   * It is the door that matters most here: `resolve()` is ADR 0004's road and **the only way out of
   * `awaiting_action`**, which is the one non-terminal outcome ADR 0058 spends a decision on. So a
   * consumer waiting on `done` for a person to answer, whose answer is then REFUSED, gets both a
   * throw from `resolve` and a `done` that resolves with `halted` — correct, and asserted nowhere
   * until this case.
   */
  test('class II(b) — refused from `resolve()`: the caller gets the throw AND `done` resolves `halted`', async () => {
    const s = seams();
    const r = createRuntime(DOCUMENT, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const { driver, done } = r.start(PARK_THEN_MAP, { x: 1 }, {});
    const parked = String(s.added[0]!.id);
    s.emitSettlement(parked, 'user_action');
    // the CONTROL for this case: the run really is parked on a person, and `done` really is waiting
    equal(fold(driver.foldInputs()).outcome, 'awaiting_action', 'the run is parked on a person — this is the state `done` waits through');
    let threw: string | null = null;
    try {
      driver.resolve(parked, 'done', { actor: 'a-person', result: { items: 'not-an-array' } });
    } catch (e) { threw = (e as Error).constructor.name; }
    equal(threw, 'UnresolvedMapArity',
      '`resolve` reports AND rethrows, exactly as `start` does — the caller is on the stack (src/driver/driver.ts:1140)');
    const settled = await w77Settlement(done);
    equal(settled.outcome, 'halted',
      'and the handle the caller has held since `start` RESOLVES with `halted` — so a person`s refused answer does not leave `done` waiting for ever');
    ok(String(settled.haltedBy).includes('UnresolvedMapArity'), `with the reason: ${String(settled.haltedBy).slice(0, 50)}`);
  });

  test('`done` never rejects: a .catch on a refused run is not the road the answer arrives by', async () => {
    const s = seams();
    const r = createRuntime(DOCUMENT, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const { done } = r.start(LATE_MAP, { x: 1 }, {});
    s.settle(String(s.added[0]!.id), { notAnArray: true });
    let rejectedWith: unknown = 'NOT REJECTED';
    let resolvedWith: string | null = null;
    const bounded = Promise.race([done.then(() => 'settled', () => 'settled'), new Promise<string>((r2) => setTimeout(() => r2('NEVER SETTLED'), 300))]);
    ok(await bounded === 'settled', '`done` settled at all — without this the two reads below would hang the runner rather than fail this case');
    await done.then((st) => { resolvedWith = st.outcome; }, (e) => { rejectedWith = e; });
    equal(rejectedWith, 'NOT REJECTED', '`done` has ONE settlement rule — terminality — and a refusal is terminal, so the rejection road is never taken');
    equal(resolvedWith, 'halted', 'the answer arrives by the resolve road, carrying the whole RunState');
  });
});

/**
 * **W77 — `onFoldInput` is COMPOSED, not replaced, and `done` does not depend on the consumer.**
 * The runtime needs that channel to keep `done` and a consumer may pass one too, so this is the
 * third road `start` reaches a `StartOptions` member by. The suite above it binds the LIST; this
 * one says the consumer's callback still RUNS, which no text comparison can see — obligation (c)'s
 * LIMIT, exactly as W76 applied it to the forwarding.
 */
suite('W77 — a consumer`s own onFoldInput still receives every element, and `done` is not downstream of it', (test) => {
  const DOCUMENT = {
    workers: { w: { url: 'https://example.test/w.js' } },
    nodeTypes: { T: { worker: 'w', inline: true } },
    predicates: [],
  } as unknown as RegistryDocument;
  const LINEAR = {
    flowId: 'lin', version: 1, entry: 'a',
    nodes: [
      { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'b' }] },
      { id: 'b', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition;

  const runWith = (opts: StartOptions) => {
    const s = seams();
    const r = createRuntime(DOCUMENT, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const h = r.start(LINEAR, { x: 1 }, opts);
    for (let i = 0; i < s.added.length && i < 20; i += 1) s.settle(String(s.added[i]!.id), { ok: true });
    return h;
  };

  test('the consumer`s callback receives EXACTLY the driver`s sequence, element for element', async () => {
    const seen: FoldInput[] = [];
    const { driver, done } = runWith({ onFoldInput: (i) => { seen.push(i); } });
    await w77Settlement(done);
    const theDriver = driver.foldInputs();
    ok(seen.length > 3, `the CONTROL: the consumer saw a real sequence: ${seen.length}`);
    equal(seen.length, theDriver.length, 'the consumer`s callback ran once per element — a wrapper that dropped or doubled one is a length');
    for (let i = 0; i < seen.length; i += 1) {
      ok(deepEqual(seen[i], theDriver[i]), `element ${i} is the one the driver appended at that position`);
    }
  });

  test('`done` settles even when the consumer`s own callback throws — record first, schedule second, hand on third', async () => {
    let fired = 0;
    const s = seams();
    const r = createRuntime(DOCUMENT, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    // the FIRST element arrives inside `start()` (P20 fact 4A: exactly one), so a callback that
    // throws on every element would take `start` down with it. This one throws from the SECOND,
    // which is the case a consumer actually hits: a handler that works until some input surprises it.
    const { done } = r.start(LINEAR, { x: 1 }, { onFoldInput: () => { fired += 1; if (fired > 1) throw new Error('consumer callback blew up'); } });
    for (let i = 0; i < s.added.length && i < 20; i += 1) {
      try { s.settle(String(s.added[i]!.id), { ok: true }); } catch { /* the consumer's throw, unwinding through the driver exactly as it did before ADR 0058 */ }
    }
    // **The sentinel is `running` and not a made-up word, because `isTerminal` is
    // `outcome !== 'running' && outcome !== 'awaiting_action'` (and, since W173, `!== 'cancelling'`) — so a sentinel of `'NEVER SETTLED'`
    // IS terminal and the assertion below could not fail through it.** W77's adequacy reader, 9:
    // with the two outcome assertions deleted and the composition order reversed, the case was
    // green at zero. *A timeout sentinel has to be a value the predicate REJECTS.*
    const settled = await Promise.race([done, new Promise<RunState>((r2) => setTimeout(() => r2({ outcome: 'running' } as unknown as RunState), 20))]);
    ok(fired > 1, `the CONTROL: the throwing callback really did throw (${fired} calls)`);
    ok(isTerminal(settled),
      '`done` SETTLED rather than hanging, which is the property: the runtime records and schedules BEFORE handing on, so its own bookkeeping cannot be shortened by a consumer`s callback');
    // **And the outcome is `halted`, not `completed`, which this case got wrong on its first run.**
    // A consumer's `onFoldInput` has always been called UNGUARDED (`src/driver/driver.ts`), so a
    // throw from it unwinds into the driver's listener boundary, where `OR-R10` catches it and
    // fails the run — that is behaviour ADR 0058 inherits rather than introduces. The useful half
    // is that `done` REPORTS it: a consumer whose own handler threw learns the run stopped and why,
    // where a hand-rolled block that folded inside the same handler would simply never resolve.
    equal(settled.outcome, 'halted',
      'and it reports the consumer`s own throw as what it is — a run failure through OR-R10, with the reason in `haltedBy`');
    ok(String(settled.haltedBy).includes('consumer callback blew up'),
      `and the consumer's own message is what the run stopped for: ${String(settled.haltedBy).slice(0, 60)}`);
  });

  test('a `.then` attached long AFTER the run is over still receives the answer — P20 fact 4C, through the real API', async () => {
    const { done } = runWith({});
    // burn macrotask turns so the run is demonstrably over before anything is attached
    for (let i = 0; i < 5; i += 1) await new Promise((r) => setTimeout(r, 1));
    let late = 'NEVER DELIVERED';
    await w77Settlement(done);
    await done.then((st) => { late = st.outcome; });
    equal(late, 'completed',
      'a promise RETAINS its resolution, which is precisely what Q293`s stated case AGAINST — "the same window" — is immune to');
  });
});


/**
 * **W77 — `done` on a REAL `FyflowScheduler`, and `done` belonging to a RUN rather than to a
 * runtime.** Two cases, each closing a hole a reader measured rather than argued.
 *
 * **The real pool** is W77's `Gate:` row instantiated: it claims *"L1 on the recorded pool seam AND
 * on real inline pools through `runtime.start`"*, and before this suite every W77 case ran on
 * `seams()` — where every settlement is driven from a SYNCHRONOUS loop, so every queued microtask
 * fires only after the whole run and the multi-turn case is never entered. ADR 0058 **rule 6** —
 * *the STEP is synchronous and the PREDICATE is not* — is precisely about what happens ACROSS
 * driver turns, and its own subject shape had no observer. Both readers found this independently;
 * it is the one subject they shared.
 *
 * **The per-RUN case** is W77's adequacy reader's BLOCKING 2: making `done` a single promise shared
 * by every run of a runtime cost **ZERO**, because every case started exactly one run per runtime.
 * P18 decision 10 makes a runtime explicitly multi-run and this file already asserts `r1`/`r2`
 * minting across two runs — so the shape was supported, exercised for `runId`, and unobserved for
 * the thing this item adds.
 */
suite('W77 — `done` on a real scheduler, and `done` belongs to a RUN', (test) => {
  const DOCUMENT = {
    workers: { w: { url: 'https://example.test/w.js' } },
    nodeTypes: { T: { worker: 'w', inline: true } },
    predicates: [],
  } as unknown as RegistryDocument;
  const LINEAR = {
    flowId: 'lin', version: 1, entry: 'a',
    nodes: [
      { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition;
  const FANOUT = {
    flowId: 'fan', version: 1, entry: 'a',
    nodes: [
      { id: 'a', kind: 'task', type: 'T', edges: [{ to: 'split' }] },
      { id: 'split', kind: 'fanout', branches: ['b', 'c'] },
      { id: 'b', kind: 'task', type: 'T', edges: [{ to: 'j' }] },
      { id: 'c', kind: 'task', type: 'T', edges: [{ to: 'j' }] },
      { id: 'j', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition;

  test('TWO runs on ONE runtime: each `done` carries its OWN run, and they settle independently', async () => {
    const s = seams();
    const r = createRuntime(DOCUMENT, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const one = r.start(LINEAR, { x: 1 }, { runId: 'run-ONE' });
    const two = r.start(FANOUT, { x: 2 }, { runId: 'run-TWO' });
    // the CONTROL: two runs really were started on one runtime, and they are different runs
    equal([one.driver.runId, two.driver.runId], ['run-ONE', 'run-TWO'], 'two runs, one runtime — P18 decision 10`s shape');
    ok(one.done !== two.done, 'and TWO promises: a `done` kept per RUNTIME rather than per RUN costs zero on any single-run case (W77`s adequacy reader, BLOCKING 2)');
    for (const a of s.added) s.settle(String(a.id), { ok: true });
    const [a, b] = [await w77Settlement(one.done), await w77Settlement(two.done)];
    equal(a.runId, 'run-ONE', 'run ONE`s handle resolved with run ONE`s state');
    equal(b.runId, 'run-TWO', 'and run TWO`s with run TWO`s — the assertion a shared promise fails, naming the run it handed back');
    ok(Object.keys(b.nodes).length > Object.keys(a.nodes).length,
      'and the two states really are different runs: the fan-out settled more nodes than the linear flow');
  });

  test(`done settles on a REAL FyflowScheduler with real inline pools — ${IN_BROWSER ? 'SKIPPED in the browser (RT-R10)' : 'the Gate row`s second half'}`, async () => {
    if (IN_BROWSER) {
      ok(true, 'skipped: a browser loads no .ts worker file, which is RT-R10 and is why ladder L6 runs in Node and Deno only');
      return;
    }
    const runtime = createRuntime({
      workers: { ingest: { url: INGEST_URL }, publish: { url: PUBLISH_URL } },
      nodeTypes: {
        Ingest: { worker: 'ingest', inline: true, config: {}, pool: { maxThreads: 1, idleTimeout: 0 } },
        Publish: { worker: 'publish', inline: true, config: {}, pool: { maxThreads: 1, idleTimeout: 0 } },
      },
    }, {}, { base: import.meta.url });
    const flow = {
      flowId: 'realdone', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'Ingest', edges: [{ to: 'publish' }] },
        { id: 'publish', kind: 'task', type: 'Publish', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;

    // **ONE line, where the thirteen copied blocks are 135.** No `onFoldInput`, no `queueMicrotask`,
    // no accumulator, no deadline — and a REAL scheduler, where settlements arrive across many
    // driver turns rather than from a synchronous loop, which is the shape rule 6 is written about.
    //
    // **The await is BOUNDED and the shutdown is in a `finally`, and both are load-bearing here in a
    // way they are not on the seam.** This case first read `const state = await done;` followed by
    // `await runtime.shutdown()`. Under rule 8's `a1` — the terminality check never scheduled —
    // that is not a failure and not even the exit 13 an unbounded await costs elsewhere: a real
    // `FyflowScheduler` that is never shut down KEEPS THE PROCESS ALIVE, so the probe ran for two
    // and a half hours and the harness never reached its own restore. *The fix for a reader's
    // finding reintroduced the defect this item's author pass had just closed, one case over — and
    // a real scheduler turns a missing verdict into no verdict at all.*
    const { driver, done } = runtime.start(flow, { text: 'hello' });
    let state: RunState;
    try {
      state = await w77Settlement(done, 5_000);
    } finally {
      await runtime.shutdown();
    }

    equal(state.outcome, 'completed', '`done` settled on a real FyflowScheduler, across real driver turns');
    ok(isTerminal(state), 'and the state it carries is terminal');
    ok(driver.foldInputs().length > 3, `the CONTROL: a real multi-turn sequence, not a single dispatch: ${driver.foldInputs().length} fold inputs`);
    const byTheCaller = fold(driver.foldInputs());
    ok(state !== byTheCaller, 'two objects, by two routes');
    ok(deepEqual(state, byTheCaller), 'and the invariant holds on a real scheduler too, not only on the recorded seam');
  });
});

/**
 * **ADR 0088 — the runtime ROUTES each settlement to the driver holding its run id** —
 * [W142](../../doc/work-items/w142-a-settlement-reaches-only-its-own-runs-driver.md), ladder L1-L2, over the scheduler seam.
 *
 * **Every expected value is a row of ADR 0088 rule 4 or a rule it names, never this module's output.** A settlement whose
 * run id a driver of the runtime holds is HANDED to that driver and no other; a parseable id no driver holds is handed to
 * none; an id `parseTaskId` refuses is handed to every driver, which each reports through `onUnmintedTask` under its own
 * run id (ADR 0027 rule 3, `ID-R5`); our run id on a task we never dispatched still stops that run (`ID-R4` tier 2); a
 * finished run's driver is RELEASED at its `done` and hears nothing more (ADR 0091, amending rule 5 — this said it still
 * heard its id until W151); and a driver built by hand on `runtime.scheduler` is not routed
 * (rule 7).
 *
 * **What a driver is HANDED is read at its ENTRY**, the instance's `onEvent`, shadowed non-enumerably as
 * `examples/run-flow.ts`'s `onDelivery` does. That is the only place the claim is visible: a broadcast that tier 1 then
 * drops leaves every driver's fold, failures and reports exactly as routing does, so an observer downstream of the driver
 * could not tell the two apart — which is the whole of what this decision changes.
 */
function routedSeams() {
  /** Every `addEventListener` the SCHEDULER received, by event name — rule 2's observable. */
  const subscriptions: string[] = [];
  const listeners = new Map<string, ((e: object) => void)[]>();
  const added: { id: string }[] = [];
  const createScheduler = (p: Record<string, unknown>, g: Record<string, unknown>) => ({
    workerPools: p, groups: g,
    addTask(t: unknown) { added.push(t as { id: string }); },
    addEventListener(type: string, fn: (e: object) => void) {
      subscriptions.push(type);
      listeners.set(type, [...(listeners.get(type) ?? []), fn]);
    },
    shutdown() { return Promise.resolve(); },
  }) as never;
  /** One scheduler event, dispatched as an `EventTarget` would: every listener on that name, in order. */
  const emit = (type: string, detail: unknown) => { for (const fn of listeners.get(type) ?? []) fn({ detail }); };
  const detail = (id: unknown, state: string) => ({
    id, state, result: state === 'done' ? { ok: true } : null, error: state === 'done' ? undefined : 'boom',
    attempts: 0, timestamp: 1, startTime: 1, endTime: 2, executionTime: 1,
  });
  const done = (id: unknown) => emit('task.completed', detail(id, 'done'));
  return { subscriptions, added, createScheduler, createPool: seams().createPool, emit, detail, done };
}

/** What a driver's listener is handed from here on, one id per event — the instrument the suite below describes. */
function handed(d: Driver): string[] {
  const seen: string[] = [];
  const original = (d as unknown as { onEvent: (n: string, x: unknown) => void }).onEvent;
  Object.defineProperty(d, 'onEvent', {
    enumerable: false, configurable: true, writable: true,
    value: function (this: unknown, n: string, x: unknown) {
      const id = (x as { id?: unknown } | undefined)?.id;
      seen.push(typeof id === 'string' ? id : '(no string id)');
      return original.call(this, n, x);
    },
  });
  return seen;
}

/** `handed`'s instrument with a caller's sink, chained onto whatever `onEvent` the instance already has. */
function onDeliveryInto(d: Driver, sink: (id: string) => void): void {
  const original = (d as unknown as { onEvent: (n: string, x: unknown) => void }).onEvent;
  Object.defineProperty(d, 'onEvent', {
    enumerable: false, configurable: true, writable: true,
    value: function (this: unknown, n: string, x: unknown) {
      const id = (x as { id?: unknown } | undefined)?.id;
      sink(typeof id === 'string' ? id : '(no string id)');
      return original.call(this, n, x);
    },
  });
}

suite('W142 — ADR 0088: a settlement reaches only the driver holding its run id, and an id no driver minted reaches every driver', (test) => {
  /** Three runs of `FLOW` (one task `a`, then `done`) on ONE runtime, so ONE scheduler, with their reports kept. */
  function threeRuns() {
    const s = routedSeams();
    const r = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const subscribedBeforeAnyRun = [...s.subscriptions];
    const runs = ['r1', 'r2', 'r3'].map((runId) => {
      const failures: string[] = [];
      const unminted: { runId: string; taskId: unknown }[] = [];
      const { driver, done } = r.start(FLOW, { x: 1 }, {
        runId,
        onRunFailure: (f) => { failures.push(f.kind); },
        onUnmintedTask: (u) => { unminted.push({ runId: u.runId, taskId: u.taskId }); },
      });
      return { runId, driver, done, failures, unminted, handed: handed(driver) };
    });
    return { s, r, runs, subscribedBeforeAnyRun };
  }
  const handedBy = (runs: { handed: string[] }[]) => runs.map((x) => [...x.handed]);

  test('rule 2: the scheduler is subscribed ONCE per settlement event however many runs start — and not at all before the first', () => {
    const { s, runs, subscribedBeforeAnyRun } = threeRuns();
    equal(subscribedBeforeAnyRun, [], 'a runtime that has started nothing has subscribed nothing');
    equal(runs.map((x) => x.driver.runId), ['r1', 'r2', 'r3'], 'the CONTROL: three runs really started on this one runtime');
    // The driver subscribes to five names (`SUBSCRIBED_EVENTS`, `src/driver/driver.ts`: the four settlements — `task.cancelled`
    // since W158 — and `task.running` since W186, `RN-R40`): one each, not three each.
    equal([...s.subscriptions].sort(), ['task.cancelled', 'task.completed', 'task.failed', 'task.running', 'task.user_action'],
      'one subscription per event NAME — a broadcast would show fifteen, five per driver');
  });

  test('rule 4, row 1: a settlement is handed to the driver holding its run id, and to NO other — in all three terminal states', () => {
    const { s, runs } = threeRuns();
    s.done('r2:a:-:0');
    equal(handedBy(runs), [[], ['r2:a:-:0'], []], 'done: r2 alone');
    // A `failed` is one `task.failed`; a non-optional task out of retries is `task.failed` THEN `task.user_action`, one
    // object (ADR 0007 rule 2) — two events, both to the one driver.
    s.emit('task.failed', s.detail('r1:a:-:0', 'failed'));
    s.emit('task.failed', s.detail('r3:a:-:0', 'user_action'));
    s.emit('task.user_action', s.detail('r3:a:-:0', 'user_action'));
    equal(handedBy(runs), [['r1:a:-:0'], ['r2:a:-:0'], ['r3:a:-:0', 'r3:a:-:0']],
      'failed: r1 alone; user_action: BOTH of its events to r3 alone');
    equal(runs.map((x) => x.failures), [[], [], []], 'and nothing was reported anywhere — each was its own run`s dispatched task');
    equal(runs.map((x) => x.unminted), [[], [], []], 'and a parseable id reaches no onUnmintedTask (ADR 0027 rule 4)');
  });

  test('rule 4, row 2: a parseable run id NO driver of the runtime holds is handed to no driver, and reported by none', () => {
    const { s, runs } = threeRuns();
    s.done('r9:a:-:0');
    s.done('other-runtime:a:-:0');
    equal(handedBy(runs), [[], [], []], 'what every driver`s tier 1 did with it before, done once by the runtime');
    equal(runs.map((x) => [x.failures, x.unminted]), [[[], []], [[], []], [[], []]], 'not a failure, not a report (ADR 0023 rule 3)');
    // And the runs are untouched by it: each still completes on its own settlement.
    for (const x of runs) s.done(`${x.runId}:a:-:0`);
    equal(runs.map((x) => fold(x.driver.foldInputs()).outcome), ['completed', 'completed', 'completed'], 'each run completes afterwards');
  });

  test('rule 4, row 3: an id parseTaskId REFUSES is handed to EVERY driver, which each reports under its own run id (ADR 0027, ID-R5)', () => {
    const { s, runs } = threeRuns();
    // ONE log across the three drivers, so the ORDER rule 4 row 3 states — *in the order they subscribed* — is a value.
    // Each driver's own list cannot see it (the adequacy reader's M09: reversing the broadcast left every list equal).
    const together: string[] = [];
    for (const x of runs) {
      onDeliveryInto(x.driver, (id) => together.push(`${x.runId} ${id}`));
    }
    // Three shapes: a plain non-flow task; an id whose FIRST segment is one of our run ids and whose branch path is
    // malformed — `split(':')[0]` would hand it to `r1` alone, `parseTaskId` refuses it; and a detail with no id.
    s.done('nightly-cleanup');
    s.done('r1:a:x:0');
    s.done(undefined);
    const want = ['nightly-cleanup', 'r1:a:x:0', '(no string id)'];
    equal(handedBy(runs), [want, want, want], 'all three to all three drivers, in the order the scheduler dispatched them');
    equal(runs.map((x) => x.unminted),
      runs.map((x) => [
        { runId: x.runId, taskId: 'nightly-cleanup' }, { runId: x.runId, taskId: 'r1:a:x:0' }, { runId: x.runId, taskId: undefined },
      ]),
      'each driver reports each one, under ITS OWN run id, with detail.id uncoerced');
    equal(runs.map((x) => x.failures), [[], [], []], 'and no run stops for it');
    equal(together, want.flatMap((id) => ['r1', 'r2', 'r3'].map((r) => `${r} ${id}`)),
      'and each event reaches the three IN THE ORDER THEY SUBSCRIBED, r1 then r2 then r3, before the next event');
  });

  test('rule 1: a RESUMED run is routed as a started one is — handed its own settlements and no other run`s', () => {
    // A checkpoint taken from a run on one runtime, resumed on a SECOND runtime beside two started runs. `openRun` is the
    // one place a driver is built, so `resume` must hand the driver the run's view too (the adequacy reader's M22: a
    // resumed driver handed the scheduler itself left every case green, because tier 1 hides a broadcast's results).
    const first = routedSeams();
    const one = createRuntime(DOC, {}, { createPool: first.createPool, createScheduler: first.createScheduler });
    const checkpoint = one.start(FLOW, { x: 1 }, { runId: 'x1' }).driver.checkpoint();
    const s = routedSeams();
    const r = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const a = handed(r.start(FLOW, { x: 1 }, { runId: 'r1' }).driver);
    const resumed = r.resume(FLOW, checkpoint);
    const b = handed(resumed.driver);
    equal(resumed.driver.runId, 'x1', 'the CONTROL: the resumed driver holds the checkpoint`s run');
    s.done('r1:a:-:0');
    s.done('x1:a:-:0');
    equal([a, b], [['r1:a:-:0'], ['x1:a:-:0']], 'r1`s settlement to r1 alone, x1`s to the resumed driver alone');
    equal(fold(resumed.driver.foldInputs()).outcome, 'completed', 'and the resumed run completes on its own settlement');
  });

  test('rule 4 row 3 under copy-on-write: a run started DURING a broadcast is not handed the event in flight', () => {
    // `EventTarget.dispatchEvent` does not invoke a listener added during dispatch; until W142's two readers (conformity
    // 6, adequacy C1) the router pushed onto the array it was iterating, so a run started from a consumer's
    // `onUnmintedTask` heard the very event that started it.
    const s = routedSeams();
    const r = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const reports: string[] = [];
    r.start(FLOW, { x: 1 }, {
      runId: 'r1',
      onUnmintedTask: (u) => {
        reports.push(`r1 ${String(u.taskId)}`);
        if (u.taskId === 'nightly-cleanup') {
          r.start(FLOW, { x: 1 }, { runId: 'r2', onUnmintedTask: (v) => { reports.push(`r2 ${String(v.taskId)}`); } });
        }
      },
    });
    s.done('nightly-cleanup');
    equal(reports, ['r1 nightly-cleanup'], 'r2 did not exist when the event was dispatched, so it is not handed it');
    s.done('weekly-report');
    equal(reports, ['r1 nightly-cleanup', 'r1 weekly-report', 'r2 weekly-report'], 'and it is handed the NEXT one');
  });

  test('ID-R4 tier 2 under routing: OUR run id on a task we never dispatched still stops THAT run, and no other', () => {
    const { s, runs } = threeRuns();
    s.done('r1:b:-:0');
    equal(handedBy(runs), [['r1:b:-:0'], [], []], 'routed to r1 by its run id, as rule 4 row 1 says');
    equal(runs.map((x) => x.failures), [['UndispatchedTask'], [], []], 'r1 stops with UndispatchedTask; r2 and r3 hear nothing of it');
  });

  // **This case said the opposite until W151**: *rule 5, RN-R25: a FINISHED run's driver still hears its own run id* —
  // handed again after it completed, its sequence growing, and still among every driver for row 3 (the adequacy reader's
  // M16). ADR 0091 amends rule 5: the runtime RELEASES a run when its `done` settles, so each of those three now reads
  // the other way, and the W151 suite below carries the rest of the rule.
  test('rule 5 as ADR 0091 amends it: a FINISHED run`s driver is released — handed nothing more, its own run id nor an unminted one', async () => {
    const { s, runs } = threeRuns();
    s.done('r2:a:-:0');
    const state = await w77Settlement(runs[1]!.done);
    equal(state.outcome, 'completed', 'the CONTROL: r2 finished');
    const before = runs[1]!.driver.foldInputs().length;
    s.done('r2:a:-:0');
    equal(handedBy(runs), [[], ['r2:a:-:0'], []], 'handed its settlement once, before done, and NOT again after — ADR 0091 rule 1');
    equal(runs[1]!.driver.foldInputs().length, before, 'so its sequence does not grow after it completed — RN-R25 v0.14');
    // Rule 4 row 3 reaches every driver the runtime still HOLDS: the two live runs, and not the released r2.
    s.done('after-the-end');
    equal(runs.map((x) => x.unminted.map((u) => u.taskId)), [['after-the-end'], [], ['after-the-end']],
      'an unminted id is reported by the live r1 and r3, and by the finished r2 no longer');
  });

  test('rule 7: a Driver built BY HAND on runtime.scheduler is not routed — it subscribes to the scheduler and hears every settlement', () => {
    const { s, r, runs } = threeRuns();
    const subscribed = s.subscriptions.length;
    const byHand = new Driver(FLOW, { ...r.registry, runId: 'hand', scheduler: r.scheduler, joinPolicy: liveToken });
    const heard = handed(byHand);
    equal(s.subscriptions.length - subscribed, 5, 'its five subscriptions (four settlements and, since W186, `task.running`) went to the scheduler itself');
    s.done('r1:a:-:0');
    equal([heard, ...handedBy(runs)], [['r1:a:-:0'], ['r1:a:-:0'], [], []], 'the hand-built driver hears r1`s settlement; r2 and r3 still do not');
  });

  test('a throw out of one driver`s listener does not stop the broadcast to the next, and still reaches the dispatcher', () => {
    const s = routedSeams();
    const r = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const reports: string[] = [];
    // A throw OUT OF a driver's listener. Until W178 a consumer's `onRunFailure` throwing on the failure path was one
    // (`onUnmintedTask` threw, the listener failed the run, `onRunFailure` threw again); since W178's S-1 the driver's
    // listener boundary DISCARDS that (`OR-R10` v0.17), and nothing a consumer callback throws leaves `Driver.onEvent`.
    // The ROUTER's rule is still the claim, so the instrument is the listener itself: r1's driver's entry throws.
    const r1 = r.start(FLOW, { x: 1 }, { runId: 'r1' });
    Object.defineProperty(r1.driver, 'onEvent', {
      enumerable: false, configurable: true, writable: true,
      value: () => { throw new Error('escaped'); },
    });
    r.start(FLOW, { x: 1 }, { runId: 'r2', onUnmintedTask: (u) => { reports.push(`${u.runId} ${String(u.taskId)}`); } });
    throws(() => s.done('nightly-cleanup'), 'escaped', 'the first throw reaches whoever dispatched the event, synchronously, as it did before');
    equal(reports, ['r2 nightly-cleanup'], 'and r2, after r1 in subscription order, was still handed the event and reported it');
  });
});

/**
 * **ADR 0091 — a runtime RELEASES a run when its `done` settles, keeps its run id, and keeps every run that has not
 * settled** — [W151](../../doc/work-items/w151-a-runtime-releases-a-run-when-its-done-settles.md), ladder L1-L2, over the
 * W142 suite's scheduler seam and instrument.
 *
 * **Every expected value is a rule of ADR 0091 or of a rule it names**: rule 1 (released at `done`'s quiescent point, from
 * both of the router's tables), rule 2 (the id kept: `RunIdInUse`, the counter skipping it — `RN-R25`), rule 3 (`running`
 * and `awaiting_action` are not released), rule 4 (an opening that throws is released), rule 5 (ADR 0088 rule 4's second
 * row for a released id, its third row reaching only live drivers) and rule 6 (a kept handle reads what it read). **What a
 * released driver is handed is the claim, and it is read at the driver's ENTRY** (`handed`, as the W142 suite reads it): a
 * settlement the driver then ignores would leave its fold as it is, so only the entry sees a release. The heap — what the
 * release is FOR — is the second observer, `examples/retention.ts release`, outside the ladder.
 */
suite('W151 — ADR 0091: a runtime releases a run when its done settles, keeps its run id, and keeps every run that has not settled', (test) => {
  /** Two task nodes in sequence, so a mid-turn prefix exists: `a` settled and `b` not yet dispatched. */
  const TWO: FlowDefinition = {
    flowId: 'two', version: 1, entry: 'a',
    nodes: [
      { id: 'a', kind: 'task', type: 'Scorer', edges: [{ to: 'b' }] },
      { id: 'b', kind: 'task', type: 'Scorer', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition;
  /** A turn of the event loop: every microtask queued so far — `settleIfTerminal`'s among them — has run. */
  const turn = () => new Promise<void>((r) => setTimeout(r, 0));
  function onRuntime(doc: RegistryDocument = DOC) {
    const s = routedSeams();
    const r = createRuntime(doc, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const open = (runId: string | undefined, flow: FlowDefinition = FLOW, extra: StartOptions = {}) => {
      const unminted: unknown[] = [];
      const failures: string[] = [];
      const h = r.start(flow, { x: 1 }, {
        ...extra,
        ...(runId !== undefined ? { runId } : {}),
        onUnmintedTask: (u) => { unminted.push(u.taskId); },
        onRunFailure: (f) => { failures.push(f.kind); },
      });
      return { ...h, unminted, failures, handed: handed(h.driver) };
    };
    return { s, r, open };
  }
  const inUseAt = (fn: () => unknown): string => {
    try { fn(); } catch (e) { if (e instanceof RunIdInUse) return e.at; throw e; }
    throw new AssertionError('expected RunIdInUse, nothing was thrown');
  };

  test('rule 1: a finished run is released from BOTH tables — its own run id reaches no driver, an unminted id only the live runs', async () => {
    const { s, open } = onRuntime();
    const [r1, r2, r3] = [open('r1'), open('r2'), open('r3')];
    s.done('r1:a:-:0');
    s.done('r3:a:-:0');
    equal([(await w77Settlement(r1.done)).outcome, (await w77Settlement(r3.done)).outcome], ['completed', 'completed'],
      'the ARRANGEMENT: r1 and r3 finished, r2 is running');
    const lengths = [r1, r3].map((x) => x.driver.foldInputs().length);
    // `byRun`: a settlement under a released run id — the task it ran, and one it never dispatched.
    s.done('r1:a:-:0');
    s.done('r3:b:-:0');
    // `every`: an id nobody minted.
    s.done('nightly-cleanup');
    equal([r1.handed, r2.handed, r3.handed], [['r1:a:-:0'], ['nightly-cleanup'], ['r3:a:-:0']],
      'r1 and r3 were handed their own settlement before done and NOTHING after; r2, live, the unminted id');
    equal([r1.unminted, r2.unminted, r3.unminted], [[], ['nightly-cleanup'], []],
      'so only the live r2 reports what nobody minted (ADR 0088 rule 4 row 3 reaches the drivers the runtime still holds)');
    equal(r3.failures, [], 'and r3 is not halted AFTER it completed by its own run id on a task it never dispatched — ID-R4 tier 2 reaches live runs only');
    equal([r1, r3].map((x) => x.driver.foldInputs().length), lengths, 'neither finished sequence grew');
    equal([r1, r3].map((x) => fold(x.driver.foldInputs()).outcome), ['completed', 'completed'], 'and both runs are still what done said they were');
    s.done('r2:a:-:0');
    equal((await w77Settlement(r2.done)).outcome, 'completed', 'the CONTROL: the live run beside them was routed throughout and completes');
  });

  test('rule 3: a run that has not settled is NOT released — a running run, and a run parked on a person, which resolve() then completes', async () => {
    const { s, open } = onRuntime();
    const running = open('run');
    const parked = open('park');
    // A non-optional task out of retries: `task.failed` THEN `task.user_action`, one object (ADR 0007 rule 2).
    s.emit('task.failed', s.detail('park:a:-:0', 'user_action'));
    s.emit('task.user_action', s.detail('park:a:-:0', 'user_action'));
    await turn();
    equal([fold(running.driver.foldInputs()).outcome, fold(parked.driver.foldInputs()).outcome], ['running', 'awaiting_action'],
      'the ARRANGEMENT: one run running, one parked — the two outcomes isTerminal calls not terminal');
    s.done('nightly-cleanup');
    equal([running.unminted, parked.unminted], [['nightly-cleanup'], ['nightly-cleanup']], 'both are still among every driver after a full turn');
    ok(parked.driver.resolve('park:a:-:0', 'done', { actor: 'a-person', result: { ok: true } }), 'the person`s resolution is accepted');
    equal((await w77Settlement(parked.done)).outcome, 'completed', 'and the parked run completes');
    s.done('run:a:-:0');
    equal(running.handed, ['nightly-cleanup', 'run:a:-:0'], 'the running run, untouched, was handed its own settlement');
    equal((await w77Settlement(running.done)).outcome, 'completed', 'and completes');
  });

  test('rule 1`s MOMENT: released at done`s quiescent point, never at a prefix that reads terminal mid-turn', () => {
    const { s, open } = onRuntime();
    const two = open('t', TWO);
    s.done('t:a:-:0');
    // The arrangement that makes this case discriminate: the prefix ending at `a`'s outcome, before `b` is dispatched,
    // READS terminal (`RN-R12`'s quiescence block) — so a release on the first terminal-looking input releases here.
    const inputs = two.driver.foldInputs();
    const atA = inputs.findIndex((i) => i.kind === 'outcome');
    ok(atA >= 0 && isTerminal(fold(inputs.slice(0, atA + 1))),
      `the ARRANGEMENT: the prefix ending at a's outcome reads ${atA >= 0 ? fold(inputs.slice(0, atA + 1)).outcome : 'nothing'}`);
    equal(s.added.map((t) => t.id), ['t:a:-:0', 't:b:-:0'], 'and the same turn dispatched b — the run is live');
    s.done('t:b:-:0');
    equal(two.handed, ['t:a:-:0', 't:b:-:0'], 'b`s settlement was HANDED: the run was not released mid-turn');
    equal(fold(two.driver.foldInputs()).outcome, 'completed', 'so the run completes');
  });

  test('rule 2: a released run`s id stays IN USE — start and resume refuse it, and the minted counter skips it', async () => {
    const { s, r, open } = onRuntime();
    const first = open('r1');
    s.done('r1:a:-:0');
    equal((await w77Settlement(first.done)).outcome, 'completed', 'the ARRANGEMENT: r1 finished');
    s.done('probe');
    equal(first.unminted, [], 'the CONTROL that it IS released: an unminted id no longer reaches it');
    const before = s.added.length;
    equal(inUseAt(() => r.start(FLOW, { x: 1 }, { runId: 'r1' })), 'r1', 'a start naming the released id is refused, naming it');
    equal(inUseAt(() => r.resume(FLOW, first.driver.checkpoint())), 'r1', 'and so is resuming the released run`s own checkpoint on this runtime');
    equal(s.added.length, before, 'both refused before any driver was built: nothing reached the scheduler');
    equal(open(undefined).driver.runId, 'r2', 'the minted counter SKIPS the released r1 — a counter that consulted live drivers alone would mint it');
    const fresh = routedSeams();
    const elsewhere = createRuntime(DOC, {}, { createPool: fresh.createPool, createScheduler: fresh.createScheduler });
    equal(elsewhere.resume(FLOW, first.driver.checkpoint()).driver.runId, 'r1', 'and the checkpoint resumes on a FRESH runtime, as RN-R25 says');
  });

  test('rule 4: an opening that THROWS releases its driver — a start FD-R4 refused hears nothing after, and its id stays in use', () => {
    const strict = edited((d) => { d.workers!.w!.inputSchema = { type: 'object', required: ['must'] }; });
    const { s, r } = onRuntime(strict);
    const reported: unknown[] = [];
    throws(() => r.start(FLOW, { x: 1 }, { runId: 'bx', onUnmintedTask: (u) => { reported.push(u.taskId); } }), 'BoundaryRefused',
      'the ARRANGEMENT: FD-R4 refuses this start');
    s.done('nightly-cleanup');
    equal(reported, [], 'its driver is not among every driver: before ADR 0091 its tier 0 reported this id, refused run or not');
    equal(inUseAt(() => r.start(FLOW, { must: 1 }, { runId: 'bx' })), 'bx', 'and its id is in use all the same (RN-R25)');
  });

  test('a HALTED run`s task still in flight settles into nobody once done has the halt — and done`s state is unchanged', async () => {
    const { s, open } = onRuntime();
    const run = open('r1');
    // Our run id on a task we never dispatched: `ID-R4` tier 2 stops the run with `a` still in flight.
    s.done('r1:b:-:0');
    const state = await w77Settlement(run.done);
    equal([state.outcome, run.failures], ['halted', ['UndispatchedTask']], 'the ARRANGEMENT: halted, with a still running');
    const length = run.driver.foldInputs().length;
    s.done('r1:a:-:0');
    equal(run.handed, ['r1:b:-:0'], 'a`s late settlement was handed to no driver (ADR 0091, its halted-run consequence)');
    equal(run.driver.foldInputs().length, length, 'so it is not appended to the halted run`s sequence, where before ADR 0091 it was');
    equal(fold(run.driver.foldInputs()), state, 'and the fold of what the run holds is still exactly what done resolved with');
  });

  test('rule 6: a caller that KEPT its handle reads everything after the release — the sequence, the log, the checkpoint and done', async () => {
    const { s, open } = onRuntime();
    const stored: FoldInput[] = [];
    // What a store keeps, built as AGENTS.md section 18 builds one: every element `onFoldInput` hands over, by position.
    const kept = open('keep', FLOW, { onFoldInput: (i, seq) => { stored[seq] = structuredClone(i); } });
    s.done('keep:a:-:0');
    const end = await w77Settlement(kept.done);
    s.done('nightly-cleanup');
    equal([end.outcome, kept.unminted], ['completed', []], 'the ARRANGEMENT: the run finished and its runtime released it — the unminted id did not reach it');
    equal(kept.driver.foldInputs(), stored, 'foldInputs() is every element the store was handed, after the release');
    equal(fold(kept.driver.foldInputs()), end, 'and folds to what done resolved with');
    equal(kept.driver.checkpoint().events, stored, 'checkpoint() holds the same events');
    equal(kept.driver.checkpoint().header, kept.header, 'and the header the handle carries');
    equal(kept.driver.snapshot().length, stored.filter((i) => i.kind === 'outcome').length, 'snapshot() is the record subsequence of what was stored');
    equal(await kept.done, end, '`done` still resolves with the same state — a promise keeps its resolution');
  });

  test('a release keeps the scheduler`s subscriptions: a run opened after EVERY run was released is routed, and nothing subscribes again', async () => {
    const { s, open } = onRuntime();
    const runs = [open('r1'), open('r2')];
    for (const x of runs) s.done(`${x.driver.runId}:a:-:0`);
    for (const x of runs) await w77Settlement(x.done);
    const subscribed = [...s.subscriptions];
    equal(subscribed.length, 5, 'the ARRANGEMENT: one subscription per subscribed event — the four settlements and `task.running` (W186) — and every run released');
    const late = open('r3');
    s.done('r3:a:-:0');
    s.done('nightly-cleanup');
    equal(s.subscriptions, subscribed, 'the scheduler was not subscribed again — an emptied list still says it is subscribed (ADR 0088 rule 2)');
    equal([late.handed, late.unminted], [['r3:a:-:0', 'nightly-cleanup'], ['nightly-cleanup']],
      'and the new run is handed its own settlement and the unminted id, once each');
    equal(runs.map((x) => x.handed), [['r1:a:-:0'], ['r2:a:-:0']], 'and neither released run hears either');
  });
  // **The four cases below are the adequacy reader's survivors, W151's fix round** (M03, M22 and M24, M21 and M23, M20):
  // each was a way to break ADR 0091 with L1-L5 still green, because every probe after a release used `task.completed`
  // on a STARTED run that COMPLETED, and no case could see a driver the caller was never handed.
  /** Every driver's entry, recorded at the PROTOTYPE, so a driver no caller holds — a refused resume's — is seen too. */
  function everyEntry(): { log: string[]; restore(): void } {
    const proto = Driver.prototype as unknown as { onEvent: (n: string, x: unknown) => void };
    const original = proto.onEvent;
    const log: string[] = [];
    proto.onEvent = function (this: { runId: string }, n: string, x: unknown) {
      const id = (x as { id?: unknown } | undefined)?.id;
      log.push(`${this.runId} ${n} ${typeof id === 'string' ? id : '(no string id)'}`);
      return original.call(this, n, x);
    };
    return { log, restore() { proto.onEvent = original; } };
  }
  /** A run of TWO on ANOTHER runtime, stored by position and cut with `a` settled and `b` in flight. */
  function storedTwo(runId: string): Checkpoint {
    const s = routedSeams();
    const other = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const store: FoldInput[] = [];
    const h = other.start(TWO, { x: 1 }, { runId, onFoldInput: (i, seq) => { store[seq] = structuredClone(i); } });
    s.done(`${runId}:a:-:0`);
    return { header: h.header, events: store.slice() };
  }

  test('rule 4, the RESUME door: a resume refused DURING its replay leaves no driver in the routing, and its id in use', () => {
    const cp = storedTwo('q');
    const tampered: Checkpoint = { header: cp.header, events: cp.events.map((x, k) => (k === 0 ? { kind: 'dispatched', taskId: 'q:b:-:0' } as FoldInput : x)) };
    const { s, r } = onRuntime();
    // Started bare, not through `open`: its instance `onEvent` is not shadowed, so the prototype instrument sees it too.
    r.start(FLOW, { x: 1 }, { runId: 'live' });
    let refused: unknown;
    try { r.resume(TWO, tampered); } catch (e) { refused = e; }
    ok(refused instanceof ResumeRefused && refused.reason === 'diverged', 'the ARRANGEMENT: refused mid-replay, so the caller holds no handle on its driver');
    const entry = everyEntry();
    try {
      s.done('nightly-cleanup');
      s.done('q:b:-:0');
    } finally { entry.restore(); }
    equal(entry.log, ['live task.completed nightly-cleanup'],
      'only the live driver is handed anything — the refused resume`s driver, spent and deaf (RN-R23), is not even handed: ADR 0091 rule 4');
    equal(inUseAt(() => r.resume(TWO, storedTwo('q'))), 'q', 'and its id is spent, as RN-R25 says of a refusal during the replay');
  });

  test('rule 1 on every door and outcome: a FAILED run, and a RESUMED run, are released when done settles', async () => {
    const { s, r, open } = onRuntime();
    const failed = open('f1');
    s.emit('task.failed', s.detail('f1:a:-:0', 'failed'));
    equal((await w77Settlement(failed.done)).outcome, 'failed', 'the ARRANGEMENT: a task settled failed on a node with no failure edge');
    const resumed = r.resume(TWO, storedTwo('k'));
    const handedResumed = handed(resumed.driver);
    s.done('k:b:-:0');
    equal((await w77Settlement(resumed.done)).outcome, 'completed', 'the ARRANGEMENT: the resumed run completes on its in-flight task');
    s.done('f1:a:-:0');
    s.done('k:b:-:0');
    s.done('nightly-cleanup');
    equal([failed.handed, handedResumed], [['f1:a:-:0'], ['k:b:-:0']], 'each was handed its settlement before done and nothing after');
    equal(failed.unminted, [], 'and the failed run reports no unminted id after done');
  });

  /**
   * **[Q606](../../doc/questions/q606.md)'s runtime row, and `RN-R31` through the runtime** — W173, ADR 0104. Two
   * cancelled runs on ONE runtime's routing: one a task the scheduler cancelled on its own ended (`RN-R28` — `done` at
   * that settlement), and one its OWNER cancelled through `driver.cancel`, which reaches the runtime's scheduler through
   * the per-run view and leaves `done` PENDING while a task still stops (`RN-R30`'s `cancelling`). The release is read as
   * ADR 0091 rule 1 says: a run handed its settlements before `done` and nothing after. The scheduler double's `cancel`
   * plays the RUNNING road (P34 fact 8): it records the call and fires nothing — each `task.cancelled` is this case's.
   */
  test('rule 1 on the CANCELLED outcome (Q606): a run the scheduler`s own cancel ended, and one its OWNER cancelled — each released when done settles, the second only after its last task stopped', async () => {
    const s = routedSeams();
    const cancels: [string, unknown][] = [];
    const createScheduler = (p: Record<string, unknown>, g: Record<string, unknown>) => {
      const sch = s.createScheduler(p, g) as unknown as Record<string, unknown>;
      sch.cancel = (id: string, o: unknown) => { cancels.push([id, o]); return new Promise<boolean>(() => {}); };
      return sch as never;
    };
    const r = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler });
    const SPLIT = {
      flowId: 'split', version: 1, entry: 'split',
      nodes: [
        { id: 'split', kind: 'fanout', branches: ['a', 'b'] },
        { id: 'a', kind: 'task', type: 'Scorer', edges: [{ to: 'collect' }] },
        { id: 'b', kind: 'task', type: 'Scorer', edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;

    // RN-R28 — no request: the scheduler's own `task.cancelled` ends the run, and `done` settles there.
    const own = r.start(FLOW, { x: 1 }, { runId: 'c1' });
    const ownHanded = handed(own.driver);
    s.emit('task.cancelled', s.detail('c1:a:-:0', 'cancelled'));
    equal((await w77Settlement(own.done)).outcome, 'cancelled', 'Q606: done resolves `cancelled` on a task.cancelled routed by createRuntime');
    s.emit('task.cancelled', s.detail('c1:a:-:0', 'cancelled'));
    s.done('c1:a:-:0');
    equal(ownHanded, ['c1:a:-:0'], 'and the run is RELEASED: handed its settlement before done and nothing after');

    // RN-R30, RN-R31 — the owner cancels a run with two tasks in flight.
    const run = r.start(SPLIT, { x: 1 }, { runId: 'k1' });
    const runHanded = handed(run.driver);
    void run.driver.cancel({ actor: 'ops', graceMs: 100 });
    equal(cancels, [['k1:a:0:0', { graceMs: 100 }], ['k1:b:1:0', { graceMs: 100 }]],
      'driver.cancel reached the RUNTIME`s scheduler through the per-run view: each task in flight, with the caller`s graceMs');
    let settled = false;
    void run.done.then(() => { settled = true; });
    s.emit('task.cancelled', s.detail('k1:a:0:0', 'cancelled'));
    await turn();
    equal([settled, fold(run.driver.foldInputs()).outcome], [false, 'cancelling'], 'done PENDING after the first task.cancelled: b is still stopping');
    s.emit('task.cancelled', s.detail('k1:b:1:0', 'cancelled'));
    const state = await w77Settlement(run.done);
    equal(state.outcome, 'cancelled', 'done resolves `cancelled` after the LAST settlement — which reached the driver, so the run was not released before it');
    equal(state, fold(run.driver.foldInputs()), 'equal to the caller`s own fold of the driver`s sequence');
    s.done('k1:a:0:0');
    s.emit('task.cancelled', s.detail('k1:b:1:0', 'cancelled'));
    equal(runHanded, ['k1:a:0:0', 'k1:b:1:0'], 'and RELEASED when done settled: both settlements handed before it, nothing after');
  });

  /**
   * **The per-run view's `cancel` is the SCHEDULER's own method, called ON the scheduler** — W173's adequacy reader
   * (A14, A15). The case above hands the runtime a CLOSURE, which reads no `this`, so an unbound forward passed it; a
   * `FyflowScheduler`'s `cancel` is a class method that reads its own fields. And over a scheduler with NO `cancel` the
   * view forwards none, so `driver.cancel` is refused by name rather than failing on `undefined`.
   */
  test('the view forwards `cancel` BOUND to the scheduler — a class method reading `this` — and a scheduler with none is refused `unsupported` through the runtime', () => {
    const SPLIT = {
      flowId: 'split', version: 1, entry: 'split',
      nodes: [
        { id: 'split', kind: 'fanout', branches: ['a', 'b'] },
        { id: 'a', kind: 'task', type: 'Scorer', edges: [{ to: 'collect' }] },
        { id: 'b', kind: 'task', type: 'Scorer', edges: [{ to: 'collect' }] },
        { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    class Plain {
      readonly workerPools: Record<string, unknown>;
      readonly groups: Record<string, unknown>;
      constructor(p: Record<string, unknown>, g: Record<string, unknown>) { this.workerPools = p; this.groups = g; }
      addTask(): void {}
      addEventListener(): void {}
      shutdown(): Promise<void> { return Promise.resolve(); }
    }
    class WithCancel extends Plain {
      readonly sent: string[] = [];
      cancel(id: string): Promise<boolean> { this.sent.push(id); return new Promise<boolean>(() => {}); }
    }
    const s = routedSeams();
    let made: WithCancel | null = null;
    const r = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: (p, g) => (made = new WithCancel(p, g)) as never });
    const run = r.start(SPLIT, { x: 1 }, { runId: 'm1' });
    void run.driver.cancel({ actor: 'ops' });
    equal(made!.sent, ['m1:a:0:0', 'm1:b:1:0'], 'each task reached the scheduler`s own method, with `this` the scheduler');

    const plain = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: (p, g) => new Plain(p, g) as never });
    const other = plain.start(SPLIT, { x: 1 }, { runId: 'm2' });
    let reason: unknown = 'nothing thrown';
    try { void other.driver.cancel({ actor: 'ops' }); } catch (e) { reason = e instanceof RunControlRefused ? e.reason : String(e); }
    equal(reason, 'unsupported', 'refused by name through the runtime, not a TypeError on an undefined member');
    equal(fold(other.driver.foldInputs()).outcome, 'running', 'and nothing recorded: the run is still running');
  });

  test('rule 1 on every event NAME: after release, task.failed and task.user_action reach the released run neither by its id nor unminted', async () => {
    const { s, open } = onRuntime();
    const done1 = open('r1');
    const live = open('r2');
    s.done('r1:a:-:0');
    await w77Settlement(done1.done);
    s.emit('task.failed', s.detail('r1:a:-:0', 'failed'));
    s.emit('task.failed', s.detail('r1:a:-:0', 'user_action'));
    s.emit('task.user_action', s.detail('r1:a:-:0', 'user_action'));
    s.emit('task.failed', s.detail('cleanup-f', 'failed'));
    s.emit('task.user_action', s.detail('cleanup-u', 'user_action'));
    equal(done1.handed, ['r1:a:-:0'], 'r1 is handed nothing after done on either of the other two event names (its byRun entry is gone for all three)');
    equal([done1.unminted, live.unminted], [[], ['cleanup-f', 'cleanup-u']], 'and the unminted ids on both reach the live r2 alone (every list of every name)');
  });

  test('rule 5: after a release the remaining drivers are handed an unminted id IN SUBSCRIPTION ORDER', async () => {
    const { s, open } = onRuntime();
    const runs = [open('r1'), open('r2'), open('r3')];
    const together: string[] = [];
    for (const x of runs) onDeliveryInto(x.driver, (id) => together.push(`${x.driver.runId} ${id}`));
    s.done('r2:a:-:0');
    await w77Settlement(runs[1]!.done);
    s.done('nightly-cleanup');
    equal(together, ['r2 r2:a:-:0', 'r1 nightly-cleanup', 'r3 nightly-cleanup'], 'r1 then r3 — the order they subscribed in, r2 released between them');
  });
});

/**
 * **W174 — `RN-R33` through the runtime**: [ADR 0105](../../doc/decisions/0105-a-run-its-owner-stops-goes-deaf-before-it-cancels-and-resumes-elsewhere.md),
 * P34 stop-and-ask (d), ladder L1. A run STOPPED on one runtime — by `RunHandle.stop()`, and by `handle.driver.stop()` —
 * settles its `done` with `interrupted` only once the stop's cancels have RESOLVED (the driver is deaf, so the fold cannot
 * say when), is released then (ADR 0091 rule 1), touches no sibling run on the same runtime, and its checkpoint resumes on
 * a FRESH runtime to `completed` while the first refuses its id (`RN-R25`). The scheduler double's `cancel` records each
 * call and resolves only when the case says the task has stopped — the RUNNING road (P34 fact 8).
 */
suite('W174 — a STOPPED run`s done settles `interrupted` once its cancels resolve, a sibling untouched, and its checkpoint resumes on a fresh runtime', (test) => {
  const SPLIT = {
    flowId: 'split', version: 1, entry: 'split',
    nodes: [
      { id: 'split', kind: 'fanout', branches: ['a', 'b'] },
      { id: 'a', kind: 'task', type: 'Scorer', edges: [{ to: 'collect' }] },
      { id: 'b', kind: 'task', type: 'Scorer', edges: [{ to: 'collect' }] },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition;
  const turn = () => new Promise<void>((r) => setTimeout(r, 0));
  /** A runtime on `routedSeams`, its scheduler given a `cancel` the case resolves by task id. */
  function stoppable() {
    const s = routedSeams();
    const cancels: [string, unknown][] = [];
    const stopping = new Map<string, (v: boolean) => void>();
    const createScheduler = (p: Record<string, unknown>, g: Record<string, unknown>) => {
      const sch = s.createScheduler(p, g) as unknown as Record<string, unknown>;
      sch.cancel = (id: string, o: unknown) => {
        cancels.push([id, o]);
        return new Promise<boolean>((res) => { stopping.set(id, res); });
      };
      return sch as never;
    };
    const r = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler });
    /** The worker of `id` has stopped: the scheduler fires `task.cancelled`, then its `cancel()` resolves. */
    const stops = (id: string) => { s.emit('task.cancelled', s.detail(id, 'cancelled')); stopping.get(id)!(true); };
    return { s, r, cancels, stops };
  }

  test('RunHandle.stop(): done PENDING until the last cancel resolves, then `interrupted` and released — the sibling untouched and completing — and the checkpoint resumed on a FRESH runtime', async () => {
    const A = stoppable();
    const sibling = A.r.start(FLOW, { x: 1 }, { runId: 's1' });
    const run = A.r.start(SPLIT, { x: 1 }, { runId: 'k1' });
    const runHanded = handed(run.driver);
    const before = run.driver.foldInputs().length;
    let settled = false;
    void run.done.then(() => { settled = true; });
    const stopped = run.stop({ actor: 'ops', reason: 'upgrade' });
    equal(A.cancels, [['k1:a:0:0', { reason: 'upgrade' }], ['k1:b:1:0', { reason: 'upgrade' }]],
      'the stop reached the RUNTIME`s scheduler through the per-run view: each of k1`s tasks in flight, and none of s1`s');
    equal(run.driver.foldInputs().length, before + 1, 'ONE element appended');
    await turn();
    equal([settled, fold(run.driver.foldInputs()).outcome], [false, 'interrupted'],
      'done PENDING though the fold already reads `interrupted` — terminal — while both cancels are unresolved');
    A.stops('k1:a:0:0');
    await turn();
    equal(settled, false, 'still pending while b`s cancel is unresolved');
    A.stops('k1:b:1:0');
    const state = await w77Settlement(run.done);
    equal(state.outcome, 'interrupted', 'done settles `interrupted` once the LAST cancel resolved');
    equal(state, fold(run.driver.foldInputs()), 'equal to the caller`s own fold of the driver`s sequence');
    equal(run.driver.foldInputs().length, before + 1, 'and neither `task.cancelled` was appended — the driver was deaf');
    await stopped;
    equal(runHanded, ['k1:a:0:0', 'k1:b:1:0'], 'the two settlements REACHED the driver before done (and were not heard)');
    A.stops('k1:a:0:0');
    equal(runHanded, ['k1:a:0:0', 'k1:b:1:0'], 'and RELEASED when done settled: nothing reaches it after');

    // The SIBLING: untouched by the stop, and it completes.
    equal(fold(sibling.driver.foldInputs()).outcome, 'running', 'the sibling is still running — no element, no cancel');
    A.s.done('s1:a:-:0');
    equal((await w77Settlement(sibling.done)).outcome, 'completed', 'and it completes on the same runtime');

    // RESUMED on a FRESH runtime — the first refuses the id (RN-R25).
    const cp = structuredClone(run.driver.checkpoint()) as Checkpoint;
    let inUse = 'nothing thrown';
    try { A.r.resume(SPLIT, cp); } catch (e) { inUse = e instanceof RunIdInUse ? e.at : String(e); }
    equal(inUse, 'k1', 'the stopping runtime keeps k1 in use');
    const B = stoppable();
    const resumed = B.r.resume(SPLIT, cp);
    equal(B.s.added.map((t) => t.id), ['k1:a:0:0', 'k1:b:1:0'], 'the fresh runtime is handed EXACTLY the stopped in-flight set, at the same ids');
    B.s.done('k1:a:0:0');
    B.s.done('k1:b:1:0');
    const end = await w77Settlement(resumed.done);
    equal([end.outcome, end.resumes, end.interruption], ['completed', [['k1:a:0:0', 'k1:b:1:0']], null], 'to `completed` on runtime B, the resume recorded and the stop ended');
  });

  test('handle.driver.stop() settles done the same way, and a PARKED run stopped settles at once with resolve() refused', async () => {
    const A = stoppable();
    const run = A.r.start(SPLIT, { x: 1 }, { runId: 'd1' });
    let settled = false;
    void run.done.then(() => { settled = true; });
    void run.driver.stop({ actor: 'ops' });
    A.stops('d1:a:0:0');
    await turn();
    equal(settled, false, 'through the DRIVER too, done waits on the cancel still unresolved');
    A.stops('d1:b:1:0');
    equal((await w77Settlement(run.done)).outcome, 'interrupted', 'and settles `interrupted` once it resolves');

    const parked = A.r.start(FLOW, { x: 1 }, { runId: 'p1' });
    A.s.emit('task.failed', A.s.detail('p1:a:-:0', 'user_action'));
    A.s.emit('task.user_action', A.s.detail('p1:a:-:0', 'user_action'));
    await turn();
    equal(fold(parked.driver.foldInputs()).outcome, 'awaiting_action', 'the ARRANGEMENT: p1 parked, nothing in flight');
    const sent = A.cancels.length;
    await parked.stop({ actor: 'ops' });
    equal(A.cancels.length, sent, 'nothing sent for a parked task');
    equal((await w77Settlement(parked.done)).outcome, 'interrupted', 'done settles — which `awaiting_action` never would (ADR 0091 rule 3)');
    equal(parked.driver.resolve('p1:a:-:0', 'done', { actor: 'ops', result: null }), false, 'and resolve() is refused on this runtime');
  });

  /**
   * **W178 — both throwing-callback fixes THROUGH `createRuntime`** (its adequacy reader, finding 1): the runtime routes a
   * scheduler event to the driver's listener (P35 fact 10's road, `runtime.ts`), and its `done` is the caller's fold.
   * (j): a pause called from `onFoldInput` on a SETTLEMENT is taken when that event's step ends, and the callback throws on
   * `paused` — nothing leaves the event, `onRunFailure` hears it once, `done` settles `halted`. (o): a callback throwing on
   * `cancelRequested` — the throw at the caller, both tasks still sent their cancel, and `done` settles `cancelled` once
   * both have stopped.
   */
  test('W178: a callback THROWING on `paused` taken at a settlement`s step end settles done `halted`, reported once, nothing escaping the event; one THROWING on `cancelRequested` still sends every cancel — and, since W184, HALTS the run: done settles `halted` at once', async () => {
    const LINE2 = {
      flowId: 'line2', version: 1, entry: 'x',
      nodes: [
        { id: 'x', kind: 'task', type: 'Scorer', edges: [{ to: 'y' }] },
        { id: 'y', kind: 'task', type: 'Scorer', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const boom = new Error('W178: the consumer`s store failed');
    const A = stoppable();

    // (j), and its CONTROL: the same run whose callback does not throw.
    const paused = (throws: boolean, runId: string) => {
      const box: { driver?: Driver } = {};
      const failures: unknown[] = [];
      const h = A.r.start(LINE2, { x: 1 }, {
        runId,
        onFoldInput: (e: FoldInput) => {
          if (e.kind === 'outcome' && e.record.taskId === `${runId}:x:-:0`) box.driver!.pause({ actor: 'ops' });
          if (throws && e.kind === 'paused') throw boom;
        },
        onRunFailure: (f) => { failures.push(f.cause); },
      });
      box.driver = h.driver;
      let escaped: unknown = null;
      try { A.s.done(`${runId}:x:-:0`); } catch (x) { escaped = x; }
      return { h, failures, escaped };
    };
    const c = paused(false, 'pc');
    equal([c.escaped, c.failures, fold(c.h.driver.foldInputs()).outcome], [null, [], 'running'], 'the control: paused, running, nothing reported');
    const t = paused(true, 'pt');
    equal(t.escaped, null, 'NOTHING leaves the scheduler event the runtime routed — fact 10`s road');
    equal(t.failures, [boom], 'onRunFailure hears it ONCE, the consumer`s own error');
    equal((await w77Settlement(t.h.done)).outcome, 'halted', 'and done settles `halted`');

    // (o) through the runtime's per-run view.
    const run = A.r.start(SPLIT, { x: 1 }, {
      runId: 'ko',
      onFoldInput: (e: FoldInput) => { if (e.kind === 'cancelRequested') throw boom; },
    });
    let thrown: unknown = null;
    try { void run.driver.cancel({ actor: 'ops' }); } catch (x) { thrown = x; }
    equal(thrown, boom, 'the throw reaches cancel()`s caller');
    equal(A.cancels.filter(([id]) => id.startsWith('ko:')).map(([id]) => id), ['ko:a:0:0', 'ko:b:1:0'],
      'and both tasks in flight were sent their cancel through the per-run view — though the callback threw');
    // W184 (P36 (b), `OR-R10` v0.19): the throw on the cancel's own element HALTS the run, and `halted` outranks
    // `cancelling` — so `done` settles `halted` AT ONCE, not after the last task stops (`RN-R33`'s clause: a halted run's
    // tasks run on unheard by construction). Before W184 it settled `cancelled` after the last.
    equal((await w77Settlement(run.done)).outcome, 'halted', 'done settles `halted` at once — both tasks still stopping');
    A.stops('ko:a:0:0');
    A.stops('ko:b:1:0');
  });
});

/**
 * **W184 — a consumer callback that THROWS, through `createRuntime`**: P35's retro (k), P36 stop-and-asks (b) and (c),
 * `spec/outcome-record.md` `OR-R10` v0.19, `spec/run-state.md` `RN-R22` and `RN-R33` v0.24,
 * [W184](../../doc/work-items/w184-a-consumer-callback-that-throws-on-every-road.md). Its own suite (the readers' C6):
 * the run it drives settles `halted`, never `interrupted`. The L2 sweep is `test/driver/throwing-callback.test.ts`.
 */
suite('W184 — through createRuntime: a callback that THROWS on a stop`s element or on `resumed` HALTS the run — done `halted` at once, the cancels sent, nothing handed on, the run id spent', (test) => {
  const SPLIT = {
    flowId: 'split', version: 1, entry: 'split',
    nodes: [
      { id: 'split', kind: 'fanout', branches: ['a', 'b'] },
      { id: 'a', kind: 'task', type: 'Scorer', edges: [{ to: 'collect' }] },
      { id: 'b', kind: 'task', type: 'Scorer', edges: [{ to: 'collect' }] },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition;
  /** A runtime on `routedSeams`, its scheduler's `cancel` left UNRESOLVED until the case says a task stopped. */
  function stoppable() {
    const s = routedSeams();
    const cancels: [string, unknown][] = [];
    const stopping = new Map<string, (v: boolean) => void>();
    const createScheduler = (p: Record<string, unknown>, g: Record<string, unknown>) => {
      const sch = s.createScheduler(p, g) as unknown as Record<string, unknown>;
      sch.cancel = (id: string, o: unknown) => {
        cancels.push([id, o]);
        return new Promise<boolean>((res) => { stopping.set(id, res); });
      };
      return sch as never;
    };
    const r = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler });
    const stops = (id: string) => { s.emit('task.cancelled', s.detail(id, 'cancelled')); stopping.get(id)!(true); };
    return { s, r, cancels, stops };
  }

  test('handle.stop() whose callback THROWS on `interrupted` halts the run, done settling `halted` at once with the cancels sent; runtime.resume() whose callback throws on `resumed` throws the consumer`s error, hands NOTHING on, and spends the run id (P36 (b), (c))', async () => {
    const boom = new Error('W184: the consumer`s store failed');
    const A = stoppable();
    // (b) a stop at rest through the handle: the cancels sent through the per-run view, the throw at the caller, and
    // `done` `halted` — not `interrupted`, so it does not wait on the cancels.
    const failures: unknown[] = [];
    const run = A.r.start(SPLIT, { x: 1 }, {
      runId: 'hs',
      onFoldInput: (e: FoldInput) => { if (e.kind === 'interrupted') throw boom; },
      onRunFailure: (f) => { failures.push(f.cause); },
    });
    let thrown: unknown = null;
    try { void run.stop({ actor: 'ops' }); } catch (x) { thrown = x; }
    equal(thrown, boom, 'the consumer`s throw reaches handle.stop()`s caller');
    equal(A.cancels.filter(([id]) => id.startsWith('hs:')).map(([id]) => id), ['hs:a:0:0', 'hs:b:1:0'],
      'both tasks in flight were sent their cancel through the per-run view — in the take`s `finally`');
    equal(failures, [boom], 'onRunFailure hears it ONCE');
    equal((await w77Settlement(run.done)).outcome, 'halted', 'done settles `halted` at once, both cancels unresolved');
    A.stops('hs:a:0:0');
    A.stops('hs:b:1:0');

    // (c) a resume on a FRESH runtime whose callback throws on `resumed`: the consumer's error at runtime.resume()'s
    // caller, nothing handed to B's scheduler, and B keeps the run id — a driver was built for it (ADR 0091 rule 4).
    const first = A.r.start(SPLIT, { x: 1 }, { runId: 'hr' });
    const cp = structuredClone(first.driver.checkpoint()) as Checkpoint;
    const B = stoppable();
    const bFailures: unknown[] = [];
    let resumeThrew: unknown = null;
    try {
      B.r.resume(SPLIT, cp, {
        onFoldInput: (e: FoldInput) => { if (e.kind === 'resumed') throw boom; },
        onRunFailure: (f) => { bFailures.push(f.cause); },
      });
    } catch (x) { resumeThrew = x; }
    equal(resumeThrew, boom, 'the consumer`s own error reaches runtime.resume()`s caller — not ResumeRefused');
    equal(B.s.added.map((t) => t.id), [], 'NOTHING handed to the fresh runtime`s scheduler: the in-flight a and b stay unhanded');
    equal(bFailures, [boom], 'reported ONCE');
    let inUse: unknown = null;
    try { B.r.resume(SPLIT, cp); } catch (x) { inUse = x; }
    ok(inUse instanceof RunIdInUse, `and the run id is spent on that runtime: ${String(inUse)}`);
  });
});

/**
 * **W185 — `RN-R39` through the runtime**: P36 decision 1, stop-and-asks (d) and (e),
 * [ADR 0112](../../doc/decisions/0112-a-run-delivers-its-header-before-its-first-event.md),
 * [W185](../../doc/work-items/w185-the-header-before-the-first-event.md). `onHeader` is a `DriverOptions` member in
 * `StartOptions`' `Pick` and the DRIVER calls it, so the runtime's only part is to forward it — and to be what a store
 * meets: the header it hands `onHeader` IS the one `handle.header` carries, it comes before the first element the
 * COMPOSED `onFoldInput` hands on and before the first `addTask` the per-run view passes to the scheduler, and a throw
 * from it costs what any opening that throws after its driver exists costs — the run id (ADR 0091 rule 4). Expected values
 * from (e) and `RN-R15`, never read off a run; each order beside the control showing the log SAW what follows.
 */
suite('W185 — through createRuntime: onHeader is handed the header inside start(), before the first element and before anything reaches the scheduler — and a throw starts nothing and spends the run id', (test) => {
  /** A runtime on `seams()`, its scheduler's `addTask` writing to `log` too — the one log the order is read from. */
  function logged(log: string[]) {
    const s = seams();
    const createScheduler = (p: Record<string, unknown>, g: Record<string, unknown>) => {
      const sch = s.createScheduler(p, g) as unknown as { addTask: (t: unknown) => void };
      const add = sch.addTask.bind(sch);
      sch.addTask = (t: unknown) => { log.push(`add ${(t as { id: string }).id}`); add(t); };
      return sch as never;
    };
    return { s, r: createRuntime(DOC, {}, { createPool: s.createPool, createScheduler }) };
  }

  test('once, BEFORE the first element and BEFORE the first addTask, and equal to handle.header — on the runtime`s second minted run', () => {
    const log: string[] = [];
    const { s, r } = logged(log);
    r.start(FLOW, { first: true });
    log.length = 0;
    const headers: unknown[] = [];
    const payload = { n: 1, nested: { k: 'v' } };
    const h = r.start(FLOW, payload, {
      onHeader: (x) => { log.push('header'); headers.push(x); },
      onFoldInput: (e, seq) => { log.push(`fold ${seq} ${e.kind}`); },
    });
    payload.nested.k = 'MUTATED AFTER START';
    // The CONTROL: the log SAW this run's element and its hand-off.
    equal(log.slice(1).sort(), ['add r2:a:-:0', 'fold 0 dispatched'], 'the CONTROL: the run`s one element and one hand-off are in the log');
    equal(log[0], 'header', 'and the header came FIRST — before the element the composed onFoldInput handed on AND before the addTask');
    equal(headers.length, 1, 'onHeader is called ONCE');
    equal(headers[0], { format: 2, runId: 'r2', flowId: 'f', version: 1, entryPayload: { n: 1, nested: { k: 'v' } } },
      'RN-R15`s five facts — the runtime`s SECOND minted run, r2, so a default position differs — the payload as it was passed');
    equal(headers[0], h.header, 'the SAME header the handle carries, field for field');
    ok(headers[0] !== h.header && Object.isFrozen(headers[0]), 'a separate, frozen copy of it');
    equal(s.added.map((t) => t.id), ['r1:a:-:0', 'r2:a:-:0'], 'and each run handed on its own entry task');
  });

  test('a THROW: start() throws the consumer`s error, NOTHING reaches the scheduler, nothing is reported — and the run id is SPENT on this runtime', () => {
    const log: string[] = [];
    const { s, r } = logged(log);
    const boom = new Error('W185: the store could not write the header');
    const failures: unknown[] = [];
    let folds = 0;
    let thrown: unknown = null;
    try {
      r.start(FLOW, { n: 1 }, {
        runId: 'hx',
        onHeader: () => { throw boom; },
        onFoldInput: () => { folds += 1; },
        onRunFailure: (f) => { failures.push(f); },
      });
    } catch (x) { thrown = x; }
    ok(thrown === boom, `the consumer's own error reaches runtime.start()'s caller: ${String(thrown)}`);
    equal(s.added.map((t) => t.id), [], 'NOTHING handed to the scheduler');
    equal([folds, failures.length], [0, 0], 'no element handed on, and onRunFailure not called — no run exists');
    let inUse: unknown = null;
    try { r.start(FLOW, { n: 2 }, { runId: 'hx' }); } catch (x) { inUse = x; }
    ok(inUse instanceof RunIdInUse, `the id is SPENT: a driver was built for it before onHeader threw (ADR 0091 rule 4) — ${String(inUse)}`);
    // The CONTROL: the same runtime, another id, the SAME three observers — each shown live: this run's hand-off, its
    // element, and a failure its settlement reports (a result `structuredClone` refuses: `UncloneableResult`, `OR-R6`).
    let controlFolds = 0;
    const controlFailures: string[] = [];
    r.start(FLOW, { n: 3 }, { runId: 'hy', onFoldInput: () => { controlFolds += 1; }, onRunFailure: (f) => { controlFailures.push(f.kind); } });
    equal(s.added.map((t) => t.id), ['hy:a:-:0'], 'the CONTROL: another run on the same runtime IS handed on, and the log sees it');
    equal(log, ['add hy:a:-:0'], 'and the one log holds exactly that');
    s.settle('hy:a:-:0', { fn: () => 1 });
    ok(controlFolds > 0, `the CONTROL: the fold observer is live — ${controlFolds} element(s)`);
    equal(controlFailures, ['UncloneableResult'], 'the CONTROL: the failure observer is live — it hears a refusal');
  });

  test('runtime.resume() never calls it — ResumeOptions omits it, and one passed anyway is not called', () => {
    const first = logged([]);
    const run = first.r.start(FLOW, { n: 1 }, { runId: 'rr' });
    const cp = structuredClone(run.driver.checkpoint()) as Checkpoint;
    const second = logged([]);
    let calls = 0;
    // A caller defeating the type: `ResumeOptions` has no onHeader, and the driver's resume() never calls one.
    second.r.resume(FLOW, cp, { onHeader: () => { calls += 1; } } as never);
    equal(second.s.added.map((t) => t.id), ['rr:a:-:0'], 'the CONTROL: the resume ran and re-dispatched what was in flight');
    equal(calls, 0, 'and onHeader was not called');
  });
});

/**
 * **W181 — `RN-R38` through the runtime**: P35 stop-and-ask (g), [W181](../../doc/work-items/w181-an-ask-under-run-control.md).
 * A run parked on an ASK, under the owner's run control, on `routedSeams` — every `addTask` and every `cancel` the
 * runtime's scheduler is handed recorded. **Expected values from (g) and `RN-R30`/`RN-R32`/`RN-R35`, never from a run**: a
 * cancel sends nothing (the ask is not in flight) and `done` settles `cancelled` AT ONCE — no task to stop; a stop sends
 * nothing and `done` settles `interrupted` at once, the answer refused on that runtime, and the checkpoint resumes on a
 * FRESH runtime with NOTHING handed to its scheduler, re-parked, answered to `completed`; a paused run's answer is accepted
 * and its successor held until the unpause, `done` pending throughout. Each beside its control.
 */
suite('W181 — a run parked on an ASK: cancelled and stopped with nothing sent and done settling at once, resumed on a fresh runtime, and answered while paused', (test) => {
  const ASKING = {
    flowId: 'asking', version: 1, entry: 'a',
    nodes: [
      { id: 'a', kind: 'task', type: 'Scorer', edges: [{ to: 'approve' }] },
      { id: 'approve', kind: 'ask', edges: [{ to: 'b' }] },
      { id: 'b', kind: 'task', type: 'Scorer', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition;
  const turn = () => new Promise<void>((r) => setTimeout(r, 0));
  /**
   * A runtime on `routedSeams`, its scheduler given a `cancel` that records and never resolves on its own — but answers
   * `false` at once for an id it was never handed, as the scheduler does, so a cancel sent for an ask fails an assertion
   * here rather than hanging the `stop()` a case awaits.
   */
  function runtimeOf() {
    const s = routedSeams();
    const cancels: string[] = [];
    const createScheduler = (p: Record<string, unknown>, g: Record<string, unknown>) => {
      const sch = s.createScheduler(p, g) as unknown as Record<string, unknown>;
      sch.cancel = (id: string) => {
        cancels.push(id);
        return s.added.some((t) => t.id === id) ? new Promise<boolean>(() => {}) : Promise.resolve(false);
      };
      return sch as never;
    };
    return { s, cancels, r: createRuntime(DOC, {}, { createPool: s.createPool, createScheduler }) };
  }
  /** Started, its first task settled: parked on the ask, nothing in flight. */
  async function parked(rt: ReturnType<typeof runtimeOf>, runId: string) {
    const h = rt.r.start(ASKING, { x: 1 }, { runId });
    rt.s.done(`${runId}:a:-:0`);
    await turn();
    return h;
  }
  const ids = (rt: ReturnType<typeof runtimeOf>) => rt.s.added.map((t) => t.id);

  test('a CANCEL sends nothing and done settles `cancelled` at once; a STOP sends nothing, settles `interrupted` at once, refuses the answer, and resumes on a FRESH runtime re-parked with nothing handed on, to `completed`', async () => {
    const A = runtimeOf();
    const c = await parked(A, 'c1');
    let settled = false;
    void c.done.then(() => { settled = true; });
    await turn();
    equal([fold(c.driver.foldInputs()).outcome, settled], ['awaiting_action', false], 'the ARRANGEMENT: parked on the ask, done PENDING (ADR 0091 rule 3)');
    await c.driver.cancel({ actor: 'ops' });
    equal(A.cancels, [], 'the cancel sends the scheduler NOTHING — the ask is not in flight');
    equal((await w77Settlement(c.done)).outcome, 'cancelled', 'and done settles `cancelled` — no task to wait for');
    equal(ids(A), ['c1:a:-:0'], 'nothing handed on for the ask, ever');

    const s1 = await parked(A, 's1');
    await s1.stop({ actor: 'ops' });
    equal(A.cancels, [], 'the stop sends nothing either');
    const st = await w77Settlement(s1.done);
    equal(st.outcome, 'interrupted', 'done settles `interrupted` at once — no cancel to wait on');
    equal(s1.driver.resolve('s1:approve:-:0', 'done', { result: 1, actor: 'ana' }), false, 'the answer is refused on runtime A');
    const cp = structuredClone(s1.driver.checkpoint()) as Checkpoint;
    const B = runtimeOf();
    const resumed = B.r.resume(ASKING, cp);
    equal(ids(B), [], 'the FRESH runtime`s scheduler is handed NOTHING: the ask is re-parked, never in flight');
    equal(fold(resumed.driver.foldInputs()).nodes['s1:approve:-:0']!.input, { ok: true }, 'with the same kept input — `a`s result');
    ok(resumed.driver.resolve('s1:approve:-:0', 'done', { result: 7, actor: 'ana' }), 'answered on runtime B');
    equal(ids(B), ['s1:b:-:0'], 'its successor handed to B`s scheduler');
    B.s.done('s1:b:-:0');
    equal((await w77Settlement(resumed.done)).outcome, 'completed', 'to `completed` on runtime B');
    equal(ids(A), ['c1:a:-:0', 's1:a:-:0'], 'and runtime A was handed nothing after the stop');
    // CONTROL — a run with a TASK running is not settled at its stop: done waits on the cancel (W174's suite, above).
    const k = A.r.start(FLOW, { x: 1 }, { runId: 'k1' });
    void k.stop({ actor: 'ops' });
    equal(A.cancels, ['k1:a:-:0'], 'the CONTROL: a running task IS sent the stop`s cancel');
    let kSettled = false;
    void k.done.then(() => { kSettled = true; });
    await turn();
    equal(kSettled, false, 'and done waits on it');
  });

  test('a PAUSED run`s answer is accepted and its successor HELD until the unpause, done pending throughout, then `completed`', async () => {
    const A = runtimeOf();
    const p = await parked(A, 'p1');
    p.driver.pause({ actor: 'ops' });
    ok(p.driver.resolve('p1:approve:-:0', 'done', { result: 7, actor: 'ana' }), 'answered while paused');
    let settled = false;
    void p.done.then(() => { settled = true; });
    await turn();
    equal([ids(A), settled, fold(p.driver.foldInputs()).outcome], [['p1:a:-:0'], false, 'running'], 'the successor dispatched and HELD — nothing handed on, done pending, the run `running`');
    p.driver.unpause({ actor: 'ops' });
    equal(ids(A), ['p1:a:-:0', 'p1:b:-:0'], 'the unpause hands it on');
    A.s.done('p1:b:-:0');
    equal((await w77Settlement(p.done)).outcome, 'completed', 'and done settles `completed`');
    // CONTROL — not paused: the answer hands the successor on in the call.
    const q = await parked(A, 'q1');
    q.driver.resolve('q1:approve:-:0', 'done', { result: 7, actor: 'ana' });
    equal(ids(A).filter((i) => i.startsWith('q1:')), ['q1:a:-:0', 'q1:b:-:0'], 'the CONTROL: handed on at once');
  });
});

/** A flow on `Plain` alone — no node reaches a keyed group — used by W163's cases as the run that SHOULD start. */
const FLOW_ON_PLAIN = {
  flowId: 'plain', version: 1, entry: 'a',
  nodes: [
    { id: 'a', kind: 'task', type: 'Plain', edges: [{ to: 'done' }] },
    { id: 'done', kind: 'end', outcome: 'completed' },
  ],
} as unknown as FlowDefinition;

/**
 * **W163 — what `start` refuses that the flow does not decide** —
 * [ADR 0097](../../doc/decisions/0097-what-start-refuses-that-the-flow-does-not-decide.md), `FD-R6`
 * (`spec/flow-definition.md` section 6), P37 fact 1 and stop-and-asks (b) and (c), ladder L1.
 *
 * **Every expected value is the spec's or P37 fact 1's, never this module's output**: the roads are fact 1's table, one
 * case per row — the TYPE's pool naming the keyed group, the NODE naming it in `workerGroups`, the keyed node SECOND —
 * and its two controls, a `RateLimitGroup` in its place and a `createTask` setting `limitKey`; what the refusal names is
 * ADR 0097 rule 4's list (the node, the group, both working roads, Q248); `FD-V30`'s message on `defaultRetryPolicy` is
 * the one `new Driver` throws for the same value, read BY HAND. "Before any driver exists" is observed on the scheduler
 * seam — a driver subscribes to its scheduler, so a refusal that built none leaves it with no listener — beside a
 * control in which a valid start does subscribe.
 */
suite('W163 — what start refuses that the flow does not decide: FD-R6, a node reaching a built-in keyed group, and defaultRetryPolicy at construction (ADR 0097)', (test) => {
  const WINDOWS = [{ limit: 2, windowMs: 1000 }];
  /** P37 fact 1's registry: one worker, a group `api` of the BUILT-IN keyed type, a `RateLimitGroup` `flat` for the control. */
  const KEYED_DOC = {
    workers: { w: { url: 'https://example.test/w.js' } },
    groups: {
      api: { type: 'KeyedRateLimitGroup', config: { windows: WINDOWS } },
      flat: { type: 'RateLimitGroup', config: { windows: WINDOWS } },
    },
    nodeTypes: {
      Plain: { worker: 'w', inline: true },
      Keyed: { worker: 'w', inline: true, groups: ['api'] },
      Flat: { worker: 'w', inline: true, groups: ['flat'] },
    },
  } as unknown as RegistryDocument;
  const flowOf = (flowId: string, nodes: Record<string, unknown>[]): FlowDefinition => ({
    flowId, version: 1, entry: nodes[0]!.id as string,
    nodes: [...nodes, { id: 'done', kind: 'end', outcome: 'completed' }],
  }) as unknown as FlowDefinition;
  const task = (id: string, type: string, to: string, extra: Record<string, unknown> = {}) => ({ id, kind: 'task', type, ...extra, edges: [{ to }] });
  /** P37 fact 1's three refused roads: [label, flow, the node FD-R6 is at]. */
  const ROADS: [string, FlowDefinition, string][] = [
    ['the TYPE`s pool names `api`, entry node', flowOf('type-pool', [task('a', 'Keyed', 'done')]), 'a'],
    ['the NODE names `api` in workerGroups, entry node', flowOf('node-groups', [task('a', 'Plain', 'done', { workerGroups: ['api'] })]), 'a'],
    ['the keyed node is the SECOND node', flowOf('second', [task('a', 'Plain', 'b'), task('b', 'Keyed', 'done')]), 'b'],
  ];
  /**
   * ADR 0097 rule 4: what the refusal names, beside the node — the group, BOTH working roads, and Q248. Each road by a
   * phrase only its own sentence carries (the adequacy reader's F4: `createTask` and `limitKey` also appear in the
   * sentence saying why, so deleting the createTask ROAD's sentence passed): `sets limitKey` is the first road's,
   * `code.groupTypes` and `keyFrom that derives` the second's.
   */
  const NAMED = ['"api"', 'createTask', 'sets limitKey', 'keyFrom that derives', 'code.groupTypes', 'Q248'];
  /** The seams, and how many times the scheduler was SUBSCRIBED to — a driver subscribes, so 0 means none was built. */
  const watched = () => {
    const s = seams();
    let subscribed = 0;
    const createScheduler = (p: Record<string, unknown>, g: Record<string, unknown>) => {
      const sch = s.createScheduler(p, g) as unknown as { addEventListener: (...a: unknown[]) => void };
      const original = sch.addEventListener.bind(sch);
      sch.addEventListener = (...a: unknown[]) => { subscribed++; original(...a); };
      return sch as never;
    };
    return { s, createScheduler, subscribed: () => subscribed };
  };
  const refusalOf = (fn: () => unknown): unknown => {
    try { fn(); } catch (e) { return e; }
    return null;
  };
  /** What `new Driver` throws for `defaultRetryPolicy: v` over a good runtime's registry — `start`'s own class and message, by hand. */
  const inert = { addTask() {}, addEventListener() {} };
  const driverRefusal = (v: unknown): InvalidDefinition | null => {
    const good = createRuntime(DOC, {}, { createPool: seams().createPool, createScheduler: seams().createScheduler });
    try {
      new Driver(FLOW, { ...good.registry, runId: 'hand', scheduler: inert, joinPolicy: liveToken, defaultRetryPolicy: v as never });
      return null;
    } catch (e) {
      if (e instanceof InvalidDefinition) return e;
      throw e;
    }
  };

  test('FD-R6 on each of P37 fact 1`s three roads: check reports it at the node, and start refuses it as LimitKeyMissing naming the node, the group, both roads and Q248 — before any driver exists, spending no run id', () => {
    for (const [label, flow, at] of ROADS) {
      const w = watched();
      const r = createRuntime(KEYED_DOC, {}, { createPool: w.s.createPool, createScheduler: w.createScheduler });
      const found = r.check(flow);
      equal(found.map((f) => [f.rule, f.at]), [['FD-R6', at]], `${label}: check returns ONE finding, FD-R6 at ${at}`);
      for (const part of NAMED) ok(found[0]!.detail.includes(part), `${label}: the finding names ${part}: ${found[0]!.detail}`);
      const err = refusalOf(() => r.start(flow, {}));
      ok(err instanceof LimitKeyMissing, `${label}: start throws LimitKeyMissing — got ${(err as Error)?.constructor?.name}: ${(err as Error)?.message}`);
      ok(err instanceof RuntimeError && !(err instanceof InvalidDefinition), `${label}: a RuntimeError, and not InvalidDefinition — the flow is a valid definition`);
      equal((err as LimitKeyMissing).at, at, `${label}: its at is the node`);
      for (const part of [`"${at}"`, ...NAMED]) ok((err as Error).message.includes(part), `${label}: the message names ${part}`);
      equal([w.s.added, w.subscribed()], [[], 0], `${label}: nothing dispatched and the scheduler never subscribed to — no driver was built`);
      equal(r.start(FLOW_ON_PLAIN, {}).driver.runId, 'r1', `${label}: and the next start mints r1 — the refusal spent no run id`);
      ok(w.subscribed() > 0, `${label}: CONTROL — a start that builds a driver DOES subscribe, so the 0 above can see one`);
    }
  });

  test('TWO nodes reaching it: one FD-R6 finding EACH, and LimitKeyMissing`s at is the FIRST in the flow`s order while its message carries both (choice 4)', () => {
    const s = seams();
    const r = createRuntime(KEYED_DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    // The pool road and the node road, one each — and the FIRST is not the entry's successor by accident: `a` is both.
    const two = flowOf('two', [task('a', 'Keyed', 'b'), task('b', 'Plain', 'done', { workerGroups: ['api'] })]);
    equal(r.check(two).map((f) => [f.rule, f.at]), [['FD-R6', 'a'], ['FD-R6', 'b']], 'one finding per node, in the flow`s order');
    const err = refusalOf(() => r.start(two, {}));
    ok(err instanceof LimitKeyMissing, `LimitKeyMissing — got ${(err as Error)?.constructor?.name}`);
    equal((err as LimitKeyMissing).at, 'a', 'its at is the FIRST such node');
    ok((err as Error).message.includes('FD-R6 at a') && (err as Error).message.includes('FD-R6 at b'), `and its message carries BOTH findings: ${(err as Error).message}`);
  });

  test('the TASK-only guard (the adequacy reader`s F1): a GATE whose type is NAMED like a keyed node type is not FD-R6 — only the task beside it is', () => {
    // A consumer gate type called `Keyed`, the node type whose pool holds `api`: were the guard gone, the gate's `type`
    // would be read as a pool key and the gate reported too. A gate dispatches nothing, so it reaches no group.
    const s = seams();
    const r = createRuntime(KEYED_DOC, { gateTypes: { Keyed: pickGate } }, { createPool: s.createPool, createScheduler: s.createScheduler });
    const gated = {
      flowId: 'gated-keyed', version: 1, entry: 'a',
      nodes: [
        { id: 'a', kind: 'task', type: 'Keyed', edges: [{ to: 'g' }] },
        { id: 'g', kind: 'gate', type: 'Keyed', settings: { key: 'k' }, edges: [{ to: 'toA' }, { route: 'b', to: 'toB' }] },
        { id: 'toA', kind: 'task', type: 'Plain', edges: [{ to: 'done' }] },
        { id: 'toB', kind: 'task', type: 'Plain', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    equal(r.check(gated).map((f) => [f.rule, f.at]), [['FD-R6', 'a']], 'FD-R6 at the task alone — the validator clean, the gate not reported');
  });

  test('the groups a finding NAMES (the adequacy reader`s F3): two built-in keyed groups on one pool are named both, SORTED; one group reached by BOTH roads is named ONCE', () => {
    const doc = {
      ...KEYED_DOC,
      groups: { ...(KEYED_DOC.groups as object), api2: { type: 'KeyedRateLimitGroup', config: { windows: WINDOWS } } },
      nodeTypes: { ...(KEYED_DOC.nodeTypes as object), Both: { worker: 'w', inline: true, groups: ['api2', 'api'] } },
    } as unknown as RegistryDocument;
    const s = seams();
    const r = createRuntime(doc, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const [two] = r.check(flowOf('two-groups', [task('a', 'Both', 'done')]));
    ok(two!.detail.includes('keyed groups "api", "api2"'), `declared ['api2', 'api'], named "api", "api2" — sorted: ${two!.detail}`);
    const [once] = r.check(flowOf('both-roads', [task('a', 'Keyed', 'done', { workerGroups: ['api'] })]));
    equal(once!.detail.split('"api"').length - 1, 1, `the type's pool AND the node name "api": named once — ${once!.detail}`);
    ok(once!.detail.includes('keyed group "api",'), 'and in the singular');
  });

  test('FD-R6`s place in RESUME (the adequacy reader`s F2): a refused header beside a keyed flow and no createTask is ResumeRefused — the header is read first', () => {
    const s = seams();
    const r = createRuntime(KEYED_DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const [, keyed] = ROADS[0]!;
    const checkpoint = r.start(keyed, {}, { createTask: (c) => ({ ...c, limitKey: 'tenant-a' }) }).driver.checkpoint();
    // The same keyed node, under ANOTHER flow id: the header refuses it (RN-R23), and FD-R6 is also there to be thrown.
    const other = { ...keyed, flowId: 'another' } as FlowDefinition;
    const fresh = createRuntime(KEYED_DOC, {}, { createPool: seams().createPool, createScheduler: seams().createScheduler });
    equal(fresh.check(other).map((f) => f.rule), ['FD-R6'], 'the flow IS FD-R6, so LimitKeyMissing was available');
    const err = refusalOf(() => fresh.resume(other, checkpoint));
    ok(err instanceof ResumeRefused, `ResumeRefused, not LimitKeyMissing — got ${(err as Error)?.constructor?.name}`);
  });

  test('the pool a node RUNS ON is what is read: a named instance whose class derivation adds the keyed group is FD-R6, the same type`s default instance is not (ADR 0097 rule 1)', () => {
    const C: NodeTypeDefinition = {
      worker: 'w', inline: true, configSchema: { type: 'object', properties: { keyed: { type: 'boolean' } } }, config: { keyed: false },
      pool: (c) => ((c as { keyed?: boolean }).keyed ? { config: {}, groups: ['api'] } : { config: {} }),
    };
    const doc = { ...KEYED_DOC, pools: { 'c-keyed': { type: 'C', config: { keyed: true } } } } as unknown as RegistryDocument;
    const s = seams();
    const r = createRuntime(doc, { nodeTypes: { C } }, { createPool: s.createPool, createScheduler: s.createScheduler });
    equal(r.check(flowOf('named', [task('a', 'C', 'done', { pool: 'c-keyed' })])).map((f) => [f.rule, f.at]), [['FD-R6', 'a']],
      'a node on the named instance whose derived pool names `api` is FD-R6');
    equal(r.check(flowOf('default', [task('a', 'C', 'done')])), [], 'the same type on its DEFAULT instance, whose pool names nothing, is not');
  });

  test('the CONTROLS: a RateLimitGroup in its place, a keyed group no node reaches, and a CODE group type building a keyed group with a keyFrom — none is FD-R6; and a keyed group held only as a RESIDENT group is refused at createRuntime instead (W169, Q619 option B)', () => {
    const s = seams();
    const r = createRuntime(KEYED_DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    equal(r.check(flowOf('flat-type', [task('a', 'Flat', 'done')])), [], 'P37 fact 1`s control: a RateLimitGroup on the type`s pool');
    equal(r.check(flowOf('flat-node', [task('a', 'Plain', 'done', { workerGroups: ['flat'] })])), [], 'and named by the node');
    equal(r.check(FLOW_ON_PLAIN), [], 'a keyed group the registry DECLARES and no node reaches — P37 prediction 3`s case');
    // **FLIPPED by W169** (P34 fact 11, the one assertion it predicted to move): this was `rr.check(…)` equal to `[]` — a
    // pool holding `api` only as a RESIDENT group was not FD-R6 and the runtime built. FD-R6 still does not read it (rule
    // 1); the REGISTRY refuses it now, before any flow is read (spec/flow-definition.md v0.39, Q619 option B).
    const resident = { ...KEYED_DOC, nodeTypes: { ...(KEYED_DOC.nodeTypes as object), Holds: { worker: 'w', inline: true, pool: { idleTimeout: 1000, residentGroups: ['api'] } } } } as unknown as RegistryDocument;
    const rs = seams();
    const rr = refusalOf(() => createRuntime(resident, {}, { createPool: rs.createPool, createScheduler: rs.createScheduler }));
    ok(rr instanceof DerivationRefused && (rr as DerivationRefused).at === 'Holds', `a pool holding \`api\` only as a RESIDENT group: DerivationRefused at "Holds" — got ${(rr as Error)?.name}: ${(rr as Error)?.message}`);
    const coded = { ...KEYED_DOC, groups: { ...(KEYED_DOC.groups as object), tenant: { type: 'KeyedWithKeyFrom', config: {} } } } as unknown as RegistryDocument;
    const code: RegistryCode = { groupTypes: { KeyedWithKeyFrom: { create: (_c: unknown, key: string) => new KeyedRateLimitGroup(WINDOWS, { id: key, keyFrom: () => 'k' }) as never } } };
    const rc = createRuntime(coded, code, { createPool: seams().createPool, createScheduler: seams().createScheduler });
    ok((rc.groups.tenant as unknown as { keyed?: boolean }).keyed === true, 'the code group IS keyed — so what spares it is the factory, not keyedness');
    equal(rc.check(flowOf('coded', [task('a', 'Plain', 'done', { workerGroups: ['tenant'] })])), [], 'and a node reaching it is not FD-R6 — the working road the scheduler`s own message names');
    equal(rc.check(flowOf('coded-and-api', [task('a', 'Plain', 'done', { workerGroups: ['tenant', 'api'] })])).map((f) => f.detail.includes('"tenant"')), [false],
      'CONTROL: a node reaching BOTH is FD-R6 for the built-in one alone, and the finding does not name the code group');
  });

  /**
   * **W169 — Q619 option B, at `createRuntime`** (spec/flow-definition.md v0.39; P34 decision 12). The row's three roads —
   * a TYPE's pool, a NAMED instance's own pool merged over its type's, a CLASS derivation's output — each refused
   * `DerivationRefused` `at` the pool key, its message naming the pool (as the refusal table's `derivePool` names it) and
   * the group, with NO pool built and NO scheduler built (the seams record both). The controls: a resident
   * `ConcurrentLimitGroup`, and a CODE group type whose `create` builds a real `KeyedRateLimitGroup` with a `keyFrom`,
   * each held resident — the runtime builds, the pool carrying the group resident, and the code group IS keyed.
   */
  test('W169: a built-in keyed group held RESIDENT is refused at createRuntime — a type`s pool, a named instance`s, a class`s output — naming the pool and the group, building nothing; a ConcurrentLimitGroup and a CODE group type`s keyed group held resident build (Q619 option B)', () => {
    const holds = (pool: Record<string, unknown>) => ({ worker: 'w', inline: true, pool: { idleTimeout: 1000, ...pool } });
    const ROADS_B: [string, RegistryDocument, RegistryCode, string, string][] = [
      ['a TYPE`s pool', { ...KEYED_DOC, nodeTypes: { ...(KEYED_DOC.nodeTypes as object), Holds: holds({ residentGroups: ['api'] }) } } as unknown as RegistryDocument, {},
        'Holds', 'node type "Holds"\'s default instance'],
      ['a NAMED instance`s own pool, merged over its type`s', { ...KEYED_DOC, nodeTypes: { ...(KEYED_DOC.nodeTypes as object), Holds: holds({}) },
        pools: { 'holds-api': { type: 'Holds', pool: { residentGroups: { api: 1 } } } } } as unknown as RegistryDocument, {},
        'holds-api', 'pool "holds-api" (an instance of "Holds")'],
      ['a CLASS derivation`s output', KEYED_DOC, { nodeTypes: { C: { worker: 'w', inline: true, pool: () => ({ config: {}, idleTimeout: 1000, residentGroups: ['api'] }) } } },
        'C', 'node type "C"\'s default instance'],
    ];
    for (const [label, doc, code, key, who] of ROADS_B) {
      const s = seams();
      const err = refusalOf(() => createRuntime(doc, code, { createPool: s.createPool, createScheduler: s.createScheduler }));
      ok(err instanceof DerivationRefused, `${label}: DerivationRefused — got ${(err as Error)?.name}: ${(err as Error)?.message}`);
      equal((err as DerivationRefused).at, key, `${label}: at the pool key`);
      for (const n of [who, 'group "api"', 'KeyedRateLimitGroup', 'residentGroups']) ok((err as Error).message.includes(n), `${label}: the message names ${n} — ${(err as Error).message}`);
      equal([s.pools.length, s.built.length], [0, 0], `${label}: no pool and no scheduler built`);
    }
    // The controls: the runtime BUILDS, and the pool carries the group resident.
    const s1 = seams();
    const conc = { ...KEYED_DOC, groups: { ...(KEYED_DOC.groups as object), slots: { type: 'ConcurrentLimitGroup', config: { limit: 2 } } },
      nodeTypes: { ...(KEYED_DOC.nodeTypes as object), Holds: holds({ residentGroups: ['slots'] }) } } as unknown as RegistryDocument;
    createRuntime(conc, {}, { createPool: s1.createPool, createScheduler: s1.createScheduler });
    equal(s1.built.length, 1, 'a resident ConcurrentLimitGroup: the runtime builds');
    equal(s1.pools.filter((p) => JSON.stringify(p.options.residentGroups) === '["slots"]').length, 1, 'and ONE pool holds `slots` resident');
    const s2 = seams();
    const coded = { ...KEYED_DOC, groups: { ...(KEYED_DOC.groups as object), tenant: { type: 'KeyedWithKeyFrom', config: {} } },
      nodeTypes: { ...(KEYED_DOC.nodeTypes as object), Holds: holds({ residentGroups: ['tenant'] }) } } as unknown as RegistryDocument;
    const code: RegistryCode = { groupTypes: { KeyedWithKeyFrom: { create: (_c: unknown, key: string) => new KeyedRateLimitGroup(WINDOWS, { id: key, keyFrom: () => 'k' }) as never } } };
    const rc = createRuntime(coded, code, { createPool: s2.createPool, createScheduler: s2.createScheduler });
    ok((rc.groups.tenant as unknown as { keyed?: boolean }).keyed === true, 'a CODE group type`s group IS keyed — so what spares it is the factory');
    equal(s2.pools.filter((p) => JSON.stringify(p.options.residentGroups) === '["tenant"]').length, 1, 'and its pool is built holding it resident');
  });

  /**
   * **W169 — the `InvalidDefinition` message, built by ONE function both roads call** (P34 fact 12). The FORM is written
   * here by hand — `definition "<flowId>" is invalid: ` then `<rule> at <at, or <document>>: <detail>` joined by `; `,
   * `rules` sorted and each once — and held on `start` and on `new Driver` over `runtime.registry` against ONE whole
   * hand-written literal, details included, and on `InvalidDefinition.fromFindings` itself over hand-written findings.
   */
  test('W169: the InvalidDefinition message — start`s and new Driver`s are one text, in the hand-written form, and fromFindings builds it', () => {
    const e = InvalidDefinition.fromFindings('f', [
      { rule: 'FD-V9', at: 'x', detail: 'one' }, { rule: 'FD-V2', at: null, detail: 'two' }, { rule: 'FD-V9', at: 'y', detail: 'three' },
    ]);
    ok(e instanceof InvalidDefinition, 'an InvalidDefinition');
    equal(e.message, 'definition "f" is invalid: FD-V9 at x: one; FD-V2 at <document>: two; FD-V9 at y: three', 'the form, by hand: in the findings` order, <document> for no at');
    equal(e.rules, ['FD-V2', 'FD-V9'], 'rules: sorted, each once');
    const empty = refusalOf(() => InvalidDefinition.fromFindings('z', []));
    ok(empty instanceof RangeError, `an EMPTY list is refused, never an InvalidDefinition naming nothing (C3) — got ${(empty as Error)?.name}`);
    // Two defects: a document-level key (FD-V17, `at` null) and a type the registry lacks (FD-V32 at `a`).
    const two = { ...flowOf('two-defects', [task('a', 'Nobody', 'done')]), stray: 1 } as unknown as FlowDefinition;
    const s = seams();
    const r = createRuntime(KEYED_DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const found = r.check(two);
    equal(found.map((f) => [f.rule, f.at]), [['FD-V17', null], ['FD-V32', 'a']], 'check: the two findings, by hand');
    // The WHOLE text, by hand (the conformity reader's C1): the form above, each detail as FD-V17's and FD-V32's own sentence
    // in src/definition/validate.ts reads for this flow — the stray key, and `Nobody` against KEYED_DOC's three types and
    // the built-in `Transform`, sorted.
    const expected = 'definition "two-defects" is invalid: FD-V17 at <document>: document carries undeclared key "stray"; ' +
      'FD-V32 at a: type "Nobody" is not a registered node type (the registry declares "Flat", "Keyed", "Plain", "Transform")';
    const viaStart = refusalOf(() => r.start(two, {}));
    ok(viaStart instanceof InvalidDefinition, `start: InvalidDefinition — got ${(viaStart as Error)?.name}`);
    equal((viaStart as Error).message, expected, 'start`s message, in the hand-written form');
    const viaDriver = refusalOf(() => new Driver(two, { runId: 'by-hand', scheduler: inert as never, ...r.registry, joinPolicy: liveToken }));
    ok(viaDriver instanceof InvalidDefinition, `new Driver: InvalidDefinition — got ${(viaDriver as Error)?.name}`);
    equal((viaDriver as Error).message, expected, 'new Driver`s message, in the same form');
    equal((viaStart as InvalidDefinition).rules, (viaDriver as InvalidDefinition).rules, 'and the same rules');
    equal((viaStart as InvalidDefinition).rules, ['FD-V17', 'FD-V32'], 'which are the two, sorted');
  });

  test('the createTask road: given a createTask, FD-R6 refuses nothing — the run starts and the task carries the key the factory set; and check still reports it, reading as start with none (stop-and-ask (c))', () => {
    for (const [label, flow, at] of ROADS) {
      const s = seams();
      const r = createRuntime(KEYED_DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
      const { driver } = r.start(flow, {}, { createTask: (c) => ({ ...c, limitKey: 'tenant-a' }) });
      equal(driver.runId, 'r1', `${label}: started, under the first minted id`);
      equal(s.added.map((t) => [t.id, t.limitKey]), [[`r1:${(flow.nodes[0] as { id: string }).id}:-:0`, 'tenant-a']], `${label}: the entry task dispatched, carrying the factory's key`);
      equal(r.check(flow).map((f) => [f.rule, f.at]), [['FD-R6', at]], `${label}: and check, which has no createTask to read, still reports FD-R6`);
    }
  });

  test('a definition defect beside FD-R6 is InvalidDefinition FIRST, and its rules never carry FD-R6 — with a createTask too; its message is new Driver`s', () => {
    const s = seams();
    const r = createRuntime(KEYED_DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const both = flowOf('both', [task('a', 'Keyed', 'b'), task('b', 'Nobody', 'done')]);
    equal(r.check(both).map((f) => f.rule).sort(), ['FD-R6', 'FD-V32'], 'check returns both: every finding');
    for (const options of [{}, { createTask: (c: unknown) => c }] as StartOptions[]) {
      const err = refusalOf(() => r.start(both, {}, options));
      ok(err instanceof InvalidDefinition, `${options.createTask ? 'with' : 'without'} a createTask: InvalidDefinition — got ${(err as Error)?.constructor?.name}`);
      equal((err as InvalidDefinition).rules, ['FD-V32'], `${options.createTask ? 'with' : 'without'} a createTask: its rules are the definition's alone`);
      const hand = refusalOf(() => new Driver(both, { ...r.registry, runId: 'hand', scheduler: inert, joinPolicy: liveToken }));
      ok(hand instanceof InvalidDefinition, 'new Driver refuses the same flow, by hand');
      equal((err as Error).message, (hand as Error).message, 'and start`s message is new Driver`s, to the byte');
    }
    equal(s.added, [], 'nothing dispatched');
  });

  test('ORDER: FD-R6 is refused before RunIdInUse and ID-R2 on start, and resume refuses it from the same call — before any driver, with a createTask resuming instead', () => {
    const s = seams();
    const r = createRuntime(KEYED_DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    r.start(FLOW_ON_PLAIN, {}, { runId: 'taken' });
    const [, keyed] = ROADS[0]!;
    for (const runId of ['taken', 'a:b']) {
      ok(refusalOf(() => r.start(keyed, {}, { runId })) instanceof LimitKeyMissing, `run id ${runId}: LimitKeyMissing, not the run id's refusal`);
    }
    ok(refusalOf(() => r.start(keyed, {}, { runId: 'taken', createTask: (c) => c })) instanceof RunIdInUse, 'CONTROL: with a createTask the same id is RunIdInUse — so the pair discriminates');
    const { driver } = r.start(keyed, {}, { createTask: (c) => ({ ...c, limitKey: 'tenant-a' }) });
    const checkpoint = driver.checkpoint();
    const w = watched();
    const fresh = createRuntime(KEYED_DOC, {}, { createPool: w.s.createPool, createScheduler: w.createScheduler });
    const err = refusalOf(() => fresh.resume(keyed, checkpoint));
    ok(err instanceof LimitKeyMissing, `resume with no createTask: LimitKeyMissing — got ${(err as Error)?.constructor?.name}`);
    equal(w.subscribed(), 0, 'and no driver was built');
    const { driver: again } = fresh.resume(keyed, checkpoint, { createTask: (c) => ({ ...c, limitKey: 'tenant-a' }) });
    equal(again.runId, checkpoint.header.runId, 'resume WITH a createTask resumes under the stored id — the refusal spent nothing');
  });

  test('createRuntime holds defaultRetryPolicy to FD-V30 FIRST: each shape new Driver refuses is InvalidDefinition with new Driver`s rules and message, and nothing is built (ADR 0097 rule 5)', () => {
    // FD-V30's shape (spec section 2): EXACTLY { maxRetries, backoffMs }, an integer >= 0 and a finite number >= 0, no other key.
    const REFUSED: [string, unknown][] = [
      ['a string', 'nonsense'], ['{}', {}], ['null', null], ['an extra key', { maxRetries: 1, backoffMs: 0, extra: 1 }],
      ['a negative maxRetries', { maxRetries: -1, backoffMs: 0 }], ['a fractional maxRetries', { maxRetries: 1.5, backoffMs: 0 }],
      ['an infinite backoffMs', { maxRetries: 1, backoffMs: Infinity }],
    ];
    for (const [label, v] of REFUSED) {
      const s = seams();
      const err = refusalOf(() => createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler, defaultRetryPolicy: v as never }));
      const hand = driverRefusal(v);
      ok(hand !== null, `${label}: new Driver refuses it, by hand — so the case is FD-V30's`);
      ok(err instanceof InvalidDefinition, `${label}: createRuntime throws InvalidDefinition — got ${(err as Error)?.constructor?.name ?? String(err)}`);
      equal((err as InvalidDefinition).rules, ['FD-V30'], `${label}: FD-V30`);
      equal((err as Error).message, hand!.message, `${label}: new Driver's message, to the byte`);
      equal([s.pools, s.built], [[], []], `${label}: no pool and no scheduler was built`);
    }
    // ORDER: before the document is resolved — a registry defect beside it is not what is thrown.
    const broken = edited((d) => { d.nodeTypes.Scorer.worker = 'gone'; });
    ok(refusalOf(() => createRuntime(broken, {}, { createPool: seams().createPool, createScheduler: seams().createScheduler, defaultRetryPolicy: {} as never })) instanceof InvalidDefinition,
      'a registry defect AND a malformed policy: the policy is refused first');
    ok(refusalOf(() => createRuntime(broken, {}, { createPool: seams().createPool, createScheduler: seams().createScheduler })) instanceof WorkerMissing,
      'CONTROL: the same registry defect alone is WorkerMissing');
  });

  test('a VALID defaultRetryPolicy is accepted at construction and still reaches every task a run dispatches — the control', () => {
    const s = seams();
    const policy = { maxRetries: 2, backoffMs: 10 };
    ok(driverRefusal(policy) === null, 'new Driver accepts it, by hand');
    const r = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler, defaultRetryPolicy: policy });
    equal(r.check(FLOW), [], 'check: nothing');
    r.start(FLOW, {}, { createTask: (c) => c });
    equal(s.added.map((t) => t.retryPolicy), [policy], 'the entry task carries the default — the one node declares none and its type none');
  });
});

suite('W163 — FD-R6 on a REAL scheduler: P37 fact 1`s refusal before addTask, and its createTask road completing on a real keyed group', (test) => {
  test(`no createTask is LimitKeyMissing with nothing queued; a createTask setting limitKey completes, the group holding that key; one setting none meets the scheduler's own throw — ${IN_BROWSER ? 'SKIPPED in the browser (RT-R10)' : 'inline pools, no seam'}`, async () => {
    if (IN_BROWSER) {
      ok(true, 'skipped: a browser loads no .ts worker file, which is RT-R10');
      return;
    }
    const runtime = createRuntime({
      workers: { ingest: { url: INGEST_URL } },
      groups: { api: { type: 'KeyedRateLimitGroup', config: { windows: [{ limit: 5, windowMs: 1000 }] } } },
      nodeTypes: { Ingest: { worker: 'ingest', inline: true, config: {}, pool: { maxThreads: 1, idleTimeout: 0 }, groups: ['api'] } },
    }, {}, { base: import.meta.url });
    const flow = {
      flowId: 'keyed', version: 1, entry: 'ingest',
      nodes: [
        { id: 'ingest', kind: 'task', type: 'Ingest', edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    try {
      let refused: unknown = null;
      try { runtime.start(flow, { confidence: 0.9 }); } catch (e) { refused = e; }
      ok(refused instanceof LimitKeyMissing && refused.at === 'ingest', `no createTask: LimitKeyMissing at the node — got ${(refused as Error)?.constructor?.name}: ${(refused as Error)?.message}`);
      equal(runtime.scheduler.tasks.size, 0, 'and the real scheduler holds no task — nothing reached addTask');
      const { driver, done } = runtime.start(flow, { confidence: 0.9 }, { createTask: (c) => new FyflowTask({ ...c, limitKey: 'tenant-a' }) });
      equal(driver.runId, 'r1', 'the createTask road starts under r1 — the refusal spent no run id');
      const state = await Promise.race([done, new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), 10000))]);
      equal(state === 'timeout' ? 'NEVER SETTLED' : state.outcome, 'completed', 'and it COMPLETED on a real keyed group — P37 fact 1`s working road');
      equal([...(runtime.groups.api as unknown as { keys: Map<string, unknown> }).keys.keys()], ['tenant-a'], 'the group`s active keys are the factory`s — the task was counted under it');
      let bare: unknown = null;
      try { runtime.start(flow, { confidence: 0.9 }, { createTask: (c) => new FyflowTask(c) }); } catch (e) { bare = e; }
      ok(bare instanceof Error && !(bare instanceof RuntimeError) && bare.message.includes('Missing limit key'),
        `a createTask that sets NO key passes FD-R6 and meets the scheduler's own throw — the factory's to own (ADR 0097 rule 4): ${(bare as Error)?.message}`);
    } finally {
      await runtime.shutdown();
    }
  });
});

suite('W186 — through createRuntime: task.running is ROUTED to its own run, and a resume hands the scheduler a FyflowTask carrying attemptsSpent', (test) => {
  /** An entry fan-out of two `Scorer` tasks, so a resume has one task WITH attempts recorded and one without. */
  const PAIR = {
    flowId: 'w186-pair', version: 1, entry: 'split',
    nodes: [
      { id: 'split', kind: 'fanout', branches: ['a', 'b'] },
      { id: 'a', kind: 'task', type: 'Scorer', edges: [{ to: 'collect' }] },
      { id: 'b', kind: 'task', type: 'Scorer', edges: [{ to: 'collect' }] },
      { id: 'collect', kind: 'join', of: 'split', edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition;
  const running = (id: unknown, attemptNumber: number) => ({ id, state: 'running', attemptNumber, attempts: attemptNumber - 1, timestamp: 1 });
  const attemptsOf = (inputs: readonly FoldInput[]) => inputs.flatMap((e) => (e.kind === 'attempted' ? [`${e.taskId} #${e.attemptNumber}`] : []));

  test('two runs on ONE runtime: each records its OWN task`s attempts and not the other`s, and an id no driver minted is recorded and reported by neither', () => {
    const s = routedSeams();
    const r = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const unminted: string[] = [];
    const one = r.start(FLOW, { x: 1 }, { runId: 'r1', onUnmintedTask: (u) => { unminted.push(`r1 ${String(u.taskId)}`); } });
    const two = r.start(FLOW, { x: 1 }, { runId: 'r2', onUnmintedTask: (u) => { unminted.push(`r2 ${String(u.taskId)}`); } });
    equal(s.subscriptions.filter((n) => n === 'task.running'), ['task.running'], 'the CONTROL: the scheduler is subscribed to task.running ONCE (ADR 0088 rule 2)');
    s.emit('task.running', running('r1:a:-:0', 1));
    s.emit('task.running', running('r2:a:-:0', 1));
    s.emit('task.running', running('r2:a:-:0', 2));
    s.emit('task.running', running('nightly-cleanup', 1));
    equal([attemptsOf(one.driver.foldInputs()), attemptsOf(two.driver.foldInputs())], [['r1:a:-:0 #1'], ['r2:a:-:0 #1', 'r2:a:-:0 #2']],
      'r1 recorded its one attempt, r2 its two — each routed by its id to its own driver (ADR 0088 rule 4, row 1)');
    equal(unminted, [], 'and the unminted id`s task.running — broadcast to both (row 3) — is recorded by neither and REPORTED by neither: only a settlement reports it');
    s.done('nightly-cleanup');
    equal(unminted.sort(), ['r1 nightly-cleanup', 'r2 nightly-cleanup'], 'the CONTROL: its SETTLEMENT reaches both drivers` onUnmintedTask');
  });

  test('runtime.resume with the DEFAULT createTask: the FyflowTask the scheduler is handed carries attemptsSpent — the highest recorded — and a task with none, the scheduler`s own 0', () => {
    const s = routedSeams();
    const r = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const h = r.start(PAIR, { x: 1 }, { runId: 'w186' });
    s.emit('task.running', running('w186:a:0:0', 1));
    s.emit('task.running', running('w186:a:0:0', 2));
    const cp = structuredClone(h.driver.checkpoint()) as Checkpoint;
    const s2 = routedSeams();
    const fresh = createRuntime(DOC, {}, { createPool: s2.createPool, createScheduler: s2.createScheduler });
    fresh.resume(PAIR, cp);
    const handed = s2.added as unknown as FyflowTask[];
    equal(handed.map((t) => [t.id, t instanceof FyflowTask]), [['w186:a:0:0', true], ['w186:b:1:0', true]],
      'the ARRANGEMENT: the fresh runtime`s scheduler was handed both in-flight tasks as the scheduler`s own FyflowTask (no createTask given)');
    equal(handed.map((t) => [t.attemptsSpent, t.attempts, t.attemptNumber]), [[2, 2, 0], [0, 0, 0]],
      '`a` carries attemptsSpent 2 — the scheduler`s `attempts` STARTS there, so its next attempt is number 3 — and `b`, none recorded, the scheduler`s own default 0');
    // The CONTROL for the source: the first runtime's own hand-off carried no attempts.
    equal((s.added as unknown as FyflowTask[]).map((t) => t.attemptsSpent), [0, 0], 'the CONTROL: on start nothing is spent — the same field reads 0 on both');
  });
});

/**
 * **W187 — through `createRuntime`: a task's `task.message` and `task.progress` are ROUTED to its own run's driver, and
 * handed to that run's callback alone** — `spec/run-state.md` v0.27 `RN-R42`,
 * [ADR 0114](../../doc/decisions/0114-a-tasks-attribution-is-fields-and-its-messages-and-progress-are-passed-through.md),
 * which amends ADR 0088 rule 3 (P36 (l)): the router reads `detail.id`, else `detail.taskId` — `task.message`'s only name
 * for its task (P36 fact 2). Without it a message would be rule 4's third row — no string `id` — and BROADCAST to every run's
 * driver, N per message, each dropping the others' in silence: a cost no callback could see, so what each driver is
 * HANDED is read at its ENTRY, the W142 suite's instrument, here reading `taskId` too.
 */
suite('W187 — through createRuntime: a task`s messages and progress are ROUTED to its own run, handed to that run`s callback alone, and nothing after its release', (test) => {
  /** What a driver's listener is handed from here on: the event's name and the task it names, by `id` or `taskId`. */
  const entries = (d: Driver): string[] => {
    const seen: string[] = [];
    const original = (d as unknown as { onEvent: (n: string, x: unknown) => void }).onEvent;
    Object.defineProperty(d, 'onEvent', {
      enumerable: false, configurable: true, writable: true,
      value: function (this: unknown, n: string, x: unknown) {
        const t = x as { id?: unknown; taskId?: unknown } | undefined;
        seen.push(`${n} ${String(t?.id ?? t?.taskId)}`);
        return original.call(this, n, x);
      },
    });
    return seen;
  };
  const message = (taskId: unknown, seq = 0) => ({ taskId, workerId: 'w-1', attemptNumber: 1, name: 'log', data: { seq }, seq, timestamp: 1 });
  const progress = (id: unknown) => ({ id, state: 'running', attempts: 0, attemptNumber: 1, workerType: 'inline', progress: 0.5, message: 'half', details: null, workerId: 'w-1', timestamp: 1 });

  test('two runs on ONE runtime: each run`s message and progress reach its OWN driver and callback and NOT the other`s — one delivery per event, not N', () => {
    const s = routedSeams();
    const r = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const got: string[] = [];
    const open = (runId: string) => {
      const h = r.start(FLOW, { x: 1 }, {
        runId,
        onTaskMessage: (m) => { got.push(`${runId} heard message ${m.taskId} #${m.seq}`); },
        onTaskProgress: (p) => { got.push(`${runId} heard progress ${p.taskId}`); },
      });
      return entries(h.driver);
    };
    const one = open('r1');
    const two = open('r2');
    equal(s.subscriptions.filter((n) => n === 'task.message' || n === 'task.progress').sort(), ['task.message', 'task.progress'],
      'the CONTROL: the scheduler is subscribed to each pass-through ONCE however many runs ask (ADR 0088 rule 2)');
    s.emit('task.message', message('r1:a:-:0', 0));
    s.emit('task.message', message('r2:a:-:0', 0));
    s.emit('task.message', message('r2:a:-:0', 1));
    s.emit('task.progress', progress('r1:a:-:0'));
    equal([one, two], [
      ['task.message r1:a:-:0', 'task.progress r1:a:-:0'],
      ['task.message r2:a:-:0', 'task.message r2:a:-:0'],
    ], 'each driver HANDED its own run`s events and none of the other`s: four events, four deliveries — rule 3 reading taskId, rule 4 row 1');
    equal(got, ['r1 heard message r1:a:-:0 #0', 'r2 heard message r2:a:-:0 #0', 'r2 heard message r2:a:-:0 #1', 'r1 heard progress r1:a:-:0'],
      'and each callback heard exactly its own run`s');
    // The CONTROL that the instrument would see a broadcast: a message whose taskId no driver minted is rule 4's third
    // row — handed to EVERY driver — and delivered by none.
    s.emit('task.message', message('nightly-cleanup'));
    equal([one.slice(2), two.slice(2), got.length], [['task.message nightly-cleanup'], ['task.message nightly-cleanup'], 4],
      'the CONTROL: an unparseable taskId reaches BOTH drivers (rule 4 row 3) — the instrument sees a broadcast — and no callback');
  });

  test('a run that passes NO pass-through callback is never handed a message, and a runtime whose runs pass none never subscribes the scheduler', () => {
    const s = routedSeams();
    const r = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const quiet = entries(r.start(FLOW, { x: 1 }, { runId: 'q1' }).driver);
    equal(s.subscriptions.filter((n) => n === 'task.message' || n === 'task.progress'), [],
      'no run asked: the scheduler is NOT subscribed to task.message or task.progress — its workers emit at no cost');
    const heard: string[] = [];
    const loud = entries(r.start(FLOW, { x: 1 }, { runId: 'q2', onTaskMessage: (m) => { heard.push(m.taskId); } }).driver);
    equal(s.subscriptions.filter((n) => n === 'task.message'), ['task.message'], 'the first run that asks subscribes it, once');
    s.emit('task.message', message('q1:a:-:0'));
    s.emit('task.message', message('q2:a:-:0'));
    equal([quiet, loud, heard], [[], ['task.message q2:a:-:0'], ['q2:a:-:0']],
      'q1, which passed none, was handed NOTHING — not even its own task`s message — and q2 its own');
  });

  test('NOTHING after the run is released: its task`s message is delivered while it runs, and reaches no driver once its done settled', async () => {
    const s = routedSeams();
    const r = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const heard: number[] = [];
    const h = r.start(FLOW, { x: 1 }, { runId: 'rel', onTaskMessage: (m) => { heard.push(m.seq); } });
    const handed = entries(h.driver);
    s.emit('task.message', message('rel:a:-:0', 0));
    equal(heard, [0], 'the CONTROL: while the run runs, its task`s message is delivered');
    s.done('rel:a:-:0');
    const state = await Promise.race([h.done, new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), 2000))]);
    equal(state === 'timeout' ? 'NEVER SETTLED' : state.outcome, 'completed', 'the run completed and its done settled — so it is RELEASED (ADR 0091)');
    s.emit('task.message', message('rel:a:-:1', 1));
    s.emit('task.message', message('rel:a:-:0', 2));
    equal([heard, handed], [[0], ['task.message rel:a:-:0', 'task.completed rel:a:-:0']],
      'after the release NOTHING is handed to the driver for the run — rule 4 row 2 — and the callback hears nothing more');
  });
});
