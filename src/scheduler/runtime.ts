/**
 * **The runtime entry — a registry DOCUMENT and the consumer's code become a running scheduler, and
 * a flow document becomes a `Driver`** — `spec/flow-definition.md` section 3's registry subsection
 * (v0.19), [ADR 0054](../../doc/decisions/0054-every-task-node-names-a-type-and-a-type-is-a-derivation-to-pool-options.md),
 * [P18](../../doc/plans/p18-a-flow-and-its-runtime-from-documents-alone.md) decisions 4, 7-11, 13
 * and 14, [W66](../../doc/work-items/w66-the-runtime-entry.md).
 *
 * **It lives in `fyflow-orchestration/scheduler`, beside `bootstrap`, and there is no `/runtime`
 * sub-path** — [P16](../../doc/plans/p16-what-a-node-type-is-and-what-the-library-owes-the-scheduler.md)
 * decision 5's *one sub-path that constructs scheduler objects*, taken as written at W66's
 * declaration step. The pure entry still loads no `WorkerManager` and no group constructor, which is
 * `RT-R13`.
 *
 * **What it does, in one sentence: `resolveRegistry` says what the document MEANS, and this module
 * builds it.** The resolver checks every name, every schema and every derivation and constructs
 * nothing (W65); here the three built-in group types get their factories, every group is created and
 * held to what the scheduler actually calls, every worker URL is resolved against the consumer's
 * `base`, `bootstrap` turns every derived instance into a pool, and the driver's registry is derived
 * once and exposed as `runtime.registry` (decision 14).
 *
 * **What a group factory's output is held to, and why it is the UNION of two lists.** P18 decision 4
 * refuses an object *lacking `canRun` or `getMetrics`* — the interface's two required members — and
 * W66's declaration step measured that the interface's required set is not the set the scheduler
 * CALLS. One omission at a time, each group holding a real task on a real scheduler at 0.5.2,
 * identical under Node 24.20.0 and Deno 2.9.6:
 *
 * | omitted | the `.d.ts` says | what the task does |
 * |---|---|---|
 * | `onStart` | optional | THROWS `group.onStart is not a function` |
 * | `onFinish` | optional | **never finishes** — `running` for ever, the scheduler reporting idle |
 * | `getMetrics` | required | runs to `done` |
 * | `canRun` | required | THROWS |
 * | `type` | required | runs to `done` |
 *
 * So the plan's list refuses a group that works and accepts one that hangs every task naming it, in
 * silence — [W33](../../doc/work-items/w33-a-map-at-run-time-arity.md)'s *N too small completes and
 * is silent* one interface over. The maintainer's answer at the declaration step is the union:
 * `canRun`, `onStart` and `onFinish` because the scheduler calls them, `getMetrics`, `id` and `type`
 * because the interface requires them and a consumer's viewer reads them. **`EventTarget` is NOT
 * required**: a plain object with the six members holds a real task and the task completes, measured.
 *
 * **Why a group the document declares that NO POOL names is still built — W67.** `bootstrap` refuses
 * a group OBJECT no pool's derivation names, because a consumer calling the helper passes the objects
 * in and one nothing names is registered and used by nothing. A DOCUMENT's `groups` is not that: it
 * is the SET a node's `workerGroups` may name, which is what `FD-V31` validates against and what
 * `runtime.registry.groups` carries to the driver, so a group named by a NODE and by no pool is the
 * ordinary case. Measured at W67's declaration step: a document declaring one was refused with a
 * message telling the caller to register it *beside this helper's return value*, which a consumer
 * holding only a runtime cannot do. So this module splits the two sets — the pool-named ones go to
 * `bootstrap`, every declared one goes to the scheduler — and direction ONE (a pool naming a group
 * the document lacks) is untouched, refused by the resolver before anything is built.
 *
 * **Why `flows` is an argument here.** A language adapter's worker half reaches a typed pool through
 * that pool's config, and W61 measured that it is written ONLY where a node of that type declares a
 * transform — so the same type carries the engine on one flow and not on another. Pools are built
 * once, at `createRuntime`, so the flows a runtime will run are named there; `start` REFUSES a flow
 * whose transforming type was not accounted for, naming the type, the language and the fix, rather
 * than letting the wrapper meet a transform with nothing to evaluate it.
 */
