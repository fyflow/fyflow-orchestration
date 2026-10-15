/**
 * **The bootstrap helper and the envelope worker, at ladder L1** — `spec/flow-definition.md`
 * section 3's registry-document subsection (v0.19), ADR 0049 rules 4 and 5, ADR 0054,
 * [W59](../../doc/work-items/w59-what-a-node-type-is.md), [W65](../../doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md).
 *
 * No scheduler runs here. The helper takes a POOL FACTORY seam exactly as the driver takes
 * `createTask`, so every claim about what a pool is built FROM is read back from a recorder — and
 * one test builds the DEFAULT, asserts it is a real `WorkerManager` carrying the same options, and
 * shuts it down, which is ADR 0048 rule 5's pattern one layer out. The envelope worker is driven
 * against an inner worker served from a `data:` URL, which every runtime this suite runs in can
 * `import()`, so the loading half runs in all five and not only where a file system exists.
 *
 * **Since W65 the helper takes the registry's `workers`, `nodeTypes` and `pools` and builds one pool
 * per INSTANCE through the derivation**: the default instance of every type under the type's name,
 * every named instance under its key. Every expected value is the registry literal below, never
 * the run; fact 5's capture is the one literal that came from elsewhere, and it is stated as such.
 */
import { equal, ok, suite, throws } from '../harness.ts';
import { WorkerManager } from 'fyflow-scheduler';
import type { ResourceGroup, WorkerManagerOptions } from 'fyflow-scheduler';
import { bootstrap, BootstrapError, ENVELOPE_WORKER_URL, EnvelopeWorker, NotAnEnvelope, unpackEnvelope } from '../../src/scheduler/index.ts';
import { canonical } from '../../src/definition/schema.ts';
import { NameMissing, poolOptionsOf, RegistryError, WorkerMissing } from '../../src/definition/registry.ts';
import type { LanguageAdapter, NodeTypeDeclaration, NodeTypeDefinition, NodeTypeEntry, PoolSpec, WorkerEntry } from '../../src/definition/types.ts';
import { PATH_LANGUAGE } from './fake-language.ts';
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


/** A group object as the scheduler duck-types it — what the helper is handed and hands back. */
const group = (id: string): ResourceGroup => ({ id } as unknown as ResourceGroup);

const WORKERS: Readonly<Record<string, WorkerEntry>> = {
  scorer: { url: 'test://scorer.ts', configSchema: { type: 'object', properties: { role: { type: 'string' } } } },
  ranker: { url: 'test://ranker.ts' },
  plain: { url: 'test://plain.ts' },
};
const TYPES: Readonly<Record<string, NodeTypeDeclaration>> = {
  Scorer: { worker: 'scorer', inline: true, pool: { maxThreads: 2, idleTimeout: 0 }, groups: ['gpu'], config: { role: 'typed' }, retryPolicy: { maxRetries: 1, backoffMs: 0 } },
  Ranker: { worker: 'ranker', groups: ['gpu', 'api'] },
  Plain: { worker: 'plain' },
};
const REG = { workers: WORKERS, nodeTypes: TYPES };
const GROUPS = { gpu: group('gpu'), api: group('api') };

/** The seam's recorder. */
function recorder() {
  const built: { url: string; options: WorkerManagerOptions }[] = [];
  const createPool = (url: string, options: WorkerManagerOptions) => { built.push({ url, options }); return { url, options } as unknown as WorkerManager; };
  return { built, createPool };
}
const byWorker = (built: { options: WorkerManagerOptions }[], url: string) => built.find((b) => (b.options.config as { worker: string }).worker === url)!;

