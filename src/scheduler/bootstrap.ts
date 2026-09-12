/**
 * **The bootstrap helper — a registry of node types becomes the scheduler's `workerPools` and
 * `resourceGroups`** — `spec/flow-definition.md` section 2 (v0.17),
 * [ADR 0049](../../doc/decisions/0049-a-node-type-is-a-registry-entry-and-its-worker-receives-an-envelope.md)
 * rule 5, [P16](../../doc/plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md)
 * decision 5, [W59](../../doc/work-items/w59-what-a-node-type-is.md).
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
 */
import { WorkerManager } from 'fyflow-scheduler';
import type { ResourceGroup, WorkerManagerOptions } from 'fyflow-scheduler';
import type { NodeTypes } from '../definition/types.ts';
import { nodeTypesOf } from '../definition/validate.ts';
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
}

export interface BootstrapResult {
  /** One per type, keyed by the type's name — spread into `new FyflowScheduler(...)`'s first argument. */
  workerPools: Record<string, WorkerManager>;
  /** The group objects passed in, keyed as they were — spread into the second argument. */
  resourceGroups: Record<string, ResourceGroup>;
}

const defaultCreatePool: PoolFactory = (scriptUrl, options) => new WorkerManager(scriptUrl, options);

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
  const createPool = options.createPool ?? defaultCreatePool;
  const workerPools: Record<string, WorkerManager> = {};
  for (const [name, t] of types) {
    const config: EnvelopePoolConfig = { worker: t.worker, config: t.config };
    workerPools[name] = createPool(ENVELOPE_WORKER_URL, {
      ...(t.pool ?? {}),
      ...(t.groups !== undefined ? { groups: [...t.groups] } : {}),
      config,
    });
  }
  return { workerPools, resourceGroups: { ...groups } };
}
