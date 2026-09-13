/**
 * **The bootstrap helper — a registry of node types becomes the scheduler's `workerPools` and
 * `resourceGroups`** — `spec/flow-definition.md` section 2 (v0.17),
 * [ADR 0049](../../doc/decisions/0049-a-node-type-is-a-registry-entry-and-its-worker-receives-an-envelope.md)
 * rule 5, [P16](../../doc/plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md)
 * decision 5, [W59](../../doc/work-items/w59-what-a-node-type-is.md); **and since v0.18 the place
 * a language adapter's WORKER half reaches a typed pool** —
 * [ADR 0051](../../doc/decisions/0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md)
 * rule 4, [W61](../../doc/work-items/w61-what-a-transform-is.md).
 *
 * **This is the one place the published package CONSTRUCTS a scheduler object**, and it is a
 * sub-path (`fyflow-orchestration/scheduler`) so the pure entry — the validator, the driver, the
 * fold — still loads no `WorkerManager`. Legal since
 * [ADR 0048](../../doc/decisions/0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md);
 * `src/driver/**` still constructs nothing and RECEIVES its scheduler.
 *
 * One pool per type, **keyed by the type's name** — which is what `FD-V32`'s second clause checks
 * and why the consumer passes `Object.keys(scheduler.workerPools)` to the driver unchanged. Every
 * pool runs the package's envelope worker with the type's real worker and config in its pool
 * config, the type's `pool` options, and the type's `groups`.
 *
 * **The groups are compared BOTH WAYS, because the scheduler will not** (P16 fact 2, and W59's
 * pool-level re-measurement): a type naming a group with no object here would run with that
 * group silently ignored, and a group object no type names is the silent kind too — registered
 * and used by nothing. The consumer's OWN bare pools and groups are spread beside this helper's
 * return values, which is why direction two is a refusal rather than an allowance: this map is
 * the types' groups and only theirs.
 *
 * **The languages are written into a pool's config ONLY for a type some node of which declares a
 * transform, and only the languages those nodes name** (W61, P17 decision 3): the helper reads the
 * `flows` it is given, collects each type's transforming languages, and writes their WORKER-side
 * module URLs (`LanguageAdapter.worker`) beside `worker` and `config` — a FUNCTION could not cross
 * to a thread and a URL can (P17 fact 7). A type whose nodes never transform gets the two-key pool
 * config it had at v0.17, so no pool loads an engine it does not use, and every existing pool
 * config is byte-identical. Direction one is a refusal — a node naming a language with no adapter
 * given would meet its transform in the wrapper with nothing to evaluate it. **Direction two is
 * NOT**: an adapter given that no node names is a registry entry nobody reached for, inert, where
 * a group registered and used by nothing is a scheduler object holding silence — the asymmetry is
 * stated rather than mirrored.
 */
import { WorkerManager } from 'fyflow-scheduler';
import type { ResourceGroup, WorkerManagerOptions } from 'fyflow-scheduler';
import type { FlowDefinition, Languages, NodeTypes, TaskNode } from '../definition/types.ts';
import { languagesOf, nodeTypesOf } from '../definition/validate.ts';
import type { EnvelopePoolConfig } from './envelope-worker.ts';

/**
 * The script every typed pool loads. Resolved against THIS module, so it is the published
 * package's own file wherever the package is installed; the type's real worker is loaded from
 * inside it (`EnvelopeWorker.setup`).
 */
export const ENVELOPE_WORKER_URL: string = new URL('./envelope-worker.ts', import.meta.url).href;

/** A registry that cannot be bootstrapped, and why — thrown before any pool is built. */
export class BootstrapError extends Error {}

/**
 * **The seam, and it is `createTask`'s shape one layer out**: omitted, a real `WorkerManager` is
 * built (rule 5's default); ladder L1 passes a recorder and reads the script URL and options back.
 */
export type PoolFactory = (scriptUrl: string, options: WorkerManagerOptions) => WorkerManager;

export interface BootstrapOptions {
  createPool?: PoolFactory;
  /**
   * **The registry's languages — the same object the driver is handed** (W61). Read for ONE field,
   * `worker`, and only for the languages some node in `flows` declares on a node of each type.
   */
  languages?: Languages;
  /**
   * **The flows these pools will run**, read for WHICH types transform in WHICH languages. Omitted,
   * or naming no transform, every pool config is exactly what it was at v0.17. A node naming a
   * type this registry lacks is skipped here — it is the driver's `FD-V32`, not this helper's.
   */
  flows?: readonly FlowDefinition[];
}

