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
import { equal, ok, suite, throws } from '../harness.ts';
import {
  BUILT_IN_GROUP_FACTORIES, createRuntime, GROUP_MEMBERS, GroupNotBuildable, GroupUnusable,
  LanguageNotBuilt, RuntimeError,
} from '../../src/scheduler/runtime.ts';
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

  test('a group the document declares that no pool names is still CREATED — direction two is the helper`s refusal, and it fires', () => {
    const s = seams();
    throws(() => createRuntime(edited((d) => { d.groups.spare = { type: 'ConcurrentLimitGroup', config: { limit: 1 } }; }), {},
      { createPool: s.createPool, createScheduler: s.createScheduler }), 'spare', 'a group registered and used by nothing is refused, naming it');
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
const WORKER_URL = '../../examples/workers/flow-worker.ts';

suite('W66 — a runtime on REAL pools: a document in, a completed run out', (test) => {
  test(`a flow built entirely from a document runs to completed on a real FyflowScheduler — ${IN_BROWSER ? 'SKIPPED in the browser (RT-R10)' : 'inline pools, no seam'}`, async () => {
    if (IN_BROWSER) {
      ok(true, 'skipped: a browser loads no .ts worker file, which is RT-R10 and is why ladder L6 runs in Node and Deno only');
      return;
    }
    const runtime = createRuntime({
      workers: { flow: { url: WORKER_URL } },
      groups: { gate: { type: 'ConcurrentLimitGroup', config: { limit: 1 } } },
      nodeTypes: {
        Ingest: { worker: 'flow', inline: true, config: { role: 'ingest' }, pool: { maxThreads: 1, idleTimeout: 0 } },
        Publish: { worker: 'flow', inline: true, config: { role: 'publish' }, pool: { maxThreads: 1, idleTimeout: 0 }, groups: ['gate'] },
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
