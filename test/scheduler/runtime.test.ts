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
import { AssertionError, collected, deepEqual, equal, ok, readText, ROOT, suite, throws } from '../harness.ts';
import {
  BUILT_IN_GROUP_FACTORIES, createRuntime, GROUP_MEMBERS, GroupNotBuildable, GroupUnusable,
  LanguageNotBuilt, RuntimeError,
} from '../../src/scheduler/runtime.ts';
import type { StartOptions } from '../../src/scheduler/runtime.ts';
import { bootstrap, ENVELOPE_WORKER_URL } from '../../src/scheduler/bootstrap.ts';
import { BUILT_IN_GROUP_TYPES, DerivationRefused, GateTypeRefused, GroupTypeMissing, NameCollision, NameMissing, WorkerMissing } from '../../src/definition/registry.ts';
import type { GateType } from '../../src/definition/types.ts';
import { PATH_LANGUAGE } from './fake-language.ts';
import { arrivalCount, liveTokenRequiringArrival } from '../../src/fold/policies.ts';
import { canonical, describeFindings } from '../../src/definition/schema.ts';
import { Driver } from '../../src/driver/driver.ts';
import { liveToken } from '../../src/fold/policies.ts';
import type { ResourceGroup } from 'fyflow-scheduler';
import { emptyState, fold, isTerminal, step } from '../../src/fold/run-state.ts';
import type { FoldInput, RunState } from '../../src/fold/run-state.ts';
import type { FlowDefinition, RegistryCode, RegistryDocument } from '../../src/definition/types.ts';
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
  return { pools, built, added, settle, emitSettlement, createPool, createScheduler };
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

