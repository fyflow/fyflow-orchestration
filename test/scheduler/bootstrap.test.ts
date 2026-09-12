/**
 * **The bootstrap helper and the envelope worker, at ladder L1** — `spec/flow-definition.md`
 * section 2 (v0.17), ADR 0049 rules 4 and 5, [W59](../../doc/work-items/w59-what-a-node-type-is.md).
 *
 * No scheduler runs here. The helper takes a POOL FACTORY seam exactly as the driver takes
 * `createTask`, so every claim about what a pool is built FROM is read back from a recorder — and
 * one test builds the DEFAULT, asserts it is a real `WorkerManager` carrying the same options, and
 * shuts it down, which is ADR 0048 rule 5's pattern one layer out. The envelope worker is driven
 * against an inner worker served from a `data:` URL, which every runtime this suite runs in can
 * `import()`, so the loading half runs in all five and not only where a file system exists.
 *
 * Every expected value is the registry literal below, never the run.
 */
import { equal, ok, suite, throws } from '../harness.ts';
import { WorkerManager } from 'fyflow-scheduler';
import type { ResourceGroup, WorkerManagerOptions } from 'fyflow-scheduler';
import { bootstrap, BootstrapError, ENVELOPE_WORKER_URL, EnvelopeWorker, NotAnEnvelope, unpackEnvelope } from '../../src/scheduler/index.ts';
import type { NodeType } from '../../src/definition/types.ts';

/** A group object as the scheduler duck-types it — what the helper is handed and hands back. */
const group = (id: string): ResourceGroup => ({ id } as unknown as ResourceGroup);

const TYPES: Readonly<Record<string, NodeType>> = {
  Scorer: { worker: 'test://scorer.ts', pool: { maxThreads: 2, inline: true, idleTimeout: 0 }, groups: ['gpu'], config: { role: 'typed' }, retryPolicy: { maxRetries: 1, backoffMs: 0 } },
  Ranker: { worker: 'test://ranker.ts', groups: ['gpu', 'api'] },
  Plain: { worker: 'test://plain.ts' },
};
const GROUPS = { gpu: group('gpu'), api: group('api') };

/** The seam's recorder. */
function recorder() {
  const built: { url: string; options: WorkerManagerOptions }[] = [];
  const createPool = (url: string, options: WorkerManagerOptions) => { built.push({ url, options }); return { url, options } as unknown as WorkerManager; };
  return { built, createPool };
}