import { ConcurrentLimitGroup, FyflowScheduler, KeyedRateLimitGroup, RateLimitGroup } from 'fyflow-scheduler';
import type { ResourceGroup, WorkerManager } from 'fyflow-scheduler';
import { groupsNamedBy, resolveRegistry } from '../definition/registry.ts';
import { Driver } from '../driver/driver.ts';
import type { DriverOptions } from '../driver/driver.ts';
import { liveToken } from '../fold/policies.ts';
import type {
  FlowDefinition, GroupType, JsonSchema, Languages, NodeTypeDefinition,
  RegistryCode, RegistryDocument, ResolvedPool, ResolvedRegistry, RetryPolicy, TaskNode, WorkerEntry,
} from '../definition/types.ts';
import type { Predicate } from '../driver/routing.ts';
import { bootstrap, transformLanguagesByType } from './bootstrap.ts';
import type { PoolFactory } from './bootstrap.ts';

/**
 * **A runtime that cannot be built, and why** — thrown at `createRuntime` or at `start`, before
 * anything is queued. A registry SHAPE or NAME defect is a `RegistryError` from `resolveRegistry`
 * and a flow defect is an `InvalidDefinition` from `new Driver`; this class is the RUNTIME's own,
 * on ADR 0049 rule 5's precedent that a helper's refusal is not an `FD-V`.
 */
export class RuntimeError extends Error {
  /** The entry this refusal is about — a worker's key, a group's key, a type's name. `RegistryError`'s field, one layer out. */
  readonly at: string;
  // Written long-hand, not as a constructor parameter property: `RT-R9` — Node runs TypeScript by
  // ERASING types, so a parameter property fails at load and no typechecker objects (`S4`).
  constructor(at: string, message: string) {
    super(message);
    this.name = new.target.name;
    this.at = at;
  }
}
/** A group type's factory returned something the scheduler cannot use — the member is named, against the group's key. */
export class GroupUnusable extends RuntimeError {}
/** A group type named by the document has no factory: a built-in this module does not implement, or a `code.groupTypes` entry `resolveRegistry` admitted and this cannot call. */
export class GroupNotBuildable extends RuntimeError {}
/** `start` was given a flow whose transforming type runs on pools this runtime built without that language — the pool would meet the transform with nothing to evaluate it. */
export class LanguageNotBuilt extends RuntimeError {}

/**
 * **The three built-in group types' FACTORIES, and they are three different constructors** (P18
 * fact 2, re-run at W66): `(limit, id)`, `(windows, id)` and `(windows, { id })`, the third keyed.
 * `BUILT_IN_GROUP_TYPES` in `src/definition/registry.ts` carries their schemas and no factory,
 * deliberately — the pure entry constructs nothing (`RT-R13`) — so the two halves meet here and are
 * compared both ways by a test.
 *
 * **The KEY is the group's identity and the object's own name is inert** (ADR 0049 fact 2), so each
 * factory is given the document's key as the id: a consumer reading `scheduler.groups` sees what the
 * document declared.
 */
export const BUILT_IN_GROUP_FACTORIES: Readonly<Record<string, (config: unknown, key: string) => ResourceGroup>> = {
  ConcurrentLimitGroup: (config, key) => new ConcurrentLimitGroup((config as { limit: number }).limit, key),
  RateLimitGroup: (config, key) => new RateLimitGroup((config as { windows: { limit: number; windowMs: number }[] }).windows, key),
  KeyedRateLimitGroup: (config, key) => new KeyedRateLimitGroup((config as { windows: { limit: number; windowMs: number }[] }).windows, { id: key }),
};

/**
 * **What a created group must carry.** The first three are what the scheduler CALLS on the acquire
 * path, the last three what the interface requires and a viewer reads — the union, by the
 * maintainer's decision at W66's declaration step. `EventTarget` is deliberately not required.
 */
