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
import { deepEqual, equal, ok, readText, ROOT, suite, throws } from '../harness.ts';
import {
  BUILT_IN_GROUP_FACTORIES, createRuntime, GROUP_MEMBERS, GroupNotBuildable, GroupUnusable,
  LanguageNotBuilt, RuntimeError,
} from '../../src/scheduler/runtime.ts';
import type { StartOptions } from '../../src/scheduler/runtime.ts';
import { bootstrap, ENVELOPE_WORKER_URL } from '../../src/scheduler/bootstrap.ts';
import { BUILT_IN_GROUP_TYPES, DerivationRefused, GroupTypeMissing, NameMissing, WorkerMissing } from '../../src/definition/registry.ts';
import { PATH_LANGUAGE } from './fake-language.ts';
import { arrivalCount, liveTokenRequiringArrival } from '../../src/fold/policies.ts';
import { canonical } from '../../src/definition/schema.ts';
import { Driver } from '../../src/driver/driver.ts';
import { liveToken } from '../../src/fold/policies.ts';
import type { ResourceGroup } from 'fyflow-scheduler';
import { fold, isTerminal } from '../../src/fold/run-state.ts';
import type { FoldInput, RunState } from '../../src/fold/run-state.ts';
import type { FlowDefinition, RegistryCode, RegistryDocument } from '../../src/definition/types.ts';

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
  const createScheduler = (p: Record<string, unknown>, g: Record<string, unknown>) => {
    built.push({ pools: p, groups: g });
    return {
      workerPools: p, groups: g,
      addTask(t: unknown) { added.push(t as Record<string, unknown>); },
      addEventListener(type: string, fn: (e: { detail: unknown }) => void) { listeners.set(type, [...(listeners.get(type) ?? []), fn]); },
      shutdown() { return Promise.resolve(); },
    } as never;
  };
  return { pools, built, added, settle, createPool, createScheduler };
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
    equal(Object.keys(r.pools).sort(), ['Scorer', 'scorer-fast'], 'the type`s default instance under its own name, plus the named one');
    equal(Object.keys(r.groups), ['gpu'], 'one group object, keyed as the document declares it');
    equal(s.pools.length, 2, 'two pools built');
    ok(s.pools.every((p) => p.url === ENVELOPE_WORKER_URL), 'every pool loads the package`s envelope worker, not the type`s own');
    equal(s.built.length, 1, 'one scheduler, over those pools and groups');
    equal(Object.keys(s.built[0]!.pools).sort(), ['Scorer', 'scorer-fast'], 'the scheduler holds them by key');
  });

  test('fact 3 on the runtime`s own pools: two instances over ONE worker url are two pools, with different derived configs', () => {
    const s = seams();
    createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const configs = s.pools.map((p) => (p.options.config as { worker: string; config: unknown }));
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
        { id: 'a', kind: 'task', type: 'Scorer', settings: { factor: 1 }, edges: [{ when: 'isHigh', to: 'done' }, { to: 'done' }] },
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
    equal(Object.keys(r.registry.nodeTypes as object).sort(), ['Scorer'], 'the types');
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
    ok(s.pools.every((p) => (p.options.config as { worker: string }).worker === 'https://example.test/app/workers/w.js'), 'and that is what every pool loads');
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
    equal(s.pools.length, 2, 'and both of the document`s instances were built');
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
    const a = r.start(FLOW, { x: 1 });
    const b = r.start(FLOW, { x: 2 });
    equal([a.runId, b.runId], ['r1', 'r2'], 'r<n> from the runtime`s own counter');
    for (const id of [a.runId, b.runId]) ok(/^[A-Za-z0-9_-]{1,64}$/.test(id), `${id}: inside ID-R2's charset`);
    ok(a.runId !== b.runId, 'and distinct — two runs on one runtime never share a run id');
  });

  test('a caller`s runId is taken as given, and the run is STARTED — the first task is dispatched under it', () => {
    const s = seams();
    const r = createRuntime(DOC, {}, { createPool: s.createPool, createScheduler: s.createScheduler });
    const d = r.start(FLOW, { x: 1 }, { runId: 'mine-1' });
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
    const d = r.start(fanout, { x: 1 });
    equal(s.added.map((t) => t.id), [`${d.runId}:a:-:0`], 'the run started, so a policy reached the driver');
    // And the caller's own policy is taken where given — the other half of the pair.
    const explicit = seams();
    const r2 = createRuntime(DOC, {}, { createPool: explicit.createPool, createScheduler: explicit.createScheduler });
    const d2 = r2.start(fanout, { x: 1 }, { joinPolicy: liveTokenRequiringArrival });
    equal(explicit.added.map((t) => t.id), [`${d2.runId}:a:-:0`], 'and so does an explicitly given one');
  });

  test('two runtimes over one document mint the same ids — decision 10`s scope, stated rather than assumed (Q20)', () => {
    const one = createRuntime(DOC, {}, { ...seams() });
    const two = createRuntime(DOC, {}, { ...seams() });
    equal([one.start(FLOW, {}).runId, two.start(FLOW, {}).runId], ['r1', 'r1'],
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
    for (const p of withFlows.pools) {
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
    const d = r.start(TRANSFORMING, { confidence: 0.9 });
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
      { id: 'a', kind: 'task', type: 'T', ...extra, edges: [{ when: 'high', to: 'done' }, { to: 'done' }] },
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
      const d = r.start(guarded(), { x: 1 });
      equal(s.added.map((t) => t.id), [d.runId + ':a:-:0'], shape + ': and a flow whose edge NAMES it starts — FD-V4 refuses it otherwise');
    }
  });

  test('F2: a caller supplied joinPolicy reaches the driver, and a run still starts with none given', () => {
    let opened = 0;
    const counting = { ...arrivalCount, open: (region: never) => { opened++; return arrivalCount.open(region); } } as typeof arrivalCount;
    const s = seams();
    const r = createRuntime(ROUTED, { predicates: { high } }, { createPool: s.createPool, createScheduler: s.createScheduler });
    const d = r.start(FANOUT, { x: 1 }, { joinPolicy: counting });
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
    const d = r.start(guarded(), { x: 1 }, {
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
    const d = r.start(guarded({ pool: 'T-slow', workerGroups: ['gate'] }), { x: 1 });
    equal(s.added.map((t) => t.id), [d.runId + ':a:-:0'], 'FD-V38 and FD-V31 both passed, so pools and groups crossed into the driver');
    equal(s.added[0]!.workerType, 'T-slow', 'and the task went to the NAMED instance');
    equal(s.added[0]!.workerGroups, ['gate'], 'carrying the node own group');
  });

  test('F12: the PAYLOAD start is given is what the entry node receives', () => {
    const s = seams();
    createRuntime(ROUTED, { predicates: { high } }, { createPool: s.createPool, createScheduler: s.createScheduler })
      .start(guarded(), { x: 1, deep: { y: 2 } });
    equal((s.added[0]!.payload as { input: unknown }).input, { x: 1, deep: { y: 2 } }, 'the envelope input IS what the caller passed');
  });

  test('F19: a caller supplied runId does NOT consume a mint — the counter counts what it minted', () => {
    const s = seams();
    const r = createRuntime(ROUTED, { predicates: { high } }, { createPool: s.createPool, createScheduler: s.createScheduler });
    const a = r.start(guarded(), {}, { runId: 'mine' });
    const b = r.start(guarded(), {});
    equal([a.runId, b.runId], ['mine', 'r1'], 'the first run took the caller id and the counter is untouched by it');
  });

  test('F20, F21: resolved and scheduler are what they say — the two members with no reader', () => {
    const s = seams();
    const r = createRuntime(ROUTED, { predicates: { high } }, { createPool: s.createPool, createScheduler: s.createScheduler });
    equal([...r.resolved.nodeTypes.keys()], ['T'], 'resolved carries what the document MEANT, before anything was built');
    equal([...r.resolved.pools.keys()].sort(), ['T', 'T-slow'], 'including the default instance the document never names');
    equal([...r.resolved.predicates], ['high'], 'and the names it declared');
    equal(Object.keys((r.scheduler as unknown as { workerPools: object }).workerPools).sort(), ['T', 'T-slow'],
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
    equal(poolKeys, ['Ingest', 'Publish'], 'one real pool per type instance, keyed by the type`s name');
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
    const sigAt = runtime.indexOf('start(flow, payload, startOptions = {})');
    if (sigAt < 0) throw new Error('W76: start()`s own signature was not found');
    return {
      /** The universe: every member of `DriverOptions`, from its own declaration. */
      all: membersOf(driver, 'export interface DriverOptions'),
      /** Road (a): the keys the `new Driver(…)` literal writes itself, as bare `name,` lines. */
      supplied: [...literal.matchAll(/^ {8}([a-zA-Z][a-zA-Z0-9]*),$/gm)].map((m) => m[1] as string),
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
      /** How `start` reaches each one: conditionally spread, or defaulted with `??`. */
      spreads: [...literal.matchAll(/\.\.\.\(startOptions\.([a-zA-Z][a-zA-Z0-9]*) !== undefined/g)].map((m) => m[1] as string),
      defaulted: [...runtime.slice(sigAt, litEnd).matchAll(/startOptions\.([a-zA-Z][a-zA-Z0-9]*) \?\?/g)].map((m) => m[1] as string),
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
    ok(s.spreads.length > 0 && s.defaulted.length > 0, 'start() reaches members by both roads');
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
    equal(s.all.length, 18, 'DriverOptions has the eighteen members P20 fact 1 counted — move this deliberately, with the roads');
  });

  /**
   * **The two hand-written lists, compared BOTH WAYS — this item's Outputs (2).** P20 fact 2 p1
   * measured the first direction FREE and p3 measured the second bound only by a consumer's own
   * typecheck. *You could widen the list silently; you could not narrow it.* Now neither.
   */
  test('every StartOptions member is REACHED by start, and everything start reaches is DECLARED', async () => {
    const s = await surfaces();
    const declared = sorted([...s.startPick, ...s.startOwn]);
    const reached = sorted([...s.spreads, ...s.defaulted]);
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
   * deliberately. That is [Q102](../../doc/open-questions.md)'s ratchet shape, and it is what
   * catches a behaviour-preserving move that nothing else in the suite can see. *An earlier
   * version of this comment claimed such a move "still passes, which is right"; W76's adequacy
   * reader measured it FALSE and its conformity reader derived the same thing by reading — the
   * only subject the two shared.*
   */
  test('each StartOptions member reaches the driver by EXACTLY ONE of the two roads', async () => {
    const s = await surfaces();
    equal(s.spreads.filter((n) => s.defaulted.includes(n)), [],
      'no member is both conditionally spread and `??`-defaulted — the second would silently win over the first');
    equal(sorted(s.defaulted), ['joinPolicy', 'runId'],
      'and the `??` road has TWO members, not the one P20 decision 5 named: runId is the same shape a declaration site over (W76 finding B)');
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
        // arrivals, every one FROZEN — `OR-R7` and [Q73](../../doc/open-questions.md) at the seam,
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
      const d = r.start(o.flow, { items: 7 }, o.option);
      // Settle every task the driver dispatches, in the order it dispatched them, so a fanout
      // reaches its join and a map reaches its arity refusal. `added` grows as the run advances.
      for (let i = 0; i < s.added.length && i < 20; i += 1) s.settle(String(s.added[i]!.id), { items: 7, ok: true });
      o.drive(s);
      equal(o.saw(d), o.want, `${name}: what the driver did with the option start() forwarded`);
    });
  }
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
