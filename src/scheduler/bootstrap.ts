/**
 * **The bootstrap helper — a registry's node types become the scheduler's `workerPools` and
 * `resourceGroups`, through the DERIVATION** — `spec/flow-definition.md` section 3's registry-document
 * subsection (v0.19),
 * [ADR 0049](../../doc/decisions/0049-a-node-type-is-a-registry-entry-and-its-worker-receives-an-envelope.md)
 * rule 5, [ADR 0054](../../doc/decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md),
 * [P16](../../doc/plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md)
 * decision 5, [W59](../../doc/work-items/w59-what-a-node-type-is.md), [W65](../../doc/work-items/w65-the-registry-document-and-a-node-type-is-a-derivation.md);
 * **and since v0.18 the place a language adapter's WORKER half reaches a typed pool** —
 * [ADR 0051](../../doc/decisions/0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md)
 * rule 4, [W61](../../doc/work-items/w61-what-a-transform-is.md).
 *
 * **This sub-path is the one place the published package CONSTRUCTS a scheduler object** (`RT-R13`;
 * `createRuntime` in `./runtime.ts` is the other module in it, and it constructs the groups and the
 * scheduler), and it is a
 * sub-path (`fyflow-orchestration/scheduler`) so the pure entry — the validator, the driver, the
 * fold — still loads no `WorkerManager`. Legal since
 * [ADR 0048](../../doc/decisions/0048-the-scheduler-is-a-declared-dependency-reached-by-one-bare-specifier.md);
 * `src/driver/**` still constructs nothing and RECEIVES its scheduler.
 *
 * **Since W65 the helper takes the REGISTRY's three sections — `workers`, `nodeTypes`, `pools` —
 * and builds one pool per INSTANCE**: the default instance of every type, keyed by the type's name,
 * and every named instance in `pools`, keyed as declared. Each is the type's derivation run over the
 * instance's config (`derivePool`, the same checks `resolveRegistry` makes), turned into
 * `WorkerManagerOptions` by `poolOptionsOf` — the type's `inline`, the derived pool fields and
 * groups, and the envelope pool config `{ worker: <the worker entry's url>, config: <the derived
 * config> }` — and handed to the pool factory with the package's envelope worker as its script.
 * The identity derivation reproduces what this helper built at v0.17 option for option (P18 fact 5,
 * prediction 2). W66 folds this into `createRuntime`, which resolves a worker's URL against a base
 * and constructs the groups too; here a worker's `url` is passed as declared.
 *
 * **The groups are compared BOTH WAYS, because the scheduler will not** (P16 fact 2, and W59's
 * pool-level re-measurement): a pool naming a group with no object here would run with that group
 * silently ignored, and a group object no pool names is the silent kind too — registered and used by
 * nothing. Since W65 a POOL's groups are what its derivation returned (`groups` and `residentGroups`),
 * which for a document type is what the type declared.
 *
 * **The languages are written into a pool's config ONLY for a type some node of which declares a
 * transform, and only the languages those nodes name** (W61, P17 decision 3): the helper reads the
 * `flows` it is given, collects each type's transforming languages, and writes their WORKER-side
 * module URLs (`LanguageAdapter.worker`) into every instance of that type — a FUNCTION could not cross
 * to a thread and a URL can (P17 fact 7). A type whose nodes never transform gets the two-key pool
 * config it had at v0.17, so no pool loads an engine it does not use. Direction one is a refusal;
 * direction two is NOT — an adapter given that no node names is inert (ADR 0051 rule 4's asymmetry).
 */
import { WorkerManager } from 'fyflow-scheduler';
import type { ResourceGroup, WorkerManagerOptions } from 'fyflow-scheduler';
import type { FlowDefinition, Languages, NodeTypeEntry, NodeTypes, Pools, ResolvedPool, TaskNode, Workers } from '../definition/types.ts';
import { BUILT_IN_NODE_TYPES, languagesOf, nodeTypesOf, poolsOf, workersOf } from '../definition/validate.ts';
import { checkRegistry, ConfigRefused, derivePool, groupsNamedBy, isDerivation, nodeTypeFromDeclaration, poolOptionsOf, TypeDefaultRefused } from '../definition/registry.ts';

/**
 * The script every typed pool loads. Resolved against THIS module, so it is the published
 * package's own file wherever the package is installed; the type's real worker is loaded from
 * inside it (`EnvelopeWorker.setup`).
 */
export const ENVELOPE_WORKER_URL: string = new URL('./envelope-worker.ts', import.meta.url).href;

/** A registry that cannot be bootstrapped, and why — thrown before any pool is built. A registry SHAPE defect is a `RegistryError` instead, from `checkRegistry`. */
export class BootstrapError extends Error {}

/**
 * **The seam, and it is `createTask`'s shape one layer out**: omitted, a real `WorkerManager` is
 * built (rule 5's default); ladder L1 passes a recorder and reads the script URL and options back.
 */
export type PoolFactory = (scriptUrl: string, options: WorkerManagerOptions) => WorkerManager;