export const GROUP_MEMBERS: readonly { readonly name: string; readonly kind: 'function' | 'string'; readonly why: string }[] = [
  { name: 'canRun', kind: 'function', why: 'the scheduler calls it before every admission; a group without it throws on the first task' },
  { name: 'onStart', kind: 'function', why: 'the scheduler calls it unguarded at admission, though the interface marks it optional; a group without it throws on the first task (measured on 0.5.2)' },
  { name: 'onFinish', kind: 'function', why: 'the scheduler calls it unguarded at settlement, though the interface marks it optional; a group without it leaves every task naming it RUNNING for ever, in silence (measured on 0.5.2)' },
  { name: 'getMetrics', kind: 'function', why: 'the interface requires it and a consumer`s viewer reads it' },
  { name: 'id', kind: 'string', why: 'the interface requires it' },
  { name: 'type', kind: 'string', why: 'the interface requires it — open, so a group defined outside this library can name itself' },
];

export interface RuntimeOptions {
  /**
   * **What a RELATIVE worker URL resolves against** (decision 7). A document says
   * `"./workers/prompt.ts"`, and `new URL(that)` on its own THROWS (measured, fact 8) — so a
   * document carrying any relative URL needs this, and the refusal says so by name. Pass
   * `import.meta.url`. Inside a bundle `import.meta.url` is the bundle
   * ([Q261](../../doc/open-questions.md)), which is why the runtime cannot guess it.
   */
  base?: string;
  /**
   * **The flows this runtime will run**, read for WHICH types transform in WHICH languages (W61).
   * A flow given to `start` that names a transform on a type no pool was built for is refused.
   */
  flows?: readonly FlowDefinition[];
  /** The pool seam, as `bootstrap`'s — omitted, a real `WorkerManager`. */
  createPool?: PoolFactory;
  /** The scheduler seam. Omitted, a real `FyflowScheduler` over the pools and groups this runtime built. */
  createScheduler?: (pools: Record<string, WorkerManager>, groups: Record<string, ResourceGroup>) => FyflowScheduler;
  /** Applied to every node of every flow this runtime starts that declares no `retryPolicy` and whose type declares none — the driver's option, held to `FD-V30` there. */
  defaultRetryPolicy?: RetryPolicy;
  /** `FD-R4`'s switch, forwarded to every driver this runtime starts (W73): the payload at `start` and a person's resolution at `resolve`, each held to the worker's schema once. Default ON; `false` turns both off runtime-wide, since the schemas are the document's. */
  validateBoundaries?: boolean;
}

/**
 * **What `start` may say about ONE run. Everything else about a run is the document's.**
 *
 * **Every member here reaches the driver by exactly one of TWO roads, and a test reads this file
 * and compares the two lists BOTH WAYS** — [W76](../../doc/work-items/w76-what-start-accepts.md),
 * [P20](../../doc/plans/p20-what-the-runtime-owes-a-consumer.md) decision 5. A member is either
 * **conditionally spread** into the `new Driver` literal, so that omitting it leaves the driver's
 * own default in place, or **defaulted with `??`** where this module has a default of its own to
 * supply (`runId` mints, `joinPolicy` is `liveToken`). The binding is what makes the `Pick` above a
 * claim rather than a decoration: **P20 fact 2 measured that widening it and forgetting the
 * forwarding line is green on all five typecheckers, `npm test`, `check:source` AND `check:docs`**,
 * so before W76 a typed option a consumer passed could be silently dropped and nothing noticed.
 * That is `doc/workflow.md` rule 8 obligation (e)'s third shape — *a LIST is a claim about another
 * list*. The `??` road is DERIVED from this file rather than exempted by name, which is what lets
 * `runId` be on it: P20 decision 5 knew of `joinPolicy` alone and W76's declaration step measured
 * two. *(The test also PINS that road's membership to `['joinPolicy', 'runId']`, so moving a member
 * between the two roads fails and has to be done deliberately — a ratchet of
 * [Q102](../../doc/open-questions.md)'s shape. Both of W76's readers found the first version of
 * this sentence overclaiming, because it said the test named nobody.)*
 *
 * **`onRegionEvent` is here because it was the one `DriverOptions` member no consumer of
 * `createRuntime` could reach** ([Q297](../../doc/open-questions.md), [W71](../../doc/work-items/w71-the-reference-stops-teaching-a-fake-scheduler.md)).
 * Of eighteen members a consumer reaches **two** because the runtime supplies them (`runId`,
 * `scheduler`), **six** through `RuntimeRegistry`, **two** through `RuntimeOptions` — and only two,
 * because `base`, `flows`, `createPool` and `createScheduler` are the runtime's own and are not
 * `DriverOptions` members at all — and **seven** through this `Pick` as it stood. 2 + 6 + 2 + 7 is
 * seventeen; the eighteenth was `onRegionEvent`. *P20 fact 1 states the third road as SIX, which
 * makes its table 21 slots over 18 members and therefore not a partition at all; what survives is
 * its conclusion — one residue, and a unique one — which is why this was a defect rather than a
 * judgement about which callbacks are worth carrying.* The event the callback receives is **already
 * frozen by the driver** (`OR-R7`, [Q73](../../doc/open-questions.md), W12), so nothing is copied or
 * re-frozen at this seam; measured across it rather than assumed, at W76's declaration step and in
 * `AGENTS.md` section 10. *(What `onFoldInput` receives IS re-copied — `freezeInput` gives it its
 * own frozen object — so the two outbound paths carry equal values and not the same one, which
 * `test/scheduler/runtime.test.ts` asserts and which its first version got wrong.)*
 */