suite('W59 — bootstrap: one pool per type keyed by its name, the groups both ways, and the default pool is a real WorkerManager', (test) => {
  test('one pool per type, keyed by the type`s name, both ways — obligation (e) on Registry.nodeTypes against the pools', () => {
    const { built, createPool } = recorder();
    const out = bootstrap(REG, GROUPS, { createPool });
    equal(Object.keys(out.workerPools).sort(), [...Object.keys(TYPES), ...BUILT_INS].sort(), 'the pool keys ARE the type names, plus the built-ins — nothing else added, nothing dropped');
    equal(built.length, Object.keys(TYPES).length + BUILT_INS.length, 'and the factory was called exactly once per type, the built-ins among them');
    ok(Object.keys(TYPES).length >= 3, 'over three types, so a loop narrowed to one is visible');
    equal(Object.keys(out.derived).sort(), [...Object.keys(TYPES), ...BUILT_INS].sort(), 'and what each was derived as is handed back, keyed the same');
  });

  test('every pool loads the ENVELOPE worker, with the worker entry`s URL and the DERIVED config inside its pool config', () => {
    const { built, createPool } = recorder();
    bootstrap(REG, GROUPS, { createPool });
    for (const { url } of built) {
      equal(url, ENVELOPE_WORKER_URL, 'the script the pool loads is the package`s envelope worker');
      ok(ENVELOPE_WORKER_URL.endsWith('/envelope-worker.ts'), `resolved against the helper's own module: ${ENVELOPE_WORKER_URL}`);
    }
    const scorer = byWorker(built, 'test://scorer.ts');
    equal(scorer.options.config, { worker: 'test://scorer.ts', config: { role: 'typed' } }, 'the pool config carries the worker`s URL and the derived config, and nothing else');
    equal(scorer.options.groups, ['gpu'], 'the type`s groups are the POOL`s groups');
    equal(scorer.options.maxThreads, 2, 'and the type`s pool options are spread in');
    equal(scorer.options.inline, true, 'inline as the TYPE declares it');
    equal(Object.keys(scorer.options).sort(), ['config', 'groups', 'idleTimeout', 'inline', 'maxThreads'], 'exactly the declared pool options plus inline, groups and config — no retryPolicy, which is per TASK and the driver`s');
    const plain = byWorker(built, 'test://plain.ts');
    equal(Object.keys(plain.options).sort(), ['config'], 'a type declaring nothing gets a pool with config alone — no `groups: undefined`, no `inline` key');
    equal(plain.options.config, { worker: 'test://plain.ts', config: undefined }, 'and an absent type config is carried as undefined for the inner worker to default');
  });

  test('P18 fact 5 through the HELPER — the two L6 types as declarations build exactly what bootstrap built at v0.17, as canonical JSON', () => {
    // The declarations are examples/run-flow.ts's NODE_TYPES literal transcribed; the expected text
    // is fact 5's capture re-taken at W65's declaration (dev-dist/w65/fact5-*.log), URL elided.
    const RETRY = { maxRetries: 1, backoffMs: 0 };
    const l6 = {
      workers: { flow: { url: '<url>' } },
      nodeTypes: {
        Echo: { worker: 'flow', inline: false, config: { role: 'echo' }, pool: { maxThreads: 2, idleTimeout: 0 }, retryPolicy: RETRY },
        Scorer: { worker: 'flow', inline: true, config: { role: 'typed' }, pool: { maxThreads: 2, idleTimeout: 0 }, groups: ['scorer'], retryPolicy: RETRY },
      } as Record<string, NodeTypeEntry>,
    };
    const { built, createPool } = recorder();
    const out = bootstrap(l6, { scorer: group('scorer') }, { createPool });
    const opts = (k: string) => canonical(built[Object.keys(out.workerPools).indexOf(k)]!.options);
    equal(opts('Echo'), '{"config":{"config":{"role":"echo"},"worker":"<url>"},"idleTimeout":0,"inline":false,"maxThreads":2}', 'Echo, option for option');
    equal(opts('Scorer'), '{"config":{"config":{"role":"typed"},"worker":"<url>"},"groups":["scorer"],"idleTimeout":0,"inline":true,"maxThreads":2}', 'Scorer, option for option');
    ok(!('groups' in built[0]!.options), 'Echo carries NO groups key');
  });

  test('a NAMED pool instance is a second pool keyed by its name, its config merged over the type`s — the identity derivation, twice', () => {
    const { built, createPool } = recorder();
    const out = bootstrap({ ...REG, pools: { 'scorer-big': { type: 'Scorer', config: { role: 'typed', size: 'big' } } } }, GROUPS, { createPool });
    equal(Object.keys(out.workerPools).sort(), ['Plain', 'Ranker', 'Scorer', 'scorer-big', ...BUILT_INS].sort(), 'the default instances, the named one and the built-ins');
    const big = built[Object.keys(out.workerPools).indexOf('scorer-big')]!;
    equal(big.options.config, { worker: 'test://scorer.ts', config: { role: 'typed', size: 'big' } }, 'the instance`s config merged over the type`s');
    equal(big.options.maxThreads, 2, 'the type`s pool fields, copied');
    equal(big.options.groups, ['gpu'], 'and its groups');
    equal(out.derived['scorer-big']!.type, 'Scorer', 'derived as an instance of Scorer');
    ok(out.derived['scorer-big']!.spec !== out.derived.Scorer!.spec, 'two specs, not one');
  });

  test('a CLASS type through the helper — its own derivation`s output becomes the pool, held to the same checks', () => {
    const gpu: NodeTypeDefinition = {
      worker: 'scorer', inline: false, config: { role: 'small' },
      pool: (c) => ({ config: c, maxThreads: (c as { role: string }).role === 'big' ? 1 : 4, groups: ['gpu'] } as PoolSpec),
    };
    const { built, createPool } = recorder();
    const out = bootstrap({ workers: WORKERS, nodeTypes: { Gpu: gpu }, pools: { 'gpu-big': { type: 'Gpu', config: { role: 'big' } } } }, { gpu: group('gpu') }, { createPool });
    equal(Object.keys(out.workerPools).sort(), ['Gpu', 'gpu-big', ...BUILT_INS].sort(), 'the default, the named instance and the built-ins');
    equal(built[0]!.options.maxThreads, 4, 'the default through the class`s own config');
    equal(built[1]!.options.maxThreads, 1, 'the named instance through its own');
    equal(built[1]!.options.inline, false, 'inline is the TYPE`s, on every instance');
    // The class's output is held to the worker's configSchema exactly as a document type's is.
    const around: NodeTypeDefinition = { ...gpu, pool: () => ({ config: { role: 7 } }) };
    let err: unknown;
    try { bootstrap({ workers: WORKERS, nodeTypes: { Gpu: around } }, {}, recorder()); } catch (e) { err = e; }
    ok(err instanceof RegistryError && err.at === 'Gpu' && err.message.includes('configSchema'), `a class computing around the worker's schema is refused naming the type: ${(err as Error)?.message}`);
  });

  test('the type`s groups objects come back as resourceGroups, keyed as given, the same objects — and nothing else', () => {
    const out = bootstrap(REG, GROUPS, recorder());
    equal(Object.keys(out.resourceGroups).sort(), ['api', 'gpu'], 'the two given');
    ok(out.resourceGroups.gpu === GROUPS.gpu && out.resourceGroups.api === GROUPS.api, 'by reference — the scheduler must hold the objects the consumer built');
    ok(out.resourceGroups !== GROUPS, 'in a fresh map, so a consumer spreading their own groups beside it edits neither');
  });

  test('direction one: a type naming a group with NO object is refused, naming the type and the id, before any pool is built', () => {
    const { built, createPool } = recorder();
    let err: unknown;
    try { bootstrap({ workers: { ...WORKERS, odd: { url: 'test://odd.ts' } }, nodeTypes: { ...TYPES, Odd: { worker: 'odd', groups: ['gpu', 'nope'] } } }, GROUPS, { createPool }); } catch (e) { err = e; }
    ok(err instanceof NameMissing, `a NameMissing (the derivation names a group the registry lacks): ${(err as Error)?.message}`);
    const msg = (err as Error).message;
    ok(msg.includes('"Odd"') && msg.includes('"nope"') && msg.includes('"gpu"') && msg.includes('"api"'), `names the type, the id and what was given: ${msg}`);
    equal(built, [], 'and NO pool was built — every instance is derived before any pool is built');
  });

  test('direction two: a group object no pool names is refused, naming the id — a group registered and used by nothing', () => {
    const { built, createPool } = recorder();
    throws(() => bootstrap(REG, { ...GROUPS, spare: group('spare') }, { createPool }), '"spare"', 'refused naming the unnamed group');
    equal(built, [], 'and nothing was built');
    let err: unknown;
    try { bootstrap(REG, { ...GROUPS, spare: group('spare') }, { createPool }); } catch (e) { err = e; }
    ok(err instanceof BootstrapError, 'a BootstrapError — the helper`s own refusal, not a registry defect');
    const out = bootstrap({ workers: WORKERS, nodeTypes: { Plain: TYPES.Plain! } }, {}, { createPool });
    equal(out.resourceGroups, {}, 'no groups, no refusal');
    // The adequacy reader (M28): direction two reads what the DERIVATION names — `residentGroups` as well as
    // `groups` — so a group a pool holds only as resident is not "used by nothing".
    const resident = bootstrap({ workers: WORKERS, nodeTypes: { Res: { worker: 'plain', pool: { idleTimeout: 1, residentGroups: ['res'] } } } }, { res: group('res') }, recorder());
    ok(resident.resourceGroups.res === undefined || resident.resourceGroups.res !== undefined, 'built');
    equal(Object.keys(resident.resourceGroups), ['res'], 'a resident-only group is named by its pool and comes back');
    equal(resident.derived.Res!.spec.residentGroups, ['res'], 'and the derived spec carries it as resident');
  });

  test('the check is over the MAP KEY and the group object`s own name is inert — the adequacy reader (q13)', () => {
    const one = { workers: { x: { url: 'x' } }, nodeTypes: { T: { worker: 'x', groups: ['gpu'] } } };
    const byKey = bootstrap(one, { gpu: group('not-gpu') }, recorder());
    ok(byKey.resourceGroups.gpu !== undefined && (byKey.resourceGroups.gpu as unknown as { id: string }).id === 'not-gpu',
      'a type naming "gpu" is satisfied by the object registered UNDER "gpu", whatever it calls itself');
    throws(() => bootstrap(one, { other: group('gpu') }, recorder()), '"gpu"',
      'and an object that CALLS itself "gpu" under another key does not satisfy it — the key is what the scheduler reads');
  });

  test('a type naming no worker, or a worker the registry lacks, is refused by name — WorkerMissing', () => {
    throws(() => bootstrap({ workers: WORKERS, nodeTypes: { Bad: { worker: '' } } }, {}, recorder()), '"Bad"', 'an empty worker name');
    let err: unknown;
    try { bootstrap({ workers: WORKERS, nodeTypes: { Bad: { worker: 'nope' } } }, {}, recorder()); } catch (e) { err = e; }
    ok(err instanceof WorkerMissing && err.at === 'Bad' && err.message.includes('"nope"'), `names the type and the worker: ${(err as Error)?.message}`);
    throws(() => bootstrap({ workers: { w: { url: '' } }, nodeTypes: { Bad: { worker: 'w' } } }, {}, recorder()), '"w"', 'a worker with no url');
  });

  test('a Map-shaped registry bootstraps exactly as an object does', () => {
    const a = bootstrap(REG, GROUPS, recorder());
    const b = bootstrap({ workers: new Map(Object.entries(WORKERS)), nodeTypes: new Map(Object.entries(TYPES)) }, GROUPS, recorder());
    equal(Object.keys(b.workerPools).sort(), Object.keys(a.workerPools).sort(), 'same pool keys');
  });

  test('the PURE entry does not export the helper — ADR 0049 rule 5`s second half, bound (the adequacy reader, q36)', async () => {
    const root = await import('../../index.ts') as Record<string, unknown>;
    for (const name of ['bootstrap', 'BootstrapError', 'ENVELOPE_WORKER_URL', 'EnvelopeWorker', 'NotAnEnvelope', 'unpackEnvelope']) {
      ok(!(name in root), `${name} is the sub-path's and not the root's`);
    }
    ok('Driver' in root && 'validateDefinition' in root && 'resolveRegistry' in root, 'while the root still carries the pure half, the registry resolver included — the loop above is not vacuous');
  });

  test('the DEFAULT factory builds a real WorkerManager carrying the same options — ADR 0048 rule 5`s pattern, one layer out', async () => {
    const out = bootstrap({ workers: { scorer: WORKERS.scorer! }, nodeTypes: { Scorer: TYPES.Scorer! } }, { gpu: GROUPS.gpu });
    const pool = out.workerPools.Scorer!;
    try {
      ok(pool instanceof WorkerManager, 'the scheduler`s own class');
      equal(pool.config, { worker: 'test://scorer.ts', config: { role: 'typed' } }, 'holding the envelope pool config');
      equal(pool.groups, ['gpu'], 'and the type`s groups');
      equal(pool.maxThreads, 2, 'and the declared pool option');
    } finally {
      await pool.shutdown();
    }
  });
});

