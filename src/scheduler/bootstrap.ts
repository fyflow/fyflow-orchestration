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
 * rule 4, [W61](../../doc/work-items/w61-what-a-transform-is.md) — into EVERY typed pool since ADR 0096 (W162).
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
 * **Every pool carries every language it is given** — [ADR 0096](../../doc/decisions/0096-a-runtime-is-its-registry-and-start-refuses-from-runtime-check.md)
 * rule 2, [W162](../../doc/work-items/w162-a-runtimes-languages-are-its-registrys-and-runtime-check.md),
 * superseding ADR 0051 rule 4. The helper writes each adapter's WORKER-side module URL
 * (`LanguageAdapter.worker`) into EVERY pool it builds, under the language's name — a FUNCTION could
 * not cross to a thread and a URL can (P17 fact 7). It reads no flow: a runtime's pools are built once
 * and a flow published later may transform on any type, so which types transform is not knowable here.
 * Given no language, every pool config is the two-key one it had at v0.17 (P18 fact 5).
 */
import { WorkerManager } from 'fyflow-scheduler';
import type { ResourceGroup, WorkerManagerOptions } from 'fyflow-scheduler';
import type { Languages, NodeTypeEntry, NodeTypes, Pools, ResolvedPool, Workers } from '../definition/types.ts';
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
   * `worker`, and written into EVERY pool (ADR 0096 rule 2). Omitted or empty, no pool config carries
   * a `languages` key. *(A `flows` option sat beside this until W162 and is removed — ADR 0096 rule 3.)*
   */
  languages?: Languages;
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
  // **The languages: every adapter given, into EVERY pool** — ADR 0096 rule 2 (W162), superseding
  // ADR 0051 rule 4's per-type reading of the flows. Each adapter must name a worker URL, checked
  // before any pool is built, as the groups are. Sorted by name, so the key order of every pool's
  // `languages` is the same whatever order the registry gave them in. None given: NO key at all, so a
  // registry with no language builds exactly the pool options it built at v0.17 (P18 fact 5).
  const adapters = languagesOf(options.languages);
  let languages: Record<string, string> | undefined;
  for (const lang of [...adapters.keys()].sort()) {
    const adapter = adapters.get(lang)!;
    if (typeof adapter?.worker !== 'string' || adapter.worker.length === 0) {
      throw new BootstrapError(`language "${lang}" names no worker module URL — LanguageAdapter.worker is the URL of the module whose default export compiles and evaluates it; a function cannot cross to a thread`);
    }
    (languages ??= {})[lang] = adapter.worker;
  }
  const createPool = options.createPool ?? defaultCreatePool;
  const workerPools: Record<string, WorkerManager> = {};
  for (const [key, p] of Object.entries(derived)) {
    // **`p.worker` is absent exactly when the type only transforms** (ADR 0075): the pool still loads
    // the envelope — every typed pool does — and its config carries no inner worker url, so
    // `EnvelopeWorker.setup()` loads nothing and `run()` returns the transform's own result.
    // Each pool gets its OWN copy of the languages record, so no two pool configs share an object.
    workerPools[key] = createPool(ENVELOPE_WORKER_URL, poolOptionsOf(p.spec, p.definition.inline, p.worker?.url, languages === undefined ? undefined : { ...languages }));
  }
  return { workerPools, resourceGroups: { ...groups }, derived };
}