export interface StartOptions extends Pick<DriverOptions,
  'createTask' | 'joinPolicy' | 'onFoldInput' | 'onRegionEvent' | 'onRunFailure' | 'onUnsatisfiableJoin' | 'onUnmintedTask' | 'now'> {
  /** Omitted, the runtime mints `r<n>` from its own counter — inside `ID-R2`'s charset, unique per RUNTIME and not globally (decision 10). */
  runId?: string;
}

/**
 * **What a driver is handed, and therefore what `runtime.registry` IS** — decision 14. Note
 * `predicates`: the driver wants the FUNCTIONS, keyed by name, where the validator's `Registry`
 * wants the names alone. *(This was typed as the validator's `Registry` and built with the names,
 * so `new Driver(flow, { ...runtime.registry, … })` — the thing decision 14 exists to make possible
 * — refused a VALID flow under `FD-V4`, the driver reading an array's indices as its predicate
 * names. W66's conformity reader, finding 4, with a probe.)* To validate a document against this
 * registry rather than run it, pass `[...registry.predicates.keys()]` as the validator's names.
 */
export type RuntimeRegistry = Pick<DriverOptions, 'predicates' | 'workers' | 'nodeTypes' | 'pools' | 'groups' | 'languages'>;

export interface Runtime {
  /** **Exactly the object this runtime hands its own drivers** (decision 14) — spread it into `new Driver(…)` beside a `runId`, a `scheduler` and a `joinPolicy` and you have built what `start` builds. */
  readonly registry: RuntimeRegistry;
  /** What the document MEANT, before anything was built — every name resolved, every schema checked, every instance derived. */
  readonly resolved: ResolvedRegistry;
  /** The scheduler holding this runtime's pools and groups. Shared across its runs (decision 10). */
  readonly scheduler: FyflowScheduler;
  /** One per pool instance — every type's default under the type's name, plus the named ones — as DERIVED, for a caller that reads pools back. */
  readonly pools: Readonly<Record<string, ResolvedPool>>;
  /** The group objects this runtime CREATED, keyed as the document declared them. */
  readonly groups: Readonly<Record<string, ResourceGroup>>;
  /** Start one run of `flow` with `payload`, and return its `Driver` — already started. */
  start(flow: FlowDefinition, payload: unknown, options?: StartOptions): Driver;
  /** The scheduler's, forwarded — a runtime owns its pools, so it owns their shutdown. */
  shutdown(): Promise<void>;
}

const q = (s: string): string => JSON.stringify(s);

/** A worker entry's URL, resolved against `base` where it is relative — with the refusal naming the entry when there is no base to resolve it against. */
function resolveWorkerUrl(name: string, entry: WorkerEntry, base: string | undefined): WorkerEntry {
  let absolute: string;
  try {
    absolute = base === undefined ? new URL(entry.url).href : new URL(entry.url, base).href;
  } catch {
    throw new RuntimeError(name, `worker ${q(name)} has a relative url ${q(entry.url)} and no base to resolve it against — ` +
      'pass `base: import.meta.url` to createRuntime (a document is portable, so its urls may be relative to wherever it is read from)');
  }
  return absolute === entry.url ? entry : { ...entry, url: absolute };
}