suite('W59 — bootstrap: one pool per type keyed by its name, the groups both ways, and the default pool is a real WorkerManager', (test) => {
  test('one pool per type, keyed by the type`s name, both ways — obligation (e) on Registry.nodeTypes against the pools', () => {
    const { built, createPool } = recorder();
    const out = bootstrap(TYPES, GROUPS, { createPool });
    equal(Object.keys(out.workerPools).sort(), Object.keys(TYPES).sort(), 'the pool keys ARE the type names — nothing added, nothing dropped');
    equal(built.length, Object.keys(TYPES).length, 'and the factory was called exactly once per type');
    ok(Object.keys(TYPES).length >= 3, 'over three types, so a loop narrowed to one is visible');
  });

  test('every pool loads the ENVELOPE worker, with the type`s real worker and config inside its pool config', () => {
    const { built, createPool } = recorder();
    bootstrap(TYPES, GROUPS, { createPool });
    for (const { url } of built) {
      equal(url, ENVELOPE_WORKER_URL, 'the script the pool loads is the package`s envelope worker');
      // The FILE, not the path: in the browser bundle `import.meta.url` is the bundle's own URL, so
      // the worker resolves beside the bundle rather than under `src/` — measured on this suite's
      // first browser run, all three engines. A bundled consumer ships the envelope worker as a
      // sibling asset, which is `AGENTS.md` section 12's own note about worker files one module over.
      ok(ENVELOPE_WORKER_URL.endsWith('/envelope-worker.ts'), `resolved against the helper's own module: ${ENVELOPE_WORKER_URL}`);
    }
    const scorer = built.find((b) => (b.options.config as { worker: string }).worker === 'test://scorer.ts')!;
    equal(scorer.options.config, { worker: 'test://scorer.ts', config: { role: 'typed' } }, 'the pool config carries the inner worker URL and ITS config, and nothing else');
    equal(scorer.options.groups, ['gpu'], 'the type`s groups are the POOL`s groups');
    equal(scorer.options.maxThreads, 2, 'and the type`s pool options are spread in');
    equal(scorer.options.inline, true, 'inline as declared');
    equal(Object.keys(scorer.options).sort(), ['config', 'groups', 'idleTimeout', 'inline', 'maxThreads'], 'exactly the declared pool options plus groups and config — no retryPolicy, which is per TASK and the driver`s');
    const plain = built.find((b) => (b.options.config as { worker: string }).worker === 'test://plain.ts')!;
    equal(Object.keys(plain.options).sort(), ['config'], 'a type declaring no pool options and no groups gets a pool with config alone — no `groups: undefined` key');
    equal(plain.options.config, { worker: 'test://plain.ts', config: undefined }, 'and an absent type config is carried as undefined for the inner worker to default');
  });

  test('the type`s groups objects come back as resourceGroups, keyed as given, the same objects — and nothing else', () => {
    const out = bootstrap(TYPES, GROUPS, recorder());
    equal(Object.keys(out.resourceGroups).sort(), ['api', 'gpu'], 'the two given');
    ok(out.resourceGroups.gpu === GROUPS.gpu && out.resourceGroups.api === GROUPS.api, 'by reference — the scheduler must hold the objects the consumer built');
    ok(out.resourceGroups !== GROUPS, 'in a fresh map, so a consumer spreading their own groups beside it edits neither');
  });

  test('direction one: a type naming a group with NO object is refused, naming the type and the id, before any pool is built', () => {
    const { built, createPool } = recorder();
    let err: unknown;
    try { bootstrap({ ...TYPES, Odd: { worker: 'test://odd.ts', groups: ['gpu', 'nope'] } }, GROUPS, { createPool }); } catch (e) { err = e; }
    ok(err instanceof BootstrapError, 'a BootstrapError');
    const msg = (err as Error).message;
    ok(msg.includes('"Odd"') && msg.includes('"nope"') && msg.includes('"gpu"') && msg.includes('"api"'), `names the type, the id and what was given: ${msg}`);
    equal(built, [], 'and NO pool was built — the check runs over every type first');
  });

  test('direction two: a group object no type names is refused, naming the id — a group registered and used by nothing', () => {
    const { built, createPool } = recorder();
    throws(() => bootstrap(TYPES, { ...GROUPS, spare: group('spare') }, { createPool }), '"spare"', 'refused naming the unnamed group');
    equal(built, [], 'and nothing was built');
    // The two directions are two clauses: a registry with NO groups at all and types naming none
    // passes both, so neither clause is a floor over the other.
    const out = bootstrap({ Plain: TYPES.Plain! }, {}, { createPool });
    equal(out.resourceGroups, {}, 'no groups, no refusal');
  });

  test('the check is over the MAP KEY and the group object`s own name is inert — the adequacy reader (q13)', () => {
    // ADR 0049 fact 2: the scheduler resolves a group by the key of the map it was given and a
    // group's own `id` is inert. Every fixture had key === id, so a helper re-sourced to the objects'
    // ids survived L1 AND L6 (the reader measured it). This case is the one whose key differs.
    const byKey = bootstrap({ T: { worker: 'x', groups: ['gpu'] } }, { gpu: group('not-gpu') }, recorder());
    ok(byKey.resourceGroups.gpu !== undefined && (byKey.resourceGroups.gpu as unknown as { id: string }).id === 'not-gpu',
      'a type naming "gpu" is satisfied by the object registered UNDER "gpu", whatever it calls itself');
    throws(() => bootstrap({ T: { worker: 'x', groups: ['gpu'] } }, { other: group('gpu') }, recorder()), '"gpu"',
      'and an object that CALLS itself "gpu" under another key does not satisfy it — the key is what the scheduler reads');
  });

  test('a type naming no worker is refused by name', () => {
    throws(() => bootstrap({ Bad: { worker: '' } }, {}, recorder()), '"Bad"', 'an empty worker URL');
    throws(() => bootstrap({ Bad: { worker: 5 as unknown as string } }, {}, recorder()), '"Bad"', 'a non-string worker');
  });

  test('a Map-shaped registry bootstraps exactly as an object does', () => {
    const a = bootstrap(TYPES, GROUPS, recorder());
    const b = bootstrap(new Map(Object.entries(TYPES)), GROUPS, recorder());
    equal(Object.keys(b.workerPools).sort(), Object.keys(a.workerPools).sort(), 'same pool keys');
  });

  test('the PURE entry does not export the helper — ADR 0049 rule 5`s second half, bound (the adequacy reader, q36)', async () => {
    // `export * from "./src/scheduler/index.ts"` appended to `index.ts` was green at check:source
    // (S7 permits the bare specifier anywhere since ADR 0048), npm test, lint, all five typechecks
    // AND the browser bundle — the decision P16, ADR 0049 and AGENTS.md section 13 all state had no
    // observer. The pure half must load no WorkerManager, so the root may name none of these.
    const root = await import('../../index.ts') as Record<string, unknown>;
    for (const name of ['bootstrap', 'BootstrapError', 'ENVELOPE_WORKER_URL', 'EnvelopeWorker', 'NotAnEnvelope', 'unpackEnvelope']) {
      ok(!(name in root), `${name} is the sub-path's and not the root's`);
    }
    ok('Driver' in root && 'validateDefinition' in root, 'while the root still carries the pure half — the loop above is not vacuous');
  });

  test('the DEFAULT factory builds a real WorkerManager carrying the same options — ADR 0048 rule 5`s pattern, one layer out', async () => {
    const out = bootstrap({ Scorer: TYPES.Scorer! }, { gpu: GROUPS.gpu });
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
    equal(unpackEnvelope({ settings: { a: 1 }, input: { b: 2 }, transform: 'later' }), { settings: { a: 1 }, input: { b: 2 } }, 'two keys out, the third dropped — the wrapper`s to consume');
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

  test('run before setup, and a module with no default class, are refused by name', async () => {
    const cold = new EnvelopeWorker({ worker: INNER_URL });
    let err: unknown;
    try { await cold.run({ settings: {}, input: 1 }); } catch (e) { err = e; }
    ok(err instanceof Error && err.message.includes('before setup()'), `run before setup: ${(err as Error)?.message}`);
    const noDefault = new EnvelopeWorker({ worker: NO_DEFAULT_URL });
    err = undefined;
    try { await noDefault.setup(); } catch (e) { err = e; }
    ok(err instanceof Error && err.message.includes('default class'), `no default export: ${(err as Error)?.message}`);
    const arrow = new EnvelopeWorker({ worker: ARROW_DEFAULT_URL });
    err = undefined;
    try { await arrow.setup(); } catch (e) { err = e; }
    ok(err instanceof Error && err.message.includes('default class'), `an arrow default is refused by the prototype clause, by name, not one line later as "not a constructor": ${(err as Error)?.message}`);
    const noUrl = new EnvelopeWorker({} as unknown as { worker: string });
    err = undefined;
    try { await noUrl.setup(); } catch (e) { err = e; }
    ok(err instanceof Error && err.message.includes('no worker URL'), `no worker URL: ${(err as Error)?.message}`);
  });
});