/** An inner worker any runtime can import: a `data:` URL module exporting a default class. */
const INNER_SRC = `export default class Inner {
  constructor(config, ctx) { this.config = config; this.ctx = ctx; this.log = []; globalThis.__W59_INNER__ = this; }
  async setup() { this.log.push('setup'); }
  async run(p, ctx) { this.log.push('run'); return { keys: Object.keys(p).sort(), settings: p.settings, input: p.input, config: this.config, workerCtx: this.ctx, task: ctx && ctx.taskId ? ctx.taskId : null }; }
  async teardown() { this.log.push('teardown'); }
}`;
const INNER_URL = `data:text/javascript,${encodeURIComponent(INNER_SRC)}`;
const NO_DEFAULT_URL = `data:text/javascript,${encodeURIComponent('export const x = 1;')}`;
/** An ARROW default: a function with no prototype, which the `must export a default class` clause is for (the adequacy reader, q28). */
const ARROW_DEFAULT_URL = `data:text/javascript,${encodeURIComponent('export default () => 1;')}`;

suite('W59 — the envelope worker: unpacks the two keys, refuses everything else, and drives the inner worker`s lifecycle', (test) => {
  test('unpackEnvelope: exactly the two keys come out, a third is dropped, and input may hold undefined', () => {
    equal(unpackEnvelope({ settings: { a: 1 }, input: { b: 2 }, extra: 'later' }), { settings: { a: 1 }, input: { b: 2 } }, 'two keys out, the third dropped — the wrapper`s to consume');
    equal(unpackEnvelope({ settings: {}, input: undefined }), { settings: {}, input: undefined }, 'presence by `in`: an input holding undefined is an envelope');
    equal(Object.keys(unpackEnvelope({ settings: {}, input: 1 })).sort(), ['input', 'settings'], 'and nothing beside them');
  });

  test('unpackEnvelope: everything that is not an envelope is NotAnEnvelope, naming what it got', () => {
    const REFUSED: readonly [string, unknown, string][] = [
      ['null', null, 'not an envelope'],
      ['a number', 5, 'not an envelope'],
      ['an array', [{ settings: {}, input: 1 }], 'not an envelope'],
      ['no input key — the raw payload a bare node would send', { settings: {} }, '"input"'],
      ['no settings key', { input: 1 }, '"settings"'],
      ['a bare payload, keys named', { confidence: 0.9 }, '"confidence"'],
      ['settings not an object', { settings: 5, input: 1 }, 'settings is not a plain object'],
      ['settings an array', { settings: [], input: 1 }, 'settings is not a plain object'],
      ['settings null', { settings: null, input: 1 }, 'settings is not a plain object'],
    ];
    ok(REFUSED.length >= 6 && new Set(REFUSED.map(([l]) => l)).size === REFUSED.length, 'the refused list is non-empty and its labels distinct');
    for (const [label, v, names] of REFUSED) {
      let err: unknown;
      try { unpackEnvelope(v); } catch (e) { err = e; }
      ok(err instanceof NotAnEnvelope, `${label}: NotAnEnvelope`);
      ok((err as Error).message.includes(names), `${label}: the message names it — ${(err as Error).message}`);
    }
  });

  test('setup loads the inner worker from its URL with the type`s config and the worker context, and runs its setup', async () => {
    const w = new EnvelopeWorker({ worker: INNER_URL, config: { role: 'typed' } }, { workerId: 'w1' });
    await w.setup();
    const inner = (globalThis as Record<string, unknown>).__W59_INNER__ as { config: unknown; ctx: unknown; log: string[] };
    equal(inner.config, { role: 'typed' }, 'the inner worker was constructed with the TYPE`s config, not the pool`s');
    equal(inner.ctx, { workerId: 'w1' }, 'and with the worker context forwarded');
    equal(inner.log, ['setup'], 'and its setup ran');
    await w.teardown();
    equal(inner.log, ['setup', 'teardown'], 'teardown reaches the inner worker too');
  });

  test('run hands the inner worker exactly { settings, input } with the task context, and refuses a non-envelope as a task failure', async () => {
    const w = new EnvelopeWorker({ worker: INNER_URL }, undefined);
    await w.setup();
    const inner = (globalThis as Record<string, unknown>).__W59_INNER__ as { config: unknown };
    equal(inner.config, {}, 'no type config means the inner worker gets {}');
    const r = await w.run({ settings: { factor: 10 }, input: { confidence: 0.9 }, extra: 'dropped' }, { taskId: 't1' }) as Record<string, unknown>;
    equal(r.keys, ['input', 'settings'], 'FD-C5: the inner worker saw the two keys and not the third');
    equal(r.settings, { factor: 10 }, 'settings as sent');
    equal(r.input, { confidence: 0.9 }, 'input as sent');
    equal(r.task, 't1', 'the task context reaches the inner worker');
    let err: unknown;
    try { await w.run({ confidence: 0.9 }); } catch (e) { err = e; }
    ok(err instanceof NotAnEnvelope, 'a bare payload is refused inside run(), which the scheduler reports as the TASK failing');
    await w.teardown();
  });

  test('run before setup is refused by name; a module with no default class, and a config with no worker URL, set up WITHOUT throwing and fail every task from run() by name — W141', async () => {
    const cold = new EnvelopeWorker({ worker: INNER_URL });
    let err: unknown;
    try { await cold.run({ settings: {}, input: 1 }); } catch (e) { err = e; }
    ok(err instanceof Error && err.message.includes('before setup()'), `run before setup: ${(err as Error)?.message}`);
    // **W141, Q266**: a throw from setup() is a WORKER error the run never hears of (ADR 0051 F1), so
    // each of these is remembered and thrown from run() instead — the refusal's text is unchanged and
    // only the method that reports it moved. `setup()` resolving is asserted, not assumed.
    for (const [label, cfg, names] of [
      ['no default export', { worker: NO_DEFAULT_URL }, 'default class'],
      ['an arrow default — refused by the prototype clause, by name, not one line later as "not a constructor"', { worker: ARROW_DEFAULT_URL }, 'default class'],
      ['no worker URL', {}, 'no worker URL'],
    ] as const) {
      const w = new EnvelopeWorker(cfg as unknown as { worker: string });
      let setupErr: unknown = null;
      try { await w.setup(); } catch (e) { setupErr = e; }
      equal(setupErr, null, `${label}: setup() does not throw`);
      err = undefined;
      try { await w.run({ settings: {}, input: 1 }); } catch (e) { err = e; }
      ok(err instanceof Error && err.message.includes(names) && !err.message.includes('before setup()'),
        `${label}: run() fails the task naming why, and not as a cold worker: ${(err as Error)?.message}`);
    }
  });
});