/** Every member `GROUP_MEMBERS` names, on the object a factory returned — the whole list, so one refusal names every missing member rather than the first. */
function checkGroup(key: string, typeName: string, group: unknown): ResourceGroup {
  if (group === null || (typeof group !== 'object' && typeof group !== 'function')) {
    throw new GroupUnusable(key, `group ${q(key)}: ${q(typeName)}'s create() returned ${JSON.stringify(group) ?? String(group)}, which is not an object`);
  }
  const g = group as unknown as Record<string, unknown>;
  // Written as two literal comparisons rather than one against `m.kind`: `deno lint`'s `valid-typeof`
  // refuses a `typeof` compared to a variable, and it is right to — a typo in the list would be inert.
  const missing = GROUP_MEMBERS.filter((m) => (m.kind === 'function' ? typeof g[m.name] !== 'function' : typeof g[m.name] !== 'string'));
  if (missing.length) {
    throw new GroupUnusable(key, `group ${q(key)}: ${q(typeName)}'s create() returned an object the scheduler cannot use — ` +
      missing.map((m) => `no ${m.kind === 'function' ? `${m.name}()` : m.name} (${m.why})`).join('; '));
  }
  return group as ResourceGroup;
}

/**
 * **Build a runtime from a registry DOCUMENT and the code it names.** Every refusal is at
 * construction and named: the document's own are `RegistryError`s from `resolveRegistry` (a worker
 * missing, a config against a schema, a keyword outside the subset, a name colliding), and this
 * module's are `RuntimeError`s — a relative URL with no base, a group type with no factory, a
 * factory returning something the scheduler cannot use.
 */