/** The three registry sections the helper builds from — a registry document's, or the same maps a driver is handed. */
export interface BootstrapRegistry {
  workers?: Workers;
  nodeTypes?: NodeTypes;
  pools?: Pools;
}

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
  /** One per pool INSTANCE — every type's default instance under the type's name, every named instance under its key — spread into `new FyflowScheduler(...)`'s first argument. */
  workerPools: Record<string, WorkerManager>;
  /** The group objects passed in, keyed as they were — spread into the second argument. */
  resourceGroups: Record<string, ResourceGroup>;
  /** What each pool was DERIVED as — the checked spec every pool above was built from, for a caller that reads pools back (ladder L6's observers). */
  derived: Record<string, ResolvedPool>;
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
  registry: BootstrapRegistry,
  groups: Readonly<Record<string, ResourceGroup>> = {},
  options: BootstrapOptions = {},
): BootstrapResult {
  // The registry's SHAPE first, by name (a `RegistryError`), so what follows reads a well-formed one.
  checkRegistry(registry);
  const workers = workersOf(registry.workers);
  const types = nodeTypesOf(registry.nodeTypes);
  const named = poolsOf(registry.pools);
  const groupKeys = new Set(Object.keys(groups));

  // **Every instance DERIVED and checked before any pool is built**, the default instances first —
  // `derivePool` is `resolveRegistry`'s own road: the type's `configSchema` over the instance config,
  // the derivation run, its output held to `PoolSpec`, the derived config held to the worker's
  // `configSchema`, every group it names present in `groups` (direction one), and decision 9's
  // refusal of a resident group beside `idleTimeout: 0`.
  const derived: Record<string, ResolvedPool> = {};
  // **The consumer's types, then its named instances, then the library's OWN types** — v0.28, W109.
  // The order is deliberate and the reason is not cosmetic: this is the order pools are CREATED in, so
  // appending the built-ins last means **adding a built-in node type never renumbers a consumer's
  // pools**. Anything reading a pool by position — the scheduler's own `stats`, a dashboard, a test —
  // sees the consumer's first and in its declared order, whatever the library ships.
  const one = (name: string, typeName: string, entry: NodeTypeEntry, config: unknown, refuse: typeof TypeDefaultRefused): void => {
    const def = isDerivation(entry) ? entry : nodeTypeFromDeclaration(entry);
    derived[name] = derivePool(name, typeName, def, def.worker === undefined ? undefined : workers.get(def.worker), config, groupKeys, refuse);
  };
  const builtIn = (n: string): boolean => Object.prototype.hasOwnProperty.call(BUILT_IN_NODE_TYPES, n);
  for (const [name, entry] of types) if (!builtIn(name)) one(name, name, entry, (isDerivation(entry) ? entry : nodeTypeFromDeclaration(entry)).config, TypeDefaultRefused);
  for (const [key, inst] of named) {
    // **The definition comes from `types` and NOT from `derived`, and that is a repair.** This read
    // `derived[inst.type]!.definition`, which was sound while one loop built every type's default
    // before this one ran; appending the built-ins last (see above) made `derived` incomplete HERE, so
    // a named instance of a BUILT-IN dereferenced `undefined` and threw an unnamed `TypeError` — on the
    // one road ADR 0075 rule 3 blesses by name (*a consumer who wants any of those declares a named
    // pool INSTANCE of it*), where every other registry defect in this file is a named error.
    // W109's conformity reader, 3. The assertion is sound: `checkRegistry` ran at the top of this
    // function and refuses a named pool whose `type` is not a node type (`PoolTypeMissing`), over the
    // same merged map `types` is.
    const entry = types.get(inst.type)!;
    const def = isDerivation(entry) ? entry : nodeTypeFromDeclaration(entry);
    derived[key] = derivePool(key, inst.type, def, def.worker === undefined ? undefined : workers.get(def.worker), (inst as { config?: unknown }).config, groupKeys, ConfigRefused);
  }
  for (const [name, entry] of types) if (builtIn(name)) one(name, name, entry, (isDerivation(entry) ? entry : nodeTypeFromDeclaration(entry)).config, TypeDefaultRefused);
  // Direction two: every group object given is named by some pool.
  const namedByPools = new Set<string>();
  for (const p of Object.values(derived)) for (const g of groupsNamedBy(p.spec)) namedByPools.add(g);
  for (const g of groupKeys) {
    if (!namedByPools.has(g)) {
      throw new BootstrapError(`group "${g}" was given and no pool's derivation names it — a group registered and used by nothing is the silent kind; ` +
        'a group a NODE names in workerGroups is registered beside this helper`s return value, not through it');
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
  for (const [key, p] of Object.entries(derived)) {
    // **`p.worker` is absent exactly when the type only transforms** (ADR 0075): the pool still loads
    // the envelope — every typed pool does — and its config carries no inner worker url, so
    // `EnvelopeWorker.setup()` loads nothing and `run()` returns the transform's own result.
    workerPools[key] = createPool(ENVELOPE_WORKER_URL, poolOptionsOf(p.spec, p.definition.inline, p.worker?.url, languagesFor.get(p.type)));
  }
  return { workerPools, resourceGroups: { ...groups }, derived };
}