suite('W66 — decision 13: the languages a pool carries come from the FLOWS, and start refuses one it was not built for', (test) => {
  const TRANSFORMING: FlowDefinition = {
    flowId: 't', version: 1, entry: 'a',
    nodes: [
      { id: 'a', kind: 'task', type: 'Scorer', transform: { lang: 'path', expr: 'confidence' }, edges: [{ to: 'done' }] },
      { id: 'done', kind: 'end', outcome: 'completed' },
    ],
  } as unknown as FlowDefinition;
  const withLang = edited((d) => { (d as Record<string, unknown>).languages = ['path']; });
  const code: RegistryCode = { languages: { path: PATH_LANGUAGE } };

  test('a type some node of which transforms gets the adapter`s WORKER url in its pool config; with no flows, no pool carries one', () => {
    const withFlows = seams();
    createRuntime(withLang, code, { createPool: withFlows.createPool, createScheduler: withFlows.createScheduler, flows: [TRANSFORMING] });
    for (const p of consumerPools(withFlows.pools)) {
      equal(Object.keys((p.options.config as { languages?: object }).languages ?? {}), ['path'], 'every instance of the transforming type carries the adapter`s worker url');
    }
    const noFlows = seams();
    createRuntime(withLang, code, { createPool: noFlows.createPool, createScheduler: noFlows.createScheduler });
    for (const p of noFlows.pools) {
      ok(!('languages' in (p.options.config as object)), 'and with no flows declared, no pool config carries a languages key at all');
    }
  });

  test('F13: a type transforming in TWO languages is held to BOTH — one built is not enough', () => {
    const two = {
      flowId: 'two', version: 1, entry: 'a',
      nodes: [
        { id: 'a', kind: 'task', type: 'Scorer', transform: { lang: 'path', expr: 'confidence' }, edges: [{ to: 'b' }] },
        { id: 'b', kind: 'task', type: 'Scorer', transform: { lang: 'other', expr: 'confidence' }, edges: [{ to: 'done' }] },
        { id: 'done', kind: 'end', outcome: 'completed' },
      ],
    } as unknown as FlowDefinition;
    const one = { ...two, nodes: [two.nodes[0]!, two.nodes[2]!] } as unknown as FlowDefinition;
    const doc = edited((d) => { (d as Record<string, unknown>).languages = ['path', 'other']; });
    const both: RegistryCode = { languages: { path: PATH_LANGUAGE, other: PATH_LANGUAGE } };
    // Built for the FIRST language only: the second must still be refused at start, on the same type.
    const s = seams();
    const r = createRuntime(doc, both, { createPool: s.createPool, createScheduler: s.createScheduler, flows: [one] });
    let err: unknown;
    try { r.start(two, {}); } catch (e) { err = e; }
    ok(err instanceof LanguageNotBuilt && (err as Error).message.includes('"other"'),
      'the language the pools do NOT carry is named: ' + ((err as Error)?.message ?? 'nothing'));
    const okSeams = seams();
    createRuntime(doc, both, { createPool: okSeams.createPool, createScheduler: okSeams.createScheduler, flows: [two] }).start(two, {});
    equal(okSeams.added.length, 1, 'and with both flows declared, the flow starts');
  });

  test('start REFUSES a transforming flow the runtime built no language for, naming the type, the language and the fix', () => {
    const s = seams();
    const r = createRuntime(withLang, code, { createPool: s.createPool, createScheduler: s.createScheduler });
    let err: unknown;
    try { r.start(TRANSFORMING, {}); } catch (e) { err = e; }
    ok(err instanceof LanguageNotBuilt && err.at === 'Scorer', `a LanguageNotBuilt naming the type: ${(err as Error)?.constructor?.name}`);
    const m = (err as Error).message;
    ok(m.includes('"path"') && m.includes('flows'), `and naming the language and the fix: ${m}`);
    equal(s.added, [], 'and nothing was dispatched');
  });

  test('the same flow, with the runtime told about it, starts', () => {
    const s = seams();
    const r = createRuntime(withLang, code, { createPool: s.createPool, createScheduler: s.createScheduler, flows: [TRANSFORMING] });
    const { driver: d } = r.start(TRANSFORMING, { confidence: 0.9 });
    equal(s.added.map((t) => t.id), [`${d.runId}:a:-:0`], 'one task, dispatched');
    equal(Object.keys(s.added[0]!.payload as object).sort(), ['input', 'settings', 'transform'], 'with the transform as the third key — FD-C6');
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
    const okRt = createRuntime(withLang, code, { createPool: seams().createPool, createScheduler: seams().createScheduler, flows: [TRANSFORMING] });
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
      'road (c) is what start FORWARDS from RuntimeOptions, which is TWO — not the interface`s six, four of which are not DriverOptions members (W76 finding D)');
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
    equal(s.all.length, 20, 'DriverOptions has twenty members — the eighteen P20 fact 1 counted, W80`s, and W93`s gateTypes. Move this deliberately, with the roads');
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

  test('the runtime CALLS `isTerminal` and `step` rather than reimplementing either — P20 decision 2', async () => {
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
    ok(/\bstep\(/.test(machinery),
      'and the mechanism STEPS a kept prefix — `fold` is this loop, and RN-R2 is what licenses keeping it');
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
  // the run `start` gave it. `runId` is not a `ResumeOptions` member: the run's id is the header's.
  for (const name of Object.keys(OBSERVERS).filter((n) => n !== 'runId')) {
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

  // **The loop above is a membership over `StartOptions` minus `runId`, and it is bound as one** —
  // `doc/workflow.md` rule 8 obligation (d): filtered to nothing, it registers no case and every case
  // it would have run is silent. So the cases that REGISTERED are compared with the members, both ways.
  test('every StartOptions member but runId has a resume() observer that registered', async () => {
    const members = w76StartMembers(await readText(ROOT + 'src/scheduler/runtime.ts')).filter((n) => n !== 'runId');
    const suffix = ' reaches the driver resume() built';
    const registered = collected().flatMap((x) => x.cases.map((c) => c.name)).filter((n) => n.endsWith(suffix)).map((n) => n.slice(0, -suffix.length)).sort();
    ok(members.length >= 9, `the CONTROL: StartOptions minus runId read from the shipped source, ${members.length} members`);
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
      // `FD-V9` requires a fan-out's branch ENTRY to be a task, so the map hangs off one rather
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
   * `outcome !== 'running' && outcome !== 'awaiting_action'`, so it names its own values and this
   * is the list the rule enumerates rather than the list an author chose
   * (`doc/workflow.md` rule 8 (a) at v0.17). Four settle, two do not — and the two that do not are
   * the whole of why `done` can wait for ever, which is what the reference has to teach.
   */
  test('the six outcomes: four terminal ones settle `done`, and the two non-terminal ones do NOT', async () => {
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
 * | **I** | refused BEFORE the run begins — `InvalidDefinition`, `LanguageNotBuilt`, `BoundaryRefused` at `start` | `runtime.start` throws; `failRun` is never reached; no run exists |
 * | **II** | refused DURING `start()` — `failRun(e)` **then `throw e`**, the caller being on the stack | `runtime.start` throws, so the caller **never receives the handle** |
 * | **III** | refused from a LISTENER — `failRun(e)` alone, a throw from a listener being discarded | the caller **holds** the handle |
 *
 * **Two measurements decide it.** First, `failRun` appends the `stopped` fold input BEFORE calling
 * `onRunFailure`, so a refusal is ALREADY terminal when a consumer hears of it — the resolve road
 * does not hang, it settles with `stopped` and `stoppedBy` carrying the reason. Second, on class II
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
suite('W77 — a driver refusal RESOLVES `done` with `stopped`, and never rejects', (test) => {
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

  test('class III — refused from a LISTENER: `done` RESOLVES with `stopped`, carrying `stoppedBy`', async () => {
    const s = seams();
    const r = createRuntime(DOCUMENT, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    let reported = 0;
    const { driver, done } = r.start(LATE_MAP, { x: 1 }, { onRunFailure: () => { reported += 1; } });
    // the producer returns an object with no `items` array, so entering the map throws from the
    // scheduler listener — `failRun` reports and nothing is rethrown to any caller.
    s.settle(String(s.added[0]!.id), { notAnArray: true });
    const settled = await w77Settlement(done);
    equal(reported, 1, 'the CONTROL: onRunFailure fired, so this row is about a refusal rather than about a quiet run');
    equal(settled.outcome, 'stopped', 'and `done` RESOLVED rather than rejecting — `stopped` is a terminal outcome like any other');
    ok(String(settled.stoppedBy).includes('UnresolvedMapArity'),
      `and the reason survives in the RunState rather than being thrown away: ${String(settled.stoppedBy).slice(0, 60)}`);
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
   * throw from `resolve` and a `done` that resolves with `stopped` — correct, and asserted nowhere
   * until this case.
   */
  test('class II(b) — refused from `resolve()`: the caller gets the throw AND `done` resolves `stopped`', async () => {
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
    equal(settled.outcome, 'stopped',
      'and the handle the caller has held since `start` RESOLVES with `stopped` — so a person`s refused answer does not leave `done` waiting for ever');
    ok(String(settled.stoppedBy).includes('UnresolvedMapArity'), `with the reason: ${String(settled.stoppedBy).slice(0, 50)}`);
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
    equal(resolvedWith, 'stopped', 'the answer arrives by the resolve road, carrying the whole RunState');
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
    // `outcome !== 'running' && outcome !== 'awaiting_action'` — so a sentinel of `'NEVER SETTLED'`
    // IS terminal and the assertion below could not fail through it.** W77's adequacy reader, 9:
    // with the two outcome assertions deleted and the composition order reversed, the case was
    // green at zero. *A timeout sentinel has to be a value the predicate REJECTS.*
    const settled = await Promise.race([done, new Promise<RunState>((r2) => setTimeout(() => r2({ outcome: 'running' } as unknown as RunState), 20))]);
    ok(fired > 1, `the CONTROL: the throwing callback really did throw (${fired} calls)`);
    ok(isTerminal(settled),
      '`done` SETTLED rather than hanging, which is the property: the runtime records and schedules BEFORE handing on, so its own bookkeeping cannot be shortened by a consumer`s callback');
    // **And the outcome is `stopped`, not `completed`, which this case got wrong on its first run.**
    // A consumer's `onFoldInput` has always been called UNGUARDED (`src/driver/driver.ts`), so a
    // throw from it unwinds into the driver's listener boundary, where `OR-R10` catches it and
    // fails the run — that is behaviour ADR 0058 inherits rather than introduces. The useful half
    // is that `done` REPORTS it: a consumer whose own handler threw learns the run stopped and why,
    // where a hand-rolled block that folded inside the same handler would simply never resolve.
    equal(settled.outcome, 'stopped',
      'and it reports the consumer`s own throw as what it is — a run failure through OR-R10, with the reason in `stoppedBy`');
    ok(String(settled.stoppedBy).includes('consumer callback blew up'),
      `and the consumer's own message is what the run stopped for: ${String(settled.stoppedBy).slice(0, 60)}`);
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
 * finished run's driver still hears its id (`RN-R25`); and a driver built by hand on `runtime.scheduler` is not routed
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
    // The driver subscribes to three names (`SETTLEMENT_EVENTS`, `src/driver/driver.ts`): one each, not three each.
    equal([...s.subscriptions].sort(), ['task.completed', 'task.failed', 'task.user_action'],
      'one subscription per event NAME — a broadcast would show nine, three per driver');
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

  test('rule 5, RN-R25: a FINISHED run`s driver still hears its own run id', async () => {
    const { s, runs } = threeRuns();
    s.done('r2:a:-:0');
    const state = await w77Settlement(runs[1]!.done);
    equal(state.outcome, 'completed', 'the CONTROL: r2 finished');
    const before = runs[1]!.driver.foldInputs().length;
    s.done('r2:a:-:0');
    equal(handedBy(runs), [[], ['r2:a:-:0', 'r2:a:-:0'], []], 'handed again after it completed — the routing keeps it for the runtime`s life');
    ok(runs[1]!.driver.foldInputs().length > before, 'and its sequence grows, which is RN-R25`s measured reason a run id stays in use');
    // And it is still among EVERY driver for rule 4 row 3 — a finished run that left the broadcast would stop reporting
    // what no driver minted, which no other case here sees (the adequacy reader's M16).
    s.done('after-the-end');
    equal(runs.map((x) => x.unminted.map((u) => u.taskId)), [['after-the-end'], ['after-the-end'], ['after-the-end']],
      'the finished r2 still reports an unminted id, as r1 and r3 do');
  });

  test('rule 7: a Driver built BY HAND on runtime.scheduler is not routed — it subscribes to the scheduler and hears every settlement', () => {
    const { s, r, runs } = threeRuns();
    const subscribed = s.subscriptions.length;
    const byHand = new Driver(FLOW, { ...r.registry, runId: 'hand', scheduler: r.scheduler, joinPolicy: liveToken });
    const heard = handed(byHand);
    equal(s.subscriptions.length - subscribed, 3, 'its three subscriptions went to the scheduler itself');
    s.done('r1:a:-:0');
    equal([heard, ...handedBy(runs)], [['r1:a:-:0'], ['r1:a:-:0'], [], []], 'the hand-built driver hears r1`s settlement; r2 and r3 still do not');
  });

  test('a throw out of one driver`s listener does not stop the broadcast to the next, and still reaches the dispatcher', () => {
    const s = routedSeams();
    const r = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const reports: string[] = [];
    // A consumer callback that throws out of the driver's failure path: `onUnmintedTask` throws, the driver's listener
    // catches it and fails the run (`OR-R10`), and `onRunFailure` throws again — which nothing in the driver catches.
    r.start(FLOW, { x: 1 }, {
      runId: 'r1',
      onUnmintedTask: () => { throw new Error('first'); },
      onRunFailure: () => { throw new Error('escaped'); },
    });
    r.start(FLOW, { x: 1 }, { runId: 'r2', onUnmintedTask: (u) => { reports.push(`${u.runId} ${String(u.taskId)}`); } });
    throws(() => s.done('nightly-cleanup'), 'escaped', 'the first throw reaches whoever dispatched the event, synchronously, as it did before');
    equal(reports, ['r2 nightly-cleanup'], 'and r2, after r1 in subscription order, was still handed the event and reported it');
  });
});