/**
 * **W162 — the helper's part in a transform: EVERY language it is given reaches EVERY pool it builds,
 * and it reads no flow** — [ADR 0096](../../doc/decisions/0096-a-runtime-is-its-registry-and-start-refuses-from-runtime-check.md)
 * rule 2, superseding ADR 0051 rule 4 (W61's suite, which asserted that a language reached ONLY the
 * types some node of a given flow transformed on). Expected values are the `LANGS` literal below and
 * the registry literal above, never the helper's output: every pool's `languages` is exactly
 * `{ name: adapter.worker }` for every adapter given, sorted by name.
 */
const PATH_URL = PATH_LANGUAGE.worker;
const OTHER: LanguageAdapter = { compile: () => {}, worker: 'test://other-language.js' };
/** Given in REVERSE name order, so the sorted key order below is the helper's doing and not the literal's. */
const LANGS = { path: PATH_LANGUAGE, other: OTHER };
/** What every pool must carry, written from `LANGS` by hand: both names, each its adapter's WORKER half. */
const CARRIED = { other: 'test://other-language.js', path: PATH_URL };

suite('W162 — bootstrap writes EVERY language it is given into EVERY pool it builds, and reads no flow (ADR 0096 rule 2)', (test) => {
  test('every pool — each declared type`s default, a NAMED instance, and the built-in — carries exactly the given languages, both ways, as the adapters` worker URLs', () => {
    const { built, createPool } = recorder();
    const out = bootstrap({ ...REG, pools: { 'scorer-2': { type: 'Scorer' } } }, GROUPS, { createPool, languages: LANGS });
    // The pool set first, so the per-pool claim below is over every pool the helper built and over nothing else.
    equal(Object.keys(out.workerPools).sort(), [...Object.keys(TYPES), 'scorer-2', ...BUILT_INS].sort(), 'one pool per declared type, the named instance, and the built-ins');
    equal(built.length, Object.keys(out.workerPools).length, 'and the factory was called once per pool');
    for (const [i, key] of Object.keys(out.workerPools).entries()) {
      const cfg = built[i]!.options.config as { languages?: Record<string, string> };
      equal(cfg.languages, CARRIED, `${key}: every given language, each the adapter's worker half — a type no flow transforms on included`);
      equal(Object.keys(cfg.languages ?? {}), Object.keys(CARRIED), `${key}: in name order, whatever order the registry gave them in`);
    }
    // Both ways against the GIVEN registry, read from `LANGS` rather than from `CARRIED`: a language given and
    // carried by no pool, and a language carried that was not given, are each a difference here.
    const given = Object.keys(LANGS).sort();
    for (const b of built) {
      const carried = Object.keys((b.options.config as { languages?: object }).languages ?? {}).sort();
      equal(given.filter((n) => !carried.includes(n)), [], 'no given language is missing from a pool');
      equal(carried.filter((n) => !given.includes(n)), [], 'and no pool carries a language that was not given');
    }
    equal(byWorker(built, 'test://plain.ts').options.config, { worker: 'test://plain.ts', config: undefined, languages: CARRIED },
      'Plain, a type with no node anywhere, carries them beside its worker and config — the three keys and nothing else');
  });

  test('NO languages — omitted, an empty object, an empty Map — builds every pool exactly as a call with no options at all: no `languages` key anywhere (P18 fact 5 unmoved)', () => {
    const a = recorder(); bootstrap(REG, GROUPS, { createPool: a.createPool });
    const b = recorder(); bootstrap(REG, GROUPS, { createPool: b.createPool, languages: {} });
    const c = recorder(); bootstrap(REG, GROUPS, { createPool: c.createPool, languages: new Map() });
    equal(b.built, a.built, 'an empty languages object: identical');
    equal(c.built, a.built, 'an empty Map: identical');
    ok(a.built.length > 0 && a.built.every((x) => !('languages' in (x.options.config as object))), 'and no pool config carries a languages key');
    // The CONTROL beside the claim: the same registry with a language given DOES differ, so the equalities above
    // are about the languages and not about a recorder that records nothing distinguishing.
    const d = recorder(); bootstrap(REG, GROUPS, { createPool: d.createPool, languages: LANGS });
    ok(d.built.every((x) => 'languages' in (x.options.config as object)), 'CONTROL: with a language given, every pool carries the key');
  });

  test('an adapter with no worker URL is refused naming the language, before any pool is built — and the helper takes no flows at all', () => {
    const { built, createPool } = recorder();
    let err: unknown;
    try { bootstrap(REG, GROUPS, { createPool, languages: { path: { compile: () => {}, worker: '' } } }); } catch (e) { err = e; }
    ok(err instanceof BootstrapError && (err as Error).message.includes('"path"') && (err as Error).message.includes('no worker module URL'),
      `a BootstrapError naming the language: ${(err as Error)?.message ?? 'nothing'}`);
    equal(built, [], 'and NO pool was built');
    throws(() => bootstrap(REG, GROUPS, { createPool, languages: { path: PATH_LANGUAGE, other: { compile: () => {} } as unknown as LanguageAdapter } }),
      '"other"', 'an adapter with no worker key at all is refused the same way, naming it — the second of two, so the check is over every adapter');
    // ADR 0096 rule 3: `flows` is not an option any more. A caller passing one fails to COMPILE (the
    // `@ts-expect-error` below fails `typecheck` if `flows` comes back), and at run time it is ignored.
    // @ts-expect-error — `flows` was removed from `BootstrapOptions` by W162
    const ignored = bootstrap(REG, GROUPS, { createPool: recorder().createPool, languages: LANGS, flows: [] });
    equal(Object.keys(ignored.workerPools).sort(), [...Object.keys(TYPES), ...BUILT_INS].sort(), 'and passing it anyway changes nothing that is built');
  });

  test('a transform in a language the POOL does not carry fails the task naming the registry, not a flow — the envelope`s message since W162 (E1)', async () => {
    const w = new EnvelopeWorker({ transformOnly: true, config: {}, languages: { path: PATH_URL } });
    await w.setup();
    let err: unknown;
    try { await w.run({ settings: {}, input: 1, transform: { lang: 'nope', expr: 'x' } }); } catch (e) { err = e; }
    const m = (err as Error)?.message ?? '';
    ok(m.includes('language "nope" is not loaded in this pool') && m.includes('"path"'), `names the language and what the pool carries: ${m}`);
    ok(m.includes('every language it is given into every pool') && !m.includes('needs the flow'), `and points at the registry, never at a flow: ${m}`);
  });

  test('each pool carries its OWN copy of the languages record, and a Map-shaped registry bootstraps as an object does', () => {
    const { built, createPool } = recorder();
    bootstrap(REG, GROUPS, { createPool, languages: LANGS });
    const records = built.map((b) => (b.options.config as { languages: object }).languages);
    equal(new Set(records).size, records.length, 'no two pool configs share one languages object');
    const m = recorder();
    bootstrap(REG, GROUPS, { createPool: m.createPool, languages: new Map(Object.entries(LANGS)) });
    equal(m.built, built, 'a Map-shaped languages registry builds what the object-shaped one does');
  });
});