export interface BootstrapResult {
  /** One per type, keyed by the type's name — spread into `new FyflowScheduler(...)`'s first argument. */
  workerPools: Record<string, WorkerManager>;
  /** The group objects passed in, keyed as they were — spread into the second argument. */
  resourceGroups: Record<string, ResourceGroup>;
}

const defaultCreatePool: PoolFactory = (scriptUrl, options) => new WorkerManager(scriptUrl, options);

/**
 * **Which languages each type's nodes transform in, over the flows given** — the one reading of a
 * definition this helper makes. Exported so a test can compare what the helper WROTE into pool
 * configs against what the flows DECLARE, both ways (rule 8 obligation (e) on `Registry.languages`).
 */
export function transformLanguagesByType(flows: readonly FlowDefinition[]): ReadonlyMap<string, ReadonlySet<string>> {
  const out = new Map<string, Set<string>>();
  for (const flow of flows) {
    for (const n of flow.nodes) {
      if (n.kind !== 'task') continue;
      const t = n as TaskNode;
      if (t.type === undefined || t.transform === undefined) continue;
      let set = out.get(t.type);
      if (set === undefined) { set = new Set(); out.set(t.type, set); }
      set.add(t.transform.lang);
    }
  }
  return out;
}

export function bootstrap(
  nodeTypes: NodeTypes,
  groups: Readonly<Record<string, ResourceGroup>> = {},
  options: BootstrapOptions = {},
): BootstrapResult {
  const types = nodeTypesOf(nodeTypes);
  const groupIds = new Set(Object.keys(groups));
  const namedByTypes = new Set<string>();
  // Direction one: every group a type names has an object. Checked for EVERY type before any
  // pool is built, so a refusal leaves nothing half-constructed.
  for (const [name, t] of types) {
    if (typeof t.worker !== 'string' || t.worker.length === 0) {
      throw new BootstrapError(`node type "${name}" names no worker — NodeType.worker is the module URL of its worker class`);
    }
    for (const g of t.groups ?? []) {
      namedByTypes.add(g);
      if (!groupIds.has(g)) {
        throw new BootstrapError(`node type "${name}" declares group "${g}", and no group object was given for it ` +
          `(given: ${[...groupIds].sort().map((x) => `"${x}"`).join(', ') || 'none'}) — a pool naming a group the scheduler lacks acquires nothing, in silence`);
      }
    }
  }
  // Direction two: every group object given is named by some type.
  for (const g of groupIds) {
    if (!namedByTypes.has(g)) {
      throw new BootstrapError(`group "${g}" was given and no node type declares it — a group registered and used by nothing is the silent kind; ` +
        'register groups for bare workerType nodes beside this helper`s return value, not through it');
    }
  }
  // **The languages, per type, from the flows** — W61. Every language a typed node names must
  // have an adapter with a worker URL, checked for every type before any pool is built, as the
  // groups are; the URLs are written only where a node declares a transform.
  const adapters = languagesOf(options.languages);
  const byType = transformLanguagesByType(options.flows ?? []);
  const languagesFor = new Map<string, Record<string, string>>();
  for (const [name] of types) {
    const langs = byType.get(name);
    if (langs === undefined || langs.size === 0) continue;
    const urls: Record<string, string> = {};
    for (const lang of [...langs].sort()) {
      const adapter = adapters.get(lang);
      if (adapter === undefined) {
        throw new BootstrapError(`node type "${name}" has a node declaring transform.lang "${lang}", and no adapter was given for it ` +
          `(given: ${[...adapters.keys()].sort().map((x) => `"${x}"`).join(', ') || 'none'}) — the wrapper would meet the transform with nothing to evaluate it`);
      }
      if (typeof adapter.worker !== 'string' || adapter.worker.length === 0) {
        throw new BootstrapError(`language "${lang}" names no worker module URL — LanguageAdapter.worker is the URL of the module whose default export compiles and evaluates it; a function cannot cross to a thread`);
      }
      urls[lang] = adapter.worker;
    }
    languagesFor.set(name, urls);
  }
  const createPool = options.createPool ?? defaultCreatePool;
  const workerPools: Record<string, WorkerManager> = {};
  for (const [name, t] of types) {
    const langs = languagesFor.get(name);
    const config: EnvelopePoolConfig = { worker: t.worker, config: t.config, ...(langs !== undefined ? { languages: langs } : {}) };
    workerPools[name] = createPool(ENVELOPE_WORKER_URL, {
      ...(t.pool ?? {}),
      ...(t.groups !== undefined ? { groups: [...t.groups] } : {}),
      config,
    });
  }
  return { workerPools, resourceGroups: { ...groups } };
}