export function createRuntime(
  document: RegistryDocument,
  code: RegistryCode = {},
  options: RuntimeOptions = {},
): Runtime {
  // (1) What the document MEANS. Builds nothing; refuses every name, schema and derivation defect.
  const resolved = resolveRegistry(document, code);

  // The names the code SUPPLIES, in whichever shape the `code` argument carries them.
  const suppliedPredicateNames = code.predicates === undefined ? []
    : code.predicates instanceof Map ? [...code.predicates.keys()]
    : code.predicates instanceof Set ? [...code.predicates]
    : Array.isArray(code.predicates) ? [...code.predicates as readonly string[]]
    : Object.keys(code.predicates as Readonly<Record<string, unknown>>);
  // **BOTH WAYS** — decision 13 and this item's Outputs (1), the direction `resolveRegistry` does
  // not take: a predicate or an adapter SUPPLIED and named by no document is a registry a consumer
  // believes in and the runtime does not, and the flow that uses it dies at `FD-V4` or `FD-V35` one
  // run in. *(W66's conformity reader, finding 5: the claim was in the plan and in this item's
  // Outputs and the check ran one way.)* **This is a different pair from [ADR 0051](../../doc/decisions/0051-a-transform-is-a-declared-expression-in-a-registered-language-applied-in-the-types-worker-wrapper.md)
  // rule 4's**, which is about an adapter the FLOWS do not name and is deliberately inert: an
  // adapter the DOCUMENT does not name cannot be reached by any flow this registry admits.
  for (const [what, named, given] of [
    ['predicate', resolved.predicates, suppliedPredicateNames],
    ['language', new Set(resolved.languages.keys()), Object.keys((code.languages ?? {}) as Readonly<Record<string, unknown>>)],
  ] as const) {
    const extra = given.filter((name) => !(named as ReadonlySet<string>).has(name));
    if (extra.length) {
      throw new RuntimeError(extra[0]!, `code supplies ${what}${extra.length > 1 ? 's' : ''} ${extra.map(q).join(', ')}, which the registry document names nowhere — ` +
        `the document's \`${what}s\` is what a flow may use, so this one is unreachable and a flow naming it would be refused at \`new Driver\``);
    }
  }

  // (2) The worker URLs, resolved against the consumer's base before any pool is built, so a pool's
  //     config carries what a worker thread can actually load (fact 8).
  const workers: Record<string, WorkerEntry> = {};
  for (const [name, entry] of resolved.workers) workers[name] = resolveWorkerUrl(name, entry, options.base);

  // (3) The groups: one object per declared key, through its type's factory, held to what the
  //     scheduler calls. The built-ins' factories are this module's; a custom type's is the
  //     consumer's, and `resolveRegistry` has already checked that it IS a function.
  const groups: Record<string, ResourceGroup> = {};
  for (const [key, g] of resolved.groups) {
    const factory = BUILT_IN_GROUP_FACTORIES[g.type] ?? (g.groupType as GroupType).create;
    if (typeof factory !== 'function') {
      throw new GroupNotBuildable(key, `group ${q(key)} names group type ${q(g.type)}, which has no create() — ` +
        `a built-in is built by this module (${Object.keys(BUILT_IN_GROUP_FACTORIES).sort().map(q).join(', ')}) and a custom one by its own \`create\``);
    }
    let made: unknown;
    try {
      made = factory(g.config, key);
    } catch (e) {
      throw new GroupUnusable(key, `group ${q(key)}: ${q(g.type)}'s create() THREW: ${e instanceof Error ? e.message : String(e)}`);
    }
    groups[key] = checkGroup(key, g.type, made);
  }

  // (4) The pools, through the derivation `resolveRegistry` already ran and checked — `bootstrap`
  //     builds one per instance and writes each type's transforming languages into its config.
  const nodeTypes: Record<string, NodeTypeDefinition> = {};
  for (const [name, def] of resolved.nodeTypes) nodeTypes[name] = def;
  const pools: Record<string, { type: string; config?: unknown }> = {};
  for (const [key, p] of resolved.pools) if (key !== p.type) pools[key] = { type: p.type, config: p.config };
  const languages: Record<string, unknown> = {};
  for (const [name, adapter] of resolved.languages) languages[name] = adapter;

  // **Only the groups some POOL's derivation names go to `bootstrap`; every group the DOCUMENT
  // declares goes to the scheduler** — W67's declaration step, stop-and-ask 1.
  //
  // `bootstrap` refuses a group object no pool names, and it is right to: a consumer calling the
  // helper passes group OBJECTS in, so one nothing names is registered and used by nothing — the
  // silent kind. **A DOCUMENT's `groups` is not that.** It is the SET a node's `workerGroups` may
  // name, which is what `FD-V31` validates against and what the driver is handed below as
  // `registry.groups`; a group named by a NODE and by no pool is the ordinary case, and W58's group
  // row is it. Measured at W67's declaration step: a document declaring one was REFUSED by
  // `BootstrapError` with a message telling the caller to register it *beside this helper's return
  // value* — which a consumer holding only a runtime has no way to do.
  //
  // So the split: `namedByPools` is what direction two of the helper's check is about, and the rest
  // are the node-named ones. Direction ONE is untouched — a pool naming a group the document does
  // not declare is still refused inside `derivePool`, because the set below is derived FROM the
  // document's groups rather than from the pools' demands.
  const namedByPools: Record<string, ResourceGroup> = {};
  for (const [, p] of resolved.pools) {
    for (const g of groupsNamedBy(p.spec)) if (groups[g] !== undefined) namedByPools[g] = groups[g];
  }

  const built = bootstrap({ workers, nodeTypes, pools }, namedByPools, {
    ...(options.createPool !== undefined ? { createPool: options.createPool } : {}),
    languages: languages as Languages,
    flows: options.flows ?? [],
  });

  // The scheduler holds every group the document declared, pool-named and node-named alike.
  const scheduler = (options.createScheduler ?? ((p, g) => new FyflowScheduler(p, g)))(built.workerPools, groups);

  // (5) The driver's registry, derived ONCE and handed to every driver this runtime starts
  //     (decision 14) — and exposed, so a consumer who builds a `Driver` by hand passes this.
  // `resolveRegistry` has already refused a predicate the document NAMES that the code does not
  // supply; what is left is to key the functions by name for the driver, from either shape the
  // `code` argument admits (a Map or a record — a Set or an array of names carries no function and
  // reaches here only where nothing routes).
  const predicates = new Map<string, Predicate>();
  const supplied = code.predicates;
  for (const name of resolved.predicates) {
    const fn = supplied instanceof Map
      ? (supplied as ReadonlyMap<string, Predicate>).get(name)
      : (supplied as Readonly<Record<string, Predicate>> | undefined)?.[name];
    if (typeof fn === 'function') predicates.set(name, fn);
  }
  const registry: RuntimeRegistry = {
    predicates,
    groups: Object.keys(groups),
    workers,
    nodeTypes,
    pools,
    languages: languages as Languages,
  };

  // **Which languages each type's pools were BUILT with** — what `start` holds an incoming flow to.
  // Read from `transformLanguagesByType` over the SAME flows `bootstrap` was given: one function,
  // two callers, one input. *(It read them back off `built.workerPools[name].config` at first, which
  // is a `WorkerManager` in production and whatever the pool seam returns at ladder L1 — so the
  // check was blind behind the seam and every transforming flow was refused. Caught on the suite's
  // first run.)*
  const builtLanguages = transformLanguagesByType(options.flows ?? []);

  let minted = 0;
  const runtime: Runtime = {
    registry,
    resolved,
    scheduler,
    pools: built.derived,
    groups,
    start(flow, payload, startOptions = {}) {
      // **A transform this runtime built no pool for is refused HERE, not met by the wrapper.** The
      // languages a pool carries were decided at construction from `options.flows` (W61), so a flow
      // arriving now with a transform on a type whose pool carries no such adapter would fail every
      // task of that node with `language "…" is not loaded in this pool`, one run in.
      for (const [type, langs] of transformLanguagesByType([flow])) {
        // An UNREGISTERED type is `FD-V32` at `new Driver` and not this refusal's business; a
        // registered one that transformed in no construction flow carries NOTHING, which is the case
        // this exists for. *(Read as one `undefined` at first, so the empty case skipped the check
        // and every unbuilt transform started — caught by this suite's own negative fixture.)*
        if (!resolved.nodeTypes.has(type)) continue;
        const carried = builtLanguages.get(type) ?? new Set<string>();
        for (const lang of langs) {
          if (!carried.has(lang)) {
            throw new LanguageNotBuilt(type, `flow ${q(flow.flowId)} declares transform.lang ${q(lang)} on a node of type ${q(type)}, ` +
              `and this runtime's pools for that type carry ${carried.size ? [...carried].sort().map(q).join(', ') : 'no language'} — ` +
              'pools are built once, so pass every flow this runtime will run as `flows` to createRuntime');
          }
        }
      }
      const runId = startOptions.runId ?? `r${++minted}`;
      // **The whole of `registry`, spread** — which is what makes decision 14's claim true: a
      // consumer who writes this line by hand passes the same object, `predicates` included.
      const driver = new Driver(flow, {
        runId,
        scheduler,
        ...registry,
        joinPolicy: startOptions.joinPolicy ?? liveToken,
        ...(options.defaultRetryPolicy !== undefined ? { defaultRetryPolicy: options.defaultRetryPolicy } : {}),
        ...(options.validateBoundaries !== undefined ? { validateBoundaries: options.validateBoundaries } : {}),
        ...(startOptions.createTask !== undefined ? { createTask: startOptions.createTask } : {}),
        ...(startOptions.onFoldInput !== undefined ? { onFoldInput: startOptions.onFoldInput } : {}),
        ...(startOptions.onRegionEvent !== undefined ? { onRegionEvent: startOptions.onRegionEvent } : {}),
        ...(startOptions.onRunFailure !== undefined ? { onRunFailure: startOptions.onRunFailure } : {}),
        ...(startOptions.onUnsatisfiableJoin !== undefined ? { onUnsatisfiableJoin: startOptions.onUnsatisfiableJoin } : {}),
        ...(startOptions.onUnmintedTask !== undefined ? { onUnmintedTask: startOptions.onUnmintedTask } : {}),
        ...(startOptions.now !== undefined ? { now: startOptions.now } : {}),
      });
      driver.start(payload);
      return driver;
    },
    shutdown() {
      return scheduler.shutdown();
    },
  };
  return runtime;
}

/** Re-exported so a consumer can read what a schema-bearing built-in admits without importing the pure entry. */
export type { JsonSchema, TaskNode };