suite('W109 — the pool config the library BUILDS for a transform-only type, and what the arm READS', (test) => {
  // **The adequacy reader's central finding (F1): the two halves of the marker were bound to each
  // other by NOTHING.** `poolOptionsOf` WRITES `transformOnly` and `EnvelopeWorker.setup()` READS it,
  // and `transformOnly` appeared in no assertion anywhere — only in `transform.test.ts`'s own
  // HAND-WRITTEN `ONLY_CFG` literal. So dropping the marker, and renaming it, each cost ZERO at
  // `npm test` AND at `typecheck` (the literal is `as WorkerManagerOptions`), after which the library
  // itself produces the config `setup()`'s own v0.17 clause calls malformed. These cases are the
  // producing side; `transform.test.ts`'s W109 suite is the consuming side.

  test('`poolOptionsOf` with NO worker url writes the MARKER and no `worker` key — and with one, the reverse', () => {
    const withUrl = poolOptionsOf({}, true, 'u', { path: 'p' });
    const noUrl = poolOptionsOf({}, true, undefined, { path: 'p' });
    // Both halves, as whole values rather than as spot checks — a key list alone would not see a
    // marker written beside a worker (which is the contradiction `setup()` refuses).
    equal(withUrl.config, { worker: 'u', config: undefined, languages: { path: 'p' } }, 'an inner worker: the url, and NO marker');
    equal(noUrl.config, { transformOnly: true, config: undefined, languages: { path: 'p' } }, 'none: the MARKER, and no worker key');
    ok(!('transformOnly' in (withUrl.config as object)), 'the marker is absent rather than false when there IS a worker');
    ok(!('worker' in (noUrl.config as object)), 'and `worker` is ABSENT rather than undefined — an absent key is what survives the clone into a thread');
    // The pair is a claim: what makes the two differ is exactly one key each, read from the values.
    const keys = (o: unknown) => Object.keys(o as object).sort();
    equal([keys(withUrl.config), keys(noUrl.config)], [['config', 'languages', 'worker'], ['config', 'languages', 'transformOnly']],
      'one key each is what the pair turns on');
  });

  test('`bootstrap` writes that config for the BUILT-IN and the worker config for everything else — the producing side of the arm', () => {
    const { built, createPool } = recorder();
    const out = bootstrap({ workers: WORKERS, nodeTypes: { Scorer: { worker: 'scorer' } } }, {}, { createPool });
    const cfg = (key: string) => {
      const i = Object.keys(out.workerPools).indexOf(key);
      ok(i >= 0, `a pool was built for ${key}`);
      return built[i]!.options.config as Record<string, unknown>;
    };
    equal(cfg('Transform').transformOnly, true, 'the built-in`s pool config carries the marker');
    ok(!('worker' in cfg('Transform')), 'and names no inner worker');
    equal(cfg('Scorer').worker, WORKERS.scorer!.url, 'a consumer`s type carries its worker`s url');
    ok(!('transformOnly' in cfg('Scorer')), 'and no marker');
    // Every pool loads the ENVELOPE script either way — that is what makes the marker the only
    // discriminator inside it.
    equal([...new Set(built.map((b) => b.url))], [ENVELOPE_WORKER_URL], 'both pools load the package`s own envelope script');
  });

  test('the built-in`s pool carries the LANGUAGES it needs, because it ALWAYS transforms — and since ADR 0096 so does every consumer type, with no flow given', () => {
    // The adequacy reader's T4 (W109): inserting `if (builtIn(name)) continue;` into the languages loop
    // cost ZERO, and the one type that always transforms was then built with no engine — every task
    // on it failing *language "path" is not loaded in this pool*. Since W162 there is no flow to name a
    // `Transform` node: the built-in carries the registry's languages because every pool does.
    const { built, createPool } = recorder();
    const out = bootstrap({ workers: WORKERS, nodeTypes: { Scorer: { worker: 'scorer' } } }, {},
      { createPool, languages: { path: PATH_LANGUAGE } });
    const at = (key: string) => built[Object.keys(out.workerPools).indexOf(key)]!.options.config as { languages?: Record<string, string> };
    equal(Object.keys(at('Transform').languages ?? {}), ['path'], 'the built-in`s pool carries the adapter`s worker url');
    equal(at('Transform').languages!.path, PATH_LANGUAGE.worker, 'and it IS the adapter`s own worker half');
    equal(at('Scorer').languages, { path: PATH_LANGUAGE.worker }, 'and a consumer`s type no flow transforms on carries the same — ADR 0096 rule 2, where W109`s control said NONE');
  });

  test('a NAMED pool instance of the built-in builds, and is refused by NAME when its type is unknown — the road ADR 0075 rule 3 blesses', () => {
    // **W109's conformity reader (3): this CRASHED with an unnamed `TypeError`.** The named-instance
    // loop read `derived[inst.type]!.definition`, and this item's own pool ordering made `derived`
    // incomplete there, so a named instance of a built-in dereferenced `undefined` — on the one road
    // ADR 0075 rule 3 names. It reads the definition from `types` now.
    const { built, createPool } = recorder();
    const out = bootstrap({ workers: WORKERS, nodeTypes: { Scorer: { worker: 'scorer' } }, pools: { 'reshape-big': { type: 'Transform', config: { n: 1 } } } }, {}, { createPool });
    equal(Object.keys(out.workerPools).sort(), ['Scorer', 'Transform', 'reshape-big'], 'the two defaults and the named instance');
    const named = built[Object.keys(out.workerPools).indexOf('reshape-big')]!.options.config as Record<string, unknown>;
    equal(named.transformOnly, true, 'a named instance of the built-in carries the marker too');
    equal(named.config, { n: 1 }, 'and the instance`s own config');
    ok(!('worker' in named), 'and still no inner worker');
  });

  test('the ORDER is asserted UNSORTED — ADR 0075 rule 5`s *not cosmetic*, which nothing observed', () => {
    // **Both readers found this unbound** (conformity 10, adequacy F10): every pool assertion in the
    // tree sorts its keys, including the two whose own comments assert the order, so *the built-ins
    // come LAST, so adding one never renumbers a consumer's pools* had no observer at all. This is
    // the only unsorted one.
    const { createPool } = recorder();
    const out = bootstrap({
      workers: WORKERS,
      nodeTypes: { Zed: { worker: 'scorer' }, Alpha: { worker: 'ranker' } },
      pools: { inst: { type: 'Zed' } },
    }, {}, { createPool });
    equal(Object.keys(out.workerPools), ['Zed', 'Alpha', 'inst', 'Transform'],
      'the consumer`s types in DECLARED order, then its named instances, then the library`s own — unsorted, so prepending a built-in is red here');
    equal(Object.keys(out.derived), ['Zed', 'Alpha', 'inst', 'Transform'], 'and `derived` agrees, key for key and position for position');
  });
});
